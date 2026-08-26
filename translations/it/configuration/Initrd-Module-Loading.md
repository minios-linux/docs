---
updated: 2026-08-26
---

# Caricamento dei moduli nell'initrd

MiniOS seleziona e monta il proprio set di moduli nell'initrd, prima che la root unificata venga consegnata al sistema init installato. Questa pagina descrive il comportamento attuale dell'initrd. È utile quando un modulo visualizzato sul supporto di avvio non compare in `noload=`, `bext=` o `toram=trim` oppure modifica inaspettatamente l'avvio.

## Livelli candidati

Dopo aver individuato la directory dati di MiniOS, normalmente `minios/`, l'initrd esegue la scansione dei moduli candidati in questo ordine:

1. Voci immediatamente all'interno di `minios/`. Questa scansione non è ricorsiva.
2. Voci ricorsivamente sotto `minios/modules/`.
3. Voci ricorsivamente sotto `minios/modules/` sulla sorgente di persistenza scrivibile registrata dall'initrd.

Il terzo livello è separato dalla directory `minios/modules/` nell'albero dati selezionato in sola lettura. Permette ai moduli utente persistenti di sovrascrivere file provenienti da una ISO o altra sorgente in sola lettura. È disponibile solo quando la rilevazione della persistenza ha pubblicato una root scrivibile che contiene tale directory.

I percorsi candidati vengono appiattiti al loro basename esatto quando vengono montati. Ad esempio, `modules/work/50-extra.sb` e `modules/test/50-extra.sb` utilizzano entrambi il mountpoint chiamato `50-extra.sb`. Non diventano due layer indirizzabili indipendentemente. Un candidato in un livello successivo con lo stesso basename viene montato sullo stesso mountpoint e sostituisce il candidato precedente visibile all'assemblaggio dell'unione. Lo stesso basename deve quindi essere considerato come uno slot di sostituzione, non come un modo per caricare più moduli da directory diverse.

Il formato normale dei moduli è un'immagine filesystem SquashFS regolare. La scansione dell'initrd è guidata dal nome file: seleziona i percorsi che terminano con l'estensione configurata e non verifica prima che ogni percorso sia un file regolare o un SquashFS valido. Le scansioni ricorsive possono quindi incontrare un altro tipo di oggetto filesystem con un nome corrispondente. Un mount loop o SquashFS fallito viene segnalato da `mount`, ma il candidato loop non rende quel fallimento fatale di per sé e l'avvio può continuare con un layer mancante. Valida i file dubbi con il workflow di ispezione in [Creazione dei moduli](/development/Creating-Modules.md).

## Ordinamento e precedenza

Durante la rilevazione, i percorsi vengono ordinati numericamente per basename. Il numero iniziale in nomi come `00-core.sb`, `01-kernel-VERSION.sb` e `50-extra.sb` rappresenta l'ordine del modulo. Un basename senza numero iniziale viene ordinato numericamente come zero. Usa prefissi numerici espliciti e distinti invece di affidarti all'ordinamento in caso di parità.

L'unione finale assegna la precedenza ai moduli successivi, con numerazione più alta, rispetto a quelli precedenti, con numerazione più bassa. Se due moduli selezionati contengono lo stesso percorso relativo alla root, è visibile il file del modulo con priorità più alta. Il layer delle modifiche scrivibili ha precedenza su tutti i moduli in sola lettura.

La sostituzione tra livelli avviene prima di questo ordinamento effettivo dei moduli. Un `50-extra.sb` di un livello successivo sostituisce un file di un livello precedente con lo stesso basename esatto, poi il suo prefisso `50` determina dove quel mount sopravvissuto appartiene nell'unione.

## Estensione dei bundle

Il parametro di boot `bext=` seleziona l'estensione del nome file utilizzata per la rilevazione dei dati, il filtraggio dei candidati e il montaggio dei moduli. Il valore predefinito è `sb`, quindi il suffisso candidato abituale è `.sb`:

```text
bext=sb
```

Modificare `bext` cambia il suffisso del nome file selezionato; non converte un file né verifica il suo formato filesystem. Il coordinamento con il kernel è una limitazione attuale voluta: utilizza ancora nomi letterali `.sb` per `01-kernel-VERSION.sb`. Un `bext` personalizzato quindi non rinomina né coordina per il fatto che una scansione di candidati non-`sb` non li selezionerà.

## Filtri load e noload

`load=` e `noload=` sono espressioni regolari estese non ancorate applicate alle stringhe dei percorsi candidati prodotti da ciascun livello. Non sono elenchi di nomi esatti. Un valore semplice come `kernel` corrisponde a quel testo ovunque in un percorso, mentre gli ancoraggi devono essere forniti esplicitamente quando è richiesta una posizione esatta.
I percorsi differiscono per livello: i candidati di primo livello sono basenames, i candidati ricorsivi dei dati includono `modules/`, e i candidati di persistenza sono percorsi assoluti.

