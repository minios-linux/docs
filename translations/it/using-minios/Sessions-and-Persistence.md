---
updated: 2026-08-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sessioni e persistenza

Le sessioni MiniOS mantengono le modifiche apportate al sistema live anche dopo il riavvio. Ogni sessione è una directory numerata all'interno di `minios/changes/`; i moduli MiniOS in sola lettura restano invariati e la sessione selezionata fornisce il layer scrivibile del filesystem union.

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
| `raw` | `changes.img` a dimensione fissa contenente ext4 | Funziona su filesystem POSIX scrivibili, FAT32, NTFS ed exFAT. |
| `luks` | `changes.luks` cifrato con LUKS2 contenente ext4 | Richiede `cryptsetup`, supporto loop e il hook LUKS initrd MiniOS. |
| `squashfs` | Snapshot compresso in `changes.sb` | Il salvataggio richiede un filesystem di persistenza POSIX che possa preservare link, proprietà, modalità, xattrs, ACL, capacità e whiteouts. |

`dynfilefs`, `raw` e `luks` creati con `minios-session` hanno come valore predefinito 4000 MiB. I valori di dimensione vengono allocati in MiB; i suffissi `GB` e `TB` convertono rispettivamente in 1000 e 1.000.000 MiB. Il Gestore sessioni MiniOS limita i file raw e LUKS a 4000 MiB su FAT32. Non fare affidamento su questo come garanzia generale dell’initrd: una richiesta di avvio raw sovradimensionata può arrivare all’allocazione e fallire invece di essere ridotta. Le operazioni di ridimensionamento del contenitore possono solo aumentare la dimensione di una sessione; la riduzione non è supportata.

La modalità nativa è la scelta più semplice e veloce su un filesystem compatibile.
Usa DynFileFS quando il filesystem di persistenza non può rappresentare i metadati Linux.
Usa raw quando è richiesta un’allocazione fissa, LUKS quando la sessione deve essere cifrata e SquashFS per uno snapshot compresso esatto.

Esegui i seguenti comandi per ispezionare il filesystem di persistenza effettivo e le modalità disponibili su di esso:

```bash
sudo minios-session info
sudo minios-session status
```

Non è possibile creare sessioni su supporti in sola lettura. L’initrd può leggere e attivare uno snapshot SquashFS esistente memorizzato su FAT, exFAT o NTFS scrivibili perché estrae lo snapshot in un upper ext4 temporaneo. La creazione o il salvataggio esatto di uno snapshot è diverso: il suo workspace privato di staging deve trovarsi su un filesystem POSIX idoneo che preservi i metadati Linux e i whiteouts dell’union.

## Selezione di avvio

