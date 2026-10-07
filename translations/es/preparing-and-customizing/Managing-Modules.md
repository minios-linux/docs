---
updated: 2026-10-06
program_commits:
    minios-module-manager: fbe617f2955ddbef97f9ee3e5856b7d58439a565
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Gestión de módulos

El Gestor de módulos de MiniOS es la aplicación gráfica para inspeccionar, crear y administrar MiniOS `.sb` módulos. Dispone de dos espacios de trabajo: **Módulos** para la composición del sistema y **Crear** para crear nuevos módulos.

Inícielo desde el menú de aplicaciones o ejecute:

```bash
minios-module-manager
```

La aplicación se ejecuta como su usuario de escritorio. Solo solicita autenticación de administrador cuando una operación lo requiere.

## En ejecución y en el próximo arranque

El espacio de trabajo Módulos mantiene dos vistas separadas:

- **En ejecución** es el conjunto ordenado de módulos que actualmente componen el sistema en vivo.
- **Próximo arranque** es el conjunto ordenado seleccionado por las reglas de arranque actuales de MiniOS.

Cambiar una vista no modifica silenciosamente la otra. Por ejemplo, **Activar para esta sesión** solo afecta al sistema en ejecución, mientras que **Añadir al próximo arranque** copia un módulo al almacenamiento duradero de módulos sin activarlo en ese momento.

Para las reglas de arranque autorizadas, incluyendo los niveles de origen candidatos, reemplazo exacto por nombre base, orden numérico y `load=`, `noload=`, y `bext=` filtrado, consulte [Carga de módulos en initrd](/reference/boot-process/Module-Loading). Esa guía también explica por qué En ejecución y Próximo arranque pueden diferir.

La activación y desactivación en tiempo de ejecución solo están disponibles cuando el sistema de archivos raíz utiliza actualmente AUFS. No están disponibles en un root OverlayFS, incluso si el kernel admite AUFS. Los módulos base no se pueden desactivar desde la aplicación.

Los cambios para el próximo arranque solo están disponibles cuando MiniOS encuentra un almacenamiento de módulos duradero y escribible adecuado. Los módulos base y los módulos en almacenamiento de solo lectura o volátil no se pueden eliminar. Los filtros de arranque como `load`, `noload`, y `bext` siguen determinando qué módulos se seleccionan.

## Inspeccionar un módulo

Seleccione un módulo para ver la ubicación de su archivo de respaldo, el tamaño comprimido y el contenido del sistema de archivos. Si el archivo de respaldo está disponible, **Extraer a carpeta** crea un nuevo directorio con los archivos del módulo.

La inspección no requiere privilegios de administrador. **Extraer a carpeta** solicita autenticación de administrador para poder conservar propietarios, permisos y archivos especiales. La extracción nunca reemplaza un destino existente ni modifica el módulo original.

También puede abrir un archivo local `.sb` desde el gestor de archivos. Abrir un archivo solo lo inspecciona; no lo activa ni lo añade al próximo arranque. En sistemas Xfce con la integración Thunar de MiniOS instalada, las acciones del gestor de archivos usan el mismo backend de módulos para la activación y desactivación explícitas; no omiten la distinción entre En ejecución y Próximo arranque.

## Crear un módulo

El espacio de trabajo Crear utiliza un flujo de trabajo de **Configurar**, **Revisar**, **Ejecutar**, y **Resultado**. Un módulo creado correctamente queda como un archivo en la ubicación de salida. No se activa ni se añade automáticamente al próximo arranque.

Los métodos disponibles son:

- **Paquetes** instala paquetes de repositorio y archivos locales seleccionados `.deb` , incluidas sus dependencias, en un entorno de compilación aislado MiniOS. La instalación de paquetes requiere autenticación de administrador.
- **Script de instalación** ejecuta un script revisado sin terminal interactiva. Una carpeta semilla opcional puede aportar archivos iniciales. El script se ejecuta con privilegios de administrador pero no se almacena en el módulo resultante.
- **Chroot interactivo** abre una shell raíz temporal en el terminal integrado. Escriba `exit` al finalizar, luego cree el módulo, reabra la shell o descarte los cambios. Cerrar o descartar la sesión no afecta al sistema en ejecución.
- **Carpeta** empaqueta el contenido de un directorio existente. El propio directorio de origen no se incluye dentro del módulo. El flujo de trabajo gráfico solicita autenticación de administrador para leer archivos protegidos y conservar atributos del sistema de archivos; deja el origen sin cambios. Las carpetas extraídas con preservación de propietarios se reconocen automáticamente y mantienen sus propietarios. Para una carpeta extraída antigua sin registro de origen, seleccione **Conservar propiedad de origen** si es necesario mantener los propietarios.
- **Cambios de la sesión actual** captura archivos y eliminaciones elegibles de la capa de sesión escribible actual. Utiliza la política estándar MiniOS `savechanges`, que omite registros, cachés, datos de arranque y rutas temporales de ejecución. Leer la capa escribible completa requiere autenticación de administrador.