Le virgole vengono convertite in alternanza di espressioni regolari. Ad esempio:

```text
load=core,kernel,firmware
```

viene valutato come `core|kernel|firmware`. Gli altri caratteri delle espressioni regolari non vengono escape.

Un intervallo numerico viene espanso solo quando l'intero filtro è un intervallo crescente che corrisponde a `^[0-9]+-[0-9]+$`. Ad esempio, `load=04-06` diventa le alternative `04|05|06`, con ogni valore generato riempito almeno a due cifre. Un intervallo inserito in una lista separata da virgole o in un'altra espressione non viene espanso e mantiene il suo significato ERE ordinario.

Quando entrambi i parametri sono presenti, l'initrd applica prima `load=` e poi rimuove le corrispondenze con `noload=`. Quindi `noload=` prevale. Non esiste un set di moduli core o kernel protetto: i filtri possono escludere `00-core`, il coordinato `01-kernel` o qualsiasi altro candidato. Una tale selezione può costruire una root incompleta o impedire l'avvio.

## Coordinamento kernel in esecuzione

La versione del kernel in esecuzione viene ricavata da un token `vmlinuz-VERSION` sulla riga di comando del kernel quando disponibile, con `uname -r` come fallback. Prima di montare i moduli, l'initrd coordina questo triplet di primo livello:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Se manca uno dei membri, l'initrd cerca tutti e tre i file in:

```text
minios/kernels/VERSION/
```

Quando il triplet del repository è completo, copia il modulo in `minios/` e i file di boot in `minios/boot/`. Una copia parziale viene eliminata. Se il triplet non è completo, la configurazione del kernel restituisce un errore, ma il chiamante continua alla fase normale di montaggio dei moduli; il sistema risultante può comunque fallire successivamente perché i moduli userspace del kernel in esecuzione sono assenti.

Altri file di primo livello che corrispondono a `01-kernel-*.sb` sono considerati inattivi. L'initrd tenta di spostare ciascun modulo inattivo e i relativi file `vmlinuz` e `initrfs` in `minios/kernels/VERSION/`. Queste operazioni di fallback e rilocazione del repository richiedono un albero dati scrivibile; i singoli errori di rilocazione non sono fatali. Utilizzano sempre `.sb`, indipendentemente da `bext=`. Consulta [Gestione kernel](/administration/Kernel-Management.md) per i workflow supportati di installazione e attivazione del kernel.

## Costruzione dell'unione

MiniOS seleziona `AUFS` quando il kernel in esecuzione lo supporta, altrimenti utilizza
OverlayFS. `union=overlayfs` seleziona OverlayFS. `union=aufs` richiede `AUFS` ma
ricade su OverlayFS se `AUFS` non è disponibile.

Con `AUFS`, l'initrd monta inizialmente un'unione vuota con il ramo delle modifiche
scrivibili, quindi inserisce ogni modulo montato come ramo in sola lettura. Un errore nella
creazione dell'unione è fatale. Un errore durante l'aggiunta di un singolo ramo `AUFS`
è gestito al meglio: l'avvio prosegue con i rami già aggiunti, mentre
l'autorità di persistenza non viene pubblicata per un'unione incompleta.

Con OverlayFS, l'intero set di moduli viene fornito come un'unica lista `lowerdir`
invertita al momento del montaggio dell'unione. Il layer scrivibile fornisce il suo `upperdir` e
`workdir`. Il fallimento nel montare questa unione è fatale. Sia l'ordinamento inferiore da sinistra a destra
che l'ordine di inserimento `AUFS` implementano la stessa regola: i moduli successivi,
con numero più alto, nascondono i percorsi in conflitto dei moduli precedenti.

Questa composizione all'avvio è distinta dall'attivazione a runtime. Dopo l'avvio,
`sb activate` e `sb deactivate` possono modificare solo una root attualmente
montata come `AUFS`. I layer inferiori di OverlayFS non possono essere modificati in loco. L'attivazione a runtime
non modifica la selezione Next Boot e aggiungere un modulo Next Boot
non lo attiva nella root corrente. Vedi
[Gestore Moduli](/administration/Module-Manager.md).

## Toram trim

`toram=trim` crea un albero dati in RAM prima della persistenza e del coordinamento kernel. Copia esattamente questi elementi dall'albero dati MiniOS selezionato:

- `config.conf`, richiesto da questo percorso di copia.
- `authorized_keys` quando esiste come file regolare.
- Candidati di primo livello che corrispondono all'estensione selezionata da `load=` e `noload=`.
- Candidati selezionati che corrispondono all'estensione, ricorsivamente sotto `modules/`, con le relative directory mantenute.
- L'intero albero `changes/` quando la riga di comando richiede la persistenza.

