---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Laufwerksprogramm

Laufwerksprogramm ist ein allgemeines GTK-Festplattenwerkzeug, das mit MiniOS ausgeliefert wird. Es kann ein vorhandenes Abbild auf ein Laufwerk schreiben, ein Abbild von einem physischen Gerät erstellen, ein gesamtes Gerät formatieren oder löschen. Es ist nicht auf MiniOS-Medien beschränkt und ersetzt nicht das MiniOS-Installationsprogramm.

Sie finden es im Anwendungsmenü unter **System**, oder führen Sie aus:

```bash
driveutility
```

## Sicherheit

Das Schreiben eines Abbilds, das Formatieren und das Löschen sind zerstörerische Vorgänge. Überprüfen Sie vor der Bestätigung das Ziel anhand von Gerät, Modell und Kapazität. Sichern Sie alle wichtigen Daten und trennen Sie nach Möglichkeit nicht benötigte Wechseldatenträger.

Eingehängte Laufwerke werden standardmäßig ausgeblendet. Sie können sie explizit anzeigen lassen, aber das Laufwerksprogramm warnt vor zerstörerischen Aktionen und versucht, das ausgewählte Gerät und dessen Partitionen vor Änderungen auszuhängen. Ist der Einhängezustand unklar oder bleibt ein Dateisystem eingehängt, wird der Vorgang abgebrochen, um Änderungen an einem aktiven Dateisystem zu verhindern.

## Abbild schreiben

**Schreiben** kopiert ein Abbild Byte für Byte auf das ausgewählte Gerät. Komprimierte Abbilder werden vom Backend erkannt, sofern unterstützt.

Typische Anwendungsfälle sind das Schreiben eines MiniOS-ISOs auf USB- oder SD-Medien sowie das Wiederherstellen eines zuvor erstellten Komplettabbilds eines Geräts.
Bei einem MiniOS-ISO handelt es sich um einen Rohdaten-Schreibvorgang. Die ISO-Partition und das Boot-Layout werden exakt wie im Abbild gespeichert übertragen. Es **erstellt** keine zusätzliche beschreibbare Datenpartition, keine Persistenz-Sitzung und führt keine verwaltete Bereitstellung des MiniOS-Installationsprogramms durch.

Ob Persistenz nach einem Rohdaten-Schreibvorgang möglich ist, hängt weiterhin vom Boot-Modus und dem als beschreibbar erkannten Speicherbereich des Abbilds ab. Für ein verwaltetes Ziel-Layout oder eine vorbereitete Sitzung verwenden Sie [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer).

CLI-Beispiel:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Geräteabbild erstellen

**Abbild erstellen** liest ein physisches Gerät in eine Abbilddatei ein. Die Ausgabe kann roh bleiben oder während des Schreibvorgangs komprimiert werden.

Unterstützte Komprimierungsoptionen sind:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) sofern die erforderliche Python-zstd-Unterstützung installiert ist

Die grafische Anwendung kann die resultierende Datei auch dem Desktop-Benutzer zuweisen, sodass ein mit Root-Rechten erstelltes Backup sofort ohne Anpassung der Besitzrechte nutzbar ist.
CLI-Beispiel:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

Die komprimierungsspezifische Dateiendung wird vom Kommandozeilen-Tool automatisch hinzugefügt.

## Gerät formatieren

**Formatieren** erstellt ein neues Ein-Dateisystem-Layout auf dem ausgewählten Gerät. Aktuell verfügbare Dateisysteme sind:

- FAT32
- exFAT
- NTFS
- ext4

Sie können ein Volumenlabel vergeben. Bei ext4 kann das Laufwerksprogramm das Wurzelverzeichnis dem gewählten Benutzer und der gewählten Gruppe zuweisen.

Das Formatieren ist unabhängig vom Schreiben eines MiniOS-ISOs. Die hier aufgeführten Dateisystemoptionen beziehen sich auf den Formatierungsvorgang des Laufwerksprogramms und ändern nicht das im Rohdaten-ISO enthaltene Dateisystem-Layout.

