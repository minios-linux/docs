# Recupero di DynFileFS e storage dynblk

DynFileFS e `dynblk` espongono un'immagine a blocchi `virtual.dat` allocata dinamicamente,
il cui contenuto è memorizzato in una serie di file `changes.dat`. MiniOS formatta
`virtual.dat` come ext4 e lo utilizza per i dati persistenti. `dynblk` è
l'implementazione aggiornata dello stesso formato di storage; MiniOS mantiene il
nome della modalità di persistenza `dynfilefs` e il comando di compatibilità `@mount.dynfilefs` dove richiesto.

Questa guida copre ispezione, migrazione, riparazione del filesystem, recupero sessione
e estrazione dei file. Si applica dopo uno spegnimento non corretto, un dispositivo di storage pieno,
una copia interrotta o un errore nei metadati della sessione.

I sintomi tipici sono:

- MiniOS crea una nuova sessione numerata a ogni avvio.
- `resume` non carica il desktop e i file precedenti.
- Selezionare una vecchia sessione dal menu di avvio non ha effetto.
- Le directory delle sessioni contengono ancora file `changes.dat` ma non vengono attivate.

La causa può essere un segmento di storage incompleto, metadati del contenitore danneggiati,
un filesystem ext4 sporco all'interno di `virtual.dat` o un `session.conf` errato.

## Regole di sicurezza

1. Non riparare l'unica copia di un contenitore di storage.
2. Non copiare sessioni di origine su uno store `minios/changes` in esecuzione o montato.
3. Copia l'intera directory `changes` prima di tentare il recupero.
4. Esegui `e2fsck -y` solo su una copia aggiuntiva di una sessione.
5. Non creare manualmente un file `changes.dat.N` mancante.

Non effettuare la copia iniziale mentre la sessione di origine è in esecuzione o il suo
contenitore DynFileFS è montato. I suoi file di metadati e segmenti possono cambiare
indipendentemente e produrre una copia incoerente. Avvia senza persistenza o usa
un altro sistema Linux. Mantieni inattivi la vista DynFileFS/FUSE, il device di loop `virtual.dat`
e il filesystem ext4 interno. Monta solo il filesystem di storage esterno,
preferibilmente in sola lettura, così i file di segmento di supporto possono essere copiati in modo coerente.

## 1. Individua origine e destinazione

Visualizza filesystem e punti di mount:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Imposta i percorsi per la directory `changes` di origine e una directory di recupero separata
su un dispositivo con spazio libero sufficiente:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Verifica che la destinazione abbia spazio libero a sufficienza:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Copia tutti i file della sessione

Usa `rsync` se disponibile:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

In alternativa:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Non copiare solo il file principale `changes.dat`. Una sessione DynFileFS normalmente
contiene una sequenza completa:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Tutti i segmenti fanno parte di un unico contenitore.

## 3. Identifica una sessione di storage

Confronta le dimensioni delle sessioni e le date di modifica:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Le sessioni vuote o fallite sono di solito di piccole dimensioni. Una sessione che contiene dati
persistenti reali occupa normalmente molto più spazio.

Controlla i metadati della sessione salvata:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS utilizza `session.conf` per selezionare e descrivere le sessioni di persistenza.

## 4. Montare il contenitore DynFileFS o dynblk

Individua l'helper installato. A seconda dell'immagine MiniOS, il nome canonico
può essere `dynblk` oppure il nome compatibile `@mount.dynfilefs`:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Seleziona una sessione candidata, ad esempio la sessione 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Non specificare `-s` o `perchsize` durante questo mount manuale di recupero. Il percorso di avvio
normale può passare `-s` per una dimensione logica richiesta o registrata, ma il recupero
evita intenzionalmente una richiesta di ridimensionamento e legge la dimensione esistente dai
metadati DynFileFS/dynblk.

Un mount riuscito espone `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Verifica il filesystem ext4 senza apportare modifiche:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Poi montalo in sola lettura:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Se i file attesi sono visibili, la sessione può essere recuperata.

Smonta in ordine inverso:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Ripara il filesystem interno

Se il contenitore si monta ma `e2fsck -n` rileva errori ext4, crea prima un'altra copia
di quella sessione:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Monta e ripara solo questa copia:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Ripeti il controllo in sola lettura dalla sezione precedente dopo la riparazione.

## 6. Recuperare in una nuova sessione compatibile

Preferisci il recupero in una sessione appena creata invece di ricostruire i metadati
della sessione danneggiata. Se esiste un export valido `.tar.zst`, avvia normalmente e importalo
con conversione automatica per il filesystem di destinazione:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

L'import crea una nuova sessione numerata. Ispezionala, quindi attivala esplicitamente.

Se solo il contenitore montato è utilizzabile, crea e avvia una nuova sessione in una
modalità compatibile con il filesystem di destinazione. Monta la copia recuperata
in sola lettura come descritto nella sezione 4, quindi copia i file necessari in quella sessione
in esecuzione. Ad esempio, per recuperare le home directory:

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Copia solo i dati e le configurazioni necessari. Questo evita di trattare
metadati di compatibilità sconosciuti o incompleti come una definizione di sessione avviabile.

## 7. Non ricostruire i metadati della sessione sul posto

Non sostituire `session.conf` con un file minimale o aggiungere manualmente una directory recuperata
a uno store esistente. I metadati descrivono ogni sessione in quello store;
sostituirli può rendere orfane sessioni sane, eliminare campi di compatibilità e policy di salvataggio,
e modificare la selezione per il prossimo avvio.

Se il contenitore può essere montato in sola lettura, recupera i suoi file in una nuova sessione compatibile come descritto sopra. Se non può essere montato, conserva la copia offline completa per ulteriori tentativi di recupero filesystem o forense. Un contenitore senza metadati di store affidabili è un input recuperabile, non una definizione di sessione avviabile.

## Riferimento errori

- `cannot open ... changes.dat.N`: manca un segmento confermato. Ricopialo
dal dispositivo sorgente o prova un'altra sessione. Non creare un segmento vuoto.
- `cannot read header`: l'header DynFileFS/dynblk è danneggiato.
- `incompatible data format`: helper e formato del contenitore non corrispondono.
- `virtual.dat` esiste ma ext4 non si monta: verifica una copia con `e2fsck`.

## Prevenire il ripetersi del problema

La maggior parte degli incidenti inizia quando il dispositivo di persistenza si riempie durante l'uso. Riduci il
rischio con queste misure:

- Mantieni una riserva di spazio libero con il parametro di boot `perchreserve` (default
  256 MiB). I contenitori nuovi e in crescita non la consumano mai, e MiniOS avvisa all'avvio
  quando lo spazio libero scende sotto la riserva. Aumentala su dispositivi piccoli o molto usati,
  ad esempio `perchreserve=1024`.
- Elimina sessioni vecchie o inutilizzate prima che il dispositivo si riempia.
- Preferisci una sessione `raw` a dimensione fissa quando hai bisogno di un utilizzo disco prevedibile, così
  la crescita non può esaurire il dispositivo inaspettatamente.
- Spegni correttamente. Uno spegnimento improvviso mentre il dispositivo è pieno è la causa
  più comune di un contenitore che successivamente non può essere montato.
