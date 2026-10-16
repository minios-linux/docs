---
updated: 2026-10-15
---

# Meccanismi interni della persistenza

Questa pagina spiega `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, e `perchtoram` parametri di avvio. Questi parametri determinano dove vengono memorizzate le modifiche apportate durante una sessione live, come viene creata una nuova sessione e se lo spazio di archiviazione supportato per le sessioni viene copiato in RAM. Per l’uso normale, seleziona una voce persistente nel menu di avvio oppure usa il Gestore sessioni MiniOS invece di modificarli manualmente.

MiniOS crea la root live a partire da moduli di sola lettura e da un livello superiore scrivibile.
L’initrd determina se tale livello superiore è una sessione persistente numerata o una directory temporanea in RAM. Questa pagina descrive la decisione presa all’avvio e il percorso di attivazione. Per i controlli destinati agli utenti, consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Parametri di avvio](/reference/Boot-Parameters).

## In parole semplici

Senza un parametro di persistenza, MiniOS inserisce le modifiche in RAM e le elimina allo spegnimento. Un parametro di persistenza chiede a MiniOS di individuare uno spazio di archiviazione scrivibile, selezionare o creare una sessione numerata, verificarne la compatibilità e usarla come livello scrivibile.

Richiedere la persistenza non garantisce che sia stata attivata. Se la destinazione è di sola lettura, piena, danneggiata o incompatibile, MiniOS può continuare a usare un livello RAM temporaneo. Leggi l'avviso di avvio prima di fare affidamento sulle modifiche salvate.

## Spiegazione dei parametri

| Parametro | A cosa serve MiniOS | Scelta tipica |
|---|---|---|
| `perchdir=resume` | Apri la sessione compatibile predefinita e, se le condizioni lo consentono, creane una sostitutiva quando non è possibile usarla. | Per il lavoro quotidiano. |
| `perchdir=setup` | Scegli in modo interattivo il backend di persistenza e le opzioni di crittografia/compressione supportate, quindi crea una nuova sessione numerata. | Voce corrente del **Avviare una nuova sessione** del menu di avvio. |
| `perchdir=new` | Crea direttamente una nuova sessione numerata usando il valore richiesto/predefinito per `perchmode`, la crittografia, la compressione e le dimensioni, senza mostrare la selezione del backend. | Voci di avvio per script o utenti esperti, con le opzioni di archiviazione già specificate. |
| `perchdir=ask` | Mostra le sessioni salvate e consente di sceglierne una. Se non ci sono sessioni salvate nell'archivio, la schermata di selezione avvia lo stesso flusso di configurazione usato da `perchdir=setup`. | Più aree di lavoro su un dispositivo, inclusa la prima configurazione interattiva su uno spazio di archiviazione vuoto. |
| `perchdir=NUMBER` | Richiedi una sessione numerata specifica. | Voce di avvio personalizzata stabile dopo aver verificato l'ID sessione. |
| `perchmode=MODE` | Seleziona `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, oppure `squashfs`. | Scegli in base al file system sottostante e al modello di persistenza desiderato. |
| `perchencrypt=luks` | Aggiungi un livello LUKS2 quando crei una sessione Raw, DynFileFS, DynBlk o VMDK. | Crittografa un backend container supportato. |
| `perchsize=SIZE` | Specifica le dimensioni di una sessione container nuova o in espansione. | DynFileFS, DynBlk, VMDK o raw; la crittografia non modifica la semantica delle dimensioni del backend. |
| `perchcomp=CODEC` | Seleziona la compressione del backend DynBlk per una nuova sessione DynBlk. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oppure `842`; la disponibilità dipende comunque dal kernel in esecuzione. La compressione è disabilitata quando LUKS racchiude DynBlk. |
| `perchreserve=MB` | Sottrai un margine quando definisci le dimensioni di un container nuovo o in espansione e imposta la soglia di avviso di spazio insufficiente. | Lascia spazio libero quando allochi un container; non è una quota in fase di esecuzione. |
| `perch` | Usa il comportamento di ripresa precedente, senza creare automaticamente una sessione sostitutiva. | Compatibilità con una voce personalizzata esistente; per i menu attuali, preferisci `perchdir=resume` . |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Controlla la copia della persistenza separatamente dalla `toram` del sistema. | `off` mantiene attivo l'archivio originale; `trim` copia solo la sessione supportata selezionata; `full` copia tutte le sessioni container/SquashFS supportate. |

Quando viene richiesta la persistenza, la `toram` rende `perchtoram=trim` l'impostazione predefinita, a meno che non venga specificata una modalità persistence-RAM esplicita. Senza la `toram` del sistema, la persistenza rimane per impostazione predefinita sullo spazio di archiviazione. Una sessione copiata non è persistente durante l'esecuzione, ma l'attuale Session Manager può salvare esplicitamente nello store originale lo stato supportato basato su RAM oppure pubblicarlo come nuova sessione, se lo store originale è disponibile e corrisponde all'identità rilevata all'avvio.

## La persistenza è esplicita

initrd abilita la gestione della persistenza solo se la riga di comando del kernel contiene uno di questi token riconosciuti:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Se non è presente nessuno di questi token, anche quando è presente solo un `perch...` name non riconosciuto, MiniOS crea una nuova area superiore scrivibile in RAM. Le modifiche apportate durante l'avvio vengono eliminate allo spegnimento.

