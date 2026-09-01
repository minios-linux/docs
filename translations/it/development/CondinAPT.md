---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# CondinAPT

CondinAPT seleziona e installa pacchetti APT da un elenco le cui voci possono dipendere da variabili di configurazione Bash. MiniOS lo utilizza per i controlli dei prerequisiti dell'host, il set di pacchetti core e i moduli SquashFS ordinari.

Questa pagina documenta l'implementazione in `linux-live/condinapt`. CondinAPT non è un risolutore di dipendenze generale: valuta prima i filtri e la disponibilità dei repository, costruisce le code APT e poi installa ogni coda selezionata in una singola chiamata `apt-get`.

## Sinossi

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

L'elenco dei pacchetti e la configurazione devono essere file regolari leggibili. I file di mapping e di priorità sono opzionali.

| Opzione | Significato |
| --- | --- |
| `-l`, `--package-list PATH` | File elenco pacchetti |
| `-c`, `--config PATH` | Configurazione Bash attendibile |
| `-m`, `--filter-mapping PATH` | Mapping prefisso-variabile |
| `-P`, `--priority-list PATH` | Espressioni regolari Bash per estrazione priorità |
| `-s`, `--simulation` | Seleziona e mostra i pacchetti senza installarli |
| `-C`, `--check-only` | Verifica i nomi dei pacchetti installati senza installazione |
| `-v`, `--verbose` | Diagnostica di filtro e coda |
| `-vv`, `--very-verbose` | Diagnostica aggiuntiva delle code di priorità |
| `-x`, `--xtrace` | Abilita il tracing della shell |
| `-f`, `--force` | Esegui `apt-get update` anche se `pkgcache.bin` esiste |
| `-h`, `--help` | Mostra l'aiuto |

CondinAPT esegue `apt-get update` quando non è in modalità solo verifica e viene usato `-f` oppure `/var/cache/apt/pkgcache.bin` non esiste. Questo include la simulazione, quindi `-s` non è una simulazione senza effetti collaterali.

L'installazione normale richiede i permessi di root. La modalità solo verifica può essere eseguita senza privilegi; la simulazione richiede comunque root se attiva un aggiornamento APT. L'implementazione attuale non propaga in modo affidabile un errore `apt-get update`, quindi considera un errore di aggiornamento come un'esecuzione fallita anche se CondinAPT restituisce successivamente `0`.

## File di input

### Configurazione

Il file `-c` viene caricato tramite Bash. È codice eseguibile, non un formato dati statico, quindi utilizzare solo file attendibili.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Gli array indicizzati forniscono filtri di appartenenza. Uno scalare contenente virgole è comunque una sola stringa esatta: `FEATURES="web,database"` non corrisponde a `+feat=web`.

L'implementazione attuale analizza le opzioni CLI prima di caricare questo file.
Le variabili di configurazione che riutilizzano i nomi interni di CondinAPT, come `VERBOSITY_LEVEL`, possono quindi sovrascrivere lo stato della CLI. Evitare tali nomi nelle configurazioni generiche.

### Mappatura dei filtri

Il file opzionale `-m` mappa prefissi brevi ai nomi delle variabili Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Il formato è esattamente `prefix=VariableName`; gli spazi circostanti non vengono rimossi. Le righe vuote e quelle il cui primo campo inizia con `#` vengono ignorate.
I prefissi duplicati utilizzano l'ultimo valore.

In assenza di una voce di mapping, il prefisso stesso viene considerato come nome della variabile. Uno scalare non impostato si comporta come una stringa vuota. Un filtro negativo scritto male può quindi includere silenziosamente un pacchetto; si consiglia quindi di usare una mappatura e una simulazione dettagliata quando si aggiungono filtri.

### Elenco pacchetti

