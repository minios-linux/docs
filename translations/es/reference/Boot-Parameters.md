---
updated: 2026-09-13
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

La columna de aplicación distingue los parámetros normalmente aceptados en cada inicio de los ajustes de cuenta destinados a la configuración inicial. Con persistencia, los componentes live-config normalmente se ejecutan solo una vez; consulta [live-config](/reference/configuration/live-config).

Esta tabla es una referencia rápida. La precedencia de origen y los `from=` formatos aceptados se definen en [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery), el filtrado de módulos en [Carga de módulos Initrd](/reference/boot-process/Module-Loading), la selección de persistencia en [Persistencia Initrd](/reference/boot-process/Persistence-Internals), y las combinaciones soportadas en [Modos de arranque](/using-minios/Boot-Modes).

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `from` | Cada arranque | Carga datos de MiniOS desde un directorio, una ruta de dispositivo soportada o una ISO. No se procesan las formas UUID, PARTUUID ni dispositivos by-id. Un **`http://` literal solamente** URL tiene prioridad sobre `ip=` y activa el [arranque por red](/reference/boot-process/Network-Boot) a través de httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Cada arranque | Mantiene los `.sb` candidatos cuyo camino coincide con una expresión regular extendida no anclada; las comas funcionan como alternancia y un rango numérico ascendente completo tiene una expansión especial. También filtra `toram=trim`. Puede excluir módulos principales o del kernel y hacer que el sistema no arranque. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Cada arranque | Excluye candidatos cuyo camino coincide con una expresión regular extendida no anclada, incluyendo desde `toram=trim`; se aplica después de `load` y puede excluir módulos principales o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Cada arranque | Establece la extensión del bundle. Por defecto: `sb`. La coordinación con el kernel sigue usando nombres `.sb` literales, por lo que una extensión personalizada no puede coordinar el módulo `01-kernel`. | `bext=mymod` |
| `timing` | Cada arranque | Activa la salida del tiempo de inicio. | `timing` |
| `union` | En cada inicio | Selecciona el sistema de archivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | En cada inicio | Dirección estática para la obtención temprana de red. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (puerto HTTP PXE predeterminado **7529**). Un valor literal `from=http://...` tiene prioridad sobre `ip=` y utiliza sus campos de direccionamiento; de lo contrario, cualquier valor no vacío de `ip=` fuerza la descarga de datos PXE y omite los medios locales. Esto no es una configuración de sesión de NetworkManager. Consulte [Arranque por red](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | En cada inicio | Tamaño de caché httpfs en MiB para arranque de red HTTP ISO (`from=http://…`). Consulte [Arranque por red](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | En cada inicio | Abre una consola de depuración al final de la etapa initramfs. | `rd.break` |
| `perchdir` | En cada inicio | Selecciona una sesión de persistencia numerada o una acción: `resume`, `new`, o `ask`. Un selector numérico inexistente puede recurrir al valor predeterminado de los metadatos; no reserva ni crea ese número. Un dispositivo/ruta o `askdisk` selecciona otra ubicación de persistencia. Use un sufijo delimitado por dos puntos para una ruta personalizada. Sin un parámetro de persistencia, MiniOS inicia desde cero. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | En cada inicio | Tamaño del contenedor para `dynfilefs`, `dynblk`, `raw`, y `luks`; no aplica a `native` o `squashfs`. Un número solo o `M`/`MB` se asigna en MiB; `G`/`GB` y `T`/`TB` se convierten en 1000 y 1,000,000 MiB. Dynblk utiliza un valor predeterminado delgado de 16 GiB y tiene un límite virtual de 512 GiB; su respaldo físico crece según demanda. Otras solicitudes de contenedor se limitan a 1,000,000 MiB y al espacio disponible después de `perchreserve`. Gestor de sesiones de MiniOS limita archivos raw y LUKS a 4000 MiB en FAT32; initrd LUKS aplica ese límite, pero una solicitud raw de initrd sobredimensionada puede fallar en lugar de reducirse. Los nuevos contenedores raw y LUKS tienen como valor predeterminado 4000 MiB. DynFileFS creado por initramfs utiliza como valor predeterminado la capacidad disponible redondeada hacia abajo a 1000 MiB; Gestor de sesiones de MiniOS lo establece en 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Cada inicio | Margen de asignación y umbral de advertencia de poco espacio en MiB. Se resta al dimensionar contenedores nuevos o en crecimiento, pero no es una cuota en tiempo de ejecución y no impide que futuras escrituras llenen el dispositivo. Valor predeterminado: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Cada inicio | Modo de almacenamiento persistente.<br>`native` (predeterminado): un directorio en un sistema de archivos POSIX con permisos de escritura.<br>`dynfilefs`: contenedor expandible formato-400 basado en FUSE, incluso en FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo de bloque de kernel formato-1 independiente respaldado por thin `volumeNNN.db` archivos; el número real `/dev/dynblkN` se asigna dinámicamente y varios volúmenes pueden coexistir.<br>`raw`: una imagen ext4 de tamaño fijo.<br>`luks`: un contenedor ext4 cifrado con LUKS2; la creación y el desbloqueo requieren interacción en la consola y soporte de cifrado en el initramfs.<br>`squashfs`: un snapshot comprimido existente descomprimido para la sesión. Gestor de sesiones de MiniOS puede crear y guardar snapshots de SquashFS del sistema en ejecución; el initramfs puede reanudar pero no crearlos. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Cada inicio | Habilita la ruta de reanudación de persistencia heredada. A diferencia de `perchdir=resume`, no crea automáticamente un reemplazo compatible cuando no existe una sesión predeterminada utilizable. | `perch` |
| `toram` | Cada inicio | Bare `toram` es `full`. Con persistencia, la copia de nivel superior de full `*` omite archivos ocultos; sin persistencia omite `changes` pero copia otras entradas de nivel superior, incluidos los archivos ocultos. Trim copia los `config.conf` requeridos, archivos regulares `authorized_keys`, módulos seleccionados de nivel superior y recursivos, y el árbol completo de `changes/` cuando se solicita persistencia; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, registros, otros datos que no son módulos y el nivel separado de módulos de persistencia. Ningún modo verifica primero la capacidad de RAM. Un almacén de persistencia copiado a RAM no es duradero y los cambios no se copian de vuelta. Retire el medio solo después de confirmar que la fuente, los loops y los mapeos se han desmontado correctamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Cada inicio | Inicia en modo consola de texto. | `text` |
| `automount` | Cada inicio | Habilita el montaje automático de dispositivos de almacenamiento. | `automount` |
| `debug` | Cada inicio | Habilita diagnósticos adicionales al inicio. | `debug` |
| `nozram` | Cada inicio | Desactiva el intercambio zram. | `nozram` |
| `zramsize` | Cada inicio | Establece el tamaño del intercambio zram en MiB. Si se omite, MiniOS lo calcula a partir de la RAM total. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Cada inicio | Selecciona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, o `zstd`; la disponibilidad depende del kernel en ejecución. Si se omite, se mantiene el valor predeterminado del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Cada inicio | Establece el objetivo predeterminado de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Cada inicio | Habilita los servicios de systemd especificados al iniciar. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Cada inicio | Deshabilita los servicios de systemd especificados al iniciar. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Cada inicio | Desactiva los cambios automáticos de resolución de pantalla en máquinas virtuales. El valor predeterminado en XFCE es 1280x800. | `novirtres` |
| `virtres` | Cada inicio | Establece la resolución de pantalla de XFCE en máquinas virtuales. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Cada inicio | Ejecuta solo los componentes de live-config listados, en el orden indicado. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Cada inicio | Ejecuta todos los componentes de live-config excepto los listados. | `nocomponents=anacron,apport` |
| `hostname` | Cada inicio | Establece el nombre de host del sistema. | `hostname=minios` |
| `username` | Configuración inicial | Establece el nombre de usuario creado para el inicio de sesión automático. | `username=live` |
| `user-default-groups` | Configuración inicial | Establece los grupos predeterminados del usuario creado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuración inicial | Establece el nombre completo del usuario creado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuración inicial | Establece la contraseña de root en texto plano. | `root-password=toor` |
| `root-password-crypted` | Configuración inicial | Establece la contraseña de root como un hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuración inicial | Establece la contraseña del usuario en texto plano. | `user-password=live` |
| `user-password-crypted` | Configuración inicial | Establece la contraseña del usuario como un hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Cada inicio | Establece uno o más locales del sistema. | `locales=en_US.UTF-8` |
| `timezone` | Cada inicio | Establece la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Cada inicio | Establece el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | Cada inicio | Establece las distribuciones de teclado separadas por comas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Cada inicio | Establece las variantes de teclado separadas por comas correspondientes a las distribuciones. | `keyboard-variants=,dvorak` |
| `keyboard-options` | En cada inicio | Configura las opciones del teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuración inicial | Evita que live-config otorgue privilegios de sudo y policykit. | `noroot` |
| `noautologin` | En cada inicio | Evita que live-config configure el inicio de sesión automático en consola y entorno gráfico; la configuración persistente existente no se elimina. | `noautologin` |
| `nottyautologin` | En cada inicio | Evita únicamente la configuración del inicio de sesión automático en consola; la configuración persistente existente no se elimina. | `nottyautologin` |
| `nox11autologin` | En cada inicio | Evita únicamente la configuración del inicio de sesión automático en entorno gráfico; la configuración persistente existente no se elimina. | `nox11autologin` |
| `xorg-driver` | En cada inicio | Selecciona un controlador Xorg en lugar de la autodetección. | `xorg-driver=nouveau` |
| `xorg-resolution` | En cada inicio | Establece la resolución de Xorg en lugar de la autodetección. | `xorg-resolution=1920x1080` |
| `module-mode` | En cada inicio | Con `merged`, integra los cambios de configuración en el sistema live en ejecución. | `module-mode=merged` |
| `hooks` | En cada inicio | Descarga y ejecuta hooks desde el sistema de archivos, el medio live o URLs compatibles con wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Consideraciones de seguridad

La línea de comandos del kernel es texto plano y normalmente es visible en la configuración del gestor de arranque, `/proc/cmdline`, y en diagnósticos. No almacenes secretos reutilizables en `root-password=` ni en `user-password=`. Es preferible utilizar los parámetros de `*-crypted`, aunque los hashes de contraseñas expuestos deben seguir considerándose sensibles.

Los hooks se ejecutan como código privilegiado durante el arranque. Un `http://` hook no cuenta con cifrado de transporte ni autenticación de servidor, por lo que cualquiera que pueda modificar la ruta de red puede reemplazarlo. Utiliza solo mecanismos de entrega y contenido en los que confíes; no uses un hook HTTP sin autenticación para procesos de inicio sensibles a la seguridad.

Separa los comandos con espacios. Consulta las `man bootparam` páginas de referencia para obtener información adicional sobre parámetros del kernel comunes a todas las distribuciones Linux.

Para información detallada sobre los parámetros de live-config, consulta [live-config](/reference/configuration/live-config).

Para cargar MiniOS por red (PXE y HTTP ISO), consulta [Arranque por red](/reference/boot-process/Network-Boot).
