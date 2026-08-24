# Instalación de MiniOS

Existen dos tareas distintas que a menudo se denominan instalación:

- Grabar el ISO en un medio extraíble crea el medio de arranque utilizado para iniciar una sesión en vivo de MiniOS. Las herramientas de grabación de imágenes sobrescriben el dispositivo seleccionado con la estructura del ISO.
- Ejecutar el [Instalador de MiniOS](/installation/MiniOS-Installer.md) desde una sesión en vivo despliega MiniOS en otro disco. Puede crear una instalación modular en vivo o una instalación nativa de Linux convencional.

## Descarga y verifica el ISO

Descarga un ISO desde el [sitio web oficial](https://minios.dev) o desde la página oficial de [GitHub Releases](https://github.com/minios-linux/minios-live/releases). Verifícalo antes de grabarlo en un dispositivo; consulta [Verificación de descargas](/installation/Verifying-Downloads.md).

## Graba un medio de arranque

Elige un método según tu sistema operativo:

- [Rufus](/installation/tools/Rufus.md) en Windows
- [Ventoy](/installation/tools/Ventoy.md) en Windows o Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) en Windows, Linux o macOS
- [`dd`](/installation/tools/dd.md) en Linux o macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) en Linux
- [UNetbootin](/installation/tools/UNetbootin.md) en Windows, Linux o macOS
- [Método original](/installation/tools/Original-Method.md) para una estructura de archivos MiniOS

Grabar una imagen con Rufus, Etcher, `dd` o Drive Utility es destructivo. Confirma la ruta, modelo y capacidad del dispositivo antes de comenzar. Estas herramientas crean medios de arranque; no realizan un despliegue en vivo o nativo con MiniOS Installer.

Ventoy es diferente: instala Ventoy en el dispositivo y luego copia el ISO a su partición de datos. Esto mantiene la estructura multiboot de Ventoy.

## Inicia la sesión en vivo

1. Reinicia el equipo y abre el menú de arranque del firmware.
2. Selecciona el dispositivo USB u otro medio de arranque.
3. Inicia MiniOS y verifica que el almacenamiento, la red y los dispositivos de entrada funcionen correctamente.

La configuración del firmware varía según el equipo. Una imagen de MiniOS puede arrancar mediante BIOS o UEFI; el destino de una posterior instalación con MiniOS Installer no está limitado a MBR.

## Elige una estructura de instalación

Desde la sesión en vivo, inicia el [Instalador de MiniOS](/installation/MiniOS-Installer.md) cuando desees instalar MiniOS en otra unidad USB, SSD o disco duro.

- El modo en vivo conserva la pila de módulos comprimidos y la estructura de arranque en vivo. Permite la persistencia opcional de la sesión y es ideal para instalaciones portátiles.
- El modo nativo expande los módulos seleccionados en un sistema de archivos raíz de Linux convencional, genera el initramfs e instala un gestor de arranque compatible. El modo nativo solo está disponible cuando la imagen de arranque proporciona los metadatos requeridos para el instalador.

El instalador admite estructuras automáticas BIOS/MBR, UEFI/MBR y UEFI/GPT. BIOS en GPT no es compatible con el instalador actual. Consulta [Uso del Instalador de MiniOS](/installation/MiniOS-Installer.md) para información sobre ubicación, sistema de archivos, persistencia y límites de particionado.
