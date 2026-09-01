---
updated: 2026-08-31
---

# Über MiniOS

MiniOS ist eine auf Debian basierende Linux-Distribution, die in erster Linie als portables Betriebssystem konzipiert ist. Sie kann von Wechselmedien oder einer lokalen Festplatte gestartet werden und hält Betriebssystem, Anwendungen und Benutzerumgebung unabhängig von einem bestimmten Computer.

Eine herkömmliche Desktop-Installation wird im Laufe der Zeit immer stärker an das jeweilige Gerät gebunden, auf dem sie installiert wurde. MiniOS verfolgt einen anderen Ansatz: Die Arbeitsumgebung bleibt beim Nutzer und kann zwischen kompatiblen Computern mitgenommen werden.
Einstellungen, Dateien, installierte Software und persistente Sitzungen können mit dem System reisen, anstatt auf einer internen Festplatte zu verbleiben.

MiniOS ist daher mehr als nur eine temporäre Live-Umgebung. Ziel ist es, ein vollständiges portables Linux-System bereitzustellen, das sich im Alltag, für Wartung, Wiederherstellung, Experimente und spezielle Aufgaben praktisch einsetzen lässt.

## Was MiniOS besonders macht

### Von Grund auf portabel

MiniOS basiert auf einer einfachen Idee: **Das Betriebssystem soll dem Nutzer gehören, nicht dem Gerät, auf dem es läuft**.

Der Computer stellt Prozessor, Arbeitsspeicher, Anzeige, Speicher-Interfaces und Peripheriegeräte bereit. Die MiniOS-Umgebung kann auf den eigenen Medien des Nutzers verbleiben und auf unterschiedlicher Hardware gestartet werden. Dadurch wird der Computer zum Ort, an dem das System heute läuft – und nicht zu dem, dem das System dauerhaft zugeordnet ist.

### Modular aufgebaut

MiniOS wird aus separaten, schreibgeschützten SquashFS-Modulen zusammengesetzt, anstatt aus einem großen, beschreibbaren Systemabbild zu bestehen. Basissystem, Kernel, Firmware, Desktop, Anwendungen und zusätzliche Software bleiben als eigenständige Schichten erhalten.

Benutzeränderungen können unabhängig von diesen Basismodulen gespeichert werden. Dadurch ist es möglich, Teile des Systems hinzuzufügen, auszutauschen, zu deaktivieren oder zu testen, ohne das gesamte Betriebssystem neu zu schreiben. Außerdem kann bei fehlgeschlagenen Experimenten leichter auf einen bekannten Ausgangszustand zurückgesetzt werden.

Die Modularität ermöglicht es zudem, dass verschiedene MiniOS-Editionen und angepasste Systeme die gleiche Architektur teilen, anstatt sich zu eigenständigen Produkten zu entwickeln.

### Kompakt ohne Komfortverlust

Der Name **MiniOS** spiegelt ein zentrales Projektziel wider: Das System so klein wie sinnvoll möglich zu halten. Die Größe wird jedoch nicht auf Kosten von Komfort, Stabilität oder Vielseitigkeit reduziert.

Ein sehr kleines Live-Image lässt sich leicht erstellen, wenn Firmware, Lokalisierung, Dateisystemunterstützung, Persistenz, Desktop-Integration, Rettungswerkzeuge und Anwendungen entfernt werden. Ein portables Betriebssystem steht jedoch vor einer anderen Herausforderung: Es soll auch dann nützlich bleiben, wenn es auf Hardware gestartet wird, die beim Erstellen des Images noch nicht bekannt war.

MiniOS strebt daher die **kleinstmögliche praktikable Größe bei maximalem Komfort, Hardwareunterstützung und Funktionalität** an. Komponenten werden nicht entfernt, nur weil sie das ISO vergrößern; entscheidend ist, ob der Platzbedarf einen praktischen Mehrwert bietet.

Deshalb sind manche MiniOS-Editionen größer, als es der Name zunächst vermuten lässt.
Die zusätzliche Größe ist bewusst gewählt, wenn sie die Alltagstauglichkeit verbessert oder das portable System auf mehr Computern nutzbar macht. Nutzer, die ein kleineres System benötigen, können eine leichtere Edition oder eine reduzierte Modulauswahl wählen, während Nutzer, die eine vollständige Workstation wünschen, mehr Funktionen behalten können.

### Debian – kein eigenes Ökosystem

MiniOS basiert auf Debian und bleibt bewusst Teil des Debian-Ökosystems.
Es verwendet normale Debian-Pakete, APT, Standarddienste und vertraute Linux-Konventionen. MiniOS-spezifische Infrastruktur wird nur dort ergänzt, wo ein portables, modulares System Funktionen benötigt, die eine herkömmliche Installation nicht bietet.