Non copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, altri dati non modulo, moduli non selezionati o il livello separato dei moduli di persistenza scrivibile. In particolare, il fallback del repository non può utilizzare una directory `kernels/` che è stata omessa dall'albero RAM ridotto. Il set di moduli copiato viene filtrato prima che venga scoperto il livello dei moduli di persistenza.

Non esiste un controllo preventivo della capacità RAM. Un errore nella copia di `config.conf` o `changes/` richiesti termina il contesto di esecuzione della funzione di copia, ma i chiamanti non convertono sempre in modo affidabile tale stato in un arresto pulito dell'avvio. Un errore nella copia di `authorized_keys` viene segnalato ma non interrompe la copia. I moduli selezionati vengono copiati tramite una pipeline; un errore nella copia di un singolo modulo viene segnalato, ma il suo stato non viene propagato in modo affidabile per fermare il percorso di avvio esterno. Non esiste un rollback transazionale di un albero RAM parzialmente popolato.

Dopo la copia, l'initrd tenta di smontare il mount di origine, rimuovere il vecchio percorso dati e spostare l'albero RAM in quel percorso. Solo il successo di questa catena completa segna la sorgente come staccata. Se la catena fallisce, l'avvio continua utilizzando invece il percorso di staging RAM. Le operazioni di detach correlate a ISO e Ventoy sono gestite al meglio. Di conseguenza, `toram=trim` non è la prova che il dispositivo di avvio sia rimovibile. Non scollegarlo a meno che la diagnostica non confermi che il suo filesystem, il dispositivo loop e le mappature device-mapper non siano più montate o in uso.

## Rootcopy e il passaggio della root

Dopo il montaggio dei moduli e la costruzione dell'unione, l'initrd copia il contenuto visibile di `minios/rootcopy/` direttamente nell'unione assemblata. Il glob della shell `*` esclude le voci con punto iniziale direttamente dentro `rootcopy/`, anche se i file nascosti all'interno di una directory copiata rimangono parte di quella copia. Questa è una copia di file nella vista scrivibile, non un altro layer di modulo in sola lettura, quindi può sovrascrivere percorsi forniti dai moduli. Gli errori di copia non vengono resi fatali da questa funzione.

MiniOS quindi esegue la configurazione iniziale, scrive il nuovo `fstab` della root e, se presente, esegue `rootcopy/run/preinit.sh`, passando il percorso dell'unione come primo argomento. Questo script viene eseguito nell'ambiente initrd prima del passaggio della root e deve essere trattato come codice di avvio privilegiato.

Al confine finale, l'initrd LiveKit esegue il pivot dell'unione assemblata su `/`, mantiene il vecchio initrd sotto `/run/initramfs` per le operazioni di spegnimento ed esegue il nuovo `init` della root. Il percorso Dracut prepara la stessa unione e lascia che Dracut esegua il pivot finale `switch_root`. Una volta superato questo confine, l'avvio ordinario avviene all'interno della root composta; modificare i file sul supporto di avvio non ricostruisce più il set di layer inferiori selezionato per quell'avvio.

## Diagnostica sicura

Preferire l'ispezione in sola lettura e registrare la riga di comando originale prima di
modificare i filtri:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` mostra la selezione attuale basata sulle regole, mentre `sb list` mostra i
layer che effettivamente compongono la root in esecuzione. Una differenza può indicare un errore di mount,
sostituzione del basename, una modifica `AUFS` a runtime o una sorgente di selezione
che è cambiata dopo l'avvio.

In caso di errore precoce, aggiungere `debug` per mostrare il tracing della shell, `timing` per i tempi delle fasi,
o `rd.break` per aprire una shell dopo la configurazione dell'initrd e prima del passaggio finale della root.
In quella shell, ispezionare `/memory/data`, `/memory/bundles`, i mount
e `/proc/cmdline`; non riparare filesystem né rimuovere supporti mentre sono
montati. Catturare il primo errore di mount o copia, non solo il sintomo successivo. Vedi
[Risoluzione dei problemi](/administration/Troubleshooting.md) per un flusso di lavoro diagnostico sicuro più ampio.

## Documentazione correlata

- [Modalità di avvio](/configuration/Boot-Modes.md)
- [Rilevamento del sistema](/configuration/Initrd-System-Discovery.md)
- [Persistenza](/configuration/Initrd-Persistence.md)
- [Module Manager](/administration/Module-Manager.md)
- [Creazione dei moduli](/development/Creating-Modules.md)
- [Gestione kernel](/administration/Kernel-Management.md)
- [Risoluzione dei problemi](/administration/Troubleshooting.md)
