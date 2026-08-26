---
updated: 2026-08-26
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Uso del instalador de MiniOS

MiniOS Installer es un asistente GTK con backend de línea de comandos para desplegar MiniOS desde una sesión en vivo de MiniOS. Instala en un disco de destino; no es lo mismo que grabar una ISO en un medio de arranque.

## Antes de comenzar

Una elección incorrecta de destino o particionado puede destruir datos. Haz una copia de seguridad de los archivos importantes, desconecta los discos que no sean necesarios e identifica el destino por ruta de dispositivo, modelo y capacidad. La confirmación final es el último punto en el que se puede cancelar la instalación de forma segura.

El disco que contiene el sistema MiniOS live en ejecución se excluye de la selección de destino. Para orientación general sobre la capacidad, consulta la [Guía de compatibilidad de hardware](Hardware-Compatibility.md).

## Modos de instalación

El modo live copia los módulos comprimidos de MiniOS seleccionados y los recursos de arranque. El resultado mantiene la estructura modular del sistema live y puede utilizar persistencia de sesión MiniOS.

El modo nativo expande los módulos seleccionados en un sistema de archivos raíz Linux convencional, configura el destino, instala los paquetes necesarios, genera el initramfs e instala el gestor de arranque. El instalador detecta el soporte nativo desde la imagen arrancada. Si faltan los metadatos de kernel requeridos y el contrato de arquitectura EFI, el modo de compatibilidad solo permite la instalación live.

Este despliegue es diferente de escribir una ISO en bruto, una configuración multiboot de archivo ISO con Ventoy o una herramienta de medios live basada en archivos. Consulta [Modos de arranque](/configuration/Boot-Modes.md) para conocer el límite entre sistemas live y nativos.

## Iniciar el instalador gráfico

Abre el menú de aplicaciones, selecciona Sistema y luego Instalar MiniOS. También se puede iniciar desde una terminal:

```bash
sudo minios-installer
```

El asistente recopila el modo de instalación, seguridad, ubicación, red cableada, teclado, cuenta, módulos, almacenamiento y opciones de arranque. Revisa la geometría exacta de las particiones y el resumen de operaciones antes de aceptar la confirmación final destructiva.

## Ubicación y esquemas de arranque

El instalador gráfico ofrece estas opciones de ubicación cuando el destino es elegible:

- Borrar todo crea una nueva tabla de particiones y destruye todos los datos en el disco de destino.
- Espacio libre utiliza espacio sin asignar adecuado sin reducir un sistema de archivos existente.
- Junto a reduce una partición final elegible, desmontada, ext2, ext3, ext4 o NTFS. Se rechazan esquemas sucios, montados, anidados, ambiguos o inseguros. El instalador puede solicitar descargar herramientas de sistema de archivos faltantes.
- El particionado manual solo está disponible para instalaciones nativas en GUI sobre discos directos elegibles. Los cambios se preparan hasta la confirmación final.

Los esquemas automáticos de arranque son BIOS/MBR, UEFI/MBR y UEFI/GPT. UEFI funciona con GPT o esquemas MBR primarios. BIOS es compatible solo con MBR primario, no con GPT. No se admiten esquemas de preservación de MBR extendido o lógico.

El modo manual permite crear, eliminar, formatear y reutilizar particiones; reducir un sistema de archivos compatible desde su final; asignar puntos de montaje, una partición de sistema EFI y swap; y deshacer o restablecer los cambios preparados. No admite LVM, RAID, raíces LUKS nativas, almacenamiento mapeado o anidado, bcache, ZFS ni edición de subvolúmenes Btrfs. La persistencia de sesión LUKS no cifra un sistema de archivos raíz nativo.

## Sistemas de archivos

