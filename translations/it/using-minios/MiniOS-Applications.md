---
updated: 2026-08-31
---

# MiniOS applicazioni

MiniOS offre strumenti grafici e da riga di comando per la configurazione, l'installazione, le sessioni, i moduli, i kernel, il software e la rimasterizzazione delle immagini. Questi strumenti sono progettati attorno all'architettura live modulare descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS).

## Disponibilità

Gli strumenti disponibili dipendono dai pacchetti inclusi nell'immagine MiniOS. Verifica un sistema live in esecuzione con `dpkg-query`, oppure ispeziona i moduli dell'immagine e i [manifest dei pacchetti](/reference/Package-and-Edition-Contents).

Un'installazione nativa mantiene la familiare esperienza desktop MiniOS — la sua identità visiva, l'ambiente desktop selezionato e le applicazioni ordinarie — ma non conserva il software di gestione specifico MiniOS progettato per l'architettura live. Sessioni, moduli `.sb`, gestione modulare del kernel e flussi di lavoro simili non sono più applicabili, quindi il sistema installato utilizza invece i normali strumenti Debian per pacchetti, kernel, configurazione e bootloader.

## Strumenti grafici

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Modifica delle impostazioni di avvio e di nuova sessione MiniOS | **Configuratore MiniOS** | Per il modello di configurazione live MiniOS. Scrive le impostazioni per un successivo avvio live e non riconfigura immediatamente il sistema in esecuzione. | [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Distribuire MiniOS su un altro disco | **Installatore MiniOS** | Si avvia da una sessione live MiniOS. La modalità live mantiene l'ambiente live completo MiniOS; la modalità nativa crea un desktop Debian convenzionale e rimuove il software specifico MiniOS destinato all'uso live. | [Installatore MiniOS](/installing-minios/MiniOS-Installer) |
| Creare, selezionare, ridimensionare, salvare o rimuovere sessioni persistenti | **Gestore sessioni MiniOS** | Solo per sistemi live MiniOS. | [Gestione delle sessioni](/using-minios/Sessions-and-Persistence) |
| Impacchettare, attivare, ispezionare o rimuovere kernel MiniOS | **Gestore kernel MiniOS** | Solo per sistemi live modulari MiniOS. | [Gestione kernel](/preparing-and-customizing/Managing-Kernels) |
| Installare applicazioni o creare moduli applicativi da ricette del catalogo | **Negozio di applicazioni MiniOS** | Sistemi live MiniOS. Scegli installazione come modulo o diretta sul sistema; la persistenza determina se le modifiche dirette sopravvivono al riavvio. | [Negozio di applicazioni MiniOS](/using-minios/Installing-Software) |
| Rimasterizzare un'immagine MiniOS esistente tramite un progetto guidato | **Generatore di immagini MiniOS** | Funziona con i contenuti dell'immagine live MiniOS dalla sessione live in esecuzione, da una ISO o da supporti ottici. Crea una nuova ISO live. | [Generatore di immagini MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Ispezionare, creare, attivare e selezionare moduli `.sb` | **Gestore moduli MiniOS** | Solo per sistemi live MiniOS; la composizione dei moduli e l'attivazione a runtime dipendono dal modello root a livelli `.sb`. | [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules) |
| Scrivere una ISO MiniOS su una chiavetta USB | **Utilità disco** | Utilità generica per immagini disco inclusa in MiniOS. Scrive supporti avviabili; non esegue il deployment gestito come l'Installatore MiniOS. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility) |
| Consultare la documentazione installata offline | **Guida MiniOS** | Legge la documentazione inclusa senza richiedere una connessione di rete. | [Documentazione MiniOS](/) |

## Strumenti da riga di comando

La maggior parte degli strumenti grafici dispone di una controparte pubblica da riga di comando o di un backend. Questi comandi sono forniti sia nello stesso pacchetto dell’applicazione grafica sia in un pacchetto complementare richiesto. Il manifest core condiviso include `minios-tools` e `minios-image-compose`. Gli altri comandi seguono la disponibilità dei rispettivi pacchetti grafici. La loro presenza in un sistema installato o in un’immagine specifica deve comunque essere verificata direttamente.

### Deployment e sessioni

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elencare i dischi di destinazione, visualizzare in anteprima un piano di deployment o installare MiniOS in modo non interattivo | **`minios-deploy`** | Si avvia da una sessione live MiniOS. L'installazione richiede i permessi di root e una conferma esplicita; la modalità nativa, quando supportata, crea un desktop Debian convenzionale dall'immagine selezionata. | [Installatore MiniOS](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Creare, attivare, salvare, ridimensionare, esportare, importare o rimuovere sessioni persistenti | **`minios-session`** | Richiede root e un sistema live MiniOS compatibile con uno storage di persistenza. | [Gestione delle sessioni](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel e immagini

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elencare, impacchettare, attivare, ispezionare o rimuovere kernel | **`minios-kernel`** | Richiede root e un'installazione live modulare MiniOS con una root MiniOS scrivibile. | [Gestione kernel](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Rimasterizzare un albero di contenuti MiniOS esistente tramite script o automazione | **`minios-image-compose`** | Opera sui contenuti dell'immagine live MiniOS e pubblica una ISO avviabile. | [Composizione di immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images); `man minios-image-compose` |

### Flussi di lavoro dei moduli

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Ispezionare i moduli e gestire i set di moduli attivi o per il prossimo avvio | **`sb`** | L'ispezione dei moduli funziona anche al di fuori di una sessione MiniOS in esecuzione. Le operazioni su moduli attivi e per il prossimo avvio richiedono un layout moduli live MiniOS; le modifiche richiedono root. | [Creazione dei moduli](/preparing-and-customizing/Managing-Modules); `man sb` |
| Creare un modulo da pacchetti di repository o file locali `.deb` | **`apt2sb`** | Richiede root e una sessione live MiniOS supportata. I pacchetti vengono installati in un ambiente di build isolato, non nella root in esecuzione. | [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Creare un modulo eseguendo uno script di installazione | **`script2sb`** | Richiede root e una sessione live MiniOS supportata. Lo script viene eseguito in modo non interattivo in un ambiente di build isolato. | [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Creare un modulo in modo interattivo in un ambiente preparato | **`chroot2sb`** | Richiede root e una sessione live MiniOS supportata. Usalo quando l'installazione richiede prompt o modifiche manuali. | [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convertire tra una struttura di directory e un modulo `.sb` | **`dir2sb`**, **`sb2dir`** | La conversione ordinaria non richiede root e può essere utilizzata anche fuori da una sessione live in esecuzione, se sono disponibili gli strumenti e i file necessari. | [Creare](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) o [estrarre](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un modulo; `man dir2sb`, `man sb2dir` |
| Catturare le modifiche idonee dallo strato scrivibile della sessione in un modulo | **`savechanges`** | Richiede root e una sessione live MiniOS in esecuzione con un backend dello strato scrivibile supportato. | [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flussi di lavoro dello storage

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Leggere o scrivere immagini disco, formattare un dispositivo o sovrascrivere un dispositivo | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operazioni generiche su disco. Scrittura, formattazione e cancellazione sono operazioni distruttive e normalmente richiedono i permessi di root. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Per modifiche alle liste dei pacchetti sorgente, ai kernel, agli artefatti di boot o all'intera catena dei moduli, utilizzare il sistema di build delle sorgenti invece degli strumenti di rimasterizzazione delle immagini. Vedi [Compilare MiniOS](/development/Building-MiniOS).
