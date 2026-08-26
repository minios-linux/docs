---
updated: 2026-08-26
---

# Modos de arranque de MiniOS

Los modos de arranque describen de dónde proviene el sistema live, si su capa de escritura es temporal o persistente, y si MiniOS copia su origen en la RAM. No describen un firmware o protocolo de gestor de arranque diferente. GRUB, Syslinux, Ventoy o un cargador PXE inician el mismo flujo básico de early-userspace de MiniOS cargando un kernel y un initramfs con una línea de comandos del kernel.

Utiliza esta página para elegir un modo y comprender las dependencias resultantes. Para las opciones individuales de la línea de comandos, consulta [Parámetros de arranque](/configuration/Boot-Parameters.md). Para las entradas proporcionadas por una imagen, consulta [Menús de arranque](/configuration/Boot-Menus.md).

## Firmware, gestor de arranque y early userspace

El firmware y el gestor de arranque se ejecutan antes de que MiniOS pueda inspeccionar los módulos live o las sesiones. BIOS o UEFI inician un gestor de arranque local, o el firmware de red inicia un cargador PXE. Ese cargador selecciona y carga el kernel e initramfs de MiniOS y pasa su línea de comandos. Ventoy también pertenece a esta capa: presenta una ISO a través de su propio entorno de arranque antes de que el early userspace de MiniOS la descubra.

Luego, el kernel inicia el initramfs de MiniOS. Este early userspace descubre la fuente live, prepara copias opcionales en RAM y la persistencia, monta los módulos y construye el sistema de archivos raíz. Una etiqueta de menú como Fresh Start o Resume Previous Session es, por tanto, principalmente una selección conveniente de parámetros del initramfs, no una implementación separada del gestor de arranque.

Las instalaciones nativas son diferentes. Arrancan una raíz Linux convencional expandida con el GRUB y el initramfs del sistema instalado. No utilizan el flujo modular live descrito a continuación.

## Secuencia de arranque live

El flujo live se ejecuta en este orden:

1. **Cargar el kernel y el initramfs.** El gestor de arranque seleccionado por el firmware carga ambos archivos y proporciona la línea de comandos del kernel. En este punto, aún no se ha ensamblado ninguna raíz SquashFS de MiniOS.
2. **Descubrir la fuente.** El initramfs busca dispositivos de bloque locales, sigue una ubicación `from=` explícita, monta en bucle una ISO local, monta una ISO por HTTP o descarga el conjunto de datos PXE. El descubrimiento de la fuente y de la persistencia son operaciones relacionadas pero distintas.
3. **Copiar a RAM cuando se solicita.** Los comandos `toram` y `toram=full` copian todo el árbol de datos de MiniOS, sujeto al manejo de la persistencia. `toram=trim` copia solo los módulos seleccionados y la configuración requerida. El initramfs intenta luego desacoplar la fuente original. Completar la copia no garantiza que el desacople haya tenido éxito.
4. **Seleccionar persistencia.** Si se solicita persistencia, el initramfs resuelve la ubicación y sesión de persistencia, la verifica y prepara su capa de escritura. Reanudar, crear nueva o selección interactiva solo difieren en cómo se elige o crea esa sesión. Sin persistencia, la capa de escritura se respalda en memoria.
5. **Conciliar el conjunto de kernels en ejecución.** El kernel ya está en ejecución y no puede cambiarse en esta etapa. MiniOS comprueba que el árbol de datos activo tenga el módulo `01-kernel`, la imagen de kernel y el initramfs que coincidan con ese kernel en ejecución. Si el conjunto completo coincidente existe en el repositorio de kernels inactivos, MiniOS intenta activarlo y mueve otros conjuntos activos al repositorio. Esto es una conciliación de archivos, no un fallback de kernel ni un cambio de kernel en caliente.
6. **Montar módulos.** Los archivos `.sb` seleccionados del árbol de datos de MiniOS y cualquier almacén de módulos escribible aplicable se ordenan, filtran por `load=` y `noload=`, y se montan en bucle como solo lectura.
7. **Construir AUFS u OverlayFS.** MiniOS combina los módulos montados con una capa de escritura. AUFS añade los montajes de módulos ordenados como ramas de solo lectura. OverlayFS recibe la lista completa y ordenada de directorios inferiores más sus directorios upper y work cuando se monta la raíz. La unión resultante es el sistema de archivos raíz live.
8. **Aplicar `rootcopy` y ejecutar `minios-boot`.** Los archivos bajo el directorio `rootcopy/` de la fuente se copian a la raíz ensamblada. El initramfs ejecuta `minios-boot` en un chroot para sincronizar la configuración de MiniOS y aplicar ajustes tempranos de userspace. También prepara `fstab` y ejecuta un hook opcional `rootcopy/run/preinit.sh` antes de entregar el control.
9. **Transferir al userspace normal.** LiveKit utiliza `pivot_root` para su entrega final, mientras que dracut prepara la misma raíz ensamblada y realiza el `switch_root` final. El sistema de inicio instalado inicia los servicios normales y la sesión de escritorio o consola. Las configuraciones de red tempranas no son configuraciones de red duraderas para userspace.

