---
updated: 2026-08-31
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Componentes de configuración del sistema

**live-config** contiene los componentes que configuran un sistema live durante el proceso de arranque (espacio de usuario tardío).

El arranque por red en el initramfs (`ip=`, PXE, `from=http://…`) es una capa separada de LiveKit y **no** está gestionada por live-config. Consulta [Arranque por red](/reference/boot-process/Network-Boot).

**live-config** se puede configurar mediante parámetros de arranque o archivos de configuración en tiempo de ejecución preparados por el initramfs. La línea de comandos real del kernel se añade después de los valores proporcionados por el archivo `LIVE_CONFIG_CMDLINE`, por lo que los parámetros de arranque que coincidan más tarde tienen prioridad. Los componentes que registran estado bajo `/var/lib/live/config` normalmente se ejecutan solo una vez; los componentes de sincronización y sin estado pueden ejecutarse en cada invocación.

Si se utiliza *live-build*(7) para construir el sistema live, los parámetros de live-config usados por defecto pueden establecerse mediante la opción `--bootappend-live`, consulta la página del manual de *lb_config*(1).

## Parámetros de arranque (componentes)

**live-config** solo se activa si se utiliza `boot=live` como parámetro de arranque. Por defecto, se ejecutan todos los componentes. El parámetro `live-config.components` puede restringir qué componentes se ejecutan, y `live-config.nocomponents` puede excluir componentes. Si se usan ambos parámetros, o cualquiera de ellos se especifica varias veces, prevalece la última aparición.

- **live-config.components | components**: Se ejecutan todos los componentes. Esto es lo que utilizan las imágenes live por defecto.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Solo se ejecutan los componentes especificados. Los componentes se ejecutan en el orden codificado en sus nombres de archivo bajo `/usr/lib/live/config`, independientemente del orden en esta lista.
- **live-config.nocomponents | nocomponents**: No se ejecuta ningún componente.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Se ejecutan todos los componentes, excepto los especificados.

## Parámetros de arranque (opciones)

