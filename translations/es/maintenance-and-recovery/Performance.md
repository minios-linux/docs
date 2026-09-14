---
updated: 2026-09-13
---

# Rendimiento

La optimización del rendimiento en MiniOS implica equilibrar el tiempo de arranque, el uso de RAM, las lecturas en tiempo de ejecución, la sobrecarga de persistencia y la durabilidad del almacenamiento. Para conocer el significado exacto de cada opción y los límites de seguridad, consulta [Modos de arranque](/using-minios/Boot-Modes), [Carga de módulos en initrd](/reference/boot-process/Module-Loading), y [Persistencia de initrd](/reference/boot-process/Persistence-Internals).

## Parámetros de arranque para el rendimiento

Los parámetros de arranque pueden trasladar el trabajo de inicio y las lecturas del sistema en vivo entre RAM y el dispositivo de origen. Consulta [Parámetros de arranque](/reference/Boot-Parameters) para la referencia completa.

### Cargar el sistema en RAM (`toram`)

`toram` puede reducir la latencia en tiempo de ejecución desde un dispositivo USB lento o una ISO montada por red, a cambio de un arranque más largo y un uso considerablemente mayor de RAM. El modo bare `toram`utiliza la ruta de copia completa. `toram=trim`suele consumir menos RAM, pero su copia más limitada puede omitir datos o módulos necesarios posteriormente.

Deja espacio para la capa de escritura, aplicaciones, cachés y zram, en lugar de dimensionar solo para los archivos de módulos. Asignar más RAM a la copia en vivo reduce lo disponible para la carga de trabajo. Consulta [Modos de arranque](/using-minios/Boot-Modes) para conocer la durabilidad de la copia y las restricciones al retirar el medio.

### Filtrado de módulos (`load` y `noload`)

El filtrado puede reducir la cantidad de datos copiados y las capas montadas, especialmente con `toram=trim`. El costo es un sistema menos capaz y mayor riesgo de fallos en el arranque o en tiempo de ejecución si se omite alguna dependencia. Verifica el conjunto de módulos resultante; la sintaxis de filtrado y las limitaciones de módulos protegidos se definen en [Carga de módulos en initrd](/reference/boot-process/Module-Loading).

## Optimización de persistencia

La persistencia traslada las operaciones de E/S de la capa de escritura desde el RAM temporal hacia el almacenamiento o un contenedor. La elección del backend afecta la latencia, compatibilidad, gestión de capacidad y complejidad de recuperación.

### Modos de persistencia (`perchmode`)

- **`native`:** Evita una capa de sistema de archivos dentro de un archivo y es la opción más sencilla en un sistema de archivos POSIX adecuado, pero no está disponible en sistemas de archivos que no pueden conservar la metadata requerida por Linux.
- **`raw`:** Tiene capacidad fija predecible y comportamiento ext4 convencional, pero reserva el tamaño del archivo y no puede crecer más allá del espacio disponible en el almacenamiento de respaldo.
- **`dynfilefs`:** El backend FUSE/format-400 se expande bajo demanda y permite el uso de medios que de otro modo no serían aptos, con mayor complejidad de mapeo y recuperación.
- **`dynblk`:** El backend de bloques de kernel format-1 presenta un dispositivo de bloque normal, mientras que el respaldo thin `volumeNNN.db`crece bajo demanda. Evita E/S por FUSE, pero cada dispositivo conectado consume memoria fija para metadata y las escrituras siguen limitadas por el espacio libre del sistema de archivos de respaldo y los límites de admisión dynblk.
- **`luks`:** Añade confidencialidad a cambio de trabajo de desbloqueo y sobrecarga por cifrado.
- **`squashfs`:** Intercambia compresión en el guardado y trabajo de extracción de RAM por una instantánea compacta; no es un backend general de escritura de baja latencia.

Realiza pruebas de carga representativas en el dispositivo real. Las diferencias en el controlador flash, sistema de archivos, puente USB y carga de trabajo influyen más que una clasificación universal de los modos de persistencia.

## Configuración de ZRAM

Zram intercambia tiempo de CPU por capacidad de memoria comprimida y puede evitar el uso de swap en almacenamiento, que es mucho más lento. Un dispositivo zram más grande puede absorber más páginas inactivas, pero no crea RAM física; las cargas de trabajo no comprimibles siguen consumiendo memoria.
Los algoritmos de compresión equilibran el rendimiento y el uso de CPU frente a la tasa de compresión, y su disponibilidad depende del kernel. Comienza con el valor predeterminado y cambia `zramsize`, `zramcomp`, o `nozram`solo para una carga de trabajo medida; consulta [Parámetros de arranque](/reference/Boot-Parameters) para los valores aceptados.

## Sistema de archivos y hardware de almacenamiento

- **Elección del dispositivo:** Un mayor rendimiento secuencial acorta las copias de módulos grandes, mientras que una baja latencia en E/S aleatoria es más importante para cargas de trabajo persistentes en escritorio.
  Mide el dispositivo junto con su carcasa; la generación USB por sí sola no predice el rendimiento de la memoria flash o SSD.
- **Elección del sistema de archivos:** Un sistema de archivos nativo de Linux puede usar persistencia nativa sin la sobrecarga de un contenedor. Los sistemas de archivos multiplataforma mejoran la portabilidad, pero requieren un backend de contenedor compatible para la metadata de Linux, lo que añade capas de mapeo y sistema de archivos. Elige según la portabilidad, necesidades de recuperación y resultados de pruebas de rendimiento.
