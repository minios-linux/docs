---
updated: 2026-09-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sessioni e persistenza

Le sessioni MiniOS mantengono le modifiche apportate al sistema live anche dopo il riavvio. Ogni sessione è una directory numerata all'interno di `minios/changes/`; i moduli MiniOS in sola lettura rimangono invariati e la sessione selezionata fornisce il livello scrivibile del filesystem union.

Utilizza il Gestore sessioni MiniOS da un sistema MiniOS in esecuzione:

```bash
minios-session-manager
```

Lo strumento equivalente da riga di comando è `minios-session`. I comandi che modificano richiedono privilegi amministrativi, quindi negli esempi seguenti viene utilizzato `sudo`.

## Modalità sessione

| Modalità | Archiviazione | Principali vincoli | MiniOS livello LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Le modifiche vengono salvate direttamente nella directory della sessione | Richiede un filesystem scrivibile che mantenga i metadati e le operazioni Linux per cui MiniOS effettua i controlli. La capacità dipende dallo spazio libero sul supporto sottostante; `perchsize` non applicabile. | No |
| `dynfilefs` | ext4 espandibile `virtual.dat` supportato da file segmento formato-400 | Funziona su filesystem scrivibili POSIX, FAT32, NTFS ed exFAT. Il payload è leggero, ma l'indice di mappatura cresce con la capacità logica dichiarata. | Sì |
| `dynblk` | Filesystem ext4 thin su un block device kernel supportato da `volumeNNN.db` file | Richiede CLI DynBlk, modulo kernel e supporto initrd. La dimensione creata all'avvio è fino a 16 GiB per impostazione predefinita; il massimo viene riportato da `dynblk limits`. Le mappature residenti su disco usano una cache metadati a dimensione fissa. | Sì |
| `vmdk` | Filesystem ext4 thin su VMDK sparse standard suddiviso, esposto dal driver DynBlk | Utilizza `volume.vmdk` e `volume-sNNN.vmdk`. Nessuna compressione. Richiede `vmdk-session-v1` nel marker di funzionalità initrd in esecuzione. Stesso valore manuale predefinito di 16 GiB come DynBlk; verifica `dynblk limits --format vmdk` per i limiti. | Sì |
| `raw` | Singolo `changes.img` file contenente ext4 | Capacità logica fissa con crescita solo esplicita. Funziona su filesystem scrivibili POSIX, FAT32, NTFS ed exFAT; FAT32 è limitato a 4000 MiB. | Sì |
| `squashfs` | Snapshot compresso in `changes.sb`; il livello superiore scrivibile a runtime viene ricostruito in RAM | `perchsize` non applicabile. Gli snapshot esistenti possono essere ripristinati da supporti scrivibili compatibili; il salvataggio esatto richiede uno storage di persistenza compatibile con POSIX. | No |

Raw, DynFileFS, DynBlk e VMDK possono opzionalmente avere un livello di cifratura LUKS2. Il backend di archiviazione resta quello della modalità sessione, e i metadati della sessione registrano la cifratura separatamente. DynFileFS e raw creati con `minios-session` sono impostati a 4000 MiB per impostazione predefinita; DynBlk e VMDK predefiniti a 16 GiB. I valori di dimensione sono allocati in MiB; `GB` e `TB` i suffissi convertono rispettivamente in 1000 e 1.000.000 MiB. Raw è limitato a 4000 MiB su FAT32, sia cifrato che non. I dati payload DynFileFS crescono su richiesta, ma il suo indice formato-400 è dimensionato per la capacità logica completa e richiede circa 2 MiB di RAM più circa 2 MiB di storage di supporto per GiB. DynBlk mantiene le tabelle di mappatura su disco e una cache metadati a dimensione fissa in RAM, predefinita a 1 MiB invece che a una percentuale di RAM. I suoi vettori extent/file e le directory crescono con le parti dichiarate, mentre il riempimento del payload non richiede una mappa residente completa. Verifica il limite di capacità installata con `dynblk limits --format dynblk`. Le scritture effettive restano comunque limitate dallo spazio libero del filesystem sottostante e dalle risorse del backend. Le operazioni di ridimensionamento del contenitore possono solo aumentare una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Usa DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Usa DynBlk se desideri un vero block device kernel con thin backing file; il driver può mantenere più volumi DynBlk indipendenti collegati contemporaneamente e Session Manager utilizza il percorso del device restituito dal driver invece di assumere che `/dev/dynblk0` sia libero. DynBlk e VMDK non sono disponibili con UEFI Secure Boot attivo perché MiniOS non firma il modulo kernel esterno DynBlk. L'Installer e il Session Manager quindi nascondono queste modalità e rifiutano richieste di creazione esplicite prima di tentare il caricamento del modulo.
Usa raw quando è richiesta un'allocazione fissa, aggiungi LUKS2 se la sessione deve essere cifrata e usa SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e le modalità disponibili:

```bash
sudo minios-session info
sudo minios-session status
```

Non è possibile creare sessioni su supporti di sola lettura. L'initrd può leggere e attivare uno snapshot SquashFS esistente memorizzato su FAT, exFAT o NTFS scrivibili, perché estrae lo snapshot in un livello superiore ext4 temporaneo. Creare o salvare esattamente uno snapshot è diverso: lo storage di persistenza deve supportare i metadati POSIX richiesti e la pubblicazione privata e durevole. L'albero di lavoro per l'acquisizione esatta usa RAM affidabili quando disponibili, con fallback su disco se RAM non è sufficiente.

## Selezione di avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono le voci riprendi, nuovo, selezione e non persistente. La descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione è [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Utilizza il percorso legacy best-effort per il ripristino. Prova il valore predefinito dei metadati ma non crea una sostituzione se nessuno è utilizzabile. |
| `perchdir=resume` | Ripristina il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare una nuova sostituzione compatibile. Questo è il comportamento attuale di ripristino del menu di avvio. |
| `perchdir=new` | Crea una nuova sessione numerata. |
| `perchdir=ask` | Seleziona una sessione esistente o creane una durante l'avvio. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Utilizza una posizione di persistenza su un dispositivo, incluse `/dev/...` e `label:...` le forme gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra una nuova sessione Raw, DynFileFS, DynBlk o VMDK con LUKS2. Le sessioni esistenti derivano la cifratura solo dai metadati. |
| `perchcomp=<codec>` | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk. La compressione viene forzata a `none` quando DynBlk è avvolto in LUKS2. |
| `perchsize=<size>` | Imposta una nuova dimensione del contenitore o maggiore; i valori semplici sono allocati in MiB e `MB`, `GB`, e `TB` i suffissi sono accettati. |

Se non viene specificata una modalità per una nuova sessione, l'avvio utilizza la modalità nativa. Su FAT32/NTFS/exFAT, la creazione nativa in avvio ricade su DynFileFS. Un nuovo contenitore raw ha come default 4000 MiB. Le nuove sessioni di avvio DynFileFS, DynBlk e VMDK senza `perchsize` utilizzano fino a 16 GiB; se rimane meno spazio disponibile dopo la riserva di sicurezza, la dimensione automatica viene ridotta. DynFileFS tiene conto anche del suo overhead di indice e del limite RAM. La crescita esplicita di DynBlk segue il limite del backend installato, verificabile con `dynblk limits --format dynblk`. Con Secure Boot attivo, l'initrd non offre DynBlk/VMDK e tratta una sessione DynBlk/VMDK esplicita o ripresa come non disponibile invece di tentare di caricare il modulo non firmato.
Le sessioni SquashFS possono essere acquisite dal sistema in esecuzione con il Gestore sessioni MiniOS o `minios-session create squashfs`. La configurazione initrd crea solo metadati di sessione generazione zero e mantiene l'upper scrivibile in RAM. Il sistema in esecuzione crea il primo `changes.sb` snapshot su richiesta o allo spegnimento.

Durante il ripristino, MiniOS controlla la versione registrata, l'edizione, il filesystem union e la modalità. Il comando letterale `perchdir=resume` può creare una nuova sessione invece di usare un predefinito assente o incompatibile. Le richieste di ripristino legacy come `perch`, selezione numerica diretta e altre non creano automaticamente una sostituzione.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile. Se selezione o attivazione falliscono comunque, l'avvio prosegue normalmente con un upper RAM e un avviso di persistenza.

