# Primeros pasos con MiniOS 🌟

Bienvenido a MiniOS, donde la flexibilidad y portabilidad de Linux se combinan con la comodidad y facilidad de uso. Si eres nuevo en MiniOS, esta guía completa te ayudará a comenzar y aprovechar al máximo tu sistema operativo.

## Paso 1: Elige la edición adecuada de MiniOS 📦

MiniOS ofrece tres ediciones principales, cada una diseñada para diferentes necesidades:

- **🚀 Estándar** - El caballo de batalla confiable para tareas diarias
- **🧰 Toolbox** - Kit de herramientas avanzado para usuarios exigentes
- **⚡ Ultra** - Todo en uno, con el conjunto completo de funciones

Para descripciones detalladas de las características y el software incluido en cada edición, consulta [Acerca de MiniOS](/about/About-MiniOS.md).

**Opciones de descarga:**
- **Sitio oficial**: [minios.dev](https://minios.dev) - Vista general de ediciones y descargas directas
- **GitHub Releases**: [Últimas versiones](https://github.com/minios-linux/minios-live/releases) - Todas las versiones y notas de lanzamiento

Para un desglose detallado de los paquetes incluidos en cada edición, consulta la [Lista de paquetes](/administration/Packages.md).

## Paso 2: Crea una unidad USB booteable 🔌

**Métodos de instalación recomendados:**

### 🖥️ **Windows**

- **[Rufus](/installation/tools/Rufus.md)** ⭐ - Sencillo y confiable
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interfaz gráfica multiplataforma
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ - Soporte multi-boot

### 🐧 **Linux**

- **[Comando dd](/installation/tools/dd.md)** ⭐ - Herramienta rápida por línea de comandos
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interfaz gráfica fácil de usar

### 🍎 **macOS**

- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interfaz gráfica sencilla
- **[Comando dd](/installation/tools/dd.md)** ⭐ - Herramienta de terminal integrada

### 🏠 **Desde MiniOS**

- **[MiniOS Installer](/installation/MiniOS-Installer.md)** - Herramienta gráfica integrada

**Métodos adicionales:** [UNetbootin](/installation/tools/UNetbootin.md), [Drive Utility](/installation/tools/Drive-Utility.md), [Método original](/installation/tools/Original-Method.md)

### Requisitos de tamaño de la unidad

- **Estándar (787 MB)**: mínimo 2 GB
- **Toolbox (1.2 GB)**: mínimo 4 GB
- **Ultra (1.7 GB)**: mínimo 4 GB
- **Tamaño recomendado**: 8 GB o más para operar cómodamente con persistencia de cambios

**Notas importantes:**
- Cada enlace anterior ofrece instrucciones detalladas paso a paso
- Los métodos recomendados (⭐) han sido probados por su fiabilidad y facilidad de uso
- Elige el método que mejor se adapte a tu sistema operativo y nivel de experiencia

## Paso 3: Inicia y explora 🖥️

Después de arrancar desde el USB, explora el entorno de escritorio de MiniOS:

**Funciones clave para descubrir**:
- Menú de aplicaciones (panel inferior izquierdo)
- Configuración y preferencias del sistema
- Gestor de archivos (Thunar)
- Aplicaciones preinstaladas (navegador, suite ofimática, utilidades)
- Opciones de personalización del escritorio

El entorno de escritorio predeterminado es XFCE, que ofrece un equilibrio entre funciones y rendimiento.

## Paso 4: Configuración del sistema 🌐

**Configura el idioma del sistema, teclado, zona horaria y otras preferencias:**

### 🔧 **Usando el Configurador de MiniOS** (Recomendado)

**Acceso:** Menú de aplicaciones → Sistema → Configurar MiniOS

**Ajustes clave que puedes configurar:**
- **🌍 Idioma y región**: Establece el idioma del sistema (ejemplo: `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Zona horaria**: Configura tu zona horaria (ejemplo: `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Teclado**: Define distribuciones y opciones de cambio (ejemplo: `us,ru` con alternancia `Alt+Shift`)
- **👤 Usuario**: Cambia nombre de usuario, nombre completo y grupos
- **🔐 Contraseñas**: Establece contraseñas seguras para usuario y root
- **🖥️ Sistema**: Configura el hostname, activa/desactiva servicios
- **🔧 Avanzado**: Opciones de arranque y comportamiento del sistema

**Cómo usarlo:**
1. Abre el Configurador de MiniOS desde el menú del sistema
2. Navega por las pestañas para configurar diferentes aspectos
3. Realiza los cambios y guarda
4. **Reinicia para aplicar los cambios** - la configuración se aplica tras el reinicio y se mantiene entre reinicios

**Nota técnica:** El Configurador de MiniOS modifica `/etc/live/config.conf`, que es el archivo principal de configuración de MiniOS y controla el comportamiento del sistema al arrancar. Para información detallada sobre los parámetros y su funcionamiento, consulta la guía [Archivo de configuración](/configuration/Configuration-File.md).

### 💻 **Alternativa: Configuración por línea de comandos**

**Cambios inmediatos (se aplican al instante):**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**Para cambios persistentes tras reinicios:** Usa el Configurador de MiniOS o edita directamente `/etc/live/config.conf`.

### 📋 **Opciones de configuración adicionales**

- **Edición directa de archivos**: Edita manualmente `/etc/live/config.conf` para usuarios avanzados
- **Configuración en arranque**: Usa [Parámetros de arranque](/configuration/Boot-Parameters.md) para configurar el sistema antes de iniciar
- **Guía del archivo de configuración**: Consulta [Archivo de configuración](/configuration/Configuration-File.md) para referencia detallada de config.conf
- **Preinstalación**: Configura antes de instalar con [MiniOS Installer](/installation/MiniOS-Installer.md)

**Importante:** Los cambios en `/etc/live/config.conf` (ya sea con el Configurador de MiniOS o edición manual) requieren reinicio para aplicarse. Herramientas de línea de comandos como `localectl` y `timedatectl` aplican los cambios al instante, pero pueden no persistir tras reiniciar sin la configuración adecuada.

## Paso 5: Instalación de software 🔄

MiniOS ofrece varias formas de instalar software:

### 📦 **Gestor de paquetes APT**

Gestión básica de paquetes Debian - usa `man apt` para referencia detallada de comandos.

### 🔄 **Sistema de módulos**

Módulos SquashFS avanzados para software persistente - consulta la guía [Creación de módulos](/development/Creating-Modules.md).

**Diferencia clave:** Las instalaciones vía APT requieren persistencia para sobrevivir a los reinicios, mientras que los módulos son persistentes automáticamente.

## Paso 6: Persistencia de datos 💾

**¡Buenas noticias!** MiniOS configura automáticamente la persistencia de datos durante la instalación. Tus archivos, configuraciones e instalaciones de software se guardan automáticamente.

### Cómo funciona

- **Configuración automática**: Todos los métodos de instalación crean persistencia automáticamente
- **Detección inteligente**: El sistema elige el modo de persistencia óptimo según el sistema de archivos de tu unidad
- **Portátil**: Tus datos te acompañan en la unidad USB

### Configuración avanzada

Para una configuración personalizada de la persistencia, consulta la guía detallada [Archivo de configuración](/configuration/Configuration-File.md) y la referencia de [Parámetros de arranque](/configuration/Boot-Parameters.md).

## Paso 7: Configuración de seguridad 🔐

### 👤 **Cuentas predeterminadas**

- **Usuario**: `live` / `evil`
- **Root**: `root` / `toor`

### 🔒 **Pasos importantes de seguridad**

1. **Cambia las contraseñas de inmediato** - Las credenciales predeterminadas son de conocimiento público
2. **Usa contraseñas fuertes y únicas** para todas las cuentas

### Métodos para configurar contraseñas

- **🔧 Recomendado**: Usa **MiniOS Configurator** (Menú de aplicaciones → Sistema → Configurar MiniOS → pestaña Usuario)
- **💻 Línea de comandos**: `passwd live` y `sudo passwd root`
- **📋 Avanzado**: Consulta la guía [Endurecimiento de seguridad](/administration/Security-Hardening.md) para una configuración detallada

⚠️ **¡Nunca uses credenciales por defecto en sistemas conectados a red!**

## Paso 8: Personalización y temas avanzados 🛠️

### 🎨 **Personalización básica**

- Temas de escritorio y fondos desde Configuración
- Distribución del panel y preferencias de aplicaciones
- Atajos de teclado y ajustes del sistema

### 🚀 **Configuración avanzada**

- **Parámetros de arranque**: [Referencia completa](/configuration/Boot-Parameters.md) para ajustar el sistema
- **Rendimiento**: [Guía de optimización](/administration/Performance-Optimization.md) para mayor velocidad
- **Hardware**: [Guía de compatibilidad](/installation/Hardware-Compatibility.md) para soporte de dispositivos

### 🔧 **Funciones para usuarios avanzados**

- **Compilaciones personalizadas**: [Compilar MiniOS](/development/Building-MiniOS.md) desde el código fuente
- **Creación de módulos**: Desarrollo de [módulos avanzados](/development/Creating-Modules.md)
- **Reconstrucción de ISO**: [Empaqueta el sistema live](/development/Rebuilding-ISO.md) en una ISO booteable
- **Actualización de kernel**: Guía de [gestión de kernel](/administration/Kernel-Management.md)

## Ayuda y recursos de la comunidad 💬

### 📚 **Documentación**

- **Sitio oficial**: [minios.dev](https://minios.dev) - Noticias y descargas más recientes
- **Todas las guías**: Disponibles en esta colección de documentación

### 🐛 **Soporte y reportes de problemas**

- **Reportes de errores**: [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Código fuente**: [Repositorio en GitHub](https://github.com/minios-linux/minios-live)

### 📖 **Aprende más**

- **Documentación de Debian**: [www.debian.org/doc](https://www.debian.org/doc/) - MiniOS está basado en Debian
- **Conceptos básicos de Linux**: Los tutoriales generales de Linux aplican a MiniOS

## ¡Bienvenido a MiniOS! 🎉

Ahora tienes todo lo necesario para empezar con MiniOS. El sistema combina la potencia de Linux con la comodidad portátil: perfecto para recuperación de sistemas, computación portátil o uso diario.

**Próximos pasos:** Elige tu edición, crea tu USB y ¡comienza a explorar! 🚀
