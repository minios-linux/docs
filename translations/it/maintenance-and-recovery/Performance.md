---
updated: 2026-09-16
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

- **`native`:** Memorizza il layer scrivibile direttamente come file ordinari. Offre il minimo overhead per i container e non ha una dimensione fissa, ma richiede un filesystem di supporto che conservi i metadati e le operazioni Linux di cui MiniOS ha bisogno.
- **`raw`:** Utilizza un'unica immagine ext4 a capacità fissa. La lunghezza del file è impostata sulla capacità richiesta e la crescita è esplicita, quindi è semplice e prevedibile ma non offre il comportamento thin-capacity dei backend dinamici. FAT32 limita la singola immagine a 4000 MiB.
- **`dynfilefs`:** Il backend FUSE/format-400 espande lo storage del payload su richiesta e supporta supporti altrimenti non idonei. Il suo indice non è sparso: ogni blocco logico dichiarato da 4 KiB richiede un offset di 8 byte, quindi la capacità logica costa circa 2 MiB di RAM e circa 2 MiB di storage per l'indice di supporto per GiB anche quando il payload è vuoto. Questo rende efficienti le capacità moderate, ma le capacità thin di grandi dimensioni risultano costose in anticipo.
- **`dynblk`:** Il backend format-1 kernel block presenta un normale dispositivo a blocchi mentre il thin `volumeNNN.db` backend cresce su richiesta. Le mappature runtime sono sparse e allocano un blocco da 4 KiB per 128 blocchi logici, quindi i dati mappati densamente richiedono circa 8 MiB di mapping RAM per GiB, ma la capacità virtuale non allocata non consuma chunk di mapping. L'indice ad albero interno fisso è di soli 396.312 byte per dispositivo collegato e i contatori di riferimento delle pagine sono sparsi. Il driver, non MiniOS, sceglie il budget di mapping predefinito pari a circa il 25% della RAM utilizzabile, con un limite massimo di 4096 MiB. Questo favorisce capacità sparse di grandi dimensioni; un volume riempito densamente può consumare più mapping RAM per GiB rispetto a DynFileFS.
- **`squashfs`:** Memorizza uno snapshot compresso e ricostruisce il layer scrivibile superiore in RAM a ogni avvio. Minimizza lo storage persistente per sessioni perlopiù stabili, ma comporta costi in termini di CPU e RAM durante il ripristino e riscrive lo snapshot al salvataggio.

LUKS2 può avvolgere Raw, DynFileFS o DynBlk. La cifratura aggiunge overhead per lo sblocco e le operazioni crittografiche, mantenendo però la capacità e il comportamento di storage del backend sottostante.

Esegui benchmark dei carichi di lavoro rappresentativi direttamente sul dispositivo reale. Differenze tra controller flash, filesystem, bridge USB, cifratura, compressione e tipologia di carico sono più affidabili di una classifica universale delle modalità di persistenza.

## Configurazione ZRAM

Zram scambia tempo CPU con capacità di memoria compressa e può evitare lo swap su disco, molto più lento. Un dispositivo zram più grande può assorbire più pagine inattive, ma non crea RAM fisica; i carichi di lavoro non comprimibili consumano comunque memoria.
Gli algoritmi di compressione bilanciano velocità e utilizzo della CPU rispetto al rapporto di compressione, e la loro disponibilità dipende dal kernel. Inizia con l'impostazione predefinita e cambia `zramsize`, `zramcomp`, oppure `nozram` solo per un carico di lavoro misurato; consulta [Parametri di avvio](/reference/Boot-Parameters) per i valori accettati.

## File system e hardware di archiviazione

- **Scelta del dispositivo:** Un'elevata velocità di trasferimento sequenziale riduce il tempo necessario per copiare grandi moduli, mentre una bassa latenza nelle operazioni casuali è più importante per i carichi di lavoro desktop persistenti.
  Misura il dispositivo insieme al suo box; la sola generazione USB non è indicativa delle prestazioni di flash o SSD.
- **Scelta del file system:** Un file system nativo Linux può sfruttare la persistenza nativa senza il sovraccarico di un container. I file system multipiattaforma migliorano la portabilità ma richiedono un backend container compatibile per i metadati Linux, aggiungendo livelli di mapping e file system. Scegli in base alle esigenze di portabilità e recupero, oltre che ai risultati dei benchmark.
