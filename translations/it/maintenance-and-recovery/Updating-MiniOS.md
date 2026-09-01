---
updated: 2026-08-31
---

# Aggiornamento di MiniOS

MiniOS **non** prevede una procedura supportata di aggiornamento in-place da una versione MiniOS all'altra. Il sistema live modulare è composto da moduli SquashFS in sola lettura più uno strato di sessione scrivibile, quindi la modifica dei pacchetti Debian nel sistema in esecuzione non sostituisce la versione MiniOS stessa.

::: warning Una nuova versione MiniOS è una nuova installazione
Non esiste un equivalente MiniOS di `dist-upgrade` che trasformi una copia installata o persistente di una versione MiniOS in un'altra versione. Passare a una versione MiniOS più recente significa installare quella versione e poi migrare i dati e le impostazioni che si desidera conservare.
:::

## APT è consentito

MiniOS non blocca né vieta l'uso di APT. Puoi installare e aggiornare pacchetti Debian quando è utile:

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS live modulare

In una sessione live MiniOS, APT scrive i file dei pacchetti e i metadati dei pacchetti nello strato scrivibile. Con la persistenza, tali modifiche possono sopravvivere a un riavvio. I moduli `.sb` in sola lettura sotto quello strato non vengono modificati; i file aggiornati nella sessione semplicemente sovrascrivono quelli dei moduli.

Questa è manutenzione dei pacchetti **all'interno di quella sessione**, non un aggiornamento di MiniOS.
Consuma anche spazio di persistenza e può rendere la sessione molto diversa dall'immagine pubblicata. Una nuova sessione parte comunque dal set di pacchetti contenuto nei moduli MiniOS.

Non cambiare le sorgenti APT verso un'altra release Debian ed eseguire `upgrade`, `full-upgrade` o `dist-upgrade` aspettandoti di ottenere una versione MiniOS più recente.
Questo crea uno stato di sistema misto; non riproduce il set di moduli, i file di avvio, la selezione del firmware, i pacchetti MiniOS o altre scelte di una versione MiniOS pubblicata.

### Dopo la conversione nativa

Un'installazione nativa creata da MiniOS è un normale desktop Debian, invece del sistema live modulare MiniOS. Mantiene l’esperienza desktop familiare di MiniOS, inclusi l’ambiente desktop selezionato, l’identità visiva e le applicazioni comuni, mentre il software live specifico per MiniOS viene rimosso. Il sistema risultante ha un filesystem root scrivibile: APT aggiorna i pacchetti normalmente, il kernel è gestito tramite pacchetti Debian e il bootloader e l’initramfs installati utilizzano il flusso di lavoro Debian convenzionale.

Il modello di aggiornamento release-upgrade di MiniOS quindi non si applica a quel sistema convertito. L’identità visiva e il software desktop ordinario di MiniOS possono rimanere, mentre la manutenzione continua segue il modello Debian standard invece del flusso di lavoro a moduli/sessioni di MiniOS.

## Passare a una versione MiniOS più recente

Considera una versione MiniOS più recente come un sistema separato:

1. Scarica e [verifica](/installing-minios/Verifying-Downloads) la nuova immagine.
2. Esegui il backup di file importanti, configurazioni, moduli utente e sessioni persistenti come descritto in [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Installa la nuova versione utilizzando il [metodo di installazione](/installing-minios/Installation-Methods) appropriato.
4. Avviala prima con una sessione nuova e verifica l'hardware e le applicazioni di cui hai bisogno.
5. Migra i file personali e le configurazioni selezionate. Dove Session Manager può esportare la vecchia sessione, importa il suo archivio e lascia che vengano eseguiti i controlli di compatibilità invece di copiare manualmente l'archivio della sessione live.
6. Ricostruisci o reinstalla i moduli personalizzati se non sono noti come compatibili con la versione di destinazione.

Mantieni la vecchia installazione o il backup finché la nuova versione non è stata testata.
Non combinare moduli di base, file di avvio, file kernel o file initramfs di versioni MiniOS diverse nel tentativo di creare un aggiornamento.

## Moduli e kernel sono attività di manutenzione separate

Un modulo `.sb` creato dall'utente può essere sostituito o ricostruito in modo indipendente quando lo si desidera. Questo modifica uno strato di personalizzazione; non cambia la versione MiniOS. Vedi [Gestione dei moduli](/preparing-and-customizing/Managing-Modules).

Anche il kernel MiniOS viene gestito come modulo kernel coordinato, `vmlinuz`, e set di initramfs. Utilizza [Gestione dei kernel](/preparing-and-customizing/Managing-Kernels) per questa operazione. Aggiornare solo un pacchetto `linux-image` con APT non segue il flusso di lavoro di gestione kernel di MiniOS, e cambiare il kernel non aggiorna la versione MiniOS.
