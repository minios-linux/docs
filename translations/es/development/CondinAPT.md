# CondinAPT: Una guía completa para la instalación condicional de paquetes

**CondinAPT** es una herramienta versátil para automatizar la instalación de paquetes en cualquier sistema basado en Debian (Debian, Ubuntu y sus derivados). Su característica principal es la capacidad de definir condiciones y reglas complejas para instalar cada paquete según configuraciones arbitrarias del sistema.

**Áreas de aplicación:**
- Sistemas de construcción de distribuciones Linux
- Automatización de la configuración de servidores y estaciones de trabajo
- Despliegue de diversas configuraciones del sistema
- Gestión de paquetes en contenedores Docker
- Pipelines de CI/CD para la preparación de entornos
- Creación de imágenes de instalación personalizadas

## Tabla de contenidos

### Fundamentos

- [Cómo funciona y componentes principales](#how-it-works-and-core-components)
- [Inicio rápido](#quick-start)
- [Uso](#usage)

### Sintaxis y capacidades

- [Sintaxis del archivo de lista de paquetes](#package-list-file-syntax)
- [Filtros y condiciones](#filters-and-conditions)
- [Colas de instalación](#installation-queues)
- [Cola de prioridad](#priority-queue)

### Modos de operación

- [Modos de operación y depuración](#operating-modes-and-debugging)
- [Manejo de errores y recuperación](#error-handling-and-recovery)

### Uso avanzado

- [Funciones avanzadas](#advanced-features)
- [Integración con sistemas de compilación](#integration-with-build-systems)

### Ejemplos Prácticos

- [Ejemplos de escenarios reales](#examples-of-real-world-scenarios)
- [Consejos de optimización](#optimization-tips)
- [Solución de problemas](#troubleshooting)

**Características clave:**

*   **Instalación condicional:** Instala paquetes según filtros flexibles (+, -).
*   **Configuración externa:** Separación completa de la lógica (lista de paquetes) de los datos (parámetros del sistema).
*   **Colas de instalación:** Divide el proceso en etapas secuenciales para resolver dependencias.
*   **Cola de prioridad:** Garantiza la instalación de paquetes críticos primero.
*   **Lógica compleja:** Soporta operadores "AND" (`&&`), "OR" (`||`), así como filtros de grupo (`+{a|b}`, `-{a&b}`).
*   **Legibilidad:** Permite comentarios y líneas vacías para estructurar listas.
*   **Compatibilidad retroactiva:** Soporta listas de paquetes simples sin condiciones.

## Cómo funciona y componentes principales

CondinAPT opera con cuatro archivos clave:

1.  **Script `condinapt`:** El núcleo, contiene toda la lógica de procesamiento.

2.  **Archivo principal de configuración (`-c`):** Un archivo con variables bash que describen el entorno actual.

    Ejemplo (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Archivo de mapeo de filtros (`-m`):** Relaciona prefijos cortos (usados en la lista de paquetes) con nombres de variables del archivo de configuración principal. Este archivo es **opcional**. Si un filtro no está presente en el archivo de mapeo, se usará como nombre de variable del archivo de configuración principal. Si la variable no se encuentra, CondinAPT la declarará vacía.

    Ejemplo (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Archivo de lista de paquetes (`-l`):** El archivo principal que describe qué instalar y bajo qué condiciones.

## Inicio rápido

Para familiarizarte rápidamente con CondinAPT, crea un ejemplo sencillo:

**1. Crea el archivo de configuración `config.conf`:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Crea la lista de paquetes `packages.list`:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Ejecuta la instalación:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. O prueba en modo simulación:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Uso

### Línea de comandos

```bash
./condinapt [OPTIONS]
```

| Bandera       | Bandera larga                   | Argumento | Descripción                                               |
| :------------ | :------------------------------ | :-------- | :-------------------------------------------------------- |
| `-l`          | `--package-list`                | `PATH`    | **(Obligatorio)** Ruta al archivo de lista de paquetes.   |
| `-c`          | `--config`                      | `PATH`    | **(Obligatorio)** Ruta al archivo principal de configuración. |
| `-m`          | `--filter-mapping`              | `PATH`    | (Opcional) Ruta al archivo de mapeo de filtros.           |
| `-P`          | `--priority-list`               | `PATH`    | (Opcional) Ruta a un archivo de filtros prioritarios. El archivo contiene patrones regex para hacer match con paquetes. Los paquetes coincidentes se mueven a la cola prioritaria (preservando filtros). |
| `-s`          | `--simulation`                  |           | Modo simulación. No se instalarán paquetes.               |
| `-C`          | `--check-only`                  |           | Solo verifica si los paquetes ya están instalados. Devuelve código de salida 1 si hay paquetes sin instalar. Al final, muestra un comando para instalar los paquetes faltantes. |
| `-v` / `-vv`  | `--verbose` / `--very-verbose`  |           | Salida detallada / muy detallada.                         |
| `-x`          | `--xtrace`                      |           | Habilita el rastreo de comandos `set -x`.                 |
| `-f`          | `--force`                       |           | Fuerza la actualización de la lista de paquetes antes de instalar. Por defecto, la actualización se omite si existe `/var/cache/apt/pkgcache.bin`. |
| `-h`          | `--help`                        |           | Muestra la ayuda.                                         |

## Sintaxis del archivo de lista de paquetes

### Estructura básica

Este es el corazón de CondinAPT. Toda la lógica se describe aquí.

Cada línea en el archivo de lista de paquetes consta de dos partes principales:

1. **Nombre del paquete con especificación opcional de versión y release**
2. **Filtros de condición** - definen bajo qué condiciones se instalará el paquete

> **Base para todos los ejemplos siguientes:**
> Para todos los ejemplos posteriores, asumimos que se usan los archivos `system.conf` y `filters.map` de la sección [Cómo funciona y componentes principales](#how-it-works-and-core-components).
>
> *   `DISTRIBUTION` = "bookworm"
> *   `SYSTEM_TYPE` = "server"
> *   `ENVIRONMENT` = "production"

### Estructura del nombre del paquete

**Nombre simple:**
```
vim
```

**Versión del paquete:**
- `package=version` — requisito de versión flexible. Si la versión requerida no está disponible, se instala la versión disponible.
  ```
  git=2.25.1
  ```
- `package==version` — requisito estricto. Si no se encuentra la versión, la instalación se aborta con error.
  ```
  curl==7.68.0
  ```

**Especificación de release:**
El release se especifica usando el símbolo `@`, lo que permite vincular la instalación a una rama específica del repositorio.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Estructura del archivo

*   **Nombres de paquetes:** Cada paquete o condición se escribe en una nueva línea.
*   **Comentarios:** Las líneas que comienzan con `#`, o el texto después de `#` en una línea, se ignoran completamente.
*   **Líneas vacías:** Se ignoran y sirven para separar visualmente.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filtros y condiciones

Los filtros te permiten establecer condiciones adicionales para la selección de paquetes. Comparan los valores de las variables del sistema (arquitectura, distribución, entorno de trabajo) con los especificados en el archivo de configuración.

#### Filtros individuales

*   **`+` (Positivo):** La condición es verdadera si el valor de la variable **coincide**.
    **Formato:** `+<prefijo>=<valor>`
    
    *   **Línea:** `nginx +st=server`
    *   **Análisis:** `SYSTEM_TYPE` es igual a "server". La condición es verdadera.
    *   **Resultado:** Se instalará `nginx`.

*   **Múltiples filtros positivos con el mismo prefijo:**
    Actúan como condiciones OR.
    **Formato:** `+<prefijo>=<valor1> +<prefijo>=<valor2>`
    
    *   **Línea:** `debug-tools +env=development +env=testing`
    *   **Análisis:** `ENVIRONMENT` es igual a "production", que no coincide con "development" ni "testing". La condición es falsa.
    *   **Resultado:** `debug-tools` no se instalará.

*   **`-` (Negativo):** La condición es verdadera si el valor de la variable **no coincide**.
    **Formato:** `-<prefijo>=<valor>`

    *   **Línea:** `monitoring-tools -st=desktop`
    *   **Análisis:** `SYSTEM_TYPE` es igual a "server", que no es igual a "desktop". La condición es verdadera.
    *   **Resultado:** Se instalará `monitoring-tools`.

*   **Múltiples filtros negativos:**
    El paquete se excluye si CUALQUIER condición coincide.
    **Formato:** `-<prefijo>=<valor1> -<prefijo>=<valor2>`
    
    *   **Línea:** `realtek-driver -d=trixie -d=sid`
    *   **Análisis:** `DISTRIBUTION` es igual a "bookworm", que no es igual a "trixie" ni "sid". Las condiciones de exclusión no se activan.
    *   **Resultado:** Se instalará `realtek-driver`.

#### Filtros grupales

*   **`+{a|b}` (OR para inclusión):** Verdadero si **al menos una** de las condiciones del grupo es verdadera.

    *   **Línea:** `web-server +{st=server|st=web-server}`
    *   **Análisis:** `SYSTEM_TYPE` es igual a "server". La primera condición es verdadera, lo cual es suficiente.
    *   **Resultado:** El paquete será instalado.

*   **`+{a&b}` (AND para inclusión):** Verdadero solo si **todas** las condiciones del grupo son verdaderas.

    *   **Línea:** `database-tools +{d=bookworm&st=server}`
    *   **Análisis:** `DISTRIBUTION` es igual a "bookworm" (verdadero) Y `SYSTEM_TYPE` es igual a "server" (verdadero).
    *   **Resultado:** El paquete será instalado.

*   **`-{a|b}` (OR para exclusión):** El paquete se excluye si **al menos una** de las condiciones es verdadera.

    *   **Línea:** `debug-tools -{env=production|st=minimal}`
    *   **Análisis:** `ENVIRONMENT` es igual a "production". La primera condición es verdadera, por lo que el paquete se excluye.
    *   **Resultado:** El paquete no será instalado.

*   **`-{a&b}` (AND para exclusión):** El paquete se excluye solo si **todas** las condiciones son verdaderas.

    *   **Línea:** `development-tools -{env=production&st=minimal}`
    *   **Análisis:** `ENVIRONMENT` es igual a "production" (verdadero), pero `SYSTEM_TYPE` no es igual a "minimal". La segunda condición es falsa. El grupo no se activa para exclusión.
    *   **Resultado:** El paquete será instalado (si no hay otros filtros).

### Alternativas

Se pueden ofrecer diferentes paquetes para la misma funcionalidad e instalarse según las condiciones. Las opciones alternativas se separan con el operador `||`.

**Importante:** Cada alternativa debe incluir una descripción completa — nombre del paquete (con versión y release opcionales) y un conjunto de filtros.

**Ejemplo:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Si `SYSTEM_TYPE` es `database-server`, se selecciona **postgresql**.
- Si `SYSTEM_TYPE` es `web-server`, se instala **mysql-server**.

### Operadores lógicos para paquetes

*   **`||` (OR / Fallback):** Intenta instalar la parte izquierda. Si falla (paquete no encontrado o filtrado), intenta instalar la parte derecha.

    *   **Línea:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Análisis:** `DISTRIBUTION` no es igual a "bookworm", la parte izquierda es filtrada. CondinAPT pasa a la parte derecha. `exfat-utils` no tiene filtros, así que se instalará.
    *   **Resultado:** Se instalará `exfat-utils`.

*   **`&&` (AND / Conjunción):** Todas las partes deben pasar los filtros para ser agregadas a la cola.

    *   **Línea:** `nginx +st=web-server && php-fpm`
    *   **Análisis:** `SYSTEM_TYPE` es igual a "server", pero la condición requiere "web-server". La parte izquierda falla.
    *   **Resultado:** No se instalarán paquetes.

    *   **Ejemplo complejo:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Resultado:** Los tres paquetes se instalarán solo si `ENVIRONMENT` es `production`.

### Modificadores especiales

*   **`!` (Paquete obligatorio):** Si un paquete está marcado con `!`, pero no se encuentra en los repositorios, CondinAPT abortará la ejecución con un error.

    *   **Línea:** `!essential-package`

*   **`@` (Especificación de release):** Instala un paquete de un release específico de Debian/Ubuntu (ejemplo: `bookworm-backports`).

    *   **Línea:** `kernel-image-6.5.0 @trixie-backports`

### Especificación de versión de paquetes

CondinAPT permite un control preciso sobre las versiones de los paquetes instalados.

*   **Sintaxis:**
    *   `package=VERSION`: Intenta instalar la versión especificada (`VERSION`). Si no está disponible en los repositorios, CondinAPT instalará cualquier versión disponible del paquete.
        *   Ejemplo: `my-app=1.2.3` (intenta instalar 1.2.3, si no, instala por ejemplo 1.2.4)
    *   `package==VERSION`: Instalación **estricta** de una versión específica. Si esta versión no está disponible en los repositorios, el paquete **no se instalará**. Si el paquete también estaba marcado como obligatorio (`!`), el script terminará con error.
        *   Ejemplo: `another-app==2.0.0` (instala solo 2.0.0, de lo contrario lo omite o da error si es obligatorio)

*   **Comportamiento:**
    1.  CondinAPT primero verifica si la versión requerida del paquete ya está instalada en el sistema. Si es así, el paquete se considera instalado y se omite.
    2.  Luego verifica si la versión especificada está disponible en los repositorios (`apt-cache madison`).
    3.  **Al usar `=` (versión flexible):**
        *   Si la versión especificada no está disponible, CondinAPT mostrará una advertencia de que no se encontró la versión exacta.
        *   Aun así, intentará instalar cualquier versión disponible del paquete desde los repositorios.
    4.  **Al usar `==` (versión estricta):**
        *   Si la versión especificada no está disponible, CondinAPT **no** instalará el paquete.
        *   Si el paquete estaba marcado como obligatorio (`!`), el script abortará la ejecución con error.
    5.  **Retención de versión (`apt-mark hold`):**
        *   Si un paquete se instaló correctamente con la **versión exacta especificada** (es decir, si `package==VERSION` tuvo éxito, o `package=VERSION` encontró *exactamente* esa versión e instaló), CondinAPT aplicará automáticamente el comando `apt-mark hold` para ese paquete.
        *   Esto evita actualizaciones automáticas del paquete a una nueva versión durante futuras operaciones de `apt upgrade`.

### Ejemplos complejos de filtros

#### Ejemplo 1: Filtros complejos para un solo paquete

**Tarea:** Instalar `database-tools` para la distribución `bookworm`, pero solo si el tipo de sistema es `server` o `database-server`, y no para el entorno `minimal`.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Análisis (con nuestra configuración):**

1.  `+d=bookworm`: Verdadero.
2.  `+{st=server|st=database-server}`: Verdadero, porque `SYSTEM_TYPE` es "server".
3.  `-env=minimal`: Verdadero, porque `ENVIRONMENT` es "production".
    **Resultado:** Todas las condiciones son verdaderas. El paquete será instalado.

#### Ejemplo 2: Cadena de fallback con diferentes condiciones

**Tarea:** Para Debian `trixie`, instalar `firefox-esr`. Para `bookworm`, instalar `firefox`. Para todos los demás casos, instalar `w3m`.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Análisis:**

1.  `firefox-esr +d=trixie`: Parte izquierda. `DISTRIBUTION` es "bookworm", la condición es falsa.
2.  `firefox +d=bookworm`: Parte del medio. `DISTRIBUTION` es "bookworm", la condición es verdadera.
3.  Como la segunda parte de la cadena `||` funcionó, la tercera (`w3m`) se ignora.
    **Resultado:** Se instalará `firefox`.

#### Ejemplo 3: Interacción de la cola prioritaria y paquete obligatorio

**Tarea:** `dkms` es crítico para la compilación de módulos; debe instalarse primero. En la lista principal, está marcado como obligatorio, pero con una condición.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Análisis:**

1.  CondinAPT lee los patrones prioritarios `^dkms$` y `^build-essential$`.
2.  La línea `!dkms +pv=standard` coincide con el patrón `^dkms$` y se mueve a la cola prioritaria **con todas sus propiedades**: la bandera obligatoria (`!`) y el filtro (`+pv=standard`).
3.  **Plan de ejecución:**

    *   **Cola prioritaria:** Instalar `!dkms +pv=standard` (se preservan la bandera obligatoria y el filtro).
    *   **Cola normal:** `vim`.

**Resultado:** `dkms` se instalará primero, pero el filtro `+pv=standard` aún se evaluará. Si la condición del filtro no se cumple, la instalación fallará por la bandera `!` (obligatorio).

## Colas de instalación

El separador `---` en una línea separada divide la lista en grupos (colas). Los paquetes de una cola se instalan juntos en una sola llamada a `apt`. Las colas se ejecutan estrictamente de forma secuencial.

### Colas normales

**Ejemplo:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Colas objetivo (con especificación de release)

Los paquetes con `@release` se agrupan automáticamente en colas separadas por release:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Cola prioritaria

Este mecanismo sirve para la instalación prioritaria de paquetes críticos, preservando sus filtros y condiciones.

*   **Principio:** El archivo especificado con la bandera `-P` contiene patrones regex (uno por línea, sin filtros). CondinAPT escanea todas las colas, encuentra los paquetes que coinciden con estos patrones y los mueve (con todos sus filtros y condiciones) a una "Cola Prioritaria" especial, que se ejecuta primero.
*   **Coincidencia de patrones:** Utiliza coincidencia regex de bash (operador `=~`). Los patrones pueden ser nombres simples de paquetes o expresiones regex complejas.
*   **Preservación de contexto:** A diferencia de listas prioritarias simples, este mecanismo preserva todas las condiciones, filtros y especificaciones de release del paquete original.
*   **Sobrescritura:** Los paquetes coincidentes se eliminan automáticamente de sus colas originales (tanto normales como objetivo con `@release`) y se mueven a las colas prioritarias. Los releases objetivo se preservan en colas prioritarias separadas.

**Ejemplo 1: Coincidencia simple de nombre de paquete**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Análisis:**

    1.  CondinAPT lee `priority.list` y sabe que los paquetes que coincidan con los patrones `^gpg$` y `^git$` deben instalarse primero.
    2.  Escanea `packages.list` y encuentra la línea `git +st=full-server`. Como `git` coincide, toda la línea (con su filtro `+st=full-server`) se mueve a la cola prioritaria.
    3.  De igual forma, `gpg -st=minimal` se mueve a la cola prioritaria con su filtro `-st=minimal` preservado.
    4.  **Plan final:**

        *   **Cola prioritaria:** Instalar `git +st=full-server` y `gpg -st=minimal` (los filtros se preservan y evalúan).
        *   **Cola normal:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Ejemplo 2: Coincidencia con patrón regex**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Análisis:**

    1.  El patrón `^linux-.*` coincide con `linux-image-6.1.0-amd64` y `linux-headers-6.1.0-amd64`.
    2.  El patrón `^firmware-.*` coincide con `firmware-linux`.
    3.  **Plan final:**

        *   **Cola prioritaria:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Cola normal:** `build-essential`, `nginx +st=server`.

## Modos de operación y depuración

#### Modo simulación (`-s`)

Permite ver qué paquetes se instalarían sin realizar la instalación:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Ejemplo de salida:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Nota:** En modo simulación, el script termina con código de salida 1.

#### Modo verificación (`-C`)

Verifica qué paquetes de la lista ya están instalados en el sistema:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Comportamiento:**
- Muestra errores para paquetes no instalados
- Devuelve código de salida 1 si hay paquetes sin instalar
- Al final, muestra un comando para instalar los paquetes faltantes

#### Modos de depuración

**Salida detallada (`-v`):**
- Muestra información detallada sobre la verificación de filtros
- Muestra resultados para cada paquete

**Salida muy detallada (`-vv`):**
- Máximo detalle del proceso
- Muestra todos los pasos intermedios

**Rastreo de comandos (`-x`):**
- Habilita `set -x` para depuración del script
- Muestra cada comando que se ejecuta

**Ejemplo con depuración:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Forzar actualización de caché (`-f`)

Fuerza a CondinAPT a ejecutar `apt update` antes de la instalación:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Funcionalidades avanzadas

### Soporte de arrays en la configuración

CondinAPT puede trabajar con variables tipo array en el archivo de configuración:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Paquetes especiales

CondinAPT tiene soporte integrado para paquetes especiales que requieren manejo particular:

**Paquetes virtuales:**
- `qemu-kvm` - tratado como paquete virtual

**Mecanismo de manejo:**
1. CondinAPT verifica si el paquete es virtual usando el comando `apt-cache show`
2. Si el paquete está marcado como "puramente virtual", se considera disponible para instalar
3. La lista de paquetes especiales se define en el array `SPECIAL_PACKAGES` dentro del script:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Extender la lista:** Para añadir nuevos paquetes especiales, es necesario editar el array `SPECIAL_PACKAGES` en el código de CondinAPT.

## Manejo de errores y recuperación

### Paquetes obligatorios (`!`)

Si un paquete está marcado como obligatorio pero no se encuentra en los repositorios, CondinAPT:
1. Muestra un mensaje de error
2. Aborta la ejecución (a menos que esté en modo simulación)
3. Devuelve código de salida 1

**Ejemplo:**
```text
!essential-package +pv=standard
```

Si `essential-package` no se encuentra en los repositorios, la ejecución se abortará.

### Manejo de versiones no disponibles

**Versiones flexibles (`=`):**
- Si la versión exacta no está disponible, se instala cualquier versión disponible
- Se muestra una advertencia sobre la no disponibilidad de la versión solicitada

**Versiones estrictas (`==`):**
- Si la versión exacta no está disponible, el paquete se omite
- Si el paquete es obligatorio (`!`), la ejecución se aborta

### Retención de versión (`apt-mark hold`)

CondinAPT retiene automáticamente versiones de paquetes en los siguientes casos:
- Cuando se instaló exactamente la versión solicitada
- Para paquetes con `==VERSION`, si la versión fue encontrada e instalada
- Para paquetes con `=VERSION`, si exactamente esa versión fue encontrada e instalada

## Integración con sistemas de construcción

### Uso en scripts de automatización

CondinAPT se integra fácilmente en sistemas de construcción y scripts de automatización. Para más detalles sobre la sintaxis del archivo de paquetes, consulta la sección [Sintaxis del archivo de lista de paquetes](#package-list-file-syntax).

### Ejemplo general de integración:

**En un script de automatización (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Ejemplos universales de configuración

**Ejemplo de archivo de mapeo de filtros (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Ejemplo de configuración (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Ejemplos de escenarios reales

### Ejemplo 1: Servidor Multimedia

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Ejemplo 2: Servidor Web con Varias Configuraciones

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Ejemplo 3: Plataforma de Contenedores

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Ejemplo 4: Uso Avanzado de Filtros

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Consejos de Optimización

### Organización de Listas de Paquetes

1. **Agrupar por funcionalidad:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Usar colas para dependencias:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Optimizar condiciones:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Rendimiento

- Utiliza colas de prioridad para paquetes críticos
- Minimiza el número de colas
- Agrupa paquetes relacionados en una sola cola
- Usa caché de APT para compilaciones grandes

## Solución de Problemas

### Problemas Comunes

**Problema:** El paquete no se instala a pesar de cumplir las condiciones
**Solución:** Verifica con la opción `-vv` para información detallada de los filtros

**Problema:** CondinAPT se detiene en un paquete obligatorio
**Solución:** Revisa la disponibilidad del paquete en los repositorios o utiliza una alternativa. Consulta la sección [Manejo de Errores y Recuperación](#error-handling-and-recovery)

**Problema:** Comportamiento inesperado con versiones de paquetes
**Solución:** Usa el [modo simulación](#operating-modes-and-debugging) (`-s`) para verificar

### Depuración de Filtros

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Verificación de Disponibilidad de Paquetes

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
