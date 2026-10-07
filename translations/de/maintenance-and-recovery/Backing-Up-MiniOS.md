---
updated: 2026-10-06
---

# MiniOS sichern

Ein Backup ist der zuverlässige Wiederherstellungsweg für MiniOS. Die Dokumentation garantiert kein allgemeines Reparaturverfahren für einen beschädigten Bootloader, ein Dateisystem oder einen Persistenz-Container. Erstellen Sie wiederherstellbare Kopien, bevor Sie ein Release, den Kernel, das Speicherschema oder eine wichtige Sitzung ändern.

## Was gesichert werden sollte

Bewahren Sie die Teile auf, die nicht einfach aus einem MiniOS-Image wiederhergestellt werden können:

- persönliche Dateien, einschließlich versteckter Anwendungsdaten, die für Sie wichtig sind;
- `config.conf`, geprüft `config.conf.d` Dateien sowie gezielte Änderungen am Boot-Menü oder an Boot-Parametern;
- selbst erstellte `.sb` Module und eine Notiz, für welche MiniOS-Version sie gebaut wurden;
- persistente Sitzungen, die System- oder Anwendungszustände enthalten, die Sie benötigen;
- Verschlüsselungsschlüssel, Wiederherstellungsdaten und andere Geheimnisse, die getrennt vom Backup aufbewahrt werden, das sie schützen.

Dateien, die außerhalb der Sitzungsebene gespeichert sind, zum Beispiel an einem separaten Benutzerdaten-Ort, müssen separat gesichert werden. Gehen Sie nicht davon aus, dass ein Sitzungsarchiv Daten enthält, die von einem anderen Dateisystem eingebunden wurden.

## Persistente Sitzungen exportieren

Der MiniOS-Sitzungsmanager kann eine **nicht laufende** `native`, `dynfilefs`, `dynblk`, `vmdk` oder `raw` Sitzung, einschließlich unterstützter LUKS2-verschlüsselter Varianten, in ein geprüftes `.tar.zst` Archiv exportieren. Identifizieren Sie zunächst die Sitzung:

```bash
minios-session list
minios-session running
```

Starten Sie dann eine andere Sitzung oder **Ohne Speichern starten** und exportieren Sie die inaktive Sitzung:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Der Export ist eine logische Kopie des Sitzungsinhalts, keine 1:1-Kopie des Speichercontainers. Speichern Sie diese auf einem anderen Gerät.

Bei einer Sitzung, deren Raw-, DynFileFS-, DynBlk- oder VMDK-Backend mit LUKS2 verschlüsselt ist, enthält das Archiv die entschlüsselten logischen Dateien. Schützen Sie das Archiv separat, wenn die Daten weiterhin verschlüsselt bleiben müssen.

### SquashFS-Sitzungen

Der aktuelle Sitzungsmanager exportiert oder kopiert keine SquashFS-Sitzungen. Nutzen Sie **Jetzt speichern** vor dem Herunterfahren, damit der aktuelle Snapshot vollständig ist, und sichern Sie anschließend die wichtigen Dateien separat. Wenn Sie eine vollständige, wiederherstellbare Kopie des gesamten MiniOS-Geräts benötigen, erstellen Sie stattdessen ein Offline-Geräteabbild.

Verlassen Sie sich nicht auf das manuelle Kopieren eines eingebundenen Sitzungsverzeichnisses oder auf die Rekonstruktion von `session.conf`, DynFileFS-Segmenten, DynBlk-Backupdateien oder anderer Container-Metadaten als Backup-Methode. Ein manuelles 1:1-Backup von DynBlk ist nur sicher, solange das Volume getrennt ist, und muss alle vorhandenen `volume*.db` Teile, einschließlich Zahlen mit vier oder mehr Stellen, exakt wie vorhanden erhalten; eine logische `minios-session export` Sicherung ist vorzuziehen.

## Konfiguration und Module sichern

Auf beschreibbaren MiniOS-Medien sichern Sie `minios/config.conf`, `minios/config.conf.d/`, sowie selbst erstellte Module, die unter `minios/modules/` gespeichert sind.
Notieren Sie außerdem benutzerdefinierte Boot-Parameter oder Änderungen am Boot-Menü, die nicht offensichtlich aus diesen Dateien hervorgehen.

Ein Modul, das für eine MiniOS-Version gebaut wurde, ist nicht automatisch für eine andere geeignet.
Bewahren Sie den Quellcode oder das Rezept auf, das zum erneuten Erstellen wichtiger benutzerdefinierter Module benötigt wird.

## Ein komplettes Geräteabbild erstellen

Ein komplettes Geräteabbild ist sinnvoll, wenn Sie die Partitionstabelle, Bootdateien, Module, Konfiguration, Sitzungen und andere Daten gemeinsam sichern möchten. Erstellen Sie das Abbild offline: Fahren Sie MiniOS herunter und erstellen Sie das Abbild von einem anderen laufenden System aus.

[Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) bietet die Funktionen **Abbild erstellen** und **Abbild schreiben** an. Speichern Sie das Abbild auf einem anderen physischen Gerät. Das Wiederherstellen eines kompletten Geräteabbilds überschreibt das gewählte Ziel, daher prüfen Sie Modell und Kapazität des Ziels vor dem Schreiben.

Ein Geräteabbild ist eine Ergänzung zu, aber kein Ersatz für, ein separates Backup wichtiger persönlicher Dateien.

## Ein Sitzungsarchiv wiederherstellen

Das Importieren eines Sitzungsmanager-Archivs erstellt eine neue, nummerierte Sitzung; die bestehende wird nicht überschrieben:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Beim Import werden Kompatibilitätsprüfungen durchgeführt. Überprüfen Sie die importierte Sitzung vor der Aktivierung und behalten Sie die bekannte, funktionierende Sitzung, bis die wiederhergestellte Kopie getestet wurde.

Beim Wechsel auf eine andere MiniOS-Version sollten bevorzugt ausgewählte persönliche Daten und Konfigurationen migriert werden. Gehen Sie nicht davon aus, dass eine alte komplette Sitzung oder ein benutzerdefiniertes Modul mit der neuen Version kompatibel ist, nur weil es dorthin kopiert werden kann.

Siehe [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) für Sitzungsverwaltung und [MiniOS aktualisieren](/maintenance-and-recovery/Updating-MiniOS) für den Wechsel zwischen MiniOS-Versionen.
