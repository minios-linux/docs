---
updated: 2026-10-15
program_commits:
    minios-module-manager: 356c7582cf81884d606da388c93c674bf32049ba
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Gestión de módulos

El Gestor de módulos de MiniOS es la aplicación gráfica para inspeccionar, crear y administrar MiniOS `.sb` módulos. Dispone de dos espacios de trabajo: **Módulos** para la composición del sistema y **Crear** para crear nuevos módulos.

Inícielo desde el menú de aplicaciones o ejecute:

```bash
minios-module-manager
```

La aplicación se ejecuta como su usuario de escritorio. Solo solicita autenticación de administrador cuando una operación lo requiere.

## En ejecución ahora y en el próximo arranque

El espacio de trabajo de Módulos mantiene dos vistas separadas:

- **En ejecución ahora** es el conjunto ordenado de módulos que actualmente componen el sistema en vivo.
- **Próximo arranque** es el conjunto ordenado seleccionado por las reglas de arranque actuales de MiniOS.

Cambiar una vista no modifica la otra automáticamente. Por ejemplo, **Activar para esta sesión** afecta solo al sistema en ejecución, mientras que **Agregar al próximo arranque** copia un módulo al almacenamiento duradero de módulos sin activarlo en este momento.

Para conocer las reglas de arranque autorizadas, incluyendo los niveles de origen candidatos, el reemplazo exacto por nombre base, el orden numérico y `load=`, `noload=`, y `bext=` el filtrado, consulta [Carga de módulos Initrd](/reference/boot-process/Module-Loading). Esa guía también explica por qué En ejecución ahora y Próximo arranque pueden diferir.

La activación y desactivación en tiempo de ejecución solo están disponibles cuando el sistema de archivos raíz utiliza actualmente AUFS. No están disponibles en un sistema raíz OverlayFS, incluso si el kernel admite AUFS. Los módulos base no pueden desactivarse desde la aplicación.

Los cambios para el próximo arranque solo están disponibles si existe almacenamiento de módulos duradero y escribible. Al deshabilitar un módulo de usuario, este se mueve a un almacenamiento `modules-disabled/` relacionado en lugar de eliminarlo; se puede restaurar más adelante. La eliminación permanente es una acción separada para los módulos deshabilitados. Los módulos base y los módulos en almacenamiento de solo lectura o volátil no pueden deshabilitarse. Los filtros de arranque como `load`, `noload`, y `bext` siguen determinando qué módulos se seleccionan.

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

- [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Carga de módulos en initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Composición de imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parámetros de arranque](/reference/Boot-Parameters)

<a id="creating-modules"></a>

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

### Nombres de módulos y niveles de filtro

Los nombres suelen comenzar con un número, como `06-browser.sb`, ya que el orden de las capas afecta la resolución de conflictos. Un módulo debe contener rutas relativas a la raíz del sistema, por ejemplo, `usr/bin/example`, y no un directorio adicional que contenga ese árbol.

Para conocer los niveles exactos de origen candidatos, el comportamiento ante colisiones de nombres base, el orden numérico y `bext=`, `load=` y `noload=` la semántica, consulta [Carga de módulos Initrd](/reference/boot-process/Module-Loading). En particular, utiliza un nombre base único a menos que el módulo esté destinado a reemplazar la ranura con el mismo nombre de un nivel de origen anterior.

La opción `--level LEVEL` en `apt2sb`, `script2sb` y `chroot2sb` limita las capas base utilizadas para construir la unión de compilación. Con `--level 3`, se usan las capas numeradas hasta `03` y se filtran las capas con números superiores. Esto puede hacer que un módulo dependa menos de capas superiores opcionales, aunque aumente la cantidad de dependencias incluidas en el resultado.

<a id="create-a-module-from-packages"></a>

### Crear un módulo a partir de paquetes

