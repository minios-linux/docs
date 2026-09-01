---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# Compilando MiniOS

MiniOS se ensambla a partir de una imagen base de SquashFS, módulos de extensión ordenados, archivos de kernel y arranque, y configuración generada. Esta página describe las interfaces de compilación actuales del árbol de fuentes y las dependencias entre sus salidas.

Ejecute `./minios-cmd --help`, `./minios-live --help` y revise el `build.conf` seleccionado antes de compilar. Esos archivos son la referencia autorizada para la versión descargada.

## Requisitos

Compile en Debian o Ubuntu con suficiente espacio libre bajo `BUILD_DIR` y `/tmp`.
Un entorno de escritorio típico requiere al menos 20 GiB. Las operaciones de compilación requieren privilegios de root para debootstrap, chroots, montajes, dispositivos de bucle y creación de imágenes; mostrar la ayuda no los requiere.

La lista de paquetes del host autorizada es `linux-live/prerequisites.list`. Para el checkout actual se puede instalar con:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

En un checkout de fuentes, `minios-live` verifica esta lista antes de compilar, a menos que `SKIP_SETUP_HOST=true`. En un host normal informa los paquetes faltantes y se detiene; la instalación automática solo se usa en la ruta de compilación en contenedor.

La configuración predeterminada comprueba la conectividad a Internet. Esta comprobación se puede desactivar con `CHECK_INTERNET_CONNECTION=false` y se omite si hay un repositorio de caché APT preparado, pero todos los paquetes y archivos de arranque requeridos deben estar disponibles desde los repositorios o cachés configurados.

Si `USE_APT_CACHER=true`, ya debe estar configurado un servicio apt-cacher-ng accesible en `APT_CACHER_ADDRESS`; de lo contrario, establezca la opción en `false` antes de compilar.

::: danger Confianza en el arranque
La ruta de arranque actual llama a debootstrap con `--no-check-gpg` y descarga la clave de archivo MiniOS por HTTP sin autenticación. No utilice la imagen resultante como artefacto de lanzamiento confiable hasta que estas rutas de origen exijan verificación autenticada de clave y arranque.
:::

## Compilación rápida

Clona el repositorio y ejecuta el frontend desde su raíz:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Las cuatro opciones de destino son obligatorias cuando no se selecciona un archivo de configuración:

| Opción | Valor |
| --- | --- |
| `-d`, `--distribution` | Suite de distribución de destino |
| `-a`, `--architecture` | Arquitectura de destino |
| `-de`, `--desktop-environment` | Entorno de módulos |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox` o `ultra` |

Los valores actualmente soportados para distribución, arquitectura, escritorio, compresión y variante se listan en `linux-live/build.conf`. No asumas soporte por ejemplos de comandos antiguos.

## Interfaces de compilación

### `minios-cmd`

`minios-cmd` copia la plantilla de configuración al directorio de trabajo de destino, escribe los ajustes del frontend en esa copia e inicia toda la canalización `minios-live -`. Las opciones comunes incluyen:

| Opción | Efecto |
| --- | --- |
| `-b`, `--build-dir` | Seleccionar la raíz de salida de la compilación |
| `-c`, `--compression-type` | Seleccionar compresión SquashFS |
| `-kp`, `--kernel-provider` | Seleccionar `distribution` o `minios` |
| `-kf`, `--kernel-flavour` | Seleccionar un sabor de kernel de distribución |
| `-mk`, `--minios-kernel` | Seleccionar el proveedor de kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Seleccionar `auto`, `6.1` o `6.12` e implica el proveedor MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleccionar `runtime` o `full` |
| `-dkms`, `--kernel-build-dkms` | Compilar drivers opcionales para el kernel seleccionado |
| `-l`, `--locale` | Definir el locale del sistema |
| `-ml`, `--multilingual` | Generar múltiples locales |
| `-kl`, `--keep-locales` | Conservar los locales disponibles |
| `-tz`, `--timezone` | Definir la zona horaria del sistema live |
| `-ib`, `--initramfs-builder` | Seleccionar `livekit` o `dracut` |
| `-mln`, `--menu-language` | Seleccionar el idioma del menú de arranque |

Por ejemplo:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Generar una configuración sin iniciar la compilación:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sin otro destino, esto escribe `build/build.conf`. El frontend aún requiere privilegios de root en este modo.

`--config-file FILE` selecciona una configuración para copiar. La implementación actual luego escribe los valores analizados de línea de comandos y los valores predeterminados no vacíos del frontend en la copia de trabajo, a pesar de la redacción más breve en `--help`. Para una configuración exacta y mantenida manualmente, ejecuta `minios-live` directamente e inspecciona el archivo activo en vez de depender de la fusión del frontend.

No combines `--config-only` con `--config-file` apuntando a una configuración existente: el modo solo-configuración copia la plantilla predeterminada sobre esa ruta.
Utiliza `-b DIR --config-only` para elegir un destino generado aparte.

### `minios-live`

`minios-live` es el backend en etapas. En un checkout de fuentes lee `linux-live/build.conf` por defecto; una copia instalada lee `/etc/minios-live/build.conf`. Selecciona un archivo diferente y la raíz de salida mediante variables de entorno:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Utiliza una ruta absoluta de `BUILD_CONF` a través de `sudo`. Los archivos de configuración se interpretan como Bash, así que usa solo archivos de confianza. El backend no tiene flags para sobrescribir variables individuales de configuración.

## Etapas de compilación

La canalización se ejecuta en este orden:

1. `build-bootstrap` crea la raíz mínima de destino con debootstrap.
2. `build-chroot` instala y configura el sistema base.
3. `build-live` crea el módulo `00-core` SquashFS.
4. `build-modules` construye los módulos ordenados del entorno seleccionado.
5. `build-boot` genera los archivos de initramfs, kernel, EFI y bootloader.
6. `build-config` genera MiniOS y la configuración de arranque.
7. `build-iso` publica el ISO booteable y el checksum.
8. `remove-sources` elimina el directorio de trabajo seleccionado cuando está configurado.

Se aceptan tanto los nombres con guion como las formas con guion bajo mostradas arriba.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

Un comando parcial no recrea las entradas omitidas. `build-iso` solo empaqueta el árbol de imagen preparado y `build-modules` no puede recrear `00-core`. Reconstruye desde la última etapa dependiente después de cambiar un productor anterior.

Una canalización completa comienza con `build-bootstrap`, que elimina los directorios `core/` y `image/` existentes del destino seleccionado. Conserva cualquier contenido no regenerable antes de comenzar; los árboles de destino generados son salidas de compilación, no almacenamiento fuente duradero.

Si `REMOVE_SOURCES=true`, la etapa final `remove-sources` elimina y recrea todo el directorio de trabajo `build/<distribution>-<variant>-<architecture>/`, no solo los archivos fuente descargados. Los ISOs publicados, cachés compartidos y logs fuera de ese directorio permanecen.

## Configuración

`linux-live/build.conf` controla la identidad del destino, kernel, locale, gestor de arranque, usuario live, servicios, cachés, instantáneas, limpieza y publicación. Los grupos importantes incluyen:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT` y `PACKAGE_VARIANT` seleccionan el destino y la cadena de módulos.
- `COMP_TYPE` controla la compresión SquashFS.
- `KERNEL_*` y `MINIOS_KERNEL_SERIES` controlan la adquisición y el payload del kernel.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG` y `SERIAL_CONSOLE` controlan los artefactos de arranque.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO` y `USE_APT_CACHER` controlan las entradas reutilizables.
- `VERBOSITY_LEVEL` acepta `0`, `1` o `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES` y `BUILD_TEST_ISO` controlan la publicación y limpieza.

