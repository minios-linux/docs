---
updated: 2026-10-15
program_commits:
    minios-session-manager: 120fdba6a6fe1838f1aaa3c153aafc080829798d
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Sessioni e persistenza

Le sessioni MiniOS mantengono le modifiche apportate al sistema attivo anche dopo il riavvio. Ogni sessione è una directory numerata in `minios/changes/`; i moduli MiniOS di sola lettura restano invariati e la sessione selezionata fornisce il livello scrivibile del filesystem union.

Usa il Gestore sessioni MiniOS da un sistema MiniOS in esecuzione:

```bash
minios-session-manager
```

Lo strumento equivalente da riga di comando è `minios-session`. Tutti i comandi, tranne help, richiedono privilegi amministrativi; esegui gli esempi con `sudo`.

I flussi di lavoro con sessioni numerate non sono disponibili quando è selezionata un'immagine **Ventoy Persistence Plugin**. Questa immagine fornisce un unico ambiente persistente selezionato in Ventoy, senza metadati di sessione MiniOS. I normali avvii Ventoy senza un backend plugin selezionato mantengono le sessioni MiniOS; vedi [Ventoy](/installing-minios/installation-tools/Ventoy).

## Modalità sessione

| Modalità | Archiviazione | Vincoli principali | Livello LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | Modifiche salvate direttamente nella directory della sessione | Richiede un filesystem scrivibile che conservi i metadati Linux e le operazioni verificate da MiniOS. La capacità dipende dallo spazio libero del supporto sottostante; `perchsize` non è applicabile. | No |
| `dynfilefs` | ext4 espandibile `virtual.dat` basato su file di segmento format-400 | Funziona su filesystem POSIX, FAT32, NTFS ed exFAT scrivibili. Il payload è thin, ma l'indice di mappatura cresce in base alla capacità logica dichiarata. | Sì |
| `dynblk` | Filesystem ext4 thin su un dispositivo a blocchi del kernel basato su file `volumeNNN.db` | Richiede la CLI DynBlk, il modulo del kernel e il supporto initrd. Per impostazione predefinita, la dimensione creata all'avvio arriva fino a 16 GiB; il limite massimo è indicato da `dynblk limits`. Le mappature residenti su disco usano una cache di metadati con limite definito. | Sì |
| `vmdk` | Filesystem ext4 thin su un VMDK sparse suddiviso standard, esposto dal driver DynBlk | Usa `volume.vmdk` e `volume-sNNN.vmdk`. Nessuna compressione. Richiede `vmdk-session-v1` nell'indicatore di funzionalità initrd in esecuzione. Stessa dimensione predefinita manuale di 16 GiB di DynBlk; per i limiti, esegui `dynblk limits --format vmdk`. | Sì |
| `raw` | Un singolo file `changes.img` contenente ext4 | Capacità logica fissa, con possibilità di aumento esplicito. Funziona su filesystem POSIX, FAT32, NTFS ed exFAT scrivibili; FAT32 è limitato a 4000 MiB. | Sì |
| `squashfs` | Snapshot compresso in `changes.sb`; il livello superiore scrivibile in runtime viene ricostruito in RAM | `perchsize` non è applicabile. Gli snapshot esistenti possono essere ripristinati da supporti scrivibili supportati; per il salvataggio esatto serve un archivio di persistenza POSIX adatto. | No |

