# Guida rapida

Questa guida copre il download, la scrittura, l'avvio e la configurazione iniziale di MiniOS.

## 1. Scegli un'edizione

- **Minimum** offre un set di pacchetti ridotto e l'ambiente Flux.
- **Standard** è l'edizione Xfce per uso generico.
- **Toolbox** aggiunge strumenti di amministrazione, diagnostica, storage e recupero.
- **Ultra** include il set di applicazioni più ampio.

La disponibilità di edizioni e desktop varia a seconda della release. Consulta
[About MiniOS](/about/About-MiniOS.md) e la
[lista dei pacchetti](/administration/Packages.md) prima di scaricare.

Scarica una ISO da [minios.dev](https://minios.dev) oppure dalla
[pagina dei rilasci su GitHub](https://github.com/minios-linux/minios-live/releases).
Verifica il checksum prima di utilizzarla; vedi
[Verifica dei download](/installation/Verifying-Downloads.md).

## 2. Prepara un dispositivo di destinazione

Utilizza un dispositivo sufficientemente capiente per la ISO scelta e per eventuali dati o sessioni persistenti che desideri mantenere. Le dimensioni delle ISO variano tra le release, quindi controlla il download e lo strumento di scrittura invece di affidarti a una dimensione fissa riportata in una guida. Esegui il backup del dispositivo di destinazione prima: la maggior parte dei metodi di installazione sovrascrive in parte o totalmente il contenuto.

Scegli un metodo e leggi la guida relativa prima di selezionare il dispositivo:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) o
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) o
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) o
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Da MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Altri metodi documentati sono [UNetbootin](/installation/tools/UNetbootin.md)
e il [metodo originale](/installation/tools/Original-Method.md). Consulta
[Strumenti per la creazione USB](/installation/tools/USB-Creation-Tools.md) per un confronto e
[Installazione di MiniOS](/installation/Installing-MiniOS.md) per la panoramica dell'installazione.

## 3. Comprendere la persistenza prima della scrittura

La persistenza non viene creata da ogni metodo di scrittura o avvio.

- Una scrittura dell'immagine grezza con `dd`, Etcher o uno strumento simile riproduce la ISO. Non configura automaticamente una sessione persistente.
- Ventoy normalmente avvia la ISO come file. La persistenza di MiniOS deve essere configurata separatamente.
- MiniOS Installer può creare un'installazione live e configurare lo storage della sessione in modalità nativa, DynFileFS, raw o cifrata LUKS.
- Un avvio "fresco" viene eseguito deliberatamente senza persistenza. Altre voci del menu di avvio di MiniOS possono riprendere, creare o selezionare sessioni quando è disponibile uno storage scrivibile.
- Un'installazione nativa è un sistema installato convenzionalmente e non utilizza la persistenza della sessione live nello stesso modo.

Consulta [Gestione delle sessioni](/configuration/Session-Management.md) e
[Parametri di avvio](/configuration/Boot-Parameters.md) prima di modificare lo storage delle sessioni. Esegui sempre il backup dei file importanti, indipendentemente dalla modalità di persistenza.

## 4. Avvia MiniOS

1. Spegni il computer e collega il dispositivo preparato.
2. Apri il menu di avvio del firmware e seleziona la voce UEFI o legacy del dispositivo.
3. Seleziona una sessione "fresca" per un test iniziale dell'hardware, oppure una sessione persistente solo se già configurata.
4. Verifica che grafica, tastiera, storage e rete funzionino prima di apportare modifiche di installazione che possono essere distruttive.

Se il dispositivo non è elencato o il desktop non si avvia, consulta
[Compatibilità hardware](/installation/Hardware-Compatibility.md) e
[Risoluzione dei problemi](/administration/Troubleshooting.md).

## 5. Configura il sistema

Apri **Applicazioni > Sistema > Configura MiniOS**, oppure esegui:

```bash
minios-configurator
```

Il Configuratore modifica `/etc/live/config.conf`. Può impostare identità utente, password, lingua, fuso orario, tastiera, hostname, servizi, storage delle directory utente e controlli di sicurezza. Non modifica direttamente il sistema in esecuzione; le impostazioni salvate vengono applicate in base alla loro applicabilità, normalmente dopo il riavvio o alla creazione di una nuova sessione.

I profili di sicurezza impostano configurazioni concrete per sudo, PolicyKit, SSH, XRDP, X11, suggerimenti password, blocco schermo e accesso automatico. Verifica i controlli risultanti invece di considerare il nome del profilo come un'impostazione attiva. Consulta
[Rafforzamento della sicurezza](/administration/Security-Hardening.md) e la
[guida al Configuratore di MiniOS](/configuration/MiniOS-Configurator.md). La
[documentazione del file di configurazione](/configuration/Configuration-File.md) descrive le chiavi sottostanti.

## 6. Installa software e salva il lavoro

Le modifiche APT effettuate in una sessione live vengono mantenute dopo il riavvio solo se la sessione è persistente. I moduli SquashFS restano separati dalla sessione scrivibile e possono essere caricati come parte del sistema modulare; vedi
[Creazione dei moduli](/development/Creating-Modules.md).

Salva i file importanti su uno storage scrivibile noto e testa almeno uno spegnimento e riavvio pulito prima di affidarti a una sessione persistente.

## Ottenere assistenza

- [Ottimizzazione delle prestazioni](/administration/Performance-Optimization.md)
- [Gestione del kernel](/administration/Kernel-Management.md)
- [Compilare MiniOS](/development/Building-MiniOS.md)
- [Ricostruire una ISO](/development/Rebuilding-ISO.md)
- [Problemi su GitHub](https://github.com/minios-linux/minios-live/issues)
- [Sorgente di MiniOS](https://github.com/minios-linux/minios-live)
- [Documentazione Debian](https://www.debian.org/doc/)
