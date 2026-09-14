---
updated: 2026-09-13
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

| Modalità | Archiviazione | Principali vincoli |
|------|---------|------------------|
| `native` | Le modifiche vengono salvate direttamente nella directory della sessione | Richiede un filesystem POSIX scrivibile come ext2/3/4, Btrfs, XFS, F2FS o ReiserFS. |
| `dynfilefs` | Contenitore ext4 espandibile suddiviso in file di supporto | Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT. Richiede il backend DynFileFS. |
| `dynblk` | Filesystem ext4 thin su un dispositivo a blocchi del kernel supportato da `volumeNNN.db` file | Richiede il CLI dynblk, il modulo kernel e la funzionalità initrd. La dimensione virtuale predefinita è 16 GiB e il limite massimo è 512 GiB. |
| `raw` | File `changes.img` a dimensione fissa contenente ext4 | Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT. |
| `luks` | File LUKS2 cifrato `changes.luks` contenente ext4 | Richiede `cryptsetup`, supporto loop e il hook LUKS initrd MiniOS. |
| `squashfs` | Snapshot compresso in `changes.sb` | Il salvataggio richiede un filesystem di persistenza POSIX che possa preservare link, proprietà, permessi, xattrs, ACL, capacità e whiteout. |

`dynfilefs`, `raw`, e `luks` creati con `minios-session` hanno dimensione predefinita di 4000 MiB; `dynblk` predefinito a 16 GiB. Le dimensioni sono allocate in MiB; `GB` e `TB` i suffissi convertono in 1000 e 1.000.000 MiB. Il Gestore sessioni MiniOS limita i file raw e LUKS a 4000 MiB su FAT32. La capacità dynblk è virtuale e thin, non preallocata, ma le scritture effettive sono comunque limitate dallo spazio libero del filesystem sottostante e dalle risorse disponibili per dynblk. Le operazioni di ridimensionamento del contenitore possono solo aumentare la dimensione di una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Utilizza DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Usa dynblk se desideri un vero dispositivo a blocchi del kernel con file thin di supporto; il driver può mantenere più volumi dynblk indipendenti collegati contemporaneamente e il Gestore sessioni utilizza il percorso del dispositivo restituito dal driver invece di assumere che `/dev/dynblk0` sia libero.
Usa raw quando è richiesta un'allocazione fissa, LUKS quando la sessione deve essere cifrata e SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e le modalità disponibili su di esso:

```bash
sudo minios-session info
sudo minios-session status
```

Nessuna sessione può essere creata su supporti in sola lettura. L'initrd può leggere e attivare uno snapshot SquashFS esistente memorizzato su FAT, exFAT o NTFS scrivibili, poiché estrae lo snapshot in una ext4 upper temporanea. La creazione o il salvataggio esatto di uno snapshot è diverso: il suo spazio di lavoro privato deve trovarsi su un filesystem POSIX adatto che preservi i metadati Linux e i whiteout dell'union.

## Selezione avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono voci per ripristino, nuovo, selezione e modalità non persistente. La descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione è [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Utilizza il percorso legacy best-effort per il ripristino. Prova il valore predefinito dei metadati ma non crea una sostituzione se non è disponibile nulla di utilizzabile. |
| `perchdir=resume` | Ripristina il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare una nuova sostituzione compatibile. Questo è il comportamento attuale del ripristino dal menu di avvio. |
| `perchdir=new` | Crea una nuova sessione numerata. |
| `perchdir=ask` | Seleziona una sessione esistente o creane una durante l'avvio. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Utilizza una posizione di persistenza su un dispositivo, incluse `/dev/...` e `label:...` le forme gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, o `squashfs`. |
| `perchsize=<size>` | Imposta una nuova dimensione del contenitore o una dimensione maggiore; i valori semplici sono allocati in MiB e `MB`, `GB`, e `TB` sono accettati i suffissi. |

Se non viene specificata alcuna modalità per una nuova sessione, l'avvio utilizza la modalità nativa. Su FAT32/NTFS/exFAT, la creazione nativa ricade su DynFileFS. Un nuovo contenitore di avvio raw o LUKS predefinisce 4000 MiB; una nuova sessione di avvio DynFileFS senza `perchsize` viene dimensionata in base allo spazio disponibile mantenendo una riserva di sicurezza. Una nuova sessione di avvio dynblk senza `perchsize` utilizza il valore predefinito del driver di 16 GiB; la crescita esplicita di dynblk è limitata a 512 GiB.
Le sessioni SquashFS vengono acquisite dal sistema in esecuzione tramite Gestore sessioni MiniOS o `minios-session create squashfs`; `perchdir=new perchmode=squashfs` non crea uno snapshot nell'initrd.

