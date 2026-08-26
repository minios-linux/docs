---
updated: 2026-08-26
---

# Arquitectura del sistema MiniOS

MiniOS inicia un sistema operativo de solo lectura ensamblado a partir de módulos SquashFS y añade una capa escribible para la sesión actual. El initramfs se encarga de localizar el medio, seleccionar los módulos y la persistencia, construir el sistema de archivos raíz, aplicar la configuración inicial y transferir el control al sistema de inicio instalado.

## Descubrimiento de arranque

El gestor de arranque BIOS o UEFI carga un kernel de Linux y el initramfs de MiniOS desde
`minios/boot/`. Luego, el initramfs detecta el árbol de datos de MiniOS que contiene
los módulos live. La fuente puede ser local, seleccionada de forma interactiva o proporcionada
a través de una ruta de red compatible; una ISO local se monta en modo loop antes de usar su árbol de datos.
La precedencia exacta y las formas aceptadas de `from=` están documentadas en
[Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md).

La misma etapa de descubrimiento admite fuentes ISO HTTP y PXE. La red opcional en arranque temprano es solo para **cargar MiniOS por red** (PXE / ISO por HTTP). No es una configuración de red de sesión duradera. Consulta
[Arranque por red](/installation/Network-Boot.md).

Después del descubrimiento, MiniOS puede preparar opcionalmente una copia en RAM. Si la fuente original sigue siendo necesaria depende del modo de copia, la persistencia y el éxito del desmontaje. Consulta [Modos de arranque](/configuration/Boot-Modes.md) para el modelo operativo.

## Composición de módulos

Cada archivo `.sb` es un sistema de archivos SquashFS de solo lectura. Los módulos integrados se almacenan
directamente en `minios/`; ubicaciones adicionales de módulos pueden contribuir a la
composición ordenada. El initramfs selecciona, ordena y monta las capas resultantes
de solo lectura. Los niveles candidatos, el reemplazo de nombre base, los filtros, las extensiones de bundle personalizadas y la coordinación con el kernel en ejecución se especifican en
[Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md).

Una imagen típica de Xfce contiene los siguientes roles ordenados, aunque los nombres
y la cantidad exacta dependen de la build y de los módulos omitidos para ese destino:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Los módulos posteriores tienen mayor precedencia y pueden reemplazar rutas proporcionadas por módulos anteriores. Un módulo puede depender de archivos en cualquier módulo con número inferior, por lo que un conjunto de archivos de módulo es una composición ordenada y no una colección de paquetes independientes.

## AUFS y OverlayFS

MiniOS utiliza un sistema de archivos unificado para presentar los módulos y la capa escribible como un solo sistema de archivos raíz. Selecciona AUFS cuando el kernel en ejecución lo soporta y recurre a OverlayFS en caso contrario. `union=aufs` solicita AUFS pero igualmente recurre a OverlayFS cuando AUFS no está disponible; `union=overlayfs` selecciona OverlayFS.

Las dos implementaciones tienen una diferencia operativa importante:

- AUFS comienza con la rama escribible y añade los módulos montados como ramas de solo lectura. MiniOS puede activar o desactivar un módulo en el root en ejecución cuando el montaje AUFS soporta esa operación.
- OverlayFS recibe su lista completa y ordenada de `lowerdir` cuando se monta el root, además de un `upperdir` y `workdir`. El conjunto de módulos inferiores no puede modificarse en caliente mediante el Gestor de Módulos.

Por lo tanto, el Gestor de Módulos separa **Ejecutando ahora**, el conjunto de módulos montados,
de **Próximo arranque**, los módulos seleccionados por el medio actual y las reglas de arranque. Añadir o quitar un módulo duradero normalmente solo afecta al próximo arranque. Crear o abrir un módulo no lo activa. La activación y desactivación en tiempo real solo están disponibles con AUFS.

Tras ensamblar el root y completar la configuración inicial, el initrd de LiveKit utiliza
`pivot_root`, conserva el initrd antiguo para tareas de apagado y ejecuta el init del nuevo root. La ruta de dracut prepara el mismo root ensamblado pero deja la
finalización de `switch_root` a dracut. Consulta
[Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md) para conocer el límite de traspaso en detalle.

## Capa escribible y sesiones

Sin persistencia, la capa escribible se respalda en memoria y desaparece al apagar. La persistencia puede, en cambio, activar una sesión numerada con un backend de almacenamiento compatible. La selección, compatibilidad, fallos de activación, autoridad de arranque actual y durabilidad se definen en
[Persistencia Initrd](/configuration/Initrd-Persistence.md).

| Modo | Almacenamiento escribible | Notas |
|------|--------------------------|-------|
| `native` | Archivos almacenados directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX escribible que preserve los metadatos de Linux. |
| `dynfilefs` | Sistema de archivos ext4 expandible dividido en archivos de respaldo | Soporta sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `raw` | `changes.img` de tamaño fijo que contiene ext4 | Soporta sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `luks` | LUKS2 `changes.luks` que contiene ext4 | Requiere cryptsetup y un initramfs construido con soporte de cifrado MiniOS. Se solicita la contraseña durante el arranque. |
| `squashfs` | Snapshot `changes.sb` comprimido | Se descomprime en RAM para su uso; al guardar, se reconstruye y reemplaza atómicamente el snapshot. El sistema de archivos de persistencia debe preservar los metadatos de Linux durante el guardado. |

La sesión activa seleccionada para una reanudación futura y la capa escribible realmente autorizada para el arranque actual son estados relacionados pero distintos. Cambiar una selección futura no reemplaza la capa escribible en ejecución.

Consulta [Gestión de sesiones](/configuration/Session-Management.md) para los comandos de creación,
selección, dimensionamiento, cifrado, conversión, exportación y recuperación.

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

- [Modos de arranque](/configuration/Boot-Modes.md)
- [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md)
- [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistencia Initrd](/configuration/Initrd-Persistence.md)
- [Parámetros de arranque](/configuration/Boot-Parameters.md)
- [Menús de arranque](/configuration/Boot-Menus.md)
- [Archivo de configuración](/configuration/Configuration-File.md)
- [Gestión de sesiones](/configuration/Session-Management.md)
- [Arranque por red](/installation/Network-Boot.md)
- [Creación de módulos](/development/Creating-Modules.md)
