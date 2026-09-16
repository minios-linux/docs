---
updated: 2026-09-16
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

| Modo | Almacenamiento | Restricciones principales | MiniOS capa LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Los cambios se guardan directamente en el directorio de la sesión | Requiere un sistema de archivos escribible que conserve los metadatos de Linux y las operaciones que MiniOS detecta. La capacidad depende del espacio libre disponible; `perchsize` no aplica. | No |
| `dynfilefs` | ext4 expandible `virtual.dat`respaldado por archivos de segmento formato-400 | Funciona en sistemas de archivos POSIX, FAT32, NTFS y exFAT que sean escribibles. El payload es ligero, pero el índice de mapeo escala según la capacidad lógica declarada. | Sí |
| `dynblk` | Sistema de archivos ext4 fino sobre un dispositivo de bloque del kernel respaldado por `volumeNNN.db` archivos | Requiere la CLI DynBlk, módulo del kernel y capacidad initrd. El tamaño creado al arrancar es de hasta 16 GiB por defecto; el límite de formato es 512 GiB. El mapeo disperso RAM se gestiona por separado. | Sí |
| `raw` | Archivo único `changes.img` que contiene ext4 | Capacidad lógica fija, solo crece de forma explícita. Funciona en sistemas de archivos POSIX, FAT32, NTFS y exFAT escribibles; FAT32 está limitado a 4000 MiB. | Sí |
| `squashfs` | Instantánea comprimida en `changes.sb`; la parte superior escribible en tiempo de ejecución se reconstruye en RAM | `perchsize` no aplica. Las instantáneas existentes pueden restaurarse desde medios escribibles compatibles, mientras que el guardado exacto requiere un sistema de archivos de staging compatible con POSIX. | No |

