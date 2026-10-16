---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# Compilazione di MiniOS

MiniOS viene assemblato a partire da un'immagine SquashFS di base, moduli di estensione ordinati, file del kernel e di avvio e configurazione generata. Questa pagina descrive le interfacce di compilazione attuali dell'albero dei sorgenti e le dipendenze tra i relativi output.

Esegui `./minios-cmd --help`, `./minios-live --help` e controlla il `build.conf` selezionato prima di compilare. Questi file sono la fonte autorevole per la versione estratta.

## Requisiti

Compila su Debian o Ubuntu, assicurandoti di avere spazio libero sufficiente al di sotto di `BUILD_DIR` e `/tmp`.
Per una tipica installazione desktop sono necessari almeno 20 GiB. Le operazioni di compilazione richiedono i privilegi di root per debootstrap, chroot, mount, dispositivi loop e creazione delle immagini; per visualizzare la guida non sono necessari.

L'elenco autorevole dei pacchetti host è `linux-live/prerequisites.list`. Per la copia attualmente estratta, puoi installarli con:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

In una copia dei sorgenti, `minios-live` verifica questo elenco prima della compilazione, a meno che `SKIP_SETUP_HOST=true`. Su un host normale segnala i pacchetti mancanti e si interrompe; l'installazione automatica viene usata solo nel percorso di compilazione del container.

La configurazione predefinita verifica la connettività Internet. Puoi disattivare il controllo con `CHECK_INTERNET_CONNECTION=false` e viene saltato se è predisposto un repository di cache APT; tuttavia, tutti i pacchetti e i file di avvio necessari devono comunque essere disponibili nei repository o nelle cache configurati.

Se `USE_APT_CACHER=true`, deve essere già configurato un servizio apt-cacher-ng raggiungibile all'indirizzo `APT_CACHER_ADDRESS`; altrimenti imposta l'opzione su `false` prima di compilare.

::: danger Attendibilità del bootstrap
Il percorso di bootstrap attuale invoca debootstrap con `--no-check-gpg` e scarica la chiave dell'archivio MiniOS tramite HTTP non autenticato. Non usare l'immagine risultante come artefatto di release attendibile finché questi percorsi del codice sorgente non garantiscono la verifica autenticata della chiave e del bootstrap.
:::

## Compilazione rapida

Clona il repository ed esegui il frontend dalla directory principale:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Se non selezioni un file di configurazione, devi specificare le quattro opzioni di destinazione:

| Opzione | Impostazione |
| --- | --- |
| `-d`, `--distribution` | Suite della distribuzione di destinazione |
| `-a`, `--architecture` | Architettura di destinazione |
| `-de`, `--desktop-environment` | Ambiente dei moduli |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox`, oppure `ultra` |

I valori attualmente supportati per distribuzione, architettura, desktop, compressione e variante sono elencati in `linux-live/build.conf`. Non dedurre la compatibilità da un vecchio esempio di comando.

## Interfacce di compilazione

### `minios-cmd`

`minios-cmd` copia il modello di configurazione nella directory di lavoro di destinazione, vi scrive le impostazioni del frontend e avvia l'intera `minios-live -` pipeline. Le opzioni più comuni includono:

| Opzione | Effetto |
| --- | --- |
| `-b`, `--build-dir` | Seleziona la directory radice dell'output di build |
| `-c`, `--compression-type` | Seleziona la compressione SquashFS |
| `-kp`, `--kernel-provider` | Seleziona `distribution` o `minios` |
| `-kf`, `--kernel-flavour` | Seleziona una variante del kernel della distribuzione |
| `-mk`, `--minios-kernel` | Seleziona il fornitore del kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Seleziona `auto`, `6.1`, oppure `6.12` e indica il fornitore MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleziona `runtime` o `full` |
| `-dkms`, `--kernel-build-dkms` | Compila i driver facoltativi per il kernel selezionato |
| `-l`, `--locale` | Imposta le impostazioni locali del sistema |
| `-ml`, `--multilingual` | Genera più impostazioni locali |
| `-kl`, `--keep-locales` | Mantieni le impostazioni locali disponibili |
| `-tz`, `--timezone` | Imposta il fuso orario del sistema live |
| `-ib`, `--initramfs-builder` | Seleziona `livekit` o `dracut` |
| `-mln`, `--menu-language` | Seleziona la lingua del menu di avvio |

Ad esempio:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Genera una configurazione senza avviare la build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Se non specifichi un'altra destinazione, verrà scritto `build/build.conf`. In questa modalità, il frontend richiede comunque i privilegi di root.

`--config-file FILE` seleziona una configurazione da copiare. L'implementazione attuale scrive quindi nella copia di lavoro i valori analizzati dalla riga di comando e i valori predefiniti non vuoti del frontend, nonostante la formulazione più breve in `--help`. Per usare una configurazione esatta e gestita manualmente, esegui direttamente `minios-live` e controlla il file attivo, senza affidarti all'unione del frontend.

Non usare `--config-only` insieme a `--config-file` se punta a una configurazione esistente: la modalità solo configurazione sovrascrive quel percorso con il modello predefinito.
Usa `-b DIR --config-only` per scegliere una destinazione separata per i file generati.

### `minios-live`

`minios-live` è il backend di staging. In un checkout dei sorgenti legge per impostazione predefinita `linux-live/build.conf`; una copia installata legge `/etc/minios-live/build.conf`. Per selezionare un altro file e una directory radice di output, usa le variabili d'ambiente:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Usa un percorso `BUILD_CONF` assoluto attraverso `sudo`. I file di configurazione vengono eseguiti come script Bash: usa solo file attendibili. Il backend non dispone di opzioni per sovrascrivere singole variabili di configurazione.

## Fasi di build

La pipeline viene eseguita in questo ordine:

1. `build-bootstrap` crea la directory radice minima di destinazione con debootstrap.
2. `build-chroot` installa e configura il sistema di base.
3. `build-live` crea il modulo `00-core` SquashFS.
4. `build-modules` compila i moduli ordinati dell'ambiente selezionato.
5. `build-boot` genera initramfs, kernel, EFI e file del bootloader.
6. `build-config` genera MiniOS e la configurazione di avvio.
7. `build-iso` pubblica l'ISO avviabile e il checksum.
8. `remove-sources` elimina la directory di lavoro selezionata, se configurato.

Sono accettati sia i nomi con trattini mostrati sopra sia le forme con underscore.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

Un comando parziale non ricrea gli input omessi. `build-iso` crea soltanto il pacchetto dall'albero dell'immagine preparato, mentre `build-modules` non può ricreare `00-core`. Se modifichi un elemento prodotto da una fase precedente, ripeti la build fino all'ultima fase che ne dipende.

Una pipeline completa inizia con `build-bootstrap`, che rimuove gli elementi esistenti della destinazione selezionata: le directory `core/` e `image/`. Prima di iniziare, conserva i contenuti che non possono essere rigenerati: gli alberi di destinazione generati sono output di build, non archivi permanenti dei sorgenti.

Se `REMOVE_SOURCES=true`, la fase finale `remove-sources` elimina e ricrea l'intera directory di lavoro `build/<distribution>-<variant>-<architecture>/`, non solo gli archivi dei sorgenti scaricati. Le ISO pubblicate, le cache condivise e i log al di fuori di questa directory vengono mantenuti.

## Configurazione

`linux-live/build.conf` controlla l'identità della destinazione, il kernel, le impostazioni locali, il bootloader, l'utente live, i servizi, le cache, gli snapshot, la pulizia e la pubblicazione. Tra i gruppi più importanti:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT` e `PACKAGE_VARIANT` selezionano la destinazione e la catena di moduli.
- `COMP_TYPE` controlla la compressione SquashFS.
- `LIVE_MODULE_MODE` seleziona `merged` (l'impostazione predefinita attuale per tutte le varianti) oppure `simple` l'integrazione live-config; non viene più dedotta solo dalle dimensioni dell'edizione.
- `KERNEL_*` e `MINIOS_KERNEL_SERIES` controllano il recupero e il payload del kernel.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG` e `SERIAL_CONSOLE` controllano gli artefatti di avvio.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO` e `USE_APT_CACHER` controllano gli input riutilizzabili.
- `VERBOSITY_LEVEL` accetta `0`, `1` oppure `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES` e `BUILD_TEST_ISO` controllano la pubblicazione e la pulizia.

Non modificare un file `build/<target>/build.conf` generato come alternativa alla manutenzione della configurazione sorgente selezionata.

### Selezione del kernel

Il `distribution` provider risolve il kernel Debian o Ubuntu selezionato e, se DKMS è abilitato, recupera gli header corrispondenti in uno stato APT isolato e firmato.
`KERNEL_AUTO_SELECT=true` ricava la suite sorgente e l’architettura dal target userspace. Impostalo su `false` per usare i campi manuali relativi a distribuzione, architettura, versione, snapshot e criteri di aggiornamento in `build.conf`.

Il `minios` provider installa `linux-image-SERIES-mos-ARCH`, verifica il supporto AUFS e usa gli header MiniOS corrispondenti per DKMS. Richiede `KERNEL_FLAVOUR=none` e che le architetture dei pacchetti userspace e kernel corrispondano.
Nel codice attuale, `MINIOS_KERNEL_SERIES=auto` corrisponde a `6.12`; usa esplicitamente `6.1` quando è necessaria quella serie.

`KERNEL_PAYLOAD_MODE=runtime` conserva l’albero dei moduli del kernel, la configurazione del kernel, `System.map`, i metadati di distribuzione e l’integrazione runtime in `modprobe.d`, `modules-load.d` e `udev/rules.d`. Rimuove lo stato dei pacchetti usati solo per la compilazione, gli header, i sorgenti DKMS, gli strumenti del compilatore e i pacchetti initramfs. Il firmware resta gestito da `02-firmware`. `full` conserva un set di dati diagnostici più ampio.

## Sistema dei moduli

I sorgenti dei moduli si trovano in `linux-live/scripts/`. Un ambiente in `linux-live/environments/<desktop>/` contiene collegamenti simbolici ordinati ai sorgenti utilizzati. Il nome locale all’ambiente determina l’ordine di compilazione e può riassegnare il numero a un sorgente condiviso, ad esempio:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` è prodotto da `build-live` e non è un normale collegamento dell’ambiente.
I moduli `01` e successivi sono cumulativi: ciascuno viene compilato sopra i moduli inferiori pertinenti. `skip_conditions.conf` può omettere alcune voci per un target, quindi controlla l’ambiente selezionato invece di presumere che esista una sequenza universale.

Usa `linux-live/scripts/10-example/` come modello di authoring attuale. Un modulo può contenere:

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

Sono necessari solo i file richiesti dal modulo. `build`, `postinstall`, le condizioni di esclusione, le patch e gli alberi rootcopy sono facoltativi. `build` e `patches/` non sono disponibili per `00-core`.

La proprietà dell’host non viene mantenuta negli alberi rootcopy; normalmente i file copiati diventano `root:root`. Un file manifest `.minios-ownership` all’interno di un albero rootcopy usa:

```text
owner:group relative/path
```

I percorsi devono rimanere all’interno dell’albero. L’host applica immediatamente il manifest e risolve i nomi usando il database degli account dell’host. Per gli account presenti solo nel target, usa valori numerici di `UID:GID` oppure imposta la proprietà da `install` o `postinstall` all’interno della chroot. Spostare il manifest in `rootcopy-postinstall/` non modifica la risoluzione dei nomi.

Poiché il controllo di contenimento attuale non canonizza il percorso di destinazione, non usare mai componenti `..` o componenti di collegamenti simbolici nei percorsi del manifest. Controlla gli alberi rootcopy prima di una compilazione con privilegi elevati: un percorso appositamente creato può far sì che `chown` esca dall’albero copiato.

Per i pacchetti, i normali script di installazione dei moduli usano i file copiati nella chroot da `build-modules`:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Consulta [CondinAPT](/development/CondinAPT) per la sintassi degli elenchi di pacchetti e la mappa dei filtri MiniOS aggiornata.

### Aggiungere un modulo

Copia il modello, quindi crea un collegamento in ogni ambiente previsto, assegnandogli la posizione locale desiderata:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adatta `packages.list`, gli script, i metadati e i contenuti rootcopy prima di compilare.
Verifica ogni desktop, variante, distribuzione e architettura dichiarati.

## Ricompilare in sicurezza

Gli artefatti dei moduli esistenti vengono ignorati. Se cambia un modulo cumulativo inferiore, rimuovi il relativo artefatto e tutti i moduli successivi prima di eseguire `build-modules`; mantenere i moduli successivi conserverebbe contenuti compilati sul vecchio livello inferiore. Individua gli artefatti in base all’ordine dell’ambiente selezionato e al nome del modulo, poiché le condizioni di esclusione possono creare salti nella numerazione.

Il livello del kernel è un caso particolare. Per ricompilare solo `01-kernel`, rimuovi il relativo artefatto per il target selezionato e ricompila dai moduli fino alla pubblicazione:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Verifica il percorso del target prima della rimozione. Non applicare questa scorciatoia a `00-core` e non dare per scontato che sia sicura per i moduli `02` e successivi.

Per un modulo ordinario, ad esempio `03-gui-base`, rimuovi il relativo artefatto e tutti gli artefatti dei moduli successivi pertinenti, quindi esegui lo stesso intervallo di `build-modules -`. Per modifiche che riguardano solo initramfs, EFI o l’avvio, lascia invariati i moduli SquashFS ed esegui:

```bash
sudo ./minios-live build-boot -
```

Esegui una compilazione completa dopo modifiche a `00-core`, alla configurazione di bootstrap/chroot, all’identità del target, ai criteri dei repository o a qualsiasi altro input che non possa essere isolato in una fase successiva.

## Output e log

Con le impostazioni predefinite, `BUILD_DIR`, i percorsi importanti sono:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` e `build/iso/*.iso.sha256`
- `build/log/build-*.log`

I nomi dei file ISO dipendono dalle impostazioni di build, dalla modalità di rilascio e dai timestamp. Usa il percorso indicato dalla build completata correttamente, invece di cercare di prevedere il nome completo del file.

## Segreti e artefatti di debug

Non inserire un token Ubuntu Pro nel controllo del codice sorgente, nella documentazione, nella cronologia della shell o nei log condivisi. Usa preferibilmente un file di configurazione privato, al di fuori del repository:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Imposta `USE_UBUNTU_PRO=true` e `UBUNTU_PRO_TOKEN=...` solo in quel file. La build rimuove lo stato Pro dall’immagine, ma il file sul sistema host continua a contenere il segreto.

`DEBUG_SSH_KEYS=true` genera materiale per chiavi private a scopo di debug. Considera l’immagine risultante temporanea e non pubblicarla mai senza aver verificato che la chiave sia assente.

Riportare l’opzione a `false` non rimuove le chiavi già generate in `build/<target>/image/minios/debug_ssh_key`, nei file `authorized_keys.*` adiacenti o in `build/<target>/debug_ssh_key`. Usa una destinazione pulita o rimuovi esplicitamente quei file, quindi controlla la struttura dell’ISO prima della pubblicazione.

## Risoluzione dei problemi

- Gli errori di bootstrap sono solitamente dovuti all’impossibilità di raggiungere i repository, al supporto di debootstrap, all’architettura, agli snapshot o a prerequisiti host mancanti.
- Gli errori del core e dei moduli sono solitamente dovuti alla disponibilità dei pacchetti, ai filtri CondinAPT, agli script del maintainer, ai contenuti di rootcopy o a un modulo di livello inferiore non aggiornato.
- Gli errori di avvio sono solitamente dovuti al kernel selezionato, allo strumento di creazione di initramfs, al reperimento di EFI, alla generazione di GRUB/SYSLINUX o a input di avvio mancanti.
- Gli errori ISO sono solitamente dovuti alla struttura dell’immagine preparata, a xorriso, allo spazio di output o alle impostazioni di pulizia.

Dopo un’interruzione di una build con privilegi elevati, controlla i mount nella directory di lavoro di destinazione prima di riprovare. Leggi il relativo `build/log/build-*.log`; non modificare direttamente gli overlay generati o i file `.sb`.

## Documentazione correlata

- [Gestione dei moduli](/preparing-and-customizing/Managing-Modules)
- [Creazione di immagini personalizzate](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
