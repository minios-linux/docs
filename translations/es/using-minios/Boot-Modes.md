---
updated: 2026-08-31
---

# Modos de arranque

El modo de arranque determina si MiniOS inicia desde cero, abre una sesión guardada o se ejecuta como un sistema instalado convencional. No es necesario comprender el proceso interno de arranque para tomar esta decisión.

Las etiquetas del menú pueden variar ligeramente entre versiones, modos de firmware y herramientas de arranque. Elige según el resultado que necesitas, no por el texto exacto.

## Elección rápida

La opción predeterminada normal es **Iniciar MiniOS**. Utiliza una selección automática de persistencia: MiniOS intenta reanudar una sesión predeterminada compatible y puede crear una nueva compatible si no existe ninguna utilizable y hay almacenamiento escribible disponible.

| Entrada de menú | Úsalo cuando | ¿Se guardan los cambios? | ¿Mantener el USB conectado? |
|---|---|---|---|
| **Iniciar MiniOS** (predeterminado) | Uso portátil normal | Sí, si la activación automática de persistencia tiene éxito | Sí |
| **Iniciar una nueva sesión** | Quieres un espacio de trabajo nuevo y separado | Solo si la nueva sesión se crea y activa correctamente | Sí |
| **Elegir una sesión guardada** | Quieres seleccionar uno de varios espacios de trabajo existentes | Solo si la sesión seleccionada se activa correctamente | Sí |
| **Iniciar sin guardar** | Quieres un arranque limpio y temporal sin persistencia | No | Sí |
| **Ejecutar desde RAM** | Quieres copiar MiniOS en RAM para este arranque | No; trata la copia de RAM como temporal | Hasta que MiniOS haya desconectado correctamente la fuente |

Para un primer arranque normal, deja seleccionada la opción **Iniciar MiniOS**. Usa **Iniciar sin guardar** solo cuando necesites específicamente una prueba de hardware o una sesión de recuperación temporal y limpia, que no debe abrir ni crear persistencia.

::: warning Confirma que la persistencia está activa
Elegir una opción persistente en el menú solicita una sesión; no garantiza que la sesión pueda abrirse. Si el almacenamiento es de solo lectura, está lleno, dañado o es incompatible, MiniOS puede continuar sin guardar los cambios. Revisa la advertencia de inicio antes de comenzar un trabajo que deba conservarse.
:::

## Iniciar MiniOS

**Iniciar MiniOS** es la primera y predeterminada entrada del menú. Está pensada para el uso normal, incluyendo el primer arranque de un dispositivo MiniOS recién preparado.

MiniOS busca automáticamente una sesión persistente compatible. Si existe una sesión predeterminada utilizable, la reanuda. Si no existe, MiniOS puede crear una sesión compatible automáticamente si hay almacenamiento escribible adecuado disponible.

Si no se puede crear o activar la persistencia porque el almacenamiento es de solo lectura, está lleno, dañado o no es adecuado, MiniOS continúa con una capa temporal escribible e informa que la sesión no es persistente. Revisa esa advertencia antes de realizar trabajos que deban sobrevivir a un reinicio.

## Iniciar una nueva sesión

MiniOS crea una sesión persistente adicional numerada y deja las sesiones existentes sin cambios. Utiliza esta opción para mantener espacios de trabajo separados o para probar una nueva configuración sin reemplazar tu sesión de trabajo actual.

La creación requiere almacenamiento compatible escribible y suficiente espacio libre. Una nueva sesión no es una copia de seguridad de una existente.

## Elegir una sesión guardada

MiniOS muestra las sesiones guardadas disponibles y te permite seleccionar una. Usa esto cuando un dispositivo contiene varios espacios de trabajo. Para crear la primera sesión en un almacenamiento vacío, elige **Iniciar una nueva sesión** en su lugar.

Una sesión puede ser incompatible si proviene de otra versión o edición de MiniOS. Una configuración diferente de `union=` también puede hacer que una sesión sea incompatible.
La selección interactiva no hace que una sesión incompatible sea segura.

## Iniciar sin guardar

Este modo desactiva deliberadamente la persistencia para el arranque actual. MiniOS utiliza un área temporal escribible en RAM, por lo que los archivos creados en el sistema live, los paquetes instalados y los cambios de configuración desaparecen al apagar.

Utiliza este modo cuando específicamente quieras:

- probar hardware sin abrir ni crear una sesión persistente;
- diagnosticar un problema sin modificar el estado guardado;
- trabajar temporalmente cuando no es necesario conservar nada.

Iniciar sin guardar no significa que se pueda retirar el medio de arranque. El sistema en ejecución normalmente sigue leyendo sus módulos de sistema desde ese medio.

## Ejecutar desde RAM

Este modo copia los datos de MiniOS en RAM para reducir las lecturas desde la fuente. Se necesita suficiente memoria para el sistema copiado y la carga de trabajo en ejecución.

Trata una sesión cargada en RAM como temporal. Combinar `toram` con persistencia copia los datos de la sesión seleccionada en RAM; los cambios posteriores no se copian de vuelta al almacenamiento de persistencia original.

No retires el dispositivo de arranque solo porque se haya seleccionado **Ejecutar desde RAM**. Solo es seguro hacerlo después de que MiniOS haya desconectado correctamente el sistema de archivos de origen, el loop ISO y cualquier mapeo de Ventoy. Si esa operación falla, la fuente seguirá en uso.

## Instalación nativa

::: warning La instalación nativa modifica el modelo del sistema
Una instalación nativa mantiene la experiencia de escritorio familiar de MiniOS —su identidad visual, el entorno de escritorio seleccionado y las aplicaciones habituales—, pero convierte la imagen live en un escritorio Debian convencional. Las herramientas específicas de MiniOS para sesiones, módulos, kernels modulares y otros flujos de trabajo live se eliminan, ya que esas funciones dejan de aplicarse.
:::

Después de la conversión nativa, utiliza las herramientas normales de Debian para paquetes, kernel, configuración y gestor de arranque. El resultado sigue siendo visualmente familiar y conserva las aplicaciones de escritorio habituales de la edición seleccionada, pero el conjunto de funciones live específicas de MiniOS ya no está presente. La arquitectura live de MiniOS se describe en [Acerca de MiniOS](/getting-started/About-MiniOS).

Utiliza el [Instalador de MiniOS](/installing-minios/MiniOS-Installer) solo cuando realmente desees esa conversión y la imagen seleccionada sea compatible con el despliegue nativo.

## Cuando necesitas más detalles

- [Menús de arranque](/preparing-and-customizing/Customizing-the-Boot-Menu) explica la navegación y la edición temporal de una entrada de menú.
- [Gestión de sesiones](/using-minios/Sessions-and-Persistence) explica los modos de almacenamiento, la creación, el redimensionamiento y la eliminación de sesiones.
- [Parámetros de arranque](/reference/Boot-Parameters) es la referencia completa de la línea de comandos.
- [Descubrimiento del sistema en initrd](/reference/boot-process/System-Discovery), [carga de módulos](/reference/boot-process/Module-Loading) y [persistencia](/reference/boot-process/Persistence-Internals) explican cómo se procesan los grupos de parámetros relacionados durante el arranque.
