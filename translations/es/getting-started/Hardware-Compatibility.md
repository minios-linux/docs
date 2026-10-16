---
updated: 2026-10-15
---

# Compatibilidad de hardware

MiniOS está diseñado para ejecutarse en diferentes computadoras x86 en lugar de estar vinculado a una sola máquina. Por ello, la prueba de compatibilidad más fiable es iniciar la imagen real de MiniOS en el hardware de destino y comprobar los dispositivos que piensas utilizar.

El soporte de hardware depende de la imagen seleccionada: su arquitectura, distribución base, kernel, firmware, controladores, escritorio y edición son factores relevantes. Una imagen de MiniOS más reciente o diferente puede ser compatible con hardware que una versión anterior no reconoce.

## Arquitectura

MiniOS es compatible tanto con sistemas x86 de 64 bits como de 32 bits:

| Arquitectura de la imagen | Úsala para |
|---|---|
| **amd64** | Computadoras x86 de 64 bits |
| **i386** | Computadoras x86 de 32 bits compatibles |

Utiliza la arquitectura indicada en el nombre de la imagen y en la descripción de la versión. La disponibilidad de imágenes de 32 bits depende de la versión de MiniOS y de la distribución base.

## Firmware y arranque

Las imágenes de PC MiniOS pueden arrancar mediante BIOS heredado y UEFI cuando los archivos de arranque requeridos están presentes en la imagen seleccionada. Las implementaciones de firmware varían mucho, por lo que el mismo dispositivo USB puede aparecer de forma diferente en el menú de arranque según el equipo.

Secure Boot depende de la cadena completa de kernel y EFI de la imagen, no solo de su arquitectura. Las compilaciones amd64 de Debian/Ubuntu que utilizan el kernel de la distribución firmado correspondiente y los componentes EFI pueden ser compatibles con Secure Boot. Un kernel personalizado o proporcionado por MiniOS que no esté firmado no se considera confiable solo por tener archivos EFI firmados. DynBlk y el controlador externo AUFS-NG no están firmados: Secure Boot desactiva las sesiones DynBlk/VMDK y normalmente deja OverlayFS para la composición de módulos.

Las imágenes i386 actuales utilizan un kernel compilado por MiniOS cuando la base seleccionada ya no proporciona un kernel de 32 bits adecuado. Los kernels de MiniOS son compilaciones independientes con integración de MiniOS, no garantizan binarios idénticos a los de Debian y no forman parte de la cadena de firma de Debian.**Estas imágenes i386 no son compatibles con Secure Boot.** La arquitectura (bitness) del firmware es una consideración de compatibilidad de arranque independiente.

## Memoria

Los requisitos de memoria dependen de la versión específica, el entorno de escritorio, las aplicaciones y el tipo de sesión. En general, Flux requiere menos memoria que las ediciones completas de XFCE; sin embargo, un navegador, una suite ofimática, una máquina virtual o una instantánea de persistencia grande pueden necesitar considerablemente más memoria que solo el escritorio. Consulta los requisitos indicados para cada versión y prueba la carga de trabajo prevista, en lugar de asumir que una cifra antigua de RAM para toda la edición es suficiente para cualquier imagen actual.

**Ejecutar desde RAM** necesita memoria adicional porque los datos de MiniOS se copian en RAM junto con el sistema y las aplicaciones en ejecución. Por eso, las imágenes más grandes requieren mucha más memoria en este modo.

Consulta [Modos de arranque](/using-minios/Boot-Modes) antes de usar **Ejecutar desde RAM** en un equipo con memoria limitada.

## Gráficos

Las imágenes amd64 actuales de MiniOS utilizan la pila gráfica de Debian con Xorg y Mesa.
Según el kernel seleccionado, sus módulos ofrecen soporte para Intel `i915` y `xe`, AMD `amdgpu` y `radeon`, así como para hardware NVIDIA de código abierto `nouveau`.

Xorg incluye su controlador genérico `modesetting`junto con los controladores para Intel, AMD/ATI, Radeon, Nouveau, VESA y framebuffer. Mesa proporciona la pila habitual de aceleración 3D utilizada por Intel, AMD y los controladores de código abierto compatibles.

