---
updated: 2026-08-31
---

# Contenidos del paquete y edición

Los contenidos del paquete MiniOS se generan a partir de listas de fuentes condicionales. El conjunto final depende del suite de la distribución, la arquitectura, el sistema de inicio, el entorno de escritorio, el locale, las opciones del kernel y la disponibilidad del repositorio. Esta página documenta los paquetes visibles para el usuario solicitados por los manifiestos mantenidos de Flux y Xfce. Se omiten las toolchains solo de compilación y las dependencias que instala APT automáticamente.

`Yes` indica que el manifiesto actual solicita el paquete para esa edición.
`Conditional` significa que el nombre o la inclusión del paquete depende de una opción de compilación o de la plataforma de destino. Un guion indica que la edición no lo solicita.
La imagen final sigue siendo la referencia autorizada.

## Estructura de las ediciones

Las ediciones mantenidas de Xfce se construyen unas sobre otras: Standard es el escritorio compacto para el día a día, Toolbox está orientada a la administración profesional de sistemas, diagnóstico y recuperación, y Ultra convierte esa base en un escritorio completo para trabajo general, creatividad y desarrollo. Flux es una configuración independiente y ultraligera de Fluxbox para un uso mínimo de recursos y hardware antiguo; no es simplemente una lista reducida de paquetes de Xfce.

| Edición | Variante de paquete y entorno | Propósito principal |
|---|---|---|
| **Standard** | `standard` con `xfce` | Escritorio Xfce mínimo para uso diario con funcionalidad básica |
| **Toolbox** | `toolbox` con `xfce` | Administración profesional de sistemas, diagnóstico y recuperación |
| **Ultra** | `ultra` con `xfce` | Escritorio completo para trabajo general, creatividad y desarrollo |
| **Flux** | `minimum` con `flux` | Escritorio Fluxbox ultraligero para uso mínimo de recursos y hardware antiguo |

Otros entornos soportados tienen sus propias cadenas de módulos y deben revisarse por separado. En particular, la disponibilidad de paquetes en una compilación LXQt o de consola no debe inferirse de las tablas de Xfce que aparecen a continuación.

## Paquetes principales de MiniOS y del sistema

Estos paquetes proporcionan el entorno de ejecución del sistema en vivo, configuración, localización, gestión de privilegios y el entorno básico de línea de comandos.

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito o condición |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Sí | Sí | Sí | Sí | Creación, conversión, inspección, activación y captura de cambios de módulos |
| `minios-image-compose` | Sí | Sí | Sí | Sí | Composición de ISO de línea de comandos MiniOS |
| `minios-live-config` | Sí | Sí | Sí | Sí | Componentes de configuración de la sesión en vivo |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Condicional | Condicional | Condicional | Condicional | Integración con el sistema de inicio; se selecciona una implementación |
| `minios-live-config-doc` | Sí | Sí | Sí | Sí | Referencia de live-config instalado |
| `minios-welcome` | Sí | Sí | Sí | Sí | Página de bienvenida y lanzador de MiniOS |
| `user-setup` | Sí | Sí | Sí | Sí | Configuración de la cuenta de usuario en vivo |
| `linux-base` | Sí | Sí | Sí | Sí | Scripts comunes de imagen Linux y del sistema |
| `kbd`, `keyboard-configuration`, `console-setup` | Sí | Sí | Sí | Sí | Configuración de teclado y pantalla en consola |
| `locales` | Sí | Sí | Sí | Sí | Datos de locale y generación |
| `network-manager` | Sí | Sí | Sí | Sí | Gestión de conexiones de red |
| `netplan.io` | Condicional | Condicional | Condicional | Condicional | Solicitado solo en suites Ubuntu soportadas |
| `dracut-core` | Condicional | Condicional | Condicional | Condicional | Solicitado cuando Dracut es el generador de initramfs |
| `gpg`, `gnupg` | Sí | Sí | Sí | Sí | Herramientas de firma de paquetes y archivos |
| `file`, `cpio` | Sí | Sí | Sí | Sí | Identificación de archivos y manejo de archivos comprimidos |
| `gettext-base` / `gettext` | Condicional | Condicional | Condicional | Condicional | Utilidades de traducción seleccionadas según disponibilidad |
| `polkitd` / `policykit-1`, `pkexec` | Condicional | Condicional | Condicional | Condicional | Autorización y elevación de privilegios |
| `bash-completion` | Sí | Sí | Sí | Sí | Autocompletado de comandos en shell |
| `man-db` | Sí | Sí | Sí | Sí | Lector y base de datos de páginas de manual |
| `mc` | Sí | Sí | Sí | Sí | Gestor de archivos Midnight Commander |
| `gpm` | Sí | Sí | Sí | Sí | Soporte de ratón en consola |
| `ssh` | Sí | Sí | Sí | Sí | Paquetes cliente y servidor OpenSSH seleccionados por APT |
| `systemd-timesyncd` / `chrony` | Condicional | Condicional | Condicional | Condicional | Sincronización horaria seleccionada por suite y sistema de inicio |
| `tlp` | Sí | Sí | Sí | Sí | Gestión de energía para portátiles |

