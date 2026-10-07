---
updated: 2026-10-06
---

# Modalità di avvio

La modalità di avvio determina se MiniOS parte da zero, apre una sessione salvata oppure si avvia come un sistema installato tradizionale. Non è necessario conoscere i dettagli interni del processo di avvio per effettuare questa scelta.

Le voci di menu possono variare leggermente tra versioni, modalità firmware e strumenti di avvio. Scegli in base al risultato che desideri ottenere, non al testo esatto.

## Scelta rapida

La voce predefinita normale è **Avviare MiniOS**. Utilizza la selezione automatica della persistenza: MiniOS tenta di ripristinare una sessione predefinita compatibile e può crearne una nuova compatibile se non esiste una sessione utilizzabile e se è disponibile uno spazio di archiviazione scrivibile adatto.

| Voce di menu | Usalo quando | Le modifiche vengono salvate? | Tenere la USB collegata? |
|---|---|---|---|
| **Avviare MiniOS** (predefinito) | Uso portatile normale | Sì, se l'attivazione automatica della persistenza va a buon fine | Sì |
| **Avviare una nuova sessione** | Vuoi uno spazio di lavoro nuovo e separato | Solo se la nuova sessione viene creata e attivata con successo | Sì |
| **Scegliere una sessione salvata** | Vuoi selezionare uno tra più spazi di lavoro esistenti | Solo se la sessione selezionata viene attivata con successo | Sì |
| **Avviare senza salvare** | Vuoi un avvio temporaneo pulito senza persistenza | No | Sì |
| **Eseguire dalla RAM** | Vuoi copiare i dati di sistema di MiniOS in RAM per questo avvio | Le modifiche su RAM sono temporanee, a meno che una sessione di persistenza supportata non venga esplicitamente salvata o salvata come nuova | Fino a quando MiniOS non ha scollegato correttamente la sorgente e ogni archiviazione ancora necessaria |

Per un primo avvio normale, lascia **Avviare MiniOS** selezionato. Usa **Avviare senza salvare** quando hai bisogno specificamente di un test hardware temporaneo pulito o di una sessione di ripristino che non deve aprire né creare la persistenza.

::: warning Conferma che la persistenza sia attiva
La scelta di una voce di menu persistente richiede una sessione, ma non garantisce che la sessione possa essere aperta. Se l'archiviazione è di sola lettura, piena, danneggiata o incompatibile, MiniOS può continuare senza salvare le modifiche. Controlla l'avviso iniziale prima di svolgere attività che devono essere conservate.
:::

## Avviare MiniOS

**Avviare MiniOS** è la prima voce di menu e quella predefinita. È pensata per l'uso normale, incluso il primo avvio di un dispositivo MiniOS appena preparato.

MiniOS cerca automaticamente una sessione persistente compatibile. Se esiste una sessione predefinita utilizzabile, viene ripristinata. Se non esiste, MiniOS può creare automaticamente una sessione compatibile quando è disponibile uno spazio di archiviazione scrivibile adatto.

Se la persistenza non può essere creata o attivata perché l'archiviazione è di sola lettura, piena, danneggiata o comunque inadatta, MiniOS prosegue con un layer scrivibile temporaneo e segnala che la sessione non è persistente. Controlla questo avviso prima di svolgere attività che devono sopravvivere a un riavvio.