Das Projekt bevorzugt bewährte Linux-Mechanismen, wenn sie das Problem bereits lösen, anstatt sie durch MiniOS-eigene Lösungen zu ersetzen.

### Transparent und anpassungsfähig

MiniOS automatisiert Routinetätigkeiten, ohne die Systemstruktur zu verbergen. Nutzer können ausschließlich mit grafischen Werkzeugen und vorgefertigten Images arbeiten, aber das gleiche System lässt sich auch inspizieren, umkonfigurieren, mit Modulen erweitern oder für spezielle Zwecke neu zusammenstellen.

So kann MiniOS verschiedene Aufgaben erfüllen, ohne sich in eigenständige Produkte aufzuspalten. Ein schlanker portabler Desktop, ein Rettungswerkzeugkasten und eine umfassende Workstation können auf demselben Grundmodell basieren und sich hauptsächlich durch die enthaltenen Module und Anwendungen unterscheiden.

## Wie MiniOS funktioniert

Beim Systemstart kombiniert MiniOS schreibgeschützte SquashFS-Module zu einem laufenden Root-Dateisystem und fügt für die aktuelle Sitzung eine beschreibbare Ebene hinzu. Ohne Persistenz ist dieser beschreibbare Zustand nur temporär. Mit Persistenz können ausgewählte Änderungen einen Neustart überdauern, während die Basismodule weiterhin getrennt bleiben.

Das modulare Live-System ist nicht nur eine von mehreren Installationsoptionen: **es ist das prägende MiniOS-Modell**. MiniOS-Module, persistente Sitzungen, Konfiguration zur Startzeit, modulares Kernel-Management, Image-Zusammenstellung und die MiniOS-Verwaltungsanwendungen sind um diese Live-Architektur herum konzipiert.

Das MiniOS-Installationsprogramm bietet außerdem einen **nativen** Installationsweg für Nutzer, die ein konventionelles Desktop-System auf einem beschreibbaren Root-Dateisystem bevorzugen. Die native Installation bewahrt das gewohnte MiniOS-Desktop-Erlebnis – mit der gewählten Desktop-Umgebung, dem visuellen Erscheinungsbild und den üblichen Anwendungen – verlässt jedoch das modulare Live-Modell: MiniOS-Sitzungen, `.sb`-Modul-Workflows, modulares Kernel-Management und die für den Live-Betrieb entwickelten MiniOS-spezifischen Werkzeuge entfallen. Das installierte System wird dann als herkömmlicher Debian-Desktop mit APT, Debian-Kernelpaketen, einem normalen initramfs und dem installierten Bootloader gepflegt.

Technische Details finden Sie unter [MiniOS Systemarchitektur](/reference/System-Architecture).
Informationen zum Sitzungsverhalten und zu Speicheroptionen finden Sie unter [Startmodi](/using-minios/Boot-Modes) und [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Editionen

MiniOS-Editionen sind verschiedene Konfigurationen derselben Architektur und keine eigenständigen Betriebssysteme.

| Edition | Zweck |
|---|---|
| **Standard** | Minimales Xfce-System mit grundlegender Funktionalität für den Alltag; empfohlen für die meisten Nutzer |
| **Toolbox** | Systemadministration und Diagnose für professionelle IT-Arbeit und Systemrettung |
| **Ultra** | Voll ausgestatteter Desktop mit einer breiten Palette an Anwendungen und professionellen Tools für Kreativität und Entwicklung |
| **Flux** | Ultraleichte Fluxbox-Edition für minimalen Ressourcenverbrauch und ältere Hardware; nicht für Einsteiger empfohlen |

Die genaue Desktop- und Paketverfügbarkeit hängt von der jeweiligen Veröffentlichung und Zielplattform ab. Für die gepflegte Paketauswahl und die Beziehungen zwischen den Editionen siehe [Pakete und Editionen](/reference/Package-and-Edition-Contents). Informationen zu den MiniOS-spezifischen Werkzeugen im System finden Sie unter [MiniOS Anwendungen und Werkzeuge](/using-minios/MiniOS-Applications).

## Nächste Schritte

- [Schnellstart](/getting-started/Quick-Start) — starten Sie mit MiniOS.
- [MiniOS Anwendungen und Werkzeuge](/using-minios/MiniOS-Applications) — entdecken Sie die enthaltenen MiniOS-Werkzeuge.
- [MiniOS Systemarchitektur](/reference/System-Architecture) — erfahren Sie mehr über das Modul-, Sitzungs- und Boot-Modell.
- [Pakete und Editionen](/reference/Package-and-Edition-Contents) — vergleichen Sie die gepflegten Editionen.

Projektressourcen:

- [MiniOS Website](https://minios.dev)
- [Quellcode](https://github.com/minios-linux/minios-live)
- [Issue Tracker](https://github.com/minios-linux/minios-live/issues)
