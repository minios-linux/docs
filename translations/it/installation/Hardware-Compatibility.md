# Guida alla compatibilità hardware

Il supporto hardware dipende dalla release e dall’immagine di MiniOS: la distribuzione di base, il kernel, il firmware, i moduli inclusi e l’edizione sono tutti fattori rilevanti. Consulta la descrizione della release relativa all’immagine che hai scaricato, quindi testa una sessione live pulita prima di modificare i dischi o affidarti alla macchina per attività persistenti.

## Requisiti di sistema

Le immagini MiniOS per PC pubblicate sono destinate all’architettura **amd64** (x86 a 64 bit), salvo diversa indicazione nella descrizione della release. Le risorse necessarie variano in base all’immagine, all’edizione, all’ambiente desktop, alle applicazioni e alla modalità di avvio:

- La CPU deve supportare l’architettura dell’immagine e la modalità firmware selezionata.
- La RAM deve essere adeguata all’edizione e al carico di lavoro scelti. Le modalità `toram` richiedono memoria aggiuntiva per i dati dell’immagine copiati.
- Il supporto di avvio deve avere spazio sufficiente per l’immagine scaricata. Persistenza, dati utente e un’installazione nativa richiedono ulteriore spazio di archiviazione scrivibile.
- I requisiti grafici dipendono dall’ambiente desktop e dalle applicazioni dell’edizione selezionata.

Scrivere un’immagine su un dispositivo più grande non crea automaticamente uno spazio di archiviazione persistente. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) per la guida ufficiale al comportamento del boot live e [Guida rapida](/installation/Quick-Start.md) per la preparazione dei supporti.

## Compatibilità dei componenti

### Processori

La compatibilità dipende dall’architettura e dal kernel forniti nell’immagine selezionata. Consulta le note di rilascio se utilizzi un processore recente o funzionalità CPU che richiedono il supporto di kernel più nuovi.

### Grafica

Il supporto grafico dipende dal driver del kernel, dal firmware e dallo stack grafico userspace presenti nell’immagine. Una scheda può fornire l’output video di base senza supportare l’accelerazione hardware o tutti i connettori. Alcuni hardware NVIDIA possono richiedere un driver proprietario non incluso in una determinata immagine.

### Rete

Il supporto Ethernet e Wi-Fi dipende dal controller, dal driver del kernel e dal firmware inclusi nell’immagine. Verifica la rete da una sessione pulita. Per il Wi-Fi, controlla anche se il dispositivo necessita di firmware o di un driver esterno non presente in quella release.

### Archiviazione

I dispositivi USB, SATA, NVMe, IDE e SD/MMC funzionano solo se l’immagine selezionata include un driver per il controller e il kernel è in grado di riconoscere il dispositivo. La scansione dell’initrd non rende compatibile un controller non supportato. Consulta [Rilevamento del sistema tramite initrd](/configuration/Initrd-System-Discovery.md) per il comportamento esatto della ricerca live-source.

La modalità live e la modalità nativa hanno percorsi di avvio differenti. La modalità live rileva la struttura dati di MiniOS e assembla i moduli in sola lettura nello userspace iniziale; la modalità nativa avvia una root installata convenzionale. Consulta [Caricamento moduli initrd](/configuration/Initrd-Module-Loading.md) per la gestione dei moduli live e [Installazione di MiniOS](/installation/Installing-MiniOS.md) per la distinzione tra i layout.

### Virtualizzazione

MiniOS può essere eseguito come guest quando l’immagine selezionata include i driver per i dispositivi CPU, storage, rete e display configurati nella VM. Il supporto non è garantito per ogni hypervisor o modello di controller. Il supporto per VirtIO, VMware, Hyper-V e dispositivi IDE o SATA emulati deve essere verificato con la release e testato con la configurazione specifica della VM.

Anche gli agenti guest e gli strumenti di integrazione desktop variano in base all’edizione e all’immagine. Consulta l’[elenco dei pacchetti](/administration/Packages.md) e la [Guida alla virtualizzazione](/administration/Virtualization.md) prima di presumere che siano disponibili condivisione degli appunti, risoluzione dinamica, spegnimento pulito o comunicazione con l’host.
