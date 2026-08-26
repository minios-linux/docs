# Método de instalación original (Windows/Linux, legado)

Este método de instalación legado de MiniOS consiste en copiar los archivos del sistema directamente a la unidad e instalar el gestor de arranque. Se recomienda utilizar un método actual de [Instalación de MiniOS](/installation/Installing-MiniOS.md) a menos que se requiera específicamente una disposición basada en archivos.

**Nota:** Este método solo funciona en Windows y Linux debido al uso del gestor de arranque SYSLINUX.

## Importante

**Advertencia:** Este procedimiento reparticiona y formatea el dispositivo seleccionado. Es destructivo para todo el dispositivo, no solo para los archivos actualmente visibles en él. Haz una copia de seguridad de los datos importantes y verifica la ruta exacta del dispositivo, modelo, capacidad, partición y punto de montaje antes de ejecutar `fdisk`, `mkfs` o `bootinst`. Desconecta otras unidades extraíbles cuando sea posible.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para conocer los requisitos detallados del sistema y los tamaños de las unidades.

### Requisitos técnicos

- **Sistemas de archivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partición**: MBR
- **Arranque EFI**: Al usar sistemas de archivos NTFS, exFAT o ext2/3/4, el arranque en modo EFI puede no estar disponible. Para soporte EFI, se recomienda FAT32.

## Creación de una unidad USB booteable

### Paso 1: Preparar la unidad

**Windows:**
1. Abre "Administración de discos" (`Win+R`, luego `diskmgmt.msc`)
2. Verifica el dispositivo USB por su número de disco, modelo y capacidad. No continúes si tienes alguna duda sobre estos datos.
3. Haz clic derecho en su volumen y selecciona "Eliminar volumen"
4. Haz clic derecho en el espacio no asignado y selecciona "Nuevo volumen simple"
5. Elige el sistema de archivos: FAT32 (recomendado) o NTFS

**Linux:**

Asigna `TARGET_DISK` y `TARGET_PARTITION` solo a rutas exactas después de comprobar el modelo y la capacidad del dispositivo en `lsblk`. La escritura de `fdisk` reemplaza la tabla de particiones en todo el disco de destino. Ejecuta solo un comando `mkfs` para el sistema de archivos que desees.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Paso 2: Extraer y copiar archivos

**Montar ISO:**

*Windows:*
- Haz clic derecho en el archivo ISO y selecciona "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copiar archivos:**
1. **Busca la carpeta `/minios/`** en el ISO montado
2. **Copia toda la carpeta `/minios/`** a la raíz de la unidad USB

En Linux, la raíz de destino en el ejemplo anterior es `/mnt/minios-target`. Confirma que `findmnt --mountpoint /mnt/minios-target` muestre exactamente la partición seleccionada en el Paso 1 antes de copiar los archivos.

### Paso 3: Instalar el gestor de arranque

Navega a la carpeta `/minios/boot/syslinux/` en la unidad y ejecuta el instalador:

`bootinst` escribe el código de arranque en el disco derivado de la ubicación del instalador. Lee [Recuperación de arranque](/administration/Boot-Recovery.md) antes de modificar el código de arranque, y no ejecutes el instalador hasta haber verificado el dispositivo y el punto de montaje.

**Windows:**
- Abre la unidad USB verificada por su letra de unidad exacta, navega a `minios\boot\syslinux` y ejecuta `bootinst.bat` **como administrador**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

No sustituyas el punto de montaje por un comodín. El script determina el disco de destino a partir de su propia ubicación y escribe el código de arranque en ese disco.

## Resultado y persistencia

Este procedimiento crea una instalación en vivo basada en archivos colocando el árbol `minios/` y el gestor de arranque en un sistema de archivos normal. No es una escritura directa de ISO, una configuración multiboot con archivo ISO, ni un despliegue del instalador de MiniOS.

El sistema de archivos elegido afecta a qué backends de persistencia pueden funcionar, pero no habilita la persistencia ni garantiza que se cree una sesión. La persistencia solo se habilita cuando una entrada de arranque o una línea de comandos del kernel la solicita, y la activación aún requiere un almacenamiento adecuado con permisos de escritura. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia en Initrd](/configuration/Initrd-Persistence.md) antes de depender de los cambios guardados.
