---
updated: 2026-08-31
---

# MiniOS aplicaciones

MiniOS ofrece herramientas gráficas y de línea de comandos para la configuración, instalación, sesiones, módulos, kernels, software y remasterización de imágenes. Estas herramientas están diseñadas en torno a la arquitectura modular en vivo descrita en [Acerca de MiniOS](/getting-started/About-MiniOS).

## Disponibilidad

Las herramientas disponibles dependen de los paquetes incluidos en la imagen de MiniOS. Consulta un sistema en vivo en ejecución con `dpkg-query`, o inspecciona los módulos de la imagen y los [manifiestos de paquetes](/reference/Package-and-Edition-Contents).

Una instalación nativa mantiene la experiencia de escritorio habitual de MiniOS: su identidad visual, el entorno de escritorio seleccionado y las aplicaciones habituales, pero no conserva el software de gestión específico de MiniOS diseñado para la arquitectura en vivo. Las sesiones, los módulos `.sb`, la gestión modular de kernels y flujos de trabajo similares dejan de aplicarse, por lo que el sistema instalado utiliza las herramientas normales de paquetes, kernel, configuración y gestor de arranque de Debian.

## Herramientas gráficas

| Tarea | Herramienta | Alcance | Documentación |
|---|---|---|---|
| Editar la configuración de arranque y de nueva sesión de MiniOS | **Configurador de MiniOS** | Para el modelo de configuración en vivo de MiniOS. Escribe la configuración para un arranque en vivo posterior y no reconfigura el sistema en ejecución de inmediato. | [Configurador de MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Desplegar MiniOS en otro disco | **Instalador de MiniOS** | Se ejecuta desde una sesión en vivo de MiniOS. El modo en vivo mantiene el entorno completo en vivo de MiniOS; el modo nativo crea un escritorio Debian convencional y elimina el software específico de MiniOS destinado a la operación en vivo. | [Instalador de MiniOS](/installing-minios/MiniOS-Installer) |
| Crear, seleccionar, redimensionar, guardar o eliminar sesiones persistentes | **Gestor de sesiones de MiniOS** | Solo para sistemas en vivo de MiniOS. | [Gestión de sesiones](/using-minios/Sessions-and-Persistence) |
| Empaquetar, activar, inspeccionar o eliminar kernels de MiniOS | **Gestor de kernels de MiniOS** | Solo para sistemas en vivo modulares de MiniOS. | [Gestión de kernels](/preparing-and-customizing/Managing-Kernels) |
| Instalar aplicaciones o crear módulos de aplicaciones a partir de recetas del catálogo | **Tienda de aplicaciones de MiniOS** | Sistemas en vivo de MiniOS. Elige entre instalación como módulo o directa en el sistema; la persistencia determina si los cambios directos sobreviven al reinicio. | [Tienda de aplicaciones de MiniOS](/using-minios/Installing-Software) |
| Remasterizar una imagen existente de MiniOS mediante un proyecto guiado | **Constructor de imágenes MiniOS** | Trabaja con el contenido de la imagen en vivo de MiniOS desde la sesión en vivo en ejecución, una ISO o un medio óptico. Crea otra ISO en vivo. | [Constructor de imágenes MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspeccionar, crear, activar y seleccionar módulos `.sb` | **Gestor de módulos de MiniOS** | Solo para sistemas en vivo de MiniOS; la composición y activación en tiempo de ejecución de los módulos dependen del modelo de raíz en capas `.sb`. | [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules) |
| Grabar una ISO de MiniOS en una unidad USB | **Utilidad de disco** | Utilidad genérica de imágenes de disco incluida con MiniOS. Graba medios de arranque; no realiza despliegues gestionados como el Instalador de MiniOS. | [Utilidad de disco](/installing-minios/installation-tools/Drive-Utility) |
| Consultar la documentación instalada sin conexión | **Ayuda de MiniOS** | Lee la documentación empaquetada sin requerir conexión a la red. | [Documentación de MiniOS](/) |

## Herramientas de línea de comandos

La mayoría de las herramientas gráficas cuentan con una contraparte de línea de comandos pública o backend. Estos comandos se incluyen ya sea en el mismo paquete que la aplicación gráfica o en un paquete complementario requerido. El manifiesto central compartido incluye `minios-tools` y `minios-image-compose`. Los demás comandos dependen de la disponibilidad de sus paquetes gráficos correspondientes. Su presencia en un sistema o imagen instalada en particular debe verificarse directamente.

### Despliegue y sesiones

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Listar discos de destino, previsualizar un plan de despliegue o instalar MiniOS de forma no interactiva | **`minios-deploy`** | Se ejecuta desde una sesión en vivo de MiniOS. La instalación requiere permisos de root y confirmación explícita; el modo nativo, cuando está disponible, crea un escritorio Debian convencional a partir de la imagen seleccionada. | [Despliegue por línea de comandos](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Crear, activar, guardar, redimensionar, exportar, importar o eliminar sesiones persistentes | **`minios-session`** | Requiere permisos de root y un sistema en vivo MiniOS con un almacenamiento de persistencia compatible. | [Referencia de comandos de sesión](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernels e imágenes

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Listar, empaquetar, activar, inspeccionar o eliminar kernels | **`minios-kernel`** | Requiere permisos de root y una instalación en vivo modular MiniOS con un root MiniOS escribible. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Reempaquetar un árbol de contenido MiniOS existente desde scripts o automatizaciones | **`minios-image-compose`** | Opera sobre el contenido de la imagen en vivo MiniOS y publica una ISO arrancable. | [Composición de imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Flujos de trabajo de módulos

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Inspeccionar módulos y gestionar los conjuntos de módulos en ejecución o para el próximo arranque | **`sb`** | La inspección de módulos también funciona fuera de una sesión MiniOS en ejecución. Las operaciones en ejecución y para el próximo arranque requieren una disposición de módulos en vivo MiniOS; los cambios requieren permisos de root. | [Inspeccionar y extraer módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gestionar módulos en ejecución y para el próximo arranque](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Construir un módulo a partir de paquetes de repositorio o archivos locales`.deb` archivos | **`apt2sb`** | Requiere permisos de root y una sesión en vivo MiniOS compatible. Los paquetes se instalan en un entorno de compilación aislado, no en el root en ejecución. | [Crear un módulo desde paquetes](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Construir un módulo ejecutando un script de instalación | **`script2sb`** | Requiere permisos de root y una sesión en vivo MiniOS compatible. El script se ejecuta de forma no interactiva en un entorno de compilación aislado. | [Crear un módulo desde un script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Construir un módulo de forma interactiva en un entorno preparado | **`chroot2sb`** | Requiere permisos de root y una sesión en vivo MiniOS compatible. Úsalo cuando la instalación requiera indicaciones o cambios manuales. | [Crear un módulo de forma interactiva](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convertir entre un árbol de directorios y un`.sb` módulo | **`dir2sb`**, **`sb2dir`** | La conversión normal no requiere root y puede utilizarse fuera de una sesión en vivo en ejecución si se dispone de las herramientas y archivos necesarios. | [Crear](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) o [extraer](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un módulo; `man dir2sb`, `man sb2dir` |
| Capturar los cambios elegibles de la capa de sesión escribible en un módulo | **`savechanges`** | Requiere permisos de root y una sesión en vivo MiniOS en ejecución con un backend de capa escribible compatible. | [Capturar cambios de la sesión actual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flujos de trabajo de almacenamiento

| Tarea | Herramienta | Alcance | Documentación |
|---|---|---|---|
| Leer o escribir imágenes de disco, formatear un dispositivo o sobrescribir un dispositivo | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operaciones genéricas de disco. Escribir, formatear y borrar son acciones destructivas y normalmente requieren permisos de root. | [Utilidad de disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Para cambios en listas de paquetes fuente, kernels, artefactos de arranque o toda la cadena de módulos, utiliza el sistema de compilación de fuentes en lugar de cualquiera de las herramientas de remasterización de imágenes. Consulta [Compilación de MiniOS](/development/Building-MiniOS).
