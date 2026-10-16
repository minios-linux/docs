---
updated: 2026-08-26
---

# dd

`dd` è un'utilità versatile da riga di comando per copiare dati bit per bit tra file e dispositivi. Si usa soprattutto per scrivere immagini ISO su unità USB, creare backup e recuperare dati.

## Importante

**Attenzione:** La selezione del dispositivo errato comporta la perdita dei dati! Ricontrolla sempre l'unità selezionata e fai il backup dei dati importanti.

## Requisiti dell'unità

### Dimensioni dell'unità

Consulta [la guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema e le dimensioni delle unità.

## Preparazione

1. Individua l'unità USB:
   - **Linux:** `lsblk` oppure `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Smonta l'unità:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Creazione di un'unità USB avviabile

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Sostituisci:**
- `MiniOS.iso` - il percorso del file ISO
- `/dev/sdX` - l'unità USB (ad es. `/dev/sdb`)

## Risultato e persistenza

`dd` esegue una scrittura dell'immagine raw: copia la struttura dell'ISO sull'intero dispositivo di destinazione. Non crea una partizione ext4 nello spazio inutilizzato, non crea una sessione di persistenza né esegue il deployment dell'Installatore MiniOS.

La persistenza è abilitata solo quando una voce di avvio o la riga di comando del kernel la richiede e necessita comunque di uno spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza Initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sulle modifiche salvate.
