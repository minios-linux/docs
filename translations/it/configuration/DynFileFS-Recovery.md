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
2. Non sovrascrivere le sessioni di origine sull'attuale `minios/changes` attivo.
3. Copia l'intera directory `changes` prima di tentare il recupero.
4. Esegui `e2fsck -y` solo su una copia aggiuntiva di una sessione.
5. Non creare manualmente un file `changes.dat.N` mancante.

Se MiniOS è attualmente in esecuzione con persistenza e il dispositivo di origine è
montato, è sicuro effettuare la copia iniziale. Non sostituire `session.conf`
fino a quando MiniOS non è stato avviato senza persistenza.

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

## 4. Monta il contenitore DynFileFS o dynblk

Individua l'helper installato. A seconda dell'immagine MiniOS, il nome canonico
può essere `dynblk` oppure il nome di compatibilità `@mount.dynfilefs`:

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

Non specificare `-s` o `perchsize` durante il recupero di un contenitore esistente. La dimensione virtuale è memorizzata nei metadati DynFileFS/dynblk.

Un mount riuscito espone `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Controlla il filesystem ext4 senza apportare modifiche:

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

## 6. Ripristina la sessione per l'avvio

Esegui questo passaggio dopo aver spento la sessione persistente e avviato MiniOS
senza `perch`, `perchdir` o `perchmode`. Può essere eseguito anche da
un altro sistema Linux.

Copia il contenitore recuperato in una directory di sessione numerica non utilizzata. Usare un nuovo numero evita di sovrascrivere una sessione attuale:

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Se non è stata necessaria la riparazione del filesystem, copia da `$RECOVERY/$SESSION` invece che da `$REPAIR`.

Esegui il backup e sostituisci i metadati della sessione:

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

I metadati minimi omettono volutamente i campi versione, edition e union,
in modo che eventuali dati di compatibilità obsoleti non costringano MiniOS a creare un'altra sessione.

Avvia MiniOS con:

```text
perchdir=resume perchmode=dynfilefs
```

Non aggiungere `perchdir=new` o `perchsize` durante questo primo avvio di recupero.

## 7. Recupera i file senza avviare la sessione

Se il contenitore si monta manualmente ma non può essere utilizzato come sessione di avvio, copia
i file importanti dal mount in sola lettura in una nuova sessione di lavoro:

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Riferimento errori

- `cannot open ... changes.dat.N`: manca un segmento già scritto. Ricopialo
dal dispositivo di origine o prova un'altra sessione. Non creare un segmento vuoto.
- `cannot read header`: l'intestazione DynFileFS/dynblk è danneggiata.
- `incompatible data format`: helper e formato del contenitore non corrispondono.
- `virtual.dat` esiste ma ext4 non si monta: controlla una copia con `e2fsck`.
- Il contenitore si monta ma MiniOS crea una nuova sessione: verifica che
  `session.conf` punti al numero ripristinato e contenga
  `session_mode[N]=dynfilefs`.

## Prevenire il problema

La maggior parte degli incidenti inizia quando il dispositivo di persistenza si riempie durante l'uso. Riduci il rischio con queste misure:

- Mantieni una riserva di spazio libero con il parametro di boot `perchreserve` (predefinito
  256 MB). I contenitori nuovi e quelli in crescita non la utilizzano mai, e MiniOS avvisa all'avvio
  quando lo spazio libero scende sotto la riserva. Aumentala su dispositivi piccoli o molto usati, ad esempio `perchreserve=1024`.
- Elimina le sessioni vecchie o inutilizzate prima che il dispositivo si riempia.
- Preferisci una sessione `raw` a dimensione fissa se hai bisogno di un utilizzo prevedibile del disco, così la crescita non può esaurire inaspettatamente il dispositivo.
- Spegni sempre correttamente. Uno spegnimento improvviso con il dispositivo pieno è la causa più comune di un contenitore che poi non si monta più.
