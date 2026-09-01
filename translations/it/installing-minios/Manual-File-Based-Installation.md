---
updated: 2026-08-31
---

# Installazione manuale basata su file

Questo metodo di installazione MiniOS copia i file di sistema su un filesystem normale e installa il bootloader lì, invece di scrivere l'ISO blocco per blocco.
Lo spazio rimanente sul filesystem rimane disponibile per i file ordinari, quindi il dispositivo può continuare a essere utilizzato sia come una normale chiavetta USB sia come dispositivo di avvio MiniOS.

Questo metodo è particolarmente utile quando si desidera un accesso diretto ai file MiniOS, l'archiviazione normale dei dati sulla stessa partizione o una struttura scrivibile per sessioni persistenti. Utilizza il bootloader SYSLINUX ed è pensato per Windows e Linux.

## Importante

**Attenzione:** Questa procedura ripartiziona e formatta il dispositivo selezionato. È distruttiva per l’intero dispositivo, non solo per i file attualmente visibili. Esegui il backup dei dati importanti e verifica con precisione percorso del dispositivo, modello, capacità, partizione e punto di mount prima di eseguire `fdisk`, `mkfs` o `bootinst`. Scollega altri dispositivi rimovibili quando possibile.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema dettagliati e le dimensioni delle unità.

### Requisiti tecnici

- **File system**: FAT32, NTFS, ext2/3/4, Btrfs
- **Schema di partizionamento**: MBR
- **Avvio EFI**: Quando si utilizzano file system NTFS, exFAT o ext2/3/4, l’avvio in modalità EFI potrebbe non essere disponibile. Per il supporto EFI, è consigliato FAT32.

## Creazione di una chiavetta USB avviabile

### Passaggio 1: Prepara l’unità

**Windows:**
1. Apri "Gestione disco" (`Win+R`, poi `diskmgmt.msc`)
2. Verifica il dispositivo USB tramite numero disco, modello e capacità. Non continuare se qualche dettaglio è incerto.
3. Fai clic destro sul volume e seleziona "Elimina volume"
4. Fai clic destro sullo spazio non allocato e seleziona "Nuovo volume semplice"
5. Scegli file system: FAT32 (consigliato) o NTFS

**Linux:**

Imposta `TARGET_DISK` e `TARGET_PARTITION` solo su percorsi esatti dopo aver verificato modello e capacità del dispositivo in `lsblk`. La scrittura `fdisk` sostituisce la tabella delle partizioni sull’intero disco di destinazione. Esegui solo un comando `mkfs` per il file system desiderato.

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

**Montaggio ISO:**

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
1. **Trova la cartella `/minios/`** nell’ISO montata
2. **Copia l’intera cartella `/minios/`** nella root della chiavetta USB

Su Linux, la root di destinazione nell’esempio sopra è `/mnt/minios-target`. Conferma che `findmnt --mountpoint /mnt/minios-target` riporti esattamente la partizione selezionata nel Passaggio 1 prima di copiare i file.

### Passaggio 3: Installa il bootloader

Vai nella cartella `/minios/boot/syslinux/` sull’unità e avvia l’installer:

`bootinst` scrive il codice di avvio sul disco derivando la posizione dall’installer. Leggi la sezione [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting) prima di modificare il codice di avvio e non eseguire l’installer finché non hai verificato dispositivo e punto di mount.

**Windows:**
- Apri la chiavetta USB verificata tramite la lettera esatta dell’unità, vai su `minios\boot\syslinux` ed esegui `bootinst.bat` **come amministratore**.

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

Questa procedura crea un’installazione live basata su file posizionando la struttura `minios/` e il bootloader su un filesystem normale. Non si tratta di una scrittura raw di un ISO, di una configurazione multiboot con file ISO, né di un deployment tramite MiniOS.

Il filesystem scelto influisce su quali backend di persistenza possono funzionare, ma non abilita la persistenza né garantisce che venga creata una sessione. La persistenza viene abilitata solo quando una voce di boot o una riga di comando del kernel la richiede, e l’attivazione richiede comunque uno storage scrivibile adatto. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza Initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sulle modifiche salvate.
