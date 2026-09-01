---
updated: 2026-08-31
---

# config.conf

`config.conf` è il principale file di preconfigurazione di MiniOS. Su un supporto MiniOS normale viene memorizzato come `minios/config.conf`. Durante l'avvio, l'initramfs lo sincronizza con `/etc/live/config.conf` nel sistema assemblato.

Utilizza questo file per preparare come avviare MiniOS e come inizializzare una nuova sessione persistente. È principalmente un meccanismo di preconfigurazione rivolto agli amministratori, non un sostituto degli strumenti di configurazione standard dell'ambiente desktop in esecuzione.

## Riconfigurazione

La colonna **Riconfigurabile** qui sotto utilizza questi significati:

- **Sì** — l'impostazione può essere modificata e applicata nuovamente a un successivo avvio.
- **Solo al primo avvio** — l'impostazione viene utilizzata quando viene creato per la prima volta lo stato persistente corrispondente e normalmente non viene riapplicata ai successivi avvii.

Questa distinzione fa parte del comportamento che gli utenti devono conoscere. I file di stato interni `live-config` sono dettagli di implementazione e non li sostituiscono.

## Configurazione generata

Un'immagine MiniOS attuale genera un `config.conf` con questa struttura generale:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
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
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
I valori esatti dipendono dall'immagine e dalla configurazione di build.

::: warning `LIVE_CONFIG_CMDLINE` non è la riga di comando dell'initramfs
`LIVE_CONFIG_CMDLINE` fornisce opzioni a **live-config** dopo che il root di MiniOS è stato assemblato. Parametri come `from=`, `load=`, `toram` e `perchdir=` devono essere veri parametri di avvio del kernel; inserirli solo in `LIVE_CONFIG_CMDLINE` è troppo tardi per influenzare l'initramfs.
:::

## Parametri standard

| Parametro | Riconfigurabile | Significato |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sì | Opzioni aggiuntive per live-config. La vera riga di comando del kernel viene aggiunta successivamente e prevale in caso di opzioni ripetute. |
| `LIVE_HOSTNAME` | Sì | Nome host del sistema. |
| `LIVE_USERNAME` | Solo al primo avvio | Nome dell'utente live creato durante la configurazione iniziale. |
| `LIVE_USER_FULLNAME` | Solo al primo avvio | Nome completo dell'utente live. |
| `LIVE_USER_DEFAULT_GROUPS` | Solo al primo avvio | Gruppi supplementari assegnati alla creazione dell'utente live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Solo al primo avvio | Hash crittografico per la password dell'utente live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Solo al primo avvio | Hash crittografico per la password di root. |
| `LIVE_CONFIG_NOROOT` | Solo al primo avvio | Se abilitato, sopprime la configurazione della password di root MiniOS, sudo e PolicyKit. |
| `LIVE_LOCALES` | Sì | Una o più localizzazioni di sistema. |
| `LIVE_TIMEZONE` | Sì | Fuso orario di sistema, ad esempio `Europe/Berlin` o `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sì | Modello tastiera XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sì | Layout tastiera separati da virgola. |
| `LIVE_KEYBOARD_OPTIONS` | Sì | Opzioni tastiera XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sì | Varianti, separate da virgola, abbinate ai layout configurati. |
| `LIVE_CONFIG_DEBUG` | Sì | Abilita l'output di debug di live-config quando impostato a `true`. |
| `LIVE_LINK_USER_DIRS` | Sì | Collega le directory utente gestite alla posizione configurata su supporti MiniOS scrivibili. |
| `LIVE_BIND_USER_DIRS` | Sì | Effettua il bind-mount delle directory utente gestite dalla posizione configurata su supporti MiniOS scrivibili. |
| `LIVE_USER_DIRS_PATH` | Sì | Posizione utilizzata dalla modalità link/bind delle directory utente. |
| `LIVE_MODULE_MODE` | Sì | Seleziona l'integrazione del modulo live-config `simple` o `merged`. |
| `DEFAULT_TARGET` | Sì | Target di avvio: `graphical.target`, `multi-user.target` o `rescue.target`. |
| `ENABLE_SERVICES` | Sì | Servizi separati da virgola abilitati all'avvio tramite `minios-svc`. |
| `DISABLE_SERVICES` | Sì | Servizi separati da virgola disabilitati all'avvio tramite `minios-svc`. |
| `EXPORT_LOGS` | Sì | Quando `true`, esporta MiniOS e i log di avvio di live-config su supporti MiniOS scrivibili. |

Il file generato non è un elenco esaustivo di tutto ciò che è supportato da `minios-live-config`. Variabili aggiuntive per la preconfigurazione della rete cablata, la sicurezza, hook, preseeding, Xorg e altri componenti possono essere aggiunte manualmente. Consulta [live-config](/reference/configuration/live-config) per la documentazione completa.

## Preconfigurazione rete cablata

MiniOS può preconfigurare una policy **IPv4 cablata** tramite il componente live-config `network`. Questa funzione è pensata per la preconfigurazione amministrativa di un sistema prima dell'avvio sull'hardware di destinazione.
Ad esempio:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Queste impostazioni sono **Solo al primo avvio** per la policy di rete persistente. Dopo l'applicazione con successo, il componente registra `/var/lib/live/config/network`.
Modificare i valori non sovrascrive una sessione persistente già configurata a meno che quello stato non venga deliberatamente azzerato.

`LIVE_NETWORK_METHOD=static` scrive una policy statica. `off` disabilita l'IPv4 automatico per l'interfaccia selezionata. Un valore non impostato o `dhcp` lascia invariata la configurazione di rete esistente dell'immagine. `LIVE_NETWORK_BACKEND=auto` preferisce NetworkManager e, in caso contrario, utilizza ifupdown.

Questa funzione non configura il Wi-Fi. Dopo l'avvio, la gestione ordinaria delle reti cablate e wireless è affidata a NetworkManager. Consulta [Networking](/using-minios/Networking) per l'uso della rete in runtime e [live-config](/reference/configuration/live-config) per tutte le variabili di rete.

## Impostazioni early-userspace di MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES` e `EXPORT_LOGS` sono impostazioni MiniOS e non variabili live-config. Vengono lette da `minios-boot` prima che il sistema di init normale prenda il controllo e sono tutte **Riconfigurabili: Sì**.

