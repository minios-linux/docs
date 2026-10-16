---
updated: 2026-10-15
program_commits:
    minios-live-config: 2a798c533b2980a40e8457205cabfa24ccad2d10
---

# live-config

**configurazione live**

**live-config** contiene i componenti che configurano un sistema live durante la procedura di avvio (late userspace).

La cache delle sessioni persistenti e la politica di registrazione vengono decise in precedenza da `minios-boot`, dopo la preparazione della root live e della relativa configurazione, ma prima dell'avvio dei servizi ordinari. Il componente `browser-cache` applica i mount per utente dopo la creazione degli utenti. Queste politiche richiedono che l'attivazione della persistenza su uno spazio di archiviazione permanente vada a buon fine oppure che la sessione sia scrivibile e copiata con RAM, con le informazioni sull'origine protette, e richiedono un initrd che supporti `perch-storage-v1`. Le sessioni copiate con RAM non sono permanenti finché non vengono salvate; vedi la sezione [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

L'avvio dalla rete nell'initramfs (`ip=`, PXE, `from=http://…`) è un livello separato di LiveKit e **non** è gestito da live-config. Vedi la sezione [Avvio dalla rete](/reference/boot-process/Network-Boot).

**live-config** può essere configurato tramite parametri di avvio o file di configurazione runtime preparati dall'initramfs. La riga di comando effettiva del kernel viene aggiunta dopo i valori specificati nei file, quindi i parametri di avvio corrispondenti aggiunti successivamente hanno la precedenza. I componenti che registrano lo stato in `LIVE_CONFIG_CMDLINE` vengono normalmente eseguiti una sola volta; i componenti di sincronizzazione e senza stato possono essere eseguiti a ogni invocazione.`/var/lib/live/config`

Se *live-build*(7) viene usato per creare il sistema live, i parametri live-config usati per impostazione predefinita possono essere definiti tramite l'opzione `--bootappend-live`, vedi la pagina del manuale di *lb_config*(1).

## Parametri di avvio (componenti)

**live-config** viene attivato solo se `boot=live` viene usato come parametro di avvio. Per impostazione predefinita vengono eseguiti tutti i componenti. Il parametro `live-config.components` consente di limitare i componenti da eseguire, mentre `live-config.nocomponents` consente di escluderne alcuni. Se si usano entrambi i parametri o se uno dei due viene specificato più volte, prevale l’ultima occorrenza.

- **live-config.components | components**: vengono eseguiti tutti i componenti. È l’impostazione predefinita delle immagini live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: vengono eseguiti solo i componenti specificati. I componenti vengono eseguiti nell’ordine indicato dai nomi dei rispettivi file in `/usr/lib/live/config`, indipendentemente dall’ordine in cui sono elencati.
- **live-config.nocomponents | nocomponents**: non viene eseguito alcun componente.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: vengono eseguiti tutti i componenti, tranne quelli specificati.

## Parametri di avvio (opzioni)