Las imágenes basadas en Debian de MiniOS solicitan colecciones de firmware de Debian junto con paquetes específicos de cada fabricante, incluyendo `firmware-intel-graphics` en Trixie y Excalibur. El firmware que finalmente se instala depende de la disponibilidad en los repositorios y de la imagen generada. Las imágenes basadas en Ubuntu utilizan `linux-firmware` en su lugar.

Las listas de paquetes mantenidas de MiniOS no incluyen el controlador propietario de kernel de NVIDIA. Por lo tanto, el hardware NVIDIA utiliza el controlador `nouveau` incluido de forma predeterminada. El hardware o las funciones que requieran específicamente el controlador propietario de NVIDIA deberán añadirlo por separado.

Los gráficos virtuales también están soportados por los controladores de kernel y Xorg para dispositivos comunes de VMware, QXL, Bochs y Hyper-V.

### Escalado y gestión de ventanas en XFCE

Las imágenes XFCE de Debian 13 y Devuan Excalibur utilizan configuraciones y paquetes de escritorio adaptados a MiniOS, los complementos de lista de tareas y Mostrar Escritorio de MiniOS, y `xfwm4-gl` en lugar de `xfwm4`. Configuración de pantalla ofrece escalado automático de la interfaz o selección manual entre 100–200% en pasos de 25%, con vista previa temporizada y opción de revertir. El texto, los controles, las decoraciones y los cursores con tema siguen el escalado de la interfaz; la escala de píxeles de salida y la resolución del monitor se controlan por separado. Las selecciones manuales guardadas tienen prioridad sobre el modo automático.

`xfwm4-gl` utiliza OpenGL por defecto con XRender como alternativa. Los ajustes del gestor de ventanas permiten configurar desenfoque, animaciones, omisión de composición en pantalla completa y la apariencia de Alt+Tab. Las miniaturas de Alt+Tab y la barra de tareas pueden atenuar u ocultar otras ventanas para la función Peek sin activar la ventana previsualizada; se usan imágenes minimizadas en caché cuando están disponibles. Los efectos de desvanecimiento/escalado y Peek funcionan en ambos motores de renderizado, mientras que el desenfoque y Magic Lamp requieren OpenGL. Otras suites mantienen sus componentes XFCE de la distribución.

### Paquetes opcionales para MateBook E

El soporte para Huawei MateBook E 2023 está disponible mediante paquetes Linux 6.12 instalables por separado; no asumas que vienen incluidos en la imagen de lanzamiento. `matebook-e-dsi-dkms` incluye un backport experimental para la pantalla interna: persisten bandas de color residuales y la suspensión/reanudación aún no está validada. La integración de la cámara utiliza `matebook-e-cameras-dkms` y el paquete de espacio de usuario amd64/systemd `matebook-e-cameras` . Los paquetes de cámara no instalan el controlador experimental para lápiz.

## Hardware de red

Las imágenes amd64 actuales MiniOS utilizan el kernel de Debian con su conjunto habitual de controladores de red. El kernel 6.12 que emplean las imágenes actuales de Trixie incluye controladores para hardware Ethernet y Wi-Fi común de Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell y otros fabricantes.

Entre los controladores Ethernet más comunes se encuentran los de Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice`, y `ixgbe`; Realtek `8139` y `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x`, y `bnxt`; Atheros `atl*` y `alx`; Marvell `sky2`; y controladores USB Ethernet comunes como ASIX, `r8152`, CDC Ethernet/NCM y RNDIS.

El soporte Wi-Fi incluye Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k`, y `ath12k`; Broadcom `brcmfmac`, `brcmsmac`, y `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88`, y `rtw89`; y varios controladores antiguos de Marvell, Intersil, ZyDAS y otros.

MiniOS también añade módulos DKMS para hardware que no está suficientemente soportado por el kernel estándar. El conjunto actual de módulos amd64 incluye controladores adicionales de Wi-Fi USB Realtek para los adaptadores RTL8188EU, RTL8814AU, RTL8811/RTL8821AU y otros relacionados de la serie RTL88xxAU, además del controlador Broadcom STA `wl` .

