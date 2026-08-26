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

La colonna "Applicazione" distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell'account destinate alla configurazione iniziale. Con la persistenza, i componenti live-config normalmente vengono eseguiti solo una volta; vedi [live-config](/configuration/live-config.md).

Questa tabella è un riferimento rapido. La precedenza delle fonti e le forme accettate di `from=`
sono definite in [Scoperta del sistema Initrd](/configuration/Initrd-System-Discovery.md),
il filtraggio dei moduli in [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md),
la selezione della persistenza in [Persistenza Initrd](/configuration/Initrd-Persistence.md),
e le combinazioni supportate in [Modalità di avvio](/configuration/Boot-Modes.md).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | Ogni avvio | Carica i dati MiniOS da una directory, un percorso di dispositivo supportato o un ISO. Le forme UUID, PARTUUID e by-id dei dispositivi non vengono interpretate. Un URL **`http://` only** letterale ha la precedenza su `ip=` e avvia il [boot di rete](/installation/Network-Boot.md) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Ogni avvio | Mantiene i candidati `.sb` il cui percorso corrisponde a un'espressione regolare estesa non ancorata; le virgole diventano alternanza e un intero intervallo numerico crescente ha un'espansione speciale. Filtra anche `toram=trim`. Può escludere moduli core o del kernel e rendere il sistema non avviabile. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Ogni avvio | Esclude i candidati il cui percorso corrisponde a un'espressione regolare estesa non ancorata, inclusi quelli da `toram=trim`; viene applicato dopo `load` e può escludere moduli core o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Ogni avvio | Imposta l'estensione del bundle. Predefinito: `sb`. Il coordinamento del kernel utilizza comunque i nomi letterali `.sb`, quindi un'estensione personalizzata non può coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | Ogni avvio | Abilita l'output dei tempi di avvio. | `timing` |
| `union` | Ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Ogni avvio | Indirizzo statico per il recupero di rete anticipato. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un `from=http://...` letterale ha la precedenza su `ip=` e utilizza i suoi campi di indirizzamento; altrimenti qualsiasi `ip=` non vuoto forza il download dei dati PXE e salta i supporti locali. Questa non è una configurazione NetworkManager di sessione. Vedi [Boot di rete](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Ogni avvio | Dimensione della cache httpfs in MiB per il boot di rete HTTP ISO (`from=http://…`). Vedi [Boot di rete](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Ogni avvio | Apre una shell di debug al termine della fase initramfs. | `rd.break` |
| `perchdir` | Ogni avvio | Seleziona una sessione di persistenza numerata o un'azione: `resume`, `new` o `ask`. Un selettore numerico inesistente può ricadere sul valore predefinito dei metadati; non riserva né crea quel numero. Un dispositivo/percorso o una forma `askdisk` seleziona un'altra posizione di persistenza. Usa un suffisso delimitato da due punti per un percorso personalizzato. Senza un parametro di persistenza, MiniOS si avvia in modalità pulita. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Ogni avvio | Dimensione del container per `dynfilefs`, `raw` e `luks`; non si applica a `native` o `squashfs`. Un numero semplice o un valore `M`/`MB` viene allocato in MiB; `G`/`GB` e `T`/`TB` sono convertiti rispettivamente in 1000 e 1.000.000 MiB. Il limite è 1.000.000 MiB, ulteriormente limitato dallo spazio disponibile dopo `perchreserve`. Il Session Manager limita i file raw e LUKS a 4000 MiB su FAT32; initrd LUKS applica tale limite, ma una richiesta raw initrd sovradimensionata può fallire invece di essere ridotta. I nuovi container raw e LUKS predefiniti sono di 4000 MiB. I DynFileFS creati da initramfs hanno come default la capacità disponibile arrotondata a 1000 MiB; il Session Manager li imposta di default a 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Ogni avvio | Spazio libero, in MiB, mantenuto sul dispositivo di persistenza. I container nuovi o in crescita non lo consumano e MiniOS avvisa quando lo spazio libero lo raggiunge. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Ogni avvio | Modalità di archiviazione della persistenza.<br>`native` (predefinito): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: un container espandibile, anche su FAT32, NTFS o exFAT.<br>`raw`: un'immagine ext4 a dimensione fissa.<br>`luks`: un container ext4 cifrato LUKS2; la creazione e lo sblocco avvengono da console e richiedono il supporto crypt nell'initramfs.<br>`squashfs`: uno snapshot compresso esistente, estratto per la sessione. Il Session Manager può creare e salvare snapshot SquashFS dal sistema in esecuzione; l'initramfs può ripristinarli ma non crearli. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Ogni avvio | Abilita il percorso legacy di ripresa della persistenza. A differenza di `perchdir=resume`, non crea automaticamente una sostituzione compatibile quando non esiste una sessione predefinita utilizzabile. | `perch` |
| `toram` | Ogni avvio | `toram` senza argomenti equivale a `full`. Con la persistenza, la copia `*` di primo livello omette i file nascosti; senza persistenza omette `changes` ma copia le altre voci di primo livello, inclusi i file nascosti. Trim copia i `config.conf` richiesti, i file regolari `authorized_keys`, i moduli selezionati di primo livello e ricorsivi, e l'intero albero `changes/` quando viene richiesta la persistenza; omette `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, i log, altri dati non modulo e il livello separato dei moduli di persistenza. Nessuna modalità controlla prima la capacità della RAM. Un archivio di persistenza copiato in RAM non è durevole e le modifiche non vengono riportate indietro. Rimuovere il supporto solo dopo aver confermato che la sorgente, i loop e le mappature sono stati scollegati correttamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | Ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | Ogni avvio | Abilita diagnostica aggiuntiva all'avvio. | `debug` |
| `nozram` | Ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | Ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS la calcola in base alla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`; la disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Ogni avvio | Imposta il target predefinito di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Ogni avvio | Abilita i servizi systemd specificati all'avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Ogni avvio | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Ogni avvio | Disabilita i cambiamenti automatici della risoluzione dello schermo nelle macchine virtuali. Il valore predefinito XFCE è 1280x800. | `novirtres` |
| `virtres` | Ogni avvio | Imposta la risoluzione dello schermo XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Ogni avvio | Esegue solo i componenti live-config elencati, nell'ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | Ogni avvio | Imposta il nome host del sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l'autologin. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell'utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell'utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password utente in chiaro. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Ogni avvio | Imposta una o più locale di sistema. | `locales=en_US.UTF-8` |
| `timezone` | Ogni avvio | Imposta il fuso orario di sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | Ogni avvio | Imposta i layout di tastiera separati da virgola. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Ogni avvio | Imposta le varianti di tastiera, separate da virgola, corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | Ogni avvio | Impedisce a live-config di configurare l'autologin su console e grafica; le configurazioni persistenti esistenti non vengono rimosse. | `noautologin` |
| `nottyautologin` | Ogni avvio | Impedisce la configurazione dell'autologin solo su console; le configurazioni persistenti esistenti non vengono rimosse. | `nottyautologin` |
| `nox11autologin` | Ogni avvio | Impedisce la configurazione dell'autologin solo grafico; le configurazioni persistenti esistenti non vengono rimosse. | `nox11autologin` |
| `xorg-driver` | Ogni avvio | Seleziona un driver Xorg invece dell'autorilevamento. | `xorg-driver=nouveau` |
| `xorg-resolution` | Ogni avvio | Imposta la risoluzione Xorg invece dell'autorilevamento. | `xorg-resolution=1920x1080` |
| `module-mode` | Ogni avvio | Con `merged`, integra le modifiche di configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `hooks` | Ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerazioni sulla sicurezza

La riga di comando del kernel è in chiaro e normalmente visibile nella configurazione del bootloader,
`/proc/cmdline` e nella diagnostica. Non inserire segreti riutilizzabili in
`root-password=` o `user-password=`. Preferisci i parametri corrispondenti `*-crypted`,
trattando comunque gli hash delle password esposti come dati sensibili.

Gli hook vengono eseguiti come codice privilegiato all'avvio. Un hook `http://` non offre né cifratura del trasporto né autenticazione del server, quindi chiunque sia in grado di alterare il percorso di rete può sostituirlo. Usa solo contenuti e meccanismi di distribuzione di cui ti fidi; non utilizzare un hook HTTP non autenticato per avvii sensibili alla sicurezza.

Separa i comandi con spazi. Consulta le pagine di riferimento `man bootparam` per ulteriori parametri kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri live-config, vedi [live-config](/configuration/live-config.md).

Per il caricamento di MiniOS tramite rete (PXE e HTTP ISO), vedi [Boot di rete](/installation/Network-Boot.md).
