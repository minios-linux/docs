---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Creación de imágenes personalizadas de MiniOS

El Constructor de imágenes MiniOS es una aplicación GTK para remasterizar una imagen existente de MiniOS. Selecciona contenido de una sesión actual de MiniOS, archivo ISO o disco óptico, aplica personalización declarativa y utiliza `minios-image-compose` para producir un ISO arrancable y verificado.

El constructor se ejecuta dentro de MiniOS. No modifica el medio fuente seleccionado.

## Elige el flujo de trabajo correcto

El Constructor de imágenes MiniOS remasteriza una imagen binaria existente de MiniOS. No es un reemplazo para ninguno de estos flujos de trabajo:

- **Construir MiniOS desde el código fuente:** utiliza el sistema de compilación `minios-live` cuando cambies las listas de paquetes de la distribución, la configuración de compilación, la capa del kernel, los artefactos de arranque o la cadena de módulos reproducibles construidos desde el código fuente. Consulta [Compilando MiniOS](/development/Building-MiniOS).
- **Crear un módulo reutilizable:** utiliza `apt2sb`, `script2sb`, `chroot2sb` u otras herramientas de módulos cuando el resultado deseado sea una capa independiente `.sb`. Consulta [Creación de módulos](/preparing-and-customizing/Managing-Modules).
- **Remasterizar una imagen:** utiliza el Constructor de imágenes MiniOS cuando selecciones módulos existentes, añadas módulos externos finalizados, cambies la configuración soportada de la imagen, captures cambios de sesión de forma opcional y publiques otro ISO.

La capa del sistema de archivos del proyecto es para archivos declarativos en la raíz de la imagen. No ejecuta scripts, instala paquetes ni abre un chroot. El software destinado a ser reutilizado debe prepararse como un módulo antes de ser añadido a un proyecto de Constructor de imágenes MiniOS.

## Opciones de fuente

La página de Fuente acepta:

- La sesión actual de MiniOS con LiveKit o dracut.
- Un archivo ISO de MiniOS.
- Un disco óptico de MiniOS.

Las fuentes ISO y de disco óptico se montan en modo solo lectura con `udisksctl`. El inventario de la fuente registra la edición, versión, arquitectura, soporte de gestor de arranque, tamaño, inventario de módulos y una huella digital de la fuente. Si la fuente cambia después de la planificación, la compilación se bloquea en lugar de continuar con una entrada diferente.

La captura de sesión siempre describe los cambios en la sesión actual de MiniOS en ejecución. Cuando se selecciona un ISO o disco óptico, la captura solo está disponible si la huella digital del módulo base de esa fuente coincide con la base montada de la sesión en ejecución. Seleccionar medios externos no captura cambios realizados en otro sistema.

## Requisitos

El Constructor de imágenes MiniOS requiere el backend `minios-image-compose` correspondiente. Las fuentes de archivos ISO y discos ópticos requieren `udisks2`. Leer un `/etc/live/config.conf` de solo root y capturar una sesión escribible puede requerir `pkexec` y un agente PolicyKit de escritorio. La captura de sesión requiere un `savechanges` compatible proporcionado por `minios-tools` 1.5.0 o superior.

La aplicación y el backend de composición permanecen sin privilegios. La autorización se limita al lector fijo de configuración en vivo y, cuando se selecciona, a `/usr/bin/savechanges` de confianza.

## Flujo de trabajo del proyecto

### Seleccione la fuente

Elija una fuente y espere a que finalice el inventario. Revise su identidad, arquitectura, compatibilidad de arranque, diagnósticos y número de módulos. Resuelva los errores de la fuente antes de continuar.

### Seleccione el contenido

Elija los módulos fuente a incluir y agregue cualquier módulo externo `.sb`. Los módulos esenciales del núcleo y del sistema están bloqueados. Los módulos activos en la sesión actual pero ausentes en la fuente seleccionada se muestran por separado y no se incluyen automáticamente.

Los módulos adicionales deben ser archivos regulares legibles con datos SquashFS válidos. Los nombres duplicados o que solo difieren en mayúsculas/minúsculas y las colisiones de destino se rechazan porque el entorno de ejecución resuelve las capas por el nombre base.

