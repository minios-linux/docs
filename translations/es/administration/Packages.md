# Lista de Paquetes de MiniOS

Este documento ofrece una visión completa de todos los paquetes incluidos en las diferentes ediciones de MiniOS. MiniOS está disponible en tres ediciones principales, cada una con un conjunto distinto de software preinstalado:

- **Estándar** - Sistema mínimo con funcionalidad básica
- **Herramientas** - Utilidades de administración y diagnóstico del sistema
- **Ultra** - Entorno de escritorio completo con aplicaciones

## Utilidades de consola y paquetes del sistema

### ⚙️ Paquetes principales del sistema

| Paquete                        | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                   |
| :----------------------------- | :------: | :----------: | :---: | :---------------------------------------------------------- |
| minios-tools                   |    ✅     |    ✅        |   ✅   | Herramientas y scripts esenciales para MiniOS.              |
| minios-welcome                 |    ✅     |    ✅        |   ✅   | Mensaje de bienvenida en el navegador.                      |
| minios-live-config             |    ✅     |    ✅        |   ✅   | Scripts de configuración para el sistema Live.               |
| minios-live-config-systemd     |    ✅     |    ✅        |   ✅   | Configuración del sistema Live para systemd.                 |
| minios-live-config-doc         |    ✅     |    ✅        |   ✅   | Documentación para minios-live-config.                       |
| user-setup                     |    ✅     |    ✅        |   ✅   | Utilidad para la configuración de usuarios.                  |
| linux-base                     |    ✅     |    ✅        |   ✅   | Scripts base para el sistema Linux.                          |
| kbd                            |    ✅     |    ✅        |   ✅   | Utilidades para gestionar la distribución del teclado en consola. |
| keyboard-configuration         |    ✅     |    ✅        |   ✅   | Sistema de configuración de teclado.                         |
| locales                        |    ✅     |    ✅        |   ✅   | Bibliotecas y datos para localización (soporte de idiomas).  |
| console-setup                  |    ✅     |    ✅        |   ✅   | Configuración de fuente y codificación de la consola.        |
| systemd-timesyncd              |    ✅     |    ✅        |   ✅   | Servicio para la sincronización horaria por red.             |
| polkitd / policykit-1 / pkexec |    ✅     |    ✅        |   ✅   | Framework para gestionar privilegios de servicios del sistema.|

### 📦 Gestión de paquetes y software

| Paquete             | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                         |
| :------------------ | :------: | :----------: | :---: | :--------------------------------------------------------------- |
| apt-transport-https |    ✅     |    ✅        |   ✅   | Permite el uso de repositorios a través del protocolo HTTPS.      |
| gettext-base        |    ✅     |    ✅        |   ✅   | Utilidades para internacionalización y localización de software.  |
| man-db              |    ✅     |    ✅        |   ✅   | Sistema para visualizar páginas de manual (man).                  |
| bash-completion     |    ✅     |    ✅        |   ✅   | Proporciona autocompletado de comandos en la terminal Bash.       |

### 🌐 Utilidades de red

| Paquete                   | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                       |
| :------------------------ | :------: | :----------: | :---: | :-------------------------------------------------------------- |
| network-manager / connman |    ✅     |    ✅        |   ✅   | Gestores de conexiones de red.                                  |
| dnsmasq-base              |    ✅     |    ✅        |   ✅   | Servidor DNS y DHCP ligero (archivos base).                     |
| wpasupplicant             |    ✅     |    ✅        |   ✅   | Utilidad para conectarse a redes Wi-Fi seguras (WPA/WPA2).      |
| iputils-ping              |    ✅     |    ✅        |   ✅   | Utilidad `ping` para comprobar la disponibilidad de hosts.       |
| ssh                       |    ✅     |    ✅        |   ✅   | Cliente y servidor para conexiones remotas seguras (SSH).        |
| wget                      |    ✅     |    ✅        |   ✅   | Utilidad para descargar archivos desde la red.                   |
| curl                      |    ✅     |    ✅        |   ✅   | Utilidad para transferir datos usando varios protocolos.         |
| ipset                     |    ✅     |    ✅        |   ✅   | Utilidad para administrar conjuntos de direcciones IP en el kernel. |
| whois                     |    ✅     |    ✅        |   ✅   | Cliente para obtener información de dominios y direcciones IP.   |
| nmap                      |    ❌     |    ✅        |   ✅   | Potente escáner de red y herramienta de auditoría de seguridad.  |
| ncat                      |    ❌     |    ✅        |   ✅   | Versión mejorada de `netcat` de la suite nmap.                  |
| ndiff                     |    ❌     |    ✅        |   ✅   | Utilidad para comparar resultados de escaneos de nmap.           |
| iperf3                    |    ❌     |    ✅        |   ✅   | Herramienta para medir el ancho de banda de red.                 |
| netcat                    |    ❌     |    ✅        |   ✅   | Utilidad de red para leer/escribir datos por TCP/IP.             |
| netcat-openbsd            |    ❌     |    ✅        |   ✅   | Implementación alternativa de `netcat` de OpenBSD.               |
| open-iscsi                |    ❌     |    ❌        |   ✅   | Cliente (iniciador) para trabajar con almacenamiento iSCSI.      |
| tgt                       |    ❌     |    ❌        |   ✅   | Servidor (objetivo) para ofrecer almacenamiento iSCSI.           |

