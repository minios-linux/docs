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

- **`native`:** Almacena la capa de escritura directamente como archivos normales. Tiene la menor sobrecarga de contenedor y no tiene un tamaño fijo, pero requiere un sistema de archivos subyacente que conserve los metadatos y operaciones de Linux que MiniOS necesita.
- **`raw`:** Utiliza una única imagen ext4 de capacidad fija. Su tamaño se establece según la capacidad solicitada y el crecimiento debe ser explícito, por lo que es simple y predecible, pero no ofrece la flexibilidad de capacidad de los backends dinámicos. FAT32 limita la imagen única a 4000 MiB.
- **`dynfilefs`:** El backend FUSE/format-400 amplía el almacenamiento de datos según demanda y admite medios que de otro modo serían inadecuados. Su índice no es disperso: cada bloque lógico declarado de 4 KiB requiere un desplazamiento de 8 bytes, por lo que la capacidad lógica cuesta aproximadamente 2 MiB de RAM y unos 2 MiB de almacenamiento para el índice de respaldo por GiB, incluso si la carga útil está vacía. Esto hace que capacidades moderadas sean eficientes, pero capacidades delgadas grandes resulten costosas desde el inicio.
- **`dynblk`:** El backend de kernel format-1 `DBSPRS01` mantiene las tablas de mapeo en disco y una caché de metadatos limitada en RAM (por defecto 1 MiB). Llenar un dispositivo existente no asigna un mapa residente completo. Las descripciones de extensiones y directorios escalan según las partes declaradas; la caché de archivos y la memoria del códec son adicionales. `dynblk limits --format dynblk` informa el límite de geometría; `dynblk status /dev/dynblkN --json` informa los búferes contabilizados y las estadísticas de caché. Las sobrescrituras normales en bruto permanecen en su lugar; las actualizaciones comprimidas parciales actualmente recomprimen un bloque de 64 KiB. Elija la política de caché de adjuntos de forma deliberada: `unsafe` renuncia a las garantías de durabilidad.
- **`squashfs`:** Almacena una instantánea comprimida y reconstruye la capa superior editable en RAM en cada inicio. Minimiza el almacenamiento persistente para sesiones mayormente estables, pero implica un coste de CPU y RAM durante la restauración y vuelve a escribir la instantánea al guardar. Cuando la memoria lo permite, el guardado prepara una copia estable de los cambios en RAM y comprime directamente en un candidato privado en el directorio de sesión. Tras la verificación y sincronización, MiniOS reemplaza de forma atómica `changes.sb`; no se escribe una segunda copia comprimida. Si RAM no puede alojar el árbol de preparación, se utiliza el espacio de trabajo en disco existente para ese árbol.

LUKS2 puede envolver Raw, DynFileFS o DynBlk. El cifrado añade sobrecarga de desbloqueo y procesamiento criptográfico, manteniendo la capacidad y el comportamiento de almacenamiento del backend subyacente.

Realice pruebas de rendimiento representativas en el dispositivo real. Las diferencias de controlador flash, sistema de archivos, puente USB, cifrado, compresión y carga de trabajo son más relevantes que una clasificación universal de los modos de persistencia.

### Reduzca escrituras de caché y registros con `perch`

Configurador de MiniOS **Avanzado** ofrece opciones de almacenamiento independientes para los registros del sistema, descargas de APT y cachés estándar de navegadores nativos. También funcionan en `minios/config.conf`o sus `config.conf.d/*.conf` fragmentos:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Cada opción acepta `persistent` (por defecto) o `volatile`. Reinicie después de cambiar una opción. `minios-boot` aplica la política solo cuando la sesión de `perch` está confirmada como editable y duradera; solo solicitar persistencia no es suficiente. Para un arranque único, utilice `log-storage=volatile`, `apt-cache=volatile`, o `browser-cache=volatile` en la línea de comandos del kernel. Las formas con prefijo `live-config.`- también funcionan y tienen prioridad sobre los archivos de configuración. Estas opciones **no** activan `perch` por sí solas. Consulte [Archivo de configuración](/reference/configuration/config.conf) para el orden de los archivos fuente y [Parámetros de arranque](/reference/Boot-Parameters) para la sintaxis completa.

| Opción | Qué permanece en RAM con `volatile` | Qué queda en el almacenamiento persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | El registro de systemd (máximo 32 MiB) y los archivos `/var/log` normales (32 MiB tmpfs). | Diagnósticos de arranque en `/var/log/minios/` y `/var/log/live/`, incluyendo tres versiones anteriores del registro. |
| `LIVE_APT_CACHE` | Paquetes descargados en `/var/cache/apt/archives` (256 o 512 MiB tmpfs, según la memoria disponible). | Estado de los paquetes en `/var/lib/dpkg`, listas de repositorios en `/var/lib/apt/lists`, y archivos instalados. |
| `LIVE_BROWSER_CACHE` | Un tmpfs compartido de 512 MiB para los directorios de caché estándar de Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera y Yandex Browser bajo el `~/.cache` del usuario en vivo. Una política del sistema desactiva la caché en disco de Firefox. | Perfiles, cookies, contraseñas, datos de sitios y cachés de aplicaciones no relacionadas. |

Las cachés de APT y de navegador RAM se omiten si hay menos de 1 GiB disponible o si el intercambio sin zRAM está activo. El tmpfs del archivo de APT no se desborda al dispositivo: una descarga mayor que la capacidad restante puede fallar. Un `policies.json` de Firefox existente no se reemplaza; revise su configuración de caché en disco por separado. Las rutas estándar de navegadores nativos se preparan después de crear el usuario en vivo, incluso si se instala un navegador más tarde. Las rutas personalizadas, instalaciones Flatpak/Snap y usuarios creados después de esa configuración no se redirigen automáticamente. Las cachés de navegador almacenadas previamente quedan ocultas por los montajes RAM en este arranque y reaparecen al volver a `persistent`.

Los registros de arranque permanecen en el almacenamiento persistente editable sin importar la opción de registros ordinarios; una sesión SquashFS los mantiene fuera de `changes.sb`, por lo que no dependen del guardado de instantáneas al apagar. Con `volatile` otras ubicaciones bajo `/var/log` (incluido el historial de texto de APT/dpkg) desaparecen al reiniciar. `EXPORT_LOGS=true` es una exportación explícita separada al medio MiniOS. Un tmpfs de registro lleno (32 MiB) deja de aceptar nuevos registros en vez de escribir en la memoria flash. Si se activa otro swap respaldado en disco más adelante, los archivos en memoria aún pueden paginarse a ese swap. Consulte [Solución de problemas](/maintenance-and-recovery/Troubleshooting#collecting-logs) para localizar los diagnósticos de arranque.

MiniOS también utiliza `noatime` al montar sus propios datos y sistemas de archivos de contenedor, evitando actualizaciones de metadatos de acceso; esto no vuelve a montar discos de usuario no relacionados. El `relatime` estándar ya limita este tipo de actualizaciones, así que mida la diferencia antes de considerarlo un ahorro importante. Mantenga el diario del sistema de archivos, las barreras y `fsync` activados para un almacenamiento persistente extraíble.

Para una escritura controlada de archivos de registro de 16 MiB seguida de `sync`, una VM Testo registró 33.304 sectores escritos en su disco virtual inferior en modo persistente y 8 en modo volátil. Esto demuestra el cambio en la ruta de escritura para esa carga de trabajo. No mide escrituras dentro del controlador de memoria USB ni predice la vida útil de la NAND. Compare cargas de trabajo idénticas de aplicaciones en el dispositivo real antes de sacar conclusiones sobre la vida útil.
