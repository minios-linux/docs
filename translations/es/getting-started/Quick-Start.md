---
updated: 2026-08-31
---

# Inicio rápido

Esta guía te lleva desde la descarga de la imagen de MiniOS hasta tener un sistema funcionando. Solo cubre las decisiones necesarias para un primer inicio; las guías enlazadas explican cada tema en detalle.

## 1. Descarga MiniOS

Elige la edición que mejor se adapte a lo que quieres hacer:

| Edición | Mejor para |
|---|---|
| **Standard** | **Recomendada para la mayoría de los usuarios y para una primera experiencia con MiniOS.** Un sistema mínimo con funcionalidad básica y un escritorio Xfce compacto y eficiente para el uso diario. |
| **Toolbox** | Una edición de administración y diagnóstico de sistemas para trabajo profesional en TI y recuperación de sistemas. Incluye Standard más las herramientas correspondientes de administración, recuperación, red, pruebas de hardware, respaldo y acceso remoto. |
| **Ultra** | Un escritorio completo con una amplia gama de aplicaciones y herramientas profesionales para creatividad y desarrollo. Incluye Toolbox más software de oficina, gráficos, video, audio, 3D, desarrollo y contenedores. |
| **Flux** | Una edición Fluxbox ultraligera para un uso mínimo de recursos y hardware antiguo. Tiene un conjunto reducido de aplicaciones y menos comodidades de escritorio que Standard. **No recomendada para principiantes.** |

La disponibilidad exacta de paquetes y escritorios depende de la versión. Consulta [Acerca de MiniOS](/getting-started/About-MiniOS) para el modelo de ediciones y [Paquetes y ediciones](/reference/Package-and-Edition-Contents) para la selección de paquetes mantenida.

Descarga el ISO desde el [sitio web de MiniOS](https://minios.dev), la página oficial de [GitHub Releases](https://github.com/minios-linux/minios-live/releases) o [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verifica la descarga

Verifica el archivo ISO antes de instalarlo. Las versiones de MiniOS proporcionan un archivo `.iso.sha256` correspondiente; consulta [Verificación de descargas](/installing-minios/Verifying-Downloads) para ver los comandos en Linux, macOS y Windows.

## 3. Instalar MiniOS

Para MiniOS, escribir el sistema en un medio extraíble ya es un método de instalación: el dispositivo resultante es un sistema MiniOS arrancable.

Elige el método según el resultado que desees obtener del dispositivo:

| Lo que quieres | Método | Resultado |
|---|---|---|
| Una unidad USB normal que también arranque MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) en su modo ISO normal o [Instalación basada en archivos](/installing-minios/Manual-File-Based-Installation) | Los archivos MiniOS y el gestor de arranque residen en un sistema de archivos normal, por lo que la unidad puede seguir usándose para archivos comunes |
| MiniOS junto con otras imágenes ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy mantiene su partición de datos normal, soporta arranque múltiple y MiniOS permite sesiones persistentes en este esquema |
| Una instalación portátil de MiniOS gestionada | [Instalador de MiniOS](/installing-minios/MiniOS-Installer) en modo **Live** | Crea una instalación modular de MiniOS y puede configurar almacenamiento persistente |
| Una copia exacta, bloque a bloque, del ISO | [Rufus](/installing-minios/installation-tools/Rufus) en modo DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilidad de disco](/installing-minios/installation-tools/Drive-Utility) o [`dd`](/installing-minios/installation-tools/dd) | Reproduce el esquema de bloques del ISO; es simple y predecible, pero el dispositivo deja de funcionar como una memoria USB convencional |

Para una unidad portátil que también quieras usar para almacenamiento de archivos normal, es preferible usar Rufus en modo ISO, una instalación basada en archivos, Ventoy o una instalación Live adecuada creada con el Instalador de MiniOS. La escritura de imagen en bruto es útil cuando importa más tener una copia exacta de la imagen publicada que reutilizar el dispositivo como almacenamiento general.

::: danger Verifica el dispositivo de destino
La mayoría de los métodos de instalación sobrescriben algunos o todos los datos del dispositivo seleccionado.
Haz una copia de seguridad de cualquier información importante y verifica el modelo y la capacidad del dispositivo antes de comenzar.
:::

Consulta [Instalando MiniOS](/installing-minios/Installation-Methods) para ver las diferencias entre la escritura de imagen en bruto, Ventoy, los esquemas basados en archivos y el Instalador de MiniOS.

## 4. Inicia MiniOS por primera vez

1. Reinicia el ordenador con el dispositivo de MiniOS conectado.
2. Abre el menú de arranque del firmware del ordenador y selecciona ese dispositivo.
3. Deja seleccionada la entrada predeterminada **Iniciar MiniOS** e inicia el sistema.
4. Comprueba que la gráfica, el teclado, la red y los dispositivos de almacenamiento que necesitas funcionen correctamente.

