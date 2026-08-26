# Carga de módulos en el initrd

MiniOS selecciona y monta su conjunto de módulos en el initrd, antes de que la raíz unificada sea entregada al sistema init instalado. Esta página describe el comportamiento actual del initrd. Es útil cuando un módulo mostrado en el medio de arranque no aparece en `noload=`, `bext=` o `toram=trim`, o cuando algún cambio provoca un arranque inesperado.

## Niveles de candidatos

Después de localizar el directorio de datos de MiniOS, normalmente `minios/`, el initrd escanea los módulos candidatos en este orden:

1. Entradas ubicadas directamente dentro de `minios/`. Este escaneo no es recursivo.
2. Entradas recursivamente bajo `minios/modules/`.
3. Entradas recursivamente bajo `minios/modules/` en la fuente de persistencia escribible registrada por el initrd.

El tercer nivel es independiente del directorio `minios/modules/` en el árbol de datos seleccionado de solo lectura. Esto permite que los módulos de usuario duraderos sobrescriban archivos de un ISO u otra fuente de solo lectura. Solo está disponible cuando el descubrimiento de persistencia ha publicado una raíz escribible que contiene ese directorio.

Las rutas candidatas se aplanan a su nombre base exacto al montarse. Por ejemplo, `modules/work/50-extra.sb` y `modules/test/50-extra.sb` usan ambos el punto de montaje llamado `50-extra.sb`. No se convierten en dos capas independientes. Un candidato en un nivel posterior con el mismo nombre base se monta en el mismo punto de montaje y reemplaza al candidato anterior visible para el ensamblado de la unión. Por lo tanto, el mismo nombre base debe considerarse como una única ranura de reemplazo, no como una forma de cargar varios módulos de diferentes directorios.

El formato normal de módulo es una imagen de sistema de archivos SquashFS regular. El escaneo del initrd se basa en el nombre de archivo: selecciona rutas que terminan con la extensión configurada y no verifica primero que cada ruta sea un archivo regular o un SquashFS válido. Los escaneos recursivos pueden encontrar otro tipo de objeto de sistema de archivos con un nombre coincidente. Un montaje fallido de loop o SquashFS es reportado por `mount`, pero el loop candidato no hace que esa falla sea fatal por sí misma y el arranque puede continuar con una capa faltante. Valida archivos dudosos con el flujo de inspección en [Creación de módulos](/development/Creating-Modules.md).

## Orden y precedencia

Durante el descubrimiento, las rutas se ordenan numéricamente por su nombre base. El número inicial en nombres como `00-core.sb`, `01-kernel-VERSION.sb` y `50-extra.sb` indica el orden del módulo. Un nombre base sin número inicial se ordena numéricamente como cero. Utiliza prefijos numéricos explícitos y distintos en lugar de confiar en el orden de empate.

La unión final otorga precedencia a los módulos posteriores con números más altos sobre los anteriores con números más bajos. Si dos módulos seleccionados contienen la misma ruta relativa a la raíz, el archivo del módulo de mayor prioridad será visible. La capa de cambios escribible tiene precedencia sobre todos los módulos de solo lectura.

El reemplazo por nivel ocurre antes de este orden efectivo de módulos. Un `50-extra.sb` de un nivel posterior reemplaza un archivo de un nivel anterior con ese nombre base exacto, luego su prefijo `50` determina dónde pertenece ese montaje sobreviviente en la unión.

## Extensión del paquete

El parámetro de arranque `bext=` selecciona la extensión de archivo utilizada para el descubrimiento de datos, el filtrado de candidatos y el montaje de módulos. Su valor predeterminado es `sb`, por lo que el sufijo habitual de los candidatos es `.sb`:

```text
bext=sb
```

Cambiar `bext` modifica el sufijo de archivo seleccionado; no convierte un archivo ni verifica su formato de sistema de archivos. La coordinación con el kernel es una limitación actual deliberada: aún utiliza nombres literales `.sb` para `01-kernel-VERSION.sb`. Un `bext` personalizado, por lo tanto, no renombra ni coordina el hecho de que un escaneo de candidatos que no sea `sb` no los seleccionará.

## Filtros load y noload

`load=` y `noload=` son expresiones regulares extendidas no ancladas que se aplican a las cadenas de ruta de los candidatos producidos por cada nivel. No son listas de nombres exactos. Un valor simple como `kernel` coincide con ese texto en cualquier parte de una ruta, mientras que los anclajes deben suministrarse explícitamente cuando se requiere una posición exacta. Las rutas difieren por nivel: los candidatos de nivel superior son nombres base, los candidatos de datos recursivos incluyen `modules/`, y los candidatos de persistencia son rutas absolutas.

