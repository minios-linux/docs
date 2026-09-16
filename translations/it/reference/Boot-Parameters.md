---
updated: 2026-09-16
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

La colonna Applicazione distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell'account destinate alla configurazione iniziale. Con la persistenza, i componenti live-config vengono normalmente eseguiti solo una volta; vedi [live-config](/reference/configuration/live-config).

Questa tabella è un riferimento rapido. La precedenza delle fonti e le `from=` forme accettate sono definite in [Rilevamento sistema Initrd](/reference/boot-process/System-Discovery), il filtraggio dei moduli in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading), la selezione della persistenza in [Persistenza Initrd](/reference/boot-process/Persistence-Internals), e le combinazioni supportate in [Modalità di avvio](/using-minios/Boot-Modes).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | Ogni avvio | Carica i dati MiniOS da una directory, un percorso di dispositivo supportato o un file ISO. Le forme UUID, PARTUUID e by-id dei dispositivi non vengono interpretate. Un **`http://` solo** URL ha la precedenza su `ip=` e avvia il [boot di rete](/reference/boot-process/Network-Boot) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Ogni avvio | Mantiene i candidati `.sb` il cui percorso corrisponde a un'espressione regolare estesa non ancorata; le virgole diventano alternanza e un intero intervallo numerico crescente ha un'espansione speciale. Filtra anche `toram=trim`. Può escludere moduli core o del kernel e rendere il sistema non avviabile. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Ogni avvio | Esclude i candidati il cui percorso corrisponde a un'espressione regolare estesa non ancorata, inclusi quelli da `toram=trim`; viene applicato dopo `load` e può escludere moduli core o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Ogni avvio | Imposta l'estensione del bundle. Predefinito: `sb`. Il coordinamento del kernel utilizza comunque i nomi letterali `.sb`, quindi un'estensione personalizzata non può coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | Ogni avvio | Abilita la visualizzazione dei tempi di avvio. | `timing` |
| `union` | Ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Ogni avvio | Indirizzo statico per il recupero di rete anticipato. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un `from=http://...` letterale ha la precedenza su `ip=` e utilizza i suoi campi di indirizzamento; altrimenti qualsiasi valore non vuoto di `ip=` forza il download dei dati PXE e salta i supporti locali. Questa non è una configurazione NetworkManager di sessione. Vedi [Boot di rete](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Ogni avvio | Dimensione della cache httpfs in MiB per il boot di rete HTTP ISO (`from=http://…`). Vedi [Boot di rete](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Ogni avvio | Apre una shell di debug al termine della fase initramfs. | `rd.break` |
| `perchdir` | Ogni avvio | Seleziona una sessione di persistenza numerata o un'azione: `resume`, `new`, oppure `ask`. Un selettore numerico inesistente può ricorrere al valore predefinito dei metadati; non riserva né crea quel numero. Un dispositivo/percorso o una forma `askdisk` seleziona un'altra posizione di persistenza. Usa un suffisso delimitato da due punti per un percorso personalizzato. Senza un parametro di persistenza, MiniOS parte da zero. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Ogni avvio | Dimensione logica del contenitore per `dynfilefs`, `dynblk`, e `raw`; non si applica a `native` o `squashfs`. Un numero semplice o un valore `M`/`MB` viene allocato in MiB; `G`/`GB` e `T`/`TB` vengono convertiti rispettivamente in 1000 e 1.000.000 MiB. Senza una dimensione esplicita, le sessioni DynFileFS e DynBlk create da initrd usano fino a 16 GiB e riducono questo valore predefinito se rimane meno spazio dopo `perchreserve`; DynFileFS tiene inoltre conto dell'overhead dell'indice e del limite RAM. DynBlk ha un limite massimo virtuale di 512 GiB. I dati DynFileFS e DynBlk crescono su richiesta, mentre DynFileFS riserva anche indici per la capacità logica dichiarata. Le richieste Raw sono limitate a 1.000.000 MiB e dallo spazio disponibile dopo `perchreserve`; Raw è limitato a 4000 MiB su FAT32, sia cifrato che non. I nuovi contenitori raw predefiniti sono di 4000 MiB. Il Gestore sessioni MiniOS imposta ancora come predefinito 4000 MiB per DynFileFS creati manualmente e 16 GiB per DynBlk. Vedi [Persistenza Initrd](/reference/boot-process/Persistence-Internals) per il comportamento di memoria e storage del backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Ogni avvio | Margine di allocazione e soglia di avviso di spazio insufficiente in MiB. Viene sottratto durante il dimensionamento di nuovi contenitori o in crescita, ma non è una quota runtime e non impedisce che scritture successive riempiano il dispositivo. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Ogni avvio | Modalità di storage della persistenza.<br>`native` (predefinito): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: il contenitore espandibile basato su FUSE formato-400, anche su FAT32, NTFS o exFAT.<br>`dynblk`: un dispositivo a blocchi kernel formato-1 separato supportato da file `volumeNNN.db` thin; il numero effettivo di `/dev/dynblkN` viene allocato dinamicamente e possono coesistere più volumi.<br>`raw`: un'immagine ext4 a dimensione fissa.<br>`squashfs`: uno snapshot compresso estratto in un layer superiore supportato da RAM. La configurazione Initrd crea solo i metadati della generazione zero; il sistema in esecuzione crea il primo snapshot su richiesta o allo spegnimento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Solo creazione | Livello di cifratura opzionale per una nuova sessione `raw`, `dynfilefs`, o `dynblk`. `perchencrypt=luks` richiede la funzionalità versionata `luks-layer-v1` di initramfs. Le sessioni esistenti derivano la cifratura solo da `session_encryption[N]`, quindi questo parametro non le reinterpreta né le converte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Solo creazione | Seleziona la compressione backend DynBlk per una nuova sessione DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oppure `842`. Il codec kernel selezionato deve essere disponibile. Quando `perchencrypt=luks` avvolge DynBlk, MiniOS forza la compressione DynBlk su `none`. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Ogni avvio | Abilita il percorso di ripresa della persistenza legacy. A differenza di `perchdir=resume`, non crea automaticamente una sostituzione compatibile quando non esiste una sessione predefinita utilizzabile. | `perch` |
| `toram` | Ogni avvio | Un semplice `toram` è `full`. Con la persistenza, la copia di livello superiore di full `*` omette i file nascosti; senza persistenza omette `changes` ma copia le altre voci di livello superiore, inclusi i file nascosti. Trim copia i `config.conf` richiesti, i file regolari `authorized_keys`, i moduli selezionati di livello superiore e ricorsivi, e l'intero albero `changes/` quando è richiesta la persistenza; omette `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, i log, altri dati non modulo e il livello separato dei moduli di persistenza. Nessuna modalità controlla prima la capacità di RAM. Un archivio di persistenza copiato su RAM non è durevole e le modifiche non vengono copiate indietro. Rimuovere il supporto solo dopo aver confermato che la sorgente, i loop e le mappature sono stati scollegati con successo. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | Ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | Ogni avvio | Abilita diagnostica aggiuntiva all'avvio. | `debug` |
| `nozram` | Ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | Ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS lo calcola dalla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, oppure `zstd`; la disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Ogni avvio | Imposta il target predefinito di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Ogni avvio | Abilita i servizi systemd specificati all'avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Ogni avvio | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Ogni avvio | Disabilita le modifiche automatiche della risoluzione dello schermo nelle macchine virtuali. Il valore predefinito XFCE è 1280x800. | `novirtres` |
| `virtres` | Ogni avvio | Imposta la risoluzione dello schermo XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Ogni avvio | Esegue solo i componenti live-config elencati, nell'ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | Ogni avvio | Imposta l'hostname del sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l'accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell'utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell'utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password utente in chiaro. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Ogni avvio | Imposta una o più localizzazioni di sistema. | `locales=en_US.UTF-8` |
| `timezone` | Ogni avvio | Imposta il fuso orario del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | Ogni avvio | Imposta i layout di tastiera separati da virgola. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Ogni avvio | Imposta le varianti di tastiera, separate da virgola, corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | Ogni avvio | Impedisce a live-config di configurare l'accesso automatico a console e grafica; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | Ogni avvio | Impedisce solo la configurazione dell'accesso automatico in console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | Ogni avvio | Impedisce solo la configurazione dell'accesso automatico grafico; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | Ogni avvio | Seleziona un driver Xorg invece del rilevamento automatico. | `xorg-driver=nouveau` |
| `xorg-resolution` | Ogni avvio | Imposta la risoluzione Xorg invece del rilevamento automatico. | `xorg-resolution=1920x1080` |
| `module-mode` | Ogni avvio | Con `merged`, integra le modifiche di configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `hooks` | Ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerazioni sulla sicurezza

La riga di comando del kernel è in chiaro ed è normalmente visibile nella configurazione del bootloader, `/proc/cmdline`, e nelle diagnostiche. Non inserire segreti riutilizzabili in `root-password=` o `user-password=`. Preferisci i relativi parametri `*-crypted`, trattando comunque gli hash delle password esposti come dati sensibili.

Gli hook vengono eseguiti come codice privilegiato all'avvio. Un `http://` hook non offre né crittografia del trasporto né autenticazione del server, quindi chiunque sia in grado di modificare il percorso di rete può sostituirlo. Utilizza solo contenuti e meccanismi di distribuzione affidabili; non usare un hook HTTP non autenticato per avvii sensibili alla sicurezza.

Separa i comandi con spazi. Consulta le `man bootparam` pagine di riferimento per ulteriori parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri di live-config, vedi [live-config](/reference/configuration/live-config).

Per il caricamento di MiniOS tramite rete (PXE e ISO HTTP), consulta [Avvio da rete](/reference/boot-process/Network-Boot).
