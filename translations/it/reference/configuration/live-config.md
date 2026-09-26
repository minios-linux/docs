---
updated: 2026-09-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Componenti di configurazione del sistema

**live-config** contiene i componenti che configurano un sistema live durante il processo di avvio (late userspace).

L'avvio in rete nell'initramfs (`ip=`, PXE, `from=http://…`) è un layer separato di LiveKit e **non** è gestito da live-config. Vedi [Avvio in rete](/reference/boot-process/Network-Boot).

**live-config** può essere configurato tramite parametri di avvio o file di configurazione runtime preparati dall'initramfs. La riga di comando effettiva del kernel viene aggiunta dopo i valori forniti dai file `LIVE_CONFIG_CMDLINE`, quindi i parametri di avvio corrispondenti successivi hanno la precedenza. I componenti che registrano lo stato sotto `/var/lib/live/config` normalmente vengono eseguiti solo una volta; i componenti di sincronizzazione e stateless possono essere eseguiti a ogni invocazione.

Se si utilizza *live-build*(7) per creare il sistema live, i parametri live-config usati di default possono essere impostati tramite l'opzione `--bootappend-live`, vedi la pagina man di *lb_config*(1).

## Parametri di avvio (componenti)

**live-config** viene attivato solo se `boot=live` viene utilizzato come parametro di avvio. Per impostazione predefinita, vengono eseguiti tutti i componenti. Il parametro `live-config.components` può limitare quali componenti vengono eseguiti, mentre `live-config.nocomponents` può escludere dei componenti. Se entrambi i parametri vengono utilizzati, o se uno dei due viene specificato più volte, ha la precedenza l'ultima occorrenza.

- **live-config.components | components**: Tutti i componenti vengono eseguiti. Questa è l'impostazione predefinita delle immagini live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Vengono eseguiti solo i componenti specificati. I componenti vengono eseguiti nell'ordine codificato nei loro nomi file sotto `/usr/lib/live/config`, indipendentemente dall'ordine in questo elenco.
- **live-config.nocomponents | nocomponents**: Nessun componente viene eseguito.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Vengono eseguiti tutti i componenti, tranne quelli specificati.

## Parametri di avvio (opzioni)

