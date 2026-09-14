---
updated: 2026-09-13
---

# MiniOS sichern

Ein Backup ist der zuverlässige Wiederherstellungsweg für MiniOS. Die Dokumentation garantiert kein generisches Reparaturverfahren für einen beschädigten Bootloader, ein Dateisystem oder einen Persistenz-Container. Erstellen Sie vor Änderungen an Release, Kernel, Speicherlayout oder wichtigen Sitzungen wiederherstellbare Kopien.

## Was sollte gesichert werden

Sichern Sie die Teile, die nicht einfach aus einem MiniOS-Abbild wiederhergestellt werden können:

- persönliche Dateien, einschließlich versteckter Anwendungsdaten, die für Sie wichtig sind;
- `config.conf`, geprüft `config.conf.d` Dateien sowie gezielte Änderungen am Boot-Menü oder an Boot-Parametern;
- selbst erstellte `.sb` Module und eine Notiz, für welche MiniOS-Version sie gebaut wurden;
- persistente Sitzungen, die System- oder Anwendungszustände enthalten, die Sie benötigen;
- Verschlüsselungsschlüssel, Wiederherstellungsdaten und andere Geheimnisse, die getrennt vom Backup aufbewahrt werden, das sie schützen.

Dateien, die außerhalb der Sitzungsebene gespeichert sind, zum Beispiel an einem separaten Benutzer-Datenspeicherort, müssen separat gesichert werden. Gehen Sie nicht davon aus, dass ein Sitzungsarchiv Daten enthält, die von einem anderen Dateisystem eingebunden wurden.

## Persistente Sitzungen exportieren

Der MiniOS-Sitzungsmanager kann eine **nicht laufende** `native`, `dynfilefs`, `dynblk`, `raw`, oder `luks` Sitzung in ein verifiziertes `.tar.zst` Archiv exportieren. Identifizieren Sie zuerst die Sitzung:

```bash
minios-session list
minios-session running
```

Starten Sie dann eine andere Sitzung oder **Ohne Speichern starten** und exportieren Sie die inaktive Sitzung:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Der Export ist eine logische Kopie des Sitzungsinhalts, keine Byte-für-Byte-Kopie des Speichercontainers. Speichern Sie sie auf einem anderen Gerät.

Bei einer LUKS-Sitzung enthält das Archiv die entschlüsselten logischen Dateien. Schützen Sie das Archiv separat, wenn die Daten verschlüsselt bleiben müssen.

### SquashFS-Sitzungen

Der aktuelle Sitzungsmanager exportiert oder kopiert keine SquashFS-Sitzungen. Verwenden Sie **Jetzt speichern** vor dem Herunterfahren, damit der aktuelle Schnappschuss vollständig ist, und sichern Sie wichtige Dateien anschließend separat. Wenn Sie eine vollständige, wiederherstellbare Kopie des gesamten MiniOS-Geräts benötigen, erstellen Sie stattdessen ein Offline-Geräteabbild.

Verlassen Sie sich nicht darauf, ein eingebundenes Sitzungsverzeichnis manuell zu kopieren oder `session.conf`DynFileFS-Segmente, dynblk-Backing-Dateien oder andere Container-Metadaten als Backup-Methode zu rekonstruieren. Ein manuelles Byte-für-Byte-dynblk-Backup ist nur dann sicher, wenn das Volume abgehängt ist, und muss dessen gesamte `volume000.db` bis zum `volume063.db` Namensraum exakt erhalten; ein logischer `minios-session export` Export ist vorzuziehen.

## Konfiguration und Module sichern

Auf beschreibbaren MiniOS-Medien sichern Sie `minios/config.conf`, `minios/config.conf.d/`, sowie benutzerdefinierte Module, die unter `minios/modules/` gespeichert sind.
Notieren Sie außerdem benutzerdefinierte Boot-Parameter oder Boot-Menü-Änderungen, die aus diesen Dateien nicht ersichtlich sind.

Ein für eine MiniOS-Version gebautes Modul ist nicht automatisch für eine andere Version geeignet.
Bewahren Sie den Quellcode oder das Rezept auf, um wichtige eigene Module bei Bedarf neu zu bauen.

## Ein vollständiges Geräteabbild erstellen

Ein vollständiges Geräteabbild ist sinnvoll, wenn Sie Partitionstabelle, Bootdateien, Module, Konfiguration, Sitzungen und andere Daten gemeinsam sichern möchten. Erstellen Sie das Abbild offline: Fahren Sie MiniOS herunter und erstellen Sie das Abbild von einem anderen laufenden System aus.

[Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) bietet die Funktionen **Abbild erstellen** und **Abbild schreiben** an. Speichern Sie das Abbild auf einem anderen physischen Gerät. Das Wiederherstellen eines Geräteabbilds überschreibt das gewählte Ziel, daher prüfen Sie Modell und Kapazität des Ziels vor dem Schreiben.

Ein Geräteabbild ist eine Ergänzung, aber kein Ersatz für ein separates Backup wichtiger persönlicher Dateien.

## Sitzungsarchiv wiederherstellen

Das Importieren eines Sitzungsmanager-Archivs erstellt eine neue nummerierte Sitzung; die bestehende wird dabei nicht überschrieben:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Beim Import werden Kompatibilitätsprüfungen durchgeführt. Überprüfen Sie die importierte Sitzung, bevor Sie sie aktivieren, und behalten Sie die bekannte funktionierende Sitzung, bis die wiederhergestellte Kopie getestet wurde.

Beim Wechsel auf eine andere MiniOS-Version sollten Sie bevorzugt ausgewählte persönliche Daten und Konfigurationen migrieren. Gehen Sie nicht davon aus, dass eine alte vollständige Sitzung oder ein eigenes Modul mit der neuen Version kompatibel ist, nur weil es kopiert werden kann.

Siehe [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) für Sitzungsverwaltung und [MiniOS aktualisieren](/maintenance-and-recovery/Updating-MiniOS) für den Wechsel zwischen MiniOS-Versionen.
