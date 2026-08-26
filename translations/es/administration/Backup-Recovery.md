# Copia de seguridad y recuperación

Ninguna copia de seguridad única protege todas las partes de un sistema MiniOS. Los archivos personales, la configuración, las sesiones persistentes, los módulos y el dispositivo de almacenamiento requieren procedimientos de restauración diferentes. Mantén más de una copia, guarda al menos una copia en otro dispositivo y prueba la restauración antes de necesitar el original.

## Utiliza una estrategia de copias de seguridad por capas

Un conjunto práctico de copias de seguridad incluye estas capas:

1. Haz copias frecuentes e independientes de los archivos personales insustituibles, al margen de la sesión de MiniOS.
2. Registra los cambios en la configuración y la selección de módulos cada vez que se modifiquen.
3. Exporta cada sesión saludable y no activa en un modo compatible.
4. Conserva una copia fuera de línea de los datos que el Gestor de Sesiones no pueda exportar.
5. Crea una imagen ocasional de todo el medio después de apagar la fuente y asegurarte de que no recibe más escrituras.

Utiliza destinos versionados en lugar de sobrescribir la última copia conocida como válida. Registra con cada copia de seguridad la versión de MiniOS, edición, arquitectura, fecha de la copia, modo de sesión y estado de cifrado. Una imagen de todo el medio es una última red de seguridad útil, pero no debe ser la única copia de los archivos personales.

## Haz copia de seguridad de los datos personales primero

Realiza una copia de seguridad del directorio personal completo siempre que sea posible, incluyendo los ajustes ocultos de las aplicaciones. Como mínimo, incluye el trabajo guardado en Escritorio, Documentos, Descargas, Música, Imágenes, Público, Plantillas y Vídeos, además de cualquier directorio de proyectos o datos creado fuera de esas ubicaciones estándar.

El soporte de usuario-media de MiniOS puede enlazar o montar los directorios estándar de usuario en una ubicación separada dentro del medio MiniOS con escritura. La ruta configurada por defecto es `/minios/userdata`, pero `LIVE_USER_DIRS_PATH` permite seleccionar otra ruta segura. Los datos allí quedan fuera de la capa de sesión normal y deben respaldarse por separado. Verifica los destinos reales de los enlaces o puntos de montaje en vez de asumir que exportar una sesión los incluye. También haz copia de seguridad de los archivos almacenados intencionadamente en otros volúmenes montados.

Cierra las aplicaciones que gestionan bases de datos, almacenes de correo, perfiles de navegador o imágenes de máquinas virtuales antes de copiar sus datos. Para datos importantes, elige un método de copia de seguridad que conserve la propiedad, permisos, enlaces, atributos extendidos y marcas de tiempo, siempre que el destino lo permita.

## Haz copia de seguridad de la configuración

Conserva la configuración que controla los futuros arranques, no solo los archivos visibles en el sistema de archivos raíz actual. Las ubicaciones relevantes pueden incluir:

- `minios/config.conf` y `minios/config.conf.d/` en medios MiniOS con escritura.
- `/etc/live/config.conf` y `/etc/live/config.conf.d/` en un sistema persistente o nativo.
- Hooks revisados, preseeds, cambios en el menú de arranque y una nota de los parámetros de arranque personalizados.
- Configuración de usuario bajo el directorio personal y configuración de sistema seleccionada bajo `/etc` para una instalación nativa.

La configuración puede contener hashes de contraseñas, credenciales de red, claves y ajustes de servicios. Protege la copia de seguridad de la configuración en consecuencia. No almacenes frases de contraseña en texto plano junto a una copia de seguridad cifrada de la sesión. Consulta [Refuerzo de seguridad](/administration/Security-Hardening.md) para obtener orientación sobre cifrado y manejo de medios.

## Haz copia de seguridad de los módulos

Haz copia de seguridad de los archivos `.sb` personalizados desde el almacenamiento duradero de módulos y registra su orden, origen, versión de MiniOS y propósito. No deduzcas el próximo arranque a partir de lo que ves en el sistema de archivos raíz actual:

- **En ejecución ahora** es el conjunto de módulos que compone el sistema en vivo actual.
- **Próximo arranque** es el conjunto de módulos seleccionado por las reglas de arranque actuales.

Un módulo activado solo para la sesión actual puede no estar presente en el almacenamiento duradero. Un módulo añadido para el próximo arranque puede no estar activo ahora. Revisa y registra ambas vistas antes de hacer la copia de seguridad. Los filtros de arranque como `load`, `noload` y `bext` también pueden modificar el conjunto efectivo para el próximo arranque. Consulta [Gestor de Módulos](/administration/Module-Manager.md).

## Exporta sesiones persistentes

Utiliza [Gestión de sesiones](/configuration/Session-Management.md) para identificar la sesión En ejecución ahora y la seleccionada para el próximo arranque. Activar una sesión diferente solo cambia el próximo arranque; no hace que la sesión actual sea segura para exportar. Reinicia en otra sesión o arranca sin persistencia antes de respaldar la sesión que estaba en ejecución.

El Gestor de Sesiones puede exportar una sesión no activa `native`, `dynfilefs`, `raw` o `luks` como un archivo `.tar.zst`. La exportación es una copia lógica de los archivos de la sesión, no necesariamente una copia bit a bit de su contenedor de almacenamiento. Guarda el archivo en otro dispositivo. La importación crea una nueva sesión numerada; revísala y actívala explícitamente solo después de validarla.

Una exportación LUKS contiene los datos lógicos de la sesión descifrados, no el contenedor cifrado `changes.luks`. Cifra el destino de la copia de seguridad o el archivo exportado mediante un método revisado y separado si los datos exportados deben permanecer confidenciales. Importar en LUKS crea un nuevo contenedor cifrado y requiere una nueva frase de contraseña de destino.

No copies manualmente un directorio de sesión montado. La sesión puede estar cambiando y un sistema de archivos respaldado por un contenedor puede no estar representado por un conjunto consistente de archivos mientras está activo.

## Gestiona sesiones SquashFS fuera de línea

Antes de hacer copia de seguridad de una sesión SquashFS en ejecución, utiliza **Guardar ahora** y espera a que finalicen el guardado y la validación. Guardar reconstruye `changes.sb` y reemplaza atómicamente la instantánea anterior; no conserva una generación para retroceso. Luego apaga el sistema correctamente.

La implementación actual del Gestor de Sesiones no permite exportar ni copiar SquashFS. Tras guardar, arranca sin persistencia o utiliza otro sistema Linux y copia la sesión SquashFS desde el almacén de sesiones inactivo. Conserva juntos el directorio completo de la sesión numerada y los metadatos del almacén de sesiones. No reemplaces ni renumeres entradas en un almacén `minios/changes` activo. Consulta [Recuperación de arranque](/administration/Boot-Recovery.md) antes de modificar estructuras de arranque o disco durante una restauración.

## Conserva todos los segmentos de DynFileFS

Una sesión DynFileFS es un contenedor lógico dividido en un conjunto completo de archivos de respaldo. Una copia fuera de línea debe incluir `changes.dat` y todos los segmentos numerados como `changes.dat.0`, `changes.dat.1` y los segmentos posteriores. Copiar solo el primer archivo no genera una copia de seguridad utilizable. No crees un segmento faltante ni repares la única copia.

La exportación normal del Gestor de Sesiones evita esta preocupación a nivel de contenedor exportando los archivos lógicos de la sesión. Para copias interrumpidas, segmentos faltantes, medios llenos y reparación de sistemas de archivos, consulta [Recuperación de DynFileFS y dynblk](/configuration/DynFileFS-Recovery.md).

## Crea una imagen de todo el medio

