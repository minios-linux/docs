---
updated: 2026-10-15
---

# Individuazione del sistema

Questa pagina spiega come cambiano `from`, `ip`, `cache`, `bext`, `toram` e `toram=full` i parametri di avvio. Le informazioni sono pensate per voci di avvio personalizzate, l'avvio da rete e la risoluzione dei problemi. La maggior parte degli utenti può selezionare una voce normale nel menu di avvio senza impostare questi parametri manualmente.

Dopo che il bootloader ha caricato il kernel e initramfs, initramfs deve individuare l'albero dei dati MiniOS che fornisce i moduli di sistema `.sb`. Questo avviene prima che siano attivi il normale stack di rete dello spazio utente, l'ambiente desktop e la sessione persistente.

## In parole semplici

MiniOS deve trovare la directory che contiene i moduli di sistema. Normalmente cerca nelle unità collegate una directory `minios/`. Il parametro `from=` indica una directory o un ISO diverso. I parametri di rete sostituiscono questa ricerca locale con un ISO HTTP o un download PXE.

Trovare un'unità non dimostra che il set di moduli sia completo, così come trovare i file di sistema non abilita la persistenza. Si tratta di fasi di avvio distinte.

## Spiegazione dei parametri

| Parametro | A cosa serve MiniOS | Uso tipico |
|---|---|---|
| `from=PATH` | Cerca MiniOS in una directory o in un ISO specifici, invece di usare la prima origine locale corrispondente. | Avvia un ISO archiviato su un disco o usa una directory non standard. |
| `from=askdisk` | Apre un selettore interattivo per la partizione che contiene MiniOS. | Più unità collegate contengono possibili origini. |
| `from=http://...` | Monta un ISO da un server HTTP semplice. | Avvio da rete controllato, in cui il sistema in esecuzione può continuare a dipendere dal server. |
| `ip=...` | Usa la configurazione di rete statica anticipata. Senza un `from=` HTTP, scarica i dati PXE e ignora le unità locali. | Distribuzione PXE o indirizzamento statico per un ISO HTTP. |
| `cache=MB` | Alloca una cache httpfs per un ISO HTTP. Non garantisce che venga scaricato l'ISO completo. | Riduce le letture ripetute da un'origine HTTP. |
| `bext=EXTENSION` | Cerca i nomi dei file dei moduli con un'altra estensione invece di `.sb`. | Solo per immagini specializzate; non converte i moduli. |
| `toram` o `toram=full` | Copia i dati di sistema MiniOS individuati, incluse le voci nascoste di primo livello ma escluso `changes/`, in RAM e prova a scollegare l'origine. La copia della sessione usa invece `perchtoram` separatamente. La forma senza argomenti significa `full`. | operazione RAM su una macchina con memoria sufficiente. |

Se l'avvio da USB locale si interrompe prima che venga visualizzato il desktop, rimuovi prima i valori personalizzati di `from=` e `ip=`. Un valore `ip=` non vuoto impedisce l'individuazione delle unità locali, mentre un valore `from=` errato può far sì che MiniOS cerchi un percorso inesistente.

## Priorità delle origini

La selezione dell'origine segue un ordine di priorità fisso:

1. Un valore letterale `from=http://...` seleziona un ISO HTTP.
2. Altrimenti, qualsiasi valore non vuoto di `ip=` seleziona il download PXE.
3. Altrimenti, `from=askdisk` o `from=askdisk:...` apre il selettore dei dischi.
4. Altrimenti, initramfs analizza i dispositivi a blocchi locali.

I due percorsi di rete non ripiegano sui supporti locali. Dopo un tentativo con un ISO HTTP o PXE, l'individuazione restituisce il risultato di rete invece di provare con i dischi; se il risultato è inutilizzabile o incompleto, la convalida o una fase successiva della configurazione avrà esito negativo.

Questo ordine ha due conseguenze importanti:

- `from=http://...` prevale su `ip=`. L'opzionale `ip=` fornisce quindi l'indirizzamento statico per la connessione all'ISO HTTP.
- Un valore non vuoto di `ip=` prevale su ogni valore locale di `from=`, inclusi un dispositivo, una directory, un percorso ISO o `askdisk`. Non usare `ip=` solo per configurare la rete di un sistema avviato localmente.

## Rilevamento locale

