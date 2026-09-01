---
updated: 2026-08-31
---

# Schnellstart

Diese Anleitung führt Sie von einem heruntergeladenen MiniOS-Image zu einem funktionierenden System. Sie behandelt nur die wichtigsten Entscheidungen für den ersten Start; die verlinkten Anleitungen erklären jedes Thema ausführlich.

## 1. MiniOS herunterladen

Wählen Sie die Edition, die am besten zu Ihren Anforderungen passt:

| Edition | Am besten geeignet für |
|---|---|
| **Standard** | **Empfohlen für die meisten Nutzer und für den ersten MiniOS-Einsatz.** Ein minimalistisches System mit Grundfunktionen und einer schlanken, effizienten Xfce-Oberfläche für den Alltag. |
| **Toolbox** | Eine Systemverwaltungs- und Diagnose-Edition für professionelle IT-Arbeit und Systemrettung. Enthält Standard sowie die entsprechenden Verwaltungs-, Rettungs-, Netzwerk-, Hardwaretest-, Backup- und Fernzugriffswerkzeuge. |
| **Ultra** | Eine voll ausgestattete Desktop-Edition mit einer großen Auswahl an Anwendungen und professionellen Tools für Kreativität und Entwicklung. Enthält Toolbox plus Office-, Grafik-, Video-, Audio-, 3D-, Entwicklungs- und Container-Software. |
| **Flux** | Eine ultraleichte Fluxbox-Edition für minimalen Ressourcenverbrauch und ältere Hardware. Enthält weniger Anwendungen und Komfortfunktionen als Standard. **Nicht für Einsteiger empfohlen.** |

Die genaue Paket- und Desktop-Verfügbarkeit hängt vom Release ab. Siehe [Über MiniOS](/getting-started/About-MiniOS) für das Editionsmodell und [Pakete und Editionen](/reference/Package-and-Edition-Contents) für die gepflegte Paketauswahl.

Laden Sie das ISO von der [MiniOS-Website](https://minios.dev), der offiziellen [GitHub Releases-Seite](https://github.com/minios-linux/minios-live/releases) oder [SourceForge](https://sourceforge.net/projects/minios-linux/) herunter.

## 2. Download überprüfen

Überprüfen Sie das ISO, bevor Sie es installieren. MiniOS-Releases stellen eine passende `.iso.sha256`-Datei bereit; siehe [Downloads verifizieren](/installing-minios/Verifying-Downloads) für Befehle unter Linux, macOS und Windows.

## 3. Installieren Sie MiniOS

Für MiniOS ist das Schreiben des Systems auf ein Wechseldatenträger bereits eine Installationsmethode: Das resultierende Gerät ist ein bootfähiges MiniOS-System.

Wählen Sie die Methode entsprechend dem gewünschten Ergebnis für das Gerät:

| Ihr Ziel | Methode | Ergebnis |
|---|---|---|
| Ein normales USB-Laufwerk, das auch MiniOS bootet | [Rufus](/installing-minios/installation-tools/Rufus) im normalen ISO-Modus oder [Dateibasierte Installation](/installing-minios/Manual-File-Based-Installation) | MiniOS-Dateien und Bootloader liegen auf einem normalen Dateisystem, sodass das Laufwerk weiterhin für gewöhnliche Dateien genutzt werden kann |
| MiniOS zusammen mit anderen ISO-Abbildern | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy behält die normale Datenpartition, unterstützt Multiboot und MiniOS ermöglicht persistente Sitzungen in diesem Layout |
| Eine verwaltete portable MiniOS-Installation | [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) im **Live**-Modus | Erstellt eine modulare MiniOS-Installation und kann persistenten Speicher konfigurieren |
| Eine exakte Block-für-Block-Kopie des ISO | [Rufus](/installing-minios/installation-tools/Rufus) im DD-Modus, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) oder [`dd`](/installing-minios/installation-tools/dd) | Reproduziert das ISO-Blocklayout; einfach und vorhersehbar, aber das Gerät verhält sich nicht mehr wie ein gewöhnlicher USB-Stick |

Für ein portables Laufwerk, das Sie auch für normale Dateispeicherung nutzen möchten, bevorzugen Sie Rufus im ISO-Modus, eine dateibasierte Installation, Ventoy oder eine geeignete Live-Installation mit dem MiniOS-Installationsprogramm. Das Schreiben eines Rohabbilds ist sinnvoll, wenn eine exakte Kopie des veröffentlichten Images wichtiger ist als die Wiederverwendung des Geräts als allgemeiner Speicher.

::: danger Überprüfen Sie das Zielgerät
Die meisten Installationsmethoden überschreiben einige oder alle Daten auf dem ausgewählten Gerät.
Sichern Sie wichtige Daten und überprüfen Sie Modell und Kapazität des Geräts vor dem Start.
:::

Siehe [Installation von MiniOS](/installing-minios/Installation-Methods) für die Unterschiede zwischen Rohabbild-Schreiben, Ventoy, dateibasierten Layouts und MiniOS-Installationsprogramm.

## 4. MiniOS zum ersten Mal starten

