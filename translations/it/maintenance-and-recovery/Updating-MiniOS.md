---
updated: 2026-08-31
---

# Aggiornamento di MiniOS

MiniOS **non** dispone di una procedura supportata per l'aggiornamento in-place da una release MiniOS a un'altra. Il sistema live modulare è composto da moduli SquashFS in sola lettura e da un livello di sessione scrivibile; pertanto, modificare i pacchetti Debian nel sistema in esecuzione non sostituisce la release MiniOS stessa.

::: warning Una release MiniOS più recente richiede una nuova installazione
Non esiste un equivalente MiniOS di `dist-upgrade` che trasformi una copia installata o persistente di una release MiniOS in un'altra release. Per passare a una release MiniOS più recente, occorre installarla e poi migrare i dati e le impostazioni che si desidera conservare.
:::

## APT è consentito

MiniOS non blocca né vieta APT. Quando è utile, puoi installare e aggiornare i pacchetti Debian:

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS live modulare

In una sessione MiniOS live, APT scrive i file dei pacchetti e i metadati dei pacchetti nel livello scrivibile. Se è abilitata la persistenza, queste modifiche possono rimanere anche dopo il riavvio. I moduli sottostanti in sola lettura `.sb` non vengono modificati; nella sessione, i file aggiornati si limitano a sovrascrivere quelli dei moduli.

Si tratta della manutenzione dei pacchetti **all'interno della sessione**, non di un aggiornamento di MiniOS.
Inoltre, consuma spazio di persistenza e può far divergere notevolmente la sessione dall'immagine pubblicata. Una nuova sessione parte comunque dall'insieme di pacchetti contenuto nei moduli MiniOS.

Non modificare le sorgenti APT per passare a un'altra release Debian e non eseguire `upgrade`, `full-upgrade` o `dist-upgrade` aspettandoti di ottenere una release MiniOS più recente.
Così si crea uno stato di sistema ibrido, senza ricreare l'insieme di moduli, i file di avvio, la selezione del firmware, i pacchetti MiniOS o altre scelte di una release MiniOS pubblicata.

### Dopo la conversione nativa

Un'installazione nativa creata con l'Installatore MiniOS è un normale desktop Debian, non il sistema live modulare MiniOS. Mantiene la familiare esperienza desktop MiniOS, inclusi l'ambiente desktop selezionato, l'identità visiva e le applicazioni comuni, mentre viene rimosso il software live specifico di MiniOS. Il sistema risultante ha un filesystem root scrivibile: APT aggiorna normalmente i pacchetti, il kernel è gestito tramite pacchetti Debian e il bootloader installato e l'initramfs seguono il flusso di lavoro Debian convenzionale.

Il modello di aggiornamento delle release MiniOS non si applica quindi al sistema convertito. L'identità visiva MiniOS e le applicazioni desktop comuni possono rimanere, mentre la manutenzione segue il normale modello Debian anziché il flusso di lavoro MiniOS basato su moduli e sessioni.

## Passaggio a una versione più recente di MiniOS

Considera una versione più recente di MiniOS come un sistema separato:

1. Scarica e [verifica](/installing-minios/Verifying-Downloads) la nuova immagine.
2. Esegui il backup dei file importanti, della configurazione, dei moduli utente e delle sessioni persistenti come descritto in [Esecuzione del backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Installa la nuova versione usando il [metodo di installazione](/installing-minios/Installation-Methods) appropriato.
4. Avviala prima con una sessione nuova e verifica l'hardware e le applicazioni di cui hai bisogno.
5. Migra i file personali e le configurazioni selezionate. Se Session Manager consente di esportare la vecchia sessione, importa il relativo archivio e lascia che vengano eseguiti i controlli di compatibilità, invece di copiare manualmente un archivio di sessione in uso.
6. Ricrea o reinstalla i moduli personalizzati se non è certo che siano compatibili con la versione di destinazione.

Conserva la vecchia installazione o il backup finché non avrai testato la nuova versione.
Non combinare moduli di base, file di avvio, file del kernel o file initramfs di versioni diverse di MiniOS nel tentativo di creare un aggiornamento.

## Moduli e kernel sono attività di manutenzione separate

Un modulo `.sb` creato dall'utente può essere sostituito o ricreato separatamente, se questa è la scelta voluta. Ciò modifica un livello di personalizzazione, ma non la versione MiniOS. Vedi [Gestione dei moduli](/preparing-and-customizing/Managing-Modules).

Anche il kernel MiniOS viene gestito insieme ai moduli del kernel, `vmlinuz`, e all'insieme initramfs. Per questa operazione, usa [Gestione dei kernel](/preparing-and-customizing/Managing-Kernels). Aggiornare solo un pacchetto `linux-image` con APT non corrisponde al flusso di gestione del kernel MiniOS, e modificare il kernel non aggiorna la versione MiniOS.
