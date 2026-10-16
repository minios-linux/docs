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

| Modo | Almacenamiento | Restricciones principales | Capa LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | Cambios almacenados directamente en el directorio de la sesión | Requiere un sistema de archivos escribible que preserve los metadatos de Linux y las operaciones que MiniOS detecta. La capacidad depende del espacio libre de respaldo; `perchsize` no aplica. | No |
| `dynfilefs` | ext4 expandible `virtual.dat`respaldado por archivos segmento formato-400 | Funciona en sistemas de archivos POSIX escribibles, FAT32, NTFS y exFAT. El payload es ligero, pero el índice de mapeo escala con la capacidad lógica declarada. | Sí |
| `dynblk` | Sistema de archivos ext4 delgado sobre un dispositivo de bloque del kernel respaldado por `volumeNNN.db`archivos | Requiere la CLI DynBlk, el módulo del kernel y la capacidad initrd. El tamaño creado al arrancar es de hasta 16 GiB por defecto; el máximo lo informa `dynblk limits`. Los mapeos residentes en disco usan una caché de metadatos limitada. | Sí |
| `vmdk` | Sistema de archivos ext4 delgado en un VMDK estándar dividido y disperso, expuesto por el controlador DynBlk | Utiliza `volume.vmdk` y `volume-sNNN.vmdk`. Sin compresión. Requiere `vmdk-session-v1` en el marcador de capacidad initrd en ejecución. El mismo valor manual predeterminado de 16 GiB que DynBlk; consulta `dynblk limits --format vmdk` para ver los límites. | Sí |
| `raw` | Un solo `changes.img`archivo que contiene ext4 | Capacidad lógica fija con crecimiento solo explícito. Funciona en sistemas de archivos POSIX escribibles, FAT32, NTFS y exFAT; FAT32 está limitado a 4000 MiB. | Sí |
| `squashfs` | Instantánea comprimida en `changes.sb`; la capa superior escribible en tiempo de ejecución se reconstruye en RAM | `perchsize` no aplica. Las instantáneas existentes se pueden restaurar desde medios escribibles compatibles; el guardado exacto requiere un almacén de persistencia compatible con POSIX. | No |

Raw, DynFileFS, DynBlk y VMDK pueden llevar opcionalmente una capa de cifrado LUKS2. El backend de almacenamiento sigue siendo el modo de sesión, y los metadatos de la sesión registran el cifrado por separado. DynFileFS y raw creados con `minios-session` tienen por defecto 4000 MiB; DynBlk y VMDK tienen por defecto 16 GiB. Los valores de tamaño se asignan en MiB; `GB` y `TB` los sufijos convierten a 1000 y 1.000.000 MiB. Raw está limitado a 4000 MiB en FAT32, esté cifrado o no. Los datos de payload de DynFileFS crecen bajo demanda, pero su índice formato-400 se dimensiona para la capacidad lógica completa y cuesta unos 2 MiB de RAM más unos 2 MiB de almacenamiento de respaldo por GiB. DynBlk mantiene las tablas de mapeo en disco y una caché de metadatos limitada en RAM, por defecto 1 MiB en vez de un porcentaje de RAM. Sus vectores de extensión/archivo y directorios crecen con las partes declaradas, mientras que el llenado del payload no requiere un mapa residente completo. Consulta el límite de capacidad instalada con `dynblk limits --format dynblk`. Las escrituras reales siguen limitadas por el espacio libre del sistema de archivos subyacente y la admisión de recursos del backend. Las operaciones de redimensionamiento de contenedores solo pueden aumentar una sesión; no se admite la reducción.

El modo nativo es la opción más simple y rápida en un sistema de archivos compatible.
Utiliza DynFileFS cuando el sistema de archivos de persistencia no puede representar metadatos de Linux.
Utiliza DynBlk si necesitas un dispositivo de bloque real del kernel con archivos de respaldo thin; el controlador puede mantener varios volúmenes independientes de DynBlk conectados a la vez, y el Gestor de sesiones usa la ruta del dispositivo devuelta por el controlador en vez de asumir que `/dev/dynblk0` está libre. DynBlk y VMDK no están disponibles mientras UEFI Secure Boot está activado porque MiniOS no firma el módulo externo del kernel DynBlk. Por lo tanto, el instalador y el Gestor de sesiones ocultan estos modos y rechazan solicitudes explícitas de creación antes de intentar cargar el módulo.
Utiliza raw cuando se requiere asignación fija, añade LUKS2 si la sesión debe estar cifrada y usa SquashFS para una instantánea comprimida exacta.

Ejecuta los siguientes comandos para inspeccionar el sistema de archivos de persistencia real y los modos disponibles en él:

```bash
sudo minios-session info
sudo minios-session status
```

No se puede crear ninguna sesión en medios de solo lectura. El initrd puede leer y activar una instantánea SquashFS existente almacenada en FAT, exFAT o NTFS escribibles porque extrae la instantánea en una capa superior ext4 temporal. Crear o guardar exactamente una instantánea es diferente: el almacén de persistencia debe soportar los metadatos POSIX requeridos y la publicación privada y duradera. El árbol de trabajo de captura exacta utiliza RAM de confianza cuando está disponible, con respaldo en disco si RAM es insuficiente.

## Selección de arranque

