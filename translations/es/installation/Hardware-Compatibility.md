---
updated: 2026-08-26
---

# Guía de compatibilidad de hardware

La compatibilidad de hardware depende de la versión y la imagen de MiniOS: la distribución base, el kernel, el firmware, los módulos incluidos y la edición son factores determinantes. Consulta la descripción de la versión de la imagen que descargaste y prueba una sesión en vivo desde cero antes de cambiar discos o depender del equipo para trabajo persistente.

## Requisitos del sistema

Las imágenes publicadas de MiniOS para PC están dirigidas a la arquitectura **amd64** (x86 de 64 bits), salvo que la descripción de la versión indique lo contrario. Los recursos necesarios varían según la imagen, la edición, el escritorio, las aplicaciones y el modo de arranque:

- La CPU debe ser compatible con la arquitectura de la imagen y el modo de firmware seleccionado.
- La RAM debe ser suficiente para la edición y la carga de trabajo elegidas. Los modos `toram` requieren memoria adicional para los datos de la imagen copiada.
- El medio de arranque debe tener espacio suficiente para la imagen descargada. La persistencia, los datos de usuario y una instalación nativa requieren almacenamiento adicional de escritura.
- Los requisitos gráficos dependen del escritorio y las aplicaciones de la edición seleccionada.

Grabar una imagen en un dispositivo de mayor capacidad no crea almacenamiento persistente automáticamente. Consulta [Modos de arranque](/configuration/Boot-Modes.md) para la guía oficial sobre el comportamiento de arranque en vivo y [Inicio rápido](/installation/Quick-Start.md) para la preparación del medio.

## Compatibilidad de componentes

### Procesadores

La compatibilidad depende de la arquitectura y el kernel incluidos en la imagen seleccionada. Consulta las notas de la versión si utilizas un procesador reciente o funciones de CPU que requieran soporte de kernel más moderno.

### Gráficos

El soporte gráfico depende del controlador del kernel, el firmware y la pila gráfica de espacio de usuario incluidos en la imagen. Una tarjeta puede ofrecer salida de video básica sin admitir aceleración por hardware o todos los conectores. Algunos equipos NVIDIA pueden requerir un controlador propietario que no está incluido en una imagen determinada.

### Red

El soporte para Ethernet y Wi-Fi depende del controlador, el driver del kernel y el firmware incluidos en la imagen. Prueba la conectividad desde una sesión nueva. Para Wi-Fi, verifica también si el dispositivo necesita firmware o un driver externo que no esté presente en esa versión.

### Almacenamiento

Los dispositivos USB, SATA, NVMe, IDE y SD/MMC funcionan solo si la imagen seleccionada incluye un driver para el controlador y el kernel puede reconocer el dispositivo. El escaneo de initrd no hace compatible un controlador no soportado. Consulta [Descubrimiento del sistema por Initrd](/configuration/Initrd-System-Discovery.md) para conocer el comportamiento exacto de búsqueda de fuentes en vivo.

El modo en vivo y el modo nativo tienen rutas de arranque diferentes. El modo en vivo detecta el árbol de datos de MiniOS y ensambla módulos de solo lectura en el espacio de usuario temprano; el modo nativo arranca una raíz instalada convencional. Consulta [Carga de módulos en Initrd](/configuration/Initrd-Module-Loading.md) para la gestión de módulos en vivo y [Instalación de MiniOS](/installation/Installing-MiniOS.md) para la diferencia de estructura.

### Virtualización

MiniOS puede ejecutarse como invitado cuando la imagen seleccionada incluye drivers para la CPU, almacenamiento, red y dispositivos de pantalla configurados en la VM. No se garantiza compatibilidad con todos los hipervisores o modelos de controlador. El soporte para VirtIO, VMware, Hyper-V y controladores IDE o SATA emulados debe verificarse según la versión y probarse con la configuración específica de la VM.

Los agentes de invitado y las herramientas de integración de escritorio también varían según la edición y la imagen. Consulta la [lista de paquetes](/administration/Packages.md) y la [Guía de virtualización](/administration/Virtualization.md) antes de asumir que funciones como compartir portapapeles, resolución dinámica, apagado limpio o comunicación con el host están disponibles.
