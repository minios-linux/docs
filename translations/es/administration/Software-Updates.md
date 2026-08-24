# Actualizaciones de software

MiniOS combina módulos de imagen SquashFS de solo lectura con una superposición de ejecución escribible. El método de actualización debe coincidir con la capa que se va a modificar. Actualizar paquetes dentro de una sesión en ejecución no es lo mismo que reemplazar los módulos en el medio de MiniOS.

## Actualizar paquetes con APT

APT escribe en la superposición de ejecución. Habilita y utiliza una sesión persistente antes de actualizar si los cambios deben mantenerse después de reiniciar:

```bash
sudo apt update
sudo apt upgrade
```

Sin persistencia, los cambios en los paquetes se pierden al apagar. Con persistencia, los archivos actualizados y el estado de APT permanecen en esa sesión, pero los módulos de imagen `.sb` subyacentes no se modifican. Una sesión nueva seguirá usando las versiones de los paquetes incluidas en la imagen.

APT es adecuado para mantener una sola instalación persistente. Verifica primero el espacio disponible, ya que los archivos actualizados se almacenan además de los módulos base comprimidos. No consideres una actualización de versión de Debian en el lugar como una actualización de imagen de MiniOS; en su lugar, utiliza una imagen creada para la versión de destino.

## Actualizar software con módulos

Un módulo `.sb` es software de solo lectura que se carga al iniciar. Los módulos son duraderos cuando se almacenan en el directorio `modules/` escribible de MiniOS o en una fuente de módulo de persistencia duradera. No requieren que los cambios de paquetes se guarden en la sesión.

Inspecciona el conjunto de módulos para el próximo arranque antes y después de agregar un módulo:

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

`sb next-boot add` valida y publica un nuevo módulo de forma atómica, pero no sobrescribe un módulo existente con el mismo nombre. Elimina primero un módulo de usuario reemplazable cuando una actualización mantiene intencionadamente el mismo nombre base:

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

Los módulos base y los módulos en medios de solo lectura no pueden eliminarse con este comando. Construye u obtén módulos actualizados para la misma arquitectura, versión de la distribución y nivel inferior de la pila de módulos. Los módulos con números más altos sobrescriben capas inferiores, por lo que un módulo adicional antiguo también puede sobrescribir archivos proporcionados por una imagen base más reciente.

Para software empaquetado localmente, `apt2sb upgrade` puede crear un módulo de actualización. Consulta [Creación de módulos](/development/Creating-Modules.md) para detalles sobre la construcción de módulos y dependencias.

## Reemplazar módulos de imagen

Las actualizaciones oficiales de imagen reemplazan archivos en el medio de MiniOS; `apt upgrade` no los actualiza. Es preferible reemplazar el conjunto completo de módulos base y los archivos de arranque correspondientes de una misma versión de MiniOS, o reinstalar desde la nueva imagen. No mezcles archivos principales, de escritorio, aplicaciones, firmware o de arranque de diferentes versiones a menos que su compatibilidad esté documentada.

Antes de reemplazar:

1. Haz una copia de seguridad de la configuración de MiniOS, los datos de persistencia, los módulos de usuario y los módulos base actuales.
2. Registra las listas de módulos activos y para el próximo arranque con `sb list` y `sb next-boot`.
3. Realiza el reemplazo desde otro sistema o desde un arranque cargado en RAM para que los archivos de origen no estén en uso.
4. Conserva los archivos anteriores hasta que la nueva imagen arranque y se hayan probado el hardware y las aplicaciones necesarias.

Mantén los nombres base y el orden de los módulos cuando una versión indique un reemplazo directo. Una fuente posterior con el mismo nombre base reemplaza a una anterior en la selección para el próximo arranque; copias con nombres diferentes pueden cargarse ambas y producir un orden de capas no deseado.

## Actualizar el kernel

El kernel es un conjunto coordinado: el módulo de drivers `01-kernel.sb`, la imagen del kernel, el initramfs y la configuración del gestor de arranque deben coincidir. Utiliza el Administrador de Kernel de MiniOS o el comando `minios-kernel` en lugar de actualizar solo un paquete `linux-image` con APT.

Lista y empaqueta un kernel del repositorio, luego actívalo para el próximo arranque:

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

La activación actualiza la configuración de arranque de MiniOS. Reinicia para ejecutar el kernel seleccionado y luego verifícalo con `uname -r`. Conserva al menos un kernel funcional conocido y sus archivos de arranque hasta que se hayan probado el hardware, almacenamiento, red y drivers externos. El módulo estándar de kernel de MiniOS puede incluir drivers adicionales que no están presentes en un kernel de repositorio de la distribución.

Consulta [Gestión del kernel](/administration/Kernel-Management.md) para el flujo de trabajo gráfico, opciones de comando y procedimiento de recuperación.

## Compatibilidad y recuperación

Haz una copia de seguridad de la persistencia antes de cambiar la imagen base o el kernel. Los archivos y metadatos persistentes de paquetes pueden sobrescribir un nuevo módulo base o describir versiones de paquetes que ya no coinciden. Prueba una imagen nueva primero con una sesión limpia y luego con una copia de la sesión existente. Conserva la imagen original, los módulos y la copia de seguridad de la sesión hasta que ya no sea necesario hacer una reversión.

Después de cualquier actualización, verifica los módulos seleccionados, inicia una vez y comprueba las aplicaciones y el hardware afectados. Si una imagen base nueva entra en conflicto con módulos de usuario antiguos o la persistencia, desactiva esas capas y vuelve a introducirlas una por una.
