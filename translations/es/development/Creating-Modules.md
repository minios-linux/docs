# Creación de módulos

Los módulos en MiniOS son paquetes autónomos de archivos y configuraciones que amplían la funcionalidad del sistema base. Son similares a los paquetes en otras distribuciones Linux, pero están diseñados para superponerse unos sobre otros, permitiendo un sistema flexible y personalizable. Este enfoque por capas facilita la personalización, el retroceso de cambios y el intercambio de configuraciones.

Para obtener el contexto completo del proceso de construcción de MiniOS y la arquitectura del sistema, consulta la [Guía de construcción de MiniOS](/development/Building-MiniOS.md). Para información sobre el sistema de gestión de paquetes CondinAPT utilizado en los módulos, consulta la [Documentación de CondinAPT](/development/CondinAPT.md).

Existen varias utilidades para crear módulos en MiniOS. Todas están diseñadas para usarse desde la terminal y requieren privilegios de root.

**Utilidades para la creación de módulos:**

**apt2sb** - instala paquetes desde los repositorios y los empaqueta en un módulo.<br>
**script2sb** - ejecuta las acciones descritas en el script y empaqueta el resultado en un módulo.<br>
**chroot2sb** - abre un entorno chroot, permitiéndote realizar cualquier acción en él; al salir, guarda el resultado en el módulo.<br>

**Utilidades adicionales para la gestión de módulos:**

**dir2sb** - convierte un directorio existente en un módulo comprimido.<br>
**sb2dir** - convierte un módulo comprimido en un directorio para su inspección.<br>
**rmsbdir** - elimina un directorio de módulo creado por sb2dir.<br>
**savechanges** - guarda todos los archivos modificados del sistema en un paquete de sistema de archivos comprimido.<br>
**sb2iso** - genera una imagen ISO de MiniOS, permitiendo añadir o excluir módulos.<br>
**sb** - interfaz integral para gestionar paquetes de MiniOS (activar, desactivar, listar, convertir).<br>

**Características comunes de las utilidades de creación de módulos:**
- Soporte para diferentes tipos de compresión: zstd (por defecto), gzip, lzo, xz
- Extensión de archivo de módulo personalizable (por defecto: sb)
- Filtrado por niveles para controlar qué módulos existentes incluir como dependencias
- Nombres personalizados para los módulos de salida
- Todas las utilidades deben ejecutarse como root

## apt2sb

Para construir un módulo usando apt2sb, simplemente lista los paquetes que deseas incluir en el módulo, por ejemplo: `apt2sb install chromium chromium-sandbox`. Ejecutar este comando en la carpeta donde se lanzó generará un módulo chromium.sb que contendrá el navegador Chromium. Este módulo se construirá en relación a todos los módulos que estén cargados en el sistema, lo que significa que requerirá de todos ellos para funcionar, ya que las bibliotecas necesarias para el programa pueden estar ya instaladas en el sistema y encontrarse en los módulos inferiores.

Usando la opción `-l`/`--level` podemos especificar sobre qué módulo superior queremos construir nuestro módulo. Por ejemplo, el comando `apt2sb install -l 4 chromium chromium-sandbox` filtrará todos los módulos numerados 04 y superiores al construir, es decir, el módulo se construirá en base a los módulos numerados 00-03. Como resultado de este comando, obtendremos el módulo 04-chromium.sb en la carpeta desde la que se ejecutó el comando. Este módulo tendrá un tamaño mayor que el del ejemplo anterior porque incluirá todas las bibliotecas necesarias para ejecutar el programa, que podrían estar en módulos con números 04 y superiores, pero podrá ejecutarse tanto si existen módulos 04-xx como si no.

El nombre del módulo se genera automáticamente, basado en el nombre del primer paquete especificado (en este caso, chromium) y, si se indica la opción --level, el número de nivel. Si deseas especificar el nombre del módulo manualmente, puedes usar la opción `-n`/`--name`, por ejemplo: `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Opciones adicionales disponibles en apt2sb:**

- `-c`/`--comp` - Tipo de compresión (zstd, gzip, lzo, xz). Por defecto: zstd
- `-b`/`--bext` - Extensión del paquete. Por defecto: sb
- `-y`/`--yes` - Responde automáticamente sí a las preguntas
- `--allow-downgrades` - Permite la instalación de versiones anteriores de paquetes
- `--install-recommends` - Considera los paquetes recomendados como dependencias para la instalación
- `--install-suggests` - Considera los paquetes sugeridos como dependencias para la instalación
- `--no-install-recommends` - No considera los paquetes recomendados como dependencias para la instalación
- `--no-install-suggests` - No considera los paquetes sugeridos como dependencias para la instalación
- `-t`/`--target-release` - Versión por defecto desde la que instalar los paquetes

apt2sb también cuenta con el comando `upgrade` que permite actualizar los paquetes ya instalados. El comando upgrade utiliza las mismas opciones que install.

## script2sb

Para construir un módulo usando script2sb, necesitas escribir un script bash que describa los pasos necesarios para crear tu módulo. Esto es útil si necesitas realizar algunas acciones en el sistema de archivos, importar claves, añadir un repositorio, etc. antes o después de la instalación. Aquí tienes un ejemplo de dicho script:
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
Para ejecutar la construcción con este script (llamémoslo caddy.sh), debes ejecutar el comando `script2sb -s ./caddy.sh`.

**Opciones disponibles para script2sb:**

- `-s`/`--script` - Usar ARCHIVO como script de instalación (obligatorio)
- `-l`/`--level` - Usar NIVEL como filtro de nivel
- `-n`/`--name` - Usar NOMBRE como nombre del archivo para el módulo
- `-c`/`--comp` - Tipo de compresión (zstd, gzip, lzo, xz). Por defecto: zstd
- `-b`/`--bext` - Extensión del paquete. Por defecto: sb
- `-d`/`--directory` - Copia el contenido de DIR en la raíz del módulo

Si no se especifica un nombre para el módulo, el nombre se genera en base al número de nivel, si se indica, y al nombre del script. Un ejemplo de ejecución usando estas opciones sería: `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

