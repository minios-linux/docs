---
updated: 2026-10-15
program_commits:
    minios-configurator: 7705e764f152d2d2ae2268ce3ddde7e0adbad8bc
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

### Wirksam nach Neustart

Hostname, Spracheinstellung, Zeitzone, Tastatur, Boot-Ziel, Dienstauswahl, Modus für Module, Medienverwaltung im Benutzerverzeichnis, Debug-Einstellungen, Log-Export und die drei erweiterten Speicheroptionen werden beim nächsten Start eingelesen. Starten Sie nach dem Speichern neu, um diese Einstellungen zu übernehmen.

Im **Erweitert**, **Modus für Module** werden `simple` oder `merged` akzeptiert. Wenn `LIVE_MODULE_MODE` in der gewählten Konfiguration fehlt, zeigt der aktuelle MiniOS-Konfigurator `merged` als wirksamen Standard an. Im Merged-Modus aktualisiert live-config Benutzer, Caches und Paketstatus, sodass die Konfiguration aus dem Modul-Stack in das laufende Live-System integriert wird.

Im **Erweitert**, **Systemprotokoll-Speicher**, **APT-Download-Cache**, und **Browser-Cache** bieten jeweils `persistent` (Standard) oder `volatile`. Sie werden nach erfolgreicher Aktivierung der Persistenz angewendet, einschließlich einer beschreibbaren RAM-kopierten Sitzung mit geschützter Ursprungsinformation. Bei dauerhafter Persistenz bleiben MiniOS-Bootdiagnose, APT-Paketstatus und Browser-Profile auf dem Speicher erhalten; nur ausgewählte Protokolle und Caches werden auf begrenzte RAM verschoben. Bei einer RAM-kopierten Sitzung muss der erhaltene Zustand dennoch erfolgreich gespeichert werden. Für APT- und Browser-RAM-Caches sind mindestens 1 GiB verfügbarer Speicher und kein nicht-zRAM-Swap erforderlich. Die Browser-Einrichtung erfolgt nach der Benutzererstellung. Der Konfigurator warnt, wenn das initrd die erforderliche `perch-storage-v1` Markierung nicht enthält. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für die festen RAM-Grenzwerte.

### Nur für eine neue Sitzung verwendet

Benutzerkonto-Erstellung, Benutzer- und Root-Passwörter, `noroot`, Sudo- und PolicyKit-Richtlinien, SSH- und XRDP-Richtlinien, X11-Zugriff, Passwort-Hinweise und Bildschirmsperre sind Einmal-Einstellungen. Eine persistente Sitzung speichert abgeschlossene `live-config`-Komponenten unter `/var/lib/live/config/`, daher werden durch das Ändern dieser Werte und einen Neustart derselben Sitzung das Konto oder der Sicherheitsstatus nicht erneut erstellt. Starten Sie eine neue Sitzung, um sie als Anfangswerte zu übernehmen.

Sicherheitsprofile sind Editor-Vorlagen. Der Profilname wird nicht gespeichert; die einzelnen Sicherheitseinstellungen werden gespeichert und bleiben editierbar.

## Benutzerverzeichnisse und Persistenz

Das Verlinken und das Bind-Mounten von Benutzerverzeichnissen schließen sich gegenseitig aus. Beide Methoden nutzen ein vorhandenes, beschreibbares lokales MiniOS-Speichermedium sowie einen sicheren, medienrelativen Pfad. Sie stehen nicht zur Verfügung mit `toram`, `toram=full`, oder `toram=trim`, oder während eine aktive Persistenzsitzung LUKS-verschlüsselt ist. Auch das Zurückkopieren ist bei einer verschlüsselten Sitzung blockiert. MiniOS führt keine automatische Zusammenführung zweier bereits befüllter Verzeichnisbäume durch.

`perchmode` und `perchsize` sind initramfs-Boot-Parameter, keine MiniOS-Konfigurator-Einstellungen. Die neuen Steuerungen für Cache-/Log-Speicher wählen oder erstellen keine `perch`-Sitzung. Der MiniOS-Konfigurator erstellt, entsperrt, vergrößert oder repariert keinen Persistenzcontainer. Bei verschlüsselter Persistenz zeigt er an, ob der Initramfs-Verschlüsselungsmarker vorhanden ist.

## Speicherverhalten

Die Überprüfung listet nur geänderte Werte auf und schwärzt Passwörter. Beim Speichern werden nur geänderte Schlüssel aktualisiert, während Kommentare, Reihenfolge, unbekannte Schlüssel, Eigentümer, Berechtigungen und erweiterte Attribute erhalten bleiben. Das Schreiben erfolgt atomar.

Die vollständige Referenz zu Variablen und Boot-Parametern finden Sie unter [Konfigurationsdatei](/reference/configuration/config.conf), [Boot-Parameter](/reference/Boot-Parameters), und [live-config](/reference/configuration/live-config).
