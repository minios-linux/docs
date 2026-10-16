---
updated: 2026-10-15
program_commits:
    minios-live-config: 2a798c533b2980a40e8457205cabfa24ccad2d10
---

# live-config

**live-config** - Componentes de configuración del sistema

**live-config** contiene los componentes que configuran un sistema live durante el proceso de arranque (late userspace).

La política de caché y registro de sesión persistente se decide previamente por `minios-boot`, después de preparar el live root y su configuración, pero antes de que se inicien los servicios habituales. El componente `browser-cache` aplica los puntos de montaje por usuario tras la creación del usuario. Estas políticas requieren la activación exitosa de la persistencia en un almacenamiento duradero o como una sesión RAM copiada y escribible con información de origen protegida, además de un initrd compatible con `perch-storage-v1`. Las sesiones copiadas RAM permanecen no duraderas hasta que se guardan; consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

El arranque por red en el initramfs (`ip=`, PXE, `from=http://…`) es una capa independiente de LiveKit y **no** está gestionada por live-config. Consulta [Arranque por red](/reference/boot-process/Network-Boot).

**live-config** puede configurarse mediante parámetros de arranque o archivos de configuración en tiempo de ejecución preparados por el initramfs. La línea de comandos real del kernel se añade después de los valores proporcionados por archivo, por lo que los parámetros de arranque coincidentes posteriores tienen prioridad.`LIVE_CONFIG_CMDLINE` Los componentes que registran estado bajo `/var/lib/live/config` normalmente se ejecutan solo una vez; los componentes de sincronización y sin estado pueden ejecutarse en cada invocación.

Si *live-build*(7) se utiliza para construir el sistema live, los parámetros de live-config utilizados por defecto pueden establecerse mediante la opción `--bootappend-live` , consulta *lb_config*(1) página del manual.

## Parámetros de arranque (componentes)

**live-config** solo se activa si `boot=live` se utiliza como parámetro de arranque. Por defecto, se ejecutan todos los componentes. El parámetro `live-config.components` puede limitar qué componentes se ejecutan, y `live-config.nocomponents` puede excluir componentes. Si se usan ambos parámetros, o alguno de ellos se especifica varias veces, prevalece la última aparición.

- **live-config.components | components**: Se ejecutan todos los componentes. Esta es la opción predeterminada en las imágenes live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Solo se ejecutan los componentes especificados. Los componentes se ejecutan en el orden definido por sus nombres de archivo en `/usr/lib/live/config`, independientemente del orden en que aparezcan en esta lista.
- **live-config.nocomponents | nocomponents**: No se ejecuta ningún componente.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Se ejecutan todos los componentes, excepto los especificados.

## Parámetros de arranque (opciones)

