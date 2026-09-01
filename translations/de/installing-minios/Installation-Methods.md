---
updated: 2026-08-31
---

# Installationsmethoden

MiniOS ist ein Live-First-Betriebssystem. Die Installation von MiniOS bedeutet in der Regel, das modulare Live-System auf ein Wechseldatenträger oder eine andere Festplatte zu bringen. Das Schreiben oder Kopieren von MiniOS auf einen USB-Stick ist daher bereits eine Installationsmethode und nicht nur eine Vorbereitung für eine spätere Installation.

Es gibt zwei grundlegende Installationsfamilien:

- **Live-Installation** behält den MiniOS-Modulstapel, die Konfiguration zur Bootzeit, Sitzungs-Persistenz und MiniOS-Verwaltungs-Workflows bei. Das Schreiben von Rohabbildern, dateibasierte Installation, Ventoy und der Live-Modus des MiniOS-Installationsprogramms bieten jeweils Möglichkeiten, das MiniOS-Live-System auszuführen.
- **Native Installation** ist eine optionale Umwandlung, die durch das [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) durchgeführt wird. Sie erstellt aus dem gewählten MiniOS-Abbild ein konventionelles Debian-Desktop-System, wobei die Desktop-Umgebung, das visuelle Erscheinungsbild und die Standardanwendungen erhalten bleiben, während die MiniOS-spezifische Software für die Live-Architektur entfernt wird.

## ISO herunterladen und verifizieren

Laden Sie eine ISO von der [offiziellen Website](https://minios.dev), der offiziellen [GitHub Releases-Seite](https://github.com/minios-linux/minios-live/releases) oder von [SourceForge](https://sourceforge.net/projects/minios-linux/) herunter. Überprüfen Sie die Datei, bevor Sie sie auf ein Gerät schreiben; siehe [Downloads verifizieren](/installing-minios/Verifying-Downloads).

## MiniOS auf Wechseldatenträger installieren

Wählen Sie die Methode entsprechend dem gewünschten Layout auf dem Zielgerät:

| Ergebnis | Methode | Was Sie erhalten |
|---|---|---|
| Normales beschreibbares Dateisystem, das auch MiniOS bootet | [Rufus](/installing-minios/installation-tools/Rufus) im ISO-Modus oder [manuelle dateibasierte Installation](/installing-minios/Manual-File-Based-Installation) | MiniOS-Dateien und Bootloader auf einem normalen Dateisystem; verbleibender Speicherplatz bleibt für normale Dateien nutzbar |
| Multiboot-Gerät mit MiniOS-Persistenzunterstützung | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy-Datenpartition für ISO-Dateien plus MiniOS-Unterstützung für persistente Sitzungen |
| Verwaltete modulare MiniOS-Installation | [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) im **Live**-Modus | MiniOS-Modullayout mit optionalem persistentem Speicher, konfiguriert durch das Installationsprogramm |
| Exakte Block-für-Block-Kopie des veröffentlichten ISOs | [Rufus](/installing-minios/installation-tools/Rufus) im DD-Modus, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) oder [`dd`](/installing-minios/installation-tools/dd) | Das ISO-Blocklayout exakt; einfach und vorhersehbar, aber das Ziel verhält sich nicht mehr wie ein normales universelles Flash-Laufwerk |

::: danger Rohabbild-Schreiben überschreibt das Ziellayout
Rufus DD-Modus, Etcher, Laufwerksprogramm-Abbildschreiben und `dd` ersetzen das bestehende Blocklayout des Geräts. Überprüfen Sie das Zielmodell und die Kapazität und sichern Sie wichtige Daten, bevor Sie beginnen. Diese Warnung gilt nicht für Rufus ISO-Modus, Ventoy oder eine dateibasierte Installation.
:::

## Live-Sitzung starten

1. Starten Sie den Computer neu und öffnen Sie das Firmware-Bootmenü.
2. Wählen Sie das USB-Gerät oder ein anderes bootfähiges Medium aus.
3. Starten Sie MiniOS und prüfen Sie, ob Speicher, Netzwerk und Eingabegeräte wie erwartet funktionieren.

Firmware-Einstellungen variieren je nach Computer. Ein MiniOS-Abbild kann über BIOS oder UEFI booten; das Ziel einer späteren Installation mit dem MiniOS-Installationsprogramm ist nicht auf MBR beschränkt.

Verwenden Sie [Bootmodi](/using-minios/Boot-Modes) als maßgebliche Anleitung für das Live-Boot-Verhalten. Wenn beim frühen Booten das Abbild oder seine Module nicht gefunden werden, siehe [Initrd-Systemerkennung](/reference/boot-process/System-Discovery).

## Installationslayout wählen

Starten Sie aus der Live-Sitzung das [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer), wenn Sie das System auf einen anderen USB-Stick, eine SSD oder Festplatte installieren möchten.

- **Live-Modus** bewahrt den komprimierten Modulstapel, das MiniOS-Bootlayout, MiniOS-Verwaltungstools und optionale Sitzungs-Persistenz. Wählen Sie dies, wenn Sie MiniOS selbst auf dem Zielmedium haben möchten.
- **Native Modus** entpackt das gewählte Abbild zu einem konventionellen, beschreibbaren Debian-Desktop. Das Ziel behält die Desktop-Umgebung, das visuelle Erscheinungsbild und die Standardanwendungen der gewählten Edition, während die MiniOS-Live-Laufzeitumgebung und live-spezifische Verwaltungssoftware entfernt werden. Das installierte System verwendet ein konventionelles Debian-initramfs, Bootloader, Kernel-Pakete und den üblichen Paketverwaltungs-Workflow.

::: warning Native Installation verwendet ein anderes Systemmodell
Die prägende MiniOS-Architektur ist das modulare Live-System, wie in [Über MiniOS](/getting-started/About-MiniOS) beschrieben. Der Native Modus erhält das gewohnte MiniOS-Desktop-Erlebnis, einschließlich Erscheinungsbild, Desktop-Umgebung und Standardanwendungen, wandelt das System jedoch in eine konventionelle Debian-Installation um. MiniOS-spezifische Tools für Sitzungen, Module, modulare Kernel und andere Live-Workflows werden entfernt, da diese Funktionen nicht mehr benötigt werden. Wählen Sie eine Live-Installation, wenn Sie den vollständigen MiniOS-Funktionsumfang wünschen.
:::

Live-Persistenz wird während des frühen Bootvorgangs vorbereitet; das detaillierte Verhalten finden Sie unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals). Nach der nativen Umwandlung gilt dies nicht mehr.

Das Installationsprogramm unterstützt automatische BIOS/MBR-, UEFI/MBR- und UEFI/GPT-Layouts. BIOS auf GPT wird vom aktuellen Installationsprogramm nicht unterstützt. Siehe [Verwendung des MiniOS-Installationsprogramms](/installing-minios/MiniOS-Installer) für Hinweise zu Platzierung, Dateisystem, Persistenz und Partitionsgrenzen.
