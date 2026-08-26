# Inicio rápido

Esta guía cubre la descarga, escritura, arranque y la configuración inicial de MiniOS.

## 1. Elige una edición

- **Flux** ofrece un conjunto reducido de paquetes y el entorno Flux.
- **Standard** es la edición Xfce de propósito general.
- **Toolbox** añade herramientas de administración, diagnóstico, almacenamiento y recuperación.
- **Ultra** incluye el conjunto de aplicaciones más amplio.

La disponibilidad de ediciones y escritorios varía según la versión. Consulta
[Acerca de MiniOS](/about/About-MiniOS.md) y la
[lista de paquetes](/administration/Packages.md) antes de descargar.

Descarga una ISO desde [minios.dev](https://minios.dev) o desde la
[página de lanzamientos en GitHub](https://github.com/minios-linux/minios-live/releases).
Verifica su suma de comprobación antes de usarla; consulta
[Verificación de descargas](/installation/Verifying-Downloads.md).

## 2. Prepara un dispositivo de destino

Utiliza un dispositivo lo suficientemente grande para el ISO seleccionado y cualquier dato o sesión persistente que desees conservar. El tamaño de los ISOs varía entre versiones, así que revisa la descarga y la herramienta de escritura en vez de confiar en un tamaño fijo listado en una guía. Haz una copia de seguridad del dispositivo de destino primero: la mayoría de los métodos de instalación sobrescriben parte o todo su contenido.

Elige un método y lee su guía antes de seleccionar un dispositivo:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), o
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), o
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) o
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Desde MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Otros métodos documentados son [UNetbootin](/installation/tools/UNetbootin.md) y el [método original](/installation/tools/Original-Method.md). Consulta
[Herramientas de creación USB](/installation/tools/USB-Creation-Tools.md) para una comparación y [Instalando MiniOS](/installation/Installing-MiniOS.md) para la visión general de la instalación.

## 3. Comprende la persistencia antes de escribir

No todos los métodos de escritura o arranque crean persistencia.

- Una escritura de imagen en bruto con `dd`, Etcher u otra herramienta similar reproduce el ISO. Por sí sola, no configura una sesión persistente.
- Ventoy normalmente arranca el ISO como un archivo. La persistencia de MiniOS debe configurarse por separado.
- El instalador de MiniOS puede crear una instalación en vivo y configurar almacenamiento de sesión nativo, DynFileFS, en bruto o cifrado con LUKS.
- Un arranque nuevo se ejecuta deliberadamente sin persistencia. Otras entradas del menú de arranque de MiniOS pueden reanudar, crear o seleccionar sesiones cuando haya almacenamiento escribible disponible.
- Una instalación nativa es un sistema instalado convencional y no utiliza la persistencia de sesión en vivo de la misma manera.

Utiliza [Modos de arranque](/configuration/Boot-Modes.md) como la guía principal sobre el comportamiento visible para el usuario durante el arranque en vivo. Consulta [Gestión de sesiones](/configuration/Session-Management.md) para las opciones de almacenamiento, [Persistencia Initrd](/configuration/Initrd-Persistence.md) para el contrato detallado en el arranque y [Parámetros de arranque](/configuration/Boot-Parameters.md) antes de modificar opciones del kernel. Mantén siempre una copia de seguridad de los archivos importantes, independientemente del modo de persistencia.

## 4. Arrancar MiniOS

1. Apaga el ordenador y conecta el dispositivo preparado.
2. Abre el menú de arranque del firmware y selecciona la entrada UEFI o legacy del dispositivo.
3. Selecciona una sesión nueva para una prueba inicial de hardware, o una sesión persistente solo si ya ha sido configurada.
4. Confirma que la gráfica, el teclado, el almacenamiento y la red funcionan antes de realizar cambios de instalación destructivos.

Si el dispositivo no aparece en la lista o el escritorio no inicia, consulta [Compatibilidad de hardware](/installation/Hardware-Compatibility.md) y [Solución de problemas](/administration/Troubleshooting.md). Para fallos al localizar la fuente en vivo, revisa [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md).

## 5. Configura el sistema

Abre **Aplicaciones > Sistema > Configurar MiniOS**, o ejecuta:

```bash
minios-configurator
```

El Configurador edita `/etc/live/config.conf`. Permite establecer la identidad de usuario,
contraseñas, configuración regional, zona horaria, teclado, nombre de host, servicios, almacenamiento de directorios de usuario y controles de seguridad. No modifica el sistema en ejecución directamente; los ajustes guardados se aplican según la aplicabilidad de cada configuración, normalmente después de reiniciar o al crear una nueva sesión.

Los perfiles de seguridad rellenan ajustes concretos para sudo, PolicyKit, SSH, XRDP, X11,
pistas de contraseña, bloqueo de pantalla y acceso automático. Revisa los controles resultantes en lugar de considerar el nombre del perfil como una configuración activa. Consulta
[Refuerzo de seguridad](/administration/Security-Hardening.md) y la
guía del [Configurador de MiniOS](/configuration/MiniOS-Configurator.md). La
[referencia del archivo de configuración](/configuration/Configuration-File.md) documenta
las claves subyacentes.

Configura conexiones normales por cable y Wi-Fi con la [Configuración de red](/configuration/Network-Configuration.md). El parámetro de arranque de red `ip=` no es una configuración persistente de NetworkManager.

## 6. Instala software y guarda tu trabajo

Los cambios realizados con APT en una sesión en vivo solo se conservan tras reiniciar si esa sesión es persistente. Los módulos SquashFS permanecen separados de la sesión escribible y pueden cargarse como parte del sistema modular; consulta [Creación de módulos](/development/Creating-Modules.md) y [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md).

Guarda los archivos importantes en un almacenamiento conocido como escribible y prueba al menos un apagado y reinicio limpios antes de confiar en una sesión persistente.

## Obtener ayuda

- [Optimización del rendimiento](/administration/Performance-Optimization.md)
- [Aplicaciones y herramientas de MiniOS](/about/MiniOS-Applications.md)
- [Copia de seguridad y recuperación](/administration/Backup-Recovery.md)
- [Preguntas frecuentes](/about/FAQ.md)
- [Gestión del kernel](/administration/Kernel-Management.md)
- [Compilando MiniOS](/development/Building-MiniOS.md)
- [Reconstrucción de una ISO](/development/Rebuilding-ISO.md)
- [Incidencias en GitHub](https://github.com/minios-linux/minios-live/issues)
- [Código fuente de MiniOS](https://github.com/minios-linux/minios-live)
- [Documentación de Debian](https://www.debian.org/doc/)
