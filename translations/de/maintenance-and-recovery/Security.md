---
updated: 2026-08-31
---

# Sicherheit

MiniOS-Sicherheitskontrollen sind auf das Live-System ausgerichtet: temporäre Sitzungen, persistente Sitzungen, Wechseldatenträger und Boot-Konfiguration. Das MiniOS-Installationsprogramm kann außerdem eine native Konvertierung durchführen. Das resultierende System behält die gewählte Desktop-Umgebung und das visuelle Erscheinungsbild von MiniOS bei, aber die live-spezifische MiniOS-Software wird entfernt. Sichern und warten Sie das System daher mit den normalen Debian-Werkzeugen, anstatt es wie einen weiteren Live-Modus zu behandeln.
Schützen Sie die laufende Sitzung, persistente Daten, das Boot-Medium und alle Konfigurationen, die beim Start angewendet werden.

## Beginnen Sie mit vertrauenswürdigen Medien

Laden Sie MiniOS von einer offiziellen Quelle herunter und überprüfen Sie das ISO, bevor Sie es schreiben.
Folgen Sie der Anleitung unter [Downloads verifizieren](/installing-minios/Verifying-Downloads) und vergleichen Sie das Ergebnis, bevor Sie booten oder installieren. Die Verifizierung erkennt beschädigte oder manipulierte Downloads, beweist aber nicht, dass ein bereits modifiziertes USB-Gerät sicher ist.

Behalten Sie das USB-Gerät unter physischer Kontrolle. Firmware-Passwörter und eine eingeschränkte Boot-Reihenfolge können unbefugtes Booten erschweren, verschlüsseln jedoch keine Dateien auf dem Gerät. Secure Boot kann zusätzlichen Schutz für den Boot-Prozess bieten, sofern dies von Image und Hardware unterstützt wird; prüfen Sie das tatsächliche Release und das Verhalten der Firmware, anstatt Unterstützung vorauszusetzen.

## Standard-Anmeldedaten ersetzen

Ein nicht angepasstes MiniOS-Live-Image verwendet die veröffentlichten Zugangsdaten `live` / `evil` und `root` / `toor`, mit automatischer Anmeldung und passwortlosem administrativem Zugriff in der auf Komfort ausgelegten Konfiguration. Jeder, der Zugriff auf das System hat, kann diese Zugangsdaten nutzen, insbesondere wenn SSH aktiviert ist.

Bevor Sie sich mit einem nicht vertrauenswürdigen Netzwerk verbinden:

1. Legen Sie im MiniOS-Konfigurator eindeutige Benutzer- und Root-Passwörter fest.
2. Wählen Sie ein geeignetes Sicherheitsprofil und prüfen Sie jede ausgefüllte Einstellung.
3. Deaktivieren Sie SSH und XRDP, sofern kein Fernzugriff benötigt wird.
4. Starten Sie das System nach Änderungen an einmalig angewendeten Konto- oder Sicherheitseinstellungen neu und wählen Sie dabei eine neue Sitzung. Prüfen Sie anschließend das Anmelde- und Berechtigungsverhalten.

Der Konfigurator speichert verschlüsselte Passwort-Hashes statt Klartextpasswörtern. Wenn Sie ein bereits erstelltes persistentes Konto ändern, verwenden Sie `passwd` für den aktuellen Benutzer und `sudo passwd root` für Root. Nach einer nativen Konvertierung nutzen Sie die normalen Debian-Werkzeuge zur Kontoverwaltung.

## Sicherheitskontrollen des Konfigurators verwenden

Der MiniOS-Konfigurator stellt drei Profile bereit. Ein Profil füllt konkrete Einstellungen; der Profilname selbst wird nicht als Laufzeit-Konfigurationsschlüssel gespeichert, und jede Einstellung bleibt unabhängig bearbeitbar.

| Profil | Hauptverhalten |
| --- | --- |
| `convenient` | Autologin-kompatibel, sudo und PolicyKit ohne Passwort, SSH-Root-Anmeldung und SSH-Passwortauthentifizierung erlaubt, gelockerte XRDP-/X11-/Bildschirmsperren-Einstellungen, Passworthinweise werden angezeigt. |
| `balanced` | Kein Autologin, Passwort für sudo und PolicyKit erforderlich, SSH-Root-Anmeldung verweigert, aber SSH-Passwortauthentifizierung erlaubt, gehärtete XRDP-/X11-/Bildschirmsperren-Einstellungen. |
| `strict` | Kein Autologin, Passwort für sudo und PolicyKit erforderlich, SSH-Root-Anmeldung und SSH-Passwortauthentifizierung verweigert, XRDP deaktiviert, gehärtete X11-/Bildschirmsperren-Einstellungen, Passworthinweise ausgeblendet. |

Die Voreinstellungen des Installationsprogramms unterscheiden sich je nach Bereitstellungsmodus: Live-Installationen bevorzugen `convenient`, während die native Konvertierung mit `balanced` startet. Die native Einstellung wird während der Konvertierung angewendet; nach der Installation verwenden Sie die normale Debian-Sicherheitskonfiguration. Dies sind Standardwerte, keine Empfehlungen für jedes Bedrohungsmodell.

Die gleichen Einstellungen sind als dokumentierte Konfigurationsschlüssel verfügbar, darunter `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` und `LIVE_LOCKSCREEN_MODE`. Verwenden Sie bevorzugt diese Schlüssel oder den Konfigurator anstelle der direkten Bearbeitung generierter sudoers-, PolicyKit-, Display-Manager- oder SSH-Dateien. Siehe [Konfigurationsdatei](/reference/configuration/config.conf).
Informationen zum Speicherverhalten und zur Anwendbarkeit der Einstellungen finden Sie im [MiniOS-Konfigurator](/preparing-and-customizing/Preconfiguring-MiniOS).

