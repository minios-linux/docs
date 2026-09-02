---
updated: 2026-08-31
program_commits:
    minios-store: 2226f08d65dffd251ae016664239164a3b237fc0
---

# Installazione del software

Negozio di applicazioni MiniOS offre un catalogo di ricette applicative su [store.minios.dev](https://store.minios.dev). Nell'ambiente live MiniOS, queste ricette possono essere installate direttamente nel sistema in esecuzione oppure utilizzate per creare uno o più moduli SquashFS (`.sb`).

Questa pagina descrive il workflow software live MiniOS. Un'installazione nativa mantiene il desktop selezionato e le applicazioni standard, ma rimuove il software specifico per MiniOS destinato all'uso live. Su quel sistema installato, utilizzare invece il normale workflow di gestione pacchetti Debian.

La navigazione del catalogo non richiede un server locale. L'installazione sì: l'interfaccia web si collega al demone locale del Negozio di applicazioni MiniOS oppure apre il gestore URI installato `minios-store://`.

## Prima di installare

Apri i dettagli di un'applicazione e verifica le seguenti informazioni prima di aggiungerla al carrello:

- I nomi dei pacchetti e il metodo di installazione.
- Lo script di installazione, se presente.
- La homepage dell’applicazione e le informazioni sullo sviluppatore.
- Se la ricetta scarica un pacchetto Debian separato.

Le ricette possono installare pacchetti APT, scaricare pacchetti Debian o eseguire script shell. Le operazioni di installazione vengono eseguite con privilegi di root. Considera una ricetta e ogni download o repository utilizzato come codice privilegiato.

## Installa un'applicazione

1. Apri Negozio di applicazioni MiniOS dal menu delle applicazioni. Il launcher controlla `https://store.minios.dev` e lo apre nel browser predefinito.
2. Cerca o naviga per categoria, apri i dettagli dell'applicazione e verifica i pacchetti o lo script.
3. Aggiungi una o più applicazioni al carrello.
4. In una sessione live MiniOS, seleziona `Module` oppure `System`.
5. Per più applicazioni in modalità modulo, scegli un modulo combinato o moduli separati. Un modulo combinato può anche ricevere un nome personalizzato.
6. Seleziona `Install` e segui l'avanzamento e l'output dei comandi. La pagina utilizza il demone locale quando lo stato è `Connected`; altrimenti tenta con il gestore URI e potrebbe mostrare una richiesta di autenticazione PolicyKit.

È possibile eseguire solo un batch di installazione tramite demone alla volta. Chiudere la finestra di avanzamento non interrompe necessariamente l'installazione; riapri l'indicatore di installazione per visualizzarla o annullarla esplicitamente.

## Modalità modulo e sistema

### Modalità modulo

La modalità modulo esegue `apt2sb` o `script2sb` in un ambiente isolato per la creazione dei moduli. I file `.sb` risultanti vengono scritti nella prima posizione scrivibile tra le seguenti:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Il primo percorso è la directory dei moduli sullo storage di avvio MiniOS corrente. Un modulo creato lì non viene attivato nella sessione attuale dal Negozio di applicazioni MiniOS. Lascia il modulo in quella directory e riavvia per caricarlo al prossimo avvio. Il risultato rimane disponibile solo se il supporto di avvio sottostante è scrivibile e mantiene il file.

Il secondo percorso è una soluzione di fallback usata quando la directory moduli normale non è scrivibile. Un modulo nella directory di fallback non viene incluso automaticamente al prossimo avvio live. Usa `Open folder`, quindi copia il modulo completato nella directory `minios/modules` su un supporto di avvio MiniOS scrivibile prima di riavviare.

Un modulo combinato contiene tutte le ricette selezionate. Con il packaging separato, un errore può influenzare una ricetta mentre i moduli completati in precedenza nel batch rimangono nella directory di destinazione.

### Modalità sistema

La modalità sistema utilizza APT o uno script di ricetta direttamente sul filesystem root in esecuzione. Le modifiche hanno effetto immediato sul sistema live attuale invece di produrre un modulo. La persistenza di queste modifiche dopo il riavvio dipende dalla configurazione della persistenza della sessione.

La modalità sistema non è transazionale. Un'operazione fallita o annullata può lasciare pacchetti, stato del repository o file modificati da comandi precedenti.

## Servizio locale e confine di fiducia

Il servizio `minios-store` viene eseguito come root perché la costruzione dei moduli e l'installazione diretta dei pacchetti richiedono operazioni di mount, overlay, chroot, APT e dpkg. Per impostazione predefinita, ascolta solo su `ws://127.0.0.1:8765`. L'interfaccia web ospitata invia i dati completi della ricetta, inclusi script e URL di download, a questo servizio locale.

Il demone valida la struttura della richiesta e il metodo di installazione supportato, ma non autentica o firma in modo indipendente il payload della ricetta. Una pagina che può raggiungere l'endpoint WebSocket locale può richiedere operazioni di installazione privilegiate. Pertanto:

- Mantieni il demone vincolato a `127.0.0.1`. Non esporre la porta `8765` a una LAN o a Internet.
- Non impostare `MINIOS_STORE_HOST` su un indirizzo non di loopback a meno che non sia presente un ulteriore confine di sicurezza verificato.
- Accedi al Negozio di applicazioni MiniOS solo tramite il sito ufficiale HTTPS e controlla le ricette prima dell'installazione.
- Arresta o disabilita il servizio quando l'installazione tramite browser non è necessaria.

Gestisci il servizio systemd con:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Il gestore URI è un percorso separato. Avvia l'installer GTK tramite PolicyKit e non richiede il demone WebSocket. Le voci URI attuali sono interpretate come nomi di pacchetti APT con livello modulo e impostazione di compressione richiesti. L'installazione parte dopo l'autorizzazione, quindi controlla la richiesta del browser prima di accettare il prompt di autenticazione.

## Annullamento

Seleziona `Cancel` nella finestra di avanzamento web oppure `Cancel installation` nell’installer GTK. L’annullamento segna il batch come annullato e termina il processo figlio attualmente monitorato. Le ricette rimanenti non vengono avviate.

L’annullamento non è un rollback. I pacchetti o moduli completati in precedenza rimangono, e un comando interrotto durante APT, dpkg, uno script, un download o la costruzione di un modulo può lasciare uno stato parziale o un file di output incompleto. Dopo l’annullamento:

1. Leggi il log finale dell’installazione.
2. Controlla la directory di destinazione dei moduli per file inattesi o di dimensione zero.
3. Per la modalità sistema, esegui `sudo dpkg --audit` e ripara la configurazione dei pacchetti se necessario.
4. Rimuovi solo gli artefatti che hai identificato come appartenenti all’operazione annullata.

## Risoluzione dei problemi

### Negozio di applicazioni MiniOS non è in linea

Verifica l'accesso di rete a `https://store.minios.dev`. Uno stato `Offline` significa anche che il browser non è connesso al demone WebSocket locale; l'installazione può comunque procedere tramite il gestore URI se `minios-store-gui` è installato.

### Il browser non riesce a connettersi al demone

Controlla il servizio e i relativi log:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

L’endpoint normale è `ws://127.0.0.1:8765`. Un conflitto di porta, un servizio fermo, l’assenza di `python3-websockets` o restrizioni del browser possono impedire la connessione. Riavviare il browser non risolve un demone fermo.

### L’autenticazione fallisce o non appare alcun prompt

L’installer URI richiede PolicyKit, `pkexec` e un agente di autenticazione desktop attivo. Avvia l’installer da una sessione grafica attiva e verifica che `minios-store-gui` sia installato. Non aggirare il prompt esponendo il demone root sulla rete.

### Errore nella costruzione del modulo

Espandi il log di installazione e utilizza l’errore dell’ultimo comando invece del solo riepilogo. Le cause comuni includono pacchetti non disponibili, errori del repository o DNS, spazio libero insufficiente, uno strumento di compressione non supportato e una directory dei moduli in sola lettura. Il demone segnala quando è passato a `/var/lib/minios-store/modules`.

### L’applicazione è assente dopo l’installazione

Per la modalità modulo, riavvia dopo aver verificato che il file `.sb` sia nella directory `minios/modules` del supporto di avvio. Un file lasciato nella directory alternativa non viene caricato automaticamente. Per la modalità sistema in una sessione live, verifica che la sessione sia persistente se l’applicazione è scomparsa dopo il riavvio.

### Un’installazione di sistema annullata ha lasciato dpkg incompleto

Controlla lo stato dei pacchetti prima di riprovare:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Verifica le modifiche APT proposte prima di confermare eventuali operazioni di riparazione aggiuntive.

## Documentazione correlata

- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Ricostruzione ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
