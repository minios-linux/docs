---
updated: 2026-09-17
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

- **`native`:** Almacena la capa editable directamente como archivos normales. Tiene la menor sobrecarga de contenedor y no tiene un tamaño fijo, pero requiere un sistema de archivos compatible que conserve los metadatos y operaciones de Linux que MiniOS necesita.
- **`raw`:** Utiliza una sola imagen ext4 de capacidad fija. El tamaño del archivo se establece según la capacidad solicitada y el crecimiento es explícito, por lo que es simple y predecible, pero no tiene el comportamiento de capacidad dinámica de los backends dinámicos. FAT32 limita la imagen única a 4000 MiB.
- **`dynfilefs`:** El backend FUSE/format-400 expande el almacenamiento de datos bajo demanda y permite usar medios que de otro modo serían inadecuados. Su índice no es disperso: cada bloque lógico de 4 KiB necesita un desplazamiento de 8 bytes, así que la capacidad lógica cuesta aproximadamente 2 MiB de RAM y unos 2 MiB de almacenamiento para el índice de respaldo por GiB, incluso si la carga útil está vacía. Esto hace que capacidades moderadas sean eficientes, pero capacidades delgadas grandes resulten costosas desde el inicio.
- **`dynblk`:** El backend de kernel format-1 `DBSPRS01` mantiene las tablas de mapeo en disco y una caché de metadatos limitada en RAM (por defecto 1 MiB). Llenar un dispositivo existente no asigna un mapa residente completo. Las descripciones de extensiones y los directorios escalan según las partes declaradas; la caché de archivos y la memoria del códec son adicionales. `dynblk limits --format dynblk` informa el límite de la geometría; `dynblk status /dev/dynblkN --json` informa los búferes contabilizados y las estadísticas de caché. Las sobrescrituras directas permanecen en su lugar; las actualizaciones comprimidas parciales actualmente recomprimen un bloque de 64 KiB. Elija la política de caché de adjuntos de forma deliberada: `unsafe` renuncia a las garantías de durabilidad.
- **`squashfs`:** Almacena una instantánea comprimida y reconstruye la capa editable superior en RAM en cada inicio. Minimiza el almacenamiento persistente para sesiones mayormente estables, pero implica costos de CPU y RAM durante la restauración y vuelve a escribir la instantánea al guardar.

LUKS2 puede envolver Raw, DynFileFS o DynBlk. El cifrado añade sobrecarga al desbloquear y procesar, pero mantiene la capacidad y el comportamiento de almacenamiento del backend subyacente.

Realice pruebas de rendimiento con cargas representativas en el dispositivo real. Las diferencias en el controlador flash, sistema de archivos, puente USB, cifrado, compresión y tipo de carga son más determinantes que una clasificación universal de los modos de persistencia.

## Configuración de ZRAM

Zram intercambia tiempo de CPU por capacidad de memoria comprimida y puede evitar el uso de swap en almacenamiento, que es mucho más lento. Un dispositivo zram más grande puede absorber más páginas inactivas, pero no crea RAM física; las cargas de trabajo no comprimibles siguen consumiendo memoria.
Los algoritmos de compresión equilibran el rendimiento y el uso de CPU frente a la tasa de compresión, y su disponibilidad depende del kernel. Comienza con el valor predeterminado y cambia `zramsize`, `zramcomp`, o `nozram`solo para una carga de trabajo medida; consulta [Parámetros de arranque](/reference/Boot-Parameters) para los valores aceptados.

## Sistema de archivos y hardware de almacenamiento

- **Elección del dispositivo:** Un mayor rendimiento secuencial acorta las copias de módulos grandes, mientras que una baja latencia en E/S aleatoria es más importante para cargas de trabajo persistentes en escritorio.
  Mide el dispositivo junto con su carcasa; la generación USB por sí sola no predice el rendimiento de la memoria flash o SSD.
- **Elección del sistema de archivos:** Un sistema de archivos nativo de Linux puede usar persistencia nativa sin la sobrecarga de un contenedor. Los sistemas de archivos multiplataforma mejoran la portabilidad, pero requieren un backend de contenedor compatible para la metadata de Linux, lo que añade capas de mapeo y sistema de archivos. Elige según la portabilidad, necesidades de recuperación y resultados de pruebas de rendimiento.
