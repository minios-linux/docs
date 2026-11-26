---
updated: 2026-10-15
program_commits:
    minios-session-manager: 120fdba6a6fe1838f1aaa3c153aafc080829798d
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Sesiones y persistencia

Las sesiones MiniOS conservan los cambios realizados en el sistema en vivo después de reiniciar. Cada sesión es un directorio numerado dentro de `minios/changes/`; los módulos MiniOS de solo lectura permanecen sin cambios y la sesión seleccionada proporciona la capa de sistema de archivos de unión editable.

Utiliza el Gestor de sesiones de MiniOS desde un sistema MiniOS en ejecución:

```bash
minios-session-manager
```

La herramienta equivalente en línea de comandos es `minios-session`. Todos los comandos excepto help requieren privilegios de administrador; ejecuta los ejemplos con `sudo`.

Estos flujos de trabajo con sesiones numeradas no están disponibles al seleccionar **el complemento de persistencia Ventoy** de imagen. Esa imagen proporciona un entorno persistente seleccionado en Ventoy, sin metadatos de sesión MiniOS. Los arranques Ventoy normales sin un backend de complemento seleccionado mantienen las sesiones MiniOS; consulta [Ventoy](/installing-minios/installation-tools/Ventoy).

## Modos de sesión

| Modo | Almacenamiento | Restricciones principales | MiniOS LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Cambios guardados directamente en el directorio de sesión | Requiere un sistema de archivos con permisos de escritura que conserve los metadatos y las operaciones de Linux que MiniOS necesita. La capacidad depende del espacio libre del almacenamiento subyacente; `perchsize` no se aplica. | No |
| `dynfilefs` | Ampliable `virtual.dat` respaldado por archivos de formato 600, con ext4 en su interior | Funciona en sistemas de archivos POSIX, FAT32, NTFS y exFAT con permisos de escritura. Asigna espacio para los datos según se necesita. | Sí |
| `dynblk` | Sistema de archivos ext4 ligero en un dispositivo de bloques del kernel respaldado por `volumeNNN.db` archivos | Requiere la CLI DynBlk, el módulo del kernel y compatibilidad con initrd. De forma predeterminada, el tamaño creado durante el arranque es de hasta 16 GiB; el máximo se indica mediante `dynblk limits`. Las asignaciones residentes en disco usan una caché de metadatos limitada. | Sí |
| `vmdk` | Sistema de archivos ext4 ligero en un VMDK disperso estándar dividido, expuesto por el controlador DynBlk | Usa `volume.vmdk` y `volume-sNNN.vmdk`. Sin compresión. Requiere `vmdk-session-v1` en el indicador de capacidad de initrd en ejecución. El mismo tamaño predeterminado manual de 16 GiB que DynBlk; consulta `dynblk limits --format vmdk` para conocer los límites. | Sí |
| `raw` | Un único archivo `changes.img` que contiene ext4 | Capacidad lógica fija; solo se amplía explícitamente. Funciona en sistemas de archivos POSIX, FAT32, NTFS y exFAT con permisos de escritura; FAT32 está limitado a 4000 MiB. | Sí |
| `squashfs` | Instantánea comprimida en `changes.sb`; la capa superior modificable en tiempo de ejecución se reconstruye en RAM | `perchsize` no se aplica. Las instantáneas existentes se pueden restaurar desde medios compatibles con escritura; para guardar exactamente se requiere un almacenamiento de persistencia compatible con POSIX. | No |

