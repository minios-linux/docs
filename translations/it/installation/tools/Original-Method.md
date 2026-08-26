# Metodo di installazione originale (Windows/Linux, legacy)

Questo metodo legacy di installazione di MiniOS prevede la copia diretta dei file di sistema sull’unità e l’installazione del bootloader. Si consiglia di utilizzare un metodo attuale dalla pagina [Installazione di MiniOS](/installation/Installing-MiniOS.md), a meno che non sia specificamente richiesto un layout basato su file.

**Nota:** Questo metodo funziona solo su Windows e Linux a causa dell’utilizzo del bootloader SYSLINUX.

## Importante

**Attenzione:** Questa procedura ripartiziona e formatta il dispositivo selezionato. È distruttiva per l'intero dispositivo, non solo per i file attualmente visibili. Esegui il backup dei dati importanti e verifica con precisione percorso del dispositivo, modello, capacità, partizione e punto di mount prima di eseguire `fdisk`, `mkfs` o `bootinst`. Quando possibile, scollega altri dispositivi rimovibili.

## Requisiti dell’unità

### Dimensione del drive

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni dei drive.

### Requisiti tecnici

- **File system**: FAT32, NTFS, ext2/3/4, Btrfs
- **Schema delle partizioni**: MBR
- **Avvio EFI**: Quando si utilizzano file system NTFS, exFAT o ext2/3/4, l’avvio in modalità EFI potrebbe non essere disponibile. Per il supporto EFI, si consiglia FAT32.

## Creazione di una chiavetta USB avviabile

### Passaggio 1: Prepara il drive

**Windows:**
1. Apri "Gestione disco" (`Win+R`, poi `diskmgmt.msc`)
2. Verifica il dispositivo USB tramite numero disco, modello e capacità. Non continuare se hai dubbi su uno di questi dettagli.
3. Fai clic destro sul volume e seleziona "Elimina volume"
4. Fai clic destro sullo spazio non allocato e seleziona "Nuovo volume semplice"
5. Scegli il file system: FAT32 (consigliato) o NTFS

**Linux:**

Imposta `TARGET_DISK` e `TARGET_PARTITION` solo su percorsi esatti dopo aver verificato modello e capacità del dispositivo in `lsblk`. La scrittura `fdisk` sostituisce la tabella delle partizioni sull'intero disco di destinazione. Esegui un solo comando `mkfs` per il file system desiderato.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Passaggio 2: Estrai e copia i file

**Montare l'ISO:**

*Windows:*
- Fai clic destro sul file ISO e seleziona "Monta"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copia dei file:**
1. **Trova la cartella `/minios/`** nell'ISO montata
2. **Copia l'intera cartella `/minios/`** nella root della chiavetta USB

Su Linux, la root di destinazione nell'esempio sopra è `/mnt/minios-target`. Conferma che `findmnt --mountpoint /mnt/minios-target` riporti esattamente la partizione selezionata nel Passaggio 1 prima di copiare i file.

### Passaggio 3: Installa il bootloader

Vai nella cartella `/minios/boot/syslinux/` sul drive ed esegui l'installer:

`bootinst` scrive il codice di avvio sul disco derivato dalla posizione dell'installer. Leggi [Ripristino boot](/administration/Boot-Recovery.md) prima di modificare il codice di avvio e non eseguire l'installer finché non hai verificato dispositivo e punto di mount.

**Windows:**
- Apri la chiavetta USB verificata tramite la sua lettera esatta, vai su `minios\boot\syslinux` ed esegui `bootinst.bat` **come amministratore**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Non sostituire il punto di mount con un carattere jolly. Lo script ricava il disco di destinazione dalla propria posizione e scrive il codice di avvio su quel disco.

## Risultato e persistenza

Questa procedura crea un'installazione live basata su file posizionando la struttura `minios/` e il bootloader su un file system normale. Non si tratta di una scrittura ISO grezza, di una configurazione multiboot con file ISO, né di un deployment tramite MiniOS Installer.

Il file system scelto influenza quali backend di persistenza possono funzionare, ma non abilita la persistenza né garantisce la creazione di una sessione. La persistenza viene attivata solo se una voce di avvio o una riga di comando del kernel la richiede, e l'attivazione richiede comunque uno storage scrivibile idoneo. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sulle modifiche salvate.
