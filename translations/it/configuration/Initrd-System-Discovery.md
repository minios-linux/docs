# Rilevamento del sistema Initrd

Dopo che il bootloader ha caricato il kernel e l'initramfs, l'initramfs deve individuare
l'albero dati di MiniOS che fornisce i moduli di sistema `.sb`. Questo avviene prima
che siano attivi lo stack di rete userspace, il desktop e la sessione persistente.

## Precedenza delle sorgenti

La selezione della sorgente segue una precedenza fissa:

1. Un valore letterale `from=http://...` seleziona un ISO HTTP.
2. In caso contrario, qualsiasi valore `ip=` non vuoto seleziona il download PXE.
3. Altrimenti, `from=askdisk` o `from=askdisk:...` apre il selettore disco.
4. Se nessuna delle precedenti, l'initramfs esegue una scansione dei dispositivi di blocco locali.

I due percorsi di rete non effettuano il fallback su supporti locali. Dopo un tentativo HTTP ISO o PXE,
il rilevamento restituisce quel risultato di rete invece di provare i dischi; un
risultato inutilizzabile o incompleto non supera la validazione o la configurazione successiva.

Questo ordine ha due conseguenze importanti:

- `from=http://...` ha la precedenza su `ip=`. L'opzionale `ip=` fornisce quindi
  l'indirizzamento statico per la connessione HTTP ISO.
- Un valore `ip=` non vuoto prevale su qualsiasi valore locale `from=`, inclusi un dispositivo,
  una directory, un percorso ISO o `askdisk`. Non utilizzare `ip=` solo per configurare la
  rete di un sistema avviato localmente.

## Rilevamento locale

In assenza di una sorgente HTTP o di un `ip=` non vuoto, MiniOS effettua 45 passaggi di rilevamento,
approssimativamente uno al secondo. Ogni passaggio aggiorna i nodi dei dispositivi, ottiene i candidati
dispositivo di blocco da `blkid`, ordina i loro nomi e li testa in quell'ordine. Il primo candidato che contiene una sorgente MiniOS valida viene mantenuto;
i dispositivi successivi non vengono considerati.

Se `from=` è vuoto, il percorso testato su ogni filesystem è `minios`. Una sorgente è valida quando quella directory o la sua sottodirectory
`modules/` immediata contiene almeno un file con estensione `.sb` (impostazione predefinita). Il parametro `bext=`
modifica l'estensione utilizzata da questo test. Il rilevamento non verifica che
l'insieme di moduli trovato sia completo o avviabile.

Ogni candidato viene inizialmente montato in sola lettura. Dopo la validazione, MiniOS tenta
di rendere scrivibile il mount selezionato, ma l'impossibilità di farlo non
esclude una sorgente altrimenti valida.

### Formati locali di `from=`

Un percorso relativo o assoluto viene interpretato all'interno di ogni filesystem candidato. Gli slash iniziali vengono normalizzati durante la costruzione del percorso, quindi
entrambi cercano la stessa directory:

```text
from=minios
from=/minios
```

Se il percorso richiesto è un file regolare su un filesystem candidato, MiniOS
lo tratta come un ISO, lo monta in loop in sola lettura e testa la directory `minios`
all'interno dell'ISO:

```text
from=/images/minios.iso
```

I percorsi qualificati dal dispositivo supportano solo queste forme:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` supporta un semplice nome dispositivo seguito da un percorso. La forma con etichetta
deve essere esattamente `/dev/disk/by-label/LABEL/path`; l'etichetta viene risolta con
`blkid`, quindi il percorso rimanente viene testato su quel filesystem.

Non esiste un parser corrispondente per i percorsi UUID, PARTUUID o by-id. Forme come
le seguenti non sono supportate:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Selezione interattiva

Usa `askdisk` per selezionare una partizione e poi testare un percorso su di essa:

```text
from=askdisk
from=askdisk:custom:dir
```

La prima forma testa `minios` sulla partizione selezionata. Nella seconda forma,
i due punti diventano separatori di percorso, quindi `askdisk:custom:dir` testa `custom/dir`.
La sintassi con slash come `from=askdisk/custom/dir` apre comunque il selettore ma
perde silenziosamente il percorso personalizzato e testa `minios`; non usarla.

L'elenco dei dispositivi visualizzato viene aggiornato mentre il selettore è aperto ed esclude
i filesystem di swap. La selezione esegue comunque il normale test di presenza dei moduli;
la sola scelta della partizione non è sufficiente.

## HTTP ISO

Una sorgente HTTP ISO ha questa forma:

```text
from=http://server.example/path/minios.iso
```

Viene riconosciuto solo HTTP semplice. HTTPS e altri schemi URL non sono supportati.
L'initramfs individua la prima interfaccia di rete non loopback rilevata, attiva la rete
e monta l'ISO remoto tramite `httpfs2`. La selezione dell'interfaccia
non verifica la presenza di collegamento, la raggiungibilità o se quella interfaccia sia quella utilizzabile
su un sistema con più NIC.

Quando `ip=` è assente, l'avvio HTTP ISO richiede DHCP con `udhcpc`. Quando `ip=`
è presente, utilizza i campi statici previsti dal parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Per l'avvio HTTP ISO, l'URL determina comunque il server HTTP. I campi statici
configurano l'indirizzo client, la netmask, il gateway predefinito e le prime voci DNS;
il campo porta opzionale appartiene al download file PXE e non sostituisce la porta nell'URL ISO.

`cache=<MB>` abilita una cache httpfs della dimensione richiesta in `/tmp`. Si tratta di
una cache, non di un download completo garantito. Il sistema in esecuzione continua a
dipendere dall'ISO remoto e dalla rete a meno che una copia su RAM non riesca a staccare la sorgente.

## Download dati PXE

Qualsiasi `ip=` non vuoto seleziona il download dati PXE a meno che non sia stato
selezionato prima `from=http://...`. La sintassi supportata è:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

