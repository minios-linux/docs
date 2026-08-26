---
updated: 2026-08-26
---

# Netzwerkkonfiguration

Nach dem Start von MiniOS verwaltet NetworkManager in der Regel kabelgebundene und WLAN-Verbindungen. Dies ist getrennt vom initramfs-Netzwerk, das für das Herunterladen eines PXE- oder HTTP-ISO-Systems verwendet wird. Insbesondere erstellt der PXE-Parameter `ip=` kein NetworkManager-Profil und setzt keine dauerhafte Sitzungsadresse. Weitere Informationen zur Netzwerkverbindung beim Systemstart finden Sie unter [Netzwerk-Boot](/installation/Network-Boot.md).

## Desktop-Konfiguration

Verwenden Sie das Netzwerksymbol im Panel, um ein WLAN auszuwählen, ein Gerät zu trennen oder erneut zu verbinden oder den Verbindungseditor zu öffnen. Für eine statische IP-Adresse bei einer kabelgebundenen Verbindung bearbeiten Sie die Verbindung und stellen die IPv4-Methode auf Manuell, dann geben Sie Adresse, Präfix, Gateway und DNS-Server ein. Stellen Sie die Methode auf Automatisch (DHCP), um DHCP zu nutzen.

Die Textoberfläche bietet die gleichen Standardfunktionen:

```bash
nmtui
```

Wählen Sie **Eine Verbindung bearbeiten**, um ein Profil zu ändern, und **Eine Verbindung aktivieren**, um sie zu verbinden.

## NetworkManager-Befehlszeile

Geräte und gespeicherte Profile anzeigen:

```bash
nmcli device status
nmcli connection show
```

Nach WLANs suchen und verbinden:

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

Der letzte Befehl fragt nach dem Passwort, ohne es in der Befehlszeile anzuzeigen. Geben Sie ein WLAN-Passwort niemals direkt in einen Befehl ein, da es in der Shell-Historie verbleiben und für andere Prozesse sichtbar sein kann.

Um ein vorhandenes kabelgebundenes Profil auf DHCP umzustellen:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

Um eine statische IPv4-Adresse zuzuweisen:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Ersetzen Sie den Profilnamen und die Adressen durch Werte für Ihr lokales Netzwerk. Eine Remote-Verbindung kann unterbrochen werden, sobald das aktive Profil geändert wird.

## Persistenz

NetworkManager speichert Systemprofile unter `/etc/NetworkManager/system-connections/`. Bei einem Live-Boot ohne Persistenz gehen Änderungen, die über den Desktop, `nmcli` oder `nmtui` vorgenommen werden, beim Herunterfahren verloren. In einer persistenten Sitzung bleiben sie über Neustarts hinweg erhalten. Weitere Informationen zur Auswahl und Speicherung von Sitzungen finden Sie unter [Sitzungsverwaltung](/configuration/Session-Management.md).

Profile werden nicht automatisch zwischen separaten persistenten Sitzungen geteilt. WLAN-Profile können Zugangsdaten enthalten, daher sollten Sie das Sitzungsmedium schützen und Zugangsdaten entfernen, bevor Sie ein Sitzungsarchiv oder Diagnosedaten weitergeben.

## Vorkonfiguration einer kabelgebundenen Verbindung

Die MiniOS-Komponente live-config network kann eine statische IPv4-Richtlinie für Kabelverbindungen erstellen, bevor Netzwerkdienste starten. Dies ist für unbeaufsichtigte oder installierte Systeme gedacht. WLAN wird damit nicht konfiguriert.

Fügen Sie Shell-ähnliche Zuweisungen zu `minios/config.conf` auf dem MiniOS-Medium oder zu `/etc/live/config.conf` im Live-System hinzu:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Werte als Shell-Strings in Anführungszeichen setzen und keine Leerzeichen um `=` verwenden. Weitere Informationen zu Speicherorten und Prioritäten finden Sie unter [Konfigurationsdatei](/configuration/Configuration-File.md) sowie zu Komponentenaktivierung und allgemeinen Optionen unter [live-config](/configuration/live-config.md).

Die entsprechenden Boot-Optionen sind:

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

Die Langformen `live-config.network-*` werden ebenfalls akzeptiert. Dies sind späte Userspace-Optionen für live-config, nicht die PXE-Syntax `ip=`.

### Methoden

| Methode | Verhalten |
|---------|-----------|
| Nicht gesetzt oder `dhcp` | Nimmt keine Änderungen vor und erhält die bestehende Netzwerkkonfiguration des Abbilds. Es wird keine DHCP-Konfiguration erstellt und ein früheres MiniOS-Static-Profil nicht entfernt. |
| `static` | Erstellt ein statisches IPv4-Profil für Kabelverbindungen. Das Präfix ist standardmäßig `24`; Gateway und DNS sind optional. |
| `off` | Erstellt ein nicht automatisch verbindendes NetworkManager-Profil mit deaktiviertem IPv4 oder einen ifupdown-Abschnitt `manual`. Dies ist kein WLAN-Schalter. |

