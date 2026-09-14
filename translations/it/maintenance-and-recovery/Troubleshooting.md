---
updated: 2026-09-13
---

# Risoluzione dei problemi

Inizia con l’osservazione e test reversibili. Non ripartizionare, formattare, riparare un file system, eliminare una sessione o sostituire file di avvio solo per vedere se il problema si risolve. Prima di tutto, salva i dati importanti.

## Prime verifiche

1. [Verifica l'immagine scaricata](/installing-minios/Verifying-Downloads).
2. Avvia **Avvia senza salvare**. Se il problema scompare, controlla la sessione persistente o la sua configurazione invece dell'immagine di base.
3. Rimuovi i parametri di avvio personalizzati e i filtri dei moduli, a meno che non siano necessari per riprodurre il problema.
4. Prova un'altra porta USB e, se possibile, un altro dispositivo o computer funzionante.
5. Annota il primo errore e la voce esatta del menu di avvio invece dell'ultimo messaggio visualizzato a schermo.
6. Controlla [Compatibilità hardware](/getting-started/Hardware-Compatibility) quando la stessa immagine verificata fallisce su una macchina ma funziona su un'altra.

## Il dispositivo non raggiunge il menu di avvio MiniOS

Per prima cosa determina come è stato creato il dispositivo MiniOS.

- Per un'immagine scritta direttamente (`dd`, Etcher, modalità DD di Rufus, o scrittura immagine con Utilità disco), non riparare i singoli file di avvio. Se la copia è danneggiata, riscrivi l'intero dispositivo partendo da un'immagine verificata.
- Per un'installazione MiniOS basata su file, ricrea la struttura avviabile utilizzando lo stesso metodo di installazione documentato invece di copiare file GRUB, Syslinux o EFI da un'altra versione.
- Ventoy ha un proprio bootloader e una propria struttura. Non installare il bootloader MiniOS sopra un dispositivo Ventoy; utilizza la [procedura Ventoy](/installing-minios/installation-tools/Ventoy) invece.
- Dopo la conversione nativa, il sistema di destinazione utilizza un bootloader e una struttura filesystem convenzionali di Debian. Può mantenere l'aspetto desktop MiniOS, ma l'infrastruttura live e gli strumenti specifici live di MiniOS non saranno più presenti. Esegui il backup dei dati recuperabili prima di utilizzare la procedura di riparazione o reinstallazione del bootloader Debian adatta al BIOS/UEFI e alla struttura delle partizioni.

Se un dispositivo appena ricreato ancora non compare nel menu di avvio del firmware, controlla la modalità firmware, il supporto Secure Boot dell'architettura selezionata, la porta/dispositivo USB e la [compatibilità hardware](/getting-started/Hardware-Compatibility).

## Il menu di avvio MiniOS appare, ma l'avvio non riesce

Rimuovi prima i parametri opzionali. Usa `debug` e `timing` quando serve un output più dettagliato nella fase iniziale di avvio. `rd.break` è pensato per l'ispezione avanzata di initramfs, non per la riparazione.

Se MiniOS non riesce a trovare la propria origine, vedi [Rilevamento sistema](/reference/boot-process/System-Discovery). In una shell initramfs, le informazioni utili in sola lettura includono:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Una `from=askdisk` temporanea può aiutare a identificare il dispositivo che contiene effettivamente i dati MiniOS. Successivamente, utilizza la sintassi documentata `from=` invece di indovinare i nomi dei dispositivi.

Per l'avvio tramite PXE o ISO HTTP, consulta [Avvio da rete](/reference/boot-process/Network-Boot). La rete in fase di avvio è separata da NetworkManager nella sessione in esecuzione.

### Errori del modulo o dell'unione root

Vedi [Caricamento modulo](/reference/boot-process/Module-Loading) per le regole effettive di selezione e ordinamento dei moduli. In particolare:

- `load=` e `noload=` possono escludere moduli base o kernel essenziali; `noload=` prevale quando entrambi corrispondono;
- i candidati con lo stesso nome base occupano lo stesso slot di sostituzione;
- un file `.sb` non garantisce che il file sia una vera immagine SquashFS;
- il kernel in esecuzione deve corrispondere al modulo kernel e ai file di avvio coordinati MiniOS.

Dopo un avvio riuscito, controlla lo stato effettivo senza modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemi di visualizzazione

Per schermo nero, risoluzione inutilizzabile o ciclo del display manager:

1. Prova il parametro di avvio `text`. Una console funzionante permette di distinguere un problema grafico/desktop da un errore di avvio precedente.
2. Rimuovi i parametri `xorg-driver` o `xorg-resolution` specificati manualmente.
3. Prova **Avvia senza salvare** per escludere una configurazione video persistente.
4. Annota la GPU e il driver con `lspci -nnk`.
5. Controlla `journalctl -b -p warning` e `dmesg --level=err,warn`.

Per le macchine virtuali, vedi [Virtualizzazione](/maintenance-and-recovery/Virtualization).

## Problemi di rete

Le connessioni cablate e Wi-Fi standard sono gestite tramite NetworkManager; vedi [Rete](/using-minios/Networking).

Per prima cosa verifica se l’interfaccia esiste:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Se l’interfaccia non esiste, annota `lspci -nnk` o `lsusb` e controlla eventuali errori di firmware o driver in `dmesg`.
- Se l’interfaccia esiste ma non ha un indirizzo, distingui tra problemi di connessione/DHCP e mancanza del supporto hardware.
- Se l’indirizzo è presente, testa prima il gateway, poi un indirizzo IP, quindi un nome DNS per individuare errori di collegamento, routing o DNS.
- Il parametro di boot `ip=` è relativo all’avvio di rete anticipato e non configura una connessione persistente in NetworkManager. Consulta [Avvio da rete](/reference/boot-process/Network-Boot).

## Problemi di persistenza

Avvio **Avvia senza salvare** prima di modificare un archivio di persistenza sospetto. Non riparare o eliminare l'unica copia di una sessione mentre è attiva.

Verifica cosa vede attualmente MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Controlla la modalità di avvio selezionata, lo spazio scrivibile disponibile, la compatibilità del filesystem e la compatibilità della sessione. Le regole dettagliate di selezione sono in [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) e [Interni della persistenza](/reference/boot-process/Persistence-Internals).

Se una sessione importante non in esecuzione `native`, `dynfilefs`, `dynblk`, `raw`, o `luks` è ancora leggibile, esportala **prima di** sperimentare con lo storage:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se Session Manager non riesce a leggere o esportare la sessione, interrompi la scrittura sulla sorgente e conserva una copia offline dello storage interessato prima di procedere. Per una sessione dynblk scollegata, `dynblk inspect /path/to/volume000.db` e `dynblk check /path/to/volume000.db` forniscono diagnostica in sola lettura del formato; non eseguirli su un volume ancora collegato. MiniOS non definisce una procedura manuale universale per ricostruire segmenti DynFileFS, ricostruire parti di supporto dynblk, riparare un filesystem interno o ricostruire i metadati di una sessione. Questo tipo di recupero è specifico per filesystem/container e dovrebbe essere tentato solo su una copia quando il valore dei dati lo giustifica.

Vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) per i flussi di lavoro supportati di backup e importazione sessione.

