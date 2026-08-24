# MiniOS Module Manager

MiniOS Module Manager è l'applicazione grafica per ispezionare, creare e gestire i moduli `.sb` di MiniOS. Dispone di due aree di lavoro: **Moduli** per la composizione del sistema e **Crea** per la creazione di nuovi moduli.

Avviala dal menu delle applicazioni oppure esegui:

```bash
minios-module-manager
```

L'applicazione viene eseguita con il tuo utente desktop. Richiede l'autenticazione amministratore solo quando un'operazione richiesta lo necessita.

## Esecuzione attuale e prossimo avvio

L'area di lavoro Moduli mantiene due viste separate:

- **Esecuzione attuale** è l'insieme ordinato dei moduli che compongono attualmente il sistema live.
- **Prossimo avvio** è l'insieme ordinato selezionato dalle regole di avvio correnti di MiniOS.

Modificare una vista non cambia silenziosamente l'altra. Ad esempio, **Attiva per questa sessione** influisce solo sul sistema in esecuzione, mentre **Aggiungi al prossimo avvio** copia un modulo nell'archivio moduli persistente senza attivarlo ora.

L'attivazione e la disattivazione in tempo reale sono disponibili solo quando il filesystem root utilizza attualmente AUFS. Non sono disponibili su root OverlayFS, anche se il kernel supporta AUFS. I moduli di base non possono essere disattivati tramite l'applicazione.

Le modifiche per il prossimo avvio sono disponibili solo quando MiniOS trova uno spazio di archiviazione moduli adatto, persistente e scrivibile. I moduli di base e quelli su archiviazione di sola lettura o volatile non possono essere rimossi. I filtri di avvio come `load`, `noload` e `bext` determinano comunque quali moduli vengono selezionati.

## Ispezionare un modulo

Seleziona un modulo per vedere la sua origine, la dimensione compressa e il contenuto del filesystem. Se il file di origine è disponibile, **Estrai in cartella** crea una nuova directory contenente i file del modulo.

L'ispezione e l'estrazione ordinaria non richiedono privilegi di amministratore. L'estrazione non sovrascrive mai una destinazione esistente.

Puoi anche aprire un file locale `.sb` dal file manager. L'apertura di un file consente solo l'ispezione; non lo attiva né lo aggiunge al prossimo avvio.

## Creazione di un modulo

L'area di lavoro Crea utilizza un flusso composto da **Configura**, **Rivedi**, **Esegui** e **Risultato**. Un modulo creato con successo rimane un file nella posizione di output. Non viene attivato né aggiunto automaticamente al prossimo avvio.

I metodi disponibili sono:

- **Pacchetti** installa pacchetti dai repository e file locali `.deb` selezionati, incluse le relative dipendenze, in un ambiente di build MiniOS isolato. L'installazione dei pacchetti richiede l'autenticazione amministratore.
- **Script di installazione** esegue uno script revisionato senza terminale interattivo. Una cartella seed opzionale può fornire file iniziali. Lo script viene eseguito con privilegi di amministratore ma non viene memorizzato nel modulo risultante.
- **Chroot interattivo** apre una shell root temporanea nel terminale integrato. Digita `exit` quando hai finito, quindi crea il modulo, riapri la shell o scarta le modifiche. Chiudere o scartare la sessione non modifica il sistema in esecuzione.
- **Cartella** impacchetta il contenuto di una directory esistente. La directory sorgente non viene annidata all'interno del modulo. La conversione ordinaria di una cartella non richiede privilegi root, lascia la sorgente invariata e normalizza la proprietà dei file nel modulo a root.
- **Modifiche della sessione corrente** cattura i file idonei e le eliminazioni dallo strato scrivibile della sessione corrente. Utilizza la policy standard `savechanges` di MiniOS, che esclude log, cache, dati di avvio e percorsi runtime temporanei. La lettura dell'intero strato scrivibile richiede l'autenticazione amministratore.

Scegli un nuovo percorso di output per ogni flusso di lavoro. I file esistenti non vengono mai sovrascritti. L'avanzamento e le diagnostiche del backend restano visibili durante l'esecuzione di un'operazione e la cattura della sessione corrente può essere annullata.

Modifiche della sessione corrente è pensato per una cattura standard e comoda, non per la revisione di ogni percorso incluso. Uno strato scrivibile live può contenere dati personali o riservati. Per policy di privacy esplicite `exact`, `clean` o selezionate per percorso, utilizza il flusso da riga di comando `savechanges` descritto in [Creazione dei moduli](/development/Creating-Modules.md).

## Drag and drop

Il trascinamento serve solo a compilare un input o aprire l'ispezione:

- Un modulo apre i suoi dettagli.
- I file `.deb` vengono aggiunti a Pacchetti.
- Una directory viene selezionata per Cartella.
- Un altro file regolare viene selezionato come Script di installazione.

Il rilascio di un elemento non esegue codice né modifica Esecuzione attuale o Prossimo avvio.

## Documentazione correlata

- [Creazione dei moduli](/development/Creating-Modules.md)
- [Ricostruzione delle immagini ISO](/development/Rebuilding-ISO.md)
- [Parametri di avvio](/configuration/Boot-Parameters.md)
