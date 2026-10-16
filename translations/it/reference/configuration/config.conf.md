---
updated: 2026-10-15
---

# config.conf

`config.conf` è il principale file di preconfigurazione di MiniOS. Su un normale supporto MiniOS viene salvato in `minios/config.conf`. Durante l'avvio, l'initramfs lo sincronizza con `/etc/live/config.conf` nel sistema assemblato.

Usa questo file per preparare l'avvio di MiniOS e l'inizializzazione di una nuova sessione persistente. È principalmente un meccanismo di preconfigurazione destinato agli amministratori, non un'alternativa ai normali strumenti di configurazione del desktop in esecuzione.

## Riconfigurazione

La colonna **Riconfigurabile** qui sotto usa i seguenti significati:

- **Sì** — l'impostazione può essere modificata e applicata nuovamente al successivo avvio.
- **Solo al primo avvio** — l'impostazione viene usata quando viene creato per la prima volta lo stato persistente corrispondente e normalmente non viene applicata di nuovo agli avvii successivi.

Questa distinzione è importante per il comportamento che gli utenti devono conoscere. I file di stato interni di `live-config` sono dettagli di implementazione e non sostituiscono questa distinzione.

## Configurazione generata

Un'immagine attuale di MiniOS genera un file `config.conf` con questa struttura generale:
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
`LIVE_CONFIG_CMDLINE` fornisce opzioni dopo che è stato assemblato il root MiniOS. Parametri come `from=`, `load=`, `toram` e `perchdir=` devono essere parametri di avvio effettivi del kernel; inserirli solo in `LIVE_CONFIG_CMDLINE` è troppo tardi per influire sull'initramfs. Le opzioni relative ai criteri di archiviazione `log-storage=`, `apt-cache=` e `browser-cache=` costituiscono un'eccezione specifica: `minios-boot` le legge da `LIVE_CONFIG_CMDLINE` prima dell'avvio dei servizi normali.
:::

## Parametri standard

