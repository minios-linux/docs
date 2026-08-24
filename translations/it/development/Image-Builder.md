# MiniOS Image Builder

MiniOS Image Builder è un'applicazione GTK per rimasterizzare un'immagine MiniOS esistente. Seleziona il contenuto da una sessione MiniOS attuale, da un file ISO o da un disco ottico, applica personalizzazioni dichiarative e utilizza `minios-image-compose` per produrre un ISO avviabile e verificato.

Il builder viene eseguito all'interno di MiniOS. Non modifica il supporto sorgente selezionato.

## Scegli il flusso di lavoro corretto

Image Builder rimasterizza un'immagine binaria MiniOS esistente. Non sostituisce nessuno di questi flussi di lavoro:

- **Costruire MiniOS dal sorgente:** usa il sistema di build `minios-live` quando modifichi le liste dei pacchetti della distribuzione, la configurazione di build, il layer del kernel, gli artefatti di avvio o la catena di moduli riproducibili compilati dal sorgente. Vedi [Building MiniOS](/development/Building-MiniOS.md).
- **Creare un modulo riutilizzabile:** usa `apt2sb`, `script2sb`, `chroot2sb` o gli altri strumenti per moduli quando il risultato desiderato è un layer `.sb` autonomo. Vedi [Creating modules](/development/Creating-Modules.md).
- **Rimasterizzare un'immagine:** usa Image Builder per selezionare moduli esistenti, aggiungere moduli esterni completati, modificare le impostazioni supportate dell'immagine, eventualmente acquisire le modifiche della sessione e pubblicare un altro ISO.

Il layer filesystem di progetto è destinato a file dichiarativi nella root dell'immagine. Non esegue script, non installa pacchetti e non apre un chroot. Il software destinato al riutilizzo dovrebbe essere preparato come modulo prima di essere aggiunto a un progetto Image Builder.

## Opzioni sorgente

La pagina Sorgente accetta:

- La sessione MiniOS attuale LiveKit o dracut.
- Un file ISO MiniOS.
- Un disco ottico MiniOS.

Le sorgenti ISO e disco ottico vengono montate in sola lettura con `udisksctl`. L'inventario della sorgente registra la release, la versione, l'architettura, il supporto bootloader, la dimensione, l'inventario dei moduli e un'impronta digitale della sorgente. Se una sorgente cambia dopo la pianificazione, la build viene bloccata invece di continuare con un input diverso.

La cattura della sessione descrive sempre le modifiche nella sessione MiniOS attualmente in esecuzione. Quando viene selezionato un ISO o un disco ottico, la cattura è disponibile solo se l'impronta digitale del modulo base di quella sorgente corrisponde al base montato della sessione attiva. Selezionare supporti esterni non cattura le modifiche effettuate su altri sistemi.

## Requisiti

Image Builder richiede il backend `minios-image-compose` corrispondente. Le sorgenti da file ISO e disco ottico richiedono `udisks2`. La lettura di un `/etc/live/config.conf` accessibile solo a root e la cattura di una sessione scrivibile possono richiedere `pkexec` e un agente PolicyKit desktop. La cattura della sessione richiede un `savechanges` compatibile fornito da `minios-tools` versione 1.5.0 o successiva.

L'applicazione e il backend di composizione restano senza privilegi. L'autorizzazione è limitata al lettore di configurazione live fisso e, se selezionato, a `/usr/bin/savechanges` affidabili.

## Flusso di lavoro del progetto

### Seleziona la sorgente

Scegli una sorgente e attendi il completamento dell'inventario. Verifica la sua identità, architettura, supporto boot, diagnostica e numero di moduli. Risolvi eventuali errori della sorgente prima di procedere.

### Seleziona il contenuto

Scegli i moduli sorgente da includere e aggiungi eventuali moduli esterni `.sb`. I moduli core e kernel richiesti sono bloccati. I moduli attivi nella sessione corrente ma assenti dalla sorgente selezionata vengono mostrati separatamente e non sono inclusi automaticamente.

I moduli aggiuntivi devono essere file regolari leggibili con dati SquashFS validi. Basename duplicati o differenziati solo per maiuscole/minuscole e collisioni di destinazione vengono rifiutati perché il runtime risolve i layer in base al basename.

### Configura le impostazioni

Scegli il percorso di output e la configurazione MiniOS attuale richiesta. I campi di personalizzazione vuoti o `Keep current` preservano il comportamento della sorgente. Configura solo le sostituzioni necessarie per la nuova immagine, poi decidi se acquisire il layer di sessione scrivibile.

