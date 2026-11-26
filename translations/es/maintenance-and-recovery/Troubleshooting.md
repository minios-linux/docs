---
updated: 2026-10-15
---

# Solución de problemas

Comience observando y realizando pruebas reversibles. No vuelva a particionar, formatear, reparar un sistema de archivos, eliminar una sesión ni reemplace archivos de arranque solo para ver si ayuda. Primero, asegure la copia de seguridad de los datos importantes.

## Primeras comprobaciones

1. [Verifique la imagen descargada](/installing-minios/Verifying-Downloads).
2. Inicie **Iniciar sin guardar**. Si el problema desaparece, investigue la sesión persistente o su configuración en lugar de la imagen base.
3. Elimine parámetros de arranque personalizados y filtros de módulos a menos que sean necesarios para reproducir el problema.
4. Pruebe con otro puerto USB y, si es posible, con otro dispositivo o equipo que funcione correctamente.
5. Registre el primer error y la entrada exacta del menú de arranque, no solo el último mensaje mostrado en pantalla.
6. Compruebe la [compatibilidad de hardware](/getting-started/Hardware-Compatibility) cuando la misma imagen verificada falla en una máquina pero funciona en otra.

## El dispositivo no llega al menú de arranque de MiniOS

Primero determine cómo se creó el dispositivo MiniOS.

- Para una imagen grabada en bruto (`dd`, Etcher, modo DD de Rufus, o escritura de imagen con Utilidad de disco), no repare archivos de arranque individuales. Si la copia está dañada, vuelva a escribir el dispositivo completo desde una imagen verificada.
- Para una instalación basada en archivos MiniOS, vuelva a crear la estructura de arranque usando el mismo método de instalación documentado en vez de copiar archivos GRUB, Syslinux o EFI de otra versión.
- Ventoy tiene su propio gestor de arranque y estructura. No instale el gestor de arranque MiniOS sobre un dispositivo Ventoy; utilice el procedimiento de [Ventoy](/installing-minios/installation-tools/Ventoy) en su lugar.
- Tras la conversión nativa, el destino utiliza un gestor de arranque y estructura de archivos convencional de Debian. Puede conservar la apariencia de escritorio de MiniOS, pero la infraestructura live de MiniOS y sus herramientas específicas ya no estarán presentes. Realice una copia de seguridad de los datos recuperables antes de usar el procedimiento de reparación o reinstalación del gestor de arranque de Debian adecuado para su BIOS/UEFI y esquema de particiones.

Si un dispositivo recién creado sigue sin aparecer en el menú de arranque del firmware, revise el modo de firmware, el soporte de Secure Boot para la arquitectura seleccionada, el puerto/dispositivo USB y la [compatibilidad de hardware](/getting-started/Hardware-Compatibility).

## El menú de arranque de MiniOS aparece pero el inicio falla

Primero elimine los parámetros opcionales. Use `debug` y `timing` cuando se necesite más información temprana del arranque. `rd.break` es para inspección avanzada de initramfs, no para reparación.

Si MiniOS no puede encontrar su origen, consulte [Detección del sistema](/reference/boot-process/System-Discovery). En una shell de initramfs, la información útil de solo lectura incluye:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporal puede ayudar a identificar el dispositivo que realmente contiene los datos de MiniOS. Después de eso, utilice la sintaxis documentada de `from=` en vez de adivinar nombres de dispositivos.

Para arranque PXE o ISO por HTTP, consulte [Arranque en red](/reference/boot-process/Network-Boot). La red en el arranque temprano es independiente de NetworkManager en la sesión en ejecución.

### Fallos de módulos o de unión raíz (root-union)

Consulte [Carga de módulos](/reference/boot-process/Module-Loading) para conocer las reglas reales de selección y orden de los módulos. En particular:

- `load=` y `noload=` pueden excluir módulos base o del kernel esenciales; `noload=` gana cuando ambos coinciden;
- los candidatos con el mismo nombre base ocupan la misma ranura de reemplazo;
- un archivo `.sb` no prueba que el archivo sea una imagen válida de SquashFS;
- el kernel en ejecución debe coincidir con el módulo de kernel y los archivos de arranque coordinados de MiniOS.

Tras un arranque exitoso, inspeccione el estado real sin modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemas de pantalla

Si tienes pantalla negra, resolución inutilizable o un bucle en el gestor de pantalla:

1. Prueba el parámetro de arranque `text`. Una consola funcional permite distinguir entre un problema gráfico/de escritorio y un fallo anterior al arranque.
2. Elimina los parámetros especificados manualmente `xorg-driver` o `xorg-resolution`.
3. Prueba **Iniciar sin guardar** para descartar una configuración de pantalla persistente.
4. Registra la GPU y el controlador con `lspci -nnk`.
5. Revisa `journalctl -b -p warning` y `dmesg --level=err,warn`.

