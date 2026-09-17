---
updated: 2026-09-17
---

# Internos de persistencia

Esta página explica los parámetros de arranque `perch`, `perchdir`, `perchmode`, `perchsize` y `perchreserve`. Estos parámetros controlan dónde se almacenan los cambios de una sesión en vivo. Para el uso habitual, selecciona una entrada persistente en el menú de arranque o utiliza el Gestor de sesiones de MiniOS en lugar de editarlos manualmente.

MiniOS construye la raíz en vivo a partir de módulos de solo lectura y una capa superior escribible.
El initrd decide si esa capa superior será una sesión persistente numerada o un directorio temporal en RAM. Esta página describe esa decisión y ruta de activación durante el arranque. Para los controles orientados al usuario, consulta [Modos de arranque](/using-minios/Boot-Modes) y [Parámetros de arranque](/reference/Boot-Parameters).

## En lenguaje sencillo

Sin un parámetro de persistencia, MiniOS guarda los cambios en RAM y los descarta al apagar. Un parámetro de persistencia solicita a MiniOS que localice un almacenamiento escribible, seleccione o cree una sesión numerada, verifique la compatibilidad y utilice esa sesión como la capa escribible.

Solicitar persistencia no garantiza que se active. Si el destino es de solo lectura, está lleno, dañado o es incompatible, MiniOS puede continuar con una capa temporal RAM. Lee la advertencia de inicio antes de confiar en los cambios guardados.

## Parámetros explicados

| Parámetro | Qué indica MiniOS | Opción habitual |
|---|---|---|
| `perchdir=resume` | Abre la sesión compatible predeterminada y, si las condiciones lo permiten, crea un reemplazo cuando no se puede utilizar. | Trabajo diario normal. |
| `perchdir=new` | Crea una nueva sesión numerada. | Mantiene un espacio de trabajo existente sin cambios. |
| `perchdir=ask` | Muestra las sesiones guardadas después de encontrar un almacenamiento reanudable y permite elegir una. No puede crear la primera sesión en un almacenamiento vacío. | Varios espacios de trabajo existentes en un dispositivo; usa `perchdir=new` para la primera sesión. |
| `perchdir=NUMBER` | Solicita una sesión numerada en particular. | Entrada de arranque personalizada estable después de verificar el ID de sesión. |
| `perchmode=MODE` | Selecciona `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. | Coincide con el sistema de archivos de respaldo y el modelo de persistencia deseado. |
| `perchencrypt=luks` | Agrega una capa LUKS2 al crear una sesión Raw, DynFileFS, DynBlk o VMDK. | Encripta un backend de contenedor compatible. |
| `perchsize=SIZE` | Solicita el tamaño de una sesión de contenedor nueva o en crecimiento. | DynFileFS, DynBlk, VMDK o raw; la encriptación no modifica la semántica de tamaño del backend. |
| `perchcomp=CODEC` | Selecciona la compresión del backend DynBlk para una sesión DynBlk recién creada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`; la disponibilidad aún depende del kernel en ejecución. La compresión se desactiva cuando LUKS envuelve DynBlk. |
| `perchreserve=MB` | Resta un margen al dimensionar un contenedor nuevo o en crecimiento y establece el umbral de advertencia de poco espacio. | Deja espacio de trabajo al asignar un contenedor; no es una cuota en tiempo de ejecución. |
| `perch` | Utiliza el comportamiento de reanudación anterior sin creación automática de reemplazo. | Compatibilidad con una entrada personalizada existente; se recomienda `perchdir=resume` para los menús actuales. |

No combines persistencia con `toram` cuando esperes que los cambios se escriban de vuelta en el dispositivo original. MiniOS activa la sesión copiada en RAM, y los cambios en esa copia se pierden al apagar.

## La persistencia es explícita

El initrd habilita el manejo de persistencia solo cuando la línea de comandos del kernel contiene uno de estos tokens reconocidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Si no se encuentra ninguno de esos tokens, incluso cuando solo hay un nombre de `perch...` no reconocido, MiniOS crea una capa superior nueva y escribible en RAM. Los cambios realizados durante ese arranque se descartan al apagar.

No todos los selectores son equivalentes:

