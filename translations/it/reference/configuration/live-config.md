---
updated: 2026-10-06
program_commits:
    minios-live-config: cf3ae490e5df92581483ec6345a5f56bdaa812d8
---

# live-config

**live-config** - Componenti di configurazione del sistema

**live-config** contiene i componenti che configurano un sistema live durante il processo di avvio (late userspace).

La politica di cache e log della sessione persistente viene decisa precedentemente da `minios-boot`, dopo che la root live e la sua configurazione sono state preparate ma prima dell'avvio dei servizi ordinari. Il componente `browser-cache` live-config applica i mount per utente dopo la creazione dell'utente. Queste policy richiedono una sessione duratura e funzionante `perch` e un initrd aggiornato che segnali `perch-storage-v1`; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per effetti e limiti.

Il boot di rete nell'initramfs (`ip=`, PXE, `from=http://…`) è un layer separato di LiveKit e **non** è gestito da live-config. Vedi [Boot di rete](/reference/boot-process/Network-Boot).

**live-config** può essere configurato tramite parametri di avvio o file di configurazione runtime preparati dall'initramfs. La riga di comando effettiva del kernel viene aggiunta dopo i valori forniti dai file, quindi i parametri di avvio successivi hanno la precedenza. I componenti che registrano lo stato in `LIVE_CONFIG_CMDLINE` normalmente vengono eseguiti solo una volta; i componenti di sincronizzazione e quelli stateless possono essere eseguiti a ogni invocazione.`/var/lib/live/config`

Se *live-build*(7) viene utilizzato per costruire il sistema live, i parametri live-config usati di default possono essere impostati tramite l'opzione `--bootappend-live` , vedi *lb_config*(1) pagina di manuale.

## Parametri di avvio (componenti)

**live-config** viene attivato solo se `boot=live` viene usato come parametro di avvio. Per impostazione predefinita, vengono eseguiti tutti i componenti. Il parametro `live-config.components` può limitare quali componenti vengono eseguiti, mentre `live-config.nocomponents` può escludere dei componenti. Se entrambi i parametri vengono usati, o uno dei due viene specificato più volte, ha la precedenza l'ultima occorrenza.

- **live-config.components | components**: Tutti i componenti vengono eseguiti. Questa è l'impostazione predefinita delle immagini live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Vengono eseguiti solo i componenti specificati. I componenti vengono eseguiti nell'ordine determinato dai loro nomi file in `/usr/lib/live/config`, indipendentemente dall'ordine in questa lista.
- **live-config.nocomponents | nocomponents**: Nessun componente viene eseguito.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Tutti i componenti vengono eseguiti, tranne quelli specificati.

## Parametri di avvio (opzioni)

