# Comandos de compilación

MiniOS ofrece dos interfaces de compilación por línea de comandos. Ejecuta los comandos desde el directorio fuente `minios-live` a menos que uses una copia instalada.

- `minios-cmd` es el frontend. Acepta opciones comunes de destino, genera una configuración funcional e inicia una compilación completa.
- `minios-live` es el backend por etapas. Lee una configuración de compilación y ejecuta una etapa, un rango inclusivo de etapas o toda la canalización.

Utiliza `./minios-cmd --help`, `./minios-live --help` y el `build.conf` activo para la versión instalada. Estos son la referencia cuando los ejemplos o la documentación antigua discrepan. Los valores de destino admitidos pueden cambiar, por lo que esta página no define una matriz de soporte.

## Requisitos de root

Mostrar la ayuda no requiere permisos de root:

```bash
./minios-cmd --help
./minios-live --help
```

Las operaciones de compilación requieren root porque utilizan debootstrap, chroots, montajes y herramientas de creación de imágenes. El frontend actual también verifica permisos de root antes de escribir una configuración con `--config-only`.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

El backend verifica e instala los prerrequisitos del host listados en `linux-live/prerequisites.list` a menos que `SKIP_SETUP_HOST=true` esté definido en la configuración.

## Compilaciones con el frontend

Una invocación normal de `minios-cmd` requiere las cuatro opciones de selección de destino:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Por ejemplo:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Las opciones comunes incluyen compresión, comportamiento del kernel, configuración regional, zona horaria, generador de initramfs, idioma del menú de arranque y directorio de compilación. Consulta `./minios-cmd --help` en vez de asumir que una opción existe.

El frontend copia la plantilla de configuración, escribe los valores proporcionados en la copia e invoca `minios-live -`. Por defecto, la copia de trabajo para este ejemplo es:

```text
build/trixie-standard-amd64/build.conf
```

Genera una configuración sin iniciar la compilación:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sin otro destino, esto escribe `build/build.conf`.

`--config-file FILE` selecciona un archivo de configuración. La ayuda actual del comando indica que todas las demás opciones se ignoran en este modo, así que no lo combines con opciones de destino o ajuste:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

En modo de opciones del frontend, los valores explícitos de la línea de comandos sobrescriben los valores correspondientes de la plantilla. En modo archivo de configuración, trata el archivo seleccionado como la entrada de configuración en vez de intentar sobrescribirlo con otras opciones del frontend.

## Configuración del backend

En un checkout de código fuente, `minios-live` lee `linux-live/build.conf` por defecto. Una copia instalada utiliza `/etc/minios-live/build.conf`. El backend carga el archivo seleccionado antes de calcular las rutas de destino y no tiene opciones de línea de comandos para sobrescribir configuraciones individuales.

Selecciona un archivo diferente mediante `BUILD_CONF`. Usa una ruta absoluta al cruzar el límite de `sudo`:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` selecciona otra raíz de salida de compilación:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

No edites archivos generados bajo un directorio de trabajo de destino como sustituto de mantener la configuración seleccionada. Consulta `linux-live/build.conf` para opciones avanzadas de kernel, gestor de arranque, localización, caché, instantáneas, módulos, limpieza y publicación.

## Etapas del backend

Las etapas se ejecutan en este orden:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Los nombres de etapas con guiones mostrados en la ayuda son aceptados por el script.

Ejecutar toda la canalización:

```bash
sudo ./minios-live -
```

Ejecutar solo una etapa:

```bash
sudo ./minios-live build-iso
```

Ejecutar un rango inclusivo:

```bash
sudo ./minios-live build-chroot - build-live
```

Ejecutar desde la primera etapa hasta una etapa seleccionada:

```bash
sudo ./minios-live - build-live
```

Ejecutar desde una etapa seleccionada hasta la última etapa:

```bash
sudo ./minios-live build-modules -
```

Estos ejemplos del backend usan el destino seleccionado en la configuración activa. Para los ejemplos de esta página, primero define `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` y `PACKAGE_VARIANT="standard"`.

## Dependencias entre etapas

Un comando parcial no vuelve a crear los resultados de etapas anteriores omitidas. Las etapas posteriores consumen el sistema de archivos raíz, los módulos SquashFS, los archivos de arranque y la configuración producidos por las etapas previas.

Por lo tanto, recompilar una etapa anterior puede volver obsoletos todos los resultados dependientes posteriores. Reconstruye hasta la última etapa afectada y no conserves módulos de número superior después de cambiar un módulo inferior sobre el que fueron construidos. En particular, `build-iso` empaqueta datos de imagen preparados previamente; no recompila esos datos.

Utiliza una compilación completa para un nuevo destino o cuando no existan los resultados previos requeridos:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Salidas y registros

Con la configuración y raíz de compilación predeterminadas del checkout, el ejemplo trixie utiliza estas ubicaciones verificadas:

- `build/trixie-standard-amd64/core/` para el sistema de archivos principal mutable
- `build/trixie-standard-amd64/image/` para el árbol ISO preparado
- `build/trixie-standard-amd64/image/minios/` para los módulos y el payload de MiniOS generados
- `build/iso/` para los archivos ISO y sus archivos auxiliares `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` para el registro de compilación capturado

Todas las rutas son relativas a `BUILD_DIR`. Los nombres base de los ISO incluyen la configuración de compilación y, para compilaciones que no son de lanzamiento, una marca de tiempo; utiliza la ruta impresa por la compilación exitosa en vez de predecir el nombre completo del archivo.

## Tokens de Ubuntu Pro

`--ubuntu-pro-token` habilita el uso de Ubuntu Pro durante una compilación con el frontend. El código de compilación se adjunta dentro del chroot, luego se desanexa y elimina el estado de Pro, la autenticación de repositorios, preferencias y rastros de keyring antes de crear la imagen. Esta limpieza no hace que el token sea seguro para exponerlo en el host.

No incluyas un token real en la documentación, control de versiones, historial de shell, salida de CI o una línea de comandos compartida. Prefiere un archivo de configuración privado fuera del repositorio, restríngelo solo a su propietario y pasa únicamente su ruta:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Define `USE_UBUNTU_PRO="true"` y `UBUNTU_PRO_TOKEN="..."` en ese archivo privado. Protege y elimina cualquier configuración de trabajo en el host que contenga el token cuando ya no sea necesario, y verifica que no haya token ni datos de autenticación de Pro presentes en los artefactos publicados.
