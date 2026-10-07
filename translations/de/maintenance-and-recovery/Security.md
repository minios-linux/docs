---
updated: 2026-10-06
---

# Sicherheit

MiniOS-Sicherheitskontrollen sind auf das Live-System ausgerichtet: temporäre Sitzungen, persistente Sitzungen, Wechseldatenträger und Konfigurationen beim Systemstart. Das MiniOS-Installationsprogramm kann auch eine native Konvertierung durchführen. Das resultierende System behält die gewählte Desktop-Umgebung und die MiniOS-visuelle Identität bei, aber die live-spezifische MiniOS-Software wird entfernt. So können Sie das System mit den üblichen Debian-Werkzeugen absichern und warten, anstatt es wie einen weiteren Live-Modus zu behandeln.
Schützen Sie die laufende Sitzung, persistente Daten, das Boot-Medium sowie alle Konfigurationen, die beim Systemstart angewendet werden.

## Mit vertrauenswürdigen Medien beginnen

Laden Sie MiniOS aus einer offiziellen Quelle herunter und überprüfen Sie das ISO, bevor Sie es schreiben.
Folgen Sie [Downloads verifizieren](/installing-minios/Verifying-Downloads) und vergleichen Sie das Ergebnis, bevor Sie booten oder installieren. Die Überprüfung erkennt beschädigte oder ausgetauschte Downloads, beweist jedoch nicht, dass ein bereits verändertes USB-Gerät sicher ist.

Behalten Sie das USB-Gerät unter physischer Kontrolle. Firmware-Passwörter und eine eingeschränkte Boot-Reihenfolge können unbefugtes Booten erschweren, verschlüsseln aber keine Dateien auf dem Gerät. Secure Boot kann zusätzlichen Schutz der Boot-Kette bieten, sofern Image und Hardware dies unterstützen; prüfen Sie das tatsächliche Release und das Verhalten der Firmware, anstatt Unterstützung vorauszusetzen.

## Standard-Anmeldedaten ersetzen

Ein nicht angepasstes MiniOS-Live-Image verwendet die veröffentlichten Anmeldedaten `live` / `evil` und `root` / `toor`, mit automatischer Anmeldung und passwortlosem administrativem Zugriff in der auf Komfort ausgelegten Konfiguration. Jeder, der Zugriff auf das System hat, kann diese Anmeldedaten nutzen – insbesondere, wenn SSH aktiviert ist.

Vor dem Verbinden mit einem nicht vertrauenswürdigen Netzwerk:

1. Legen Sie im MiniOS-Konfigurator eindeutige Benutzer- und Root-Passwörter fest.
2. Wählen Sie ein passendes Sicherheitsprofil und überprüfen Sie jede gesetzte Kontrolle.
3. Deaktivieren Sie SSH und XRDP, sofern kein Fernzugriff benötigt wird.
4. Starten Sie nach Änderungen an Einmal-Konten oder Sicherheitseinstellungen in eine neue Sitzung und prüfen Sie das resultierende Anmelde- und Berechtigungsverhalten.

Der Konfigurator speichert verschlüsselte Passwort-Hashes und keine Klartext-Passwörter. Wenn Sie ein bereits erstelltes persistentes Konto ändern, verwenden Sie `passwd` für den aktuellen Benutzer und `sudo passwd root` für Root. Nach einer nativen Konvertierung verwenden Sie die üblichen Debian-Werkzeuge zur Kontoverwaltung.

## Sicherheitskontrollen im Konfigurator nutzen

Der MiniOS-Konfigurator bietet drei Profile. Ein Profil füllt konkrete Einstellungen aus; der Profilname selbst wird nicht als Laufzeit-Konfigurationsschlüssel gespeichert, und jede Einstellung bleibt unabhängig editierbar.

| Profil | Hauptverhalten |
| --- | --- |
| `convenient` | Autologin-kompatibel, passwortloses sudo und PolicyKit, Root- und Passwort-SSH erlaubt, gelockerte XRDP/X11/Lockscreen-Einstellungen, Passwort-Hinweise werden angezeigt. |
| `balanced` | Kein Autologin, Passwort für sudo und PolicyKit erforderlich, SSH-Root-Login verweigert, aber Passwort-SSH erlaubt, gehärteter XRDP/X11/Lockscreen. |
| `strict` | Kein Autologin, Passwort für sudo und PolicyKit erforderlich, SSH-Root- und Passwort-Login verweigert, XRDP deaktiviert, gehärteter X11/Lockscreen, Passwort-Hinweise ausgeblendet. |