La netmask è in notazione IPv4 puntata. La porta HTTP opzionale predefinita è `7529`.
Forme generiche del kernel o dracut come `ip=dhcp` e
`ip=:::::eth0:dhcp` non sono supportate. Il download dati PXE stesso non ha una
forma DHCP in questo parser.

MiniOS configura la prima interfaccia non loopback rilevata senza verificare che abbia un collegamento funzionante. Richiede prima `PXEFILELIST` e i file MiniOS elencati
tramite HTTP dal campo server. TFTP è un fallback limitato: viene selezionato solo
quando la richiesta HTTP iniziale per `PXEFILELIST` fallisce. Non si tratta di un
failover generale dell'interfaccia, di fallback su supporto locale o di recupero da ogni errore parziale di download HTTP.

## Copia e distacco con `toram=full`

`toram=full` è rilevante per il rilevamento perché può eliminare la dipendenza continua
dalla sorgente selezionata. Dopo il rilevamento, MiniOS copia l'albero dati in RAM e poi tenta di smontare la sorgente e spostare la copia in RAM al suo posto. Solo uno smontaggio e uno spostamento riusciti staccano supporti locali, un ISO montato in loop o un HTTP ISO.

Limitazioni importanti:

- Non viene effettuato alcun controllo preliminare che la RAM disponibile possa contenere la copia.
- Quando viene richiesta la persistenza, la copia `*` di primo livello omette i file nascosti.
- Quando la persistenza non è richiesta, la voce `changes` viene intenzionalmente
  omessa. Quel ramo copia le altre voci di primo livello, inclusi i file nascosti.
- Un errore di copia, smontaggio o spostamento può lasciare la sorgente originale montata. Non
dare per scontato che specificare `toram=full` renda sicura la rimozione del supporto o la perdita di rete;
verifica che il distacco sia avvenuto con successo.

Consulta [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di combinare
`toram` con `perch` o `perchdir`.

## Errori e diagnostica

Se tutti i 45 passaggi locali falliscono, MiniOS entra nel percorso di errore fatale e apre una shell initramfs invece di avviare il sistema live. I percorsi di rete non eseguono la ricerca locale in 45 passaggi né effettuano il fallback su supporti locali; a seconda del risultato parziale, possono fallire il controllo dati o la configurazione successiva. Uscire da una shell fatale non ripara la sorgente mancante e può solo permettere che la configurazione successiva fallisca in modo meno chiaro.

Parametri diagnostici utili sono:

- `debug` abilita il tracing della shell, diagnostica aggiuntiva e shell interattive
  in diversi checkpoint dell'initramfs. Esci da una shell di checkpoint per continuare.
- `timing` stampa il tempo trascorso tra le fasi dell'initramfs e un totale finale.
- `rd.break` richiede una shell initramfs vicino al passaggio al root reale; esci
  per continuare l'avvio.

Dalla shell, ispeziona `/proc/cmdline`, `/proc/net/dev`, `blkid`, i filesystem montati
e `/var/log/livedbg`. Parti dai valori esatti `from=`, `ip=` e
`bext=` mostrati in `/proc/cmdline`.

## Documentazione correlata

- [Modalità di avvio](/configuration/Boot-Modes.md)
- [Caricamento moduli](/configuration/Initrd-Module-Loading.md)
- [Persistenza](/configuration/Initrd-Persistence.md)
- [Avvio da rete](/installation/Network-Boot.md)
- [Parametri di avvio](/configuration/Boot-Parameters.md)
- [Risoluzione dei problemi](/administration/Troubleshooting.md)
