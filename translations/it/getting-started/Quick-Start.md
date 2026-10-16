---
updated: 2026-10-15
---

# Guida rapida

Questa guida ti accompagna dal download di un’immagine MiniOS fino a un sistema funzionante. Illustra solo le decisioni necessarie per il primo avvio; le guide collegate approfondiscono ogni argomento.

## 1. Scaricare MiniOS

Scegli l’edizione più adatta a ciò che vuoi fare:

| Edizione | Ideale per |
|---|---|
| **Standard** | **Consigliata alla maggior parte degli utenti e per una prima esperienza con MiniOS.** Un sistema essenziale con le funzionalità di base e un desktop Xfce compatto ed efficiente, adatto all’uso quotidiano. |
| **Toolbox** | Un’edizione per l’amministrazione e la diagnostica dei sistemi, pensata per il lavoro IT professionale e il ripristino dei sistemi. Include Standard e i relativi strumenti di amministrazione, ripristino, rete, test hardware, backup e accesso remoto. |
| **Ultra** | Un desktop completo, con un’ampia gamma di applicazioni e strumenti professionali per la creatività e lo sviluppo. Include Toolbox, oltre a software per l’ufficio, la grafica, il video, l’audio, il 3D, lo sviluppo e i container. |
| **Flux** | Un’edizione Fluxbox ultraleggera, pensata per ridurre al minimo l’uso delle risorse e per l’hardware meno recente. Include meno applicazioni e offre meno comodità desktop rispetto a Standard. **Non consigliata ai principianti.** |

La disponibilità esatta dei pacchetti e dei desktop varia a seconda della release. Consulta [Informazioni su MiniOS](/getting-started/About-MiniOS) per conoscere il modello delle edizioni e [Pacchetti ed edizioni](/reference/Package-and-Edition-Contents) per l’elenco dei pacchetti mantenuti.

Scarica il file ISO dal [sito web MiniOS](https://minios.dev) ufficiale, dalla [pagina GitHub Releases](https://github.com/minios-linux/minios-live/releases) oppure da [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verificare il download

Verifica il file ISO prima di installarlo. Le release di MiniOS includono il relativo file `.iso.sha256`; consulta [Verificare i download](/installing-minios/Verifying-Downloads) per i comandi per Linux, macOS e Windows.

## 3. Installare MiniOS

Per MiniOS, scrivere il sistema su un supporto rimovibile è già un metodo di installazione: il dispositivo ottenuto è un sistema MiniOS avviabile.

Scegli il metodo in base al risultato che vuoi ottenere dal dispositivo:

| Obiettivo | Metodo | Risultato |
|---|---|---|
| Una normale unità USB che consenta anche di avviare MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) nella normale modalità ISO oppure [Installazione basata su file](/installing-minios/Manual-File-Based-Installation) | I file di MiniOS e il bootloader risiedono su un normale file system, quindi l’unità può continuare a essere usata per i file comuni |
| MiniOS insieme ad altre immagini ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy mantiene la normale partizione dati e supporta il multiboot; MiniOS supporta le sessioni persistenti con questa configurazione |
| Un’installazione MiniOS portatile e gestita | [Installatore MiniOS](/installing-minios/MiniOS-Installer) in **modalità** Live | Crea un’installazione MiniOS modulare e può configurare lo spazio di archiviazione persistente |
| Una copia esatta dell’immagine ISO, blocco per blocco | [Rufus](/installing-minios/installation-tools/Rufus) in modalità DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilità disco](/installing-minios/installation-tools/Drive-Utility), oppure [`dd`](/installing-minios/installation-tools/dd) | Riproduce la disposizione dei blocchi dell’ISO: è semplice e prevedibile, ma il dispositivo non si comporta più come una normale unità flash multiuso |

Per un’unità portatile che vuoi usare anche per archiviare file normalmente, scegli Rufus in modalità ISO, un’installazione basata su file, Ventoy oppure un’installazione Live adatta creata con l’Installatore MiniOS. La scrittura dell’immagine grezza è utile quando una copia esatta dell’immagine pubblicata è più importante del riutilizzo del dispositivo come spazio di archiviazione generico.

::: danger Controlla il dispositivo di destinazione
La maggior parte dei metodi di installazione sovrascrive alcuni o tutti i dati presenti sul dispositivo selezionato.
Esegui il backup dei dati importanti e verifica il modello e la capacità del dispositivo prima di iniziare.
:::

Consulta [Installazione di MiniOS](/installing-minios/Installation-Methods) per le differenze tra la scrittura di immagini grezze, Ventoy, le disposizioni basate su file e l’Installatore MiniOS.

## 4. Avvia MiniOS per la prima volta