### Configure los ajustes

Elija la ruta de salida y la configuración actual requerida de MiniOS. Los campos de personalización vacíos o `Keep current` preservan el comportamiento de la fuente. Configure solo las anulaciones necesarias para la nueva imagen y decida si se debe capturar la capa de sesión escribible.

Los bytes de `/etc/live/config.conf` se copian en un almacenamiento privado de compilación con modo 0600. No se interpretan, muestran ni registran. Los proyectos actuales deben incluir esta configuración; un proyecto antiguo que la desactive explícitamente no podrá avanzar a la revisión hasta corregirse.

### Revisar el plan

La revisión crea un nuevo plan a partir de las identidades de entrada actuales. Verifique los módulos seleccionados, excluidos y adicionales, la ubicación de salida, el espacio estimado, el resumen de personalización, el perfil de captura, las advertencias y el límite de privilegios.

La revisión omite intencionadamente los valores de configuración, argumentos de kernel sin procesar, rutas privadas de personalización y rutas de captura seleccionadas. Muestra recuentos, nombres base, huellas digitales y sumas donde son suficientes para vincular el plan.

Si la salida ya existe, el reemplazo requiere confirmación. La confirmación está vinculada al dispositivo, inodo, tamaño, marca de tiempo y SHA-256 observados de ese archivo. Un destino cambiado, cancelación o intento fallido borra la aprobación y requiere otra revisión.

### Construir y verificar

La compilación revalida cada entrada efectiva y ejecuta `minios-image-compose` con una lista de argumentos en un directorio de trabajo privado. El ISO permanece privado hasta que la verificación estructural sea exitosa. La publicación al destino seleccionado es atómica.

Guarde el proyecto si se reutilizarán su fuente, selección de módulos, salida e intención de personalización. Los archivos de proyecto son JSON. Los cambios no guardados requieren confirmación antes de abrir otro proyecto o cerrar la aplicación.

## Captura de sesión y privacidad

Los módulos fuente, `/etc/live/config.conf` y la captura de sesión son entradas independientes. Si la selección de módulos y la personalización declarativa son suficientes, no capture la sesión escribible.

### No incluir cambios de sesión

Esta es la opción recomendada por defecto. El constructor utiliza los módulos seleccionados, la configuración actual, los ajustes de arranque y otras personalizaciones de la imagen sin copiar la capa de sesión escribible.

### Incluir todos los cambios de la sesión

Este perfil conserva todos los cambios escribibles admitidos por el proveedor de OverlayFS o AUFS detectado. Puede incluir contraseñas, llaves, tokens, datos de navegador, identidad de la máquina, archivos personales, registros y estado de archivos eliminados. Requiere reconocimiento explícito y no debe usarse para una imagen destinada a otras personas sin una auditoría independiente.

### Incluir solo los cambios reutilizables

Este perfil utiliza una lista de rutas permitidas estricta para software y valores seguros por defecto, omitiendo datos personales, de identidad, caché y registros en general. Reduce la exposición, pero no garantiza que los archivos permitidos no contengan información secreta. Inspeccione la imagen finalizada antes de compartirla.

### Selecciona manualmente los cambios de la sesión

Ejecuta `Analyze session changes` y selecciona al menos una ruta normalizada del inventario en memoria. Un directorio seleccionado representa a sus descendientes. Las exclusiones exactas o de ancestros tienen prioridad sobre selecciones coincidentes.

El inventario contiene metadatos, incluidos nombres de archivos, y por tanto es sensible aunque no incluya el contenido de los archivos. Permanece en memoria y no se escribe en el proyecto ni se copia en la Revisión o los registros. Las reglas explícitas de inclusión y exclusión reflejan la intención del proyecto y se guardan; la Revisión solo muestra su cantidad y resumen.

Iniciar otro análisis, actualizar o cambiar la fuente, cancelar o fallar, y abrir o crear un proyecto borran el inventario en tiempo de ejecución. El análisis y la captura pueden requerir autorización de administrador, pero el proceso de Constructor de imágenes MiniOS y la composición ISO no se ejecutan con privilegios elevados.

