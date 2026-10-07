---
updated: 2026-10-06
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

Si ninguno de esos tokens está presente, incluso cuando solo hay un nombre de `perch...` desconocido, MiniOS crea una nueva capa superior escribible en RAM. Los cambios realizados durante ese arranque se descartan al apagar.

Los selectores no son todos equivalentes:

| Selector | Comportamiento del initrd |
|---|---|
| `perch` | Intenta reanudar el valor predeterminado de los metadatos. No crea automáticamente una sesión cuando no hay ninguna utilizable o cuando fallan las comprobaciones de compatibilidad. |
| `perchdir=resume` | Intenta el valor predeterminado de los metadatos y puede crear automáticamente un reemplazo compatible. Este es el comportamiento actual de reanudación del menú de arranque. |
| `perchdir=setup` | Primero abre el selector de backend, registra la selección de backend/cifrado/compresión, y luego sigue la ruta de asignación de nueva sesión. |
| `perchdir=new` | Asigna un directorio cuyo ID numérico es uno mayor que el ID numérico existente más alto. Nunca reutiliza un directorio existente y no abre el selector de backend. |
| `perchdir=ask` | Ofrece sesiones existentes si las hay; una sesión existente incompatible requiere confirmación. Si no hay predeterminado/sesión en el almacenamiento, cambia a `setup` para que la primera sesión pueda crearse de forma interactiva. |
| `perchdir=NUMBER` | Usa ese directorio si existe. Si no existe, la selección puede recurrir al valor predeterminado registrado en los metadatos; no reserva el número solicitado. |

Otros parámetros de persistencia reconocidos sin selector entran en la misma ruta heredada de reanudación que `perch`: solicitan persistencia, pero no habilitan la creación automática. Si la selección o activación no produce una capa superior utilizable, el arranque continúa normalmente con la capa superior RAM y muestra una advertencia de fallo.

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

Los metadatos de sesión registran el modo de almacenamiento y pueden registrar la versión de MiniOS, edición, sistema de archivos union y tamaño del contenedor. La reanudación compara el modo, versión, edición y union registrados con el modo solicitado y el sistema actual.
La ausencia de campos de compatibilidad heredados no se trata como incompatibilidad.

El literal `perchdir=resume` crea una nueva sesión numerada cuando falta su predeterminado o cuando una incompatibilidad de modo, versión, edición o union hace que ese predeterminado no sea adecuado. El bare `perch`, una selección numérica directa y otras solicitudes heredadas de reanudación rechazan el reemplazo automático y continúan en RAM tras un fallo de selección. `perchdir=ask` muestra información de compatibilidad y permite una anulación explícita. Una nueva sesión por defecto es `native` salvo que se haya solicitado otro modo.

El modo de almacenamiento forma parte de la compatibilidad. Si la selección llega al despacho de backend, un modo solicitado desconocido recurre a `native`, cuyo sondeo puede entonces seleccionar DynFileFS en almacenamiento no adecuado. Una sesión existente con un modo registrado diferente puede fallar la comprobación de compatibilidad anterior; una solicitud heredada de reanudación entonces continúa en RAM en vez de llegar a ese fallback.

## Reserva de espacio y tamaños

MiniOS utiliza 256 MiB como margen de asignación predeterminado y umbral de advertencia por poco espacio. El cálculo emplea bloques de sistema de archivos de 1024 bytes. `perchreserve` acepta un número entero sin signo y sin unidad, está limitado a 4096 y vuelve a 256 si falta o es inválido. El margen reduce el espacio ofrecido a un contenedor nuevo o en expansión. No es una cuota: una sesión nativa o escrituras posteriores pueden consumir el espacio restante del sistema de archivos. El arranque advierte cuando el espacio libre actual está en o por debajo del umbral.

Los tamaños de contenedores usan cantidades enteras asignadas en MiB:

- Un número solo, `M`, o `MB` significa MiB.
- `G` o `GB` multiplica el número por 1000 MiB.
- `T` o `TB` multiplica el número por 1.000.000 MiB.
- Los contenedores Raw están limitados a 1.000.000 MiB y por el espacio disponible tras la reserva. DynFileFS tiene un límite propio compatible con RAM y un tope rígido de 2.000.000 MiB. DynBlk obtiene su límite de geometría de formato nativo de `dynblk limits --format dynblk`; MiniOS no impone un tope separado de 512 GiB.
- Raw es un solo archivo de respaldo, así que FAT32 lo limita a 4000 MiB en MiniOS. El mismo límite se aplica si Raw está envuelto en LUKS2.
- Una nueva sesión raw por defecto es de 4000 MiB. El cifrado no crea una política de tamaño LUKS separada: una sesión Raw cifrada, DynFileFS, DynBlk o VMDK mantiene las reglas de tamaño de su backend subyacente.
- Una nueva sesión DynFileFS creada por initrd sin `perchsize` usa hasta 16 GiB de capacidad lógica. Si el almacenamiento de respaldo no puede albergar esa cantidad tras `perchreserve` y la sobrecarga de índice DynFileFS, el valor predeterminado se reduce a la capacidad disponible. Su índice formato-400 cuesta unos 2 MiB de RAM y unos 2 MiB de almacenamiento de respaldo por GiB de capacidad lógica declarada, incluso si la carga útil está vacía. Por tanto, MiniOS también limita la capacidad DynFileFS desde el RAM físico y por un tope rígido probado de 2.000.000 MiB.
- Una nueva sesión DynBlk sin `perchsize` sigue el mismo tope automático de 16 GiB y se reduce si queda menos espacio de respaldo tras `perchreserve`. El tamaño explícito de DynBlk es una solicitud de capacidad thin comprobada contra el límite del backend instalado. Los metadatos de las partes declaradas se crean inicialmente, pero el espacio de carga útil crece bajo demanda. DynBlk mantiene una caché de metadatos acotada independiente del llenado de la carga útil.

El crecimiento de contenedores es a mejor esfuerzo y no se admite la reducción.`perchsize` no asigna tamaño a sesiones nativas ni SquashFS. El Gestor de sesiones de MiniOS asigna por defecto 4000 MiB a los contenedores raw y DynFileFS creados manualmente, y 16 GiB a los contenedores DynBlk/VMDK; las variantes cifradas usan los mismos valores por defecto del backend. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de almacenamiento

Todos los backends exitosos deben proporcionar la capa superior escribible esperada por el sistema de archivos union seleccionado. Montar un backend no prueba por sí mismo que la persistencia esté activa. Los backends nativo, DynFileFS, DynBlk, VMDK y raw pueden actualizar los metadatos de sesión persistente antes de la validación del union; SquashFS pospone ese commit de metadatos. Raw, DynFileFS, DynBlk y VMDK pueden además usar cifrado LUKS2. El estado protegido del arranque actual solo se publica después de que el union raíz final confirme el uso de la capa superior esperada.

