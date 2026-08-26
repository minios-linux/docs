---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Uso de Drive Utility

Drive Utility es una herramienta gráfica para grabar imágenes ISO de MiniOS en unidades USB.

**Instalación:** Disponible en MiniOS por defecto, para otras distribuciones consulta https://github.com/minios-linux/driveutility

## Importante

**Advertencia:** ¡La selección incorrecta del dispositivo resultará en la pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz una copia de seguridad de los datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad (para escritura de MiniOS)

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para conocer los requisitos de sistema y tamaños de unidad en detalle.

### Sistemas de archivos compatibles

- **FAT32**: máxima compatibilidad
- **NTFS**: compatibilidad con Windows
- **EXT4**: recomendado para Linux

## Iniciar Drive Utility

**Desde el menú de aplicaciones:**
1. Abre el menú → Sistema → "Drive Utility"

**Desde la terminal:**
```bash
driveutility
```

## Crear unidad USB booteable

1. **Selecciona el modo "Write"** en la ventana principal del programa
2. **Selecciona el archivo ISO de MiniOS:**
   - Haz clic en el botón "Browse" junto al campo "Source"
   - Busca y selecciona el archivo MiniOS.iso descargado
3. **Selecciona la unidad de destino:**
   - Elige tu unidad USB de la lista de dispositivos
   - Verifica la selección por tamaño y modelo
4. **Inicia la grabación:**
   - Haz clic en el botón "Write"
   - Confirma la operación: todos los datos de la unidad serán eliminados
5. **Espera a que finalice**: el proceso tomará varios minutos

## Resultado y persistencia

El modo de escritura realiza una grabación de imagen en bruto: copia la estructura del ISO en todo el dispositivo de destino. No crea una partición ext4 en el espacio no utilizado, ni crea una sesión de persistencia, ni realiza una instalación de MiniOS. Las opciones de sistema de archivos mencionadas arriba aplican solo a las operaciones de Drive Utility que formatean un sistema de archivos, no al esquema de particiones copiado por una escritura de ISO.

La persistencia solo se habilita cuando una entrada de arranque o la línea de comandos del kernel lo solicita, y aún requiere un almacenamiento adecuado con permisos de escritura. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md) antes de depender de los cambios guardados.
