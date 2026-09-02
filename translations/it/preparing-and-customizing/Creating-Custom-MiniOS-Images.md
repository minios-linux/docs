---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Creazione di immagini personalizzate MiniOS

Generatore di immagini MiniOS è un'applicazione GTK per rimasterizzare un'immagine MiniOS esistente. Seleziona i contenuti da una sessione MiniOS attuale, da un file ISO o da un disco ottico, applica personalizzazioni dichiarative e utilizza `minios-image-compose` per produrre una ISO avviabile e verificata.

Il generatore viene eseguito all'interno di MiniOS. Non modifica il supporto sorgente selezionato.

## Scegli il workflow corretto

Il Generatore di immagini MiniOS rimasterizza un'immagine binaria MiniOS esistente. Non sostituisce nessuno di questi workflow:

- **Compila MiniOS dal sorgente:** usa il `minios-live` sistema di build quando modifichi le liste dei pacchetti della distribuzione, la configurazione di build, il livello del kernel, gli artefatti di avvio o la catena di moduli riproducibile compilata dal sorgente. Vedi [Compilare MiniOS](/development/Building-MiniOS).
- **Crea un modulo riutilizzabile:** usa `apt2sb`, `script2sb`, `chroot2sb`, o gli altri strumenti per moduli quando il risultato desiderato è un livello standalone `.sb` layer. Vedi [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Rimasterizza un'immagine:** usa il Generatore di immagini MiniOS quando selezioni moduli esistenti, aggiungi moduli esterni completati, modifichi le impostazioni supportate dell'immagine, acquisisci facoltativamente le modifiche della sessione e pubblichi un'altra ISO.

Il livello filesystem del progetto è destinato ai file dichiarativi nella root dell'immagine. Non esegue script, non installa pacchetti e non apre un chroot. Il software destinato al riutilizzo deve essere preparato come modulo prima di essere aggiunto a un progetto Generatore di immagini MiniOS.

## Opzioni sorgente

La pagina Sorgente accetta:

- La sessione MiniOS LiveKit o dracut corrente.
- Un file ISO MiniOS.
- Un disco ottico MiniOS.

Le sorgenti ISO e disco ottico vengono montate in sola lettura con `udisksctl`. L'inventario della sorgente registra il rilascio, la versione, l'architettura, il supporto bootloader, la dimensione, l'inventario dei moduli e un'impronta digitale della sorgente. Se una sorgente cambia dopo la pianificazione, la build viene bloccata invece di continuare con un input diverso.

La cattura della sessione descrive sempre le modifiche nella sessione MiniOS attualmente in esecuzione. Quando viene selezionato un ISO o un disco ottico, la cattura è disponibile solo se l'impronta digitale del modulo base di quella sorgente corrisponde alla base montata della sessione in esecuzione. Selezionare un supporto esterno non cattura le modifiche apportate su un altro sistema.

## Requisiti

Il Generatore di immagini MiniOS richiede il backend `minios-image-compose` corrispondente. Le sorgenti da file ISO e disco ottico richiedono `udisks2`. La lettura di un `/etc/live/config.conf` accessibile solo come root e l'acquisizione di una sessione scrivibile possono richiedere `pkexec` e un agente PolicyKit per desktop. L'acquisizione della sessione richiede un `savechanges` compatibile fornito da `minios-tools` versione 1.5.0 o successiva.

L'applicazione e il backend di composizione restano senza privilegi. L'autorizzazione è limitata al lettore live-configuration fisso e, se selezionato, a `/usr/bin/savechanges` considerati affidabili.

## Flusso di lavoro del progetto

### Seleziona la sorgente

Scegli una sorgente e attendi il completamento dell'inventario. Esamina la sua identità, architettura, supporto all'avvio, diagnostica e conteggio dei moduli. Risolvi eventuali errori della sorgente prima di procedere.

### Seleziona il contenuto

Scegli i moduli sorgente da includere e aggiungi eventuali moduli esterni `.sb`. I moduli core e kernel richiesti sono bloccati. I moduli attivi nella sessione corrente ma assenti dalla sorgente selezionata vengono mostrati separatamente e non sono inclusi automaticamente.

I moduli aggiuntivi devono essere file regolari leggibili con dati SquashFS validi. Basename duplicati o differenziati solo per maiuscole/minuscole e collisioni di destinazione vengono rifiutati perché il runtime risolve i layer in base al basename.

### Configura le impostazioni

Scegli il percorso di output e la configurazione MiniOS corrente richiesta. I campi di personalizzazione vuoti o `Keep current` preservano il comportamento della sorgente. Configura solo le sostituzioni necessarie per la nuova immagine, poi decidi se acquisire il layer di sessione scrivibile.

I byte di `/etc/live/config.conf` vengono copiati nello storage privato di build con modalità 0600. Non vengono interpretati, visualizzati o registrati. I progetti attuali devono includere questa configurazione; un progetto precedente che la disabilita esplicitamente non può procedere alla Revisione finché non viene corretto.

### Rivedi il piano

La revisione crea un nuovo piano dagli input correnti. Controlla i moduli selezionati, esclusi e aggiuntivi, la posizione di output, lo spazio stimato, il riepilogo delle personalizzazioni, il profilo di cattura, gli avvisi e il confine dei privilegi.

La revisione omette intenzionalmente i valori di configurazione, gli argomenti raw del kernel, i percorsi privati di personalizzazione e i percorsi di cattura selezionati. Mostra conteggi, basename, impronte digitali e digest dove questi sono sufficienti a vincolare il piano.

Se l'output esiste già, la sostituzione richiede conferma. La conferma è legata al dispositivo osservato, inode, dimensione, timestamp e SHA-256 di quel file. Una destinazione cambiata, una cancellazione o un tentativo fallito annullano l'approvazione e richiedono una nuova revisione.

### Costruisci e verifica

La build rivalida ogni input effettivo ed esegue `minios-image-compose` con una lista di argomenti in una directory di lavoro privata. L'ISO rimane privato finché la verifica strutturale non ha successo. La pubblicazione nella destinazione selezionata è atomica.

Salva il progetto se la sua sorgente, la selezione dei moduli, l'output e l'intento di personalizzazione verranno riutilizzati. I file di progetto sono in formato JSON. Le modifiche non salvate richiedono conferma prima di aprire un altro progetto o chiudere l'applicazione.

## Cattura della sessione e privacy

I moduli sorgente, `/etc/live/config.conf` e la cattura della sessione sono input indipendenti. Se la selezione dei moduli e la personalizzazione dichiarativa sono sufficienti, non acquisire il layer di sessione scrivibile.

### Non includere le modifiche della sessione

Questa è l'impostazione predefinita consigliata. Il builder utilizza i moduli selezionati, la configurazione corrente, le impostazioni di boot e le altre personalizzazioni dell'immagine senza copiare il layer di sessione scrivibile.

### Includi tutte le modifiche della sessione

Questo profilo conserva ogni modifica scrivibile supportata dal provider OverlayFS o AUFS rilevato. Può includere password, chiavi, token, dati del browser, identità della macchina, file personali, log e stato dei file eliminati. Richiede un riconoscimento esplicito e non dovrebbe essere usato per un'immagine destinata ad altri senza una verifica separata.

### Includi solo modifiche riutilizzabili

Questo profilo utilizza una rigorosa allowlist di percorsi per il software e impostazioni predefinite sicure, omettendo stati personali, di identità, cache e log. Riduce l'esposizione ma non garantisce che i file consentiti non contengano segreti. Ispeziona l'immagine finale prima di condividerla.

### Seleziona manualmente le modifiche della sessione

Esegui `Analyze session changes`, quindi seleziona almeno un percorso normalizzato dall'inventario in memoria. Una directory selezionata rappresenta anche i suoi discendenti. Le esclusioni esatte o degli antenati hanno la precedenza sulle selezioni corrispondenti.

L'inventario contiene metadati, inclusi i nomi dei file, ed è quindi sensibile anche se non contiene i contenuti dei file. Rimane in memoria e non viene scritto nel progetto né copiato in Revisione o nei log. Le regole di inclusione ed esclusione esplicite rappresentano l'intento del progetto e vengono salvate; Revisione mostra solo il numero e il digest di queste regole.

L'avvio di un'altra analisi, l'aggiornamento o il cambio della sorgente, la cancellazione o il fallimento, e l'apertura o la creazione di un progetto azzerano l'inventario in esecuzione. Analisi e acquisizione possono richiedere autorizzazione amministrativa, ma il processo Generatore di immagini MiniOS e la composizione ISO non sono eseguiti con privilegi elevati.

## Personalizzazione dell'immagine

Le impostazioni supportate sono vincolate e validate dal backend:

- **Impostazioni di sistema:** hostname, fuso orario, target systemd predefinito e servizi abilitati o disabilitati.
- **Sicurezza e accesso:** modalità sudo, PolicyKit, SSH, XRDP, X11, blocco schermo e issue-hint consentite tramite allowlist.
- **Dati utente:** directory utente validate relative alla root con comportamento di link o bind, ma non entrambi.
- **Comportamento di avvio:** timeout da 0 a 300 secondi, menu sorgente o menu costruito e voce predefinita selezionata.
- **Voci di avvio:** i template resume, new, choose, fresh e copy-to-RAM possono essere nascosti, riordinati, duplicati e configurati tramite controlli tipizzati per persistenza, modulo, avvio, localizzazione, zRAM e diagnostica.
- **Impostazioni di avvio avanzate:** argomenti kernel globali e per voce validati per opzioni non rappresentate da controlli tipizzati.
- **Aspetto:** uno sfondo di avvio PNG validato.
- **Layer filesystem del progetto:** una directory reale interpretata rispetto alla root dell'immagine e impacchettata come modulo overlay SquashFS di proprietà root.

Il layer filesystem supporta file regolari, link simbolici relativi sicuri, directory vuote, bit eseguibili e timestamp. Nodi di dispositivo, socket, FIFO, attraversamenti di filesystem, link assoluti o che escono dalla root e nomi non sicuri vengono rifiutati. I bit di privilegio vengono rimossi e la proprietà nel modulo generato viene normalizzata.

La personalizzazione dell'avvio supporta GRUB MiniOS riconosciuto, SYSLINUX nativo e la catena standard SYSLINUX-to-GRUB. Configurazioni di avvio non supportate o ambigue vengono rifiutate invece che interpretate. Una build senza personalizzazione del boot può preservare un layout sorgente che il parser di personalizzazione non comprende.

## Verifica dell'output

Prima della pubblicazione, `minios-image-compose` verifica l'ISO generato invece di affidarsi solo all'esito positivo di `xorriso`. I controlli includono:

- L'albero del filesystem ISO e l'etichetta del volume.
- I record di avvio BIOS e UEFI e l'area di sistema.
- I file richiesti per l'avvio, kernel, initramfs, configurazione e contenuti dei moduli.
- Personalizzazioni incorporate e attestazioni di acquisizione della sessione, se presenti.
- Digest e struttura degli overlay generati e dei moduli di sessione acquisiti.
- Target di sfondo di avvio e configurazione di avvio trasformata, se personalizzata.

Identità del percorso di input, modalità, data di modifica e SHA-256 vengono registrati prima della build. Gli input modificabili vengono salvati privatamente tramite reflink quando supportato; in caso contrario, vengono controllati per eventuali modifiche prima e dopo la scrittura dell'ISO. Una discrepanza o un errore di verifica impedisce la pubblicazione.

Dopo una build riuscita, registra separatamente un checksum:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verifica strutturale non sostituisce un test di avvio. Avvia l'ISO in una macchina virtuale temporanea e testa sia BIOS che UEFI se entrambi sono previsti come supportati. Il Generatore di immagini MiniOS può segnalare se QEMU o VirtualBox sono installati, ma non avvia né configura un hypervisor.

## Sicurezza e annullamento

- Mantieni i supporti sorgente in sola lettura e scrivi l'output su un filesystem con spazio libero sufficiente per la stima e il margine temporaneo.
- Non sovrascrivere direttamente l'unico ISO funzionante conosciuto. Usa un nuovo nome di output, a meno che la sostituzione non sia intenzionale e confermata.
- Verifica i moduli esterni prima di aggiungerli. Il Generatore di immagini MiniOS ne valida la struttura SquashFS, ma non stabilisce chi abbia creato i loro contenuti.
- Preferisci non acquisire la sessione per immagini da distribuire. Se l'acquisizione è necessaria, controlla il filesystem risultante, non solo il nome del profilo.
- Considera sensibili i file di progetto quando contengono percorsi sorgente espliciti, percorsi dei moduli, percorsi di output o regole di acquisizione selezionate.

I sottoprocessi di inventario, build e verifica vengono eseguiti in gruppi di processi dedicati. Una richiesta di annullamento comporta la terminazione e viene intensificata dopo un periodo di tolleranza. Un passaggio di hashing può terminare prima che l'annullamento raggiunga un checkpoint sicuro, ma i risultati obsoleti vengono scartati. Una volta iniziata la pubblicazione atomica, questa viene completata per evitare che la destinazione sia lasciata intenzionalmente a metà.

Una build annullata o fallita non pubblica il suo ISO privato. Qualsiasi destinazione precedente rimane invariata, a meno che una sostituzione verificata non abbia raggiunto la pubblicazione atomica.

## Documentazione correlata

- [Compilare MiniOS](/development/Building-MiniOS)
- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Composizione di immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Composizione di immagini ISO MiniOS da riga di comando

`minios-image-compose` è il backend da riga di comando fornito con il Generatore di immagini MiniOS. Sostituisce l'utilità `sb2iso` ora ritirata. Il comando rimasterizza un albero di contenuti MiniOS esistente, opzionalmente modifica il set di moduli e la configurazione supportata, verifica il risultato e pubblica un ISO avviabile.

Usa l'interfaccia grafica [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) per un flusso di lavoro guidato. Usa direttamente questo comando per script, automazione o build riproducibili da riga di comando. Per una build completa dal sorgente, usa invece [Building MiniOS](/development/Building-MiniOS).

### Utilizzo di base

Da una sessione live MiniOS in esecuzione, crea una ISO con la sorgente MiniOS rilevata e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Non anteporre il comando completo con `sudo` o `pkexec`. Composizione, verifica e pubblicazione vengono eseguite come utente corrente. Solo la cattura opzionale della sessione può invocare il backend fidato `/usr/bin/savechanges` tramite PolicyKit.

Il nome di output predefinito è `minios-YYYYMMDD_HHMM.iso`. Una destinazione già esistente viene rifiutata a meno che non venga specificato esplicitamente `--overwrite`.

### Seleziona una sorgente

Senza `--source`, il comando rileva i contenuti MiniOS usati dalla sessione LiveKit o dracut corrente. Per rimasterizzare un altro albero MiniOS montato, specifica la directory che contiene `boot/` e i moduli MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La sorgente è un input in sola lettura e non viene mai modificata. I file ISO e i supporti ottici devono essere montati prima di usare il loro albero di contenuti MiniOS con la CLI. L'interfaccia grafica del Generatore di immagini MiniOS può montare queste sorgenti tramite `udisksctl`.

### Seleziona moduli

Moduli aggiuntivi `.sb` sono argomenti posizionali:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Il comando verifica che ogni modulo sia un file SquashFS leggibile e non sia un collegamento simbolico.
I moduli il cui nome inizia con due cifre e un trattino vengono posizionati al livello superiore MiniOS. Gli altri moduli aggiunti vengono inseriti in `minios/modules/`. I duplicati o collisioni di basename senza distinzione tra maiuscole e minuscole vengono rifiutati.

Escludi i percorsi sorgente con un'espressione regolare estesa POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

I file di avvio richiesti, i file kernel e initramfs, i moduli core, il menu di avvio selezionato e la configurazione selezionata non possono essere esclusi.

Crea moduli riutilizzabili prima di comporre l'ISO. Vedi [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules) e [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules).

### Configurazione e manifest

`--config FILE` installa il file regolare selezionato come `minios/config.conf`. Il valore predefinito è `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Il manifest opzionale deve essere un oggetto JSON. Le etichette dei volumi devono contenere da 1 a 32 caratteri ASCII stampabili; etichette al di fuori del set rigoroso ISO 9660 (maiuscole, cifre e underscore) generano un avviso.

### Acquisisci le modifiche della sessione

L'acquisizione della sessione è opzionale e si applica al layer scrivibile della sessione MiniOS attualmente in esecuzione. È accettata per una sorgente esplicita solo quando quella sorgente ha la stessa impronta digitale del modulo di base del sistema in esecuzione.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

I profili disponibili sono:

- `exact` acquisisce ogni modifica rappresentabile e può includere credenziali, dati personali, log, stato del browser e identità della macchina.
- `clean` utilizza una allowlist ristretta orientata al software. Riduce l'esposizione ma non garantisce che il risultato non contenga segreti.
- `selected` utilizza una selezione dell'inventario prodotta da un frontend compatibile o da un flusso di lavoro `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Preferisci moduli e configurazioni dichiarative rispetto all'acquisizione della sessione quando l'ISO sarà condiviso. Vedi [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) per il modello di privacy e il flusso di revisione.

### Personalizza il comportamento di avvio

La CLI può modificare i layout supportati di GRUB e SYSLINUX:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accetta `resume`, `new`, `choose`, `fresh` o `toram`.
`--menu` accetta `multilang` o una lingua supportata come `en_US`, `ru_RU` o `de_DE`. Gli argomenti del kernel vengono validati e aggiunti senza valutazione da shell. Layout di menu di avvio non supportati o ambigui vengono rifiutati invece che modificati in modo approssimativo.

### Aggiungi artwork o un overlay filesystem

Sostituisci lo sfondo di avvio con un PNG validato:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Impacchetta un albero di directory preparato come modulo overlay di immagine di proprietà di root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

L'overlay viene interpretato rispetto alla root dell'immagine. Non esegue script, non installa pacchetti e non apre chroot. Link non sicuri, file speciali, attraversamenti di filesystem e collisioni di destinazione vengono rifiutati.

### Verifica e pubblicazione

Prima della pubblicazione, `minios-image-compose` verifica l'albero del filesystem ISO, l'etichetta del volume, i record di avvio BIOS e UEFI, l'area di sistema, i file di boot, i moduli e le personalizzazioni richieste. I moduli overlay generati e quelli di sessione catturata vengono estratti e controllati rispetto ai metadati e ai digest registrati.

La ISO viene costruita in una directory privata sul filesystem di destinazione e pubblicata in modo atomico solo dopo che la verifica è andata a buon fine. Mutazioni degli input, errori di verifica, cancellazione o spazio insufficiente nella destinazione impediscono la pubblicazione. Una destinazione precedente rimane invariata a meno che una build `--overwrite` approvata esplicitamente non raggiunga la pubblicazione atomica.

Crea un checksum ed esegui un test di avvio separato dopo una build riuscita:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verifica strutturale non sostituisce il test dei percorsi BIOS e UEFI previsti in una macchina virtuale usa e getta o su hardware adatto.

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
| `--source DIR` | Seleziona un albero di contenuti MiniOS esplicito. |
| `--config FILE` | Seleziona la configurazione live incorporata nella ISO. |
| `--manifest FILE` | Includi un manifest di build JSON validato. |
| `--capture-changes MODE` | Cattura le modifiche di sessione `exact`, `clean` o `selected`. |
| `--boot-timeout SECONDS` | Imposta un timeout del menu di avvio da 0 a 300 secondi. |
| `--default-boot MODE` | Seleziona l'azione di sessione MiniOS predefinita. |
| `--kernel-args TEXT` | Aggiungi argomenti globali del kernel validati. |
| `--boot-background PNG` | Sostituisci l'artwork di avvio supportato. |
| `--overlay-directory DIR` | Aggiungi un layer filesystem dichiarativo. |
| `--menu TYPE` | Seleziona un menu multilingue o localizzato. |
| `--overwrite` | Consenti esplicitamente la sostituzione di un output esistente. |

Il comando termina con codice di uscita diverso da zero se i controlli su sorgente, moduli, personalizzazione, storage, verifica o pubblicazione falliscono. Non distribuire un output a meno che il comando non sia stato completato con successo e siano stati testati checksum e percorsi di avvio risultanti.
