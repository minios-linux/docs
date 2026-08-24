# MiniOS Module Manager

MiniOS Module Manager es la aplicación gráfica para inspeccionar, crear y gestionar módulos `.sb` de MiniOS. Cuenta con dos espacios de trabajo: **Módulos** para la composición del sistema y **Crear** para la creación de nuevos módulos.

Iníciala desde el menú de aplicaciones o ejecuta:

```bash
minios-module-manager
```

La aplicación se ejecuta como tu usuario de escritorio. Solo solicita autenticación de administrador cuando una operación lo requiere.

## Ejecución actual y en el próximo arranque

El espacio de trabajo Módulos mantiene dos vistas separadas:

- **En ejecución** es el conjunto ordenado de módulos que actualmente componen el sistema en vivo.
- **Próximo arranque** es el conjunto ordenado seleccionado por las reglas de arranque actuales de MiniOS.

Cambiar una vista no modifica la otra de forma silenciosa. Por ejemplo, **Activar para esta sesión** solo afecta al sistema en ejecución, mientras que **Agregar al próximo arranque** copia un módulo al almacenamiento duradero de módulos sin activarlo ahora.

La activación y desactivación en tiempo real solo están disponibles cuando el sistema de archivos raíz utiliza actualmente AUFS. No están disponibles en un root OverlayFS, incluso si el kernel soporta AUFS. Los módulos base no pueden desactivarse desde la aplicación.

Los cambios para el próximo arranque solo están disponibles cuando MiniOS encuentra un almacenamiento de módulos adecuado, duradero y con permisos de escritura. Los módulos base y los módulos en almacenamiento de solo lectura o volátil no pueden eliminarse. Los filtros de arranque como `load`, `noload` y `bext` siguen determinando qué módulos se seleccionan.

## Inspeccionar un módulo

Selecciona un módulo para ver su origen, tamaño comprimido y el contenido del sistema de archivos. Si su archivo de respaldo está disponible, **Extraer a carpeta** crea un nuevo directorio con los archivos del módulo.

La inspección y la extracción normal no requieren privilegios de administrador. La extracción nunca reemplaza un destino existente.

También puedes abrir un archivo local `.sb` desde el gestor de archivos. Abrir un archivo solo permite inspeccionarlo; no lo activa ni lo añade al próximo arranque.

## Crear un módulo

El espacio de trabajo Crear utiliza un flujo de **Configurar**, **Revisar**, **Ejecutar** y **Resultado**. Un módulo creado exitosamente permanece como un archivo en la ubicación de salida. No se activa ni se añade automáticamente al próximo arranque.

Los métodos disponibles son:

- **Paquetes** instala paquetes de repositorio y archivos locales seleccionados `.deb`, incluyendo sus dependencias, en un entorno de construcción aislado de MiniOS. La instalación de paquetes requiere autenticación de administrador.
- **Script de instalación** ejecuta un script revisado sin terminal interactiva. Una carpeta semilla opcional puede proporcionar archivos iniciales. El script se ejecuta con privilegios de administrador pero no se almacena en el módulo resultante.
- **Chroot interactivo** abre una shell raíz temporal en el terminal integrado. Escribe `exit` cuando termines, luego crea el módulo, vuelve a abrir la shell o descarta los cambios. Cerrar o descartar la sesión no altera el sistema en ejecución.
- **Carpeta** empaqueta el contenido de un directorio existente. El directorio fuente no se anida dentro del módulo. La conversión normal de carpetas no requiere root, deja la fuente sin cambios y normaliza la propiedad en el módulo a root.
- **Cambios de la sesión actual** captura archivos elegibles y eliminaciones de la capa de sesión escribible actual. Utiliza la política estándar de MiniOS `savechanges`, que omite registros, cachés, datos de arranque y rutas temporales de ejecución. Leer toda la capa escribible requiere autenticación de administrador.

Elige una nueva ruta de salida para cada flujo de trabajo. Los archivos existentes nunca se sobrescriben. El progreso y los diagnósticos del backend permanecen visibles mientras se ejecuta una operación, y la captura de la sesión actual puede cancelarse.

Cambios de la sesión actual está pensado para una captura estándar y conveniente, no para revisar cada ruta incluida. Una capa escribible en vivo puede contener datos personales o confidenciales. Para políticas explícitas de `exact`, `clean` o privacidad seleccionada por ruta, utiliza el flujo de trabajo por línea de comandos `savechanges` descrito en [Creación de módulos](/development/Creating-Modules.md).

## Arrastrar y soltar

Arrastrar y soltar solo llena un campo de entrada o abre la inspección:

- Un módulo abre sus detalles.
- Los archivos `.deb` se añaden a Paquetes.
- Un directorio se selecciona para Carpeta.
- Otro archivo regular se selecciona como Script de instalación.

Soltar un elemento no ejecuta código ni modifica En ejecución ni Próximo arranque.

## Documentación relacionada

- [Creación de módulos](/development/Creating-Modules.md)
- [Reconstrucción de imágenes ISO](/development/Rebuilding-ISO.md)
- [Parámetros de arranque](/configuration/Boot-Parameters.md)