Elija una nueva ruta de salida para cada flujo de trabajo. Los archivos existentes nunca se sobrescriben. El progreso y los diagnósticos del backend permanecen visibles mientras se ejecuta una operación, y la captura de sesión actual se puede cancelar.

Para otras carpetas, el flujo de trabajo Carpeta por defecto cambia los UID y GID de usuario ordinario (1000–60000) a root fuera de `/home` y `/opt`, mantiene los ID de sistema y hace que los directorios estándar de nivel superior sean propiedad de root. La propiedad perdida durante una extracción sin privilegios anterior no se puede recuperar con esta opción.

Cambios de la sesión actual está pensado para una captura estándar cómoda, no para revisar cada ruta incluida. Una capa escribible activa puede contener datos personales o confidenciales. Para políticas de privacidad explícitas por `exact`, `clean`, o selección de rutas, utilice el flujo de trabajo por línea de comandos `savechanges` descrito en [Capturar cambios de la sesión actual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Arrastrar y soltar

Arrastrar y soltar solo rellena una entrada o abre la inspección:

- Un módulo abre sus detalles.
- `.deb` los archivos se añaden a Paquetes.
- Un directorio se selecciona para Carpeta.
- Otro archivo regular se selecciona como Script de instalación.

Soltar un elemento no ejecuta código ni modifica En ejecución ni Próximo arranque.

## Documentación relacionada

- [Crear módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Carga de módulos en initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Composición de imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parámetros de arranque](/reference/Boot-Parameters)

## Crear módulos

Los módulos MiniOS son imágenes de sistema de archivos SquashFS de solo lectura, que suelen nombrarse con la extensión `.sb`. Al arrancar, MiniOS ordena los módulos seleccionados en un sistema de archivos raíz en capas. Los archivos en una capa de mayor prioridad pueden complementar u ocultar archivos de capas inferiores. Esta canalización modular en vivo es parte de la arquitectura definitoria de MiniOS descrita en [Acerca de MiniOS](/getting-started/About-MiniOS) y [Modos de arranque](/using-minios/Boot-Modes). Tras la conversión nativa, la raíz en capas `.sb` se reemplaza por un sistema de archivos Debian convencional y escribible. El software de gestión de módulos MiniOS se elimina porque los flujos de trabajo de módulos ya no aplican, mientras que el entorno de escritorio seleccionado y las aplicaciones habituales permanecen instaladas como paquetes normales.

Esta guía documenta los flujos de trabajo actuales por línea de comandos de MiniOS Tools. Para la aplicación gráfica, consulte [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules). Para el proceso completo de construcción de imágenes y la arquitectura del sistema, consulte [Compilación de MiniOS](/development/Building-MiniOS). Las listas de paquetes utilizadas al construir MiniOS se describen en la [documentación de CondinAPT](/development/CondinAPT).

### Seguridad y límites de privilegios

No toda operación con módulos requiere root:

| Operación | Privilegio |
|---|---|
| Listar En ejecución o Próximo arranque con `sb` | Sin root |
| Inspeccionar un módulo con `sb inspect` | Sin root |
| Conversión ordinaria por línea de comandos `dir2sb` y `sb2dir` conversión | Sin root |
| Conservar propiedad o permitir archivos especiales durante la conversión | Root |
| Compilar con `apt2sb`, `script2sb`, o `chroot2sb` | Root |
| Capturar la sesión con `savechanges` | Root |
| Activar, desactivar, añadir o quitar del Próximo arranque | Root |

Los generadores usan una unión aislada y no instalan paquetes ni cambios de scripts en el root en ejecución. La creación tampoco activa el resultado ni lo selecciona para el próximo arranque.

Los flujos de trabajo gráficos Carpeta y Extraer a carpeta solicitan autenticación de administrador para manejar archivos protegidos y conservar atributos del sistema de archivos.

Los conversores y generadores actuales usan publicación sin reemplazo. Un destino que ya existe, incluidos enlaces simbólicos, no se sobrescribe. Elija una nueva ruta de salida o revise y elimine manualmente la salida anterior.

Utilice la `--help` salida de cada comando como referencia de la versión instalada. Los flujos de trabajo actuales de `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb`, y `savechanges` aceptan `zstd` (por defecto), `gzip`, `lzo`, `lz4`, y `xz`. El compresor seleccionado debe estar disponible en el sistema en ejecución.

### Nombres de módulos y niveles de filtrado

Los nombres suelen comenzar con un número como `06-browser.sb` porque el orden de las capas afecta a la resolución de conflictos. Un módulo debe contener rutas relativas a la raíz del sistema, como `usr/bin/example`, no un directorio adicional que contenga ese árbol.

Para los niveles de origen candidatos exactos, el comportamiento ante colisiones de nombre base, el orden numérico y `bext=`, `load=`, y `noload=` la semántica, consulte [Carga de módulos en initrd](/reference/boot-process/Module-Loading). En particular, use un nombre base único salvo que el módulo esté destinado a reemplazar la ranura del mismo nombre de una fuente anterior.

La opción `--level LEVEL` en `apt2sb`, `script2sb`, y `chroot2sb` limita las capas base usadas para construir la unión de compilación. Con `--level 3`, se usan las capas numeradas hasta `03` y las de número superior se filtran. Esto puede hacer que un módulo dependa menos de capas opcionales superiores, a costa de incluir más dependencias en el resultado.

### Crear un módulo a partir de paquetes

`apt2sb` instala paquetes del repositorio o archivos locales legibles `.deb` en una unión de compilación privada y captura el resultado. Requiere una sesión en vivo compatible MiniOS y permisos de root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sin `--name`, el nombre de salida se deriva del primer paquete. Algunas opciones útiles de APT incluyen `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, y `--target-release RELEASE`. La opción target-release solo aplica a `install`.

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

El parámetro opcional `--directory DIR` copia todo el contenido fuente, incluidos archivos ocultos, en la raíz del módulo antes de ejecutar el script. Organice el directorio semilla como un árbol de sistema de archivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revise el script antes de ejecutarlo. Se ejecuta con privilegios de administrador y puede ejecutar cualquier comando. Utilice `chroot2sb` en su lugar si la instalación requiere preguntas o intervención manual.

### Crear un módulo de forma interactiva

`chroot2sb` crea una unión de compilación privada y abre una shell raíz dentro de ella. Instale paquetes o edite archivos, luego salga de la shell para capturar los cambios:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Los comandos introducidos en la shell no se reproducen al cargar el módulo; el módulo es una instantánea del estado resultante del sistema de archivos. El historial de la shell se elimina del resultado. Si no se indica un nombre, el generado usará la fecha y hora actuales.

El ciclo de vida dividido de `prepare`, `shell`, `finish`, y `cancel` existe para frontends gráficos protegidos. Para uso normal en terminal, utilice el comando interactivo único mostrado arriba.

### Crear un módulo a partir de un directorio

`dir2sb` empaqueta el contenido de un directorio preparado en un nuevo módulo. Ambos operandos son obligatorios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversión ordinaria no requiere root. Deja el origen sin cambios, cambia los UID y GID de usuario ordinario (1000–60000) a root fuera de `/home` y `/opt`, mantiene los ID de sistema y hace que los directorios estándar de nivel superior sean propiedad de root. Rechaza nodos de dispositivo, sockets y FIFOs, y nunca sobrescribe el destino. `--keep-ownership` conserva todos los propietarios originales y `--allow-special` permite archivos especiales; ambas requieren root.

`sb2dir` escribe `.minios-module-origin.json` en el directorio extraído. Si la extracción conservó la propiedad, `dir2sb` reconoce este registro y automáticamente conserva propietarios y archivos especiales al reempaquetar; el registro en sí no se incluye en el nuevo módulo. Un directorio extraído sin preservación de propiedad no puede ser reempaquetado, ya que sus propietarios originales ya no se conocen. Extraiga el módulo original de nuevo con las opciones privilegiadas.

### Capturar cambios de la sesión actual

`savechanges` lee la capa escribible autorizada de una sesión MiniOS en ejecución. Requiere root porque esa capa puede contener archivos exclusivos de root. La ubicación predeterminada de los cambios se detecta automáticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sin `--profile`, la política histórica MiniOS omite directorios vacíos, cachés, registros, datos de arranque, rutas de ejecución, pseudo-sistemas de archivos y ciertos archivos de sesión y sistema. Esto es conveniente para la creación tradicional de módulos, pero no es una garantía explícita de privacidad.

Los perfiles explícitos son:

- `exact` conserva los cambios representables, incluidos datos de usuario, registros, cachés, archivos de identidad, credenciales y metadatos de eliminación compatibles. Rechaza objetos de sistema de archivos no soportados en vez de perderlos silenciosamente.
- `clean` utiliza una lista blanca de rutas orientada al software. Excluye datos de home y root, registros, cachés, identidades, configuración de red, credenciales, configuración arbitraria del sistema y `/usr/local`. Reduce la exposición de privacidad pero no puede garantizar que un archivo de software permitido no contenga secretos.
- `selected` incluye solo rutas relativas revisadas de un archivo de inventario y selección. Las exclusiones explícitas prevalecen. Este es el perfil adecuado cuando el módulo debe contener un subconjunto controlado de los cambios de la sesión.

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

Las rutas son rutas normalizadas y no vacías relativas a la raíz de cambios. Genere y revise primero el inventario; cada inclusión debe coincidir con los datos del inventario. El inventario registra metadatos como ruta, tipo, categoría, sensibilidad y tamaño, pero no lee ni emite el contenido de los archivos, objetivos de enlaces simbólicos ni valores secretos. Las salidas y los inventarios de perfil explícito son modo `0600`; los módulos de política heredada son modo `0644`.

La captura de sesión puede conservar eliminaciones de archivos compatibles y opacidad de directorios para el backend activo AUFS o OverlayFS. Se excluyen los montajes en tiempo de ejecución, sistemas de archivos anidados, registros de unión y la propia salida. Un destino existente nunca se reemplaza.

### Inspeccionar y extraer módulos

Inspeccione un módulo sin montarlo ni extraerlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

La inspección no requiere root y también funciona fuera de una sesión MiniOS en ejecución.

Extraiga un módulo en un nuevo directorio:

```bash
sb2dir 06-example.sb example-root
```

La extracción ordinaria no requiere root y no modifica el origen. El directorio de destino no debe existir. Los archivos especiales se rechazan a menos que `--allow-special` se solicite con privilegios suficientes.

Para un directorio que pueda ser reempaquetado fielmente, extraiga con privilegios de administrador y conserve la propiedad y archivos especiales:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

La extracción registra el origen del módulo en `.minios-module-origin.json` dentro del nuevo directorio. La extracción sin root registra que la propiedad no se conservó; dicho directorio no puede volver a pasarse a `dir2sb`. Mantenga el registro de origen con una extracción privilegiada hasta reempaquetar.

Los directorios producidos por `sb2dir` actuales son directorios ordinarios. `rmsbdir`, `sb rm`, y `sb rmdir` son comandos de compatibilidad retirados que siempre rechazan la eliminación; no desmontan ni eliminan recursivamente nada. Revise una ruta extraída y su contenido antes de eliminarla con las herramientas estándar del sistema de archivos.

### Gestionar módulos en ejecución y de próximo arranque

En ejecución y Próximo arranque son composiciones independientes. Consulte [construcción de uniones y activación en tiempo de ejecución](/reference/boot-process/Module-Loading#union-construction) para el límite entre arranque y ejecución y por qué las dos listas pueden diferir.

Liste los módulos que realmente componen la raíz AUFS o OverlayFS actual, de menor a mayor prioridad:

```bash
sb list
sb list --json
```

Liste los módulos seleccionados por las reglas de arranque actuales:

```bash
sb next-boot
sb next-boot --json
```

Estas consultas no requieren root. Las reglas canónicas de [niveles candidatos y reemplazo](/reference/boot-process/Module-Loading#candidate-tiers) determinan qué fuente suministra cada nombre base de Próximo arranque.

Para poner un módulo de usuario disponible en el próximo arranque:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utiliza almacenamiento duradero y escribible adecuado, prepara y valida la copia, y la publica atómicamente sin reemplazar un módulo existente. El nombre de archivo debe cumplir los filtros de arranque actuales. Elimine un módulo de usuario seleccionado por su nombre base exacto:

```bash
sudo sb next-boot remove 50-extra.sb
```

No se permite eliminar módulos base ni módulos en fuentes de solo lectura o volátiles.

La activación en tiempo de ejecución es una operación separada, solo para la sesión:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

La activación y desactivación solo funcionan cuando `/` es actualmente una unión AUFS. No están disponibles en OverlayFS, y el soporte de AUFS en el kernel no es suficiente. Ningún comando modifica Próximo arranque.

El despachador de conversión de compatibilidad requiere ambos operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

El uso directo de `dir2sb` y `sb2dir` es preferible porque la conversión ordinaria puede ejecutarse sin root.

### Documentación relacionada

- [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carga de módulos en initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Reconstrucción de imágenes ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Compilación de MiniOS](/development/Building-MiniOS)
- [Parámetros de arranque](/reference/Boot-Parameters)