| Parametro | Riconfigurabile | Significato |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sì | Opzioni aggiuntive di configurazione live. La riga di comando effettiva del kernel viene aggiunta in seguito e prevale in caso di opzioni ripetute. |
| `LIVE_HOSTNAME` | Sì | Nome host del sistema. |
| `LIVE_USERNAME` | Solo al primo avvio | Nome dell'utente live creato durante la configurazione iniziale. |
| `LIVE_USER_FULLNAME` | Solo al primo avvio | Nome completo dell'utente live. |
| `LIVE_USER_DEFAULT_GROUPS` | Solo al primo avvio | Gruppi supplementari assegnati alla creazione dell'utente live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Solo al primo avvio | Hash Crypt della password dell'utente live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Solo al primo avvio | Hash Crypt della password di root. |
| `LIVE_CONFIG_NOROOT` | Solo al primo avvio | Se abilitato, disattiva la configurazione della password di root, di sudo e dei privilegi di PolicyKit per l'utente MiniOS. |
| `LIVE_LOCALES` | Sì | Una o più impostazioni locali di sistema. |
| `LIVE_TIMEZONE` | Sì | Fuso orario del sistema, ad esempio `Europe/Berlin` o `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sì | Modello di tastiera XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sì | Layout di tastiera separati da virgole. |
| `LIVE_KEYBOARD_OPTIONS` | Sì | Opzioni della tastiera XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sì | Varianti separate da virgole, associate ai layout configurati. |
| `LIVE_CONFIG_DEBUG` | Sì | Abilita l'output di debug di live-config se impostato su `true`. |
| `LIVE_LINK_USER_DIRS` | Sì | Collega le directory utente gestite alla posizione configurata su un supporto scrivibile MiniOS. Non disponibile con la modalità bind, qualsiasi modalità `toram` o una sessione persistente attiva con cifratura LUKS. |
| `LIVE_BIND_USER_DIRS` | Sì | Monta con bind le directory utente gestite dalla posizione configurata su un supporto scrivibile MiniOS. Non disponibile con la modalità link, qualsiasi modalità `toram` o una sessione persistente attiva con cifratura LUKS. |
| `LIVE_USER_DIRS_PATH` | Sì | Posizione usata dalla modalità link/bind per le directory utente. |
| `LIVE_MODULE_MODE` | Sì | Seleziona l'integrazione del modulo live-config `simple` o `merged`. |
| `LIVE_LOG_STORAGE` | Sì | `persistent` (predefinito) oppure `volatile` per i normali log di sistema. La diagnostica di avvio resta persistente; vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Sì | `persistent` (predefinito) oppure `volatile` per gli archivi APT scaricati; lo stato dei pacchetti e gli elenchi dei repository restano persistenti. |
| `LIVE_BROWSER_CACHE` | Sì | `persistent` (predefinito) oppure `volatile` per i percorsi standard della cache del browser nativo. I profili del browser restano persistenti. |
| `DEFAULT_TARGET` | Sì | Obiettivo di avvio: `graphical.target`, `multi-user.target` o `rescue.target`. |
| `ENABLE_SERVICES` | Sì | Servizi separati da virgole, abilitati all'avvio tramite `minios-svc`. |
| `DISABLE_SERVICES` | Sì | Servizi separati da virgole, disabilitati all'avvio tramite `minios-svc`. |
| `EXPORT_LOGS` | Sì | Quando `true`, esporta MiniOS e i log di avvio di live-config su un supporto scrivibile MiniOS. |

Il file generato non è un elenco esaustivo di tutto ciò che supporta `minios-live-config`. È possibile aggiungere manualmente altre variabili per la preconfigurazione della rete cablata, il livello di sicurezza, gli hook, il preseeding, Xorg e altri componenti. Consulta [live-config](/reference/configuration/live-config) per la documentazione completa.

Il componente `user-media` impedisce sia l'attivazione sia la copia dei dati durante una sessione persistente attiva cifrata con LUKS. Usa lo stato effettivo della cifratura in fase di esecuzione: il parametro del kernel `perchencrypt=luks` richiede la cifratura solo quando si crea una nuova sessione e non descrive una sessione esistente.

## Preconfigurazione della rete cablata

MiniOS può preconfigurare una policy IPv4 **cablata** tramite il componente `network`live-config. Questa funzionalità è pensata per la preconfigurazione amministrativa di un sistema prima dell'avvio sull'hardware di destinazione.
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

Queste impostazioni vengono applicate **solo al primo avvio** per la policy di rete persistente. Dopo averle applicate correttamente, il componente registra `/var/lib/live/config/network`.
La modifica dei valori non sovrascrive una sessione persistente già configurata, a meno che tale stato non venga reimpostato deliberatamente.

`LIVE_NETWORK_METHOD=static` imposta una policy statica. `off` disabilita IPv4 automatico per l'interfaccia selezionata. Un valore non impostato o `dhcp` lascia invariata la configurazione di rete esistente dell'immagine. `LIVE_NETWORK_BACKEND=auto` dà la precedenza a NetworkManager e, in caso di necessità, usa ifupdown.

Questa funzionalità non configura il Wi-Fi. Dopo l'avvio, la normale connettività cablata e wireless è gestita da NetworkManager. Consulta [Rete](/using-minios/Networking) per l'uso della rete durante l'esecuzione e [live-config](/reference/configuration/live-config) per tutte le variabili di rete.

## Impostazioni di MiniOS per l'ambiente di avvio iniziale

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS` e le tre policy di archiviazione sopra indicate sono `LIVE_*`impostazioni di avvio di MiniOS, non variabili del componente live-config applicate in un secondo momento. MiniOS le applica prima che subentri il normale sistema init; `minios-boot` gestisce le tre policy di archiviazione. Sono tutte **Riconfigurabili: sì**.

I parametri di avvio corrispondenti `default-target=`, `enable-services=` e `disable-services=` hanno la precedenza per l'avvio corrente. Il parametro `text` forza `multi-user.target`.

Le versioni attuali di Toolbox e Ultra aggiungono `ssh` a `ENABLE_SERVICES`. Per disattivare esplicitamente SSH, inseriscilo in `DISABLE_SERVICES`; rimuoverlo semplicemente da `ENABLE_SERVICES` non richiede la disattivazione.

Con `EXPORT_LOGS="true"`, i supporti MiniOS scrivibili ricevono i log di avvio nei percorsi seguenti:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

I log corrispondenti durante l'esecuzione si trovano in `/var/log/minios/minios-boot.log` e `/var/log/live/config.log`.

