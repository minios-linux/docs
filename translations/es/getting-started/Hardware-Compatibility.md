---
updated: 2026-08-31
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

Las imágenes PC de MiniOS pueden arrancar mediante BIOS heredado y UEFI cuando los archivos de arranque necesarios están presentes en la imagen seleccionada. Las implementaciones de firmware varían mucho, por lo que el mismo dispositivo USB puede aparecer de manera diferente en el menú de arranque de distintas computadoras.

Las imágenes actuales de 64 bits de MiniOS utilizan el kernel de Debian y los componentes EFI de Debian.
Por lo tanto, admiten **Secure Boot** en sistemas amd64.

Las imágenes de 32 bits i386 utilizan un kernel compilado por MiniOS porque Debian ya no publica paquetes de kernel de 32 bits. Este kernel se mantiene idéntico al kernel correspondiente de Debian, pero es compilado por MiniOS y no forma parte de la cadena de arranque firmada de Debian. Por lo tanto, **el Secure Boot no es compatible con las imágenes i386 de MiniOS**.

## Memoria

La memoria mínima recomendada depende de la edición:

| Edición | RAM mínima recomendada |
|---|---:|
| **Flux** | 512 MB |
| **Standard** | 756 MB |
| **Toolbox** | 756 MB |
| **Ultra** | 756 MB |

Estos valores son para el uso normal desde el medio de arranque. Las aplicaciones reales pueden requerir más memoria.

**Ejecutar desde RAM** necesita memoria adicional porque los datos de MiniOS se copian en RAM junto con el sistema y las aplicaciones en ejecución. Por ello, las imágenes más grandes requieren considerablemente más memoria en este modo.

Consulta [Modos de arranque](/using-minios/Boot-Modes) antes de usar **Ejecutar desde RAM** en una computadora con memoria limitada.

## Gráficos

Las imágenes amd64 actuales de MiniOS utilizan la pila gráfica de Debian con Xorg y Mesa.
El kernel incluye los controladores de Intel `i915` y `xe`, AMD `amdgpu` y `radeon`, y el controlador de código abierto NVIDIA `nouveau`.

Xorg incluye su controlador genérico `modesetting` junto con los controladores de Intel, AMD/ATI, Radeon, Nouveau, VESA y framebuffer. Mesa proporciona la pila normal de aceleración 3D utilizada por Intel, AMD y los controladores de código abierto compatibles.

Las imágenes basadas en Debian de MiniOS instalan los paquetes de firmware de Debian junto con los paquetes de firmware específicos de cada fabricante. La imagen Standard de Trixie actual incluye `firmware-amd-graphics` y `firmware-misc-nonfree`; las imágenes basadas en Ubuntu usan `linux-firmware` en su lugar.

Las listas de paquetes mantenidas de MiniOS no incluyen el controlador propietario de kernel de NVIDIA. Por lo tanto, el hardware NVIDIA utiliza por defecto el controlador `nouveau` incluido. El hardware o las funciones que requieran específicamente el controlador propietario de NVIDIA deben añadirse por separado.

Los gráficos virtuales también están cubiertos por los controladores de kernel y Xorg para dispositivos comunes de VMware, QXL, Bochs y Hyper-V.

## Hardware de red

Las imágenes amd64 actuales de MiniOS utilizan el kernel de Debian con su conjunto habitual de controladores de red. El kernel 6.12 utilizado por las imágenes Trixie actuales incluye controladores para hardware Ethernet y Wi-Fi común de Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell y otros.

Entre los controladores Ethernet más comunes se incluyen Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` y `ixgbe`; Realtek `8139` y `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x` y `bnxt`; Atheros `atl*` y `alx`; Marvell `sky2`; y controladores USB Ethernet comunes como ASIX, `r8152`, CDC Ethernet/NCM y RNDIS.

El soporte Wi-Fi incluye Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` y `ath12k`; Broadcom `brcmfmac`, `brcmsmac` y `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` y `rtw89`; y varios controladores antiguos de Marvell, Intersil, ZyDAS y otros.

MiniOS también añade módulos DKMS para hardware que no está suficientemente cubierto por el kernel estándar. El conjunto actual de módulos amd64 incluye controladores Wi-Fi USB Realtek adicionales para los adaptadores RTL8188EU, RTL8814AU, RTL8811/RTL8821AU y relacionados de la serie RTL88xxAU, además del controlador Broadcom STA `wl`.

