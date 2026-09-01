---
updated: 2026-08-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Preconfigurazione di MiniOS

Il Configuratore MiniOS è un editor grafico per le impostazioni di MiniOS `live-config`. Valida le modifiche e scrive la configurazione per un avvio successivo. Non modifica direttamente il sistema in esecuzione.

## Avvia il configuratore

Apri il Configuratore MiniOS dal menu delle applicazioni oppure esegui:

```bash
minios-configurator
```

Il target predefinito è `/etc/live/config.conf`. Per modificare un altro file regolare, indica il suo percorso:

```bash
minios-configurator /path/to/config.conf
```

Il salvataggio richiede l'autenticazione PolicyKit. I collegamenti simbolici e i file di destinazione non regolari vengono rifiutati.

## Configurazione di supporti e runtime

MiniOS può leggere la configurazione da due posizioni:

- `minios/config.conf` e `minios/config.conf.d/*.conf` sul supporto live
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` nel filesystem root in esecuzione

Il Configuratore MiniOS modifica solo il file selezionato. Senza argomento di percorso, modifica il file runtime `/etc/live/config.conf`; non apre direttamente il file sul supporto. MiniOS sincronizza la configurazione più recente tra il filesystem runtime e i supporti MiniOS scrivibili durante l'avvio. I supporti in sola lettura non possono ricevere modifiche runtime e la configurazione runtime persistente può rimanere indipendente dalla copia sul supporto.

Per una determinata opzione, i parametri del kernel hanno precedenza sui file di configurazione, e la configurazione sul supporto ha precedenza su quella del filesystem root.
Utilizza `-i` per sovrapporre le impostazioni riconosciute dalla riga di comando del kernel corrente nell'editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Il file selezionato rimane il target di salvataggio. I parametri kernel sconosciuti vengono ignorati.

## Quando si applicano le impostazioni

Ogni controllo indica quando viene utilizzato. Il salvataggio non applica mai un'impostazione alla sessione corrente.

### Applicate dopo il riavvio

Hostname, lingua, fuso orario, tastiera, target di avvio, selezione dei servizi, modalità dei moduli, gestione dei supporti delle directory utente, impostazioni di debug ed esportazione dei log vengono letti a un avvio successivo. Riavvia dopo il salvataggio per applicarli.

### Utilizzate solo per una nuova sessione

Creazione account, password utente e root, `noroot`, policy sudo e PolicyKit, policy SSH e XRDP, accesso X11, suggerimenti password e blocco schermo sono impostazioni "one-shot". Una sessione persistente normalmente registra i componenti `live-config` completati sotto `/var/lib/live/config/`, quindi modificare questi valori e riavviare la stessa sessione non ricrea l'account o lo stato di sicurezza. Avvia una nuova sessione per applicarli come impostazioni iniziali.

I profili di sicurezza sono preset dell'editor. Il nome del profilo non viene salvato; le singole impostazioni di sicurezza vengono salvate e restano modificabili.

## Directory utente e persistenza

Il collegamento e il mount bind delle directory utente sono mutuamente esclusivi. Entrambi utilizzano un supporto dati locale MiniOS scrivibile già esistente e un percorso sicuro relativo al supporto. Non sono disponibili con `toram`, `toram=full` o `toram=trim`, e MiniOS non unisce automaticamente due alberi di directory già popolati.

`perchmode` e `perchsize` sono parametri di avvio initramfs, non impostazioni del Configuratore MiniOS. Il Configuratore MiniOS non crea, sblocca, ridimensiona o ripara un contenitore di persistenza. Per la persistenza cifrata si limita solo a segnalare se è presente il marker di cifratura initramfs.

## Comportamento del salvataggio

La revisione elenca solo i valori modificati e oscura le password. Il salvataggio aggiorna solo le chiavi modificate preservando commenti, ordine, chiavi sconosciute, proprietà, permessi e attributi estesi. La scrittura è atomica.

Per la documentazione completa su variabili e parametri di avvio, consulta [File di configurazione](/reference/configuration/config.conf), [Parametri di avvio](/reference/Boot-Parameters) e [live-config](/reference/configuration/live-config).
