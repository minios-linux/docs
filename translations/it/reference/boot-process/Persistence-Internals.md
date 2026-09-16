---
updated: 2026-09-16
---

# Interni della persistenza

Questa pagina spiega i parametri di avvio `perch`, `perchdir`, `perchmode`, `perchsize` e `perchreserve`. Questi parametri controllano dove vengono salvate le modifiche di una sessione live. Per l’uso normale, seleziona una voce persistente nel menu di avvio oppure utilizza il Gestore sessioni MiniOS invece di modificarli manualmente.

MiniOS costruisce la root live da moduli di sola lettura e un unico livello superiore scrivibile.
L’initrd decide se quel livello superiore sarà una sessione persistente numerata o una directory temporanea in RAM. Questa pagina descrive la scelta e il percorso di attivazione al boot. Per i controlli rivolti all’utente, vedi [Modalità di avvio](/using-minios/Boot-Modes) e [Parametri di avvio](/reference/Boot-Parameters).

## In parole semplici

Senza un parametro di persistenza, MiniOS salva le modifiche in RAM e le elimina allo spegnimento. Un parametro di persistenza chiede a MiniOS di individuare uno spazio di archiviazione scrivibile, selezionare o creare una sessione numerata, verificarne la compatibilità e usare quella sessione come strato scrivibile.

Richiedere la persistenza non garantisce che sia diventata attiva. Se la destinazione è in sola lettura, piena, danneggiata o incompatibile, MiniOS può continuare con uno strato temporaneo RAM. Leggi l’avviso di avvio prima di fare affidamento sulle modifiche salvate.

## Parametri spiegati

