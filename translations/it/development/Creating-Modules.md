# Creazione dei moduli

I moduli MiniOS sono immagini di filesystem SquashFS in sola lettura, convenzionalmente denominate con l'estensione `.sb`. All'avvio, MiniOS ordina i moduli selezionati in un filesystem root a livelli. I file in un livello con priorità superiore possono integrare o nascondere file dei livelli inferiori.

Questa guida documenta i flussi di lavoro attuali da riga di comando degli strumenti MiniOS. Per l'applicazione grafica, consulta [MiniOS Module Manager](/administration/Module-Manager.md). Per il processo completo di creazione delle immagini e l'architettura del sistema, vedi [Building MiniOS](/development/Building-MiniOS.md). Le liste di pacchetti utilizzate durante la creazione di MiniOS sono descritte nella [documentazione di CondinAPT](/development/CondinAPT.md).

## Sicurezza e limiti di privilegio

Non tutte le operazioni sui moduli richiedono i permessi di root:

| Operazione | Privilegio |
|---|---|
| Elenca moduli in esecuzione ora o al prossimo avvio con `sb` | Senza root |
| Ispeziona un modulo con `sb inspect` | Senza root |
| Conversione ordinaria `dir2sb` e `sb2dir` | Senza root |
| Preserva proprietà o consente file speciali durante la conversione | Root |
| Crea con `apt2sb`, `script2sb` o `chroot2sb` | Root |
| Cattura la sessione con `savechanges` | Root |
| Attiva, disattiva, aggiungi al prossimo avvio o rimuovi dal prossimo avvio | Root |

I builder utilizzano una union isolata e non installano pacchetti né applicano script sul root in esecuzione. La creazione inoltre non attiva il risultato né lo seleziona per il prossimo avvio.

I converter e builder attuali utilizzano la pubblicazione senza sovrascrittura. Un target già esistente, inclusi i collegamenti simbolici, non viene sovrascritto. Scegli un nuovo percorso di output oppure rimuovi esplicitamente il vecchio output.

Utilizza l'output `--help` di ciascun comando come riferimento per la versione installata. Le scelte di compressione standard del builder sono `zstd` (predefinita), `gzip`, `lzo` e `xz`; `dir2sb` supporta anche `lz4`.

## Nomi dei moduli e livelli di filtro

I nomi iniziano spesso con un numero come `06-browser.sb` perché l'ordine dei livelli influisce sulla risoluzione dei conflitti. Un modulo dovrebbe contenere percorsi relativi alla root del sistema, come `usr/bin/example`, e non una directory aggiuntiva che contiene quell'albero.

L'opzione `--level LEVEL` su `apt2sb`, `script2sb` e `chroot2sb` limita i livelli di base utilizzati per costruire la union di build. Con `--level 3`, vengono utilizzati i livelli numerati fino a `03` e quelli con numerazione superiore vengono esclusi. Questo può rendere un modulo meno dipendente da livelli opzionali più alti, al costo di includere più dipendenze nel risultato.

## Crea un modulo da pacchetti

`apt2sb` installa pacchetti dai repository o file locali `.deb` leggibili in una union di build privata e ne cattura il risultato. Richiede una sessione live MiniOS supportata e i permessi di root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Senza `--name`, il nome di output è derivato dal primo pacchetto. Opzioni APT utili includono `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` e `--target-release RELEASE`. L'opzione target-release si applica solo a `install`.

Per catturare aggiornamenti di pacchetti già installati:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

## Crea un modulo da uno script

`script2sb` copia uno script di installazione in una chroot privata, lo rende eseguibile, lo esegue come root senza terminale interattivo, lo rimuove e cattura le modifiche al filesystem risultanti. Se lo script fallisce, il modulo non viene creato.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

L'opzionale `--directory DIR` copia tutti i contenuti della sorgente, inclusi i file nascosti, nella root del modulo prima dell'esecuzione dello script. Organizza la directory seed come un albero di filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Rivedi lo script prima di eseguirlo. Viene eseguito con privilegi di amministratore e può lanciare comandi arbitrari. Usa `chroot2sb` invece se l'installazione richiede prompt o interventi manuali.

## Crea un modulo in modalità interattiva

`chroot2sb` crea una union di build privata e apre una shell root al suo interno. Installa pacchetti o modifica file, quindi esci dalla shell per catturare le modifiche:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

I comandi inseriti nella shell non vengono ripetuti quando il modulo viene caricato; il modulo rappresenta uno snapshot dello stato del filesystem risultante. La cronologia della shell viene rimossa dal risultato. Se non viene fornito un nome, quello generato utilizza data e ora correnti.

Il ciclo di vita suddiviso `prepare`, `shell`, `finish` e `cancel` esiste per frontend grafici protetti. Per l'uso normale da terminale, utilizza il comando interattivo singolo mostrato sopra.

## Crea un modulo da una directory

`dir2sb` impacchetta il contenuto di una directory preparata in un nuovo modulo. Sono richiesti entrambi gli argomenti:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversione ordinaria non richiede root. La sorgente resta invariata, la proprietà all'interno del modulo viene normalizzata a root, i nodi di dispositivo, socket e FIFO vengono rifiutati e il target non viene mai sovrascritto. Usa `--keep-ownership` o `--allow-special` solo quando sono richieste queste semantiche privilegiate.

