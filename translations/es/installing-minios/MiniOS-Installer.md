---
updated: 2026-10-15
program_commits:
    minios-installer: e895f8065faef84356f9c1cda4dbfa97700b0370
---

# Instalador de MiniOS

El Instalador de MiniOS es un asistente GTK y backend de línea de comandos para desplegar un sistema desde una sesión en vivo de MiniOS en ejecución. Escribir o copiar MiniOS en un medio extraíble ya es un método de instalación; el Instalador de MiniOS es la herramienta de despliegue gestionado que se utiliza cuando se requiere un diseño de destino controlado, configuración de persistencia u opción de conversión nativa.

## Antes de comenzar

Una selección incorrecta de destino o particionado puede destruir datos. Haz una copia de seguridad de los archivos importantes, desconecta los discos que no sean necesarios e identifica el destino por ruta de dispositivo, modelo y capacidad. La confirmación final es el último punto en el que se puede cancelar la instalación de forma segura.

El disco que contiene el sistema en vivo de MiniOS en ejecución se excluye de la selección de destino. Para orientación general sobre la capacidad, consulta la [Guía de compatibilidad de hardware](/getting-started/Hardware-Compatibility).

## Modos de instalación

**Modo en vivo** copia los módulos MiniOS comprimidos seleccionados y los recursos de arranque. El resultado permanece MiniOS: mantiene el diseño modular del sistema en vivo, la configuración de arranque MiniOS, los flujos de trabajo de gestión MiniOS y la persistencia de sesión opcional.

**Modo nativo** crea un escritorio Debian convencional a partir de la imagen MiniOS seleccionada. Expande los módulos elegidos en un sistema de archivos raíz escribible, mantiene el entorno de escritorio y las aplicaciones seleccionadas, elimina el entorno en vivo MiniOS y las utilidades específicas de live, instala los paquetes Debian necesarios, genera un initramfs convencional e instala el gestor de arranque. El instalador detecta el soporte nativo desde la imagen arrancada. Si faltan los metadatos requeridos del kernel y el contrato de arquitectura EFI, el modo de compatibilidad solo permite la instalación en modo live.

::: warning El modo nativo cambia la gestión del sistema
El sistema instalado mantiene la experiencia de escritorio MiniOS habitual —su apariencia, entorno de escritorio seleccionado y aplicaciones comunes—, pero ya no utiliza la arquitectura en vivo MiniOS. Durante la conversión, el instalador elimina los `minios-*` paquetes y otras utilidades específicas de live, ya que las sesiones, `.sb` módulos, la gestión modular del kernel y la configuración de arranque en vivo dejan de ser aplicables. Tras reiniciar, mantén el sistema como un escritorio Debian convencional con APT, paquetes de kernel Debian, el initramfs normal y el gestor de arranque instalado. Consulta [Acerca de MiniOS](/getting-started/About-MiniOS).
:::

Este despliegue es diferente de una escritura directa de ISO, una configuración multiboot con archivo ISO de Ventoy o una instalación en vivo basada en archivos. Consulta [Métodos de instalación](/installing-minios/Installation-Methods) para conocer la diferencia.

## Iniciar el instalador gráfico

Abre el Instalador de MiniOS desde el **MiniOS** menú de aplicaciones. También puedes iniciarlo desde una terminal y solicitar autorización de administrador si es necesario:

```bash
minios-installer
```

El asistente recopila la configuración de modo de instalación, seguridad, ubicación, red cableada, teclado, cuenta, módulo, almacenamiento y arranque. Revisa la geometría exacta de las particiones y el resumen de operaciones antes de aceptar la confirmación final, que es irreversible.

## Disposición y esquemas de arranque

El instalador gráfico ofrece estas opciones de disposición cuando el destino es elegible:

- Borrar todo crea una nueva tabla de particiones y elimina todos los datos del disco de destino.
- Espacio libre utiliza el espacio no asignado disponible sin reducir el tamaño de ningún sistema de archivos existente.
- Junto a reduce una partición final ext2, ext3, ext4 o NTFS elegible y desmontada. Se rechazan las disposiciones sucias, montadas, anidadas, ambiguas o inseguras. El instalador puede solicitar confirmación antes de descargar herramientas de sistema de archivos faltantes.
- El particionado manual solo está disponible para conversiones nativas en la interfaz gráfica sobre discos directos elegibles. Los cambios se aplican solo tras la confirmación final.

