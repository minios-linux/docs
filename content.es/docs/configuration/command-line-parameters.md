---
title: Parámetros de línea de comando
type: docs
weight: 2
---

# Parámetros de línea de comando

Los parámetros de arranque (también conocidos como cheatcodes) se utilizan para afectar al proceso de arranque de MiniOS. Algunos de ellos son comunes para todos los Linux, otros son específicos sólo para MiniOS. Puedes usarlos para desactivar el tipo de detección de hardware que desees, para arrancar MiniOS desde el disco duro, etc.

<!--more-->
 Para usar cheatcodes con syslinux, pulsa la tecla `Esc` para activar el menú de arranque durante el arranque de MiniOS como de costumbre, y cuando veas el menú de arranque, pulsa `Tab`, edita los parámetros de arranque, luego pulsa Enter. Para grub, pulsa `E` para editar, luego `F10` para arrancar. Aparecerá una línea de comandos en la parte inferior de la pantalla, que puedes editar o añadir nuevos parámetros de arranque al final. Algunas opciones de grub no pueden cambiarse interactivamente. Para cambiarlas, edita `boot/grub/grub.cfg`.

| Cheatcode | Significado | Ejemplo |
| --------- | ------- | ------- |
| from= | Carga los datos de MiniOS desde el directorio especificado o incluso desde un archivo ISO. | from=/minios/ |
|  |  | from=/Downloads/minios.iso |
|  |  | from=http://domain.com/minios.iso |
| noload= | Desactivar la carga de determinados módulos .sb especificados como expresión regular. | noload=04-xfce-apps |
|  |  | noload=xfce-apps,browser |
|  |  | noload=04,05 |
| nosound | Silencia el sonido al arrancar. | nosound |
| toram | Activar la función Copiar a RAM. | minios.flags=toram |
| perch | Activar la función de cambios persistentes. | minios.flags=toram,perch |
| text | Desactivar el inicio de X y permanecer sólo en modo texto de la consola. | text |
| debug | Habilita la depuración de inicio de MiniOS. | debug |
| root\_password= | Contraseña Root. | root\_password=toor |
| user\_name= | Nombre de usuario. Si especifica el nombre de usuario <strong>root</strong>, entonces no se creará el perfil de usuario, El parámetro **user\_password** será ignorado. | user\_name=live |
| user\_password= | Contraseña de usuario. | user\_password=evil |
| host\_name= | Nombre de host del sistema | host\_name=minios |
| default\_target= | Objetivo de systemd. Puede leer más sobre los objetivos de systemd [aquí](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/working-with-systemd-targets_configuring-basic-system-settings). | default\_target=graphical |
|  |  | default\_target=multi-user |
|  |  | default\_target=emergency |
| enable\_services= | Activar servicios en el arranque. | enable\_services=ssh,firewalld |
| disable\_services= | Desactivar servicios en el arranque. | disable\_services=docker |
| ssh\_key= | El nombre del archivo de clave pública ssh, que debe estar ubicado en la carpeta del sistema en el soporte (junto con los módulos principales .sb). Por defecto, el sistema busca un archivo llamado <strong>authorized\_keys</strong>. | ssh\_key=my\_public\_keys |
| scripts= | Los scripts se ejecutan cuando se alcanza el objetivo multiusuario (init 3). Para ejecutar scripts, deben estar ubicados en la carpeta minios/scripts. La variable scripts puede establecerse como interactiva, background o false. Por defecto, cuando los scripts se encuentran en la carpeta especificada, el sistema sólo arranca hasta el objetivo multiusuario, después de lo cual ejecuta interactivamente los scripts en orden alfabético. Con scripts=background, el sistema arranca como de costumbre, los scripts se ejecutan en segundo plano. Con scripts=false, los scripts no se cargan, aunque se encuentren en la carpeta scripts. | scripts=interactive |
|  |  | scripts=background |
|  |  | scripts=false |
| cloud | Modo especial para funcionar como host cloud-init. | cloud |
| hide\_credentials | Ocultar las credenciales mostradas como prompt en la consola al iniciar el sistema. | hide\_credentials |
| autologin= | Activar/desactivar el inicio de sesión automático. Activado por defecto. | autologin=true<br>autologin=false |
| changes\_size= | El tamaño máximo del archivo de almacenamiento dinámico. Por defecto es 4000 MB para compatibilidad con FAT32. | changes\_size=2000 |
| changes= | El nombre del archivo para guardar los cambios. Changes.dat por defecto. | changes=mychangesfile.img |

Separe los comandos por espacios. Vea las páginas del manual man bootparam para más cheatcodes comunes a todos los Linux.