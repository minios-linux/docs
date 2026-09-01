---
updated: 2026-08-28
---

# Descubrimiento del sistema

Esta página explica qué modifican los parámetros de arranque `from`, `ip`, `cache`, `bext`, `toram` y `toram=full`. Está dirigida a entradas de arranque personalizadas, arranque por red y resolución de problemas. La mayoría de los usuarios pueden seleccionar una entrada normal en el menú de arranque sin configurar estos parámetros manualmente.

Después de que el gestor de arranque carga el kernel y el initramfs, el initramfs debe localizar el árbol de datos MiniOS que proporciona los módulos del sistema `.sb`. Esto ocurre antes de que estén activos la pila de red de usuarios, el entorno gráfico y la sesión persistente.

## En términos sencillos

MiniOS necesita encontrar el directorio que contiene sus módulos de sistema. Normalmente, busca en las unidades conectadas un directorio `minios/`. El parámetro `from=` le indica un directorio o ISO diferente. Los parámetros de red reemplazan esta búsqueda local por una descarga HTTP de un ISO o PXE.

Encontrar una unidad no garantiza que el conjunto de módulos esté completo, y encontrar los archivos de sistema no habilita la persistencia. Son pasos de inicio separados.

## Parámetros explicados

| Parámetro | Qué indica a MiniOS | Uso típico |
|---|---|---|
| `from=PATH` | Busca MiniOS en un directorio específico o en una ISO en vez de aceptar la primera fuente local que coincida. | Iniciar desde una ISO almacenada en un disco o usar un directorio no estándar. |
| `from=askdisk` | Abre un selector interactivo para la partición que contiene MiniOS. | Hay varias unidades conectadas que contienen posibles fuentes. |
| `from=http://...` | Monta una ISO desde un servidor HTTP simple. | Arranque controlado por red donde el sistema en ejecución puede seguir dependiendo del servidor. |
| `ip=...` | Usa red estática temprana. Sin un HTTP `from=`, selecciona la descarga de datos vía PXE y omite los discos locales. | Despliegue por PXE o direccionamiento estático para una ISO HTTP. |
| `cache=MB` | Asigna una caché httpfs para una ISO HTTP. No garantiza que la ISO completa se descargue. | Reduce lecturas repetidas desde una fuente HTTP. |
| `bext=EXTENSION` | Busca nombres de archivos de módulos con otra extensión en vez de `.sb`. | Solo para imágenes especializadas; no convierte módulos. |
| `toram` o `toram=full` | Copia todo el árbol de datos MiniOS descubierto en RAM e intenta desmontar la fuente. El uso simple significa `full`. | Operación temporal de RAM en una máquina con suficiente memoria. |

Si un arranque local por USB se detiene antes de que aparezca el escritorio, primero elimina los valores personalizados de `from=` y `ip=`. Un `ip=` accidentalmente no vacío impide la detección de discos locales, mientras que un `from=` incorrecto puede hacer que MiniOS busque una ruta que no existe.

## Precedencia de fuentes

La selección de fuente tiene una precedencia fija:

1. Un valor literal `from=http://...` selecciona un ISO HTTP.
2. De lo contrario, cualquier valor `ip=` no vacío selecciona descarga PXE.
3. Si no, `from=askdisk` o `from=askdisk:...` abre el selector de disco.
4. Si no, el initramfs escanea los dispositivos de bloque locales.

Las dos rutas de red no recurren a medios locales. Tras un intento de ISO HTTP o PXE, el descubrimiento devuelve ese resultado de red en vez de probar discos; un resultado inutilizable o incompleto falla la validación o la configuración posterior.

Este orden tiene dos consecuencias importantes:

- `from=http://...` tiene prioridad sobre `ip=`. El parámetro opcional `ip=` luego proporciona direccionamiento estático para la conexión ISO HTTP.
- Un `ip=` no vacío tiene prioridad sobre cualquier valor local de `from=`, incluyendo dispositivo, directorio, ruta de ISO o `askdisk`. No uses `ip=` solo para configurar la red de un sistema arrancado localmente.

