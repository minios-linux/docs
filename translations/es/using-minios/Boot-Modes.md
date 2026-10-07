---
updated: 2026-10-06
---

# Modos de arranque

El modo de arranque determina si MiniOS inicia desde cero, abre una sesión guardada o se ejecuta como un sistema instalado convencional. No necesitas conocer el proceso interno de arranque para tomar esta decisión.

Las etiquetas del menú pueden variar ligeramente entre versiones, modos de firmware y herramientas de arranque. Elige según el resultado que necesitas, no por el texto exacto.

## Selección rápida

La opción predeterminada normal es **Iniciar MiniOS**. Utiliza la selección automática de persistencia: MiniOS intenta reanudar una sesión predeterminada compatible y puede crear una nueva compatible si no existe ninguna utilizable y hay almacenamiento escribible disponible.

| Entrada de menú | Úsalo cuando | ¿Se guardan los cambios? | ¿Mantener el USB conectado? |
|---|---|---|---|
| **Iniciar MiniOS** (predeterminado) | Uso portátil normal | Sí, si la activación automática de persistencia tiene éxito | Sí |
| **Iniciar nueva sesión** | Quieres un espacio de trabajo nuevo y separado | Solo si la nueva sesión se crea y activa correctamente | Sí |
| **Elegir una sesión guardada** | Quieres seleccionar uno de varios espacios de trabajo existentes | Solo si la sesión seleccionada se activa correctamente | Sí |
| **Iniciar sin guardar** | Quieres un arranque temporal limpio sin persistencia | No | Sí |
| **Ejecutar desde RAM** | Quieres copiar los datos del sistema de MiniOS en RAM para este arranque | Los cambios respaldados por RAM son temporales, a menos que una sesión de persistencia compatible se guarde explícitamente o se guarde como nueva | Hasta que MiniOS haya desconectado correctamente la fuente y cualquier almacenamiento que aún necesites |

Para un primer arranque normal, deja **Iniciar MiniOS** seleccionado. Usa **Iniciar sin guardar** cuando necesites específicamente una prueba de hardware temporal o una sesión de recuperación que no debe abrir ni crear persistencia.

::: warning Confirma que la persistencia está activa
Elegir una entrada de menú persistente solicita una sesión; no garantiza que se pueda abrir. Si el almacenamiento es de solo lectura, está lleno, dañado o es incompatible, MiniOS puede continuar sin guardar los cambios. Revisa la advertencia de inicio antes de comenzar un trabajo que deba conservarse.
:::

## Iniciar MiniOS

**Iniciar MiniOS** es la primera y predeterminada entrada del menú. Está pensada para el uso normal, incluido el primer arranque de un dispositivo MiniOS recién preparado.

MiniOS busca automáticamente una sesión persistente compatible. Si existe una sesión predeterminada utilizable, la reanuda. Si no existe ninguna, MiniOS puede crear una sesión compatible automáticamente cuando hay almacenamiento escribible disponible.

Si no se puede crear o activar la persistencia porque el almacenamiento es de solo lectura, está lleno, dañado o no es adecuado, MiniOS continúa con una capa temporal escribible e informa que la sesión no es persistente. Revisa esa advertencia antes de realizar trabajos que deban sobrevivir a un reinicio.

Para una sesión persistente funcional, el Configurador de MiniOS puede mantener ciertos registros y cachés habituales en RAM mientras conserva los diagnósticos de arranque y los datos de usuario en el almacenamiento. Los tres ajustes y sus límites de RAM se describen en [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). No tienen efecto en un **Iniciar sin guardar** arranque.

## Iniciar nueva sesión

MiniOS abre el menú de configuración de persistencia, te permite elegir un backend de almacenamiento compatible y las opciones de cifrado o compresión DynBlk aplicables, y luego crea una sesión persistente adicional numerada sin modificar las sesiones existentes. Este es el comportamiento actual de `perchdir=setup`Úsalo para mantener espacios de trabajo separados o para probar una nueva configuración sin reemplazar tu sesión de trabajo actual.

La creación requiere almacenamiento compatible escribible y suficiente espacio libre. Las opciones de backend disponibles dependen del sistema de archivos, el estado de Secure Boot, los controladores/herramientas instalados y las capacidades de initrd. Una nueva sesión no es una copia de seguridad de una existente.

## Elegir una sesión guardada

MiniOS muestra las sesiones guardadas disponibles y te permite seleccionar una. Úsalo cuando un dispositivo contiene varios espacios de trabajo. Si el almacén de persistencia seleccionado está vacío, la ruta `ask` inicia automáticamente la configuración de persistencia para que puedas crear la primera sesión.

