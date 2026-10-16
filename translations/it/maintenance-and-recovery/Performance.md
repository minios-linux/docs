---
updated: 2026-10-15
---

# Prestazioni

L'ottimizzazione delle prestazioni in MiniOS consiste principalmente nel trovare un equilibrio tra tempo di avvio, utilizzo di RAM, letture in runtime, overhead della persistenza e durabilità dello storage. Per conoscere nel dettaglio la semantica delle opzioni e i limiti di sicurezza, consulta [Modalità di avvio](/using-minios/Boot-Modes), [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading) e [Persistenza initrd](/reference/boot-process/Persistence-Internals).

## Parametri di avvio per le prestazioni

I parametri di avvio consentono di spostare le operazioni di avvio e le letture del sistema in esecuzione tra RAM e il dispositivo sorgente. Consulta [Parametri di avvio](/reference/Boot-Parameters) per il riferimento completo.

### Caricamento del sistema in RAM (`toram`)

`toram` può ridurre la latenza in runtime causata da un dispositivo USB lento o da un ISO ospitato in rete, a scapito di un avvio più lungo e di un maggiore consumo di RAM. La modalità Bare `toram` usa il percorso di copia completa. `toram=trim` in genere consuma meno RAM, ma la copia ridotta potrebbe escludere dati o moduli necessari in seguito.

Lascia spazio per il livello scrivibile, le applicazioni, le cache e zram, senza dimensionare lo spazio solo in base ai file dei moduli. Più RAM viene assegnata alla copia live, meno ne resta per i carichi di lavoro. Consulta [Modalità di avvio](/using-minios/Boot-Modes) per informazioni sulla durabilità della copia e sui vincoli legati alla rimozione del supporto.

### Filtraggio dei moduli (`load` e `noload`)

Il filtraggio può ridurre i dati copiati e i livelli montati, soprattutto con `toram=trim`. Il compromesso è un sistema meno completo e un rischio maggiore di errori all'avvio o in runtime se viene omessa una dipendenza. Verifica l'insieme di moduli risultante; la sintassi dei filtri e i limiti relativi ai moduli protetti sono descritti in [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading).

## Ottimizzazione della persistenza

La persistenza sposta le operazioni di I/O del livello scrivibile da RAM temporanei allo storage o a un container. La scelta del backend influisce su latenza, compatibilità, gestione della capacità e complessità del ripristino.

### Modalità di persistenza (`perchmode`)

- **`native`:** Memorizza il livello scrivibile direttamente come normali file. Ha il minor overhead del container e non prevede una dimensione fissa, ma richiede un filesystem di supporto che preservi i metadati e le operazioni Linux necessarie a MiniOS.
- **`raw`:** Usa una singola immagine ext4 di capacità fissa. La lunghezza del file corrisponde alla capacità richiesta e l'espansione è esplicita: è quindi semplice e prevedibile, ma non offre la capacità thin dei backend dinamici. FAT32 limita la singola immagine a 4000 MiB.
- **`dynfilefs`:** Il backend FUSE/format-400 espande lo storage dei dati su richiesta e supporta supporti altrimenti non adatti. Il suo indice non è sparse: per ogni blocco logico dichiarato di 4 KiB serve un offset di 8 byte. Perciò la capacità logica richiede circa 2 MiB di RAM e circa 2 MiB di storage dell'indice di supporto per GiB, anche se i dati sono vuoti. È efficiente per capacità moderate, ma le grandi capacità thin comportano costi iniziali elevati.
- **`dynblk`:** Il backend kernel format-1 `DBSPRS01` mantiene su disco le tabelle di mapping e una cache di metadati limitata in RAM (1 MiB per impostazione predefinita). Riempire un dispositivo esistente non alloca una mappa residente completa. Le descrizioni delle extent e le directory crescono in base alle parti dichiarate; la cache dei file e la memoria del codec si aggiungono a questi requisiti. `dynblk limits --format dynblk` indica il limite della geometria; `dynblk status /dev/dynblkN --json` riporta i buffer conteggiati e le statistiche della cache. Le normali sovrascritture raw avvengono sul posto; gli aggiornamenti parziali compressi ricomprimono attualmente un blocco da 64 KiB. Scegli con attenzione i criteri della cache degli allegati: `unsafe` rinuncia alle garanzie di durabilità.
- **`vmdk`:** Usa il driver kernel DynBlk con lo storage VMDK sparse standard suddiviso in più file. Cresce su richiesta, ma il backend non comprime i dati. Come i container DynBlk nativi, può essere copiato in RAM indipendentemente dai moduli di sistema e salvato esplicitamente di nuovo nello storage.
- **`squashfs`:** Memorizza uno snapshot compresso e ricostruisce il livello superiore scrivibile in RAM a ogni avvio. Riduce al minimo lo storage persistente per le sessioni prevalentemente stabili, ma comporta costi di CPU e RAM durante il ripristino e riscrive lo snapshot al salvataggio. Se la memoria lo consente, il salvataggio prepara una copia stabile delle modifiche in RAM e comprime i dati direttamente in un unico file candidato privato nella directory della sessione. Dopo la verifica e la sincronizzazione, MiniOS sostituisce atomicamente `changes.sb`; non scrive una seconda copia compressa. Se RAM non può contenere l'albero temporaneo, per archiviarlo viene usata l'area di lavoro su disco esistente.

