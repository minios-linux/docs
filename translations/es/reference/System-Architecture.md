---
updated: 2026-10-06
---

# Arquitectura del sistema

MiniOS inicia un sistema operativo de solo lectura ensamblado a partir de módulos SquashFS y añade una capa escribible para la sesión actual. El initramfs se encarga de localizar el medio, seleccionar los módulos y la persistencia, construir el sistema de archivos raíz, aplicar la configuración inicial y transferir el control al sistema init instalado.

## Descubrimiento de arranque

El gestor de arranque BIOS o UEFI carga un kernel de Linux y el initramfs MiniOS desde `minios/boot/`. Luego, el initramfs detecta el árbol de datos MiniOS que contiene los módulos live. Una fuente puede ser local, seleccionada de forma interactiva o suministrada a través de una ruta de red compatible; una ISO local se monta en bucle antes de usar su árbol de datos. La precedencia exacta y los formatos aceptados `from=` están documentados en [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery).

La misma etapa de descubrimiento admite fuentes ISO HTTP y PXE. La red opcional durante el arranque temprano solo se utiliza para **cargar MiniOS por red** (PXE / HTTP ISO). No configura la red de la sesión de forma permanente. Consulta [Arranque por red](/reference/boot-process/Network-Boot).

Tras el descubrimiento, MiniOS puede preparar opcionalmente una copia RAM. Si la fuente original sigue siendo necesaria depende del modo de copia, la persistencia y el desacople exitoso. Consulta [Modos de arranque](/using-minios/Boot-Modes) para el modelo operativo.

## Composición de módulos

Cada `.sb` archivo es un sistema de archivos SquashFS de solo lectura. Los módulos integrados se almacenan directamente en `minios/`; ubicaciones adicionales de módulos pueden contribuir a la composición ordenada. El initramfs selecciona, ordena y monta las capas resultantes de solo lectura. Los niveles candidatos, reemplazo de nombre base, filtros, extensiones personalizadas de paquetes y la coordinación con el kernel en ejecución se definen en [Carga de módulos Initrd](/reference/boot-process/Module-Loading).

Una imagen típica de Xfce contiene los siguientes roles ordenados, aunque los nombres y cantidades exactos dependen de la compilación y de los módulos omitidos para ese destino:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Los módulos posteriores tienen mayor precedencia y pueden reemplazar rutas proporcionadas por módulos anteriores. Un módulo puede depender de archivos en cualquier módulo de número inferior, por lo que un conjunto de archivos de módulos es una composición ordenada y no solo una colección de paquetes independientes.

## AUFS y OverlayFS

MiniOS utiliza un sistema de archivos union para presentar los módulos y la capa escribible como un solo sistema de archivos raíz. Selecciona AUFS cuando el kernel en ejecución lo soporta y recurre a OverlayFS en caso contrario. `union=aufs` solicita AUFS pero aún así recurre a OverlayFS cuando AUFS no está disponible; `union=overlayfs` selecciona OverlayFS. Bajo UEFI Secure Boot, el initrd no carga el módulo `aufs-ng` no firmado y utiliza OverlayFS a menos que ya exista otra implementación utilizable de AUFS.

Las dos implementaciones tienen una diferencia operativa importante:

- AUFS comienza con la rama escribible y añade los módulos montados como ramas de solo lectura. MiniOS puede activar o desactivar un módulo en el sistema raíz en ejecución cuando el montaje AUFS lo permite.
- OverlayFS recibe su lista completa y ordenada de `lowerdir` al montar la raíz, más un `upperdir` y `workdir`. Su conjunto de módulos inferiores no puede modificarse en caliente mediante **Gestor de módulos de MiniOS**.

**Gestor de módulos de MiniOS** por lo tanto separa **En ejecución**, el conjunto de módulos montados, de **Próximo arranque**, los módulos seleccionados por el medio actual y las reglas de arranque. Añadir o quitar un módulo duradero normalmente solo afecta al siguiente arranque. Crear o abrir un módulo no lo activa. La activación y desactivación en tiempo real solo están disponibles con AUFS.

Una vez ensamblada la raíz y completada la configuración inicial, el initrd de LiveKit utiliza `pivot_root`, mantiene el antiguo initrd para las tareas de apagado y ejecuta el init de la nueva raíz. La ruta dracut prepara la misma raíz ensamblada pero deja la finalización `switch_root` a dracut. Consulta [Carga de módulos Initrd](/reference/boot-process/Module-Loading) para los detalles del traspaso.

## Capa editable y sesiones

Sin persistencia, la capa editable se almacena en memoria y desaparece al apagar el sistema. La persistencia puede activar una sesión numerada con un backend de almacenamiento compatible. La selección, compatibilidad, fallos de activación, autoridad del arranque actual y durabilidad se definen en [Persistencia de Initrd](/reference/boot-process/Persistence-Internals).

