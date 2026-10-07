---
updated: 2026-10-06
---

# Backup di MiniOS

Un backup rappresenta la soluzione affidabile per il ripristino di MiniOS. La documentazione non garantisce una procedura di riparazione generica per bootloader, filesystem o contenitori di persistenza danneggiati. Conserva copie recuperabili prima di modificare una release, il kernel, la struttura di archiviazione o sessioni importanti.

## Cosa eseguire il backup

Conserva le parti che non possono essere semplicemente ricreate da un'immagine MiniOS:

- file personali, inclusi i dati nascosti delle applicazioni che ti interessano;
- `config.conf`, revisionati `config.conf.d` file e modifiche intenzionali al menu di avvio o ai parametri di boot;
- moduli creati dall'utente `.sb` e una nota della release MiniOS per cui sono stati costruiti;
- sessioni persistenti che contengono stato di sistema o applicazioni di cui hai bisogno;
- chiavi di cifratura, credenziali di recupero e altri segreti conservati separatamente dal backup che proteggono.

I file archiviati al di fuori del layer di sessione, ad esempio in una posizione separata per i dati utente, devono essere salvati separatamente. Non dare per scontato che un archivio di sessione contenga dati montati da un altro filesystem.

## Esporta sessioni persistenti

Il Gestore sessioni MiniOS può esportare una **non in esecuzione** `native`, `dynfilefs`, `dynblk`, `vmdk`, o `raw` sessione, incluse le forme cifrate LUKS2 supportate, in un `.tar.zst` archivio verificato. Prima identifica la sessione:

```bash
minios-session list
minios-session running
```

Poi avvia un'altra sessione o **Avviare senza salvare** ed esporta la sessione inattiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L'esportazione è una copia logica del contenuto della sessione, non una copia byte per byte del suo contenitore di archiviazione. Salvala su un altro dispositivo.

Per una sessione il cui backend Raw, DynFileFS, DynBlk o VMDK è protetto da LUKS2, l'archivio contiene i file logici già decifrati. Proteggi l'archivio separatamente se i dati devono rimanere cifrati.

### Sessioni SquashFS

L'attuale Gestore sessioni non esporta né copia le sessioni SquashFS. Usa **Salva ora** prima dello spegnimento per completare lo snapshot corrente, quindi proteggi separatamente i file importanti. Se ti serve una copia completa e ripristinabile dell'intero dispositivo MiniOS, crea invece un'immagine offline del dispositivo.

Non affidarti alla copia manuale di una directory di sessione montata né alla ricostruzione di `session.conf`, segmenti DynFileFS, file di supporto DynBlk o altri metadati del contenitore come metodo di backup. Un backup manuale byte per byte DynBlk è sicuro solo quando il volume è scollegato e deve preservare tutte le parti esistenti,`volume*.db` inclusi i numeri con quattro o più cifre, esattamente come sono; il backup logico `minios-session export` è preferibile.

## Esegui il backup di configurazione e moduli

Su supporti MiniOS scrivibili, conserva `minios/config.conf`, `minios/config.conf.d/`, e i moduli creati dall'utente archiviati in `minios/modules/`.
Annota anche eventuali parametri di boot personalizzati o modifiche al menu di avvio che non siano evidenti da questi file.

Un modulo creato per una release MiniOS non è automaticamente compatibile con un'altra.
Conserva il sorgente o la ricetta necessari per ricostruire i moduli personalizzati importanti.

## Crea un'immagine dell'intero dispositivo

Un'immagine dell'intero dispositivo è utile se vuoi conservare insieme tabella delle partizioni, file di avvio, moduli, configurazione, sessioni e altri dati. Creala offline: spegni MiniOS e crea l'immagine del dispositivo da un altro sistema in esecuzione.

[Utilità disco](/installing-minios/installation-tools/Drive-Utility) offre le operazioni **Crea immagine** e **Scrivi immagine**. Salva l'immagine su un altro dispositivo fisico. Il ripristino di un'immagine dell'intero dispositivo sovrascrive il target selezionato, quindi verifica modello e capacità del target prima di procedere.

Un'immagine del dispositivo è un'integrazione, non una sostituzione, di un backup separato dei file personali importanti.

## Ripristina un archivio di sessione

L'importazione di un archivio del Gestore sessioni crea una nuova sessione numerata; non sovrascrive quella esistente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante l'importazione vengono eseguiti controlli di compatibilità. Controlla la sessione importata prima di attivarla e conserva la sessione funzionante finché la copia ripristinata non è stata testata.

Quando passi a una nuova release MiniOS, è preferibile migrare solo i dati personali e la configurazione selezionati. Non dare per scontato che una sessione completa precedente o un modulo personalizzato siano compatibili con la nuova release solo perché possono essere copiati.

Consulta [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) per la gestione delle sessioni e [Aggiornamento di MiniOS](/maintenance-and-recovery/Updating-MiniOS) per passare tra le release MiniOS.