| Backend | Representación persistente | Modelo de capacidad | Requisitos de almacenamiento de respaldo | Capa LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Archivos y directorios directamente en el directorio de sesión numerado | Utiliza directamente el espacio del sistema de archivos de respaldo; `perchsize` no aplica | Sistema de archivos escribible que pasa la prueba de comportamiento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` más archivos de segmento que exponen una `virtual.dat` | Carga útil thin con un índice denso del tamaño de la capacidad | Almacenamiento POSIX, FAT32, NTFS o exFAT escribible | Sí |
| `dynblk` | Formato-1 `volumeNNN.db` archivos que exponen `/dev/dynblkN`, con ext4 encima | Dispositivo de bloque virtual thin con asignaciones residentes en disco y una caché acotada | Sistema de archivos aceptado por el backend kernel DynBlk y suficientes recursos de backend | Sí |
| `vmdk` | `volume.vmdk` más `volume-sNNN.vmdk` extensiones sparse divididas expuestas por el driver DynBlk, con ext4 encima | Dispositivo de bloque virtual thin split-sparse | Sistema de archivos aceptado por el backend VMDK DynBlk y la capacidad `vmdk-session-v1` | Sí |
| `raw` | Archivo único de tamaño fijo `changes.img` que contiene ext4 | El archivo se crea con el tamaño lógico solicitado; solo crece | Sistema de archivos escribible capaz de albergar la imagen; FAT32 está limitado a 4000 MiB | Sí |
| `squashfs` | Instantánea comprimida `changes.sb` ; la capa superior escribible en tiempo de ejecución se reconstruye en RAM | El tamaño de la instantánea sigue los cambios capturados; `perchsize` no aplica | Las instantáneas existentes pueden leerse desde medios escribibles compatibles; el guardado exacto requiere un almacenamiento de persistencia POSIX adecuado | No |

### Nativo

El modo nativo almacena el contenido escribible del union directamente en el directorio de sesión numerado. No hay imagen interna, dispositivo loop, contenedor FUSE ni sistema de archivos de bloques separado, por lo que la capacidad simplemente sigue el espacio libre del sistema de archivos de respaldo y `perchsize` no aplica. Esto implica la menor sobrecarga de contenedor y mantiene la visibilidad normal de archivos para recuperación y respaldo.

MiniOS primero excluye sistemas de archivos no POSIX conocidos como FAT, exFAT y NTFS. Luego prueba el comportamiento real del sistema de archivos creando un archivo y un enlace simbólico y comprobando cambios de modo ejecutable. Si la prueba tiene éxito, el directorio de sesión numerado se monta mediante bind directamente como área escribible. Si el sistema de archivos es inadecuado o la prueba POSIX falla, el modo nativo recurre a DynFileFS. Un fallo tras la activación nativa se revierte; un candidato vacío nuevo se elimina cuando puede eliminarse de forma segura.

La capa de persistencia LUKS2 MiniOS no envuelve el modo nativo porque este no tiene contenedor ni límite de dispositivo de bloque que cifrar. Sin embargo, la persistencia nativa puede residir en almacenamiento cifrado fuera de esta capa de persistencia.

### DynFileFS

DynFileFS es el backend de contenedor formato-400 basado en FUSE. Expone una única imagen lógica `virtual.dat` mientras almacena datos en `changes.dat` más archivos de segmento numerados. El ayudante debe montar correctamente y exponer `virtual.dat`; de lo contrario, la activación falla en vez de crear accidentalmente un archivo solo RAM con nombre de aspecto persistente.

Su índice de asignación es denso respecto a la capacidad lógica declarada: cada bloque lógico de 4 KiB tiene un desplazamiento de 8 bytes. Esto supone unos 2 MiB de índice RAM por GiB de capacidad virtual, y aproximadamente lo mismo se almacena en los índices de segmento de respaldo incluso antes de escribir datos de carga útil. La asignación de carga útil sigue siendo dinámica. Debido a que el binario initrd estático es i686, MiniOS también aplica un límite de tamaño lógico compatible con RAM y un tope rígido de 2.000.000 MiB por debajo del punto de fallo del espacio de direcciones probado.

La imagen lógica contiene ext4. Las imágenes existentes se comprueban antes del montaje escribible; los resultados de fsck por encima del estado de errores corregidos rechazan la sesión en vez de montarla escribible. El redimensionamiento solo permite crecimiento, y el sistema de archivos ext4 interno se expande cuando es posible. Para diagnóstico orientado al usuario, consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

El modo `dynblk` utiliza un dispositivo de bloque del kernel, separado de DynFileFS. Cada sesión numerada posee `volume000.db` y todos sus hermanos numerados (`volume001.db`, ..., `volume1000.db`, y siguientes). El diseño nativo es `DBSPRS01`, formato de disco **1**. Los diseños no soportados se rechazan en vez de convertirse silenciosamente. Mantén emparejadas las versiones instaladas de CLI y módulos.

MiniOS crea ext4 en todo el disco devuelto por `/dev/dynblk-control`, como `/dev/dynblk3`; no asume que `dynblk0` está libre. El ext4 existente se comprueba antes del uso escribible. El estado protegido del arranque registra ese dispositivo exacto para que el apagado lo desconecte solo después de que sus usuarios y el sistema de archivos superior se hayan cerrado. Pueden coexistir varios dispositivos independientes.

Gestor de sesiones, instalador e initramfs consultan `dynblk limits --format dynblk` para conocer el límite de geometría del backend instalado. El guardián de recursos actual permite 65536 partes: los tramos lógicos estándar de 1 GiB permiten hasta 64 TiB. Límites físicos más pequeños reducen el límite virtual. Esto es un tope de geometría, no una garantía de que el host pueda abrir tantos archivos o tenga suficiente RAM/almacenamiento. Se admite el crecimiento; no la reducción.

Las tablas de asignación residen en disco. `--map-memory-mb` controla una caché de metadatos por dispositivo (por defecto 1 MiB, rango 1..64 MiB), ya no es un porcentaje de RAM ni un límite sobre datos mapeados. Las descripciones de extensión, vectores de archivos abiertos y directorios pequeños crecen con la geometría declarada, no con el llenado de la carga útil. El attach escanea metadatos de asignación y reconstruye temporalmente el estado de asignación parte por parte; no lee toda la carga útil. El `dynblk check` sí lee las cargas útiles. `engine_memory_bytes` excluye la caché de páginas del sistema de archivos, códecs internos y otras asignaciones del kernel.

Los archivos de metadatos de todas las partes declaradas se inicializan al crear/expandir; los datos reales permanecen thin. Las partes están limitadas a 4000 MiB. Haz copia de seguridad del espacio de nombres completo desmontado, sin asumir números de tres cifras ni una parte final fija. Un volumen nuevo puede seleccionar compresión con `perchcomp`; las cargas posteriores usan el códec almacenado. LUKS2 sobre DynBlk fuerza la compresión a `none`. Las escrituras parciales en datos comprimidos actualmente recomprimen el grano correspondiente de 64 KiB. El agotamiento de almacenamiento o recursos aún puede provocar fallos de escritura; el sistema de archivos superior debe desmontarse antes de desconectar.

### Sesiones VMDK

El modo de sesión `vmdk` utiliza el mismo driver con imágenes reales de `twoGbMaxExtentSparse`
. Su principal es `volume.vmdk`, con `volume-s001.vmdk` y partes subsiguientes; cada parte cubre hasta 2 GiB de espacio lógico. El descriptor está limitado
a menos de 1 MiB, por lo que la longitud del nombre de archivo y el número de extensiones restringen la capacidad.
Gestor de sesiones, Instalador e initramfs consultan
.`dynblk limits --format vmdk`El modo nativo sigue usando
; ninguno de los modos reinterpreta los `volume000.db`archivos del otro. Las sesiones gestionadas no importan un VMDK particionado externamente arbitrario
como metadatos de sesión.
El soporte de sesiones VMDK lo anuncia

 en`vmdk-session-v1` dentro del initrd. El runtime actual y cada
`/etc/minios-initramfs-dynblk`initrd de origen copiado por el Instalador deben soportarlo. VMDK no tiene compresión nativa;
 se ignora con una advertencia al arrancar y el Gestor de sesiones rechaza un
`perchcomp`VMDK no-
 códec. LUKS2 sigue siendo una capa de cifrado separada opcional. Ambos modos publican`none`su modo de sesión real y el
propietario `dynblk_device` en el estado protegido de arranque,
y ambas implementaciones de apagado cierran ese dispositivo tras salir sus usuarios.

Ambos formatos de driver soportan `writeback`, `writethrough`, `none`, `directsync` y políticas de adjunción `unsafe`explícitas. Los modos directos requieren actualmente ext2/ext4 debajo. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` adjunta un sistema de archivos existente; `umount` libera el dispositivo propiedad del ayudante tras cerrarse su último usuario. El `dynblk load` manual tiene vida útil explícita. Esto no crea un sistema de archivos ni desbloquea LUKS.

