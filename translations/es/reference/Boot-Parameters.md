---
updated: 2026-08-26
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

La columna "Aplicación" distingue los parámetros aceptados normalmente en cada arranque de los ajustes de cuenta destinados a la configuración inicial. Con persistencia, los componentes de live-config normalmente se ejecutan solo una vez; consulta [live-config](/reference/configuration/live-config).

Esta tabla es una referencia rápida. La precedencia de las fuentes y las formas aceptadas de `from=` se definen en [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery), el filtrado de módulos en [Carga de módulos Initrd](/reference/boot-process/Module-Loading), la selección de persistencia en [Selección de persistencia Initrd](/reference/boot-process/Persistence-Internals), y las combinaciones soportadas en [Modos de arranque](/using-minios/Boot-Modes).

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `from` | Cada arranque | Carga los datos de MiniOS desde un directorio, una ruta de dispositivo soportada o una ISO. No se interpretan las formas UUID, PARTUUID ni by-id. Una URL literal **`http://` only** tiene prioridad sobre `ip=` e inicia el [arranque en red](/reference/boot-process/Network-Boot) mediante httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Cada arranque | Mantiene los candidatos de `.sb` cuya ruta coincide con una expresión regular extendida no anclada; las comas se interpretan como alternancia y un rango numérico ascendente completo tiene una expansión especial. También filtra `toram=trim`. Puede excluir módulos núcleo o del kernel y dejar el sistema inarrancable. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Cada arranque | Excluye candidatos cuya ruta coincide con una expresión regular extendida no anclada, incluyendo desde `toram=trim`; se aplica después de `load` y puede excluir módulos núcleo o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Cada arranque | Establece la extensión del bundle. Por defecto: `sb`. La coordinación con el kernel sigue usando los nombres literales `.sb`, por lo que una extensión personalizada no puede coordinar el módulo `01-kernel`. | `bext=mymod` |
| `timing` | Cada arranque | Activa la salida de tiempos de inicio. | `timing` |
| `union` | Cada arranque | Selecciona el sistema de archivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Cada arranque | Dirección estática para la obtención temprana por red. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (puerto HTTP PXE por defecto **7529**). Una `from=http://...` literal tiene prioridad sobre `ip=` y usa sus campos de direccionamiento; de lo contrario, cualquier `ip=` no vacío fuerza la descarga de datos PXE y omite los medios locales. Esto no es una configuración de NetworkManager de sesión. Consulta [Arranque en red](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Cada arranque | Tamaño de caché httpfs en MiB para arranque de red HTTP ISO (`from=http://…`). Consulta [Arranque en red](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Cada arranque | Abre una shell de depuración al final de la etapa initramfs. | `rd.break` |
| `perchdir` | Cada arranque | Selecciona una sesión de persistencia numerada o una acción: `resume`, `new` o `ask`. Un selector numérico inexistente puede recurrir al valor por defecto de los metadatos; no reserva ni crea ese número. Una ruta de dispositivo o la forma `askdisk` selecciona otra ubicación de persistencia. Usa un sufijo delimitado por dos puntos para una ruta personalizada. Sin un parámetro de persistencia, MiniOS inicia limpio. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Cada arranque | Tamaño del contenedor para `dynfilefs`, `raw` y `luks`; no aplica a `native` ni `squashfs`. Un número solo o un valor `M`/`MB` se asigna en MiB; `G`/`GB` y `T`/`TB` se convierten a 1000 y 1.000.000 MiB. El límite es 1.000.000 MiB, restringido además por el espacio disponible tras `perchreserve`. El Gestor de sesiones de MiniOS limita archivos raw y LUKS a 4000 MiB en FAT32; initrd LUKS aplica ese límite, pero una petición raw de initrd sobredimensionada puede fallar en vez de reducirse. Los contenedores raw y LUKS nuevos por defecto son de 4000 MiB. DynFileFS creado por initramfs toma por defecto la capacidad disponible redondeada a 1000 MiB; el Gestor de sesiones de MiniOS lo fija por defecto en 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Cada arranque | Margen de asignación y umbral de advertencia de poco espacio en MiB. Se resta al dimensionar contenedores nuevos o en crecimiento, pero no es una cuota en tiempo de ejecución y no impide que escrituras posteriores llenen el dispositivo. Por defecto: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Cada arranque | Modo de almacenamiento de persistencia.<br>`native` (por defecto): un directorio en un sistema de archivos POSIX escribible.<br>`dynfilefs`: un contenedor expandible, incluso en FAT32, NTFS o exFAT.<br>`raw`: una imagen ext4 de tamaño fijo.<br>`luks`: un contenedor ext4 cifrado con LUKS2; la creación y el desbloqueo requieren soporte de crypt en el initramfs y se solicitan por consola.<br>`squashfs`: una instantánea comprimida existente desempaquetada para la sesión. El Gestor de sesiones de MiniOS puede crear y guardar instantáneas SquashFS del sistema en ejecución; el initramfs puede reanudar pero no crearlas. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Cada arranque | Activa la ruta de reanudación de persistencia heredada. A diferencia de `perchdir=resume`, no crea automáticamente un reemplazo compatible cuando no existe una sesión por defecto utilizable. | `perch` |
| `toram` | Cada arranque | `toram` solo es `full`. Con persistencia, la copia de nivel superior `*` de full omite archivos ocultos; sin persistencia omite `changes` pero copia otras entradas de nivel superior, incluyendo ocultos. Trim copia el `config.conf` requerido, `authorized_keys` de archivo regular, módulos seleccionados de nivel superior y recursivos, y todo el árbol `changes/` cuando se solicita persistencia; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, otros datos no módulo y el nivel separado de módulos de persistencia. Ningún modo verifica primero la capacidad de RAM. Un almacén de persistencia copiado a RAM no es duradero y los cambios no se copian de vuelta. Retira el medio solo después de confirmar que la fuente, los bucles y los mapeos se han desmontado correctamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Cada arranque | Inicia en modo consola de texto. | `text` |
| `automount` | Cada arranque | Activa el montaje automático de dispositivos de almacenamiento. | `automount` |
| `debug` | Cada arranque | Activa diagnósticos adicionales en el arranque. | `debug` |
| `nozram` | Cada arranque | Desactiva el swap zram. | `nozram` |
| `zramsize` | Cada arranque | Establece el tamaño del swap zram en MiB. Si se omite, MiniOS lo calcula a partir de la RAM total. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Cada arranque | Selecciona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`; la disponibilidad depende del kernel en ejecución. Si se omite, se mantiene el valor por defecto del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Cada arranque | Establece el target por defecto de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Cada arranque | Activa servicios systemd especificados al arrancar. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Cada arranque | Desactiva servicios systemd especificados al arrancar. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Cada arranque | Desactiva los cambios automáticos de resolución de pantalla en máquinas virtuales. El valor por defecto de XFCE es 1280x800. | `novirtres` |
| `virtres` | Cada arranque | Establece la resolución de pantalla XFCE en máquinas virtuales. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Cada arranque | Ejecuta solo los componentes de live-config listados, en orden de componente. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Cada arranque | Ejecuta todos los componentes de live-config excepto los listados. | `nocomponents=anacron,apport` |
| `hostname` | Cada arranque | Establece el nombre de host del sistema. | `hostname=minios` |
| `username` | Configuración inicial | Establece el nombre de usuario creado para inicio de sesión automático. | `username=live` |
| `user-default-groups` | Configuración inicial | Establece los grupos por defecto del usuario creado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuración inicial | Establece el nombre completo del usuario creado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuración inicial | Establece la contraseña de root en texto plano. | `root-password=toor` |
| `root-password-crypted` | Configuración inicial | Establece la contraseña de root como hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuración inicial | Establece la contraseña del usuario en texto plano. | `user-password=live` |
| `user-password-crypted` | Configuración inicial | Establece la contraseña del usuario como hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Cada arranque | Establece uno o más locales del sistema. | `locales=en_US.UTF-8` |
| `timezone` | Cada arranque | Establece la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Cada arranque | Establece el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | Cada arranque | Establece los diseños de teclado separados por comas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Cada arranque | Establece las variantes de teclado separadas por comas correspondientes a los diseños. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Cada arranque | Establece las opciones de teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuración inicial | Evita que live-config otorgue privilegios de sudo y policykit. | `noroot` |
| `noautologin` | Cada arranque | Evita que live-config configure el inicio de sesión automático en consola y entorno gráfico; la configuración persistente existente no se elimina. | `noautologin` |
| `nottyautologin` | Cada arranque | Evita solo la configuración de inicio de sesión automático en consola; la configuración persistente existente no se elimina. | `nottyautologin` |
| `nox11autologin` | Cada arranque | Evita solo la configuración de inicio de sesión automático en entorno gráfico; la configuración persistente existente no se elimina. | `nox11autologin` |
| `xorg-driver` | Cada arranque | Selecciona un driver Xorg en lugar de la autodetección. | `xorg-driver=nouveau` |
| `xorg-resolution` | Cada arranque | Establece la resolución Xorg en lugar de la autodetección. | `xorg-resolution=1920x1080` |
| `module-mode` | Cada arranque | Con `merged`, integra los cambios de configuración en el sistema live en ejecución. | `module-mode=merged` |
| `hooks` | Cada arranque | Descarga y ejecuta hooks desde el sistema de archivos, el medio live o URLs soportadas por wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Consideraciones de seguridad

La línea de comandos del kernel es texto plano y normalmente es visible en la configuración del gestor de arranque, `/proc/cmdline` y diagnósticos. No pongas secretos reutilizables en `root-password=` ni en `user-password=`. Prefiere los parámetros correspondientes de `*-crypted`, aunque los hashes de contraseña expuestos siguen siendo sensibles.

Los hooks se ejecutan como código privilegiado de arranque. Un hook `http://` no tiene cifrado de transporte ni autenticación de servidor, por lo que cualquiera que pueda modificar la ruta de red puede reemplazarlo. Utiliza solo mecanismos de entrega y contenido en los que confíes; no uses un hook HTTP sin autenticar para un arranque sensible a la seguridad.

Separa los comandos con espacios. Consulta las páginas de referencia de `man bootparam` para parámetros adicionales del kernel comunes a todas las distribuciones Linux.

Para información detallada sobre los parámetros de live-config, consulta [live-config](/reference/configuration/live-config).

Para cargar MiniOS por red (PXE y HTTP ISO), consulta [Arranque por red](/reference/boot-process/Network-Boot).