L'archivio delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefiniti e in esecuzione, e per ogni sessione la modalità, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione di avvio, che da soli non provano lo stato runtime attuale. Non modificarli né spostare dati di sessioni numerate mentre una sessione è montata; usa il Gestore sessioni MiniOS o `minios-session`.

## Sessioni attive ed eseguite

Questi termini descrivono stati differenti:

- La **attiva** è la sessione predefinita selezionata per il prossimo avvio.
- Concettualmente, la **in esecuzione** è la sessione il cui layer scrivibile fornisce effettivamente la persistenza all'avvio corrente.

Il campo di persistenza `running=` registra questa relazione prevista. Un arresto anomalo, un errore nella costruzione dell'union, una copia dello store o uno spegnimento interrotto possono lasciarlo obsoleto anche se l'avvio corrente sta usando RAM o un'altra sessione. Operazioni come il salvataggio SquashFS richiedono quindi lo stato corrente protetto dell'avvio, legato al boot-ID, e l'upper montato verificato dall'initrd; non si affidano solo a `running=` da solo. Vedi [Stato attivo, in esecuzione e di avvio corrente](/reference/boot-process/Persistence-Internals#stato-attivo-in-esecuzione-e-di-avvio-corrente).

Attivare una sessione modifica il prossimo avvio ma non cambia il filesystem union corrente:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sessione attiva non può essere eliminata o convertita direttamente. Una sessione in esecuzione normalmente non può essere eliminata, esportata, copiata, ridimensionata o convertita. Anche la pulizia protegge entrambi gli ID.

## Riferimento ai comandi

Elenca le sessioni e ispeziona l'archivio:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Crea sessioni:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` senza una modalità seleziona la nativa. La creazione SquashFS acquisisce le modifiche attive e non ha dimensione fissa. La sua politica di spegnimento predefinita è `shutdown`; il salvataggio periodico è disattivato per impostazione predefinita.

Salva e configura una sessione SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gli intervalli periodici validi sono `30`, `60`, `120`, `240`, e `480` minuti; `0` disabilita il salvataggio periodico. Le impostazioni di spegnimento e periodico sono indipendenti.

Esporta e importa `.tar.zst` archivi:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Sono accettate solo importazioni `.tar.zst`. I percorsi e i membri dell'archivio vengono validati e l'estrazione è limitata. `--auto-convert` sceglie una modalità compatibile per il filesystem attuale. `--force-mode <mode>` seleziona esplicitamente una modalità disponibile. Esportazione, copia e conversione non sono supportate per le sessioni SquashFS; salva lo snapshot e copia invece l'intera directory della sessione inattiva.

Copia o converti una sessione:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` è una copia logica del filesystem e assegna sempre un nuovo ID sessione. Può cambiare backend, capacità o cifratura e crea nuove identità ext4 e LUKS. `clone` copia fisicamente un backend scollegato e mantiene header LUKS, keyslot, UUID LUKS e UUID ext4. `convert` sostituisce la sorgente per impostazione predefinita; usa `--new-session` per preservare la sorgente. Una dimensione è rilevante solo per un target contenitore.

Aumenta, elimina o pulisci sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Il ridimensionamento supporta sessioni DynFileFS, DynBlk, VMDK e raw, incluse le forme cifrate, e richiede una dimensione maggiore di quella attuale. Il ridimensionamento DynBlk aumenta prima il dispositivo a blocchi virtuale e poi espande il filesystem ext4; non prealloca la nuova capacità virtuale. La pulizia predefinita riguarda le sessioni più vecchie di 30 giorni.

Tutti i comandi accettano `--json`, e si può selezionare un archivio sessioni diverso con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamento salvataggio SquashFS

Una sessione SquashFS viene estratta in RAM per il livello scrivibile in esecuzione. Il salvataggio ricostruisce e valida uno snapshot esatto, quindi sostituisce in modo atomico `changes.sb`.
Non viene mantenuta alcuna generazione di rollback. "Salva ora" è disponibile dall'icona nella tray, dal Gestore sessioni MiniOS oppure `minios-session save` indipendentemente dalla policy automatica.

Per ogni salvataggio, MiniOS copia una vista stabile dell'albero modificato nello storage privato RAM quando la memoria lo consente. La compressione scrive **un'unica** immagine in una directory privata all'interno della sessione numerata. Solo dopo aver controllato contenuto filesystem, digest, identità e sincronizzazione durevole, il salvataggio sostituisce `changes.sb`. Non viene creata una seconda immagine compressa completa in RAM né viene effettuata una seconda scrittura di tale immagine sul dispositivo di persistenza. Se la RAM è insufficiente per l'albero, solo quell'albero di lavoro ricade su disco; il candidato compresso richiede comunque una scrittura. Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per policy di scrittura cache e log.

Le diagnostiche di avvio per una sessione SquashFS durevole vengono salvate nelle directory `boot-logs/minios/` e `boot-logs/live/` corrispondenti. Non dipendono dal successo dello snapshot di spegnimento e restano disponibili anche se le ultime modifiche al livello superiore RAM non sono state salvate. Il supporto di archiviazione deve comunque essere scrivibile; i file di log ordinari possono invece essere temporanei se `LIVE_LOG_STORAGE=volatile` è selezionato.

Il salvataggio in fase di spegnimento è gestito dal trigger di spegnimento core MiniOS e dal backend `minios-squashfs-save`, quindi non dipende dall'apertura o dall'installazione del Gestore sessioni MiniOS. Il salvataggio periodico viene controllato ogni 30 minuti da un timer systemd o da un worker SysV, entrambi richiamano lo stesso backend di salvataggio automatico. La ricostruzione dello snapshot utilizza la CPU e scrive l'intero snapshot; si consiglia un intervallo di almeno un'ora.

Durante il funzionamento RAM-backed SquashFS, uno snapshot SquashFS appena acquisito e attivato può prendere possesso del target di salvataggio in esecuzione. Dopo il passaggio, il vecchio snapshot attivo può essere rimosso senza riavvio:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Questa eccezione si applica solo a un passaggio valido SquashFS dell'avvio corrente. Le altre modalità di persistenza attive restano protette dalla cancellazione.

## Cifratura

LUKS2 è un livello opzionale sopra Raw `changes.img`, DynFileFS `virtual.dat`, o il dispositivo diretto DynBlk. È disponibile solo quando `/run/initramfs/etc/minios-initramfs-crypt`contiene `luks-layer-v1`e sono disponibili gli strumenti e le capacità del backend selezionato.

La creazione interattiva LUKS richiede l'inserimento della passphrase due volte. Le operazioni che leggono o creano dati LUKS possono leggerli dallo standard input con `--password-stdin`.
Le passphrase non vengono inserite negli argomenti dei comandi né nei metadati della sessione. All'avvio, l'initrd richiede la passphrase sulla console. Tre tentativi errati bloccano l'avvio in modo irreversibile; MiniOS non prosegue in chiaro, RAM, con un altro backend o con una sessione sostitutiva sotto la stessa richiesta.

Le esportazioni cifrate contengono i file logici della sessione decifrati, non il backend cifrato. Importare, copiare o convertire in LUKS crea un nuovo backend cifrato con nuove identità.

## Backup e sessioni non riuscite

Per le sessioni native, DynFileFS, DynBlk, VMDK e raw, incluse le forme cifrate, utilizza `export` per backup logici invece di copiare una directory di sessione montata. Conserva l'archivio risultante su un altro dispositivo e verifica che possa essere importato prima di farvi affidamento. L'importazione crea sempre una nuova sessione numerata; attivala esplicitamente quando è pronta all'uso.
Per le procedure di backup SquashFS e dell'intero dispositivo, vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se una sessione fallisce dopo che lo spazio si è esaurito, una scrittura viene interrotta o vengono create ripetutamente sessioni vuote, interrompi le modifiche allo storage interessato. Esporta prima una sessione non attiva leggibile quando possibile, poi segui [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

Avvia la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All'avvio, i filesystem dei contenitori vengono controllati prima dell'attivazione scrivibile. Errori gravi di controllo del filesystem preservano il contenitore per il recupero invece di montarlo in scrittura. SquashFS rileva uno stato precedente non pulito e ripristina l'ultimo snapshot salvato correttamente. Elimina le sessioni solo tramite Gestore sessioni MiniOS o `minios-session delete`; non rimuovere manualmente le directory delle sessioni.

## Restituzione dello spazio inutilizzato DynBlk e VMDK

Nel Gestore Sessioni, fai clic destro su una sessione DynBlk o VMDK e scegli **Libera spazio...**.
La finestra di dialogo funziona sia per la sessione attiva che per una inattiva. Per una
sessione plaintext, esegue il trim dell'ext4 interno prima di chiedere al driver di recuperare
lo spazio. Una sessione inattiva viene collegata temporaneamente e poi scollegata; il
dispositivo della sessione attiva rimane collegato.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

La casella di compattazione è **disattivata per impostazione predefinita**, anche su exFAT. Non è previsto alcun
fallback automatico di compattazione. Le sessioni cifrate recuperano solo lo spazio già
conosciuto dal driver; questa operazione non abilita il discard tramite LUKS né
rivela il pattern di allocazione. Errori del dispositivo e trim falliti interrompono l'operazione.

### Comandi driver di basso livello

Con il backend attuale DynBlk nativo o VMDK suddiviso, il discard di interi grain
rende nuovamente utilizzabile la loro allocazione. Su un filesystem ext4 di supporto, gli intervalli ritirati
possono anche essere automaticamente liberati (hole-punch). Su exFAT, la pulizia automatica tronca solo
le code di file completamente libere. **La pulizia automatica non sposta mai dati attivi.**

Usa `fstrim` sul filesystem dei cambiamenti interni montato (non sulla root combinata AUFS/OverlayFS
) per segnalare i blocchi eliminati, poi `dynblk reclaim /dev/dynblkN --execute` per
la pulizia non distruttiva. Seleziona il vero dispositivo di sessione, non un indice presunto.
Per richiedere manualmente una compattazione in-place intensiva in scrittura, aggiungi `--compact`.
Funziona senza convertire l'immagine o cambiare la dimensione del filesystem virtuale;
altri processi di lettura/scrittura possono essere eseguiti tra i passaggi di recupero. Non è un fallback automatico.
L'opzione `--scan-zeroes` legge i grain mappati e non è abilitata per impostazione predefinita.

Questi comandi sono disponibili anche nella CLI DynBlk initrd ricostruita. Nessuna compattazione
automatica all'avvio è abilitata. Le sessioni cifrate mantengono la loro policy di discard esistente; gli strumenti non abilitano silenziosamente il discard dm-crypt.
policy; gli strumenti non abilitano silenziosamente il discard dm-crypt.
Le sessioni in sola lettura o `cache=unsafe` collegate non possono essere recuperate. Gli intervalli liberati e le lunghezze troncate segnalati non corrispondono allo spazio libero misurato dal filesystem.
Gli intervalli liberati e le lunghezze troncate segnalati non corrispondono allo spazio libero misurato dal filesystem.

## Flussi di lavoro sessione VMDK

VMDK è una modalità sessione separata, non un nuovo codec di compressione. Creazione, attivazione,
ridimensionamento, esportazione/importazione, copia, clonazione e conversione utilizzano gli stessi comandi del Gestore Sessioni
delle altre modalità contenitore:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Gli archivi di sessione contengono file logici e metadati, non un allegato VMDK esterno arbitrario.
Le sessioni VMDK gestite usano il `volume.vmdk`descrittore canonico
e tutti i suoi `volume-sNNN.vmdk`fratelli. Non rinominare le parti né copiare un'immagine attiva
dietro al driver. Il passaggio tra DynBlk nativo e VMDK richiede una
copia/conversione esplicita; cambiare `session_mode`manualmente non equivale a una conversione.

L'installer offre VMDK solo quando supportato dal runtime e rifiuta immagini
di origine i cui initrd copiati non dispongono della `vmdk-session-v1`capacità. Aggiorna CLI,
driver, strumenti sessione e script di avvio insieme prima di creare sessioni VMDK.
