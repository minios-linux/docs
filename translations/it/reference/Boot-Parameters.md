---
updated: 2026-10-06
---

# Parametri di avvio

## Come utilizzare i parametri di avvio

I parametri di avvio personalizzano il modo in cui MiniOS viene avviato. Separa i parametri con uno spazio sulla riga di comando del kernel.

### Syslinux

- Premi <kbd>Esc</kbd> durante la sequenza di avvio di MiniOS per accedere al menu di avvio.
- Premi <kbd>Tab</kbd> per modificare le opzioni di avvio.
- Inserisci i parametri e premi <kbd>Invio</kbd> per avviare.

### GRUB

- Premi <kbd>E</kbd> nel menu GRUB.
- Modifica i parametri di avvio alla fine della riga di comando.
- Premi <kbd>F10</kbd> per avviare con le nuove impostazioni.

## Parametri di avvio

La colonna Applicazione distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell’account previste solo per la configurazione iniziale. Con la persistenza, i componenti live-config vengono normalmente eseguiti una sola volta; vedi [live-config](/reference/configuration/live-config).

Questa tabella è un riferimento rapido. La precedenza delle fonti e le `from=` forme accettate sono definite in [Rilevamento sistema Initrd](/reference/boot-process/System-Discovery), il filtraggio dei moduli in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading), la selezione della persistenza in [Persistenza Initrd](/reference/boot-process/Persistence-Internals), e le combinazioni supportate in [Modalità di avvio](/using-minios/Boot-Modes).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | Ogni avvio | Carica i dati MiniOS da una directory, un percorso di dispositivo supportato o un file ISO. Le forme UUID, PARTUUID e by-id dei dispositivi non vengono interpretate. Un **`http://` URL letterale** ha precedenza su `ip=` e avvia il [boot di rete](/reference/boot-process/Network-Boot) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Ogni avvio | Mantiene i candidati `.sb` il cui percorso corrisponde a un’espressione regolare estesa non ancorata; le virgole diventano alternative e un intero intervallo numerico crescente viene espanso in modo speciale. Filtra anche `toram=trim`. Può escludere moduli core o del kernel e rendere il sistema non avviabile. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Ogni avvio | Esclude i candidati il cui percorso corrisponde a un’espressione regolare estesa non ancorata, anche da `toram=trim`; viene applicato dopo `load` e può escludere moduli core o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Ogni avvio | Imposta l’estensione del bundle. Predefinito: `sb`. Il coordinamento con il kernel utilizza comunque i nomi letterali `.sb`, quindi un’estensione personalizzata non può coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | Ogni avvio | Abilita la visualizzazione dei tempi di avvio. | `timing` |
| `union` | Ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Ogni avvio | Indirizzo statico per il recupero di rete anticipato. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un valore letterale `from=http://...` ha precedenza su `ip=` e utilizza i suoi campi di indirizzamento; altrimenti qualsiasi valore non vuoto di `ip=` forza il download dei dati PXE e salta i supporti locali. Questa non è una configurazione NetworkManager di sessione. Vedi [Boot di rete](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Ogni avvio | Dimensione cache httpfs in MiB per il boot di rete HTTP ISO (`from=http://…`). Vedi [Boot di rete](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Ogni avvio | Apre una shell di debug al termine della fase initramfs. | `rd.break` |
| `perchdir` | Ogni avvio | Seleziona una sessione di persistenza numerata o un’azione. `resume` apre la sessione compatibile predefinita; `setup` consente di scegliere interattivamente il backend di archiviazione e poi crea una nuova sessione numerata; `new` crea direttamente una nuova sessione dalla `perchmode` richiesta/predefinita, con impostazioni di cifratura, compressione e dimensione; `ask` offre le sessioni salvate e avvia automaticamente la configurazione se non ne esistono. Un selettore numerico inesistente può ricorrere al valore predefinito dei metadati; non riserva né crea quel numero. Un dispositivo/percorso o la forma `askdisk` seleziona un’altra posizione di persistenza. Usa un suffisso delimitato da due punti per un percorso personalizzato. Senza parametro di persistenza, MiniOS si avvia senza dati persistenti. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Ogni avvio | Dimensione logica del contenitore per `dynfilefs` , `dynblk` , `vmdk` e `raw`; non si applica a `native` o `squashfs`. Un numero semplice o il valore `M`/`MB` viene allocato in MiB; `G`/`GB` e `T`/`TB` sono convertiti rispettivamente in 1000 e 1.000.000 MiB. Senza una dimensione esplicita, le sessioni DynFileFS, DynBlk e VMDK create da initrd utilizzano fino a 16 GiB e riducono questo valore predefinito se lo spazio residuo è inferiore dopo `perchreserve`; DynFileFS considera anche l’overhead dell’indice e il limite RAM. DynBlk interroga il limite del backend installato usando `dynblk limits --format dynblk` (o `--format vmdk` per VMDK); non esiste un limite separato di 512 GiB. Il payload DynFileFS e i dati di supporto DynBlk crescono su richiesta, mentre DynFileFS riserva anche gli indici per la capacità logica dichiarata. Le richieste raw sono limitate a 1.000.000 MiB e dallo spazio disponibile dopo `perchreserve`; Raw è limitato a 4000 MiB su FAT32, sia cifrato che non. I nuovi contenitori raw predefiniti sono di 4000 MiB. Il Gestore sessioni MiniOS imposta ancora i contenitori DynFileFS creati manualmente a 4000 MiB e DynBlk/VMDK a 16 GiB. Vedi [Persistenza Initrd](/reference/boot-process/Persistence-Internals) per dettagli su comportamento di memoria e archiviazione del backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Ogni avvio | Margine di allocazione e soglia di avviso di spazio insufficiente in MiB. Viene sottratto durante il dimensionamento di nuovi contenitori o in crescita, ma non è una quota a runtime e non impedisce che scritture successive riempiano il dispositivo. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Ogni avvio | Modalità di archiviazione della persistenza.<br>`native` (predefinito): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: il contenitore espandibile formato-400 basato su FUSE, anche su FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo a blocchi kernel separato formato-1 supportato da file thin `volumeNNN.db`, il numero effettivo di `/dev/dynblkN` viene allocato dinamicamente e possono coesistere più volumi.<br>`vmdk`: file sparsi standard suddivisi `volume.vmdk` / `volume-sNNN.vmdk` esposti dal driver DynBlk; nessuna compressione. Richiede la capacità versionata `vmdk-session-v1` di initrd.<br>`raw`: un’immagine ext4 a dimensione fissa.<br>`squashfs`: uno snapshot compresso estratto in un layer superiore supportato da RAM. L’initrd crea solo i metadati di generazione zero; il sistema in esecuzione crea il primo snapshot su richiesta o allo spegnimento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo creazione | Livello di cifratura opzionale per un nuovo `raw`, `dynfilefs`, `dynblk` o sessione `vmdk`. `perchencrypt=luks` richiede la capacità versionata `luks-layer-v1` di initramfs. Le sessioni esistenti derivano la cifratura solo da `session_encryption[N]`, quindi questo parametro non le reinterpreta né le converte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo creazione | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate` o `842`. Il codec kernel selezionato deve essere disponibile. Quando `perchencrypt=luks` incapsula DynBlk, MiniOS forza la compressione DynBlk a `none`. VMDK non supporta la compressione: l’avvio ignora un codec non`none` con un avviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Ogni avvio | Abilita il percorso di ripristino legacy della persistenza. A differenza di `perchdir=resume`, non crea automaticamente una sostituzione compatibile quando non esiste una sessione predefinita utilizzabile. | `perch` |
| `toram` | Ogni avvio | Controlla la copia dei dati di sistema MiniOS **sul sistema** su RAM. Il valore `toram` è `full`; `trim` copia la configurazione richiesta e il set di moduli selezionato, omettendo i dati sorgente non correlati. La copia della persistenza è gestita separatamente da `perchtoram`. Quando la persistenza è richiesta e `perchtoram` non è specificato, qualsiasi modalità `toram` attiva imposta la copia della persistenza su `trim`. Rimuovere il supporto solo dopo aver verificato che la sorgente originale, i loop, i mapping e qualsiasi archivio di persistenza richiesto siano stati scollegati correttamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Ogni avvio con persistenza | Controlla la copia delle sessioni di persistenza supportate indipendentemente dai dati di sistema `toram`: `off` mantiene la sessione sul supporto originale, `trim` copia solo la sessione Raw, DynFileFS, DynBlk, VMDK o SquashFS selezionata più i metadati corrispondenti, e `full` copia tutte le sessioni container/SquashFS supportate da quel supporto. Le sessioni native in directory non vengono copiate. Il valore predefinito è `trim` quando è attivo il sistema `toram`, altrimenti `off`; un valore esplicito ha la precedenza. Una sessione copiata è marcata come non durevole, ma l’attuale Gestore sessioni può salvare esplicitamente le modifiche supportate da RAM sul supporto originale o come nuova sessione quando quel supporto è disponibile e corrisponde ancora alla sua identità registrata. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | Ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | Ogni avvio | Abilita diagnostica aggiuntiva all’avvio. | `debug` |
| `nozram` | Ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | Ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS la calcola in base alla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`. La disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Ogni avvio | Imposta il target systemd predefinito. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Ogni avvio | Abilita i servizi systemd specificati all’avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Ogni avvio | Disabilita i servizi systemd specificati all’avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Ogni avvio | Disabilita le modifiche automatiche della risoluzione dello schermo nelle macchine virtuali. Il valore predefinito XFCE è 1280x800. | `novirtres` |
| `virtres` | Ogni avvio | Imposta la risoluzione dello schermo XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Ogni avvio | Esegue solo i componenti live-config elencati, nell’ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | Ogni avvio | Imposta il nome host del sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l’accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell’utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell’utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password utente in chiaro. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Ogni avvio | Imposta una o più locale di sistema. | `locales=en_US.UTF-8` |
| `timezone` | Ogni avvio | Imposta il fuso orario del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | Ogni avvio | Imposta i layout di tastiera separati da virgola. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Ogni avvio | Imposta le varianti di tastiera, separate da virgola, corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | Ogni avvio | Impedisce a live-config di configurare l’accesso automatico su console e grafico; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | Ogni avvio | Impedisce solo la configurazione dell’accesso automatico su console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | Ogni avvio | Impedisce solo la configurazione dell’accesso automatico grafico; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | Ogni avvio | Seleziona un driver Xorg invece dell’autorilevamento. | `xorg-driver=nouveau` |
| `xorg-resolution` | Ogni avvio | Imposta la risoluzione Xorg invece dell’autorilevamento. | `xorg-resolution=1920x1080` |
| `module-mode` | Ogni avvio | Con `merged`, integra le modifiche di configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `link-user-dirs` | Ogni avvio | Collega le directory utente gestite a supporti MiniOS scrivibili. È mutuamente esclusivo con `bind-user-dirs` e non disponibile con qualsiasi modalità `toram` o mentre la sessione di persistenza attiva è cifrata con LUKS. La cifratura attiva viene determinata dalla sessione in esecuzione, non dalla richiesta di creazione `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | Ogni avvio | Effettua il bind-mount delle directory utente gestite da supporti MiniOS scrivibili. Ha le stesse restrizioni di `toram` e cifratura della sessione attiva di `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Ogni avvio | Imposta la posizione relativa al supporto utilizzata da `link-user-dirs` o `bind-user-dirs`. Predefinito: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerazioni sulla sicurezza

La riga di comando del kernel è in chiaro ed è normalmente visibile nella configurazione del bootloader, `/proc/cmdline`, e nella diagnostica. Non inserire segreti riutilizzabili in `root-password=` o `user-password=`. Preferisci i parametri `*-crypted` corrispondenti, trattando comunque gli hash delle password esposti come dati sensibili.

Gli hook vengono eseguiti come codice privilegiato all’avvio. Un hook `http://` non offre né cifratura del trasporto né autenticazione del server, quindi chiunque possa alterare il percorso di rete può sostituirlo. Usa solo contenuti e meccanismi di distribuzione affidabili; non utilizzare hook HTTP non autenticati per avvii sensibili alla sicurezza.

Separa i comandi con spazi. Consulta le `man bootparam` pagine di riferimento per ulteriori parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri live-config, vedi [live-config](/reference/configuration/live-config).

Per il caricamento di MiniOS tramite rete (PXE e HTTP ISO), vedi [Boot di rete](/reference/boot-process/Network-Boot).

## Parametri cache e log delle sessioni persistenti

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `log-storage` o `live-config.log-storage` | Ogni avvio, con `perch` | `persistent` (predefinito) o `volatile`. In modalità volatile, journald utilizza fino a 32 MiB di RAM e la normale `/var/log` usa una tmpfs da 32 MiB. `minios-boot` e `live-config` i log di avvio rimangono sul supporto di persistenza scrivibile. Un filesystem di log RAM pieno smette di accettare scritture invece di riversarsi sul dispositivo USB. | `log-storage=volatile` |
| `apt-cache` o `live-config.apt-cache` | Ogni avvio, con `perch` | `persistent` (predefinito) o `volatile` per `/var/cache/apt/archives`. Il mount RAM è di 256 o 512 MiB quando c’è memoria sufficiente e nessuno swap non-zRAM è attivo; download di grandi dimensioni possono esaurirlo. `/var/lib/apt/lists` e lo stato di dpkg rimangono persistenti. | `apt-cache=volatile` |
| `browser-cache` o `live-config.browser-cache` | Ogni avvio, con `perch` | `persistent` (predefinito) o `volatile` per le cache standard dei browser nativi. Dopo la creazione dell’utente live, alcune sottodirectory `~/.cache` usano una tmpfs condivisa da 512 MiB e la cache su disco di Firefox è disabilitata tramite una policy di sistema gestita quando non è presente nessun altro file di policy di Firefox. I profili e le altre cache delle applicazioni rimangono persistenti. | `browser-cache=volatile` |

I tre parametri storage-policy vengono interpretati da `minios-boot` prima del normale sistema di init, **non** dal selettore di persistenza iniziale. Non abilitano `perch` e hanno effetto solo dopo l’attivazione riuscita della persistenza durevole. Un initrd compatibile pubblicizza `perch-storage-v1` su `/run/initramfs/etc/minios-initramfs-storage`. Configuratore e `config.conf` offrono le stesse scelte; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per limiti, precedenza e note sull’installazione dei browser.
