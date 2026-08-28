---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

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

## Build del frontend

Una normale invocazione di `minios-cmd` richiede tutte e quattro le opzioni di selezione del target:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Ad esempio:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Le impostazioni opzionali comuni includono compressione, comportamento del kernel, lingua, fuso orario, builder initramfs, lingua del menu di avvio e directory di build. Verifica `./minios-cmd --help` invece di presumere che un'opzione sia disponibile.

### Selezione del kernel

Il frontend espone direttamente le impostazioni correnti del kernel:

| Opzione | Effetto |
| --- | --- |
| `-kp`, `--kernel-provider` | Seleziona `distribution` o `minios` |
| `-mk`, `--minios-kernel` | Seleziona il kernel MiniOS abilitato AUFS con selezione automatica della serie |
| `-mks`, `--minios-kernel-series` | Seleziona `auto`, `6.1` o `6.12` e implica il provider MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleziona il payload del modulo kernel `runtime` o `full` |
| `-dkms`, `--kernel-build-dkms` | Compila i driver DKMS opzionali selezionati per il kernel effettivo |

Ad esempio:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv standard \
  -mks 6.1 -kpm runtime -dkms
```

Il provider `distribution` risolve una chiusura del pacchetto kernel firmato in uno stato APT isolato. Quando DKMS è abilitato, quella chiusura fornisce anche gli header corrispondenti al kernel selezionato; la fase DKMS successiva non li sostituisce con il metapacchetto header generico della distribuzione userspace. Gli endpoint normali degli archivi kernel usano HTTP così che apt-cacher-ng possa memorizzare nella cache il contenuto dei pacchetti. APT comunque valida i metadati `InRelease` firmati e gli hash dei pacchetti.

Il provider `minios` installa `linux-image-SERIES-mos-ARCH`, verifica che il kernel abbia il supporto AUFS e usa `linux-headers-SERIES-mos-ARCH` per DKMS.
`KERNEL_FLAVOUR` deve essere `none`, le architetture dei pacchetti userspace e kernel devono corrispondere e la policy di aggiornamento è bloccata. La selezione automatica della serie usa 6.1 per i386, Buster, Bullseye, Bookworm e Jammy; gli altri target supportati usano 6.12. I kernel MiniOS i386 supportano solo la serie 6.1.

`KERNEL_PAYLOAD_MODE=runtime` pubblica l'albero dei moduli kernel, la configurazione del kernel, System.map, i metadati di deployment e i file di integrazione runtime sotto `modprobe.d`, `modules-load.d` e `udev/rules.d`. Esclude il database dpkg di lavoro, gli header, i link di build, i sorgenti DKMS, la toolchain del compilatore, i pacchetti initramfs e il firmware. Il firmware appartiene a `02-firmware`. La modalità `full` mantiene un payload diagnostico più ampio.

Il frontend copia il template di configurazione, scrive i valori forniti dal frontend nella copia e invoca `minios-live -`. Per impostazione predefinita, la copia di lavoro per questo esempio è:

```text
build/trixie-standard-amd64/build.conf
```

Genera una configurazione senza avviare la build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Senza un'altra destinazione, questo scrive `build/build.conf`.

`--config-file FILE` seleziona un file di configurazione. L'help del comando attuale indica che tutte le altre opzioni vengono ignorate in questa modalità, quindi non combinarlo con opzioni di target o tuning:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

Per la modalità opzione frontend, i valori espliciti da riga di comando sovrascrivono i valori corrispondenti del template. Per la modalità file di configurazione, considera il file selezionato come input di configurazione invece di provare a sovrascriverlo con altri flag del frontend.

## Configurazione del backend

In una copia del sorgente, `minios-live` legge `linux-live/build.conf` per impostazione predefinita. Una copia installata utilizza `/etc/minios-live/build.conf`. Il backend importa il file selezionato prima di calcolare i percorsi target e non dispone di flag da riga di comando per sovrascrivere singole impostazioni di configurazione.

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

Non modificare i file generati sotto una directory di lavoro target come sostituto della manutenzione della configurazione selezionata. Consulta `linux-live/build.conf` per opzioni avanzate su kernel, bootloader, lingua, cache, snapshot, moduli, pulizia e pubblicazione.

## Fasi del backend

Le fasi vengono eseguite in questo ordine:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

I nomi delle fasi con trattino mostrati dall'help sono accettati dallo script.

Esegui la pipeline completa:

```bash
sudo ./minios-live -
```

Esegui solo una fase:

```bash
sudo ./minios-live build-iso
```

Esegui un intervallo incluso:

```bash
sudo ./minios-live build-chroot - build-live
```

Esegui dalla prima fase fino a una fase selezionata:

```bash
sudo ./minios-live - build-live
```

Esegui da una fase selezionata fino all'ultima fase:

```bash
sudo ./minios-live build-modules -
```

Questi esempi backend utilizzano il target selezionato nella configurazione attiva. Per gli esempi in questa pagina, imposta prima `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` e `PACKAGE_VARIANT="standard"`.

## Dipendenze tra le fasi

Un comando parziale non ricrea gli output delle fasi precedenti omesse. Le fasi successive utilizzano il filesystem root, i moduli SquashFS, i file di avvio e la configurazione prodotti dalle fasi precedenti.

Ricostruire una fase precedente può quindi rendere obsoleti tutti gli output successivi dipendenti. Ricostruisci fino all'ultima fase interessata e non mantenere moduli con numerazione superiore dopo aver modificato un modulo inferiore su cui sono stati costruiti. In particolare, `build-iso` impacchetta i dati immagine preparati in precedenza; non ricostruisce quei dati.

Utilizza una build completa per un nuovo target o quando gli output precedenti richiesti non esistono:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Output e log

Con la configurazione di checkout e la root di build predefinite, l'esempio trixie utilizza queste posizioni verificate:

- `build/trixie-standard-amd64/core/` per il filesystem core mutabile
- `build/trixie-standard-amd64/image/` per l'albero ISO preparato
- `build/trixie-standard-amd64/image/minios/` per i moduli e i payload MiniOS generati
- `build/iso/` per i file ISO e i relativi sidecar `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` per il log di build catturato

Tutti i percorsi sono relativi a `BUILD_DIR`. I nomi base delle ISO includono le impostazioni di build e, per le build non di rilascio, un timestamp; utilizza il percorso stampato dalla build completata con successo invece di prevedere il nome file completo.

## Token Ubuntu Pro

`--ubuntu-pro-token` abilita l'uso di Ubuntu Pro durante una build frontend. Il codice di build si collega all'interno del chroot, poi si scollega e rimuove lo stato Pro, l'autenticazione del repository, le preferenze e le tracce della keyring prima di creare l'immagine. Questa pulizia non rende il token sicuro da esporre sull'host.

Non inserire un token reale nella documentazione, nel controllo versione, nella cronologia della shell, nell'output CI o in una riga di comando condivisa. Preferisci un file di configurazione privato fuori dal repository, limitato al solo proprietario, e passa solo il suo percorso:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Imposta `USE_UBUNTU_PRO="true"` e `UBUNTU_PRO_TOKEN="..."` in quel file privato. Proteggi e rimuovi qualsiasi configurazione di lavoro lato host contenente il token quando non è più necessaria e verifica che nessun token o dato di autenticazione Pro sia presente negli artefatti pubblicati.
