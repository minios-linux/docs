---
updated: 2026-10-06
program_commits:
    minios-session-manager: 3ec8b706ff661eb7f8f3fa5306a14f7fd7bc5cd3
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Sesiones y persistencia

Las sesiones MiniOS mantienen los cambios realizados en el sistema en vivo a través de los reinicios. Cada sesión es un directorio numerado en `minios/changes/`; los módulos MiniOS de solo lectura permanecen sin cambios y la sesión seleccionada proporciona la capa de sistema de archivos union escribible.

Utiliza el Gestor de sesiones de MiniOS desde un sistema MiniOS en ejecución:

```bash
minios-session-manager
```

La herramienta equivalente en línea de comandos es `minios-session`. Sus comandos de modificación requieren privilegios administrativos, por lo que los ejemplos a continuación utilizan `sudo`.

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

Cualquier parámetro de persistencia reconocido habilita el manejo de persistencia. Los menús de arranque MiniOS normalmente ofrecen opciones para reanudar, crear nueva, seleccionar y entradas no persistentes. La descripción canónica de los selectores, compatibilidad, alternativas y semánticas de activación está en [Persistencia initrd](/reference/boot-process/Persistence-Internals).

| Parámetro | Significado |
|-----------|---------|
| `perch` | Usa la ruta de reanudación heredada de mejor esfuerzo. Intenta usar el valor predeterminado de metadatos pero no crea un reemplazo si ninguno es utilizable. |
| `perchdir=resume` | Reanuda el valor predeterminado de metadatos y, si está ausente o es incompatible, permite que el initrd cree un reemplazo compatible. Este es el comportamiento actual de reanudar en el menú de arranque. |
| `perchdir=setup` | Abre el selector interactivo de backend de persistencia y luego asigna una nueva sesión numerada. Este es el comportamiento actual de **Iniciar nueva sesión** . |
| `perchdir=new` | Asigna una nueva sesión numerada directamente desde el backend, cifrado, compresión y tamaño solicitados o predeterminados sin abrir el selector de backend. |
| `perchdir=ask` | Selecciona una sesión existente; si el almacén está vacío, entra automáticamente en el mismo flujo de configuración que `perchdir=setup`. |
| `perchdir=<id>` | Selecciona directamente esa sesión numerada. |
| `perchdir=<device/path>` | Utiliza una ubicación de persistencia en un dispositivo, incluidas las formas `/dev/...` y `label:...` gestionadas por el initrd. |
| `perchmode=<mode>` | Establece `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra una sesión nueva Raw, DynFileFS, DynBlk o VMDK con LUKS2. Las sesiones existentes derivan el cifrado solo de los metadatos. |
| `perchcomp=<codec>` | Selecciona la compresión backend DynBlk para una nueva sesión DynBlk. La compresión se fuerza a `none` cuando DynBlk está envuelto en LUKS2. |
| `perchsize=<size>` | Establece un tamaño de contenedor nuevo o mayor; los valores simples se asignan en MiB y se aceptan los sufijos `MB`, `GB`, y `TB`. |

Si no se especifica un modo para una nueva sesión, el arranque usa el modo nativo. En FAT32/NTFS/exFAT, la creación nativa cae en DynFileFS. Un nuevo contenedor raw tiene por defecto 4000 MiB. Las nuevas sesiones de arranque DynFileFS, DynBlk y VMDK sin `perchsize` usan hasta 16 GiB; si queda menos espacio de respaldo después de la reserva de seguridad, el tamaño automático se reduce. DynFileFS también considera su sobrecarga de índice y el límite de RAM. El crecimiento explícito de DynBlk sigue el límite instalado del backend, consultable con `dynblk limits --format dynblk`. Con Secure Boot, initrd no ofrece DynBlk/VMDK y trata una sesión DynBlk/VMDK explícita o reanudada como no disponible en vez de intentar cargar el módulo no firmado.
Las sesiones SquashFS pueden capturarse desde el sistema en ejecución con el Gestor de sesiones de MiniOS o `minios-session create squashfs`. La configuración initrd solo crea metadatos de sesión de generación cero y mantiene la capa superior escribible en RAM. El sistema en ejecución crea la primera `changes.sb` instantánea bajo demanda o al apagar.

Al reanudar, MiniOS verifica la versión registrada, edición, sistema de archivos union y modo. El literal `perchdir=resume` puede crear una nueva sesión en vez de usar un valor predeterminado ausente o incompatible. El uso directo del número, selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.`perch`, la selección numérica directa y otras solicitudes de reanudación heredadas no crean automáticamente ese reemplazo.
La selección interactiva muestra una advertencia antes de permitir una sesión incompatible. Si la selección o activación falla, el arranque continúa normalmente con una capa superior RAM y una advertencia de persistencia.

El almacén de sesiones tiene esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra los ID predeterminados y en ejecución y, por sesión, el modo, versión, edición, sistema de archivos union, tamaño, estado y ajustes específicos del modo.
Es metadato persistente comprometido por la implementación de arranque, no es en sí mismo prueba del estado actual en tiempo de ejecución. No lo edites ni muevas datos de sesión numerados mientras una sesión esté montada; utiliza el Gestor de sesiones de MiniOS o `minios-session`.

## Sesiones activas y en ejecución

Estos términos describen diferentes estados:

- La **activa** es la sesión seleccionada por defecto para el próximo arranque.
- Conceptualmente, la **en ejecución** es la sesión cuya capa escribible realmente proporciona la persistencia al arranque actual.

El campo persistente `running=` registra esa relación prevista. Un fallo, construcción fallida de la unión, copia del almacén o apagado interrumpido puede dejarlo obsoleto incluso si el arranque actual está usando RAM u otra sesión. Por ello, operaciones como el guardado de SquashFS requieren el estado protegido y ligado al ID de arranque actual del initrd y la capa superior montada verificada; no confían solo en `running=` . Consulta [Estado activo, en ejecución y de arranque actual](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Activar una sesión cambia el próximo arranque y no modifica el sistema de archivos union actual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

No se puede eliminar ni convertir en el lugar la sesión activa. Una sesión en ejecución normalmente no puede eliminarse, exportarse, copiarse, redimensionarse ni convertirse. La limpieza también protege ambos IDs.

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

## Sesión respaldada por RAM con escritura diferida

Cuando initrd copia una sesión de persistencia compatible en RAM con `perchtoram`, la sesión en ejecución ya no escribe directamente en su backend original. MiniOS registra el almacén original por UUID del sistema de archivos y número de sesión en vez de depender de un nombre `/dev/sdX`. El Gestor de sesiones mantiene visible esa sesión RAM incluso si el dispositivo original está temporalmente desconectado.

Si el almacén original está presente, es escribible y no ha cambiado, **Guardar ahora** escribe el estado RAM de vuelta a la sesión original. **Guardar en almacenamiento como nueva sesión** mantiene la fuente almacenada intacta y publica el estado RAM como una nueva sesión numerada. Los equivalentes en CLI son `minios-session save <id>` y `minios-session save <id> --as-new`. El guardado informa del progreso de la copia y puede cancelarse antes de la fase de publicación; la publicación se completa atómicamente una vez iniciada.

Si el medio original falta, es de solo lectura, ya no coincide con la identidad de arranque o la sesión original cambió independientemente, se rechaza la escritura en vez de dirigirla a otro dispositivo por nombre. Vuelve a conectar el medio original y reintenta, o usa guardar como nuevo si la sesión original ha divergido. Las sesiones nativas de directorio no se copian por la implementación actual de `perchtoram`, por lo que esta ruta de escritura aplica a Raw, DynFileFS, DynBlk, VMDK y SquashFS.

## Comportamiento de guardado SquashFS

Una sesión SquashFS se desempaqueta en RAM para la capa escribible en ejecución. Al guardar, se reconstruye y valida una instantánea exacta, luego se reemplaza atómicamente `changes.sb`.
No se conserva ninguna generación de reversión. Guardar ahora está disponible desde el icono de la bandeja, el Gestor de sesiones de MiniOS o `minios-session save` independientemente de la política automática.

En cada guardado, MiniOS copia una vista estable del árbol modificado en almacenamiento privado RAM cuando la memoria lo permite. La compresión escribe **una** imagen en un directorio privado dentro de la sesión numerada. Solo después de comprobar el contenido del sistema de archivos, el hash, la identidad y la sincronización duradera, el guardador reemplaza `changes.sb`. No hay una segunda imagen comprimida completa en RAM ni una segunda escritura de esa imagen en el dispositivo de persistencia. Si hay poca RAM para el árbol, solo ese árbol de trabajo pasa a disco; el candidato comprimido sigue necesitando una escritura. Consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para políticas de caché y escritura de logs.

Los diagnósticos de arranque para una sesión SquashFS duradera se almacenan en su `boot-logs/minios/` y `boot-logs/live/` directorios. No dependen de una instantánea de apagado exitosa y siguen disponibles incluso si los últimos cambios en la capa superior RAM no pudieron guardarse. El almacén de respaldo debe seguir siendo escribible; los archivos de registro ordinarios pueden ser temporales si se selecciona `LIVE_LOG_STORAGE=volatile`.

El guardado al apagar se implementa mediante el disparador de apagado principal MiniOS y el backend `minios-squashfs-save`, por lo que no depende de que el Gestor de sesiones de MiniOS esté abierto o instalado. El guardado periódico se comprueba cada 30 minutos mediante un temporizador systemd o un worker SysV, ambos llaman al mismo backend de autoguardado. La reconstrucción de la instantánea consume CPU y escribe la instantánea completa; se recomiendan intervalos de una hora o más.

Durante la operación RAM-respaldada de SquashFS, una instantánea SquashFS recién capturada y activada puede tomar posesión del destino de guardado en ejecución. Tras esa transferencia, la instantánea en ejecución anterior puede eliminarse sin reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Esta excepción solo aplica a una transferencia válida de SquashFS de arranque actual. Otros modos de persistencia en ejecución siguen protegidos contra eliminación.

## Cifrado

LUKS2 es una capa de cifrado opcional sobre el almacenamiento de sesión Raw, DynFileFS, DynBlk o VMDK; no es un modo de sesión independiente. Solo está disponible cuando `/run/initramfs/etc/minios-initramfs-crypt` contiene `luks-layer-v1` y las herramientas y capacidades del backend seleccionado están disponibles. La compresión backend DynBlk se desactiva cuando se selecciona LUKS2.

La creación interactiva de LUKS solicita la contraseña dos veces. Las operaciones que leen o crean datos LUKS pueden leerla desde la entrada estándar con `--password-stdin`. Las contraseñas no se colocan en argumentos de comando ni en metadatos de sesión. Al arrancar, el initrd solicita la contraseña en la consola. Tres intentos fallidos detienen el arranque de forma fatal; MiniOS no continúa con texto plano, RAM, otro backend o una sesión de reemplazo bajo la misma solicitud.

Para una sesión Raw, DynFileFS, DynBlk o VMDK cifrada, inactiva y desconectada, el Gestor de sesiones ofrece **Cambiar contraseña...**. El equivalente en CLI es:

```bash
sudo minios-session change-passphrase <id>
```

Solicita la contraseña actual, la nueva y la confirmación. Con `--password-stdin`, introduce esas tres líneas en ese orden. El keyslot seleccionado se reemplaza sin reformatear ni volver a cifrar todos los archivos. Las sesiones activas, en ejecución o montadas deben desconectarse primero; los keyslots LUKS adicionales gestionados fuera del Gestor de sesiones no se modifican.

Las exportaciones cifradas contienen archivos lógicos de sesión descifrados, no el backend cifrado. Importar, copiar o convertir a LUKS crea un backend cifrado nuevo con identidades nuevas.

## Montar una sesión inactiva

El Gestor de sesiones puede montar una sesión Raw, DynFileFS, DynBlk o VMDK inactiva y no en ejecución en modo lectura-escritura sin convertirla en predeterminada de arranque. Haz clic derecho en la sesión y elige **Montar sesión**; las sesiones cifradas solicitan su contraseña LUKS. Se pueden montar varios IDs de sesión diferentes al mismo tiempo. **Abrir carpeta montada** abre el sistema de archivos adjunto, mientras que **Abrir carpeta de sesión** abre el directorio numerado que contiene sus archivos de respaldo.

Cerrar el Gestor de sesiones no desmonta un montaje gestionado por la interfaz gráfica. Vuelve a abrir la aplicación para verlo y elige **Desmontar sesión**. Si el desmontaje está ocupado, MiniOS deja conectado el demonio de respaldo, el dispositivo loop o el dispositivo DynBlk en vez de desconectar el almacenamiento bajo un sistema de archivos activo.

La CLI independiente mantiene el montaje activo hasta que se cierre la entrada estándar o reciba Ctrl+C:

```bash
sudo minios-session mount <id>
```

El comando rechaza la sesión activa o en ejecución y nunca formatea un sistema de archivos existente porque el montaje falló.

## Copias de seguridad y sesiones fallidas

Para sesiones nativas, DynFileFS, DynBlk, VMDK y raw, incluidas las cifradas, utiliza `export` para copias de seguridad lógicas en vez de copiar el directorio de una sesión montada. Guarda el archivo resultante en otro dispositivo y verifica que pueda importarse antes de confiar en él. Importar siempre crea una nueva sesión numerada; actívala explícitamente cuando esté lista para usarse.
Para procedimientos de copia de seguridad de SquashFS y de dispositivo completo, consulta [Respaldo de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si una sesión falla tras llenarse el almacenamiento, interrumpirse una escritura o crearse sesiones vacías repetidamente, deja de modificar el almacenamiento afectado. Exporta primero una sesión no en ejecución legible cuando sea posible y luego sigue [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

Inicia el diagnóstico sin modificar los datos de la sesión:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Al arrancar, los sistemas de archivos de contenedor se verifican antes de la activación escribible. Los fallos graves en la comprobación de sistemas de archivos preservan el contenedor para recuperación en vez de montarlo en modo escritura. SquashFS detecta un estado previo no limpio y restaura la última instantánea guardada con éxito. Elimina sesiones solo mediante el Gestor de sesiones de MiniOS o `minios-session delete`; no elimines directorios de sesión manualmente.

## Devolución de almacenamiento no utilizado DynFileFS, DynBlk y VMDK

En el Gestor de sesiones, haz clic derecho en una sesión DynFileFS, DynBlk o VMDK y elige **Liberar espacio...**. El diálogo funciona para una sesión compatible en ejecución o inactiva y también reutiliza una sesión ya montada a través del Gestor de sesiones. Para una sesión en texto plano, MiniOS ejecuta FITRIM en el sistema de archivos ext4 interno real y luego pide al backend propietario que devuelva el espacio de respaldo reconocido como libre. Las sesiones separadas se adjuntan temporalmente y solo se liberan después de desmontar correctamente su sistema de archivos.

La recuperación de DynFileFS requiere DynFileFS 4.6.0 o posterior. Si el paquete se actualizó mientras un demonio DynFileFS antiguo sigue activo, reinicia en el backend actualizado antes de recuperar esa sesión en ejecución.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La casilla de compactación está **desactivada por defecto**, incluso en exFAT. No hay
compactación automática de respaldo. Las sesiones cifradas solo recuperan el espacio ya
reconocido por el backend; esta operación no habilita el descarte a través de LUKS ni
revela su patrón de asignación. Los errores de dispositivo y fallos de trim detienen la operación.

### Comandos de controlador de bajo nivel

Con el backend nativo o VMDK dividido actual DynBlk, el descarte de granos completos
hace que su ubicación sea reutilizable. En un sistema de archivos ext4 de respaldo, los rangos retirados
también pueden ser liberados automáticamente. En exFAT, la limpieza automática solo trunca
colas de archivos completamente libres. **La limpieza automática nunca mueve datos activos.**

Usa `fstrim` en el sistema de archivos de cambios interno montado (no en la raíz combinada AUFS/OverlayFS
 ) para informar de bloques eliminados y luego `dynblk reclaim /dev/dynblkN --execute` para
limpieza sin movimiento. Selecciona el dispositivo de sesión real, no un índice asumido.
Para solicitar manualmente una compactación intensiva en escritura en el lugar, añade `--compact`.
Funciona sin convertir la imagen ni cambiar el tamaño del sistema de archivos virtual;
otras lecturas/escrituras pueden ejecutarse entre pasos de recuperación. No es un respaldo automático.
La opción `--scan-zeroes` lee granos mapeados y no está habilitada por defecto.

Estos comandos también están disponibles en la CLI initrd reconstruida DynBlk. No se habilita
compactación automática al iniciar. Las sesiones cifradas mantienen su política de descarte existente; las herramientas no habilitan silenciosamente el descarte dm-crypt.
política; las herramientas no habilitan silenciosamente el descarte dm-crypt.
Las conexiones de solo lectura o `cache=unsafe` no pueden recuperarse. Los rangos liberados y longitudes truncadas reportados no son iguales al espacio libre medido en el sistema de archivos.
Los rangos liberados y longitudes truncadas reportados no son iguales al espacio libre medido en el sistema de archivos.

## Flujos de trabajo de sesión VMDK

VMDK es un modo de sesión independiente, no un nuevo códec de compresión. Crear, activar,
redimensionar, exportar/importar, copiar, clonar y convertir utilizan los mismos comandos del Gestor de sesiones
que otros modos de contenedor:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Los archivos de sesión contienen archivos lógicos y metadatos, no un adjunto VMDK externo arbitrario.
Las sesiones VMDK gestionadas usan el `volume.vmdk`descriptor canónico
y todos sus `volume-sNNN.vmdk`fragmentos asociados. No renombres partes ni copies una imagen en uso
detrás del controlador. Cambiar entre DynBlk nativo y VMDK requiere una
copia/conversión explícita; cambiar `session_mode`a mano no es conversión.

El instalador solo ofrece VMDK cuando lo soporta el entorno de ejecución y rechaza imágenes de origen
cuyos initrd copiados carecen de la `vmdk-session-v1`capacidad. Actualiza la CLI,
el controlador, las herramientas de sesión y los scripts de arranque juntos antes de crear sesiones VMDK.
