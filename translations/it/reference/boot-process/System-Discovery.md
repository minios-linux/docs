---
updated: 2026-08-28
---

# Rilevamento del sistema

Questa pagina spiega cosa modificano i parametri di boot `from`, `ip`, `cache`, `bext`, `toram` e `toram=full`. È pensata per voci di avvio personalizzate, avvio di rete e risoluzione dei problemi. La maggior parte degli utenti può selezionare una voce normale nel menu di avvio senza impostare manualmente questi parametri.

Dopo che il bootloader ha caricato il kernel e l'initramfs, l'initramfs deve individuare l'albero dati MiniOS che fornisce i moduli di sistema `.sb`. Questo avviene prima che siano attivi lo stack di rete utenti standard, il desktop e la sessione persistente.

## In parole semplici

MiniOS deve trovare la directory che contiene i suoi moduli di sistema. Normalmente cerca nei dischi collegati una directory `minios/`. Il parametro `from=` lo indirizza verso una directory o ISO diversa. I parametri di rete sostituiscono questa ricerca locale con un download ISO HTTP o PXE.

Trovare un disco non garantisce che il set di moduli sia completo e trovare i file di sistema non abilita la persistenza. Questi sono passaggi di avvio separati.

## Parametri spiegati

| Parametro | Cosa indica MiniOS | Utilizzo tipico |
|---|---|---|
| `from=PATH` | Cerca MiniOS in una directory specifica o in una ISO invece di accettare la prima sorgente locale trovata. | Avvio di una ISO memorizzata su disco o utilizzo di una directory non standard. |
| `from=askdisk` | Apre un selettore interattivo per la partizione che contiene MiniOS. | Diversi dischi collegati contengono possibili sorgenti. |
| `from=http://...` | Monta una ISO da un server HTTP semplice. | Boot di rete controllato dove il sistema in esecuzione può continuare a dipendere dal server. |
| `ip=...` | Usa il networking statico anticipato. Senza un HTTP `from=`, seleziona il download dei dati PXE e salta i dischi locali. | Deploy PXE o indirizzamento statico per una ISO HTTP. |
| `cache=MB` | Alloca una cache httpfs per una ISO HTTP. Non garantisce che l’intera ISO venga scaricata. | Riduce le letture ripetute da una sorgente HTTP. |
| `bext=EXTENSION` | Cerca i nomi dei file modulo con un’altra estensione invece di `.sb`. | Solo per immagini specializzate; non converte i moduli. |
| `toram` o `toram=full` | Copia l’intero albero dati MiniOS scoperto in RAM e prova a scollegare la sorgente. La forma base significa `full`. | Operazione RAM temporanea su una macchina con sufficiente memoria. |

Se un avvio locale da USB si interrompe prima della comparsa del desktop, rimuovi prima i valori personalizzati di `from=` e `ip=`. Un `ip=` non vuoto inserito per errore impedisce la rilevazione dei dischi locali, mentre un `from=` errato può far cercare a MiniOS un percorso inesistente.

## Precedenza delle sorgenti

La selezione della sorgente segue una precedenza fissa:

1. Un valore letterale `from=http://...` seleziona un ISO HTTP.
2. In caso contrario, qualsiasi valore `ip=` non vuoto seleziona il download PXE.
3. In caso contrario, `from=askdisk` o `from=askdisk:...` apre il selettore disco.
4. In caso contrario, l'initramfs esegue la scansione dei dispositivi a blocchi locali.

I due percorsi di rete non effettuano il fallback sui supporti locali. Dopo un tentativo ISO HTTP o PXE, il rilevamento restituisce quel risultato di rete invece di provare i dischi; un risultato inutilizzabile o incompleto non supera la validazione o la configurazione successiva.

Questo ordine ha due conseguenze importanti:

- `from=http://...` ha la precedenza su `ip=`. L'opzionale `ip=` fornisce quindi l'indirizzamento statico per la connessione ISO HTTP.
- Un `ip=` non vuoto ha la precedenza su qualsiasi valore locale `from=`, inclusi dispositivo, directory, percorso ISO o `askdisk`. Non utilizzare `ip=` solo per configurare la rete di un sistema avviato localmente.

