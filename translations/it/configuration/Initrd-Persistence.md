---
updated: 2026-08-26
---

# Persistenza initrd

MiniOS costruisce la root live a partire da moduli di sola lettura e uno strato superiore scrivibile. L'initrd decide se quello strato superiore sarà una sessione persistente numerata oppure una directory temporanea in RAM. Questa pagina descrive la decisione e il percorso di attivazione al boot. Per i controlli rivolti all'utente, consulta [Modalità di avvio](./Boot-Modes.md) e [Parametri di avvio](./Boot-Parameters.md).

## La persistenza è esplicita

L'initrd abilita la gestione della persistenza solo quando la riga di comando del kernel contiene uno di questi token riconosciuti:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

In assenza di questi token, anche se è presente solo un nome `perch...` non riconosciuto, MiniOS crea un nuovo strato superiore scrivibile in RAM. Le modifiche apportate durante quell'avvio vengono scartate allo spegnimento.

I selettori non sono tutti equivalenti:

| Selettore | Comportamento dell'initrd |
|---|---|
| `perch` | Tenta di riprendere il valore predefinito dei metadati. Non crea automaticamente una sessione quando nessuna è utilizzabile o quando i controlli di compatibilità falliscono. |
| `perchdir=resume` | Prova il valore predefinito dei metadati e può creare automaticamente un nuovo sostituto compatibile. Questo è il comportamento attuale del resume nel menu di avvio. |
| `perchdir=new` | Alloca una directory il cui ID numerico è uno superiore al massimo ID numerico esistente. Non riutilizza mai una directory esistente. |
| `perchdir=ask` | Propone sessioni esistenti e la possibilità di crearne una nuova. Una sessione esistente incompatibile richiede conferma. |
| `perchdir=NUMBER` | Usa quella directory se esiste. Se non esiste, la selezione può ricadere sul valore predefinito registrato nei metadati; non riserva il numero richiesto. |

Altri parametri di persistenza riconosciuti senza selettore entrano nello stesso percorso legacy di resume come `perch` semplice: richiedono la persistenza, ma non abilitano la creazione automatica. Se la selezione o l'attivazione non riescono a produrre uno strato superiore utilizzabile, l'avvio prosegue normalmente con lo strato superiore in RAM e viene pubblicato un avviso di errore.

## Archivio delle sessioni e posizione

L'archivio standard è la directory `changes` accanto ai dati di MiniOS, con directory di sessione numerate e metadati `session.conf` o `session.json`:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

L'archivio può invece essere selezionato come dispositivo più un percorso opzionale. Le forme accettate includono un percorso diretto `/dev/...`, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` e `askdisk:custom:path`. Il suffisso separato da due punti diventa un percorso sotto il dispositivo selezionato; la sintassi con slash dopo `askdisk` perde silenziosamente quel percorso personalizzato. Una sottodirectory selezionata viene montata in bind come archivio delle sessioni. MiniOS può anche rilevare una partizione di persistenza sullo stesso disco e l'archiviazione di persistenza supportata da Ventoy.

Prima della selezione della sessione, l'initrd deve montare la posizione in modalità scrittura e verificare di poter creare e rimuovere un marcatore nell'archivio. Un dispositivo a blocchi che non può essere aperto in scrittura, un mount in sola lettura, un percorso non disponibile o un test di scrittura fallito escludono la persistenza per quell'avvio. Le sessioni esistenti non sono considerate affidabili solo perché i loro file sono leggibili.

## Selezione e compatibilità

I metadati della sessione registrano la modalità di archiviazione e possono registrare la versione di MiniOS, l'edizione, il filesystem union e la dimensione del container. Il resume confronta la modalità, la versione, l'edizione e il union registrati con la modalità richiesta e il sistema attuale. I campi di compatibilità legacy mancanti non sono considerati incompatibilità.

Il comando `perchdir=resume` crea una nuova sessione numerata quando il valore predefinito è assente o quando una modalità, versione, edizione o union registrati risultano incompatibili. Il comando `perch` semplice, una selezione numerica diretta e altre richieste di resume legacy rifiutano la sostituzione automatica e proseguono in RAM dopo un errore di selezione. `perchdir=ask` mostra le informazioni di compatibilità e permette una forzatura esplicita. Una nuova sessione predefinisce la modalità `native` a meno che non sia stata richiesta un'altra modalità.

La modalità di archiviazione fa parte della compatibilità. Se la selezione arriva al backend dispatch, una modalità richiesta sconosciuta ricade su `native`, il cui probe può quindi selezionare DynFileFS su uno storage non adatto. Una sessione esistente con una modalità diversa registrata può fallire il controllo di compatibilità precedente; una richiesta di resume legacy prosegue quindi in RAM invece di arrivare a quel fallback.

## Riserva di spazio e dimensioni

