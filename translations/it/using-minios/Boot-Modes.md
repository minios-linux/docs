---
updated: 2026-10-15
---

# Modalità di avvio

La modalità di avvio determina se MiniOS si avvia senza problemi, apre una sessione salvata o funziona come un normale sistema installato. Non è necessario conoscere il processo di avvio interno per scegliere.

Le voci di menu possono variare leggermente a seconda della versione, della modalità firmware e dello strumento di avvio. Scegli in base al risultato che vuoi ottenere, non alla dicitura esatta.

## Scelta rapida

La voce predefinita normale è **Avviare MiniOS**. Usa la selezione automatica della persistenza: MiniOS prova a riprendere una sessione predefinita compatibile e, se non ne esiste una utilizzabile e sono disponibili supporti scrivibili adeguati, può crearne una sostitutiva compatibile.

| Voce di menu | Quando usarla | Le modifiche vengono salvate? | È necessario lasciare collegata la USB? |
|---|---|---|---|
| **Avviare MiniOS** (predefinita) | Uso portatile normale | Sì, se l'attivazione automatica della persistenza riesce | Sì |
| **Avviare una nuova sessione** | Vuoi un nuovo spazio di lavoro separato | Solo se la nuova sessione viene creata e attivata correttamente | Sì |
| **Scegliere una sessione salvata** | Vuoi scegliere uno tra più spazi di lavoro esistenti | Solo se la sessione selezionata viene attivata correttamente | Sì |
| **Avviare senza salvare** | Vuoi un avvio temporaneo pulito, senza persistenza | No | Sì |
| **Eseguire dalla RAM** | Vuoi copiare i dati di sistema di MiniOS in RAM per questo avvio | Le modifiche effettuate con RAM sono temporanee, a meno che una sessione di persistenza supportata non venga salvata esplicitamente di nuovo o come nuova sessione | Finché MiniOS non ha scollegato correttamente la sorgente e tutti i supporti di cui hai ancora bisogno |

Per un normale primo avvio, lascia selezionata **Avviare MiniOS**. Usa **Avviare senza salvare** quando ti serve specificamente una sessione temporanea pulita per testare l'hardware o eseguire un ripristino, senza aprire né creare una persistenza.

::: warning Verifica che la persistenza sia attiva
Scegliere una voce di menu con persistenza richiede una sessione, ma non ne garantisce l'apertura. Se lo spazio di archiviazione è in sola lettura, pieno, danneggiato o incompatibile, MiniOS può continuare senza salvare le modifiche. Controlla l'avviso all'avvio prima di iniziare attività che devono essere conservate.
:::

## Avviare MiniOS

**Avviare MiniOS** è la prima voce del menu ed è selezionata per impostazione predefinita. È pensata per l'uso normale, compreso il primo avvio di un dispositivo MiniOS appena preparato.

MiniOS cerca automaticamente una sessione persistente compatibile. Se esiste una sessione predefinita utilizzabile, la riprende. Se non ne esiste una, MiniOS può crearne automaticamente una compatibile, se sono disponibili supporti scrivibili adeguati.

Se non è possibile creare o attivare la persistenza perché lo spazio di archiviazione è in sola lettura, pieno, danneggiato o comunque inadatto, MiniOS continua con un livello scrivibile temporaneo e segnala che la sessione non è persistente. Controlla l'avviso prima di svolgere attività che devono essere mantenute dopo un riavvio.

