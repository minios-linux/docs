---
updated: 2026-10-15
program_commits:
    minios-configurator: 7705e764f152d2d2ae2268ce3ddde7e0adbad8bc
---

# Preconfigurazione MiniOS

Il Configuratore MiniOS è un editor grafico per la configurazione live di MiniOS. Convalida le modifiche e salva la configurazione per un avvio successivo. Le scelte iniziali relative all’archiviazione di cache e log vengono applicate da `minios-boot`; gli altri componenti della configurazione live vengono eseguiti in seguito. Il salvataggio non modifica direttamente il sistema in esecuzione.

## Avviare il configuratore

Apri il Configuratore MiniOS dal menu delle applicazioni oppure esegui:

```bash
minios-configurator
```

La destinazione predefinita è `/etc/live/config.conf`. Per modificare un altro file normale, specificane il percorso:

```bash
minios-configurator /path/to/config.conf
```

Per salvare è necessaria l’autenticazione PolicyKit. I collegamenti simbolici e i file di destinazione non normali vengono rifiutati.

## Configurazione dei supporti e del runtime

MiniOS può leggere la configurazione da due posizioni:

- `minios/config.conf` e `minios/config.conf.d/*.conf` sul supporto live
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` nel filesystem root in esecuzione

Il Configuratore MiniOS modifica solo il file selezionato. Se non viene specificato alcun percorso, modifica il file di runtime `/etc/live/config.conf`; non apre direttamente il file sul supporto. MiniOS sincronizza all’avvio la configurazione più recente tra il filesystem di runtime e i supporti scrivibili MiniOS. I supporti in sola lettura non possono ricevere modifiche runtime e la configurazione runtime persistente può rimanere indipendente dalla copia sul supporto.

All’avvio, MiniOS sincronizza i file sul supporto e quelli di runtime in base alla data di modifica. Con le nuove politiche di archiviazione, i frammenti successivi di `config.conf.d` prevalgono sul file principale, segue `LIVE_CONFIG_CMDLINE` e, per ultimo, prevale la riga di comando effettiva del kernel.
Usa `-i` per applicare nell’editor le impostazioni riconosciute dalla riga di comando del kernel corrente:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Il file selezionato resta la destinazione di salvataggio. I parametri del kernel sconosciuti vengono ignorati.

## Quando vengono applicate le impostazioni

Ogni controllo indica quando viene utilizzato. Il salvataggio non applica mai un’impostazione alla sessione corrente.

### Applicate dopo il riavvio

Il nome host, le impostazioni locali, il fuso orario, la tastiera, la destinazione di avvio, la selezione dei servizi, la modalità dei moduli, la gestione dei supporti della directory utente, le impostazioni di debug, l’esportazione dei log e le tre impostazioni di archiviazione in Advanced vengono lette al riavvio successivo. Riavvia dopo aver salvato per applicarle.

In **Advanced**, **la modalità dei moduli** accetta `simple` oppure `merged`. Quando `LIVE_MODULE_MODE` è assente dalla configurazione selezionata, il Configuratore corrente MiniOS presenta `merged` come valore predefinito effettivo. In modalità unificata, live-config aggiorna utenti, cache e stato dei pacchetti, integrando così nella live system in esecuzione la configurazione proveniente dallo stack dei moduli.

In **Advanced**, **archiviazione dei log di sistema**, **cache di download APT**, e **cache del browser** offrono ciascuna `persistent` (predefinito) o `volatile`. Vengono applicate dopo l’attivazione corretta della persistenza, anche in una sessione copiataa RAM scrivibile con informazioni sull’origine protette. Con la persistenza durevole, la diagnostica di avvio MiniOS, lo stato dei pacchetti APT e i profili del browser restano nell’archiviazione; solo i log e le cache selezionati vengono spostati in RAM con limiti di dimensione. In una sessione copiata RAM, lo stato conservato deve comunque essere salvato correttamente nell’archiviazione. Le cache RAM di APT e del browser richiedono almeno 1 GiB disponibile e l’assenza di swap non zRAM. La configurazione del browser viene eseguita dopo la creazione dell’utente. Configuratore avvisa se initrd non contiene il marker richiesto`perch-storage-v1` . Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) per i limiti fissi RAM.

### Usato solo per una nuova sessione

La creazione dell’account, le password utente e root, `noroot`, le policy di sudo e PolicyKit, le policy di SSH e XRDP, l’accesso X11, i suggerimenti per le password e il blocco dello schermo sono impostazioni utilizzate una sola volta. In genere, una sessione persistente registra i componenti `live-config` completati in `/var/lib/live/config/`, quindi modificare questi valori e riavviare la stessa sessione non ricrea l’account né lo stato di sicurezza. Avvia una nuova sessione per applicarli come impostazioni iniziali.

I profili di sicurezza sono preimpostazioni dell’editor. Il nome del profilo non viene salvato; le singole impostazioni di sicurezza vengono salvate e restano modificabili.

## Directory utente e persistenza

Il collegamento e il bind mount delle directory utente sono opzioni incompatibili tra loro. Entrambi richiedono un supporto dati locale scrivibile MiniOS già esistente e un percorso sicuro relativo al supporto. Non sono disponibili con `toram`, `toram=full` o `toram=trim`, né quando la sessione di persistenza attiva è crittografata con LUKS. Anche la copia dei dati è bloccata per una sessione crittografata. MiniOS non unisce automaticamente due alberi di directory già popolati.

`perchmode` e `perchsize` sono parametri di avvio di initramfs, non impostazioni del Configuratore MiniOS. I nuovi controlli di archiviazione di cache e log non selezionano né creano una sessione `perch`. Il Configuratore MiniOS non crea, sblocca, ridimensiona né ripara un contenitore di persistenza. Per la persistenza crittografata, indica se è presente il marcatore di crittografia di initramfs.

## Comportamento del salvataggio

La revisione elenca solo i valori modificati e oscura le password. Il salvataggio aggiorna solo le chiavi modificate, mantenendo commenti, ordine, chiavi sconosciute, proprietario, autorizzazioni e attributi estesi. La scrittura è atomica.

Per consultare il riferimento completo delle variabili e dei parametri di avvio, vedi [File di configurazione](/reference/configuration/config.conf), [Parametri di avvio](/reference/Boot-Parameters) e [live-config](/reference/configuration/live-config).
