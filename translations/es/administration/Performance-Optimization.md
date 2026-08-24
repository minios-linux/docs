# Guía de Optimización de Rendimiento

Esta guía ofrece técnicas para optimizar el rendimiento de MiniOS, enfocándose en sus características únicas como sistema live. Las mayores mejoras de rendimiento se logran ajustando cómo MiniOS carga sus datos y gestiona los cambios persistentes.

## Parámetros de Arranque para el Rendimiento

La forma más efectiva de aumentar el rendimiento, especialmente al ejecutar desde una unidad USB lenta, es utilizando parámetros de arranque para controlar cómo el sistema se carga en memoria. Para ver la lista completa de parámetros disponibles, consulta [Parámetros de Arranque](/configuration/Boot-Parameters.md).

### Cargar el Sistema en RAM (`toram`)

Esta es la optimización más importante. El parámetro de arranque `toram` copia todo el sistema MiniOS desde el medio de arranque a la RAM de tu equipo. Esto hace que el sistema sea increíblemente ágil, ya que no necesita leer datos desde la unidad USB, que es más lenta.

- **Uso:** Añade `toram` a la línea de comandos del kernel al arrancar.
- **Requisito:** Necesitas suficiente RAM para alojar los módulos principales del sistema. Para la edición `standard`, se recomienda al menos 2-3 GB de RAM libre.
- **Ventaja:** Mejora drásticamente los tiempos de inicio de aplicaciones y la fluidez general del sistema.

Hay dos modos para `toram`:

- **`toram=full` (Por defecto):** Copia todos los módulos del sistema a la RAM. Utilízalo si tienes suficiente memoria.
- **`toram=trim`:** Copia solo los módulos esenciales definidos por los parámetros de arranque `load` y `noload`. Es útil para equipos con RAM limitada.

### Filtrado de Módulos (`load` y `noload`)

Para reducir el uso de memoria, puedes especificar qué módulos cargar. Esto es especialmente efectivo en combinación con `toram=trim`.

- **`load=module1,module2`:** Carga solo los módulos especificados (por ejemplo, `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name`:** Excluye un módulo específico para que no se cargue.

Esto te permite crear un sistema ligero en RAM, adaptado a tus necesidades.

## Optimización de Persistencia

La forma en que MiniOS guarda tus cambios (persistencia) puede afectar significativamente el rendimiento, especialmente la velocidad de escritura.

### Modos de Persistencia (`perchmode`)

El parámetro de arranque `perchmode` define el backend para el almacenamiento persistente. La elección depende de tu dispositivo de almacenamiento:

- **`perchmode=native` (Por defecto):** Guarda los archivos directamente en un directorio de tu dispositivo de almacenamiento. Es la **opción más rápida para SSDs y unidades USB rápidas** ya que evita la sobrecarga de sistemas de archivos dentro de un archivo.
- **`perchmode=raw`:** Utiliza un archivo de imagen raw preasignado para los cambios. El rendimiento es bueno, pero el tamaño del archivo es fijo.
- **`perchmode=dynfilefs`:** Usa un archivo que se expande dinámicamente. Es una buena opción para **unidades USB flash más lentas** ya que puede reducir la amplificación de escritura y potencialmente alargar la vida útil de la unidad, aunque puede ser ligeramente más lento que el modo `native`.

### Habilitar y Deshabilitar la Persistencia

Por defecto, MiniOS se ejecuta en modo "live" y todos los cambios se descartan al reiniciar. Para guardar tus cambios, debes habilitar la persistencia explícitamente.

- **Para habilitar la persistencia:** Añade el parámetro `perch` a la línea de comandos de arranque. Esto indica a MiniOS que active el mecanismo de persistencia.
- **Para deshabilitar la persistencia:** Simplemente no añadas el parámetro `perch`. Si no está presente, el sistema funcionará completamente desde la RAM (o el dispositivo de arranque) y no se guardarán los cambios.

## Configuración de ZRAM

MiniOS utiliza `zram` por defecto para crear un espacio de intercambio comprimido en tu RAM. Esto mejora el rendimiento en sistemas con memoria física limitada al evitar el uso de un archivo de intercambio en disco, que es mucho más lento.

**Dimensionamiento automático:**
- **≥4GB RAM:** 2GB de ZRAM
- **1-4GB RAM:** La mitad de la RAM total
- **<1GB RAM:** 512MB de ZRAM

**Parámetros de arranque:**
- **`zramsize=1024`:** Establece el tamaño del dispositivo zram (por ejemplo, `zramsize=1024` para 1GB). Por defecto, se configura automáticamente según tu RAM total.
- **`zramcomp=lz4`:** Define el algoritmo de compresión (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` suele ofrecer un buen equilibrio entre velocidad y relación de compresión.
- **`nozram`:** Desactiva completamente ZRAM.

Para la mayoría de los usuarios, la configuración predeterminada de `zram` es óptima. Solo se recomienda ajustarla si tienes necesidades específicas y comprendes los compromisos involucrados.

## Sistema de Archivos y Hardware de Almacenamiento

- **Utiliza una unidad USB rápida:** El factor de hardware más importante para el rendimiento de MiniOS es la velocidad de tu unidad USB. Usar una **unidad USB 3.0 o SSD basada en USB** proporcionará una experiencia mucho mejor que una memoria USB 2.0 lenta y económica.
- **Elección del sistema de archivos:** Para la partición de persistencia, utilizar un sistema de archivos Linux estándar como **ext4** generalmente ofrece el mejor rendimiento y fiabilidad.
