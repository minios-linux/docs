# Metodo di installazione originale (Windows/Linux, legacy)

Questo metodo legacy di installazione di MiniOS prevede la copia diretta dei file di sistema sull’unità e l’installazione del bootloader. Si consiglia di utilizzare un metodo attuale dalla pagina [Installazione di MiniOS](/installation/Installing-MiniOS.md), a meno che non sia specificamente richiesto un layout basato su file.

**Nota:** Questo metodo funziona solo su Windows e Linux a causa dell’utilizzo del bootloader SYSLINUX.

## Importante

**Attenzione:** Una selezione errata del dispositivo comporta la perdita dei dati. Controlla sempre con attenzione l’unità selezionata ed esegui un backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

### Requisiti tecnici

- **File system**: FAT32, NTFS, ext2/3/4, Btrfs
- **Schema delle partizioni**: MBR
- **Avvio EFI**: Quando si utilizzano file system NTFS, exFAT o ext2/3/4, l’avvio in modalità EFI potrebbe non essere disponibile. Per il supporto EFI, si consiglia FAT32.

## Creazione di una chiavetta USB avviabile

### Passo 1: Preparare l’unità

**Windows:**
1. Apri "Gestione disco" (`Win+R`, poi `diskmgmt.msc`)
2. Trova la chiavetta USB, fai clic con il tasto destro e seleziona "Elimina volume"
3. Fai clic con il tasto destro sullo spazio non allocato e seleziona "Nuovo volume semplice"
4. Scegli il file system: FAT32 (consigliato) oppure NTFS

**Linux:**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Passo 2: Estrazione e copia dei file

**Montaggio ISO:**

*Windows:*
- Fai clic con il tasto destro sul file ISO e seleziona "Monta"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copia dei file:**
1. **Trova la cartella `/minios/`** nell’ISO montata
2. **Copia l’intera cartella `/minios/`** nella root della chiavetta USB

### Passaggio 3: Installa il bootloader

Vai nella cartella `/minios/boot/syslinux/` sull'unità e avvia l'installer:

**Windows:**
- Esegui `bootinst.bat` **come amministratore**

**Linux:**
```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_MOUNT="/media/$USER/MINIOS"
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Sostituisci `MINIOS` con la directory di mount esatta verificata con `lsblk`. Non
usare caratteri jolly: lo script rileva il disco di destinazione dalla propria posizione e
scrive il codice di avvio su quel disco.

## Persistenza automatica delle modifiche

Al primo avvio, MiniOS rileverà il tipo di file system dell’unità e tenterà di utilizzare la modalità di persistenza delle modifiche più ottimale:

- **ext2/3/4, Btrfs**: tenta di usare la modalità `native` (salvataggio diretto)
- **FAT32/NTFS**: utilizza la modalità `dynfilefs` (file dinamico)
- Quando la modalità nativa non è disponibile, passa automaticamente a dynfilefs

### Configurazione dei parametri per utenti avanzati

Quando è necessaria una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto sulla partizione (per ext4)
- `perchmode=dynfilefs` - File espandibile dinamicamente
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Dimensione dello spazio di archiviazione dati in MB

Dettagli nei [parametri di avvio](/configuration/Boot-Parameters.md).