| Selector | Comportamiento de initrd |
|---|---|
| `perch` | Intenta reanudar el valor predeterminado de los metadatos. No crea una sesión automáticamente cuando ninguna es utilizable o si fallan las comprobaciones de compatibilidad. |
| `perchdir=resume` | Intenta el valor predeterminado de los metadatos y puede crear automáticamente un reemplazo compatible. Este es el comportamiento actual de reanudación del menú de arranque. |
| `perchdir=new` | Asigna un directorio cuyo ID numérico es uno mayor que el ID numérico existente más alto. Nunca reutiliza un directorio existente. |
| `perchdir=ask` | Ofrece sesiones existentes después de encontrar un almacenamiento reanudable y el valor predeterminado. Una sesión existente incompatible requiere confirmación. Si el almacenamiento está vacío, utiliza `perchdir=new` para crear la primera sesión. |
| `perchdir=NUMBER` | Utiliza ese directorio cuando existe. Si no existe, la selección puede recurrir al valor predeterminado registrado en los metadatos; no reserva el número solicitado. |

Otros parámetros de persistencia reconocidos sin selector entran en la misma ruta de reanudación heredada que `perch` solo: solicitan persistencia, pero no habilitan la creación automática. Si la selección o activación no logra producir una capa superior utilizable, el arranque continúa normalmente con la capa superior RAM y muestra una advertencia de fallo.

## Almacenamiento y ubicación de la sesión

El almacenamiento habitual es el directorio `changes` junto a los datos de MiniOS, con directorios de sesión numerados y `session.conf` o `session.json` metadatos:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

El almacenamiento también puede seleccionarse como un dispositivo más una ruta opcional. Se aceptan formas como una ruta directa de `/dev/...` , `/dev/disk/by-label/LABEL/...` , `/dev/mapper/...` , `label:LABEL/...` , `askdisk` y `askdisk:custom:path`. El sufijo delimitado por dos puntos se convierte en una ruta debajo del dispositivo seleccionado; la sintaxis de barra después de `askdisk` pierde silenciosamente esa ruta personalizada. Un subdirectorio seleccionado se monta mediante bind como almacenamiento de sesión. MiniOS también puede detectar una partición de persistencia en la misma unidad y almacenamiento de persistencia Ventoy compatible.

Antes de seleccionar la sesión, el initrd debe montar la ubicación con permisos de escritura y comprobar que puede crear y eliminar un marcador en el almacenamiento. Un dispositivo de bloques que no pueda abrirse para escritura, un montaje de solo lectura, una ruta no disponible o una prueba de escritura fallida rechazan la persistencia para ese arranque. No se confía en las sesiones existentes solo porque sus archivos puedan leerse.

## Selección y compatibilidad

Los metadatos de la sesión registran el modo de almacenamiento y pueden registrar la versión, edición, sistema de archivos en unión y tamaño del contenedor MiniOS. Al reanudar, se comparan el modo, la versión, la edición y la unión registrados con el modo solicitado y el sistema actual.
Los campos de compatibilidad heredados que faltan no se consideran incompatibilidades.

El uso literal de `perchdir=resume` crea una nueva sesión numerada cuando falta su valor predeterminado o cuando una incompatibilidad de modo, versión, edición o unión registrada hace que ese valor predeterminado no sea adecuado. `perch` solo, una selección numérica directa y otras solicitudes de reanudación heredadas rechazan la creación automática de reemplazo y continúan en RAM tras un fallo en la selección. `perchdir=ask` muestra información de compatibilidad y permite una anulación explícita. Una nueva sesión utiliza por defecto `native` salvo que se haya solicitado otro modo.

El modo de almacenamiento es parte de la compatibilidad. Si la selección llega a la asignación de backend, un modo solicitado desconocido recurre a `native`, cuyo sondeo puede entonces seleccionar DynFileFS en un almacenamiento inadecuado. Una sesión existente con un modo registrado diferente puede fallar la comprobación de compatibilidad anterior; una solicitud de reanudación heredada entonces continúa en RAM en lugar de llegar a ese recurso alternativo.

## Reserva de espacio y tamaños

MiniOS utiliza 256 MiB como margen de asignación predeterminado y umbral de advertencia de poco espacio. El cálculo usa bloques de sistema de archivos de 1024 bytes. `perchreserve` acepta un número entero sin signo y sin unidad, tiene un límite de 4096 y vuelve a 256 si falta o es inválido. El margen reduce el espacio ofrecido a un contenedor nuevo o en crecimiento. No es una cuota: una sesión nativa o escrituras posteriores aún pueden consumir el espacio restante del sistema de archivos. El arranque advierte cuando el espacio libre actual está en o por debajo del umbral.

