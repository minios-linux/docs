---
updated: 2026-09-13
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sesiones y persistencia

Las sesiones de MiniOS mantienen los cambios realizados en el sistema en vivo a través de los reinicios. Cada sesión es un directorio numerado dentro de `minios/changes/`; los módulos de MiniOS son de solo lectura y permanecen sin cambios, mientras que la sesión seleccionada proporciona la capa de sistema de archivos union escribible.

Utiliza el Gestor de sesiones de MiniOS desde un sistema MiniOS en ejecución:

```bash
minios-session-manager
```

La herramienta equivalente en línea de comandos es `minios-session`. Sus comandos de modificación requieren privilegios administrativos, por lo que los ejemplos a continuación usan `sudo`.

## Modos de sesión

| Modo | Almacenamiento | Restricciones principales |
|------|---------|------------------|
| `native` | Los cambios se almacenan directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX con permisos de escritura, como ext2/3/4, Btrfs, XFS, F2FS o ReiserFS. |
| `dynfilefs` | Contenedor ext4 expandible dividido en archivos de respaldo | Funciona en sistemas de archivos POSIX con escritura, FAT32, NTFS y exFAT. Requiere el backend DynFileFS. |
| `dynblk` | Sistema de archivos ext4 delgado en un dispositivo de bloque del kernel respaldado por `volumeNNN.db` archivos | Requiere la CLI dynblk, el módulo del kernel y capacidad initrd. El tamaño virtual predeterminado es 16 GiB y el máximo es 512 GiB. |
| `raw` | Archivo de tamaño fijo `changes.img` que contiene ext4 | Funciona en sistemas de archivos POSIX con escritura, FAT32, NTFS y exFAT. |
| `luks` | Archivo LUKS2 cifrado `changes.luks` que contiene ext4 | Requiere `cryptsetup`, soporte de loop y el gancho LUKS de initrd MiniOS. |
| `squashfs` | Instantánea comprimida en `changes.sb` | Para guardar se requiere un sistema de archivos POSIX persistente que pueda preservar enlaces, propiedad, modos, xattrs, ACLs, capacidades y whiteouts. |

