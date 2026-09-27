---
updated: 2026-09-26
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

| Modo | Almacenamiento | Restricciones principales | Capa MiniOS LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Los cambios se almacenan directamente en el directorio de la sesión | Requiere un sistema de archivos con permisos de escritura que conserve la metadata y operaciones de Linux que detecta MiniOS. La capacidad depende del espacio libre disponible; `perchsize` no aplica. | No |
| `dynfilefs` | ext4 expandible `virtual.dat` respaldado por archivos de segmento formato-400 | Funciona en sistemas de archivos POSIX con escritura, FAT32, NTFS y exFAT. El payload es ligero, pero el índice de mapeo escala según la capacidad lógica declarada. | Sí |
| `dynblk` | Sistema de archivos ext4 delgado sobre un dispositivo de bloque del kernel respaldado por `volumeNNN.db` archivos | Requiere la CLI DynBlk, el módulo del kernel y capacidad initrd. El tamaño creado al arrancar es de hasta 16 GiB por defecto; el máximo lo informa `dynblk limits`. Los mapeos residentes en disco usan una caché de metadatos limitada. | Sí |
| `vmdk` | Sistema de archivos ext4 delgado sobre un VMDK estándar sparse dividido, expuesto por el driver DynBlk | Utiliza `volume.vmdk` y `volume-sNNN.vmdk`. Sin compresión. Requiere `vmdk-session-v1` en el marcador de capacidad initrd en ejecución. El mismo valor manual predeterminado de 16 GiB que DynBlk; consulta `dynblk limits --format vmdk` para límites. | Sí |
| `raw` | Archivo único `changes.img` que contiene ext4 | Capacidad lógica fija con crecimiento solo explícito. Funciona en sistemas de archivos POSIX con escritura, FAT32, NTFS y exFAT; FAT32 está limitado a 4000 MiB. | Sí |
| `squashfs` | Instantánea comprimida en `changes.sb`; la capa superior writable en tiempo de ejecución se reconstruye en RAM | `perchsize` no aplica. Las instantáneas existentes pueden restaurarse desde medios compatibles con escritura; el guardado exacto requiere un almacenamiento persistente compatible con POSIX. | No |

