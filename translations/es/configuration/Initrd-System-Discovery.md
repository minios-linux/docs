---
updated: 2026-08-26
---

# Descubrimiento del sistema Initrd

Después de que el gestor de arranque carga el kernel y el initramfs, el initramfs debe localizar el árbol de datos de MiniOS que proporciona los módulos del sistema `.sb`. Esto ocurre antes de que estén activos la pila de red de usuarios, el escritorio y la sesión persistente normales.

## Precedencia de fuentes

La selección de fuente tiene una precedencia fija:

1. Un valor literal `from=http://...` selecciona un ISO por HTTP.
2. De lo contrario, cualquier valor no vacío de `ip=` selecciona descarga PXE.
3. Si no, `from=askdisk` o `from=askdisk:...` abre el selector de disco.
4. Si no, el initramfs escanea los dispositivos de bloque locales.

Las dos rutas de red no recurren a medios locales. Tras un intento de HTTP ISO o PXE, el descubrimiento devuelve ese resultado de red en vez de intentar con discos; un resultado inutilizable o incompleto falla en la validación o en la configuración posterior.

Este orden tiene dos consecuencias importantes:

- `from=http://...` prevalece sobre `ip=`. El parámetro opcional `ip=` entonces proporciona la configuración de dirección estática para la conexión HTTP ISO.
- Un `ip=` no vacío prevalece sobre cualquier valor local de `from=`, incluyendo un dispositivo, directorio, ruta ISO o `askdisk`. No utilices `ip=` solo para configurar la red de un sistema iniciado localmente.

## Descubrimiento local

Sin una fuente HTTP ni un `ip=` no vacío, MiniOS realiza 45 pasadas de descubrimiento, aproximadamente una por segundo. Cada pasada actualiza los nodos de dispositivo, obtiene candidatos de dispositivos de bloque desde `blkid`, ordena sus nombres de dispositivo y los prueba en ese orden. El primer candidato que contenga una fuente MiniOS válida se retiene; los dispositivos posteriores no se consideran.

Si `from=` está vacío, la ruta que se prueba en cada sistema de archivos es `minios`. Una fuente califica cuando ese directorio o su subdirectorio inmediato `modules/` contiene al menos un archivo cuya extensión es `.sb` por defecto. El parámetro `bext=` cambia la extensión utilizada en esta prueba. El descubrimiento no valida que el conjunto de módulos encontrado esté completo o sea arrancable.

Cada candidato se monta inicialmente como solo lectura. Después de calificar, MiniOS intenta hacer que ese montaje de datos seleccionado sea escribible, pero la imposibilidad de hacerlo no rechaza una fuente válida.

### Formatos locales de `from=`

Una ruta relativa o absoluta ordinaria se interpreta dentro de cada sistema de archivos candidato. Las barras iniciales se normalizan durante la construcción de la ruta, por lo que ambas buscan el mismo directorio:

```text
from=minios
from=/minios
```

Si la ruta solicitada es un archivo regular en un sistema de archivos candidato, MiniOS lo trata como un ISO, lo monta en bucle como solo lectura y prueba el directorio `minios` dentro del ISO:

```text
from=/images/minios.iso
```

Las rutas calificadas por dispositivo solo admiten estos formatos:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` admite un nombre de dispositivo simple seguido de una ruta. El formato de etiqueta debe ser exactamente `/dev/disk/by-label/LABEL/path`; la etiqueta se resuelve con `blkid`, luego la ruta restante se prueba en ese sistema de archivos.

No existe un analizador correspondiente para rutas UUID, PARTUUID o by-id. No se admiten formatos como los siguientes:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Selección interactiva

Utiliza `askdisk` para seleccionar una partición y luego probar una ruta en ella:

```text
from=askdisk
from=askdisk:custom:dir
```

El primer formato prueba `minios` en la partición seleccionada. En el segundo formato, los dos puntos se convierten en separadores de ruta, así que `askdisk:custom:dir` prueba `custom/dir`.
La sintaxis con barra como `from=askdisk/custom/dir` también abre el selector pero pierde silenciosamente la ruta personalizada y prueba `minios`; no la utilices.

La lista de dispositivos mostrada se actualiza mientras el selector está abierto y excluye los sistemas de archivos de intercambio (swap). La selección aún realiza la prueba normal de presencia de módulos; elegir solo una partición no es suficiente.

## HTTP ISO

Una fuente HTTP ISO tiene este formato:

```text
from=http://server.example/path/minios.iso
```

Solo se reconoce HTTP simple. No se admiten HTTPS ni otros esquemas de URL.
El initramfs encuentra la primera interfaz de red detectada que no sea loopback, levanta la red y monta el ISO remoto a través de `httpfs2`. La selección de interfaz no verifica el enlace, la accesibilidad ni si esa interfaz es la utilizable en un sistema con varias NIC.

Cuando `ip=` está ausente, el arranque HTTP ISO solicita DHCP con `udhcpc`. Cuando `ip=` está presente, utiliza los campos estáticos esperados por el analizador PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Para el arranque HTTP ISO, la URL sigue determinando el servidor HTTP. Los campos estáticos configuran la dirección del cliente, la máscara de red, la puerta de enlace predeterminada y las entradas DNS iniciales; el campo de puerto opcional pertenece a la descarga de archivos PXE y no reemplaza el puerto en la URL del ISO.

`cache=<MB>` habilita una caché httpfs del tamaño solicitado en `/tmp`. Es una caché, no una descarga completa garantizada. El sistema en ejecución sigue dependiendo del ISO remoto y la red a menos que una copia exitosa en RAM desconecte la fuente.

## Descarga de datos PXE

Cualquier `ip=` no vacío selecciona la descarga de datos PXE a menos que primero se haya seleccionado `from=http://...`. La sintaxis admitida es:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

