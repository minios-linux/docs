# Metodo di Installazione Originale (Windows/Linux)

Il metodo di installazione originale di MiniOS prevede la copia diretta dei file di sistema sull’unità e l’installazione del bootloader. Questo metodo offre la massima flessibilità di configurazione e compatibilità con diversi tipi di supporti.

⚠️ **Nota**: Questo metodo funziona solo su Windows e Linux a causa dell’utilizzo del bootloader SYSLINUX.

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre con attenzione l’unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell’Unità

### Dimensione dell’Unità

Consulta la [Guida alla Compatibilità Hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

### Requisiti Tecnici

- **File system**: FAT32, NTFS, ext2/3/4, Btrfs
- **Schema di partizionamento**: MBR
- ⚠️ **Avvio EFI**: Quando si utilizzano file system NTFS, exFAT o ext2/3/4, l’avvio in modalità EFI potrebbe non essere disponibile. Per il supporto EFI, si consiglia FAT32.

## Creazione di una Chiavetta USB Avviabile

### Passaggio 1: Preparare l’Unità

**Windows:**
1. Apri "Gestione Disco" (`Win+R` → `diskmgmt.msc`)
2. Trova la chiavetta USB → clic destro → "Elimina volume"
3. Clic destro sullo spazio non allocato → "Nuovo volume semplice"
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

### Passaggio 2: Estrai e Copia i File

**Montaggio ISO:**

*Windows:*
- Clic destro sul file ISO → "Monta"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copia dei File:**
1. **Trova la cartella `/minios/`** nell’ISO montata
2. **Copia l’intera cartella `/minios/`** nella root della chiavetta USB

### Passaggio 3: Installa il Bootloader

Vai nella cartella `/minios/boot/` sull’unità e avvia l’installer:

**Windows:**
- Esegui `bootinst.bat` **come amministratore**

**Linux:**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Persistenza Automatica delle Modifiche

Al primo avvio, MiniOS controllerà il tipo di file system dell’unità e tenterà di utilizzare la modalità di persistenza delle modifiche più ottimale:

- **ext2/3/4, Btrfs**: tenta di usare la modalità `native` (salvataggio diretto)
- **FAT32/NTFS**: utilizza la modalità `dynfilefs` (file dinamico)
- Quando la modalità native non è disponibile, passa automaticamente a dynfilefs

### Configurazione Parametri (per Utenti Avanzati)

Quando è necessaria una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto sulla partizione (per ext4)
- `perchmode=dynfilefs` - File espandibile dinamicamente
- `perchmode=raw` - File a dimensione fissa  
- `perchsize=8000` - Dimensione dello spazio dati in MB

Dettagli nei [parametri di avvio](/configuration/Boot-Parameters.md).
