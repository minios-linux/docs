---
updated: 2026-10-15
program_commits:
    minios-image-builder: 8592ec061393e48e6bdfbd43d5b4365a94c73a67
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Creazione di immagini personalizzate MiniOS

Generatore di immagini MiniOS è un'applicazione GTK per rimasterizzare un'immagine MiniOS esistente. Seleziona i contenuti da una sessione MiniOS corrente, da un file ISO o da un disco ottico, applica personalizzazioni dichiarative e utilizza `minios-image-compose` per produrre un ISO avviabile verificato.

Il generatore viene eseguito all'interno di MiniOS. Non modifica il supporto di origine selezionato.

## Scegli il flusso di lavoro corretto

Generatore di immagini MiniOS rimasterizza un'immagine binaria MiniOS esistente. Non sostituisce nessuno dei seguenti flussi di lavoro:

- **Crea MiniOS dal codice sorgente:** usa il `minios-live` sistema di build per modificare gli elenchi dei pacchetti della distribuzione, la configurazione di build, il kernel, gli artefatti di avvio o la catena riproducibile di moduli compilati dal codice sorgente. Vedi [Compilazione di MiniOS](/development/Building-MiniOS).
- **Crea un modulo riutilizzabile:** usa `apt2sb`, `script2sb`, `chroot2sb` o gli altri strumenti per i moduli quando il risultato desiderato è un livello `.sb`. Vedi [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Rimasterizza un'immagine:** usa il Generatore di immagini MiniOS per selezionare moduli esistenti, aggiungere moduli esterni già pronti, modificare le impostazioni supportate dell'immagine, acquisire facoltativamente le modifiche della sessione e pubblicare un altro ISO.

Il livello del filesystem del progetto serve per i file dichiarativi nella radice dell'immagine. Non esegue script, installa pacchetti né apre un chroot. Il software da riutilizzare va preparato come modulo prima di aggiungerlo a un progetto del Generatore di immagini MiniOS.

## Opzioni di origine

La pagina Origine accetta:

- La sessione LiveKit o dracut MiniOS attualmente in esecuzione.
- Un file ISO MiniOS.
- Un disco ottico MiniOS.

Le origini ISO e i dischi ottici vengono montati in sola lettura con `udisksctl`. L'inventario dell'origine registra versione, release, architettura, supporto del bootloader, dimensioni, inventario dei moduli e impronta digitale dell'origine. Se un'origine cambia dopo la pianificazione, la build viene bloccata anziché proseguire con input diversi.

Nel generatore grafico, l'acquisizione della sessione è disponibile solo usando come origine la sessione **MiniOS in esecuzione**, includendo tutti i moduli dell'origine e tutti i moduli esterni attivi. Non è disponibile per un file ISO o un disco ottico selezionato separatamente, anche se contiene la stessa release. Durante l'acquisizione della sessione scrivibile, non deselezionare i livelli dell'origine: le modifiche dipendono da questa base completa in esecuzione.

## Requisiti

Il Generatore di immagini MiniOS richiede il backend `minios-image-compose`corrispondente. Per le origini da file ISO e disco ottico è necessario `udisks2`. Per leggere un `/etc/live/config.conf` accessibile solo all'utente root e acquisire una sessione scrivibile possono essere necessari `pkexec` e un agente PolicyKit desktop. L'acquisizione della sessione richiede un `savechanges` compatibile fornito da `minios-tools` versione 1.5.0 o successiva.

L'applicazione e il backend di composizione non dispongono di privilegi elevati. L'autorizzazione è limitata al lettore della configurazione live predefinito e, se selezionati, ai moduli `/usr/bin/savechanges` attendibili.

## Flusso di lavoro del progetto

### Seleziona la sorgente

Scegli una sorgente e attendi il completamento dell'inventario. Verifica identità, architettura, supporto all'avvio, diagnostica e numero di moduli. Risolvi gli errori della sorgente prima di procedere.

### Seleziona i contenuti

Scegli i moduli della sorgente da includere e aggiungi eventuali moduli esterni `.sb`. I moduli core e kernel obbligatori sono bloccati. I normali moduli esterni attivi nella sessione corrente ma assenti dalla sorgente selezionata vengono mostrati separatamente e restano facoltativi.

Un modulo esterno che sostituisce attivamente un modulo della sorgente nel percorso di sistema originale di quest'ultimo viene gestito in modo diverso: Image Builder attuale individua il file di supporto tramite dispositivo e inode, mantiene il ruolo di sistema originale e include la sostituzione come modulo effettivo della sorgente, anziché presentarla come duplicato facoltativo non correlato. Questo vale anche per i percorsi di supporto di initramfs spostati. Per gli altri moduli esterni è comunque necessaria una selezione esplicita.

I moduli aggiuntivi devono essere file regolari leggibili con dati SquashFS validi. I nomi base duplicati o che differiscono solo per maiuscole e minuscole, così come le collisioni tra destinazioni, vengono rifiutati perché il runtime risolve i livelli in base al nome base.

### Configura le impostazioni

Scegli il percorso di output e la configurazione MiniOS corrente obbligatoria. I campi di personalizzazione vuoti o `Keep current` mantengono il comportamento della sorgente. Configura solo le sostituzioni necessarie per la nuova immagine, quindi decidi se acquisire il livello di sessione scrivibile.

I byte di `/etc/live/config.conf` vengono copiati nell'area di archiviazione privata della build con modalità 0600. Non vengono interpretati, visualizzati né registrati nei log. I progetti attuali devono includere questa configurazione; un progetto precedente che la disabilita esplicitamente non può passare alla revisione finché non viene corretto.

### Esamina il piano

L'esame crea un nuovo piano a partire dagli identificativi degli input attuali. Controlla i moduli selezionati, esclusi e aggiuntivi, il percorso di output, lo spazio stimato, il riepilogo delle personalizzazioni, il profilo di acquisizione, gli avvisi e i limiti dei privilegi.

L'esame omette intenzionalmente i valori di configurazione, gli argomenti grezzi del kernel, i percorsi privati di personalizzazione e i percorsi di acquisizione selezionati. Mostra conteggi, nomi base, impronte digitali e digest quando sono sufficienti a identificare in modo univoco il piano.

Se il file di output esiste già, per sostituirlo è necessaria una conferma. La conferma è associata al dispositivo, all'inode, alle dimensioni, al timestamp e all'hash SHA-256 del file rilevati. Se la destinazione cambia, l'operazione viene annullata o un tentativo non riesce, l'autorizzazione viene revocata ed è necessario esaminare di nuovo il piano.

### Crea e verifica

La creazione convalida nuovamente ogni input effettivo ed esegue `minios-image-compose` con un elenco di argomenti in una directory di lavoro privata. Il file ISO rimane privato fino al completamento della verifica strutturale. La pubblicazione nella destinazione selezionata è atomica.

Salva il progetto se prevedi di riutilizzarne la sorgente, la selezione dei moduli, l'output e le personalizzazioni. I file di progetto sono in formato JSON. Prima di aprire un altro progetto o chiudere l'applicazione, è necessario confermare le modifiche non salvate.

## Acquisizione della sessione e privacy

I moduli sorgente, `/etc/live/config.conf`, e l'acquisizione della sessione sono input indipendenti. Se la selezione dei moduli e la personalizzazione dichiarativa sono sufficienti, non acquisire la sessione scrivibile.

### Non includere le modifiche della sessione

Questa è l'impostazione predefinita consigliata. Il generatore usa i moduli selezionati, la configurazione corrente, le impostazioni di avvio e le altre personalizzazioni dell'immagine senza copiare il livello scrivibile della sessione.

### Includi tutte le modifiche della sessione

Questo profilo conserva tutte le modifiche scrivibili supportate dal provider OverlayFS o AUFS rilevato. Può includere password, chiavi, token, dati del browser, identità della macchina, file personali, log e stato dei file eliminati. Richiede una conferma esplicita e non dovrebbe essere usato per un'immagine destinata ad altre persone senza una verifica separata.

### Includi solo le modifiche riutilizzabili

Questo profilo applica una allowlist rigorosa di percorsi per il software e le impostazioni predefinite sicure, escludendo i dati personali, di identità, cache e log in senso ampio. Riduce l'esposizione, ma non garantisce che i file consentiti non contengano segreti. Controlla l'immagine finale prima di condividerla.

### Scegli manualmente le modifiche della sessione

Esegui `Analyze session changes`, quindi seleziona almeno un percorso normalizzato dall'inventario in memoria. Una directory selezionata include anche le directory e i file al suo interno. Le esclusioni esatte o relative a una directory superiore prevalgono sulle selezioni corrispondenti.

L'inventario contiene metadati, inclusi i nomi dei file, ed è quindi sensibile anche se non contiene i file stessi. Rimane in memoria e non viene scritto nel progetto né copiato in Review o nei log. Le regole esplicite di inclusione ed esclusione rappresentano le scelte del progetto e vengono salvate; Review mostra solo il loro conteggio e digest.

L'avvio di un'altra analisi, l'aggiornamento o la modifica della sorgente, l'annullamento o un errore, nonché l'apertura o la creazione di un progetto cancellano l'inventario di runtime. L'analisi e l'acquisizione possono richiedere l'autorizzazione di amministratore, ma il processo Generatore di immagini MiniOS e la composizione dell'ISO non vengono eseguiti con privilegi elevati.

## Personalizzazione dell'immagine

Le impostazioni supportate sono limitate e convalidate dal backend:

- **Impostazioni predefinite del sistema:** hostname, fuso orario, target predefinito di systemd e servizi abilitati o disabilitati.
- **Sicurezza e accesso:** modalità consentite per sudo, PolicyKit, SSH, XRDP, X11, schermata di blocco e suggerimenti sui problemi.
- **Dati utente:** directory utente convalidate e relative alla radice, con comportamento di collegamento o bind, ma non entrambi.
- **Comportamento all'avvio:** un timeout da 0 a 300 secondi, il menu della sorgente o un menu personalizzato e una voce predefinita selezionata.
- **Voci di avvio:** i modelli resume, new, choose, fresh e copy-to-RAM possono essere nascosti, riordinati, duplicati e configurati tramite controlli tipizzati per la persistenza, i moduli, l'avvio, la localizzazione, zRAM e la diagnostica. I modelli attuali per le nuove sessioni usano `perchdir=setup` per consentire la selezione del backend di persistenza all'avvio; se una sorgente meno recente usa già `perchdir=new`, quel selettore legacy viene mantenuto anziché essere riscritto senza avviso.
- **Comportamento di RAM:** la copia del sistema (`toram`) e la copia della sessione di persistenza (`perchtoram`) sono controlli indipendenti. `perchtoram=off` mantiene la persistenza sul supporto di archiviazione, `trim` copia la sessione supportata selezionata e `full` richiede la copia dell'intera sessione supportata. Se è richiesta la persistenza, l'avvio di sistema RAM usa per impostazione predefinita `trim` a meno che non venga scelto un altro valore. I dati nativi delle directory non vengono copiati: normalmente, per questa richiesta, initrd avvia invece un nuovo contenitore vuoto. Usa `perchtoram=off` per conservare i dati nativi sul supporto di archiviazione.
- **Impostazioni di avvio avanzate:** argomenti del kernel globali e per singola voce, convalidati, per le opzioni non disponibili tramite controlli tipizzati.
- **Aspetto:** uno sfondo di avvio PNG convalidato.
- **Livello del filesystem del progetto:** una directory reale interpretata relativamente alla radice dell'immagine e inclusa come modulo overlay SquashFS di proprietà dell'utente root.

Il livello del filesystem supporta file normali, collegamenti simbolici relativi sicuri, directory vuote, bit di esecuzione e timestamp. I nodi dispositivo, i socket, le FIFO, il passaggio tra filesystem, i collegamenti assoluti o che escono dal percorso consentito e i nomi non sicuri vengono rifiutati. I bit dei privilegi vengono rimossi e la proprietà dei file nel modulo generato viene normalizzata.

La personalizzazione dell'avvio supporta GRUB MiniOS riconosciuto, SYSLINUX nativo e la catena standard da SYSLINUX a GRUB. Le configurazioni di avvio non supportate o ambigue vengono rifiutate anziché interpretate arbitrariamente. Una build senza personalizzazione dell'avvio può mantenere un layout della sorgente che il parser di personalizzazione non è in grado di comprendere.

## Verifica dell’output

Prima della pubblicazione, `minios-image-compose` verifica l’ISO generata, senza affidarsi soltanto al buon esito del `xorriso` processo di creazione. I controlli includono:

- L’albero del filesystem ISO e l’etichetta del volume.
- I record di avvio BIOS e UEFI e l’area di sistema.
- I contenuti richiesti per l’avvio, il kernel, l’initramfs, la configurazione e i moduli.
- Le attestazioni di personalizzazione incorporata e di acquisizione della sessione, se presenti.
- I digest e la struttura dei moduli overlay generati e dei moduli della sessione acquisita.
- Le destinazioni degli sfondi di avvio e la configurazione di avvio trasformata, se personalizzate.

Prima della compilazione vengono registrati l’identità del percorso di input, la modalità, la data di modifica e l’hash SHA-256. Gli input modificabili vengono acquisiti in snapshot privati tramite reflink, se supportati; in caso contrario, si verifica che non vengano modificati prima e dopo la scrittura dell’ISO. In caso di discrepanza o di errore di verifica, la pubblicazione viene impedita.

Dopo una compilazione riuscita, registra separatamente un checksum:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verifica strutturale non sostituisce un test di avvio. Avvia l’ISO in una macchina virtuale temporanea e prova sia BIOS sia UEFI, se si intende supportarli entrambi. Generatore di immagini MiniOS può indicare se QEMU o VirtualBox è installato, ma non avvia né configura un hypervisor.

## Sicurezza e annullamento

- Mantieni i supporti sorgente in sola lettura e scrivi l’output su un filesystem con spazio libero sufficiente per la stima e un margine temporaneo.
- Non compilare direttamente sopra l’unica ISO di cui è nota la validità. Usa un nuovo nome per l’output, a meno che la sostituzione non sia intenzionale e confermata.
- Verifica i moduli esterni prima di aggiungerli. Generatore di immagini MiniOS ne convalida la struttura SquashFS, ma non accerta chi ne abbia creato i contenuti.
- Per le immagini da distribuire, evita di acquisire la sessione. Se l’acquisizione è necessaria, controlla il filesystem risultante, non solo il nome del profilo.
- Considera sensibili i file di progetto quando contengono percorsi espliciti di origine, moduli o output, oppure regole di acquisizione selezionate.

I processi secondari di inventario, compilazione e verifica vengono eseguiti in gruppi di processi dedicati. Le richieste di annullamento avviano la terminazione e, trascorso un periodo di tolleranza, la forzano. Un’operazione di hashing può terminare prima che l’annullamento raggiunga un punto sicuro, ma i risultati obsoleti vengono scartati. Una volta iniziata la pubblicazione atomica, l’operazione viene lasciata terminare, per evitare di lasciare intenzionalmente la destinazione scritta solo in parte.

Una compilazione annullata o non riuscita non pubblica la propria ISO privata. La destinazione precedente resta invariata, a meno che una sostituzione verificata non sia stata pubblicata atomicamente.

## Documentazione correlata

- [Creazione di MiniOS](/development/Building-MiniOS)
- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Composizione di immagini ISO dalla riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

<a id="composing-minios-iso-images-from-the-command-line"></a>

## Composizione di immagini ISO MiniOS dalla riga di comando

`minios-image-compose` è il backend a riga di comando fornito con il Generatore di immagini MiniOS. Sostituisce la dismessa `sb2iso` utility. Il comando rimasterizza un albero di contenuti MiniOS esistente, consente di modificare l’insieme dei moduli e la configurazione supportata, verifica il risultato e pubblica un’ISO avviabile.

Usa l’interfaccia grafica [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) per seguire un flusso di lavoro guidato per il progetto. Usa direttamente questo comando per script, automazione o compilazioni riproducibili da riga di comando. Per una compilazione completa dai sorgenti, usa [Creazione di MiniOS](/development/Building-MiniOS) invece.

### Uso di base

Da una sessione live MiniOS in esecuzione, crea un ISO con la sorgente MiniOS individuata e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Non anteporre all'intero comando `sudo` né `pkexec`. La composizione, la verifica e la pubblicazione vengono eseguite come utente corrente. Solo l'acquisizione facoltativa della sessione può richiamare il backend attendibile `/usr/bin/savechanges` tramite PolicyKit.

Il nome predefinito del file di output è `minios-YYYYMMDD_HHMM.iso`. Se la destinazione esiste già, l'operazione viene rifiutata, a meno che non venga specificato esplicitamente `--overwrite`.

### Selezionare una sorgente

Senza `--source`, il comando individua il contenuto MiniOS usato dalla sessione LiveKit o dracut corrente. Per rimasterizzare un altro albero MiniOS montato, specificare la directory che contiene `boot/` e i moduli MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La sorgente è un input di sola lettura e non viene mai modificata. Prima di usare con la CLI l'albero dei contenuti MiniOS di un file ISO o di un supporto ottico, è necessario montarlo. Il Generatore di immagini MiniOS grafico può montare queste sorgenti tramite `udisksctl`.

### Selezionare i moduli

I moduli `.sb` aggiuntivi sono argomenti posizionali:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Il comando verifica che ogni modulo sia un file SquashFS leggibile e non sia un collegamento simbolico.
I moduli il cui nome inizia con due cifre e un trattino vengono collocati al livello superiore di MiniOS. Gli altri moduli aggiunti vengono collocati in `minios/modules/`. I nomi duplicati o in conflitto senza distinzione tra maiuscole e minuscole vengono rifiutati.

Escludere i percorsi sorgente con un'espressione regolare estesa POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Non è possibile escludere i file di avvio obbligatori, i file del kernel e di initramfs, i moduli principali, il menu di avvio selezionato e la configurazione selezionata.

Crea moduli riutilizzabili prima di comporre l'ISO. Consulta [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules) e [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules).

### Configurazione e manifest

`--config FILE` installa il file normale selezionato in `minios/config.conf`. Il valore predefinito è `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Il manifest è facoltativo e deve essere un oggetto JSON. Le etichette di volume devono contenere da 1 a 32 caratteri ASCII stampabili; quelle che non rispettano l'insieme rigoroso di caratteri ISO 9660 (maiuscole, cifre e trattino basso) generano un avviso.

### Acquisire le modifiche della sessione

L'acquisizione della sessione è facoltativa e si applica al livello scrivibile della sessione MiniOS attualmente in esecuzione. Viene accettata per una sorgente esplicita solo se questa ha la stessa impronta del modulo di base del sistema in esecuzione.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profili disponibili:

- `exact` acquisisce tutte le modifiche rappresentabili e può includere credenziali, dati personali, log, stato del browser e identità della macchina.
- `clean` usa una lista di elementi consentiti ristretta e orientata al software. Riduce l'esposizione, ma non garantisce che il risultato sia privo di segreti.
- `selected` usa una selezione di inventario generata da un frontend compatibile o `savechanges` workflow.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Se l'ISO verrà condivisa, preferisci i moduli e la configurazione dichiarativa all'acquisizione della sessione. Consulta [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) per informazioni sul modello di privacy e sul flusso di revisione.

### Personalizzare il comportamento all'avvio

La CLI può modificare i layout GRUB e SYSLINUX supportati:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accetta `resume`, `new`, `choose`, `fresh`, oppure `toram`. Il modello semantico `new` associa `perchdir=setup` ai menu attuali MiniOS, mentre le voci sorgente legacy `perchdir=new` rimangono riconoscibili. Il generatore grafico del menu di avvio mantiene inoltre `perchtoram=off|trim|full` indipendentemente dall'impostazione `toram` del sistema.
`--menu` accetta `multilang` oppure una lingua supportata, ad esempio `en_US`, `ru_RU`, oppure `de_DE`. Gli argomenti del kernel vengono convalidati e aggiunti senza eseguire comandi nella shell. I layout del menu di avvio non supportati o ambigui vengono rifiutati, anziché modificati per supposizione.

### Aggiungere elementi grafici o un overlay del filesystem

Sostituisci lo sfondo di avvio con un PNG convalidato:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Raggruppa un albero di directory preparato in un modulo overlay immagine con proprietario root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

L'overlay viene interpretato rispetto alla radice dell'immagine. Non esegue script, installa pacchetti né apre un chroot. I link non sicuri, i file speciali, gli attraversamenti tra filesystem e le collisioni nelle destinazioni vengono rifiutati.

### Verifica e pubblicazione

Prima della pubblicazione, `minios-image-compose` verifica l'albero del filesystem ISO, l'etichetta del volume, i record di avvio BIOS e UEFI, l'area di sistema, i file di avvio, i moduli e le personalizzazioni richieste. I moduli overlay generati e quelli delle sessioni acquisite vengono estratti e verificati rispetto ai metadati e ai digest registrati.

L'ISO viene creata in una directory privata sul filesystem di destinazione e pubblicata atomicamente solo dopo il completamento della verifica. Modifiche agli input, errori di verifica, annullamento o spazio insufficiente nella destinazione impediscono la pubblicazione. Una destinazione precedente rimane invariata, a meno che una build `--overwrite` non arrivi alla pubblicazione atomica.

Dopo una build riuscita, crea un checksum ed esegui un test di avvio separato:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verifica strutturale non sostituisce il test dei percorsi BIOS e UEFI previsti in una macchina virtuale usa e getta o su hardware adatto.

### Riferimento dei comandi

Per conoscere i dettagli esatti della versione del backend, consulta il manuale installato e l’output della guida:

```bash
minios-image-compose --help
man minios-image-compose
```

Tra le opzioni più comuni:

| Opzione | Scopo |
|---|---|
| `-n`, `--name FILE` | Imposta il percorso di output. |
| `-e`, `--exclude REGEX` | Esclude i percorsi sorgente corrispondenti. |
| `--source DIR` | Seleziona un albero dei contenuti MiniOS esplicito. |
| `--config FILE` | Seleziona la configurazione attiva incorporata nell’ISO. |
| `--manifest FILE` | Include un manifest di build JSON convalidato. |
| `--capture-changes MODE` | Acquisisci `exact`, `clean`, o `selected` le modifiche della sessione. |
| `--boot-timeout SECONDS` | Imposta un timeout per il menu di avvio da 0 a 300 secondi. |
| `--default-boot MODE` | Seleziona l’azione predefinita della sessione MiniOS. |
| `--kernel-args TEXT` | Aggiunge argomenti globali del kernel convalidati. |
| `--boot-background PNG` | Sostituisce le immagini di avvio supportate. |
| `--overlay-directory DIR` | Aggiunge un livello dichiarativo del filesystem. |
| `--menu TYPE` | Seleziona un menu multilingue o localizzato. |
| `--overwrite` | Consente esplicitamente di sostituire un output esistente. |

Il comando restituisce un codice diverso da zero se i controlli di origine, modulo, personalizzazione, archiviazione, verifica o pubblicazione non vengono superati. Non distribuire un output a meno che il comando non sia stato completato correttamente e che il checksum risultante e i percorsi di avvio siano stati verificati.
