---
updated: 2026-10-15
---

# Caricamento dei moduli

Questa pagina spiega come cambiano i parametri di avvio `load`, `noload`, `bext`, `union` e `toram=trim`. Si tratta di impostazioni avanzate. Durante un avvio normale vengono caricati automaticamente i moduli forniti dall’immagine MiniOS.

MiniOS seleziona e monta i relativi moduli nell’initrd, prima di passare la root union al sistema init installato. Usa questa pagina se un modulo presente sul supporto di avvio non compare nel sistema in esecuzione o se un filtro modifica inaspettatamente l’avvio.

## In parole semplici

MiniOS è composto da moduli numerati in sola lettura`.sb`. I numeri più bassi vengono caricati per primi; quelli più alti possono sostituire i file dei moduli con numeri inferiori. Se attiva, una sessione scrivibile si colloca al di sopra di tutti i moduli in sola lettura.

I parametri `load=` e `noload=`filtrano i percorsi dei moduli prima dell’assemblaggio. Usano espressioni regolari, non un elenco sicuro di nomi esatti: un filtro troppo ampio può escludere dall’insieme di avvio moduli essenziali o del kernel.

## Spiegazione dei parametri

| Parametro | Funzione in MiniOS | Rischio principale |
|---|---|---|
| `load=PATTERN` | Mantiene solo i moduli candidati il cui percorso corrisponde al pattern. | Un pattern incompleto può escludere moduli necessari. |
| `noload=PATTERN` | Esclude i moduli corrispondenti dopo l’applicazione di `load=`. | Moduli essenziali, del kernel, del firmware o dell’ambiente desktop necessari potrebbero essere esclusi dall’avvio. |
| `bext=EXTENSION` | Considera un’altra estensione di file come suffisso per i moduli candidati. | Non converte i file né gestisce completamente i moduli del kernel. |
| `union=aufs` o `union=overlayfs` | Richiede il filesystem usato per combinare i moduli con il livello scrivibile. | L’attivazione dei moduli in fase di esecuzione differisce tra AUFS e OverlayFS. |
| `toram=trim` | Copia solo i moduli selezionati e una quantità limitata di dati necessari in RAM. | I moduli e le directory esclusi non saranno disponibili dopo lo scollegamento della sorgente. |

Prima di modificare i filtri, annota la riga di comando e l’insieme di moduli correnti. Prova una modifica alla volta e tieni a disposizione una voce di avvio funzionante.

<a id="candidate-tiers"></a>

## Livelli dei moduli candidati

Dopo aver individuato la directory dei dati di MiniOS, normalmente `minios/`, l’initrd rileva un albero MiniOS esterno opzionale prima della copia di RAM o dell’attivazione della sessione. Anche in un avvio senza sessione salvata, tale albero può trovarsi su una partizione di persistenza della stessa unità o in una struttura di dati Ventoy scrivibile. Il backend Persistence Plugin Ventoy selezionato è un modello distinto e non fornisce questo albero di moduli esterno.

I moduli candidati sono divisi in due gruppi:

1. Nomi dei moduli nella directory principale dell’albero dei dati selezionato e dell’albero `minios/` esterno, ordinati e deduplicati in base al nome relativo.
2. File e collegamenti simbolici, ricorsivamente, all’interno di `modules/` in entrambi gli alberi, ordinati e deduplicati in base al percorso relativo.

Per lo stesso percorso relativo, un file regolare esterno ha la precedenza sulla ISO o su un’altra sorgente selezionata. Questo vale sia per i moduli di sistema sostitutivi sia per quelli aggiuntivi. I filtri vengono applicati ai percorsi relativi risultanti dall’unione prima del montaggio o della copia ridotta di RAM. La radice della partizione di persistenza resta separata dall’archivio delle sessioni numerate.

I punti di montaggio vengono comunque appiattiti usando solo il nome esatto del file. Ad esempio, `modules/work/50-extra.sb` e `modules/test/50-extra.sb` fanno entrambi riferimento a `50-extra.sb`; non sono livelli union indipendenti. Usa nomi di file distinti, a meno che non sia prevista una sostituzione con percorso esatto. Non affidarti a nomi di file duplicati in directory diverse come metodo di sostituzione.