Algunos paquetes de paridad para bootstrap se solicitan solo para suites base específicas.
Son dependencias de implementación más que características de la edición y no se listan aquí de forma individual.

## Herramientas de red

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Sí | Sí | Sí | Sí | Autenticación inalámbrica WPA/WPA2 |
| `rfkill` | Sí | Sí | Sí | Sí | Control del estado de dispositivos inalámbricos |
| `usb-modeswitch` | Sí | Sí | Sí | Sí | Conmutación de módem USB y dispositivos multi-modo |
| `dnsmasq-base` | - | Sí | Sí | Sí | Soporte DNS y DHCP usado en flujos de trabajo de red |
| `cifs-utils` | - | Sí | Sí | Sí | Cliente de sistema de archivos en red SMB/CIFS |
| `nfs-common` | - | Sí | Sí | Sí | Soporte de cliente NFS |
| `ipset` | - | Sí | Sí | Sí | Administración de conjuntos IP del kernel |
| `whois` | - | Sí | Sí | Sí | Consulta de registro de dominios y direcciones |
| `netcat`, `netcat-openbsd` | - | - | Sí | Sí | Herramientas de prueba de flujo TCP y UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Sí | Sí | Descubrimiento de red, transferencia y comparación de escaneos |
| `iw` | - | - | Sí | Sí | Configuración de dispositivos y enlaces inalámbricos |
| `iperf3` | - | - | Sí | Sí | Prueba de rendimiento de red |
| `aria2` | - | - | Sí | Sí | Utilidad de descarga multiprotocolo |
| `davfs2` | - | - | Sí | Sí | Cliente de sistema de archivos WebDAV |
| `sshfs` | - | - | Sí | Sí | Acceso a sistemas de archivos por SSH |
| `open-iscsi` | - | - | - | Sí | Iniciador iSCSI |
| `tgt` | - | - | - | Sí | Servicio objetivo iSCSI |

## Almacenamiento y sistemas de archivos

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito o condición |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Sí | Sí | Sí | Sí | Inspección y ajuste de dispositivos ATA y SCSI |
| `mdadm` | Sí | Sí | Sí | Sí | Gestión de RAID por software en Linux |
| `smartmontools` | Sí | Sí | Sí | Sí | Monitorización y pruebas S.M.A.R.T. |
| `dosfstools` | Sí | Sí | Sí | Sí | Creación y comprobación de sistemas de archivos FAT |
| `ntfs-3g` | Sí | Sí | Sí | Sí | Controlador y herramientas NTFS en espacio de usuario |
| `btrfs-progs` | Sí | Sí | Sí | Sí | Administración de Btrfs |
| `xfsprogs` | - | Sí | Sí | Sí | Administración de XFS |
| `exfatprogs` / `exfat-utils` con `exfat-fuse` | - | Condicional | Condicional | Condicional | Implementación exFAT seleccionada según disponibilidad de paquetes |
| `fuse3` / `fuse`, `libfuse2` | - | Condicional | Condicional | Condicional | Entorno de ejecución FUSE y biblioteca de compatibilidad |
| `dynfilefs` | - | Condicional | Condicional | Condicional | Almacenamiento persistente segmentado en suites soportadas |
| `parted` | - | Sí | Sí | Sí | Creación y edición de tablas de particiones |
| `gpart` | - | - | Sí | Sí | Recuperación de tablas de particiones |
| `mtools` | - | - | Sí | Sí | Herramientas para FAT y medios DOS |
| `gddrescue` | - | - | Sí | Sí | Copia tolerante a fallos de dispositivos de bloques |
| `lvm2` | - | - | Sí | Sí | Gestor de volúmenes lógicos (LVM) |
| `cryptsetup` | - | - | Sí | Sí | Gestión de volúmenes LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Sí | Sí | Gestión y montaje de volúmenes cifrados |
| `f2fs-tools` | - | - | Sí | Sí | Administración de F2FS |
| `hfsutils`, `hfsprogs` | - | - | Sí | Sí | Herramientas HFS y HFS+, donde estén disponibles |
| `jfsutils` | - | - | Sí | Sí | Administración de JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Sí | Sí | Herramientas para ReiserFS y Reiser4, donde estén disponibles |
| `udftools` | - | - | Sí | Sí | Herramientas para sistemas de archivos ópticos UDF |
| `nilfs-tools` | - | - | Sí | Sí | Administración de NILFS2 |
| `zfsutils-linux` | - | - | Condicional | Condicional | Herramientas ZFS en espacio de usuario cuando el kernel soporta ZFS |

