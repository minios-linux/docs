---
updated: 2026-10-06
program_commits:
    minios-installer: ecabe245a5eaff606ce06f034af334b399f4c3b3
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

Abre el menú de aplicaciones, selecciona Sistema y luego el Instalador de MiniOS. También puede iniciarse desde una terminal:

```bash
sudo minios-installer
```

El asistente recopila el modo de instalación, seguridad, ubicación, red cableada, teclado, cuenta, módulos, almacenamiento y opciones de arranque. Revisa la geometría exacta de las particiones y el resumen de operaciones antes de aceptar la confirmación final destructiva.

## Ubicación y esquemas de arranque

El instalador gráfico ofrece estas opciones de ubicación cuando el destino es elegible:

- Borrar todo crea una nueva tabla de particiones y elimina todos los datos del disco de destino.
- Espacio libre utiliza el espacio no asignado disponible sin reducir el tamaño de un sistema de archivos existente.
- Junto a reduce una partición final ext2, ext3, ext4 o NTFS elegible y desmontada. Se rechazan esquemas sucios, montados, anidados, ambiguos o inseguros. El instalador puede solicitar confirmación antes de descargar herramientas de sistema de archivos faltantes.
- El particionado manual solo está disponible para conversiones nativas en la interfaz gráfica y en discos directos elegibles. Los cambios se preparan hasta la confirmación final.

Los esquemas automáticos de arranque son BIOS/MBR, UEFI/MBR y UEFI/GPT. UEFI funciona con GPT o esquemas MBR primarios. BIOS es compatible solo con MBR primario, no con GPT. No se admiten esquemas extendidos o lógicos MBR preservados.

El modo manual permite crear, eliminar, formatear y reutilizar particiones; reducir un sistema de archivos compatible desde el final; asignar puntos de montaje, una partición EFI y swap; y deshacer o restablecer los cambios preparados. No admite LVM, RAID, raíces LUKS nativas, almacenamiento mapeado o anidado, bcache, ZFS ni edición de subvolúmenes Btrfs. El cifrado LUKS2 para una sesión de persistencia en vivo no cifra un sistema de archivos raíz nativo.

## Sistemas de archivos

- Los esquemas en vivo pueden usar ext2, ext4, Btrfs, FAT32 o NTFS cuando las herramientas necesarias están instaladas.
- El sistema de archivos raíz creado por la conversión nativa puede usar ext2, ext4 o Btrfs. Ext4 es el valor predeterminado de uso general.
- Los sistemas de archivos ext3 existentes pueden reutilizarse o reducirse donde sea compatible, pero ext3 no se ofrece para formateo nuevo.
- FAT32 está limitado a archivos menores de 4 GiB y solo está disponible para esquemas en vivo.
- NTFS solo está disponible para esquemas en vivo, aunque una partición NTFS elegible puede reducirse para instalar junto a otra.

El espacio requerido incluye los datos de los módulos seleccionados, recursos de arranque, persistencia solicitada y una reserva del 25 por ciento del sistema de archivos. El espacio EFI y swap nativo se calculan por separado.

## Configuración y seguridad

El instalador puede configurar el locale, zona horaria, teclado, nombre de usuario, contraseñas, grupos de usuario, nombre de host, servicios, menú de arranque y selección de módulos. Seleccionar un módulo MiniOS superior incluye sus capas inferiores requeridas.

Los perfiles de seguridad son `convenient`, `balanced`, y `strict`. El modo en vivo utiliza por defecto `convenient`; la conversión nativa comienza desde `balanced`. Los controles de SSH y XRDP son independientes del perfil seleccionado. Revisa los servicios de acceso remoto antes de la primera conexión de red. Tras la conversión nativa, la configuración de seguridad posterior sigue el flujo de trabajo habitual de administración de sistemas Debian.