El conjunto de firmware incluye paquetes de firmware de Debian para hardware de red común de Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium y otros.
La disponibilidad exacta sigue dependiendo de la versión de MiniOS, la arquitectura y el kernel seleccionado.

Para el uso de red habitual tras el arranque, MiniOS utiliza NetworkManager. Si un adaptador no es detectado en absoluto, cambiar la configuración de NetworkManager no proporcionará un controlador de kernel o firmware que falte. Consulta [Configuración de red](/using-minios/Networking) para el uso normal de red.

## Almacenamiento

Para un arranque live de MiniOS, el controlador de almacenamiento es importante en dos momentos: el firmware debe poder iniciar el gestor de arranque y el initramfs de MiniOS debe poder ver el dispositivo que contiene el árbol de datos `minios/`.

MiniOS incluye intencionadamente solo ciertos controladores de almacenamiento en su initramfs.
Los compiladores actuales siempre incluyen soporte para IDE/PATA/SATA, NVMe, SD/MMC, almacenamiento USB/UAS y almacenamiento Hyper-V. Las ediciones Standard, Toolbox y Ultra también añaden soporte para VirtIO block/SCSI y VMware PVSCSI al initramfs; Flux no lo hace.

El árbol completo de módulos del kernel contiene controladores de almacenamiento adicionales que no están disponibles durante el descubrimiento temprano de la fuente de MiniOS. Si aparece el menú de arranque pero MiniOS no puede encontrar sus módulos, consulta [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery).

## Máquinas virtuales

MiniOS es compatible con el hardware virtual común utilizado por VirtualBox, VMware, QEMU/KVM y Hyper-V. Para los medios de arranque y los discos de destino de la instalación, se recomienda preferir un **controlador IDE o SATA** si el hipervisor lo permite. Estos controladores ofrecen el comportamiento más predecible durante el arranque e instalación iniciales.

El kernel Debian 6.12 actual ya incluye los principales controladores de hardware para invitados:

| Hipervisor | Controladores incluidos en el kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO block, red, gráficos, entrada, balloon, SCSI, sonido y controladores relacionados |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm` y soporte de entrada Hyper-V |

Estos controladores del kernel son suficientes para el funcionamiento básico del sistema invitado. Servicios adicionales para invitados proporcionan integración con el host, como manejo automático de pantalla, apagado limpio, compartición de archivos y comunicación host/invitado.

Toolbox y Ultra incluyen `open-vm-tools` y `open-vm-tools-desktop` para VMware, `qemu-guest-agent` para QEMU/KVM y `hyperv-daemons` para Hyper-V. En suites compatibles, incluidas las imágenes Trixie actuales, también incluyen `virtualbox-guest-utils` y `virtualbox-guest-x11`. Flux y Standard no incluyen estos paquetes de servicios para invitados por defecto.

Consulta [Virtualización](/maintenance-and-recovery/Virtualization) y [Paquetes y ediciones](/reference/Package-and-Edition-Contents) para información específica de software por edición.

## Prueba un equipo antes de confiar en él

1. Inicia exactamente la imagen de MiniOS que planeas utilizar.
2. Usa el modo predeterminado **Iniciar MiniOS** para pruebas normales, o **Iniciar sin guardar** si explícitamente no deseas abrir ni crear una sesión persistente.
3. Comprueba gráficos, teclado y dispositivos apuntadores, sonido, red cableada e inalámbrica, los dispositivos de almacenamiento que necesites y la suspensión/reanudación si planeas usarla.
4. Si planeas usar persistencia, realiza un pequeño cambio de prueba, reinicia y confirma que la sesión esperada se activó y que el cambio se conservó.
5. Solo entonces confía en la máquina para trabajos importantes o realiza operaciones destructivas en el disco.

Si algo falla, primero determina si el problema ocurre antes del menú de arranque, durante el descubrimiento de la fuente de MiniOS o después de que el sistema operativo haya iniciado.
Esa distinción suele indicar si debes investigar el firmware, el initramfs o el soporte de hardware habitual de Linux.
