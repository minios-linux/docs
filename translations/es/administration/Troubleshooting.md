# Solución de problemas

Comienza observando y realizando pruebas reversibles. No reparticiones, reformatees, repares un sistema de archivos, elimines una sesión ni sobrescribas archivos de arranque hasta que los datos importantes estén respaldados y el dispositivo con fallos haya sido identificado por modelo, tamaño, sistema de archivos y punto de montaje.

## Comprobaciones iniciales

1. Verifica el ISO descargado utilizando
   [Verificación de descargas](/installation/Verifying-Downloads.md).
2. Prueba un arranque limpio sin persistencia. Esto separa los problemas del sistema base y del hardware de una sesión dañada o incompatible.
3. Prueba otro puerto USB y, si es posible, otro dispositivo que funcione correctamente.
4. Anota la entrada exacta del menú de arranque, cualquier parámetro añadido y el primer error, no solo el fallo final.
5. Consulta la [Compatibilidad de hardware](/installation/Hardware-Compatibility.md) y la guía de la herramienta utilizada para grabar el dispositivo.

## Problemas de arranque

Si el dispositivo no aparece en el menú de arranque del firmware, verifica si fue grabado para UEFI, BIOS heredado o ambos. Desactiva temporalmente el arranque rápido del firmware, prueba el menú de arranque único del firmware y prueba otro puerto antes de volver a grabar el dispositivo. No cambies la tabla de particiones del disco interno para diagnosticar un problema de arranque USB.

Si aparece el menú de arranque de MiniOS pero el inicio falla:

- Arranca una sesión limpia sin `perch`, `perchdir` o `perchmode`.
- Elimina parámetros opcionales y filtros de módulos.
- Confirma que el ISO y el medio grabado no estén corruptos.
- Captura el error completo. Los parámetros `debug` y `timing` agregan salida del arranque;
  `rd.break` abre una shell de initramfs para diagnóstico avanzado.
- Si no se puede encontrar la información de MiniOS, verifica el valor de `from` y la ruta del dispositivo en
  [Parámetros de arranque](/configuration/Boot-Parameters.md).

Para el arranque por PXE o ISO HTTP, utiliza la guía específica de
[Arranque por red](/installation/Network-Boot.md). La red en el arranque temprano es
independiente de NetworkManager en la sesión en ejecución.

## Problemas de pantalla

Para pantalla negra, resolución ilegible o bucle en el gestor de pantalla:

1. Prueba el parámetro de arranque `text`. Si inicia una consola, el sistema base arrancó y el fallo probablemente está en los gráficos, X11 o el gestor de pantalla.
2. Elimina un parámetro `xorg-driver` o `xorg-resolution` especificado manualmente.
3. Prueba una sesión limpia para descartar una configuración de pantalla persistente.
4. Anota la GPU y el controlador cargado con `lspci -nnk`.
5. Revisa los errores del arranque actual con `journalctl -b -p warning` y
   `dmesg --level=err,warn`.

Los controles de resolución en máquinas virtuales documentados como `virtres` y `novirtres`
aplican solo al entorno Xfce. Consulta
[Virtualización](/administration/Virtualization.md) para la configuración específica de invitados.

## Problemas de red

Verifica si la interfaz existe antes de cambiar la configuración:

```bash
ip link
ip address
ip route
```

Para la sesión normal en ejecución, revisa NetworkManager si está presente:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Si no aparece ninguna interfaz, anota la salida de `lspci -nnk` o `lsusb` y revisa si falta firmware en `dmesg`.
- Si la interfaz existe pero no tiene dirección, prueba DHCP antes de ingresar valores estáticos.
- Si existe una dirección, prueba la puerta de enlace, luego una dirección IP y luego un nombre DNS para distinguir fallos de enlace, enrutamiento y DNS.
- El instalador configura DHCP por cable o IPv4 estático. Deja los perfiles Wi-Fi existentes sin cambios.
- El parámetro de arranque `ip=` configura la descarga PXE temprana, no la red de la sesión persistente. Consulta [Arranque por red](/installation/Network-Boot.md).

## Problemas de persistencia

Primero arranca sin persistencia y haz una copia completa del directorio `minios/changes`.
No ejecutes herramientas de reparación contra la única copia ni contra una sesión activa.

Verifica el estado de la sesión con:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Las causas comunes incluyen arrancar la entrada limpia, usar un método de grabación de ISO que nunca configuró la persistencia, espacio libre insuficiente, seleccionar una sesión de otra edición o versión, incompatibilidad de sistema de archivos y un apagado incorrecto. Consulta [Gestión de sesiones](/configuration/Session-Management.md).

Si MiniOS crea sesiones vacías repetidamente, no puede reanudar DynFileFS o informa errores de contenedor, sigue la guía [Recuperación de DynFileFS y dynblk](/configuration/DynFileFS-Recovery.md).
Esa guía comienza con una copia completa y comprobaciones en modo solo lectura. Las sesiones LUKS también requieren la contraseña correcta y un initrd con soporte de persistencia LUKS.

## Problemas de almacenamiento y espacio

Identifica los dispositivos y puntos de montaje sin modificarlos:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirma el modelo y tamaño del dispositivo antes de cualquier operación. Un sistema de archivos lleno puede causar fallos en actualizaciones, escrituras incompletas de sesión y recuperación en el arranque. Libera espacio moviendo o eliminando solo datos de usuario conocidos después de hacer una copia de seguridad; no elimines manualmente directorios de persistencia numerados mientras uno esté activo. Usa el Administrador de sesiones o `minios-session` para operaciones de sesión.

La reparación del sistema de archivos es un paso posterior. Desmonta primero el sistema de archivos, trabaja sobre una copia si es posible y utiliza la herramienta de comprobación específica del sistema de archivos. Nunca formatees un dispositivo como prueba de diagnóstico.

## Recopilar registros

Anota la edición y versión de MiniOS, el método de arranque, el modo de persistencia, el hardware y los pasos necesarios para reproducir el problema. Los comandos útiles incluyen:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Elimina contraseñas, claves privadas, credenciales inalámbricas, direcciones IP públicas y otros datos sensibles antes de compartir los registros. `journalctl -b -1` puede mostrar el arranque anterior cuando el journal es persistente.

Para fallos de arranque repetidos en medios MiniOS grabables, establece `EXPORT_LOGS=true` en el archivo de configuración. MiniOS copia sus registros de arranque a `minios/logs` cuando el medio es grabable. Consulta [Archivo de configuración](/configuration/Configuration-File.md).

Al reportar un fallo reproducible, adjunta los extractos relevantes y abre un issue en el [rastreador de problemas de MiniOS](https://github.com/minios-linux/minios-live/issues).
