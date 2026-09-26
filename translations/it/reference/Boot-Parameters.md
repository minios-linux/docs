---
updated: 2026-09-26
---

# Parametri di avvio

## Come utilizzare i parametri di avvio

I parametri di avvio personalizzano il modo in cui MiniOS viene avviato. Separa i parametri con spazi sulla riga di comando del kernel.

### Syslinux

- Premi <kbd>Esc</kbd> durante la sequenza di avvio MiniOS per accedere al menu di avvio.
- Premi <kbd>Tab</kbd> per modificare le opzioni di avvio.
- Inserisci i parametri e premi <kbd>Invio</kbd> per avviare.

### GRUB

- Premi <kbd>E</kbd> nel menu GRUB.
- Modifica i parametri di avvio alla fine della riga di comando.
- Premi <kbd>F10</kbd> per avviare con le nuove impostazioni.

## Parametri di avvio

La colonna Applicazione distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell’account previste solo per la configurazione iniziale. Con la persistenza, i componenti live-config normalmente vengono eseguiti una sola volta; vedi [live-config](/reference/configuration/live-config).

Questa tabella è un riferimento rapido. La precedenza delle fonti e le `from=` forme accettate sono definite in [Rilevamento sistema Initrd](/reference/boot-process/System-Discovery), il filtraggio dei moduli in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading), la selezione della persistenza in [Persistenza Initrd](/reference/boot-process/Persistence-Internals), e le combinazioni supportate in [Modalità di avvio](/using-minios/Boot-Modes).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | Ogni avvio | Carica i dati MiniOS da una directory, un percorso dispositivo supportato o un file ISO. I formati UUID, PARTUUID e by-id dei dispositivi non vengono interpretati. Un valore letterale **`http://` solo** URL ha la precedenza su `ip=` e avvia il [network boot](/reference/boot-process/Network-Boot) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Ogni avvio | Mantiene i candidati `.sb` il cui percorso corrisponde a un’espressione regolare estesa non ancorata; le virgole diventano alternanza e un intero intervallo numerico crescente viene espanso in modo speciale. Filtra anche `toram=trim`. Può escludere moduli core o del kernel e rendere il sistema non avviabile. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Ogni avvio | Esclude i candidati il cui percorso corrisponde a un’espressione regolare estesa non ancorata, anche da `toram=trim`; viene applicato dopo `load` e può escludere moduli core o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Ogni avvio | Imposta l’estensione del bundle. Predefinito: `sb`. Il coordinamento con il kernel utilizza comunque i nomi letterali `.sb`, quindi un’estensione personalizzata non può coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | Ogni avvio | Abilita la visualizzazione dei tempi di avvio. | `timing` |
| `union` | Ad ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Ad ogni avvio | Indirizzo statico per il recupero di rete iniziale. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un valore letterale `from=http://...` ha priorità su `ip=` e utilizza i suoi campi di indirizzamento; altrimenti qualsiasi valore non vuoto di `ip=` forza il download dei dati PXE e salta i supporti locali. Questa non è una configurazione NetworkManager di sessione. Vedi [Avvio da rete](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Ad ogni avvio | Dimensione cache httpfs in MiB per avvio ISO HTTP da rete (`from=http://…`). Vedi [Avvio da rete](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Ad ogni avvio | Apre una shell di debug alla fine della fase initramfs. | `rd.break` |
| `perchdir` | Ad ogni avvio | Seleziona una sessione di persistenza numerata o un'azione: `resume`, `new`, oppure `ask`. Un selettore numerico inesistente può ricadere sul valore predefinito dei metadati; non riserva né crea quel numero. Un dispositivo/percorso o la forma `askdisk` seleziona un'altra posizione di persistenza. Usa un suffisso delimitato da due punti per un percorso personalizzato. Senza un parametro di persistenza, MiniOS si avvia da zero. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Ad ogni avvio | Dimensione logica del contenitore per `dynfilefs`, `dynblk`, `vmdk`, e `raw`; non si applica a `native` o `squashfs`. Un numero semplice o il valore `M`/`MB` viene allocato in MiB; `G`/`GB` e `T`/`TB` vengono convertiti rispettivamente in 1000 e 1.000.000 MiB. Senza una dimensione esplicita, i DynFileFS creati da initrd, DynBlk e le sessioni VMDK usano fino a 16 GiB e riducono questo valore predefinito se rimane meno spazio disponibile dopo `perchreserve`; DynFileFS tiene inoltre conto della sua sovrapposizione di indice e del limite RAM. DynBlk interroga il limite del backend installato usando `dynblk limits --format dynblk` (o `--format vmdk` per VMDK); non esiste un limite separato di 512 GiB. Il payload DynFileFS e i dati di supporto DynBlk crescono su richiesta, mentre DynFileFS riserva anche gli indici per la capacità logica dichiarata. Le richieste raw sono limitate a 1.000.000 MiB e dallo spazio disponibile dopo `perchreserve`; Raw è limitato a 4000 MiB su FAT32 sia cifrato che non. I nuovi contenitori raw predefiniti sono di 4000 MiB. Il Gestore sessioni MiniOS imposta ancora manualmente i contenitori DynFileFS creati manualmente a 4000 MiB e DynBlk/VMDK a 16 GiB. Vedi [Persistenza initrd](/reference/boot-process/Persistence-Internals) per il comportamento di memoria e storage del backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Ad ogni avvio | Margine di allocazione e soglia di avviso per spazio insufficiente in MiB. Questo valore viene sottratto durante il dimensionamento di nuovi container o durante la crescita di quelli esistenti, ma non rappresenta una quota attiva e non impedisce che successive scritture riempiano il dispositivo. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Ad ogni avvio | Modalità di archiviazione della persistenza.<br>`native` (predefinito): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: il container espandibile formato-400 basato su FUSE, anche su FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo a blocchi kernel separato formato-1 supportato da thin `volumeNNN.db` file; il numero effettivo di `/dev/dynblkN` viene allocato dinamicamente e possono coesistere più volumi.<br>`vmdk`: file sparse standard suddivisi `volume.vmdk` / `volume-sNNN.vmdk` file esposti dal driver DynBlk; nessuna compressione. Richiede la funzionalità versionata `vmdk-session-v1` initrd.<br>`raw`: un'immagine ext4 a dimensione fissa.<br>`squashfs`: uno snapshot compresso estratto in un layer superiore supportato da RAM. L'impostazione initrd crea solo i metadati della generazione zero; il sistema in esecuzione crea il primo snapshot su richiesta o allo spegnimento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo in fase di creazione | Livello di cifratura opzionale per un nuovo `raw`, `dynfilefs`, `dynblk`, o `vmdk` sessione. `perchencrypt=luks` richiede la funzionalità versionata `luks-layer-v1` initramfs. Le sessioni esistenti derivano la cifratura solo da `session_encryption[N]`, quindi questo parametro non le reinterpreta né le converte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo in fase di creazione | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`. Il codec kernel selezionato deve essere disponibile. Quando `perchencrypt=luks` avvolge DynBlk, MiniOS forza la compressione DynBlk su `none`. VMDK non supporta la compressione: l'avvio ignora un codec non-`none` con un avviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Ad ogni avvio | Abilita il percorso legacy per il ripristino della persistenza. Diversamente da `perchdir=resume`, non crea automaticamente una sessione compatibile di sostituzione quando non esiste una sessione predefinita utilizzabile. | `perch` |
| `toram` | Ad ogni avvio | Bare `toram` è `full`. Con la persistenza, la copia di full a livello superiore `*` omette i dotfile; senza persistenza omette `changes` ma copia le altre voci a livello superiore, inclusi i dotfile. Trim copia solo i file richiesti `config.conf`, file regolari `authorized_keys`, alcuni moduli selezionati a livello superiore e ricorsivi, e l'intero albero `changes/` quando la persistenza è richiesta; omette `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, altri dati non modulo e il livello separato del modulo di persistenza. Nessuna modalità controlla prima la capacità di RAM. Un archivio di persistenza copiato su RAM non è durevole e le modifiche non vengono copiate indietro. Rimuovere i supporti solo dopo aver confermato che la sorgente, i loop e le mappature sono stati scollegati correttamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Ad ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | Ad ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | Ad ogni avvio | Abilita diagnostica aggiuntiva all'avvio. | `debug` |
| `nozram` | Ad ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | Ad ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS la calcola in base alla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Ad ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, oppure `zstd`; la disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Ad ogni avvio | Imposta il target predefinito di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Ad ogni avvio | Abilita i servizi systemd specificati all'avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Ad ogni avvio | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Ad ogni avvio | Disabilita il cambio automatico della risoluzione dello schermo nelle macchine virtuali. Il valore predefinito di XFCE è 1280x800. | `novirtres` |
| `virtres` | Ad ogni avvio | Imposta la risoluzione dello schermo XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Ad ogni avvio | Esegue solo i componenti live-config elencati, nell'ordine indicato. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Ad ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | Ad ogni avvio | Imposta il nome host del sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l'accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell'utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell'utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crittografico. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password dell'utente in chiaro. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password dell'utente come hash crittografico. | `user-password-crypted=$y$j9T$...` |
| `locales` | Ad ogni avvio | Imposta una o più localizzazioni di sistema. | `locales=en_US.UTF-8` |
| `timezone` | Ad ogni avvio | Imposta il fuso orario del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Ad ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | Ad ogni avvio | Imposta i layout di tastiera separati da virgola. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Ad ogni avvio | Imposta le varianti di tastiera, separate da virgola, corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Ad ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | Ad ogni avvio | Impedisce a live-config di configurare l'accesso automatico alla console e all'ambiente grafico; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | Ad ogni avvio | Impedisce solo la configurazione dell'accesso automatico alla console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | Ad ogni avvio | Impedisce solo la configurazione dell'accesso automatico all'ambiente grafico; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | Ad ogni avvio | Seleziona un driver Xorg invece dell'autorilevamento. | `xorg-driver=nouveau` |
| `xorg-resolution` | Ad ogni avvio | Imposta la risoluzione di Xorg invece dell'autorilevamento. | `xorg-resolution=1920x1080` |
| `module-mode` | Ad ogni avvio | Con `merged`, integra le modifiche di configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `link-user-dirs` | Ad ogni avvio | Collega le directory utente gestite a supporti scrivibili MiniOS. È mutuamente esclusivo con `bind-user-dirs` e non disponibile con qualsiasi `toram` modalità o quando la sessione di persistenza attiva è cifrata con LUKS. La cifratura attiva viene determinata dalla sessione in corso, non dalla richiesta di `perchencrypt` creazione. | `link-user-dirs` |
| `bind-user-dirs` | Ad ogni avvio | Effettua il bind-mount delle directory utente gestite da supporti scrivibili MiniOS. Ha le stesse `toram` e restrizioni di cifratura della sessione attiva di `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Ad ogni avvio | Imposta la posizione relativa al supporto utilizzata da `link-user-dirs` o `bind-user-dirs`. Predefinito: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Ad ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerazioni sulla sicurezza

La riga di comando del kernel è in chiaro ed è normalmente visibile nella configurazione del bootloader, `/proc/cmdline`, e nelle diagnostiche. Non inserire segreti riutilizzabili in `root-password=` o `user-password=`. Preferisci i relativi parametri `*-crypted`, trattando comunque gli hash delle password esposti come dati sensibili.

Gli hook vengono eseguiti come codice privilegiato all'avvio. Un `http://` hook non offre né crittografia del trasporto né autenticazione del server, quindi chiunque sia in grado di modificare il percorso di rete può sostituirlo. Utilizza solo contenuti e meccanismi di distribuzione affidabili; non usare un hook HTTP non autenticato per avvii sensibili alla sicurezza.

Separa i comandi con spazi. Consulta le `man bootparam` pagine di riferimento per ulteriori parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri di live-config, vedi [live-config](/reference/configuration/live-config).

Per il caricamento di MiniOS tramite rete (PXE e ISO HTTP), consulta [Avvio da rete](/reference/boot-process/Network-Boot).