## Rilevamento locale

In assenza di una sorgente HTTP o di un `ip=` non vuoto, MiniOS esegue 45 passaggi di rilevamento, circa uno al secondo. Ogni passaggio aggiorna i nodi dei dispositivi, ottiene i candidati dispositivi a blocchi da `blkid`, ordina i loro nomi e li testa in quell'ordine. Il primo candidato che contiene una sorgente MiniOS valida viene mantenuto; i dispositivi successivi non vengono considerati.

Se `from=` è vuoto, il percorso testato su ogni filesystem è `minios`. Una sorgente è valida quando quella directory o la sua sottodirectory `modules/` immediata contiene almeno un file con estensione `.sb` (impostazione predefinita). Il parametro `bext=` modifica l'estensione usata da questo test. Il rilevamento non verifica che il set di moduli trovato sia completo o avviabile.

Ogni candidato viene inizialmente montato in sola lettura. Dopo la validazione, MiniOS tenta di rendere scrivibile il mount dei dati selezionati, ma l'impossibilità di farlo non esclude una sorgente altrimenti valida.

### Formati locali di `from=`

Un percorso ordinario relativo o assoluto viene interpretato all'interno di ogni filesystem candidato. Gli slash iniziali vengono normalizzati dalla costruzione del percorso, quindi entrambi cercano la stessa directory:

```text
from=minios
from=/minios
```

Se il percorso richiesto è un file regolare su un filesystem candidato, MiniOS lo tratta come un ISO, lo monta in sola lettura tramite loop e testa la directory `minios` all'interno dell'ISO:

```text
from=/images/minios.iso
```

I percorsi qualificati per dispositivo supportano solo questi formati:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` supporta un semplice nome di dispositivo seguito da un percorso. Il formato con etichetta deve essere esattamente `/dev/disk/by-label/LABEL/path`; l'etichetta viene risolta con `blkid`, poi il percorso rimanente viene testato su quel filesystem.

Non esiste un parser corrispondente per percorsi UUID, PARTUUID o by-id. Formati come i seguenti non sono supportati:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Selezione interattiva

Utilizza `askdisk` per selezionare una partizione e poi testare un percorso su di essa:

```text
from=askdisk
from=askdisk:custom:dir
```

La prima forma testa `minios` sulla partizione selezionata. Nella seconda forma, i due punti diventano separatori di percorso, quindi `askdisk:custom:dir` testa `custom/dir`.
La sintassi con slash come `from=askdisk/custom/dir` apre comunque il selettore ma perde silenziosamente il percorso personalizzato e testa `minios`; non usarla.

L'elenco dei dispositivi visualizzato viene aggiornato mentre il selettore è aperto ed esclude i filesystem di swap. La selezione esegue comunque il normale test di presenza dei moduli; la sola scelta della partizione non è sufficiente.

## ISO HTTP

Una sorgente ISO HTTP ha questa forma:

```text
from=http://server.example/path/minios.iso
```

Viene riconosciuto solo HTTP semplice. HTTPS e altri schemi URL non sono supportati.
L'initramfs trova la prima interfaccia di rete non loopback rilevata, attiva la rete e monta l'ISO remoto tramite `httpfs2`. La selezione dell'interfaccia non verifica il collegamento, la raggiungibilità o se quella interfaccia sia effettivamente utilizzabile su un sistema multi-NIC.

Quando `ip=` è assente, l'avvio ISO HTTP richiede DHCP con `udhcpc`. Quando `ip=` è presente, utilizza i campi statici previsti dal parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Per l'avvio ISO HTTP, l'URL determina comunque il server HTTP. I campi statici configurano l'indirizzo client, la netmask, il gateway predefinito e le prime voci DNS; il campo porta opzionale appartiene al download file PXE e non sostituisce la porta nell'URL ISO.

`cache=<MB>` abilita una cache httpfs della dimensione richiesta in `/tmp`. È una cache, non un download garantito completo. Il sistema in esecuzione continua a dipendere dall'ISO remoto e dalla rete a meno che una copia RAM non abbia successo e scolleghi la sorgente.

## Download dati PXE

Qualsiasi valore `ip=` non vuoto seleziona il download dati PXE a meno che non sia stato selezionato prima `from=http://...`. La sintassi supportata è:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

