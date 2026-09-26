---
updated: 2026-09-26
---

# config.conf

`config.conf` es el archivo principal de preconfiguración de MiniOS. En un medio MiniOS normal se almacena como `minios/config.conf`. Durante el arranque, el initramfs lo sincroniza con `/etc/live/config.conf` en el sistema ensamblado.

Utilice este archivo para preparar cómo se inicia MiniOS y cómo se inicializa una nueva sesión persistente. Es principalmente un mecanismo de preconfiguración orientado a administradores, no un reemplazo para las herramientas de configuración habituales del escritorio en ejecución.

## Reconfiguración

La columna **Reconfigurable** a continuación utiliza estos significados:

- **Sí** — el ajuste puede modificarse y aplicarse nuevamente en un arranque posterior.
- **Solo en el primer arranque** — el ajuste se utiliza cuando se crea por primera vez el estado persistente correspondiente y normalmente no se vuelve a aplicar en arranques posteriores.

Esta distinción forma parte del comportamiento que los usuarios deben conocer. Los archivos de estado internos de `live-config` son detalles de implementación y no lo reemplazan.

## Configuración generada

Una imagen actual de MiniOS genera una `config.conf` con esta estructura general:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
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
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
Los valores exactos dependen de la imagen y la configuración de compilación.

::: warning `LIVE_CONFIG_CMDLINE` no es la línea de comandos de initramfs
`LIVE_CONFIG_CMDLINE` proporciona opciones después de que la raíz MiniOS ha sido ensamblada. Parámetros como `from=`, `load=`, `toram`, y `perchdir=` deben ser parámetros reales de arranque del kernel; colocarlos solo en `LIVE_CONFIG_CMDLINE` es demasiado tarde para afectar el initramfs. Las opciones de storage-policy `log-storage=`, `apt-cache=`, y `browser-cache=` son una excepción específica: `minios-boot` los lee desde `LIVE_CONFIG_CMDLINE` antes de que se inicien los servicios normales.
:::

## Parámetros estándar

