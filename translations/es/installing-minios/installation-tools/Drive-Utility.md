---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilidad de disco

Utilidad de disco es una herramienta general de discos GTK incluida con MiniOS. Permite grabar una imagen de disco existente, crear una imagen a partir de un dispositivo físico, formatear un dispositivo completo o borrarlo. No está limitada a medios de MiniOS y no reemplaza al Instalador de MiniOS.

Ábrela desde el menú de aplicaciones en **Sistema**, o ejecuta:

```bash
driveutility
```

## Seguridad

Grabar una imagen, formatear y borrar son operaciones destructivas. Verifica el destino por dispositivo, modelo y capacidad antes de confirmar. Mantén copias de seguridad de todo lo importante y desconecta unidades extraíbles no relacionadas cuando sea posible.

Los discos montados están ocultos por defecto. Puedes mostrarlos explícitamente, pero Utilidad de disco advierte antes de realizar acciones destructivas y el backend intenta desmontar el dispositivo seleccionado y sus particiones antes de modificarlo. Si el estado de montaje es ambiguo o algún sistema de archivos permanece montado, la operación falla en lugar de continuar sobre un sistema de archivos activo.

## Grabar una imagen

**Grabar** copia una imagen byte a byte en el dispositivo seleccionado. Cuando es compatible, el backend detecta automáticamente si la imagen de entrada está comprimida.

Los usos habituales incluyen grabar un ISO de MiniOS en un USB o SD, y restaurar una imagen de dispositivo completo creada previamente.
Para un ISO de MiniOS, esto es una grabación de imagen sin procesar. Copia la partición y la estructura de arranque del ISO exactamente como están en la imagen. No **no** crea una partición adicional de datos escribible, sesión de persistencia ni realiza un despliegue gestionado con el Instalador de MiniOS.

La persistencia después de una grabación sin procesar depende del modo de arranque y del almacenamiento escribible que exponga la imagen resultante. Para un diseño de destino gestionado o una sesión precreada, utiliza [Instalador de MiniOS](/installing-minios/MiniOS-Installer).

Ejemplo CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Crear una imagen de dispositivo

**Crear imagen** lee un dispositivo físico y lo guarda en un archivo de imagen. La salida puede mantenerse sin comprimir o comprimirse mientras se escribe.

Las opciones de compresión compatibles son:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) cuando se tiene instalado el soporte Python zstd necesario

La aplicación gráfica también puede asignar el archivo resultante al usuario del escritorio, de modo que una copia de seguridad creada como root sea utilizable de inmediato sin tener que cambiar la propiedad.
Ejemplo CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

La extensión específica de la compresión se añade automáticamente al usar la herramienta de línea de comandos.

## Formatear un dispositivo

**Formatear** crea una nueva estructura de un solo sistema de archivos en el dispositivo seleccionado. Las opciones de sistema de archivos disponibles son:

- FAT32
- exFAT
- NTFS
- ext4

Puedes establecer una etiqueta de volumen. Para ext4, Utilidad de disco puede asignar el directorio raíz al usuario y grupo seleccionados.

El formateo es independiente de la grabación de un ISO de MiniOS. Las opciones de sistema de archivos en esta página describen la operación de formateo de Utilidad de disco; no modifican la estructura del sistema de archivos incluida en una grabación ISO sin procesar.

Ejemplo CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Borrar un dispositivo

**Borrar** elige entre operaciones de borrado nativas del controlador, descarte/TRIM y sobrescrituras desde el host según el dispositivo seleccionado y el método solicitado.

Los backends disponibles incluyen:

- **Borrado seguro** — selecciona automáticamente un método compatible con el controlador cuando está disponible.
- **ATA Secure Erase / Enhanced Secure Erase** — se ejecuta a través de UDisks2 para discos SATA/ATA compatibles; los dispositivos congelados o no compatibles son rechazados.
- **NVMe User Data Erase / Cryptographic Erase** — utiliza NVMe Format NVM solo cuando el controlador informa de la capacidad solicitada.
- **Descartar / descarte seguro** — utiliza `blkdiscard` cuando el dispositivo de bloques admite descarte.
- **Sobrescritura con ceros** — escribe ceros desde el host.
- **Sobrescritura aleatoria** — escribe datos aleatorios la cantidad de pasadas solicitadas y puede añadir una pasada final de ceros.

El borrado seguro por controlador no es equivalente a sobrescribir repetidamente cada bloque lógico desde el host. Su disponibilidad depende del firmware del dispositivo, las interfaces del kernel, UDisks2, `nvme-cli`, y `blkdiscard` soporte.
Para dispositivos NVMe, Utilidad de disco conserva el formato LBA del espacio de nombres activo, la configuración de metadatos y la configuración de información de protección al emitir Format NVM. También rechaza operaciones de controlador cuyo alcance pueda afectar a varios espacios de nombres cuando no se puede garantizar la seguridad como operación de un solo espacio de nombres.

Ejemplos:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Utiliza los controles de número de pasadas de sobrescritura y tamaño parcial solo para los métodos tradicionales de ceros/aleatorio. El borrado por controlador y el descarte funcionan según el comando del dispositivo y no por el número de bytes desde el host.

## Herramientas de línea de comandos

Utilidad de disco instala cuatro comandos de bajo nivel:

| Comando | Propósito |
|---|---|
| `driveutility-write` | Graba una imagen sin procesar o comprimida compatible en un dispositivo de bloques. |
| `driveutility-read` | Crea una imagen sin comprimir o comprimida a partir de un dispositivo de bloques. |
| `driveutility-format` | Crea almacenamiento FAT32, exFAT, NTFS o ext4 en un dispositivo. |
| `driveutility-wipe` | Borra mediante métodos de controlador, descarte o sobrescritura. |

Todos los comandos destructivos deben ejecutarse solo después de verificar el dispositivo de destino exacto. Consulta sus páginas man instaladas y `--help` para ver las opciones específicas de la versión.

## Utilidad de disco frente al Instalador de MiniOS

Usa **Utilidad de disco** cuando la operación deseada sea una acción genérica de disco: grabar imágenes sin procesar, crear imágenes de dispositivos, formatear o borrar.

Usa **Instalador de MiniOS** cuando quieras un despliegue compatible con MiniOS, con control sobre la ubicación, opciones de sistema de archivos y arranque, selección de módulos, configuración o creación opcional de sesión en vivo.

Para otras formas de poner MiniOS en un medio, consulta [Métodos de instalación](/installing-minios/Installation-Methods). Para guardar cambios después de iniciar, consulta [Modos de arranque](/using-minios/Boot-Modes) y [Sesiones y persistencia](/using-minios/Sessions-and-Persistence).
