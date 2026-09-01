---
updated: 2026-08-31
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# Gestión de módulos

Gestor de módulos de MiniOS es la aplicación gráfica para inspeccionar, crear y gestionar MiniOS módulos `.sb`. Cuenta con dos espacios de trabajo: **Módulos** para la composición del sistema y **Crear** para la creación de nuevos módulos.

Inícialo desde el menú de aplicaciones o ejecuta:

```bash
minios-module-manager
```

La aplicación se ejecuta como tu usuario de escritorio. Solo solicita autenticación de administrador cuando una operación lo requiere.

## En ejecución ahora y en el próximo arranque

El espacio de trabajo de Módulos mantiene dos vistas separadas:

- **En ejecución ahora** es el conjunto ordenado de módulos que actualmente componen el sistema en vivo.
- **Próximo arranque** es el conjunto ordenado seleccionado por las reglas de arranque actuales de MiniOS.

Cambiar una vista no modifica silenciosamente la otra. Por ejemplo, **Activar para esta sesión** afecta solo al sistema en ejecución, mientras que **Agregar al próximo arranque** copia un módulo al almacenamiento duradero de módulos sin activarlo en este momento.

Para las reglas de arranque autorizadas, incluyendo niveles de origen candidatos, reemplazo exacto por nombre base, ordenamiento numérico y filtrado por `load=`, `noload=` y `bext=`, consulta [Carga de módulos en Initrd](/reference/boot-process/Module-Loading). Esa guía también explica por qué En ejecución ahora y Próximo arranque pueden diferir.

La activación y desactivación en tiempo de ejecución solo están disponibles cuando el sistema de archivos raíz está usando actualmente AUFS. No están disponibles en un raíz OverlayFS, incluso si el kernel es compatible con AUFS. Los módulos base no pueden desactivarse a través de la aplicación.

Los cambios para el próximo arranque solo están disponibles cuando MiniOS encuentra almacenamiento de módulos duradero y escribible adecuado. Los módulos base y los módulos en almacenamiento de solo lectura o volátil no pueden eliminarse. Los filtros de arranque como `load`, `noload` y `bext` siguen determinando qué módulos se seleccionan.

## Inspección de un módulo

Selecciona un módulo para ver su origen, tamaño comprimido y contenido del sistema de archivos. Si el archivo de respaldo está disponible, **Extraer a carpeta** crea un nuevo directorio con los archivos del módulo.

La inspección y la extracción ordinaria no requieren privilegios de administrador. La extracción nunca reemplaza un destino existente.

También puedes abrir un archivo local `.sb` desde el gestor de archivos. Abrir un archivo solo permite inspeccionarlo; no lo activa ni lo añade al Próximo arranque.

## Creación de un módulo

El espacio de trabajo Crear utiliza un flujo de **Configurar**, **Revisar**, **Ejecutar** y **Resultado**. Un módulo creado con éxito permanece como archivo en la ubicación de salida. No se activa ni se añade automáticamente al Próximo arranque.

Los métodos disponibles son:

- **Paquetes** instala paquetes de repositorio y archivos locales `.deb` seleccionados, incluidas sus dependencias, en un entorno de compilación aislado de MiniOS. La instalación de paquetes requiere autenticación de administrador.
- **Script de instalación** ejecuta un script revisado sin terminal interactiva. Una carpeta semilla opcional puede proporcionar archivos iniciales. El script se ejecuta con privilegios de administrador pero no se almacena en el módulo resultante.
- **Chroot interactivo** abre una shell raíz temporal en el terminal embebido. Escribe `exit` al terminar, luego crea el módulo, reabre la shell o descarta los cambios. Cerrar o descartar la sesión no afecta al sistema en ejecución.
- **Carpeta** empaqueta el contenido de un directorio existente. El directorio fuente no se anida dentro del módulo. La conversión ordinaria de carpetas no requiere root, deja la fuente sin cambios y normaliza la propiedad en el módulo a root.
- **Cambios de la sesión actual** captura archivos y eliminaciones elegibles de la capa de sesión escribible actual. Utiliza la política estándar de MiniOS `savechanges`, que omite logs, cachés, datos de arranque y rutas temporales de ejecución. Leer toda la capa escribible requiere autenticación de administrador.

