# Usando Rufus (Windows)

Rufus es una utilidad popular para Windows que ayuda a formatear y crear unidades USB booteables.

## Importante

⚠️ **Advertencia:** ¡Seleccionar el dispositivo incorrecto resultará en la pérdida de datos! Siempre verifica dos veces la unidad seleccionada y haz una copia de seguridad de tus datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos de sistema y tamaños de unidad detallados.

## Instalando Rufus

1. **Descarga Rufus** desde el [sitio web oficial](https://rufus.ie/)
2. **Ejecuta el programa** - Rufus no requiere instalación, es una aplicación portable

## Creando una unidad USB booteable

Rufus ofrece dos métodos para grabar MiniOS en una unidad USB:

### Método 1: Modo DD (Recomendado)

1. **Ejecuta Rufus** como administrador
2. **Selecciona la unidad USB** en el campo "Dispositivo"
3. **Selecciona el archivo ISO de MiniOS**:
   - Haz clic en el botón "SELECCIONAR"
   - Busca y selecciona el archivo ISO de MiniOS descargado
4. **Elige el modo de escritura**:
   - En el diálogo "Imagen ISO híbrida detectada", selecciona **"Escribir en modo imagen DD"**
5. **Inicia el proceso**: Haz clic en el botón "INICIAR"
6. **Confirma la acción** - todos los datos de la unidad serán eliminados
7. **Espera a que finalice** el proceso de escritura

### Método 2: Modo ISO (Alternativo)

1. **Ejecuta Rufus** como administrador
2. **Selecciona la unidad USB** en el campo "Dispositivo"
3. **Selecciona el archivo ISO de MiniOS**:
   - Haz clic en el botón "SELECCIONAR"
   - Busca y selecciona el archivo ISO de MiniOS descargado
4. **Elige el modo de escritura**:
   - En el diálogo "Imagen ISO híbrida detectada", selecciona **"Escribir en modo imagen ISO"**
5. **Configura los ajustes**:
   - **Sistema de archivos**: FAT32 (recomendado) o NTFS
   - ⚠️ **Al elegir NTFS**: El arranque en modo EFI puede no estar disponible
6. **Inicia el proceso**: Haz clic en el botón "INICIAR"
7. **Confirma el formateo** - todos los datos de la unidad serán eliminados

## Persistencia automática de cambios

MiniOS detectará automáticamente el método de escritura y configurará la persistencia de cambios:

- **Modo DD**: Si hay espacio libre disponible, creará una partición ext4 para máximo rendimiento
- **Modo ISO**: Utiliza un archivo dinámico para guardar los cambios

### Configuración de parámetros (para usuarios avanzados)

Cuando se necesita una configuración precisa de la persistencia, se pueden usar parámetros de arranque:

- `perchmode=native` - Guardado directo en la partición (para modo DD)
- `perchmode=dynfilefs` - Archivo dinámico expandible
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Tamaño del espacio de almacenamiento de datos en MB

Detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