| Parametro | Cosa indica MiniOS | Scelta tipica |
|---|---|---|
| `perchdir=resume` | Apre la sessione compatibile predefinita e, se supportato, crea una sostituzione quando non può essere utilizzata. | Lavoro quotidiano normale. |
| `perchdir=new` | Crea una nuova sessione numerata. | Mantiene invariato uno spazio di lavoro esistente. |
| `perchdir=ask` | Mostra le sessioni salvate dopo aver trovato un archivio ripristinabile e consente di sceglierne una. Non può creare la prima sessione su uno storage vuoto. | Più spazi di lavoro esistenti su un dispositivo; usa `perchdir=new` per la prima sessione. |
| `perchdir=NUMBER` | Richiede una sessione numerata specifica. | Voce di avvio personalizzata stabile dopo la verifica dell'ID sessione. |
| `perchmode=MODE` | Seleziona `native`, `dynfilefs`, `dynblk`, `raw`, o `squashfs`. | Abbina il filesystem di supporto e il modello di persistenza desiderato. |
| `perchencrypt=luks` | Aggiunge un layer LUKS2 quando si crea una sessione Raw, DynFileFS o DynBlk. | Cifra un backend contenitore supportato. |
| `perchsize=SIZE` | Richiede la dimensione di una nuova sessione contenitore o di una sessione in crescita. | DynFileFS, DynBlk o raw; la cifratura non modifica la semantica della dimensione del backend. |
| `perchcomp=CODEC` | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk creata. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`; la disponibilità dipende comunque dal kernel in esecuzione. La compressione è disattivata quando LUKS avvolge DynBlk. |
| `perchreserve=MB` | Sottrae un margine quando si dimensiona un nuovo contenitore o uno in crescita e imposta la soglia di avviso per spazio insufficiente. | Lascia spazio di lavoro durante l'allocazione di un contenitore; non è una quota in fase di esecuzione. |
| `perch` | Utilizza il vecchio comportamento di ripresa senza creazione automatica della sostituzione. | Compatibilità con una voce personalizzata esistente; è preferibile `perchdir=resume` per i menu attuali. |

Non combinare la persistenza con `toram` quando prevedi che le modifiche vengano scritte sul dispositivo originale. MiniOS attiva la sessione copiata in RAM, e le modifiche a quella copia vengono perse allo spegnimento.

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

MiniOS utilizza 256 MiB come margine di allocazione predefinito e soglia di avviso per spazio insufficiente. Il calcolo usa blocchi filesystem da 1024 byte. `perchreserve` accetta un numero intero senza segno e senza unità, è limitato a 4096 e torna a 256 se manca o non è valido. Il margine riduce lo spazio offerto a un container nuovo o in crescita. Non è una quota: una sessione nativa o scritture successive possono comunque consumare lo spazio rimanente del filesystem. All'avvio viene segnalato quando lo spazio libero attuale è pari o inferiore alla soglia.

Le dimensioni dei container usano conteggi interi allocati in MiB:

- Un numero semplice, `M`, o `MB` indica MiB.
- `G` o `GB` moltiplica il numero per 1000 MiB.
- `T` o `TB` moltiplica il numero per 1.000.000 MiB.
- I container Raw sono limitati a 1.000.000 MiB e dallo spazio disponibile dopo la riserva. DynFileFS ha un limite separato, consapevole di RAM, e un tetto massimo di 2.000.000 MiB. DynBlk ha un proprio limite di 512 GiB per formato/ABI.
- Raw è un singolo file di supporto, quindi FAT32 lo limita a 4000 MiB in MiniOS. Lo stesso limite si applica quando Raw è avvolto in LUKS2.
- Una nuova sessione raw predefinisce 4000 MiB. La cifratura non crea una politica di dimensione LUKS separata: una sessione Raw cifrata, DynFileFS o DynBlk mantiene le regole di dimensione del backend sottostante.
- Una nuova sessione DynFileFS creata da initrd senza `perchsize` utilizza fino a 16 GiB di capacità logica. Se il supporto sottostante non può effettivamente contenere tale spazio dopo `perchreserve` e l'overhead dell'indice DynFileFS, il valore predefinito viene ridotto alla capacità disponibile. Il suo indice format-400 costa circa 2 MiB di RAM e circa 2 MiB di storage di supporto per ogni GiB di capacità logica dichiarata, anche se il payload è vuoto. MiniOS limita quindi anche la capacità DynFileFS rispetto allo spazio fisico RAM e a un tetto massimo testato di 2.000.000 MiB.
- Una nuova sessione DynBlk senza `perchsize` segue lo stesso limite automatico di 16 GiB e viene ridotta se rimane meno spazio dopo `perchreserve`. Una dimensione virtuale DynBlk esplicita è comunque una richiesta di capacità thin e viene limitata solo dal tetto di 512 GiB per formato/ABI; i file di supporto fisici vengono creati in modo lazy. DynBlk gestisce la propria politica di mapping-memoria sparsa e non richiede a MiniOS di dimensionare tale budget.

La crescita dei container è best-effort e la riduzione non è supportata. `perchsize` non dimensiona le sessioni native o SquashFS. Il Gestore sessioni MiniOS imposta di default i container raw e DynFileFS creati manualmente a 4000 MiB e DynBlk a 16 GiB; le varianti cifrate usano gli stessi valori predefiniti del backend. Vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione dello storage

Tutti i backend attivati con successo devono fornire l'upper scrivibile previsto dal filesystem union selezionato. Il mount di un backend, da solo, non garantisce che la persistenza sia attiva. I backend Native, DynFileFS, DynBlk e raw possono aggiornare i metadati di sessione persistente prima della validazione del union; SquashFS rinvia il salvataggio di questi metadati. Raw, DynFileFS e DynBlk possono inoltre utilizzare la cifratura LUKS2. Lo stato protetto dell'avvio corrente viene pubblicato solo dopo che il union root finale è stato confermato con l'upper previsto.

| Backend | Rappresentazione persistente | Modello di capacità | Requisiti dello storage di supporto | Livello LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File e cartelle direttamente nella directory di sessione numerata | Utilizza direttamente lo spazio del filesystem di supporto; `perchsize` non applicabile | Filesystem scrivibile che supera il test di comportamento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` più file segmento che espongono un ext4 `virtual.dat` | Payload leggero con un indice denso delle dimensioni della capacità | Storage scrivibile POSIX, FAT32, NTFS o exFAT | Sì |
| `dynblk` | Formato-1 `volumeNNN.db` file che espongono `/dev/dynblkN`, con ext4 sopra | Dispositivo a blocchi virtuale leggero con mappature sparse a runtime | Filesystem accettato dal backend kernel DynBlk e risorse backend sufficienti | Sì |
| `raw` | Singolo file a dimensione fissa `changes.img` contenente ext4 | Il file viene creato alla dimensione logica richiesta; solo crescita | Filesystem scrivibile in grado di contenere l'immagine; FAT32 è limitato a 4000 MiB | Sì |
| `squashfs` | Snapshot `changes.sb` compresso; l'upper scrivibile a runtime viene ricostruito in RAM | La dimensione dello snapshot segue le modifiche catturate; `perchsize` non applicabile | Gli snapshot esistenti possono essere letti da supporti scrivibili compatibili, ma il salvataggio esatto richiede un filesystem di staging compatibile con POSIX | No |