No edites un `build/<target>/build.conf` generado como sustituto de mantener la configuración fuente seleccionada.

### Selección de kernel

El proveedor `distribution` resuelve el kernel Debian o Ubuntu seleccionado y, cuando DKMS está habilitado, los encabezados coincidentes en un estado APT firmado e independiente.
`KERNEL_AUTO_SELECT=true` deriva su suite de origen y arquitectura del destino de espacio de usuario. Establécelo en `false` para usar los campos manuales de distribución, arquitectura, versión, snapshot y política de actualización en `build.conf`.

El proveedor `minios` instala `linux-image-SERIES-mos-ARCH`, verifica el soporte AUFS y utiliza los encabezados MiniOS correspondientes para DKMS. Requiere `KERNEL_FLAVOUR=none` y arquitecturas coincidentes de espacio de usuario y paquete de kernel.
En el código actual, `MINIOS_KERNEL_SERIES=auto` se resuelve como `6.12`; usa `6.1` explícitamente cuando se requiera esa serie.

`KERNEL_PAYLOAD_MODE=runtime` conserva el árbol de módulos del kernel, la configuración del kernel, `System.map`, metadatos de despliegue e integración en tiempo de ejecución bajo `modprobe.d`, `modules-load.d` y `udev/rules.d`. Elimina solo el estado de paquetes de compilación, encabezados, fuentes DKMS, herramientas de compilación y paquetes de initramfs. El firmware sigue siendo propiedad de `02-firmware`. `full` conserva un payload de diagnóstico más amplio.

## Sistema de módulos

