---
updated: 2026-08-31
---

# Rete

MiniOS usa **NetworkManager** per le normali connessioni cablate e Wi-Fi. MiniOS non sostituisce il suo modello di connessione con un sistema di configurazione di rete separato.

Per l'uso quotidiano, apri l'icona della rete nel pannello del desktop. Sono disponibili anche gli strumenti standard di NetworkManager:

```bash
nmtui
nmcli
```

Usa questi strumenti per connetterti al Wi-Fi, passare da una rete all'altra, configurare DHCP o indirizzi statici, DNS, connessioni VPN e altre normali impostazioni di rete durante l'esecuzione. Per informazioni complete sul loro funzionamento, consulta la documentazione e le pagine man di NetworkManager.

In una sessione MiniOS persistente, i profili di connessione di NetworkManager vengono salvati come parte della sessione. In **Avviare senza salvare**, le modifiche scompaiono all'arresto.

## Preconfigurazione della rete

Le impostazioni di rete specifiche di MiniOS consistono principalmente nella **preconfigurazione**. Sono utili quando un'immagine, un programma di installazione o una distribuzione automatizzata deve avviarsi con una configurazione cablata predefinita, prima che l'utente apra NetworkManager.

Il componente di rete MiniOS `live-config` supporta la preconfigurazione cablata IPv4. Non preconfigura il Wi-Fi.

Un esempio di configurazione statica in `config.conf` è:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` accetta `dhcp`, `static` oppure `off`. Se non impostati, `dhcp` mantengono la configurazione di rete esistente nell'immagine, senza sostituire il normale comportamento di NetworkManager. `static` configura una connessione cablata con IPv4 statico; `off` prepara l'interfaccia cablata selezionata in modo che non si connetta automaticamente. Con `LIVE_NETWORK_BACKEND="auto"`, MiniOS usa preferibilmente NetworkManager e, se necessario, ripiega su ifupdown. Se non viene specificata un'interfaccia, la preconfigurazione viene applicata solo quando è possibile identificare esattamente un'interfaccia cablata idonea.

Consulta [File di configurazione](/reference/configuration/config.conf) per sapere dove vengono salvate queste impostazioni e [live-config](/reference/configuration/live-config) per l'elenco completo delle variabili e dei componenti.

## Quando si applica la preconfigurazione

Il componente di rete esegue una sola volta la `live-config`configurazione iniziale. Dopo la corretta esecuzione in una sessione persistente, le normali modifiche alla rete vanno effettuate con NetworkManager, anziché modificando ripetutamente la preconfigurazione.

Se vuoi applicare intenzionalmente una preconfigurazione di rete MiniOS modificata alla stessa sessione persistente, rimuovi il contrassegno di completamento e riavvia:

```bash
sudo rm -f /var/lib/live/config/network
```

Fallo solo se vuoi davvero che `live-config` generi di nuovo la configurazione cablata. Per modificare le normali connessioni Wi-Fi o Ethernet non è necessario.

## Preconfigurazione dell'installatore

Anche il passaggio di rete dell'Installatore MiniOS esegue la preconfigurazione del sistema di destinazione. Supporta impostazioni cablate DHCP o IPv4 statiche. Il Wi-Fi viene gestito da NetworkManager dopo l'avvio del sistema installato.

## Il networking all'avvio è diverso

NetworkManager configura il sistema MiniOS in esecuzione. Il networking usato da initramfs per ottenere MiniOS è un meccanismo separato.

Il `ip=` parametro di avvio, i download PXE e `from=http://...` pertanto non creano profili NetworkManager e non vanno usati per configurare la rete del normale ambiente desktop. Vedi [Avvio dalla rete](/reference/boot-process/Network-Boot).

## Risoluzione dei problemi

Per un normale problema di connessione, inizia da NetworkManager:

```bash
nmcli device status
nmcli connection show --active
```

Usa l'editor delle connessioni del desktop, `nmtui`, oppure i log e la documentazione standard di NetworkManager per i normali problemi relativi a Wi-Fi, DHCP, DNS, VPN o Ethernet.

La diagnostica specifica di MiniOS è utile quando il problema riguarda la preconfigurazione di rete o l'avvio dalla rete. Il `live-config` log è `/var/log/live/config.log`; i problemi che si verificano all'inizio dell'avvio dalla rete sono trattati nella guida [Avvio dalla rete](/reference/boot-process/Network-Boot).

## Documentazione correlata

- [File di configurazione](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Avvio dalla rete](/reference/boot-process/Network-Boot)
- [Gestione delle sessioni](/using-minios/Sessions-and-Persistence)
