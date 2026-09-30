---
updated: 2026-09-30
program_commits:
    minios-module-manager: 7875b73a485eda82b9dc27827842e9b90f115cf7
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

## Inspeccionando un módulo

Selecciona un módulo para ver la ubicación de su archivo de respaldo, el tamaño comprimido y el contenido del sistema de archivos. Si el archivo de respaldo está disponible, **Extraer a carpeta** crea un nuevo directorio con los archivos del módulo.

La inspección no requiere privilegios de administrador. **Extraer a carpeta** solicita autenticación de administrador para conservar propietarios, permisos y archivos especiales. La extracción nunca reemplaza un destino existente ni modifica el módulo de origen.

También puedes abrir un archivo local `.sb` desde el gestor de archivos. Abrir un archivo solo lo inspecciona; no lo activa ni lo agrega a Next Boot.

## Crear un módulo

El espacio de trabajo Crear utiliza un flujo de **Configurar**, **Revisar**, **Ejecutar**, y **Resultado**. Un módulo creado exitosamente permanece como archivo en la ubicación de salida. No se activa ni se añade automáticamente a Próximo Inicio.

Los métodos disponibles son:

- **Paquetes** instala paquetes del repositorio y archivos locales seleccionados `.deb`, incluidos sus dependencias, en un entorno de compilación aislado MiniOS. La instalación de paquetes requiere autenticación de administrador.
- **Script de instalación** ejecuta un script revisado sin terminal interactiva. Una carpeta semilla opcional puede aportar archivos iniciales. El script se ejecuta con privilegios de administrador pero no se almacena en el módulo resultante.
- **Chroot interactivo** abre una shell raíz temporal en el terminal integrado. Escribe `exit` al finalizar, luego crea el módulo, vuelve a abrir la shell o descarta los cambios. Cerrar o descartar la sesión no afecta al sistema en ejecución.
- **Carpeta** empaqueta el contenido de un directorio existente. El propio directorio de origen no se anida dentro del módulo. El flujo gráfico solicita autenticación de administrador para leer archivos protegidos y conservar atributos del sistema de archivos; el origen permanece sin cambios. Las carpetas extraídas con preservación de propiedad se reconocen automáticamente y mantienen sus propietarios. Para una carpeta extraída antigua sin registro de origen, selecciona **Conservar propiedad de origen** si es necesario mantener los propietarios.
- **Cambios de la sesión actual** captura archivos elegibles y eliminaciones de la capa de sesión actual en modo escritura. Utiliza la política estándar MiniOS `savechanges`, que omite registros, cachés, datos de arranque y rutas temporales de ejecución. Leer toda la capa de escritura requiere autenticación de administrador.

Elige una nueva ruta de salida para cada flujo de trabajo. Los archivos existentes nunca se sobrescriben. El progreso y los diagnósticos del backend permanecen visibles mientras se ejecuta una operación, y la captura de sesión actual puede cancelarse.

Para otras carpetas, el flujo predeterminado de Carpeta cambia los IDs de usuario y grupo ordinarios (1000–60000) a root fuera de `/home` y `/opt`, mantiene los IDs de sistema y hace que los directorios estándar de nivel superior sean propiedad de root. La propiedad perdida durante una extracción anterior sin privilegios no puede recuperarse con esta opción.