### Raw

El modo Raw utiliza un solo archivo `changes.img` que contiene ext4. La longitud del archivo se establece con la capacidad lógica solicitada al momento de la creación, así que a diferencia de los backends dinámicos, la capacidad es fija hasta que se realice una operación de crecimiento explícita. El sistema de archivos inferior puede representar los bloques no escritos de forma dispersa, pero MiniOS sigue tratando Raw como almacenamiento de capacidad fija y comprueba el espacio de respaldo disponible antes de crearlo o expandirlo. Como todo reside en un solo archivo, FAT32 está limitado a 4000 MiB.

Las imágenes Raw existentes se comprueban con `e2fsck` antes de montar en modo escritura. El crecimiento amplía `changes.img` y luego expande ext4 con `resize2fs`; no se admite la reducción. Un fallo en la comprobación o el montaje conserva la imagen para recuperación y continúa el arranque en RAM. Raw no tiene demonio FUSE ni metadatos personalizados de almacenamiento en bloque, lo que hace que su modelo de recuperación sea sencillo, pero carece del comportamiento thin-capacity de DynFileFS y DynBlk.

### Capa de cifrado LUKS

LUKS2 es una capa de cifrado opcional seleccionada con `perchencrypt=luks` al crear una sesión Raw, DynFileFS, DynBlk o VMDK. Las sesiones existentes toman su estado de cifrado de los metadatos de sesión; especificar `perchencrypt` posteriormente no reinterpreta ni convierte una sesión en texto plano existente.

