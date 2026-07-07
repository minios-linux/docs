# Installazione di MiniOS

Questa guida descrive i diversi modi per installare MiniOS su dispositivi di archiviazione.

## 1. Scarica il file ISO di MiniOS

- Scarica il file ISO di MiniOS dal sito ufficiale.

## 2. Crea un'unità avviabile

Scegli uno dei seguenti metodi:

- [Metodo originale](/installation/tools/Original-Method.md)
- [Utilizzando Rufus](/installation/tools/Rufus.md) (Windows) (Consigliato)
- [Utilizzando UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [Utilizzando Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Consigliato)
- [Utilizzando Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Consigliato)
- [Utilizzando `dd`](/installation/tools/dd.md) (Linux/MacOS) (Consigliato)
- [Utilizzando Drive Utility](/installation/tools/Drive-Utility.md) (Linux) (Consigliato)
- [Utilizzando MiniOS Installer](/installation/MiniOS-Installer.md) (Consigliato, solo MiniOS)

## 3. Avvio dall'unità

1.  Riavvia il computer.
2.  Seleziona l'unità avviabile dal menu di avvio del computer per eseguire l'avvio.

## 4. Note

- Il boot installer non supporta il multiboot; solo MiniOS sarà avviabile dall'unità.
- Il disco deve utilizzare lo schema di partizionamento `msdos` (usa MBR, non GPT).
- L'unità deve essere formattata con uno dei file system supportati: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Promemoria:** Il metodo di installazione originale non è più quello principale consigliato, poiché può risultare difficile per utenti alle prime armi. Utilizzando Balena Etcher, `dd` o Drive Utility, la partizione per il salvataggio delle modifiche verrà creata automaticamente.
