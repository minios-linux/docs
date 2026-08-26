---
updated: 2026-08-26
---

# Configurazione di rete

Dopo l'avvio di MiniOS, NetworkManager gestisce normalmente le connessioni cablate e Wi-Fi. Questo è separato dal networking dell'initramfs utilizzato per scaricare un sistema PXE o HTTP-ISO. In particolare, il parametro PXE `ip=` non crea un profilo NetworkManager né imposta un indirizzo di sessione permanente. Consulta [Avvio da rete](/installation/Network-Boot.md) per la configurazione di rete nelle prime fasi di avvio.

## Configurazione del desktop

Utilizza l'icona di rete nel pannello del desktop per selezionare una rete Wi-Fi, disconnettere o riconnettere un dispositivo, oppure aprire l'editor delle connessioni. Per un indirizzo statico cablato, modifica la connessione cablata e imposta il metodo IPv4 su Manuale, quindi inserisci indirizzo e prefisso, gateway e server DNS. Imposta il metodo su Automatico (DHCP) per usare DHCP.

L'interfaccia testuale offre le stesse operazioni comuni:

```bash
nmtui
```

Scegli **Modifica una connessione** per cambiare un profilo e **Attiva una connessione** per attivarla.

## NetworkManager da riga di comando

Mostra dispositivi e profili salvati:

```bash
nmcli device status
nmcli connection show
```

Scansiona le reti Wi-Fi e connettiti:

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

L'ultimo comando richiede la password senza inserirla nella riga di comando. Non inserire mai la password Wi-Fi direttamente in un comando, perché potrebbe rimanere nella cronologia della shell ed essere visibile ad altri processi.

Per modificare un profilo cablato esistente in DHCP:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

Per assegnare un indirizzo IPv4 statico:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Sostituisci il nome del profilo e gli indirizzi con i valori della rete locale. Una connessione remota può essere interrotta non appena il suo profilo attivo viene modificato.

## Persistenza

NetworkManager salva i profili di sistema in `/etc/NetworkManager/system-connections/`. In un avvio live senza persistenza, le modifiche effettuate tramite il desktop, `nmcli` o `nmtui` vengono perse allo spegnimento. In una sessione persistente restano disponibili in quella sessione anche dopo il riavvio. Consulta [Gestione sessioni](/configuration/Session-Management.md) per la selezione e il salvataggio delle sessioni.

I profili non vengono condivisi automaticamente tra sessioni persistenti separate. I profili Wi-Fi possono contenere credenziali, quindi proteggi il supporto della sessione e rimuovi le credenziali prima di condividere un archivio di sessione o un output diagnostico.

## Preconfigurazione di una connessione cablata

Il componente di rete live-config di MiniOS può creare una policy IPv4 statica cablata prima dell'avvio dei servizi di rete. È pensato per sistemi non presidiati o installati. Non configura il Wi-Fi.

Aggiungi assegnazioni in stile shell a `minios/config.conf` sul supporto MiniOS oppure a `/etc/live/config.conf` nel sistema live:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Racchiudi i valori tra virgolette come stringhe shell e non inserire spazi attorno a `=`. Consulta [File di configurazione](/configuration/Configuration-File.md) per le posizioni dei file e la precedenza, e [live-config](/configuration/live-config.md) per l'attivazione dei componenti e le opzioni generali.

Le opzioni di avvio equivalenti sono:

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

Sono accettate anche le forme lunghe `live-config.network-*`. Queste sono opzioni live-config in userspace avanzato, non la sintassi PXE `ip=`.

### Metodi

| Metodo | Comportamento |
|--------|--------------|
| Non impostato o `dhcp` | Non apporta modifiche e mantiene la configurazione di rete già presente nell'immagine. Non crea una configurazione DHCP né rimuove un precedente profilo statico MiniOS. |
| `static` | Scrive un profilo IPv4 statico cablato. Il prefisso predefinito è `24`; gateway e DNS sono opzionali. |
| `off` | Scrive un profilo NetworkManager non auto-connettente con IPv4 disabilitato, oppure una sezione ifupdown `manual`. Non è un interruttore radio Wi-Fi. |