El límite de cifrado depende del backend: Raw conecta `changes.img` a través de un dispositivo loop y pone LUKS2 dentro de ese archivo; DynFileFS conecta su `virtual.dat` expuesto mediante loop y cifra esa imagen lógica; DynBlk usa su dispositivo de bloque asignado `/dev/dynblkN` directamente; VMDK usa el dispositivo de bloque expuesto por el mismo driver DynBlk para su imagen sparse dividida. En los cuatro casos, MiniOS crea ext4 dentro de `/dev/mapper/...`, por lo que el contenido y los metadatos del sistema de archivos dentro del mapper quedan cifrados en reposo. Los metadatos del backend fuera del límite LUKS, descriptores VMDK, archivos de arranque, metadatos de sesión y otros archivos en el medio de persistencia permanecen sin cifrar.

Los valores predeterminados de tamaño, límites de crecimiento, restricciones de FAT32 y el comportamiento thin/fijo siguen perteneciendo al backend subyacente. El initrd autentica antes de expandir un backend cifrado existente, cierra el mapper antes de expandir el backend, luego lo reabre, comprueba ext4 y expande el sistema de archivos antes de montarlo. Para DynBlk cifrado, la compresión del backend se fuerza a `none`.

La creación solicita la contraseña dos veces. Las sesiones cifradas existentes permiten tres intentos de desbloqueo en la consola de arranque. Tres contraseñas rechazadas invocan una ruta de arranque fatal: MiniOS no continúa en RAM, no reinterpreta la misma sesión como texto plano, no selecciona otro backend ni crea un reemplazo. Otros fallos de creación, comprobación, redimensionamiento o montaje mantienen su comportamiento de recuperación específico del backend sin recurrir a texto plano. Las contraseñas no se almacenan en los metadatos de sesión ni se pasan como argumentos de comando. Las exportaciones lógicas contienen archivos de sesión descifrados en vez de una imagen de backend cifrada.

Consulta [Seguridad](/maintenance-and-recovery/Security) para el límite de protección y consideraciones de respaldo.

### SquashFS

El initrd normalmente activa una sesión existente SquashFS. La configuración interactiva crea metadatos de generación cero con guardado al apagar habilitado pero no crea `changes.sb`; la capa superior escribible solo existe en RAM hasta que el sistema en ejecución realiza el primer guardado bajo demanda o al apagar. Una sesión de generación cero solo es válida cuando faltan los campos de artefactos de instantánea y `changes.sb`. Para generaciones posteriores, la activación valida metadatos estrictos y de valor único para la instantánea, incluyendo su hash, tamaños comprimido y sin comprimir, número de entradas, tipo de union y política de guardado. También comprueba el tipo de archivo y tamaño exacto, RAM disponible y swap, el hash SHA-256 antes y después de la extracción, y la compatibilidad del union actual.