I byte di `/etc/live/config.conf` vengono copiati nello storage privato di build con modalità 0600. Non vengono interpretati, visualizzati o registrati nei log. I progetti attuali devono includere questa configurazione; un progetto più vecchio che la disabilita esplicitamente non può procedere alla Revisione finché non viene corretto.

### Rivedi il piano

La revisione crea un nuovo piano a partire dalle identità degli input correnti. Controlla i moduli selezionati, esclusi e aggiuntivi, la destinazione di output, lo spazio stimato, il riepilogo delle personalizzazioni, il profilo di cattura, gli avvisi e il confine dei privilegi.

La revisione omette intenzionalmente i valori di configurazione, gli argomenti raw del kernel, i percorsi privati di personalizzazione e i percorsi di cattura selezionati. Mostra conteggi, basename, impronte digitali e digest dove questi sono sufficienti a vincolare il piano.

Se l'output esiste già, la sostituzione richiede conferma. La conferma è legata al dispositivo osservato, inode, dimensione, timestamp e SHA-256 di quel file. Una destinazione cambiata, una cancellazione o un tentativo fallito annullano l'approvazione e richiedono una nuova revisione.

### Costruisci e verifica

La build rivalida ogni input effettivo ed esegue `minios-image-compose` con una lista di argomenti in una directory di lavoro privata. L'ISO rimane privato finché la verifica strutturale non ha successo. La pubblicazione nella destinazione selezionata è atomica.

Salva il progetto se la sorgente, la selezione dei moduli, l'output e l'intento di personalizzazione verranno riutilizzati. I file di progetto sono in formato JSON. Le modifiche non salvate richiedono conferma prima di aprire un altro progetto o chiudere l'applicazione.

## Cattura della sessione e privacy

I moduli sorgente, `/etc/live/config.conf` e la cattura della sessione sono input indipendenti. Se la selezione dei moduli e la personalizzazione dichiarativa sono sufficienti, non acquisire il layer di sessione scrivibile.

### Non includere le modifiche della sessione

Questa è l'opzione predefinita consigliata. Il builder utilizza i moduli selezionati, la configurazione attuale, le impostazioni di avvio e altre personalizzazioni dell'immagine senza copiare il layer di sessione scrivibile.

### Includi tutte le modifiche della sessione

Questo profilo conserva ogni modifica scrivibile supportata dal provider OverlayFS o AUFS rilevato. Può includere password, chiavi, token, dati del browser, identità della macchina, file personali, log e stato dei file eliminati. Richiede un riconoscimento esplicito e non dovrebbe essere usato per un'immagine destinata ad altri senza una verifica separata.

### Includi solo le modifiche riutilizzabili

Questo profilo utilizza una lista di percorsi consentiti rigorosa per il software e impostazioni predefinite sicure, escludendo dati personali, identità, cache e log. Riduce l'esposizione ma non garantisce che i file consentiti non contengano segreti. Ispeziona l'immagine finale prima di condividerla.

### Scegli manualmente le modifiche della sessione

Esegui `Analyze session changes`, quindi seleziona almeno un percorso normalizzato dall'inventario in memoria. Una directory selezionata rappresenta anche i suoi discendenti. Esclusioni esatte o di antenato hanno la precedenza sulle selezioni corrispondenti.

L'inventario contiene metadati, inclusi i nomi dei file, ed è quindi sensibile anche se non contiene i contenuti dei file. Rimane in memoria e non viene scritto nel progetto né copiato in Revisione o nei log. Le regole di inclusione ed esclusione esplicite rappresentano l'intento del progetto e vengono salvate; la Revisione mostra solo il loro conteggio e digest.

Avviare un'altra analisi, aggiornare o cambiare la sorgente, cancellare o fallire, e aprire o creare un progetto azzera l'inventario runtime. Analisi e cattura possono richiedere autorizzazione amministrativa, ma il processo di Image Builder e la composizione dell'ISO non vengono elevati.

## Personalizzazione dell'immagine

Le impostazioni supportate sono limitate e validate dal backend:

- **Impostazioni di sistema:** hostname, fuso orario, target systemd predefinito e servizi abilitati o disabilitati.
- **Sicurezza e accesso:** modalità sudo, PolicyKit, SSH, XRDP, X11, blocco schermo e suggerimento issue consentite.
- **Dati utente:** directory utente validate relative alla root con comportamento di link o bind, ma non entrambi.
- **Comportamento di avvio:** timeout da 0 a 300 secondi, menu della sorgente o menu costruito e voce predefinita selezionata.
- **Voci di avvio:** i template resume, new, choose, fresh e copy-to-RAM possono essere nascosti, riordinati, duplicati e configurati tramite controlli tipizzati per persistenza, modulo, avvio, localizzazione, zRAM e diagnostica.
- **Impostazioni avanzate di avvio:** argomenti kernel globali e per voce validati per opzioni non rappresentate dai controlli tipizzati.
- **Aspetto:** uno sfondo di avvio PNG validato.
- **Layer filesystem di progetto:** una directory reale interpretata rispetto alla root dell'immagine e impacchettata come modulo overlay SquashFS di proprietà root.

Il layer filesystem supporta file regolari, link simbolici relativi sicuri, directory vuote, bit eseguibili e timestamp. Vengono rifiutati nodi di dispositivo, socket, FIFO, attraversamenti di filesystem, link assoluti o che escono dalla root e nomi non sicuri. I bit di privilegio vengono azzerati e la proprietà nel modulo generato viene normalizzata.

La personalizzazione dell'avvio supporta GRUB MiniOS riconosciuto, SYSLINUX nativo e la catena standard SYSLINUX-to-GRUB. Configurazioni di avvio non supportate o ambigue vengono rifiutate invece che interpretate. Una build senza personalizzazione di avvio può preservare un layout sorgente che il parser di personalizzazione non comprende.

## Verifica dell'output

Prima della pubblicazione, `minios-image-compose` verifica l'ISO generato invece di affidarsi solo all'uscita positiva di `xorriso`. I controlli includono:

- L'albero del filesystem ISO e l'etichetta del volume.
- Record di avvio BIOS e UEFI e l'area di sistema.
- Contenuto richiesto di boot, kernel, initramfs, configurazione e moduli.
- Attestazioni di personalizzazione e cattura sessione incorporate quando presenti.
- Digest e struttura dei moduli overlay generati e dei moduli di sessione catturati.
- Destinazioni dello sfondo di avvio e configurazione di boot trasformata se personalizzata.

Identità del percorso di input, modalità, ora di modifica e SHA-256 vengono registrati prima della build. Gli input mutabili vengono snapshot privati tramite reflink quando supportato; altrimenti vengono controllati per mutazione prima e dopo la scrittura dell'ISO. Una discrepanza o un errore di verifica impedisce la pubblicazione.

Dopo una build riuscita, registra separatamente un checksum:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La verifica strutturale non sostituisce un test di avvio. Avvia l'ISO in una macchina virtuale temporanea e testa sia BIOS che UEFI quando entrambi sono previsti come supportati. Image Builder può segnalare che QEMU o VirtualBox sono installati, ma non avvia né configura un hypervisor.

## Sicurezza e annullamento

- Mantieni i supporti sorgente in sola lettura e scrivi l'output su un filesystem con spazio libero sufficiente per la stima e un margine temporaneo.
- Non costruire direttamente sopra l'unico ISO funzionante noto. Usa un nuovo nome di output a meno che la sostituzione non sia intenzionale e confermata.
- Verifica i moduli esterni prima di aggiungerli. Image Builder valida la loro struttura SquashFS ma non stabilisce chi abbia creato i loro contenuti.
- Preferisci nessuna cattura della sessione per immagini da distribuire. Se la cattura è necessaria, verifica il filesystem risultante, non solo il nome del profilo.
- Tratta i file di progetto come sensibili quando contengono percorsi sorgente espliciti, percorsi dei moduli, percorsi di output o regole di cattura selezionate.

Inventario, build e sottoprocessi di verifica vengono eseguiti in gruppi di processi dedicati. La richiesta di annullamento invia una terminazione e si intensifica dopo un periodo di tolleranza. Un passaggio di hashing può terminare prima che l'annullamento raggiunga un checkpoint sicuro, ma i risultati obsoleti vengono scartati. Una volta iniziata la pubblicazione atomica, viene lasciata terminare per evitare che la destinazione resti intenzionalmente scritta solo a metà.

Una build annullata o fallita non pubblica il suo ISO privato. Qualsiasi destinazione precedente rimane invariata a meno che una sostituzione verificata non abbia raggiunto la pubblicazione atomica.

## Documentazione correlata

- [Building MiniOS](/development/Building-MiniOS.md)
- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO](/development/Rebuilding-ISO.md)
