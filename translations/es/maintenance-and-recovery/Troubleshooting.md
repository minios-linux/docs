---
updated: 2026-09-13
---

# Solución de problemas

Comience observando y realizando pruebas reversibles. No vuelva a particionar, formatear, reparar un sistema de archivos, eliminar una sesión ni reemplazar archivos de arranque solo para comprobar si eso soluciona el problema. Primero, asegúrese de resguardar los datos importantes.

## Primeras comprobaciones

1. [Verificar la imagen descargada](/installing-minios/Verifying-Downloads).
2. Iniciar **Arrancar sin guardar cambios**. Si el problema desaparece, revisa la sesión persistente o su configuración en lugar de la imagen base.
3. Elimina los parámetros de arranque personalizados y los filtros de módulos, a menos que sean necesarios para reproducir el problema.
4. Prueba con otro puerto USB y, si es posible, con otro dispositivo o equipo que funcione correctamente.
5. Registra el primer error y la entrada exacta del menú de arranque, en lugar de solo el último mensaje mostrado en pantalla.
6. Comprueba [compatibilidad de hardware](/getting-started/Hardware-Compatibility) cuando la misma imagen verificada falla en un equipo pero funciona en otro.

## El dispositivo no accede al menú de arranque de MiniOS

Primero determina cómo se creó el dispositivo MiniOS.

- Para una imagen grabada de forma directa (`dd`, Etcher, modo DD de Rufus, o Utilidad de disco), no repares archivos de arranque individuales. Si la copia está dañada, vuelve a grabar el dispositivo completo desde una imagen verificada.
- Para una instalación basada en archivos MiniOS, recrea la estructura de arranque utilizando el mismo método de instalación documentado, en lugar de copiar archivos de GRUB, Syslinux o EFI desde otra versión.
- Ventoy tiene su propio gestor de arranque y estructura. No instales el gestor de arranque de MiniOS sobre un dispositivo Ventoy; utiliza el [procedimiento de Ventoy](/installing-minios/installation-tools/Ventoy) en su lugar.
- Después de la conversión nativa, el destino utiliza un gestor de arranque y estructura de archivos convencionales de Debian. Puede mantener la apariencia de escritorio de MiniOS, pero la infraestructura live de MiniOS y las herramientas específicas de live ya no estarán presentes. Haz una copia de seguridad de los datos recuperables antes de usar el procedimiento de reparación o reinstalación del gestor de arranque de Debian adecuado para su BIOS/UEFI y esquema de particiones.

Si un dispositivo recién recreado aún no aparece en el menú de arranque del firmware, revisa el modo de firmware, el soporte de Secure Boot para la arquitectura seleccionada, el puerto/dispositivo USB y la [compatibilidad de hardware](/getting-started/Hardware-Compatibility).

## El menú de arranque MiniOS aparece pero el inicio falla

Primero elimina los parámetros opcionales. Usa `debug` y `timing` cuando se requiera más salida temprana del arranque. `rd.break` es para inspección avanzada de initramfs, no para reparación.

Si MiniOS no puede encontrar su origen, consulta [Detección del sistema](/reference/boot-process/System-Discovery). En un shell de initramfs, la información útil de solo lectura incluye:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporal puede ayudar a identificar el dispositivo que realmente contiene los datos de MiniOS. Después de eso, utiliza la sintaxis documentada de `from=` en lugar de adivinar los nombres de los dispositivos.

Para inicio PXE o ISO por HTTP, consulta [Arranque por red](/reference/boot-process/Network-Boot). La red en el arranque temprano es independiente de NetworkManager en la sesión en ejecución.

### Errores de módulo o de unión raíz

Consulta [Carga de módulos](/reference/boot-process/Module-Loading) para conocer las reglas reales de selección y orden de los módulos. En particular:

- `load=` y `noload=` pueden excluir módulos base o del kernel esenciales; `noload=` prevalece cuando ambos coinciden;
- los candidatos con el mismo nombre base ocupan el mismo espacio de reemplazo;
- un archivo `.sb` no demuestra que el archivo sea una imagen SquashFS válida;
- el kernel en ejecución debe coincidir con el módulo del kernel y los archivos de arranque coordinados MiniOS.

Después de un arranque exitoso, inspecciona el estado real sin modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemas de pantalla

Para pantalla en negro, resolución inutilizable o bucle del gestor de pantalla:

