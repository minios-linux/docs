---
updated: 2026-09-26
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

- **`native`:** Memorizza il layer scrivibile direttamente come file ordinari. Ha il minor overhead di container e nessuna dimensione fissa, ma richiede un filesystem di supporto che preservi i metadati Linux e le operazioni di cui MiniOS ha bisogno.
- **`raw`:** Utilizza un'unica immagine ext4 a capacità fissa. La lunghezza del file è impostata sulla capacità richiesta e la crescita è esplicita, quindi è semplice e prevedibile, ma non offre il comportamento thin-provisioning dei backend dinamici. FAT32 limita la singola immagine a 4000 MiB.
- **`dynfilefs`:** Il backend FUSE/format-400 espande lo spazio dati su richiesta e supporta supporti altrimenti non adatti. Il suo indice non è sparso: ogni blocco logico da 4 KiB dichiarato richiede un offset da 8 byte, quindi la capacità logica costa circa 2 MiB di RAM e circa 2 MiB di spazio indice su disco per GiB anche a payload vuoto. Questo rende efficienti le capacità moderate, ma costose in anticipo quelle elevate.
- **`dynblk`:** Il backend kernel format-1 `DBSPRS01` mantiene le tabelle di mappatura su disco e una cache metadati limitata in RAM (default 1 MiB). Riempire un dispositivo esistente non alloca una mappa residente completa. Le descrizioni degli extent e le directory crescono in base alle parti dichiarate; la cache file e la memoria codec sono aggiuntive. `dynblk limits --format dynblk` segnala il limite di geometria; `dynblk status /dev/dynblkN --json` mostra buffer conteggiati e statistiche cache. Le sovrascritture raw ordinarie restano in posizione; gli aggiornamenti compressi parziali attualmente ricomprimono un blocco da 64 KiB. Scegli consapevolmente la policy di cache degli allegati: `unsafe` rinuncia alle garanzie di durabilità.
- **`squashfs`:** Salva uno snapshot compresso e ricostruisce la parte scrivibile superiore in RAM a ogni avvio. Minimizza lo spazio persistente per sessioni perlopiù stabili, ma richiede CPU e risorse RAM durante il ripristino e riscrive lo snapshot al salvataggio. Se la memoria lo consente, il salvataggio prepara una copia stabile delle modifiche in RAM e comprime direttamente in un candidato privato nella directory della sessione. Dopo verifica e sincronizzazione, MiniOS sostituisce in modo atomico `changes.sb`; non viene scritta una seconda copia compressa. Se RAM non può contenere l'albero di staging, viene utilizzata l'area di lavoro su disco esistente per quell'albero.

LUKS2 può avvolgere Raw, DynFileFS o DynBlk. La cifratura aggiunge overhead di sblocco e crittografia mantenendo la capacità e il comportamento di storage del backend sottostante.

Esegui benchmark dei carichi di lavoro rappresentativi sul dispositivo reale. Controller flash, filesystem, bridge USB, cifratura, compressione e differenze di workload sono più affidabili di una classifica universale delle modalità di persistenza.

### Riduci scritture su cache e log con `perch`

Configuratore MiniOS **Avanzate** offre impostazioni di storage indipendenti per i log di sistema, i download APT e le cache native dei browser. Funzionano anche in `minios/config.conf` o nei suoi `config.conf.d/*.conf` frammenti:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Ogni impostazione accetta `persistent` (predefinito) oppure `volatile`. Riavvia dopo aver modificato un valore. `minios-boot` applica la policy solo quando la sessione `perch` in esecuzione è confermata come scrivibile e durevole; richiedere la persistenza non basta. Per un avvio singolo, usa `log-storage=volatile`, `apt-cache=volatile`, oppure `browser-cache=volatile` sulla riga di comando del kernel. Le varianti con prefisso `live-config.` funzionano anch'esse e hanno priorità sui file di configurazione. Queste impostazioni **non** attivano `perch` da sole. Vedi [File di configurazione](/reference/configuration/config.conf) per l'ordine dei file sorgente e [Parametri di avvio](/reference/Boot-Parameters) per la sintassi completa.

| Impostazione | Cosa resta in RAM con `volatile` | Cosa rimane su storage persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | Il journal systemd (massimo 32 MiB) e i normali file `/var/log` (32 MiB tmpfs). | Diagnostica di avvio in `/var/log/minios/` e `/var/log/live/`, incluse le tre versioni precedenti dei log. |
| `LIVE_APT_CACHE` | Pacchetti scaricati in `/var/cache/apt/archives` (tmpfs da 256 o 512 MiB, a seconda della memoria disponibile). | Stato dei pacchetti in `/var/lib/dpkg`, liste repository in `/var/lib/apt/lists`, e file installati. |
| `LIVE_BROWSER_CACHE` | Un unico tmpfs condiviso da 512 MiB per le directory cache standard di Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera e Yandex Browser nella home dell'utente live `~/.cache`. Una policy di sistema disabilita la cache su disco di Firefox. | Profili, cookie, password, dati dei siti e cache di applicazioni non correlate. |

Le cache APT e dei browser RAM vengono saltate se sono disponibili meno di 1 GiB o se è attivo uno swap non-zRAM. Il tmpfs dell'archivio APT non si espande sul dispositivo: un download più grande della capacità residua può fallire. Un'eventuale cache disco di Firefox `policies.json` non viene sostituita; controlla separatamente l'impostazione della cache su disco. I percorsi standard delle cache native dei browser vengono preparati dopo la creazione dell'utente live, anche se il browser viene installato successivamente. Percorsi personalizzati, installazioni Flatpak/Snap e utenti creati dopo questa fase non vengono reindirizzati automaticamente. Le cache browser già presenti vengono nascoste dai mount RAM per questo avvio e riappaiono tornando a `persistent`.

I log di avvio restano sempre sul supporto persistente scrivibile, indipendentemente dall'impostazione dei log ordinari; una sessione SquashFS li mantiene fuori da `changes.sb`, quindi non dipendono dal salvataggio dello snapshot allo spegnimento. Con `volatile`, gli altri file sotto `/var/log` (inclusa la cronologia testuale di APT/dpkg) vengono eliminati al riavvio. `EXPORT_LOGS=true` è un'esportazione separata ed esplicita sul supporto MiniOS. Un tmpfs log pieno da 32 MiB non accetta nuovi log invece di riversarsi su flash. Se in seguito viene abilitato un altro swap su disco, i file in memoria possono comunque essere paginati su quello swap. Consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting#collecting-logs) per trovare la diagnostica di avvio.

MiniOS utilizza anche `noatime` durante il mount dei propri dati e filesystem container, evitando aggiornamenti di metadati access-time; ciò non rimonta i dischi utente non correlati. I filesystem standard `relatime` già limitano tali aggiornamenti, quindi valuta la differenza prima di considerarlo un risparmio importante. Mantieni abilitati journal filesystem, barrier e `fsync` per uno storage persistente rimovibile.

Per una scrittura controllata di log da 16 MiB seguita da `sync`, una VM Testo ha registrato 33.304 settori scritti sul disco virtuale inferiore in modalità persistente e 8 in modalità volatile. Questo dimostra la differenza nel percorso di scrittura per quel carico di lavoro. Non misura le scritture interne al controller flash USB né predice la durata della NAND. Confronta carichi di lavoro applicativi identici sul dispositivo reale prima di trarre conclusioni sulla durata.
