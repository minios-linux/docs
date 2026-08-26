# Ripristino dell'avvio

La riparazione dell'avvio dipende da come MiniOS è stato posizionato sul dispositivo e se il firmware lo avvia in modalità BIOS o UEFI. Una procedura adatta a una configurazione può danneggiarne un'altra. Esegui il backup dei file importanti prima di scrivere un settore di avvio, modificare un flag di partizione, sostituire una struttura EFI o reinstallare GRUB. Consulta [Backup e ripristino](/administration/Backup-Recovery.md).

## Identificare il layout

- **ISO scritta raw:** `dd`, Etcher, Rufus in modalità DD o un programma di scrittura immagini simile ha copiato la struttura a blocchi dell'ISO sull'intero dispositivo. Tratta questo supporto come un'immagine, non come una normale installazione basata su file.
- **Installazione live basata su file:** il dispositivo ha un filesystem normale con una directory `minios/` che contiene moduli SquashFS e `minios/boot/`. Questo include il metodo legacy di copia file e le distribuzioni live create da MiniOS Installer.
- **Installazione nativa:** MiniOS Installer ha estratto i moduli in un filesystem root Linux convenzionale. Utilizza il GRUB e l'initramfs del sistema installato anziché la struttura di avvio live modulare.

`Ventoy` normalmente mantiene l'ISO come file sotto il proprio bootloader. Riparalo seguendo la procedura nella documentazione di `Ventoy`; non installare il settore di avvio Syslinux di MiniOS sopra di esso.

## Diagnosi senza modificare il disco

Per prima cosa, verifica se il problema si presenta prima del menu MiniOS, dopo il menu o dopo l'avvio del kernel. Controlla il menu di avvio temporaneo del firmware e annota se la voce selezionata è UEFI o BIOS legacy. Prova un'altra porta e, se possibile, avvia lo stesso dispositivo su un altro computer.

Da un supporto di recupero Linux funzionante, ispeziona senza riparare:

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

Su un sistema avviato in modalità UEFI, `sudo efibootmgr -v` può elencare le voci del firmware. La sua assenza o un errore non dimostrano che i file EFI manchino. Non formattare, ripartizionare, eseguire una riparazione del filesystem o modificare flag solo per prova. Conferma ogni dispositivo per modello e capacità e monta i filesystem in sola lettura se devi solo ispezionarli.

Se il menu di avvio appare ma MiniOS non trova i suoi moduli, modifica temporaneamente la voce di avvio e prova `from=askdisk`. Una volta individuato il filesystem corretto, un'etichetta di filesystem è più stabile di un nome come `/dev/sdb1`:

```text
from=/dev/disk/by-label/MINIOS/minios
```

L'etichetta deve esistere e identificare il filesystem previsto; le etichette dovrebbero essere univoche. Aggiungi `debug timing` per maggiori informazioni sull'avvio iniziale. Aggiungi `rd.break` solo se serve una shell initramfs per ispezioni avanzate. Queste opzioni diagnosticano la rilevazione dei moduli; non riparano il bootloader. Consulta [Parametri di avvio](/configuration/Boot-Parameters.md) e [Risoluzione dei problemi](/administration/Troubleshooting.md).

## Supporti ISO scritti raw

Non eseguire `bootinst.sh`, non installare GRUB e non copiare singoli file di avvio su un dispositivo ISO scritto raw. La sua mappa delle partizioni, i record di avvio, i file ISO e i file EFI costituiscono un'unica immagine. Se l'ISO verificata si avvia altrove ma questa copia no, conserva eventuali dati memorizzati fuori dalla struttura dell'immagine e riscrivi l'intero dispositivo da una ISO verificata. Consulta [Verifica dei download](/installation/Verifying-Downloads.md) e [Installazione di MiniOS](/installation/Installing-MiniOS.md).

Se la riscrittura della stessa immagine verificata fallisce ancora, prova un altro dispositivo e verifica la compatibilità di firmware e hardware invece di modificare ripetutamente l'immagine.

## Installazioni live basate su file

### Installer integrato su supporti MBR

L'installer integrato è adatto solo quando tutte queste condizioni sono soddisfatte:

- Il dispositivo è un'installazione live basata su file su un disco partizionato MBR.
- La directory `minios/boot/syslinux/` è completa e appartiene allo stesso albero e alla stessa release di MiniOS degli altri asset di avvio.
- Il filesystem montato e il relativo dispositivo disco intero padre sono stati identificati senza supposizioni.

Esegui lo script da quella directory sul filesystem di destinazione:

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

Lo script determina la destinazione dal filesystem che lo contiene. Installa Syslinux lì, scrive 440 byte di codice di avvio MBR sul disco padre, può modificare il flag della partizione attiva e copia la struttura UEFI integrata nel filesystem di destinazione. Un mount o dispositivo errato può rendere non avviabile un altro sistema. Non usarlo su un disco GPT o su una EFI System Partition condivisa, non copiare solo `bootinst.sh` su una struttura danneggiata ed eseguirlo, e non usare asset di una release MiniOS diversa.

Su Windows, il percorso corrispondente è:

```text
X:\minios\boot\syslinux\bootinst.bat
```

Eseguilo come amministratore solo dal dispositivo rimovibile previsto. Lo script rifiuta il disco di sistema Windows rilevato, ma questo controllo non sostituisce la verifica della lettera dell'unità e del dispositivo fisico.

