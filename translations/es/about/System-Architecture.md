# Arquitectura del sistema MiniOS

MiniOS inicia un sistema operativo de solo lectura ensamblado a partir de módulos SquashFS y añade una capa escribible para la sesión actual. El initramfs se encarga de localizar el medio, seleccionar los módulos y la persistencia, construir el sistema de archivos raíz, aplicar la configuración inicial y transferir el control al sistema de inicio instalado.

## Descubrimiento de arranque

El cargador de arranque BIOS o UEFI carga un kernel de Linux y el initramfs de MiniOS desde `minios/boot/`. Luego, el initramfs busca en los dispositivos de bloque un directorio `minios` que contenga módulos `.sb`. El parámetro de arranque `from=` puede, en su lugar, indicar un directorio, un dispositivo de bloque y ruta, un archivo ISO local o una selección interactiva `askdisk`. Un ISO local se monta en modo loop antes de usar su directorio `minios`.

La misma etapa de descubrimiento admite fuentes ISO HTTP y PXE. La red opcional en el arranque temprano es solo para **cargar MiniOS a través de la red** (PXE / ISO por HTTP). No es una configuración de red de sesión duradera. Consulta [Arranque por red](/installation/Network-Boot.md).

Tras el descubrimiento, `toram=trim` puede copiar los módulos seleccionados y los datos requeridos a RAM, mientras que `toram=full` copia el árbol de datos del medio. Consulta [Parámetros de arranque](/configuration/Boot-Parameters.md) para opciones de origen, filtrado y copia a RAM.

## Composición de módulos

Cada archivo `.sb` es un sistema de archivos SquashFS de solo lectura. Los módulos integrados se almacenan directamente bajo `minios/`; los módulos adicionales pueden almacenarse en `minios/modules/`, incluyendo almacenamiento duradero de módulos en un dispositivo de persistencia escribible. El initramfs detecta ambas ubicaciones, aplica los filtros `load=` y `noload=`, ordena los archivos seleccionados por el prefijo numérico del nombre de archivo y los monta en modo solo lectura.

Una imagen típica de Xfce contiene los siguientes roles ordenados, aunque los nombres y números exactos dependen de la compilación y los módulos omitidos para ese destino:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Los módulos posteriores tienen mayor precedencia y pueden reemplazar rutas proporcionadas por módulos anteriores. Un módulo puede depender de archivos en cualquier módulo de número inferior, por lo que el conjunto de archivos de módulos es una composición ordenada y no una colección de paquetes independientes.

## AUFS y OverlayFS

MiniOS utiliza un sistema de archivos unificado (union filesystem) para presentar los módulos y la capa escribible como un solo sistema de archivos raíz. Selecciona AUFS cuando el kernel en ejecución lo soporta y recurre a OverlayFS en caso contrario. `union=aufs` solicita AUFS pero igualmente recurre a OverlayFS si AUFS no está disponible; `union=overlayfs` selecciona OverlayFS.

Las dos implementaciones tienen una diferencia operativa importante:

- AUFS comienza con la rama escribible y añade los módulos montados como ramas de solo lectura. MiniOS puede activar o desactivar un módulo en el sistema raíz en ejecución cuando el montaje AUFS lo permite.
- OverlayFS recibe su lista completa y ordenada de `lowerdir` al montar el sistema raíz, además de un `upperdir` y `workdir`. Su conjunto de módulos inferiores no puede modificarse en caliente mediante el Gestor de Módulos.

Por ello, el Gestor de Módulos separa **Ejecutando ahora**, el conjunto de módulos montados, de **Próximo arranque**, los módulos seleccionados por el medio y las reglas de arranque actuales. Agregar o quitar un módulo duradero normalmente solo afecta el próximo arranque. Crear o abrir un módulo no lo activa. La activación y desactivación en tiempo real solo están disponibles con AUFS.

## Capa escribible y sesiones

Sin persistencia, la capa escribible se respalda en memoria y desaparece al apagar el sistema. La persistencia coloca esa capa en una sesión numerada bajo `minios/changes/`. `session.conf` registra la sesión predeterminada para el próximo arranque, la sesión utilizada por el arranque actual, metadatos de compatibilidad, estado y configuraciones específicas del modo.

