---
updated: 2026-08-26
---

# Uso del comando `dd`

`dd` es una utilidad de línea de comandos versátil para copiar datos bit a bit entre archivos y dispositivos. Se utiliza principalmente para grabar imágenes ISO en unidades USB, crear copias de seguridad y recuperación de datos.

## Importante

**Advertencia:** ¡Seleccionar el dispositivo incorrecto provocará la pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz una copia de seguridad de tus datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para ver los requisitos del sistema y tamaños de unidad detallados.

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

## Resultado y persistencia

`dd` realiza una escritura de imagen en bruto: copia la estructura del ISO en todo el dispositivo de destino. No crea una partición ext4 en el espacio no utilizado, no crea una sesión de persistencia ni realiza una implementación del instalador de MiniOS.

La persistencia solo se habilita cuando una entrada de arranque o una línea de comandos del kernel la solicita, y aún requiere un almacenamiento adecuado con capacidad de escritura. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md) antes de depender de los cambios guardados.
