---
updated: 2026-10-15
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

- **`native`:** Almacena la capa de escritura directamente como archivos normales. Presenta la menor sobrecarga de contenedor y no tiene un tamaño fijo, pero requiere un sistema de archivos subyacente que conserve los metadatos y operaciones de Linux que MiniOS necesita.
- **`raw`:** Utiliza una única imagen ext4 de capacidad fija. La longitud del archivo se ajusta a la capacidad solicitada y el crecimiento es explícito, por lo que es simple y predecible, pero no ofrece el comportamiento de capacidad dinámica de los backends dinámicos. FAT32 limita la imagen única a 4000 MiB.
- **`dynfilefs`:** El backend FUSE/format-400 amplía el almacenamiento de datos según demanda y es compatible con medios que de otro modo serían inadecuados. Su índice no es disperso: cada bloque lógico de 4 KiB declarado requiere un desplazamiento de 8 bytes, por lo que la capacidad lógica consume aproximadamente 2 MiB de RAM y unos 2 MiB de almacenamiento de índice por cada GiB, incluso si la carga útil está vacía. Esto hace que capacidades moderadas sean eficientes, pero capacidades delgadas grandes resulten costosas desde el principio.
- **`dynblk`:** El backend de kernel format-1 `DBSPRS01` mantiene las tablas de asignación en disco y una caché de metadatos limitada en RAM (por defecto 1 MiB). Llenar un dispositivo existente no asigna un mapa residente completo. Las descripciones de extensiones y directorios escalan según las partes declaradas; la caché de archivos y la memoria del códec son adicionales. `dynblk limits --format dynblk` informa el límite de la geometría; `dynblk status /dev/dynblkN --json` informa los búferes contabilizados y las estadísticas de caché. Las sobrescrituras en bruto normales permanecen en su lugar; las actualizaciones comprimidas parciales actualmente recomprimen un bloque de 64 KiB. Elija deliberadamente la política de caché de adjuntos: `unsafe` renuncia a las garantías de durabilidad.
- **`vmdk`:** Utiliza el controlador de kernel DynBlk con almacenamiento VMDK disperso estándar dividido. Crece bajo demanda pero no tiene compresión en el backend. Al igual que los contenedores nativos DynBlk, puede copiarse a RAM de forma independiente de los módulos del sistema y guardarse explícitamente en el almacenamiento.
- **`squashfs`:** Almacena una instantánea comprimida y reconstruye la capa superior editable en RAM en cada arranque. Minimiza el almacenamiento persistente para sesiones mayormente estables, pero implica costos de CPU y RAM al restaurar y vuelve a escribir la instantánea al guardar. Cuando la memoria lo permite, el guardado prepara una copia estable de los cambios en RAM y comprime directamente en un candidato privado en el directorio de sesión. Tras la verificación y sincronización, MiniOS reemplaza atómicamente `changes.sb`; no se escribe una segunda copia comprimida. Si RAM no puede contener el árbol de preparación, utiliza el espacio de trabajo en disco existente para ese árbol.

LUKS2 puede envolver Raw, DynFileFS, DynBlk o VMDK. El cifrado añade sobrecarga de desbloqueo y criptografía, pero mantiene la capacidad y el comportamiento de almacenamiento del backend subyacente. La compresión DynBlk se desactiva cuando se utiliza LUKS2; VMDK nunca ofrece compresión en el backend.

Realice pruebas comparativas de cargas de trabajo representativas en el dispositivo real. Las diferencias en el controlador flash, sistema de archivos, puente USB, cifrado, compresión y el tipo de carga de trabajo son más relevantes que cualquier clasificación universal de los modos de persistencia.

<a id="reduce-cache-and-log-writes-with-perch"></a>

### Reduce la escritura en caché y registros con `perch`

Configurador de MiniOS **Avanzado** ofrece opciones de almacenamiento independientes para los registros del sistema, descargas de APT y las cachés estándar de navegadores nativos. También funcionan en `minios/config.conf` o sus `config.conf.d/*.conf` fragmentos:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Cada ajuste acepta `persistent` (por defecto) o `volatile`. Reinicia después de cambiar uno. `minios-boot` aplica la política tras la activación exitosa de la persistencia en almacenamiento duradero o en una sesión RAM escribible con un registro protegido;`ram-origin` solicitar la persistencia no es suficiente. Para un arranque único, usa `log-storage=volatile`, `apt-cache=volatile`, o `browser-cache=volatile` en la línea de comandos del kernel. Las formas con prefijo `live-config.`- también funcionan y tienen prioridad sobre los archivos de configuración. Estos ajustes **no** activan `perch` por sí solos. Consulta [Archivo de configuración](/reference/configuration/config.conf) para el orden de los archivos fuente y [Parámetros de arranque](/reference/Boot-Parameters) para la sintaxis completa.

