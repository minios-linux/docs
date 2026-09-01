---
updated: 2026-08-31
---

# Métodos de instalación

MiniOS es un sistema operativo orientado al modo live. Instalar MiniOS normalmente significa colocar su sistema modular live en un medio extraíble u otro disco, por lo que escribir o copiar MiniOS en una unidad USB es en sí mismo un método de instalación y no solo una preparación para una instalación posterior.

Existen dos grandes familias de instalación:

- **Instalación live** mantiene la pila de módulos MiniOS, la configuración en el arranque, la persistencia de sesión y los flujos de trabajo de gestión de MiniOS. La escritura de imagen sin procesar, la instalación basada en archivos, Ventoy y el modo Live del Instalador de MiniOS producen formas de ejecutar el sistema live de MiniOS.
- **Instalación nativa** es una conversión opcional realizada por el [Instalador de MiniOS](/installing-minios/MiniOS-Installer). Crea un escritorio Debian convencional a partir de la imagen MiniOS seleccionada, manteniendo su entorno de escritorio, identidad visual y aplicaciones habituales, mientras elimina el software específico de MiniOS que existe solo para la arquitectura live.

## Descargar y verificar el ISO

Descarga un ISO desde el [sitio web oficial](https://minios.dev), la página oficial de [GitHub Releases](https://github.com/minios-linux/minios-live/releases) o [SourceForge](https://sourceforge.net/projects/minios-linux/). Verifícalo antes de grabarlo en un dispositivo; consulta [Verificar descargas](/installing-minios/Verifying-Downloads).

## Instalar MiniOS en medios extraíbles

Elige el método según la disposición que desees en el dispositivo de destino:

| Resultado | Método | Qué obtienes |
|---|---|---|
| Sistema de archivos normal y escribible que también inicia MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) en modo ISO o [instalación manual basada en archivos](/installing-minios/Manual-File-Based-Installation) | Archivos MiniOS y gestor de arranque en un sistema de archivos normal; el espacio restante sigue disponible para archivos comunes |
| Dispositivo multiboot con soporte de persistencia MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partición de datos Ventoy para archivos ISO más soporte de sesión persistente MiniOS |
| Instalación modular gestionada de MiniOS | [Instalador de MiniOS](/installing-minios/MiniOS-Installer) en modo **Live** | Disposición modular de MiniOS con almacenamiento persistente opcional configurado por el instalador |
| Copia exacta, bloque por bloque, del ISO publicado | [Rufus](/installing-minios/installation-tools/Rufus) en modo DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilidad de disco](/installing-minios/installation-tools/Drive-Utility), o [`dd`](/installing-minios/installation-tools/dd) | La disposición de bloques del ISO exactamente; simple y predecible, pero el destino ya no se comporta como una memoria USB de uso general |

::: danger La escritura de imagen sin procesar sobrescribe la disposición del destino
El modo DD de Rufus, Etcher, la escritura de imagen con Utilidad de disco y `dd` reemplazan la disposición de bloques existente del dispositivo. Confirma el modelo y la capacidad del destino y haz una copia de seguridad de todo lo importante antes de comenzar. Esta advertencia no aplica a modo ISO de Rufus, Ventoy ni a una instalación basada en archivos.
:::

## Iniciar la sesión en vivo

1. Reinicia el equipo y abre el menú de arranque del firmware.
2. Selecciona el dispositivo USB u otro medio de arranque.
3. Inicia MiniOS y verifica que el almacenamiento, la red y los dispositivos de entrada funcionen correctamente.

La configuración del firmware varía según el equipo. Una imagen de MiniOS puede arrancar mediante BIOS o UEFI; el destino de una posterior implementación del Instalador de MiniOS no está limitado a MBR.

Utiliza [Modos de arranque](/using-minios/Boot-Modes) como la guía principal sobre el comportamiento del arranque en vivo. Si el arranque temprano no puede encontrar la imagen o sus módulos, consulta [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery).

## Elige una disposición instalada

Desde la sesión live, inicia el [Instalador de MiniOS](/installing-minios/MiniOS-Installer) cuando quieras el sistema en otra unidad USB, SSD o disco duro.

- **Modo Live** preserva la pila de módulos comprimidos, la disposición de arranque MiniOS, las herramientas de gestión MiniOS y la persistencia de sesión opcional. Elige esta opción si quieres MiniOS en el disco de destino.
- **Modo nativo** expande la imagen seleccionada en un escritorio Debian convencional y escribible. El destino mantiene el entorno de escritorio, la identidad visual y las aplicaciones habituales de la edición seleccionada, mientras que el entorno live MiniOS y el software de gestión específico de live se eliminan. El sistema instalado utiliza un initramfs, gestor de arranque, paquetes de kernel y flujo de trabajo de gestión de paquetes convencionales de Debian.

::: warning La instalación nativa utiliza un modelo de sistema diferente
La arquitectura definitoria de MiniOS es el sistema modular live descrito en [Acerca de MiniOS](/getting-started/About-MiniOS). El modo nativo mantiene la experiencia de escritorio familiar de MiniOS, incluyendo su identidad visual, entorno de escritorio y aplicaciones habituales, pero convierte el sistema en una instalación Debian convencional. Las herramientas específicas de MiniOS para sesiones, módulos, kernels modulares y otros flujos de trabajo live se eliminan porque esas funciones ya no aplican. Elige una instalación live si deseas el conjunto completo de características de MiniOS.
:::

La persistencia live se prepara durante el arranque inicial; el comportamiento detallado se describe en [Persistencia de Initrd](/reference/boot-process/Persistence-Internals). No aplica después de la conversión nativa.

El instalador admite disposiciones automáticas BIOS/MBR, UEFI/MBR y UEFI/GPT. BIOS sobre GPT no es compatible con el instalador actual. Consulta [Uso del Instalador de MiniOS](/installing-minios/MiniOS-Installer) para información sobre ubicación, sistema de archivos, persistencia y límites de particionamiento.
