---
updated: 2026-08-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Gestione delle sessioni in MiniOS

Le sessioni di MiniOS mantengono le modifiche apportate al sistema live tra un riavvio e l'altro. Ogni
sessione è una directory numerata sotto `minios/changes/`; i moduli MiniOS in sola lettura
rimangono invariati e la sessione selezionata fornisce il layer scrivibile del filesystem union.

Utilizza Session Manager da un sistema MiniOS in esecuzione:

```bash
minios-session-manager
```

Lo strumento equivalente da riga di comando è `minios-session`. I comandi che modificano
richiedono privilegi amministrativi, quindi negli esempi seguenti viene utilizzato `sudo`.

## Modalità di sessione

| Modalità | Archiviazione | Principali vincoli |
|------|---------|------------------|
| `native` | Le modifiche vengono salvate direttamente nella directory della sessione | Richiede un filesystem POSIX scrivibile come ext2/3/4, Btrfs, XFS, F2FS o ReiserFS. |
| `dynfilefs` | Contenitore ext4 espandibile suddiviso in file di supporto | Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT. Richiede il backend DynFileFS. |
| `raw` | `changes.img` a dimensione fissa contenente ext4 | Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT. |
| `luks` | `changes.luks` cifrato con LUKS2 contenente ext4 | Richiede `cryptsetup`, supporto loop e il hook LUKS dell'initrd MiniOS. |
| `squashfs` | Snapshot compresso in `changes.sb` | Il salvataggio richiede un filesystem di persistenza POSIX in grado di preservare link, proprietà, permessi, xattr, ACL, capability e whiteout. |

`dynfilefs`, `raw` e `luks` creati con `minios-session` hanno come valore predefinito 4000
MiB. I valori di dimensione sono allocati in MiB; i suffissi `GB` e `TB` convertono rispettivamente in 1000
e 1.000.000 MiB. Il Session Manager limita i file raw e LUKS a 4000 MiB su
FAT32. Non fare affidamento su questo come garanzia generale dell'initrd: una richiesta di boot raw sovradimensionata può arrivare fino all'allocazione
e fallire invece di essere ridotta. Le operazioni di ridimensionamento del contenitore possono solo aumentare la dimensione
di una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Utilizzare DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Utilizzare raw quando è richiesta un'allocazione fissa, LUKS quando la sessione deve essere
cifrata e SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e
le modalità disponibili su di esso:

```bash
sudo minios-session info
sudo minios-session status
```

Non è possibile creare sessioni su supporti di sola lettura. L'initrd può leggere e attivare
uno snapshot SquashFS esistente memorizzato su FAT, exFAT o NTFS scrivibili perché
estrae lo snapshot in una ext4 temporanea superiore. Creare o salvare esattamente uno
snapshot è diverso: il suo spazio di lavoro privato deve trovarsi su un filesystem
POSIX adatto che preservi i metadati Linux e i whiteout dell'union.

## Selezione del boot

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di boot di MiniOS
di solito offrono voci per ripristino, nuova sessione, selezione e modalità non persistente. La
descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione
si trova in [Persistenza Initrd](./Initrd-Persistence.md).

| Parametro | Significato |
|-----------|---------|
| `perch` | Usa il percorso legacy best-effort per il ripristino. Tenta di usare il valore predefinito dei metadati ma non crea un sostituto se nessuno è utilizzabile. |
| `perchdir=resume` | Ripristina il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare un nuovo sostituto compatibile. Questo è il comportamento attuale del menu di boot per il ripristino. |
| `perchdir=new` | Alloca una nuova sessione numerata. |
| `perchdir=ask` | Seleziona una sessione esistente o ne crea una durante il boot. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Usa una posizione di persistenza su un dispositivo, incluse le forme `/dev/...` e `label:...` gestite dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `raw`, `luks` o `squashfs`. |
| `perchsize=<size>` | Imposta una nuova dimensione del contenitore o una dimensione maggiore; i valori semplici sono allocati in MiB e sono accettati i suffissi `MB`, `GB` e `TB`. |