`dynfilefs`, `raw`, y `luks` creados con `minios-session` tienen un valor predeterminado de 4000 MiB; `dynblk` tiene un valor predeterminado de 16 GiB. Los valores de tamaño se asignan en MiB; `GB` y `TB` los sufijos convierten a 1000 y 1.000.000 MiB. El Gestor de sesiones de MiniOS limita los archivos raw y LUKS a 4000 MiB en FAT32. La capacidad de dynblk es virtual y delgada en vez de preasignada, pero las escrituras reales siguen limitadas por el espacio libre del sistema de archivos subyacente y la admisión de recursos de dynblk. Las operaciones de redimensionado de contenedores solo pueden aumentar una sesión; no se admite reducir el tamaño.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Utiliza DynFileFS cuando el sistema de archivos de persistencia no puede representar metadatos de Linux.
Utiliza dynblk cuando se necesita un dispositivo de bloque real del kernel con archivos de respaldo delgados; el controlador puede mantener varios volúmenes dynblk independientes conectados al mismo tiempo, y Session Manager usa la ruta del dispositivo devuelta por el controlador en lugar de asumir que `/dev/dynblk0` está libre.
Utiliza raw cuando se requiere asignación fija, LUKS cuando la sesión debe estar cifrada, y SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear ninguna sesión en medios de solo lectura. El initrd puede leer y activar una instantánea SquashFS existente almacenada en FAT, exFAT o NTFS con escritura porque extrae la instantánea en un ext4 temporal superior. Crear o guardar exactamente una instantánea es diferente: su espacio de trabajo privado de preparación debe estar en un sistema de archivos POSIX adecuado que preserve los metadatos de Linux y los whiteouts de unión.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita el manejo de persistencia. Los menús de arranque de MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes. La descripción canónica de los comportamientos de selector, compatibilidad, reserva y activación se encuentra en [Persistencia en initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|---------|
| `perch` | Utiliza la ruta de reanudación heredada con mejor esfuerzo. Prueba el valor predeterminado de metadatos pero no crea un reemplazo si no hay ninguno utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de metadatos y, si está ausente o es incompatible, permite que el initrd cree un nuevo reemplazo compatible. Este es el comportamiento actual de reanudación en el menú de arranque. |
| `perchdir=new` | Asigna una nueva sesión numerada. |
| `perchdir=ask` | Selecciona una sesión existente o crea una durante el arranque. |
| `perchdir=<id>` | Selecciona esa sesión numerada directamente. |
| `perchdir=<device/path>` | Utiliza una ubicación de persistencia en un dispositivo, incluidas las formas `/dev/...` y `label:...` gestionadas por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, o `squashfs`. |
| `perchsize=<size>` | Establece un tamaño nuevo o mayor para el contenedor; los valores simples se asignan en MiB y se aceptan los sufijos `MB`, `GB`, y `TB`. |

Si no se especifica un modo para una nueva sesión, el arranque usa el modo nativo. En FAT32/NTFS/exFAT, la creación nativa recurre a DynFileFS. Un nuevo contenedor raw o LUKS tiene un tamaño predeterminado de 4000 MiB; una nueva sesión DynFileFS sin `perchsize` se dimensiona según el espacio disponible, dejando una reserva de seguridad. Una nueva sesión dynblk sin `perchsize` utiliza el valor predeterminado del controlador de 16 GiB; el crecimiento explícito de dynblk está limitado a 512 GiB.
Las sesiones SquashFS se capturan desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`; `perchdir=new perchmode=squashfs` no crea una instantánea en el initrd.

Al reanudar, MiniOS comprueba la versión registrada, edición, sistema de archivos union y modo. El parámetro literal `perchdir=resume` puede crear una nueva sesión en vez de usar un valor predeterminado ausente o incompatible. Las solicitudes de reanudación heredadas simples, selección numérica directa y otras no crean automáticamente ese reemplazo.`perch`, la selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación falla, el arranque continúa normalmente con una capa superior RAM y una advertencia de persistencia.

El almacén de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los IDs predeterminados y en uso, y el modo, versión, edición, sistema de archivos union, tamaño, estado y configuraciones específicas por sesión.
Es metadato persistente comprometido por la implementación de arranque, no prueba del estado actual de ejecución. No lo edites ni muevas datos de sesiones numeradas mientras una sesión esté montada; utiliza el Gestor de sesiones de MiniOS o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La sesión **activa** es la seleccionada por defecto para el próximo arranque.
- Conceptualmente, la sesión **en ejecución** es la que realmente proporciona persistencia al arranque actual mediante su capa editable.

El campo persistente `running=` registra esa relación prevista. Un fallo, error al construir la unión, almacenamiento copiado o un apagado interrumpido pueden dejarlo desactualizado, incluso si el arranque actual está usando RAM u otra sesión. Por eso, operaciones como el guardado de SquashFS requieren el estado protegido del arranque actual, vinculado al ID de arranque y con la capa superior montada y verificada; no confían solo en `running=` . Consulta [Estado activo, en ejecución y del arranque actual](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Activar una sesión cambia el próximo arranque, pero no modifica el sistema de archivos union actual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

No se puede eliminar ni convertir en el lugar la sesión activa. Una sesión en ejecución normalmente no se puede eliminar, exportar, copiar, redimensionar ni convertir. La limpieza también protege ambos IDs.

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

`create` sin modo selecciona nativo. La creación de SquashFS captura los cambios en vivo actuales y no tiene un tamaño fijo. Su política de apagado predeterminada es `shutdown`; el guardado periódico está desactivado por defecto.

Guardar y configurar una sesión SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240`, y `480` minutos; `0` desactiva el guardado periódico. Las opciones de apagado y guardado periódico son independientes.

Exportar e importar `.tar.zst` archivos de respaldo:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
```

Solo se aceptan importaciones de `.tar.zst`. Las rutas y los miembros del archivo se validan, y la extracción está limitada. `--auto-convert` selecciona un modo compatible para el sistema de archivos actual. `--force-mode <mode>` selecciona explícitamente un modo disponible. Exportar, copiar y convertir no están soportados para sesiones SquashFS; guarda la instantánea y copia el directorio completo de la sesión inactiva.

Copiar o convertir una sesión:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` siempre asigna un nuevo ID de sesión. `convert` reemplaza la fuente por defecto; usa `--new-session` para conservar la fuente. El tamaño solo es relevante para un destino tipo contenedor.

Ampliar, eliminar o limpiar sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El redimensionado es compatible con sesiones DynFileFS, dynblk, raw y LUKS y requiere un tamaño mayor al actual. El redimensionado de dynblk amplía primero el dispositivo de bloque virtual y luego expande su sistema de archivos ext4; no preasigna la nueva capacidad virtual. La limpieza elimina por defecto sesiones con más de 30 días.

Todos los comandos aceptan `--json`, y se puede seleccionar un almacén de sesiones diferente con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamiento de guardado de SquashFS

Una sesión SquashFS se desempaqueta en RAM para la capa de escritura en ejecución. Al guardar, se reconstruye y valida una instantánea exacta, que luego reemplaza atómicamente a `changes.sb`.
No se conserva ninguna generación para retroceso. Guardar ahora está disponible desde el icono de la bandeja, el Gestor de sesiones de MiniOS o `minios-session save` independientemente de la política automática.

El guardado al apagar se implementa mediante el disparador de apagado principal de MiniOS y el backend `minios-squashfs-save`, por lo que no depende de que el Gestor de sesiones de MiniOS esté abierto o instalado. El guardado periódico se comprueba cada 30 minutos mediante un temporizador de systemd o un proceso de SysV, ambos llaman al mismo backend de autoguardado. Reconstruir la instantánea consume CPU y escribe la instantánea completa; se recomiendan intervalos de una hora o más.

Durante la operación RAM respaldada por SquashFS, una instantánea SquashFS recién capturada y activada puede tomar posesión del destino de guardado en ejecución. Tras esa transferencia, la instantánea anterior en ejecución puede eliminarse sin reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Esta excepción solo aplica a una transferencia válida de SquashFS del arranque actual. Otros modos de persistencia en ejecución permanecen protegidos contra la eliminación.

## Cifrado

El modo LUKS almacena un sistema de archivos ext4 directamente en un archivo LUKS2 `changes.luks`; no hay tabla de particiones ni contenedor DynFileFS anidado. Las opciones LUKS solo están disponibles cuando están presentes `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` y `losetup`.

La creación interactiva de LUKS solicita la contraseña dos veces. Las operaciones que leen o crean datos LUKS pueden leerla desde la entrada estándar con `--password-stdin`.
Las contraseñas no se colocan en argumentos de comandos ni en los metadatos de la sesión. Al arrancar, el initrd solicita la contraseña en la consola y no recurre a persistencia sin cifrar si la activación falla.

Las exportaciones LUKS contienen los archivos lógicos de la sesión descifrados, no `changes.luks`.
Importar o convertir a LUKS crea un nuevo contenedor cifrado.

## Copias de seguridad y sesiones fallidas

Para sesiones nativas, DynFileFS, dynblk, raw y LUKS, utiliza `export` para copias de seguridad en vez de copiar un directorio de sesión montado. Guarda el archivo resultante en otro dispositivo y verifica que pueda importarse antes de confiar en él. Importar siempre crea una nueva sesión numerada; actívala explícitamente cuando esté lista para usarse.
Para procedimientos de copia de seguridad de SquashFS y de dispositivo completo, consulta [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si una sesión falla después de que el almacenamiento se llena, se interrumpe una escritura o se crean sesiones vacías repetidamente, deja de modificar el almacenamiento afectado. Exporta primero una sesión legible que no esté en uso si es posible, luego sigue [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

Inicia el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

En el arranque, los sistemas de archivos de los contenedores se verifican antes de la activación con escritura. Los fallos graves en la comprobación del sistema de archivos preservan el contenedor para su recuperación en vez de montarlo con escritura. SquashFS detecta un estado previo sin limpiar y restaura la última instantánea guardada con éxito. Elimina sesiones solo a través del Gestor de sesiones de MiniOS o `minios-session delete`; no elimines directorios de sesión manualmente.
