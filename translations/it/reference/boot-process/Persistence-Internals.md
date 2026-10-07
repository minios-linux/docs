---
updated: 2026-10-06
---

# Interni della persistenza

Questa pagina spiega i `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, e `perchtoram` parametri di avvio. Questi parametri determinano dove vengono salvate le modifiche di una sessione live, come viene creata una nuova sessione e se l’archiviazione della sessione supportata viene copiata in RAM. Per l’uso normale, seleziona una voce persistente nel menu di avvio oppure utilizza Gestore sessioni MiniOS invece di modificarli manualmente.

MiniOS costruisce la root live da moduli in sola lettura e un unico livello superiore scrivibile.
L’initrd decide se quel livello superiore sarà una sessione persistente numerata oppure una directory temporanea in RAM. Questa pagina descrive quella decisione e il percorso di attivazione all’avvio. Per i controlli visibili all’utente, vedi [Modalità di avvio](/using-minios/Boot-Modes) e [Parametri di avvio](/reference/Boot-Parameters).

## In termini semplici

Senza un parametro di persistenza, MiniOS salva le modifiche in RAM e le elimina alla chiusura. Un parametro di persistenza chiede a MiniOS di individuare uno spazio di archiviazione scrivibile, selezionare o creare una sessione numerata, verificare la compatibilità e utilizzare quella sessione come livello scrivibile.

Richiedere la persistenza non garantisce che sia stata attivata. Se la destinazione è di sola lettura, piena, danneggiata o incompatibile, MiniOS può continuare con un livello temporaneo RAM. Leggi l'avviso di avvio prima di fare affidamento sulle modifiche salvate.

## Parametri spiegati

| Parametro | Cosa indica MiniOS | Scelta tipica |
|---|---|---|
| `perchdir=resume` | Apre la sessione compatibile predefinita e, se non è utilizzabile, ne crea una sostitutiva quando possibile. | Lavoro quotidiano normale. |
| `perchdir=setup` | Scegli interattivamente il backend di persistenza e le opzioni di cifratura/compressione supportate, quindi crea una nuova sessione numerata. | Voce attuale **Avviare una nuova sessione** del menu di avvio. |
| `perchdir=new` | Crea direttamente una nuova sessione numerata utilizzando `perchmode` backend richiesto/predefinito, cifratura, compressione e dimensione, senza mostrare la selezione del backend. | Voci di avvio personalizzate o avanzate con opzioni di storage già specificate. |
| `perchdir=ask` | Mostra le sessioni salvate e consente di sceglierne una. Se non ci sono sessioni salvate, il selettore avvia la stessa procedura di configurazione usata da `perchdir=setup`. | Più aree di lavoro su un unico dispositivo, incluso il primo setup interattivo su uno storage vuoto. |
| `perchdir=NUMBER` | Richiede una specifica sessione numerata. | Voce di avvio personalizzata stabile dopo la verifica dell'ID sessione. |
| `perchmode=MODE` | Seleziona `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. | Abbina il filesystem di supporto e il modello di persistenza desiderato. |
| `perchencrypt=luks` | Aggiunge un livello LUKS2 durante la creazione di una sessione Raw, DynFileFS, DynBlk o VMDK. | Cifra un backend container supportato. |
| `perchsize=SIZE` | Richiede la dimensione di una sessione container nuova o in espansione. | DynFileFS, DynBlk, VMDK o raw; la cifratura non modifica la semantica della dimensione del backend. |
| `perchcomp=CODEC` | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk appena creata. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`; la disponibilità dipende comunque dal kernel in uso. La compressione è disabilitata quando LUKS avvolge DynBlk. |
| `perchreserve=MB` | Sottrae un margine durante il dimensionamento di un container nuovo o in crescita e imposta la soglia di avviso per spazio insufficiente. | Riserva spazio di lavoro durante l'allocazione di un container; non si tratta di una quota attiva a runtime. |
| `perch` | Utilizza il comportamento di ripristino precedente senza la creazione automatica di una sostituzione. | Compatibilità con una voce personalizzata esistente; si consiglia `perchdir=resume` per i menu attuali. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Controlla la copia della persistenza in modo indipendente dal sistema `toram`. | `off` mantiene attivo lo store originale; `trim` copia solo la sessione supportata selezionata; `full` copia tutte le sessioni container/SquashFS supportate. |

Quando viene richiesta la persistenza, il sistema `toram` imposta `perchtoram=trim` come predefinito, a meno che non venga specificata una modalità persistence-RAM. Senza sistema `toram`, la persistenza rimane di default su storage. Una sessione copiata non è durevole durante l'esecuzione, ma l'attuale Session Manager può salvare esplicitamente lo stato supportato su RAM nello store originale o pubblicarlo come nuova sessione quando lo store originale è disponibile e corrisponde all'identità di avvio.

## La persistenza è esplicita

L'initrd gestisce la persistenza solo se la riga di comando del kernel contiene uno di questi token riconosciuti:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Se nessuno di questi token è presente, anche quando è presente solo un nome `perch...` non riconosciuto, MiniOS crea un nuovo livello superiore scrivibile in RAM. Le modifiche apportate durante quell'avvio vengono scartate allo spegnimento.

I selettori non sono tutti equivalenti:

| Selettore | Comportamento initrd |
|---|---|
| `perch` | Tenta di ripristinare il valore predefinito dei metadati. Non crea automaticamente una sessione quando nessuna è utilizzabile o quando i controlli di compatibilità falliscono. |
| `perchdir=resume` | Tenta il valore predefinito dei metadati e può creare automaticamente un nuovo sostituto compatibile. Questo è il comportamento attuale di ripristino dal menu di avvio. |
| `perchdir=setup` | Apre prima il selettore backend, registra la richiesta di backend/cifratura/compressione selezionata, quindi segue il percorso di allocazione di una nuova sessione. |
| `perchdir=new` | Alloca una directory il cui ID numerico è uno superiore al più alto ID numerico esistente. Non riutilizza mai una directory esistente e non apre il selettore backend. |
| `perchdir=ask` | Propone le sessioni esistenti se presenti; una sessione esistente incompatibile richiede conferma. Se non c'è una sessione predefinita/sullo store, passa a `setup` così la prima sessione può essere creata interattivamente. |
| `perchdir=NUMBER` | Usa quella directory se esiste. Se non esiste, la selezione può ricadere sul valore predefinito registrato nei metadati; non riserva il numero richiesto. |

Altri parametri di persistenza riconosciuti senza selettore seguono lo stesso percorso legacy di ripristino come `perch`: richiedono la persistenza, ma non abilitano la creazione automatica. Se la selezione o l'attivazione non riescono a produrre un livello superiore utilizzabile, l'avvio continua normalmente con il livello superiore RAM e viene pubblicato un avviso di errore.

## Archivio sessioni e posizione

L'archivio predefinito è la directory `changes` accanto ai dati di MiniOS, con directory di sessione numerate e `session.conf` o `session.json` metadati:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

In alternativa, è possibile selezionare l'archivio come dispositivo più un percorso opzionale. I formati accettati includono un percorso diretto `/dev/...` , `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` e `askdisk:custom:path`. Il suffisso separato da due punti diventa un percorso sotto il dispositivo selezionato; la sintassi con slash dopo `askdisk` perde silenziosamente quel percorso personalizzato. Una sottodirectory selezionata viene montata come archivio sessioni tramite bind-mount. MiniOS può anche rilevare una partizione di persistenza sullo stesso disco e uno storage di persistenza Ventoy supportato.

Prima della selezione della sessione, l'initrd deve montare la posizione in modalità scrittura e verificare di poter creare e rimuovere un marker nell'archivio. Un dispositivo a blocchi che non può essere aperto in scrittura, un mount in sola lettura, un percorso non disponibile o un test di scrittura fallito impediscono la persistenza per quell'avvio. Le sessioni esistenti non sono considerate affidabili solo perché i loro file sono leggibili.

## Selezione e compatibilità

I metadati della sessione registrano la modalità di archiviazione e possono includere la versione MiniOS, l’edizione, il filesystem union e la dimensione del container. Il ripristino confronta la modalità, la versione, l’edizione e il union registrati con la modalità richiesta e il sistema attuale.
I campi di compatibilità legacy mancanti non vengono considerati come incongruenze.

Letterale `perchdir=resume` crea una nuova sessione numerata quando il valore predefinito è assente o quando una modalità, versione, edizione o union registrati non corrispondono e rendono quel predefinito non idoneo. Solo `perch`, una selezione numerica diretta e altre richieste legacy di ripristino rifiutano la sostituzione automatica e proseguono in RAM dopo un errore di selezione. `perchdir=ask` mostra le informazioni di compatibilità e consente una forzatura esplicita. Una nuova sessione prevede di default `native` a meno che non sia stata richiesta un’altra modalità.

La modalità di archiviazione fa parte della compatibilità. Se la selezione raggiunge la gestione backend, una modalità richiesta sconosciuta ricade su `native`, la cui verifica può quindi selezionare DynFileFS su uno storage non idoneo. Una sessione esistente con una modalità registrata diversa può invece fallire il controllo di compatibilità precedente; una richiesta legacy di ripristino prosegue quindi in RAM invece di arrivare a quel fallback.

## Riserva di spazio e dimensioni

MiniOS utilizza 256 MiB come margine di allocazione predefinito e soglia di avviso per spazio insufficiente. Il calcolo si basa su blocchi filesystem da 1024 byte. `perchreserve` accetta un numero intero senza segno e senza unità, con un massimo di 4096, e torna a 256 se mancante o non valido. Il margine riduce lo spazio offerto a un container nuovo o in crescita. Non è una quota: una sessione nativa o scritture successive possono comunque utilizzare lo spazio rimanente del filesystem. All'avvio viene segnalato quando lo spazio libero attuale è pari o inferiore alla soglia.

Le dimensioni dei container utilizzano valori interi allocati in MiB:

- Un numero semplice, `M`, oppure `MB` indica MiB.
- `G` oppure `GB` moltiplica il numero per 1000 MiB.
- `T` oppure `TB` moltiplica il numero per 1.000.000 MiB.
- I container Raw sono limitati a 1.000.000 MiB e dallo spazio disponibile dopo la riserva. DynFileFS ha un limite separato che tiene conto di RAM e un tetto massimo rigido di 2.000.000 MiB. DynBlk ottiene il limite di geometria in formato nativo da `dynblk limits --format dynblk`; MiniOS non impone un limite separato di 512 GiB.
- Raw è un singolo file di backend, quindi FAT32 lo limita a 4000 MiB in MiniOS. Lo stesso limite si applica quando Raw è avvolto in LUKS2.
- Una nuova sessione raw predefinita è di 4000 MiB. La crittografia non crea una politica di dimensione LUKS separata: un Raw cifrato, DynFileFS, DynBlk o una sessione VMDK mantiene le regole di dimensione del backend sottostante.
- Una nuova sessione DynFileFS creata da initrd senza `perchsize` utilizza fino a 16 GiB di capacità logica. Se il supporto di memorizzazione non può effettivamente contenerne così tanto dopo `perchreserve` e l'overhead dell'indice DynFileFS, il valore predefinito viene ridotto alla capacità disponibile. Il suo indice format-400 costa circa 2 MiB di RAM e circa 2 MiB di spazio di archiviazione di backend per ogni GiB di capacità logica dichiarata, anche se il payload è vuoto. MiniOS quindi limita anche la capacità DynFileFS in base allo spazio fisico RAM e a un tetto massimo testato di 2.000.000 MiB.
- Una nuova sessione DynBlk senza `perchsize` segue lo stesso tetto automatico di 16 GiB e viene ridotta se rimane meno spazio di backend dopo `perchreserve`. La dimensione esplicita di DynBlk è una richiesta di capacità thin controllata rispetto al limite del backend installato. I metadati per le parti dichiarate vengono creati inizialmente, ma lo spazio per il payload cresce su richiesta. DynBlk gestisce una cache di metadati con limiti indipendente dal riempimento del payload.

La crescita dei container è best-effort e la riduzione non è supportata. `perchsize` non dimensiona le sessioni native o SquashFS. Il Gestore sessioni MiniOS imposta come predefinito i container raw e DynFileFS creati manualmente a 4000 MiB e i container DynBlk/VMDK a 16 GiB; le varianti cifrate utilizzano gli stessi valori predefiniti del backend. Vedi [Gestione sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione dello storage

Tutti i backend validi devono fornire l'upper scrivibile previsto dal filesystem union selezionato. Il mount di un backend, da solo, non garantisce che la persistenza sia attiva. Native, DynFileFS, DynBlk, VMDK e raw possono aggiornare i metadati di sessione persistente prima della validazione union; SquashFS rinvia quel commit dei metadati. Raw, DynFileFS, DynBlk e VMDK possono inoltre utilizzare la cifratura LUKS2. Lo stato protetto dell'avvio corrente viene pubblicato solo dopo che l'unione root finale è stata confermata con l'upper previsto.

| Backend | Rappresentazione persistente | Modello di capacità | Requisiti dello storage di supporto | Layer LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File e directory direttamente nella directory di sessione numerata | Utilizza direttamente lo spazio del filesystem di supporto; `perchsize` non applicabile | Filesystem scrivibile che supera il test di comportamento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` più file segmento che espongono un ext4 `virtual.dat` | Payload leggero con un indice denso della dimensione della capacità | Storage scrivibile POSIX, FAT32, NTFS o exFAT | Sì |
| `dynblk` | Formato-1 `volumeNNN.db` file che espongono `/dev/dynblkN`, con ext4 sopra | Dispositivo a blocchi virtuale leggero con mappature residenti su disco e una cache limitata | Filesystem accettato dal backend kernel DynBlk e risorse backend sufficienti | Sì |
| `vmdk` | `volume.vmdk` più file split sparse `volume-sNNN.vmdk` extent esposti dal driver DynBlk, con ext4 sopra | Dispositivo a blocchi virtuale split-sparse leggero | Filesystem accettato dal backend VMDK DynBlk e la `vmdk-session-v1` funzionalità | Sì |
| `raw` | Unico file a dimensione fissa `changes.img` che contiene ext4 | Il file viene creato alla dimensione logica richiesta; solo crescita | Filesystem scrivibile in grado di contenere l'immagine; FAT32 è limitato a 4000 MiB | Sì |
| `squashfs` | Snapshot `changes.sb` compresso; l'upper scrivibile di runtime viene ricostruito in RAM | La dimensione dello snapshot segue le modifiche catturate; `perchsize` non applicabile | Gli snapshot esistenti possono essere letti da supporti scrivibili compatibili; il salvataggio esatto richiede uno store di persistenza compatibile con POSIX | No |

