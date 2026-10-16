---
updated: 2026-10-15
---

# Parámetros de arranque

## Cómo usar los parámetros de arranque

Los parámetros de arranque personalizan cómo inicia MiniOS. Separa los parámetros con espacios en la línea de comandos del kernel.

### Syslinux

- Pulsa <kbd>Esc</kbd> durante la secuencia de arranque de MiniOS para acceder al menú de arranque.
- Pulsa <kbd>Tab</kbd> para editar las opciones de arranque.
- Introduce los parámetros y pulsa <kbd>Enter</kbd> para iniciar.

### GRUB

- Pulsa <kbd>E</kbd> en el menú de GRUB.
- Edita los parámetros de arranque al final de la línea de comandos.
- Pulsa <kbd>F10</kbd> para arrancar con la nueva configuración.

## Parámetros de arranque

La columna de aplicación distingue los parámetros que normalmente se aceptan en cada arranque de las configuraciones de cuenta destinadas a la configuración inicial. Con persistencia, los componentes de live-config normalmente se ejecutan solo una vez; consulta [live-config](/reference/configuration/live-config).

Esta tabla es una referencia rápida. La precedencia de las fuentes y las `from=` formas aceptadas se definen en [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery), el filtrado de módulos en [Carga de módulos Initrd](/reference/boot-process/Module-Loading), la selección de persistencia en [Persistencia Initrd](/reference/boot-process/Persistence-Internals), y las combinaciones compatibles en [Modos de arranque](/using-minios/Boot-Modes).

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `from` | Cada arranque | Carga datos de MiniOS desde un directorio, una ruta de dispositivo compatible o una ISO. No se analizan las formas de dispositivo UUID, PARTUUID y by-id. Un **`http://` literal solamente** tiene prioridad sobre `ip=` y activa el [arranque por red](/reference/boot-process/Network-Boot) a través de httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Cada arranque | Mantiene los `.sb` candidatos cuyo camino coincide con una expresión regular extendida no anclada; las comas se interpretan como alternancia y un rango numérico ascendente completo tiene una expansión especial. También filtra los `toram=trim`. Puede excluir módulos principales o del kernel y hacer que el sistema no pueda arrancar. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Cada arranque | Excluye candidatos cuyo camino coincide con una expresión regular extendida no anclada, incluyendo los de `toram=trim`; se aplica después de `load` y puede excluir módulos principales o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Cada arranque | Establece la extensión del paquete. Predeterminado: `sb`. La coordinación con el kernel sigue usando los nombres `.sb` literales, por lo que una extensión personalizada no puede coordinar el módulo `01-kernel`. | `bext=mymod` |
| `timing` | Cada arranque | Activa la salida de tiempos de inicio. | `timing` |
| `union` | En cada arranque | Selecciona el sistema de archivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | En cada arranque | Dirección estática para la obtención temprana de red. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (puerto HTTP PXE predeterminado **7529**). Un `from=http://...` tiene prioridad sobre `ip=` y usa sus campos de direccionamiento; de lo contrario, cualquier valor no vacío de `ip=` fuerza la descarga de datos PXE y omite los medios locales. Esto no es una configuración de NetworkManager de sesión. Consulta [Arranque por red](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | En cada arranque | Tamaño de caché httpfs en MiB para arranque de red HTTP ISO (`from=http://…`). Consulta [Arranque por red](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | En cada arranque | Abre una shell de depuración al final de la etapa initramfs. | `rd.break` |
| `perchdir` | En cada arranque | Selecciona una sesión de persistencia numerada o una acción. `resume` abre la sesión compatible predeterminada; `setup` permite elegir interactivamente el backend de almacenamiento y luego crea una nueva sesión numerada; `new` crea una nueva sesión directamente desde el `perchmode` solicitado/predeterminado, con ajustes de cifrado, compresión y tamaño; `ask` ofrece sesiones guardadas y entra automáticamente en la configuración si no existen. Un selector numérico inexistente puede recurrir al valor predeterminado de los metadatos; no reserva ni crea ese número. Un dispositivo/ruta o el formulario `askdisk` selecciona otra ubicación de persistencia. Usa un sufijo separado por dos puntos para una ruta personalizada. Sin un parámetro de persistencia, MiniOS inicia desde cero. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | En cada arranque | Tamaño lógico del contenedor para `dynfilefs`, `dynblk`, `vmdk`, y `raw`; no aplica a `native` o `squashfs`. Un número solo o un valor de `M`/`MB` se asigna en MiB; `G`/`GB` y `T`/`TB` se convierten en 1000 y 1.000.000 MiB. Sin un tamaño explícito, las sesiones DynFileFS, DynBlk y VMDK creadas por initrd usan hasta 16 GiB y reducen ese valor predeterminado cuando queda menos espacio disponible después de `perchreserve`; DynFileFS además tiene en cuenta la sobrecarga de su índice y el límite de RAM. DynBlk consulta el límite del backend instalado usando `dynblk limits --format dynblk` (o `--format vmdk` para VMDK); no existe un límite independiente de 512 GiB. El payload de DynFileFS y los datos de respaldo de DynBlk crecen bajo demanda, mientras que DynFileFS también reserva índices para la capacidad lógica declarada. Las solicitudes Raw están limitadas a 1.000.000 MiB y por el espacio disponible después de `perchreserve`; Raw está limitado a 4000 MiB en FAT32, esté cifrado o no. Los nuevos contenedores raw por defecto son de 4000 MiB. El Gestor de sesiones de MiniOS sigue asignando por defecto los contenedores DynFileFS creados manualmente a 4000 MiB y DynBlk/VMDK a 16 GiB. Consulta [Persistencia initrd](/reference/boot-process/Persistence-Internals) para el comportamiento de memoria y almacenamiento del backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | En cada arranque | Margen de asignación y umbral de advertencia por poco espacio en MiB. Se resta al dimensionar contenedores nuevos o en crecimiento, pero no es una cuota en tiempo de ejecución y no impide que escrituras posteriores llenen el dispositivo. Valor predeterminado: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | En cada arranque | Modo de almacenamiento persistente.<br>`native` (predeterminado): un directorio en un sistema de archivos POSIX con permisos de escritura.<br>`dynfilefs`: el contenedor expandible basado en FUSE formato-400, incluso en FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo de bloque de kernel formato-1 independiente respaldado por thin `volumeNNN.db` archivos; el `/dev/dynblkN` número se asigna dinámicamente y pueden coexistir varios volúmenes.<br>`vmdk`: archivos estándar divididos y dispersos `volume.vmdk` / `volume-sNNN.vmdk` archivos expuestos por el controlador DynBlk; sin compresión. Requiere la capacidad versionada de `vmdk-session-v1` initrd.<br>`raw`: una imagen ext4 de tamaño fijo.<br>`squashfs`: una instantánea comprimida desempaquetada en una capa superior respaldada por RAM. La configuración de initrd solo crea los metadatos de la generación cero; el sistema en ejecución crea la primera instantánea bajo demanda o al apagar. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo al crear | Capa de cifrado opcional para una nueva `raw`, `dynfilefs`, `dynblk`, o `vmdk` sesión. `perchencrypt=luks` requiere la capacidad versionada de `luks-layer-v1` initramfs. Las sesiones existentes derivan el cifrado solo de `session_encryption[N]`, por lo que este parámetro no las reinterpreta ni convierte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo al crear | Selecciona la compresión backend DynBlk para una nueva sesión DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`. El códec de kernel seleccionado debe estar disponible. Cuando `perchencrypt=luks` envuelve a DynBlk, MiniOS fuerza la compresión DynBlk a `none`. VMDK no tiene compresión: el arranque ignora un códec no`none` con una advertencia. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | En cada arranque | Habilita la ruta de reanudación de persistencia heredada. A diferencia de `perchdir=resume`, no crea automáticamente un reemplazo compatible cuando no existe una sesión predeterminada utilizable. | `perch` |
| `toram` | Cada inicio | Controla la copia de MiniOS **datos del sistema** a RAM. Solo `toram` es `full`; `trim` copia la configuración requerida y el conjunto de módulos seleccionados, omitiendo datos de origen no relacionados. La copia de persistencia se controla por separado mediante `perchtoram`. Cuando se solicita persistencia y `perchtoram` no se especifica, cualquier modo activo de `toram` predetermina la copia de persistencia a `trim`. Retire el medio solo después de confirmar que el origen original, los bucles, los mapeos y cualquier almacén de persistencia requerido se han desmontado correctamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Cada inicio con persistencia | `off` mantiene el almacén original; `trim` copia la sesión seleccionada Raw, DynFileFS, DynBlk, VMDK o SquashFS; `full` copia todos los contenedores/snapshots compatibles y los metadatos correspondientes. Predeterminado: `trim` con sistema `toram`, de lo contrario `off`. No solicita persistencia por sí mismo. Los datos nativos no se copian: una solicitud nativa RAM exitosa inicia un contenedor vacío nuevo, excepto durante el reinicio, que desactiva la copia. Si la copia falla, la operación en almacenamiento se mantiene. Los cambios en RAM requieren guardar en el almacén original escribible o como una nueva sesión. Se ignora con el backend seleccionado Ventoy Persistence Plugin. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Cada inicio | Inicia en modo consola de texto. | `text` |
| `automount` | Cada inicio | Activa el montaje automático de dispositivos de almacenamiento. | `automount` |
| `debug` | Cada inicio | Activa diagnósticos adicionales al inicio. | `debug` |
| `nozram` | Cada inicio | Desactiva el swap zram. | `nozram` |
| `zramsize` | Cada inicio | Establece el tamaño de swap zram en MiB. Si se omite, MiniOS lo calcula a partir de la RAM total. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Cada inicio | Selecciona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, o `zstd`; la disponibilidad depende del kernel en ejecución. Si se omite, se mantiene el valor predeterminado del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Cada inicio | Establece el target predeterminado de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Cada inicio | Activa los servicios systemd especificados al inicio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Cada inicio | Desactiva los servicios systemd especificados al iniciar el sistema. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | En cada inicio | Desactiva los cambios automáticos de resolución de pantalla en máquinas virtuales. El valor predeterminado de XFCE es 1280x800. | `novirtres` |
| `virtres` | En cada inicio | Establece la resolución de pantalla de XFCE en máquinas virtuales. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | En cada inicio | Ejecuta solo los componentes de live-config listados, en el orden indicado. | `components=hostname,user-setup,sudo` |
| `nocomponents` | En cada inicio | Ejecuta todos los componentes de live-config excepto los que se indican. | `nocomponents=anacron,apport` |
| `hostname` | En cada inicio | Establece el nombre de host del sistema. | `hostname=minios` |
| `username` | Configuración inicial | Establece el nombre de usuario creado para el inicio de sesión automático. | `username=live` |
| `user-default-groups` | Configuración inicial | Define los grupos predeterminados para el usuario creado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuración inicial | Establece el nombre completo del usuario creado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuración inicial | Establece la contraseña de root en texto plano. | `root-password=toor` |
| `root-password-crypted` | Configuración inicial | Establece la contraseña de root como un hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuración inicial | Establece la contraseña del usuario en texto plano. | `user-password=live` |
| `user-password-crypted` | Configuración inicial | Establece la contraseña del usuario como un hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | En cada inicio | Establece uno o varios locales del sistema. | `locales=en_US.UTF-8` |
| `timezone` | En cada inicio | Establece la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | En cada inicio | Establece el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | En cada inicio | Establece los diseños de teclado separados por comas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | En cada inicio | Establece las variantes de teclado, separadas por comas, correspondientes a los diseños. | `keyboard-variants=,dvorak` |
| `keyboard-options` | En cada inicio | Establece las opciones del teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuración inicial | Evita que live-config otorgue privilegios de sudo y policykit. | `noroot` |
| `noautologin` | En cada inicio | Impide que live-config configure el inicio de sesión automático en consola y en entorno gráfico; la configuración persistente existente no se elimina. | `noautologin` |
| `nottyautologin` | En cada arranque | Impide únicamente la configuración del inicio de sesión automático en consola; la configuración persistente existente no se elimina. | `nottyautologin` |
| `nox11autologin` | En cada arranque | Impide únicamente la configuración del inicio de sesión automático en entorno gráfico; la configuración persistente existente no se elimina. | `nox11autologin` |
| `xorg-driver` | En cada arranque | Selecciona un controlador Xorg en lugar de la autodetección. | `xorg-driver=nouveau` |
| `xorg-resolution` | En cada arranque | Establece la resolución de Xorg en lugar de la autodetección. | `xorg-resolution=1920x1080` |
| `module-mode` | En cada arranque | Con `merged`, integra los cambios de configuración en el sistema live en ejecución. | `module-mode=merged` |
| `link-user-dirs` | En cada arranque | Enlaza los directorios de usuario gestionados a medios grabables MiniOS. Es excluyente con `bind-user-dirs` y no está disponible con ningún `toram` modo ni mientras la sesión de persistencia activa esté cifrada con LUKS. El cifrado activo se determina a partir de la sesión en ejecución, no de la solicitud de `perchencrypt` creación. | `link-user-dirs` |
| `bind-user-dirs` | En cada arranque | Realiza un bind-mount de los directorios de usuario gestionados desde medios grabables MiniOS. Tiene las mismas `toram` restricciones de cifrado de sesión activa que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | En cada arranque | Establece la ubicación relativa al medio utilizada por `link-user-dirs` o `bind-user-dirs`. Predeterminado: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | En cada arranque | Obtiene y ejecuta hooks desde el sistema de archivos, el medio live o URLs compatibles con wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Para la creación nativa en FAT32/NTFS/exFAT o si falla la detección POSIX, el initrd prefiere DynBlk cuando está disponible y permitido por Secure Boot; de lo contrario, DynFileFS. Esto no convierte una sesión existente. Si se selecciona un backend Persistence Plugin Ventoy, la solicitud de persistencia utiliza esa única imagen ext4 en lugar de sesiones numeradas; `perchdir` se ignoran las opciones de sesión. Consulta [Internos de persistencia](/reference/boot-process/Persistence-Internals).

## Consideraciones de seguridad

La línea de comandos del kernel es texto plano y normalmente es visible en la configuración del gestor de arranque, `/proc/cmdline`, y en diagnósticos. No introduzcas secretos reutilizables en `root-password=` ni en `user-password=`. Prefiere los parámetros `*-crypted` correspondientes, aunque los hashes de contraseñas expuestos siguen siendo sensibles.

Los hooks se ejecutan como código privilegiado de arranque. Un hook `http://` no cuenta con cifrado de transporte ni autenticación de servidor, por lo que cualquiera que pueda alterar la ruta de red puede reemplazarlo. Usa solo contenido y mecanismos de entrega en los que confíes; no utilices un hook HTTP sin autenticar para un arranque sensible a la seguridad.

Separa los comandos con espacios. Consulta las páginas de referencia de `man bootparam` para obtener información adicional sobre parámetros del kernel comunes a todas las distribuciones Linux.

Para información detallada sobre los parámetros de live-config, consulta [live-config](/reference/configuration/live-config).

Para cargar MiniOS por red (PXE y HTTP ISO), consulta [Arranque por red](/reference/boot-process/Network-Boot).

## Parámetros de caché de sesión persistente y registro

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `log-storage` o `live-config.log-storage` | Cada inicio con persistencia validada | `persistent` (predeterminado) o `volatile`. En modo volátil, journald utiliza hasta 32 MiB y el `/var/log` utiliza un tmpfs de 32 MiB. Los diagnósticos de arranque se conservan por separado; con persistencia duradera permanecen en el almacenamiento. Un sistema de archivos de registro RAM lleno no se desborda hacia el dispositivo USB. | `log-storage=volatile` |
| `apt-cache` o `live-config.apt-cache` | Cada inicio con persistencia validada | `persistent` (predeterminado) o `volatile` para `/var/cache/apt/archives`. El tmpfs es de 256 MiB si hay al menos 1 GiB disponible, o de 512 MiB si hay al menos 2 GiB. Si el swap no es zRAM, se desactiva; las descargas grandes pueden agotarlo. Las listas de repositorios y el estado de dpkg permanecen en la capa de sesión. | `apt-cache=volatile` |
| `browser-cache` o `live-config.browser-cache` | Cada inicio con persistencia validada | `persistent` (predeterminado) o `volatile`. Con al menos 1 GiB disponible y sin swap que no sea zRAM, los directorios de caché del navegador estándar del usuario en vivo utilizan un tmpfs compartido de 512 MiB. Una política gestionada de Firefox desactiva el almacenamiento en disco cuando no existe otro archivo de políticas. Los perfiles y otras cachés no relacionadas permanecen en la capa de sesión. | `browser-cache=volatile` |

Los tres parámetros de política de almacenamiento son interpretados por `minios-boot` antes del sistema de inicio normal, **no** por el selector de persistencia temprana. No habilitan `perch`. Requieren activación exitosa en almacenamiento duradero o una sesión RAM escribible con información protegida de `ram-origin`; no hacen que los cambios de RAM sean duraderos sin guardar. Un initrd compatible anuncia `perch-storage-v1` en `/run/initramfs/etc/minios-initramfs-storage`. Configurator y `config.conf` ofrecen las mismas opciones; consulte [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para conocer los límites, la precedencia y advertencias sobre la instalación del navegador.
