# Usando Rufus (Windows)

Rufus es una utilidad popular para Windows que ayuda a formatear y crear unidades USB booteables.

## Importante

⚠️ **Advertencia:** ¡Seleccionar el dispositivo incorrecto resultará en la pérdida de datos! Siempre verifica dos veces la unidad seleccionada y haz una copia de seguridad de tus datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/installation/Hardware-Compatibility.md) para ver los requisitos de sistema detallados y los tamaños de unidad.

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

## Resultado y persistencia

El modo DD realiza una escritura de imagen en bruto y copia la estructura del ISO en todo el dispositivo de destino. El modo ISO formatea un sistema de archivos y extrae el contenido del ISO para crear un medio live basado en archivos. Ninguno de los dos modos es una implementación del instalador de MiniOS, y Rufus no crea automáticamente una partición ext4 ni una sesión de persistencia.

La persistencia solo se habilita cuando una entrada de arranque o una línea de comandos del kernel la solicita, y aún requiere un almacenamiento adecuado con permisos de escritura. Consulta [Modos de arranque](/configuration/Boot-Modes.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md) antes de confiar en los cambios guardados.