### Nativo

La modalità nativa memorizza direttamente i contenuti scrivibili dell’unione nella directory di sessione numerata. Non viene utilizzata alcuna immagine interna, dispositivo loop, contenitore FUSE o filesystem a blocchi separato, quindi la capacità corrisponde semplicemente allo spazio libero sul filesystem di supporto e `perchsize` non si applica. Questo comporta il minimo overhead di contenitore e mantiene la normale visibilità dei file per il ripristino e il backup.

MiniOS esclude innanzitutto filesystem noti come non POSIX, ad esempio FAT, exFAT e NTFS. Successivamente, verifica il comportamento reale del filesystem creando un file e un collegamento simbolico e controllando le modifiche alla modalità eseguibile. Se la verifica ha esito positivo, la directory di sessione numerata viene montata direttamente come area scrivibile. Se il filesystem è noto come non idoneo o la verifica POSIX fallisce, la modalità nativa passa a DynFileFS. Un errore dopo l’attivazione nativa viene annullato; un nuovo candidato vuoto viene rimosso quando è possibile farlo in sicurezza.

Il livello di persistenza LUKS2 MiniOS non avvolge la modalità nativa perché questa non presenta alcun contenitore o confine di dispositivo a blocchi da cifrare. La persistenza nativa può comunque risiedere su uno storage cifrato esternamente a questo livello di persistenza.