Una sesión puede ser incompatible si proviene de otra edición o versión de MiniOS. Un ajuste diferente de `union=` también puede hacer que una sesión sea incompatible.
La selección interactiva no hace que una sesión incompatible sea segura.

## Iniciar sin guardar

Este modo desactiva deliberadamente la persistencia para el arranque actual. MiniOS utiliza un área temporal escribible en RAM, por lo que los archivos creados en el sistema live, los paquetes instalados y los cambios de configuración se pierden al apagar.

Utiliza este modo cuando específicamente quieras:

- probar hardware sin abrir ni crear una sesión persistente;
- diagnosticar un problema sin modificar el estado guardado;
- trabajar temporalmente cuando no necesitas conservar nada.

Iniciar sin guardar no significa que se pueda retirar el medio de arranque. El sistema en ejecución normalmente sigue leyendo sus módulos del sistema desde ese medio.

## Ejecutar desde RAM

Este modo copia los datos del sistema de MiniOS en RAM para reducir las lecturas desde la fuente. Se necesita suficiente memoria para el sistema copiado y la carga de trabajo en ejecución.

La copia del sistema y la copia de persistencia ahora son independientes. Si se solicita persistencia, `toram` por defecto `perchtoram` a `trim`, por lo que la sesión seleccionada compatible Raw, DynFileFS, DynBlk, VMDK o SquashFS se copia en RAM mientras las sesiones guardadas no relacionadas permanecen en el almacenamiento original. Usa `perchtoram=off` cuando quieras el sistema en RAM pero que la sesión de persistencia activa siga escribiendo directamente en el almacenamiento, o `perchtoram=full` cuando deban copiarse todas las sesiones guardadas compatibles. Las sesiones de directorio nativas no se copian con `perchtoram`.

Una sesión de persistencia respaldada por RAM no es duradera mientras está en ejecución. El Gestor de sesiones de MiniOS actual puede escribir explícitamente los cambios respaldados por RAM en el almacenamiento original usando **Guardar ahora**, o guardarlos como una nueva sesión numerada, siempre que el almacenamiento original esté presente, sea escribible y siga coincidiendo con la identidad registrada al arrancar. Hasta que ese guardado tenga éxito, los cambios no guardados de RAM se perderán al apagar. Las políticas de guardado automático de SquashFS utilizan el mismo backend de sesión cuando el almacenamiento original está disponible.

No retires el dispositivo de arranque solo porque **Ejecutar desde RAM** fue seleccionado. Solo es seguro después de que MiniOS haya desconectado correctamente el sistema de archivos de origen, el bucle ISO, los mapeos Ventoy y cualquier dependencia de persistencia que aún necesites. Si la desconexión falla, la fuente sigue en uso.

## Instalación nativa

::: warning La instalación nativa cambia el modelo de sistema
Una instalación nativa mantiene la experiencia de escritorio familiar de MiniOS —su identidad visual, entorno de escritorio seleccionado y aplicaciones habituales—, pero convierte la imagen live en un escritorio Debian convencional. Las herramientas específicas de MiniOS para sesiones, módulos, kernels modulares y otros flujos de trabajo live se eliminan porque esas funciones ya no aplican.
:::

Tras la conversión nativa, utiliza las herramientas normales de paquetes, kernel, configuración y gestor de arranque de Debian. El resultado sigue siendo visualmente familiar y mantiene las aplicaciones de escritorio habituales de la edición seleccionada, pero el conjunto de funciones live específico de MiniOS ya no está presente. La arquitectura live de MiniOS se describe en [Acerca de MiniOS](/getting-started/About-MiniOS).

Usa [Instalador de MiniOS](/installing-minios/MiniOS-Installer) solo cuando realmente desees esa conversión y la imagen seleccionada admita el despliegue nativo.

## Cuando necesitas más detalles

- [Menús de arranque](/preparing-and-customizing/Customizing-the-Boot-Menu) explica la navegación y la edición temporal de una entrada de menú.
- [Gestión de sesiones](/using-minios/Sessions-and-Persistence) explica los modos de almacenamiento, la creación, el redimensionamiento y la eliminación de sesiones.
- [Parámetros de arranque](/reference/Boot-Parameters) es la referencia completa de la línea de comandos.
- [Descubrimiento del sistema initrd](/reference/boot-process/System-Discovery), [carga de módulos](/reference/boot-process/Module-Loading), y [persistencia](/reference/boot-process/Persistence-Internals) explican cómo se procesan los grupos de parámetros relacionados durante el arranque.
