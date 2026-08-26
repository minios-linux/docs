# Usando Ventoy

Ventoy es una herramienta popular para crear unidades USB booteables que te permite almacenar múltiples archivos ISO en un solo dispositivo y arrancar desde cualquiera de ellos.

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz una copia de seguridad de tus datos importantes.

⚠️ **Requisito de modo de arranque:** Para que MiniOS funcione correctamente con Ventoy, DEBES seleccionar el **modo GRUB2** al arrancar, o renombrar tu archivo ISO con el sufijo `VTGRUB2` (por ejemplo, `minios-standard-amd64_VTGRUB2.iso`) para forzar el modo GRUB2 automáticamente.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para conocer los requisitos del sistema y tamaños de unidad en detalle.

## Instalando Ventoy

### Método 1: Instalación estándar

1. **Descarga Ventoy** desde el [sitio web oficial](https://www.ventoy.net/)
2. **Ejecuta el instalador de Ventoy** y selecciona tu unidad USB
3. **Instala Ventoy** en la unidad (todos los datos se eliminarán)
4. **Copia el archivo ISO de MiniOS** en la carpeta raíz de la unidad USB

Esto crea un medio multiboot de archivos ISO: Ventoy mantiene el ISO como un archivo en su partición de datos y lo presenta al arrancar. No es una escritura de imagen cruda de MiniOS ni una implementación del instalador de MiniOS.

### Método 2: Instalación con partición de datos separada (Recomendado)

1. **Descarga Ventoy** desde el [sitio web oficial](https://www.ventoy.net/)
2. **Ejecuta el instalador de Ventoy** y selecciona tu unidad USB
3. **Activa la opción "Reservar espacio"** durante la instalación para crear una partición adicional
4. **Instala Ventoy** en la unidad
5. **Copia el archivo ISO de MiniOS** en la carpeta raíz de la unidad USB
6. **Crea una partición ext4** en el espacio reservado con la etiqueta `persistence`

Esto proporciona una posible ubicación para la persistencia, pero crear solo la partición no habilita la persistencia ni crea una sesión.

## Integración con MiniOS

MiniOS incluye soporte para detectar un ISO presentado por Ventoy. El descubrimiento de la fuente y la selección de persistencia son procesos independientes; Ventoy no habilita la persistencia de MiniOS por sí mismo.

### Persistencia

La persistencia solo se activa cuando una entrada de arranque o una línea de comandos del kernel la solicita. Su activación depende de una ubicación compatible con escritura y de una sesión utilizable; una instalación estándar de Ventoy no garantiza que se cree ninguna de las dos automáticamente. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md) antes de confiar en los cambios guardados.

## Uso de MiniOS con Ventoy

### Arranque

Después de instalar Ventoy y copiar el archivo ISO de MiniOS en la unidad:

1. **Arranca desde la unidad USB** - selecciónala en el BIOS/UEFI
2. **Selecciona MiniOS** de la lista de archivos ISO disponibles en el menú de Ventoy
3. **⚠️ IMPORTANTE: Selecciona el modo GRUB2** cuando Ventoy lo solicite
4. **Espera a que cargue MiniOS**

### **Requisitos de modo de arranque de Ventoy**

**Para que MiniOS funcione correctamente:**
- **Modo GRUB2** - Requerido para el funcionamiento correcto de MiniOS

**Solución alternativa:**
- Añade el sufijo `VTGRUB2` al nombre del archivo ISO (por ejemplo, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Esto obliga a Ventoy a usar automáticamente el modo GRUB2 sin preguntar