## Archivos comprimidos y formatos de imagen

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito o condición |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Sí | Sí | Sí | Sí | Compresión utilizada por paquetes, módulos e imágenes |
| `zip`, `unzip` | Sí | Sí | Sí | Sí | Creación y extracción de archivos ZIP |
| `xorriso` | Sí | Sí | Sí | Sí | Creación e inspección de imágenes ISO |
| `squashfs-tools` | Sí | Sí | Sí | Sí | Creación y extracción de módulos SquashFS |
| `lz4` / `liblz4-tools` | - | Condicional | Condicional | Condicional | Implementación LZ4 seleccionada según disponibilidad |
| `bzip2` | - | Sí | Sí | Sí | Compresión bzip2 |
| `7zip` | - | Sí | Sí | Sí | Formatos de archivo 7z y relacionados |
| `genisoimage` | - | Sí | Sí | Sí | Creación de imágenes ISO-9660 |
| `pv` | - | - | Sí | Sí | Visualización de progreso en pipelines |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Sí | Sí | Herramientas de compresión en paralelo |
| `lrzip`, `lzop` | - | - | Sí | Sí | Formatos de compresión adicionales |
| `cabextract` | - | - | Sí | Sí | Extracción de archivos Microsoft Cabinet |
| `xmount` | - | - | Sí | Sí | Conversión y montaje de formatos de imagen de disco |

## Recuperación, diagnóstico y rendimiento

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Sí | Sí | Sí | Sí | Inspección de dispositivos PCI y USB |
| `psmisc` | Sí | Sí | Sí | Sí | Herramientas de procesos como `fuser` y `killall` |
| `htop` | - | Sí | Sí | Sí | Monitor de procesos interactivo |
| `ncdu` | - | Sí | Sí | Sí | Analizador de uso de disco en terminal |
| `lsof` | - | Sí | Sí | Sí | Inspección de archivos abiertos y procesos |
| `clonezilla` | - | - | Sí | Sí | Flujos de trabajo de clonación de discos y particiones |
| `partclone`, `partimage` | - | - | Sí | Sí | Herramientas de imagen con reconocimiento de sistemas de archivos |
| `testdisk` | - | - | Sí | Sí | Recuperación de particiones y archivos |
| `chntpw`, `reglookup` | - | - | Sí | Sí | Herramientas offline para cuentas y registro de Windows |
| `hexedit` | - | - | Sí | Sí | Editor hexadecimal en terminal |
| `lshw`, `inxi` | - | - | Sí | Sí | Informes detallados de hardware y sistema |
| `screen` | - | - | Sí | Sí | Multiplexor de terminal |
| `nmon` | - | - | Sí | Sí | Monitor de rendimiento interactivo |
| `fio`, `bonnie++`, `iozone3` | - | - | Sí | Sí | Pruebas de rendimiento de almacenamiento y sistemas de archivos |
| `stress`, `sysbench` | - | - | Sí | Sí | Pruebas de CPU, memoria y sistema |
| `memtest86+` | - | - | Sí | Sí | Prueba de memoria en arranque |
| `rsync` | - | - | Sí | Sí | Utilidad de sincronización y copia de archivos |

## Virtualización y contenedores

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito o condición |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Sí | Sí | Integración de invitados VMware y QEMU |
| `virtualbox-guest-utils` | - | - | Condicional | Condicional | Integración de invitados VirtualBox en suites seleccionadas |
| `hyperv-daemons` | - | - | Sí | Sí | Servicios de invitado Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Sí | Sí | Herramientas de ejecución e imagen de máquinas virtuales |
| `libvirt-daemon-system` | - | - | Sí | Sí | Servicio libvirt del sistema |
| `virt-what` | - | - | Sí | Sí | Detección de hipervisores |
| `uidmap` | - | - | - | Sí | Asignación de ID de espacio de nombres de usuario |
| Docker CE stack / `docker.io` con `docker-compose` | - | - | - | Condicional | Entorno de ejecución de contenedores seleccionado del repositorio disponible |
| `lazydocker` | - | - | - | Sí | Interfaz de terminal para Docker |
| `selinux-policy-default` | - | - | - | Sí | Paquete de política SELinux por defecto |

