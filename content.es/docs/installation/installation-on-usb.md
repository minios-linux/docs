---
title: Instalación en disco duro o unidad flash USB
type: docs
weight: 1
---
# Instalación en disco duro o unidad flash USB

Para ejecutar MiniOS desde el disco duro o desde un dispositivo USB, tienes que copiar el contenido del archivo ISO directamente a la raíz de tu disco.

<!--more-->
Sólo hay una carpeta llamada `/minios/`, que necesita ser copiada. Por ejemplo, Windows 10 simplemente abrirá el archivo ISO como si fuera un directorio. Es posible que necesite algún software especial para esta tarea si su sistema operativo no puede acceder al contenido del archivo ISO. Como alternativa, puede grabar el archivo ISO en un disco CD/DVD y luego copiarlo desde allí. Deberías terminar con la carpeta `/minios/` en tu disco, por ejemplo como `E:\minios\`. Es necesario que tu disco utilice el esquema de particiones msdos (utiliza MBR, no GPT). Además, necesita estar formateado, se recomienda FAT32 o ext4.

Una vez hecho esto, se requiere un paso más para que la unidad sea arrancable: navega hasta el directorio `/minios/boot/` en tu dispositivo USB o disco duro y localiza allí el archivo `bootinst.bat` (los usuarios de Linux buscan `bootinst.sh`). Simplemente ejecútalo haciendo doble clic, hará todos los cambios necesarios en el registro maestro de arranque de tu dispositivo para que la BIOS de tu ordenador pueda entender cómo arrancar MiniOS desde tu disco. Ten en cuenta que el instalador de arranque no soporta multiarranque, por lo que sólo MiniOS será arrancable desde el disco dado.

A continuación, siga el mismo procedimiento que si estuviera arrancando desde un CD: reinicie el ordenador y elija arrancar desde la unidad USB o el disco duro en el menú de arranque del ordenador. De nuevo, puede que necesites consultar la documentación de tu BIOS para averiguar cómo arrancar un sistema operativo en tu ordenador desde el dispositivo deseado.