Cualquier parámetro de persistencia reconocido habilita la gestión de persistencia. Los menús de arranque MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes. La descripción estándar de los selectores, compatibilidad, alternativas y semántica de activación se encuentra en [Persistencia initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|---------|
| `perch` | Utiliza la ruta de reanudación heredada de mejor esfuerzo. Intenta usar el valor predeterminado de los metadatos, pero no crea un reemplazo si no hay ninguno utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de los metadatos y, si está ausente o es incompatible, permite que el initrd cree un nuevo reemplazo compatible. Este es el comportamiento actual de reanudación en el menú de arranque. |
| `perchdir=setup` | Abre el selector interactivo de backend de persistencia y luego asigna una nueva sesión numerada. Este es el comportamiento actual de **Iniciar nueva sesión** . |
| `perchdir=new` | Asigna directamente una nueva sesión numerada desde el backend solicitado o predeterminado, así como con los ajustes de cifrado, compresión y tamaño, sin abrir el selector de backend. |
| `perchdir=ask` | Selecciona una sesión existente; si el almacén está vacío, inicia automáticamente el mismo flujo de configuración que `perchdir=setup`. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Utiliza una ubicación de persistencia en un dispositivo, incluyendo `/dev/...` y `label:...` formatos gestionados por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra una sesión nueva de tipo Raw, DynFileFS, DynBlk o VMDK con LUKS2. Las sesiones existentes solo derivan el cifrado de los metadatos. |
| `perchcomp=<codec>` | Selecciona la compresión del backend DynBlk para una nueva sesión DynBlk. La compresión se fuerza a `none` cuando DynBlk está envuelto en LUKS2. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples se asignan en MiB y se aceptan los sufijos `MB`, `GB`, y `TB`. |

Si no se especifica un modo para una nueva sesión, el arranque utiliza el modo nativo. En FAT32/NTFS/exFAT, o cuando fallan las comprobaciones del sistema de archivos nativo, el inicio prefiere DynBlk cuando su asistente está disponible y Secure Boot lo permite; de lo contrario, recurre a DynFileFS. Un fallo de activación no convierte silenciosamente una sesión existente. Un nuevo contenedor raw tiene un tamaño predeterminado de 4000 MiB. Las nuevas sesiones de arranque DynFileFS, DynBlk y VMDK sin `perchsize` utilizan hasta 16 GiB; si queda menos espacio después de la reserva de seguridad, el tamaño automático se reduce. DynFileFS también tiene en cuenta la sobrecarga de su índice y el límite de RAM. El crecimiento explícito de DynBlk sigue el límite del backend instalado, que se consulta con `dynblk limits --format dynblk`. Bajo Secure Boot, initrd no ofrece DynBlk/VMDK y trata una sesión DynBlk/VMDK explícita o reanudada como no disponible en lugar de intentar cargar el módulo sin firmar.
Las sesiones SquashFS pueden capturarse desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`. La configuración de initrd solo crea metadatos de sesión de generación cero y mantiene la capa superior editable en RAM. El sistema en ejecución crea la primera `changes.sb` instantánea bajo demanda o al apagar.

Al reanudar, MiniOS verifica la versión registrada, edición, sistema de archivos union y modo. El parámetro literal `perchdir=resume` puede crear una nueva sesión en lugar de usar un valor predeterminado ausente o incompatible. El uso simple de `perch`, la selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación aún falla, el arranque normalmente continúa con una capa superior RAM y una advertencia de persistencia.

El almacén de sesiones tiene este formato:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los ID predeterminado y en ejecución, así como el modo, versión, edición, sistema de archivos union, tamaño, estado y ajustes específicos de modo por sesión.
Son metadatos persistentes comprometidos por la implementación de arranque, pero no constituyen por sí mismos una prueba del estado actual de ejecución. No los edite ni mueva datos de sesiones numeradas mientras una sesión esté montada; utilice el Gestor de sesiones de MiniOS o `minios-session`.

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

## Devolviendo el almacenamiento no utilizado de DynFileFS, DynBlk y VMDK

En el Administrador de Sesiones, haz clic derecho sobre una sesión de DynFileFS, DynBlk o VMDK y selecciona **Liberar espacio...**. El diálogo funciona tanto para sesiones compatibles en ejecución como inactivas, y también reutiliza una sesión que ya esté montada a través del Administrador de Sesiones. Para una sesión en texto plano, MiniOS ejecuta FITRIM en el sistema de archivos ext4 interno real y luego solicita al backend propietario que libere el espacio de respaldo identificado como libre. Las sesiones desconectadas se adjuntan temporalmente y se liberan solo después de desmontar correctamente su sistema de archivos.

La recuperación de DynFileFS requiere DynFileFS 4.6.0 o posterior. Si el paquete se actualizó mientras un daemon anterior de DynFileFS sigue activo, reinicia con el backend actualizado antes de recuperar esa sesión en ejecución.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La casilla de compactación está **desactivada por defecto**, incluso en exFAT. No existe
una compactación automática como alternativa. Las sesiones cifradas solo recuperan el espacio ya
identificado por el backend; esta operación no habilita el descarte a través de LUKS ni
revela su patrón de asignación. Los errores de dispositivo y fallos en el trim detienen la operación.

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