Los tamaños de contenedor usan valores enteros asignados en MiB:

- Un número solo, `M`, o `MB` significa MiB.
- `G` o `GB` multiplica el número por 1000 MiB.
- `T` o `TB` multiplica el número por 1.000.000 MiB.
- Los contenedores Raw tienen un límite de 1.000.000 MiB y por el espacio disponible tras la reserva. DynFileFS tiene un límite propio dependiente de RAM y un tope rígido de 2.000.000 MiB. DynBlk obtiene su límite de geometría de formato nativo de `dynblk limits --format dynblk`; MiniOS no impone un tope separado de 512 GiB.
- Raw es un solo archivo de respaldo, por lo que FAT32 lo limita a 4000 MiB en MiniOS. El mismo límite aplica cuando Raw está envuelto en LUKS2.
- Una nueva sesión raw por defecto es de 4000 MiB. La encriptación no crea una política de tamaño LUKS separada: una sesión Raw, DynFileFS, DynBlk o VMDK cifrada mantiene las reglas de tamaño de su backend subyacente.
- Una nueva sesión DynFileFS creada por initrd sin `perchsize` usa hasta 16 GiB de capacidad lógica. Si el almacenamiento de respaldo no puede contener finalmente esa cantidad tras `perchreserve` y la sobrecarga de índice DynFileFS, el valor predeterminado se reduce a la capacidad disponible. Su índice formato-400 consume unos 2 MiB de RAM y unos 2 MiB de almacenamiento de respaldo por cada GiB de capacidad lógica declarada, incluso si la carga útil está vacía. Por lo tanto, MiniOS también limita la capacidad de DynFileFS por el almacenamiento físico RAM y por un tope rígido probado de 2.000.000 MiB.
- Una nueva sesión DynBlk sin `perchsize` sigue el mismo tope automático de 16 GiB y se reduce si queda menos espacio de respaldo tras `perchreserve`. El tamaño explícito de DynBlk es una solicitud de capacidad thin comprobada contra el límite del backend instalado. Los metadatos de las partes declaradas se crean inicialmente, pero el espacio de carga útil crece bajo demanda. DynBlk gestiona una caché de metadatos acotada independiente del llenado de la carga útil.

El crecimiento de contenedores es a mejor esfuerzo y no se admite la reducción de tamaño. `perchsize` no dimensiona sesiones nativas ni SquashFS. El Gestor de sesiones de MiniOS asigna por defecto 4000 MiB a los contenedores raw y DynFileFS creados manualmente, y 16 GiB a DynBlk; las variantes cifradas usan los mismos valores predeterminados del backend. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de almacenamiento

Todos los backends exitosos deben proporcionar el upper writable esperado por el sistema de archivos en unión seleccionado. Montar un backend por sí solo no prueba que la persistencia esté activa. Native, DynFileFS, DynBlk, VMDK y raw pueden actualizar los metadatos de sesión persistente antes de la validación de la unión; SquashFS retrasa ese commit de metadatos. Raw, DynFileFS, DynBlk y VMDK pueden además usar cifrado LUKS2. El estado protegido de arranque actual se publica solo después de confirmar que la unión raíz final utiliza el upper esperado.

