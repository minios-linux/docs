---
updated: 2026-08-26
---

# Backup e ripristino

Nessun singolo backup protegge ogni parte di un sistema MiniOS. File personali,
configurazione, sessioni persistenti, moduli e il dispositivo di archiviazione richiedono
procedure di ripristino differenti. Conserva più di una copia, mantieni almeno una copia
su un altro dispositivo e testa il ripristino prima che sia necessario l’originale.

## Usa una strategia di backup a livelli

Un set di backup pratico include questi livelli:

1. Esegui frequentemente il backup dei file personali insostituibili in modo indipendente dalla
   sessione MiniOS.
2. Registra le scelte di configurazione e dei moduli ogni volta che vengono modificate.
3. Esporta ogni sessione integra e non in esecuzione in una modalità supportata.
4. Conserva una copia offline dei dati che Session Manager non può esportare.
5. Crea occasionalmente un’immagine completa del supporto dopo aver spento la sorgente e
   aver interrotto ogni scrittura.

Utilizza destinazioni versionate invece di sostituire il precedente backup funzionante.
Conserva una nota della release MiniOS, edizione, architettura, data del backup,
modalità della sessione e stato della cifratura con ogni backup. Un’immagine completa del supporto
è una rete di sicurezza finale utile, ma non dovrebbe essere l’unica copia dei file personali.

## Esegui prima il backup dei dati personali

Quando possibile, esegui il backup dell’intera home directory, incluse le impostazioni
applicative nascoste. Al minimo, includi il lavoro salvato in Desktop, Documenti,
Download, Musica, Immagini, Pubblici, Modelli e Video, oltre a qualsiasi directory di progetto o
dati creata fuori da queste posizioni standard.

Il supporto user-media di MiniOS può collegare o montare le directory utente standard su una
posizione separata nel supporto MiniOS scrivibile. Il percorso configurato di default è
`/minios/userdata`, ma `LIVE_USER_DIRS_PATH` permette di selezionare un altro percorso sicuro. I dati
lì presenti sono fuori dal normale layer di sessione e devono essere sottoposti a backup separatamente.
Verifica i reali target di collegamento o mount invece di presumere che esportare una
sessione li includa. Esegui anche il backup dei file intenzionalmente salvati su altri volumi montati.

Chiudi le applicazioni che scrivono database, archivi di posta, profili browser o
immagini di macchine virtuali prima di copiarne i dati. Per dati importanti, preferisci un
metodo di backup che preservi proprietà, permessi, collegamenti, attributi estesi
e timestamp quando la destinazione lo supporta.

## Esegui il backup della configurazione

Conserva la configurazione che controlla gli avvii futuri, non solo i file visibili
nell’attuale filesystem root. Le posizioni rilevanti possono includere:

- `minios/config.conf` e `minios/config.conf.d/` su supporti MiniOS scrivibili.
- `/etc/live/config.conf` e `/etc/live/config.conf.d/` in un sistema persistente o
  nativo.
- Hook revisionati, preseeds, modifiche al menu di avvio e una nota dei parametri
  di boot personalizzati.
- Configurazione utente sotto la home directory e configurazione di sistema selezionata
  sotto `/etc` per un’installazione nativa.

La configurazione può contenere hash di password, credenziali di rete, chiavi e
impostazioni di servizio. Proteggi il backup di conseguenza. Non memorizzare passphrase
in chiaro accanto a un backup di sessione cifrato. Consulta [Rafforzamento della sicurezza](/administration/Security-Hardening.md)
per indicazioni su cifratura e gestione dei supporti.

## Esegui il backup dei moduli

Esegui il backup dei file `.sb` personalizzati dall’archiviazione durevole dei moduli e annota il loro ordine,
origine, release MiniOS e scopo. Non dedurre il prossimo avvio da ciò che è
visibile nell’attuale filesystem root:

- **In esecuzione ora** è il set di moduli che compone il sistema live corrente.
- **Prossimo avvio** è il set di moduli selezionato dalle regole di boot attuali.

Un modulo attivato solo per la sessione corrente potrebbe non essere presente nell’archiviazione durevole. Un modulo aggiunto per il prossimo avvio potrebbe non essere attivo ora. Rivedi e annota entrambe le viste prima del backup. I filtri di boot come `load`, `noload` e
`bext` possono anche modificare il set effettivo del prossimo avvio. Consulta [Module
Manager](/administration/Module-Manager.md).

## Esporta sessioni persistenti

Utilizza [Gestione sessioni](/configuration/Session-Management.md) per identificare la
sessione In esecuzione ora e quella selezionata per il prossimo avvio. Attivare una
sessione diversa modifica solo il prossimo avvio; non rende sicura l’esportazione della sessione attuale. Riavvia in un’altra sessione, o avvia senza
persistenza, prima di eseguire il backup della precedente sessione in esecuzione.

Session Manager può esportare una sessione non in esecuzione `native`, `dynfilefs`, `raw` o `luks`
come archivio `.tar.zst`. L’esportazione è un backup logico dei file della
sessione, non necessariamente una copia byte per byte del suo contenitore di archiviazione. Conserva
l’archivio su un altro dispositivo. L’import crea una nuova sessione numerata; ispezionala
e attivala esplicitamente solo dopo la validazione.

Un export LUKS contiene dati logici di sessione decifrati, non il contenitore
`changes.luks` cifrato. Cifra la destinazione del backup o l’archivio con un
metodo separato e revisionato se i dati esportati devono restare riservati.
L’import in LUKS crea un nuovo contenitore cifrato e richiede una nuova passphrase di destinazione.

Non copiare manualmente una directory di sessione montata. La sessione potrebbe essere in modifica,
e un filesystem su contenitore potrebbe non essere rappresentato da un insieme consistente
di file mentre è attivo.