Las fuentes de los módulos se encuentran bajo `linux-live/scripts/`. Un entorno bajo `linux-live/environments/<desktop>/` contiene enlaces simbólicos ordenados a las fuentes que utiliza. El nombre local del entorno controla el orden de compilación y puede renumerar una fuente compartida, por ejemplo:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` es producido por `build-live` y no es un enlace de entorno ordinario.
Los módulos `01` y superiores son acumulativos: cada uno se construye sobre los módulos inferiores aplicables. `skip_conditions.conf` puede omitir entradas para un destino, así que inspecciona el entorno seleccionado en vez de asumir una cadena universal.

Utiliza `linux-live/scripts/10-example/` como plantilla de autoría actual. Un módulo puede contener:

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

Solo se requieren los archivos necesarios para el módulo. `build`, `postinstall`, condiciones de omisión, parches y árboles rootcopy son opcionales. `build` y `patches/` no están disponibles para `00-core`.

La propiedad del host en los árboles rootcopy no se conserva; los archivos copiados normalmente pasan a ser `root:root`. Un manifiesto `.minios-ownership` dentro de un árbol rootcopy utiliza:

```text
owner:group relative/path
```

Las rutas deben permanecer dentro del árbol. El host aplica el manifiesto inmediatamente y resuelve los nombres usando la base de datos de cuentas del host. Usa valores numéricos `UID:GID` para cuentas solo de destino, o define la propiedad desde `install` o `postinstall` dentro del chroot. Mover el manifiesto a `rootcopy-postinstall/` no cambia la resolución de nombres.

Como la comprobación de contención actual no canoniza la ruta de destino, nunca uses componentes `..` ni componentes de enlaces simbólicos en las rutas del manifiesto. Inspecciona los árboles rootcopy antes de una compilación con privilegios; una ruta manipulada puede hacer que `chown` en el host escape del árbol copiado.

Para los paquetes, los scripts de instalación de módulos ordinarios usan los archivos copiados al chroot por `build-modules`:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Consulta [CondinAPT](/development/CondinAPT) para la sintaxis de listas de paquetes y el mapa de filtros actual de MiniOS.

### Añadir un módulo

Copia la plantilla y luego enlázala en cada entorno deseado con la posición local de entorno deseada:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adapta `packages.list`, scripts, metadatos y contenido rootcopy antes de compilar.
Valida cada escritorio, variante, distribución y arquitectura declarados.

## Reconstrucción segura

Los artefactos de módulos existentes se omiten. Cuando cambia un módulo acumulativo inferior, elimina su artefacto y toda la cola de módulos superiores antes de ejecutar `build-modules`; mantener los módulos superiores preservaría contenido construido contra la capa inferior antigua. Identifica los artefactos por el orden del entorno seleccionado y el nombre del módulo porque las condiciones de omisión pueden cerrar huecos en la numeración.

La capa del kernel es un caso especial. Para reconstruir solo `01-kernel`, elimina su artefacto para el destino seleccionado y recompila desde los módulos hasta la publicación:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Confirma la ruta de destino antes de eliminar. No apliques este atajo a `00-core` ni asumas que es seguro para los módulos `02` y superiores.

Para un módulo ordinario como `03-gui-base`, elimina su artefacto y todos los artefactos de módulos posteriores aplicables, luego ejecuta el mismo rango `build-modules -`. Para cambios solo en initramfs, EFI o arranque, deja los módulos SquashFS en su lugar y ejecuta:

```bash
sudo ./minios-live build-boot -
```

Utiliza una compilación completa después de cambios en `00-core`, configuración de bootstrap/chroot, identidad de destino, política de repositorios u otra entrada que no pueda aislarse a una etapa posterior.

## Salidas y registros

Con el valor predeterminado `BUILD_DIR`, las rutas importantes son:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` y `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Los nombres de los ISOs dependen de la configuración de compilación, el modo de lanzamiento y las marcas de tiempo. Utiliza la ruta que imprime la compilación exitosa en vez de predecir el nombre base completo.

## Secretos y artefactos de depuración

No coloques un token de Ubuntu Pro en el control de versiones, documentación, historial de shell ni registros compartidos. Prefiere una configuración privada fuera del repositorio:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Define `USE_UBUNTU_PRO=true` y `UBUNTU_PRO_TOKEN=...` solo en ese archivo. La compilación elimina el estado Pro de la imagen, pero el archivo en el host sigue conteniendo el secreto.

`DEBUG_SSH_KEYS=true` genera material de clave privada para depuración. Trata la imagen resultante como desechable y nunca la publiques sin verificar que la clave esté ausente.

Cambiar la opción de nuevo a `false` no elimina las claves ya generadas en `build/<target>/image/minios/debug_ssh_key`, los archivos `authorized_keys.*` adyacentes ni `build/<target>/debug_ssh_key`. Usa un destino limpio o elimina esos archivos explícitamente, luego revisa el árbol ISO antes de publicar.

## Resolución de problemas

- Los fallos de bootstrap suelen deberse a problemas de acceso a repositorios, soporte de debootstrap, arquitectura, snapshots o requisitos previos faltantes en el host.
- Los fallos en el núcleo y módulos suelen estar relacionados con la disponibilidad de paquetes, filtros CondinAPT, scripts de mantenimiento, contenido rootcopy o un módulo inferior obsoleto.
- Los fallos de arranque suelen involucrar el kernel seleccionado, el generador de initramfs, adquisición de EFI, generación de GRUB/SYSLINUX o entradas de arranque faltantes.
- Los fallos de ISO suelen deberse al árbol de imagen preparado, xorriso, espacio de salida o configuración de limpieza.

Tras una compilación interrumpida con privilegios, inspecciona los montajes bajo el directorio de trabajo de destino antes de reintentar. Lee el correspondiente `build/log/build-*.log`; no repares overlays generados ni archivos `.sb` en el lugar.

## Documentación relacionada

- [Gestión de módulos](/preparing-and-customizing/Managing-Modules)
- [Composición de imágenes personalizadas](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