### DynFileFS

DynFileFS è il backend container formato-400 basato su FUSE. Espone un'unica immagine logica `virtual.dat` mentre i dati vengono archiviati in `changes.dat` più file di segmento numerati. L'helper deve essere montato correttamente ed esporre `virtual.dat`; in caso contrario, l'attivazione fallisce invece di creare accidentalmente un file solo RAM con un nome che sembra persistente.

Il suo indice di mappatura è denso rispetto alla capacità logica dichiarata: ogni blocco logico da 4 KiB ha un offset di 8 byte. Si tratta di circa 2 MiB di indice RAM per ogni GiB di capacità virtuale, e una quantità simile viene memorizzata negli indici dei segmenti di supporto anche prima che vengano scritti i dati effettivi. L'allocazione del payload rimane comunque dinamica. Poiché il binario initrd statico è i686, MiniOS applica anche un limite di dimensione logica compatibile con RAM e una soglia massima rigida di 2.000.000 MiB, inferiore al punto di errore dello spazio degli indirizzi testato.

L'immagine logica contiene ext4. Le immagini esistenti vengono controllate prima del montaggio in scrittura; se il risultato del controllo del filesystem supera lo stato di errori corretti, la sessione viene rifiutata invece di essere montata in scrittura. Il ridimensionamento è solo in crescita e il filesystem ext4 interno viene espanso quando possibile. Per la diagnosi lato utente, vedi [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