I selettori non sono tutti equivalenti:

| Selettore | Comportamento di initrd |
|---|---|
| `perch` | Tenta di riprendere la sessione predefinita indicata nei metadati. Non crea automaticamente una sessione se non ce n'è una utilizzabile o se i controlli di compatibilità non vengono superati. |
| `perchdir=resume` | Tenta di riprendere la sessione predefinita indicata nei metadati e può creare automaticamente una nuova sessione compatibile in sostituzione. Questo è il comportamento attuale di ripresa dal menu di avvio. |
| `perchdir=setup` | Apre prima la finestra di scelta del backend, registra la richiesta di backend/crittografia/compressione selezionata, quindi segue il percorso di allocazione di una nuova sessione. |
| `perchdir=new` | Alloca una directory con ID numerico pari a uno in più rispetto all'ID numerico più alto esistente. Non riutilizza mai una directory esistente e non apre la finestra di scelta del backend. |
| `perchdir=ask` | Se presenti, propone le sessioni esistenti; per usare una sessione esistente incompatibile è necessaria una conferma. Se nell'archivio non è presente una sessione predefinita o alcuna sessione, passa a `setup` per consentire la creazione interattiva della prima sessione. |
| `perchdir=NUMBER` | Usa quella directory se esiste. Se non esiste, la selezione può ricadere sulla sessione predefinita registrata nei metadati; il numero richiesto non viene riservato. |

Gli altri parametri di persistenza riconosciuti, se non specificano un selettore, seguono lo stesso percorso legacy di ripresa di `perch`: richiedono la persistenza, ma non abilitano la creazione automatica. `perchtoram` da solo non è una richiesta di persistenza. Se la selezione o l'attivazione non produce un'area superiore utilizzabile, l'avvio prosegue normalmente con l'area superiore RAM e viene pubblicato un avviso di errore.

## Posizione e archivio delle sessioni

L’archivio predefinito è la `changes` directory accanto ai dati MiniOS, con directory delle sessioni numerate e metadati `session.conf` oppure `session.json` :

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

L’archivio può essere selezionato anche come dispositivo con un percorso facoltativo. Tra i formati accettati ci sono un percorso `/dev/...` diretto, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, e `askdisk:custom:path`. Il suffisso separato da due punti diventa un percorso all’interno del dispositivo selezionato; la sintassi con slash dopo `askdisk` ignora silenziosamente il percorso personalizzato. Una sottodirectory selezionata viene montata con bind mount come archivio delle sessioni. MiniOS può anche individuare una partizione di persistenza sulla stessa unità e uno storage di persistenza Ventoy supportato.

Prima di selezionare una sessione, l’initrd deve montare la posizione in scrittura e verificare che sia possibile creare ed eliminare un file segnaposto nell’archivio. Se non è possibile aprire un dispositivo a blocchi in scrittura, il mount è in sola lettura, il percorso non è disponibile o il test di scrittura non riesce, la persistenza viene disattivata per quell’avvio. Le sessioni esistenti non sono considerate attendibili solo perché i relativi file sono leggibili.

## Selezione e compatibilità

I metadati della sessione registrano la modalità di archiviazione e possono includere la versione di MiniOS, l’edizione, il filesystem union e le dimensioni del container. Per riprendere una sessione, la modalità, la versione, l’edizione e il filesystem union registrati vengono confrontati con quelli richiesti e con il sistema attuale.
L’assenza di campi di compatibilità legacy non viene considerata una mancata corrispondenza.

Il valore letterale `perchdir=resume` crea una nuova sessione numerata se il valore predefinito non è disponibile o se una mancata corrispondenza della modalità, della versione, dell’edizione o del filesystem union registrati rende inadeguato il valore predefinito. Il comando `perch`, una selezione numerica diretta e le altre richieste legacy di ripresa rifiutano la sostituzione automatica e continuano in RAM se la selezione non riesce. `perchdir=ask` mostra le informazioni di compatibilità e consente di applicare una sostituzione esplicita. Per una nuova sessione, la modalità predefinita è `native`, salvo che sia stata richiesta un’altra modalità.

La modalità di archiviazione è parte integrante della compatibilità. Se la selezione arriva alla fase di invio al backend, una modalità richiesta sconosciuta viene sostituita da `native`, il cui controllo può selezionare DynBlk o DynFileFS se l’archiviazione non è adatta. Una sessione esistente con una modalità registrata diversa può invece non superare il precedente controllo di compatibilità; in tal caso, una richiesta legacy di ripresa continua in RAM invece di raggiungere questo ripiego.

### Ripristino di una sessione incompatibile

La selezione interattiva offre **Ripristina, mantieni le impostazioni** e **Ripristina, mantieni i dati** oltre a tornare all’elenco o continuare esplicitamente senza ripristinare. Il ripristino viene eseguito prima dell’attivazione dell’union. Rimuove gli alberi di programmi e librerie di sistema, lo stato del gestore pacchetti di sistema, il software Flatpak/Snap installato a livello di sistema e le cache. Gli elenchi dei file dei pacchetti aiutano a identificare il software installato altrove; i file non elencati vengono conservati per prudenza.