Elige una nueva ruta de salida para cada flujo de trabajo. Los archivos existentes nunca se sobrescriben. El progreso y los diagnósticos del backend permanecen visibles mientras se ejecuta una operación, y la captura de la sesión actual puede cancelarse.

Cambios de la sesión actual está pensado para una captura estándar y conveniente, no para revisar cada ruta incluida. Una capa escribible en vivo puede contener datos personales o confidenciales. Para políticas explícitas de `exact`, `clean` o selección de rutas para privacidad, utiliza el flujo de trabajo por línea de comandos `savechanges` descrito en [Creación de módulos](/preparing-and-customizing/Managing-Modules).

## Arrastrar y soltar

Arrastrar y soltar solo rellena una entrada o abre la inspección:

- Un módulo abre sus detalles.
- Los archivos `.deb` se añaden a Paquetes.
- Un directorio se selecciona para Carpeta.
- Otro archivo regular se selecciona como Script de instalación.

Soltar un elemento no ejecuta código ni cambia En ejecución ni Próximo arranque.

## Documentación relacionada

- [Creación de módulos](/preparing-and-customizing/Managing-Modules)
- [Carga de módulos en Initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Composición de imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Parámetros de arranque](/reference/Boot-Parameters)

## Creación de módulos

Los módulos MiniOS son imágenes de sistema de archivos SquashFS de solo lectura, que convencionalmente se nombran con la extensión `.sb`. Al iniciar, MiniOS organiza los módulos seleccionados en un sistema de archivos raíz en capas. Los archivos en una capa de mayor prioridad pueden complementar u ocultar archivos de capas inferiores. Esta canalización modular en vivo es parte de la arquitectura definitoria de MiniOS, descrita en [Acerca de MiniOS](/getting-started/About-MiniOS) y [Modos de arranque](/using-minios/Boot-Modes). Tras la conversión nativa, la raíz en capas `.sb` se reemplaza por un sistema de archivos Debian convencional y editable. El software de gestión de módulos MiniOS se elimina porque los flujos de trabajo de módulos ya no aplican, mientras que el entorno de escritorio seleccionado y las aplicaciones normales permanecen instaladas como paquetes habituales.

Esta guía documenta los flujos de trabajo actuales por línea de comandos de MiniOS Tools. Para la aplicación gráfica, consulte el [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules). Para el proceso completo de construcción de imágenes y arquitectura del sistema, consulte [Building MiniOS](/development/Building-MiniOS). Las listas de paquetes utilizadas durante la construcción de MiniOS se describen en la [documentación de CondinAPT](/development/CondinAPT).

### Seguridad y límites de privilegios

No todas las operaciones de módulos requieren root:

| Operación | Privilegio |
|---|---|
| Listar En ejecución o Próximo arranque con `sb` | Sin root |
| Inspeccionar un módulo con `sb inspect` | Sin root |
| Conversión ordinaria de `dir2sb` y `sb2dir` | Sin root |
| Conservar propiedad o permitir archivos especiales durante la conversión | Root |
| Construir con `apt2sb`, `script2sb` o `chroot2sb` | Root |
| Capturar la sesión con `savechanges` | Root |
| Activar, desactivar, agregar a Próximo arranque o quitar de Próximo arranque | Root |

Los constructores utilizan una unión aislada y no instalan paquetes ni cambios de scripts en el root en ejecución. La creación tampoco activa el resultado ni lo selecciona para el próximo arranque.

Los convertidores y constructores actuales utilizan publicación sin reemplazo. Un destino que ya existe, incluyendo enlaces simbólicos, no se sobrescribe. Elige una nueva ruta de salida o revisa y elimina explícitamente la salida anterior tú mismo.

Utiliza la salida `--help` de cada comando como referencia de la versión instalada. Las opciones estándar de compresión del constructor son `zstd` (por defecto), `gzip`, `lzo` y `xz`; `dir2sb` también soporta `lz4`.

### Nombres de módulos y niveles de filtro

Los nombres suelen comenzar con un número como `06-browser.sb` porque el orden de las capas afecta la resolución de conflictos. Un módulo debe contener rutas relativas a la raíz del sistema, como `usr/bin/example`, y no un directorio adicional que contenga ese árbol.

