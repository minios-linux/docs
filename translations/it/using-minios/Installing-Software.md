---
updated: 2026-10-15
program_commits:
    minios-store: c3d0d31db7966cd7809f0f4ba1ca642133c8f07a
---

# Installare software

Il Negozio di applicazioni MiniOS offre un catalogo di ricette per applicazioni su [store.minios.dev](https://store.minios.dev). Nell'ambiente live MiniOS, queste ricette possono essere installate direttamente nel sistema in esecuzione oppure usate per creare uno o più moduli SquashFS (`.sb`)

Questa pagina descrive il flusso di lavoro per installare software nell'ambiente live MiniOS. Un'installazione nativa mantiene l'ambiente desktop selezionato e le applicazioni di uso comune, ma rimuove il software specifico di MiniOS destinato all'uso live. Nel sistema installato, usa invece la normale procedura di gestione dei pacchetti Debian.

Per navigare nel catalogo non è necessario un server locale. Per installare, invece, sì: l'interfaccia web si connette al demone locale del Negozio di applicazioni MiniOS oppure apre il gestore URI installato`minios-store://`.

## Prima di installare

Apri i dettagli di un'applicazione e controlla le seguenti informazioni prima di aggiungerla al carrello:

- I nomi dei pacchetti e il metodo di installazione.
- Lo script di installazione, se presente.
- La homepage dell'applicazione e le informazioni sullo sviluppatore.
- Screenshot e immagini dell'applicazione, se disponibili. Sono metadati di presentazione, non una prova dell'affidabilità della ricetta.
- Se la ricetta scarica un pacchetto Debian separato.
- Eventuali licenze software aggiuntive indicate dalla ricetta. Le ricette che richiedono l'accettazione non possono essere installate finché non accetti esplicitamente la licenza.

Le ricette possono installare pacchetti APT, scaricare pacchetti Debian o eseguire script shell. Le operazioni di installazione vengono eseguite con privilegi di root. Considera la ricetta e ogni download o repository utilizzato come codice con privilegi.

## Installare un'applicazione

1. Apri il Negozio di applicazioni MiniOS dal menu delle applicazioni. Il launcher controlla `https://store.minios.dev` e lo apre nel browser predefinito.
2. Cerca o sfoglia le categorie, apri i dettagli dell'applicazione e controlla i pacchetti o lo script.
3. Aggiungi una o più applicazioni al carrello.
4. In una sessione live MiniOS, seleziona `Module` oppure `System`.
5. In modalità modulo, scegli il livello di build se necessario. **Predefinito ricetta** mantiene il livello configurato per ogni ricetta; **Automatico** usa tutti i moduli attualmente caricati come base di build e genera un nome di modulo senza numero; un livello numerico da `01` a `09` usa solo i moduli caricati fino a quel livello. Preferisci Predefinito ricetta, a meno che tu non debba evitare deliberatamente dipendenze dai livelli opzionali superiori.
6. Per più applicazioni in modalità modulo, scegli un unico modulo combinato oppure moduli separati. Puoi anche assegnare un nome personalizzato a un modulo combinato.
7. Accetta le licenze delle ricette che richiedono esplicitamente l'accettazione.
8. Seleziona `Install` e segui l'avanzamento e l'output dei comandi. La pagina usa il demone locale se il suo stato è `Connected`; altrimenti prova ad aprire il gestore URI e potrebbe mostrare una richiesta di autenticazione di PolicyKit.

È possibile eseguire un solo batch di installazione tramite il demone alla volta. Chiudere la finestra di dialogo dell'avanzamento non interrompe necessariamente un'installazione avviata dal demone; riapri l'indicatore di installazione per visualizzarla o annullarla esplicitamente.

## Modalità modulo e sistema

### Modalità modulo

La modalità modulo esegue `apt2sb` oppure `script2sb` in un ambiente isolato per la creazione di moduli. Scrive i file `.sb` risultanti nella prima posizione scrivibile tra quelle indicate di seguito:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Il primo percorso è la directory dei moduli dell'albero dati MiniOS effettivo. Con un avvio normale con permessi di scrittura si trova sul dispositivo di archiviazione, ma dopo la copia del sistema `toram` può essere basato su RAM; Store verifica che sia scrivibile, non che i dati siano permanenti. Un modulo creato non viene attivato nella sessione corrente. Viene caricato all'avvio successivo solo se copiato su un dispositivo di archiviazione permanente `minios/modules/` e consentito dai filtri di avvio. Quando è disponibile un dispositivo di archiviazione permanente adatto, usa **Aggiungi al prossimo avvio** oppure `sudo sb next-boot add /path/to/module.sb`.

Il secondo percorso è una posizione di riserva, usata quando la normale directory dei moduli non è scrivibile. Un modulo nella directory di riserva non viene incluso automaticamente nel successivo avvio live. Usa `Open folder`, quindi copia il modulo completato nella directory `minios/modules` sul supporto di avvio scrivibile MiniOS prima di riavviare.

Un modulo combinato contiene tutte le ricette selezionate. Se i pacchetti sono separati, un errore può interessare una ricetta, mentre i moduli completati in precedenza nel batch restano nella directory di destinazione.

### Modalità sistema

La modalità sistema usa APT o uno script di ricetta direttamente sul filesystem root in esecuzione. Le modifiche hanno effetto sul sistema live corrente, invece di generare un modulo. La loro persistenza dopo il riavvio dipende dalla configurazione di persistenza della sessione.

La modalità sistema non è transazionale. Un'operazione non riuscita o annullata può lasciare modificati i pacchetti, lo stato dei repository o i file interessati dai comandi eseguiti in precedenza.

## Servizio locale e confini di sicurezza

Il `minios-store` servizio viene eseguito come root perché la creazione di moduli e l'installazione diretta di pacchetti richiedono operazioni con mount, overlay, chroot, APT e dpkg. Per impostazione predefinita, è in ascolto solo su `ws://127.0.0.1:8765`. L'interfaccia web ospitata invia a questo servizio locale i dati completi della ricetta, inclusi script e URL di download.

Il daemon convalida la struttura della richiesta e il metodo di installazione supportato, ma non autentica né firma autonomamente il contenuto della ricetta. Una pagina che può raggiungere l'endpoint WebSocket locale può richiedere operazioni di installazione con privilegi elevati. Pertanto:

- Mantieni il daemon in ascolto su `127.0.0.1`. Non esporre la porta `8765` alla rete locale o a Internet.
- Non impostare `MINIOS_STORE_HOST` su un indirizzo non di loopback, a meno che non sia presente un ulteriore confine di sicurezza sottoposto a revisione.
- Accedi al Negozio di applicazioni MiniOS solo tramite il sito HTTPS ufficiale e controlla le ricette prima di installarle.
- Arresta o disabilita il servizio quando non è necessaria l'installazione tramite browser.

Gestisci il servizio systemd con:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Il gestore URI è un percorso separato. Avvia il programma di installazione GTK tramite PolicyKit e non richiede il daemon WebSocket. I link attuali del Negozio includono il payload completo della ricetta codificato, così le ricette APT, gli script e i pacchetti DEB scaricati possono usare lo stesso percorso alternativo; le accettazioni esplicite delle licenze vengono trasmesse separatamente e convalidate di nuovo dal programma di installazione locale. Il vecchio formato `recipes=id:level:compression` rimane disponibile come alternativa per compatibilità e viene interpretato come una ricetta APT. Il programma di installazione si avvia dopo l'autorizzazione: controlla quindi la richiesta del browser prima di accettare la richiesta di autenticazione.

## Annullamento

Seleziona `Cancel` nella finestra di avanzamento web oppure `Cancel installation` nel programma di installazione GTK. L'annullamento contrassegna l'elaborazione come annullata e termina il processo figlio attualmente monitorato. Le ricette rimanenti non vengono avviate.

L'annullamento non ripristina le modifiche. I pacchetti o i moduli completati in precedenza restano, mentre un comando interrotto durante l'esecuzione di APT, dpkg, uno script, un download o la creazione di un modulo può lasciare uno stato parziale o un file di output incompleto. Dopo l'annullamento:

1. Leggi il registro di installazione finale.
2. Controlla che nella directory dei moduli di destinazione non ci siano file imprevisti o di dimensione zero.
3. In modalità sistema, esegui `sudo dpkg --audit` e, se necessario, ripristina la configurazione dei pacchetti.
4. Rimuovi solo gli elementi che hai identificato come appartenenti all'operazione annullata.

## Risoluzione dei problemi

### Negozio di applicazioni MiniOS non è online

Verifica l'accesso alla rete a `https://store.minios.dev`. Anche uno stato `Offline` indica che il browser non è connesso al daemon WebSocket locale; l'installazione può comunque procedere tramite il gestore URI se `minios-store-gui` è installato.

### Il browser non riesce a connettersi al daemon

Controlla il servizio e i relativi log:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

L'endpoint predefinito è `ws://127.0.0.1:8765`. Un conflitto di porte, un servizio arrestato, un `python3-websockets` mancante o le restrizioni del browser possono impedire la connessione. Riavviare il browser non risolve il problema se il daemon è arrestato.

### Autenticazione non riuscita o nessuna richiesta visualizzata

Il programma di installazione URI richiede PolicyKit, `pkexec`, e un agente di autenticazione desktop attivo. Avvia il programma di installazione da una sessione grafica attiva e verifica che `minios-store-gui` sia installato. Non aggirare la richiesta esponendo il daemon root alla rete.

### Errore durante la creazione del modulo

Espandi il log di installazione e controlla l'ultimo errore del comando, non solo il riepilogo. Tra le cause più comuni ci sono pacchetti non disponibili, problemi con i repository o con il DNS, spazio libero insufficiente, uno strumento di compressione non supportato e una directory dei moduli in sola lettura. Il daemon segnala quando è passato a `/var/lib/minios-store/modules`.

### L'applicazione non è presente dopo l'installazione

Per la modalità modulo, riavvia dopo aver verificato che il file `.sb` si trovi nella directory del supporto di avvio `minios/modules`directory. Un file lasciato nella directory di fallback non viene caricato automaticamente. Per la modalità sistema in una sessione live, verifica che la sessione sia persistente se l'applicazione è scomparsa dopo il riavvio.

### Un'installazione di sistema annullata ha lasciato dpkg in uno stato incompleto

Controlla lo stato dei pacchetti prima di riprovare:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Esamina le modifiche proposte da APT prima di confermare qualsiasi altra operazione di ripristino.

## Documentazione correlata

- [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Ricreazione dell'ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