Alcuni componenti possono modificare il proprio comportamento tramite un parametro di avvio.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Scarica e applica uno o più file preseed di debconf. Gli URL sono gestiti da `wget` e possono utilizzare HTTP, FTP o `file://`. La parola chiave `filesystem` espande i file in `/usr/lib/live/config-preseed/`; `medium` espande i file in `minios/config-preseed/` sul supporto live rilevato. I file locali espliciti possono usare percorsi come `file:///run/initramfs/memory/data/minios/config-preseed/FILE` o `file:///PATH` nella root live. Le voci separate da barre verticali vengono elaborate nell’ordine specificato; i file espansi da una parola chiave seguono l’ordine dei glob della shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permette di impostare il nome host del sistema. Il valore predefinito è `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Seleziona la policy di rete cablata. Se non impostato e `dhcp` lasciano invariato il valore predefinito dell’immagine. `static` scrive la configurazione per il backend selezionato; `off` disabilita la configurazione automatica IPv4 per l’interfaccia selezionata.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Seleziona l’interfaccia cablata. Se omesso per `static` o `off`, viene selezionata automaticamente l’unica interfaccia cablata non loopback; in caso di zero o più candidati è necessario specificare un valore esplicito.
- **live-config.network-address=IPV4 | network-address=IPV4**: Imposta l’indirizzo IPv4 statico.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Imposta la lunghezza del prefisso IPv4 da 0 a 32. Il valore statico predefinito è `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Imposta il gateway IPv4 opzionale.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Imposta gli indirizzi dei server DNS opzionali, separati da virgola.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Seleziona il backend di rete. `auto` preferisce NetworkManager e in caso contrario utilizza ifupdown. Se forzato, `ifupdown` rende l’interfaccia non gestita da NetworkManager quando entrambi gli stack sono installati.
- **live-config.username=USERNAME | username=USERNAME**: Permette di impostare il nome utente che verrà creato per l’accesso automatico. Il valore predefinito è `live`.
- **live-config.user-default-groups=GRUPPO1,GRUPPO2,...GRUPPOn \| user-default-groups=GRUPPO1,GRUPPO2,...GRUPPOn**: Imposta i gruppi supplementari per l'utente creato per l'accesso automatico. I nomi dei gruppi possono essere separati da virgole o spazi. Il valore predefinito MiniOS è `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="NOME COMPLETO UTENTE" \| user-fullname="NOME COMPLETO UTENTE"**: Permette di impostare il nome completo dell'utente creato per l'accesso automatico. Il valore predefinito MiniOS è `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permette di impostare la password di root in chiaro.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permette di impostare la password di root in forma cifrata.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permette di impostare la password utente in chiaro.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permette di impostare la password utente in forma cifrata.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permette di impostare la lingua del sistema, ad esempio `de_CH.UTF-8`. Il valore predefinito è `en_US.UTF-8`. Se la lingua selezionata non è già disponibile sul sistema, verrà generata automaticamente al volo.
- **live-config.timezone=FUSO\_ORARIO \| timezone=FUSO\_ORARIO**: Permette di impostare il fuso orario del sistema, ad esempio `Europe/Zurich`. Il valore predefinito è `UTC`.
- **live-config.keyboard-model=MODELLO\_TASTIERA \| keyboard-model=MODELLO\_TASTIERA**: Permette di modificare il modello di tastiera. Nessun valore predefinito impostato.
- **live-config.keyboard-layouts=LAYOUT1,LAYOUT2,...LAYOUTn \| keyboard-layouts=LAYOUT1,LAYOUT2,...LAYOUTn**: Permette di modificare i layout di tastiera. Se ne vengono specificati più di uno, gli strumenti dell'ambiente desktop consentiranno di cambiarli sotto X11. Nessun valore predefinito impostato.
- **live-config.keyboard-variants=VARIANTE\_TASTIERA1,VARIANTE\_TASTIERA2,...VARIANTE\_TASTIERAn \| keyboard-variants=VARIANTE\_TASTIERA1,VARIANTE\_TASTIERA2,...VARIANTE\_TASTIERAn**: Permette di modificare le varianti di tastiera. Se ne vengono specificate più di una, deve essere indicato lo stesso numero di valori dei layout di tastiera, poiché verranno abbinati uno a uno nell'ordine specificato. Sono ammessi valori vuoti. Gli strumenti dell'ambiente desktop consentiranno di passare da ciascuna coppia layout-variante sotto X11. Nessun valore predefinito impostato.
- **live-config.keyboard-options=OPZIONI\_TASTIERA \| keyboard-options=OPZIONI\_TASTIERA**: Permette di modificare le opzioni della tastiera. Nessun valore predefinito impostato.
- **live-config.sysv-rc=SERVIZIO1,SERVIZIO2,...SERVIZIOn \| sysv-rc=SERVIZIO1,SERVIZIO2,...SERVIZIOn**: Permette di disabilitare i servizi sysv tramite update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permette di scegliere se il sistema deve considerare l'orologio hardware impostato su UTC o meno. Il valore predefinito è `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permette di impostare l'x-session-manager tramite update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permette di impostare il driver xorg invece di rilevarlo automaticamente. Se viene specificato un ID PCI in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` all'interno del sistema live, il *DRIVER* viene forzato per questi dispositivi. Se sono presenti sia un parametro di avvio che un override, ha precedenza il parametro di avvio.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Consente di impostare la risoluzione xorg invece di rilevarla automaticamente, ad esempio 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Consente di impostare il driver WLAN invece di rilevarlo automaticamente. Se viene specificato un ID PCI in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` all'interno del sistema live, il *DRIVER* viene applicato per questi dispositivi. Se sono presenti sia un parametro di avvio che un override, il parametro di avvio ha la precedenza.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Consente di specificare la modalità modulo per la configurazione live. Se impostata su `merged`, il sistema aggiornerà gli account utente, ricostruirà le cache e aggiornerà le impostazioni dei pacchetti affinché le modifiche alla configurazione vengano integrate dinamicamente nel sistema in esecuzione.
- **live-config.link-user-dirs | link-user-dirs**: Collega le directory utente gestite al percorso configurato sul supporto dati MiniOS. È mutuamente esclusivo con la modalità bind e non è disponibile con nessuna modalità `toram` o quando la sessione di persistenza attiva è cifrata con LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Effettua il bind-mount delle directory utente gestite dal percorso configurato sul supporto dati MiniOS. È mutuamente esclusivo con la modalità link e presenta le stesse `toram` e restrizioni di cifratura della sessione attiva.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Imposta il percorso relativo al supporto utilizzato da `link-user-dirs` o `bind-user-dirs`. Il valore predefinito è `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Recupera ed esegue file arbitrari da un file temporaneo nel sistema live in esecuzione. Gli URL sono gestiti da `wget` e possono utilizzare HTTP, FTP o `file://`; gli interpreti richiesti e le altre dipendenze devono essere già installati. La parola chiave `filesystem` espande i file in `/usr/lib/live/config-hooks/`; `medium` espande i file in `minios/config-hooks/` sul supporto live rilevato (con fallback al percorso ISO nel componente hook). I file locali espliciti possono usare `file:///run/initramfs/memory/data/minios/config-hooks/FILE` o `file:///PATH` nella root live. Le voci separate da pipe vengono eseguite nell'ordine specificato; i file espansi da una parola chiave seguono l'ordine dei glob della shell. Esempi sono installati in `/usr/share/doc/live-config/examples/hooks/`.

