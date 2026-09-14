---
updated: 2026-09-13
---

# Prestazioni

L'ottimizzazione delle prestazioni in MiniOS consiste principalmente nel trovare un equilibrio tra il tempo di avvio, l'utilizzo di RAM, le letture in fase di esecuzione, il carico della persistenza e la durabilità dello storage. Per informazioni dettagliate sulle opzioni e sui limiti di sicurezza, consulta [Modalità di avvio](/using-minios/Boot-Modes), [Caricamento moduli Initrd](/reference/boot-process/Module-Loading), e [Persistenza Initrd](/reference/boot-process/Persistence-Internals).

## Parametri di avvio per le prestazioni

I parametri di avvio possono spostare le operazioni di avvio e le letture del sistema attivo tra RAM e il dispositivo di origine. Vedi [Parametri di avvio](/reference/Boot-Parameters) per la guida completa.

### Caricamento del Sistema in RAM (`toram`)

`toram` può ridurre la latenza di esecuzione da un dispositivo USB lento o da una ISO su rete, a fronte di un avvio più lungo e di un maggiore utilizzo di RAM. Bare `toram` utilizza il percorso di copia completa. `toram=trim` di solito consuma meno RAM, ma la sua copia più ridotta può escludere dati o moduli necessari in seguito.

Lascia spazio per il layer scrivibile, le applicazioni, le cache e zram invece di dimensionare solo per i file dei moduli. Più RAM assegnata alla copia live significa meno risorse disponibili per il carico di lavoro. Consulta [Modalità di avvio](/using-minios/Boot-Modes) per informazioni sulla durabilità della copia e sulle restrizioni per la rimozione del supporto.

### Moduli di filtraggio (`load` e `noload`)

Il filtraggio può ridurre i dati copiati e i layer montati, soprattutto con `toram=trim`. Tuttavia, questo comporta un sistema meno completo e un rischio maggiore di errori di avvio o di esecuzione se manca una dipendenza. Verifica il set di moduli risultante; la sintassi del filtro e le limitazioni dei moduli protetti sono descritte in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading).

## Ottimizzazione della persistenza

La persistenza sposta l'I/O del livello scrivibile dal RAM allo storage o a un container. La scelta del backend influisce su latenza, compatibilità, gestione della capacità e complessità del ripristino.

### Modalità di persistenza (`perchmode`)

- **`native`:** Evita uno strato filesystem-in-un-file ed è la scelta più semplice su un filesystem POSIX adatto, ma non è disponibile su filesystem che non possono mantenere la necessaria metadata Linux.
- **`raw`:** Ha una capacità fissa prevedibile e un comportamento ext4 convenzionale, ma riserva la dimensione del file e non può crescere oltre lo spazio disponibile sul supporto di memorizzazione.
- **`dynfilefs`:** Il backend FUSE/format-400 si espande su richiesta e supporta anche supporti altrimenti non compatibili, con maggiore complessità di mappatura e recupero.
- **`dynblk`:** Il backend kernel a blocchi format-1 presenta un normale dispositivo a blocchi mentre il thin `volumeNNN.db` backing cresce su richiesta. Evita l'I/O FUSE, ma ogni dispositivo collegato consuma memoria fissa per i metadati e le scritture restano limitate dallo spazio libero del filesystem di supporto e dai limiti di ammissione dynblk.
- **`luks`:** Aggiunge riservatezza a fronte di lavoro di sblocco e overhead di cifratura.
- **`squashfs`:** Scambia la compressione al momento del salvataggio e il lavoro di estrazione RAM per uno snapshot compatto; non è un backend generale a bassa latenza e scrittura.

Esegui benchmark dei carichi di lavoro rappresentativi direttamente sul dispositivo reale. Le differenze tra controller flash, filesystem, bridge USB e carichi di lavoro sono più affidabili di una classifica universale delle modalità di persistenza.

## Configurazione ZRAM

Zram scambia tempo CPU con capacità di memoria compressa e può evitare lo swap su disco, molto più lento. Un dispositivo zram più grande può assorbire più pagine inattive, ma non crea RAM fisica; i carichi di lavoro non comprimibili consumano comunque memoria.
Gli algoritmi di compressione bilanciano velocità e utilizzo della CPU rispetto al rapporto di compressione, e la loro disponibilità dipende dal kernel. Inizia con l'impostazione predefinita e cambia `zramsize`, `zramcomp`, oppure `nozram` solo per un carico di lavoro misurato; consulta [Parametri di avvio](/reference/Boot-Parameters) per i valori accettati.

## File system e hardware di archiviazione

- **Scelta del dispositivo:** Un'elevata velocità di trasferimento sequenziale riduce il tempo necessario per copiare grandi moduli, mentre una bassa latenza nelle operazioni casuali è più importante per i carichi di lavoro desktop persistenti.
  Misura il dispositivo insieme al suo box; la sola generazione USB non è indicativa delle prestazioni di flash o SSD.
- **Scelta del file system:** Un file system nativo Linux può sfruttare la persistenza nativa senza il sovraccarico di un container. I file system multipiattaforma migliorano la portabilità ma richiedono un backend container compatibile per i metadati Linux, aggiungendo livelli di mapping e file system. Scegli in base alle esigenze di portabilità e recupero, oltre che ai risultati dei benchmark.