Raw, DynFileFS, DynBlk e VMDK possono includere facoltativamente un livello di cifratura LUKS2. Il backend di archiviazione resta la modalità della sessione e i metadati della sessione registrano separatamente la cifratura. DynFileFS e raw creati con `minios-session` hanno una dimensione predefinita di 4000 MiB; DynBlk e VMDK hanno una dimensione predefinita di 16 GiB. Le dimensioni vengono allocate in MiB; `GB` e `TB` i suffissi corrispondono rispettivamente a 1000 e 1.000.000 MiB. I file raw sono limitati a 4000 MiB su FAT32, con o senza cifratura. I dati payload di DynFileFS crescono su richiesta, ma l'indice format-400 viene dimensionato in base all'intera capacità logica e occupa circa 2 MiB di RAM più circa 2 MiB di spazio sul supporto per GiB. DynBlk mantiene le tabelle di mappatura su disco e una cache di metadati con limite definito in RAM, con valore predefinito di 1 MiB anziché una percentuale di RAM. I vettori extent/file e le directory crescono con il numero di parti dichiarate, mentre il riempimento del payload non richiede una mappa interamente residente. Per conoscere il limite di capacità installato, esegui `dynblk limits --format dynblk`. Le scritture effettive restano limitate dallo spazio libero del filesystem sottostante e dall'ammissione delle risorse del backend. Le operazioni di ridimensionamento del container possono solo aumentare le dimensioni di una sessione; non è possibile ridurle.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Usa DynFileFS quando il filesystem di persistenza non è in grado di rappresentare i metadati Linux.
Usa DynBlk quando vuoi un vero dispositivo a blocchi del kernel con file di supporto thin; il driver può mantenere collegati contemporaneamente diversi volumi DynBlk indipendenti e Gestore sessioni usa il percorso del dispositivo restituito dal driver, senza presupporre che `/dev/dynblk0` sia libero. DynBlk e VMDK non sono disponibili quando UEFI Secure Boot è abilitato, perché MiniOS non firma il modulo del kernel DynBlk esterno. Di conseguenza, Installer e Gestore sessioni nascondono queste modalità e rifiutano le richieste esplicite di creazione prima di tentare di caricare il modulo.
Usa raw quando è necessaria un'allocazione fissa, aggiungi LUKS2 se la sessione deve essere cifrata e usa SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per esaminare il filesystem di persistenza effettivo e le modalità disponibili:

```bash
sudo minios-session info
sudo minios-session status
```

Non è possibile creare sessioni su supporti di sola lettura. L'initrd può leggere e attivare uno snapshot SquashFS esistente, memorizzato su FAT, exFAT o NTFS scrivibili, perché estrae lo snapshot in un livello superiore ext4 temporaneo. La creazione o il salvataggio esatto di uno snapshot è un caso diverso: l'archivio di persistenza deve supportare i metadati POSIX richiesti e la pubblicazione privata e durevole. L'albero di lavoro per l'acquisizione esatta usa RAM attendibili, se disponibili, e ricorre a uno spazio di lavoro su disco se RAM non è sufficiente.

## Selezione all'avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono le voci riprendi, nuova, selezione e non persistente. La descrizione canonica della semantica di selezione, compatibilità, fallback e attivazione è disponibile in [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Usa il percorso legacy di ripristino con best effort. Tenta di usare il valore predefinito dei metadati, ma non ne crea uno sostitutivo se nessuno è utilizzabile. |
| `perchdir=resume` | Riprende la sessione predefinita indicata nei metadati e, se assente o incompatibile, consente all'initrd di crearne una sostitutiva compatibile. Questo è il comportamento attuale della voce di ripristino nel menu di avvio. |
| `perchdir=setup` | Apre il selettore interattivo del backend di persistenza, quindi crea una nuova sessione numerata. Questo è il comportamento attuale di **Avviare una nuova sessione**. |
| `perchdir=new` | Crea direttamente una nuova sessione numerata usando le impostazioni di backend, cifratura, compressione e dimensione richieste o predefinite, senza aprire il selettore del backend. |
| `perchdir=ask` | Seleziona una sessione esistente; se l'archivio è vuoto, avvia automaticamente lo stesso flusso di configurazione usato da `perchdir=setup`. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Usa una posizione di persistenza su un dispositivo, incluse le forme `/dev/...` e `label:...` gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw` oppure `squashfs`. |
| `perchencrypt=luks` | Cifra con LUKS2 una nuova sessione Raw, DynFileFS, DynBlk o VMDK. Per le sessioni esistenti, la cifratura è determinata solo dai metadati. |
| `perchcomp=<codec>` | Seleziona la compressione del backend DynBlk per una nuova sessione DynBlk. La compressione è forzata a `none` quando DynBlk è protetto da LUKS2. |
| `perchsize=<size>` | Imposta una dimensione nuova o maggiore per il container; i valori semplici vengono allocati in MiB e sono accettati i suffissi `MB`, `GB`, e `TB`. |