### Nativo

La modalità nativa salva i contenuti del livello union scrivibile direttamente nella directory della sessione numerata. Non ci sono immagini interne, dispositivi loop, container FUSE o filesystem a blocchi separati, quindi la capacità segue semplicemente lo spazio libero sul filesystem di supporto e `perchsize` non si applica. Questo comporta il minimo overhead di container e mantiene la visibilità ordinaria dei file per recupero e backup.

MiniOS esclude prima i filesystem noti come non POSIX, come FAT, exFAT e NTFS. Successivamente verifica il comportamento reale del filesystem creando un file e un collegamento simbolico e controllando le modifiche ai permessi eseguibili. Se il test ha esito positivo, la directory della sessione numerata viene montata direttamente come area scrivibile. Se il filesystem è noto come non adatto, o il test POSIX fallisce, la modalità nativa ricade su DynFileFS. Un errore dopo l'attivazione nativa viene annullato; un nuovo candidato vuoto viene rimosso solo se può essere eliminato in sicurezza.

Il layer di persistenza LUKS2 MiniOS non avvolge la modalità nativa perché quest'ultima non ha un container o un dispositivo a blocchi da cifrare. La persistenza nativa può comunque risiedere su uno storage cifrato esternamente a questo layer di persistenza.

### DynFileFS

DynFileFS è il backend container format-400 basato su FUSE. Espone una sola immagine logica `virtual.dat` mentre salva i dati in `changes.dat` più file segmento numerati. Il helper deve montare con successo ed esporre `virtual.dat`; altrimenti l'attivazione fallisce invece di creare accidentalmente un file solo RAM con un nome che sembra persistente.

Il suo indice di mapping è denso rispetto alla capacità logica dichiarata: ogni blocco logico da 4 KiB ha un offset da 8 byte. Sono circa 2 MiB di indice RAM per ogni GiB di capacità virtuale, e approssimativamente la stessa quantità viene salvata negli indici dei segmenti di supporto anche prima che i dati del payload siano scritti. L'allocazione del payload rimane comunque dinamica. Poiché il binario initrd statico è i686, MiniOS applica anche un limite di dimensione logica consapevole di RAM e un tetto massimo di 2.000.000 MiB sotto il punto di errore dello spazio degli indirizzi testato.

L'immagine logica contiene ext4. Le immagini esistenti vengono controllate prima del montaggio scrivibile; risultati del filesystem-check superiori allo stato di errori corretti rifiutano la sessione invece di montarla in scrittura. Il ridimensionamento è solo in crescita e il filesystem ext4 interno viene espanso quando possibile. Per la diagnosi lato utente, vedi [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

### DynBlk

La modalità `dynblk` è un backend block-device del kernel, separato da DynFileFS. Ogni sessione numerata possiede uno spazio dei nomi `volume000.db` con namespace creati dinamicamente `volume001.db` tramite `volume063.db` istanze parallele. Collegando un volume tramite `/dev/dynblk-control` viene restituito un device disco intero allocato dinamicamente, come ad esempio `/dev/dynblk0` o `/dev/dynblk3`; MiniOS deve utilizzare il device restituito e non deve presumere che `dynblk0` sia libero. È possibile collegare più volumi DynBlk contemporaneamente.

MiniOS crea ext4 direttamente sul device disco intero DynBlk, verifica l’esistenza di ext4 prima dell’uso in scrittura e supporta la crescita fino al limite di formato-1 di 512 GiB. La riduzione non è supportata. Lo stato protetto di avvio registra esattamente il `/dev/dynblkN` utilizzato dalla sessione persistente attiva, così lo spegnimento scollega lo stesso device dopo che il filesystem è stato smontato. Questo rimane corretto anche quando Session Manager collega temporaneamente un’altra sessione DynBlk in parallelo.

La capacità virtuale è thin: non è spazio host preallocato né mappatura RAM. DynBlk mantiene 128 mappature logiche da 4 KiB in ogni chunk runtime da 4 KiB, quindi la memoria di mappatura densa è circa 8 MiB/GiB. I puntatori dell’albero di livello 0 risiedono con questi chunk sparsi; l’indice fisso dei nodi interni è di 396.312 byte per device collegato, e i contatori di riferimento delle pagine fisiche sono allocati dinamicamente in chunk da 4 KiB che coprono ciascuno 8 MiB di spazio di backing. Quando non viene fornito un budget di mappatura esplicito, il driver DynBlk seleziona autonomamente circa il 25% della RAM utilizzabile riportata dal kernel dopo la normalizzazione a 64 MiB, con un massimo di 4096 MiB. MiniOS lascia questa politica al driver.