[Utilidad de Discos](/installation/tools/Drive-Utility.md) puede usar **Crear imagen** para leer un dispositivo completo en una imagen raw, opcionalmente con compresión. Esto captura la tabla de particiones, archivos de arranque, módulos, configuración, almacén de sesiones, datos de usuario-media y bloques no usados tal como existen en el dispositivo de origen. Por tanto, el archivo de imagen necesita espacio de destino suficiente y puede contener datos eliminados recuperables y secretos.

Crea la imagen fuera de línea. Apaga MiniOS y conecta el medio de origen a otro sistema en funcionamiento, o arranca desde otro dispositivo. Asegúrate de que ninguna partición de origen esté montada y que no haya persistencia, swap, bases de datos ni servicios en segundo plano escribiendo en ella. La Utilidad de Discos normalmente oculta los dispositivos montados, pero mostrar un dispositivo en la interfaz no garantiza que una imagen raw en vivo sea consistente.

Verifica el origen por modelo de dispositivo, tamaño y nombre de dispositivo. Guarda la imagen en un dispositivo físico diferente, nunca en un sistema de archivos del dispositivo que estás copiando. Para restaurar, **Escribir imagen** realiza una sobrescritura raw del dispositivo de destino seleccionado. Confirma el destino con el mismo cuidado; todos los datos existentes en el destino se perderán. Utiliza un destino al menos tan grande como el origen, salvo que la imagen se haya preparado explícitamente para un dispositivo más pequeño.

## Haz copia de seguridad de instalaciones nativas

Una instalación nativa no utiliza una sesión persistente en vivo como su sistema de archivos raíz, por lo que la exportación del Gestor de Sesiones no es una copia de seguridad completa del sistema nativo. Haz copia de seguridad de los directorios personales de usuario, configuración de sistema seleccionada, datos de aplicaciones, archivos locales mantenidos y credenciales de recuperación utilizando un método de copia de seguridad compatible con sistemas de archivos. Registra la versión de MiniOS, el esquema de particiones, la selección de paquetes instalados, el modo de arranque y cualquier módulo o kernel personalizado.

Para recuperación bare-metal, crea una imagen de disco completa fuera de línea o utiliza un producto de copia de seguridad probado que soporte los sistemas de archivos y el esquema de particiones nativos. Mantén una copia de seguridad a nivel de archivos por separado para poder restaurar archivos individuales sin sobrescribir un disco. Consulta [Recuperación de arranque](/administration/Boot-Recovery.md) para diagnóstico de archivos de arranque y gestor de arranque.

## Valida las copias de seguridad y prueba las restauraciones

Una copia completada aún no es una copia de seguridad probada. En cada ciclo de copia de seguridad:

1. Confirma que la copia está en un dispositivo diferente y tiene la fecha y tamaño esperados.
2. Registra y luego compara una suma de verificación criptográfica para archivos comprimidos e imágenes de disco.
3. Abre una muestra de archivos personales, incluyendo al menos un archivo grande y uno de cada conjunto de datos de aplicaciones importantes.
4. Importa un archivo de sesión como una sesión nueva e inactiva e inspecciona sus archivos. Prueba el arranque solo después de preservar la selección de sesión conocida como válida.
5. Verifica que una copia fuera de línea de DynFileFS contenga toda la secuencia de segmentos.
6. Restaura una imagen de todo el medio solo en un dispositivo desechable o de repuesto de tamaño adecuado, luego prueba tanto el arranque como el acceso a los datos importantes.
7. Prueba la restauración de archivos nativos en una ubicación separada y verifica permisos, propiedad, enlaces y legibilidad por parte de las aplicaciones.

Realiza pruebas de restauración después de cambiar el modo de persistencia, cifrado, esquema de particiones, versión de MiniOS o software de copia de seguridad. Conserva la última copia conocida como válida hasta que la nueva haya superado su prueba de restauración. Para un diagnóstico más amplio, consulta [Recuperación de arranque](/administration/Boot-Recovery.md), [Recuperación de DynFileFS y dynblk](/configuration/DynFileFS-Recovery.md) y [Refuerzo de seguridad](/administration/Security-Hardening.md).