Entrambe le modalità mantengono `/home` e `/root`, inclusi file di configurazione nascosti, cache, profili del browser e programmi installati nella directory home. Mantengono anche account, mappature UID/GID, password, chiavi host SSH, chiavi TLS private e dati conservati al di fuori delle directory home. La modalità che preserva le impostazioni mantiene le normali `/etc` e la configurazione dei pacchetti; la modalità che conserva solo i dati ripristina queste impostazioni di sistema mantenendo la configurazione personale nelle directory home. Questo non permette di identificare tutti i programmi installati manualmente in percorsi arbitrari.

Una copia upper sostitutiva viene preparata accanto all’originale, quindi è necessario spazio libero sufficiente per una seconda copia dei dati conservati. In caso di errore durante la copia o la sostituzione, viene eseguito il rollback; le transazioni interrotte vengono ripristinate al mount successivo. Il ripristino di SquashFS modifica solo la sua upper RAM ricostruita: la vecchia snapshot e i metadati di compatibilità restano autorevoli finché non viene salvata correttamente l’upper ripristinata. Il ripristino da una sessione nativa disabilita `perchtoram` per quell’avvio, per evitare di sostituire i dati conservati con un container RAM vuoto. La ripresa automatica non ripristina mai una sessione senza avvisare.

## Riserva di spazio e dimensioni

MiniOS usa 256 MiB come margine di allocazione predefinito e soglia di avviso per lo spazio insufficiente. Il calcolo usa blocchi del file system da 1024 byte. `perchreserve` accetta un numero intero senza segno e senza unità, con un limite massimo di 4096; se manca o non è valido, il valore predefinito è 256. Il margine riduce lo spazio offerto a un nuovo contenitore o a uno in fase di crescita. Non è una quota: una sessione nativa o scritture successive possono comunque occupare lo spazio residuo del file system. All'avvio viene visualizzato un avviso quando lo spazio libero corrente è pari o inferiore alla soglia.

Le dimensioni dei contenitori sono espresse in numeri interi, allocati in MiB:

- Un numero senza unità, `M` oppure `MB` indica MiB.
- `G` o `GB` moltiplica il numero per 1000 MiB.
- `T` o `TB` moltiplica il numero per 1.000.000 MiB.
- I contenitori Raw hanno un limite massimo di 1.000.000 MiB e sono limitati dallo spazio disponibile dopo la riserva. DynFileFS ha un limite separato basato su RAM e un tetto massimo di 2.000.000 MiB. DynBlk ricava il limite geometrico del formato nativo da `dynblk limits --format dynblk`; MiniOS non impone un limite massimo separato di 512 GiB.
- Raw è costituito da un singolo file di supporto, quindi FAT32 ne limita la dimensione a 4000 MiB in MiniOS. Lo stesso limite si applica quando Raw è racchiuso in LUKS2.
- Una nuova sessione Raw ha una dimensione predefinita di 4000 MiB. La cifratura non introduce una policy separata per le dimensioni LUKS: una sessione Raw cifrata, DynFileFS, DynBlk o VMDK mantiene le regole dimensionali del backend sottostante.
- Una nuova sessione DynFileFS creata da initrd, senza `perchsize` usa fino a 16 GiB di capacità logica. Se il supporto di archiviazione non può contenere effettivamente tale quantità dopo `perchreserve` e il sovraccarico dell'indice DynFileFS, la dimensione predefinita viene ridotta alla capacità disponibile. Il suo indice in formato 400 richiede circa 2 MiB di RAM e circa 2 MiB di spazio di archiviazione per ogni GiB di capacità logica dichiarata, anche quando il payload è vuoto. MiniOS limita quindi anche la capacità DynFileFS in base allo spazio fisico RAM e a un tetto massimo verificato di 2.000.000 MiB.
- Una nuova sessione DynBlk senza `perchsize` segue lo stesso limite automatico di 16 GiB e viene ridotta se lo spazio di archiviazione residuo dopo `perchreserve` è inferiore. Una dimensione DynBlk esplicita è una richiesta di capacità thin, verificata rispetto al limite del backend installato. I metadati delle parti dichiarate vengono creati inizialmente, mentre lo spazio per il payload aumenta su richiesta. DynBlk dispone di una cache di metadati con limiti propri, indipendente dal riempimento del payload.

La crescita dei contenitori è soggetta alla disponibilità di risorse e non è possibile ridurne le dimensioni. `perchsize` non imposta le dimensioni delle sessioni native o SquashFS. Il Gestore sessioni MiniOS imposta per impostazione predefinita 4000 MiB per i contenitori Raw e DynFileFS creati manualmente, e 16 GiB per i contenitori DynBlk/VMDK; le varianti cifrate usano gli stessi valori predefiniti del backend. Vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione dello storage

Tutti i backend che funzionano correttamente devono fornire il livello superiore scrivibile previsto dal filesystem union selezionato. Montare un backend non dimostra, di per sé, che la persistenza sia attiva. Native, DynFileFS, DynBlk, VMDK e raw possono aggiornare i metadati persistenti della sessione prima della convalida union; SquashFS rimanda il commit di questi metadati. Raw, DynFileFS, DynBlk e VMDK possono inoltre usare la crittografia LUKS2. Lo stato protetto dell'avvio corrente viene pubblicato solo dopo aver confermato che la union root finale usa il livello superiore previsto.

