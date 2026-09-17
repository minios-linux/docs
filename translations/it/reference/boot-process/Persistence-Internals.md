---
updated: 2026-09-17
---

# Interni della persistenza

Questa pagina spiega i parametri di avvio `perch`, `perchdir`, `perchmode`, `perchsize` e `perchreserve`. Questi parametri controllano dove vengono salvate le modifiche di una sessione live. Per l’uso normale, seleziona una voce persistente nel menu di avvio oppure utilizza il Gestore sessioni MiniOS invece di modificarli manualmente.

MiniOS costruisce la root live da moduli di sola lettura e un unico livello superiore scrivibile.
L’initrd decide se quel livello superiore sarà una sessione persistente numerata o una directory temporanea in RAM. Questa pagina descrive la scelta e il percorso di attivazione al boot. Per i controlli rivolti all’utente, vedi [Modalità di avvio](/using-minios/Boot-Modes) e [Parametri di avvio](/reference/Boot-Parameters).

## In parole semplici

Senza un parametro di persistenza, MiniOS salva le modifiche in RAM e le elimina allo spegnimento. Un parametro di persistenza chiede a MiniOS di individuare uno spazio di archiviazione scrivibile, selezionare o creare una sessione numerata, verificarne la compatibilità e usare quella sessione come strato scrivibile.

Richiedere la persistenza non garantisce che sia diventata attiva. Se la destinazione è in sola lettura, piena, danneggiata o incompatibile, MiniOS può continuare con uno strato temporaneo RAM. Leggi l’avviso di avvio prima di fare affidamento sulle modifiche salvate.

## Spiegazione dei parametri

| Parametro | Cosa indica MiniOS | Scelta tipica |
|---|---|---|
| `perchdir=resume` | Apre la sessione compatibile predefinita e, se le condizioni lo permettono, ne crea una sostitutiva quando non può essere utilizzata. | Lavoro quotidiano normale. |
| `perchdir=new` | Crea una nuova sessione numerata. | Mantieni invariato uno spazio di lavoro esistente. |
| `perchdir=ask` | Mostra le sessioni salvate dopo aver trovato un archivio ripristinabile e consente di sceglierne una. Non può creare la prima sessione su uno storage vuoto. | Più spazi di lavoro esistenti su un dispositivo; usa `perchdir=new` per la prima sessione. |
| `perchdir=NUMBER` | Richiedi una sessione numerata specifica. | Voce di avvio personalizzata stabile dopo la verifica dell'ID sessione. |
| `perchmode=MODE` | Seleziona `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, o `squashfs`. | Abbina il filesystem di supporto e il modello di persistenza desiderato. |
| `perchencrypt=luks` | Aggiungi un layer LUKS2 durante la creazione di una sessione Raw, DynFileFS, DynBlk o VMDK. | Cifra un backend container supportato. |
| `perchsize=SIZE` | Richiedi la dimensione di una sessione container nuova o in crescita. | DynFileFS, DynBlk, VMDK o raw; la cifratura non modifica la semantica delle dimensioni del backend. |
| `perchcomp=CODEC` | Seleziona la compressione backend DynBlk per una sessione DynBlk appena creata. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`; la disponibilità dipende comunque dal kernel in esecuzione. La compressione è disabilitata quando LUKS avvolge DynBlk. |
| `perchreserve=MB` | Sottrai un margine quando dimensioni un container nuovo o in crescita e imposta la soglia di avviso per spazio insufficiente. | Lascia spazio di lavoro durante l'allocazione di un container; non è una quota a runtime. |
| `perch` | Utilizza il vecchio comportamento di ripresa senza creazione automatica di una sostituzione. | Compatibilità con una voce personalizzata esistente; preferisci `perchdir=resume` per i menu attuali. |

Non combinare la persistenza con `toram` quando ti aspetti che le modifiche vengano scritte sul dispositivo originale. MiniOS attiva la sessione copiata in RAM, e le modifiche su quella copia vengono perse allo spegnimento.

## La persistenza è esplicita

