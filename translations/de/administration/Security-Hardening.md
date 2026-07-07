# Leitfaden zur Systemhärtung

Dieser Leitfaden bietet praxisnahe Schritte, um die Sicherheit Ihres MiniOS-Systems zu erhöhen. Da MiniOS ein Live-System ist, liegt der Schwerpunkt auf dem Schutz von Benutzerdaten auf persistenten Speichermedien und der Kontrolle des Zugriffs auf das laufende System. Die Standardeinstellungen sind auf bequeme, portable Nutzung ausgelegt, bieten jedoch nicht in allen Szenarien optimalen Schutz. Die folgenden Empfehlungen helfen Ihnen, das System für mehr Sicherheit zu konfigurieren.

## Sicherheit von Benutzer- und Root-Konten

Standardmäßig führt MiniOS einen automatischen Login ohne Passwort durch. Dies ist praktisch für den portablen Einsatz, kann aber in bestimmten Situationen ein Sicherheitsrisiko darstellen.

**Standard-Anmeldedaten:**
- **Benutzer**: `live` / `evil`  
- **Root**: `root` / `toor`

⚠️ **Diese Zugangsdaten sind öffentlich bekannt und müssen bei Netzwerk- oder Produktivbetrieb umgehend geändert werden.**

### Erstellen eines verschlüsselten Passworts

Vor der Konfiguration von Passwörtern wird empfohlen, einen verschlüsselten Passwort-Hash zu erzeugen:

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Passwörter setzen

Sie können Passwörter auf zwei Arten setzen: **Es wird dringend empfohlen**, verschlüsselte Passwörter zu verwenden.

**Wichtig:** Das Setzen von Passwörtern und Benutzerparametern über Boot-Parameter und Konfigurationsdateien wirkt nur beim ersten Systemstart. Danach können Passwörter nur noch mit den Standardmethoden von Linux geändert werden (`passwd`, `sudo passwd`).

#### Über Boot-Parameter

Fügen Sie im Boot-Menü (GRUB für UEFI oder SYSLINUX für BIOS) folgende Parameter zur Kernel-Befehlszeile hinzu:

**Für verschlüsselte Passwörter (empfohlen):**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**Für Klartext-Passwörter (nicht empfohlen):**
```
user-password='your_password'
root-password='root_password'
```

**Wichtig:** Klartext-Passwörter sind in der Kernel-Befehlszeile sichtbar und können von anderen Systembenutzern ausgelesen werden.

#### Über Konfigurationsdatei

Bearbeiten Sie die Datei `minios/config.conf` im Root-Verzeichnis des USB-Sticks:

**Für verschlüsselte Passwörter:**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**Für Klartext-Passwörter:**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Passwörter nach dem Systemstart ändern

Nach dem ersten Systemstart können Passwörter mit den Standard-Linux-Befehlen geändert werden:

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Automatischen Login deaktivieren

Nachdem Sie Passwörter gesetzt haben, deaktivieren Sie den automatischen Login, um eine Authentifizierung zu erzwingen:

#### Über Boot-Parameter

```
noautologin
```

#### Über Konfigurationsdatei

```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Teilweise Deaktivierung des Autologins:**
- `nox11autologin` – deaktiviert nur den grafischen Autologin (Login-Manager verlangt Authentifizierung)
- `nottyautologin` – deaktiviert nur den Konsolen-Autologin (bereits standardmäßig deaktiviert)

### Verwaltung von Benutzerrechten

Standardmäßig verfügt der Benutzer `live` sowohl in der Konsole (`sudo`) als auch in grafischen Anwendungen (über polkit) über uneingeschränkte Administratorrechte ohne Passwortabfrage. Dies ist für den Live-Betrieb bequem, kann aber für erhöhte Sicherheit angepasst werden.

#### Passwortabfrage für sudo aktivieren

Um eine Passworteingabe bei Verwendung von `sudo` zu verlangen, führen Sie nach dem Systemstart aus:

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

Danach wird bei `sudo`-Befehlen das Benutzerpasswort abgefragt.

#### Passwortabfrage für grafische Anwendungen aktivieren

Damit grafische Administrationsprogramme nach einem Passwort fragen, entfernen Sie die polkit-Regel:

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

Anschließend fordern Software-Installer, Systemeinstellungen und andere grafische Administrationsprogramme ein Passwort an.

#### Vollständige Deaktivierung von Administratorrechten (`noroot`)

Für maximale Sicherheit können Sie `sudo` und Root-Zugriff komplett deaktivieren:

**Über Boot-Parameter:**
```
noroot
```

**Über Konfigurationsdatei:**
```
LIVE_CONFIG_NOROOT=true
```

**Auswirkung:** Der Befehl `sudo` funktioniert nicht mehr, Root-Login ist deaktiviert und keine administrativen Aktionen sind möglich.

## Netzwerksicherheit

### Standard-SSH-Einstellungen

**Warum SSH standardmäßig aktiviert ist:** MiniOS ist als Rettungs- und Diagnosesystem für die Wartung defekter Hardware konzipiert. SSH ist mit großzügigen Einstellungen aktiviert, um Fernzugriff zu ermöglichen, wenn das lokale Display nicht verfügbar oder defekt ist oder beim Arbeiten mit Headless-Systemen.

**Aktuelle SSH-Einstellungen:**
- SSH-Dienst ist aktiviert und startet automatisch
- Root-Login per SSH ist erlaubt
- Passwort-Authentifizierung ist aktiviert

**Sicherheitsaspekte:** Diese Konfiguration birgt Risiken in unsicheren Netzwerken, ist aber für den Rettungseinsatz notwendig.

### SSH deaktivieren

Wenn kein Fernzugriff benötigt wird, deaktivieren Sie SSH komplett:

**Über Boot-Parameter:**
```
disable-services=ssh,avahi-daemon
```

**Über Konfigurationsdatei:**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Sicheren SSH-Zugang konfigurieren

Falls SSH benötigt wird, sichern Sie den Zugriff mit folgenden Methoden ab:

#### 1. Starke Passwörter setzen

Verwenden Sie die oben beschriebenen Methoden zur Passwortvergabe.

#### 2. SSH-Schlüssel-Authentifizierung

Legen Sie `authorized_keys`-Dateien im Root-Verzeichnis des USB-Sticks ab:

- `authorized_keys.root` – für den Root-Benutzer
- `authorized_keys.live` – für den Live-Benutzer
- `authorized_keys.username` – für andere Benutzer

Eine Systemkomponente kopiert diese beim Systemstart automatisch in die Home-Verzeichnisse.

#### 3. SSH-Härtung

Bearbeiten Sie nach dem Systemstart die SSH-Konfiguration:

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Passen Sie die Einstellungen auf sicherere Werte an:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Starten Sie den SSH-Dienst neu:
```bash
sudo systemctl restart ssh
```

**Wichtig:** Testen Sie den SSH-Zugang per Schlüssel immer, bevor Sie die Passwort-Authentifizierung deaktivieren.

## Boot-Sicherheit

### UEFI Secure Boot

MiniOS ist vollständig kompatibel mit Secure Boot, da der Standard-Debian-Kernel mit signierten Bootloadern verwendet wird. Secure Boot schützt vor Schadsoftware vor dem Systemstart (Bootkits) und wird für erhöhte Sicherheit empfohlen.

### BIOS/UEFI-Passwort

Für physischen Schutz richten Sie im BIOS/UEFI Ihres Computers ein Passwort ein, um zu verhindern, dass Unbefugte von anderen Geräten booten oder Boot-Einstellungen ändern.