Los esquemas de arranque automáticos son BIOS/MBR, UEFI/MBR y UEFI/GPT. UEFI funciona con GPT o disposiciones MBR primarias. BIOS es compatible solo con MBR primario, no con GPT. No se admiten disposiciones MBR extendidas o lógicas para preservar.

Para **Borrar todo** en modo Live, **Automático** selecciona MBR incluso cuando el instalador se ejecuta bajo UEFI. Los destinos Live en MBR conservan archivos EFI y reciben un gestor de arranque BIOS, por lo que admiten ambos modos de firmware. Los discos de 2 TiB o más requieren seleccionar explícitamente **UEFI/GPT**; los destinos Live en GPT son solo UEFI. El borrado nativo sigue su propia política dependiente del firmware. Las instalaciones en espacio libre y junto a mantienen la tabla de particiones existente.

El modo manual permite crear, eliminar, formatear y reutilizar particiones; reducir desde el final un sistema de archivos compatible; asignar puntos de montaje, una partición del sistema EFI y swap; y deshacer o restablecer los cambios pendientes. No admite LVM, RAID, raíces LUKS nativas, almacenamiento mapeado o anidado, bcache, edición de subvolúmenes ZFS o Btrfs. El cifrado LUKS2 para una sesión persistente en modo live no cifra el sistema de archivos raíz nativo.

## Sistemas de archivos

- Los esquemas en vivo pueden usar ext2, ext4, Btrfs, FAT32 o NTFS cuando las herramientas necesarias están instaladas.
- El sistema de archivos raíz creado por la conversión nativa puede usar ext2, ext4 o Btrfs. Ext4 es el valor predeterminado de uso general.
- Los sistemas de archivos ext3 existentes pueden reutilizarse o reducirse donde sea compatible, pero ext3 no se ofrece para formateo nuevo.
- FAT32 está limitado a archivos menores de 4 GiB y solo está disponible para esquemas en vivo.
- NTFS solo está disponible para esquemas en vivo, aunque una partición NTFS elegible puede reducirse para instalar junto a otra.

El espacio requerido incluye los datos de los módulos seleccionados, recursos de arranque, persistencia solicitada y una reserva del 25 por ciento del sistema de archivos. El espacio EFI y swap nativo se calculan por separado.

## Configuración y seguridad

El instalador puede configurar el idioma, zona horaria, teclado, nombre de usuario, contraseñas, grupos de usuarios, nombre del host, servicios, menú de arranque y selección de módulos. Al seleccionar una capa superior del sistema, se incluyen automáticamente las capas inferiores requeridas. Los módulos personalizados de `minios/modules/` se seleccionan de forma independiente, incluso si sus nombres de archivo se parecen a los de módulos del sistema o del kernel.

Los perfiles de seguridad son `convenient`, `balanced` y `strict`. El modo Live utiliza por defecto `convenient`; la conversión nativa comienza desde `balanced`. Los controles de SSH y XRDP son independientes del perfil seleccionado. Revisa los servicios de acceso remoto antes de la primera conexión de red. Tras la conversión nativa, la configuración de seguridad posterior sigue el flujo habitual de administración de sistemas Debian.

La configuración de red abarca el nombre del host y DHCP por cable o IPv4 estática. El instalador no crea ni modifica perfiles Wi-Fi. La conversión nativa y algunas operaciones en paralelo pueden requerir acceso a la red, con tu consentimiento, para obtener paquetes de GRUB, EFI, initramfs, `os-prober`, o de redimensionamiento de sistemas de archivos antes de realizar cambios en el disco.

## Persistencia de sesiones en vivo

La persistencia solo se aplica a las instalaciones en vivo. Si está disponible `minios-session` , el Instalador de MiniOS puede crear y activar una sesión numerada real directamente en el destino antes de que finalice la instalación. **La opción «Configurar automáticamente en el primer arranque»** omite este paso; MiniOS puede crear el almacenamiento de sesión más adelante mediante su lógica habitual de persistencia durante el arranque.

El instalador ofrece estos sistemas de almacenamiento cuando el sistema en ejecución y el destino son compatibles:

- `native` almacena los cambios de la sesión en vivo directamente en el directorio de sesión de un sistema de archivos de destino compatible con POSIX. A pesar de su nombre, es un **sistema de persistencia en vivo** y no está relacionado con la instalación nativa. No se ofrece para FAT32 ni NTFS.
- DynFileFS crea un almacenamiento ext4 ampliable basado en archivos con formato 600. El tamaño seleccionado es el máximo lógico, no el espacio reservado por adelantado. El tamaño predeterminado es de 4000 MiB.
- DynBlk crea un sistema de archivos ext4 en un dispositivo de bloques ligero proporcionado por el controlador del kernel DynBlk. Los datos de sesión se almacenan en archivos `volumeNNN.db` segmentados que se asignan según se necesitan, por lo que el tamaño seleccionado es un máximo lógico y no el espacio en disco preasignado. El instalador establece 16384 MiB como tamaño predeterminado para las nuevas sesiones DynBlk. Para las sesiones DynBlk sin cifrar, el instalador puede seleccionar un códec de compresión compatible tanto con el sistema en ejecución como con el initrd copiado en el destino.
- VMDK usa el controlador DynBlk para crear almacenamiento VMDK disperso estándar dividido en varios archivos (`volume.vmdk` y `volume-sNNN.vmdk`). Tiene el mismo modelo de asignación bajo demanda y el mismo tamaño predeterminado de 16384 MiB que DynBlk, pero no permite la compresión del sistema de almacenamiento.
- Raw crea una imagen ext4 de tamaño fijo y reserva de inmediato la capacidad seleccionada. El tamaño predeterminado es de 4000 MiB.

LUKS2 es una capa de cifrado independiente que puede envolver el almacenamiento de sesión Raw, DynFileFS, DynBlk o VMDK. El instalador solicita la frase de contraseña confirmada solo al crear la sesión y la envía a `minios-session` mediante la entrada estándar; no la incluye en los argumentos de la línea de comandos, los registros ni la configuración persistente. Después, se necesitará la frase de contraseña para desbloquear la sesión cifrada durante el arranque. LUKS2 solo se ofrece si el entorno en ejecución y el initrd copiado en el destino admiten opciones compatibles. La compresión DynBlk se desactiva al seleccionar LUKS2.

El almacenamiento de sesión DynBlk y VMDK no está disponible mientras el arranque seguro UEFI esté habilitado, ya que el módulo externo del kernel DynBlk que utilizan estos sistemas de almacenamiento no está firmado por MiniOS. En FAT32, los contenedores Raw están limitados a 4000 MiB. El almacenamiento DynFileFS, DynBlk y VMDK dividido no depende de que un solo archivo supere el límite de 4 GiB de FAT32, aunque siguen aplicándose los límites propios del sistema de almacenamiento y del espacio libre.

Como el instalador crea y activa la sesión seleccionada en el destino, no depende de `perchmode` ni de `perchsize` para crear ese almacenamiento durante el primer arranque. Esos parámetros de arranque siguen describiendo la creación y selección de persistencia mediante initrd, fuera del proceso del instalador que crea la sesión de antemano. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence), [Persistencia del initrd](/reference/boot-process/Persistence-Internals) y [Parámetros de arranque](/reference/Boot-Parameters).

<a id="command-line-deployment"></a>

## Despliegue por línea de comandos

`minios-deploy` está pensado para automatización, pruebas y recuperación. El particionado manual y la configuración interactiva de red cableada solo están disponibles en la interfaz gráfica.

Lista los discos reconocidos como instalables:

```bash
minios-deploy list-disks
```

Sustituye `/dev/sdb` en cada ejemplo por el disco de destino verificado. Primero imprime un plan no destructivo:

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

Ejecuta la instalación real solo después de comprobar el plan, la identidad del destino y la salida de la simulación.`--yes` autoriza cambios destructivos:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Si deseas realizar deliberadamente una conversión nativa en espacio libre existente, utiliza las mismas opciones de almacenamiento para la planificación y la instalación:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversión nativa puede no aparecer en la ayuda CLI de una imagen que no tenga soporte para instalación nativa. La CLI también acepta opciones de configuración para cuentas, locale, zona horaria, teclado, nombre de host, servicios y un `config.conf` base. Consulta las opciones exactas que ofrece la imagen en ejecución:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` y `--root-password` en entornos compartidos, ya que los argumentos de línea de comandos en texto plano pueden quedar expuestos en el historial del shell y en la lista de procesos. Utiliza el instalador gráfico o un flujo de configuración protegido en su lugar.
