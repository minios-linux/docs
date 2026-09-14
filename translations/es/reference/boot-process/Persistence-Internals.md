---
updated: 2026-09-13
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
| `perchdir=resume` | Abre la sesión compatible predeterminada y, si no se puede usar, crea un reemplazo bajo condiciones compatibles. | Trabajo diario normal. |
| `perchdir=new` | Crea una nueva sesión numerada. | Mantiene un espacio de trabajo existente sin cambios. |
| `perchdir=ask` | Muestra las sesiones guardadas después de encontrar un almacenamiento reanudable y te permite elegir una. No puede crear la primera sesión en un almacenamiento vacío. | Varios espacios de trabajo existentes en un dispositivo; usa `perchdir=new` para la primera sesión. |
| `perchdir=NUMBER` | Solicita una sesión numerada en particular. | Entrada de arranque personalizada estable tras verificar el ID de sesión. |
| `perchmode=MODE` | Selecciona `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, o un `squashfs` existente. | Coincide con el sistema de archivos del almacenamiento, el comportamiento del contenedor por bloques y el requisito de cifrado. |
| `perchsize=SIZE` | Solicita el tamaño de una sesión de contenedor nueva o en expansión. | DynFileFS, dynblk, raw o almacenamiento LUKS. |
| `perchreserve=MB` | Resta un margen al calcular el tamaño de un contenedor nuevo o en expansión y establece el umbral de advertencia por poco espacio. | Deja espacio de trabajo al asignar un contenedor; no es una cuota en tiempo de ejecución. |
| `perch` | Utiliza el comportamiento de reanudación anterior sin creación automática de reemplazo. | Compatibilidad con una entrada personalizada existente; se recomienda `perchdir=resume` para los menús actuales. |

No combines persistencia con `toram` cuando esperes que los cambios se escriban de vuelta en el dispositivo original. MiniOS activa la sesión copiada en RAM, y los cambios en esa copia se pierden al apagar.

## La persistencia es explícita

El initrd solo habilita el manejo de persistencia cuando la línea de comandos del kernel contiene uno de estos tokens reconocidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Si ninguno de esos tokens está presente, incluso si solo hay un nombre `perch...` no reconocido, MiniOS crea una nueva capa superior escribible en RAM. Los cambios realizados durante ese arranque se descartan al apagar.

Los selectores no son todos equivalentes:

| Selector | Comportamiento de initrd |
|---|---|
| `perch` | Intenta reanudar la sesión predeterminada según los metadatos. No crea automáticamente una sesión cuando no hay ninguna utilizable o cuando fallan las comprobaciones de compatibilidad. |
| `perchdir=resume` | Intenta la predeterminada de los metadatos y puede crear automáticamente un nuevo reemplazo compatible. Este es el comportamiento actual del menú de arranque al reanudar. |
| `perchdir=new` | Asigna un directorio cuyo ID numérico es uno mayor que el ID numérico existente más alto. Nunca reutiliza un directorio existente. |
| `perchdir=ask` | Ofrece sesiones existentes tras encontrar un almacenamiento reanudable y la predeterminada. Una sesión existente incompatible requiere confirmación. En almacenamiento vacío, usa `perchdir=new` para crear la primera sesión. |
| `perchdir=NUMBER` | Usa ese directorio si existe. Si no existe, la selección puede recurrir a la predeterminada registrada en los metadatos; no reserva el número solicitado. |

Otros parámetros de persistencia reconocidos sin selector entran en la misma ruta de reanudación heredada que `perch` solo: solicitan persistencia, pero no habilitan la creación automática. Si la selección o activación no produce una capa superior utilizable, el arranque continúa normalmente con la capa superior RAM y publica una advertencia de fallo.

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

MiniOS utiliza 256 MiB como margen de asignación predeterminado y umbral de advertencia por poco espacio. El cálculo usa bloques de sistema de archivos de 1024 bytes. `perchreserve` acepta un número entero sin signo y sin unidad, tiene un límite de 4096 y usa 256 por defecto si falta o es inválido. El margen reduce el espacio ofrecido a un contenedor nuevo o en expansión. No es una cuota: una sesión nativa o escrituras posteriores aún pueden consumir el espacio restante del sistema de archivos. El arranque advierte cuando el espacio libre actual está en o por debajo del umbral.

Los tamaños de contenedor usan cantidades enteras asignadas en MiB:

- Un número solo, `M`, o `MB` significa MiB.
- `G` o `GB` multiplica el número por 1000 MiB.
- `T` o `TB` multiplica el número por 1.000.000 MiB.
- La solicitud lógica máxima es de 1.000.000 MiB, limitada además por el espacio disponible tras la reserva.
- El Gestor de sesiones de MiniOS limita archivos raw y LUKS a 4000 MiB en FAT32. Durante la activación en initrd el límite se aplica de forma fiable a LUKS, mientras que una solicitud raw sobredimensionada puede llegar a la asignación y fallar en vez de reducirse.
- Las sesiones nuevas raw y LUKS tienen por defecto 4000 MiB.
- Una nueva sesión DynFileFS creada por initrd usa por defecto la capacidad disponible tras la reserva, redondeada hacia abajo al múltiplo de 1000 MiB cuando es posible.
- Una nueva sesión dynblk usa por defecto un dispositivo de bloque virtual thin de 16 GiB cuando `perchsize` no se especifica. El tamaño virtual dynblk explícito se limita a 512 GiB; los archivos de respaldo físicos se crean bajo demanda y dependen del espacio libre del host y la admisión de memoria dynblk.

El crecimiento del contenedor es a mejor esfuerzo y no se admite la reducción.`perchsize` no determina el tamaño de sesiones nativas ni de SquashFS. El Gestor de sesiones de MiniOS usa 4000 MiB por defecto para la creación raw/DynFileFS/LUKS y 16 GiB para dynblk; consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de almacenamiento

Todos los modos exitosos deben proporcionar el upper writable que espera el sistema de archivos union seleccionado. Montar un backend no prueba por sí solo que la persistencia esté activa. Native, DynFileFS, dynblk, raw y LUKS pueden actualizar los metadatos persistentes de la sesión antes de la validación union; SquashFS retrasa ese commit de metadatos. El estado protegido de arranque actual solo se publica después de que la unión raíz final confirma el uso del upper esperado.

### Nativo

El modo nativo primero excluye sistemas de archivos no POSIX conocidos como FAT, exFAT y NTFS. Luego prueba el comportamiento real del sistema de archivos creando un archivo y un enlace simbólico y comprobando los cambios de modo ejecutable. Si la prueba tiene éxito, el directorio de sesión numerado se monta con bind directamente como área escribible.

Si se sabe que el sistema de archivos es inadecuado o la prueba POSIX falla, el modo nativo recurre a DynFileFS. Un fallo tras la activación nativa se revierte; un candidato vacío nuevo se elimina cuando puede hacerse de forma segura.

### DynFileFS

DynFileFS es el backend de contenedor basado en FUSE. Almacena una imagen de bloque lógico en `changes.dat` más sus archivos de segmento numerados. El helper debe montar correctamente y exponer `virtual.dat`; de lo contrario, la activación falla en vez de crear accidentalmente un archivo solo RAM con un nombre que parece persistente.

La imagen lógica contiene ext4. Las imágenes existentes se verifican antes del montaje writable; si el resultado del chequeo del sistema de archivos supera el estado de errores corregidos, la sesión se rechaza en vez de montarla writable. El redimensionado solo permite crecer, y el sistema de archivos ext4 interno se expande cuando es posible. Para diagnóstico orientado al usuario, consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

### dynblk

El `dynblk` modo es un backend de dispositivo de bloque del kernel, independiente de DynFileFS. Cada sesión numerada posee un `volume000.db` espacio de nombres con archivos `volume001.db` hasta `volume063.db` relacionados creados bajo demanda. Al adjuntar un volumen mediante `/dev/dynblk-control` se obtiene un dispositivo de disco completo asignado dinámicamente, como `/dev/dynblk0` o `/dev/dynblk3`; MiniOS debe usar el dispositivo devuelto y no asumir que `dynblk0` está libre. Se pueden adjuntar varios volúmenes dynblk al mismo tiempo.

MiniOS crea ext4 directamente en el dispositivo de disco completo dynblk, verifica ext4 existente antes del uso writable y permite crecer hasta el límite formato-1 de 512 GiB. No se admite la reducción. El estado protegido de arranque registra exactamente el `/dev/dynblkN` usado por la sesión persistente en ejecución, por lo que al apagar se desmonta ese mismo dispositivo tras desmontar el sistema de archivos. Esto sigue siendo correcto incluso si el Gestor de sesiones adjunta temporalmente otra sesión dynblk en paralelo.

La capacidad virtual es thin: no es espacio preasignado en el host. Las escrituras reales pueden fallar por falta de espacio libre en el sistema de archivos inferior, el espacio de nombres de 64 partes de respaldo o la admisión de memoria dynblk. Un dispositivo fallido o bloqueado solo se desconecta después de que el sistema de archivos superior ya no esté montado; la recuperación valida el formato almacenado en el siguiente adjunte.

### Raw

El modo raw utiliza una imagen ext4 fija `changes.img`. Las imágenes nuevas se asignan y formatean antes de usarse. Las imágenes existentes se comprueban antes de montarlas, pueden ampliarse a un tamaño solicitado mayor y ext4 se expande para usar toda la imagen. Un fallo en la comprobación o el montaje deja el contenedor disponible para recuperación y continúa el arranque en RAM.

### LUKS

El modo LUKS utiliza un contenedor LUKS2 `changes.luks` con ext4 directamente en su interior.
Solo está disponible cuando el initrd incluye el marcador de soporte de cifrado y las herramientas necesarias. La creación solicita una entrada de confirmación coincidente. Un contenedor existente permite tres intentos de desbloqueo en la consola de arranque.

El initrd autentica antes de ampliar un archivo cifrado existente, luego comprueba y expande ext4 antes de montarlo. Si la creación, desbloqueo, comprobación, redimensionamiento o montaje fallan, MiniOS limpia el mapeo y continúa en RAM. Nunca recurre a nativo, DynFileFS, raw ni a ninguna otra persistencia sin cifrar.
Las contraseñas no se almacenan en los metadatos de la sesión ni se pasan como argumentos de comando.
Consulta [Seguridad](/maintenance-and-recovery/Security).

### SquashFS

El initrd solo puede activar una sesión SquashFS existente; no puede crear un nuevo `changes.sb`. La activación valida metadatos estrictos y de valor único para el snapshot, incluyendo su digest, tamaños comprimido y descomprimido, número de entradas, tipo de unión y política de guardado. También verifica el tipo y tamaño exacto del archivo, RAM y swap disponibles, el digest SHA-256 antes y después de la extracción, y la compatibilidad actual de la unión.

El snapshot se extrae con manejo estricto de errores y xattr en una imagen ext4 temporal y limitada en RAM. Para OverlayFS, esa imagen contiene directorios separados `changes` y `workdir`; para AUFS, su raíz es la rama escribible.
Metadatos mal formados, memoria insuficiente, cambios en el digest, errores de extracción o una política inválida provocan el fallo de la activación y dejan el arranque en su capa superior RAM habitual.

Una sesión marcada como `dirty` significa que el arranque anterior no completó la transición de apagado limpio. SquashFS entonces advierte y restaura el último `changes.sb` guardado exitosamente; los cambios no guardados del arranque interrumpido no constituyen una segunda generación de reversión.

El Gestor de sesiones de MiniOS y el backend de guardado del sistema crean y reemplazan atómicamente snapshots SquashFS mediante captura exacta. La activación durante el arranque puede leer un snapshot existente desde almacenamiento FAT, exFAT o NTFS escribible porque la extracción ocurre en la capa superior ext4 temporal. La creación y el guardado exacto siguen dependiendo del sistema de archivos: su área de staging privada debe preservar enlaces, propiedad, modos, xattrs, ACLs, capacidades y whiteouts de la unión, por lo que el guardado actual requiere un sistema de archivos POSIX adecuado. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Activación de la unión y límite de recuperación

Para AUFS, la raíz de cambios activada se convierte en la rama cero escribible. Para OverlayFS, el initrd construye `upperdir` y `workdir` bajo la raíz de cambios activada y monta los módulos de solo lectura como directorios inferiores. Luego, el initrd verifica la rama en vivo AUFS o OverlayFS `upperdir` antes de publicar la persistencia como activa.

Si falla un backend de persistencia, actualización de metadatos o esta verificación, se desmontan los puntos de montaje cuando es posible, no se publica ningún estado de persistencia exitoso y el arranque escribible continúa en RAM. Si falla la construcción de la unión raíz, se entra en el shell fatal de initramfs. Salir de ese shell puede permitir que la configuración continúe con una raíz inválida; no es una reparación ni una alternativa segura. AUFS conserva la adición de ramas de módulos a mejor esfuerzo, pero una unión incompleta cruza el límite de recuperación: MiniOS no marca la persistencia como activa.

Los fallos en la comprobación de contenedores evitan deliberadamente montar una sesión sospechosa en modo escritura.
No reemplaces ni reconstruyas archivos de sesión durante el arranque. Preserva primero el almacenamiento afectado; consulta [Respaldar MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## Estado activo, en ejecución y de arranque actual

En los metadatos duraderos de sesión, `default=` es la sesión **activa** seleccionada para el próximo reinicio, mientras que `running=` es la sesión registrada como la que proporciona el arranque actual. La activación escribe ambos campos y marca esa sesión `dirty`.
Tras desmontar las persistencias durante un apagado limpio, MiniOS elimina `running=` y marca la sesión `clean`.

Estos campos de metadatos pueden quedar obsoletos tras un fallo, error al escribir metadatos, error al construir la unión, copia del almacenamiento o apagado interrumpido. Los componentes en tiempo de ejecución que permiten guardar no confían solo en `running=`. Usan el estado protegido de arranque actual del initrd, vinculado al ID de arranque, sesión numérica, modo, identidad real del almacenamiento, estado writable, durabilidad, generación activa verificada y, para dynblk, el dispositivo exacto adjunto `/dev/dynblkN`. Un registro de arranque actual fallido o ausente significa que la persistencia no debe tratarse como destino de guardado aprobado.

Con `toram` y una solicitud de persistencia reconocida, el almacenamiento de la sesión se copia en RAM antes de la activación. La sesión copiada puede ser writable y proporcionar el upper en ejecución, pero su estado de arranque actual se marca como no duradero. Los cambios en esa copia RAM no vuelven al dispositivo original y se pierden al apagar.

Para orientación operativa relacionada, consulta [Modos de arranque](/using-minios/Boot-Modes), [Parámetros de arranque](/reference/Boot-Parameters), [Sesiones y persistencia](/using-minios/Sessions-and-Persistence), [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Seguridad](/maintenance-and-recovery/Security), y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).