Per una sessione persistente funzionante, il Configuratore MiniOS può conservare in RAM i log e le cache standard selezionati, mantenendo i dati diagnostici di avvio e i dati utente sullo spazio di archiviazione. Le tre impostazioni e i relativi limiti di RAM sono descritti in [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Non hanno effetto su un avvio **Avviare senza salvare** .

## Avviare una nuova sessione

MiniOS apre il menu di configurazione della persistenza, consente di scegliere un backend di archiviazione supportato e le opzioni applicabili di crittografia o compressione DynBlk, quindi crea un'ulteriore sessione persistente numerata senza modificare quelle esistenti. Questo è il comportamento attuale di `perchdir=setup`. Usalo per mantenere spazi di lavoro separati o per provare una nuova configurazione senza sostituire la sessione attualmente in uso.

La creazione richiede spazio di archiviazione scrivibile e compatibile, con spazio libero sufficiente. I backend disponibili dipendono dal file system, dallo stato di Secure Boot, dai driver e dagli strumenti installati e dalle funzionalità di initrd. Una nuova sessione non è una copia di backup di una sessione esistente.

## Scegliere una sessione salvata

MiniOS mostra le sessioni salvate disponibili e consente di selezionarne una. Usa questa opzione quando un dispositivo contiene più aree di lavoro. Se l'archivio di persistenza selezionato è vuoto, il`ask` percorso avvia automaticamente la configurazione della persistenza, così puoi creare la prima sessione.

Una sessione può essere incompatibile se proviene da un'altra versione o edizione di MiniOS. Anche un'impostazione diversa può`union=` rendere incompatibile una sessione.
La selezione interattiva non rende sicura una sessione incompatibile.

La finestra di dialogo dell'incompatibilità può ripristinare il software installato nel sistema mantenendo i dati e, facoltativamente, le impostazioni di sistema. Entrambe le modalità di ripristino conservano le cartelle home, le impostazioni personali, gli account e le password. Serve spazio libero per preparare i dati da conservare; un ripristino SquashFS diventa definitivo solo dopo il salvataggio. Consulta [Gestione delle sessioni](/using-minios/Sessions-and-Persistence) prima di eseguire il ripristino.

## Avviare senza salvare

Questa modalità disattiva intenzionalmente la persistenza per l'avvio corrente. MiniOS usa un'area temporanea scrivibile in RAM, quindi i file creati nel sistema live, i pacchetti installati e le impostazioni modificate scompaiono allo spegnimento.

Usa questa modalità se vuoi specificamente:

- testare l'hardware senza aprire o creare una sessione persistente;
- diagnosticare un problema senza modificare lo stato salvato;
- lavorare temporaneamente senza dover conservare nulla.

Avviare il sistema senza salvare non significa poter rimuovere il supporto di avvio. Di norma, il sistema in esecuzione continua a leggere i moduli di sistema da quel supporto.

## Eseguire dalla RAM

Questa modalità copia i dati di sistema MiniOS in RAM per ridurre le letture dalla sorgente. Richiede memoria sufficiente per il sistema copiato e per il carico di lavoro in esecuzione.

La copia del sistema e quella della persistenza sono operazioni separate. Se richiedi la persistenza, `toram` per impostazione predefinita `perchtoram` copia `trim`, quindi la sessione supportata selezionata, in formato Raw, DynFileFS, DynBlk, VMDK o SquashFS, viene copiata in RAM, mentre le altre sessioni salvate restano nell'archivio originale. Usa `perchtoram=off` quando vuoi il sistema in RAM ma preferisci che la sessione di persistenza attiva continui a scrivere direttamente nell'archivio, oppure `perchtoram=full` se vuoi copiare tutte le sessioni supportate archiviate. I dati delle directory native non vengono copiati: una richiesta RAM nativa completata correttamente avvia invece un nuovo contenitore vuoto. Durante il ripristino di una sessione nativa, la copia viene disattivata per conservare i dati da mantenere. Se la memoria non è sufficiente per copiare una sessione o la copia non riesce, MiniOS segnala il ripiego e mantiene la sessione nell'archivio.

Una sessione di persistenza basata su RAM non è permanente durante l'esecuzione. L'attuale Gestore sessioni MiniOS può scrivere esplicitamente nell'archivio originale le modifiche supportate basate su RAM con **Salva ora**, oppure salvarle come nuova sessione numerata, a condizione che l'archivio originale sia presente, scrivibile e corrisponda ancora all'identità registrata all'avvio. Finché il salvataggio non riesce, le modifiche RAM non salvate andranno perse allo spegnimento. Le policy di salvataggio automatico di SquashFS usano lo stesso backend di sessione quando l'archivio originale è disponibile.

Non rimuovere il dispositivo di avvio solo perché è stato selezionato **Eseguire dalla RAM**. È sicuro farlo solo dopo che MiniOS ha scollegato correttamente il filesystem sorgente, il loop ISO, le mappature Ventoy e qualsiasi dipendenza dalla persistenza di cui hai ancora bisogno. Se lo scollegamento non riesce, la sorgente resta in uso.

## Immagini di persistenza Ventoy

Con un backend Persistence Plugin Ventoy selezionato, un avvio persistente usa un unico ambiente ext4 scrivibile contenuto in quell'immagine, anziché sessioni numerate MiniOS. **Avviare una nuova sessione** e **Scegliere una sessione salvata** non possono creare o selezionare sessioni numerate in questa modalità; seleziona invece un altro backend in Ventoy. Gestore sessioni e `perchtoram` non sono disponibili, quindi l'immagine resta in uso anche durante un avvio di sistema RAM. **Avviare senza salvare** usa comunque un'area upper temporanea RAM. Gli avvii Ventoy normali senza un'immagine del plugin selezionata mantengono il comportamento abituale delle sessioni MiniOS. Consulta [Ventoy](/installing-minios/installation-tools/Ventoy).

## Installazione nativa

::: warning L’installazione nativa modifica il modello di sistema
Un’installazione nativa mantiene la consueta esperienza desktop di MiniOS — la sua identità visiva, l’ambiente desktop selezionato e le applicazioni di uso comune — ma converte l’immagine live in un normale desktop Debian. Gli strumenti specifici di MiniOS per le sessioni, i moduli, i kernel modulari e altri flussi di lavoro live vengono rimossi, perché queste funzionalità non sono più applicabili.
:::

Dopo la conversione nativa, usa i normali strumenti Debian per la gestione dei pacchetti, del kernel, della configurazione e del bootloader. Il risultato mantiene un aspetto familiare e le applicazioni desktop standard dell’edizione selezionata, ma non include più le funzionalità live specifiche di MiniOS. L’architettura live di MiniOS è descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS).

Usa [Installatore MiniOS](/installing-minios/MiniOS-Installer) solo se vuoi eseguire deliberatamente questa conversione e l’immagine selezionata supporta la distribuzione nativa.

## Per approfondire

- [Menu di avvio](/preparing-and-customizing/Customizing-the-Boot-Menu) spiega come navigare nel menu e modificare temporaneamente una voce.
- [Gestione delle sessioni](/using-minios/Sessions-and-Persistence) spiega le modalità di archiviazione, la creazione, il ridimensionamento e la rimozione delle sessioni.
- [Parametri di avvio](/reference/Boot-Parameters) è il riferimento completo della riga di comando.
- [Rilevamento del sistema initrd](/reference/boot-process/System-Discovery), [caricamento dei moduli](/reference/boot-process/Module-Loading) e [persistenza](/reference/boot-process/Persistence-Internals) spiegano come vengono elaborati i gruppi di parametri correlati durante l’avvio.
