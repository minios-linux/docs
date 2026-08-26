---
updated: 2026-08-26
---

# Domande frequenti

## Quale edizione dovrei scegliere e perché manca un'applicazione?

L'edizione Flux utilizza l'ambiente Flux basato su Fluxbox e un set ridotto di pacchetti.
Le edizioni Standard, Toolbox e Ultra aggiungono progressivamente software diverso, ma la disponibilità varia a seconda della release. Consulta
[About MiniOS](/about/About-MiniOS.md),
[MiniOS applications](/about/MiniOS-Applications.md) e la
[lista dei pacchetti](/administration/Packages.md).

## Scrivere l'ISO equivale a installare MiniOS?

No. Scrivere l'ISO crea un supporto live avviabile. Il programma di installazione di MiniOS può installare sia un sistema live modulare con persistenza opzionale sia un sistema nativo tradizionale. Scegli una modalità seguendo [Installing MiniOS](/installation/Installing-MiniOS.md) e [MiniOS Installer](/installation/MiniOS-Installer.md).

## Quali sono le credenziali predefinite?

Un'immagine live non personalizzata utilizza `live` / `evil` e `root` / `toor`, e può
consentire login automatico e amministrazione senza password. Cambia queste credenziali prima di collegarti a una rete non affidabile; segui le indicazioni in
[Security hardening](/administration/Security-Hardening.md).

## Scrivere MiniOS su una chiavetta USB abilita la persistenza?

Non necessariamente. La scrittura diretta dell'ISO e l'avvio normale dell'ISO con Ventoy non configurano automaticamente una sessione persistente. Segui [Quick start](/installation/Quick-Start.md) e [Session management](/configuration/Session-Management.md) per il metodo di scrittura e avvio scelto.

## Qual è la differenza tra sessione attiva e sessione in esecuzione?

La sessione attiva è quella selezionata per il prossimo avvio; concettualmente, la sessione in esecuzione fornisce la persistenza attualmente. Il record persistente `running=` può essere obsoleto dopo un crash, quindi lo stato protetto dell'avvio corrente e il layer scrivibile montato sono considerati autorevoli per le operazioni in tempo reale. L'attivazione di una sessione non comporta il cambio immediato del sistema attuale. Consulta [Gestione delle sessioni](/configuration/Session-Management.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md).

## Perché le mie modifiche sono scomparse dopo il riavvio?

Potresti aver avviato una nuova sessione, utilizzato un supporto senza persistenza o selezionato una sessione diversa. Le sessioni Native, DynFileFS, raw e LUKS ricevono le scritture mentre il sistema è in esecuzione; non attendono uno snapshot al momento dello spegnimento. Solo la persistenza SquashFS richiede che le modifiche mantenute in RAM vengano ricostruite in `changes.sb`, quindi uno spegnimento interrotto o una policy di salvataggio disabilitata possono lasciare le ultime modifiche non salvate. Controlla la sessione in esecuzione e quella attiva come descritto in [Gestione delle sessioni](/configuration/Session-Management.md) e [Risoluzione dei problemi](/administration/Troubleshooting.md).

## LUKS e SquashFS sono lo stesso tipo di persistenza?

No. LUKS memorizza una sessione ext4 scrivibile e cifrata in un contenitore. SquashFS è uno
snapshot compresso che viene eseguito da un layer scrivibile su RAM e deve essere
salvato secondo la propria policy. Consulta
[Gestione delle sessioni](/configuration/Session-Management.md) e [Rafforzamento della sicurezza](/administration/Security-Hardening.md).

## Perché un'applicazione o modulo dello Store appare solo dopo il riavvio?

La modalità modulo crea un modulo `.sb` di sola lettura per il prossimo avvio; non aggiunge
l'applicazione allo stack di moduli corrente. Verifica la sua posizione e riavvia come
descritto in [MiniOS Store](/administration/MiniOS-Store.md).

## Devo installare il software con APT o come modulo?

Usa APT per modificare un solo sistema in esecuzione o una sessione persistente. Utilizza i moduli per layer software in sola lettura caricati all'avvio. Confronta effetti e requisiti di spazio in [Software updates](/administration/Software-Updates.md) e [Creating modules](/development/Creating-Modules.md).

## Posso aggiornare MiniOS a una nuova release direttamente?

Non esiste un aggiornamento in-place supportato tra release. Non trattare un aggiornamento di release Debian come un aggiornamento dell'immagine MiniOS. Esegui il backup dei dati e usa un'immagine creata per la release di destinazione; consulta [Software updates](/administration/Software-Updates.md).

## Devo usare `ip=` per configurare la rete normale?

No. Fornire una configurazione di indirizzo come `ip=<configuration>` attiva l'avvio di rete anticipato e salta i supporti locali. Configura il sistema in esecuzione con NetworkManager o gli strumenti di rete documentati. Consulta
[Avvio da rete](/installation/Network-Boot.md) e
[Configurazione di rete](/configuration/Network-Configuration.md).

## Come posso mantenere le impostazioni Wi-Fi dopo il riavvio?

Salva il profilo NetworkManager in una sessione live persistente o in un'installazione nativa, quindi prova a riavviare. Il programma di installazione non crea né modifica i profili Wi-Fi. Consulta [Network configuration](/configuration/Network-Configuration.md) e [Session management](/configuration/Session-Management.md).

## MiniOS supporta BIOS e UEFI?

MiniOS supporta BIOS legacy e UEFI x86-64, ma la voce firmware disponibile e la struttura delle partizioni dell'installer sono comunque importanti. Consulta [Installing MiniOS](/installation/Installing-MiniOS.md) e usa [Boot recovery](/administration/Boot-Recovery.md) se il sistema installato non si avvia.

## Come verifico un ISO?

Scarica l'ISO e il file `.iso.sha256` corrispondente dalla stessa release ufficiale, poi confronta il checksum SHA-256 prima di scriverlo o avviarlo. Segui [Verifying downloads](/installation/Verifying-Downloads.md).

## Devo riparare prima una sessione o filesystem danneggiati?

Esegui il backup dei dati importanti e identifica con precisione il dispositivo, il filesystem e il punto di mount prima di apportare modifiche. Non riparare mai l'unica copia o una sessione attiva. Inizia da [Backup and recovery](/administration/Backup-Recovery.md), [Troubleshooting](/administration/Troubleshooting.md) e [Boot recovery](/administration/Boot-Recovery.md).

## Cosa devo includere quando chiedo aiuto o segnalo un problema?

Indica l'edizione e la versione, i metodi di avvio e persistenza, l'hardware, i passaggi esatti, il primo errore e i log rilevanti. Rimuovi credenziali e altri dati sensibili, poi segui [Raccolta log](/administration/Troubleshooting.md)
e segnala i difetti riproducibili nel
[MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).

## Devo compilare dai sorgenti o usare Image Builder?

Compila dai sorgenti se devi creare l'intero sistema MiniOS e il set di moduli. Usa [MiniOS Image Builder](/development/Image-Builder.md) per una remaster guidata, oppure [`minios-image-compose`](/development/Rebuilding-ISO.md) per comporre un albero di contenuti MiniOS esistente dalla riga di comando. Consulta [Building MiniOS](/development/Building-MiniOS.md) per la compilazione dai sorgenti.
