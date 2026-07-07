# Gestión de Sesiones en MiniOS 🔄

## 🤔 ¿Qué son las Sesiones?

Las sesiones de MiniOS proporcionan almacenamiento persistente para tus cambios, permitiéndote:

- **Guardar los cambios** realizados durante una sesión en vivo
- **Reanudar el trabajo** desde donde lo dejaste después de reiniciar
- **Gestionar múltiples** entornos de trabajo separados
- **Cambiar entre** diferentes configuraciones

Las sesiones utilizan tecnología de **Union Filesystem** (AUFS u OverlayFS) para superponer los cambios sobre el sistema base de solo lectura.

---

## 📋 Tipos y Modos de Sesión

### **Acciones de Sesión**

- **`resume`** - Continuar desde la última sesión utilizada (predeterminado)
- **`new`** - Crear una nueva sesión
- **`ask`** - Selección interactiva de sesión durante el arranque
- **`fresh`** - Sin persistencia (sesión temporal)

### **Modos de Almacenamiento**

- **`native`** - Almacenamiento directo en el sistema de archivos (requiere sistema de archivos POSIX: ext4, btrfs, xfs)
- **`dynfilefs`** - Archivos contenedor expandibles (funciona en cualquier sistema de archivos, recomendado para FAT32/NTFS/exFAT)
- **`raw`** - Archivos de imagen de tamaño fijo (funciona en cualquier sistema de archivos)

---

## 🚀 Parámetros de Arranque para Control de Sesión

### **Parámetros Principales de Sesión**

| Parámetro | Valores | Descripción |
|-----------|--------|-------------|
| `perch` | - | Habilita cambios persistentes |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Acción de sesión o directorio |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Modo de almacenamiento |
| `perchsize` | `<size_in_MB>` | Tamaño inicial para modos contenedor/imagen |

### **Estructura de Directorios de Sesión**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Integración con el Gestor de Arranque

### **Configuración de GRUB**

MiniOS proporciona entradas de menú GRUB preconfiguradas para diferentes modos de sesión:

```bash
# Resume previous session
linux /minios/boot/vmlinuz... perchdir=resume

# Start new session  
linux /minios/boot/vmlinuz... perchdir=new

# Interactive session selection
linux /minios/boot/vmlinuz... perchdir=ask

# Fresh start (no persistence)
linux /minios/boot/vmlinuz... 
```

### **Configuración de SYSLINUX**

Entradas correspondientes para SYSLINUX:

```bash
LABEL default
MENU LABEL Run MiniOS (Resume previous session)
APPEND ... perchdir=resume

LABEL perch
MENU LABEL Run MiniOS (Start a new session)  
APPEND ... perchdir=new

LABEL asksession
MENU LABEL Run MiniOS (Choose session during startup)
APPEND ... perchdir=ask

LABEL live
MENU LABEL Run MiniOS (Fresh start)
APPEND ...
```

---

## 🔧 Comandos para la Gestión de Sesiones

### **Uso del Gestor de Sesiones de MiniOS (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Funciones:**
- Ver todas las sesiones disponibles con metadatos
- Crear nuevas sesiones con diferentes modos
- Activar/cambiar sesiones
- Eliminar sesiones antiguas
- Limpiar sesiones con más días de antigüedad que los especificados

### **Uso de minios-session (CLI)**

⚠️ **Se requieren privilegios administrativos:**

La herramienta CLI requiere privilegios de root y los comprobará automáticamente. Ejecuta los comandos con `sudo` o mediante `pkexec`:

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Comandos Básicos:**

```bash
# List all sessions
sudo minios-session list

# Show currently active session (will boot next)
sudo minios-session active

# Show currently running session (current boot)
sudo minios-session running

# Check filesystem compatibility and session directory status
sudo minios-session info
sudo minios-session status

# Create new sessions (using positional arguments)
sudo minios-session create native
sudo minios-session create dynfilefs 2000
sudo minios-session create raw 2000

# Activate specific session
sudo minios-session activate 3

# Delete session
sudo minios-session delete 2

# Resize session (dynfilefs/raw modes only)
sudo minios-session resize 1 8000

# Export session to archive
sudo minios-session export 1 /path/to/backup.tar.zst

# Import session from archive
sudo minios-session import /path/to/backup.tar.zst
sudo minios-session import /path/to/backup.tar.zst dynfilefs  # with mode conversion

# Copy session with optional mode conversion
sudo minios-session copy 1 2              # copy keeping same mode
sudo minios-session copy 1 3 raw          # copy and convert to raw mode
sudo minios-session copy 1 4 native 3000  # copy, convert to native, set size

# Cleanup old sessions (older than 30 days)
sudo minios-session cleanup --days 30
```

