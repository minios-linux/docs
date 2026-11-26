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

La columna de aplicación distingue los parámetros que normalmente se aceptan en cada arranque de los ajustes de cuenta destinados a la configuración inicial. Con la persistencia, los componentes de live-config normalmente se ejecutan una sola vez; consulta [live-config](/reference/configuration/live-config).

Esta tabla es una referencia rápida. La precedencia de las fuentes y las `from=` formas aceptadas se definen en [Detección del sistema en Initrd](/reference/boot-process/System-Discovery), el filtrado de módulos en [Carga de módulos en Initrd](/reference/boot-process/Module-Loading), la selección de persistencia en [Persistencia en Initrd](/reference/boot-process/Persistence-Internals) y las combinaciones admitidas en [Modos de arranque](/using-minios/Boot-Modes).

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `from` | Cada arranque | Carga datos de MiniOS desde un directorio, una ruta de dispositivo compatible o una ISO. No analiza UUID, PARTUUID ni formas de dispositivo by-id. Una URL literal **`http://` únicamente** tiene prioridad sobre `ip=` e inicia el [arranque por red](/reference/boot-process/Network-Boot) mediante httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Cada arranque | Conserva los candidatos de `.sb` cuya ruta coincide con una expresión regular extendida sin anclaje; las comas se convierten en alternativas y un rango numérico ascendente completo tiene una expansión especial. También filtra `toram=trim`. Puede excluir módulos principales o del kernel e impedir que el sistema arranque. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Cada arranque | Excluye los candidatos cuya ruta coincide con una expresión regular extendida sin anclaje, incluso de `toram=trim`; se aplica después de `load` y puede excluir módulos principales o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Cada arranque | Establece la extensión del paquete. Valor predeterminado: `sb`. La coordinación del kernel sigue usando nombres literales `.sb`; por tanto, una extensión personalizada no puede coordinar el módulo `01-kernel`. | `bext=mymod` |
| `timing` | Cada arranque | Activa la salida del tiempo de inicio. | `timing` |
| `union` | En cada arranque | Selecciona el sistema de archivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | En cada arranque | Dirección estática para la descarga de red inicial. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (puerto HTTP predeterminado de PXE: **7529**). Un `from=http://...` literal tiene prioridad sobre `ip=` y utiliza sus campos de direccionamiento; de lo contrario, cualquier `ip=` no vacío fuerza la descarga de datos por PXE y omite el medio local. Esta opción no configura NetworkManager para la sesión. Consulta [Arranque de red](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | En cada arranque | Tamaño de la caché httpfs en MiB para el arranque de red con ISO HTTP (`from=http://…`). Consulta [Arranque de red](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | En cada arranque | Abre una shell de depuración al final de la fase initramfs. | `rd.break` |
| `perchdir` | En cada arranque | Selecciona una sesión de persistencia numerada o una acción. `resume` abre la sesión compatible predeterminada; `setup` permite elegir interactivamente el backend de almacenamiento y, a continuación, crea una sesión numerada; `new` crea directamente una sesión nueva con la configuración solicitada o predeterminada de `perchmode`, cifrado, compresión y tamaño; `ask` muestra las sesiones guardadas y abre automáticamente la configuración si no hay ninguna. Si el selector numérico no existe, puede recurrirse al valor predeterminado de los metadatos; no se reserva ni se crea ese número. Un dispositivo/ruta o un `askdisk` selecciona otra ubicación de persistencia. Usa un sufijo separado por dos puntos para indicar una ruta personalizada. Sin un parámetro de persistencia, MiniOS se inicia sin conservar datos. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | En cada arranque | Tamaño del contenedor lógico para `dynfilefs`, `dynblk`, `vmdk` y `raw`; no se aplica a `native` ni a `squashfs`. Un número sin unidad o un valor `M`/`MB` se asigna en MiB; `G`/`GB` y `T`/`TB` se convierten en 1000 y 1.000.000 MiB. Si no se especifica un tamaño, las sesiones DynFileFS, DynBlk y VMDK creadas por initrd usan hasta 16 GiB, y reducen ese valor predeterminado si queda menos espacio de respaldo después de `perchreserve`. Se siguen aplicando las comprobaciones de capacidad del backend. DynBlk consulta el límite del backend instalado usando `dynblk limits --format dynblk` (o `--format vmdk` para VMDK); no hay un límite máximo independiente de 512 GiB. DynFileFS y DynBlk asignan espacio para los datos según se necesita. Las solicitudes Raw tienen un límite de 1.000.000 MiB y están restringidas por el espacio disponible después de `perchreserve`; Raw está limitado a 4000 MiB en FAT32, tanto si está cifrado como si no. Los contenedores Raw nuevos tienen un tamaño predeterminado de 4000 MiB. El Gestor de sesiones de MiniOS asigna 4000 MiB de forma predeterminada a los contenedores DynFileFS creados manualmente y 16 GiB a DynBlk/VMDK. Consulta [Persistencia de initrd](/reference/boot-process/Persistence-Internals) para obtener información sobre el comportamiento de memoria y almacenamiento de los backends. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Cada arranque | Margen de asignación y umbral de advertencia de poco espacio, en MiB. Se resta al dimensionar contenedores nuevos o al ampliarlos, pero no es una cuota de ejecución y no impide que las escrituras posteriores llenen el dispositivo. Valor predeterminado: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Cada arranque | Modo de almacenamiento persistente.<br>`native` (predeterminado): un directorio en un sistema de archivos POSIX con permisos de escritura.<br>`dynfilefs`: un contenedor FUSE ampliable que usa el formato 600, también en FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo de bloques del kernel independiente, con formato 1 y respaldado por archivos `volumeNNN.db` de asignación dinámica; el número real de `/dev/dynblkN` se asigna dinámicamente y pueden coexistir varios volúmenes.<br>`vmdk`: archivos dispersos estándar divididos `volume.vmdk` / `volume-sNNN.vmdk` expuestos por el controlador DynBlk; sin compresión. Requiere la capacidad versionada de `vmdk-session-v1` initrd.<br>`raw`: una imagen ext4 de tamaño fijo.<br>`squashfs`: una instantánea comprimida que se descomprime en una capa superior respaldada por RAM. La configuración de initrd solo crea metadatos de la generación cero; el sistema en ejecución crea la primera instantánea cuando se necesita o al apagarse. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo al crear | Capa de cifrado opcional para una sesión nueva de `raw`, `dynfilefs`, `dynblk` o `vmdk` . `perchencrypt=luks` requiere la capacidad versionada de `luks-layer-v1` initramfs. Las sesiones existentes obtienen el cifrado únicamente de `session_encryption[N]`, por lo que este parámetro no las reinterpreta ni las convierte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo al crear | Selecciona la compresión del backend DynBlk para una sesión nueva de DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`. El códec seleccionado debe estar disponible en el kernel. Cuando `perchencrypt=luks` encapsula DynBlk, MiniOS fuerza la compresión DynBlk a `none`. VMDK no admite compresión: durante el arranque se ignora cualquier códec distinto de`none` y se muestra una advertencia. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Cada arranque | Activa la ruta heredada para reanudar la persistencia. A diferencia de `perchdir=resume`, no crea automáticamente un reemplazo compatible cuando no existe una sesión predeterminada utilizable. | `perch` |
| `toram` | En cada arranque | Controla la copia de MiniOS **sistema** a RAM. El modo básico `toram` es `full`; `trim` copia la configuración necesaria y el conjunto de módulos seleccionado, y omite los datos de origen no relacionados. La copia de persistencia se controla por separado mediante `perchtoram`. Cuando se solicita persistencia y no se especifica `perchtoram` , cualquier modo activo de `toram` configura la copia de persistencia como `trim`. Retira el medio solo después de confirmar que el origen original, los bucles, las asignaciones y cualquier almacén de persistencia necesario se hayan desconectado correctamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | En cada arranque con persistencia | `off` conserva el almacén original; `trim` copia la sesión seleccionada Raw, DynFileFS, DynBlk, VMDK o SquashFS; `full` copia todos los contenedores y las instantáneas compatibles, junto con los metadatos correspondientes. Valor predeterminado: `trim` con sistema `toram`, en caso contrario `off`. No solicita persistencia por sí solo. Los datos nativos no se copian: una solicitud RAM correcta inicia un contenedor nuevo y vacío, excepto durante el restablecimiento, que desactiva la copia. Si la copia falla, se mantiene la operación en el almacenamiento. Los cambios en RAM deben guardarse en el almacén original con permisos de escritura o como una sesión nueva. Se ignora con el backend Persistence Plugin Ventoy seleccionado. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | En cada arranque | Inicia en modo de consola de texto. | `text` |
| `automount` | En cada arranque | Activa el montaje automático de los dispositivos de almacenamiento. | `automount` |
| `debug` | En cada arranque | Activa diagnósticos adicionales durante el inicio. | `debug` |
| `nozram` | En cada arranque | Desactiva el espacio de intercambio zram. | `nozram` |
| `zramsize` | En cada arranque | Establece el tamaño del espacio de intercambio zram en MiB. Si se omite, MiniOS lo calcula a partir del total de RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | En cada arranque | Selecciona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, o `zstd`; la disponibilidad depende del kernel en ejecución. Si se omite, se conserva el valor predeterminado del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | En cada arranque | Establece el destino predeterminado de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | En cada arranque | Activa los servicios systemd especificados durante el inicio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | En cada arranque | Desactiva los servicios de systemd especificados durante el arranque. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | En cada arranque | Desactiva los cambios automáticos de resolución de pantalla en máquinas virtuales. La resolución predeterminada de XFCE es 1280x800. | `novirtres` |
| `virtres` | En cada arranque | Establece la resolución de pantalla de XFCE en máquinas virtuales. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | En cada arranque | Ejecuta solo los componentes de live-config indicados, en el orden de los componentes. | `components=hostname,user-setup,sudo` |
| `nocomponents` | En cada arranque | Ejecuta todos los componentes de live-config excepto los indicados. | `nocomponents=anacron,apport` |
| `hostname` | En cada arranque | Establece el nombre de host del sistema. | `hostname=minios` |
| `username` | Configuración inicial | Establece el nombre de usuario creado para el inicio de sesión automático. | `username=live` |
| `user-default-groups` | Configuración inicial | Establece los grupos predeterminados del usuario creado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuración inicial | Establece el nombre completo del usuario creado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuración inicial | Establece la contraseña de root en texto sin formato. | `root-password=toor` |
| `root-password-crypted` | Configuración inicial | Establece la contraseña de root como hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuración inicial | Establece la contraseña del usuario en texto sin formato. | `user-password=live` |
| `user-password-crypted` | Configuración inicial | Establece la contraseña del usuario como hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | En cada arranque | Establece una o varias configuraciones regionales del sistema. | `locales=en_US.UTF-8` |
| `timezone` | En cada arranque | Establece la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | En cada arranque | Establece el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | En cada arranque | Establece las distribuciones de teclado separadas por comas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | En cada arranque | Establece las variantes de teclado separadas por comas que corresponden a las distribuciones. | `keyboard-variants=,dvorak` |
| `keyboard-options` | En cada arranque | Establece las opciones del teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuración inicial | Impide que live-config conceda privilegios de sudo y PolicyKit. | `noroot` |
| `noautologin` | En cada arranque | Impide que live-config configure el inicio de sesión automático en la consola y en el entorno gráfico; no elimina la configuración persistente existente. | `noautologin` |
| `nottyautologin` | Cada inicio | Impide configurar únicamente el inicio de sesión automático en la consola; no elimina la configuración persistente existente. | `nottyautologin` |
| `nox11autologin` | Cada inicio | Impide configurar únicamente el inicio de sesión automático en el entorno gráfico; no elimina la configuración persistente existente. | `nox11autologin` |
| `xorg-driver` | Cada inicio | Selecciona un controlador de Xorg en lugar de detectarlo automáticamente. | `xorg-driver=nouveau` |
| `xorg-resolution` | Cada inicio | Establece la resolución de Xorg en lugar de detectarla automáticamente. | `xorg-resolution=1920x1080` |
| `module-mode` | Cada inicio | Con `merged`, integra los cambios de configuración en el sistema live en ejecución. | `module-mode=merged` |
| `link-user-dirs` | Cada inicio | Vincula los directorios de usuario administrados a medios MiniOS con permisos de escritura. Es mutuamente excluyente con `bind-user-dirs` y no está disponible con ningún modo `toram` ni mientras la sesión de persistencia activa esté cifrada con LUKS. El cifrado activo se determina a partir de la sesión en ejecución, no de la solicitud de creación de `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | Cada inicio | Monta mediante bind los directorios de usuario administrados desde medios MiniOS con permisos de escritura. Tiene las mismas restricciones de `toram` y de cifrado de la sesión activa que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Cada inicio | Establece la ubicación relativa al medio que usan `link-user-dirs` o `bind-user-dirs`. Valor predeterminado: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Cada inicio | Obtiene y ejecuta hooks del sistema de archivos, del medio live o de URL compatibles con wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Para la creación nativa en FAT32/NTFS/exFAT o si falla la comprobación de POSIX, initrd prefiere DynBlk cuando está disponible y Secure Boot lo permite; de lo contrario, usa DynFileFS. Esta alternativa no cambia el modo de almacenamiento de una sesión existente. Si se selecciona un backend de Persistence Plugin Ventoy, una solicitud de persistencia usa esa única imagen ext4 en lugar de sesiones numeradas; `perchdir`se ignoran las opciones de sesión. Consulta [Detalles internos de la persistencia](/reference/boot-process/Persistence-Internals).

Al montar normalmente, el helper actual DynFileFS convierte automáticamente y en el mismo lugar el formato 400 o 500 a 600 si el tamaño de la división heredada es un número par de MiB. Si la división tiene un número impar de MiB, se rechaza sin modificarla. Ningún parámetro de arranque selecciona los formatos antiguos ni habilita la conversión.

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
