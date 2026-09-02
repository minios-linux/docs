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

### Distribuzione e sessioni

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elenca i dischi di destinazione, visualizza in anteprima un piano di distribuzione o installa MiniOS in modalità non interattiva | **`minios-deploy`** | Si avvia da una sessione live MiniOS. L’installazione richiede i permessi di root e una conferma esplicita; la modalità nativa, quando disponibile, crea un desktop Debian tradizionale dall’immagine selezionata. | [Distribuzione da riga di comando](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Crea, attiva, salva, ridimensiona, esporta, importa o rimuovi sessioni persistenti | **`minios-session`** | Richiede i permessi di root e un sistema live MiniOS con uno storage di persistenza compatibile. | [Riferimento comandi sessione](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel e immagini

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Elenca, crea pacchetti, attiva, ispeziona o rimuovi kernel | **`minios-kernel`** | Richiede i permessi di root e un’installazione live modulare MiniOS con root MiniOS scrivibile. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Rigenera un albero di contenuti MiniOS esistente tramite script o automazione | **`minios-image-compose`** | Opera sui contenuti dell’immagine live MiniOS e pubblica una ISO avviabile. | [Composizione immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Flussi di lavoro dei moduli

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Ispeziona i moduli e gestisci i set di moduli attivi o al prossimo avvio | **`sb`** | L’ispezione dei moduli funziona anche fuori da una sessione MiniOS attiva. Le operazioni sui moduli attivi e al prossimo avvio richiedono un layout moduli live MiniOS; le modifiche richiedono i permessi di root. | [Ispeziona ed estrai moduli](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gestisci i moduli attivi e al prossimo avvio](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Crea un modulo da pacchetti di repository o da file locali`.deb` | **`apt2sb`** | Richiede i permessi di root e una sessione live MiniOS supportata. I pacchetti vengono installati in un ambiente di build isolato, non nel root in esecuzione. | [Crea un modulo da pacchetti](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Crea un modulo eseguendo uno script di installazione | **`script2sb`** | Richiede i permessi di root e una sessione live MiniOS supportata. Lo script viene eseguito in modalità non interattiva in un ambiente di build isolato. | [Crea un modulo da uno script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Crea un modulo in modo interattivo in un ambiente preparato | **`chroot2sb`** | Richiede i permessi di root e una sessione live MiniOS supportata. Usalo quando l’installazione richiede prompt o modifiche manuali. | [Crea un modulo in modo interattivo](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Converti tra una struttura di directory e un`.sb` modulo | **`dir2sb`**, **`sb2dir`** | La conversione ordinaria non richiede root e può essere utilizzata anche fuori da una sessione live attiva, se sono disponibili gli strumenti e i file necessari. | [Crea](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) o [estrai](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un modulo; `man dir2sb`, `man sb2dir` |
| Acquisisci le modifiche idonee dallo strato sessione scrivibile in un modulo | **`savechanges`** | Richiede i permessi di root e una sessione live MiniOS attiva con backend supportato per lo strato scrivibile. | [Acquisisci le modifiche della sessione corrente](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flussi di lavoro dello storage

| Attività | Strumento | Ambito | Documentazione |
|---|---|---|---|
| Leggere o scrivere immagini disco, formattare un dispositivo o sovrascrivere un dispositivo | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operazioni generiche su disco. Scrittura, formattazione e cancellazione sono operazioni distruttive e normalmente richiedono i permessi di root. | [Utilità disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Per modifiche alle liste dei pacchetti sorgente, ai kernel, agli artefatti di boot o all'intera catena dei moduli, utilizzare il sistema di build delle sorgenti invece degli strumenti di rimasterizzazione delle immagini. Vedi [Compilare MiniOS](/development/Building-MiniOS).
