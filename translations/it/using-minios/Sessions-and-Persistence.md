---
updated: 2026-09-17
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
| `native` | Le modifiche vengono salvate direttamente nella directory della sessione | Richiede un filesystem scrivibile che preservi i metadati Linux e le operazioni su cui MiniOS effettua i controlli. La capacità segue lo spazio libero di supporto; `perchsize` non si applica. | No |
| `dynfilefs` | ext4 espandibile `virtual.dat` supportato da file segmento format-400 | Funziona su filesystem scrivibili POSIX, FAT32, NTFS ed exFAT. Il payload è leggero, ma l'indice di mappatura cresce con la capacità logica dichiarata. | Sì |
| `dynblk` | File system ext4 thin su un dispositivo a blocchi kernel supportato da `volumeNNN.db` file | Richiede CLI DynBlk, modulo kernel e capacità initrd. La dimensione creata all'avvio è fino a 16 GiB per impostazione predefinita; il massimo viene riportato da `dynblk limits`. Le mappature residenti su disco utilizzano una cache metadati limitata. | Sì |
| `vmdk` | File system ext4 thin su uno standard VMDK sparse suddiviso, esposto dal driver DynBlk | Utilizza `volume.vmdk` e `volume-sNNN.vmdk`. Nessuna compressione. Richiede `vmdk-session-v1` nel marker di capacità initrd attivo. Lo stesso valore manuale predefinito di 16 GiB di DynBlk; consulta `dynblk limits --format vmdk` per i limiti. | Sì |
| `raw` | Singolo `changes.img` file contenente ext4 | Capacità logica fissa con crescita solo esplicita. Funziona su filesystem scrivibili POSIX, FAT32, NTFS ed exFAT; FAT32 è limitato a 4000 MiB. | Sì |
| `squashfs` | Snapshot compresso in `changes.sb`; la parte superiore scrivibile a runtime viene ricostruita in RAM | `perchsize` non si applica. Gli snapshot esistenti possono essere ripristinati da supporti scrivibili compatibili, mentre il salvataggio esatto richiede un filesystem di staging compatibile con POSIX. | No |

Raw, DynFileFS, DynBlk e VMDK possono opzionalmente avere uno strato di cifratura LUKS2. Il backend di archiviazione rimane la modalità sessione e i metadati della sessione registrano la cifratura separatamente. DynFileFS e raw creati con `minios-session` hanno come predefinito 4000 MiB; DynBlk e VMDK predefiniti a 16 GiB. I valori di dimensione sono allocati in MiB; `GB` e `TB` i suffissi convertono rispettivamente in 1000 e 1.000.000 MiB. Raw è limitato a 4000 MiB su FAT32 sia cifrato che non. I dati payload DynFileFS crescono su richiesta, ma il suo indice format-400 è dimensionato per la capacità logica completa e costa circa 2 MiB di RAM più circa 2 MiB di spazio di archiviazione per ogni GiB. DynBlk mantiene le tabelle di mappatura su disco e una cache metadati limitata in RAM, predefinita a 1 MiB invece di una percentuale di RAM. I suoi vettori di extent/file e le directory crescono con le parti dichiarate, mentre il riempimento del payload non richiede una mappa residente completa. Consulta il limite di capacità installata con `dynblk limits --format dynblk`. Le scritture effettive restano limitate dallo spazio libero del filesystem sottostante e dalle risorse del backend. Le operazioni di ridimensionamento del contenitore possono solo aumentare una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Usa DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Usa DynBlk se desideri un vero dispositivo a blocchi kernel con file di supporto thin; il driver può mantenere diversi volumi DynBlk indipendenti collegati contemporaneamente, e il Gestore Sessioni utilizza il percorso del dispositivo restituito dal driver invece di assumere che `/dev/dynblk0` sia libero.
Usa raw quando è richiesta un'allocazione fissa, aggiungi LUKS2 se la sessione deve essere cifrata e utilizza SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e le modalità disponibili su di esso:

```bash
sudo minios-session info
sudo minios-session status
```

Non è possibile creare sessioni su supporti di sola lettura. L'initrd può leggere e attivare uno snapshot SquashFS esistente memorizzato su FAT, exFAT o NTFS scrivibili perché estrae lo snapshot in una ext4 temporanea superiore. Creare o salvare esattamente uno snapshot è diverso: il suo workspace privato di staging deve trovarsi su un filesystem POSIX adatto che preservi i metadati Linux e i whiteout union.

