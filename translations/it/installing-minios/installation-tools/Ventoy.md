---
updated: 2026-10-15
---

# Ventoy

Ventoy è uno strumento molto diffuso per creare unità USB avviabili, che consente di archiviare più file ISO su un unico dispositivo e avviare il sistema da uno qualsiasi di essi.

## Importante

**Avvertenza:** La selezione di un dispositivo errato comporta la perdita dei dati! Verifica sempre con attenzione l’unità selezionata ed esegui il backup dei dati importanti.

L’integrazione attuale di MiniOS supporta la modalità di Ventoy detta **normale**, comprese le immagini di persistenza diretta in BIOS e UEFI. Le immagini meno recenti di MiniOS potrebbero richiedere la modalità **GRUB2**; usa questa modalità se l’immagine meno recente non riesce a individuare la propria origine in modalità normale. Il suffisso del nome del file `VTGRUB2` può forzare la modalità GRUB2 per un’immagine di questo tipo. Non è un requisito universale per le immagini attuali.

## Requisiti dell'unità

### Capacità dell'unità

Assicurati che ci sia spazio sufficiente per i file ISO, gli altri dati e lo spazio di persistenza previsto. Lo spazio riservato e la capacità dell'immagine di persistenza di Ventoy sono opzioni separate. Consulta [Compatibilità hardware](/getting-started/Hardware-Compatibility) per conoscere i requisiti di sistema.

## Installazione di Ventoy

### Metodo 1: installazione standard

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l'installer Ventoy** e seleziona l'unità USB
3. **Installa Ventoy** sull'unità (tutti i dati verranno eliminati)
4. **Copia il file ISO MiniOS** nella cartella principale dell'unità USB

In questo modo si crea un supporto multiboot con file ISO: Ventoy mantiene l'ISO come file nella partizione dati e la rende disponibile all'avvio. Non si tratta di scrivere un'immagine MiniOS grezza né di distribuire l'Installatore MiniOS.

### Metodo 2: installazione con partizione dati separata (consigliato)

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l'installer Ventoy** e seleziona l'unità USB
3. **Attiva l'opzione "Riserva spazio"** durante l'installazione per lasciare spazio non allocato alla fine dell'unità
4. **Installa Ventoy** sull'unità
5. **Copia il file ISO MiniOS** nella cartella principale dell'unità USB
6. **Crea una partizione ext4** nello spazio riservato con l'etichetta `persistence`usando un editor di partizioni

In questo modo si crea una possibile posizione per la persistenza, ma la sola creazione della partizione non abilita la persistenza né crea una sessione.

## Integrazione con MiniOS

MiniOS rileva separatamente l'ISO reso disponibile da Ventoy e lo spazio di archiviazione scrivibile. Sono disponibili due modelli di persistenza: scegline uno in modo consapevole.

### Sessioni MiniOS normali

Senza un backend del plugin Persistence Ventoy selezionato, le consuete **Avviare MiniOS** richieste di accesso `perchdir=resume`. MiniOS può usare una partizione sullo stesso disco `persistence` oppure il proprio `minios/changes/` archivio sulla partizione dati di Ventoy. Per il layout con partizione dati, abilita il supporto al rimontaggio Linux di Ventoy in `/ventoy/ventoy.json`:

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Integra questa configurazione in una configurazione esistente, senza eliminare gli altri plugin. È comunque necessario disporre di uno spazio di archiviazione scrivibile adeguato. Su FAT32/NTFS/exFAT, all'avvio viene preferito DynBlk se disponibile; in caso contrario, viene usato DynFileFS. Session Manager, le sessioni numerate, la crittografia e il salvataggio delle sessioni RAM supportate seguono le normali regole di MiniOS. Un avvio senza richiesta di persistenza rimane temporaneo.

### Persistence Plugin Ventoy

In alternativa, associa l'ISO a un'immagine di persistenza **ext4** usando il Persistence Plugin di Ventoy. Ad esempio, è possibile selezionare un'immagine già creata in `/ventoy/minios.dat` per `/ISO/MiniOS.iso`:

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

I percorsi sono relativi alla directory radice della partizione dati Ventoy. Crea l'immagine ext4 con gli strumenti per le immagini di persistenza di Ventoy e selezionala all'avvio; la semplice presenza di un file `.dat` sul disco non la attiva. MiniOS usa il backend selezionato da Ventoy, non un dispositivo qualsiasi con un'etichetta corrispondente.

Questa immagine contiene un solo ambiente persistente, con `changes/` e, per OverlayFS, `workdir/`. Non contiene sessioni MiniOS numerate. Per usare un altro ambiente, scegli un altro backend in Ventoy. Session Manager e `minios-session` non sono disponibili, `perchdir` la selezione della sessione viene ignorata e `perchtoram` non può copiare questo livello superiore in RAM. È comunque possibile usare System `toram` , ma ciò non elimina la dipendenza dall'immagine di persistenza.

Al primo utilizzo viene registrato il formato union. Se si riutilizza l'immagine con un altro backend union, se l'immagine non è disponibile o non è in formato ext4, oppure se l'attivazione in scrittura non riesce, viene visualizzato un avviso e viene creato un nuovo livello superiore RAM. **Avviare senza salvare** non apre l'immagine. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Dettagli interni della persistenza](/reference/boot-process/Persistence-Internals).

## Uso di MiniOS con Ventoy

### Avvio

Dopo aver installato Ventoy e copiato il file ISO di MiniOS sull'unità:

1. **Avvia dall'unità USB** - selezionala nel BIOS/UEFI
2. **Seleziona MiniOS** dall'elenco dei file ISO disponibili nel menu Ventoy
3. Per un'immagine MiniOS recente, seleziona la modalità normale; per un'immagine meno recente, usa la modalità indicata nella relativa documentazione
4. **Attendi il caricamento di MiniOS**

Dopo l'avvio, verifica lo stato della persistenza prima di fare affidamento sulle modifiche salvate. Per le sessioni normali, usa `sudo minios-session status`. Con Persistence Plugin, controlla `/run/initramfs/minios-persistence/boot-state` come root: un backend attivato correttamente registra `mode=ventoy` e `boot_level=ok`. Tieni l'unità collegata mentre l'ISO o l'immagine di persistenza è in uso.
