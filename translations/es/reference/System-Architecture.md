---
updated: 2026-08-26
---

# Arquitectura del sistema

MiniOS inicia un sistema operativo de solo lectura ensamblado a partir de módulos SquashFS y añade una capa escribible para la sesión actual. El initramfs se encarga de localizar el medio, seleccionar los módulos y la persistencia, construir el sistema de archivos raíz, aplicar la configuración temprana y entregar el control al sistema de inicio instalado.

## Descubrimiento de arranque

El cargador de arranque BIOS o UEFI carga un kernel de Linux y un initramfs MiniOS desde `minios/boot/`. Luego, el initramfs descubre el árbol de datos MiniOS que contiene los módulos live. Una fuente puede ser local, seleccionada de forma interactiva o suministrada a través de una ruta de red compatible; una ISO local se monta en modo loop antes de usar su árbol de datos. La precedencia exacta y los formatos aceptados de `from=` están documentados en [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery).

La misma etapa de descubrimiento admite fuentes HTTP ISO y PXE. La red opcional en el arranque temprano es solo para **cargar MiniOS por red** (PXE / HTTP ISO). No es una configuración de red de sesión duradera. Consulta [Arranque por red](/reference/boot-process/Network-Boot).

Tras el descubrimiento, MiniOS puede preparar opcionalmente una copia RAM. Si la fuente original sigue siendo necesaria depende del modo de copia, la persistencia y el éxito en la desconexión. Consulta [Modos de arranque](/using-minios/Boot-Modes) para el modelo operativo.

## Composición de módulos

Cada archivo `.sb` es un sistema de archivos SquashFS de solo lectura. Los módulos integrados se almacenan directamente bajo `minios/`; ubicaciones adicionales de módulos pueden contribuir a la composición ordenada. El initramfs selecciona, ordena y monta las capas resultantes de solo lectura. Los niveles candidatos, el reemplazo de nombre base, los filtros, las extensiones personalizadas de paquetes y la coordinación con el kernel en ejecución se especifican en [Carga de módulos Initrd](/reference/boot-process/Module-Loading).

Una imagen típica de Xfce contiene los siguientes roles ordenados, aunque los nombres y números exactos dependen de la compilación y de los módulos omitidos para ese destino:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Los módulos posteriores tienen mayor precedencia y pueden reemplazar rutas suministradas por módulos anteriores. Un módulo puede depender de archivos en cualquier módulo de número inferior, por lo que un conjunto de archivos de módulo es una composición ordenada y no una colección de paquetes independientes.

## AUFS y OverlayFS

MiniOS utiliza un sistema de archivos en unión para presentar los módulos y la capa escribible como un único sistema de archivos raíz. Selecciona AUFS cuando el kernel en ejecución lo soporta y recurre a OverlayFS en caso contrario. `union=aufs` solicita AUFS, pero aún así recurre a OverlayFS cuando AUFS no está disponible; `union=overlayfs` selecciona OverlayFS.

Las dos implementaciones tienen una diferencia operativa importante:

- AUFS comienza con la rama escribible y añade los módulos montados como ramas de solo lectura. MiniOS puede activar o desactivar un módulo en el sistema raíz en ejecución cuando el montaje AUFS soporta esa operación.
- OverlayFS recibe su lista `lowerdir` completa y ordenada cuando se monta la raíz, además de un `upperdir` y `workdir`. Su conjunto de módulos inferiores no se puede modificar en caliente mediante el **Gestor de módulos de MiniOS**.

Por lo tanto, el **Gestor de módulos de MiniOS** separa **Ejecutando ahora**, el conjunto de módulos montados, de **Próximo arranque**, los módulos seleccionados por el medio actual y las reglas de arranque. Agregar o quitar un módulo duradero normalmente solo afecta al próximo arranque. Crear o abrir un módulo no lo activa. La activación y desactivación en tiempo de ejecución solo están disponibles con AUFS.

Después de ensamblar la raíz y completar la configuración inicial, el initrd de LiveKit utiliza `pivot_root`, conserva el initrd antiguo para tareas de apagado y ejecuta el init de la nueva raíz. La ruta de dracut prepara la misma raíz ensamblada pero deja la ejecución final de `switch_root` a dracut. Consulta [Carga de módulos en Initrd](/reference/boot-process/Module-Loading) para ver los detalles del traspaso.

## Capa escribible y sesiones

Sin persistencia, la capa escribible se respalda en memoria y desaparece al apagar el sistema. La persistencia puede activar en su lugar una sesión numerada con un backend de almacenamiento compatible. La selección, compatibilidad, fallos de activación, autoridad en el arranque actual y durabilidad se definen en [Persistencia Initrd](/reference/boot-process/Persistence-Internals).

