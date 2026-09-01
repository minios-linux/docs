---
updated: 2026-08-31
---

# Solución de problemas

Comience con la observación y pruebas reversibles. No reparta, formatee, repare un sistema de archivos, elimine una sesión ni reemplace archivos de arranque solo para ver si ayuda. Primero, preserve los datos importantes.

## Primeras comprobaciones

1. [Verifique la imagen descargada](/installing-minios/Verifying-Downloads).
2. Arranque con **Iniciar sin guardar**. Si el problema desaparece, investigue la sesión persistente o su configuración en lugar de la imagen base.
3. Elimine los parámetros de arranque personalizados y los filtros de módulos a menos que sean necesarios para reproducir el problema.
4. Pruebe con otro puerto USB y, cuando sea posible, con otro dispositivo o computadora que se sepa que funciona correctamente.
5. Registre el primer error y la entrada exacta del menú de arranque, no solo el último mensaje mostrado en pantalla.
6. Revise la [Compatibilidad de hardware](/getting-started/Hardware-Compatibility) cuando la misma imagen verificada falla en una máquina pero funciona en otra.

## El dispositivo no accede al menú de arranque de MiniOS

Primero, determine cómo se creó el dispositivo MiniOS.

- Para una imagen grabada directamente (`dd`, Etcher, modo DD de Rufus o escritura de imagen con Utilidad de disco), no repare archivos de arranque individuales. Si la copia está dañada, vuelva a grabar el dispositivo completo desde una imagen verificada.
- Para una instalación basada en archivos de MiniOS, recree la estructura de arranque utilizando el mismo método de instalación documentado, en lugar de copiar archivos GRUB, Syslinux o EFI de otra versión.
- Ventoy tiene su propio gestor de arranque y estructura. No instale el gestor de arranque de MiniOS sobre un dispositivo Ventoy; utilice en su lugar el procedimiento [Ventoy](/installing-minios/installation-tools/Ventoy).
- Tras la conversión nativa, el destino utiliza un gestor de arranque y una estructura de archivos convencional de Debian. Puede mantener la apariencia de escritorio de MiniOS, pero la infraestructura live de MiniOS y las herramientas específicas de live ya no están presentes. Realice una copia de seguridad de los datos recuperables antes de usar el procedimiento de reparación o reinstalación del gestor de arranque de Debian adecuado para su BIOS/UEFI y esquema de particiones.

Si un dispositivo recién recreado aún no aparece en el menú de arranque del firmware, verifique el modo de firmware, el soporte de Secure Boot para la arquitectura seleccionada, el puerto/dispositivo USB y la [compatibilidad de hardware](/getting-started/Hardware-Compatibility).

## El menú de arranque de MiniOS aparece pero el inicio falla

Elimine primero los parámetros opcionales. Use `debug` y `timing` cuando se necesite más salida temprana de arranque. `rd.break` es para inspección avanzada de initramfs, no para reparación.

Si MiniOS no puede encontrar su origen, consulte [Descubrimiento del sistema](/reference/boot-process/System-Discovery). En una shell de initramfs, la información útil de solo lectura incluye:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporal puede ayudar a identificar el dispositivo que realmente contiene los datos de MiniOS. Después de eso, utilice la sintaxis documentada de `from=` en lugar de adivinar nombres de dispositivos.

Para arranque por PXE o ISO HTTP, consulte [Arranque en red](/reference/boot-process/Network-Boot). La red en el arranque temprano es independiente de NetworkManager en la sesión en ejecución.

### Fallos de módulos o root-union

Consulte [Carga de módulos](/reference/boot-process/Module-Loading) para conocer las reglas reales de selección y orden de módulos. En particular:

- `load=` y `noload=` pueden excluir módulos esenciales base o del kernel; `noload=` prevalece cuando ambos coinciden;
- los candidatos con el mismo nombre base ocupan la misma ranura de reemplazo;
- un nombre de archivo `.sb` no prueba que el archivo sea una imagen válida de SquashFS;
- el kernel en ejecución debe coincidir con el módulo del kernel coordinado de MiniOS y los archivos de arranque.

Después de un arranque exitoso, inspeccione el estado real sin modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemas de pantalla

Para pantalla en negro, resolución inutilizable o bucle del gestor de pantalla:

1. Pruebe el parámetro de arranque `text`. Una consola funcional separa un problema de gráficos/escritorio de un fallo anterior de arranque.
2. Elimine los parámetros `xorg-driver` o `xorg-resolution` especificados manualmente.
3. Pruebe **Iniciar sin guardar** para descartar la configuración persistente de pantalla.
4. Registre la GPU y el controlador con `lspci -nnk`.
5. Inspeccione `journalctl -b -p warning` y `dmesg --level=err,warn`.

Para máquinas virtuales, consulte [Virtualización](/maintenance-and-recovery/Virtualization).

## Problemas de red

Las conexiones normales por cable y Wi-Fi se gestionan a través de NetworkManager; consulte [Redes](/using-minios/Networking).

Primero determine si la interfaz existe:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si no existe ninguna interfaz, registre `lspci -nnk` o `lsusb` y busque errores de firmware o del controlador en `dmesg`.
- Si la interfaz existe pero no tiene dirección, distinga entre problemas de conexión/DHCP y falta de soporte de hardware.
- Si existe una dirección, pruebe la puerta de enlace, luego una dirección IP y después un nombre DNS para separar fallos de enlace, enrutamiento y DNS.
- El parámetro de arranque `ip=` pertenece al arranque de red temprano y no configura una conexión persistente de NetworkManager. Consulte [Arranque en red](/reference/boot-process/Network-Boot).

## Problemas de persistencia

Arranque con **Iniciar sin guardar** antes de modificar un almacén de persistencia sospechoso. No repare ni elimine la única copia de una sesión mientras esté activa.

Inspeccione lo que MiniOS ve actualmente:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Verifique el modo de arranque seleccionado, el espacio disponible para escritura, la compatibilidad del sistema de archivos y la compatibilidad de la sesión. Las reglas detalladas de selección están en [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) y [Internals de persistencia](/reference/boot-process/Persistence-Internals).

Si una sesión importante no activa `native`, `dynfilefs`, `raw` o `luks` aún es legible, expórtela **antes** de experimentar con el almacenamiento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager no puede leer ni exportar la sesión, deje de escribir en el origen y preserve una copia offline del almacenamiento afectado antes de continuar. MiniOS no define un procedimiento manual universal para reconstruir segmentos DynFileFS, reparar un sistema de archivos interno o reconstruir metadatos de sesión. Dicha recuperación depende del sistema de archivos/contenedor y solo debe intentarse sobre una copia cuando el valor de los datos lo justifique.

Consulte [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para flujos de trabajo de copia de seguridad e importación de sesiones compatibles.

## Problemas de almacenamiento y espacio libre

Inspecciona los dispositivos y puntos de montaje sin modificarlos:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un sistema de archivos lleno puede causar fallos en operaciones de paquetes, guardados de sesión incompletos y otros errores secundarios. Libera espacio moviendo o eliminando datos conocidos solo después de confirmar el sistema de archivos correcto. Utiliza el Gestor de sesiones de MiniOS para eliminar sesiones en lugar de borrar manualmente los directorios de sesiones numerados.

La reparación del sistema de archivos no es una operación genérica de MiniOS. Si el propio sistema de archivos está dañado, desmóntalo, primero preserva los datos importantes o una imagen, y utiliza un procedimiento de reparación adecuado para ese sistema de archivos y dispositivo de almacenamiento.

## Cambios de paquetes y actualizaciones del sistema

Si los problemas comenzaron después de cambios de paquetes APT, recuerde que una sesión persistente en vivo puede sobrescribir archivos de los módulos de solo lectura MiniOS. Pruebe **Iniciar sin guardar** para comparar con el conjunto original de módulos. Consulte [Actualización de MiniOS](/maintenance-and-recovery/Updating-MiniOS) para la diferencia entre el mantenimiento de APT y el cambio de versiones de MiniOS.

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

Para fallos de arranque repetidos en medios grabables MiniOS, `EXPORT_LOGS=true` en `config.conf` exporta los registros de arranque bajo `minios/log/`. Consulte [config.conf](/reference/configuration/config.conf).

Elimine credenciales, claves privadas, contraseñas Wi-Fi y otra información privada antes de compartir los registros. Para un defecto reproducible, incluya los extractos relevantes y abra un informe en el [issue tracker de MiniOS](https://github.com/minios-linux/minios-live/issues).
