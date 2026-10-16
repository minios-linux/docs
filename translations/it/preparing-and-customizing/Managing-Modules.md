---
updated: 2026-10-15
program_commits:
    minios-module-manager: 356c7582cf81884d606da388c93c674bf32049ba
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Gestione dei moduli

Il Gestore moduli MiniOS è l'applicazione grafica per esaminare, creare e gestire MiniOS `.sb` moduli. Offre due aree di lavoro: **Moduli** per la composizione del sistema e **Crea** per creare nuovi moduli.

Avvialo dal menu delle applicazioni oppure esegui:

```bash
minios-module-manager
```

L'applicazione viene eseguita con il tuo account utente desktop. Richiede l'autenticazione di un amministratore solo quando un'operazione la rende necessaria.

## In esecuzione ora e al prossimo avvio

L'area di lavoro Moduli offre due viste separate:

- **In esecuzione ora** è l'insieme ordinato di moduli che compone attualmente il sistema in esecuzione.
- **Al prossimo avvio** è l'insieme ordinato selezionato dalle regole di avvio MiniOS.

La modifica di una vista non modifica automaticamente l'altra. Ad esempio, **Attiva per questa sessione** influisce solo sul sistema in esecuzione, mentre **Aggiungi al prossimo avvio** copia un modulo nell'archivio permanente dei moduli senza attivarlo subito.

Per consultare le regole definitive applicate all'avvio, incluse le priorità delle fonti candidate, la sostituzione in base al nome esatto del file, l'ordinamento numerico e `load=`, `noload=`, e `bext=` dei filtri, consulta [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading). La guida spiega anche perché le viste In esecuzione ora e Al prossimo avvio possono differire.

L'attivazione e la disattivazione durante l'esecuzione sono disponibili solo se il filesystem radice utilizza attualmente AUFS. Non sono disponibili su un filesystem radice OverlayFS, anche se il kernel supporta AUFS. Non è possibile disattivare i moduli di base dall'applicazione.

Le modifiche per il prossimo avvio richiedono un archivio dei moduli permanente e scrivibile. La disattivazione di un modulo utente lo sposta nell'archivio adiacente `modules-disabled/` invece di eliminarlo; è possibile ripristinarlo in seguito. L'eliminazione definitiva è un'azione separata, disponibile per i moduli disattivati. Non è possibile disattivare i moduli di base né quelli archiviati su supporti di sola lettura o volatili. I filtri di avvio, come `load`, `noload`, e `bext` continuano a determinare quali moduli vengono selezionati.

## Esaminare un modulo

Seleziona un modulo per visualizzare il percorso del file di origine, le dimensioni compresse e i contenuti del file system. Se il file di origine è disponibile, **Estrai in una cartella** crea una nuova directory contenente i file del modulo.

Per esaminare un modulo non sono necessari i privilegi di amministratore. **Estrai in una cartella** richiede l'autenticazione di amministratore per mantenere proprietari, autorizzazioni e file speciali. L'estrazione non sovrascrive mai una destinazione esistente né modifica il modulo di origine.

Puoi anche aprire un file `.sb`locale dal file manager. L'apertura di un file consente solo di esaminarlo: non lo attiva né lo aggiunge ad Avvio successivo. Nei sistemi Xfce con l'integrazione di Thunar MiniOS installata, le azioni del file manager usano lo stesso backend dei moduli per l'attivazione e la disattivazione esplicite; non aggirano la distinzione tra In esecuzione e Avvio successivo.

## Creazione di un modulo

L’area di lavoro Crea segue un flusso di **Configurazione**, **Revisione**, **Esecuzione**, e **Risultato**. Un modulo creato correttamente rimane un file nella posizione di output. Non viene attivato né aggiunto automaticamente a Next Boot.

I metodi disponibili sono:

