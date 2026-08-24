# MiniOS Image Builder

MiniOS Image Builder es una aplicación GTK para remasterizar una imagen existente de MiniOS. Selecciona contenido de una sesión actual de MiniOS, un archivo ISO o un disco óptico, aplica personalización declarativa y utiliza `minios-image-compose` para producir un ISO arrancable y verificado.

El generador se ejecuta dentro de MiniOS. No modifica el medio fuente seleccionado.

## Elija el flujo de trabajo correcto

Image Builder remasteriza una imagen binaria existente de MiniOS. No sustituye a ninguno de estos flujos de trabajo:

- **Construir MiniOS desde el código fuente:** utilice el sistema de construcción `minios-live` cuando cambie las listas de paquetes de la distribución, la configuración de la compilación, la capa del kernel, los artefactos de arranque o la cadena de módulos reproducibles construidos desde el código fuente. Consulte [Building MiniOS](/development/Building-MiniOS.md).
- **Crear un módulo reutilizable:** utilice `apt2sb`, `script2sb`, `chroot2sb` u otras herramientas de módulos cuando el resultado deseado sea una capa independiente `.sb`. Consulte [Creating modules](/development/Creating-Modules.md).
- **Remasterizar una imagen:** utilice Image Builder para seleccionar módulos existentes, añadir módulos externos finalizados, cambiar configuraciones de imagen soportadas, capturar cambios de sesión opcionalmente y publicar otro ISO.

La capa del sistema de archivos del proyecto es para archivos declarativos en la raíz de la imagen. No ejecuta scripts, instala paquetes ni abre un chroot. El software destinado a ser reutilizado debe prepararse como módulo antes de añadirse a un proyecto de Image Builder.

## Opciones de origen

La página de Origen acepta:

- La sesión actual de MiniOS con LiveKit o dracut.
- Un archivo ISO de MiniOS.
- Un disco óptico de MiniOS.

Las fuentes ISO y de disco óptico se montan en modo solo lectura con `udisksctl`. El inventario de la fuente registra la edición, versión, arquitectura, soporte de gestor de arranque, tamaño, inventario de módulos y una huella digital de la fuente. Si una fuente cambia después de la planificación, la construcción se bloquea en lugar de continuar con una entrada diferente.

La captura de sesión siempre describe los cambios en la sesión de MiniOS que se está ejecutando. Cuando se selecciona un ISO o disco óptico, la captura solo está disponible si la huella digital del módulo base de esa fuente coincide con la base montada de la sesión en ejecución. Seleccionar medios externos no captura cambios realizados en otro sistema.

## Requisitos

Image Builder requiere el backend correspondiente de `minios-image-compose`. Las fuentes de archivo ISO y disco óptico requieren `udisks2`. Leer un `/etc/live/config.conf` solo-root y capturar una sesión escribible puede requerir `pkexec` y un agente PolicyKit de escritorio. La captura de sesión requiere un `savechanges` compatible suministrado por `minios-tools` 1.5.0 o superior.

La aplicación y el backend de composición permanecen sin privilegios. La autorización se limita al lector fijo de configuración en vivo y, cuando se selecciona, a `/usr/bin/savechanges` de confianza.

## Flujo de trabajo del proyecto

### Seleccionar el origen

Elija una fuente y espere a que finalice el inventario. Revise su identidad, arquitectura, soporte de arranque, diagnósticos y recuento de módulos. Resuelva los errores de origen antes de continuar.

### Seleccionar contenido

Elija los módulos fuente que desea incluir y agregue cualquier módulo externo `.sb`. Los módulos núcleo y de kernel requeridos están bloqueados. Los módulos activos en la sesión actual pero ausentes en la fuente seleccionada se muestran por separado y no se incluyen automáticamente.

Los módulos adicionales deben ser archivos regulares legibles con datos SquashFS válidos. Los nombres de archivo duplicados o que solo difieren en mayúsculas/minúsculas, así como las colisiones de destino, son rechazados porque el entorno de ejecución resuelve las capas por nombre base.

### Configurar ajustes

Elija la ruta de salida y la configuración actual requerida de MiniOS. Los campos de personalización vacíos o `Keep current` conservan el comportamiento de la fuente. Configure solo las anulaciones necesarias para la nueva imagen y decida si desea capturar la capa de sesión escribible.

