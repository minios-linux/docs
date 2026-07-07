# Ricostruzione ISO

Questa guida spiega come ricostruire e personalizzare le immagini ISO di MiniOS utilizzando gli strumenti integrati. Che tu voglia creare versioni leggere, aggiungere software personalizzato o distribuire sistemi personalizzati, questi strumenti ti permettono di reimpacchettare facilmente il tuo sistema live in una nuova ISO avviabile.

## Panoramica

MiniOS offre potenti strumenti per ricostruire immagini ISO direttamente da un sistema live in esecuzione. Questo ti consente di:

- **Rimuovere software indesiderato** per creare distribuzioni più leggere
- **Aggiungere moduli personalizzati** con software aggiuntivo
- **Creare versioni specializzate** per casi d’uso specifici
- **Distribuire sistemi personalizzati** ad altri utenti
- **Creare supporti di installazione** con la tua configurazione attuale

## Avvio rapido

Il modo più semplice per creare una ISO dal tuo sistema attuale:

```bash
sudo sb2iso
```

Questo crea `minios-YYYYMMDD_HHMM.iso` nella directory corrente con tutti i moduli attualmente caricati.

## Strumento principale: sb2iso

**sb2iso** è lo strumento principale per ricostruire immagini ISO. Legge il tuo sistema live attuale e lo impacchetta in un file ISO avviabile.

### Utilizzo di base

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Opzioni del comando

| Opzione | Descrizione | Esempio |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Esclude file/moduli che corrispondono al pattern | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Specifica il nome del file di output | `--name minios_custom.iso` |
| `--menu TYPE` | Imposta la lingua o il tipo di menu | `--menu ru_RU` oppure `--menu multilang` |
| `--help` | Mostra le informazioni di aiuto | `--help` |
| `--version` | Mostra la versione | `--version` |

### Tipi di menu supportati

- **multilang** (predefinito) - Menu multilingua con selezione della lingua
- **Codici lingua** - Menu in singola lingua: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Esempi pratici

### Creazione di versioni leggere

**Rimuovere applicazioni pesanti:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Creare sistema solo modalità testo:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Rimuovere applicazioni multimediali:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Aggiunta di software personalizzato

**Aggiungere strumenti di sviluppo:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Aggiungere applicazioni per il gaming:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### ISO specifiche per lingua

**Creare ISO localizzata in russo:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Creare ISO in tedesco:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Distribuzioni professionali/educative

**ISO educativa con strumenti per l’apprendimento:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**ISO aziendale:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Workflow di personalizzazione avanzata

### 1. Prepara il tuo sistema

Inizia con un sistema MiniOS pulito e personalizzalo:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Crea moduli personalizzati

Salva le tue modifiche come moduli:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Testa i tuoi moduli

Prima di creare la ISO finale, testa i tuoi moduli:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Crea la ISO finale

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Gestione dei moduli

### Comprendere la numerazione dei moduli

I moduli vengono caricati in ordine numerico:
- **00-core** - Sistema base (sempre incluso)
- **01-kernel** - Kernel e driver
- **02-firmware** - Firmware hardware
- **03-gui-base** - Componenti base dell’interfaccia grafica
- **04-desktop** - Ambiente desktop
- **05-apps** - Applicazioni
- **06+** - Moduli aggiuntivi

### Comandi di gestione moduli

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Esclusione di pattern di contenuto

L’opzione `--exclude` utilizza espressioni regolari per identificare i percorsi dei file. Pattern comuni:

### Esclusioni di applicazioni

```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### Esclusioni di componenti di sistema

```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Esclusioni combinate

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Requisiti di sistema

### Esecuzione di sb2iso

- **Sistema**: Deve essere avviato da MiniOS live
- **Privilegi**: Richiesto accesso root (`sudo`)
- **Memoria**: RAM sufficiente per i file temporanei
- **Spazio**: Spazio libero per la ISO di output (tipicamente 1-4 GB)

### Requisito dei file di boot

**sb2iso** richiede che i file di boot siano disponibili. Se hai caricato il sistema in RAM, usa:

```bash
# Boot with full RAM copy
toram=full
```

Oppure assicurati che i file di boot siano accessibili dal supporto originale.

## Risoluzione dei problemi

### Problemi comuni

**"Impossibile trovare la directory sorgente di MiniOS"**
- Assicurati di essere su un sistema MiniOS live
- Verifica che i file di boot siano disponibili
- Prova a usare il parametro di boot `toram=full`

**"File richiesto non trovato"**
- I file di boot potrebbero mancare
- Assicurati di usare un sistema MiniOS completo

**Errore nella creazione della ISO**
- Controlla lo spazio disponibile su disco
- Verifica di avere i permessi di scrittura
- Assicurati che nessun file sia in uso durante la creazione

**Modulo non incluso**
- Controlla che il file del modulo esista e sia leggibile
- Verifica il formato del modulo (.sb)
- Assicurati che ci sia spazio sufficiente per tutti i moduli

### Informazioni di debug

Abilita l’output verboso per la risoluzione dei problemi:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Best practice

### Pianificazione della tua ISO

1. **Parti da zero**: Inizia con un sistema MiniOS pulito
2. **Test approfonditi**: Valida tutte le personalizzazioni prima di creare la ISO
3. **Documenta le modifiche**: Tieni traccia delle modifiche effettuate
4. **Considerazioni sulle dimensioni**: Monitora la dimensione della ISO in base alle esigenze di distribuzione

### Organizzazione dei moduli

1. **Raggruppamento logico**: Raggruppa software correlato nei moduli
2. **Numerazione corretta**: Usa numeri di modulo appropriati
3. **Test**: Testa ogni modulo singolarmente
4. **Dipendenze**: Comprendi le dipendenze tra i moduli

### Preparazione alla distribuzione

1. **Convenzione di denominazione**: Usa nomi ISO descrittivi
2. **Documentazione**: Includi istruzioni per l’uso
3. **Supporto linguistico**: Considera utenti internazionali
4. **Ottimizzazione delle dimensioni**: Rimuovi componenti non necessari

## Integrazione con altri strumenti

### Creazione di moduli personalizzati

Prima di ricostruire la ISO, puoi creare moduli personalizzati:

- **apt2sb** - Crea moduli dall’installazione di pacchetti
- **script2sb** - Crea moduli tramite script personalizzati
- **chroot2sb** - Crea moduli in modo interattivo
- **savechanges** - Salva le modifiche attuali del sistema

Consulta la guida [Creazione Moduli](/development/Creating-Modules.md) per istruzioni dettagliate.

### Compilazione dal sorgente

Per una personalizzazione completa, valuta la compilazione dal sorgente:

- **minios-live** - Costruisce sistemi completi da zero
- **minios-cmd** - Interfaccia di build semplificata

Consulta la guida [Building MiniOS](/development/Building-MiniOS.md) per la compilazione dal sorgente.

## Conclusione

Gli strumenti di ricostruzione ISO di MiniOS offrono un modo potente per personalizzare e redistribuire sistemi Linux. Che tu stia creando distribuzioni specializzate, rimuovendo software indesiderato o aggiungendo funzionalità personalizzate, questi strumenti rendono semplice impacchettare il tuo sistema live in un’immagine ISO professionale.

Inizia con personalizzazioni semplici e passa gradualmente a distribuzioni più complesse man mano che acquisisci familiarità con il sistema a moduli e le opzioni disponibili.
