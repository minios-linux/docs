---
updated: 2026-09-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Vorkonfiguration von MiniOS

Der MiniOS-Konfigurator ist ein grafischer Editor für die Live-Konfiguration von MiniOS. Er prüft Änderungen und schreibt die Konfiguration für einen späteren Systemstart. Frühe Cache-/Log-Speicheroptionen werden angewendet durch `minios-boot`; die übrigen Live-Config-Komponenten laufen später. Das Speichern wirkt sich nicht direkt auf das laufende System aus.

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

MiniOS kann die Konfiguration aus zwei Quellen lesen:

- `minios/config.conf` und `minios/config.conf.d/*.conf` auf dem Live-Medium
- `/etc/live/config.conf` und `/etc/live/config.conf.d/*.conf` im laufenden Root-Dateisystem

Der MiniOS-Konfigurator bearbeitet nur die gewählte Datei. Ohne Pfadangabe wird die Laufzeitdatei bearbeitet `/etc/live/config.conf`; die Medium-Datei wird nicht direkt geöffnet. MiniOS synchronisiert beim Booten neuere Konfigurationen zwischen dem Laufzeit-Dateisystem und beschreibbaren MiniOS-Medien. Schreibgeschützte Medien übernehmen keine Laufzeitänderungen und eine persistente Laufzeitkonfiguration kann unabhängig von der Medienkopie bleiben.

Beim Start synchronisiert MiniOS die Medium- und Laufzeitdateien anhand des Änderungsdatums. Für die neuen Speicherregeln gilt: Spätere `config.conf.d` Fragmente überschreiben die Hauptdatei, `LIVE_CONFIG_CMDLINE` kommt danach und die aktuelle Kernel-Befehlszeile hat zuletzt Vorrang.
Mit `-i` können im Editor anerkannte Einstellungen aus der aktuellen Kernel-Befehlszeile überlagert werden:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Die gewählte Datei bleibt das Speicherziel. Unbekannte Kernel-Parameter werden ignoriert.

## Wann Einstellungen angewendet werden

Jede Steuerung gibt an, wann sie verwendet wird. Das Speichern wendet eine Einstellung niemals auf die aktuelle Sitzung an.

### Nach Neustart angewendet

Hostname, Sprache, Zeitzone, Tastatur, Bootziel, Dienstauswahl, Modus für Module, Medienverwaltung für Benutzerverzeichnisse, Debug-Einstellungen, Log-Export und die drei erweiterten Speicheroptionen werden erst beim nächsten Start gelesen. Starten Sie das System nach dem Speichern neu, um die Änderungen zu übernehmen.

In **Erweitert**, **Systemprotokoll-Speicher**, **APT-Download-Cache**, und **Browser-Cache** bieten jeweils `persistent` (Standard) oder `volatile`. Ihre `volatile` Optionen gelten nur für eine fehlerfreie, dauerhafte `perch` Sitzung. Protokolle von `minios-boot` und `live-config` bleiben auch dann persistent, wenn normale Protokolle nur temporär sind. Der APT-Paketstatus und Browser-Profile bleiben erhalten; nur die ausgewählten Protokolle und Caches werden auf begrenzte RAM verschoben. Die Browser-Einrichtung erfolgt, nachdem der Live-Benutzer erstellt wurde. Der Konfigurator warnt, falls das laufende initrd die `perch-storage-v1` Markierung für diese Einstellungen nicht enthält. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) bevor Sie RAM-Größen für ein System mit wenig Arbeitsspeicher wählen.

### Nur für eine neue Sitzung verwendet

Kontoerstellung, Benutzer- und Root-Passwörter, `noroot`, Sudo- und PolicyKit-Richtlinien, SSH- und XRDP-Richtlinien, X11-Zugriff, Passwort-Hinweise und Bildschirmsperre sind Einmal-Einstellungen. Eine persistente Sitzung zeichnet abgeschlossene `live-config`-Komponenten normalerweise unter `/var/lib/live/config/` auf, sodass das Ändern dieser Werte und ein Neustart derselben Sitzung das Konto oder den Sicherheitsstatus nicht erneut erstellt. Starten Sie eine neue Sitzung, um diese Werte als Anfangseinstellungen zu übernehmen.

Sicherheitsprofile sind Editor-Voreinstellungen. Der Profilname wird nicht gespeichert; die einzelnen Sicherheitseinstellungen werden gespeichert und bleiben editierbar.

## Benutzerverzeichnisse und Persistenz

Das Verlinken und das Einbinden (Bind Mount) von Benutzerverzeichnissen schließen sich gegenseitig aus. Beide verwenden ein vorhandenes, beschreibbares lokales MiniOS-Datenmedium und einen sicheren, medienrelativen Pfad. Sie sind nicht verfügbar mit `toram` , `toram=full` oder `toram=trim`, und MiniOS führt keine automatische Zusammenführung zweier gefüllter Verzeichnisbäume durch.

`perchmode` und `perchsize` sind initramfs-Bootparameter, keine Einstellungen des MiniOS-Konfigurators. Die neuen Cache-/Log-Speicheroptionen wählen oder erstellen keine `perch` Sitzung. Der MiniOS-Konfigurator erstellt, entsperrt, vergrößert oder repariert keinen Persistenzcontainer. Bei verschlüsselter Persistenz wird angezeigt, ob die initramfs-Verschlüsselungsmarkierung vorhanden ist.

## Speicherverhalten

Die Überprüfung listet nur geänderte Werte auf und schwärzt Passwörter. Beim Speichern werden nur geänderte Schlüssel aktualisiert, während Kommentare, Reihenfolge, unbekannte Schlüssel, Eigentümer, Berechtigungen und erweiterte Attribute erhalten bleiben. Das Schreiben erfolgt atomar.

Die vollständige Referenz zu Variablen und Boot-Parametern finden Sie unter [Konfigurationsdatei](/reference/configuration/config.conf), [Boot-Parameter](/reference/Boot-Parameters) und [live-config](/reference/configuration/live-config).
