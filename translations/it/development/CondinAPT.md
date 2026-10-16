---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# CondinAPT

CondinAPT seleziona e installa pacchetti APT da un elenco le cui voci possono dipendere dalle variabili di configurazione di Bash. MiniOS lo usa per verificare i prerequisiti dell’host, il set di pacchetti di base e i normali moduli SquashFS.

Questa pagina documenta l’implementazione in `linux-live/condinapt`. CondinAPT non è un risolutore generico di dipendenze: valuta prima i filtri e la disponibilità dei repository, crea le code APT e quindi installa ogni coda selezionata con una singola `apt-get` chiamata.

## Sintassi

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

L’elenco dei pacchetti e il file di configurazione devono essere file regolari e leggibili. I file di mappatura e di priorità sono facoltativi.

| Opzione | Significato |
| --- | --- |
| `-l`, `--package-list PATH` | File dell’elenco dei pacchetti |
| `-c`, `--config PATH` | Configurazione Bash attendibile |
| `-m`, `--filter-mapping PATH` | Mappatura prefisso-variabile |
| `-P`, `--priority-list PATH` | Espressioni regolari Bash per estrarre le priorità |
| `-s`, `--simulation` | Seleziona e visualizza i pacchetti senza installarli |
| `-C`, `--check-only` | Verifica i nomi dei pacchetti installati senza installare nulla |
| `-v`, `--verbose` | Diagnostica dei filtri e delle code |
| `-vv`, `--very-verbose` | Diagnostica aggiuntiva delle code di priorità |
| `-x`, `--xtrace` | Abilita il tracciamento della shell |
| `-f`, `--force` | Esegui `apt-get update` anche se `pkgcache.bin` esiste |
| `-h`, `--help` | Mostra la guida |

CondinAPT esegue `apt-get update` quando non è attiva la modalità di sola verifica e se è stato usato `-f` oppure se `/var/cache/apt/pkgcache.bin` non esiste. Questo vale anche per la simulazione, quindi `-s` non è un’esecuzione di prova priva di effetti collaterali.

Per l’installazione normale sono necessari i privilegi di root. La modalità di sola verifica può essere eseguita senza privilegi; la simulazione richiede i privilegi di root anche quando attiva un aggiornamento APT. L’implementazione attuale non propaga in modo affidabile gli errori di `apt-get update`, quindi considera un errore di aggiornamento come un’esecuzione non riuscita, anche se in seguito CondinAPT restituisce `0`.

## File di input

### Configurazione

Il file `-c` viene caricato con Bash. Contiene codice eseguibile, non dati inerti: usa solo file attendibili.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Gli array indicizzati consentono di applicare filtri di appartenenza. Una variabile scalare contenente virgole resta un’unica stringa esatta: `FEATURES="web,database"` non corrisponde a `+feat=web`.

L’implementazione attuale analizza le opzioni CLI prima di caricare questo file.
Le variabili di configurazione che riutilizzano i nomi interni di CondinAPT, come `VERBOSITY_LEVEL`, possono quindi sovrascrivere lo stato della CLI. Evita questi nomi nelle configurazioni generiche.

### Mappatura dei filtri

Il file `-m` facoltativo associa prefissi brevi ai nomi delle variabili Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Il formato è esattamente `prefix=VariableName`; gli spazi iniziali e finali non vengono rimossi. Le righe vuote e quelle il cui primo campo inizia con `#` vengono ignorate.
In caso di prefissi duplicati, viene usato l'ultimo valore.

Se non è presente una voce di mappatura, il prefisso stesso viene usato come nome della variabile. Una variabile scalare non impostata equivale a una stringa vuota. Un filtro negativo con un errore di battitura può quindi includere silenziosamente un pacchetto: è preferibile usare una mappatura e attivare la simulazione dettagliata quando si aggiungono filtri.

### Elenco dei pacchetti

La sintassi sicura per le righe è:

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