Algunos componentes individuales pueden cambiar su comportamiento mediante un parámetro de arranque.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Descarga y aplica uno o más archivos preseed de debconf. Las URLs son gestionadas por `wget` y pueden usar HTTP, FTP o `file://`. La palabra clave `filesystem` expande archivos en `/usr/lib/live/config-preseed/`; `medium` expande archivos en `minios/config-preseed/` en el medio live detectado. Los archivos locales explícitos pueden usar rutas como `file:///run/initramfs/memory/data/minios/config-preseed/FILE` o `file:///PATH` en la raíz live. Las entradas separadas por tuberías se procesan en el orden especificado; los archivos expandidos por palabra clave usan el orden de glob de shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite establecer el nombre de host del sistema. El valor por defecto es `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Selecciona la política de red cableada. Si no se establece y `dhcp`, la imagen mantiene el valor por defecto. `static` escribe la configuración para el backend seleccionado; `off` desactiva la configuración automática de IPv4 para la interfaz seleccionada.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Selecciona la interfaz cableada. Si se omite para `static` o `off`, se selecciona automáticamente la única interfaz cableada no loopback; si hay cero o múltiples candidatas, se requiere un valor explícito.
- **live-config.network-address=IPV4 | network-address=IPV4**: Establece la dirección IPv4 estática.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Establece la longitud del prefijo IPv4 de 0 a 32. El valor estático por defecto es `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Establece la puerta de enlace IPv4 opcional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Establece direcciones de servidores DNS opcionales, separadas por comas.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Selecciona el backend de red. `auto` prefiere NetworkManager y recurre a ifupdown. `ifupdown` forzado marca la interfaz como no gestionada por NetworkManager cuando ambos stacks están instalados.
- **live-config.username=USERNAME | username=USERNAME**: Permite establecer el nombre de usuario que se creará para el inicio de sesión automático. El valor por defecto es `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Establece los grupos suplementarios para el usuario creado para el inicio de sesión automático. Los nombres de grupo pueden ir separados por comas o espacios. El valor por defecto en MiniOS es `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite establecer el nombre completo del usuario creado para el inicio de sesión automático. El valor por defecto en MiniOS es `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite establecer la contraseña de root en texto plano.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite establecer la contraseña de root en forma cifrada.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite establecer la contraseña de usuario en texto plano.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite establecer la contraseña de usuario en forma cifrada.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite establecer la configuración regional del sistema, por ejemplo `de_CH.UTF-8`. El valor por defecto es `en_US.UTF-8`. Si la configuración regional seleccionada no está disponible en el sistema, se genera automáticamente en el momento.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite establecer la zona horaria del sistema, por ejemplo `Europe/Zurich`. El valor por defecto es `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite cambiar el modelo de teclado. No hay valor por defecto.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite cambiar las distribuciones de teclado. Si se especifica más de una, las herramientas del entorno de escritorio permitirán cambiarla en X11. No hay valor por defecto.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite cambiar las variantes de teclado. Si se especifica más de una, se debe indicar el mismo número de valores que de distribuciones de teclado, ya que se emparejarán uno a uno en el orden especificado. Se permiten valores en blanco. Las herramientas del entorno de escritorio permitirán alternar entre cada par de distribución y variante en X11. No hay valor por defecto.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite cambiar las opciones de teclado. No hay valor por defecto.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite desactivar servicios sysv mediante update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite cambiar si el sistema asume que el reloj de hardware está configurado en UTC o no. El valor por defecto es `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite establecer el x-session-manager mediante update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite establecer el driver de xorg en lugar de autodetectarlo. Si se especifica un ID PCI en `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro del sistema live, el *DRIVER* se aplica a esos dispositivos. Si se encuentra tanto un parámetro de arranque como una sobrescritura, el parámetro de arranque tiene prioridad.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite establecer la resolución de xorg en lugar de autodetectarla, por ejemplo 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite establecer el driver WLAN en lugar de autodetectarlo. Si se especifica un ID PCI en `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro del sistema live, el *DRIVER* se aplica a esos dispositivos. Si se encuentra tanto un parámetro de arranque como una sobrescritura, el parámetro de arranque tiene prioridad.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permite especificar el modo de módulo para la configuración live. Cuando se establece en `merged`, el sistema actualizará las cuentas de usuario, reconstruirá cachés y actualizará la configuración de paquetes para que los cambios se integren dinámicamente en el sistema en ejecución.
- **live-config.link-user-dirs | link-user-dirs**: Enlaza los directorios de usuario gestionados a la ruta configurada en el medio de datos de MiniOS.
- **live-config.bind-user-dirs | bind-user-dirs**: Realiza bind-mount de los directorios de usuario gestionados desde la ruta configurada en el medio de datos de MiniOS. Esta opción es mutuamente excluyente con `link-user-dirs`.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Establece la ruta relativa al medio usada por `link-user-dirs` o `bind-user-dirs`. El valor por defecto es `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Descarga y ejecuta archivos arbitrarios desde un archivo temporal en el sistema live en ejecución. Las URLs son gestionadas por `wget` y pueden usar HTTP, FTP o `file://`; los intérpretes requeridos y otras dependencias deben estar ya instalados. La palabra clave `filesystem` expande archivos en `/usr/lib/live/config-hooks/`; `medium` expande archivos en `minios/config-hooks/` en el medio live detectado (con una ruta ISO alternativa en el componente hook). Los archivos locales explícitos pueden usar `file:///run/initramfs/memory/data/minios/config-hooks/FILE` o `file:///PATH` en la raíz live. Las entradas separadas por tuberías se ejecutan en el orden especificado; los archivos expandidos por palabra clave usan el orden de glob de shell. Ejemplos se instalan en `/usr/share/doc/live-config/examples/hooks/`.

> **Advertencia de seguridad:** `live-config` se ejecuta como root. Los hooks se hacen ejecutables y se ejecutan como root, y los preseeds modifican la base de datos debconf del sistema con privilegios de root. HTTP y FTP en texto plano no autentican el contenido descargado ni ofrecen protección de integridad. Prefiere archivos locales revisados o transporte autenticado de confianza con verificación de integridad independiente; no uses hooks o preseeds remotos desde redes no confiables.

## Parámetros de arranque (accesos directos)

