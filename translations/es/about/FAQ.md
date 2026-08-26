# Preguntas frecuentes

## ¿Qué edición debo elegir y por qué falta una aplicación?

La edición Flux utiliza el entorno Flux basado en Fluxbox y un conjunto reducido de paquetes.
Standard, Toolbox y Ultra agregan software progresivamente diferente, pero la disponibilidad varía según la versión. Consulta
[Acerca de MiniOS](/about/About-MiniOS.md),
[Aplicaciones de MiniOS](/about/MiniOS-Applications.md) y la
[lista de paquetes](/administration/Packages.md).

## ¿Es lo mismo grabar el ISO que instalar MiniOS?

No. Grabar el ISO crea un medio vivo arrancable. El instalador de MiniOS puede desplegar
tanto un sistema en vivo modular con persistencia opcional como un sistema nativo convencional.
Elige una disposición con [Instalando MiniOS](/installation/Installing-MiniOS.md)
y [Instalador de MiniOS](/installation/MiniOS-Installer.md).

## ¿Cuáles son las credenciales predeterminadas?

Una imagen en vivo sin personalizar utiliza `live` / `evil` y `root` / `toor`, y puede
permitir inicio de sesión automático y administración sin contraseña. Cambia estos datos antes de
usar una red no confiable; sigue
[Fortalecimiento de seguridad](/administration/Security-Hardening.md).

## ¿Grabar MiniOS en una unidad USB habilita la persistencia?

No necesariamente. Las grabaciones directas del ISO y los arranques normales de ISO con Ventoy no configuran
una sesión persistente automáticamente. Sigue [Inicio rápido](/installation/Quick-Start.md)
y [Gestión de sesiones](/configuration/Session-Management.md) según el método de grabación y arranque seleccionado.

## ¿Cuál es la diferencia entre la sesión activa y la sesión en ejecución?

La sesión activa es la que se selecciona para el próximo arranque; conceptualmente, la sesión
en ejecución proporciona persistencia en este momento. El registro persistente `running=` puede estar desactualizado después de un fallo, por lo que el estado protegido del arranque actual y la capa de escritura montada son los que tienen autoridad para las operaciones en tiempo de ejecución. Activar una sesión no cambia el sistema actual. Consulta [Gestión de sesiones](/configuration/Session-Management.md) y [Persistencia en Initrd](/configuration/Initrd-Persistence.md).

## ¿Por qué desaparecieron mis cambios después de reiniciar?

Es posible que hayas iniciado una sesión nueva, utilizado un medio sin persistencia o seleccionado una sesión diferente. Las sesiones Native, DynFileFS, raw y LUKS reciben escrituras mientras el sistema está en funcionamiento; no esperan a una instantánea al apagar. Solo la persistencia SquashFS requiere que los cambios en la RAM se reconstruyan en `changes.sb`, por lo que un apagado interrumpido o una política de guardado deshabilitada puede dejar los últimos cambios sin guardar. Verifica la sesión en ejecución y la activa como se describe en [Gestión de sesiones](/configuration/Session-Management.md) y [Solución de problemas](/administration/Troubleshooting.md).

## ¿Son LUKS y SquashFS el mismo tipo de persistencia?

No. LUKS almacena una sesión ext4 escribible y cifrada dentro de un contenedor. SquashFS es una instantánea comprimida que se ejecuta desde una capa escribible respaldada por RAM y debe guardarse según su política. Consulta [Gestión de sesiones](/configuration/Session-Management.md) y [Refuerzo de seguridad](/administration/Security-Hardening.md).

## ¿Por qué una aplicación o módulo de la Store aparece solo después de reiniciar?

El modo módulo crea un módulo `.sb` de solo lectura para el próximo inicio; no agrega la aplicación a la pila de módulos actual. Confirma su ubicación y reinicia como se indica en [MiniOS Store](/administration/MiniOS-Store.md).

## ¿Debo instalar software con APT o como módulo?

Utiliza APT para modificar un sistema en ejecución o una sesión persistente. Usa módulos para
capas de software de solo lectura que se cargan al arrancar. Compara los efectos y los requisitos de almacenamiento en [Actualizaciones de software](/administration/Software-Updates.md) y
[Creación de módulos](/development/Creating-Modules.md).

## ¿Puedo actualizar MiniOS a una nueva versión en el mismo lugar?

No existe una actualización de versión en el lugar compatible. No trates una actualización de versión de Debian como una actualización de imagen de MiniOS. Haz una copia de seguridad de tus datos y utiliza una imagen creada para la versión de destino; consulta [Actualizaciones de software](/administration/Software-Updates.md).

## ¿Debo usar `ip=` para configurar la red normal?

No. Proporcionar una configuración de dirección como `ip=<configuration>` selecciona el arranque temprano por red y omite los medios locales. Configura el sistema en ejecución con NetworkManager o las herramientas de red documentadas. Consulta [Arranque por red](/installation/Network-Boot.md) y [Configuración de red](/configuration/Network-Configuration.md).

## ¿Cómo conservo la configuración Wi-Fi después de reiniciar?

Guarda el perfil de NetworkManager en una sesión en vivo persistente o en una instalación nativa, luego prueba reiniciando. El instalador no crea ni modifica perfiles Wi-Fi. Consulta [Configuración de red](/configuration/Network-Configuration.md)
y [Gestión de sesiones](/configuration/Session-Management.md).

## ¿MiniOS es compatible con BIOS y UEFI?

MiniOS es compatible con BIOS heredado y UEFI x86-64, pero la entrada de firmware disponible
y la disposición de particiones del instalador siguen siendo importantes. Consulta
[Instalando MiniOS](/installation/Installing-MiniOS.md) y usa
[Recuperación de arranque](/administration/Boot-Recovery.md) si un sistema instalado no inicia.

## ¿Cómo verifico un ISO?

Descarga el ISO y el archivo `.iso.sha256` correspondiente de la misma versión oficial,
luego compara la suma de comprobación SHA-256 antes de grabarlo o arrancarlo. Sigue
[Verificación de descargas](/installation/Verifying-Downloads.md).

## ¿Debo reparar primero una sesión o sistema de archivos dañado?

Haz una copia de seguridad de los datos importantes e identifica el dispositivo, sistema de archivos y punto de montaje exactos antes de realizar cualquier cambio. Nunca repares la única copia ni una sesión activa.
Comienza con [Copia de seguridad y recuperación](/administration/Backup-Recovery.md),
[Solución de problemas](/administration/Troubleshooting.md) y
[Recuperación de arranque](/administration/Boot-Recovery.md).

## ¿Qué debo incluir al pedir ayuda o reportar un problema?

Registra la edición y versión, métodos de inicio y persistencia, hardware, pasos exactos, primer error y registros relevantes. Elimina credenciales y otros datos sensibles, luego sigue [Recopilar registros](/administration/Troubleshooting.md) y reporta defectos reproducibles en el [seguimiento de incidencias de MiniOS](https://github.com/minios-linux/minios-live/issues).

## ¿Debo compilar desde el código fuente o usar Image Builder?

Compila desde el código fuente cuando necesites crear el sistema MiniOS completo y el conjunto de módulos.
Utiliza [MiniOS Image Builder](/development/Image-Builder.md) para una remasterización guiada, o [`minios-image-compose`](/development/Rebuilding-ISO.md) para componer
un árbol de contenido MiniOS existente desde la línea de comandos. Consulta
[Compilando MiniOS](/development/Building-MiniOS.md) para compilaciones desde el código fuente.