Se non viene specificata alcuna modalità per una nuova sessione, il boot utilizza la modalità nativa. Su
FAT32/NTFS/exFAT, la creazione nativa in fase di boot ricade su DynFileFS. Un nuovo contenitore raw o LUKS in fase di boot ha come valore predefinito 4000 MiB; una nuova sessione DynFileFS senza
`perchsize` viene dimensionata in base allo spazio disponibile mantenendo una riserva di sicurezza.
Le sessioni SquashFS vengono acquisite dal sistema in esecuzione tramite Session Manager o
`minios-session create squashfs`; `perchdir=new perchmode=squashfs` non
crea uno snapshot nell'initrd.

Durante il ripristino, MiniOS controlla la versione registrata, l'edizione, il filesystem union
e la modalità. Il comando letterale `perchdir=resume` può creare una nuova sessione invece di usare un
valore predefinito assente o incompatibile. Il comando `perch` senza parametri, la selezione numerica diretta e
altre richieste legacy di ripristino non creano automaticamente un sostituto.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile.
Se la selezione o l'attivazione falliscono comunque, il boot prosegue normalmente con una
superiore in RAM e un avviso sulla persistenza.

Lo store delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefiniti e in esecuzione e, per ogni sessione, modalità,
versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione del boot e non costituiscono
di per sé prova dello stato di runtime attuale. Non modificarlo né spostare i dati delle sessioni numerate
mentre una sessione è montata; utilizzare Session Manager o `minios-session`.

## Sessioni attive e in esecuzione

Questi termini descrivono stati differenti:

- La sessione **attiva** è quella selezionata di default per il prossimo avvio.
- Concettualmente, la sessione **in esecuzione** è quella il cui layer scrivibile
  fornisce effettivamente la persistenza all’avvio corrente.

Il campo persistente `running=` registra questa relazione prevista. Un crash,
una costruzione dell’unione fallita, una copia dello store o uno spegnimento interrotto possono lasciarlo
obsoleto anche quando l’avvio corrente utilizza la RAM o un’altra sessione. Operazioni
come il salvataggio SquashFS richiedono quindi lo stato corrente protetto dell’initrd, legato all’ID di boot,
e l’upper montato e verificato; non si affidano solo a `running=`.
Vedi [Stato attivo, in esecuzione e current-boot](./Initrd-Persistence.md).

Attivare una sessione modifica il prossimo avvio ma non cambia l’attuale
filesystem union:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La sessione attiva non può essere eliminata o convertita direttamente. Una sessione in esecuzione
di norma non può essere eliminata, esportata, copiata, ridimensionata o convertita. Anche la pulizia
protegge entrambi gli ID.

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

`create` senza una modalità seleziona quella nativa. La creazione di SquashFS cattura le modifiche attive correnti e non ha una dimensione fissa. La politica di spegnimento predefinita è `shutdown`;
il salvataggio periodico è disattivato per impostazione predefinita.

Salva e configura una sessione SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gli intervalli periodici validi sono `30`, `60`, `120`, `240` e `480` minuti;
`0` disabilita il salvataggio periodico. Le impostazioni di spegnimento e salvataggio periodico sono indipendenti.

Esporta e importa archivi `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Sono accettate solo importazioni `.tar.zst`. I percorsi e i membri dell'archivio vengono validati e l'estrazione è limitata. `--auto-convert` sceglie una modalità compatibile per il filesystem corrente. `--force-mode <mode>` seleziona esplicitamente una modalità disponibile. Esportazione, copia e conversione non sono supportate per le sessioni SquashFS;
salva lo snapshot e copia invece l'intera directory della sessione inattiva.

Copia o converti una sessione:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` assegna sempre un nuovo ID sessione. `convert` sostituisce la sorgente per impostazione predefinita; usa `--new-session` per preservare la sorgente. Una dimensione è rilevante solo per un target container.