Viene rimosso tutto ciò che si trova dal primo `#` fino alla fine della riga. Gli spazi rimanenti vengono normalizzati. Non sono supportati virgolette, caratteri di escape, parentesi, gruppi annidati né spazi all'interno di un singolo token di filtro. I token finali sconosciuti non vengono rifiutati: considera quindi la sintassi sopra come un vincolo, anziché fare affidamento sulla permissività dell'analisi.

Usa un solo target di release per riga fisica e inseriscilo alla fine. CondinAPT estrae il target prima di valutare le alternative dei pacchetti, quindi non è possibile assegnare valori `@release` diversi alle alternative sulla stessa riga.

## Filtri

Un filtro confronta un valore di configurazione usando l'uguaglianza esatta tra stringhe, distinguendo tra maiuscole e minuscole. Se la variabile mappata è un array indicizzato, il confronto ha esito positivo se corrisponde a un qualsiasi elemento dell'array. Gli array associativi non sono insiemi di appartenenza.

| Forma | Effetto |
| --- | --- |
| `+x=value` | Includi solo se `x` corrisponde |
| `-x=value` | Escludi se `x` corrisponde |
| `+{a|b}` | Require at least one member to match |
| `+{a&b}` | Richiede che corrispondano tutti i membri |
| `-{a|b}` | Exclude when any member matches |
| `-{a&b}` | Esclude solo se corrispondono tutti i membri |

I filtri positivi semplici ripetuti con lo stesso prefisso sono alternative:

```text
audacity +pv=toolbox +pv=ultra
```

I filtri positivi con prefissi diversi devono avere tutti esito positivo. Ogni filtro negativo semplice costituisce un veto indipendente:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

I membri di un gruppo devono usare un solo tipo di operatore. Non combinare `|` e `&` nello stesso gruppo: nei gruppi non esistono precedenze né annidamenti. Per esprimere «escludi Flux oppure richiedi almeno Xfce», usa due filtri:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternative e congiunzioni

`&&` ha precedenza su `||`. CondinAPT suddivide prima le alternative, poi valuta tutti i membri di una congiunzione, quindi:

```text
A || B && C
```

significa `A || (B && C)`.

CondinAPT seleziona la prima alternativa per cui tutti i filtri e i controlli di disponibilità dei pacchetti hanno esito positivo. Se un membro di una congiunzione non supera il controllo, i pacchetti già selezionati per quella congiunzione vengono rimossi dalla selezione e viene valutata l'alternativa successiva.

Questa è una selezione preliminare, non un nuovo tentativo di installazione né una transazione. Se la successiva `apt-get install` a livello di coda non va a buon fine per l'alternativa scelta, CondinAPT non passa a un ramo `||` successivo.

Ogni alternativa deve ripetere i propri filtri:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Pacchetti obbligatori

`!` viene riconosciuto solo all’inizio dell’espressione fisica completa e si applica a tutte le sue alternative:

```text
!preferred-package || fallback-package
```

L’espressione è fatale in modalità normale solo se nessuna alternativa va a buon fine e un pacchetto attivo o una versione rigorosa non è disponibile. I filtri possono disattivare una riga obbligatoria senza causare errori. Un errore di installazione normale di APT interrompe la coda, indipendentemente da `!`.

In modalità simulazione, un errore di disponibilità di un pacchetto obbligatorio viene segnalato, ma non interrompe l’elaborazione della coda; la simulazione termina comunque con lo stato diverso da zero previsto dalla documentazione.

## Versioni

| Sintassi | Comportamento |
| --- | --- |
| `package=VERSION` | Preferisce la versione esatta; in alternativa usa un candidato senza versione specificata |
| `package==VERSION` | Accetta solo la versione esatta del repository |

La disponibilità della versione esatta viene verificata confrontandola con il campo versione completo restituito da `apt-cache madison`. Se una versione rigorosa non obbligatoria non è disponibile, la condizione non è soddisfatta; una successiva alternativa `||` può comunque essere soddisfatta, altrimenti la riga viene ignorata. Per rendere fatale un errore di disponibilità attivo, anteponi all’espressione `!`.

Quando CondinAPT installa la versione esatta richiesta, pianifica `apt-mark hold` dopo il completamento dell’intera coda APT. Una versione esatta già installata è considerata soddisfatta e non viene bloccata nuovamente. Gli errori di blocco non vengono propagati come stato di uscita di CondinAPT.