## Personalización de la imagen

Los ajustes admitidos están restringidos y validados por el backend:

- **Valores predeterminados del sistema:** nombre de host, zona horaria, objetivo predeterminado de systemd y servicios habilitados o deshabilitados.
- **Seguridad y acceso:** sudo permitido, PolicyKit, SSH, XRDP, X11, modos de bloqueo de pantalla y sugerencias de inicio de sesión.
- **Datos de usuario:** directorios de usuario validados relativos a la raíz con comportamiento de enlace simbólico o bind, pero no ambos.
- **Comportamiento de arranque:** un tiempo de espera de 0 a 300 segundos, el menú fuente o uno construido, y una entrada predeterminada seleccionada.
- **Entradas de arranque:** las plantillas resume, new, choose, fresh y copy-to-RAM pueden ocultarse, reordenarse, duplicarse y configurarse mediante controles tipados de persistencia, módulo, inicio, localización, zRAM y diagnóstico.
- **Ajustes avanzados de arranque:** argumentos de kernel globales y por entrada validados para opciones no representadas por controles tipados.
- **Apariencia:** un fondo de arranque PNG validado.
- **Capa de sistema de archivos del proyecto:** un único directorio real interpretado relativo a la raíz de la imagen y empaquetado como un módulo overlay SquashFS propiedad de root.

La capa de sistema de archivos admite archivos regulares, enlaces simbólicos relativos seguros, directorios vacíos, bits de ejecución y marcas de tiempo. Se rechazan nodos de dispositivo, sockets, FIFOs, cruces de sistemas de archivos, enlaces absolutos o que escapen, y nombres inseguros. Se eliminan los bits de privilegio y la propiedad en el módulo generado se normaliza.

La personalización de arranque admite GRUB de MiniOS reconocido, SYSLINUX nativo y la cadena estándar de SYSLINUX a GRUB. La configuración de arranque no compatible o ambigua se rechaza en lugar de adivinar. Una compilación sin personalización de arranque puede preservar una estructura fuente que el analizador de personalización no comprende.

## Verificación de la salida

Antes de la publicación, `minios-image-compose` verifica el ISO generado en lugar de confiar solo en una salida exitosa de `xorriso`. Las comprobaciones incluyen:

- El árbol del sistema de archivos ISO y la etiqueta de volumen.
- Registros de arranque BIOS y UEFI y el área del sistema.
- Archivos de arranque requeridos, kernel, initramfs, configuración y contenido de módulos.
- Personalización embebida y atestaciones de captura de sesión cuando estén presentes.
- Sumas de comprobación y estructura de los módulos overlay generados y de sesión capturada.
- Objetivos de fondo de arranque y configuración de arranque transformada cuando se haya personalizado.

La identidad de la ruta de entrada, el modo, la hora de modificación y el SHA-256 se registran antes de la compilación. Las entradas mutables se capturan de forma privada con reflinks cuando es compatible; de lo contrario, se comprueba si han cambiado antes y después de escribir el ISO. Una discrepancia o fallo de verificación impide la publicación.

Después de una compilación exitosa, registra una suma de comprobación por separado:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verificación estructural no reemplaza una prueba de arranque. Arranca el ISO en una máquina virtual desechable y prueba tanto BIOS como UEFI si ambos deben ser soportados. El Constructor de imágenes MiniOS puede informar si QEMU o VirtualBox están instalados, pero no inicia ni configura un hipervisor.

## Seguridad y cancelación

- Mantén los medios fuente en solo lectura y escribe la salida en un sistema de archivos con suficiente espacio libre para la estimación y el margen temporal.
- No construyas directamente sobre el único ISO conocido como bueno. Usa un nuevo nombre de salida a menos que el reemplazo sea intencionado y confirmado.
- Verifica los módulos externos antes de agregarlos. El Constructor de imágenes MiniOS valida su estructura SquashFS, pero no determina quién es el autor de su contenido.
- Prefiere no capturar la sesión para imágenes distribuidas. Si es necesario capturar, audita el sistema de archivos resultante, no solo el nombre del perfil.
- Trata los archivos de proyecto como sensibles cuando contengan rutas fuente explícitas, rutas de módulos, rutas de salida o reglas de captura seleccionadas.

