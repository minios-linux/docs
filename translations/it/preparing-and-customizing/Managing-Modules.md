---
updated: 2026-08-31
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# Gestione dei moduli

Il Gestore moduli MiniOS è l'applicazione grafica per ispezionare, creare e gestire i moduli MiniOS `.sb`. Dispone di due aree di lavoro: **Moduli** per la composizione del sistema e **Crea** per la creazione di nuovi moduli.

Avvialo dal menu delle applicazioni oppure esegui:

```bash
minios-module-manager
```

L'applicazione viene eseguita come utente desktop. Richiede l'autenticazione amministratore solo quando necessario per l'operazione richiesta.

## In esecuzione ora e al prossimo avvio

L'area di lavoro Moduli mantiene due viste separate:

- **In esecuzione ora** è l'insieme ordinato dei moduli che attualmente compongono il sistema attivo.
- **Prossimo avvio** è l'insieme ordinato selezionato dalle attuali regole di avvio MiniOS.

Modificare una vista non cambia silenziosamente l'altra. Ad esempio, **Attiva per questa sessione** riguarda solo il sistema in esecuzione, mentre **Aggiungi al prossimo avvio** copia un modulo nell'archivio persistente dei moduli senza attivarlo subito.

Per le regole autorevoli di avvio, inclusi i livelli sorgente candidati, la sostituzione esatta del basename, l'ordinamento numerico e i filtri `load=`, `noload=` e `bext=`, consulta [Caricamento moduli Initrd](/reference/boot-process/Module-Loading). Questa guida spiega anche perché In esecuzione ora e Prossimo avvio possono differire.

L'attivazione e la disattivazione a runtime sono disponibili solo quando il filesystem root utilizza attualmente AUFS. Non sono disponibili su un root OverlayFS, anche se il kernel supporta AUFS. I moduli di base non possono essere disattivati tramite l'applicazione.

Le modifiche per il prossimo avvio sono disponibili solo quando MiniOS trova uno storage per moduli adatto, durevole e scrivibile. I moduli di base e quelli su storage in sola lettura o volatile non possono essere rimossi. I filtri di avvio come `load`, `noload` e `bext` determinano comunque quali moduli vengono selezionati.

## Ispezionare un modulo

Seleziona un modulo per vedere la sua origine, la dimensione compressa e il contenuto del filesystem. Se il file di origine è disponibile, **Estrai in cartella** crea una nuova directory contenente i file del modulo.

L'ispezione e l'estrazione ordinaria non richiedono privilegi amministrativi. L'estrazione non sovrascrive mai una destinazione esistente.

Puoi anche aprire un file locale `.sb` dal file manager. L'apertura di un file consente solo l'ispezione; non lo attiva né lo aggiunge al prossimo avvio.

## Creazione di un modulo

L'area di lavoro Crea utilizza un flusso **Configura**, **Verifica**, **Esegui**, e **Risultato**. Un modulo creato con successo rimane come file nella posizione di output. Non viene attivato né aggiunto automaticamente a Next Boot.

I metodi disponibili sono:

- **Pacchetti** installa pacchetti dai repository e file locali selezionati `.deb`, incluse le relative dipendenze, in un ambiente di build isolato MiniOS. L'installazione dei pacchetti richiede l'autenticazione dell'amministratore.
- **Script di installazione** esegue uno script verificato senza terminale interattivo. Una cartella seed opzionale può fornire file iniziali. Lo script viene eseguito con privilegi di amministratore ma non viene memorizzato nel modulo risultante.
- **Chroot interattivo** apre una shell root temporanea nel terminale integrato. Digita `exit` al termine, quindi crea il modulo, riapri la shell oppure annulla le modifiche. Chiudere o annullare la sessione non modifica il sistema in esecuzione.
- **Cartella** crea un pacchetto con il contenuto di una directory esistente. La directory sorgente non viene inclusa all'interno del modulo. La conversione standard delle cartelle non richiede privilegi root, non modifica la sorgente e normalizza la proprietà dei file nel modulo a root.
- **Modifiche della sessione corrente** acquisisce i file idonei e le eliminazioni dal layer scrivibile della sessione corrente. Utilizza la policy standard MiniOS `savechanges`, che esclude log, cache, dati di avvio e percorsi runtime temporanei. La lettura completa del layer scrivibile richiede l'autenticazione dell'amministratore.

