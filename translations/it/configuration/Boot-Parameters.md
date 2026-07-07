# Parametri di avvio

## Come utilizzare i parametri di avvio

I parametri di avvio, noti anche come parametri del kernel, sono comandi che puoi inserire per personalizzare il processo di avvio di MiniOS. Possono essere utilizzati per disabilitare il rilevamento dell'hardware, avviare MiniOS da un dispositivo specifico e altro ancora.

### Per Syslinux:

- Premi <kbd>Esc</kbd> durante la sequenza di avvio di MiniOS per accedere al menu di boot.
- Premi <kbd>Tab</kbd> per modificare le opzioni di avvio.
- Inserisci i parametri desiderati e premi Invio per avviare.

### Per Grub:

- Premi <kbd>E</kbd> quando appare il menu di grub.
- Modifica i parametri di avvio alla fine della riga di comando.
- Premi <kbd>F10</kbd> per avviare con le nuove impostazioni.

## Tabella dei parametri di avvio

La tabella seguente elenca i parametri di avvio disponibili in MiniOS, le loro funzioni ed esempi di utilizzo.

**Legenda:**
- 🔒 **Solo una volta** - Applicato solo al primo avvio, non può essere modificato negli avvii successivi
- 🔄 **Riconfigurabile** - Può essere modificato ad ogni avvio e riapplicato


| Parametro | Riconfigurabile | Descrizione | Esempio d'uso |
|---|---|---|---|
| `from` | 🔄 | Carica i dati di MiniOS da una directory, dispositivo o file ISO specificato. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Abilita il caricamento dei moduli `.sb` specificati tramite espressione regolare. Funziona insieme al comando `toram=trim`, consentendo di caricare in RAM solo i moduli selezionati.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Disabilita il caricamento dei moduli `.sb` specificati tramite espressione regolare. Funziona insieme al comando `toram=trim`, permettendo di escludere moduli selezionati dal caricamento in RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | 🔄 | Imposta l'estensione dei file per i bundle (moduli). Il valore predefinito è `sb`. | `bext=mymod` |
| `timing` | 🔄 | Abilita l'output dei tempi durante l'avvio per il debug delle prestazioni. | `timing` |
| `union` | 🔄 | Forza l'utilizzo di un filesystem union specifico. | `union=aufs`<br>`union=overlayfs` |
| `ip` | 🔄 | Imposta un indirizzo IP statico per le interfacce di rete, usato per l'avvio PXE. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>`. | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | 🔄 | Imposta la dimensione della cache in MB per i dati caricati tramite HTTP. | `cache=512` |
| `rd.break` | 🔄 | Interrompe il processo di avvio alla fine della fase initramfs e fornisce una shell di debug. | `rd.break` |
| `perchdir` | 🔄 | Seleziona un profilo o esegue un'azione con un profilo. Accetta il numero del profilo o le parole chiave `resume` (riprendi la sessione precedente), `new` (avvia una nuova sessione) o `ask` (seleziona la sessione all'avvio). Se omesso, MiniOS parte in modalità "pulita". | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Imposta la dimensione del file system virtuale DynFileFS (in MB), usato per salvare dati su file system non-Linux (es. FAT32, NTFS). Il valore predefinito è 16GB. Utilizza questa opzione se il disco di destinazione è più piccolo. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Modalità di salvataggio per i cambiamenti persistenti.<br>`native` (predefinito) - salvataggio diretto su file system compatibili POSIX;<br>`dynfilefs` - salvataggio in file immagine espandibili dinamicamente;<br>`raw` - salvataggio in un file immagine a dimensione fissa.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `perch` | 🔄 | Abilita la persistenza e riprende l'ultima sessione utilizzata. Equivalente a `perchdir=resume`. | `perch` |
| `toram` | 🔄 | Copia il sistema in RAM. Può assumere i valori `trim` e `full`. Se specificato senza parametri, il valore predefinito è `full`.<br>`trim` - viene copiato solo il necessario, considerando i filtri `load` e `noload`. Se sono specificati parametri `perch`, anche le modifiche vengono caricate.<br>`full` - viene caricata l'intera cartella minios, escluse le modifiche a meno che non sia specificato `perch`. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Disabilita il server X e avvia in modalità console testuale. | `text` |
| `automount` | 🔄 | Abilita il montaggio automatico dei dispositivi di archiviazione. | `automount` |
| `debug` | 🔄 | Abilita l'output di debug durante l'avvio. | `debug` |
| `nozram` | 🔄 | Disabilita lo swap zram. | `nozram` |
| `zramsize` | 🔄 | Imposta la dimensione dello swap zram (in MB). | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Specifica l'algoritmo di compressione zram. Opzioni disponibili per Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Il valore predefinito è `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Imposta il target predefinito di systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Abilita i servizi systemd specificati all'avvio. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Disabilita i servizi systemd specificati all'avvio. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Disabilita il cambio automatico della risoluzione dello schermo nelle macchine virtuali. La risoluzione predefinita nelle macchine virtuali è 1280x800. (Valido solo nell'ambiente XFCE.) | `novirtres` |
| `virtres` | 🔄 | Imposta la risoluzione dello schermo nelle macchine virtuali (larghezza x altezza). (Valido solo nell'ambiente XFCE.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Specifica quali componenti live-config eseguire. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Specifica quali componenti live-config NON eseguire. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Imposta l'hostname del sistema. | `hostname=minios` |
| `username` | 🔒 | Imposta il nome utente per l'autologin. | `username=live` |
| `user-default-groups` | 🔒 | Imposta i gruppi predefiniti per l'utente. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Imposta il nome completo dell'utente. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Imposta la password di root in chiaro. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Imposta la password di root in forma criptata. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Imposta la password dell'utente in chiaro. | `user-password=live` |
| `user-password-crypted` | 🔒 | Imposta la password dell'utente in forma criptata. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Imposta la lingua del sistema. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Imposta il fuso orario del sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Imposta il modello di tastiera. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Imposta i layout di tastiera (separati da virgola). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Imposta le varianti di tastiera (separate da virgola). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Imposta le opzioni della tastiera. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Disabilita i privilegi sudo e policykit. | `noroot` |
| `noautologin` | 🔄 | Disabilita sia l'autologin in console che quello grafico. | `noautologin` |
| `nottyautologin` | 🔄 | Disabilita solo l'autologin in console. | `nottyautologin` |
| `nox11autologin` | 🔄 | Disabilita solo l'autologin grafico. | `nox11autologin` |
| `xorg-driver` | 🔄 | Imposta il driver xorg invece dell'autodetect. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Imposta la risoluzione xorg invece dell'autodetect. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Imposta la modalità modulo di live-config. Se impostato su "merged", integra dinamicamente le modifiche di configurazione. | `module-mode=merged` |
| `hooks` | 🔄 | Esegue file arbitrari da filesystem, supporto o URL. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Separa i comandi con uno spazio. Consulta le pagine di riferimento `man bootparam` per ulteriori parametri del kernel comuni a tutte le distribuzioni Linux.

Per informazioni dettagliate sui parametri live-config, vedi [live-config](/configuration/live-config.md).