### DynBlk

La modalità `dynblk` utilizza un dispositivo a blocchi del kernel, separato da DynFileFS. Ogni sessione numerata possiede `volume000.db` e tutti i suoi corrispondenti numerati (`volume001.db`, ..., `volume1000.db`, e oltre). Il layout nativo è `DBSPRS01`, formato disco **1**. I layout non supportati vengono rifiutati invece di essere convertiti in modo silente. Mantieni allineate le versioni installate di CLI e modulo.

MiniOS crea ext4 sull’intero disco restituito da `/dev/dynblk-control`, come ad esempio `/dev/dynblk3`; non presume che `dynblk0` sia libero. Un ext4 esistente viene verificato prima dell’uso in scrittura. Il boot-state protetto registra esattamente quel dispositivo, così lo shutdown lo scollega solo dopo che i suoi utenti e il filesystem superiore sono stati chiusi. Possono coesistere più dispositivi indipendenti.

Session Manager, installer e initramfs interrogano `dynblk limits --format dynblk` per il limite di geometria del backend installato. L’attuale resource guard consente 65536 parti: gli intervalli logici standard da 1 GiB permettono fino a 64 TiB. Limiti fisici inferiori riducono il limite virtuale. Questo è un limite massimo di geometria, non una garanzia che l’host possa tenere aperti così tanti file o disponga di sufficiente RAM/storage. L’espansione è supportata; la riduzione no.

