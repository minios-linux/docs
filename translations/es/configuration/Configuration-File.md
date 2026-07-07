# Archivo de configuración

MiniOS se diferencia de la mayoría de las distribuciones flash clásicas en que algunos parámetros pueden configurarse antes del arranque mediante un archivo de configuración bastante sencillo `config/config.conf`, lo que minimiza el trabajo necesario al crear tus propios módulos para sistemas embebidos. Opcionalmente, algunos de los parámetros pueden establecerse en los parámetros de arranque. Las opciones de arranque tienen prioridad sobre el archivo de configuración. Algunos parámetros de este archivo son de servicio y es mejor no modificarlos. A continuación se muestra un ejemplo de un archivo de configuración estándar:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
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
- 🔒 **Solo una vez** - Se aplica únicamente en el primer arranque, no puede cambiarse en arranques posteriores  
- 🔄 **Reconfigurable** - Puede cambiarse en cada arranque y volver a aplicarse

| Parámetro | Reconfigurable | Significado | Ejemplo |
| --------- | -------------- | ------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Parámetros adicionales de arranque para live-config. Consulta `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Nombre del nodo asociado al sistema. Consulta `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nombre del usuario cuyo perfil se creará en el primer arranque. Si especificas el nombre de usuario <strong>root</strong>, no se creará ningún perfil de usuario y el inicio de sesión se realizará con el perfil <strong>root</strong>. Consulta `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nombre completo para el usuario principal. Consulta `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Lista de grupos para el usuario principal, separada por comas. Consulta `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Contraseña del usuario principal en forma cifrada (hash). Usa `mkpasswd -m yescrypt` para generar. Consulta `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Contraseña del usuario privilegiado **root** en forma cifrada (hash). Usa `mkpasswd -m yescrypt` para generar. Consulta `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Si se establece, desactiva el inicio de sesión de la cuenta root y deshabilita sudo/policykit para el usuario. Consulta `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Establece la configuración regional. Se pueden indicar varios valores separados por comas. Consulta `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Establece la zona horaria (por ejemplo, "Europe/Berlin", "Etc/UTC"). Consulta `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Establece el modelo de teclado (por ejemplo, "pc105"). Consulta `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Establece las distribuciones de teclado (separadas por comas, por ejemplo, "us,de"). Consulta `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Establece opciones de teclado (por ejemplo, "grp:alt_shift_toggle,grp_led:scroll"). Consulta `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Establece las variantes de teclado (separadas por comas, pueden estar vacías o coincidir con las distribuciones). Consulta `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Activa la salida de depuración para live-config. Consulta `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Si es true, los directorios de usuario se enlazarán desde la ruta especificada. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Si es true, los directorios de usuario se montarán mediante bind desde la ruta especificada. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Ruta a los directorios de datos de usuario en la unidad flash. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Selecciona el modo de operación del sistema. Si planeas instalar software exclusivamente por módulos, usa "merged". Si deseas instalar software usando apt, usa "simple". El valor por defecto es "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Objetivo de systemd para arrancar. Consulta `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Habilita servicios al arrancar (separados por comas). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Desactiva servicios al arrancar (separados por comas). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Si es true, al arrancar desde un medio escribible, los registros de MiniOS se copian a la carpeta minios/logs durante el arranque. | EXPORT_LOGS="false" |


**Para más detalles sobre la mayoría de los parámetros, consulta:**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Para objetivos de systemd: `man systemd.special`

## ¡Importante!

* El servidor SSH está habilitado por defecto para compatibilidad con initrds de terceros; para deshabilitarlo, no basta con eliminarlo de `ENABLE_SERVICES`.

¿Para qué más puede ser útil el archivo `config.conf`? Puedes usarlo para definir tus propios parámetros en tus scripts al crear módulos. En el primer arranque, se copia a la carpeta /etc/minios, luego el archivo `/etc/live/config.conf` se monitoriza automáticamente y, cuando se realizan cambios, sobrescribe el archivo de configuración en la unidad flash, si es escribible. Así, puedes colocar tus variables en config.conf y obtenerlas desde `/etc/live/config.conf` en tus scripts, independientemente del tipo de initrd utilizado.
