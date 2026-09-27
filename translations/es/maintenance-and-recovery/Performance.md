---
updated: 2026-09-26
---

# Rendimiento

La optimización del rendimiento en MiniOS implica equilibrar el tiempo de arranque, el uso de RAM, las lecturas en tiempo de ejecución, la sobrecarga de persistencia y la durabilidad del almacenamiento. Para conocer el significado exacto de cada opción y los límites de seguridad, consulta [Modos de arranque](/using-minios/Boot-Modes), [Carga de módulos en initrd](/reference/boot-process/Module-Loading), y [Persistencia de initrd](/reference/boot-process/Persistence-Internals).

## Parámetros de arranque para el rendimiento

Los parámetros de arranque pueden trasladar el trabajo de inicio y las lecturas del sistema en vivo entre RAM y el dispositivo de origen. Consulta [Parámetros de arranque](/reference/Boot-Parameters) para la referencia completa.

### Cargar el sistema en RAM (`toram`)

`toram` puede reducir la latencia en tiempo de ejecución desde un dispositivo USB lento o una ISO montada por red, a cambio de un arranque más largo y un uso considerablemente mayor de RAM. El modo bare `toram`utiliza la ruta de copia completa. `toram=trim`suele consumir menos RAM, pero su copia más limitada puede omitir datos o módulos necesarios posteriormente.

Deja espacio para la capa de escritura, aplicaciones, cachés y zram, en lugar de dimensionar solo para los archivos de módulos. Asignar más RAM a la copia en vivo reduce lo disponible para la carga de trabajo. Consulta [Modos de arranque](/using-minios/Boot-Modes) para conocer la durabilidad de la copia y las restricciones al retirar el medio.

### Filtrado de módulos (`load` y `noload`)

El filtrado puede reducir la cantidad de datos copiados y las capas montadas, especialmente con `toram=trim`. El costo es un sistema menos capaz y mayor riesgo de fallos en el arranque o en tiempo de ejecución si se omite alguna dependencia. Verifica el conjunto de módulos resultante; la sintaxis de filtrado y las limitaciones de módulos protegidos se definen en [Carga de módulos en initrd](/reference/boot-process/Module-Loading).

## Optimización de persistencia

La persistencia traslada las operaciones de E/S de la capa de escritura desde el RAM temporal hacia el almacenamiento o un contenedor. La elección del backend afecta la latencia, compatibilidad, gestión de capacidad y complejidad de recuperación.

### Modos de persistencia (`perchmode`)

- **`native`:** Almacena la capa de escritura directamente como archivos normales. Tiene la menor sobrecarga de contenedor y no impone un tamaño fijo, pero requiere un sistema de archivos compatible que conserve el metadato y las operaciones de Linux que MiniOS necesita.
- **`raw`:** Utiliza una sola imagen ext4 de capacidad fija. El tamaño del archivo se ajusta a la capacidad solicitada y el crecimiento es explícito, por lo que es simple y predecible, pero no ofrece la flexibilidad de capacidad de los backends dinámicos. FAT32 limita la imagen individual a 4000 MiB.
- **`dynfilefs`:** El backend FUSE/format-400 amplía el almacenamiento del contenido bajo demanda y permite usar medios que de otro modo no serían adecuados. Su índice no es disperso: cada bloque lógico de 4 KiB declarado requiere un desplazamiento de 8 bytes, así que la capacidad lógica cuesta aproximadamente 2 MiB de RAM y unos 2 MiB de almacenamiento de índice por cada GiB, incluso si el contenido está vacío. Esto hace que las capacidades moderadas sean eficientes, pero las capacidades delgadas y grandes resultan costosas desde el inicio.
- **`dynblk`:** El backend de kernel format-1 `DBSPRS01` mantiene las tablas de mapeo en disco y una caché de metadatos limitada en RAM (1 MiB por defecto). Llenar un dispositivo existente no asigna un mapa residente completo. Las descripciones de extensiones y directorios escalan según las partes declaradas; la caché de archivos y la memoria del códec son adicionales. `dynblk limits --format dynblk` informa el límite de la geometría; `dynblk status /dev/dynblkN --json` informa los búferes contabilizados y las estadísticas de caché. Las sobrescrituras normales permanecen en el lugar; las actualizaciones comprimidas parciales actualmente recomprimen un bloque de 64 KiB. Elija la política de caché de adjuntos con cuidado: `unsafe` renuncia a las garantías de durabilidad.
- **`squashfs`:** Almacena una instantánea comprimida y reconstruye la capa superior escribible en RAM en cada arranque. Minimiza el almacenamiento persistente para sesiones mayormente estables, pero implica un costo de CPU y RAM al restaurar y reescribe la instantánea al guardar. Si la memoria lo permite, al guardar se crea una copia estable de los cambios en RAM y se comprime directamente en un candidato privado en el directorio de sesión. Tras la verificación y sincronización, MiniOS reemplaza de forma atómica `changes.sb`; no escribe una segunda copia comprimida. Si RAM no puede contener el árbol de staging, utiliza el espacio de trabajo en disco existente para ese árbol.