LUKS2 può essere usato per cifrare Raw, DynFileFS, DynBlk o VMDK. La cifratura aggiunge i costi di sblocco e di crittografia, mantenendo le caratteristiche di capacità e storage del backend sottostante. Con LUKS2 la compressione DynBlk è disabilitata; VMDK non prevede mai la compressione lato backend.

Esegui benchmark con carichi di lavoro rappresentativi sul dispositivo effettivo. Le differenze tra controller flash, filesystem, bridge USB, cifratura, compressione e carichi di lavoro sono più attendibili di una classifica universale delle modalità di persistenza.

<a id="reduce-cache-and-log-writes-with-perch"></a>

### Riduci le scritture di cache e log con `perch`

Configuratore MiniOS **Avanzate** consente di configurare separatamente lo storage per i log di sistema ordinari, i download di APT e le cache standard dei browser nativi. Le impostazioni funzionano anche in `minios/config.conf` o nei suoi `config.conf.d/*.conf` frammenti:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Ogni impostazione accetta `persistent` (il valore predefinito) oppure `volatile`. Riavvia dopo aver modificato un'impostazione. `minios-boot` applica il criterio dopo l'attivazione corretta della persistenza su storage durevole o in una sessione scrivibile RAM con un record `ram-origin` protetto; richiedere la persistenza non è sufficiente. Per applicare l'impostazione a un solo avvio, usa `log-storage=volatile`, `apt-cache=volatile` oppure `browser-cache=volatile` nella riga di comando del kernel. Funzionano anche le forme con prefisso `live-config.` e hanno la precedenza sui file di configurazione. Queste impostazioni **non** attivano la `perch` da sole. Consulta [File di configurazione](/reference/configuration/config.conf) per l'ordine dei file sorgente e [Parametri di avvio](/reference/Boot-Parameters) per la sintassi completa.

| Impostazione | Cosa rimane in RAM con `volatile` | Cosa rimane nello storage persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | Il journal di systemd (massimo 32 MiB) e i normali file `/var/log` (tmpfs da 32 MiB). | Diagnostica di avvio in `/var/log/minios/` e `/var/log/live/`, comprese tre versioni precedenti dei log. |
| `LIVE_APT_CACHE` | Pacchetti scaricati in `/var/cache/apt/archives` (tmpfs da 256 o 512 MiB, in base alla memoria disponibile). | Stato dei pacchetti in `/var/lib/dpkg`, elenchi dei repository in `/var/lib/apt/lists` e file installati. |
| `LIVE_BROWSER_CACHE` | Un unico tmpfs condiviso da 512 MiB per le directory standard della cache di Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera e Yandex Browser nel profilo dell'utente live `~/.cache`. Un criterio di sistema disabilita la cache su disco di Firefox. | Profili, cookie, password, dati dei siti e cache di altre applicazioni. |

