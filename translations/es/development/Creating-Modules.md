# Creación de módulos

Los módulos de MiniOS son imágenes de sistema de archivos SquashFS de solo lectura, que convencionalmente se nombran con la extensión `.sb`. Al iniciar, MiniOS organiza los módulos seleccionados en un sistema de archivos raíz en capas. Los archivos en una capa de mayor prioridad pueden complementar u ocultar archivos de capas inferiores.

Esta guía documenta los flujos de trabajo actuales por línea de comandos de las MiniOS Tools. Para la aplicación gráfica, consulta el [MiniOS Module Manager](/administration/Module-Manager.md). Para el proceso completo de construcción de imágenes y la arquitectura del sistema, consulta [Building MiniOS](/development/Building-MiniOS.md). Las listas de paquetes utilizadas durante la construcción de MiniOS se describen en la [documentación de CondinAPT](/development/CondinAPT.md).

## Límites de seguridad y privilegios

No todas las operaciones con módulos requieren privilegios de root:

| Operación | Privilegio |
|---|---|
| Listar módulos en ejecución ahora o en el próximo arranque con `sb` | Sin root |
| Inspeccionar un módulo con `sb inspect` | Sin root |
| Conversión ordinaria con `dir2sb` y `sb2dir` | Sin root |
| Conservar propiedad o permitir archivos especiales durante la conversión | Root |
| Construir con `apt2sb`, `script2sb` o `chroot2sb` | Root |
| Capturar la sesión con `savechanges` | Root |
| Activar, desactivar, agregar a Próximo Arranque o quitar de Próximo Arranque | Root |

Los constructores usan una unión aislada y no instalan paquetes ni aplican cambios de scripts en el root en ejecución. La creación tampoco activa el resultado ni lo selecciona para el próximo arranque.

Los conversores y constructores actuales usan publicación sin reemplazo. Un destino que ya existe, incluyendo enlaces simbólicos, no se sobrescribe. Elige una nueva ruta de salida o revisa y elimina manualmente la salida anterior.

Utiliza la salida `--help` de cada comando como referencia de la versión instalada. Las opciones estándar de compresión del constructor son `zstd` (por defecto), `gzip`, `lzo` y `xz`; `dir2sb` también admite `lz4`.

## Nombres de módulos y niveles de filtrado

Los nombres suelen comenzar con un número como `06-browser.sb` porque el orden de las capas afecta la resolución de conflictos. Un módulo debe contener rutas relativas a la raíz del sistema, como `usr/bin/example`, y no un directorio adicional que contenga ese árbol.

La opción `--level LEVEL` en `apt2sb`, `script2sb` y `chroot2sb` limita las capas base utilizadas para construir la unión de compilación. Con `--level 3`, se usan las capas numeradas hasta `03` y se filtran las de mayor número. Esto puede hacer que un módulo dependa menos de capas opcionales superiores, a costa de incluir más dependencias en el resultado.

## Crear un módulo a partir de paquetes

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

## Crear un módulo a partir de un script

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

Revisa el script antes de ejecutarlo. Se ejecuta con privilegios de administrador y puede ejecutar comandos arbitrarios. Usa `chroot2sb` en su lugar si la instalación requiere indicaciones o trabajo manual.

## Crear un módulo de forma interactiva

`chroot2sb` crea una unión de compilación privada y abre una shell de root dentro de ella. Instala paquetes o edita archivos, luego sal de la shell para capturar los cambios:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Los comandos introducidos en la shell no se reproducen cuando se carga el módulo; el módulo es una instantánea del estado resultante del sistema de archivos. El historial de la shell se elimina del resultado. Si no se proporciona un nombre, el nombre generado usa la fecha y hora actuales.

El ciclo dividido `prepare`, `shell`, `finish` y `cancel` existe para interfaces gráficas protegidas. Para uso normal en terminal, utiliza el comando interactivo único mostrado arriba.

## Crear un módulo a partir de un directorio

`dir2sb` empaqueta el contenido de un directorio preparado en un nuevo módulo. Ambos operandos son obligatorios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversión ordinaria no requiere root. Deja la fuente sin cambios, normaliza la propiedad dentro del módulo a root, rechaza nodos de dispositivo, sockets y FIFOs, y nunca sobrescribe el destino. Usa `--keep-ownership` o `--allow-special` solo cuando se requieran esos comportamientos privilegiados.

## Capturar cambios de la sesión actual