Los bytes de `/etc/live/config.conf` se copian en un almacenamiento de compilación privado con modo 0600. No se interpretan, muestran ni registran. Los proyectos actuales deben incluir esta configuración; un proyecto antiguo que la desactive explícitamente no podrá pasar a Revisión hasta corregirse.

### Revisar el plan

Revisión crea un nuevo plan a partir de las identidades de entrada actuales. Verifique los módulos seleccionados, excluidos y adicionales, la ubicación de salida, el espacio estimado, el resumen de personalización, el perfil de captura, las advertencias y el límite de privilegios.

La revisión omite intencionadamente los valores de configuración, argumentos de kernel sin procesar, rutas privadas de personalización y rutas de captura seleccionadas. Muestra recuentos, nombres base, huellas digitales y sumas de verificación cuando son suficientes para vincular el plan.

Si la salida ya existe, la sustitución requiere confirmación. La confirmación está vinculada al dispositivo, inodo, tamaño, marca de tiempo y SHA-256 observados de ese archivo. Un destino cambiado, cancelación o intento fallido borra la aprobación y requiere otra revisión.

### Compilar y verificar

La compilación revalida cada entrada efectiva y ejecuta `minios-image-compose` con una lista de argumentos en un directorio de trabajo privado. El ISO permanece privado hasta que la verificación estructural sea exitosa. La publicación al destino seleccionado es atómica.

Guarde el proyecto si va a reutilizar su fuente, selección de módulos, salida e intención de personalización. Los archivos de proyecto son JSON. Los cambios no guardados requieren confirmación antes de abrir otro proyecto o cerrar la aplicación.

## Captura de sesión y privacidad

Los módulos fuente, `/etc/live/config.conf` y la captura de sesión son entradas independientes. Si la selección de módulos y la personalización declarativa son suficientes, no capture la sesión escribible.

### No incluir cambios de sesión

Esta es la opción recomendada por defecto. El generador utiliza los módulos seleccionados, la configuración actual, los ajustes de arranque y otras personalizaciones de la imagen sin copiar la capa de sesión escribible.

### Incluir todos los cambios de sesión

Este perfil conserva cada cambio escribible soportado del proveedor OverlayFS o AUFS detectado. Puede incluir contraseñas, claves, tokens, datos de navegador, identidad de la máquina, archivos personales, registros y estado de archivos eliminados. Requiere reconocimiento explícito y no debe usarse para una imagen destinada a otras personas sin una auditoría independiente.

### Incluir solo cambios reutilizables

Este perfil utiliza una lista estricta de rutas permitidas para software y valores seguros por defecto, omitiendo datos personales, de identidad, caché y registros en general. Reduce la exposición pero no garantiza que los archivos permitidos no contengan secretos. Inspeccione la imagen finalizada antes de compartirla.

### Elegir manualmente los cambios de sesión

Ejecute `Analyze session changes` y seleccione al menos una ruta normalizada del inventario en memoria. Un directorio seleccionado representa a sus descendientes. Las exclusiones exactas o de ancestros tienen prioridad sobre selecciones coincidentes.

El inventario contiene metadatos, incluidos nombres de archivo, por lo que es sensible aunque no contenga el contenido de los archivos. Permanece en memoria y no se escribe en el proyecto ni se copia en Revisión o registros. Las reglas explícitas de inclusión y exclusión representan la intención del proyecto y se guardan; Revisión solo muestra su cantidad y suma de verificación.

Iniciar otro análisis, actualizar o cambiar la fuente, cancelar o fallar, y abrir o crear un proyecto borran el inventario en tiempo de ejecución. El análisis y la captura pueden requerir autorización de administrador, pero el proceso de Image Builder y la composición del ISO no se elevan.

## Personalización de la imagen

Los ajustes soportados están restringidos y validados por el backend:

- **Valores predeterminados del sistema:** nombre de host, zona horaria, destino predeterminado de systemd y servicios habilitados o deshabilitados.
- **Seguridad y acceso:** sudo, PolicyKit, SSH, XRDP, X11, bloqueo de pantalla y modos de sugerencia de aviso permitidos.
- **Datos de usuario:** directorios de usuario validados relativos a la raíz con comportamiento de enlace o bind, pero no ambos.
- **Comportamiento de arranque:** un tiempo de espera de 0 a 300 segundos, el menú de la fuente o un menú construido, y una entrada predeterminada seleccionada.
- **Entradas de arranque:** las plantillas resume, new, choose, fresh y copy-to-RAM pueden ocultarse, reordenarse, duplicarse y configurarse mediante controles tipados de persistencia, módulo, inicio, localización, zRAM y diagnóstico.
- **Ajustes expertos de arranque:** argumentos de kernel validados globales y por entrada para opciones no representadas por controles tipados.
- **Apariencia:** un fondo de arranque PNG validado.
- **Capa de sistema de archivos del proyecto:** un único directorio real interpretado relativo a la raíz de la imagen y empaquetado como un módulo overlay SquashFS propiedad de root.

La capa de sistema de archivos soporta archivos regulares, enlaces simbólicos relativos seguros, directorios vacíos, bits de ejecución y marcas de tiempo. Se rechazan nodos de dispositivo, sockets, FIFOs, cruces de sistemas de archivos, enlaces absolutos o que escapen de la raíz y nombres inseguros. Se eliminan los bits de privilegio y la propiedad en el módulo generado se normaliza.

La personalización de arranque soporta GRUB reconocido de MiniOS, SYSLINUX nativo y la cadena estándar de SYSLINUX a GRUB. La configuración de arranque no soportada o ambigua se rechaza en vez de adivinarse. Una compilación sin personalización de arranque puede conservar una estructura de origen que el analizador de personalización no entiende.

## Verificación de salida

Antes de la publicación, `minios-image-compose` verifica el ISO generado en vez de confiar solo en una salida exitosa de `xorriso`. Las comprobaciones incluyen:

- El árbol de sistema de archivos ISO y la etiqueta de volumen.
- Registros de arranque BIOS y UEFI y el área del sistema.
- Contenido requerido de arranque, kernel, initramfs, configuración y módulos.
- Personalización embebida y atestaciones de captura de sesión cuando estén presentes.
- Sumas de verificación y estructura de los módulos overlay generados y de sesión capturada.
- Objetivos de fondo de arranque y configuración de arranque transformada cuando se personaliza.

La identidad de la ruta de entrada, modo, hora de modificación y SHA-256 se registran antes de la compilación. Las entradas mutables se copian de forma privada con reflinks cuando es compatible; de lo contrario, se comprueba si han cambiado antes y después de escribir el ISO. Una discrepancia o fallo de verificación impide la publicación.

Tras una compilación exitosa, registre una suma de verificación por separado:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verificación estructural no sustituye una prueba de arranque. Arranque el ISO en una máquina virtual desechable y pruebe tanto BIOS como UEFI cuando ambos deban ser soportados. Image Builder puede informar si QEMU o VirtualBox están instalados, pero no inicia ni configura un hipervisor.

## Seguridad y cancelación

- Mantenga los medios de origen en solo lectura y escriba la salida en un sistema de archivos con suficiente espacio libre para la estimación y el margen temporal.
- No sobrescriba directamente el único ISO conocido como bueno. Use un nuevo nombre de salida a menos que la sustitución sea intencionada y confirmada.
- Verifique los módulos externos antes de agregarlos. Image Builder valida su estructura SquashFS pero no establece quién creó su contenido.
- Prefiera no capturar la sesión para imágenes distribuidas. Si es necesario capturar, audite el sistema de archivos resultante, no solo el nombre del perfil.
- Trate los archivos de proyecto como sensibles cuando contengan rutas explícitas de origen, módulos, salida o reglas de captura seleccionadas.

Los subprocesos de inventario, compilación y verificación se ejecutan en grupos de procesos dedicados. Las solicitudes de cancelación piden la terminación y escalan tras un periodo de gracia. Un paso de hash puede finalizar antes de que la cancelación alcance un punto seguro, pero los resultados obsoletos se descartan. Una vez que la publicación atómica comienza, se permite que finalice para que el destino no quede intencionadamente a medio escribir.

Una compilación cancelada o fallida no publica su ISO privado. Cualquier destino anterior permanece salvo que un reemplazo verificado haya alcanzado la publicación atómica.

## Documentación relacionada

- [Building MiniOS](/development/Building-MiniOS.md)
- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO](/development/Rebuilding-ISO.md)
