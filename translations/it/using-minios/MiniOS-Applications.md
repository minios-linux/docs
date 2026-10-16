---
updated: 2026-10-15
---

# MiniOS applicazioni

MiniOS offre strumenti grafici e da riga di comando per la configurazione, l’installazione, le sessioni, i moduli, i kernel, il software e la rimasterizzazione delle immagini. Questi strumenti si basano sull’architettura live modulare descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS).

## Disponibilità

Gli strumenti disponibili dipendono dai pacchetti inclusi nell’immagine MiniOS. Per controllare un sistema live in esecuzione, usa `dpkg-query` oppure esamina i moduli dell’immagine e i [manifest dei pacchetti](/reference/Package-and-Edition-Contents).

Un’installazione nativa mantiene la familiare esperienza desktop di MiniOS — la sua identità visiva, l’ambiente desktop selezionato e le applicazioni di uso comune — ma non include il software di gestione specifico di MiniOS, progettato per l’architettura live. Le sessioni, `.sb` i moduli, la gestione modulare dei kernel e flussi di lavoro simili non sono più applicabili; il sistema installato usa quindi i normali strumenti Debian per pacchetti, kernel, configurazione e bootloader.

## Strumenti grafici

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Modifica le impostazioni di avvio e delle nuove sessioni MiniOS | **Configuratore MiniOS** | Per il modello di configurazione live MiniOS. Scrive le impostazioni per un successivo avvio live, senza riconfigurare subito il sistema in esecuzione. | [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Distribuisci MiniOS su un altro disco | **Installatore MiniOS** | Si avvia da una sessione live MiniOS. La modalità live conserva l'intero ambiente live MiniOS; la modalità nativa crea un desktop Debian tradizionale e rimuove il software specifico di MiniOS destinato all'uso live. | [Installatore MiniOS](/installing-minios/MiniOS-Installer) |
| Crea, seleziona, monta, ridimensiona, salva, recupera, cifra o rimuovi sessioni persistenti | **Gestore sessioni MiniOS** | Solo sistemi live MiniOS. Può scrivere le sessioni supportate basate su RAM nel relativo archivio originale, modificare le passphrase LUKS dei volumi scollegati e montare sessioni container inattive per accedere ai file. | [Gestione sessioni](/using-minios/Sessions-and-Persistence) |
| Installa, attiva, esamina o rimuovi kernel MiniOS | **Gestore kernel MiniOS** | Solo sistemi live modulari MiniOS. La creazione dei pacchetti dal repository può aggiungere anche driver compatibili dal catalogo DKMS selezionato MiniOS. | [Gestione kernel](/preparing-and-customizing/Managing-Kernels) |
| Installa applicazioni o crea moduli applicativi a partire dalle ricette del catalogo | **Negozio di applicazioni MiniOS** | Sistemi live MiniOS. La creazione dei moduli può usare il livello della ricetta o un livello base di build specificato; le ricette possono richiedere l'accettazione della licenza. | [Negozio di applicazioni MiniOS](/using-minios/Installing-Software) |
| Crea un'immagine MiniOS personalizzata partendo da una esistente, con una procedura guidata | **Generatore di immagini MiniOS** | Usa la sessione in esecuzione, un ISO o un supporto ottico. Per acquisire una sessione è necessario selezionare la sessione in esecuzione con l'intero set di sorgenti e moduli esterni attivi; l'acquisizione non è disponibile se si selezionano separatamente sorgenti ISO o supporti ottici. | [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Esamina, crea, attiva e seleziona `.sb` moduli | **Gestore moduli MiniOS** | Solo sistemi live MiniOS; la composizione dei moduli e l'attivazione in runtime dipendono dal modello root a livelli`.sb` root. | [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules) |
| Scrivi o leggi immagini disco, formatta lo spazio di archiviazione o cancella un dispositivo | **Utilità disco** | Utility generica per la gestione dello spazio di archiviazione inclusa in MiniOS. La scrittura di immagini grezze non esegue una distribuzione gestita come l'Installatore MiniOS. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility) |
| Consulta offline la documentazione installata | **Guida MiniOS** | Visualizzatore GTK nativo per un pacchetto di documentazione precompilato; non richiede il sito web, WebKit né una connessione di rete durante l'esecuzione. | [Documentazione MiniOS](/) |
| Mostra l'introduzione localizzata al primo avvio | **Benvenuto MiniOS** | Pagina di benvenuto locale nel browser, con Mio, link al progetto, assistenza, community e indicazioni per il supporto. Contiene informazioni introduttive, non configura il sistema. | [Guida rapida](/getting-started/Quick-Start) |

## Strumenti da riga di comando

La maggior parte degli strumenti grafici ha un equivalente accessibile dalla riga di comando o un backend pubblico. Il manifest principale richiede `minios-tools` per ogni edizione e `minios-image-compose`, `minios-deploy`, `minios-kernel` e `minios-session` per le varianti non minime, indipendentemente dagli strumenti desktop grafici. Flux usa la variante `minimum` e per impostazione predefinita non richiede questi quattro backend complementari. Verificare i pacchetti effettivamente installati: le dipendenze e le immagini personalizzate possono aggiungere strumenti non inclusi nel manifest.

### Distribuzione e sessioni

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elencare i dischi di destinazione, visualizzare in anteprima un piano di distribuzione o installare MiniOS senza interazione | **`minios-deploy`** | Viene eseguito da una sessione live MiniOS. L’installazione richiede i privilegi di root e una conferma esplicita; la modalità nativa, se supportata, crea un ambiente desktop Debian tradizionale a partire dall’immagine selezionata. | [Distribuzione dalla riga di comando](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Creare, attivare, salvare, montare, ridimensionare, recuperare, modificare le credenziali di cifratura, esportare, importare o rimuovere sessioni persistenti | **`minios-session`** | Richiede i privilegi di root e un sistema live MiniOS con un archivio di persistenza compatibile. Il salvataggio basato su RAM, i mount scollegati e le operazioni specifiche del backend sono disponibili solo se supportati. | [Riferimento ai comandi per le sessioni](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel e immagini

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elencare, pacchettizzare, attivare, ispezionare o rimuovere kernel | **`minios-kernel`** | Richiede i privilegi di root e un’installazione live modulare MiniOS con una root MiniOS scrivibile. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Ricreare un albero di contenuti MiniOS esistente tramite script o automazione | **`minios-image-compose`** | Opera sui contenuti dell’immagine live MiniOS e genera un ISO avviabile. | [Creazione di immagini ISO dalla riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Flussi di lavoro dei moduli

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Ispezionare i moduli e gestire i set di moduli attivi o previsti al prossimo avvio | **`sb`** | L’ispezione dei moduli è possibile anche al di fuori di una sessione MiniOS attiva. Le operazioni sui moduli attivi e previsti al prossimo avvio richiedono una disposizione dei moduli live MiniOS; per apportare modifiche servono i privilegi di root. | [Ispezionare ed estrarre i moduli](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gestire i moduli attivi e previsti al prossimo avvio](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Creare un modulo a partire da pacchetti dei repository o da file locali`.deb` file | **`apt2sb`** | Richiede i privilegi di root e una sessione live MiniOS supportata. I pacchetti vengono installati in un ambiente di compilazione isolato, non nella root del sistema in esecuzione. | [Creare un modulo a partire da pacchetti](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Creare un modulo eseguendo uno script di installazione | **`script2sb`** | Richiede i privilegi di root e una sessione live MiniOS supportata. Lo script viene eseguito senza interazione in un ambiente di compilazione isolato. | [Creare un modulo da uno script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Creare un modulo in modo interattivo in un ambiente predisposto | **`chroot2sb`** | Richiede i privilegi di root e una sessione live MiniOS supportata. Usare questa opzione se l’installazione richiede prompt o modifiche manuali. | [Creare un modulo in modo interattivo](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convertire un albero di directory in un modulo `.sb` e viceversa | **`dir2sb`**, **`sb2dir`** | La conversione normale non richiede i privilegi di root e può essere eseguita al di fuori di una sessione live. Per estrarre e riconfezionare mantenendo proprietari originali e file speciali servono i privilegi di root; i flussi di lavoro grafici richiedono l’autenticazione dell’amministratore. | [Creare](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) o [estrarre](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un modulo; `man dir2sb`, `man sb2dir` |
| Acquisire le modifiche idonee dal livello scrivibile della sessione e inserirle in un modulo | **`savechanges`** | Richiede i privilegi di root e una sessione live MiniOS in esecuzione con un backend supportato per il livello scrivibile. | [Acquisire le modifiche della sessione corrente](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flussi di lavoro di archiviazione

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Leggere o scrivere immagini disco, formattare un dispositivo o cancellare un’unità di archiviazione | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operazioni generiche sui dischi. La cancellazione supporta i metodi di erase del controller, discard e sovrascrittura host, se supportati dal dispositivo e dagli strumenti necessari. Le operazioni distruttive richiedono normalmente i privilegi di root. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Per modificare gli elenchi dei pacchetti sorgente, i kernel, gli artefatti di avvio o l’intera catena di moduli, usa il sistema di build dei sorgenti invece di uno dei due strumenti di rimasterizzazione delle immagini. Consulta [Compilazione di MiniOS](/development/Building-MiniOS).
