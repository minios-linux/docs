# Guía de Compatibilidad de Hardware

Esta guía proporciona información esencial sobre la compatibilidad de hardware para MiniOS. El sistema está basado en Debian 13 "Trixie" con un kernel Linux de Soporte a Largo Plazo (LTS), lo que garantiza un amplio soporte de hardware.

## Requisitos del Sistema

MiniOS está diseñado para la arquitectura **amd64** (64 bits). Los requisitos varían según la edición:

**Para la Variante Estándar:**
- **CPU:** Procesador de 64 bits a 1 GHz
- **RAM:** 1 GB mínimo (2 GB recomendados)
- **Almacenamiento:** 2 GB para ejecutar el sistema (4 GB o más recomendados para almacenamiento de datos)
- **Gráficos:** Adaptador de video compatible con VGA

**Para la Variante Toolbox:**
- **CPU:** Procesador de 64 bits a 1.2 GHz
- **RAM:** 2 GB mínimo (4 GB recomendados)
- **Almacenamiento:** 2 GB para ejecutar el sistema (8 GB o más recomendados para almacenamiento de datos)
- **Gráficos:** Tarjeta gráfica con soporte para aceleración por hardware

**Para la Variante Ultra:**
- **CPU:** Procesador de 64 bits de doble núcleo a 1.5 GHz
- **RAM:** 4 GB mínimo (8 GB recomendados)
- **Almacenamiento:** 2 GB para ejecutar el sistema (8 GB o más recomendados para almacenamiento de datos)
- **Gráficos:** GPU moderna con aceleración por hardware

## Compatibilidad de Componentes

### Procesadores

Se admite una amplia gama de procesadores x86 de 64 bits de Intel (Core i3/i5/i7/i9) y AMD (Ryzen 3/5/7/9).

### Gráficos

- **Intel:** Las gráficas integradas (UHD, Iris Xe, Arc) cuentan con excelente soporte.
- **NVIDIA:** Se incluye el controlador de código abierto Nouveau. Para tarjetas modernas, se recomienda instalar el controlador propietario para obtener el mejor rendimiento.
- **AMD:** Las tarjetas gráficas modernas de la serie Radeon RX están totalmente soportadas por el controlador de código abierto AMDGPU.

### Red

- **Ethernet:** La mayoría de los controladores cableados de Intel, Realtek y Broadcom funcionan de forma inmediata.
- **Wi-Fi:** Se admite una amplia variedad de adaptadores Wi-Fi gracias al firmware incluido y a los controladores DKMS que se compilan automáticamente, especialmente los modelos comunes de Intel, Atheros y Realtek.

### Almacenamiento

MiniOS está diseñado para arrancar desde una variedad de dispositivos de almacenamiento. Los scripts de inicio del sistema escanean automáticamente todos los dispositivos de bloques disponibles, lo que garantiza compatibilidad con:

- **Unidades USB:** Se admiten todas las generaciones de USB.
- **Unidades SATA/IDE:** Todos los discos duros internos y SSD estándar.
- **Unidades NVMe:** Soporte completo para SSD NVMe modernos.
- **Tarjetas SD/MMC:** Compatibles si el lector de tarjetas es reconocido por el kernel.

### Virtualización

MiniOS está completamente optimizado para su uso como sistema operativo invitado en todos los entornos de virtualización principales. El proceso de compilación incluye todos los controladores necesarios en el ramdisk inicial (`initrd`) para asegurar el máximo rendimiento desde el primer inicio.

- **Controladores de alto rendimiento:** El soporte para controladores de almacenamiento paravirtualizados está integrado, incluyendo **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI** y **Hyper-V Storvsc**. Esto permite un rendimiento de E/S de disco casi nativo.
- **Amplia compatibilidad:** El sistema también puede arrancar desde controladores **IDE** y **SATA** emulados, garantizando compatibilidad con cualquier configuración de hipervisor.
- **Herramientas para invitados:** Para una integración avanzada (como mouse fluido, portapapeles compartido y resolución dinámica), las variantes `toolbox` y `ultra` incluyen `open-vm-tools` (para VMware) y `hyperv-daemons` (para Hyper-V).

Para instrucciones detalladas de configuración y ajustes específicos de cada plataforma, consulta la [Guía de Virtualización](/administration/Virtualization.md).
