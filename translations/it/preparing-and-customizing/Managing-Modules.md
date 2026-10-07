---
updated: 2026-10-06
program_commits:
    minios-module-manager: fbe617f2955ddbef97f9ee3e5856b7d58439a565
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Gestione dei moduli

Gestore moduli MiniOS è l'applicazione grafica per ispezionare, creare e gestire i moduli MiniOS `.sb` . Dispone di due aree di lavoro: **Moduli** per la composizione del sistema e **Crea** per creare nuovi moduli.

Avvialo dal menu delle applicazioni oppure esegui:

```bash
minios-module-manager
```

L'applicazione viene eseguita con il tuo utente desktop. Richiede l'autenticazione amministrativa solo quando l'operazione richiesta lo necessita.

## In esecuzione ora e al prossimo avvio

L'area di lavoro Moduli offre due viste separate:

- **In esecuzione ora** è l'insieme ordinato di moduli che attualmente compongono il sistema attivo.
- **Prossimo avvio** è l'insieme ordinato selezionato dalle attuali regole di avvio MiniOS.

Modificare una vista non cambia silenziosamente l'altra. Ad esempio, **Attiva per questa sessione** riguarda solo il sistema in esecuzione, mentre **Aggiungi al prossimo avvio** copia un modulo nell'archivio moduli permanente senza attivarlo subito.

Per le regole autorevoli di avvio, inclusi i livelli sorgente candidati, la sostituzione esatta del nome base, l'ordinamento numerico e `load=`, `noload=`, e `bext=` il filtraggio, consulta [Caricamento moduli Initrd](/reference/boot-process/Module-Loading). Questa guida spiega anche perché In esecuzione ora e Prossimo avvio possono differire.

L'attivazione e la disattivazione a runtime sono disponibili solo quando il filesystem root utilizza attualmente AUFS. Non sono disponibili su un root OverlayFS, anche se il kernel supporta AUFS. I moduli di base non possono essere disattivati tramite l'applicazione.

Le modifiche per il prossimo avvio sono disponibili solo quando MiniOS trova uno spazio di archiviazione moduli adatto, durevole e scrivibile. I moduli di base e quelli su supporti di sola lettura o volatili non possono essere rimossi. I filtri di avvio come `load`, `noload`, e `bext` determinano comunque quali moduli vengono selezionati.

## Ispezione di un modulo

Seleziona un modulo per visualizzare la posizione del file di origine, la dimensione compressa e il contenuto del filesystem. Se il file di origine è disponibile, **Estrai in cartella** crea una nuova directory contenente i file del modulo.

L'ispezione non richiede privilegi amministrativi. **Estrai in cartella** richiede l'autenticazione amministrativa per poter mantenere proprietari, permessi e file speciali. L'estrazione non sovrascrive mai una destinazione esistente né modifica il modulo sorgente.

Puoi anche aprire un file locale `.sb` dal file manager. L'apertura di un file permette solo l'ispezione; non lo attiva né lo aggiunge al prossimo avvio. Nei sistemi Xfce con l'integrazione Thunar MiniOS installata, le azioni del file manager utilizzano lo stesso backend dei moduli per attivazione e disattivazione esplicite; non ignorano la distinzione tra In esecuzione ora e Prossimo avvio.

## Creazione di un modulo

L'area di lavoro Crea utilizza un flusso **Configura**, **Rivedi**, **Esegui**, e **Risultato**. Un modulo creato con successo rimane un file nella posizione di output. Non viene attivato né aggiunto automaticamente al prossimo avvio.

I metodi disponibili sono:

- **Pacchetti** installa pacchetti da repository e file locali selezionati `.deb` , incluse le relative dipendenze, in un ambiente di build isolato MiniOS. L'installazione dei pacchetti richiede l'autenticazione amministrativa.
- **Script di installazione** esegue uno script revisionato senza terminale interattivo. Una cartella seed opzionale può fornire file iniziali. Lo script viene eseguito con privilegi amministrativi ma non viene memorizzato nel modulo risultante.
- **Chroot interattivo** apre una shell root temporanea nel terminale integrato. Digita `exit` quando hai terminato, quindi crea il modulo, riapri la shell o scarta le modifiche. Chiudere o annullare la sessione non modifica il sistema in esecuzione.
- **Cartella** impacchetta il contenuto di una directory esistente. La directory sorgente non viene annidata all'interno del modulo. Il flusso grafico richiede l'autenticazione amministrativa per leggere file protetti e preservare gli attributi del filesystem; la sorgente resta invariata. Le cartelle estratte con la conservazione della proprietà vengono riconosciute automaticamente e mantengono i loro proprietari. Per una cartella estratta in precedenza senza record di origine, seleziona **Mantieni proprietà sorgente** se è necessario conservare i proprietari.
- **Modifiche sessione corrente** cattura file e cancellazioni idonei dal layer scrivibile della sessione corrente. Utilizza la policy standard MiniOS `savechanges` , che esclude log, cache, dati di avvio e percorsi runtime temporanei. La lettura dell'intero layer scrivibile richiede l'autenticazione amministrativa.