## Firmware y controladores del kernel

La selección de firmware sigue el perfil de la distribución: las compilaciones de Debian y Devuan utilizan paquetes de firmware divididos, mientras que las compilaciones de Ubuntu usan `linux-firmware`. Los controladores DKMS también se filtran según la arquitectura, el proveedor del kernel, la serie del kernel y las funciones ya incluidas en el kernel seleccionado.

| Paquete | Ediciones | Propósito o condición |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Condicional, todas | Colecciones de firmware de Debian y Devuan |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Condicional, todas | Firmware inalámbrico para dispositivos Atheros, Intel y ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Condicional, todas | Firmware Realtek y MediaTek; MediaTek depende del suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Condicional, todas | Firmware de red Broadcom y Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Condicional, todas | Familias adicionales de firmware inalámbrico |
| `firmware-b43-installer` | Condicional, todas | Instalador de firmware Broadcom B43 heredado |
| `firmware-sof-signed` | Condicional, todas | Imágenes de Sound Open Firmware |
| `linux-firmware` | Condicional, todas | Colección de firmware de Ubuntu |
| `ntfs3-dkms` | Condicional, todas | Controlador NTFS3 cuando no está presente en el kernel seleccionado |
| `aufs-dkms` / `aufs-ng-dkms` | Condicional, todas | Controlador AUFS seleccionado por suite y kernel |
| `broadcom-sta-dkms` | Condicional, todas | Controlador inalámbrico Broadcom STA en objetivos soportados |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Condicional, todas | Controladores inalámbricos de fabricante filtrados por capacidades del kernel y plataforma de destino |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Condicional, todas | Controladores de fabricante retenidos en objetivos soportados para dispositivos o funciones adicionales |
| `zfs-dkms` | Condicional, Toolbox y Ultra | Módulo de kernel ZFS en compilaciones amd64 soportadas |

## Base gráfica

Los entornos gráficos comparten la base de Xorg y renderizado que se muestra a continuación. Flux utiliza su propia lista de escritorio; Standard, Toolbox y Ultra utilizan la lista mantenida de Xfce.

| Paquete | Flux | Standard | Toolbox | Ultra | Propósito o condición |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Sí | Sí | Sí | Sí | Servidor X.Org y herramientas de inicio |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Sí | Sí | Sí | Sí | Controladores de video para X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Sí | Sí | Sí | Sí | Controladores de entrada y soporte de inicio heredado |
| `xterm` | Sí | Sí | Sí | Sí | Terminal básico para X |
| `blackbox` / `openbox` | Condicional | Condicional | Condicional | Condicional | Gestor de ventanas ligero de respaldo seleccionado por entorno |
| `x11-utils`, `wmctrl`, `xdotool` | Sí | Sí | Sí | Sí | Inspección X11 y automatización de ventanas |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Sí | Sí | Sí | Sí | Bibliotecas de renderizado DRM y Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Sí | Sí | Sí | Sí | Temas de cursor e iconos |
| `elementary-minios-icon-theme` | Sí | Sí | Sí | Sí | Tema de iconos MiniOS fuera de LXQt |
| `librsvg2-common` | Sí | Sí | Sí | Sí | Soporte de renderizado SVG |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Condicional | Condicional | Condicional | Condicional | Agente gráfico de PolicyKit seleccionado por disponibilidad |
| `xrdp`, `xorgxrdp` | - | - | Sí | Sí | Inicio de sesión gráfico remoto vía RDP |

## Escritorio Flux y aplicaciones

