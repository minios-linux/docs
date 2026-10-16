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

Inicie **Iniciar sin guardar** antes de modificar un almacén de persistencia sospechoso. No repare ni elimine la única copia de una sesión mientras esté activa.

Inspeccione lo que MiniOS ve actualmente:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Verifique el modo de arranque seleccionado, el espacio disponible para escritura, la compatibilidad del sistema de archivos y la compatibilidad de la sesión. Las reglas detalladas de selección se encuentran en [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) y [Internos de persistencia](/reference/boot-process/Persistence-Internals).

Si una sesión importante que no está en ejecución `native`, `dynfilefs`, `dynblk`, `vmdk`, o `raw` sigue siendo legible, incluso en forma cifrada que pueda desbloquearse, expórtela **antes** de experimentar con el almacenamiento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager no puede leer ni exportar la sesión, deje de escribir en el origen y conserve una copia offline del almacenamiento afectado antes de continuar. Para una sesión DynBlk separada, `dynblk inspect /path/to/volume000.db --metadata-only` y `dynblk check /path/to/volume000.db` ofrecen diagnósticos de formato de solo lectura; no los ejecute sobre un volumen que siga conectado. MiniOS no define un procedimiento manual universal para reconstruir segmentos de DynFileFS, reconstruir partes de respaldo de DynBlk, reparar un sistema de archivos interno ni reconstruir metadatos de sesión. Esta recuperación depende del sistema de archivos o contenedor y solo debe intentarse sobre una copia si el valor de los datos lo justifica.

Consulte [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para flujos de trabajo de copia de seguridad e importación de sesiones compatibles.

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

### Liberar espacio en DynFileFS, DynBlk o sesiones VMDK

Utiliza el menú contextual del Administrador de Sesiones **Liberar espacio...**, o
`minios-session reclaim ID --json`. Para sesiones en texto plano, esto recorta el
sistema de archivos ext4 interno real y luego solicita al backend propietario que recupere el almacenamiento sin
mover datos en uso. DynFileFS requiere la versión 4.6.0 o posterior para esta operación.
En sistemas de archivos como exFAT, pueden quedar huecos internos asignados al archivo anfitrión
pero reutilizables por el contenedor; `--compact` es una opción manual aparte que puede
reubicar datos activos y escribir más en el dispositivo flash. Ninguna opción activa
la compactación ni el descarte LUKS automáticamente. Una sesión cifrada solo puede recuperar
el espacio que el backend subyacente ya reconoce mediante este comando.
