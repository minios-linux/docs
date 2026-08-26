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
- Pulsa <kbd>F10</kbd> para iniciar con la nueva configuración.

## Parámetros de arranque

La columna de aplicación distingue los parámetros normalmente aceptados en cada arranque de las configuraciones de cuenta destinadas a la configuración inicial. Con persistencia, los componentes de live-config normalmente se ejecutan solo una vez; consulta [live-config](/configuration/live-config.md).

Esta tabla es una referencia rápida. La precedencia de las fuentes y las formas aceptadas de `from=`
están definidas en [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md),
el filtrado de módulos en [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md),
la selección de persistencia en [Persistencia Initrd](/configuration/Initrd-Persistence.md),
y las combinaciones soportadas en [Modos de arranque](/configuration/Boot-Modes.md).

| Parámetro | Aplicación | Descripción | Ejemplo |
|---|---|---|---|
| `from` | Cada arranque | Carga los datos de MiniOS desde un directorio, una ruta de dispositivo soportada o una ISO. No se procesan las formas UUID, PARTUUID ni by-id de dispositivos. Una URL literal **solo `http://`** tiene prioridad sobre `ip=` e inicia el [arranque por red](/installation/Network-Boot.md) mediante httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Cada arranque | Conserva los candidatos de `.sb` cuyo camino coincida con una expresión regular extendida no anclada; las comas se convierten en alternativas y un rango numérico ascendente completo tiene una expansión especial. También filtra `toram=trim`. Puede excluir módulos principales o del kernel y hacer que el sistema no arranque. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Cada arranque | Excluye candidatos cuyo camino coincida con una expresión regular extendida no anclada, incluyendo desde `toram=trim`; se aplica después de `load` y puede excluir módulos principales o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Cada arranque | Establece la extensión del bundle. Predeterminado: `sb`. La coordinación del kernel sigue usando nombres literales `.sb`, por lo que una extensión personalizada no puede coordinar el módulo `01-kernel`. | `bext=mymod` |
| `timing` | Cada arranque | Habilita la salida de tiempos de inicio. | `timing` |
| `union` | Cada arranque | Selecciona el sistema de archivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Cada arranque | Dirección estática para la obtención temprana de red. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (puerto HTTP PXE predeterminado **7529**). Una `from=http://...` literal tiene prioridad sobre `ip=` y utiliza sus campos de direccionamiento; de lo contrario, cualquier `ip=` no vacío fuerza la descarga de datos PXE y omite medios locales. Esto no es una configuración de NetworkManager de sesión. Consulta [Arranque por red](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Cada arranque | Tamaño de caché httpfs en MiB para arranque de red por ISO HTTP (`from=http://…`). Consulta [Arranque por red](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Cada arranque | Abre una shell de depuración al final de la etapa initramfs. | `rd.break` |
| `perchdir` | Cada arranque | Selecciona una sesión de persistencia numerada o una acción: `resume`, `new` o `ask`. Un selector numérico inexistente puede recurrir al valor predeterminado de los metadatos; no reserva ni crea ese número. Una ruta de dispositivo o forma `askdisk` selecciona otra ubicación de persistencia. Usa un sufijo delimitado por dos puntos para una ruta personalizada. Sin un parámetro de persistencia, MiniOS inicia limpio. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Cada arranque | Tamaño del contenedor para `dynfilefs`, `raw` y `luks`; no aplica a `native` ni `squashfs`. Un número simple o valor `M`/`MB` se asigna en MiB; `G`/`GB` y `T`/`TB` se convierten en 1000 y 1.000.000 MiB. El límite es 1.000.000 MiB, además limitado por el espacio disponible tras `perchreserve`. Session Manager limita archivos raw y LUKS a 4000 MiB en FAT32; initrd LUKS aplica ese límite, pero una solicitud raw de initrd sobredimensionada puede fallar en vez de reducirse. Los nuevos contenedores raw y LUKS tienen como valor predeterminado 4000 MiB. Los DynFileFS creados por initramfs toman como valor predeterminado la capacidad disponible redondeada hacia abajo a 1000 MiB; Session Manager lo predetermina a 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Cada arranque | Espacio libre, en MiB, reservado en el dispositivo de persistencia. Los contenedores nuevos o en crecimiento no lo consumen, y MiniOS avisa cuando el espacio libre alcanza ese valor. Predeterminado: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Cada arranque | Modo de almacenamiento de persistencia.<br>`native` (predeterminado): un directorio en un sistema de archivos POSIX escribible.<br>`dynfilefs`: un contenedor expandible, incluso en FAT32, NTFS o exFAT.<br>`raw`: una imagen ext4 de tamaño fijo.<br>`luks`: un contenedor ext4 cifrado con LUKS2; la creación y el desbloqueo requieren interacción en la consola y soporte de crypt en el initramfs.<br>`squashfs`: una instantánea comprimida existente descomprimida para la sesión. Session Manager puede crear y guardar instantáneas SquashFS del sistema en ejecución; el initramfs puede reanudar pero no crearlas. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Cada arranque | Habilita la ruta de reanudación de persistencia heredada. A diferencia de `perchdir=resume`, no crea automáticamente un reemplazo compatible cuando no existe una sesión predeterminada utilizable. | `perch` |
| `toram` | Cada arranque | `toram` solo es `full`. Con persistencia, la copia de nivel superior `*` de full omite archivos ocultos; sin persistencia omite `changes` pero copia otras entradas de nivel superior, incluidos archivos ocultos. Trim copia los `config.conf` requeridos, `authorized_keys` de archivo regular, módulos seleccionados de nivel superior y recursivos, y el árbol completo `changes/` cuando se solicita persistencia; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, otros datos que no sean módulos y el nivel separado de módulos de persistencia. Ningún modo verifica primero la capacidad de RAM. Un almacén de persistencia copiado a RAM no es duradero y los cambios no se guardan. Retira el medio solo después de confirmar que la fuente, los loops y los mapeos se han desmontado correctamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Cada arranque | Inicia en modo consola de texto. | `text` |
| `automount` | Cada arranque | Habilita el montaje automático de dispositivos de almacenamiento. | `automount` |
| `debug` | Cada arranque | Habilita diagnósticos adicionales al inicio. | `debug` |
| `nozram` | Cada arranque | Deshabilita el swap zram. | `nozram` |
| `zramsize` | Cada arranque | Establece el tamaño del swap zram en MiB. Si se omite, MiniOS lo calcula según la RAM total. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Cada arranque | Selecciona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`; la disponibilidad depende del kernel en ejecución. Si se omite, se mantiene el valor predeterminado del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Cada arranque | Establece el target predeterminado de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Cada arranque | Habilita los servicios systemd especificados al arrancar. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Cada arranque | Deshabilita los servicios systemd especificados al arrancar. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Cada arranque | Deshabilita los cambios automáticos de resolución de pantalla en máquinas virtuales. El valor predeterminado de XFCE es 1280x800. | `novirtres` |
| `virtres` | Cada arranque | Establece la resolución de pantalla XFCE en máquinas virtuales. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Cada arranque | Ejecuta solo los componentes de live-config listados, en orden de componente. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Cada arranque | Ejecuta todos los componentes de live-config excepto los listados. | `nocomponents=anacron,apport` |
| `hostname` | Cada arranque | Establece el hostname del sistema. | `hostname=minios` |
| `username` | Configuración inicial | Establece el nombre de usuario creado para el inicio de sesión automático. | `username=live` |
| `user-default-groups` | Configuración inicial | Establece los grupos predeterminados del usuario creado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuración inicial | Establece el nombre completo del usuario creado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuración inicial | Establece la contraseña de root en texto plano. | `root-password=toor` |
| `root-password-crypted` | Configuración inicial | Establece la contraseña de root como hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuración inicial | Establece la contraseña de usuario en texto plano. | `user-password=live` |
| `user-password-crypted` | Configuración inicial | Establece la contraseña de usuario como hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Cada arranque | Establece uno o más locales del sistema. | `locales=en_US.UTF-8` |
| `timezone` | Cada arranque | Establece la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Cada arranque | Establece el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | Cada arranque | Establece los layouts de teclado separados por comas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Cada arranque | Establece las variantes de teclado separadas por comas correspondientes a los layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Cada arranque | Establece las opciones de teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuración inicial | Impide que live-config otorgue privilegios de sudo y policykit. | `noroot` |
| `noautologin` | Cada arranque | Impide que live-config configure el inicio de sesión automático en consola y entorno gráfico; la configuración persistente existente no se elimina. | `noautologin` |
| `nottyautologin` | Cada arranque | Impide solo la configuración del inicio de sesión automático en consola; la configuración persistente existente no se elimina. | `nottyautologin` |
| `nox11autologin` | Cada arranque | Impide solo la configuración del inicio de sesión automático en entorno gráfico; la configuración persistente existente no se elimina. | `nox11autologin` |
| `xorg-driver` | Cada arranque | Selecciona un driver Xorg en lugar de la autodetección. | `xorg-driver=nouveau` |
| `xorg-resolution` | Cada arranque | Establece la resolución Xorg en lugar de la autodetección. | `xorg-resolution=1920x1080` |
| `module-mode` | Cada arranque | Con `merged`, integra los cambios de configuración en el sistema live en ejecución. | `module-mode=merged` |
| `hooks` | Cada arranque | Obtiene y ejecuta hooks desde el sistema de archivos, el medio live o URLs soportadas por wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Consideraciones de seguridad

La línea de comandos del kernel es texto plano y normalmente es visible en la configuración del gestor de arranque,
`/proc/cmdline` y diagnósticos. No introduzcas secretos reutilizables en
`root-password=` ni en `user-password=`. Prefiere los parámetros correspondientes de `*-crypted`,
aunque los hashes de contraseñas expuestos deben seguir considerándose sensibles.

Los hooks se ejecutan como código privilegiado de arranque. Un hook `http://` no tiene cifrado de transporte ni autenticación de servidor, por lo que cualquiera que pueda alterar la ruta de red puede reemplazarlo. Utiliza solo mecanismos de entrega y contenido en los que confíes; no uses un hook HTTP no autenticado para un inicio sensible a la seguridad.

Separa los comandos con espacios. Consulta las páginas de referencia de `man bootparam` para parámetros adicionales del kernel comunes a todas las distribuciones Linux.

Para información detallada sobre los parámetros de live-config, consulta [live-config](/configuration/live-config.md).

Para cargar MiniOS por red (PXE e ISO HTTP), consulta [Arranque por red](/installation/Network-Boot.md).