L'initrd abilita la gestione della persistenza solo quando la riga di comando del kernel contiene uno di questi token riconosciuti:

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
| `perch` | Tenta di riprendere il valore predefinito dei metadati. Non crea automaticamente una sessione quando nessuna è utilizzabile o quando i controlli di compatibilità falliscono. |
| `perchdir=resume` | Tenta il valore predefinito dei metadati e può creare automaticamente una nuova sostituzione compatibile. Questo è il comportamento attuale di ripresa dal menu di avvio. |
| `perchdir=new` | Alloca una directory il cui ID numerico è uno in più rispetto al più alto ID numerico esistente. Non riutilizza mai una directory esistente. |
| `perchdir=ask` | Offre sessioni esistenti dopo aver trovato un archivio ripristinabile e il valore predefinito. Una sessione esistente incompatibile richiede conferma. Su storage vuoto, usare `perchdir=new` per creare la prima sessione. |
| `perchdir=NUMBER` | Utilizza quella directory se esiste. Se non esiste, la selezione può ricadere sul valore predefinito registrato nei metadati; non riserva il numero richiesto. |

Altri parametri di persistenza riconosciuti senza selettore seguono lo stesso percorso legacy di ripresa come `perch`: richiedono la persistenza, ma non abilitano la creazione automatica. Se la selezione o l'attivazione non produce un livello superiore utilizzabile, l'avvio continua normalmente con il livello superiore RAM e viene pubblicato un avviso di errore.

## Archivio e posizione della sessione

L’archivio predefinito è la directory `changes` accanto ai dati MiniOS, con directory di sessione numerate e `session.conf` o `session.json` metadati:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