Los subprocesos de inventario, construcción y verificación se ejecutan en grupos de procesos dedicados. La cancelación solicita la terminación y escala tras un periodo de gracia. Una pasada de hash puede finalizar antes de que la cancelación alcance un punto seguro, pero los resultados obsoletos se descartan. Una vez que comienza la publicación atómica, se permite que finalice para que el destino no quede intencionadamente a medio escribir.

Una compilación cancelada o fallida no publica su ISO privado. Cualquier destino anterior permanece salvo que un reemplazo verificado haya llegado a la publicación atómica.

## Documentación relacionada

- [Building MiniOS](/development/Building-MiniOS)
- [Creating modules](/preparing-and-customizing/Managing-Modules)
- [Composing ISO images from the command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images)

## Componer imágenes ISO de MiniOS desde la línea de comandos

`minios-image-compose` es el backend de línea de comandos que se suministra con el Constructor de imágenes MiniOS. Sustituye a la utilidad `sb2iso` retirada. El comando remasteriza un árbol de contenido MiniOS existente, opcionalmente cambia su conjunto de módulos y configuración soportada, verifica el resultado y publica un ISO arrancable.

Utiliza la interfaz gráfica [Constructor de imágenes MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para un flujo de trabajo guiado de proyectos. Usa este comando directamente para scripts, automatización o compilaciones reproducibles por línea de comandos. Para una compilación completa desde el código fuente, utiliza [Compilando MiniOS](/development/Building-MiniOS).

### Uso básico

Desde una sesión en vivo de MiniOS en ejecución, crea una ISO con la fuente MiniOS detectada y `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

No antepongas el comando completo con `sudo` ni `pkexec`. La composición, verificación y publicación se ejecutan como el usuario actual. Solo la captura de sesión opcional puede invocar el backend confiable `/usr/bin/savechanges` mediante PolicyKit.

El nombre de salida predeterminado es `minios-YYYYMMDD_HHMM.iso`. Un destino existente será rechazado a menos que se indique explícitamente `--overwrite`.

### Selecciona una fuente

Sin `--source`, el comando detecta el contenido MiniOS utilizado por la sesión actual de LiveKit o dracut. Para remasterizar otro árbol MiniOS montado, especifica el directorio que contiene `boot/` y los módulos MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La fuente es solo de lectura y nunca se modifica. Los archivos ISO y medios ópticos deben montarse antes de usar su árbol de contenido MiniOS con la CLI. El Constructor de imágenes MiniOS gráfico puede montar estas fuentes mediante `udisksctl`.

### Selecciona módulos

Los módulos adicionales `.sb` son argumentos posicionales:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

El comando valida cada módulo como un archivo SquashFS legible y que no sea un enlace simbólico.
Los módulos cuyos nombres comienzan con dos dígitos y un guion se colocan en el nivel superior MiniOS. Otros módulos añadidos se colocan en `minios/modules/`. Se rechazan las colisiones de nombres base duplicados o que solo difieran en mayúsculas/minúsculas.

Excluye rutas fuente con una expresión regular POSIX extendida:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

No se pueden excluir los archivos de arranque requeridos, los archivos de kernel e initramfs, los módulos principales, el menú de arranque seleccionado ni la configuración seleccionada.

Crea módulos reutilizables antes de componer el ISO. Consulta [Creación de módulos](/preparing-and-customizing/Managing-Modules) y [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuración y manifiesto

`--config FILE` instala el archivo regular seleccionado como `minios/config.conf`. El valor predeterminado es `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

El manifiesto opcional debe ser un objeto JSON. Las etiquetas de volumen contienen de 1 a 32 caracteres ASCII imprimibles; las etiquetas fuera del conjunto estricto de ISO 9660 (mayúsculas, dígitos y guion bajo) generan una advertencia.

### Capturar cambios de sesión

La captura de sesión es opcional y se aplica a la capa escribible de la sesión MiniOS que se está ejecutando actualmente. Solo se acepta para una fuente explícita cuando esa fuente tiene la misma huella digital de módulo base que el sistema en ejecución.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Los perfiles disponibles son:

- `exact` captura todos los cambios representables y puede incluir credenciales, datos personales, registros, estado del navegador e identidad de la máquina.
- `clean` utiliza una lista blanca orientada al software más restringida. Reduce la exposición pero no garantiza que el resultado no contenga secretos.
- `selected` utiliza una selección de inventario producida por un frontend compatible o un flujo de trabajo `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefiere módulos y configuración declarativa sobre la captura de sesión cuando el ISO se vaya a compartir. Consulta [Constructor de imágenes MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para conocer el modelo de privacidad y el flujo de revisión.

### Personalizar el comportamiento de arranque

La CLI puede cambiar los diseños soportados de GRUB y SYSLINUX:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` acepta `resume`, `new`, `choose`, `fresh` o `toram`.
`--menu` acepta `multilang` o un locale soportado como `en_US`, `ru_RU` o `de_DE`. Los argumentos del kernel se validan y se agregan sin evaluación de shell. Los diseños de menú de arranque no soportados o ambiguos se rechazan en vez de modificarse por conjetura.

### Añadir arte o una superposición de sistema de archivos

Sustituye el fondo de arranque por un PNG validado:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empaqueta un árbol de directorios preparado como un módulo de superposición de imagen propiedad de root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

La superposición se interpreta en relación con la raíz de la imagen. No ejecuta scripts, no instala paquetes ni abre un chroot. Se rechazan enlaces inseguros, archivos especiales, cruces de sistemas de archivos y colisiones de destino.

### Verificación y publicación

Antes de la publicación, `minios-image-compose` verifica el árbol del sistema de archivos ISO, la etiqueta de volumen, los registros de arranque BIOS y UEFI, el área del sistema, los archivos de arranque, los módulos y la personalización solicitada. Los módulos de superposición generados y los módulos de sesión capturada se extraen y se comprueban contra su metadatos y sumas de verificación registrados.

La ISO se construye en un directorio privado en el sistema de archivos de destino y solo se publica de forma atómica después de que la verificación sea exitosa. La mutación de entrada, fallo de verificación, cancelación o espacio insuficiente en el destino impiden la publicación. Un destino anterior permanece sin cambios a menos que una compilación `--overwrite` aprobada explícitamente alcance la publicación atómica.

Crea una suma de verificación y realiza una prueba de arranque por separado tras una compilación exitosa:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verificación estructural no sustituye la prueba de los caminos de arranque BIOS y UEFI previstos en una máquina virtual desechable o en hardware adecuado.

### Referencia de comandos

Utiliza el manual instalado y la salida de ayuda para la versión exacta del backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Las opciones comunes incluyen:

| Opción | Propósito |
|---|---|
| `-n`, `--name FILE` | Establece la ruta de salida. |
| `-e`, `--exclude REGEX` | Excluye rutas de origen coincidentes. |
| `--source DIR` | Selecciona un árbol de contenido MiniOS explícito. |
| `--config FILE` | Selecciona la configuración en vivo incrustada en la ISO. |
| `--manifest FILE` | Incluye un manifiesto de compilación JSON validado. |
| `--capture-changes MODE` | Captura cambios de sesión `exact`, `clean` o `selected`. |
| `--boot-timeout SECONDS` | Establece un tiempo de espera del menú de arranque de 0 a 300 segundos. |
| `--default-boot MODE` | Selecciona la acción de sesión MiniOS predeterminada. |
| `--kernel-args TEXT` | Añade argumentos globales de kernel validados. |
| `--boot-background PNG` | Sustituye el arte de arranque soportado. |
| `--overlay-directory DIR` | Añade una capa de sistema de archivos declarativa. |
| `--menu TYPE` | Selecciona un menú multilingüe o localizado. |
| `--overwrite` | Permite explícitamente la sustitución de una salida existente. |

El comando termina con un valor distinto de cero cuando fallan las comprobaciones de fuente, módulo, personalización, almacenamiento, verificación o publicación. No distribuyas una salida a menos que el comando haya finalizado correctamente y se hayan probado la suma de verificación y los caminos de arranque resultantes.
