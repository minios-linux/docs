---
updated: 2026-09-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Vorkonfiguration von MiniOS

Der MiniOS-Konfigurator ist ein grafischer Editor für die Live-Konfiguration von MiniOS. Änderungen werden validiert und die Konfiguration für einen späteren Systemstart gespeichert. Frühe Cache-/Log-Speicheroptionen werden angewendet durch `minios-boot`; die übrigen Live-Config-Komponenten laufen später. Das Speichern ändert das laufende System nicht direkt.

## Starten Sie den Konfigurator

Öffnen Sie den MiniOS über das Anwendungsmenü oder führen Sie aus:

```bash
minios-configurator
```

Das Standardziel ist `/etc/live/config.conf`. Um eine andere reguläre Datei zu bearbeiten, geben Sie deren Pfad an:

```bash
minios-configurator /path/to/config.conf
```

Zum Speichern ist eine PolicyKit-Authentifizierung erforderlich. Symlinks und nicht-reguläre Zieldateien werden abgelehnt.

## Medien- und Laufzeitkonfiguration

MiniOS kann Konfigurationen aus zwei Quellen lesen:

- `minios/config.conf` und `minios/config.conf.d/*.conf` auf dem Live-Medium
- `/etc/live/config.conf` und `/etc/live/config.conf.d/*.conf` im laufenden Root-Dateisystem

Der MiniOS-Konfigurator bearbeitet nur die ausgewählte Datei. Ohne Pfadangabe wird die Laufzeitdatei bearbeitet `/etc/live/config.conf`; die Mediendatei wird nicht direkt geöffnet. MiniOS synchronisiert beim Booten neuere Konfigurationen zwischen dem Laufzeit-Dateisystem und beschreibbaren MiniOS-Medien. Read-only-Medien können keine Laufzeitänderungen übernehmen, und eine persistente Laufzeitkonfiguration bleibt unabhängig von der Medienkopie.

Beim Booten synchronisiert MiniOS die Medien- und Laufzeitdateien nach Änderungszeit. Für die neuen Speicherregeln gilt: Spätere `config.conf.d`-Fragmente überschreiben die Hauptdatei, `LIVE_CONFIG_CMDLINE` folgt danach, und die tatsächliche Kernel-Befehlszeile hat zuletzt Vorrang.
Verwenden Sie `-i` um anerkannte Einstellungen von der aktuellen Kernel-Befehlszeile im Editor zu überlagern:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Die ausgewählte Datei bleibt das Speicherziel. Unbekannte Kernel-Parameter werden ignoriert.

## Wann Einstellungen angewendet werden

Jede Steuerung gibt an, wann sie verwendet wird. Das Speichern wendet eine Einstellung niemals auf die aktuelle Sitzung an.

### Nach dem Neustart angewendet

Hostname, Sprache, Zeitzone, Tastatur, Boot-Ziel, Dienstauswahl, Modulauswahl, Benutzerverzeichnis-Medienverwaltung, Debug-Einstellungen, Log-Export und die drei erweiterten Speicheroptionen werden erst beim nächsten Systemstart übernommen. Starten Sie das System nach dem Speichern neu, um diese Einstellungen zu aktivieren.

In **Erweitert**, **Systemlog-Speicher**, **APT-Download-Cache**, und **Browser-Cache** bieten jeweils `persistent` (Standard) oder `volatile`. Ihre `volatile`-Einstellungen gelten nur für eine gesunde, dauerhafte `perch`-Sitzung. Logs von `minios-boot` und `live-config` bleiben persistent, auch wenn gewöhnliche Logs temporär sind. Der APT-Paketstatus und Browser-Profile bleiben erhalten; nur die ausgewählten Logs und Caches werden auf begrenzte RAM verschoben. Die Browser-Einrichtung erfolgt, nachdem der Live-Benutzer erstellt wurde. Der Konfigurator warnt, falls das laufende initrd die `perch-storage-v1`-Markierung für diese Einstellungen nicht enthält. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) bevor Sie RAM-Größen für ein System mit wenig Arbeitsspeicher wählen.

### Nur für eine neue Sitzung verwendet

Kontoerstellung, Benutzer- und Root-Passwörter, `noroot`, Sudo- und PolicyKit-Richtlinien, SSH- und XRDP-Richtlinien, X11-Zugriff, Passwort-Hinweise und Bildschirmsperre sind Einmal-Einstellungen. Eine persistente Sitzung zeichnet abgeschlossene `live-config`-Komponenten normalerweise unter `/var/lib/live/config/` auf, sodass das Ändern dieser Werte und ein Neustart derselben Sitzung das Konto oder den Sicherheitsstatus nicht erneut erstellt. Starten Sie eine neue Sitzung, um diese Werte als Anfangseinstellungen zu übernehmen.

Sicherheitsprofile sind Editor-Voreinstellungen. Der Profilname wird nicht gespeichert; die einzelnen Sicherheitseinstellungen werden gespeichert und bleiben editierbar.

## Benutzerverzeichnisse und Persistenz

Das Verlinken und das Bind-Mounten von Benutzerverzeichnissen schließen sich gegenseitig aus. Beide Methoden nutzen ein vorhandenes, beschreibbares lokales MiniOS-Datenmedium und einen sicheren, medienrelativen Pfad. Sie sind nicht verfügbar mit `toram`, `toram=full`, oder `toram=trim`, und MiniOS führt keine automatische Zusammenführung zweier bereits gefüllter Verzeichnisbäume durch.

`perchmode` und `perchsize` sind Initramfs-Boot-Parameter, keine Einstellungen des MiniOS-Konfigurators. Die neuen Cache-/Log-Speicheroptionen wählen oder erstellen keine `perch`-Sitzung. Der MiniOS-Konfigurator erstellt, entsperrt, vergrößert oder repariert keinen Persistenz-Container. Für verschlüsselte Persistenz wird angezeigt, ob die Initramfs-Verschlüsselungsmarkierung vorhanden ist.

## Speicherverhalten

Die Überprüfung listet nur geänderte Werte auf und schwärzt Passwörter. Beim Speichern werden nur geänderte Schlüssel aktualisiert, während Kommentare, Reihenfolge, unbekannte Schlüssel, Eigentümer, Berechtigungen und erweiterte Attribute erhalten bleiben. Das Schreiben erfolgt atomar.

Die vollständige Referenz zu Variablen und Boot-Parametern finden Sie unter [Konfigurationsdatei](/reference/configuration/config.conf), [Boot-Parameter](/reference/Boot-Parameters) und [live-config](/reference/configuration/live-config).