La grammatica sicura per riga è:

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Esempi:

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Tutto ciò che segue il primo `#` fino alla fine della riga viene rimosso. Gli spazi rimanenti vengono normalizzati. Non sono supportati: virgolette, escape, parentesi, gruppi annidati e spazi all'interno di un singolo token filtro. I token sconosciuti alla fine della riga non vengono respinti, quindi considera la grammatica sopra come un vincolo e non fare affidamento su un parsing permissivo.

Usa un solo target di rilascio per riga fisica e posizionalo alla fine. CondinAPT estrae il target prima di valutare le alternative di pacchetto, quindi valori diversi di `@release` non possono essere assegnati ad alternative sulla stessa riga.

## Filtri

Un filtro confronta un valore di configurazione utilizzando l'uguaglianza esatta e case-sensitive. Se la variabile mappata è un array indicizzato, l'uguaglianza con qualsiasi elemento dell'array è sufficiente. Gli array associativi non sono insiemi di appartenenza.

| Forma | Effetto |
| --- | --- |
| `+x=value` | Includi solo quando `x` corrisponde |
| `-x=value` | Escludi quando `x` corrisponde |
| `+{a|b}` | Richiedi almeno una corrispondenza |
| `+{a&b}` | Richiedi che tutti gli elementi corrispondano |
| `-{a|b}` | Escludi quando almeno un elemento corrisponde |
| `-{a&b}` | Escludi solo quando tutti gli elementi corrispondono |

Filtri positivi semplici ripetuti con lo stesso prefisso sono alternative:

```text
audacity +pv=toolbox +pv=ultra
```

Filtri positivi con prefissi diversi devono passare tutti. Ogni filtro negativo semplice è un veto indipendente:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

I membri di un gruppo devono usare solo un tipo di operatore. Non mescolare `|` e `&` nello stesso gruppo; non esistono precedenze o nidificazioni all'interno dei gruppi. Esprimi "escludi Flux, o minimo Xfce" come due filtri separati:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternative e congiunzioni

`&&` ha precedenza più alta di `||`. CondinAPT divide prima le alternative e poi valuta ogni membro di una congiunzione, quindi:

```text
A || B && C
```

significa `A || (B && C)`.

CondinAPT seleziona la prima alternativa i cui filtri e controlli di disponibilità dei pacchetti vanno tutti a buon fine. Se un membro di una congiunzione fallisce, i pacchetti già selezionati da quella congiunzione vengono annullati e viene valutata la prossima alternativa.

Questa è una selezione preflight, non un tentativo di installazione o una transazione. Se la successiva `apt-get install` a livello di coda fallisce per l'alternativa scelta, CondinAPT non torna a un ramo `||` successivo.

Ogni alternativa deve ripetere i propri filtri:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Pacchetti obbligatori

`!` è riconosciuto solo all'inizio dell'espressione fisica completa e si applica a tutte le sue alternative:

```text
!preferred-package || fallback-package
```

L'espressione è fatale in modalità normale solo quando nessuna alternativa ha successo e un pacchetto attivo o una versione stretta non sono disponibili. I filtri possono disabilitare una riga obbligatoria senza errore. Un normale errore di installazione APT interrompe comunque la coda a prescindere da `!`.

In simulazione, un errore di disponibilità obbligatoria viene segnalato ma non interrompe l'elaborazione delle code; la simulazione termina comunque con lo stato non zero documentato.

## Versioni

| Sintassi | Comportamento |
| --- | --- |
| `package=VERSION` | Preferisce la versione esatta; in alternativa usa il candidato senza versione |
| `package==VERSION` | Accetta solo la versione esatta del repository |

La disponibilità esatta viene confrontata con il campo versione completo da `apt-cache madison`. Se una versione stretta non obbligatoria non è disponibile, quella condizione fallisce; un'alternativa `||` successiva può comunque passare, altrimenti la riga viene saltata. Anteponi l'espressione con `!` per rendere fatale un errore di disponibilità attiva.