L’archivio può anche essere selezionato come un dispositivo più un percorso opzionale. Sono accettate diverse forme, tra cui un percorso diretto `/dev/...` , `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, e `askdisk:custom:path`. Il suffisso separato da due punti diventa un percorso sotto il dispositivo selezionato; la sintassi con slash dopo `askdisk` perde silenziosamente quel percorso personalizzato. Una sottodirectory selezionata viene montata come archivio di sessione. MiniOS può anche rilevare una partizione di persistenza sullo stesso disco e uno storage di persistenza Ventoy supportato.

Prima della selezione della sessione, l’initrd deve montare la posizione in modalità scrittura e verificare di poter creare e rimuovere un marcatore nell’archivio. Un dispositivo a blocchi che non può essere aperto in scrittura, un mount in sola lettura, un percorso non disponibile o un test di scrittura fallito impediscono la persistenza per quell’avvio. Le sessioni esistenti non sono considerate affidabili solo perché i loro file sono leggibili.

## Selezione e compatibilità

I metadati della sessione registrano la modalità di archiviazione e possono registrare la versione di MiniOS, l’edizione, il filesystem union e la dimensione del container. Il ripristino confronta la modalità, la versione, l’edizione e il union registrati con quelli richiesti e con il sistema attuale.
I campi di compatibilità legacy mancanti non sono considerati incompatibilità.

Il parametro letterale `perchdir=resume` crea una nuova sessione numerata quando il valore predefinito è assente o quando una modalità, versione, edizione o union registrati rendono quel valore predefinito non idoneo. `perch` senza argomenti, una selezione numerica diretta e altre richieste legacy di ripresa rifiutano la creazione automatica di sostituzioni e proseguono in RAM dopo un errore di selezione. `perchdir=ask` mostra le informazioni di compatibilità e permette una conferma esplicita. Una nuova sessione predefinita è `native` a meno che non sia stata richiesta un’altra modalità.

La modalità di archiviazione fa parte della compatibilità. Se la selezione arriva al backend, una modalità richiesta sconosciuta ricade su `native`, il cui probe può quindi selezionare DynFileFS su uno spazio non idoneo. Una sessione esistente con una modalità registrata diversa può invece fallire il controllo di compatibilità precedente; una richiesta legacy di ripresa prosegue quindi in RAM invece di arrivare a quel fallback.

## Riserva di spazio e dimensioni

MiniOS utilizza 256 MiB come margine di allocazione predefinito e soglia di avviso per spazio insufficiente. Il calcolo usa blocchi filesystem da 1024 byte. `perchreserve` accetta un numero intero senza segno e senza unità, è limitato a 4096 e torna a 256 se mancante o non valido. Il margine riduce lo spazio offerto a un container nuovo o in crescita. Non è una quota: una sessione nativa o scritture successive possono comunque consumare lo spazio rimanente del filesystem. All'avvio viene segnalato quando lo spazio libero attuale è pari o inferiore alla soglia.

Le dimensioni dei container usano conteggi interi allocati in MiB:

- Un numero semplice, `M`, o `MB` indica MiB.
- `G` o `GB` moltiplica il numero per 1000 MiB.
- `T` o `TB` moltiplica il numero per 1.000.000 MiB.
- I container Raw sono limitati a 1.000.000 MiB e dallo spazio disponibile dopo la riserva. DynFileFS ha un proprio limite compatibile con RAM e un tetto massimo di 2.000.000 MiB. DynBlk ottiene il limite di geometria del formato nativo da `dynblk limits --format dynblk`; MiniOS non impone un tetto separato di 512 GiB.
- Raw è un singolo file di supporto, quindi FAT32 lo limita a 4000 MiB in MiniOS. Lo stesso limite si applica quando Raw è avvolto in LUKS2.
- Una nuova sessione raw predefinita è di 4000 MiB. La cifratura non crea una politica di dimensione LUKS separata: una sessione Raw, DynFileFS, DynBlk o VMDK cifrata mantiene le regole di dimensione del backend sottostante.
- Una nuova sessione DynFileFS creata da initrd senza `perchsize` utilizza fino a 16 GiB di capacità logica. Se il supporto di memorizzazione non può effettivamente contenere tale quantità dopo `perchreserve` e overhead dell'indice DynFileFS, il valore predefinito viene ridotto alla capacità disponibile. Il suo indice format-400 costa circa 2 MiB di RAM e circa 2 MiB di storage di supporto per ogni GiB di capacità logica dichiarata, anche se il payload è vuoto. MiniOS limita quindi anche la capacità DynFileFS sia dalla capacità fisica RAM sia dal tetto massimo testato di 2.000.000 MiB.
- Una nuova sessione DynBlk senza `perchsize` segue lo stesso limite automatico di 16 GiB e viene ridotta se rimane meno spazio di supporto dopo `perchreserve`. La dimensione esplicita DynBlk è una richiesta di capacità thin verificata rispetto al limite backend installato. I metadati per le parti dichiarate vengono creati inizialmente, ma lo spazio per il payload cresce su richiesta. DynBlk gestisce una cache di metadati limitata indipendente dal riempimento del payload.

La crescita del container è best-effort e la riduzione non è supportata. `perchsize` non dimensiona le sessioni native o SquashFS. Il Gestore sessioni MiniOS imposta come predefinito 4000 MiB per container raw e DynFileFS creati manualmente e 16 GiB per DynBlk; le varianti cifrate usano gli stessi valori backend predefiniti. Vedi [Gestione sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione dello storage

Tutti i backend riusciti devono fornire l'upper scrivibile previsto dal filesystem union selezionato. Il mount di un backend non prova di per sé che la persistenza sia attiva. Native, DynFileFS, DynBlk, VMDK e raw possono aggiornare i metadati di sessione persistente prima della validazione union; SquashFS rimanda il commit dei metadati. Raw, DynFileFS, DynBlk e VMDK possono anche utilizzare la cifratura LUKS2. Lo stato protetto dell'avvio corrente viene pubblicato solo dopo che la root union finale è confermata con l'upper previsto.

| Backend | Rappresentazione persistente | Modello di capacità | Requisiti di storage di supporto | Layer LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File e cartelle direttamente nella directory della sessione numerata | Utilizza direttamente lo spazio del filesystem di supporto; `perchsize` non si applica | Filesystem scrivibile che supera il test di comportamento POSIX | No |
| `dynfilefs` | Format-400 `changes.dat` più file segmento che espongono un ext4 `virtual.dat` | Payload thin con indice denso della capacità | Storage scrivibile POSIX, FAT32, NTFS o exFAT | Sì |
| `dynblk` | Format-1 `volumeNNN.db` file che espongono `/dev/dynblkN`, con ext4 sopra | Thin virtual block device con mapping residenti su disco e cache limitata | Filesystem accettato dal backend kernel DynBlk e risorse backend sufficienti | Sì |
| `raw` | Singolo file a dimensione fissa `changes.img` contenente ext4 | Il file viene creato con la dimensione logica richiesta; solo crescita | Filesystem scrivibile in grado di contenere l'immagine; FAT32 è limitato a 4000 MiB | Sì |
| `squashfs` | Compressed `changes.sb` snapshot; upper scrivibile a runtime viene ricostruito in RAM | La dimensione dello snapshot segue le modifiche catturate; `perchsize` non si applica | Gli snapshot esistenti possono essere letti da supporti scrivibili compatibili, ma il salvataggio esatto richiede un filesystem di staging compatibile POSIX | No |

### Nativo

La modalità nativa salva i contenuti del livello union scrivibile direttamente nella directory della sessione numerata. Non ci sono immagini interne, dispositivi loop, container FUSE o filesystem a blocchi separati, quindi la capacità segue semplicemente lo spazio libero sul filesystem di supporto e `perchsize` non si applica. Questo comporta il minimo overhead di container e mantiene la visibilità ordinaria dei file per recupero e backup.

MiniOS esclude prima i filesystem noti come non POSIX, come FAT, exFAT e NTFS. Successivamente verifica il comportamento reale del filesystem creando un file e un collegamento simbolico e controllando le modifiche ai permessi eseguibili. Se il test ha esito positivo, la directory della sessione numerata viene montata direttamente come area scrivibile. Se il filesystem è noto come non adatto, o il test POSIX fallisce, la modalità nativa ricade su DynFileFS. Un errore dopo l'attivazione nativa viene annullato; un nuovo candidato vuoto viene rimosso solo se può essere eliminato in sicurezza.

Il layer di persistenza LUKS2 MiniOS non avvolge la modalità nativa perché quest'ultima non ha un container o un dispositivo a blocchi da cifrare. La persistenza nativa può comunque risiedere su uno storage cifrato esternamente a questo layer di persistenza.

### DynFileFS

DynFileFS è il backend container format-400 basato su FUSE. Espone una sola immagine logica `virtual.dat` mentre salva i dati in `changes.dat` più file segmento numerati. Il helper deve montare con successo ed esporre `virtual.dat`; altrimenti l'attivazione fallisce invece di creare accidentalmente un file solo RAM con un nome che sembra persistente.

Il suo indice di mapping è denso rispetto alla capacità logica dichiarata: ogni blocco logico da 4 KiB ha un offset da 8 byte. Sono circa 2 MiB di indice RAM per ogni GiB di capacità virtuale, e approssimativamente la stessa quantità viene salvata negli indici dei segmenti di supporto anche prima che i dati del payload siano scritti. L'allocazione del payload rimane comunque dinamica. Poiché il binario initrd statico è i686, MiniOS applica anche un limite di dimensione logica consapevole di RAM e un tetto massimo di 2.000.000 MiB sotto il punto di errore dello spazio degli indirizzi testato.

L'immagine logica contiene ext4. Le immagini esistenti vengono controllate prima del montaggio scrivibile; risultati del filesystem-check superiori allo stato di errori corretti rifiutano la sessione invece di montarla in scrittura. Il ridimensionamento è solo in crescita e il filesystem ext4 interno viene espanso quando possibile. Per la diagnosi lato utente, vedi [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

### DynBlk

La modalità `dynblk` utilizza un device a blocchi kernel, separato da DynFileFS. Ogni sessione numerata possiede `volume000.db` e tutte le sue sorelle numerate (`volume001.db`, ..., `volume1000.db`, e oltre). Il layout nativo è `DBSPRS01`, formato disco **1**. I layout non supportati vengono rifiutati invece di essere convertiti silenziosamente. Mantieni allineate le versioni CLI e dei moduli installati.

MiniOS crea ext4 sull'intero disco restituito da `/dev/dynblk-control`, come ad esempio `/dev/dynblk3`; non presume che `dynblk0` sia libero. L'esistenza di ext4 viene verificata prima dell'uso in scrittura. Lo stato protetto di avvio registra esattamente quel device, così lo spegnimento lo scollega solo dopo che i suoi utenti e il filesystem upper sono stati chiusi. Possono coesistere più dispositivi indipendenti.

Session Manager, installer e initramfs interrogano `dynblk limits --format dynblk` per il limite di geometria del backend installato. L'attuale guardia risorse permette 65536 parti: gli intervalli logici standard da 1 GiB consentono fino a 64 TiB. Limiti fisici più piccoli riducono il limite virtuale. Questo è un tetto di geometria, non una garanzia che l'host possa tenere aperti così tanti file o abbia abbastanza RAM/storage. La crescita è supportata; la riduzione no.

Le tabelle di mapping risiedono su disco. `--map-memory-mb` controlla una cache di metadati per device (default 1 MiB, intervallo 1..64 MiB), non più una percentuale di RAM o un limite sui dati mappati. Le descrizioni degli extent, i vettori dei file aperti e le piccole directory crescono con la geometria dichiarata, non con il riempimento del payload. L'attacco esegue la scansione dei metadati di mapping e ricostruisce temporaneamente lo stato di allocazione una parte alla volta; non legge ogni payload. Il comando completo `dynblk check` legge i payload. `engine_memory_bytes` esclude la cache di pagine del filesystem, i codec interni e altre allocazioni kernel.

I file di metadati per tutte le parti dichiarate vengono inizializzati alla creazione/crescita; i dati effettivi restano thin. Le parti sono limitate a 4000 MiB. Esegui il backup dell'intero namespace staccato, senza presumere numeri a tre cifre o una parte finale fissa. Un nuovo volume può selezionare la compressione con `perchcomp`; i caricamenti successivi usano il codec memorizzato. LUKS2 sopra DynBlk forza la compressione a `none`. Le scritture parziali su dati compressi attualmente ricomprimono il relativo blocco da 64 KiB. L'esaurimento di storage o risorse può comunque causare errori in scrittura; il filesystem upper deve essere smontato prima del detach.

### Sessioni VMDK

La modalità di sessione `vmdk` utilizza lo stesso driver con immagini reali `twoGbMaxExtentSparse`
. Il suo primario è `volume.vmdk`, con `volume-s001.vmdk` e successivi
parti; ogni parte copre fino a 2 GiB di spazio logico. Il descrittore è limitato
a meno di 1 MiB, quindi la lunghezza del nome file e il numero di extent limitano la capacità.
Session Manager, Installer e initramfs interrogano `dynblk limits --format vmdk`.
La modalità nativa continua a utilizzare `volume000.db`; nessuna delle due modalità reinterpreta i file dell'altra
sessione. Le sessioni gestite non importano un VMDK partizionato esternamente arbitrario
come metadati di sessione.

Il supporto per le sessioni VMDK è pubblicizzato da `vmdk-session-v1` in
`/etc/minios-initramfs-dynblk` all'interno dell'initrd. Il runtime attuale e ogni
initrd sorgente copiato dall'Installer devono supportarlo. VMDK non ha compressione nativa;
`perchcomp` viene ignorato con un avviso all'avvio e Session Manager rifiuta un
codec VMDK non-`none`. LUKS resta un layer separato opzionale. Entrambe le modalità pubblicano
la modalità sessione effettiva e il relativo `dynblk_device` nello stato protetto di avvio,
ed entrambe le implementazioni di spegnimento chiudono quel device dopo l'uscita degli utenti.

Entrambi i formati driver supportano `writeback`, `writethrough`, `none`, `directsync` e policy di attacco `unsafe`esplicite. Le modalità dirette richiedono attualmente ext2/ext4 come base. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` collega un filesystem esistente; `umount` rilascia il device gestito dall'helper dopo la chiusura dell'ultimo utente. La modalità manuale `dynblk load` ha durata esplicita. Questo non crea un filesystem né sblocca LUKS.