Además de estas opciones, puedes utilizar la opción `-d`/`--directory`. Si se especifica esta opción, el contenido de la carpeta indicada en el argumento se copiará a la raíz del módulo antes de ejecutar el script. Los archivos en esa carpeta deben estar organizados como si fueran en la carpeta raíz del sistema. Por ejemplo, si necesitas colocar un acceso directo de algún programa en el menú, crea una carpeta llamada mymodule y genera una estructura en ella relativa a la raíz del sistema:
```
mkdir -p /home/user/mymodule/usr/share/applications
```
En la carpeta mymodule/usr/share/applications debes colocar el archivo .desktop que se empaquetará en el módulo después de completar la construcción y ejecutar el comando de construcción:
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

La utilidad `chroot2sb` se utiliza para crear un entorno chroot interactivo. Esto te permite realizar manualmente *cualquier* acción necesaria para construir tu módulo (instalar paquetes, editar archivos, ejecutar comandos, etc.). Una vez que salgas del entorno chroot, los cambios realizados se empaquetan en un módulo.

**Opciones disponibles para chroot2sb:**

- `-l`/`--level` - Usar NIVEL como filtro de nivel  
- `-n`/`--name` - Usar NOMBRE como nombre del archivo para el módulo
- `-c`/`--comp` - Tipo de compresión (zstd, gzip, lzo, xz). Por defecto: zstd
- `-b`/`--bext` - Extensión del paquete. Por defecto: sb
- `-d`/`--directory` - Copia el contenido de DIR en la raíz del módulo

Si no se especifica un nombre de módulo, el nombre se genera en base al número de nivel, si se indica, y la fecha y hora actual en formato YYYYMMDD-HHMM.

También puedes utilizar la opción `-d`/`--directory`, igual que en `script2sb`. Si se especifica esta opción, el contenido de la carpeta indicada se copiará a la raíz del módulo *antes* de entrar en el entorno chroot. Esto proporciona un punto de partida para tus personalizaciones.

**Ejemplo de uso:**

- Chroot básico, nombre de módulo automático: `chroot2sb`
- Especificar nivel y compresión: `chroot2sb -l 3 -c gzip`
- Especificar nivel, nombre y compresión: `chroot2sb -l 3 -n 04-my-module.sb -c xz`
- Copiar archivos desde un directorio antes de entrar a chroot: `chroot2sb -d /path/to/my/files`

Después de ejecutar el comando `chroot2sb`, entrarás en un entorno chroot. Allí podrás realizar cualquier acción que necesites. Cuando termines, escribe `exit` para salir del entorno chroot. `chroot2sb` empaquetará entonces los cambios en un módulo. Los comandos ejecutados dentro del chroot *no* se guardan como parte del proceso de instalación final del módulo. Es un snapshot del estado final del sistema de archivos. El historial de bash se elimina automáticamente del módulo.

## Utilidades adicionales para la gestión de módulos

Además de las utilidades para la creación de módulos, MiniOS proporciona varias herramientas para gestionar y trabajar con módulos existentes:

### dir2sb

La utilidad `dir2sb` se utiliza para convertir un directorio existente en un módulo comprimido. Esto es útil cuando ya tienes preparada una estructura de directorios con todos los archivos necesarios y quieres empaquetarla en un módulo sin ejecutar procesos de instalación.

**Opciones disponibles para dir2sb:**

- `-c`/`--comp` - Tipo de compresión (zstd, gzip, lzo, xz). Por defecto: zstd
- `-b`/`--bext` - Extensión del paquete. Por defecto: sb

**Uso:**

`dir2sb [OPCIONES] DIRECTORIO_ORIGEN [ARCHIVO_DESTINO]`

**Comportamiento:**

- Si `DIRECTORIO_ORIGEN` no tiene extensión .sb y no se llama 'squashfs-root', entonces el propio directorio se incluye en el módulo y `ARCHIVO_DESTINO` es obligatorio.
- Si no se especifica `ARCHIVO_DESTINO`, `DIRECTORIO_ORIGEN` se reemplaza por el nuevo archivo de módulo.

