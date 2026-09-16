---
updated: 2026-09-16
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
| `perchdir=resume` | Abre la sesión compatible predeterminada y, si las condiciones lo permiten, crea un reemplazo cuando no se puede usar. | Trabajo diario normal. |
| `perchdir=new` | Crea una nueva sesión numerada. | Mantiene un espacio de trabajo existente sin cambios. |
| `perchdir=ask` | Muestra las sesiones guardadas después de encontrar un almacenamiento reanudable y te permite elegir una. No puede crear la primera sesión en un almacenamiento vacío. | Varios espacios de trabajo existentes en un dispositivo; usa `perchdir=new` para la primera sesión. |
| `perchdir=NUMBER` | Solicita una sesión numerada en particular. | Entrada de arranque personalizada estable después de verificar el ID de sesión. |
| `perchmode=MODE` | Selecciona `native`, `dynfilefs`, `dynblk`, `raw`, o `squashfs`. | Coincide con el sistema de archivos subyacente y el modelo de persistencia deseado. |
| `perchencrypt=luks` | Agrega una capa LUKS2 al crear una sesión Raw, DynFileFS o DynBlk. | Encripta un backend de contenedor compatible. |
| `perchsize=SIZE` | Solicita el tamaño de una sesión de contenedor nueva o en crecimiento. | DynFileFS, DynBlk o raw; la encriptación no modifica la semántica del tamaño del backend. |
| `perchcomp=CODEC` | Selecciona la compresión del backend DynBlk para una sesión DynBlk recién creada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`; la disponibilidad aún depende del kernel en ejecución. La compresión se desactiva cuando LUKS envuelve DynBlk. |
| `perchreserve=MB` | Resta un margen al dimensionar un contenedor nuevo o en crecimiento y establece el umbral de advertencia por poco espacio. | Deja espacio de trabajo al asignar un contenedor; no es una cuota en tiempo de ejecución. |
| `perch` | Utiliza el comportamiento de reanudación anterior sin creación automática de reemplazo. | Compatibilidad con una entrada personalizada existente; se recomienda `perchdir=resume` para los menús actuales. |

No combines la persistencia con `toram` cuando esperes que los cambios se escriban de vuelta en el dispositivo original. MiniOS activa la sesión copiada en RAM, y los cambios en esa copia se pierden al apagar.

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

MiniOS utiliza 256 MiB como margen de asignación predeterminado y umbral de advertencia por poco espacio. El cálculo emplea bloques de sistema de archivos de 1024 bytes. `perchreserve` acepta un número entero sin signo y sin unidad, tiene un máximo de 4096 y vuelve a 256 si falta o es inválido. El margen reduce el espacio ofrecido a un contenedor nuevo o en crecimiento. No es una cuota: una sesión nativa o escrituras posteriores aún pueden consumir el espacio restante del sistema de archivos. El arranque advierte cuando el espacio libre actual está en o por debajo del umbral.

Los tamaños de contenedor usan cantidades enteras asignadas en MiB:

- Un número sin formato, `M`, o `MB` significa MiB.
- `G` o `GB` multiplica el número por 1000 MiB.
- `T` o `TB` multiplica el número por 1.000.000 MiB.
- Los contenedores Raw tienen un límite de 1.000.000 MiB y por el espacio disponible tras la reserva. DynFileFS tiene un límite propio, compatible con RAM, y un tope rígido de 2.000.000 MiB. DynBlk tiene su propio límite de 512 GiB por formato/ABI.
- Raw es un solo archivo de respaldo, por lo que FAT32 lo limita a 4000 MiB en MiniOS. El mismo límite se aplica cuando Raw está envuelto en LUKS2.
- Una sesión raw nueva tiene como valor predeterminado 4000 MiB. El cifrado no crea una política de tamaño LUKS independiente: una sesión Raw cifrada, DynFileFS o DynBlk mantiene las reglas de tamaño de su backend subyacente.
- Una nueva sesión DynFileFS creada por initrd sin `perchsize` utiliza hasta 16 GiB de capacidad lógica. Si el almacenamiento de respaldo no puede contener finalmente esa cantidad tras `perchreserve` y la sobrecarga de índice DynFileFS, el valor predeterminado se reduce a la capacidad disponible. Su índice format-400 consume unos 2 MiB de RAM y unos 2 MiB de almacenamiento de respaldo por cada GiB de capacidad lógica declarada, incluso cuando la carga útil está vacía. Por lo tanto, MiniOS también limita la capacidad de DynFileFS según el RAM físico y por un tope rígido probado de 2.000.000 MiB.
- Una nueva sesión DynBlk sin `perchsize` sigue el mismo límite automático de 16 GiB y se reduce si queda menos espacio de respaldo tras `perchreserve`. El tamaño virtual explícito DynBlk sigue siendo una solicitud de capacidad thin y solo está limitado por el tope de 512 GiB del formato/ABI; los archivos de respaldo físicos se crean de forma diferida. DynBlk gestiona su propia política de mapeo de memoria dispersa y no requiere que MiniOS dimensione ese presupuesto.

El crecimiento de contenedores es a mejor esfuerzo y no se admite la reducción de tamaño. `perchsize` no dimensiona sesiones nativas ni SquashFS. El Gestor de sesiones de MiniOS asigna por defecto 4000 MiB a los contenedores raw y DynFileFS creados manualmente, y 16 GiB a DynBlk; las variantes cifradas usan los mismos valores predeterminados del backend. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de almacenamiento

Todos los backends exitosos deben proporcionar la capa superior escribible esperada por el sistema de archivos en unión seleccionado. Montar un backend por sí solo no garantiza que la persistencia esté activa. Los modos nativo, DynFileFS, DynBlk y raw pueden actualizar los metadatos persistentes de la sesión antes de la validación de la unión; SquashFS retrasa ese compromiso de metadatos. Raw, DynFileFS y DynBlk también pueden utilizar cifrado LUKS2. El estado protegido del arranque actual solo se publica después de confirmar que la unión raíz final utiliza la capa superior esperada.

| Backend | Representación persistente | Modelo de capacidad | Requisitos de almacenamiento de respaldo | Capa LUKS2 de MiniOS |
|---|---|---|---|---|
| `native` | Archivos y directorios directamente en el directorio de sesión numerado | Utiliza directamente el espacio del sistema de archivos de respaldo; `perchsize` no aplica | Sistema de archivos escribible que pasa la prueba de comportamiento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` más archivos de segmento que exponen un ext4 `virtual.dat` | Carga útil ligera con un índice denso del tamaño de la capacidad | Almacenamiento escribible POSIX, FAT32, NTFS o exFAT | Sí |
| `dynblk` | Formato-1 `volumeNNN.db` archivos que exponen `/dev/dynblkN`, con ext4 encima | Dispositivo de bloque virtual ligero con asignaciones dispersas en tiempo de ejecución | Sistema de archivos aceptado por el backend del kernel DynBlk y suficientes recursos de backend | Sí |
| `raw` | Único archivo de tamaño fijo `changes.img` que contiene ext4 | El archivo se crea con el tamaño lógico solicitado; solo permite crecimiento | Sistema de archivos escribible capaz de alojar la imagen; FAT32 está limitado a 4000 MiB | Sí |
| `squashfs` | Instantánea `changes.sb` comprimida; la capa superior escribible en tiempo de ejecución se reconstruye en RAM | El tamaño de la instantánea sigue los cambios capturados; `perchsize` no aplica | Las instantáneas existentes pueden leerse desde medios escribibles compatibles, pero para guardar exactamente se requiere un sistema de archivos de preparación compatible con POSIX | No |