`apt2sb` instala paquetes del repositorio o archivos locales legibles `.deb` en una unión de compilación privada y captura el resultado. Requiere una sesión en vivo MiniOS compatible y acceso root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sin `--name`, el nombre de salida se deriva del primer paquete. Algunas opciones útiles de APT incluyen `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, y `--target-release RELEASE`. La opción target-release solo se aplica a `install`.

Para capturar actualizaciones de paquetes ya instalados:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

<a id="create-a-module-from-a-script"></a>

### Crear un módulo a partir de un script

`script2sb` copia un script de instalación en un chroot privado, lo hace ejecutable, lo ejecuta como root sin terminal interactiva, lo elimina y registra los cambios realizados en el sistema de archivos. Si el script falla, no se crea ningún módulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Opcionalmente, `--directory DIR` copia todo el contenido fuente, incluidos los archivos ocultos, en la raíz del módulo antes de ejecutar el script. Organiza el directorio de origen como un árbol de sistema de archivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revisa el script antes de ejecutarlo. Se ejecuta con privilegios de administrador y puede realizar cualquier comando. Utiliza `chroot2sb` en su lugar si la instalación requiere confirmaciones o intervención manual.

<a id="create-a-module-interactively"></a>

### Crear un módulo de forma interactiva

`chroot2sb` crea una unión de compilación privada y abre una shell raíz dentro de ella. Instala paquetes o edita archivos, luego sal de la shell para capturar los cambios:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Los comandos que ingreses en la shell no se reproducen al cargar el módulo; el módulo es una instantánea del estado resultante del sistema de archivos. El historial de la shell se elimina del resultado. Si no se proporciona un nombre, el nombre generado usará la fecha y hora actuales.

El ciclo de vida dividido de `prepare`, `shell`, `finish` y `cancel` existe para las interfaces gráficas protegidas. Para el uso normal en terminal, utiliza el único comando interactivo mostrado arriba.

<a id="create-a-module-from-a-directory"></a>

### Crear un módulo a partir de un directorio

`dir2sb` empaqueta el contenido de un directorio preparado en un nuevo módulo. Ambos operandos son obligatorios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversión ordinaria no conserva la raíz. Deja la fuente sin cambios, convierte los IDs de usuario y grupo comunes (1000–60000) a root fuera de `/home` y `/opt`, mantiene los IDs de sistema y asigna la propiedad de root a los directorios estándar de nivel superior. Rechaza nodos de dispositivo, sockets y FIFOs, y nunca sobrescribe el destino. `--keep-ownership` conserva todos los propietarios originales y `--allow-special` permite archivos especiales; ambas requieren privilegios de root.

`sb2dir` escribe `.minios-module-origin.json` en el directorio extraído. Si la extracción conservó la propiedad, `dir2sb` reconoce este registro y automáticamente conserva propietarios y archivos especiales al volver a empaquetar; el registro en sí no se incluye en el nuevo módulo. Un directorio extraído sin conservar la propiedad no puede volver a empaquetarse, ya que los propietarios originales ya no se conocen. Extrae nuevamente el módulo original utilizando las opciones privilegiadas.

<a id="capture-current-session-changes"></a>

### Capturar los cambios de la sesión actual

`savechanges` lee la capa de escritura autorizada de una sesión en ejecución de MiniOS. Requiere privilegios de root porque esa capa puede contener archivos accesibles solo por root. La ubicación predeterminada de los cambios se detecta automáticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sin `--profile`, la política histórica de MiniOS omite directorios vacíos, cachés, registros, datos de arranque, rutas de ejecución, pseudo-sistemas de archivos y ciertos archivos de sesión y del sistema. Esto es útil para la creación tradicional de módulos, pero no constituye una garantía explícita de privacidad.

Los perfiles explícitos son:

- `exact` conserva los cambios representables, incluyendo datos de usuario, registros, cachés, archivos de identidad, credenciales y metadatos de eliminación compatibles. Rechaza objetos de sistema de archivos no soportados en lugar de descartarlos silenciosamente.
- `clean` utiliza una lista de permitidos de rutas orientada a software. Excluye datos de usuario y root, registros, cachés, identidades, configuración de red, credenciales, configuración arbitraria del sistema y `/usr/local`. Reduce la exposición de privacidad pero no puede garantizar que un archivo de software permitido no contenga información confidencial.
- `selected` incluye solo rutas relativas revisadas desde un archivo de inventario y selección. Las exclusiones explícitas tienen prioridad. Este es el perfil adecuado cuando el módulo debe contener un subconjunto controlado de los cambios de la sesión.

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

Las rutas son normalizadas, no vacías y relativas a la raíz de los cambios. Genere y revise primero el inventario; cada inclusión debe coincidir con los datos del inventario. El inventario registra metadatos como ruta, tipo, categoría, sensibilidad y tamaño, pero no lee ni emite el contenido de archivos, destinos de enlaces simbólicos ni valores confidenciales. Las salidas y los inventarios de perfiles explícitos son en modo `0600`; los módulos de política heredada son en modo `0644`.

La captura de sesión puede conservar eliminaciones de archivos soportadas y la opacidad de directorios para el backend activo AUFS o OverlayFS. Se excluyen los puntos de montaje en tiempo de ejecución, sistemas de archivos anidados, registros internos de unión y la propia salida. Un destino existente nunca se reemplaza.

<a id="inspect-and-extract-modules"></a>

### Inspeccionar y extraer módulos

Inspecciona un módulo sin montarlo ni extraerlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

La inspección es sin privilegios de root y también funciona fuera de una sesión de MiniOS en ejecución.

Extrae un módulo en un nuevo directorio:

```bash
sb2dir 06-example.sb example-root
```

La extracción normal no requiere privilegios de root y no modifica el origen. El directorio de destino no debe existir. Los archivos especiales se rechazan a menos que`--allow-special` se solicite con privilegios suficientes.

Para un directorio que deba poder ser reempaquetado fielmente, extrae con privilegios de administrador y conserva la propiedad y los archivos especiales:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

La extracción registra el origen del módulo en`.minios-module-origin.json` dentro del nuevo directorio. Si la extracción se hace sin privilegios de root, se registra que la propiedad no fue conservada; dicho directorio no puede ser devuelto a`dir2sb`. Mantén el registro de origen con una extracción privilegiada hasta el reempaquetado.

Los directorios producidos por la versión actual de`sb2dir` son directorios comunes.`rmsbdir`, `sb rm`, y `sb rmdir` son comandos de compatibilidad retirados que siempre rechazan la eliminación; no desmontan ni eliminan nada de forma recursiva. Revisa una ruta extraída y su contenido antes de eliminarla con las herramientas estándar del sistema de archivos.

<a id="manage-running-and-next-boot-modules"></a>

### Gestionar módulos en ejecución y para el próximo arranque

Las composiciones de "En ejecución" y "Próximo arranque" son independientes. Consulta [construcción de uniones y activación en tiempo de ejecución](/reference/boot-process/Module-Loading#union-construction) para conocer el límite entre arranque y ejecución, y por qué las dos listas pueden diferir.

Enumera los módulos que realmente componen la raíz actual AUFS o OverlayFS, desde la prioridad más baja hasta la más alta:

```bash
sb list
sb list --json
```

Enumera los módulos seleccionados por las reglas de arranque actuales:

```bash
sb next-boot
sb next-boot --json
```

Estas consultas no dependen de la raíz. Las reglas canónicas de [niveles de candidatos y reemplazo](/reference/boot-process/Module-Loading#candidate-tiers) determinan qué origen proporciona cada nombre base de Próximo arranque.

Para que un módulo de usuario esté disponible en el próximo arranque:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utiliza almacenamiento duradero y escribible adecuado, prepara y valida la copia, y la publica de forma atómica sin reemplazar un módulo existente. El nombre de archivo debe cumplir con los filtros de arranque actuales. Para deshabilitar un módulo de usuario seleccionado, usa su nombre base exacto:

```bash
sudo sb next-boot disable 50-extra.sb
```

La desactivación conserva el archivo en `modules-disabled/`. El comando anterior `next-boot remove` es un alias de deshabilitar, no una eliminación permanente. Puedes restaurarlo o eliminarlo permanentemente con:

```bash
sudo sb next-boot enable 50-extra.sb
# To delete it permanently, disable it first:
sudo sb next-boot disable 50-extra.sb
sudo sb next-boot delete 50-extra.sb
```

Los módulos base y los módulos en orígenes de solo lectura o volátiles no se pueden deshabilitar. La eliminación permanente también rechaza un módulo activo. Revisa `sb next-boot` y su lista de módulos deshabilitados antes de borrar el archivo retenido.

La activación en tiempo de ejecución es una operación independiente y solo para la sesión actual:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

La activación y desactivación solo funcionan cuando `/` es actualmente una unión AUFS. No están disponibles en OverlayFS, y el soporte del kernel AUFS por sí solo no es suficiente. Ningún comando modifica el Próximo arranque.

El despachador de conversión de compatibilidad requiere ambos operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

El uso directo de `dir2sb` y `sb2dir` es preferible porque la conversión ordinaria puede ejecutarse sin raíz.

### Documentación relacionada

- [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carga de módulos en initrd](/reference/boot-process/Module-Loading)
- [Modos de arranque](/using-minios/Boot-Modes)
- [Reconstrucción de imágenes ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Compilación de MiniOS](/development/Building-MiniOS)
- [Parámetros de arranque](/reference/Boot-Parameters)
