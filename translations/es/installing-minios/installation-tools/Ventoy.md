---
updated: 2026-10-15
---

# Ventoy

Ventoy es una herramienta popular para crear unidades USB de arranque que te permite almacenar varios archivos ISO en un solo dispositivo y arrancar desde cualquiera de ellos.

## Importante

**Advertencia:** ¡La selección incorrecta del dispositivo provocará la pérdida de datos! Verifica siempre la unidad seleccionada y haz una copia de seguridad de los datos importantes.

La integración actual de MiniOS es compatible con Ventoy.**modo normal**, incluyendo imágenes de persistencia directa en BIOS y UEFI. Las imágenes antiguas de MiniOS pueden requerir el **modo GRUB2**; utiliza ese modo si la imagen antigua no puede detectar su origen en modo normal. El sufijo de nombre de archivo `VTGRUB2` puede forzar el modo GRUB2 para esa imagen. No es un requisito universal para las imágenes actuales.

## Requisitos de la unidad

### Tamaño de la unidad

Deja espacio suficiente para los archivos ISO, otros datos y el almacenamiento persistente que desees. El espacio reservado de Ventoy y la capacidad de la imagen de persistencia son opciones independientes. Consulta [Compatibilidad de hardware](/getting-started/Hardware-Compatibility) para los requisitos del sistema.

## Instalación de Ventoy

### Método 1: Instalación estándar

1. **Descarga Ventoy** desde el [sitio web oficial](https://www.ventoy.net/)
2. **Ejecuta el instalador de Ventoy** y selecciona tu unidad USB
3. **Instala Ventoy** en la unidad (todos los datos serán eliminados)
4. **Copia el archivo ISO de MiniOS** en la carpeta raíz de la unidad USB

Esto crea un medio multiboot con archivos ISO: Ventoy mantiene el ISO como un archivo en su partición de datos y lo presenta al arrancar. No es una escritura de imagen cruda de MiniOS ni un despliegue del instalador de MiniOS.

### Método 2: Instalación con partición de datos separada (Recomendado)

1. **Descarga Ventoy** desde el [sitio web oficial](https://www.ventoy.net/)
2. **Ejecuta el instalador de Ventoy** y selecciona tu unidad USB
3. **Activa la opción "Reservar espacio"** durante la instalación para dejar espacio sin asignar al final de la unidad
4. **Instala Ventoy** en la unidad
5. **Copia el archivo ISO de MiniOS** en la carpeta raíz de la unidad USB
6. **Crea una partición ext4** en el espacio reservado con la etiqueta `persistence` usando un editor de particiones

Esto proporciona una posible ubicación para la persistencia, pero solo crear la partición no habilita la persistencia ni crea una sesión.

## Integración con MiniOS

MiniOS detecta la ISO presentada por Ventoy de forma independiente al almacenamiento con permisos de escritura. Existen dos modelos de persistencia; selecciona uno de forma intencionada.

### Sesiones normales de MiniOS

Sin un backend de complemento de persistencia Ventoy seleccionado, las solicitudes habituales de **Iniciar MiniOS** entrada `perchdir=resume`. MiniOS puede utilizar una partición en el mismo disco `persistence` o su `minios/changes/` almacenamiento en la partición de datos Ventoy. Para la estructura de partición de datos, habilita el soporte de remontaje de Linux de Ventoy en `/ventoy/ventoy.json`:

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Integra esto en una configuración existente en lugar de descartar otros complementos. Aún se requiere un almacenamiento escribible adecuado. En FAT32/NTFS/exFAT, el inicio prefiere DynBlk cuando está disponible y, de lo contrario, utiliza DynFileFS. El Session Manager, las sesiones numeradas, el cifrado y el guardado de sesiones RAM compatibles siguen las reglas normales de MiniOS. Un arranque sin solicitud de persistencia permanece temporal.

### Ventoy Plugin de persistencia

Como alternativa, asocia el ISO con una **imagen de persistencia ext4** usando el Plugin de persistencia de Ventoy. Por ejemplo, una imagen ya creada en `/ventoy/minios.dat` se puede seleccionar para `/ISO/MiniOS.iso`:

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

Las rutas son relativas a la raíz de la partición de datos de Ventoy. Crea la imagen ext4 con las herramientas de imagen de persistencia de Ventoy y selecciónala al arrancar; simplemente colocar un archivo `.dat` en la unidad no la activa. MiniOS utiliza el backend seleccionado por Ventoy, no cualquier dispositivo con una etiqueta coincidente.

Esta imagen contiene un único entorno persistente, con `changes/` y, para OverlayFS, `workdir/`. No contiene sesiones numeradas de MiniOS. Para utilizar otro entorno, elige otro backend en Ventoy. Session Manager y `minios-session` no están disponibles, `perchdir` se ignora la selección de sesión, y `perchtoram` no puede copiar este upper en RAM. El sistema `toram` sigue siendo posible, pero no elimina la dependencia de la imagen de persistencia.

El primer uso registra el formato de unión. Si reutilizas la imagen con otro backend de unión, una imagen no disponible, una imagen que no sea ext4 o si falla la activación en modo escritura, se mostrará una advertencia y se creará un upper RAM nuevo. **Iniciar sin guardar** no abre la imagen. Consulta [Modos de arranque](/using-minios/Boot-Modes) y [Internals de persistencia](/reference/boot-process/Persistence-Internals).

## Usando MiniOS con Ventoy

### Arranque

Después de instalar Ventoy y copiar el archivo ISO MiniOS en la unidad:

1. **Inicia desde la unidad USB** - selecciónala en la BIOS/UEFI
2. **Selecciona MiniOS** de la lista de archivos ISO disponibles en el menú Ventoy
3. Selecciona el modo normal para una imagen MiniOS actual; para una imagen anterior, utiliza el modo documentado para esa versión
4. **Espera a que se cargue MiniOS**

Después de iniciar, verifica el estado de persistencia antes de confiar en los cambios guardados. En sesiones normales, utiliza `sudo minios-session status`. Con el complemento de persistencia, revisa `/run/initramfs/minios-persistence/boot-state` como root: si el backend se activa correctamente, se registran `mode=ventoy` y `boot_level=ok`. Mantén la unidad conectada mientras se esté utilizando su ISO o imagen de persistencia.
