---
updated: 2026-08-31
---

# Aktualisierung von MiniOS

Für MiniOS gibt es **kein** unterstütztes In-Place-Upgrade-Verfahren von einer MiniOS-Version auf eine andere. Das modulare Live-System wird aus schreibgeschützten SquashFS-Modulen und einer beschreibbaren Sitzungsschicht zusammengesetzt. Das Ändern von Debian-Paketen im laufenden System ersetzt daher nicht die MiniOS-Version selbst.

::: warning Eine neuere MiniOS-Version ist eine Neuinstallation
Es gibt kein MiniOS-Äquivalent zu `dist-upgrade`, das eine installierte oder persistente Kopie einer MiniOS-Version in eine andere Version umwandelt. Der Umstieg auf eine neuere MiniOS-Version bedeutet, diese Version zu installieren und anschließend die gewünschten Daten und Einstellungen zu migrieren.
:::

## APT ist erlaubt

MiniOS blockiert oder verbietet APT nicht. Sie können Debian-Pakete installieren und aktualisieren, wenn das sinnvoll ist:

```bash
sudo apt update
sudo apt upgrade
```

### Modulares Live-MiniOS

In einer Live-MiniOS-Sitzung schreibt APT Paketdateien und Paketmetadaten in die beschreibbare Schicht. Mit Persistenz können diese Änderungen einen Neustart überstehen. Die darunterliegenden schreibgeschützten `.sb`-Module werden dabei nicht verändert; aktualisierte Dateien in der Sitzung überschreiben lediglich die Dateien aus den Modulen.

Dies ist eine Paketpflege **innerhalb dieser Sitzung**, kein Update von MiniOS.
Zudem wird dabei Persistenzspeicher verbraucht und die Sitzung kann sich dadurch deutlich vom veröffentlichten Abbild unterscheiden. Eine neue Sitzung startet dennoch immer mit dem Paketbestand, der in den MiniOS-Modulen enthalten ist.

Ändern Sie nicht die APT-Quellen auf eine andere Debian-Version und führen Sie `upgrade`, `full-upgrade` oder `dist-upgrade` aus, in der Erwartung, eine neuere MiniOS-Version zu erhalten.
Das führt zu einem gemischten Systemzustand; es reproduziert nicht den Modulsatz, die Startdateien, die Firmware-Auswahl, MiniOS-Pakete oder andere Entscheidungen einer veröffentlichten MiniOS-Version.

### Nach der nativen Konvertierung

Eine native Installation, die mit dem MiniOS Installationsprogramm erstellt wurde, ist ein herkömmliches Debian-Desktop-System und kein modulares MiniOS Live-System. Sie behält die gewohnte MiniOS Desktop-Erfahrung bei, einschließlich der gewählten Desktop-Umgebung, des visuellen Erscheinungsbilds und der üblichen Anwendungen, während die MiniOS-spezifische Live-Software entfernt wird. Das resultierende System verfügt über ein beschreibbares Root-Dateisystem: APT aktualisiert Pakete wie gewohnt, der Kernel wird über Debian-Pakete verwaltet und der installierte Bootloader sowie das initramfs nutzen den klassischen Debian-Workflow.

Das MiniOS Release-Upgrade-Modell findet daher auf das konvertierte System keine Anwendung. Die MiniOS visuelle Identität und die Standard-Desktop-Software können erhalten bleiben, während die laufende Wartung dem normalen Debian-Modell folgt und nicht dem MiniOS Modul-/Sitzungs-Workflow.

## Wechsel zu einer neueren MiniOS-Version

Behandeln Sie eine neuere MiniOS-Version als separates System:

1. Laden Sie das neue Abbild herunter und [verifizieren](/installing-minios/Verifying-Downloads) Sie es.
2. Sichern Sie wichtige Dateien, Konfigurationen, Benutzermodule und persistente Sitzungen wie in [Sicherung von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) beschrieben.
3. Installieren Sie die neue Version mit der passenden [Installationsmethode](/installing-minios/Installation-Methods).
4. Starten Sie sie zunächst mit einer frischen Sitzung und prüfen Sie, ob die benötigte Hardware und Anwendungen funktionieren.
5. Migrieren Sie persönliche Dateien und ausgewählte Konfigurationen. Wo der Session Manager die alte Sitzung exportieren kann, importieren Sie dessen Archiv und lassen Sie die Kompatibilitätsprüfungen laufen, statt einen Live-Sitzungsspeicher manuell zu kopieren.
6. Erstellen oder installieren Sie benutzerdefinierte Module neu, sofern diese nicht nachweislich mit der Zielversion kompatibel sind.

Bewahren Sie die alte Installation oder ein Backup auf, bis die neue Version getestet wurde.
Kombinieren Sie keine Basismodule, Startdateien, Kernel- oder Initramfs-Dateien aus verschiedenen MiniOS-Versionen, um ein Upgrade zu erzwingen.

## Module und Kernel sind separate Wartungsaufgaben

Ein vom Benutzer erstelltes `.sb`-Modul kann bei Bedarf unabhängig ersetzt oder neu gebaut werden. Das verändert die Anpassungsschicht, aber nicht die MiniOS-Version. Siehe [Module verwalten](/preparing-and-customizing/Managing-Modules).

Der MiniOS-Kernel wird ebenfalls als abgestimmtes Kernel-Modul, `vmlinuz`, und initramfs-Set verwaltet. Nutzen Sie dafür [Kernel verwalten](/preparing-and-customizing/Managing-Kernels). Nur ein `linux-image`-Paket mit APT zu aktualisieren, ist nicht der MiniOS-Kernel-Management-Workflow, und das Ändern des Kernels aktualisiert nicht die MiniOS-Version.
