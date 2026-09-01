---
updated: 2026-08-31
---

# Startmodi

Der Startmodus legt fest, ob MiniOS sauber startet, eine gespeicherte Sitzung öffnet oder als herkömmlich installiertes System läuft. Sie müssen den internen Boot-Prozess nicht verstehen, um diese Auswahl zu treffen.

Die Menübezeichnungen können je nach Version, Firmware-Modus und Boot-Tool leicht variieren. Wählen Sie anhand des gewünschten Ergebnisses, nicht nach dem genauen Wortlaut.

## Schnellauswahl

Der normale Standard-Eintrag ist **Start MiniOS**. Hierbei wird die automatische Persistenz-Auswahl verwendet: MiniOS versucht, eine kompatible Standardsitzung fortzusetzen und kann einen kompatiblen Ersatz anlegen, wenn keine nutzbare Sitzung existiert und geeigneter beschreibbarer Speicher verfügbar ist.

| Menüeintrag | Verwenden, wenn | Werden Änderungen gespeichert? | USB verbunden lassen? |
|---|---|---|---|
| **Start MiniOS** (Standard) | Für den normalen portablen Einsatz | Ja, wenn die automatische Persistenz-Aktivierung erfolgreich ist | Ja |
| **Neue Sitzung starten** | Sie möchten einen separaten neuen Arbeitsbereich | Nur wenn die neue Sitzung erfolgreich erstellt und aktiviert wird | Ja |
| **Gespeicherte Sitzung wählen** | Sie möchten eine von mehreren vorhandenen Arbeitsumgebungen auswählen | Nur wenn die gewählte Sitzung erfolgreich aktiviert wird | Ja |
| **Ohne Speichern starten** | Sie benötigen einen sauberen temporären Start ohne Persistenz | Nein | Ja |
| **Von RAM ausführen** | Sie möchten MiniOS für diesen Start in RAM kopieren | Nein; die RAM-Kopie gilt als temporär | Bis MiniOS die Quelle erfolgreich getrennt hat |

Für einen normalen ersten Start lassen Sie **Start MiniOS** ausgewählt. Verwenden Sie **Ohne Speichern starten**, wenn Sie gezielt einen sauberen temporären Hardware-Test oder eine Wiederherstellungssitzung benötigen, die keine Persistenz öffnen oder anlegen darf.

::: warning Überprüfen Sie, ob die Persistenz aktiv ist
Das Auswählen eines persistenten Menüeintrags fordert eine Sitzung an; es garantiert nicht, dass die Sitzung geöffnet werden kann. Ist der Speicher schreibgeschützt, voll, beschädigt oder inkompatibel, kann MiniOS ohne das Speichern von Änderungen fortfahren. Prüfen Sie die Startwarnung, bevor Sie mit Arbeiten beginnen, die erhalten bleiben müssen.
:::

## Start MiniOS

**Start MiniOS** ist der erste und Standard-Menüeintrag. Er ist für den normalen Gebrauch gedacht, einschließlich des ersten Starts eines neu vorbereiteten MiniOS-Geräts.

MiniOS sucht automatisch nach einer kompatiblen persistenten Sitzung. Existiert eine nutzbare Standardsitzung, wird diese fortgesetzt. Falls nicht, kann MiniOS automatisch eine kompatible Sitzung erstellen, wenn geeigneter beschreibbarer Speicher vorhanden ist.

Kann keine Persistenz erstellt oder aktiviert werden, weil der Speicher schreibgeschützt, voll, beschädigt oder anderweitig ungeeignet ist, läuft MiniOS mit einer temporären beschreibbaren Schicht weiter und meldet, dass die Sitzung nicht persistent ist. Prüfen Sie diese Warnung, bevor Sie Arbeiten beginnen, die einen Neustart überstehen müssen.

## Neue Sitzung starten

MiniOS erstellt eine zusätzliche nummerierte persistente Sitzung und lässt bestehende Sitzungen unverändert. Nutzen Sie dies, um getrennte Arbeitsbereiche zu führen oder eine neue Konfiguration zu testen, ohne Ihre aktuelle Arbeitssitzung zu ersetzen.

Für die Erstellung ist kompatibler, beschreibbarer Speicher und ausreichend freier Platz erforderlich. Eine neue Sitzung ist kein Backup einer bestehenden.

