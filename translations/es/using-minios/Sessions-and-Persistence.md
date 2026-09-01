---
updated: 2026-08-26
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
|------|---------------|-------------------------|
| `native` | Los cambios se almacenan directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX escribible como ext2/3/4, Btrfs, XFS, F2FS o ReiserFS. |
| `dynfilefs` | Contenedor ext4 expandible dividido en archivos de respaldo | Funciona en POSIX escribible, FAT32, NTFS y exFAT. Requiere el backend DynFileFS. |
| `raw` | `changes.img` de tamaño fijo que contiene ext4 | Funciona en POSIX escribible, FAT32, NTFS y exFAT. |
| `luks` | `changes.luks` cifrado con LUKS2 que contiene ext4 | Requiere `cryptsetup`, soporte de loop y el hook initrd LUKS de MiniOS. |
| `squashfs` | Instantánea comprimida en `changes.sb` | Guardar requiere un sistema de archivos de persistencia POSIX que pueda preservar enlaces, propietarios, modos, xattrs, ACLs, capacidades y whiteouts. |

`dynfilefs`, `raw` y `luks` creados con `minios-session` tienen por defecto 4000 MiB. Los valores de tamaño se asignan en MiB; los sufijos `GB` y `TB` convierten a 1000 y 1.000.000 MiB respectivamente. El Gestor de sesiones de MiniOS limita los archivos raw y LUKS a 4000 MiB en FAT32. No confíes en esto como una garantía general del initrd: una solicitud de arranque raw sobredimensionada puede llegar a la asignación y fallar en vez de reducirse. Las operaciones de redimensionamiento de contenedores solo pueden aumentar el tamaño de una sesión; no se admite la reducción.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Utiliza DynFileFS cuando el sistema de archivos de persistencia no puede representar metadatos de Linux.
Usa raw cuando se requiere asignación fija, LUKS cuando la sesión debe estar cifrada y SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear ninguna sesión en medios de solo lectura. El initrd puede leer y activar una instantánea SquashFS existente almacenada en FAT, exFAT o NTFS escribible porque extrae la instantánea en un ext4 temporal superior. Crear o guardar exactamente una instantánea es diferente: su espacio de trabajo privado debe estar en un sistema de archivos POSIX adecuado que preserve los metadatos de Linux y los whiteouts de union.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita el manejo de persistencia. Los menús de arranque de MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes. La descripción canónica de los selectores, compatibilidad, alternativas y semántica de activación está en [Persistencia en Initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|------------|
| `perch` | Usa la ruta de reanudación heredada de mejor esfuerzo. Intenta con el valor predeterminado de los metadatos pero no crea un reemplazo si ninguno es utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de los metadatos y, si está ausente o es incompatible, permite que el initrd cree un reemplazo compatible. Este es el comportamiento actual de reanudación en el menú de arranque. |
| `perchdir=new` | Asigna una nueva sesión numerada. |
| `perchdir=ask` | Selecciona una sesión existente o crea una durante el arranque. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Usa una ubicación de persistencia en un dispositivo, incluyendo las formas `/dev/...` y `label:...` gestionadas por el initrd. |
| `perchmode=<mode>` | Define `native`, `dynfilefs`, `raw`, `luks` o `squashfs`. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples se asignan en MiB y se aceptan los sufijos `MB`, `GB` y `TB`. |

Si no se especifica un modo para una nueva sesión, el arranque utiliza el modo nativo. En FAT32/NTFS/exFAT, la creación nativa de arranque recurre a DynFileFS. Un nuevo contenedor raw o LUKS por defecto es de 4000 MiB; una nueva sesión DynFileFS sin `perchsize` se dimensiona según el espacio disponible manteniendo una reserva de seguridad.
Las sesiones SquashFS se capturan desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`; `perchdir=new perchmode=squashfs` no crea una instantánea en el initrd.

Al reanudar, MiniOS verifica la versión registrada, edición, sistema de archivos union y modo. El literal `perchdir=resume` puede crear una nueva sesión en vez de usar un valor predeterminado ausente o incompatible. El `perch` simple, la selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación aún falla, el arranque continúa normalmente con una capa superior RAM y una advertencia de persistencia.

El almacén de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los ID predeterminados y en ejecución, y por sesión el modo, versión, edición, sistema de archivos union, tamaño, estado y configuraciones específicas del modo.
Es metadato persistente comprometido por la implementación de arranque, pero no constituye por sí mismo prueba del estado de ejecución actual. No lo edites ni muevas datos de sesiones numeradas mientras una sesión esté montada; utiliza el Gestor de sesiones de MiniOS o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La sesión **activa** es la predeterminada seleccionada para el próximo arranque.
- Conceptualmente, la sesión **en ejecución** es la sesión cuya capa escribible realmente proporciona persistencia al arranque actual.

El campo persistente `running=` registra esa relación prevista. Un fallo, una construcción fallida del union, una copia del almacén o un apagado interrumpido pueden dejarlo desactualizado incluso cuando el arranque actual está usando RAM u otra sesión. Por ello, operaciones como el guardado de SquashFS requieren el estado protegido del initrd, vinculado al ID de arranque actual y el superior montado verificado; no confían solo en `running=`. Consulta [Estado activo, en ejecución y de arranque actual](/reference/boot-process/Persistence-Internals).

Activar una sesión cambia el próximo arranque y no cambia el sistema de archivos union actual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sesión activa no puede eliminarse ni convertirse en el lugar. Una sesión en ejecución normalmente no puede eliminarse, exportarse, copiarse, redimensionarse ni convertirse. La limpieza también protege ambos IDs.

## Referencia de comandos

Lista las sesiones e inspecciona el almacén:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Crea sesiones:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sin un modo selecciona el nativo. La creación de SquashFS captura los cambios actuales en vivo y no tiene un tamaño fijo. Su política de apagado predeterminada es `shutdown`; el guardado periódico está desactivado por defecto.

Guarda y configura una sesión de SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240` y `480` minutos; `0` desactiva el guardado periódico. La configuración de apagado y la periódica son independientes.

Exporta e importa archivos `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Solo se aceptan importaciones `.tar.zst`. Las rutas y los miembros del archivo se validan y la extracción está limitada. `--auto-convert` elige un modo compatible para el sistema de archivos actual. `--force-mode <mode>` selecciona explícitamente un modo disponible. La exportación, copia y conversión no están soportadas para sesiones de SquashFS; guarda la instantánea y copia el directorio completo de la sesión inactiva en su lugar.

Copia o convierte una sesión:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` siempre asigna un nuevo ID de sesión. `convert` reemplaza la fuente por defecto; usa `--new-session` para preservar la fuente. El tamaño solo es relevante para un destino contenedor.

Amplía, elimina o limpia sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El redimensionamiento es compatible con sesiones DynFileFS, raw y LUKS y requiere un tamaño mayor al actual. La limpieza por defecto elimina sesiones con más de 30 días de antigüedad.

Todos los comandos aceptan `--json`, y se puede seleccionar un almacén de sesiones diferente con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamiento de guardado de SquashFS

Una sesión SquashFS se desempaqueta en RAM para la capa escribible en ejecución. Al guardar, se reconstruye y valida una instantánea exacta, luego se reemplaza atómicamente `changes.sb`.
No se conserva ninguna generación de reversión. Guardar ahora está disponible desde el icono de la bandeja, el Gestor de sesiones de MiniOS o `minios-session save`, independientemente de la política automática.

El guardado al apagar se implementa mediante el disparador de apagado principal de MiniOS y el backend `minios-squashfs-save`, por lo que no depende de que el Gestor de sesiones de MiniOS esté abierto o instalado. El guardado periódico se verifica cada 30 minutos mediante un temporizador systemd o un worker SysV, ambos llaman al mismo backend de autoguardado. Reconstruir la instantánea consume CPU y escribe la instantánea completa; se recomiendan intervalos de una hora o más.

Durante la operación de RAM con respaldo SquashFS, una instantánea SquashFS recién capturada y activada puede tomar posesión del destino de guardado en ejecución. Tras ese traspaso, la instantánea anterior en ejecución puede eliminarse sin reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Esta excepción solo se aplica a un traspaso válido de SquashFS en el arranque actual. Otros modos de persistencia en ejecución permanecen protegidos contra la eliminación.

## Cifrado

El modo LUKS almacena un sistema de archivos ext4 directamente en un archivo LUKS2 `changes.luks`; no hay tabla de particiones ni contenedor DynFileFS anidado. Las opciones LUKS solo están disponibles cuando están presentes `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` y `losetup`.

La creación interactiva de LUKS solicita la contraseña dos veces. Las operaciones que leen o crean datos LUKS pueden leerla desde la entrada estándar con `--password-stdin`.
Las contraseñas no se colocan en argumentos de comandos ni en los metadatos de la sesión. Al arrancar, el initrd solicita la contraseña en la consola y no recurre a persistencia sin cifrar si la activación falla.

Las exportaciones LUKS contienen los archivos lógicos de la sesión descifrados, no `changes.luks`.
Importar o convertir a LUKS crea un nuevo contenedor cifrado.

## Copias de seguridad y sesiones fallidas

Para sesiones nativas, DynFileFS, raw y LUKS, utiliza `export` para realizar copias de seguridad en lugar de copiar un directorio de sesión montado. Guarda el archivo resultante en otro dispositivo y verifica que pueda importarse antes de confiar en él. La importación siempre crea una nueva sesión numerada; actívala explícitamente cuando esté lista para usarse.
Para procedimientos de copia de seguridad de SquashFS y de dispositivo completo, consulta [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si una sesión falla después de que se llena el almacenamiento, se interrumpe una escritura o se crean sesiones vacías repetidamente, deja de modificar el almacenamiento afectado. Exporta primero una sesión legible que no esté en uso cuando sea posible y luego sigue la [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

Inicia el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Al arrancar, los sistemas de archivos de los contenedores se verifican antes de la activación escribible. Los fallos graves en la comprobación del sistema de archivos preservan el contenedor para su recuperación en lugar de montarlo como escribible. SquashFS detecta un estado previo no limpio y restaura la última instantánea guardada con éxito. Elimina sesiones solo a través del Gestor de sesiones de MiniOS o `minios-session delete`; no elimines directorios de sesión manualmente.
