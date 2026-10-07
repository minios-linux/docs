---
updated: 2026-10-06
---

# applicazioni MiniOS

MiniOS offre strumenti grafici e da riga di comando per la configurazione, l'installazione, le sessioni, i moduli, i kernel, il software e la rimasterizzazione delle immagini. Questi strumenti sono progettati sulla base dell'architettura live modulare descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS).

## Disponibilità

Gli strumenti disponibili dipendono dai pacchetti inclusi nell'immagine MiniOS. È possibile verificare un sistema live in esecuzione con `dpkg-query`, oppure ispezionare i moduli dell'immagine e [manifest dei pacchetti](/reference/Package-and-Edition-Contents).

Un'installazione nativa mantiene l'esperienza desktop familiare di MiniOS — la sua identità visiva, l'ambiente desktop selezionato e le applicazioni standard — ma non conserva il software di gestione specifico di MiniOS progettato per l'architettura live. Le sessioni, `.sb` i moduli, la gestione modulare del kernel e flussi di lavoro simili non sono più applicabili, quindi il sistema installato utilizza i normali strumenti Debian per pacchetti, kernel, configurazione e bootloader.

## Strumenti grafici

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Modifica le impostazioni di avvio e di nuova sessione di MiniOS | **Configuratore MiniOS** | Per il modello di configurazione live MiniOS. Scrive le impostazioni per un successivo avvio live e non riconfigura immediatamente il sistema in esecuzione. | [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Distribuisci MiniOS su un altro disco | **Installatore MiniOS** | Si avvia da una sessione live MiniOS. La modalità live mantiene l'ambiente live completo di MiniOS; la modalità nativa crea un desktop Debian convenzionale e rimuove il software specifico di MiniOS destinato all'uso live. | [Installatore MiniOS](/installing-minios/MiniOS-Installer) |
| Crea, seleziona, monta, ridimensiona, salva, recupera, cifra o rimuovi sessioni persistenti | **Gestore sessioni MiniOS** | Solo per sistemi live MiniOS. Può salvare sessioni supportate basate su RAM sullo store originale, cambiare le passphrase LUKS scollegate e montare sessioni container inattive per l'accesso ai file. | [Gestione sessioni](/using-minios/Sessions-and-Persistence) |
| Pacchettizza, attiva, ispeziona o rimuovi kernel MiniOS | **Gestore kernel MiniOS** | Solo per sistemi live modulari MiniOS. Il pacchettizzamento dal repository può anche aggiungere driver compatibili dal catalogo DKMS curato di MiniOS. | [Gestione kernel](/preparing-and-customizing/Managing-Kernels) |
| Installa applicazioni o crea moduli applicativi da ricette del catalogo | **Negozio di applicazioni MiniOS** | Sistemi live MiniOS. La creazione dei moduli può mantenere un livello di ricetta o utilizzare un livello di build-base esplicito; alcune ricette possono richiedere l'accettazione della licenza. | [Negozio di applicazioni MiniOS](/using-minios/Installing-Software) |
| Rimasterizza un'immagine MiniOS esistente tramite un progetto guidato | **Generatore di immagini MiniOS** | Funziona con i contenuti dell'immagine live MiniOS dalla sessione live in esecuzione, da un ISO o da supporti ottici. Permette di selezionare moduli, acquisire modifiche di sessione e configurare il comportamento del menu di avvio prima di produrre un altro ISO live verificato. | [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Ispeziona, crea, attiva e seleziona `.sb`moduli | **Gestore moduli MiniOS** | Solo per sistemi live MiniOS; la composizione dei moduli e l'attivazione runtime dipendono dal modello `.sb`root a livelli. | [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules) |
| Scrivi/leggi immagini disco, formatta dispositivi di archiviazione o cancella un dispositivo | **Utilità disco** | Utility di archiviazione generica inclusa in MiniOS. La scrittura di immagini raw non esegue un deployment gestito come l'Installatore MiniOS. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility) |
| Consulta la documentazione installata offline | **Guida MiniOS** | Visualizzatore GTK nativo per un pacchetto di documentazione precompilato; non richiede sito web, WebKit o connessione di rete durante l'uso. | [documentazione MiniOS](/) |
| Mostra l'introduzione localizzata al primo avvio | **Benvenuto MiniOS** | Pagina di benvenuto locale basata su browser, con Mio, link al progetto, aiuto, community e suggerimenti di supporto. È un contenuto introduttivo, non un configuratore di sistema. | [Guida rapida](/getting-started/Quick-Start) |

## Strumenti da riga di comando

La maggior parte degli strumenti grafici ha una controparte pubblica da riga di comando o un backend. Questi comandi sono forniti nello stesso pacchetto dell'applicazione grafica o in un pacchetto complementare richiesto. Il manifest core condiviso include `minios-tools` e `minios-image-compose`. Gli altri comandi seguono la disponibilità dei relativi pacchetti grafici. La loro presenza in un sistema o immagine installata deve comunque essere verificata direttamente.

### Deployment e sessioni

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elenca i dischi di destinazione, visualizza in anteprima un piano di deployment o installa MiniOS in modalità non interattiva | **`minios-deploy`** | Si avvia da una sessione live MiniOS. L'installazione richiede privilegi root e conferma esplicita; la modalità nativa, se supportata, crea un desktop Debian convenzionale dall'immagine selezionata. | [Deployment da riga di comando](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Crea, attiva, salva, monta, ridimensiona, recupera, modifica le credenziali di cifratura, esporta, importa o rimuovi sessioni persistenti | **`minios-session`** | Richiede privilegi root e un sistema live MiniOS con uno store di persistenza compatibile. Il salvataggio su backend RAM, i mount scollegati e le operazioni specifiche del backend sono soggetti a capacità. | [Riferimento comandi sessione](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel e immagini

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elenca, pacchettizza, attiva, ispeziona o rimuovi kernel | **`minios-kernel`** | Richiede privilegi root e un'installazione live modulare MiniOS con una root MiniOS scrivibile. | [`minios-kernel`CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Rimasterizza una struttura di contenuti MiniOS esistente tramite script o automazione | **`minios-image-compose`** | Opera sui contenuti dell'immagine live MiniOS e pubblica un ISO avviabile. | [Composizione immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Flussi di lavoro dei moduli

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Ispeziona i moduli e gestisci i set di moduli in esecuzione o al prossimo avvio | **`sb`** | L'ispezione dei moduli funziona anche al di fuori di una sessione MiniOS attiva. Le operazioni di esecuzione e di prossimo avvio richiedono un layout moduli live MiniOS; le modifiche richiedono privilegi root. | [Ispeziona ed estrai moduli](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gestisci moduli attivi e al prossimo avvio](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Crea un modulo da pacchetti del repository o da `.deb`file locali | **`apt2sb`** | Richiede privilegi root e una sessione live MiniOS supportata. I pacchetti vengono installati in un ambiente di build isolato, non nella root in esecuzione. | [Crea un modulo da pacchetti](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Crea un modulo eseguendo uno script di installazione | **`script2sb`** | Richiede privilegi root e una sessione live MiniOS supportata. Lo script viene eseguito in modo non interattivo in un ambiente di build isolato. | [Crea un modulo da uno script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Crea un modulo in modo interattivo in un ambiente preparato | **`chroot2sb`** | Richiede privilegi root e una sessione live MiniOS supportata. Usalo quando l'installazione richiede prompt o modifiche manuali. | [Crea un modulo in modo interattivo](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Converti tra una struttura di directory e un `.sb`modulo | **`dir2sb`**, **`sb2dir`** | La conversione ordinaria non richiede root e può essere eseguita anche fuori da una sessione live. L'estrazione fedele e il reimpacchettamento con proprietari originali e file speciali richiedono root; i flussi di lavoro grafici richiedono autenticazione amministratore. | [Crea](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) o [estrai](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un modulo; `man dir2sb`, `man sb2dir` |
| Acquisisci le modifiche idonee dal layer di sessione scrivibile in un modulo | **`savechanges`** | Richiede privilegi root e una sessione live MiniOS in esecuzione con un backend di layer scrivibile supportato. | [Acquisisci le modifiche della sessione corrente](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flussi di lavoro di archiviazione

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Leggi o scrivi immagini disco, formatta un dispositivo o cancella uno storage | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operazioni disco generiche. La cancellazione supporta i metodi di erase del controller, discard e sovrascrittura da host dove il dispositivo e gli strumenti richiesti lo permettono. Le operazioni distruttive richiedono normalmente privilegi root. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Per modifiche alle liste dei pacchetti sorgente, kernel, artefatti di avvio o all'intera catena dei moduli, utilizzare il sistema di build dei sorgenti invece degli strumenti di rimasterizzazione delle immagini. Vedi [Compilazione di MiniOS](/development/Building-MiniOS).
