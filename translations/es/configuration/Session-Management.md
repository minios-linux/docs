---
updated: 2026-08-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

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
|------|----------------|--------------------------|
| `native` | Los cambios se almacenan directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX con permisos de escritura, como ext2/3/4, Btrfs, XFS, F2FS o ReiserFS. |
| `dynfilefs` | Contenedor ext4 expandible dividido en archivos de respaldo | Funciona en sistemas de archivos POSIX con escritura, FAT32, NTFS y exFAT. Requiere el backend DynFileFS. |
| `raw` | `changes.img` de tamaño fijo que contiene ext4 | Funciona en sistemas de archivos POSIX con escritura, FAT32, NTFS y exFAT. |
| `luks` | `changes.luks` cifrado con LUKS2 que contiene ext4 | Requiere `cryptsetup`, soporte de loop y el hook LUKS de initrd de MiniOS. |
| `squashfs` | Instantánea comprimida en `changes.sb` | El guardado requiere un sistema de archivos de persistencia POSIX que pueda preservar enlaces, propiedad, modos, xattrs, ACLs, capacidades y whiteouts. |

`dynfilefs`, `raw` y `luks` creados con `minios-session` tienen por defecto 4000
MiB. Los valores de tamaño se asignan en MiB; los sufijos `GB` y `TB` convierten a 1000
y 1.000.000 MiB. El Gestor de Sesiones limita los archivos raw y LUKS a 4000 MiB en
FAT32. No confíes en esto como una garantía general de initrd: una solicitud de arranque raw sobredimensionada puede llegar a asignarse
y fallar en vez de reducirse. Las operaciones de redimensionamiento de contenedores solo pueden aumentar el tamaño
de una sesión; no se admite la reducción.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Usa DynFileFS cuando el sistema de archivos de persistencia no puede representar metadatos de Linux.
Usa raw cuando se requiere asignación fija, LUKS cuando la sesión debe estar
encriptada y SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y
los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear una sesión en medios de solo lectura. El initrd puede leer y activar
una instantánea SquashFS existente almacenada en FAT, exFAT o NTFS con escritura porque
extrae la instantánea en un upper temporal ext4. Crear o guardar exactamente una
instantánea es diferente: su espacio de trabajo privado de preparación debe estar en un sistema
de archivos POSIX adecuado que preserve los metadatos de Linux y los whiteouts de unión.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita el manejo de persistencia. Los menús de arranque de MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes. La descripción canónica de los selectores, compatibilidad, fallback y semánticas de activación está en [Persistencia de Initrd](./Initrd-Persistence.md).

| Parámetro | Significado |
|-----------|------------|
| `perch` | Utiliza la ruta de reanudación heredada de mejor esfuerzo. Intenta el valor predeterminado de metadatos pero no crea un reemplazo si no hay ninguno utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de metadatos y, si está ausente o es incompatible, permite que el initrd cree un reemplazo compatible. Este es el comportamiento actual de reanudar en el menú de arranque. |
| `perchdir=new` | Asigna una nueva sesión numerada. |
| `perchdir=ask` | Selecciona una sesión existente o crea una durante el arranque. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Usa una ubicación de persistencia en un dispositivo, incluidas las formas `/dev/...` y `label:...` gestionadas por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `raw`, `luks` o `squashfs`. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples se asignan en MiB y se aceptan los sufijos `MB`, `GB` y `TB`. |

Si no se especifica un modo para una nueva sesión, el arranque utiliza el modo nativo. En FAT32/NTFS/exFAT, la creación nativa de arranque recurre a DynFileFS. Un nuevo contenedor raw o LUKS de arranque tiene por defecto 4000 MiB; una nueva sesión DynFileFS de arranque sin `perchsize` se dimensiona según el espacio disponible manteniendo una reserva de seguridad.
Las sesiones SquashFS se capturan desde el sistema en ejecución con el Gestor de Sesiones o `minios-session create squashfs`; `perchdir=new perchmode=squashfs` no crea una instantánea en el initrd.

Al reanudar, MiniOS verifica la versión registrada, edición, sistema de archivos de unión y modo. Literal `perchdir=resume` puede crear una nueva sesión en vez de usar un valor predeterminado ausente o incompatible. `perch` solo, selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación aún falla, el arranque normalmente continúa con un upper en RAM y una advertencia de persistencia.

