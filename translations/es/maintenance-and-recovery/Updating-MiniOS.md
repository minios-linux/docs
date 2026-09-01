---
updated: 2026-08-31
---

# Actualización de MiniOS

MiniOS **no** cuenta con un procedimiento de actualización in situ compatible de una versión de MiniOS a otra. El sistema modular en vivo se compone de módulos SquashFS de solo lectura más una capa de sesión escribible, por lo que cambiar los paquetes de Debian en el sistema en ejecución no reemplaza la versión de MiniOS en sí.

::: warning Una nueva versión de MiniOS es una instalación nueva
No existe un equivalente en MiniOS de `dist-upgrade` que convierta una copia instalada o persistente de una versión de MiniOS en otra versión. Pasar a una versión más reciente de MiniOS implica instalar esa versión y luego migrar los datos y configuraciones que desees conservar.
:::

## Se permite el uso de APT

MiniOS no bloquea ni prohíbe APT. Puedes instalar y actualizar paquetes de Debian cuando sea útil:

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS modular en vivo

En una sesión en vivo de MiniOS, APT escribe los archivos de paquetes y metadatos de paquetes en la capa escribible. Con persistencia, esos cambios pueden sobrevivir a un reinicio. Los módulos `.sb` de solo lectura debajo de esa capa no se modifican; los archivos actualizados en la sesión simplemente sobrescriben los archivos de los módulos.

Esto es mantenimiento de paquetes **dentro de esa sesión**, no una actualización de MiniOS.
También consume espacio de persistencia y puede hacer que la sesión difiera considerablemente de la imagen publicada. Una sesión nueva siempre comienza desde el conjunto de paquetes contenido en los módulos de MiniOS.

No cambies las fuentes de APT a otra versión de Debian ni ejecutes `upgrade`, `full-upgrade` o `dist-upgrade` esperando obtener una versión más reciente de MiniOS.
Eso genera un estado mixto del sistema; no reproduce el conjunto de módulos, archivos de arranque, selección de firmware, paquetes de MiniOS ni otras elecciones de una versión publicada de MiniOS.

### Después de la conversión nativa

Una instalación nativa creada por el Instalador de MiniOS es un escritorio Debian convencional, en lugar del sistema live modular MiniOS. Mantiene la experiencia de escritorio familiar de MiniOS, incluyendo el entorno de escritorio seleccionado, la identidad visual y las aplicaciones habituales, mientras que el software live específico de MiniOS se elimina. El sistema resultante tiene un sistema de archivos raíz editable: APT actualiza los paquetes normalmente, el kernel se gestiona a través de paquetes Debian y el gestor de arranque instalado junto con el initramfs utilizan el flujo de trabajo convencional de Debian.

Por lo tanto, el modelo de actualización de versión de MiniOS no se aplica a ese sistema convertido. La identidad visual de MiniOS y el software de escritorio habitual pueden permanecer, mientras que el mantenimiento continuo sigue el modelo normal de Debian en lugar del flujo de trabajo de módulos/sesiones de MiniOS.

## Cambio a una versión más reciente de MiniOS

Trata una versión más reciente de MiniOS como un sistema independiente:

1. Descarga y [verifica](/installing-minios/Verifying-Downloads) la nueva imagen.
2. Haz una copia de seguridad de los archivos importantes, la configuración, los módulos de usuario y las sesiones persistentes como se describe en [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Instala la nueva versión utilizando el [método de instalación](/installing-minios/Installation-Methods) adecuado.
4. Iníciala primero con una sesión nueva y verifica el hardware y las aplicaciones que necesitas.
5. Migra los archivos personales y la configuración seleccionada. Cuando Session Manager pueda exportar la sesión anterior, importa su archivo y deja que se realicen las comprobaciones de compatibilidad, en lugar de copiar manualmente el almacenamiento de la sesión en vivo.
6. Reconstruye o reinstala los módulos personalizados cuando no se sepa que son compatibles con la versión de destino.

Conserva la instalación o copia de seguridad anterior hasta que la nueva versión haya sido probada.
No combines módulos base, archivos de arranque, archivos de kernel ni archivos initramfs de diferentes versiones de MiniOS en un intento de fabricar una actualización.

## Los módulos y los kernels son tareas de mantenimiento independientes

Un módulo de `.sb` creado por el usuario puede ser reemplazado o reconstruido de forma independiente cuando así se desee. Eso modifica una capa de personalización; no cambia la versión de MiniOS. Consulta [Gestión de módulos](/preparing-and-customizing/Managing-Modules).

El kernel de MiniOS también se gestiona como un módulo de kernel coordinado, `vmlinuz`, y un conjunto de initramfs. Utiliza [Gestión de kernels](/preparing-and-customizing/Managing-Kernels) para esa operación. Actualizar solo un paquete de `linux-image` con APT no es el flujo de trabajo de gestión de kernel de MiniOS, y cambiar el kernel no actualiza la versión de MiniOS.
