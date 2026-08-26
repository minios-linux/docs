---
updated: 2026-08-26
---

# Utilizzo del comando `dd`

`dd` è un potente strumento da riga di comando per la copia bit a bit di dati tra file e dispositivi. Viene utilizzato principalmente per scrivere immagini ISO su unità USB, creare backup e per il recupero dati.

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre attentamente l’unità selezionata e fai una copia di backup dei dati importanti.

## Requisiti dell’unità

### Dimensione del drive

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni dei drive.

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

## Risultato e persistenza

`dd` esegue una scrittura raw dell'immagine: copia la struttura dell'ISO sull'intero dispositivo di destinazione. Non crea una partizione ext4 nello spazio non utilizzato, non crea una sessione di persistenza e non esegue il deployment dell'Installer di MiniOS.

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede, e richiede comunque uno storage scrivibile adatto. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sulle modifiche salvate.
