---
updated: 2026-08-26
---

# Risoluzione dei problemi

Inizia con l’osservazione e test reversibili. Non ripartizionare, riformattare,
risanare un filesystem, eliminare una sessione o sovrascrivere file di boot finché
i dati importanti non sono stati salvati e il dispositivo guasto identificato per modello, dimensione,
filesystem e punto di mount.

Utilizza [Backup e ripristino](/administration/Backup-Recovery.md) prima di operazioni distruttive e [Ripristino dell’avvio](/administration/Boot-Recovery.md) quando sono coinvolti firmware,
bootloader, kernel o file di boot installati.

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

### Errori nelle sorgenti MiniOS

Consulta [Initrd system discovery](/configuration/Initrd-System-Discovery.md) per le regole complete su precedenza delle sorgenti e percorsi. I dettagli più utili durante la diagnosi sono:

- Un valore letterale `from=http://...` ha la precedenza su `ip=`; `ip=` fornisce quindi l'indirizzamento statico HTTP dell'ISO. In caso contrario, qualsiasi `ip=` non vuoto seleziona PXE. Nessun percorso di rete effettua fallback su supporti locali.
- La ricerca locale effettua 45 passaggi e testa i nomi dei dispositivi a blocchi in ordine alfabetico. Viene mantenuto il primo dispositivo che contiene una sorgente valida, che non è necessariamente il dispositivo previsto o un set completo di moduli.
- `/dev/disk/by-label/LABEL/path` è supportato in `from=`. I percorsi UUID, PARTUUID e by-id non sono supportati da questo parser.
- La sintassi esatta del percorso personalizzato per il selettore utilizza i due punti, ad esempio `from=askdisk:custom:dir`. La sintassi con slash testa silenziosamente il percorso predefinito `minios`.
- Se la ricerca entra nella shell initramfs fatale, uscire non ripara la sorgente né fornisce un fallback. Permette solo al boot di proseguire verso un errore successivo, meno chiaro.

Nella shell initramfs, inizia con un'ispezione in sola lettura:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Registra il primo errore di sorgente, mount o download. Non eseguire riparazioni del filesystem né rimuovere il supporto mentre è montato.

### Errori di modulo e root

Consulta [Initrd module loading](/configuration/Initrd-Module-Loading.md) per le regole di selezione, ordinamento e unione. Controlla prima queste cause comuni:

- `load=` e `noload=` sono filtri basati su espressioni regolari. Non esiste un set core o kernel protetto, quindi un filtro può escludere `00-core` o il modulo `01-kernel` del kernel in esecuzione; `noload=` ha la precedenza se entrambi i filtri corrispondono.
- I percorsi dei moduli vengono ridotti al solo nome base. Due candidati con lo stesso nome base occupano uno slot di sostituzione, quindi un livello sorgente successivo può sostituire il candidato precedente invece di aggiungere un altro layer.
- Un suffisso `.sb` non garantisce che il candidato sia una vera immagine SquashFS valida. Singoli errori di mount loop o modulo possono permettere al boot di proseguire con un layer mancante. Registra il primo errore di mount.
- `toram=full` e `toram=trim` non verificano preventivamente la RAM disponibile. Errori di copia o detach possono lasciare la sorgente originale montata, quindi non scollegare il supporto o interrompere una connessione HTTP solo perché è stato specificato `toram`.

Dopo un handoff riuscito, questi comandi permettono di ispezionare lo stato senza modificarlo:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

Per la selezione e gli errori del layer scrivibile, vedi [Initrd persistence](/configuration/Initrd-Persistence.md). La persistenza può ricadere su un upper temporaneo in RAM dopo alcuni errori di attivazione, mentre il fallimento nella costruzione dell'unione root porta alla shell initramfs fatale.

## Problemi di visualizzazione

Per schermo nero, risoluzione illeggibile o loop del display manager:

