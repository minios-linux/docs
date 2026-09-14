---
updated: 2026-09-13
---

# Backup di MiniOS

Un backup è il modo più affidabile per recuperare MiniOS. La documentazione non garantisce una procedura di riparazione generica per un bootloader, filesystem o contenitore di persistenza danneggiati. Conserva copie ripristinabili prima di modificare una release, il kernel, la struttura di archiviazione o una sessione importante.

## Cosa eseguire il backup

Conserva le parti che non possono essere semplicemente ricreate da un'immagine MiniOS:

- file personali, inclusi i dati nascosti delle applicazioni che per te sono importanti;
- `config.conf`, revisionati `config.conf.d`file e modifiche intenzionali al menu di avvio o ai parametri di boot;
- moduli creati dall'utente `.sb`e una nota della versione MiniOS per cui sono stati creati;
- sessioni persistenti che contengono lo stato di sistema o applicazione di cui hai bisogno;
- chiavi di cifratura, credenziali di recupero e altri dati sensibili conservati separatamente dal backup che proteggono.

I file archiviati al di fuori del livello di sessione, ad esempio in una posizione separata per i dati utente, devono essere salvati separatamente. Non dare per scontato che un archivio di sessione contenga dati montati da un altro filesystem.

## Esporta sessioni persistenti

Gestore sessioni MiniOS può esportare una **non attiva** `native`, `dynfilefs`, `dynblk`, `raw`, oppure `luks` sessione su un archivio verificato `.tar.zst` . Per prima cosa identifica la sessione:

```bash
minios-session list
minios-session running
```

Poi avvia un'altra sessione oppure **Avvia senza salvare** ed esporta la sessione inattiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L'esportazione è una copia logica del contenuto della sessione, non una copia byte per byte del suo contenitore di archiviazione. Salvala su un altro dispositivo.

Per una sessione LUKS, l'archivio contiene i file logici decifrati. Proteggi l'archivio separatamente se i dati devono rimanere cifrati.

### SquashFS sessioni

L'attuale Session Manager non esporta né copia le sessioni SquashFS. Usa **Salva ora** prima dell'arresto per completare lo snapshot corrente, quindi proteggi separatamente i file importanti. Se hai bisogno di una copia completa e ripristinabile dell'intero dispositivo MiniOS, crea invece un'immagine offline del dispositivo.

Non fare affidamento sulla copia manuale di una directory di sessione montata o sulla ricostruzione di `session.conf`, segmenti DynFileFS, file di supporto dynblk o altri metadati del contenitore come metodo di backup. Un backup manuale byte-per-byte di dynblk è sicuro solo quando il volume è scollegato e deve preservare l'intero `volume000.db` fino a `volume063.db` namespace esattamente come esiste; è preferibile un `minios-session export` logico.

## Esegui il backup della configurazione e dei moduli

Su supporti MiniOS scrivibili, conserva `minios/config.conf`, `minios/config.conf.d/`, e i moduli creati dall’utente salvati in `minios/modules/`.
Annota anche eventuali parametri di avvio personalizzati o modifiche al menu di avvio che non siano evidenti da questi file.

Un modulo creato per una versione MiniOS non è automaticamente compatibile con un’altra.
Conserva il sorgente o la ricetta necessari per ricostruire i moduli personalizzati importanti.

## Crea un'immagine dell'intero dispositivo

Un'immagine dell'intero dispositivo è utile quando vuoi preservare insieme la tabella delle partizioni, i file di avvio, i moduli, la configurazione, le sessioni e altri dati. Creala offline: spegni MiniOS e crea l'immagine del dispositivo da un altro sistema in esecuzione.

[Utilità disco](/installing-minios/installation-tools/Drive-Utility) fornisce **Crea immagine** e **Scrivi immagine** operazioni. Salva l'immagine su un altro dispositivo fisico. Il ripristino di un'immagine dell'intero dispositivo sovrascrive il target selezionato, quindi verifica modello e capacità del target prima di scrivere.

Un'immagine del dispositivo è un'integrazione, non una sostituzione, di un backup separato dei file personali importanti.

## Ripristina un archivio sessione

L'importazione di un archivio Session Manager crea una nuova sessione numerata; non sovrascrive quella esistente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante l'importazione vengono eseguiti controlli di compatibilità. Verifica la sessione importata prima di attivarla e conserva la sessione funzionante finché la copia ripristinata non è stata testata.

Quando si passa a una nuova release MiniOS, è preferibile migrare solo i dati personali e le configurazioni selezionate. Non dare per scontato che una sessione completa precedente o un modulo personalizzato sia compatibile con la nuova release solo perché può essere copiato.

Vedi [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) per la gestione delle sessioni e [Aggiornamento MiniOS](/maintenance-and-recovery/Updating-MiniOS) per il passaggio tra release MiniOS.