Per un pacchetto installato senza versione specificata, CondinAPT confronta la versione installata con il candidato del repository. Se sono diverse, il candidato viene messo di nuovo in coda; APT viene eseguito con `--allow-downgrades`.

## Code

`---` termina la coda normale corrente. Tutti i pacchetti selezionati in una coda vengono passati a un’unica chiamata non interattiva di `apt-get install` con `--force-confdef`, `--force-confold`, `--allow-downgrades` e `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Le righe con una release di destinazione vengono rimosse dal flusso delle code normali e raggruppate globalmente per release. Le righe relative alla stessa release vengono unite anche se separate da `---`.
L’ordine di esecuzione effettivo è il seguente:

1. Coda prioritaria senza destinazione.
2. Code prioritarie con release di destinazione.
3. Code normali nell’ordine in cui compaiono nel sorgente.
4. Code rimanenti con release di destinazione, nell’ordine in cui le release vengono incontrate per la prima volta.

Di conseguenza, una riga con una destinazione scritta tra due righe normali non costituisce una barriera e le code con destinazione vengono eseguite dopo tutte le code normali, a meno che non siano estratte come attività prioritarie.

La verifica preliminare della disponibilità nei repository non tiene conto della destinazione; solo la `apt-get install` finale riceve `-t RELEASE`. Verifica i pacchetti con destinazione nei repository configurati.

## Elenco delle priorità

`-P` legge un’espressione regolare estesa Bash per riga. Il pattern viene confrontato con il primo nome di pacchetto di ogni espressione dell’elenco dei pacchetti. Se corrisponde, l’intera espressione, inclusi filtri, alternative, stato di obbligatorietà e destinazione della release, viene spostata in una coda prioritaria.

```text
^dkms$
^linux-.*
```

I pattern non sono ancorati, a meno che non contengano ancore. Una corrispondenza con un pacchetto `&&` o `||` successivo non ha alcun effetto: viene esaminato solo il primo token del pacchetto. L’estrazione delle priorità unisce inoltre le corrispondenze provenienti da code normali distinte; non usarla quindi per voci per cui è necessario mantenere il confine originale tra `---` per organizzare le dipendenze.

La priorità comporta una valutazione e un’installazione anticipate, ma non garantisce l’installazione. Filtri e controlli di disponibilità restano applicabili.

## Modalità operative e codice di uscita

### Simulazione

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

La simulazione valuta filtri, versioni, alternative e code, quindi stampa i pacchetti che verrebbero passati ad APT. Non dimostra che l'installazione successiva andrebbe a buon fine. Una simulazione valida termina intenzionalmente con il codice di uscita `1`, anche quando la selezione dei pacchetti riesce.

### Solo verifica

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

La modalità Solo verifica valuta filtri e operatori, ma controlla soltanto se i nomi dei pacchetti sono installati tramite `dpkg-query`. Non convalida le versioni richieste, i candidati dei repository o le release di destinazione. Restituisce `0` quando tutte le espressioni attive sono soddisfatte e `1` negli altri casi.

Il comando `sudo apt install ...` stampato è un'indicazione diagnostica approssimativa. Non include le versioni né le release di destinazione, può contenere più alternative non riuscite e non garantisce di riprodurre l'espressione originale.

### Riepilogo degli stati

| Caso | Stato |
| --- | --- |
| Descrizione | `0` |
| Esecuzione normale riuscita | `0` |
| Input non valido, requisito di disponibilità obbligatorio non soddisfatto o errore nella coda APT | `1` |
| Simulazione valida | `1` |
| Solo verifica con pacchetti attivi mancanti | `1` |

## Gestione speciale dei pacchetti

L'implementazione prevede un nome di pacchetto speciale: `qemu-kvm`. Viene accettato quando `apt-cache show qemu-kvm` lo segnala come puramente virtuale. Per gli altri pacchetti virtuali non è prevista una risoluzione generica dei provider. Se la portabilità è importante, preferisci alternative esplicite per i provider.

## MiniOS integrazione

### Invocazione del modulo

Per un modulo ordinario, `build-modules` copia lo script di installazione in `/install`, CondinAPT in `/condinapt`, la configurazione generata in `/minios_build.conf` e la mappa in `/condinapt.map`. Uno script di installazione convenzionale è:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Usa `SCRIPT_DIR`; `$CWD` non fa parte del contratto dei moduli ordinari.
`00-core` è una fase di compilazione speciale precedente e richiama invece la copia dell'albero dei sorgenti in `/linux-live`.

Il generatore attuale dei moduli ordinari copia automaticamente solo un file chiamato `packages.list`. I moduli che usano file di elenco aggiuntivi devono predisporre esplicitamente questi input; non dare per scontato che ogni file accanto a `install` si trovi nella root di chroot.

### Mappa dei filtri MiniOS

`linux-live/condinapt.map` definisce attualmente:

| Prefisso | Variabile | Significato |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite di destinazione |
| `da` | `DISTRIBUTION_ARCH` | Architettura di destinazione |
| `dp` | `DISTRIBUTION_PROFILE` | `debian` o `ubuntu` famiglia di pacchetti |
| `is` | `INIT_SYSTEM` | Sistema init selezionato |
| `de` | `DESKTOP_ENVIRONMENT` | Ambiente del modulo |
| `pv` | `PACKAGE_VARIANT` | Variante del pacchetto |
| `ik` | `INSTALL_KERNEL` | Opzione di installazione del kernel |
| `kf` | `KERNEL_FLAVOUR` | Variante del kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` o `minios` |
| `ks` | `KERNEL_SERIES` | Serie effettiva del kernel durante la selezione `01-kernel` DKMS |
| `kc` | `KERNEL_CAPABILITIES` | Array delle funzionalità rilevate durante la selezione `01-kernel` DKMS |
| `kbd` | `KERNEL_BUILD_DKMS` | Opzione di compilazione DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementazione di initramfs |
| `lo` | `LOCALE` | Lingua del sistema |
| `ml` | `MULTILINGUAL` | Opzione multilingua |
| `kl` | `KEEP_LOCALES` | Opzione di mantenimento della lingua |

