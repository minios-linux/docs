# Método de instalación original (Windows/Linux)

El método de instalación original de MiniOS consiste en copiar los archivos del sistema directamente a la unidad e instalar el gestor de arranque. Este método ofrece la máxima flexibilidad de configuración y compatibilidad con varios tipos de medios.

⚠️ **Nota**: Este método solo funciona en Windows y Linux debido al uso del gestor de arranque SYSLINUX.

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en la pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz una copia de seguridad de los datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para conocer los requisitos detallados del sistema y tamaños de unidad.

### Requisitos técnicos

- **Sistemas de archivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partición**: MBR
- ⚠️ **Arranque EFI**: Al usar sistemas de archivos NTFS, exFAT o ext2/3/4, el arranque en modo EFI puede no estar disponible. Para soporte EFI, se recomienda FAT32.

## Creación de unidad USB booteable

### Paso 1: Preparar la unidad

**Windows:**
1. Abre "Administración de discos" (`Win+R` → `diskmgmt.msc`)
2. Busca la unidad USB → clic derecho → "Eliminar volumen"
3. Clic derecho en el espacio no asignado → "Nuevo volumen simple"
4. Elige sistema de archivos: FAT32 (recomendado) o NTFS

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
- Clic derecho en el archivo ISO → "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copiar archivos:**
1. **Busca la carpeta `/minios/`** en el ISO montado
2. **Copia toda la carpeta `/minios/`** a la raíz de la unidad USB

### Paso 3: Instalar el gestor de arranque

Navega a la carpeta `/minios/boot/` en la unidad y ejecuta el instalador:

**Windows:**
- Ejecuta `bootinst.bat` **como administrador**

**Linux:**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Persistencia automática de cambios

En el primer arranque, MiniOS verificará el tipo de sistema de archivos de la unidad e intentará usar el modo de persistencia de cambios óptimo:

- **ext2/3/4, Btrfs**: intenta usar el modo `native` (guardado directo)
- **FAT32/NTFS**: usa el modo `dynfilefs` (archivo dinámico)
- Cuando el modo nativo no está disponible, cambia automáticamente a dynfilefs

### Configuración de parámetros (para usuarios avanzados)

Cuando se requiere una configuración precisa de la persistencia, se pueden usar parámetros de arranque:

- `perchmode=native` - Guardado directo en la partición (para ext4)
- `perchmode=dynfilefs` - Archivo dinámico expandible
- `perchmode=raw` - Archivo de tamaño fijo  
- `perchsize=8000` - Espacio de almacenamiento de datos en MB

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
