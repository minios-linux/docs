---
updated: 2026-08-31
---

# Installazione manuale da file

Questo metodo di installazione MiniOS copia i file di sistema su un normale file system e installa il bootloader al suo interno, anziché scrivere l’ISO blocco per blocco.
Lo spazio rimanente sul file system resta disponibile per i normali file, così il dispositivo può continuare a essere usato come una normale unità USB e come dispositivo di avvio MiniOS.

Questo metodo è particolarmente utile se vuoi accedere direttamente ai file MiniOS, archiviare dati normalmente sulla stessa partizione o usare una configurazione scrivibile per le sessioni persistenti. Utilizza il bootloader SYSLINUX ed è pensato per Windows e Linux.

## Importante

**Attenzione:** Questa procedura ripartiziona e formatta il dispositivo selezionato. L’intero dispositivo verrà cancellato, non solo i file attualmente visibili. Esegui il backup dei dati importanti e verifica il percorso esatto del dispositivo, il modello, la capacità, la partizione e il punto di mount prima di eseguire `fdisk`, `mkfs`, oppure `bootinst`. Se possibile, scollega le altre unità rimovibili.

## Requisiti dell’unità

### Dimensioni dell’unità

Consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema e le dimensioni delle unità.

### Requisiti tecnici

- **File system**: FAT32, NTFS, ext2/3/4, Btrfs
- **Schema di partizionamento**: MBR
- **Avvio EFI**: usando i file system NTFS, exFAT o ext2/3/4, l'avvio in modalità EFI potrebbe non essere disponibile. Per il supporto EFI, si consiglia FAT32.

## Creare un'unità USB avviabile

### Passaggio 1: preparare l'unità

**Windows:**
1. Apri "Gestione disco" (`Win+R`, quindi `diskmgmt.msc`)
2. Verifica che il dispositivo USB corrisponda controllando numero del disco, modello e capacità. Se hai dubbi su uno di questi dati, non procedere.
3. Fai clic con il pulsante destro del mouse sul volume e seleziona "Elimina volume"
4. Fai clic con il pulsante destro del mouse sullo spazio non allocato e seleziona "Nuovo volume semplice"
5. Scegli il file system: FAT32 (consigliato) o NTFS

**Linux:**

Imposta `TARGET_DISK` e `TARGET_PARTITION` solo sui percorsi esatti, dopo aver verificato il modello e la capacità del dispositivo in `lsblk`. La `fdisk` scrittura sostituisce la tabella delle partizioni dell'intero disco di destinazione. Esegui un solo comando `mkfs` per il file system desiderato.

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

### Passaggio 2: estrarre e copiare i file

**Montare l'immagine ISO:**

*Windows:*
- Fai clic con il pulsante destro del mouse sul file ISO e seleziona "Monta"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copiare i file:**
1. **Individua la cartella `/minios/`** nell'immagine ISO montata
2. **Copia l'intera cartella `/minios/`** nella directory principale dell'unità USB

Su Linux, la directory principale di destinazione nell'esempio precedente è `/mnt/minios-target`. Prima di copiare i file, verifica che `findmnt --mountpoint /mnt/minios-target` indichi la partizione esatta selezionata nel passaggio 1.

### Passaggio 3: installare il bootloader

Apri la cartella `/minios/boot/syslinux/` sull'unità ed esegui il programma di installazione:

`bootinst` scrive il codice di avvio sul disco individuato in base alla posizione del programma di installazione. Leggi la sezione [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting) prima di modificare il codice di avvio e non eseguire il programma di installazione finché non hai verificato il dispositivo e il punto di mount.

**Windows:**
- Apri l'unità USB verificata usando la lettera esatta, quindi vai a `minios\boot\syslinux` ed esegui `bootinst.bat` **come amministratore**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Non sostituire il punto di mount con un carattere jolly. Lo script individua il disco di destinazione in base alla propria posizione e vi scrive il codice di avvio.

## Risultato e persistenza

Questa procedura crea un'installazione live basata su file, posizionando l'albero `minios/` e il bootloader su un normale filesystem. Non si tratta della scrittura di un'immagine ISO grezza, di una configurazione multiboot basata su file ISO né di una distribuzione tramite Installatore MiniOS.

Il filesystem scelto influisce sui backend di persistenza compatibili, ma non abilita la persistenza né garantisce la creazione di una sessione. La persistenza viene abilitata solo quando una voce di avvio o la riga di comando del kernel la richiede; per attivarla è comunque necessario disporre di spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sulle modifiche salvate.
