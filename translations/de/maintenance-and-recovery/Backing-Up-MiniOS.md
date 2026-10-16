---
updated: 2026-10-15
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

Mit dem MiniOS-Sitzungsmanager können Sie eine **nicht laufende** `native`, `dynfilefs`, `dynblk`, `vmdk` oder `raw` Sitzung, einschließlich unterstützter LUKS2-verschlüsselter Varianten, in ein verifiziertes `.tar.zst` Archiv exportieren. Identifizieren Sie zuerst die Sitzung:

```bash
sudo minios-session list
sudo minios-session running
```

Starten Sie dann eine andere Sitzung oder **Ohne Speichern starten** und exportieren Sie die inaktive Sitzung:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Der Export ist eine logische Kopie des Sitzungsinhalts, keine bitgenaue Kopie des Speichermediums. Speichern Sie diese auf einem anderen Gerät.

Bei einer Sitzung, deren Raw-, DynFileFS-, DynBlk- oder VMDK-Backend in LUKS2 eingebettet ist, enthält das Archiv die entschlüsselten logischen Dateien. Schützen Sie das Archiv separat, falls die Daten weiterhin verschlüsselt bleiben müssen.

### SquashFS-Sitzungen

Der aktuelle Sitzungsmanager exportiert oder kopiert keine SquashFS-Sitzungen. Nutzen Sie **Jetzt speichern** vor dem Herunterfahren, damit der aktuelle Snapshot vollständig ist, und sichern Sie anschließend die wichtigen Dateien separat. Wenn Sie eine vollständige, wiederherstellbare Kopie des gesamten MiniOS-Geräts benötigen, erstellen Sie stattdessen ein Offline-Geräteabbild.

Verlassen Sie sich nicht auf das manuelle Kopieren eines eingebundenen Sitzungsverzeichnisses oder auf die Rekonstruktion von `session.conf`, DynFileFS-Segmenten, DynBlk-Backupdateien oder anderer Container-Metadaten als Backup-Methode. Ein manuelles 1:1-Backup von DynBlk ist nur sicher, solange das Volume getrennt ist, und muss alle vorhandenen `volume*.db` Teile, einschließlich Zahlen mit vier oder mehr Stellen, exakt wie vorhanden erhalten; eine logische `minios-session export` Sicherung ist vorzuziehen.

## RAM-Sitzungen und Ventoy-Persistenzabbilder

Bevor Sie den Speicher sichern, der von einer `perchtoram`-Sitzung verwendet wird, speichern Sie den RAM-Status explizit zurück in das ursprüngliche Medium oder als neue Sitzung. Eine Offline-Kopie des ursprünglichen Mediums enthält sonst nur den zuletzt gespeicherten Stand. Zum Speichern wird das originale, beschreibbare Medium und dessen aufgezeichnete Identität benötigt; siehe [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence).

Ein ausgewähltes Ventoy Persistence Plugin-Backend ist eine ext4-Umgebung, keine nummerierte MiniOS-Sitzung, und kann nicht über den Session Manager exportiert werden. Fahren Sie es sauber herunter, bevor Sie das vollständige Backend-Abbild von einem anderen System kopieren; bewahren Sie auch die Ventoy-Konfiguration auf. Legen Sie separate Backups wichtiger persönlicher Dateien an.

## Konfiguration und Module sichern

Auf beschreibbaren MiniOS-Medien sichern Sie `minios/config.conf`, `minios/config.conf.d/` sowie benutzerdefinierte Module, die unter `minios/modules/` gespeichert sind.
Notieren Sie außerdem benutzerdefinierte Boot-Parameter oder Änderungen am Boot-Menü, die aus diesen Dateien nicht ersichtlich sind.

Ein Modul, das für eine MiniOS-Version erstellt wurde, ist nicht automatisch mit einer anderen Version kompatibel.
Bewahren Sie den Quellcode oder das Rezept auf, das zum erneuten Erstellen wichtiger benutzerdefinierter Module benötigt wird.

## Ein vollständiges Geräte-Image erstellen

Ein vollständiges Geräte-Image ist sinnvoll, wenn Sie die Partitionstabelle, Boot-Dateien, Module, Konfiguration, Sitzungen und weitere Daten gemeinsam sichern möchten. Erstellen Sie das Image offline: Fahren Sie MiniOS herunter und erstellen Sie das Image des Geräts von einem anderen laufenden System aus.

[Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) bietet die **Image erstellen**- und **Image schreiben**-Funktionen. Speichern Sie das Image auf einem anderen physischen Gerät. Das Wiederherstellen eines vollständigen Geräte-Images überschreibt das gewählte Ziel, daher prüfen Sie Modell und Kapazität des Zielgeräts vor dem Schreiben sorgfältig.

Ein Geräte-Image ist eine Ergänzung, aber kein Ersatz für ein separates Backup wichtiger persönlicher Dateien.

## Sitzungsarchiv wiederherstellen

Das Importieren eines Session Manager-Archivs erstellt eine neue, nummerierte Sitzung und überschreibt die bestehende Sitzung nicht:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Während des Imports werden Kompatibilitätsprüfungen durchgeführt. Überprüfen Sie die importierte Sitzung, bevor Sie sie aktivieren, und behalten Sie die bekannte, funktionierende Sitzung, bis die wiederhergestellte Kopie getestet wurde.

Beim Wechsel zu einer anderen MiniOS-Version sollten Sie bevorzugt ausgewählte persönliche Daten und Konfigurationen migrieren. Gehen Sie nicht davon aus, dass eine alte vollständige Sitzung oder ein benutzerdefiniertes Modul mit der neuen Version kompatibel ist, nur weil sie kopiert werden können.

Siehe [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) für das Sitzungsmanagement und [Aktualisierung von MiniOS](/maintenance-and-recovery/Updating-MiniOS) für den Wechsel zwischen MiniOS-Versionen.
