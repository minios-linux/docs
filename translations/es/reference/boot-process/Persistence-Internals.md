---
updated: 2026-10-15
---

# Internos de persistencia

Esta página explica los parámetros de arranque de persistencia`perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, y `perchtoram` del sistema en vivo. Estos parámetros determinan dónde se almacenan los cambios de una sesión en vivo, cómo se crea una nueva sesión y si el almacenamiento de sesión compatible se copia en RAM. Para el uso habitual, selecciona una entrada persistente en el menú de arranque o utiliza el Gestor de sesiones de MiniOS en lugar de editarlos manualmente.

MiniOS construye el root en vivo a partir de módulos de solo lectura y una capa superior escribible.
El initrd decide si esa capa superior será una sesión persistente numerada o un directorio temporal en RAM. Esta página describe esa decisión y ruta de activación durante el arranque. Para los controles orientados al usuario, consulta [Modos de arranque](/using-minios/Boot-Modes) y [Parámetros de arranque](/reference/Boot-Parameters).

## En lenguaje sencillo

Sin un parámetro de persistencia, MiniOS guarda los cambios en RAM y los descarta al apagar. Un parámetro de persistencia indica a MiniOS que busque almacenamiento escribible, seleccione o cree una sesión numerada, verifique la compatibilidad y use esa sesión como la capa escribible.

Solicitar persistencia no garantiza que se active. Si el destino es de solo lectura, está lleno, dañado o es incompatible, MiniOS puede continuar con una capa temporal RAM. Lee la advertencia de inicio antes de confiar en los cambios guardados.

## Parámetros explicados

| Parámetro | Qué indica MiniOS | Opción habitual |
|---|---|---|
| `perchdir=resume` | Abre la sesión compatible predeterminada y, si no es posible usarla, crea una de reemplazo bajo condiciones compatibles. | Trabajo diario normal. |
| `perchdir=setup` | Permite elegir de forma interactiva el backend de persistencia y sus opciones de cifrado/compresión compatibles, luego crea una nueva sesión numerada. | Entrada actual **Iniciar nueva sesión** del menú de arranque. |
| `perchdir=new` | Crea directamente una nueva sesión numerada usando el `perchmode` solicitado o predeterminado, cifrado, compresión y tamaño, sin mostrar el selector de backend. | Entradas de arranque personalizadas o automatizadas con opciones de almacenamiento ya especificadas. |
| `perchdir=ask` | Muestra las sesiones guardadas y permite elegir una. Si no hay ninguna sesión guardada, el selector inicia el mismo flujo de configuración que `perchdir=setup`. | Varios espacios de trabajo en un solo dispositivo, incluyendo la primera configuración interactiva en un almacenamiento vacío. |
| `perchdir=NUMBER` | Solicita una sesión numerada en particular. | Entrada de arranque personalizada y estable tras verificar el ID de sesión. |
| `perchmode=MODE` | Selecciona `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. | Coincide con el sistema de archivos de respaldo y el modelo de persistencia deseado. |
| `perchencrypt=luks` | Agrega una capa LUKS2 al crear una sesión Raw, DynFileFS, DynBlk o VMDK. | Cifra un backend de contenedor compatible. |
| `perchsize=SIZE` | Solicita el tamaño de una sesión de contenedor nueva o en crecimiento. | DynFileFS, DynBlk, VMDK o raw; el cifrado no modifica la semántica del tamaño del backend. |
| `perchcomp=CODEC` | Selecciona la compresión del backend DynBlk para una sesión DynBlk recién creada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`; la disponibilidad depende del kernel en ejecución. La compresión se desactiva cuando LUKS envuelve DynBlk. |
| `perchreserve=MB` | Resta un margen al dimensionar un contenedor nuevo o en crecimiento y establece el umbral de advertencia por poco espacio. | Deja espacio de trabajo al asignar un contenedor; no es una cuota en tiempo de ejecución. |
| `perch` | Utiliza el comportamiento anterior de reanudar sin crear reemplazo automático. | Compatibilidad con una entrada personalizada existente; se recomienda `perchdir=resume` para los menús actuales. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Controla la copia de persistencia de forma independiente al sistema `toram`. | `off` mantiene la tienda original activa; `trim` copia solo la sesión compatible seleccionada; `full` copia todas las sesiones de contenedor/SquashFS compatibles. |

Cuando se solicita persistencia, el sistema `toram` lo establece `perchtoram=trim` como predeterminado, a menos que se indique explícitamente un modo de persistencia-RAM. Sin el sistema `toram`, la persistencia permanece en el almacenamiento por defecto. Una sesión copiada no es duradera mientras se ejecuta, pero el Session Manager actual puede guardar explícitamente el estado compatible respaldado por RAM en la tienda original o publicarlo como una nueva sesión cuando la tienda original esté disponible y coincida con su identidad de arranque.

## La persistencia es explícita

El initrd solo habilita el manejo de persistencia cuando la línea de comandos del kernel contiene uno de estos tokens reconocidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Si no se encuentra ninguno de esos tokens, incluso cuando solo está presente un `perch...` nombre no reconocido, MiniOS crea una nueva capa superior editable en RAM. Los cambios realizados durante ese arranque se descartan al apagar.

No todos los selectores son equivalentes:

| Selector | Comportamiento de initrd |
|---|---|
| `perch` | Intenta reanudar el valor predeterminado de los metadatos. No crea automáticamente una sesión cuando no hay ninguna utilizable o cuando fallan las comprobaciones de compatibilidad. |
| `perchdir=resume` | Intenta usar el valor predeterminado de los metadatos y puede crear automáticamente un reemplazo compatible. Este es el comportamiento actual de reanudación del menú de arranque. |
| `perchdir=setup` | Abre primero el selector de backend, registra la selección de backend/cifrado/compresión solicitada y luego sigue la ruta de asignación de nueva sesión. |
| `perchdir=new` | Asigna un directorio cuyo ID numérico es uno mayor que el ID numérico existente más alto. Nunca reutiliza un directorio existente y no abre el selector de backend. |
| `perchdir=ask` | Ofrece sesiones existentes cuando están presentes; una sesión existente incompatible requiere confirmación. Si no hay un valor predeterminado/sesión en el almacenamiento, cambia a `setup` para que la primera sesión pueda crearse de forma interactiva. |
| `perchdir=NUMBER` | Utiliza ese directorio si existe. Si no existe, la selección puede recurrir al valor predeterminado registrado en los metadatos; no reserva el número solicitado. |

Otros parámetros de persistencia reconocidos sin selector ingresan por la misma ruta heredada de reanudación que `perch`: solicitan persistencia, pero no permiten la creación automática.`perchtoram` por sí solo no es una solicitud de persistencia. Si la selección o activación no puede producir una capa superior utilizable, el arranque continúa normalmente con la capa superior RAM y se publica una advertencia de fallo.

## Almacenamiento y ubicación de sesiones

El almacenamiento normal es el directorio `changes` junto a los datos de MiniOS, con directorios de sesión numerados y `session.conf` o `session.json` metadatos:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

El almacenamiento también puede seleccionarse como un dispositivo más una ruta opcional. Se aceptan formas como una ruta directa `/dev/...` , `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, y `askdisk:custom:path`. El sufijo delimitado por dos puntos se convierte en una ruta bajo el dispositivo seleccionado; la sintaxis de barra después de `askdisk` omite silenciosamente esa ruta personalizada. Un subdirectorio seleccionado se monta mediante bind como almacenamiento de sesiones. MiniOS también puede detectar una partición de persistencia en la misma unidad y almacenamiento de persistencia Ventoy compatible.