Cambios de la sesión actual está pensado para una captura estándar y cómoda, no para revisar cada ruta incluida. Una capa de escritura activa puede contener datos personales o confidenciales. Para políticas de privacidad explícitas `exact`, `clean`, o seleccionadas por ruta, usa el flujo de trabajo por línea de comandos `savechanges` descrito en [Capturar cambios de la sesión actual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Arrastrar y soltar

Arrastrar y soltar solo rellena una entrada o abre la inspección:

- Un módulo abre sus detalles.
- Los archivos `.deb` se añaden a Paquetes.
- Un directorio se selecciona para Carpeta.
- Otro archivo regular se selecciona como Script de instalación.

Soltar un elemento no ejecuta código ni cambia En ejecución ni Próximo arranque.

## Documentación relacionada

- [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Carga de módulos Initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Composición de imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parámetros de arranque](/reference/Boot-Parameters)

## Creación de módulos

Los módulos MiniOS son imágenes de sistema de archivos SquashFS de solo lectura, que convencionalmente se nombran con la extensión `.sb`. Al iniciar, MiniOS organiza los módulos seleccionados en un sistema de archivos raíz en capas. Los archivos en una capa de mayor prioridad pueden complementar u ocultar archivos de capas inferiores. Esta canalización modular en vivo es parte de la arquitectura definitoria de MiniOS, descrita en [Acerca de MiniOS](/getting-started/About-MiniOS) y [Modos de arranque](/using-minios/Boot-Modes). Tras la conversión nativa, la raíz en capas `.sb` se reemplaza por un sistema de archivos Debian convencional y editable. El software de gestión de módulos MiniOS se elimina porque los flujos de trabajo de módulos ya no aplican, mientras que el entorno de escritorio seleccionado y las aplicaciones normales permanecen instaladas como paquetes habituales.

Esta guía documenta los flujos de trabajo actuales por línea de comandos de MiniOS Tools. Para la aplicación gráfica, consulte el [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules). Para el proceso completo de construcción de imágenes y arquitectura del sistema, consulte [Building MiniOS](/development/Building-MiniOS). Las listas de paquetes utilizadas durante la construcción de MiniOS se describen en la [documentación de CondinAPT](/development/CondinAPT).

### Límites de seguridad y privilegios

No todas las operaciones de módulos requieren root:

| Operación | Privilegio |
|---|---|
| Listar en ejecución ahora o en Próximo Inicio con `sb` | Sin root |
| Inspeccionar un módulo con `sb inspect` | Sin root |
| Conversión por línea de comandos ordinaria `dir2sb` y `sb2dir` conversión | Sin root |
| Conservar propiedad o permitir archivos especiales durante la conversión | Root |
| Compilar con `apt2sb`, `script2sb`, o `chroot2sb` | Root |
| Capturar la sesión con `savechanges` | Root |
| Activar, desactivar, añadir a Próximo Inicio o quitar de Próximo Inicio | Root |

Los constructores usan una unión aislada y no instalan paquetes ni cambios de script en el root en ejecución. La creación tampoco activa el resultado ni lo selecciona para el próximo inicio.

Los flujos gráficos de Carpeta y Extraer a carpeta solicitan autenticación de administrador para poder manejar archivos protegidos y conservar atributos del sistema de archivos.

Los conversores y constructores actuales usan publicación sin reemplazo. Un destino que ya existe, incluido un enlace simbólico, no se sobrescribe. Elige una nueva ruta de salida o revisa y elimina manualmente la salida anterior.

Utiliza la salida de `--help` de cada comando como referencia de la versión instalada. Las opciones estándar de compresión del constructor son `zstd` (por defecto), `gzip`, `lzo`, y `xz`; `dir2sb` también admite `lz4`.

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

El parámetro opcional `--directory DIR` copia todo el contenido de origen, incluidos los archivos ocultos, en la raíz del módulo antes de ejecutar el script. Organiza el directorio semilla como un árbol de sistema de archivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revisa el script antes de ejecutarlo. Se ejecuta con privilegios de administrador y puede realizar cualquier comando. Utiliza `chroot2sb` en su lugar si la instalación requiere preguntas o intervención manual.

### Crear un módulo de forma interactiva

`chroot2sb` crea una unión de compilación privada y abre una shell de root en su interior. Instala paquetes o edita archivos, luego sal de la shell para capturar los cambios:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Los comandos introducidos en la shell no se reproducen al cargar el módulo; el módulo es una instantánea del estado resultante del sistema de archivos. El historial de la shell se elimina del resultado. Si no se proporciona un nombre, el generado utiliza la fecha y hora actuales.

El ciclo de vida dividido de `prepare`, `shell`, `finish` y `cancel` existe para interfaces gráficas protegidas. Para uso normal en terminal, utiliza el comando interactivo único mostrado arriba.

### Crear un módulo desde un directorio

`dir2sb` empaqueta el contenido de un directorio preparado en un nuevo módulo. Ambos operandos son obligatorios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversión ordinaria no requiere root. El origen permanece sin cambios, los IDs de usuario y grupo ordinarios (1000–60000) se cambian a root fuera de `/home` y `/opt`, se mantienen los IDs de sistema y los directorios estándar de nivel superior pasan a ser propiedad de root. Se rechazan nodos de dispositivo, sockets y FIFOs, y nunca se sobrescribe el destino. `--keep-ownership` conserva todos los propietarios de origen y `--allow-special` permite archivos especiales; ambas requieren root.

`sb2dir` escribe `.minios-module-origin.json` en el directorio extraído. Si la extracción conservó la propiedad, `dir2sb` reconoce este registro y conserva automáticamente propietarios y archivos especiales al volver a empaquetar; el propio registro no se incluye en el nuevo módulo. Un directorio extraído sin preservación de propiedad no puede volver a empaquetarse, ya que sus propietarios originales ya no se conocen. Extrae el módulo original de nuevo usando las opciones con privilegios.

### Capturar cambios de la sesión actual

`savechanges` lee la capa de escritura autorizada de una sesión MiniOS en ejecución. Requiere root porque esa capa puede contener archivos accesibles solo por root. La ubicación predeterminada de los cambios se detecta automáticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sin `--profile`, la política histórica MiniOS omite directorios vacíos, cachés, registros, datos de arranque, rutas de ejecución, pseudo-sistemas de archivos y archivos seleccionados de sesión y sistema. Esto es útil para la creación tradicional de módulos, pero no es una garantía explícita de privacidad.

Los perfiles explícitos son:

- `exact` conserva los cambios representables, incluidos datos de usuario, registros, cachés, archivos de identidad, credenciales y metadatos de eliminación compatibles. Rechaza objetos de sistema de archivos no soportados en vez de perderlos silenciosamente.
- `clean` utiliza una lista de permitidos orientada a software. Excluye datos de usuario y root, registros, cachés, identidades, configuración de red, credenciales, configuración arbitraria del sistema y `/usr/local`. Reduce la exposición de privacidad pero no puede garantizar que un archivo de software permitido no contenga secretos.
- `selected` incluye solo rutas relativas revisadas desde un inventario y un archivo de selección. Las exclusiones explícitas prevalecen. Este es el perfil adecuado cuando el módulo debe contener un subconjunto controlado de los cambios de la sesión.

Ejemplos:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un archivo de selección tiene esta estructura estricta en JSON:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Las rutas son normalizadas, no vacías y relativas a la raíz de los cambios. Genera y revisa primero el inventario; cada inclusión debe coincidir con los datos del inventario. El inventario registra metadatos como ruta, tipo, categoría, sensibilidad y tamaño, pero no lee ni emite el contenido de archivos, destinos de enlaces simbólicos o valores secretos. Las salidas de perfil explícito e inventarios son de modo `0600`; los módulos de política heredada son de modo `0644`.

La captura de sesión puede conservar eliminaciones de archivos soportadas y opacidad de directorios para el backend activo AUFS o OverlayFS. Se excluyen montajes en tiempo de ejecución, sistemas de archivos anidados, registros de unión y la propia salida. Un destino existente nunca se reemplaza.

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

La extracción ordinaria no requiere root y no modifica el origen. El directorio de destino no debe existir. Se rechazan archivos especiales a menos que `--allow-special` se solicite con privilegios suficientes.

Para un directorio que pueda volver a empaquetarse fielmente, extrae con privilegios de administrador y conserva la propiedad y los archivos especiales:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

La extracción registra el origen del módulo en `.minios-module-origin.json` dentro del nuevo directorio. La extracción sin root registra que la propiedad no se conservó; dicho directorio no puede devolverse a `dir2sb`. Conserva el registro de origen con una extracción privilegiada hasta volver a empaquetar.

Los directorios producidos por `sb2dir` actuales son directorios ordinarios. `rmsbdir`, `sb rm`, y `sb rmdir` son comandos de compatibilidad retirados que siempre rechazan eliminar; no desmontan ni eliminan nada de forma recursiva. Revisa una ruta extraída y su contenido antes de eliminarla con las herramientas estándar del sistema de archivos.

### Gestionar módulos en ejecución y para el próximo arranque

Las composiciones de Ejecutando ahora y Próximo arranque son independientes. Consulte [construcción de unión y activación en tiempo de ejecución](/reference/boot-process/Module-Loading#union-construction) para conocer el límite entre arranque y ejecución, y por qué las dos listas pueden diferir.

Enumere los módulos que realmente componen la raíz actual de AUFS o OverlayFS, desde la prioridad más baja a la más alta:

```bash
sb list
sb list --json
```

Enumere los módulos seleccionados por las reglas de arranque actuales:

```bash
sb next-boot
sb next-boot --json
```

Estas consultas no requieren privilegios de root. Las reglas canónicas de [niveles de candidatos y reemplazo](/reference/boot-process/Module-Loading#candidate-tiers) determinan qué origen suministra cada nombre base de Próximo arranque.

Para que un módulo de usuario esté disponible en el próximo arranque:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utiliza almacenamiento duradero y editable adecuado, prepara y valida la copia, y la publica de forma atómica sin reemplazar un módulo existente. El nombre de archivo debe cumplir con los filtros de arranque actuales. Elimine un módulo de usuario seleccionado por su nombre base exacto:

```bash
sudo sb next-boot remove 50-extra.sb
```

No se permite la eliminación de módulos base ni de módulos en fuentes de solo lectura o volátiles.

La activación en tiempo de ejecución es una operación independiente, solo para la sesión actual:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

La activación y desactivación solo funcionan cuando `/` es actualmente una unión AUFS. No están disponibles en OverlayFS, y el soporte de AUFS del kernel por sí solo no es suficiente. Ningún comando modifica el Próximo arranque.

El despachador de conversión de compatibilidad requiere ambos operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

El uso directo de `dir2sb` y `sb2dir` es preferible porque la conversión estándar puede ejecutarse sin privilegios de root.

### Documentación relacionada

- [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carga de módulos en Initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Reconstrucción de imágenes ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Building MiniOS](/development/Building-MiniOS)
- [Parámetros de arranque](/reference/Boot-Parameters)
