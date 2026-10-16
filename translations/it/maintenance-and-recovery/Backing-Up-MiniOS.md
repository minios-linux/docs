---
updated: 2026-10-15
---

# Backup di MiniOS

Un backup è il metodo di ripristino più affidabile per MiniOS. La documentazione non garantisce una procedura di riparazione generica per un bootloader, un filesystem o un contenitore di persistenza danneggiati. Conserva copie ripristinabili prima di cambiare release, kernel, layout di archiviazione o sessione importante.

## Cosa includere nel backup

Conserva gli elementi che non possono essere semplicemente ricreati da un'immagine MiniOS:

- file personali, compresi i dati nascosti delle applicazioni che ti interessano;
- `config.conf`, i file verificati `config.conf.d` e le modifiche intenzionali al menu di avvio o ai parametri di boot;
- moduli `.sb` creati dall'utente e una nota della release MiniOS per cui sono stati compilati;
- sessioni persistenti contenenti dati di sistema o delle applicazioni di cui hai bisogno;
- chiavi di crittografia, credenziali di ripristino e altri segreti, archiviati separatamente dal backup che proteggono.

I file archiviati al di fuori del livello della sessione, ad esempio in una posizione separata per i dati utente, devono essere sottoposti a backup separatamente. Non dare per scontato che un archivio di sessione contenga dati montati da un altro filesystem.

## Esportare sessioni persistenti

Il Gestore sessioni MiniOS può esportare una sessione **non in esecuzione** `native`, `dynfilefs`, `dynblk`, `vmdk` o `raw` sessione, comprese le varianti supportate con crittografia LUKS2, in un archivio `.tar.zst`verificato. Per prima cosa, identifica la sessione:

```bash
sudo minios-session list
sudo minios-session running
```

Avvia quindi un'altra sessione o **Avviare senza salvare** ed esporta la sessione inattiva:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L'esportazione è una copia logica dei contenuti della sessione, non una copia byte per byte del suo contenitore di archiviazione. Salvala su un altro dispositivo.

Se il backend di una sessione, Raw, DynFileFS, DynBlk o VMDK, è protetto da LUKS2, l'archivio contiene i file logici decrittografati. Proteggi l'archivio separatamente se i dati devono rimanere crittografati.

### Sessioni SquashFS

La versione attuale di Gestore sessioni non esporta né copia le sessioni SquashFS. Usa **Salva ora** prima di spegnere, così lo snapshot corrente è completo; quindi proteggi separatamente i file importanti. Se ti serve una copia completa e ripristinabile dell'intero dispositivo MiniOS, crea invece un'immagine del dispositivo offline.

Non fare affidamento sulla copia manuale di una directory di sessione montata né sulla ricostruzione di `session.conf`, segmenti DynFileFS, file di supporto DynBlk o altri metadati del contenitore come metodo di backup. Una copia manuale byte per byte del volume DynBlk è sicura solo quando il volume è scollegato e deve mantenere tutte le parti esistenti di `volume*.db` esattamente come sono, compresi i numeri di quattro o più cifre; è preferibile il backup `minios-session export`logico.

## RAM sessioni e immagini di persistenza Ventoy

Prima di eseguire il backup dello spazio di archiviazione usato da una `perchtoram` sessione, salva esplicitamente lo stato RAM nel supporto originale o come nuova sessione. Una copia offline del supporto originale contiene altrimenti solo l'ultimo stato salvato. Per salvare sono necessari il supporto originale scrivibile e l'identità registrata; vedi [Sessioni e persistenza](/using-minios/Sessions-and-Persistence).

Il backend del Persistence Plugin selezionato Ventoy è un ambiente ext4, non una sessione MiniOS numerata, e non può essere esportato tramite Session Manager. Arrestalo correttamente prima di copiare l'immagine completa del backend da un altro sistema; conserva anche la relativa configurazione Ventoy. Conserva backup separati dei file personali importanti.

## Backup della configurazione e dei moduli

Sui supporti MiniOS scrivibili, conserva `minios/config.conf`, `minios/config.conf.d/` e i moduli creati dagli utenti, archiviati in `minios/modules/`.
Annota anche i parametri di avvio personalizzati o le modifiche al menu di avvio che non risultano evidenti da questi file.

Un modulo creato per una release MiniOS non è automaticamente adatto a un'altra.
Conserva il codice sorgente o la ricetta necessaria per ricompilare i moduli personalizzati importanti.

## Creare un'immagine dell'intero dispositivo

Un'immagine dell'intero dispositivo è utile per conservare insieme la tabella delle partizioni, i file di avvio, i moduli, la configurazione, le sessioni e gli altri dati. Creala offline: arresta MiniOS e crea l'immagine del dispositivo da un altro sistema in esecuzione.

[Utilità disco](/installing-minios/installation-tools/Drive-Utility) offre **Crea immagine** e **Scrivi immagine**. Salva l'immagine su un dispositivo fisico diverso. Il ripristino di un'immagine dell'intero dispositivo sovrascrive il dispositivo di destinazione selezionato: verifica quindi il modello e la capacità del dispositivo prima di scriverla.

Un'immagine del dispositivo è un'integrazione, non un sostituto, di un backup separato dei file personali importanti.

## Ripristinare un archivio di sessione

L'importazione di un archivio di Session Manager crea una nuova sessione numerata; non sovrascrive quella esistente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante l'importazione vengono eseguiti controlli di compatibilità. Controlla la sessione importata prima di attivarla e conserva la sessione funzionante finché non hai verificato la copia ripristinata.

Quando passi a una release MiniOS, è preferibile migrare i dati personali e la configurazione che ti servono. Non dare per scontato che una vecchia sessione completa o un modulo personalizzato siano compatibili con la nuova release solo perché possono essere copiati.

Vedi [Sessioni e persistenza](/using-minios/Sessions-and-Persistence) per la gestione delle sessioni e [Aggiornare MiniOS](/maintenance-and-recovery/Updating-MiniOS) per passare da una release MiniOS all'altra.
