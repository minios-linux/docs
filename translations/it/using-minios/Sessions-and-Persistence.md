---
updated: 2026-10-06
program_commits:
    minios-session-manager: 3ec8b706ff661eb7f8f3fa5306a14f7fd7bc5cd3
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Sessioni e persistenza

Le sessioni MiniOS mantengono le modifiche apportate al sistema live anche dopo il riavvio. Ogni sessione è una directory numerata all'interno di `minios/changes/`; i moduli MiniOS in sola lettura restano invariati e la sessione selezionata fornisce il layer scrivibile del filesystem union.

Usa Gestore sessioni MiniOS da un sistema MiniOS in esecuzione:

```bash
minios-session-manager
```

Lo strumento equivalente da riga di comando è `minios-session`. I comandi che modificano richiedono privilegi amministrativi, quindi negli esempi seguenti viene utilizzato `sudo`.

## Modalità sessione

| Modalità | Archiviazione | Vincoli principali | Layer LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | Le modifiche vengono salvate direttamente nella directory della sessione | Richiede un filesystem scrivibile che preservi i metadati Linux e le operazioni che MiniOS rileva. La capacità segue lo spazio libero di supporto; `perchsize` non si applica. | No |
| `dynfilefs` | ext4 espandibile `virtual.dat` supportato da file segmento formato-400 | Funziona su filesystem scrivibili POSIX, FAT32, NTFS ed exFAT. Il payload è leggero, ma l'indice di mappatura cresce in base alla capacità logica dichiarata. | Sì |
| `dynblk` | Filesystem ext4 thin su un device a blocchi kernel supportato da `volumeNNN.db` file | Richiede CLI DynBlk, modulo kernel e supporto initrd. La dimensione creata all'avvio è fino a 16 GiB per impostazione predefinita; il massimo viene riportato da `dynblk limits`. Le mappature residenti su disco usano una cache metadati limitata. | Sì |
| `vmdk` | Filesystem ext4 thin su uno split VMDK standard sparso, esposto dal driver DynBlk | Utilizza `volume.vmdk` e `volume-sNNN.vmdk`. Nessuna compressione. Richiede `vmdk-session-v1` nel marker di capacità initrd in esecuzione. Stesso valore manuale predefinito di 16 GiB come DynBlk; consulta `dynblk limits --format vmdk` per i limiti. | Sì |
| `raw` | Singolo `changes.img` file contenente ext4 | Capacità logica fissa con crescita solo esplicita. Funziona su filesystem scrivibili POSIX, FAT32, NTFS ed exFAT; FAT32 è limitato a 4000 MiB. | Sì |
| `squashfs` | Snapshot compresso in `changes.sb`; l'upper scrivibile a runtime viene ricostruito in RAM | `perchsize` non si applica. Gli snapshot esistenti possono essere ripristinati da supporti scrivibili compatibili; il salvataggio esatto richiede uno store di persistenza compatibile con POSIX. | No |

Raw, DynFileFS, DynBlk e VMDK possono opzionalmente avere un layer di cifratura LUKS2. Il backend di archiviazione resta la modalità sessione, e i metadati della sessione registrano la cifratura separatamente. DynFileFS e raw creati con `minios-session` predefiniscono 4000 MiB; DynBlk e VMDK predefiniscono 16 GiB. I valori di dimensione sono allocati in MiB; `GB` e `TB` i suffissi convertono in 1000 e 1.000.000 MiB. Raw è limitato a 4000 MiB su FAT32 sia cifrato che non. I dati payload DynFileFS crescono su richiesta, ma il suo indice formato-400 è dimensionato per la capacità logica totale e costa circa 2 MiB di RAM più circa 2 MiB di spazio di supporto per GiB. DynBlk mantiene le tabelle di mappatura su disco e una cache metadati limitata in RAM, predefinita a 1 MiB invece che a una percentuale di RAM. I suoi vettori extent/file e le directory crescono con le parti dichiarate, mentre il riempimento del payload non richiede una mappa residente completa. Consulta il limite di capacità installata con `dynblk limits --format dynblk`. Le scritture effettive restano limitate dallo spazio libero del filesystem sottostante e dalle risorse del backend. Le operazioni di ridimensionamento del container possono solo aumentare una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Utilizza DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Utilizza DynBlk se desideri un vero device a blocchi kernel con file thin di supporto; il driver può mantenere diversi volumi DynBlk indipendenti collegati contemporaneamente, e Gestore sessioni utilizza il percorso del device restituito dal driver invece di assumere che `/dev/dynblk0` sia libero. DynBlk e VMDK non sono disponibili con UEFI Secure Boot attivo perché MiniOS non firma il modulo kernel esterno DynBlk. L'installer e Gestore sessioni quindi nascondono queste modalità e rifiutano richieste di creazione esplicite prima di tentare di caricare il modulo.
Usa raw quando è richiesta un'allocazione fissa, aggiungi LUKS2 se la sessione deve essere cifrata e utilizza SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e le modalità disponibili:

```bash
sudo minios-session info
sudo minios-session status
```

Nessuna sessione può essere creata su supporti in sola lettura. L'initrd può leggere e attivare uno snapshot SquashFS esistente memorizzato su FAT, exFAT o NTFS scrivibili perché estrae lo snapshot in un upper ext4 temporaneo. La creazione o il salvataggio esatto di uno snapshot è diverso: lo store di persistenza deve supportare i metadati POSIX richiesti e la pubblicazione privata e durevole. L'albero di lavoro per la cattura esatta utilizza RAM affidabili quando disponibili, con fallback su spazio disco se RAM è insufficiente.

## Selezione all'avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono voci per ripristino, nuova sessione, selezione e modalità non persistente. La descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione è in [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Usa il percorso legacy di ripristino best-effort. Prova il valore predefinito dei metadati ma non crea un sostituto quando nessuno è utilizzabile. |
| `perchdir=resume` | Ripristina il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare un nuovo sostituto compatibile. Questo è il comportamento attuale del menu di avvio per il ripristino. |
| `perchdir=setup` | Apre il selettore interattivo del backend di persistenza, quindi alloca una nuova sessione numerata. Questo è il comportamento attuale di **Avviare una nuova sessione** . |
| `perchdir=new` | Alloca direttamente una nuova sessione numerata dal backend richiesto/predefinito, con cifratura, compressione e dimensione senza aprire il selettore backend. |
| `perchdir=ask` | Seleziona una sessione esistente; se lo store è vuoto, entra automaticamente nello stesso flusso di configurazione usato da `perchdir=setup`. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Usa una posizione di persistenza su un dispositivo, incluse le forme `/dev/...` e `label:...` gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra una nuova sessione Raw, DynFileFS, DynBlk o VMDK con LUKS2. Le sessioni esistenti derivano la cifratura solo dai metadati. |
| `perchcomp=<codec>` | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk. La compressione è forzata a `none` quando DynBlk è racchiuso in LUKS2. |
| `perchsize=<size>` | Imposta una nuova dimensione del container o una più grande; i valori semplici sono allocati in MiB e `MB`, `GB`, e `TB` i suffissi sono accettati. |

Se non viene specificata una modalità per una nuova sessione, l'avvio utilizza la modalità nativa. Su FAT32/NTFS/exFAT, la creazione nativa all'avvio ricade su DynFileFS. Un nuovo container raw predefinisce 4000 MiB. Le nuove sessioni di avvio DynFileFS, DynBlk e VMDK senza `perchsize` utilizzano fino a 16 GiB; quando rimane meno spazio di supporto dopo la riserva di sicurezza, la dimensione automatica viene ridotta. DynFileFS tiene conto anche del suo overhead di indice e del limite RAM. La crescita esplicita di DynBlk segue il limite del backend installato, consultabile con `dynblk limits --format dynblk`. Con Secure Boot attivo, l'initrd non offre DynBlk/VMDK e tratta una sessione DynBlk/VMDK esplicita o ripristinata come non disponibile invece di tentare di caricare il modulo non firmato.
Le sessioni SquashFS possono essere acquisite dal sistema in esecuzione con Gestore sessioni MiniOS o `minios-session create squashfs`. La configurazione initrd crea solo i metadati della sessione di generazione zero e mantiene l'upper scrivibile in RAM. Il sistema in esecuzione crea il primo `changes.sb` snapshot su richiesta o allo spegnimento.