Quando CondinAPT installa la versione richiesta esatta, pianifica `apt-mark hold` dopo che l'intera coda APT è andata a buon fine. Una versione esatta già installata è considerata soddisfatta e non viene nuovamente bloccata. Gli errori di blocco non vengono propagati come stato di uscita di CondinAPT.

Per un pacchetto installato senza versione, CondinAPT confronta la versione installata con il candidato del repository. Se il candidato è diverso, viene nuovamente messo in coda; APT viene chiamato con `--allow-downgrades`.

## Code

`---` termina la coda normale corrente. Ogni pacchetto selezionato in una coda viene passato a una chiamata `apt-get install` non interattiva con `--force-confdef`, `--force-confold`, `--allow-downgrades` e `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Le righe con target di rilascio vengono rimosse dal flusso normale delle code e raggruppate globalmente per rilascio. Le righe per lo stesso rilascio vengono unite anche se separate da `---`.
L'ordine effettivo di esecuzione è:

1. Coda di priorità senza target.
2. Code di priorità con target di rilascio.
3. Code normali nell'ordine di origine.
4. Code rimanenti con target di rilascio nell'ordine di primo avvistamento.

Di conseguenza, una riga target scritta tra due righe normali non costituisce una barriera e le code target vengono eseguite dopo tutte le code normali a meno che non siano estratte come lavoro prioritario.

Il preflight di disponibilità dei repository non è consapevole dei target; solo la `apt-get install` finale riceve `-t RELEASE`. Verifica i pacchetti con target rispetto ai repository configurati.

## Elenco priorità

`-P` legge una espressione regolare estesa Bash per riga. Uno schema viene confrontato con il primo nome pacchetto in ogni espressione dell'elenco pacchetti. Se corrisponde, l'intera espressione, inclusi filtri, alternative, stato obbligatorio e target di rilascio, viene spostata in una coda di priorità.

```text
^dkms$
^linux-.*
```

Gli schemi non sono ancorati a meno che non contengano ancore. La corrispondenza con un pacchetto `&&` o `||` successivo non ha effetto; viene ispezionato solo il primo token pacchetto. L'estrazione di priorità unisce anche le corrispondenze da code normali separate, quindi non usarla per voci la cui separazione originale `---` è necessaria per la gestione delle dipendenze.

Priorità significa valutazione e installazione anticipata, non installazione garantita. Filtri e controlli di disponibilità si applicano comunque.

## Modalità operative e stato di uscita

### Simulazione

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

La simulazione valuta filtri, versioni, alternative e code, quindi stampa i pacchetti che verrebbero passati ad APT. Non garantisce che l'installazione successiva abbia successo. Una simulazione valida termina intenzionalmente con stato `1`, anche se la selezione dei pacchetti ha successo.

### Solo verifica

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

La modalità solo verifica valuta filtri e operatori ma controlla solo se i nomi dei pacchetti sono installati tramite `dpkg-query`. Non valida le versioni richieste, i candidati del repository o i target di rilascio. Restituisce `0` quando ogni espressione attiva è soddisfatta e `1` altrimenti.

Il comando `sudo apt install ...` stampato è una diagnostica approssimativa. Perde versioni e target di rilascio, può includere più alternative fallite e non garantisce la riproduzione dell'espressione originale.

### Riepilogo stato

| Caso | Stato |
| --- | --- |
| Aiuto | `0` |
| Esecuzione normale riuscita | `0` |
| Input non valido, errore di disponibilità obbligatoria o errore coda APT | `1` |
| Simulazione valida | `1` |
| Solo controllo con pacchetti attivi mancanti | `1` |

## Gestione speciale dei pacchetti

L'implementazione riconosce un solo nome pacchetto speciale: `qemu-kvm`. Viene accettato quando `apt-cache show qemu-kvm` lo segnala come puramente virtuale. Altri pacchetti virtuali non hanno una risoluzione generica del provider. Si consiglia di preferire alternative di provider esplicite quando la portabilità è importante.

## Integrazione MiniOS

### Invocazione modulo

Per un modulo ordinario, `build-modules` copia lo script di installazione in `/install`, CondinAPT in `/condinapt`, la configurazione generata in `/minios_build.conf` e la mappa in `/condinapt.map`. Uno script di installazione convenzionale è:

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

Utilizzare `SCRIPT_DIR`; `$CWD` non fa parte del contratto dei moduli ordinari.
`00-core` è una fase di build speciale precedente e invoca la copia nella sorgente tramite `/linux-live` invece.

L'attuale builder di moduli ordinari copia automaticamente solo un file chiamato `packages.list`. I moduli che utilizzano nomi di file elenco aggiuntivi devono gestire esplicitamente questi input; non dare per scontato che ogni file accanto a `install` sia presente nella root del chroot.

### Mappa filtri MiniOS

Attualmente `linux-live/condinapt.map` definisce:

| Prefisso | Variabile | Significato |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite di destinazione |
| `da` | `DISTRIBUTION_ARCH` | Architettura di destinazione |
| `dp` | `DISTRIBUTION_PROFILE` | Famiglia di pacchetti `debian` o `ubuntu` |
| `is` | `INIT_SYSTEM` | Init system selezionato |
| `de` | `DESKTOP_ENVIRONMENT` | Ambiente modulo |
| `pv` | `PACKAGE_VARIANT` | Variante pacchetto |
| `ik` | `INSTALL_KERNEL` | Attivazione installazione kernel |
| `kf` | `KERNEL_FLAVOUR` | Flavour kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` o `minios` |
| `ks` | `KERNEL_SERIES` | Serie kernel effettiva durante la selezione DKMS `01-kernel` |
| `kc` | `KERNEL_CAPABILITIES` | Array di capacità rilevate durante la selezione DKMS `01-kernel` |
| `kbd` | `KERNEL_BUILD_DKMS` | Attivazione build DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementazione initramfs |
| `lo` | `LOCALE` | Locale di sistema |
| `ml` | `MULTILINGUAL` | Attivazione multilingua |
| `kl` | `KEEP_LOCALES` | Attivazione conservazione locale |

