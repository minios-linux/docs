---
updated: 2026-08-31
---

# Acerca de MiniOS

MiniOS es una distribución de Linux basada en Debian diseñada principalmente como un sistema operativo portátil. Puede ejecutarse desde medios extraíbles o un disco local, manteniendo el sistema operativo, las aplicaciones y el entorno de usuario independientes de cualquier ordenador en particular.

Una instalación de escritorio convencional se va vinculando gradualmente a la máquina en la que fue instalada. MiniOS adopta un enfoque diferente: el entorno de trabajo puede acompañar al usuario y moverse entre ordenadores compatibles.
La configuración, los archivos, el software instalado y las sesiones persistentes pueden viajar con el sistema en lugar de permanecer en un solo disco interno.

Por lo tanto, MiniOS está pensado para ser más que un entorno temporal en vivo. Su objetivo es ofrecer un sistema Linux portátil completo que sea práctico para el trabajo diario, mantenimiento, recuperación, experimentación y tareas especializadas.

## ¿Qué hace diferente a MiniOS?

### Portátil por diseño

MiniOS se basa en una idea sencilla: **el sistema operativo debe pertenecer al usuario, no al dispositivo en el que se ejecuta**.

El ordenador proporciona el procesador, la memoria, la pantalla, las interfaces de almacenamiento y los periféricos. El entorno de MiniOS puede permanecer en los propios medios del usuario y arrancar en diferentes hardware. Esto convierte al ordenador en el lugar donde el sistema se ejecuta hoy, en vez de ser el lugar al que el sistema pertenece de forma permanente.

### Modular por diseño

MiniOS se ensambla a partir de módulos SquashFS de solo lectura separados, en lugar de una única imagen de sistema grande y escribible. El sistema base, kernel, firmware, escritorio, aplicaciones y software adicional pueden mantenerse como capas independientes.

Los cambios del usuario pueden almacenarse de forma independiente respecto a esos módulos base. Esto permite agregar, reemplazar, desactivar o probar partes del sistema sin tener que reescribir todo el sistema operativo, y facilita volver a un estado base conocido cuando un experimento no funciona como se esperaba.

La modularidad también permite que diferentes ediciones de MiniOS y sistemas personalizados compartan la misma arquitectura en lugar de convertirse en productos no relacionados.

### Pequeño sin sacrificar comodidad

El nombre **MiniOS** refleja un objetivo importante del proyecto: mantener el sistema lo más pequeño posible dentro de lo razonable. Pero el tamaño no se busca a costa de hacer el sistema incómodo, frágil o de utilidad limitada.

Es fácil producir una imagen en vivo muy pequeña si se eliminan el firmware, la localización, el soporte de sistemas de archivos, la persistencia, la integración de escritorio, las herramientas de recuperación y las aplicaciones. Un sistema operativo portátil enfrenta un reto distinto: debe seguir siendo útil incluso cuando se inicia en hardware que no se conocía al crear la imagen.

Por eso, MiniOS busca el **tamaño práctico más pequeño posible, preservando la máxima comodidad, soporte de hardware y funcionalidad razonables**. Un componente no se elimina solo porque aumenta el tamaño de la ISO; la cuestión importante es si el espacio que ocupa aporta suficiente valor práctico.

Por eso, algunas ediciones de MiniOS son más grandes de lo que el nombre podría sugerir inicialmente.
El tamaño adicional es deliberado cuando mejora la usabilidad diaria o hace que el mismo sistema portátil sea útil en una gama más amplia de ordenadores. Los usuarios que necesiten un sistema más pequeño pueden elegir una edición más ligera o un conjunto de módulos reducido, mientras que quienes necesiten una estación de trabajo completa pueden mantener más funcionalidades.

### Debian, no un ecosistema separado

MiniOS está basado en Debian y permanece deliberadamente como parte del ecosistema Debian.
Utiliza paquetes Debian estándar, APT, servicios habituales y convenciones conocidas de Linux. Se añade infraestructura específica de MiniOS solo cuando un sistema modular portátil necesita comportamientos que una instalación convencional no proporciona.

El proyecto prefiere los mecanismos establecidos de Linux cuando ya resuelven el problema, en lugar de reemplazarlos por equivalentes específicos de MiniOS.

