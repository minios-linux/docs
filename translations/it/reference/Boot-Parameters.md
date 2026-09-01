---
updated: 2026-08-26
---

# Parametri di avvio

## Come utilizzare i parametri di avvio

I parametri di avvio personalizzano il modo in cui MiniOS viene avviato. Separa i parametri con spazi sulla riga di comando del kernel.

### Syslinux

- Premi <kbd>Esc</kbd> durante la sequenza di avvio di MiniOS per accedere al menu di boot.
- Premi <kbd>Tab</kbd> per modificare le opzioni di avvio.
- Inserisci i parametri e premi <kbd>Invio</kbd> per avviare.

### GRUB

- Premi <kbd>E</kbd> nel menu di GRUB.
- Modifica i parametri di avvio alla fine della riga di comando.
- Premi <kbd>F10</kbd> per avviare con le nuove impostazioni.

## Parametri di avvio

La colonna "Applicazione" distingue i parametri normalmente accettati a ogni avvio dalle impostazioni dell’account destinate alla configurazione iniziale. Con la persistenza, i componenti live-config vengono normalmente eseguiti solo una volta; vedi [live-config](/reference/configuration/live-config).

Questa tabella è un riferimento rapido. La precedenza delle fonti e le forme `from=` accettate sono definite in [Rilevamento del sistema Initrd](/reference/boot-process/System-Discovery), il filtraggio dei moduli in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading), la selezione della persistenza in [Interni della persistenza Initrd](/reference/boot-process/Persistence-Internals), e le combinazioni supportate in [Modalità di avvio](/using-minios/Boot-Modes).

