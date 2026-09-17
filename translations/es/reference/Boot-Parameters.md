---
updated: 2026-09-17
---

# Parámetros de arranque

## Cómo usar los parámetros de arranque

Los parámetros de arranque personalizan cómo se inicia MiniOS. Separe los parámetros con espacios en la línea de comandos del kernel.

### Syslinux

- Pulse <kbd>Esc</kbd> durante la secuencia de arranque de MiniOS para acceder al menú de arranque.
- Pulse <kbd>Tab</kbd> para editar las opciones de arranque.
- Introduzca los parámetros y pulse <kbd>Enter</kbd> para iniciar.

### GRUB

- Pulsa <kbd>E</kbd> en el menú de GRUB.
- Edita los parámetros de arranque al final de la línea de comandos.
- Pulsa <kbd>F10</kbd> para iniciar con la nueva configuración.

## Parámetros de arranque

La columna de aplicación distingue los parámetros que normalmente se aceptan en cada arranque de los ajustes de cuenta destinados a la configuración inicial. Con persistencia, los componentes de live-config normalmente se ejecutan solo una vez; consulta [live-config](/reference/configuration/live-config).

Esta tabla es una referencia rápida. La precedencia de origen y las `from=` formas aceptadas se definen en [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery), el filtrado de módulos en [Carga de módulos Initrd](/reference/boot-process/Module-Loading), la selección de persistencia en [Persistencia Initrd](/reference/boot-process/Persistence-Internals), y las combinaciones compatibles en [Modos de arranque](/using-minios/Boot-Modes).

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `from` | Cada arranque | Carga datos MiniOS desde un directorio, una ruta de dispositivo compatible o una ISO. No se analizan las formas UUID, PARTUUID ni los dispositivos by-id. Un **`http://` literal solamente** tiene prioridad sobre `ip=` y activa el [arranque por red](/reference/boot-process/Network-Boot) a través de httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Cada arranque | Mantiene los candidatos de `.sb` cuyo camino coincide con una expresión regular extendida no anclada; las comas se interpretan como alternativas y un rango numérico ascendente completo tiene una expansión especial. También filtra `toram=trim`. Puede excluir módulos principales o del kernel y hacer que el sistema no arranque. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Cada arranque | Excluye candidatos cuyo camino coincide con una expresión regular extendida no anclada, incluyendo los de `toram=trim`; se aplica después de `load` y puede excluir módulos principales o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Cada arranque | Establece la extensión del paquete. Por defecto: `sb`. La coordinación con el kernel sigue usando nombres `.sb` literales, por lo que una extensión personalizada no puede coordinar el módulo `01-kernel`. | `bext=mymod` |
| `timing` | Cada arranque | Activa la salida de tiempos de inicio. | `timing` |
| `union` | En cada arranque | Selecciona el sistema de archivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | En cada arranque | Dirección estática para la obtención temprana por red. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (puerto HTTP PXE predeterminado **7529**). Un valor literal `from=http://...` tiene prioridad sobre `ip=` y utiliza sus campos de direccionamiento; de lo contrario, cualquier valor no vacío de `ip=` fuerza la descarga de datos PXE y omite los medios locales. Esto no es una configuración de NetworkManager de sesión. Consulta [Arranque por red](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | En cada arranque | Tamaño de caché httpfs en MiB para arranque de red ISO por HTTP (`from=http://…`). Consulta [Arranque por red](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | En cada arranque | Abre una consola de depuración al final de la etapa initramfs. | `rd.break` |
| `perchdir` | En cada arranque | Selecciona una sesión de persistencia numerada o una acción: `resume`, `new`, o `ask`. Un selector numérico inexistente puede recurrir al valor predeterminado de los metadatos; no reserva ni crea ese número. Un dispositivo/ruta o `askdisk` selecciona otra ubicación de persistencia. Usa un sufijo delimitado por dos puntos para una ruta personalizada. Sin un parámetro de persistencia, MiniOS inicia desde cero. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | En cada arranque | Tamaño lógico del contenedor para `dynfilefs`, `dynblk`, `vmdk` y `raw`; no aplica a `native` o `squashfs`. Un número solo o `M`/`MB` se asigna en MiB; `G`/`GB` y `T`/`TB` se convierten en 1000 y 1.000.000 MiB. Sin un tamaño explícito, los DynFileFS, DynBlk y sesiones VMDK creados por initrd usan hasta 16 GiB y reducen ese valor predeterminado si queda menos espacio disponible después de `perchreserve`; DynFileFS además considera la sobrecarga de su índice y el límite de RAM. DynBlk consulta el límite del backend instalado usando `dynblk limits --format dynblk` (o `--format vmdk` para VMDK); no existe un límite separado de 512 GiB. El payload de DynFileFS y los datos de respaldo de DynBlk crecen bajo demanda, mientras que DynFileFS también reserva índices para la capacidad lógica declarada. Las solicitudes Raw están limitadas a 1.000.000 MiB y por el espacio disponible después de `perchreserve`; Raw se limita a 4000 MiB en FAT32, esté cifrado o no. Los nuevos contenedores raw tienen por defecto 4000 MiB. El Gestor de sesiones de MiniOS sigue asignando por defecto los contenedores DynFileFS creados manualmente a 4000 MiB y DynBlk/VMDK a 16 GiB. Consulta [Persistencia initrd](/reference/boot-process/Persistence-Internals) para el comportamiento de memoria y almacenamiento del backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | En cada arranque | Margen de asignación y umbral de advertencia por poco espacio en MiB. Se resta al dimensionar contenedores nuevos o en crecimiento, pero no es una cuota en tiempo de ejecución y no impide que escrituras posteriores llenen el dispositivo. Por defecto: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | En cada arranque | Modo de almacenamiento persistente.<br>`native` (predeterminado): un directorio en un sistema de archivos POSIX con permisos de escritura.<br>`dynfilefs`: contenedor expandible basado en FUSE formato-400, incluso en FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo de bloque de kernel separado formato-1 respaldado por thin `volumeNNN.db` archivos; el número real `/dev/dynblkN` se asigna dinámicamente y pueden coexistir varios volúmenes.<br>`vmdk`: archivos estándar dispersos divididos `volume.vmdk` / `volume-sNNN.vmdk` archivos expuestos por el controlador DynBlk; sin compresión. Requiere la capacidad versionada de `vmdk-session-v1` initrd.<br>`raw`: una imagen ext4 de tamaño fijo.<br>`squashfs`: una instantánea comprimida desempaquetada en una capa superior respaldada por RAM. La configuración de initrd solo crea los metadatos de la generación cero; el sistema en ejecución crea la primera instantánea bajo demanda o al apagar. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo al crear | Capa de cifrado opcional para una nueva `raw`, `dynfilefs`, `dynblk`, o `vmdk` sesión. `perchencrypt=luks` requiere la capacidad versionada de `luks-layer-v1` initramfs. Las sesiones existentes derivan el cifrado solo de `session_encryption[N]`, por lo que este parámetro no las reinterpreta ni las convierte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo al crear | Selecciona la compresión backend DynBlk para una nueva sesión DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`. El códec de kernel seleccionado debe estar disponible. Cuando `perchencrypt=luks` envuelve DynBlk, MiniOS fuerza la compresión DynBlk a `none`. VMDK no tiene compresión: el arranque ignora un códec no `none` con una advertencia. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | En cada arranque | Activa la ruta heredada de reanudación de persistencia. A diferencia de `perchdir=resume`, no crea automáticamente un reemplazo compatible cuando no existe una sesión predeterminada utilizable. | `perch` |
| `toram` | En cada arranque | Básico `toram` es `full`. Con persistencia, la copia completa de nivel superior `*` omite los archivos ocultos; sin persistencia omite `changes` pero copia las demás entradas de nivel superior, incluidos los archivos ocultos. Trim copia solo lo necesario: `config.conf`, archivos regulares `authorized_keys`, módulos seleccionados de nivel superior y recursivos, y el árbol completo de `changes/` cuando se solicita persistencia; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, registros, otros datos que no son módulos y el nivel separado de módulo de persistencia. Ningún modo verifica primero la capacidad de RAM. Un almacén de persistencia copiado a RAM no es duradero y los cambios no se copian de vuelta. Extraiga el medio solo después de confirmar que la fuente, los bucles y los mapeos se han desmontado correctamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | En cada arranque | Inicia en modo consola de texto. | `text` |
| `automount` | En cada arranque | Habilita el montaje automático de dispositivos de almacenamiento. | `automount` |
| `debug` | En cada arranque | Activa diagnósticos adicionales al inicio. | `debug` |
| `nozram` | En cada arranque | Desactiva el intercambio zram. | `nozram` |
| `zramsize` | En cada arranque | Establece el tamaño de swap zram en MiB. Si se omite, MiniOS lo calcula a partir del total de RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | En cada arranque | Selecciona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, o `zstd`; la disponibilidad depende del kernel en ejecución. Si se omite, se mantiene el valor predeterminado del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | En cada arranque | Establece el destino predeterminado de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | En cada arranque | Habilita los servicios systemd especificados al arrancar. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | En cada arranque | Desactiva los servicios systemd especificados al arrancar. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | En cada arranque | Desactiva los cambios automáticos de resolución de pantalla en máquinas virtuales. El valor predeterminado de XFCE es 1280x800. | `novirtres` |
| `virtres` | En cada arranque | Establece la resolución de pantalla de XFCE en máquinas virtuales. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | En cada inicio | Ejecuta solo los componentes de live-config listados, en el orden indicado. | `components=hostname,user-setup,sudo` |
| `nocomponents` | En cada inicio | Ejecuta todos los componentes de live-config excepto los listados. | `nocomponents=anacron,apport` |
| `hostname` | En cada inicio | Establece el nombre de host del sistema. | `hostname=minios` |
| `username` | Configuración inicial | Establece el nombre de usuario creado para inicio de sesión automático. | `username=live` |
| `user-default-groups` | Configuración inicial | Establece los grupos predeterminados del usuario creado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuración inicial | Establece el nombre completo del usuario creado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuración inicial | Establece la contraseña de root en texto plano. | `root-password=toor` |
| `root-password-crypted` | Configuración inicial | Establece la contraseña de root como un hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuración inicial | Establece la contraseña del usuario en texto plano. | `user-password=live` |
| `user-password-crypted` | Configuración inicial | Establece la contraseña del usuario como un hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | En cada inicio | Establece uno o más locales del sistema. | `locales=en_US.UTF-8` |
| `timezone` | En cada inicio | Establece la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | En cada inicio | Establece el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | En cada inicio | Establece las distribuciones de teclado separadas por comas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | En cada inicio | Establece las variantes de teclado, separadas por comas, correspondientes a las distribuciones. | `keyboard-variants=,dvorak` |
| `keyboard-options` | En cada inicio | Establece las opciones de teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuración inicial | Evita que live-config otorgue privilegios de sudo y policykit. | `noroot` |
| `noautologin` | En cada inicio | Evita que live-config configure el inicio de sesión automático en consola y entorno gráfico; la configuración persistente existente no se elimina. | `noautologin` |
| `nottyautologin` | En cada inicio | Evita solo la configuración del inicio de sesión automático en consola; la configuración persistente existente no se elimina. | `nottyautologin` |
| `nox11autologin` | En cada inicio | Evita solo la configuración del inicio de sesión automático en entorno gráfico; la configuración persistente existente no se elimina. | `nox11autologin` |
| `xorg-driver` | En cada inicio | Selecciona un controlador Xorg en lugar de la autodetección. | `xorg-driver=nouveau` |
| `xorg-resolution` | En cada inicio | Establece la resolución de Xorg en lugar de la autodetección. | `xorg-resolution=1920x1080` |
| `module-mode` | En cada inicio | Con `merged`, integra los cambios de configuración en el sistema en vivo en ejecución. | `module-mode=merged` |
| `hooks` | En cada inicio | Obtiene y ejecuta hooks desde el sistema de archivos, el medio en vivo o URLs compatibles con wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Consideraciones de seguridad

La línea de comandos del kernel es texto plano y normalmente es visible en la configuración del gestor de arranque, `/proc/cmdline`, y en diagnósticos. No almacenes secretos reutilizables en `root-password=` ni en `user-password=`. Es preferible utilizar los parámetros de `*-crypted`, aunque los hashes de contraseñas expuestos deben seguir considerándose sensibles.

Los hooks se ejecutan como código privilegiado durante el arranque. Un `http://` hook no cuenta con cifrado de transporte ni autenticación de servidor, por lo que cualquiera que pueda modificar la ruta de red puede reemplazarlo. Utiliza solo mecanismos de entrega y contenido en los que confíes; no uses un hook HTTP sin autenticación para procesos de inicio sensibles a la seguridad.

Separa los comandos con espacios. Consulta las `man bootparam` páginas de referencia para obtener información adicional sobre parámetros del kernel comunes a todas las distribuciones Linux.

Para información detallada sobre los parámetros de live-config, consulta [live-config](/reference/configuration/live-config).

Para cargar MiniOS por red (PXE y HTTP ISO), consulta [Arranque por red](/reference/boot-process/Network-Boot).
