---
updated: 2026-08-26
---

# Usando Balena Etcher

Balena Etcher es un programa multiplataforma muy práctico para grabar imágenes ISO en unidades USB. Es compatible con Windows, macOS y Linux.

## Importante

**Advertencia:** ¡La selección incorrecta del dispositivo puede provocar la pérdida de datos! Verifica siempre la unidad seleccionada y haz una copia de seguridad de los datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para obtener información detallada sobre los requisitos del sistema y los tamaños de las unidades.

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

## Resultado y persistencia

Etcher realiza una escritura de imagen en bruto: copia la estructura del ISO en todo el dispositivo de destino. No crea una partición ext4 en el espacio no utilizado, no crea una sesión de persistencia ni realiza una implementación del instalador de MiniOS.

La persistencia solo se habilita cuando una entrada de arranque o una línea de comandos del kernel la solicita, y aún así requiere un almacenamiento adecuado y con permisos de escritura. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md) antes de depender de los cambios guardados.