Alcuni componenti possono modificare il proprio comportamento in base a un parametro di avvio.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Recupera e applica uno o più file preseed di debconf. Gli URL sono gestiti da `wget` e possono utilizzare HTTP, FTP o `file://`. La parola chiave `filesystem` espande i file in `/usr/lib/live/config-preseed/`; `medium` espande i file in `minios/config-preseed/` sul supporto live rilevato. I file locali espliciti possono usare percorsi come `file:///run/initramfs/memory/data/minios/config-preseed/FILE` o `file:///PATH` nella root live. Le voci separate da pipe vengono elaborate nell’ordine specificato; i file espansi da una parola chiave seguono l’ordine dei glob della shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permette di impostare il nome host del sistema. Il valore predefinito è `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Seleziona la politica di rete cablata. Se non impostato e `dhcp` lasciano invariato il valore predefinito dell’immagine. `static` scrive la configurazione per il backend selezionato; `off` disabilita la configurazione automatica IPv4 per l’interfaccia selezionata.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Seleziona l’interfaccia cablata. Se omessa per `static` o `off`, viene selezionata automaticamente l’unica interfaccia cablata non loopback; se ci sono zero o più candidati è necessario specificare un valore.
- **live-config.network-address=IPV4 | network-address=IPV4**: Imposta l’indirizzo IPv4 statico.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Imposta la lunghezza del prefisso IPv4 da 0 a 32. Il valore statico predefinito è `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Imposta il gateway IPv4 opzionale.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Imposta, se necessario, gli indirizzi dei server DNS separati da virgola.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Seleziona il backend di rete. `auto` preferisce NetworkManager e, in caso di necessità, utilizza ifupdown. Se forzato, `ifupdown` segna l’interfaccia come non gestita da NetworkManager quando entrambi gli stack sono installati.
- **live-config.username=USERNAME | username=USERNAME**: Permette di impostare il nome utente creato per l’accesso automatico. Il valore predefinito è `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Imposta i gruppi supplementari per l'utente creato per l'accesso automatico. I nomi dei gruppi possono essere separati da virgole o spazi. Il valore predefinito è MiniOS`dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permette di impostare il nome completo dell'utente creato per l'accesso automatico. Il valore predefinito è MiniOS`MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permette di impostare la password di root in chiaro.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permette di impostare la password di root in forma cifrata.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permette di impostare la password dell'utente in chiaro.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permette di impostare la password dell'utente in forma cifrata.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permette di impostare la lingua del sistema, ad esempio `de_CH.UTF-8`. Il valore predefinito è `en_US.UTF-8`. Se la lingua selezionata non è già disponibile sul sistema, viene generata automaticamente al volo.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permette di impostare il fuso orario del sistema, ad esempio `Europe/Zurich`. Il valore predefinito è `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permette di modificare il modello di tastiera. Nessun valore predefinito impostato.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permette di modificare i layout di tastiera. Se ne vengono specificati più di uno, gli strumenti dell'ambiente desktop consentiranno di passare da uno all'altro sotto X11. Nessun valore predefinito impostato.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permette di modificare le varianti di tastiera. Se ne vengono specificate più di una, occorre indicare lo stesso numero di valori dei layout di tastiera, poiché verranno abbinati uno a uno nell'ordine specificato. Sono ammessi valori vuoti. Gli strumenti dell'ambiente desktop consentiranno di passare tra ciascuna coppia di layout e variante sotto X11. Nessun valore predefinito impostato.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permette di modificare le opzioni della tastiera. Nessun valore predefinito impostato.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permette di disabilitare i servizi sysv tramite update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permette di specificare se il sistema deve considerare l'orologio hardware impostato su UTC o meno. Il valore predefinito è `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permette di impostare l'x-session-manager tramite update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permette di impostare il driver xorg invece di rilevarlo automaticamente. Se viene specificato un PCI ID in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` all'interno del sistema live, il *DRIVER* viene applicato a questi dispositivi. Se sono presenti sia un parametro di avvio sia un override, ha la precedenza il parametro di avvio.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permette di impostare la risoluzione xorg invece di rilevarla automaticamente, ad esempio 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permette di impostare il driver WLAN invece di rilevarlo automaticamente. Se viene specificato un ID PCI in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` all'interno del sistema live, il *DRIVER* viene applicato forzatamente per questi dispositivi. Se sono presenti sia un parametro di avvio che un override, ha priorità il parametro di avvio.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permette di specificare la modalità modulo per la configurazione live. Quando impostato su `merged`, il sistema aggiornerà gli account utente, ricostruirà le cache e aggiornerà le impostazioni dei pacchetti in modo che le modifiche alla configurazione vengano integrate dinamicamente nel sistema in esecuzione.
- **live-config.link-user-dirs | link-user-dirs**: Collega le directory utente gestite al percorso configurato sul supporto dati MiniOS. È mutuamente esclusivo con la modalità bind e non è disponibile con nessuna modalità `toram` o quando la sessione di persistenza attiva è cifrata con LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Effettua il bind-mount delle directory utente gestite dal percorso configurato sul supporto dati MiniOS. È mutuamente esclusivo con la modalità link e presenta le stesse restrizioni relative a `toram` e alla cifratura della sessione attiva.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Imposta il percorso relativo al supporto utilizzato da `link-user-dirs` o `bind-user-dirs`. Il valore predefinito è `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Scarica ed esegue file arbitrari da un file temporaneo nel sistema live in esecuzione. Gli URL sono gestiti da `wget` e possono utilizzare HTTP, FTP o `file://`; gli interpreti richiesti e le altre dipendenze devono essere già installati. La parola chiave `filesystem` espande i file in `/usr/lib/live/config-hooks/`; `medium` espande i file in `minios/config-hooks/` sul supporto live rilevato (con fallback al percorso ISO nella componente hook). I file locali espliciti possono usare `file:///run/initramfs/memory/data/minios/config-hooks/FILE` o `file:///PATH` nella root live. Le voci separate da pipe vengono eseguite nell'ordine specificato; i file espansi da una parola chiave seguono l'ordine dei glob della shell. Esempi sono installati in `/usr/share/doc/live-config/examples/hooks/`.

> **Avviso di sicurezza:** `live-config` viene eseguito come root. Gli hook vengono resi eseguibili ed eseguiti come root, e i preseeds modificano il database debconf del sistema con privilegi di root. HTTP e FTP semplici non autenticano il contenuto scaricato e non offrono protezione dell'integrità. Preferire file locali verificati o trasporti autenticati affidabili con verifica indipendente dell'integrità; non utilizzare hook remoti o preseeds da reti non affidabili.