| Parametro | Applicazione | Descrizione | Esempio |
|---|---|---|---|
| `from` | Ogni avvio | Carica i dati MiniOS da una directory, un percorso dispositivo supportato o un ISO. Le forme UUID, PARTUUID e by-id non vengono interpretate. Un URL **`http://` only** letterale ha precedenza su `ip=` e avvia il [network boot](/reference/boot-process/Network-Boot) tramite httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Ogni avvio | Mantiene i candidati `.sb` il cui percorso corrisponde a un'espressione regolare estesa non ancorata; le virgole diventano alternanze e un intero intervallo numerico crescente ha un'espansione speciale. Filtra anche `toram=trim`. Può escludere moduli core o del kernel e rendere il sistema non avviabile. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Ogni avvio | Esclude i candidati il cui percorso corrisponde a un'espressione regolare estesa non ancorata, inclusi quelli da `toram=trim`; viene applicato dopo `load` e può escludere moduli core o del kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Ogni avvio | Imposta l'estensione del bundle. Predefinito: `sb`. Il coordinamento con il kernel utilizza comunque nomi letterali `.sb`, quindi un'estensione personalizzata non può coordinare il modulo `01-kernel`. | `bext=mymod` |
| `timing` | Ogni avvio | Abilita l'output del timing di avvio. | `timing` |
| `union` | Ogni avvio | Seleziona il filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Ogni avvio | Indirizzo statico per il recupero di rete anticipato. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE predefinita **7529**). Un `from=http://...` letterale ha precedenza su `ip=` e usa i suoi campi di indirizzamento; altrimenti qualsiasi `ip=` non vuoto forza il download dei dati PXE e salta i supporti locali. Questa non è una configurazione NetworkManager di sessione. Vedi [Network boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Ogni avvio | Dimensione cache httpfs in MiB per il network boot ISO HTTP (`from=http://…`). Vedi [Network boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Ogni avvio | Apre una shell di debug alla fine della fase initramfs. | `rd.break` |
| `perchdir` | Ogni avvio | Seleziona una sessione di persistenza numerata o un'azione: `resume`, `new` o `ask`. Un selettore numerico inesistente può ricadere sul valore predefinito dei metadati; non riserva né crea quel numero. Un percorso dispositivo o la forma `askdisk` seleziona un'altra posizione di persistenza. Usa un suffisso delimitato da due punti per un percorso personalizzato. Senza parametro di persistenza, MiniOS parte da zero. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Ogni avvio | Dimensione del contenitore per `dynfilefs`, `raw` e `luks`; non si applica a `native` o `squashfs`. Un numero semplice o un valore `M`/`MB` viene allocato in MiB; `G`/`GB` e `T`/`TB` sono convertiti rispettivamente in 1000 e 1.000.000 MiB. Il limite è di 1.000.000 MiB, ulteriormente limitato dallo spazio disponibile dopo `perchreserve`. Il Gestore sessioni MiniOS limita i file raw e LUKS a 4000 MiB su FAT32; il LUKS initrd applica tale limite, ma una richiesta raw initrd sovradimensionata può fallire invece di essere ridotta. I nuovi contenitori raw e LUKS predefiniti sono di 4000 MiB. I DynFileFS creati da initramfs hanno come default la capacità disponibile arrotondata a 1000 MiB; il Gestore sessioni MiniOS la imposta di default a 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Ogni avvio | Margine di allocazione e soglia di avviso per spazio insufficiente in MiB. Viene sottratto durante il dimensionamento di nuovi contenitori o durante la crescita, ma non è una quota a runtime e non impedisce scritture successive che riempiano il dispositivo. Predefinito: 256; massimo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Ogni avvio | Modalità di archiviazione della persistenza.<br>`native` (predefinito): una directory su un filesystem POSIX scrivibile.<br>`dynfilefs`: un contenitore espandibile, anche su FAT32, NTFS o exFAT.<br>`raw`: un'immagine ext4 a dimensione fissa.<br>`luks`: un contenitore ext4 cifrato LUKS2; la creazione e lo sblocco avvengono da console e richiedono il supporto per la crittografia nell'initramfs.<br>`squashfs`: uno snapshot compresso esistente estratto per la sessione. Il Gestore sessioni MiniOS può creare e salvare snapshot SquashFS dal sistema in esecuzione; l'initramfs può solo ripristinarli, non crearli. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Ogni avvio | Abilita il percorso legacy di ripristino della persistenza. A differenza di `perchdir=resume`, non crea automaticamente una sessione compatibile se non esiste una sessione predefinita utilizzabile. | `perch` |
| `toram` | Ogni avvio | Un `toram` semplice equivale a `full`. Con la persistenza, la copia `*` di livello superiore della modalità full omette i file nascosti; senza persistenza omette `changes` ma copia le altre voci di primo livello, inclusi i file nascosti. La modalità trim copia i `config.conf` richiesti, i file regolari `authorized_keys`, i moduli selezionati di primo livello e ricorsivi, e l'intero albero `changes/` quando è richiesta la persistenza; omette `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, altri dati non modulo e il livello separato dei moduli di persistenza. Nessuna delle modalità verifica prima la capacità di RAM. Un archivio di persistenza copiato su RAM non è durevole e le modifiche non vengono riportate indietro. Rimuovere il supporto solo dopo aver confermato che la sorgente, i loop e i mapping sono stati scollegati correttamente. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Ogni avvio | Avvia in modalità console testuale. | `text` |
| `automount` | Ogni avvio | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | Ogni avvio | Abilita diagnostica aggiuntiva all’avvio. | `debug` |
| `nozram` | Ogni avvio | Disabilita lo swap zram. | `nozram` |
| `zramsize` | Ogni avvio | Imposta la dimensione dello swap zram in MiB. Se omesso, MiniOS lo calcola dalla RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Ogni avvio | Seleziona `lzo`, `lzo-rle`, `lz4`, `lz4hc` o `zstd`; la disponibilità dipende dal kernel in esecuzione. Se omesso, viene mantenuto il valore predefinito del kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Ogni avvio | Imposta il target systemd predefinito. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Ogni avvio | Abilita i servizi systemd specificati all’avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Ogni avvio | Disabilita i servizi systemd specificati all’avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Ogni avvio | Disabilita i cambi automatici di risoluzione dello schermo nelle macchine virtuali. Il valore predefinito XFCE è 1280x800. | `novirtres` |
| `virtres` | Ogni avvio | Imposta la risoluzione dello schermo XFCE nelle macchine virtuali. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Ogni avvio | Esegue solo i componenti live-config elencati, nell’ordine dei componenti. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Ogni avvio | Esegue tutti i componenti live-config tranne quelli elencati. | `nocomponents=anacron,apport` |
| `hostname` | Ogni avvio | Imposta l’hostname di sistema. | `hostname=minios` |
| `username` | Configurazione iniziale | Imposta il nome utente creato per l’accesso automatico. | `username=live` |
| `user-default-groups` | Configurazione iniziale | Imposta i gruppi predefiniti dell’utente creato. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configurazione iniziale | Imposta il nome completo dell’utente creato. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configurazione iniziale | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | Configurazione iniziale | Imposta la password di root come hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configurazione iniziale | Imposta la password utente in chiaro. | `user-password=live` |
| `user-password-crypted` | Configurazione iniziale | Imposta la password utente come hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Ogni avvio | Imposta una o più locale di sistema. | `locales=en_US.UTF-8` |
| `timezone` | Ogni avvio | Imposta il fuso orario di sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Ogni avvio | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | Ogni avvio | Imposta i layout di tastiera separati da virgola. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Ogni avvio | Imposta le varianti di tastiera separate da virgola corrispondenti ai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Ogni avvio | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configurazione iniziale | Impedisce a live-config di concedere privilegi sudo e policykit. | `noroot` |
| `noautologin` | Ogni avvio | Impedisce a live-config di configurare l’accesso automatico console e grafico; la configurazione persistente esistente non viene rimossa. | `noautologin` |
| `nottyautologin` | Ogni avvio | Impedisce la configurazione del solo accesso automatico console; la configurazione persistente esistente non viene rimossa. | `nottyautologin` |
| `nox11autologin` | Ogni avvio | Impedisce la configurazione del solo accesso automatico grafico; la configurazione persistente esistente non viene rimossa. | `nox11autologin` |
| `xorg-driver` | Ogni avvio | Seleziona un driver Xorg invece dell’autorilevamento. | `xorg-driver=nouveau` |
| `xorg-resolution` | Ogni avvio | Imposta la risoluzione Xorg invece dell’autorilevamento. | `xorg-resolution=1920x1080` |
| `module-mode` | Ogni avvio | Con `merged`, integra le modifiche di configurazione nel sistema live in esecuzione. | `module-mode=merged` |
| `hooks` | Ogni avvio | Recupera ed esegue hook dal filesystem, dal supporto live o da URL supportati da wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerazioni sulla sicurezza

La riga di comando del kernel è in chiaro e normalmente visibile nella configurazione del bootloader, in `/proc/cmdline` e nella diagnostica. Non inserire segreti riutilizzabili in `root-password=` o `user-password=`. Preferire i parametri `*-crypted` corrispondenti, trattando comunque gli hash delle password esposti come sensibili.

Gli hook vengono eseguiti come codice privilegiato all’avvio. Un hook `http://` non offre né cifratura del trasporto né autenticazione del server, quindi chiunque sia in grado di alterare il percorso di rete può sostituirlo. Utilizzare solo contenuti e meccanismi di distribuzione affidabili; non usare hook HTTP non autenticati per avvii sensibili alla sicurezza.

Separare i comandi con spazi. Consultare le pagine di riferimento `man bootparam` per ulteriori parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri live-config, vedi [live-config](/reference/configuration/live-config).

Per il caricamento di MiniOS tramite rete (PXE e ISO HTTP), vedi [Boot di rete](/reference/boot-process/Network-Boot).