Para máquinas virtuales, consulta [Virtualización](/maintenance-and-recovery/Virtualization).

En las imágenes de Debian 13 / Devuan Excalibur XFCE, **Configuración de pantalla** incluye un control de **Escala de la interfaz** con porcentajes automáticos y manuales. Automático sigue la pantalla principal; un porcentaje explícito guardado lo reemplaza. Utiliza la vista previa temporizada y la confirmación en lugar de tratar la resolución de salida y la escala de la interfaz como el mismo ajuste. Los efectos de ventana y el renderizador se configuran por separado en **Ajustes del gestor de ventanas → Compositor**. `xfwm4-gl` utiliza XRender si no se puede usar OpenGL; el desenfoque y Magic Lamp requieren OpenGL, mientras que las animaciones de desvanecimiento/escalado y Peek también funcionan con XRender.

## Problemas de red

Las conexiones normales por cable y Wi-Fi se gestionan mediante NetworkManager; consulte [Redes](/using-minios/Networking).

Primero determine si la interfaz existe:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si no existe ninguna interfaz, registre `lspci -nnk` o `lsusb` y busque errores de firmware o controlador en `dmesg`.
- Si la interfaz existe pero no tiene dirección, distinga entre problemas de conexión/DHCP y falta de soporte de hardware.
- Si existe una dirección, pruebe la puerta de enlace, luego una dirección IP y después un nombre DNS para separar fallos de enlace, enrutamiento y DNS.
- El parámetro de arranque `ip=` corresponde al arranque temprano en red y no configura una conexión persistente de NetworkManager. Consulte [Arranque en red](/reference/boot-process/Network-Boot).

## Problemas de persistencia

Inicia el sistema **Iniciar sin guardar** antes de cambiar un almacén de persistencia sospechoso. No repares ni elimines la única copia de una sesión mientras esté activa.

Comprueba qué detecta actualmente MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Comprueba el modo de arranque seleccionado, el espacio disponible para escritura, la compatibilidad del sistema de archivos y la compatibilidad de la sesión. Las reglas detalladas de selección se encuentran en [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) y [Detalles internos de la persistencia](/reference/boot-process/Persistence-Internals).

Si una sesión importante que no está en ejecución de `native`, `dynfilefs`, `dynblk`, `vmdk`, o `raw` sesión sigue siendo legible, incluso si está cifrada pero se puede desbloquear, expórtala **antes** de experimentar con el almacenamiento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager no puede leer ni exportar la sesión, deja de escribir en el origen y conserva una copia sin conexión del almacenamiento afectado antes de seguir trabajando. Para una sesión DynBlk separada, `dynblk inspect /path/to/volume000.db --metadata-only` y `dynblk check /path/to/volume000.db` proporcionan diagnósticos de formato de solo lectura; no los ejecutes en un volumen que siga conectado. MiniOS no define un procedimiento manual universal para reconstruir segmentos DynFileFS, reconstruir partes de respaldo de DynBlk, reparar un sistema de archivos interno ni reconstruir los metadatos de sesión. Estos métodos de recuperación dependen del sistema de archivos o del contenedor y solo deben intentarse en una copia cuando el valor de los datos lo justifique.

Si se creó un volumen DynFileFS de formato 400 o 500 con una división de número impar de MiB, el entorno de ejecución actual se niega a montarlo y deja el origen sin cambios. Para recuperar los archivos, usa un entorno antiguo compatible con una copia separada del contenedor completo e importa los archivos exportados en un almacenamiento nuevo. Si un medio de arranque antiguo dejó de reconocer un volumen convertido, usa un initrd de arranque MiniOS que admita el formato 600 actual.

