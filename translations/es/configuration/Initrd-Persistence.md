# Persistencia en initrd

MiniOS construye el sistema raíz en vivo a partir de módulos de solo lectura y una capa superior escribible. El initrd decide si esa capa superior corresponde a una sesión persistente numerada o a un directorio temporal en RAM. Esta página describe esa decisión y el proceso de activación durante el arranque. Para los controles visibles para el usuario, consulta [Modos de arranque](./Boot-Modes.md) y [Parámetros de arranque](./Boot-Parameters.md).

## La persistencia es explícita

El initrd habilita el manejo de la persistencia solo cuando la línea de comandos del kernel contiene uno de estos tokens reconocidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Si ninguno de esos tokens está presente, incluso cuando solo hay un nombre `perch...` no reconocido, MiniOS crea una nueva capa superior escribible en RAM. Los cambios realizados durante ese arranque se descartan al apagar.

Los selectores no son todos equivalentes:

| Selector | Comportamiento del initrd |
|---|---|
| `perch` | Intenta reanudar la opción predeterminada de los metadatos. No crea automáticamente una sesión cuando no hay ninguna utilizable o cuando fallan las comprobaciones de compatibilidad. |
| `perchdir=resume` | Intenta la opción predeterminada de los metadatos y puede crear automáticamente un reemplazo compatible nuevo. Este es el comportamiento actual de reanudación en el menú de arranque. |
| `perchdir=new` | Asigna un directorio cuyo ID numérico es uno mayor que el ID numérico existente más alto. Nunca reutiliza un directorio existente. |
| `perchdir=ask` | Ofrece sesiones existentes y la opción de una nueva sesión. Una sesión existente incompatible requiere confirmación. |
| `perchdir=NUMBER` | Usa ese directorio si existe. Si no existe, la selección puede recurrir al valor predeterminado registrado en los metadatos; no reserva el número solicitado. |

Otros parámetros de persistencia reconocidos sin selector ingresan en la misma ruta heredada de reanudación que `perch` solo: solicitan persistencia, pero no habilitan la creación automática. Si la selección o activación no logra producir una capa superior utilizable, el arranque continúa normalmente con la capa superior en RAM y se publica una advertencia de fallo.

## Almacenamiento de sesiones y ubicación

El almacenamiento normal es el directorio `changes` junto a los datos de MiniOS, con directorios de sesión numerados y metadatos `session.conf` o `session.json`:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