Die Standardwerte des Installers unterscheiden sich je nach Bereitstellungsmodus: Live-Installationen bevorzugen `convenient`, während die native Konvertierung mit `balanced` beginnt. Die native Einstellung wird während der Konvertierung angewendet; nach der Installation nutzen Sie die normale Debian-Sicherheitskonfiguration. Dies sind Standardwerte, keine Empfehlungen für jedes Bedrohungsmodell.

Die gleichen Einstellungen sind als dokumentierte Konfigurationsschlüssel verfügbar, darunter `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, und `LIVE_LOCKSCREEN_MODE`. Verwenden Sie bevorzugt diese Schlüssel oder den Konfigurator, anstatt generierte sudoers-, PolicyKit-, Display-Manager- oder SSH-Dateien direkt zu bearbeiten. Siehe [Konfigurationsdatei](/reference/configuration/config.conf).
Informationen zum Speicherverhalten und zur Gültigkeit von Einstellungen finden Sie unter [MiniOS-Konfigurator](/preparing-and-customizing/Preconfiguring-MiniOS).

Kontoerstellung, Passwörter, `LIVE_CONFIG_NOROOT`, sowie die Sicherheitslage sind Einmal-Einstellungen, die bei der Erstellung einer neuen Sitzung verwendet werden. Der Konfigurator zeigt für jede Kontrolle die Gültigkeit an. Änderbare Einstellungen wie Dienste werden nach einem Neustart angewendet.

## Sicheren Fernzugriff einrichten

SSH kann in einem MiniOS-Image für Wiederherstellungszwecke aktiviert sein. In einem Netzwerk, in dem andere Benutzer nicht vertrauenswürdig sind, gehen Sie davon aus, dass die veröffentlichten Standard-Anmeldedaten bekannt sind, bis Sie das Gegenteil bestätigt haben.

- Wenn SSH nicht benötigt wird, fügen Sie `ssh` zum `DISABLE_SERVICES` im Konfigurator hinzu und entfernen Sie es aus `ENABLE_SERVICES` falls vorhanden.
- Wenn SSH erforderlich ist, verweigern Sie Root-Login mit `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Bevorzugen Sie die Authentifizierung per Schlüssel. Bestätigen Sie die Schlüssel-Anmeldung in einer separaten Verbindung, bevor Sie `LIVE_SSH_PASSWORD_AUTHENTICATION=false` setzen.
- Beschränken Sie eingehende Zugriffe mit der Netzwerk-Firewall oder dem Router und setzen Sie ein portables Wiederherstellungssystem niemals direkt dem Internet aus.
- Überprüfen Sie XRDP separat. Das strikte Profil deaktiviert XRDP; das ausgewogene Profil härtet es, deaktiviert den Dienst jedoch nicht zwingend.

Boot-Parameter können Konfigurationsdatei-Werte überschreiben. Prüfen Sie unerwartetes Dienstverhalten anhand von [Boot-Parameter](/reference/Boot-Parameters).

## Persistente Daten verschlüsseln

Unverschlüsselte native, DynFileFS, DynBlk, VMDK-, Raw- und SquashFS-Persistenz können von jedem gelesen werden, der Zugriff auf das Gerät erhält. MiniOS kann LUKS2 über Raw, DynFileFS, DynBlk oder VMDK schichten. LUKS2 bleibt eine Verschlüsselungsschicht, kein separater Sitzungsmodus. Für die Erstellung beim Booten wählen Sie dies mit `perchencrypt=luks`; bestehende Sitzungen übernehmen ihren Verschlüsselungsstatus aus den Sitzungsmetadaten und nicht aus einem späteren Kommandozeilen-Override.

Die Verschlüsselungsgrenze unterscheidet sich je nach Backend. Raw verschlüsselt das logische Block-Image innerhalb von `changes.img`; DynFileFS verschlüsselt das sichtbare `virtual.dat`; DynBlk und VMDK verschlüsseln das vom DynBlk-Treiber bereitgestellte Blockgerät. Sitzungsmetadaten, Boot-Dateien, Backend-Metadaten und VMDK-Deskriptoren außerhalb des verschlüsselten Blockgeräts sowie nicht zugehörige Dateien auf dem Medium bleiben sichtbar. Die DynBlk-Backend-Komprimierung ist deaktiviert, wenn LUKS2 gewählt wird; VMDK bietet keine Backend-Komprimierung.

