---
updated: 2026-08-26
---

# Netzwerk-Boot

Diese Seite beschreibt, **wie MiniOS über das Netzwerk geladen wird**: PXE (Kernel + initrd + MiniOS-Daten) und HTTP-ISO (`from=http://…`). Das ist der einzige Zweck von Netzwerkfunktionalität im MiniOS-initramfs.

Es geht **nicht** um:

- Die Konfiguration von NetworkManager oder eine dauerhafte statische IP nach dem Systemstart
- WLAN im initrd
- [live-config](/configuration/live-config.md) (spätes Userspace)

Netzwerkkonfiguration nach dem Boot ist separat. Für eine dauerhafte kabelgebundene statische IP nutze den Schritt „Netzwerk“ im Installer, NetworkManager oder ifupdown—nicht den PXE-Parameter `ip=`.

Siehe auch: [Boot-Parameter](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Übersicht

| Modus | Was wird gebootet | Wie MiniOS-Daten bezogen werden |
|------|--------------------|-------------------------------|
| **PXE** | Kernel + initrd von einem Netzwerk-Boot-Server | Nicht-leeres `ip=` ohne `from=http://…` → initrd lädt MiniOS-Dateien vom PXE-Datenserver herunter |
| **HTTP ISO** | Kernel + initrd von lokalen Medien **oder** PXE | `from=http://…/minios.iso` → initrd startet das Netzwerk und bindet das ISO mit `httpfs2` ein |
| **Lokale Medien** | USB / ISO / Festplatte | Kein initrd-Netzwerk; nur lokale Suche |

Initramfs-Builder: **LiveKit** (`livekit-mos`) oder **dracut** (`dracut-mos`). Beide verwenden die gleichen LiveKit-Netzwerkhelfer für das frühe Laden.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` hat Vorrang vor `ip=`. In diesem Modus liefert `ip=` die statische
Adressierung für die HTTP-ISO-Verbindung. Andernfalls wählt jedes nicht-leere `ip=`
den **PXE-Datenpfad** und überspringt lokale Medien. Fügen Sie `ip=` bei einem normalen USB/ISO-
Boot nicht hinzu, nur um "eine statische Adresse zu setzen". Keiner der Netzwerkpfade fällt auf lokale
Medien zurück, falls die Erkennung oder der Download fehlschlägt.

## Anforderungen

| Anforderung | Hinweise |
|-------------|---------|
| Kabelgebundenes Ethernet (oder virtio/vmxnet in VMs) | Erste erkannte Nicht-Loopback-Schnittstelle wird verwendet; Verbindung und Erreichbarkeit werden nicht geprüft, und es gibt keine `BOOTIF` / `ethdevice`-Auswahl im initrd |
| Initrd mit Netzwerktreibern | Erstellt für Paketvarianten außer dem internen `minimum`-Wert (`--network`, häufig `--cloud`) |
| Keine Abhängigkeit von WLAN | Drahtlos wird im Netzwerk-Boot-Pfad nicht unterstützt |
| Bevorzugt NICs ohne Firmware-Blobs | Firmware-abhängige Karten funktionieren im initrd oft nicht |
| Bevorzugt **Standard**- oder größere Images | Die **Flux**-Edition enthält keine Netzwerk-NIC-Module, daher ist PXE / HTTP ISO praktisch nicht unterstützt |
| Nur HTTP für ISO-URL | `from=http://…` funktioniert; **`https://` wird nicht unterstützt** |

Tools im initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` und `@mount.httpfs2`. Es gibt keinen NetworkManager im initrd.

## PXE-Boot

### Ablauf

1. Firmware / PXE-Server lädt den MiniOS-**Kernel** und die **initrd** (pxelinux, iPXE usw.—außerhalb von MiniOS selbst).
2. Kernel-Cmdline enthält ein nicht-leeres **`ip=`** (und normalerweise `boot=live` für einen vollständigen MiniOS-Boot).
3. Initrd konfiguriert eine statische Adresse aus `ip=`, kontaktiert das **Server**-Feld, lädt eine Dateiliste herunter und dann MiniOS-Bundles/-Dateien.
4. Das System startet wie gewohnt in das Live-System.

### Parameter `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Feld | Funktion |
|------|----------|
| client-ip | Adresse, die mit busybox `ifconfig` gesetzt wird |
| server-ip | Host für HTTP/TFTP MiniOS-Daten; wird auch als DNS-Nameserver im initrd eingetragen |
| gateway-ip | Standard-Gateway; wird ebenfalls als DNS-Nameserver eingetragen |
| netmask | Punktierte IPv4-Netzmaske (kein CIDR-Präfix) |
| port | Optionaler HTTP-Port für Dateiliste und Dateien (Standard **7529**) |

Beispiele:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### So werden Dateien abgerufen

1. **HTTP** (bevorzugt):
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`
   anschließend wird jeder in dieser Datei aufgeführte Pfad vom selben Host/Port geladen.
2. **TFTP**: busybox `tftp` wird nur ausgewählt, wenn die initiale HTTP-Anfrage für
   `PXEFILELIST` fehlschlägt. Ein späterer HTTP-Download-Fehler führt nicht dazu,
   dass der Transfer auf TFTP umgestellt wird.

Der Standardport ist **7529**, wenn das fünfte Feld weggelassen wird.

### Was `ip=` nicht ist

| Erwartung | Realität |
|-----------|----------|
| Kernel-/dracut-Formen (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Nicht unterstützt** — wird als Client-Adresse fehlinterpretiert |
| Statische IP für die gesamte Live-Session | **Nicht unterstützt** — nach dem Boot übernimmt NetworkManager (oder Ähnliches) die Schnittstelle |
| Statische IP beim Laden von MiniOS-Daten von USB/ISO | **Nicht verwenden** — ohne `from=http://…` erzwingt es den PXE-Daten-Download |
| Eigene DNS-Liste | Nur Gateway + Server werden im initrd als Nameserver verwendet |

## HTTP-ISO-Boot (`from=http://…`)

Lade MiniOS-Daten aus einem entfernten ISO ohne vollständige PXE-Dateiliste:

```text
from=http://192.168.1.1/path/minios.iso
```

Verhalten:

1. Initrd aktiviert das Netzwerk:
   - Falls **`ip=`** gesetzt ist → statische Konfiguration wie oben
   - Falls **`ip=`** fehlt → **DHCP** via busybox `udhcpc`
2. Mountet das entfernte ISO mit **`httpfs2`**
3. Sucht MiniOS-Inhalte auf diesem Mount

Optionales **`cache=`** (in Megabyte) aktiviert einen httpfs-Download-Cache, z. B. `cache=512`.

Nur **`http://`** wird für diesen Remote-ISO-Pfad akzeptiert. **`https://` wird nicht unterstützt.**

## Nach dem Start des Live-Systems

| Punkt | Nach switch_root |
|-------|------------------|
| Kernel-IP/Routes auf dem NIC | Können bestehen bleiben, bis Userspace das Interface neu konfiguriert |
| Initrd-DNS (`resolv.conf`) | Keine dauerhafte Sitzungskonfiguration |
| Netzwerk in der Sitzung | Typischerweise **NetworkManager** auf Standard-MiniOS-Images |
| Bedeutung von `ip=` | Nur für den frühen Download — kein dauerhaftes statisches Profil |

Wenn das Root-Dateisystem weiterhin über **httpfs** bereitgestellt wird, kann eine Neukonfiguration des NIC durch NetworkManager das Live-System stören. Plane Netzwerk-Boot-Deployments entsprechend (z. B. Kopieren in den RAM / Vermeidung von Änderungen am Download-Interface, wo möglich).

Spätes Userspace **live-config** kann das Netzwerk kurz aktivieren, um entfernte Hooks/Preseeds herunterzuladen (`Setup_network`). Das ist unabhängig von PXE/`ip=`-Adressen.

## Häufige Fehler

1. `ip=` auf einer USB/ISO-Cmdline "für statische IP" setzen → System versucht PXE-Download anstelle von lokalen Medien, sofern nicht vorher `from=http://…` als HTTP-ISO-Boot gewählt wurde.
2. Verwendung von `ip=dhcp` oder anderer Kernel-`ip=`-Syntax → falscher Parser, fehlerhafte Adresskonfiguration.
3. Erwartung von WLAN- oder Multi-NIC-`BOOTIF`-Auswahl im initrd → nicht implementiert.
4. Verwendung eines **Flux**-Images für PXE/HTTP ISO → Netzwerkmodule fehlen im initrd.
5. ISO wird nur über HTTPS bereitgestellt → `from=http://…` wird nicht gefunden.
6. Verwechslung mit statischer Konfiguration durch Installer/NetworkManager nach dem Login.

## Zuverlässigkeitsübersicht

| Szenario | Bewertung |
|----------|-----------|
| PXE + `ip=…` + HTTP-Liste auf :7529 (oder TFTP nach Fehlschlag der HTTP-Listenanfrage), einfaches Kabel/virtio | Unterstütztes Ziel |
| `from=http://…iso` + DHCP (oder `ip=`), gleiche NIC-Klasse | Funktioniert meist |
| Normaler USB/ISO-Boot | Initrd-Netzwerk wird nicht verwendet |
| Session statisch über `ip=` | Nicht unterstützt |
| Multi-NIC / Firmware-NIC / WLAN / `https://` / Flux-Edition | Schwach oder nicht unterstützt |

## Implementierungsreferenz

| Komponente | Speicherort im MiniOS-Tree |
|------------|----------------------------|
| Init-Einstieg | `linux-live/initramfs/livekit-mos/init` |
| Netzwerk + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| LiveKit-Builder (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Dracut-MiniOS-Modul | `linux-live/initramfs/dracut-mos/90minios/` |
| Bei Übergabe von `-n` | `linux-live/build-initramfs` (non-minimum) |

## Siehe auch

- [Boot-Parameter](/configuration/Boot-Parameters.md) — vollständige Parametertabelle (`ip`, `from`, `cache`, …)
- [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md) — Quellenvorrang, lokale Erkennung und Fehlerverhalten
- [live-config](/configuration/live-config.md) — späte Userspace-Konfiguration (kein Netzwerk-Boot)
- [Systemarchitektur](/about/System-Architecture.md)
- [MiniOS bauen](/development/Building-MiniOS.md) — initramfs-Builder (`livekit` / `dracut`)