`ks` e `kc` sono filtri `01-kernel` speciali. Quando la build DKMS è abilitata, quel modulo rileva `KERNEL_SERIES` dal kernel installato e crea l'array indicizzato `KERNEL_CAPABILITIES` in una configurazione temporanea usata per la selezione dei pacchetti DKMS. Non sono presenti nelle configurazioni dei moduli ordinari; usarli lì fa fallire i filtri positivi e può far passare i filtri negativi.
`KERNEL_SERIES` non è la preferenza `MINIOS_KERNEL_SERIES`. Le capacità rilevate attualmente includono `aufs`, `ntfs3`, `btf_modules` e i driver `rtw88_*` supportati in-tree.

Esempi dall'attuale elenco pacchetti kernel:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Risoluzione dei problemi

Utilizza la simulazione dettagliata per ispezionare la selezione:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Non utilizzare `/dev/stdin`; `-l` richiede un file regolare.

- Se un filtro passa inaspettatamente, verifica la mappatura esatta del prefisso, il tipo di variabile, maiuscole/minuscole e valore. Controlla se la variabile è non impostata o scritta male.
- Se una soluzione di fallback non viene selezionata, ricorda che il fallback avviene durante il preflight, non dopo un errore APT a livello di coda.
- Se un pacchetto con target fallisce, controlla le sorgenti configurate ed esegui `apt-cache policy PACKAGE`; il preflight non applica `-t RELEASE`.
- Se una versione stretta viene saltata, confronta il campo versione esatto con `apt-cache madison PACKAGE`.
- Se l'ordine delle code è sorprendente, considera il raggruppamento globale dei target e l'estrazione delle priorità prima delle code normali.

Per il flusso di lavoro di build più ampio, vedi [Building MiniOS](/development/Building-MiniOS).