MiniOS mantiene per impostazione predefinita 256 MiB liberi sul filesystem di persistenza. La riserva e i controlli dello spazio libero utilizzano blocchi filesystem da 1024 byte. `perchreserve` accetta un numero intero senza unità, è limitato a 4096 e ricade su 256 se mancante o non valido. Le nuove allocazioni e le richieste di crescita sono limitate affinché questa riserva rimanga libera. All'avvio viene inoltre segnalato quando lo spazio libero attuale è pari o inferiore alla riserva.

Le dimensioni dei container utilizzano conteggi interi allocati in MiB:

- Un numero semplice, `M` o `MB` indica MiB.
- `G` o `GB` moltiplica il numero per 1000 MiB.
- `T` o `TB` moltiplica il numero per 1.000.000 MiB.
- La richiesta logica massima è di 1.000.000 MiB, ulteriormente limitata dallo spazio disponibile dopo la riserva.
- Session Manager limita i file raw e LUKS a 4000 MiB su FAT32. Durante l'attivazione dell'initrd il limite viene applicato in modo affidabile a LUKS, mentre una richiesta raw sovradimensionata può arrivare all'allocazione e fallire invece di essere ridotta.
- Le nuove sessioni raw e LUKS predefiniscono 4000 MiB.
- Una nuova sessione DynFileFS creata dall'initrd predefinisce la capacità disponibile dopo la riserva, arrotondata per difetto al multiplo di 1000 MiB quando possibile.

La crescita dei container è best-effort e la riduzione non è supportata. `perchsize` non dimensiona le sessioni native o SquashFS. Session Manager utilizza il proprio valore predefinito di 4000 MiB per le nuove sessioni container; vedi [Gestione delle sessioni](./Session-Management.md).

## Attivazione dello storage

Tutte le modalità che hanno successo devono fornire lo strato superiore scrivibile atteso dal filesystem union selezionato. Un semplice mount del backend non costituisce autorità definitiva a runtime. Native, DynFileFS, raw e LUKS possono aggiornare i metadati della sessione persistente prima della validazione del union; SquashFS rimanda quel commit dei metadati. Lo stato protetto del boot corrente viene pubblicato solo dopo che il root union finale è confermato con lo strato superiore atteso.

### Native

La modalità Native esclude innanzitutto filesystem noti come non POSIX, come FAT, exFAT e NTFS. Successivamente sonda il comportamento reale del filesystem creando un file e un collegamento simbolico e verificando le modifiche ai permessi di esecuzione. Se il test ha esito positivo, la directory della sessione numerata viene montata in bind direttamente come area scrivibile.

Se il filesystem è noto come non adatto, o se il test POSIX fallisce, la modalità native ricade su DynFileFS. Un errore dopo l'attivazione native viene annullato; un nuovo candidato vuoto viene rimosso quando ciò è possibile in sicurezza.

### DynFileFS

DynFileFS, implementato dall'helper compatibile `dynblk`, memorizza un'unica immagine logica a blocchi in `changes.dat` più i suoi file di segmento numerati. L'helper deve montare con successo ed esporre `virtual.dat`; in caso contrario, l'attivazione fallisce invece di creare accidentalmente un file solo RAM con un nome che sembra persistente.

L'immagine logica contiene ext4. Le immagini esistenti vengono controllate prima del mount in scrittura; risultati del filesystem-check superiori allo stato "errori corretti" rifiutano la sessione e la preservano per il recupero. Il resize è solo in crescita, e il filesystem ext4 interno viene espanso quando possibile. Consulta [Recupero DynFileFS](./DynFileFS-Recovery.md) per dettagli su segmenti e riparazioni.

### Raw

La modalità Raw utilizza un'immagine ext4 `changes.img` fissa. Le nuove immagini vengono allocate e formattate prima dell'uso. Le immagini esistenti vengono controllate prima del mount, possono essere ingrandite su richiesta e l'ext4 viene espanso per utilizzare tutta l'immagine. Un controllo o mount fallito lascia il container disponibile per il recupero e prosegue l'avvio in RAM.

### LUKS

La modalità LUKS utilizza un contenitore LUKS2 `changes.luks` con ext4 direttamente al suo interno.
È disponibile solo quando l'initrd include il marker di supporto per la crittografia e gli strumenti necessari.
Durante la creazione viene richiesta una conferma corrispondente dell'input. Un contenitore esistente consente tre tentativi di sblocco sulla console di avvio.

L'initrd autentica prima di espandere un file cifrato esistente, poi controlla ed espande ext4 prima di montarlo. Se la creazione, lo sblocco, il controllo, il ridimensionamento o il montaggio falliscono, MiniOS ripristina la mappatura e prosegue in RAM. Non effettua mai il fallback su native, DynFileFS, raw o qualsiasi altra persistenza non cifrata.
Le passphrase non vengono memorizzate nei metadati di sessione né passate come argomenti di comando.
Consulta [Sicurezza](/administration/Security-Hardening.md).

### SquashFS

