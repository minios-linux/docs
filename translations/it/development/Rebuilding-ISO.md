# Composizione di immagini ISO MiniOS dalla riga di comando

`minios-image-compose` è il backend a riga di comando fornito con MiniOS Image Builder. Sostituisce l'utility `sb2iso`, ora ritirata. Il comando rimasterizza una struttura di contenuti MiniOS esistente, consente opzionalmente di modificarne il set di moduli e la configurazione supportata, verifica il risultato e pubblica una ISO avviabile.

Utilizza l'interfaccia grafica [MiniOS Image Builder](/development/Image-Builder.md) per un flusso di lavoro guidato. Usa direttamente questo comando per script, automazione o build riproducibili da riga di comando. Per una build completa dai sorgenti, consulta invece [Building MiniOS](/development/Building-MiniOS.md).

## Utilizzo di base

Da una sessione live MiniOS in esecuzione, crea una ISO con la sorgente MiniOS rilevata e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Non anteporre il comando completo con `sudo` o `pkexec`. Composizione, verifica e pubblicazione vengono eseguite con l'utente corrente. Solo la cattura opzionale della sessione può invocare il backend fidato `/usr/bin/savechanges` tramite PolicyKit.

Il nome di output predefinito è `minios-YYYYMMDD_HHMM.iso`. Una destinazione già esistente viene rifiutata a meno che non venga specificato esplicitamente `--overwrite`.

## Seleziona una sorgente

Senza `--source`, il comando rileva i contenuti MiniOS utilizzati dalla sessione LiveKit o dracut corrente. Per rimasterizzare un altro albero MiniOS montato, specifica la directory che contiene `boot/` e i moduli MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La sorgente è un input in sola lettura e non viene mai modificata. I file ISO e i supporti ottici devono essere montati prima di utilizzare il loro albero dei contenuti MiniOS con la CLI. L'Image Builder grafico può montare queste sorgenti tramite `udisksctl`.

## Seleziona i moduli

Moduli `.sb` aggiuntivi sono argomenti posizionali:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Il comando valida ogni modulo come file SquashFS leggibile e non-symlink. I moduli il cui nome inizia con due cifre e un trattino vengono posizionati al livello superiore di MiniOS. Gli altri moduli aggiunti vengono inseriti in `minios/modules/`. Collisions di basename duplicati o insensibili alle maiuscole vengono rifiutate.

Escludi percorsi sorgente con un'espressione regolare estesa POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

File di boot richiesti, kernel e initramfs, moduli core, menu di avvio selezionato e configurazione selezionata non possono essere esclusi.

Crea moduli riutilizzabili prima di comporre la ISO. Consulta [Creazione dei moduli](/development/Creating-Modules.md) e [MiniOS Module Manager](/administration/Module-Manager.md).

## Configurazione e manifest

`--config FILE` installa il file regolare selezionato come `minios/config.conf`. Il valore predefinito è `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Il manifest opzionale deve essere un oggetto JSON. Le etichette dei volumi possono contenere da 1 a 32 caratteri ASCII stampabili; etichette al di fuori del set rigoroso ISO 9660 (maiuscole, cifre e underscore) generano un avviso.

## Cattura delle modifiche della sessione

La cattura della sessione è opzionale e si applica al layer scrivibile della sessione MiniOS attualmente in esecuzione. È accettata per una sorgente esplicita solo se tale sorgente ha la stessa impronta digitale del modulo base del sistema in uso.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

I profili disponibili sono:

- `exact` cattura ogni modifica rappresentabile e può includere credenziali, dati personali, log, stato del browser e identità della macchina.
- `clean` utilizza una allowlist ristretta orientata al software. Riduce l'esposizione ma non garantisce che il risultato non contenga segreti.
- `selected` utilizza una selezione di inventario prodotta da un frontend compatibile o da un workflow `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Preferisci moduli e configurazione dichiarativa rispetto alla cattura della sessione quando la ISO verrà condivisa. Consulta [MiniOS Image Builder](/development/Image-Builder.md) per il modello di privacy e il flusso di revisione.

## Personalizza il comportamento di avvio

La CLI può modificare i layout GRUB e SYSLINUX supportati:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accetta `resume`, `new`, `choose`, `fresh` o `toram`.
`--menu` accetta `multilang` o una lingua supportata come `en_US`, `ru_RU` o `de_DE`. Gli argomenti del kernel vengono validati e aggiunti senza valutazione tramite shell. Layout di menu di avvio non supportati o ambigui vengono rifiutati invece che modificati in modo approssimativo.

## Aggiungi artwork o un overlay filesystem

Sostituisci lo sfondo di avvio con un PNG validato:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Impacchetta una directory preparata come modulo overlay di immagine di proprietà root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

L'overlay viene interpretato in relazione alla root dell'immagine. Non esegue script, non installa pacchetti né apre un chroot. Link non sicuri, file speciali, attraversamenti di filesystem e collisioni di destinazione vengono rifiutati.

## Verifica e pubblicazione

Prima della pubblicazione, `minios-image-compose` verifica la struttura del filesystem ISO, l'etichetta del volume, i record di avvio BIOS e UEFI, l'area di sistema, i file di avvio, i moduli e le personalizzazioni richieste. I moduli overlay generati e quelli di sessione catturata vengono estratti e controllati rispetto ai loro metadati e digest registrati.

La ISO viene costruita in una directory privata sul filesystem di destinazione e pubblicata in modo atomico solo dopo che la verifica è andata a buon fine. Una mutazione degli input, un errore di verifica, una cancellazione o spazio insufficiente sulla destinazione impediscono la pubblicazione. Una destinazione precedente rimane invariata a meno che una build `--overwrite` approvata esplicitamente non raggiunga la pubblicazione atomica.

Crea un checksum ed esegui un test di avvio separato dopo una build riuscita:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La verifica strutturale non sostituisce il test dei percorsi BIOS e UEFI previsti in una macchina virtuale usa e getta o su hardware adeguato.

## Riferimento ai comandi

Consulta il manuale installato e l'output dell'help per la versione esatta del backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Le opzioni comuni includono:

| Opzione | Scopo |
|---|---|
| `-n`, `--name FILE` | Imposta il percorso di output. |
| `-e`, `--exclude REGEX` | Esclude i percorsi sorgente corrispondenti. |
| `--source DIR` | Seleziona un albero di contenuti MiniOS esplicito. |
| `--config FILE` | Seleziona la configurazione live incorporata nella ISO. |
| `--manifest FILE` | Include un manifest di build JSON validato. |
| `--capture-changes MODE` | Cattura le modifiche di sessione `exact`, `clean` o `selected`. |
| `--boot-timeout SECONDS` | Imposta un timeout del menu di avvio da 0 a 300 secondi. |
| `--default-boot MODE` | Seleziona l'azione predefinita della sessione MiniOS. |
| `--kernel-args TEXT` | Aggiunge argomenti globali del kernel validati. |
| `--boot-background PNG` | Sostituisce l'artwork di avvio supportato. |
| `--overlay-directory DIR` | Aggiunge un layer filesystem dichiarativo. |
| `--menu TYPE` | Seleziona un menu multilingue o localizzato. |
| `--overwrite` | Consente esplicitamente la sostituzione di un output esistente. |

Il comando termina con codice diverso da zero quando i controlli su sorgente, moduli, personalizzazione, storage, verifica o pubblicazione falliscono. Non distribuire un output a meno che il comando non sia stato completato con successo e siano stati testati checksum e percorsi di avvio risultanti.