LUKS2 puede envolver Raw, DynFileFS o DynBlk. El cifrado añade sobrecarga de desbloqueo y operaciones criptográficas, manteniendo la capacidad y el comportamiento de almacenamiento del backend subyacente.

Realice pruebas de cargas de trabajo representativas en el dispositivo real. Las diferencias entre el controlador flash, sistema de archivos, puente USB, cifrado, compresión y la propia carga de trabajo influyen más que una clasificación universal de modos de persistencia.

### Reduzca las escrituras de caché y registros con `perch`

Configurador de MiniOS**Avanzado** ofrece ajustes de almacenamiento independientes para los registros del sistema, descargas de APT y cachés estándar de navegadores nativos. También funcionan en `minios/config.conf` o sus `config.conf.d/*.conf` fragmentos:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Cada ajuste acepta `persistent` (por defecto) o `volatile`. Reinicie tras cambiar uno. `minios-boot` aplica la política solo cuando la sesión de `perch` está confirmada como escribible y duradera; solo solicitar persistencia no es suficiente. Para un arranque único, utilice `log-storage=volatile`, `apt-cache=volatile`, o `browser-cache=volatile` en la línea de comandos del kernel. Las formas con prefijo `live-config.`- también funcionan y tienen prioridad sobre los archivos de configuración. Estos ajustes **no** activan `perch` por sí solos. Consulte [Archivo de configuración](/reference/configuration/config.conf) para el orden de los archivos fuente y [Parámetros de arranque](/reference/Boot-Parameters) para la sintaxis completa.

| Ajuste | Qué permanece en RAM con `volatile` | Qué queda en el almacenamiento persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | El journal de systemd (máximo 32 MiB) y los archivos `/var/log` normales (tmpfs de 32 MiB). | Diagnósticos de arranque en `/var/log/minios/` y `/var/log/live/`, incluyendo tres versiones anteriores del registro. |
| `LIVE_APT_CACHE` | Paquetes descargados en `/var/cache/apt/archives` (tmpfs de 256 o 512 MiB, según la memoria disponible). | Estado de paquetes en `/var/lib/dpkg`, listas de repositorios en `/var/lib/apt/lists`, y archivos instalados. |
| `LIVE_BROWSER_CACHE` | Un tmpfs compartido de 512 MiB para los directorios de caché estándar de Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera y Yandex Browser bajo el directorio `~/.cache` del usuario en vivo. Una política del sistema desactiva la caché en disco de Firefox. | Perfiles, cookies, contraseñas, datos de sitios y cachés de aplicaciones no relacionadas. |

