---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gestión de kernels

El Gestor de kernels de MiniOS empaqueta, inspecciona, activa y elimina conjuntos de kernels para el sistema modular en vivo de MiniOS. Un kernel de MiniOS es un conjunto coordinado: la imagen del kernel, su initramfs y el módulo correspondiente,`01-kernel-<version>.sb` que deben mantenerse juntos.

Este flujo de trabajo solo aplica a la arquitectura en vivo. Una instalación nativa utiliza los paquetes de kernel estándar de Debian o Ubuntu, las herramientas habituales de initramfs y el gestor de arranque instalado.

## Qué hace el Gestor de kernels

La interfaz gráfica**Gestor de kernels de MiniOS** y la`minios-kernel` CLI utilizan el mismo backend. Permiten:

- listar los kernels empaquetados y distinguir entre las versiones en ejecución, activas e inactivas;
- empaquetar un kernel versionado real desde los repositorios APT configurados;
- empaquetar un conjunto coherente de archivos locales de kernel`.deb`;
- agregar opcionalmente controladores seleccionados del catálogo curado de MiniOS DKMS al empaquetar un kernel de repositorio;
- generar el initramfs correspondiente de MiniOS y el módulo de kernel de SquashFS;
- preparar los conjuntos completos en el repositorio de kernels MiniOS;
- activar un conjunto completo para el próximo arranque y actualizar la configuración del gestor de arranque compatible;
- eliminar un kernel empaquetado inactivo.

El Gestor de kernels no compila cualquier árbol de código fuente de kernel. Si necesitas modificar los propios insumos de compilación del kernel MiniOS, utiliza el flujo de trabajo de compilación desde el código fuente MiniOS.

## Iniciar el gestor gráfico

Inícialo desde el menú de aplicaciones MiniOS o ejecuta:

```bash
minios-kernel-manager
```

La aplicación separa la gestión de kernels instalados del empaquetado. Los kernels de repositorio pueden buscarse por nombre de paquete o por versión mostrada del kernel. Los controles de paquetes no están disponibles cuando la raíz MiniOS detectada no es escribible.

Las operaciones privilegiadas del backend utilizan PolicyKit. La`minios-kernel` CLI independiente requiere permisos de root para todos los comandos excepto ayuda.

## Empaquetar un kernel de repositorio

Selecciona**Repositorio** en la vista de empaquetado y elige un paquete de kernel versionado real, por ejemplo:

```text
linux-image-6.12.107+deb13-amd64
```

Los metapaquetes de seguimiento como`linux-image-amd64` no se aceptan como fuente del paquete. El modo repositorio utiliza las fuentes APT configuradas en el sistema en ejecución, la configuración de confianza y las listas de paquetes. Las dependencias divididas de kernel versionado se resuelven automáticamente cuando la distribución las utiliza.

La interfaz gráfica no ejecuta`apt update` solo porque las listas de paquetes estén desactualizadas. Actualízalas manualmente cuando sea necesario, o utiliza`--force-update` con la CLI.

### Agregar controladores DKMS seleccionados

El empaquetado desde repositorio puede añadir controladores seleccionados del catálogo MiniOS`01-kernel` DKMS. La interfaz gráfica muestra las opciones compatibles para el kernel seleccionado; la CLI acepta una opción repetible`--dkms-driver` :

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Los controladores seleccionados se construyen en un entorno aislado overlay/chroot con los encabezados correspondientes. El backend verifica que los módulos generados coincidan con el kernel objetivo antes de incluirlos y registra el origen del controlador dentro del conjunto bajo`/usr/share/minios/kernel-dkms/`.

Esta es una función de compatibilidad curada, no una interfaz genérica para DKMS. Los paquetes de kernel locales manuales no permiten seleccionar controladores porque no se pueden inferir de forma fiable los encabezados correspondientes del repositorio.

## Empaquetar kernels locales

Para un kernel local, proporciona todos los archivos necesarios de`.deb` la misma compilación de kernel:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian y Ubuntu pueden dividir un kernel en varios paquetes. El backend verifica que la imagen, los módulos, el paquete base y los módulos-extra opcionales proporcionados formen una versión coherente, en lugar de combinar silenciosamente revisiones no relacionadas.