<a id="cache-and-log-policy-for-a-persistent-session"></a>

## Policy di cache e log per una sessione persistente

Per ridurre le scritture durante una sessione `perch`, aggiungi le impostazioni separatamente:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Accettano anche `persistent`, il valore predefinito. `minios-boot` accetta le stesse impostazioni da `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), oppure dai parametri del kernel. I frammenti successivi sostituiscono quelli precedenti; il blocco di parametri prevale sulle chiavi dei file e, infine, prevalgono i parametri effettivi del kernel. Le tre opzioni sono indipendenti e non richiedono di per sé la persistenza. Un initrd compatibile segnala `perch-storage-v1` in `/run/initramfs/etc/minios-initramfs-storage`; il Configuratore MiniOS avvisa quando l'initrd corrente non lo segnala.

Le policy richiedono che l'attivazione della persistenza vada a buon fine, su uno spazio di archiviazione scrivibile durevole oppure in una sessione RAM scrivibile con informazioni `ram-origin` protette. La modalità `toram` da sola non determina la durata della sessione: `perchtoram=off` può mantenere una sessione sul supporto di archiviazione, mentre una sessione copiata deve comunque essere salvata. La persistenza non riuscita e **Avviare senza salvare** non sono sufficienti. I dati diagnostici di avvio vengono conservati separatamente dai normali log volatili, ma restano in memoria in una sessione copiata da RAM finché non vengono salvati. Il componente della cache del browser viene eseguito dopo la creazione dell'utente attivo. Consulta [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per i limiti RAM, i percorsi supportati e i requisiti di ammissione.

## Origine, copia durante l'esecuzione e precedenza

La directory dati MiniOS selezionata contiene di norma questi file sorgente:

| Directory dati selezionata | Sistema in esecuzione |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Sui supporti montati normalmente sono visibili come `minios/config.conf` e `minios/config.conf.d/*.conf`, spesso in `/run/initramfs/memory/data/` mentre il sistema è in esecuzione.

La sincronizzazione avviene all'avvio; non è un monitoraggio dei file:

- La copia più recente di `config.conf` prevale in base alla data di modifica. Una copia più recente sul supporto viene copiata nella root attiva. Una copia runtime più recente viene ricopiata sul supporto solo se la directory dati MiniOS selezionata è scrivibile.
- Ogni file `config.conf.d/*.conf` viene sincronizzato separatamente in base al nome, applicando le stesse regole relative alla data e alla scrivibilità. I file non vengono eliminati da nessuna delle due posizioni.
- Se l'orologio indica un'ora precedente all'ultima sincronizzazione registrata, il confronto delle date viene saltato e vengono aggiunti solo i file mancanti nella destinazione.
- `toram=trim` copia `config.conf` ma esclude `config.conf.d/`. La modalità completa `toram` copia l'albero dei dati, ma la sincronizzazione si rivolge quindi alla copia RAM anziché al supporto sorgente scollegato.
Dopo la sincronizzazione, `live-config` legge prima `/etc/live/config.conf` e poi `/etc/live/config.conf.d/*.conf` nell'ordine dei glob della shell. Un frammento successivo può quindi sostituire un valore del file principale o di un frammento precedente.

La riga di comando effettiva del kernel viene aggiunta a `LIVE_CONFIG_CMDLINE`. Se un'opzione è presente più volte, prevale quella che compare più avanti nella riga di comando del kernel. Per le tre policy di archiviazione, `minios-boot` legge il file principale sincronizzato, poi i suoi frammenti, quindi il blocco di opzioni e infine la riga di comando effettiva del kernel; prevale l'ultima impostazione.

Puoi aggiungere variabili shell specifiche del progetto a `config.conf` o ai relativi frammenti e leggerle dalle copie runtime. Racchiudi i valori tra virgolette come stringhe shell e non inserire spazi attorno a `=`.

## Riferimenti correlati

- [Parametri di avvio](/reference/Boot-Parameters) — parametri da inserire nella riga di comando effettiva del kernel e override di live-config.
- [live-config](/reference/configuration/live-config) — riferimento completo a parametri, variabili, componenti e stato del late userspace.
- [Modalità di avvio](/using-minios/Boot-Modes) — come la persistenza e `toram` influiscono sull'archiviazione della configurazione.
