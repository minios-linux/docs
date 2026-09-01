---
updated: 2026-08-31
---

# Avvio rapido

Questa guida ti accompagna dall'immagine MiniOS scaricata fino a un sistema funzionante. Copre solo le decisioni necessarie per il primo avvio; le guide collegate spiegano ogni argomento nel dettaglio.

## 1. Scarica MiniOS

Scegli l'edizione che meglio si adatta alle tue esigenze:

| Edizione | Ideale per |
|---|---|
| **Standard** | **Consigliata per la maggior parte degli utenti e per una prima esperienza con MiniOS.** Un sistema minimale con funzionalità di base e un desktop Xfce compatto ed efficiente per l'uso quotidiano. |
| **Toolbox** | Un'edizione per amministrazione e diagnostica di sistema, pensata per professionisti IT e per il recupero dei sistemi. Include Standard più i relativi strumenti di amministrazione, recupero, rete, test hardware, backup e accesso remoto. |
| **Ultra** | Un desktop completo con una vasta gamma di applicazioni e strumenti professionali per creatività e sviluppo. Include Toolbox più software per ufficio, grafica, video, audio, 3D, sviluppo e container. |
| **Flux** | Un'edizione ultraleggera con Fluxbox, pensata per il minimo utilizzo di risorse e hardware datato. Ha un set di applicazioni ridotto e meno comodità desktop rispetto a Standard. **Non consigliata ai principianti.** |

La disponibilità esatta di pacchetti e desktop dipende dalla release. Consulta [Informazioni su MiniOS](/getting-started/About-MiniOS) per il modello delle edizioni e [Pacchetti ed edizioni](/reference/Package-and-Edition-Contents) per la selezione aggiornata dei pacchetti.

Scarica la ISO dal [sito web di MiniOS](https://minios.dev), dalla pagina ufficiale [GitHub Releases](https://github.com/minios-linux/minios-live/releases), oppure da [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verifica il download

Verifica la ISO prima di installarla. Le release di MiniOS forniscono un file `.iso.sha256` corrispondente; consulta [Verifica dei download](/installing-minios/Verifying-Downloads) per i comandi su Linux, macOS e Windows.

## 3. Installa MiniOS

Per MiniOS, scrivere il sistema su supporto rimovibile è già un metodo di installazione: il dispositivo risultante è un sistema MiniOS avviabile.

Scegli il metodo in base al risultato che desideri ottenere dal dispositivo:

| Cosa vuoi ottenere | Metodo | Risultato |
|---|---|---|
| Una normale chiavetta USB che avvia anche MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) nella sua modalità ISO standard oppure [Installazione basata su file](/installing-minios/Manual-File-Based-Installation) | I file MiniOS e il bootloader risiedono su un filesystem normale, quindi la chiavetta può essere usata anche per file ordinari |
| MiniOS insieme ad altre immagini ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy mantiene la normale partizione dati, supporta il multiboot e MiniOS consente sessioni persistenti su questa configurazione |
| Un'installazione MiniOS portatile gestita | [Installatore MiniOS](/installing-minios/MiniOS-Installer) in modalità **Live** | Crea un'installazione MiniOS modulare e può configurare lo storage persistente |
| Una copia esatta, settore per settore, dell'ISO | [Rufus](/installing-minios/installation-tools/Rufus) in modalità DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilità disco](/installing-minios/installation-tools/Drive-Utility), o [`dd`](/installing-minios/installation-tools/dd) | Riproduce la struttura a blocchi dell'ISO; semplice e prevedibile, ma il dispositivo non si comporta più come una normale chiavetta USB multiuso |

Per una chiavetta portatile che desideri usare anche per l'archiviazione di file normali, preferisci Rufus in modalità ISO, un'installazione basata su file, Ventoy o una Live adatta creata con Installatore MiniOS. La scrittura raw dell'immagine è utile quando è più importante avere una copia esatta dell'immagine pubblicata che riutilizzare il dispositivo come memoria generale.

::: danger Controlla il dispositivo di destinazione
La maggior parte dei metodi di installazione sovrascrive alcuni o tutti i dati sul dispositivo selezionato.
Esegui un backup di tutto ciò che è importante e verifica modello e capacità del dispositivo prima di iniziare.
:::

Consulta [Installare MiniOS](/installing-minios/Installation-Methods) per le differenze tra scrittura raw dell'immagine, Ventoy, layout basati su file e Installatore MiniOS.

## 4. Avvia MiniOS per la prima volta

1. Riavvia il computer con il dispositivo MiniOS collegato.
2. Apri il menu di avvio firmware del computer e seleziona quel dispositivo.
3. Lascia selezionata la voce predefinita **Avvia MiniOS** e avvia il sistema.
4. Verifica che grafica, tastiera, rete e i dispositivi di archiviazione necessari funzionino correttamente.

