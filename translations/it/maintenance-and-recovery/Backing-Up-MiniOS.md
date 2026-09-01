---
updated: 2026-08-31
---

# Backup di MiniOS

Un backup è il percorso di recupero affidabile per MiniOS. La documentazione non garantisce una procedura di riparazione generica per un bootloader, filesystem o contenitore di persistenza danneggiato. Conserva copie recuperabili prima di modificare una release, il kernel, la struttura di archiviazione o una sessione importante.

## Cosa eseguire il backup

Conserva le parti che non possono essere semplicemente ricreate da un'immagine MiniOS:

- file personali, inclusi i dati delle applicazioni nascosti che ti interessano;
- file `config.conf`, file `config.conf.d` revisionati e modifiche intenzionali al boot-menu o ai parametri di avvio;
- moduli `.sb` creati dall'utente e una nota della release MiniOS per cui sono stati costruiti;
- sessioni persistenti che contengono stato di sistema o applicazione di cui hai bisogno;
- chiavi di cifratura, credenziali di recupero e altri dati sensibili archiviati separatamente dal backup che proteggono.

I file archiviati al di fuori del layer di sessione, ad esempio in una posizione dati utente separata, devono essere salvati separatamente. Non presumere che un archivio di sessione contenga dati montati da un altro filesystem.

## Esporta sessioni persistenti

Gestore sessioni MiniOS può esportare una sessione **non in esecuzione** `native`, `dynfilefs`, `raw` o `luks` in un archivio `.tar.zst` verificato. Per prima cosa, identifica la sessione:

```bash
minios-session list
minios-session running
```

Poi avvia un'altra sessione oppure scegli **Avvia senza salvare** ed esporta la sessione inattiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L'esportazione è una copia logica del contenuto della sessione, non una copia byte-per-byte del suo contenitore di archiviazione. Salvala su un altro dispositivo.

Per una sessione LUKS, l'archivio contiene i file logici decrittati. Proteggi l'archivio separatamente se i dati devono rimanere cifrati.

### Sessioni SquashFS

L'attuale Session Manager non esporta né copia sessioni SquashFS. Usa **Salva ora** prima dello spegnimento in modo che lo snapshot corrente sia completo, quindi proteggi separatamente i file importanti. Se hai bisogno di una copia completa e ripristinabile dell'intero dispositivo MiniOS, crea invece un'immagine offline del dispositivo.

Non fare affidamento sulla copia manuale di una directory di sessione montata o sulla ricostruzione di `session.conf`, segmenti DynFileFS o metadati del contenitore come metodo di backup.

## Backup di configurazione e moduli

Su supporti MiniOS scrivibili, conserva `minios/config.conf`, `minios/config.conf.d/` e i moduli creati dall'utente archiviati sotto `minios/modules/`.
Annota anche i parametri di avvio personalizzati o le modifiche al boot-menu che non sono evidenti da questi file.

Un modulo creato per una release MiniOS non è automaticamente compatibile con un'altra.
Conserva il sorgente o la ricetta necessari per ricostruire i moduli personalizzati importanti.

## Crea un'immagine dell'intero dispositivo

Un'immagine dell'intero dispositivo è utile quando vuoi conservare insieme la tabella delle partizioni, i file di avvio, i moduli, la configurazione, le sessioni e altri dati. Creala offline: spegni MiniOS e crea l'immagine del dispositivo da un altro sistema in esecuzione.

[Utilità disco](/installing-minios/installation-tools/Drive-Utility) offre le operazioni **Crea immagine** e **Scrivi immagine**. Salva l'immagine su un altro dispositivo fisico. Il ripristino di un'immagine dell'intero dispositivo sovrascrive il target selezionato, quindi verifica modello e capacità del target prima di scrivere.

Un'immagine del dispositivo è un'integrazione, non una sostituzione, di un backup separato dei file personali importanti.

## Ripristinare un archivio di sessione

L'importazione di un archivio Session Manager crea una nuova sessione numerata; non sovrascrive quella esistente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante l'importazione vengono eseguiti controlli di compatibilità. Controlla la sessione importata prima di attivarla e conserva la sessione funzionante finché la copia ripristinata non è stata testata.

Quando passi a una nuova release MiniOS, è preferibile migrare dati personali e configurazioni selezionati. Non presumere che una vecchia sessione completa o un modulo personalizzato siano compatibili con la nuova release solo perché possono essere copiati lì.

Consulta [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) per la gestione delle sessioni e [Aggiornamento di MiniOS](/maintenance-and-recovery/Updating-MiniOS) per passare tra le release MiniOS.
