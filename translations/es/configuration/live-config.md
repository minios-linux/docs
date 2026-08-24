# LIVE-CONFIG

**live-config** - Componentes de Configuración del Sistema

**live-config** contiene los componentes que configuran un sistema live durante el proceso de arranque (espacio de usuario tardío).

**live-config** puede configurarse mediante parámetros de arranque o archivos de configuración. Si se utilizan ambos mecanismos para una opción determinada, los parámetros de arranque tienen prioridad sobre los archivos de configuración. Cuando se utiliza persistencia, los componentes de **live-config** solo se ejecutan una vez.

Si se utiliza *live-build*(7) para construir el sistema live, los parámetros de live-config utilizados por defecto pueden establecerse mediante la opción `--bootappend-live`. Consulta la página del manual de *lb_config*(1).

## Parámetros de Arranque (componentes)

**live-config** solo se activa si se utiliza `boot=live` como parámetro de arranque. Además, es necesario indicar a **live-config** qué componentes ejecutar mediante el parámetro `live-config.components` o qué componentes no ejecutar mediante el parámetro `live-config.nocomponents`. Si se utilizan ambos, `live-config.components` y `live-config.nocomponents`, o si alguno de ellos se especifica varias veces, siempre tiene prioridad el último especificado.

- **live-config.components | components**: Se ejecutan todos los componentes. Esto es lo que utilizan las imágenes live por defecto.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Solo se ejecutan los componentes especificados. Ten en cuenta que el orden es importante, por ejemplo, `live-config.components=sudo,user-setup` no funcionaría ya que el usuario debe ser creado antes de poder configurarlo para sudo. Consulta los nombres de los archivos de los componentes en `/usr/lib/live/config` para ver su número de orden.
- **live-config.nocomponents | nocomponents**: No se ejecuta ningún componente. Esto equivale a no usar ninguno de los parámetros `live-config.components` o `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Se ejecutan todos los componentes excepto los especificados.

## Parámetros de Arranque (opciones)

Algunos componentes individuales pueden cambiar su comportamiento mediante un parámetro de arranque.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Permite obtener y aplicar uno o más archivos preseed de debconf a la base de datos de debconf. Ten en cuenta que las URLs deben poder ser descargadas por wget (http, ftp o file://). Si el archivo está en el medio live, puede obtenerse con `file:///run/initramfs/memory/data/FILE`, o con `file:///FILE` si está en el sistema de archivos raíz del sistema live. Todos los archivos preseed en `/usr/lib/live/config-preseed/` en el sistema de archivos raíz del sistema live pueden habilitarse automáticamente con la palabra clave `filesystem`. Todos los archivos preseed en `/minios/config-preseed/` del medio live pueden habilitarse automáticamente con la palabra clave `medium`. Si se combinan varios mecanismos, primero se aplican los preseed del filesystem, luego los del medio y finalmente los de red.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite establecer el nombre de host del sistema. El valor por defecto es `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Permite establecer el nombre de usuario que se crea para el inicio de sesión automático. El valor por defecto es `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Permite establecer los grupos predeterminados de los usuarios creados para el inicio de sesión automático. El valor por defecto es `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite establecer el nombre completo de los usuarios creados para el inicio de sesión automático. En MiniOS, el valor por defecto es `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite establecer la contraseña de root en texto plano.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite establecer la contraseña de root en forma cifrada.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite establecer la contraseña del usuario en texto plano.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite establecer la contraseña del usuario en forma cifrada.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite establecer la configuración regional del sistema, por ejemplo, `de_CH.UTF-8`. El valor por defecto es `en_US.UTF-8`. Si la configuración regional seleccionada no está disponible en el sistema, se genera automáticamente al vuelo.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite establecer la zona horaria del sistema, por ejemplo, `Europe/Zurich`. El valor por defecto es `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite cambiar el modelo de teclado. No hay un valor por defecto establecido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite cambiar las distribuciones de teclado. Si se especifican varias, las herramientas del entorno de escritorio permitirán cambiar entre ellas bajo X11. No hay un valor por defecto establecido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite cambiar las variantes de teclado. Si se especifican varias, se debe indicar el mismo número de valores que para las distribuciones de teclado, ya que se emparejarán uno a uno en el orden especificado. Se permiten valores en blanco. Las herramientas del entorno de escritorio permitirán cambiar entre cada par de distribución y variante bajo X11. No hay un valor por defecto establecido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite cambiar las opciones del teclado. No hay un valor por defecto establecido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite deshabilitar servicios sysv mediante update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite cambiar si el sistema asume que el reloj de hardware está en UTC o no. El valor por defecto es `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite establecer el x-session-manager mediante update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite establecer el driver de xorg en lugar de autodetectarlo. Si se especifica un ID PCI en `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro del sistema live, se fuerza el uso de *DRIVER* para esos dispositivos. Si se encuentra tanto un parámetro de arranque como una anulación, el parámetro de arranque tiene prioridad.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite establecer la resolución de xorg en lugar de autodetectarla, por ejemplo, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite establecer el driver WLAN en lugar de autodetectarlo. Si se especifica un ID PCI en `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro del sistema live, se fuerza el uso de *DRIVER* para esos dispositivos. Si se encuentra tanto un parámetro de arranque como una anulación, el parámetro de arranque tiene prioridad.
- **live-config.module-mode=MODE | module-mode=MODE**: Permite especificar el modo de módulo para la configuración live. Cuando se establece en "merged", el sistema actualizará las cuentas de usuario, reconstruirá cachés y refrescará la configuración de paquetes para que los cambios de configuración se integren dinámicamente en el sistema en ejecución.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Permite obtener y ejecutar uno o más archivos arbitrarios. Ten en cuenta que las URLs deben ser accesibles por wget (http, ftp o file://), los archivos se ejecutan en /tmp del sistema live en ejecución, y que los archivos deben tener sus dependencias, si las hay, ya instaladas, por ejemplo, si se va a ejecutar un script de python, el sistema debe tener python instalado. Algunos hooks para casos de uso comunes están disponibles en `/usr/share/doc/live-config/examples/hooks/`. Si el archivo está en el medio live, puede obtenerse con `file:///run/initramfs/memory/data/FILE`, o con `file:///FILE` si está en el sistema de archivos raíz del sistema live. Todos los hooks en `/usr/lib/live/config-hooks/` en el sistema de archivos raíz del sistema live pueden habilitarse automáticamente con la palabra clave `filesystem`. Todos los hooks en `/minios/config-hooks/` del medio live pueden habilitarse automáticamente con la palabra clave `medium`. Si se combinan varios mecanismos, primero se ejecutan los hooks del filesystem, luego los del medio y finalmente los de red.

## Parámetros de Arranque (atajos)

Para algunos casos de uso comunes en los que sería necesario combinar varios parámetros individuales, **live-config** proporciona atajos. Esto permite tener tanto un control granular sobre todas las opciones como mantener la simplicidad.

- **live-config.noroot | noroot**: Desactiva sudo y policykit, el usuario no puede obtener privilegios de root en el sistema.
- **live-config.noautologin | noautologin**: Desactiva tanto el inicio de sesión automático en consola como el inicio de sesión gráfico automático.
- **live-config.nottyautologin | nottyautologin**: Desactiva el inicio de sesión automático en consola, sin afectar el inicio de sesión gráfico automático.
- **live-config.nox11autologin | nox11autologin**: Desactiva el inicio de sesión automático con cualquier gestor de pantalla, sin afectar el autologin por tty.

## Parámetros de Arranque (opciones especiales)

Para casos de uso especiales existen algunos parámetros de arranque específicos.

- **live-config.debug | debug**: Activa la salida de depuración en live-config.

## Archivos de configuración

**live-config** puede configurarse (pero no activarse) mediante archivos de configuración. Todo, excepto los atajos que pueden configurarse con un parámetro de arranque, también puede configurarse alternativamente a través de uno o más archivos. Si se utilizan archivos de configuración, el parámetro `boot=live` sigue siendo necesario para activar **live-config**.

**Nota:** Si se usan archivos de configuración, se recomienda (preferentemente) colocar todos los parámetros de arranque en la variable **LIVE_CONFIG_CMDLINE**, o bien establecer variables individuales. Si se usan variables individuales, el usuario debe asegurarse de que todas las variables necesarias estén definidas para crear una configuración válida.

Los archivos de configuración pueden ubicarse en el propio sistema de archivos raíz (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`), o en el medio live (`minios/config.conf`, `minios/config.conf.d/*.conf`). Si se usan ambos lugares para una opción determinada, las opciones del medio live tienen prioridad sobre las del sistema de archivos raíz.

Aunque los archivos de configuración ubicados en los directorios de configuración no requieren un nombre específico, por razones de consistencia se sugiere usar el esquema de nombres `vendor.conf` o `project.conf` (donde `vendor` o `project` se reemplaza por el nombre real, resultando en un archivo como `progress-linux.conf`).

El contenido real de los archivos de configuración consiste en una o más de las siguientes variables.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variable corresponde a la línea de comandos del gestor de arranque.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variable corresponde al parámetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variable corresponde al parámetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variable corresponde al parámetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variable corresponde al parámetro `**live-config.hostname**=*HOSTNAME*`. El valor predeterminado es `minios`.
- **LIVE_USERNAME=USERNAME**: Esta variable corresponde al parámetro `**live-config.username**=*USERNAME*`. El valor predeterminado es `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variable corresponde al parámetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variable corresponde al parámetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variable corresponde al parámetro `**live-config.root-password**=*PASSWORD*`. Especifica la contraseña de root en texto plano.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variable corresponde al parámetro `**live-config.root-password-crypted**=*PASSWORD*`. Especifica la contraseña de root en forma cifrada.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variable corresponde al parámetro `**live-config.user-password**=*PASSWORD*`. Especifica la contraseña del usuario en texto plano.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variable corresponde al parámetro `**live-config.user-password-crypted**=*PASSWORD*`. Especifica la contraseña del usuario en forma cifrada.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Esta variable corresponde al parámetro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Esta variable corresponde al parámetro `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Esta variable corresponde al parámetro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Esta variable corresponde al parámetro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Esta variable corresponde al parámetro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Esta variable corresponde al parámetro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Esta variable corresponde al parámetro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Esta variable corresponde al parámetro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Esta variable corresponde al parámetro `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Esta variable corresponde al parámetro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Esta variable corresponde al parámetro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Esta variable corresponde al parámetro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Esta variable corresponde al parámetro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Esta variable corresponde al parámetro `**live-config.link-user-dirs**=true|false`. Enlaza los directorios estándar de datos del usuario con la unidad MiniOS escribible. No puede combinarse con el modo bind ni con ningún modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Esta variable corresponde al parámetro `**live-config.bind-user-dirs**=true|false`. Realiza un bind-mount de los directorios estándar de datos del usuario desde la unidad MiniOS escribible. No puede combinarse con el modo link ni con ningún modo `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Esta variable corresponde al parámetro `**live-config.user-dirs-path**=*PATH*`. Especifica una ruta segura dentro de la unidad MiniOS FAT32, exFAT o NTFS. El valor predeterminado es `/minios/userdata`; se rechazan los segmentos de punto y de directorio padre.

La configuración de medios de usuario nunca fusiona automáticamente dos directorios no vacíos. Un directorio local no vacío solo se migra cuando su destino en el medio está vacío. Cuando la función se desactiva, los datos gestionados en el medio se copian de vuelta antes de eliminar los enlaces. Una validación o copia fallida deja los directorios de usuario existentes en su lugar y registra el motivo en `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Esta variable contiene el estado especificado por el parámetro `live-config.module-mode` (o `module-mode`). Cuando se establece en "merged", el sistema live aplica actualizaciones (mediante minios-update-users, minios-update-cache y minios-update-dpkg) para fusionar configuraciones personalizadas con el entorno base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variable corresponde al parámetro `**live-config.debug**`.

# PERSONALIZACIÓN

**live-config** puede personalizarse fácilmente para proyectos derivados o uso local.

## Añadir nuevos componentes de configuración

Los proyectos derivados pueden colocar sus componentes en /usr/lib/live/config y no necesitan hacer nada más, los componentes se ejecutarán automáticamente durante el arranque.

Lo más recomendable es empaquetar los componentes en un paquete debian propio. Un paquete de ejemplo que contiene un componente de ejemplo se puede encontrar en /usr/share/doc/live-config/examples.

## Eliminar componentes de configuración existentes

Actualmente no es posible eliminar componentes de manera adecuada sin requerir enviar un paquete **live-config** modificado localmente o usar dpkg-divert. Sin embargo, se puede lograr el mismo resultado deshabilitando los componentes correspondientes mediante el mecanismo live-config.nocomponents, como se explicó anteriormente. Para evitar tener que especificar siempre los componentes deshabilitados mediante el parámetro de arranque, se recomienda usar un archivo de configuración, como se indicó antes.

Los archivos de configuración para el propio sistema live se deben empaquetar en un paquete debian propio. Un paquete de ejemplo que contiene una configuración de ejemplo se puede encontrar en /usr/share/doc/live-config/examples.

# COMPONENTES

**live-config** actualmente incluye los siguientes componentes en /usr/lib/live/config.

- **nss-systemd**: elimina o restaura el módulo NSS de systemd en /etc/nsswitch.conf para evitar un problema conocido de systemd.
- **debconf**: permite aplicar archivos preseed arbitrarios ubicados en el medio live o en un servidor http/ftp.
- **hostname**: configura /etc/hostname y /etc/hosts.
- **issue-setup**: configura el archivo /etc/issue con un mensaje de bienvenida e información de la distribución.
- **live-debconfig (passwd)**: configura las contraseñas de usuario y root mediante live-debconfig.
- **user-setup**: añade una cuenta de usuario live.
- **root-setup**: establece o actualiza la contraseña de root y configura el entorno del usuario root.
- **sudo**: otorga privilegios sudo al usuario live.
- **user-media**: configura el montaje de medios y el enlace o montaje bind de directorios de usuario para datos persistentes.
- **user-ssh-keys**: sincroniza claves SSH desde archivos `authorized_keys.<username>` específicos del usuario en el medio live a los directorios home de cada usuario. Soporta múltiples usuarios simultáneamente (por ejemplo, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales**: configura las locales.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura el nombre de usuario en xorg.service.
- **gdm3**: configura el autologin en gdm3.
- **kdm**: configura el autologin en kdm.
- **lightdm**: configura el autologin en lightdm.
- **lxdm**: configura el autologin en lxdm.
- **nodm**: configura el autologin en nodm.
- **slim**: configura el autologin en slim.
- **xinit**: configura el autologin con xinit.
- **keyboard-configuration**: configura el teclado.
- **sysvinit**: configura sysvinit.
- **sysv-rc**: configura sysv-rc deshabilitando los servicios listados.
- **login**: deshabilita lastlog.
- **anacron**: deshabilita anacron.
- **util-linux**: deshabilita hwclock de util-linux.
- **apport**: deshabilita apport.
- **gnome-panel-data**: deshabilita el botón de bloqueo de pantalla.
- **gnome-power-manager**: deshabilita la hibernación.
- **gnome-screensaver**: deshabilita el bloqueo de pantalla del salvapantallas.
- **kaboom**: deshabilita el asistente de migración de KDE (squeeze y posteriores).
- **kde-services**: deshabilita algunos servicios no deseados de KDE (squeeze y posteriores).
- **policykit**: otorga privilegios al usuario mediante policykit.
- **ssl-cert**: regenera certificados snake-oil ssl.
- **xrdp**: configura xrdp para conectividad de escritorio remoto.
- **xfce4-panel**: configura xfce4-panel con la configuración predeterminada.
- **xscreensaver**: deshabilita el bloqueo de pantalla del salvapantallas.
- **broadcom-sta**: configura drivers WLAN broadcom-sta.
- **xserver-xorg**: configura xserver-xorg.
- **openssh-server**: recrea las claves de host de openssh-server.
- **hyperv**: configura ajustes de X11 para mejorar la compatibilidad en plataformas Microsoft Hyper-V.
- **ntfs3**: gestiona reglas udev para soporte NTFS3.
- **config-module-mode**: configura el modo de módulo del sistema y actualiza cachés, configuraciones de usuario y dpkg.
- **hooks**: permite ejecutar comandos arbitrarios desde un archivo ubicado en el medio live o un servidor http/ftp.

# ARCHIVOS

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `minios/config.conf`
- `minios/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/minios/config-hooks/*`
- `minios/config-hooks/*`
- `/minios/config-preseed/*`
- `minios/config-preseed/*`

# VÉASE TAMBIÉN

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PÁGINA WEB

Más información sobre **minios-live-config** y el proyecto MiniOS se puede encontrar en [minios.dev](https://minios.dev) y en el [repositorio de GitHub](https://github.com/minios-linux/minios-live).

# ERRORES

Los errores pueden reportarse abriendo un issue en el repositorio de GitHub en [MiniOS Issues](https://github.com/minios-linux/minios-live/issues).

# AUTOR

**live-config** fue escrito originalmente por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, el desarrollo ha continuado por el equipo de Debian Live. Desde 2025, el desarrollo de la versión modificada **minios-live-config** ha sido continuado por el equipo de MiniOS Live.