Per una sessione persistente funzionante, il Configuratore MiniOS può mantenere log e cache ordinari selezionati in RAM, conservando comunque le diagnostiche di avvio e i dati utente su archiviazione. Le tre impostazioni e i relativi limiti RAM sono descritti in [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Non hanno effetto su un avvio **Avviare senza salvare**.

## Avviare una nuova sessione

MiniOS apre il menu di configurazione della persistenza, consente di scegliere un backend di archiviazione supportato e le eventuali opzioni di cifratura o compressione DynBlk, quindi crea una sessione persistente aggiuntiva numerata lasciando inalterate le sessioni esistenti. Questo è il comportamento attuale di `perchdir=setup` . Usalo per mantenere spazi di lavoro separati o per testare una nuova configurazione senza sostituire la sessione di lavoro corrente.

La creazione richiede uno spazio di archiviazione scrivibile compatibile e sufficiente spazio libero. Le opzioni di backend disponibili dipendono dal filesystem, dallo stato di Secure Boot, dai driver/strumenti installati e dalle capacità dell'initrd. Una nuova sessione non è un backup di una sessione esistente.

## Scegliere una sessione salvata

MiniOS mostra le sessioni salvate disponibili e consente di selezionarne una. Usalo quando un dispositivo contiene più spazi di lavoro. Se l'archivio di persistenza selezionato è vuoto, il percorso `ask` avvia automaticamente la configurazione della persistenza per consentire la creazione della prima sessione.

Una sessione può risultare incompatibile se proviene da un'altra release o edizione MiniOS. Anche una diversa `union=` impostazione può rendere una sessione incompatibile.
La selezione interattiva non rende sicura una sessione incompatibile.

## Avviare senza salvare

Questa modalità disabilita deliberatamente la persistenza per l'avvio corrente. MiniOS utilizza un'area scrivibile temporanea in RAM, quindi i file creati nel sistema live, i pacchetti installati e le impostazioni modificate vengono eliminati allo spegnimento.

Usa questa modalità quando desideri specificamente:

- testare l'hardware senza aprire o creare una sessione persistente;
- diagnosticare un problema senza modificare lo stato salvato;
- lavorare temporaneamente quando non è necessario conservare nulla.

Avviare senza salvare non significa che il supporto di avvio possa essere rimosso. Il sistema in esecuzione normalmente continua a leggere i propri moduli di sistema da quel supporto.

## Eseguire dalla RAM

Questa modalità copia i dati di sistema di MiniOS in RAM per ridurre le letture dalla sorgente. È necessaria memoria sufficiente sia per il sistema copiato che per il carico di lavoro in esecuzione.

La copia del sistema e quella della persistenza ora sono separate. Con una richiesta di persistenza, `toram` predefinisce `perchtoram` su `trim`, quindi la sessione supportata selezionata Raw, DynFileFS, DynBlk, VMDK o SquashFS viene copiata in RAM mentre le altre sessioni salvate restano sull'archivio originale. Usa `perchtoram=off` quando vuoi il sistema in RAM ma la sessione di persistenza attiva deve continuare a scrivere direttamente su archiviazione, oppure `perchtoram=full` quando tutte le sessioni salvate supportate devono essere copiate. Le sessioni native in directory non vengono copiate da `perchtoram`.

Una sessione di persistenza su RAM non è durevole durante l'esecuzione. L'attuale Gestore sessioni MiniOS può scrivere esplicitamente le modifiche supportate su RAM sull'archivio originale tramite **Salva ora**, oppure salvarle come una nuova sessione numerata, purché l'archivio originale sia presente, scrivibile e corrisponda ancora all'identità rilevata all'avvio. Finché il salvataggio non va a buon fine, le modifiche RAM non salvate vengono perse allo spegnimento. Le policy di salvataggio automatico SquashFS utilizzano lo stesso backend di sessione quando l'archivio originale è disponibile.

Non rimuovere il dispositivo di avvio solo perché **Eseguire dalla RAM** è stato selezionato. È sicuro solo dopo che MiniOS ha scollegato correttamente il filesystem sorgente, il loop ISO, le mappature Ventoy e ogni dipendenza di persistenza ancora necessaria. Se il distacco fallisce, la sorgente resta in uso.

## Installazione nativa

::: warning L'installazione nativa modifica il modello di sistema
Un'installazione nativa mantiene l'esperienza desktop familiare di MiniOS — la sua identità visiva, l'ambiente desktop selezionato e le applicazioni comuni — ma converte l'immagine live in un desktop Debian tradizionale. Gli strumenti specifici MiniOS per sessioni, moduli, kernel modulari e altri flussi di lavoro live vengono rimossi perché tali funzionalità non sono più applicabili.
:::

Dopo la conversione nativa, utilizza i normali strumenti Debian per pacchetti, kernel, configurazione e bootloader. Il risultato resta visivamente familiare e mantiene le applicazioni desktop ordinarie dell'edizione selezionata, ma il set di funzionalità live specifico MiniOS non è più presente. L'architettura live MiniOS è descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS).

Usa [Installatore MiniOS](/installing-minios/MiniOS-Installer) solo quando desideri consapevolmente questa conversione e l'immagine selezionata supporta il deployment nativo.

## Quando serve più dettaglio

- [Menu di avvio](/preparing-and-customizing/Customizing-the-Boot-Menu) spiega la navigazione e la modifica temporanea di una voce di menu.
- [Gestione delle sessioni](/using-minios/Sessions-and-Persistence) spiega le modalità di archiviazione, la creazione, la ridimensionamento e la rimozione delle sessioni.
- [Parametri di avvio](/reference/Boot-Parameters) è la documentazione completa della riga di comando.
- [Rilevamento sistema initrd](/reference/boot-process/System-Discovery), [caricamento moduli](/reference/boot-process/Module-Loading), e [persistenza](/reference/boot-process/Persistence-Internals) spiegano come i gruppi di parametri correlati vengono elaborati durante l'avvio.
