# Composición de imágenes ISO de MiniOS desde la línea de comandos

`minios-image-compose` es el backend de línea de comandos incluido con MiniOS Image Builder. Sustituye a la utilidad retirada `sb2iso`. Este comando remasteriza un árbol de contenido MiniOS existente, permite cambiar opcionalmente el conjunto de módulos y la configuración soportada, verifica el resultado y publica una ISO arrancable.

Utiliza la interfaz gráfica [MiniOS Image Builder](/development/Image-Builder.md) para un flujo de trabajo guiado. Usa este comando directamente para scripts, automatización o compilaciones reproducibles desde la línea de comandos. Para una compilación completa desde el código fuente, utiliza [Building MiniOS](/development/Building-MiniOS.md).

## Uso básico

Desde una sesión en vivo de MiniOS en ejecución, crea una ISO con la fuente MiniOS detectada y `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

No antepongas el comando completo con `sudo` ni `pkexec`. La composición, verificación y publicación se ejecutan como el usuario actual. Solo la captura de sesión opcional puede invocar el backend confiable `/usr/bin/savechanges` a través de PolicyKit.

El nombre de salida predeterminado es `minios-YYYYMMDD_HHMM.iso`. Un destino existente será rechazado a menos que se indique explícitamente `--overwrite`.

## Seleccionar una fuente

Sin `--source`, el comando detecta el contenido MiniOS usado por la sesión actual de LiveKit o dracut. Para remasterizar otro árbol MiniOS montado, especifica el directorio que contiene `boot/` y los módulos de MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La fuente es solo de lectura y nunca se modifica. Los archivos ISO y los medios ópticos deben montarse antes de usar su árbol de contenido MiniOS con la CLI. El Image Builder gráfico puede montar estas fuentes mediante `udisksctl`.

## Seleccionar módulos

Los módulos adicionales `.sb` son argumentos posicionales:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

El comando valida que cada módulo sea un archivo SquashFS legible y que no sea un enlace simbólico. Los módulos cuyos nombres comienzan con dos dígitos y un guion se colocan en el nivel superior de MiniOS. Los demás módulos añadidos se ubican en `minios/modules/`. Se rechazan los duplicados o colisiones de nombres base (ignorando mayúsculas/minúsculas).

Excluye rutas de origen con una expresión regular extendida POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

No se pueden excluir los archivos de arranque requeridos, el kernel y los archivos initramfs, los módulos principales, el menú de arranque seleccionado ni la configuración seleccionada.

Crea módulos reutilizables antes de componer la ISO. Consulta [Creating modules](/development/Creating-Modules.md) y [MiniOS Module Manager](/administration/Module-Manager.md).

## Configuración y manifiesto

`--config FILE` instala el archivo regular seleccionado como `minios/config.conf`. El valor predeterminado es `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

El manifiesto opcional debe ser un objeto JSON. Las etiquetas de volumen pueden contener de 1 a 32 caracteres ASCII imprimibles; las etiquetas fuera del conjunto estricto de ISO 9660 (mayúsculas, dígitos y guion bajo) generan una advertencia.

## Capturar cambios de sesión

La captura de sesión es opcional y se aplica a la capa escribible de la sesión MiniOS en ejecución. Solo se acepta para una fuente explícita cuando esa fuente tiene la misma huella digital del módulo base que el sistema en ejecución.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Los perfiles disponibles son:

- `exact` captura todos los cambios representables y puede incluir credenciales, datos personales, registros, estado del navegador e identidad de la máquina.
- `clean` utiliza una lista blanca orientada al software. Reduce la exposición pero no garantiza que el resultado no contenga secretos.
- `selected` usa una selección de inventario generada por una interfaz compatible o un flujo de trabajo `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefiere módulos y configuración declarativa sobre la captura de sesión cuando la ISO se va a compartir. Consulta [MiniOS Image Builder](/development/Image-Builder.md) para el modelo de privacidad y el flujo de revisión.

## Personalizar el comportamiento de arranque

La CLI puede modificar los esquemas soportados de GRUB y SYSLINUX:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` acepta `resume`, `new`, `choose`, `fresh` o `toram`.
`--menu` acepta `multilang` o un locale soportado como `en_US`, `ru_RU` o `de_DE`. Los argumentos del kernel se validan y se añaden sin evaluación por shell. Los esquemas de menú de arranque no soportados o ambiguos se rechazan en vez de modificarse por conjetura.

## Añadir arte gráfico o una superposición de sistema de archivos

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

La superposición se interpreta en relación con la raíz de la imagen. No ejecuta scripts, instala paquetes ni abre un chroot. Se rechazan enlaces inseguros, archivos especiales, cruces de sistemas de archivos y colisiones de destino.

## Verificación y publicación

Antes de la publicación, `minios-image-compose` verifica el árbol de archivos del sistema ISO, la etiqueta de volumen, los registros de arranque BIOS y UEFI, el área de sistema, los archivos de arranque, los módulos y las personalizaciones solicitadas. Los módulos de superposición generados y los módulos de sesión capturada se extraen y se comprueban contra sus metadatos y sumas registradas.

La ISO se construye en un directorio privado en el sistema de archivos de destino y solo se publica de forma atómica después de que la verificación sea exitosa. La mutación de entrada, el fallo en la verificación, la cancelación o el espacio insuficiente en el destino impiden la publicación. Un destino previo permanece sin cambios a menos que una compilación `--overwrite` aprobada explícitamente alcance la publicación atómica.

Crea una suma de verificación y realiza una prueba de arranque independiente tras una compilación exitosa:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verificación estructural no sustituye las pruebas de los recorridos de arranque BIOS y UEFI previstos en una máquina virtual desechable o en hardware adecuado.

## Referencia de comandos

Utiliza el manual instalado y la salida de ayuda para la versión exacta del backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Las opciones comunes incluyen:

| Opción | Propósito |
|---|---|
| `-n`, `--name FILE` | Establecer la ruta de salida. |
| `-e`, `--exclude REGEX` | Excluir rutas de origen coincidentes. |
| `--source DIR` | Seleccionar un árbol de contenido MiniOS explícito. |
| `--config FILE` | Seleccionar la configuración en vivo embebida en la ISO. |
| `--manifest FILE` | Incluir un manifiesto de compilación JSON validado. |
| `--capture-changes MODE` | Capturar cambios de sesión `exact`, `clean` o `selected`. |
| `--boot-timeout SECONDS` | Establecer un tiempo de espera del menú de arranque de 0 a 300 segundos. |
| `--default-boot MODE` | Seleccionar la acción predeterminada de la sesión MiniOS. |
| `--kernel-args TEXT` | Añadir argumentos globales validados del kernel. |
| `--boot-background PNG` | Sustituir el arte de arranque soportado. |
| `--overlay-directory DIR` | Añadir una capa de sistema de archivos declarativa. |
| `--menu TYPE` | Seleccionar un menú multilingüe o localizado. |
| `--overwrite` | Permitir explícitamente la sustitución de una salida existente. |

El comando finaliza con un código distinto de cero si fallan las comprobaciones de fuente, módulo, personalización, almacenamiento, verificación o publicación. No distribuyas una salida a menos que el comando haya finalizado correctamente y se hayan probado la suma de verificación y los recorridos de arranque resultantes.