### 💾 Gestión de discos y sistemas de archivos

| Paquete        | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                         |
| :------------- | :------: | :----------: | :---: | :--------------------------------------------------------------- |
| parted         |    ✅     |    ✅        |   ✅   | Programa para crear y modificar particiones de disco.            |
| dosfstools     |    ✅     |    ✅        |   ✅   | Utilidades para crear y comprobar sistemas de archivos FAT.      |
| ntfs-3g        |    ✅     |    ✅        |   ✅   | Controlador para leer y escribir en particiones NTFS.            |
| mdadm          |    ✅     |    ✅        |   ✅   | Utilidad para gestionar arreglos RAID por software.              |
| hdparm         |    ✅     |    ✅        |   ✅   | Utilidad para configurar y ver parámetros de discos duros.       |
| sdparm         |    ✅     |    ✅        |   ✅   | Utilidad para acceder a parámetros de dispositivos SCSI/SATA/SAS.|
| btrfs-progs    |    ✅     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos Btrfs.       |
| xfsprogs       |    ✅     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos XFS.         |
| exfat-utils    |    ✅     |    ✅        |   ✅   | Utilidades para exFAT (implementación heredada).                 |
| exfat-fuse     |    ✅     |    ✅        |   ✅   | Módulo FUSE para soporte de exFAT.                              |
| exfatprogs     |    ✅     |    ✅        |   ✅   | Utilidades para crear y comprobar sistemas de archivos exFAT.    |
| cifs-utils     |    ✅     |    ✅        |   ✅   | Utilidades para montar recursos compartidos de red Windows (Samba/CIFS). |
| nfs-common     |    ✅     |    ✅        |   ✅   | Archivos comunes para soporte de NFS (cliente).                  |
| smartmontools  |    ✅     |    ✅        |   ✅   | Utilidades para monitorizar el estado de discos vía S.M.A.R.T.   |
| gpart          |    ❌     |    ✅        |   ✅   | Utilidad para "adivinar" la tabla de particiones en discos dañados. |
| mtools         |    ❌     |    ✅        |   ✅   | Conjunto de utilidades para acceder a disquetes y particiones MS-DOS. |
| gddrescue      |    ❌     |    ✅        |   ✅   | Herramienta para copiar datos desde medios dañados.              |
| zfsutils-linux |    ❌     |    ✅        |   ✅   | Utilidades para gestionar pools y sistemas de archivos ZFS.      |
| davfs2         |    ❌     |    ✅        |   ✅   | Permite montar recursos WebDAV como sistema de archivos local.   |
| f2fs-tools     |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos F2FS.        |
| hfsutils       |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos Apple "clásico" (HFS). |
| hfsprogs       |    ❌     |    ✅        |   ✅   | Utilidades para crear y comprobar sistemas de archivos HFS+.     |
| jfsutils       |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos JFS.         |
| reiserfsprogs  |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos ReiserFS (v3). |
| reiser4progs   |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos Reiser4.     |
| udftools       |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos UDF (DVD/Blu-ray). |
| nilfs-tools    |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con el sistema de archivos NILFS2 estructurado por registros. |
| sshfs          |    ❌     |    ✅        |   ✅   | Monta sistemas de archivos remotos por SSH.                     |
| lvm2           |    ❌     |    ✅        |   ✅   | Gestor de volúmenes lógicos.                                    |
| cryptsetup     |    ❌     |    ✅        |   ✅   | Utilidad para configurar particiones cifradas (LUKS).           |
| zulucrypt-cli  |    ❌     |    ✅        |   ✅   | CLI para gestionar volúmenes cifrados (LUKS, VeraCrypt, etc.).  |
| zulumount-cli  |    ❌     |    ✅        |   ✅   | CLI para montar volúmenes gestionados por zulucrypt.            |

### 💻 Utilidades del sistema y monitorización

