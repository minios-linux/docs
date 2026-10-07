---
updated: 2026-10-06
---

# Risoluzione dei problemi

Inizia con l'osservazione e test reversibili. Non ripartizionare, formattare, riparare un filesystem, eliminare una sessione o sostituire i file di avvio solo per vedere se il problema si risolve. Prima di tutto, salva i dati importanti.

## Verifiche iniziali

1. [Verifica l'immagine scaricata](/installing-minios/Verifying-Downloads).
2. Avvia **Avviare senza salvare**. Se il problema scompare, indaga sulla sessione persistente o sulla sua configurazione invece che sull'immagine di base.
3. Rimuovi parametri di avvio personalizzati e filtri dei moduli a meno che non siano necessari per riprodurre il problema.
4. Prova un'altra porta USB e, se possibile, un altro dispositivo o computer funzionante.
5. Annota il primo errore e la voce esatta del menu di avvio invece dell'ultimo messaggio visualizzato.
6. Verifica [Compatibilità hardware](/getting-started/Hardware-Compatibility) quando la stessa immagine verificata fallisce su una macchina ma funziona su un'altra.

## Il dispositivo non raggiunge il menu di avvio MiniOS

Per prima cosa determina come è stato creato il dispositivo MiniOS.

- Per un'immagine scritta in modalità raw (`dd`, Etcher, modalità DD di Rufus o scrittura immagine con Utilità disco), non riparare i singoli file di avvio. Se la copia è danneggiata, riscrivi l'intero dispositivo da un'immagine verificata.
- Per un'installazione MiniOS basata su file, ricrea la struttura avviabile utilizzando lo stesso metodo di installazione documentato invece di copiare file GRUB, Syslinux o EFI da un'altra release.
- Ventoy ha un proprio bootloader e layout. Non installare il bootloader MiniOS su un dispositivo Ventoy; usa la procedura [Ventoy](/installing-minios/installation-tools/Ventoy) invece.
- Dopo la conversione nativa, il target utilizza un bootloader e una struttura filesystem convenzionali Debian. Può mantenere l'aspetto desktop MiniOS, ma l'infrastruttura live MiniOS e gli strumenti specifici per la modalità live non sono più presenti. Effettua un backup dei dati recuperabili prima di utilizzare la procedura di riparazione o reinstallazione del bootloader Debian adatta al suo BIOS/UEFI e alla struttura delle partizioni.

Se un dispositivo appena ricreato ancora non compare nel menu di avvio del firmware, controlla la modalità firmware, il supporto Secure Boot dell'architettura selezionata, la porta/dispositivo USB e la [compatibilità hardware](/getting-started/Hardware-Compatibility).

## Il menu di avvio MiniOS compare ma l'avvio fallisce

Rimuovi prima i parametri opzionali. Usa `debug` e `timing` quando serve più output nelle prime fasi di avvio. `rd.break` serve solo per l'ispezione avanzata di initramfs, non per la riparazione.

Se MiniOS non trova la propria origine, vedi [Rilevamento sistema](/reference/boot-process/System-Discovery). In una shell initramfs, le informazioni utili in sola lettura includono:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un temporaneo `from=askdisk` può aiutare a identificare il dispositivo che contiene effettivamente i dati MiniOS. Successivamente, usa la sintassi documentata `from=` invece di indovinare i nomi dei dispositivi.

Per l'avvio ISO tramite PXE o HTTP, vedi [Avvio di rete](/reference/boot-process/Network-Boot). La rete nelle prime fasi di avvio è separata da NetworkManager nella sessione attiva.

### Errori di modulo o root-union

Vedi [Caricamento moduli](/reference/boot-process/Module-Loading) per le regole effettive di selezione e ordine dei moduli. In particolare:

- `load=` e `noload=` possono escludere moduli base o kernel essenziali; `noload=` vince quando entrambi corrispondono;
- i candidati con lo stesso basename occupano lo stesso slot di sostituzione;
- un file `.sb` non garantisce che il file sia una vera immagine SquashFS;
- il kernel in esecuzione deve corrispondere al modulo kernel MiniOS coordinato e ai file di avvio.

Dopo un avvio riuscito, ispeziona lo stato reale senza modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemi di visualizzazione

Per schermo nero, risoluzione inutilizzabile o loop del display manager:

1. Prova il parametro di avvio `text`. Una console funzionante distingue un problema grafico/desktop da un errore precedente di avvio.
2. Rimuovi eventuali parametri `xorg-driver` o `xorg-resolution` specificati manualmente.
3. Prova **Avviare senza salvare** per escludere configurazioni di visualizzazione persistenti.
4. Annota la GPU e il driver con `lspci -nnk`.
5. Ispeziona `journalctl -b -p warning` e `dmesg --level=err,warn`.

Per le macchine virtuali, vedi [Virtualizzazione](/maintenance-and-recovery/Virtualization).

## Problemi di rete

Le normali connessioni cablate e Wi-Fi sono gestite tramite NetworkManager; vedi [Rete](/using-minios/Networking).

Per prima cosa verifica se l'interfaccia esiste:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Se non esiste alcuna interfaccia, annota `lspci -nnk` o `lsusb` e cerca errori di firmware o driver in `dmesg`.
- Se l'interfaccia esiste ma non ha indirizzo, distingui i problemi di connessione/DHCP dalla mancanza di supporto hardware.
- Se un indirizzo è presente, testa il gateway, poi un indirizzo IP, poi un nome DNS per distinguere problemi di collegamento, routing e DNS.
- Il parametro di avvio `ip=` è relativo all'avvio di rete iniziale e non configura una connessione NetworkManager persistente. Vedi [Avvio di rete](/reference/boot-process/Network-Boot).

## Problemi di persistenza

Avvia **Avviare senza salvare** prima di modificare uno store di persistenza sospetto. Non riparare o eliminare l'unica copia di una sessione mentre è attiva.

Verifica cosa vede attualmente MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Controlla la modalità di avvio selezionata, lo spazio scrivibile disponibile, la compatibilità del filesystem e quella della sessione. Le regole dettagliate di selezione sono in [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) e [Interni della persistenza](/reference/boot-process/Persistence-Internals).

Se una sessione importante non attiva `native`, `dynfilefs`, `dynblk`, `vmdk`, o `raw` è ancora leggibile, anche in forma cifrata sbloccabile, esportala **prima** di sperimentare con lo storage:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se Session Manager non riesce a leggere o esportare la sessione, interrompi la scrittura sulla sorgente e conserva una copia offline dello storage interessato prima di ulteriori interventi. Per una sessione DynBlk scollegata, `dynblk inspect /path/to/volume000.db --metadata-only` e `dynblk check /path/to/volume000.db` forniscono diagnostica in sola lettura sul formato; non eseguirli su un volume ancora collegato. MiniOS non definisce una procedura manuale universale per ricostruire segmenti DynFileFS, ricostruire parti di supporto DynBlk, riparare un filesystem interno o ricostruire i metadati della sessione. Tale recupero è specifico per filesystem/container e va tentato solo su una copia se il valore dei dati lo giustifica.

Vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) per i flussi di lavoro supportati di backup e importazione sessioni.

