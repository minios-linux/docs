# MiniOS Configurator

MiniOS Configurator ist ein grafischer Editor für die MiniOS-`live-config`-Einstellungen. Er validiert Änderungen und schreibt die Konfiguration für einen späteren Systemstart. Das laufende System wird dabei nicht direkt verändert.

## Starten Sie den Konfigurator

Öffnen Sie den MiniOS Configurator über das Anwendungsmenü oder führen Sie aus:

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

Der Konfigurator bearbeitet nur die ausgewählte Datei. Ohne Pfadangabe wird die Laufzeitdatei `/etc/live/config.conf` bearbeitet; die Medium-Datei wird nicht direkt geöffnet. MiniOS synchronisiert neuere Konfigurationen beim Systemstart zwischen dem Laufzeit-Dateisystem und beschreibbaren MiniOS-Medien. Schreibgeschützte Medien können keine Laufzeitänderungen übernehmen, und eine persistente Laufzeitkonfiguration kann unabhängig von der Medium-Kopie bestehen bleiben.

Für eine bestimmte Option haben Kernel-Parameter Vorrang vor Konfigurationsdateien, und Medienkonfigurationen haben Vorrang vor Root-Dateisystem-Konfigurationen. Verwenden Sie `-i`, um erkannte Einstellungen aus der aktuellen Kernel-Befehlszeile im Editor zu überlagern:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Die ausgewählte Datei bleibt das Speicherziel. Unbekannte Kernel-Parameter werden ignoriert.

## Wann Einstellungen wirksam werden

Jedes Steuerelement gibt an, wann es verwendet wird. Das Speichern wendet eine Einstellung niemals auf die aktuelle Sitzung an.

### Nach dem Neustart angewendet

Hostname, Spracheinstellung, Zeitzone, Tastatur, Boot-Ziel, Dienstauswahl, Modulmodus, Benutzerverzeichnis-Medienverwaltung, Debug-Einstellungen und Log-Export werden beim nächsten Systemstart gelesen. Starten Sie das System nach dem Speichern neu, um diese Einstellungen zu übernehmen.

### Nur für eine neue Sitzung verwendet

Kontoerstellung, Benutzer- und Root-Passwörter, `noroot`, Sudo- und PolicyKit-Richtlinien, SSH- und XRDP-Richtlinien, X11-Zugriff, Passwort-Hinweise und Bildschirmsperre sind Einmal-Einstellungen. Eine persistente Sitzung speichert normalerweise abgeschlossene `live-config`-Komponenten unter `/var/lib/live/config/`, sodass das Ändern dieser Werte und ein Neustart derselben Sitzung das Konto oder den Sicherheitsstatus nicht erneut erstellt. Starten Sie eine neue Sitzung, um diese Werte als Anfangseinstellungen zu übernehmen.

Sicherheitsprofile sind Editor-Voreinstellungen. Der Profilname wird nicht gespeichert; die einzelnen Sicherheitseinstellungen werden gespeichert und bleiben bearbeitbar.

## Benutzerverzeichnisse und Persistenz

Das Verlinken und das Bind-Mounten von Benutzerverzeichnissen schließen sich gegenseitig aus. Beide Methoden nutzen ein vorhandenes, beschreibbares lokales MiniOS-Datenträgermedium und einen sicheren, medienrelativen Pfad. Sie stehen nicht zur Verfügung bei `toram`, `toram=full` oder `toram=trim`, und MiniOS führt keine automatische Zusammenführung zweier bereits gefüllter Verzeichnisbäume durch.

`perchmode` und `perchsize` sind Initramfs-Bootparameter, keine Konfigurator-Einstellungen. Der Konfigurator erstellt, entsperrt, vergrößert oder repariert keinen Persistenzcontainer. Bei verschlüsselter Persistenz zeigt er nur an, ob der Initramfs-Verschlüsselungsmarker vorhanden ist.

## Speicherverhalten

Die Überprüfungsliste zeigt nur geänderte Werte und schwärzt Passwörter. Beim Speichern werden nur die geänderten Schlüssel aktualisiert, während Kommentare, Reihenfolge, unbekannte Schlüssel, Besitzrechte, Berechtigungen und erweiterte Attribute erhalten bleiben. Das Schreiben erfolgt atomar.

Die vollständige Referenz zu Variablen und Boot-Parametern finden Sie unter
[Konfigurationsdatei](/configuration/Configuration-File.md),
[Boot-Parameter](/configuration/Boot-Parameters.md) und
[live-config](/configuration/live-config.md).