| Ajuste | Qué permanece en RAM con `volatile` | Qué queda en almacenamiento persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | El journal de systemd (máximo 32 MiB) y los archivos `/var/log` ordinarios (tmpfs de 32 MiB). | Diagnósticos de arranque en `/var/log/minios/` y `/var/log/live/`, incluyendo tres versiones anteriores del registro. |
| `LIVE_APT_CACHE` | Paquetes descargados en `/var/cache/apt/archives` (tmpfs de 256 o 512 MiB, según la memoria disponible). | Estado de los paquetes en `/var/lib/dpkg`, listas de repositorios en `/var/lib/apt/lists`, y archivos instalados. |
| `LIVE_BROWSER_CACHE` | Un tmpfs compartido de 512 MiB para los directorios de caché estándar de Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera y Yandex Browser bajo el directorio del usuario en vivo `~/.cache`. Una política del sistema desactiva la caché en disco de Firefox. | Perfiles, cookies, contraseñas, datos de sitios y cachés de aplicaciones no relacionadas. |

Las cachés de APT y de navegador RAM se omiten si hay menos de 1 GiB disponible o si el swap no-zRAM está activo. El tmpfs del archivo de APT no se desborda al dispositivo: una descarga mayor que su capacidad restante puede fallar. Una caché de Firefox existente `policies.json` no se reemplaza; revisa su configuración de caché en disco por separado. Las rutas estándar de navegadores nativos se preparan después de crear el usuario en vivo, incluso si se instala un navegador más tarde. Las rutas personalizadas, instalaciones Flatpak/Snap y usuarios creados después de esa configuración no se redirigen automáticamente. Las cachés de navegador almacenadas previamente quedan ocultas por los montajes RAM durante este arranque y reaparecen al volver a `persistent`.

Con persistencia duradera, los registros de arranque permanecen en el almacenamiento de sesión escribible independientemente de la configuración de registros ordinarios; una sesión SquashFS duradera los mantiene fuera de `changes.sb`, por lo que no dependen del guardado de instantáneas al apagar. Una sesión copiada con `perchtoram` es diferente: sus registros permanecen en memoria hasta que se guardan en almacenamiento. Con `volatile`, otros archivos bajo `/var/log` (incluyendo el historial de texto de APT/dpkg) desaparecen al reiniciar. `EXPORT_LOGS=true` es una exportación explícita separada al medio MiniOS. Un tmpfs de registro lleno (32 MiB) deja de aceptar nuevos registros en vez de escribir en la memoria flash. Si se habilita otro swap respaldado en disco más tarde, los archivos en memoria pueden paginarse a ese swap. Consulta [Solución de problemas](/maintenance-and-recovery/Troubleshooting#collecting-logs) para encontrar los diagnósticos de arranque.

MiniOS también utiliza `noatime` al montar sus propios datos y sistemas de archivos de contenedores, evitando actualizaciones de metadatos de tiempo de acceso; esto no vuelve a montar discos de usuario no relacionados. El estándar `relatime` ya limita dichas actualizaciones, así que mide la diferencia antes de considerarlo un ahorro importante. Mantén el journal del sistema de archivos, las barreras y `fsync` activados para un almacenamiento persistente extraíble.

Para una escritura controlada de archivo de registro de 16 MiB seguida de `sync`, una VM Testo registró 33,304 sectores escritos en su disco virtual inferior en modo persistente y 8 en modo volátil. Esto demuestra el cambio en la ruta de escritura para esa carga de trabajo. No mide escrituras internas en el controlador USB flash ni predice la vida útil del NAND. Compara cargas de trabajo idénticas de aplicaciones en el dispositivo real antes de sacar conclusiones sobre la vida útil.

## Configuración de ZRAM

Zram intercambia tiempo de CPU por capacidad de memoria comprimida y puede evitar el uso de swap respaldado por almacenamiento, que es mucho más lento. Un dispositivo zram más grande puede absorber más páginas inactivas, pero no crea RAM física; las cargas de trabajo incomprimibles siguen consumiendo memoria.
Los algoritmos de compresión equilibran el rendimiento y el uso de CPU frente a la tasa de compresión, y su disponibilidad depende del kernel. Comience con el valor predeterminado y cambie `zramsize`, `zramcomp`, o `nozram` solo para una carga de trabajo medida; consulte [Parámetros de arranque](/reference/Boot-Parameters) para los valores aceptados.

## Sistema de archivos y hardware de almacenamiento

- **Elección del dispositivo:** Un mayor rendimiento secuencial acorta la copia de módulos grandes, mientras que una baja latencia de E/S aleatoria es más importante para cargas de trabajo de escritorio persistentes.
  Mida el dispositivo y su carcasa juntos; la generación USB por sí sola no predice el rendimiento de la memoria flash o SSD.
- **Elección del sistema de archivos:** Un sistema de archivos nativo de Linux puede usar persistencia nativa sin sobrecarga de contenedor. Los sistemas de archivos multiplataforma mejoran la portabilidad, pero requieren un backend de contenedor compatible para los metadatos de Linux, añadiendo capas de mapeo y sistema de archivos. Elija según la portabilidad, necesidades de recuperación y resultados de pruebas de rendimiento.
