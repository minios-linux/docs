# Gestión de sesiones en MiniOS

Las sesiones de MiniOS conservan los cambios realizados en el sistema en vivo tras reinicios. Cada
sesión es un directorio numerado dentro de `minios/changes/`; los módulos de MiniOS
son de solo lectura y permanecen sin cambios, mientras que la sesión seleccionada proporciona la capa
escribible del sistema de archivos en unión.

Utiliza el Administrador de Sesiones desde un sistema MiniOS en ejecución:

```bash
minios-session-manager
```

La herramienta equivalente en línea de comandos es `minios-session`. Sus comandos de modificación
requieren privilegios administrativos, por lo que los ejemplos a continuación usan `sudo`.

## Modos de sesión

| Modo | Almacenamiento | Restricciones principales |
|------|---------------|--------------------------|
| `native` | Los cambios se almacenan directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX escribible como ext2/3/4, Btrfs, XFS, F2FS o ReiserFS. |
| `dynfilefs` | Contenedor ext4 expandible dividido en archivos de respaldo | Funciona en sistemas de archivos POSIX escribibles, FAT32, NTFS y exFAT. Requiere el backend DynFileFS. |
| `raw` | `changes.img` de tamaño fijo que contiene ext4 | Funciona en sistemas de archivos POSIX escribibles, FAT32, NTFS y exFAT. |
| `luks` | `changes.luks` cifrado con LUKS2 que contiene ext4 | Requiere `cryptsetup`, soporte de loop y el hook LUKS de initrd de MiniOS. |
| `squashfs` | Instantánea comprimida en `changes.sb` | El guardado requiere un sistema de archivos de persistencia POSIX que pueda preservar enlaces, propiedad, modos, xattrs, ACLs, capacidades y whiteouts. |

`dynfilefs`, `raw` y `luks` creados con `minios-session` tienen un tamaño predeterminado de 4000
MB. Los tamaños usan unidades decimales `MB`, `GB` o `TB` y están limitados a 1 TB. Los archivos raw
y LUKS están limitados a 4000 MB en FAT32. Las operaciones de redimensionamiento de contenedores solo
pueden aumentar el tamaño de una sesión; no se admite la reducción.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Utiliza DynFileFS cuando el sistema de archivos de persistencia no puede representar metadatos de Linux.
Utiliza raw cuando se requiere asignación fija, LUKS cuando la sesión debe estar
encriptada y SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y
los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear ninguna sesión en medios de solo lectura. La activación de SquashFS en
FAT32/NTFS/exFAT permanece deshabilitada hasta que haya disponible un espacio de trabajo temporal que preserve metadatos.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita la gestión de persistencia. Los menús de arranque de MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes.

| Parámetro | Significado |
|-----------|------------|
| `perch` | Solicita persistencia. |
| `perchdir=resume` | Reanuda la sesión predeterminada. Es una acción de mejor esfuerzo y continúa en memoria si no hay una sesión escribible y compatible disponible. |
| `perchdir=new` | Asigna una nueva sesión numerada. |
| `perchdir=ask` | Selecciona una sesión existente o crea una durante el arranque. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Usa una ubicación de persistencia en un dispositivo, incluyendo las formas `/dev/...` y `label:...` gestionadas por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `raw`, `luks` o `squashfs`. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples son MB y se aceptan los sufijos `MB`, `GB` y `TB`. |

Si no se especifica un modo para una nueva sesión, el arranque utiliza el modo nativo. En
FAT32/NTFS/exFAT, la creación nativa de arranque recurre a DynFileFS. Un nuevo contenedor raw o
LUKS en arranque tiene un tamaño predeterminado de 4000 MB; una nueva sesión DynFileFS de arranque sin
`perchsize` se dimensiona según el espacio disponible, manteniendo una reserva de seguridad.
Las sesiones SquashFS se capturan desde el sistema en ejecución con el Administrador de Sesiones o
`minios-session create squashfs`; `perchdir=new perchmode=squashfs` no
crea una instantánea en el initrd.

Al reanudar, MiniOS verifica la versión registrada, edición, sistema de archivos en unión
y modo. La ruta normal `resume` crea una nueva sesión en lugar de reemplazar
una incompatible. La selección interactiva muestra una advertencia antes de permitir
una sesión incompatible.

El almacén de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los ID predeterminado y en ejecución y, por sesión, el modo,
versión, edición, sistema de archivos en unión, tamaño, estado y configuraciones específicas del modo.
Es la configuración confirmada por la implementación de arranque. No lo edites
ni muevas datos de sesiones numeradas mientras una sesión esté montada; utiliza el Administrador de Sesiones
o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La sesión **activa** es la predeterminada seleccionada para el próximo arranque.
- La sesión **en ejecución** proporciona persistencia al arranque actual.

