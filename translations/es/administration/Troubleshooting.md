# Solución de problemas

Comience observando y realizando pruebas reversibles. No reparta, reformatee,
repáre un sistema de archivos, elimine una sesión ni sobrescriba archivos de arranque hasta que los datos importantes estén respaldados y se haya identificado el dispositivo con fallas por modelo, tamaño,
sistema de archivos y punto de montaje.

Utilice [Respaldo y recuperación](/administration/Backup-Recovery.md) antes de realizar acciones destructivas y [Recuperación de arranque](/administration/Boot-Recovery.md) cuando estén involucrados el firmware,
el gestor de arranque, el kernel o los archivos de arranque instalados.

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

### Fallos de origen en MiniOS

Consulta [Descubrimiento del sistema Initrd](/configuration/Initrd-System-Discovery.md) para conocer todas las reglas de precedencia y rutas de origen. Los detalles más útiles durante el diagnóstico son:

- Un `from=http://...` literal tiene prioridad sobre `ip=`; luego, `ip=` proporciona la dirección HTTP estática del ISO. De lo contrario, cualquier `ip=` no vacío selecciona PXE. Ninguna de las rutas de red recurre a medios locales.
- El descubrimiento local realiza 45 pasadas y prueba los nombres de los dispositivos de bloque en orden alfabético. Conserva el primer dispositivo que contiene una fuente válida, que no necesariamente es el dispositivo deseado ni un conjunto completo de módulos.
- `/dev/disk/by-label/LABEL/path` es compatible en `from=`. Este analizador no admite rutas UUID, PARTUUID ni by-id.
- La sintaxis exacta de ruta personalizada para el selector utiliza dos puntos, por ejemplo `from=askdisk:custom:dir`. La sintaxis con barra diagonal prueba silenciosamente la ruta predeterminada `minios` en su lugar.
- Si el descubrimiento entra en el shell fatal de initramfs, salir de él no repara la fuente ni proporciona una alternativa. Solo permite que el arranque continúe hacia un fallo posterior menos claro.

En un shell de initramfs, comienza con una inspección de solo lectura:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Registra el primer error de origen, montaje o descarga. No ejecutes herramientas de reparación de sistemas de archivos ni retires medios mientras estén montados.

### Fallos de módulos y raíz

Consulta [Carga de módulos Initrd](/configuration/Initrd-Module-Loading.md) para conocer las reglas de selección, orden y unión. Verifica primero estas causas comunes:

- `load=` y `noload=` son filtros de expresiones regulares. No existe un conjunto protegido de núcleo o kernel, por lo que un filtro puede excluir `00-core` o el módulo `01-kernel` del kernel en ejecución; `noload=` tiene prioridad cuando ambos filtros coinciden.
- Las rutas de los módulos se reducen a su nombre base. Dos candidatos con el mismo nombre base ocupan una sola ranura de reemplazo, por lo que un nivel de origen posterior puede reemplazar al candidato anterior en lugar de añadir otra capa.
- Un sufijo `.sb` no garantiza que un candidato sea una imagen SquashFS válida. Los fallos individuales de montaje de loop o módulo pueden permitir que el arranque continúe con una capa faltante. Registra el primer error de montaje.
- `toram=full` y `toram=trim` no verifican la RAM disponible previamente. Los fallos al copiar o desmontar pueden dejar la fuente original montada, así que no retires medios ni cierres una conexión HTTP solo porque se haya especificado `toram`.

Tras una transferencia exitosa, estos comandos permiten inspeccionar el estado sin modificarlo:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

Para la selección de capa escribible y fallos, consulta [Persistencia Initrd](/configuration/Initrd-Persistence.md). La persistencia puede recurrir a una capa superior temporal en RAM tras algunos fallos de activación, mientras que el fallo al construir la unión raíz lleva al shell fatal de initramfs.

## Problemas de pantalla

Para pantalla negra, resolución ilegible o bucle en el gestor de pantalla:

1. Prueba el parámetro de arranque `text`. Si inicia una consola, el sistema base arrancó y el fallo probablemente está en los gráficos, X11 o el gestor de pantalla.
2. Elimina un parámetro `xorg-driver` o `xorg-resolution` especificado manualmente.
3. Prueba una sesión nueva para descartar una configuración de pantalla persistente.
4. Registra la GPU y el controlador cargado con `lspci -nnk`.
5. Inspecciona los errores del arranque actual con `journalctl -b -p warning` y `dmesg --level=err,warn`.

Los controles de resolución en máquinas virtuales documentados como `virtres` y `novirtres` aplican solo al entorno Xfce. Consulta [Virtualización](/administration/Virtualization.md) para la configuración específica de invitados.

## Problemas de red

Para la configuración normal de red cableada y Wi-Fi, persistencia y comandos de NetworkManager, consulta [Configuración de red](/configuration/Network-Configuration.md).

Verifica si la interfaz existe antes de cambiar la configuración:

```bash
ip link
ip address
ip route
```

Para la sesión normal en ejecución, inspecciona NetworkManager si está presente:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Si no aparece ninguna interfaz, registra la salida de `lspci -nnk` o `lsusb` y comprueba si falta firmware en `dmesg`.
- Si la interfaz existe pero no tiene dirección, prueba DHCP antes de ingresar valores estáticos.
- Si existe una dirección, prueba la puerta de enlace, luego una dirección IP y luego un nombre DNS para distinguir entre fallos de enlace, enrutamiento y DNS.
- El instalador configura DHCP cableado o IPv4 estático. Deja los perfiles Wi-Fi existentes sin cambios.
- El parámetro de arranque `ip=` configura la descarga PXE temprana, no la red de la sesión persistente. Consulta [Arranque por red](/installation/Network-Boot.md).

## Problemas de persistencia

Arranca primero sin persistencia y haz una copia completa del directorio `minios/changes`. No ejecutes herramientas de reparación contra la única copia ni contra una sesión activa.

Verifica el estado de la sesión con:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Las causas comunes incluyen arrancar la entrada nueva, usar un método de escritura de ISO que nunca configuró la persistencia, espacio libre insuficiente, seleccionar una sesión de una edición o versión diferente, incompatibilidad de sistemas de archivos y un apagado incorrecto. Consulta [Gestión de sesiones](/configuration/Session-Management.md).

Si MiniOS crea sesiones vacías repetidamente, no puede reanudar DynFileFS o informa errores de contenedor, sigue la [Guía de recuperación de DynFileFS y dynblk](/configuration/DynFileFS-Recovery.md). Esa guía comienza con una copia completa y comprobaciones en solo lectura. Las sesiones LUKS también requieren la contraseña correcta y un initrd con soporte de persistencia LUKS.

## Problemas de almacenamiento y espacio

Identifica los dispositivos y puntos de montaje sin modificarlos:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirma el modelo y tamaño del dispositivo antes de cualquier operación. Un sistema de archivos lleno puede causar fallos en actualizaciones, escrituras incompletas de sesión y recuperación al arrancar. Libera espacio moviendo o eliminando solo datos de usuario conocidos y solo después de hacer una copia de seguridad; no elimines manualmente directorios de persistencia numerados mientras uno esté activo. Utiliza el Gestor de Sesiones o `minios-session` para operaciones de sesión.

La reparación del sistema de archivos es un paso posterior. Desmonta primero el sistema de archivos, trabaja sobre una copia cuando sea posible y utiliza la herramienta de comprobación específica del sistema de archivos. Nunca formatees un dispositivo como prueba de diagnóstico.

## Recopilar registros

Registra la edición y versión de MiniOS, el método de arranque, el modo de persistencia, el hardware y los pasos necesarios para reproducir el problema. Comandos útiles incluyen:

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

Para fallos de arranque repetidos en medios MiniOS escribibles, establece `EXPORT_LOGS=true` en el archivo de configuración. MiniOS copia sus registros de arranque a un directorio con sello de tiempo bajo `minios/log/` cuando el medio es escribible. Consulta [Archivo de configuración](/configuration/Configuration-File.md).

Al reportar un defecto reproducible, adjunta los extractos relevantes y abre un issue en el [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
