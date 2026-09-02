---
updated: 2026-08-28
---

# Carga de módulos

Esta página explica qué modifican los parámetros de arranque `load`, `noload`, `bext`, `union` y `toram=trim`. Son controles avanzados. Un arranque normal carga automáticamente el conjunto de módulos proporcionado por la imagen seleccionada de MiniOS.

MiniOS selecciona y monta su conjunto de módulos en el initrd, antes de entregar la raíz unificada al sistema init instalado. Utiliza esta página cuando un módulo del medio de arranque no aparece en el sistema en ejecución o cuando un filtro cambia el inicio de manera inesperada.

## En lenguaje sencillo

MiniOS se ensambla a partir de módulos `.sb` numerados y de solo lectura. Los números más bajos se cargan primero; los números más altos pueden reemplazar archivos de módulos con números más bajos. Una sesión escribible, cuando está activa, se sitúa por encima de todos los módulos de solo lectura.

Los parámetros `load=` y `noload=` filtran las rutas de los módulos antes del ensamblado. Utilizan coincidencia por expresiones regulares en lugar de una lista segura de nombres exactos, por lo que un filtro amplio puede dejar fuera módulos esenciales del núcleo o del sistema necesarios para el arranque.

## Parámetros explicados

| Parámetro | Qué le indica a MiniOS | Riesgo principal |
|---|---|---|
| `load=PATTERN` | Mantener solo los candidatos a módulo cuyas rutas coincidan con el patrón. | Un patrón incompleto puede omitir módulos necesarios. |
| `noload=PATTERN` | Excluir candidatos coincidentes después de aplicar `load=`. | Módulos esenciales del núcleo, kernel, firmware o escritorio pueden quedar fuera del arranque. |
| `bext=EXTENSION` | Tratar otra extensión de archivo como sufijo candidato a módulo. | No convierte archivos ni coordina completamente módulos de kernel. |
| `union=aufs` o `union=overlayfs` | Solicitar el sistema de archivos usado para combinar módulos con la capa escribible. | La activación de módulos en tiempo de ejecución difiere entre AUFS y OverlayFS. |
| `toram=trim` | Copiar solo módulos seleccionados y datos requeridos limitados a RAM. | Los módulos y directorios omitidos no estarán disponibles tras desconectar la fuente. |

Antes de cambiar filtros, registra la línea de comandos y el conjunto de módulos actual. Prueba un cambio a la vez y mantén disponible una entrada de arranque conocida y funcional.

## Niveles de candidatos

Después de localizar el directorio de datos MiniOS, normalmente `minios/`, el initrd examina los módulos candidatos en este orden:

1. Entradas ubicadas directamente dentro de `minios/`. Esta búsqueda no es recursiva.
2. Entradas ubicadas recursivamente debajo de `minios/modules/`.
3. Entradas ubicadas recursivamente debajo de `minios/modules/` en la fuente de persistencia con permisos de escritura registrada por el initrd.

El tercer nivel es independiente del directorio `minios/modules/` en el árbol de datos seleccionado de solo lectura. Permite que los módulos de usuario persistentes sobrescriban archivos de una ISO u otra fuente de solo lectura. Solo está disponible cuando el sistema de persistencia ha publicado una raíz con permisos de escritura que contiene ese directorio.

Las rutas candidatas se simplifican a su nombre base exacto al montarse. Por ejemplo, `modules/work/50-extra.sb` y `modules/test/50-extra.sb` usan ambos el punto de montaje llamado `50-extra.sb`. No se convierten en dos capas independientes. Un candidato en un nivel posterior con el mismo nombre base se monta en el mismo punto de montaje y reemplaza al candidato anterior visible para el ensamblado de la unión.
Por lo tanto, el mismo nombre base debe considerarse como un único espacio de reemplazo, no como una forma de cargar varios módulos desde diferentes directorios.

