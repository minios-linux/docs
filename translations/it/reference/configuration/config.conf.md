---
updated: 2026-09-26
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

Un'immagine MiniOS attuale genera una `config.conf` con questa struttura generale:
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
`LIVE_CONFIG_CMDLINE` fornisce opzioni dopo che la root MiniOS è stata assemblata. Parametri come `from=`, `load=`, `toram`, e `perchdir=` devono essere veri parametri di avvio del kernel; inserirli solo in `LIVE_CONFIG_CMDLINE` è troppo tardi per influenzare l'initramfs. Le opzioni di storage-policy `log-storage=`, `apt-cache=`, e `browser-cache=` sono un'eccezione specifica: `minios-boot` le legge da `LIVE_CONFIG_CMDLINE` prima dell'avvio dei servizi normali.
:::

## Parametri standard

| Parametro | Riconfigurabile | Significato |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sì | Opzioni aggiuntive live-config. La vera riga di comando del kernel viene aggiunta in seguito e ha la precedenza in caso di opzioni ripetute. |
| `LIVE_HOSTNAME` | Sì | Nome host del sistema. |
| `LIVE_USERNAME` | Solo al primo avvio | Nome dell'utente live creato durante la configurazione iniziale. |
| `LIVE_USER_FULLNAME` | Solo al primo avvio | Nome completo dell'utente live. |
| `LIVE_USER_DEFAULT_GROUPS` | Solo al primo avvio | Gruppi supplementari assegnati alla creazione dell'utente live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Solo al primo avvio | Hash crittografico per la password dell'utente live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Solo al primo avvio | Hash crittografico per la password di root. |
| `LIVE_CONFIG_NOROOT` | Solo al primo avvio | Se abilitato, disattiva la configurazione dei privilegi di root-password, sudo e PolicyKit tramite MiniOS. |
| `LIVE_LOCALES` | Sì | Una o più locale di sistema. |
| `LIVE_TIMEZONE` | Sì | Fuso orario del sistema, ad esempio `Europe/Berlin` o `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sì | Modello tastiera XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sì | Layout tastiera separati da virgola. |
| `LIVE_KEYBOARD_OPTIONS` | Sì | Opzioni tastiera XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sì | Varianti associate ai layout configurati, separate da virgola. |
| `LIVE_CONFIG_DEBUG` | Sì | Abilita l'output di debug di live-config se impostato su `true`. |
| `LIVE_LINK_USER_DIRS` | Sì | Collega le directory utente gestite alla posizione configurata su supporti MiniOS scrivibili. Non disponibile in modalità bind, in qualsiasi modalità `toram` o con una sessione di persistenza LUKS attiva. |
| `LIVE_BIND_USER_DIRS` | Sì | Effettua il bind-mount delle directory utente gestite dalla posizione configurata su supporti MiniOS scrivibili. Non disponibile in modalità link, in qualsiasi modalità `toram` o con una sessione di persistenza LUKS attiva. |
| `LIVE_USER_DIRS_PATH` | Sì | Posizione usata dalla modalità link/bind delle directory utente. |
| `LIVE_MODULE_MODE` | Sì | Seleziona `simple` o `merged` l'integrazione del modulo live-config. |
| `LIVE_LOG_STORAGE` | Sì | `persistent` (predefinito) oppure `volatile` per i log di sistema ordinari. Le diagnostiche di avvio restano persistenti; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Sì | `persistent` (predefinito) oppure `volatile` per gli archivi APT scaricati; lo stato dei pacchetti e le liste dei repository restano persistenti. |
| `LIVE_BROWSER_CACHE` | Sì | `persistent` (predefinito) oppure `volatile` per i percorsi cache standard dei browser nativi. I profili browser restano persistenti. |
| `DEFAULT_TARGET` | Sì | Target di avvio: `graphical.target`, `multi-user.target`, o `rescue.target`. |
| `ENABLE_SERVICES` | Sì | Servizi abilitati all'avvio tramite elenco separato da virgole in `minios-svc`. |
| `DISABLE_SERVICES` | Sì | Servizi disabilitati all'avvio tramite elenco separato da virgole in `minios-svc`. |
| `EXPORT_LOGS` | Sì | Quando `true`, esporta i log di avvio MiniOS e live-config su supporti MiniOS scrivibili. |

Il file generato non è un elenco esaustivo di tutto ciò che è supportato da `minios-live-config`. È possibile aggiungere manualmente variabili aggiuntive per la preconfigurazione di rete cablata, sicurezza, hook, preseeding, Xorg e altri componenti. Vedi [live-config](/reference/configuration/live-config) per la documentazione completa.

Il componente `user-media` rifiuta sia l'attivazione che la copia indietro se la sessione di persistenza attiva è criptata con LUKS. Utilizza lo stato di cifratura effettivo in esecuzione: il parametro `perchencrypt=luks` del kernel richiede la cifratura solo durante la creazione di una nuova sessione e non descrive una sessione esistente.

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

## Impostazioni early-userspace MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, e le tre `LIVE_*` policy di storage sopra sono impostazioni di boot MiniOS e non variabili dei componenti live-config tardivi. MiniOS le applica prima che il sistema di init normale prenda il controllo; `minios-boot` gestisce le tre policy di storage. Sono tutte **Riconfigurabile: Sì**.

I parametri di boot corrispondenti `default-target=`, `enable-services=`, e `disable-services=` hanno la precedenza per l'avvio corrente. Il parametro `text` forza `multi-user.target`.

Le build Toolbox e Ultra attuali aggiungono `ssh` a `ENABLE_SERVICES`. Per disattivare esplicitamente SSH, inserirlo in `DISABLE_SERVICES`; rimuoverlo soltanto da `ENABLE_SERVICES` non ne richiede la disattivazione.

Con `EXPORT_LOGS="true"`, i supporti MiniOS scrivibili ricevono i log di avvio qui sotto:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

I log runtime corrispondenti sono `/var/log/minios/minios-boot.log` e `/var/log/live/config.log`.

## Policy cache e log per una sessione persistente

Per ridurre le scritture durante una sessione `perch`, aggiungi le impostazioni in modo indipendente:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Accettano anche `persistent`, il valore predefinito. `minios-boot` accetta le stesse impostazioni da `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), oppure da parametri del kernel. I frammenti successivi sostituiscono quelli precedenti, il blob di parametri ha la precedenza sulle chiavi dei file e i parametri reali del kernel hanno la precedenza finale. Le tre opzioni sono indipendenti e non richiedono di per sé la persistenza. Un initrd compatibile pubblicizza `perch-storage-v1` in `/run/initramfs/etc/minios-initramfs-storage`; il Configuratore MiniOS avvisa se l'initrd attuale non lo pubblicizza.

