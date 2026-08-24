# Acerca de MiniOS

MiniOS es una distribución de Linux basada en Debian, diseñada para ejecutarse desde medios extraíbles o un disco local. Su sistema de solo lectura se ensambla a partir de módulos SquashFS, con sesiones opcionales de escritura para archivos, configuraciones y paquetes instalados. MiniOS es compatible con sistemas x86 de 64 bits y puede arrancar mediante UEFI o BIOS heredado.

## Modelo de sistema

- El sistema base y el software opcional son módulos separados. Los módulos pueden seleccionarse al arrancar o añadirse sin reconstruir todo el sistema.
- Una sesión en vivo nueva deja los módulos base sin cambios.
- La persistencia puede guardar cambios en un directorio nativo, un contenedor DynFileFS expandible, una imagen raw de tamaño fijo o un contenedor cifrado LUKS, dependiendo de la instalación y el sistema de archivos de destino.
- El instalador de MiniOS puede realizar una instalación modular en vivo o, cuando la imagen lo permite, desplegar una instalación Linux nativa convencional.

Consulta [Arquitectura del sistema](/about/System-Architecture.md) para el esquema de arranque y módulos, y [Gestión de sesiones](/configuration/Session-Management.md) para sesiones persistentes.

## Ediciones

Las ediciones disponibles dependen de la versión y la distribución base:

- **Minimum** utiliza el entorno Flux y un conjunto reducido de paquetes. Es adecuada para sistemas donde se prefiere una selección de software más pequeña.
- **Standard** es la edición de propósito general. Las compilaciones actuales estándar de Debian y Ubuntu utilizan Xfce.
- **Toolbox** añade herramientas de administración del sistema, almacenamiento, diagnóstico y recuperación.
- **Ultra** incorpora un conjunto de aplicaciones más amplio sobre las demás ediciones.

Xfce es el escritorio habitual en las imágenes Standard, Toolbox y Ultra, pero no es el único entorno disponible en MiniOS. Minimum utiliza Flux y las configuraciones de compilación compatibles pueden ofrecer otros entornos. Consulta la descripción de la versión antes de descargar si el entorno de escritorio es importante para ti.

Para conocer el software incluido en cada edición, consulta la [lista de paquetes](/administration/Packages.md).

## Instalación y persistencia

Un ISO puede grabarse como imagen de arranque, copiarse a un dispositivo multiboot o instalarse con el instalador de MiniOS. Estos métodos no tienen un comportamiento de almacenamiento idéntico. Las herramientas de grabación de imágenes como `dd` y Etcher reproducen la estructura del ISO; Ventoy inicia el archivo ISO; el instalador de MiniOS puede asignar y configurar almacenamiento de sesión escribible. No asumas que un método de grabación crea persistencia.

Comienza con la [Guía rápida](/installation/Quick-Start.md) y utiliza la guía enlazada para el método de instalación seleccionado. La persistencia también puede seleccionarse desde un menú de arranque adecuado o configurarse con los parámetros de arranque documentados cuando haya almacenamiento escribible disponible.

## Recursos del proyecto

- [Sitio web de MiniOS](https://minios.dev)
- [Código fuente](https://github.com/minios-linux/minios-live)
- [Seguimiento de incidencias](https://github.com/minios-linux/minios-live/issues)
