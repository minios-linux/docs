---
updated: 2026-08-31
---

# Risoluzione dei problemi

Inizia con l’osservazione e test reversibili. Non ripartizionare, formattare, riparare un filesystem, eliminare una sessione o sostituire i file di avvio solo per vedere se il problema si risolve. Prima di tutto, salva i dati importanti.

## Prime verifiche

1. [Verifica l’immagine scaricata](/installing-minios/Verifying-Downloads).
2. Avvia **Avvia senza salvare**. Se il problema scompare, indaga sulla sessione persistente o sulla sua configurazione invece che sull’immagine di base.
3. Rimuovi parametri di avvio personalizzati e filtri dei moduli, a meno che non siano necessari per riprodurre il problema.
4. Prova un’altra porta USB e, se possibile, un altro dispositivo o computer funzionante.
5. Annota il primo errore e la voce esatta del menu di avvio invece dell’ultimo messaggio visualizzato sullo schermo.
6. Controlla la [Compatibilità hardware](/getting-started/Hardware-Compatibility) se la stessa immagine verificata fallisce su una macchina ma funziona su un’altra.

## Il dispositivo non raggiunge il menu di avvio MiniOS

Per prima cosa, determina come è stato creato il dispositivo MiniOS.

- Per un'immagine scritta in modalità raw (`dd`, Etcher, modalità DD di Rufus o scrittura immagine tramite Utilità disco), non riparare i singoli file di avvio. Se la copia è danneggiata, riscrivi l'intero dispositivo partendo da un'immagine verificata.
- Per un'installazione basata su file MiniOS, ricrea la struttura avviabile utilizzando lo stesso metodo di installazione documentato, invece di copiare file GRUB, Syslinux o EFI da un'altra release.
- Ventoy ha il proprio bootloader e layout. Non installare il bootloader MiniOS sopra un dispositivo Ventoy; utilizza invece la procedura [Ventoy](/installing-minios/installation-tools/Ventoy).
- Dopo la conversione nativa, il sistema di destinazione utilizza un bootloader Debian convenzionale e la struttura del filesystem standard. Può mantenere l'aspetto desktop MiniOS, ma l'infrastruttura live e gli strumenti specifici live di MiniOS non sono più presenti. Esegui il backup dei dati recuperabili prima di utilizzare la procedura di riparazione o reinstallazione del bootloader Debian adatta al BIOS/UEFI e alla struttura delle partizioni.

Se un dispositivo appena ricreato ancora non compare nel menu di avvio del firmware, controlla la modalità firmware, il supporto Secure Boot dell'architettura selezionata, la porta/dispositivo USB e la [compatibilità hardware](/getting-started/Hardware-Compatibility).

## Il menu di avvio MiniOS compare ma l’avvio fallisce

Rimuovi prima i parametri opzionali. Usa `debug` e `timing` se serve più output nelle prime fasi di avvio. `rd.break` è destinato all’ispezione avanzata dell’initramfs, non alla riparazione.

Se MiniOS non trova la propria origine, consulta [Rilevamento del sistema](/reference/boot-process/System-Discovery). In una shell initramfs, informazioni utili in sola lettura includono:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporaneo può aiutare a identificare il dispositivo che contiene effettivamente i dati MiniOS. Successivamente, usa la sintassi documentata `from=` invece di indovinare i nomi dei dispositivi.

Per avvio PXE o ISO via HTTP, vedi [Avvio da rete](/reference/boot-process/Network-Boot). La rete nelle prime fasi di avvio è separata da NetworkManager nella sessione in esecuzione.

### Errori di modulo o root-union

Consulta [Caricamento moduli](/reference/boot-process/Module-Loading) per le regole effettive di selezione e ordinamento dei moduli. In particolare:

- `load=` e `noload=` possono escludere moduli base o del kernel essenziali; `noload=` prevale quando entrambi corrispondono;
- i candidati con lo stesso basename occupano lo stesso slot di sostituzione;
- un nome file `.sb` non prova che il file sia una vera immagine SquashFS;
- il kernel in esecuzione deve corrispondere al modulo kernel MiniOS e ai file di avvio coordinati.

Dopo un avvio riuscito, ispeziona lo stato attuale senza modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemi di visualizzazione

Per schermo nero, risoluzione inutilizzabile o loop del display manager:

1. Prova il parametro di avvio `text`. Una console funzionante permette di distinguere un problema grafico/desktop da un errore precedente nell’avvio.
2. Rimuovi eventuali parametri `xorg-driver` o `xorg-resolution` specificati manualmente.
3. Prova **Avvia senza salvare** per escludere la configurazione persistente dello schermo.
4. Annota la GPU e il driver con `lspci -nnk`.
5. Ispeziona `journalctl -b -p warning` e `dmesg --level=err,warn`.

Per le macchine virtuali, vedi [Virtualizzazione](/maintenance-and-recovery/Virtualization).

## Problemi di rete

Le normali connessioni cablate e Wi-Fi sono gestite tramite NetworkManager; vedi [Rete](/using-minios/Networking).

Per prima cosa verifica se l’interfaccia esiste:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Se nessuna interfaccia è presente, annota `lspci -nnk` o `lsusb` e cerca errori di firmware o driver in `dmesg`.
- Se l’interfaccia esiste ma non ha indirizzo, distingui problemi di connessione/DHCP da mancanza di supporto hardware.
- Se un indirizzo è presente, testa il gateway, poi un indirizzo IP, poi un nome DNS per separare problemi di collegamento, routing e DNS.
- Il parametro di avvio `ip=` riguarda l’avvio di rete iniziale e non configura una connessione persistente di NetworkManager. Consulta [Avvio da rete](/reference/boot-process/Network-Boot).

## Problemi di persistenza

Avvia **Avvia senza salvare** prima di modificare uno store di persistenza sospetto. Non riparare o eliminare l’unica copia di una sessione mentre è attiva.

Ispeziona ciò che MiniOS vede attualmente:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Controlla la modalità di avvio selezionata, lo spazio scrivibile disponibile, la compatibilità del filesystem e la compatibilità della sessione. Le regole dettagliate di selezione sono in [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) e [Interni della persistenza](/reference/boot-process/Persistence-Internals).

Se una sessione `native`, `dynfilefs`, `raw` o `luks` importante ma non in esecuzione è ancora leggibile, esportala **prima** di sperimentare con lo storage:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se Session Manager non riesce a leggere o esportare la sessione, interrompi la scrittura sulla sorgente e salva una copia offline dello storage coinvolto prima di ulteriori interventi. MiniOS non definisce una procedura manuale universale per ricostruire segmenti DynFileFS, riparare un filesystem interno o ricostruire i metadati di una sessione. Tali recuperi sono specifici per filesystem/contenitore e dovrebbero essere tentati solo su una copia quando il valore dei dati lo giustifica.

Consulta [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) per i flussi di lavoro supportati di backup e importazione sessioni.

## Problemi di archiviazione e spazio libero

Ispeziona dispositivi e mount senza modificarli:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un filesystem pieno può causare errori nelle operazioni sui pacchetti, salvataggi di sessione incompleti e altri errori secondari. Libera spazio spostando o eliminando solo dati noti dopo aver confermato il filesystem corretto. Usa il Gestore sessioni MiniOS per eliminare le sessioni invece di rimuovere manualmente le directory delle sessioni numerate.

La riparazione del filesystem non è un'operazione MiniOS generica. Se il filesystem stesso è danneggiato, smontalo, salva prima i dati importanti o un'immagine e utilizza una procedura di riparazione appropriata per quel filesystem e dispositivo di archiviazione.

## Modifiche ai pacchetti e aggiornamenti di sistema

Se i problemi sono iniziati dopo modifiche ai pacchetti APT, ricorda che una sessione live persistente può sovrascrivere file dei moduli MiniOS in sola lettura. Prova **Avvia senza salvare** per confrontare con il set di moduli originale. Consulta [Aggiornamento di MiniOS](/maintenance-and-recovery/Updating-MiniOS) per la distinzione tra manutenzione APT e cambio di release MiniOS.

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

Per errori di avvio ripetuti su supporti scrivibili MiniOS, `EXPORT_LOGS=true` in `config.conf` esporta i log di avvio sotto `minios/log/`. Consulta [config.conf](/reference/configuration/config.conf).

Rimuovi credenziali, chiavi private, password Wi-Fi e altre informazioni riservate prima di condividere i log. Per un difetto riproducibile, includi gli estratti rilevanti e apri una segnalazione nel [tracker delle issue di MiniOS](https://github.com/minios-linux/minios-live/issues).