Das initrd erstellt das verschlüsselte Dateisystem bei der ersten Verwendung und fordert die Passphrase an; das Installationsprogramm erhält oder speichert diese Passphrase nicht. Beim Booten führen drei abgelehnte Entsperrversuche dazu, dass der Bootvorgang gestoppt wird, anstatt auf Klartext, ein anderes Backend oder einen In-Memory-Ersatz mit derselben Persistenzanforderung zurückzufallen.

Die MiniOS-LUKS2-Persistenzschicht schützt die Dateisysteminhalte, solange der Mapper geschlossen ist. Sie schützt keine Daten nach dem Entsperren, keine unverschlüsselten Boot-Dateien, keine außerhalb des verschlüsselten Backends kopierten Dateien und kein natives Root-Dateisystem. Verschlüsselte Persistenz ist keine native Root-Verschlüsselung. Logische Exporte enthalten entschlüsselte Sitzungsdateien – sichern Sie Backup-Archive daher separat. Verwenden Sie eine starke Passphrase und halten Sie ein getestetes Backup bereit.

Temporärer Cache oder Journal-Speicher dient der Schreibreduktion, nicht der Verschlüsselung. Auch mit `LIVE_LOG_STORAGE=volatile`, speichert MiniOS weiterhin `minios-boot` und `live-config`-Diagnosedaten im dauerhaften Sitzungsbereich. Bei SquashFS liegen diese Dateien außerhalb von `changes.sb`, im Verzeichnis `boot-logs/` der Sitzung. Ein unverschlüsseltes Basisgerät legt sie zusammen mit anderen Dateien offen. `LIVE_CONFIG_DEBUG=true` aktiviert zusätzlich detaillierte Protokolle und Kopien der Benutzerkonten-Zusammenführungen; lassen Sie Debug im Normalbetrieb deaktiviert und prüfen Sie diese Protokolle vor dem Teilen. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Siehe [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) und [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Updates gezielt anwenden

Aktualisieren Sie Paketmetadaten und installieren Sie Debian-Sicherheitsupdates in persistenten Live-Sitzungen mit dem üblichen APT-Workflow, sofern dies angebracht ist. Änderungen durch APT in einer frischen Live-Sitzung gehen beim Neustart verloren. Basis-SquashFS-Module sind schreibgeschützt; daher ist das Ersetzen des ISO oder der Module durch eine neuere, vertrauenswürdige MiniOS-Version oft der sauberste Weg, das Basissystem zu aktualisieren. Nach einer nativen Konvertierung erfolgt die Sicherheitswartung der Pakete wie gewohnt über den Debian-APT-Workflow für das installierte System.

Siehe [Softwareaktualisierungen](/maintenance-and-recovery/Updating-MiniOS) für die jeweiligen Workflows von APT, Modulen, Images und Kernel.

Vor einem größeren Update:

- Sichern Sie wichtige Dateien und persistente Sitzungen.
- Stellen Sie sicher, dass ausreichend freier Speicherplatz vorhanden ist.
- Vermeiden Sie Unterbrechungen beim Schreiben oder das Ausschalten des Geräts.
- Starten Sie neu und prüfen Sie das aktualisierte System, bevor Sie das vorherige, als funktionsfähig bekannte Medium oder die Sitzung verwerfen.

## Hooks und Preseeding als Codeausführung behandeln

Die `hooks`-Boot-Option und live-config-Hooks können Dateien vom Root-Dateisystem, vom Boot-Medium oder von einer URL ausführen. Remote-Hooks, modifizierte Medien-Hooks und nicht geprüfte Preseeds können mit Systemrechten ausgeführt werden. Verwenden Sie nur geprüfte Dateien aus vertrauenswürdigen Quellen, bevorzugen Sie authentifizierte Distributionen und vermeiden Sie Remote-Hooks in unsicheren Netzwerken. Siehe [live-config](/reference/configuration/live-config) für die Ausführungsreihenfolge und unterstützte Speicherorte.

## Medien sicher sichern und ausmustern

Persistenz ist kein Backup. Bewahren Sie eine separate Kopie der Benutzerdaten auf und exportieren oder kopieren Sie Sitzungen, solange sie intakt sind. Testen Sie die Wiederherstellung auf unterschiedlichen Medien.
Fahren Sie das System sauber herunter, bevor Sie beschreibbare Speichermedien entfernen, und halten Sie freien Speicherplatz für Sitzungsmetadaten und Dateisystembetrieb vor.

Löschen Sie ein Gerät vor der Entsorgung sicher, entsprechend der Speichertechnologie und der Sensibilität der Daten. Das Löschen von Dateien oder einfaches Neuformatieren reicht möglicherweise nicht aus, um alte Daten unwiederbringlich zu entfernen.