Le tabelle di mappatura risiedono su disco. `--map-memory-mb` gestisce una cache di metadati per dispositivo (predefinita 1 MiB, intervallo 1..64 MiB), non più una percentuale di RAM né un limite sui dati mappati. Le descrizioni degli extent, i vettori dei file aperti e le piccole directory crescono in base alla geometria dichiarata, non in base al riempimento del payload. L’operazione di attach esegue la scansione dei metadati di mappatura e ricostruisce temporaneamente lo stato di allocazione una parte alla volta; non legge ogni payload. Un’operazione completa di `dynblk check` legge invece i payload. `engine_memory_bytes` esclude la page cache del filesystem, le strutture interne dei codec e altre allocazioni del kernel.

I file di metadati per tutte le parti dichiarate vengono inizializzati alla creazione/espansione; i dati effettivi restano thin. Le parti sono limitate a 4000 MiB. Effettua il backup dell’intero namespace scollegato, senza presumere numeri a tre cifre o una parte finale fissa. Un nuovo volume può selezionare la compressione con `perchcomp`; i caricamenti successivi utilizzano il codec memorizzato. LUKS2 sopra DynBlk forza la compressione su `none`. Le scritture parziali su dati compressi attualmente ricomprimono il relativo blocco da 64 KiB. L’esaurimento di spazio o risorse può comunque causare errori di scrittura; il filesystem superiore deve essere smontato prima del detach.

### Sessioni VMDK

La modalità `vmdk` sessione utilizza lo stesso driver con immagini VMDK reali.`twoGbMaxExtentSparse`
La sua principale caratteristica è `volume.vmdk`, con `volume-s001.vmdk` e le parti successive; ogni parte copre fino a 2 GiB di spazio logico. Il descrittore è limitato
a meno di 1 MiB, quindi la lunghezza del nome file e il numero di extent limitano la capacità.
Session Manager, Installer e initramfs interrogano
`dynblk limits --format vmdk`.
La modalità nativa continua a utilizzare `volume000.db`; nessuna delle due modalità reinterpreta i file dell'altra.
Le sessioni gestite non importano un VMDK partizionato esternamente in modo arbitrario
come metadati di sessione.

Il supporto alle sessioni VMDK è segnalato da `vmdk-session-v1` in
`/etc/minios-initramfs-dynblk` all'interno dell'initrd. Il runtime attuale e ogni
initrd di origine copiato dall'Installer devono supportarlo. VMDK non prevede compressione nativa;
`perchcomp` viene ignorato con un avviso all'avvio e Session Manager rifiuta un
VMDK non-`none`codec. LUKS2 rimane un livello di cifratura separato e opzionale. Entrambe le modalità pubblicano
il proprio reale tipo di sessione e il relativo `dynblk_device` in stato di boot protetto,
e entrambe le implementazioni di spegnimento chiudono il dispositivo dopo che tutti gli utenti hanno terminato.

