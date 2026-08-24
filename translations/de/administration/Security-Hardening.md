# Härtung der Sicherheit

MiniOS kann als Live-Wiederherstellungssystem, als persistentes portables System oder als native Installation betrieben werden. Die passenden Schutzmaßnahmen hängen von der jeweiligen Nutzung ab. Schützen Sie die laufende Sitzung, persistente Daten, das Boot-Medium sowie alle Konfigurationen, die beim Start angewendet werden.

## Mit vertrauenswürdigen Medien beginnen

Laden Sie MiniOS nur aus einer offiziellen Quelle herunter und verifizieren Sie das ISO, bevor Sie es schreiben. Folgen Sie [Downloads verifizieren](/installation/Verifying-Downloads.md) und vergleichen Sie das Ergebnis, bevor Sie booten oder installieren. Die Verifizierung erkennt beschädigte oder ausgetauschte Downloads, beweist jedoch nicht, dass ein bereits modifiziertes USB-Gerät sicher ist.

Behalten Sie das USB-Gerät unter physischer Kontrolle. Firmware-Passwörter und eine eingeschränkte Boot-Reihenfolge können unbefugtes Booten erschweren, verschlüsseln jedoch keine Dateien auf dem Gerät. Secure Boot kann zusätzlichen Schutz für die Boot-Kette bieten, sofern Image und Hardware dies unterstützen; prüfen Sie das tatsächliche Release und das Firmware-Verhalten, anstatt Unterstützung vorauszusetzen.

## Standard-Zugangsdaten ersetzen

Ein nicht angepasstes MiniOS-Live-Image verwendet die veröffentlichten Zugangsdaten `live` /
`evil` und `root` / `toor`, mit automatischer Anmeldung und passwortlosem administrativen Zugriff in der benutzerfreundlichen Standardkonfiguration. Jeder, der Zugriff auf das System erhält, kann diese Zugangsdaten nutzen, insbesondere wenn SSH aktiviert ist.

Vor dem Verbinden mit einem nicht vertrauenswürdigen Netzwerk:

1. Legen Sie im MiniOS Configurator individuelle Benutzer- und Root-Passwörter fest.
2. Wählen Sie ein passendes Sicherheitsprofil und prüfen Sie jede aktivierte Einstellung.
3. Deaktivieren Sie SSH und XRDP, sofern kein Fernzugriff benötigt wird.
4. Starten Sie eine neue Sitzung, wenn Einmal-Einstellungen für Konten oder Sicherheit geändert wurden, und prüfen Sie anschließend das Anmelde- und Berechtigungsverhalten.

Der Configurator speichert verschlüsselte Passwort-Hashes, nicht die Klartext-Passwörter. Wenn Sie ein bereits erstelltes persistentes oder natives Konto ändern, verwenden Sie `passwd` für den aktuellen Benutzer und `sudo passwd root` für Root.

## Sicherheitskontrollen im Configurator nutzen

Der MiniOS Configurator bietet drei Profile. Ein Profil füllt konkrete Einstellungen aus; der Profilname selbst wird nicht als Laufzeit-Konfigurationsschlüssel gespeichert, und jede Einstellung bleibt einzeln bearbeitbar.

| Profil | Hauptverhalten |
| --- | --- |
| `convenient` | Autologin-kompatibel, passwortloses sudo und PolicyKit, Root- und Passwort-SSH erlaubt, entspanntes XRDP/X11/Sperrbildschirm, Passworthinweise werden angezeigt. |
| `balanced` | Kein Autologin, sudo und PolicyKit erfordern Passwort, SSH-Root-Login verweigert, aber Passwort-SSH erlaubt, gehärtetes XRDP/X11/Sperrbildschirm. |
| `strict` | Kein Autologin, sudo und PolicyKit erfordern Passwort, SSH-Root- und Passwort-Login verweigert, XRDP deaktiviert, gehärtetes X11/Sperrbildschirm, Passworthinweise ausgeblendet. |

Die Standardwerte des Installers unterscheiden sich je nach Installationsmodus: Live-Installationen bevorzugen `convenient`, während native Installationen `balanced` bevorzugen. Dies sind Vorgaben, keine Empfehlungen für jedes Bedrohungsmodell.

Die gleichen Einstellungen sind als dokumentierte Konfigurationsschlüssel verfügbar, darunter `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` und `LIVE_LOCKSCREEN_MODE`. Verwenden Sie bevorzugt diese Schlüssel oder den Configurator, anstatt generierte sudoers-, PolicyKit-, Display-Manager- oder SSH-Dateien direkt zu bearbeiten. Siehe [Konfigurationsdatei](/configuration/Configuration-File.md).
Weitere Informationen zum Speichern und zur Anwendbarkeit von Einstellungen finden Sie unter [MiniOS Configurator](/configuration/MiniOS-Configurator.md).

Kontoerstellung, Passwörter, `LIVE_CONFIG_NOROOT` und die Sicherheitslage sind Einmal-Einstellungen, die beim Erstellen einer neuen Sitzung verwendet werden. Der Configurator zeigt für jede Einstellung die Anwendbarkeit an. Wieder konfigurierbare Einstellungen wie Dienste werden nach einem Neustart angewendet.