Para algunos casos de uso comunes en los que sería necesario combinar varios parámetros individuales, **live-config** proporciona accesos directos. Esto permite tener tanto un control total sobre todas las opciones como mantener la simplicidad.

- **live-config.noroot | noroot**: Desactiva la configuración de contraseña de root y los privilegios de sudo y PolicyKit de MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controla la configuración de sudo para el usuario live. El valor por defecto, y el comportamiento histórico de MiniOS cuando no se establece, es `passwordless`. El modo `password` mantiene el acceso sudo pero requiere la contraseña del usuario live. El modo `disabled` elimina la concesión de sudo de MiniOS y excluye al usuario live del grupo sudo al crearlo. El acceso directo anterior `noroot` sobrescribe esto y desactiva la configuración de privilegios de root de forma más amplia.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controla las reglas de conveniencia de PolicyKit de MiniOS. El valor por defecto, y el comportamiento histórico de MiniOS cuando no se establece, es `passwordless`. Los modos `password` y `disabled` eliminan esa regla, por lo que se aplica la autenticación normal de PolicyKit de la distribución. `disabled` no es una política de denegación total; usa `noroot` cuando el usuario live no debe obtener privilegios administrativos.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Escribe una política `PermitRootLogin` de OpenSSH cuando se establece explícitamente y openssh-server está instalado.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Escribe una política `PasswordAuthentication` de OpenSSH cuando se establece explícitamente y openssh-server está instalado.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controla la postura de XRDP cuando xrdp está instalado. `relaxed` mantiene los valores predeterminados históricos de MiniOS. `hardened` vincula XRDP a localhost, restaura la configuración negociada/alta seguridad y desactiva el inicio de sesión de root en XRDP. `disabled` desactiva y detiene XRDP mediante `minios-svc` cuando está disponible.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controla la postura de conveniencia de X11 en MiniOS. `relaxed` mantiene la compatibilidad histórica. `hardened` elimina la opción permisiva `-ac` del servidor X y refuerza `Xwrapper.config` cuando está presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controla si `/etc/issue` muestra las pistas de contraseña predeterminadas de root/live de MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controla si live-config relaja el bloqueo de pantalla. `relaxed` mantiene la conveniencia histórica de la sesión live. `hardened` evita desactivar el bloqueo de GNOME y activa el bloqueo de xscreensaver donde ese archivo está presente.
- **live-config.noautologin | noautologin**: Evita que live-config configure el inicio de sesión automático en consola y entorno gráfico. No elimina el inicio de sesión automático ya configurado en una sesión persistente.
- **live-config.nottyautologin | nottyautologin**: Evita que live-config configure el inicio de sesión automático en consola, sin afectar la configuración gráfica. La configuración persistente existente no se elimina.
- **live-config.nox11autologin | nox11autologin**: Evita que live-config configure el inicio de sesión automático en el display-manager, sin afectar la configuración TTY. La configuración persistente existente no se elimina.

## Parámetros de arranque (opciones especiales)

Para casos de uso especiales existen algunos parámetros de arranque específicos.

- **live-config.debug | debug**: Habilita la salida de depuración en live-config.

## Archivos de configuración

**live-config** puede configurarse (pero no activarse) mediante archivos de configuración. Cualquier parámetro de arranque compatible puede colocarse en `LIVE_CONFIG_CMDLINE`, y la mayoría de las opciones también pueden establecerse a través de variables individuales. El parámetro `boot=live` sigue siendo necesario para activar **live-config**.

**Nota:** Si se utilizan archivos de configuración, se recomienda (preferentemente) que todos los parámetros de arranque se incluyan en la variable **LIVE_CONFIG_CMDLINE**, o bien se pueden establecer variables individuales. Si se usan variables individuales, el usuario debe asegurarse de que todas las variables necesarias estén definidas para crear una configuración válida.

`live-config` en sí mismo incluye `/etc/live/config.conf` y luego `/etc/live/config.conf.d/*.conf` en orden de glob de shell. Por lo tanto, los fragmentos posteriores pueden reemplazar valores del archivo principal o de fragmentos anteriores. No incluye por separado una segunda capa de configuración de medios.