La instantánea se extrae con manejo estricto de errores y xattr en una imagen ext4 temporal y acotada en RAM. Para OverlayFS, esa imagen contiene directorios separados de `changes` y `workdir`; para AUFS, su raíz es la rama escribible.
Metadatos mal formados, memoria insuficiente, cambios en el hash, errores de extracción o una política inválida provocan que la activación falle y el arranque continúe con la capa superior RAM ordinaria.

Una sesión marcada como `dirty` significa que el arranque anterior no completó la transición de apagado limpio. SquashFS entonces advierte y restaura la última `changes.sb`guardada correctamente; los cambios no guardados del arranque interrumpido no constituyen una segunda generación de reversión.

El Gestor de sesiones de MiniOS y el backend de guardado del sistema crean y reemplazan atómicamente instantáneas SquashFS usando captura exacta. La activación de arranque puede leer una instantánea existente desde medios FAT, exFAT o NTFS escribibles porque la extracción ocurre en la capa superior ext4 temporal. La creación y el guardado exacto siguen dependiendo del sistema de archivos: el almacenamiento de sesiones debe soportar creación de espacio privado, metadatos Linux y publicación duradera en un sistema de archivos POSIX adecuado.

Durante el guardado, el backend primero captura un árbol de archivos estable en almacenamiento de memoria privada propiedad de root cuando el initrd proporciona un tmpfs confiable con suficiente espacio. Cuando RAM es insuficiente, este árbol usa el espacio de trabajo en disco anterior. El compresor escribe directamente en un directorio privado modo-0700 en el sistema de archivos de la sesión, no en una imagen RAM adicional seguida de otra copia en disco. MiniOS verifica el resultado comprimido y su identidad, lo sincroniza, lo mueve a un nombre de candidato privado y luego revalida el candidato antes de reemplazar atómicamente la `changes.sb`activa. Las copias o compresiones fallidas no reemplazan la última instantánea exitosa.

Con una sesión duradera y saludable, `/var/log/minios` y `/var/log/live` se montan mediante bind desde `boot-logs/` dentro de la sesión numerada. Por tanto, estos diagnósticos de arranque se escriben independientemente de la capa superior RAM y la instantánea de apagado. Un arranque cuyo almacenamiento de persistencia no se activó de forma duradera no puede garantizar que esos registros sobrevivan a un reinicio. Los registros y cachés ordinarios pueden configurarse por separado; consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS no tiene `perchsize`: su tamaño almacenado sigue los cambios capturados comprimidos, mientras que la memoria en tiempo de ejecución la determina la capa superior extraída. La capa de persistencia LUKS MiniOS no envuelve `changes.sb`; si se requiere confidencialidad de la instantánea, el almacenamiento de respaldo debe cifrarse fuera de esta capa. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación del union y límite de recuperación

Para AUFS, la raíz de cambios activada se convierte en la rama escribible cero. Para OverlayFS, el initrd construye `upperdir` y `workdir` debajo de la raíz de cambios activada y monta los módulos de solo lectura como directorios inferiores. Luego, el initrd verifica la rama AUFS en vivo o OverlayFS `upperdir` antes de publicar la persistencia como activa.

Si un backend de persistencia, actualización de metadatos o esta verificación falla, los montajes se deshacen donde sea posible, no se publica ningún estado de persistencia exitoso y el arranque escribible continúa en RAM. Si falla la construcción del union raíz, se entra en el shell fatal de initramfs. Salir de ese shell puede permitir que la configuración continúe con una raíz inválida; no es una reparación ni un fallback seguro. AUFS mantiene la anexión de ramas de módulos a mejor esfuerzo, pero un union incompleto cruza el límite de recuperación: MiniOS no marca la persistencia como activa.