Raw, DynFileFS, DynBlk y VMDK pueden incluir opcionalmente una capa de cifrado LUKS2. El backend de almacenamiento sigue siendo el modo de sesión, y los metadatos de sesión registran el cifrado por separado. DynFileFS y los contenedores raw creados con `minios-session` tienen un tamaño predeterminado de 4000 MiB; DynBlk y VMDK tienen un tamaño predeterminado de 16 GiB. Los valores de tamaño se asignan en MiB; `GB` y `TB` convierten a 1000 y 1 000 000 MiB. Raw está limitado a 4000 MiB en FAT32, esté cifrado o no. DynFileFS mantiene las páginas de índice en disco y las almacena en caché según sea necesario. DynBlk mantiene las tablas de asignación en disco y usa una caché de metadatos limitada en RAM, cuyo valor predeterminado es 1 MiB en lugar de un porcentaje de RAM. Sus vectores de extensiones y archivos, así como sus directorios, crecen según las partes declaradas, mientras que para llenar los datos no se necesita mantener en memoria el mapa completo. Consulta el límite de capacidad instalado con `dynblk limits --format dynblk`. Las escrituras reales siguen estando limitadas por el espacio libre del sistema de archivos subyacente y la admisión de recursos del backend. Las operaciones de cambio de tamaño del contenedor solo pueden ampliar una sesión; no se admite reducirla.

Cuando el entorno de ejecución DynFileFS actual monta por primera vez un contenedor existente de formato 400 o 500, lo convierte automáticamente in situ al formato 600 si la división heredada tiene un número par de MiB. Si la división tiene un número impar de MiB, se rechaza la operación sin modificar el origen. Esto actualiza el formato del contenedor, no el modo de `dynfilefs`. Conserva una copia de seguridad independiente y actualiza el initrd de arranque antes de convertirlo; las herramientas auxiliares antiguas no pueden abrir el contenedor convertido.

El modo nativo es la opción más sencilla y rápida en un sistema de archivos compatible.
Usa DynFileFS cuando el sistema de archivos de persistencia no pueda representar los metadatos de Linux.
Usa DynBlk cuando quieras un dispositivo de bloques real del kernel con archivos de respaldo dispersos; el controlador puede mantener conectados a la vez varios volúmenes DynBlk independientes, y Session Manager usa la ruta del dispositivo que devuelve el controlador, en lugar de suponer que `/dev/dynblk0` está libre. DynBlk y VMDK no están disponibles mientras UEFI Secure Boot esté habilitado, porque MiniOS no firma el módulo externo del kernel DynBlk. Por eso, Installer y Session Manager ocultan estos modos y rechazan las solicitudes explícitas de creación antes de intentar cargar el módulo.
Usa raw cuando se requiera una asignación fija, añade LUKS2 cuando la sesión deba estar cifrada y usa SquashFS para obtener una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se pueden crear sesiones en medios de solo lectura. El initrd puede leer y activar una instantánea existente de SquashFS almacenada en FAT, exFAT o NTFS con permisos de escritura, porque extrae la instantánea en una capa superior ext4 temporal. Crear o guardar una instantánea exacta es distinto: el almacén de persistencia debe admitir los metadatos POSIX necesarios y una publicación privada y duradera. El árbol de trabajo para la captura exacta utiliza RAM de confianza cuando está disponible, y recurre a un espacio de trabajo en disco si RAM no es suficiente.

## Selección de arranque