#### **Opciones Avanzadas:**

```bash
# JSON output for automation (available for all commands)
sudo minios-session --json list
sudo minios-session --json info
sudo minios-session --json active
sudo minios-session --json running
sudo minios-session --json status
sudo minios-session --json create native
sudo minios-session --json activate 2
sudo minios-session --json delete 3
sudo minios-session --json cleanup --days 30
sudo minios-session --json resize 1 8000
sudo minios-session --json export 1 backup.tar.zst
sudo minios-session --json import backup.tar.zst
sudo minios-session --json copy 1 2 native

# Custom sessions directory
sudo minios-session --sessions-dir /custom/path list
sudo minios-session --sessions-dir /mnt/usb/sessions create native
```

#### **Diferencias Clave entre Comandos:**

- `active` - Muestra la sesión que se usará en el próximo arranque
- `running` - Muestra la sesión actualmente en uso (si hay alguna)
- `resize` - Cambia el tamaño de la sesión (solo para modos dynfilefs/raw)
- `export` - Exporta la sesión a un archivo .tar.zst para respaldo
- `import` - Importa una sesión desde un archivo, con conversión de modo opcional
- `copy` - Copia una sesión con conversión de modo opcional
- `info` - Verifica compatibilidad del sistema de archivos y recomendaciones

---

## 📦 Respaldo y Migración de Sesiones

### **Exportar Sesiones**

Exporta sesiones a archivos comprimidos para respaldo o transferencia:

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Funciones:**
- Crea un archivo comprimido .tar.zst
- Conserva todos los datos y metadatos de la sesión
- Puede importarse en cualquier sistema MiniOS
- Compresión automática para mayor eficiencia de espacio

### **Importar Sesiones**

Importa sesiones desde archivos con conversión de modo opcional:

```bash
# Import session keeping original mode
sudo minios-session import /backup/session1.tar.zst

# Import and convert to different mode
sudo minios-session import /backup/session1.tar.zst dynfilefs
sudo minios-session import /backup/session2.tar.zst raw
sudo minios-session import /backup/session3.tar.zst native

# Import with JSON output
sudo minios-session --json import /backup/session.tar.zst
```

**Funciones:**
- Restaura datos de sesión desde el archivo
- Convierte automáticamente entre modos de almacenamiento si se especifica
- Omite archivos existentes para evitar pérdida de datos
- Crea automáticamente un nuevo número de sesión

### **Copiar y Convertir Sesiones**

Copia sesiones entre diferentes modos de almacenamiento:

```bash
# Copy session keeping same mode
sudo minios-session copy 1 2

# Copy and convert to different mode
sudo minios-session copy 1 3 raw           # convert to raw mode
sudo minios-session copy 1 4 dynfilefs     # convert to dynfilefs
sudo minios-session copy 1 5 native        # convert to native

# Copy with custom size (for raw/dynfilefs)
sudo minios-session copy 1 6 raw 4000      # 4GB raw image
sudo minios-session copy 2 7 dynfilefs 2000 # 2GB dynfilefs
```

**Conversiones Soportadas:**
- native ⇄ dynfilefs ⇄ raw
- Todas las combinaciones de modos soportadas
- Manejo automático del tamaño
- Conserva los datos de la sesión durante la conversión

**Casos de Uso:**
- Migrar de FAT32 a ext4 (dynfilefs → native)
- Crear sesiones portátiles (native → dynfilefs/raw)
- Optimizar para diferentes sistemas de archivos
- Crear respaldos de sesión en diferentes modos

---

## 🏗️ Modos de Almacenamiento de Sesión en Detalle

### **Modo Nativo**

