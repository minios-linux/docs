---
title: Archivo de configuración
type: docs
weight: 1
---
# Archivo de configuración

MiniOS se diferencia de la mayoría de las distribuciones flash clásicas en que algunos parámetros pueden establecerse antes del arranque en un fichero de configuración bastante simple `minios/minios.conf`, lo que minimiza la cantidad de trabajo necesario a la hora de crear tus propios módulos para crear sistemas embebidos. Opcionalmente, algunos de los parámetros se pueden establecer en los parámetros de arranque.

<!--more-->
## Archivo de configuración de MiniOS

Las opciones de arranque tienen prioridad sobre el fichero de configuración. Algunos parámetros de este fichero son de servicio y es mejor no cambiarlos. A continuación se muestra un ejemplo de un archivo de configuración estándar:

```
USER_NAME="live"
USER_PASSWORD="evil"
ROOT_PASSWORD="toor"
HOST_NAME="minios"
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
SSH_KEY="authorized_keys"
CLOUD="false"
SCRIPTS="true"
HIDE_CREDENTIALS="false"
AUTOLOGIN="true"
SYSTEM_TYPE="puzzle"
CORE_BUNDLE_PREFIX="00-core"
BEXT="sb"
```

Algunas de estas opciones sólo pueden configurarse una vez, antes de la primera carga, si se utiliza el modo persistente. En modo persistente, sólo se pueden cambiar siempre los siguientes parámetros:

```
USER_PASSWORD
ROOT_PASSWORD
ENABLE_SERVICES
DISABLE_SERVICES
SSH_KEY
HIDE_CREDENTIALS
AUTOLOGIN
```

## Descripción de los parámetros

| Parámetro | Signficado | Ejemplo | Con qué initrd funciona |
| --------- | ------- | ------- | ----------------------- |
| USER\_NAME | El nombre del usuario cuyo perfil se creará en el primer arranque. Si especifica el nombre de usuario <strong>root</strong>, no se creará ningún perfil de usuario, el parámetro **USER\_PASSWORD** será ignorado, y el inicio de sesión se realizará utilizando el perfil <strong>root</strong>. | USER\_NAME=live<br>USER\_NAME=user<br>USER\_NAME=root | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| USER\_PASSWORD | La contraseña de un usuario principal en texto claro. La contraseña no debe incluir `'` , `\` , y otros caracteres que puedan ser malinterpretados por bash. | USER\_PASSWORD=evil<br>USER\_PASSWORD=PxKYJnLK8cv0E3Hd | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| ROOT\_PASSWORD | Contraseña del usuario privilegiado **root** en texto claro. La contraseña no debe incluir `'` , `\` , y otros caracteres que puedan ser malinterpretados por bash. | ROOT\_PASSWORD=toor<br>ROOT\_PASSWORD=9gVIlgGsZtpKPsE8 | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| HOST\_NAME | El nombre del nodo asociado al sistema. | HOST\_NAME=minios | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| DEFAULT\_TARGET | El objetivo de systemd. Puedes leer más sobre los objetivos de systemd [aquí](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/working-with-systemd-targets_configuring-basic-system-settings). | DEFAULT\_TARGET=graphical<br>DEFAULT\_TARGET=multi-user | <ul><li>MiniOS Live Kit</li></ul> |
| ENABLE\_SERVICES | Habilitar servicios en el arranque. | ENABLE\_SERVICES=ssh<br>ENABLE\_SERVICES=ssh,firewalld | <ul><li>MiniOS Live Kit</li></ul> |
| DISABLE\_SERVICES | Desactiva los servicios en el arranque. | DISABLE\_SERVICES=docker<br>DISABLE\_SERVICES=docker,firewalld,ssh | <ul><li>MiniOS Live Kit</li></ul> |
| SSH\_KEY | El nombre del archivo de clave pública SSH, que debe estar ubicado en la carpeta del sistema en el soporte (junto con los módulos principales .sb). Por defecto, el sistema busca un archivo llamado <strong>authorized\_keys</strong>.<br>Este fichero se copiará en `~/.ssh/authorized_keys` del usuario principal y del usuario root cuando arranque el sistema, y se puede utilizar para autorizarse con el uso de claves SSH. | SSH\_KEY=authorized\_keys<br>SSH\_KEY=my\_public\_key.pub | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| CLOUD | El parámetro de servicio, necesario para su uso con cloud-init, no se aplica a las versiones públicas de MiniOS. | CLOUD=false | <ul><li>MiniOS Live Kit</li></ul> |
| SCRIPTS | Ejecución de scripts de shell desde la carpeta minios/scripts, activada por defecto. Los scripts se ejecutan automáticamente en tty2 después de alcanzar multiusuario.target (init 3). | SCRIPTS=true | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| HIDE\_CREDENTIALS | Ocultar credenciales mostradas como tooltip en tty. Desactivado por defecto. | HIDE\_CREDENTIALS=false | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| AUTOLOGIN | Activar/desactivar el inicio de sesión automático. Activado por defecto. | AUTOLOGIN=true | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| SYSTEM\_TYPE | Seleccione el modo de funcionamiento del sistema. Si desea instalar software exclusivamente por módulos, debe utilizar "puzzle", si desea instalar software mediante apt, entonces "classic". La configuración por defecto es "puzzle". | SYSTEM\_TYPE=puzzle<br>SYSTEM\_TYPE=classic | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| CORE\_BUNDLE\_PREFIX | Un parámetro de servicio que indica a las utilidades del sistema el nombre del módulo con el sistema base. | CORE\_BUNDLE\_PREFIX=00-core | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| BEXT | Un parámetro de servicio que indica a las utilidades del sistema la extensión del nombre de archivo del módulo. | BEXT=sb | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |

***

## Importante!

* El servidor SSH está activado por defecto por compatibilidad con initrds de terceros, para desactivarlo, no sólo debe eliminarlo de `ENABLE_SERVICES`, sino también añadirlo a `DISABLE_SERVICES`.
* **Al arrancar por primera vez** en modo persistente, o si está utilizando el arranque limpio o el modo de arranque RAM, puede cambiar opcionalmente los parámetros `HOST_NAME` y `DEFAULT_TARGET`.
* Los parámetros `CLOUD`, `CORE_BUNDLE_PREFIX` y `BEXT` no se pueden cambiar, son de servicio y se utilizan en versiones no públicas no estándar de MiniOS (virtualización de la nube, disposición de módulos no estándar, etc.).
* Si utilizas un initrd que no sea el MiniOS Live Kit, algunas de las opciones no estarán disponibles, presta atención a la columna de la derecha.

¿Para qué más puede ser útil el archivo `minios.conf`? Puedes usarlo para establecer tus propios parámetros en tus scripts al crear módulos. En el primer arranque, se copia en la carpeta /etc/minios, entonces el archivo `/etc/minios/minios.conf` se monitoriza automáticamente y, cuando se realizan cambios, sobrescribe el archivo de configuración en la unidad flash, si es escribible. Así, puedes poner tus variables en minios.conf y obtenerlas de `/etc/minios/minios.conf` en tus scripts independientemente del tipo de initrd utilizado.
