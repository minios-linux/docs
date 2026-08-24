# Inicio rápido

Esta guía cubre la descarga, escritura, arranque y la configuración inicial de MiniOS.

## 1. Elige una edición

- **Minimum** ofrece un conjunto reducido de paquetes y el entorno Flux.
- **Standard** es la edición Xfce de uso general.
- **Toolbox** añade herramientas de administración, diagnóstico, almacenamiento y recuperación.
- **Ultra** incluye el conjunto de aplicaciones más amplio.

La disponibilidad de ediciones y escritorios varía según la versión. Consulta
[Acerca de MiniOS](/about/About-MiniOS.md) y la
[lista de paquetes](/administration/Packages.md) antes de descargar.

Descarga un ISO desde [minios.dev](https://minios.dev) o la
[página de lanzamientos en GitHub](https://github.com/minios-linux/minios-live/releases).
Verifica su suma de comprobación antes de usarlo; consulta
[Verificando descargas](/installation/Verifying-Downloads.md).

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

## 3. Entiende la persistencia antes de escribir

No todos los métodos de escritura o arranque crean persistencia.

- Una escritura de imagen sin procesar con `dd`, Etcher u otra herramienta similar reproduce el ISO. Por sí sola, no configura una sesión persistente.
- Ventoy normalmente arranca el ISO como un archivo. La persistencia de MiniOS debe configurarse por separado.
- MiniOS Installer puede crear una instalación en vivo y configurar almacenamiento de sesión nativo, DynFileFS, sin procesar o cifrado con LUKS.
- Un arranque nuevo se ejecuta deliberadamente sin persistencia. Otras entradas del menú de arranque de MiniOS pueden reanudar, crear o seleccionar sesiones cuando hay almacenamiento escribible disponible.
- Una instalación nativa es un sistema instalado convencional y no utiliza la persistencia de sesión en vivo de la misma manera.

Consulta [Gestión de sesiones](/configuration/Session-Management.md) y [Parámetros de arranque](/configuration/Boot-Parameters.md) antes de modificar el almacenamiento de sesiones. Mantén una copia de seguridad de los archivos importantes, independientemente del modo de persistencia.

## 4. Arranca MiniOS

1. Apaga el ordenador y conecta el dispositivo preparado.
2. Abre el menú de arranque del firmware y selecciona la entrada UEFI o legacy del dispositivo.
3. Selecciona una sesión nueva para una prueba inicial de hardware, o una sesión persistente solo si ya ha sido configurada.
4. Confirma que gráficos, teclado, almacenamiento y red funcionan antes de realizar cambios de instalación destructivos.

Si el dispositivo no aparece en la lista o el escritorio no inicia, consulta
[Compatibilidad de hardware](/installation/Hardware-Compatibility.md) y
[Solución de problemas](/administration/Troubleshooting.md).

## 5. Configura el sistema

Abre **Aplicaciones > Sistema > Configurar MiniOS**, o ejecuta:

```bash
minios-configurator
```

El Configurador edita `/etc/live/config.conf`. Puede establecer la identidad de usuario, contraseñas, idioma, zona horaria, teclado, nombre de host, servicios, almacenamiento del directorio de usuario y controles de seguridad. No modifica el sistema en ejecución directamente; los ajustes guardados se aplican según la aplicabilidad de cada configuración, normalmente después de reiniciar o al crear una nueva sesión.

Los perfiles de seguridad rellenan configuraciones concretas para sudo, PolicyKit, SSH, XRDP, X11, sugerencias de contraseña, bloqueo de pantalla y acceso automático. Revisa los controles resultantes en vez de tomar el nombre del perfil como un ajuste en tiempo de ejecución. Consulta [Endurecimiento de seguridad](/administration/Security-Hardening.md) y la [guía del Configurador de MiniOS](/configuration/MiniOS-Configurator.md). La [referencia del archivo de configuración](/configuration/Configuration-File.md) documenta las claves subyacentes.

## 6. Instala software y guarda tu trabajo

Los cambios realizados con APT en una sesión en vivo solo se conservan tras reiniciar si la sesión es persistente. Los módulos SquashFS permanecen separados de la sesión escribible y pueden cargarse como parte del sistema modular; consulta [Creación de módulos](/development/Creating-Modules.md).

Guarda los archivos importantes en un almacenamiento conocido como escribible y prueba al menos un apagado y reinicio limpios antes de depender de una sesión persistente.

## Obtener ayuda

- [Optimización del rendimiento](/administration/Performance-Optimization.md)
- [Gestión de kernel](/administration/Kernel-Management.md)
- [Compilando MiniOS](/development/Building-MiniOS.md)
- [Reconstruyendo un ISO](/development/Rebuilding-ISO.md)
- [Incidencias en GitHub](https://github.com/minios-linux/minios-live/issues)
- [Código fuente de MiniOS](https://github.com/minios-linux/minios-live)
- [Documentación de Debian](https://www.debian.org/doc/)