Scegli un nuovo percorso di output per ogni workflow. I file esistenti non vengono mai sovrascritti. L'avanzamento e le diagnostiche di backend restano visibili durante l'operazione e la cattura della sessione corrente può essere annullata.

Modifiche della sessione corrente è pensato per una cattura standard e rapida, non per la revisione di ogni percorso incluso. Un layer scrivibile attivo può contenere dati personali o riservati. Per una policy di privacy esplicita `exact`, `clean`, o selezione dei percorsi, utilizza il workflow da riga di comando `savechanges` descritto in [Cattura le modifiche della sessione corrente](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Drag and drop

Il drag and drop serve solo per compilare un campo di input o aprire l'ispezione:

- Un modulo apre i suoi dettagli.
- I file `.deb` vengono aggiunti a Pacchetti.
- Una directory viene selezionata per Cartella.
- Un altro file regolare viene selezionato come Script di installazione.

Il trascinamento di un elemento non esegue codice né modifica In esecuzione ora o Prossimo avvio.

## Documentazione correlata

- [Creazione dei moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Caricamento moduli initrd](/reference/boot-process/Module-Loading)
- [Modalità di avvio](/using-minios/Boot-Modes)
- [Composizione di immagini ISO da riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parametri di avvio](/reference/Boot-Parameters)

## Creazione dei moduli

I moduli MiniOS sono immagini del filesystem SquashFS di sola lettura, convenzionalmente denominate con l'estensione `.sb`. All'avvio, MiniOS ordina i moduli selezionati in un filesystem root stratificato. I file in uno strato con priorità superiore possono integrare o nascondere i file degli strati inferiori. Questa pipeline live modulare è parte dell'architettura caratteristica di MiniOS, descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS) e [Modalità di avvio](/using-minios/Boot-Modes). Dopo la conversione nativa, la root stratificata `.sb` viene sostituita da un filesystem Debian classico e scrivibile. Il software di gestione dei moduli MiniOS viene rimosso poiché i flussi di lavoro dei moduli non sono più applicabili, mentre l'ambiente desktop selezionato e le normali applicazioni restano installati come pacchetti standard.

Questa guida documenta gli attuali flussi di lavoro a riga di comando degli strumenti MiniOS. Per l'applicazione grafica, consulta [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules). Per il processo completo di creazione delle immagini e l'architettura di sistema, vedi [Building MiniOS](/development/Building-MiniOS). Le liste di pacchetti utilizzate durante la creazione di MiniOS sono descritte nella [documentazione CondinAPT](/development/CondinAPT).

### Sicurezza e privilegi richiesti

Non tutte le operazioni sui moduli richiedono root:

| Operazione | Privilegio |
|---|---|
| Elenca In esecuzione ora o Prossimo avvio con `sb` | Senza root |
| Ispeziona un modulo con `sb inspect` | Senza root |
| Conversione ordinaria `dir2sb` e `sb2dir` | Senza root |
| Preserva la proprietà o consente file speciali durante la conversione | Root |
| Build con `apt2sb`, `script2sb` o `chroot2sb` | Root |
| Cattura la sessione con `savechanges` | Root |
| Attiva, disattiva, aggiungi a Prossimo avvio o rimuovi da Prossimo avvio | Root |

I builder utilizzano un'unione isolata e non installano pacchetti o modifiche di script nel root in esecuzione. La creazione inoltre non attiva il risultato né lo seleziona per il prossimo avvio.

I convertitori e builder attuali utilizzano la pubblicazione senza sovrascrittura. Un target già esistente, incluso un collegamento simbolico, non viene sovrascritto. Scegli un nuovo percorso di output o rimuovi esplicitamente il vecchio output dopo averlo revisionato.

Utilizza l'output `--help` di ciascun comando come riferimento della versione installata. Le opzioni di compressione standard del builder sono `zstd` (predefinito), `gzip`, `lzo` e `xz`; `dir2sb` supporta anche `lz4`.

### Nomi dei moduli e livelli di filtro

I nomi iniziano spesso con un numero come `06-browser.sb` perché l'ordine dei layer influisce sulla risoluzione dei conflitti. Un modulo dovrebbe contenere percorsi relativi alla root di sistema, come `usr/bin/example`, e non una directory aggiuntiva che contiene quell'albero.

Per i livelli sorgente candidati esatti, il comportamento in caso di collisione del basename, l'ordinamento numerico e le semantiche di `bext=`, `load=` e `noload=`, consulta [Caricamento moduli Initrd](/reference/boot-process/Module-Loading). In particolare, usa un basename univoco a meno che il modulo non sia destinato a sostituire lo slot omonimo da un livello sorgente precedente.

L'opzione `--level LEVEL` su `apt2sb`, `script2sb` e `chroot2sb` limita i layer di base utilizzati per costruire l'unione di build. Con `--level 3`, vengono usati i layer numerati fino a `03` e quelli con numerazione superiore vengono filtrati. Questo può rendere un modulo meno dipendente dai layer opzionali superiori, al costo di includere più dipendenze nel risultato.

### Crea un modulo da pacchetti

`apt2sb` installa pacchetti dai repository o file locali `.deb` leggibili in un'unione di build privata e cattura il risultato. Richiede una sessione live MiniOS supportata e privilegi root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Senza `--name`, il nome di output viene derivato dal primo pacchetto. Opzioni APT utili includono `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` e `--target-release RELEASE`. L'opzione target-release si applica solo a `install`.

Per catturare gli aggiornamenti dei pacchetti già installati:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Crea un modulo da uno script

`script2sb` copia uno script di installazione in una chroot privata, lo rende eseguibile, lo esegue come root senza terminale interattivo, lo rimuove e acquisisce le modifiche risultanti al filesystem. Se lo script fallisce, non viene creato alcun modulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

L'opzione `--directory DIR` copia tutti i contenuti della sorgente, inclusi i file nascosti, nella root del modulo prima dell'esecuzione dello script. Organizza la directory seed come un albero del filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Controlla lo script prima di eseguirlo. Viene eseguito con privilegi di amministratore e può lanciare comandi arbitrari. Usa `chroot2sb` invece se l'installazione richiede prompt o interventi manuali.

### Crea un modulo in modo interattivo

`chroot2sb` crea una build union privata e apre una shell root al suo interno. Installa pacchetti o modifica file, quindi esci dalla shell per acquisire le modifiche:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

I comandi inseriti nella shell non vengono rieseguiti al caricamento del modulo; il modulo è uno snapshot dello stato risultante del filesystem. La cronologia della shell viene rimossa dal risultato. Se non viene fornito un nome, quello generato utilizza data e ora correnti.

Il ciclo di vita suddiviso `prepare`, `shell`, `finish` e `cancel` esiste per le interfacce grafiche protette. Per l'uso normale da terminale, utilizza il comando interattivo singolo mostrato sopra.

### Crea un modulo da una directory

`dir2sb` impacchetta i contenuti di una directory preparata in un nuovo modulo. Sono richiesti entrambi gli argomenti:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversione ordinaria non richiede root. La sorgente rimane invariata, la proprietà all'interno del modulo viene normalizzata a root, i device node, socket e FIFO vengono rifiutati e il target non viene mai sovrascritto. Usa `--keep-ownership` o `--allow-special` solo quando sono necessarie queste semantiche privilegiate.

### Acquisisci le modifiche della sessione corrente

`savechanges` legge il layer scrivibile autorevole di una sessione MiniOS in esecuzione. Richiede i privilegi di root perché quel layer può contenere file accessibili solo da root. La posizione predefinita delle modifiche viene rilevata automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Senza `--profile`, la policy storica MiniOS esclude directory vuote, cache, log, dati di avvio, percorsi runtime, pseudo-filesystem e file di sessione e di sistema selezionati. Questo è comodo per la creazione tradizionale di moduli, ma non rappresenta una garanzia esplicita di privacy.

I profili espliciti sono:

- `exact` conserva le modifiche rappresentabili, inclusi dati utente, log, cache, file di identità, credenziali e metadati di eliminazione supportati. Rifiuta oggetti filesystem non supportati invece di perderli silenziosamente.
- `clean` utilizza una allowlist di percorsi strettamente orientata al software. Esclude dati home e root, log, cache, identità, configurazione di rete, credenziali, configurazione di sistema arbitraria e `/usr/local`. Riduce l'esposizione della privacy ma non può garantire che un file software consentito non contenga segreti.
- `selected` include solo percorsi relativi verificati da un file di inventario e selezione. Le esclusioni esplicite hanno la precedenza. Questo è il profilo appropriato quando il modulo deve contenere solo un sottoinsieme controllato delle modifiche di sessione.

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

I percorsi sono normalizzati, non vuoti e relativi alla root delle modifiche. Genera e verifica prima l'inventario; ogni inclusione deve corrispondere ai dati dell'inventario. L'inventario registra metadati come percorso, tipo, categoria, sensibilità e dimensione, ma non legge né emette contenuti dei file, destinazioni di link simbolici o valori segreti. Gli output e gli inventari dei profili espliciti sono in modalità `0600`; i moduli con policy legacy sono in modalità `0644`.

L'acquisizione della sessione può mantenere le eliminazioni di file supportate e l'opacità delle directory per il backend attivo AUFS o OverlayFS. Sono esclusi i mount runtime, filesystem annidati, bookkeeping delle union e l'output stesso. Un target esistente non viene mai sostituito.

### Ispeziona ed estrai moduli

Ispeziona un modulo senza montarlo né estrarlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L'ispezione non richiede root e funziona anche al di fuori di una sessione MiniOS in esecuzione.

Estrai un modulo in una nuova directory:

```bash
sb2dir 06-example.sb example-root
```

L'estrazione ordinaria non richiede root e non modifica la sorgente. La directory di destinazione non deve esistere. I file speciali vengono rifiutati a meno che `--allow-special` sia richiesto con privilegi sufficienti.

Le directory prodotte dagli attuali `sb2dir` sono directory ordinarie. `rmsbdir`, `sb rm` e `sb rmdir` sono comandi di compatibilità ritirati che rifiutano sempre la rimozione; non smontano né eliminano ricorsivamente nulla. Controlla un percorso estratto e i suoi contenuti prima di rimuoverlo con i normali strumenti del filesystem.

### Gestione dei moduli attivi e di quelli per il prossimo avvio

Le composizioni Attivo ora e Prossimo avvio sono indipendenti. Vedi [costruzione delle unioni e attivazione a runtime](/reference/boot-process/Module-Loading#union-construction) per il confine tra avvio e runtime e per capire perché le due liste possono differire.

Elenca i moduli che compongono effettivamente la root AUFS o OverlayFS corrente, dal livello più basso a quello più alto:

```bash
sb list
sb list --json
```

Elenca i moduli selezionati dalle regole di avvio correnti:

```bash
sb next-boot
sb next-boot --json
```

Queste interrogazioni non richiedono privilegi root. Le regole canoniche [di livello candidato e di sostituzione](/reference/boot-process/Module-Loading#candidate-tiers) determinano quale sorgente fornisce ogni basename per il Prossimo avvio.

Per rendere disponibile un modulo utente al prossimo avvio:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilizza uno storage scrivibile durevole idoneo, prepara e valida la copia, e la pubblica in modo atomico senza sostituire un modulo esistente. Il nome file deve rispettare i filtri di avvio attuali. Rimuovi un modulo utente selezionato usando il suo basename esatto:

```bash
sudo sb next-boot remove 50-extra.sb
```

La rimozione viene rifiutata per i moduli base e per quelli su sorgenti di sola lettura o volatili.

L'attivazione a runtime è un'operazione separata e valida solo per la sessione corrente:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Attivazione e disattivazione funzionano solo quando `/` è attualmente una unione AUFS. Non sono disponibili su OverlayFS e il solo supporto AUFS del kernel non è sufficiente. Nessun comando modifica il Prossimo avvio.

Il dispatcher di conversione compatibilità richiede entrambi gli operandi:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L'uso diretto di `dir2sb` e `sb2dir` è preferibile perché la conversione standard può essere eseguita senza privilegi root.

### Documentazione correlata

- [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules)
- [Caricamento moduli initrd](/reference/boot-process/Module-Loading)
- [Modalità di avvio](/using-minios/Boot-Modes)
- [Ricostruzione delle immagini ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Compilazione MiniOS](/development/Building-MiniOS)
- [Parametri di avvio](/reference/Boot-Parameters)