En medios MiniOS, los archivos fuente son `minios/config.conf` y `minios/config.conf.d/*.conf`. Antes de que `live-config` inicie, el initramfs MiniOS sincroniza estos con los archivos en tiempo de ejecución `/etc/live/` según la hora de modificación. Un archivo fuente más reciente reemplaza a su contraparte en tiempo de ejecución; un archivo en tiempo de ejecución más reciente solo se copia de vuelta si el directorio de datos MiniOS seleccionado es escribible. Si las marcas de tiempo son iguales, no se realiza copia; los archivos faltantes se rellenan y los archivos no se eliminan. Esto es una sincronización en el arranque, no una monitorización continua. Consulta [Archivo de configuración](/reference/configuration/config.conf) para ver las reglas completas de sincronización y precedencia de la línea de comandos.

Como alternativa para implementaciones de initramfs que no prepararon el archivo en tiempo de ejecución, los wrappers de inicio de systemd y SysV copian `minios/config.conf` desde el medio detectado solo cuando `/etc/live/config.conf` está ausente. Esa alternativa no copia los fragmentos `config.conf.d`. El initramfs estándar actual de MiniOS LiveKit realiza la sincronización mencionada anteriormente.

Los archivos fragmentados deben coincidir con `*.conf`. Se recomiendan nombres como `vendor.conf` o `project.conf`; elige nombres léxicos deliberadamente porque los fragmentos posteriores sobrescriben a los anteriores.

El contenido real de los archivos de configuración consiste en una o más de las siguientes variables.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variable corresponde a la línea de comandos del gestor de arranque.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variable corresponde al parámetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variable corresponde al parámetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variable corresponde al parámetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variable corresponde al parámetro `**live-config.hostname**=*HOSTNAME*`. Por defecto es `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Selecciona la política de red cableada. `dhcp` y un valor no definido no realizan ninguna acción y no eliminan un perfil estático MiniOS creado previamente.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Selecciona la interfaz cableada para la política `static` o `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Establece la dirección IPv4 estática.
- **LIVE_NETWORK_PREFIX=PREFIX**: Establece la longitud del prefijo estático; el valor predeterminado es `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Establece la puerta de enlace estática opcional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Establece los servidores DNS opcionales, separados por comas.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Selecciona el backend implementado.

El componente de red registra `/var/lib/live/config/network` después de escribir correctamente la política. Elimina ese sello para aplicar una política modificada en un sistema persistente. Para retirar un perfil estático anterior, utiliza `network-method=off` o elimina manualmente el perfil y sello gestionados por MiniOS.

- **LIVE_USERNAME=USERNAME**: Esta variable corresponde al parámetro `**live-config.username**=*USERNAME*`. El valor predeterminado es `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variable corresponde al parámetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variable corresponde al parámetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variable corresponde al parámetro `**live-config.root-password**=*PASSWORD*`. Especifica la contraseña de root en texto plano.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variable corresponde al parámetro `**live-config.root-password-crypted**=*PASSWORD*`. Especifica la contraseña de root en forma cifrada.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variable corresponde al parámetro `**live-config.user-password**=*PASSWORD*`. Especifica la contraseña de usuario en texto plano.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variable corresponde al parámetro `**live-config.user-password-crypted**=*PASSWORD*`. Especifica la contraseña de usuario en forma cifrada.
- **LIVE_CONFIG_NOROOT=true|false**: Esta variable corresponde al parámetro `**live-config.noroot**` y desactiva la configuración de privilegios de root, sudo y PolicyKit cuando se establece en `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Esta variable corresponde al parámetro `**live-config.sudo-mode**=...`. Si no se define, MiniOS mantiene el comportamiento histórico de sudo sin contraseña.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Esta variable corresponde al parámetro `**live-config.polkit-mode**=...`. `password` y `disabled` eliminan la regla de PolicyKit sin contraseña MiniOS y restauran la autenticación normal de PolicyKit de la distribución.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Esta variable corresponde al parámetro `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Esta variable corresponde al parámetro `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Esta variable corresponde al parámetro `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Esta variable corresponde al parámetro `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Esta variable corresponde al parámetro `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Esta variable corresponde al parámetro `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Esta variable corresponde al parámetro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Esta variable corresponde al parámetro `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Esta variable corresponde al parámetro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Esta variable corresponde al parámetro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Esta variable corresponde al parámetro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Esta variable corresponde al parámetro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Esta variable corresponde al parámetro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Esta variable corresponde al parámetro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Esta variable corresponde al parámetro `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Esta variable corresponde al parámetro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Esta variable corresponde al parámetro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Esta variable corresponde al parámetro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Esta variable corresponde al parámetro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Habilita o deshabilita los enlaces desde los directorios de datos estándar del usuario hacia la unidad MiniOS escribible. El parámetro de arranque correspondiente es la bandera `live-config.link-user-dirs`. El modo de enlace no se puede combinar con el modo bind ni con ningún modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Habilita o deshabilita los puntos de montaje bind de los directorios de datos estándar del usuario desde la unidad MiniOS escribible. El parámetro de arranque correspondiente es la bandera `live-config.bind-user-dirs`. El modo bind no se puede combinar con el modo enlace ni con ningún modo `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Esta variable corresponde al parámetro `**live-config.user-dirs-path**=*PATH*`. Especifica una ruta segura dentro de la unidad MiniOS FAT32, exFAT o NTFS. El valor predeterminado es `/minios/userdata`; se rechazan los segmentos de punto y directorio padre.