## Problemi di archiviazione e spazio libero

Ispeziona dispositivi e mount senza modificarli:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un filesystem pieno può causare errori nei pacchetti, salvataggi di sessione incompleti e altri errori secondari. Libera spazio spostando o eliminando solo dati noti dopo aver confermato il filesystem corretto. Usa il Gestore sessioni MiniOS per eliminare le sessioni invece di rimuovere manualmente le cartelle numerate delle sessioni.

Se `LIVE_APT_CACHE=volatile`, controlla anche `findmnt -T /var/cache/apt/archives` e `df -h /var/cache/apt/archives`: l'area archivio è un filesystem RAM limitato e un download di grandi dimensioni può riempirlo anche se il dispositivo USB ha spazio libero. Con `LIVE_LOG_STORAGE=volatile`, la normale `/var/log` ha un limite separato di 32 MiB su RAM. Riempire una delle due aree non fa sì che MiniOS scriva automaticamente quei file sul dispositivo USB. Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

La riparazione di filesystem non è un'operazione generica MiniOS. Se il filesystem è danneggiato, smontalo, salva prima i dati importanti o un'immagine, e usa una procedura di riparazione adatta a quel filesystem e dispositivo di archiviazione.

## Modifiche ai pacchetti e aggiornamenti di sistema

Se i problemi sono iniziati dopo modifiche ai pacchetti APT, ricorda che una sessione live persistente può sovrascrivere file provenienti dai moduli MiniOS in sola lettura. Prova **Avviare senza salvare** per confrontare con il set di moduli originale. Vedi [Aggiornamento di MiniOS](/maintenance-and-recovery/Updating-MiniOS) per la distinzione tra manutenzione APT e cambio di release MiniOS.

