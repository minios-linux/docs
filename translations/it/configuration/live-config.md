# LIVE-CONFIG

**live-config** - Componenti di Configurazione del Sistema

**live-config** contiene i componenti che configurano un sistema live durante il processo di avvio (late userspace).

**live-config** può essere configurato tramite parametri di avvio o file di configurazione. Se entrambi i meccanismi vengono utilizzati per una determinata opzione, i parametri di avvio hanno la precedenza sui file di configurazione. Quando si utilizza la persistenza, i componenti di **live-config** vengono eseguiti solo una volta.

Se si utilizza *live-build*(7) per creare il sistema live, i parametri di live-config utilizzati di default possono essere impostati tramite l'opzione `--bootappend-live`, vedere la pagina di manuale di *lb_config*(1).

## Parametri di Avvio (componenti)

**live-config** viene attivato solo se si utilizza `boot=live` come parametro di avvio. Inoltre, è necessario specificare a **live-config** quali componenti eseguire tramite il parametro `live-config.components` o quali componenti non eseguire tramite il parametro `live-config.nocomponents`. Se vengono utilizzati sia `live-config.components` che `live-config.nocomponents`, oppure se uno dei due viene specificato più volte, ha sempre la precedenza quello indicato per ultimo.

- **live-config.components | components**: Tutti i componenti vengono eseguiti. Questo è il comportamento predefinito delle immagini live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Vengono eseguiti solo i componenti specificati. Nota che l'ordine è importante, ad esempio `live-config.components=sudo,user-setup` non funzionerebbe poiché l'utente deve essere aggiunto prima di poter essere configurato per sudo. Consulta i nomi dei file dei componenti in `/usr/lib/live/config` per il loro numero d'ordine.
- **live-config.nocomponents | nocomponents**: Nessun componente viene eseguito. È equivalente a non usare né `live-config.components` né `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Tutti i componenti vengono eseguiti, tranne quelli specificati.

## Parametri di Avvio (opzioni)

Alcuni componenti possono modificare il loro comportamento in base a un parametro di avvio.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Permette di scaricare e applicare uno o più file preseed di debconf da applicare al database debconf. Nota che gli URL devono essere accessibili tramite wget (http, ftp o file://). Se il file si trova sul supporto live, può essere recuperato con `file:///run/initramfs/memory/data/FILE`, oppure con `file:///FILE` se si trova nella root filesystem del sistema live stesso. Tutti i file preseed in `/usr/lib/live/config-preseed/` nella root filesystem del sistema live possono essere abilitati automaticamente con la parola chiave `filesystem`. Tutti i file preseed in `/minios/config-preseed/` del supporto live possono essere abilitati automaticamente con la parola chiave `medium`. Se si combinano diversi meccanismi, i file preseed del filesystem vengono applicati per primi, poi quelli del supporto e infine quelli di rete.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permette di impostare il nome host del sistema. Il valore predefinito è `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Permette di impostare il nome utente che viene creato per l'autologin. Il valore predefinito è `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Permette di impostare i gruppi predefiniti degli utenti creati per l'autologin. Il valore predefinito è `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permette di impostare il nome completo degli utenti creati per l'autologin. Su MiniOS, il valore predefinito è `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permette di impostare la password di root in chiaro.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permette di impostare la password di root in forma cifrata.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permette di impostare la password utente in chiaro.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permette di impostare la password utente in forma cifrata.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permette di impostare la locale del sistema, ad esempio `de_CH.UTF-8`. Il valore predefinito è `en_US.UTF-8`. Se la locale selezionata non è già disponibile sul sistema, viene generata automaticamente al volo.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permette di impostare il fuso orario del sistema, ad esempio `Europe/Zurich`. Il valore predefinito è `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permette di cambiare il modello di tastiera. Nessun valore predefinito impostato.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permette di cambiare i layout di tastiera. Se ne vengono specificati più di uno, gli strumenti dell'ambiente desktop permetteranno di selezionare il layout sotto X11. Nessun valore predefinito impostato.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permette di cambiare le varianti di tastiera. Se ne vengono specificate più di una, si dovrebbe specificare lo stesso numero di valori dei layout di tastiera, poiché verranno abbinati uno a uno nell'ordine indicato. Sono ammessi valori vuoti. Gli strumenti dell'ambiente desktop permetteranno di passare da una coppia layout-variante all'altra sotto X11. Nessun valore predefinito impostato.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permette di cambiare le opzioni della tastiera. Nessun valore predefinito impostato.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permette di disabilitare i servizi sysv tramite update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permette di specificare se il sistema deve considerare l'orologio hardware impostato su UTC o meno. Il valore predefinito è `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permette di impostare l'x-session-manager tramite update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permette di impostare il driver xorg invece di rilevarlo automaticamente. Se un ID PCI è specificato in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` all'interno del sistema live, il *DRIVER* viene forzato per questi dispositivi. Se sono presenti sia un parametro di avvio che un override, il parametro di avvio ha la precedenza.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permette di impostare la risoluzione xorg invece di rilevarla automaticamente, ad esempio 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permette di impostare il driver WLAN invece di rilevarlo automaticamente. Se un ID PCI è specificato in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` all'interno del sistema live, il *DRIVER* viene forzato per questi dispositivi. Se sono presenti sia un parametro di avvio che un override, il parametro di avvio ha la precedenza.
- **live-config.module-mode=MODE | module-mode=MODE**: Permette di specificare la modalità modulo per la configurazione live. Se impostato su "merged", il sistema aggiornerà gli account utente, ricostruirà le cache e aggiornerà le impostazioni dei pacchetti in modo che le modifiche di configurazione vengano integrate dinamicamente nel sistema in esecuzione.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Permette di scaricare ed eseguire uno o più file arbitrari. Nota che gli URL devono essere accessibili tramite wget (http, ftp o file://), i file vengono eseguiti in /tmp del sistema live in esecuzione e devono avere già installate tutte le dipendenze necessarie, ad esempio se si vuole eseguire uno script python il sistema deve avere python installato. Alcuni hook per casi d'uso comuni sono disponibili in `/usr/share/doc/live-config/examples/hooks/`. Se il file si trova sul supporto live, può essere recuperato con `file:///run/initramfs/memory/data/FILE`, oppure con `file:///FILE` se si trova nella root filesystem del sistema live stesso. Tutti gli hook in `/usr/lib/live/config-hooks/` nella root filesystem del sistema live possono essere abilitati automaticamente con la parola chiave `filesystem`. Tutti gli hook in `/minios/config-hooks/` del supporto live possono essere abilitati automaticamente con la parola chiave `medium`. Se si combinano diversi meccanismi, gli hook del filesystem vengono eseguiti per primi, poi quelli del supporto e infine quelli di rete.

## Parametri di Avvio (scorciatoie)

Per alcuni casi d'uso comuni che richiederebbero la combinazione di diversi parametri individuali, **live-config** fornisce delle scorciatoie. Questo permette sia di avere il pieno controllo su tutte le opzioni, sia di mantenere la semplicità.

- **live-config.noroot | noroot**: Disabilita sudo e policykit, l'utente non può ottenere privilegi di root sul sistema.
- **live-config.noautologin | noautologin**: Disabilita sia il login automatico sulla console sia quello grafico.
- **live-config.nottyautologin | nottyautologin**: Disabilita il login automatico sulla console, senza influire sull'autologin grafico.
- **live-config.nox11autologin | nox11autologin**: Disabilita il login automatico tramite qualsiasi display manager, senza influire sull'autologin tty.

## Parametri di Avvio (opzioni speciali)

Per casi d'uso particolari sono disponibili alcuni parametri di avvio speciali.

- **live-config.debug | debug**: Abilita l'output di debug in live-config.

## File di configurazione

**live-config** può essere configurato (ma non attivato) tramite file di configurazione. Tutto ciò che può essere configurato tramite un parametro di avvio, ad eccezione delle scorciatoie, può essere alternativamente configurato anche tramite uno o più file. Se si utilizzano i file di configurazione, il parametro `boot=live` è comunque necessario per attivare **live-config**.

**Nota:** Se si utilizzano i file di configurazione, è preferibile inserire tutti i parametri di avvio nella variabile **LIVE_CONFIG_CMDLINE**, oppure è possibile impostare le singole variabili. Se si utilizzano le variabili singole, l'utente deve assicurarsi che tutte le variabili necessarie siano impostate per creare una configurazione valida.

I file di configurazione possono essere posizionati sia direttamente nel file system root (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`), sia sul supporto live (`minios/config.conf`, `minios/config.conf.d/*.conf`). Se una determinata opzione è configurata in entrambi i luoghi, hanno priorità i file presenti sul supporto live rispetto a quelli nel file system root.

Sebbene i file di configurazione posti nelle directory di configurazione non richiedano un nome specifico, per coerenza si suggerisce di utilizzare come schema di denominazione `vendor.conf` oppure `project.conf` (dove `vendor` o `project` viene sostituito con il nome effettivo, ottenendo così un nome file come `progress-linux.conf`).

Il contenuto effettivo dei file di configurazione consiste in una o più delle seguenti variabili.

- **LIVE_CONFIG_CMDLINE=PARAMETRO1 PARAMETRO2...PARAMETROn**: Questa variabile corrisponde alla riga di comando del bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENTE1,COMPONENTE2,...COMPONENTEn**: Questa variabile corrisponde al parametro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENTE1,COMPONENTE2,...COMPONENTEn**: Questa variabile corrisponde al parametro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Questa variabile corrisponde al parametro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=NOMEHOST**: Questa variabile corrisponde al parametro `**live-config.hostname**=*HOSTNAME*`. Il valore predefinito è `minios`.
- **LIVE_USERNAME=NOMEUTENTE**: Questa variabile corrisponde al parametro `**live-config.username**=*USERNAME*`. Il valore predefinito è `live`.
- **LIVE_USER_DEFAULT_GROUPS=GRUPPO1,GRUPPO2,...GRUPPOn**: Questa variabile corrisponde al parametro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="NOME COMPLETO UTENTE"**: Questa variabile corrisponde al parametro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.root-password**=*PASSWORD*`. Specifica la password di root in chiaro.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.root-password-crypted**=*PASSWORD*`. Specifica la password di root in forma criptata.
- **LIVE_USER_PASSWORD=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.user-password**=*PASSWORD*`. Specifica la password utente in chiaro.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.user-password-crypted**=*PASSWORD*`. Specifica la password utente in forma criptata.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Questa variabile corrisponde al parametro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=FUSO_ORARIO**: Questa variabile corrisponde al parametro `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=MODELLO_TASTIERA**: Questa variabile corrisponde al parametro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=LAYOUT1,LAYOUT2,...LAYOUTn**: Questa variabile corrisponde al parametro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=VARIANTE1,VARIANTE2,...VARIANTEn**: Questa variabile corrisponde al parametro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=OPZIONI_TASTIERA**: Questa variabile corrisponde al parametro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVIZIO1,SERVIZIO2,...SERVIZIOn**: Questa variabile corrisponde al parametro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Questa variabile corrisponde al parametro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Questa variabile corrisponde al parametro `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Questa variabile corrisponde al parametro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Questa variabile corrisponde al parametro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Questa variabile corrisponde al parametro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Questa variabile corrisponde al parametro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Questa variabile corrisponde al parametro `**live-config.link-user-dirs**=true|false`. Collega le directory dati standard dell’utente all’unità MiniOS scrivibile. Non può essere combinata con la modalità bind o con nessuna modalità `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Questa variabile corrisponde al parametro `**live-config.bind-user-dirs**=true|false`. Effettua il bind-mount delle directory dati standard dell’utente dall’unità MiniOS scrivibile. Non può essere combinata con la modalità link o con nessuna modalità `toram`.
- **LIVE_USER_DIRS_PATH=PERCORSO**: Questa variabile corrisponde al parametro `**live-config.user-dirs-path**=*PATH*`. Specifica un percorso sicuro all’interno dell’unità MiniOS FAT32, exFAT o NTFS. Il valore predefinito è `/minios/userdata`; i segmenti punto e directory superiore vengono rifiutati.

La configurazione dei supporti utente non unisce mai automaticamente due directory non vuote. Una directory locale non vuota viene migrata solo quando la destinazione sul supporto è vuota. Quando la funzionalità viene disabilitata, i dati gestiti sul supporto vengono copiati indietro prima che i collegamenti vengano rimossi. Una validazione o copia non riuscita lascia le directory utente esistenti inalterate e registra il motivo in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Questa variabile contiene lo stato specificato dal parametro `live-config.module-mode` (o `module-mode`). Quando è impostata su "merged", il sistema live applica gli aggiornamenti (tramite minios-update-users, minios-update-cache e minios-update-dpkg) per unire le configurazioni personalizzate con l’ambiente di base.
- **LIVE_CONFIG_DEBUG=true|false**: Questa variabile corrisponde al parametro `**live-config.debug**`.

# PERSONALIZZAZIONE

**live-config** può essere facilmente personalizzato per progetti derivati o per uso locale.

## Aggiunta di nuovi componenti di configurazione

I progetti derivati possono inserire i propri componenti in /usr/lib/live/config senza dover fare altro; i componenti verranno eseguiti automaticamente durante l'avvio.

È consigliabile inserire i componenti in un proprio pacchetto debian. Un pacchetto di esempio contenente un componente di esempio si trova in /usr/share/doc/live-config/examples.

## Rimozione di componenti di configurazione esistenti

Non è ancora realmente possibile rimuovere i componenti in modo pulito senza dover fornire un pacchetto **live-config** modificato localmente o utilizzare dpkg-divert. Tuttavia, lo stesso risultato può essere ottenuto disabilitando i relativi componenti tramite il meccanismo live-config.nocomponents, vedi sopra. Per evitare di dover sempre specificare i componenti disabilitati tramite il parametro di avvio, è consigliabile usare un file di configurazione, vedi sopra.

I file di configurazione per il sistema live stesso è preferibile inserirli in un proprio pacchetto debian. Un pacchetto di esempio contenente una configurazione di esempio si trova in /usr/share/doc/live-config/examples.

# COMPONENTI

**live-config** attualmente include i seguenti componenti in /usr/lib/live/config.

- **nss-systemd**: rimuove o ripristina il modulo NSS di systemd in /etc/nsswitch.conf per aggirare un problema noto di systemd.
- **debconf**: consente di applicare file preseed arbitrari posizionati sul supporto live o su un server http/ftp.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: imposta il file /etc/issue con un banner di benvenuto e informazioni sulla distribuzione.
- **live-debconfig (passwd)**: configura le password di utente e root tramite live-debconfig.
- **user-setup**: aggiunge un account utente live.
- **root-setup**: imposta o aggiorna la password di root e configura l'ambiente utente root.
- **sudo**: concede privilegi sudo all'utente live.
- **user-media**: configura il montaggio dei supporti e il collegamento o bind delle directory utente per dati persistenti.
- **user-ssh-keys**: sincronizza le chiavi SSH dai file `authorized_keys.<username>` specifici dell'utente sul supporto live alle rispettive home directory. Supporta più utenti contemporaneamente (es. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales**: configura le locali.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura il nome utente in xorg.service.
- **gdm3**: configura l'autologin in gdm3.
- **kdm**: configura l'autologin in kdm.
- **lightdm**: configura l'autologin in lightdm.
- **lxdm**: configura l'autologin in lxdm.
- **nodm**: configura l'autologin in nodm.
- **slim**: configura l'autologin in slim.
- **xinit**: configura l'autologin con xinit.
- **keyboard-configuration**: configura la tastiera.
- **sysvinit**: configura sysvinit.
- **sysv-rc**: configura sysv-rc disabilitando i servizi elencati.
- **login**: disabilita lastlog.
- **anacron**: disabilita anacron.
- **util-linux**: disabilita hwclock di util-linux.
- **apport**: disabilita apport.
- **gnome-panel-data**: disabilita il pulsante di blocco dello schermo.
- **gnome-power-manager**: disabilita l'ibernazione.
- **gnome-screensaver**: disabilita il blocco schermo del salvaschermo.
- **kaboom**: disabilita la procedura guidata di migrazione KDE (squeeze e versioni successive).
- **kde-services**: disabilita alcuni servizi KDE indesiderati (squeeze e versioni successive).
- **policykit**: concede privilegi all'utente tramite policykit.
- **ssl-cert**: rigenera i certificati snake-oil ssl.
- **xrdp**: configura xrdp per la connettività desktop remoto.
- **xfce4-panel**: configura xfce4-panel alle impostazioni predefinite.
- **xscreensaver**: disabilita il blocco schermo del salvaschermo.
- **broadcom-sta**: configura i driver WLAN broadcom-sta.
- **xserver-xorg**: configura xserver-xorg.
- **openssh-server**: ricrea le chiavi host di openssh-server.
- **hyperv**: configura le impostazioni X11 per migliorare la compatibilità su piattaforme Microsoft Hyper-V.
- **ntfs3**: gestisce le regole udev per il supporto NTFS3.
- **config-module-mode**: configura la modalità modulo di sistema e aggiorna cache, impostazioni utente e dpkg.
- **hooks**: consente di eseguire comandi arbitrari da un file posizionato sul supporto live o su un server http/ftp.

# FILE

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `minios/config.conf`
- `minios/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/minios/config-hooks/*`
- `minios/config-hooks/*`
- `/minios/config-preseed/*`
- `minios/config-preseed/*`

# VEDI ANCHE

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

Maggiori informazioni su **minios-live-config** e il progetto MiniOS sono disponibili su [minios.dev](https://minios.dev) e sul [repository GitHub](https://github.com/minios-linux/minios-live).

# BUG

I bug possono essere segnalati aprendo una issue nel repository GitHub su [MiniOS Issues](https://github.com/minios-linux/minios-live/issues).

# AUTORE

**live-config** è stato originariamente scritto da Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Dal 2016, lo sviluppo è stato portato avanti dal team Debian Live. Dal 2025, lo sviluppo della versione modificata **minios-live-config** è seguito dal team MiniOS Live.
