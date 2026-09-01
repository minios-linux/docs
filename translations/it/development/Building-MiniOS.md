---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# Compilazione di MiniOS

MiniOS viene assemblato a partire da un'immagine core SquashFS, moduli di estensione ordinati, file kernel e di boot, e configurazione generata. Questa pagina descrive le attuali interfacce di build dell'albero sorgente e le dipendenze tra i loro output.

Esegui `./minios-cmd --help`, `./minios-live --help` e ispeziona il file `build.conf` selezionato prima di avviare la compilazione. Questi file sono autorevoli per la versione attualmente estratta.

## Requisiti

Compila su Debian o Ubuntu con sufficiente spazio libero sotto `BUILD_DIR` e `/tmp`.
Un tipico target desktop richiede almeno 20 GiB. Le operazioni di build necessitano dei privilegi root per debootstrap, chroot, mount, dispositivi loop e creazione delle immagini; la visualizzazione dell'aiuto non li richiede.

L'elenco autorevole dei pacchetti host è `linux-live/prerequisites.list`. Per la versione attualmente estratta può essere installato con:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

In un checkout dei sorgenti, `minios-live` controlla questo elenco prima della compilazione, a meno che non sia impostato `SKIP_SETUP_HOST=true`. Su un host normale segnala i pacchetti mancanti e si interrompe; l'installazione automatica è utilizzata solo dal percorso di build in container.

La configurazione predefinita verifica la connettività Internet. Il controllo può essere disabilitato con `CHECK_INTERNET_CONNECTION=false` e viene saltato per un repository cache APT già preparato, ma tutti i pacchetti richiesti e i file di boot devono comunque essere disponibili dai repository o cache configurati.

Se `USE_APT_CACHER=true`, un servizio apt-cacher-ng raggiungibile deve essere già configurato su `APT_CACHER_ADDRESS`; altrimenti imposta l'opzione su `false` prima della compilazione.

::: danger Fiducia nel bootstrap
Il percorso di bootstrap attuale richiama debootstrap con `--no-check-gpg` e scarica la chiave dell'archivio MiniOS tramite HTTP non autenticato. Non utilizzare l'immagine risultante come artefatto di rilascio affidabile finché questi percorsi sorgente non applicano la verifica autenticata della chiave e del bootstrap.
:::

## Compilazione rapida

Clona il repository ed esegui il frontend dalla sua root:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Le quattro opzioni target sono obbligatorie quando non viene selezionato un file di configurazione:

| Opzione | Impostazione |
| --- | --- |
| `-d`, `--distribution` | Suite di distribuzione target |
| `-a`, `--architecture` | Architettura target |
| `-de`, `--desktop-environment` | Ambiente modulo |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox` o `ultra` |

I valori attualmente supportati per distribuzione, architettura, desktop, compressione e variante sono elencati in `linux-live/build.conf`. Non dedurre il supporto da un vecchio esempio di comando.

## Interfacce di build

### `minios-cmd`

`minios-cmd` copia il template di configurazione nella directory di lavoro target, scrive le impostazioni del frontend in quella copia e avvia l'intera pipeline `minios-live -`. Le opzioni comuni includono:

| Opzione | Effetto |
| --- | --- |
| `-b`, `--build-dir` | Seleziona la root di output della build |
| `-c`, `--compression-type` | Seleziona la compressione SquashFS |
| `-kp`, `--kernel-provider` | Seleziona `distribution` o `minios` |
| `-kf`, `--kernel-flavour` | Seleziona una variante kernel della distribuzione |
| `-mk`, `--minios-kernel` | Seleziona il provider kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Seleziona `auto`, `6.1` o `6.12` e implica il provider MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleziona `runtime` o `full` |
| `-dkms`, `--kernel-build-dkms` | Compila driver opzionali per il kernel selezionato |
| `-l`, `--locale` | Imposta la lingua di sistema |
| `-ml`, `--multilingual` | Genera più localizzazioni |
| `-kl`, `--keep-locales` | Mantieni le localizzazioni disponibili |
| `-tz`, `--timezone` | Imposta il fuso orario del live system |
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

Senza un'altra destinazione, questo scrive `build/build.conf`. Anche in questa modalità il frontend richiede i privilegi root.

`--config-file FILE` seleziona una configurazione da copiare. L'implementazione attuale quindi scrive i valori della riga di comando analizzati e i default non vuoti del frontend nella copia di lavoro, nonostante la formulazione più breve in `--help`. Per una configurazione esatta e mantenuta manualmente, invoca direttamente `minios-live` e ispeziona il file attivo invece di affidarti all'unione del frontend.

Non combinare `--config-only` con `--config-file` che punta a una configurazione esistente: la modalità solo-configurazione sovrascrive quel percorso con il template predefinito.
Usa `-b DIR --config-only` per scegliere una destinazione generata separata.

### `minios-live`

`minios-live` è il backend in staging. In un checkout dei sorgenti legge di default `linux-live/build.conf`; una copia installata legge `/etc/minios-live/build.conf`. Seleziona un file diverso e una root di output tramite variabili d'ambiente:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Usa un percorso assoluto `BUILD_CONF` tra `sudo`. I file di configurazione sono sorgenti Bash, quindi utilizza solo file affidabili. Il backend non ha flag per sovrascrivere singole variabili di configurazione.

## Fasi di compilazione

La pipeline viene eseguita in questo ordine:

1. `build-bootstrap` crea la root target minimale con debootstrap.
2. `build-chroot` installa e configura il sistema core.
3. `build-live` crea il modulo `00-core` SquashFS.
4. `build-modules` costruisce i moduli ordinati dell'ambiente selezionato.
5. `build-boot` genera i file initramfs, kernel, EFI e bootloader.
6. `build-config` genera MiniOS e la configurazione di boot.
7. `build-iso` pubblica l'ISO avviabile e il checksum.
8. `remove-sources` elimina la directory di lavoro selezionata quando configurato.

Sono accettati sia i nomi con trattino che le forme con underscore mostrate sopra.

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

Un comando parziale non ricrea gli input omessi. `build-iso` impacchetta solo l'albero immagine preparato e `build-modules` non può ricreare `00-core`. Ricompila fino all'ultima fase dipendente dopo aver modificato un produttore precedente.

Una pipeline completa inizia con `build-bootstrap`, che rimuove le directory `core/` e `image/` esistenti del target selezionato. Conserva qualsiasi contenuto non rigenerabile prima di iniziare; gli alberi target generati sono output di build, non archiviazione sorgente durevole.

Se `REMOVE_SOURCES=true`, la fase finale `remove-sources` elimina e ricrea l'intera directory di lavoro `build/<distribution>-<variant>-<architecture>/`, non solo gli archivi sorgente scaricati. Le ISO pubblicate, le cache condivise e i log al di fuori di quella directory rimangono.

## Configurazione

`linux-live/build.conf` controlla l'identità del target, kernel, lingua, bootloader, utente live, servizi, cache, snapshot, pulizia e pubblicazione. I gruppi importanti includono:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT` e `PACKAGE_VARIANT` selezionano il target e la catena dei moduli.
- `COMP_TYPE` controlla la compressione SquashFS.
- `KERNEL_*` e `MINIOS_KERNEL_SERIES` controllano l'acquisizione e il payload del kernel.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG` e `SERIAL_CONSOLE` controllano gli artefatti di boot.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO` e `USE_APT_CACHER` controllano gli input riutilizzabili.
- `VERBOSITY_LEVEL` accetta `0`, `1` o `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES` e `BUILD_TEST_ISO` controllano pubblicazione e pulizia.

