# Creazione dei moduli

I moduli in MiniOS sono pacchetti autonomi di file e configurazioni che estendono le funzionalità del sistema base. Sono simili ai pacchetti di altre distribuzioni Linux, ma sono progettati per essere sovrapposti l’uno all’altro, consentendo un sistema flessibile e personalizzabile. Questo approccio a livelli permette una facile personalizzazione, il rollback delle modifiche e la condivisione delle configurazioni.

Per una panoramica completa del processo di build di MiniOS e dell’architettura del sistema, consulta la [Guida alla compilazione di MiniOS](/development/Building-MiniOS.md). Per informazioni sul sistema di gestione dei pacchetti CondinAPT utilizzato nei moduli, vedi la [Documentazione di CondinAPT](/development/CondinAPT.md).

Sono disponibili numerose utility per la creazione di moduli in MiniOS. Tutte sono progettate per l’utilizzo da terminale e richiedono privilegi di root.

**Utility per la creazione dei moduli:**

**apt2sb** – installa pacchetti dai repository e li impacchetta in un modulo.<br>
**script2sb** – esegue le azioni descritte nello script e impacchetta il risultato in un modulo.<br>
**chroot2sb** – apre un ambiente chroot, consentendo di eseguire qualsiasi operazione; al termine, salva il risultato nel modulo.<br>

**Utility aggiuntive per la gestione dei moduli:**

**dir2sb** – converte una directory esistente in un modulo compresso.<br>
**sb2dir** – converte un modulo compresso in una directory per l’ispezione.<br>
**rmsbdir** – rimuove una directory di modulo creata da sb2dir.<br>
**savechanges** – salva tutti i file modificati nel sistema in un bundle filesystem compresso.<br>
**sb2iso** – genera un’immagine ISO di MiniOS, con la possibilità di aggiungere o escludere moduli.<br>
**sb** – interfaccia completa per la gestione dei bundle MiniOS (attiva, disattiva, elenca, converte).<br>

**Caratteristiche comuni delle utility di creazione moduli:**
- Supporto per diversi tipi di compressione: zstd (predefinito), gzip, lzo, xz
- Estensione file del modulo personalizzabile (predefinito: sb)
- Filtro per livello per controllare quali moduli esistenti includere come dipendenze
- Nome personalizzato per i moduli in output
- Tutte le utility devono essere eseguite come root

## apt2sb

Per creare un modulo con apt2sb, basta elencare i pacchetti che si desidera includere nel modulo, ad esempio: `apt2sb install chromium chromium-sandbox`. Eseguendo questo comando nella cartella corrente verrà generato un modulo chromium.sb che conterrà il browser Chromium. Questo modulo sarà costruito in relazione a tutti i moduli già caricati nel sistema, il che significa che per funzionare richiederà la presenza di questi ultimi, poiché le librerie necessarie al programma potrebbero già essere installate e contenute nei moduli inferiori.

Utilizzando l’opzione `-l`/`--level` possiamo specificare su quale modulo superiore costruire il nostro modulo. Ad esempio, il comando `apt2sb install -l 4 chromium chromium-sandbox` escluderà tutti i moduli numerati 04 e superiori durante la creazione, cioè il modulo sarà basato sui moduli numerati da 00 a 03. Come risultato, otterremo il modulo 04-chromium.sb nella cartella di esecuzione del comando. Questo modulo avrà una dimensione maggiore rispetto all’esempio precedente perché includerà tutte le librerie necessarie all’esecuzione del programma, che potrebbero essere contenute nei moduli 04 e superiori, ma potrà funzionare sia in presenza che in assenza dei moduli dal 04 in poi.

Il nome del modulo viene creato automaticamente, basandosi sul nome del primo pacchetto specificato (in questo caso chromium) e, se viene indicata l’opzione --level, anche sul numero di livello. Se si desidera specificare manualmente il nome del modulo, si può usare l’opzione `-n`/`--name`, ad esempio: `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Opzioni aggiuntive disponibili in apt2sb:**

- `-c`/`--comp` – Tipo di compressione (zstd, gzip, lzo, xz). Predefinito: zstd
- `-b`/`--bext` – Estensione bundle. Predefinito: sb
- `-y`/`--yes` – Risposta automatica sì alle richieste
- `--allow-downgrades` – Permetti il downgrade dei pacchetti
- `--install-recommends` – Considera i pacchetti raccomandati come dipendenze per l’installazione
- `--install-suggests` – Considera i pacchetti suggeriti come dipendenze per l’installazione
- `--no-install-recommends` – Non considerare i pacchetti raccomandati come dipendenze
- `--no-install-suggests` – Non considerare i pacchetti suggeriti come dipendenze
- `-t`/`--target-release` – Release predefinita da cui installare i pacchetti

apt2sb dispone anche del comando `upgrade` che permette di aggiornare i pacchetti già installati. Il comando upgrade utilizza le stesse opzioni di install.

## script2sb

Per creare un modulo con script2sb, è necessario scrivere uno script bash che descriva i passaggi richiesti per costruire il modulo. Questo è utile se occorre eseguire alcune operazioni sul file system, importare chiavi, aggiungere repository, ecc. prima o dopo l’installazione. Ecco un esempio di tale script:
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
Per eseguire la build di questo script (chiamiamolo caddy.sh), occorre lanciare il comando `script2sb -s ./caddy.sh`.

**Opzioni disponibili per script2sb:**

- `-s`/`--script` – Usa FILE come script di installazione (obbligatorio)
- `-l`/`--level` – Usa LEVEL come livello di filtro
- `-n`/`--name` – Usa NAME come nome file per il modulo
- `-c`/`--comp` – Tipo di compressione (zstd, gzip, lzo, xz). Predefinito: zstd
- `-b`/`--bext` – Estensione bundle. Predefinito: sb
- `-d`/`--directory` – Copia il contenuto di DIR nella root del modulo

Se non viene specificato un nome per il modulo, il nome viene creato in base al numero di livello, se indicato, e al nome dello script. Un esempio di comando con queste opzioni è: `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

