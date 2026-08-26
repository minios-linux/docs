---
updated: 2026-08-26
---

# Recuperación de arranque

La reparación del arranque depende de cómo se haya instalado MiniOS en el dispositivo y de si el firmware lo inicia en modo BIOS o UEFI. Un procedimiento adecuado para una configuración puede dañar otra. Haz una copia de seguridad de los archivos importantes antes de escribir un sector de arranque, cambiar una bandera de partición, reemplazar un árbol EFI o reinstalar GRUB. Consulta [Copia de seguridad y recuperación](/administration/Backup-Recovery.md). Si no tienes claro el tipo de instalación, compáralo con [Modos de arranque](/configuration/Boot-Modes.md) antes de elegir un flujo de trabajo de reparación.

## Identificar la configuración

- **ISO grabada en bruto:** `dd`, Etcher, Rufus en modo DD u otro escritor de imágenes similar copiaron la estructura de bloques del ISO a todo el dispositivo. Trata esto como un medio de imagen, no como una instalación normal basada en archivos.
- **Instalación live basada en archivos:** el dispositivo tiene un sistema de archivos normal con un directorio `minios/` que contiene módulos SquashFS y `minios/boot/`. Esto incluye el método clásico de copia de archivos y despliegues live realizados por el Instalador de MiniOS.
- **Instalación nativa:** el Instalador de MiniOS expandió los módulos en un sistema de archivos raíz Linux convencional. Utiliza el GRUB y el initramfs del sistema instalado en lugar de la estructura modular de arranque live.

`Ventoy` normalmente mantiene el ISO como un archivo bajo su propio gestor de arranque. Repáralo siguiendo el procedimiento de la documentación de `Ventoy`; no instales el sector de arranque Syslinux de MiniOS sobre él.

## Diagnosticar sin modificar el disco

Primero confirma si la falla ocurre antes del menú de MiniOS, después del menú o después de que arranca el kernel. Revisa el menú de arranque único del firmware y anota si la entrada seleccionada es UEFI o BIOS heredado. Prueba otro puerto y, si es posible, inicia el mismo dispositivo en otro ordenador.

Desde un medio de rescate Linux funcional, inspecciona en lugar de reparar:

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

En un sistema iniciado en modo UEFI, `sudo efibootmgr -v` puede listar las entradas del firmware. Su ausencia o un error no prueban que falten los archivos EFI. No formatees, reparticiones, ejecutes una reparación de sistema de archivos ni cambies banderas solo como prueba. Confirma cada dispositivo por modelo y capacidad y monta los sistemas de archivos en modo solo lectura cuando solo vayas a inspeccionarlos.

Si el menú de arranque aparece pero MiniOS no puede encontrar sus módulos, edita temporalmente la entrada de arranque y prueba `from=askdisk`. Una vez identificado el sistema de archivos correcto, una etiqueta de sistema de archivos es más estable que un nombre como `/dev/sdb1`:

```text
from=/dev/disk/by-label/MINIOS/minios
```

La etiqueta debe existir e identificar el sistema de archivos deseado; las etiquetas deben ser únicas. Añade `debug timing` para obtener más salida durante el arranque temprano. Añade `rd.break` solo si necesitas una shell de initramfs para una inspección avanzada. Estas opciones diagnostican el descubrimiento de módulos; no reparan el gestor de arranque. Consulta [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md) para las formas soportadas de `from=`, el comportamiento de `askdisk` y la precedencia de origen. Consulta también [Parámetros de arranque](/configuration/Boot-Parameters.md) y [Solución de problemas](/administration/Troubleshooting.md).

## Medios ISO grabados en bruto

No ejecutes `bootinst.sh`, ni instales GRUB, ni copies archivos de arranque individuales en un dispositivo ISO grabado en bruto. Su mapa de particiones, registros de arranque, archivos ISO y archivos EFI forman una sola imagen. Si el ISO verificado arranca en otro lugar pero esta copia no, resguarda cualquier dato almacenado fuera de la estructura de la imagen y vuelve a grabar todo el dispositivo desde un ISO verificado. Consulta [Verificación de descargas](/installation/Verifying-Downloads.md) e [Instalación de MiniOS](/installation/Installing-MiniOS.md).