Durante il ripristino, MiniOS controlla la versione registrata, l'edizione, il filesystem union e la modalità. Il comando letterale `perchdir=resume` può creare una nuova sessione invece di usare un valore predefinito assente o incompatibile. Le richieste di ripristino legacy come `perch`, selezione numerica diretta e altre non creano automaticamente un sostituto.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile. Se la selezione o l'attivazione fallisce comunque, l'avvio prosegue normalmente con un upper RAM e un avviso di persistenza.

Lo store delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefiniti e in esecuzione e, per ogni sessione, modalità, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione di avvio, non è di per sé prova dello stato runtime attuale. Non modificarlo né spostare i dati delle sessioni numerate mentre una sessione è montata; usa Gestore sessioni MiniOS o `minios-session`.

## Sessioni attive e in esecuzione

Questi termini descrivono stati diversi:

- La sessione **attiva** è quella selezionata come predefinita per il prossimo avvio.
- Concettualmente, la sessione **in esecuzione** è quella il cui layer scrivibile fornisce effettivamente la persistenza all'avvio corrente.

Il campo persistente `running=` registra quella relazione prevista. Un crash, un errore nella costruzione dell'union, la copia dello store o uno spegnimento interrotto possono lasciarlo obsoleto anche se l'avvio attuale sta usando RAM o un'altra sessione. Operazioni come il salvataggio SquashFS richiedono quindi lo stato protetto dell'avvio corrente legato all'ID di boot dell'initrd e l'upper montato verificato; non si fidano di `running=` da solo. Vedi [Stato attivo, in esecuzione e di avvio corrente](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

L'attivazione di una sessione cambia il prossimo avvio ma non commuta il filesystem union corrente:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sessione attiva non può essere eliminata o convertita in loco. Una sessione in esecuzione normalmente non può essere eliminata, esportata, copiata, ridimensionata o convertita. La pulizia protegge anche entrambi gli ID.

## Riferimento ai comandi

