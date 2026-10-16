---
updated: 2026-10-15
---

# Boot-Modi

Der Boot-Modus legt fest, ob MiniOS sauber startet, eine gespeicherte Sitzung öffnet oder als herkömmlich installiertes System läuft. Sie müssen den internen Boot-Prozess nicht verstehen, um diese Auswahl zu treffen.

Menübezeichnungen können je nach Version, Firmware-Modus und Boot-Tool leicht variieren. Wählen Sie anhand des gewünschten Ergebnisses und nicht nach dem genauen Wortlaut.

## Schnellauswahl

Der normale Standard-Eintrag ist **MiniOS starten**. Dabei wird die automatische Persistenz-Auswahl verwendet: MiniOS versucht, eine kompatible Standardsitzung fortzusetzen und kann bei Bedarf eine passende neue Sitzung anlegen, wenn keine nutzbare Sitzung vorhanden ist und geeigneter beschreibbarer Speicher verfügbar ist.

| Menüeintrag | Verwenden Sie diesen, wenn | Werden Änderungen gespeichert? | USB verbunden lassen? |
|---|---|---|---|
| **MiniOS starten** (Standard) | Normale portable Nutzung | Ja, wenn die automatische Aktivierung der Persistenz erfolgreich ist | Ja |
| **Neue Sitzung beginnen** | Sie einen eigenen neuen Arbeitsbereich wünschen | Nur wenn die neue Sitzung erfolgreich erstellt und aktiviert wird | Ja |
| **Gespeicherte Sitzung auswählen** | Sie einen von mehreren vorhandenen Arbeitsbereichen auswählen möchten | Nur wenn die gewählte Sitzung erfolgreich aktiviert wird | Ja |
| **Ohne Speichern starten** | Sie einen sauberen temporären Start ohne Persistenz wünschen | Nein | Ja |
| **Aus dem RAM ausführen** | Sie Systemdaten von MiniOS in RAM für diesen Start kopieren möchten | RAM-gestützte Änderungen sind temporär, sofern eine unterstützte Persistenzsitzung nicht explizit zurückgespeichert oder als neue Sitzung gespeichert wird | Bis MiniOS das Quellmedium und alle noch benötigten Speicher erfolgreich getrennt hat |

Für einen normalen ersten Start lassen Sie **MiniOS starten** ausgewählt. Verwenden Sie **Ohne Speichern starten** nur, wenn Sie gezielt einen sauberen temporären Hardware-Test oder eine Wiederherstellungssitzung benötigen, bei der keine Persistenz geöffnet oder angelegt werden darf.

::: warning Bestätigen Sie, dass die Persistenz aktiv ist
Die Auswahl eines persistenten Menüeintrags fordert eine Sitzung an; sie garantiert jedoch nicht, dass die Sitzung geöffnet werden kann. Ist der Speicher schreibgeschützt, voll, beschädigt oder inkompatibel, kann MiniOS ohne Speichern der Änderungen fortfahren. Prüfen Sie die Startwarnung, bevor Sie mit Arbeiten beginnen, die erhalten bleiben müssen.
:::

## MiniOS starten

**MiniOS starten** ist der erste und Standard-Menüeintrag. Er ist für die normale Nutzung vorgesehen, auch für den ersten Start eines neu vorbereiteten MiniOS-Geräts.

MiniOS sucht automatisch nach einer kompatiblen persistenten Sitzung. Ist eine nutzbare Standardsitzung vorhanden, wird diese fortgesetzt. Falls nicht, kann MiniOS bei vorhandenem geeignetem beschreibbarem Speicher automatisch eine kompatible Sitzung anlegen.

Kann keine Persistenz erstellt oder aktiviert werden, weil der Speicher schreibgeschützt, voll, beschädigt oder ungeeignet ist, arbeitet MiniOS mit einer temporären beschreibbaren Ebene weiter und meldet, dass die Sitzung nicht persistent ist. Prüfen Sie diese Warnung, bevor Sie Arbeiten beginnen, die einen Neustart überstehen müssen.

Für eine funktionierende persistente Sitzung kann der MiniOS-Konfigurator ausgewählte Standardprotokolle und Caches in RAM halten, während Boot-Diagnosen und Benutzerdaten auf dem Speicher verbleiben. Die drei Einstellungen und ihre RAM-Grenzen werden unter [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). beschrieben. Sie wirken sich nicht auf einen **Ohne Speichern starten**-Start aus.

