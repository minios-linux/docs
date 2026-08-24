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
2. No copie sesiones de origen sobre el `minios/changes` actualmente activo.
3. Copie el directorio completo `changes` antes de intentar la recuperación.
4. Ejecute `e2fsck -y` solo sobre una copia adicional de una sesión.
5. No cree manualmente un archivo `changes.dat.N` que falte.

Si MiniOS está ejecutándose actualmente con persistencia y el dispositivo de origen está montado, es seguro hacer la copia inicial. No reemplace `session.conf` hasta que MiniOS haya arrancado sin persistencia.

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

Ubique el helper instalado. Dependiendo de la imagen de MiniOS, el nombre canónico puede ser `dynblk` o el nombre de compatibilidad `@mount.dynfilefs`:

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

No especifique `-s` ni `perchsize` al recuperar un contenedor existente. Su tamaño virtual se almacena en los metadatos de DynFileFS/dynblk.

Un montaje exitoso expone `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Compruebe su sistema de archivos ext4 sin realizar cambios:

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

## 6. Restaurar la sesión para el arranque

Realice este paso después de apagar la sesión persistente y arrancar MiniOS sin `perch`, `perchdir` ni `perchmode`. También puede hacerse desde otro sistema Linux.

Copie el contenedor recuperado en un directorio de sesión numérico sin usar. Usar un número nuevo evita sobrescribir cualquier sesión actual:

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Si no fue necesaria la reparación del sistema de archivos, copie desde `$RECOVERY/$SESSION` en lugar de `$REPAIR`.

Haga una copia de seguridad y reemplace los metadatos de la sesión:

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

Los metadatos mínimos omiten deliberadamente los campos de versión, edición y unión para que datos de compatibilidad obsoletos no fuercen a MiniOS a crear otra sesión.

Arranque MiniOS con:

```text
perchdir=resume perchmode=dynfilefs
```

No agregue `perchdir=new` ni `perchsize` durante este primer arranque de recuperación.

## 7. Recuperar archivos sin iniciar la sesión

Si el contenedor se monta manualmente pero no puede usarse como sesión de arranque, copie los archivos importantes desde el montaje en solo lectura a una nueva sesión de trabajo:

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Referencia de errores

- `cannot open ... changes.dat.N`: falta un segmento confirmado. Vuelva a copiarlo desde el dispositivo de origen o pruebe con otra sesión. No cree un segmento vacío.
- `cannot read header`: el encabezado de DynFileFS/dynblk está dañado.
- `incompatible data format`: el helper y el formato del contenedor no coinciden.
- `virtual.dat` existe pero ext4 no monta: verifique una copia con `e2fsck`.
- El contenedor monta pero MiniOS crea una nueva sesión: verifique que `session.conf` apunte al número restaurado y contenga `session_mode[N]=dynfilefs`.

## Prevención de recurrencias

La mayoría de los incidentes comienzan cuando el dispositivo de persistencia se llena durante el uso. Reduzca el riesgo con estas medidas:

- Mantenga una reserva de espacio libre con el parámetro de arranque `perchreserve` (por defecto 256 MB). Los contenedores nuevos y en crecimiento nunca la consumen, y MiniOS avisa al arrancar cuando el espacio libre cae por debajo de la reserva. Auméntela en dispositivos pequeños o muy usados, por ejemplo `perchreserve=1024`.
- Elimine sesiones antiguas o sin uso antes de que el dispositivo se llene.
- Prefiera una sesión de tamaño fijo `raw` cuando necesite un uso de disco predecible, para que el crecimiento no agote el dispositivo inesperadamente.
- Apague correctamente. Un apagado brusco con el dispositivo lleno es la causa más común de un contenedor que luego no puede montarse.