| Modo | Almacenamiento escribible | Notas |
|------|--------------------------|-------|
| `native` | Archivos almacenados directamente en el directorio de sesión | Requiere un sistema de archivos POSIX escribible que preserve los metadatos de Linux. |
| `dynfilefs` | Sistema de archivos ext4 expandible dividido en archivos de respaldo | Soporta sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `raw` | `changes.img` de tamaño fijo que contiene ext4 | Soporta sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `luks` | LUKS2 `changes.luks` que contiene ext4 | Requiere cryptsetup y un initramfs construido con soporte de cifrado MiniOS. Se solicita la contraseña durante el arranque. |
| `squashfs` | Instantánea comprimida `changes.sb` | Se descomprime en RAM para su uso; al guardar se reconstruye y reemplaza atómicamente la instantánea. El sistema de archivos de persistencia debe preservar los metadatos de Linux durante el guardado. |

La sesión activa seleccionada para una reanudación futura y la capa escribible realmente autorizada para el arranque actual son estados relacionados pero distintos. Cambiar una selección futura no reemplaza la capa escribible en ejecución.

Consulta [Gestión de sesiones](/using-minios/Sessions-and-Persistence) para los comandos de creación, selección, dimensionamiento, cifrado, conversión, exportación y recuperación.

## Precedencia de la configuración

La configuración del medio es `minios/config.conf`, con fragmentos opcionales en `minios/config.conf.d/`. Las copias en tiempo de ejecución son `/etc/live/config.conf` y `/etc/live/config.conf.d/` en la raíz compuesta.

Al arrancar, MiniOS compara las fechas de modificación y copia un archivo de medio más reciente a la raíz en tiempo de ejecución. Si el medio es escribible y la copia en tiempo de ejecución es más reciente, se copia de vuelta al medio. Los archivos fragmentados se sincronizan por nombre en ambas direcciones. Si el reloj ha retrocedido desde la sincronización anterior, MiniOS evita reemplazar las marcas de tiempo y solo rellena los destinos que faltan.

Las opciones de la línea de comandos del kernel sobrescriben los valores correspondientes leídos de la configuración en tiempo de ejecución para ese arranque. Esto significa que el orden efectivo para una opción explícitamente soportada es el parámetro de arranque, luego la configuración sincronizada en tiempo de ejecución/medio, y finalmente el valor predeterminado integrado. Las ediciones persistentes en tiempo de ejecución pueden convertirse en la configuración del medio cuando la fuente es escribible; los medios ISO de solo lectura no pueden recibir esa actualización.

Consulta [Archivo de configuración](/reference/configuration/config.conf) y [live-config](/reference/configuration/live-config) para los ajustes soportados.

## Ciclo de apagado y guardado

El apagado normal primero da al sistema en ejecución la oportunidad de vaciar servicios y datos de sesión. Una sesión SquashFS con guardado al apagar habilitado se reconstruye y valida antes de desmontar el sistema de archivos. El backend de guardado escribe un marcador de finalización para la sesión exacta en ejecución; el initramfs de apagado verifica ese marcador y deja la sesión sucia si el guardado requerido falla.

Luego, el initramfs de apagado desconecta los dispositivos loop no usados, desmonta la antigua raíz y la capa escribible, registra una sesión exitosa como limpia, desmonta el medio y cierra un mapeo LUKS propiedad de MiniOS. Los medios ópticos pueden ser expulsados antes de apagar o reiniciar. Los guardados manuales y periódicos SquashFS utilizan el mismo backend de instantáneas, pero solo la política de apagado configurada bloquea la finalización limpia si falta el guardado al apagar.

## Árbol de medios

La imagen actual se organiza de la siguiente manera. Los directorios opcionales solo aparecen cuando la función correspondiente ha generado contenido.

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

Las rutas arrancadas bajo `/run/initramfs/memory/` son puntos de montaje de implementación, no una segunda copia persistente de este árbol.

## Documentación relacionada

- [Modos de arranque](/using-minios/Boot-Modes)
- [Detección del sistema Initrd](/reference/boot-process/System-Discovery)
- [Carga de módulos Initrd](/reference/boot-process/Module-Loading)
- [Persistencia de Initrd](/reference/boot-process/Persistence-Internals)
- [Parámetros de arranque](/reference/Boot-Parameters)
- [Menús de arranque](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Archivo de configuración](/reference/configuration/config.conf)
- [Gestión de sesiones](/using-minios/Sessions-and-Persistence)
- [Arranque por red](/reference/boot-process/Network-Boot)
- [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
