---
updated: 2026-08-26
---

# Applicazioni e strumenti MiniOS

MiniOS include strumenti per configurare, installare, mantenere e rimasterizzare i sistemi MiniOS. Usa questa pagina per scegliere uno strumento, poi segui la guida collegata per requisiti, limiti di sicurezza e dettagli sui comandi.

## Verifica cosa è installato

Gli attuali manifest dei pacchetti Xfce includono il set grafico nelle edizioni Standard, Toolbox e Ultra: Configurator, Installer, Session Manager, Kernel Manager, Store, Image Builder, Module Manager, MiniOS Help e Drive Utility.
L’edizione Flux non include questo set GUI, e le build che usano altri ambienti desktop o console potrebbero non includerlo. Anche la selezione condizionale dei pacchetti varia in base alla suite della distribuzione e alle opzioni di build.

Il set di pacchetti installati o l’immagine completata sono la fonte autorevole. Controlla un sistema in esecuzione con `dpkg-query`, oppure ispeziona i moduli e i manifest dell’immagine come descritto in [Pacchetti ed edizioni](/administration/Packages.md).

## Scegli uno strumento grafico

| Attività | Strumento | Applicabilità live e nativa | Documentazione |
|---|---|---|---|
| Modifica le impostazioni di avvio e di nuova sessione di MiniOS | **MiniOS Configurator** | Per il modello di configurazione live di MiniOS. Scrive le impostazioni per un successivo avvio live e non riconfigura immediatamente il sistema in uso. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| Installa MiniOS su un altro disco | **MiniOS Installer** | Da eseguire da una sessione live di MiniOS. Può creare sia un’installazione live modulare che una classica installazione nativa quando l’immagine supporta la distribuzione nativa. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Crea, seleziona, ridimensiona, salva o rimuovi sessioni persistenti | **MiniOS Session Manager** | Solo per sistemi live. Le installazioni native scrivono direttamente sul filesystem root e non usano le sessioni live di MiniOS. | [Gestione delle sessioni](/configuration/Session-Management.md) |
| Gestisci, attiva, ispeziona o rimuovi kernel MiniOS | **MiniOS Kernel Manager** | Pensato per installazioni live modulari e il relativo repository kernel MiniOS. Su installazioni native, usa il normale flusso di gestione dei pacchetti kernel della distribuzione. | [Gestione kernel](/administration/Kernel-Management.md) |
| Installa applicazioni o crea moduli applicativi da ricette catalogo | **MiniOS Store** | Nei sistemi live, scegli tra installazione come modulo o diretta; la persistenza determina se le modifiche dirette sopravvivono al riavvio. Le installazioni native usano la modalità diretta. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Rimasterizza un’immagine MiniOS esistente tramite un progetto guidato | **MiniOS Image Builder** | Funziona con il contenuto dell’immagine live MiniOS dalla sessione live in esecuzione, da una ISO o da supporto ottico. Crea una nuova ISO live; non gestisce installazioni native né sostituisce una build sorgente. | [MiniOS Image Builder](/development/Image-Builder.md) |
| Ispeziona, crea, attiva e seleziona moduli `.sb` | **MiniOS Module Manager** | La composizione dei moduli e l’attivazione runtime sono caratteristiche dei sistemi live. Le installazioni native non usano il modello root stratificato `.sb`. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Consulta la documentazione MiniOS installata | **MiniOS Help** | Visualizzatore di documentazione locale. Può essere usato ovunque siano installati il pacchetto `minios-help` e il relativo set di documentazione. | [Documentazione MiniOS](/) |
| Scrivi una ISO MiniOS su una chiavetta USB | **Drive Utility** | Può essere eseguito in un sistema grafico live o nativo se installato. Scrive supporti avviabili; non esegue una distribuzione live o nativa come MiniOS Installer. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Scegli uno strumento da riga di comando

Il manifest core condiviso attualmente include `minios-tools` e `minios-image-compose`, anche nell’edizione Flux. La loro presenza in uno specifico sistema o immagine installata deve comunque essere verificata direttamente.

### Gestire moduli e modifiche di sessione

Utilizza gli strumenti CLI core di MiniOS quando hai bisogno di un flusso di lavoro modulare e scriptabile:

- `sb` ispeziona i moduli e gestisce i set di moduli attivi e al prossimo avvio.
- `apt2sb`, `script2sb` e `chroot2sb` costruiscono moduli in un ambiente isolato.
- `dir2sb` e `sb2dir` convertono tra alberi di directory e moduli `.sb`.
- `savechanges` cattura le modifiche idonee da una sessione live scrivibile in un modulo.
- `rmsbdir` rimuove una directory di estrazione modulo con i necessari controlli di sicurezza.

La maggior parte delle operazioni di build, cattura, attivazione e impostazione per il prossimo avvio dipendono da un layout modulare live di MiniOS. Le conversioni e ispezioni di base dei file possono essere utili anche fuori da una sessione live in esecuzione, se sono disponibili gli strumenti e i file richiesti.
Consulta [Creazione dei moduli](/development/Creating-Modules.md) per privilegi, regole di output e flussi di lavoro dei comandi attuali.

### Comporre una ISO MiniOS

Usa `minios-image-compose` per script, automazione o una rimasterizzazione riproducibile da riga di comando di un albero di contenuti MiniOS esistente. Può selezionare moduli, applicare la configurazione dell’immagine supportata, opzionalmente catturare modifiche compatibili da sessioni live, verificare il risultato e pubblicare una ISO avviabile. Opera sul contenuto dell’immagine live MiniOS e non converte né aggiorna un’installazione nativa. Vedi [Composizione di immagini ISO MiniOS da riga di comando](/development/Rebuilding-ISO.md).

Per modifiche alle liste dei pacchetti sorgente, kernel, artefatti di boot o all’intera catena di moduli, utilizza il sistema di build sorgente invece di uno degli strumenti di rimasterizzazione dell’immagine. Consulta [Build di MiniOS](/development/Building-MiniOS.md).
