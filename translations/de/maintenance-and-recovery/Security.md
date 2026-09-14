---
updated: 2026-09-13
---

# Sicherheit

MiniOS-Sicherheitskontrollen sind auf das Live-System ausgerichtet: temporäre Sitzungen, persistente Sitzungen, Wechseldatenträger und die Konfiguration beim Systemstart. Das MiniOS-Installationsprogramm kann auch eine native Konvertierung durchführen. Das resultierende System behält die gewählte Desktop-Umgebung und die MiniOS-visuelle Identität bei, aber die live-spezifische MiniOS-Software wird entfernt, sodass Sie das System mit den normalen Debian-Werkzeugen absichern und warten können, anstatt es wie einen weiteren Live-Modus zu behandeln.
Schützen Sie die laufende Sitzung, persistente Daten, das Boot-Medium und alle Konfigurationen, die beim Start angewendet werden.

## Mit vertrauenswürdigen Medien beginnen

Laden Sie MiniOS aus einer offiziellen Quelle herunter und überprüfen Sie die ISO, bevor Sie sie schreiben.
Folgen Sie [Downloads verifizieren](/installing-minios/Verifying-Downloads) und vergleichen Sie das Ergebnis, bevor Sie starten oder installieren. Die Verifizierung erkennt beschädigte oder manipulierte Downloads, beweist jedoch nicht, dass ein bereits verändertes USB-Gerät sicher ist.

Behalten Sie das USB-Gerät unter physischer Kontrolle. Firmware-Passwörter und eine eingeschränkte Bootreihenfolge können das unbeabsichtigte Starten durch Unbefugte erschweren, verschlüsseln jedoch keine Dateien auf dem Gerät. Secure Boot kann zusätzlichen Schutz der Boot-Kette bieten, sofern Images und Hardware dies unterstützen; prüfen Sie das tatsächliche Release und das Verhalten der Firmware, anstatt von einer Unterstützung auszugehen.

## Standard-Anmeldedaten ersetzen

Ein nicht angepasstes MiniOS Live-Image verwendet die veröffentlichten Zugangsdaten `live` / `evil` und `root` / `toor`, mit automatischer Anmeldung und passwortlosem administrativen Zugriff in der benutzerfreundlichen Konfiguration. Jeder, der auf das System zugreifen kann, könnte diese Zugangsdaten verwenden, insbesondere wenn SSH aktiv ist.

Vor dem Verbinden mit einem nicht vertrauenswürdigen Netzwerk:

1. Legen Sie eindeutige Benutzer- und Root-Passwörter im MiniOS-Konfigurator fest.
2. Wählen Sie ein passendes Sicherheitsprofil und überprüfen Sie jede ausgefüllte Einstellung.
3. Deaktivieren Sie SSH und XRDP, sofern kein Fernzugriff benötigt wird.
4. Starten Sie nach Änderungen an Einmal-Konten oder Sicherheitseinstellungen eine neue Sitzung und prüfen Sie anschließend das Login- und Berechtigungsverhalten.

Der Konfigurator speichert verschlüsselte Passwort-Hashes statt Klartext-Passwörtern. Wenn ein bereits angelegtes persistentes Konto geändert wird, verwenden Sie `passwd` für den aktuellen Benutzer und `sudo passwd root` für root. Nach der nativen Umstellung nutzen Sie die normalen Debian-Werkzeuge zur Kontoverwaltung.

## Sicherheitskontrollen des Konfigurators verwenden

MiniOS-Konfigurator bietet drei Profile. Ein Profil füllt konkrete Einstellungen aus; der Profilname selbst wird nicht als Laufzeit-Konfigurationsschlüssel gespeichert, und jede Einstellung bleibt unabhängig bearbeitbar.