### Raw

La modalità Raw utilizza un solo `changes.img` file che contiene ext4. La dimensione del file viene impostata sulla capacità logica richiesta al momento della creazione, quindi, a differenza dei backend dinamici, la capacità rimane fissa fino a un'espansione esplicita. Il filesystem sottostante può rappresentare in modo sparso le aree non scritte, ma MiniOS considera comunque Raw come uno storage a capacità fissa e verifica lo spazio disponibile prima di creare o espandere il file. Poiché tutto risiede in un unico file host, FAT32 è limitato a 4000 MiB.

Le immagini Raw esistenti vengono controllate con `e2fsck` prima del montaggio in scrittura. L'espansione estende `changes.img` e poi amplia ext4 con `resize2fs`; la riduzione non è supportata. Se il controllo o il montaggio falliscono, l'immagine viene preservata per il recupero e l'avvio prosegue in RAM. Raw non utilizza un demone FUSE né metadati personalizzati per lo storage a blocchi, il che rende il modello di recupero semplice, ma non offre il comportamento a capacità dinamica di DynFileFS e DynBlk.

### Layer di cifratura LUKS

LUKS2 è un layer di cifratura opzionale selezionabile con `perchencrypt=luks` durante la creazione di una sessione Raw, DynFileFS, DynBlk o VMDK. Le sessioni esistenti prendono lo stato di cifratura dai metadati di sessione; specificare `perchencrypt` successivamente non reinterpreta né converte una sessione plaintext esistente.

