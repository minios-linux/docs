# Paquetes y ediciones

El contenido de los paquetes de MiniOS se genera a partir de listas de fuentes condicionales. Varían según la suite de la distribución, la arquitectura, el sistema de inicio, el entorno de escritorio, el idioma, las opciones del kernel y la disponibilidad de los repositorios. Esta página describe la herencia entre ediciones y contenidos representativos; no es una tabla exhaustiva de paquetes por versión.

## Herencia de ediciones

Las variantes de paquetes forman una secuencia aditiva:

1. **Minimum** proporciona el sistema live común y el escritorio seleccionado más ligero.
2. **Standard** hereda Minimum y añade herramientas generales de administración, escritorio y gestión de MiniOS.
3. **Toolbox** hereda Standard y suma utilidades de recuperación, diagnóstico, almacenamiento, red y virtualización.
4. **Ultra** hereda Toolbox y agrega software de estación de trabajo, multimedia, oficina y contenedores.

Las expresiones condicionales pueden seleccionar alternativas u omitir un paquete según la suite, arquitectura, entorno o la opción de compilación. Por lo tanto, un paquete mencionado a continuación es representativo de las listas de fuentes actuales, no una garantía de que el mismo nombre de paquete binario de Debian exista en cada versión de MiniOS.

## Alcance del escritorio y entorno

Los paquetes de escritorio provienen de la cadena de módulos ordenada del entorno seleccionado. Los entornos Xfce, Fluxbox, LXQt, core y debug no comparten los mismos módulos ni conjuntos de paquetes. Los ejemplos a continuación utilizan las listas actuales de Xfce a menos que una funcionalidad provenga de la lista core compartida. Una compilación de consola u otro escritorio debe inspeccionarse de forma independiente.

## Contenidos representativos

### Minimum

La composición común Minimum incluye la configuración live de MiniOS y herramientas de imagen, NetworkManager, SSH, soporte de teclado e idioma, firmware seleccionado para el destino y utilidades para inspección de hardware y tareas comunes de almacenamiento. Los paquetes representativos incluyen `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` y `wpasupplicant`.

La cadena Minimum de Xfce añade Xorg, Blackbox u Openbox según lo seleccione la lista de fuentes, Thunar, Mousepad, el panel de Xfce, componentes de sesión, configuración, escritorio y gestor de ventanas, el applet de escritorio de NetworkManager, controles ALSA, Xarchiver, soporte de batería y Firefox o Firefox ESR según la familia de la distribución.

Las utilidades de MiniOS presentes en todas las ediciones, incluyendo Xfce Minimum, son `minios-tools`, `minios-image-compose`, `minios-live-config`, la integración correspondiente con systemd o SysV init, `minios-live-config-doc` y `minios-welcome`.

### Standard

Standard añade capacidades compartidas como soporte DNS, herramientas adicionales de compresión y sistemas de archivos, clientes de sistemas de archivos en red, FUSE, particionado y creación de ISOs. Los paquetes representativos incluyen `dnsmasq-base`, `ncdu`, `lsof`, `xfsprogs`, `exfatprogs` o su alternativa específica de la suite, `cifs-utils`, `nfs-common`, `parted`, `7zip` y `genisoimage`.

En Xfce, Standard y las ediciones posteriores añaden las utilidades gráficas y administrativas actuales de MiniOS: `minios-configurator`, `minios-installer`, `minios-session-manager`, `minios-kernel-manager`, `minios-store`, `minios-store-gui`, `minios-image-builder`, `minios-module-manager` y `driveutility`. También se agregan LightDM, integración de audio y Bluetooth en el escritorio, capturas de pantalla, gestión de tareas, notificaciones y la terminal de Xfce.

### Toolbox

Toolbox añade capacidades de almacenamiento, recuperación, rendimiento, red y máquinas virtuales por línea de comandos. Ejemplos actuales incluyen herramientas LVM y LUKS, Clonezilla, Partclone, TestDisk, `gddrescue`, herramientas ZFS cuando la compilación lo permite, Nmap, iperf3, QEMU, libvirt, agentes invitados, fio, sysbench e informes de hardware.

El módulo de aplicaciones de Xfce añade herramientas representativas como GParted, GSmartControl, Guymager, utilidades de rescate y disco, Wireshark, Remmina, Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit y herramientas gráficas de cifrado. Los nombres exactos dependen de la suite; por ejemplo, una lista de fuentes puede usar una de varias alternativas de paquetes.

### Ultra

Ultra mantiene el conjunto de Toolbox y agrega software de contenedores y estación de trabajo. Las incorporaciones compartidas representativas incluyen paquetes de Docker seleccionados para el repositorio de destino, soporte de Compose, `lazydocker`, herramientas iSCSI y utilidades de espacios de usuario. La lista actual de aplicaciones de Xfce suma LibreOffice, GIMP, Inkscape, Blender, Audacity, OBS Studio, RawTherapee, Synaptic y paquetes relacionados de integración de escritorio.

## Inspeccionar el contenido exacto de la versión

El sistema en ejecución es la referencia para los paquetes que realmente se instalaron en esa versión. Lista los nombres y versiones de los paquetes con:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Inspecciona los módulos ordenados que componen la raíz en ejecución por separado de los archivos seleccionados para el próximo arranque. El Gestor de Módulos de MiniOS los presenta como **En ejecución ahora** y **Próximo arranque**. Desde una terminal, los puntos de montaje SquashFS en tiempo de ejecución pueden listarse con:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Para medios sin conexión o una ISO montada, inventaría directamente los archivos de módulos fuente:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Para una compilación desde fuentes, los siguientes archivos y directorios son los manifiestos fuente y entradas de selección autorizadas:

- `linux-live/environments/<environment>/` para la cadena de módulos ordenada.
- `linux-live/scripts/00-core/packages.list` para la selección compartida de ediciones.
- `linux-live/scripts/01-kernel/packages.list` y `02-firmware/packages.list` para adiciones condicionales de kernel y firmware.
- `packages.list` de cada módulo de escritorio y aplicación seleccionado.
- `linux-live/build.conf` para suite, arquitectura, entorno, variante de paquete, sistema de inicio, kernel, idioma y otros valores de filtro.
- `linux-live/condinapt.map` para el significado de los prefijos de filtro en las listas de paquetes.

Las listas de fuentes describen los paquetes solicitados y sus alternativas. Solo la imagen final y `dpkg-query` muestran el conjunto exacto de dependencias resueltas y versiones para una versión en particular. La disponibilidad y los nombres de los paquetes pueden cambiar entre las suites de Debian, Ubuntu y Devuan, y entre entornos de escritorio.

Consulta [Arquitectura del sistema](/about/System-Architecture.md) para el orden de los módulos y [CondinAPT en MiniOS](/development/CondinAPT-MiniOS.md) para la selección condicional de paquetes.