## Gestisci le sessioni SquashFS offline

Prima di eseguire il backup di una sessione SquashFS in esecuzione, usa **Salva ora** e attendi che
il salvataggio e la validazione siano completati. Il salvataggio ricostruisce `changes.sb` e sostituisce
atomicamente lo snapshot precedente; non mantiene una generazione di rollback.
Quindi spegni il sistema in modo pulito.

L’attuale implementazione di Session Manager non consente l’esportazione o la copia di SquashFS.
Dopo il salvataggio, avvia senza persistenza oppure utilizza un altro sistema Linux e copia la
sessione SquashFS dallo store delle sessioni inattive. Conserva insieme l’intera directory numerata
della sessione e i metadati dello store delle sessioni. Non sostituire o rinumerare voci in uno store `minios/changes` attivo. Consulta
[Recupero boot](/administration/Boot-Recovery.md) prima di modificare strutture di boot o disco durante un ripristino.

## Conserva ogni segmento DynFileFS

Una sessione DynFileFS è un singolo contenitore logico suddiviso in un set completo di
file di appoggio. Una copia offline deve includere `changes.dat` e ogni segmento numerato
come `changes.dat.0`, `changes.dat.1` e i segmenti successivi. Copiare
solo il primo file non produce un backup utilizzabile. Non creare un segmento mancante o tentare di riparare l’unica copia.

L’esportazione normale tramite Session Manager evita questa problematica a livello di contenitore esportando
i file logici della sessione. Per copie interrotte, segmenti mancanti, supporti pieni
e riparazione del filesystem, segui [Recupero DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md).

## Crea un’immagine dell’intero supporto

[Drive Utility](/installation/tools/Drive-Utility.md) può utilizzare **Crea immagine**
per leggere un intero dispositivo in un’immagine raw, opzionalmente compressa. Questo
cattura la tabella delle partizioni, i file di boot, i moduli, la configurazione, lo store delle sessioni,
i dati user-media e i blocchi inutilizzati così come esistono sul dispositivo sorgente.
Il file immagine richiede quindi spazio di destinazione adeguato e può contenere
dati eliminati e segreti recuperabili.

Crea l’immagine offline. Spegni MiniOS e collega il supporto sorgente a un altro sistema in esecuzione, oppure avvia da un altro dispositivo. Assicurati che nessuna partizione sorgente sia montata e che nessuna persistenza, swap, database o servizio in background stia scrivendo su di essa. Drive Utility normalmente nasconde i dispositivi montati, ma la visualizzazione di un dispositivo nell’interfaccia non garantisce che un’immagine raw live sia consistente.

Verifica la sorgente tramite modello, dimensione e nome del dispositivo. Salva l’immagine su un dispositivo fisico diverso, mai su un filesystem della sorgente da cui si sta creando l’immagine.
Per il ripristino, **Scrivi immagine** sovrascrive in modo raw il dispositivo di destinazione selezionato. Conferma la destinazione con la stessa attenzione; tutti i dati esistenti sulla destinazione saranno persi. Utilizza una destinazione almeno grande quanto la sorgente originale, a meno che l’immagine non sia stata preparata esplicitamente per un dispositivo più piccolo.

## Esegui il backup delle installazioni native

Un’installazione nativa non utilizza una sessione persistente live come filesystem root, quindi l’esportazione tramite Session Manager non rappresenta un backup completo del sistema nativo.
Esegui il backup delle home directory degli utenti, della configurazione di sistema selezionata, dei dati applicativi,
file gestiti localmente e credenziali di ripristino con un metodo di backup consapevole del filesystem. Annota la release MiniOS, il layout delle partizioni, la selezione dei pacchetti installati, la modalità di avvio e qualsiasi modulo o kernel personalizzato.

Per il ripristino bare-metal, crea un’immagine offline dell’intero disco oppure utilizza un prodotto di backup testato che supporti i filesystem nativi e il layout delle partizioni. Mantieni un backup a livello di file separato, così da poter ripristinare singoli file senza sovrascrivere un intero disco. Consulta [Recupero boot](/administration/Boot-Recovery.md) per la diagnosi di file di avvio e bootloader.

## Valida i backup e testa i ripristini

Una copia completata non è ancora un backup affidabile. Per ogni ciclo di backup:

1. Conferma che il backup sia su un dispositivo diverso e abbia la data e la dimensione previste.
2. Registra e confronta successivamente un checksum crittografico per archivi e immagini disco.
3. Apri un campione di file personali, includendo almeno un file di grandi dimensioni e uno
   proveniente da ciascun set di dati applicativi importanti.
4. Importa un archivio di sessione come nuova sessione inattiva e ispeziona i suoi file.
   Testa l’avvio solo dopo aver preservato la selezione della sessione funzionante attuale.
5. Verifica che una copia offline DynFileFS contenga l’intera sequenza di segmenti.
6. Ripristina un’immagine completa del supporto solo su un dispositivo di scorta o usa e getta di dimensioni adeguate, quindi testa sia l’avvio sia l’accesso ai dati importanti.
7. Testa il ripristino di file nativi in una posizione separata e verifica permessi,
   proprietà, collegamenti e leggibilità da parte delle applicazioni.

Esegui test di ripristino dopo aver modificato modalità di persistenza, cifratura, layout delle partizioni, release MiniOS o software di backup. Conserva l’ultimo backup funzionante fino a che la sostituzione non ha superato il test di ripristino. Per diagnosi più approfondite, consulta [Recupero boot](/administration/Boot-Recovery.md), [Recupero DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md) e [Rafforzamento della sicurezza](/administration/Security-Hardening.md).