Alcuni componenti possono modificare il proprio comportamento in base a un parametro di avvio.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Scarica e applica uno o più file di preconfigurazione debconf. Gli URL vengono gestiti da `wget` e possono usare HTTP, FTP o `file://`. La parola chiave `filesystem` espande i file in `/usr/lib/live/config-preseed/`; `medium` espande i file in `minios/config-preseed/` sul supporto live rilevato. Per i file locali espliciti si possono usare percorsi come `file:///run/initramfs/memory/data/minios/config-preseed/FILE` o `file:///PATH` nella root live. Le voci separate da pipe vengono elaborate nell'ordine specificato; i file espansi tramite una parola chiave seguono l'ordine dei caratteri jolly della shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Consente di impostare il nome host del sistema. Il valore predefinito è `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Seleziona la configurazione della rete cablata. Se non impostato, `dhcp` non modifica la configurazione predefinita dell'immagine. `static` scrive la configurazione per il backend selezionato; `off` disabilita la configurazione IPv4 automatica per l'interfaccia selezionata.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Seleziona l'interfaccia cablata. Se omessa con `static` o `off`, viene selezionata automaticamente l'unica interfaccia cablata non loopback; se non ci sono candidati o ce n'è più di uno, è necessario specificare un valore.
- **live-config.network-address=IPV4 | network-address=IPV4**: Imposta l'indirizzo IPv4 statico.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Imposta la lunghezza del prefisso IPv4 da 0 a 32. Il valore predefinito per la configurazione statica è `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Imposta il gateway IPv4 facoltativo.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Imposta gli indirizzi facoltativi dei server DNS, separati da virgole.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Seleziona il backend di rete. `auto` preferisce NetworkManager e, se non disponibile, usa ifupdown. Se si forza `ifupdown` e sono installati entrambi gli stack, l'interfaccia viene contrassegnata come non gestita da NetworkManager.
- **live-config.username=USERNAME | username=USERNAME**: Consente di impostare il nome utente da creare per l'accesso automatico. Il valore predefinito è `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Imposta i gruppi supplementari per l'utente creato per l'accesso automatico. I nomi dei gruppi possono essere separati da virgole o spazi. Il valore predefinito MiniOS è `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Consente di impostare il nome completo dell'utente creato per l'accesso automatico. Il valore predefinito MiniOS è `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Consente di impostare la password di root in testo normale.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Consente di impostare la password di root in forma cifrata.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Consente di impostare la password dell'utente in testo normale.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Consente di impostare la password dell'utente in forma cifrata.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Consente di impostare le impostazioni locali del sistema, ad esempio `de_CH.UTF-8`. Il valore predefinito è `en_US.UTF-8`. Se le impostazioni locali selezionate non sono già disponibili nel sistema, vengono generate automaticamente al momento.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Consente di impostare il fuso orario del sistema, ad esempio `Europe/Zurich`. Il valore predefinito è `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Consente di cambiare il modello di tastiera. Non è impostato alcun valore predefinito.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Consente di cambiare i layout di tastiera. Se ne viene specificato più di uno, gli strumenti dell'ambiente desktop consentono di passare da uno all'altro in X11. Non è impostato alcun valore predefinito.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Consente di cambiare le varianti di tastiera. Se ne viene specificata più di una, occorre indicare lo stesso numero di valori dei layout di tastiera, poiché verranno associati uno a uno nell'ordine specificato. Sono ammessi valori vuoti. Gli strumenti dell'ambiente desktop consentono di passare da una coppia di layout e variante all'altra in X11. Non è impostato alcun valore predefinito.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Consente di cambiare le opzioni della tastiera. Non è impostato alcun valore predefinito.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Consente di disabilitare i servizi sysv tramite update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Consente di specificare se il sistema deve considerare che l'orologio hardware sia impostato su UTC. Il valore predefinito è `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Consente di impostare il gestore di sessione X tramite update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Consente di impostare il driver Xorg anziché rilevarlo automaticamente. Se nel sistema live è specificato un ID PCI in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` per il sistema live, per questi dispositivi viene imposto il driver *DRIVER* . Se vengono specificati sia un parametro di avvio sia un override, prevale il parametro di avvio.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Consente di impostare la risoluzione Xorg anziché rilevarla automaticamente, ad esempio 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Consente di impostare il driver WLAN anziché rilevarlo automaticamente. Se nel sistema live è specificato un ID PCI in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` per il sistema live, per questi dispositivi viene imposto il driver *DRIVER* . Se vengono specificati sia un parametro di avvio sia un override, prevale il parametro di avvio.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Consente di specificare la modalità dei moduli per la configurazione live. Se impostata su `merged`, il sistema aggiorna gli account utente, ricostruisce le cache e aggiorna le impostazioni dei pacchetti, integrando dinamicamente le modifiche alla configurazione nel sistema in esecuzione.
- **live-config.link-user-dirs | link-user-dirs**: Collega le directory utente gestite al percorso configurato sul supporto dati MiniOS. Questa modalità è incompatibile con quella bind e non è disponibile con alcuna modalità `toram` o se la sessione di persistenza attiva è cifrata con LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Monta con bind le directory utente gestite dal percorso configurato sul supporto dati MiniOS. Questa modalità è incompatibile con quella link e soggetta alle stesse limitazioni relative alla modalità `toram` e alla cifratura della sessione attiva.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Imposta il percorso relativo al supporto usato da `link-user-dirs` o `bind-user-dirs`. Il valore predefinito è `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Scarica ed esegue file arbitrari da un file temporaneo nel sistema live in esecuzione. Gli URL vengono gestiti da `wget` e possono usare HTTP, FTP o `file://`; gli interpreti richiesti e le altre dipendenze devono essere già installati. La parola chiave `filesystem` espande i file in `/usr/lib/live/config-hooks/`; `medium` espande i file in `minios/config-hooks/` sul supporto live rilevato (con un percorso ISO di ripiego nel componente hook). Per i file locali espliciti si possono usare `file:///run/initramfs/memory/data/minios/config-hooks/FILE` o `file:///PATH` nella root live. Le voci separate da pipe vengono eseguite nell'ordine specificato; i file espansi tramite una parola chiave seguono l'ordine dei caratteri jolly della shell. Gli esempi sono installati in `/usr/share/doc/live-config/examples/hooks/`.