Cualquier parámetro de persistencia reconocido activa la gestión de la persistencia. Los menús de arranque de MiniOS normalmente ofrecen las opciones de reanudar, crear una sesión nueva, seleccionar una sesión y arrancar sin persistencia. La descripción canónica de la semántica de selección, compatibilidad, alternativa y activación está en [Persistencia de initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|---------|
| `perch` | Usa la ruta heredada de reanudación con el mejor esfuerzo. Intenta usar el valor predeterminado de los metadatos, pero no crea un reemplazo si ninguno es utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de los metadatos y, si no existe o no es compatible, permite que initrd cree un reemplazo nuevo y compatible. Este es el comportamiento actual de reanudación del menú de arranque. |
| `perchdir=setup` | Abre el selector interactivo de backend de persistencia y, a continuación, asigna una sesión nueva numerada. Este es el comportamiento actual de **Iniciar nueva sesión** . |
| `perchdir=new` | Asigna directamente una sesión nueva numerada desde el backend solicitado o predeterminado, con los ajustes de cifrado, compresión y tamaño indicados, sin abrir el selector de backend. |
| `perchdir=ask` | Selecciona una sesión existente; si el almacén está vacío, inicia automáticamente el mismo proceso de configuración que `perchdir=setup`. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Usa una ubicación de persistencia en un dispositivo, incluidas las formas `/dev/...` y `label:...` que gestiona initrd. |
| `perchmode=<mode>` | Define `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra con LUKS2 una sesión nueva Raw, DynFileFS, DynBlk o VMDK. En las sesiones existentes, el cifrado se determina únicamente a partir de los metadatos. |
| `perchcomp=<codec>` | Selecciona la compresión del backend DynBlk para una sesión nueva DynBlk. La compresión se fuerza a `none` cuando DynBlk se cifra con LUKS2. |
| `perchsize=<size>` | Define el tamaño de un contenedor nuevo o más grande; los valores sin unidad se asignan en MiB y se aceptan los sufijos `MB`, `GB` y `TB`. |

Si no se especifica un modo para una sesión nueva, el arranque usa el modo nativo. En FAT32/NTFS/exFAT, o si fallan las comprobaciones del sistema de archivos nativo, el inicio prefiere DynBlk si el auxiliar está disponible y Secure Boot lo permite; de lo contrario, recurre a DynFileFS. Esta alternativa no cambia el modo de almacenamiento de una sesión existente. Un contenedor Raw nuevo tiene un tamaño predeterminado de 4000 MiB. Las sesiones de arranque nuevas DynFileFS, DynBlk y VMDK sin `perchsize` usan hasta 16 GiB; si queda menos espacio de respaldo tras reservar el margen de seguridad, se reduce el tamaño automático. Se siguen aplicando las comprobaciones de capacidad del backend. El crecimiento explícito de DynBlk está sujeto al límite del backend instalado, que se consulta con `dynblk limits --format dynblk`. Con Secure Boot, initrd no ofrece DynBlk/VMDK y considera no disponible una sesión DynBlk/VMDK especificada explícitamente o reanudada, en lugar de intentar cargar el módulo sin firmar.
Las sesiones SquashFS se pueden capturar desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`. La configuración de initrd crea únicamente metadatos de sesión de generación cero y mantiene la capa superior escribible en RAM. El sistema en ejecución crea la primera instantánea `changes.sb` cuando se solicita o al apagarse.

Al reanudar, MiniOS comprueba la versión, edición, sistema de archivos de unión y modo registrados. El valor literal `perchdir=resume` puede crear una sesión nueva en lugar de usar un valor predeterminado inexistente o incompatible. `perch`, la selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir el uso de una sesión incompatible. Si la selección o activación sigue fallando, el arranque normalmente continúa con una capa superior RAM y una advertencia de persistencia.

El almacén de sesiones tiene este formato:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los ID predeterminados y en ejecución, así como el modo, la versión, la edición, el sistema de archivos union, el tamaño, el estado y la configuración específica del modo de cada sesión.
Son metadatos persistentes que confirma la implementación de arranque y no constituyen por sí solos una prueba del estado actual del entorno de ejecución. No los edites ni muevas datos de sesiones numeradas mientras haya una sesión montada; utiliza el Gestor de sesiones de MiniOS o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La **activa** es la sesión predeterminada seleccionada para el próximo inicio.
- Conceptualmente, la **en ejecución** es la sesión cuya capa de escritura realmente proporciona persistencia al inicio actual.

El campo persistente `running=` registra esa relación prevista. Un fallo, una construcción de unión fallida, un almacenamiento copiado o un apagado interrumpido pueden dejarlo desactualizado incluso cuando el inicio actual está usando RAM u otra sesión. Por eso, operaciones como el guardado de SquashFS requieren el estado protegido del initrd, vinculado al boot-ID y el upper montado verificado; no confían solo en `running=` por sí solo. Consulta [Estado activo, en ejecución y de inicio actual](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Activar una sesión cambia el próximo inicio pero no modifica el sistema de archivos union actual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sesión activa no se puede eliminar ni convertir en el lugar. Una sesión en ejecución normalmente no se puede eliminar, exportar, copiar, redimensionar ni convertir. La limpieza también protege ambos IDs.

<a id="command-reference"></a>

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
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sin un modo selecciona nativo. La creación de SquashFS captura los cambios actuales en vivo y no tiene tamaño fijo. Su política de guardado al apagar es por defecto `shutdown`; el guardado periódico está desactivado por defecto.

Guarda una sesión SquashFS en ejecución, o una sesión de persistencia compatible que el arranque actual copió en RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Para SquashFS, `save` reconstruye la instantánea actual. Para una sesión Raw respaldada por RAM, DynFileFS, DynBlk, VMDK o SquashFS, escribe la copia RAM de vuelta al almacén de persistencia original. `--as-new` conserva la sesión almacenada original y publica el estado RAM bajo un nuevo número de sesión. El medio original debe seguir presente, ser escribible y coincidir con la identidad del sistema de archivos registrada al arrancar.

Configura el guardado automático de SquashFS por separado:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Los intervalos periódicos válidos son `30`, `60`, `120`, `240`, y `480` minutos; `0` desactiva el guardado periódico. Las opciones de apagado y guardado periódico son independientes.

Exportar e importar `.tar.zst`archivos:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Solo se aceptan importaciones de `.tar.zst` . Las rutas y los miembros del archivo se validan y la extracción está limitada. `--auto-convert` elige un modo compatible para el sistema de archivos actual. `--force-mode <mode>` selecciona explícitamente un modo disponible. La exportación, copia/clonación genérica y conversión no están soportadas para sesiones SquashFS; utiliza su flujo de guardado y sigue [Respaldo de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) en vez de reconstruir o copiar manualmente los internos de una sesión en vivo.

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

`copy` es una copia lógica del sistema de archivos y siempre asigna un nuevo ID de sesión. Puede cambiar el backend, la capacidad o el cifrado y crea identidades nuevas de ext4 y LUKS. `clone` copia físicamente un backend separado y conserva su encabezado LUKS, keyslots, UUID de LUKS y UUID de ext4. `convert` reemplaza la fuente por defecto; usa `--new-session` para conservar la fuente. El tamaño solo es relevante para un destino contenedor.

Ampliar, eliminar o limpiar sesiones:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

El redimensionamiento es compatible con sesiones DynFileFS, DynBlk, VMDK y raw, incluidas las cifradas, y requiere un tamaño mayor al actual. El redimensionamiento de DynBlk amplía primero el dispositivo de bloque virtual y luego expande su sistema de archivos ext4; no preasigna la nueva capacidad virtual. La limpieza por defecto elimina sesiones con más de 30 días.

Todos los comandos aceptan `--json`, y se puede seleccionar un almacén de sesiones diferente con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Escritura diferida de sesión respaldada por RAM

Cuando initrd copia una sesión de persistencia compatible en RAM con `perchtoram`, la sesión en ejecución deja de escribir directamente en su backend original. MiniOS registra el almacenamiento original por UUID del sistema de archivos y número de sesión, en lugar de depender de un `/dev/sdX` nombre. Session Manager mantiene visible esa sesión RAM incluso si el dispositivo original se desconecta temporalmente.

Si el almacenamiento original está presente, es escribible y no ha cambiado, **Guardar ahora** escribe el estado RAM de vuelta en la sesión original. **Guardar en almacenamiento como nueva sesión** mantiene intacta la fuente almacenada y publica el estado RAM como una nueva sesión numerada. Los equivalentes en la CLI son `minios-session save <id>` y `minios-session save <id> --as-new`. Al guardar, se informa el progreso de la copia y se puede cancelar antes de la fase de publicación; la publicación se completa de forma atómica una vez iniciada.

Si el medio original falta, es de solo lectura, ya no coincide con la identidad de arranque o la sesión original cambió por separado, se rechaza la escritura diferida en lugar de redirigir a otro dispositivo por nombre. Vuelva a conectar el medio original e intente de nuevo, o utilice guardar como nueva sesión si la sesión original ha divergido. Las sesiones nativas de directorio no se copian mediante `perchtoram`: una solicitud exitosa de RAM inicia en su lugar un nuevo contenedor vacío, sin importar datos nativos. Use `perchtoram=off` para conservar esa sesión nativa. Durante un restablecimiento de sesión nativa, la copia está deshabilitada para ese arranque y así se preservan los datos retenidos.

## Restablecer una sesión incompatible

El menú de inicio **Elegir una sesión guardada** puede restablecer una sesión incompatible antes de la activación. **Restablecer, conservar configuración** elimina el software instalado por el sistema, pero mantiene la configuración y los datos del sistema. **Restablecer, conservar datos** también restablece la configuración general del sistema. Ambas opciones conservan `/home` y `/root`, incluyendo configuraciones personales y aplicaciones instaladas en el directorio personal, cuentas, contraseñas y claves. Los archivos instalados manualmente en otras ubicaciones no listadas también pueden permanecer; esto no es una eliminación completa del software.

El restablecimiento requiere espacio libre suficiente para una segunda copia de los datos que se conservarán. Si la sustitución del directorio falla o se interrumpe, se revierte o recupera en el siguiente montaje. La reanudación automática nunca restablece una sesión de forma silenciosa. Para SquashFS, el restablecimiento solo afecta a la capa restaurada de RAM hasta que un guardado exitoso publique la nueva instantánea y su información de compatibilidad. Realiza una copia de seguridad de los datos importantes antes de restablecer; consulta [Detalles de persistencia](/reference/boot-process/Persistence-Internals).

## Comportamiento de guardado de SquashFS

Una sesión de SquashFS se desempaqueta en RAM para la capa editable en ejecución. Al guardar, se reconstruye y valida una instantánea exacta, que luego reemplaza atómicamente `changes.sb`.
No se conserva ninguna generación de reversión. Guardar ahora está disponible desde el icono de la bandeja, el Gestor de sesiones de MiniOS, o `minios-session save` independientemente de la política automática.

En cada guardado, MiniOS copia una vista estable del árbol modificado en el almacenamiento privado de RAM cuando la memoria lo permite. La compresión escribe **una** imagen en un directorio privado dentro de la sesión numerada. Solo después de verificar el contenido del sistema de archivos, el hash, la identidad y la sincronización duradera, el proceso de guardado reemplaza `changes.sb`. No existe una segunda imagen comprimida completa en RAM ni una segunda escritura de esa imagen en el dispositivo de persistencia. Si hay muy poca RAM para el árbol, solo ese árbol de trabajo se traslada al disco; la imagen comprimida candidata aún requiere una escritura. Consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para las políticas de escritura de caché y registro.

Los diagnósticos de arranque para una sesión duradera de SquashFS se almacenan en sus `boot-logs/minios/` y `boot-logs/live/` directorios. No dependen de una instantánea de apagado exitosa y permanecen disponibles incluso cuando no se pudieron guardar los últimos cambios en la capa superior de RAM. El almacenamiento de respaldo debe seguir siendo editable; los archivos de registro ordinarios pueden ser temporales si `LIVE_LOG_STORAGE=volatile` está seleccionado.

El guardado al apagar se implementa mediante el disparador de apagado principal de MiniOS y el backend de `minios-squashfs-save`, por lo que no depende de que el Gestor de sesiones de MiniOS esté abierto o instalado. El guardado periódico se verifica cada 30 minutos mediante un temporizador de systemd o un proceso de SysV, ambos llaman al mismo backend de autoguardado. La reconstrucción de la instantánea consume CPU y escribe la instantánea completa; se recomienda un intervalo de una hora o más.

Durante la operación de RAM con soporte en SquashFS, una instantánea recién capturada y activada de SquashFS puede asumir el control del destino de guardado en ejecución. Después de ese traspaso, la instantánea anterior en ejecución puede eliminarse sin reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Esta excepción solo aplica para un traspaso válido de arranque actual de SquashFS. Otros modos de persistencia en ejecución siguen protegidos contra la eliminación.

## Cifrado

LUKS2 es una capa de cifrado opcional sobre Raw, DynFileFS, DynBlk o almacenamiento de sesión VMDK; no es un modo de sesión independiente. Solo está disponible cuando `/run/initramfs/etc/minios-initramfs-crypt` contiene `luks-layer-v1` y las herramientas y capacidades del backend seleccionado están disponibles. La compresión del backend DynBlk se desactiva cuando se selecciona LUKS2.

La creación interactiva de LUKS solicita la frase de acceso dos veces. Las operaciones que leen o crean datos LUKS pueden leerla desde la entrada estándar con `--password-stdin`. Las frases de acceso no se colocan en los argumentos de comando ni en los metadatos de la sesión. Al arrancar, el initrd solicita la frase de acceso en la consola. Tres intentos fallidos detienen el arranque de forma fatal; MiniOS no continúa con texto plano, RAM, otro backend ni una sesión de reemplazo bajo la misma solicitud.

Para una sesión Raw, DynFileFS, DynBlk o VMDK cifrada, inactiva y desconectada, el Gestor de Sesiones ofrece **Cambiar frase de acceso...**. El equivalente en la línea de comandos es:

```bash
sudo minios-session change-passphrase <id>
```

Solicita la frase de acceso actual, la nueva frase de acceso y la confirmación. Con `--password-stdin`, proporcione esas tres líneas en ese orden. El keyslot seleccionado se reemplaza sin reformatear ni volver a cifrar todos los archivos. Las sesiones activas, en ejecución o montadas deben desconectarse primero; los keyslots LUKS adicionales gestionados fuera del Gestor de Sesiones no se modifican.

Las exportaciones cifradas contienen archivos de sesión lógicos descifrados, no el backend cifrado. Al importar, copiar o convertir a LUKS se crea un nuevo backend cifrado con nuevas identidades.

## Montar una sesión inactiva

Session Manager puede montar una sesión Raw, DynFileFS, DynBlk o VMDK que esté inactiva y no en ejecución, en modo lectura-escritura, sin establecerla como predeterminada de arranque. Haz clic derecho sobre la sesión y selecciona **Montar sesión**; las sesiones cifradas solicitarán su frase de acceso LUKS. Es posible montar varios IDs de sesión diferentes al mismo tiempo. **Abrir carpeta montada** abre el sistema de archivos adjunto, mientras que **Abrir carpeta de la sesión** abre el directorio numerado que contiene sus archivos de respaldo.

Cerrar Session Manager no desmonta un punto de montaje gestionado por la interfaz gráfica. Vuelve a abrir la aplicación para verlo y selecciona **Desmontar sesión**. Si el desmontaje está ocupado, MiniOS deja el demonio de respaldo, el dispositivo loop o el dispositivo DynBlk conectado en lugar de desconectar el almacenamiento bajo un sistema de archivos activo.

La CLI independiente mantiene el montaje activo hasta que se cierre su entrada estándar o reciba Ctrl+C:

```bash
sudo minios-session mount <id>
```

El comando rechaza la sesión activa o en ejecución y nunca formatea un sistema de archivos existente porque el montaje falló.

## Copias de seguridad y sesiones fallidas

Para sesiones nativas, DynFileFS, DynBlk, VMDK y raw, incluidas las formas cifradas, utiliza `export` para realizar copias de seguridad lógicas en lugar de copiar el directorio de una sesión montada. Guarda el archivo resultante en otro dispositivo y verifica que pueda importarse antes de confiar en él. La importación siempre crea una nueva sesión numerada; actívala explícitamente cuando esté lista para usarse.
Para procedimientos de copia de seguridad de SquashFS y de dispositivo completo, consulta [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si una sesión falla después de que se llena el almacenamiento, se interrumpe una escritura o se crean sesiones vacías repetidamente, deja de modificar el almacenamiento afectado. Exporta primero una sesión legible que no esté en ejecución si es posible y luego sigue [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

Comienza el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Al arrancar, los sistemas de archivos de los contenedores se verifican antes de activar el modo escritura. Si se detectan fallos graves en la comprobación del sistema de archivos, el contenedor se conserva para recuperación en lugar de montarse en modo escritura. SquashFS detecta un estado previo no limpio y restaura la última instantánea guardada correctamente. Elimina sesiones solo a través del Gestor de sesiones de MiniOS o `minios-session delete`; no elimines manualmente los directorios de sesiones.

## Recuperar DynFileFS, DynBlk y almacenamiento VMDK

Cuando eliminas archivos dentro de una sesión persistente, los segmentos del `changes.dat` del host **no** necesariamente se reducen. El sistema de archivos ext4 interno sabe qué bloques están libres, pero es posible que el backend de almacenamiento aún los considere ocupados. La acción **Free Space...** está pensada para recuperar espacio en la unidad USB, no para aumentar la capacidad lógica de la sesión.

En DynFileFS, las operaciones tienen propósitos distintos:

| Mecanismo | Para qué sirve | Qué hace realmente |
| --- | --- | --- |
| **TRIM / descarte** | Has eliminado archivos de una sesión ext4 sin cifrar y quieres que el backend sepa qué bloques ya no se necesitan. | `fstrim` informa a DynFileFS de los bloques lógicos sin usar. Se pueden desasignar bloques completos de 4 KiB; los rangos parciales se ponen a cero. Las posiciones físicas se pueden reutilizar cuando dejan de estar referenciadas. Esto no equivale a un borrado seguro. |
| **Liberación automática de huecos y truncado del final** | Quieres que el sistema de archivos del host recupere espacio sin mover los datos existentes. | Tras un descarte correcto, DynFileFS puede liberar rangos físicos sin usar en un sistema de archivos de respaldo compatible con el vaciado de huecos (como ext4) y acortar los extremos de los segmentos completamente libres. FAT32/exFAT generalmente no pueden liberar huecos internos de esta manera. |
| **Recuperar** (predeterminado: **Free Space...**) | Has eliminado archivos y quieres limpiar sin mover datos, incluida la recuperación de posiciones sin usar que quedaron de montajes anteriores. | Session Manager ejecuta FITRIM en el sistema de archivos ext4 interno e invoca `dynfilefs --reclaim`. Puede devolver espacio al host o simplemente dejar que se puedan reutilizar posiciones físicas dentro del contenedor. **No** reubica bloques en uso. |
| **Compactación** (`--compact`) | Usas FAT32/exFAT o tienes archivos de segmento fragmentados cuyos espacios libres están *antes de* los datos en uso, y la limpieza sin mover datos no puede acortar los archivos. | Mueve los bloques en uso a posiciones libres de número inferior y, después, trunca los extremos libres cuando sea posible. Esto puede generar muchas escrituras adicionales y tardar bastante más; úsalo solo si recuperar espacio en el host compensa ese coste. |

**¿Cuál elegir?** Normalmente, elige **Free Space...** sin compactación después de eliminar una cantidad considerable de datos. Después, comprueba el espacio libre real en la unidad USB. Activa **Compactación** solo cuando los archivos de respaldo sigan ocupando mucho espacio pese a que haya espacio libre en la sesión, especialmente en FAT32/exFAT. Si no has eliminado nada o el almacenamiento ya está lleno, es posible que la recuperación y la compactación no liberen espacio. No uses estas operaciones como mantenimiento rutinario de SSD ni como sustituto de las copias de seguridad.

**Límites:** Eliminar un archivo no demuestra por sí solo que sus bloques se hayan descartado; el sistema de archivos interno debe indicar cuáles están sin usar. Las sesiones LUKS cifradas no transmiten automáticamente las solicitudes de descarte a través de la capa de cifrado. La compatibilidad del sistema de archivos de respaldo y la distribución de los bloques en uso determinan cuánto espacio se puede recuperar realmente. La opción de arranque `perchtoram=trim` no está relacionada: controla qué sesiones se copian en RAM, no el descarte del sistema de archivos.

En Session Manager, haz clic con el botón derecho en una sesión de DynFileFS, DynBlk o VMDK y selecciona **Liberar espacio...**. El cuadro de diálogo funciona con una sesión compatible, activa o inactiva, y también reutiliza una sesión que ya esté montada mediante Session Manager. En una sesión de texto sin cifrar, MiniOS ejecuta FITRIM en el sistema de archivos ext4 interno real y luego solicita al backend propietario que devuelva el espacio de respaldo que sabe que está libre. Las sesiones desconectadas se conectan temporalmente y se liberan solo después de que su sistema de archivos se haya desmontado correctamente.

Las instantáneas de DynFileFS pueden conservar bloques que hayas eliminado de la imagen de trabajo. La recuperación nunca elimina instantáneas. Si se actualizó el paquete mientras seguía activo un daemon antiguo de DynFileFS, reinicia con el initrd actualizado para usar el runtime actual durante esa sesión de arranque.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La casilla de verificación de compactación está **desmarcada de forma predeterminada**, incluso en exFAT. No hay
compactación automática como alternativa. Las sesiones cifradas solo recuperan el espacio que ya
conoce el backend; esta operación no habilita discard mediante LUKS ni
revela su patrón de asignación. Los errores del dispositivo y los fallos de TRIM detienen la operación.

### Comandos de controlador de bajo nivel

Con el backend actual DynBlk nativo o dividido VMDK, el descarte de granos completos
permite reutilizar su ubicación. En un sistema de archivos ext4, los rangos retirados
también pueden ser liberados automáticamente (hole-punch). En exFAT, la limpieza automática solo trunca
colas de archivos completamente libres. **La limpieza automática nunca mueve datos activos.**

Utilice `fstrim` en el sistema de archivos de cambios interno montado (no en el AUFS/OverlayFS combinado
raíz) para informar los bloques eliminados, luego `dynblk reclaim /dev/dynblkN --execute` para
limpieza sin movimiento. Seleccione el dispositivo de sesión real, no un índice asumido.
Para solicitar manualmente la compactación intensiva en escritura en el lugar, agregue `--compact`.
Funciona sin convertir la imagen ni cambiar el tamaño del sistema de archivos virtual;
otras lecturas/escrituras pueden ejecutarse entre los pasos de recuperación. No es una acción automática de respaldo.
El parámetro opcional `--scan-zeroes` lee los granos asignados y no está habilitado por defecto.

Estos comandos también están disponibles en la CLI de initrd DynBlk reconstruida. No se habilita
la compactación automática al inicio. Las sesiones cifradas mantienen su política de descarte existente;
las herramientas no habilitan silenciosamente el paso de descarte de dm-crypt.
Los adjuntos de solo lectura o `cache=unsafe` no pueden ser recuperados. Los rangos liberados
informados y las longitudes truncadas no son equivalentes al espacio libre medido en el sistema de archivos.

## Flujos de trabajo de sesiones VMDK

VMDK es un modo de sesión independiente, no un nuevo códec de compresión. Puede crear, activar,
redimensionar, exportar/importar, copiar, clonar y convertir usando los mismos comandos del Gestor de Sesiones
que en otros modos de contenedor:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Los archivos de sesión contienen archivos lógicos y metadatos, no un adjunto externo
VMDK arbitrario. Las sesiones VMDK gestionadas utilizan el `volume.vmdk`descriptor
canónico y todos sus`volume-sNNN.vmdk`archivos relacionados. No cambie el nombre de las partes ni copie una imagen activa
por fuera del controlador. Cambiar entre DynBlk nativo y VMDK requiere una
copia/conversión explícita; modificar`session_mode`manualmente no es una conversión.

El instalador solo ofrece VMDK cuando el entorno de ejecución lo soporta y rechaza imágenes de origen
cuyos initrd copiados no tienen la`vmdk-session-v1`capacidad necesaria. Actualice la CLI,
el controlador, las herramientas de sesión y los scripts de arranque juntos antes de crear sesiones VMDK.
