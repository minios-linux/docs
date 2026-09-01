---
updated: 2026-08-31
---

# Instalación manual basada en archivos

Este método de instalación de MiniOS copia los archivos del sistema a un sistema de archivos normal e instala el gestor de arranque allí, en lugar de escribir el ISO bloque por bloque.
El espacio restante en el sistema de archivos permanece disponible para archivos normales, por lo que el dispositivo puede seguir utilizándose como una unidad USB común, además de como un dispositivo de arranque de MiniOS.

Este método es especialmente útil cuando se desea acceso directo a los archivos de MiniOS, almacenamiento de datos normal en la misma partición o un esquema de escritura para sesiones persistentes. Utiliza el gestor de arranque SYSLINUX y está pensado para Windows y Linux.

## Importante

**Advertencia:** Este procedimiento vuelve a particionar y formatea el dispositivo seleccionado. Es destructivo para todo el dispositivo, no solo para los archivos actualmente visibles en él. Haz una copia de seguridad de los datos importantes y verifica la ruta exacta del dispositivo, modelo, capacidad, partición y punto de montaje antes de ejecutar `fdisk`, `mkfs` o `bootinst`. Desconecta otras unidades extraíbles cuando sea posible.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/getting-started/Hardware-Compatibility) para conocer los requisitos del sistema y tamaños de unidad en detalle.

### Requisitos técnicos

- **Sistemas de archivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de particionado**: MBR
- **Arranque EFI**: Cuando se utilizan sistemas de archivos NTFS, exFAT o ext2/3/4, el arranque en modo EFI puede no estar disponible. Para soporte EFI, se recomienda FAT32.

## Creación de una unidad USB de arranque

### Paso 1: Preparar la unidad

**Windows:**
1. Abre "Administración de discos" (`Win+R`, luego `diskmgmt.msc`)
2. Verifica el dispositivo USB por su número de disco, modelo y capacidad. No continúes si tienes dudas sobre algún dato.
3. Haz clic derecho en su volumen y selecciona "Eliminar volumen"
4. Haz clic derecho en el espacio no asignado y selecciona "Nuevo volumen simple"
5. Elige el sistema de archivos: FAT32 (recomendado) o NTFS

**Linux:**

Asigna `TARGET_DISK` y `TARGET_PARTITION` solo a rutas exactas después de comprobar el modelo y la capacidad del dispositivo en `lsblk`. La escritura con `fdisk` reemplaza la tabla de particiones de todo el disco de destino. Ejecuta solo un comando `mkfs` para el sistema de archivos que desees.

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

**Montar la ISO:**

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
1. **Busca la carpeta `/minios/`** en la ISO montada
2. **Copia toda la carpeta `/minios/`** a la raíz de la unidad USB

En Linux, la raíz de destino en el ejemplo anterior es `/mnt/minios-target`. Confirma que `findmnt --mountpoint /mnt/minios-target` muestre exactamente la partición seleccionada en el Paso 1 antes de copiar los archivos.

### Paso 3: Instalar el gestor de arranque

Navega a la carpeta `/minios/boot/syslinux/` en la unidad y ejecuta el instalador:

`bootinst` escribe el código de arranque en el disco derivado de la ubicación del instalador. Lee [Solución de problemas](/maintenance-and-recovery/Troubleshooting) antes de modificar el código de arranque y no ejecutes el instalador hasta haber verificado el dispositivo y el punto de montaje.

**Windows:**
- Abre la unidad USB verificada por su letra exacta, navega a `minios\boot\syslinux` y ejecuta `bootinst.bat` **como administrador**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

No sustituyas el punto de montaje por un comodín. El script determina el disco de destino según su propia ubicación y escribe el código de arranque en ese disco.

## Resultado y persistencia

Este procedimiento crea una instalación en vivo basada en archivos colocando el árbol `minios/` y el gestor de arranque en un sistema de archivos normal. No es una escritura de ISO en bruto, una configuración multiboot con archivo ISO ni un despliegue del Instalador de MiniOS.

El sistema de archivos elegido afecta qué backends de persistencia pueden funcionar, pero no habilita la persistencia ni garantiza que se cree una sesión. La persistencia solo se activa cuando una entrada de arranque o la línea de comandos del kernel la solicita, y su activación sigue requiriendo almacenamiento escribible adecuado. Consulta [Modos de arranque](/using-minios/Boot-Modes) y [Persistencia en initrd](/reference/boot-process/Persistence-Internals) antes de depender de los cambios guardados.