I parametri di avvio corrispondenti `default-target=`, `enable-services=` e `disable-services=` hanno precedenza per l'avvio corrente. Il parametro `text` forza `multi-user.target`.

Le build Toolbox e Ultra attuali aggiungono `ssh` a `ENABLE_SERVICES`. Per disattivare esplicitamente SSH, inserirlo in `DISABLE_SERVICES`; rimuoverlo semplicemente da `ENABLE_SERVICES` non richiede la disattivazione.

Con `EXPORT_LOGS="true"`, i supporti MiniOS scrivibili ricevono i log di avvio qui sotto:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

I log di runtime corrispondenti sono `/var/log/minios/minios-boot.log` e `/var/log/live/config.log`.

## Origine, copia runtime e precedenza

La directory dati selezionata di MiniOS normalmente contiene questi file sorgente:

| Directory dati selezionata | Sistema in esecuzione |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Su supporti normalmente montati sono visibili come `minios/config.conf` e `minios/config.conf.d/*.conf`, spesso sotto `/run/initramfs/memory/data/` mentre il sistema è in esecuzione.

La sincronizzazione avviene all'avvio; non è un monitor di file:

- La copia più recente di `config.conf` prevale in base all'orario di modifica. Una copia più recente sul supporto viene copiata nel root live. Una copia runtime più recente viene copiata indietro solo quando la directory dati selezionata di MiniOS è scrivibile.
- Ogni file `config.conf.d/*.conf` viene sincronizzato indipendentemente per basename usando le stesse regole di timestamp e scrivibilità. I file non vengono eliminati da nessuna delle due parti.
- Se l'orologio è precedente all'ultimo tempo di sincronizzazione registrato, il confronto dei timestamp viene saltato e vengono riempiti solo i file di destinazione mancanti.
- `toram=trim` copia `config.conf` ma omette `config.conf.d/`. `toram` completo copia l'albero dati, ma la sincronizzazione a quel punto prende come riferimento la copia RAM invece della sorgente staccata.
Dopo la sincronizzazione, `live-config` legge prima `/etc/live/config.conf` e poi `/etc/live/config.conf.d/*.conf` in ordine di shell glob. Un frammento successivo può quindi sostituire un valore del file principale o di un frammento precedente.

La vera riga di comando del kernel viene aggiunta a `LIVE_CONFIG_CMDLINE`. Per un'opzione che si presenta più volte, prevale l'occorrenza più recente sulla riga di comando del kernel. `minios-boot` dà allo stesso modo la precedenza ai parametri kernel riconosciuti rispetto alle impostazioni corrispondenti da `/etc/live/config.conf`.

Puoi aggiungere variabili shell specifiche del progetto a `config.conf` o ai suoi frammenti e leggerle dalle copie runtime. Metti tra virgolette i valori come stringhe shell e non inserire spazi attorno a `=`.

## Riferimenti correlati

- [Parametri di avvio](/reference/Boot-Parameters) — parametri che devono essere inseriti nella vera riga di comando del kernel e override di live-config.
- [live-config](/reference/configuration/live-config) — riferimento completo a parametri, variabili, componenti e stati di late-userspace.
- [Modalità di avvio](/using-minios/Boot-Modes) — come la persistenza e `toram` influenzano la memorizzazione della configurazione.