| Backend | Rappresentazione persistente | Modello di capacità | Requisiti dello storage di backing | MiniOS livello LUKS2 |
|---|---|---|---|---|
| `native` | File e directory direttamente nella directory di sessione numerata | Usa direttamente lo spazio del filesystem di backing; `perchsize` non si applica | Filesystem scrivibile che supera il test del comportamento POSIX | No |
| `dynfilefs` | Formato-400 `changes.dat` più file di segmento che espongono un ext4 `virtual.dat` | Payload thin con indice denso dimensionato in base alla capacità | Storage scrivibile POSIX, FAT32, NTFS o exFAT | Sì |
| `dynblk` | File Format-1 `volumeNNN.db` che espongono `/dev/dynblkN`, con ext4 sovrapposto | Dispositivo a blocchi virtuale thin con mapping memorizzati su disco e cache limitata | Filesystem supportato dal backend kernel DynBlk e risorse backend sufficienti | Sì |
| `vmdk` | `volume.vmdk` più extent sparse suddivisi `volume-sNNN.vmdk` esposti dal driver DynBlk, con ext4 sovrapposto | Dispositivo a blocchi virtuale thin suddiviso e sparse | Filesystem supportato dal backend VMDK DynBlk e dalla funzionalità `vmdk-session-v1` corrispondente | Sì |
| `raw` | Un singolo file `changes.img` di dimensione fissa contenente ext4 | Il file viene creato con la dimensione logica richiesta; può solo aumentare | Filesystem scrivibile in grado di contenere l'immagine; FAT32 è limitato a 4000 MiB | Sì |
| `squashfs` | Snapshot `changes.sb` compresso; il livello superiore scrivibile in runtime viene ricostruito in RAM | La dimensione dello snapshot dipende dalle modifiche acquisite; `perchsize` non si applica | Gli snapshot esistenti possono essere letti da supporti scrivibili supportati; per salvarli correttamente serve un archivio di persistenza compatibile con POSIX | No |

### Nativo

La modalità nativa archivia direttamente i contenuti scrivibili dell’unione nella directory di sessione numerata. Non ci sono immagini interne, dispositivi loop, contenitori FUSE o filesystem a blocchi separati, quindi la capacità dipende semplicemente dallo spazio libero nel filesystem sottostante e `perchsize` non si applica. Questa modalità riduce al minimo l’overhead del contenitore e mantiene i file normalmente visibili per il ripristino e il backup.

MiniOS esclude innanzitutto i filesystem noti per non essere POSIX, come FAT, exFAT e NTFS. Quindi verifica il comportamento effettivo del filesystem creando un file e un collegamento simbolico e controllando le modifiche alla modalità di esecuzione. Se la verifica riesce, la directory di sessione numerata viene montata direttamente come area scrivibile. Se lo spazio di archiviazione non è idoneo o la verifica non riesce, durante la creazione nativa viene preferito DynBlk se la relativa CLI è disponibile e Secure Boot lo consente; in caso contrario, viene usato DynFileFS. Questa scelta iniziale non garantisce che il driver selezionato riesca ad associarsi o che siano supportati tutti i filesystem sottostanti. Un errore dopo l’attivazione nativa viene annullato; un nuovo candidato vuoto viene rimosso, se è possibile farlo in sicurezza.

Il livello di persistenza LUKS2 MiniOS non avvolge la modalità nativa, perché quest’ultima non ha un contenitore né un confine di dispositivo a blocchi da cifrare. La persistenza nativa può comunque risiedere in uno spazio di archiviazione cifrato al di fuori di questo livello di persistenza.

### DynFileFS

DynFileFS è il backend per container in formato 400 basato su FUSE. Espone un'unica`virtual.dat` immagine logica e archivia i dati in`changes.dat` oltre a file di segmento numerati. L'helper deve eseguire correttamente il mount ed esporre`virtual.dat`; in caso contrario, l'attivazione non riesce, evitando così la creazione accidentale di un file composto solo da RAM con un nome che sembra persistente.

L'indice di mappatura è denso rispetto alla capacità logica dichiarata: ogni blocco logico da 4 KiB ha un offset di 8 byte. Ciò equivale a circa 2 MiB di RAM dell'indice per ogni GiB di capacità virtuale; una quantità pressoché uguale viene archiviata anche negli indici dei segmenti di supporto, prima ancora che vengano scritti i dati. L'allocazione dei dati avviene invece dinamicamente. Poiché il binario statico di initrd è i686, MiniOS applica anche un limite alle dimensioni logiche compatibile con RAM e un tetto massimo di 2.000.000 MiB, inferiore al punto in cui è stato verificato il fallimento dello spazio degli indirizzi.

L'immagine logica contiene ext4. Le immagini esistenti vengono controllate prima del mount in scrittura; se l'esito del controllo del filesystem è più grave dello stato «errori corretti», la sessione viene rifiutata anziché eseguire il mount in scrittura. È possibile solo aumentare le dimensioni e, quando possibile, viene espanso il filesystem ext4 interno. Per diagnosticare il problema, consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

