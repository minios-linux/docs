---
updated: 2026-08-26
---

# dd

`dd` è un'utilità da riga di comando versatile per la copia bit a bit dei dati tra file e dispositivi. È usato principalmente per scrivere immagini ISO su unità USB, creare backup e per il recupero dati.

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre attentamente l'unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Preparazione

1. Identifica la tua unità USB:
   - **Linux:** `lsblk` o `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Smonta l’unità:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Creazione di una chiavetta USB avviabile

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
- `/dev/sdX` - la tua unità USB (ad es. `/dev/sdb`)

## Risultato e persistenza

`dd` esegue una scrittura raw dell’immagine: copia la struttura ISO sull’intero dispositivo di destinazione. Non crea una partizione ext4 nello spazio non utilizzato, non avvia una sessione di persistenza e non esegue il deploy dell’Installatore MiniOS.

La persistenza viene abilitata solo se richiesta da una voce di avvio o dalla riga di comando del kernel, e richiede comunque uno spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza Initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sulle modifiche salvate.