### Nativo

El modo nativo almacena el contenido de la unión escribible directamente en el directorio de sesión numerado. No hay imagen interna, dispositivo loop, contenedor FUSE ni sistema de archivos de bloque separado, por lo que la capacidad simplemente sigue el espacio libre del sistema de archivos de respaldo y `perchsize` no aplica. Esto implica la menor sobrecarga de contenedor y mantiene la visibilidad ordinaria de los archivos para recuperación y respaldo.

MiniOS primero excluye sistemas de archivos no POSIX conocidos como FAT, exFAT y NTFS. Luego prueba el comportamiento real del sistema de archivos creando un archivo y un enlace simbólico y comprobando cambios en el modo ejecutable. Si la prueba tiene éxito, el directorio de sesión numerado se monta directamente como área escribible. Si el sistema de archivos es conocido como inadecuado, o la prueba POSIX falla, el modo nativo recurre a DynFileFS. Un fallo tras la activación nativa se revierte; un candidato vacío nuevo se elimina cuando puede hacerse de forma segura.

La capa de persistencia LUKS2 MiniOS no envuelve el modo nativo porque este no tiene contenedor ni límite de dispositivo de bloque para cifrar. La persistencia nativa aún puede residir en un almacenamiento cifrado fuera de esta capa de persistencia.