La configuración de red abarca el nombre de host y DHCP cableado o IPv4 estática. El instalador no crea ni modifica perfiles Wi-Fi. La conversión nativa y algunas operaciones junto a otra pueden requerir acceso a red, con tu consentimiento, para obtener GRUB, EFI, initramfs, `os-prober`, o paquetes de redimensionamiento de sistema de archivos antes de realizar cambios en el disco.

## Persistencia de la sesión en vivo

La persistencia solo aplica a instalaciones en modo live. Cuando `minios-session` está disponible, el Instalador de MiniOS puede crear y activar una sesión numerada real directamente en el destino antes de finalizar la instalación. **Configurar automáticamente en el primer arranque** omite este paso; MiniOS podrá crear el almacenamiento de sesión más adelante mediante su lógica normal de persistencia al arrancar.

El instalador ofrece estos backends de almacenamiento cuando el sistema en ejecución y el destino los soportan:

- `native` almacena los cambios de la sesión en vivo directamente en el directorio de sesión sobre un sistema de archivos de destino compatible con POSIX. A pesar del nombre, este es un **backend de persistencia en vivo** y no está relacionado con la instalación nativa. No se ofrece en FAT32 ni NTFS.
- DynFileFS crea almacenamiento ext4 expandible basado en archivos. El tamaño seleccionado es el máximo lógico, no espacio reservado por adelantado. Su tamaño predeterminado es 4000 MiB.
- DynBlk crea un sistema de archivos ext4 sobre un dispositivo de bloques fino proporcionado por el controlador de kernel DynBlk. Los datos de la sesión se almacenan en archivos `volumeNNN.db` segmentados que se asignan según sea necesario, por lo que el tamaño seleccionado es un máximo lógico y no un uso de disco preasignado. El instalador asigna por defecto 16384 MiB a nuevas sesiones DynBlk. Para sesiones DynBlk sin cifrar, el instalador puede seleccionar un códec de compresión compatible tanto con el sistema en ejecución como con el initrd copiado al destino.
- VMDK utiliza el controlador DynBlk para crear almacenamiento VMDK estándar dividido y disperso (`volume.vmdk` y `volume-sNNN.vmdk`). Tiene el mismo modelo de asignación fina y 16384 MiB por defecto que DynBlk, pero la compresión en el backend no está disponible.
- Raw crea una imagen ext4 de tamaño fijo y reserva la capacidad seleccionada de inmediato. Su tamaño predeterminado es 4000 MiB.

LUKS2 es una capa de cifrado independiente que puede envolver almacenamiento de sesión Raw, DynFileFS, DynBlk o VMDK. El instalador solicita la frase de contraseña confirmada solo para la creación de la sesión, la envía a `minios-session` por la entrada estándar y no la coloca en argumentos de línea de comandos, registros ni configuración persistente. La frase de contraseña será necesaria al desbloquear la sesión cifrada al arrancar. LUKS2 solo se ofrece cuando el entorno en ejecución y el initrd copiado al destino anuncian soporte compatible. La compresión DynBlk se desactiva al seleccionar LUKS2.

DynBlk y el almacenamiento de sesión VMDK no están disponibles mientras UEFI Secure Boot esté activado, ya que el módulo de kernel externo DynBlk utilizado por estos backends no está firmado por MiniOS. Los contenedores Raw están limitados a 4000 MiB en FAT32; DynFileFS, DynBlk y el almacenamiento VMDK dividido no dependen de que un solo archivo supere el límite de 4 GiB de FAT32, aunque siguen aplicando sus propios límites de backend y espacio libre.

Como el instalador crea y activa la sesión seleccionada en el destino, no depende de `perchmode` y `perchsize` para crear ese almacenamiento en el primer arranque. Esos parámetros de arranque siguen describiendo la creación y selección de persistencia gestionada por initrd fuera de la ruta de sesión precreada por el instalador. Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence), [Persistencia en initrd](/reference/boot-process/Persistence-Internals), y [Parámetros de arranque](/reference/Boot-Parameters).

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
