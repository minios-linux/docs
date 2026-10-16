---
updated: 2026-10-15
program_commits:
    minios-image-builder: 8592ec061393e48e6bdfbd43d5b4365a94c73a67
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Creación de imágenes personalizadas MiniOS

Constructor de imágenes MiniOS es una aplicación GTK para remasterizar una imagen existente de MiniOS. Selecciona contenido de una sesión actual de MiniOS, archivo ISO o disco óptico, aplica personalización declarativa y utiliza `minios-image-compose` para generar un ISO booteable verificado.

El constructor se ejecuta dentro de MiniOS. No modifica el medio fuente seleccionado.

## Elige el flujo de trabajo correcto

Constructor de imágenes MiniOS remasteriza una imagen binaria existente de MiniOS. No reemplaza ninguno de estos flujos de trabajo:

- **Construir MiniOS desde el código fuente:** utiliza el sistema de construcción `minios-live` al cambiar las listas de paquetes de la distribución, la configuración de compilación, la capa del kernel, los artefactos de arranque o la cadena de módulos reproducibles construidos desde el código fuente. Consulta [Compilación de MiniOS](/development/Building-MiniOS).
- **Crear un módulo reutilizable:** utiliza `apt2sb`, `script2sb`, `chroot2sb`, o las demás herramientas de módulos cuando el resultado deseado es una capa independiente `.sb` . Consulta [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remasterizar una imagen:** utiliza Constructor de imágenes MiniOS al seleccionar módulos existentes, agregar módulos externos completados, cambiar configuraciones de imagen soportadas, capturar cambios de sesión opcionalmente y publicar otro ISO.

La capa del sistema de archivos del proyecto es para archivos declarativos en la raíz de la imagen. No ejecuta scripts, instala paquetes ni abre un chroot. El software que se quiera reutilizar debe prepararse como módulo antes de añadirlo a un proyecto de Constructor de imágenes MiniOS.

## Opciones de origen

La página de Origen acepta:

- La sesión actual de LiveKit o dracut MiniOS.
- Un archivo ISO de MiniOS.
- Un disco óptico de MiniOS.

Las fuentes ISO y de disco óptico se montan en modo solo lectura con `udisksctl`. El inventario de origen registra la edición, versión, arquitectura, compatibilidad con el gestor de arranque, tamaño, inventario de módulos y una huella digital de la fuente. Si una fuente cambia después de la planificación, la compilación se bloquea en lugar de continuar con una entrada diferente.

En el generador gráfico, la captura de sesión solo está disponible con la **sesión en ejecución de MiniOS** como origen, incluyendo todos los módulos de origen y cada módulo externo activo. No está disponible para un ISO o disco óptico seleccionado por separado, aunque contenga la misma edición. No deselecciones capas de origen al capturar la sesión editable, ya que sus cambios dependen de esa base completa en ejecución.

## Requisitos

Constructor de imágenes MiniOS requiere el backend correspondiente `minios-image-compose`. Las fuentes de archivos ISO y discos ópticos requieren `udisks2`. Leer un `/etc/live/config.conf` solo para root y capturar una sesión escribible puede requerir `pkexec` y un agente PolicyKit de escritorio. La captura de sesión requiere un `savechanges` compatible proporcionado por `minios-tools` 1.5.0 o superior.

La aplicación y el backend de composición permanecen sin privilegios. La autorización se limita al lector fijo de configuración en vivo y, si se selecciona, a `/usr/bin/savechanges` confiables.

## Flujo de trabajo del proyecto

### Seleccionar el origen

Elige una fuente y espera a que finalice el inventario. Revisa su identidad, arquitectura, soporte de arranque, diagnósticos y cantidad de módulos. Resuelve los errores de la fuente antes de continuar.

### Seleccionar contenido

Elige los módulos fuente a incluir y añade cualquier `.sb` módulo externo. Los módulos núcleo y de kernel requeridos están bloqueados. Los módulos externos activos en la sesión actual pero ausentes en la fuente seleccionada se muestran por separado y siguen siendo opcionales.

Un módulo externo que reemplaza activamente a un módulo fuente en su ruta original del sistema se trata de forma diferente: la versión actual de Image Builder resuelve el archivo de respaldo por dispositivo e inodo, mantiene el rol original del sistema e incluye ese reemplazo como módulo fuente efectivo en lugar de presentarlo como un duplicado opcional no relacionado. Esto también cubre rutas de respaldo de initramfs reubicadas. Otros módulos externos requieren selección explícita.

Los módulos adicionales deben ser archivos regulares legibles con datos válidos SquashFS. Se rechazan los nombres duplicados o insensibles a mayúsculas y las colisiones de destino, ya que el entorno de ejecución resuelve las capas por nombre base.

### Configurar ajustes

Elige la ruta de salida y la configuración actual requerida de MiniOS. Los campos de personalización vacíos o `Keep current` conservan el comportamiento de la fuente. Configura solo las anulaciones necesarias para la nueva imagen y decide si se debe capturar la capa de sesión escribible.

Los bytes de `/etc/live/config.conf` se copian en un almacenamiento privado de compilación con modo 0600. No se interpretan, muestran ni registran. Los proyectos actuales deben incluir esta configuración; un proyecto antiguo que la desactive explícitamente no puede avanzar a Revisión hasta corregirse.

### Revisar el plan

La revisión crea un nuevo plan a partir de las identidades de entrada actuales. Verifica los módulos seleccionados, excluidos y adicionales, la ubicación de salida, el espacio estimado, el resumen de personalización, el perfil de captura, las advertencias y el límite de privilegios.

La revisión omite intencionalmente los valores de configuración, argumentos de kernel sin procesar, rutas privadas de personalización y rutas de captura seleccionadas. Muestra cantidades, nombres base, huellas digitales y sumas donde estos son suficientes para vincular el plan.

Si la salida ya existe, el reemplazo requiere confirmación. La confirmación se vincula al dispositivo, inodo, tamaño, marca de tiempo y SHA-256 observados de ese archivo. Un destino cambiado, cancelación o intento fallido elimina la aprobación y requiere otra revisión.

### Compilar y verificar

La compilación revalida cada entrada efectiva y ejecuta `minios-image-compose` con una lista de argumentos en un directorio de trabajo privado. El ISO permanece privado hasta que la verificación estructural sea exitosa. La publicación en el destino seleccionado es atómica.

Guarda el proyecto si su fuente, selección de módulos, salida e intención de personalización se reutilizarán. Los archivos de proyecto son JSON. Los cambios no guardados requieren confirmación antes de abrir otro proyecto o cerrar la aplicación.

## Captura de sesión y privacidad

Los módulos fuente, `/etc/live/config.conf`, y la captura de sesión son entradas independientes. Si la selección de módulos y la personalización declarativa son suficientes, no captures la sesión escribible.

### No incluir cambios de sesión

Esta es la opción recomendada por defecto. El constructor utiliza los módulos seleccionados, la configuración actual, los ajustes de arranque y otras personalizaciones de imagen sin copiar la capa de sesión escribible.

### Incluir todos los cambios de sesión

Este perfil conserva cada cambio escribible soportado del proveedor detectado OverlayFS o AUFS. Puede incluir contraseñas, claves, tokens, datos de navegador, identidad de la máquina, archivos personales, registros y estado de archivos eliminados. Requiere reconocimiento explícito y no debe usarse para una imagen destinada a otras personas sin una auditoría aparte.

### Incluir solo cambios reutilizables

Este perfil utiliza una lista de permitidos estricta por ruta para software y valores seguros por defecto, omitiendo datos personales, de identidad, caché y registros. Reduce la exposición pero no garantiza que los archivos permitidos no contengan secretos. Revisa la imagen final antes de compartirla.

### Elegir manualmente los cambios de sesión

Ejecuta `Analyze session changes`, luego selecciona al menos una ruta normalizada del inventario en memoria. Un directorio seleccionado representa a sus descendientes. Las exclusiones exactas o de ancestros anulan selecciones coincidentes.

El inventario contiene metadatos, incluidos nombres de archivo, y por tanto es sensible aunque no contenga el contenido de los archivos. Permanece en memoria y no se escribe en el proyecto ni se copia en la revisión o los registros. Las reglas explícitas de inclusión y exclusión son la intención del proyecto y se guardan; la revisión solo muestra su cantidad y suma.

Iniciar otro análisis, actualizar o cambiar la fuente, cancelar o fallar, y abrir o crear un proyecto borran el inventario en tiempo de ejecución. El análisis y la captura pueden solicitar autorización de administrador, pero el proceso de Constructor de imágenes MiniOS y la composición del ISO no se ejecutan con privilegios elevados.

## Personalización de imagen

La configuración admitida está limitada y validada por el backend:

- **Valores predeterminados del sistema:** nombre de host, zona horaria, destino predeterminado de systemd y servicios habilitados o deshabilitados.
- **Seguridad y acceso:** modos permitidos de sudo, PolicyKit, SSH, XRDP, X11, bloqueo de pantalla y sugerencia de incidencia.
- **Datos de usuario:** directorios de usuario validados relativos a la raíz con comportamiento de enlace o bind, pero no ambos.
- **Comportamiento de arranque:** un tiempo de espera de 0 a 300 segundos, el menú de origen o uno construido, y una entrada predeterminada seleccionada.
- **Entradas de arranque:** las plantillas resume, new, choose, fresh y copy-to-RAM se pueden ocultar, reordenar, duplicar y configurar mediante controles de persistencia tipada, módulo, inicio, localización, zRAM y diagnóstico. Las plantillas de nueva sesión actuales utilizan `perchdir=setup` para que el backend de persistencia pueda seleccionarse al iniciar; cuando una fuente anterior ya utiliza `perchdir=new`, ese selector heredado se conserva en lugar de sobrescribirse sin aviso.
- **Comportamiento de RAM:** copia del sistema (`toram`) y copia de sesión de persistencia (`perchtoram`) son controles independientes. `perchtoram=off` mantiene la persistencia en el almacenamiento, `trim` copia la sesión compatible seleccionada, y `full` solicita una copia completa de la sesión compatible. Si se solicita persistencia, un arranque de sistema RAM predetermina a `trim` salvo que se elija otro valor. Los datos nativos de directorio no se copian: normalmente el initrd inicia un contenedor vacío nuevo para esa solicitud. Utilice `perchtoram=off` para conservar los datos nativos en el almacenamiento.
- **Configuración avanzada de arranque:** argumentos de kernel validados globalmente y por entrada para opciones no representadas por controles tipados.
- **Apariencia:** un fondo de arranque PNG validado.
- **Capa de sistema de archivos del proyecto:** un directorio real interpretado relativo a la raíz de la imagen y empaquetado como un módulo overlay SquashFS propiedad de root.

La capa de sistema de archivos admite archivos regulares, enlaces simbólicos relativos seguros, directorios vacíos, bits de ejecución y marcas de tiempo. Se rechazan nodos de dispositivo, sockets, FIFOs, cruces de sistemas de archivos, enlaces absolutos o que escapen, y nombres inseguros. Los bits de privilegio se eliminan y la propiedad en el módulo generado se normaliza.

La personalización de arranque admite MiniOS GRUB reconocidos, SYSLINUX nativo y la cadena estándar de SYSLINUX a GRUB. Se rechaza la configuración de arranque no admitida o ambigua en lugar de intentar adivinarla. Una compilación sin personalización de arranque puede conservar una estructura de origen que el analizador de personalización no reconoce.

## Verificación de salida

Antes de la publicación, `minios-image-compose` verifica el ISO generado en vez de depender solo de una `xorriso` salida exitosa. Las comprobaciones incluyen:

- El árbol de sistema de archivos ISO y la etiqueta de volumen.
- Registros de arranque BIOS y UEFI y el área del sistema.
- Contenido requerido de arranque, kernel, initramfs, configuración y módulos.
- Personalización embebida y atestaciones de captura de sesión cuando están presentes.
- Sumas y estructura de los módulos overlay generados y de sesión capturada.
- Fondos de arranque y configuración de arranque transformada cuando se personaliza.

La identidad de la ruta de entrada, modo, hora de modificación y SHA-256 se registran antes de la compilación. Las entradas mutables se almacenan en instantáneas privadas con reflinks cuando es compatible; de lo contrario, se verifica que no hayan cambiado antes y después de escribir el ISO. Una discrepancia o fallo de verificación impide la publicación.

Después de una compilación exitosa, registra una suma de verificación por separado:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verificación estructural no reemplaza una prueba de arranque. Arranca el ISO en una máquina virtual desechable y prueba tanto BIOS como UEFI si ambos deben ser soportados. Constructor de imágenes MiniOS puede informar si QEMU o VirtualBox están instalados, pero no inicia ni configura un hipervisor.

## Seguridad y cancelación

- Mantén el medio fuente en solo lectura y escribe la salida en un sistema de archivos con suficiente espacio libre para la estimación y margen temporal.
- No compiles directamente sobre el único ISO conocido como bueno. Usa un nombre de salida nuevo salvo que el reemplazo sea intencionado y confirmado.
- Verifica los módulos externos antes de agregarlos. Constructor de imágenes MiniOS valida su estructura SquashFS, pero no determina quién creó su contenido.
- Prefiere no capturar la sesión para imágenes distribuidas. Si es necesario capturar, audita el sistema de archivos resultante, no solo el nombre del perfil.
- Trata los archivos de proyecto como sensibles cuando contienen rutas fuente explícitas, rutas de módulos, rutas de salida o reglas de captura seleccionadas.

Los subprocesos de inventario, compilación y verificación se ejecutan en grupos de procesos dedicados. La cancelación solicita terminación y escala tras un periodo de gracia. Un paso de hash puede finalizar antes de que la cancelación alcance un punto seguro, pero los resultados obsoletos se descartan. Una vez que comienza la publicación atómica, se permite que termine para no dejar el destino a medio escribir.

Una compilación cancelada o fallida no publica su ISO privado. Cualquier destino anterior permanece salvo que un reemplazo verificado haya alcanzado la publicación atómica.

## Documentación relacionada

- [Compilando MiniOS](/development/Building-MiniOS)
- [Creando módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Generar imágenes ISO desde la línea de comandos](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

<a id="composing-minios-iso-images-from-the-command-line"></a>

## Composición de imágenes ISO MiniOS desde la línea de comandos

`minios-image-compose` es el backend de línea de comandos suministrado con Constructor de imágenes MiniOS. Sustituye al retirado `sb2iso` utilitario. El comando remasteriza un árbol de contenido MiniOS existente, cambia opcionalmente su conjunto de módulos y configuración soportada, verifica el resultado y publica un ISO booteable.

Utiliza la interfaz gráfica [Constructor de imágenes MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para un flujo de trabajo guiado de proyectos. Usa este comando directamente para scripts, automatización o compilaciones reproducibles por línea de comandos. Para una compilación completa desde código fuente, utiliza [Compilación de MiniOS](/development/Building-MiniOS) en su lugar.

### Uso básico

Desde una sesión en vivo MiniOS en ejecución, crea un ISO con la fuente detectada MiniOS y `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

No antepongas el comando completo con `sudo` o `pkexec`. La composición, verificación y publicación se ejecutan como el usuario actual. Solo la captura de sesión opcional puede invocar el backend `/usr/bin/savechanges` de confianza a través de PolicyKit.

El nombre de salida predeterminado es `minios-YYYYMMDD_HHMM.iso`. Un destino existente se rechaza salvo que `--overwrite` se indique explícitamente.

### Seleccionar una fuente

Sin `--source`, el comando detecta el contenido MiniOS utilizado por la sesión actual de LiveKit o dracut. Para remasterizar otro árbol MiniOS montado, especifica el directorio que contiene `boot/` y los módulos MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La fuente es solo de lectura y nunca se modifica. Los archivos ISO y medios ópticos deben montarse antes de usar su árbol de contenido MiniOS con la CLI. El Constructor de imágenes MiniOS gráfico puede montar estas fuentes mediante `udisksctl`.

### Seleccionar módulos

Los `.sb` módulos adicionales son argumentos posicionales:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

El comando valida cada módulo como un archivo SquashFS legible y que no sea enlace simbólico.
Los módulos cuyos nombres empiezan con dos dígitos y un guion se colocan en el nivel superior MiniOS. Otros módulos añadidos se colocan en `minios/modules/`. Se rechazan colisiones de nombre base duplicadas o insensibles a mayúsculas.

Excluye rutas fuente con una expresión regular POSIX extendida:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

No se pueden excluir archivos de arranque requeridos, archivos de kernel e initramfs, módulos principales, el menú de arranque seleccionado ni la configuración seleccionada.

Crea módulos reutilizables antes de componer el ISO. Consulta [Creación de módulos](/preparing-and-customizing/Managing-Modules#creating-modules) y [Gestor de módulos de MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuración y manifiesto

`--config FILE` instala el archivo regular seleccionado como `minios/config.conf`. El valor predeterminado es `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

El manifiesto opcional debe ser un objeto JSON. Las etiquetas de volumen contienen de 1 a 32 caracteres ASCII imprimibles; las etiquetas fuera del conjunto estricto ISO 9660 de mayúsculas, dígitos y guion bajo generan una advertencia.

### Capturar cambios de sesión

La captura de sesión es opcional y se aplica a la capa escribible de la sesión MiniOS actualmente en ejecución. Se acepta para una fuente explícita solo cuando esa fuente tiene la misma huella digital de módulo base que el sistema en ejecución.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Los perfiles disponibles son:

- `exact` captura cada cambio representable y puede incluir credenciales, datos personales, registros, estado del navegador e identidad de la máquina.
- `clean` utiliza una lista de permitidos orientada a software. Reduce la exposición pero no garantiza que el resultado no contenga secretos.
- `selected` utiliza una selección de inventario producida por una interfaz compatible o `savechanges` flujo de trabajo.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefiere módulos y configuración declarativa en lugar de captura de sesión cuando el ISO se va a compartir. Consulta [Constructor de imágenes MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para el modelo de privacidad y el flujo de revisión.

### Personalizar el comportamiento de arranque

La CLI puede modificar los diseños soportados de GRUB y SYSLINUX:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` acepta `resume`, `new`, `choose`, `fresh`, o `toram`. El `new` plantilla semántica se asigna a `perchdir=setup` en los menús actuales de MiniOS, mientras que las entradas de fuente heredadas `perchdir=new` siguen siendo reconocibles. El constructor gráfico de menús de arranque también conserva `perchtoram=off|trim|full` independientemente de la configuración de `toram` del sistema.
`--menu` acepta `multilang` o un locale soportado como `en_US`, `ru_RU`, o `de_DE`. Los argumentos de kernel se validan y se agregan sin evaluación de shell. Los diseños de menú de arranque no soportados o ambiguos se rechazan en vez de modificarse por conjetura.

### Agregar arte o un overlay de sistema de archivos

Reemplaza el fondo de arranque con un PNG validado:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empaqueta un árbol de directorios preparado como un módulo overlay propiedad de root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

El overlay se interpreta relativo a la raíz de la imagen. No ejecuta scripts, instala paquetes ni abre un chroot. Se rechazan enlaces inseguros, archivos especiales, cruces de sistemas de archivos y colisiones de destino.

### Verificación y publicación

Antes de la publicación, `minios-image-compose` verifica el árbol de sistema de archivos ISO, la etiqueta de volumen, los registros de arranque BIOS y UEFI, el área del sistema, los archivos de arranque, los módulos y la personalización solicitada. Los módulos overlay generados y de sesión capturada se extraen y verifican contra sus metadatos y sumas registrados.

El ISO se construye en un directorio privado en el sistema de archivos de destino y solo se publica de forma atómica tras una verificación exitosa. La mutación de entrada, fallo de verificación, cancelación o espacio insuficiente en el destino impiden la publicación. Un destino anterior permanece sin cambios salvo que una compilación `--overwrite` aprobada explícitamente alcance la publicación atómica.

Crea una suma de verificación y realiza una prueba de arranque separada tras una compilación exitosa:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verificación estructural no sustituye la prueba de los caminos BIOS y UEFI previstos en una máquina virtual desechable o en hardware adecuado.

### Referencia de comandos

Utiliza el manual instalado y la salida de ayuda para la versión exacta del backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Las opciones comunes incluyen:

| Opción | Propósito |
|---|---|
| `-n`, `--name FILE` | Establecer la ruta de salida. |
| `-e`, `--exclude REGEX` | Excluir rutas fuente coincidentes. |
| `--source DIR` | Seleccionar un árbol de contenido MiniOS explícito. |
| `--config FILE` | Seleccionar la configuración en vivo embebida en el ISO. |
| `--manifest FILE` | Incluir un manifiesto de compilación JSON validado. |
| `--capture-changes MODE` | Capturar `exact`, `clean`, o `selected` cambios de sesión. |
| `--boot-timeout SECONDS` | Establecer un tiempo de espera del menú de arranque de 0 a 300 segundos. |
| `--default-boot MODE` | Seleccionar la acción de sesión MiniOS predeterminada. |
| `--kernel-args TEXT` | Agregar argumentos globales de kernel validados. |
| `--boot-background PNG` | Reemplazar el arte de arranque soportado. |
| `--overlay-directory DIR` | Agregar una capa de sistema de archivos declarativa. |
| `--menu TYPE` | Seleccionar un menú multilingüe o localizado. |
| `--overwrite` | Permitir explícitamente el reemplazo de una salida existente. |

El comando sale con código distinto de cero si fallan las comprobaciones de fuente, módulo, personalización, almacenamiento, verificación o publicación. No distribuyas una salida salvo que el comando haya finalizado correctamente y se hayan probado la suma de verificación y los caminos de arranque resultantes.