Si volver a grabar la misma imagen verificada sigue fallando, prueba con otro dispositivo y revisa la compatibilidad del firmware y hardware en lugar de modificar repetidamente la imagen.

## Instalaciones live basadas en archivos

### Instalador incluido en medios MBR

El instalador incluido solo es adecuado cuando se cumplen todas estas condiciones:

- El dispositivo es una instalación en vivo basada en archivos en un disco particionado con MBR.
- El directorio `minios/boot/syslinux/` está completo e intacto y pertenece al mismo árbol y versión de MiniOS que los demás recursos de arranque.
- El sistema de archivos montado y su dispositivo de disco completo principal han sido identificados sin suposiciones.

Ejecute el script desde ese directorio en el sistema de archivos de destino:

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

El script determina su destino a partir del sistema de archivos que contiene el propio script. Instala Syslinux allí, escribe 440 bytes de código de arranque MBR en el disco principal, puede cambiar el indicador de partición activa y copia el árbol de cargador UEFI incluido al sistema de archivos de destino. Un montaje o dispositivo incorrecto puede dejar otro sistema sin posibilidad de arrancar. No lo use en un disco GPT ni en una partición del sistema EFI compartida, no copie solo `bootinst.sh` a un árbol dañado y lo ejecute, y no use recursos de una versión diferente de MiniOS.

En Windows, la ruta correspondiente es:

```text
X:\minios\boot\syslinux\bootinst.bat
```

Ejecute el script como administrador solo desde el dispositivo extraíble previsto. El script rechaza el disco del sistema Windows detectado, pero esa verificación no sustituye la comprobación manual de la letra de unidad y el dispositivo físico.

### UEFI

El arranque UEFI no utiliza el código MBR de la BIOS. El firmware necesita una partición del sistema EFI o un sistema de archivos FAT legible y un árbol de cargador válido. Restaure únicamente un árbol `EFI/boot` completo y correspondiente, junto con sus archivos EFI de MiniOS relacionados, desde la imagen o copia de seguridad exacta utilizada para esa instalación. No combine los ejecutables EFI de una versión con la configuración de GRUB o los archivos `minios/boot` de otra versión.

El `bootinst.sh` incluido también copia su árbol de cargador UEFI correspondiente, pero igualmente realiza las escrituras de MBR y Syslinux descritas anteriormente. Úselo solo para el esquema MBR basado en archivos cubierto en la sección anterior, no como una herramienta genérica de reparación UEFI.

Copiar un solo archivo `.efi` puede dejar una cadena de cargadores incompleta. Si no se dispone del árbol EFI exacto y completo, reinstale la disposición en vivo basada en archivos en lugar de intentar una reconstrucción parcial. Conserve los directorios de otros proveedores y sistemas operativos no relacionados en una partición del sistema EFI compartida.

`minios-deploy` proporciona operaciones de `plan` y `install`, no una operación de reparación de arranque. No apunte un comando de instalación a un disco existente como intento de reparación. Consulte [MiniOS Installer](/installation/MiniOS-Installer.md) para ver los esquemas de instalación compatibles.

## Instalaciones nativas

### GRUB BIOS desde un chroot

Utiliza este procedimiento solo para una instalación nativa que fue instalada para BIOS heredado en un disco MBR. Escribe GRUB en todo el disco y puede reemplazar el código de arranque usado por otros sistemas operativos. No lo uses para UEFI, GPT, una estructura live basada en archivos o un ISO grabado en bruto.

