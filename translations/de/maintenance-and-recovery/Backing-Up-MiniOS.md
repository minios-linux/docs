---
updated: 2026-08-31
---

# Backup von MiniOS

Ein Backup ist der zuverlässige Wiederherstellungsweg für MiniOS. Die Dokumentation verspricht kein generisches Reparaturverfahren für einen beschädigten Bootloader, ein Dateisystem oder einen Persistenz-Container. Bewahren Sie wiederherstellbare Kopien auf, bevor Sie ein Release, den Kernel, das Speicherschema oder eine wichtige Sitzung ändern.

## Was gesichert werden sollte

Sichern Sie die Teile, die nicht einfach aus einem MiniOS-Image wiederhergestellt werden können:

- Persönliche Dateien, einschließlich versteckter Anwendungsdaten, die für Sie wichtig sind;
- `config.conf`, geprüfte `config.conf.d`-Dateien und absichtliche Änderungen am Boot-Menü oder an Boot-Parametern;
- Vom Benutzer erstellte `.sb`-Module sowie eine Notiz, für welche MiniOS-Version sie gebaut wurden;
- Persistente Sitzungen, die System- oder Anwendungszustände enthalten, die Sie benötigen;
- Verschlüsselungsschlüssel, Wiederherstellungsdaten und andere Geheimnisse, die getrennt vom Backup aufbewahrt werden, das sie schützen.

Dateien, die außerhalb der Sitzungsebene gespeichert sind, zum Beispiel an einem separaten Speicherort für Benutzerdaten, müssen separat gesichert werden. Gehen Sie nicht davon aus, dass ein Sitzungsarchiv Daten enthält, die von einem anderen Dateisystem eingebunden wurden.

## Persistente Sitzungen exportieren

MiniOS-Sitzungsmanager kann eine **nicht laufende** `native`, `dynfilefs`, `raw` oder `luks`-Sitzung in ein verifiziertes `.tar.zst`-Archiv exportieren. Identifizieren Sie zunächst die Sitzung:

```bash
minios-session list
minios-session running
```

Starten Sie dann eine andere Sitzung oder wählen Sie **Ohne Speichern starten** und exportieren Sie die inaktive Sitzung:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Der Export ist eine logische Kopie des Sitzungsinhalts, keine 1:1-Kopie des Speichercontainers. Speichern Sie sie auf einem anderen Gerät.

Bei einer LUKS-Sitzung enthält das Archiv die entschlüsselten logischen Dateien. Schützen Sie das Archiv separat, falls die Daten weiterhin verschlüsselt bleiben müssen.

### SquashFS-Sitzungen

Der aktuelle Session Manager exportiert oder kopiert keine SquashFS-Sitzungen. Verwenden Sie **Jetzt speichern** vor dem Herunterfahren, damit der aktuelle Snapshot vollständig ist, und sichern Sie wichtige Dateien zusätzlich separat. Wenn Sie eine vollständige, wiederherstellbare Kopie des gesamten MiniOS-Geräts benötigen, erstellen Sie stattdessen ein Offline-Geräteabbild.

Verlassen Sie sich nicht darauf, ein eingebundenes Sitzungsverzeichnis manuell zu kopieren oder `session.conf`, DynFileFS-Segmente oder Container-Metadaten als Backup-Methode zu rekonstruieren.

## Konfiguration und Module sichern

Auf beschreibbaren MiniOS-Medien sollten Sie `minios/config.conf`, `minios/config.conf.d/` und benutzerdefinierte Module unter `minios/modules/` sichern.
Dokumentieren Sie außerdem benutzerdefinierte Boot-Parameter oder Änderungen am Boot-Menü, die nicht direkt aus diesen Dateien ersichtlich sind.

Ein Modul, das für eine MiniOS-Version gebaut wurde, ist nicht automatisch für eine andere geeignet.
Bewahren Sie den Quellcode oder das Rezept auf, das zum erneuten Erstellen wichtiger benutzerdefinierter Module benötigt wird.

## Abbild des gesamten Geräts erstellen

Ein Abbild des gesamten Geräts ist nützlich, wenn Sie die Partitionstabelle, Boot-Dateien, Module, Konfiguration, Sitzungen und andere Daten gemeinsam sichern möchten. Erstellen Sie es offline: Fahren Sie MiniOS herunter und erstellen Sie das Abbild des Geräts von einem anderen laufenden System aus.

Das [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) bietet die Funktionen **Abbild erstellen** und **Abbild schreiben**. Speichern Sie das Abbild auf einem anderen physischen Gerät. Das Wiederherstellen eines Geräteabbilds überschreibt das ausgewählte Ziel, daher sollten Sie Modell und Kapazität des Ziels vor dem Schreiben überprüfen.

Ein Geräteabbild ist eine Ergänzung zu, aber kein Ersatz für, eine separate Sicherung wichtiger persönlicher Dateien.

## Ein Sitzungsarchiv wiederherstellen

Das Importieren eines Session Manager-Archivs erstellt eine neue, nummerierte Sitzung; die bestehende wird nicht überschrieben:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Während des Imports werden Kompatibilitätsprüfungen durchgeführt. Überprüfen Sie die importierte Sitzung, bevor Sie sie aktivieren, und behalten Sie die bekannte, funktionierende Sitzung, bis die wiederhergestellte Kopie getestet wurde.

Beim Wechsel auf eine andere MiniOS-Version empfiehlt es sich, ausgewählte persönliche Daten und Konfigurationen zu migrieren. Gehen Sie nicht davon aus, dass eine alte vollständige Sitzung oder ein benutzerdefiniertes Modul mit der neuen Version kompatibel ist, nur weil sie kopiert werden können.

Siehe [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) für das Sitzungsmanagement und [Aktualisierung von MiniOS](/maintenance-and-recovery/Updating-MiniOS) für den Wechsel zwischen MiniOS-Versionen.