- Los esquemas en vivo pueden usar ext2, ext4, Btrfs, FAT32 o NTFS cuando las herramientas necesarias están instaladas.
- Los sistemas de archivos raíz nativos pueden usar ext2, ext4 o Btrfs. Ext4 es el valor predeterminado de uso general.
- Los sistemas de archivos ext3 existentes pueden reutilizarse o reducirse donde se admita, pero ext3 no se ofrece para formateo nuevo.
- FAT32 está limitado a archivos menores de 4 GiB y solo está disponible para esquemas en vivo.
- NTFS solo está disponible para esquemas en vivo, aunque una partición NTFS elegible puede reducirse para instalar junto a otra.

El espacio requerido incluye los datos de módulos seleccionados, elementos de arranque, persistencia solicitada y una reserva del 25 por ciento del sistema de archivos. El espacio EFI y swap nativo se calculan por separado.

## Configuración y seguridad

El instalador puede configurar el idioma, zona horaria, teclado, nombre de usuario, contraseñas, grupos de usuario, nombre de host, servicios, menú de arranque y selección de módulos. Seleccionar un módulo superior de MiniOS incluye sus capas inferiores requeridas.

Los perfiles de seguridad son `convenient`, `balanced` y `strict`. El modo en vivo utiliza por defecto `convenient`; el modo nativo utiliza por defecto `balanced`. Los controles de SSH y XRDP son independientes del perfil seleccionado. Revisa los servicios de acceso remoto antes de la primera conexión de red.

La configuración de red cubre el nombre de host y DHCP cableado o IPv4 estática. El instalador no crea ni modifica perfiles Wi-Fi. Las instalaciones nativas y junto a otra pueden requerir acceso a red, con tu consentimiento, para obtener GRUB, EFI, initramfs, `os-prober` o paquetes de redimensionado de sistemas de archivos antes de realizar cambios en el disco.

## Persistencia de la sesión live

La persistencia solo se aplica a instalaciones live:

- La persistencia nativa almacena los cambios directamente en un sistema de archivos de destino compatible con POSIX. No se ofrece en FAT32 ni NTFS.
- DynFileFS utiliza un contenedor expandible.
- Raw utiliza una imagen de tamaño fijo.
- LUKS utiliza una imagen cifrada creada por el initrd en el primer arranque. La frase de acceso se solicita al arrancar y nunca es recibida ni almacenada por el instalador.

Los modos de contenedor tienen un valor predeterminado de 4000 MiB. Los contenedores Raw y LUKS no pueden exceder los 4000 MiB en FAT32; DynFileFS no está sujeto a ese límite de archivo único. LUKS solo se ofrece cuando tanto el initrd en ejecución como cada initrd fuente copiado anuncian el soporte criptográfico requerido.

Las opciones de arranque resultantes usan `perchmode` y `perchsize`. Consulta [Persistencia de initrd](/configuration/Initrd-Persistence.md) y [Parámetros de arranque](/configuration/Boot-Parameters.md) para conocer su significado en tiempo de ejecución y los requisitos de activación.

## Despliegue por línea de comandos

`minios-deploy` está pensado para automatización, pruebas y recuperación. El particionado manual y la configuración interactiva de red cableada siguen siendo solo en la interfaz gráfica.

Lista los discos reconocidos como instalables:

```bash
minios-deploy list-disks
```

Reemplaza `/dev/sdb` en cada ejemplo por el disco de destino verificado. Primero imprime un plan no destructivo:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Previsualiza los comandos de despliegue correspondientes sin escribir en el disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Ejecuta la instalación real solo después de revisar el plan, la identidad del destino y la salida de la simulación. `--yes` autoriza los cambios destructivos:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Para una instalación nativa en espacio libre existente, usa las mismas opciones de almacenamiento para planificar e instalar:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

El modo nativo puede no aparecer en la ayuda CLI en una imagen que no tenga soporte para instalación nativa. La CLI también acepta opciones de configuración para cuentas, idioma, zona horaria, teclado, nombre de host, servicios y un `config.conf` base. Consulta las opciones exactas que ofrece la imagen en ejecución:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` y `--root-password` en entornos compartidos, ya que los argumentos en texto plano de la línea de comandos pueden quedar expuestos en el historial del shell y en la lista de procesos. Utiliza el instalador gráfico o un flujo de configuración protegido en su lugar.
