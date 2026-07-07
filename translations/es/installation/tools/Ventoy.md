# Usando Ventoy

Ventoy es una herramienta popular para crear unidades USB booteables que te permite almacenar múltiples archivos ISO en un solo dispositivo y arrancar desde cualquiera de ellos.

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz una copia de seguridad de tus datos importantes.

⚠️ **Requisito de modo de arranque:** Para que MiniOS funcione correctamente con Ventoy, DEBES seleccionar el **modo GRUB2** al arrancar, o renombrar tu archivo ISO con el sufijo `VTGRUB2` (por ejemplo, `minios-standard-amd64_VTGRUB2.iso`) para forzar el modo GRUB2 automáticamente.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md#system-requirements) para ver los requisitos de sistema y tamaños de unidad en detalle.

## Instalando Ventoy

### Método 1: Instalación estándar

1. **Descarga Ventoy** desde el [sitio web oficial](https://www.ventoy.net/)
2. **Ejecuta el instalador de Ventoy** y selecciona tu unidad USB
3. **Instala Ventoy** en la unidad (todos los datos serán eliminados)
4. **Copia el archivo ISO de MiniOS** en la carpeta raíz de la unidad USB

Después de la instalación, la unidad estará lista para usarse. MiniOS creará automáticamente el almacenamiento para guardar los cambios.

### Método 2: Instalación con partición de datos separada (Recomendado)

1. **Descarga Ventoy** desde el [sitio web oficial](https://www.ventoy.net/)
2. **Ejecuta el instalador de Ventoy** y selecciona tu unidad USB  
3. **Activa la opción "Reservar espacio"** durante la instalación para crear una partición adicional
4. **Instala Ventoy** en la unidad
5. **Copia el archivo ISO de MiniOS** en la carpeta raíz de la unidad USB
6. **Crea una partición ext4** en el espacio reservado con la etiqueta `persistence`

Este método ofrece operaciones de datos más rápidas y mayor control sobre el almacenamiento.

## Integración con MiniOS

MiniOS incluye soporte integrado para Ventoy y detecta automáticamente cuando se ejecuta en un entorno Ventoy. El sistema configura automáticamente la persistencia de cambios sin necesidad de configuración adicional por parte del usuario.

### Persistencia automática de cambios

MiniOS detecta automáticamente cuando se ejecuta en un entorno Ventoy y configura la persistencia de cambios:

- **Con partición `persistence` separada**: La utiliza para almacenamiento directo de datos (modo nativo, máxima velocidad)
- **Con instalación estándar**: Crea un archivo dinámico en la partición principal de Ventoy (modo dynfilefs)

### Configuración de parámetros (para usuarios avanzados)

Cuando se requiere una configuración precisa, se pueden usar parámetros de arranque:

**Para partición `persistence` separada (todos los modos disponibles):**
- `perchmode=native` - Guardado directo en la partición (más rápido)
- `perchmode=dynfilefs` - Archivo dinámicamente expandible
- `perchmode=raw` - Archivo de tamaño fijo

**Para instalación estándar de Ventoy (dos modos disponibles):**
- `perchmode=dynfilefs` - Archivo dinámicamente expandible (predeterminado, ahorra espacio)
- `perchmode=raw` - Archivo de tamaño fijo

**Parámetros comunes para archivos:**
- `perchsize=8000` - Tamaño del espacio de almacenamiento de datos en MB

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).

## Usando MiniOS con Ventoy

### Arranque

Después de instalar Ventoy y copiar el archivo ISO de MiniOS en la unidad:

1. **Arranca desde la unidad USB** - selecciónala en la BIOS/UEFI
2. **Selecciona MiniOS** de la lista de archivos ISO disponibles en el menú de Ventoy
3. **⚠️ IMPORTANTE: Selecciona el modo GRUB2** cuando Ventoy lo solicite
4. **Espera la carga** - el sistema se configurará automáticamente para funcionar

### **Requisitos del modo de arranque de Ventoy**

**Para que MiniOS funcione correctamente:**
- **Modo GRUB2** - Requerido para el funcionamiento correcto de MiniOS

**Solución alternativa:**
- Agrega el sufijo `VTGRUB2` al nombre del archivo ISO (por ejemplo, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Esto hace que Ventoy utilice automáticamente el modo GRUB2 sin preguntar