Elenca le sessioni e ispeziona lo store:

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
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` senza una modalità seleziona quella nativa. La creazione SquashFS cattura le modifiche live correnti e non ha una dimensione fissa. La sua policy di salvataggio allo spegnimento è impostata di default su `shutdown`; il salvataggio periodico è disattivato per impostazione predefinita.

Salva una sessione SquashFS in esecuzione, o una sessione di persistenza supportata che l'avvio corrente ha copiato in RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Per SquashFS, `save` ricostruisce lo snapshot corrente. Per una sessione Raw supportata da RAM, DynFileFS, DynBlk, VMDK o SquashFS, scrive la copia RAM nello store di persistenza originale. `--as-new` mantiene la sessione originale memorizzata e pubblica lo stato RAM sotto un nuovo numero di sessione. Il supporto originale deve comunque essere presente, scrivibile e corrispondere all'identità del filesystem registrata all'avvio.

Configura separatamente il salvataggio automatico SquashFS:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gli intervalli periodici validi sono `30`, `60`, `120`, `240`, e `480` minuti; `0` disattiva il salvataggio periodico. Le impostazioni di spegnimento e periodiche sono indipendenti.

Esporta e importa `.tar.zst` archivi:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Sono accettate solo importazioni `.tar.zst`. I percorsi e i membri dell'archivio vengono validati e l'estrazione è limitata. `--auto-convert` sceglie una modalità compatibile per il filesystem attuale. `--force-mode <mode>` seleziona esplicitamente una modalità disponibile. L'esportazione, la copia/clonazione generica e la conversione non sono supportate per le sessioni SquashFS; usa il suo flusso di salvataggio e segui [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) invece di ricostruire o copiare manualmente gli interni di una sessione live.

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

`copy` è una copia logica del filesystem e assegna sempre un nuovo ID sessione. Può cambiare backend, capacità o cifratura e crea nuove identità ext4 e LUKS. `clone` copia fisicamente un backend staccato e preserva header LUKS, keyslot, UUID LUKS e UUID ext4. `convert` sostituisce la sorgente per impostazione predefinita; usa `--new-session` per preservare la sorgente. Una dimensione è rilevante solo per un container di destinazione.

Aumenta, elimina o pulisci le sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Il ridimensionamento supporta DynFileFS, DynBlk, VMDK e sessioni raw, incluse quelle cifrate, e richiede una dimensione superiore a quella attuale. Il ridimensionamento DynBlk aumenta prima il device a blocchi virtuale e poi espande il filesystem ext4; non prealloca la nuova capacità virtuale. La pulizia di default riguarda le sessioni più vecchie di 30 giorni.

Tutti i comandi accettano `--json`, e si può selezionare uno store sessioni diverso con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Sessione supportata da RAM: scrittura di ritorno

Quando l'initrd copia una sessione di persistenza supportata in RAM con `perchtoram`, la sessione in esecuzione non scrive più direttamente sul backend originale. MiniOS registra lo store originale tramite UUID del filesystem e numero di sessione invece di affidarsi a un nome `/dev/sdX`. Gestore sessioni mantiene visibile quella sessione RAM anche se il dispositivo originale è temporaneamente scollegato.

Se lo store originale è presente, scrivibile e invariato, **Salva ora** scrive lo stato RAM nella sessione originale. **Salva su archivio come nuova sessione** mantiene la sorgente memorizzata intatta e pubblica lo stato RAM come nuova sessione numerata. Gli equivalenti CLI sono `minios-session save <id>` e `minios-session save <id> --as-new`. Il salvataggio mostra l'avanzamento della copia e può essere annullato prima della pubblicazione; la pubblicazione avviene in modo atomico una volta avviata.

Se il supporto originale manca, è in sola lettura, non corrisponde più all'identità rilevata all'avvio o la sessione originale è cambiata indipendentemente, la scrittura di ritorno viene rifiutata invece di indirizzare un altro dispositivo per nome. Ricollega il supporto originale e riprova, oppure usa il salvataggio come nuovo se la sessione originale è divergente. Le sessioni directory native non vengono copiate dall'implementazione attuale di `perchtoram`, quindi questo percorso di scrittura di ritorno si applica a sessioni Raw, DynFileFS, DynBlk, VMDK e SquashFS.

## Comportamento di salvataggio SquashFS

Una sessione SquashFS viene estratta in RAM per il layer scrivibile in esecuzione. Il salvataggio ricostruisce e valida uno snapshot esatto, poi sostituisce in modo atomico `changes.sb`.
Non viene mantenuta alcuna generazione di rollback. Salva ora è disponibile dall'icona della tray, dal Gestore sessioni MiniOS o `minios-session save` indipendentemente dalla policy automatica.

Per ogni salvataggio, MiniOS copia una vista stabile dell'albero modificato in uno storage privato RAM quando la memoria lo consente. La compressione scrive **un'unica** immagine in una directory privata all'interno della sessione numerata. Solo dopo aver verificato i contenuti del filesystem, il digest, l'identità e la sincronizzazione durevole, il salvataggio sostituisce `changes.sb`. Non esiste una seconda immagine compressa completa in RAM né una seconda scrittura di quell'immagine sul dispositivo di persistenza. Se la RAM è insufficiente per l'albero, solo quell'albero di lavoro ricade su disco; il candidato compresso richiede comunque una scrittura. Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per le policy di cache e scrittura log.

Le diagnostiche di avvio per una sessione SquashFS durevole sono archiviate nelle directory `boot-logs/minios/` e `boot-logs/live/`. Non dipendono da uno snapshot di spegnimento riuscito e restano disponibili anche se le ultime modifiche all'upper RAM non sono state salvate. Il backend deve comunque essere scrivibile; i file di log ordinari possono invece essere temporanei se `LIVE_LOG_STORAGE=volatile` è selezionato.

Il salvataggio allo spegnimento è implementato dal trigger di spegnimento core MiniOS e dal backend `minios-squashfs-save`, quindi non dipende dalla presenza o installazione del Gestore sessioni MiniOS. Il salvataggio periodico viene controllato ogni 30 minuti da un timer systemd o da un worker SysV, entrambi richiamano lo stesso backend autosave. La ricostruzione dello snapshot consuma CPU e scrive l'intero snapshot; sono consigliati intervalli di un'ora o più.

Durante il funzionamento RAM supportato da SquashFS, uno snapshot SquashFS appena acquisito e attivato può prendere possesso del target di salvataggio in esecuzione. Dopo il passaggio, il vecchio snapshot in esecuzione può essere rimosso senza riavviare:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Questa eccezione si applica solo a un passaggio valido dell'avvio corrente SquashFS. Le altre modalità di persistenza in esecuzione restano protette dalla cancellazione.

## Cifratura

LUKS2 è un layer di cifratura opzionale sopra lo storage sessione Raw, DynFileFS, DynBlk o VMDK; non è una modalità sessione separata. È disponibile solo quando `/run/initramfs/etc/minios-initramfs-crypt` contiene `luks-layer-v1` e sono disponibili gli strumenti e le capacità del backend selezionato. La compressione backend DynBlk è disattivata quando si seleziona LUKS2.

La creazione interattiva LUKS richiede l'inserimento della passphrase due volte. Le operazioni che leggono o creano dati LUKS possono leggerli dallo standard input con `--password-stdin`. Le passphrase non vengono inserite negli argomenti dei comandi né nei metadati della sessione. All'avvio, l'initrd richiede la passphrase sulla console. Tre tentativi errati interrompono l'avvio in modo irreversibile; MiniOS non prosegue in chiaro, RAM, con un altro backend o una sessione sostitutiva con la stessa richiesta.

Per una sessione Raw, DynFileFS, DynBlk o VMDK cifrata, inattiva e scollegata, Gestore sessioni offre **Cambia passphrase...**. L'equivalente CLI è:

```bash
sudo minios-session change-passphrase <id>
```

Richiede la passphrase attuale, la nuova passphrase e la conferma. Con `--password-stdin`, fornire queste tre righe in quest'ordine. Lo slot chiave selezionato viene sostituito senza riformattare o cifrare nuovamente tutti i file. Le sessioni attive, in esecuzione o montate devono prima essere scollegate; eventuali slot chiave LUKS gestiti esternamente a Gestore sessioni non vengono modificati.

Le esportazioni cifrate contengono i file logici della sessione in chiaro, non il backend cifrato. Importare, copiare o convertire in LUKS crea un nuovo backend cifrato con nuove identità.

## Montaggio di una sessione inattiva

Gestore sessioni può montare una sessione Raw, DynFileFS, DynBlk o VMDK inattiva e non in esecuzione in modalità lettura-scrittura senza renderla predefinita all'avvio. Fai clic destro sulla sessione e scegli **Monta sessione**; le sessioni cifrate chiedono la passphrase LUKS. Più ID sessione diversi possono essere montati contemporaneamente. **Apri cartella montata** apre il filesystem collegato, mentre **Apri cartella sessione** apre la directory numerata che contiene i file di supporto.

Chiudere Gestore sessioni non smonta un mount gestito dalla GUI. Riavvia l'applicazione per visualizzarlo e scegli **Smonta sessione**. Se lo smontaggio è occupato, MiniOS lascia collegato il demone di supporto, il device loop o il device DynBlk invece di scollegare lo storage sotto un filesystem attivo.

La CLI standalone mantiene il mount attivo finché lo standard input non viene chiuso o si riceve Ctrl+C:

```bash
sudo minios-session mount <id>
```

Il comando rifiuta la sessione attiva o in esecuzione e non formatta mai un filesystem esistente perché il montaggio è fallito.

## Backup e sessioni fallite

Per sessioni native, DynFileFS, DynBlk, VMDK e raw, incluse quelle cifrate, utilizza `export` per backup logici invece di copiare la directory di una sessione montata. Conserva l'archivio risultante su un altro dispositivo e verifica che possa essere importato prima di farvi affidamento. L'importazione crea sempre una nuova sessione numerata; attivala esplicitamente quando è pronta all'uso.
Per le procedure di backup SquashFS e di intero dispositivo, vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se una sessione fallisce dopo che lo storage si è riempito, una scrittura viene interrotta o vengono create ripetutamente sessioni vuote, interrompi ogni modifica allo storage interessato. Esporta prima una sessione non in esecuzione leggibile quando possibile, poi segui [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

Inizia la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All'avvio, i filesystem dei container vengono controllati prima dell'attivazione scrivibile. Errori gravi nel controllo del filesystem preservano il container per il recupero invece di montarlo in scrittura. SquashFS rileva uno stato precedente non pulito e ripristina l'ultimo snapshot salvato con successo. Elimina le sessioni solo tramite Gestore sessioni MiniOS o `minios-session delete`; non rimuovere manualmente le directory delle sessioni.

## Restituzione dello spazio inutilizzato DynFileFS, DynBlk e VMDK

In Gestore sessioni, fai clic destro su una sessione DynFileFS, DynBlk o VMDK e scegli **Libera spazio...**. La finestra di dialogo funziona sia per una sessione supportata in esecuzione sia per una inattiva e riutilizza anche una sessione già montata tramite Gestore sessioni. Per una sessione in chiaro, MiniOS esegue FITRIM sul filesystem ext4 interno effettivo e poi chiede al backend di restituire lo spazio di supporto noto come libero. Le sessioni staccate vengono collegate temporaneamente e rilasciate solo dopo che il filesystem è stato smontato correttamente.

Il recupero DynFileFS richiede DynFileFS 4.6.0 o successivo. Se il pacchetto è stato aggiornato mentre un demone DynFileFS precedente resta attivo, riavvia con il backend aggiornato prima di recuperare quella sessione in esecuzione.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La casella di compattazione è **disattivata per impostazione predefinita**, anche su exFAT. Non è prevista una
compattazione automatica di fallback. Le sessioni cifrate recuperano solo lo spazio già
noto al backend; questa operazione non abilita il discard tramite LUKS né
rivela il pattern di allocazione. Errori del dispositivo e trim falliti interrompono l'operazione.

### Comandi driver di basso livello

Con il backend attuale DynBlk nativo o split VMDK, il discard di interi grain
rende riutilizzabile la loro allocazione. Su un filesystem ext4 di supporto, gli intervalli ritirati
possono anche essere automaticamente liberati (hole-punch). Su exFAT, la pulizia automatica tronca solo
le code di file completamente libere. **La pulizia automatica non sposta mai dati attivi.**

Usa `fstrim` sul filesystem delle modifiche montato (non sulla root combinata AUFS/OverlayFS
root) per segnalare i blocchi eliminati, poi `dynblk reclaim /dev/dynblkN --execute` per
la pulizia non distruttiva. Seleziona il device sessione effettivo, non un indice presunto.
Per richiedere manualmente una compattazione in-place intensiva in scrittura, aggiungi `--compact`.
Funziona senza convertire l'immagine o cambiare la dimensione del filesystem virtuale;
altri processi di lettura/scrittura possono essere eseguiti tra i passaggi di recupero. Non è un fallback automatico.
L'opzione `--scan-zeroes` legge i grain mappati e non è attiva per impostazione predefinita.

Questi comandi sono disponibili anche nella CLI DynBlk dell'initrd ricostruito. Nessuna
compattazione automatica all'avvio è attiva. Le sessioni cifrate mantengono la policy discard esistente; gli strumenti non abilitano silenziosamente il discard dm-crypt.
La policy resta invariata; gli strumenti non abilitano silenziosamente il passthrough discard di dm-crypt.
Le sessioni in sola lettura o `cache=unsafe`collegate non possono essere recuperate. Gli intervalli liberati
e le lunghezze troncate non corrispondono allo spazio libero misurato dal filesystem.

## Flussi di lavoro sessione VMDK

VMDK è una modalità sessione separata, non un nuovo codec di compressione. Creazione, attivazione,
ridimensionamento, esportazione/importazione, copia, clonazione e conversione utilizzano gli stessi comandi di Gestore sessioni
delle altre modalità container:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Gli archivi sessione contengono file logici e metadati, non un collegamento VMDK esterno arbitrario.
Le sessioni VMDK gestite usano il `volume.vmdk`descrittore canonico
e tutti i suoi `volume-sNNN.vmdk`file correlati. Non rinominare le parti né copiare un'immagine attiva
dietro al driver. Passare da DynBlk nativo a VMDK richiede una
copia/conversione esplicita; cambiare `session_mode` a mano non equivale a una conversione.

L'installer offre VMDK solo se supportato dal runtime e rifiuta immagini sorgente
i cui initrd copiati non hanno la capacità `vmdk-session-v1`. Aggiorna CLI,
driver, strumenti sessione e script di avvio insieme prima di creare sessioni VMDK.
