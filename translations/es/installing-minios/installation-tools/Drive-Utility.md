---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Utilidad de disco

Utilidad de disco es una herramienta gráfica para grabar imágenes ISO de MiniOS en unidades USB.

**Instalación:** Disponible en MiniOS por defecto; para otras distribuciones, consulta https://github.com/minios-linux/driveutility

## Importante

**Advertencia:** ¡Seleccionar un dispositivo incorrecto provocará la pérdida de datos! Revisa siempre la unidad seleccionada y haz una copia de seguridad de la información importante.

## Requisitos de la unidad

### Tamaño de la unidad (para grabar MiniOS)

Consulta la [Guía de compatibilidad de hardware](/getting-started/Hardware-Compatibility) para ver los requisitos detallados del sistema y los tamaños de unidad recomendados.

### Sistemas de archivos compatibles

- **FAT32**: máxima compatibilidad
- **NTFS**: compatibilidad con Windows
- **EXT4**: recomendado para Linux

## Iniciar Utilidad de disco

**Desde el menú de aplicaciones:**
1. Abre el menú → Sistema → "Utilidad de disco"

**Desde la terminal:**
```bash
driveutility
```

## Crear una unidad USB booteable

1. **Selecciona el modo "Write"** en la ventana principal del programa
2. **Selecciona el archivo ISO de MiniOS:**
   - Haz clic en el botón "Browse" junto al campo "Source"
   - Busca y selecciona el archivo MiniOS.iso descargado
3. **Selecciona la unidad de destino:**
   - Elige tu unidad USB de la lista de dispositivos
   - Verifica la selección por tamaño y modelo
4. **Inicia la escritura:**
   - Haz clic en el botón "Write"
   - Confirma la operación: todos los datos de la unidad serán eliminados
5. **Espera a que finalice**: el proceso tomará varios minutos

## Resultado y persistencia

El modo de escritura realiza una escritura de imagen sin procesar: copia la estructura del ISO en todo el dispositivo de destino. No crea una partición ext4 en el espacio no utilizado, ni crea una sesión de persistencia, ni ejecuta un despliegue del Instalador de MiniOS. Las opciones de sistema de archivos mencionadas arriba aplican solo a las operaciones de la Utilidad de disco que formatean un sistema de archivos, no al esquema de particiones copiado por una escritura de ISO.

La persistencia solo se activa cuando una entrada de arranque o la línea de comandos del kernel la solicitan, y aún requiere un almacenamiento adecuado con permisos de escritura. Consulta [Modos de arranque](/using-minios/Boot-Modes) y [Persistencia Initrd](/reference/boot-process/Persistence-Internals) antes de depender de los cambios guardados.