> **Avviso di sicurezza:** `live-config` viene eseguito come root. Gli hook vengono resi eseguibili ed eseguiti come root, e i preseeds modificano il database debconf del sistema con privilegi di root. HTTP e FTP semplici non autenticano i contenuti scaricati e non offrono protezione dell'integrità. Preferire file locali verificati o trasporti autenticati affidabili con verifica indipendente dell'integrità; non utilizzare hook remoti o preseeds da reti non affidabili.

### MiniOS opzioni di storage anticipate

Queste opzioni vengono lette da `minios-boot` prima che vengano avviati i servizi ordinari. Richiedono una sessione persistente integra `perch` e non ne attivano una autonomamente.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` posiziona il journal di systemd e i normali file `/var/log` in una RAM limitata; le diagnostiche di avvio restano su storage persistente. Predefinito: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` posiziona gli archivi APT scaricati in una tmpfs limitata quando le condizioni RAM e swap lo permettono. I database dei pacchetti e le liste dei repository restano persistenti. Predefinito: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` richiede cache native del browser in RAM. Il componente `browser-cache` monta le directory cache selezionate dell'utente live dopo la creazione dell'account. Predefinito: `persistent`.

## Parametri di avvio (scorciatoie)

Per alcuni casi d'uso comuni in cui sarebbe necessario combinare diversi parametri individuali, **live-config** offre delle scorciatoie. Questo consente sia di avere il pieno controllo su tutte le opzioni, sia di mantenere la configurazione semplice.

- **live-config.noroot | noroot**: Disabilita la configurazione della password di root e le concessioni di privilegi sudo e PolicyKit MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controlla la configurazione di sudo per l'utente live. Il valore predefinito, e il comportamento storico MiniOS se non impostato, è `passwordless`. La modalità `password` mantiene l'accesso sudo ma richiede la password dell'utente live. La modalità `disabled` rimuove la concessione sudo MiniOS e mantiene l'utente live fuori dal gruppo sudo alla creazione. La scorciatoia `noroot` sovrascrive questa impostazione e disabilita in modo più ampio la configurazione dei privilegi di root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controlla le regole di PolicyKit MiniOS di convenienza. Il valore predefinito, e il comportamento storico MiniOS se non impostato, è `passwordless`. Le modalità `password` e `disabled` rimuovono questa regola, quindi si applica l'autenticazione PolicyKit standard della distribuzione. `disabled` non è una politica di negazione totale; usare `noroot` quando l'utente live non deve ottenere privilegi amministrativi.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Scrive una policy OpenSSH `PermitRootLogin` quando esplicitamente impostato e openssh-server è installato.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Scrive una policy OpenSSH `PasswordAuthentication` quando esplicitamente impostato e openssh-server è installato.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controlla la modalità XRDP quando xrdp è installato. `relaxed` mantiene i valori predefiniti storici MiniOS. `hardened` vincola XRDP a localhost, ripristina le impostazioni di sicurezza negoziate/alte e disabilita l'accesso root via XRDP. `disabled` disabilita e ferma XRDP tramite `minios-svc` se disponibile.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controlla la modalità di convenienza X11 MiniOS. `relaxed` mantiene la compatibilità storica. `hardened` rimuove l'opzione permissiva `-ac` del server X e rafforza `Xwrapper.config` se presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controlla se `/etc/issue` mostra i suggerimenti predefiniti per la password root/live MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controlla se live-config rilassa il blocco schermo. `relaxed` mantiene la comodità storica della live-session. `hardened` evita di disabilitare il blocco GNOME e abilita il blocco xscreensaver dove presente.
- **live-config.noautologin | noautologin**: Impedisce a live-config di configurare l'autologin su console e grafica. Non rimuove l'autologin già configurato in una sessione persistente.
- **live-config.nottyautologin | nottyautologin**: Impedisce a live-config di configurare l'autologin su console, senza influire sulla configurazione grafica. La configurazione persistente esistente non viene rimossa.
- **live-config.nox11autologin | nox11autologin**: Impedisce a live-config di configurare l'autologin del display manager, senza influire sulla configurazione TTY. La configurazione persistente esistente non viene rimossa.

## Parametri di avvio (opzioni speciali)

Per casi d'uso particolari esistono alcuni parametri di avvio speciali.

- **live-config.debug | debug**: Abilita l'output di debug in live-config.

## File di configurazione

**live-config** può essere configurato (ma non attivato) tramite file di configurazione. Qualsiasi parametro di boot supportato può essere inserito in `LIVE_CONFIG_CMDLINE`, e la maggior parte delle opzioni può essere impostata anche tramite variabili individuali. Il parametro `boot=live` rimane comunque necessario per attivare **live-config**.

**Nota:** Se si utilizzano file di configurazione, tutti i parametri di boot dovrebbero essere inseriti (preferibilmente) nella variabile **LIVE_CONFIG_CMDLINE**, oppure è possibile impostare variabili individuali. Se si usano variabili individuali, l’utente deve assicurarsi che tutte le variabili necessarie siano impostate per creare una configurazione valida.

`live-config` esegue il sourcing di `/etc/live/config.conf` e poi di `/etc/live/config.conf.d/*.conf` secondo l’ordine di shell glob. I frammenti successivi possono quindi sovrascrivere i valori del file principale o dei frammenti precedenti. Non esegue il sourcing separato di un secondo livello di configurazione del supporto.

Su supporti MiniOS, i file sorgente sono `minios/config.conf` e `minios/config.conf.d/*.conf`. Prima che `live-config` venga avviato, l’initramfs MiniOS sincronizza questi file con quelli runtime `/etc/live/` in base all’ora di modifica. Un file sorgente più recente sostituisce la sua controparte runtime; un file runtime più recente viene copiato indietro solo se la directory dati MiniOS selezionata è scrivibile. Se i timestamp sono uguali, non viene effettuata alcuna copia; i file mancanti vengono creati e i file non vengono eliminati. Questa è una sincronizzazione all’avvio, non un monitoraggio continuo. Vedi [File di configurazione](/reference/configuration/config.conf) per le regole complete di sincronizzazione e precedenza della riga di comando.

Come fallback per le implementazioni initramfs che non hanno preparato il file runtime, i wrapper di avvio systemd e SysV copiano `minios/config.conf` dal supporto rilevato solo quando `/etc/live/config.conf` è assente. Questo fallback non copia i frammenti di `config.conf.d`. L’initramfs LiveKit MiniOS standard attuale esegue invece la sincronizzazione descritta in precedenza.

I file frammento devono corrispondere a `*.conf`. Sono consigliati nomi come `vendor.conf` o `project.conf`. Scegliere i nomi lessicali con attenzione, poiché i frammenti successivi sovrascrivono quelli precedenti.

Il contenuto effettivo dei file di configurazione consiste in una o più delle seguenti variabili.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Questa variabile corrisponde alla riga di comando del bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Questa variabile corrisponde al parametro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Questa variabile corrisponde al parametro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Questa variabile corrisponde al parametro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Questa variabile corrisponde al `**live-config.hostname**=*HOSTNAME*` parametro. Il valore predefinito è `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Seleziona la modalità di gestione della rete cablata. `dhcp` e un valore non impostato non hanno effetto e non rimuovono un profilo statico MiniOS già creato.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Seleziona l'interfaccia cablata per la modalità `static` o `off` .
- **LIVE_NETWORK_ADDRESS=IPV4**: Imposta l'indirizzo IPv4 statico.
- **LIVE_NETWORK_PREFIX=PREFIX**: Imposta la lunghezza del prefisso statico; il valore predefinito è `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Imposta il gateway statico (opzionale).
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Imposta i server DNS opzionali separati da virgola.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Seleziona il backend utilizzato.

Il componente di rete registra `/var/lib/live/config/network` dopo aver scritto correttamente la policy. Rimuovere questo timbro per applicare una policy modificata su un sistema persistente. Per eliminare un profilo statico precedente, utilizzare `network-method=off` o rimuovere manualmente il profilo e il timbro gestiti da MiniOS.

- **LIVE_USERNAME=USERNAME**: Questa variabile corrisponde al `**live-config.username**=*USERNAME*` parametro. Il valore predefinito è `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Questa variabile corrisponde al `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` parametro.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Questa variabile corrisponde al `**live-config.user-fullname**="*USER FULLNAME*"` parametro.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Questa variabile corrisponde al `**live-config.root-password**=*PASSWORD*` parametro. Specifica la password di root in chiaro.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Questa variabile corrisponde al `**live-config.root-password-crypted**=*PASSWORD*` parametro. Specifica la password di root in formato cifrato.
- **LIVE_USER_PASSWORD=PASSWORD**: Questa variabile corrisponde al `**live-config.user-password**=*PASSWORD*` parametro. Specifica la password dell'utente in chiaro.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Questa variabile corrisponde al `**live-config.user-password-crypted**=*PASSWORD*` parametro. Specifica la password dell'utente in forma criptata.
- **LIVE_CONFIG_NOROOT=true|false**: Questa variabile corrisponde al `**live-config.noroot**` parametro e disabilita la configurazione dei privilegi root, sudo e PolicyKit quando impostata su `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Questa variabile corrisponde al `**live-config.sudo-mode**=...` parametro. Se non impostata, MiniOS mantiene il comportamento storico di sudo senza password.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Questa variabile corrisponde al `**live-config.polkit-mode**=...` parametro. `password` e `disabled` rimuovono la regola senza password MiniOS e ripristinano l'autenticazione PolicyKit standard della distribuzione.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Questa variabile corrisponde al `**live-config.ssh-permit-root-login**=...` parametro.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Questa variabile corrisponde al `**live-config.ssh-password-authentication**=...` parametro.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Questa variabile corrisponde al `**live-config.xrdp-mode**=...` parametro.
- **LIVE_X11_MODE=relaxed|hardened**: Questa variabile corrisponde al `**live-config.x11-mode**=...` parametro.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Questa variabile corrisponde al `**live-config.issue-password-hints**=...` parametro.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Questa variabile corrisponde al `**live-config.lockscreen-mode**=...` parametro.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Questa variabile corrisponde al `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` parametro.
- **LIVE_TIMEZONE=TIMEZONE**: Questa variabile corrisponde al `**live-config.timezone**=*TIMEZONE*` parametro.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Questa variabile corrisponde al `**live-config.keyboard-model**=*KEYBOARD_MODEL*` parametro.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Questa variabile corrisponde al `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*` parametro.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Questa variabile corrisponde al `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*` parametro.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Questa variabile corrisponde al `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*` parametro.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Questa variabile corrisponde al `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*` parametro.
- **LIVE_UTC=yes|no**: Questa variabile corrisponde al `**live-config.utc**=**yes**|no` parametro.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Questa variabile corrisponde al `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*` parametro.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Questa variabile corrisponde al `**live-config.xorg-driver**=*XORG_DRIVER*` parametro.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Questa variabile corrisponde al `**live-config.xorg-resolution**=*XORG_RESOLUTION*` parametro.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Questa variabile corrisponde al `**live-config.wlan-driver**=*WLAN_DRIVER*` parametro.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Questa variabile corrisponde al `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` parametro.
- **LIVE_LINK_USER_DIRS=true|false**: Abilita o disabilita i collegamenti dalle directory dati standard dell'utente all'unità scrivibile MiniOS. Il parametro di avvio corrispondente è semplicemente il `live-config.link-user-dirs` flag. La modalità link non può essere combinata con la modalità bind o qualsiasi modalità `toram` .
- **LIVE_BIND_USER_DIRS=true|false**: Abilita o disabilita i mount bind delle directory dati standard dell'utente dall'unità scrivibile MiniOS. Il parametro di avvio corrispondente è semplicemente il `live-config.bind-user-dirs` flag. La modalità bind non può essere combinata con la modalità link o qualsiasi modalità `toram` .
- **LIVE_USER_DIRS_PATH=PATH**: Questa variabile corrisponde al parametro `**live-config.user-dirs-path**=*PATH*`. Specifica un percorso sicuro all'interno del drive FAT32, exFAT o NTFS MiniOS. Il valore predefinito è `/minios/userdata`; segmenti con punto o directory superiore non sono ammessi.

La configurazione dei supporti utente non unisce mai automaticamente due directory non vuote. Una directory locale non vuota viene migrata solo se la destinazione dei media è vuota. Quando la funzione è disattivata, i dati dei media gestiti vengono copiati indietro prima che i collegamenti vengano rimossi. L'attivazione e la copia dei media utente sono bloccate mentre la sessione di persistenza attiva è crittografata con LUKS, impedendo che i dati della sessione vengano spostati su supporti MiniOS non crittografati. Questa decisione si basa sullo stato reale della crittografia attiva: `perchencrypt=luks` richiede la crittografia solo quando si crea una nuova sessione e non descrive una sessione esistente. Una convalida o copia non riuscita lascia le directory utente esistenti inalterate e registra il motivo in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Questa variabile contiene lo stato specificato dal parametro `live-config.module-mode` (o `module-mode`). Quando è impostata su `merged`, il sistema live applica gli aggiornamenti (tramite minios-update-users, minios-update-cache e minios-update-dpkg) per unire le configurazioni personalizzate con l'ambiente di base.
- **LIVE_CONFIG_DEBUG=true|false**: Questa variabile corrisponde al parametro `**live-config.debug**`.

## MiniOS variabili di cache e log

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, e **LIVE_BROWSER_CACHE=persistent|volatile**: Politiche MiniOS indipendenti all'avvio. Funzionano anche in `config.conf.d` e `LIVE_CONFIG_CMDLINE`. Non abilitano la persistenza da sole. Vedi [File di configurazione](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Il componente `browser-cache` legge la politica `minios-boot` persistente dopo la creazione dell'utente live e monta in bind le directory cache native del browser in un filesystem RAM condiviso e limitato. Una policy Firefox separata disabilita la cache su disco senza spostare i profili browser. Se questo componente viene escluso tramite `components=` o `nocomponents=`, la sola richiesta browser-cache anticipata non imposta i mount per utente.

Gli helper in modalità merged mantengono gli errori normali, ma creano tracce dettagliate dei comandi e copie di debug solo quando `LIVE_CONFIG_DEBUG=true`.

# PERSONALIZZAZIONE

**live-config** può essere facilmente personalizzato per progetti downstream o per uso locale.

## Aggiunta di nuovi componenti di configurazione

I progetti downstream possono inserire i propri componenti in /usr/lib/live/config senza dover fare altro: i componenti verranno eseguiti automaticamente durante l'avvio.

I componenti è preferibile inserirli in un proprio pacchetto debian. Un pacchetto di esempio con un componente di esempio si trova in /usr/share/doc/live-config/examples.

## Rimozione di componenti di configurazione esistenti

Non è ancora realmente possibile rimuovere i componenti in modo sicuro senza dover fornire una versione modificata localmente del pacchetto **live-config** o usare dpkg-divert. Tuttavia, lo stesso risultato si ottiene disabilitando i componenti interessati tramite il meccanismo live-config.nocomponents, vedi sopra. Per evitare di dover specificare ogni volta i componenti disabilitati tramite parametro di avvio, è consigliabile usare un file di configurazione, vedi sopra.

I file di configurazione per il sistema live stesso è meglio inserirli in un proprio pacchetto debian. Un pacchetto di esempio con una configurazione di esempio si trova in /usr/share/doc/live-config/examples.

# COMPONENTI

**live-config** attualmente include i seguenti componenti in /usr/lib/live/config.

- **nss-systemd**: rimuove o ripristina il modulo NSS di systemd in /etc/nsswitch.conf per aggirare un noto problema di systemd.
- **debconf**: permette di applicare file preseed arbitrari posizionati sul supporto live o su un server http/ftp.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: imposta il file /etc/issue con un banner di benvenuto e le informazioni sulla distribuzione.
- **live-debconfig_passwd**: configura le password di utente e root tramite live-debconfig.
- **user-setup**: aggiunge un account utente live.
- **user-groups**: aggiunge l'utente live ai gruppi supplementari dichiarati dai moduli installati. I gruppi già esistenti elencati in `/usr/share/live/config/user-default-groups.d/*.groups` vengono applicati dopo la creazione dell'utente e ad ogni esecuzione successiva di live-config.
- **root-setup**: imposta o aggiorna la password di root e configura l'ambiente dell'utente root.
- **sudo**: concede i privilegi sudo all'utente live.
- **user-ssh-keys**: sincronizza i file `authorized_keys.<username>` specifici dell'utente tra il supporto live e le home directory degli utenti. Supporta più utenti contemporaneamente (ad es. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) e riconosce le forme bare `toram`, `toram=trim`, e `toram=full` come forme di avvio RAM quando decide se il supporto live può essere aggiornato in sicurezza.
- **user-media**: collega o effettua il bind-mount delle directory utente validate sul supporto dati MiniOS scrivibile esistente, con migrazione sicura e copia indietro quando disabilitato.
- **locales**: configura le localizzazioni.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura il nome utente in xorg.service e applica la modalità X11 quando supportata.
- **gdm3**: configura l'autologin in gdm3.
- **sddm**: configura l'autologin in sddm.
- **kdm**: configura l'autologin in kdm.
- **lightdm**: configura l'autologin in lightdm.
- **lxdm**: configura l'autologin in lxdm.
- **nodm**: configura l'autologin in nodm.
- **slim**: configura l'autologin in slim.
- **xinit**: configura l'autologin con xinit.
- **keyboard-configuration**: configura la tastiera.
- **sysvinit**: configura l'autologin su console tramite `/etc/inittab` quando sysvinit è installato. Le scorciatoie `noautologin` e `nottyautologin` sopprimono questa configurazione.
- **sysv-rc**: configura sysv-rc disabilitando i servizi elencati.
- **apport**: disabilita apport.
- **gnome-panel-data**: disabilita il pulsante di blocco schermo.
- **gnome-power-manager**: disabilita l'ibernazione.
- **gnome-screensaver**: controlla il blocco schermo GNOME secondo `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: disabilita la procedura guidata di migrazione KDE (squeeze e successivi).
- **kde-services**: disabilita alcuni servizi KDE indesiderati (squeeze e successivi).
- **policykit**: concede privilegi utente tramite PolicyKit.
- **ssl-cert**: rigenera i certificati SSL snake-oil.
- **xrdp**: configura la modalità XRDP rilassata, rafforzata o disabilitata quando XRDP è installato.
- **anacron**: disabilita anacron.
- **util-linux**: disabilita il servizio hwclock di util-linux.
- **login**: disabilita lastlog.
- **xserver-xorg**: configura xserver-xorg.
- **network**: configura la policy IPv4 cablata persistente tramite un file keyfile NetworkManager sicuro o uno stanza ifupdown. Viene eseguito prima dei servizi di rete, valida tutti i valori e registra solo dopo una scrittura riuscita.
- **openssh-server**: ricrea le chiavi host OpenSSH e scrive la policy richiesta esplicitamente per root-login o password-authentication.
- **xfce4-panel**: configura xfce4-panel con le impostazioni predefinite.
- **xscreensaver**: controlla il blocco xscreensaver secondo `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura i driver WLAN broadcom-sta.
- **hyperv**: configura le impostazioni X11 per migliorare la compatibilità sulle piattaforme Microsoft Hyper-V.
- **ntfs3**: gestisce le regole udev per il supporto NTFS3.
- **config-module-mode**: configura la modalità modulo di sistema e aggiorna cache, impostazioni utente e dpkg.
- **hooks**: permette di eseguire comandi arbitrari da un file posizionato sul supporto live o su un server http/ftp.

# FILE

- `minios/config.conf` sul supporto dati selezionato MiniOS (copia sorgente)
- `minios/config.conf.d/*.conf` sul supporto dati selezionato MiniOS (frammenti sorgente)
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
- `minios/log/YYYYMMDD_HHMMSS/` sui supporti dati selezionati scrivibili quando l'esportazione dei log è abilitata
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` sul supporto live rilevato (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` sul supporto live rilevato (`medium` preseeds)

# VEDI ANCHE

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# SITO WEB

Ulteriori informazioni su **minios-live-config** sono disponibili nel suo [repository GitHub](https://github.com/minios-linux/minios-live-config). Informazioni generali MiniOS sono disponibili su [minios.dev](https://minios.dev).

# BUG

I bug possono essere segnalati nel [minios-live-config issue tracker](https://github.com/minios-linux/minios-live-config/issues).

# AUTORE

**live-config** è stato originariamente scritto da Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Dal 2016, lo sviluppo è stato portato avanti dal Debian Live team. Dal 2025, lo sviluppo della versione modificata **minios-live-config** è continuato dal team Live MiniOS.