> **Avviso di sicurezza:** `live-config` viene eseguito come root. Gli hook vengono resi eseguibili ed eseguiti come root; inoltre, i file di preconfigurazione modificano con privilegi di root il database debconf del sistema. HTTP e FTP in chiaro non autenticano i contenuti scaricati e non ne garantiscono l'integrità. Preferire file locali verificati o un trasporto autenticato e affidabile con verifica indipendente dell'integrità; non usare hook o file di preconfigurazione remoti su reti non attendibili.

### Opzioni di archiviazione anticipata MiniOS

Queste opzioni vengono lette da `minios-boot` prima dell'avvio dei servizi ordinari. Richiedono che l'attivazione della persistenza sia stata completata correttamente su un supporto di archiviazione durevole oppure in una sessione RAM scrivibile con informazioni `ram-origin`. Non attivano la persistenza e non possono rendere durevoli le modifiche a RAM senza salvarle.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` colloca il journal di systemd e i normali file `/var/log` in RAM di dimensioni limitate; la diagnostica di avvio rimane nell'archiviazione durevole. Valore predefinito: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` colloca gli archivi APT scaricati in un tmpfs di dimensioni limitate quando le condizioni di RAM e swap lo consentono. I database dei pacchetti e gli elenchi dei repository rimangono persistenti. Valore predefinito: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` richiede di archiviare le cache del browser nativo in RAM. Il componente `browser-cache` monta le directory della cache selezionate dall'utente attivo dopo la creazione dell'account. Valore predefinito: `persistent`.

## Parametri di avvio (scorciatoie)

Per alcuni casi d’uso comuni, che richiederebbero di combinare diversi parametri singoli, **live-config** offre delle scorciatoie. In questo modo è possibile gestire nel dettaglio tutte le opzioni senza rinunciare alla semplicità.

- **live-config.noroot | noroot**: Disabilita la configurazione della password di root e i privilegi sudo e PolicyKit concessi tramite MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controlla la configurazione di sudo per l’utente live. L’impostazione predefinita, e il comportamento storico di MiniOS quando non specificata, è `passwordless`. La modalità `password` mantiene l’accesso a sudo, ma richiede la password dell’utente live. La modalità `disabled` rimuove il privilegio sudo tramite MiniOS e non aggiunge l’utente live al gruppo sudo al momento della creazione. La vecchia scorciatoia `noroot` ha la precedenza e disabilita in modo più ampio la configurazione dei privilegi di root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controlla le regole di praticità di MiniOS PolicyKit. L’impostazione predefinita, e il comportamento storico di MiniOS quando non specificata, è `passwordless`. Le modalità `password` e `disabled` rimuovono la regola, applicando così la normale autenticazione PolicyKit della distribuzione. `disabled` non è una regola che nega tutto; usa `noroot` se l’utente live non deve ottenere privilegi amministrativi.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Scrive una policy OpenSSH `PermitRootLogin` quando l’opzione è impostata esplicitamente e openssh-server è installato.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Scrive una policy OpenSSH `PasswordAuthentication` quando l’opzione è impostata esplicitamente e openssh-server è installato.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controlla il livello di sicurezza di XRDP quando xrdp è installato. `relaxed` mantiene le impostazioni predefinite storiche di MiniOS. `hardened` associa XRDP a localhost, ripristina le impostazioni di sicurezza negoziate/alte e disabilita l’accesso root a XRDP. `disabled` disabilita e arresta XRDP tramite `minios-svc` se disponibile.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controlla il livello di praticità di MiniOS X11. `relaxed` mantiene la compatibilità storica. `hardened` rimuove l’opzione permissiva del server X `-ac` e rafforza `Xwrapper.config` se presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controlla se `/etc/issue` mostra i suggerimenti predefiniti sulle password di root/live di MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controlla se live-config allenta il blocco dello schermo. `relaxed` mantiene la praticità storica della sessione live. `hardened` evita di disabilitare il blocco di GNOME e attiva quello di xscreensaver se il relativo file è presente.
- **live-config.noautologin | noautologin**: Impedisce a live-config di configurare l’accesso automatico alla console e all’ambiente grafico. Non rimuove l’accesso automatico già configurato in una sessione persistente.
- **live-config.nottyautologin | nottyautologin**: Impedisce a live-config di configurare l’accesso automatico alla console, senza influire sulla configurazione grafica. La configurazione persistente esistente non viene rimossa.
- **live-config.nox11autologin | nox11autologin**: Impedisce a live-config di configurare l’accesso automatico tramite display manager, senza influire sulla configurazione TTY. La configurazione persistente esistente non viene rimossa.

## Parametri di avvio (opzioni speciali)

Per casi d’uso particolari sono disponibili alcuni parametri di avvio speciali.

- **live-config.debug | debug**: Abilita l’output di debug in live-config.

## File di configurazione

**live-config** può essere configurato (ma non attivato) tramite file di configurazione. Qualsiasi parametro di avvio supportato può essere inserito in `LIVE_CONFIG_CMDLINE`, e la maggior parte delle opzioni può essere impostata in alternativa tramite singole variabili. Il parametro `boot=live` è comunque necessario per attivare **live-config**.

**Nota:** Se vengono utilizzati file di configurazione, tutti i parametri di avvio dovrebbero essere inseriti (preferibilmente) nella variabile **LIVE_CONFIG_CMDLINE** oppure è possibile impostare singole variabili. Se si utilizzano singole variabili, l'utente deve assicurarsi che siano impostate tutte le variabili necessarie per creare una configurazione valida.

`live-config` stesso include `/etc/live/config.conf` e poi `/etc/live/config.conf.d/*.conf` secondo l'ordine dei glob della shell. I frammenti successivi possono quindi sostituire i valori del file principale o dei frammenti precedenti. Non include separatamente un secondo livello di configurazione del supporto.

Nei supporti MiniOS, i file sorgente si trovano in `minios/config.conf` e `minios/config.conf.d/*.conf`. Prima dell'avvio di `live-config` viene avviato, l'initramfs MiniOS sincronizza questi file con i file di runtime di `/etc/live/` in base all'ora di modifica. Un file sorgente più recente sostituisce il corrispondente file di runtime; un file di runtime più recente viene copiato nuovamente solo se la directory dei dati MiniOS selezionata è scrivibile. Timestamp uguali non causano alcuna copia, i file mancanti vengono creati e i file non vengono eliminati. Si tratta di una sincronizzazione all'avvio, non di un monitoraggio continuo. Vedere [File di configurazione](/reference/configuration/config.conf) per le regole complete di sincronizzazione e di precedenza della riga di comando.

Come alternativa per le implementazioni initramfs che non hanno preparato il file di runtime, i wrapper di avvio systemd e SysV copiano `minios/config.conf` dal supporto rilevato solo quando `/etc/live/config.conf` è assente. Questa alternativa non copia i frammenti di `config.conf.d`. L'initramfs LiveKit MiniOS standard e attuale esegue invece la sincronizzazione precedente.

I file dei frammenti devono corrispondere a `*.conf`. Sono consigliati nomi come `vendor.conf` o `project.conf`; scegli attentamente i nomi lessicali, perché i frammenti successivi sovrascrivono quelli precedenti.

Il contenuto effettivo dei file di configurazione consiste in una o più delle seguenti variabili.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: questa variabile corrisponde alla riga di comando del bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: questa variabile corrisponde al parametro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: questa variabile corrisponde al parametro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: questa variabile corrisponde al parametro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: questa variabile corrisponde al parametro `**live-config.hostname**=*HOSTNAME*`. Il valore predefinito è `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: seleziona la policy di rete cablata. `dhcp` e un valore non impostato non eseguono alcuna operazione e non rimuovono un profilo statico MiniOS creato in precedenza.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: seleziona l'interfaccia cablata per la policy `static` o `off` della rete.
- **LIVE_NETWORK_ADDRESS=IPV4**: imposta l'indirizzo IPv4 statico.
- **LIVE_NETWORK_PREFIX=PREFIX**: imposta la lunghezza del prefisso statico; il valore predefinito è `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: imposta il gateway statico opzionale.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: imposta server DNS opzionali separati da virgole.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: seleziona il backend implementato.

Il componente di rete registra `/var/lib/live/config/network` dopo aver scritto correttamente la policy. Rimuovi questo indicatore per applicare la policy modificata su un sistema persistente. Per dismettere un profilo statico precedente, usa `network-method=off` oppure rimuovi manualmente il profilo gestito da MiniOS e l'indicatore.

- **LIVE_USERNAME=USERNAME**: questa variabile corrisponde al parametro `**live-config.username**=*USERNAME*`. Il valore predefinito è `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: questa variabile corrisponde al parametro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: questa variabile corrisponde al parametro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: questa variabile corrisponde al parametro `**live-config.root-password**=*PASSWORD*`. Specifica la password root in testo semplice.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: questa variabile corrisponde al parametro `**live-config.root-password-crypted**=*PASSWORD*`. Specifica la password root in forma crittografata.
- **LIVE_USER_PASSWORD=PASSWORD**: questa variabile corrisponde al parametro `**live-config.user-password**=*PASSWORD*`. Specifica la password dell'utente in testo semplice.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: questa variabile corrisponde al parametro `**live-config.user-password-crypted**=*PASSWORD*`. Specifica la password dell'utente in forma crittografata.
- **LIVE_CONFIG_NOROOT=true|false**: questa variabile corrisponde al parametro `**live-config.noroot**` e disabilita la configurazione dei privilegi di root, sudo e PolicyKit quando è impostata su `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: questa variabile corrisponde al parametro `**live-config.sudo-mode**=...`. Se non impostata, MiniOS mantiene il comportamento storico di sudo senza password.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: questa variabile corrisponde al parametro `**live-config.polkit-mode**=...`. `password` e `disabled` rimuovono la regola MiniOS senza password e ripristinano l'autenticazione PolicyKit standard della distribuzione.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: questa variabile corrisponde al parametro `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: questa variabile corrisponde al parametro `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: questa variabile corrisponde al parametro `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: questa variabile corrisponde al parametro `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: questa variabile corrisponde al parametro `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: questa variabile corrisponde al parametro `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: questa variabile corrisponde al parametro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: questa variabile corrisponde al parametro `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: questa variabile corrisponde al parametro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: questa variabile corrisponde al parametro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: questa variabile corrisponde al parametro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: questa variabile corrisponde al parametro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: questa variabile corrisponde al parametro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: questa variabile corrisponde al parametro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: questa variabile corrisponde al parametro `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: questa variabile corrisponde al parametro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: questa variabile corrisponde al parametro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: questa variabile corrisponde al parametro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: questa variabile corrisponde al parametro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: abilita o disabilita i collegamenti dalle directory dati standard dell'utente all'unità MiniOS scrivibile. Il parametro di avvio corrispondente è il flag `live-config.link-user-dirs` semplice. La modalità collegamento non può essere combinata con la modalità bind o con alcuna modalità `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: abilita o disabilita i bind mount delle directory dati standard dell'utente dall'unità MiniOS scrivibile. Il parametro di avvio corrispondente è il flag `live-config.bind-user-dirs` semplice. La modalità bind non può essere combinata con la modalità collegamento o con alcuna modalità `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: questa variabile corrisponde al parametro `**live-config.user-dirs-path**=*PATH*`. Specifica un percorso sicuro all'interno dell'unità MiniOS FAT32, exFAT o NTFS. Il valore predefinito è `/minios/userdata`; i segmenti punto e directory padre vengono rifiutati.

La configurazione dei supporti utente non unisce mai automaticamente due directory non vuote. Una directory locale non vuota viene migrata solo quando la destinazione sul supporto è vuota. Quando la funzionalità è disabilitata, i dati dei supporti gestiti vengono ricopiati prima della rimozione dei collegamenti. L'attivazione dei supporti utente e la ricopia sono bloccate mentre la sessione di persistenza attiva è crittografata con LUKS, impedendo lo spostamento dei dati della sessione su supporti MiniOS non crittografati. Questa decisione utilizza lo stato di crittografia effettivo della sessione attiva: `perchencrypt=luks` richiede la crittografia solo durante la creazione di una nuova sessione e non descrive una sessione esistente. Una convalida o una copia non riuscita lascia inalterate le directory utente esistenti e registra il motivo in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: questa variabile contiene lo stato specificato dal parametro `live-config.module-mode` (o `module-mode`) . Quando è impostata su `merged`, il sistema live applica gli aggiornamenti (tramite minios-update-users, minios-update-cache e minios-update-dpkg) per unire le configurazioni personalizzate all'ambiente di base.
- **LIVE_CONFIG_DEBUG=true|false**: questa variabile corrisponde al parametro `**live-config.debug**`.

## MiniOS cache e variabili di log

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, e **LIVE_BROWSER_CACHE=persistent|volatile**: Policy indipendenti di avvio MiniOS. Funzionano anche in `config.conf.d` e `LIVE_CONFIG_CMDLINE`. Non abilitano la persistenza autonomamente. Vedere [File di configurazione](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Il `browser-cache` componente legge la `minios-boot` policy convalidata dopo la creazione dell'utente live e monta tramite bind le directory standard della cache dei browser nativi in un filesystem condiviso e con limiti RAM, soggetto a controlli di memoria/swap. Una policy di Firefox creata separatamente disabilita la cache su disco senza spostare i profili del browser. Se questo componente è escluso da `components=` o `nocomponents=`, la sola richiesta anticipata della cache del browser non configura i mount per utente.

Gli helper in modalità unita mantengono gli errori normali, ma creano tracce dettagliate dei comandi e copie di debug solo quando `LIVE_CONFIG_DEBUG=true`.

# PERSONALIZZAZIONE

**live-config** può essere facilmente personalizzato per progetti derivati o per l'uso locale.

## Aggiunta di nuovi componenti di configurazione

I progetti derivati possono inserire i propri componenti in /usr/lib/live/config e non devono fare altro: i componenti verranno richiamati automaticamente durante l'avvio.

È preferibile inserire i componenti in un proprio pacchetto Debian. Un pacchetto di esempio contenente un componente di esempio è disponibile in /usr/share/doc/live-config/examples.

## Rimozione dei componenti di configurazione esistenti

Non è ancora realmente possibile rimuovere i componenti in sé in modo corretto senza dover distribuire un pacchetto **live-config** modificato localmente oppure utilizzare dpkg-divert. Tuttavia, lo stesso risultato si può ottenere disabilitando i componenti interessati tramite il meccanismo live-config.nocomponents; vedi sopra. Per evitare di dover specificare ogni volta i componenti disabilitati tramite il parametro di avvio, è consigliabile utilizzare un file di configurazione; vedi sopra.

I file di configurazione del sistema live stesso vanno preferibilmente inseriti in un pacchetto Debian dedicato. Un pacchetto di esempio contenente una configurazione di esempio è disponibile in /usr/share/doc/live-config/examples.

# COMPONENTI

**live-config** attualmente include i seguenti componenti in /usr/lib/live/config.

- **nss-systemd**: rimuove o ripristina il modulo NSS di systemd in /etc/nsswitch.conf per aggirare un problema noto di systemd.
- **debconf**: consente di applicare file di preconfigurazione arbitrari presenti sul supporto live o su un server http/ftp.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: configura il file /etc/issue con un messaggio di benvenuto e informazioni sulla distribuzione.
- **live-debconfig_passwd**: configura le password degli utenti e di root tramite live-debconfig.
- **user-setup**: aggiunge un account utente live.
- **user-groups**: aggiunge l'utente live ai gruppi supplementari dichiarati dai moduli installati. I gruppi esistenti elencati in `/usr/share/live/config/user-default-groups.d/*.groups` vengono applicati dopo la creazione dell'utente e alle successive esecuzioni di live-config.
- **root-setup**: imposta o aggiorna la password di root e configura l'ambiente dell'utente root.
- **sudo**: concede i privilegi sudo all'utente live.
- **user-ssh-keys**: sincronizza i file `authorized_keys.<username>` specifici dell'utente tra il supporto live e le singole directory home degli utenti. Supporta più utenti contemporaneamente (ad es. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) e riconosce i `toram`, `toram=trim` e `toram=full` come forme RAM-boot per determinare se il supporto live può essere aggiornato in sicurezza.
- **user-media**: collega o monta tramite bind le directory utente convalidate sul supporto dati MiniOS scrivibile esistente, eseguendo una migrazione sicura e una copia inversa quando viene disabilitato.
- **locales**: configura le impostazioni locali.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura il nome utente in xorg.service e applica le impostazioni X11 quando supportate.
- **gdm3**: configura l'accesso automatico in gdm3.
- **sddm**: configura l'accesso automatico in sddm.
- **kdm**: configura l'accesso automatico in kdm.
- **lightdm**: configura l'accesso automatico in lightdm.
- **lxdm**: configura l'accesso automatico in lxdm.
- **nodm**: configura l'accesso automatico in nodm.
- **slim**: configura l'accesso automatico in slim.
- **xinit**: configura l'accesso automatico con xinit.
- **keyboard-configuration**: configura la tastiera.
- **sysvinit**: configura l'accesso automatico alla console tramite `/etc/inittab` quando sysvinit è installato. Le scorciatoie `noautologin` e `nottyautologin` impediscono questa configurazione.
- **sysv-rc**: configura sysv-rc disabilitando i servizi elencati.
- **apport**: disabilita apport.
- **gnome-panel-data**: disabilita il pulsante di blocco dello schermo.
- **gnome-power-manager**: disabilita l'ibernazione.
- **gnome-screensaver**: controlla il blocco dello schermo di GNOME in base a `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: disabilita la procedura guidata di migrazione di KDE (squeeze e versioni successive).
- **kde-services**: disabilita alcuni servizi KDE indesiderati (squeeze e versioni successive).
- **policykit**: concede i privilegi agli utenti tramite PolicyKit.
- **ssl-cert**: rigenera i certificati SSL snake-oil.
- **xrdp**: configura le impostazioni XRDP rilassate, rafforzate o disabilitate quando XRDP è installato.
- **anacron**: disabilita anacron.
- **util-linux**: disabilita il servizio hwclock di util-linux.
- **login**: disabilita lastlog.
- **xserver-xorg**: configura xserver-xorg.
- **network**: configura una policy IPv4 cablata persistente tramite un file keyfile sicuro di NetworkManager o una sezione ifupdown. Viene eseguito prima dei servizi di rete, convalida tutti i valori e registra l'operazione solo dopo una scrittura riuscita.
- **openssh-server**: ricrea le chiavi host di OpenSSH e scrive la policy esplicitamente richiesta per l'accesso root o l'autenticazione tramite password.
- **xfce4-panel**: configura xfce4-panel con le impostazioni predefinite.
- **xscreensaver**: controlla il blocco di xscreensaver in base a `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura i driver WLAN broadcom-sta.
- **hyperv**: configura le impostazioni X11 per migliorare la compatibilità sulle piattaforme Microsoft Hyper-V.
- **ntfs3**: gestisce le regole udev per il supporto NTFS3.
- **config-module-mode**: configura la modalità dei moduli di sistema e aggiorna cache, impostazioni utente e dpkg.
- **browser-cache**: applica la policy browser-cache convalidata dopo la creazione dell'utente, in base alla memoria disponibile, alla memoria swap, ai percorsi sicuri della cache e ai file di policy di Firefox esistenti.
- **hooks**: consente di eseguire comandi arbitrari da un file presente sul supporto live o su un server http/ftp.

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
- `minios/log/YYYYMMDD_HHMMSS/` sui supporti dati selezionati scrivibili quando l'esportazione del log è abilitata
- `/usr/lib/live/config-hooks/*` (`filesystem` hook)
- `minios/config-hooks/*` sul supporto live rilevato (`medium` hook)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseed)
- `minios/config-preseed/*` sul supporto live rilevato (`medium` preseed)

# VEDERE ANCHE

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PAGINA INIZIALE

Maggiori informazioni su **minios-live-config**sono disponibili nel relativo [repository GitHub](https://github.com/minios-linux/minios-live-config). Le informazioni generali su MiniOS sono disponibili su [minios.dev](https://minios.dev).

# BUG

I bug possono essere segnalati nell'[issue tracker di minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTORE

**live-config è stato originariamente scritto da Daniel Baumann (** è stato originariamente scritto da Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Dal 2016, lo sviluppo è proseguito a cura del team Debian Live. Dal 2025, lo sviluppo della versione modificata **minios-live-config** è proseguito a cura del team MiniOS Live.