Le cache RAM di APT e dei browser vengono ignorate se sono disponibili meno di 1 GiB o se è attiva una swap diversa da zRAM. L'archivio APT in tmpfs non si estende sul dispositivo: un download più grande dello spazio residuo può non riuscire. Un'impostazione esistente di Firefox per la cache `policies.json` non viene sostituita: controlla separatamente l'impostazione della cache su disco. I percorsi standard dei browser nativi vengono predisposti dopo la creazione dell'utente live, anche se un browser viene installato in seguito. I percorsi personalizzati, le installazioni Flatpak/Snap e gli utenti creati dopo questa configurazione non vengono reindirizzati automaticamente. Le cache dei browser già archiviate vengono nascoste dai mount RAM per questo avvio e ricompaiono tornando a `persistent`.

Con la persistenza durevole, i log di avvio rimangono nell'archivio della sessione scrivibile, indipendentemente dall'impostazione dei log ordinari; una sessione SquashFS durevole li mantiene al di fuori di `changes.sb`, quindi non dipendono dal salvataggio dello snapshot allo spegnimento. Diversamente, in una sessione copiata con `perchtoram` i log rimangono in memoria fino al salvataggio nello storage. Con `volatile`, gli altri file in `/var/log` (inclusa la cronologia testuale di APT/dpkg) vengono eliminati al riavvio. `EXPORT_LOGS=true` è un'esportazione esplicita separata sul supporto MiniOS. Quando il tmpfs dei log da 32 MiB è pieno, smette di accettare nuove scritture dei log invece di riversarle sulla memoria flash. Se in seguito viene attivata un'altra swap su disco, i file in memoria possono comunque essere trasferiti su tale swap. Consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting#collecting-logs) per trovare la diagnostica di avvio.

MiniOS usa anche `noatime` quando monta i propri filesystem di dati e dei container, evitando gli aggiornamenti dei metadati relativi ai tempi di accesso; non rimonta i dischi utente non correlati. I `relatime` standard limitano già questi aggiornamenti: misura la differenza prima di considerarli un risparmio significativo. Per un archivio rimovibile persistente, mantieni attivi il journal del filesystem, le barriere e `fsync`.

In un test controllato con una scrittura di un file di log da 16 MiB seguita da `sync`, una VM Testo ha registrato 33.304 settori scritti sul disco virtuale sottostante in modalità persistente e 8 in modalità volatile. Il test mostra la variazione del percorso di scrittura per quel carico di lavoro. Non misura le scritture all'interno di un controller di memoria flash USB né consente di prevedere la durata della memoria NAND. Prima di trarre conclusioni sulla durata, confronta carichi di lavoro identici delle applicazioni sul dispositivo effettivo.

## Configurazione di ZRAM

Zram scambia tempo CPU con capacità di memoria compressa e può evitare una swap su storage molto più lenta. Un dispositivo zram più grande può contenere più pagine inattive, ma non crea RAM fisica: i carichi di lavoro incomprimibili continuano a occupare memoria.
Gli algoritmi di compressione comportano compromessi tra velocità di elaborazione, uso della CPU e rapporto di compressione; la disponibilità dipende dal kernel. Mantieni l'impostazione predefinita e modifica `zramsize`, `zramcomp` oppure `nozram` solo per carichi di lavoro misurati; consulta [Parametri di avvio](/reference/Boot-Parameters) per i valori accettati.

## Filesystem e hardware di archiviazione

- **Scelta del dispositivo:** Una velocità di trasferimento sequenziale elevata accelera la copia di moduli di grandi dimensioni, mentre una bassa latenza nelle operazioni I/O casuali è più importante per i carichi di lavoro desktop persistenti.
  Misura le prestazioni del dispositivo e del case insieme: la sola generazione USB non permette di prevedere le prestazioni della memoria flash o dell’SSD.
- **Scelta del filesystem:** Un filesystem nativo Linux può sfruttare la persistenza nativa senza l’overhead di un container. I filesystem multipiattaforma migliorano la portabilità, ma per gestire i metadati Linux richiedono un backend container compatibile, aggiungendo livelli di mappatura e filesystem. Scegli in base alla portabilità e alle esigenze di ripristino, oltre che ai risultati dei benchmark.