Los fallos de comprobación de contenedores evitan deliberadamente montar una sesión sospechosa en modo escritura.
No reemplaces ni reconstruyas archivos de sesión durante el arranque. Preserva primero el almacenamiento afectado; consulta [Respaldar MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Estado activo, en ejecución y de arranque actual

En los metadatos de sesión duradera, `default=` es la sesión **activa** seleccionada para la próxima reanudación, mientras que `running=` es la sesión registrada como proveedora del arranque actual. La activación escribe ambos campos y marca esa sesión como `dirty`.
Tras desaparecer los montajes de persistencia durante un apagado limpio, MiniOS elimina `running=` y marca la sesión como `clean`.

Estos campos de metadatos pueden quedar obsoletos tras un fallo, error de escritura de metadatos, fallo de construcción del union, copia del almacenamiento o apagado interrumpido. Los componentes en tiempo de ejecución que permiten guardar no confían solo en `running=`. Usan el estado protegido de arranque actual del initrd, vinculado al ID de arranque, sesión numérica, modo, identidad real del almacenamiento, estado escribible, durabilidad, generación activa verificada y, para DynBlk, el dispositivo `/dev/dynblkN`exactamente adjunto. Un registro fallido o ausente de arranque actual significa que la persistencia no debe tratarse como destino aprobado para guardar.

Con `perchtoram=trim` o `full`, los contenedores de sesión soportados se copian a un tmpfs dedicado antes de la activación. La sesión copiada puede ser escribible y suministrar la capa superior en ejecución, pero el estado protegido de arranque actual la marca como no duradera y registra una identidad `ram-origin`separada para el almacenamiento original. `trim` copia solo la sesión soportada seleccionada y los metadatos correspondientes; `full` copia todas las sesiones Raw, DynFileFS, DynBlk, VMDK o SquashFS soportadas en el almacenamiento. Se excluyen las sesiones de directorio nativas. El Gestor de sesiones actual utiliza `ram-origin` para resolver el almacenamiento original por UUID de sistema de archivos y puede guardar explícitamente la sesión respaldada en RAM de vuelta o como una nueva sesión numerada. Los cambios RAM no guardados aún se pierden si no se realiza una escritura exitosa.

Para orientación operativa relacionada, consulta [Modos de arranque](/using-minios/Boot-Modes), [Parámetros de arranque](/reference/Boot-Parameters), [Sesiones y persistencia](/using-minios/Sessions-and-Persistence), [Respaldar MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Seguridad](/maintenance-and-recovery/Security), y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Reclamación de espacio consciente de sesión

`minios-session reclaim ID` es compatible con sesiones DynFileFS, DynBlk y VMDK. Para una sesión en texto plano ejecuta FITRIM en el sistema de archivos ext4 interno real, nunca en la raíz combinada AUFS/OverlayFS, y luego invoca la operación de reclamación del backend de almacenamiento propietario. La reclamación DynFileFS requiere DynFileFS 4.6.0 o posterior.

Para una sesión DynFileFS en ejecución, el Gestor de sesiones entra en un espacio de nombres de montaje privado de corta duración para poder acceder a `virtual.dat` bajo el overmount ext4 en vivo sin afectar al demonio activo del sistema, dispositivo loop o montajes union. Los dispositivos DynBlk/VMDK en ejecución se validan contra el estado protegido de arranque actual. Las sesiones inactivas se adjuntan y montan temporalmente; una sesión ya montada por el Gestor de sesiones reutiliza ese adjunto existente. Un desmontaje ocupado detiene el proceso en vez de desconectar el almacenamiento bajo un sistema de archivos activo.

Ni el arranque ni el apagado ejecutan la compactación automáticamente. `--compact` es una elección explícita del usuario en la CLI o la opción no marcada del diálogo del Gestor de sesiones y puede reubicar datos en uso, aumentando las escrituras en flash. Sin ella, los backends solo reclaman el espacio que pueden devolver sin mover datos en uso, como rangos hole-punchables o colas de archivo completamente libres; en sistemas de archivos como exFAT, los rangos libres internos pueden seguir siendo reutilizables dentro del contenedor incluso si no pueden devolverse al sistema de archivos host. Las sesiones cifradas solo reclaman el espacio ya conocido por el backend y no habilitan el descarte a través de dm-crypt de forma silenciosa.
