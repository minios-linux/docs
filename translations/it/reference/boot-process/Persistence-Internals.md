---
updated: 2026-08-28
---

# Interni della persistenza

Questa pagina spiega i parametri di avvio `perch`, `perchdir`, `perchmode`, `perchsize` e `perchreserve`. Questi parametri controllano dove vengono salvate le modifiche di una sessione live. Per l’uso normale, seleziona una voce persistente nel menu di avvio oppure utilizza il Gestore sessioni MiniOS invece di modificarli manualmente.

MiniOS costruisce la root live da moduli di sola lettura e un unico livello superiore scrivibile.
L’initrd decide se quel livello superiore sarà una sessione persistente numerata o una directory temporanea in RAM. Questa pagina descrive la scelta e il percorso di attivazione al boot. Per i controlli rivolti all’utente, vedi [Modalità di avvio](/using-minios/Boot-Modes) e [Parametri di avvio](/reference/Boot-Parameters).

## In parole semplici

Senza un parametro di persistenza, MiniOS salva le modifiche in RAM e le elimina allo spegnimento. Un parametro di persistenza chiede a MiniOS di individuare uno spazio di archiviazione scrivibile, selezionare o creare una sessione numerata, verificarne la compatibilità e usare quella sessione come strato scrivibile.

Richiedere la persistenza non garantisce che sia diventata attiva. Se la destinazione è in sola lettura, piena, danneggiata o incompatibile, MiniOS può continuare con uno strato temporaneo RAM. Leggi l’avviso di avvio prima di fare affidamento sulle modifiche salvate.

## Spiegazione dei parametri

| Parametro | Cosa indica a MiniOS | Scelta tipica |
|---|---|---|
| `perchdir=resume` | Apre la sessione compatibile predefinita e, in condizioni supportate, crea una sostituzione quando non può essere utilizzata. | Lavoro quotidiano normale. |
| `perchdir=new` | Crea una nuova sessione numerata. | Mantenere invariato uno spazio di lavoro esistente. |
| `perchdir=ask` | Mostra le sessioni salvate dopo aver trovato uno spazio ripristinabile e permette di sceglierne una. Non può creare la prima sessione su uno spazio vuoto. | Più spazi di lavoro esistenti su un unico dispositivo; usa `perchdir=new` per la prima sessione. |
| `perchdir=NUMBER` | Richiede una specifica sessione numerata. | Voce di avvio personalizzata stabile dopo aver verificato l’ID della sessione. |
| `perchmode=MODE` | Seleziona `native`, `dynfilefs`, `raw`, `luks` o una sessione `squashfs` esistente. | Abbina il filesystem di archiviazione e il requisito di cifratura. |
| `perchsize=SIZE` | Richiede la dimensione di una nuova sessione container o in crescita. | DynFileFS, raw o archiviazione LUKS. |
| `perchreserve=MB` | Sottrae un margine durante il dimensionamento di un nuovo container o in crescita e imposta la soglia di avviso per spazio insufficiente. | Lascia spazio di lavoro quando si alloca un container; non è una quota a runtime. |
| `perch` | Usa il vecchio comportamento di ripresa senza creazione automatica di sostituzioni. | Compatibilità con una voce personalizzata esistente; preferisci `perchdir=resume` per i menu attuali. |

Non combinare la persistenza con `toram` se ti aspetti che le modifiche vengano scritte sul dispositivo originale. MiniOS attiva la sessione copiata in RAM, e le modifiche su quella copia vengono perse allo spegnimento.

## La persistenza è esplicita

L’initrd abilita la gestione della persistenza solo quando la riga di comando del kernel contiene uno di questi token riconosciuti:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Se nessuno di questi token è presente, anche quando è presente solo un nome `perch...` non riconosciuto, MiniOS crea un nuovo strato superiore scrivibile in RAM. Le modifiche apportate durante quell’avvio vengono eliminate allo spegnimento.

I selettori non sono tutti equivalenti:

| Selettore | Comportamento dell’initrd |
|---|---|
| `perch` | Tenta di riprendere il valore predefinito dai metadati. Non crea automaticamente una sessione quando nessuna è utilizzabile o quando i controlli di compatibilità falliscono. |
| `perchdir=resume` | Tenta il valore predefinito dei metadati e può creare automaticamente una nuova sostituzione compatibile. Questo è il comportamento attuale del menu di avvio. |
| `perchdir=new` | Alloca una directory il cui ID numerico è uno superiore al massimo esistente. Non riutilizza mai una directory esistente. |
| `perchdir=ask` | Propone le sessioni esistenti dopo aver trovato uno spazio ripristinabile e il valore predefinito. Una sessione esistente incompatibile richiede conferma. Su spazio vuoto, usa `perchdir=new` per creare la prima sessione. |
| `perchdir=NUMBER` | Usa quella directory se esiste. Se non esiste, la selezione può ricadere sul valore predefinito registrato nei metadati; non riserva il numero richiesto. |