### DynFileFS

DynFileFS es el backend de contenedor format-400 basado en FUSE. Expone una única imagen lógica de `virtual.dat` mientras almacena los datos en `changes.dat` más archivos de segmento numerados. El asistente debe montar correctamente y exponer `virtual.dat`; de lo contrario, la activación falla en lugar de crear accidentalmente un archivo solo-RAM con un nombre que parece persistente.

Su índice de mapeo es denso respecto a la capacidad lógica declarada: cada bloque lógico de 4 KiB tiene un desplazamiento de 8 bytes. Esto supone unos 2 MiB de índice RAM por GiB de capacidad virtual, y aproximadamente la misma cantidad se almacena en los índices de segmento de respaldo incluso antes de escribir datos de carga útil. La asignación de la carga útil sigue siendo dinámica. Como el binario initrd estático es i686, MiniOS también aplica un límite de tamaño lógico compatible con RAM y un tope rígido de 2.000.000 MiB por debajo del punto de fallo del espacio de direcciones probado.

La imagen lógica contiene ext4. Las imágenes existentes se comprueban antes de montar en modo escritura; los resultados de fsck superiores al estado de errores corregidos rechazan la sesión en vez de montarla como escribible. El redimensionado solo permite crecimiento, y el sistema de archivos ext4 interno se expande cuando es posible. Para diagnóstico orientado al usuario, consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

El modo `dynblk` es un backend de dispositivo de bloque del kernel, independiente de DynFileFS. Cada sesión numerada posee un espacio de nombres `volume000.db` con volúmenes creados de forma diferida `volume001.db` hasta `volume063.db` hermanos. Al adjuntar un volumen mediante `/dev/dynblk-control` se devuelve un dispositivo de disco completo asignado dinámicamente, como `/dev/dynblk0` u `/dev/dynblk3`; MiniOS debe usar el dispositivo devuelto y no debe asumir que `dynblk0` está libre. Se pueden adjuntar varios volúmenes DynBlk al mismo tiempo.

MiniOS crea ext4 directamente en el dispositivo de disco completo DynBlk, comprueba ext4 existente antes de su uso en modo escritura y admite crecimiento hasta el límite format-1 de 512 GiB. No se admite la reducción de tamaño. El estado protegido de arranque registra el `/dev/dynblkN` exacto utilizado por la sesión persistente en ejecución, de modo que el apagado desmonta ese mismo dispositivo tras desmontar su sistema de archivos. Esto sigue siendo correcto incluso cuando el Gestor de sesiones adjunta temporalmente otra sesión DynBlk en paralelo.

La capacidad virtual es thin: no es espacio de host preasignado ni RAM de mapeo. DynBlk mantiene 128 mapeos lógicos de 4 KiB en cada chunk de 4 KiB en tiempo de ejecución, por lo que la memoria de mapeo denso es de unos 8 MiB/GiB. Los punteros de árbol de nivel 0 residen con esos chunks dispersos; el índice de nodo interno fijo es de 396.312 bytes por dispositivo adjunto, y los contadores de referencia de página física se asignan de forma diferida en chunks de 4 KiB que cubren 8 MiB de espacio de respaldo cada uno. Si no se proporciona un presupuesto de mapeo explícito, el propio driver DynBlk selecciona aproximadamente el 25% del RAM utilizable reportado por el kernel tras normalizar a 64 MiB, con un tope de 4096 MiB. MiniOS deja esa política al driver.