Se non viene specificata una modalità per una nuova sessione, all'avvio viene usata la modalità nativa. Su FAT32/NTFS/exFAT, o se i controlli del filesystem nativo non vanno a buon fine, all'avvio viene preferito DynBlk se il relativo helper è disponibile e Secure Boot lo consente; altrimenti si passa a DynFileFS. Un errore di attivazione non converte automaticamente una sessione esistente. La dimensione predefinita di un nuovo container raw è 4000 MiB. Le nuove sessioni di avvio DynFileFS, DynBlk e VMDK senza `perchsize` usano fino a 16 GiB; se lo spazio di supporto disponibile dopo la riserva di sicurezza è inferiore, la dimensione automatica viene ridotta. DynFileFS tiene conto anche del sovraccarico dell'indice e del limite RAM. L'aumento esplicito di DynBlk segue il limite del backend installato, consultabile con `dynblk limits --format dynblk`. Con Secure Boot, initrd non offre DynBlk/VMDK e considera non disponibile una sessione DynBlk/VMDK esplicita o ripresa, anziché tentare di caricare il modulo non firmato.
Le sessioni SquashFS possono essere acquisite dal sistema in esecuzione con il Gestore sessioni MiniOS o `minios-session create squashfs`. La configurazione initrd crea solo metadati della sessione di generazione zero e mantiene il livello superiore scrivibile in RAM. Il sistema in esecuzione crea il primo `changes.sb` snapshot su richiesta o all'arresto.

Durante il ripristino, MiniOS controlla la versione, l'edizione, il filesystem union e la modalità registrati. Il valore letterale `perchdir=resume` può creare una nuova sessione anziché usare una sessione predefinita assente o incompatibile. Il valore semplice `perch`, la selezione numerica diretta e le altre richieste legacy di ripristino non creano automaticamente tale sostituzione.
La selezione interattiva mostra un avviso prima di consentire l'uso di una sessione incompatibile. Se la selezione o l'attivazione non riesce comunque, l'avvio prosegue normalmente con un livello superiore RAM e un avviso sulla persistenza.

L'archivio delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefinito e in esecuzione, nonché modalità, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità per ogni sessione.
Sono metadati persistenti salvati dall'implementazione di avvio, ma non costituiscono di per sé una prova dello stato runtime corrente. Non modificarli né spostare i dati delle sessioni numerate mentre una sessione è montata; usa il Gestore sessioni MiniOS o `minios-session`.

## Sessioni attive e in esecuzione

Questi termini descrivono stati diversi:

- La sessione **attiva** è quella selezionata come predefinita per il prossimo avvio.
- Concettualmente, la sessione **in esecuzione** è quella il cui livello scrivibile fornisce effettivamente la persistenza per l'avvio corrente.

