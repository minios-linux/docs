---
updated: 2026-09-16
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

| Modalità | Archiviazione | Vincoli principali | MiniOS livello LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Modifiche salvate direttamente nella directory della sessione | Richiede un filesystem scrivibile che preservi i metadati Linux e le operazioni che MiniOS rileva. La capacità segue lo spazio libero di supporto; `perchsize` non applicabile. | No |
| `dynfilefs` | ext4 espandibile `virtual.dat` supportato da file segmento format-400 | Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT. Il payload è leggero, ma l'indice di mappatura cresce in base alla capacità logica dichiarata. | Sì |
| `dynblk` | Filesystem ext4 thin su un dispositivo a blocchi kernel supportato da `volumeNNN.db` file | Richiede CLI DynBlk, modulo kernel e supporto initrd. La dimensione creata all'avvio è fino a 16 GiB per impostazione predefinita; il limite del formato è 512 GiB. La mappatura sparsa RAM viene gestita separatamente. | Sì |
| `raw` | Singolo `changes.img` file contenente ext4 | Capacità logica fissa con crescita solo esplicita. Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT; FAT32 è limitato a 4000 MiB. | Sì |
| `squashfs` | Snapshot compresso in `changes.sb`; la parte superiore scrivibile a runtime viene ricostruita in RAM | `perchsize` non applicabile. Gli snapshot esistenti possono essere ripristinati da supporti scrivibili compatibili, mentre il salvataggio esatto richiede un filesystem di staging compatibile POSIX. | No |

Raw, DynFileFS e DynBlk possono opzionalmente includere un livello di cifratura LUKS2. Il backend di archiviazione resta quello della modalità sessione e i metadati della sessione registrano la cifratura separatamente. DynFileFS e raw creati con `minios-session` hanno come valore predefinito 4000 MiB; DynBlk predefinito 16 GiB. I valori di dimensione sono allocati in MiB; `GB` e `TB` i suffissi convertono rispettivamente in 1000 e 1.000.000 MiB. Raw è limitato a 4000 MiB su FAT32, sia cifrato che non. I dati payload DynFileFS crescono su richiesta, ma il suo indice format-400 è dimensionato per la piena capacità logica e richiede circa 2 MiB di RAM più circa 2 MiB di spazio di archiviazione per GiB. La capacità DynBlk è thin e la sua mappatura a runtime è sparsa: le mappature dense costano circa 8 MiB/GiB, mentre la capacità virtuale inutilizzata non consuma chunk di mappatura. Il driver DynBlk seleziona automaticamente il proprio budget di mappatura a circa il 25% dello spazio RAM utilizzabile, con un massimo di 4096 MiB; MiniOS non modifica questa politica. Le scritture effettive restano comunque limitate dallo spazio libero del filesystem sottostante e dalle risorse del backend. Le operazioni di ridimensionamento del container possono solo aumentare una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Usa DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Usa DynBlk se desideri un vero dispositivo a blocchi kernel con file di supporto thin; il driver può mantenere diversi volumi DynBlk indipendenti collegati contemporaneamente e Session Manager utilizza il percorso del dispositivo restituito dal driver invece di assumere che `/dev/dynblk0` sia libero.
Usa raw quando è richiesta un'allocazione fissa, aggiungi LUKS2 se la sessione deve essere cifrata e usa SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e le modalità disponibili:

```bash
sudo minios-session info
sudo minios-session status
```

Nessuna sessione può essere creata su supporti di sola lettura. L'initrd può leggere e attivare uno snapshot SquashFS esistente archiviato su FAT, exFAT o NTFS scrivibili perché estrae lo snapshot in una ext4 temporanea superiore. La creazione o il salvataggio esatto di uno snapshot è diverso: il suo workspace di staging privato deve trovarsi su un filesystem POSIX adatto che preservi i metadati Linux e i whiteout dell'unione.

## Selezione di avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono voci di ripresa, nuova, selezione e non persistente. La descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione è in [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Usa il percorso legacy di ripresa best-effort. Prova il valore predefinito dei metadati ma non crea un sostituto se nessuno è utilizzabile. |
| `perchdir=resume` | Riprende il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare un nuovo sostituto compatibile. Questo è il comportamento attuale della voce di ripresa nel menu di avvio. |
| `perchdir=new` | Alloca una nuova sessione numerata. |
| `perchdir=ask` | Seleziona una sessione esistente o ne crea una durante l'avvio. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Utilizza una posizione di persistenza su un dispositivo, incluse le forme `/dev/...` e `label:...`gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `dynblk`, `raw`, o `squashfs`. |
| `perchencrypt=luks` | Cifra una nuova sessione Raw, DynFileFS o DynBlk con LUKS2. Le sessioni esistenti derivano la cifratura solo dai metadati. |
| `perchcomp=<codec>` | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk. La compressione è forzata a `none`quando DynBlk è avvolto in LUKS2. |
| `perchsize=<size>` | Imposta una nuova dimensione del container o una maggiore; i valori semplici sono allocati in MiB e `MB`, `GB`, e `TB`i suffissi sono accettati. |

Se non viene specificata alcuna modalità per una nuova sessione, l'avvio usa la modalità nativa. Su FAT32/NTFS/exFAT, la creazione nativa all'avvio ricade su DynFileFS. Un nuovo container raw predefinisce 4000 MiB. Le nuove sessioni di avvio DynFileFS e DynBlk senza `perchsize`usano fino a 16 GiB; se dopo la riserva di sicurezza rimane meno spazio di supporto, la dimensione automatica viene ridotta. DynFileFS tiene conto anche del suo overhead di indice e del limite RAM. La crescita esplicita di DynBlk è limitata a 512 GiB.
Le sessioni SquashFS possono essere acquisite dal sistema in esecuzione con il Gestore sessioni MiniOS o `minios-session create squashfs`. L'impostazione initrd crea solo i metadati di sessione di generazione zero e mantiene il layer superiore scrivibile in RAM. Il sistema in esecuzione crea il primo `changes.sb`snapshot su richiesta o allo spegnimento.

