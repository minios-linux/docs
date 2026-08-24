# Risoluzione dei problemi

Inizia con l’osservazione e test reversibili. Non ripartizionare, riformattare,
risanare un filesystem, eliminare una sessione o sovrascrivere file di avvio finché i dati importanti non sono stati salvati e il dispositivo guasto identificato per modello, dimensione, filesystem e punto di mount.

## Verifiche iniziali

1. Verifica l’ISO scaricata seguendo
   [Verifica dei download](/installation/Verifying-Downloads.md).
2. Prova un avvio pulito senza persistenza. Questo permette di distinguere problemi di base del sistema o dell’hardware da una sessione danneggiata o incompatibile.
3. Prova un’altra porta USB e, se possibile, un altro dispositivo funzionante.
4. Annota la voce esatta del menu di avvio, eventuali parametri aggiunti e il primo errore riscontrato, non solo il guasto finale.
5. Consulta [Compatibilità hardware](/installation/Hardware-Compatibility.md) e la guida dello strumento utilizzato per scrivere il dispositivo.

## Problemi di avvio

Se il dispositivo non compare nel menu di avvio del firmware, verifica se è stato scritto per UEFI, BIOS legacy o entrambi. Disattiva temporaneamente il fast boot del firmware, prova il menu di avvio temporaneo del firmware e testa un’altra porta prima di riscrivere il dispositivo. Non modificare la tabella delle partizioni del disco interno per diagnosticare un problema di avvio da USB.

Se il menu di avvio di MiniOS appare ma l’avvio fallisce:

- Avvia una nuova sessione senza `perch`, `perchdir` o `perchmode`.
- Rimuovi parametri opzionali e filtri dei moduli.
- Verifica che l’ISO e il supporto scritto non siano corrotti.
- Registra l’errore completo. I parametri `debug` e `timing` aggiungono l’output di avvio;
  `rd.break` apre una shell initramfs per diagnosi avanzate.
- Se i dati MiniOS non vengono trovati, controlla il valore `from` e il percorso del dispositivo rispetto a
  [Parametri di avvio](/configuration/Boot-Parameters.md).

Per l’avvio tramite PXE o ISO via HTTP, segui la guida specifica
[Avvio da rete](/installation/Network-Boot.md). La rete durante l’avvio iniziale è separata da NetworkManager nella sessione attiva.

## Problemi di visualizzazione

Per schermo nero, risoluzione illeggibile o un ciclo del display manager:

1. Prova il parametro di avvio `text`. Se parte una console, il sistema base è avviato e il problema riguarda probabilmente la grafica, X11 o il display manager.
2. Rimuovi eventuali parametri `xorg-driver` o `xorg-resolution` specificati manualmente.
3. Prova una nuova sessione per escludere configurazioni persistenti dello schermo.
4. Annota la GPU e il driver caricato con `lspci -nnk`.
5. Controlla gli errori dell’avvio corrente con `journalctl -b -p warning` e
   `dmesg --level=err,warn`.

I controlli di risoluzione per macchine virtuali documentati come `virtres` e `novirtres`
valgono solo per l’ambiente Xfce. Consulta
[Virtualizzazione](/administration/Virtualization.md) per la configurazione specifica degli ospiti.

## Problemi di rete

Verifica che l’interfaccia esista prima di modificare la configurazione:

```bash
ip link
ip address
ip route
```

Per la sessione normale in esecuzione, controlla NetworkManager se presente:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Se nessuna interfaccia compare, annota l’output di `lspci -nnk` o `lsusb` e verifica la presenza di firmware mancante in `dmesg`.
- Se l’interfaccia esiste ma non ha un indirizzo, prova DHCP prima di inserire valori statici.
- Se un indirizzo è presente, testa il gateway, poi un indirizzo IP, poi un nome DNS per distinguere problemi di collegamento, routing e DNS.
- L’installer configura DHCP cablato o IPv4 statico. I profili Wi-Fi esistenti non vengono modificati.
- Il parametro di avvio `ip=` configura il download PXE iniziale, non la rete della sessione persistente. Consulta [Avvio da rete](/installation/Network-Boot.md).

## Problemi di persistenza

Prima avvia senza persistenza e crea una copia completa della directory `minios/changes`.
Non eseguire strumenti di riparazione sull’unica copia o su una sessione attiva.

Verifica lo stato della sessione con:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Le cause comuni includono l’avvio della voce pulita, l’uso di un metodo di scrittura ISO che non ha mai configurato la persistenza, spazio libero insufficiente, selezione di una sessione da un’edizione o versione diversa, incompatibilità del filesystem e uno spegnimento non corretto. Consulta [Gestione delle sessioni](/configuration/Session-Management.md).

Se MiniOS crea ripetutamente sessioni vuote, non riesce a riprendere DynFileFS o segnala errori del container, segui la guida [Recupero DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md).
Quella guida inizia con una copia completa e controlli in sola lettura. Le sessioni LUKS richiedono anche la passphrase corretta e un initrd con supporto alla persistenza LUKS.

## Problemi di archiviazione e spazio

Identifica dispositivi e mount senza modificarli:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Conferma modello e dimensione del dispositivo prima di qualsiasi operazione. Un filesystem pieno può causare aggiornamenti falliti, scritture di sessione incomplete e recupero all’avvio. Libera spazio spostando o eliminando solo dati utente noti dopo aver effettuato un backup; non eliminare manualmente directory di persistenza numerate mentre una è attiva. Usa Session Manager o `minios-session` per le operazioni sulle sessioni.

La riparazione del filesystem è uno step successivo. Smonta prima il filesystem, lavora su una copia quando possibile e utilizza lo strumento di verifica specifico per il filesystem. Non formattare mai un dispositivo come test diagnostico.

## Raccolta dei log

Annota l’edizione e la versione di MiniOS, il metodo di avvio, la modalità di persistenza, l’hardware e i passaggi necessari per riprodurre il problema. Comandi utili includono:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Rimuovi password, chiavi private, credenziali wireless, indirizzi IP pubblici e altri dati sensibili prima di condividere i log. `journalctl -b -1` può mostrare l’avvio precedente quando il journal è persistente.

Per errori di avvio ripetuti su supporti MiniOS scrivibili, imposta `EXPORT_LOGS=true` nel file di configurazione. MiniOS copia i log di avvio in `minios/logs` quando il supporto è scrivibile. Consulta [File di configurazione](/configuration/Configuration-File.md).

Quando segnali un difetto riproducibile, allega gli estratti rilevanti e apri una segnalazione nel [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