**Avvia MiniOS** è la modalità di avvio predefinita. Utilizza la selezione automatica della persistenza: MiniOS tenta di riprendere una sessione predefinita compatibile e, se non esiste una sessione utilizzabile, può crearne una compatibile se è disponibile uno storage scrivibile adatto. Se la persistenza non può essere attivata, MiniOS prosegue con un layer temporaneo scrivibile e segnala che le modifiche non verranno salvate.

Questo significa che un primo avvio normale non richiede la creazione preventiva di una sessione. Scegli **Avvia senza salvare** solo se desideri deliberatamente un avvio temporaneo pulito che non apra né crei una sessione persistente.

Consulta [Modalità di avvio](/using-minios/Boot-Modes) per le altre opzioni di avvio. Se il dispositivo non si avvia o l'hardware importante non funziona, consulta [Compatibilità hardware](/getting-started/Hardware-Compatibility) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## 5. Scegli un comportamento di sessione diverso quando necessario

Per l'uso portatile normale, continua a utilizzare la voce predefinita **Avvia MiniOS**. Scegli una modalità diversa solo quando desideri un risultato differente:

| Scelta di avvio | Usala quando | Risultato |
|---|---|---|
| **Avvia MiniOS** (predefinito) | Uso portatile normale | Riprende automaticamente una sessione predefinita compatibile o ne crea una quando supportato |
| **Avvia una nuova sessione** | Vuoi uno spazio di lavoro aggiuntivo separato | Crea una sessione persistente aggiuntiva numerata e mantiene inalterate le sessioni esistenti |
| **Scegli una sessione salvata** | Vuoi selezionare uno dei diversi spazi di lavoro esistenti | Ti permette di scegliere interattivamente una sessione già esistente |
| **Avvia senza salvare** | Vuoi un avvio temporaneo pulito senza persistenza | Utilizza un layer scrivibile temporaneo in RAM |
| **Esegui da RAM** | Vuoi copiare MiniOS in RAM solo per questo avvio | Esegue da una copia RAM; considera le modifiche come temporanee |

La persistenza automatica richiede comunque uno storage scrivibile adatto. Una scrittura ISO raw non prepara di per sé uno spazio persistente. Le installazioni basate su file, i layout Ventoy e le Live create con [Installatore MiniOS](/installing-minios/MiniOS-Installer) possono fornire layout scrivibili per l'uso persistente di MiniOS. Le sessioni esistenti possono essere ispezionate e gestite tramite [Gestione sessioni](/using-minios/Sessions-and-Persistence).

Prima di fare affidamento sulla persistenza, riavvia una volta e conferma che MiniOS segnali la sessione prevista come attiva e che una modifica di prova sopravviva al riavvio.

## 6. Preconfigura MiniOS

La maggior parte degli strumenti di configurazione specifici per MiniOS prepara le impostazioni per un avvio successivo o una nuova sessione, invece di modificare immediatamente il desktop in uso.

Usa **Configuratore MiniOS** per questa preconfigurazione: lingua, fuso orario, tastiera, hostname, servizi, impostazioni predefinite dell'account, policy di sicurezza e altre impostazioni di avvio MiniOS. Aprilo dal menu delle applicazioni oppure esegui:

```bash
minios-configurator
```

Utilizza gli strumenti standard del desktop e di Linux per le impostazioni ordinarie in tempo reale, come connessioni di rete, audio, configurazione dello schermo e preferenze delle applicazioni.
Alcune impostazioni del Configuratore MiniOS vengono applicate al prossimo avvio, mentre le impostazioni di account e sicurezza potrebbero essere usate solo quando viene creata una nuova sessione. Consulta [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) per il comportamento esatto.

## Prossimi passi

Una volta che MiniOS si avvia e mantiene lo stato desiderato:

- [Applicazioni e strumenti MiniOS](/using-minios/MiniOS-Applications) — consulta le utility specifiche MiniOS disponibili nel sistema.
- [Configurazione di rete](/using-minios/Networking) — usa normalmente NetworkManager oppure prepara una preconfigurazione cablata MiniOS.
- [Negozio di applicazioni MiniOS](/using-minios/Installing-Software) — installa applicazioni dal catalogo MiniOS.
- [Gestore dei moduli](/preparing-and-customizing/Managing-Modules) — ispeziona e gestisci i moduli MiniOS.
- [Backup e ripristino](/maintenance-and-recovery/Backing-Up-MiniOS) — proteggi un sistema che prevedi di continuare a utilizzare.