El almacén de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los IDs predeterminado y en ejecución y, por sesión, el modo, versión, edición, sistema de archivos de unión, tamaño, estado y configuraciones específicas de modo.
Es metadato persistente comprometido por la implementación de arranque, pero no prueba por sí mismo el estado actual en tiempo de ejecución. No lo edites ni muevas datos de sesiones numeradas mientras una sesión esté montada; usa el Gestor de Sesiones o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La sesión **activa** es la que se selecciona por defecto para el próximo arranque.
- Conceptualmente, la sesión **en ejecución** es la que cuya capa de escritura
  realmente proporciona persistencia al arranque actual.

El campo persistente `running=` registra esa relación prevista. Un fallo,
construcción fallida de la unión, copia de almacenamiento o un apagado interrumpido pueden dejarlo
desactualizado incluso cuando el arranque actual está usando RAM u otra sesión. Por lo tanto, operaciones
como el guardado SquashFS requieren el estado actual protegido del initrd, vinculado al boot-ID,
y la capa superior montada y verificada; no confían solo en `running=`.
Consulta [Estado activo, en ejecución y de arranque actual](./Initrd-Persistence.md).

Activar una sesión cambia el próximo arranque y no cambia el sistema de archivos
unión actual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sesión activa no puede eliminarse ni convertirse en el lugar. Una sesión en ejecución
normalmente no puede eliminarse, exportarse, copiarse, redimensionarse ni convertirse. La limpieza
también protege ambos IDs.

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

`create` sin un modo selecciona el nativo. La creación de SquashFS captura los cambios actuales en vivo y no tiene un tamaño fijo. Su política de apagado predeterminada es `shutdown`; el guardado periódico está desactivado por defecto.

Guardar y configurar una sesión SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240` y `480` minutos; `0` desactiva el guardado periódico. La configuración de apagado y la periódica son independientes.

Exportar e importar archivos `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Solo se aceptan importaciones `.tar.zst`. Las rutas y los miembros del archivo se validan, y la extracción está limitada. `--auto-convert` elige un modo compatible para el sistema de archivos actual. `--force-mode <mode>` selecciona explícitamente un modo disponible. La exportación, copia y conversión no están soportadas para sesiones SquashFS; guarde el snapshot y copie el directorio completo de la sesión inactiva en su lugar.

Copiar o convertir una sesión:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` siempre asigna un nuevo ID de sesión. `convert` reemplaza la fuente por defecto; use `--new-session` para conservar la fuente. El tamaño solo es relevante para un destino tipo contenedor.

Ampliar, eliminar o limpiar sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El cambio de tamaño es compatible con sesiones DynFileFS, raw y LUKS y requiere un tamaño mayor al actual. La limpieza por defecto afecta a sesiones con más de 30 días.

Todos los comandos aceptan `--json`, y se puede seleccionar un almacén de sesiones diferente con `--sessions-dir PATH`:

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

Para sesiones nativas, DynFileFS, raw y LUKS, use `export` para las copias de seguridad en lugar de copiar el directorio de una sesión montada. Mantenga el archivo resultante en otro dispositivo y verifique que pueda ser listado o importado antes de confiar en él. La importación siempre crea una nueva sesión numerada; actívela explícitamente cuando esté lista para usarse. Para procedimientos de copia de seguridad de SquashFS y de dispositivo completo, consulte [Copia de seguridad y recuperación](/administration/Backup-Recovery.md).

Para la recuperación tras un dispositivo de almacenamiento completo, una escritura interrumpida o la creación repetida de sesiones vacías, siga la guía dedicada de [recuperación de DynFileFS y dynblk](./DynFileFS-Recovery.md).

Inicie el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Al arrancar, los sistemas de archivos de contenedor se revisan antes de la activación en modo escritura. Los fallos graves en la comprobación del sistema de archivos preservan el contenedor para recuperación en lugar de montarlo en modo escritura. SquashFS detecta un estado previo no limpio y restaura el último snapshot guardado con éxito. Elimine sesiones solo mediante el Administrador de Sesiones o `minios-session delete`; no elimine directorios de sesión manualmente.
