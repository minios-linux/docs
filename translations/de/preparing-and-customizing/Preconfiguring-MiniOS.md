---
updated: 2026-08-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Vorkonfiguration von MiniOS

Der MiniOS ist ein grafischer Editor für MiniOS-`live-config`-Einstellungen. Er prüft Änderungen und schreibt die Konfiguration für einen späteren Systemstart. Das laufende System wird dabei nicht direkt verändert.

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

Der MiniOS bearbeitet nur die ausgewählte Datei. Ohne Pfadangabe wird die Laufzeitdatei `/etc/live/config.conf` bearbeitet; die Medium-Datei wird nicht direkt geöffnet. MiniOS synchronisiert neuere Konfigurationen beim Systemstart zwischen dem Laufzeit-Dateisystem und beschreibbaren MiniOS-Medien. Schreibgeschützte Medien können keine Laufzeitänderungen übernehmen, und eine persistente Laufzeitkonfiguration kann unabhängig von der Medienkopie bestehen bleiben.

Für eine bestimmte Option haben Kernel-Parameter Vorrang vor Konfigurationsdateien, und Medienkonfiguration hat Vorrang vor Root-Dateisystem-Konfiguration.
Verwenden Sie `-i`, um im Editor erkannte Einstellungen von der aktuellen Kernel-Befehlszeile zu überlagern:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Das ausgewählte Ziel bleibt die Speicherdatei. Unbekannte Kernel-Parameter werden ignoriert.

## Wann Einstellungen angewendet werden

Jede Steuerung gibt an, wann sie verwendet wird. Das Speichern wendet eine Einstellung niemals auf die aktuelle Sitzung an.

### Nach dem Neustart angewendet

Hostname, Spracheinstellungen, Zeitzone, Tastatur, Boot-Ziel, Dienstauswahl, Modulauswahl, Handhabung von Benutzerverzeichnissen auf Medien, Debug-Einstellungen und Log-Export werden beim nächsten Systemstart gelesen. Starten Sie nach dem Speichern neu, um diese Einstellungen zu übernehmen.

### Nur für eine neue Sitzung verwendet

Kontoerstellung, Benutzer- und Root-Passwörter, `noroot`, Sudo- und PolicyKit-Richtlinien, SSH- und XRDP-Richtlinien, X11-Zugriff, Passwort-Hinweise und Bildschirmsperre sind Einmal-Einstellungen. Eine persistente Sitzung zeichnet abgeschlossene `live-config`-Komponenten normalerweise unter `/var/lib/live/config/` auf, sodass das Ändern dieser Werte und ein Neustart derselben Sitzung das Konto oder den Sicherheitsstatus nicht erneut erstellt. Starten Sie eine neue Sitzung, um diese Werte als Anfangseinstellungen zu übernehmen.

Sicherheitsprofile sind Editor-Voreinstellungen. Der Profilname wird nicht gespeichert; die einzelnen Sicherheitseinstellungen werden gespeichert und bleiben editierbar.

## Benutzerverzeichnisse und Persistenz

Das Verlinken und Einbinden (Bind Mount) von Benutzerverzeichnissen schließen sich gegenseitig aus. Beide Methoden nutzen ein vorhandenes, beschreibbares lokales MiniOS-Datenmedium und einen sicheren, medienrelativen Pfad. Sie stehen nicht zur Verfügung mit `toram`, `toram=full` oder `toram=trim`, und MiniOS führt keine automatische Zusammenführung zweier bereits gefüllter Verzeichnisbäume durch.

`perchmode` und `perchsize` sind Initramfs-Bootparameter, keine Einstellungen des MiniOS-Konfigurators. Der MiniOS-Konfigurator erstellt, entsperrt, vergrößert oder repariert keinen Persistenzcontainer. Bei verschlüsselter Persistenz wird lediglich angezeigt, ob der Initramfs-Verschlüsselungsmarker vorhanden ist.

## Speicherverhalten

Die Überprüfung listet nur geänderte Werte auf und schwärzt Passwörter. Beim Speichern werden nur geänderte Schlüssel aktualisiert, während Kommentare, Reihenfolge, unbekannte Schlüssel, Eigentümer, Berechtigungen und erweiterte Attribute erhalten bleiben. Das Schreiben erfolgt atomar.

Die vollständige Referenz zu Variablen und Boot-Parametern finden Sie unter [Konfigurationsdatei](/reference/configuration/config.conf), [Boot-Parameter](/reference/Boot-Parameters) und [live-config](/reference/configuration/live-config).