| Paquete        | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                             |
| :------------- | :------: | :----------: | :---: | :------------------------------------------------------------------- |
| pciutils       |    ✅     |    ✅        |   ✅   | Utilidades para ver información de dispositivos PCI.                  |
| usbutils       |    ✅     |    ✅        |   ✅   | Utilidades para ver información de dispositivos USB.                  |
| psmisc         |    ✅     |    ✅        |   ✅   | Conjunto de utilidades para trabajar con procesos (`fuser`, `killall`).|
| lsof           |    ✅     |    ✅        |   ✅   | Muestra qué archivos están siendo usados por qué procesos.            |
| htop           |    ✅     |    ✅        |   ✅   | Monitor de procesos interactivo.                                      |
| rfkill         |    ✅     |    ✅        |   ✅   | Herramienta para activar/desactivar dispositivos inalámbricos.        |
| file           |    ✅     |    ✅        |   ✅   | Determina el tipo de archivo.                                         |
| usb-modeswitch |    ✅     |    ✅        |   ✅   | Cambia el modo de dispositivos USB (por ejemplo, módems).             |
| ncdu           |    ✅     |    ✅        |   ✅   | Analizador de uso de disco con interfaz ncurses.                      |
| lshw           |    ❌     |    ✅        |   ✅   | Muestra información detallada del hardware.                           |
| screen         |    ❌     |    ✅        |   ✅   | Multiplexor de terminal, permite gestionar sesiones.                  |
| nmon           |    ❌     |    ✅        |   ✅   | Utilidad para monitorizar el rendimiento del sistema.                 |
| inxi           |    ❌     |    ✅        |   ✅   | Script para recolectar y mostrar información detallada del sistema.   |

### 🗜️ Compresores y archivadores

| Paquete      | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                         |
| :----------- | :------: | :----------: | :---: | :--------------------------------------------------------------- |
| zip          |    ✅     |    ✅        |   ✅   | Archivador para crear y extraer archivos .zip.                   |
| unzip        |    ✅     |    ✅        |   ✅   | Utilidad para extraer archivos .zip.                             |
| xz-utils     |    ✅     |    ✅        |   ✅   | Utilidades para compresión de datos usando el algoritmo LZMA/XZ. |
| zstd         |    ✅     |    ✅        |   ✅   | Utilidad para compresión de datos con Zstandard.                 |
| lz4          |    ✅     |    ✅        |   ✅   | Utilidad para compresión de datos muy rápida.                    |
| liblz4-tools |    ✅     |    ✅        |   ✅   | Herramientas adicionales para el formato lz4.                    |
| bzip2        |    ✅     |    ✅        |   ✅   | Utilidad para compresión de datos con el algoritmo bzip2.        |
| 7zip         |    ✅     |    ✅        |   ✅   | Potente archivador con soporte para muchos formatos, incluido 7z.|
| pv           |    ❌     |    ✅        |   ✅   | Utilidad para monitorizar el progreso de transferencia de datos por pipe. |
| pigz         |    ❌     |    ✅        |   ✅   | Implementación paralela (multi-hilo) de gzip.                    |
| pixz         |    ❌     |    ✅        |   ✅   | Implementación paralela e indexable de xz.                       |
| plzip        |    ❌     |    ✅        |   ✅   | Implementación paralela de lzip.                                 |
| lrzip        |    ❌     |    ✅        |   ✅   | Archivador de largo alcance, eficiente para archivos grandes.     |
| lzop         |    ❌     |    ✅        |   ✅   | Utilidad de compresión muy rápida.                               |
| pbzip2       |    ❌     |    ✅        |   ✅   | Implementación paralela de bzip2.                                |
| cabextract   |    ❌     |    ✅        |   ✅   | Utilidad para extraer archivos .cab de Microsoft.                |

### 🕵️ Recuperación y forense

| Paquete    | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                |
| :--------- | :------: | :----------: | :---: | :------------------------------------------------------ |
| clonezilla |    ❌     |    ✅        |   ✅   | Herramienta para clonar discos y realizar copias de seguridad. |
| testdisk   |    ❌     |    ✅        |   ✅   | Utilidad para recuperar particiones y archivos eliminados.     |
| chntpw     |    ❌     |    ✅        |   ✅   | Utilidad para restablecer contraseñas de Windows.              |
| reglookup  |    ❌     |    ✅        |   ✅   | Utilidad para leer y analizar el registro de Windows.          |
| hexedit    |    ❌     |    ✅        |   ✅   | Editor hexadecimal simple para consola.                        |

### ☁️ Virtualización y contenedores

