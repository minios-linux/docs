---
updated: 2026-08-26
---

# Netzwerk-Boot

Diese Seite beschreibt, **wie MiniOS über das Netzwerk geladen wird**: PXE (Kernel + initrd + MiniOS-Daten) und HTTP ISO (`from=http://…`). Das ist der einzige Zweck der Netzwerkanbindung im MiniOS-initramfs.

Es geht **nicht** um:

- Die Konfiguration von NetworkManager oder eine dauerhafte statische IP nach dem Systemstart
- WLAN im initrd
- [live-config](/reference/configuration/live-config) (spätes Userspace)

Die Netzwerkkonfiguration nach dem Boot ist separat. Für eine dauerhafte kabelgebundene statische IP verwende den Netzwerk-Schritt im Installer, NetworkManager oder ifupdown – **nicht** den PXE-Parameter `ip=`.

Siehe auch: [Boot-Parameter](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Übersicht

| Modus | Was gebootet wird | Wie MiniOS-Daten bezogen werden |
|------|--------------------|-------------------------------------|
| **PXE** | Kernel + initrd von einem Netzwerk-Boot-Server | Nicht-leeres `ip=` ohne `from=http://…` → initrd lädt MiniOS-Dateien vom PXE-Datenserver herunter |
| **HTTP ISO** | Kernel + initrd von lokalen Medien **oder** PXE | `from=http://…/minios.iso` → initrd aktiviert das Netzwerk und bindet das ISO mit `httpfs2` ein |
| **Lokale Medien** | USB / ISO / Festplatte | Kein initrd-Netzwerk; nur lokale Suche |

Initramfs-Builder: **LiveKit** (`livekit-mos`) oder **dracut** (`dracut-mos`). Beide verwenden die gleichen LiveKit-Netzwerk-Hilfsprogramme für das frühe Herunterladen.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` hat Vorrang vor `ip=`. In diesem Modus liefert `ip=` die statische Adressierung für die HTTP-ISO-Verbindung. Andernfalls wählt jedes nicht-leere `ip=` den **PXE-Datenpfad** und überspringt lokale Medien. Fügen Sie `ip=` bei einem normalen USB/ISO-Boot nicht nur hinzu, um eine "statische Adresse zu setzen". Keiner der Netzwerkpfade fällt auf lokale Medien zurück, wenn die Erkennung oder der Download fehlschlägt.

## Voraussetzungen

| Voraussetzung | Hinweise |
|---------------|---------|
| Kabelgebundenes Ethernet (oder virtio/vmxnet in VMs) | Erstes erkanntes Nicht-Loopback-Interface wird verwendet; Link und Erreichbarkeit werden nicht geprüft, und es gibt keine `BOOTIF` / `ethdevice`-Auswahl im initrd |
| Initrd mit Netzwerkmodulen | Erstellt für Paketvarianten außer dem internen `minimum`-Wert (`--network`, oft `--cloud`) |
| Keine Abhängigkeit von WLAN | Drahtlos wird im Netzwerk-Boot-Pfad nicht unterstützt |
| Bevorzuge NICs ohne Firmware-Blobs | Firmware-abhängige Karten funktionieren im initrd oft nicht |
| Bevorzuge **Standard**- oder größere Images | Die **Flux**-Edition lässt Netzwerk-NIC-Module weg, daher ist PXE / HTTP ISO effektiv nicht unterstützt |
| Nur HTTP für ISO-URL | `from=http://…` funktioniert; **`https://` wird nicht unterstützt** |

Tools im initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` und `@mount.httpfs2`. Es gibt keinen NetworkManager im initrd.

## PXE-Boot

### Ablauf

1. Firmware / PXE-Server lädt den MiniOS-**Kernel** und das **initrd** (pxelinux, iPXE, etc. – außerhalb von MiniOS selbst).
2. Die Kernel-Cmdline enthält ein nicht-leeres **`ip=`** (und normalerweise `boot=live` für einen vollständigen MiniOS-Boot).
3. Initrd konfiguriert eine statische Adresse aus `ip=`, kontaktiert das **Server**-Feld, lädt eine Dateiliste herunter und anschließend MiniOS-Bundles/Dateien.
4. Das System startet wie gewohnt in das Live-Root weiter.

### Parameter `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Feld | Rolle |
|------|------|
| client-ip | Adresse, die mit busybox `ifconfig` zugewiesen wird |
| server-ip | Host für HTTP/TFTP MiniOS-Daten; wird im initrd auch als DNS-Nameserver eingetragen |
| gateway-ip | Standard-Gateway; wird im initrd ebenfalls als DNS-Nameserver eingetragen |
| netmask | Punktierte IPv4-Netzmaske (kein CIDR-Präfix) |
| port | Optionaler HTTP-Port für die Dateiliste und Dateien (Standard **7529**) |

Beispiele:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Wie Dateien abgerufen werden

1. **HTTP** (bevorzugt): `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` und dann jeder in dieser Datei aufgeführte Pfad vom gleichen Host/Port.
2. **TFTP**: busybox `tftp` wird nur ausgewählt, wenn die initiale HTTP-Anfrage für `PXEFILELIST` fehlschlägt. Ein späterer HTTP-Download-Fehler führt nicht zum Wechsel auf TFTP.

Der Standard-Port ist **7529**, wenn das fünfte Feld weggelassen wird.

### Was `ip=` nicht ist

| Erwartung | Realität |
|-----------|----------|
| Kernel-/dracut-Formen (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Nicht unterstützt** – wird als Client-Adresse fehlinterpretiert |
| Statische IP für die gesamte Live-Session | **Nicht unterstützt** – nach dem Boot verwaltet NetworkManager (oder Ähnliches) das Interface |
| Statische IP beim Laden von MiniOS-Daten von USB/ISO | **Nicht verwenden** – ohne `from=http://…` erzwingt es den PXE-Daten-Download |
| Eigene DNS-Liste | Nur Gateway + Server werden im initrd als Nameserver verwendet |

## HTTP-ISO-Boot (`from=http://…`)

Lade MiniOS-Daten von einer entfernten ISO, ohne eine vollständige PXE-Dateiliste:

```text
from=http://192.168.1.1/path/minios.iso
```

Verhalten:

1. Initrd aktiviert das Netzwerk:
   - Wenn **`ip=`** gesetzt ist → statische Konfiguration wie oben
   - Wenn **`ip=`** fehlt → **DHCP** via busybox `udhcpc`
2. Mountet die entfernte ISO mit **`httpfs2`**
3. Sucht MiniOS-Inhalte auf diesem Mount weiter

Optional aktiviert **`cache=`** (Megabyte) einen httpfs-Download-Cache, z.B. `cache=512`.

Nur **`http://`** wird für diesen Remote-ISO-Pfad akzeptiert. **`https://` wird nicht unterstützt.**

## Nach dem Start des Live-Systems

| Element | Nach switch_root |
|---------|------------------|
| Kernel-IP/Routes auf der NIC | Können bestehen bleiben, bis Userspace das Interface neu konfiguriert |
| Initrd-DNS (`resolv.conf`) | Keine dauerhafte Session-Policy |
| Netzwerk in der Session | Typischerweise **NetworkManager** auf Standard-MiniOS-Images |
| Bedeutung von `ip=` | Nur für den frühen Download – kein dauerhaftes statisches Profil |

Wenn das Root-Dateisystem weiterhin über **httpfs** bereitgestellt wird, kann eine Neukonfiguration der NIC durch NetworkManager das Live-Root stören. Plane Netzwerk-Boot-Deployments entsprechend (z.B. Kopieren in den RAM / Vermeidung von Änderungen am Download-Interface, wo möglich).

Das späte Userspace-Tool **live-config** kann das Netzwerk kurzzeitig aktivieren, um entfernte Hooks/Preseeds herunterzuladen (`Setup_network`). Das ist unabhängig von PXE/`ip=`-dauerhafter Adressierung.

## Häufige Fehler

1. `ip=` auf einer USB/ISO-Cmdline "für statische IP" setzen → System versucht stattdessen PXE-Download, sofern nicht `from=http://…` zuerst HTTP-ISO-Boot gewählt hat.
2. `ip=dhcp` oder andere Kernel-`ip=`-Syntax verwenden → falscher Parser, fehlerhafte Adresskonfiguration.
3. WLAN- oder Multi-NIC-`BOOTIF`-Auswahl im initrd erwarten → nicht implementiert.
4. Eine **Flux**-Image für PXE/HTTP ISO verwenden → Netzwerkmodule fehlen im initrd.
5. Die ISO nur über HTTPS bereitstellen → `from=http://…` wird nicht erkannt.
6. Dies mit statischer Konfiguration im Installer/NetworkManager nach dem Login verwechseln.

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
|------------|---------------------------|
| Init-Einstieg | `linux-live/initramfs/livekit-mos/init` |
| Netzwerk + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| LiveKit-Builder (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Dracut-MiniOS-Modul | `linux-live/initramfs/dracut-mos/90minios/` |
| Wenn `-n` übergeben wird | `linux-live/build-initramfs` (nicht-minimal) |

## Siehe auch

- [Boot-Parameter](/reference/Boot-Parameters) — vollständige Parametertabelle (`ip`, `from`, `cache`, …)
- [Initrd-Systemerkennung](/reference/boot-process/System-Discovery) — Quellenvorrang, lokale Erkennung und Fehlerverhalten
- [live-config](/reference/configuration/live-config) — späte Userspace-Konfiguration (kein Netzwerk-Boot)
- [Systemarchitektur](/reference/System-Architecture)
- [MiniOS bauen](/development/Building-MiniOS) — initramfs-Builder (`livekit` / `dracut`)
