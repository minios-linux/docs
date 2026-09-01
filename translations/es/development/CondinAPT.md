---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# CondinAPT

CondinAPT selecciona e instala paquetes APT desde una lista cuyas entradas pueden depender de variables de configuración de Bash. MiniOS lo utiliza para comprobaciones de requisitos previos del host, el conjunto principal de paquetes y módulos ordinarios de SquashFS.

Esta página documenta la implementación en `linux-live/condinapt`. CondinAPT no es un solucionador de dependencias general: primero evalúa los filtros y la disponibilidad de los repositorios, construye las colas de APT y luego instala cada cola seleccionada en una sola llamada a `apt-get`.

## Sinopsis

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

La lista de paquetes y la configuración deben ser archivos regulares y legibles. Los archivos de mapeo y prioridad son opcionales.

| Opción | Significado |
| --- | --- |
| `-l`, `--package-list PATH` | Archivo de lista de paquetes |
| `-c`, `--config PATH` | Configuración de Bash confiable |
| `-m`, `--filter-mapping PATH` | Mapeo de prefijo a variable |
| `-P`, `--priority-list PATH` | Expresiones regulares de Bash para extracción de prioridad |
| `-s`, `--simulation` | Seleccionar y mostrar paquetes sin instalarlos |
| `-C`, `--check-only` | Comprobar nombres de paquetes instalados sin instalación |
| `-v`, `--verbose` | Diagnóstico de filtrado y colas |
| `-vv`, `--very-verbose` | Diagnóstico adicional de colas prioritarias |
| `-x`, `--xtrace` | Habilitar trazado de shell |
| `-f`, `--force` | Ejecutar `apt-get update` incluso cuando existe `pkgcache.bin` |
| `-h`, `--help` | Mostrar ayuda |

CondinAPT ejecuta `apt-get update` cuando no está en modo solo comprobación y se ha usado `-f` o no existe `/var/cache/apt/pkgcache.bin`. Esto incluye la simulación, por lo que `-s` no es una ejecución en seco sin efectos secundarios.

La instalación normal requiere privilegios de root. El modo solo comprobación puede ejecutarse sin privilegios; la simulación también necesita root si desencadena una actualización de APT. La implementación actual no propaga de forma fiable un fallo de `apt-get update`, así que trate un error de actualización como una ejecución fallida incluso si CondinAPT devuelve después `0`.

## Archivos de entrada

### Configuración

El archivo `-c` se importa con Bash. Es código ejecutable, no un formato de datos inerte, así que utilice solo un archivo confiable.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Los arrays indexados proporcionan filtros de pertenencia. Un escalar que contiene comas sigue siendo una sola cadena exacta: `FEATURES="web,database"` no coincide con `+feat=web`.

La implementación actual analiza las opciones de la CLI antes de importar este archivo.
Las variables de configuración que reutilizan nombres internos de CondinAPT, como `VERBOSITY_LEVEL`, pueden por tanto sobrescribir el estado de la CLI. Evite tales nombres en configuraciones genéricas.

### Mapeo de filtros

El archivo opcional `-m` asigna prefijos cortos a nombres de variables de Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

El formato es exactamente `prefix=VariableName`; los espacios en blanco alrededor no se eliminan. Las líneas vacías y aquellas cuyo primer campo comienza con `#` se ignoran.
Los prefijos duplicados usan el último valor.

Sin una entrada de mapeo, el prefijo en sí se trata como el nombre de la variable. Un escalar no definido se comporta como una cadena vacía. Un filtro negativo mal escrito puede incluir silenciosamente un paquete, así que prefiera un mapeo y use la simulación detallada al añadir filtros.

### Lista de paquetes

La gramática segura para las líneas es:

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Ejemplos:

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Todo lo que va desde el primer `#` hasta el final de la línea se elimina. El espacio en blanco restante se normaliza. No se admite el uso de comillas, escapes, paréntesis, grupos anidados ni espacios dentro de un solo token de filtro. Los tokens desconocidos al final no se rechazan, así que trate la gramática anterior como una restricción en lugar de confiar en un análisis permisivo.

Use un objetivo de versión por línea física y colóquelo al final. CondinAPT extrae el objetivo antes de evaluar alternativas de paquetes, por lo que diferentes valores de `@release` no pueden asignarse a alternativas en la misma línea.

## Filtros

Un filtro compara un valor de configuración usando igualdad exacta de cadenas, sensible a mayúsculas y minúsculas. Si la variable mapeada es un array indexado, la igualdad con cualquier elemento del array es válida. Los arrays asociativos no son conjuntos de pertenencia.

| Forma | Efecto |
| --- | --- |
| `+x=value` | Incluir solo cuando coincide `x` |
| `-x=value` | Excluir cuando coincide `x` |
| `+{a|b}` | Requiere que al menos un miembro coincida |
| `+{a&b}` | Requiere que todos los miembros coincidan |
| `-{a|b}` | Excluir cuando algún miembro coincida |
| `-{a&b}` | Excluir solo cuando todos los miembros coincidan |

Los filtros positivos simples repetidos con el mismo prefijo son alternativas:

```text
audacity +pv=toolbox +pv=ultra
```

Los filtros positivos con diferentes prefijos deben pasar todos. Cada filtro negativo simple es un veto independiente:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Los miembros de un grupo deben usar solo un tipo de operador. No mezcle `|` y `&` en un mismo grupo; no hay precedencia ni anidamiento dentro de los grupos. Exprese "excluir Flux, o mínimo Xfce" como dos filtros:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternativas y conjunciones

`&&` tiene mayor precedencia que `||`. CondinAPT divide primero las alternativas y luego evalúa cada miembro de una conjunción, así que:

```text
A || B && C
```

significa `A || (B && C)`.

CondinAPT selecciona la primera alternativa cuyos filtros y comprobaciones de disponibilidad de paquetes pasan todos. Si un miembro de una conjunción falla, los paquetes ya seleccionados de esa conjunción se revierten y se evalúa la siguiente alternativa.

Esto es una selección previa, no un reintento de instalación ni una transacción. Si más tarde falla la `apt-get install` a nivel de cola para la alternativa elegida, CondinAPT no vuelve a una rama posterior de `||`.

Cada alternativa debe repetir sus propios filtros:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Paquetes obligatorios

`!` se reconoce solo al inicio de la expresión física completa y se aplica a todas sus alternativas:

```text
!preferred-package || fallback-package
```

La expresión es fatal en modo normal solo cuando ninguna alternativa tiene éxito y un paquete activo o una versión estricta no está disponible. Los filtros pueden deshabilitar una línea obligatoria sin fallo. Un fallo normal de instalación de APT aborta su cola independientemente de `!`.

En simulación, un error de disponibilidad obligatorio se informa pero no detiene el procesamiento de la cola; la simulación igualmente termina con su estado documentado distinto de cero.

## Versiones

| Sintaxis | Comportamiento |
| --- | --- |
| `package=VERSION` | Prefiere la versión exacta; si no, usa un candidato sin versión |
| `package==VERSION` | Acepta solo la versión exacta del repositorio |

La disponibilidad exacta se compara con el campo de versión completo de `apt-cache madison`. Si una versión estricta no obligatoria no está disponible, esa condición falla; una alternativa posterior de `||` aún puede pasar, de lo contrario la línea se omite. Anteponga la expresión con `!` para que un fallo de disponibilidad activa sea fatal.

Cuando CondinAPT instala la versión exacta solicitada, programa `apt-mark hold` después de que toda la cola de APT tenga éxito. Una versión exacta ya instalada se considera satisfecha y no se retiene de nuevo. Los fallos de retención no se propagan como el estado de salida de CondinAPT.

Para un paquete instalado sin versión, CondinAPT compara la versión instalada con el candidato del repositorio. Si el candidato difiere, se vuelve a poner en cola; APT se llama con `--allow-downgrades`.

## Colas