1. Prueba el parámetro de arranque `text`. Una consola funcional permite distinguir entre un problema gráfico/de escritorio y un fallo previo de arranque.
2. Elimina los parámetros `xorg-driver` o `xorg-resolution` que se hayan especificado manualmente.
3. Prueba **Iniciar sin guardar** para descartar una configuración de pantalla persistente.
4. Registra la GPU y el controlador con `lspci -nnk`.
5. Revisa `journalctl -b -p warning` y `dmesg --level=err,warn`.

Para máquinas virtuales, consulta [Virtualización](/maintenance-and-recovery/Virtualization).

## Problemas de red

Las conexiones cableadas y Wi-Fi normales se gestionan mediante NetworkManager; consulta [Redes](/using-minios/Networking).

Primero, verifica si la interfaz existe:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si no existe una interfaz, registra `lspci -nnk` o `lsusb` y revisa si hay errores de firmware o de controlador en `dmesg`.
- Si la interfaz existe pero no tiene dirección, diferencia entre problemas de conexión/DHCP y falta de soporte de hardware.
- Si la interfaz tiene dirección, prueba primero la puerta de enlace, luego una dirección IP y después un nombre DNS para identificar fallos de enlace, enrutamiento o DNS.
- El parámetro de arranque `ip=` pertenece al arranque de red temprano y no configura una conexión persistente de NetworkManager. Consulta [Arranque por red](/reference/boot-process/Network-Boot).

## Problemas de persistencia

Arranque **Iniciar sin guardar** antes de modificar un almacén de persistencia sospechoso. No repare ni elimine la única copia de una sesión mientras esté activa.

Inspeccione lo que MiniOS ve actualmente:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Verifique el modo de arranque seleccionado, el espacio disponible para escritura, la compatibilidad del sistema de archivos y la compatibilidad de la sesión. Las reglas detalladas de selección se encuentran en [Sesiones y persistencia](/using-minios/Sessions-and-Persistence) y [Internos de persistencia](/reference/boot-process/Persistence-Internals).

Si una sesión importante que no está en ejecución `native`, `dynfilefs`, `dynblk`, `raw`, o `luks` aún es legible, expórtela **antes de** experimentar con el almacenamiento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager no puede leer ni exportar la sesión, deje de escribir en el origen y conserve una copia offline del almacenamiento afectado antes de continuar. Para una sesión dynblk separada, `dynblk inspect /path/to/volume000.db` y `dynblk check /path/to/volume000.db` ofrecen diagnósticos de formato de solo lectura; no los ejecute sobre un volumen que siga conectado. MiniOS no define un procedimiento manual universal para reconstruir segmentos DynFileFS, restaurar partes de respaldo dynblk, reparar un sistema de archivos interno ni reconstruir los metadatos de la sesión. Esta recuperación depende del sistema de archivos o contenedor y solo debe intentarse sobre una copia cuando el valor de los datos lo justifique.

Consulte [Copia de seguridad de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para flujos de trabajo compatibles de respaldo e importación de sesiones.

## Problemas de almacenamiento y espacio libre

Inspecciona dispositivos y puntos de montaje sin modificarlos:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un sistema de archivos lleno puede provocar fallos en operaciones de paquetes, guardados de sesión incompletos y otros errores secundarios. Libera espacio moviendo o eliminando solo datos conocidos tras confirmar el sistema de archivos correcto. Utiliza el Gestor de sesiones de MiniOS para eliminar sesiones en lugar de borrar manualmente directorios de sesión numerados.

La reparación de sistemas de archivos no es una operación genérica de MiniOS. Si el propio sistema de archivos está dañado, desmóntalo, primero guarda los datos importantes o una imagen, y utiliza un procedimiento de reparación adecuado para ese sistema de archivos y dispositivo de almacenamiento.

## Cambios de paquetes y actualizaciones del sistema

Si los problemas comenzaron tras cambios de paquetes APT, recuerda que una sesión persistente en vivo puede sobrescribir archivos de los módulos MiniOS de solo lectura. Prueba **Iniciar sin guardar** para comparar con el conjunto original de módulos. Consulta [Actualización de MiniOS](/maintenance-and-recovery/Updating-MiniOS) para la diferencia entre el mantenimiento con APT y el cambio de versiones de MiniOS.

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

Para fallos repetidos de arranque en medios MiniOS con escritura, `EXPORT_LOGS=true` en `config.conf` exporta los registros de arranque en `minios/log/`. Consulta [config.conf](/reference/configuration/config.conf).

Elimina credenciales, claves privadas, contraseñas Wi-Fi y otra información confidencial antes de compartir los registros. Si el error es reproducible, incluye los fragmentos relevantes y abre un reporte en el [seguimiento de incidencias de MiniOS](https://github.com/minios-linux/minios-live/issues).
