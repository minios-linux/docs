---
updated: 2026-08-31
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Gestión de kernels

## ¿Por qué reemplazar el kernel?

MiniOS incluye un kernel predeterminado, pero existen varias razones por las que podrías querer reemplazarlo:

### **Diferentes sabores del kernel de Debian**

Debian ofrece varias variantes de kernel optimizadas para diferentes casos de uso:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel estándar para sistemas de 64 bits (predeterminado en MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel en tiempo real para aplicaciones críticas en tiempo
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Optimizado para entornos en la nube y virtualizados

> **Nota:** Los números de versión (como `6.12.38+deb13`) cambian con las actualizaciones. Para ver los kernels disponibles actualmente:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Casos de uso especializados**

- **Computación en tiempo real** – Kernels RT para producción de audio, control industrial
- **Gaming y baja latencia** – Kernels personalizados con optimizaciones para juegos
- **Endurecimiento de seguridad** – Kernels con parches de seguridad adicionales (grsecurity, etc.)
- **Compatibilidad de hardware** – Kernels más recientes para soporte de hardware moderno
- **Ajuste de rendimiento** – Kernels compilados a medida con optimizaciones específicas

### **Características personalizadas del kernel**

- **Parches personalizados** – Aplica parches específicos para tu hardware o caso de uso
- **Módulos de kernel** – Añade soporte para hardware o sistemas de archivos especializados
- **Optimizaciones de compilador** – Compila con diferentes flags de optimización
- **Optimización de tamaño** – Elimina drivers innecesarios para reducir el tamaño del kernel

### **Escenarios comunes**

- **Estaciones de trabajo para producción de audio** – Usa kernel RT para minimizar la latencia de audio
- **Sistemas de juegos** – Aplica parches y optimizaciones específicas para gaming
- **Entornos de servidor** – Usa kernels optimizados para la nube y mejor virtualización
- **Hardware antiguo** – Utiliza kernels antiguos para compatibilidad con sistemas vintage
- **Sistemas de desarrollo** – Prueba aplicaciones con diferentes versiones de kernel

---

## Descripción general del Gestor de kernels de MiniOS

MiniOS ofrece dos herramientas para la gestión de kernels:

1. **Gestor de kernels de MiniOS (GUI):** Una aplicación gráfica fácil de usar para empaquetar, instalar y gestionar kernels.
2. **minios-kernel (CLI):** Una herramienta de línea de comandos para usuarios avanzados y automatización.

Ambas herramientas gestionan automáticamente:
- **Empaquetado del kernel** en formato SquashFS
- **Generación de initramfs** con los controladores y scripts de arranque adecuados
- **Instalación** en el repositorio de kernels MiniOS
- **Actualizaciones de la configuración del gestor de arranque**
- **Activación y cambio de kernel**

Esta página cubre el sistema live modular MiniOS. El Gestor de kernels de MiniOS y `minios-kernel` existen para esa arquitectura live y su módulo de kernel coordinado, `vmlinuz`, y el conjunto de initramfs. Tras la conversión nativa, el sistema utiliza un flujo de trabajo convencional de kernel Debian; las herramientas de kernel live MiniOS se eliminan porque el modelo de kernel modular ya no aplica, así que utiliza los paquetes de kernel de Debian, herramientas de initramfs y el gestor de arranque instalado. Consulta [Acerca de MiniOS](/getting-started/About-MiniOS) y [Modos de arranque](/using-minios/Boot-Modes). Para el comportamiento exacto y coordinado del kernel en el initrd live, consulta [Carga de módulos en initrd](/reference/boot-process/Module-Loading).

### **Consideraciones importantes:**

- **Privilegios administrativos:** Ambas herramientas requieren privilegios administrativos y solicitarán autenticación mediante PolicyKit
- **Compatibilidad de kernels:** Asegúrate de que los kernels sean compatibles con MiniOS. Se recomiendan los kernels del repositorio
- **Directorio de MiniOS:** Las herramientas detectan automáticamente el directorio de MiniOS (`/minios/`) y verifican permisos de escritura
- **Actualizaciones automáticas:** La configuración del gestor de arranque se actualiza automáticamente al activar kernels

---

## Método 1: Usar el Gestor de kernels de MiniOS (GUI)

El gestor gráfico de kernels proporciona una interfaz intuitiva para todas las operaciones relacionadas con kernels.

### **Pasos:**

#### 1. **Iniciar la aplicación**

```bash
minios-kernel-manager
```

O busca "Gestor de kernels de MiniOS" en el menú de aplicaciones.

#### 2. **Empaquetar un nuevo kernel**

**Usando la pestaña Empaquetar Kernel:**

1. **Seleccionar origen del kernel:**
   - **Empaquetado manual:** Busca y selecciona un paquete de kernel local `.deb`
   - **Repositorio:** Elige entre los kernels disponibles en los repositorios de Debian/Ubuntu

2. **Configurar compresión:**
   - Selecciona la compresión SquashFS: `zstd` (recomendado), `lz4`, `lzo`, `xz` o `gzip`

3. **Empaquetar el kernel:**
   - Haz clic en el botón "Empaquetar kernel"
   - Monitorea el progreso en el registro de empaquetado
   - Los archivos se instalan automáticamente en el repositorio de MiniOS

#### 3. **Gestionar kernels instalados**

**Usando la pestaña Gestionar Kernels:**

1. **Ver kernels disponibles:**
   - Visualiza todos los kernels empaquetados con insignias de estado:
     - **ACTIVE:** Kernel actualmente configurado
     - **RUNNING:** Kernel actualmente iniciado
     - **AVAILABLE:** Disponible para activación

2. **Activar un kernel:**
   - Haz clic derecho sobre un kernel y selecciona "Activar kernel"
   - Confirma el cuadro de diálogo de activación
   - La configuración del gestor de arranque se actualiza automáticamente

3. **Eliminar un kernel:**
   - Haz clic derecho sobre un kernel inactivo y selecciona "Eliminar kernel"
   - Confirma la eliminación (no se puede deshacer)

---

## Método 2: Uso de minios-kernel (CLI)

La herramienta de línea de comandos permite gestionar kernels de forma automatizada y por scripts.

### **Se requieren privilegios administrativos:**

La herramienta CLI requiere privilegios de root y los verificará automáticamente. Ejecuta los comandos con `sudo` o mediante `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### **Comandos básicos:**

#### 1. **Listar kernels disponibles**

```bash
sudo minios-kernel list
```

Muestra todos los kernels empaquetados junto con su estado.

#### 2. **Empaquetar un kernel**

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

#### 3. **Activar un kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. **Eliminar un kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. **Comprobar estado**

```bash
sudo minios-kernel status
```

Muestra el estado del directorio MiniOS y la información del kernel actual.

#### 6. **Mostrar información del kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Muestra información detallada sobre un kernel específico, incluyendo su estado y disponibilidad.

### **Opciones avanzadas de CLI:**

#### **Salida en JSON (para scripting):**

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

## Resolución de problemas

### Problemas comunes y soluciones:

#### **Directorio de MiniOS no encontrado**

- **Causa:** Las herramientas no pueden localizar el directorio de MiniOS
- **Solución:** Asegúrate de estar ejecutando desde un sistema MiniOS o que la unidad USB esté correctamente montada
- **Comprobación:** Ejecuta `sudo minios-kernel status` para verificar la detección del directorio

#### **Permiso denegado**

- **Causa:** El directorio de MiniOS es de solo lectura o no tienes permisos suficientes
- **Solución:** Asegúrate de tener privilegios administrativos y que el sistema de archivos sea escribible
- **Comprobación:** Verifica el estado del directorio de MiniOS en la GUI o CLI

#### **Error en la instalación del paquete**

- **Causa:** Paquete dañado, problemas de red o dependencias
- **Solución:**
  - Verifica la integridad del archivo del paquete
  - Comprueba la conectividad de red para paquetes de repositorio
  - Actualiza la lista de paquetes: `sudo apt update`

#### **Kernel panic después de la activación**

- **Causa:** Kernel incompatible o controladores faltantes
- **Qué hacer:** Arranca un sistema MiniOS conocido y funcional, resguarda los datos importantes y restaura un conjunto completo de kernel conocido y funcional solo si está disponible. De lo contrario, reinstala la instalación de MiniOS afectada. No intentes reparar el sistema mezclando archivos individuales de kernel, initramfs o `01-kernel-*.sb`. Consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

#### **El sistema arranca con el kernel antiguo**

- **Causa:** La configuración del gestor de arranque no se actualizó correctamente
- **Solución:**
  - Vuelve a ejecutar la activación del kernel: `sudo minios-kernel activate <version>`
  - Verifica que el kernel haya sido empaquetado e instalado correctamente

#### **El hardware no funciona después de cambiar el kernel**

- **Causa:** Faltan drivers en el nuevo kernel
- **Solución:**
  - Verifica que se haya instalado el archivo del módulo de kernel SquashFS
  - Comprueba si el nuevo kernel es compatible con tu hardware
  - Considera usar otra variante de kernel

#### **Recuperación tras un cambio de kernel fallido**

No copies una imagen de kernel individual, initramfs o un módulo `01-kernel-*.sb` desde otra imagen. Un kernel MiniOS arrancable requiere el conjunto coordinado. Si no tienes ya disponible un conjunto completo y funcional a través del flujo de trabajo de gestión de kernels, reinstala la instalación de MiniOS afectada en lugar de ensamblar los componentes de arranque manualmente. Primero resguarda los datos importantes; consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

### **Comandos de diagnóstico:**

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

**Comprobar la configuración del gestor de arranque:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Descripción general de la estructura de archivos

El Gestor de kernels de MiniOS administra automáticamente estos archivos:

### **Estructura del repositorio de kernels:**

```
/minios/
├── 01-kernel-<version>.sb         # Active kernel module
├── kernels/                       # Repository of inactive/alternative kernels
│   └── <version>/
│       ├── 01-kernel-<version>.sb # SquashFS kernel module
│       ├── vmlinuz-<version>      # Kernel image
│       └── initrfs-<version>.img  # Initial RAM filesystem
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Nota:** El módulo estándar `01-kernel-<version>.sb` que viene con MiniOS incluye controladores adicionales que no están en los paquetes de kernel originales del repositorio. Estos controladores extra mejoran la compatibilidad de hardware para adaptadores inalámbricos y dispositivos de almacenamiento.

### **Indicadores de estado:**

- **ACTIVO:** Kernel configurado en el gestor de arranque (se iniciará en el próximo reinicio)
- **EN EJECUCIÓN:** Kernel actualmente en uso
- **DISPONIBLE:** Empaquetado y listo para activar

### **Operaciones automáticas:**

- Empaquetado y compresión del kernel
- Generación de initramfs con los controladores adecuados
- Instalación en el repositorio de MiniOS
- Actualización de la configuración del gestor de arranque
- Gestión de enlaces simbólicos para kernels activos
- Limpieza de archivos temporales

---

## Mejores prácticas

### **Selección de kernel:**

- Utiliza kernels de los repositorios oficiales de Debian/Ubuntu siempre que sea posible
- Prueba los nuevos kernels primero en entornos que no sean de producción
- Conserva al menos un kernel funcional conocido para recuperación

### **Antes de instalar:**

- Verifica que el directorio de MiniOS sea escribible
- Asegúrate de tener suficiente espacio en disco (los kernels pueden ocupar entre 100 y 500 MB)
- Actualiza las listas de paquetes para los kernels del repositorio

### **Después de la instalación:**

- Prueba exhaustivamente el nuevo kernel
- Verifica que todo el hardware funcione correctamente
- Conserva el kernel anterior como respaldo hasta que el nuevo sea estable

### **Planificación de recuperación:**

- Conserva siempre un triplete de kernel funcional completo
- Aprende cómo arrancar desde un medio de rescate si es necesario
- Documenta qué kernels funcionan con tu configuración de hardware
