---
updated: 2026-10-06
---

# Respaldo de MiniOS

Una copia de seguridad es la vía fiable para recuperar MiniOS. La documentación no garantiza un procedimiento genérico de reparación para un gestor de arranque, sistema de archivos o contenedor de persistencia dañado. Mantén copias recuperables antes de modificar una versión, kernel, esquema de almacenamiento o sesión importante.

## Qué respaldar

Conserva las partes que no pueden recrearse fácilmente a partir de una imagen de MiniOS:

- archivos personales, incluidos los datos ocultos de aplicaciones que sean importantes para ti;
- `config.conf`, revisa `config.conf.d` archivos y los cambios intencionados en el menú de arranque o en los parámetros de arranque;
- módulos creados por el usuario `.sb` y una nota sobre la versión de MiniOS para la que fueron compilados;
- sesiones persistentes que contengan estados del sistema o de aplicaciones que necesites;
- claves de cifrado, credenciales de recuperación y otros secretos almacenados de forma separada de la copia de seguridad que protegen.

Los archivos almacenados fuera de la capa de sesión, por ejemplo en una ubicación separada de datos de usuario, deben respaldarse por separado. No asumas que un archivo de sesión contiene datos montados desde otro sistema de archivos.

## Exportar sesiones persistentes

El Gestor de sesiones de MiniOS puede exportar una sesión **inactiva** `native`, `dynfilefs`, `dynblk`, `vmdk`, o `raw` sesión, incluidas las formas cifradas compatibles con LUKS2, a un `.tar.zst` archivo verificado. Primero identifica la sesión:

```bash
minios-session list
minios-session running
```

Luego inicia otra sesión o **Iniciar sin guardar** y exporta la sesión inactiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

La exportación es una copia lógica del contenido de la sesión, no una copia bit a bit de su contenedor de almacenamiento. Guárdala en otro dispositivo.

Para una sesión cuyo backend Raw, DynFileFS, DynBlk o VMDK esté envuelto en LUKS2, el archivo contiene los archivos lógicos ya descifrados. Protege el archivo por separado si los datos deben permanecer cifrados.

### Sesiones SquashFS

El Gestor de sesiones actual no exporta ni copia sesiones SquashFS. Utiliza **Guardar ahora** antes de apagar para que la instantánea actual esté completa, y luego protege los archivos importantes por separado. Si necesitas una copia completa y restaurable de todo el dispositivo MiniOS, crea en su lugar una imagen del dispositivo en modo offline.

No confíes en copiar manualmente el directorio de una sesión montada ni en reconstruir `session.conf`, los segmentos DynFileFS, los archivos de respaldo DynBlk u otros metadatos del contenedor como método de copia de seguridad. Un respaldo manual bit a bit de DynBlk es seguro solo si el volumen está desmontado y debe conservar todas las partes existentes,`volume*.db` incluidas las numeraciones de cuatro o más dígitos, exactamente como están; se prefiere la copia lógica`minios-session export`.

## Respalda configuración y módulos

En medios MiniOS con escritura, conserva `minios/config.conf`, `minios/config.conf.d/`, y los módulos creados por el usuario almacenados en `minios/modules/`.
También anota los parámetros personalizados de arranque o cambios en el menú de arranque que no sean evidentes en esos archivos.

Un módulo compilado para una versión de MiniOS no es automáticamente válido para otra.
Guarda el código fuente o la receta necesaria para reconstruir los módulos personalizados importantes.

## Crear una imagen de dispositivo completo

Una imagen de dispositivo completo es útil cuando deseas conservar la tabla de particiones, archivos de arranque, módulos, configuración, sesiones y otros datos juntos. Créala en modo offline: apaga MiniOS e imagen el dispositivo desde otro sistema en ejecución.

[Utilidad de disco](/installing-minios/installation-tools/Drive-Utility) ofrece las operaciones **Crear imagen** y **Escribir imagen**. Guarda la imagen en un dispositivo físico diferente. Restaurar una imagen de dispositivo completo sobrescribe el destino seleccionado, así que verifica el modelo y la capacidad antes de escribir.

Una imagen de dispositivo es un complemento, no un sustituto, de una copia de seguridad independiente de tus archivos personales importantes.

## Restaurar un archivo de sesión

Importar un archivo del Gestor de sesiones crea una nueva sesión numerada; no sobrescribe la existente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante la importación se realizan comprobaciones de compatibilidad. Revisa la sesión importada antes de activarla y conserva la sesión que sabes que funciona hasta que hayas probado la copia restaurada.

Al migrar a otra versión de MiniOS, es preferible migrar solo los datos personales y la configuración seleccionados. No asumas que una sesión completa antigua o un módulo personalizado serán compatibles con la nueva versión solo porque puedan copiarse allí.

Consulta [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) para la gestión de sesiones y [Actualización de MiniOS](/maintenance-and-recovery/Updating-MiniOS) para moverse entre versiones de MiniOS.
