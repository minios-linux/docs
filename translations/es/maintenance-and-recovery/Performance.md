---
updated: 2026-09-16
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

- **`native`:** Almacena la capa de escritura directamente como archivos normales. Tiene la menor sobrecarga de contenedor y no tiene un tamaño fijo, pero requiere un sistema de archivos subyacente que conserve los metadatos y operaciones de Linux que MiniOS necesita.
- **`raw`:** Utiliza una única imagen ext4 de capacidad fija. Su tamaño se establece según la capacidad solicitada y el crecimiento es explícito, por lo que es simple y predecible, pero carece del comportamiento de capacidad dinámica de los backends dinámicos. FAT32 limita la imagen única a 4000 MiB.
- **`dynfilefs`:** El backend FUSE/format-400 expande el almacenamiento de datos bajo demanda y es compatible con medios que de otro modo no serían adecuados. Su índice no es disperso: cada bloque lógico declarado de 4 KiB requiere un desplazamiento de 8 bytes, por lo que la capacidad lógica cuesta aproximadamente 2 MiB de RAM y unos 2 MiB de almacenamiento de índice de respaldo por GiB, incluso cuando la carga útil está vacía. Esto hace que capacidades moderadas sean eficientes, pero capacidades grandes y delgadas resultan costosas desde el inicio.
- **`dynblk`:** El backend de bloques de kernel format-1 presenta un dispositivo de bloques normal mientras que el almacenamiento thin `volumeNNN.db` crece bajo demanda. Las asignaciones en tiempo de ejecución son dispersas y asignan un bloque de 4 KiB para 128 bloques lógicos, por lo que los datos densamente asignados cuestan unos 8 MiB de RAM por GiB, pero la capacidad virtual no asignada no consume bloques de asignación. El índice interno fijo ocupa solo 396.312 bytes por dispositivo conectado y los contadores de referencia de página son dispersos. El controlador, no MiniOS, elige el presupuesto de asignación predeterminado en aproximadamente el 25% del RAM utilizable, con un límite de 4096 MiB. Esto favorece capacidades grandes y dispersas; un volumen lleno densamente puede consumir más RAM por GiB que DynFileFS.
- **`squashfs`:** Almacena una instantánea comprimida y reconstruye la capa superior de escritura en RAM en cada arranque. Minimiza el almacenamiento persistente para sesiones mayormente estables, pero implica costos de CPU y RAM durante la restauración y reescribe la instantánea al guardar.

LUKS2 puede envolver Raw, DynFileFS o DynBlk. El cifrado añade sobrecarga de desbloqueo y criptografía, manteniendo la capacidad y el comportamiento de almacenamiento del backend subyacente.

Realice pruebas comparativas de cargas de trabajo representativas en el dispositivo real. Las diferencias en el controlador flash, sistema de archivos, puente USB, cifrado, compresión y tipo de carga de trabajo son más relevantes que una clasificación universal de los modos de persistencia.

## Configuración de ZRAM

Zram intercambia tiempo de CPU por capacidad de memoria comprimida y puede evitar el uso de swap en almacenamiento, que es mucho más lento. Un dispositivo zram más grande puede absorber más páginas inactivas, pero no crea RAM física; las cargas de trabajo no comprimibles siguen consumiendo memoria.
Los algoritmos de compresión equilibran el rendimiento y el uso de CPU frente a la tasa de compresión, y su disponibilidad depende del kernel. Comienza con el valor predeterminado y cambia `zramsize`, `zramcomp`, o `nozram`solo para una carga de trabajo medida; consulta [Parámetros de arranque](/reference/Boot-Parameters) para los valores aceptados.

## Sistema de archivos y hardware de almacenamiento

- **Elección del dispositivo:** Un mayor rendimiento secuencial acorta las copias de módulos grandes, mientras que una baja latencia en E/S aleatoria es más importante para cargas de trabajo persistentes en escritorio.
  Mide el dispositivo junto con su carcasa; la generación USB por sí sola no predice el rendimiento de la memoria flash o SSD.
- **Elección del sistema de archivos:** Un sistema de archivos nativo de Linux puede usar persistencia nativa sin la sobrecarga de un contenedor. Los sistemas de archivos multiplataforma mejoran la portabilidad, pero requieren un backend de contenedor compatible para la metadata de Linux, lo que añade capas de mapeo y sistema de archivos. Elige según la portabilidad, necesidades de recuperación y resultados de pruebas de rendimiento.