Kontoerstellung, Passwörter, `LIVE_CONFIG_NOROOT` und die Sicherheitslage sind Einmal-Einstellungen, die beim Erstellen einer neuen Sitzung verwendet werden. Der Konfigurator zeigt die Anwendbarkeit jeder Kontrolle an. Rekonfigurierbare Einstellungen wie Dienste werden nach einem Neustart angewendet.

## Fernzugriff absichern

SSH kann in einem MiniOS-Image für Wiederherstellungszwecke aktiviert sein. In einem Netzwerk, in dem anderen Nutzern nicht vertraut wird, gehen Sie davon aus, dass die veröffentlichten Standard-Zugangsdaten bekannt sind, bis Sie das Gegenteil bestätigt haben.

- Wenn SSH nicht benötigt wird, fügen Sie `ssh` im Konfigurator zu `DISABLE_SERVICES` hinzu und entfernen Sie es aus `ENABLE_SERVICES`, falls vorhanden.
- Wenn SSH benötigt wird, verweigern Sie Root-Login mit `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Bevorzugen Sie die Authentifizierung per Schlüssel. Testen Sie die Schlüssel-Anmeldung in einer separaten Verbindung, bevor Sie `LIVE_SSH_PASSWORD_AUTHENTICATION=false` setzen.
- Beschränken Sie eingehende Zugriffe mit der Netzwerk-Firewall oder dem Router und setzen Sie ein portables Recovery-System niemals direkt dem Internet aus.
- Prüfen Sie XRDP separat. Das strikte Profil deaktiviert XRDP; das ausgewogene Profil härtet es, deaktiviert aber nicht zwingend den Dienst.

Boot-Parameter können Konfigurationsdatei-Werte überschreiben. Prüfen Sie unerwartetes Dienstverhalten anhand der [Boot-Parameter](/reference/Boot-Parameters).

## Persistente Daten verschlüsseln

Unverschlüsselte native, DynFileFS- und Raw-Persistenz können von jedem gelesen werden, der das Gerät erhält. Das MiniOS-Installationsprogramm kann einen verschlüsselten LUKS-Container für eine Live-Sitzung einrichten, wenn das Quell-initrd LUKS-Unterstützung signalisiert. Das initrd erstellt beim ersten Start `changes.luks` und fragt nach dessen Passphrase; das Installationsprogramm erhält oder speichert diese Passphrase nicht.

LUKS-Persistenz schützt die Inhalte, solange der Container geschlossen ist. Sie schützt nicht die Daten nach dem Entsperren, die unverschlüsselten Boot-Dateien, kopierte Dateien außerhalb des Containers oder ein natives Root-Dateisystem. LUKS-Sitzungspersistenz ist keine native Root-Verschlüsselung. Verwenden Sie eine starke Passphrase und bewahren Sie ein getestetes Backup auf.

Siehe [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) und [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Updates gezielt anwenden

Aktualisieren Sie Paketmetadaten und installieren Sie Debian-Sicherheitsupdates in persistenten Live-Sitzungen mit dem normalen APT-Workflow, wenn dies angebracht ist. Änderungen durch APT in einer frischen Live-Sitzung gehen beim Neustart verloren. Die Basis-SquashFS-Module sind schreibgeschützt, daher ist das Ersetzen der ISO oder der Module durch eine neuere, vertrauenswürdige MiniOS-Version oft der sauberste Weg, das Basissystem zu aktualisieren. Nach einer nativen Konvertierung erfolgt die Wartung der Paketsicherheit einfach über den gewohnten Debian-APT-Workflow für das installierte System.

Siehe [Software-Updates](/maintenance-and-recovery/Updating-MiniOS) für die jeweiligen APT-, Modul-, Image- und Kernel-Workflows.

Vor einem größeren Update:

- Sichern Sie wichtige Dateien und persistente Sitzungen.
- Stellen Sie sicher, dass ausreichend freier Speicherplatz vorhanden ist.
- Vermeiden Sie Unterbrechungen beim Schreiben oder das Ausschalten des Geräts.
- Starten Sie neu und überprüfen Sie das aktualisierte System, bevor Sie das vorherige, als funktionsfähig bekannte Medium oder die Sitzung verwerfen.

## Hooks und Preseeding als Codeausführung behandeln

Die Boot-Option `hooks` und live-config-Hooks können Dateien vom Root-Dateisystem, vom Boot-Medium oder von einer URL ausführen. Remote-Hooks, modifizierte Medien-Hooks und nicht geprüfte Preseeds können mit Systemrechten laufen. Verwenden Sie nur geprüfte Dateien aus vertrauenswürdigen Quellen, bevorzugen Sie authentifizierte Verteilung und vermeiden Sie Remote-Hooks in unsicheren Netzwerken. Siehe [live-config](/reference/configuration/live-config) für die Ausführungsreihenfolge und unterstützte Speicherorte.

## Medien sicher sichern und ausmustern

Persistenz ist kein Backup. Bewahren Sie eine separate Kopie der Benutzerdaten auf und exportieren oder kopieren Sie Sitzungen, solange sie intakt sind. Testen Sie die Wiederherstellung auf anderen Medien.
Fahren Sie das System sauber herunter, bevor Sie beschreibbare Speichermedien entfernen, und halten Sie ausreichend freien Speicher für Sitzungsmetadaten und Dateisystembetrieb vor.

Löschen Sie vor der Entsorgung eines Geräts alle Daten darauf sicher entsprechend der Speichertechnologie und der Sensibilität der Daten. Das bloße Löschen von Dateien oder Neuformatieren reicht nicht aus, um alte Daten unwiederbringlich zu entfernen.
