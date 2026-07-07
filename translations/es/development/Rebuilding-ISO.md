# Reconstrucción de ISO

Esta guía explica cómo reconstruir y personalizar imágenes ISO de MiniOS utilizando las herramientas integradas. Ya sea que quieras crear versiones ligeras, añadir software personalizado o distribuir sistemas adaptados, estas herramientas facilitan volver a empaquetar tu sistema en vivo en una nueva ISO booteable.

## Visión general

MiniOS ofrece potentes herramientas para reconstruir imágenes ISO directamente desde un sistema en vivo en ejecución. Esto te permite:

- **Eliminar software no deseado** para crear distribuciones más ligeras
- **Agregar módulos personalizados** con software adicional
- **Crear versiones especializadas** para casos de uso específicos
- **Distribuir sistemas personalizados** a otros usuarios
- **Crear medios de instalación** con tu configuración actual

## Inicio rápido

La forma más sencilla de crear una ISO desde tu sistema actual:

```bash
sudo sb2iso
```

Esto crea `minios-YYYYMMDD_HHMM.iso` en tu directorio actual con todos los módulos cargados.

## Herramienta principal: sb2iso

**sb2iso** es la herramienta principal para reconstruir imágenes ISO. Lee tu sistema en vivo actual y lo empaqueta en un archivo ISO booteable.

### Uso básico

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Opciones de comando

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Excluye archivos/módulos que coincidan con el patrón | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Especifica el nombre del archivo de salida | `--name minios_custom.iso` |
| `--menu TYPE` | Establece el idioma o tipo de menú | `--menu ru_RU` o `--menu multilang` |
| `--help` | Muestra información de ayuda | `--help` |
| `--version` | Muestra la versión | `--version` |

### Tipos de menú soportados

- **multilang** (predeterminado) - Menú multilenguaje con selección de idioma
- **Códigos de idioma** - Menús de un solo idioma: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Ejemplos prácticos

### Creación de versiones ligeras

**Eliminar aplicaciones pesadas:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Crear sistema solo en modo texto:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Eliminar aplicaciones multimedia:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Añadiendo software personalizado

**Agregar herramientas de desarrollo:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Agregar aplicaciones de juegos:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### ISOs específicas por idioma

**Crear ISO localizada en ruso:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Crear ISO en alemán:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Distribuciones profesionales/educativas

**ISO educativa con herramientas de aprendizaje:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**ISO empresarial:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Flujo de trabajo de personalización avanzada

### 1. Prepara tu sistema

Comienza con un sistema MiniOS limpio y personalízalo:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Crea módulos personalizados

Guarda tus cambios como módulos:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Prueba tus módulos

Antes de crear la ISO final, prueba tus módulos:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Crea la ISO final

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Trabajo con módulos

### Entendiendo la numeración de módulos

Los módulos se cargan en orden numérico:
- **00-core** - Sistema base (siempre incluido)
- **01-kernel** - Kernel y controladores
- **02-firmware** - Firmware de hardware
- **03-gui-base** - Componentes básicos de la interfaz gráfica
- **04-desktop** - Entorno de escritorio
- **05-apps** - Aplicaciones
- **06+** - Módulos adicionales

### Comandos de gestión de módulos

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Exclusión de patrones de contenido

La opción `--exclude` utiliza expresiones regulares para coincidir con rutas de archivos. Patrones comunes:

### Exclusión de aplicaciones

```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### Exclusión de componentes del sistema

```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Exclusiones combinadas

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Requisitos del sistema

### Ejecutando sb2iso

- **Sistema**: Debe ejecutarse desde un sistema en vivo MiniOS
- **Privilegios**: Se requiere acceso root (`sudo`)
- **Memoria**: RAM suficiente para archivos temporales
- **Almacenamiento**: Espacio libre para la ISO de salida (típicamente 1-4 GB)

### Requisito de archivos de arranque

**sb2iso** requiere que los archivos de arranque estén disponibles. Si cargaste el sistema en RAM, usa:

```bash
# Boot with full RAM copy
toram=full
```

O asegúrate de que los archivos de arranque sean accesibles desde el medio original.

## Solución de problemas

### Problemas comunes

**"Cannot find MiniOS source directory"**
- Asegúrate de estar ejecutando un sistema en vivo MiniOS
- Verifica que los archivos de arranque estén disponibles
- Prueba usando el parámetro de arranque `toram=full`

**"Required file not found"**
- Es posible que falten archivos de arranque
- Asegúrate de estar usando un sistema MiniOS completo

**Fallo en la creación de ISO**
- Verifica el espacio disponible en disco
- Comprueba que tienes permisos de escritura
- Asegúrate de que ningún archivo esté en uso durante la creación

**Módulo no incluido**
- Verifica que el archivo del módulo exista y sea legible
- Comprueba el formato del módulo (archivos .sb)
- Asegúrate de tener espacio suficiente para todos los módulos

### Información de depuración

Activa la salida detallada para solucionar problemas:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Mejores prácticas

### Planificación de tu ISO

1. **Comienza limpio**: Inicia con un sistema MiniOS recién instalado
2. **Prueba a fondo**: Valida todas las personalizaciones antes de crear la ISO
3. **Documenta los cambios**: Lleva un registro de las modificaciones realizadas
4. **Considera el tamaño**: Controla el tamaño de la ISO para facilitar la distribución

### Organización de módulos

1. **Agrupación lógica**: Agrupa el software relacionado en módulos
2. **Numeración adecuada**: Usa la numeración apropiada para los módulos
3. **Pruebas**: Prueba cada módulo individualmente
4. **Dependencias**: Comprende las dependencias entre módulos

### Preparación para la distribución

1. **Convención de nombres**: Usa nombres descriptivos para las ISOs
2. **Documentación**: Incluye instrucciones de uso
3. **Soporte de idiomas**: Considera usuarios internacionales
4. **Optimización de tamaño**: Elimina componentes innecesarios

## Integración con otras herramientas

### Creación de módulos personalizados

Antes de reconstruir la ISO, puedes crear módulos personalizados:

- **apt2sb** - Crea módulos a partir de la instalación de paquetes
- **script2sb** - Crea módulos usando scripts personalizados
- **chroot2sb** - Crea módulos de forma interactiva
- **savechanges** - Guarda las modificaciones actuales del sistema

Consulta la guía [Creación de módulos](/development/Creating-Modules.md) para instrucciones detalladas.

### Compilación desde el código fuente

Para una personalización completa, considera compilar desde el código fuente:

- **minios-live** - Construye sistemas completos desde cero
- **minios-cmd** - Interfaz de compilación simplificada

Consulta la guía [Compilando MiniOS](/development/Building-MiniOS.md) para compilaciones desde el código fuente.

## Conclusión

Las herramientas de reconstrucción de ISO en MiniOS ofrecen una forma potente de personalizar y redistribuir sistemas Linux. Ya sea que estés creando distribuciones especializadas, eliminando software no deseado o agregando funcionalidades personalizadas, estas herramientas facilitan empaquetar tu sistema en vivo en una imagen ISO profesional.

Comienza con personalizaciones sencillas y avanza gradualmente hacia distribuciones más complejas a medida que te familiarices con el sistema de módulos y las opciones disponibles.
