---
updated: 2026-08-26
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT: Guida Completa all’Installazione Condizionale dei Pacchetti

**CondinAPT** è uno strumento versatile per automatizzare l’installazione dei pacchetti su qualsiasi sistema basato su Debian (Debian, Ubuntu e le loro derivate). La sua caratteristica principale è la possibilità di definire condizioni e regole complesse per l’installazione di ciascun pacchetto in base a configurazioni di sistema arbitrarie.

**Ambiti di Applicazione:**
- Sistemi di build per distribuzioni Linux
- Automazione della configurazione di server e workstation
- Deployment di diverse configurazioni di sistema
- Gestione dei pacchetti in container Docker
- Pipeline CI/CD per la preparazione degli ambienti
- Creazione di immagini di installazione personalizzate

## Indice

### Fondamenti

- [Come funziona e componenti principali](#how-it-works-and-core-components)
- [Guida rapida](#quick-start)
- [Utilizzo](#usage)

### Sintassi e funzionalità

- [Sintassi del file elenco pacchetti](#package-list-file-syntax)
- [Filtri e condizioni](#filters-and-conditions)
- [Code di installazione](#installation-queues)
- [Coda prioritaria](#priority-queue)

### Modalità di funzionamento

- [Modalità di funzionamento e Debug](#operating-modes-and-debugging)
- [Gestione degli errori e ripristino](#error-handling-and-recovery)

### Utilizzo avanzato

- [Funzionalità avanzate](#advanced-features)
- [Integrazione con i sistemi di build](#integration-with-build-systems)

### Esempi Pratici

- [Esempi di scenari reali](#examples-of-real-world-scenarios)
- [Consigli per l’ottimizzazione](#optimization-tips)
- [Risoluzione dei problemi](#troubleshooting)

**Funzionalità principali:**

*   **Installazione condizionale:** Installa i pacchetti in base a filtri flessibili (+, -).
*   **Configurazione esterna:** Separazione completa della logica (elenco pacchetti) dai dati (parametri di sistema).
*   **Code di installazione:** Suddividi il processo in fasi sequenziali per risolvere le dipendenze.
*   **Coda prioritaria:** Installazione garantita dei pacchetti critici come prima cosa.
*   **Logica complessa:** Supporto per operatori "AND" (`&&`), "OR" (`||`), oltre a filtri di gruppo (`+{a|b}`, `-{a&b}`).
*   **Leggibilità:** Supporto per commenti e righe vuote per strutturare gli elenchi.
*   **Retrocompatibilità:** Supporta elenchi di pacchetti semplici senza condizioni.

## Come funziona e componenti principali

CondinAPT opera con quattro file chiave:

1.  **Script `condinapt`:** Il cuore del sistema, contiene tutta la logica di elaborazione.

2.  **File di configurazione principale (`-c`):** Un file con variabili bash che descrivono l'ambiente corrente.

    Esempio (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **File di mappatura dei filtri (`-m`):** Collega prefissi brevi (usati nell'elenco pacchetti) ai nomi delle variabili presenti nel file di configurazione principale. Questo file è **opzionale**. Se un filtro non è presente nel file di mappatura, verrà utilizzato come nome variabile dal file di configurazione principale. Se la variabile non viene trovata, CondinAPT la dichiarerà vuota.

    Esempio (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **File elenco pacchetti (`-l`):** Il file principale che descrive cosa installare e in quali condizioni.

## Guida rapida

Per prendere rapidamente confidenza con CondinAPT, crea un semplice esempio:

**1. Crea il file di configurazione `config.conf`:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Crea l'elenco pacchetti `packages.list`:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Esegui l'installazione:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Oppure testa in modalità simulazione:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Utilizzo

### Riga di comando

```bash
./condinapt [OPTIONS]
```

| Flag         | Flag lunga                      | Argomento | Descrizione                                         |
| :----------- | :----------------------------- | :-------- | :-------------------------------------------------- |
| `-l`         | `--package-list`               | `PERCORSO`| **(Obbligatorio)** Percorso al file elenco pacchetti.|
| `-c`         | `--config`                     | `PERCORSO`| **(Obbligatorio)** Percorso al file di configurazione principale. |
| `-m`         | `--filter-mapping`             | `PERCORSO`| (Opzionale) Percorso al file di mappatura dei filtri.|
| `-P`         | `--priority-list`              | `PERCORSO`| (Opzionale) Percorso a un file di filtri di priorità. Il file contiene pattern regex per individuare i pacchetti. I pacchetti corrispondenti vengono spostati in una coda prioritaria (mantenendo i filtri). |
| `-s`         | `--simulation`                 |           | Modalità simulazione. I pacchetti non verranno installati. |
| `-C`         | `--check-only`                 |           | Controlla solo se i pacchetti sono già installati. Restituisce codice di uscita 1 se ci sono pacchetti non installati. Alla fine, mostra un comando per installare i pacchetti mancanti. |
| `-v` / `-vv` | `--verbose` / `--very-verbose` |           | Output dettagliato / molto dettagliato.              |
| `-x`         | `--xtrace`                     |           | Abilita il tracing dei comandi `set -x`.            |
| `-f`         | `--force`                      |           | Forza l'aggiornamento delle liste pacchetti prima dell'installazione. Di default, l'aggiornamento viene saltato se `/var/cache/apt/pkgcache.bin` esiste. |
| `-h`         | `--help`                       |           | Mostra l'aiuto.                                     |

## Sintassi del file elenco pacchetti

### Struttura di base

Questo è il cuore di CondinAPT. Tutta la logica viene descritta qui.

Ogni riga del file elenco pacchetti è composta da due parti principali:

1. **Nome del pacchetto con eventuale versione e specifica del rilascio**
2. **Filtri di condizione** - definiscono le condizioni in cui il pacchetto verrà installato

> **Base per tutti gli esempi seguenti:**
> Per tutti gli esempi successivi, si assume che vengano utilizzati i file `system.conf` e `filters.map` dalla sezione [Come funziona e componenti principali](#come-funziona-e-componenti-principali).
>
> *   `DISTRIBUTION` = "bookworm"
> *   `SYSTEM_TYPE` = "server"
> *   `ENVIRONMENT` = "production"

### Struttura del nome pacchetto

**Nome semplice:**
```
vim
```

**Versione del pacchetto:**
- `package=version` — requisito di versione flessibile. Se la versione richiesta non è disponibile, viene installata una versione disponibile.
  ```
  git=2.25.1
  ```
- `package==version` — requisito rigido. Se la versione non viene trovata, l'installazione si interrompe con errore.
  ```
  curl==7.68.0
  ```

**Specifica del rilascio:**
Il rilascio si specifica usando il simbolo `@`, che permette di collegare l'installazione a un ramo specifico del repository.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Struttura del file

*   **Nomi pacchetto:** Ogni pacchetto o condizione va scritto su una nuova riga.
*   **Commenti:** Le righe che iniziano con `#`, o il testo dopo `#` su una riga, vengono completamente ignorati.
*   **Righe vuote:** Ignorate e utili solo per separazione visiva.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filtri e condizioni

I filtri permettono di impostare condizioni aggiuntive per la selezione dei pacchetti. Confrontano i valori delle variabili di sistema (architettura, distribuzione, ambiente di lavoro) con quelli specificati nel file di configurazione.

#### Filtri singoli

*   **`+` (Positivo):** La condizione è vera se il valore della variabile **corrisponde**.
    **Formato:** `+<prefisso>=<valore>`
    
    *   **Riga:** `nginx +st=server`
    *   **Analisi:** `SYSTEM_TYPE` è uguale a "server". La condizione è vera.
    *   **Risultato:** `nginx` verrà installato.

*   **Più filtri positivi con lo stesso prefisso:**
    Agiscono come condizioni OR.
    **Formato:** `+<prefisso>=<valore1> +<prefisso>=<valore2>`
    
    *   **Riga:** `debug-tools +env=development +env=testing`
    *   **Analisi:** `ENVIRONMENT` è uguale a "production", che non corrisponde né a "development" né a "testing". La condizione è falsa.
    *   **Risultato:** `debug-tools` non verrà installato.

*   **`-` (Negativo):** La condizione è vera se il valore della variabile **non corrisponde**.
    **Formato:** `-<prefisso>=<valore>`

    *   **Riga:** `monitoring-tools -st=desktop`
    *   **Analisi:** `SYSTEM_TYPE` è uguale a "server", che non è uguale a "desktop". La condizione è vera.
    *   **Risultato:** `monitoring-tools` verrà installato.

*   **Più filtri negativi:**
    Il pacchetto viene escluso se QUALSIASI condizione corrisponde.
    **Formato:** `-<prefisso>=<valore1> -<prefisso>=<valore2>`
    
    *   **Riga:** `realtek-driver -d=trixie -d=sid`
    *   **Analisi:** `DISTRIBUTION` è uguale a "bookworm", che non è uguale né a "trixie" né a "sid". Le condizioni di esclusione non si attivano.
    *   **Risultato:** `realtek-driver` verrà installato.

#### Filtri di gruppo

*   **`+{a|b}` (OR per inclusione):** Vero se **almeno una** delle condizioni nel gruppo è vera.

    *   **Riga:** `web-server +{st=server|st=web-server}`
    *   **Analisi:** `SYSTEM_TYPE` è uguale a "server". La prima condizione è vera, quindi basta.
    *   **Risultato:** Il pacchetto verrà installato.

*   **`+{a&b}` (AND per inclusione):** Vero solo se **tutte** le condizioni nel gruppo sono vere.

    *   **Riga:** `database-tools +{d=bookworm&st=server}`
    *   **Analisi:** `DISTRIBUTION` è uguale a "bookworm" (vero) E `SYSTEM_TYPE` è uguale a "server" (vero).
    *   **Risultato:** Il pacchetto verrà installato.

*   **`-{a|b}` (OR per esclusione):** Il pacchetto è escluso se **almeno una** delle condizioni è vera.

    *   **Riga:** `debug-tools -{env=production|st=minimal}`
    *   **Analisi:** `ENVIRONMENT` è uguale a "production". La prima condizione è vera, quindi il pacchetto è escluso.
    *   **Risultato:** Il pacchetto non verrà installato.

*   **`-{a&b}` (AND per esclusione):** Il pacchetto è escluso solo se **tutte** le condizioni sono vere.

    *   **Riga:** `development-tools -{env=production&st=minimal}`
    *   **Analisi:** `ENVIRONMENT` è uguale a "production" (vero), ma `SYSTEM_TYPE` non è uguale a "minimal". La seconda condizione è falsa. Il gruppo non si attiva per l'esclusione.
    *   **Risultato:** Il pacchetto verrà installato (se non ci sono altri filtri).

### Alternative

Possono essere proposti pacchetti diversi per la stessa funzionalità e installati in base alle condizioni. Le alternative sono separate dall'operatore `||`.

**Importante:** Ogni alternativa deve includere una descrizione completa — nome pacchetto (con eventuale versione e rilascio) e un insieme di filtri.

**Esempio:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Se `SYSTEM_TYPE` è `database-server`, viene selezionato **postgresql**.
- Se `SYSTEM_TYPE` è `web-server`, viene installato **mysql-server**.

### Operatori logici per i pacchetti

*   **`||` (OR / Fallback):** Prova a installare la parte sinistra. Se fallisce (pacchetto non trovato o filtrato), prova a installare la parte destra.

    *   **Riga:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Analisi:** `DISTRIBUTION` non è uguale a "bookworm", la parte sinistra viene filtrata. CondinAPT passa alla parte destra. `exfat-utils` non ha filtri, quindi verrà installato.
    *   **Risultato:** `exfat-utils` verrà installato.

*   **`&&` (AND / Congiunzione):** Tutte le parti devono superare con successo i controlli dei filtri per essere aggiunte alla coda.

    *   **Riga:** `nginx +st=web-server && php-fpm`
    *   **Analisi:** `SYSTEM_TYPE` è uguale a "server", ma la condizione richiede "web-server". La parte sinistra fallisce.
    *   **Risultato:** Nessun pacchetto verrà installato.

    *   **Esempio complesso:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Risultato:** Tutti e tre i pacchetti verranno installati solo se `ENVIRONMENT` è `production`.

### Modificatori speciali

*   **`!` (Pacchetto obbligatorio):** Se un pacchetto è marcato con `!` ma non può essere trovato nei repository, CondinAPT interromperà l'esecuzione con errore.

    *   **Riga:** `!essential-package`

*   **`@` (Specifica del rilascio):** Installa un pacchetto da uno specifico rilascio Debian/Ubuntu (es. `bookworm-backports`).

    *   **Riga:** `kernel-image-6.5.0 @trixie-backports`

### Specifica della versione del pacchetto

CondinAPT permette un controllo preciso sulle versioni dei pacchetti installati.

*   **Sintassi:**
    *   `package=VERSION`: Tenta di installare la versione specificata (`VERSION`). Se non è disponibile nei repository, CondinAPT installerà qualsiasi versione disponibile del pacchetto.
        *   Esempio: `my-app=1.2.3` (tenta di installare la 1.2.3, altrimenti installa, ad esempio, la 1.2.4)
    *   `package==VERSION`: Installazione **rigida** di una versione specifica. Se questa versione non è disponibile nei repository, il pacchetto **non verrà installato**. Se il pacchetto era anche marcato come obbligatorio (`!`), lo script terminerà con errore.
        *   Esempio: `another-app==2.0.0` (installa solo la 2.0.0, altrimenti salta il pacchetto o errore se obbligatorio)

*   **Comportamento:**
    1.  CondinAPT verifica prima se la versione richiesta del pacchetto è già installata sul sistema. Se sì, il pacchetto è considerato installato e viene saltato.
    2.  Poi controlla se la versione specificata è disponibile nei repository (`apt-cache madison`).
    3.  **Con `=` (versione flessibile):**
        *   Se la versione specificata non è disponibile, CondinAPT emetterà un avviso che la versione esatta non è stata trovata.
        *   Tuttavia, tenterà comunque di installare una qualsiasi versione disponibile del pacchetto dai repository.
    4.  **Con `==` (versione rigida):**
        *   Se la versione specificata non è disponibile, CondinAPT **non** installerà il pacchetto.
        *   Se il pacchetto era marcato come obbligatorio (`!`), lo script interromperà l'esecuzione con errore.
    5.  **Blocco versione (`apt-mark hold`):**
        *   Se un pacchetto è stato installato con successo nella **versione esatta richiesta** (cioè, se `package==VERSION` è andato a buon fine, o `package=VERSION` ha trovato *esattamente* quella versione e l'ha installata), CondinAPT applicherà automaticamente il comando `apt-mark hold` per quel pacchetto.
        *   Questo impedisce l'aggiornamento automatico del pacchetto a una nuova versione durante successivi `apt upgrade`.

### Esempi di filtri complessi

#### Esempio 1: Filtri complessi per un singolo pacchetto

**Obiettivo:** Installare `database-tools` per la distribuzione `bookworm`, ma solo se il tipo di sistema è `server` o `database-server`, e non per l'ambiente `minimal`.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Analisi (con la nostra configurazione):**

1.  `+d=bookworm`: Vero.
2.  `+{st=server|st=database-server}`: Vero, perché `SYSTEM_TYPE` è "server".
3.  `-env=minimal`: Vero, perché `ENVIRONMENT` è "production".
    **Risultato:** Tutte le condizioni sono vere. Il pacchetto verrà installato.

#### Esempio 2: Catena di fallback con condizioni diverse

**Obiettivo:** Per Debian `trixie`, installare `firefox-esr`. Per `bookworm`, installare `firefox`. In tutti gli altri casi, installare `w3m`.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Analisi:**

1.  `firefox-esr +d=trixie`: Parte sinistra. `DISTRIBUTION` è "bookworm", condizione falsa.
2.  `firefox +d=bookworm`: Parte centrale. `DISTRIBUTION` è "bookworm", condizione vera.
3.  Poiché la seconda parte della catena `||` ha funzionato, la terza (`w3m`) verrà ignorata.
    **Risultato:** `firefox` verrà installato.

#### Esempio 3: Interazione tra coda prioritaria e pacchetto obbligatorio

**Obiettivo:** `dkms` è fondamentale per la compilazione dei moduli; deve essere installato per primo. Nell'elenco principale, è marcato come obbligatorio, ma con una condizione.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Analisi:**

1.  CondinAPT legge i pattern di priorità `^dkms$` e `^build-essential$`.
2.  La riga `!dkms +pv=standard` corrisponde al pattern `^dkms$` e viene spostata nella coda prioritaria **con tutte le sue proprietà**: flag obbligatorio (`!`) e filtro (`+pv=standard`).
3.  **Piano di esecuzione:**

    *   **Coda prioritaria:** Installa `!dkms +pv=standard` (flag obbligatorio e filtro sono mantenuti).
    *   **Coda normale:** `vim`.

**Risultato:** `dkms` verrà installato per primo, ma il filtro `+pv=standard` verrà comunque valutato. Se la condizione del filtro non è soddisfatta, l'installazione fallirà a causa del flag `!` (obbligatorio).

## Code di installazione

Il separatore `---` su una riga separata divide l'elenco in gruppi (code). I pacchetti di una coda vengono installati insieme in una singola chiamata `apt`. Le code vengono eseguite rigorosamente in sequenza.

### Code normali

**Esempio:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Code di destinazione (con specifica del rilascio)

I pacchetti con `@release` vengono automaticamente raggruppati in code separate per rilascio:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Coda prioritaria

Questo meccanismo serve per l'installazione prioritaria di pacchetti critici mantenendo i loro filtri e condizioni.

*   **Principio:** Il file specificato dal flag `-P` contiene pattern regex (uno per riga, senza filtri). CondinAPT scansiona tutte le code, trova i pacchetti che corrispondono a questi pattern e li sposta (con tutti i loro filtri e condizioni) in una speciale "Coda Prioritaria", che viene eseguita per prima.
*   **Corrispondenza pattern:** Usa il matching regex bash (operatore `=~`). I pattern possono essere semplici nomi pacchetto o espressioni regex complesse.
*   **Mantenimento del contesto:** A differenza delle semplici liste di priorità, questo meccanismo mantiene tutte le condizioni, i filtri e le specifiche di rilascio dei pacchetti dall'elenco originale.
*   **Sovrascrittura:** I pacchetti corrispondenti vengono automaticamente rimossi dalle code originali (sia normali che di destinazione con `@release`) e spostati nelle code prioritarie. I rilasci di destinazione vengono mantenuti in code prioritarie dedicate.

**Esempio 1: Corrispondenza semplice del nome pacchetto**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Analisi:**

    1.  CondinAPT legge `priority.list` e sa che i pacchetti che corrispondono ai pattern `^gpg$` e `^git$` devono essere installati per primi.
    2.  Scansiona `packages.list` e trova la riga `git +st=full-server`. Poiché `git` corrisponde al pattern, l'intera riga (con il filtro `+st=full-server`) viene spostata nella coda prioritaria.
    3.  Analogamente, `gpg -st=minimal` viene spostato nella coda prioritaria con il filtro `-st=minimal` mantenuto.
    4.  **Piano finale:**

        *   **Coda prioritaria:** Installa `git +st=full-server` e `gpg -st=minimal` (i filtri sono mantenuti e valutati).
        *   **Coda normale:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Esempio 2: Corrispondenza con pattern regex**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Analisi:**

    1.  Il pattern `^linux-.*` corrisponde sia a `linux-image-6.1.0-amd64` che a `linux-headers-6.1.0-amd64`.
    2.  Il pattern `^firmware-.*` corrisponde a `firmware-linux`.
    3.  **Piano finale:**

        *   **Coda prioritaria:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Coda normale:** `build-essential`, `nginx +st=server`.

## Modalità operative e debug

#### Modalità simulazione (`-s`)

Permette di vedere quali pacchetti verrebbero installati senza eseguire realmente l'installazione:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Esempio di output:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Nota:** In modalità simulazione, lo script termina con codice di uscita 1.

#### Modalità controllo (`-C`)

Controlla quali pacchetti dell'elenco sono già installati sul sistema:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Comportamento:**
- Mostra errori per i pacchetti non installati
- Restituisce codice di uscita 1 se ci sono pacchetti non installati
- Alla fine, mostra un comando per installare i pacchetti mancanti

#### Modalità di debug

**Output dettagliato (`-v`):**
- Mostra informazioni dettagliate sui controlli dei filtri
- Visualizza i risultati per ogni pacchetto

**Output molto dettagliato (`-vv`):**
- Massimo dettaglio del processo
- Mostra tutti i passaggi intermedi

**Tracing dei comandi (`-x`):**
- Abilita `set -x` per il debug dello script
- Mostra ogni comando eseguito

**Esempio con debug:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Forza aggiornamento cache (`-f`)

Forza CondinAPT a eseguire `apt update` prima dell'installazione:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Funzionalità avanzate

### Supporto array in configurazione

CondinAPT può lavorare con variabili array nel file di configurazione:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Pacchetti speciali

CondinAPT ha il supporto integrato per pacchetti speciali che richiedono una gestione particolare:

**Pacchetti virtuali:**
- `qemu-kvm` - trattato come pacchetto virtuale

**Meccanismo di gestione:**
1. CondinAPT verifica se il pacchetto è virtuale tramite il comando `apt-cache show`
2. Se il pacchetto è marcato come "puramente virtuale", viene considerato disponibile per l'installazione
3. L'elenco dei pacchetti speciali è definito nell'array `SPECIAL_PACKAGES` all'interno dello script:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Estensione dell'elenco:** Per aggiungere nuovi pacchetti speciali, è necessario modificare l'array `SPECIAL_PACKAGES` nel codice di CondinAPT.

## Gestione errori e recovery

### Pacchetti obbligatori (`!`)

Se un pacchetto è marcato come obbligatorio ma non viene trovato nei repository, CondinAPT:
1. Mostra un messaggio di errore
2. Interrompe l'esecuzione (tranne in modalità simulazione)
3. Restituisce codice di uscita 1

**Esempio:**
```text
!essential-package +pv=standard
```

Se `essential-package` non viene trovato nei repository, l'esecuzione verrà interrotta.

### Gestione versioni non disponibili

**Versioni flessibili (`=`):**
- Se la versione esatta non è disponibile, viene installata qualsiasi versione disponibile
- Viene mostrato un avviso sull'indisponibilità della versione richiesta

**Versioni rigide (`==`):**
- Se la versione esatta non è disponibile, il pacchetto viene saltato
- Se il pacchetto è obbligatorio (`!`), l'esecuzione si interrompe

### Blocco versione (`apt-mark hold`)

CondinAPT blocca automaticamente le versioni dei pacchetti nei seguenti casi:
- Quando è stata installata esattamente la versione richiesta
- Per pacchetti con `==VERSION`, se la versione è stata trovata e installata
- Per pacchetti con `=VERSION`, se esattamente quella versione è stata trovata e installata

## Integrazione con sistemi di build

### Utilizzo in script di automazione

CondinAPT si integra facilmente in sistemi di build e script di automazione. Per maggiori dettagli sulla sintassi dei file pacchetti, vedi la sezione [Sintassi del file elenco pacchetti](#sintassi-del-file-elenco-pacchetti).

### Esempio di integrazione generale:

**In uno script di automazione (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Esempi di configurazione universale

**Esempio di file di mappatura filtri (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Esempio di configurazione (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Esempi di scenari reali

### Esempio 1: Server Multimediale

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Esempio 2: Server Web con Varie Configurazioni

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Esempio 3: Piattaforma Container

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Esempio 4: Uso Avanzato dei Filtri

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Suggerimenti per l'Ottimizzazione

### Organizzazione delle Liste di Pacchetti

1. **Raggruppamento per funzionalità:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Utilizzo delle code per le dipendenze:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Ottimizzazione delle condizioni:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Prestazioni

- Usa code prioritarie per i pacchetti critici
- Minimizza il numero di code
- Raggruppa i pacchetti correlati in un'unica coda
- Utilizza la cache APT per build di grandi dimensioni

## Risoluzione dei Problemi

### Problemi Comuni

**Problema:** Il pacchetto non viene installato nonostante le condizioni corrette
**Soluzione:** Verifica con il flag `-vv` per informazioni dettagliate sui filtri

**Problema:** CondinAPT si interrompe su un pacchetto obbligatorio
**Soluzione:** Controlla la disponibilità del pacchetto nei repository o utilizza un fallback. Vedi la sezione [Gestione degli Errori e Ripristino](#error-handling-and-recovery)

**Problema:** Comportamento inatteso con le versioni dei pacchetti
**Soluzione:** Usa la [modalità simulazione](#operating-modes-and-debugging) (`-s`) per la verifica

### Debug dei Filtri

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Verifica della Disponibilità dei Pacchetti

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