### DynBlk

La `dynblk` modalità utilizza un dispositivo a blocchi del kernel, separato da DynFileFS. Ogni sessione numerata gestisce `volume000.db` e tutti i dispositivi con numerazione successiva (`volume001.db`, ..., `volume1000.db`, e oltre). Il layout nativo è `DBSPRS01`, formato disco **1**. I layout non supportati vengono rifiutati, anziché convertiti silenziosamente. Mantieni allineate le versioni della CLI installata e del modulo.

MiniOS crea un filesystem ext4 sull'intero disco restituito da `/dev/dynblk-control`, ad esempio `/dev/dynblk3`; non presume che `dynblk0` sia libero. Prima di consentirne l'uso in scrittura, verifica che il filesystem ext4 esistente sia integro. I record protetti dello stato di avvio identificano il dispositivo esatto, in modo che allo spegnimento venga scollegato solo dopo la chiusura dei processi che lo usano e del filesystem superiore. Possono coesistere più dispositivi indipendenti.

Session Manager, il programma di installazione e initramfs interrogano `dynblk limits --format dynblk` per ottenere il limite geometrico del backend installato. L'attuale protezione delle risorse consente 65536 parti: con intervalli logici standard da 1 GiB, si arriva a 64 TiB. Limiti inferiori al numero di parti fisiche riducono il limite virtuale. Si tratta di un limite geometrico, non della garanzia che l'host possa mantenere aperti tanti file o disponga di RAM/spazio di archiviazione sufficiente. È possibile aumentare le dimensioni, ma non ridurle.

Le tabelle di mapping risiedono su disco. `--map-memory-mb` controlla una cache dei metadati per dispositivo (1 MiB per impostazione predefinita, intervallo da 1 a 64 MiB): non è più una percentuale di RAM né un limite ai dati mappati. Le descrizioni delle extent, i vettori dei file aperti e le directory di piccole dimensioni crescono in base alla geometria dichiarata, non alla quantità di payload utilizzata. Durante il collegamento vengono analizzati i metadati di mapping e lo stato di allocazione viene ricostruito temporaneamente, una parte alla volta; non viene letto ogni payload. Il controllo completo di `dynblk check` legge anche i payload. `engine_memory_bytes` non include la cache delle pagine del filesystem, le strutture interne del codec né altre allocazioni del kernel.

I file di metadati per tutte le parti dichiarate vengono inizializzati al momento della creazione o dell'espansione; i dati effettivi restano allocati in modo dinamico. Le parti sono limitate a 4000 MiB. Esegui il backup dell'intero namespace scollegato, senza presumere che i numeri abbiano tre cifre o che esista una parte finale fissa. Per un nuovo volume è possibile selezionare la compressione con `perchcomp`; i caricamenti successivi usano il codec salvato. LUKS2 sopra DynBlk forza la compressione a `none`. Le scritture parziali di dati compressi attualmente ricomprimono il blocco da 64 KiB corrispondente. L'esaurimento dello spazio di archiviazione o delle risorse può comunque causare errori di scrittura; prima di scollegare il filesystem superiore, è necessario smontarlo.

### Sessioni VMDK

La modalità sessione `vmdk` utilizza lo stesso driver con immagini `twoGbMaxExtentSparse`
reali. Il file primario è `volume.vmdk`, con `volume-s001.vmdk` e parti successive
; ogni parte copre fino a 2 GiB di spazio logico. Il descrittore è limitato
a meno di 1 MiB, quindi la lunghezza del nome file e il numero di extent limitano la capacità.
Session Manager, Installer e initramfs interrogano `dynblk limits --format vmdk`.
Il formato nativo DynBlk continua a utilizzare `volume000.db`; nessuno dei due formati interpreta i file
dell'altro. Le sessioni gestite non importano un VMDK partizionato arbitrariamente dall'esterno
come metadati di sessione.

Il supporto alle sessioni VMDK è dichiarato da `vmdk-session-v1` in
`/etc/minios-initramfs-dynblk` all'interno dell'initrd. Il runtime corrente e ogni initrd sorgente copiato da Installer
 devono supportarlo. VMDK non dispone di compressione nativa;
`perchcomp` viene ignorato con un avviso all'avvio e Session Manager rifiuta un codec VMDK
non-`none`VMDK. LUKS2 resta un livello di crittografia separato e facoltativo. Entrambe le modalità pubblicano
la modalità di sessione effettiva e il dispositivo proprietario `dynblk_device`nello stato di avvio protetto,
ed entrambe le implementazioni di arresto chiudono il dispositivo dopo l'uscita dei relativi utenti.

