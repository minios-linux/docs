# Aplicaciones y herramientas de MiniOS

MiniOS incluye herramientas para configurar, instalar, mantener y remasterizar sistemas MiniOS. Utiliza esta página para elegir una herramienta y sigue la guía enlazada para conocer los requisitos, límites de seguridad y detalles de los comandos.

## Verifica qué está instalado

Los manifiestos actuales de paquetes Xfce incluyen el conjunto gráfico en las ediciones Standard, Toolbox y Ultra: Configurador, Instalador, Gestor de Sesiones, Gestor de Kernel, Tienda, Generador de Imágenes, Gestor de Módulos, Ayuda de MiniOS y Utilidad de Discos.
La edición Flux no incluye este conjunto de interfaz gráfica, y las compilaciones que usan otros entornos de escritorio o consola pueden no incluirlo. La selección condicional de paquetes también varía según la suite de la distribución y las opciones de compilación.

El conjunto de paquetes instalados o la imagen finalizada es la referencia principal. Verifica un sistema en ejecución con `dpkg-query`, o inspecciona los módulos de la imagen y los manifiestos como se describe en [Paquetes y ediciones](/administration/Packages.md).

## Elige una herramienta gráfica

| Tarea | Herramienta | Aplicabilidad en vivo y nativa | Documentación |
|---|---|---|---|
| Editar la configuración de MiniOS al inicio y en nuevas sesiones | **MiniOS Configurator** | Para el modelo de configuración en vivo de MiniOS. Escribe configuraciones para un futuro arranque en vivo y no reconfigura el sistema en ejecución de inmediato. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| Desplegar MiniOS en otro disco | **MiniOS Installer** | Ejecutar desde una sesión en vivo de MiniOS. Puede crear una instalación modular en vivo o una instalación nativa convencional cuando la imagen soporta el despliegue nativo. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Crear, seleccionar, redimensionar, guardar o eliminar sesiones persistentes | **MiniOS Session Manager** | Solo para sistemas en vivo. Las instalaciones nativas escriben directamente en su sistema de archivos raíz y no utilizan sesiones en vivo de MiniOS. | [Gestión de sesiones](/configuration/Session-Management.md) |
| Empaquetar, activar, inspeccionar o eliminar kernels de MiniOS | **MiniOS Kernel Manager** | Pensado para instalaciones modulares en vivo y su repositorio de kernels de MiniOS. En una instalación nativa, utiliza el flujo de trabajo normal de paquetes de kernel de la distribución. | [Gestión de kernel](/administration/Kernel-Management.md) |
| Instalar aplicaciones o crear módulos de aplicaciones a partir de recetas del catálogo | **MiniOS Store** | En sistemas en vivo, elige instalación como módulo o directa en el sistema; la persistencia determina si los cambios directos sobreviven al reinicio. Las instalaciones nativas usan el modo directo al sistema. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Remasterizar una imagen existente de MiniOS mediante un proyecto guiado | **MiniOS Image Builder** | Funciona con el contenido de la imagen en vivo de MiniOS desde la sesión en vivo, un ISO o un medio óptico. Crea otro ISO en vivo; no mantiene una instalación nativa ni reemplaza una compilación de origen. | [MiniOS Image Builder](/development/Image-Builder.md) |
| Inspeccionar, crear, activar y seleccionar módulos `.sb` | **MiniOS Module Manager** | La composición de módulos y la activación en tiempo de ejecución son funciones de sistemas en vivo. Las instalaciones nativas no usan el modelo de raíz en capas `.sb`. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Leer la documentación instalada de MiniOS | **MiniOS Help** | Un visor de documentación local. Puede utilizarse donde estén instalados el paquete `minios-help` y su conjunto de documentación. | [Documentación de MiniOS](/) |
| Grabar un ISO de MiniOS en una unidad USB | **Drive Utility** | Puede ejecutarse en un sistema gráfico en vivo o nativo cuando está instalada. Escribe medios de arranque; no realiza un despliegue en vivo o nativo como MiniOS Installer. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Elige una herramienta de línea de comandos

El manifiesto central compartido actualmente incluye `minios-tools` y `minios-image-compose`, incluso en la edición Flux. Sin embargo, su presencia en cualquier sistema o imagen instalada debe verificarse directamente.

### Trabajar con módulos y cambios de sesión

Utiliza las herramientas CLI principales de MiniOS cuando necesites un flujo de trabajo de módulos automatizable:

- `sb` inspecciona módulos y gestiona los conjuntos de módulos activos y para el próximo arranque.
- `apt2sb`, `script2sb` y `chroot2sb` construyen módulos en un entorno aislado.
- `dir2sb` y `sb2dir` convierten entre árboles de directorios y módulos `.sb`.
- `savechanges` captura los cambios elegibles de una sesión en vivo con escritura en un módulo.
- `rmsbdir` elimina un directorio de extracción de módulos con las comprobaciones de seguridad necesarias.

La mayoría de las operaciones de construcción, captura, activación y próximo arranque dependen de una disposición de módulos en vivo de MiniOS. La conversión básica de archivos e inspección pueden ser útiles fuera de una sesión en vivo si se dispone de las herramientas y archivos de entrada necesarios.
Consulta [Creación de módulos](/development/Creating-Modules.md) para información sobre privilegios, reglas de salida y flujos de trabajo de comandos actuales.

### Componer un ISO de MiniOS

Utiliza `minios-image-compose` para scripts, automatización o una remasterización reproducible por línea de comandos de un árbol de contenido existente de MiniOS. Permite seleccionar módulos, aplicar configuraciones de imagen compatibles, capturar opcionalmente cambios de sesiones en vivo compatibles, verificar el resultado y publicar un ISO arrancable. Opera sobre el contenido de imágenes en vivo de MiniOS y no convierte ni actualiza una instalación nativa. Consulta [Composición de imágenes ISO de MiniOS desde la línea de comandos](/development/Rebuilding-ISO.md).

Para cambios en listas de paquetes fuente, kernels, artefactos de arranque o la cadena completa de módulos, utiliza el sistema de compilación de fuentes en lugar de cualquiera de las herramientas de remasterización de imágenes. Consulta [Compilación de MiniOS](/development/Building-MiniOS.md).
