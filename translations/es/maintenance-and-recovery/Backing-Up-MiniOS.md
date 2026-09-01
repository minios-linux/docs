---
updated: 2026-08-31
---

# Realizar copias de seguridad de MiniOS

Una copia de seguridad es la vía confiable para recuperar MiniOS. La documentación no garantiza un procedimiento genérico de reparación para un gestor de arranque, sistema de archivos o contenedor de persistencia dañado. Mantén copias recuperables antes de cambiar una versión, kernel, esquema de almacenamiento o sesión importante.

## Qué respaldar

Conserva las partes que no pueden ser recreadas fácilmente a partir de una imagen de MiniOS:

- archivos personales, incluyendo datos ocultos de aplicaciones que sean importantes para ti;
- archivos `config.conf`, archivos `config.conf.d` revisados y cambios intencionados en el menú de arranque o en los parámetros de arranque;
- módulos `.sb` creados por el usuario y una nota de la versión de MiniOS para la que fueron construidos;
- sesiones persistentes que contengan estados del sistema o de aplicaciones que necesites;
- claves de cifrado, credenciales de recuperación y otros secretos almacenados por separado de la copia de seguridad que protegen.

Los archivos almacenados fuera de la capa de sesión, por ejemplo en una ubicación de datos de usuario separada, deben respaldarse por separado. No asumas que un archivo de sesión contiene datos montados desde otro sistema de archivos.

## Exportar sesiones persistentes

El Gestor de Sesiones de MiniOS puede exportar una sesión **no activa** de `native`, `dynfilefs`, `raw` o `luks` a un archivo verificado `.tar.zst`. Primero identifica la sesión:

```bash
minios-session list
minios-session running
```

Luego inicia otra sesión o selecciona **Iniciar sin guardar** y exporta la sesión inactiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

La exportación es una copia lógica del contenido de la sesión, no una copia bit a bit de su contenedor de almacenamiento. Guárdala en otro dispositivo.

Para una sesión LUKS, el archivo contiene los archivos lógicos ya descifrados. Protege el archivo por separado si los datos deben permanecer cifrados.

### Sesiones SquashFS

El Gestor de Sesiones actual no exporta ni copia sesiones SquashFS. Utiliza **Guardar ahora** antes de apagar para que la instantánea actual esté completa y luego protege los archivos importantes por separado. Si necesitas una copia completa y restaurable de todo el dispositivo MiniOS, crea una imagen del dispositivo sin conexión.

No confíes en copiar manualmente un directorio de sesión montado ni en reconstruir `session.conf`, segmentos DynFileFS o metadatos de contenedores como método de respaldo.

## Respaldar configuración y módulos

En medios MiniOS con escritura, conserva `minios/config.conf`, `minios/config.conf.d/` y los módulos creados por el usuario almacenados en `minios/modules/`.
También registra los parámetros de arranque personalizados o cambios en el menú de arranque que no sean evidentes en esos archivos.

Un módulo construido para una versión de MiniOS no es automáticamente compatible con otra.
Guarda el código fuente o la receta necesaria para reconstruir los módulos personalizados importantes.

## Crear una imagen de todo el dispositivo

Una imagen de todo el dispositivo es útil cuando deseas conservar la tabla de particiones, archivos de arranque, módulos, configuración, sesiones y otros datos en conjunto. Créala sin conexión: apaga MiniOS e imagen el dispositivo desde otro sistema en funcionamiento.

[Utilidad de disco](/installing-minios/installation-tools/Drive-Utility) ofrece las operaciones **Crear imagen** y **Escribir imagen**. Guarda la imagen en un dispositivo físico diferente. Restaurar una imagen de todo el dispositivo sobrescribe el destino seleccionado, así que verifica el modelo y la capacidad del destino antes de escribir.

Una imagen de dispositivo es un complemento, no un reemplazo, de una copia de seguridad independiente de archivos personales importantes.

## Restaurar un archivo de sesión

Importar un archivo del Gestor de Sesiones crea una nueva sesión numerada; no sobrescribe la existente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante la importación se realizan comprobaciones de compatibilidad. Inspecciona la sesión importada antes de activarla y conserva la sesión que sabes que funciona hasta que hayas probado la copia restaurada.

Al migrar a otra versión de MiniOS, es preferible migrar solo los datos personales y la configuración seleccionados. No asumas que una sesión completa antigua o un módulo personalizado son compatibles con la nueva versión solo porque se pueden copiar allí.

Consulta [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) para la gestión de sesiones y [Actualización de MiniOS](/maintenance-and-recovery/Updating-MiniOS) para moverte entre versiones de MiniOS.