Antes de seleccionar la sesión, el initrd debe montar la ubicación como escribible y comprobar que puede crear y eliminar un marcador en el almacenamiento. Un dispositivo de bloques que no pueda abrirse en modo escritura, un montaje de solo lectura, una ruta no disponible o una prueba de escritura fallida rechazan la persistencia para ese arranque. Las sesiones existentes no se consideran confiables solo porque sus archivos sean legibles.

## Selección y compatibilidad

Los metadatos de la sesión registran el modo de almacenamiento y pueden registrar la versión MiniOS, la edición, el sistema de archivos union y el tamaño del contenedor. Al reanudar, se comparan el modo, la versión, la edición y el union registrados con el modo solicitado y el sistema actual.
Los campos de compatibilidad heredados que faltan no se consideran incompatibilidades.

Literal `perchdir=resume` crea una nueva sesión numerada cuando su valor predeterminado no está presente o cuando una incompatibilidad en el modo, versión, edición o union registrado hace que ese valor predeterminado no sea adecuado. Un `perch`, una selección numérica directa y otras solicitudes heredadas de reanudación rechazan el reemplazo automático y continúan en RAM tras un fallo en la selección. `perchdir=ask` muestra información de compatibilidad y permite una anulación explícita. Una nueva sesión utiliza por defecto `native` salvo que se haya solicitado otro modo.

El modo de almacenamiento forma parte de la compatibilidad. Si la selección llega al despacho del backend, un modo solicitado desconocido recurre a `native`, cuyo sondeo puede seleccionar DynBlk o DynFileFS si el almacenamiento no es adecuado. Una sesión existente con un modo registrado diferente puede fallar en la comprobación de compatibilidad anterior; en ese caso, una solicitud heredada de reanudación continúa en RAM en lugar de llegar a ese modo alternativo.

### Restableciendo una sesión incompatible

La selección interactiva ofrece **Restablecer, conservar ajustes** y **Restablecer, conservar datos**, además de regresar a la lista o continuar explícitamente sin restablecer. El restablecimiento se ejecuta antes de la activación de la unión. Elimina los árboles de programas/bibliotecas del sistema, el estado del gestor de paquetes del sistema, el software Flatpak/Snap a nivel de sistema y las cachés. Las listas de archivos de paquetes ayudan a identificar software instalado en otros lugares; los archivos no listados se conservan de forma preventiva.