## Raccolta dei log

Le informazioni utili includono:

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

In una sessione durevole funzionante `perch`, i due log di avvio obbligatori sono già conservati indipendentemente da `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Le versioni `.1`, `.2` e `.3` sono avvii precedenti. Il mount ordinario `/var/log` può essere `tmpfs` mentre `/var/log/minios` e `/var/log/live` restano nello store di persistenza. Per SquashFS, questi log sono anche in `minios/changes/<session-id>/boot-logs/`, fuori da `changes.sb`; sopravvivono anche se lo snapshot di spegnimento fallisce. Un'attivazione `perch` non riuscita o non durevole non garantisce una destinazione log persistente. Con `LIVE_LOG_STORAGE=volatile`, `journalctl -b` e altri log ordinari sono disponibili solo per l'avvio **corrente**. Abilita i log dettagliati `minios-update-*` usando `LIVE_CONFIG_DEBUG=true` solo se necessario; gli errori normali vengono comunque segnalati.

Rimuovi credenziali, chiavi private, password Wi-Fi e altre informazioni riservate prima di condividere i log. Per un difetto riproducibile, includi gli estratti rilevanti e apri una segnalazione nel [tracker delle segnalazioni MiniOS](https://github.com/minios-linux/minios-live/issues).

### Le sessioni VMDK non sono disponibili

Aggiorna insieme il driver/CLI DynBlk e gli strumenti di sessione, poi ricostruisci l'
initrd di avvio. L'initrd in esecuzione deve dichiarare `vmdk-session-v1`; anche l'Installer
controlla ogni initrd sorgente che copierà. Il vecchio marker vuoto DynBlk
indica solo il supporto nativo per i blocchi e non garantisce il supporto all'avvio di sessioni VMDK.
Non modificare manualmente la modalità di una sessione esistente: usa una copia esplicita o una
conversione nell'altro formato.

### Liberare spazio in DynFileFS, DynBlk o nelle sessioni VMDK

Usa il menu contestuale di Session Manager **Libera spazio...**, oppure
`minios-session reclaim ID --json`. Per le sessioni in chiaro questa funzione esegue il trim
dell'effettivo ext4 interno e poi chiede al backend proprietario di recuperare spazio senza
spostare dati attivi. DynFileFS richiede la versione 4.6.0 o successiva per questa operazione.
Su filesystem come exFAT, possono restare spazi interni allocati al file host
ma riutilizzabili dal container; `--compact` è una scelta manuale separata che può
spostare dati attivi e scrivere di più sul dispositivo flash. Nessuna opzione abilita
compattazione o discard LUKS in automatico. Una sessione cifrata può recuperare solo
lo spazio già noto al backend sottostante tramite questo comando.