Un nuevo volumen DynBlk puede usar compresión de backend seleccionada con `perchcomp`. La compresión es una propiedad del formato de almacenamiento DynBlk y queda fija para ese volumen tras la creación. Si LUKS2 envuelve DynBlk, MiniOS fuerza la compresión de DynBlk a `none`, ya que la capa de cifrado se sitúa por encima del dispositivo DynBlk. Las escrituras reales aún pueden fallar por falta de espacio libre en el sistema de archivos inferior, por el espacio de nombres de respaldo de 64 partes o por la admisión de mapeo DynBlk. Un dispositivo fallido o bloqueado solo se desconecta después de desmontar su sistema de archivos superior; la recuperación valida el formato almacenado en el siguiente adjunto.

### Raw

El modo Raw utiliza un solo `changes.img` archivo que contiene ext4. La longitud del archivo se establece según la capacidad lógica solicitada en el momento de la creación, por lo que, a diferencia de los backends dinámicos, la capacidad es fija hasta que se realiza una operación explícita de ampliación. El sistema de archivos subyacente puede representar los bloques no escritos de forma dispersa, pero MiniOS sigue tratando Raw como un almacenamiento de capacidad fija y verifica el espacio disponible antes de crearlo o ampliarlo. Como todo reside en un solo archivo del host, FAT32 está limitado a 4000 MiB.

Las imágenes Raw existentes se verifican con `e2fsck` antes de montar en modo escritura. Al ampliar, primero se extiende `changes.img` y luego se expande ext4 con `resize2fs`; la reducción de tamaño no está soportada. Si falla la verificación o el montaje, la imagen se conserva para recuperación y el arranque continúa en RAM. Raw no utiliza demonio FUSE ni metadatos personalizados de almacenamiento en bloques, lo que simplifica su modelo de recuperación, pero carece del comportamiento de capacidad dinámica de DynFileFS y DynBlk.

### Capa de cifrado LUKS

LUKS2 es una capa de cifrado opcional que se selecciona con `perchencrypt=luks` al crear una sesión Raw, DynFileFS o DynBlk. Las sesiones existentes toman su estado de cifrado de los metadatos de sesión; especificar `perchencrypt` posteriormente no reinterpreta ni convierte una sesión existente en texto plano.

El límite de cifrado depende del backend: Raw conecta `changes.img` mediante un dispositivo loop y coloca LUKS2 dentro de ese archivo; DynFileFS conecta su `virtual.dat` expuesto mediante un dispositivo loop y cifra esa imagen lógica; DynBlk utiliza el dispositivo de bloque `/dev/dynblkN` directamente como origen LUKS2. En los tres casos, MiniOS crea ext4 dentro de `/dev/mapper/...`, por lo que el contenido y los metadatos del sistema de archivos dentro del mapper quedan cifrados en reposo. Los metadatos del backend fuera del límite LUKS, archivos de arranque, metadatos de sesión y otros archivos en el medio de persistencia permanecen sin cifrar.

Los valores predeterminados de tamaño, límites de crecimiento, restricciones de FAT32 y el comportamiento thin/fijo de la asignación siguen perteneciendo al backend subyacente. El initrd autentica antes de ampliar un backend cifrado existente, cierra el mapper antes de ampliar el backend, luego lo vuelve a abrir, comprueba ext4 y expande el sistema de archivos antes de montarlo. Para DynBlk cifrado, la compresión del backend se fuerza a `none`.

Durante la creación se solicita la contraseña dos veces. Las sesiones cifradas existentes permiten tres intentos de desbloqueo en la consola de arranque. Tres contraseñas rechazadas activan una ruta de arranque fatal: MiniOS no continúa en RAM, no reinterpreta la misma sesión como texto plano, no selecciona otro backend ni crea un reemplazo. Otros fallos de creación, comprobación, redimensionado o montaje mantienen su comportamiento de recuperación específico del backend sin recurrir a texto plano. Las contraseñas no se almacenan en los metadatos de sesión ni se pasan como argumentos de comando. Las exportaciones lógicas contienen archivos de sesión descifrados en lugar de una imagen de backend cifrada.

Consulta [Seguridad](/maintenance-and-recovery/Security) para información sobre el límite de protección y consideraciones de respaldo.

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