| Backend | Representación persistente | Modelo de capacidad | Requisitos de almacenamiento de respaldo | Capa LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Archivos y directorios directamente en el directorio de sesión numerado | Utiliza directamente el espacio del sistema de archivos de respaldo; `perchsize` no aplica | Sistema de archivos writable que pasa la prueba de comportamiento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` más archivos de segmento que exponen un ext4 `virtual.dat` | Carga ligera con un índice denso del tamaño de la capacidad | Almacenamiento writable POSIX, FAT32, NTFS o exFAT | Sí |
| `dynblk` | Formato-1 `volumeNNN.db` archivos que exponen `/dev/dynblkN`, con ext4 encima | Dispositivo de bloque virtual ligero con asignaciones residentes en disco y una caché limitada | Sistema de archivos aceptado por el backend del kernel DynBlk y suficientes recursos de backend | Sí |
| `raw` | Único archivo de tamaño fijo `changes.img` que contiene ext4 | El archivo se crea con el tamaño lógico solicitado; solo crece | Sistema de archivos writable capaz de alojar la imagen; FAT32 está limitado a 4000 MiB | Sí |
| `squashfs` | Instantánea comprimida `changes.sb`; el upper writable en tiempo de ejecución se reconstruye en RAM | El tamaño de la instantánea sigue los cambios capturados; `perchsize` no aplica | Las instantáneas existentes pueden leerse desde medios writable compatibles, pero el guardado exacto requiere un sistema de archivos de staging compatible con POSIX | No |

### Nativo

El modo nativo almacena el contenido de la unión escribible directamente en el directorio de sesión numerado. No hay imagen interna, dispositivo loop, contenedor FUSE ni sistema de archivos de bloque separado, por lo que la capacidad simplemente sigue el espacio libre del sistema de archivos de respaldo y `perchsize` no aplica. Esto implica la menor sobrecarga de contenedor y mantiene la visibilidad ordinaria de los archivos para recuperación y respaldo.

MiniOS primero excluye sistemas de archivos no POSIX conocidos como FAT, exFAT y NTFS. Luego prueba el comportamiento real del sistema de archivos creando un archivo y un enlace simbólico y comprobando cambios en el modo ejecutable. Si la prueba tiene éxito, el directorio de sesión numerado se monta directamente como área escribible. Si el sistema de archivos es conocido como inadecuado, o la prueba POSIX falla, el modo nativo recurre a DynFileFS. Un fallo tras la activación nativa se revierte; un candidato vacío nuevo se elimina cuando puede hacerse de forma segura.

La capa de persistencia LUKS2 MiniOS no envuelve el modo nativo porque este no tiene contenedor ni límite de dispositivo de bloque para cifrar. La persistencia nativa aún puede residir en un almacenamiento cifrado fuera de esta capa de persistencia.

### DynFileFS

DynFileFS es el backend de contenedor format-400 basado en FUSE. Expone una única imagen lógica de `virtual.dat` mientras almacena los datos en `changes.dat` más archivos de segmento numerados. El asistente debe montar correctamente y exponer `virtual.dat`; de lo contrario, la activación falla en lugar de crear accidentalmente un archivo solo-RAM con un nombre que parece persistente.

Su índice de mapeo es denso respecto a la capacidad lógica declarada: cada bloque lógico de 4 KiB tiene un desplazamiento de 8 bytes. Esto supone unos 2 MiB de índice RAM por GiB de capacidad virtual, y aproximadamente la misma cantidad se almacena en los índices de segmento de respaldo incluso antes de escribir datos de carga útil. La asignación de la carga útil sigue siendo dinámica. Como el binario initrd estático es i686, MiniOS también aplica un límite de tamaño lógico compatible con RAM y un tope rígido de 2.000.000 MiB por debajo del punto de fallo del espacio de direcciones probado.

La imagen lógica contiene ext4. Las imágenes existentes se comprueban antes de montar en modo escritura; los resultados de fsck superiores al estado de errores corregidos rechazan la sesión en vez de montarla como escribible. El redimensionado solo permite crecimiento, y el sistema de archivos ext4 interno se expande cuando es posible. Para diagnóstico orientado al usuario, consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

El modo `dynblk` utiliza un dispositivo de bloque del kernel, separado de DynFileFS. Cada sesión numerada posee `volume000.db` y todos sus hermanos numerados (`volume001.db`, ..., `volume1000.db`, y más allá). La disposición nativa es `DBSPRS01`, formato de disco **1**. Las disposiciones no compatibles se rechazan en vez de convertirse silenciosamente. Mantén las versiones instaladas del CLI y del módulo emparejadas.

MiniOS crea ext4 en todo el disco devuelto por `/dev/dynblk-control`, como `/dev/dynblk3`; no asume que `dynblk0` está libre. Se verifica ext4 existente antes de permitir escritura. El estado protegido de arranque registra exactamente ese dispositivo para que el apagado lo desmonte solo después de que sus usuarios y el sistema de archivos superior se hayan cerrado. Pueden coexistir varios dispositivos independientes.

Gestor de sesiones, instalador e initramfs consultan `dynblk limits --format dynblk` para conocer el límite de geometría del backend instalado. El guardián de recursos actual permite 65536 partes: los tramos lógicos estándar de 1 GiB permiten hasta 64 TiB. Límites físicos menores reducen el límite virtual. Esto es un tope de geometría, no una garantía de que el host pueda mantener tantos archivos abiertos o tenga suficiente RAM/almacenamiento. Se admite el crecimiento; no la reducción.

Las tablas de asignación residen en disco. `--map-memory-mb` controla una caché de metadatos por dispositivo (por defecto 1 MiB, rango 1..64 MiB), ya no es un porcentaje de RAM ni un límite sobre datos asignados. Las descripciones de extensiones, vectores de archivos abiertos y pequeños directorios crecen con la geometría declarada, no con el llenado de la carga útil. Al adjuntar, se escanea el mapeo de metadatos y se reconstruye temporalmente el estado de asignación parte por parte; no se lee toda la carga útil. `dynblk check` sí lee las cargas útiles. `engine_memory_bytes` excluye la caché de páginas del sistema de archivos, internos del códec y otras asignaciones del kernel.

Los archivos de metadatos de todas las partes declaradas se inicializan al crear/crecer; los datos reales permanecen thin. Las partes están limitadas a 4000 MiB. Realiza copias de seguridad del espacio de nombres completo y desmontado, sin asumir números de tres dígitos ni una parte final fija. Un volumen nuevo puede seleccionar compresión con `perchcomp`; las cargas posteriores usan el códec almacenado. LUKS2 sobre DynBlk fuerza la compresión a `none`. Las escrituras parciales en datos comprimidos actualmente recomprimen el bloque de 64 KiB correspondiente. El agotamiento de recursos o almacenamiento aún puede provocar fallos en las escrituras; el sistema de archivos superior debe desmontarse antes de desconectar.

### Sesiones VMDK

El modo de sesión `vmdk` utiliza el mismo controlador con imágenes reales de `twoGbMaxExtentSparse`
. Su principal es `volume.vmdk`, con `volume-s001.vmdk` y posteriores
partes; cada parte cubre hasta 2 GiB de espacio lógico. El descriptor está limitado
a menos de 1 MiB, por lo que la longitud del nombre de archivo y la cantidad de extensiones restringen la capacidad.
Gestor de sesiones, Instalador e initramfs consultan `dynblk limits --format vmdk`.
El modo nativo sigue usando `volume000.db`; ninguno de los modos reinterpreta los archivos del otro
modo. Las sesiones gestionadas no importan un VMDK particionado externamente de forma arbitraria
como metadatos de sesión.

El soporte para sesiones VMDK se anuncia mediante `vmdk-session-v1` en
`/etc/minios-initramfs-dynblk` dentro del initrd. El runtime actual y cada
initrd de origen copiado por el Instalador deben soportarlo. VMDK no tiene compresión nativa;
`perchcomp` se ignora con una advertencia al arrancar y el Gestor de sesiones rechaza un
VMDK no-`none` códec. LUKS sigue siendo una capa opcional separada. Ambos modos publican
su modo de sesión real y el `dynblk_device`propietario en el estado protegido de arranque,
y ambos cierres de sesión cierran ese dispositivo después de que sus usuarios salgan.

Ambos formatos de controlador admiten `writeback`, `writethrough`, `none`, `directsync` y políticas explícitas de `unsafe`adjunción. Los modos directos requieren actualmente ext2/ext4 como base. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` adjunta un sistema de archivos existente; `umount` libera el dispositivo gestionado por el helper tras cerrar su último usuario. La `dynblk load` tiene vida útil explícita. Esto no crea un sistema de archivos ni desbloquea LUKS.