## Problemi di spazio di archiviazione e spazio libero

Controlla dispositivi e mount senza modificarli:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un filesystem pieno può causare errori nelle operazioni sui pacchetti, salvataggi di sessione incompleti e altri errori secondari. Libera spazio spostando o eliminando solo dati noti, dopo aver verificato il filesystem corretto. Per eliminare sessioni, usa Gestore sessioni MiniOS invece di rimuovere manualmente le cartelle delle sessioni numerate.

La riparazione del filesystem non è un'operazione generica di MiniOS. Se il filesystem è danneggiato, smontalo, salva prima i dati importanti o un'immagine, e utilizza una procedura di riparazione adatta a quel filesystem e al dispositivo di archiviazione.

## Modifiche ai pacchetti e aggiornamenti di sistema

Se i problemi sono iniziati dopo modifiche ai pacchetti APT, ricorda che una sessione persistente live può sovrascrivere i file dei moduli MiniOS in sola lettura. Prova **Avvia senza salvare** per confrontare con il set originale di moduli. Consulta [Aggiornamento di MiniOS](/maintenance-and-recovery/Updating-MiniOS) per la differenza tra manutenzione APT e il cambio delle release di MiniOS.

## Raccolta dei log

Informazioni utili includono:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Per errori di avvio ripetuti su supporti MiniOS scrivibili, `EXPORT_LOGS=true` in `config.conf` esporta i log di avvio in `minios/log/`. Vedi [config.conf](/reference/configuration/config.conf).

Rimuovi credenziali, chiavi private, password Wi-Fi e altre informazioni riservate prima di condividere i log. Per un difetto riproducibile, includi gli estratti rilevanti e apri una segnalazione nel [tracker delle segnalazioni MiniOS](https://github.com/minios-linux/minios-live/issues).