El almacenamiento también puede seleccionarse como un dispositivo más una ruta opcional. Las formas aceptadas incluyen una ruta directa `/dev/...`, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` y `askdisk:custom:path`. El sufijo delimitado por dos puntos se convierte en una ruta bajo el dispositivo seleccionado; la sintaxis de barra después de `askdisk` pierde silenciosamente esa ruta personalizada. Un subdirectorio seleccionado se monta mediante bind como almacenamiento de sesiones. MiniOS también puede detectar una partición de persistencia en la misma unidad y almacenamiento de persistencia compatible con Ventoy.

Antes de la selección de sesión, el initrd debe montar la ubicación con permisos de escritura y comprobar que puede crear y eliminar un marcador en el almacenamiento. Un dispositivo de bloques que no pueda abrirse para escritura, un montaje de solo lectura, una ruta no disponible o una prueba de escritura fallida rechazan la persistencia para ese arranque. Las sesiones existentes no se consideran confiables solo porque sus archivos puedan leerse.

## Selección y compatibilidad

Los metadatos de la sesión registran el modo de almacenamiento y pueden registrar la versión de MiniOS, la edición, el sistema de archivos en unión y el tamaño del contenedor. La reanudación compara el modo, versión, edición y unión registrados con el modo solicitado y el sistema actual. Los campos de compatibilidad heredados que faltan no se consideran incompatibilidades.

El literal `perchdir=resume` crea una nueva sesión numerada cuando su valor predeterminado está ausente o cuando una incompatibilidad en el modo, versión, edición o unión registrados hace que ese valor predeterminado no sea adecuado. `perch` solo, una selección numérica directa y otras solicitudes de reanudación heredadas rechazan el reemplazo automático y continúan en RAM tras un fallo en la selección. `perchdir=ask` muestra información de compatibilidad y permite una anulación explícita. Una nueva sesión utiliza por defecto `native` a menos que se haya solicitado otro modo.

El modo de almacenamiento forma parte de la compatibilidad. Si la selección llega al despacho del backend, un modo solicitado desconocido recurre a `native`, cuyo sondeo puede entonces seleccionar DynFileFS en un almacenamiento inadecuado. Una sesión existente con un modo registrado diferente puede fallar en la comprobación de compatibilidad anterior; una solicitud de reanudación heredada entonces continúa en RAM en lugar de llegar a ese fallback.

## Reserva de espacio y tamaños

MiniOS mantiene por defecto 256 MiB libres en el sistema de archivos de persistencia. La reserva y las comprobaciones de espacio libre usan bloques de sistema de archivos de 1024 bytes. `perchreserve` acepta un número entero sin signo, sin unidad, tiene un límite de 4096 y vuelve a 256 cuando falta o es inválido. La nueva asignación y el crecimiento solicitado están limitados para que esta reserva permanezca libre. El arranque también advierte cuando el espacio libre actual está en o por debajo de la reserva.

Los tamaños de los contenedores usan cantidades enteras que se asignan en MiB:

- Un número solo, `M` o `MB` significa MiB.
- `G` o `GB` multiplica el número por 1000 MiB.
- `T` o `TB` multiplica el número por 1.000.000 MiB.
- La solicitud lógica máxima es de 1.000.000 MiB, limitada además por el espacio disponible después de la reserva.
- El Gestor de Sesiones limita los archivos raw y LUKS a 4000 MiB en FAT32. Durante la activación en initrd, el límite se aplica de forma fiable a LUKS, mientras que una solicitud raw sobredimensionada puede llegar a la asignación y fallar en lugar de reducirse.
- Las nuevas sesiones raw y LUKS tienen por defecto 4000 MiB.
- Una nueva sesión DynFileFS creada por initrd utiliza por defecto la capacidad disponible tras la reserva, redondeada hacia abajo al múltiplo de 1000 MiB cuando es posible.

El crecimiento del contenedor es a mejor esfuerzo y no se admite la reducción. `perchsize` no dimensiona sesiones nativas ni SquashFS. El Gestor de Sesiones utiliza su propio valor predeterminado de 4000 MiB para sesiones de contenedor recién creadas; consulta [Gestión de sesiones](./Session-Management.md).

## Activación del almacenamiento

Todos los modos exitosos deben proporcionar la capa superior escribible esperada por el sistema de archivos en unión seleccionado. Un montaje de backend por sí solo no es la autoridad final en tiempo de ejecución. Los modos nativo, DynFileFS, raw y LUKS pueden actualizar los metadatos de la sesión persistente antes de la validación de la unión; SquashFS difiere ese registro de metadatos. El estado protegido del arranque actual solo se publica después de que la unión raíz final se confirma utilizando la capa superior esperada.

### Nativo

El modo nativo primero excluye sistemas de archivos no POSIX conocidos como FAT, exFAT y NTFS. Luego prueba el comportamiento real del sistema de archivos creando un archivo y un enlace simbólico y comprobando los cambios en el modo ejecutable. Si la prueba tiene éxito, el directorio de sesión numerado se monta mediante bind directamente como área escribible.

Si se sabe que el sistema de archivos no es adecuado, o la prueba POSIX falla, el modo nativo recurre a DynFileFS. Un fallo tras la activación nativa se revierte; un candidato vacío nuevo se elimina cuando puede hacerse de forma segura.

### DynFileFS

DynFileFS, implementado por el asistente compatible con `dynblk`, almacena una imagen de bloque lógica en `changes.dat` más sus archivos de segmento numerados. El asistente debe montar correctamente y exponer `virtual.dat`; de lo contrario, la activación falla en lugar de crear accidentalmente un archivo solo en RAM con un nombre que parece persistente.

La imagen lógica contiene ext4. Las imágenes existentes se comprueban antes de montar en modo escritura; los resultados del chequeo del sistema de archivos por encima del estado de errores corregidos rechazan la sesión y la preservan para recuperación. El redimensionamiento solo permite crecimiento, y el sistema de archivos ext4 interno se expande cuando es posible. Consulta [Recuperación de DynFileFS](./DynFileFS-Recovery.md) para detalles sobre segmentos y reparación.

### Raw

El modo raw utiliza una imagen ext4 fija en `changes.img`. Las imágenes nuevas se asignan y formatean antes de su uso. Las imágenes existentes se comprueban antes de montar, pueden ampliarse a un tamaño solicitado mayor y el ext4 se expande para usar toda la imagen. Un fallo en la comprobación o montaje deja el contenedor disponible para recuperación y continúa el arranque en RAM.

### LUKS

El modo LUKS utiliza un contenedor LUKS2 `changes.luks` con ext4 directamente en su interior. Solo está disponible cuando el initrd incluye el marcador de soporte de cifrado y las herramientas requeridas. La creación solicita una entrada de confirmación coincidente. Un contenedor existente permite tres intentos de desbloqueo en la consola de arranque.

El initrd autentica antes de ampliar un archivo cifrado existente, luego comprueba y expande ext4 antes de montarlo. Si la creación, desbloqueo, comprobación, redimensionamiento o montaje fallan, MiniOS limpia el mapeo y continúa en RAM. Nunca recurre a nativo, DynFileFS, raw ni a ninguna otra persistencia sin cifrar. Las frases de contraseña no se almacenan en los metadatos de la sesión ni se pasan como argumentos de comando. Consulta [Seguridad](../administration/Security-Hardening.md).

### SquashFS

El initrd solo puede activar una sesión SquashFS existente; no puede crear un nuevo `changes.sb`. La activación valida metadatos estrictos y de valor único para el snapshot, incluyendo su hash, tamaños comprimido y descomprimido, número de entradas, tipo de unión y política de guardado. También comprueba el tipo de archivo y tamaño exacto, la RAM y swap disponibles, el hash SHA-256 antes y después de la extracción y la compatibilidad de la unión actual.

El snapshot se extrae con manejo estricto de errores y xattr en una imagen ext4 temporal y limitada en RAM. Para OverlayFS, esa imagen contiene los directorios `changes` y `workdir` por separado; para AUFS, su raíz es la rama escribible. Metadatos mal formados, memoria insuficiente, cambios en el hash, errores de extracción o una política inválida hacen fallar la activación y dejan el arranque en su capa superior RAM habitual.

Una sesión marcada como `dirty` significa que el arranque anterior no completó la transición de apagado limpio. SquashFS entonces advierte y restaura el último `changes.sb` guardado con éxito; los cambios no guardados del arranque interrumpido no constituyen una segunda generación de reversión.

El Gestor de Sesiones y el backend de guardado del sistema crean y reemplazan snapshots SquashFS de forma atómica usando captura exacta. La activación durante el arranque puede leer un snapshot existente desde almacenamiento FAT, exFAT o NTFS escribible porque la extracción ocurre en la capa superior temporal ext4. La creación y el guardado exacto siguen dependiendo del sistema de archivos: su área de preparación privada debe preservar enlaces, propietarios, modos, xattrs, ACLs, capacidades y whiteouts de la unión, por lo que el guardado actual requiere un sistema de archivos POSIX adecuado. Consulta [Gestión de sesiones](./Session-Management.md).

## Activación de la unión y límite de recuperación

Para AUFS, la raíz de cambios activada se convierte en la rama cero escribible. Para OverlayFS, el initrd construye `upperdir` y `workdir` debajo de la raíz de cambios activada y monta los módulos de solo lectura como directorios inferiores. Luego, el initrd verifica la rama activa de AUFS o el `upperdir` de OverlayFS antes de publicar la persistencia como activa.

Si un backend de persistencia, una actualización de metadatos o esta verificación falla, los montajes se revierten donde sea posible, no se publica ninguna autoridad de ejecución exitosa y el arranque escribible continúa en RAM. El fallo al construir la unión raíz lleva a la shell fatal de initramfs. Salir de esa shell puede permitir que la configuración continúe con una raíz inválida; esto no es una reparación ni un fallback seguro. AUFS mantiene la mejor intención de añadir ramas de módulos, pero una unión incompleta cruza el límite de recuperación: MiniOS no publica autoridad de persistencia exitosa.

Los fallos en la comprobación de contenedores evitan deliberadamente la recuperación escribible. Conserva la sesión y sigue [Recuperación de respaldo](../administration/Backup-Recovery.md), [Recuperación de DynFileFS](./DynFileFS-Recovery.md) o [Solución de problemas](../administration/Troubleshooting.md) en vez de reemplazar archivos de sesión durante el arranque.

## Estado activo, en ejecución y de arranque actual

En los metadatos duraderos de la sesión, `default=` es la sesión **activa** seleccionada para la próxima reanudación, mientras que `running=` es la sesión registrada como suministrando el arranque actual. La activación escribe ambos campos y marca esa sesión como `dirty`. Después de que los montajes de persistencia hayan desaparecido durante un apagado limpio, MiniOS elimina `running=` y marca la sesión como `clean`.

Estos campos de metadatos pueden estar desactualizados tras un fallo, error de escritura de metadatos, fallo en la construcción de la unión, copia del almacenamiento o apagado interrumpido. Los procesos en ejecución que necesitan autorizar el guardado no confían solo en `running=`. Usan el estado protegido del arranque actual del initrd, vinculado al ID de arranque, sesión numérica, modo, identidad real del almacenamiento, estado escribible, durabilidad y generación activa verificada. Un registro de arranque actual fallido o ausente significa que la persistencia no debe considerarse un destino autorizado para guardar.

Con `toram` y una solicitud de persistencia reconocida, el almacenamiento de sesiones se copia en RAM antes de la activación. La sesión copiada puede ser escribible y puede proporcionar la capa superior en ejecución, pero su estado de arranque actual se marca como no duradero. Los cambios en esa copia en RAM no regresan al dispositivo original y se pierden al apagar.

Para orientación operativa relacionada, consulta [Modos de arranque](./Boot-Modes.md), [Parámetros de arranque](./Boot-Parameters.md), [Gestión de sesiones](./Session-Management.md), [Recuperación de DynFileFS](./DynFileFS-Recovery.md), [Recuperación de respaldos](../administration/Backup-Recovery.md), [Seguridad](../administration/Security-Hardening.md) y [Solución de problemas](../administration/Troubleshooting.md).