- **Pacchetti** installa pacchetti dai repository e file locali selezionati, inclusi i relativi `.deb` file, con le relative dipendenze, in un ambiente di compilazione isolato MiniOS. L’installazione dei pacchetti richiede l’autenticazione di un amministratore.
- **Script di installazione** esegue uno script revisionato senza un terminale interattivo. È possibile specificare una cartella seed facoltativa con i file iniziali. Lo script viene eseguito con privilegi di amministratore, ma non viene salvato nel modulo risultante.
- **Chroot interattiva** apre una shell root temporanea nel terminale integrato. Al termine, digita `exit` e poi crea il modulo, riapri la shell o annulla le modifiche. La chiusura o l’annullamento della sessione non modifica il sistema in esecuzione.
- **Cartella** crea un pacchetto con i contenuti di una directory esistente. La directory sorgente non viene inserita come sottocartella nel modulo. Il flusso di lavoro grafico richiede l’autenticazione di un amministratore per leggere i file protetti e mantenere gli attributi del file system; la cartella sorgente non viene modificata. Le cartelle estratte mantenendo la proprietà vengono riconosciute automaticamente e conservano i proprietari originali. Per una cartella estratta in precedenza senza un record di origine, seleziona **Mantieni la proprietà della sorgente** se è necessario conservare i proprietari.
- **Modifiche della sessione corrente** acquisisce i file idonei e le eliminazioni dal livello scrivibile della sessione corrente. Applica la policy standard MiniOS `savechanges` che esclude log, cache, dati di avvio e percorsi temporanei di runtime. Per leggere l’intero livello scrivibile è necessaria l’autenticazione di un amministratore.

Scegli un nuovo percorso di output per ogni flusso di lavoro. I file esistenti non vengono mai sovrascritti. Durante l’esecuzione di un’operazione, l’avanzamento e i dettagli diagnostici del backend restano visibili; l’acquisizione della sessione corrente può essere annullata.

Per le altre cartelle, il flusso di lavoro predefinito Cartella converte in root gli ID utente e di gruppo ordinari (1000–60000), tranne che in `/home` e `/opt`, mantiene gli ID di sistema e assegna la proprietà root alle directory standard di primo livello. Questa opzione non può recuperare la proprietà persa durante una precedente estrazione senza privilegi.

La funzione Modifiche della sessione corrente è pensata per un’acquisizione standard e pratica, non per esaminare ogni percorso incluso. Un livello scrivibile attivo può contenere dati personali o riservati. Per policy di privacy esplicite relative a `exact`, `clean`, o basate sulla selezione dei percorsi, usa il flusso di lavoro da riga di comando `savechanges` descritto in [Acquisire le modifiche della sessione corrente](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Trascina e rilascia

Trascinare e rilasciare serve solo a compilare un campo o ad aprire l'ispezione:

- Si aprono i dettagli di un modulo.
- `.deb` i file vengono aggiunti ai pacchetti.
- Una directory viene selezionata per Cartella.
- Un altro file normale viene selezionato come Script di installazione.

Rilasciare un elemento non esegue codice né modifica In esecuzione o Prossimo avvio.

## Documentazione correlata

- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Caricamento dei moduli Initrd](/reference/boot-process/Module-Loading)
- [Modalità di avvio](/using-minios/Boot-Modes)
- [Creazione di immagini ISO dalla riga di comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parametri di avvio](/reference/Boot-Parameters)

<a id="creating-modules"></a>

## Creazione dei moduli

MiniOS moduli sono immagini di filesystem SquashFS in sola lettura, che per convenzione hanno estensione`.sb`. All'avvio, MiniOS dispone i moduli selezionati in un filesystem root a livelli. I file nei livelli con priorità maggiore possono aggiungere o nascondere file dei livelli inferiori. Questa pipeline modulare live è una caratteristica distintiva dell'architettura MiniOS descritta in [Informazioni su MiniOS](/getting-started/About-MiniOS) e [Modalità di avvio](/using-minios/Boot-Modes). Dopo la conversione nativa, il filesystem root a livelli `.sb` viene sostituito da un filesystem Debian convenzionale e scrivibile. Il software di gestione dei moduli MiniOS viene rimosso perché i flussi di lavoro basati sui moduli non sono più applicabili, mentre l'ambiente desktop selezionato e le applicazioni comuni restano installati come normali pacchetti.

Questa guida documenta i flussi di lavoro attuali da riga di comando di MiniOS Tools. Per l'applicazione grafica, consulta [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules)Per la procedura completa di creazione dell'immagine e l'architettura del sistema, consulta [Creazione di MiniOS](/development/Building-MiniOS). Gli elenchi dei pacchetti utilizzati durante la creazione di MiniOS sono descritti nella [documentazione di CondinAPT](/development/CondinAPT).

