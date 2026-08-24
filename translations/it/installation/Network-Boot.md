# Avvio da rete

Questa pagina descrive **come caricare MiniOS tramite rete**: PXE (kernel + initrd + dati MiniOS) e HTTP ISO (`from=http://…`). Questo è l’unico scopo della rete all’interno dell’initramfs di MiniOS.

Non riguarda:

- Configurare NetworkManager o un IP statico permanente dopo l’avvio del sistema
- Wi‑Fi nell’initrd
- [live-config](/configuration/live-config.md) (userspace tardivo)

La rete della sessione dopo l’avvio è separata. Per un IP statico cablato e persistente, utilizzare il passaggio Network dell’installer, NetworkManager o ifupdown — non il parametro PXE `ip=`.

Vedi anche: [Parametri di avvio](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Panoramica

| Modalità | Cosa viene avviato | Come vengono ottenuti i dati MiniOS |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd da un server di boot di rete | `ip=` non vuoto → initrd scarica i file MiniOS dal server dati PXE (preferibilmente HTTP, fallback TFTP) |
| **HTTP ISO** | Kernel + initrd da supporto locale **o** PXE | `from=http://…/minios.iso` → initrd attiva la rete e monta l’ISO con `httpfs2` |
| **Supporto locale** | USB / ISO / disco | Nessuna rete in initrd; solo ricerca locale |

Builder initramfs: **LiveKit** (`livekit-mos`) o **dracut** (`dracut-mos`). Entrambi usano gli stessi helper di rete LiveKit per il recupero iniziale.

```text
find_data()
  ├─ from=http://…     → configure network → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

**Importante:** qualsiasi `ip=` non vuoto seleziona il **percorso dati PXE** e **salta i supporti locali**. Non aggiungere `ip=` su un normale avvio USB/ISO solo per “impostare un indirizzo statico”.

## Requisiti

| Requisito | Note |
|-------------|--------|
| Ethernet cablata (o virtio/vmxnet in VM) | Viene usata la prima interfaccia disponibile non-loopback; nessuna selezione `BOOTIF` / `ethdevice` nell’initrd |
| Initrd con moduli di rete | Costruito per varianti di pacchetto non **minimum** (`--network`, spesso `--cloud`) |
| Nessuna dipendenza dal Wi‑Fi | Wireless non supportato nel percorso di avvio da rete |
| Preferire NIC senza firmware blob | Le schede che richiedono firmware spesso falliscono nell’initrd |
| Preferire immagini **standard+** | **minimum** omette i moduli NIC di rete → PXE / HTTP ISO di fatto non supportati |
| Solo HTTP per URL ISO | `from=http://…` funziona; **`https://` non è supportato** |

Strumenti nell’initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` e `@mount.httpfs2`. NetworkManager non è presente nell’initrd.

## Avvio PXE

### Flusso

1. Firmware / server PXE carica il **kernel** e l’**initrd** di MiniOS (pxelinux, iPXE, ecc.—al di fuori di MiniOS stesso).
2. La riga di comando del kernel include un **`ip=`** non vuoto (e normalmente `boot=live` per un avvio MiniOS completo).
3. Initrd configura un indirizzo statico da `ip=`, contatta il campo **server**, scarica la lista dei file, poi i bundle/file MiniOS.
4. Il sistema prosegue nel root live come di consueto.

### Parametro `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Campo | Ruolo |
|-------|------|
| client-ip | Indirizzo assegnato con busybox `ifconfig` |
| server-ip | Host per i dati MiniOS HTTP/TFTP; scritto anche come nameserver DNS nell’initrd |
| gateway-ip | Route di default; scritto anche come nameserver DNS |
| netmask | Netmask IPv4 punteggiata (non prefisso CIDR) |
| port | Porta HTTP opzionale per lista file e file (default **7529**) |

Esempi:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Come vengono scaricati i file

1. **HTTP** (preferito):  
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`  
   poi ogni percorso elencato in quel file dallo stesso host/porta.
2. **TFTP** (fallback se HTTP fallisce): busybox `tftp` per `PXEFILELIST` e i file elencati.

La porta predefinita è **7529** se il quinto campo è omesso.

### Cosa `ip=` non è

| Aspettativa | Realtà |
|-------------|---------|
| Formati kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Non supportato** — interpretato erroneamente come indirizzo client |
| IP statico per l’intera sessione live | **Non supportato** — dopo l’avvio, NetworkManager (o simili) gestisce l’interfaccia |
| IP statico durante l’avvio da USB/ISO | **Non usare** — forza il download dati PXE |
| Lista DNS dedicata | Solo gateway + server sono usati come nameserver nell’initrd |

## Avvio HTTP ISO (`from=http://…`)

Carica i dati MiniOS da una ISO remota senza una lista file PXE completa:

```text
from=http://192.168.1.1/path/minios.iso
```

Comportamento:

1. L’initrd attiva la rete:
   - Se è impostato **`ip=`** → configurazione statica come sopra
   - Se **`ip=`** è omesso → **DHCP** tramite busybox `udhcpc`
2. Monta la ISO remota con **`httpfs2`**
3. Continua a cercare i contenuti MiniOS su quel mount

Opzionale **`cache=`** (megabyte) abilita una cache di download httpfs, ad esempio `cache=512`.

Solo **`http://`** è accettato per questo percorso ISO remoto. **`https://` non è supportato.**

## Dopo l’avvio del sistema live

| Voce | Dopo switch_root |
|------|-------------------|
| IP/kernel/route sulla NIC | Possono rimanere finché lo userspace non riconfigura l’interfaccia |
| DNS initrd (`resolv.conf`) | Non è una policy di sessione persistente |
| Rete della sessione | Tipicamente **NetworkManager** sulle immagini MiniOS predefinite |
| Significato di `ip=` | Solo recupero iniziale — non è un profilo statico memorizzato |

Se la root è ancora fornita tramite **httpfs**, la riconfigurazione della NIC da parte di NetworkManager può interrompere la root live. Pianifica i deployment via network-boot tenendo conto di ciò (es. copia in RAM / evita di modificare l’interfaccia di fetch dove possibile).

Il userspace tardivo **live-config** può attivare brevemente la rete solo per scaricare hook/preseed remoti (`Setup_network`). Questo non è collegato all’indirizzamento persistente PXE/`ip=`.

## Errori comuni

1. Mettere `ip=` sulla riga di comando USB/ISO “per IP statico” → il sistema tenta il download PXE invece del supporto locale.
2. Usare `ip=dhcp` o altra sintassi `ip=` del kernel → parser errato, configurazione indirizzo non funzionante.
3. Aspettarsi Wi‑Fi o selezione multi-NIC `BOOTIF` nell’initrd → non implementato.
4. Usare un’immagine **minimum** per PXE/HTTP ISO → moduli di rete mancanti nell’initrd.
5. Servire l’ISO solo tramite HTTPS → `from=http://…` non funzionerà.
6. Confondere questa funzione con la configurazione statica post-login dell’installer/NetworkManager.

## Riepilogo affidabilità

| Scenario | Valutazione |
|----------|------------|
| PXE + `ip=…` + lista HTTP su :7529 (o TFTP), cablato semplice / virtio | Target supportato |
| `from=http://…iso` + DHCP (o `ip=`), stessa classe NIC | Di solito funziona |
| Avvio normale USB/ISO | Rete initrd non utilizzata |
| Sessione statica tramite `ip=` | Non supportato |
| Multi-NIC / NIC con firmware / Wi‑Fi / `https://` / edizione minimum | Debole o non supportato |

## Riferimenti implementativi

| Componente | Posizione nell’albero MiniOS |
|-------|-----------------------------|
| Init entry | `linux-live/initramfs/livekit-mos/init` |
| Network + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Builder LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Modulo MiniOS per Dracut | `linux-live/initramfs/dracut-mos/90minios/` |
| Quando viene passato `-n` | `linux-live/build-initramfs` (non-minimum) |

## Vedi anche

- [Parametri di avvio](/configuration/Boot-Parameters.md) — tabella completa dei parametri (`ip`, `from`, `cache`, …)
- [live-config](/configuration/live-config.md) — configurazione userspace tardiva (non avvio da rete)
- [Architettura di sistema](/about/System-Architecture.md)
- [Costruire MiniOS](/development/Building-MiniOS.md) — builder initramfs (`livekit` / `dracut`)