## Parametri di avvio (scorciatoie)

Per alcuni casi d'uso comuni in cui sarebbe necessario combinare diversi parametri individuali, **live-config** offre delle scorciatoie. Questo permette sia di avere il massimo controllo su tutte le opzioni, sia di mantenere la semplicità.

- **live-config.noroot | noroot**: Disabilita la configurazione della password di root e le concessioni di privilegi sudo e PolicyKit di MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controlla la configurazione di sudo per l'utente live. Il comportamento predefinito, e quello storico di MiniOS se non impostato, è `passwordless`. La modalità `password` mantiene l'accesso sudo ma richiede la password dell'utente live. La modalità `disabled` rimuove la concessione sudo di MiniOS e esclude l'utente live dal gruppo sudo alla creazione. La vecchia scorciatoia `noroot` sovrascrive questa e disabilita più ampiamente la configurazione dei privilegi di root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controlla le regole di PolicyKit di MiniOS. Il comportamento predefinito, e quello storico di MiniOS se non impostato, è `passwordless`. Le modalità `password` e `disabled` rimuovono quella regola, quindi si applica l'autenticazione PolicyKit standard della distribuzione. `disabled` non è una policy di diniego totale; usare `noroot` quando l'utente live non deve ottenere privilegi amministrativi.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Scrive una policy OpenSSH `PermitRootLogin` se impostato esplicitamente e openssh-server è installato.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Scrive una policy OpenSSH `PasswordAuthentication` se impostato esplicitamente e openssh-server è installato.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controlla la postura XRDP quando xrdp è installato. `relaxed` mantiene i valori predefiniti storici di MiniOS. `hardened` vincola XRDP a localhost, ripristina le impostazioni di sicurezza negoziate/alte e disabilita il login root via XRDP. `disabled` disabilita e ferma XRDP tramite `minios-svc` quando disponibile.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controlla la postura X11 di MiniOS. `relaxed` mantiene la compatibilità storica. `hardened` rimuove l'opzione permissiva `-ac` del server X e rafforza `Xwrapper.config` se presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controlla se `/etc/issue` mostra gli hint delle password root/live predefinite di MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controlla se live-config rilassa il blocco schermo. `relaxed` mantiene la comodità storica della sessione live. `hardened` evita di disabilitare il blocco GNOME e abilita il blocco xscreensaver dove presente.
- **live-config.noautologin | noautologin**: Impedisce a live-config di configurare l'autologin su console e grafica. Non rimuove l'autologin già configurato in una sessione persistente.
- **live-config.nottyautologin | nottyautologin**: Impedisce a live-config di configurare l'autologin su console, senza influire sulla configurazione grafica. La configurazione persistente esistente non viene rimossa.
- **live-config.nox11autologin | nox11autologin**: Impedisce a live-config di configurare l'autologin del display manager, senza influire sulla configurazione TTY. La configurazione persistente esistente non viene rimossa.

## Parametri di avvio (opzioni speciali)

Per casi d'uso particolari sono disponibili alcuni parametri di avvio speciali.

- **live-config.debug | debug**: Abilita l'output di debug in live-config.

## File di configurazione

**live-config** può essere configurato (ma non attivato) tramite file di configurazione. Qualsiasi parametro di avvio supportato può essere inserito in `LIVE_CONFIG_CMDLINE`, e la maggior parte delle opzioni può essere impostata anche tramite variabili individuali. Il parametro `boot=live` rimane comunque necessario per attivare **live-config**.

**Nota:** Se si utilizzano file di configurazione, tutti i parametri di avvio dovrebbero essere inseriti (preferibilmente) nella variabile **LIVE_CONFIG_CMDLINE**, oppure si possono impostare variabili individuali. Se si utilizzano variabili individuali, l'utente deve assicurarsi che tutte le variabili necessarie siano impostate per creare una configurazione valida.

`live-config` esegue il sourcing di `/etc/live/config.conf` e poi di `/etc/live/config.conf.d/*.conf` nell'ordine di shell glob. I frammenti successivi possono quindi sovrascrivere i valori del file principale o dei frammenti precedenti. Non viene eseguito il sourcing separato di un secondo livello di configurazione su un altro supporto.

