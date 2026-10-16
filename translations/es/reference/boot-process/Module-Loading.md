---
updated: 2026-10-15
---

# Carga de módulos

Esta página explica qué modifican los parámetros de arranque `load`, `noload`, `bext`, `union` y `toram=trim`. Son controles avanzados. Un arranque normal carga automáticamente el conjunto de módulos proporcionado por la imagen seleccionada de MiniOS.

MiniOS selecciona y monta su conjunto de módulos en el initrd, antes de entregar la raíz unificada al sistema init instalado. Utiliza esta página cuando un módulo del medio de arranque no aparece en el sistema en ejecución o cuando un filtro cambia el inicio de manera inesperada.

## En lenguaje sencillo

MiniOS se ensambla a partir de módulos `.sb` numerados y de solo lectura. Los números más bajos se cargan primero; los números más altos pueden reemplazar archivos de módulos con números más bajos. Una sesión escribible, cuando está activa, se sitúa por encima de todos los módulos de solo lectura.

Los parámetros `load=` y `noload=` filtran las rutas de los módulos antes del ensamblado. Utilizan coincidencia por expresiones regulares en lugar de una lista segura de nombres exactos, por lo que un filtro amplio puede dejar fuera módulos esenciales del núcleo o del sistema necesarios para el arranque.

## Explicación de los parámetros

| Parámetro | Lo que indica MiniOS | Riesgo principal |
|---|---|---|
| `load=PATTERN` | Mantiene solo los módulos candidatos cuyos caminos coincidan con el patrón. | Un patrón incompleto puede omitir módulos necesarios. |
| `noload=PATTERN` | Excluye los candidatos coincidentes después de `load=` se haya aplicado. | Módulos esenciales del núcleo, kernel, firmware o escritorio pueden quedar fuera del arranque. |
| `bext=EXTENSION` | Trata otra extensión de archivo como un sufijo candidato de módulo. | No convierte archivos ni coordina completamente los módulos del kernel. |
| `union=aufs` o `union=overlayfs` | Solicita el sistema de archivos utilizado para combinar módulos con la capa de escritura. | La activación de módulos en tiempo de ejecución varía entre AUFS y OverlayFS. |
| `toram=trim` | Copia solo los módulos seleccionados y los datos requeridos limitados a RAM. | Los módulos y directorios omitidos no estarán disponibles después de desconectar la fuente. |

Antes de modificar los filtros, guarda la línea de comandos actual y el conjunto de módulos. Prueba un cambio a la vez y mantén disponible una entrada de arranque comprobada.

<a id="candidate-tiers"></a>

## Niveles de candidatos

Después de localizar el directorio de datos MiniOS, normalmente `minios/`, el initrd detecta opcionalmente un árbol externo de MiniOS antes de copiar o activar la sesión de RAM. Una partición de persistencia en la misma unidad o un esquema de datos de Ventoy escribible puede proporcionar ese árbol incluso en un arranque sin sesión guardada. El backend del complemento de persistencia Ventoy seleccionado es un modelo independiente y no ofrece este árbol de módulo externo.

Los candidatos se agrupan en dos categorías:

1. Nombres de módulos de nivel superior del árbol de datos seleccionado y del árbol externo `minios/` , ordenados y sin duplicados por nombre relativo.
2. Archivos y enlaces simbólicos de forma recursiva bajo `modules/` en ambos árboles, ordenados y sin duplicados por ruta relativa.

Para la misma ruta relativa, un archivo regular externo tiene prioridad sobre el ISO u otra fuente seleccionada. Esto aplica tanto a módulos del sistema reemplazados como a módulos adicionales. Los filtros se aplican a las rutas relativas combinadas antes de montar o copiar RAM recortados. La raíz de la partición de persistencia permanece separada de su almacén de sesiones numeradas.

Los puntos de montaje siguen aplanándose a nombres base exactos. Por ejemplo, `modules/work/50-extra.sb` y `modules/test/50-extra.sb` ambos apuntan a `50-extra.sb`; no son capas de unión independientes. Utiliza nombres base distintos salvo que se pretenda un reemplazo por ruta exacta. No confíes en duplicar nombres base en diferentes directorios como mecanismo de reemplazo.

