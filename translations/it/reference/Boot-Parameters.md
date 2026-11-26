---
updated: 2026-10-15
---

# Parametri di avvio

## Come usare i parametri di avvio

I parametri di avvio personalizzano l'avvio di MiniOS. Separali con spazi nella riga di comando del kernel.

### Syslinux

- Premi <kbd>Esc</kbd> durante la sequenza di avvio di MiniOS per accedere al menu di avvio.
- Premi <kbd>Tab</kbd> per modificare le opzioni di avvio.
- Inserisci i parametri e premi <kbd>Invio</kbd> per avviare.

### GRUB

- Premi <kbd>E</kbd> nel menu di GRUB.
- Modifica i parametri di avvio alla fine della riga di comando.
- Premi <kbd>F10</kbd> per avviare con le nuove impostazioni.

## Parametri di avvio

La colonna Applicazione distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell’account destinate alla configurazione iniziale. Con la persistenza, i componenti live-config vengono normalmente eseguiti una sola volta; consulta [live-config](/reference/configuration/live-config).

Questa tabella è un riferimento rapido. La precedenza delle origini e le forme accettate delle `from=` sono definite in [Individuazione del sistema nell’initrd](/reference/boot-process/System-Discovery), il filtraggio dei moduli in [Caricamento dei moduli nell’initrd](/reference/boot-process/Module-Loading), la selezione della persistenza in [Persistenza nell’initrd](/reference/boot-process/Persistence-Internals), e le combinazioni supportate in [Modalità di avvio](/using-minios/Boot-Modes).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | A ogni avvio | Carica i dati MiniOS da una directory, da un percorso di dispositivo supportato o da un file ISO. I formati UUID, PARTUUID e by-id dei dispositivi non vengono analizzati. Un **`http://` solo** URL ha la precedenza su `ip=` e avvia l’[avvio di rete](/reference/boot-process/Network-Boot) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | A ogni avvio | Mantiene i `.sb` candidati il cui percorso corrisponde a un’espressione regolare estesa non ancorata; le virgole diventano alternative e un intervallo numerico crescente completo viene espanso in modo speciale. Filtra anche `toram=trim`. Può escludere moduli fondamentali o del kernel e impedire l’avvio del sistema. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | A ogni avvio | Esclude i candidati il cui percorso corrisponde a un’espressione regolare estesa non ancorata, anche da `toram=trim`; viene applicato dopo `load` e può escludere moduli fondamentali o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | A ogni avvio | Imposta l’estensione del bundle. Predefinita: `sb`. Il coordinamento con il kernel usa comunque nomi letterali `.sb`; un’estensione personalizzata non può quindi coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | A ogni avvio | Abilita l’output dei tempi di avvio. | `timing` |
| `union` | A ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | A ogni avvio | Indirizzo statico per il download di rete iniziale. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un valore letterale `from=http://...` ha la precedenza su `ip=` e usa i relativi campi di indirizzamento; in caso contrario, qualsiasi `ip=` non vuoto forza il download dei dati PXE e ignora il supporto locale. Questa non è una configurazione di NetworkManager per la sessione. Vedi [Avvio dalla rete](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | A ogni avvio | Dimensione della cache httpfs in MiB per l'avvio di rete tramite ISO HTTP (`from=http://…`). Vedi [Avvio dalla rete](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | A ogni avvio | Apre una shell di debug al termine della fase initramfs. | `rd.break` |
| `perchdir` | A ogni avvio | Seleziona una sessione di persistenza numerata o un'azione. `resume` apre la sessione compatibile predefinita; `setup` consente di scegliere interattivamente il backend di archiviazione e crea una nuova sessione numerata; `new` crea direttamente una nuova sessione usando le impostazioni richieste o predefinite di `perchmode`, crittografia, compressione e dimensione; `ask` mostra le sessioni salvate e avvia automaticamente la configurazione se non ne esistono. Selettori numerici inesistenti possono ricorrere al valore predefinito nei metadati; non riservano né creano quel numero. Un dispositivo/percorso o una forma `askdisk` seleziona un'altra posizione di persistenza. Per un percorso personalizzato, usa un suffisso separato da due punti. Senza un parametro di persistenza, MiniOS si avvia senza conservare i dati. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | A ogni avvio | Dimensione del contenitore logico per `dynfilefs`, `dynblk`, `vmdk` e `raw`; non si applica a `native` né a `squashfs`. Un numero senza unità o un valore `M`/`MB` viene allocato in MiB; `G`/`GB` e `T`/`TB` vengono convertiti rispettivamente in 1000 e 1.000.000 MiB. Se non viene specificata una dimensione, le sessioni DynFileFS, DynBlk e VMDK create da initrd usano fino a 16 GiB e riducono il valore predefinito se lo spazio residuo nel supporto dopo `perchreserve` è inferiore. Restano validi i controlli sulla capacità del backend. DynBlk interroga il limite del backend installato usando `dynblk limits --format dynblk` (o `--format vmdk` per VMDK); non esiste un limite separato di 512 GiB. DynFileFS e DynBlk allocano lo spazio per i dati su richiesta. Le richieste Raw sono limitate a 1.000.000 MiB e allo spazio disponibile dopo `perchreserve`; su FAT32, Raw è limitato a 4000 MiB, sia con crittografia sia senza. I nuovi contenitori Raw hanno una dimensione predefinita di 4000 MiB. Il Gestore sessioni MiniOS imposta una dimensione predefinita di 4000 MiB per i contenitori DynFileFS creati manualmente e di 16 GiB per DynBlk/VMDK. Vedi [Persistenza Initrd](/reference/boot-process/Persistence-Internals) per informazioni sul comportamento della memoria e dello spazio di archiviazione dei backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | A ogni avvio | Margine di allocazione e soglia di avviso per spazio insufficiente, in MiB. Viene sottratto durante il dimensionamento dei nuovi container o l'espansione di quelli esistenti, ma non è una quota runtime e non impedisce alle scritture successive di esaurire lo spazio sul dispositivo. Valore predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | A ogni avvio | Modalità di archiviazione persistente.<br>`native` (predefinita): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: un container FUSE espandibile con formato 600, anche su FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo a blocchi kernel separato in formato 1, basato su file thin `volumeNNN.db`; il numero effettivo di `/dev/dynblkN` viene allocato dinamicamente e possono coesistere più volumi.<br>`vmdk`: file sparse standard suddivisi `volume.vmdk` / `volume-sNNN.vmdk` esposti dal driver DynBlk; senza compressione. Richiede la funzionalità initrd con versione specifica `vmdk-session-v1` .<br>`raw`: un'immagine ext4 di dimensioni fisse.<br>`squashfs`: uno snapshot compresso estratto in un livello superiore basato su RAM. La configurazione initrd crea solo metadati di generazione zero; il sistema in esecuzione crea il primo snapshot su richiesta o allo spegnimento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo alla creazione | Livello di cifratura facoltativo per una nuova sessione `raw`, `dynfilefs`, `dynblk`, oppure `vmdk` . `perchencrypt=luks`richiede la funzionalità initramfs con versione specifica `luks-layer-v1` . Le sessioni esistenti ricavano la cifratura solo da `session_encryption[N]`, quindi questo parametro non le reinterpreta né le converte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo alla creazione | Seleziona la compressione del backend DynBlk per una nuova sessione DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oppure `842`. Il codec kernel selezionato deve essere disponibile. Quando `perchencrypt=luks` racchiude DynBlk, MiniOS imposta la compressione DynBlk su `none`. VMDK non supporta la compressione: all'avvio viene ignorato un codec non-`none` e viene mostrato un avviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | A ogni avvio | Abilita il percorso legacy di ripristino della persistenza. A differenza di `perchdir=resume`, non crea automaticamente una sostituzione compatibile quando non è disponibile una sessione predefinita utilizzabile. | `perch` |
| `toram` | A ogni avvio | Controlla la copia di MiniOS **sistema** in RAM. La modalità bare `toram` è `full`; `trim` copia la configurazione richiesta e il set di moduli selezionato, escludendo i dati sorgente non correlati. La copia dei dati persistenti è controllata separatamente da `perchtoram`. Quando viene richiesta la persistenza e `perchtoram` non è specificato, qualsiasi modalità `toram` attiva imposta la copia dei dati persistenti su `trim`. Rimuovi il supporto solo dopo aver verificato che la sorgente originale, i cicli, le mappature e l'eventuale archivio di persistenza richiesto siano stati scollegati correttamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | A ogni avvio con persistenza | `off` mantiene l'archivio originale; `trim` copia la sessione selezionata Raw, DynFileFS, DynBlk, VMDK o SquashFS; `full` copia tutti i container/snapshot supportati e i metadati corrispondenti. Valore predefinito: `trim` con il sistema `toram`, altrimenti `off`. Questa opzione non richiede la persistenza da sola. I dati nativi non vengono copiati: una richiesta nativa RAM riuscita avvia un nuovo container vuoto, tranne durante il ripristino, che disabilita la copia. Se la copia non riesce, l'operazione continua sul supporto. Per mantenere le modifiche a RAM, è necessario salvarle nell'archivio originale scrivibile o come nuova sessione. Ignorata se è selezionato il backend Persistence Plugin Ventoy. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | A ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | A ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | A ogni avvio | Abilita ulteriori diagnostiche all'avvio. | `debug` |
| `nozram` | A ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | A ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS la calcola in base alla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | A ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, oppure `zstd`; la disponibilità dipende dal kernel in uso. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | A ogni avvio | Imposta il target predefinito di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | A ogni avvio | Abilita all'avvio i servizi systemd specificati. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | A ogni avvio | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | A ogni avvio | Disabilita le modifiche automatiche alla risoluzione dello schermo nelle macchine virtuali. Il valore predefinito di XFCE è 1280x800. | `novirtres` |
| `virtres` | A ogni avvio | Imposta la risoluzione dello schermo di XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | A ogni avvio | Esegue solo i componenti live-config elencati, nell'ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | A ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | A ogni avvio | Imposta il nome host del sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l'accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell'utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell'utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in testo semplice. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password dell'utente in testo semplice. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password dell'utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | A ogni avvio | Imposta una o più impostazioni locali di sistema. | `locales=en_US.UTF-8` |
| `timezone` | A ogni avvio | Imposta il fuso orario del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | A ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | A ogni avvio | Imposta i layout di tastiera separati da virgole. | `keyboard-layouts=us,de` |
| `keyboard-variants` | A ogni avvio | Imposta le varianti di tastiera separate da virgole corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | A ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere i privilegi sudo e PolicyKit. | `noroot` |
| `noautologin` | A ogni avvio | Impedisce a live-config di configurare l’accesso automatico alla console e all’interfaccia grafica; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | A ogni avvio | Impedisce di configurare solo l’accesso automatico alla console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | A ogni avvio | Impedisce di configurare solo l’accesso automatico all’interfaccia grafica; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | A ogni avvio | Seleziona un driver Xorg invece di rilevarlo automaticamente. | `xorg-driver=nouveau` |
| `xorg-resolution` | A ogni avvio | Imposta la risoluzione di Xorg invece di rilevarla automaticamente. | `xorg-resolution=1920x1080` |
| `module-mode` | A ogni avvio | Con `merged`, integra le modifiche alla configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `link-user-dirs` | A ogni avvio | Collega le directory utente gestite a un supporto scrivibile MiniOS. È incompatibile con `bind-user-dirs` e non è disponibile con alcuna modalità `toram` né quando la sessione di persistenza attiva è cifrata con LUKS. La cifratura attiva viene determinata in base alla sessione in esecuzione, non alla richiesta di creazione `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | A ogni avvio | Collega con bind mount le directory utente gestite da un supporto scrivibile MiniOS. Ha le stesse restrizioni di `toram` e di cifratura della sessione attiva di `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | A ogni avvio | Imposta il percorso relativo al supporto usato da `link-user-dirs` o `bind-user-dirs`. Valore predefinito: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | A ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Per la creazione nativa su FAT32/NTFS/exFAT o se il controllo POSIX non riesce, initrd preferisce DynBlk quando disponibile e consentito da Secure Boot; in caso contrario usa DynFileFS. Questa alternativa non cambia la modalità di archiviazione di una sessione esistente. Se è selezionato un backend Persistence Plugin Ventoy, una richiesta di persistenza usa quell’unica immagine ext4 anziché sessioni numerate; `perchdir` le scelte di sessione vengono ignorate. Vedi [Dettagli interni della persistenza](/reference/boot-process/Persistence-Internals).

Durante un montaggio normale, l’helper corrente DynFileFS converte automaticamente sul posto il formato 400 o 500 nel formato 600 se la dimensione legacy della suddivisione è un numero pari di MiB. Una suddivisione di un numero dispari di MiB viene rifiutata senza apportare modifiche. Nessun parametro di avvio consente di selezionare i vecchi formati o di abilitare la conversione.

## Considerazioni sulla sicurezza

La riga di comando del kernel è in testo normale e normalmente visibile nella configurazione del bootloader, `/proc/cmdline`, e nella diagnostica. Non inserire segreti riutilizzabili in `root-password=` o `user-password=`. Preferisci i corrispondenti parametri `*-crypted`, trattando comunque come sensibili gli hash delle password esposti.

Gli hook vengono eseguiti come codice di avvio con privilegi elevati. Un hook `http://` non dispone né di crittografia del trasporto né di autenticazione del server, quindi chiunque possa modificare il percorso di rete può sostituirlo. Usa solo contenuti e modalità di distribuzione affidabili; non usare un hook HTTP non autenticato per avvii che richiedono sicurezza.

Separa i comandi con spazi. Consulta le pagine di riferimento `man bootparam` per altri parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri live-config, vedi [live-config](/reference/configuration/live-config).

Per caricare MiniOS in rete (PXE e ISO HTTP), vedi [Avvio di rete](/reference/boot-process/Network-Boot).

## Parametri di cache e log delle sessioni persistenti

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `log-storage` o `live-config.log-storage` | A ogni avvio con persistenza convalidata | `persistent` (predefinito) o `volatile`. In modalità volatile, journald usa fino a 32 MiB e il normale `/var/log` usa un tmpfs da 32 MiB. La diagnostica di avvio viene conservata separatamente; con la persistenza durevole rimane nell'archivio. Se il filesystem di log RAM è pieno, i dati non vengono riversati sul dispositivo USB. | `log-storage=volatile` |
| `apt-cache` o `live-config.apt-cache` | A ogni avvio con persistenza convalidata | `persistent` (predefinito) o `volatile` per `/var/cache/apt/archives`. Il tmpfs è di 256 MiB con almeno 1 GiB disponibile, oppure di 512 MiB con almeno 2 GiB disponibili. Lo swap diverso da zRAM lo disabilita; i download di grandi dimensioni possono esaurirlo. Gli elenchi dei repository e lo stato di dpkg rimangono nel livello della sessione. | `apt-cache=volatile` |
| `browser-cache` o `live-config.browser-cache` | A ogni avvio con persistenza convalidata | `persistent` (predefinito) o `volatile`. Con almeno 1 GiB disponibile e senza swap diverso da zRAM, le directory standard della cache del browser dell'utente live usano un tmpfs condiviso da 512 MiB. Una policy Firefox gestita disabilita la cache su disco se non esistono altri file di policy. I profili e le cache non correlate rimangono nel livello della sessione. | `browser-cache=volatile` |

I tre parametri dei criteri di archiviazione vengono analizzati da `minios-boot` prima del normale sistema init, **non** dal selettore anticipato della persistenza. Non abilitano `perch`. Richiedono l'attivazione riuscita su un archivio durevole o su una sessione scrivibile RAM con informazioni `ram-origin` protette; non rendono durevoli le modifiche RAM senza salvarle. Un initrd compatibile annuncia `perch-storage-v1` in `/run/initramfs/etc/minios-initramfs-storage`. Configurator e `config.conf` offrono le stesse opzioni; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per limiti, precedenza e avvertenze sull'installazione del browser.