CLI-Beispiel:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Gerät löschen

**Löschen** wählt je nach Gerät und gewünschter Methode zwischen Controller-eigenen Löschbefehlen, Discard/TRIM und hostseitigen Überschreibungen.

Aktuelle Backends sind:

- **Sicheres Löschen** — wählt automatisch eine vom Controller unterstützte Methode, sofern verfügbar.
- **ATA Secure Erase / Enhanced Secure Erase** — wird über UDisks2 für unterstützte SATA/ATA-Laufwerke ausgeführt; eingefrorene oder nicht unterstützte Geräte werden abgelehnt.
- **NVMe User Data Erase / Cryptographic Erase** — verwendet NVMe Format NVM nur, wenn der Controller die gewünschte Fähigkeit meldet.
- **Discard / Secure Discard** — nutzt `blkdiscard` wenn das Blockgerät Discard unterstützt.
- **Null-Überschreiben** — schreibt Nullen vom Host.
- **Zufalls-Überschreiben** — schreibt für die gewünschte Anzahl an Durchgängen Zufallsdaten und kann einen abschließenden Null-Durchgang hinzufügen.

Controller-seitiges sicheres Löschen entspricht nicht dem wiederholten Überschreiben jedes logischen Blocks durch den Host. Die Verfügbarkeit hängt von der Firmware des Geräts, Kernel-Schnittstellen, UDisks2, `nvme-cli`, und `blkdiscard` ab.
Bei NVMe-Geräten erhält das Laufwerksprogramm beim Ausführen von Format NVM das aktive Namespace-LBA-Format, die Metadaten- und die Schutzinformationseinstellung. Außerdem werden Controller-Operationen abgelehnt, deren Wirkung auf mehrere Namespaces ausgedehnt werden könnte, wenn nicht eindeutig ein sicheres Einzel-Namespace-Ziel vorliegt.

Beispiele:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Verwenden Sie die Einstellungen für Überschreib-Durchgänge und Teilgrößen nur bei den klassischen Null-/Zufallsmethoden. Controller-Löschungen und Discard arbeiten gemäß Gerätebefehl und nicht nach einer hostseitigen Byte-Anzahl.

## Kommandozeilen-Tools

Das Laufwerksprogramm installiert vier Befehle für niedrigere Ebenen:

| Befehl | Zweck |
|---|---|
| `driveutility-write` | Schreibt ein Roh- oder unterstütztes komprimiertes Abbild auf ein Blockgerät. |
| `driveutility-read` | Erstellt ein Roh- oder komprimiertes Abbild von einem Blockgerät. |
| `driveutility-format` | Erstellt FAT32-, exFAT-, NTFS- oder ext4-Speicher auf einem Gerät. |
| `driveutility-wipe` | Löscht mit Controller-, Discard- oder Überschreibmethoden. |

Alle zerstörerischen Befehle sollten nur nach Überprüfung des exakten Zielgeräts ausgeführt werden. Nutzen Sie die installierten Manpages und `--help`-Ausgabe für versionsspezifische Optionen.

## Laufwerksprogramm versus MiniOS-Installationsprogramm

Verwenden Sie **Laufwerksprogramm** für allgemeine Laufwerksaktionen wie Rohdaten-Schreiben, Geräteabbildung, Formatieren oder Löschen.

Verwenden Sie **MiniOS-Installationsprogramm** wenn Sie eine MiniOS-spezifische Installation mit gezielter Platzierung, Auswahl von Dateisystem und Boot-Layout, Modulauswahl, Konfiguration oder optionaler Live-Sitzung wünschen.

Weitere Möglichkeiten, MiniOS auf Medien zu bringen, finden Sie unter [Installationsmethoden](/installing-minios/Installation-Methods). Für gespeicherte Änderungen nach dem Booten siehe [Boot-Modi](/using-minios/Boot-Modes) und [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence).