| Modo | Almacenamiento escribible | Notas |
|------|--------------------------|-------|
| `native` | Archivos almacenados directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX escribible que conserve los metadatos de Linux. |
| `dynfilefs` | Sistema de archivos ext4 expandible dividido en archivos de respaldo | Compatible con sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `raw` | `changes.img` de tamaño fijo que contiene ext4 | Compatible con sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `luks` | LUKS2 `changes.luks` que contiene ext4 | Requiere cryptsetup y un initramfs construido con soporte de cifrado de MiniOS. La contraseña se solicita durante el arranque. |
| `squashfs` | Snapshot `changes.sb` comprimido | Se descomprime en RAM para su uso; al guardar, se reconstruye y reemplaza atómicamente el snapshot. El sistema de archivos de persistencia debe conservar los metadatos de Linux durante el guardado. |

La sesión activa es la predeterminada para el próximo arranque. La sesión en ejecución es la que ya está montada en el sistema raíz actual. Activar otra sesión no reemplaza la capa escribible actual. Las comprobaciones de compatibilidad de sesión incluyen la versión de MiniOS, edición, sistema de archivos unificado y modo de persistencia.

Consulta [Gestión de sesiones](/configuration/Session-Management.md) para comandos de creación, selección, dimensionamiento, cifrado, conversión, exportación y recuperación.

## Precedencia de configuración

La configuración del medio es `minios/config.conf`, con fragmentos opcionales en `minios/config.conf.d/`. Las copias en tiempo de ejecución son `/etc/live/config.conf` y `/etc/live/config.conf.d/` en el sistema raíz compuesto.

Al arrancar, MiniOS compara las fechas de modificación y copia un archivo de medio más reciente al sistema raíz en ejecución. Si el medio es escribible y la copia en ejecución es más reciente, se copia de vuelta al medio. Los archivos fragmentados se sincronizan por nombre de archivo en ambas direcciones. Si el reloj retrocedió desde la sincronización anterior, MiniOS evita reemplazar marcas de tiempo y solo rellena los destinos que faltan.

Las opciones de la línea de comandos del kernel sobrescriben los valores correspondientes leídos de la configuración en ejecución para ese arranque. Esto significa que el orden efectivo para una configuración explícitamente soportada es: primero el parámetro de arranque, luego la configuración sincronizada en ejecución/medio y, por último, el valor predeterminado integrado. Las ediciones persistentes en ejecución pueden convertirse en la configuración del medio si la fuente es escribible; los medios ISO de solo lectura no pueden recibir esa actualización.

Consulta [Archivo de configuración](/configuration/Configuration-File.md) y [live-config](/configuration/live-config.md) para los ajustes soportados.

## Ciclo de apagado y guardado

El apagado normal primero da al sistema en ejecución la oportunidad de vaciar servicios y datos de sesión. Una sesión SquashFS con guardado al apagar habilitado se reconstruye y valida antes de desmontar el sistema de archivos. El backend de guardado escribe un marcador de finalización para la sesión exacta en ejecución; el initramfs de apagado comprueba ese marcador y deja la sesión como sucia si el guardado requerido falla.

Luego, el initramfs de apagado desconecta los dispositivos loop no usados, desmonta el antiguo sistema raíz y la capa escribible, marca como limpia una sesión exitosa, desmonta el medio y cierra un mapeo LUKS propiedad de MiniOS. El medio óptico puede expulsarse antes de apagar o reiniciar. Los guardados manuales y periódicos de SquashFS utilizan el mismo backend de snapshots, pero solo la política de apagado configurada bloquea la finalización limpia si falta el guardado al apagar.

## Árbol de medios

Una imagen actual se organiza de la siguiente manera. Los directorios opcionales solo aparecen cuando la función relacionada ha creado contenido.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

Las rutas arrancadas bajo `/run/initramfs/memory/` son montajes de implementación, no una segunda copia persistente de este árbol.

## Documentación relacionada

- [Parámetros de arranque](/configuration/Boot-Parameters.md)
- [Menús de arranque](/configuration/Boot-Menus.md)
- [Archivo de configuración](/configuration/Configuration-File.md)
- [Gestión de sesiones](/configuration/Session-Management.md)
- [Arranque por red](/installation/Network-Boot.md)
- [Creación de módulos](/development/Creating-Modules.md)