Non modificare un file `build/<target>/build.conf` generato come sostituto della manutenzione della configurazione sorgente selezionata.

### Selezione del kernel

Il provider `distribution` risolve il kernel Debian o Ubuntu selezionato e, quando DKMS è abilitato, anche le intestazioni corrispondenti in uno stato APT firmato e isolato.
`KERNEL_AUTO_SELECT=true` deriva la suite sorgente e l'architettura dal target userspace. Impostalo su `false` per utilizzare i campi manuali di distribuzione, architettura, versione, snapshot e policy di aggiornamento in `build.conf`.

Il provider `minios` installa `linux-image-SERIES-mos-ARCH`, verifica il supporto AUFS e utilizza le intestazioni MiniOS corrispondenti per DKMS. Richiede `KERNEL_FLAVOUR=none` e architetture dei pacchetti userspace e kernel corrispondenti.
Nel codice attuale, `MINIOS_KERNEL_SERIES=auto` risolve in `6.12`; usa esplicitamente `6.1` quando è richiesta quella serie.

`KERNEL_PAYLOAD_MODE=runtime` mantiene l'albero dei moduli kernel, la configurazione del kernel, `System.map`, i metadati di deploy e l'integrazione runtime sotto `modprobe.d`, `modules-load.d` e `udev/rules.d`. Rimuove lo stato dei pacchetti solo-build, le intestazioni, i sorgenti DKMS, gli strumenti di compilazione e i pacchetti initramfs. Il firmware rimane di proprietà di `02-firmware`. `full` mantiene un payload diagnostico più ampio.

## Sistema di moduli

