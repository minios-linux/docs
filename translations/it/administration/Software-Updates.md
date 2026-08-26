---
updated: 2026-08-26
---

# Aggiornamenti software

MiniOS combina moduli immagine SquashFS in sola lettura con un overlay runtime scrivibile. Il metodo di aggiornamento deve corrispondere al layer che si desidera modificare. Aggiornare i pacchetti all'interno di una sessione attiva non equivale a sostituire i moduli presenti sul supporto MiniOS.

## Aggiornare i pacchetti con APT

APT scrive sull’overlay runtime. Abilita e utilizza una sessione persistente prima
di aggiornare se vuoi che le modifiche siano mantenute dopo il riavvio:

```bash
sudo apt update
sudo apt upgrade
```

Senza persistenza, le modifiche ai pacchetti vengono perse allo spegnimento. Con la persistenza,
i file aggiornati e lo stato di APT rimangono in quella sessione, ma i moduli immagine `.sb`
di base non vengono modificati. Una nuova sessione utilizzerà comunque le versioni dei pacchetti presenti nell’immagine.

APT è adatto per mantenere un’unica installazione persistente. Controlla prima lo spazio disponibile, perché i file aggiornati vengono salvati in aggiunta ai moduli base compressi. MiniOS non supporta aggiornamenti in-place tra versioni. Non considerare un upgrade di release Debian come un aggiornamento dell’immagine MiniOS; esegui il backup dei dati e utilizza un’immagine creata per la release di destinazione.

## Aggiornare il software con i moduli

Un modulo `.sb` è un software in sola lettura caricato all'avvio. I moduli sono durevoli quando vengono memorizzati nella directory `modules/` scrivibile di MiniOS o in una fonte di moduli persistente. Non è necessario salvare le modifiche ai pacchetti nella sessione.

Verifica il set di moduli per il prossimo avvio prima e dopo aver aggiunto un modulo:

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

`sb next-boot add` valida e pubblica atomicamente un nuovo modulo, ma non sovrascrive un modulo esistente con lo stesso nome. Rimuovi prima un modulo utente sostituibile quando un aggiornamento mantiene intenzionalmente lo stesso basename:

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

I moduli base e quelli su supporti in sola lettura non possono essere rimossi con questo comando. Costruisci o procurati moduli aggiornati per la stessa architettura, release della distribuzione e livello inferiore nello stack dei moduli. I moduli con numero più alto sovrascrivono i layer inferiori, quindi un vecchio modulo aggiuntivo può anche sovrascrivere file forniti da una nuova immagine base.

Per software pacchettizzato localmente, `apt2sb upgrade` può creare un modulo di aggiornamento. Consulta [Creazione dei moduli](/development/Creating-Modules.md) per dettagli su build e gestione delle dipendenze dei moduli.

## Sostituire i moduli immagine

Gli aggiornamenti ufficiali dell’immagine sostituiscono i file sul supporto MiniOS; `apt upgrade` non li aggiorna.
È preferibile sostituire l’intero set di moduli base e i file di boot corrispondenti da una stessa release MiniOS, oppure reinstallare dall’immagine nuova. Non mescolare file core, desktop, applicazioni, firmware o di boot provenienti da release diverse, a meno che la loro compatibilità non sia documentata.

Prima della sostituzione:

1. Esegui il backup della configurazione MiniOS, dei dati di persistenza, dei moduli utente e degli attuali moduli base come descritto in [Backup e
   ripristino](/administration/Backup-Recovery.md).
2. Annota le liste dei moduli attivi e di avvio successivo con `sb list` e
   `sb next-boot`.
3. Esegui la sostituzione da un altro sistema oppure da un avvio caricato in RAM, così i file sorgente non saranno in uso.
4. Conserva i file precedenti fino a quando la nuova immagine non avrà effettuato il boot e l’hardware e le applicazioni richieste saranno stati testati.

Mantieni i nomi base e l’ordine dei moduli quando una release richiede la sostituzione diretta. Una sorgente successiva con lo stesso nome base sostituisce una precedente nella selezione di avvio successivo; copie con nomi diversi possono essere entrambe caricate e generare un ordine dei layer non previsto.

## Aggiornare il kernel

Il kernel è un insieme coordinato: il modulo driver `01-kernel.sb`, l'immagine del kernel, l'initramfs e la configurazione del bootloader devono essere allineati. Usa MiniOS Kernel Manager o il comando `minios-kernel` invece di aggiornare solo un pacchetto `linux-image` tramite APT.

Elenca e pacchettizza un kernel dal repository, quindi attivalo per il prossimo avvio:

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

L'attivazione aggiorna la configurazione di avvio di MiniOS. Riavvia per eseguire il kernel selezionato, quindi verifica con `uname -r`. Conserva almeno un kernel funzionante noto e i relativi file di avvio finché hardware, storage, rete e driver esterni non sono stati testati. Il modulo kernel standard di MiniOS può includere driver aggiuntivi non presenti nel kernel del repository della distribuzione.

Consulta [Gestione kernel](/administration/Kernel-Management.md) per il flusso di lavoro grafico, le opzioni dei comandi e la procedura di ripristino.

## Compatibilità e ripristino

Esegui il backup della persistenza prima di cambiare l'immagine base o il kernel. I file dei pacchetti persistenti e i metadati possono sovrascrivere un nuovo modulo base o descrivere versioni di pacchetti che non corrispondono più. Prova una nuova immagine prima con una sessione pulita, poi con una copia della sessione esistente. Conserva l'immagine originale, i moduli e il backup della sessione finché non sarà più necessario effettuare il rollback.

Dopo ogni aggiornamento, verifica i moduli selezionati, effettua un avvio e controlla le applicazioni e l'hardware interessati. Se una nuova immagine base è in conflitto con vecchi moduli utente o la persistenza, disabilita tali layer e reintroducili uno alla volta.
