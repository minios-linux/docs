---
updated: 2026-08-26
---

# Optimización del rendimiento

El ajuste de rendimiento en MiniOS es principalmente un equilibrio entre el tiempo de arranque, uso de RAM,
lecturas en tiempo de ejecución, sobrecarga de persistencia y durabilidad del almacenamiento. Para conocer la semántica exacta de las opciones y los límites de seguridad, consulta [Modos de arranque](/configuration/Boot-Modes.md), [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md).

## Parámetros de arranque para el rendimiento

Los parámetros de arranque pueden trasladar el trabajo de inicio y las lecturas del sistema en vivo entre la RAM y el dispositivo de origen. Consulta [Parámetros de arranque](/configuration/Boot-Parameters.md) para la referencia completa.

### Cargar el sistema en RAM (`toram`)

`toram` puede reducir la latencia en tiempo de ejecución causada por un dispositivo USB lento o una ISO en red, a costa de un arranque más largo y un uso considerablemente mayor de RAM. El uso de `toram` realiza una copia completa. `toram=trim` suele consumir menos RAM, pero su copia más limitada puede omitir datos o módulos necesarios posteriormente.

Deja espacio para la capa de escritura, aplicaciones, cachés y zram, en lugar de dimensionar solo para los archivos de módulos. Asignar más RAM a la copia en vivo significa que habrá menos disponible para la carga de trabajo. Consulta [Modos de arranque](/configuration/Boot-Modes.md) para conocer la durabilidad de la copia y las restricciones de extracción de medios.

### Filtrado de módulos (`load` y `noload`)

El filtrado puede reducir los datos copiados y las capas montadas, especialmente con `toram=trim`. El costo es un sistema menos capaz y una mayor probabilidad de fallos en el arranque o en tiempo de ejecución si se omite una dependencia. Verifica el conjunto de módulos resultante; la sintaxis de filtrado y las limitaciones de módulos protegidos se definen en [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md).

## Optimización de la persistencia

La persistencia traslada las operaciones de E/S de la capa escribible desde la RAM temporal al almacenamiento o a un contenedor. La elección del backend afecta la latencia, compatibilidad, gestión de capacidad y complejidad de recuperación.

### Modos de persistencia (`perchmode`)

- **`native`:** Evita una capa de sistema de archivos en un archivo y es la opción más sencilla en un sistema de archivos POSIX adecuado, pero no está disponible en sistemas de archivos que no pueden conservar los metadatos requeridos por Linux.
- **`raw`:** Tiene una capacidad fija predecible y un comportamiento ext4 convencional, pero reserva el tamaño del archivo y no puede crecer más allá del almacenamiento disponible.
- **`dynfilefs`:** Se expande bajo demanda y admite medios que de otro modo serían inadecuados, con mayor complejidad de mapeo y recuperación.
- **`luks`:** Añade confidencialidad a costa de trabajo de desbloqueo y sobrecarga de cifrado.
- **`squashfs`:** Intercambia compresión al guardar y trabajo de extracción en RAM por una instantánea compacta; no es un backend escribible de baja latencia general.

Realiza pruebas comparativas de cargas de trabajo representativas en el dispositivo real. Las diferencias en el controlador flash, sistema de archivos, puente USB y carga de trabajo son más fiables que una clasificación universal de los modos de persistencia.

## Configuración de ZRAM

Zram intercambia tiempo de CPU por capacidad de memoria comprimida y puede evitar el uso de swap respaldado por almacenamiento, que es mucho más lento. Un dispositivo zram más grande puede absorber más páginas inactivas, pero no crea RAM física; las cargas de trabajo incomprimibles siguen consumiendo memoria. Los algoritmos de compresión equilibran el rendimiento y el uso de CPU frente a la tasa de compresión, y su disponibilidad depende del kernel. Comienza con la configuración predeterminada y cambia `zramsize`, `zramcomp` o `nozram` solo para una carga de trabajo medida; consulta [Parámetros de arranque](/configuration/Boot-Parameters.md) para los valores aceptados.

## Sistema de archivos y hardware de almacenamiento

- **Elección del dispositivo:** Un mayor rendimiento secuencial acorta la copia de módulos grandes, mientras que una baja latencia de E/S aleatoria es más relevante para cargas de trabajo de escritorio persistentes. Mide el dispositivo y la carcasa juntos; la generación USB por sí sola no predice el rendimiento de la memoria flash o SSD.
- **Elección del sistema de archivos:** Un sistema de archivos nativo de Linux puede usar persistencia nativa sin la sobrecarga de un contenedor. Los sistemas de archivos multiplataforma mejoran la portabilidad pero requieren un backend de contenedor compatible para los metadatos de Linux, lo que añade capas de mapeo y sistema de archivos. Elige en función de la portabilidad, las necesidades de recuperación y los resultados de las pruebas comparativas.