| Paquete | Propósito o condición |
|---|---|
| `fluxbox-flux` | Configuración del gestor de ventanas Fluxbox de MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Panel e indicador de distribución de teclado |
| `xwallpaper`, `gpicview` / `feh` | Fondo de pantalla y visualización de imágenes |
| `compton` | Compositor X |
| `alsa-utils`, `volumeicon-alsa` | Controles de audio ALSA |
| `systrayicon`, `cbatticon` | Indicadores de bandeja y batería |
| `xlunch`, `gtkask`, `flux-tools` | Lanzador y asistentes del escritorio Flux de MiniOS |
| `scrot` | Herramienta de capturas de pantalla |
| `mousepad`, `pcmanfm` | Editor de texto y gestor de archivos |
| `galculator`, `lxtask`, `xarchiver` | Calculadora, gestor de tareas y gestor de archivos comprimidos |
| `network-manager-gnome` | Applet de escritorio de NetworkManager |
| `firefox` / `firefox-esr` | Navegador seleccionado por suite, con paquetes de idioma seleccionados |

## Escritorio Xfce y aplicaciones MiniOS

| Paquete | Standard | Toolbox | Ultra | Propósito o condición |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Sí | Sí | Sí | Gestor de archivos e integración de medios extraíbles |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Sí | Sí | Sí | Panel, sesión y servicios de configuración de Xfce |
| `xfdesktop4`, `xfwm4`, `xfconf` | Sí | Sí | Sí | Escritorio, gestor de ventanas y servicio de configuración |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Sí | Sí | Sí | Buscador de aplicaciones e indicador de teclado |
| `mousepad`, `ristretto` | Sí | Sí | Sí | Editor de texto y visor de imágenes |
| `at-spi2-core`, `dbus-x11` | Sí | Sí | Sí | Soporte de accesibilidad y bus de mensajes de escritorio |
| `gvfs-backends` | Sí | Sí | Sí | Integración de sistemas de archivos remotos y extraíbles en el gestor de archivos |
| `lightdm`, `lightdm-gtk-greeter` | Sí | Sí | Sí | Gestor gráfico de inicio de sesión |
| `network-manager-gnome`, `blueman` | Sí | Sí | Sí | Controles de red y Bluetooth en el escritorio |
| `avahi-daemon` | Sí | Sí | Sí | Descubrimiento de servicios en red local |
| PipeWire stack / PulseAudio stack | Condicional | Condicional | Condicional | Audio de escritorio seleccionado por suite |
| `pavucontrol` | Sí | Sí | Sí | Mezclador de audio gráfico |
| `engrampa`, `thunar-archive-plugin` | Sí | Sí | Sí | Gestor de archivos comprimidos e integración con el gestor de archivos |
| `xfce4-screensaver`, `xfce4-screenshooter` | Sí | Sí | Sí | Bloqueo de pantalla y capturas de pantalla |
| `xfce4-power-manager-plugins` | Sí | Sí | Sí | Integración de gestión de energía de Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Sí | Sí | Sí | Gestor de tareas y emulador de terminal |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Sí | Sí | Sí | Menú de aplicaciones y notificaciones |
| `minios-configurator` | Sí | Sí | Sí | Editor gráfico de configuración de arranque y sesión de MiniOS |
| `minios-installer` | Sí | Sí | Sí | Instalador gráfico y `minios-deploy` CLI |
| `minios-session-manager` | Sí | Sí | Sí | Gestor de sesiones persistentes y `minios-session` CLI |
| `minios-kernel-manager` | Sí | Sí | Sí | Gestor modular de kernel y `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Sí | Sí | Sí | Catálogo de aplicaciones MiniOS e instalador |
| `minios-image-builder` | Sí | Sí | Sí | Espacio de trabajo gráfico para remasterización de ISOs |
| `minios-module-manager` | Sí | Sí | Sí | Gestor gráfico de módulos `.sb` |
| `minios-help` | Sí | Sí | Sí | Visor de documentación instalada de MiniOS |
| `driveutility` | Sí | Sí | Sí | Escritura, lectura, formateo y borrado de imágenes de disco |
| `firefox` / `firefox-esr` | Condicional | Condicional | Condicional | Navegador y localización seleccionados por suite e idioma |
| `menulibre` | - | Sí | Sí | Editor gráfico de menús |
| `open-vm-tools-desktop` | - | Sí | Sí | Integración de escritorio VMware |
| `virtualbox-guest-x11` | - | Condicional | Condicional | Integración de escritorio VirtualBox en suites seleccionadas |
| Qt GTK platform themes | - | Sí | Sí | Integración de apariencia GTK para aplicaciones Qt |

## Aplicaciones gráficas de Toolbox

El módulo `05-apps` de Xfce se incluye en Toolbox y Ultra y se omite en Standard.

| Paquete | Propósito o condición |
|---|---|
| `gparted` | Editor de particiones gráfico |
| `gsmartcontrol`, `qdiskinfo` | Diagnóstico de discos y obtención de información de dispositivos |
| `guymager`, `qphotorec` | Imagen forense y recuperación de archivos; `qphotorec` se excluye en Buster y Beowulf |
| `kdiskmark` | Prueba de rendimiento de discos |
| `isomaster` | Editor de imágenes ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnóstico de hardware y gráficos |
| `baobab` | Analizador gráfico de uso de disco |
| `doublecmd-gtk` | Gestor de archivos de dos paneles |
| `grsync` | Interfaz gráfica para `rsync` |
| `bleachbit` | Limpieza de caché y archivos temporales |
| `czkawka` / `czkawka-gui` | Buscador de archivos duplicados y no deseados |
| `gtkhash` | Calculadora de sumas de verificación |
| `wxhexeditor` | Editor hexadecimal para archivos grandes |
| `keepassxc` | Gestor de contraseñas |
| `veracrypt` | Gestión de contenedores y discos cifrados; excluido en Buster y Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Herramientas gráficas para volúmenes cifrados |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gestión de máquinas virtuales y soporte de pantalla SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Cliente de escritorio remoto |
| `wireshark`, `zenmap`, `gnome-nettool` | Análisis y diagnóstico de red con interfaz gráfica |
| `x11vnc` | Acceso VNC a la sesión X actual |
| `uget` | Gestor de descargas gráfico |
| `android-file-transfer` | Transferencia de archivos MTP de Android |
| `vlc` y plugins seleccionados | Reproducción multimedia, localización, soporte Samba y BitTorrent |
| `pdfarranger` | Organización de páginas PDF |
| `codium` | Editor de código |
| `onboard` | Teclado en pantalla |
| `galculator` | Calculadora |

## Aplicaciones Ultra

Ultra incluye todas las aplicaciones de Toolbox y añade:

| Paquete | Propósito |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suite ofimática e integración con el escritorio |
| `gimp` | Editor de gráficos rasterizados |
| `inkscape` | Editor de gráficos vectoriales |
| `blender` | Suite de creación 3D |
| `audacity` | Editor de audio |
| `obs-studio`, `obs-plugins` | Grabación y transmisión de pantalla |
| `rawtherapee` | Procesador de fotos RAW |
| `synaptic` | Gestor gráfico de paquetes |
| `eddy`, `eddy-handler` | Instalador de paquetes Debian local, donde esté disponible |
| `fonts-open-sans` | Familia de fuentes Open Sans |

## Inspeccionar paquetes instalados

El sistema en ejecución es la referencia para los paquetes que realmente se han instalado.
Lista los nombres y versiones de los paquetes con:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifiestos de compilación desde fuente

Las tablas de paquetes anteriores se derivan del [sistema de compilación `minios-live`](https://github.com/minios-linux/minios-live). Las rutas que aparecen a continuación son relativas a la raíz de ese repositorio fuente y son relevantes al construir o personalizar una imagen desde el código fuente:

- `linux-live/environments/<environment>/` define la cadena de módulos ordenada.
- `linux-live/scripts/00-core/packages.list` define la base compartida y las adiciones de variantes de paquetes.
- `linux-live/scripts/01-kernel/packages.list` define la compilación condicional del kernel y los paquetes DKMS.
- `linux-live/scripts/02-firmware/packages.list` define el firmware específico de la distribución.
- `linux-live/scripts/03-gui-base/packages.list` define la base gráfica compartida.
- `linux-live/scripts/04-flux-desktop/packages.list` y `05-flux-apps/packages.list` definen Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` define Xfce y las herramientas de escritorio MiniOS.
- `linux-live/scripts/05-apps/packages.list` define las aplicaciones gráficas de Toolbox y Ultra.
- `linux-live/scripts/10-firefox/packages.list` define los paquetes de navegador específicos por suite y locale.
- Cada archivo `install` y `skip_conditions.conf` de un módulo determina si y cómo se usa su lista de paquetes.
- `linux-live/build.conf` selecciona el suite, arquitectura, entorno, variante de paquete, sistema de inicio, kernel y locale.
- `linux-live/condinapt.map` define los prefijos condicionales de listas de paquetes.

Las listas de fuentes describen los paquetes solicitados y sus alternativas. Solo la imagen final y `dpkg-query` muestran el conjunto de dependencias resueltas y las versiones exactas para una versión en particular.

Consulta [Arquitectura del sistema](/reference/System-Architecture) para el orden de los módulos y [CondinAPT en MiniOS](/development/CondinAPT) para la selección condicional de paquetes.
