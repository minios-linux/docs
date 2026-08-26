---
updated: 2026-08-26
---

# Guida rapida

Questa guida copre il download, la scrittura, l'avvio e la configurazione iniziale di MiniOS.

## 1. Scegli un'edizione

- **Flux** offre un set di pacchetti ridotto e l'ambiente Flux.
- **Standard** è l'edizione Xfce per uso generico.
- **Toolbox** aggiunge strumenti di amministrazione, diagnostica, archiviazione e ripristino.
- **Ultra** include il set di applicazioni più ampio.

La disponibilità delle edizioni e degli ambienti desktop varia a seconda della versione. Consulta
[Informazioni su MiniOS](/about/About-MiniOS.md) e la
[lista dei pacchetti](/administration/Packages.md) prima di scaricare.

Scarica una ISO da [minios.dev](https://minios.dev) oppure dalla
[pagina dei rilasci su GitHub](https://github.com/minios-linux/minios-live/releases).
Verifica il checksum prima di utilizzarla; vedi
[Verifica dei download](/installation/Verifying-Downloads.md).

## 2. Prepara un dispositivo di destinazione

Utilizza un dispositivo abbastanza capiente per l’ISO selezionato e per eventuali dati o sessioni persistenti che desideri mantenere. Le dimensioni degli ISO variano tra le versioni, quindi verifica sia il file scaricato sia lo strumento di scrittura, invece di affidarti a una dimensione fissa indicata in una guida. Esegui un backup del dispositivo di destinazione prima di procedere: la maggior parte dei metodi di installazione sovrascrive in parte o totalmente il contenuto.

Scegli un metodo e consulta la relativa guida prima di selezionare il dispositivo:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), oppure
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), oppure
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) oppure
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Da MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Altri metodi documentati sono [UNetbootin](/installation/tools/UNetbootin.md) e [Installazione USB basata su file](/installation/tools/File-Based-USB-Installation.md). Consulta [Strumenti per la creazione USB](/installation/tools/USB-Creation-Tools.md) per un confronto e [Installare MiniOS](/installation/Installing-MiniOS.md) per una panoramica dell’installazione.

## 3. Comprendere la persistenza prima di scrivere

La persistenza non viene creata da ogni metodo di scrittura o di avvio.

- Una scrittura dell’immagine raw con `dd`, Etcher o uno strumento simile riproduce l’ISO. Non configura di per sé una sessione persistente.
- Ventoy normalmente avvia l’ISO come file. La persistenza di MiniOS deve essere configurata separatamente.
- Il programma di installazione di MiniOS può creare un’installazione live e configurare uno storage di sessione nativo, DynFileFS, raw o cifrato LUKS.
- Un avvio nuovo viene eseguito deliberatamente senza persistenza. Altre voci del menu di avvio di MiniOS possono riprendere, creare o selezionare sessioni quando è disponibile uno storage scrivibile.
- Un’installazione nativa è un sistema installato convenzionale e non utilizza la persistenza della sessione live nello stesso modo.

Utilizza [Modalità di avvio](/configuration/Boot-Modes.md) come guida di riferimento per il comportamento visibile all’utente durante l’avvio live. Consulta [Gestione delle sessioni](/configuration/Session-Management.md) per le opzioni di storage, [Persistenza Initrd](/configuration/Initrd-Persistence.md) per il contratto dettagliato all’avvio e [Parametri di avvio](/configuration/Boot-Parameters.md) prima di modificare le opzioni del kernel. Tieni sempre una copia di backup dei file importanti, indipendentemente dalla modalità di persistenza.

## 4. Avvia MiniOS

1. Spegni il computer e collega il dispositivo preparato.
2. Apri il menu di avvio del firmware e seleziona la voce UEFI o legacy del dispositivo.
3. Seleziona una sessione nuova per un test iniziale dell’hardware, oppure una sessione persistente solo se è già stata configurata.
4. Verifica che grafica, tastiera, storage e rete funzionino prima di apportare modifiche di installazione potenzialmente distruttive.

Se il dispositivo non è elencato o il desktop non si avvia, consulta [Compatibilità hardware](/installation/Hardware-Compatibility.md) e [Risoluzione dei problemi](/administration/Troubleshooting.md). Per problemi nel rilevamento della sorgente live, vedi [Rilevamento sistema Initrd](/configuration/Initrd-System-Discovery.md).

## 5. Configura il sistema

Apri **Applicazioni > Sistema > Configura MiniOS**, oppure esegui:

```bash
minios-configurator
```

Il Configuratore modifica `/etc/live/config.conf`. Può impostare identità utente,
password, lingua, fuso orario, tastiera, hostname, servizi, archiviazione della directory utente
e controlli di sicurezza. Non modifica direttamente il sistema in esecuzione;
le impostazioni salvate vengono applicate in base alla loro applicabilità, di solito
dopo il riavvio o alla creazione di una nuova sessione.

I profili di sicurezza impostano configurazioni concrete per sudo, PolicyKit, SSH, XRDP, X11,
suggerimenti per la password, blocco schermo e accesso automatico. Verifica i controlli risultanti
anziché considerare il nome del profilo come un'impostazione attiva. Consulta
[Rafforzamento della sicurezza](/administration/Security-Hardening.md) e la
[guida al Configuratore MiniOS](/configuration/MiniOS-Configurator.md). La
[documentazione del file di configurazione](/configuration/Configuration-File.md) descrive le chiavi sottostanti.

Configura le normali connessioni cablate e Wi-Fi con la [Configurazione di rete](/configuration/Network-Configuration.md). Il parametro di avvio in rete `ip=` non è una impostazione persistente di NetworkManager.

## 6. Installa software e salva il lavoro

Le modifiche APT effettuate in una sessione live vengono mantenute dopo il riavvio solo se la sessione è persistente. I moduli SquashFS rimangono separati dalla sessione scrivibile e possono essere caricati come parte del sistema modulare; vedi [Creazione dei moduli](/development/Creating-Modules.md) e [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md).

Salva i file importanti su uno storage scrivibile noto e testa almeno uno spegnimento e riavvio puliti prima di affidarti a una sessione persistente.

## Ottenere assistenza

- [Ottimizzazione delle prestazioni](/administration/Performance-Optimization.md)
- [Applicazioni e strumenti MiniOS](/about/MiniOS-Applications.md)
- [Backup e ripristino](/administration/Backup-Recovery.md)
- [Domande frequenti](/about/FAQ.md)
- [Gestione del kernel](/administration/Kernel-Management.md)
- [Compilare MiniOS](/development/Building-MiniOS.md)
- [Ricostruire una ISO](/development/Rebuilding-ISO.md)
- [Problemi su GitHub](https://github.com/minios-linux/minios-live/issues)
- [Sorgente MiniOS](https://github.com/minios-linux/minios-live)
- [Documentazione Debian](https://www.debian.org/doc/)