Las cachés de APT y de navegador RAM se omiten si hay menos de 1 GiB disponible o si el swap no-zRAM está activo. El tmpfs del archivo APT no se desborda al dispositivo: una descarga mayor que su capacidad restante puede fallar. Un `policies.json` de Firefox existente no se reemplaza; revise su configuración de caché en disco por separado. Las rutas estándar de navegadores nativos se preparan después de crear el usuario en vivo, incluso si se instala un navegador posteriormente. Las rutas personalizadas, instalaciones Flatpak/Snap y usuarios creados después de esa configuración no se redirigen automáticamente. Las cachés de navegadores almacenadas previamente quedan ocultas por los montajes RAM en este arranque y reaparecen al volver a `persistent`.

Los registros de arranque permanecen en el almacenamiento persistente escribible independientemente del ajuste de registros ordinarios; una sesión SquashFS los mantiene fuera de `changes.sb`, por lo que no dependen del guardado de instantáneas al apagar. Con `volatile`, otros archivos bajo `/var/log` (incluido el historial de texto de APT/dpkg) desaparecen al reiniciar. `EXPORT_LOGS=true` es una exportación explícita separada al medio MiniOS. Un tmpfs de registros lleno (32 MiB) deja de aceptar nuevas escrituras en vez de volcar a la memoria flash. Si se habilita swap respaldado por disco más adelante, los archivos en memoria aún pueden paginarse a ese swap. Consulte [Solución de problemas](/maintenance-and-recovery/Troubleshooting#collecting-logs) para localizar los diagnósticos de arranque.

MiniOS también utiliza `noatime` al montar sus propios sistemas de archivos de datos y contenedores, evitando actualizaciones de metadatos de tiempo de acceso; esto no vuelve a montar discos de usuario no relacionados. El estándar `relatime` ya limita esas actualizaciones, así que mida la diferencia antes de considerarlo un ahorro importante. Mantenga el journal del sistema de archivos, barreras y `fsync` activados para un almacenamiento persistente extraíble.

Para una escritura controlada de archivos de registro de 16 MiB seguida de `sync`, una VM de Testo registró 33,304 sectores escritos en su disco virtual inferior en modo persistente y 8 en modo volátil. Esto demuestra el cambio en la ruta de escritura para esa carga de trabajo. No mide las escrituras dentro de un controlador USB flash ni predice la vida útil del NAND. Compare cargas de trabajo idénticas de aplicaciones en el dispositivo real antes de sacar conclusiones sobre la vida útil.

## Configuración de ZRAM

Zram intercambia tiempo de CPU por capacidad de memoria comprimida y puede evitar el uso de swap respaldado por almacenamiento, que es mucho más lento. Un dispositivo zram más grande puede absorber más páginas inactivas, pero no crea RAM física; las cargas de trabajo incomprimibles siguen consumiendo memoria.
Los algoritmos de compresión equilibran el rendimiento y el uso de CPU frente a la tasa de compresión, y su disponibilidad depende del kernel. Comience con el valor predeterminado y cambie `zramsize`, `zramcomp`, o `nozram` solo para una carga de trabajo medida; consulte [Parámetros de arranque](/reference/Boot-Parameters) para los valores aceptados.

## Sistema de archivos y hardware de almacenamiento

- **Elección del dispositivo:** Un mayor rendimiento secuencial acorta la copia de módulos grandes, mientras que una baja latencia de E/S aleatoria es más importante para cargas de trabajo de escritorio persistentes.
  Mida el dispositivo y su carcasa juntos; la generación USB por sí sola no predice el rendimiento de la memoria flash o SSD.
- **Elección del sistema de archivos:** Un sistema de archivos nativo de Linux puede usar persistencia nativa sin sobrecarga de contenedor. Los sistemas de archivos multiplataforma mejoran la portabilidad, pero requieren un backend de contenedor compatible para los metadatos de Linux, añadiendo capas de mapeo y sistema de archivos. Elija según la portabilidad, necesidades de recuperación y resultados de pruebas de rendimiento.
