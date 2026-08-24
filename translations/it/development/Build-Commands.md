# Comandi di build

MiniOS offre due interfacce a riga di comando per la build. Esegui i comandi dalla directory sorgente `minios-live` a meno che tu non stia usando una copia installata.

- `minios-cmd` è il frontend. Accetta le opzioni comuni per il target, genera una configurazione funzionante e avvia una build completa.
- `minios-live` è il backend a stadi. Legge una configurazione di build ed esegue uno stadio, un intervallo inclusivo di stadi, oppure l'intera pipeline.

Per la versione installata, utilizza `./minios-cmd --help`, `./minios-live --help` e il `build.conf` attivo. Questi sono autorevoli quando esempi o documentazione precedente risultano in disaccordo. I valori supportati per i target possono cambiare, quindi questa pagina non definisce una matrice di supporto.

## Requisiti di root

La visualizzazione dell'aiuto non richiede i privilegi di root:

```bash
./minios-cmd --help
./minios-live --help
```

Le operazioni di build richiedono i privilegi di root perché utilizzano debootstrap, chroot, mount e strumenti per la creazione di immagini. L'attuale frontend verifica anche la presenza dei privilegi di root prima di scrivere una configurazione con `--config-only`.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Il backend controlla e installa i prerequisiti dell'host elencati in `linux-live/prerequisites.list` a meno che `SKIP_SETUP_HOST=true` sia impostato nella configurazione.

## Build frontend

Una normale invocazione di `minios-cmd` richiede tutte e quattro le opzioni di selezione del target:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Ad esempio:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Le impostazioni opzionali più comuni includono compressione, comportamento del kernel, lingua, fuso orario, builder initramfs, lingua del menu di avvio e directory di build. Verifica `./minios-cmd --help` invece di presumere che un'opzione sia disponibile.

Il frontend copia il template di configurazione, scrive i valori frontend forniti nella copia e invoca `minios-live -`. Per impostazione predefinita, la copia di lavoro per questo esempio è:

```text
build/trixie-standard-amd64/build.conf
```

Genera una configurazione senza avviare la build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Senza una destinazione diversa, questo scrive `build/build.conf`.

`--config-file FILE` seleziona un file di configurazione. L'aiuto del comando attuale indica che tutte le altre opzioni vengono ignorate in questa modalità, quindi non combinarlo con opzioni di target o tuning:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

Per la modalità opzioni frontend, i valori forniti da riga di comando vengono scritti sopra quelli corrispondenti del template. Per la modalità file di configurazione, considera il file selezionato come input di configurazione invece di tentare di sovrascriverlo con altri flag frontend.

## Configurazione backend

In una copia del sorgente, `minios-live` legge `linux-live/build.conf` per impostazione predefinita. Una copia installata utilizza `/etc/minios-live/build.conf`. Il backend importa il file selezionato prima di calcolare i percorsi di destinazione e non dispone di flag a riga di comando per sovrascrivere singole impostazioni di configurazione.

Seleziona un file diverso tramite `BUILD_CONF`. Usa un percorso assoluto quando attraversi il confine `sudo`:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` seleziona un'altra root di output della build:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Non modificare i file generati sotto una directory di lavoro target come sostituto della manutenzione della configurazione selezionata. Vedi `linux-live/build.conf` per opzioni avanzate su kernel, bootloader, lingua, cache, snapshot, moduli, pulizia e pubblicazione.

## Stadi backend

Gli stadi vengono eseguiti in questo ordine:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

I nomi degli stadi con trattino mostrati nell'aiuto sono accettati dallo script.

Esegui l'intera pipeline:

```bash
sudo ./minios-live -
```

Esegui solo uno stadio:

```bash
sudo ./minios-live build-iso
```

Esegui un intervallo inclusivo:

```bash
sudo ./minios-live build-chroot - build-live
```

Esegui dal primo stadio fino a uno selezionato:

```bash
sudo ./minios-live - build-live
```

Esegui da uno stadio selezionato fino all'ultimo stadio:

```bash
sudo ./minios-live build-modules -
```

Questi esempi backend utilizzano il target selezionato nella configurazione attiva. Per gli esempi in questa pagina, imposta prima `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` e `PACKAGE_VARIANT="standard"`.

## Dipendenze tra stadi

Un comando parziale non ricrea gli output degli stadi precedenti omessi. Gli stadi successivi utilizzano il filesystem root, i moduli SquashFS, i file di avvio e la configurazione prodotti dagli stadi precedenti.

Ricostruire uno stadio precedente può quindi rendere obsoleti tutti gli output successivi che ne dipendono. Ricostruisci fino all'ultimo stadio interessato e non conservare moduli con numero superiore dopo aver modificato un modulo inferiore su cui sono stati basati. In particolare, `build-iso` impacchetta dati immagine precedentemente preparati; non ricostruisce tali dati.

Esegui una build completa per un nuovo target o quando non esistono gli output richiesti degli stadi precedenti:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Output e log

Con la configurazione e la root di build predefinite del checkout, l'esempio trixie utilizza queste posizioni verificate:

- `build/trixie-standard-amd64/core/` per il filesystem core modificabile
- `build/trixie-standard-amd64/image/` per l'albero ISO preparato
- `build/trixie-standard-amd64/image/minios/` per i moduli e il payload MiniOS generati
- `build/iso/` per i file ISO e i rispettivi sidecar `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` per il log di build acquisito

Tutti i percorsi sono relativi a `BUILD_DIR`. I nomi base degli ISO includono le impostazioni di build e, per build non di rilascio, un timestamp; utilizza il percorso stampato dalla build riuscita invece di prevedere il nome file completo.

## Token Ubuntu Pro

`--ubuntu-pro-token` abilita l'uso di Ubuntu Pro durante una build frontend. Il codice di build si collega all'interno del chroot, poi si scollega e rimuove lo stato Pro, l'autenticazione dei repository, le preferenze e le tracce della keyring prima di creare l'immagine. Questa pulizia non rende il token sicuro da esporre sull'host.

Non inserire un token reale nella documentazione, nel controllo versione, nella cronologia della shell, nell'output CI o su una riga di comando condivisa. Preferisci un file di configurazione privato fuori dal repository, limitato al solo proprietario, e passa solo il suo percorso:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Imposta `USE_UBUNTU_PRO="true"` e `UBUNTU_PRO_TOKEN="..."` in quel file privato. Proteggi ed elimina qualsiasi configurazione di lavoro lato host contenente il token quando non è più necessaria e verifica che nessun token o dato di autenticazione Pro sia presente negli artefatti pubblicati.
