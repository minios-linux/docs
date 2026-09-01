---
updated: 2026-08-31
---

# Netzwerk

MiniOS verwendet **NetworkManager** für die normale kabelgebundene und WLAN-Netzwerkanbindung. MiniOS ersetzt das Verbindungsmodell nicht durch ein separates Netzwerk-Konfigurationssystem.

Für den alltäglichen Gebrauch öffnen Sie das Netzwerksymbol im Panel der Desktop-Oberfläche. Die Standardwerkzeuge von NetworkManager stehen ebenfalls zur Verfügung:

```bash
nmtui
nmcli
```

Mit diesen Tools können Sie sich mit WLAN verbinden, Netzwerke wechseln, DHCP oder statische Adressen, DNS, VPN-Verbindungen und andere übliche Netzwerkeinstellungen zur Laufzeit konfigurieren. Für alle Details nutzen Sie bitte die Dokumentation und die Handbuchseiten von NetworkManager.

In einer persistenten MiniOS-Sitzung werden NetworkManager-Verbindungsprofile als Teil dieser Sitzung gespeichert. Bei **Ohne Speichern starten** gehen Änderungen beim Herunterfahren verloren.

## Netzwerk-Vorkonfiguration

MiniOS-spezifische Netzwerkeinstellungen sind in erster Linie **Vorkonfigurationen**. Sie sind nützlich, wenn ein Abbild, ein Installationsprogramm oder eine unbeaufsichtigte Bereitstellung mit einer bekannten kabelgebundenen Konfiguration starten soll, bevor der Benutzer NetworkManager öffnet.

Die `live-config`-Netzwerkkomponente von MiniOS unterstützt die Vorkonfiguration kabelgebundener IPv4-Verbindungen. WLAN wird nicht vorkonfiguriert.

Ein statisches Beispiel in `config.conf` ist:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` akzeptiert `dhcp`, `static` oder `off`. Ist die Variable nicht gesetzt oder auf `dhcp` gesetzt, bleibt die bestehende Netzwerkeinrichtung des Abbilds erhalten, anstatt das normale Verhalten von NetworkManager zu ersetzen. `static` schreibt eine statische IPv4-Konfiguration für Kabelverbindungen; `off` bereitet die ausgewählte kabelgebundene Schnittstelle so vor, dass sie sich nicht automatisch verbindet. Mit `LIVE_NETWORK_BACKEND="auto"` bevorzugt MiniOS NetworkManager und greift bei Bedarf auf ifupdown zurück. Wenn keine Schnittstelle angegeben ist, wird die Vorkonfiguration nur angewendet, wenn genau eine geeignete kabelgebundene Schnittstelle erkannt werden kann.

Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für den Speicherort dieser Einstellungen und [live-config](/reference/configuration/live-config) für die vollständige Variablen- und Komponentenreferenz.

## Wann die Vorkonfiguration angewendet wird

Die Netzwerkkomponente ist ein einmaliger `live-config`-Einrichtungsschritt. Nachdem sie in einer persistenten Sitzung erfolgreich ausgeführt wurde, sollten normale Netzwerkänderungen mit NetworkManager und nicht durch wiederholtes Bearbeiten der Vorkonfiguration vorgenommen werden.

Wenn Sie gezielt eine geänderte MiniOS-Netzwerk-Vorkonfiguration auf dieselbe persistente Sitzung anwenden möchten, entfernen Sie den Abschlussstempel und starten Sie neu:

```bash
sudo rm -f /var/lib/live/config/network
```

Tun Sie dies nur, wenn Sie tatsächlich möchten, dass `live-config` die kabelgebundene Richtlinie erneut erzeugt. Für Änderungen an normalen WLAN- oder Ethernet-Verbindungen ist dies nicht erforderlich.

## Vorkonfiguration im Installationsprogramm

Der Netzwerkschritt des MiniOS-Installationsprogramms führt ebenfalls eine Vorkonfiguration für das Zielsystem durch. Unterstützt werden kabelgebundene DHCP- oder statische IPv4-Einstellungen. WLAN wird nach dem Start des installierten Systems dem NetworkManager überlassen.

## Netzwerk im Frühstart funktioniert anders

NetworkManager konfiguriert das laufende MiniOS-System. Die Netzwerkverbindung, die vom initramfs genutzt wird, um MiniOS selbst zu beziehen, ist ein separater Mechanismus.

Der Boot-Parameter `ip=`, PXE-Downloads und `from=http://...` erstellen daher keine NetworkManager-Profile und sollten nicht zur Konfiguration des normalen Desktop-Netzwerks verwendet werden. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

## Fehlerbehebung

Bei einem gewöhnlichen Verbindungsproblem beginnen Sie mit NetworkManager selbst:

```bash
nmcli device status
nmcli connection show --active
```

Verwenden Sie bei Problemen mit WLAN, DHCP, DNS, VPN oder Ethernet den Verbindungseditor der Desktop-Oberfläche, `nmtui` oder die üblichen NetworkManager-Protokolldateien und die NetworkManager-Dokumentation.

MiniOS-spezifische Diagnosen sind relevant, wenn es um Probleme mit der Netzwerk-Vorkonfiguration oder dem Netzwerk-Boot geht. Das `live-config`-Protokoll ist `/var/log/live/config.log`; frühe Netzwerk-Boot-Probleme werden im Leitfaden [Netzwerk-Boot](/reference/boot-process/Network-Boot) behandelt.

## Verwandte Dokumentation

- [Konfigurationsdatei](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Netzwerk-Boot](/reference/boot-process/Network-Boot)
- [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence)