Solo `static` e `off` selezionano un'interfaccia e scrivono la configurazione. Se `LIVE_NETWORK_INTERFACE` viene omesso, live-config procede solo se è disponibile esattamente una interfaccia cablata non loopback. Le interfacce wireless sono escluse. Usa `ip link` o `nmcli device status` per ottenere il nome reale dell'interfaccia in un sistema con più interfacce.

### Backend e validazione

`LIVE_NETWORK_BACKEND` accetta:

| Backend | Comportamento |
|---------|--------------|
| `auto` o non impostato | Preferisce NetworkManager e, in caso di fallimento, utilizza ifupdown. |
| `nm` | Richiede NetworkManager e scrive `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Richiede ifupdown e scrive `/etc/network/interfaces.d/minios-static`. Se NetworkManager è installato, segna anche l'interfaccia selezionata come non gestita in `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. |

I nomi delle interfacce possono contenere solo lettere, cifre, `_`, `.`, `:` e `-`.
Gli indirizzi statici e i gateway devono essere indirizzi IPv4 validi. Il prefisso deve essere un intero da `0` a `32`. Il DNS è una lista di indirizzi IPv4 o IPv6 separati da virgole. Valori non validi, selezione ambigua dell'interfaccia e backend non disponibili vengono segnalati e non viene scritto alcun "success stamp".

## Modifica della policy live-config persistente

In un sistema live persistente, il componente di rete normalmente si applica una sola volta e registra il successo in `/var/lib/live/config/network`. Per applicare modifiche statiche o disattivare le impostazioni:

1. Modifica il file `/etc/live/config.conf` persistente effettivo.
2. Rimuovi il "stamp" con `sudo rm /var/lib/live/config/network`.
3. Riavvia.

Modificare solo la configurazione sul supporto rimovibile non sovrascrive un `/etc/live/config.conf` persistente esistente.

Impostare `LIVE_NETWORK_METHOD="dhcp"` non equivale a un reset del profilo. Per tornare da un profilo statico gestito da MiniOS al normale DHCP di NetworkManager, rimuovi la policy statica `LIVE_NETWORK_*` dalla configurazione effettiva, elimina il profilo gestito e lo stamp, quindi riavvia:

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

Per il backend ifupdown, rimuovi invece `/etc/network/interfaces.d/minios-static` e `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. Poi crea o attiva un profilo DHCP con l'editor del desktop, `nmtui` o `nmcli` se NetworkManager non ne crea uno automaticamente.

## Comportamento dell'installatore

La fase di rete dell'installatore si applica solo al networking cablato. Una configurazione IPv4 statica selezionata viene scritta per il sistema installato. Se si seleziona DHCP, vengono mantenute le impostazioni predefinite normali invece di scrivere un reset del profilo. I profili Wi-Fi e le impostazioni Wi-Fi esistenti non vengono modificati.

## Diagnostica

Inizia controllando dispositivo, indirizzo, route e stato di NetworkManager:

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Controlla il log di avvio corrente per errori relativi a dispositivo, firmware, DHCP e live-config:

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

Per una policy live-config, verifica anche le impostazioni effettive, il file generato e lo stamp. Il log principale di live-config è `/var/log/live/config.log`.

Verifica i guasti in ordine: stato del link, un indirizzo sull'interfaccia, la route e il gateway predefiniti, un indirizzo IP esterno e infine un nome DNS. Questo permette di distinguere i problemi di dispositivo o firmware da quelli di DHCP, routing e DNS. Consulta [Risoluzione dei problemi](/administration/Troubleshooting.md) per controlli più ampi e raccolta dei log.

## Vedi anche

- [Avvio da rete](/installation/Network-Boot.md)
- [File di configurazione](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Risoluzione dei problemi](/administration/Troubleshooting.md)
- [Gestione sessioni](/configuration/Session-Management.md)