Raw, DynFileFS y DynBlk pueden llevar opcionalmente una capa de cifrado LUKS2. El backend de almacenamiento sigue siendo el modo de sesión y los metadatos de la sesión registran el cifrado por separado. DynFileFS y raw creados con `minios-session` tienen un valor predeterminado de 4000 MiB; DynBlk predetermina a 16 GiB. Los valores de tamaño se asignan en MiB; `GB` y `TB` sufijos convierten a 1000 y 1.000.000 MiB. Raw está limitado a 4000 MiB en FAT32, esté cifrado o no. Los datos de payload de DynFileFS crecen bajo demanda, pero su índice formato-400 se dimensiona para la capacidad lógica completa y consume unos 2 MiB de RAM más unos 2 MiB de almacenamiento de respaldo por GiB. La capacidad de DynBlk es fina y su mapeo en tiempo de ejecución es disperso: los mapeos densos cuestan unos 8 MiB/GiB, mientras que la capacidad virtual no usada no consume ningún fragmento de mapeo. El driver DynBlk selecciona automáticamente el presupuesto de mapeo en torno al 25% del RAM utilizable, con un tope de 4096 MiB; MiniOS no modifica esa política. Las escrituras reales siguen limitadas por el espacio libre del sistema de archivos subyacente y los recursos del backend. Las operaciones de redimensionamiento de contenedores solo pueden aumentar una sesión; no se admite la reducción.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Utiliza DynFileFS cuando el sistema de archivos de persistencia no puede representar los metadatos de Linux.
Utiliza DynBlk si necesitas un dispositivo de bloque real del kernel con archivos de respaldo finos; el driver puede mantener varios volúmenes independientes de DynBlk adjuntos al mismo tiempo, y Session Manager usa la ruta de dispositivo que devuelve el driver en vez de asumir que `/dev/dynblk0` está libre.
Utiliza raw cuando se requiere asignación fija, añade LUKS2 si la sesión debe estar cifrada y usa SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear ninguna sesión en medios de solo lectura. El initrd puede leer y activar una instantánea SquashFS existente almacenada en FAT, exFAT o NTFS escribibles porque extrae la instantánea en una capa superior ext4 temporal. Crear o guardar exactamente una instantánea es diferente: su espacio de trabajo privado de staging debe estar en un sistema de archivos POSIX adecuado que conserve los metadatos de Linux y los whiteouts de unión.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita la gestión de persistencia. Los menús de arranque MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes. La descripción canónica de los comportamientos de selector, compatibilidad, reserva y activación está en [Persistencia en initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|---------|
| `perch` | Usa la ruta heredada de reanudación por mejor esfuerzo. Intenta el valor predeterminado de los metadatos, pero no crea un reemplazo si no hay ninguno utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de los metadatos y, si está ausente o es incompatible, permite que el initrd cree un reemplazo compatible. Este es el comportamiento actual de reanudar en el menú de arranque. |
| `perchdir=new` | Asigna una nueva sesión numerada. |
| `perchdir=ask` | Selecciona una sesión existente o crea una durante el arranque. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Usa una ubicación de persistencia en un dispositivo, incluidas las formas `/dev/...` y `label:...`gestionadas por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `dynblk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra una sesión Raw, DynFileFS o DynBlk recién creada con LUKS2. Las sesiones existentes solo derivan el cifrado de los metadatos. |
| `perchcomp=<codec>` | Selecciona la compresión de backend DynBlk para una nueva sesión DynBlk. La compresión se fuerza a `none`cuando DynBlk está envuelto en LUKS2. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples se asignan en MiB y `MB`, `GB`, y `TB`se aceptan sufijos. |

Si no se especifica modo para una nueva sesión, el arranque utiliza el modo nativo. En FAT32/NTFS/exFAT, la creación nativa en arranque recurre a DynFileFS. Un nuevo contenedor raw tiene por defecto 4000 MiB. Las nuevas sesiones de arranque DynFileFS y DynBlk sin `perchsize`utilizan hasta 16 GiB; si queda menos espacio de respaldo tras la reserva de seguridad, el tamaño automático se reduce. DynFileFS también tiene en cuenta la sobrecarga de su índice y el límite de RAM. El crecimiento explícito de DynBlk está limitado a 512 GiB.
Las sesiones SquashFS pueden capturarse desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`. La configuración de initrd solo crea los metadatos de sesión de generación cero y mantiene la capa superior editable en RAM. El sistema en ejecución crea la primera `changes.sb`instantánea bajo demanda o al apagar.

Al reanudar, MiniOS comprueba la versión registrada, edición, sistema de archivos de unión y modo. El literal `perchdir=resume`puede crear una nueva sesión en vez de usar un valor predeterminado ausente o incompatible. El uso simple de `perch`, selección numérica directa y otras solicitudes heredadas de reanudación no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación aún falla, el arranque continúa normalmente con una capa superior RAM y una advertencia de persistencia.

La tienda de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf`registra los ID predeterminados y en uso, así como el modo, versión, edición, sistema de archivos de unión, tamaño, estado y ajustes específicos de modo por sesión.
Son metadatos persistentes comprometidos por la implementación de arranque, pero no prueban por sí mismos el estado de ejecución actual. No lo edites ni muevas datos de sesión numerados mientras una sesión esté montada; utiliza el Gestor de sesiones de MiniOS o `minios-session`.

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

Listar sesiones e inspeccionar la tienda:

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
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create`sin un modo selecciona nativo. La creación de SquashFS captura los cambios en vivo actuales y no tiene tamaño fijo. Su política de apagado por defecto es `shutdown`; el guardado periódico está desactivado por defecto.

Guardar y configurar una sesión SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240`, y `480`minutos; `0`desactiva el guardado periódico. Las opciones de apagado y guardado periódico son independientes.

Exportar e importar `.tar.zst`archivos:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Solo se aceptan `.tar.zst`importaciones. Se validan rutas y miembros del archivo, y la extracción está limitada. `--auto-convert`elige un modo compatible para el sistema de archivos actual. `--force-mode <mode>`selecciona explícitamente un modo disponible. No se admite la exportación, copia ni conversión para sesiones SquashFS; guarda la instantánea y copia el directorio completo de la sesión inactiva.

Copiar o convertir una sesión:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy`es una copia lógica del sistema de archivos y siempre asigna un nuevo ID de sesión. Puede cambiar backend, capacidad o cifrado y crea identidades nuevas de ext4 y LUKS.`clone`copia físicamente un backend desconectado y conserva su cabecera LUKS, keyslots, UUID de LUKS y UUID de ext4.`convert`reemplaza la fuente por defecto; usa `--new-session`para conservar la fuente. El tamaño solo es relevante para un destino contenedor.

Ampliar, eliminar o limpiar sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El redimensionamiento admite sesiones DynFileFS, DynBlk y raw, incluidas las cifradas, y requiere un tamaño mayor al actual. El redimensionamiento de DynBlk primero amplía el dispositivo de bloque virtual y luego expande su sistema de archivos ext4; no preasigna la nueva capacidad virtual. La limpieza por defecto afecta a sesiones de más de 30 días.

Todos los comandos aceptan `--json`, y se puede seleccionar una tienda de sesiones diferente con `--sessions-dir PATH`:

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

LUKS2 es una capa opcional sobre Raw `changes.img`, DynFileFS `virtual.dat`, o el dispositivo directo DynBlk. Solo está disponible cuando `/run/initramfs/etc/minios-initramfs-crypt`contiene `luks-layer-v1`y las herramientas y capacidades del backend seleccionado están disponibles.

La creación interactiva de LUKS solicita la contraseña dos veces. Las operaciones que leen o crean datos LUKS pueden leerla desde la entrada estándar con `--password-stdin`.
Las contraseñas no se colocan en los argumentos de comando ni en los metadatos de sesión. Al arrancar, el initrd solicita la contraseña en la consola. Tres intentos fallidos detienen el arranque de forma fatal; MiniOS no continúa con texto plano, RAM, otro backend ni una sesión de reemplazo bajo la misma petición.

Las exportaciones cifradas contienen archivos lógicos de sesión descifrados, no el backend cifrado. Importar, copiar o convertir a LUKS crea un nuevo backend cifrado con nuevas identidades.

## Copias de seguridad y sesiones fallidas

Para sesiones nativas, DynFileFS, DynBlk y raw, incluidas las cifradas, usa `export`para copias de seguridad lógicas en lugar de copiar el directorio de sesión montado. Conserva el archivo resultante en otro dispositivo y verifica que pueda importarse antes de confiar en él. La importación siempre crea una nueva sesión numerada; actívala explícitamente cuando esté lista para usarse.
Para procedimientos de copia de seguridad de SquashFS y de dispositivo completo, consulta [Respaldo de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si una sesión falla después de llenarse el almacenamiento, se interrumpe una escritura o se crean sesiones vacías repetidamente, deja de modificar el almacenamiento afectado. Exporta primero una sesión legible que no esté en uso si es posible, luego sigue [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

Inicia el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

En el arranque, los sistemas de archivos de contenedores se verifican antes de la activación con permisos de escritura. Los fallos graves en la comprobación del sistema de archivos conservan el contenedor para recuperación en lugar de montarlo en modo escritura. SquashFS detecta un estado previo sin limpiar y restaura la última instantánea guardada correctamente. Elimina sesiones solo mediante el Gestor de sesiones de MiniOS o `minios-session delete`; no elimines directorios de sesión manualmente.