| Paquete                | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                       |
| :--------------------- | :------: | :----------: | :---: | :-------------------------------------------------------------- |
| open-vm-tools          |    ❌     |    ✅        |   ✅   | Conjunto de utilidades para mejor integración con VMware.        |
| hyperv-daemons         |    ❌     |    ✅        |   ✅   | Servicios para integración con el hipervisor Microsoft Hyper-V.  |
| qemu-system-x86        |    ❌     |    ✅        |   ✅   | Emulador para ejecutar sistemas operativos x86/x86_64.           |
| qemu-utils             |    ❌     |    ✅        |   ✅   | Utilidades para trabajar con imágenes de disco QEMU.             |
| libvirt-daemon-system  |    ❌     |    ✅        |   ✅   | Dæmon para gestionar máquinas virtuales.                         |
| virt-what              |    ❌     |    ✅        |   ✅   | Script para detectar si el sistema se ejecuta en una VM.         |
| uidmap                 |    ❌     |    ❌        |   ✅   | Utilidades para trabajar con espacios de nombres de usuario.     |
| docker.io              |    ❌     |    ❌        |   ✅   | Plataforma de contenedores de aplicaciones.                      |
| docker-compose         |    ❌     |    ❌        |   ✅   | Herramienta para gestionar aplicaciones Docker multicontenedor.  |
| lazydocker             |    ❌     |    ❌        |   ✅   | Interfaz de terminal para gestionar Docker y Docker Compose.     |
| selinux-policy-default |    ❌     |    ❌        |   ✅   | Política de seguridad SELinux por defecto.                      |

### 🧩 Misceláneos

| Paquete        | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                                                  |
| :------------- | :------: | :----------: | :---: | :---------------------------------------------------------------------------------------- |
| mc             |    ✅     |    ✅        |   ✅   | Gestor de archivos Midnight Commander.                                                    |
| gpg            |    ✅     |    ✅        |   ✅   | GNU Privacy Guard - utilidad de cifrado y firmado.                                        |
| gnupg          |    ✅     |    ✅        |   ✅   | Suite completa de GNU Privacy Guard.                                                      |
| squashfs-tools |    ✅     |    ✅        |   ✅   | Utilidades para crear y extraer imágenes SquashFS.                                        |
| xorriso        |    ✅     |    ✅        |   ✅   | Utilidad para crear y grabar imágenes ISO-9660.                                           |
| genisoimage    |    ✅     |    ✅        |   ✅   | Crea imágenes de sistema de archivos ISO-9660.                                            |
| eject          |    ✅     |    ✅        |   ✅   | Utilidad para expulsar medios extraíbles (CD/DVD/USB).                                    |
| fuse3 / fuse   |    ✅     |    ✅        |   ✅   | Framework para crear sistemas de archivos en espacio de usuario.                          |
| libfuse2       |    ✅     |    ✅        |   ✅   | Biblioteca de compatibilidad para aplicaciones FUSE heredadas.                            |
| memtest86+     |    ❌     |    ✅        |   ✅   | Programa para probar la memoria RAM.                                                      |
| xmount         |    ❌     |    ✅        |   ✅   | Herramienta para montar imágenes de disco de varios formatos.                             |
| aria2          |    ❌     |    ✅        |   ✅   | Gestor de descargas multiprotocolo.                                                       |
| fio            |    ❌     |    ✅        |   ✅   | Herramienta avanzada para pruebas de rendimiento de disco (Flexible I/O Tester).          |
| bonnie++       |    ❌     |    ✅        |   ✅   | Benchmark para pruebas de rendimiento de sistemas de archivos.                            |
| iozone3        |    ❌     |    ✅        |   ✅   | Benchmark para pruebas de rendimiento de disco.                                           |
| stress         |    ❌     |    ✅        |   ✅   | Herramienta para generar carga en el sistema (CPU, memoria, I/O).                        |
| sysbench       |    ❌     |    ✅        |   ✅   | Benchmark integral para pruebas de CPU, memoria, I/O y bases de datos.                   |

## Firmware y controladores

### 📦 Controladores (DKMS)

| Paquete                 | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                                                                  |
| :---------------------- | :------: | :----------: | :---: | :-------------------------------------------------------------------------------------------------------- |
| broadcom-sta-dkms       |    ✅     |    ✅        |   ✅   | Controlador propietario Broadcom 802.11 STA para tarjetas Wi-Fi. Requerido por muchos portátiles con chips Broadcom. |
| zfs-dkms                |    ❌     |    ✅        |   ✅   | Módulos del kernel para soporte del sistema de archivos ZFS.                                              |
| realtek-rtl8821au-dkms  |    ✅     |    ✅        |   ✅   | Controlador DKMS para chipsets Wi-Fi Realtek RTL8812AU/8821AU.                                            |
| realtek-rtl88xxau-dkms  |    ✅     |    ✅        |   ✅   | Controlador DKMS para varias series de chipsets Wi-Fi Realtek RTL88xxAU.                                  |
| realtek-rtl8188eus-dkms |    ✅     |    ✅        |   ✅   | Controlador DKMS para chipsets Wi-Fi Realtek RTL8188EUS.                                                  |
| realtek-rtl8814au-dkms  |    ✅     |    ✅        |   ✅   | Controlador DKMS para chipsets Wi-Fi Realtek RTL8814AU.                                                   |