## Descubrimiento local

Sin una fuente HTTP ni un `ip=` no vacío, MiniOS realiza 45 pasadas de descubrimiento, aproximadamente una por segundo. Cada pasada actualiza los nodos de dispositivos, obtiene candidatos de dispositivos de bloque desde `blkid`, ordena sus nombres y los prueba en ese orden. El primer candidato que contenga una fuente MiniOS válida se conserva; los dispositivos posteriores no se consideran.

Si `from=` está vacío, la ruta probada en cada sistema de archivos es `minios`. Una fuente es válida cuando ese directorio o su subdirectorio inmediato `modules/` contiene al menos un archivo cuya extensión es `.sb` por defecto. El parámetro `bext=` cambia la extensión usada en esta prueba. El descubrimiento no valida que el conjunto de módulos encontrado esté completo o sea arrancable.

Cada candidato se monta inicialmente en modo solo lectura. Tras calificar, MiniOS intenta hacer que ese montaje de datos sea escribible, pero la imposibilidad de hacerlo no descarta una fuente válida.

### Formatos locales de `from=`

Una ruta relativa ordinaria o que parece absoluta se interpreta dentro de cada sistema de archivos candidato. Las barras iniciales se normalizan al construir la ruta, así que ambas buscan el mismo directorio:

```text
from=minios
from=/minios
```

Si la ruta solicitada es un archivo regular en un sistema de archivos candidato, MiniOS lo trata como un ISO, lo monta en modo solo lectura y prueba el directorio `minios` dentro del ISO:

```text
from=/images/minios.iso
```

Las rutas calificadas por dispositivo solo admiten estos formatos:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` admite un nombre de dispositivo simple seguido de una ruta. El formato de etiqueta debe ser exactamente `/dev/disk/by-label/LABEL/path`; la etiqueta se resuelve con `blkid` y luego la ruta restante se prueba en ese sistema de archivos.

No hay un analizador correspondiente para rutas UUID, PARTUUID o by-id. Formatos como los siguientes no son compatibles:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Selección interactiva

Usa `askdisk` para seleccionar una partición y luego probar una ruta en ella:

```text
from=askdisk
from=askdisk:custom:dir
```

El primer formato prueba `minios` en la partición seleccionada. En el segundo formato, los dos puntos se convierten en separadores de ruta, así que `askdisk:custom:dir` prueba `custom/dir`.
La sintaxis con barra como `from=askdisk/custom/dir` también abre el selector pero pierde silenciosamente la ruta personalizada y prueba `minios`; no la uses.

La lista de dispositivos mostrada se actualiza mientras el selector está abierto y excluye sistemas de archivos swap. La selección aún realiza la prueba normal de presencia de módulos; elegir solo una partición no es suficiente.

## ISO HTTP

Una fuente ISO HTTP tiene este formato:

```text
from=http://server.example/path/minios.iso
```

Solo se reconoce HTTP simple. HTTPS y otros esquemas de URL no son compatibles.
El initramfs detecta la primera interfaz de red no loopback, levanta la red y monta el ISO remoto mediante `httpfs2`. La selección de interfaz no verifica enlace, conectividad ni si esa interfaz es la utilizable en un sistema con varias NIC.

Cuando `ip=` está ausente, el arranque ISO HTTP solicita DHCP con `udhcpc`. Cuando `ip=` está presente, usa los campos estáticos esperados por el analizador PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Para el arranque ISO HTTP, la URL sigue determinando el servidor HTTP. Los campos estáticos configuran la dirección del cliente, máscara de red, puerta de enlace predeterminada y DNS temprano; el campo de puerto opcional pertenece a la descarga de archivos PXE y no reemplaza el puerto en la URL del ISO.

`cache=<MB>` habilita una caché httpfs del tamaño solicitado en `/tmp`. Es una caché, no una descarga completa garantizada. El sistema en ejecución sigue dependiendo del ISO remoto y la red a menos que una copia exitosa con RAM logre separar la fuente.

## Descarga de datos PXE

Cualquier valor `ip=` no vacío selecciona descarga de datos PXE, a menos que primero se haya seleccionado `from=http://...`. La sintaxis admitida es:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