Oltre a queste opzioni, è possibile usare l’opzione `-d`/`--directory`. Se questa opzione viene specificata, il contenuto della cartella indicata verrà copiato nella root del modulo prima dell’esecuzione dello script. I file in tale cartella devono essere organizzati come se fossero nella root del sistema. Supponiamo di dover aggiungere un collegamento nel menu per un programma: creiamo una cartella mymodule e al suo interno una struttura relativa alla root del sistema:
```
mkdir -p /home/user/mymodule/usr/share/applications
```
Nella cartella mymodule/usr/share/applications dovrai inserire il file desktop che verrà incluso nel modulo dopo la build ed eseguire il comando di build:
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

L’utility `chroot2sb` viene utilizzata per creare un ambiente chroot interattivo. Questo consente di eseguire manualmente *qualsiasi* operazione necessaria per costruire il proprio modulo (installare pacchetti, modificare file, eseguire comandi, ecc.). Una volta usciti dall’ambiente chroot, le modifiche apportate vengono impacchettate in un modulo.

**Opzioni disponibili per chroot2sb:**

- `-l`/`--level` – Usa LEVEL come livello di filtro  
- `-n`/`--name` – Usa NAME come nome file per il modulo
- `-c`/`--comp` – Tipo di compressione (zstd, gzip, lzo, xz). Predefinito: zstd
- `-b`/`--bext` – Estensione bundle. Predefinito: sb
- `-d`/`--directory` – Copia il contenuto di DIR nella root del modulo

Se non viene specificato un nome per il modulo, il nome viene creato in base al numero di livello, se indicato, e alla data e ora corrente nel formato YYYYMMDD-HHMM.

Puoi anche utilizzare l’opzione `-d`/`--directory`, come in `script2sb`. Se questa opzione viene specificata, il contenuto della cartella indicata verrà copiato nella root del modulo *prima* di entrare nell’ambiente chroot. Questo fornisce un punto di partenza per le tue personalizzazioni.

**Esempi d’uso:**

- Chroot base, nome modulo automatico: `chroot2sb`
- Specifica livello e compressione: `chroot2sb -l 3 -c gzip`
- Specifica livello, nome e compressione: `chroot2sb -l 3 -n 04-my-module.sb -c xz`
- Copia file da una directory prima di entrare in chroot: `chroot2sb -d /path/to/my/files`

Dopo aver eseguito il comando `chroot2sb`, entrerai in un ambiente chroot. Potrai quindi effettuare tutte le operazioni necessarie. Al termine, digita `exit` per uscire dall’ambiente chroot. `chroot2sb` impacchetterà quindi le modifiche in un modulo. I comandi eseguiti nel chroot *non* vengono salvati come parte del processo di installazione finale del modulo: viene creato uno snapshot dello stato finale del filesystem. La cronologia bash viene eliminata automaticamente dal modulo.

## Utility aggiuntive per la gestione dei moduli

Oltre alle utility per la creazione dei moduli, MiniOS fornisce diversi strumenti per la gestione e l’utilizzo dei moduli esistenti:

### dir2sb

L’utility `dir2sb` viene utilizzata per convertire una directory esistente in un modulo compresso. È utile quando hai già preparato una struttura di directory con tutti i file necessari e vuoi impacchettarla in un modulo senza eseguire processi di installazione.

**Opzioni disponibili per dir2sb:**

- `-c`/`--comp` – Tipo di compressione (zstd, gzip, lzo, xz). Predefinito: zstd
- `-b`/`--bext` – Estensione bundle. Predefinito: sb

**Utilizzo:**

`dir2sb [OPZIONI] SOURCE_DIRECTORY [TARGET_FILE]`

**Comportamento:**

- Se `SOURCE_DIRECTORY` non ha estensione .sb e non si chiama 'squashfs-root', la directory stessa viene inclusa nel modulo e `TARGET_FILE` è obbligatorio.
- Se `TARGET_FILE` non è specificato, `SOURCE_DIRECTORY` viene sostituita dal nuovo file modulo.