**Iniciar MiniOS** es el modo de arranque predeterminado. Utiliza la selección automática de persistencia: MiniOS intenta reanudar una sesión predeterminada compatible y, si no existe una sesión utilizable, puede crear una compatible si hay almacenamiento escribible disponible. Si no se puede activar la persistencia, MiniOS continúa con una capa temporal escribible e informa que los cambios no se guardarán.

Esto significa que un primer arranque normal no requiere que crees una sesión por adelantado. Elige **Iniciar sin guardar** solo si quieres deliberadamente un arranque temporal limpio que no abra ni cree una sesión persistente.

Consulta [Modos de arranque](/using-minios/Boot-Modes) para conocer otras opciones de inicio. Si el dispositivo no arranca o algún hardware importante no funciona, consulta [Compatibilidad de hardware](/getting-started/Hardware-Compatibility) y [Solución de problemas](/maintenance-and-recovery/Troubleshooting).

## 5. Cambia el comportamiento de la sesión cuando sea necesario

Para un uso portátil normal, sigue utilizando la opción predeterminada **Iniciar MiniOS**. Elige un modo diferente solo cuando necesites un resultado distinto:

| Opción de arranque | Úsalo cuando | Resultado |
|---|---|---|
| **Iniciar MiniOS** (predeterminado) | Uso portátil normal | Retoma automáticamente una sesión predeterminada compatible o crea una nueva cuando sea compatible |
| **Iniciar una nueva sesión** | Quieres un espacio de trabajo adicional y separado | Crea una sesión persistente adicional numerada y mantiene las sesiones existentes sin cambios |
| **Elegir una sesión guardada** | Quieres seleccionar uno de varios espacios de trabajo existentes | Permite elegir una sesión existente de forma interactiva |
| **Iniciar sin guardar** | Quieres un arranque temporal limpio sin persistencia | Utiliza una capa temporal de escritura en RAM |
| **Ejecutar desde RAM** | Quieres copiar MiniOS en RAM para este arranque | Se ejecuta desde una copia en RAM; los cambios se consideran temporales |

La persistencia automática aún requiere un almacenamiento de escritura adecuado. Una escritura ISO en bruto, por sí sola, no prepara almacenamiento persistente. Las instalaciones basadas en archivos, los esquemas Ventoy y las instalaciones Live realizadas con el [Instalador de MiniOS](/installing-minios/MiniOS-Installer) pueden proporcionar esquemas de escritura para uso persistente de MiniOS. Las sesiones existentes pueden inspeccionarse y gestionarse con [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

Antes de confiar en la persistencia, reinicia una vez y confirma que MiniOS informa que la sesión esperada está activa y que un cambio de prueba persiste tras el reinicio.

## 6. Preconfigura MiniOS

La mayoría de las herramientas de configuración específicas de MiniOS preparan ajustes para un próximo arranque o una nueva sesión, en lugar de cambiar el escritorio en ejecución de inmediato.

Utiliza el **Configurador de MiniOS** para esta preconfiguración: idioma, zona horaria, teclado, nombre de host, servicios, valores predeterminados de cuentas, política de seguridad y otros ajustes de inicio de MiniOS. Ábrelo desde el menú de aplicaciones o ejecuta:

```bash
minios-configurator
```

Utiliza las herramientas estándar del escritorio y de Linux para los ajustes habituales en tiempo de ejecución, como conexiones de red, audio, configuración de pantalla y preferencias de aplicaciones.
Algunas configuraciones del Configurador de MiniOS se aplican en el siguiente arranque, mientras que los ajustes de cuentas y seguridad pueden usarse solo al crear una nueva sesión. Consulta [Configurador de MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) para conocer el comportamiento exacto.

## Próximos pasos

Una vez que MiniOS esté arrancando y conservando el estado que necesitas:

- [Aplicaciones y herramientas de MiniOS](/using-minios/MiniOS-Applications) — consulta las utilidades específicas de MiniOS disponibles en el sistema.
- [Configuración de red](/using-minios/Networking) — utiliza NetworkManager normalmente o prepara la preconfiguración cableada de MiniOS.
- [Tienda de aplicaciones de MiniOS](/using-minios/Installing-Software) — instala aplicaciones desde el catálogo de MiniOS.
- [Gestor de módulos](/preparing-and-customizing/Managing-Modules) — inspecciona y gestiona los módulos de MiniOS.
- [Copia de seguridad y recuperación](/maintenance-and-recovery/Backing-Up-MiniOS) — protege un sistema que planeas seguir utilizando.