## Gespeicherte Sitzung wählen

MiniOS zeigt verfügbare gespeicherte Sitzungen an und ermöglicht die Auswahl einer davon. Verwenden Sie dies, wenn ein Gerät mehrere Arbeitsbereiche enthält. Um die erste Sitzung auf leerem Speicher zu erstellen, wählen Sie stattdessen **Neue Sitzung starten**.

Eine Sitzung kann inkompatibel sein, wenn sie von einer anderen MiniOS-Version oder Edition stammt. Auch eine andere `union=`-Einstellung kann eine Sitzung inkompatibel machen.
Die interaktive Auswahl macht eine inkompatible Sitzung nicht sicher.

## Ohne Speichern starten

In diesem Modus wird die Persistenz für den aktuellen Start bewusst deaktiviert. MiniOS verwendet einen temporären beschreibbaren Bereich im RAM, sodass im Live-System erstellte Dateien, installierte Pakete und geänderte Einstellungen beim Herunterfahren verloren gehen.

Verwenden Sie diesen Modus gezielt, wenn Sie:

- Hardware testen möchten, ohne eine persistente Sitzung zu öffnen oder anzulegen;
- ein Problem diagnostizieren möchten, ohne den gespeicherten Zustand zu verändern;
- temporär arbeiten, wenn nichts dauerhaft gespeichert werden muss.

Ohne Speichern zu starten bedeutet nicht, dass das Boot-Medium entfernt werden kann. Das laufende System liest seine Systemmodule in der Regel weiterhin von diesem Medium.

## Von RAM ausführen

In diesem Modus werden MiniOS-Daten in den RAM kopiert, um Lesezugriffe auf die Quelle zu reduzieren. Es wird ausreichend Speicher für das kopierte System und die laufende Arbeitslast benötigt.

Behandeln Sie eine RAM-geladene Sitzung als temporär. Die Kombination von `toram` mit Persistenz kopiert die ausgewählten Sitzungsdaten in den RAM; spätere Änderungen werden nicht zurück in den ursprünglichen Persistenzspeicher geschrieben.

Entfernen Sie das Boot-Gerät nicht nur, weil **Von RAM ausführen** gewählt wurde. Es ist erst dann sicher, wenn MiniOS das Quell-Dateisystem, den ISO-Loop und alle Ventoy-Zuordnungen erfolgreich getrennt hat. Schlägt dieser Vorgang fehl, bleibt die Quelle weiterhin in Benutzung.

## Native Installation

::: warning Native installation changes the system model
Eine native Installation bewahrt das gewohnte MiniOS-Desktop-Erlebnis – dessen visuelle Identität, die gewählte Desktop-Umgebung und die üblichen Anwendungen – wandelt aber das Live-Image in ein konventionelles Debian-Desktop-System um. MiniOS-spezifische Werkzeuge für Sitzungen, Module, modulare Kernel und andere Live-Workflows werden entfernt, da diese Funktionen nicht mehr relevant sind.
:::

Nach der nativen Umwandlung nutzen Sie die normalen Debian-Werkzeuge für Pakete, Kernel, Konfiguration und Bootloader. Das Ergebnis bleibt optisch vertraut und behält die gewohnten Desktop-Anwendungen der gewählten Edition, aber die MiniOS-spezifischen Live-Funktionen sind nicht mehr vorhanden. Die MiniOS-Live-Architektur wird in [Über MiniOS](/getting-started/About-MiniOS) beschrieben.

Verwenden Sie das [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) nur, wenn Sie diese Umwandlung ausdrücklich wünschen und das gewählte Image die native Bereitstellung unterstützt.

## Wenn Sie mehr Details benötigen

- [Boot-Menüs](/preparing-and-customizing/Customizing-the-Boot-Menu) erklärt die Navigation und das temporäre Bearbeiten eines Menüeintrags.
- [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) erläutert Speicher-Modi, das Erstellen, Vergrößern und Entfernen von Sitzungen.
- [Boot-Parameter](/reference/Boot-Parameters) ist die vollständige Referenz für Kommandozeilenparameter.
- [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), [Modul-Laden](/reference/boot-process/Module-Loading) und [Persistenz](/reference/boot-process/Persistence-Internals) erklären, wie die zugehörigen Parametergruppen beim Start verarbeitet werden.