### Limiti di sicurezza e privilegi

Non tutte le operazioni sui moduli richiedono i privilegi di root:

| Operazione | Privilegio |
|---|---|
| Elencare quelli in esecuzione o previsti al prossimo avvio con `sb` | Senza privilegi di root |
| Esaminare un modulo con `sb inspect` | Senza privilegi di root |
| Riga di comando ordinaria `dir2sb` e `sb2dir` conversione | Senza privilegi di root |
| Mantenere la proprietà o consentire file speciali durante la conversione | Root |
| Creare con `apt2sb`, `script2sb`, oppure `chroot2sb` | Root |
| Acquisire la sessione con `savechanges` | Root |
| Attivare, disattivare, aggiungere al prossimo avvio o rimuovere dal prossimo avvio | Root |

I builder utilizzano un'unione isolata e non installano pacchetti né modifiche agli script nel sistema root in esecuzione. La creazione non attiva il risultato né lo seleziona per il prossimo avvio.

Le procedure grafiche Cartella ed Estrai in una cartella richiedono l'autenticazione come amministratore per gestire i file protetti e preservare gli attributi del file system.

I convertitori e i builder attuali pubblicano i file senza sostituire quelli esistenti. Una destinazione già esistente, incluso un collegamento simbolico, non viene sovrascritta. Scegli un nuovo percorso di output oppure controlla e rimuovi esplicitamente il vecchio output.

Usa l'output del comando `--help` come riferimento per la versione installata. Le procedure attuali `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb` e `savechanges` accettano `zstd` (l'impostazione predefinita), `gzip`, `lzo`, `lz4` e `xz`. Il compressore selezionato deve essere disponibile nel sistema in esecuzione.

### Nomi dei moduli e livelli di filtro

I nomi iniziano spesso con un numero, ad esempio `06-browser.sb` perché l'ordine dei livelli influisce sulla risoluzione dei conflitti. Un modulo dovrebbe contenere percorsi relativi alla radice del sistema, ad esempio `usr/bin/example`, non una directory aggiuntiva che contiene quell'albero.

Per conoscere i livelli esatti delle sorgenti candidate, il comportamento in caso di collisione dei nomi di base, l'ordinamento numerico e le semantiche di `bext=`, `load=`, e `noload=` consulta [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading). In particolare, usa un nome di base univoco, a meno che il modulo non debba sostituire lo slot omonimo di un livello di sorgente precedente.

L'opzione `--level LEVEL` di `apt2sb`, `script2sb` e `chroot2sb` limita i livelli di base usati per creare l'unione di build. Con `--level 3` vengono usati i livelli numerati fino a `03` e vengono esclusi i livelli con numeri superiori. In questo modo il modulo può dipendere meno dai livelli superiori facoltativi, a scapito di includere più dipendenze nel risultato.

<a id="create-a-module-from-packages"></a>

### Crea un modulo dai pacchetti

