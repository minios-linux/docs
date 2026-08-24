# Software-Updates

MiniOS kombiniert schreibgeschützte SquashFS-Imagemodule mit einem beschreibbaren Laufzeit-Overlay. Die Update-Methode muss zur jeweiligen Ebene passen, die geändert wird. Das Aktualisieren von Paketen in einer laufenden Sitzung ist nicht dasselbe wie das Ersetzen der Module auf dem MiniOS-Medium.

## Pakete mit APT aktualisieren

APT schreibt in das Laufzeit-Overlay. Aktivieren und nutzen Sie eine persistente Sitzung, bevor Sie Updates durchführen, wenn die Änderungen einen Neustart überstehen sollen:

```bash
sudo apt update
sudo apt upgrade
```

Ohne Persistenz gehen Paketänderungen beim Herunterfahren verloren. Mit Persistenz bleiben aktualisierte Dateien und der APT-Status in dieser Sitzung erhalten, aber die zugrunde liegenden `.sb`-Imagemodule bleiben unverändert. Eine neue Sitzung verwendet weiterhin die Paketversionen aus dem Image.

APT eignet sich zur Pflege einer persistenten Installation. Prüfen Sie zuerst den verfügbaren Speicherplatz, da aktualisierte Dateien zusätzlich zu den komprimierten Basismodulen gespeichert werden. Behandeln Sie ein Debian-Release-Upgrade vor Ort nicht als MiniOS-Image-Upgrade; verwenden Sie stattdessen ein für das Ziel-Release erstelltes Image.

## Software mit Modulen aktualisieren

Ein `.sb`-Modul ist schreibgeschützte Software, die beim Booten geladen wird. Module sind dauerhaft, wenn sie im beschreibbaren MiniOS-`modules/`-Verzeichnis oder einer dauerhaften Persistenz-Quellen gespeichert werden. Sie erfordern keine Paketänderungen, die in der Sitzung gespeichert werden müssen.

Überprüfen Sie das Modul-Set für den nächsten Start vor und nach dem Hinzufügen eines Moduls:

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

`sb next-boot add` validiert und veröffentlicht ein neues Modul atomar, überschreibt jedoch kein vorhandenes Modul mit demselben Namen. Entfernen Sie ein ersetzbares Benutzermodul zuerst, wenn ein Update absichtlich denselben Basisnamen behält:

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

Basismodule und Module auf schreibgeschützten Medien können mit diesem Befehl nicht entfernt werden. Erstellen oder beziehen Sie aktualisierte Module für dieselbe Architektur, Distribution und niedrigeren Modul-Stack. Höher nummerierte Module überschreiben niedrigere Ebenen, sodass ein altes Zusatzmodul auch Dateien aus einem neueren Basis-Image überlagern kann.

Für lokal gepackte Software kann `apt2sb upgrade` ein Update-Modul erstellen. Details zum Modulbau und zu Abhängigkeiten finden Sie unter [Module erstellen](/development/Creating-Modules.md).

## Imagemodule ersetzen

Offizielle Image-Updates ersetzen Dateien auf dem MiniOS-Medium; `apt upgrade` aktualisiert diese nicht. Bevorzugen Sie das Ersetzen des gesamten Basismodul-Sets und der passenden Bootdateien einer MiniOS-Version oder installieren Sie das neue Image komplett neu. Mischen Sie keine Core-, Desktop-, Anwendungs-, Firmware- oder Bootdateien aus verschiedenen Releases, sofern deren Kompatibilität nicht dokumentiert ist.

Vor dem Ersetzen:

1. Sichern Sie die MiniOS-Konfiguration, Persistenzdaten, Benutzermodule und die aktuellen Basismodule.
2. Notieren Sie die aktiven und für den nächsten Start vorgesehenen Modullisten mit `sb list` und `sb next-boot`.
3. Führen Sie das Ersetzen von einem anderen System oder von einem im RAM geladenen Boot durch, damit die Quelldateien nicht verwendet werden.
4. Bewahren Sie die vorherigen Dateien auf, bis das neue Image startet und die benötigte Hardware und Anwendungen getestet wurden.

Behalten Sie Modul-Basisnamen und Reihenfolge bei, wenn ein Release den direkten Austausch vorschreibt. Eine spätere Quelle mit demselben Basisnamen ersetzt eine frühere Quelle in der Auswahl für den nächsten Start; unterschiedlich benannte Kopien können beide geladen werden und eine unerwünschte Ebenenreihenfolge verursachen.

## Kernel aktualisieren

Der Kernel besteht aus einem abgestimmten Set: Das `01-kernel.sb`-Treibermodul, das Kernel-Image, das Initramfs und die Bootloader-Konfiguration müssen übereinstimmen. Verwenden Sie den MiniOS Kernel Manager oder den `minios-kernel`-Befehl, anstatt nur ein `linux-image`-Paket mit APT zu aktualisieren.

Listen und paketieren Sie einen Repository-Kernel und aktivieren Sie ihn für den nächsten Start:

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

Die Aktivierung aktualisiert die MiniOS-Bootkonfiguration. Starten Sie neu, um den ausgewählten Kernel zu verwenden, und überprüfen Sie ihn anschließend mit `uname -r`. Behalten Sie mindestens einen bekannten, funktionierenden Kernel und dessen Bootdateien, bis Hardware, Speicher, Netzwerk und externe Treiber getestet wurden. Das Standard-MiniOS-Kernelmodul kann zusätzliche Treiber enthalten, die in einem Distributions-Repository-Kernel nicht vorhanden sind.

Weitere Informationen zum grafischen Ablauf, zu Befehlsoptionen und zur Wiederherstellung finden Sie unter [Kernelverwaltung](/administration/Kernel-Management.md).

## Kompatibilität und Wiederherstellung

Sichern Sie die Persistenz, bevor Sie das Basis-Image oder den Kernel ändern. Persistente Paketdateien und Metadaten können ein neues Basismodul überlagern oder Paketversionen beschreiben, die nicht mehr dazu passen. Testen Sie ein neues Image zuerst mit einer frischen Sitzung und dann mit einer Kopie der bestehenden Sitzung. Bewahren Sie das Original-Image, die Module und das Sitzungs-Backup auf, bis ein Rollback nicht mehr erforderlich ist.

Überprüfen Sie nach jedem Update die ausgewählten Module, starten Sie einmal und testen Sie die betroffenen Anwendungen und die Hardware. Falls ein neues Basis-Image mit alten Benutzermodulen oder Persistenz kollidiert, deaktivieren Sie diese Ebenen und fügen Sie sie einzeln wieder hinzu.