Il formato standard dei moduli è un’immagine filesystem SquashFS. La corrispondenza del nome del file non ne convalida il contenuto. Le scansioni ricorsive considerano file e collegamenti simbolici, mentre la scansione della directory principale si basa sui nomi dei file. Se non è possibile collegare una sostituzione esterna o montare un modulo selezionato, ora viene avviato il percorso di errore fatale di initramfs anziché omettere silenziosamente quel livello. Verifica i file dubbi con [Esaminare ed estrarre i moduli](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Ordinamento e precedenza

Durante l'individuazione, i percorsi vengono ordinati numericamente in base al nome del file. Il numero iniziale in nomi come `00-core.sb`, `01-kernel-VERSION.sb` e `50-extra.sb` indica l'ordine del modulo. I nomi senza un numero iniziale vengono ordinati come se il numero fosse zero.
Usa prefissi numerici espliciti e distinti, invece di affidarti all'ordinamento in caso di parità.

Nell'unione finale, i moduli con numero più alto hanno la precedenza su quelli con numero più basso. Se due moduli selezionati contengono lo stesso percorso relativo alla radice, è visibile il file del modulo con priorità più alta. Il livello di modifiche scrivibile ha la precedenza su tutti i moduli di sola lettura.

La sostituzione esterna in base al percorso relativo avviene prima di questo ordinamento effettivo dei moduli. Un file sostitutivo `modules/50-extra.sb` occupa lo stesso slot selezionato del file di origine e il suo prefisso `50` determina la priorità nell'unione.

## Estensione del bundle

Il parametro di avvio `bext=` seleziona l'estensione del nome file usata per individuare i dati, filtrare i candidati e montare i moduli. Il valore predefinito è `sb`, quindi il suffisso abituale dei candidati è `.sb`:

```text
bext=sb
```

La modifica di `bext` cambia il suffisso del nome file selezionato; non converte un file né ne verifica il formato nel filesystem. Il coordinamento del kernel fa eccezione: cerca sempre `01-kernel-VERSION.sb`. Con un'estensione personalizzata, la normale scansione dei candidati non seleziona questi moduli kernel `.sb`.

## Filtri load e noload

`load=` e `noload=` sono espressioni regolari estese non ancorate, applicate alle stringhe dei percorsi candidati prodotte da ciascun livello. Non sono elenchi di nomi esatti. Un valore semplice come `kernel` corrisponde a quel testo ovunque si trovi nel percorso; per richiedere una posizione esatta, occorre specificare esplicitamente gli ancoraggi.
I candidati di primo livello sono nomi di file, mentre quelli ricorsivi includono `modules/`. I candidati esterni usano lo stesso formato di percorso relativo, non i percorsi assoluti di mount della persistenza.

Le virgole vengono convertite nell'alternanza delle espressioni regolari. Ad esempio:

```text
load=core,kernel,firmware
```

viene valutato come `core|kernel|firmware`. Gli altri caratteri delle espressioni regolari non vengono sottoposti a escape.

Un intervallo numerico viene espanso solo se l'intero filtro è un intervallo crescente che corrisponde a `^[0-9]+-[0-9]+$`. Ad esempio, `load=04-06` diventa l'elenco di alternative `04|05|06`, con ogni valore generato completato con zeri fino ad avere almeno due cifre. Un intervallo inserito in un elenco separato da virgole o in un'altra espressione non viene espanso e mantiene il normale significato nelle ERE.

Quando sono presenti entrambi i parametri, initrd applica prima `load=` e poi rimuove le corrispondenze con `noload=`. Di conseguenza, prevale `noload=`. Non esiste un insieme protetto di componenti essenziali o di moduli kernel: i filtri possono escludere `00-core`, il modulo coordinato `01-kernel` o qualsiasi altro candidato. Una selezione di questo tipo può creare una root incompleta o impedire l'avvio.

## Coordinamento del kernel in esecuzione

La versione del kernel in esecuzione viene ricavata da un token `vmlinuz-VERSION` presente nella riga di comando del kernel, se disponibile; in caso contrario, si usa `uname -r` come valore di ripiego. Prima di montare i moduli, initrd coordina questa terna di file di primo livello:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Se manca anche uno solo dei componenti, initrd cerca tutti e tre i file in:

```text
minios/kernels/VERSION/
```

Se la terna nel repository è completa, copia il modulo in `minios/` e i file di avvio in `minios/boot/`. Le copie parziali vengono eliminate. Se la terna non è completa, la configurazione del kernel restituisce un errore, ma il chiamante prosegue con la normale fase di montaggio dei moduli. Il sistema risultante potrebbe comunque non funzionare in seguito, perché il filesystem root non contiene i file di supporto per il kernel in esecuzione.

Gli altri file di primo livello che corrispondono a `01-kernel-*.sb` vengono considerati inattivi. initrd tenta di spostare ogni modulo inattivo e i relativi file `vmlinuz` e `initrfs` in `minios/kernels/VERSION/`. Queste operazioni di ripiego sul repository e di spostamento richiedono un albero dei dati scrivibile; gli errori nei singoli spostamenti non sono fatali. Viene sempre usato `.sb`, indipendentemente da `bext=`. La scansione dei candidati nell'unione esclude inoltre i moduli `01-kernel-*` che non corrispondono al kernel in esecuzione, compresi quelli esterni. Consulta [Gestione del kernel](/preparing-and-customizing/Managing-Kernels) per informazioni sui flussi di lavoro supportati per l'installazione e l'attivazione del kernel.

<a id="union-construction"></a>

## Costruzione dell’unione

MiniOS seleziona `AUFS` quando il kernel in esecuzione lo supporta; altrimenti usa OverlayFS. `union=overlayfs` seleziona OverlayFS. `union=aufs` richiede `AUFS`, ma ripiega su OverlayFS se `AUFS` non è disponibile. Se UEFI Secure Boot è abilitato, initrd non carica il modulo non firmato `aufs-ng`; se non è già disponibile un’altra implementazione utilizzabile di AUFS, viene usato OverlayFS anche se è stato richiesto `union=aufs`.

Con `AUFS`, initrd monta prima un’unione vuota con il ramo delle modifiche scrivibile, quindi aggiunge ogni modulo montato come ramo di sola lettura. Se non è possibile creare l’unione, l’avvio non può proseguire. Se non è possibile aggiungere un singolo ramo `AUFS`, si procede comunque al meglio: l’avvio continua con i rami aggiunti, mentre MiniOS non indica la persistenza come attiva se l’unione è incompleta.

Con OverlayFS, l’intero insieme di moduli viene fornito come un’unica lista `lowerdir`invertita al momento del montaggio dell’unione. Il livello scrivibile fornisce il proprio `upperdir` e `workdir`. Se il montaggio dell’unione non riesce, l’avvio non può proseguire. L’ordine dei livelli inferiori da sinistra a destra e l’ordine di inserimento di `AUFS` applicano la stessa regola: i moduli successivi, con numero più alto, nascondono i percorsi in conflitto dei moduli precedenti.

Questa composizione durante l’avvio è distinta dall’attivazione in fase di esecuzione. Dopo l’avvio, `sb activate` e `sb deactivate` possono modificare solo una root attualmente montata come `AUFS`. I livelli inferiori OverlayFS non possono essere modificati sul posto. L’attivazione in fase di esecuzione non modifica la selezione per il prossimo avvio e l’aggiunta di un modulo per il prossimo avvio non lo attiva nella root corrente. Vedi [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules).

## Riduzione Toram

`toram=trim` crea un albero system-data RAM dopo l’individuazione dei moduli esterni e prima dell’attivazione della sessione e del coordinamento del kernel. Copia:

- `config.conf`, necessario per questa procedura di copia.
- `authorized_keys` se esiste come file regolare.
- I candidati corrispondenti all’estensione nella directory di primo livello selezionati da `load=`, `noload=` e dal filtro del kernel in esecuzione.
- I candidati corrispondenti all’estensione selezionati ricorsivamente sotto `modules/`, mantenendo i relativi percorsi.
- Sostituzioni e aggiunte esterne selezionate secondo le stesse regole, copiate nei rispettivi percorsi.

Crea una directory `changes/` vuota; la copia della sessione è gestita separatamente da `perchtoram`. Non copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, i log, altri dati non relativi ai moduli o moduli non selezionati. In particolare, il ripiego sul repository non può usare una directory `kernels/` omessa dall’albero RAM ridotto. I moduli esterni sono già inclusi, quindi l’avvio RAM non riapre i file originali dopo la copia.

La copia del sistema non prevede un controllo preventivo della capacità RAM. Se la copia di `config.conf` o di un modulo selezionato non riesce, l’errore viene propagato alla voce init e attiva la procedura di errore fatale. Se non riesce la copia di `authorized_keys` facoltativi, l’errore viene segnalato senza interrompere l’avvio. Non è previsto alcun rollback transazionale di un albero system-data popolato solo in parte. La copia della sessione prevede un proprio controllo preventivo della memoria e, se non è possibile prepararla, ripiega sulla sessione originale sul supporto di archiviazione; vedi [Dettagli interni della persistenza](/reference/boot-process/Persistence-Internals).

Dopo la copia, initrd prova a smontare il mount sorgente, rimuovere il vecchio percorso dei dati e spostare l’albero RAM in quel percorso. Solo il completamento corretto dell’intera sequenza indica che la sorgente è stata scollegata. Se la sequenza non riesce, l’avvio prosegue usando invece il percorso di staging RAM. Le operazioni correlate di scollegamento di ISO e Ventoy sono tentativi non bloccanti.
Di conseguenza, `toram=trim` non dimostra che il dispositivo di avvio sia rimovibile. Non scollegarlo a meno che la diagnostica non confermi che il relativo filesystem, dispositivo loop e mapping device-mapper non siano più montati o in uso.

## Rootcopy e passaggio alla root

Dopo il montaggio dei moduli e la costruzione dell’unione, initrd copia i contenuti visibili di `minios/rootcopy/` direttamente nell’unione assemblata. Il glob della shell `*` esclude le voci con il prefisso punto direttamente all’interno di `rootcopy/`, ma i file nascosti all’interno di una directory copiata restano inclusi nella copia di quella directory. Si tratta di una copia di file nella vista scrivibile, non di un altro livello di moduli in sola lettura, quindi può sovrascrivere i percorsi forniti dai moduli. Questa funzione non tratta gli errori di copia come fatali.

MiniOS esegue quindi la configurazione iniziale, scrive il `fstab` della nuova root e carica `rootcopy/run/preinit.sh` se presente, passando il percorso dell’unione come primo argomento. Questo script viene eseguito nell’ambiente initrd prima del passaggio alla root e va considerato codice di avvio con privilegi elevati.

Al passaggio finale, initrd di LiveKit sposta l’unione assemblata in `/`, mantiene il vecchio initrd in `/run/initramfs` per le operazioni di arresto ed esegue il `init` della nuova root. Il percorso Dracut prepara la stessa unione e lascia a Dracut l’esecuzione del `switch_root`. Superato questo passaggio, l’avvio normale avviene all’interno della root composta; modificare i file sul supporto di avvio non ricostruisce più, per quell’avvio, l’insieme selezionato dei livelli inferiori.

## Diagnostica sicura

Preferisci le verifiche in sola lettura e registra la riga di comando originale prima di modificare i filtri:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` mostra la selezione corrente basata sulle regole, mentre `sb list` mostra i livelli che compongono effettivamente la root in esecuzione. Una differenza può indicare un errore di montaggio, una sostituzione basata sul nome del file, una modifica `AUFS` in fase di esecuzione o una sorgente di selezione modificata dopo l’avvio.

In caso di errore nelle prime fasi, aggiungi `debug` per visualizzare il tracciamento della shell, `timing` per i tempi delle fasi oppure `rd.break` per aprire una shell dopo la configurazione di initrd e prima del passaggio finale alla root. Da questa shell, controlla `/memory/data`, `/memory/bundles`, i mount e `/proc/cmdline`; non riparare i filesystem né rimuovere i supporti mentre sono montati. Registra il primo errore di montaggio o copia, non solo il sintomo successivo. Vedi [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting) per una procedura diagnostica sicura più completa.

## Documentazione correlata

- [Modalità di avvio](/using-minios/Boot-Modes)
- [Individuazione del sistema](/reference/boot-process/System-Discovery)
- [Persistenza](/reference/boot-process/Persistence-Internals)
- [Gestore moduli MiniOS](/preparing-and-customizing/Managing-Modules)
- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Gestione del kernel](/preparing-and-customizing/Managing-Kernels)
- [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting)