La netmask è in notazione IPv4 puntata. La porta HTTP opzionale predefinita è `7529`.
Formati generici del kernel o di dracut come `ip=dhcp` e `ip=:::::eth0:dhcp` non sono supportati. Il download dati PXE stesso non ha una forma DHCP in questo parser.

MiniOS configura la prima interfaccia non loopback rilevata senza verificare che abbia un collegamento funzionante. Prima richiede `PXEFILELIST` e i file elencati MiniOS via HTTP dal campo server. TFTP è un fallback limitato: viene selezionato solo quando la richiesta HTTP iniziale per `PXEFILELIST` fallisce. Non è un failover generale di interfaccia, fallback su supporto locale o recupero da ogni errore parziale di download HTTP.

## Copia e scollegamento con `toram=full`

`toram=full` è rilevante per il rilevamento perché può eliminare la dipendenza continua dalla sorgente selezionata. Dopo il rilevamento, MiniOS copia l'albero dati in RAM e poi tenta di smontare la sorgente e spostare la copia RAM al suo posto. Solo uno smontaggio e uno spostamento riusciti scollegano supporti locali, un ISO montato in loop o un ISO HTTP.

Limitazioni importanti:

- Non viene effettuato alcun controllo preliminare che la RAM disponibile possa contenere la copia.
- Se viene richiesta la persistenza, la copia `*` di primo livello omette i file nascosti.
- Se la persistenza non è richiesta, la voce `changes` viene omessa intenzionalmente. Quel ramo copia le altre voci di primo livello, inclusi i file nascosti.
- Un errore di copia, smontaggio o spostamento può lasciare la sorgente originale montata. Non dare per scontato che specificare `toram=full` renda sicura la rimozione dei supporti o la perdita di rete; verifica che lo scollegamento sia riuscito.

Consulta [Persistenza Initrd](/reference/boot-process/Persistence-Internals) prima di combinare `toram` con `perch` o `perchdir`.

## Errori e diagnostica

Se tutti i 45 passaggi locali falliscono, MiniOS entra nel percorso di errore fatale e apre una shell initramfs invece di avviare il sistema live. I percorsi di rete non eseguono la ricerca locale in 45 passaggi né fanno fallback sui supporti locali; a seconda del risultato parziale, possono fallire il controllo dati o la configurazione successiva. Uscire da una shell fatale non ripara la sorgente mancante e può solo permettere che la configurazione successiva fallisca in modo meno chiaro.

Parametri diagnostici utili sono:

- `debug` abilita il tracing della shell, diagnostica aggiuntiva e shell interattive in diversi checkpoint dell'initramfs. Uscire da una shell di checkpoint per continuare.
- `timing` stampa i tempi trascorsi tra le fasi dell'initramfs e un totale finale.
- `rd.break` richiede una shell initramfs vicino al passaggio alla root reale; uscire da essa per continuare l'avvio.

Dalla shell, ispeziona `/proc/cmdline`, `/proc/net/dev`, `blkid`, i filesystem montati e `/var/log/livedbg`. Parti dai valori esatti di `from=`, `ip=` e `bext=` mostrati in `/proc/cmdline`.

## Documentazione correlata

- [Modalità di avvio](/using-minios/Boot-Modes)
- [Caricamento moduli](/reference/boot-process/Module-Loading)
- [Persistenza](/reference/boot-process/Persistence-Internals)
- [Avvio da rete](/reference/boot-process/Network-Boot)
- [Parametri di avvio](/reference/Boot-Parameters)
- [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting)