Las comas se convierten en alternancia de expresiones regulares. Por ejemplo:

```text
load=core,kernel,firmware
```

se evalúa como `core|kernel|firmware`. Otros caracteres de expresión regular no se escapan.

Un rango numérico solo se expande cuando todo el filtro es un rango ascendente que coincide con `^[0-9]+-[0-9]+$`. Por ejemplo, `load=04-06` se convierte en las alternativas `04|05|06`, con cada valor generado rellenado a al menos dos dígitos. Un rango incrustado en una lista separada por comas u otra expresión no se expande y mantiene su significado ERE ordinario.

Cuando ambos parámetros están presentes, el initrd aplica primero `load=` y luego elimina las coincidencias con `noload=`. Por lo tanto, `noload=` prevalece. No existe un conjunto protegido de módulos principales o del kernel: los filtros pueden excluir `00-core`, el `01-kernel` coordinado o cualquier otro candidato. Tal selección puede construir una raíz incompleta o impedir el arranque.

## Coordinación con el kernel en ejecución

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

Cuando el triplete del repositorio está completo, copia el módulo a `minios/` y los archivos de arranque a `minios/boot/`. Una copia parcial se limpia. Si el triplete no está completo, la configuración del kernel devuelve un error, pero el llamador continúa con la etapa normal de montaje de módulos; el sistema resultante aún puede fallar más adelante porque los módulos de espacio de usuario del kernel en ejecución están ausentes.

Otros archivos de nivel superior que coinciden con `01-kernel-*.sb` se tratan como inactivos. El initrd intenta mover cada módulo inactivo y sus archivos `vmlinuz` y `initrfs` correspondientes a `minios/kernels/VERSION/`. Estas operaciones de repositorio de respaldo y reubicación requieren un árbol de datos escribible; los fallos individuales de reubicación no son fatales. Siempre usan `.sb`, independientemente de `bext=`. Consulta [Gestión de kernel](/administration/Kernel-Management.md) para flujos de trabajo de instalación y activación de kernel compatibles.

## Construcción de la unión

MiniOS selecciona `AUFS` cuando el kernel en ejecución lo soporta y, de lo contrario, utiliza
OverlayFS. `union=overlayfs` selecciona OverlayFS. `union=aufs` solicita `AUFS`, pero
recurrirá a OverlayFS si `AUFS` no está disponible.

Con `AUFS`, el initrd primero monta una unión vacía con la rama de cambios
escribibles, luego inserta cada módulo montado como una rama de solo lectura. Un fallo al
crear la unión es fatal. Un fallo al agregar una rama individual `AUFS`
es un esfuerzo adicional: el arranque continúa con las ramas que se hayan añadido, pero
la autoridad de persistencia no se publica para una unión incompleta.

Con OverlayFS, el conjunto completo de módulos se proporciona como una lista `lowerdir`
invertida cuando se monta la unión. La capa escribible proporciona su `upperdir` y
`workdir`. Un fallo al montar esa unión es fatal. El orden inferior de izquierda a derecha
y el orden de inserción `AUFS` implementan la misma regla: los módulos añadidos más tarde,
con número más alto, ocultan rutas en conflicto de los módulos anteriores.

Esta composición en tiempo de arranque es distinta de la activación en tiempo de ejecución. Después del inicio,
`sb activate` y `sb deactivate` solo pueden modificar una raíz que esté actualmente
montada como `AUFS`. Las capas inferiores de OverlayFS no se pueden cambiar en caliente. La
activación en tiempo de ejecución no modifica la selección de "Siguiente Arranque", y añadir un módulo para el "Siguiente Arranque"
no lo activa en la raíz actual. Consulta
[Gestor de Módulos](/administration/Module-Manager.md).

## Recorte toram

`toram=trim` crea un árbol de datos en RAM antes de la persistencia y la coordinación del kernel. Copia exactamente estos elementos del árbol de datos MiniOS seleccionado:

- `config.conf`, que es requerido por esta ruta de copia.
- `authorized_keys` cuando existe como archivo regular.
- Candidatos de nivel superior que coincidan con la extensión seleccionada por `load=` y `noload=`.
- Candidatos seleccionados que coincidan con la extensión recursivamente bajo `modules/`, conservando sus directorios relativos.
- El árbol completo `changes/` cuando la línea de comandos solicita persistencia.

No copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, registros, otros datos no relacionados con módulos, módulos no seleccionados ni el nivel separado de módulos de persistencia escribible. En particular, el respaldo del repositorio no puede usar un directorio `kernels/` que fue omitido del árbol RAM recortado. El conjunto de módulos copiados se filtra antes de descubrir el nivel de módulos de persistencia.

No hay una comprobación previa de capacidad de RAM. Un fallo al copiar `config.conf` o `changes/` solicitados hace que la función de copia termine su ejecución, pero sus llamadores no convierten de forma fiable ese estado en una detención limpia del arranque. Un fallo al copiar `authorized_keys` se informa pero no detiene la copia. Los módulos seleccionados se copian mediante una canalización; un fallo individual al copiar un módulo se informa, pero su estado no se propaga de forma fiable para detener el proceso de arranque externo. No hay reversión transaccional de un árbol RAM parcialmente poblado.

Tras la copia, el initrd intenta desmontar el origen, eliminar su antigua ruta de datos y mover el árbol RAM a esa ruta. Solo el éxito de toda esa cadena marca el origen como desvinculado. Si la cadena falla, el arranque continúa usando la ruta temporal en RAM. Las operaciones relacionadas de desmontaje de ISO y Ventoy son de mejor esfuerzo. Por lo tanto, `toram=trim` no es prueba de que el dispositivo de arranque sea extraíble. No lo desconectes a menos que los diagnósticos confirmen que su sistema de archivos, dispositivo loop y mapeos device-mapper ya no están montados ni en uso.

## Rootcopy y la entrega de la raíz

Después de montar los módulos y construir la unión, el initrd copia el contenido visible de `minios/rootcopy/` directamente en la unión ensamblada. El glob de shell `*` omite las entradas con punto al inicio directamente dentro de `rootcopy/`, aunque los archivos ocultos dentro de un directorio copiado siguen siendo parte de esa copia. Esta es una copia de archivos en la vista escribible, no otra capa de módulo de solo lectura, por lo que puede sobrescribir rutas proporcionadas por los módulos. Los errores de copia no se consideran fatales en esta función.

MiniOS realiza luego su configuración temprana, escribe el `fstab` de la nueva raíz y ejecuta `rootcopy/run/preinit.sh` si está presente, pasando la ruta de la unión como su primer argumento. Este script se ejecuta en el entorno del initrd antes de la entrega de la raíz y debe tratarse como código privilegiado de arranque.

En el límite final, el initrd de LiveKit pivota la unión ensamblada a `/`, mantiene el antiguo initrd bajo `/run/initramfs` para tareas de apagado y ejecuta el `init` de la nueva raíz. La ruta de Dracut prepara la misma unión y deja que Dracut realice el `switch_root` final. Una vez cruzado este límite, el arranque ordinario se ejecuta dentro de la raíz compuesta; cambiar archivos en el medio de arranque ya no reconstruye el conjunto de capas inferiores seleccionadas para ese arranque.

## Diagnóstico seguro

Prefiere la inspección de solo lectura y registra la línea de comandos original antes de
cambiar los filtros:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` muestra la selección actual basada en reglas, mientras que `sb list` muestra las
capas que realmente componen la raíz en ejecución. Una diferencia puede indicar un fallo de montaje,
reemplazo de basename, un cambio en tiempo de ejecución de `AUFS`, o una fuente de selección
que cambió después del arranque.

Para un fallo temprano, añade `debug` para mostrar el rastreo del shell, `timing` para los tiempos de cada etapa, o `rd.break` para abrir un shell después de la configuración de initrd y antes de la entrega final de la raíz. En ese shell, inspecciona `/memory/data`, `/memory/bundles`, los puntos de montaje,
y `/proc/cmdline`; no repares sistemas de archivos ni retires medios mientras estén
montados. Captura el primer error de montaje o copia, no solo el síntoma posterior. Consulta
[Solución de problemas](/administration/Troubleshooting.md) para un flujo de trabajo de diagnóstico seguro más amplio.

## Documentación relacionada

- [Modos de arranque](/configuration/Boot-Modes.md)
- [Descubrimiento del sistema](/configuration/Initrd-System-Discovery.md)
- [Persistencia](/configuration/Initrd-Persistence.md)
- [Gestor de módulos](/administration/Module-Manager.md)
- [Creación de módulos](/development/Creating-Modules.md)
- [Gestión de kernel](/administration/Kernel-Management.md)
- [Solución de problemas](/administration/Troubleshooting.md)
