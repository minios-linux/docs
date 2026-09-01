---
updated: 2026-08-28
---

# Caricamento dei moduli

Questa pagina spiega cosa modificano i parametri di avvio `load`, `noload`, `bext`, `union` e `toram=trim`. Si tratta di controlli avanzati. Un avvio normale carica automaticamente il set di moduli fornito dall'immagine MiniOS selezionata.

MiniOS seleziona e monta il proprio set di moduli nell'initrd, prima che la root union venga consegnata al sistema di init installato. Utilizza questa pagina quando un modulo presente sul supporto di avvio non appare nel sistema in esecuzione o quando un filtro modifica inaspettatamente l'avvio.

## In parole semplici

MiniOS è composta da moduli `.sb` numerati e in sola lettura. I numeri più bassi vengono caricati per primi; i numeri più alti possono sostituire i file dei moduli con numerazione inferiore. Una sessione scrivibile, se attiva, si trova sopra tutti i moduli in sola lettura.

I parametri `load=` e `noload=` filtrano i percorsi dei moduli prima dell'assemblaggio. Utilizzano il matching tramite espressioni regolari invece di un elenco sicuro di nomi esatti, quindi un filtro troppo ampio può escludere moduli core o kernel necessari dal set di avvio.

## Parametri spiegati

| Parametro | Cosa indica a MiniOS | Rischio principale |
|---|---|---|
| `load=PATTERN` | Mantiene solo i candidati modulo i cui percorsi corrispondono al pattern. | Un pattern incompleto può escludere moduli necessari. |
| `noload=PATTERN` | Esclude i candidati corrispondenti dopo che è stato applicato `load=`. | Moduli core, kernel, firmware o desktop necessari potrebbero essere esclusi dall'avvio. |
| `bext=EXTENSION` | Considera un'altra estensione di filename come suffisso candidato modulo. | Non converte i file né coordina completamente i moduli kernel. |
| `union=aufs` o `union=overlayfs` | Richiede il filesystem utilizzato per combinare i moduli con il layer scrivibile. | L'attivazione dei moduli a runtime differisce tra AUFS e OverlayFS. |
| `toram=trim` | Copia solo i moduli selezionati e dati richiesti limitati su RAM. | I moduli e le directory omessi non sono disponibili dopo il distacco della sorgente. |

Prima di modificare i filtri, annota la riga di comando corrente e il set di moduli. Testa una modifica alla volta e mantieni una voce di avvio funzionante nota.

## Livelli dei candidati

Dopo aver individuato la directory dati MiniOS, normalmente `minios/`, l'initrd esegue la scansione dei candidati modulo in questo ordine:

1. Voci immediatamente all'interno di `minios/`. Questa scansione non è ricorsiva.
2. Voci ricorsivamente sotto `minios/modules/`.
3. Voci ricorsivamente sotto `minios/modules/` sulla sorgente di persistenza scrivibile registrata dall'initrd.

Il terzo livello è separato dalla directory `minios/modules/` nell'albero dati in sola lettura selezionato. Permette ai moduli utente persistenti di sovrascrivere file provenienti da una ISO o altra sorgente in sola lettura. È disponibile solo quando la rilevazione della persistenza ha pubblicato una root scrivibile contenente quella directory.

I percorsi dei candidati vengono appiattiti al loro basename esatto durante il mount. Ad esempio, `modules/work/50-extra.sb` e `modules/test/50-extra.sb` utilizzano entrambi il mountpoint chiamato `50-extra.sb`. Non diventano due layer indipendenti indirizzabili. Un candidato in un livello successivo con lo stesso basename viene montato sullo stesso mountpoint e sostituisce il candidato precedente visibile all'assemblaggio della union.
Perciò, lo stesso basename deve essere considerato come uno slot di sostituzione, non come un modo per caricare più moduli da directory diverse.