Scegli un nuovo percorso di output per ogni flusso di lavoro. I file esistenti non vengono mai sovrascritti. Avanzamento e diagnostica backend restano visibili durante l'operazione, e la cattura della sessione corrente può essere annullata.

Per altre cartelle, il flusso Cartella predefinito cambia gli ID utente e gruppo ordinari (1000–60000) in root tranne che in `/home` e `/opt`, mantiene gli ID di sistema e rende root i proprietari delle directory principali standard. La proprietà persa durante un'estrazione non privilegiata precedente non può essere recuperata con questa opzione.

Modifiche sessione corrente è pensato per una cattura standard comoda, non per rivedere ogni percorso incluso. Un layer scrivibile attivo può contenere dati personali o riservati. Per policy di privacy esplicite su `exact`, `clean`, o selezione di percorsi, usa il flusso da riga di comando `savechanges` descritto in [Cattura modifiche sessione corrente](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Trascina e rilascia

Trascina e rilascia serve solo per compilare un input o aprire l'ispezione:

- Un modulo apre i suoi dettagli.
- `.deb` i file vengono aggiunti a Pacchetti.
- Una directory viene selezionata per Cartella.
- Un altro file regolare viene selezionato come Script di installazione.

Il rilascio di un elemento non esegue codice né modifica In esecuzione ora o Prossimo avvio.

## Documentazione correlata

- [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Caricamento moduli Initrd](/reference/boot-process/Module-Loading)
- [Modalità di avvio](/using-minios/Boot-Modes)
- [Composizione di immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parametri di avvio](/reference/Boot-Parameters)

## Creazione dei moduli

I moduli MiniOS sono immagini filesystem SquashFS di sola lettura, convenzionalmente denominate con l'estensione `.sb`. All'avvio, MiniOS ordina i moduli selezionati in un filesystem root a livelli. I file in un livello con priorità superiore possono integrare o nascondere quelli dei livelli inferiori. Questa pipeline live modulare fa parte dell'architettura MiniOS descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS) e [Modalità di avvio](/using-minios/Boot-Modes). Dopo la conversione nativa, il root a livelli `.sb` viene sostituito da un normale filesystem Debian scrivibile. Il software di gestione moduli MiniOS viene rimosso perché i flussi di lavoro sui moduli non sono più applicabili, mentre l'ambiente desktop selezionato e le applicazioni restano installate come normali pacchetti.

Questa guida documenta i flussi di lavoro attuali da riga di comando di MiniOS Tools. Per l'applicazione grafica, vedi [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules). Per il processo completo di creazione dell'immagine e l'architettura di sistema, consulta [Creazione di MiniOS](/development/Building-MiniOS). Le liste dei pacchetti utilizzate durante la creazione di MiniOS sono descritte nella [documentazione CondinAPT](/development/CondinAPT).

### Sicurezza e privilegi

Non tutte le operazioni sui moduli richiedono root:

| Operazione | Privilegio |
|---|---|
| Elenca In esecuzione ora o Prossimo avvio con `sb` | Senza root |
| Ispeziona un modulo con `sb inspect` | Senza root |
| Conversione da riga di comando `dir2sb` e `sb2dir` conversione | Senza root |
| Mantieni proprietà o consenti file speciali durante la conversione | Root |
| Crea con `apt2sb`, `script2sb`, o `chroot2sb` | Root |
| Cattura la sessione con `savechanges` | Root |
| Attiva, disattiva, aggiungi al prossimo avvio o rimuovi dal prossimo avvio | Root |

I builder utilizzano un'unione isolata e non installano pacchetti o modifiche di script nel root in esecuzione. La creazione inoltre non attiva il risultato né lo seleziona per il prossimo avvio.

I flussi grafici Cartella ed Estrai in cartella richiedono l'autenticazione amministrativa per gestire file protetti e preservare gli attributi del filesystem.

I convertitori e i builder attuali usano la pubblicazione senza sovrascrittura. Un target già esistente, inclusi i collegamenti simbolici, non viene sovrascritto. Scegli un nuovo percorso di output o rimuovi manualmente il vecchio output.

Utilizza l'output `--help` di ciascun comando come riferimento della versione installata. Gli attuali flussi di lavoro `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb`, e `savechanges` accettano `zstd` (predefinito), `gzip`, `lzo`, `lz4`, e `xz`. Il compressore selezionato deve essere disponibile nel sistema in esecuzione.

### Nomi dei moduli e livelli di filtro

I nomi iniziano comunemente con un numero come `06-browser.sb` perché l'ordine dei livelli influisce sulla risoluzione dei conflitti. Un modulo dovrebbe contenere percorsi relativi al root di sistema, come `usr/bin/example`, non una directory aggiuntiva che contiene quell'albero.

Per i livelli sorgente candidati esatti, il comportamento in caso di collisione del nome base, l'ordinamento numerico e `bext=`, `load=`, e `noload=` la semantica, consulta [Caricamento moduli Initrd](/reference/boot-process/Module-Loading). In particolare, usa un nome base univoco a meno che il modulo non debba sostituire uno slot con lo stesso nome da un livello sorgente precedente.

L'opzione `--level LEVEL` su `apt2sb`, `script2sb`, e `chroot2sb` limita i livelli di base utilizzati per costruire l'unione di build. Con `--level 3`, vengono utilizzati i livelli numerati fino a `03` e quelli con numero superiore vengono esclusi. Questo può rendere il modulo meno dipendente da livelli opzionali superiori, al costo di includere più dipendenze nel risultato.

### Crea un modulo da pacchetti

`apt2sb` installa pacchetti da repository o file locali leggibili `.deb` nei unione di build privata e cattura il risultato. Richiede una sessione live MiniOS supportata e i privilegi di root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Senza `--name`, il nome di output viene derivato dal primo pacchetto. Opzioni APT utili includono `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, e `--target-release RELEASE` . L'opzione target-release si applica solo a `install`.

Per catturare gli aggiornamenti dei pacchetti già installati:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Crea un modulo da uno script

`script2sb` copia uno script di installazione in un chroot privato, lo rende eseguibile, lo esegue come root senza terminale interattivo, lo rimuove e cattura le modifiche risultanti al filesystem. Uno script fallito non crea alcun modulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

L'opzionale `--directory DIR` copia tutti i contenuti della sorgente, inclusi i file nascosti, nella root del modulo prima dell'esecuzione dello script. Organizza la directory seed come un albero filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Rivedi lo script prima di eseguirlo. Viene eseguito con privilegi amministrativi e può eseguire comandi arbitrari. Usa `chroot2sb` invece se l'installazione richiede prompt o interventi manuali.

### Crea un modulo in modo interattivo

`chroot2sb` crea un'unione di build privata e apre una shell root al suo interno. Installa pacchetti o modifica file, quindi esci dalla shell per catturare le modifiche:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

I comandi inseriti nella shell non vengono rieseguiti quando il modulo viene caricato; il modulo è uno snapshot dello stato risultante del filesystem. La cronologia della shell viene rimossa dal risultato. Se non viene fornito un nome, quello generato usa data e ora correnti.

Il ciclo di vita suddiviso `prepare`, `shell`, `finish`, e `cancel` esiste per i frontend grafici protetti. Per l'uso normale da terminale, utilizza il comando interattivo singolo mostrato sopra.

### Crea un modulo da una directory

`dir2sb` impacchetta il contenuto di una directory preparata in un nuovo modulo. Sono richiesti entrambi gli operandi:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversione ordinaria non richiede root. La sorgente resta invariata, gli ID utente e gruppo ordinari (1000–60000) vengono cambiati in root tranne che in `/home` e `/opt`, mantiene gli ID di sistema e rende root i proprietari delle directory principali standard. Rifiuta nodi di dispositivo, socket e FIFO, e non sovrascrive mai il target. `--keep-ownership` mantiene tutti i proprietari della sorgente e `--allow-special` consente file speciali; entrambe richiedono root.

`sb2dir` scrive `.minios-module-origin.json` nella directory estratta. Se l'estrazione ha mantenuto la proprietà, `dir2sb` riconosce questo record e preserva automaticamente proprietari e file speciali durante il reimballaggio; il record stesso non viene incluso nel nuovo modulo. Una directory estratta senza conservazione della proprietà non può essere reimpacchettata, perché i proprietari originali non sono più noti. Estrai nuovamente il modulo originale con le opzioni privilegiate.

### Cattura modifiche sessione corrente

`savechanges` legge il layer scrivibile autorevole di una sessione MiniOS in esecuzione. Richiede root perché quel layer può contenere file accessibili solo a root. La posizione predefinita delle modifiche viene rilevata automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Senza `--profile`, la policy storica MiniOS esclude directory vuote, cache, log, dati di avvio, percorsi runtime, pseudo-filesystem e file di sessione e sistema selezionati. È comoda per la creazione tradizionale di moduli, ma non è una garanzia esplicita di privacy.

I profili espliciti sono:

- `exact` conserva le modifiche rappresentabili, inclusi dati utente, log, cache, file di identità, credenziali e metadati di cancellazione supportati. Rifiuta oggetti filesystem non supportati invece di perderli silenziosamente.
- `clean` utilizza una lista di percorsi consentiti orientata al software. Esclude dati home e root, log, cache, identità, configurazione di rete, credenziali, configurazione di sistema arbitraria e `/usr/local`. Riduce l'esposizione della privacy ma non può garantire che un file software consentito non contenga segreti.
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

I percorsi sono normalizzati, non vuoti e relativi alla root delle modifiche. Genera e rivedi prima l'inventario; ogni inclusione deve corrispondere ai dati dell'inventario. L'inventario registra metadati come percorso, tipo, categoria, sensibilità e dimensione, ma non legge né emette contenuti di file, destinazioni di link simbolici o valori segreti. Gli output e gli inventari dei profili espliciti sono in modalità `0600`; i moduli con policy legacy sono in modalità `0644`.

La cattura della sessione può mantenere le cancellazioni di file supportate e l'opacità delle directory per il backend attivo AUFS o OverlayFS. Esclude mount runtime, filesystem annidati, bookkeeping dell'unione e l'output stesso. Un target esistente non viene mai sovrascritto.

### Ispeziona ed estrai moduli

Ispeziona un modulo senza montarlo o estrarlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L'ispezione è senza root e funziona anche al di fuori di una sessione MiniOS in esecuzione.

Estrai un modulo in una nuova directory:

```bash
sb2dir 06-example.sb example-root
```

L'estrazione ordinaria è senza root e non modifica la sorgente. La directory di destinazione non deve esistere. I file speciali vengono rifiutati a meno che `--allow-special` venga richiesto con i privilegi necessari.

Per una directory che può essere reimpacchettata fedelmente, estrai con privilegi amministrativi e mantieni proprietà e file speciali:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

L'estrazione registra l'origine del modulo in `.minios-module-origin.json` all'interno della nuova directory. L'estrazione senza root registra che la proprietà non è stata mantenuta; una directory di questo tipo non può essere reinserita in `dir2sb`. Mantieni il record di origine con un'estrazione privilegiata fino al reimballaggio.

Le directory prodotte dagli attuali `sb2dir` sono directory ordinarie. `rmsbdir`, `sb rm`, e `sb rmdir` sono comandi di compatibilità obsoleti che rifiutano sempre la rimozione; non smontano né eliminano ricorsivamente nulla. Verifica un percorso estratto e i suoi contenuti prima di rimuoverlo con gli strumenti standard del filesystem.

### Gestione dei moduli in esecuzione e al prossimo avvio

In esecuzione ora e Prossimo avvio sono composizioni indipendenti. Consulta [costruzione dell'unione e attivazione runtime](/reference/boot-process/Module-Loading#union-construction) per il confine tra avvio e runtime e perché le due liste possono differire.

Elenca i moduli che compongono effettivamente il root AUFS o OverlayFS corrente, dal più basso al più alto in priorità:

```bash
sb list
sb list --json
```

Elenca i moduli selezionati dalle attuali regole di avvio:

```bash
sb next-boot
sb next-boot --json
```

Queste interrogazioni non richiedono root. Le regole canoniche [tier candidato e sostituzione](/reference/boot-process/Module-Loading#candidate-tiers) determinano quale sorgente fornisce ogni nome base di Prossimo avvio.

Per rendere disponibile un modulo utente al prossimo avvio:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilizza uno storage durevole e scrivibile idoneo, prepara e valida la copia, e la pubblica in modo atomico senza sostituire un modulo esistente. Il nome file deve soddisfare i filtri di avvio attuali. Rimuovi un modulo utente selezionato tramite il suo nome base esatto:

```bash
sudo sb next-boot remove 50-extra.sb
```

La rimozione viene rifiutata per i moduli di base e quelli su sorgenti di sola lettura o volatili.

L'attivazione a runtime è un'operazione separata, valida solo per la sessione corrente:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Attivazione e disattivazione funzionano solo quando `/` è attualmente un'unione AUFS. Non sono disponibili su OverlayFS, e il solo supporto kernel AUFS non basta. Nessuno dei due comandi modifica Prossimo avvio.

Il dispatcher di conversione di compatibilità richiede entrambi gli operandi:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L'utilizzo diretto di `dir2sb` e `sb2dir` è preferibile perché la conversione ordinaria può essere eseguita senza root.

### Documentazione correlata

- [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules)
- [Caricamento moduli Initrd](/reference/boot-process/Module-Loading)
- [Modalità di avvio](/using-minios/Boot-Modes)
- [Ricostruzione delle immagini ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Creazione di MiniOS](/development/Building-MiniOS)
- [Parametri di avvio](/reference/Boot-Parameters)
