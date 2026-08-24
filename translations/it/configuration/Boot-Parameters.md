# Parametri di avvio

## Come utilizzare i parametri di avvio

I parametri di avvio personalizzano il modo in cui MiniOS viene avviato. Separa i parametri con spazi sulla riga di comando del kernel.

### Syslinux

- Premi <kbd>Esc</kbd> durante la sequenza di avvio di MiniOS per accedere al menu di boot.
- Premi <kbd>Tab</kbd> per modificare le opzioni di avvio.
- Inserisci i parametri e premi <kbd>Enter</kbd> per avviare.

### GRUB

- Premi <kbd>E</kbd> nel menu GRUB.
- Modifica i parametri di avvio alla fine della riga di comando.
- Premi <kbd>F10</kbd> per avviare con le nuove impostazioni.

## Parametri di avvio

La colonna Applicazione distingue i parametri normalmente accettati ad ogni avvio dalle impostazioni account destinate alla configurazione iniziale. Con la persistenza, i componenti live-config vengono normalmente eseguiti solo una volta; vedi [live-config](/configuration/live-config.md).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | Ogni avvio | Carica i dati di MiniOS da una directory, dispositivo o ISO. Una ISO remota tramite **`http://` solo** avvia il [boot di rete](/installation/Network-Boot.md) (httpfs2). | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | Ogni avvio | Carica solo i moduli `.sb` che corrispondono a un nome, elenco, espressione regolare o intervallo numerico supportato. Filtra anche i moduli copiati da `toram=trim`. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Ogni avvio | Esclude i moduli `.sb` corrispondenti, anche da `toram=trim`. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Ogni avvio | Imposta l'estensione del bundle. Predefinito: `sb`. | `bext=mymod` |
| `timing` | Ogni avvio | Abilita l'output del timing di avvio. | `timing` |
| `union` | Ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Ogni avvio | **Solo boot di rete (PXE).** Indirizzo statico per il recupero iniziale. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP predefinita **7529**). Un `ip=` non vuoto forza il download dati PXE e salta i supporti locali. Non è la configurazione NetworkManager di sessione. Vedi [boot di rete](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Ogni avvio | Dimensione cache httpfs in MB per il boot di rete ISO HTTP (`from=http://…`). Vedi [boot di rete](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Ogni avvio | Apre una shell di debug al termine della fase initramfs. | `rd.break` |
| `perchdir` | Ogni avvio | Seleziona una sessione di persistenza numerata o un'azione: `resume`, `new` o `ask`. Un dispositivo/percorso o la forma `askdisk` seleziona un'altra posizione di persistenza. Senza un parametro di persistenza, MiniOS si avvia senza dati persistenti. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | Ogni avvio | Dimensione del container per `dynfilefs`, `raw` e `luks`; non si applica a `native` o `squashfs`. Accetta un numero intero in MB o un suffisso `M`/`MB`, `G`/`GB`, o `T`/`TB`; GB e TB sono convertiti rispettivamente in 1000 MB e 1.000.000 MB. Il limite è 1.000.000 MB, ulteriormente limitato dallo spazio disponibile dopo `perchreserve`; i file raw e LUKS sono limitati a 4000 MB su FAT32. I nuovi container raw e LUKS predefiniti sono di 4000 MB. DynFileFS creato da initramfs predefinito alla capacità disponibile arrotondata a 1000 MB; Session Manager lo imposta di default a 4000 MB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Ogni avvio | Spazio libero, in MiB, mantenuto sul dispositivo di persistenza. I container nuovi o in crescita non lo consumano e MiniOS avvisa quando lo spazio libero lo raggiunge. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Ogni avvio | Modalità di archiviazione della persistenza.<br>`native` (predefinito): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: un container espandibile, anche su FAT32, NTFS o exFAT.<br>`raw`: un'immagine ext4 a dimensione fissa.<br>`luks`: un container ext4 cifrato LUKS2; la creazione e lo sblocco avvengono da console e richiedono il supporto crypt nell'initramfs.<br>`squashfs`: uno snapshot compresso esistente estratto per la sessione. Il Session Manager può creare e salvare snapshot SquashFS dal sistema in esecuzione; l'initramfs può ripristinarli ma non crearli. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Ogni avvio | Abilita la persistenza e riprende l'ultima sessione. Equivalente a `perchdir=resume`. | `perch` |
| `toram` | Ogni avvio | Copia MiniOS in RAM. Senza valore utilizza `full`; `full` copia l'intera directory MiniOS, mentre `trim` copia il set di moduli selezionato da `load` e `noload`. Le modifiche persistenti sono incluse se richiesta la persistenza. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | Ogni avvio | Abilita il mount automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | Ogni avvio | Abilita diagnostica aggiuntiva all'avvio. | `debug` |
| `nozram` | Ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | Ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS la calcola dalla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`; la disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Ogni avvio | Imposta il target predefinito di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Ogni avvio | Abilita i servizi systemd specificati all'avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Ogni avvio | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Ogni avvio | Disabilita i cambi automatici di risoluzione dello schermo nelle macchine virtuali. Il valore predefinito di XFCE è 1280x800. | `novirtres` |
| `virtres` | Ogni avvio | Imposta la risoluzione dello schermo XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Ogni avvio | Esegue solo i componenti live-config elencati, nell'ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | Ogni avvio | Imposta il nome host di sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l'accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell'utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell'utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password utente in chiaro. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Ogni avvio | Imposta una o più locali di sistema. | `locales=en_US.UTF-8` |
| `timezone` | Ogni avvio | Imposta il fuso orario di sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | Ogni avvio | Imposta i layout di tastiera separati da virgola. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Ogni avvio | Imposta le varianti di tastiera separate da virgola corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | Ogni avvio | Impedisce a live-config di configurare l'autologin su console e grafica; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | Ogni avvio | Impedisce solo la configurazione dell'autologin su console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | Ogni avvio | Impedisce solo la configurazione dell'autologin grafico; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | Ogni avvio | Seleziona un driver Xorg invece dell'autodetect. | `xorg-driver=nouveau` |
| `xorg-resolution` | Ogni avvio | Imposta la risoluzione Xorg invece dell'autodetect. | `xorg-resolution=1920x1080` |
| `module-mode` | Ogni avvio | Con `merged`, integra le modifiche di configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `hooks` | Ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Separa i comandi con spazi. Consulta le pagine di riferimento `man bootparam` per ulteriori parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri live-config, vedi [live-config](/configuration/live-config.md).

Per il caricamento di MiniOS tramite rete (PXE e ISO HTTP), vedi [boot di rete](/installation/Network-Boot.md).
