---
updated: 2026-09-13
---

# Respaldo de MiniOS

Un respaldo es la vía confiable para recuperar MiniOS. La documentación no garantiza un procedimiento genérico de reparación para un gestor de arranque, sistema de archivos o contenedor de persistencia dañado. Mantén copias recuperables antes de cambiar una versión, kernel, esquema de almacenamiento o sesión importante.

## Qué respaldar

Conserva las partes que no se pueden recrear fácilmente desde una imagen MiniOS:

- archivos personales, incluidos los datos ocultos de aplicaciones que te interesan;
- `config.conf`, revisa `config.conf.d` archivos y los cambios intencionados en el menú de arranque o parámetros de arranque;
- módulos creados por el usuario `.sb` y una nota de la versión de MiniOS para la que fueron construidos;
- sesiones persistentes que contengan el estado del sistema o de aplicaciones que necesitas;
- claves de cifrado, credenciales de recuperación y otros secretos almacenados por separado del respaldo que protegen.

Los archivos almacenados fuera de la capa de sesión, por ejemplo en una ubicación de datos de usuario separada, deben respaldarse por separado. No asumas que un archivo de sesión contiene datos montados desde otro sistema de archivos.

## Exportar sesiones persistentes

El Gestor de sesiones de MiniOS puede exportar una **inactiva** `native`, `dynfilefs`, `dynblk`, `raw`, o `luks` sesión a un archivo `.tar.zst`verificado. Primero identifica la sesión:

```bash
minios-session list
minios-session running
```

Luego inicia otra sesión o **Iniciar sin guardar** y exporta la sesión inactiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

La exportación es una copia lógica del contenido de la sesión, no una copia byte a byte de su contenedor de almacenamiento. Guárdala en otro dispositivo.

Para una sesión LUKS, el archivo contiene los archivos lógicos descifrados. Protege el archivo por separado si los datos deben permanecer cifrados.

### Sesiones SquashFS

El Gestor de sesiones actual no exporta ni copia sesiones SquashFS. Usa **Guardar ahora** antes de apagar para que la instantánea actual esté completa y luego protege los archivos importantes por separado. Si necesitas una copia completa y restaurable de todo el dispositivo MiniOS, crea una imagen del dispositivo sin conexión.

No confíes en copiar manualmente un directorio de sesión montado ni en reconstruir `session.conf`, segmentos DynFileFS, archivos de respaldo dynblk u otros metadatos de contenedores como método de respaldo. Un respaldo manual byte a byte de dynblk es seguro solo cuando el volumen está desmontado y debe preservar su `volume000.db` completo a través de `volume063.db` el espacio de nombres exactamente como existe; se prefiere el respaldo lógico de `minios-session export`.

## Respalda configuración y módulos

En medios MiniOS con escritura, conserva `minios/config.conf`, `minios/config.conf.d/`, y los módulos creados por el usuario almacenados en `minios/modules/`.
También registra los parámetros de arranque personalizados o cambios en el menú de arranque que no sean evidentes en esos archivos.

Un módulo construido para una versión de MiniOS no es automáticamente adecuado para otra.
Conserva la fuente o receta necesaria para reconstruir los módulos personalizados importantes.

## Crear una imagen de dispositivo completo

Una imagen de dispositivo completo es útil cuando deseas conservar la tabla de particiones, archivos de arranque, módulos, configuración, sesiones y otros datos juntos. Créala sin conexión: apaga MiniOS y realiza la imagen del dispositivo desde otro sistema en ejecución.

[Utilidad de disco](/installing-minios/installation-tools/Drive-Utility) ofrece las operaciones **Crear imagen** y **Escribir imagen**. Guarda la imagen en un dispositivo físico diferente. Restaurar una imagen de dispositivo completo sobrescribe el destino seleccionado, así que verifica el modelo y la capacidad antes de escribir.

Una imagen de dispositivo es un complemento, no un reemplazo, de un respaldo separado de tus archivos personales importantes.

## Restaurar un archivo de sesión

Importar un archivo del Gestor de sesiones crea una nueva sesión numerada; no sobrescribe la existente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante la importación se realizan comprobaciones de compatibilidad. Revisa la sesión importada antes de activarla y conserva la sesión que funciona hasta que la copia restaurada haya sido probada.

Al pasar a otra versión de MiniOS, es preferible migrar solo los datos personales y la configuración seleccionados. No asumas que una sesión completa antigua o un módulo personalizado son compatibles con la nueva versión solo porque pueden copiarse allí.

Consulta [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) para la gestión de sesiones y [Actualización de MiniOS](/maintenance-and-recovery/Updating-MiniOS) para migrar entre versiones de MiniOS.
