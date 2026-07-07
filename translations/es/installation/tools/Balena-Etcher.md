# Usando Balena Etcher

Balena Etcher es un programa multiplataforma muy práctico para grabar imágenes ISO en unidades USB. Es compatible con Windows, macOS y Linux.

## Importante

⚠️ **Advertencia:** ¡Seleccionar el dispositivo incorrecto provocará la pérdida de datos! Verifica siempre la unidad seleccionada y haz una copia de seguridad de la información importante.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos detallados del sistema y los tamaños de las unidades.

## Preparación

1. Descarga Balena Etcher desde el [sitio web oficial](https://www.balena.io/etcher/)
2. Instala el programa en tu sistema operativo
3. Conecta la unidad USB

## Crear una unidad USB booteable

1. Abre Balena Etcher
2. Selecciona la imagen ISO de MiniOS:
   - Haz clic en "Flash from file"
   - Especifica la ruta al archivo ISO
3. Selecciona la unidad USB de destino:
   - Haz clic en "Select target"
   - Verifica el modelo y tamaño del dispositivo
4. Inicia la grabación:
   - Haz clic en "Flash!"
   - Espera a que el proceso finalice (5–15 minutos)

## Persistencia automática de cambios

En el primer arranque, MiniOS comprobará el tipo de sistema de archivos de la unidad y elegirá el modo de persistencia de cambios óptimo. Si hay espacio libre disponible, el sistema creará automáticamente una partición ext4 para obtener el máximo rendimiento.

### Configuración de parámetros (para usuarios avanzados)

Cuando se requiere una configuración precisa de la persistencia, se pueden utilizar parámetros de arranque:

- `perchmode=native` - Guardado directo en la partición (predeterminado, más rápido)
- `perchmode=dynfilefs` - Archivo dinámicamente expandible
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Tamaño del espacio de almacenamiento de datos en MB para archivos de imagen

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