## Salida y compresión del empaquetado

El empaquetado genera la imagen del kernel, el initramfs y el módulo de kernel SquashFS. Parte de la metainformación seleccionada del paquete se conserva dentro del módulo bajo`/usr/share/minios/kernel-dpkg/`.

La compresión predeterminada SquashFS es`zstd`. Otros métodos solo se ofrecen si las herramientas necesarias están disponibles; actualmente se admite`lz4`,`lzo`,`gzip`,`lzma`,`xz`, y`bzip2`.

Cuando se detecta una raíz MiniOS escribible y la salida solicitada está en otro lugar, el conjunto finalizado se prepara de forma atómica en:

```text
<MiniOS-root>/kernels/<version>/
```

Las descargas de repositorio son insumos temporales de compilación y se eliminan tras finalizar o manejar un empaquetado fallido. Los insumos locales de`.deb` permanecen bajo responsabilidad del usuario.

## Compatibilidad con persistencia cifrada

Si el initramfs en ejecución MiniOS anuncia persistencia LUKS en capas, un kernel de reemplazo debe conservar la ruta de arranque dm-crypt. El initramfs generado se revisa para asegurar el soporte necesario de cryptsetup, el módulo dm-crypt y el marcador de capacidad criptográfica MiniOS.

El empaquetado falla en lugar de generar un conjunto de kernel que haría que una sesión con persistencia cifrada no pudiera arrancar.

## Activar y eliminar kernels

La vista de gestión distingue:

- **EN EJECUCIÓN** — el kernel que se está ejecutando en el arranque actual;
- **ACTIVO** — el paquete completo seleccionado para el próximo arranque;
- **DISPONIBLE** — otro paquete disponible en el repositorio MiniOS.

La activación requiere una entrada completa en el repositorio. Prepara la imagen del kernel, el initramfs, el módulo activo SquashFS, el marcador de versión activa y los cambios en el gestor de arranque como una sola operación coordinada. Se requiere la configuración de GRUB; la configuración nativa de SYSLINUX se actualiza si está presente. Si la activación falla, los archivos de arranque preparados se revierten.

La activación solo modifica el próximo arranque; no reinicia el sistema actual. Mantén al menos un paquete completo comprobado hasta que el reemplazo haya iniciado correctamente.

Elimina solo un kernel empaquetado inactivo que ya no necesites. No mezcles manualmente una imagen de kernel, initramfs o `01-kernel-*.sb` de diferentes paquetes.

<a id="command-line-reference"></a>

## Referencia de línea de comandos

Los comandos habituales son:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Empaquetar desde un repositorio o archivos locales:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Agrega`--json` para salida estructurada. Consulta la ayuda y el manual instalados para ver las opciones exactas que ofrece la versión en ejecución:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Estructura de almacenamiento

El Gestor de kernels detecta la raíz de contenido MiniOS en lugar de asumir un nombre específico de dispositivo de bloque. Las rutas gestionadas son relativas a esa raíz:

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
La ruta canónica del módulo en tiempo de ejecución es`/lib/modules/<version>`. En sistemas usrmerged esto se resuelve en`/usr/lib/modules/<version>`; en estructuras más antiguas puede almacenarse físicamente en`/lib`. El empaquetado rechaza un árbol de módulos de la misma versión ya presente en lugar de mezclarlo con una revisión diferente del paquete.

## Recuperación tras un kernel defectuoso

Si un kernel recién activado falla, inicia un conjunto completo de kernel MiniOS conocido y funcional si aún está disponible. No repares la instalación copiando archivos individuales de kernel, initramfs o SquashFS desde otra imagen: esos archivos forman un conjunto coordinado.

Si no queda ningún conjunto completo conocido y funcional, inicia un medio de rescate confiable, resguarda los datos importantes y reinstala o restaura la instalación afectada de MiniOS. Consulta[Solución de problemas](/maintenance-and-recovery/Troubleshooting) y[Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentación relacionada

- [Arquitectura del sistema MiniOS](/reference/System-Architecture)
- [Carga de módulos en initrd](/reference/boot-process/Module-Loading)
- [Compilación de MiniOS](/development/Building-MiniOS)
- [Solución de problemas](/maintenance-and-recovery/Troubleshooting)
