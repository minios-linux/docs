# Informazioni su MiniOS

MiniOS è una distribuzione Linux basata su Debian progettata per essere eseguita da supporti rimovibili o da disco locale. Il sistema in sola lettura è assemblato da moduli SquashFS, con sessioni scrivibili opzionali per file, impostazioni e pacchetti installati. MiniOS supporta sistemi x86 a 64 bit e può avviarsi tramite UEFI o BIOS legacy.

## Modello di sistema

- Il sistema base e il software opzionale sono moduli separati. I moduli possono essere selezionati all'avvio o aggiunti senza ricostruire l'intero sistema.
- Una nuova sessione live lascia invariati i moduli di base.
- La persistenza può memorizzare le modifiche in una directory nativa, in un contenitore DynFileFS espandibile, in un'immagine raw a dimensione fissa o in un contenitore LUKS cifrato, a seconda dell'installazione e del filesystem di destinazione.
- Il programma di installazione di MiniOS può creare un'installazione live modulare oppure, quando l'immagine lo consente, effettuare un'installazione Linux nativa convenzionale.

Consulta [Architettura del sistema](/about/System-Architecture.md) per la struttura di avvio e dei moduli, e [Gestione delle sessioni](/configuration/Session-Management.md) per le sessioni persistenti.

## Edizioni

Le edizioni disponibili dipendono dal rilascio e dalla distribuzione di base:

- **Minimum** utilizza l'ambiente Flux e un set ridotto di pacchetti. È adatta a sistemi dove si preferisce una selezione software più contenuta.
- **Standard** è l'edizione generica. Le attuali build standard Debian e Ubuntu utilizzano Xfce.
- **Toolbox** aggiunge strumenti per l'amministrazione di sistema, storage, diagnostica e recupero.
- **Ultra** include un set di applicazioni più ampio rispetto alle altre edizioni.

Xfce è il desktop abituale nelle immagini Standard, Toolbox e Ultra, ma non è l'unico ambiente disponibile su MiniOS. Minimum utilizza Flux e le configurazioni di build supportate possono offrire altri ambienti. Verifica la descrizione del rilascio prima di scaricare se l'ambiente desktop è importante.

Per il software incluso in ciascuna edizione, consulta l'[elenco dei pacchetti](/administration/Packages.md).

## Installazione e persistenza

Un file ISO può essere scritto come immagine avviabile, copiato su un dispositivo multiboot o installato tramite MiniOS Installer. Questi metodi non hanno un comportamento di archiviazione identico. Gli strumenti di scrittura di immagini come `dd` ed Etcher riproducono la struttura dell'ISO; Ventoy avvia il file ISO; MiniOS Installer può allocare e configurare lo spazio di archiviazione per le sessioni scrivibili. Non dare per scontato che un metodo di scrittura crei la persistenza.

Inizia da [Guida rapida](/installation/Quick-Start.md) e utilizza la guida collegata per il metodo di installazione scelto. La persistenza può anche essere selezionata da un menu di avvio appropriato o configurata tramite i parametri di avvio documentati quando è disponibile uno spazio di archiviazione scrivibile.

## Risorse del progetto

- [Sito web MiniOS](https://minios.dev)
- [Codice sorgente](https://github.com/minios-linux/minios-live)
- [Issue tracker](https://github.com/minios-linux/minios-live/issues)