## Cattura le modifiche della sessione corrente

`savechanges` legge il layer scrivibile autorevole di una sessione MiniOS in esecuzione. Richiede i permessi di root perché quel layer può contenere file accessibili solo da root. La posizione predefinita delle modifiche viene rilevata automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Senza `--profile`, la policy storica di MiniOS omette directory vuote, cache, log, dati di avvio, percorsi runtime, pseudo-filesystem e file selezionati di sessione e sistema. Questo è comodo per la creazione tradizionale dei moduli, ma non rappresenta una garanzia esplicita di privacy.

I profili espliciti sono:

- `exact` preserva le modifiche rappresentabili, inclusi dati utente, log, cache, file di identità, credenziali e metadati di eliminazione supportati. Rifiuta oggetti filesystem non supportati invece di perderli silenziosamente.
- `clean` utilizza una allowlist di percorsi orientata al software. Esclude dati home e root, log, cache, identità, configurazione di rete, credenziali, configurazione di sistema arbitraria e `/usr/local`. Riduce l'esposizione della privacy ma non può garantire che un file software consentito non contenga segreti.
- `selected` include solo percorsi relativi revisionati da un file di inventario e selezione. Le esclusioni esplicite hanno la precedenza. Questo è il profilo appropriato quando il modulo deve contenere un sottoinsieme controllato delle modifiche di sessione.

Esempi:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un file di selezione ha questa struttura JSON rigorosa:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

I percorsi sono normalizzati, non vuoti e relativi alla root delle modifiche. Genera e rivedi prima l'inventario; ogni inclusione deve corrispondere ai dati dell'inventario. L'inventario registra metadati come percorso, tipo, categoria, sensibilità e dimensione, ma non legge né emette contenuti dei file, target di link simbolici o valori segreti. Gli output e gli inventari dei profili espliciti sono in modalità `0600`; i moduli con policy legacy sono in modalità `0644`.

La cattura della sessione può mantenere le eliminazioni di file supportate e l'opacità delle directory per il backend AUFS o OverlayFS attivo. Esclude mount runtime, filesystem annidati, bookkeeping della union e l'output stesso. Un target esistente non viene mai sovrascritto.

## Ispeziona ed estrai moduli

Ispeziona un modulo senza montarlo né estrarlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L'ispezione non richiede root e funziona anche al di fuori di una sessione MiniOS attiva.

Estrai un modulo in una nuova directory:

```bash
sb2dir 06-example.sb example-root
```

L'estrazione ordinaria non richiede root e non modifica la sorgente. La directory di destinazione non deve esistere. I file speciali vengono rifiutati a meno che `--allow-special` non sia richiesto con i privilegi necessari.

Le directory prodotte dagli attuali `sb2dir` sono directory ordinarie. `rmsbdir`, `sb rm` e `sb rmdir` sono comandi di compatibilità ritirati che rifiutano sempre la rimozione; non smontano né eliminano ricorsivamente nulla. Rivedi un percorso estratto e il suo contenuto prima di rimuoverlo con i normali strumenti del filesystem.

## Gestisci i moduli in esecuzione e al prossimo avvio

"In esecuzione ora" e "Prossimo avvio" sono composizioni indipendenti.

Elenca i moduli che compongono effettivamente la root AUFS o OverlayFS corrente, dal livello più basso al più alto:

```bash
sb list
sb list --json
```

Elenca i moduli selezionati dalle regole di avvio correnti, inclusi `bext`, `load` e `noload`:

```bash
sb next-boot
sb next-boot --json
```

Queste interrogazioni non richiedono root. Un modulo per il prossimo avvio può provenire dall'albero dati di base, dalla sua directory `modules/` o da uno storage separato per i moduli persistenti. Una sorgente successiva con lo stesso basename sostituisce la selezione precedente.

Per rendere disponibile un modulo utente al prossimo avvio:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilizza uno storage scrivibile adatto e durevole, prepara e valida la copia, e la pubblica in modo atomico senza sostituire un modulo esistente. Il nome file deve rispettare i filtri di avvio correnti. Rimuovi un modulo utente selezionato tramite il suo basename esatto:

```bash
sudo sb next-boot remove 50-extra.sb
```

La rimozione viene rifiutata per i moduli di base e per quelli su sorgenti di sola lettura o volatili.

L'attivazione in runtime è un'operazione separata, valida solo per la sessione corrente:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Attivazione e disattivazione funzionano solo quando `/` è attualmente una union AUFS. Non sono disponibili su OverlayFS e il solo supporto AUFS nel kernel non è sufficiente. Nessun comando modifica il prossimo avvio.

Il dispatcher di conversione di compatibilità richiede entrambi gli argomenti:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L'uso diretto di `dir2sb` e `sb2dir` è preferibile perché la conversione ordinaria può essere eseguita senza root.

## Documentazione correlata

- [MiniOS Module Manager](/administration/Module-Manager.md)
- [Ricostruzione delle immagini ISO](/development/Rebuilding-ISO.md)
- [Building MiniOS](/development/Building-MiniOS.md)
- [Parametri di avvio](/configuration/Boot-Parameters.md)
