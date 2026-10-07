---
updated: 2026-10-06
program_commits:
    minios-configurator: 4d82e44c6ee6f04909e9dd3ef8e31389d3ac8817
---

# Vorkonfiguration von MiniOS

Der MiniOS-Konfigurator ist ein grafischer Editor für die Live-Konfiguration von MiniOS. Er prüft Änderungen und schreibt die Konfiguration für einen späteren Systemstart. Frühe Cache-/Log-Speicheroptionen werden angewendet von `minios-boot`; die verbleibenden Live-Config-Komponenten laufen später. Das Speichern ändert das laufende System nicht direkt.

## Konfigurator starten

Öffnen Sie den MiniOS-Konfigurator über das Anwendungsmenü oder führen Sie folgenden Befehl aus:

```bash
minios-configurator
```

Das Standardziel ist `/etc/live/config.conf`. Um eine andere reguläre Datei zu bearbeiten, geben Sie deren Pfad an:

```bash
minios-configurator /path/to/config.conf
```

Zum Speichern ist eine PolicyKit-Authentifizierung erforderlich. Symlinks und nicht-reguläre Zieldateien werden abgelehnt.

## Medien- und Laufzeitkonfiguration

MiniOS kann Konfiguration aus zwei Quellen lesen:

- `minios/config.conf` und `minios/config.conf.d/*.conf` auf dem Live-Medium
- `/etc/live/config.conf` und `/etc/live/config.conf.d/*.conf` im laufenden Root-Dateisystem

Der MiniOS-Konfigurator bearbeitet nur die ausgewählte Datei. Ohne Pfadangabe wird die Laufzeitdatei bearbeitet `/etc/live/config.conf`; die Medium-Datei wird nicht direkt geöffnet. MiniOS synchronisiert beim Booten neuere Konfigurationen zwischen dem Laufzeit-Dateisystem und beschreibbaren MiniOS-Medien. Schreibgeschützte Medien können keine Laufzeitänderungen übernehmen, und eine persistente Laufzeitkonfiguration kann unabhängig von der Medienkopie bleiben.

Beim Booten synchronisiert MiniOS die Medium- und Laufzeitdateien nach Änderungszeit. Für die neuen Speicherregeln gilt: Spätere `config.conf.d`-Fragmente überschreiben die Hauptdatei, `LIVE_CONFIG_CMDLINE` folgt darauf, und die aktuelle Kernel-Befehlszeile hat zuletzt Vorrang.
Mit `-i` können anerkannte Einstellungen aus der aktuellen Kernel-Befehlszeile im Editor überlagert werden:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Die ausgewählte Datei bleibt das Speicherziel. Unbekannte Kernel-Parameter werden ignoriert.

## Wann Einstellungen angewendet werden

Jede Steuerung gibt an, wann sie verwendet wird. Speichern wendet eine Einstellung nie auf die aktuelle Sitzung an.

### Nach Neustart angewendet

Hostname, Sprache, Zeitzone, Tastatur, Boot-Ziel, Dienstauswahl, Modulmodus, Medienverwaltung für Benutzerverzeichnisse, Debug-Einstellungen, Log-Export und die drei erweiterten Speicheroptionen werden beim nächsten Systemstart gelesen. Starten Sie nach dem Speichern neu, um sie zu übernehmen.

In **Erweitert**, **Modulmodus** akzeptiert `simple` oder `merged`. Ist `LIVE_MODULE_MODE` in der ausgewählten Konfiguration nicht vorhanden, zeigt der aktuelle MiniOS-Konfigurator `merged` als effektiven Standard an. Im Merged-Modus aktualisiert live-config Benutzer, Caches und Paketstatus, sodass die Konfiguration aus dem Modul-Stack in das laufende Live-System integriert wird.

In **Erweitert**, **System-Log-Speicher**, **APT-Download-Cache**, und **Browser-Cache** bieten jeweils `persistent` (Standard) oder `volatile`. Ihre `volatile`-Auswahl gilt nur für eine gesunde, dauerhafte `perch`-Sitzung. Logs von `minios-boot` und `live-config` bleiben persistent, auch wenn normale Logs temporär sind. APT-Paketstatus und Browser-Profile bleiben persistent; nur die ausgewählten Logs und Caches werden in den begrenzten RAM verschoben. Die Browser-Einrichtung erfolgt, nachdem der Live-Benutzer erstellt wurde. Der Konfigurator warnt, wenn das laufende initrd die `perch-storage-v1`-Markierung für diese Einstellungen fehlt. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) bevor Sie RAM-Größen für ein System mit wenig Arbeitsspeicher wählen.

### Nur für eine neue Sitzung verwendet

Benutzerkonto-Erstellung, Benutzer- und Root-Passwörter, `noroot`, Sudo- und PolicyKit-Richtlinien, SSH- und XRDP-Richtlinien, X11-Zugriff, Passwort-Hinweise und Bildschirmsperre sind Einmal-Einstellungen. Eine persistente Sitzung speichert abgeschlossene `live-config`-Komponenten unter `/var/lib/live/config/`, daher werden durch das Ändern dieser Werte und einen Neustart derselben Sitzung das Konto oder der Sicherheitsstatus nicht erneut erstellt. Starten Sie eine neue Sitzung, um sie als Anfangswerte zu übernehmen.

Sicherheitsprofile sind Editor-Vorlagen. Der Profilname wird nicht gespeichert; die einzelnen Sicherheitseinstellungen werden gespeichert und bleiben editierbar.

## Benutzerverzeichnisse und Persistenz

Das Verlinken und Bind-Mounten von Benutzerverzeichnissen schließen sich gegenseitig aus. Beide verwenden ein vorhandenes, beschreibbares lokales MiniOS-Datenmedium und einen sicheren, medienrelativen Pfad. Sie sind nicht verfügbar mit `toram`, `toram=full`, oder `toram=trim`, und MiniOS führt keine automatische Zusammenführung zweier befüllter Verzeichnisbäume durch.

`perchmode` und `perchsize` sind initramfs-Boot-Parameter, keine Einstellungen des MiniOS-Konfigurators. Die neuen Cache-/Log-Speicheroptionen wählen oder erstellen keine `perch`-Sitzung. Der MiniOS-Konfigurator erstellt, entsperrt, vergrößert oder repariert keinen Persistenz-Container. Bei verschlüsselter Persistenz wird angezeigt, ob die initramfs-Verschlüsselungsmarkierung vorhanden ist.

## Speicherverhalten

Die Überprüfung listet nur geänderte Werte auf und schwärzt Passwörter. Beim Speichern werden nur geänderte Schlüssel aktualisiert, während Kommentare, Reihenfolge, unbekannte Schlüssel, Eigentümer, Berechtigungen und erweiterte Attribute erhalten bleiben. Das Schreiben erfolgt atomar.

Die vollständige Referenz zu Variablen und Boot-Parametern finden Sie unter [Konfigurationsdatei](/reference/configuration/config.conf), [Boot-Parameter](/reference/Boot-Parameters), und [live-config](/reference/configuration/live-config).
