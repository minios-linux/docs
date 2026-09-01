---
updated: 2026-08-31
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Instalador de MiniOS

El Instalador de MiniOS es un asistente GTK y backend de línea de comandos para desplegar un sistema desde una sesión en vivo de MiniOS en ejecución. Grabar o copiar MiniOS a un medio extraíble ya es un método de instalación; el Instalador de MiniOS es la herramienta de despliegue gestionado que se utiliza cuando se desea un diseño de destino controlado, configuración de persistencia o conversión nativa opcional.

## Antes de comenzar

Una elección incorrecta de destino o particionado puede destruir datos. Haz una copia de seguridad de los archivos importantes, desconecta los discos que no sean necesarios e identifica el disco de destino por ruta de dispositivo, modelo y capacidad. La confirmación final es el último punto en el que la instalación puede cancelarse de forma segura.

El disco que contiene el sistema en vivo de MiniOS en ejecución queda excluido de la selección de destino. Para orientación general sobre capacidad, consulta la [Guía de compatibilidad de hardware](/getting-started/Hardware-Compatibility).

## Modos de instalación

El **modo en vivo** copia los módulos comprimidos seleccionados de MiniOS y los recursos de arranque. El resultado sigue siendo MiniOS: mantiene la estructura modular del sistema en vivo, la configuración de arranque MiniOS, los flujos de trabajo de gestión MiniOS y la persistencia de sesión opcional.

El **modo nativo** crea un escritorio Debian convencional a partir de la imagen seleccionada de MiniOS. Expande los módulos seleccionados en un sistema de archivos raíz escribible, mantiene el entorno de escritorio elegido y las aplicaciones habituales, elimina el entorno en vivo MiniOS y las utilidades específicas del modo en vivo, instala los paquetes Debian requeridos, genera un initramfs convencional e instala el gestor de arranque. El instalador detecta el soporte nativo desde la imagen arrancada. Si faltan los metadatos requeridos del kernel y el contrato de arquitectura EFI, el modo de compatibilidad solo permite la instalación en modo en vivo.

::: warning El modo nativo cambia la forma en que se gestiona el sistema
El sistema instalado mantiene la experiencia de escritorio familiar de MiniOS — su apariencia, entorno de escritorio seleccionado y aplicaciones habituales — pero ya no utiliza la arquitectura en vivo MiniOS. Durante la conversión, el instalador elimina los paquetes `minios-*` y otras utilidades específicas del modo en vivo, ya que las sesiones, los módulos `.sb`, la gestión modular del kernel y la configuración de arranque en vivo ya no aplican. Tras reiniciar, mantén el sistema como un escritorio Debian convencional usando APT, los paquetes de kernel de Debian, el initramfs normal y el gestor de arranque instalado. Consulta [Acerca de MiniOS](/getting-started/About-MiniOS).
:::

Este despliegue es diferente a grabar una ISO sin procesar, una configuración multiboot de archivo ISO Ventoy o una instalación en vivo basada en archivos. Consulta [Métodos de instalación](/installing-minios/Installation-Methods) para ver la diferencia.

## Iniciar el instalador gráfico

Abre el menú de aplicaciones, selecciona Sistema y luego selecciona Instalador de MiniOS. También se puede iniciar desde una terminal:

```bash
sudo minios-installer
```

El asistente recopila el modo de instalación, seguridad, ubicación, red cableada, teclado, cuenta, módulo, almacenamiento y configuración de arranque. Revisa la geometría exacta de las particiones y el resumen de operaciones antes de aceptar la confirmación final destructiva.

## Ubicación y esquemas de arranque

El instalador gráfico ofrece estas opciones de ubicación cuando el destino es elegible:

- Borrar todo crea una nueva tabla de particiones y destruye todos los datos en el disco de destino.
- Espacio libre utiliza el espacio no asignado adecuado sin reducir un sistema de archivos existente.
- Junto a reduce una partición final ext2, ext3, ext4 o NTFS elegible y desmontada. Se rechazan los esquemas sucios, montados, anidados, ambiguos o inseguros. El instalador puede solicitar confirmación antes de descargar herramientas de sistema de archivos faltantes.
- El particionado manual solo está disponible para conversiones nativas en la interfaz gráfica sobre discos directos elegibles. Los cambios se preparan hasta la confirmación final.

Los esquemas de arranque automáticos son BIOS/MBR, UEFI/MBR y UEFI/GPT. UEFI funciona con esquemas GPT o MBR primario. BIOS es compatible solo con MBR primario, no con GPT. No se admiten esquemas extendidos o lógicos de preservación MBR.

El modo manual permite crear, eliminar, formatear y reutilizar particiones; reducir un sistema de archivos compatible desde su extremo; asignar puntos de montaje, una partición EFI del sistema y swap; y deshacer o restablecer los cambios preparados. No es compatible con LVM, RAID, raíces LUKS nativas, almacenamiento mapeado o anidado, bcache, ZFS ni edición de subvolúmenes Btrfs. La persistencia de sesión LUKS no cifra un sistema de archivos raíz nativo.