Algunos componentes individuales pueden modificar su comportamiento mediante un parámetro de arranque.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Descarga y aplica uno o varios archivos preseed de debconf. Las URL son gestionadas por `wget` y pueden usar HTTP, FTP o `file://`. La palabra clave `filesystem` expande archivos en `/usr/lib/live/config-preseed/`; `medium` expande archivos en `minios/config-preseed/` en el medio live detectado. Los archivos locales explícitos pueden usar rutas como `file:///run/initramfs/memory/data/minios/config-preseed/FILE` o `file:///PATH` en la raíz del sistema live. Las entradas separadas por barra vertical se procesan en el orden especificado; los archivos expandidos por una palabra clave usan el orden de glob de shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite establecer el nombre de host del sistema. El valor predeterminado es `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Selecciona la política de red cableada. Si no se establece y `dhcp` dejan la imagen con el valor predeterminado sin cambios. `static` escribe la configuración para el backend seleccionado; `off` desactiva la configuración automática de IPv4 para la interfaz seleccionada.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Selecciona la interfaz cableada. Si se omite para `static` o `off`, se selecciona automáticamente la única interfaz cableada que no es loopback; si hay cero o varias candidatas, se requiere un valor explícito.
- **live-config.network-address=IPV4 | network-address=IPV4**: Establece la dirección IPv4 estática.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Define la longitud del prefijo IPv4 de 0 a 32. El valor predeterminado para estática es `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Establece la puerta de enlace IPv4 opcional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Establece direcciones de servidores DNS opcionales, separadas por comas.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Selecciona el backend de red. `auto` prefiere NetworkManager y, si no está disponible, utiliza ifupdown. Si se fuerza `ifupdown`, la interfaz se marca como no gestionada por NetworkManager cuando ambos sistemas están instalados.
- **live-config.username=USERNAME | username=USERNAME**: Permite establecer el nombre de usuario que se creará para el inicio de sesión automático. El valor predeterminado es `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Establece los grupos suplementarios para el usuario creado para el inicio de sesión automático. Los nombres de los grupos pueden separarse por comas o espacios. El valor predeterminado de MiniOS es `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite establecer el nombre completo del usuario creado para el inicio de sesión automático. El valor predeterminado de MiniOS es `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite establecer la contraseña de root en texto plano.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite establecer la contraseña de root en formato cifrado.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite establecer la contraseña del usuario en texto plano.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite establecer la contraseña del usuario en formato cifrado.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite establecer la configuración regional del sistema, por ejemplo, `de_CH.UTF-8`. El valor predeterminado es `en_US.UTF-8`. Si la configuración regional seleccionada no está disponible en el sistema, se genera automáticamente en el momento.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite establecer la zona horaria del sistema, por ejemplo, `Europe/Zurich`. El valor predeterminado es `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite cambiar el modelo de teclado. No hay ningún valor predeterminado establecido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite cambiar las distribuciones de teclado. Si se especifica más de una, las herramientas del entorno de escritorio permitirán cambiarla bajo X11. No hay ningún valor predeterminado establecido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite cambiar las variantes de teclado. Si se especifica más de una, se debe indicar el mismo número de valores que de distribuciones de teclado, ya que se emparejarán uno a uno en el orden indicado. Se permiten valores en blanco. Las herramientas del entorno de escritorio permitirán alternar entre cada par de distribución y variante bajo X11. No hay ningún valor predeterminado establecido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite cambiar las opciones del teclado. No hay ningún valor predeterminado establecido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite deshabilitar servicios sysv mediante update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite cambiar si el sistema asume que el reloj de hardware está configurado en UTC o no. El valor predeterminado es `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite establecer el x-session-manager mediante update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite definir el controlador xorg en lugar de detectarlo automáticamente. Si se especifica un ID PCI en `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro del sistema live, se aplicará el *DRIVER* para estos dispositivos. Si se encuentran tanto un parámetro de arranque como una anulación, el parámetro de arranque tiene prioridad.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite establecer la resolución de xorg en lugar de autodetectarla, por ejemplo, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite definir el controlador WLAN en vez de autodetectarlo. Si se especifica un ID PCI en `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro del sistema live, el *DRIVER* se aplica para estos dispositivos. Si se encuentra tanto un parámetro de arranque como una anulación, el parámetro de arranque tiene prioridad.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permite especificar el modo de módulo para la configuración live. Cuando se establece en `merged`, el sistema actualizará las cuentas de usuario, reconstruirá las cachés y actualizará la configuración de los paquetes para que los cambios de configuración se integren dinámicamente en el sistema en ejecución.
- **live-config.link-user-dirs | link-user-dirs**: Enlaza los directorios de usuario gestionados a la ruta configurada en el medio de datos MiniOS. Es excluyente con el modo bind y no está disponible con ningún modo `toram` o mientras la sesión de persistencia activa esté cifrada con LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Realiza un bind-mount de los directorios de usuario gestionados desde la ruta configurada en el medio de datos MiniOS. Es excluyente con el modo link y tiene las mismas restricciones de `toram` y cifrado de sesión activa.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Define la ruta relativa al medio utilizada por `link-user-dirs` o `bind-user-dirs`. El valor predeterminado es `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Descarga y ejecuta archivos arbitrarios desde un archivo temporal en el sistema live en ejecución. Las URL son gestionadas por `wget` y pueden usar HTTP, FTP o `file://`; los intérpretes requeridos y otras dependencias deben estar ya instalados. La palabra clave `filesystem` expande archivos en `/usr/lib/live/config-hooks/`; `medium` expande archivos en `minios/config-hooks/` en el medio live detectado (con una ruta ISO alternativa en el componente hook). Los archivos locales explícitos pueden usar `file:///run/initramfs/memory/data/minios/config-hooks/FILE` o `file:///PATH` en la raíz live. Las entradas separadas por barras verticales se ejecutan en el orden especificado; los archivos expandidos por una palabra clave usan el orden de glob de shell. Ejemplos se instalan en `/usr/share/doc/live-config/examples/hooks/`.