1. Prova il parametro di boot `text`. Se parte una console, il sistema base è avviato e il problema è probabilmente nella grafica, in X11 o nel display manager.
2. Rimuovi eventuali parametri `xorg-driver` o `xorg-resolution` specificati manualmente.
3. Prova una sessione nuova per escludere configurazioni di visualizzazione persistenti.
4. Registra la GPU e il driver caricato con `lspci -nnk`.
5. Controlla gli errori del boot corrente con `journalctl -b -p warning` e `dmesg --level=err,warn`.

I controlli di risoluzione per macchine virtuali documentati come `virtres` e `novirtres` si applicano solo all'ambiente Xfce. Consulta [Virtualizzazione](/administration/Virtualization.md) per la configurazione specifica degli ospiti.

## Problemi di rete

Per la configurazione normale di reti cablate e Wi-Fi, la persistenza e i comandi di NetworkManager, consulta [Network configuration](/configuration/Network-Configuration.md).

Verifica che l'interfaccia esista prima di modificare la configurazione:

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

- Se nessuna interfaccia appare, registra l'output di `lspci -nnk` o `lsusb` e controlla la presenza di firmware mancanti in `dmesg`.
- Se l'interfaccia esiste ma non ha indirizzo, prova il DHCP prima di inserire valori statici.
- Se esiste un indirizzo, testa il gateway, poi un indirizzo IP, poi un nome DNS per distinguere problemi di collegamento, routing e DNS.
- L'installer configura DHCP cablato o IPv4 statico. Lascia invariati i profili Wi-Fi esistenti.
- Il parametro di boot `ip=` configura il download PXE iniziale, non la rete della sessione persistente. Consulta [Network boot](/installation/Network-Boot.md).

## Problemi di persistenza

Avvia prima senza persistenza e crea una copia completa della directory `minios/changes`. Non eseguire strumenti di riparazione sull'unica copia o su una sessione attiva.

Verifica lo stato della sessione con:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Cause comuni includono l'avvio della voce "fresh", l'uso di un metodo di scrittura ISO che non ha mai configurato la persistenza, spazio libero insufficiente, selezione di una sessione da un'edizione o versione diversa, incompatibilità del filesystem e uno spegnimento non corretto. Consulta [Session management](/configuration/Session-Management.md).

Se MiniOS crea ripetutamente sessioni vuote, non riesce a riprendere DynFileFS o segnala errori sui container, segui la guida [DynFileFS e recupero dynblk](/configuration/DynFileFS-Recovery.md). Quella guida inizia con una copia completa e controlli in sola lettura. Le sessioni LUKS richiedono anche la passphrase corretta e un initrd con supporto alla persistenza LUKS.

## Problemi di archiviazione e spazio

Identifica dispositivi e mount senza modificarli:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Conferma modello e dimensione del dispositivo prima di qualsiasi operazione. Un filesystem pieno può causare aggiornamenti falliti, scritture di sessione incomplete e recupero all'avvio. Libera spazio spostando o eliminando solo dati utente noti e solo dopo aver effettuato un backup; non eliminare manualmente directory di persistenza numerate mentre una è attiva. Usa Session Manager o `minios-session` per le operazioni sulle sessioni.

La riparazione del filesystem è uno step successivo. Smonta prima il filesystem, lavora su una copia quando possibile e usa lo strumento di controllo specifico per il filesystem. Non formattare mai un dispositivo come test diagnostico.

## Raccolta dei log

Registra l'edizione e la versione di MiniOS, il metodo di avvio, la modalità di persistenza, l'hardware e i passaggi necessari per riprodurre il problema. Comandi utili includono:

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

Rimuovi password, chiavi private, credenziali wireless, indirizzi IP pubblici e altri dati sensibili prima di condividere i log. `journalctl -b -1` può mostrare il boot precedente quando il journal è persistente.

Per errori di boot ripetuti su supporti MiniOS scrivibili, imposta `EXPORT_LOGS=true` nel file di configurazione. MiniOS copia i log di avvio in una directory con timestamp sotto `minios/log/` quando il supporto è scrivibile. Consulta [Configuration file](/configuration/Configuration-File.md).

Quando segnali un difetto riproducibile, allega gli estratti rilevanti e apri una issue nel [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