Entrambi i formati dei driver supportano `writeback`, `writethrough`, `none`, `directsync` e criteri espliciti di `unsafe`collegamento. Le modalità dirette richiedono attualmente ext2/ext4 come filesystem sottostante. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback`collega un filesystem esistente; `umount`rilascia il dispositivo gestito dall'helper dopo la chiusura da parte dell'ultimo utente. La modalità manuale `dynblk load`ha un ciclo di vita esplicito. Non crea un filesystem né sblocca LUKS.

È supportato il backing tmpfs per entrambi i formati con `writeback`, `writethrough` e `unsafe`; le modalità direct I/O vengono rifiutate anziché modificate silenziosamente. L'ordine delle operazioni di flush non rende persistente una sessione basata su tmpfs dopo l'arresto. Questo supporto è alla base delle sessioni DynBlk/VMDK RAM, le cui modifiche devono essere salvate esplicitamente nell'archivio originale.

### Raw

La modalità Raw usa un `changes.img` file che contiene ext4. Al momento della creazione, la lunghezza del file viene impostata sulla capacità logica richiesta; quindi, a differenza dei backend dinamici, la capacità resta fissa finché non viene eseguita un'operazione esplicita di ampliamento. Il filesystem sottostante può rappresentare in modo sparso le extent non scritte, ma MiniOS considera comunque Raw uno storage a capacità fissa e verifica lo spazio disponibile sul supporto prima di crearlo o ampliarlo. Poiché tutto risiede in un unico file host, FAT32 è limitato a 4000 MiB.

Le immagini Raw esistenti vengono controllate con `e2fsck` prima del montaggio in scrittura. L'ampliamento estende `changes.img` e poi amplia ext4 con `resize2fs`; la riduzione non è supportata. Se il controllo o il montaggio non riescono, l'immagine viene preservata per il ripristino e l'avvio prosegue in RAM. Raw non usa un daemon FUSE né metadati personalizzati per lo storage a blocchi, il che semplifica il ripristino, ma non offre il comportamento a capacità thin di DynFileFS e DynBlk.

### Livello di crittografia LUKS

LUKS2 è un livello di crittografia opzionale, selezionabile con `perchencrypt=luks` durante la creazione di una sessione Raw, DynFileFS, DynBlk o VMDK. Per le sessioni esistenti, lo stato della crittografia è determinato dai metadati della sessione; specificare `perchencrypt` in un secondo momento non modifica né converte una sessione esistente in testo in chiaro.

Il punto in cui viene applicata la crittografia dipende dal backend: Raw collega `changes.img` tramite un dispositivo loop e inserisce LUKS2 al suo interno; DynFileFS collega `virtual.dat` esposto tramite un dispositivo loop e crittografa l'immagine logica; DynBlk usa direttamente il dispositivo a blocchi `/dev/dynblkN` allocato; VMDK usa il dispositivo a blocchi esposto dallo stesso driver DynBlk per la sua immagine sparse suddivisa. In tutti e quattro i casi, MiniOS crea ext4 all'interno di `/dev/mapper/...`, quindi i contenuti e i metadati del file system all'interno del mapper sono crittografati quando il dispositivo è inattivo. I metadati del backend esterni al perimetro LUKS, i descrittori VMDK, i file di avvio, i metadati della sessione e gli altri file sul supporto di persistenza restano non crittografati.

Le dimensioni predefinite, i limiti di crescita, le restrizioni di FAT32 e il comportamento di allocazione thin/fixed dipendono comunque dal backend sottostante. Prima di aumentare le dimensioni di un backend crittografato esistente, initrd autentica l'utente; quindi chiude il mapper prima di procedere alla crescita del backend, lo riapre, verifica ext4 ed espande il file system prima di montarlo. Per i DynBlk crittografati, la compressione del backend è forzata a `none`.

Durante la creazione, viene chiesto di inserire la passphrase due volte. Per sbloccare le sessioni crittografate esistenti, sono consentiti tre tentativi nella console di avvio. Dopo tre passphrase non valide viene avviata una procedura di avvio fatale: MiniOS non prosegue in RAM, non tratta la stessa sessione come testo in chiaro, non seleziona un altro backend e non ne crea una sostitutiva. Gli errori durante la creazione, la verifica, il ridimensionamento o il montaggio seguono le procedure di ripristino specifiche del backend, senza ricorrere al testo in chiaro. Le passphrase non vengono salvate nei metadati della sessione né passate come argomenti dei comandi. Le esportazioni logiche contengono i file della sessione decrittografati, non l'immagine del backend crittografata.

Consulta [Sicurezza](/maintenance-and-recovery/Security) per informazioni sul perimetro di protezione e sulle precauzioni per i backup.

### SquashFS

L’initrd attiva normalmente una sessione SquashFS esistente. La configurazione interattiva crea metadati di generazione zero con il salvataggio all’arresto abilitato, ma non crea `changes.sb`; il livello superiore scrivibile esiste solo in RAM finché il sistema in esecuzione non esegue il primo salvataggio su richiesta o all’arresto. Una sessione di generazione zero è valida solo se i campi relativi agli artefatti dello snapshot e `changes.sb` sono assenti. Per le generazioni successive, l’attivazione convalida metadati rigorosi e a valore singolo per lo snapshot, inclusi digest, dimensioni compresse e non compresse, numero di voci, tipo di union e criterio di salvataggio. Verifica inoltre il tipo di file e la dimensione esatta, la RAM e lo spazio di swap disponibili, il digest SHA-256 prima e dopo l’estrazione e la compatibilità dell’union corrente.

Lo snapshot viene estratto con una gestione rigorosa degli errori e degli xattr in un’immagine ext4 temporanea di dimensioni limitate in RAM. Per OverlayFS, l’immagine contiene directory separate `changes` e `workdir`; per AUFS, la radice è il ramo scrivibile.
Metadati malformati, memoria insufficiente, modifiche al digest, errori di estrazione o un criterio non valido impediscono l’attivazione e lasciano il sistema avviarsi con il livello superiore RAM ordinario.

Una sessione contrassegnata come `dirty` indica che l’avvio precedente non ha completato la procedura di arresto regolare. SquashFS avvisa quindi l’utente e ripristina l’ultimo `changes.sb` salvato correttamente; le modifiche non salvate dell’avvio interrotto non costituiscono una seconda generazione di rollback.

Il Gestore sessioni MiniOS e il backend di salvataggio del sistema creano e sostituiscono atomicamente gli snapshot SquashFS usando l’acquisizione esatta. L’attivazione all’avvio può leggere uno snapshot esistente da un supporto FAT, exFAT o NTFS scrivibile, perché l’estrazione avviene nel livello superiore ext4 temporaneo. La creazione e il salvataggio esatto richiedono invece un filesystem compatibile: l’archivio di sessione deve supportare la creazione di aree di lavoro private, i metadati Linux e la pubblicazione durevole su un filesystem POSIX idoneo.

Durante il salvataggio, il backend acquisisce innanzitutto un albero di file stabile nella memoria privata di proprietà di root, se l’initrd fornisce un tmpfs attendibile con spazio sufficiente. Se lo spazio RAM non è sufficiente, l’albero viene acquisito usando invece l’area di lavoro precedente su disco. Il compressore scrive direttamente in un’unica directory privata con permessi 0700 sul filesystem della sessione, senza creare un’ulteriore immagine RAM per poi copiarla su disco. MiniOS verifica il risultato compresso e la relativa identità, lo sincronizza, lo sposta in un percorso candidato privato, quindi convalida nuovamente il candidato prima di sostituire atomicamente lo snapshot attivo `changes.sb`. Le copie o le compressioni non riuscite non sostituiscono l’ultimo snapshot salvato correttamente.

Con una sessione durevole e funzionante, `/var/log/minios` e `/var/log/live` vengono montati in bind da `boot-logs/` all’interno della sessione numerata. Questi log di diagnostica all’avvio vengono quindi scritti separatamente dal livello superiore RAM e dallo snapshot di arresto. Se l’archivio di persistenza non è stato attivato in modo durevole durante l’avvio, non è possibile garantire che questi log sopravvivano al riavvio. I log e le cache ordinari possono essere configurati separatamente; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS non ha una `perchsize`: la dimensione archiviata dipende dalle modifiche acquisite e compresse, mentre la memoria utilizzata in fase di esecuzione dipende dal livello superiore scrivibile estratto. Il livello di persistenza LUKS MiniOS non avvolge `changes.sb`; se è necessario garantire la riservatezza dello snapshot, il supporto sottostante deve essere cifrato al di fuori di questo livello. Vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Attivazione dell’unione e soglia di ripristino

Per AUFS, le modifiche attivate diventano il ramo scrivibile zero. Per OverlayFS, l’initrd crea `upperdir` e `workdir` sotto la radice delle modifiche attivate e monta i moduli in sola lettura come directory inferiori. L’initrd verifica quindi il ramo live AUFS o OverlayFS `upperdir` prima di dichiarare attiva la persistenza.

Se un backend di persistenza, un aggiornamento dei metadati o questa verifica non va a buon fine, i relativi mount vengono smontati, ove possibile; non viene dichiarato alcuno stato di persistenza riuscito e l’avvio prosegue in modalità scrivibile con RAM. Se non è possibile creare l’unione della radice, viene aperta la shell fatale dell’initramfs. Uscire da questa shell può consentire al setup di proseguire con una radice non valida: non è una riparazione né un’alternativa sicura. AUFS mantiene l’aggiunta dei rami dei moduli in modalità best effort, ma un’unione incompleta supera la soglia di ripristino: MiniOS non dichiara attiva la persistenza.

In caso di errori nei controlli del container, per sicurezza la sessione sospetta non viene montata in scrittura.
Non sostituire né ricreare i file della sessione durante l’avvio. Prima, metti al sicuro lo spazio di archiviazione interessato; consulta [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Ventoy Plugin di persistenza

Un backend selezionato tramite il Plugin di persistenza di Ventoy aggira la ricerca delle sessioni numerate. MiniOS risolve la mappatura dei dispositivi di Ventoy`vtoy_persistent` richiede un'immagine ext4 montata in scrittura e usa una `changes/` directory come livello upper di AUFS o `changes/` più `workdir/` per OverlayFS. Non crea `minios/changes/`, `session.conf`, né sessioni numerate all'interno di quell'immagine. La persistenza richiede comunque una richiesta di persistenza riconosciuta; **Avviare senza salvare** rimane temporaneo.

Il primo utilizzo registra il formato union in `.minios-union`. Un backend union diverso, un dispositivo mancante, un filesystem errato, un'immagine non scrivibile o un'attivazione union non riuscita generano un avviso e creano un nuovo livello upper RAM. Non viene mai usata un'altra immagine solo perché il suo filesystem ha un'etichetta corrispondente.

`perchdir` La selezione della sessione `perchtoram` vengono ignorati per un'immagine selezionata tramite il plugin; le modifiche restano su quell'immagine anche con `toram` di sistema. Session Manager e `minios-session` rifiutano le operazioni, comprese quelle che usano directory di sessione personalizzate. Seleziona un'altra immagine in Ventoy per cambiare ambiente. Se non è selezionato alcun backend del plugin, i normali avvii di Ventoy usano il consueto modello di sessioni numerate MiniOS. Vedi [Ventoy](/installing-minios/installation-tools/Ventoy).

<a id="active-running-and-current-boot-state"></a>

## Stato attivo, in esecuzione e dell’avvio corrente

Nei metadati persistenti della sessione, `default=` è la sessione **attiva** selezionata per il prossimo ripristino, mentre `running=` è la sessione registrata come origine dell’avvio corrente. L’attivazione scrive entrambi i campi e contrassegna tale sessione come `dirty`.
Dopo che, durante un arresto regolare, i mount della persistenza sono stati smontati, MiniOS rimuove `running=` e contrassegna la sessione come `clean`.

Questi campi dei metadati possono essere obsoleti in seguito a un arresto anomalo, a una scrittura dei metadati non riuscita, alla creazione non riuscita di unione, alla copia dell’archivio o a un arresto interrotto. I componenti runtime che consentono il salvataggio non si fidano del solo `running=`. Usano lo stato protetto dell’avvio corrente dell’initrd, associato all’ID di avvio, alla sessione numerica, alla modalità, all’identità effettiva dell’archivio, allo stato di scrivibilità, alla persistenza, alla generazione attiva verificata e, per DynBlk, al dispositivo `/dev/dynblkN` collegato esatto. Se il record dell’avvio corrente manca o non è valido, la persistenza non deve essere considerata una destinazione di salvataggio approvata.

Con `perchtoram=trim` o `full`, i contenitori di sessione supportati vengono copiati in un tmpfs dedicato prima dell’attivazione. La copia viene eseguita solo se sia la memoria disponibile sia lo spazio libero nel tmpfs sono sufficienti a contenere le dimensioni dei file di backing, oltre a un margine; se la copia non riesce, l’operazione continua sull’archivio, con un avviso. La sessione copiata può fornire il livello superiore scrivibile, ma lo stato protetto dell’avvio corrente la contrassegna come non persistente e registra un’identità separata `ram-origin` per l’archivio originale. `trim` copia solo la sessione supportata selezionata e i metadati corrispondenti; `full` copia tutte le sessioni Raw, DynFileFS, DynBlk, VMDK o SquashFS supportate presenti nell’archivio. I dati delle directory native non vengono copiati: una richiesta RAM nativa completata correttamente crea un nuovo contenitore DynBlk o DynFileFS vuoto, tranne durante un ripristino, che disabilita la copia. Current Session Manager individua l’archivio originale tramite l’UUID del filesystem e può salvare esplicitamente la sessione basata su RAM nell’archivio originale o come nuova sessione numerata. Le modifiche a RAM non salvate vanno perse se non viene completata correttamente alcuna scrittura nell’archivio originale.

Per le indicazioni operative correlate, consulta [Modalità di avvio](/using-minios/Boot-Modes), [Parametri di avvio](/reference/Boot-Parameters), [Sessioni e persistenza](/using-minios/Sessions-and-Persistence), [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicurezza](/maintenance-and-recovery/Security) e [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

## Recupero dello spazio consapevole della sessione

`minios-session reclaim ID` supporta DynFileFS, DynBlk e sessioni VMDK. Per una sessione in testo semplice, esegue FITRIM sul filesystem ext4 interno effettivo, mai sulla root combinata AUFS/OverlayFS, quindi richiama l'operazione di recupero dello spazio del backend di archiviazione proprietario. Il recupero dello spazio di DynFileFS richiede DynFileFS 4.6.0 o versioni successive.

Per una sessione DynFileFS in esecuzione, Session Manager crea un namespace di mount privato e temporaneo per raggiungere `virtual.dat` sotto il mount ext4 sovrapposto attivo, senza interferire con il daemon, il dispositivo loop o i mount union attivi del sistema. I dispositivi DynBlk/VMDK in esecuzione vengono convalidati rispetto allo stato protetto dell'avvio corrente. Le sessioni inattive vengono collegate e montate temporaneamente; se una sessione è già stata montata da Session Manager, viene riutilizzato il collegamento esistente. Se lo smontaggio è impedito, la procedura si interrompe invece di scollegare lo spazio di archiviazione sotto un filesystem in uso.

Né l'avvio né l'arresto eseguono automaticamente la compattazione. `--compact` è una scelta esplicita dell'utente, disponibile nella CLI o come opzione non selezionata nella finestra di dialogo di Session Manager, e può spostare dati in uso, aumentando le scritture su flash. Se non viene attivata, i backend recuperano solo lo spazio che possono restituire senza spostare dati in uso, ad esempio intervalli liberabili con hole punching o le porzioni finali completamente libere dei file; su filesystem come exFAT, gli intervalli interni liberati possono restare riutilizzabili all'interno del container anche se non possono essere restituiti al filesystem host. Le sessioni crittografate recuperano solo lo spazio già noto al backend e non abilitano silenziosamente discard tramite dm-crypt.