### UEFI

L'avvio UEFI non utilizza il codice MBR del BIOS. Il firmware necessita di una EFI System Partition o di un filesystem FAT leggibile e di una struttura loader valida. Ripristina solo una struttura `EFI/boot` completa e corrispondente e i relativi file EFI di MiniOS dall'immagine o backup esatti usati per quell'installazione. Non combinare gli eseguibili EFI di una release con la configurazione GRUB o i file `minios/boot` di un'altra release.

L'installer integrato `bootinst.sh` copia anche la propria struttura loader UEFI corrispondente, ma esegue comunque le scritture MBR e Syslinux descritte sopra. Usalo solo per il layout MBR basato su file descritto nella sezione precedente, non come strumento generico di riparazione UEFI.

Copiare un singolo file `.efi` può lasciare una catena di avvio incompleta. Se la struttura EFI completa ed esatta non è disponibile, reinstalla il layout live basato su file invece di tentare una ricostruzione parziale. Conserva le directory di altri vendor e sistemi operativi su una EFI System Partition condivisa.

`minios-deploy` fornisce operazioni di `plan` e `install`, non una riparazione dell'avvio. Non puntare un comando di installazione su un disco esistente come tentativo di riparazione. Consulta [MiniOS Installer](/installation/MiniOS-Installer.md) per i layout di installazione supportati.

## Installazioni native

### GRUB BIOS da chroot

Usa questa procedura solo per un'installazione nativa configurata per BIOS legacy su disco MBR. Scrive GRUB sull'intero disco e può sostituire il codice di avvio usato da altri sistemi operativi. Non usarla per UEFI, GPT, layout live basato su file o ISO scritta raw.

Avvia un supporto di recupero Linux affidabile, identifica la partizione root nativa e il relativo disco padre, quindi sostituisci i percorsi reali qui sotto. In questo esempio, `/dev/sdXN` è la partizione root e `/dev/sdX` è il disco intero padre. Non passare mai una partizione come `/dev/sdX1` al comando finale `grub-install`.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Monta una partizione `/boot` nativa separata su `/mnt/boot` prima dei bind mount, poi smontala prima del comando finale `sudo umount /mnt`. Non montare una EFI System Partition per questa procedura solo BIOS. Se la root usa LUKS, LVM, RAID o una struttura non completamente compresa, fermati e usa un metodo di recupero specifico per quello stack di storage. Se `update-grub`, `grub-script-check` o `grub-install` falliscono, non continuare modificando la tabella delle partizioni o provando altri dischi.

### UEFI nativo

La ricostruzione manuale UEFI nativa non è sicura da generalizzare. Dipende dall'esatta architettura EFI, dalla catena di loader, dallo stato dei pacchetti, dalla struttura dei mount, dallo stato di Secure Boot, dal comportamento del firmware e dal fatto che la EFI System Partition sia condivisa. Una copia generica di file o un comando `grub-install` può sovrascrivere il loader di fallback di un altro sistema operativo.

È preferibile ripristinare un backup esatto e testato della root nativa, del contenuto della EFI System Partition e della configurazione di avvio. In alternativa, esegui il backup dei dati utente e reinstalla il sistema nativo con MiniOS Installer. Non adattare la procedura di copia `EFI/boot` live basata su file a un'installazione nativa.

## Rollback del kernel modulare

Per un'installazione live basata su file che ha smesso di avviarsi dopo una modifica al kernel, usa un supporto di recupero della stessa versione e architettura MiniOS. Dal menu di avvio, usa `from=askdisk` o un percorso con etichetta stabile per selezionare l'albero `minios/` installato. Se questa combinazione avvia correttamente il sistema e l'albero installato è scrivibile, ispeziona i set kernel coordinati e attiva quello funzionante:

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

L'attivazione deve ripristinare un modulo kernel coordinato, l'immagine del kernel, l'initramfs e la configurazione del bootloader. Non sostituire solo `vmlinuz`, solo l'initramfs o solo `01-kernel*.sb`. Mantieni il kernel precedente finché il nuovo non si avvia correttamente. Consulta [Gestione kernel](/administration/Kernel-Management.md).

Questo rollback è per installazioni live modulari. Le installazioni native usano i propri pacchetti kernel e GRUB e richiedono un recupero o reinstallazione nativa.

## Quando reinstallare

Esegui il backup dei dati recuperabili e reinstalla invece di tentare la riparazione se si verifica una di queste condizioni:

- Un ISO scritta raw è corrotta o è stata modificata parzialmente.
- Non sono disponibili asset Syslinux, GRUB, kernel, initramfs o EFI completi e corrispondenti.
- La tabella delle partizioni, il filesystem o la EFI System Partition sono danneggiati oltre al bootloader.
- Il disco di destinazione o il dispositivo padre non possono essere identificati con certezza.
- Una catena di avvio UEFI nativa dovrebbe essere ricostruita senza un backup esatto.
- Errori di lettura ripetuti, disconnessioni o errori SMART indicano un supporto in avaria.
- Un comando di riparazione fallisce e il passo successivo richiederebbe ipotesi o la sovrascrittura di dati di avvio non correlati.

La reinstallazione ripristina una struttura di avvio coordinata nota; non recupera dati utente o persistenza non salvati. Copia prima i dati importanti ogni volta che il filesystem è ancora leggibile.