Il perimetro della cifratura dipende dal backend: Raw collega `changes.img` tramite un loop device e inserisce LUKS2 all'interno di quel file; DynFileFS collega la propria `virtual.dat` tramite un loop device e cifra quell'immagine logica; DynBlk utilizza direttamente il device a blocchi `/dev/dynblkN` come sorgente LUKS2. In tutti e tre i casi MiniOS crea ext4 all'interno di `/dev/mapper/...`, quindi i contenuti e i metadati del filesystem all'interno del mapper sono cifrati a riposo. I metadati backend fuori dal perimetro LUKS, i file di avvio, i metadati di sessione e altri file sul supporto di persistenza restano non cifrati.

I valori predefiniti di dimensione, i limiti di crescita, le restrizioni FAT32 e il comportamento di allocazione thin/fissa restano di competenza del backend sottostante. L'initrd autentica prima di espandere un backend cifrato esistente, chiude il mapper prima della crescita del backend, poi lo riapre, controlla ext4 ed espande il filesystem prima del mount. Per DynBlk cifrati, la compressione backend è forzata a `none`.

In fase di creazione viene richiesta la passphrase due volte. Le sessioni cifrate esistenti consentono tre tentativi di sblocco sulla console di avvio. Tre passphrase rifiutate attivano un percorso di avvio fatale: MiniOS non prosegue in RAM, non reinterpreta la stessa sessione come plaintext, non seleziona un altro backend né crea una sostituzione. Altri errori di creazione, verifica, ridimensionamento o mount mantengono il loro comportamento di recupero specifico del backend senza fallback plaintext. Le passphrase non vengono memorizzate nei metadati di sessione né passate come argomenti di comando. Le esportazioni logiche contengono i file della sessione decrittati invece di un'immagine backend cifrata.