Durante il ripristino, MiniOS controlla la versione registrata, l'edizione, il filesystem union e la modalità. Il comando letterale `perchdir=resume` può creare una nuova sessione invece di usare un valore predefinito assente o incompatibile. L'utilizzo semplice di `perch`, la selezione numerica diretta e altre richieste legacy di ripristino non creano automaticamente una sostituzione.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile. Se la selezione o l'attivazione fallisce comunque, l'avvio prosegue normalmente con un upper RAM e un avviso di persistenza.

Lo store delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefiniti e in uso, la modalità per sessione, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione di avvio, non è di per sé prova dello stato runtime attuale. Non modificarlo né spostare dati di sessioni numerate mentre una sessione è montata; usa Gestore sessioni MiniOS o `minios-session`.

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
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` senza una modalità seleziona quella nativa. La creazione di SquashFS cattura le modifiche attive e non ha una dimensione fissa. La sua politica di spegnimento predefinita è `shutdown`; il salvataggio periodico è disattivato di default.

Salva e configura una sessione SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gli intervalli periodici validi sono `30`, `60`, `120`, `240`, e `480` minuti; `0` disattiva il salvataggio periodico. Le impostazioni di spegnimento e salvataggio periodico sono indipendenti.

Esporta e importa `.tar.zst` archivi:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
```

Solo `.tar.zst` sono accettate importazioni. I percorsi e i membri degli archivi vengono verificati e l'estrazione è limitata.`--auto-convert` seleziona una modalità compatibile con il file system attuale.`--force-mode <mode>` seleziona esplicitamente una modalità disponibile. Esportazione, copia e conversione non sono supportate per le sessioni SquashFS; salva lo snapshot e copia invece l'intera directory della sessione inattiva.

Copia o converti una sessione:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` assegna sempre un nuovo ID sessione.`convert` sostituisce la sorgente per impostazione predefinita; usa `--new-session` per mantenere la sorgente. La dimensione è rilevante solo per un target container.

Espandi, elimina o pulisci sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

La ridimensionamento è supportato per le sessioni DynFileFS, dynblk, raw e LUKS e richiede una dimensione superiore a quella attuale. Il ridimensionamento dynblk aumenta prima il dispositivo a blocchi virtuale e poi espande il filesystem ext4; non prealloca la nuova capacità virtuale. La pulizia riguarda di default le sessioni più vecchie di 30 giorni.

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

## Crittografia

La modalità LUKS memorizza un filesystem ext4 direttamente in un file LUKS2 `changes.luks`; non è presente alcuna tabella delle partizioni né un contenitore DynFileFS annidato. Le opzioni LUKS sono disponibili solo quando `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`, e `losetup` sono presenti.

La creazione interattiva di LUKS richiede l'inserimento della passphrase due volte. Le operazioni che leggono o creano dati LUKS possono leggerli dallo standard input con `--password-stdin`.
Le passphrase non vengono inserite negli argomenti dei comandi né nei metadati di sessione. All'avvio, l'initrd richiede la passphrase sulla console e non passa alla persistenza non crittografata se l'attivazione fallisce.

Le esportazioni LUKS contengono file di sessione logica decriptati, non `changes.luks`.
L'importazione o la conversione in LUKS crea un nuovo contenitore crittografato.

## Backup e sessioni non riuscite

Per sessioni native, DynFileFS, dynblk, raw e LUKS, utilizza `export` per i backup invece di copiare una directory di sessione montata. Conserva l’archivio risultante su un altro dispositivo e verifica che possa essere importato prima di farvi affidamento. L’importazione crea sempre una nuova sessione numerata; attivala esplicitamente quando è pronta all’uso.
Per le procedure di backup di SquashFS e di intero dispositivo, consulta [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se una sessione fallisce dopo che lo spazio di archiviazione si è esaurito, una scrittura viene interrotta o vengono create ripetutamente sessioni vuote, interrompi le modifiche allo storage interessato. Esporta prima una sessione leggibile e non in esecuzione quando possibile, poi segui [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

Inizia la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All’avvio, i filesystem dei contenitori vengono controllati prima dell’attivazione in scrittura. Errori gravi nel controllo del filesystem preservano il contenitore per il recupero invece di montarlo in scrittura. SquashFS rileva uno stato precedente non pulito e ripristina l’ultimo snapshot salvato con successo. Elimina le sessioni solo tramite Gestore sessioni MiniOS o `minios-session delete`; non rimuovere manualmente le directory delle sessioni.