**Ejemplos:**

- Convertir un directorio preparado en un módulo: `dir2sb /path/to/my/prepared/files my-module.sb`
- Convertir el directorio squashfs-root (reemplaza el original): `dir2sb squashfs-root`
- Usar una compresión diferente: `dir2sb -c xz /path/to/files custom-module.sb`

Esta utilidad es especialmente útil cuando quieres:
- Empaquetar archivos y directorios preconfigurados
- Convertir el contenido extraído de un módulo de vuelta a un módulo
- Crear módulos a partir de estructuras de directorios preparadas manualmente

### sb2dir

La utilidad `sb2dir` convierte un módulo comprimido (.sb) en un directorio con el mismo nombre. Esto es útil para extraer e inspeccionar el contenido de un módulo.

**Uso:**

`sb2dir [archivo_fuente.sb] [directorio_salida_opcional]`

**Comportamiento:**

- Si se especifica el directorio de salida, este debe existir
- Si no se especifica el directorio de salida, se utiliza el nombre archivo_fuente.sb y el directorio se monta sobre tmpfs

**Ejemplos:**

- Extraer un módulo para examinar su contenido: `sb2dir mymodule.sb`
- Extraer a un directorio específico: `sb2dir mymodule.sb /tmp/extracted`

### rmsbdir

La utilidad `rmsbdir` elimina un directorio de módulo que fue creado por `sb2dir`. Esto limpia correctamente el montaje tmpfs si fue utilizado.

**Uso:**

`rmsbdir [directorio_fuente.sb]`

**Ejemplo:**

- Eliminar el directorio extraído de un módulo: `rmsbdir mymodule.sb`

### savechanges

La utilidad `savechanges` guarda todos los archivos modificados en el sistema en un paquete de sistema de archivos comprimido. Esto es útil para crear módulos a partir de cambios realizados en tiempo de ejecución.

**Opciones disponibles:**

- `-c`/`--comp` - Tipo de compresión (zstd, gzip, lzo, xz). Por defecto: zstd
- `-b`/`--bext` - Extensión del paquete. Por defecto: sb

**Uso:**

`savechanges [OPCIONES] archivo_destino.sb [directorio_cambios]`

Si no se especifica directorio_cambios, se utiliza `/run/initramfs/memory/changes`.

**Ejemplos:**

- Guardar todos los cambios actuales: `savechanges my-changes.sb`
- Guardar con otra compresión: `savechanges -c xz my-changes.sb`

### sb2iso

La utilidad `sb2iso` genera una imagen ISO de MiniOS, permitiendo añadir módulos específicos o excluir los existentes.

**Opciones disponibles:**

- `-e`/`--exclude` - Excluye cualquier ruta o archivo existente que coincida con REGEX
- `-n`/`--name` - Especifica el nombre del archivo ISO de salida (por defecto: minios-YYYYMMDD_HHMM.iso)

**Uso:**

`sb2iso [OPCIONES]... [MODULO.SB]...`

**Ejemplos:**

- Crear una ISO de MiniOS sin el módulo firefox.sb: `sb2iso -e 'firefox' -n minios_without_firefox.iso`
- Crear solo el núcleo en modo texto de MiniOS: `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

La utilidad `sb` proporciona una interfaz integral para la gestión de paquetes de MiniOS, incluyendo operaciones de activación, desactivación y conversión.

**Importante:** La utilidad `sb` requiere soporte de kernel para AUFS (Advanced multi layered UniFication FileSystem) para la mayoría de las operaciones. Si AUFS no está disponible en tu kernel, muchos comandos no funcionarán.

**Comandos disponibles:**

- `activate BUNDLE` - Activa un paquete de MiniOS
- `deactivate BUNDLE` - Desactiva un paquete de MiniOS activo  
- `list` - Lista los paquetes de MiniOS activos
- `savechanges` - Guarda los cambios realizados en tiempo de ejecución en el paquete
- `rm DIR` / `rmdir DIR` - Elimina un directorio de paquete desempaquetado
- `conv PATH` - Convierte un paquete .sb a directorio o viceversa

**Ejemplos:**

- Activar un módulo: `sb activate mymodule.sb`
- Desactivar un módulo: `sb deactivate mymodule.sb`
- Listar módulos activos: `sb list`
- Convertir módulo a directorio: `sb conv mymodule.sb`
- Convertir directorio a módulo: `sb conv mymodule/`

**Nota:** Los comandos `activate`, `deactivate` y `list` requieren soporte de kernel AUFS y privilegios de root. Los comandos `conv`, `rm` y `rmdir` funcionan sin AUFS pero igualmente requieren privilegios de root.

## Documentación relacionada

- **[Reconstrucción de ISO](/development/Rebuilding-ISO.md)** - Aprende cómo empaquetar tus módulos personalizados en imágenes ISO booteables usando `sb2iso`
- **[Construcción de MiniOS](/development/Building-MiniOS.md)** - Guía completa para construir MiniOS desde el código fuente con configuraciones personalizadas