| Parámetro | Reconfigurable | Significado |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sí | Opciones adicionales de live-config. La línea de comandos real del kernel se añade después y tiene prioridad en caso de opciones repetidas. |
| `LIVE_HOSTNAME` | Sí | Nombre de host del sistema. |
| `LIVE_USERNAME` | Solo en el primer inicio | Nombre del usuario live creado durante la configuración inicial. |
| `LIVE_USER_FULLNAME` | Solo en el primer inicio | Nombre completo del usuario live. |
| `LIVE_USER_DEFAULT_GROUPS` | Solo en el primer inicio | Grupos adicionales asignados al crear el usuario live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Solo en el primer inicio | Hash cifrado para la contraseña del usuario live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Solo en el primer inicio | Hash cifrado para la contraseña de root. |
| `LIVE_CONFIG_NOROOT` | Solo en el primer inicio | Si está habilitado, omite la configuración de privilegios de MiniOS, sudo y PolicyKit. |
| `LIVE_LOCALES` | Sí | Uno o más locales del sistema. |
| `LIVE_TIMEZONE` | Sí | Zona horaria del sistema, por ejemplo `Europe/Berlin` o `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sí | Modelo de teclado XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sí | Distribuciones de teclado separadas por comas. |
| `LIVE_KEYBOARD_OPTIONS` | Sí | Opciones de teclado XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sí | Variantes separadas por comas que corresponden a las distribuciones configuradas. |
| `LIVE_CONFIG_DEBUG` | Sí | Activa la salida de depuración de live-config cuando se establece en `true`. |
| `LIVE_LINK_USER_DIRS` | Sí | Vincula los directorios de usuario gestionados a la ubicación configurada en el medio MiniOS con permisos de escritura. No disponible con el modo bind, cualquier modo `toram` o una sesión de persistencia activa cifrada con LUKS. |
| `LIVE_BIND_USER_DIRS` | Sí | Realiza bind-mount de los directorios de usuario gestionados desde la ubicación configurada en medios MiniOS con permisos de escritura. No disponible con modo enlace, cualquier `toram` modo, o con una sesión de persistencia activa cifrada con LUKS. |
| `LIVE_USER_DIRS_PATH` | Sí | Ubicación utilizada por el modo de usuario enlace/bind. |
| `LIVE_MODULE_MODE` | Sí | Selecciona `simple` o `merged` integración con el módulo live-config. |
| `LIVE_LOG_STORAGE` | Sí | `persistent` (predeterminado) o `volatile` para los registros del sistema estándar. Los diagnósticos de arranque permanecen persistentes; consulte [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Sí | `persistent` (predeterminado) o `volatile` para los archivos descargados de APT; el estado de los paquetes y las listas de repositorios permanecen persistentes. |
| `LIVE_BROWSER_CACHE` | Sí | `persistent` (predeterminado) o `volatile` para las rutas estándar de caché del navegador nativo. Los perfiles del navegador permanecen persistentes. |
| `DEFAULT_TARGET` | Sí | Destino de arranque: `graphical.target`, `multi-user.target`, o `rescue.target`. |
| `ENABLE_SERVICES` | Sí | Servicios separados por comas habilitados al inicio mediante `minios-svc`. |
| `DISABLE_SERVICES` | Sí | Servicios separados por comas deshabilitados al inicio mediante `minios-svc`. |
| `EXPORT_LOGS` | Sí | Cuando `true`, exporta MiniOS y los registros de inicio de live-config a medios MiniOS con permisos de escritura. |

El archivo generado no es una lista exhaustiva de todo lo que admite `minios-live-config`. Se pueden añadir manualmente variables adicionales para la preconfiguración de red cableada, postura de seguridad, hooks, presembrado, Xorg y otros componentes. Consulte [live-config](/reference/configuration/live-config) para la referencia completa.

El componente `user-media` rechaza tanto la activación como la copia de vuelta mientras la sesión de persistencia activa está cifrada con LUKS. Utiliza el estado real de cifrado en tiempo de ejecución: el parámetro `perchencrypt=luks` del kernel solo solicita cifrado al crear una nueva sesión y no describe una sesión existente.

## Preconfiguración de red cableada

MiniOS puede preconfigurar una política **IPv4 cableada** mediante el componente `network` de live-config. Esto está pensado para la preconfiguración administrativa de un sistema antes de que se inicie en el hardware de destino.
Por ejemplo:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Estos ajustes son **Solo en el primer arranque** para la política de red persistente. Tras aplicarse correctamente, el componente registra `/var/lib/live/config/network`.
Cambiar los valores no sobrescribe una sesión persistente ya configurada a menos que ese estado se restablezca deliberadamente.

`LIVE_NETWORK_METHOD=static` escribe una política estática. `off` desactiva IPv4 automática para la interfaz seleccionada. Un valor sin definir o `dhcp` deja sin cambios la configuración de red existente de la imagen. `LIVE_NETWORK_BACKEND=auto` prefiere NetworkManager y recurre a ifupdown si es necesario.

Esta función no configura Wi-Fi. Tras el arranque, la gestión normal de redes cableadas e inalámbricas la realiza NetworkManager. Consulte [Redes](/using-minios/Networking) para el uso de red en tiempo de ejecución y [live-config](/reference/configuration/live-config) para todas las variables de red.

## MiniOS configuraciones de early-userspace

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, y las tres `LIVE_*` políticas de almacenamiento anteriores son configuraciones de arranque MiniOS en lugar de variables del componente late live-config. MiniOS las aplica antes de que el sistema init normal tome el control; `minios-boot` es responsable de las tres políticas de almacenamiento. Todas son **Reconfigurable: Sí**.

Los parámetros de arranque correspondientes `default-target=`, `enable-services=`, y `disable-services=` tienen prioridad para el arranque actual. El parámetro `text` fuerza `multi-user.target`.

Las versiones actuales de Toolbox y Ultra agregan `ssh` a `ENABLE_SERVICES`. Para desactivar explícitamente SSH, inclúyelo en `DISABLE_SERVICES`; simplemente eliminarlo de `ENABLE_SERVICES` no solicita una operación de desactivación.

Con `EXPORT_LOGS="true"`, los medios MiniOS regrabables reciben los registros de inicio a continuación:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Los registros correspondientes en tiempo de ejecución son `/var/log/minios/minios-boot.log` y `/var/log/live/config.log`.

## Política de caché y registro para una sesión persistente

Para reducir las escrituras durante una `perch` sesión, añade la configuración de forma independiente:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

También aceptan `persistent`, que es el valor predeterminado. `minios-boot` acepta la misma configuración desde `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), o parámetros del kernel. Los fragmentos posteriores reemplazan a los anteriores, el blob de parámetros tiene prioridad sobre las claves de archivo y los parámetros reales del kernel prevalecen al final. Las tres opciones son independientes y no solicitan persistencia por sí mismas. Un initrd compatible anuncia `perch-storage-v1` en `/run/initramfs/etc/minios-initramfs-storage`; el Configurador de MiniOS advierte cuando el initrd actual no lo anuncia.