Altri parametri di persistenza riconosciuti senza selettore entrano nello stesso percorso legacy di ripresa di `perch` senza argomenti: richiedono la persistenza, ma non abilitano la creazione automatica. Se la selezione o l’attivazione non producono uno strato superiore utilizzabile, l’avvio prosegue normalmente con lo strato superiore RAM e viene pubblicato un avviso di errore.

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

MiniOS utilizza 256 MiB come margine di allocazione predefinito e soglia di avviso per spazio insufficiente. Il calcolo usa blocchi filesystem da 1024 byte. `perchreserve` accetta un numero intero senza unità, è limitato a 4096 e torna a 256 se mancante o non valido. Il margine riduce lo spazio offerto a un nuovo contenitore o a uno in crescita. Non è una quota: una sessione nativa o scritture successive possono comunque consumare lo spazio restante sul filesystem. All’avvio viene mostrato un avviso quando lo spazio libero attuale è pari o inferiore alla soglia.

Le dimensioni dei contenitori usano conteggi interi allocati in MiB:

- Un numero semplice, `M` o `MB` indica MiB.
- `G` o `GB` moltiplica il numero per 1000 MiB.
- `T` o `TB` moltiplica il numero per 1.000.000 MiB.
- La richiesta logica massima è 1.000.000 MiB, ulteriormente limitata dallo spazio disponibile dopo la riserva.
- Il Gestore sessioni MiniOS limita file raw e LUKS a 4000 MiB su FAT32. Durante l’attivazione dell’initrd il limite viene applicato in modo affidabile a LUKS, mentre una richiesta raw troppo grande può arrivare all’allocazione e fallire invece di essere ridotta.
- Le nuove sessioni raw e LUKS hanno come predefinito 4000 MiB.
- Una nuova sessione DynFileFS creata da initrd ha come predefinito la capacità disponibile dopo la riserva, arrotondata per difetto a un multiplo di 1000 MiB quando possibile.

La crescita dei contenitori è best-effort e la riduzione non è supportata. `perchsize` non dimensiona sessioni native o SquashFS. Il Gestore sessioni MiniOS usa il proprio valore predefinito di 4000 MiB per le nuove sessioni contenitore; vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione dello storage

Tutte le modalità di successo devono fornire lo strato superiore scrivibile atteso dal filesystem union selezionato. Il mount di un backend non prova da solo che la persistenza sia attiva. Native, DynFileFS, raw e LUKS possono aggiornare i metadati della sessione persistente prima della validazione del union; SquashFS rinvia quel commit dei metadati. Lo stato protetto della sessione corrente viene pubblicato solo dopo che il root union finale è stato confermato con lo strato superiore atteso.

### Native

La modalità Native esclude innanzitutto filesystem noti come non POSIX, come FAT, exFAT e NTFS. Poi verifica il comportamento reale del filesystem creando un file e un collegamento simbolico e controllando le modifiche ai permessi eseguibili. Se la verifica ha successo, la directory della sessione numerata viene montata in bind direttamente come area scrivibile.

Se il filesystem è noto come non idoneo, o la verifica POSIX fallisce, la modalità Native passa a DynFileFS. Un errore dopo l’attivazione Native viene annullato; un nuovo candidato vuoto viene rimosso quando è sicuro farlo.

### DynFileFS

DynFileFS, implementato dall’helper compatibile `dynblk`, memorizza un’immagine logica a blocchi in `changes.dat` più i suoi file di segmento numerati. L’helper deve montare con successo ed esporre `virtual.dat`; altrimenti l’attivazione fallisce invece di creare accidentalmente un file solo RAM con un nome che sembra persistente.

