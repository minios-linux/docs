---
updated: 2026-08-31
---

# Virtualización

MiniOS puede ejecutarse como invitado en VirtualBox, VMware, QEMU/KVM y Hyper-V.
Toolbox y Ultra también incluyen software para ejecutar máquinas virtuales QEMU/KVM desde el propio MiniOS.

Esta página documenta el comportamiento específico de virtualización de MiniOS. Para la creación habitual de máquinas virtuales y la configuración del hipervisor, utiliza la documentación del hipervisor.

## Ejecutar MiniOS como invitado

### Disposición recomendada de la máquina virtual

Para lograr la mayor compatibilidad, conecta el medio de arranque de MiniOS y cualquier disco virtual que vaya a contener una instalación en vivo de MiniOS mediante un **controlador IDE o SATA**. Esta recomendación aplica a VirtualBox, VMware, QEMU/KVM y Hyper-V siempre que esté disponible dicho controlador.

Otros controladores de almacenamiento virtual pueden funcionar, pero MiniOS debe poder acceder a su fuente en vivo durante la etapa initramfs, antes de que el árbol completo de módulos del kernel de `01-kernel-*.sb` esté disponible.

### Soporte de almacenamiento en el arranque temprano

MiniOS incluye intencionadamente solo un conjunto seleccionado de controladores de almacenamiento en el initramfs. Los constructores actuales de Dracut y LiveKit utilizan la misma política:

| Interfaz de almacenamiento | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Sí | Sí |
| NVMe | Sí | Sí |
| Almacenamiento masivo USB / UAS | Sí | Sí |
| Almacenamiento Hyper-V (`hv_storvsc`) | Sí | Sí |
| VirtIO block / SCSI | No | Sí |
| VMware PVSCSI | No | Sí |
| Xen block frontend | No | No |

Los controladores SAS/RAID comunes como `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` y `aacraid` están presentes en el árbol completo de módulos del kernel, pero no se incluyen en el initramfs de MiniOS.

Esta distinción solo importa antes de que se haya encontrado la fuente en vivo de MiniOS y el sistema completo haya arrancado. El hardware que funciona normalmente después del arranque no es necesariamente adecuado para albergar la fuente en vivo.

Por esta razón, **IDE o SATA sigue siendo la opción recomendada de almacenamiento para máquinas virtuales**, incluso para ediciones cuyo initramfs también contiene soporte para VirtIO o VMware PVSCSI.

### Integración como invitado

El kernel ya proporciona los controladores básicos de hardware virtual utilizados por los principales hipervisores. Toolbox y Ultra agregan paquetes de servicios para invitados que permiten una integración más estrecha:

| Plataforma | Integración de invitado incluida en Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` en bases compatibles |
| Hyper-V | `hyperv-daemons` |

El kernel Debian actual utilizado por amd64 MiniOS también incluye controladores de invitado para VirtualBox, controladores de gráficos/red de VMware, VirtIO y controladores de Hyper-V. Los paquetes de servicios para invitados añaden funciones de integración; no son los que hacen posible el arranque básico de la máquina virtual.

### Gestión de la resolución en Xfce

MiniOS proporciona `/usr/bin/minios-virtual-resolution` a través de `minios-tools` y lo inicia desde la sesión de inicio automático de Xfce. Detecta máquinas virtuales comunes y utiliza XRandR solo cuando las herramientas de invitado activas no están gestionando ya la pantalla.

Sin una anulación, la resolución solicitada es `1280x800`. Usa `virtres=WIDTHxHEIGHT` para solicitar otra resolución o `novirtres` para desactivar este ajuste de MiniOS.
Tras un ajuste exitoso, la utilidad crea `~/.config/minios/virtual-resolution-configured`. En una sesión persistente no aplicará el ajuste automático de nuevo hasta que se elimine ese marcador.

## Uso de MiniOS como host de virtualización

Toolbox y Ultra incluyen la pila QEMU/KVM utilizada para máquinas virtuales locales:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra además incluye su pila Docker y `lazydocker` para cargas de trabajo en contenedores.

Esta documentación no describe la instalación de productos de virtualización que no forman parte de una edición.

## Ver también

- [Compatibilidad de hardware](/getting-started/Hardware-Compatibility)
- [Descubrimiento del sistema initrd](/reference/boot-process/System-Discovery)
- [Parámetros de arranque](/reference/Boot-Parameters)
- [Paquetes y ediciones](/reference/Package-and-Edition-Contents)
