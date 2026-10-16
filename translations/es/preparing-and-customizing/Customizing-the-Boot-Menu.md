---
updated: 2026-10-15
---

# Personalización del menú de arranque

Los menús de arranque de MiniOS ofrecen accesos directos a los modos de arranque en vivo más comunes. Esta guía explica cómo seleccionar y editar esas opciones.

## Resumen

Las imágenes de MiniOS pueden utilizar GRUB o Syslinux según el firmware, la estructura de la imagen y la compilación. Sus menús, teclas de edición, manejo de idiomas y opciones disponibles pueden variar. El gestor de arranque finalmente pasa una línea de comandos del kernel al mismo initrd; consulta [Modos de arranque](/using-minios/Boot-Modes) para conocer el origen resultante, persistencia, comportamiento de copia RAM y dependencia del medio.

## Opciones del menú de arranque

La imagen proporcionada suele mostrar estas opciones principales, aunque los títulos, la disponibilidad, el orden y la selección predeterminada pueden variar según la imagen:

| Opción de menú | Selector típico de initrd | Propósito |
|---|---|---|
| Iniciar MiniOS | `perchdir=resume` | Inicia la sesión compatible predeterminada y permite crear una nueva sesión según las condiciones documentadas. |
| Iniciar nueva sesión | `perchdir=setup` | Abre el selector de backend de persistencia y luego crea una sesión adicional numerada, manteniendo las sesiones existentes sin cambios. |
| Elegir una sesión guardada | `perchdir=ask` | Selecciona de forma interactiva una sesión guardada existente; si el almacenamiento está vacío, MiniOS inicia el mismo flujo de configuración para crear la primera sesión. |
| Iniciar sin guardar | sin selector de persistencia | Utiliza una capa temporal de escritura en RAM. |
| Ejecutar desde RAM | `toram` | Copia los datos del sistema de MiniOS a RAM; con persistencia, la opción predeterminada `perchtoram=trim` copia por separado la sesión compatible seleccionada. |

Estas son opciones de selección, no garantías de que el almacenamiento sea escribible, que la sesión sea compatible, que RAM sea suficiente o que el medio de origen se haya retirado. Consulta [Modos de arranque](/using-minios/Boot-Modes) para el comportamiento y combinaciones, [Persistencia en initrd](/reference/boot-process/Persistence-Internals) para casos límite de los selectores, y [Optimización de rendimiento](/maintenance-and-recovery/Performance) para RAM y consideraciones de E/S.

## Cómo usar el menú de arranque

### Navegación por el menú

- Usa **las teclas de flecha** para moverte entre las opciones
- Pulsa **Enter** para seleccionar una opción
- Pulsa **Esc** para volver al menú anterior (en GRUB)
- La selección automática y la duración del tiempo de espera dependen de la configuración activa del menú; algunos menús pueden esperar indefinidamente

### Ayuda y selección de idioma

Los menús multilingües actuales de GRUB y los menús nativos de SYSLINUX inician mostrando los modos de arranque, no una pantalla de selección de idioma. **F1** abre la ayuda de arranque y **F2** abre la selección de idioma. Al elegir un idioma, se regresa al menú de modos traducido. Los medios de un solo idioma mantienen la ayuda, pero no ofrecen navegación por idiomas no disponibles.

El menú multilingüe inicial mantiene la configuración regional del sistema establecida. Solo una selección de idioma explícita añade ajustes regionales que reemplazan `config.conf` para ese arranque. No se garantiza que todos los mensajes de inicio o de las aplicaciones estén traducidos. Consulta [Archivo de configuración](/reference/configuration/config.conf) y [live-config](/reference/configuration/live-config).

## Personalización de las opciones de arranque

### Editar parámetros de arranque temporalmente

Puedes modificar las opciones de arranque para una sola sesión:

**En GRUB:**
1. Selecciona la opción de menú que deseas modificar
2. Pulsa **'e'** para editar
3. Navega hasta la línea que comienza con `linux`
4. Agrega o modifica parámetros al final de la línea
5. Pulsa **Ctrl+X** o **F10** para arrancar con los cambios

**En SYSLINUX:**
1. Selecciona la opción de menú deseada
2. Pulsa **Tab** antes de pulsar Enter
3. Agrega parámetros a la línea de comandos que aparece
4. Pulsa **Enter** para arrancar

### Modificaciones comunes de parámetros de arranque

- `debug` - Mostrar mensajes detallados de arranque (útil para la resolución de problemas)
- `toram=trim` - Copiar el conjunto de módulos filtrados y los datos requeridos limitados a RAM
- `perchsize=2000` - Solicitar 2000 MiB para un contenedor compatible nuevo o en expansión; esto no afecta sesiones nativas ni de SquashFS
- `locales=ru_RU.UTF-8` - Solicitar un idioma o configuración regional específica

Para ver la lista completa de parámetros de arranque disponibles, consulta **[Parámetros de arranque](/reference/Boot-Parameters)**.

## Ubicación de los archivos de configuración

### En tu unidad USB MiniOS

- **Configuración de GRUB:** `/minios/boot/grub/grub.cfg`
- **Menús de modo y de idioma de GRUB:** `/minios/boot/grub/main.cfg` y `/minios/boot/grub/languages.cfg`; las compilaciones localizadas pueden seleccionar otros archivos generados
- **Configuración de SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Arte gráfico de arranque:** inspecciona la configuración activa de SYSLINUX `MENU BACKGROUND` o del tema de GRUB; las rutas dependen del gestor de arranque seleccionado
- **Archivos de idioma:** `/minios/boot/grub/locale/`

### En el sistema en ejecución

- **Parámetros de arranque actuales:** `/proc/cmdline`
- **Directorio de datos de MiniOS:** `/run/initramfs/memory/data/minios/`

### Editar archivos de configuración

**Advertencia:** Solo edita los archivos de configuración de arranque si sabes lo que haces. Cambios incorrectos pueden hacer que tu unidad USB no arranque.

**Para editar la configuración de GRUB:**
1. Monta tu unidad USB de MiniOS
2. Navega hasta `/minios/boot/grub/`
3. Edita `grub.cfg` con un editor de texto
4. Guarda y expulsa la unidad USB de forma segura

**Cambios habituales:**
- Modificar la directiva de tiempo de espera utilizada por el menú activo de GRUB o Syslinux
- Cambia `set default=0` para modificar la opción predeterminada del menú
- Agregar entradas personalizadas al menú