`ks` e `kc` sono filtri `01-kernel` speciali. Quando è abilitata la compilazione DKMS, quel modulo rileva `KERNEL_SERIES` dal kernel installato e crea l'array indicizzato `KERNEL_CAPABILITIES` in una configurazione temporanea usata per selezionare i pacchetti DKMS. Non sono presenti nelle configurazioni dei moduli ordinari; se usati in tali configurazioni, i filtri positivi non corrispondono e quelli negativi possono corrispondere.
`KERNEL_SERIES` non è la preferenza `MINIOS_KERNEL_SERIES`. Le funzionalità attualmente rilevate includono `aufs`, `ntfs3`, `btf_modules` e i driver `rtw88_*` supportati inclusi nell'albero dei sorgenti.

Esempi dall'elenco attuale dei pacchetti del kernel:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Risoluzione dei problemi

Usa la simulazione dettagliata per esaminare la selezione:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Non usare `/dev/stdin`; `-l` richiede un file regolare.

- Se un filtro viene applicato inaspettatamente, verifica la mappatura esatta dei prefissi, il tipo della variabile, le maiuscole e minuscole e il valore. Controlla che la variabile sia impostata e scritta correttamente.
- Se non viene selezionata un'opzione di fallback, ricorda che il fallback avviene durante il preflight, non dopo un errore APT a livello di coda.
- Se un pacchetto specifico non va a buon fine, controlla le sorgenti configurate ed esegui `apt-cache policy PACKAGE`; il preflight non applica `-t RELEASE`.
- Se una versione specifica viene ignorata, confronta il campo della versione esatto con `apt-cache madison PACKAGE`.
- Se l'ordine della coda è inatteso, considera il raggruppamento globale delle destinazioni e l'estrazione delle priorità prima delle code normali.

Per una panoramica più ampia del flusso di build, consulta [Building MiniOS](/development/Building-MiniOS).