Qualsiasi parametro di persistenza riconosciuto abilita la gestione della persistenza. I menu di avvio MiniOS normalmente offrono voci per riprendere, nuova sessione, selezione e modalità non persistente. La descrizione canonica di selettore, compatibilità, fallback e semantica di attivazione è [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Parametro | Significato |
|-----------|---------|
| `perch` | Utilizza il percorso legacy best-effort per la ripresa. Prova il valore predefinito dei metadati ma non crea una sostituzione se nessuno è utilizzabile. |
| `perchdir=resume` | Riprende il valore predefinito dei metadati e, se assente o incompatibile, consente all'initrd di creare una nuova sostituzione compatibile. Questo è il comportamento attuale della voce di ripresa nel menu di avvio. |
| `perchdir=new` | Crea una nuova sessione numerata. |
| `perchdir=ask` | Seleziona una sessione esistente o ne crea una durante l'avvio. |
| `perchdir=<id>` | Seleziona direttamente quella sessione numerata. |
| `perchdir=<device/path>` | Utilizza una posizione di persistenza su un dispositivo, inclusi `/dev/...` e `label:...` formati gestiti dall'initrd. |
| `perchmode=<mode>` | Imposta `native`, `dynfilefs`, `raw`, `luks`, o `squashfs`. |
| `perchsize=<size>` | Imposta una nuova dimensione del contenitore o una dimensione maggiore; i valori semplici sono allocati in MiB e `MB`, `GB`, e `TB` sono accettati come suffissi. |

Se non viene specificata alcuna modalità per una nuova sessione, l'avvio utilizza la modalità nativa. Su FAT32/NTFS/exFAT, la creazione nativa ricade su DynFileFS. Un nuovo contenitore di avvio raw o LUKS predefinito è di 4000 MiB; una nuova sessione di avvio DynFileFS senza `perchsize` viene dimensionata in base allo spazio disponibile mantenendo una riserva di sicurezza.
Le sessioni SquashFS vengono acquisite dal sistema in esecuzione tramite il Gestore sessioni MiniOS o `minios-session create squashfs`; `perchdir=new perchmode=squashfs` non crea uno snapshot nell'initrd.

Durante la ripresa, MiniOS verifica la versione registrata, l'edizione, il filesystem union e la modalità. Il comando letterale `perchdir=resume` può creare una nuova sessione invece di usare un valore predefinito assente o incompatibile. La selezione numerica diretta, `perch`, e altre richieste legacy di ripresa non creano automaticamente quella sostituzione.
La selezione interattiva mostra un avviso prima di consentire una sessione incompatibile. Se la selezione o l'attivazione fallisce comunque, l'avvio prosegue normalmente con un upper RAM e un avviso di persistenza.

L'archivio delle sessioni ha questa struttura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra gli ID predefiniti e in esecuzione e, per ogni sessione, modalità, versione, edizione, filesystem union, dimensione, stato e impostazioni specifiche della modalità.
Si tratta di metadati persistenti scritti dall'implementazione di avvio, ma non costituiscono da soli una prova dello stato runtime attuale. Non modificarli né spostare i dati delle sessioni numerate mentre una sessione è montata; utilizza il Gestore sessioni MiniOS o `minios-session`.

## Session attive e in esecuzione

Questi termini descrivono stati differenti:

- La **sessione attiva** è quella selezionata di default per il prossimo avvio.
- Concettualmente, la **sessione in esecuzione** è la sessione il cui layer scrivibile fornisce effettivamente la persistenza all’avvio corrente.

Il campo persistente `running=` registra questa relazione prevista. Un arresto anomalo, un errore nella creazione dell’unione, una copia dell’archivio o uno spegnimento interrotto possono lasciarlo obsoleto anche se l’avvio corrente sta usando RAM o un’altra sessione. Operazioni come il salvataggio SquashFS richiedono quindi lo stato protetto dell’initrd, legato al boot-ID e all’avvio corrente verificato con upper montato; non si affidano solo a `running=` . Consulta [Stato attivo, in esecuzione e avvio corrente](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

L’attivazione di una sessione modifica il prossimo avvio ma non cambia il filesystem union attualmente in uso:

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

`create` senza modalità seleziona nativa. La creazione SquashFS acquisisce le modifiche live correnti e non ha una dimensione fissa. La sua policy di salvataggio allo spegnimento predefinita è `shutdown`; il salvataggio periodico è disattivato di default.

Salva e configura una sessione SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
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
```

Sono accettate solo importazioni `.tar.zst`. I percorsi e i membri dell'archivio vengono validati e l'estrazione è limitata. `--auto-convert` sceglie una modalità compatibile per il filesystem corrente. `--force-mode <mode>` seleziona esplicitamente una modalità disponibile. Esportazione, copia e conversione non sono supportate per le sessioni SquashFS; salva lo snapshot e copia invece l'intera directory della sessione inattiva.

Copia o converti una sessione:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` assegna sempre un nuovo ID sessione. `convert` per impostazione predefinita sostituisce la sorgente; usa `--new-session` per mantenere la sorgente. La dimensione è rilevante solo per un contenitore di destinazione.

Espandi, elimina o pulisci le sessioni:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Il ridimensionamento supporta sessioni DynFileFS, raw e LUKS e richiede una dimensione superiore a quella attuale. La pulizia predefinita riguarda le sessioni più vecchie di 30 giorni.

Tutti i comandi accettano `--json`, e si può selezionare un archivio sessioni diverso con `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamento di salvataggio SquashFS

Una sessione SquashFS viene estratta in RAM per il layer scrivibile in esecuzione. Il salvataggio ricostruisce e valida uno snapshot esatto, quindi sostituisce atomicamente `changes.sb`.
Non viene mantenuta alcuna generazione di rollback. "Salva ora" è disponibile dall'icona di sistema, dal Gestore sessioni MiniOS o `minios-session save` indipendentemente dalla policy automatica.

Il salvataggio allo spegnimento è implementato dal trigger di spegnimento core MiniOS e dal backend `minios-squashfs-save`, quindi non dipende dal Gestore sessioni MiniOS aperto o installato. Il salvataggio periodico viene controllato ogni 30 minuti tramite un timer systemd o un worker SysV, entrambi richiamano lo stesso backend di autosalvataggio. La ricostruzione dello snapshot utilizza CPU e scrive l'intero snapshot; sono consigliati intervalli di un'ora o più.

Durante il funzionamento con RAM come backend di SquashFS, uno snapshot SquashFS appena acquisito e attivato può prendere possesso del target di salvataggio in esecuzione. Dopo questo passaggio, il vecchio snapshot in esecuzione può essere rimosso senza riavviare:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Questa eccezione si applica solo a un passaggio valido dell'attuale avvio SquashFS. Altri metodi di persistenza in esecuzione restano protetti dalla cancellazione.

## Crittografia

La modalità LUKS memorizza un filesystem ext4 direttamente in un file LUKS2 `changes.luks`; non c'è tabella delle partizioni né un contenitore DynFileFS annidato. Le opzioni LUKS sono disponibili solo quando sono presenti `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` e `losetup`.

La creazione interattiva LUKS richiede l'inserimento della passphrase due volte. Le operazioni che leggono o creano dati LUKS possono leggerli dallo standard input con `--password-stdin`.
Le passphrase non vengono inserite negli argomenti dei comandi né nei metadati della sessione. All'avvio, l'initrd richiede la passphrase sulla console e non passa alla persistenza non cifrata se l'attivazione fallisce.

Le esportazioni LUKS contengono i file logici della sessione decifrati, non `changes.luks`.
L'importazione o la conversione in LUKS crea un nuovo contenitore cifrato.

## Backup e sessioni non riuscite

Per sessioni native, DynFileFS, raw e LUKS, utilizza `export` per i backup invece di copiare una directory di sessione montata. Conserva l'archivio risultante su un altro dispositivo e verifica che possa essere importato prima di farvi affidamento. L'importazione crea sempre una nuova sessione numerata; attivala esplicitamente quando è pronta all'uso.
Per le procedure di backup SquashFS e dell'intero dispositivo, vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se una sessione fallisce dopo che lo spazio di archiviazione si è esaurito, una scrittura viene interrotta o vengono create ripetutamente sessioni vuote, interrompi la modifica dello storage interessato. Esporta prima una sessione non in esecuzione leggibile quando possibile, poi segui [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

Inizia la diagnosi senza modificare i dati della sessione:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

All'avvio, i filesystem dei contenitori vengono controllati prima dell'attivazione in scrittura. Gravi errori di controllo del filesystem preservano il contenitore per il recupero invece di montarlo in scrittura. SquashFS rileva uno stato precedente non pulito e ripristina l'ultimo snapshot salvato con successo. Elimina le sessioni solo tramite il Gestore sessioni MiniOS o `minios-session delete`; non rimuovere manualmente le directory delle sessioni.