L’immagine logica contiene ext4. Le immagini esistenti vengono controllate prima del mount in scrittura; risultati del filesystem-check superiori allo stato "errori corretti" rifiutano la sessione invece di montarla in scrittura. Il ridimensionamento è solo in crescita e il filesystem ext4 interno viene espanso quando possibile. Per la diagnosi lato utente, vedi [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

### Raw

La modalità Raw utilizza un’immagine ext4 fissa `changes.img`. Le nuove immagini vengono allocate e formattate prima dell’uso. Le immagini esistenti vengono controllate prima del mount, possono essere ingrandite su richiesta e hanno ext4 espanso per utilizzare tutta l’immagine. Un controllo o mount fallito lascia il container disponibile per il recupero e prosegue l’avvio in RAM.

### LUKS

La modalità LUKS utilizza un container LUKS2 `changes.luks` con ext4 direttamente all’interno.
È disponibile solo quando l’initrd include il marker di supporto per la cifratura e gli strumenti necessari. La creazione richiede un input di conferma corrispondente. Un container esistente consente tre tentativi di sblocco sulla console di avvio.

L’initrd autentica prima di aumentare la dimensione di un file cifrato esistente, poi controlla ed espande ext4 prima del mount. Se la creazione, lo sblocco, il controllo, il ridimensionamento o il mount falliscono, MiniOS pulisce la mappatura e prosegue in RAM. Non passa mai a modalità native, DynFileFS, raw o altre persistenze non cifrate.
Le passphrase non vengono salvate nei metadati della sessione né passate come argomenti di comando.
Vedi [Sicurezza](/maintenance-and-recovery/Security).

### SquashFS

L’initrd può attivare solo una sessione SquashFS esistente; non può crearne una nuova con `changes.sb`. L’attivazione convalida metadati rigorosi e a valore singolo per lo snapshot, inclusi il digest, le dimensioni compresse e non compresse, il conteggio delle voci, il tipo di union e la policy di salvataggio. Controlla inoltre il tipo di file e la dimensione esatta, la RAM disponibile e lo swap, il digest SHA-256 prima e dopo l’estrazione e la compatibilità union attuale.

Lo snapshot viene estratto con gestione rigorosa degli errori e degli xattr in un’immagine ext4 temporanea e limitata in RAM. Per OverlayFS, quell’immagine contiene directory `changes` e `workdir` separate; per AUFS, la root è il ramo scrivibile.
Metadati non validi, memoria insufficiente, cambiamenti nel digest, errori di estrazione o una policy non valida fanno fallire l’attivazione e lasciano il boot sul normale upper RAM.

Una sessione contrassegnata `dirty` significa che il precedente avvio non ha completato la transizione di spegnimento pulito. SquashFS quindi avvisa e ripristina l’ultimo `changes.sb` salvato con successo; le modifiche non salvate dall’avvio interrotto non costituiscono una seconda generazione di rollback.

Il Gestore sessioni MiniOS e il backend di salvataggio di sistema creano e sostituiscono in modo atomico gli snapshot SquashFS usando una cattura esatta. L’attivazione al boot può leggere uno snapshot esistente da storage FAT, exFAT o NTFS scrivibili perché l’estrazione avviene nel livello superiore ext4 temporaneo. La creazione e il salvataggio esatto restano vincolati dal filesystem: la loro area di staging privata deve preservare link, proprietà, permessi, xattr, ACL, capability e whiteout union, quindi il salvataggio attuale richiede un filesystem POSIX idoneo. Vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione union e confine di ripristino

Per AUFS, la root delle modifiche attivata diventa il ramo zero scrivibile. Per OverlayFS, l’initrd costruisce `upperdir` e `workdir` sotto la root delle modifiche attivata e monta i moduli in sola lettura come directory inferiori. L’initrd quindi verifica il ramo AUFS live o OverlayFS `upperdir` prima di pubblicare la persistenza come attiva.

Se un backend di persistenza, un aggiornamento dei metadati o questa verifica falliscono, i mount vengono annullati dove possibile, nessuno stato di persistenza viene pubblicato e l’avvio scrivibile prosegue in RAM. Il fallimento nella costruzione del root union entra nella shell fatale di initramfs. Uscire da quella shell può far continuare la configurazione con una root non valida; non è una riparazione né un fallback sicuro. AUFS mantiene l’append dei moduli best-effort, ma una union incompleta attraversa il confine di ripristino: MiniOS non segna la persistenza come attiva.

I fallimenti nei controlli dei container evitano deliberatamente il mount in scrittura di una sessione sospetta.
Non sostituire né ricostruire file di sessione durante l’avvio. Prima preserva lo storage interessato; vedi [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Stato attivo, in esecuzione e dell’avvio corrente

Nei metadati di sessione durevoli, `default=` è la sessione **attiva** selezionata per il prossimo ripristino, mentre `running=` è la sessione registrata come fornitrice dell’avvio corrente. L’attivazione scrive entrambi i campi e marca quella sessione come `dirty`.
Dopo che i mount di persistenza sono stati rimossi durante uno spegnimento pulito, MiniOS elimina `running=` e marca la sessione come `clean`.

Questi campi dei metadati possono essere obsoleti dopo un crash, un errore di scrittura dei metadati, un fallimento nella costruzione del union, una copia dell’archivio o uno spegnimento interrotto. I componenti runtime che consentono il salvataggio non si fidano solo di `running=`. Usano lo stato protetto dell’avvio corrente dell’initrd, legato all’ID di avvio, sessione numerica, modalità, identità reale dell’archivio, stato scrivibile, durabilità e generazione attiva verificata. Un record di avvio corrente fallito o mancante significa che la persistenza non deve essere trattata come destinazione di salvataggio approvata.

Con `toram` e una richiesta di persistenza riconosciuta, l’archivio delle sessioni viene copiato in RAM prima dell’attivazione. La sessione copiata può essere scrivibile e può fornire lo strato superiore in esecuzione, ma il suo stato di avvio corrente è marcato come non durevole. Le modifiche a quella copia RAM non tornano sul dispositivo originale e vengono perse allo spegnimento.

Per indicazioni operative correlate, vedi [Modalità di avvio](/using-minios/Boot-Modes), [Parametri di avvio](/reference/Boot-Parameters), [Sessioni e persistenza](/using-minios/Sessions-and-Persistence), [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicurezza](/maintenance-and-recovery/Security) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).