Arranca desde un medio de rescate Linux confiable, identifica la partición raíz nativa y su disco padre, y luego sustituye sus rutas reales a continuación. Solo en este ejemplo, `/dev/sdXN` es la partición raíz y `/dev/sdX` es su disco completo padre. Nunca pases una partición como `/dev/sdX1` al comando final `grub-install`.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Monta una partición `/boot` nativa separada en `/mnt/boot` antes de los montajes bind, y desmóntala antes del `sudo umount /mnt` final. No montes una partición de sistema EFI para este procedimiento solo BIOS. Si la raíz usa LUKS, LVM, RAID u otra estructura que no comprendas completamente, detente y utiliza un método de recuperación específico para esa pila de almacenamiento. Si `update-grub`, `grub-script-check` o `grub-install` falla, no continúes cambiando la tabla de particiones ni probando otros discos.

### UEFI nativo

La reconstrucción manual de UEFI nativo no es segura de generalizar. Depende de la arquitectura EFI exacta, la cadena de cargadores, el estado de los paquetes, la estructura de montajes, el estado de Secure Boot, el comportamiento del firmware y si la partición de sistema EFI es compartida. Una copia de archivos genérica o un comando `grub-install` puede sobrescribir el cargador de recuperación de otro sistema operativo.

Es preferible restaurar una copia de seguridad exacta y probada de la raíz nativa, el contenido de la partición de sistema EFI y la configuración de arranque. De lo contrario, haz copia de seguridad de los datos de usuario y reinstala el sistema nativo con el Instalador de MiniOS. No adaptes el procedimiento de copia live basado en archivos `EFI/boot` a una instalación nativa.

## Reversión modular del kernel

Para una instalación en vivo basada en archivos que dejó de arrancar después de un cambio de kernel,
utiliza un medio de rescate de la misma versión y arquitectura de MiniOS. En su menú de arranque,
utiliza `from=askdisk` o una ruta de etiqueta estable para seleccionar el árbol de
`minios/` instalado. El árbol seleccionado debe contener un triplete completo que coincida con
el kernel ya cargado desde el medio de rescate; el initrd no puede cambiar el kernel en ejecución.
Consulta
[coordinación del kernel en ejecución](/configuration/Initrd-Module-Loading.md)
para ver las rutas y el comportamiento exactos de los módulos, la imagen del kernel y el initramfs.

Si esa combinación logra iniciar el sistema y el árbol instalado es escribible, inspecciona los conjuntos de kernels coordinados y activa uno que sepas que funciona:

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

La activación debe restaurar un módulo de kernel coordinado, la imagen del kernel, el initramfs
y la configuración del gestor de arranque. No reemplaces solo `vmlinuz`, solo el initramfs,
ni solo `01-kernel*.sb`. Conserva el kernel empaquetado anterior hasta que el reemplazo
haya arrancado correctamente. Consulta
[Gestión del kernel](/administration/Kernel-Management.md).

Esta reversión es para instalaciones en vivo modulares. Las instalaciones nativas utilizan sus
paquetes de kernel instalados y GRUB, y requieren recuperación nativa o reinstalación.

## Cuándo reinstalar

Haz copia de seguridad de los datos recuperables y reinstala en lugar de reparar cuando se cumpla alguna de estas condiciones:

- Un ISO grabado en bruto está corrupto o ha sido modificado parcialmente.
- No están disponibles los archivos completos y coincidentes de Syslinux, GRUB, kernel, initramfs o EFI.
- La tabla de particiones, el sistema de archivos o la partición de sistema EFI están dañados además del gestor de arranque.
- No se puede identificar con certeza el disco de destino o el dispositivo padre.
- Sería necesario reconstruir una cadena de cargadores UEFI nativa sin una copia exacta de respaldo.
- Errores de lectura repetidos, desconexiones o errores SMART indican un medio defectuoso.
- Un comando de reparación falla y el siguiente paso requeriría adivinar o sobrescribir datos de arranque no relacionados.

La reinstalación restaura una estructura de arranque coordinada y conocida; no recupera datos de usuario o persistencia que no hayan sido respaldados. Copia primero los datos importantes siempre que el sistema de archivos siga siendo legible.
