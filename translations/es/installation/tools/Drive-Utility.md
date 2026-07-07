# Uso de Drive Utility

Drive Utility es una herramienta gráfica para grabar imágenes ISO de MiniOS en unidades USB.

**Instalación:** Disponible en MiniOS por defecto, para otras distribuciones consulta https://github.com/minios-linux/driveutility

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz copia de seguridad de los datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad (para grabar MiniOS)

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos detallados del sistema y tamaños de unidad.

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

## Persistencia automática de cambios

Al grabar MiniOS con Drive Utility, se crea una copia exacta de la imagen ISO. MiniOS detectará automáticamente el método de grabación y configurará la persistencia de cambios en el primer arranque.

### Configuración de parámetros (para usuarios avanzados)

Para una configuración precisa de la persistencia, se pueden usar parámetros de arranque:

- `perchmode=native` - Guardado directo en partición (cuando hay espacio libre disponible)
- `perchmode=dynfilefs` - Archivo expandible dinámicamente
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Espacio de almacenamiento para datos en MB

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
