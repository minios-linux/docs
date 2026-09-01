---
updated: 2026-08-26
---

# Avvio da rete

Questa pagina descrive **come caricare MiniOS tramite rete**: PXE (kernel + initrd + dati MiniOS) e HTTP ISO (`from=http://…`). Questo è l’unico scopo della rete all’interno dell’initramfs di MiniOS.

Non riguarda:

- Configurare NetworkManager o un IP statico permanente dopo l’avvio del sistema
- Wi‑Fi nell’initrd
- [live-config](/reference/configuration/live-config) (userspace tardivo)

La rete della sessione dopo l’avvio è separata. Per un IP statico cablato e persistente, usa il passaggio Rete dell’installer, NetworkManager o ifupdown—non il parametro PXE `ip=`.

Vedi anche: [Parametri di avvio](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Panoramica

| Modalità | Cosa viene avviato | Come vengono ottenuti i dati MiniOS |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd da un server di boot di rete | `ip=` non vuoto senza `from=http://…` → initrd scarica i file MiniOS dal server dati PXE |
| **HTTP ISO** | Kernel + initrd da supporto locale **oppure** PXE | `from=http://…/minios.iso` → initrd attiva la rete e monta l’ISO con `httpfs2` |
| **Supporto locale** | USB / ISO / disco | Nessuna rete in initrd; solo ricerca locale |

Builder di initramfs: **LiveKit** (`livekit-mos`) o **dracut** (`dracut-mos`). Entrambi utilizzano gli stessi helper di rete LiveKit per il recupero iniziale.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` ha precedenza su `ip=`. In quella modalità, `ip=` fornisce l’indirizzamento statico per la connessione HTTP ISO. Altrimenti, qualsiasi `ip=` non vuoto seleziona il **percorso dati PXE** e salta i supporti locali. Non aggiungere `ip=` su un normale avvio USB/ISO solo per "impostare un indirizzo statico". Nessun percorso di rete effettua il fallback sui supporti locali in caso di errore di discovery o download.

## Requisiti

| Requisito | Note |
|-------------|--------|
| Ethernet cablata (o virtio/vmxnet in VM) | Viene usata la prima interfaccia rilevata non di loopback; il collegamento e la raggiungibilità non sono verificati e non c’è selezione `BOOTIF` / `ethdevice` nell’initrd |
| Initrd con moduli di rete | Necessario per varianti di pacchetto diverse dal valore interno `minimum` (`--network`, spesso `--cloud`) |
| Nessuna dipendenza dal Wi‑Fi | Il wireless non è supportato nel percorso di avvio da rete |
| Preferire NIC senza firmware blob | Le schede che richiedono firmware spesso falliscono nell’initrd |
| Preferire immagini **Standard** o più grandi | L’edizione **Flux** non include i moduli di rete NIC, quindi PXE / HTTP ISO non sono effettivamente supportati |
| Solo HTTP per URL ISO | `from=http://…` funziona; **`https://` non è supportato** |

Strumenti presenti nell’initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` e `@mount.httpfs2`. NetworkManager non è presente nell’initrd.

## Avvio PXE

### Flusso

1. Firmware / server PXE carica il **kernel** e l’**initrd** di MiniOS (pxelinux, iPXE, ecc.—al di fuori di MiniOS stesso).
2. La riga di comando del kernel include un **`ip=`** non vuoto (e normalmente `boot=live` per un avvio MiniOS completo).
3. L’initrd configura un indirizzo statico da `ip=`, contatta il campo **server**, scarica l’elenco dei file e poi i bundle/file MiniOS.
4. Il sistema prosegue nel root live come di consueto.

### Parametro `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Campo | Ruolo |
|-------|------|
| client-ip | Indirizzo assegnato con busybox `ifconfig` |
| server-ip | Host per i dati MiniOS via HTTP/TFTP; viene anche scritto come nameserver DNS nell’initrd |
| gateway-ip | Route predefinita; viene anche scritto come nameserver DNS |
| netmask | Netmask IPv4 puntata (non lunghezza prefisso CIDR) |
| port | Porta HTTP opzionale per elenco file e file (default **7529**) |

Esempi:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Come vengono recuperati i file

1. **HTTP** (preferito): `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` e poi ogni percorso elencato in quel file dallo stesso host/porta.
2. **TFTP**: busybox `tftp` viene selezionato solo se la richiesta HTTP iniziale per `PXEFILELIST` fallisce. Un successivo errore di download file via HTTP non commuta il trasferimento su TFTP.

La porta predefinita è **7529** quando il quinto campo viene omesso.

### Cosa NON è `ip=`

| Aspettativa | Realtà |
|-------------|---------|
| Formati kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Non supportati** — interpretati erroneamente come indirizzo client |
| IP statico per l’intera sessione live | **Non supportato** — dopo l’avvio, NetworkManager (o simili) gestisce l’interfaccia |
| IP statico durante il caricamento dei dati MiniOS da USB/ISO | **Non usare** — senza `from=http://…`, forza il download dati PXE |
| Elenco DNS dedicato | Solo gateway + server sono usati come nameserver nell’initrd |

## Avvio HTTP ISO (`from=http://…`)

Carica i dati MiniOS da una ISO remota senza un elenco file PXE completo:

```text
from=http://192.168.1.1/path/minios.iso
```

Comportamento:

1. L’initrd attiva la rete:
   - Se **`ip=`** è impostato → configurazione statica come sopra
   - Se **`ip=`** è omesso → **DHCP** tramite busybox `udhcpc`
2. Monta la ISO remota con **`httpfs2`**
3. Continua la ricerca dei contenuti MiniOS su quel mount

L’opzionale **`cache=`** (megabyte) abilita una cache di download httpfs, ad esempio `cache=512`.

Solo **`http://`** è accettato per questo percorso ISO remoto. **`https://` non è supportato.**

## Dopo l’avvio del sistema live

| Voce | Dopo switch_root |
|------|-------------------|
| IP/kernel/route sulla NIC | Possono rimanere finché l’userspace non riconfigura l’interfaccia |
| DNS initrd (`resolv.conf`) | Non è una policy di sessione permanente |
| Rete di sessione | Tipicamente **NetworkManager** sulle immagini MiniOS predefinite |
| Significato di `ip=` | Solo per il recupero iniziale — non è un profilo statico memorizzato |

Se la root è ancora fornita tramite **httpfs**, la riconfigurazione della NIC da parte di NetworkManager può interrompere la root live. Pianifica i deployment di avvio da rete tenendo conto di ciò (es. copia in RAM / evita di modificare l’interfaccia di recupero quando possibile).

L’userspace tardivo **live-config** può attivare temporaneamente la rete solo per scaricare hook/preseed remoti (`Setup_network`). Questo non è collegato all’indirizzamento persistente PXE/`ip=`.

## Errori comuni

1. Inserire `ip=` nella riga di comando USB/ISO "per IP statico" → il sistema tenta il download PXE invece del supporto locale a meno che `from=http://…` non selezioni prima l’avvio HTTP ISO.
2. Usare `ip=dhcp` o altra sintassi kernel `ip=` → parser errato, configurazione indirizzo non riuscita.
3. Aspettarsi selezione Wi‑Fi o multi-NIC `BOOTIF` nell’initrd → non implementato.
4. Usare un’immagine **Flux** per PXE/HTTP ISO → moduli di rete mancanti nell’initrd.
5. Servire la ISO solo tramite HTTPS → `from=http://…` non corrisponderà.
6. Confondere questa funzione con la configurazione statica dell’installer/NetworkManager dopo il login.

## Riepilogo affidabilità

| Scenario | Valutazione |
|----------|------------|
| PXE + `ip=…` + elenco HTTP su :7529 (o TFTP dopo il fallimento della richiesta elenco HTTP), semplice cablato / virtio | Target supportato |
| `from=http://…iso` + DHCP (o `ip=`), stessa classe NIC | Di solito funziona |
| Avvio normale USB/ISO | Rete initrd non utilizzata |
| Statico in sessione tramite `ip=` | Non supportato |
| Multi-NIC / NIC con firmware / Wi‑Fi / `https://` / edizione Flux | Debole o non supportato |

## Riferimenti implementativi

| Componente | Posizione nell’albero MiniOS |
|-------|-----------------------------|
| Init entry | `linux-live/initramfs/livekit-mos/init` |
| Network + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Builder LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Modulo Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Quando viene passato `-n` | `linux-live/build-initramfs` (non-minimum) |

## Vedi anche

- [Parametri di avvio](/reference/Boot-Parameters) — tabella completa dei parametri (`ip`, `from`, `cache`, …)
- [Rilevamento sistema initrd](/reference/boot-process/System-Discovery) — precedenza delle fonti, rilevamento locale e comportamento in caso di errore
- [live-config](/reference/configuration/live-config) — configurazione userspace tardiva (non avvio da rete)
- [Architettura di sistema](/reference/System-Architecture)
- [Costruire MiniOS](/development/Building-MiniOS) — builder initramfs (`livekit` / `dracut`)
