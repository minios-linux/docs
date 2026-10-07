---
updated: 2026-10-06
program_commits:
    minios-store: eec5785dd7eb547961c2799f1907496a33be2e8c
---

# Installazione del software

Il Negozio di applicazioni MiniOS offre un catalogo di ricette applicative su [store.minios.dev](https://store.minios.dev). Nell’ambiente live MiniOS, queste ricette possono essere installate direttamente nel sistema in esecuzione oppure utilizzate per creare uno o più moduli SquashFS (`.sb`) .

Questa pagina descrive il flusso di lavoro software live MiniOS. Un’installazione nativa mantiene il desktop selezionato e le applicazioni standard, ma rimuove il software specifico per MiniOS pensato per l’uso live. Su quel sistema installato, utilizza invece il normale flusso di gestione dei pacchetti Debian.

La consultazione del catalogo non richiede un server locale. L’installazione sì: l’interfaccia web si collega al demone locale del Negozio di applicazioni MiniOS oppure apre il gestore URI installato`minios-store://`.

## Prima dell’installazione

Apri i dettagli di un’applicazione e verifica le seguenti informazioni prima di aggiungerla al carrello:

- I nomi dei pacchetti e il metodo di installazione.
- Lo script di installazione, se presente.
- La homepage dell’applicazione e le informazioni sullo sviluppatore.
- Screenshot e immagini dell’applicazione, se disponibili. Questi sono metadati di presentazione e non garantiscono che una ricetta sia affidabile.
- Se la ricetta scarica un pacchetto Debian separato.
- Eventuali licenze software aggiuntive mostrate dalla ricetta. Le ricette che richiedono accettazione esplicita non possono essere installate finché non accetti quella licenza.

Le ricette possono installare pacchetti APT, scaricare pacchetti Debian o eseguire script shell. Le operazioni di installazione vengono eseguite con privilegi di root. Considera una ricetta e ogni download o repository che utilizza come codice privilegiato.

## Installa un’applicazione

1. Apri il Negozio di applicazioni MiniOS dal menu delle applicazioni. Il launcher verifica`https://store.minios.dev` e lo apre nel browser predefinito.
2. Cerca o esplora per categoria, apri i dettagli dell’applicazione e controlla i pacchetti o lo script.
3. Aggiungi una o più applicazioni al carrello.
4. In una sessione live MiniOS, seleziona`Module` o `System`.
5. In modalità modulo, scegli il livello di build se necessario. **Predefinito ricetta** mantiene il livello configurato per ciascuna ricetta; **Auto** usa tutti i moduli attualmente caricati come base di build e produce un nome modulo senza numero; un livello numerico da `01` a `09` usa solo i moduli caricati fino a quel livello. Preferisci Predefinito ricetta a meno che tu non debba evitare dipendenze da livelli opzionali superiori.
6. Per più applicazioni in modalità modulo, scegli un modulo combinato o moduli separati. Un modulo combinato può anche essere rinominato.
7. Accetta tutte le licenze delle ricette che richiedono esplicitamente l’accettazione.
8. Seleziona`Install` e segui l’avanzamento e l’output dei comandi. La pagina usa il demone locale quando il suo stato è `Connected`; altrimenti prova il gestore URI e può mostrare una richiesta di autenticazione PolicyKit.

Solo un batch di installazione tramite demone può essere eseguito alla volta. Chiudere la finestra di avanzamento non interrompe necessariamente l’installazione del demone; riapri l’indicatore di installazione per visualizzarla o annullarla esplicitamente.

## Modalità modulo e sistema

### Modalità modulo

La modalità modulo esegue`apt2sb` o `script2sb` in un ambiente isolato per la costruzione dei moduli. Scrive i file risultanti`.sb` nella prima posizione scrivibile tra queste:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Il primo percorso è la directory dei moduli sullo storage di avvio MiniOS corrente. Un modulo creato lì non viene attivato nella sessione attuale dal Negozio di applicazioni MiniOS. Lascia il modulo in quella directory e riavvia per caricarlo al prossimo avvio. Il risultato resta disponibile solo se il supporto di avvio sottostante è scrivibile e mantiene il file.

Il secondo percorso è un fallback usato quando la directory moduli normale non è scrivibile. Un modulo nella directory di fallback non viene caricato automaticamente al prossimo avvio live. Usa`Open folder`, poi copia il modulo completato nella`minios/modules` directory su un supporto di avvio MiniOS scrivibile prima di riavviare.

Un modulo combinato contiene tutte le ricette selezionate. Con pacchettizzazione separata, un errore può influire su una ricetta mentre i moduli completati in precedenza restano nella directory di destinazione.

### Modalità sistema

La modalità sistema utilizza direttamente APT o uno script ricetta sul filesystem root in esecuzione. Le modifiche hanno effetto nel sistema live corrente invece di produrre un modulo. La persistenza delle modifiche dopo il riavvio dipende dalla configurazione di persistenza della sessione.

La modalità sistema non è transazionale. Un’operazione fallita o annullata può lasciare pacchetti, stato dei repository o file modificati dai comandi precedenti.

## Servizio locale e confine di fiducia

Il`minios-store` servizio viene eseguito come root perché la costruzione dei moduli e l’installazione diretta dei pacchetti richiedono operazioni di mount, overlay, chroot, APT e dpkg. Per impostazione predefinita ascolta solo su`ws://127.0.0.1:8765`. L’interfaccia web invia i dati completi della ricetta, inclusi script e URL di download, a questo servizio locale.

Il demone valida la struttura della richiesta e il metodo di installazione supportato, ma non autentica o firma in modo indipendente il payload della ricetta. Una pagina che può raggiungere l’endpoint WebSocket locale può richiedere operazioni di installazione privilegiate. Pertanto:

- Mantieni il demone vincolato a`127.0.0.1`. Non esporre la porta`8765` su LAN o internet.
- Non impostare`MINIOS_STORE_HOST` su un indirizzo non di loopback a meno che non sia presente un ulteriore confine di sicurezza verificato.
- Accedi al Negozio di applicazioni MiniOS solo tramite il suo sito ufficiale HTTPS e controlla le ricette prima dell’installazione.
- Arresta o disabilita il servizio quando l’installazione tramite browser non è necessaria.

Gestisci il servizio systemd con:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Il gestore URI è un percorso separato. Avvia l’installer GTK tramite PolicyKit e non richiede il demone WebSocket. I link attuali del Negozio includono un payload ricetta codificato completo, così ricette APT, script e DEB scaricati possono usare lo stesso percorso di fallback; le accettazioni di licenza esplicite vengono trasmesse separatamente e ri-verificate dall’installer locale. Il vecchio`recipes=id:level:compression` formato resta come fallback di compatibilità e viene interpretato come ricetta APT. L’installer parte dopo l’autorizzazione, quindi controlla la richiesta del browser prima di accettare il prompt di autenticazione.

## Annullamento

Seleziona`Cancel` nella finestra di avanzamento web oppure`Cancel installation` nell’installer GTK. L’annullamento segna il batch come annullato e termina il processo figlio attualmente in esecuzione. Le ricette rimanenti non vengono avviate.

L’annullamento non è un rollback. I pacchetti o moduli completati in precedenza restano, e un comando interrotto durante APT, dpkg, uno script, un download o la costruzione di un modulo può lasciare uno stato parziale o un file di output incompleto. Dopo l’annullamento:

1. Leggi il log finale dell’installazione.
2. Controlla la directory di destinazione dei moduli per file inattesi o di dimensione zero.
3. Per la modalità sistema, esegui`sudo dpkg --audit` e ripara la configurazione dei pacchetti se necessario.
4. Rimuovi solo gli artefatti che hai identificato come appartenenti all’operazione annullata.

## Risoluzione dei problemi

### Il Negozio di applicazioni MiniOS è offline

Verifica l’accesso di rete a`https://store.minios.dev`. Uno stato`Offline` indica anche che il browser non è connesso al demone WebSocket locale; l’installazione può comunque procedere tramite il gestore URI se`minios-store-gui` è installato.

### Il browser non può connettersi al demone

Controlla il servizio e i suoi log:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

L’endpoint normale è`ws://127.0.0.1:8765`. Un conflitto di porta, servizio fermo, assenza di`python3-websockets`, o restrizioni del browser possono impedire la connessione. Riavviare il browser non ripara un demone fermo.

### Autenticazione non riuscita o nessun prompt visualizzato

L’installer URI richiede PolicyKit,`pkexec`, e un agente di autenticazione desktop attivo. Avvia l’installer da una sessione grafica attiva e verifica che`minios-store-gui` sia installato. Non aggirare il prompt esponendo il demone root sulla rete.

### Errore nella costruzione del modulo

Espandi il log di installazione e utilizza l’ultimo errore del comando invece del solo riepilogo. Cause comuni includono pacchetti non disponibili, errori di repository o DNS, spazio libero insufficiente, uno strumento di compressione non supportato e una directory moduli in sola lettura. Il demone segnala quando è passato a`/var/lib/minios-store/modules`.

### L’applicazione non è presente dopo l’installazione

Per la modalità modulo, riavvia dopo aver verificato che il file`.sb` sia nella directory`minios/modules` del supporto di avvio. Un file lasciato nella directory di fallback non viene caricato automaticamente. Per la modalità sistema su una sessione live, verifica che la sessione sia persistente se l’applicazione è scomparsa dopo il riavvio.

### Un’installazione di sistema annullata ha lasciato dpkg incompleto

Controlla lo stato dei pacchetti prima di riprovare:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Rivedi le modifiche APT proposte prima di confermare eventuali operazioni di riparazione aggiuntive.

## Documentazione correlata

- [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Ricostruzione ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