El conjunto de firmware incluye paquetes de firmware de Debian para hardware de red común de Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium y otros fabricantes.
La disponibilidad exacta sigue dependiendo de la versión MiniOS, la arquitectura y el kernel seleccionado.

Para el uso habitual de red tras el arranque, MiniOS utiliza NetworkManager. Si un adaptador no es detectado, cambiar la configuración de NetworkManager no proporcionará el controlador del kernel o firmware que falte. Consulta [Configuración de red](/using-minios/Networking) para el uso normal de la red.

## Almacenamiento

En un arranque en vivo de MiniOS, el controlador de almacenamiento es importante por partida doble: el firmware debe poder iniciar el gestor de arranque, y luego el initramfs de MiniOS debe poder detectar el dispositivo que contiene el`minios/` árbol de datos.

MiniOS incluye intencionadamente solo ciertos controladores de almacenamiento en su initramfs.
Los compiladores actuales siempre incluyen soporte para IDE/PATA/SATA, NVMe, SD/MMC, almacenamiento masivo USB/UAS y almacenamiento Hyper-V. Las ediciones Standard, Toolbox y Ultra también añaden soporte para VirtIO block/SCSI y VMware PVSCSI en el initramfs; Flux no lo hace.

El árbol completo de módulos del kernel contiene controladores de almacenamiento adicionales que no están disponibles durante el descubrimiento temprano de fuentes de MiniOS. Si el menú de arranque aparece pero MiniOS no puede encontrar sus módulos, consulta[Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery).

## Máquinas virtuales

MiniOS es compatible con el hardware virtual común utilizado por VirtualBox, VMware, QEMU/KVM y Hyper-V. Para los medios de arranque y los discos de destino de instalación, se recomienda utilizar un **controlador IDE o SATA** si el hipervisor lo ofrece. Estos controladores proporcionan el comportamiento más predecible durante el arranque inicial y la instalación.

El kernel actual de Debian 6.12 ya incluye los principales controladores de hardware para sistemas invitados:

| Hipervisor | Controladores incluidos en el kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | Controladores VirtIO para disco, red, gráficos, entrada, balloon, SCSI, sonido y otros relacionados |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`, y soporte de entrada para Hyper-V |

Estos controladores del kernel son suficientes para el funcionamiento básico como invitado. Los servicios adicionales para invitados ofrecen integración con el host, como el manejo automático de pantalla, apagado limpio, compartición de archivos y comunicación entre host e invitado.

Toolbox y Ultra incluyen `open-vm-tools` y `open-vm-tools-desktop` para VMware, `qemu-guest-agent` para QEMU/KVM, y `hyperv-daemons` para Hyper-V. En suites compatibles, incluyendo las imágenes actuales de Trixie, también incluyen `virtualbox-guest-utils` y `virtualbox-guest-x11`. Flux y Standard no incluyen estos paquetes de servicios para invitados por defecto.

Consulta [Virtualización](/maintenance-and-recovery/Virtualization) y [Paquetes y ediciones](/reference/Package-and-Edition-Contents) para información específica de software según la edición.

## Prueba un ordenador antes de confiar en él

1. Inicia exactamente la imagen MiniOS que planeas utilizar.
2. Usa el modo predeterminado **Iniciar MiniOS** para pruebas normales, o **Iniciar sin guardar** cuando no quieras abrir ni crear una sesión persistente.
3. Verifica la gráfica, el teclado y dispositivos apuntadores, el sonido, las conexiones de red cableadas e inalámbricas, los dispositivos de almacenamiento que necesites y la suspensión/reanudación si piensas usarla.
4. Si planeas usar persistencia, realiza un pequeño cambio de prueba, reinicia y confirma que la sesión esperada se activó y que el cambio se mantuvo.
5. Solo entonces confía en la máquina para trabajos importantes o realiza operaciones destructivas en el disco.

Si algo falla, primero determina si el problema ocurre antes del menú de arranque, durante el descubrimiento de fuentes de MiniOS, o después de que el sistema operativo haya iniciado.
Esa distinción normalmente indica si debes investigar el firmware, initramfs o el soporte de hardware estándar de Linux.