### Raw

El modo Raw utiliza un solo `changes.img` archivo que contiene ext4. La longitud del archivo se establece según la capacidad lógica solicitada en el momento de la creación, por lo que, a diferencia de los backends dinámicos, la capacidad es fija hasta que se realiza una operación explícita de ampliación. El sistema de archivos subyacente puede representar los bloques no escritos de forma dispersa, pero MiniOS sigue tratando Raw como un almacenamiento de capacidad fija y verifica el espacio disponible antes de crearlo o ampliarlo. Como todo reside en un solo archivo del host, FAT32 está limitado a 4000 MiB.

Las imágenes Raw existentes se verifican con `e2fsck` antes de montar en modo escritura. Al ampliar, primero se extiende `changes.img` y luego se expande ext4 con `resize2fs`; la reducción de tamaño no está soportada. Si falla la verificación o el montaje, la imagen se conserva para recuperación y el arranque continúa en RAM. Raw no utiliza demonio FUSE ni metadatos personalizados de almacenamiento en bloques, lo que simplifica su modelo de recuperación, pero carece del comportamiento de capacidad dinámica de DynFileFS y DynBlk.

### Capa de cifrado LUKS

LUKS2 es una capa de cifrado opcional que se selecciona con `perchencrypt=luks` al crear una sesión Raw, DynFileFS, DynBlk o VMDK. Las sesiones existentes toman su estado de cifrado de los metadatos de la sesión; especificar `perchencrypt` después no reinterpreta ni convierte una sesión de texto plano existente.