Los contratos detallados de descubrimiento, módulos y persistencia están documentados en [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md), [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md) y [Persistencia Initrd](/configuration/Initrd-Persistence.md).

## Matriz de modos

| Modo | Fuente live | Capa de escritura | Dependencia de la fuente tras el arranque |
|------|-------------|------------------|------------------------------------------|
| Fresh local | Árbol local `minios/` o ISO local | RAM temporal | Permanece a menos que una copia `toram` no persistente solicitada la haya desacoplado correctamente. |
| Persistent resume | Almacén de persistencia local o seleccionado explícitamente | Sesión compatible existente cuando está disponible | La fuente y el almacenamiento de persistencia normalmente permanecen en uso. Resume no garantiza que se recupere toda sesión perdida o dañada. |
| Persistent new | Almacén de persistencia escribible | Sesión numerada recién asignada | La fuente y el almacenamiento de persistencia permanecen en uso. La creación requiere almacenamiento escribible compatible y espacio suficiente. |
| Persistent choose | Selección interactiva de ubicación y sesión de persistencia | Sesión seleccionada o recién creada | Depende de la fuente y almacén de persistencia seleccionados. La selección no hace segura una sesión incompatible. |
| Bare o full `toram` | Cualquier fuente live detectable | RAM temporal salvo que también se solicite persistencia | Bare `toram` significa `toram=full`. El medio es extraíble solo después de un desacople exitoso de la fuente no persistente. |
| Trim `toram` | Cualquier fuente live detectable | RAM temporal salvo que también se solicite persistencia | Copia solo el conjunto de módulos filtrados y los datos requeridos. Se aplica la misma condición de desacople. |
| Local ISO o Ventoy | ISO montada en bucle o ISO presentada por Ventoy | RAM temporal o sesión seleccionada por separado | La ISO y los mapeos subyacentes siguen siendo necesarios salvo que `toram` no persistente los desacople correctamente. |
| HTTP ISO | ISO montada mediante `httpfs2` por HTTP | RAM temporal o sesión seleccionada por separado | La ruta de obtención y la red siguen siendo relevantes mientras la raíz esté respaldada por httpfs; `toram` puede eliminar esa dependencia solo si el desacople tiene éxito. |
| PXE | Kernel e initramfs desde el cargador, datos de MiniOS descargados por el initramfs | RAM temporal o sesión seleccionada por separado | La red temprana es para cargar datos, no para la política de red de la sesión. Las dependencias exactas dependen de lo descargado y montado. |
| Native installation | Raíz instalada expandida, no módulos live `.sb` | Sistemas de archivos instalados normales | No utiliza descubrimiento live, sesiones live, `toram`, ensamblado de unión de módulos ni este flujo de entrega live. |

## Combinaciones y límites

Las opciones de fuente, persistencia y copia a RAM son ejes independientes. Un directorio local, una ISO local, una ISO por HTTP o una fuente de datos PXE pueden suministrar módulos live. La persistencia puede omitirse, reanudarse, crearse o seleccionarse donde sea compatible. `toram=full` o `toram=trim` pueden solicitarse con una fuente live compatible.

La persistencia y `toram` pueden aparecer juntas, pero esto no es el mismo contrato que la operación persistente habitual. MiniOS copia los datos de sesión solicitados al árbol de datos en RAM antes de configurar la persistencia. No asumas que los cambios posteriores se guardarán en el almacén original, ni retires su medio solo por la opción `toram`. El límite para medios extraíbles es más estricto: solo es seguro retirar el medio después de que MiniOS haya desacoplado correctamente una copia en RAM **no persistente** de la fuente original. Si el desacople falla, la fuente permanece montada. En Ventoy, MiniOS libera sus mapeos solo tras ese desacople no persistente exitoso; la limpieza de mapeos es best-effort.