| Modo | Almacenamiento editable | Notas |
|------|------------------|-------|
| `native` | Archivos almacenados directamente en el directorio de la sesión | Requiere un sistema de archivos POSIX editable que preserve los metadatos de Linux. |
| `dynfilefs` | Sistema de archivos ext4 expandible dividido en archivos de respaldo | Compatible con sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `dynblk` | Sistema de archivos ext4 ligero sobre un dispositivo de bloque del kernel respaldado por `volumeNNN.db` archivos | Requiere la capacidad de userspace, kernel e initrd de DynBlk. |
| `vmdk` | Almacenamiento disperso dividido `volume.vmdk` / `volume-sNNN.vmdk` expuesto como dispositivo de bloque por el controlador DynBlk | Requiere la capacidad de `vmdk-session-v1` DynBlk/initrd; sin compresión de backend. |
| `raw` | Archivo de tamaño fijo `changes.img` con ext4 | Compatible con sistemas de archivos POSIX y medios FAT32, NTFS o exFAT. |
| `squashfs` | Instantánea comprimida `changes.sb` | Se desempaqueta en RAM para su uso; al guardar, se reconstruye y reemplaza atómicamente la instantánea. El sistema de archivos de persistencia debe preservar los metadatos de Linux durante el guardado. |

Los formatos raw, DynFileFS, DynBlk y VMDK pueden llevar opcionalmente una capa LUKS2. Los metadatos registran el backend de almacenamiento y el cifrado por separado. Al apagar, se liberan ext4, el mapper, cualquier loop propio y el backend en orden de dependencia.

La sesión activa seleccionada para una reanudación futura y la capa editable realmente autorizada para el arranque actual son estados relacionados pero distintos. Cambiar la selección futura no reemplaza la capa editable en ejecución.

Consulte [Gestión de sesiones](/using-minios/Sessions-and-Persistence) para los comandos de creación, selección, dimensionamiento, cifrado, conversión, exportación y recuperación.

## Precedencia de configuración

La configuración del medio es `minios/config.conf`, con fragmentos opcionales en `minios/config.conf.d/`. Las copias en tiempo de ejecución son `/etc/live/config.conf` y `/etc/live/config.conf.d/` en la raíz compuesta.

En el arranque, MiniOS compara las fechas de modificación y copia un archivo de medio más reciente a la raíz de ejecución. Si el medio es escribible y la copia en ejecución es más reciente, se copia de vuelta al medio. Los archivos fragmentados se sincronizan por nombre en ambas direcciones. Si el reloj retrocedió desde la sincronización anterior, MiniOS evita reemplazar marcas de tiempo y solo rellena los destinos que faltan.

Las opciones de la línea de comandos del kernel sobrescriben los valores correspondientes leídos de la configuración en ejecución para ese arranque. Esto significa que el orden efectivo para una opción soportada explícitamente es el parámetro de arranque, luego la configuración sincronizada en ejecución/medio y finalmente el valor predeterminado integrado. Las ediciones persistentes en ejecución pueden convertirse en la configuración del medio si la fuente es escribible; los medios ISO de solo lectura no pueden recibir esa actualización.

Consulta [Archivo de configuración](/reference/configuration/config.conf) y [live-config](/reference/configuration/live-config) para las opciones soportadas.

## Ciclo de apagado y guardado

El apagado normal primero da al sistema en ejecución la oportunidad de vaciar servicios y datos de sesión. Una sesión SquashFS con guardado al apagar habilitado se reconstruye y valida antes de desmontar el sistema de archivos. El backend de guardado escribe un marcador de finalización para la sesión exacta en ejecución; el initramfs de apagado comprueba ese marcador y deja la sesión sucia si el guardado requerido falla.

Luego, el initramfs de apagado desconecta los dispositivos loop no usados, desmonta la raíz antigua y la capa escribible, registra una sesión exitosa como limpia, desmonta el medio y cierra un mapeo LUKS propiedad de MiniOS. El medio óptico puede ser expulsado antes de apagar o reiniciar. Los guardados manuales y periódicos de SquashFS usan el mismo backend de instantáneas, pero solo la política de apagado configurada bloquea la finalización limpia si falta el guardado al apagar.

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

- [Modos de arranque](/using-minios/Boot-Modes)
- [Descubrimiento del sistema Initrd](/reference/boot-process/System-Discovery)
- [Carga de módulos Initrd](/reference/boot-process/Module-Loading)
- [Persistencia Initrd](/reference/boot-process/Persistence-Internals)
- [Parámetros de arranque](/reference/Boot-Parameters)
- [Menús de arranque](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Archivo de configuración](/reference/configuration/config.conf)
- [Gestión de sesiones](/using-minios/Sessions-and-Persistence)
- [Arranque por red](/reference/boot-process/Network-Boot)
- [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