| Profil | Hauptverhalten |
| --- | --- |
| `convenient` | Autologin-kompatibel, passwortloses sudo und PolicyKit, Root- und Passwort-SSH erlaubt, entspannte XRDP/X11/Anmeldungssperre, Passworthinweise werden angezeigt. |
| `balanced` | Kein Autologin, sudo und PolicyKit erfordern Passwort, SSH-Root-Login verweigert, aber Passwort-SSH erlaubt, gehärtete XRDP/X11/Anmeldungssperre. |
| `strict` | Kein Autologin, sudo und PolicyKit erfordern Passwort, SSH-Root- und Passwort-Login verweigert, XRDP deaktiviert, gehärtete X11/Anmeldungssperre, Passworthinweise werden ausgeblendet. |

Die Standardwerte des Installers unterscheiden sich je nach Bereitstellungsmodus: Live-Installationen bevorzugen `convenient`, während die native Konvertierung von `balanced` ausgeht. Die native Einstellung wird während der Konvertierung angewendet; nach der Installation nutzen Sie die normale Debian-Sicherheitskonfiguration. Dies sind Standardwerte, keine Empfehlungen für jedes Bedrohungsmodell.

Die gleichen Einstellungen sind als dokumentierte Konfigurationsschlüssel verfügbar, darunter `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` und `LIVE_LOCKSCREEN_MODE`. Verwenden Sie bevorzugt diese Schlüssel oder den Konfigurator anstelle der Bearbeitung generierter sudoers-, PolicyKit-, Display-Manager- oder SSH-Dateien. Siehe [Konfigurationsdatei](/reference/configuration/config.conf).
Informationen zum Speichern und zur Anwendbarkeit der Einstellungen finden Sie unter [MiniOS-Konfigurator](/preparing-and-customizing/Preconfiguring-MiniOS).

Kontenerstellung, Passwörter, `LIVE_CONFIG_NOROOT`, und die Sicherheitslage sind einmalige Einstellungen, die beim Erstellen einer neuen Sitzung verwendet werden. Der Konfigurator zeigt die Anwendbarkeit für jede Kontrolle an. Neu konfigurierbare Einstellungen wie Dienste werden nach dem Neustart angewendet.

## Sicherer Fernzugriff

SSH kann in einem MiniOS-Image für Wiederherstellungszwecke aktiviert werden. In einem Netzwerk, in dem anderen Nutzern nicht vertraut wird, sollten Sie davon ausgehen, dass die veröffentlichten Standard-Zugangsdaten bekannt sind, bis Sie das Gegenteil bestätigt haben.