## Fernzugriff absichern

SSH kann in einem MiniOS-Image für Wiederherstellungszwecke aktiviert sein. In einem Netzwerk, in dem anderen Nutzern nicht vertraut wird, gehen Sie davon aus, dass die veröffentlichten Standard-Zugangsdaten bekannt sind, bis Sie das Gegenteil bestätigt haben.

- Wenn SSH nicht benötigt wird, fügen Sie `ssh` zu `DISABLE_SERVICES` im Configurator hinzu und entfernen Sie es aus `ENABLE_SERVICES`, falls vorhanden.
- Falls SSH erforderlich ist, verweigern Sie Root-Login mit `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Bevorzugen Sie die Authentifizierung per Schlüssel. Testen Sie die Schlüssel-Anmeldung in einer separaten Verbindung, bevor Sie `LIVE_SSH_PASSWORD_AUTHENTICATION=false` setzen.
- Beschränken Sie eingehende Zugriffe über die Netzwerk-Firewall oder den Router und setzen Sie ein portables Wiederherstellungssystem nicht direkt dem Internet aus.
- Prüfen Sie XRDP separat. Das strikte Profil deaktiviert XRDP; das ausgewogene Profil härtet es, deaktiviert aber nicht zwingend den Dienst.

Boot-Parameter können Werte aus der Konfigurationsdatei überschreiben. Prüfen Sie unerwartetes Dienstverhalten anhand der [Boot-Parameter](/configuration/Boot-Parameters.md).

## Persistente Daten verschlüsseln

Unverschlüsselte native, DynFileFS- und Raw-Persistenz können von jedem gelesen werden, der das Gerät in die Hände bekommt. Der MiniOS Installer kann für eine Live-Sitzung einen verschlüsselten LUKS-Container einrichten, wenn das Quell-initrd LUKS-Unterstützung anbietet. Das initrd erstellt beim ersten Start `changes.luks` und fragt nach dessen Passphrase; der Installer erhält oder speichert diese Passphrase nicht.

LUKS-Persistenz schützt die Inhalte, solange der Container geschlossen ist. Sie schützt keine Daten nach dem Entsperren, keine unverschlüsselten Boot-Dateien, keine außerhalb des Containers kopierten Dateien und kein natives Root-Dateisystem. LUKS-Sitzungspersistenz ist keine native Root-Verschlüsselung. Verwenden Sie eine starke Passphrase und halten Sie ein getestetes Backup bereit.

Siehe [MiniOS Installer](/installation/MiniOS-Installer.md) und [Sitzungsverwaltung](/configuration/Session-Management.md).

## Updates gezielt anwenden

Aktualisieren Sie die Paket-Metadaten und installieren Sie Debian-Sicherheitsupdates in persistenten Live-Sitzungen oder nativen Installationen über den normalen APT-Workflow. Änderungen durch APT in einer frischen Live-Sitzung gehen beim Neustart verloren. Basis-SquashFS-Module sind schreibgeschützt, daher ist das Ersetzen des ISO oder der Module durch eine neuere, vertrauenswürdige MiniOS-Version oft der sauberste Weg, das Basissystem zu aktualisieren.

Siehe [Software-Updates](/administration/Software-Updates.md) für die getrennten Workflows zu APT, Modulen, Images und Kernel.

Vor einem größeren Update:

- Sichern Sie wichtige Dateien und persistente Sitzungen.
- Stellen Sie sicher, dass ausreichend freier Speicherplatz vorhanden ist.
- Vermeiden Sie Unterbrechungen beim Schreiben oder das Ausschalten des Geräts.
- Starten Sie neu und prüfen Sie das aktualisierte System, bevor Sie das bisher bekannte, funktionierende Medium oder die Sitzung verwerfen.

## Hooks und Preseeding als Code-Ausführung behandeln

Die Boot-Option `hooks` und live-config-Hooks können Dateien vom Root-Dateisystem, vom Boot-Medium oder von einer URL ausführen. Remote-Hooks, modifizierte Medien-Hooks und ungeprüfte Preseeds können mit Systemrechten ausgeführt werden. Verwenden Sie nur geprüfte Dateien aus vertrauenswürdigen Quellen, bevorzugen Sie authentifizierte Verteilung und vermeiden Sie Remote-Hooks in unsicheren Netzwerken. Siehe [live-config](/configuration/live-config.md) für die Ausführungsreihenfolge und unterstützte Speicherorte.

## Medien sicher sichern und ausmustern

Persistenz ist kein Backup. Halten Sie eine separate Kopie Ihrer Benutzerdaten bereit und exportieren oder kopieren Sie Sitzungen, solange sie intakt sind. Testen Sie die Wiederherstellung auf unterschiedlichen Medien. Fahren Sie das System sauber herunter, bevor Sie beschreibbare Datenträger entfernen, und halten Sie ausreichend freien Speicherplatz für Sitzungsmetadaten und Dateisystemoperationen vor.

Bevor Sie ein Gerät entsorgen, löschen Sie es sicher entsprechend der Speichertechnologie und der Sensibilität der Daten. Das bloße Löschen von Dateien oder Neuformatieren reicht oft nicht aus, um alte Daten unwiederbringlich zu entfernen.