Ambos modos conservan `/home` y `/root`, incluyendo configuración oculta, cachés, perfiles de navegador y programas instalados en el directorio personal. También mantienen cuentas, asignaciones UID/GID, contraseñas, claves de host SSH, claves privadas TLS y datos conservados fuera de los árboles personales. El modo que preserva ajustes mantiene la configuración habitual de `/etc` y la configuración de paquetes; el modo solo datos restablece esos ajustes de sistema mientras conserva la configuración personal en los árboles de usuario. Esto no identifica todos los programas instalados manualmente en ubicaciones arbitrarias.

Se prepara una capa superior de reemplazo junto a la original, lo que requiere espacio libre para una segunda copia de los datos conservados. Si falla la copia o el reemplazo, se revierte; las transacciones interrumpidas se recuperan en el siguiente montaje. El restablecimiento de SquashFS modifica solo su capa superior reconstruida RAM: la instantánea anterior y los metadatos de compatibilidad siguen siendo válidos hasta que se guarda correctamente esa capa superior restablecida. Un restablecimiento de sesión nativa desactiva `perchtoram` para ese arranque, evitando reemplazar los datos conservados por un contenedor RAM vacío. La reanudación automática nunca restablece una sesión de forma silenciosa.

## Reserva de espacio y tamaños

MiniOS utiliza 256 MiB como margen de asignación predeterminado y umbral de advertencia por poco espacio. El cálculo emplea bloques de sistema de archivos de 1024 bytes. `perchreserve` acepta un número entero sin signo y sin unidad, tiene un límite máximo de 4096 y vuelve a 256 si falta o es inválido. El margen reduce el espacio ofrecido a un contenedor nuevo o en crecimiento. No es una cuota: una sesión nativa o escrituras posteriores aún pueden consumir el espacio restante del sistema de archivos. El arranque advierte cuando el espacio libre actual está en o por debajo del umbral.

Los tamaños de los contenedores se expresan en cantidades enteras asignadas en MiB:

- Un número sin unidad, `M`, o `MB` indica MiB.
- `G` o `GB` multiplica el número por 1000 MiB.
- `T` o `TB` multiplica el número por 1.000.000 MiB.
- Los contenedores Raw tienen un límite máximo de 1.000.000 MiB y también están limitados por el espacio disponible después de la reserva. DynFileFS tiene un límite separado dependiente de RAM y un tope absoluto de 2.000.000 MiB. DynBlk obtiene su límite de geometría en formato nativo de `dynblk limits --format dynblk`; MiniOS no impone un tope separado de 512 GiB.
- Raw es un único archivo de respaldo, por lo que FAT32 lo limita a 4000 MiB en MiniOS. El mismo límite se aplica cuando Raw está envuelto en LUKS2.
- Una nueva sesión raw tiene por defecto 4000 MiB. El cifrado no crea una política de tamaño LUKS separada: un Raw cifrado, DynFileFS, DynBlk o una sesión VMDK mantienen las reglas de tamaño de su backend subyacente.
- Una nueva sesión DynFileFS creada por initrd sin `perchsize` utiliza hasta 16 GiB de capacidad lógica. Si el almacenamiento de respaldo no puede finalmente contener esa cantidad después de `perchreserve` y la sobrecarga de índice de DynFileFS, el valor predeterminado se reduce a la capacidad disponible. Su índice formato-400 consume aproximadamente 2 MiB de RAM y unos 2 MiB de almacenamiento de respaldo por cada GiB de capacidad lógica declarada, incluso cuando la carga útil está vacía. Por lo tanto, MiniOS también limita la capacidad de DynFileFS según el RAM físico y por un tope absoluto probado de 2.000.000 MiB.
- Una nueva sesión DynBlk sin `perchsize` sigue el mismo tope automático de 16 GiB y se reduce si queda menos espacio de respaldo después de `perchreserve`. El tamaño explícito de DynBlk es una solicitud de capacidad thin comprobada contra el límite del backend instalado. Los metadatos de las partes declaradas se crean inicialmente, pero el espacio de carga útil crece bajo demanda. DynBlk mantiene una caché de metadatos acotada, independiente del llenado de la carga útil.