El límite de cifrado depende del backend: Raw conecta `changes.img` mediante un dispositivo loop y coloca LUKS2 dentro de ese archivo; DynFileFS conecta su `virtual.dat` expuesto mediante un dispositivo loop y cifra esa imagen lógica; DynBlk usa el dispositivo de bloque `/dev/dynblkN` directamente como fuente LUKS2. En los tres casos, MiniOS crea ext4 dentro de `/dev/mapper/...`, por lo que el contenido y los metadatos del sistema de archivos dentro del mapper quedan cifrados en reposo. Los metadatos del backend fuera del límite LUKS, los archivos de arranque, los metadatos de sesión y otros archivos en el medio de persistencia permanecen sin cifrar.

Los valores predeterminados de tamaño, límites de crecimiento, restricciones de FAT32 y el comportamiento de asignación thin/fija siguen perteneciendo al backend subyacente. El initrd autentica antes de ampliar un backend cifrado existente, cierra el mapper antes de ampliar el backend, luego lo vuelve a abrir, verifica ext4 y expande el sistema de archivos antes de montarlo. Para DynBlk cifrado, la compresión del backend se fuerza a `none`.

La creación solicita la contraseña dos veces. Las sesiones cifradas existentes permiten tres intentos de desbloqueo en la consola de arranque. Tres contraseñas rechazadas activan una ruta de arranque fatal: MiniOS no continúa en RAM, no reinterpreta la misma sesión como texto plano, no selecciona otro backend ni crea un reemplazo. Otros fallos de creación, comprobación, redimensionamiento o montaje mantienen su comportamiento de recuperación específico del backend sin recurrir a texto plano. Las contraseñas no se almacenan en los metadatos de sesión ni se pasan como argumentos de comando. Las exportaciones lógicas contienen los archivos de sesión descifrados, no una imagen cifrada del backend.

Consulta [Seguridad](/maintenance-and-recovery/Security) para el límite de protección y consideraciones de respaldo.

### SquashFS

El initrd normalmente activa una sesión existente de SquashFS. La configuración interactiva crea metadatos de generación cero con guardado al apagar habilitado, pero no crea `changes.sb`; la capa superior escribible solo existe en RAM hasta que el sistema en ejecución realiza el primer guardado bajo demanda o al apagar. Una sesión de generación cero solo es válida cuando los campos de artefacto de snapshot y `changes.sb` están ausentes. Para generaciones posteriores, la activación valida metadatos estrictos y de valor único para el snapshot, incluyendo su hash, tamaños comprimido y sin comprimir, recuento de entradas, tipo de unión y política de guardado. También comprueba el tipo y tamaño exacto de archivo, RAM y swap disponibles, el hash SHA-256 antes y después de la extracción y la compatibilidad actual de la unión.

El snapshot se extrae con manejo estricto de errores y xattr en una imagen ext4 temporal y limitada en RAM. Para OverlayFS, esa imagen contiene directorios separados de `changes` y `workdir`; para AUFS, su raíz es la rama escribible.
Metadatos malformados, memoria insuficiente, cambios en el hash, errores de extracción o una política inválida hacen que la activación falle y el arranque continúe con su capa superior RAM habitual.

Una sesión marcada como `dirty` indica que el arranque anterior no completó la transición de apagado limpio. SquashFS entonces advierte y restaura el último `changes.sb` guardado correctamente; los cambios no guardados del arranque interrumpido no constituyen una segunda generación de reversión.

El Gestor de sesiones de MiniOS y el backend de guardado del sistema crean y reemplazan atómicamente snapshots de SquashFS usando captura exacta. La activación durante el arranque puede leer un snapshot existente desde almacenamiento FAT, exFAT o NTFS escribible porque la extracción se realiza en la capa superior ext4 temporal. La creación y el guardado exacto siguen dependiendo del sistema de archivos: su área privada de staging debe preservar enlaces, propietarios, modos, xattrs, ACLs, capacidades y whiteouts de unión, por lo que el guardado actual requiere un sistema de archivos POSIX adecuado.