### Transparente y adaptable

MiniOS intenta automatizar las tareas rutinarias sin ocultar la estructura del sistema. El usuario puede permanecer dentro de las herramientas gráficas e imágenes listas para usar, pero el mismo sistema también puede inspeccionarse, reconfigurarse, ampliarse con módulos o reconstruirse para un propósito especializado.

Esto permite que MiniOS sirva para diferentes tareas sin dividirse en productos no relacionados. Un escritorio portátil ligero, un kit de recuperación y una estación de trabajo más amplia pueden usar el mismo modelo subyacente y diferenciarse principalmente en los módulos y aplicaciones que incluyen.

## Cómo funciona MiniOS

Al iniciar, MiniOS combina módulos SquashFS de solo lectura en un único sistema de archivos raíz en ejecución y añade una capa de escritura para la sesión actual. Sin persistencia, ese estado de escritura es temporal. Con persistencia, los cambios seleccionados pueden sobrevivir a un reinicio mientras que los módulos base permanecen separados.

El sistema modular en vivo no es solo una opción de instalación: **es el modelo MiniOS que lo define**. Los módulos MiniOS, las sesiones persistentes, la configuración en el arranque, la gestión modular del kernel, la composición de imágenes y las aplicaciones de gestión MiniOS están diseñadas en torno a esta arquitectura en vivo.

El Instalador de MiniOS también ofrece una ruta de instalación **nativa** para usuarios que prefieren un sistema de escritorio convencional sobre un sistema de archivos raíz escribible. La instalación nativa mantiene la experiencia de escritorio familiar de MiniOS —su entorno de escritorio seleccionado, identidad visual y aplicaciones habituales—, pero abandona el modelo modular en vivo: las sesiones MiniOS, los flujos de trabajo de módulos `.sb`, la gestión modular del kernel y las utilidades específicas de MiniOS diseñadas para el modo en vivo se eliminan. El sistema instalado se mantiene entonces como un escritorio Debian convencional con APT, paquetes de kernel de Debian, un initramfs normal y el gestor de arranque instalado.

Para detalles técnicos, consulta [MiniOS system architecture](/reference/System-Architecture).
Para el comportamiento visible de la sesión y las opciones de almacenamiento, consulta [Modos de arranque](/using-minios/Boot-Modes) y [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Ediciones

Las ediciones de MiniOS son diferentes configuraciones de la misma arquitectura, no sistemas operativos separados.

| Edición | Propósito |
|---|---|
| **Standard** | Sistema mínimo con Xfce y funcionalidad básica para el uso diario; recomendado para la mayoría de los usuarios |
| **Toolbox** | Administración y diagnóstico del sistema para trabajo profesional en TI y recuperación del sistema |
| **Ultra** | Escritorio completo con una amplia gama de aplicaciones y herramientas profesionales para creatividad y desarrollo |
| **Flux** | Edición ultra ligera con Fluxbox para un uso mínimo de recursos y hardware antiguo; no recomendada para principiantes |

La disponibilidad exacta de escritorios y paquetes depende de la versión y la plataforma de destino. Para la selección de paquetes mantenidos y las relaciones entre ediciones, consulta [Paquetes y ediciones](/reference/Package-and-Edition-Contents). Para las herramientas específicas de MiniOS disponibles en el sistema, consulta [aplicaciones y herramientas de MiniOS](/using-minios/MiniOS-Applications).

## Próximos pasos

- [Inicio rápido](/getting-started/Quick-Start) — comienza a usar MiniOS.
- [Aplicaciones y herramientas de MiniOS](/using-minios/MiniOS-Applications) — descubre las utilidades incluidas de MiniOS.
- [Arquitectura del sistema MiniOS](/reference/System-Architecture) — comprende en detalle el modelo de módulos, sesiones y arranque.
- [Paquetes y ediciones](/reference/Package-and-Edition-Contents) — compara el contenido mantenido de cada edición.

Recursos del proyecto:

- [Sitio web de MiniOS](https://minios.dev)
- [Código fuente](https://github.com/minios-linux/minios-live)
- [Seguimiento de incidencias](https://github.com/minios-linux/minios-live/issues)