Aumenta, elimina o pulisci le sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

La ridimensionamento supporta sessioni DynFileFS, raw e LUKS e richiede una dimensione maggiore di quella attuale. La pulizia predefinita riguarda le sessioni più vecchie di 30 giorni.

Tutti i comandi accettano `--json`, e un archivio sessioni diverso può essere selezionato con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamento di salvataggio SquashFS

Una sessione SquashFS viene decompressa in RAM per il layer scrivibile in esecuzione. Il salvataggio
ricostruisce e valida uno snapshot esatto, quindi sostituisce in modo atomico `changes.sb`.
Non viene mantenuta alcuna generazione di rollback. "Salva ora" è disponibile dall'icona di sistema,
Session Manager o `minios-session save` indipendentemente dalla politica automatica.

Il salvataggio allo spegnimento è implementato dal trigger di spegnimento principale di MiniOS e dal
backend `minios-squashfs-save`, quindi non dipende dal fatto che Session Manager sia
aperto o installato. Il salvataggio periodico viene controllato ogni 30 minuti da un timer systemd o da un worker SysV, entrambi richiamano lo stesso backend di autosalvataggio. La ricostruzione
dello snapshot consuma CPU e scrive l'intero snapshot; sono consigliati intervalli di un'ora o superiori.

Durante l'uso di SquashFS in RAM, uno snapshot SquashFS appena acquisito e attivato può prendere il controllo del target di salvataggio in esecuzione. Dopo questo passaggio, il
vecchio snapshot in esecuzione può essere rimosso senza riavviare:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Questa eccezione si applica solo a un passaggio valido di SquashFS nell'avvio corrente. Le altre
modalità di persistenza in esecuzione restano protette dall'eliminazione.

## Crittografia

La modalità LUKS salva un filesystem ext4 direttamente in un file `changes.luks` LUKS2;
non è presente una tabella delle partizioni né un contenitore DynFileFS annidato. Le scelte LUKS sono
disponibili solo quando sono presenti `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`
e `losetup`.

La creazione interattiva di LUKS richiede l'inserimento della passphrase due volte. Le operazioni che leggono
o creano dati LUKS possono leggerli dallo standard input con `--password-stdin`.
Le passphrase non vengono inserite negli argomenti dei comandi né nei metadati della sessione. All'avvio,
l'initrd richiede la passphrase sulla console e non passa alla persistenza non cifrata se l'attivazione fallisce.

Le esportazioni LUKS contengono i file logici della sessione decifrati, non `changes.luks`.
L'importazione o la conversione in LUKS crea un nuovo contenitore cifrato.

## Backup e ripristino

Per le sessioni native, DynFileFS, raw e LUKS, utilizza `export` per i backup invece di copiare una directory di sessione montata. Conserva l'archivio risultante su un altro dispositivo e verifica che possa essere elencato o importato prima di farvi affidamento. L'importazione crea sempre una nuova sessione numerata; attivala esplicitamente quando è pronta all'uso. Per le procedure di backup di SquashFS e dell'intero dispositivo, vedi [Backup e ripristino](/administration/Backup-Recovery.md).

Per il ripristino dopo un dispositivo di archiviazione completo, una scrittura interrotta o la creazione ripetuta di sessioni vuote, segui la guida dedicata
[Guida al ripristino DynFileFS e dynblk](./DynFileFS-Recovery.md).

Avvia la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All'avvio, i filesystem dei container vengono controllati prima dell'attivazione in scrittura. Gravi errori di controllo del filesystem preservano il container per il ripristino invece di montarlo in scrittura. SquashFS rileva uno stato precedente non pulito e ripristina l'ultimo snapshot salvato con successo. Elimina le sessioni solo tramite Session Manager o `minios-session delete`; non rimuovere manualmente le directory delle sessioni.