`toram=trim` respeta los filtros de selección de módulos, por lo que un módulo excluido no estará disponible solo porque el medio original siga existiendo. El modo full `toram` requiere suficiente RAM para los datos copiados, mientras que trim aún necesita suficiente RAM para el conjunto seleccionado y la carga de trabajo escribible. Ningún modo garantiza que un equipo con poca memoria arranque correctamente.

HTTP ISO y la red PXE pertenecen al initramfs. Un `from=http://...` literal tiene prioridad y puede usar `ip=` para direccionamiento temprano estático. Sin esa fuente HTTP ISO, un `ip=` no vacío selecciona la ruta de datos PXE y omite el descubrimiento de medios locales. No es una dirección estática para el escritorio en ejecución. HTTP ISO admite `http://`, no `https://`. Si una raíz HTTP no fue desacoplada a RAM, una reconfiguración de red posterior puede interrumpir su fuente. Consulta [Arranque por red](/installation/Network-Boot.md) antes de combinar la carga por red con cambios de red en userspace.

La persistencia requiere un destino y modo escribibles adecuados. Un medio de solo lectura no puede alojar una nueva sesión, la persistencia cifrada no se convierte en no cifrada si falla la activación, y la aceptación interactiva no elimina los riesgos de compatibilidad de la sesión. Consulta [Gestión de sesiones](/configuration/Session-Management.md) para modos de almacenamiento, compatibilidad y reglas de recuperación.

## Guía de decisión

| Objetivo | Comenzar con | Verificar antes de confiar |
|----------|-------------|---------------------------|
| Probar MiniOS sin guardar cambios | Fresh local | No se seleccionan sesiones existentes; el medio fuente ordinario sigue en uso. |
| Continuar el trabajo normal | Persistent resume | El destino de persistencia es escribible y la sesión es compatible. |
| Conservar una sesión antigua y empezar limpio | Persistent new | Hay suficiente espacio y el sistema de archivos admite el modo de persistencia elegido. |
| Seleccionar entre varios espacios de trabajo | Persistent choose | Puedes identificar el dispositivo y la sesión deseados; revisa las advertencias de compatibilidad. |
| Retirar el medio de arranque local tras el inicio | `toram` o `toram=trim` no persistentes | Espera a que el desacople de la fuente sea exitoso. No infieras éxito solo por la etiqueta del menú. |
| Reducir el uso de RAM al copiar a RAM | `toram=trim` | El resultado `load=` y `noload=` contiene todos los módulos que el sistema necesita. |
| Arrancar una ISO almacenada en un disco local o dispositivo Ventoy | Descubrimiento de ISO local | Mantén disponible el sistema de archivos anfitrión y los mapeos salvo que se confirme el desacople. |
| Cargar una ISO desde un servidor web | HTTP ISO | Red cableada en initramfs, disponibilidad HTTP simple y acceso continuo a la fuente. |
| Cargar datos de MiniOS desde infraestructura de despliegue | PXE | Sintaxis correcta de `ip=` de MiniOS y una interfaz cableada compatible; no lo trates como configuración de red en userspace. |
| Ejecutar MiniOS como un sistema instalado convencional | Native installation | Sigue la documentación de instalación y recuperación nativa, no los procedimientos de sesión live o `toram`. |

Cuando un arranque falla antes de ensamblar la raíz live, primero identifica si el fallo está en el inicio del firmware/gestor de arranque, descubrimiento de la fuente, persistencia, montaje de módulos o construcción de la raíz. Evita comandos de reparación hasta conocer la disposición del almacenamiento. Consulta [Recuperación de arranque](/administration/Boot-Recovery.md).

## Documentación relacionada

- [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md)
- [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistencia Initrd](/configuration/Initrd-Persistence.md)
- [Parámetros de arranque](/configuration/Boot-Parameters.md)
- [Menús de arranque](/configuration/Boot-Menus.md)
- [Arranque por red](/installation/Network-Boot.md)
- [Gestión de sesiones](/configuration/Session-Management.md)
- [Arquitectura del sistema](/about/System-Architecture.md)
- [Recuperación de arranque](/administration/Boot-Recovery.md)
