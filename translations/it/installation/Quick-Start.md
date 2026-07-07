# Iniziare con MiniOS 🌟

Benvenuto in MiniOS, dove la flessibilità e portabilità di Linux incontrano la comodità e la facilità d’uso. Se sei nuovo su MiniOS, questa guida completa ti aiuterà a iniziare e a sfruttare al meglio il tuo sistema operativo.

## Passo 1: Scegli l’Edizione MiniOS Giusta 📦

MiniOS offre tre edizioni principali, ognuna pensata per casi d’uso specifici:

- **🚀 Standard** - L’affidabile tuttofare per le attività quotidiane
- **🧰 Toolbox** - Strumenti avanzati per utenti esperti
- **⚡ Ultra** - Tutto-in-uno con tutte le funzionalità incluse

Per descrizioni dettagliate delle funzionalità e del software incluso in ogni edizione, consulta [Informazioni su MiniOS](/about/About-MiniOS.md).

**Opzioni di download:**
- **Sito ufficiale**: [minios.dev](https://minios.dev) - Panoramica completa delle edizioni e download diretti
- **GitHub Releases**: [Ultime versioni](https://github.com/minios-linux/minios-live/releases) - Tutte le versioni e note di rilascio

Per l’elenco dettagliato dei pacchetti inclusi in ogni edizione, vedi la [Lista Pacchetti](/administration/Packages.md).

## Passo 2: Crea una Chiavetta USB Avviabile 🔌

**Metodi di installazione consigliati:**

### 🖥️ **Windows**

- **[Rufus](/installation/tools/Rufus.md)** ⭐ - Semplice e affidabile
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interfaccia grafica multipiattaforma
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ - Supporto multi-boot

### 🐧 **Linux**

- **[dd command](/installation/tools/dd.md)** ⭐ - Strumento da terminale veloce
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interfaccia grafica intuitiva

### 🍎 **macOS**

- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interfaccia grafica semplice
- **[dd command](/installation/tools/dd.md)** ⭐ - Strumento da terminale integrato

### 🏠 **Da MiniOS**

- **[MiniOS Installer](/installation/MiniOS-Installer.md)** - Strumento grafico integrato

**Metodi aggiuntivi:** [UNetbootin](/installation/tools/UNetbootin.md), [Drive Utility](/installation/tools/Drive-Utility.md), [Metodo Originale](/installation/tools/Original-Method.md)

### Requisiti Dimensione Unità

- **Standard (787 MB)**: minimo 2 GB
- **Toolbox (1,2 GB)**: minimo 4 GB
- **Ultra (1,7 GB)**: minimo 4 GB
- **Dimensione consigliata**: 8 GB o superiore per un utilizzo ottimale con persistenza delle modifiche

**Note importanti:**
- Ogni link sopra offre istruzioni dettagliate passo-passo
- I metodi consigliati (⭐) sono testati per affidabilità e facilità d’uso
- Scegli il metodo più adatto al tuo sistema operativo e al tuo livello di esperienza

## Passo 3: Avvia ed Esplora 🖥️

Dopo l’avvio da USB, esplora l’ambiente desktop di MiniOS:

**Funzionalità principali da scoprire**:
- Menu applicazioni (pannello in basso a sinistra)
- Impostazioni di sistema e preferenze
- Gestore file (Thunar)
- Applicazioni preinstallate (browser, suite office, utility)
- Opzioni di personalizzazione del desktop

L’ambiente desktop predefinito è XFCE, che offre un buon equilibrio tra funzionalità e prestazioni.

## Passo 4: Configurazione del Sistema 🌐

**Configura lingua di sistema, tastiera, fuso orario e altre preferenze:**

### 🔧 **Utilizzo di MiniOS Configurator** (Consigliato)

**Accesso:** Menu Applicazioni → Sistema → Configura MiniOS

**Principali impostazioni configurabili:**
- **🌍 Lingua & Locale**: Imposta la lingua di sistema (es. `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Fuso orario**: Configura il fuso orario (es. `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Tastiera**: Imposta layout e opzioni di cambio (es. `us,ru` con commutazione `Alt+Shift`)
- **👤 Utente**: Cambia nome utente, nome completo e gruppi
- **🔐 Password**: Imposta password sicure per utente e root
- **🖥️ Sistema**: Configura hostname, abilita/disabilita servizi
- **🔧 Avanzate**: Opzioni di avvio e comportamento del sistema

**Come si usa:**
1. Apri MiniOS Configurator dal menu di sistema
2. Naviga tra le schede per configurare i vari aspetti
3. Applica le modifiche e salva
4. **Riavvia per applicare le modifiche** - le impostazioni avranno effetto dopo il riavvio e saranno persistenti

**Nota tecnica:** MiniOS Configurator modifica `/etc/live/config.conf`, il file principale di configurazione di MiniOS che controlla il comportamento del sistema all’avvio. Per dettagli sui parametri e il loro funzionamento, consulta la guida al [File di Configurazione](/configuration/Configuration-File.md).

### 💻 **Alternativa: Configurazione da Terminale**

**Modifiche immediate (applicate subito):**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**Per modifiche persistenti dopo il riavvio:** Usa MiniOS Configurator o modifica direttamente `/etc/live/config.conf`.

### 📋 **Opzioni di Configurazione Aggiuntive**

- **Modifica diretta file**: Modifica manualmente `/etc/live/config.conf` per utenti avanzati
- **Configurazione all’avvio**: Usa [Parametri di Boot](/configuration/Boot-Parameters.md) per configurare il sistema prima dell’avvio
- **Guida file di configurazione**: Consulta [File di Configurazione](/configuration/Configuration-File.md) per riferimento dettagliato a config.conf
- **Pre-installazione**: Configura prima dell’installazione con [MiniOS Installer](/installation/MiniOS-Installer.md)

**Importante:** Le modifiche a `/etc/live/config.conf` (tramite MiniOS Configurator o modifica manuale) richiedono un riavvio per avere effetto. Gli strumenti da terminale come `localectl` e `timedatectl` applicano le modifiche subito ma potrebbero non essere persistenti senza la corretta configurazione.

## Passo 5: Installazione Software 🔄

MiniOS offre diversi metodi per installare software:

### 📦 **APT Package Manager**

Gestione pacchetti Debian di base - usa `man apt` per la guida completa ai comandi.

### 🔄 **Sistema Moduli**

Moduli SquashFS avanzati per software persistente - consulta la guida [Creazione Moduli](/development/Creating-Modules.md).

**Differenza principale:** Le installazioni tramite APT richiedono la persistenza per sopravvivere ai riavvii, mentre i moduli sono automaticamente persistenti.

## Passo 6: Persistenza dei Dati 💾

**Buone notizie:** MiniOS configura automaticamente la persistenza dei dati durante l’installazione! I tuoi file, impostazioni e software installati vengono salvati automaticamente.

### Come Funziona

- **Configurazione automatica**: Tutti i metodi di installazione creano la persistenza in automatico
- **Rilevamento intelligente**: Il sistema sceglie la modalità di persistenza ottimale per il file system della tua unità
- **Portatile**: I tuoi dati ti seguono sulla chiavetta USB

### Configurazione Avanzata

Per una configurazione personalizzata della persistenza, consulta la guida dettagliata al [File di Configurazione](/configuration/Configuration-File.md) e il riferimento ai [Parametri di Boot](/configuration/Boot-Parameters.md).

## Passo 7: Configurazione Sicurezza 🔐

### 👤 **Account Predefiniti**

- **Utente**: `live` / `evil`
- **Root**: `root` / `toor`

### 🔒 **Passaggi di Sicurezza Importanti**

1. **Cambia subito le password** - Le credenziali predefinite sono pubbliche
2. **Usa password forti e uniche** per tutti gli account

### Metodi di Configurazione Password

- **🔧 Consigliato**: Usa **MiniOS Configurator** (Menu Applicazioni → Sistema → Configura MiniOS → scheda Utente)
- **💻 Terminale**: `passwd live` e `sudo passwd root`
- **📋 Avanzato**: Consulta la guida [Rafforzamento Sicurezza](/administration/Security-Hardening.md) per una configurazione dettagliata

⚠️ **Non utilizzare mai le credenziali predefinite su sistemi collegati in rete!**

## Passo 8: Personalizzazione & Argomenti Avanzati 🛠️

### 🎨 **Personalizzazione Base**

- Temi desktop e sfondi tramite Impostazioni
- Layout del pannello e preferenze delle applicazioni
- Scorciatoie da tastiera e impostazioni di sistema

### 🚀 **Configurazione Avanzata**

- **Parametri di Boot**: [Riferimento completo](/configuration/Boot-Parameters.md) per l’ottimizzazione del sistema
- **Prestazioni**: [Guida all’ottimizzazione](/administration/Performance-Optimization.md) per una maggiore velocità
- **Hardware**: [Guida compatibilità](/installation/Hardware-Compatibility.md) per il supporto dispositivi

### 🔧 **Funzionalità Avanzate per Power User**

- **Build personalizzate**: [Compilare MiniOS](/development/Building-MiniOS.md) dal sorgente
- **Creazione moduli**: [Moduli avanzati](/development/Creating-Modules.md)
- **Ricostruzione ISO**: [Reimpacchettare il sistema live](/development/Rebuilding-ISO.md) in una ISO avviabile
- **Aggiornamenti kernel**: [Gestione kernel](/administration/Kernel-Management.md)

## Supporto & Risorse della Community 💬

### 📚 **Documentazione**

- **Sito ufficiale**: [minios.dev](https://minios.dev) - Ultime novità e download
- **Tutte le guide**: Disponibili in questa raccolta di documentazione

### 🐛 **Supporto & Segnalazione Problemi**

- **Segnalazione bug**: [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Codice sorgente**: [Repository GitHub](https://github.com/minios-linux/minios-live)

### 📖 **Per Approfondire**

- **Documentazione Debian**: [www.debian.org/doc](https://www.debian.org/doc/) - MiniOS è basato su Debian
- **Nozioni di base Linux**: Le guide generali su Linux sono valide anche per MiniOS

## Benvenuto in MiniOS! 🎉

Ora hai tutto ciò che ti serve per iniziare con MiniOS. Il sistema unisce la potenza di Linux alla comodità portatile - perfetto per il recupero di sistema, il computing portatile o l’uso quotidiano.

**Prossimi passi:** Scegli la tua edizione, crea la tua chiavetta USB e inizia a esplorare! 🚀
