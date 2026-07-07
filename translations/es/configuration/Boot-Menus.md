# Guía de Menús de Arranque de MiniOS

MiniOS ofrece un sistema de menús de arranque potente que te permite elegir cómo inicia y opera el sistema. Esta guía explica las opciones de arranque disponibles y cómo personalizarlas.

## Descripción general

MiniOS utiliza GRUB como gestor de arranque principal, proporcionando una interfaz gráfica con soporte multilingüe. En sistemas BIOS antiguos, puede usarse SYSLINUX como alternativa. Ambos gestores ofrecen la misma funcionalidad con interfaces ligeramente diferentes.

## Opciones del Menú de Arranque

### 1. Reanudar Sesión Anterior

**Qué hace:** Intenta continuar desde tu última sesión, pero se adapta automáticamente según el almacenamiento disponible.

- **Cuándo usar:** Es la opción predeterminada, adecuada para la mayoría de los usuarios en la mayoría de situaciones
- **Qué sucede:**
  - **En medios grabables con sesión existente:** Restaura tus archivos, aplicaciones y configuraciones guardadas
  - **En medios grabables sin sesión:** Crea automáticamente la primera sesión (sesión #1)
  - **En medios de solo lectura (DVD, CD):** Funciona como "Inicio Limpio" ya que no hay almacenamiento disponible
  - **Si la sesión es incompatible:** Crea una nueva sesión (por ejemplo, al usar una versión diferente de MiniOS)
  - El sistema gestiona automáticamente las comprobaciones de compatibilidad y las limitaciones de almacenamiento
- **Resultado:** Siempre obtienes un sistema funcional, optimizado para tu tipo de almacenamiento

### 2. Iniciar una Nueva Sesión

**Qué hace:** Crea un espacio de trabajo limpio manteniendo todas las sesiones existentes disponibles.

- **Cuándo usar:** Cuando necesitas empezar desde cero para trabajos diferentes o pruebas
- **Qué sucede:**
  - Crea una nueva sesión numerada (por ejemplo, si tenías la sesión 1, crea la sesión 2)
  - Inicia con un entorno de escritorio limpio
  - Todos los cambios nuevos se guardarán en la nueva sesión
  - Todas las sesiones existentes permanecen intactas y disponibles para cambiar
- **Nota:** Puedes cambiar entre sesiones usando la opción "Elegir sesión durante el arranque"

### 3. Elegir Sesión Durante el Arranque

**Qué hace:** Muestra un menú interactivo para seleccionar entre sesiones existentes o crear una nueva.

- **Cuándo usar:** Cuando tienes varias sesiones y quieres elegir cuál utilizar
- **Qué sucede:**
  - Muestra un cuadro de diálogo durante el arranque con la lista de sesiones disponibles
  - Muestra información de la sesión (número, última vez de acceso, uso de disco)
  - Opciones para reanudar cualquier sesión existente o iniciar una nueva
  - Permite seleccionar diferentes dispositivos de almacenamiento si hay varios disponibles
- **Ventajas:** Control total sobre qué sesión usar, ideal para usuarios que gestionan varios espacios de trabajo

### 4. Inicio Limpio

**Qué hace:** Ejecuta MiniOS sin guardar ningún cambio.

- **Cuándo usar:**
  - Probar el sistema en medios grabables sin afectar sesiones existentes
  - Solucionar problemas sin modificar datos guardados
  - Máxima privacidad (no se guarda ningún dato)
  - Cuando quieres asegurarte de que no se realicen cambios persistentes
- **Qué sucede:**
  - Tiempo de arranque más rápido
  - Los cambios se pierden al apagar
  - No se accede a dispositivos de almacenamiento para persistencia
- **Nota:** Al ejecutar desde medios de solo lectura (DVD, CD), "Reanudar Sesión Anterior" funciona automáticamente como "Inicio Limpio" ya que no hay almacenamiento disponible para sesiones

### 5. Copiar a RAM

**Qué hace:** Carga todo el sistema en la memoria del equipo para obtener el máximo rendimiento.

- **Cuándo usar:**
  - Tienes suficiente RAM (se recomienda 4GB o más)
  - Quieres el mayor rendimiento posible
  - Necesitas retirar la unidad USB después de arrancar
  - Trabajas con aplicaciones intensivas
- **Qué sucede:**
  - Copia todos los archivos del sistema a la RAM durante el arranque
  - La unidad USB puede retirarse tras completar la carga
  - El sistema funciona completamente desde la memoria
  - Tiempos de respuesta más rápidos en todas las operaciones
- **Requisitos:** RAM suficiente para alojar todo el sistema

Para opciones avanzadas de `toram` y técnicas de optimización de memoria, consulta **[Optimización de Rendimiento](/administration/Performance-Optimization.md)**.

## Cómo Usar el Menú de Arranque

### Navegación por el Menú

- Usa las **flechas** para moverte entre las opciones
- Pulsa **Enter** para seleccionar una opción
- Pulsa **Esc** para volver al menú anterior (en GRUB)
- El menú seleccionará automáticamente la opción predeterminada después de 10 segundos

### Selección de Idioma (GRUB)

Si tu unidad USB de MiniOS soporta varios idiomas:
1. La primera pantalla mostrará las opciones de idioma
2. Selecciona tu idioma preferido
3. El menú de arranque aparecerá en el idioma seleccionado
4. Todos los mensajes posteriores del sistema usarán este idioma

⚠️ **Importante:** El menú multilingüe sobrescribe cualquier configuración regional especificada en `config.conf`. El idioma seleccionado en el menú de arranque tiene prioridad sobre la configuración regional predefinida. Consulta **[Archivo de Configuración](/configuration/Configuration-File.md)** y **[live-config](/configuration/live-config.md)** para más detalles sobre los archivos de configuración del sistema.

## Personalización de Opciones de Arranque

### Edición Temporal de Parámetros de Arranque

Puedes modificar las opciones de arranque para una sola sesión:

**En GRUB:**
1. Selecciona la opción de menú que quieres modificar
2. Pulsa **'e'** para editar
3. Navega hasta la línea que comienza con `linux`
4. Añade o modifica parámetros al final de la línea
5. Pulsa **Ctrl+X** o **F10** para arrancar con tus cambios

**En SYSLINUX:**
1. Selecciona la opción de menú que deseas
2. Pulsa **Tab** antes de presionar Enter
3. Añade parámetros a la línea de comandos que aparece
4. Pulsa **Enter** para arrancar

### Modificaciones Comunes de Parámetros de Arranque

- `debug` - Muestra mensajes detallados de arranque (útil para diagnóstico)
- `toram=trim` - Copia solo los archivos esenciales a la RAM (cuando el `toram` completo usa demasiada memoria)
- `perchsize=2000` - Establece el tamaño de almacenamiento de la sesión en 2GB (ajustar según necesidad)
- `locale=ru_RU.UTF-8` - Fuerza un idioma/región específico

Para una lista completa de parámetros de arranque disponibles, consulta **[Parámetros de Arranque](/configuration/Boot-Parameters.md)**.

## Ubicación de Archivos de Configuración

### En tu Unidad USB de MiniOS

- **Configuración de GRUB:** `/minios/boot/grub/grub.cfg`
- **Configuración de SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Imágenes de arranque:** `/minios/boot/bootlogo.png`
- **Archivos de idioma:** `/minios/boot/grub/locale/`

### En el Sistema en Ejecución

- **Parámetros de arranque actuales:** `/proc/cmdline`
- **Directorio de datos de MiniOS:** `/run/initramfs/memory/data/minios/`

### Edición de Archivos de Configuración

⚠️ **Advertencia:** Solo edita los archivos de configuración de arranque si sabes lo que estás haciendo. Cambios incorrectos pueden dejar tu unidad USB inservible para arrancar.

**Para editar la configuración de GRUB:**
1. Monta tu unidad USB de MiniOS
2. Navega a `/minios/boot/grub/`
3. Edita `grub.cfg` con un editor de texto
4. Guarda y extrae la unidad USB de forma segura

**Cambios comunes:**
- Modificar `set timeout=10` para cambiar el tiempo de espera del menú
- Cambiar `set default=0` para cambiar la opción predeterminada del menú
- Añadir entradas de menú personalizadas