`savechanges` lee la capa de escritura autorizada de una sesión MiniOS en ejecución. Requiere root porque esa capa puede contener archivos accesibles solo por root. La ubicación predeterminada de los cambios se detecta automáticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sin `--profile`, la política histórica de MiniOS omite directorios vacíos, cachés, registros, datos de arranque, rutas de ejecución, pseudo-sistemas de archivos y archivos seleccionados de sesión y sistema. Esto es conveniente para la creación tradicional de módulos, pero no es una garantía explícita de privacidad.

Los perfiles explícitos son:

- `exact` conserva los cambios representables, incluyendo datos de usuario, registros, cachés, archivos de identidad, credenciales y metadatos de eliminación compatibles. Rechaza objetos de sistema de archivos no soportados en lugar de perderlos silenciosamente.
- `clean` utiliza una lista blanca restringida de rutas orientada a software. Excluye datos de usuario y root, registros, cachés, identidades, configuración de red, credenciales, configuración arbitraria del sistema y `/usr/local`. Reduce la exposición de privacidad pero no puede garantizar que un archivo de software permitido no contenga secretos.
- `selected` incluye solo rutas relativas revisadas de un archivo de inventario y selección. Las exclusiones explícitas prevalecen. Este es el perfil adecuado cuando el módulo debe contener un subconjunto controlado de los cambios de la sesión.

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

Las rutas son rutas normalizadas y no vacías relativas a la raíz de los cambios. Genera y revisa primero el inventario; cada inclusión debe coincidir con los datos del inventario. El inventario registra metadatos como ruta, tipo, categoría, sensibilidad y tamaño, pero no lee ni emite contenidos de archivos, destinos de enlaces simbólicos ni valores secretos. Las salidas y los inventarios de perfiles explícitos están en modo `0600`; los módulos de política heredada están en modo `0644`.

La captura de sesión puede conservar eliminaciones de archivos soportadas y la opacidad de directorios para el backend activo AUFS u OverlayFS. Excluye montajes en tiempo de ejecución, sistemas de archivos anidados, registros de la unión y la propia salida. Un destino existente nunca se reemplaza.

## Inspeccionar y extraer módulos

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

Los directorios producidos por `sb2dir` actuales son directorios ordinarios. `rmsbdir`, `sb rm` y `sb rmdir` son comandos de compatibilidad retirados que siempre rechazan la eliminación; no desmontan ni eliminan recursivamente nada. Revisa una ruta extraída y su contenido antes de eliminarla con las herramientas estándar del sistema de archivos.

## Gestionar módulos en ejecución y para el próximo arranque

"Running Now" y "Next Boot" son composiciones independientes.

Lista los módulos que realmente componen la raíz AUFS u OverlayFS actual, de menor a mayor prioridad:

```bash
sb list
sb list --json
```

Lista los módulos seleccionados por las reglas de arranque actuales, incluyendo `bext`, `load` y `noload`:

```bash
sb next-boot
sb next-boot --json
```

Estas consultas no requieren root. Un módulo para el próximo arranque puede provenir del árbol de datos base, su directorio `modules/` o almacenamiento separado de módulos persistentes. Una fuente posterior con el mismo nombre base reemplaza la selección anterior.

Para poner un módulo de usuario disponible en el próximo arranque:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utiliza almacenamiento duradero y escribible adecuado, prepara y valida la copia, y la publica atómicamente sin reemplazar un módulo existente. El nombre de archivo debe cumplir los filtros de arranque actuales. Elimina un módulo de usuario seleccionado por su nombre base exacto:

```bash
sudo sb next-boot remove 50-extra.sb
```

La eliminación se rechaza para módulos base y módulos en fuentes de solo lectura o volátiles.

La activación en tiempo de ejecución es una operación separada, solo para la sesión actual:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

La activación y desactivación solo funcionan cuando `/` es actualmente una unión AUFS. No están disponibles en OverlayFS, y el soporte AUFS del kernel por sí solo no es suficiente. Ningún comando modifica el próximo arranque.

El despachador de conversión de compatibilidad requiere ambos operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

El uso directo de `dir2sb` y `sb2dir` es preferible porque la conversión ordinaria puede ejecutarse sin root.

## Documentación relacionada

- [MiniOS Module Manager](/administration/Module-Manager.md)
- [Reconstrucción de imágenes ISO](/development/Rebuilding-ISO.md)
- [Building MiniOS](/development/Building-MiniOS.md)
- [Parámetros de arranque](/configuration/Boot-Parameters.md)