Las políticas se aplican en un arranque posterior solo si la persistencia se activa realmente en un almacenamiento duradero y escribible. Con `toram`, persistencia fallida, o **Iniciar sin guardar**, la política volátil solicitada no se considera evidencia de que algo se guardará. El componente de caché del navegador se ejecuta después que `minios-boot`, una vez creado el usuario en vivo. Consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para conocer los límites exactos de RAM, rutas de navegador compatibles, condiciones de respaldo y registros que permanecen en el medio.

## Origen, copia en tiempo de ejecución y precedencia

El directorio de datos MiniOS seleccionado normalmente contiene estos archivos fuente:

| Directorio de datos seleccionado | Sistema en ejecución |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

En medios montados normalmente, son visibles como `minios/config.conf` y `minios/config.conf.d/*.conf`, a menudo bajo `/run/initramfs/memory/data/` mientras el sistema está en funcionamiento.

La sincronización ocurre al iniciar; no es un monitor de archivos:

- La copia más reciente de `config.conf` prevalece según la fecha de modificación. Una copia más nueva en el medio se copia en el root activo. Una copia más reciente en tiempo de ejecución solo se copia de regreso cuando el directorio de datos MiniOS seleccionado es editable.
- Cada archivo `config.conf.d/*.conf` se sincroniza de forma independiente por nombre base, usando las mismas reglas de marca de tiempo y permisos de escritura. Los archivos no se eliminan en ninguno de los lados.
- Si el reloj está antes de la última hora de sincronización registrada, se omite la comparación de marcas de tiempo y solo se rellenan los archivos de destino que faltan.
- `toram=trim` copia `config.conf` pero omite `config.conf.d/`. Una copia completa de `toram` copia el árbol de datos, pero luego la sincronización apunta a la copia RAM en lugar del medio fuente desmontado.
Después de la sincronización, `live-config` lee `/etc/live/config.conf` primero y luego `/etc/live/config.conf.d/*.conf` en el orden del glob de shell. Por lo tanto, un fragmento posterior puede reemplazar un valor del archivo principal o de un fragmento anterior.

La línea de comandos real del kernel se agrega a `LIVE_CONFIG_CMDLINE`. Si una opción aparece más de una vez, prevalece la última aparición en la línea de comandos del kernel. Para las tres políticas de almacenamiento, `minios-boot` lee el archivo principal sincronizado, luego sus fragmentos, después el blob de opciones y finalmente la línea de comandos real del kernel; la última configuración es la que prevalece.

Puedes agregar variables de shell específicas del proyecto a `config.conf` o a sus fragmentos y leerlas desde las copias en tiempo de ejecución. Entrecomilla los valores como cadenas de shell y no pongas espacios alrededor de `=`.