**Ideal para:** Sistemas con sistemas de archivos POSIX (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Características:**
- Acceso directo al sistema de archivos sin contenedor
- Cumplimiento total con POSIX (enlaces duros, permisos, atributos extendidos)
- Mejor rendimiento entre todos los modos
- **Requisitos:** Sistema de archivos compatible con POSIX (ext4, btrfs, xfs)
- **No compatible:** FAT32, NTFS, exFAT

### **Modo DynFileFS**

**Ideal para:** Sistemas de archivos no POSIX (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Características:**
- Contenedor expandible con sistema de archivos ext4 interno
- Se expande automáticamente según sea necesario hasta el espacio disponible
- Funciona en cualquier tipo de sistema de archivos
- Ligera sobrecarga de rendimiento comparado con nativo
- **Tamaño predeterminado:** 1000MB, se expande dinámicamente
- **Recomendado para:** sistemas de archivos FAT32, NTFS, exFAT

### **Modo Raw**

**Ideal para:** Requisitos de tamaño fijo en cualquier sistema de archivos

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Características:**
- Imagen de tamaño fijo con sistema de archivos ext4 interno
- Uso de disco predecible y constante
- Funciona en cualquier tipo de sistema de archivos
- El tamaño debe especificarse al crear
- **Tamaño predeterminado:** 1000MB si no se especifica
- **Casos de uso:** Sesiones portátiles, cuotas de almacenamiento, asignación de espacio predecible

---

## 🗂️ Metadatos y Compatibilidad de Sesión

### **Formatos de Metadatos de Sesión**

**Formato Predeterminado (session.conf):**
```bash
default=2
session_mode[1]=native
session_version[1]=5.0.0
session_edition[1]=standard
session_union[1]=overlayfs
session_mode[2]=dynfilefs
session_version[2]=5.0.0
session_edition[2]=standard
session_union[2]=overlayfs
```

**Formato JSON (si jq está disponible):**
```json
{
  "default": "2",
  "sessions": {
    "1": {
      "mode": "native",
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    },
    "2": {
      "mode": "dynfilefs", 
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    }
  }
}
```

> **Nota:** MiniOS detecta automáticamente si `jq` está disponible y utiliza el formato JSON cuando es posible; de lo contrario, usa el formato conf tradicional.

### **Verificación de Compatibilidad**

MiniOS comprueba automáticamente la compatibilidad de la sesión:

- **Diferencia de versión** - Crea una nueva sesión si la versión de MiniOS es diferente
- **Diferencia de edición** - Crea una nueva sesión si la edición es diferente (standard/toolbox/ultra)
- **Diferencia de Union FS** - Crea una nueva sesión si el sistema de archivos union es diferente (aufs/overlayfs)
- **Cambio de modo** - Crea una nueva sesión si cambia el modo de almacenamiento

### **Sistema de Advertencias**

Al seleccionar sesiones incompatibles, MiniOS muestra advertencias:
- Advertencias de incompatibilidad de versión
- Notificaciones de diferencia de edición
- Problemas de compatibilidad con el sistema de archivos union
- Opción de continuar bajo riesgo del usuario

---

## 🎯 Configuración Avanzada de Sesiones

### **Ubicaciones Personalizadas de Sesión**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Gestión del Tamaño de la Sesión**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Gestión automática de sesiones**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Solución de problemas de sesiones

### **Problemas comunes**

#### **Sesión no encontrada**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Problemas de permisos**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Fallos en el modo de almacenamiento**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Recuperación de sesiones**

```bash
# List all sessions and their status
sudo minios-session list

# Check session integrity and filesystem info
sudo minios-session status
sudo minios-session info

# Show active vs running session status
sudo minios-session active
sudo minios-session running

# Create new session if corrupted
sudo minios-session create native
```

### **Limpieza de sesiones**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Mejores prácticas para sesiones

### **Elección de modos de almacenamiento**

- **Modo nativo:** Úsalo cuando MiniOS esté en un sistema de archivos POSIX (ext4, btrfs, xfs) - mejor rendimiento
- **Modo DynFileFS:** Úsalo para sistemas de archivos FAT32, NTFS, exFAT - gestión automática del espacio
- **Modo Raw:** Úsalo cuando necesites tamaño fijo en cualquier sistema de archivos - uso de disco predecible

### **Planificación de tamaño**

- **Sesiones pequeñas:** 1-2GB para cambios básicos de configuración
- **Desarrollo:** 4-8GB para entornos de desarrollo
- **Cargas pesadas:** 8GB+ para instalaciones extensas de software

### **Gestión de sesiones**

- Limpia regularmente las sesiones antiguas
- Usa nombres descriptivos para las sesiones en la gestión manual
- Monitorea el uso del espacio en disco
- Mantén al menos una sesión conocida y funcional para recuperación

### **Optimización de rendimiento**

- Usa el modo nativo cuando sea posible para mejor rendimiento
- Almacena las sesiones en dispositivos de almacenamiento rápidos
- Considera almacenamiento SSD para sesiones de uso frecuente

---
