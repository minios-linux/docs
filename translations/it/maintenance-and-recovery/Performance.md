---
updated: 2026-08-26
---

# Prestazioni

L'ottimizzazione delle prestazioni in MiniOS è principalmente un compromesso tra tempo di avvio, utilizzo di RAM, letture in fase di esecuzione, overhead della persistenza e durabilità dello storage. Per dettagli precisi sulle opzioni e sui limiti di sicurezza, consulta [Modalità di avvio](/using-minios/Boot-Modes), [Caricamento moduli Initrd](/reference/boot-process/Module-Loading) e [Persistenza Initrd](/reference/boot-process/Persistence-Internals).

## Parametri di avvio per le prestazioni

I parametri di avvio possono spostare il lavoro di startup e le letture del sistema attivo tra RAM e il dispositivo di origine. Consulta [Parametri di avvio](/reference/Boot-Parameters) per la documentazione completa.

### Caricamento del sistema in RAM (`toram`)

`toram` può ridurre la latenza in fase di esecuzione dovuta a dispositivi USB lenti o a ISO su rete, a fronte di un tempo di avvio più lungo e di un maggiore utilizzo di RAM. Il semplice `toram` utilizza il percorso di copia completa. `toram=trim` di solito consuma meno RAM, ma la sua copia più ristretta può escludere dati o moduli necessari successivamente.

Lascia spazio per il layer scrivibile, le applicazioni, le cache e zram invece di dimensionare solo per i file dei moduli. Più RAM assegnata alla copia live significa meno risorse disponibili per il carico di lavoro. Segui [Modalità di avvio](/using-minios/Boot-Modes) per la durabilità della copia e i vincoli di rimozione dei supporti.

### Filtraggio dei moduli (`load` e `noload`)

Il filtraggio può ridurre i dati copiati e i layer montati, in particolare con `toram=trim`. Il costo è un sistema meno completo e una maggiore probabilità di errori in fase di avvio o di esecuzione se viene omessa una dipendenza. Verifica il set di moduli risultante; la sintassi dei filtri e le limitazioni sui moduli protetti sono definite in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading).

## Ottimizzazione della persistenza

La persistenza sposta le operazioni di I/O del layer scrivibile dalla RAM temporanea allo storage o a un container. La scelta del backend influisce su latenza, compatibilità, gestione della capacità e complessità di recupero.

### Modalità di persistenza (`perchmode`)

- **`native`:** Evita un layer filesystem-in-a-file ed è la scelta più semplice su filesystem POSIX compatibili, ma non è disponibile su filesystem che non possono preservare i metadati richiesti da Linux.
- **`raw`:** Offre capacità fissa prevedibile e comportamento ext4 convenzionale, ma riserva la dimensione del file e non può crescere oltre lo spazio disponibile sul supporto.
- **`dynfilefs`:** Si espande su richiesta e supporta anche supporti altrimenti non idonei, con maggiore complessità di mapping e recupero.
- **`luks`:** Aggiunge riservatezza a fronte di lavoro di sblocco e overhead di cifratura.
- **`squashfs`:** Scambia la compressione al momento del salvataggio e il lavoro di estrazione RAM per uno snapshot compatto; non è un backend scrivibile a bassa latenza di tipo generale.

Esegui benchmark di carichi di lavoro rappresentativi sul dispositivo reale. Differenze tra controller flash, filesystem, bridge USB e carico di lavoro sono più affidabili di una classifica universale delle modalità di persistenza.

## Configurazione ZRAM

Zram scambia tempo CPU con capacità di memoria compressa e può evitare swap su storage molto più lento. Un dispositivo zram più grande può assorbire più pagine inattive ma non crea RAM fisica; carichi di lavoro non comprimibili consumano comunque memoria.
Gli algoritmi di compressione bilanciano throughput e utilizzo CPU rispetto al rapporto di compressione, e la disponibilità dipende dal kernel. Parti dal valore predefinito e modifica `zramsize`, `zramcomp` o `nozram` solo per un carico di lavoro misurato; consulta [Parametri di avvio](/reference/Boot-Parameters) per i valori accettati.

## Filesystem e hardware di storage

- **Scelta del dispositivo:** Un throughput sequenziale più elevato riduce i tempi di copia di moduli di grandi dimensioni, mentre una bassa latenza I/O casuale è più importante per carichi di lavoro desktop persistenti.
  Misura il dispositivo e il box insieme; la sola generazione USB non predice le prestazioni della flash o dell'SSD.
- **Scelta del filesystem:** Un filesystem Linux nativo può utilizzare la persistenza nativa senza overhead da container. Filesystem multipiattaforma migliorano la portabilità ma richiedono un backend container compatibile per i metadati Linux, aggiungendo mapping e layer di filesystem. Scegli in base alle esigenze di portabilità e recupero oltre che ai risultati dei benchmark.