Il campo persistente `running=` registra questa relazione prevista. Un arresto anomalo, la mancata creazione del filesystem union, la copia dell'archivio o un arresto interrotto possono renderlo obsoleto, anche se l'avvio corrente usa RAM o un'altra sessione. Per questo, operazioni come il salvataggio SquashFS richiedono lo stato protetto dell'avvio corrente, associato all'ID di avvio e fornito dall'initrd, e la verifica del livello superiore montato; non si basano solo su `running=` da solo. Vedi [Stato attivo, in esecuzione e dell'avvio corrente](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

L'attivazione di una sessione modifica l'avvio successivo, ma non cambia il filesystem union corrente:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sessione attiva non può essere eliminata né convertita sul posto. Normalmente, una sessione in esecuzione non può essere eliminata, esportata, copiata, ridimensionata o convertita. Anche la pulizia protegge entrambi gli ID.

<a id="command-reference"></a>

## Riferimento dei comandi

Elencare le sessioni e ispezionare l'archivio:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Creare sessioni:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` senza una modalità seleziona native. La creazione di SquashFS acquisisce le modifiche attualmente presenti e non ha dimensioni fisse. Il criterio di arresto predefinito è `shutdown`; il salvataggio periodico è disattivato per impostazione predefinita.

Salvare una sessione SquashFS in esecuzione oppure una sessione di persistenza supportata che l'avvio corrente ha copiato in RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Per SquashFS, `save` ricrea lo snapshot corrente. Per una sessione Raw basata su RAM, DynFileFS, DynBlk, VMDK o SquashFS, riscrive la copia RAM nell'archivio di persistenza originale. `--as-new` conserva la sessione originale archiviata e pubblica invece lo stato RAM con un nuovo numero di sessione. Il supporto originale deve essere ancora presente, scrivibile e corrispondere all'identità del filesystem registrata all'avvio.

Configurare separatamente il salvataggio automatico di SquashFS:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gli intervalli periodici validi sono `30`, `60`, `120`, `240` e `480` minuti; `0` disattiva il salvataggio periodico. Le impostazioni di arresto e di salvataggio periodico sono indipendenti.

Esportare e importare archivi `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Sono accettate solo `.tar.zst` importazioni. I percorsi e i file negli archivi vengono convalidati e l'estrazione è limitata. `--auto-convert` seleziona una modalità compatibile con il filesystem corrente. `--force-mode <mode>` seleziona esplicitamente una modalità disponibile. Esportazione, copia/clonazione generica e conversione non sono supportate per le sessioni SquashFS; usa la procedura di salvataggio e segui [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) invece di ricostruire o copiare manualmente i componenti interni della sessione in esecuzione.

Copiare o convertire una sessione:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` è una copia logica del filesystem e assegna sempre un nuovo ID sessione. Può modificare il backend, la capacità o la crittografia e crea nuove identità ext4 e LUKS. `clone` copia fisicamente un backend scollegato e mantiene l'header LUKS, gli slot delle chiavi, l'UUID LUKS e l'UUID ext4. `convert` sostituisce l'origine per impostazione predefinita; usa `--new-session` per conservare l'origine. La dimensione è rilevante solo per una destinazione container.

Espandere, eliminare o ripulire le sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Il ridimensionamento supporta le sessioni DynFileFS, DynBlk, VMDK e raw, comprese le varianti crittografate, e richiede una dimensione superiore a quella attuale. Il ridimensionamento di DynBlk espande prima il dispositivo a blocchi virtuale e poi il filesystem ext4; non prealloca la nuova capacità virtuale. Per impostazione predefinita, la pulizia riguarda le sessioni più vecchie di 30 giorni.

Tutti i comandi accettano `--json`, e puoi selezionare un archivio sessioni diverso con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Riscrittura nell'archivio della sessione basata su RAM

Quando initrd copia una sessione di persistenza supportata in RAM con `perchtoram`, la sessione in esecuzione non scrive più direttamente nel backend originale. MiniOS identifica l'archivio originale tramite UUID del filesystem e numero di sessione, anziché basarsi sul nome `/dev/sdX`. Session Manager mantiene visibile la sessione RAM anche se il dispositivo originale è temporaneamente scollegato.

Se l'archivio originale è presente, scrivibile e invariato, **Salva ora** riscrive lo stato RAM nella sessione originale. **Salva nell'archivio come nuova sessione** lascia intatta la sessione d'origine archiviata e pubblica lo stato RAM come nuova sessione numerata. I comandi CLI equivalenti sono `minios-session save <id>` e `minios-session save <id> --as-new`. Il salvataggio mostra l'avanzamento della copia e può essere annullato prima della fase di pubblicazione; una volta avviata, la pubblicazione viene completata atomicamente.

Se il supporto originale è assente, in sola lettura, non corrisponde più all'identità rilevata all'avvio o la sessione originale è stata modificata indipendentemente, la riscrittura viene rifiutata per evitare di intervenire su un altro dispositivo identificato dal nome. Ricollega il supporto originale e riprova oppure usa il salvataggio come nuova sessione se la sessione originale è cambiata. Le sessioni native basate su directory non vengono copiate da `perchtoram`: una richiesta RAM riuscita avvia invece un nuovo container vuoto, senza importare dati nativi. Usa `perchtoram=off` per conservare la sessione nativa. Durante il ripristino di una sessione nativa, la copia è disabilitata per l'intero avvio, così da preservare i dati conservati.

## Reimpostare una sessione incompatibile

Il menu **Scegliere una sessione salvata** disponibile all'avvio può reimpostare una sessione incompatibile prima dell'attivazione. **Reimposta, mantieni le impostazioni** rimuove il software installato nel sistema mantenendo le impostazioni e i dati di sistema. **Reimposta, mantieni i dati** reimposta anche la normale configurazione di sistema. Entrambe le opzioni conservano `/home` e `/root`, incluse le impostazioni personali e le applicazioni installate nella home, gli account, le password e le chiavi. Potrebbero rimanere anche file installati manualmente in altre posizioni non elencate; la rimozione del software non è completa.

La reimpostazione richiede spazio libero sufficiente per una seconda copia dei dati conservati. Se la sostituzione di una directory non riesce o viene interrotta, viene annullata oppure ripristinata al successivo montaggio. La ripresa automatica non reimposta mai una sessione senza avvisare. Per SquashFS, la reimpostazione interessa solo il livello RAM ripristinato, finché un salvataggio completato non pubblica il nuovo snapshot e le relative informazioni di compatibilità. Esegui il backup dei dati importanti prima di reimpostare; consulta [Internals della persistenza](/reference/boot-process/Persistence-Internals).

## Comportamento di salvataggio di SquashFS

Una sessione SquashFS viene estratta in RAM per il livello scrivibile in uso. Il salvataggio ricrea e convalida uno snapshot esatto, quindi sostituisce atomicamente `changes.sb`.
Non viene conservata alcuna generazione per il rollback. Salva ora è disponibile dall'icona nell'area di notifica, dal Gestore sessioni MiniOS oppure `minios-session save` indipendentemente dai criteri automatici.

Per ogni salvataggio, MiniOS copia una vista stabile dell'albero modificato in uno spazio di archiviazione RAM privato, se la memoria disponibile lo consente. La compressione scrive **un**'immagine in una directory privata all'interno della sessione numerata. Solo dopo aver verificato il contenuto del filesystem, il digest, l'identità e la sincronizzazione persistente, il processo di salvataggio sostituisce `changes.sb`. Non viene creata una seconda immagine compressa completa in RAM né viene scritta una seconda volta sul dispositivo di persistenza. Se la memoria RAM non è sufficiente per l'albero, solo l'albero di lavoro viene scritto su disco; la copia compressa deve comunque essere scritta una volta. Consulta [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per i criteri di scrittura della cache e dei log.

I log diagnostici di avvio di una sessione persistente SquashFS vengono archiviati nelle directory `boot-logs/minios/` e `boot-logs/live/`. Non dipendono dal buon esito dello snapshot di arresto e restano disponibili anche se non è stato possibile salvare le ultime modifiche al livello superiore RAM. L'archivio di supporto deve comunque essere scrivibile; se è selezionato `LIVE_LOG_STORAGE=volatile`, i normali file del journal possono invece essere temporanei.

Il salvataggio all'arresto è gestito dal trigger di arresto MiniOS core e dal backend `minios-squashfs-save`; pertanto, non dipende dal fatto che il Gestore sessioni MiniOS sia aperto o installato. Il salvataggio periodico viene controllato ogni 30 minuti da un timer systemd o da un processo SysV, che richiamano entrambi lo stesso backend di salvataggio automatico. Ricreare lo snapshot richiede CPU e scrive lo snapshot completo; si consigliano intervalli di almeno un'ora.

Durante un'operazione RAM basata su SquashFS, un nuovo snapshot SquashFS acquisito e attivato può assumere la gestione della destinazione di salvataggio in uso. Dopo questo passaggio, il vecchio snapshot in esecuzione può essere rimosso senza riavviare:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Questa eccezione si applica solo a un passaggio SquashFS valido nell'avvio corrente. Le altre modalità di persistenza in esecuzione continuano a essere protette dall'eliminazione.

## Crittografia

LUKS2 è un livello di crittografia facoltativo applicato allo storage di sessione Raw, DynFileFS, DynBlk o VMDK; non è una modalità di sessione separata. È disponibile solo se `/run/initramfs/etc/minios-initramfs-crypt` contiene `luks-layer-v1` e sono disponibili gli strumenti e le funzionalità del backend selezionato. Quando si seleziona LUKS2, la compressione del backend DynBlk è disattivata.

La creazione interattiva di LUKS richiede di inserire la passphrase due volte. Le operazioni che leggono o creano dati LUKS possono acquisirla dallo standard input con `--password-stdin`. Le passphrase non vengono inserite negli argomenti dei comandi né nei metadati della sessione. All'avvio, initrd chiede la passphrase nella console. Dopo tre tentativi non riusciti, l'avvio si interrompe definitivamente; MiniOS non prosegue in modalità non crittografata, RAM, con un altro backend o creando una sessione sostitutiva per la stessa richiesta.

Per una sessione Raw, DynFileFS, DynBlk o VMDK crittografata, inattiva e scollegata, Gestore sessioni offre l'opzione **Cambia passphrase...**. L'equivalente CLI è:

```bash
sudo minios-session change-passphrase <id>
```

Vengono richieste la passphrase attuale, quella nuova e la conferma. Con `--password-stdin`, inserisci queste tre righe in quest'ordine. Lo slot della chiave selezionato viene sostituito senza riformattare né ricrittografare tutti i file. Le sessioni attive, in esecuzione o montate devono prima essere scollegate; gli slot LUKS aggiuntivi gestiti al di fuori di Gestore sessioni non vengono modificati.

Le esportazioni crittografate contengono i file logici della sessione decrittografati, non il backend crittografato. L'importazione, la copia o la conversione in LUKS crea un nuovo backend crittografato con nuove identità.

## Montare una sessione inattiva

Gestore sessioni può montare in lettura e scrittura una sessione Raw, DynFileFS, DynBlk o VMDK inattiva e non in esecuzione, senza impostarla come predefinita all'avvio. Fai clic con il pulsante destro del mouse sulla sessione e scegli **Monta sessione**; per le sessioni crittografate viene richiesta la passphrase LUKS. È possibile montare contemporaneamente più sessioni con ID diversi. **Apri cartella montata** apre il filesystem montato, mentre **Apri cartella sessione** apre la directory numerata che contiene i relativi file di supporto.

Chiudere Gestore sessioni non smonta le unità gestite dall'interfaccia grafica. Riapri l'applicazione per visualizzare la sessione e scegli **Smonta sessione**. Se lo smontaggio non è possibile perché la sessione è occupata, MiniOS lascia collegati il daemon di supporto, il dispositivo loop o il dispositivo DynBlk, invece di scollegare lo storage sottostante a un filesystem in uso.

La CLI standalone mantiene il montaggio attivo finché non viene chiuso lo standard input o finché non si preme Ctrl+C:

```bash
sudo minios-session mount <id>
```

Il comando rifiuta la sessione attiva o in esecuzione e non formatta mai un filesystem esistente se il montaggio non riesce.

## Backup e sessioni non riuscite

Per le sessioni native, DynFileFS, DynBlk, VMDK e Raw, comprese quelle crittografate, usa `export` per creare backup logici, invece di copiare una directory di sessione montata. Conserva l'archivio risultante su un altro dispositivo e verifica che possa essere importato prima di farvi affidamento. L'importazione crea sempre una nuova sessione numerata; attivala esplicitamente quando è pronta per l'uso.
Per SquashFS e le procedure di backup dell'intero dispositivo, consulta [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se una sessione non riesce dopo che lo storage si è riempito, un'operazione di scrittura è stata interrotta o sono state create ripetutamente sessioni vuote, interrompi le modifiche allo storage interessato. Se possibile, esporta prima una sessione leggibile e non in esecuzione, quindi segui la procedura di [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

Avvia la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All'avvio, i filesystem dei container vengono controllati prima dell'attivazione in scrittura. In caso di errori gravi durante il controllo del filesystem, il container viene conservato per il ripristino invece di essere montato in scrittura. SquashFS rileva uno stato precedente non corretto e ripristina l'ultimo snapshot salvato correttamente. Elimina le sessioni solo tramite il Gestore sessioni MiniOS oppure `minios-session delete`; non rimuovere manualmente le directory delle sessioni.

## Restituire lo spazio inutilizzato di DynFileFS, DynBlk e dello storage VMDK

In Gestore sessioni, fai clic con il pulsante destro del mouse su una sessione DynFileFS, DynBlk o VMDK e scegli **Libera spazio...**. La finestra di dialogo funziona con le sessioni supportate, in esecuzione o inattive, e può essere usata anche per una sessione già montata tramite Gestore sessioni. Per una sessione non crittografata, MiniOS esegue FITRIM sul filesystem ext4 interno effettivo, quindi chiede al backend proprietario di restituire lo spazio di supporto che risulta libero. Le sessioni scollegate vengono collegate temporaneamente e rilasciate solo dopo aver smontato correttamente il filesystem.

Il recupero dello spazio DynFileFS richiede DynFileFS 4.6.0 o versioni successive. Se il pacchetto è stato aggiornato mentre era ancora attivo un daemon DynFileFS precedente, riavvia usando il backend aggiornato prima di recuperare lo spazio della sessione in esecuzione.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La casella di controllo della compattazione è **disattivata per impostazione predefinita**, anche con exFAT. Non è disponibile alcuna
compattazione automatica di ripiego. Le sessioni crittografate recuperano solo lo spazio già
segnalato come libero dal backend; questa operazione non abilita discard tramite LUKS né
rivela il modello di allocazione. Gli errori del dispositivo e quelli di trim interrompono l'operazione.

### Comandi di basso livello del driver

Con l’attuale backend VMDK nativo o suddiviso DynBlk, l’eliminazione di grain completi
ne rende riutilizzabile la posizione. Su un filesystem di supporto ext4, è possibile anche liberare automaticamente le aree
dismesse con hole punching. Su exFAT, la pulizia automatica tronca solo le parti finali dei file
completamente libere. **La pulizia automatica non sposta mai i dati in uso.**

Usa `fstrim` sul filesystem delle modifiche interne montato (non sulla root combinata AUFS/OverlayFS
root) per segnalare i blocchi eliminati, quindi usa `dynblk reclaim /dev/dynblkN --execute` per
una pulizia che non sposta i dati. Seleziona il dispositivo effettivo della sessione, non un indice presunto.
Per richiedere manualmente la compattazione in-place, che comporta molte scritture, aggiungi `--compact`.
Funziona senza convertire l’immagine né modificare le dimensioni del filesystem virtuale;
tra un passaggio e l’altro del recupero, possono essere eseguite altre operazioni di lettura/scrittura. Non è un ripiego automatico.
L’opzione facoltativa `--scan-zeroes` legge i grain mappati e non è attiva per impostazione predefinita.

Questi comandi sono disponibili anche nella CLI DynBlk dell’initrd ricostruito. Non è attiva alcuna
compattazione automatica all’avvio. Le sessioni crittografate mantengono i criteri di discard esistenti;
gli strumenti non abilitano in modo silenzioso il passthrough del discard di dm-crypt.
Gli allegati in sola lettura o `cache=unsafe` non possono essere recuperati. Le aree liberate segnalate
e le lunghezze troncate non corrispondono allo spazio libero del filesystem misurato.

## Flussi di lavoro delle sessioni VMDK

VMDK è una modalità di sessione separata, non un nuovo codec di compressione. Le operazioni di creazione, attivazione,
ridimensionamento, esportazione/importazione, copia, clonazione e conversione usano gli stessi comandi di Session Manager
delle altre modalità contenitore:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Gli archivi di sessione contengono file logici e metadati, non un allegato VMDK
esterno arbitrario. Le sessioni VMDK gestite usano il descrittore canonico `volume.vmdk` del descrittore
e tutti i relativi file `volume-sNNN.vmdk` correlati. Non rinominare le parti né copiare un’immagine mentre è in uso
dal driver. Per passare dal formato nativo DynBlk a VMDK, e viceversa, è necessaria una
copia o conversione esplicita; modificare manualmente `session_mode` non equivale a una conversione.

Il programma di installazione propone VMDK solo se supportato dall’ambiente di runtime e rifiuta le immagini sorgente
le cui copie degli initrd non dispongono della funzionalità `vmdk-session-v1` necessaria. Aggiorna insieme la CLI,
il driver, gli strumenti di sessione e gli script di avvio prima di creare sessioni VMDK.