## Neue Sitzung beginnen

MiniOS öffnet das Persistenz-Einrichtungsmenü, lässt Sie ein unterstütztes Speicher-Backend sowie passende Verschlüsselungs- oder DynBlk-Komprimierungsoptionen auswählen und erstellt dann eine zusätzliche nummerierte persistente Sitzung, wobei bestehende Sitzungen unverändert bleiben. Dies ist das aktuelle `perchdir=setup`Verhalten. Nutzen Sie diese Option, um getrennte Arbeitsbereiche zu behalten oder eine neue Konfiguration zu testen, ohne Ihre laufende Sitzung zu ersetzen.

Für die Erstellung ist kompatibler beschreibbarer Speicher und ausreichend freier Platz erforderlich. Die verfügbaren Backend-Optionen hängen vom Dateisystem, Secure-Boot-Status, installierten Treibern/Tools und den initrd-Fähigkeiten ab. Eine neue Sitzung ist kein Backup einer bestehenden.

## Gespeicherte Sitzung auswählen

MiniOS zeigt verfügbare gespeicherte Sitzungen an und ermöglicht die Auswahl einer Sitzung. Dies ist hilfreich, wenn ein Gerät mehrere Arbeitsbereiche enthält. Ist der ausgewählte Persistenzspeicher leer, wird der `ask` Pfad automatisch in die Persistenz-Einrichtung geleitet, damit Sie die erste Sitzung erstellen können.

Eine Sitzung kann inkompatibel sein, wenn sie aus einer anderen MiniOS-Version oder Edition stammt. Auch eine andere `union=` Einstellung kann eine Sitzung inkompatibel machen.
Die interaktive Auswahl macht eine inkompatible Sitzung nicht sicher.

Der Inkompatibilitätsdialog kann vorinstallierte Software zurücksetzen und dabei Daten sowie optional Systemeinstellungen beibehalten. Beide Rücksetzmodi erhalten Home-Verzeichnisse, persönliche Einstellungen, Konten und Passwörter. Für das Zwischenspeichern der beibehaltenen Daten wird freier Speicherplatz benötigt; ein SquashFS-Reset wird erst nach dem Speichern dauerhaft. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) bevor Sie den Reset verwenden.

## Ohne Speichern starten

Dieser Modus deaktiviert die Persistenz für den aktuellen Start gezielt. MiniOS verwendet einen temporären beschreibbaren Bereich in RAM, sodass im Live-System erstellte Dateien, installierte Pakete und geänderte Einstellungen beim Herunterfahren verloren gehen.

Verwenden Sie diesen Modus, wenn Sie gezielt:

- Hardware testen möchten, ohne eine persistente Sitzung zu öffnen oder zu erstellen;
- ein Problem diagnostizieren möchten, ohne den gespeicherten Zustand zu verändern;
- vorübergehend arbeiten, ohne dass etwas erhalten bleiben muss.

Ein Start ohne Speichern bedeutet nicht, dass das Boot-Medium entfernt werden kann. Das laufende System liest in der Regel weiterhin Systemmodule von diesem Medium.

## Aus dem RAM ausführen

In diesem Modus werden MiniOS-Systemdaten in RAM kopiert, um Lesezugriffe auf die Quelle zu reduzieren. Dafür wird ausreichend Arbeitsspeicher für das kopierte System und die laufende Arbeitslast benötigt.

Systemkopie und Persistenzkopie sind voneinander unabhängig. Bei einer Persistenzanfrage `toram` ist standardmäßig `perchtoram` aktiviert `trim`, sodass die ausgewählte unterstützte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung nach RAM kopiert wird, während nicht zusammenhängende gespeicherte Sitzungen auf dem ursprünglichen Speicher verbleiben. Verwenden Sie `perchtoram=off` , wenn Sie das System in RAM benötigen, aber die aktive Persistenzsitzung weiterhin direkt auf den Speicher schreiben soll, oder `perchtoram=full` , wenn alle unterstützten gespeicherten Sitzungen kopiert werden sollen. Native Verzeichnisdaten werden nicht kopiert: Eine erfolgreiche native RAM-Anfrage startet stattdessen einen neuen, leeren Container. Während eines Native-Session-Resets ist das Kopieren deaktiviert, um erhaltene Daten zu schützen. Wenn beim Kopieren einer Sitzung nicht genügend Speicher vorhanden ist oder ein Fehler auftritt, meldet MiniOS den Fallback und belässt die Sitzung auf dem Speicher.

