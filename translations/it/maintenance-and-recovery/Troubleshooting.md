---
updated: 2026-10-15
---

# Risoluzione dei problemi

Inizia osservando il problema ed eseguendo test reversibili. Non modificare le partizioni, formattare, riparare un file system, eliminare una sessione o sostituire i file di avvio solo per vedere se questo risolve il problema. Prima, metti al sicuro i dati importanti.

## Controlli preliminari

1. [Verifica l’immagine scaricata](/installing-minios/Verifying-Downloads).
2. Avvia **Avviare senza salvare**. Se il problema scompare, verifica la sessione persistente o la sua configurazione, non l’immagine di base.
3. Rimuovi i parametri di avvio personalizzati e i filtri dei moduli, a meno che non siano necessari per riprodurre il problema.
4. Prova un’altra porta USB e, se possibile, un altro dispositivo o computer sicuramente funzionante.
5. Annota il primo errore e la voce esatta del menu di avvio, non solo l’ultimo messaggio visualizzato sullo schermo.
6. Controlla la [compatibilità hardware](/getting-started/Hardware-Compatibility) quando la stessa immagine verificata non funziona su un computer ma funziona su un altro.

## Il dispositivo non raggiunge il menu di avvio di MiniOS

Per prima cosa, determina come è stato creato il dispositivo MiniOS.

- Per un’immagine scritta in modalità raw (`dd`, Etcher, modalità DD di Rufus o scrittura di immagini con Utilità disco), non riparare singoli file di avvio. Se la copia è danneggiata, riscrivi l’intero dispositivo usando un’immagine verificata.
- Per un’installazione MiniOS basata su file, ricrea la struttura avviabile seguendo lo stesso metodo di installazione documentato, anziché copiare file GRUB, Syslinux o EFI da un’altra versione.
- Ventoy ha un proprio bootloader e una propria struttura. Non installare il bootloader di MiniOS su un dispositivo Ventoy; usa invece la procedura [Ventoy](/installing-minios/installation-tools/Ventoy).
- Dopo la conversione nativa, il sistema di destinazione usa un bootloader Debian standard e una struttura del file system convenzionale. Può mantenere l’aspetto desktop di MiniOS, ma l’infrastruttura live e gli strumenti specifici per l’ambiente live di MiniOS non saranno più presenti. Prima di usare la procedura di riparazione o reinstallazione del bootloader Debian appropriata alla configurazione BIOS/UEFI e al partizionamento, esegui il backup dei dati recuperabili.

Se un dispositivo appena ricreato non compare ancora nel menu di avvio del firmware, controlla la modalità del firmware, il supporto di Secure Boot per l’architettura selezionata, la porta o il dispositivo USB e la [compatibilità hardware](/getting-started/Hardware-Compatibility).

## Compare il menu di avvio di MiniOS, ma l’avvio non riesce

Rimuovi prima i parametri facoltativi. Usa `debug` e `timing` quando servono più informazioni sulle prime fasi di avvio. `rd.break` serve per l’ispezione avanzata di initramfs, non per la riparazione.

Se MiniOS non riesce a trovare la propria origine, consulta [Rilevamento del sistema](/reference/boot-process/System-Discovery). In una shell initramfs, possono essere utili queste informazioni in sola lettura:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporaneo può aiutare a identificare il dispositivo che contiene effettivamente i dati di MiniOS. Dopodiché, usa la sintassi documentata di `from=` invece di indovinare i nomi dei dispositivi.

Per l’avvio PXE o da ISO via HTTP, consulta [Avvio di rete](/reference/boot-process/Network-Boot). La rete nelle prime fasi di avvio è separata da NetworkManager nella sessione avviata.

### Errori dei moduli o dell’unione principale

Vedi [Caricamento dei moduli](/reference/boot-process/Module-Loading) per le regole effettive di selezione e ordinamento dei moduli. In particolare:

- `load=` e `noload=` possono escludere moduli di base o del kernel essenziali; `noload=`prevale quando entrambi corrispondono;
- i candidati con lo stesso nome di base occupano lo stesso slot di sostituzione;
- un `.sb`nome file non dimostra che il file sia un’immagine SquashFS valida;
- il kernel in esecuzione deve corrispondere al modulo del kernel MiniOS e ai file di avvio coordinati.

Dopo un avvio riuscito, verifica lo stato effettivo senza modificarlo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemi di visualizzazione

In caso di schermo nero, risoluzione inutilizzabile o ciclo continuo del display manager:

1. Prova il parametro di avvio `text`. Se la console funziona, il problema riguarda la grafica o il desktop, non una fase precedente dell’avvio.
2. Rimuovi i parametri specificati manualmente `xorg-driver` o `xorg-resolution`.
3. Prova **Avviare senza salvare** per escludere una configurazione di visualizzazione persistente.
4. Annota GPU e driver con `lspci -nnk`.
5. Controlla `journalctl -b -p warning` e `dmesg --level=err,warn`.

Per le macchine virtuali, vedi [Virtualizzazione](/maintenance-and-recovery/Virtualization).

Nelle immagini XFCE di Debian 13 / Devuan Excalibur, **Impostazioni dello schermo** include un controllo **Scala dell’interfaccia** con percentuali automatiche e manuali. La modalità automatica si basa sullo schermo principale; una percentuale esplicita salvata ha la precedenza. Usa l’anteprima temporizzata e la conferma: la risoluzione di output e la scala dell’interfaccia sono impostazioni diverse. Gli effetti delle finestre e il renderer si configurano separatamente in **Ottimizzazioni del gestore finestre → Compositore**. `xfwm4-gl` usa XRender come alternativa quando non è possibile usare OpenGL; sfocatura e Magic Lamp richiedono OpenGL, mentre le animazioni di dissolvenza e ridimensionamento e Peek funzionano anche con XRender.

## Problemi di rete

Le normali connessioni cablate e Wi-Fi sono gestite tramite NetworkManager; vedi [Rete](/using-minios/Networking).

Per prima cosa, verifica che l’interfaccia esista:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Se l’interfaccia non esiste, annota `lspci -nnk` o `lsusb` e cerca errori relativi al firmware o ai driver in `dmesg`.
- Se l’interfaccia esiste ma non ha un indirizzo, distingui i problemi di connessione o DHCP dall’assenza del supporto hardware.
- Se è presente un indirizzo, verifica prima il gateway, poi un indirizzo IP e infine un nome DNS, per individuare eventuali problemi di collegamento, routing o DNS.
- Il parametro di avvio `ip=` è usato per l’avvio tramite rete nelle prime fasi e non configura una connessione NetworkManager persistente. Vedi [Avvio dalla rete](/reference/boot-process/Network-Boot).

## Problemi di persistenza

Avvia **Avviare senza salvare** prima di modificare un archivio di persistenza sospetto. Non riparare né eliminare l’unica copia di una sessione mentre è attiva.

Verifica cosa rileva attualmente MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Controlla la modalità di avvio selezionata, lo spazio scrivibile disponibile, la compatibilità del file system e quella della sessione. Le regole dettagliate per la selezione sono disponibili in [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) e [Funzionamento interno della persistenza](/reference/boot-process/Persistence-Internals).

Se una sessione importante non in esecuzione di `native`, `dynfilefs`, `dynblk`, `vmdk` o `raw` è ancora leggibile, anche in forma crittografata se può essere sbloccata, esportala **prima** di sperimentare con l’archiviazione:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se Session Manager non riesce a leggere o esportare la sessione, interrompi le scritture sull’origine e conserva una copia offline dello spazio di archiviazione interessato prima di procedere. Per una sessione DynBlk scollegata, `dynblk inspect /path/to/volume000.db --metadata-only` e `dynblk check /path/to/volume000.db` forniscono diagnostiche di sola lettura del formato; non eseguirle su un volume ancora collegato. MiniOS non definisce una procedura manuale universale per ricostruire i segmenti DynFileFS, ricreare le parti di supporto DynBlk, riparare un file system interno o ricostruire i metadati della sessione. Il recupero dipende dal file system o dal contenitore e va tentato solo su una copia, quando il valore dei dati lo giustifica.

Vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) per le procedure di backup e importazione delle sessioni supportate.

### Ventoy Persistence Plugin

Se Session Manager segnala che non è disponibile con il Ventoy Persistence Plugin, si tratta del comportamento previsto per il modello a immagine singola, non di metadati di sessione mancanti. Seleziona un altro backend in Ventoy oppure avvia il sistema senza selezionare un’immagine del plugin per usare sessioni MiniOS numerate. Se un backend non è disponibile o non è ext4, il formato union registrato è diverso oppure l’attivazione in scrittura non riesce, MiniOS mostrerà un avviso e continuerà in RAM. Esamina `/run/initramfs/minios-persistence/boot-state` e gli avvisi all’avvio; non creare `session.conf` manualmente all’interno dell’immagine del plugin. Vedi [Ventoy](/installing-minios/installation-tools/Ventoy).

## Problemi di archiviazione e spazio libero