Raw, DynFileFS, DynBlk y VMDK pueden llevar opcionalmente una capa de cifrado LUKS2. El backend de almacenamiento sigue siendo el modo de sesión, y los metadatos de la sesión registran el cifrado por separado. DynFileFS y raw creados con `minios-session` tienen un valor predeterminado de 4000 MiB; DynBlk y VMDK por defecto a 16 GiB. Los valores de tamaño se asignan en MiB; `GB` y `TB` los sufijos convierten a 1000 y 1.000.000 MiB. Raw está limitado a 4000 MiB en FAT32, esté cifrado o no. Los datos de payload DynFileFS crecen bajo demanda, pero su índice formato-400 se dimensiona para la capacidad lógica total y consume aproximadamente 2 MiB de RAM más unos 2 MiB de almacenamiento de respaldo por GiB. DynBlk mantiene las tablas de mapeo en disco y una caché de metadatos limitada en RAM, por defecto a 1 MiB en vez de un porcentaje de RAM. Sus vectores de extensión/archivo y directorios crecen con las partes declaradas, mientras que el llenado del payload no requiere un mapa residente completo. Consulta el límite de capacidad instalada con `dynblk limits --format dynblk`. Las escrituras reales siguen limitadas por el espacio libre del sistema de archivos subyacente y la admisión de recursos del backend. Las operaciones de redimensionamiento del contenedor solo pueden aumentar una sesión; no se admite la reducción.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Utiliza DynFileFS cuando el sistema de archivos de persistencia no puede representar la metadata de Linux.
Utiliza DynBlk si necesitas un dispositivo de bloque real del kernel con archivos de respaldo thin; el driver puede mantener varios volúmenes DynBlk independientes conectados a la vez, y el Gestor de sesiones utiliza la ruta de dispositivo devuelta por el driver en vez de asumir que `/dev/dynblk0` está libre. DynBlk y VMDK no están disponibles mientras UEFI Secure Boot está activado porque MiniOS no firma el módulo externo del kernel DynBlk. Por ello, el instalador y el Gestor de sesiones ocultan estos modos y rechazan solicitudes de creación explícitas antes de intentar cargar el módulo.
Utiliza raw cuando se requiere asignación fija, añade LUKS2 si la sesión debe estar cifrada y usa SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear ninguna sesión en medios de solo lectura. El initrd puede leer y activar una instantánea SquashFS existente almacenada en FAT, exFAT o NTFS con escritura porque extrae la instantánea en una capa superior ext4 temporal. Crear o guardar exactamente una instantánea es diferente: el almacenamiento persistente debe soportar la metadata POSIX requerida y la publicación privada y duradera. El árbol de trabajo de captura exacta utiliza RAM confiable cuando está disponible, con un espacio de trabajo en disco como respaldo si RAM es insuficiente.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita la gestión de persistencia. Los menús de arranque de MiniOS normalmente ofrecen entradas para reanudar, nueva, selección y modo no persistente. La descripción canónica de los selectores, compatibilidad, fallback y semántica de activación está en [Persistencia initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|---------|
| `perch` | Utiliza la ruta de reanudación legacy best-effort. Intenta el valor por defecto de los metadatos, pero no crea un reemplazo si ninguno es utilizable. |
| `perchdir=resume` | Reanuda el valor por defecto de los metadatos y, si está ausente o es incompatible, permite que el initrd cree un reemplazo compatible. Este es el comportamiento actual de reanudación en el menú de arranque. |
| `perchdir=new` | Asigna una nueva sesión numerada. |
| `perchdir=ask` | Selecciona una sesión existente o crea una durante el arranque. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Usa una ubicación de persistencia en un dispositivo, incluyendo `/dev/...` y `label:...` formatos gestionados por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra con LUKS2 una sesión Raw, DynFileFS, DynBlk o VMDK recién creada. Las sesiones existentes solo heredan el cifrado desde los metadatos. |
| `perchcomp=<codec>` | Selecciona la compresión backend DynBlk para una nueva sesión DynBlk. La compresión se fuerza a `none` cuando DynBlk está envuelto en LUKS2. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples se asignan en MiB y `MB`, `GB`, y `TB` se aceptan sufijos. |

Si no se especifica modo para una nueva sesión, el arranque usa el modo nativo. En FAT32/NTFS/exFAT, la creación nativa cae en DynFileFS. Un nuevo contenedor raw tiene por defecto 4000 MiB. Las nuevas sesiones de arranque DynFileFS, DynBlk y VMDK sin `perchsize` usan hasta 16 GiB; si queda menos espacio después de la reserva de seguridad, el tamaño automático se reduce. DynFileFS también tiene en cuenta la sobrecarga de su índice y el límite de RAM. El crecimiento explícito de DynBlk sigue el límite backend instalado, consultable con `dynblk limits --format dynblk`. Bajo Secure Boot, initrd no ofrece DynBlk/VMDK y trata una sesión DynBlk/VMDK explícita o reanudada como no disponible en vez de intentar cargar el módulo sin firmar.
Las sesiones SquashFS pueden capturarse desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`. La configuración de initrd solo crea los metadatos de sesión de generación cero y mantiene la capa superior editable en RAM. El sistema en ejecución crea la primera `changes.sb` instantánea bajo demanda o al apagar.

Al reanudar, MiniOS comprueba la versión registrada, edición, sistema de archivos union y modo. El parámetro literal `perchdir=resume` puede crear una nueva sesión en vez de usar un valor por defecto ausente o incompatible. El uso simple de `perch`, la selección numérica directa y otras solicitudes legacy de reanudación no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación falla, el arranque continúa normalmente con una capa superior RAM y una advertencia de persistencia.

El almacén de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los IDs por defecto y en ejecución, así como el modo, versión, edición, sistema de archivos union, tamaño, estado y ajustes específicos por modo de cada sesión.
Son metadatos persistentes comprometidos por la implementación de arranque, no prueba por sí mismos del estado actual en tiempo de ejecución. No los edites ni muevas datos de sesiones numeradas mientras una sesión esté montada; utiliza el Gestor de sesiones de MiniOS o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La sesión **activa** es la seleccionada por defecto para el próximo arranque.
- Conceptualmente, la sesión **en ejecución** es la que realmente proporciona persistencia al arranque actual mediante su capa editable.

El campo persistente `running=` registra esa relación prevista. Un fallo, error al construir la unión, almacenamiento copiado o un apagado interrumpido pueden dejarlo desactualizado, incluso si el arranque actual está usando RAM u otra sesión. Por eso, operaciones como el guardado de SquashFS requieren el estado protegido del arranque actual, vinculado al ID de arranque y con la capa superior montada y verificada; no confían solo en `running=` . Consulta [Estado activo, en ejecución y del arranque actual](/reference/boot-process/Persistence-Internals#estado-activo-en-ejecución-y-de-arranque-actual).

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

`create`sin modo selecciona nativo. La creación de SquashFS captura los cambios actuales en vivo y no tiene tamaño fijo. Su política de apagado por defecto es `shutdown`; el guardado periódico está desactivado por defecto.

Guardar y configurar una sesión SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240`, y `480` minutos; `0` desactiva el guardado periódico. Las configuraciones de apagado y periódicas son independientes.

Exportar e importar `.tar.zst`archivos:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Solo se aceptan importaciones de `.tar.zst`. Las rutas y los miembros del archivo se validan y la extracción está limitada. `--auto-convert`elige un modo compatible para el sistema de archivos actual. `--force-mode <mode>`selecciona explícitamente un modo disponible. Exportar, copiar y convertir no están soportados para sesiones SquashFS; guarda la instantánea y copia el directorio de sesión inactivo completo en su lugar.

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

`copy`es una copia lógica del sistema de archivos y siempre asigna un nuevo ID de sesión. Puede cambiar backend, capacidad o cifrado y crea identidades nuevas de ext4 y LUKS. `clone`copia físicamente un backend separado y conserva su cabecera LUKS, keyslots, UUID de LUKS y UUID de ext4. `convert`reemplaza la fuente por defecto; usa `--new-session`para conservar la fuente. El tamaño solo es relevante para un destino contenedor.

Ampliar, eliminar o limpiar sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El redimensionamiento es compatible con sesiones DynFileFS, DynBlk, VMDK y raw, incluidas las cifradas, y requiere un tamaño mayor al actual. El redimensionamiento de DynBlk primero amplía el dispositivo de bloque virtual y luego expande su sistema de archivos ext4; no preasigna la nueva capacidad virtual. La limpieza por defecto elimina sesiones con más de 30 días.

Todos los comandos aceptan `--json`, y se puede seleccionar una tienda de sesiones diferente con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamiento de guardado SquashFS

Una sesión SquashFS se desempaqueta en RAM para la capa writable en ejecución. Al guardar, se reconstruye y valida una instantánea exacta, que luego reemplaza de forma atómica a `changes.sb`.
No se conserva ninguna generación de reversión. Guardar ahora está disponible desde el icono de la bandeja, el Gestor de sesiones de MiniOS o `minios-session save` independientemente de la política automática.

En cada guardado, MiniOS copia una vista estable del árbol modificado en el almacenamiento privado RAM cuando la memoria lo permite. La compresión escribe **una** imagen en un directorio privado dentro de la sesión numerada. Solo después de verificar el contenido del sistema de archivos, el resumen, la identidad y la sincronización duradera, el guardado reemplaza a `changes.sb`. No hay una segunda imagen comprimida completa en RAM ni una segunda escritura de esa imagen en el dispositivo de persistencia. Si hay poca RAM para el árbol, solo ese árbol de trabajo pasa a disco; el candidato comprimido aún requiere una escritura. Consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para políticas de caché y escritura de registros.

Los diagnósticos de arranque para una sesión duradera SquashFS se almacenan bajo su `boot-logs/minios/` y `boot-logs/live/` directorios. No dependen de una instantánea de apagado exitosa y permanecen disponibles incluso cuando no se pudieron guardar los últimos cambios en la capa superior RAM. El almacenamiento de respaldo debe seguir siendo writable; los archivos de registro normales pueden ser temporales si `LIVE_LOG_STORAGE=volatile` está seleccionado.

El guardado al apagar se implementa mediante el disparador de apagado principal MiniOS y el backend `minios-squashfs-save`, por lo que no depende de que el Gestor de sesiones de MiniOS esté abierto o instalado. El guardado periódico se verifica cada 30 minutos por un temporizador systemd o un worker SysV, ambos llaman al mismo backend de autoguardado. Reconstruir la instantánea consume CPU y escribe la instantánea completa; se recomiendan intervalos de una hora o más.

Durante la operación respaldada por RAM SquashFS, una instantánea SquashFS recién capturada y activada puede tomar control del destino de guardado en ejecución. Tras ese traspaso, la instantánea anterior en ejecución puede eliminarse sin reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Esta excepción solo aplica a un traspaso válido de arranque actual SquashFS. Otros modos de persistencia en ejecución siguen protegidos contra eliminación.

## Cifrado

LUKS2 es una capa opcional sobre Raw `changes.img`, DynFileFS `virtual.dat`, o el dispositivo directo DynBlk. Solo está disponible cuando `/run/initramfs/etc/minios-initramfs-crypt`contiene `luks-layer-v1`y las herramientas y capacidades del backend seleccionado están disponibles.

La creación interactiva de LUKS solicita la contraseña dos veces. Las operaciones que leen o crean datos LUKS pueden leerla desde la entrada estándar con `--password-stdin`.
Las contraseñas no se colocan en los argumentos de comando ni en los metadatos de sesión. Al arrancar, el initrd solicita la contraseña en la consola. Tres intentos fallidos detienen el arranque de forma fatal; MiniOS no continúa con texto plano, RAM, otro backend ni una sesión de reemplazo bajo la misma petición.

Las exportaciones cifradas contienen archivos lógicos de sesión descifrados, no el backend cifrado. Importar, copiar o convertir a LUKS crea un nuevo backend cifrado con nuevas identidades.

## Copias de seguridad y sesiones fallidas

Para sesiones nativas, DynFileFS, DynBlk, VMDK y raw, incluidas las cifradas, utiliza `export` para copias de seguridad lógicas en lugar de copiar un directorio de sesión montado. Guarda el archivo resultante en otro dispositivo y verifica que pueda importarse antes de confiar en él. La importación siempre crea una nueva sesión numerada; actívala explícitamente cuando esté lista para su uso.
Para procedimientos de copia de seguridad SquashFS y de dispositivo completo, consulta [Respaldo de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si una sesión falla tras llenarse el almacenamiento, se interrumpe una escritura o se crean sesiones vacías repetidamente, deja de modificar el almacenamiento afectado. Exporta primero una sesión legible que no esté en uso si es posible y luego sigue [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

Comienza el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Al arrancar, los sistemas de archivos de contenedores se verifican antes de la activación escribible. Los fallos graves en la comprobación del sistema de archivos preservan el contenedor para su recuperación en vez de montarlo como escribible. SquashFS detecta un estado previo no limpio y restaura la última instantánea guardada con éxito. Elimina sesiones solo a través del Gestor de sesiones de MiniOS o `minios-session delete`; no elimines directorios de sesión manualmente.

## Devolución de almacenamiento no utilizado de DynBlk y VMDK

En el Gestor de sesiones, haz clic derecho en una sesión DynBlk o VMDK y elige **Liberar espacio...**.
El diálogo funciona tanto para la sesión en ejecución como para una sesión inactiva. Para una
sesión en texto plano, recorta el ext4 interno antes de pedir al driver que recupere el
espacio. Una sesión inactiva se adjunta temporalmente y luego se desconecta; el
dispositivo de la sesión en ejecución permanece conectado.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

La casilla de compactación está **desactivada por defecto**, incluso en exFAT. No hay
compactación automática de respaldo. Las sesiones cifradas solo recuperan el espacio ya
conocido por el driver; esta operación no habilita el descarte a través de LUKS ni
revela su patrón de asignación. Los errores de dispositivo y fallos en el recorte detienen la operación.

### Comandos de bajo nivel del driver

Con el backend actual DynBlk nativo o VMDK dividido, el descarte de granos completos
hace que su ubicación sea reutilizable. En un sistema de archivos ext4 de respaldo, los rangos retirados
también pueden ser liberados automáticamente. En exFAT, la limpieza automática solo trunca
colas de archivo completamente libres. **La limpieza automática nunca mueve datos activos.**

Utiliza `fstrim` en el sistema de archivos de cambios internos montado (no en la raíz combinada AUFS/OverlayFS
root) para informar de bloques eliminados, luego `dynblk reclaim /dev/dynblkN --execute`para
limpieza sin mover datos. Selecciona el dispositivo de sesión real, no un índice supuesto.
Para solicitar manualmente una compactación intensiva en escrituras, añade `--compact`.
Funciona sin convertir la imagen ni cambiar el tamaño del sistema de archivos virtual;
otras lecturas/escrituras pueden ejecutarse entre pasos de recuperación. No es un respaldo automático.
La opción `--scan-zeroes`lee granos mapeados y no está habilitada por defecto.

Estos comandos también están disponibles en la CLI DynBlk de initrd reconstruido. No se habilita
compactación automática al inicio. Las sesiones cifradas mantienen su política de descarte existente; las herramientas no habilitan silenciosamente el descarte dm-crypt.
Las políticas; las herramientas no habilitan silenciosamente el descarte dm-crypt.
Las conexiones de solo lectura o `cache=unsafe`no pueden ser recuperadas. Los rangos liberados y longitudes truncadas reportadas no son equivalentes al espacio libre medido en el sistema de archivos.
Los rangos liberados y longitudes truncadas reportadas no son equivalentes al espacio libre medido en el sistema de archivos.

## Flujos de trabajo de sesiones VMDK

VMDK es un modo de sesión independiente, no un nuevo códec de compresión. Crear, activar,
redimensionar, exportar/importar, copiar, clonar y convertir usan los mismos comandos del Gestor de sesiones
que otros modos de contenedor:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Los archivos de sesión contienen archivos lógicos y metadatos, no un adjunto VMDK externo arbitrario.
Las sesiones VMDK gestionadas usan el `volume.vmdk`descriptor
canónico y todos sus `volume-sNNN.vmdk`fragmentos. No renombres partes ni copies una imagen activa
por fuera del driver. Cambiar entre DynBlk nativo y VMDK requiere una
copia/conversión explícita; cambiar `session_mode`a mano no es conversión.

El instalador solo ofrece VMDK cuando está soportado por el entorno de ejecución y rechaza imágenes fuente
cuyos initrd copiados no tienen la `vmdk-session-v1`capacidad. Actualiza la CLI,
el driver, las herramientas de sesión y los scripts de arranque juntos antes de crear sesiones VMDK.