El crecimiento de los contenedores es bajo el principio de mejor esfuerzo y no se admite la reducción de tamaño. `perchsize` no dimensiona sesiones nativas ni de SquashFS. El Gestor de sesiones de MiniOS asigna por defecto 4000 MiB a los contenedores raw y de DynFileFS creados manualmente, y 16 GiB a los contenedores DynBlk/VMDK; las variantes cifradas utilizan los mismos valores predeterminados del backend. Consulte [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de almacenamiento

Todos los backends exitosos deben proporcionar el "upper" escribible esperado por el sistema de archivos en unión seleccionado. Montar un backend por sí solo no prueba que la persistencia esté activa. Native, DynFileFS, DynBlk, VMDK y raw pueden actualizar los metadatos de sesión persistente antes de la validación de la unión; SquashFS retrasa ese guardado de metadatos. Raw, DynFileFS, DynBlk y VMDK pueden además usar cifrado LUKS2. El estado protegido del arranque actual solo se publica después de confirmar que la unión raíz final utiliza el "upper" esperado.

| Backend | Representación persistente | Modelo de capacidad | Requisitos del almacenamiento de respaldo | Capa LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Archivos y directorios directamente en el directorio de sesión numerado | Utiliza directamente el espacio del sistema de archivos de respaldo; `perchsize` no aplica | Sistema de archivos escribible que pasa la prueba de comportamiento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` más archivos de segmento que exponen un ext4 `virtual.dat` | Carga útil ligera con un índice denso del tamaño de la capacidad | Almacenamiento escribible POSIX, FAT32, NTFS o exFAT | Sí |
| `dynblk` | Formato-1 `volumeNNN.db` archivos que exponen `/dev/dynblkN`, con ext4 encima | Dispositivo de bloque virtual ligero con asignaciones residentes en disco y una caché limitada | Sistema de archivos aceptado por el backend del kernel DynBlk y suficientes recursos de backend | Sí |
| `vmdk` | `volume.vmdk` más archivos dispersos divididos `volume-sNNN.vmdk` extensiones expuestas por el controlador DynBlk, con ext4 encima | Dispositivo de bloque virtual ligero y disperso dividido | Sistema de archivos aceptado por el backend VMDK DynBlk y la `vmdk-session-v1` capacidad | Sí |
| `raw` | Único archivo de tamaño fijo `changes.img` que contiene ext4 | El archivo se crea con el tamaño lógico solicitado; solo permite crecimiento | Sistema de archivos escribible capaz de alojar la imagen; FAT32 está limitado a 4000 MiB | Sí |
| `squashfs` | Instantánea comprimida `changes.sb`; el "upper" escribible en tiempo de ejecución se reconstruye en RAM | El tamaño de la instantánea sigue los cambios capturados; `perchsize` no aplica | Las instantáneas existentes pueden leerse desde medios escribibles compatibles; el guardado exacto requiere un almacén de persistencia compatible con POSIX | No |

### Nativo

El modo nativo almacena directamente el contenido modificable de la unión en el directorio de sesión numerado. No hay imagen interna, dispositivo loop, contenedor FUSE ni sistema de archivos en bloque separado, por lo que la capacidad simplemente depende del espacio libre en el sistema de archivos subyacente y `perchsize` no aplica. Esto ofrece la menor sobrecarga de contenedor y mantiene la visibilidad habitual de los archivos para recuperación y respaldo.

MiniOS primero excluye sistemas de archivos no POSIX conocidos como FAT, exFAT y NTFS. Luego, verifica el comportamiento real del sistema de archivos creando un archivo y un enlace simbólico, y comprobando cambios en el modo ejecutable. Si la comprobación tiene éxito, el directorio de sesión numerado se monta directamente como área de escritura. En almacenamiento no apto o si falla la comprobación, la creación nativa prefiere DynBlk cuando su CLI existe y Secure Boot lo permite; de lo contrario, DynFileFS. Esta primera alternativa no garantiza que el controlador seleccionado pueda adjuntarse ni que todos los sistemas de archivos subyacentes sean compatibles. Si ocurre un fallo después de la activación nativa, se revierte; un candidato vacío nuevo se elimina cuando es seguro hacerlo.

La capa de persistencia LUKS2 MiniOS no envuelve el modo nativo porque este no tiene un contenedor ni un límite de dispositivo de bloque para cifrar. La persistencia nativa aún puede residir en almacenamiento cifrado fuera de esta capa de persistencia.

### DynFileFS

DynFileFS es el backend de contenedor formato-400 basado en FUSE. Expone una única imagen lógica `virtual.dat` mientras almacena los datos en `changes.dat` más archivos de segmento numerados. El helper debe montar correctamente y exponer `virtual.dat`; de lo contrario, la activación fallará en vez de crear accidentalmente un archivo solo RAM con un nombre que parece persistente.

Su índice de mapeo es denso respecto a la capacidad lógica declarada: cada bloque lógico de 4 KiB tiene un desplazamiento de 8 bytes. Esto equivale a unos 2 MiB de índice RAM por GiB de capacidad virtual, y aproximadamente la misma cantidad se almacena en los índices de los segmentos de respaldo incluso antes de escribir los datos del payload. La asignación del payload sigue siendo dinámica. Debido a que el binario initrd estático es i686, MiniOS también aplica un límite de tamaño lógico compatible con RAM y un techo rígido de 2.000.000 MiB, por debajo del punto de fallo del espacio de direcciones probado.

La imagen lógica contiene ext4. Las imágenes existentes se verifican antes de montar en modo escritura; si el resultado del chequeo del sistema de archivos supera el estado de errores corregidos, la sesión se rechaza en lugar de montarse en modo escritura. El redimensionamiento solo permite crecimiento, y el sistema de archivos ext4 interno se expande cuando es posible. Para diagnóstico orientado al usuario, consulte [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

El `dynblk` modo utiliza un dispositivo de bloque del kernel, independiente de DynFileFS. Cada sesión numerada es propietaria de `volume000.db` y de todos sus elementos numerados relacionados (`volume001.db`, ..., `volume1000.db`, y los siguientes). El formato nativo es `DBSPRS01`, formato de disco **1**. Los formatos no compatibles se rechazan en lugar de convertirse silenciosamente. Mantén las versiones instaladas de la CLI y el módulo sincronizadas.

MiniOS crea ext4 en todo el disco devuelto por `/dev/dynblk-control`, como por ejemplo `/dev/dynblk3`; no asume que `dynblk0` está libre. Se verifica el ext4 existente antes de permitir escritura. El estado protegido de arranque registra ese dispositivo exacto, por lo que el apagado lo desconecta solo después de que sus usuarios y el sistema de archivos superior se hayan cerrado. Pueden coexistir varios dispositivos independientes.

Session Manager, el instalador y el initramfs consultan `dynblk limits --format dynblk` para conocer el límite de geometría del backend instalado. El guardián de recursos actual permite 65536 partes: los tramos lógicos estándar de 1 GiB permiten hasta 64 TiB. Límites físicos menores reducen el máximo virtual. Esto es un techo de geometría, no una garantía de que el host pueda abrir tantos archivos o disponga de suficiente RAM/almacenamiento. Se admite el crecimiento; la reducción no está soportada.

Las tablas de asignación residen en disco. `--map-memory-mb` controla una caché de metadatos por dispositivo (por defecto 1 MiB, rango 1..64 MiB), ya no es un porcentaje de RAM ni un límite sobre los datos mapeados. Las descripciones de extensiones, los vectores de archivos abiertos y los directorios pequeños crecen según la geometría declarada, no por la cantidad de datos almacenados. Al adjuntar, se escanea el mapeo de metadatos y se reconstruye temporalmente el estado de asignación parte por parte; no se lee toda la carga útil. Un `dynblk check` completo sí lee las cargas útiles. `engine_memory_bytes` no incluye la caché de páginas del sistema de archivos, los internos del códec ni otras asignaciones del kernel.

Los archivos de metadatos de todas las partes declaradas se inicializan al crear o ampliar; los datos reales permanecen ligeros. Las partes están limitadas a 4000 MiB. Realiza una copia de seguridad de todo el espacio de nombres desconectado, sin asumir números de tres dígitos ni una parte final fija. Un volumen nuevo puede seleccionar compresión con `perchcomp`; las cargas posteriores utilizan el códec almacenado. LUKS2 sobre DynBlk fuerza la compresión a `none`. Las escrituras parciales en datos comprimidos actualmente recomprimen el bloque correspondiente de 64 KiB. El agotamiento de almacenamiento o recursos aún puede provocar fallos en las escrituras; el sistema de archivos superior debe desmontarse antes de desconectar.

### Sesiones VMDK

El modo de sesión `vmdk` utiliza el mismo controlador con imágenes reales de `twoGbMaxExtentSparse`
. Su principal característica es `volume.vmdk`, con `volume-s001.vmdk` y partes subsiguientes
; cada parte cubre hasta 2 GiB de espacio lógico. El descriptor está limitado
a menos de 1 MiB, por lo que la longitud del nombre de archivo y la cantidad de extensiones restringen la capacidad.
Session Manager, Installer e initramfs consultan `dynblk limits --format vmdk`.
El formato nativo DynBlk sigue utilizando `volume000.db`; ninguno de los formatos interpreta los archivos del otro
tipo. Las sesiones gestionadas no importan una VMDK arbitrariamente particionada externamente
como metadatos de sesión.

El soporte para sesiones VMDK es anunciado por `vmdk-session-v1` en
`/etc/minios-initramfs-dynblk` dentro del initrd. El entorno de ejecución actual y cada
initrd de origen copiado por Installer deben soportarlo. VMDK no tiene compresión nativa;
`perchcomp` se ignora con una advertencia al arrancar y Session Manager rechaza un
VMDK no-`none`. LUKS2 sigue siendo una capa de cifrado separada y opcional. Ambos modos publican
su modo de sesión real y el propietario de `dynblk_device` en el estado protegido de arranque,
y ambas implementaciones de apagado cierran ese dispositivo después de que sus usuarios finalizan.

Ambos formatos de controlador admiten `writeback`, `writethrough`, `none`, `directsync` y políticas de adjunción explícitas de `unsafe`dispositivos. Los modos directos actualmente requieren ext2/ext4 como base. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` adjunta un sistema de archivos existente; `umount` libera el dispositivo gestionado por el asistente después de que su último usuario lo cierra. El modo manual de `dynblk load` tiene una vida útil explícita. Esto no crea un sistema de archivos ni desbloquea LUKS.

El respaldo en tmpfs es compatible para ambos formatos con `writeback`, `writethrough` y `unsafe`; los modos directos de I/O se rechazan en lugar de cambiarse silenciosamente. El orden de vaciado (flush) no hace que una sesión respaldada en tmpfs sea duradera tras el apagado. Este soporte es la base de las sesiones DynBlk/VMDK RAM, cuyos cambios deben guardarse explícitamente en el almacenamiento original.

### Raw

El modo Raw utiliza un único `changes.img` archivo que contiene ext4. La longitud del archivo se establece según la capacidad lógica solicitada al momento de la creación, por lo que, a diferencia de los backends dinámicos, la capacidad es fija hasta que se realice una operación explícita de ampliación. El sistema de archivos subyacente puede representar los bloques no escritos de forma dispersa, pero MiniOS sigue considerando Raw como un almacenamiento de capacidad fija y verifica el espacio disponible antes de crear o ampliar. Como todo reside en un solo archivo en el host, FAT32 está limitado a 4000 MiB.

Las imágenes Raw existentes se verifican con `e2fsck` antes de montar en modo escritura. La ampliación extiende `changes.img` y luego expande ext4 con `resize2fs`; la reducción no está soportada. Si falla la verificación o el montaje, la imagen se conserva para recuperación y el arranque continúa en RAM. Raw no utiliza demonio FUSE ni metadatos personalizados de almacenamiento en bloques, lo que simplifica su modelo de recuperación, pero carece del comportamiento de capacidad dinámica de DynFileFS y DynBlk.

### Capa de cifrado LUKS

LUKS2 es una capa de cifrado opcional que se selecciona con `perchencrypt=luks` al crear una sesión Raw, DynFileFS, DynBlk o VMDK. Las sesiones existentes toman su estado de cifrado de los metadatos de la sesión; especificar `perchencrypt` posteriormente no reinterpreta ni convierte una sesión existente en texto plano.

El límite de cifrado depende del backend: Raw conecta `changes.img` mediante un dispositivo de bucle y coloca LUKS2 dentro de ese archivo; DynFileFS conecta su `virtual.dat` expuesto a través de un dispositivo de bucle y cifra esa imagen lógica; DynBlk utiliza su `/dev/dynblkN` dispositivo de bloques asignado directamente; VMDK utiliza el dispositivo de bloques expuesto por el mismo controlador DynBlk para su imagen dispersa dividida. En los cuatro casos, MiniOS crea ext4 dentro de `/dev/mapper/...`, por lo que el contenido y los metadatos del sistema de archivos dentro del mapper están cifrados en reposo. Los metadatos del backend fuera del límite LUKS, descriptores VMDK, archivos de arranque, metadatos de sesión y otros archivos en el medio de persistencia permanecen sin cifrar.

Los valores predeterminados de tamaño, límites de crecimiento, restricciones de FAT32 y el comportamiento de asignación thin/fixed siguen perteneciendo al backend subyacente. El initrd autentica antes de ampliar un backend cifrado existente, cierra el mapper antes del crecimiento del backend, luego lo vuelve a abrir, verifica ext4 y expande el sistema de archivos antes de montarlo. Para DynBlk cifrado, la compresión del backend se fuerza a `none`.

Durante la creación se solicita la frase de acceso dos veces. Las sesiones cifradas existentes permiten tres intentos de desbloqueo en la consola de arranque. Si se rechazan tres frases de acceso, se activa una ruta de arranque fatal: MiniOS no continúa en RAM, no reinterpreta la misma sesión como texto plano, no selecciona otro backend ni crea un reemplazo. Otros fallos de creación, verificación, redimensionamiento o montaje mantienen su comportamiento de recuperación específico del backend, sin recurrir a texto plano. Las frases de acceso no se almacenan en los metadatos de la sesión ni se pasan como argumentos de comando. Las exportaciones lógicas contienen archivos de sesión descifrados en lugar de una imagen de backend cifrada.

Consulta [Seguridad](/maintenance-and-recovery/Security) para conocer el límite de protección y consideraciones de respaldo.

### SquashFS

El initrd normalmente activa una sesión existente de SquashFS. La configuración interactiva crea metadatos de generación cero con guardado al apagar habilitado, pero no crea `changes.sb`; la capa superior editable solo existe en RAM hasta que el sistema en ejecución realiza el primer guardado bajo demanda o al apagar. Una sesión de generación cero solo es válida cuando los campos de artefactos de instantánea y `changes.sb` están ausentes. Para generaciones posteriores, la activación valida metadatos estrictos y de valor único para la instantánea, incluyendo su resumen, tamaños comprimido y descomprimido, cantidad de entradas, tipo de unión y política de guardado. También verifica el tipo de archivo y el tamaño exacto, la RAM y el swap disponibles, el resumen SHA-256 antes y después de la extracción, y la compatibilidad actual de la unión.

La instantánea se extrae con manejo estricto de errores y xattr en una imagen ext4 temporal y limitada dentro de RAM. Para OverlayFS, esa imagen contiene directorios separados de `changes` y `workdir`; para AUFS, su raíz es la rama editable.
Metadatos malformados, memoria insuficiente, cambios en el resumen, errores de extracción o una política no válida hacen que la activación falle y dejan el arranque en su capa superior ordinaria de RAM.

Una sesión marcada como `dirty` significa que el arranque anterior no completó la transición de apagado limpio. Entonces, SquashFS advierte y restaura la última `changes.sb` guardada exitosamente; los cambios no guardados del arranque interrumpido no constituyen una segunda generación de reversión.

El Gestor de sesiones de MiniOS y el backend de guardado del sistema crean y reemplazan atómicamente instantáneas de SquashFS usando captura exacta. La activación del arranque puede leer una instantánea existente desde almacenamiento FAT, exFAT o NTFS editable porque la extracción ocurre en la capa superior ext4 temporal. La creación y el guardado exacto siguen dependiendo del sistema de archivos: el almacén de sesiones debe permitir la creación de espacios de trabajo privados, metadatos de Linux y publicación duradera en un sistema de archivos POSIX adecuado.

Durante el guardado, el backend primero captura un árbol de archivos estable en almacenamiento de memoria privada propiedad de root cuando el initrd proporciona un tmpfs confiable con suficiente espacio disponible. Cuando RAM es insuficiente, este árbol utiliza el espacio de trabajo anterior en disco. El compresor escribe directamente en un directorio privado con modo 0700 en el sistema de archivos de la sesión, no en una imagen adicional de RAM seguida de otra copia en disco. MiniOS verifica el resultado comprimido y su identidad, lo sincroniza, lo mueve a un nombre de candidato privado y luego vuelve a validar el candidato antes de reemplazar atómicamente el `changes.sb` activo. Las copias o compresiones fallidas no reemplazan la última instantánea exitosa.

Con una sesión duradera y saludable, `/var/log/minios` y `/var/log/live` se montan con bind desde `boot-logs/` dentro de la sesión numerada. Por lo tanto, estos diagnósticos de inicio se escriben independientemente de la capa superior de RAM y de la instantánea de apagado. Un arranque cuyo almacén de persistencia no fue activado de forma duradera no puede garantizar que esos registros sobrevivan a un reinicio. Los registros y cachés ordinarios pueden configurarse por separado; consulte [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS no tiene `perchsize`: su tamaño almacenado depende de los cambios capturados y comprimidos, mientras que la memoria en tiempo de ejecución la determina la capa superior editable extraída. La capa de persistencia LUKS de MiniOS no envuelve `changes.sb`; si se requiere confidencialidad de la instantánea, el almacenamiento subyacente debe estar cifrado fuera de esta capa. Consulte [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Límite de activación y recuperación de la unión

Para AUFS, la raíz de cambios activada se convierte en la rama cero editable. Para OverlayFS, el initrd construye `upperdir` y `workdir` debajo de la raíz de cambios activada y monta los módulos de solo lectura como directorios inferiores. Luego, el initrd verifica la rama activa AUFS o OverlayFS `upperdir` antes de publicar la persistencia como activa.

Si falla el backend de persistencia, la actualización de metadatos o esta verificación, los puntos de montaje se revierten cuando es posible, no se publica ningún estado de persistencia exitoso y el arranque editable continúa en RAM. Si no se logra construir la unión raíz, se ingresa al shell fatal de initramfs. Salir de ese shell puede permitir que la configuración continúe con una raíz no válida; esto no es una reparación ni una alternativa segura. AUFS conserva los anexos de ramas de módulos según el mejor esfuerzo, pero una unión incompleta cruza el límite de recuperación: MiniOS no marca la persistencia como activa.

Las fallas en la comprobación de contenedores evitan deliberadamente montar una sesión sospechosa como editable.
No reemplaces ni reconstruyas archivos de sesión durante el arranque. Primero protege el almacenamiento afectado; consulta [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Ventoy Plugin de persistencia

Un backend seleccionado por el Plugin de persistencia de Ventoy omite la detección de sesiones numeradas. MiniOS resuelve la asignación de dispositivos de Ventoy`vtoy_persistent` , requiere una imagen ext4 montada con permisos de escritura y utiliza un `changes/` directorio como capa superior de AUFS o `changes/` junto con `workdir/` para OverlayFS. No crea `minios/changes/` , `session.conf` ni sesiones numeradas dentro de esa imagen. La persistencia aún requiere una solicitud de persistencia reconocida; **Iniciar sin guardar** permanece temporal.

El primer uso registra el formato de unión en `.minios-union`. Un backend de unión diferente, ausencia de dispositivo, sistema de archivos incorrecto, imagen no editable o error al activar la unión genera una advertencia y crea una nueva capa superior de RAM. Nunca sustituye otra imagen solo porque su sistema de archivos tenga una etiqueta coincidente.

`perchdir` la selección de sesión y `perchtoram` se ignoran para una imagen de plugin seleccionada; los cambios permanecen en esa imagen incluso con `toram` del sistema. El Gestor de sesiones y `minios-session` rechazan operaciones, incluyendo directorios de sesión personalizados. Selecciona otra imagen en Ventoy para cambiar de entorno. Sin un backend de plugin seleccionado, los arranques normales de Ventoy utilizan el modelo estándar de sesiones numeradas de MiniOS. Consulta [Ventoy](/installing-minios/installation-tools/Ventoy).

<a id="active-running-and-current-boot-state"></a>

## Estado activo, en ejecución y de arranque actual

En los metadatos de sesión duradera, `default=` es la sesión **activa** seleccionada para el próximo reinicio, mientras que `running=` es la sesión registrada como la que proporciona el arranque actual. La activación escribe ambos campos y marca esa sesión como `dirty`.
Después de que los puntos de montaje de persistencia desaparecen durante un apagado limpio, MiniOS elimina `running=` y marca la sesión como `clean`.

Estos campos de metadatos pueden quedar obsoletos tras un fallo, un error al escribir los metadatos, un fallo al construir la unión, una copia de almacenamiento o un apagado interrumpido. Los componentes en tiempo de ejecución que permiten guardar no confían solo en `running=`. Utilizan el estado protegido de arranque actual del initrd, vinculado al ID de arranque, sesión numérica, modo, identidad real del almacenamiento, estado de escritura, durabilidad, generación activa verificada y, para DynBlk, el dispositivo exacto `/dev/dynblkN` adjunto. Si el registro de arranque actual falla o falta, la persistencia no debe considerarse un destino aprobado para guardar.

Con `perchtoram=trim` o `full`, los contenedores de sesión compatibles se copian en un tmpfs dedicado antes de la activación. La copia solo se permite cuando tanto la memoria disponible como el espacio libre en tmpfs cubren la longitud de los archivos de respaldo más una reserva; si la copia falla, la operación continúa en el almacenamiento con una advertencia. La sesión copiada puede proporcionar la capa superior escribible, pero el estado protegido de arranque actual la marca como no duradera y registra una identidad `ram-origin` separada para el almacenamiento original. `trim` solo copia la sesión compatible seleccionada y los metadatos correspondientes; `full` copia todas las sesiones Raw, DynFileFS, DynBlk, VMDK o SquashFS presentes en el almacenamiento. Los datos nativos de directorio no se copian: una solicitud nativa exitosa de RAM inicia un nuevo contenedor vacío DynBlk o DynFileFS, excepto durante un reinicio, que desactiva la copia. El Administrador de Sesiones actual resuelve el almacenamiento original por UUID de sistema de archivos y puede guardar explícitamente la sesión respaldada por RAM de nuevo o como una nueva sesión numerada. Los cambios no guardados en RAM se pierden si no se realiza una escritura exitosa.

Para obtener orientación operativa relacionada, consulte [Modos de arranque](/using-minios/Boot-Modes), [Parámetros de arranque](/reference/Boot-Parameters), [Sesiones y persistencia](/using-minios/Sessions-and-Persistence), [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Seguridad](/maintenance-and-recovery/Security), y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Liberación de espacio consciente de sesión

`minios-session reclaim ID` es compatible con DynFileFS, DynBlk y sesiones VMDK. Para una sesión en texto plano, ejecuta FITRIM directamente sobre el sistema de archivos ext4 interno, nunca sobre la raíz combinada AUFS/OverlayFS, y luego invoca la operación de liberación de espacio del backend de almacenamiento correspondiente. La liberación de espacio en DynFileFS requiere DynFileFS 4.6.0 o superior.

Para una sesión DynFileFS en ejecución, el Session Manager entra en un espacio de nombres de montaje privado de corta duración para poder acceder a `virtual.dat` por debajo del overlay ext4 activo sin afectar al daemon del sistema, el dispositivo loop o los montajes en unión. Los dispositivos DynBlk/VMDK en ejecución se validan frente al estado protegido del arranque actual. Las sesiones inactivas se conectan y montan temporalmente; si una sesión ya está montada por Session Manager, se reutiliza esa conexión existente. Un desmontaje ocupado detiene el proceso de cierre en lugar de desconectar el almacenamiento bajo un sistema de archivos en uso.

Ni el arranque ni el apagado ejecutan la compactación automáticamente. `--compact` es una acción explícita del usuario en la CLI o en la opción no seleccionada del cuadro de diálogo de Session Manager, y puede reubicar datos activos, lo que incrementa las escrituras en la memoria flash. Sin esta acción, los backends solo liberan el espacio que pueden devolver sin mover datos activos, como los rangos con posibilidad de hole-punch o los finales de archivos completamente libres; en sistemas de archivos como exFAT, los rangos liberados en el interior pueden seguir siendo reutilizables dentro del contenedor, incluso si no se pueden devolver al sistema de archivos del host. Las sesiones cifradas solo liberan el espacio que el backend ya conoce y no habilitan el descarte de manera silenciosa a través de dm-crypt.