> **Aviso de seguridad:** `live-config` se ejecuta como root. Los hooks se hacen ejecutables y se ejecutan como root, y los preseeds modifican la base de datos debconf del sistema con privilegios de root. HTTP y FTP simples no autentican el contenido descargado ni ofrecen protección de integridad. Prefiera archivos locales revisados o transporte autenticado de confianza con verificación de integridad independiente; no utilice hooks o preseeds remotos desde redes no confiables.

### Opciones de almacenamiento temprano de MiniOS

Estas opciones son leídas por `minios-boot` antes de que se inicien los servicios habituales. Requieren la activación exitosa de la persistencia en un almacenamiento duradero o una sesión de RAM escribible con protección de `ram-origin` información. No activan la persistencia por sí mismas y no pueden hacer que los cambios de RAM sean duraderos sin guardar.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` coloca el journal de systemd y los archivos habituales de `/var/log` en un RAM limitado; los diagnósticos de arranque permanecen en almacenamiento duradero. Predeterminado: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` almacena los archivos descargados de APT en un tmpfs limitado cuando las condiciones de RAM y swap lo permiten. Las bases de datos de paquetes y las listas de repositorios permanecen persistentes. Predeterminado: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` solicita cachés nativos del navegador en RAM. El `browser-cache` componente monta los directorios de caché seleccionados por el usuario en vivo después de que la cuenta existe. Predeterminado: `persistent`.

## Parámetros de arranque (accesos directos)

En algunos casos de uso comunes donde sería necesario combinar varios parámetros individuales, **live-config** proporciona accesos directos. Esto permite tener un control total sobre todas las opciones y, al mismo tiempo, mantener la simplicidad.

- **live-config.noroot | noroot**: Desactiva la configuración de la contraseña de root y las concesiones de privilegios de MiniOS sudo y PolicyKit.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controla la configuración de sudo para el usuario live. El comportamiento predeterminado e histórico de MiniOS cuando no se define es `passwordless`. El `password` modo mantiene el acceso a sudo pero requiere la contraseña del usuario live. El `disabled` modo elimina la concesión de MiniOS sudo y deja al usuario live fuera del grupo sudo al crearlo. El acceso directo anterior `noroot` anula esto y desactiva la configuración de privilegios de root de forma más amplia.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controla las reglas de conveniencia de PolicyKit de MiniOS. El comportamiento predeterminado e histórico de MiniOS cuando no se define es `passwordless`. Los modos `password` y `disabled` eliminan esa regla, por lo que se aplica la autenticación estándar de PolicyKit de la distribución. `disabled` no es una política estricta de denegación total; utilice `noroot` cuando el usuario live no deba obtener privilegios administrativos.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Escribe una política de OpenSSH `PermitRootLogin` cuando se establece explícitamente y openssh-server está instalado.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Escribe una política de OpenSSH `PasswordAuthentication` cuando se establece explícitamente y openssh-server está instalado.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controla la configuración de XRDP cuando xrdp está instalado. `relaxed` conserva los valores predeterminados históricos de MiniOS. `hardened` vincula XRDP a localhost, restaura la configuración negociada/de alta seguridad y desactiva el inicio de sesión de root por XRDP. `disabled` desactiva y detiene XRDP mediante `minios-svc` cuando está disponible.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controla la configuración de conveniencia de X11 de MiniOS. `relaxed` conserva la compatibilidad histórica. `hardened` elimina la opción permisiva `-ac` del servidor X y refuerza `Xwrapper.config` cuando está presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controla si `/etc/issue` muestra las sugerencias de contraseña predeterminadas de root/live de MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controla si live-config relaja el bloqueo de pantalla. `relaxed` conserva la comodidad histórica de las sesiones en vivo. `hardened` evita desactivar el bloqueo de GNOME y habilita el bloqueo de xscreensaver cuando ese archivo está presente.
- **live-config.noautologin | noautologin**: Impide que live-config configure el inicio de sesión automático en consola y entorno gráfico. No elimina el inicio de sesión automático ya configurado en una sesión persistente.
- **live-config.nottyautologin | nottyautologin**: Impide que live-config configure el inicio de sesión automático en consola, sin afectar la configuración gráfica. La configuración persistente existente no se elimina.
- **live-config.nox11autologin | nox11autologin**: Impide que live-config configure el inicio de sesión automático del gestor de pantalla, sin afectar la configuración de TTY. La configuración persistente existente no se elimina.

## Parámetros de arranque (opciones especiales)

Para casos de uso especiales, existen algunos parámetros de arranque específicos.

- **live-config.debug | debug**: Activa la salida de depuración en live-config.

## Archivos de configuración

**live-config** se puede configurar (pero no activar) mediante archivos de configuración. Cualquier parámetro de arranque compatible se puede colocar en `LIVE_CONFIG_CMDLINE`, y la mayoría de las opciones también pueden establecerse mediante variables individuales. El parámetro `boot=live` sigue siendo necesario para activar **live-config**.

**Nota:** Si se utilizan archivos de configuración, lo recomendable es que todos los parámetros de arranque se incluyan en la variable **LIVE_CONFIG_CMDLINE**, aunque también es posible definir variables individuales. Si se elige esta última opción, el usuario debe asegurarse de establecer todas las variables necesarias para crear una configuración válida.

`live-config` por sí mismo incluye `/etc/live/config.conf` y luego `/etc/live/config.conf.d/*.conf` en el orden de glob de shell. Por lo tanto, los fragmentos posteriores pueden sobrescribir los valores del archivo principal o de fragmentos anteriores. No incluye por separado una segunda capa de configuración del medio.

En medios MiniOS, los archivos fuente son `minios/config.conf` y `minios/config.conf.d/*.conf`. Antes de que `live-config` se inicie, el initramfs MiniOS sincroniza estos archivos con los archivos de ejecución `/etc/live/` según la fecha de modificación. Un archivo fuente más reciente reemplaza a su contraparte en ejecución; un archivo en ejecución más reciente solo se copia de vuelta si el directorio de datos MiniOS seleccionado es escribible. Si las marcas de tiempo son iguales, no se copia nada; los archivos faltantes se rellenan y no se eliminan archivos. Esta sincronización ocurre solo en el arranque, no es una monitorización continua. Consulte [Archivo de configuración](/reference/configuration/config.conf) para conocer las reglas completas de sincronización y precedencia de la línea de comandos.

Como alternativa para implementaciones de initramfs que no prepararon el archivo de ejecución, los wrappers de inicio de systemd y SysV copian `minios/config.conf` desde el medio detectado solo cuando `/etc/live/config.conf` está ausente. Este método alternativo no copia fragmentos de `config.conf.d`. El initramfs estándar actual de LiveKit MiniOS realiza la sincronización mencionada anteriormente.

Los archivos fragmentados deben coincidir con `*.conf`. Se recomienda usar nombres como `vendor.conf` o `project.conf`. Elija los nombres de forma deliberada, ya que los fragmentos posteriores sobrescriben a los anteriores.

El contenido real de los archivos de configuración consta de una o más de las siguientes variables.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variable corresponde a la línea de comandos del gestor de arranque.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variable corresponde al parámetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variable corresponde al parámetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variable corresponde al parámetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variable corresponde al parámetro `**live-config.hostname**=*HOSTNAME*` . El valor predeterminado es `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Selecciona la política de red cableada. `dhcp` y un valor sin definir no realizan ninguna acción y no eliminan un perfil estático MiniOS previamente creado.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Selecciona la interfaz cableada para la política `static` o `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Define la dirección IPv4 estática.
- **LIVE_NETWORK_PREFIX=PREFIX**: Define la longitud del prefijo estático; el valor predeterminado es `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Define la puerta de enlace estática opcional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Define servidores DNS opcionales, separados por comas.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Selecciona el backend implementado.

El componente de red registra `/var/lib/live/config/network` después de escribir la política correctamente. Elimine ese sello para aplicar la política modificada en un sistema persistente. Para retirar un perfil estático anterior, utilice `network-method=off` o elimine manualmente el perfil y el sello gestionados por MiniOS.

- **LIVE_USERNAME=USERNAME**: Esta variable corresponde al parámetro `**live-config.username**=*USERNAME*` . El valor predeterminado es `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variable corresponde al parámetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variable corresponde al parámetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variable corresponde al parámetro `**live-config.root-password**=*PASSWORD*`. Especifica la contraseña de root en texto plano.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variable corresponde al parámetro `**live-config.root-password-crypted**=*PASSWORD*`. Especifica la contraseña de root en formato cifrado.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variable corresponde al `**live-config.user-password**=*PASSWORD*` parámetro. Especifica la contraseña del usuario en texto plano.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variable corresponde al `**live-config.user-password-crypted**=*PASSWORD*` parámetro. Especifica la contraseña del usuario en formato cifrado.
- **LIVE_CONFIG_NOROOT=true|false**: Esta variable corresponde al `**live-config.noroot**` parámetro y desactiva la configuración de privilegios root, sudo y PolicyKit cuando se establece en `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Esta variable corresponde al `**live-config.sudo-mode**=...` parámetro. Si no se define, MiniOS mantiene el comportamiento histórico de sudo sin contraseña.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Esta variable corresponde al `**live-config.polkit-mode**=...` parámetro. `password` y `disabled` eliminan la regla sin contraseña de MiniOS y restauran la autenticación normal de PolicyKit de la distribución.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Esta variable corresponde al `**live-config.ssh-permit-root-login**=...` parámetro.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Esta variable corresponde al `**live-config.ssh-password-authentication**=...` parámetro.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Esta variable corresponde al `**live-config.xrdp-mode**=...` parámetro.
- **LIVE_X11_MODE=relaxed|hardened**: Esta variable corresponde al `**live-config.x11-mode**=...` parámetro.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Esta variable corresponde al `**live-config.issue-password-hints**=...` parámetro.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Esta variable corresponde al `**live-config.lockscreen-mode**=...` parámetro.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Esta variable corresponde al `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` parámetro.
- **LIVE_TIMEZONE=TIMEZONE**: Esta variable corresponde al `**live-config.timezone**=*TIMEZONE*` parámetro.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Esta variable corresponde al `**live-config.keyboard-model**=*KEYBOARD_MODEL*` parámetro.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Esta variable corresponde al `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*` parámetro.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Esta variable corresponde al `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*` parámetro.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Esta variable corresponde al `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*` parámetro.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Esta variable corresponde al `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*` parámetro.
- **LIVE_UTC=yes|no**: Esta variable corresponde al `**live-config.utc**=**yes**|no` parámetro.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Esta variable corresponde al `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*` parámetro.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Esta variable corresponde al `**live-config.xorg-driver**=*XORG_DRIVER*` parámetro.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Esta variable corresponde al `**live-config.xorg-resolution**=*XORG_RESOLUTION*` parámetro.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Esta variable corresponde al `**live-config.wlan-driver**=*WLAN_DRIVER*` parámetro.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Esta variable corresponde al `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` parámetro.
- **LIVE_LINK_USER_DIRS=true|false**: Activa o desactiva los enlaces desde los directorios estándar de datos del usuario hacia la unidad escribible MiniOS. El parámetro de arranque correspondiente es simplemente el indicador `live-config.link-user-dirs`. El modo enlace no se puede combinar con el modo bind ni con ningún modo `toram` .
- **LIVE_BIND_USER_DIRS=true|false**: Activa o desactiva los puntos de montaje bind de los directorios estándar de datos del usuario desde la unidad escribible MiniOS. El parámetro de arranque correspondiente es simplemente el indicador `live-config.bind-user-dirs` . El modo bind no se puede combinar con el modo enlace ni con ningún modo `toram` .
- **LIVE_USER_DIRS_PATH=PATH**: Esta variable corresponde al `**live-config.user-dirs-path**=*PATH*` parámetro. Especifica una ruta segura dentro de la unidad FAT32, exFAT o NTFS MiniOS. El valor predeterminado es `/minios/userdata`; se rechazan los segmentos de punto y directorio padre.

La configuración de medios de usuario nunca fusiona automáticamente dos directorios no vacíos. Un directorio local no vacío solo se migra cuando su destino de medios está vacío. Cuando la función está desactivada, los datos gestionados de medios se copian de vuelta antes de eliminar los enlaces. La activación y la copia de medios de usuario se bloquean mientras la sesión de persistencia activa está cifrada con LUKS, evitando que los datos de la sesión se muevan a medios MiniOS sin cifrar. Esta decisión utiliza el estado de cifrado activo real: `perchencrypt=luks` solo solicita cifrado al crear una nueva sesión y no describe una sesión existente. Si falla la validación o la copia, los directorios de usuario existentes permanecen y se registra el motivo en `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Esta variable contiene el estado especificado por el `live-config.module-mode` (o `module-mode`) parámetro. Cuando se establece en `merged`, el sistema live aplica actualizaciones (mediante minios-update-users, minios-update-cache y minios-update-dpkg) para fusionar configuraciones personalizadas con el entorno base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variable corresponde al `**live-config.debug**` parámetro.

## Variables de MiniOS y registro

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, y **LIVE_BROWSER_CACHE=persistent|volatile**: Políticas independientes de arranque de MiniOS. También funcionan en `config.conf.d` y `LIVE_CONFIG_CMDLINE`. Por sí solas no habilitan la persistencia. Consulta [Archivo de configuración](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

El componente `browser-cache` lee la política validada de `minios-boot` después de que el usuario live existe y monta mediante bind los directorios estándar de caché nativa del navegador en un sistema de archivos compartido y limitado de RAM, sujeto a comprobaciones de memoria/intercambio. Una política de Firefox creada por separado desactiva su caché en disco sin mover los perfiles del navegador. Si este componente se excluye mediante `components=` o `nocomponents=`, la solicitud temprana de caché del navegador por sí sola no configura los puntos de montaje por usuario.

Los asistentes en modo combinado conservan los errores normales, pero solo generan trazas detalladas de comandos y copias de depuración cuando `LIVE_CONFIG_DEBUG=true`.

# PERSONALIZACIÓN

**live-config** se puede personalizar fácilmente para proyectos derivados o uso local.

## Añadiendo nuevos componentes de configuración

Los proyectos derivados pueden colocar sus componentes en /usr/lib/live/config y no necesitan realizar ninguna otra acción; los componentes se ejecutarán automáticamente durante el arranque.

Es recomendable incluir los componentes en un paquete debian propio. Un paquete de ejemplo que contiene un componente de muestra se encuentra en /usr/share/doc/live-config/examples.

## Eliminando componentes de configuración existentes

Aún no es realmente posible eliminar los componentes en sí de una manera razonable sin requerir enviar una versión modificada localmente de **live-config** o utilizar dpkg-divert. Sin embargo, se puede lograr lo mismo deshabilitando los componentes correspondientes mediante el mecanismo live-config.nocomponents, como se indica arriba. Para evitar tener que especificar siempre los componentes deshabilitados mediante el parámetro de arranque, se recomienda usar un archivo de configuración, como se explica arriba.

Los archivos de configuración para el sistema live se deben incluir preferentemente en un paquete debian propio. Un paquete de ejemplo que contiene una configuración de muestra se encuentra en /usr/share/doc/live-config/examples.

# COMPONENTES

**live-config** actualmente incluye los siguientes componentes en /usr/lib/live/config.

- **nss-systemd**: elimina o restaura el módulo NSS de systemd en /etc/nsswitch.conf para solucionar un problema conocido de systemd.
- **debconf**: permite aplicar archivos preseed arbitrarios ubicados en el medio live o en un servidor http/ftp.
- **hostname**: configura /etc/hostname y /etc/hosts.
- **issue-setup**: configura el archivo /etc/issue con un mensaje de bienvenida e información de la distribución.
- **live-debconfig_passwd**: configura las contraseñas de usuario y root mediante live-debconfig.
- **user-setup**: crea una cuenta de usuario live.
- **user-groups**: añade el usuario live a los grupos suplementarios declarados por los módulos instalados. Los grupos existentes listados en `/usr/share/live/config/user-default-groups.d/*.groups` se aplican después de la creación del usuario y en ejecuciones posteriores de live-config.
- **root-setup**: establece o actualiza la contraseña de root y configura el entorno del usuario root.
- **sudo**: otorga privilegios de sudo al usuario live.
- **user-ssh-keys**: sincroniza los archivos `authorized_keys.<username>` específicos de usuario entre el medio live y los directorios home de cada usuario. Permite varios usuarios simultáneamente (por ejemplo, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) y reconoce las formas simples de `toram`, `toram=trim`, y `toram=full` como RAM-boot al decidir si el medio live puede actualizarse de forma segura.
- **user-media**: enlaza o monta con bind los directorios de usuario validados en el medio de datos escribible existente MiniOS, con migración y copia de seguridad seguras al deshabilitarse.
- **locales**: configura los locales.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura el nombre de usuario en xorg.service y aplica la configuración de X11 cuando es compatible.
- **gdm3**: configura el inicio de sesión automático en gdm3.
- **sddm**: configura el inicio de sesión automático en sddm.
- **kdm**: configura el inicio de sesión automático en kdm.
- **lightdm**: configura el inicio de sesión automático en lightdm.
- **lxdm**: configura el inicio de sesión automático en lxdm.
- **nodm**: configura el inicio de sesión automático en nodm.
- **slim**: configura el inicio de sesión automático en slim.
- **xinit**: configura el inicio de sesión automático con xinit.
- **keyboard-configuration**: configura el teclado.
- **sysvinit**: configura el inicio de sesión automático en consola mediante `/etc/inittab` cuando sysvinit está instalado. Los accesos directos `noautologin` y `nottyautologin` evitan esa configuración.
- **sysv-rc**: configura sysv-rc deshabilitando los servicios listados.
- **apport**: deshabilita apport.
- **gnome-panel-data**: deshabilita el botón de bloqueo de pantalla.
- **gnome-power-manager**: deshabilita la hibernación.
- **gnome-screensaver**: controla el bloqueo de pantalla de GNOME según `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: deshabilita el asistente de migración de KDE (squeeze y versiones posteriores).
- **kde-services**: deshabilita algunos servicios no deseados de KDE (squeeze y versiones posteriores).
- **policykit**: otorga privilegios de usuario mediante PolicyKit.
- **ssl-cert**: regenera los certificados snake-oil SSL.
- **xrdp**: configura el modo relajado, reforzado o deshabilitado de XRDP cuando XRDP está instalado.
- **anacron**: deshabilita anacron.
- **util-linux**: deshabilita el servicio hwclock de util-linux.
- **login**: deshabilita lastlog.
- **xserver-xorg**: configura xserver-xorg.
- **network**: configura la política IPv4 por cable duradera mediante un archivo clave seguro de NetworkManager o una sección ifupdown. Se ejecuta antes de los servicios de red, valida todos los valores y solo aplica los cambios tras una escritura exitosa.
- **openssh-server**: recrea las claves de host de OpenSSH y aplica la política solicitada explícitamente de inicio de sesión root o autenticación por contraseña.
- **xfce4-panel**: configura xfce4-panel con los ajustes predeterminados.
- **xscreensaver**: controla el bloqueo de xscreensaver según `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura los controladores WLAN broadcom-sta.
- **hyperv**: ajusta la configuración de X11 para mejorar la compatibilidad en plataformas Microsoft Hyper-V.
- **ntfs3**: gestiona las reglas de udev para soporte NTFS3.
- **config-module-mode**: configura el modo de módulos del sistema y actualiza cachés, ajustes de usuario y dpkg.
- **browser-cache**: aplica la política de caché del navegador validada tras la creación del usuario, dependiendo de la memoria disponible, swap, rutas de caché seguras y archivos de política de Firefox existentes.
- **hooks**: permite ejecutar comandos arbitrarios desde un archivo ubicado en el medio live o en un servidor http/ftp.

# ARCHIVOS

- `minios/config.conf` en el soporte de datos seleccionado MiniOS (copia de origen)
- `minios/config.conf.d/*.conf` en el soporte de datos seleccionado MiniOS (fragmentos de origen)
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
- `minios/log/YYYYMMDD_HHMMSS/` en los soportes de datos seleccionados y grabables cuando la exportación de registros está habilitada
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` en el medio en vivo detectado (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` en el medio en vivo detectado (`medium` preseeds)

# VER TAMBIÉN

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PÁGINA PRINCIPAL

Más información sobre **minios-live-config** está disponible en su [repositorio de GitHub](https://github.com/minios-linux/minios-live-config). Información general MiniOS está disponible en [minios.dev](https://minios.dev).

# ERRORES

Puedes informar errores en el [issue tracker de minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTOR

**live-config** fue escrito originalmente por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, el desarrollo ha continuado a cargo del equipo de Debian Live. Desde 2025, el desarrollo de la versión modificada de **minios-live-config** ha sido continuado por el equipo de MiniOS Live.