Il formato modulo normale è un'immagine filesystem SquashFS regolare. La scansione dell'initrd è guidata dal nome file: seleziona i percorsi che terminano con l'estensione configurata e non verifica prima che ogni percorso sia un file regolare o un valido SquashFS. Le scansioni ricorsive possono quindi incontrare un altro tipo di oggetto filesystem con un nome corrispondente. Un loop fallito o un mount SquashFS viene segnalato da `mount`, ma il loop candidato non rende fatale quell'errore e l'avvio può continuare con un layer mancante. Valida i file dubbi con il workflow di ispezione in [Creazione dei moduli](/preparing-and-customizing/Managing-Modules).

## Ordinamento e precedenza

Durante la scoperta, i percorsi vengono ordinati numericamente per basename. Il numero iniziale in nomi come `00-core.sb`, `01-kernel-VERSION.sb` e `50-extra.sb` rappresenta l'ordine dei moduli. Un basename senza numero iniziale viene ordinato numericamente come zero.
Utilizza prefissi numerici espliciti e distinti invece di affidarti all'ordinamento in caso di parità.

La union finale dà precedenza ai moduli successivi, con numerazione più alta, rispetto a quelli precedenti, con numerazione più bassa. Se due moduli selezionati contengono lo stesso percorso relativo alla root, sarà visibile il file del modulo con priorità più alta. Il layer delle modifiche scrivibili ha precedenza su tutti i moduli in sola lettura.

La sostituzione tra livelli avviene prima di questo ordinamento effettivo dei moduli. Un `50-extra.sb` di un livello successivo sostituisce un file di un livello precedente con lo stesso basename esatto, poi il suo prefisso `50` determina dove quel mount sopravvissuto viene inserito nella union.

## Estensione dei bundle

Il parametro di avvio `bext=` seleziona l'estensione del filename utilizzata per la scoperta dei dati, il filtraggio dei candidati e il montaggio dei moduli. Il valore predefinito è `sb`, quindi il suffisso candidato usuale è `.sb`:

```text
bext=sb
```

Modificare `bext` cambia il suffisso selezionato del filename; non converte un file né verifica il suo formato filesystem. La coordinazione del kernel fa eccezione: cerca sempre `01-kernel-VERSION.sb`. Con un'estensione personalizzata, la scansione normale dei candidati non seleziona questi moduli kernel `.sb`.

## Filtri load e noload

`load=` e `noload=` sono espressioni regolari estese non ancorate applicate alle stringhe di percorso dei candidati prodotte da ciascun livello. Non sono elenchi di nomi esatti. Un valore semplice come `kernel` corrisponde a quel testo ovunque in un percorso, mentre gli anchor devono essere forniti esplicitamente quando è richiesta una posizione esatta.
I percorsi variano in base al livello: i candidati di primo livello sono basename, i candidati dati ricorsivi includono `modules/`, e i candidati di persistenza sono percorsi assoluti.

Le virgole vengono convertite in alternanza di espressioni regolari. Ad esempio:

```text
load=core,kernel,firmware
```

viene valutato come `core|kernel|firmware`. Gli altri caratteri delle espressioni regolari non vengono escape.

Un intervallo numerico viene espanso solo quando l'intero filtro è un intervallo ascendente che corrisponde a `^[0-9]+-[0-9]+$`. Ad esempio, `load=04-06` diventa le alternative `04|05|06`, con ciascun valore generato riempito almeno a due cifre. Un intervallo inserito in una lista separata da virgole o in un'altra espressione non viene espanso e mantiene il suo normale significato ERE.

Quando sono presenti entrambi i parametri, l'initrd applica prima `load=` e poi rimuove le corrispondenze con `noload=`. Quindi vince `noload=`. Non esiste un set protetto di moduli core o kernel: i filtri possono escludere `00-core`, il `01-kernel` coordinato o qualsiasi altro candidato. Una selezione del genere può costruire una root incompleta o impedire l'avvio.

## Coordinazione del kernel in esecuzione