Le policy si applicano solo a un avvio successivo se la persistenza viene effettivamente attivata su uno storage scrivibile e durevole. Con `toram`, persistenza fallita, o **Avviare senza salvare**, la policy volatile richiesta non è considerata come garanzia che qualcosa verrà salvato. Il componente browser-cache viene eseguito dopo `minios-boot`, dopo la creazione dell'utente live. Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per i limiti esatti RAM, i percorsi browser supportati, le condizioni di fallback e i log che restano sul supporto.

## Origine, copia runtime e precedenza

La directory dati MiniOS selezionata normalmente contiene questi file sorgente:

| Directory dati selezionata | Sistema in esecuzione |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Su supporti montati normalmente sono visibili come `minios/config.conf` e `minios/config.conf.d/*.conf`, spesso sotto `/run/initramfs/memory/data/` mentre il sistema è in esecuzione.

La sincronizzazione avviene all'avvio; non è un monitor di file:

- La copia più recente di `config.conf` vince in base all'orario di modifica. Una copia più recente sul supporto viene copiata nella root live. Una copia runtime più recente viene copiata indietro solo se la directory dati MiniOS selezionata è scrivibile.
- Ogni file `config.conf.d/*.conf` viene sincronizzato indipendentemente per basename usando le stesse regole di timestamp e scrivibilità. I file non vengono eliminati da nessuna delle due parti.
- Se l'orologio è precedente all'ultima sincronizzazione registrata, il confronto dei timestamp viene saltato e vengono copiati solo i file di destinazione mancanti.
- `toram=trim` copia `config.conf` ma omette `config.conf.d/`. Una copia completa `toram` copia l'albero dati, ma la sincronizzazione successiva avviene verso la copia RAM invece che verso il supporto sorgente scollegato.
Dopo la sincronizzazione, `live-config` legge prima `/etc/live/config.conf` e poi `/etc/live/config.conf.d/*.conf` nell'ordine dei glob di shell. Un frammento successivo può quindi sostituire un valore del file principale o di un frammento precedente.

La riga di comando reale del kernel viene aggiunta a `LIVE_CONFIG_CMDLINE`. Se un'opzione si ripete più volte, prevale l'occorrenza più recente nella riga di comando del kernel. Per le tre policy di storage, `minios-boot` legge prima il file principale sincronizzato, poi i suoi frammenti, poi il blob delle opzioni e infine la riga di comando reale del kernel; prevale l'ultima impostazione.

Puoi aggiungere variabili shell specifiche del progetto a `config.conf` o ai suoi frammenti e leggerle dalle copie runtime. Valorizza come stringhe shell e non inserire spazi intorno a `=`.
