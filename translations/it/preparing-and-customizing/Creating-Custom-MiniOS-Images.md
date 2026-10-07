---
updated: 2026-10-06
program_commits:
    minios-image-builder: bf84d50bfe9461f4e9300033c5855ec8fa387552
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Creazione di immagini personalizzate MiniOS

Il Generatore di immagini MiniOS è un'applicazione GTK per rimasterizzare un'immagine MiniOS esistente. Seleziona il contenuto da una sessione MiniOS attuale, da un file ISO o da un disco ottico, applica personalizzazioni dichiarative e utilizza `minios-image-compose` per produrre un ISO avviabile e verificato.

Il generatore viene eseguito all'interno di MiniOS. Non modifica il supporto sorgente selezionato.

## Scegli il flusso di lavoro corretto

Il Generatore di immagini MiniOS rimasterizza un'immagine binaria MiniOS esistente. Non sostituisce nessuno di questi flussi di lavoro:

- **Costruire MiniOS dal sorgente:** usa il `minios-live` sistema di build quando si modificano le liste dei pacchetti della distribuzione, la configurazione di build, il layer del kernel, gli artefatti di avvio o la catena di moduli costruiti da sorgente in modo riproducibile. Vedi [Compilazione di MiniOS](/development/Building-MiniOS).
- **Crea un modulo riutilizzabile:** usa `apt2sb`, `script2sb`, `chroot2sb`, o gli altri strumenti per moduli quando il risultato desiderato è un layer autonomo `.sb` . Vedi [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Rimasterizza un'immagine:** usa il Generatore di immagini MiniOS per selezionare moduli esistenti, aggiungere moduli esterni completati, modificare le impostazioni dell'immagine supportata, eventualmente acquisire le modifiche della sessione e pubblicare un altro ISO.

Il layer filesystem del progetto è destinato a file dichiarativi nella root dell'immagine. Non esegue script, non installa pacchetti e non apre chroot. Il software destinato al riutilizzo deve essere preparato come modulo prima di essere aggiunto a un progetto Generatore di immagini MiniOS.

## Opzioni sorgente

La pagina Sorgente accetta:

- La sessione LiveKit o dracut MiniOS attuale.
- Un file ISO MiniOS.
- Un disco ottico MiniOS.

Le sorgenti ISO e disco ottico vengono montate in sola lettura con `udisksctl`. L'inventario della sorgente registra release, versione, architettura, supporto bootloader, dimensione, inventario moduli e un'impronta digitale della sorgente. Se una sorgente cambia dopo la pianificazione, la build viene bloccata invece di continuare con input diversi.

La cattura della sessione descrive sempre le modifiche nella sessione MiniOS attualmente in esecuzione. Quando si seleziona un ISO o un disco ottico, la cattura è disponibile solo se l'impronta digitale del modulo base di quella sorgente corrisponde alla base montata della sessione in esecuzione. Selezionare supporti esterni non acquisisce le modifiche effettuate su un altro sistema.

## Requisiti

Il Generatore di immagini MiniOS richiede il backend corrispondente `minios-image-compose`. Le sorgenti ISO e disco ottico richiedono `udisks2` . La lettura di una `/etc/live/config.conf` riservata all'utente root e la cattura di una sessione scrivibile possono richiedere `pkexec` e un agente PolicyKit desktop. La cattura della sessione richiede un `savechanges` compatibile fornito da `minios-tools` 1.5.0 o successivo.

L'applicazione e il backend di composizione restano senza privilegi. L'autorizzazione è limitata al lettore di configurazione live fisso e, se selezionato, ai `/usr/bin/savechanges` trusted.

## Flusso di lavoro del progetto

### Seleziona la sorgente

Scegli una sorgente e attendi il completamento dell'inventario. Verifica identità, architettura, supporto boot, diagnostica e numero di moduli. Risolvi eventuali errori della sorgente prima di procedere.

### Seleziona il contenuto

Scegli i moduli sorgente da includere e aggiungi eventuali moduli esterni `.sb` . I moduli core e kernel richiesti sono bloccati. I moduli esterni ordinari attivi nella sessione attuale ma assenti dalla sorgente selezionata vengono mostrati separatamente e restano facoltativi.

Un modulo esterno che sostituisce attivamente un modulo sorgente nel percorso di sistema originale viene gestito diversamente: l'attuale Image Builder risolve il file di origine tramite device e inode, mantiene il ruolo di sistema originale e include quella sostituzione come modulo sorgente effettivo invece di presentarla come duplicato opzionale non correlato. Questo vale anche per i percorsi initramfs ricollocati. Gli altri moduli esterni richiedono comunque selezione esplicita.

I moduli aggiuntivi devono essere file regolari leggibili con dati SquashFS validi. Basename duplicati o che differiscono solo per maiuscole/minuscole e collisioni di destinazione vengono rifiutati perché il runtime risolve i layer tramite basename.

### Configura le impostazioni

Scegli il percorso di output e la configurazione MiniOS richiesta attuale. I campi di personalizzazione vuoti o `Keep current` mantengono il comportamento della sorgente. Configura solo le modifiche necessarie per la nuova immagine, poi decidi se acquisire il layer di sessione scrivibile.

I byte di `/etc/live/config.conf` vengono copiati nello storage privato di build con modalità 0600. Non vengono interpretati, visualizzati o registrati nei log. I progetti attuali devono includere questa configurazione; un progetto precedente che la disabilita esplicitamente non può procedere alla Revisione finché non viene corretto.

### Rivedi il piano

La revisione crea un nuovo piano a partire dalle identità di input correnti. Controlla i moduli selezionati, esclusi e aggiuntivi, la posizione di output, lo spazio stimato, il riepilogo delle personalizzazioni, il profilo di cattura, gli avvisi e i limiti di privilegio.

La revisione omette intenzionalmente i valori di configurazione, gli argomenti raw del kernel, i percorsi di personalizzazione privati e i percorsi di cattura selezionati. Mostra conteggi, basename, impronte digitali e digest dove questi sono sufficienti a vincolare il piano.

Se l'output esiste già, la sostituzione richiede conferma. La conferma è legata al device, inode, dimensione, timestamp e SHA-256 osservati di quel file. Una destinazione cambiata, una cancellazione o un tentativo fallito annullano l'approvazione e richiedono una nuova revisione.

### Costruisci e verifica

La build rivalida ogni input effettivo ed esegue `minios-image-compose` con una lista di argomenti in una directory di lavoro privata. L'ISO rimane privato finché la verifica strutturale non ha esito positivo. La pubblicazione sulla destinazione selezionata è atomica.

Salva il progetto se la sorgente, la selezione dei moduli, l'output e l'intento di personalizzazione verranno riutilizzati. I file di progetto sono in formato JSON. Le modifiche non salvate richiedono conferma prima di aprire un altro progetto o chiudere l'applicazione.

## Cattura della sessione e privacy

I moduli sorgente, `/etc/live/config.conf`, e la cattura della sessione sono input indipendenti. Se la selezione dei moduli e la personalizzazione dichiarativa sono sufficienti, non acquisire il layer di sessione scrivibile.

### Non includere le modifiche della sessione

Questa è l'impostazione predefinita consigliata. Il generatore utilizza i moduli selezionati, la configurazione attuale, le impostazioni di avvio e altre personalizzazioni dell'immagine senza copiare il layer di sessione scrivibile.

### Includi tutte le modifiche della sessione

Questo profilo conserva ogni modifica scrivibile supportata dal provider OverlayFS o AUFS rilevato. Può includere password, chiavi, token, dati del browser, identità della macchina, file personali, log e stato dei file eliminati. Richiede un riconoscimento esplicito e non dovrebbe essere usato per immagini destinate ad altri senza un audit separato.

### Includi solo le modifiche riutilizzabili

Questo profilo utilizza una lista di percorsi consentiti rigorosa per il software e impostazioni sicure di default, omettendo dati personali, identità, cache e log. Riduce l'esposizione ma non garantisce che i file consentiti non contengano segreti. Controlla l'immagine finale prima di condividerla.

### Scegli manualmente le modifiche della sessione

Esegui `Analyze session changes`, poi seleziona almeno un percorso normalizzato dall'inventario in memoria. Una directory selezionata rappresenta anche i suoi discendenti. Esclusioni esatte o degli antenati hanno priorità sulle selezioni corrispondenti.

L'inventario contiene metadati, inclusi i nomi dei file, e quindi è sensibile anche se non contiene i contenuti dei file. Rimane in memoria e non viene scritto nel progetto né copiato in Revisione o nei log. Le regole di inclusione ed esclusione esplicite rappresentano l'intento del progetto e vengono salvate; Revisione mostra solo il conteggio e il digest.

L'avvio di un'altra analisi, il refresh o il cambio della sorgente, la cancellazione o il fallimento, e l'apertura o la creazione di un progetto azzerano l'inventario runtime. Analisi e cattura possono richiedere autorizzazione amministrativa, ma il processo Generatore di immagini MiniOS e la composizione ISO non sono eseguiti con privilegi elevati.

## Personalizzazione dell'immagine

Le impostazioni supportate sono limitate e validate dal backend:

- **Impostazioni di sistema:** hostname, fuso orario, target systemd predefinito e servizi abilitati o disabilitati.
- **Sicurezza e accesso:** modalità sudo, PolicyKit, SSH, XRDP, X11, blocco schermo e issue-hint consentite tramite allowlist.
- **Dati utente:** directory utente root-relative validate con comportamento link o bind, ma non entrambi.
- **Comportamento di avvio:** timeout da 0 a 300 secondi, menu sorgente o menu costruito e una voce predefinita selezionata.
- **Voci di avvio:** i template resume, new, choose, fresh e copy-to-RAM possono essere nascosti, riordinati, duplicati e configurati tramite controlli tipizzati per persistenza, modulo, avvio, localizzazione, zRAM e diagnostica. Gli attuali template per nuove sessioni utilizzano `perchdir=setup` così il backend di persistenza può essere selezionato all'avvio; quando una sorgente precedente usa già `perchdir=new`, quel selettore legacy viene mantenuto invece di essere sovrascritto senza avviso.
- **Comportamento RAM:** copia del sistema (`toram`) e copia della sessione di persistenza (`perchtoram`) sono controlli indipendenti. `perchtoram=off` mantiene la persistenza sullo storage, `trim` copia la sessione supportata selezionata e `full` richiede una copia completa della sessione supportata. Quando la persistenza è abilitata, i menu attuali usano `trim` con un avvio di sistema RAM e `off` altrimenti, a meno che tu non scelga un altro valore. Le sessioni directory native non vengono copiate da `perchtoram`.
- **Impostazioni avanzate di avvio:** argomenti kernel globali e per voce validati per opzioni non rappresentate da controlli tipizzati.
- **Aspetto:** uno sfondo di avvio PNG validato.
- **Layer filesystem del progetto:** una directory reale interpretata rispetto alla root dell'immagine e impacchettata come modulo overlay SquashFS di proprietà root.

Il layer filesystem supporta file regolari, link simbolici relativi sicuri, directory vuote, bit eseguibili e timestamp. Vengono rifiutati nodi di device, socket, FIFO, attraversamenti di filesystem, link assoluti o che escono dalla root e nomi non sicuri. I bit di privilegio vengono azzerati e la proprietà nel modulo generato viene normalizzata.

La personalizzazione dell'avvio supporta GRUB MiniOS riconosciuto, SYSLINUX nativo e la catena standard SYSLINUX-to-GRUB. Configurazioni di avvio non supportate o ambigue vengono rifiutate invece che indovinate. Una build senza personalizzazione di avvio può preservare un layout sorgente che il parser di personalizzazione non comprende.

## Verifica dell'output

Prima della pubblicazione, `minios-image-compose` verifica l'ISO generato invece di basarsi solo su un `xorriso` exit riuscito. I controlli includono:

- L'albero filesystem ISO e l'etichetta del volume.
- Record di avvio BIOS e UEFI e area di sistema.
- Contenuto richiesto di boot, kernel, initramfs, configurazione e moduli.
- Personalizzazioni incorporate e attestazioni di cattura sessione, se presenti.
- Digest e struttura dei moduli overlay generati e delle sessioni catturate.
- Target dello sfondo di avvio e configurazione di boot trasformata se personalizzata.

Identità del percorso di input, modalità, ora di modifica e SHA-256 vengono registrati prima della build. Gli input mutabili vengono snapshot in privato tramite reflink se supportato; altrimenti vengono controllati per modifiche prima e dopo la scrittura dell'ISO. Una discrepanza o un errore di verifica impedisce la pubblicazione.

Dopo una build riuscita, registra separatamente un checksum:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verifica strutturale non sostituisce il test di avvio. Avvia l'ISO in una macchina virtuale temporanea e testa sia BIOS che UEFI se entrambi devono essere supportati. Il Generatore di immagini MiniOS può segnalare se QEMU o VirtualBox sono installati, ma non avvia né configura un hypervisor.

## Sicurezza e annullamento

- Mantieni i supporti sorgente in sola lettura e scrivi l'output su un filesystem con spazio libero sufficiente per la stima e il margine temporaneo.
- Non costruire direttamente sopra l'unico ISO noto come valido. Usa un nuovo nome di output a meno che la sostituzione non sia intenzionale e confermata.
- Verifica i moduli esterni prima di aggiungerli. Il Generatore di immagini MiniOS valida la loro struttura SquashFS, ma non stabilisce chi abbia creato i loro contenuti.
- Preferisci non acquisire la sessione per immagini da distribuire. Se la cattura è necessaria, controlla il filesystem risultante, non solo il nome del profilo.
- Tratta i file di progetto come sensibili quando contengono percorsi sorgente espliciti, percorsi moduli, percorsi di output o regole di cattura selezionate.

Inventario, build e sottoprocessi di verifica vengono eseguiti in gruppi di processi dedicati. La richiesta di annullamento termina il processo e si intensifica dopo un periodo di tolleranza. Un passaggio di hashing può terminare prima che l'annullamento raggiunga un checkpoint sicuro, ma i risultati obsoleti vengono scartati. Una volta iniziata la pubblicazione atomica, viene lasciata terminare per evitare che la destinazione resti scritta solo parzialmente.

Una build annullata o fallita non pubblica il proprio ISO privato. Qualsiasi destinazione precedente resta invariata a meno che una sostituzione verificata non abbia raggiunto la pubblicazione atomica.

## Documentazione correlata

- [Compilazione di MiniOS](/development/Building-MiniOS)
- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Composizione di immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Composizione di immagini ISO MiniOS da riga di comando

`minios-image-compose` è il backend da riga di comando fornito con il Generatore di immagini MiniOS. Sostituisce il `sb2iso` utility ritirato. Il comando rimasterizza un albero di contenuti MiniOS esistente, opzionalmente modifica il set di moduli e la configurazione supportata, verifica il risultato e pubblica un ISO avviabile.

Usa l'interfaccia grafica [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) per un flusso di lavoro guidato del progetto. Usa direttamente questo comando per script, automazione o build riproducibili da riga di comando. Per una build completa dal sorgente, usa [Compilazione di MiniOS](/development/Building-MiniOS) invece.

### Utilizzo di base

Da una sessione live MiniOS in esecuzione, crea un ISO con la sorgente MiniOS rilevata e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Non anteporre il comando completo con `sudo` o `pkexec`. Composizione, verifica e pubblicazione vengono eseguite come utente corrente. Solo la cattura opzionale della sessione può invocare il `/usr/bin/savechanges` backend trusted tramite PolicyKit.

Il nome di output predefinito è `minios-YYYYMMDD_HHMM.iso`. Una destinazione esistente viene rifiutata a meno che `--overwrite` non sia specificato esplicitamente.

### Seleziona una sorgente

Senza `--source`, il comando rileva il contenuto MiniOS utilizzato dalla sessione LiveKit o dracut attuale. Per rimasterizzare un altro albero MiniOS montato, specifica la directory che contiene `boot/` e i moduli MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La sorgente è un input in sola lettura e non viene mai modificata. I file ISO e i supporti ottici devono essere montati prima di usare il loro albero contenuti MiniOS con la CLI. L'interfaccia grafica Generatore di immagini MiniOS può montare queste sorgenti tramite `udisksctl`.

### Seleziona i moduli

Moduli aggiuntivi `.sb` sono argomenti posizionali:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Il comando valida ogni modulo come file SquashFS leggibile e non-symlink.
I moduli i cui nomi iniziano con due cifre e un trattino vengono posizionati al livello superiore MiniOS. Gli altri moduli aggiunti vengono posizionati in `minios/modules/`. Collisioni di basename duplicate o case-insensitive vengono rifiutate.

Escludi percorsi sorgente con un'espressione regolare estesa POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

File di avvio richiesti, file kernel e initramfs, moduli core, menu di avvio selezionato e configurazione selezionata non possono essere esclusi.

Crea moduli riutilizzabili prima di comporre l'ISO. Vedi [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules) e [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules).

### Configurazione e manifest

`--config FILE` installa il file regolare selezionato come `minios/config.conf`. Il valore predefinito è `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Il manifest opzionale deve essere un oggetto JSON. Le etichette di volume contengono da 1 a 32 caratteri ASCII stampabili; etichette fuori dallo standard ISO 9660 (maiuscole, cifre, underscore) producono un avviso.

### Cattura delle modifiche di sessione

La cattura della sessione è opzionale e si applica al layer scrivibile della sessione MiniOS attualmente in esecuzione. È accettata solo per una sorgente esplicita quando quella sorgente ha la stessa impronta digitale del modulo base del sistema in esecuzione.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

I profili disponibili sono:

- `exact` cattura ogni modifica rappresentabile e può includere credenziali, dati personali, log, stato del browser e identità della macchina.
- `clean` utilizza una allowlist ristretta orientata al software. Riduce l'esposizione ma non garantisce che il risultato sia privo di segreti.
- `selected` utilizza una selezione di inventario prodotta da un frontend compatibile o da un `savechanges` flusso di lavoro.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Preferisci moduli e configurazione dichiarativa rispetto alla cattura della sessione quando l'ISO verrà condiviso. Vedi [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) per il modello di privacy e il flusso di revisione.

### Personalizza il comportamento di avvio

La CLI può modificare layout GRUB e SYSLINUX supportati:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accetta `resume`, `new`, `choose`, `fresh`, o `toram`. Il template semantico `new` mappa a `perchdir=setup` nei menu MiniOS attuali, mentre le voci di sorgente legacy `perchdir=new` restano riconoscibili. Anche il costruttore grafico del menu di avvio mantiene `perchtoram=off|trim|full` indipendentemente dall'impostazione di sistema `toram`.
`--menu` accetta `multilang` o una locale supportata come `en_US`, `ru_RU`, o `de_DE`. Gli argomenti kernel sono validati e aggiunti senza valutazione da shell. Layout di menu di avvio non supportati o ambigui vengono rifiutati invece che modificati per tentativi.

### Aggiungi grafica o un overlay filesystem

Sostituisci lo sfondo di avvio con un PNG validato:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Impacchetta un albero di directory preparato come modulo overlay di immagine di proprietà root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

L'overlay viene interpretato rispetto alla root dell'immagine. Non esegue script, non installa pacchetti e non apre chroot. Link non sicuri, file speciali, attraversamenti di filesystem e collisioni di destinazione vengono rifiutati.

### Verifica e pubblicazione

Prima della pubblicazione, `minios-image-compose` verifica l'albero filesystem ISO, l'etichetta del volume, i record di avvio BIOS e UEFI, l'area di sistema, i file di avvio, i moduli e le personalizzazioni richieste. I moduli overlay generati e le sessioni catturate vengono estratti e confrontati con i metadati e i digest registrati.

L'ISO viene costruito in una directory privata sul filesystem di destinazione e pubblicato in modo atomico solo dopo il superamento della verifica. Mutazione degli input, errore di verifica, annullamento o spazio insufficiente sulla destinazione impediscono la pubblicazione. Una destinazione precedente resta invariata a meno che una build `--overwrite` approvata esplicitamente raggiunga la pubblicazione atomica.

Crea un checksum ed esegui un test di avvio separato dopo una build riuscita:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verifica strutturale non sostituisce il test dei percorsi BIOS e UEFI previsti in una macchina virtuale temporanea o su hardware adeguato.

### Riferimento ai comandi

Utilizza il manuale installato e l'output di help per la versione esatta del backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Le opzioni comuni includono:

| Opzione | Scopo |
|---|---|
| `-n`, `--name FILE` | Imposta il percorso di output. |
| `-e`, `--exclude REGEX` | Escludi i percorsi sorgente corrispondenti. |
| `--source DIR` | Seleziona un albero contenuti MiniOS esplicito. |
| `--config FILE` | Seleziona la configurazione live incorporata nell'ISO. |
| `--manifest FILE` | Includi un manifest di build JSON validato. |
| `--capture-changes MODE` | Cattura `exact`, `clean`, o `selected` modifiche di sessione. |
| `--boot-timeout SECONDS` | Imposta un timeout del menu di avvio da 0 a 300 secondi. |
| `--default-boot MODE` | Seleziona l'azione di sessione predefinita MiniOS. |
| `--kernel-args TEXT` | Aggiungi argomenti kernel globali validati. |
| `--boot-background PNG` | Sostituisci la grafica di avvio supportata. |
| `--overlay-directory DIR` | Aggiungi un layer filesystem dichiarativo. |
| `--menu TYPE` | Seleziona un menu multilingue o localizzato. |
| `--overwrite` | Consenti esplicitamente la sostituzione di un output esistente. |

Il comando termina con codice diverso da zero se falliscono controlli su sorgente, moduli, personalizzazione, storage, verifica o pubblicazione. Non distribuire un output a meno che il comando non sia completato con successo e siano stati testati checksum risultante e percorsi di avvio.