1. Riavvia il computer con il dispositivo MiniOS collegato.
2. Apri il menu di avvio del firmware del computer e seleziona quel dispositivo.
3. Lascia selezionata la voce predefinita **Avviare MiniOS** e avvia il sistema.
4. Verifica che la scheda grafica, la tastiera, la rete e i dispositivi di archiviazione necessari funzionino correttamente.

**Avviare MiniOS** è la normale modalità di avvio predefinita. Seleziona automaticamente la persistenza: MiniOS tenta di riprendere una sessione predefinita compatibile e, se non ne trova una utilizzabile, può crearne una compatibile se è disponibile un supporto scrivibile adatto. Se non è possibile attivare la persistenza, MiniOS continua con un livello scrivibile temporaneo e segnala che le modifiche non verranno salvate.

Ciò significa che per il normale primo avvio non è necessario creare prima una sessione. Scegli **Avviare senza salvare** solo se vuoi deliberatamente avviare il sistema in modalità temporanea pulita, senza aprire né creare una sessione persistente.

Per le altre opzioni di avvio, consulta [Modalità di avvio](/using-minios/Boot-Modes) Se il dispositivo non si avvia o alcuni componenti hardware importanti non funzionano, consulta [Compatibilità hardware](/getting-started/Hardware-Compatibility) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## 5. Scegli un comportamento diverso per la sessione, se necessario

Per il normale uso portatile, continua a usare la voce predefinita **Avviare MiniOS** Scegli una modalità diversa solo se hai bisogno di un risultato differente:

| Opzione di avvio | Quando usarla | Risultato |
|---|---|---|
| **Avviare MiniOS** (predefinita) | Normale uso portatile | Riprende automaticamente una sessione predefinita compatibile o ne crea una, se supportato |
| **Avviare una nuova sessione** | Vuoi uno spazio di lavoro aggiuntivo separato | Crea una sessione persistente aggiuntiva numerata e lascia invariate quelle esistenti |
| **Scegliere una sessione salvata** | Vuoi scegliere uno degli spazi di lavoro esistenti | Consente di scegliere interattivamente una sessione esistente |
| **Avviare senza salvare** | Vuoi un avvio temporaneo pulito, senza persistenza | Usa un livello scrivibile temporaneo in RAM |
| **Eseguire dalla RAM** | Vuoi copiare MiniOS in RAM per questo avvio | La voce fornita avvia temporaneamente il sistema senza una sessione salvata. Aggiungendo una richiesta di persistenza, le sessioni supportate possono essere copiate separatamente e salvate esplicitamente; i dati nativi non vengono copiati |

La persistenza automatica richiede comunque un supporto scrivibile adatto. La scrittura diretta di un'immagine ISO non prepara di per sé un supporto persistente. Le installazioni basate su file, i layout Ventoy e le installazioni Live create con [Installatore MiniOS](/installing-minios/MiniOS-Installer) possono fornire layout scrivibili per l'uso persistente di MiniOS. Puoi esaminare e gestire le sessioni esistenti con [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

Prima di fare affidamento sulla persistenza, riavvia una volta e verifica che MiniOS indichi come attiva la sessione prevista e che una modifica di prova venga mantenuta dopo il riavvio.

## 6. Preconfigura MiniOS

La maggior parte degli strumenti di configurazione specifici di MiniOS prepara le impostazioni per un avvio successivo o una nuova sessione, anziché modificare subito il desktop in uso.

Usa **Configuratore MiniOS** per questa preconfigurazione: lingua, fuso orario, tastiera, nome host, servizi, impostazioni predefinite degli account, criteri di sicurezza e altre impostazioni di avvio MiniOS. Aprilo dal menu delle applicazioni oppure esegui:

```bash
minios-configurator
```

Per le normali impostazioni durante l'uso, come connessioni di rete, audio, configurazione dello schermo e preferenze delle applicazioni, usa gli strumenti standard del desktop e di Linux.
Alcune impostazioni del Configuratore MiniOS vengono applicate al riavvio successivo, mentre quelle relative agli account e alla sicurezza potrebbero essere applicate solo alla creazione di una nuova sessione. Consulta [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) per conoscere il comportamento esatto.

## Passaggi successivi

Quando MiniOS si avvia e conserva lo stato di cui hai bisogno:

- [Applicazioni e strumenti MiniOS](/using-minios/MiniOS-Applications) — consulta le utilità specifiche per MiniOS disponibili nel sistema.
- [Configurazione della rete](/using-minios/Networking) — usa normalmente NetworkManager oppure prepara la preconfigurazione cablata di MiniOS.
- [Negozio di applicazioni MiniOS](/using-minios/Installing-Software) — installa le applicazioni dal catalogo MiniOS.
- [Gestione moduli](/preparing-and-customizing/Managing-Modules) — esamina e gestisci i moduli MiniOS.
- [Backup e ripristino](/maintenance-and-recovery/Backing-Up-MiniOS) — proteggi un sistema che intendi continuare a usare.