L'initrd può attivare solo una sessione SquashFS esistente; non può crearne una nuova `changes.sb`. L'attivazione valida metadati rigorosi e a valore singolo per lo snapshot, inclusi il digest, le dimensioni compresse e non compresse, il numero di elementi, il tipo di union e la policy di salvataggio. Controlla inoltre il tipo di file e la dimensione esatta, la RAM e lo swap disponibili, il digest SHA-256 prima e dopo l'estrazione e la compatibilità union attuale.

Lo snapshot viene estratto con gestione rigorosa degli errori e degli xattr in un'immagine ext4 temporanea e limitata in RAM. Per OverlayFS, quell'immagine contiene directory `changes` e `workdir` separate; per AUFS, la root è il ramo scrivibile. Metadati malformati, memoria insufficiente, cambiamenti di digest, errori di estrazione o una policy non valida fanno fallire l'attivazione e lasciano l'avvio sullo strato superiore RAM ordinario.

Una sessione contrassegnata come `dirty` indica che il precedente avvio non ha completato la transizione di spegnimento pulito. SquashFS quindi avvisa e ripristina l'ultimo `changes.sb` salvato con successo; le modifiche non salvate dall'avvio interrotto non costituiscono una seconda generazione di rollback.

Session Manager e il backend di salvataggio del sistema creano e sostituiscono atomicamente gli snapshot SquashFS tramite acquisizione esatta. L'attivazione al boot può leggere uno snapshot esistente da storage FAT, exFAT o NTFS scrivibile perché l'estrazione avviene nello strato superiore ext4 temporaneo. La creazione e il salvataggio esatto restano vincolati dal filesystem: la loro area di staging privata deve preservare link, proprietà, permessi, xattr, ACL, capability e whiteout union, quindi il salvataggio attuale richiede un filesystem POSIX adatto. Consulta [Gestione delle sessioni](./Session-Management.md).

## Attivazione dell'unione e confine di recupero

Per AUFS, la root dei cambiamenti attivata diventa il branch zero scrivibile. Per OverlayFS, l'initrd costruisce `upperdir` e `workdir` sotto la root dei cambiamenti attivata e monta i moduli in sola lettura come directory inferiori. L'initrd quindi verifica il branch AUFS live o `upperdir` di OverlayFS prima di pubblicare la persistenza come attiva.

Se un backend di persistenza, un aggiornamento dei metadati o questa verifica fallisce, i relativi mount vengono smontati dove possibile, nessuna autorità runtime viene pubblicata con successo e l'avvio scrivibile prosegue in RAM. Il fallimento nella costruzione dell'unione root porta alla shell fatale di initramfs. Uscire da quella shell può permettere la continuazione della configurazione con una root non valida; non si tratta di una riparazione né di un fallback sicuro. AUFS mantiene l'aggiunta dei branch dei moduli "best-effort", ma un'unione incompleta attraversa il confine di recupero: MiniOS non pubblica un'autorità di persistenza riuscita.

I fallimenti nel controllo dei container evitano deliberatamente il recupero scrivibile. Conserva la sessione e segui [Recupero backup](/administration/Backup-Recovery.md), [Recupero DynFileFS](./DynFileFS-Recovery.md) o [Risoluzione dei problemi](/administration/Troubleshooting.md) invece di sostituire i file di sessione durante l'avvio.

## Stato attivo, in esecuzione e del boot corrente

Nei metadati di sessione durevoli, `default=` è la sessione **attiva** selezionata per il prossimo ripristino, mentre `running=` è la sessione registrata come fornitrice dell'avvio corrente. L'attivazione scrive entrambi i campi e marca quella sessione `dirty`.
Dopo che i mount di persistenza sono stati rimossi durante uno shutdown pulito, MiniOS elimina `running=` e marca la sessione `clean`.

Questi campi dei metadati possono essere obsoleti dopo un crash, una scrittura fallita dei metadati, una costruzione dell'unione fallita, una copia dello store o uno shutdown interrotto. I consumer runtime che devono autorizzare il salvataggio non si fidano solo di `running=`. Utilizzano lo stato protetto dell'avvio corrente dell'initrd, legato all'ID di boot, al numero di sessione, alla modalità, all'identità effettiva dello store, allo stato scrivibile, alla durabilità e alla generazione attiva verificata. Un record current-boot fallito o mancante significa che la persistenza non deve essere considerata un target di salvataggio autorizzato.

Con `toram` e una richiesta di persistenza riconosciuta, lo store della sessione viene copiato in RAM prima dell'attivazione. La sessione copiata può essere scrivibile e può fornire l'upper in esecuzione, ma il suo stato current-boot è marcato come non durevole. Le modifiche a quella copia in RAM non vengono restituite al dispositivo originale e vengono perse allo shutdown.

Per indicazioni operative correlate, consulta [Modalità di avvio](./Boot-Modes.md), [Parametri di avvio](./Boot-Parameters.md), [Gestione delle sessioni](./Session-Management.md), [Recupero DynFileFS](./DynFileFS-Recovery.md), [Recupero backup](/administration/Backup-Recovery.md), [Sicurezza](/administration/Security-Hardening.md) e [Risoluzione dei problemi](/administration/Troubleshooting.md).
