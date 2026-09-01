---
updated: 2026-08-31
---

# Modalità di avvio

La modalità di avvio determina se MiniOS si avvia in modo pulito, apre una sessione salvata o viene eseguito come sistema installato convenzionale. Non è necessario comprendere il processo di avvio interno per effettuare questa scelta.

Le etichette del menu possono variare leggermente tra versioni, modalità firmware e strumenti di avvio. Scegli in base al risultato che desideri ottenere, non in base alla formulazione esatta.

## Scelta rapida

La voce predefinita normale è **Avvia MiniOS**. Utilizza la selezione automatica della persistenza: MiniOS tenta di riprendere una sessione predefinita compatibile e può crearne una sostitutiva compatibile quando non esiste una sessione utilizzabile e sono disponibili supporti scrivibili adeguati.

| Voce menu | Quando usarla | Le modifiche vengono salvate? | Tenere la USB collegata? |
|---|---|---|---|
| **Avvia MiniOS** (predefinito) | Uso portatile normale | Sì, se l'attivazione automatica della persistenza ha successo | Sì |
| **Avvia una nuova sessione** | Vuoi uno spazio di lavoro separato e nuovo | Solo se la nuova sessione viene creata e attivata con successo | Sì |
| **Scegli una sessione salvata** | Vuoi selezionare uno dei diversi spazi di lavoro esistenti | Solo se la sessione selezionata viene attivata con successo | Sì |
| **Avvia senza salvare** | Vuoi un avvio temporaneo pulito senza persistenza | No | Sì |
| **Esegui da RAM** | Vuoi copiare MiniOS in RAM per questo avvio | No; considera la copia RAM come temporanea | Fino a quando MiniOS non ha scollegato correttamente la sorgente |

Per un primo avvio normale, lascia selezionato **Avvia MiniOS**. Usa **Avvia senza salvare** quando hai bisogno specificamente di un test hardware temporaneo o di una sessione di recupero che non deve aprire o creare la persistenza.

::: warning Conferma che la persistenza sia attiva
Scegliere una voce di menu persistente richiede una sessione; non garantisce che la sessione possa essere aperta. Se il supporto è di sola lettura, pieno, danneggiato o incompatibile, MiniOS può continuare senza salvare le modifiche. Controlla l'avviso di avvio prima di iniziare un lavoro che deve essere conservato.
:::

## Avvia MiniOS

**Avvia MiniOS** è la prima voce di menu e quella predefinita. È pensata per l'uso normale, compreso il primo avvio di un dispositivo MiniOS appena preparato.

MiniOS cerca automaticamente una sessione persistente compatibile. Se esiste una sessione predefinita utilizzabile, la riprende. Se non esiste, MiniOS può crearne una compatibile automaticamente quando è disponibile uno spazio di archiviazione scrivibile adeguato.

Se la persistenza non può essere creata o attivata perché il supporto è di sola lettura, pieno, danneggiato o comunque non idoneo, MiniOS continua con un layer temporaneo scrivibile e segnala che la sessione non è persistente. Controlla tale avviso prima di svolgere attività che devono sopravvivere a un riavvio.

## Avvia una nuova sessione

MiniOS crea una sessione persistente aggiuntiva e numerata, lasciando inalterate le sessioni esistenti. Usa questa opzione per mantenere spazi di lavoro separati o per testare una nuova configurazione senza sostituire la sessione di lavoro corrente.

La creazione richiede uno spazio di archiviazione compatibile scrivibile e sufficiente spazio libero. Una nuova sessione non è un backup di una esistente.

## Scegli una sessione salvata

MiniOS mostra le sessioni salvate disponibili e ti permette di selezionarne una. Usa questa opzione quando un dispositivo contiene diversi spazi di lavoro. Per creare la prima sessione su uno spazio vuoto, scegli invece **Avvia una nuova sessione**.

Una sessione può risultare incompatibile se proviene da un'altra release o edizione di MiniOS. Anche una diversa impostazione `union=` può rendere incompatibile una sessione.
La selezione interattiva non rende sicura una sessione incompatibile.

## Avvia senza salvare

Questa modalità disattiva intenzionalmente la persistenza per l'avvio corrente. MiniOS utilizza un'area temporanea scrivibile in RAM, quindi i file creati nel sistema live, i pacchetti installati e le impostazioni modificate scompariranno allo spegnimento.

Usa questa modalità quando desideri specificamente:

- testare l'hardware senza aprire o creare una sessione persistente;
- diagnosticare un problema senza modificare lo stato salvato;
- lavorare temporaneamente quando non è necessario conservare nulla.

Avviare senza salvare non significa che il supporto di avvio possa essere rimosso. Il sistema in esecuzione normalmente continua a leggere i propri moduli di sistema da quel supporto.

## Esegui da RAM

Questa modalità copia i dati di MiniOS nella RAM per ridurre le letture dalla sorgente. È necessaria sufficiente memoria per il sistema copiato e il carico di lavoro in esecuzione.

Considera una sessione caricata in RAM come temporanea. Combinando `toram` con la persistenza, i dati della sessione selezionata vengono copiati in RAM; le modifiche successive non vengono copiate nella sorgente originale della persistenza.

Non rimuovere il dispositivo di avvio solo perché è stata selezionata l'opzione **Esegui da RAM**. È sicuro farlo solo dopo che MiniOS ha scollegato correttamente il filesystem di origine, il loop ISO e qualsiasi mapping Ventoy. Se tale operazione fallisce, la sorgente rimane in uso.

## Installazione nativa

::: warning L'installazione nativa modifica il modello di sistema
Un'installazione nativa mantiene l'esperienza desktop familiare di MiniOS — la sua identità visiva, l'ambiente desktop selezionato e le applicazioni ordinarie — ma converte l'immagine live in un classico desktop Debian. Gli strumenti specifici di MiniOS per sessioni, moduli, kernel modulari e altri flussi di lavoro live vengono rimossi, poiché queste funzionalità non sono più applicabili.
:::

Dopo la conversione nativa, utilizza i normali strumenti Debian per pacchetti, kernel, configurazione e bootloader. Il risultato rimane visivamente familiare e mantiene le applicazioni desktop ordinarie dell'edizione selezionata, ma il set di funzionalità live specifiche di MiniOS non è più presente. L'architettura live di MiniOS è descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS).

Usa [Installatore MiniOS](/installing-minios/MiniOS-Installer) solo quando desideri deliberatamente questa conversione e l'immagine selezionata supporta il deployment nativo.

## Quando hai bisogno di maggiori dettagli

- [Menu di avvio](/preparing-and-customizing/Customizing-the-Boot-Menu) spiega la navigazione e la modifica temporanea di una voce di menu.
- [Gestione delle sessioni](/using-minios/Sessions-and-Persistence) spiega le modalità di archiviazione, la creazione, la ridimensionamento e la rimozione delle sessioni.
- [Parametri di avvio](/reference/Boot-Parameters) è la guida completa ai parametri da riga di comando.
- [Rilevamento del sistema initrd](/reference/boot-process/System-Discovery), [caricamento dei moduli](/reference/boot-process/Module-Loading) e [persistenza](/reference/boot-process/Persistence-Internals) spiegano come vengono elaborati i relativi gruppi di parametri durante l'avvio.
