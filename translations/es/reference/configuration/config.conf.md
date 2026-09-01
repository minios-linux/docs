---
updated: 2026-08-31
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

Una imagen actual de MiniOS genera un `config.conf` con esta estructura general:
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

::: warning `LIVE_CONFIG_CMDLINE` no es la línea de comandos del initramfs
`LIVE_CONFIG_CMDLINE` proporciona opciones a **live-config** después de que se haya ensamblado el root de MiniOS. Parámetros como `from=`, `load=`, `toram` y `perchdir=` deben ser parámetros reales de arranque del kernel; ponerlos solo en `LIVE_CONFIG_CMDLINE` es demasiado tarde para afectar al initramfs.
:::

## Parámetros estándar

| Parámetro | Reconfigurable | Significado |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sí | Opciones adicionales de live-config. La línea de comandos real del kernel se añade después y tiene prioridad en caso de opciones repetidas. |
| `LIVE_HOSTNAME` | Sí | Nombre de host del sistema. |
| `LIVE_USERNAME` | Solo en el primer arranque | Nombre del usuario live creado durante la configuración inicial. |
| `LIVE_USER_FULLNAME` | Solo en el primer arranque | Nombre completo del usuario live. |
| `LIVE_USER_DEFAULT_GROUPS` | Solo en el primer arranque | Grupos suplementarios asignados al crear el usuario live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Solo en el primer arranque | Hash criptográfico para la contraseña del usuario live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Solo en el primer arranque | Hash criptográfico para la contraseña de root. |
| `LIVE_CONFIG_NOROOT` | Solo en el primer arranque | Al estar habilitado, omite la configuración de privilegios de root-password, sudo y PolicyKit de MiniOS. |
| `LIVE_LOCALES` | Sí | Uno o más locales del sistema. |
| `LIVE_TIMEZONE` | Sí | Zona horaria del sistema, por ejemplo `Europe/Berlin` o `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sí | Modelo de teclado XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sí | Distribuciones de teclado separadas por comas. |
| `LIVE_KEYBOARD_OPTIONS` | Sí | Opciones de teclado XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sí | Variantes separadas por comas que se corresponden con las distribuciones configuradas. |
| `LIVE_CONFIG_DEBUG` | Sí | Activa la salida de depuración de live-config cuando se establece en `true`. |
| `LIVE_LINK_USER_DIRS` | Sí | Enlaza los directorios de usuario gestionados a la ubicación configurada en medios MiniOS grabables. |
| `LIVE_BIND_USER_DIRS` | Sí | Realiza bind-mount de los directorios de usuario gestionados desde la ubicación configurada en medios MiniOS grabables. |
| `LIVE_USER_DIRS_PATH` | Sí | Ubicación utilizada por el modo de usuario link/bind-directory. |
| `LIVE_MODULE_MODE` | Sí | Selecciona la integración del módulo live-config `simple` o `merged`. |
| `DEFAULT_TARGET` | Sí | Objetivo de arranque: `graphical.target`, `multi-user.target` o `rescue.target`. |
| `ENABLE_SERVICES` | Sí | Servicios separados por comas habilitados al arrancar mediante `minios-svc`. |
| `DISABLE_SERVICES` | Sí | Servicios separados por comas deshabilitados al arrancar mediante `minios-svc`. |
| `EXPORT_LOGS` | Sí | Cuando `true`, exporta los registros de MiniOS y de inicio de live-config a medios MiniOS grabables. |

El archivo generado no es una lista exhaustiva de todo lo que admite `minios-live-config`. Se pueden agregar manualmente variables adicionales para la preconfiguración de red cableada, postura de seguridad, hooks, preseeding, Xorg y otros componentes. Consulte [live-config](/reference/configuration/live-config) para la referencia completa.

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

## Configuración de early-userspace de MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES` y `EXPORT_LOGS` son configuraciones de MiniOS y no variables de live-config. Son leídas por `minios-boot` antes de que el sistema init normal tome el control y todas son **Reconfigurables: Sí**.

Los parámetros de arranque correspondientes `default-target=`, `enable-services=` y `disable-services=` tienen prioridad para el arranque actual. El parámetro `text` fuerza `multi-user.target`.

Las compilaciones actuales de Toolbox y Ultra añaden `ssh` a `ENABLE_SERVICES`. Para desactivar SSH explícitamente, inclúyalo en `DISABLE_SERVICES`; simplemente eliminarlo de `ENABLE_SERVICES` no solicita una operación de desactivación.

Con `EXPORT_LOGS="true"`, los medios MiniOS grabables reciben los registros de inicio a continuación:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Los registros de ejecución correspondientes son `/var/log/minios/minios-boot.log` y `/var/log/live/config.log`.

## Origen, copia en tiempo de ejecución y precedencia

El directorio de datos seleccionado de MiniOS normalmente contiene estos archivos fuente:

| Directorio de datos seleccionado | Sistema en ejecución |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

En medios montados normalmente, son visibles como `minios/config.conf` y `minios/config.conf.d/*.conf`, a menudo bajo `/run/initramfs/memory/data/` mientras el sistema está en ejecución.

La sincronización ocurre al arrancar; no es un monitor de archivos:

- La copia más reciente de `config.conf` prevalece por fecha de modificación. Una copia más nueva en el medio se copia en la raíz live. Una copia de tiempo de ejecución más nueva se copia de vuelta solo cuando el directorio de datos seleccionado de MiniOS es grabable.
- Cada archivo `config.conf.d/*.conf` se sincroniza de forma independiente por nombre base usando las mismas reglas de marca de tiempo y escritura. Los archivos no se eliminan en ninguno de los lados.
- Si el reloj es anterior al último tiempo de sincronización registrado, se omite la comparación de marcas de tiempo y solo se rellenan los archivos de destino que faltan.
- `toram=trim` copia `config.conf` pero omite `config.conf.d/`. El `toram` completo copia el árbol de datos, pero la sincronización entonces apunta a la copia de RAM en vez del medio fuente desconectado.
Tras la sincronización, `live-config` lee primero `/etc/live/config.conf` y luego `/etc/live/config.conf.d/*.conf` en orden de glob de shell. Por lo tanto, un fragmento posterior puede reemplazar un valor del archivo principal o de un fragmento anterior.

La línea de comandos real del kernel se añade a `LIVE_CONFIG_CMDLINE`. Para una opción que aparece más de una vez, la última ocurrencia en la línea de comandos del kernel prevalece. `minios-boot` da de manera similar prioridad a los parámetros del kernel que reconoce sobre los ajustes correspondientes de `/etc/live/config.conf`.

Puede añadir variables de shell específicas del proyecto a `config.conf` o a sus fragmentos y leerlas desde las copias en tiempo de ejecución. Entrecomille los valores como cadenas de shell y no ponga espacios alrededor de `=`.

## Referencia relacionada

- [Parámetros de arranque](/reference/Boot-Parameters) — parámetros que deben colocarse en la línea de comandos real del kernel y las anulaciones de live-config.
- [live-config](/reference/configuration/live-config) — referencia completa de parámetros, variables, componentes y estados de late-userspace.
- [Modos de arranque](/using-minios/Boot-Modes) — cómo la persistencia y `toram` afectan al almacenamiento de la configuración.