Activar una sesión cambia el próximo arranque y no modifica el sistema de archivos en unión actual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

No se puede eliminar ni convertir en el lugar la sesión activa. Una sesión en ejecución normalmente no puede eliminarse, exportarse, copiarse, redimensionarse ni convertirse. La limpieza también protege ambos ID.

## Referencia de comandos

Listar sesiones e inspeccionar el almacén:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Crear sesiones:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sin un modo selecciona el nativo. La creación de SquashFS captura los cambios en vivo actuales y no tiene un tamaño fijo. Su política de apagado por defecto es `shutdown`;
por defecto el guardado periódico está desactivado.

Guardar y configurar una sesión SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240` y `480` minutos;
`0` desactiva el guardado periódico. La configuración de apagado y la periódica son independientes.

Exportar e importar archivos `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Solo se aceptan importaciones `.tar.zst`. Las rutas y los miembros del archivo se validan,
y la extracción está limitada. `--auto-convert` elige un modo compatible para el
sistema de archivos actual. `--force-mode <mode>` selecciona explícitamente un modo
disponible.

Copiar o convertir una sesión:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` siempre asigna un nuevo ID de sesión. `convert` reemplaza la fuente por
defecto; usa `--new-session` para conservar la fuente. El tamaño solo es relevante
para un destino tipo contenedor.

Aumentar, eliminar o limpiar sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El redimensionamiento es compatible con sesiones DynFileFS, raw y LUKS y requiere un tamaño mayor
al actual. La limpieza por defecto afecta a sesiones con más de 30 días de antigüedad.

Todos los comandos aceptan `--json`, y se puede seleccionar un almacén de sesiones diferente
con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamiento de guardado de SquashFS

Una sesión SquashFS se desempaqueta en RAM para la capa escribible en ejecución. Al guardar,
se reconstruye y valida una instantánea exacta, reemplazando atómicamente `changes.sb`.
No se conserva ninguna generación de reversión. Guardar ahora está disponible desde el icono de la bandeja,
el Administrador de Sesiones o `minios-session save` independientemente de la política automática.

El guardado al apagar se implementa mediante el disparador de apagado principal de MiniOS y el
backend `minios-squashfs-save`, por lo que no depende de que el Administrador de Sesiones esté
abierto o instalado. El guardado periódico se verifica cada 30 minutos mediante un temporizador systemd
o un proceso SysV, ambos llaman al mismo backend de autoguardado. Reconstruir
la instantánea consume CPU y escribe la instantánea completa; se recomiendan intervalos de una
hora o más.

Durante el funcionamiento de SquashFS respaldado en RAM, una instantánea SquashFS recién capturada y activada puede tomar posesión del destino de guardado en ejecución. Tras ese traspaso, la
antigua instantánea en ejecución puede eliminarse sin reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Esta excepción solo aplica a un traspaso válido de SquashFS en el arranque actual. Otros
modos de persistencia en ejecución permanecen protegidos contra eliminación.

## Cifrado

El modo LUKS almacena un sistema de archivos ext4 directamente en un archivo `changes.luks` LUKS2;
no hay tabla de particiones ni contenedor DynFileFS anidado. Las opciones LUKS solo están
disponibles cuando `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`
y `losetup` están presentes.

La creación interactiva de LUKS solicita la frase de contraseña dos veces. Las operaciones que leen
o crean datos LUKS pueden leerlos desde la entrada estándar con `--password-stdin`.
Las frases de contraseña no se colocan en argumentos de comando ni en metadatos de sesión. Al arrancar,
el initrd solicita la frase de contraseña en la consola y no recurre a
persistencia sin cifrar si la activación falla.

Las exportaciones LUKS contienen archivos de sesión lógicos descifrados, no `changes.luks`.
Importar o convertir a LUKS crea un nuevo contenedor cifrado.

## Copias de seguridad y recuperación

Utiliza `export` para copias de seguridad en lugar de copiar un directorio de sesión montado. Guarda
el archivo resultante en otro dispositivo y verifica que pueda listarse o
importarse antes de confiar en él. La importación siempre crea una nueva sesión numerada;
actívala explícitamente cuando esté lista para usarse.

Para recuperación tras un dispositivo de almacenamiento lleno, una escritura interrumpida o la creación repetida de sesiones vacías, sigue la guía dedicada de
[recuperación de DynFileFS y dynblk](./DynFileFS-Recovery.md).

Inicia el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Al arrancar, los sistemas de archivos de los contenedores se verifican antes de la activación en modo escribible. Los fallos graves en la comprobación del sistema de archivos preservan el contenedor para recuperación en lugar de montarlo en modo escribible. SquashFS detecta un estado previo no limpio y restaura la última instantánea guardada exitosamente. Elimina sesiones solo mediante el Administrador de Sesiones o `minios-session delete`; no elimines directorios de sesión manualmente.
