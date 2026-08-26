---
updated: 2026-08-26
---

# Usando UNetbootin

UNetbootin es una utilidad de código abierto y multiplataforma que te permite crear unidades USB booteables para varias distribuciones de Linux, incluyendo MiniOS.

## Importante

**Advertencia:** ¡La selección incorrecta del dispositivo resultará en la pérdida de datos! Verifica siempre la unidad seleccionada y haz una copia de seguridad de la información importante.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para conocer los requisitos del sistema y los tamaños de unidad en detalle.

## Instalación de UNetbootin

1. **Descarga UNetbootin** desde el [sitio web oficial](https://unetbootin.github.io/)
2. **Instala el programa** en tu sistema:
   - **Windows**: Ejecuta el instalador como administrador
   - **Linux**: Instala desde el repositorio o usa AppImage
   - **macOS**: Arrastra la aplicación a la carpeta de Aplicaciones

## Creación de USB booteable

1. **Inicia UNetbootin** como administrador/root
2. **Selecciona la fuente de la imagen:**
   - Cambia la opción a "Imagen de disco"
   - Haz clic en el botón "..." y selecciona el archivo ISO de MiniOS
3. **Selecciona el dispositivo de destino:**
   - En la lista "Unidad", selecciona tu USB
   - Asegúrate de elegir el dispositivo correcto
4. **Inicia el proceso:** Haz clic en "OK"
5. **Espera a que finalice** - el proceso puede tardar entre 10 y 20 minutos

## Resultado y persistencia

UNetbootin extrae archivos e instala archivos de arranque en el sistema de archivos seleccionado, creando medios live basados en archivos en lugar de realizar una escritura de imagen sin procesar o una implementación del instalador de MiniOS. Su uso no garantiza el formateo FAT32, compatibilidad EFI ni persistencia.

La persistencia solo se habilita cuando una entrada de arranque o la línea de comandos del kernel la solicita, y aún así requiere un almacenamiento adecuado con permisos de escritura. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia de Initrd](/configuration/Initrd-Persistence.md) antes de depender de los cambios guardados.