SquashFS no tiene `perchsize`: su tamaño almacenado sigue los cambios comprimidos capturados, mientras que la memoria en tiempo de ejecución la determina la capa superior escribible extraída. La capa de persistencia LUKS MiniOS no envuelve `changes.sb`; si se requiere confidencialidad del snapshot, el almacenamiento de respaldo debe estar cifrado fuera de esta capa. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de la unión y límite de recuperación

Para AUFS, la raíz de cambios activada se convierte en la rama cero escribible. Para OverlayFS, el initrd construye `upperdir` y `workdir` bajo la raíz de cambios activada y monta los módulos de solo lectura como directorios inferiores. Luego, el initrd verifica la rama en vivo AUFS o OverlayFS `upperdir` antes de publicar la persistencia como activa.

Si falla un backend de persistencia, actualización de metadatos o esta verificación, se desmontan los puntos de montaje cuando es posible, no se publica ningún estado de persistencia exitoso y el arranque escribible continúa en RAM. Si falla la construcción de la unión raíz, se entra en el shell fatal de initramfs. Salir de ese shell puede permitir que la configuración continúe con una raíz inválida; no es una reparación ni una alternativa segura. AUFS conserva la adición de ramas de módulos a mejor esfuerzo, pero una unión incompleta cruza el límite de recuperación: MiniOS no marca la persistencia como activa.

Los fallos en la comprobación de contenedores evitan deliberadamente montar una sesión sospechosa en modo escritura.
No reemplaces ni reconstruyas archivos de sesión durante el arranque. Preserva primero el almacenamiento afectado; consulta [Respaldar MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Estado activo, en ejecución y de arranque actual

En los metadatos de sesión duraderos, `default=` es la sesión **activa** seleccionada para la próxima reanudación, mientras que `running=` es la sesión registrada como responsable del arranque actual. La activación escribe ambos campos y marca esa sesión como `dirty`.
Tras desmontar las monturas de persistencia durante un apagado limpio, MiniOS elimina `running=` y marca la sesión como `clean`.

Estos campos de metadatos pueden quedar obsoletos tras un fallo, un error al escribir metadatos, un fallo al construir la unión, una copia del almacenamiento o un apagado interrumpido. Los componentes en tiempo de ejecución que permiten guardar no confían solo en `running=`. Utilizan el estado protegido de arranque actual del initrd, vinculado al ID de arranque, sesión numérica, modo, identidad real del almacenamiento, estado escribible, durabilidad, generación activa verificada y, para DynBlk, el dispositivo `/dev/dynblkN` exacto adjunto. Si el registro de arranque actual falla o falta, la persistencia no debe tratarse como destino de guardado aprobado.

Con `toram` y una solicitud de persistencia reconocida, el almacenamiento de sesiones se copia en RAM antes de la activación. La sesión copiada puede ser escribible y suministrar la capa superior en ejecución, pero su estado de arranque actual se marca como no duradero. Los cambios en esa copia de RAM no regresan al dispositivo original y se pierden al apagar.

Para orientación operativa relacionada, consulta [Modos de arranque](/using-minios/Boot-Modes), [Parámetros de arranque](/reference/Boot-Parameters), [Sesiones y persistencia](/using-minios/Sessions-and-Persistence), [Respaldo de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Seguridad](/maintenance-and-recovery/Security), y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Liberación de espacio consciente de sesión

`minios-session reclaim ID` funciona en ambos formatos de bloque. Para sesiones en texto plano
informa los rangos libres de ext4 con FITRIM y luego llama a `dynblk reclaim`.
Para una sesión activa, el dispositivo está vinculado al estado protegido de arranque actual y
se verifica el montaje real de ext4; nunca se recorta directamente la raíz union.
Las sesiones inactivas se adjuntan y montan temporalmente para esta operación.

Ni el arranque ni el apagado ejecutan la compactación automáticamente. `--compact`es una
elección explícita del usuario en la CLI o en la opción de diálogo sin marcar del Gestor de sesiones.
Sin ella, solo se realiza punch de huecos donde se admite y truncamiento de cola libre.
La política de descarte de LUKS no se modifica con el comando de sesión.