Para conocer los niveles de origen candidatos exactos, el comportamiento ante colisiones de nombre base, el ordenamiento numérico y la semántica de `bext=`, `load=` y `noload=`, consulta [Carga de módulos en Initrd](/reference/boot-process/Module-Loading). En particular, utiliza un nombre base único a menos que el módulo esté destinado a reemplazar la ranura del mismo nombre de un nivel de origen anterior.

La opción `--level LEVEL` en `apt2sb`, `script2sb` y `chroot2sb` limita las capas base utilizadas para construir la unión de compilación. Con `--level 3`, se usan las capas numeradas hasta `03` y se filtran las capas de número superior. Esto puede hacer que un módulo dependa menos de capas superiores opcionales, a costa de incluir más dependencias en el resultado.

### Crear un módulo a partir de paquetes

`apt2sb` instala paquetes de repositorio o archivos locales `.deb` legibles en una unión de compilación privada y captura el resultado. Requiere una sesión en vivo de MiniOS compatible y privilegios de root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sin `--name`, el nombre de salida se deriva del primer paquete. Algunas opciones útiles de APT incluyen `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` y `--target-release RELEASE`. La opción de versión objetivo solo aplica a `install`.

Para capturar actualizaciones de paquetes ya instalados:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Crear un módulo a partir de un script

`script2sb` copia un script de instalación en un chroot privado, lo hace ejecutable, lo ejecuta como root sin terminal interactiva, lo elimina y captura los cambios resultantes en el sistema de archivos. Si el script falla, no se crea ningún módulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

La opción `--directory DIR` copia todo el contenido fuente, incluidos archivos ocultos, en la raíz del módulo antes de ejecutar el script. Organiza el directorio semilla como un árbol de sistema de archivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revisa el script antes de ejecutarlo. Se ejecuta con privilegios de administrador y puede ejecutar comandos arbitrarios. Utiliza `chroot2sb` en su lugar si la instalación requiere indicaciones o trabajo manual.

### Crear un módulo de forma interactiva

`chroot2sb` crea una unión de compilación privada y abre una shell raíz dentro de ella. Instala paquetes o edita archivos y luego sal de la shell para capturar los cambios:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Los comandos introducidos en la shell no se reproducen cuando se carga el módulo; el módulo es una instantánea del estado resultante del sistema de archivos. El historial de la shell se elimina del resultado. Si no se proporciona un nombre, el nombre generado utiliza la fecha y hora actuales.

El ciclo de vida dividido `prepare`, `shell`, `finish` y `cancel` existe para frontends gráficos protegidos. Para el uso normal en terminal, utiliza el comando interactivo único mostrado arriba.

### Crear un módulo a partir de un directorio

`dir2sb` empaqueta el contenido de un directorio preparado en un nuevo módulo. Ambos operandos son obligatorios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversión ordinaria no requiere root. Deja la fuente sin cambios, normaliza la propiedad dentro del módulo a root, rechaza nodos de dispositivo, sockets y FIFOs, y nunca sobrescribe el destino. Utiliza `--keep-ownership` o `--allow-special` solo cuando se requieran esas semánticas privilegiadas.

### Capturar cambios de la sesión actual

`savechanges` lee la capa escribible autorizada de una sesión MiniOS en ejecución. Requiere root porque esa capa puede contener archivos exclusivos de root. La ubicación de cambios predeterminada se detecta automáticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sin `--profile`, la política histórica de MiniOS omite directorios vacíos, cachés, logs, datos de arranque, rutas de ejecución, pseudo-sistemas de archivos y archivos de sesión y sistema seleccionados. Esto es conveniente para la creación tradicional de módulos, pero no es una garantía explícita de privacidad.

Los perfiles explícitos son:

- `exact` conserva los cambios representables, incluidos datos de usuario, logs, cachés, archivos de identidad, credenciales y metadatos de eliminación compatibles. Rechaza objetos de sistema de archivos no soportados en vez de perderlos silenciosamente.
- `clean` utiliza una lista de rutas permitidas orientada a software. Excluye datos de home y root, logs, cachés, identidades, configuración de red, credenciales, configuración arbitraria del sistema y `/usr/local`. Reduce la exposición de privacidad pero no puede garantizar que un archivo de software permitido no contenga secretos.
- `selected` incluye solo rutas relativas revisadas desde un archivo de inventario y selección. Las exclusiones explícitas prevalecen. Este es el perfil adecuado cuando el módulo debe contener un subconjunto controlado de cambios de la sesión.

Ejemplos:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un archivo de selección tiene esta estructura JSON estricta:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Las rutas se normalizan y son rutas no vacías relativas a la raíz de cambios. Genera y revisa primero el inventario; cada inclusión debe coincidir con los datos del inventario. El inventario registra metadatos como ruta, tipo, categoría, sensibilidad y tamaño, pero no lee ni emite contenidos de archivos, destinos de enlaces simbólicos ni valores secretos. Las salidas de perfiles explícitos e inventarios son modo `0600`; los módulos de política heredada son modo `0644`.

La captura de sesión puede retener eliminaciones de archivos y opacidad de directorios compatibles para el backend AUFS u OverlayFS activo. Excluye montajes en tiempo de ejecución, sistemas de archivos anidados, registros de unión y el propio resultado. Un destino existente nunca se reemplaza.

### Inspeccionar y extraer módulos

Inspecciona un módulo sin montarlo ni extraerlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

La inspección no requiere root y también funciona fuera de una sesión MiniOS en ejecución.

Extrae un módulo en un nuevo directorio:

```bash
sb2dir 06-example.sb example-root
```

La extracción ordinaria no requiere root y no modifica la fuente. El directorio de destino no debe existir. Los archivos especiales se rechazan a menos que se solicite `--allow-special` con privilegios suficientes.

Los directorios producidos por `sb2dir` actuales son directorios ordinarios. `rmsbdir`, `sb rm` y `sb rmdir` son comandos de compatibilidad retirados que siempre rechazan la eliminación; no desmontan ni eliminan recursivamente nada. Revisa una ruta extraída y su contenido antes de eliminarla con herramientas estándar del sistema de archivos.

### Gestionar módulos en ejecución y de próximo arranque

En ejecución ahora y Próximo arranque son composiciones independientes. Consulta [construcción de uniones y activación en tiempo de ejecución](/reference/boot-process/Module-Loading) para conocer el límite entre arranque y tiempo de ejecución, y por qué las dos listas pueden diferir.

Lista los módulos que realmente componen la raíz actual AUFS o OverlayFS, de menor a mayor prioridad:

```bash
sb list
sb list --json
```

Lista los módulos seleccionados por las reglas de arranque actuales:

```bash
sb next-boot
sb next-boot --json
```

Estas consultas no requieren privilegios de root. Las reglas canónicas de [niveles candidatos y reemplazo](/reference/boot-process/Module-Loading) determinan qué fuente suministra cada nombre base en Próximo arranque.

Para hacer que un módulo de usuario esté disponible en el próximo arranque:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utiliza almacenamiento duradero y escribible adecuado, prepara y valida la copia, y la publica atómicamente sin reemplazar un módulo existente. El nombre del archivo debe cumplir con los filtros de arranque actuales. Elimina un módulo de usuario seleccionado por su nombre base exacto:

```bash
sudo sb next-boot remove 50-extra.sb
```

No se permite la eliminación de módulos base ni de módulos en fuentes de solo lectura o volátiles.

La activación en tiempo de ejecución es una operación independiente, válida solo para la sesión actual:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

La activación y desactivación solo funcionan cuando `/` es actualmente una unión AUFS. No están disponibles en OverlayFS, y el soporte del kernel para AUFS por sí solo no es suficiente. Ningún comando modifica Próximo arranque.

El despachador de conversión de compatibilidad requiere ambos operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

El uso directo de `dir2sb` y `sb2dir` es preferible porque la conversión ordinaria puede ejecutarse sin privilegios de root.

### Documentación relacionada

- [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carga de módulos en Initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Reconstrucción de imágenes ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Building MiniOS](/development/Building-MiniOS)
- [Parámetros de arranque](/reference/Boot-Parameters)
