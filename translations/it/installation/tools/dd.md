# Utilizzo del comando `dd`

`dd` è un potente strumento da riga di comando per la copia bit a bit di dati tra file e dispositivi. Viene utilizzato principalmente per scrivere immagini ISO su unità USB, creare backup e per il recupero dati.

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporta la perdita dei dati! Controlla sempre con attenzione l’unità selezionata e salva una copia dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Preparazione

1. Identifica la tua unità USB:
   - **Linux:** `lsblk` oppure `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Smonta l’unità:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Creazione di una USB avviabile

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Sostituisci:**
- `MiniOS.iso` - percorso del tuo file ISO
- `/dev/sdX` - la tua unità USB (es. `/dev/sdb`)

## Persistenza automatica delle modifiche

Al primo avvio, MiniOS controllerà il tipo di filesystem dell’unità e selezionerà la modalità di persistenza delle modifiche più adatta. Se è disponibile spazio libero, il sistema creerà automaticamente una partizione ext4 per garantire le massime prestazioni.

### Configurazione dei parametri (per utenti avanzati)

Per una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto su partizione (predefinito, più veloce)
- `perchmode=dynfilefs` - File espandibile dinamicamente
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Spazio di archiviazione in MB per i file immagine

Dettagli in [parametri di avvio](/configuration/Boot-Parameters.md).