Su media MiniOS, i file sorgente sono `minios/config.conf` e `minios/config.conf.d/*.conf`. Prima che `live-config` venga avviato, l'initramfs MiniOS sincronizza questi file con quelli runtime `/etc/live/` in base alla data di modifica. Un file sorgente più recente sostituisce quello runtime; un file runtime più recente viene copiato indietro solo se la directory dati MiniOS selezionata è scrivibile. Se i timestamp sono uguali, non viene effettuata alcuna copia; i file mancanti vengono creati, e i file non vengono eliminati. Questa è una sincronizzazione all'avvio, non un monitoraggio continuo. Consulta [File di configurazione](/reference/configuration/config.conf) per tutte le regole di sincronizzazione e precedenza della riga di comando.

Come fallback per implementazioni initramfs che non hanno preparato il file runtime, gli script di avvio systemd e SysV copiano `minios/config.conf` dal supporto rilevato solo quando `/etc/live/config.conf` è assente. Questo fallback non copia i frammenti di `config.conf.d`. L'initramfs LiveKit MiniOS standard e attuale esegue invece la sincronizzazione descritta prima.

I file frammento devono corrispondere a `*.conf`. Nomi come `vendor.conf` o `project.conf` sono consigliati; scegli nomi lessicali con attenzione perché i frammenti successivi sovrascrivono quelli precedenti.

Il contenuto effettivo dei file di configurazione è costituito da una o più delle seguenti variabili.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Questa variabile corrisponde alla riga di comando del bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Questa variabile corrisponde al parametro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Questa variabile corrisponde al parametro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Questa variabile corrisponde al parametro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Questa variabile corrisponde al parametro `**live-config.hostname**=*HOSTNAME*`. Il valore predefinito è `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Seleziona la politica di rete cablata. `dhcp` e un valore non impostato non hanno effetto e non rimuovono un profilo statico MiniOS già creato.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Seleziona l'interfaccia cablata per la politica `static` o `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Imposta l'indirizzo IPv4 statico.
- **LIVE_NETWORK_PREFIX=PREFIX**: Imposta la lunghezza del prefisso statico; il valore predefinito è `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Imposta il gateway statico opzionale.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Imposta i server DNS opzionali, separati da virgola.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Seleziona il backend implementato.

Il componente di rete registra `/var/lib/live/config/network` dopo aver scritto correttamente la policy. Rimuovi tale stamp per applicare una policy modificata su un sistema persistente. Per eliminare un profilo statico precedente, usa `network-method=off` oppure rimuovi manualmente il profilo e lo stamp gestiti da MiniOS.

- **LIVE_USERNAME=USERNAME**: Questa variabile corrisponde al parametro `**live-config.username**=*USERNAME*`. Il valore predefinito è `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Questa variabile corrisponde al parametro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Questa variabile corrisponde al parametro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.root-password**=*PASSWORD*`. Specifica la password di root in chiaro.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.root-password-crypted**=*PASSWORD*`. Specifica la password di root in forma cifrata.
- **LIVE_USER_PASSWORD=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.user-password**=*PASSWORD*`. Specifica la password utente in chiaro.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Questa variabile corrisponde al parametro `**live-config.user-password-crypted**=*PASSWORD*`. Specifica la password utente in forma cifrata.
- **LIVE_CONFIG_NOROOT=true|false**: Questa variabile corrisponde al parametro `**live-config.noroot**` e disabilita la configurazione dei privilegi root, sudo e PolicyKit quando impostata su `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Questa variabile corrisponde al parametro `**live-config.sudo-mode**=...`. Se non impostata, MiniOS mantiene il comportamento storico di sudo senza password.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Questa variabile corrisponde al parametro `**live-config.polkit-mode**=...`. `password` e `disabled` rimuovono la regola senza password MiniOS e ripristinano l'autenticazione PolicyKit standard della distribuzione.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Questa variabile corrisponde al parametro `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Questa variabile corrisponde al parametro `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Questa variabile corrisponde al parametro `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Questa variabile corrisponde al parametro `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Questa variabile corrisponde al parametro `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Questa variabile corrisponde al parametro `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Questa variabile corrisponde al parametro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Questa variabile corrisponde al parametro `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Questa variabile corrisponde al parametro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Questa variabile corrisponde al parametro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Questa variabile corrisponde al parametro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Questa variabile corrisponde al parametro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Questa variabile corrisponde al parametro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Questa variabile corrisponde al parametro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Questa variabile corrisponde al parametro `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Questa variabile corrisponde al parametro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Questa variabile corrisponde al parametro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Questa variabile corrisponde al parametro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Questa variabile corrisponde al parametro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Abilita o disabilita i collegamenti dalle directory dati standard dell'utente all'unità MiniOS scrivibile. Il parametro di avvio corrispondente è il semplice flag `live-config.link-user-dirs` . La modalità link non può essere combinata con la modalità bind né con nessuna modalità `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Abilita o disabilita i bind mount delle directory dati standard dell'utente dall'unità MiniOS scrivibile. Il parametro di avvio corrispondente è il semplice flag `live-config.bind-user-dirs` . La modalità bind non può essere combinata con la modalità link né con nessuna modalità `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Questa variabile corrisponde al parametro `**live-config.user-dirs-path**=*PATH*`. Specifica un percorso sicuro all'interno dell'unità MiniOS FAT32, exFAT o NTFS. Il valore predefinito è `/minios/userdata`; i segmenti punto e directory superiore vengono rifiutati.

