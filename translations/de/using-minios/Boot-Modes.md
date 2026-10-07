---
updated: 2026-10-06
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

MiniOS zeigt verfügbare gespeicherte Sitzungen an und lässt Sie eine auswählen. Verwenden Sie dies, wenn ein Gerät mehrere Arbeitsbereiche enthält. Ist der gewählte Persistenzspeicher leer, wird der `ask`Pfad automatisch in die Persistenz-Einrichtung geführt, sodass Sie die erste Sitzung anlegen können.

Eine Sitzung kann inkompatibel sein, wenn sie aus einer anderen MiniOS-Version oder Edition stammt. Eine andere `union=`Einstellung kann eine Sitzung ebenfalls inkompatibel machen.
Die interaktive Auswahl macht eine inkompatible Sitzung nicht sicher.

## Ohne Speichern starten

Dieser Modus deaktiviert die Persistenz für den aktuellen Start gezielt. MiniOS verwendet einen temporären beschreibbaren Bereich in RAM, sodass im Live-System erstellte Dateien, installierte Pakete und geänderte Einstellungen beim Herunterfahren verloren gehen.

Verwenden Sie diesen Modus, wenn Sie gezielt:

- Hardware testen möchten, ohne eine persistente Sitzung zu öffnen oder zu erstellen;
- ein Problem diagnostizieren möchten, ohne den gespeicherten Zustand zu verändern;
- vorübergehend arbeiten, ohne dass etwas erhalten bleiben muss.

Ein Start ohne Speichern bedeutet nicht, dass das Boot-Medium entfernt werden kann. Das laufende System liest in der Regel weiterhin Systemmodule von diesem Medium.

## Aus dem RAM ausführen

In diesem Modus werden Systemdaten von MiniOS nach RAM kopiert, um Lesezugriffe auf die Quelle zu reduzieren. Es wird ausreichend Arbeitsspeicher für das kopierte System und die laufende Arbeitslast benötigt.

Systemkopie und Persistenzkopie sind jetzt getrennt. Bei einer Persistenz-Anforderung `toram`ist die Voreinstellung `perchtoram`auf `trim`gesetzt, sodass die gewählte unterstützte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung nach RAM kopiert wird, während nicht verwandte gespeicherte Sitzungen auf dem ursprünglichen Speicher verbleiben. Verwenden Sie `perchtoram=off`wenn Sie das System in RAM haben möchten, die aktive Persistenzsitzung aber weiterhin direkt auf den Speicher schreiben soll, oder `perchtoram=full`wenn alle unterstützten gespeicherten Sitzungen kopiert werden sollen. Native Verzeichnis-Sitzungen werden von `perchtoram`nicht kopiert.

Eine RAM-gestützte Persistenzsitzung ist während des Betriebs nicht dauerhaft. Der aktuelle MiniOS-Sitzungsmanager kann unterstützte RAM-gestützte Änderungen explizit mit **Jetzt speichern**zurück auf den ursprünglichen Speicher schreiben oder als neue nummerierte Sitzung speichern, sofern das Original vorhanden, beschreibbar und noch mit der beim Start aufgezeichneten Identität übereinstimmt. Bis ein solches Speichern erfolgreich ist, gehen ungespeicherte RAM-Änderungen beim Herunterfahren verloren. SquashFS-Automatikspeicherregeln verwenden dasselbe Sitzungs-Backend, wenn das Original verfügbar ist.

Entfernen Sie das Boot-Gerät nicht nur, weil **Aus dem RAM ausführen**ausgewählt wurde. Sicher ist dies erst, nachdem MiniOS das Quell-Dateisystem, ISO-Loop, Ventoy-Zuordnungen und alle noch benötigten Persistenzabhängigkeiten erfolgreich getrennt hat. Schlägt das Trennen fehl, bleibt die Quelle in Benutzung.

## Native Installation

::: warning Die native Installation ändert das Systemmodell
Eine native Installation bewahrt das gewohnte MiniOS-Desktop-Erlebnis – mit visueller Identität, gewählter Desktop-Umgebung und Standardanwendungen – wandelt das Live-Image jedoch in einen klassischen Debian-Desktop um. MiniOS-spezifische Werkzeuge für Sitzungen, Module, modulare Kernel und andere Live-Workflows werden entfernt, da diese Funktionen nicht mehr benötigt werden.
:::

Nach der nativen Umwandlung verwenden Sie die normalen Debian-Werkzeuge für Pakete, Kernel, Konfiguration und Bootloader. Das Ergebnis bleibt optisch vertraut und enthält die Standard-Desktop-Anwendungen der gewählten Edition, aber die MiniOS-spezifischen Live-Funktionen sind nicht mehr vorhanden. Die MiniOS-Live-Architektur ist beschrieben unter [Über MiniOS](/getting-started/About-MiniOS).

Verwenden Sie [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer)nur, wenn Sie diese Umwandlung gezielt wünschen und das gewählte Image native Bereitstellung unterstützt.

## Wenn Sie mehr Details benötigen

- [Boot-Menüs](/preparing-and-customizing/Customizing-the-Boot-Menu)erklärt die Navigation und das temporäre Bearbeiten eines Menüeintrags.
- [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence)erläutert Speichermodi, Sitzungsanlage, Größenänderung und Entfernung.
- [Boot-Parameter](/reference/Boot-Parameters)ist die vollständige Referenz für die Befehlszeile.
- [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), [Modulladen](/reference/boot-process/Module-Loading), und [Persistenz](/reference/boot-process/Persistence-Internals)erklären, wie die zugehörigen Parametergruppen beim Start verarbeitet werden.