La máscara de red es notación IPv4 con puntos. El puerto HTTP opcional por defecto es `7529`.
No se admiten formatos genéricos de kernel o dracut como `ip=dhcp` y `ip=:::::eth0:dhcp`. La descarga de datos PXE no tiene forma DHCP en este analizador.

MiniOS configura la primera interfaz detectada que no sea loopback sin comprobar si tiene enlace activo. Primero solicita `PXEFILELIST` y los archivos MiniOS listados vía HTTP desde el servidor. TFTP es un recurso limitado de respaldo: solo se selecciona cuando la solicitud HTTP inicial de `PXEFILELIST` falla. No es conmutación general de interfaz, ni recurso local, ni recuperación ante cualquier fallo parcial de descarga HTTP.

## Copiar y separar con `toram=full`

`toram=full` es relevante para el descubrimiento porque puede eliminar la dependencia continua de la fuente seleccionada. Tras el descubrimiento, MiniOS copia el árbol de datos a RAM e intenta desmontar la fuente y mover la copia RAM en su lugar. Solo un desmontaje y movimiento exitosos separan medios locales, un ISO montado en loop o un ISO HTTP.

Limitaciones importantes:

- No hay comprobación previa de que el RAM disponible pueda albergar la copia.
- Cuando se solicita persistencia, la copia de nivel superior `*` omite archivos ocultos.
- Cuando no se solicita persistencia, la entrada `changes` se omite deliberadamente. Esa rama copia otras entradas de nivel superior, incluidos archivos ocultos.
- Un fallo al copiar, desmontar o mover puede dejar la fuente original montada. No asumas que especificar `toram=full` hace segura la extracción de medios o la pérdida de red; verifica que la separación se haya realizado correctamente.

Consulta [Persistencia en Initrd](/reference/boot-process/Persistence-Internals) antes de combinar `toram` con `perch` o `perchdir`.

## Fallos y diagnóstico

Si fallan las 45 pasadas locales, MiniOS entra en su ruta de error fatal y abre una shell de initramfs en lugar de iniciar el sistema live. Las rutas de red no realizan la búsqueda local de 45 pasadas ni recurren a medios locales; según el resultado parcial, pueden fallar la comprobación de datos o la configuración posterior. Salir de una shell fatal no repara la fuente faltante y puede que solo permita que la configuración posterior falle de forma menos clara.

Parámetros de diagnóstico útiles:

- `debug` habilita trazado de shell, diagnósticos adicionales y shells interactivos en varios puntos de control del initramfs. Sal de una shell de punto de control para continuar.
- `timing` imprime el tiempo transcurrido entre etapas del initramfs y un total final.
- `rd.break` solicita una shell de initramfs cerca de la entrega al root real; sal de ella para continuar el arranque.

En una shell, inspecciona `/proc/cmdline`, `/proc/net/dev`, `blkid`, los sistemas de archivos montados y `/var/log/livedbg`. Comienza con los valores exactos de `from=`, `ip=` y `bext=` que se muestran en `/proc/cmdline`.

## Documentación relacionada

- [Modos de arranque](/using-minios/Boot-Modes)
- [Carga de módulos](/reference/boot-process/Module-Loading)
- [Persistencia](/reference/boot-process/Persistence-Internals)
- [Arranque por red](/reference/boot-process/Network-Boot)
- [Parámetros de arranque](/reference/Boot-Parameters)
- [Solución de problemas](/maintenance-and-recovery/Troubleshooting)