In assenza di una sorgente HTTP o di un `ip=`, MiniOS esegue 45 passaggi di rilevamento, circa uno al secondo. Ogni passaggio aggiorna i nodi dei dispositivi e recupera i candidati di dispositivo a blocchi da `blkid`. Se `/dev/mapper/ventoy` esiste, viene provata per prima la relativa mappatura ISO; i candidati rimanenti vengono ordinati per nome del dispositivo e i duplicati rimossi. Viene mantenuta la prima sorgente MiniOS idonea. In questo modo si evita di scambiare i moduli sostitutivi sulla partizione dati Ventoy per la sorgente ISO principale.

Se `from=` è vuoto, il percorso verificato su ciascun filesystem è `minios`. Una sorgente è idonea se la directory o la relativa sottodirectory immediata `modules/` contiene almeno un file con estensione `.sb` per impostazione predefinita. Il parametro `bext=` modifica l'estensione usata da questa verifica. Il rilevamento non verifica che l'insieme di moduli trovato sia completo o avviabile.

Ogni candidato viene inizialmente montato in sola lettura. Una volta verificata l'idoneità, MiniOS prova a rendere scrivibile il mount dati selezionato, ma l'impossibilità di farlo non esclude una sorgente altrimenti valida.

### Forme `from=` locali

Un normale percorso relativo o apparentemente assoluto viene interpretato all'interno di ogni filesystem candidato. Gli slash iniziali vengono normalizzati durante la creazione del percorso, quindi entrambi cercano la stessa directory:

```text
from=minios
from=/minios
```

Se il percorso richiesto è un file regolare su un filesystem candidato, MiniOS lo tratta come un ISO, lo monta in loop in sola lettura e verifica la directory `minios` all'interno dell'ISO:

```text
from=/images/minios.iso
```

I percorsi con dispositivo specificato supportano solo queste forme:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` supporta un semplice nome di dispositivo seguito da un percorso. La forma con etichetta deve essere esattamente `/dev/disk/by-label/LABEL/path`; l'etichetta viene risolta con `blkid`, quindi il percorso rimanente viene verificato su quel filesystem.

Non esiste un parser corrispondente per i percorsi UUID, PARTUUID o by-id. Forme come le seguenti non sono supportate:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Selezione interattiva

Usa `askdisk` per selezionare una partizione e verificare un percorso al suo interno:

```text
from=askdisk
from=askdisk:custom:dir
```

La prima forma verifica `minios` sulla partizione selezionata. Nella seconda forma, i due punti diventano separatori di percorso, quindi `askdisk:custom:dir` verifica `custom/dir`.
La sintassi con slash, come `from=askdisk/custom/dir` apre comunque il selettore, ma il percorso personalizzato viene ignorato senza avviso e viene verificato `minios`; non usarla.

L'elenco dei dispositivi visualizzato viene aggiornato mentre il selettore è aperto ed esclude i filesystem di swap. La selezione esegue comunque il normale controllo della presenza dei moduli: la sola scelta di una partizione non è sufficiente.

## ISO HTTP

Una sorgente ISO HTTP ha questo formato:

```text
from=http://server.example/path/minios.iso
```

Viene riconosciuto solo HTTP semplice. HTTPS e gli altri schemi URL non sono supportati.
L'initramfs individua la prima interfaccia di rete rilevata che non sia loopback, attiva la rete e monta l'ISO remota tramite `httpfs2`. La selezione dell'interfaccia non verifica la connessione, la raggiungibilità o che l'interfaccia sia quella utilizzabile su un sistema con più schede di rete.

Se `ip=` non è presente, l'avvio da ISO HTTP richiede DHCP con `udhcpc`. Se `ip=` è presente, usa i campi statici previsti dal parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Per l'avvio da ISO HTTP, l'URL determina comunque il server HTTP. I campi statici configurano l'indirizzo client, la netmask, il gateway predefinito e le voci DNS iniziali; il campo porta facoltativo riguarda il download del file PXE e non sostituisce la porta nell'URL ISO.

`cache=<MB>` abilita una cache httpfs della dimensione richiesta in `/tmp`. Si tratta di una cache, non di un download completo garantito. Il sistema in esecuzione continua a dipendere dall'ISO remota e dalla rete, a meno che una copia RAM completata correttamente non scolleghi la sorgente.

## Download dei dati PXE

Qualsiasi valore non vuoto `ip=` seleziona il download dei dati PXE, a meno che `from=http://...` non sia stato selezionato per primo. La sintassi supportata è:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