Entrambi i formati driver supportano `writeback`, `writethrough`, `none`, `directsync` e policy di collegamento `unsafe`esplicite. Le modalità dirette richiedono attualmente ext2/ext4 come filesystem sottostante. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` collega un filesystem esistente; `umount` rilascia il dispositivo gestito dal helper dopo che l'ultimo utente lo chiude. La modalità manuale `dynblk load`ha una durata esplicita. Questo non crea un filesystem né sblocca LUKS.

### Raw

La modalità Raw utilizza un solo `changes.img` file contenente ext4. La dimensione del file viene impostata sulla capacità logica richiesta al momento della creazione, quindi, a differenza dei backend dinamici, la capacità stessa rimane fissa fino a un'operazione di espansione esplicita. Il filesystem sottostante può rappresentare in modo sparso gli extent non scritti, ma MiniOS considera comunque Raw come uno storage a capacità fissa e verifica lo spazio disponibile sul supporto prima di crearlo o espanderlo. Poiché tutto risiede in un unico file host, FAT32 è limitato a 4000 MiB.

Le immagini Raw esistenti vengono controllate con `e2fsck` prima del montaggio in scrittura. L'espansione estende `changes.img` e poi espande ext4 con `resize2fs`; la riduzione non è supportata. Un controllo o montaggio non riuscito preserva l'immagine per il ripristino e continua l'avvio in RAM. Raw non utilizza demone FUSE né metadati personalizzati per lo storage a blocchi, il che rende il modello di ripristino semplice, ma non offre il comportamento thin-capacity di DynFileFS e DynBlk.

### Layer di cifratura LUKS

LUKS2 è uno strato di cifratura opzionale selezionabile con `perchencrypt=luks` durante la creazione di una sessione Raw, DynFileFS, DynBlk o VMDK. Le sessioni esistenti mantengono lo stato di cifratura dai metadati della sessione; specificare `perchencrypt` successivamente non reinterpreta né converte una sessione plaintext già esistente.

Il perimetro della cifratura dipende dal backend: Raw collega `changes.img` tramite un dispositivo loop e inserisce LUKS2 all’interno di quel file; DynFileFS collega la propria `virtual.dat` tramite un dispositivo loop e cifra quell’immagine logica; DynBlk utilizza direttamente il proprio `/dev/dynblkN` block device; VMDK utilizza il block device esposto dallo stesso driver DynBlk per la propria immagine sparse suddivisa. In tutti e quattro i casi, MiniOS crea ext4 all’interno di `/dev/mapper/...`, quindi i contenuti e i metadati del filesystem all’interno del mapper sono cifrati a riposo. I metadati del backend al di fuori del perimetro LUKS, i descrittori VMDK, i file di avvio, i metadati della sessione e altri file sul supporto di persistenza rimangono non cifrati.

Le dimensioni predefinite, i limiti di crescita, le restrizioni FAT32 e il comportamento di allocazione thin/fixed dipendono comunque dal backend sottostante. L’initrd autentica prima di espandere un backend cifrato esistente, chiude il mapper prima della crescita del backend, poi lo riapre, controlla ext4 ed espande il filesystem prima di montarlo. Per i DynBlk cifrati, la compressione del backend è forzata su `none`.

Durante la creazione viene richiesta la passphrase due volte. Le sessioni cifrate già esistenti consentono tre tentativi di sblocco dalla console di avvio. Tre passphrase errate attivano un percorso di avvio fatale: MiniOS non prosegue in RAM, non reinterpreta la stessa sessione come plaintext, non seleziona un altro backend e non crea una sostituzione. Altri errori di creazione, verifica, ridimensionamento o mount mantengono il comportamento di ripristino specifico del backend senza fallback in plaintext. Le passphrase non vengono memorizzate nei metadati della sessione né passate come argomenti di comando. Le esportazioni logiche contengono i file della sessione decrittati invece di un’immagine backend cifrata.

Vedi [Sicurezza](/maintenance-and-recovery/Security) per informazioni sul perimetro di protezione e sulle considerazioni di backup.

### SquashFS

L'initrd normalmente attiva una sessione SquashFS esistente. La configurazione interattiva crea metadati di generazione zero con il salvataggio allo spegnimento abilitato, ma non crea `changes.sb`; il layer superiore scrivibile esiste solo in RAM fino a quando il sistema in esecuzione non effettua il primo salvataggio su richiesta o allo spegnimento. Una sessione di generazione zero è valida solo quando i campi artefatto snapshot e `changes.sb` sono assenti. Per le generazioni successive, l'attivazione valida metadati rigorosi a valore singolo per lo snapshot, inclusi il suo digest, le dimensioni compresse e non compresse, il numero di voci, il tipo di union e la policy di salvataggio. Viene inoltre verificato il tipo di file e la dimensione esatta, la memoria RAM disponibile e lo swap, il digest SHA-256 prima e dopo l'estrazione e la compatibilità attuale della union.

Lo snapshot viene estratto con gestione rigorosa degli errori e degli xattr in un'immagine ext4 temporanea e limitata in RAM. Per OverlayFS, quell'immagine contiene directory `changes` e `workdir` separate; per AUFS, la root è il ramo scrivibile.
Metadati non validi, memoria insufficiente, cambiamenti nel digest, errori di estrazione o una policy non valida fanno fallire l'attivazione e lasciano l'avvio sul normale upper RAM.

Una sessione contrassegnata come `dirty` indica che l'avvio precedente non ha completato la transizione di spegnimento pulito. SquashFS quindi avvisa e ripristina l'ultimo `changes.sb` snapshot salvato con successo; le modifiche non salvate dall'avvio interrotto non costituiscono una seconda generazione di rollback.

Il Gestore sessioni MiniOS e il backend di salvataggio del sistema creano e sostituiscono atomicamente snapshot SquashFS utilizzando una cattura esatta. L'attivazione all'avvio può leggere uno snapshot esistente da uno storage FAT, exFAT o NTFS scrivibile perché l'estrazione avviene nel layer superiore ext4 temporaneo. La creazione e il salvataggio esatto restano vincolati al filesystem: l'archivio delle sessioni deve supportare la creazione di uno spazio di lavoro privato, i metadati Linux e la pubblicazione durevole su un filesystem POSIX idoneo.

Durante il salvataggio, il backend cattura prima un albero di file stabile in memoria privata di proprietà di root quando l'initrd fornisce un tmpfs affidabile con spazio sufficiente. Quando RAM non è sufficiente, questo albero utilizza invece il precedente workspace su disco. Il compressore scrive direttamente in una directory privata con permessi 0700 sul filesystem della sessione, non in un'ulteriore immagine RAM seguita da un'altra copia su disco. MiniOS verifica il risultato compresso e la sua identità, lo sincronizza, lo sposta a un nome candidato privato, quindi rivalida il candidato prima di sostituire atomicamente l'attivo `changes.sb`. Copie o compressioni non riuscite non sostituiscono l'ultimo snapshot salvato con successo.

Con una sessione durevole e integra, `/var/log/minios` e `/var/log/live` vengono montati in bind da `boot-logs/` all'interno della sessione numerata. Queste diagnostiche di avvio vengono quindi scritte indipendentemente dall'upper RAM e dallo snapshot di spegnimento. Un avvio in cui l'archivio di persistenza non è stato attivato in modo durevole non può garantire che questi log sopravvivano a un riavvio. Log e cache ordinari possono essere configurati separatamente; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS non ha `perchsize`: la dimensione archiviata segue i cambiamenti compressi catturati, mentre la memoria runtime è determinata dal layer superiore scrivibile estratto. Il layer di persistenza LUKS MiniOS non avvolge `changes.sb`; se è richiesta la riservatezza dello snapshot, lo storage di supporto deve essere cifrato al di fuori di questo layer. Vedi [Gestione sessioni](/using-minios/Sessions-and-Persistence).

## Limite di attivazione e recupero dell'unione

Per AUFS, la root delle modifiche attivate diventa il ramo scrivibile zero. Per OverlayFS, l'initrd crea `upperdir` e `workdir` sotto la root delle modifiche attivate e monta i moduli in sola lettura come directory inferiori. L'initrd quindi verifica il ramo live AUFS oppure OverlayFS `upperdir` prima di pubblicare la persistenza come attiva.

Se un backend di persistenza, un aggiornamento dei metadati o questa verifica fallisce, i relativi mount vengono smontati dove possibile, nessuno stato di persistenza riuscito viene pubblicato e l'avvio scrivibile prosegue in RAM. Il fallimento nella costruzione dell'unione root porta alla shell fatale di initramfs. Uscire da quella shell può permettere di continuare la configurazione con una root non valida; non si tratta di una riparazione né di un fallback sicuro. AUFS mantiene l'aggiunta dei rami modulo con best effort, ma un'unione incompleta supera il limite di recupero: MiniOS non segna la persistenza come attiva.

I controlli falliti del container evitano deliberatamente di montare una sessione sospetta in scrittura.
Non sostituire né ricostruire i file di sessione durante l'avvio. Prima preserva l'archiviazione interessata; vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Stato attivo, in esecuzione e di avvio corrente

Nei metadati di sessione persistenti, `default=` è la **sessione attiva** selezionata per il prossimo ripristino, mentre `running=` è la sessione registrata come responsabile dell’avvio corrente. L’attivazione scrive entrambi i campi e segna quella sessione come `dirty`.
Dopo che i mount di persistenza sono stati rimossi durante uno spegnimento pulito, MiniOS elimina `running=` e segna la sessione come `clean`.

Questi campi dei metadati possono risultare obsoleti dopo un crash, una scrittura di metadati non riuscita, un’unione fallita, una copia dello store o uno spegnimento interrotto. I componenti runtime che consentono il salvataggio non si fidano del solo `running=`. Utilizzano lo stato protetto di avvio corrente dell’initrd, associato all’ID di avvio, alla sessione numerica, alla modalità, all’identità reale dello store, allo stato scrivibile, alla durabilità, alla generazione attiva verificata e, per DynBlk, all’esatto `/dev/dynblkN` dispositivo collegato. Se il record di avvio corrente è mancante o fallisce, la persistenza non deve essere considerata una destinazione di salvataggio approvata.

Con `perchtoram=trim` o `full`, i contenitori di sessione supportati vengono copiati in una tmpfs dedicata prima dell’attivazione. La sessione copiata può essere scrivibile e fornire l’upper in esecuzione, ma lo stato protetto di avvio corrente la segna come non durevole e registra una distinta `ram-origin` identità per lo store originale. `trim` copia solo la sessione supportata selezionata e i relativi metadati; `full` copia tutte le sessioni Raw, DynFileFS, DynBlk, VMDK o SquashFS presenti nello store. Le sessioni native di tipo directory sono escluse. L’attuale Session Manager utilizza `ram-origin` per individuare lo store originale tramite UUID del filesystem e può salvare esplicitamente la sessione basata su RAM come nuova sessione numerata o ripristinarla. Le modifiche non salvate su RAM vengono comunque perse se non avviene un salvataggio riuscito.

Per indicazioni operative correlate, consulta [Modalità di avvio](/using-minios/Boot-Modes), [Parametri di avvio](/reference/Boot-Parameters), [Sessioni e persistenza](/using-minios/Sessions-and-Persistence), [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicurezza](/maintenance-and-recovery/Security), e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Recupero dello spazio consapevole della sessione

`minios-session reclaim ID` supporta DynFileFS, DynBlk e le sessioni VMDK. Per una sessione plaintext esegue FITRIM sul vero filesystem ext4 interno, mai sulla root combinata AUFS/OverlayFS, e poi richiama l'operazione di recupero dello spazio del backend di storage proprietario. Il recupero DynFileFS richiede DynFileFS 4.6.0 o successivo.

Per una sessione DynFileFS in esecuzione, Session Manager entra in uno spazio dei mount privato e temporaneo per poter accedere a `virtual.dat` sotto il mount ext4 attivo senza interferire con il demone di sistema, il dispositivo loop o i mount union attivi. I dispositivi DynBlk/VMDK in esecuzione vengono verificati rispetto allo stato protetto dell'avvio corrente. Le sessioni inattive vengono temporaneamente collegate e montate; una sessione già montata da Session Manager riutilizza quell'attacco esistente. Un unmount occupato interrompe la chiusura invece di scollegare lo storage sotto un filesystem attivo.

Né l'avvio né lo spegnimento eseguono automaticamente la compattazione. `--compact` è una scelta esplicita dell'utente tramite CLI o tramite l'opzione non selezionata nella finestra di dialogo di Session Manager e può spostare dati attivi, aumentando le scritture su flash. Senza questa opzione, i backend recuperano solo lo spazio che possono restituire senza spostare dati attivi, come intervalli punchabili o code di file completamente libere; su filesystem come exFAT, gli intervalli interni liberati possono restare riutilizzabili all'interno del container anche se non possono essere restituiti al filesystem host. Le sessioni cifrate recuperano solo lo spazio già noto al backend e non abilitano in modo silenzioso il discard tramite dm-crypt.
