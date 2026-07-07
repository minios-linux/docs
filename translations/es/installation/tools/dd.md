# Uso del comando `dd`

`dd` es una utilidad de línea de comandos versátil para copiar datos bit a bit entre archivos y dispositivos. Se utiliza principalmente para grabar imágenes ISO en unidades USB, crear copias de seguridad y recuperación de datos.

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz copia de seguridad de la información importante.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos detallados del sistema y tamaños de unidad.

## Preparación

1. Identifica tu unidad USB:
   - **Linux:** `lsblk` o `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Desmonta la unidad:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Creación de unidad USB booteable

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Reemplazar:**
- `MiniOS.iso` - ruta a tu archivo ISO
- `/dev/sdX` - tu unidad USB (ejemplo: `/dev/sdb`)

## Persistencia automática de cambios

En el primer arranque, MiniOS comprobará el tipo de sistema de archivos de la unidad y seleccionará el modo de persistencia de cambios óptimo. Cuando haya espacio libre disponible, el sistema creará automáticamente una partición ext4 para máximo rendimiento.

### Configuración de parámetros (para usuarios avanzados)

Para una configuración precisa de la persistencia, se pueden usar parámetros de arranque:

- `perchmode=native` - Guardado directo en partición (predeterminado, más rápido)
- `perchmode=dynfilefs` - Archivo dinámicamente expandible
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Espacio de almacenamiento para datos en MB para archivos de imagen

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