`apt2sb` installa i pacchetti dei repository o i file locali leggibili `.deb` in un’unione di build privata e acquisisce il risultato. Richiede una sessione live MiniOS supportata e i privilegi di root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Senza `--name`, il nome dell’output deriva dal primo pacchetto. Tra le opzioni APT utili ci sono `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, e `--target-release RELEASE`. L’opzione per la release di destinazione si applica solo a `install`.

Per acquisire gli aggiornamenti dei pacchetti già installati:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

<a id="create-a-module-from-a-script"></a>

### Creare un modulo da uno script

`script2sb` copia uno script di installazione in un chroot privato, lo rende eseguibile, lo esegue come root senza un terminale interattivo, lo rimuove e acquisisce le modifiche risultanti al filesystem. Se lo script non viene eseguito correttamente, non viene creato alcun modulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

La `--directory DIR` opzionale copia tutti i contenuti sorgente, inclusi i file nascosti, nella radice del modulo prima di eseguire lo script. Organizza la directory seed come un albero del filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Esamina lo script prima di eseguirlo. Viene eseguito con privilegi di amministratore e può eseguire comandi arbitrari. Usa `chroot2sb` al suo posto se l’installazione richiede prompt o interventi manuali.

<a id="create-a-module-interactively"></a>

### Crea un modulo in modalità interattiva

`chroot2sb` crea una build union privata e apre una shell root al suo interno. Installa i pacchetti o modifica i file, quindi esci dalla shell per acquisire le modifiche:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

I comandi inseriti nella shell non vengono ripetuti al caricamento del modulo: il modulo è un'istantanea dello stato risultante del filesystem. La cronologia della shell viene rimossa dal risultato. Se non viene specificato un nome, ne viene generato uno usando la data e l'ora correnti.

La suddivisione in `prepare`, `shell`, `finish`, e `cancel` esiste per i frontend grafici protetti. Per il normale uso da terminale, usa l'unico comando interattivo mostrato sopra.

<a id="create-a-module-from-a-directory"></a>

### Creare un modulo da una directory

`dir2sb`crea un nuovo modulo con il contenuto di una directory preparata. Entrambi gli operandi sono obbligatori:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversione standard non richiede privilegi root. Lascia invariata la sorgente, converte gli ID utente e gruppo ordinari (1000–60000) in root all'esterno di `/home` e `/opt`, mantiene gli ID di sistema e assegna la proprietà root alle directory standard di primo livello. Rifiuta i nodi dispositivo, i socket e le FIFO e non sovrascrive mai la destinazione. `--keep-ownership` mantiene tutti i proprietari della sorgente e `--allow-special` consente i file speciali; entrambe richiedono privilegi root.

`sb2dir`scrive `.minios-module-origin.json` nella directory estratta. Se l'estrazione ha preservato la proprietà, `dir2sb`riconosce questo record e, durante la creazione del nuovo modulo, preserva automaticamente i proprietari e i file speciali; il record stesso non viene incluso nel nuovo modulo. Una directory estratta senza preservare la proprietà non può essere riutilizzata per creare un modulo, perché i proprietari originali non sono più noti. Estrai di nuovo il modulo originale usando le opzioni con privilegi.

<a id="capture-current-session-changes"></a>

### Acquisisci le modifiche della sessione corrente

`savechanges` legge il livello scrivibile autorevole di una sessione MiniOS in esecuzione. Richiede i privilegi di root, perché il livello può contenere file accessibili solo a root. La posizione predefinita delle modifiche viene rilevata automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Senza `--profile`, la policy MiniOS storica omette directory vuote, cache, log, dati di avvio, percorsi di runtime, pseudo-filesystem e determinati file di sistema e della sessione. È una soluzione pratica per la creazione tradizionale di moduli, ma non garantisce esplicitamente la privacy.

I profili espliciti sono:

- `exact` conserva tutte le modifiche rappresentabili, inclusi dati utente, log, cache, file di identità, credenziali e metadati di eliminazione supportati. Rifiuta gli oggetti del filesystem non supportati, invece di scartarli senza avviso.
- `clean` applica una lista di percorsi consentiti ristretta e orientata al software. Esclude i dati nelle directory home e root, log, cache, identità, configurazione di rete, credenziali, configurazioni di sistema arbitrarie e `/usr/local`. Riduce l'esposizione dei dati personali, ma non può garantire che un file software consentito non contenga segreti.
- `selected` include solo percorsi relativi verificati, selezionati da un inventario e da un file di selezione. Le esclusioni esplicite hanno la precedenza. È il profilo adatto quando il modulo deve contenere un sottoinsieme controllato delle modifiche della sessione.

Esempi:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un file di selezione deve rispettare questa struttura JSON rigorosa:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

I percorsi sono normalizzati, non vuoti e relativi alla radice delle modifiche. Genera e verifica prima l'inventario; ogni elemento incluso deve corrispondere ai dati dell'inventario. I record dell'inventario contengono metadati quali percorso, tipo, categoria, sensibilità e dimensione, ma non leggono né emettono contenuti dei file, destinazioni dei collegamenti simbolici o valori segreti. I file di output e gli inventari dei profili espliciti hanno permessi `0600`; i moduli con policy legacy hanno permessi `0644`.

L'acquisizione della sessione può mantenere le eliminazioni di file supportate e l'opacità delle directory per il backend AUFS o OverlayFS attivo. Esclude i mount di runtime, i filesystem annidati, i metadati interni del filesystem union e il file di output. Un file di destinazione esistente non viene mai sostituito.

<a id="inspect-and-extract-modules"></a>

### Ispezionare ed estrarre moduli

Ispeziona un modulo senza montarlo né estrarlo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L'ispezione non richiede privilegi di root e funziona anche al di fuori di una sessione MiniOS.

Estrai un modulo in una nuova directory:

```bash
sb2dir 06-example.sb example-root
```

La normale estrazione non richiede privilegi di root e non modifica la sorgente. La directory di destinazione non deve esistere. I file speciali vengono rifiutati, a meno che non venga richiesto `--allow-special` con privilegi sufficienti.

Per ottenere una directory che possa essere riconfezionata fedelmente, esegui l'estrazione con privilegi di amministratore e conserva la proprietà e i file speciali:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

L'estrazione registra l'origine del modulo in `.minios-module-origin.json` all'interno della nuova directory. L'estrazione senza privilegi di root registra che la proprietà non è stata conservata; una directory di questo tipo non può essere passata di nuovo a `dir2sb`. Conserva il record di origine in caso di estrazione con privilegi, fino al riconfezionamento.

Le directory create dalle versioni attuali di `sb2dir` sono directory normali. `rmsbdir`, `sb rm` e `sb rmdir` sono comandi di compatibilità obsoleti che rifiutano sempre la rimozione; non smontano né eliminano ricorsivamente alcunché. Esamina il percorso estratto e il suo contenuto prima di rimuoverlo con i normali strumenti del file system.

<a id="manage-running-and-next-boot-modules"></a>

### Gestire i moduli in esecuzione e al prossimo avvio

In esecuzione e Prossimo avvio sono composizioni indipendenti. Per maggiori informazioni, consulta [la creazione delle union e l’attivazione in fase di esecuzione](/reference/boot-process/Module-Loading#union-construction) per capire la distinzione tra avvio e runtime e perché i due elenchi possono differire.

Elenca i moduli che compongono effettivamente la radice AUFS o OverlayFS corrente, dal livello di priorità più basso a quello più alto:

```bash
sb list
sb list --json
```

Elenca i moduli selezionati dalle regole di avvio correnti:

```bash
sb next-boot
sb next-boot --json
```

Queste query non richiedono una radice. Le regole canoniche di [livello dei candidati e sostituzione](/reference/boot-process/Module-Loading#candidate-tiers) determinano quale origine fornisce ciascun nome base di Prossimo avvio.

Per rendere disponibile un modulo utente al prossimo avvio:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS usa uno spazio di archiviazione scrivibile e persistente adeguato, prepara e convalida la copia e la pubblica in modo atomico senza sostituire un modulo esistente. Il nome del file deve soddisfare i filtri di avvio correnti. Disattiva un modulo utente selezionato specificandone il nome base esatto:

```bash
sudo sb next-boot disable 50-extra.sb
```

La disattivazione conserva il file in `modules-disabled/`. Il precedente comando `next-boot remove` è un alias di disattivazione, non comporta l’eliminazione permanente. Per ripristinare il modulo o eliminarlo definitivamente, usa:

```bash
sudo sb next-boot enable 50-extra.sb
# To delete it permanently, disable it first:
sudo sb next-boot disable 50-extra.sb
sudo sb next-boot delete 50-extra.sb
```

I moduli di base e quelli archiviati su origini di sola lettura o volatili non possono essere disattivati. L’eliminazione permanente non è consentita neanche per un modulo attivo. Prima di eliminare il file conservato, controlla `sb next-boot` e il relativo elenco dei moduli disattivati.

L’attivazione in fase di esecuzione è un’operazione distinta, valida solo per la sessione corrente:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

L’attivazione e la disattivazione sono possibili solo quando `/` è attualmente una union AUFS. Non sono disponibili su OverlayFS; il solo supporto del kernel per AUFS non è sufficiente. Nessuno dei due comandi modifica Prossimo avvio.

Il dispatcher di conversione per compatibilità richiede entrambi gli operandi:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

È preferibile usare `dir2sb` e `sb2dir` direttamente, perché la conversione normale può essere eseguita senza una radice.

### Documentazione correlata

- [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules)
- [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading)
- [Modalità di avvio](/using-minios/Boot-Modes)
- [Ricreare le immagini ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Creazione di MiniOS](/development/Building-MiniOS)
- [Parametri di avvio](/reference/Boot-Parameters)