## Selezione di avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono voci per ripristino, nuova sessione, selezione e modalità non persistente. La descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione si trova in [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Usa il percorso legacy di ripristino best-effort. Prova il valore predefinito dei metadati ma non crea un sostituto quando non è utilizzabile. |
| `perchdir=resume` | Ripristina il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare un nuovo sostituto compatibile. Questo è il comportamento attuale del ripristino dal menu di avvio. |
| `perchdir=new` | Alloca una nuova sessione numerata. |
| `perchdir=ask` | Seleziona una sessione esistente o creane una durante l'avvio. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Usa una posizione di persistenza su un dispositivo, incluse le forme `/dev/...` e `label:...` gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `dynblk`, `vmdk`, o `raw` oppure `squashfs`. |
| `perchencrypt=luks` | Cifra una nuova sessione Raw, DynFileFS, DynBlk o VMDK con LUKS2. Le sessioni esistenti derivano la cifratura solo dai metadati. |
| `perchcomp=<codec>` | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk. La compressione è forzata a `none` quando DynBlk è avvolto in LUKS2. |
| `perchsize=<size>` | Imposta una nuova dimensione del contenitore o una più grande; i valori semplici sono allocati in MiB e sono accettati i suffissi `MB`, `GB`, e `TB`. |

Se non viene specificata alcuna modalità per una nuova sessione, l'avvio utilizza la modalità nativa. Su FAT32/NTFS/exFAT, la creazione nativa in avvio ricade su DynFileFS. Un nuovo contenitore raw predefinito a 4000 MiB. Le nuove sessioni di avvio DynFileFS, DynBlk e VMDK senza `perchsize` utilizzano fino a 16 GiB; se dopo la riserva di sicurezza rimane meno spazio di supporto, la dimensione automatica viene ridotta. DynFileFS tiene conto anche dell'overhead dell'indice e del limite RAM. La crescita esplicita di DynBlk segue il limite del backend installato, consultabile con `dynblk limits --format dynblk`.
Le sessioni SquashFS possono essere acquisite dal sistema in esecuzione tramite Gestore sessioni MiniOS o `minios-session create squashfs`. L'impostazione initrd crea solo i metadati di sessione di generazione zero e mantiene il layer superiore scrivibile in RAM. Il sistema in esecuzione crea il primo `changes.sb` snapshot su richiesta o allo spegnimento.

Durante il ripristino, MiniOS controlla la versione registrata, l'edizione, il filesystem union e la modalità. Il comando letterale `perchdir=resume` può creare una nuova sessione invece di usare un predefinito assente o incompatibile. Le richieste legacy come `perch`, selezione numerica diretta e altre richieste di ripristino non creano automaticamente un sostituto.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile. Se la selezione o l'attivazione fallisce comunque, l'avvio prosegue normalmente con un layer superiore RAM e un avviso sulla persistenza.

L'archivio delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefiniti e in esecuzione e per ogni sessione modalità, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione di avvio, non prova dello stato runtime corrente. Non modificarlo né spostare i dati delle sessioni numerate mentre una sessione è montata; utilizza il Gestore sessioni MiniOS o `minios-session`.

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

## Comportamento di salvataggio SquashFS

Una sessione SquashFS viene estratta in RAM per il layer scrivibile in esecuzione. Il salvataggio ricostruisce e valida uno snapshot esatto, quindi sostituisce in modo atomico `changes.sb`.
Non viene mantenuta alcuna generazione di rollback. "Salva ora" è disponibile dall'icona nella tray, dal Gestore sessioni MiniOS oppure `minios-session save` indipendentemente dalla politica automatica.

Il salvataggio allo spegnimento è gestito dal trigger di spegnimento principale MiniOS e dal backend `minios-squashfs-save`, quindi non dipende dal Gestore sessioni MiniOS essere aperto o installato. Il salvataggio periodico viene controllato ogni 30 minuti da un timer systemd o da un worker SysV, entrambi richiamano lo stesso backend di salvataggio automatico. La ricostruzione dello snapshot utilizza la CPU e scrive l'intero snapshot; sono consigliati intervalli di almeno un'ora.

Durante l'operazione di RAM-backed SquashFS, uno snapshot appena catturato e attivato SquashFS può prendere il controllo del target di salvataggio attivo. Dopo questo passaggio, il vecchio snapshot in esecuzione può essere rimosso senza riavvio:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Questa eccezione si applica solo a un passaggio valido di SquashFS dell'avvio corrente. Le altre modalità di persistenza attive restano protette dalla cancellazione.

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
