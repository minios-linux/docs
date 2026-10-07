---
updated: 2026-10-06
---

# Aplicaciones MiniOS

MiniOS ofrece herramientas gráficas y de línea de comandos para la configuración, instalación, sesiones, módulos, kernels, software y remasterización de imágenes. Estas herramientas están diseñadas en torno a la arquitectura modular en vivo descrita en [Acerca de MiniOS](/getting-started/About-MiniOS).

## Disponibilidad

Las herramientas disponibles dependen de los paquetes incluidos en la imagen MiniOS. Comprueba un sistema en vivo en ejecución con `dpkg-query`, o inspecciona los módulos de la imagen y [manifiestos de paquetes](/reference/Package-and-Edition-Contents).

Una instalación nativa mantiene la experiencia de escritorio familiar de MiniOS — su identidad visual, entorno de escritorio seleccionado y aplicaciones habituales — pero no conserva el software de gestión específico de MiniOS diseñado para la arquitectura en vivo. Las sesiones, `.sb` módulos, la gestión modular de kernels y flujos de trabajo similares dejan de aplicarse, por lo que el sistema instalado utiliza las herramientas estándar de Debian para paquetes, kernels, configuración y gestor de arranque.

## Herramientas gráficas

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Editar la configuración de arranque y de nueva sesión de MiniOS | **Configurador de MiniOS** | Para el modelo de configuración en vivo de MiniOS. Escribe la configuración para un próximo arranque en vivo y no reconfigura el sistema en ejecución de inmediato. | [Configurador de MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Desplegar MiniOS en otro disco | **Instalador de MiniOS** | Se ejecuta desde una sesión en vivo de MiniOS. El modo en vivo mantiene todo el entorno en vivo de MiniOS; el modo nativo crea un escritorio Debian convencional y elimina el software específico de MiniOS destinado al funcionamiento en vivo. | [Instalador de MiniOS](/installing-minios/MiniOS-Installer) |
| Crear, seleccionar, montar, redimensionar, guardar, recuperar, cifrar o eliminar sesiones persistentes | **Gestor de sesiones de MiniOS** | Solo para sistemas en vivo MiniOS. Puede guardar sesiones compatibles respaldadas por RAM en su almacenamiento original, cambiar frases de contraseña LUKS separadas y montar sesiones de contenedor inactivas para acceder a archivos. | [Gestión de sesiones](/using-minios/Sessions-and-Persistence) |
| Empaquetar, activar, inspeccionar o eliminar kernels MiniOS | **Gestor de kernels de MiniOS** | Solo para sistemas en vivo modulares MiniOS. El empaquetado desde el repositorio también puede añadir controladores compatibles del catálogo DKMS seleccionado de MiniOS. | [Gestión de kernels](/preparing-and-customizing/Managing-Kernels) |
| Instalar aplicaciones o construir módulos de aplicaciones a partir de recetas del catálogo | **Tienda de aplicaciones de MiniOS** | Para sistemas en vivo MiniOS. La construcción de módulos puede mantener un nivel de receta o usar un nivel de base de compilación explícito; algunas recetas pueden requerir aceptación de licencia. | [Tienda de aplicaciones de MiniOS](/using-minios/Installing-Software) |
| Remasterizar una imagen existente de MiniOS mediante un proyecto guiado | **Constructor de imágenes MiniOS** | Funciona con el contenido de la imagen en vivo de MiniOS desde la sesión en vivo, una ISO o medios ópticos. Permite seleccionar módulos, capturar cambios de sesión y definir el comportamiento del menú de arranque antes de generar otra ISO en vivo verificada. | [Constructor de imágenes MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspeccionar, crear, activar y seleccionar `.sb`módulos | **Gestor de módulos de MiniOS** | Solo para sistemas en vivo MiniOS; la composición de módulos y la activación en tiempo de ejecución dependen del modelo de `.sb`root por capas. | [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules) |
| Escribir/leer imágenes de disco, formatear almacenamiento o borrar un dispositivo | **Utilidad de disco** | Utilidad genérica de almacenamiento incluida con MiniOS. La escritura de imágenes sin procesar no realiza un despliegue gestionado como el Instalador de MiniOS. | [Utilidad de disco](/installing-minios/installation-tools/Drive-Utility) |
| Navegar la documentación instalada sin conexión | **Ayuda de MiniOS** | Visor nativo GTK para un paquete de documentación precompilado; no requiere el sitio web, WebKit ni conexión de red en tiempo de ejecución. | [Documentación de MiniOS](/) |
| Mostrar la introducción localizada al primer inicio | **Bienvenida de MiniOS** | Página de bienvenida basada en navegador local con Mio, enlaces al proyecto, ayuda, comunidad y sugerencias de soporte. Es contenido introductorio y no un configurador del sistema. | [Inicio rápido](/getting-started/Quick-Start) |

## Herramientas de línea de comandos

La mayoría de las herramientas gráficas cuentan con una contraparte o backend de línea de comandos pública. Estos comandos se incluyen en el mismo paquete que la aplicación gráfica o en un paquete complementario requerido. El manifiesto central compartido incluye `minios-tools` y `minios-image-compose`. Los demás comandos dependen de la disponibilidad de sus paquetes gráficos correspondientes. Su presencia en un sistema o imagen instalada debe comprobarse directamente.

### Despliegue y sesiones

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Listar discos de destino, previsualizar un plan de despliegue o instalar MiniOS de forma no interactiva | **`minios-deploy`** | Se ejecuta desde una sesión en vivo de MiniOS. La instalación requiere permisos de root y confirmación explícita; el modo nativo, cuando está disponible, crea un escritorio Debian convencional a partir de la imagen seleccionada. | [Despliegue por línea de comandos](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Crear, activar, guardar, montar, redimensionar, recuperar, cambiar credenciales de cifrado, exportar, importar o eliminar sesiones persistentes | **`minios-session`** | Requiere permisos de root y un sistema en vivo MiniOS con un almacenamiento de persistencia compatible. El guardado respaldado por RAM, los montajes separados y las operaciones específicas del backend están restringidos por capacidades. | [Referencia de comandos de sesión](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernels e imágenes

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Listar, empaquetar, activar, inspeccionar o eliminar kernels | **`minios-kernel`** | Requiere permisos de root y una instalación modular en vivo de MiniOS con un root MiniOS escribible. | [`minios-kernel`CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Remasterizar un árbol de contenido existente de MiniOS desde scripts o automatización | **`minios-image-compose`** | Opera sobre el contenido de la imagen en vivo de MiniOS y publica una ISO arrancable. | [Composición de imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Flujos de trabajo de módulos

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Inspeccionar módulos y gestionar los conjuntos de módulos activos o para el próximo arranque | **`sb`** | La inspección de módulos también funciona fuera de una sesión MiniOS en ejecución. Las operaciones de ejecución y próximo arranque requieren una disposición de módulos en vivo MiniOS; los cambios requieren permisos de root. | [Inspeccionar y extraer módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gestionar módulos activos y de próximo arranque](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Construir un módulo a partir de paquetes del repositorio o archivos `.deb`locales | **`apt2sb`** | Requiere permisos de root y una sesión en vivo MiniOS compatible. Los paquetes se instalan en un entorno de construcción aislado, no en el root en ejecución. | [Crear un módulo a partir de paquetes](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Construir un módulo ejecutando un script de instalación | **`script2sb`** | Requiere permisos de root y una sesión en vivo MiniOS compatible. El script se ejecuta de forma no interactiva en un entorno de construcción aislado. | [Crear un módulo desde un script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Construir un módulo de forma interactiva en un entorno preparado | **`chroot2sb`** | Requiere permisos de root y una sesión en vivo MiniOS compatible. Úsalo cuando la instalación requiera indicaciones o cambios manuales. | [Crear un módulo de forma interactiva](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convertir entre un árbol de directorios y un `.sb`módulo | **`dir2sb`**, **`sb2dir`** | La conversión ordinaria no requiere root y puede ejecutarse fuera de una sesión en vivo. La extracción y el reempaquetado fieles con propietarios originales y archivos especiales requieren permisos de root; los flujos de trabajo gráficos solicitan autenticación de administrador. | [Crear](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) o [extraer](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un módulo; `man dir2sb`, `man sb2dir` |
| Capturar los cambios elegibles de la capa de sesión escribible en un módulo | **`savechanges`** | Requiere permisos de root y una sesión en vivo MiniOS en ejecución con un backend de capa escribible compatible. | [Capturar cambios de la sesión actual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flujos de trabajo de almacenamiento

| Tarea | Herramienta | Ámbito | Documentación |
|---|---|---|---|
| Leer o escribir imágenes de disco, formatear un dispositivo o borrar almacenamiento | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operaciones genéricas de disco. El borrado admite métodos de borrado por el controlador, descarte y sobreescritura por el host cuando el dispositivo y las herramientas lo permiten. Las operaciones destructivas normalmente requieren permisos de root. | [Utilidad de disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Para cambios en listas de paquetes fuente, kernels, artefactos de arranque o toda la cadena de módulos, utiliza el sistema de construcción de fuentes en lugar de cualquiera de las herramientas de remasterización de imágenes. Consulta [Compilación de MiniOS](/development/Building-MiniOS).