Le sorgenti dei moduli si trovano sotto `linux-live/scripts/`. Un ambiente sotto `linux-live/environments/<desktop>/` contiene symlink ordinati alle sorgenti che utilizza. Il nome locale dell'ambiente controlla l'ordine di build e può rinumerare una sorgente condivisa, ad esempio:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` è prodotto da `build-live` e non è un normale link d'ambiente.
I moduli `01` e successivi sono cumulativi: ciascuno viene costruito sopra i moduli inferiori applicabili. `skip_conditions.conf` può omettere voci per un target, quindi ispeziona l'ambiente selezionato invece di assumere una catena universale.

Usa `linux-live/scripts/10-example/` come template di authoring corrente. Un modulo può contenere:

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

Sono richiesti solo i file necessari al modulo. `build`, `postinstall`, condizioni di skip, patch e alberi rootcopy sono opzionali. `build` e `patches/` non sono disponibili per `00-core`.

La proprietà host negli alberi rootcopy non viene preservata; i file copiati diventano normalmente `root:root`. Un manifest `.minios-ownership` all'interno di un albero rootcopy utilizza:

```text
owner:group relative/path
```

I percorsi devono rimanere all'interno dell'albero. L'host applica il manifest immediatamente e risolve i nomi usando il database account dell'host. Usa valori numerici `UID:GID` per account solo-target, oppure imposta la proprietà da `install` o `postinstall` all'interno del chroot. Spostare il manifest in `rootcopy-postinstall/` non cambia la risoluzione dei nomi.

Poiché il controllo di contenimento attuale non canonicalizza il percorso target, non usare mai componenti `..` o componenti symlink nei percorsi manifest. Ispeziona gli alberi rootcopy prima di una build privilegiata; un percorso creato ad arte può far sì che `chown` lato host esca dall'albero copiato.

Per i pacchetti, gli script di installazione dei moduli ordinari usano i file copiati nel chroot da `build-modules`:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Consulta [CondinAPT](/development/CondinAPT) per la sintassi delle liste pacchetti e la mappa filtro MiniOS attuale.

### Aggiunta di un modulo

Copia il template, quindi collegalo in ogni ambiente desiderato con la posizione locale desiderata:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adatta `packages.list`, script, metadati e contenuto rootcopy prima della compilazione.
Valida ogni desktop, variante, distribuzione e architettura dichiarata.

## Ricompilare in sicurezza

Gli artefatti dei moduli esistenti vengono saltati. Quando cambia un modulo cumulativo inferiore, rimuovi il suo artefatto e tutta la coda dei moduli superiori prima di eseguire `build-modules`; mantenere i moduli superiori conserverebbe contenuti compilati contro il vecchio layer inferiore. Identifica gli artefatti in base all'ordine dell'ambiente selezionato e al nome del modulo perché le condizioni di skip possono chiudere i gap di numerazione.

Il layer kernel è un caso speciale. Per ricompilare solo `01-kernel`, rimuovi il suo artefatto per il target selezionato e ricompila da moduli fino alla pubblicazione:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Conferma il percorso target prima della rimozione. Non applicare questa scorciatoia a `00-core` o presumere che sia sicura per i moduli `02` e successivi.

Per un modulo ordinario come `03-gui-base`, rimuovi il suo artefatto e tutti gli artefatti dei moduli successivi applicabili, quindi esegui lo stesso intervallo `build-modules -`. Per modifiche solo a initramfs, EFI o boot, lascia i moduli SquashFS in posizione ed esegui:

```bash
sudo ./minios-live build-boot -
```

Esegui una build completa dopo modifiche a `00-core`, setup bootstrap/chroot, identità target, policy repository o altri input che non possono essere isolati a una fase successiva.

## Output e log

Con il valore predefinito `BUILD_DIR`, i percorsi importanti sono:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` e `build/iso/*.iso.sha256`
- `build/log/build-*.log`

I nomi delle ISO dipendono dalle impostazioni di build, dalla modalità di rilascio e dai timestamp. Utilizza il percorso stampato dalla build riuscita invece di prevedere il nome base completo.

## Segreti e artefatti di debug

Non inserire un token Ubuntu Pro nel controllo versione, nella documentazione, nella cronologia della shell o nei log condivisi. Preferisci una configurazione privata fuori dal repository:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Imposta `USE_UBUNTU_PRO=true` e `UBUNTU_PRO_TOKEN=...` solo in quel file. La build rimuove lo stato Pro dall'immagine, ma il file lato host contiene ancora il segreto.

`DEBUG_SSH_KEYS=true` genera materiale di chiave privata per il debug. Considera l'immagine risultante come usa e getta e non pubblicarla mai senza aver verificato che la chiave sia assente.

Cambiare l'opzione nuovamente su `false` non rimuove le chiavi già generate in `build/<target>/image/minios/debug_ssh_key`, nei file `authorized_keys.*` adiacenti o in `build/<target>/debug_ssh_key`. Usa un target pulito o rimuovi esplicitamente quei file, quindi ispeziona l'albero ISO prima della pubblicazione.

## Risoluzione dei problemi

- I problemi di bootstrap di solito riguardano la raggiungibilità dei repository, il supporto debootstrap, l'architettura, gli snapshot o i prerequisiti mancanti sull'host.
- I problemi core e dei moduli di solito riguardano la disponibilità dei pacchetti, i filtri CondinAPT, gli script di manutenzione, i contenuti rootcopy o un modulo inferiore obsoleto.
- I problemi di avvio di solito riguardano il kernel selezionato, il generatore initramfs, l'acquisizione EFI, la generazione GRUB/SYSLINUX o input di boot mancanti.
- I problemi ISO di solito riguardano l'albero immagine preparato, xorriso, lo spazio di output o le impostazioni di pulizia.

Dopo una build privilegiata interrotta, ispeziona i mount sotto la directory di lavoro target prima di riprovare. Leggi il relativo `build/log/build-*.log`; non riparare overlay generati o file `.sb` direttamente.

## Documentazione correlata

- [Gestione dei moduli](/preparing-and-customizing/Managing-Modules)
- [Composizione di immagini personalizzate](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
