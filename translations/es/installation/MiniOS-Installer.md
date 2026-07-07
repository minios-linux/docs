# Uso del Instalador de MiniOS

El Instalador de MiniOS es una herramienta gráfica para instalar MiniOS en discos duros o unidades USB, compatible con UEFI/BIOS y múltiples sistemas de archivos.

## Importante

⚠️ **Advertencia:** ¡La selección incorrecta del dispositivo resultará en pérdida de datos! Verifica siempre dos veces el dispositivo seleccionado y haz una copia de seguridad de tus datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](Hardware-Compatibility.md#system-requirements) para ver los requisitos detallados del sistema y tamaños de unidad.

### Sistemas de archivos compatibles

- **ext4** (recomendado para Linux)
- **Btrfs** (sistema de archivos moderno con instantáneas)
- **FAT32** (máxima compatibilidad)
- **NTFS** (compatibilidad con Windows)

## Creación de la instalación

### Iniciar el Instalador de MiniOS

**Desde el menú de aplicaciones:**
1. Abre el menú → Sistema → "Instalar MiniOS"

**Desde la terminal:**
```bash
sudo minios-installer
```

### Proceso de instalación

1. **Configura los ajustes del sistema (Opcional pero recomendado):**
   - Haz clic en el botón **"Configurar MiniOS antes de instalar"**
   - Establece tus preferencias:
     - Idioma y configuración regional del sistema
     - Zona horaria y distribución del teclado  
     - Cuentas de usuario y contraseñas
     - Nombre del equipo y servicios del sistema
   - Guarda y cierra el configurador
   
2. **Selecciona el dispositivo de destino:**
   - Elige un disco duro o unidad USB de la lista
   - Verifica el tamaño y modelo del dispositivo
   
3. **Selecciona el sistema de archivos:**
   - **ext4**: recomendado para la mayoría de los casos
   - **Btrfs**: para usuarios avanzados
   - **FAT32**: para máxima compatibilidad
   
4. **Confirma el borrado del disco:**
   - Todos los datos en el dispositivo seleccionado serán eliminados
   - Asegúrate de seleccionar el dispositivo correcto
   
5. **Inicia la instalación:**
   - Haz clic en el botón "Instalar"
   - Espera a que finalice el proceso
   
6. **Finalización:**
   - Reinicia el sistema
   - Retira el LiveUSB/LiveCD
   - **Resultado:** El sistema inicia con tus ajustes preconfigurados

## Configuración previa a la instalación

### Beneficios de usar el Configurador de MiniOS antes de instalar

**Flujo de trabajo recomendado para nuevos usuarios:**

1. **Configuración única**: Ajusta todas las preferencias del sistema una sola vez antes de instalar
2. **Listo para usar**: El sistema instalado inicia con el idioma, teclado y usuarios correctos
3. **Sin trabajo posterior a la instalación**: Omite la configuración manual tras el primer arranque
4. **Experiencia consistente**: Los mismos ajustes en todas las instalaciones

**Opciones de configuración disponibles:**
- **🌍 Localización**: Idioma del sistema, configuración regional y zona horaria
- **⌨️ Entrada**: Distribuciones de teclado y opciones de cambio  
- **👤 Cuentas**: Nombre de usuario, nombre completo, contraseñas y grupos de usuarios
- **🖥️ Sistema**: Nombre del equipo, servicios habilitados/deshabilitados
- **🔒 Seguridad**: Configuración segura de contraseña antes de conectarse a Internet

**Flujo de trabajo sencillo:**
- Configura tus preferencias una vez antes de instalar
- Instala MiniOS con tus ajustes personalizados
- Inicia en un sistema completamente configurado

## Persistencia automática de cambios

Después de la instalación, el Instalador de MiniOS crea un sistema en el dispositivo seleccionado:

- **Compatibilidad UEFI/BIOS**: Creación automática de las particiones de arranque necesarias
- **Persistencia de cambios**: Soporte completo para los modos de persistencia de MiniOS
- **Sistemas de archivos**: Soporte para ext4, Btrfs, FAT32, NTFS

### Configuración de parámetros (para usuarios avanzados)

Para una configuración precisa de la persistencia, se pueden usar parámetros de arranque:

- `perchmode=native` - Guardado directo en la partición (cuando hay espacio disponible)
- `perchmode=dynfilefs` - Archivo expandible dinámicamente
- `perchmode=raw` - Archivo de tamaño fijo
- `perchsize=8000` - Tamaño del espacio de almacenamiento para datos en MB

Más detalles en [parámetros de arranque](/configuration/Boot-Parameters.md).
