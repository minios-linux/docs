# Guida al Rafforzamento della Sicurezza

Questa guida fornisce indicazioni pratiche per aumentare la sicurezza del tuo sistema MiniOS. Poiché MiniOS è un sistema live, le principali preoccupazioni riguardano la protezione dei dati utente su storage persistente e il controllo degli accessi al sistema in esecuzione. Le impostazioni predefinite privilegiano la comodità d’uso portatile, ma potrebbero non essere ottimali per tutti gli scenari. Le seguenti raccomandazioni ti aiuteranno a configurare il sistema per una sicurezza avanzata.

## Sicurezza degli Account Utente e Root

Per impostazione predefinita, MiniOS effettua il login automatico senza password. Questo garantisce comodità nell’uso portatile, ma può rappresentare un rischio di sicurezza in alcuni casi.

**Credenziali di default degli account:**
- **Utente**: `live` / `evil`  
- **Root**: `root` / `toor`

⚠️ **Queste credenziali sono pubblicamente conosciute e devono essere cambiate immediatamente per qualsiasi utilizzo in rete o in produzione.**

### Creazione di una Password Cifrata

Prima di configurare le password, si consiglia di creare un hash cifrato della password:

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Impostazione delle Password

Le password possono essere impostate in due modi: **è fortemente raccomandato** utilizzare password cifrate.

**Importante:** L’impostazione delle password e dei parametri degli account utente tramite parametri di avvio e file di configurazione ha effetto solo al primo avvio del sistema. Successivamente, le password possono essere cambiate solo tramite i metodi standard di Linux (`passwd`, `sudo passwd`).

#### Tramite Parametri di Avvio

Aggiungi i parametri alla riga di comando del kernel nel menu di avvio (GRUB per UEFI o SYSLINUX per BIOS):

**Per password cifrate (consigliato):**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**Per password in chiaro (sconsigliato):**
```
user-password='your_password'
root-password='root_password'
```

**Importante:** Le password in chiaro sono visibili nella riga di comando del kernel e possono essere lette da altri utenti del sistema.

#### Tramite File di Configurazione

Modifica il file `minios/config.conf` nella directory principale della chiavetta USB:

**Per password cifrate:**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**Per password in chiaro:**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Cambio delle Password Dopo l’Avvio

Dopo il primo avvio del sistema, le password possono essere cambiate utilizzando i comandi standard di Linux:

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Disabilitare il Login Automatico

Dopo aver impostato le password, disabilita il login automatico per richiedere l’autenticazione:

#### Tramite Parametri di Avvio

```
noautologin
```

#### Tramite File di Configurazione

```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Disabilitazione parziale dell’autologin:**
- `nox11autologin` - disabilita solo l’autologin grafico (il gestore accessi richiederà autenticazione)
- `nottyautologin` - disabilita solo l’autologin da console (già disabilitato di default)

### Gestione dei Privilegi Utente

Per impostazione predefinita, l’utente `live` ha pieni privilegi amministrativi senza richiesta di password sia in console (`sudo`) che nelle applicazioni grafiche (tramite polkit). Questo garantisce comodità nell’uso live, ma potrebbe essere necessario modificarlo per una maggiore sicurezza.

#### Abilitare la Richiesta Password per sudo

Per richiedere l’inserimento della password quando si utilizza `sudo`, eseguire dopo l’avvio del sistema:

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

Da questo momento, i comandi `sudo` richiederanno la password dell’utente.

#### Abilitare la Richiesta Password per le Applicazioni Grafiche

Per fare in modo che i programmi amministrativi grafici richiedano la password, rimuovere la regola polkit:

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

Dopo questa operazione, installatori software, impostazioni di sistema e altre applicazioni amministrative GUI richiederanno la password.

#### Disabilitazione Totale dei Diritti Amministrativi (`noroot`)

Per la massima sicurezza, puoi disabilitare completamente `sudo` e l’accesso root:

**Tramite parametri di avvio:**
```
noroot
```

**Tramite file di configurazione:**
```
LIVE_CONFIG_NOROOT=true
```

**Effetto:** Il comando `sudo` non funzionerà, il login root sarà disabilitato e non saranno disponibili azioni amministrative.

## Sicurezza di Rete

### Impostazioni SSH Predefinite

**Perché SSH è abilitato di default:** MiniOS è progettato come sistema di recupero e diagnostica per la manutenzione di hardware guasto. SSH è abilitato con impostazioni permissive per consentire l’accesso remoto quando il display locale non è disponibile, è danneggiato o si lavora su sistemi headless.

**Impostazioni SSH attuali:**
- Il servizio SSH è abilitato e si avvia automaticamente
- È consentito l’accesso root via SSH
- L’autenticazione tramite password è abilitata

**Implicazioni di sicurezza:** Questa configurazione comporta rischi su reti non affidabili, ma è necessaria per scenari di recupero.

### Disabilitare SSH

Se non è necessario l’accesso remoto, disabilita completamente SSH:

**Tramite parametri di avvio:**
```
disable-services=ssh,avahi-daemon
```

**Tramite file di configurazione:**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Configurare un Accesso SSH Sicuro

Se SSH è necessario, mettilo in sicurezza utilizzando i seguenti metodi:

#### 1. Impostare Password Forti

Utilizza i metodi di impostazione password descritti sopra.

#### 2. Autenticazione SSH con Chiave

Posiziona i file `authorized_keys` nella directory principale della chiavetta USB:

- `authorized_keys.root` - per l’utente root
- `authorized_keys.live` - per l’utente live
- `authorized_keys.username` - per altri utenti

Un componente del sistema li copierà automaticamente nelle home directory all’avvio.

#### 3. Rafforzamento della Sicurezza SSH

Dopo l’avvio del sistema, modifica la configurazione di SSH:

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Cambia le impostazioni con valori più sicuri:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Riavvia il servizio SSH:
```bash
sudo systemctl restart ssh
```

**Importante:** Testa sempre l’accesso SSH tramite chiave prima di disabilitare l’autenticazione con password.

## Sicurezza dell’Avvio

### UEFI Secure Boot

MiniOS è pienamente compatibile con Secure Boot, in quanto utilizza il kernel standard Debian con bootloader firmati. Secure Boot offre protezione contro malware pre-avvio (bootkit) ed è raccomandato per una maggiore sicurezza.

### Password BIOS/UEFI

Per la sicurezza fisica, imposta una password nel BIOS/UEFI del tuo computer per impedire che utenti non autorizzati avviino da altri dispositivi o modifichino le impostazioni di boot.
