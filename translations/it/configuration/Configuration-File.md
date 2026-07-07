# File di configurazione

MiniOS si differenzia dalla maggior parte delle distribuzioni flash classiche perché alcuni parametri possono essere impostati prima dell’avvio tramite un semplice file di configurazione `config/config.conf`, riducendo al minimo il lavoro necessario per creare i propri moduli e sistemi embedded. In alternativa, alcuni parametri possono essere definiti anche nei parametri di boot. Le opzioni di boot hanno priorità sul file di configurazione. Alcuni parametri in questo file sono di servizio ed è meglio non modificarli. Di seguito un esempio di file di configurazione standard:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Descrizione dei parametri

**Legenda:**
- 🔒 **Solo alla prima esecuzione** – Applicato solo al primo avvio, non può essere modificato nei successivi  
- 🔄 **Riconfigurabile** – Può essere modificato ad ogni avvio e riapplicato

| Parametro | Riconfigurabile | Significato | Esempio |
| --------- | -------------- | ----------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Parametri aggiuntivi di avvio per live-config. Vedi `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Nome del nodo associato al sistema. Vedi `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nome dell’utente il cui profilo verrà creato al primo avvio. Se specifichi <strong>root</strong> come username, non verrà creato alcun profilo utente e l’accesso avverrà tramite il profilo <strong>root</strong>. Vedi `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nome completo dell’utente principale. Vedi `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Elenco dei gruppi dell’utente principale, separati da virgola. Vedi `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Password dell’utente principale in forma criptata (hash). Usa `mkpasswd -m yescrypt` per generarla. Vedi `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Password dell’utente privilegiato **root** in forma criptata (hash). Usa `mkpasswd -m yescrypt` per generarla. Vedi `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Se impostato, disabilita l’accesso come root e disattiva sudo/policykit per l’utente. Vedi `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Imposta la locale. È possibile specificare più valori separati da virgola. Vedi `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Imposta il fuso orario (es. "Europe/Berlin", "Etc/UTC"). Vedi `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Imposta il modello di tastiera (es. "pc105"). Vedi `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Imposta i layout di tastiera (separati da virgola, es. "us,de"). Vedi `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Imposta le opzioni della tastiera (es. "grp:alt_shift_toggle,grp_led:scroll"). Vedi `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Imposta le varianti della tastiera (separate da virgola, possono essere vuote o corrispondere ai layout). Vedi `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Abilita l’output di debug per live-config. Vedi `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Se true, le directory utente saranno collegate dal percorso specificato. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Se true, le directory utente saranno montate in bind dal percorso specificato. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Percorso delle directory dati utente sulla chiavetta. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Seleziona la modalità operativa del sistema. Se vuoi installare software solo tramite moduli, usa "merged". Se vuoi installare software tramite apt, usa "simple". Il valore predefinito è "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Target systemd di avvio. Vedi `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Abilita servizi all’avvio (separati da virgola). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Disabilita servizi all’avvio (separati da virgola). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Se true, quando si avvia da un supporto scrivibile, i log di MiniOS vengono copiati nella cartella minios/logs durante l’avvio. | EXPORT_LOGS="false" |


**Per maggiori dettagli sulla maggior parte dei parametri, consulta:**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Per i target systemd: `man systemd.special`

## Importante!

* Il server SSH è abilitato di default per garantire la compatibilità con initrd di terze parti; per disabilitarlo, non basta rimuoverlo da `ENABLE_SERVICES`.

A cos’altro può servire il file `config.conf`? Puoi usarlo per impostare parametri personalizzati nei tuoi script durante la creazione dei moduli. Al primo avvio, viene copiato nella cartella /etc/minios, poi il file `/etc/live/config.conf` viene monitorato automaticamente e, in caso di modifiche, sovrascrive il file di configurazione sulla chiavetta, se questa è scrivibile. In questo modo puoi inserire le tue variabili in config.conf e recuperarle da `/etc/live/config.conf` nei tuoi script, indipendentemente dal tipo di initrd utilizzato.
