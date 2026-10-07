---
updated: 2026-10-06
program_commits:
    minios-configurator: 4d82e44c6ee6f04909e9dd3ef8e31389d3ac8817
---

# Preconfigurazione di MiniOS

Il Configuratore MiniOS è un editor grafico per la configurazione live di MiniOS. Valida le modifiche e scrive la configurazione per l'avvio successivo. Le prime scelte di cache/log vengono applicate da `minios-boot`; i restanti componenti live-config vengono eseguiti successivamente. Il salvataggio non modifica direttamente il sistema in esecuzione.

## Avvia il configuratore

Apri il Configuratore MiniOS dal menu delle applicazioni oppure esegui:

```bash
minios-configurator
```

Il file di destinazione predefinito è `/etc/live/config.conf`. Per modificare un altro file regolare, specifica il suo percorso:

```bash
minios-configurator /path/to/config.conf
```

Il salvataggio richiede l'autenticazione PolicyKit. I collegamenti simbolici e i file di destinazione non regolari vengono rifiutati.

## Configurazione del supporto e del runtime

MiniOS può leggere la configurazione da due posizioni:

- `minios/config.conf` e `minios/config.conf.d/*.conf` sul supporto live
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` nel filesystem root in esecuzione

Il Configuratore MiniOS modifica solo il file selezionato. Senza argomento percorso, modifica il file runtime `/etc/live/config.conf`; non apre direttamente il file sul supporto. MiniOS sincronizza la configurazione più recente tra il filesystem runtime e i supporti MiniOS scrivibili durante l'avvio. I supporti in sola lettura non possono ricevere modifiche runtime e la configurazione persistente runtime può rimanere indipendente dalla copia sul supporto.

All'avvio, MiniOS sincronizza i file del supporto e del runtime in base all'orario di modifica. Per le nuove policy di storage, i frammenti `config.conf.d` successivi sovrascrivono il file principale, `LIVE_CONFIG_CMDLINE` viene dopo, e la riga di comando effettiva del kernel ha la precedenza finale.
Usa `-i` per sovrapporre le impostazioni riconosciute dalla riga di comando del kernel attuale nell'editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Il file selezionato resta la destinazione di salvataggio. I parametri kernel sconosciuti vengono ignorati.

## Quando si applicano le impostazioni

Ogni controllo indica quando viene utilizzato. Il salvataggio non applica mai un'impostazione alla sessione corrente.

### Applicato dopo il riavvio

Hostname, lingua, fuso orario, tastiera, destinazione di avvio, selezione dei servizi, modalità modulo, gestione dei supporti delle directory utente, impostazioni di debug, esportazione dei log e le tre impostazioni avanzate di storage vengono lette a un avvio successivo. Riavvia dopo il salvataggio per applicarle.

In **Avanzate**, **Modalità modulo** accetta `simple` o `merged`. Se `LIVE_MODULE_MODE` è assente dalla configurazione selezionata, il Configuratore MiniOS mostra `merged` come valore predefinito effettivo. In modalità unificata, live-config aggiorna utenti, cache e stato dei pacchetti in modo che la configurazione dello stack modulo venga integrata nel sistema live in esecuzione.

In **Avanzate**, **Storage log di sistema**, **Cache download APT**, e **Cache browser** offrono ciascuno `persistent` (predefinito) oppure `volatile`. Le loro scelte `volatile` si applicano solo a una sessione `perch` integra e durevole. I log di `minios-boot` e `live-config` restano persistenti anche quando i log ordinari sono temporanei. Lo stato dei pacchetti APT e i profili browser rimangono persistenti; solo i log e le cache selezionati vengono spostati su RAM a capacità limitata. La configurazione del browser viene eseguita dopo la creazione dell'utente live. Il configuratore avvisa se l'initrd in esecuzione non contiene il marcatore `perch-storage-v1` necessario per queste impostazioni. Consulta [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) prima di scegliere le dimensioni di RAM su una macchina con poca memoria.

### Usato solo per una nuova sessione

Creazione account, password utente e root, `noroot`, policy sudo e PolicyKit, policy SSH e XRDP, accesso X11, suggerimenti password e blocco schermo sono impostazioni "una tantum". Una sessione persistente normalmente registra i componenti `live-config` completati in `/var/lib/live/config/`, quindi cambiare questi valori e riavviare la stessa sessione non ricrea l'account o lo stato di sicurezza. Avvia una nuova sessione per applicarli come impostazioni iniziali.

I profili di sicurezza sono preset dell'editor. Il nome del profilo non viene salvato; le singole impostazioni di sicurezza vengono salvate e restano modificabili.

## Directory utente e persistenza

Il collegamento e il bind mount delle directory utente sono mutuamente esclusivi. Entrambi utilizzano un supporto dati locale MiniOS scrivibile già esistente e un percorso sicuro relativo al supporto. Non sono disponibili con `toram`, `toram=full`, o `toram=trim`, e MiniOS non unisce automaticamente due alberi di directory già popolati.

`perchmode` e `perchsize` sono parametri di avvio initramfs, non impostazioni del Configuratore MiniOS. I nuovi controlli di storage cache/log non selezionano né creano una `perch` sessione. Il Configuratore MiniOS non crea, sblocca, ridimensiona o ripara un contenitore di persistenza. Per la persistenza cifrata segnala se è presente il marcatore di cifratura nell'initramfs.

## Comportamento del salvataggio

La revisione mostra solo i valori modificati e oscura le password. Il salvataggio aggiorna solo le chiavi modificate mantenendo commenti, ordine, chiavi sconosciute, proprietà, permessi e attributi estesi. La scrittura è atomica.

Per la documentazione completa su variabili e parametri di avvio, consulta [File di configurazione](/reference/configuration/config.conf), [Parametri di avvio](/reference/Boot-Parameters), e [live-config](/reference/configuration/live-config).
