# Usando UNetbootin

UNetbootin es una utilidad de código abierto y multiplataforma que te permite crear unidades USB booteables para varias distribuciones de Linux, incluyendo MiniOS.

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en la pérdida de datos! Siempre verifica dos veces la unidad seleccionada y haz una copia de seguridad de la información importante.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos detallados del sistema y los tamaños de unidad.

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

## Persistencia automática de cambios

UNetbootin formatea automáticamente la unidad en FAT32, por lo que MiniOS usará el modo dynfilefs para guardar los cambios. Esto garantiza la máxima compatibilidad con diversos sistemas, incluyendo soporte para arranque EFI.

### Configuración de parámetros (para usuarios avanzados)

Cuando se requiere una configuración precisa, se pueden usar parámetros de arranque:

- `perchmode=dynfilefs` - Archivo dinámicamente expandible (por defecto)
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Espacio de almacenamiento de datos en MB

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