Consulta [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para ver los flujos de trabajo compatibles de copia de seguridad e importación de sesiones.

### Ventoy Persistence Plugin

Si Session Manager informa que no está disponible con el complemento de persistencia Ventoy, esto corresponde al modelo de imagen única esperado y no a la falta de metadatos de sesión. Selecciona otro backend en Ventoy o inicia sin una imagen de complemento seleccionada para utilizar sesiones numeradas MiniOS. Si el backend no está disponible o no es ext4, si hay un formato de unión registrado diferente, o si falla la activación en modo escritura, MiniOS mostrará una advertencia y continuará en RAM. Revisa `/run/initramfs/minios-persistence/boot-state` los avisos de inicio; no crees `session.conf` manualmente dentro de la imagen del complemento. Consulta [Ventoy](/installing-minios/installation-tools/Ventoy).

## Problemas de almacenamiento y espacio libre

Inspecciona los dispositivos y puntos de montaje sin modificarlos:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un sistema de archivos lleno puede provocar fallos en operaciones de paquetes, guardados de sesión incompletos y otros errores secundarios. Libera espacio moviendo o eliminando solo datos conocidos, y solo después de confirmar el sistema de archivos correcto. Utiliza el Gestor de sesiones de MiniOS para eliminar sesiones en lugar de borrar manualmente los directorios de sesiones numerados.

Si `LIVE_APT_CACHE=volatile`, revisa también `findmnt -T /var/cache/apt/archives` y `df -h /var/cache/apt/archives`: la zona de archivos es un sistema de archivos RAM limitado y una descarga grande puede llenarla incluso si el dispositivo USB tiene espacio libre. Con `LIVE_LOG_STORAGE=volatile`, el `/var/log` ordinario tiene un límite independiente de 32 MiB en RAM. Llenar cualquiera de estas áreas no hace que MiniOS cambie automáticamente a escribir esos archivos en el dispositivo USB. Consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

La reparación del sistema de archivos no es una operación genérica de MiniOS. Si el propio sistema de archivos está dañado, desmóntalo, guarda primero los datos importantes o una imagen, y utiliza un procedimiento de reparación adecuado para ese sistema de archivos y dispositivo de almacenamiento.

## Cambios de paquetes y actualizaciones del sistema

Si los problemas comenzaron después de cambios en paquetes APT, recuerda que una sesión persistente en vivo puede sobrescribir archivos de los módulos de solo lectura MiniOS. Prueba **Iniciar sin guardar** para comparar con el conjunto original de módulos. Consulta [Actualización de MiniOS](/maintenance-and-recovery/Updating-MiniOS) para conocer la diferencia entre el mantenimiento con APT y el cambio de versiones de MiniOS.

<a id="collecting-logs"></a>

## Recopilación de registros

La información útil incluye:

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

Para fallos repetidos de arranque en medios MiniOS con permisos de escritura, `EXPORT_LOGS=true` en `config.conf` exporta los registros de arranque en `minios/log/`. Consulta [config.conf](/reference/configuration/config.conf).

En una sesión duradera y saludable de `perch`, los dos registros obligatorios de inicio ya se conservan independientemente de `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Las versiones `.1`, `.2` y `.3` corresponden a arranques anteriores. El montaje estándar de `/var/log` puede `tmpfs` mientras que `/var/log/minios` y `/var/log/live` permanecen en el almacenamiento persistente. Para SquashFS, estos registros también se encuentran en `minios/changes/<session-id>/boot-logs/`, fuera de `changes.sb`; se conservan incluso si falla la instantánea de apagado. Una activación fallida o no duradera de `perch` no garantiza un destino persistente para los registros. Con `LIVE_LOG_STORAGE=volatile`, `journalctl -b` y otros registros habituales están disponibles solo para el **arranque actual**. Activa los seguimientos detallados de `minios-update-*` usando `LIVE_CONFIG_DEBUG=true` solo cuando sea necesario; los errores normales se informan igualmente sin ello.

Elimina credenciales, claves privadas, contraseñas Wi-Fi y cualquier otra información confidencial antes de compartir los registros. Si el defecto es reproducible, incluye los extractos relevantes y abre un reporte en el [seguimiento de incidencias de MiniOS](https://github.com/minios-linux/minios-live/issues).

### Las sesiones VMDK no están disponibles

Actualiza el controlador/CLI DynBlk y las herramientas de sesión al mismo tiempo, luego vuelve a generar el
initrd de arranque. El initrd en ejecución debe anunciar `vmdk-session-v1`; el instalador también
verifica cada initrd de origen que va a copiar. El antiguo marcador vacío DynBlk solo
indica soporte nativo de bloques y no garantiza compatibilidad con arranque de sesiones VMDK.
No cambies manualmente el modo de una sesión existente: utiliza una copia explícita o
conversión al otro formato.

### Liberar espacio en sesiones de DynFileFS, DynBlk o VMDK

Usa la opción del menú contextual de Session Manager **Liberar espacio...**, o
`minios-session reclaim ID --json`. En las sesiones de texto sin formato, esta opción recorta el
ext4 interno real y, a continuación, solicita al backend propietario que recupere espacio de almacenamiento sin
mover datos activos. Las instantáneas de DynFileFS pueden mantener asignados los bloques eliminados; la operación no elimina instantáneas.
En sistemas de archivos como exFAT, los espacios intermedios pueden seguir asignados al archivo del host,
pero el contenedor puede reutilizarlos; `--compact` es una opción manual independiente que puede
reubicar datos activos y escribir más en el dispositivo flash. Ninguna opción activa automáticamente
la compactación ni la instrucción de descarte de LUKS. Una sesión cifrada solo puede recuperar el
espacio que el backend subyacente ya reconoce mediante este comando.