La máscara de red está en notación IPv4 con puntos. El puerto HTTP opcional por defecto es `7529`.
No se admiten formatos genéricos de kernel o dracut como `ip=dhcp` y `ip=:::::eth0:dhcp`. La descarga de datos PXE en sí no tiene una forma DHCP en este analizador.

MiniOS configura la primera interfaz detectada que no sea loopback sin comprobar que tenga un enlace funcional. Primero solicita `PXEFILELIST` y los archivos MiniOS listados por HTTP desde el campo del servidor. TFTP es un fallback limitado: solo se selecciona cuando la solicitud HTTP inicial de `PXEFILELIST` falla. No es una conmutación general de interfaz, fallback a medios locales ni recuperación ante cualquier fallo parcial de descarga HTTP.

## Copia y desconexión con `toram=full`

`toram=full` es relevante para el descubrimiento porque puede eliminar la dependencia continua de la fuente seleccionada. Tras el descubrimiento, MiniOS copia el árbol de datos a RAM y luego intenta desmontar la fuente y mover la copia en RAM a su lugar. Solo un desmontaje y traslado exitosos desconectan medios locales, un ISO montado en bucle o un HTTP ISO.

Limitaciones importantes:

- No hay una comprobación previa de que la RAM disponible pueda albergar la copia.
- Cuando se solicita persistencia, la copia de nivel superior `*` omite archivos ocultos (dotfiles).
- Cuando no se solicita persistencia, la entrada `changes` se omite deliberadamente. Esa rama copia otras entradas de nivel superior, incluidos los archivos ocultos.
- Un fallo al copiar, desmontar o mover puede dejar la fuente original montada. No asumas que especificar `toram=full` hace segura la extracción del medio o la pérdida de red; verifica que la desconexión haya tenido éxito.

Consulta [Persistencia en Initrd](/configuration/Initrd-Persistence.md) antes de combinar `toram` con `perch` o `perchdir`.

## Fallos y diagnósticos

Si fallan las 45 pasadas locales, MiniOS entra en su ruta de error fatal y abre una shell de initramfs en lugar de iniciar el sistema live. Las rutas de red no realizan la búsqueda local de 45 pasadas ni recurren a medios locales; según el resultado parcial, pueden fallar la comprobación de datos o la configuración posterior. Salir de una shell fatal no repara la fuente faltante y puede que solo permita que la configuración posterior falle de forma menos clara.

Parámetros de diagnóstico útiles:

- `debug` habilita el trazado de shell, diagnósticos adicionales y shells interactivos en varios puntos de control del initramfs. Sal de una shell de punto de control para continuar.
- `timing` imprime el tiempo transcurrido entre las etapas del initramfs y un total final.
- `rd.break` solicita una shell de initramfs cerca del traspaso al root real; sal de ella para continuar el arranque.

En una shell, inspecciona `/proc/cmdline`, `/proc/net/dev`, `blkid`, los sistemas de archivos montados y `/var/log/livedbg`. Comienza con los valores exactos de `from=`, `ip=` y `bext=` que se muestran en `/proc/cmdline`.

## Documentación relacionada

- [Modos de arranque](/configuration/Boot-Modes.md)
- [Carga de módulos](/configuration/Initrd-Module-Loading.md)
- [Persistencia](/configuration/Initrd-Persistence.md)
- [Arranque por red](/installation/Network-Boot.md)
- [Parámetros de arranque](/configuration/Boot-Parameters.md)
- [Solución de problemas](/administration/Troubleshooting.md)
