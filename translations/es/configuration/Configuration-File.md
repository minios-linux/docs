# Archivo de configuración

Los medios de arranque de MiniOS almacenan la configuración principal en `minios/config.conf`. Durante el arranque, el initramfs la sincroniza a `/etc/live/config.conf` en la raíz viva ensamblada. Por lo tanto, los scripts en el sistema en ejecución deben leer `/etc/live/config.conf`; `/etc/minios/config.conf` y `config/config.conf` no son rutas de configuración utilizadas por el código de arranque actual.

Los parámetros de arranque pueden sobrescribir los ajustes correspondientes del archivo. El siguiente es un ejemplo de un `config.conf` estándar:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Descripción de los parámetros

**Leyenda:**
- 🔒 **Solo una vez** - Se aplica únicamente en el primer arranque, no se puede modificar en arranques posteriores
- 🔄 **Reconfigurable** - Se puede cambiar en cada arranque y volver a aplicar

| Parámetro | Reconfigurable | Significado | Ejemplo |
| --------- | -------------- | ---------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Opciones adicionales para live-config. `nottyautologin` se almacena aquí en lugar de estar codificado en cada entrada de arranque. Consulta `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | 🔄 | Nombre del nodo asociado al sistema. Consulta `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nombre del usuario cuyo perfil se creará en el primer arranque. Si especificas el nombre de usuario <strong>root</strong>, no se creará ningún perfil de usuario y el inicio de sesión se realizará usando el perfil <strong>root</strong>. Consulta `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nombre completo para el usuario principal. Consulta `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Lista separada por comas de los grupos del usuario principal. Consulta `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Contraseña del usuario principal en forma cifrada (hash). Usa `mkpasswd -m yescrypt` para generarla. Consulta `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Contraseña del usuario privilegiado **root** en forma cifrada (hash). Usa `mkpasswd -m yescrypt` para generarla. Consulta `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Si se establece, desactiva el inicio de sesión de la cuenta root y deshabilita sudo/policykit para el usuario. Consulta `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Establece la configuración regional. Se pueden separar varios valores por comas. Consulta `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Establece la zona horaria (por ejemplo, "Europe/Berlin", "Etc/UTC"). Consulta `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Establece el modelo de teclado (por ejemplo, "pc105"). Consulta `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Establece las distribuciones de teclado (separadas por comas, por ejemplo, "us,de"). Consulta `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Establece opciones de teclado (por ejemplo, "grp:alt_shift_toggle,grp_led:scroll"). Consulta `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Establece las variantes de teclado (separadas por comas, pueden estar vacías o coincidir con las distribuciones). Consulta `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Activa la salida de depuración para live-config. Consulta `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Si es verdadero, los directorios de usuario se enlazarán desde la ruta especificada. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Si es verdadero, los directorios de usuario se montarán mediante bind desde la ruta especificada. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Ruta a los directorios de datos de usuario en la unidad flash. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Selecciona el modo de funcionamiento del sistema. Si planeas instalar software exclusivamente mediante módulos, usa "merged". Si deseas instalar software usando apt, usa "simple". El valor predeterminado es "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Objetivo de systemd para arrancar. Consulta `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Habilita servicios al arrancar (separados por comas). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Desactiva servicios al arrancar (separados por comas). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Si es verdadero y el directorio de datos seleccionado de MiniOS es escribible, los registros de arranque se copian a `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**Para más detalles sobre la mayoría de los parámetros, consulta:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Para objetivos systemd: `man systemd.special`

## ¡Importante!

* El servidor SSH está habilitado por defecto para compatibilidad con initrds de terceros; para deshabilitarlo, no basta con eliminarlo de `ENABLE_SERVICES`.

## Origen, copia en tiempo de ejecución y precedencia

El directorio de datos seleccionado de MiniOS normalmente es el directorio `minios/` en el medio de arranque. Sus rutas de configuración y sus copias en tiempo de ejecución son:

| Directorio de datos seleccionado | Sistema en ejecución |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Para un medio montado normalmente, estos archivos fuente son visibles como `minios/config.conf` y `minios/config.conf.d/*.conf`, a menudo bajo `/run/initramfs/memory/data/`. No son cargados directamente por `live-config`. El initramfs los sincroniza con las rutas de tiempo de ejecución antes de ejecutar `minios-boot`; consulta [Modos de arranque](/configuration/Boot-Modes.md) para saber dónde ocurre esto en la secuencia de arranque.

La sincronización se realiza al arrancar, no mediante un monitor de archivos:

- La copia más reciente de `config.conf` prevalece según la hora de modificación. Una copia fuente más reciente se copia en la raíz en vivo. Una copia de tiempo de ejecución más reciente se copia de vuelta solo cuando el directorio de datos seleccionado es escribible.
- Cada archivo `config.conf.d/*.conf` se sincroniza de forma independiente por nombre base usando las mismas reglas de hora de modificación y posibilidad de escritura. Los archivos no se eliminan de ninguno de los lados.
- Si el reloj está antes de la última hora de sincronización registrada, se omite la comparación de marcas de tiempo y solo se rellenan los archivos de destino que faltan.
- `toram=trim` copia `config.conf` pero omite `config.conf.d/`; consulta [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md). El `toram` completo copia el árbol de datos, pero la sincronización entonces apunta a la copia en RAM en lugar del medio desmontado.

Después de la sincronización, `live-config` lee primero `/etc/live/config.conf` y luego `/etc/live/config.conf.d/*.conf` en orden de glob de shell, por lo que un fragmento posterior puede reemplazar un valor anterior. Añade la línea de comandos real del kernel a `LIVE_CONFIG_CMDLINE`; para las opciones repetidas allí, la última aparición en la línea de comandos del kernel prevalece. `minios-boot` también lee `/etc/live/config.conf` para sus configuraciones tempranas soportadas y da prioridad a los parámetros del kernel que reconoce.

Puedes añadir variables de shell específicas del proyecto a estos archivos y leerlas desde `/etc/live/config.conf` o los fragmentos en tiempo de ejecución. Entrecomilla los valores como cadenas de shell y no pongas espacios alrededor de `=`.

El registro temprano de MiniOS es `/var/log/minios/minios-boot.log`, mientras que la salida tardía de `live-config` es `/var/log/live/config.log`. Con `EXPORT_LOGS="true"`, ambos árboles se copian a `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` cuando el directorio de datos seleccionado es escribible.