### 🔌 Firmware

| Paquete                  | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                                  |
| :----------------------- | :------: | :----------: | :---: | :----------------------------------------------------------------------- |
| firmware-linux-free      |    ✅     |    ✅        |   ✅   | Colección de firmware libre (en cuanto a licencia) para varios dispositivos. |
| firmware-linux-nonfree   |    ✅     |    ✅        |   ✅   | Metapaquete que incluye todo el firmware no libre (propietario).           |
| firmware-atheros         |    ✅     |    ✅        |   ✅   | Firmware para tarjetas de red inalámbricas con chips Atheros.               |
| firmware-iwlwifi         |    ✅     |    ✅        |   ✅   | Firmware para tarjetas de red Intel Wireless (Wi-Fi).                       |
| firmware-zd1211          |    ✅     |    ✅        |   ✅   | Firmware para dispositivos Wi-Fi basados en ZyDAS ZD1211/ZD1211B.           |
| firmware-realtek         |    ✅     |    ✅        |   ✅   | Firmware para varios dispositivos Realtek (tarjetas de red, Bluetooth, etc.).|
| firmware-bnx2            |    ✅     |    ✅        |   ✅   | Firmware para adaptadores de red Broadcom NetXtreme II.                     |
| firmware-brcm80211       |    ✅     |    ✅        |   ✅   | Firmware para tarjetas inalámbricas Broadcom/Cypress 802.11.                |
| firmware-cavium          |    ✅     |    ✅        |   ✅   | Firmware para procesadores y adaptadores de red Cavium.                     |
| firmware-ipw2x00         |    ✅     |    ✅        |   ✅   | Firmware para tarjetas Intel Pro/Wireless 2100/2200/2915 heredadas.         |
| firmware-libertas        |    ✅     |    ✅        |   ✅   | Firmware para tarjetas inalámbricas Marvell Libertas 8xxx.                  |
| firmware-ti-connectivity |    ✅     |    ✅        |   ✅   | Firmware para chips combinados de Texas Instruments (Wi-Fi, Bluetooth).     |
| firmware-b43-installer   |    ✅     |    ✅        |   ✅   | Instalador para el firmware de tarjetas Broadcom B43 heredadas.             |
| firmware-sof-signed      |    ✅     |    ✅        |   ✅   | Firmware firmado para la plataforma Sound Open Firmware (DSP de audio).     |

## Interfaz gráfica básica

### 🖥️ Sistema gráfico (Xorg)

| Paquete                  | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                              |
| :----------------------- | :------: | :----------: | :---: | :-------------------------------------------------------------------- |
| xserver-xorg             |    ✅     |    ✅        |   ✅   | Servidor principal del sistema gráfico X.Org.                         |
| xserver-xorg-video-all   |    ✅     |    ✅        |   ✅   | Metapaquete que instala todos los controladores de video 2D para X.Org.|
| xserver-xorg-video-intel |    ✅     |    ✅        |   ✅   | Controlador de video para gráficos integrados Intel.                  |
| xserver-xorg-input-all   |    ✅     |    ✅        |   ✅   | Metapaquete que instala todos los controladores de dispositivos de entrada (ratón, teclado).|
| xinit                    |    ✅     |    ✅        |   ✅   | Utilidad para iniciar el servidor X.                                  |
| xterm                    |    ✅     |    ✅        |   ✅   | Emulador de terminal estándar para X.                                 |
| blackbox or openbox      |    ✅     |    ✅        |   ✅   | Gestores de ventanas ligeros.                                         |
| libxcursor1              |    ✅     |    ✅        |   ✅   | Biblioteca para trabajar con cursores X11.                            |
| breeze-cursor-theme      |    ✅     |    ✅        |   ✅   | Tema de cursores Breeze de KDE.                                       |
| x11-utils                |    ✅     |    ✅        |   ✅   | Conjunto de utilidades básicas de X11.                               |
| wmctrl                   |    ✅     |    ✅        |   ✅   | Utilidad para controlar ventanas desde la línea de comandos.          |
| xdotool                  |    ✅     |    ✅        |   ✅   | Utilidad para simular entrada de teclado y ratón.                    |
| libdrm-intel1            |    ✅     |    ✅        |   ✅   | Biblioteca en espacio de usuario para Intel DRM (Direct Rendering Manager).|
| libgl1-mesa-dri          |    ✅     |    ✅        |   ✅   | Implementación libre de OpenGL para renderizado directo.              |
| libglu1-mesa             |    ✅     |    ✅        |   ✅   | Biblioteca de utilidades OpenGL de Mesa (GLU).                        |

