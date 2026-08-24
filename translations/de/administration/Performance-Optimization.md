# Leitfaden zur Leistungsoptimierung

Dieser Leitfaden stellt Techniken zur Optimierung der MiniOS-Leistung vor, mit Fokus auf die besonderen Eigenschaften als Live-System. Die größten Leistungssteigerungen erzielen Sie, indem Sie steuern, wie MiniOS seine Daten lädt und wie dauerhafte Änderungen verarbeitet werden.

## Boot-Parameter für Performance

Die effektivste Methode, die Leistung zu steigern – besonders beim Betrieb von einem langsamen USB-Stick – ist die Nutzung von Boot-Parametern, um zu steuern, wie das System in den Arbeitsspeicher geladen wird. Eine vollständige Liste aller verfügbaren Parameter finden Sie unter [Boot-Parameter](/configuration/Boot-Parameters.md).

### Laden des Systems in den RAM (`toram`)

Dies ist die mit Abstand wichtigste Optimierung. Der Boot-Parameter `toram` kopiert das gesamte MiniOS-System vom Boot-Medium in den RAM Ihres Computers. Dadurch wird das System extrem reaktionsschnell, da keine Daten mehr vom langsameren USB-Laufwerk gelesen werden müssen.

- **Verwendung:** Fügen Sie `toram` der Kernel-Befehlszeile beim Start hinzu.
- **Voraussetzung:** Sie benötigen genügend RAM, um die Kernsystemmodule aufzunehmen. Für die `standard` Edition werden mindestens 2-3 GB freier RAM empfohlen.
- **Vorteil:** Startzeiten von Anwendungen und die allgemeine Systemreaktion werden drastisch verbessert.

Für `toram` gibt es zwei Modi:

- **`toram=full` (Standard):** Kopiert alle Systemmodule in den RAM. Verwenden Sie dies, wenn Sie ausreichend Speicher haben.
- **`toram=trim`:** Kopiert nur die wichtigsten Module, die durch die Boot-Parameter `load` und `noload` definiert sind. Dies ist nützlich für Systeme mit begrenztem RAM.

### Module filtern (`load` und `noload`)

Um den Speicherverbrauch zu reduzieren, können Sie festlegen, welche Module geladen werden sollen. Dies ist besonders effektiv in Kombination mit `toram=trim`.

- **`load=module1,module2`:** Lädt nur die angegebenen Module (z.B. `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name`:** Schließt ein bestimmtes Modul vom Laden aus.

So können Sie sich ein schlankes System im RAM zusammenstellen, das genau auf Ihre Bedürfnisse zugeschnitten ist.

## Optimierung der Persistenz

Die Art und Weise, wie MiniOS Ihre Änderungen speichert (Persistenz), kann die Performance erheblich beeinflussen, insbesondere die Schreibgeschwindigkeit.

### Persistenz-Modi (`perchmode`)

Der Boot-Parameter `perchmode` legt das Backend für Ihren persistenten Speicher fest. Die Wahl hängt von Ihrem Speichermedium ab:

- **`perchmode=native` (Standard):** Speichert Dateien direkt in einem Verzeichnis auf Ihrem Speichermedium. Dies ist die **schnellste Option für SSDs und schnelle USB-Sticks**, da der Overhead eines Dateisystems in einer Datei vermieden wird.
- **`perchmode=raw`:** Verwendet eine vorab zugewiesene Raw-Image-Datei für Änderungen. Die Performance ist gut, aber die Dateigröße ist fest.
- **`perchmode=dynfilefs`:** Nutzt eine dynamisch wachsende Datei. Dies ist eine gute Wahl für **langsamere USB-Sticks**, da es die Schreibbelastung reduzieren und die Lebensdauer des Sticks verlängern kann, auch wenn es etwas langsamer als der `native` Modus ist.

### Aktivieren und Deaktivieren der Persistenz

Standardmäßig läuft MiniOS im „Live“-Modus, bei dem alle Änderungen beim Neustart verworfen werden. Um Ihre Änderungen zu speichern, müssen Sie die Persistenz explizit aktivieren.

- **Persistenz aktivieren:** Fügen Sie den Parameter `perch` der Boot-Befehlszeile hinzu. Dadurch wird die Persistenzfunktion von MiniOS aktiviert.
- **Persistenz deaktivieren:** Lassen Sie den Parameter `perch` einfach weg. Ist er nicht vorhanden, läuft das System vollständig aus dem RAM (oder vom Boot-Medium) und es werden keine Änderungen gespeichert.

## ZRAM-Konfiguration

MiniOS verwendet standardmäßig `zram`, um einen komprimierten Swap-Bereich im RAM zu erstellen. Dies verbessert die Leistung auf Systemen mit begrenztem physischem Speicher, da so die Nutzung einer deutlich langsameren Swap-Datei auf der Festplatte vermieden wird.

**Automatische Größenanpassung:**
- **≥4GB RAM:** 2GB ZRAM
- **1–4GB RAM:** Die Hälfte des gesamten RAM
- **<1GB RAM:** 512MB ZRAM

**Boot-Parameter:**
- **`zramsize=1024`:** Legt die Größe des ZRAM-Geräts fest (z. B. `zramsize=1024` für 1GB). Standardmäßig wird die Größe automatisch anhand des gesamten RAM konfiguriert.
- **`zramcomp=lz4`:** Legt den Komprimierungsalgorithmus fest (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` bietet in der Regel einen guten Kompromiss zwischen Geschwindigkeit und Kompressionsrate.
- **`nozram`:** Deaktiviert ZRAM vollständig.

Für die meisten Nutzer sind die Standard-Einstellungen von `zram` optimal. Eine Anpassung wird nur empfohlen, wenn Sie spezielle Anforderungen haben und die jeweiligen Auswirkungen kennen.

## Dateisystem und Speichermedien

- **Verwenden Sie einen schnellen USB-Stick:** Der wichtigste Hardwarefaktor für die MiniOS-Leistung ist die Geschwindigkeit Ihres USB-Sticks. Ein **USB 3.0- oder schneller SSD-basierter Stick** bietet ein deutlich besseres Nutzungserlebnis als ein günstiger, langsamer USB 2.0-Stick.
- **Dateisystemwahl:** Für die Persistenz-Partition bietet ein Standard-Linux-Dateisystem wie **ext4** in der Regel die beste Performance und Zuverlässigkeit.