Nur `static` und `off` wählen ein Interface aus und schreiben Konfigurationen. Wenn `LIVE_NETWORK_INTERFACE` weggelassen wird, fährt live-config nur fort, wenn genau ein kabelgebundenes, nicht-Loopback-Interface verfügbar ist. Drahtlose Schnittstellen sind ausgeschlossen. Verwenden Sie `ip link` oder `nmcli device status`, um den tatsächlichen Schnittstellennamen auf einem System mit mehreren Interfaces zu ermitteln.

### Backends und Validierung

`LIVE_NETWORK_BACKEND` akzeptiert:

| Backend | Verhalten |
|---------|-----------|
| `auto` oder nicht gesetzt | Bevorzugt NetworkManager und verwendet ifupdown als Fallback. |
| `nm` | Erfordert NetworkManager und schreibt `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Erfordert ifupdown und schreibt `/etc/network/interfaces.d/minios-static`. Falls NetworkManager installiert ist, wird das gewählte Interface zusätzlich in `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf` als unmanaged markiert. |

Schnittstellennamen dürfen nur Buchstaben, Ziffern, `_`, `.`, `:` und `-` enthalten. Statische Adressen und Gateways müssen gültige IPv4-Adressen sein. Das Präfix muss eine ganze Zahl von `0` bis `32` sein. DNS ist eine kommagetrennte Liste von IPv4- oder IPv6-Adressen. Ungültige Werte, mehrdeutige Schnittstellenauswahl und nicht verfügbare Backends werden gemeldet und es wird kein Erfolgsstempel geschrieben.

## Änderung der persistenten live-config-Richtlinie

In einem persistenten Live-System wird die Netzwerkkomponente normalerweise einmal angewendet und der Erfolg unter `/var/lib/live/config/network` vermerkt. Um geänderte statische oder ausgeschaltete Einstellungen zu übernehmen:

1. Bearbeiten Sie die effektive persistente `/etc/live/config.conf`.
2. Entfernen Sie den Stempel mit `sudo rm /var/lib/live/config/network`.
3. Starten Sie das System neu.

Nur die Änderung der Konfiguration auf dem Wechseldatenträger überschreibt keine bestehende persistente `/etc/live/config.conf`.

Das Setzen von `LIVE_NETWORK_METHOD="dhcp"` ist kein Profil-Reset. Um von einem MiniOS-verwalteten statischen Profil zum normalen NetworkManager-DHCP zurückzukehren, entfernen Sie die statische `LIVE_NETWORK_*`-Richtlinie aus der effektiven Konfiguration, löschen Sie das verwaltete Profil und den Stempel und starten Sie neu:

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

Für das ifupdown-Backend entfernen Sie stattdessen `/etc/network/interfaces.d/minios-static` und `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. Erstellen oder aktivieren Sie anschließend ein DHCP-Profil mit dem Desktop-Editor, `nmtui` oder `nmcli`, falls NetworkManager nicht automatisch eines erstellt.

## Verhalten des Installers

Der Netzwerkschritt im Installer betrifft nur kabelgebundene Netzwerke. Eine ausgewählte statische IPv4-Konfiguration wird für das installierte System übernommen. Bei Auswahl von DHCP bleiben die Standardwerte erhalten, es wird kein Profil-Reset geschrieben. Bestehende WLAN-Profile und -Einstellungen bleiben unverändert.

## Diagnose

Überprüfen Sie zunächst Gerät, Adresse, Route und NetworkManager-Status:

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Prüfen Sie das aktuelle Boot-Log auf Geräte-, Firmware-, DHCP- und live-config-Fehler:

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

Für eine live-config-Richtlinie prüfen Sie außerdem die effektiven Einstellungen, die generierte Datei und den Stempel. Das Hauptprotokoll für live-config ist `/var/log/live/config.log`.

Testen Sie Fehler in folgender Reihenfolge: Verbindungsstatus, Adresse auf dem Interface, Standardroute und Gateway, eine externe IP-Adresse und zuletzt einen DNS-Namen. So lassen sich Geräte- oder Firmware-Probleme von DHCP-, Routing- und DNS-Problemen unterscheiden. Weitere Hinweise und Protokollsammlung finden Sie unter [Fehlerbehebung](/administration/Troubleshooting.md).

## Siehe auch

- [Netzwerk-Boot](/installation/Network-Boot.md)
- [Konfigurationsdatei](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Fehlerbehebung](/administration/Troubleshooting.md)
- [Sitzungsverwaltung](/configuration/Session-Management.md)