La versione del kernel in esecuzione viene presa da un token `vmlinuz-VERSION` sulla riga di comando del kernel quando disponibile, con `uname -r` come fallback. Prima di montare i moduli, l'initrd coordina questo triplet di primo livello:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Se manca uno dei membri, l'initrd cerca tutti e tre i file in:

```text
minios/kernels/VERSION/
```

Quando il triplet del repository è completo, copia il modulo in `minios/` e i file di avvio in `minios/boot/`. Una copia parziale viene rimossa. Se il triplet non è completo, la configurazione del kernel restituisce un errore, ma il chiamante prosegue con la normale fase di mount dei moduli. Il sistema risultante può comunque fallire successivamente perché il filesystem root non ha i file di supporto per il kernel in esecuzione.

Altri file di primo livello che corrispondono a `01-kernel-*.sb` vengono trattati come inattivi. L'initrd tenta di spostare ciascun modulo inattivo e i relativi file `vmlinuz` e `initrfs` corrispondenti in `minios/kernels/VERSION/`. Queste operazioni di fallback e rilocazione del repository richiedono un albero dati scrivibile; i singoli errori di rilocazione non sono fatali. Usano sempre `.sb`, indipendentemente da `bext=`. Consulta [Gestione kernel](/preparing-and-customizing/Managing-Kernels) per i workflow supportati di installazione e attivazione del kernel.

## Creazione dell'unione

MiniOS seleziona `AUFS` quando il kernel in esecuzione lo supporta, altrimenti utilizza OverlayFS. `union=overlayfs` seleziona OverlayFS. `union=aufs` richiede `AUFS`, ma ricorre a OverlayFS se `AUFS` non è disponibile.

Con `AUFS`, l'initrd monta prima un'unione vuota con il ramo delle modifiche scrivibili, quindi inserisce ogni modulo montato come ramo in sola lettura. Un errore nella creazione dell'unione è fatale. Un errore durante l'aggiunta di un singolo ramo `AUFS` viene gestito al meglio: l'avvio prosegue con i rami già aggiunti, mentre MiniOS non considera la persistenza attiva per un'unione incompleta.

Con OverlayFS, l'intero set di moduli viene fornito come un'unica lista `lowerdir` invertita al momento del montaggio dell'unione. Il livello scrivibile fornisce il proprio `upperdir` e `workdir`. Un errore nel montaggio di questa unione è fatale. L'ordinamento inferiore da sinistra a destra e l'ordine di inserimento `AUFS` implementano entrambi la stessa regola: i moduli successivi, con numerazione più alta, nascondono i percorsi in conflitto dei moduli precedenti.

Questa composizione all'avvio è distinta dall'attivazione in fase di esecuzione. Dopo l'avvio, `sb activate` e `sb deactivate` possono modificare solo una root attualmente montata come `AUFS`. I livelli inferiori OverlayFS non possono essere modificati in loco. L'attivazione in fase di esecuzione non modifica la selezione Next Boot, e aggiungere un modulo Next Boot non lo attiva nella root corrente. Consulta [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules).

## Toram trim

`toram=trim` crea un albero dati RAM prima della persistenza e della coordinazione del kernel.
Copia esattamente questi elementi dall'albero dati MiniOS selezionato:

- `config.conf`, richiesto da questo percorso di copia.
- `authorized_keys` quando esiste come file regolare.
- Candidati di primo livello che corrispondono all'estensione selezionati da `load=` e `noload=`.
- Candidati selezionati che corrispondono all'estensione ricorsivamente sotto `modules/`, con le relative directory mantenute.
- L'intero albero `changes/` quando la riga di comando richiede la persistenza.

Non copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, altri dati non modulo, moduli non selezionati o il livello separato dei moduli di persistenza scrivibile. In particolare, il fallback del repository non può utilizzare una directory `kernels/` che è stata omessa dall'albero RAM ridotto. Il set di moduli copiato viene filtrato prima che venga scoperto il livello dei moduli di persistenza.

