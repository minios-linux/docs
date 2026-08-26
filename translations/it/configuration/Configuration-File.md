# File di configurazione

I supporti di avvio di MiniOS memorizzano la configurazione principale in `minios/config.conf`. Durante l'avvio, l'initramfs la sincronizza in `/etc/live/config.conf` nella root live assemblata. Gli script nel sistema in esecuzione dovrebbero quindi leggere `/etc/live/config.conf`; `/etc/minios/config.conf` e `config/config.conf` non sono percorsi di configurazione utilizzati dal codice di avvio attuale.

I parametri di avvio possono sovrascrivere le impostazioni corrispondenti del file. Di seguito è riportato un esempio di `config.conf` standard:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
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
- 🔒 **Solo una volta** - Applicato solo al primo avvio, non può essere modificato nei successivi
- 🔄 **Riconfigurabile** - Può essere modificato a ogni avvio e riapplicato

| Parametro | Riconfigurabile | Significato | Esempio |
| --------- | -------------- | ---------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Opzioni aggiuntive per live-config. `nottyautologin` viene memorizzato qui invece di essere inserito in ogni voce di avvio. Vedi `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | 🔄 | Nome del nodo associato al sistema. Vedi `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nome dell'utente il cui profilo verrà creato al primo avvio. Se specifichi il nome utente <strong>root</strong>, nessun profilo utente verrà creato e l'accesso verrà effettuato utilizzando il profilo <strong>root</strong>. Vedi `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nome completo per l'utente principale. Vedi `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Elenco di gruppi separati da virgola per l'utente principale. Vedi `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Password dell'utente principale in forma criptata (hash). Usa `mkpasswd -m yescrypt` per generarla. Vedi `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Password dell'utente privilegiato **root** in forma criptata (hash). Usa `mkpasswd -m yescrypt` per generarla. Vedi `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Se impostato, disabilita l'accesso come root e disabilita sudo/policykit per l'utente. Vedi `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Imposta la locale. È possibile specificare più valori separati da virgola. Vedi `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Imposta il fuso orario (es. "Europe/Berlin", "Etc/UTC"). Vedi `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Imposta il modello di tastiera (es. "pc105"). Vedi `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Imposta i layout di tastiera (separati da virgola, es. "us,de"). Vedi `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Imposta le opzioni della tastiera (es. "grp:alt_shift_toggle,grp_led:scroll"). Vedi `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Imposta le varianti di tastiera (separate da virgola, possono essere vuote o corrispondere ai layout). Vedi `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Abilita l'output di debug per live-config. Vedi `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Se impostato a true, le directory utente verranno collegate dal percorso specificato. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Se impostato a true, le directory utente verranno montate in bind dal percorso specificato. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Percorso delle directory dati utente sulla chiavetta USB. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Seleziona la modalità operativa del sistema. Se prevedi di installare software esclusivamente tramite moduli, usa "merged". Se vuoi installare software tramite apt, usa "simple". Il valore predefinito è "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Target systemd in cui avviare il sistema. Vedi `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Abilita servizi all'avvio (separati da virgola). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Disabilita servizi all'avvio (separati da virgola). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Se impostato a true e la directory dati MiniOS selezionata è scrivibile, i log di avvio vengono copiati in `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**Per maggiori dettagli sulla maggior parte dei parametri, vedi:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Per i target systemd: `man systemd.special`

## Importante!

* Il server SSH è abilitato di default per compatibilità con initrd di terze parti; per disabilitarlo, non basta rimuoverlo da `ENABLE_SERVICES`.

## Origine, copia runtime e precedenza

La directory dati MiniOS selezionata è normalmente la directory `minios/` sul supporto di avvio. I suoi percorsi di configurazione e le relative copie runtime sono:

| Directory dati selezionata | Sistema in esecuzione |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Per un supporto normalmente montato questi file sorgente sono visibili come `minios/config.conf` e `minios/config.conf.d/*.conf`, spesso sotto `/run/initramfs/memory/data/`. Non vengono caricati direttamente da `live-config`. L'initramfs li sincronizza con i percorsi runtime prima di eseguire `minios-boot`; vedi [Modalità di avvio](/configuration/Boot-Modes.md) per sapere dove avviene questo passaggio nella sequenza di boot.

La sincronizzazione viene eseguita all'avvio, non tramite un monitor di file:

- La copia più recente di `config.conf` vince in base all'orario di modifica. Una copia sorgente più recente viene copiata nella root live. Una copia runtime più recente viene copiata indietro solo se la directory dati selezionata è scrivibile.
- Ogni file `config.conf.d/*.conf` viene sincronizzato indipendentemente per basename usando le stesse regole di modifica e scrivibilità. I file non vengono eliminati da nessuna delle due parti.
- Se l'orologio è antecedente all'ultima sincronizzazione registrata, il confronto dei timestamp viene saltato e vengono riempiti solo i file di destinazione mancanti.
- `toram=trim` copia `config.conf` ma omette `config.conf.d/`; vedi [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md). La copia completa `toram` copia l'intero albero dati, ma la sincronizzazione poi prende di mira la copia in RAM invece che il supporto staccato.

Dopo la sincronizzazione, `live-config` legge prima `/etc/live/config.conf` e poi `/etc/live/config.conf.d/*.conf` in ordine di shell glob, quindi un frammento successivo può sostituire un valore precedente. Aggiunge la riga di comando effettiva del kernel a `LIVE_CONFIG_CMDLINE`; per le opzioni ripetute lì, prevale l'occorrenza successiva nella riga di comando del kernel. Allo stesso modo, `minios-boot` legge `/etc/live/config.conf` per le sue impostazioni anticipate supportate e dà precedenza ai parametri kernel riconosciuti.

Puoi aggiungere variabili shell specifiche del progetto a questi file e leggerle da `/etc/live/config.conf` o dai frammenti a runtime. Racchiudi i valori tra virgolette come stringhe shell e non inserire spazi attorno a `=`.

Il log MiniOS iniziale è `/var/log/minios/minios-boot.log`, mentre l'output finale `live-config` è `/var/log/live/config.log`. Con `EXPORT_LOGS="true"`, entrambi gli alberi vengono copiati in `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` quando la directory dati selezionata è scrivibile.
