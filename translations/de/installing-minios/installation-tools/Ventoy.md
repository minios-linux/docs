---
updated: 2026-10-15
---

# Ventoy

Ventoy ist ein beliebtes Tool zum Erstellen bootfähiger USB-Sticks, mit dem Sie mehrere ISO-Dateien auf einem Gerät speichern und von jeder einzelnen booten können.

## Wichtig

**Achtung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

Die aktuelle MiniOS-Integration unterstützt den "Ventoy"-**Normalmodus**, einschließlich direkter Persistenz-Images im BIOS und UEFI. Ältere MiniOS-Images benötigen möglicherweise den **GRUB2-Modus**; verwenden Sie diesen Modus, falls das ältere Image im Normalmodus seine Quelle nicht erkennt. Das `VTGRUB2` Dateinamensuffix kann für solche Images den GRUB2-Modus erzwingen. Für aktuelle Images ist dies jedoch nicht zwingend erforderlich.

## Laufwerksanforderungen

### Laufwerksgröße

Berücksichtigen Sie ausreichend Speicherplatz für die ISO-Dateien, weitere Daten und den gewünschten persistenten Speicher. Der reservierte Speicherplatz von Ventoy und die Kapazität des Persistenz-Images sind voneinander unabhängig. Siehe [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility) für Systemanforderungen.

## Ventoy installieren

### Methode 1: Standardinstallation

1. **Ventoy von der [offiziellen Website](https://www.ventoy.net/) herunterladen**
2. **Den Ventoy-Installer ausführen** und das USB-Laufwerk auswählen
3. **Ventoy auf dem Laufwerk installieren** (alle Daten werden gelöscht)
4. **Die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Laufwerks kopieren

Dadurch wird ein Multiboot-Medium für ISO-Dateien erstellt: Ventoy behält die ISO als Datei auf seiner Datenpartition und präsentiert sie beim Booten. Es handelt sich nicht um ein direktes Schreiben eines MiniOS-Abbilds oder eine Bereitstellung über das MiniOS-Installationsprogramm.

### Methode 2: Installation mit separater Datenpartition (Empfohlen)

1. **Laden Sie Ventoy herunter** von der [offiziellen Website](https://www.ventoy.net/)
2. **Führen Sie das Installationsprogramm Ventoy aus** und wählen Sie Ihr USB-Laufwerk aus
3. **Aktivieren Sie die Option „Speicher reservieren“** während der Installation, um am Ende des Laufwerks nicht zugewiesenen Speicherplatz zu lassen
4. **Installieren Sie Ventoy** auf dem Laufwerk
5. **Kopieren Sie die ISO-Datei MiniOS** in das Stammverzeichnis des USB-Laufwerks
6. **Erstellen Sie eine ext4-Partition** im reservierten Speicher mit dem Label `persistence` mit einem Partitionseditor

Damit steht ein möglicher Speicherort für Persistenz zur Verfügung, aber das reine Erstellen der Partition aktiviert die Persistenz nicht und erstellt auch keine Sitzung.

## Integration mit MiniOS

MiniOS erkennt das von Ventoy bereitgestellte ISO unabhängig vom beschreibbaren Speicher. Es gibt zwei Persistenzmodelle; wählen Sie eines gezielt aus.

### Normale MiniOS-Sitzungen

Ohne ausgewachtes Ventoy Persistence Plugin-Backend werden die üblichen**MiniOS starten** Anmeldeanforderungen `perchdir=resume`. MiniOS kann eine Partition auf demselben Laufwerk`persistence` oder deren `minios/changes/` Speicher auf der Ventoy-Datenpartition nutzen. Für das Datenpartitions-Layout aktivieren Sie die Linux-Remount-Unterstützung von Ventoy in`/ventoy/ventoy.json`:

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Fügen Sie dies in eine bestehende Konfiguration ein, anstatt andere Plugins zu entfernen. Geeigneter, beschreibbarer Speicher wird weiterhin benötigt. Bei FAT32/NTFS/exFAT wird beim Start nach Möglichkeit DynBlk bevorzugt, andernfalls wird DynFileFS verwendet. Session Manager, nummerierte Sitzungen, Verschlüsselung und das Speichern unterstützter RAM-Sitzungen folgen den normalen MiniOS-Regeln. Ein Start ohne Persistenz-Anforderung bleibt temporär.

### Ventoy Persistence-Plugin

Alternativ kann das ISO mit einem **ext4-Persistenz-Image** über das Persistence-Plugin von Ventoy verknüpft werden. Zum Beispiel kann ein bereits erstelltes Image unter `/ventoy/minios.dat` für `/ISO/MiniOS.iso`:

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

Die Pfade sind relativ zum Daten-Partition-Root von Ventoy. Erstellen Sie das ext4-Image mit den Persistenz-Image-Tools von Ventoy und wählen Sie es beim Booten aus; das bloße Platzieren einer `.dat` Datei auf dem Laufwerk aktiviert es nicht. MiniOS verwendet das Backend, das von Ventoy ausgewählt wurde, und nicht ein beliebiges Gerät mit passendem Label.

Dieses Image enthält eine persistente Umgebung mit `changes/` und für OverlayFS `workdir/`. Nummerierte MiniOS-Sitzungen sind nicht enthalten. Um eine andere Umgebung zu nutzen, wählen Sie ein anderes Backend in Ventoy. Session Manager und `minios-session` stehen nicht zur Verfügung, `perchdir` die Sitzungswahl wird ignoriert und `perchtoram` kann dieses Upper nicht in RAM kopieren. System-`toram` bleibt möglich, aber die Abhängigkeit vom Persistenz-Image bleibt bestehen.

Beim ersten Einsatz wird das Union-Format gespeichert. Wird das Image später mit einem anderen Union-Backend, einem nicht verfügbaren Image, einem Nicht-ext4-Image oder bei fehlgeschlagener Schreibaktivierung verwendet, erscheint eine Warnung und ein neues RAM-Upper wird erstellt. **Ohne Speichern starten** öffnet das Image nicht. Siehe [Boot-Modi](/using-minios/Boot-Modes) und [Persistenz-Interna](/reference/boot-process/Persistence-Internals).

## Verwendung von MiniOS mit Ventoy

### Startvorgang

Nach der Installation von Ventoy und dem Kopieren der MiniOS ISO-Datei auf das Laufwerk:

1. **Vom USB-Laufwerk booten** - im BIOS/UEFI auswählen
2. **Wählen Sie MiniOS** aus der Liste der verfügbaren ISO-Dateien im Ventoy-Menü aus
3. Wählen Sie den normalen Modus für ein aktuelles MiniOS-Abbild; bei einem älteren Abbild verwenden Sie den dokumentierten Modus
4. **Warten Sie, bis MiniOS geladen ist**

Nach dem Start prüfen Sie den Persistenzstatus, bevor Sie sich auf gespeicherte Änderungen verlassen. Bei normalen Sitzungen verwenden Sie `sudo minios-session status`. Mit dem Persistence Plugin prüfen Sie `/run/initramfs/minios-persistence/boot-state` als root: Ein erfolgreich aktiviertes Backend protokolliert `mode=ventoy` und `boot_level=ok`. Lassen Sie das Laufwerk angeschlossen, solange dessen ISO- oder Persistenz-Abbild verwendet wird.