Un nuovo volume DynBlk può utilizzare la compressione backend selezionata con `perchcomp`. La compressione è una proprietà del formato di archiviazione DynBlk e rimane fissa per quel volume dopo la creazione. Se LUKS2 avvolge DynBlk, MiniOS imposta la compressione DynBlk su `none`, poiché il layer di cifratura si trova sopra il device DynBlk. Le scritture effettive possono comunque fallire a causa dello spazio libero insufficiente sul filesystem sottostante, del namespace di backing suddiviso in 64 parti o dell’ammissione di mappatura DynBlk. Un device fallito o isolato viene scollegato solo dopo che il filesystem superiore non è più montato; il ripristino convalida il formato memorizzato al prossimo collegamento.

### Raw

La modalità Raw utilizza un solo `changes.img` file che contiene ext4. La dimensione del file viene impostata sulla capacità logica richiesta al momento della creazione, quindi, a differenza dei backend dinamici, la capacità rimane fissa fino a un'espansione esplicita. Il filesystem sottostante può rappresentare in modo sparso le aree non scritte, ma MiniOS considera comunque Raw come uno storage a capacità fissa e verifica lo spazio disponibile prima di creare o espandere il file. Poiché tutto risiede in un unico file host, FAT32 è limitato a 4000 MiB.

Le immagini Raw esistenti vengono controllate con `e2fsck` prima del montaggio in scrittura. L'espansione estende `changes.img` e poi amplia ext4 con `resize2fs`; la riduzione non è supportata. Se il controllo o il montaggio falliscono, l'immagine viene preservata per il recupero e l'avvio prosegue in RAM. Raw non utilizza un demone FUSE né metadati personalizzati per lo storage a blocchi, il che rende il modello di recupero semplice, ma non offre il comportamento a capacità dinamica di DynFileFS e DynBlk.

### Layer di cifratura LUKS

LUKS2 è un layer di cifratura opzionale selezionabile con `perchencrypt=luks` durante la creazione di una sessione Raw, DynFileFS o DynBlk. Le sessioni esistenti prendono lo stato di cifratura dai metadati di sessione; specificare `perchencrypt` successivamente non reinterpreta né converte una sessione plaintext esistente.

Il confine di cifratura dipende dal backend: Raw collega `changes.img` tramite un dispositivo loop e inserisce LUKS2 all'interno di quel file; DynFileFS collega la sua immagine logica esposta `virtual.dat` tramite un dispositivo loop e cifra quell'immagine logica; DynBlk utilizza direttamente il dispositivo a blocchi `/dev/dynblkN` come sorgente LUKS2. In tutti e tre i casi MiniOS crea ext4 all'interno di `/dev/mapper/...`, quindi i contenuti e i metadati del filesystem all'interno del mapper sono cifrati a riposo. I metadati backend fuori dal confine LUKS, i file di avvio, i metadati di sessione e altri file sul supporto di persistenza restano non cifrati.

I valori predefiniti di dimensione, i limiti di crescita, le restrizioni FAT32 e il comportamento thin/fixed di allocazione restano di competenza del backend sottostante. L'initrd autentica prima di espandere un backend cifrato esistente, chiude il mapper prima della crescita del backend, poi lo riapre, controlla ext4 ed espande il filesystem prima di montarlo. Per i DynBlk cifrati, la compressione backend è forzata a `none`.

La creazione richiede l'inserimento della passphrase due volte. Le sessioni cifrate esistenti permettono tre tentativi di sblocco sulla console di avvio. Tre passphrase errate attivano un percorso di avvio fatale: MiniOS non continua in RAM, non reinterpreta la stessa sessione come plaintext, non seleziona un altro backend né crea una sostituzione. Altri errori di creazione, controllo, ridimensionamento o montaggio mantengono il comportamento di recupero specifico del backend senza fallback plaintext. Le passphrase non vengono salvate nei metadati di sessione né passate come argomenti di comando. Le esportazioni logiche contengono i file della sessione decifrati invece di un'immagine backend cifrata.

Vedi [Sicurezza](/maintenance-and-recovery/Security) per il confine di protezione e le considerazioni di backup.

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