El formato normal de módulo es una imagen de sistema de archivos SquashFS. Un nombre de archivo coincidente no valida su contenido. Los escaneos recursivos consideran archivos y enlaces simbólicos, mientras que el escaneo de nivel superior se basa en el nombre de archivo. Si falla la vinculación de un reemplazo externo o el montaje de un módulo seleccionado, ahora se entra en la ruta fatal de initramfs en lugar de omitir silenciosamente esa capa. Valida archivos dudosos con [Inspeccionar y extraer módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Orden y prioridad

Dentro del proceso de descubrimiento, las rutas se ordenan numéricamente según el nombre base. El número inicial en nombres como `00-core.sb`, `01-kernel-VERSION.sb` y `50-extra.sb` indica el orden del módulo. Un nombre base sin número inicial se ordena numéricamente como cero.
Utiliza prefijos numéricos explícitos y distintos en lugar de depender del orden en caso de empate.

En la unión final, los módulos posteriores con números más altos tienen prioridad sobre los anteriores con números más bajos. Si dos módulos seleccionados contienen la misma ruta relativa a la raíz, el archivo del módulo con mayor prioridad será visible. La capa de cambios editables tiene prioridad sobre todos los módulos de solo lectura.

El reemplazo externo por ruta relativa ocurre antes de este orden efectivo de módulos. Un reemplazo `modules/50-extra.sb` ocupa la misma posición seleccionada que el archivo original, y su `50` prefijo determina su prioridad en la unión.

## Extensión de paquete

El parámetro de arranque `bext=` selecciona la extensión de archivo utilizada para el descubrimiento de datos, el filtrado de candidatos y el montaje de módulos. Su valor predeterminado es `sb`, por lo que el sufijo habitual de los candidatos es `.sb`:

```text
bext=sb
```

Cambiar `bext` modifica el sufijo de archivo seleccionado; no convierte un archivo ni verifica su formato de sistema de archivos. La coordinación con el kernel es una excepción: siempre busca `01-kernel-VERSION.sb`. Con una extensión personalizada, el escaneo normal de candidatos no selecciona estos módulos de kernel `.sb`.

## Filtros load y noload

`load=` y `noload=` son expresiones regulares extendidas sin anclaje que se aplican a las cadenas de ruta candidatas generadas por cada nivel. No son listas de nombres exactos. Un valor simple como `kernel` coincide con ese texto en cualquier parte de una ruta, mientras que los anclajes deben especificarse explícitamente cuando se requiere una posición exacta.
Los candidatos de nivel superior son nombres base y los candidatos recursivos incluyen `modules/`. Los candidatos externos usan la misma forma de ruta relativa, no rutas absolutas de montaje persistente.

Las comas se convierten en alternancias de expresiones regulares. Por ejemplo:

```text
load=core,kernel,firmware
```

se evalúa como `core|kernel|firmware`. Los demás caracteres de expresiones regulares no se escapan.

Un rango numérico solo se expande cuando todo el filtro es un rango ascendente que coincide con `^[0-9]+-[0-9]+$`. Por ejemplo, `load=04-06` se convierte en las alternativas `04|05|06`, con cada valor generado rellenado hasta al menos dos dígitos. Un rango incluido en una lista separada por comas u otra expresión no se expande y mantiene su significado ERE habitual.

Cuando ambos parámetros están presentes, el initrd aplica `load=` primero y luego elimina las coincidencias con `noload=`. Así, `noload=` prevalece. No existe un conjunto protegido de módulos core o kernel: los filtros pueden excluir `00-core`, el coordinado `01-kernel`, o cualquier otro candidato. Tal selección puede construir una raíz incompleta o impedir el arranque.

## Coordinación del kernel en ejecución

La versión del kernel en ejecución se obtiene de un `vmlinuz-VERSION` token en la línea de comandos del kernel cuando está disponible, utilizando `uname -r` como alternativa. Antes de montar los módulos, el initrd coordina este triplete principal:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Si falta algún elemento, el initrd busca los tres archivos en:

```text
minios/kernels/VERSION/
```

Cuando el triplete del repositorio está completo, copia el módulo en `minios/` y los archivos de arranque en `minios/boot/`. Si la copia es parcial, se limpia. Si el triplete no está completo, la configuración del kernel devuelve un error, pero el proceso continúa con la etapa normal de montaje de módulos. El sistema resultante aún puede fallar más adelante si el sistema de archivos raíz no tiene los archivos de soporte para el kernel en ejecución.

Otros archivos principales que coincidan con `01-kernel-*.sb` se consideran inactivos. El initrd intenta mover cada módulo inactivo y su correspondiente `vmlinuz` y `initrfs` archivos a `minios/kernels/VERSION/`. Estas operaciones de repositorio alternativo y reubicación requieren un árbol de datos con permisos de escritura; los fallos individuales de reubicación no son críticos. Siempre utilizan `.sb`, independientemente de `bext=`. El escaneo de candidatos combinados también excluye los módulos `01-kernel-*` que no coinciden con el kernel en ejecución, incluidos los candidatos externos. Consulta [Gestión de kernel](/preparing-and-customizing/Managing-Kernels) para conocer los flujos de trabajo admitidos para la instalación y activación del kernel.

<a id="union-construction"></a>

## Construcción de unión

MiniOS selecciona `AUFS` cuando el kernel en ejecución lo soporta; de lo contrario, utiliza OverlayFS. `union=overlayfs` selecciona OverlayFS. `union=aufs` solicita `AUFS` pero recurre a OverlayFS si `AUFS` no está disponible. Cuando UEFI Secure Boot está habilitado, initrd no carga el módulo sin firmar `aufs-ng`; si no hay otra implementación utilizable de AUFS ya disponible, se usa OverlayFS incluso cuando `union=aufs` fue solicitada.

Con `AUFS`, el initrd primero monta una unión vacía con la rama de cambios en modo escritura y luego inserta cada módulo montado como una rama de solo lectura. Si falla la creación de la unión, el proceso de arranque se detiene. Si ocurre un error al agregar una rama individual de `AUFS` módulos, se intenta continuar: el arranque sigue con las ramas que se hayan añadido, mientras que MiniOS no marca la persistencia como activa para una unión incompleta.

Con OverlayFS, el conjunto completo de módulos se proporciona como una única lista de `lowerdir` en orden inverso cuando se monta la unión. La capa de escritura proporciona su `upperdir` y `workdir`. Si falla el montaje de esa unión, el proceso es fatal. El orden de las capas inferiores de izquierda a derecha y `AUFS` el orden de inserción implementan la misma regla: los módulos agregados más tarde y con números más altos ocultan rutas en conflicto de los módulos anteriores.

Esta composición en tiempo de arranque es distinta de la activación en tiempo de ejecución. Después del inicio, `sb activate` y `sb deactivate` solo pueden modificar una raíz que esté actualmente montada como `AUFS`. Las capas inferiores de OverlayFS no se pueden cambiar en el lugar. La activación en tiempo de ejecución no modifica la selección de Next Boot, y agregar un módulo de Next Boot no lo activa en la raíz actual. Consulte [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules).

## Recorte Toram

`toram=trim` crea un árbol de datos de sistema RAM después de la detección de módulos externos y antes de la activación de la sesión y la coordinación del kernel. Copia:

- `config.conf`, que es necesario para esta ruta de copia.
- `authorized_keys` cuando existe como archivo regular.
- Candidatos principales de extensión seleccionados por `load=`, `noload=`, y el filtro de kernel en ejecución.
- Candidatos seleccionados de extensión de forma recursiva bajo `modules/`, conservando sus directorios relativos.
- Reemplazos y adiciones externas seleccionados por las mismas reglas, copiados en sus rutas relativas correspondientes.

Crea un directorio vacío `changes/`; la copia de sesión se gestiona por separado mediante `perchtoram`. No copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, otros datos que no son módulos o módulos no seleccionados. En particular, la recuperación del repositorio no puede usar un `kernels/` directorio omitido del árbol recortado RAM. Los módulos externos ya están incluidos, por lo que el arranque RAM no vuelve a abrir sus archivos originales después de la copia.

La copia del sistema no realiza una comprobación previa de capacidad de RAM. Si falla la copia de `config.conf` o de un módulo seleccionado, el error se propaga a la entrada de inicio y entra en su ruta de fallo. Si falla la copia de `authorized_keys` opcional, se informa sin abortar. No hay reversión transaccional de un árbol de datos del sistema parcialmente poblado. La copia de sesión tiene su propia comprobación previa de memoria y vuelve a la sesión original en almacenamiento si no se puede preparar la copia; consulta [Internos de persistencia](/reference/boot-process/Persistence-Internals).

Después de copiar, el initrd intenta desmontar el origen, eliminar su antigua ruta de datos y mover el árbol RAM a esa ruta. Solo el éxito de toda esa cadena marca el origen como desvinculado. Si la cadena falla, el arranque continúa usando la ruta de staging RAM en su lugar. Las operaciones relacionadas de ISO y de desvinculación de Ventoy se realizan como mejor esfuerzo.
Por lo tanto, `toram=trim` no es prueba de que el dispositivo de arranque sea extraíble. No lo desconectes a menos que los diagnósticos confirmen que su sistema de archivos, dispositivo loop y mapeos de device-mapper ya no están montados ni en uso.

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