La netmask è nel formato IPv4 con notazione decimale puntata. La porta HTTP, se omessa, è `7529`.
I formati generici per kernel o dracut, come `ip=dhcp` e `ip=:::::eth0:dhcp` non sono supportati. In questo parser il download dei dati PXE non prevede una modalità DHCP.

MiniOS configura la prima interfaccia rilevata che non sia loopback, senza verificare che il collegamento sia funzionante. Per prima cosa richiede `PXEFILELIST` e i file MiniOS elencati tramite HTTP dal server specificato. TFTP è un'opzione di ripiego limitata: viene selezionato solo se la richiesta HTTP iniziale per `PXEFILELIST` non riesce. Non è un meccanismo generico di failover delle interfacce, un'opzione di ripiego sui supporti locali né un metodo di recupero da ogni errore parziale di download HTTP.

## Copia e scollegamento con `toram=full`

`toram=full` è rilevante per il rilevamento perché può eliminare la dipendenza continua dalla sorgente selezionata. Dopo aver rilevato la sorgente e l'eventuale struttura esterna MiniOS, copia i dati di sistema in RAM, quindi prova a smontare la sorgente e a spostare la copia di RAM al suo posto. La sorgente viene scollegata solo se lo smontaggio e lo spostamento riescono; occorre inoltre rilasciare i filesystem host ISO e le mappature Ventoy.

Limiti importanti:

- Non viene verificato in anticipo che lo spazio RAM disponibile sia sufficiente per la copia.
- La copia completa del sistema include le voci nascoste di primo livello ed esclude `changes/` indipendentemente dal fatto che sia stata richiesta o meno la persistenza. L'eventuale struttura esterna MiniOS rilevata viene copiata sopra la struttura sorgente, inclusi i moduli sostitutivi.
- I contenitori di sessione supportati vengono copiati separatamente con `perchtoram=trim|full`; `perchtoram=off` mantiene la dipendenza dallo storage. Le sessioni native presentano un limite distinto, descritto in [Modalità di avvio](/using-minios/Boot-Modes).
- Gli errori durante la copia del sistema attivano il percorso di errore fatale di initramfs. Se lo smontaggio o lo spostamento non riescono, la sorgente originale può restare montata mentre l'avvio utilizza il percorso di staging RAM. Non dare per scontato che `toram=full` renda sicura la rimozione o la perdita della rete: verifica che la sorgente sia scollegata.

Consulta [Persistenza in initrd](/reference/boot-process/Persistence-Internals) prima di combinare `toram` con `perch` o `perchdir`.

## Errori e diagnostica

Se tutti i 45 tentativi di ricerca locale falliscono, MiniOS attiva il percorso di errore fatale e apre una shell initramfs invece di avviare il sistema live. I percorsi di rete non eseguono la ricerca locale in 45 tentativi né passano ai supporti locali; a seconda del risultato parziale, possono non superare il controllo dei dati o fallire durante le fasi successive di configurazione. Uscire da una shell di errore fatale non ripristina la sorgente mancante e potrebbe soltanto far sì che le fasi successive falliscano in modo meno chiaro.

Parametri utili per la diagnostica:

- `debug` abilita il tracciamento della shell, diagnostica aggiuntiva e shell interattive in vari checkpoint di initramfs. Esci dalla shell di un checkpoint per continuare.
- `timing` mostra il tempo trascorso tra le fasi di initramfs e il tempo totale finale.
- `rd.break` richiede una shell initramfs prima del passaggio alla root reale; esci dalla shell per continuare l'avvio.

In una shell, controlla `/proc/cmdline`, `/proc/net/dev`, `blkid`, i filesystem montati e `/var/log/livedbg`. Inizia dai valori esatti di `from=`, `ip=`, e `bext=` riportati in `/proc/cmdline`.

## Documentazione correlata

- [Modalità di avvio](/using-minios/Boot-Modes)
- [Caricamento dei moduli](/reference/boot-process/Module-Loading)
- [Persistenza](/reference/boot-process/Persistence-Internals)
- [Avvio di rete](/reference/boot-process/Network-Boot)
- [Parametri di avvio](/reference/Boot-Parameters)
- [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting)
