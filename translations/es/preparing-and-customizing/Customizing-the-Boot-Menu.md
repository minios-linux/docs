---
updated: 2026-08-28
---

# Personalización del menú de arranque

Los menús de arranque de MiniOS ofrecen accesos directos para los modos de arranque en vivo más comunes. Esta guía explica cómo seleccionar y editar esas entradas.

## Descripción general

Las imágenes de MiniOS pueden utilizar GRUB o Syslinux según el firmware, la estructura de la imagen y la compilación. Sus menús, teclas de edición, manejo de idiomas y entradas disponibles no son necesariamente idénticos. El gestor de arranque finalmente pasa una línea de comandos del kernel al mismo initrd; consulta [Modos de arranque](/using-minios/Boot-Modes) para conocer el origen resultante, la persistencia, el comportamiento de copia de RAM y la dependencia del medio.

## Opciones del menú de arranque

La imagen proporcionada suele presentar estas opciones semánticas, aunque los títulos, la disponibilidad, el orden y la selección predeterminada pueden variar según la imagen:

| Opción de menú | Selector típico de initrd | Propósito |
|---|---|---|
| Iniciar MiniOS | `perchdir=resume` | Probar la sesión compatible predeterminada y permitir la creación de reemplazos bajo las condiciones documentadas. |
| Iniciar una nueva sesión | `perchdir=new` | Crear una sesión persistente adicional numerada manteniendo las sesiones existentes sin cambios. |
| Elegir una sesión guardada | `perchdir=ask` | Seleccionar de forma interactiva una sesión guardada existente. Usa **Iniciar una nueva sesión** si el almacenamiento está vacío. |
| Iniciar sin guardar | sin selector de persistencia | Utilizar una capa temporal editable en RAM. |
| Ejecutar desde RAM | `toram` | Copiar todo el árbol de datos de MiniOS a RAM e intentar desmontar el origen. |

Estos son selectores, no garantías de que el almacenamiento sea editable, que una sesión sea compatible, que RAM sea suficiente o que el medio de origen se haya desmontado. Consulta [Modos de arranque](/using-minios/Boot-Modes) para el comportamiento y combinaciones, [Persistencia en initrd](/reference/boot-process/Persistence-Internals) para casos límite de los selectores, y [Optimización de rendimiento](/maintenance-and-recovery/Performance) para RAM y compensaciones de E/S.

## Cómo usar el menú de arranque

### Navegación por el menú

- Usa las **flechas** para moverte entre las opciones
- Pulsa **Enter** para seleccionar una opción
- Pulsa **Esc** para volver al menú anterior (en GRUB)
- La selección automática y la duración del temporizador dependen de la configuración activa del menú; algunos menús pueden esperar indefinidamente

### Selección de idioma (GRUB)

Si tu unidad USB de MiniOS admite varios idiomas:
1. La primera pantalla mostrará las opciones de idioma
2. Selecciona tu idioma preferido
3. El menú de arranque aparecerá en el idioma seleccionado
4. La selección también puede pasar la configuración regional al arranque posterior, pero no garantiza que todos los mensajes del arranque o de las aplicaciones estén traducidos

**Importante:** El menú multilingüe sobrescribe cualquier configuración regional especificada en `config.conf`. El idioma seleccionado en el menú de arranque tiene prioridad sobre las configuraciones regionales predefinidas. Consulta **[Archivo de configuración](/reference/configuration/config.conf)** y **[live-config](/reference/configuration/live-config)** para más detalles sobre los archivos de configuración del sistema.

## Personalización de las opciones de arranque

### Edición temporal de los parámetros de arranque

Puedes modificar las opciones de arranque para una sola sesión:

**En GRUB:**
1. Selecciona la opción de menú que deseas modificar
2. Pulsa **'e'** para editar
3. Navega hasta la línea que comienza con `linux`
4. Añade o modifica los parámetros al final de la línea
5. Pulsa **Ctrl+X** o **F10** para arrancar con los cambios

**En SYSLINUX:**
1. Selecciona la opción de menú deseada
2. Pulsa **Tab** antes de presionar Enter
3. Añade los parámetros en la línea de comandos que aparece
4. Pulsa **Enter** para arrancar

### Modificaciones comunes de parámetros de arranque

- `debug` - Muestra mensajes detallados de arranque (útil para diagnóstico)
- `toram=trim` - Copia el conjunto de módulos filtrado y los datos mínimos requeridos a la RAM
- `perchsize=2000` - Establece el tamaño de almacenamiento de sesión en 2GB (ajusta según sea necesario)
- `locales=ru_RU.UTF-8` - Solicita un idioma o configuración regional específica

Para ver la lista completa de parámetros de arranque disponibles, consulta **[Parámetros de arranque](/reference/Boot-Parameters)**.

## Ubicación de los archivos de configuración

### En tu unidad USB de MiniOS

- **Configuración de GRUB:** `/minios/boot/grub/grub.cfg`
- **Configuración de SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Imágenes de arranque:** `/minios/boot/bootlogo.png`
- **Archivos de idioma:** `/minios/boot/grub/locale/`

### En el sistema en ejecución

- **Parámetros de arranque actuales:** `/proc/cmdline`
- **Directorio de datos de MiniOS:** `/run/initramfs/memory/data/minios/`

### Edición de archivos de configuración

**Advertencia:** Solo edita los archivos de configuración de arranque si sabes lo que haces. Cambios incorrectos pueden hacer que tu unidad USB no arranque.

**Para editar la configuración de GRUB:**
1. Monta tu unidad USB de MiniOS
2. Navega a `/minios/boot/grub/`
3. Edita `grub.cfg` con un editor de texto
4. Guarda y extrae de forma segura la unidad USB

**Cambios comunes:**
- Modificar la directiva de temporizador utilizada por el menú activo de GRUB o Syslinux
- Cambiar `set default=0` para modificar la opción de menú predeterminada
- Añadir entradas de menú personalizadas