### 🔌 Acceso remoto (XRDP)

| Paquete           | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                        |
| :---------------- | :------: | :----------: | :---: | :--------------------------------------------------------------- |
| xrdp and xorgxrdp |    ❌     |    ✅        |   ✅   | Servidor para conectarse al escritorio gráfico vía protocolo RDP. |

### 🎨 Componentes de la interfaz

| Paquete                      | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                     |
| :--------------------------- | :------: | :----------: | :---: | :------------------------------------------- |
| librsvg2-common              |    ✅     |    ✅        |   ✅   | Biblioteca para renderizar imágenes SVG.      |
| adwaita-icon-theme-antix     |    ✅     |    ✅        |   ✅   | Tema de iconos Adwaita.                      |
| elementary-minios-icon-theme |    ✅     |    ✅        |   ✅   | Tema de iconos elementary especial para MiniOS.|

## XFCE

### 🖼️ Entorno de escritorio (XFCE)

| Paquete               | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                                                   |
| :-------------------- | :------: | :----------: | :---: | :----------------------------------------------------------------------------------------- |
| dbus-x11              |    ✅     |    ✅        |   ✅   | Inicia el bus de mensajes D-Bus en sesión X11, necesario para la comunicación entre aplicaciones. |
| libxfce4ui-utils      |    ✅     |    ✅        |   ✅   | Bibliotecas con widgets y utilidades comunes para la interfaz XFCE.                         |
| thunar                |    ✅     |    ✅        |   ✅   | Gestor de archivos predeterminado en XFCE.                                                  |
| thunar-volman         |    ✅     |    ✅        |   ✅   | Gestiona el montaje automático de medios extraíbles en Thunar.                              |
| xfce4-appfinder       |    ✅     |    ✅        |   ✅   | Utilidad para buscar y lanzar aplicaciones rápidamente.                                     |
| xfce4-panel           |    ✅     |    ✅        |   ✅   | Panel de escritorio XFCE.                                                                  |
| xfce4-session         |    ✅     |    ✅        |   ✅   | Gestor de sesiones XFCE, controla el inicio y cierre de sesión.                            |
| xfce4-settings        |    ✅     |    ✅        |   ✅   | Centro de control de configuración de XFCE.                                                |
| xfconf                |    ✅     |    ✅        |   ✅   | Sistema de configuración para XFCE.                                                        |
| xfdesktop4            |    ✅     |    ✅        |   ✅   | Gestiona el escritorio: fondos, iconos, menú.                                              |
| xfwm4                 |    ✅     |    ✅        |   ✅   | Gestor de ventanas de XFCE.                                                                |
| greybird-gtk-theme    |    ✅     |    ✅        |   ✅   | Tema GTK popular y limpio, usado frecuentemente en XFCE.                                   |
| xfce4-xkb-plugin      |    ✅     |    ✅        |   ✅   | Plugin de panel para cambiar la distribución del teclado.                                  |
| xfce4-notifyd         |    ❌     |    ✅        |   ✅   | Daemon para mostrar notificaciones de escritorio.                                          |
| menulibre             |    ❌     |    ✅        |   ✅   | Editor de menús avanzado para entornos GTK.                                                |
| network-manager-gnome |    ✅     |    ✅        |   ✅   | Applet gráfico para gestionar conexiones de red (NetworkManager).                          |

### 🛠️ Utilidades del sistema y GUI

| Paquete                   | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                                                             |
| :------------------------ | :------: | :----------: | :---: | :--------------------------------------------------------------------------------------------------- |
| gvfs-backends             |    ✅     |    ✅        |   ✅   | Conjunto de backends para GVfs, permite acceso a FTP, SFTP, SMB, etc. desde el gestor de archivos.   |
| open-vm-tools-desktop     |    ❌     |    ✅        |   ✅   | Componentes para mejor integración del SO invitado con VMware (portapapeles, cambios de resolución). |
| gtk-update-icon-cache     |    ❌     |    ✅        |   ✅   | Utilidad para actualizar la caché de temas de iconos GTK.                                            |
| libglib2.0-bin            |    ✅     |    ✅        |   ✅   | Utilidades binarias para la biblioteca GLib 2.0.                                                     |
| at-spi2-core              |    ✅     |    ✅        |   ✅   | Protocolo y bibliotecas para soporte de accesibilidad (lectores de pantalla, etc.).                 |
| qt5/qt6-gtk-platformtheme |    ❌     |    ✅        |   ✅   | Plugins para que aplicaciones Qt5/Qt6 usen el tema GTK y mantengan apariencia consistente.           |
| policykit-1-gnome         |    ✅     |    ✅        |   ✅   | Agente de autenticación PolicyKit para entornos GTK, solicita contraseña para acciones privilegiadas.|
| libxml2-utils             |    ✅     |    ✅        |   ✅   | Utilidades de línea de comandos para trabajar con archivos XML (por ejemplo, `xmllint`).             |
| xmlstarlet                |    ✅     |    ✅        |   ✅   | Potente herramienta de línea de comandos para analizar, transformar y editar XML.                   |