**Esempi:**

- Converti una directory preparata in modulo: `dir2sb /path/to/my/prepared/files my-module.sb`
- Converti la directory squashfs-root (sostituisce l’originale): `dir2sb squashfs-root`
- Usa una compressione diversa: `dir2sb -c xz /path/to/files custom-module.sb`

Questa utility è particolarmente utile quando vuoi:
- Impacchettare file e directory già configurati
- Convertire il contenuto estratto di un modulo in un nuovo modulo
- Creare moduli da strutture di directory preparate manualmente

### sb2dir

L’utility `sb2dir` converte un modulo compresso (.sb) in una directory con lo stesso nome. È utile per estrarre ed esaminare il contenuto dei moduli.

**Utilizzo:**

`sb2dir [file_sorgente.sb] [directory_output_opzionale]`

**Comportamento:**

- Se viene specificata la directory di output, deve già esistere
- Se la directory di output non è specificata, viene usato il nome source_file.sb e la directory viene montata su tmpfs

**Esempi:**

- Estrai un modulo per esaminarne il contenuto: `sb2dir mymodule.sb`
- Estrai in una directory specifica: `sb2dir mymodule.sb /tmp/extracted`

### rmsbdir

L’utility `rmsbdir` rimuove una directory di modulo creata da `sb2dir`. In questo modo viene correttamente smontato il tmpfs se utilizzato.

**Utilizzo:**

`rmsbdir [directory_sorgente.sb]`

**Esempio:**

- Rimuovi la directory di modulo estratta: `rmsbdir mymodule.sb`

### savechanges

L’utility `savechanges` salva tutti i file modificati nel sistema in un bundle filesystem compresso. È utile per creare moduli a partire da modifiche apportate durante l’esecuzione.

**Opzioni disponibili:**

- `-c`/`--comp` – Tipo di compressione (zstd, gzip, lzo, xz). Predefinito: zstd
- `-b`/`--bext` – Estensione bundle. Predefinito: sb

**Utilizzo:**

`savechanges [OPZIONI] target_file.sb [changes_directory]`

Se changes_directory non è specificata, viene utilizzata `/run/initramfs/memory/changes`.

**Esempi:**

- Salva tutte le modifiche attuali: `savechanges my-changes.sb`
- Salva con una compressione diversa: `savechanges -c xz my-changes.sb`

### sb2iso

L’utility `sb2iso` genera un’immagine ISO di MiniOS, con la possibilità di aggiungere moduli specifici o escluderne di esistenti.

**Opzioni disponibili:**

- `-e`/`--exclude` – Escludi qualsiasi percorso o file esistente che corrisponde a REGEX
- `-n`/`--name` – Specifica il nome file ISO in output (predefinito: minios-YYYYMMDD_HHMM.iso)

**Utilizzo:**

`sb2iso [OPZIONI]... [MODULE.SB]...`

**Esempi:**

- Crea una ISO MiniOS senza il modulo firefox.sb: `sb2iso -e 'firefox' -n minios_without_firefox.iso`
- Crea solo la versione core testuale di MiniOS: `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

L’utility `sb` offre un’interfaccia completa per la gestione dei bundle MiniOS, incluse operazioni di attivazione, disattivazione e conversione.

**Importante:** L’utility `sb` richiede il supporto kernel AUFS (Advanced multi layered UniFication FileSystem) per la maggior parte delle operazioni. Se AUFS non è disponibile nel kernel, molti comandi non funzioneranno.

**Comandi disponibili:**

- `activate BUNDLE` – Attiva un bundle MiniOS
- `deactivate BUNDLE` – Disattiva un bundle MiniOS attivo  
- `list` – Elenca i bundle MiniOS attivi
- `savechanges` – Salva le modifiche apportate a runtime nel bundle
- `rm DIR` / `rmdir DIR` – Rimuove una directory di bundle estratta
- `conv PATH` – Converte un bundle .sb in directory o viceversa

**Esempi:**

- Attiva un modulo: `sb activate mymodule.sb`
- Disattiva un modulo: `sb deactivate mymodule.sb`
- Elenca i moduli attivi: `sb list`
- Converte un modulo in directory: `sb conv mymodule.sb`
- Converte una directory in modulo: `sb conv mymodule/`

**Nota:** I comandi `activate`, `deactivate` e `list` richiedono il supporto kernel AUFS e privilegi di root. I comandi `conv`, `rm` e `rmdir` funzionano anche senza AUFS ma richiedono comunque privilegi di root.

## Documentazione correlata

- **[Ricostruzione ISO](/development/Rebuilding-ISO.md)** – Scopri come impacchettare i tuoi moduli personalizzati in immagini ISO avviabili utilizzando `sb2iso`
- **[Compilazione di MiniOS](/development/Building-MiniOS.md)** – Guida completa alla compilazione di MiniOS dal sorgente con configurazioni personalizzate