Vedi [Sicurezza](/maintenance-and-recovery/Security) per il perimetro di protezione e le considerazioni sul backup.

### SquashFS

L'initrd normalmente attiva una sessione SquashFS esistente. La configurazione interattiva crea metadati di generazione zero con salvataggio allo spegnimento abilitato ma non crea `changes.sb`; il livello superiore scrivibile esiste solo in RAM finché il sistema in esecuzione non effettua il primo salvataggio su richiesta o allo spegnimento. Una sessione di generazione zero è valida solo quando i campi degli artefatti snapshot e `changes.sb` sono assenti. Per le generazioni successive, l'attivazione valida metadati rigorosi e a valore singolo per lo snapshot, inclusi digest, dimensioni compresse e non compresse, numero di elementi, tipo di union e policy di salvataggio. Controlla anche il tipo di file e la dimensione esatta, la RAM e lo swap disponibili, il digest SHA-256 prima e dopo l'estrazione e la compatibilità union corrente.

Lo snapshot viene estratto con gestione rigorosa di errori e xattr in un'immagine ext4 temporanea e limitata in RAM. Per OverlayFS, quell'immagine contiene directory `changes` e `workdir` separate; per AUFS, la root è il ramo scrivibile.
Metadati non validi, memoria insufficiente, cambiamenti nel digest, errori di estrazione o una policy non valida fanno fallire l'attivazione e lasciano l'avvio sul normale livello superiore RAM.

Una sessione contrassegnata come `dirty` indica che l'avvio precedente non ha completato la transizione di spegnimento pulito. SquashFS avvisa e ripristina l'ultimo `changes.sb` salvato con successo; le modifiche non salvate dell'avvio interrotto non costituiscono una seconda generazione di rollback.

Il Gestore sessioni MiniOS e il backend di salvataggio del sistema creano e sostituiscono in modo atomico gli snapshot SquashFS tramite acquisizione esatta. L'attivazione all'avvio può leggere uno snapshot esistente da storage FAT, exFAT o NTFS scrivibile perché l'estrazione avviene nel livello superiore ext4 temporaneo. La creazione e il salvataggio esatto restano vincolati dal filesystem: la loro area di staging privata deve preservare link, proprietà, permessi, xattr, ACL, capability e whiteout union, quindi il salvataggio attuale richiede un filesystem POSIX idoneo.