Durante la ripresa, MiniOS controlla la versione registrata, l'edizione, il filesystem union e la modalità. Il comando letterale `perchdir=resume`può creare una nuova sessione invece di usare un predefinito assente o incompatibile. L'uso di `perch`, la selezione numerica diretta e altre richieste legacy di ripresa non creano automaticamente quel sostituto.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile. Se la selezione o l'attivazione fallisce comunque, l'avvio prosegue normalmente con un layer superiore RAM e un avviso di persistenza.

Lo store delle sessioni ha questa forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf`registra gli ID predefiniti e in esecuzione e, per ogni sessione, modalità, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione di avvio, non prova dello stato runtime attuale. Non modificarlo né spostare i dati delle sessioni numerate mentre una sessione è montata; usa il Gestore sessioni MiniOS o `minios-session`.

## Sessioni attive ed eseguite

Questi termini descrivono stati differenti:

- La **attiva** è la sessione predefinita selezionata per il prossimo avvio.
- Concettualmente, la **in esecuzione** è la sessione il cui layer scrivibile fornisce effettivamente la persistenza all'avvio corrente.

Il campo di persistenza `running=` registra questa relazione prevista. Un arresto anomalo, un errore nella costruzione dell'union, una copia dello store o uno spegnimento interrotto possono lasciarlo obsoleto anche se l'avvio corrente sta usando RAM o un'altra sessione. Operazioni come il salvataggio SquashFS richiedono quindi lo stato corrente protetto dell'avvio, legato al boot-ID, e l'upper montato verificato dall'initrd; non si affidano solo a `running=` da solo. Vedi [Stato attivo, in esecuzione e di avvio corrente](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Attivare una sessione modifica il prossimo avvio ma non cambia il filesystem union corrente:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sessione attiva non può essere eliminata o convertita direttamente. Una sessione in esecuzione normalmente non può essere eliminata, esportata, copiata, ridimensionata o convertita. Anche la pulizia protegge entrambi gli ID.

## Riferimento comandi

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
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create`senza modalità seleziona nativa. La creazione SquashFS acquisisce le modifiche attive correnti e non ha dimensione fissa. La policy di salvataggio allo spegnimento predefinita è `shutdown`; il salvataggio periodico è disattivato per impostazione predefinita.

Salva e configura una sessione SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gli intervalli periodici validi sono `30`, `60`, `120`, `240`, e `480`minuti; `0`disattiva il salvataggio periodico. Le impostazioni di spegnimento e periodiche sono indipendenti.

Esporta e importa `.tar.zst`archivi:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Solo `.tar.zst`le importazioni sono accettate. I percorsi e i membri dell'archivio vengono validati e l'estrazione è limitata. `--auto-convert`sceglie una modalità compatibile per il filesystem corrente. `--force-mode <mode>`seleziona esplicitamente una modalità disponibile. Esportazione, copia e conversione non sono supportate per le sessioni SquashFS; salva lo snapshot e copia invece l'intera directory della sessione inattiva.

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

`copy`è una copia logica del filesystem e assegna sempre un nuovo ID sessione. Può cambiare backend, capacità o cifratura e crea nuove identità ext4 e LUKS.`clone`copia fisicamente un backend staccato e mantiene il suo header LUKS, le keyslot, UUID LUKS e UUID ext4.`convert`sostituisce la sorgente per impostazione predefinita; usa `--new-session`per mantenere la sorgente. Una dimensione è rilevante solo per un container di destinazione.

Crescita, eliminazione o pulizia delle sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Il ridimensionamento supporta sessioni DynFileFS, DynBlk e raw, incluse le forme cifrate, e richiede una dimensione superiore a quella attuale. Il ridimensionamento DynBlk espande prima il dispositivo a blocchi virtuale e poi il filesystem ext4; non prealloca la nuova capacità virtuale. La pulizia predefinita riguarda le sessioni più vecchie di 30 giorni.

Tutti i comandi accettano `--json`, e si può selezionare uno store sessioni diverso con `--sessions-dir PATH`:

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

## Backup e sessioni fallite

Per sessioni native, DynFileFS, DynBlk e raw, comprese le forme cifrate, utilizzare `export`per backup logici invece di copiare una directory di sessione montata. Conservare l'archivio risultante su un altro dispositivo e verificare che possa essere importato prima di farvi affidamento. L'importazione crea sempre una nuova sessione numerata; attivarla esplicitamente quando è pronta all'uso.
Per procedure di backup SquashFS e dell'intero dispositivo, vedere [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se una sessione fallisce dopo il riempimento dello storage, un'interruzione di scrittura o la creazione ripetuta di sessioni vuote, interrompere le modifiche allo storage interessato. Esportare prima una sessione non attiva leggibile quando possibile, poi seguire [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

Iniziare la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All'avvio, i filesystem dei container vengono controllati prima dell'attivazione in scrittura. Errori gravi nel controllo del filesystem preservano il container per il recupero invece di montarlo in scrittura. SquashFS rileva uno stato precedente non pulito e ripristina l'ultimo snapshot salvato con successo. Eliminare le sessioni solo tramite il Gestore sessioni MiniOS o `minios-session delete`; non rimuovere manualmente le directory delle sessioni.