Esamina dispositivi e punti di mount senza modificarli:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un filesystem pieno può causare errori nelle operazioni sui pacchetti, salvataggi incompleti delle sessioni e altri problemi secondari. Libera spazio spostando o eliminando dati noti solo dopo aver verificato il filesystem corretto. Per eliminare sessioni, usa il Gestore sessioni MiniOS invece di rimuovere manualmente le directory delle sessioni numerate.

Se `LIVE_APT_CACHE=volatile`, controlla anche `findmnt -T /var/cache/apt/archives` e `df -h /var/cache/apt/archives`: l’area degli archivi è un filesystem RAM con spazio limitato e un download di grandi dimensioni può riempirla anche se il dispositivo USB ha spazio libero. Con `LIVE_LOG_STORAGE=volatile`, il normale `/var/log` ha un limite separato di 32 MiB RAM. Se una delle due aree si riempie, MiniOS non inizia a scrivere quei file sul dispositivo USB senza avvisare. Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

La riparazione di un filesystem non è un’operazione MiniOS generica. Se il filesystem è danneggiato, smontalo, salva prima i dati importanti o un’immagine e usa una procedura di riparazione adatta a quel filesystem e al dispositivo di archiviazione.

## Modifiche ai pacchetti e aggiornamenti di sistema

Se i problemi sono iniziati dopo modifiche ai pacchetti APT, ricorda che una sessione live persistente può sovrascrivere i file dei moduli MiniOS di sola lettura. Prova **Avviare senza salvare** per confrontare i risultati con il set di moduli originale. Vedi [Aggiornamento di MiniOS](/maintenance-and-recovery/Updating-MiniOS) per capire la differenza tra la manutenzione APT e il passaggio alle release MiniOS.

<a id="collecting-logs"></a>

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

In caso di ripetuti errori di avvio su supporti MiniOS scrivibili, `EXPORT_LOGS=true` in `config.conf` esporta i log di avvio in `minios/log/`. Vedi [config.conf](/reference/configuration/config.conf).

In una sessione `perch` persistente e funzionante, i due log di avvio obbligatori vengono conservati comunque, indipendentemente da `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Il `.1`, `.2` e `.3` risalgono ad avvii precedenti. Il normale mount di `/var/log` può essere `tmpfs` mentre `/var/log/minios` e `/var/log/live` rimangono nell’archivio di persistenza. Per SquashFS, questi log si trovano anche in `minios/changes/<session-id>/boot-logs/`, al di fuori di `changes.sb`; vengono conservati anche se lo snapshot di arresto non riesce. Se l’attivazione di `perch` non riesce o non è persistente, non è garantita una destinazione persistente per i log. Con `LIVE_LOG_STORAGE=volatile`, `journalctl -b` e gli altri log normali sono disponibili solo per l’avvio **corrente**. Abilita le tracce dettagliate di `minios-update-*` solo quando necessario, usando `LIVE_CONFIG_DEBUG=true`; gli errori normali vengono comunque segnalati anche senza.

Prima di condividere i log, rimuovi credenziali, chiavi private, password Wi-Fi e altre informazioni riservate. Per un bug riproducibile, includi gli estratti pertinenti e apri una segnalazione nel [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).

### Le sessioni VMDK non sono disponibili

Aggiorna insieme il driver/CLI DynBlk e gli strumenti per le sessioni, quindi ricompila l’
initrd di avvio. L’initrd in esecuzione deve indicare `vmdk-session-v1`; anche Installer
controlla ogni initrd sorgente che copierà. Il vecchio marker DynBlk vuoto
indica solo il supporto nativo per i dispositivi a blocchi e non garantisce il supporto all’avvio di sessioni VMDK.
Non modificare manualmente la modalità di una sessione esistente: usa una copia esplicita o
una conversione nell’altro formato.

### Liberare spazio in DynFileFS, DynBlk o nelle sessioni VMDK

Usa il menu contestuale di Session Manager **Libera spazio...**, oppure
`minios-session reclaim ID --json`. Nelle sessioni in testo normale, questa operazione riduce l’
ext4 interno vero e proprio, quindi chiede al backend proprietario di recuperare spazio di archiviazione senza
spostare i dati attivi. DynFileFS richiede la versione 4.6.0 o successiva per questa operazione.
Su file system come exFAT, gli spazi vuoti interni possono restare allocati nel file host
ma essere riutilizzabili dal container; `--compact` è un’opzione manuale separata che può
spostare i dati attivi e comporta più scritture sul dispositivo flash. La compattazione e il discard LUKS non vengono mai attivati
automaticamente. Una sessione cifrata può recuperare solo lo spazio già noto al backend sottostante tramite questo comando.