La configuración de medios de usuario nunca fusiona automáticamente dos directorios no vacíos. Un directorio local no vacío solo se migra cuando su destino en el medio está vacío. Cuando la función se desactiva, los datos gestionados en el medio se copian de vuelta antes de eliminar los enlaces. Una validación o copia fallida deja los directorios de usuario existentes en su lugar y registra el motivo en `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Esta variable contiene el estado especificado por el parámetro `live-config.module-mode` (o `module-mode`). Cuando se establece en `merged`, el sistema live aplica actualizaciones (mediante minios-update-users, minios-update-cache y minios-update-dpkg) para fusionar configuraciones personalizadas con el entorno base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variable corresponde al parámetro `**live-config.debug**`.

# PERSONALIZACIÓN

**live-config** puede personalizarse fácilmente para proyectos derivados o uso local.

## Añadir nuevos componentes de configuración

Los proyectos derivados pueden colocar sus componentes en /usr/lib/live/config y no necesitan hacer nada más, los componentes se ejecutarán automáticamente durante el arranque.

Lo más recomendable es empaquetar los componentes en un paquete debian propio. Un paquete de ejemplo que contiene un componente de ejemplo se encuentra en /usr/share/doc/live-config/examples.

## Eliminar componentes de configuración existentes

Actualmente no es posible eliminar componentes de forma sensata sin requerir enviar un paquete **live-config** modificado localmente o usar dpkg-divert. Sin embargo, se puede lograr lo mismo desactivando los componentes respectivos mediante el mecanismo live-config.nocomponents, ver arriba. Para evitar tener que especificar siempre los componentes desactivados mediante el parámetro de arranque, se recomienda usar un archivo de configuración, ver arriba.

Los archivos de configuración para el propio sistema live es mejor incluirlos en un paquete debian propio. Un paquete de ejemplo con una configuración de ejemplo se encuentra en /usr/share/doc/live-config/examples.

# COMPONENTES

**live-config** actualmente incluye los siguientes componentes en /usr/lib/live/config.

- **nss-systemd**: elimina o restaura el módulo NSS de systemd en /etc/nsswitch.conf para evitar un problema conocido de systemd.
- **debconf**: permite aplicar archivos preseed arbitrarios colocados en el medio live o en un servidor http/ftp.
- **hostname**: configura /etc/hostname y /etc/hosts.
- **issue-setup**: configura el archivo /etc/issue con un banner de bienvenida e información de la distribución.
- **live-debconfig_passwd**: configura las contraseñas de usuario y root mediante live-debconfig.
- **user-setup**: añade una cuenta de usuario live.
- **user-groups**: añade el usuario live a los grupos suplementarios declarados por los módulos instalados. Los grupos existentes listados en `/usr/share/live/config/user-default-groups.d/*.groups` se aplican después de la creación del usuario y en posteriores ejecuciones de live-config.
- **root-setup**: establece o actualiza la contraseña de root y configura el entorno del usuario root.
- **sudo**: otorga privilegios sudo al usuario live.
- **user-ssh-keys**: sincroniza los archivos `authorized_keys.<username>` específicos del usuario entre el medio live y los directorios home individuales. Soporta múltiples usuarios simultáneamente (por ejemplo, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: enlaza o monta mediante bind directorios de usuario validados en el medio de datos MiniOS existente y escribible, con migración segura y copia de vuelta al desactivar.
- **locales**: configura las locales.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura el nombre de usuario en xorg.service y aplica la postura X11 cuando es compatible.
- **gdm3**: configura el inicio de sesión automático en gdm3.
- **sddm**: configura el inicio de sesión automático en sddm.
- **kdm**: configura el inicio de sesión automático en kdm.
- **lightdm**: configura el inicio de sesión automático en lightdm.
- **lxdm**: configura el inicio de sesión automático en lxdm.
- **nodm**: configura el inicio de sesión automático en nodm.
- **slim**: configura el inicio de sesión automático en slim.
- **xinit**: configura el inicio de sesión automático con xinit.
- **keyboard-configuration**: configura el teclado.
- **sysvinit**: configura el inicio de sesión automático en consola mediante `/etc/inittab` cuando sysvinit está instalado. Los accesos directos `noautologin` y `nottyautologin` suprimen esa configuración.
- **sysv-rc**: configura sysv-rc desactivando los servicios listados.
- **apport**: desactiva apport.
- **gnome-panel-data**: desactiva el botón de bloqueo de pantalla.
- **gnome-power-manager**: desactiva la hibernación.
- **gnome-screensaver**: controla el bloqueo de pantalla de GNOME según `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: desactiva el asistente de migración de KDE (squeeze y posteriores).
- **kde-services**: desactiva algunos servicios no deseados de KDE (squeeze y posteriores).
- **policykit**: otorga privilegios de usuario mediante PolicyKit.
- **ssl-cert**: regenera los certificados snake-oil SSL.
- **xrdp**: configura la postura relajada, reforzada o desactivada de XRDP cuando XRDP está instalado.
- **anacron**: desactiva anacron.
- **util-linux**: desactiva el servicio hwclock de util-linux.
- **login**: desactiva lastlog.
- **xserver-xorg**: configura xserver-xorg.
- **network**: configura la política IPv4 cableada duradera mediante un archivo de claves seguro de NetworkManager o un bloque ifupdown. Se ejecuta antes de los servicios de red, valida todos los valores y solo sella después de una escritura exitosa.
- **openssh-server**: recrea las claves de host de OpenSSH y escribe la política de inicio de sesión de root o autenticación por contraseña solicitada explícitamente.
- **xfce4-panel**: configura xfce4-panel con la configuración predeterminada.
- **xscreensaver**: controla el bloqueo de xscreensaver según `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura los drivers WLAN broadcom-sta.
- **hyperv**: configura los ajustes de X11 para mejorar la compatibilidad en plataformas Microsoft Hyper-V.
- **ntfs3**: gestiona reglas udev para soporte NTFS3.
- **config-module-mode**: configura el modo de módulos del sistema y actualiza cachés, configuraciones de usuario y dpkg.
- **hooks**: permite ejecutar comandos arbitrarios desde un archivo colocado en el medio live o en un servidor http/ftp.

# ARCHIVOS

- `minios/config.conf` en el medio de datos MiniOS seleccionado (copia fuente)
- `minios/config.conf.d/*.conf` en el medio de datos MiniOS seleccionado (fragmentos fuente)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` en medios de datos seleccionados y escribibles cuando la exportación de logs está habilitada
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` en el medio live detectado (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` en el medio live detectado (`medium` preseeds)

# VER TAMBIÉN

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PÁGINA PRINCIPAL

Puedes encontrar más información sobre **minios-live-config** en su [repositorio de GitHub](https://github.com/minios-linux/minios-live-config). Información general sobre MiniOS está disponible en [minios.dev](https://minios.dev).

# ERRORES

Los errores pueden reportarse en el [issue tracker de minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTOR

**live-config** fue escrito originalmente por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, el desarrollo ha continuado a cargo del equipo de Debian Live. Desde 2025, el desarrollo de la versión modificada **minios-live-config** ha continuado bajo el equipo de MiniOS Live.
