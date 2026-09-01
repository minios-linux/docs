---
updated: 2026-08-31
---

# Networking

MiniOS utilizza **NetworkManager** per la gestione normale della rete cablata e Wi-Fi. MiniOS non sostituisce il proprio modello di connessione con un sistema di configurazione di rete separato.

Per l'uso ordinario, apri l'icona di rete nel pannello del desktop. Gli strumenti standard di NetworkManager sono anch'essi disponibili:

```bash
nmtui
nmcli
```

Utilizza questi strumenti per connetterti al Wi-Fi, cambiare rete, configurare indirizzi DHCP o statici, DNS, connessioni VPN e altre normali operazioni di rete durante l'esecuzione. Per informazioni complete sul loro funzionamento, consulta la documentazione e le pagine man di NetworkManager.

In una sessione MiniOS persistente, i profili di connessione di NetworkManager vengono salvati come parte di quella sessione. In **Avvia senza salvare**, le modifiche scompaiono allo spegnimento.

## Preconfigurazione di rete

Le impostazioni di rete specifiche di MiniOS sono principalmente una **preconfigurazione**. Sono utili quando un'immagine, un programma di installazione o una distribuzione non presidiata devono partire con una configurazione cablata nota prima che l'utente apra NetworkManager.

Il componente di rete MiniOS `live-config` supporta la preconfigurazione cablata IPv4. Non preconfigura il Wi-Fi.

Un esempio statico in `config.conf` è:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` accetta `dhcp`, `static` o `off`. Le opzioni Unset e `dhcp` mantengono la configurazione di rete esistente dell'immagine invece di sostituire il comportamento normale di NetworkManager. `static` scrive una configurazione statica IPv4 cablata; `off` prepara l'interfaccia cablata selezionata a non connettersi automaticamente. Con `LIVE_NETWORK_BACKEND="auto"`, MiniOS preferisce NetworkManager e utilizza ifupdown solo se necessario. Se non viene specificata alcuna interfaccia, la preconfigurazione viene applicata solo quando è possibile identificare esattamente una sola interfaccia cablata idonea.

Consulta [Configuration file](/reference/configuration/config.conf) per sapere dove vengono salvate queste impostazioni e [live-config](/reference/configuration/live-config) per la documentazione completa su variabili e componenti.

## Quando si applica la preconfigurazione

Il componente di rete rappresenta un passaggio di configurazione `live-config` eseguito una sola volta. Dopo che è stato eseguito con successo in una sessione persistente, le modifiche ordinarie alla rete dovrebbero essere effettuate tramite NetworkManager invece di modificare ripetutamente la preconfigurazione.

Se hai effettivamente bisogno di applicare una nuova preconfigurazione di rete MiniOS alla stessa sessione persistente, rimuovi il file di completamento e riavvia:

```bash
sudo rm -f /var/lib/live/config/network
```

Fallo solo se desideri davvero che `live-config` generi nuovamente la policy di rete cablata. Modificare le normali connessioni Wi-Fi o Ethernet non lo richiede.

## Preconfigurazione dell'installatore

Il passaggio di rete dell'Installatore MiniOS esegue anche la preconfigurazione per il sistema di destinazione. Supporta impostazioni IPv4 cablate tramite DHCP o statiche. Il Wi-Fi viene gestito da NetworkManager dopo l'avvio del sistema installato.

## La rete all'avvio anticipato è diversa

NetworkManager configura il sistema MiniOS in esecuzione. La rete utilizzata dall'initramfs per ottenere MiniOS è invece gestita da un meccanismo separato.

Il parametro di avvio `ip=`, i download PXE e `from=http://...` quindi non creano profili NetworkManager e non dovrebbero essere utilizzati per configurare la rete desktop normale. Consulta [Network boot](/reference/boot-process/Network-Boot).

## Risoluzione dei problemi

Per un problema di connessione ordinario, inizia con NetworkManager stesso:

```bash
nmcli device status
nmcli connection show --active
```

Utilizza l'editor di connessione del desktop, `nmtui`, oppure i log e la documentazione standard di NetworkManager per problemi comuni relativi a Wi-Fi, DHCP, DNS, VPN o Ethernet.

Le diagnostiche specifiche di MiniOS sono rilevanti quando il problema riguarda la preconfigurazione di rete o l'avvio di rete. Il log `live-config` si trova in `/var/log/live/config.log`; i problemi di avvio di rete anticipato sono trattati nella guida [Network boot](/reference/boot-process/Network-Boot).

## Documentazione correlata

- [File di configurazione](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Network boot](/reference/boot-process/Network-Boot)
- [Gestione delle sessioni](/using-minios/Sessions-and-Persistence)
