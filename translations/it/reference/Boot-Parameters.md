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

La colonna Applicazione distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell'account previste per la configurazione iniziale. Con la persistenza, i componenti live-config vengono normalmente eseguiti una sola volta; vedi [live-config](/reference/configuration/live-config).

Questa tabella è un riferimento rapido. La precedenza delle sorgenti e le forme accettate `from=` sono definite in [Individuazione del sistema nell'initrd](/reference/boot-process/System-Discovery), il filtraggio dei moduli in [Caricamento dei moduli nell'initrd](/reference/boot-process/Module-Loading), la selezione della persistenza in [Persistenza nell'initrd](/reference/boot-process/Persistence-Internals), e le combinazioni supportate in [Modalità di avvio](/using-minios/Boot-Modes).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | A ogni avvio | Carica dati MiniOS da una directory, da un percorso dispositivo supportato o da un ISO. UUID, PARTUUID e percorsi dispositivo by-id non vengono analizzati. Un URL letterale **`http://` solo** ha la precedenza su `ip=` e avvia [l'avvio di rete](/reference/boot-process/Network-Boot) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | A ogni avvio | Mantiene i candidati `.sb` il cui percorso corrisponde a un'espressione regolare estesa non ancorata; le virgole diventano alternative e un intervallo numerico ascendente completo viene espanso in modo speciale. Filtra anche `toram=trim`. Può escludere moduli core o del kernel e rendere il sistema non avviabile. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | A ogni avvio | Esclude i candidati il cui percorso corrisponde a un'espressione regolare estesa non ancorata, anche da `toram=trim`; viene applicato dopo `load` e può escludere moduli core o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | A ogni avvio | Imposta l'estensione del bundle. Predefinita: `sb`. Il coordinamento con il kernel usa comunque nomi letterali `.sb`; un'estensione personalizzata non può quindi coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | A ogni avvio | Abilita l'output dei tempi di avvio. | `timing` |
| `union` | A ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | A ogni avvio | Indirizzo statico per il recupero anticipato dalla rete. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un `from=http://...` letterale ha la precedenza su `ip=` e usa i relativi campi di indirizzamento; altrimenti, qualsiasi `ip=` non vuoto forza il download dei dati PXE e ignora i supporti locali. Non si tratta della configurazione NetworkManager della sessione. Vedi [Avvio di rete](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | A ogni avvio | Dimensione della cache httpfs in MiB per l'avvio di rete di ISO HTTP (`from=http://…`). Vedi [Avvio di rete](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | A ogni avvio | Apre una shell di debug al termine della fase initramfs. | `rd.break` |
| `perchdir` | A ogni avvio | Seleziona una sessione di persistenza numerata o un'azione. `resume` apre la sessione compatibile predefinita; `setup` consente di scegliere interattivamente il backend di archiviazione, quindi crea una nuova sessione numerata; `new` crea direttamente una nuova sessione usando le impostazioni richieste o predefinite di `perchmode`, crittografia, compressione e dimensione; `ask` mostra le sessioni salvate e avvia automaticamente la configurazione se non ne esistono. Un selettore numerico inesistente può ricorrere al valore predefinito dei metadati; non riserva né crea quel numero. Un percorso dispositivo o un `askdisk` seleziona un'altra posizione di persistenza. Per un percorso personalizzato, usa un suffisso delimitato da due punti. Senza un parametro di persistenza, MiniOS si avvia senza persistenza. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | A ogni avvio | Dimensione del contenitore logico per `dynfilefs`, `dynblk`, `vmdk`, e `raw`; non si applica a `native` né a `squashfs`. Un numero senza unità o un valore `M`/`MB` viene allocato in MiB; i valori `G`/`GB` e `T`/`TB` vengono convertiti rispettivamente in 1000 e 1.000.000 MiB. Senza una dimensione esplicita, le sessioni DynFileFS, DynBlk e VMDK create dall'initrd usano fino a 16 GiB e riducono tale valore predefinito se, dopo `perchreserve` rimane meno spazio di supporto; DynFileFS considera anche l'overhead dell'indice e il limite RAM. DynBlk interroga il limite del backend installato usando `dynblk limits --format dynblk` (o `--format vmdk` per VMDK); non esiste un limite separato di 512 GiB. I dati DynFileFS e DynBlk crescono su richiesta, mentre DynFileFS riserva anche gli indici per la capacità logica dichiarata. Le richieste Raw sono limitate a 1.000.000 MiB e dallo spazio disponibile dopo `perchreserve`; su FAT32, Raw è limitato a 4000 MiB, con o senza crittografia. I nuovi contenitori Raw hanno una dimensione predefinita di 4000 MiB. MiniOS Gestore sessioni usa ancora 4000 MiB come valore predefinito per i contenitori DynFileFS creati manualmente e 16 GiB per DynBlk/VMDK. Vedi [Persistenza nell'initrd](/reference/boot-process/Persistence-Internals) per il comportamento di memoria e archiviazione dei backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | A ogni avvio | Margine di allocazione e soglia di avviso di spazio insufficiente, in MiB. Viene sottratto durante il dimensionamento dei contenitori nuovi o in crescita, ma non è una quota in esecuzione e non impedisce alle scritture successive di riempire il dispositivo. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | A ogni avvio | Modalità di archiviazione della persistenza.<br>`native` (predefinita): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: il formato espandibile FUSE format-400, anche su FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo a blocchi kernel format-1 separato, basato su file `volumeNNN.db` thin; il numero `/dev/dynblkN` effettivo viene assegnato dinamicamente e possono coesistere più volumi.<br>`vmdk`: file `volume.vmdk` / `volume-sNNN.vmdk` sparse suddivisi standard, esposti dal driver DynBlk; senza compressione. Richiede la funzionalità initrd con versione `vmdk-session-v1`.<br>`raw`: un'immagine ext4 di dimensione fissa.<br>`squashfs`: uno snapshot compresso estratto in un livello superiore basato su RAM. La configurazione initrd crea solo i metadati di generazione zero; il sistema in esecuzione crea il primo snapshot su richiesta o all'arresto. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo creazione | Livello di crittografia facoltativo per una nuova sessione `raw`, `dynfilefs`, `dynblk` o `vmdk` . `perchencrypt=luks` richiede la funzionalità initramfs con versione `luks-layer-v1`. Le sessioni esistenti determinano la crittografia solo da `session_encryption[N]`, quindi questo parametro non le reinterpreta né le converte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo creazione | Seleziona la compressione del backend DynBlk per una nuova sessione DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, o `842`. Il codec selezionato deve essere disponibile nel kernel. Quando `perchencrypt=luks` racchiude DynBlk, MiniOS forza la compressione DynBlk a `none`. VMDK non supporta la compressione: all'avvio viene ignorato un codec non-`none` con un avviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | A ogni avvio | Abilita il percorso legacy per il ripristino della persistenza. A differenza di `perchdir=resume`, non crea automaticamente una sessione sostitutiva compatibile quando non esiste una sessione predefinita utilizzabile. | `perch` |
| `toram` | A ogni avvio | Controlla la copia dei dati di sistema MiniOS **del sistema** su RAM. Il valore `toram` predefinito è `full`; `trim` copia la configurazione necessaria e il set di moduli selezionato, omettendo i dati sorgente non pertinenti. La copia della persistenza è controllata separatamente da `perchtoram`. Se si richiede la persistenza e `perchtoram` non è specificato, qualsiasi modalità `toram` attiva imposta la copia della persistenza su `trim`. Rimuovi il supporto solo dopo aver verificato che la sorgente originale, i loop, le mappature e gli eventuali archivi di persistenza necessari siano stati scollegati correttamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | A ogni avvio con persistenza | `off` mantiene l'archivio originale; `trim` copia la sessione Raw, DynFileFS, DynBlk, VMDK o SquashFS selezionata; `full` copia tutti i contenitori e gli snapshot supportati e i metadati corrispondenti. Predefinito: `trim` con `toram` di sistema, altrimenti `off`. Non richiede la persistenza autonomamente. I dati nativi non vengono copiati: una richiesta RAM nativa completata correttamente avvia un nuovo contenitore vuoto, tranne durante il ripristino, che disabilita la copia. Se la copia non riesce, si continua a operare sul supporto. Le modifiche RAM devono essere salvate nell'archivio originale scrivibile o come nuova sessione. Ignorato se è selezionato il backend Persistence Plugin Ventoy. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | A ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | A ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | A ogni avvio | Abilita ulteriori diagnostiche di avvio. | `debug` |
| `nozram` | A ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | A ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS la calcola in base alla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | A ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`; la disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | A ogni avvio | Imposta la destinazione predefinita di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | A ogni avvio | Abilita i servizi systemd specificati all'avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | A ogni avvio | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | A ogni avvio | Disabilita le modifiche automatiche alla risoluzione dello schermo nelle macchine virtuali. Il valore predefinito di XFCE è 1280x800. | `novirtres` |
| `virtres` | A ogni avvio | Imposta la risoluzione dello schermo di XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | A ogni avvio | Esegue solo i componenti live-config elencati, nell'ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | A ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | A ogni avvio | Imposta il nome host del sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l'accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell'utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell'utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in testo normale. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password dell'utente in testo normale. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password dell'utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | A ogni avvio | Imposta una o più impostazioni internazionali di sistema. | `locales=en_US.UTF-8` |
| `timezone` | A ogni avvio | Imposta il fuso orario del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | A ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | A ogni avvio | Imposta i layout di tastiera separati da virgole. | `keyboard-layouts=us,de` |
| `keyboard-variants` | A ogni avvio | Imposta le varianti di tastiera separate da virgole, corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | A ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | A ogni avvio | Impedisce a live-config di configurare l'accesso automatico alla console e all'interfaccia grafica; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | A ogni avvio | Impedisce solo la configurazione dell'accesso automatico alla console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | A ogni avvio | Impedisce solo la configurazione dell'accesso automatico all'interfaccia grafica; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | A ogni avvio | Seleziona un driver Xorg invece del rilevamento automatico. | `xorg-driver=nouveau` |
| `xorg-resolution` | A ogni avvio | Imposta la risoluzione Xorg invece del rilevamento automatico. | `xorg-resolution=1920x1080` |
| `module-mode` | A ogni avvio | Con `merged`, integra le modifiche alla configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `link-user-dirs` | A ogni avvio | Collega le directory utente gestite a supporti scrivibili MiniOS. È incompatibile con `bind-user-dirs` e non è disponibile con alcuna modalità `toram` né quando la sessione di persistenza attiva è crittografata con LUKS. La crittografia attiva viene determinata dalla sessione in esecuzione, non dalla richiesta di creazione `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | A ogni avvio | Monta con bind le directory utente gestite da supporti scrivibili MiniOS. È soggetto alle stesse limitazioni di `toram` e di crittografia della sessione attiva di `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | A ogni avvio | Imposta il percorso relativo al supporto usato da `link-user-dirs` o `bind-user-dirs`. Predefinito: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | A ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Per la creazione nativa su FAT32/NTFS/exFAT o se il controllo POSIX non riesce, l'initrd preferisce DynBlk se disponibile e consentito da Secure Boot, altrimenti DynFileFS. Questo non converte una sessione esistente. Se è selezionato il backend Persistence Plugin Ventoy, una richiesta di persistenza usa quella singola immagine ext4 anziché sessioni numerate; le scelte di sessione `perchdir` vengono ignorate. Vedi [Dettagli interni della persistenza](/reference/boot-process/Persistence-Internals).

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