SquashFS non ha `perchsize`: la dimensione salvata segue le modifiche catturate compresse, mentre la memoria a runtime è determinata dal livello superiore scrivibile estratto. Il layer di persistenza LUKS MiniOS non avvolge `changes.sb`; se è richiesta la riservatezza dello snapshot, lo storage di supporto deve essere cifrato esternamente a questo layer. Vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione union e confine di ripristino

Per AUFS, la root delle modifiche attivata diventa il ramo zero scrivibile. Per OverlayFS, l’initrd costruisce `upperdir` e `workdir` sotto la root delle modifiche attivata e monta i moduli in sola lettura come directory inferiori. L’initrd quindi verifica il ramo AUFS live o OverlayFS `upperdir` prima di pubblicare la persistenza come attiva.

Se un backend di persistenza, un aggiornamento dei metadati o questa verifica falliscono, i mount vengono annullati dove possibile, nessuno stato di persistenza viene pubblicato e l’avvio scrivibile prosegue in RAM. Il fallimento nella costruzione del root union entra nella shell fatale di initramfs. Uscire da quella shell può far continuare la configurazione con una root non valida; non è una riparazione né un fallback sicuro. AUFS mantiene l’append dei moduli best-effort, ma una union incompleta attraversa il confine di ripristino: MiniOS non segna la persistenza come attiva.

I fallimenti nei controlli dei container evitano deliberatamente il mount in scrittura di una sessione sospetta.
Non sostituire né ricostruire file di sessione durante l’avvio. Prima preserva lo storage interessato; vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Stato attivo, in esecuzione e di avvio corrente

Nei metadati di sessione persistenti, `default=` è la sessione **attiva** selezionata per la prossima ripresa, mentre `running=` è la sessione registrata come fornitrice dell'avvio corrente. L'attivazione scrive entrambi i campi e marca quella sessione come `dirty`.
Dopo che i mount di persistenza sono stati rimossi durante uno spegnimento pulito, MiniOS elimina `running=` e marca la sessione come `clean`.

Questi campi dei metadati possono essere obsoleti dopo un crash, un errore di scrittura dei metadati, un errore nella costruzione dell'union, una copia dello store o uno spegnimento interrotto. I componenti runtime che consentono il salvataggio non si fidano di `running=` da solo. Utilizzano lo stato protetto di avvio corrente dell'initrd, legato all'ID di avvio, sessione numerica, modalità, identità reale dello store, stato scrivibile, durabilità, generazione attiva verificata e, per DynBlk, l'esatto dispositivo `/dev/dynblkN` collegato. Un record di avvio corrente mancante o non valido significa che la persistenza non deve essere considerata un target di salvataggio approvato.

Con `toram` e una richiesta di persistenza riconosciuta, lo store di sessione viene copiato in RAM prima dell'attivazione. La sessione copiata può essere scrivibile e fornire il livello superiore in esecuzione, ma il suo stato di avvio corrente è marcato come non durevole. Le modifiche a quella copia RAM non vengono restituite al dispositivo originale e vengono perse allo spegnimento.

Per indicazioni operative correlate, vedi [Modalità di avvio](/using-minios/Boot-Modes), [Parametri di avvio](/reference/Boot-Parameters), [Sessioni e persistenza](/using-minios/Sessions-and-Persistence), [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicurezza](/maintenance-and-recovery/Security), e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Recupero spazio consapevole della sessione

`minios-session reclaim ID` opera su entrambi i formati a blocchi. Per le sessioni plaintext
riporta gli intervalli ext4 liberi con FITRIM, quindi richiama `dynblk reclaim`.
Per una sessione attiva, il device è vincolato allo stato protetto di avvio corrente e
viene verificato il mount ext4 effettivo; la root union non viene mai sottoposta a trim direttamente.
Le sessioni inattive vengono temporaneamente collegate e montate per questa operazione.

Né l'avvio né lo spegnimento eseguono automaticamente la compattazione. `--compact` è una
scelta esplicita dell'utente nella CLI o nell'opzione non selezionata della finestra di dialogo Session Manager.
Senza questa, vengono eseguiti solo hole punching dove supportato e troncamento della coda libera.
La policy discard di LUKS non viene modificata dal comando di sessione.
