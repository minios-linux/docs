# Gestión del Kernel en MiniOS 🔧

## 🤔 ¿Por qué reemplazar el kernel?

MiniOS incluye un kernel predeterminado, pero hay varias razones por las que podrías querer reemplazarlo:

### 🔧 **Diferentes variantes del kernel de Debian**

Debian ofrece varias variantes de kernel optimizadas para distintos casos de uso:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel estándar para sistemas de 64 bits (predeterminado en MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel en tiempo real para aplicaciones críticas en tiempo
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Optimizado para entornos cloud y virtualizados

> **📝 Nota:** Los números de versión (como `6.12.38+deb13`) cambian con las actualizaciones. Para ver los kernels disponibles actualmente:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### 🎯 **Casos de uso especializados**

- **Computación en tiempo real** - Kernels RT para producción de audio, control industrial
- **Gaming y baja latencia** - Kernels personalizados con optimizaciones para juegos
- **Fortalecimiento de seguridad** - Kernels con parches de seguridad adicionales (grsecurity, etc.)
- **Compatibilidad de hardware** - Kernels más recientes para soporte de hardware moderno
- **Ajuste de rendimiento** - Kernels compilados a medida con optimizaciones específicas

### 🛠️ **Características personalizadas del kernel**

- **Parches personalizados** - Aplica parches específicos para tu hardware o caso de uso
- **Módulos del kernel** - Añade soporte para hardware o sistemas de archivos especializados
- **Optimización del compilador** - Compila con diferentes flags de optimización
- **Optimización de tamaño** - Elimina drivers innecesarios para reducir el tamaño del kernel

### 📈 **Escenarios comunes**

- **Estaciones de trabajo para producción de audio** - Usa kernel RT para latencia mínima de audio
- **Sistemas de juegos** - Aplica parches y optimizaciones específicas para gaming
- **Entornos de servidor** - Usa kernels optimizados para cloud para mejor virtualización
- **Hardware antiguo** - Usa kernels antiguos para compatibilidad con sistemas vintage
- **Sistemas de desarrollo** - Prueba aplicaciones con diferentes versiones de kernel

---

## ⚙️ Descripción general del gestor de kernels de MiniOS

MiniOS ofrece dos herramientas para la gestión de kernels:

1. **🖥️ MiniOS Kernel Manager (GUI):** Una aplicación gráfica fácil de usar para empaquetar, instalar y gestionar kernels
2. **⌨️ minios-kernel (CLI):** Herramienta de línea de comandos para usuarios avanzados y automatización

Ambas herramientas gestionan automáticamente:
- **Empaquetado del kernel** en formato SquashFS
- **Generación de initramfs** con los drivers y scripts de arranque necesarios
- **Instalación** en el repositorio de kernels de MiniOS
- **Actualización de la configuración del gestor de arranque**
- **Activación y cambio de kernel**

### ⚠️ **Consideraciones importantes:**

- **🔑 Privilegios administrativos:** Ambas herramientas requieren privilegios administrativos y solicitarán autenticación mediante PolicyKit
- **🔗 Compatibilidad de kernels:** Asegúrate de que los kernels sean compatibles con MiniOS. Se recomiendan los kernels del repositorio
- **💾 Directorio MiniOS:** Las herramientas detectan automáticamente el directorio de MiniOS (`/minios/`) y verifican permisos de escritura
- **🔄 Actualizaciones automáticas:** La configuración del gestor de arranque se actualiza automáticamente al activar kernels

---

## 🖥️ Método 1: Usando MiniOS Kernel Manager (GUI)

El gestor gráfico de kernels proporciona una interfaz intuitiva para todas las operaciones relacionadas con el kernel.

### 📝 **Pasos:**

#### 1. 🚀 **Iniciar la aplicación**

```bash
minios-kernel-manager
```

O busca "MiniOS Kernel Manager" en el menú de aplicaciones.

#### 2. 📦 **Empaquetar un nuevo kernel**

**Usando la pestaña Empaquetar Kernel:**

1. **Seleccionar origen del kernel:**
   - **Empaquetado manual:** Busca y selecciona un paquete kernel `.deb` local
   - **Repositorio:** Elige entre los kernels disponibles en los repositorios de Debian/Ubuntu

2. **Configurar compresión:**
   - Selecciona compresión SquashFS: `zstd` (recomendado), `lz4`, `lzo`, `xz` o `gzip`

3. **Empaquetar el kernel:**
   - Haz clic en el botón "Empaquetar Kernel"
   - Monitorea el progreso en el registro de empaquetado
   - Los archivos se instalan automáticamente en el repositorio de MiniOS

#### 3. 🔄 **Gestionar kernels instalados**

**Usando la pestaña Gestionar Kernels:**

1. **Ver kernels disponibles:**
   - Visualiza todos los kernels empaquetados con insignias de estado:
     - **ACTIVO:** Kernel actualmente configurado
     - **EN EJECUCIÓN:** Kernel actualmente iniciado
     - **DISPONIBLE:** Disponible para activación

2. **Activar un kernel:**
   - Haz clic derecho sobre un kernel y selecciona "Activar Kernel"
   - Confirma en el diálogo de activación
   - La configuración del gestor de arranque se actualiza automáticamente

3. **Eliminar un kernel:**
   - Haz clic derecho sobre un kernel inactivo y selecciona "Eliminar Kernel"
   - Confirma la eliminación (no se puede deshacer)

---

## ⌨️ Método 2: Usando minios-kernel (CLI)

La herramienta de línea de comandos permite gestionar kernels de forma automatizada y scriptable.

### ⚠️ **Se requieren privilegios administrativos:**

La herramienta CLI requiere privilegios de root y los verificará automáticamente. Ejecuta los comandos con `sudo` o mediante `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### 📝 **Comandos básicos:**

#### 1. 📋 **Listar kernels disponibles**

```bash
sudo minios-kernel list
```

Muestra todos los kernels empaquetados con su estado.

#### 2. 📦 **Empaquetar un kernel**

**Desde el repositorio:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**Desde archivo .deb local:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Con compresión personalizada:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. 🔄 **Activar un kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. 🗑️ **Eliminar un kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. 📊 **Comprobar estado**

```bash
sudo minios-kernel status
```

Muestra el estado del directorio MiniOS y la información del kernel actual.

#### 6. ℹ️ **Mostrar información del kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Muestra información detallada sobre un kernel específico, incluyendo su estado y disponibilidad.

### 🔧 **Opciones avanzadas de la CLI:**

#### **Salida JSON (para scripting):**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Opciones avanzadas de empaquetado:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Ayuda y uso:**

```bash
minios-kernel --help                    # General help (doesn't require root)
sudo minios-kernel package --help       # Package command help
sudo minios-kernel list --help          # List command help
sudo minios-kernel activate --help      # Activate command help
sudo minios-kernel info --help          # Info command help
sudo minios-kernel status --help        # Status command help
sudo minios-kernel delete --help        # Delete command help
```

---

## 🔧 Solución de problemas

### Problemas comunes y soluciones:

#### **🚫 Directorio MiniOS no encontrado**

- **Causa:** Las herramientas no pueden localizar el directorio de MiniOS
- **Solución:** Asegúrate de estar ejecutando desde un sistema MiniOS o que la unidad USB esté correctamente montada
- **Comprobación:** Ejecuta `sudo minios-kernel status` para verificar la detección del directorio

#### **🔒 Permiso denegado**

- **Causa:** El directorio MiniOS es de solo lectura o no tienes permisos suficientes
- **Solución:** Asegúrate de tener privilegios administrativos y que el sistema de archivos sea escribible
- **Comprobación:** Verifica el estado del directorio MiniOS en la GUI o CLI

#### **📦 Falló la instalación del paquete**

- **Causa:** Paquete corrupto, problemas de red o dependencias
- **Solución:** 
  - Verifica la integridad del archivo del paquete
  - Comprueba la conectividad de red para paquetes de repositorio
  - Actualiza las listas de paquetes: `sudo apt update`

#### **💥 Kernel panic después de la activación**

- **Causa:** Kernel incompatible o drivers faltantes
- **Solución:** 
  - Inicia en modo rescate o con un kernel anterior
  - Usa `sudo minios-kernel activate <working-version>` para activar un kernel funcional conocido
  - Verifica la compatibilidad del kernel con tu hardware

#### **🔄 El sistema inicia con el kernel antiguo**

- **Causa:** La configuración del gestor de arranque no se actualizó correctamente
- **Solución:** 
  - Repite la activación del kernel: `sudo minios-kernel activate <version>`
  - Verifica que el kernel se haya empaquetado e instalado correctamente

#### **⚠️ El hardware no funciona después de cambiar el kernel**

- **Causa:** Drivers faltantes en el nuevo kernel
- **Solución:**
  - Verifica que el archivo del módulo kernel SquashFS se haya instalado
  - Comprueba si el nuevo kernel soporta tu hardware
  - Considera usar una variante diferente de kernel

#### **🚨 Recuperación del Kernel desde la Imagen Original de MiniOS**

Si necesitas recuperar un kernel dañado o incompatible, puedes iniciar desde el ISO/USB original de MiniOS:

```bash
# Boot from original MiniOS image with from= parameter
# At boot prompt, specify your installed MiniOS device
from=/dev/sda1  # Replace with your actual MiniOS device
```

**Proceso de recuperación:**
Cuando inicias desde la imagen ISO/USB original de MiniOS y especificas en el parámetro `from=` el dispositivo donde está instalado MiniOS, el sistema de inicio detecta esto y te permite acceder a tu sistema MiniOS instalado. El método de recuperación depende de si los archivos originales del kernel aún están presentes:

1. **Si el kernel original aún existe:** 
   - El arranque se realiza sin problemas con el kernel original desde el ISO/USB
   - Activa manualmente el kernel original: `sudo minios-kernel activate <original-kernel-version>`

2. **Si el kernel original fue eliminado:** 
   - Copia manualmente los archivos del kernel desde la imagen original de MiniOS y restáuralos en las ubicaciones correspondientes de tu instalación de MiniOS
   - Activa manualmente el kernel restaurado: `sudo minios-kernel activate <original-kernel-version>`

En ambos casos, la activación del kernel requiere intervención manual después del proceso de recuperación.

### 🔍 **Comandos de diagnóstico:**

**Comprobar el estado actual del sistema:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verificar archivos del kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Comprobar configuración del gestor de arranque:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## 📋 Descripción general de la estructura de archivos

El gestor de kernels de MiniOS administra automáticamente estos archivos:

### **Estructura del Repositorio del Kernel:**

```
/minios/
├── 01-kernel.sb                   # Active kernel module (standard location)
├── kernels/                       # Repository of inactive/alternative kernels
│   ├── 01-kernel-<version>.sb     # SquashFS kernel modules
│   ├── vmlinuz-<version>          # Kernel binaries
│   └── initrfs-<version>.img      # Initial RAM filesystems
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Nota:** El módulo estándar `01-kernel.sb` que incluye MiniOS contiene controladores adicionales más allá de los incluidos en los paquetes de kernel del repositorio original. Estos controladores adicionales ofrecen mayor compatibilidad de hardware para adaptadores inalámbricos y dispositivos de almacenamiento.

### **Indicadores de Estado:**

- **ACTIVO:** Kernel configurado en el gestor de arranque (se iniciará en el próximo reinicio)
- **EN EJECUCIÓN:** Kernel actualmente en uso
- **DISPONIBLE:** Empaquetado y listo para activación

### **Operaciones Automáticas:**

- ✅ Empaquetado y compresión del kernel
- ✅ Generación de initramfs con los controladores adecuados
- ✅ Instalación en el repositorio de MiniOS
- ✅ Actualización de la configuración del gestor de arranque
- ✅ Gestión de enlaces simbólicos para kernels activos
- ✅ Limpieza de archivos temporales

---

## 🎯 Mejores Prácticas

### **Selección de Kernel:**

- Utiliza kernels de los repositorios oficiales de Debian/Ubuntu siempre que sea posible
- Prueba los kernels nuevos primero en entornos que no sean de producción
- Conserva al menos un kernel funcional conocido para recuperación

### **Antes de Instalar:**

- Verifica que el directorio de MiniOS sea escribible
- Asegúrate de tener suficiente espacio en disco (los kernels pueden ocupar entre 100 y 500 MB)
- Actualiza las listas de paquetes para los kernels del repositorio

### **Después de la Instalación:**

- Prueba el nuevo kernel exhaustivamente
- Verifica que todo el hardware funcione correctamente
- Conserva el kernel anterior como respaldo hasta que el nuevo sea estable

### **Planificación de Recuperación:**

- Mantén siempre una copia de seguridad de un kernel funcional
- Asegúrate de saber cómo arrancar desde un medio de rescate si es necesario
- Documenta qué kernels funcionan con la configuración de tu hardware