`---` finaliza la cola normal actual. Cada paquete seleccionado en una cola se pasa a una sola llamada no interactiva de `apt-get install` con `--force-confdef`, `--force-confold`, `--allow-downgrades` y `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Las líneas dirigidas a una versión se eliminan del flujo normal de colas y se agrupan globalmente por versión. Las líneas para la misma versión se fusionan incluso si están separadas por `---`.
El orden efectivo de ejecución es:

1. Cola prioritaria sin objetivo.
2. Colas prioritarias con objetivo de versión.
3. Colas normales en orden de origen.
4. Colas restantes con objetivo de versión en el orden de primera aparición.

Por lo tanto, una línea objetivo escrita entre dos líneas normales no forma una barrera, y las colas objetivo se ejecutan después de todas las colas normales, a menos que se extraigan como trabajo prioritario.

La comprobación previa de disponibilidad de repositorios no es consciente de objetivos; solo la `apt-get install` final recibe `-t RELEASE`. Verifique los paquetes dirigidos contra los repositorios configurados.

## Lista de prioridades

`-P` lee una expresión regular extendida de Bash por línea. Un patrón se compara con el primer nombre de paquete en cada expresión de la lista de paquetes. Si coincide, la expresión completa, incluidos filtros, alternativas, estado obligatorio y objetivo de versión, se mueve a una cola prioritaria.

```text
^dkms$
^linux-.*
```

Los patrones no tienen anclaje salvo que incluyan anclas. Hacer coincidir un paquete `&&` o `||` posterior no tiene efecto; solo se inspecciona el primer token de paquete. La extracción prioritaria también fusiona coincidencias de colas normales separadas, así que no la use para entradas cuyo límite original de `---` sea necesario para la gestión de dependencias.

Prioridad significa evaluación e instalación anticipada, no instalación garantizada. Los filtros y comprobaciones de disponibilidad siguen aplicándose.

## Modos de operación y estado de salida

### Simulación

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

La simulación evalúa filtros, versiones, alternativas y colas, luego imprime los paquetes que se pasarían a APT. No garantiza que la instalación posterior vaya a tener éxito. Una simulación válida termina intencionadamente con estado `1`, incluso cuando la selección de paquetes es exitosa.

### Solo comprobación

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

El modo solo comprobación evalúa filtros y operadores pero solo comprueba si los nombres de los paquetes están instalados mediante `dpkg-query`. No valida versiones solicitadas, candidatos de repositorio ni objetivos de versión. Devuelve `0` cuando todas las expresiones activas están satisfechas y `1` en caso contrario.

El comando `sudo apt install ...` impreso es solo un diagnóstico aproximado. Pierde versiones y objetivos de versión, puede incluir múltiples alternativas fallidas y no garantiza reproducir la expresión original.

### Resumen de estado

| Caso | Estado |
| --- | --- |
| Ayuda | `0` |
| Ejecución normal exitosa | `0` |
| Entrada no válida, fallo de disponibilidad obligatoria o fallo de cola APT | `1` |
| Simulación válida | `1` |
| Solo comprobación con paquetes activos faltantes | `1` |

## Manejo especial de paquetes

La implementación tiene un nombre de paquete especial: `qemu-kvm`. Se acepta cuando `apt-cache show qemu-kvm` informa que es puramente virtual. Otros paquetes virtuales no tienen resolución genérica de proveedor. Prefiera alternativas de proveedor explícitas cuando la portabilidad sea importante.

## Integración de MiniOS

### Invocación de módulos

Para un módulo ordinario, `build-modules` copia el script de instalación a `/install`, CondinAPT a `/condinapt`, la configuración generada a `/minios_build.conf` y el mapeo a `/condinapt.map`. Un script de instalación convencional es:

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

Use `SCRIPT_DIR`; `$CWD` no forma parte del contrato de módulo ordinario.
`00-core` es una etapa especial de construcción anterior e invoca la copia del árbol fuente bajo `/linux-live` en su lugar.

El generador actual de módulos ordinarios solo copia automáticamente un archivo llamado `packages.list`. Los módulos que usen nombres de lista adicionales deben gestionar esos archivos explícitamente; no asuma que cada archivo junto a `install` aparece en la raíz del chroot.

### Mapa de filtros MiniOS

Actualmente, `linux-live/condinapt.map` define:

| Prefijo | Variable | Significado |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite objetivo |
| `da` | `DISTRIBUTION_ARCH` | Arquitectura objetivo |
| `dp` | `DISTRIBUTION_PROFILE` | Familia de paquetes `debian` o `ubuntu` |
| `is` | `INIT_SYSTEM` | Sistema init seleccionado |
| `de` | `DESKTOP_ENVIRONMENT` | Entorno de módulo |
| `pv` | `PACKAGE_VARIANT` | Variante de paquete |
| `ik` | `INSTALL_KERNEL` | Alternancia de instalación de kernel |
| `kf` | `KERNEL_FLAVOUR` | Sabor de kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` o `minios` |
| `ks` | `KERNEL_SERIES` | Serie real de kernel durante la selección DKMS de `01-kernel` |
| `kc` | `KERNEL_CAPABILITIES` | Array de capacidades detectadas durante la selección DKMS de `01-kernel` |
| `kbd` | `KERNEL_BUILD_DKMS` | Alternancia de compilación DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementación de initramfs |
| `lo` | `LOCALE` | Configuración regional del sistema |
| `ml` | `MULTILINGUAL` | Alternancia multilingüe |
| `kl` | `KEEP_LOCALES` | Alternancia de retención de locales |

`ks` y `kc` son filtros especiales de `01-kernel`. Cuando la compilación DKMS está habilitada, ese módulo detecta `KERNEL_SERIES` del kernel instalado y crea el array indexado `KERNEL_CAPABILITIES` en una configuración temporal utilizada para la selección de paquetes DKMS. No están presentes en configuraciones de módulos ordinarios; usarlos allí hace que los filtros positivos fallen y los negativos puedan pasar.
`KERNEL_SERIES` no es la preferencia de `MINIOS_KERNEL_SERIES`. Las capacidades detectadas actualmente incluyen `aufs`, `ntfs3`, `btf_modules` y los drivers in-tree soportados `rtw88_*`.

Ejemplos de la lista de paquetes del kernel actual:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Resolución de problemas

Utilice la simulación detallada para inspeccionar la selección:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

No use `/dev/stdin`; `-l` requiere un archivo regular.

- Si un filtro pasa inesperadamente, verifique el mapeo exacto del prefijo, el tipo de variable, mayúsculas/minúsculas y valor. Compruebe si hay una variable no definida o mal escrita.
- Si no se selecciona una alternativa, recuerde que la selección alternativa ocurre durante la preselección, no después de un fallo de APT a nivel de cola.
- Si falla un paquete dirigido, revise las fuentes configuradas y ejecute `apt-cache policy PACKAGE`; la preselección no aplica `-t RELEASE`.
- Si se omite una versión estricta, compare el campo de versión exacto con `apt-cache madison PACKAGE`.
- Si el orden de las colas es inesperado, tenga en cuenta el agrupamiento global de objetivos y la extracción prioritaria antes de las colas normales.

Para el flujo de trabajo de construcción completo, consulte [Compilando MiniOS](/development/Building-MiniOS).