1. Starten Sie den Computer neu, während das MiniOS-Gerät angeschlossen ist.
2. Öffnen Sie das Boot-Menü der Computer-Firmware und wählen Sie dieses Gerät aus.
3. Lassen Sie den Standard-Eintrag **MiniOS starten** ausgewählt und starten Sie das System.
4. Überprüfen Sie, ob Grafik, Tastatur, Netzwerk und die benötigten Speichermedien korrekt funktionieren.

**MiniOS starten** ist der normale Standard-Bootmodus. Er verwendet eine automatische Persistenz-Auswahl: MiniOS versucht, eine kompatible Standardsitzung fortzusetzen und kann, falls keine nutzbare Sitzung existiert, eine neue anlegen, sofern geeigneter beschreibbarer Speicher verfügbar ist. Falls keine Persistenz aktiviert werden kann, arbeitet MiniOS mit einer temporären beschreibbaren Ebene weiter und meldet, dass Änderungen nicht gespeichert werden.

Das bedeutet, dass für einen normalen ersten Start keine vorherige Sitzung angelegt werden muss. Wählen Sie **Ohne Speichern starten** nur, wenn Sie bewusst einen sauberen, temporären Start ohne persistente Sitzung wünschen.

Siehe [Boot-Modi](/using-minios/Boot-Modes) für weitere Startoptionen. Wenn das Gerät nicht bootet oder wichtige Hardware nicht funktioniert, siehe [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility) und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## 5. Wählen Sie bei Bedarf ein anderes Sitzungsverhalten

Für den normalen portablen Einsatz verwenden Sie weiterhin den Standard-Eintrag **Start MiniOS**. Wählen Sie einen anderen Modus nur, wenn Sie ein anderes Ergebnis benötigen:

| Boot-Option | Verwenden, wenn | Ergebnis |
|---|---|---|
| **Start MiniOS** (Standard) | Normaler portabler Einsatz | Setzt eine kompatible Standardsitzung automatisch fort oder erstellt eine, sofern unterstützt |
| **Neue Sitzung starten** | Sie möchten einen separaten zusätzlichen Arbeitsbereich | Erstellt eine zusätzliche nummerierte persistente Sitzung und lässt bestehende Sitzungen unverändert |
| **Gespeicherte Sitzung wählen** | Sie möchten eine von mehreren vorhandenen Arbeitsumgebungen auswählen | Ermöglicht die interaktive Auswahl einer bestehenden Sitzung |
| **Ohne Speicherung starten** | Sie möchten einen sauberen temporären Start ohne Persistenz | Verwendet eine temporäre beschreibbare Ebene im RAM |
| **Aus RAM ausführen** | Sie möchten MiniOS für diesen Start in RAM kopieren | Läuft von einer RAM-Kopie; Änderungen sind als temporär zu betrachten |

Automatische Persistenz erfordert weiterhin geeigneten beschreibbaren Speicher. Ein reines ISO-Write bereitet keinen persistenten Speicher vor. Dateibasierte Installationen, Ventoy-Layouts und Live-Installationen mit dem [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) können beschreibbare Layouts für die persistente MiniOS-Nutzung bereitstellen. Bestehende Sitzungen können mit der [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) eingesehen und verwaltet werden.

Bevor Sie sich auf Persistenz verlassen, starten Sie einmal neu und prüfen Sie, ob MiniOS die erwartete Sitzung als aktiv meldet und eine Teständerung den Neustart übersteht.

## 6. MiniOS vorkonfigurieren

Die meisten MiniOS-spezifischen Konfigurationstools bereiten Einstellungen für einen späteren Start oder eine neue Sitzung vor, anstatt den laufenden Desktop sofort zu ändern.

Verwenden Sie den **MiniOS Konfigurator** für diese Vorkonfiguration: Sprache, Zeitzone, Tastatur, Hostname, Dienste, Kontovorgaben, Sicherheitsrichtlinien und weitere MiniOS-Startoptionen. Öffnen Sie ihn über das Anwendungsmenü oder mit:

```bash
minios-configurator
```

Für laufende Einstellungen wie Netzwerkverbindungen, Audio, Anzeige oder Anwendungsvorlieben nutzen Sie die Standard-Desktop- und Linux-Tools.
Einige Einstellungen des MiniOS Konfigurators greifen beim nächsten Start, während Konto- und Sicherheitseinstellungen nur bei der Erstellung einer neuen Sitzung angewendet werden. Siehe [MiniOS Konfigurator](/preparing-and-customizing/Preconfiguring-MiniOS) für das genaue Verhalten.

## Nächste Schritte

Sobald MiniOS startet und den gewünschten Zustand beibehält:

- [MiniOS-Anwendungen und -Werkzeuge](/using-minios/MiniOS-Applications) — sehen Sie sich die MiniOS-spezifischen Werkzeuge im System an.
- [Netzwerkkonfiguration](/using-minios/Networking) — nutzen Sie NetworkManager wie gewohnt oder bereiten Sie eine MiniOS-Verkabelung vor.
- [MiniOS-App-Store](/using-minios/Installing-Software) — installieren Sie Anwendungen aus dem MiniOS-Katalog.
- [Modulverwaltung](/preparing-and-customizing/Managing-Modules) — prüfen und verwalten Sie MiniOS-Module.
- [Backup und Wiederherstellung](/maintenance-and-recovery/Backing-Up-MiniOS) — schützen Sie ein System, das Sie weiterverwenden möchten.