La configurazione user-media non unisce mai automaticamente due directory non vuote. Una directory locale non vuota viene migrata solo se la destinazione su media è vuota. Quando la funzione viene disabilitata, i dati gestiti su media vengono copiati indietro prima che i collegamenti vengano rimossi. L'attivazione e la copia dei dati utente su media sono bloccate mentre la sessione di persistenza attiva è cifrata con LUKS, per impedire che i dati di sessione vengano spostati su media MiniOS non cifrati. Questa decisione si basa sullo stato reale di cifratura attiva: `perchencrypt=luks` richiede solo la cifratura durante la creazione di una nuova sessione e non descrive una sessione esistente. Una validazione o copia non riuscita lascia le directory utente esistenti invariate e registra il motivo in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Questa variabile contiene lo stato specificato dal parametro `live-config.module-mode` (o `module-mode`). Quando è impostata su `merged`, il sistema live applica gli aggiornamenti (tramite minios-update-users, minios-update-cache e minios-update-dpkg) per unire le configurazioni personalizzate con l'ambiente di base.
- **LIVE_CONFIG_DEBUG=true|false**: Questa variabile corrisponde al parametro `**live-config.debug**`.

# PERSONALIZZAZIONE

**live-config** può essere facilmente personalizzato per progetti downstream o per uso locale.

## Aggiunta di nuovi componenti di configurazione

I progetti downstream possono inserire i propri componenti in /usr/lib/live/config senza dover fare altro: i componenti verranno eseguiti automaticamente durante l'avvio.

È consigliabile inserire i componenti in un proprio pacchetto debian. Un pacchetto di esempio contenente un componente di esempio si trova in /usr/share/doc/live-config/examples.

## Rimozione di componenti di configurazione esistenti

Non è ancora realmente possibile rimuovere i componenti in modo sensato senza dover fornire un pacchetto **live-config** modificato localmente o usare dpkg-divert. Tuttavia, lo stesso risultato si può ottenere disabilitando i rispettivi componenti tramite il meccanismo live-config.nocomponents, vedi sopra. Per evitare di dover sempre specificare i componenti disabilitati tramite parametro di avvio, è consigliabile usare un file di configurazione, vedi sopra.

I file di configurazione per il sistema live stesso è preferibile inserirli in un proprio pacchetto debian. Un pacchetto di esempio contenente una configurazione di esempio si trova in /usr/share/doc/live-config/examples.

# FILE

- `minios/config.conf` sul supporto dati MiniOS selezionato (copia sorgente)
- `minios/config.conf.d/*.conf` sul supporto dati MiniOS selezionato (frammenti sorgente)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` su supporto dati scrivibile selezionato quando l'esportazione log è abilitata
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` sul supporto live rilevato (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` sul supporto live rilevato (`medium` preseeds)

# VEDI ANCHE

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

Maggiori informazioni su **minios-live-config** sono disponibili nel suo [repository GitHub](https://github.com/minios-linux/minios-live-config). Informazioni generali su MiniOS sono disponibili su [minios.dev](https://minios.dev).

# BUG

I bug possono essere segnalati nel [tracker issue di minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTORE

**live-config** è stato originariamente scritto da Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Dal 2016, lo sviluppo è stato portato avanti dal Debian Live team. Dal 2025, lo sviluppo della versione modificata **minios-live-config** è seguito dal MiniOS Live team.
