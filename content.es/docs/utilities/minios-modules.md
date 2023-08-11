---
title: minios-modules
type: docs
weight: 1
---

# minios-modules

La aplicación minios-modules está pensada para la creación de módulos por lotes. El principio de funcionamiento es similar al montaje de módulos al instalar el sistema en minios-live.
<!--more-->
## Crear un módulo sencillo
Para crear un módulo simple, necesitas crear una carpeta modules, en ella crea una carpeta con el nombre del módulo, por ejemplo:
`mkdir -p modules/10-gparted`
A continuación, debe crear el archivo `install`, dentro del cual se describen los comandos necesarios para instalar el programa:
```
#!/bin/bash

apt update
apt install -y gparted

```
A continuación, vuelve a la carpeta donde se encuentra la carpeta `modules` y ejecuta el comando build:
```
minios-modules build_modules
```
Este comando le dará un módulo llamado **10-gparted-amd64-zstd.sb**. Similarly, you can create folders and scripts to build other modules. El comando especificado los construirá secuencialmente en orden alfabético de carpetas en la carpeta de <strong>modules</strong>.

## Crear módulos complejos
**minios-modules** permite crear módulos aún más complejos. Además del archivo **install**, la carpeta de scripts del módulo puede contener archivos **build**, **preinstall**, **postinstall**, **is\_dkms\_build**, así como archivos **rootcopy- install**, **rootcopy-postinstall** y **patches**. El orden de ejecución de los scripts al ensamblar módulos es el siguiente:
1. preinstall - *realizar operaciones antes de la instalación, opcional*.
2. rootcopy-install - *los archivos se copian de esta carpeta a la raíz del sistema del futuro módulo antes de la instalación*.
3. install - *script de montaje del módulo principal*.
* *Una vez ejecutado el script de instalación, se inicia el proceso de limpieza automática de basura del futuro módulo*.
4. patches - <em> carpeta para copiar archivos a la carpeta **patches** en la raíz del módulo. Se copia sólo si el script de <strong>build</strong> está presente. Puedes poner parches en ella, lo que queda claro por el nombre, para aplicarlos a los códigos fuente del script.</em>
5. build - <em>Si planeas compilar programas, debes colocar todas las acciones en este script. Antes de ejecutar **build**, los archivos obtenidos durante la instalación se guardan automáticamente en el archivo squashfs y se descomprimen en la carpeta squashfs-root para que los paquetes necesarios para la compilación no entren en el módulo. Al final del script **build**, es necesario añadir operaciones para copiar los archivos compilados a la carpeta squashfs-root, y al final empaquetarlos en squashfs, ya que este paso no prevé el ensamblaje automático del módulo.</em>
6. rootcopy-postinstall - si la limpieza eliminó algo superfluo, puede devolverlo utilizando esta carpeta, o copiar algunos archivos que no pudieron ser añadidos al sistema antes de la instalación.
7. postinstall - *realizar acciones después de instalar el sistema. Por regla general, se trata de una limpieza adicional de escombros.*.

El <strong>is_dkms\_build</strong>. Se debe crear un archivo vacío con este nombre si se utiliza el script **build** para compilar módulos del kernel (*sí, ya sé que pueden no estar relacionados con dkms, pero históricamente se ha utilizado este nombre*), entonces sólo contenido de /usr/lib/modules.

Scripts de ejemplo para construir un módulo usando **build** con la carpeta <strong>patches</strong>: https://github.com/minios-linux/minios-live/tree/master/linux-live/scripts/04-flux-desktop

Scripts de ejemplo para construir un módulo utilizando **build** y <strong>is\_dkms\_build</strong>: https://github.com/minios-linux/minios-live/tree/master/linux-live/scripts/10-virtualbox-6.1

Debido al hecho de que el nombre del usuario principal en MiniOS es dinámico y puede ser cualquier cosa (ver ...), cuando se construye un módulo que añade un grupo al sistema, que luego tendrá que ser asignado al usuario principal (por ejemplo,
vboxusers para el módulo virtualbox) para que pueda ejecutar el programa sin derechos de root, necesitas crear un servicio systemd. Este servicio añadirá el usuario principal al grupo requerido, si no fue añadido antes, al inicio del sistema. Por ejemplo:
```
APP="virtual box"
APP_NAME="VirtualBox"
APP_GROUP="vboxusers"

cat <<EOF >/usr/bin/$APP-allowuser.sh
#!/bin/bash
if ! grep $APP_GROUP /etc/group | grep \$(id -nu 1000) >/dev/null; then
     usermod -a -G $APP_GROUP \$(id -nu 1000)
fi
EOF
chmod +x /usr/bin/$APP-allowuser.sh
cat <<EOF >/usr/lib/systemd/system/$APP-allowuser.service
[unit]
Description=Allow user to use $APP_NAME
#After=network.target
[Service]
Type=oneshot
ExecStart=/usr/bin/$APP-allowuser.sh
RemainAfterExit=true
ExecStop=
StandardOutput=journal
[Install]
WantedBy=multi-user.target
EOF
systemctl enable $APP-allowuser.service
```
Script completo: https://github.com/minios-linux/minios-live/blob/master/linux-live/scripts/10-virtualbox-6.1/install