### 🧰 Aplicaciones

| Paquete                        | Estándar | Herramientas | Ultra | ℹ️ Información del paquete                                                                                                   |
| :----------------------------- | :------: | :----------: | :---: | :-------------------------------------------------------------------------------------------------------------------------- |
| minios-installer               |    ✅     |    ✅        |   ✅   | Instalador gráfico del sistema MiniOS.                                                                                      |
| minios-configurator            |    ✅     |    ✅        |   ✅   | Configurador del sistema MiniOS.                                                                                            |
| mintstick                      |    ✅     |    ✅        |   ✅   | Utilidad para formatear USB y grabar imágenes ISO.                                                                          |
| mousepad                       |    ✅     |    ✅        |   ✅   | Editor de texto simple y rápido para XFCE.                                                                                  |
| ristretto                      |    ✅     |    ✅        |   ✅   | Visor de imágenes simple y rápido para XFCE.                                                                                |
| **Navegadores web**            |
| firefox-esr                    |    ✅     |    ✅        |   ✅   | Navegador web Firefox con Extended Support Release (ESR). Versión estable con actualizaciones de seguridad por más tiempo.  |
| **Multimedia**                 |
| vlc                            |    ❌     |    ✅        |   ✅   | Reproductor multimedia potente y popular compatible con muchos formatos.                                                    |
| vlc-plugin-bittorrent          |    ❌     |    ✅        |   ✅   | Plugin de VLC para reproducir video directamente desde archivos torrent.                                                    |
| vlc-plugin-samba               |    ❌     |    ✅        |   ✅   | Plugin de VLC para acceder a archivos en recursos compartidos Samba (Windows).                                              |
| vlc-l10n                       |    ❌     |    ✅        |   ✅   | Paquetes de localización para la interfaz de VLC.                                                                           |
| gimp                           |    ❌     |    ❌        |   ✅   | Potente editor de gráficos rasterizados, alternativa a Adobe Photoshop.                                                     |
| obs-studio                     |    ❌     |    ❌        |   ✅   | Programa para grabar y transmitir video desde la pantalla y otras fuentes.                                                  |
| obs-plugins                    |    ❌     |    ❌        |   ✅   | Plugins y efectos adicionales para OBS Studio.                                                                              |
| inkscape                       |    ❌     |    ❌        |   ✅   | Editor profesional de gráficos vectoriales, alternativa a Adobe Illustrator.                                                |
| blender                        |    ❌     |    ❌        |   ✅   | Suite profesional para creación de gráficos 3D, animación y video.                                                         |
| audacity                       |    ❌     |    ❌        |   ✅   | Editor de audio popular para grabar y procesar sonido.                                                                     |
| rawtherapee                    |    ❌     |    ❌        |   ✅   | Editor avanzado para procesar fotografías RAW.                                                                              |
| **Ofimática y documentos**     |
| pdfarranger                    |    ❌     |    ✅        |   ✅   | Utilidad sencilla para unir, dividir y reorganizar páginas PDF.                                                            |
| libreoffice                    |    ❌     |    ❌        |   ✅   | Suite ofimática completa (procesador de textos, hojas de cálculo, presentaciones).                                         |
| libreoffice-gtk3               |    ❌     |    ❌        |   ✅   | Integración de LibreOffice con el tema GTK3 para apariencia consistente.                                                    |
| libreoffice-style-elementary   |    ❌     |    ❌        |   ✅   | Tema de iconos elementary para LibreOffice.                                                                                |
| fonts-open-sans                |    ❌     |    ❌        |   ✅   | Fuente Open Sans, popular y legible.                                                                                       |
| **Utilidades del sistema (GUI)**|
| gparted                        |    ❌     |    ✅        |   ✅   | Editor gráfico de particiones de disco.                                                                                    |
| gsmartcontrol                  |    ❌     |    ✅        |   ✅   | Interfaz gráfica para la utilidad smartmontools (monitorización de discos).                                                |
| baobab                         |    ❌     |    ✅        |   ✅   | Analizador gráfico de uso de disco.                                                                                        |
| hardinfo                       |    ❌     |    ✅        |   ✅   | Utilidad para recolectar y mostrar información detallada del sistema y hardware.                                           |
| virt-manager                   |    ❌     |    ✅        |   ✅   | Interfaz gráfica para gestionar máquinas virtuales vía libvirt.                                                            |
| gir1.2-spiceclientgtk-3.0      |    ❌     |    ✅        |   ✅   | Biblioteca para integración con el protocolo SPICE (acceso remoto a VM).                                                   |
| doublecmd-gtk                  |    ❌     |    ✅        |   ✅   | Gestor de archivos de dos paneles similar a Total Commander.                                                               |
| onboard                        |    ❌     |    ✅        |   ✅   | Teclado en pantalla para personas con discapacidad.                                                                        |
| grsync                         |    ❌     |    ✅        |   ✅   | Interfaz gráfica para la potente utilidad de sincronización `rsync`.                                                       |
| rescuezilla                    |    ❌     |    ✅        |   ✅   | Herramienta sencilla para crear copias de seguridad y recuperación de discos, alternativa a Clonezilla.                   |
| kdiskmark                      |    ❌     |    ✅        |   ✅   | Herramienta para pruebas de rendimiento de disco, alternativa a CrystalDiskMark.                                           |
| qdiskinfo                      |    ❌     |    ✅        |   ✅   | Herramienta para mostrar información de discos, alternativa a CrystalDiskInfo.                                             |
| bleachbit                      |    ❌     |    ✅        |   ✅   | Utilidad para limpiar el sistema de archivos temporales e innecesarios.                                                    |
| gtkhash                        |    ❌     |    ✅        |   ✅   | Utilidad sencilla para calcular sumas hash de archivos.                                                                    |
| czkawka / czkawka-gui          |    ❌     |    ✅        |   ✅   | Utilidad para encontrar y eliminar archivos duplicados, carpetas vacías, etc.                                              |
| zulucrypt-gui                  |    ❌     |    ✅        |   ✅   | Interfaz gráfica para gestionar volúmenes cifrados.                                                                        |
| zulumount-gui                  |    ❌     |    ✅        |   ✅   | Interfaz gráfica para montar volúmenes cifrados.                                                                           |
| keepassxc                      |    ❌     |    ✅        |   ✅   | Gestor de contraseñas multiplataforma.                                                                                    |
| guymager                       |    ❌     |    ✅        |   ✅   | Herramienta para copiado forense de discos (creación de imágenes).                                                        |
| isomaster                      |    ❌     |    ✅        |   ✅   | Editor gráfico de imágenes de disco ISO.                                                                                  |
| qphotorec                      |    ❌     |    ✅        |   ✅   | Shell gráfica para la utilidad PhotoRec (recuperación de archivos).                                                       |
| veracrypt                      |    ❌     |    ✅        |   ✅   | Programa para crear y gestionar contenedores y discos cifrados.                                                           |
| wxhexeditor                    |    ❌     |    ✅        |   ✅   | Editor hexadecimal avanzado para archivos grandes.                                                                         |
| synaptic                       |    ❌     |    ❌        |   ✅   | Gestor gráfico clásico de paquetes para Debian/Ubuntu.                                                                    |
| eddy / eddy-handler            |    ❌     |    ❌        |   ✅   | Instalador gráfico sencillo para paquetes .deb locales.                                                                   |
| **Aplicaciones de red (GUI)**  |
| wireshark                      |    ❌     |    ✅        |   ✅   | Potente analizador de tráfico de red.                                                                                     |
| remmina                        |    ❌     |    ✅        |   ✅   | Cliente de escritorio remoto con soporte para RDP, VNC, SSH y otros protocolos.                                           |
| remmina-plugin-rdp             |    ❌     |    ✅        |   ✅   | Plugin para soporte del protocolo RDP en Remmina.                                                                         |
| remmina-plugin-vnc             |    ❌     |    ✅        |   ✅   | Plugin para soporte del protocolo VNC en Remmina.                                                                         |
| gnome-nettool                  |    ❌     |    ✅        |   ✅   | Conjunto de utilidades gráficas de red (ping, traceroute, escaneo de puertos).                                            |
| zenmap                         |    ❌     |    ✅        |   ✅   | Interfaz gráfica oficial para el escáner de red nmap.                                                                     |
| x11vnc                         |    ❌     |    ✅        |   ✅   | Servidor VNC que permite el control remoto de la sesión X actual.                                                         |
| uget                           |    ❌     |    ✅        |   ✅   | Gestor de descargas gráfico.                                                                                              |
| android-file-transfer          |    ❌     |    ✅        |   ✅   | Utilidad para transferir archivos desde dispositivos Android vía protocolo MTP.                                           |
| **Desarrollo**                 |
| codium                         |    ❌     |    ✅        |   ✅   | Versión libre del editor VS Code sin telemetría de Microsoft.                                                             |
