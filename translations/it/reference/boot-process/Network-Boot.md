---
updated: 2026-08-26
---

# Avvio di rete

Questa pagina descrive **come caricare MiniOS tramite la rete**: PXE (kernel + initrd + dati MiniOS) e ISO HTTP (`from=http://…`). Questo è l’unico scopo della rete nell’initramfs MiniOS.

Non si tratta di **configurare** dopo l’avvio del sistema:

- Configurare NetworkManager o un IP statico permanente
- Wi-Fi nell’initrd
- [live-config](/reference/configuration/live-config) (spazio utente avviato in una fase successiva)

La configurazione di rete della sessione dopo l’avvio è un aspetto distinto. Per impostare un IP statico cablato permanente, usa la fase Rete dell’installer, NetworkManager o ifupdown: non il parametro PXE `ip=` parametro.

Correlati: [Parametri di avvio](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Panoramica

| Modalità | Cosa viene avviato | Come vengono ottenuti i dati MiniOS |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd da un server di avvio di rete | Valore `ip=` non vuoto`from=http://…` → l’initrd scarica i file MiniOS dal server dati PXE |
| **ISO HTTP** | Kernel + initrd da supporto locale **oppure** PXE | `from=http://…/minios.iso` → l’initrd attiva la rete e monta l’ISO con `httpfs2` |
| **Supporto locale** | USB / ISO / disco | Nessuna rete nell’initrd; solo ricerca locale |

Generatori di initramfs: **LiveKit** (`livekit-mos`) oppure **dracut** (`dracut-mos`). Entrambi usano gli stessi helper di rete di LiveKit per il download iniziale.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` ha la precedenza su `ip=`. In questa modalità, `ip=` fornisce l’indirizzamento statico per la connessione ISO HTTP. Altrimenti, qualsiasi valore non vuoto di `ip=` seleziona il percorso dati **PXE** e ignora il supporto locale. Non aggiungere `ip=` a un normale avvio da USB/ISO solo per «impostare un indirizzo statico». Se il rilevamento o il download non riescono, nessuno dei due percorsi di rete ripiega sul supporto locale.

## Requisiti

| Requisito | Note |
|-------------|--------|
| Ethernet cablata (o virtio/vmxnet nelle VM) | Viene usata la prima interfaccia rilevata diversa dal loopback; non vengono verificati né il collegamento né la raggiungibilità e non è possibile selezionare `BOOTIF` / `ethdevice` nell’initrd |
| Initrd con moduli di rete | Compilato per varianti del pacchetto diverse dal valore interno `minimum` (`--network`, spesso `--cloud`) |
| Nessuna dipendenza dal Wi-Fi | Il wireless non è supportato nel percorso di avvio di rete |
| Preferire schede di rete senza firmware proprietario | Le schede che dipendono dal firmware spesso non funzionano nell’initrd |
| Preferire le immagini **Standard** o superiori | L’**Flux** edition non include i moduli di rete per le schede NIC, quindi PXE / ISO HTTP non è di fatto supportato |
| Solo HTTP per l’URL dell’ISO | `from=http://…` è supportato; **`https://` non è supportato** |

Strumenti nell’initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp`, e `@mount.httpfs2`. NetworkManager non è presente nell’initrd.

## Avvio PXE

### Flusso

1. Il firmware / server PXE carica il MiniOS **kernel** e **initrd** (pxelinux, iPXE ecc.—non il MiniOS stesso).
2. La riga di comando del kernel include un **`ip=`** non vuoto (e normalmente `boot=live` per un avvio completo di MiniOS).
3. Initrd configura un indirizzo statico da `ip=`, contatta il campo **server**, scarica un elenco di file e poi MiniOS pacchetti/file.
4. Il sistema prosegue normalmente con il root live.

### Parametro `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Campo | Ruolo |
|-------|------|
| client-ip | Indirizzo assegnato con busybox `ifconfig` |
| server-ip | Host per i dati MiniOS HTTP/TFTP; viene anche scritto come server DNS in initrd |
| gateway-ip | Route predefinita; viene anche scritto come server DNS |
| netmask | Netmask IPv4 in formato decimale puntato (non la lunghezza del prefisso CIDR) |
| port | Porta HTTP facoltativa per l'elenco di file e i file (predefinita **7529**) |

Esempi:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Come vengono scaricati i file

1. **HTTP** (preferito): `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` quindi ogni percorso elencato in quel file dallo stesso host/porta.
2. **TFTP**: busybox `tftp` viene selezionato solo se la richiesta HTTP iniziale per `PXEFILELIST` non va a buon fine. Un errore successivo durante il download di un file via HTTP non fa passare il trasferimento a TFTP.

La porta predefinita è **7529** se il quinto campo è omesso.

### Cosa `ip=` non è supportato

| Aspettativa | Realtà |
|-------------|---------|
| Formati kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Non supportato** — interpretato erroneamente come indirizzo client |
| IP statico per l'intera sessione live | **Non supportato** — dopo l'avvio, NetworkManager (o un componente simile) gestisce l'interfaccia |
| IP statico durante il caricamento dei dati MiniOS da USB/ISO | **Non usare** — senza `from=http://…`, forza il download dei dati PXE |
| Elenco DNS dedicato | In initrd vengono usati come server DNS solo gateway e server |

## Avvio HTTP ISO (`from=http://…`)

Carica i dati di MiniOS da un ISO remoto senza un elenco completo di file PXE:

```text
from=http://192.168.1.1/path/minios.iso
```

Comportamento:

1. Initrd attiva la rete:
   - Se **`ip=`** è impostato → configurazione statica come sopra
   - Se **`ip=`** è omesso → **DHCP** tramite busybox `udhcpc`
2. Monta l'ISO remoto con **`httpfs2`**
3. Continua a cercare i contenuti di MiniOS su quel mount

Opzionale **`cache=`** (megabyte) abilita una cache di download httpfs, ad esempio `cache=512`.

Per questo percorso ISO remoto è accettato solo **`http://`**. **`https://` non è supportato.**

## Dopo l'avvio del sistema live

| Elemento | Dopo switch\_root |
|------|-------------------|
| IP/route del kernel sulla NIC | Possono rimanere attivi finché lo userspace non riconfigura l'interfaccia |
| DNS di Initrd (`resolv.conf`) | Non è una configurazione di sessione persistente |
| Rete della sessione | In genere **NetworkManager** sulle immagini MiniOS predefinite |
| Significato di `ip=` | Solo per il recupero iniziale — non è un profilo statico memorizzato |

Se il root è ancora fornito da **httpfs**, la riconfigurazione della NIC da parte di NetworkManager può interrompere il root live. Tienine conto quando pianifichi le distribuzioni con avvio di rete (ad es. copia su RAM / evita, quando possibile, di sovrascrivere l'interfaccia usata per il recupero).

Lo userspace avviato in un secondo momento, **live-config**, potrebbe attivare brevemente la rete solo per scaricare hook/preseed remoti (`Setup_network`). Questo non è correlato al PXE/indirizzamento`ip=` persistente.

## Errori comuni

1. Aggiungere `ip=` alla riga di comando di USB/ISO "per un IP statico" → il sistema tenta il download PXE invece di usare il supporto locale, a meno che `from=http://…` non abbia selezionato prima l'avvio HTTP ISO.
2. Usare `ip=dhcp` o altra sintassi del kernel `ip=` → parser errato, configurazione degli indirizzi non valida.
3. Aspettarsi la selezione di Wi‑Fi o di più NIC `BOOTIF` in initrd → non implementata.
4. Usare un'immagine **Flux** per PXE/HTTP ISO → mancano i moduli di rete in initrd.
5. Servire l'ISO solo tramite HTTPS → `from=http://…` non corrisponderà.
6. Confondere questa configurazione con la configurazione statica dell'installer/di NetworkManager dopo l'accesso.

## Riepilogo dell'affidabilità

| Scenario | Valutazione |
|----------|------------|
| PXE + `ip=…` + elenco HTTP sulla porta 7529 (o TFTP se la richiesta dell'elenco HTTP non riesce), rete cablata semplice / virtio | Configurazione supportata |
| `from=http://…iso` + DHCP (o `ip=`), stessa classe di NIC | Di solito funziona |
| Avvio normale da USB/ISO | La rete di Initrd non viene usata |
| Sessione con IP statico tramite `ip=` | Non supportato |
| Più NIC / NIC firmware / Wi‑Fi / `https://` / edizione Flux | Inaffidabile o non supportato |

## Riferimento all’implementazione

| Componente | Posizione nell’albero MiniOS |
|-------|-----------------------------|
| Voce init | `linux-live/initramfs/livekit-mos/init` |
| Rete + PXE + ISO HTTP | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Generatore LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Modulo Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Quando `-n` è passato | `linux-live/build-initramfs` (non minimo) |

## Vedi anche

- [Parametri di avvio](/reference/Boot-Parameters) — tabella completa dei parametri (`ip`, `from`, `cache`, …)
- [Rilevamento del sistema initrd](/reference/boot-process/System-Discovery) — priorità delle origini, rilevamento locale e comportamento in caso di errore
- [live-config](/reference/configuration/live-config) — configurazione tardiva dello userspace (non avvio da rete)
- [Architettura del sistema](/reference/System-Architecture)
- [Compilazione di MiniOS](/development/Building-MiniOS) — generatore di initramfs (`livekit` / `dracut`)