Non esiste un controllo preventivo della capacità RAM. Un errore nella copia di `config.conf` o dei `changes/` richiesti termina il contesto di esecuzione della funzione di copia, ma i suoi chiamanti non convertono sempre quello stato in un arresto pulito dell'avvio. Un errore nella copia di `authorized_keys` viene segnalato ma non interrompe la copia. I moduli selezionati vengono copiati tramite una pipeline; un errore nella copia di un singolo modulo viene segnalato, ma il suo stato non viene sempre propagato per fermare il percorso di avvio esterno. Non esiste un rollback transazionale di un albero RAM parzialmente popolato.

Dopo la copia, l'initrd tenta di smontare il mount di origine, rimuovere il vecchio percorso dati e spostare l'albero RAM in quel percorso. Solo il successo di questa catena completa segna la sorgente come staccata. Se la catena fallisce, l'avvio prosegue utilizzando invece il percorso di staging RAM. Le operazioni di distacco correlate di ISO e Ventoy sono gestite al meglio.
Di conseguenza, `toram=trim` non è la prova che il dispositivo di avvio sia rimovibile. Non scollegarlo a meno che la diagnostica non confermi che il suo filesystem, il dispositivo loop e le mappature device-mapper non siano più montate o in uso.

## Rootcopy e passaggio della root

Dopo il mount dei moduli e la costruzione della union, l'initrd copia il contenuto visibile di `minios/rootcopy/` direttamente nella union assemblata. Il glob della shell `*` esclude le voci con punto iniziale direttamente dentro `rootcopy/`, anche se i file nascosti all'interno di una directory copiata restano parte di quella copia. Questa è una copia di file nella vista scrivibile, non un altro layer modulo in sola lettura, quindi può sovrascrivere i percorsi forniti dai moduli. Gli errori di copia non vengono resi fatali da questa funzione.

MiniOS esegue quindi la propria configurazione iniziale, scrive il `fstab` della nuova root e, se presente, esegue il `rootcopy/run/preinit.sh`, passando il percorso della union come primo argomento. Questo script viene eseguito nell'ambiente initrd prima del passaggio della root e deve essere trattato come codice di avvio privilegiato.

Al confine finale, l'initrd di LiveKit effettua il pivot della union assemblata su `/`, mantiene il vecchio initrd sotto `/run/initramfs` per le operazioni di spegnimento ed esegue il `init` della nuova root. Il percorso Dracut prepara la stessa union e lascia che Dracut esegua il `switch_root` finale. Una volta superato questo confine, l'avvio ordinario avviene all'interno della root composta; modificare i file sul supporto di avvio non ricostruisce più il set di layer inferiori selezionato per quell'avvio.

## Diagnostica sicura

Preferisci l'ispezione in sola lettura e registra la riga di comando originale prima di modificare i filtri:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` mostra la selezione corrente basata sulle regole, mentre `sb list` mostra i layer che compongono effettivamente la root in esecuzione. Una differenza può indicare un errore di mount, una sostituzione di basename, una modifica `AUFS` a runtime o una sorgente di selezione cambiata dopo l'avvio.

Per un errore precoce, aggiungi `debug` per mostrare il tracing della shell, `timing` per i tempi delle fasi o `rd.break` per aprire una shell dopo la configurazione dell'initrd e prima del passaggio finale della root. In quella shell, ispeziona `/memory/data`, `/memory/bundles`, i mount e `/proc/cmdline`; non riparare filesystem né rimuovere supporti mentre sono montati. Cattura il primo errore di mount o copia, non solo il sintomo successivo. Consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting) per un workflow diagnostico sicuro più ampio.

## Documentazione correlata

- [Modalità di avvio](/using-minios/Boot-Modes)
- [Rilevamento del sistema](/reference/boot-process/System-Discovery)
- [Persistenza](/reference/boot-process/Persistence-Internals)
- [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules)
- [Creazione di moduli](/preparing-and-customizing/Managing-Modules)
- [Gestione del kernel](/preparing-and-customizing/Managing-Kernels)
- [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting)
