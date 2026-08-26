---
updated: 2026-08-26
program_commits:
    dynblk: 25f627f2cf86b79c35a185999af90e5e1aa08d17
    dynfilefs-app: 7b2a6b69edeedcc24e0847df44e9060796c0af4b
---

# Recuperación de DynFileFS y almacenamiento dynblk

DynFileFS y `dynblk` proporcionan una imagen de bloque `virtual.dat` asignada dinámicamente, cuyos datos se almacenan en un conjunto de archivos `changes.dat`. MiniOS formatea `virtual.dat` como ext4 y lo utiliza para cambios persistentes. `dynblk` es la implementación mantenida del mismo formato de almacenamiento; MiniOS conserva el nombre de modo de persistencia `dynfilefs` y el comando de compatibilidad `@mount.dynfilefs` donde sea necesario.

Esta guía cubre la inspección, migración, reparación del sistema de archivos, recuperación de sesiones y extracción de archivos. Se aplica después de un apagado incorrecto, un dispositivo de almacenamiento lleno, una copia interrumpida o un fallo en los metadatos de la sesión.

Los síntomas típicos son:

- MiniOS crea otra sesión numerada en cada inicio.
- `resume` no carga el escritorio ni los archivos previos.
- Seleccionar una sesión antigua desde el menú de arranque no tiene efecto.
- Los directorios de sesión aún contienen archivos `changes.dat` pero no se activan.

La causa puede ser un segmento de almacenamiento incompleto, metadatos dañados del contenedor, un sistema de archivos ext4 sucio dentro de `virtual.dat` o un `session.conf` incorrecto.

## Reglas de seguridad

1. No repare la única copia de un contenedor de almacenamiento.
2. No copie sesiones de origen sobre un almacén `minios/changes` que esté en uso o montado.
3. Copie el directorio completo `changes` antes de intentar la recuperación.
4. Ejecute `e2fsck -y` solo sobre una copia adicional de una sesión.
5. No cree manualmente un archivo `changes.dat.N` que falte.

No realice la copia inicial mientras la sesión de origen esté en ejecución o su
contenedor DynFileFS esté montado. Sus archivos de metadatos y segmentos pueden cambiar
de forma independiente y producir una copia inconsistente. Arranque sin persistencia o utilice
otro sistema Linux. Mantenga inactivos la vista DynFileFS/FUSE, el dispositivo de bucle `virtual.dat`
y el sistema de archivos ext4 interno. Monte solo el sistema de archivos de almacenamiento externo,
de preferencia en modo solo lectura, para que sus archivos de segmento de respaldo puedan copiarse de forma consistente.

## 1. Localizar el origen y el destino

Muestre los sistemas de archivos y puntos de montaje:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Defina las rutas para el directorio de `changes` de origen y un directorio de recuperación separado en un dispositivo con suficiente espacio libre:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Verifique que el destino tenga suficiente espacio libre:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Copiar todos los archivos de la sesión

Use `rsync` cuando esté disponible:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Alternativamente:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

No copie solo el archivo principal `changes.dat`. Una sesión DynFileFS normalmente contiene una secuencia completa:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Todos los segmentos forman parte de un solo contenedor.

## 3. Identificar una sesión de almacenamiento

Compare los tamaños y fechas de modificación de las sesiones:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Las sesiones vacías o fallidas suelen ser pequeñas. Una sesión que contiene datos persistentes reales normalmente ocupa mucho más espacio.

Verifique los metadatos guardados de la sesión:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS utiliza `session.conf` para seleccionar y describir las sesiones de persistencia.

## 4. Montar el contenedor DynFileFS o dynblk

Ubique el helper instalado. Dependiendo de la imagen de MiniOS, el nombre canónico
puede ser `dynblk` o el nombre de compatibilidad `@mount.dynfilefs`:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Seleccione una sesión candidata, por ejemplo la sesión 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

No especifique `-s` ni `perchsize` durante este montaje manual de recuperación. La ruta
normal de arranque puede pasar `-s` para un tamaño lógico solicitado o registrado, pero la recuperación
intencionalmente evita una solicitud de redimensionamiento y lee el tamaño existente desde los
metadatos de DynFileFS/dynblk.

Un montaje exitoso expone `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Verifique su sistema de archivos ext4 sin realizar cambios:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Luego móntelo en modo solo lectura:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Si los archivos esperados son visibles, la sesión puede recuperarse.

Desmonte en orden inverso:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Reparar el sistema de archivos interno

Si el contenedor monta pero `e2fsck -n` informa errores de ext4, primero haga otra copia de esa sesión:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Monte y repare solo esta copia:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Repita la verificación en solo lectura de la sección anterior después de repararla.

## 6. Recuperar en una nueva sesión compatible

Prefiera recuperar en una sesión recién creada en lugar de reconstruir los metadatos
de la dañada. Si existe una exportación válida de `.tar.zst`, inicie normalmente e impórtela
con conversión automática para el sistema de archivos de destino:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

La importación crea una nueva sesión numerada. Revísela y luego actívela explícitamente.

Si solo el contenedor montado es utilizable, cree e inicie una nueva sesión en un
modo compatible con el sistema de archivos de destino. Monte la copia recuperada
en solo lectura como en la sección 4, luego copie los archivos necesarios a esa sesión
en ejecución. Por ejemplo, para recuperar los directorios home:

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Copie solo los datos y la configuración que necesite. Así evita tratar metadatos de compatibilidad
desconocidos o incompletos como una definición de sesión arrancable.

## 7. No reconstruya los metadatos de la sesión en el lugar

No reemplace `session.conf` con un archivo mínimo ni agregue un directorio recuperado
a un almacén existente manualmente. Los metadatos describen cada sesión en ese
almacén; reemplazarlos puede dejar sesiones sanas huérfanas, descartar campos de compatibilidad y política
de guardado, y cambiar la selección para el siguiente arranque.

Si el contenedor puede montarse en solo lectura, recupere sus archivos en una sesión
compatible recién creada como se describe arriba. Si no puede montarse, conserve
la copia completa fuera de línea para una recuperación de sistema de archivos o forense posterior. Un
contenedor sin metadatos de almacén confiables es una entrada recuperable, no una
definición de sesión arrancable.

## Referencia de errores

- `cannot open ... changes.dat.N`: falta un segmento confirmado. Vuelva a copiarlo
desde el dispositivo de origen o pruebe con otra sesión. No cree un segmento vacío.
- `cannot read header`: el encabezado de DynFileFS/dynblk está dañado.
- `incompatible data format`: el helper y el formato del contenedor no coinciden.
- `virtual.dat` existe pero ext4 no monta: verifique una copia con `e2fsck`.

## Prevención de recurrencias

La mayoría de los incidentes comienzan cuando el dispositivo de persistencia se llena durante el uso. Reduzca el
riesgo con estas medidas:

- Mantenga una reserva de espacio libre con el parámetro de arranque `perchreserve` (por defecto
  256 MiB). Los contenedores nuevos y en crecimiento nunca la consumen, y MiniOS avisa al arrancar
  cuando el espacio libre cae por debajo de la reserva. Auméntela en dispositivos pequeños o muy usados,
  por ejemplo `perchreserve=1024`.
- Elimine sesiones antiguas o no utilizadas antes de que el dispositivo se llene.
- Prefiera una sesión `raw` de tamaño fijo cuando necesite un uso de disco predecible, así
  el crecimiento no puede agotar el dispositivo inesperadamente.
- Apague correctamente. Un corte de energía abrupto mientras el dispositivo está lleno es la causa
  más común de un contenedor que luego no puede montarse.
