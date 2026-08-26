# Ottimizzazione delle prestazioni

L’ottimizzazione delle prestazioni in MiniOS è principalmente un bilanciamento tra tempo di avvio, uso della RAM, letture in fase di esecuzione, overhead della persistenza e durabilità dello storage. Per i dettagli sulle opzioni disponibili e i limiti di sicurezza, consulta [Modalità di avvio](/configuration/Boot-Modes.md), [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md).

## Parametri di avvio per le prestazioni

I parametri di avvio permettono di spostare le operazioni di startup e le letture del sistema live tra la RAM e il dispositivo di origine. Consulta [Parametri di avvio](/configuration/Boot-Parameters.md) per la documentazione completa.

### Caricamento del sistema in RAM (`toram`)

`toram` può ridurre la latenza in fase di esecuzione causata da dispositivi USB lenti o ISO su rete, a fronte di un avvio più lungo e di un maggiore consumo di RAM. L’opzione `toram` utilizza il percorso di copia completa. `toram=trim` di solito consuma meno RAM, ma la sua copia più selettiva può escludere dati o moduli necessari successivamente.

Lascia spazio per il layer scrivibile, le applicazioni, le cache e zram, invece di dimensionare solo in base ai file dei moduli. Più RAM assegnata alla copia live significa meno RAM disponibile per il carico di lavoro. Segui [Modalità di avvio](/configuration/Boot-Modes.md) per informazioni su durabilità della copia e vincoli di rimozione del supporto.

### Filtraggio dei moduli (`load` e `noload`)

Il filtraggio può ridurre i dati copiati e i layer montati, in particolare con `toram=trim`. Il rovescio della medaglia è un sistema meno completo e un rischio maggiore di errori in fase di avvio o di esecuzione se viene omessa una dipendenza. Verifica sempre il set di moduli risultante; la sintassi dei filtri e le limitazioni dei moduli protetti sono definite in [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md).

## Ottimizzazione della persistenza

La persistenza sposta le operazioni di scrittura del layer modificabile dalla RAM a uno storage o a un container. La scelta del backend influisce su latenza, compatibilità, gestione della capacità e complessità del recupero.

### Modalità di persistenza (`perchmode`)

- **`native`:** Evita un layer filesystem-in-a-file ed è la scelta più semplice su filesystem POSIX idonei, ma non è disponibile su filesystem che non possono conservare i metadati Linux richiesti.
- **`raw`:** Offre una capacità fissa prevedibile e un comportamento ext4 convenzionale, ma riserva lo spazio del file e non può crescere oltre la capacità dello storage di supporto.
- **`dynfilefs`:** Si espande su richiesta e supporta supporti altrimenti inadatti, con complessità aggiuntiva di mapping e recupero.
- **`luks`:** Aggiunge riservatezza a fronte di lavoro di sblocco e overhead di cifratura.
- **`squashfs`:** Scambia la compressione al momento del salvataggio e il lavoro di estrazione dalla RAM per uno snapshot compatto; non è un backend scrivibile a bassa latenza di tipo generale.

Esegui benchmark di carichi di lavoro rappresentativi sul dispositivo reale. Differenze di controller flash, filesystem, bridge USB e carico di lavoro sono più affidabili di una classifica universale delle modalità di persistenza.

## Configurazione di ZRAM

Zram scambia tempo CPU per capacità di memoria compressa e può evitare l’uso di swap su storage molto più lento. Un dispositivo zram più grande può assorbire più pagine inattive, ma non crea RAM fisica; i carichi di lavoro non comprimibili consumano comunque memoria. Gli algoritmi di compressione bilanciano throughput e uso CPU rispetto al rapporto di compressione, e la disponibilità dipende dal kernel. Parti dalla configurazione predefinita e modifica `zramsize`, `zramcomp` o `nozram` solo per carichi di lavoro misurati; consulta [Parametri di avvio](/configuration/Boot-Parameters.md) per i valori accettati.

## Filesystem e hardware di archiviazione

- **Scelta del dispositivo:** Un throughput sequenziale più elevato riduce i tempi di copia di moduli di grandi dimensioni, mentre una bassa latenza nelle operazioni I/O casuali è più importante per i carichi di lavoro desktop persistenti. Misura sempre dispositivo e box insieme; la sola generazione USB non predice le prestazioni di flash o SSD.
- **Scelta del filesystem:** Un filesystem Linux nativo può utilizzare la persistenza nativa senza overhead da container. I filesystem multipiattaforma migliorano la portabilità ma richiedono un backend container compatibile per i metadati Linux, aggiungendo livelli di mapping e filesystem. Scegli in base alle esigenze di portabilità e recupero, oltre che ai risultati dei benchmark.
