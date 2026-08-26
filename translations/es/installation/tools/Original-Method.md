# Método de instalación original (Windows/Linux, legado)

Este método de instalación legado de MiniOS consiste en copiar los archivos del sistema directamente a la unidad e instalar el gestor de arranque. Se recomienda utilizar un método actual de [Instalación de MiniOS](/installation/Installing-MiniOS.md) a menos que se requiera específicamente una disposición basada en archivos.

**Nota:** Este método solo funciona en Windows y Linux debido al uso del gestor de arranque SYSLINUX.

## Importante

**Advertencia:** Seleccionar el dispositivo incorrecto provocará la pérdida de datos. Verifica siempre la unidad seleccionada y haz una copia de seguridad de la información importante.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos de sistema y tamaños de unidad detallados.

### Requisitos técnicos

- **Sistemas de archivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partición**: MBR
- **Arranque EFI**: Al usar sistemas de archivos NTFS, exFAT o ext2/3/4, el arranque en modo EFI puede no estar disponible. Para soporte EFI, se recomienda FAT32.

## Creación de una unidad USB booteable

### Paso 1: Preparar la unidad

**Windows:**
1. Abre "Administración de discos" (`Win+R`, luego `diskmgmt.msc`)
2. Busca la unidad USB, haz clic derecho y selecciona "Eliminar volumen"
3. Haz clic derecho sobre el espacio no asignado y selecciona "Nuevo volumen simple"
4. Elige el sistema de archivos: FAT32 (recomendado) o NTFS

**Linux:**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Paso 2: Extraer y copiar archivos

**Montar ISO:**

*Windows:*
- Haz clic derecho en el archivo ISO y selecciona "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copiar archivos:**
1. **Busca la carpeta `/minios/`** en el ISO montado
2. **Copia toda la carpeta `/minios/`** a la raíz de la unidad USB

### Paso 3: Instalar el gestor de arranque

Navega a la carpeta `/minios/boot/syslinux/` en la unidad y ejecuta el instalador:

**Windows:**
- Ejecuta `bootinst.bat` **como administrador**

**Linux:**
```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_MOUNT="/media/$USER/MINIOS"
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Reemplaza `MINIOS` por el directorio de montaje exacto verificado con `lsblk`. No utilices
comodines: el script detecta el disco de destino según su propia ubicación y
escribe el código de arranque en ese disco.

## Persistencia automática de cambios

En el primer arranque, MiniOS comprobará el tipo de sistema de archivos de la unidad e intentará utilizar el modo de persistencia de cambios más óptimo:

- **ext2/3/4, Btrfs**: intenta usar el modo `native` (guardado directo)
- **FAT32/NTFS**: utiliza el modo `dynfilefs` (archivo dinámico)
- Cuando el modo nativo no está disponible, cambia automáticamente a dynfilefs

### Configuración de parámetros para usuarios avanzados

Cuando se requiere una configuración de persistencia precisa, se pueden utilizar parámetros de arranque:

- `perchmode=native` - Guardado directo en la partición (para ext4)
- `perchmode=dynfilefs` - Archivo expandible dinámicamente
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Tamaño del espacio de almacenamiento de datos en MB

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