El formato normal de módulo es una imagen de sistema de archivos SquashFS regular. El escaneo de initrd se basa en el nombre de archivo: selecciona rutas que terminan con la extensión configurada y no verifica primero que cada ruta sea un archivo regular o un SquashFS válido. Por lo tanto, los escaneos recursivos pueden encontrar otro tipo de objeto de sistema de archivos con un nombre coincidente. Un bucle fallido o un montaje de SquashFS se informa mediante `mount`, pero el bucle candidato no hace que ese fallo sea fatal por sí solo y el arranque puede continuar con una capa faltante. Valide archivos dudosos con el flujo de trabajo en [Inspeccionar y extraer módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Orden y precedencia

Durante el descubrimiento, las rutas se ordenan numéricamente por basename. El número inicial en nombres como `00-core.sb`, `01-kernel-VERSION.sb` y `50-extra.sb` es el orden del módulo. Un basename sin número inicial se ordena numéricamente como cero.
Utiliza prefijos numéricos explícitos y distintos en lugar de depender del orden en caso de empate.

La unión final da prioridad a los módulos posteriores y de número más alto sobre los anteriores y de número más bajo. Si dos módulos seleccionados contienen la misma ruta relativa a la raíz, el archivo del módulo de mayor prioridad será el visible. La capa de cambios escribible tiene precedencia sobre todos los módulos de solo lectura.

El reemplazo por nivel ocurre antes de este orden efectivo de módulos. Un `50-extra.sb` de un nivel posterior reemplaza un archivo de un nivel anterior con ese mismo basename, luego su prefijo `50` determina dónde pertenece ese montaje sobreviviente en la unión.

## Extensión de paquete

El parámetro de arranque `bext=` selecciona la extensión de archivo utilizada para el descubrimiento de datos, el filtrado de candidatos y el montaje de módulos. Su valor predeterminado es `sb`, por lo que el sufijo habitual de los candidatos es `.sb`:

```text
bext=sb
```

Cambiar `bext` modifica el sufijo de archivo seleccionado; no convierte un archivo ni verifica su formato de sistema de archivos. La coordinación con el kernel es una excepción: siempre busca `01-kernel-VERSION.sb`. Con una extensión personalizada, el escaneo normal de candidatos no selecciona estos módulos de kernel `.sb`.

## Filtros load y noload

`load=` y `noload=` son expresiones regulares extendidas no ancladas que se aplican a las cadenas de ruta de los candidatos producidos por cada nivel. No son listas de nombres exactos. Un valor simple como `kernel` coincide con ese texto en cualquier parte de una ruta, mientras que los anclajes deben suministrarse explícitamente cuando se requiere una posición exacta.
Las rutas varían según el nivel: los candidatos de nivel superior son basenames, los candidatos de datos recursivos incluyen `modules/`, y los de persistencia son rutas absolutas.

Las comas se convierten en alternancia de expresiones regulares. Por ejemplo:

```text
load=core,kernel,firmware
```

se evalúa como `core|kernel|firmware`. Otros caracteres de expresión regular no se escapan.

Un rango numérico solo se expande cuando todo el filtro es un rango ascendente que coincide con `^[0-9]+-[0-9]+$`. Por ejemplo, `load=04-06` se convierte en las alternativas `04|05|06`, con cada valor generado rellenado a al menos dos dígitos. Un rango incrustado en una lista separada por comas u otra expresión no se expande y mantiene su significado ERE ordinario.

Cuando ambos parámetros están presentes, el initrd aplica primero `load=` y luego elimina coincidencias con `noload=`. Así, `noload=` prevalece. No existe un conjunto protegido de módulos esenciales o de kernel: los filtros pueden excluir `00-core`, el `01-kernel` coordinado o cualquier otro candidato. Tal selección puede construir una raíz incompleta o impedir el arranque.

## Coordinación del kernel en ejecución

La versión del kernel en ejecución se toma de un token `vmlinuz-VERSION` en la línea de comandos del kernel cuando está disponible, con `uname -r` como alternativa. Antes de montar los módulos, el initrd coordina este triplete de nivel superior:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Si falta algún miembro, el initrd busca los tres archivos en:

```text
minios/kernels/VERSION/
```

Cuando el triplete del repositorio está completo, copia el módulo a `minios/` y los archivos de arranque a `minios/boot/`. Una copia parcial se limpia. Si el triplete no está completo, la configuración del kernel devuelve un fallo, pero el proceso continúa con la etapa normal de montaje de módulos. El sistema resultante aún puede fallar más adelante porque al sistema de archivos raíz le faltan los archivos de soporte para el kernel en ejecución.

Otros archivos de nivel superior que coinciden con `01-kernel-*.sb` se tratan como inactivos. El initrd intenta mover cada módulo inactivo y sus archivos `vmlinuz` y `initrfs` correspondientes a `minios/kernels/VERSION/`. Estas operaciones de repositorio de respaldo y reubicación requieren un árbol de datos escribible; los fallos individuales de reubicación no son fatales. Siempre usan `.sb`, independientemente de `bext=`. Consulta [Gestión de kernels](/preparing-and-customizing/Managing-Kernels) para flujos de trabajo compatibles de instalación y activación de kernels.

## Construcción de la unión

MiniOS selecciona `AUFS` cuando el kernel en ejecución lo soporta y, de lo contrario, utiliza OverlayFS. `union=overlayfs` selecciona OverlayFS. `union=aufs` solicita `AUFS`, pero recurre a OverlayFS si `AUFS` no está disponible.

Con `AUFS`, el initrd primero monta una unión vacía con la rama de cambios escribible y luego inserta cada módulo montado como una rama de solo lectura. Si falla la creación de la unión, el proceso es fatal. Si falla al añadir una rama individual `AUFS`, se realiza el mejor esfuerzo: el arranque continúa con las ramas que se hayan añadido, mientras que MiniOS no marca la persistencia como activa para una unión incompleta.

Con OverlayFS, el conjunto completo de módulos se suministra como una lista `lowerdir` invertida al montar la unión. La capa escribible proporciona su `upperdir` y `workdir`. Si falla el montaje de esa unión, el proceso es fatal. El orden inferior de izquierda a derecha y el orden de inserción de `AUFS` implementan la misma regla: los módulos posteriores, con números más altos, ocultan rutas en conflicto de los módulos anteriores.

Esta composición en tiempo de arranque es distinta de la activación en tiempo de ejecución. Después del inicio, `sb activate` y `sb deactivate` solo pueden modificar una raíz que esté actualmente montada como `AUFS`. Las capas inferiores de OverlayFS no se pueden cambiar en el lugar. La activación en tiempo de ejecución no altera la selección de Next Boot, y añadir un módulo Next Boot no lo activa en la raíz actual. Consulta el [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules).

## Recorte toram

`toram=trim` crea un árbol de datos RAM antes de la persistencia y la coordinación del kernel.
Copia exactamente estos elementos del árbol de datos MiniOS seleccionado:

- `config.conf`, que es requerido por esta ruta de copia.
- `authorized_keys` cuando existe como archivo regular.
- Candidatos de nivel superior que coincidan con la extensión seleccionados por `load=` y `noload=`.
- Candidatos seleccionados que coincidan con la extensión recursivamente bajo `modules/`, conservando sus directorios relativos.
- El árbol completo `changes/` cuando la línea de comandos solicita persistencia.

No copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, otros datos que no sean módulos, módulos no seleccionados, ni el nivel de módulo de persistencia escribible por separado. En particular, el respaldo de repositorio no puede usar un directorio `kernels/` que se omitió del árbol RAM recortado. El conjunto de módulos copiado se filtra antes de descubrir el nivel de módulo de persistencia.

No hay una comprobación previa de capacidad de RAM. Un fallo al copiar `config.conf` o `changes/` solicitados sale del contexto de ejecución de la función de copia, pero sus llamadores no siempre convierten ese estado en una detención limpia del arranque. Un fallo al copiar `authorized_keys` se informa pero no detiene la copia. Los módulos seleccionados se copian mediante una canalización; un fallo individual de copia de módulo se informa, pero su estado no se propaga de forma fiable para detener la ruta de arranque externa. No hay reversión transaccional de un árbol RAM parcialmente poblado.

Tras la copia, el initrd intenta desmontar el origen, eliminar su antigua ruta de datos y mover el árbol RAM a esa ruta. Solo el éxito de toda esa cadena marca el origen como desconectado. Si la cadena falla, el arranque continúa usando la ruta de staging RAM. Las operaciones relacionadas de desconexión de ISO y Ventoy son "mejor esfuerzo".
Por lo tanto, `toram=trim` no es prueba de que el dispositivo de arranque sea extraíble. No lo desconectes a menos que los diagnósticos confirmen que su sistema de archivos, dispositivo loop y mapeos device-mapper ya no están montados ni en uso.

## Rootcopy y la entrega de la raíz

Después de montar los módulos y construir la unión, el initrd copia el contenido visible de `minios/rootcopy/` directamente en la unión ensamblada. El glob de shell `*` omite las entradas con punto al inicio directamente dentro de `rootcopy/`, aunque los archivos ocultos dentro de un directorio copiado siguen formando parte de esa copia. Esta es una copia de archivos en la vista escribible, no otra capa de módulo de solo lectura, por lo que puede sobrescribir rutas proporcionadas por módulos. Los errores de copia no se consideran fatales en esta función.

Luego, MiniOS realiza su configuración inicial, escribe el `fstab` de la nueva raíz y ejecuta `rootcopy/run/preinit.sh` si está presente, pasando la ruta de la unión como primer argumento. Este script se ejecuta en el entorno del initrd antes de la entrega de la raíz y debe tratarse como código privilegiado de arranque.

En el límite final, el initrd de LiveKit pivota la unión ensamblada a `/`, mantiene el antiguo initrd bajo `/run/initramfs` para tareas de apagado y ejecuta el `init` de la nueva raíz. La ruta de Dracut prepara la misma unión y deja que Dracut realice la `switch_root` final. Una vez cruzado este límite, el arranque ordinario se ejecuta dentro de la raíz compuesta; cambiar archivos en el medio de arranque ya no reconstruye el conjunto de capas inferiores seleccionadas para ese arranque.

## Diagnóstico seguro

Prefiere la inspección de solo lectura y registra la línea de comandos original antes de cambiar filtros:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` muestra la selección actual basada en reglas, mientras que `sb list` muestra las capas que realmente componen la raíz en ejecución. Una diferencia puede indicar un fallo de montaje, reemplazo de basename, un cambio en `AUFS` en tiempo de ejecución o una fuente de selección que cambió tras el arranque.

Para un fallo temprano, añade `debug` para mostrar el trazado de shell, `timing` para los tiempos de las etapas o `rd.break` para abrir una shell tras la configuración del initrd y antes de la entrega final de la raíz. En esa shell, inspecciona `/memory/data`, `/memory/bundles`, los montajes y `/proc/cmdline`; no repares sistemas de archivos ni retires medios mientras estén montados. Captura el primer error de montaje o copia, no solo el síntoma posterior. Consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting) para un flujo de diagnóstico seguro más amplio.

## Documentación relacionada

- [Modos de arranque](/using-minios/Boot-Modes)
- [Detección del sistema](/reference/boot-process/System-Discovery)
- [Persistencia](/reference/boot-process/Persistence-Internals)
- [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules)
- [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Gestión del kernel](/preparing-and-customizing/Managing-Kernels)
- [Solución de problemas](/maintenance-and-recovery/Troubleshooting)
