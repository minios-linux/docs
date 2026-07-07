# Parámetros de arranque

## Cómo usar los parámetros de arranque

Los parámetros de arranque, también conocidos como parámetros del kernel, son comandos que puedes ingresar para personalizar el proceso de inicio de MiniOS. Se pueden utilizar para desactivar la detección de hardware, iniciar MiniOS desde un dispositivo específico y mucho más.

### Para Syslinux:

- Pulsa <kbd>Esc</kbd> durante la secuencia de arranque de MiniOS para acceder al menú de arranque.
- Pulsa <kbd>Tab</kbd> para editar las opciones de arranque.
- Ingresa los parámetros deseados y pulsa Enter para iniciar.

### Para Grub:

- Pulsa <kbd>E</kbd> cuando veas el menú de grub.
- Edita los parámetros de arranque al final de la línea de comandos.
- Pulsa <kbd>F10</kbd> para iniciar con la nueva configuración.

## Tabla de parámetros de arranque

La siguiente tabla muestra los parámetros de arranque disponibles en MiniOS, sus funciones y ejemplos de uso.

**Leyenda:**
- 🔒 **Solo una vez** - Se aplica solo en el primer arranque, no se puede modificar en arranques posteriores
- 🔄 **Reconfigurable** - Se puede cambiar en cada arranque y volver a aplicar


| Parámetro | Reconfigurable | Descripción | Ejemplo de uso |
|---|---|---|---|
| `from` | 🔄 | Carga los datos de MiniOS desde un directorio, dispositivo o archivo ISO especificado. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Permite cargar módulos `.sb` específicos usando una expresión regular. Funciona junto con el comando `toram=trim`, permitiendo que solo los módulos seleccionados se carguen en RAM.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Impide la carga de módulos `.sb` específicos usando una expresión regular. Funciona junto con el comando `toram=trim` permitiendo excluir módulos seleccionados de la carga en RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | 🔄 | Define la extensión de archivo para los bundles (módulos). Por defecto es `sb`. | `bext=mymod` |
| `timing` | 🔄 | Activa la salida de tiempos durante el arranque para depurar el rendimiento. | `timing` |
| `union` | 🔄 | Fuerza el uso de un sistema de archivos union específico. | `union=aufs`<br>`union=overlayfs` |
| `ip` | 🔄 | Establece una dirección IP estática para las interfaces de red, usado para arranque PXE. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>`. | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | 🔄 | Define el tamaño de caché en MB para datos cargados vía HTTP. | `cache=512` |
| `rd.break` | 🔄 | Detiene el proceso de arranque al final de la etapa initramfs y proporciona una shell de depuración. | `rd.break` |
| `perchdir` | 🔄 | Selecciona un perfil o realiza una acción con un perfil. Acepta el número de perfil o las palabras clave `resume` (reanudar la sesión anterior), `new` (iniciar una nueva sesión) o `ask` (seleccionar sesión al inicio). Si se omite, MiniOS inicia en modo "limpio". | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Define el tamaño del sistema de archivos virtual DynFileFS (en MB), usado para almacenar datos en sistemas de archivos no Linux (por ejemplo, FAT32, NTFS). Por defecto es 16GB. Usa esta opción si tu disco de destino es más pequeño. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Modo de guardado para cambios persistentes.<br>`native` (por defecto) - almacena los datos tal cual en sistemas de archivos compatibles con POSIX;<br>`dynfilefs` - almacena los datos en archivos de imagen expandibles dinámicamente;<br>`raw` - almacena los datos en un archivo de imagen de tamaño fijo.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `perch` | 🔄 | Activa la persistencia y reanuda la última sesión utilizada. Equivalente a `perchdir=resume`. | `perch` |
| `toram` | 🔄 | Copia el sistema a la RAM. Puede tomar los valores `trim` y `full`. Si se especifica sin parámetros, el valor por defecto es `full`.<br>`trim` - solo se copia la información necesaria, considerando los filtros `load` y `noload`. Si se especifican parámetros `perch`, también se cargan los cambios.<br>`full` - se carga toda la carpeta minios, excluyendo los cambios a menos que se especifique `perch`. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Desactiva el servidor X y arranca en modo consola de texto. | `text` |
| `automount` | 🔄 | Activa el montaje automático de dispositivos de almacenamiento. | `automount` |
| `debug` | 🔄 | Activa la salida de depuración durante el arranque. | `debug` |
| `nozram` | 🔄 | Desactiva el swap zram. | `nozram` |
| `zramsize` | 🔄 | Define el tamaño del swap zram (en MB). | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Especifica el algoritmo de compresión zram. Opciones disponibles para Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Por defecto es `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Define el target por defecto de systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Activa los servicios systemd especificados al arrancar. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Desactiva los servicios systemd especificados al arrancar. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Desactiva el cambio automático de resolución de pantalla en máquinas virtuales. La resolución por defecto en máquinas virtuales es 1280x800. (Solo aplicable en el entorno XFCE.) | `novirtres` |
| `virtres` | 🔄 | Define la resolución de pantalla en máquinas virtuales (ancho x alto). (Solo aplicable en el entorno XFCE.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Especifica qué componentes de live-config ejecutar. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Especifica qué componentes de live-config NO ejecutar. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Define el nombre de host del sistema. | `hostname=minios` |
| `username` | 🔒 | Define el nombre de usuario para el inicio de sesión automático. | `username=live` |
| `user-default-groups` | 🔒 | Define los grupos predeterminados para el usuario. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Define el nombre completo del usuario. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Define la contraseña de root en texto plano. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Define la contraseña de root en formato cifrado. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Define la contraseña del usuario en texto plano. | `user-password=live` |
| `user-password-crypted` | 🔒 | Define la contraseña del usuario en formato cifrado. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Define la configuración regional del sistema. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Define la zona horaria del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Define el modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Define las distribuciones de teclado (separadas por comas). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Define las variantes de teclado (separadas por comas). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Define opciones de teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Desactiva los privilegios de sudo y policykit. | `noroot` |
| `noautologin` | 🔄 | Desactiva el inicio de sesión automático tanto en consola como en entorno gráfico. | `noautologin` |
| `nottyautologin` | 🔄 | Desactiva solo el inicio de sesión automático en consola. | `nottyautologin` |
| `nox11autologin` | 🔄 | Desactiva solo el inicio de sesión automático en entorno gráfico. | `nox11autologin` |
| `xorg-driver` | 🔄 | Define el driver de xorg en lugar de autodetectar. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Define la resolución de xorg en lugar de autodetectar. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Define el modo de módulo de configuración live. Cuando se establece en "merged", integra dinámicamente los cambios de configuración. | `module-mode=merged` |
| `hooks` | 🔄 | Ejecuta archivos arbitrarios desde el sistema de archivos, medio o URLs. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Separa los comandos con espacios. Consulta las páginas de referencia `man bootparam` para obtener información adicional sobre parámetros del kernel comunes a todas las distribuciones Linux.

Para información detallada sobre los parámetros de live-config, consulta [live-config](/configuration/live-config.md).