- Falls SSH nicht benötigt wird, fügen Sie `ssh` zu `DISABLE_SERVICES` im Konfigurator hinzu und entfernen Sie es aus `ENABLE_SERVICES` falls vorhanden.
- Falls SSH erforderlich ist, deaktivieren Sie den Root-Login mit `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Bevorzugen Sie die Schlüssel-Authentifizierung. Überprüfen Sie die Anmeldung per Schlüssel in einer separaten Verbindung, bevor Sie `LIVE_SSH_PASSWORD_AUTHENTICATION=false` setzen.
- Beschränken Sie eingehende Verbindungen mit der Netzwerk-Firewall oder dem Router und setzen Sie ein portables Wiederherstellungssystem niemals direkt dem Internet aus.
- Prüfen Sie XRDP separat. Das strikte Profil deaktiviert XRDP, das ausgewogene Profil härtet es ab, deaktiviert den Dienst jedoch nicht zwingend.

Startparameter können die Werte in Konfigurationsdateien überschreiben. Überprüfen Sie unerwartetes Dienstverhalten anhand von [Startparameter](/reference/Boot-Parameters).

## Persistente Daten verschlüsseln

Unverschlüsselte native, DynFileFS-, dynblk-, raw- und SquashFS-Persistenz kann von jeder Person gelesen werden, die Zugriff auf das Gerät erhält. Dynblk ist ein schlankes Kernel-Block-Backend und keine Verschlüsselungsschicht; seine `volumeNNN.db` Sicherungsdateien enthalten gewöhnliche, unverschlüsselte Sitzungsdaten, sofern der zugrunde liegende Speicher nicht separat geschützt ist. Das MiniOS-Installationsprogramm kann einen verschlüsselten LUKS-Container für eine Live-Sitzung einrichten, wenn das Quell-initrd LUKS-Unterstützung bietet. Das initrd erstellt `changes.luks` beim ersten Start und fordert die Passphrase an; das Installationsprogramm erhält oder speichert diese Passphrase nicht.

LUKS-Persistenz schützt die Inhalte, solange der Container geschlossen ist. Sie schützt jedoch keine Daten nach dem Entsperren, keine unverschlüsselten Boot-Dateien, keine außerhalb des Containers kopierten Dateien oder ein natives Root-Dateisystem. LUKS-Sitzungspersistenz ist keine native Root-Verschlüsselung. Verwenden Sie eine starke Passphrase und bewahren Sie ein getestetes Backup auf.

Siehe [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) und [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Updates gezielt anwenden

Aktualisieren Sie die Paket-Metadaten und installieren Sie Debian-Sicherheitsupdates in persistenten Live-Sitzungen mit dem normalen APT-Workflow, sofern dies sinnvoll ist. Änderungen durch APT in einer neuen Live-Sitzung gehen nach einem Neustart verloren. Die Basis-Module SquashFS sind schreibgeschützt, daher ist das Ersetzen der ISO oder Module durch eine neuere, vertrauenswürdige MiniOS-Version oft der sauberste Weg, um das Basissystem zu aktualisieren. Nach der nativen Umwandlung erfolgt die Wartung der Paketsicherheit einfach über den gewohnten Debian-APT-Workflow für das installierte System.

Siehe [Software-Updates](/maintenance-and-recovery/Updating-MiniOS) für die jeweiligen Workflows von APT, Modulen, Images und Kernel.

Vor einem größeren Update:

- Sichern Sie wichtige Dateien und persistente Sitzungen.
- Stellen Sie sicher, dass ausreichend freier Speicherplatz vorhanden ist.
- Vermeiden Sie Unterbrechungen beim Schreiben oder ein Ausschalten des Geräts.
- Starten Sie das System neu und überprüfen Sie die Aktualisierung, bevor Sie das vorherige, funktionierende Medium oder die Sitzung entfernen.

## Behandeln Sie Hooks und Preseeding als Codeausführung

Die `hooks` Boot-Option und live-config Hooks können Dateien vom Root-Dateisystem, vom Boot-Medium oder von einer URL ausführen. Remote-Hooks, modifizierte Medien-Hooks und nicht geprüfte Preseeds können mit Systemrechten laufen. Verwenden Sie nur geprüfte Dateien aus vertrauenswürdigen Quellen, bevorzugen Sie authentifizierte Verteilung und vermeiden Sie Remote-Hooks in unsicheren Netzwerken. Siehe [live-config](/reference/configuration/live-config) für die Ausführungsreihenfolge und unterstützte Speicherorte.

## Medien sicher sichern und außer Betrieb nehmen

Persistenz ist kein Backup. Bewahren Sie eine separate Kopie der Benutzerdaten auf und exportieren oder kopieren Sie Sitzungen, solange sie intakt sind. Testen Sie die Wiederherstellung auf unterschiedlichen Medien.
Fahren Sie das System sauber herunter, bevor Sie beschreibbaren Speicher entfernen, und halten Sie ausreichend freien Speicherplatz für Sitzungsmetadaten und den Betrieb des Dateisystems vor.

Löschen Sie ein Gerät vor der Entsorgung sicher, entsprechend der Speichertechnologie und der Sensibilität der Daten. Allein das Löschen von Dateien oder das Neuformatieren reicht möglicherweise nicht aus, um alte Daten unwiederbringlich zu entfernen.
