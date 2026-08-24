# Guida all'Ottimizzazione delle Prestazioni

Questa guida offre tecniche per ottimizzare le prestazioni di MiniOS, concentrandosi sulle sue caratteristiche uniche come sistema live. I miglioramenti più significativi si ottengono ottimizzando il modo in cui MiniOS carica i dati e gestisce le modifiche persistenti.

## Parametri di Boot per le Prestazioni

Il modo più efficace per aumentare le prestazioni, soprattutto se si avvia da una chiavetta USB lenta, è utilizzare i parametri di boot per controllare come il sistema viene caricato in memoria. Per l'elenco completo dei parametri disponibili, consulta [Boot Parameters](/configuration/Boot-Parameters.md).

### Caricamento del Sistema in RAM (`toram`)

Questa è l'ottimizzazione più importante in assoluto. Il parametro di boot `toram` copia l'intero sistema MiniOS dal supporto di avvio nella RAM del computer. In questo modo il sistema diventa estremamente reattivo, poiché non deve più leggere i dati dalla chiavetta USB più lenta.

- **Utilizzo:** Aggiungi `toram` alla riga di comando del kernel all'avvio.
- **Requisito:** È necessario avere abbastanza RAM per contenere i moduli principali del sistema. Per l'edizione `standard` sono consigliati almeno 2-3 GB di RAM libera.
- **Vantaggio:** Migliora drasticamente i tempi di avvio delle applicazioni e la reattività generale del sistema.

Esistono due modalità per `toram`:

- **`toram=full` (Predefinito):** Copia tutti i moduli del sistema in RAM. Usa questa modalità se hai molta memoria disponibile.
- **`toram=trim`:** Copia solo i moduli essenziali definiti dai parametri di boot `load` e `noload`. Utile per sistemi con RAM limitata.

### Filtrare i Moduli (`load` e `noload`)

Per ridurre l'uso della memoria, puoi specificare quali moduli caricare. Questa opzione è particolarmente efficace se combinata con `toram=trim`.

- **`load=module1,module2`:** Carica solo i moduli specificati (es. `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name`:** Esclude un modulo specifico dal caricamento.

Questo ti permette di creare un sistema leggero in RAM, su misura per le tue esigenze.

## Ottimizzazione della Persistenza

Il modo in cui MiniOS salva le tue modifiche (persistenza) può influire notevolmente sulle prestazioni, in particolare sulla velocità di scrittura.

### Modalità di Persistenza (`perchmode`)

Il parametro di boot `perchmode` definisce il backend per lo storage persistente. La scelta dipende dal tuo dispositivo di archiviazione:

- **`perchmode=native` (Predefinito):** Salva i file direttamente in una cartella sul dispositivo di archiviazione. Questa è l'opzione **più veloce per SSD e chiavette USB rapide** perché evita il sovraccarico del filesystem in un file.
- **`perchmode=raw`:** Utilizza un file immagine raw preallocato per le modifiche. Le prestazioni sono buone, ma la dimensione del file è fissa.
- **`perchmode=dynfilefs`:** Utilizza un file che si espande dinamicamente. È una buona scelta per **chiavette USB più lente** perché può ridurre l'amplificazione delle scritture e potenzialmente aumentare la durata della chiavetta, anche se potrebbe essere leggermente più lento rispetto alla modalità `native`.

### Abilitare e Disabilitare la Persistenza

Per impostazione predefinita, MiniOS viene eseguito in modalità "live" e tutte le modifiche vengono scartate al riavvio. Per salvare le modifiche, è necessario abilitare esplicitamente la persistenza.

- **Per abilitare la persistenza:** Aggiungi il parametro `perch` alla riga di comando di boot. In questo modo MiniOS attiverà il meccanismo di persistenza.
- **Per disabilitare la persistenza:** Semplicemente non aggiungere il parametro `perch`. Se non è presente, il sistema funzionerà interamente da RAM (o dal dispositivo di avvio) e nessuna modifica verrà salvata.

## Configurazione ZRAM

MiniOS utilizza di default `zram` per creare uno spazio di swap compresso nella tua RAM. Questo migliora le prestazioni su sistemi con memoria fisica limitata evitando l'uso di un file di swap su disco, molto più lento.

**Dimensionamento automatico:**
- **≥4GB RAM:** 2GB ZRAM
- **1-4GB RAM:** Metà della RAM totale
- **<1GB RAM:** 512MB ZRAM

**Parametri di avvio:**
- **`zramsize=1024`:** Imposta la dimensione del dispositivo zram (es. `zramsize=1024` per 1GB). Per impostazione predefinita, viene configurato automaticamente in base alla RAM totale.
- **`zramcomp=lz4`:** Imposta l'algoritmo di compressione (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` rappresenta generalmente un buon compromesso tra velocità e rapporto di compressione.
- **`nozram`:** Disabilita completamente ZRAM.

Per la maggior parte degli utenti, le impostazioni predefinite di `zram` sono ottimali. Si consiglia di modificarle solo se si hanno esigenze specifiche e si comprendono i compromessi.

## File system e Hardware di Archiviazione

- **Usa una chiavetta USB veloce:** Il fattore hardware più importante per le prestazioni di MiniOS è la velocità della chiavetta USB. Utilizzare una **unità SSD USB 3.0 o superiore** offre un'esperienza nettamente migliore rispetto a una chiavetta USB 2.0 economica e lenta.
- **Scelta del file system:** Per la partizione di persistenza, utilizzare un file system Linux standard come **ext4** garantisce generalmente le migliori prestazioni e affidabilità.