Eine RAM-gestützte Persistenzsitzung ist während der Laufzeit nicht dauerhaft. Der aktuelle MiniOS-Sitzungsmanager kann unterstützte Änderungen, die auf RAM basieren, explizit mit **Jetzt speichern** zurück auf den ursprünglichen Speicher schreiben oder sie als neue, nummerierte Sitzung speichern, sofern der ursprüngliche Speicher vorhanden, beschreibbar und noch mit der beim Start aufgezeichneten Identität übereinstimmt. Bis ein solches Speichern erfolgreich ist, gehen nicht gespeicherte RAM-Änderungen beim Herunterfahren verloren. Die automatischen Speicherregeln von SquashFS verwenden dasselbe Sitzungs-Backend, wenn der ursprüngliche Speicher verfügbar ist.

Entfernen Sie das Boot-Gerät nicht nur deshalb, weil **Aus dem RAM ausführen** ausgewählt wurde. Es ist erst dann sicher, wenn MiniOS das Quell-Dateisystem, den ISO-Loop, Ventoy-Zuordnungen und alle noch benötigten Persistenzabhängigkeiten erfolgreich getrennt hat. Falls das Trennen fehlschlägt, bleibt die Quelle weiterhin in Benutzung.

## Ventoy Persistenz-Images

Mit einem ausgewählten Ventoy Persistence Plugin-Backend verwendet ein persistenter Bootvorgang eine beschreibbare ext4-Umgebung aus diesem Image anstelle von nummerierten MiniOS Sitzungen.**Neue Sitzung beginnen** und **Gespeicherte Sitzung auswählen** können in diesem Modus keine nummerierten Sitzungen erstellen oder auswählen; wählen Sie stattdessen ein anderes Backend in Ventoy. Sitzungsverwaltung und `perchtoram` sind nicht verfügbar, daher bleibt das Image auch bei einem System-RAM-Boot weiterhin in Benutzung.**Ohne Speichern starten** verwendet weiterhin ein temporäres RAM Upper-Layer. Gewöhnliche Ventoy Boots ohne ausgewähltes Plugin-Image behalten das normale MiniOS Sitzungsverhalten bei. Siehe [Ventoy](/installing-minios/installation-tools/Ventoy).

## Native-Installation

::: warning Die Native-Installation ändert das Systemmodell
Eine Native-Installation behält die gewohnte MiniOS Desktop-Umgebung bei – mit ihrem Erscheinungsbild, der gewählten Desktop-Umgebung und den üblichen Anwendungen – wandelt das Live-Image jedoch in ein konventionelles Debian-Desktop-System um. MiniOS-spezifische Werkzeuge für Sitzungen, Module, modulare Kernel und andere Live-Workflows werden entfernt, da diese Funktionen nicht mehr benötigt werden.
:::

Nach der nativen Umstellung nutzen Sie die gewohnten Debian-Werkzeuge für Pakete, Kernel, Konfiguration und Bootloader. Das System bleibt optisch vertraut und enthält weiterhin die Standardanwendungen der gewählten Edition, aber die MiniOS-spezifischen Live-Funktionen stehen nicht mehr zur Verfügung. Die MiniOS Live-Architektur wird erläutert unter [Über MiniOS](/getting-started/About-MiniOS).

Verwenden Sie [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) nur, wenn Sie diese Umwandlung ausdrücklich wünschen und das gewählte Image die native Bereitstellung unterstützt.

## Wenn Sie mehr Details benötigen

- [Boot-Menüs](/preparing-and-customizing/Customizing-the-Boot-Menu)erläutert die Navigation und das temporäre Bearbeiten eines Menüeintrags.
- [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence)beschreibt Speicherarten, das Erstellen, Vergrößern und Entfernen von Sitzungen.
- [Boot-Parameter](/reference/Boot-Parameters)ist die vollständige Referenz für die Befehlszeile.
- [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), [Modulladen](/reference/boot-process/Module-Loading), und [Persistenz](/reference/boot-process/Persistence-Internals)erklären, wie die zugehörigen Parametergruppen beim Start verarbeitet werden.