## Sistemas de archivos

- Los esquemas en vivo pueden usar ext2, ext4, Btrfs, FAT32 o NTFS cuando las herramientas necesarias están instaladas.
- El sistema de archivos raíz creado por conversión nativa puede usar ext2, ext4 o Btrfs. Ext4 es la opción predeterminada de uso general.
- Los sistemas de archivos ext3 existentes pueden reutilizarse o reducirse donde sea compatible, pero ext3 no se ofrece para nuevo formateo.
- FAT32 está limitado a archivos menores de 4 GiB y solo está disponible para esquemas en vivo.
- NTFS solo está disponible para esquemas en vivo, aunque una partición NTFS elegible puede reducirse para la opción junto a.

El espacio requerido incluye los datos de los módulos seleccionados, recursos de arranque, persistencia solicitada y una reserva del 25 por ciento del sistema de archivos. El espacio EFI y swap nativo se calculan por separado.

## Configuración y seguridad

El instalador puede establecer el idioma, zona horaria, teclado, nombre de usuario, contraseñas, grupos de usuario, nombre de host, servicios, menú de arranque y selección de módulos. Seleccionar un módulo superior de MiniOS incluye sus capas inferiores requeridas.

Los perfiles de seguridad son `convenient`, `balanced` y `strict`. El modo en vivo utiliza por defecto `convenient`; la conversión nativa comienza desde `balanced`. Los controles de SSH y XRDP son independientes del perfil seleccionado. Revisa los servicios de acceso remoto antes de la primera conexión de red. Tras la conversión nativa, la configuración de seguridad posterior sigue el flujo de trabajo normal de administración de sistemas Debian.

La configuración de red cubre el nombre de host y DHCP por cable o IPv4 estática. El instalador no crea ni modifica perfiles Wi-Fi. La conversión nativa y algunas operaciones junto a pueden requerir acceso a red, con tu consentimiento, para obtener GRUB, EFI, initramfs, `os-prober` o paquetes de redimensionamiento de sistemas de archivos antes de realizar cambios en el disco.

## Persistencia de la sesión en vivo

La persistencia solo aplica a instalaciones en vivo:

- El modo de persistencia `native` almacena los cambios de la sesión en vivo directamente en un sistema de archivos de destino compatible con POSIX. A pesar del nombre, este es un **backend de persistencia en vivo** y no está relacionado con la instalación nativa. No se ofrece en FAT32 ni NTFS.
- DynFileFS utiliza un contenedor expandible.
- Raw utiliza una imagen de tamaño fijo.
- LUKS utiliza una imagen cifrada creada por el initrd en el primer arranque. La frase de contraseña se solicita al arrancar y nunca es recibida ni almacenada por el instalador.

Los modos de contenedor tienen un valor predeterminado de 4000 MiB. Los contenedores Raw y LUKS no pueden exceder los 4000 MiB en FAT32; DynFileFS no está sujeto a ese límite de archivo único. LUKS solo se ofrece cuando tanto el initrd en ejecución como cada initrd de origen copiado anuncian el soporte criptográfico requerido.

Las opciones de arranque resultantes usan `perchmode` y `perchsize`. Consulta [Persistencia en initrd](/reference/boot-process/Persistence-Internals) y [Parámetros de arranque](/reference/Boot-Parameters) para su significado en tiempo de ejecución y requisitos de activación.

## Despliegue por línea de comandos

`minios-deploy` está pensado para automatización, pruebas y recuperación. El particionado manual y la configuración interactiva de red cableada siguen siendo solo para la interfaz gráfica.

Lista los discos reconocidos como instalables:

```bash
minios-deploy list-disks
```

Reemplaza `/dev/sdb` en cada ejemplo con el disco de destino verificado. Primero imprime un plan no destructivo:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Previsualiza los comandos de despliegue coincidentes sin escribir en el disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Ejecuta la instalación real solo después de comprobar el plan, la identidad del destino y la salida de la simulación. `--yes` autoriza los cambios destructivos:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Si deseas deliberadamente una conversión nativa en espacio libre existente, utiliza las mismas opciones de almacenamiento para la planificación y la instalación:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversión nativa puede no aparecer en la ayuda CLI en una imagen que no tenga soporte para instalación nativa. La CLI también acepta opciones de configuración para cuentas, idioma, zona horaria, teclado, nombre de host, servicios y una base `config.conf`. Consulta las opciones exactas proporcionadas por la imagen en ejecución:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` y `--root-password` en entornos compartidos, ya que los argumentos en texto plano de la línea de comandos pueden quedar expuestos en el historial del shell y la lista de procesos. Utiliza el instalador gráfico o un flujo de configuración protegido en su lugar.
