---
updated: 2026-10-15
---

# Fehlerbehebung

Beginnen Sie mit Beobachtung und reversiblen Tests. Partitionieren, formatieren, reparieren Sie kein Dateisystem, löschen Sie keine Sitzung und ersetzen Sie keine Boot-Dateien nur, um zu prüfen, ob es hilft. Sichern Sie zuerst wichtige Daten.

## Erste Überprüfungen

1. [Heruntergeladene Abbilddatei verifizieren](/installing-minios/Verifying-Downloads).
2. Starten Sie **Ohne Speichern starten**. Wenn das Problem verschwindet, untersuchen Sie die persistente Sitzung oder deren Konfiguration statt des Basis-Abbilds.
3. Entfernen Sie benutzerdefinierte Boot-Parameter und Modulfiter, sofern sie nicht zur Reproduktion des Problems erforderlich sind.
4. Probieren Sie einen anderen USB-Anschluss und, wenn möglich, ein anderes bekannt funktionierendes Gerät oder einen anderen Computer.
5. Notieren Sie den ersten Fehler und den exakten Eintrag im Boot-Menü, nicht nur die zuletzt angezeigte Meldung.
6. Prüfen Sie [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility) , wenn dasselbe verifizierte Abbild auf einem Rechner fehlschlägt, aber auf einem anderen funktioniert.

## Das Gerät erreicht das MiniOS Boot-Menü nicht

Ermitteln Sie zuerst, wie das MiniOS-Gerät erstellt wurde.

- Bei einem roh geschriebenen Abbild (`dd`, Etcher, Rufus DD-Modus oder Laufwerksprogramm-Abbildschreiben) reparieren Sie keine einzelnen Boot-Dateien. Ist die Kopie beschädigt, schreiben Sie das gesamte Gerät aus einem verifizierten Abbild neu.
- Bei einer dateibasierten MiniOS-Installation erstellen Sie das bootfähige Layout mit derselben dokumentierten Installationsmethode neu, anstatt GRUB-, Syslinux- oder EFI-Dateien aus einer anderen Version zu kopieren.
- Ventoy besitzt eigenen Bootloader und eigenes Layout. Installieren Sie keinen MiniOS-Bootloader über ein Ventoy-Gerät; verwenden Sie stattdessen das [Ventoy](/installing-minios/installation-tools/Ventoy)-Verfahren.
- Nach einer nativen Konvertierung verwendet das Ziel einen konventionellen Debian-Bootloader und ein Standard-Dateisystemlayout. Die MiniOS-Desktop-Oberfläche kann erhalten bleiben, aber die MiniOS-Live-Infrastruktur und live-spezifische Werkzeuge sind nicht mehr vorhanden. Sichern Sie wiederherstellbare Daten, bevor Sie die Debian-Bootloader-Reparatur oder Neuinstallation entsprechend BIOS/UEFI und Partitionierung durchführen.

Wenn ein neu erstelltes Gerät weiterhin nicht im Firmware-Boot-Menü erscheint, prüfen Sie den Firmware-Modus, Secure-Boot-Unterstützung der gewählten Architektur, USB-Anschluss/-Gerät und [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility).

## Das MiniOS Boot-Menü erscheint, aber der Start schlägt fehl

Entfernen Sie zuerst optionale Parameter. Verwenden Sie `debug` und `timing` , wenn mehr Ausgaben während des frühen Bootvorgangs benötigt werden. `rd.break` dient zur erweiterten initramfs-Analyse, nicht zur Reparatur.

Wenn MiniOS seine Quelle nicht findet, siehe [Systemerkennung](/reference/boot-process/System-Discovery). In einer initramfs-Shell sind folgende schreibgeschützte Informationen hilfreich:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Ein temporäres `from=askdisk` kann helfen, das Gerät zu identifizieren, das tatsächlich MiniOS-Daten enthält. Danach verwenden Sie die dokumentierte `from=`-Syntax, anstatt Gerätenamen zu raten.

Für PXE- oder HTTP-ISO-Start siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). Netzwerk im frühen Boot ist unabhängig vom NetworkManager der laufenden Sitzung.

### Modul- oder Root-Union-Fehler

Siehe [Modul-Ladevorgang](/reference/boot-process/Module-Loading) für die tatsächlichen Regeln zur Modulauswahl und -reihenfolge. Insbesondere gilt:

- `load=` und `noload=` können essentielle Basis- oder Kernelmodule ausschließen; `noload=` gewinnt, wenn beide zutreffen;
- Kandidaten mit demselben Basisnamen belegen denselben Ersetzungsplatz;
- eine `.sb`-Dateiendung beweist nicht, dass die Datei ein gültiges SquashFS-Abbild ist;
- der laufende Kernel muss zum abgestimmten MiniOS-Kernelmodul und den Boot-Dateien passen.

Nach erfolgreichem Booten inspizieren Sie den aktuellen Zustand, ohne ihn zu verändern:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Anzeigeprobleme

Bei schwarzem Bildschirm, unbrauchbarer Auflösung oder einer Endlosschleife des Display-Managers:

1. Probieren Sie den `text` Boot-Parameter. Eine funktionierende Konsole grenzt Grafik- oder Desktop-Probleme von einem früheren Boot-Fehler ab.
2. Entfernen Sie manuell angegebene `xorg-driver` oder `xorg-resolution` Parameter.
3. Testen Sie **Ohne Speichern starten** um eine persistente Anzeige-Konfiguration auszuschließen.
4. Notieren Sie GPU und Treiber mit `lspci -nnk`.
5. Überprüfen Sie `journalctl -b -p warning` und `dmesg --level=err,warn`.

Für virtuelle Maschinen siehe [Virtualisierung](/maintenance-and-recovery/Virtualization).

In Debian 13 / Devuan Excalibur XFCE-Images bietet **Anzeigeeinstellungen** eine **Skalierung der Benutzeroberfläche**-Steuerung mit automatischen und manuellen Prozentwerten. Automatisch folgt dem primären Display; ein gespeicherter expliziter Wert überschreibt dies. Nutzen Sie die zeitgesteuerte Vorschau und Bestätigung, anstatt Ausgaberesolution und Skalierung der Oberfläche als identische Einstellung zu behandeln. Fenstereffekte und der Renderer werden separat unter **Fensterverwaltung → Kompositor** konfiguriert.`xfwm4-gl` Bei Ausfall von OpenGL wird auf XRender zurückgegriffen; Unschärfe und Magic Lamp benötigen OpenGL, während Überblendungen/Skalierungsanimationen und Peek auch mit XRender funktionieren.

## Netzwerkprobleme

Normale kabelgebundene und WLAN-Verbindungen werden über NetworkManager verwaltet; siehe [Netzwerk](/using-minios/Networking).

Ermitteln Sie zuerst, ob das Interface existiert:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Wenn kein Interface vorhanden ist, notieren Sie `lspci -nnk` oder `lsusb` und suchen Sie nach Firmware- oder Treiberfehlern in `dmesg`.
- Existiert das Interface, aber es gibt keine Adresse, unterscheiden Sie Verbindungs-/DHCP-Probleme von fehlender Hardware-Unterstützung.
- Existiert eine Adresse, testen Sie das Gateway, dann eine IP-Adresse und anschließend einen DNS-Namen, um Link-, Routing- und DNS-Fehler zu unterscheiden.
- Der Boot-Parameter `ip=` gehört zum frühen Netzwerk-Boot und konfiguriert keine persistente NetworkManager-Verbindung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

## Persistenzprobleme

Starten Sie **Ohne Speichern starten** , bevor Sie einen verdächtigen Persistenzspeicher verändern. Reparieren oder löschen Sie keine einzige Sitzungskopie, solange sie aktiv ist.

Prüfen Sie, was MiniOS aktuell erkennt:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Überprüfen Sie den gewählten Boot-Modus, verfügbaren Schreibplatz, Dateisystem- und Sitzungs-Kompatibilität. Die detaillierten Auswahlregeln finden Sie unter [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) und [Persistenz-Interna](/reference/boot-process/Persistence-Internals).

Ist eine wichtige, nicht laufende `native`, `dynfilefs`, `dynblk`, `vmdk`- oder `raw`-Sitzung noch lesbar, auch in verschlüsselter Form, die entsperrt werden kann, exportieren Sie sie **bevor** Sie mit dem Speicher experimentieren:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Kann der Sitzungsmanager die Sitzung weder lesen noch exportieren, beenden Sie alle Schreibvorgänge auf die Quelle und sichern Sie eine Offline-Kopie des betroffenen Speichers, bevor Sie fortfahren. Bei einer getrennten DynBlk-Sitzung bieten `dynblk inspect /path/to/volume000.db --metadata-only` und `dynblk check /path/to/volume000.db` schreibgeschützte Formatdiagnosen; führen Sie diese nicht auf einem noch eingebundenen Volume aus. MiniOS definiert kein universelles manuelles Verfahren zum Wiederaufbau von DynFileFS-Segmenten, zur Rekonstruktion von DynBlk-Backings, zur Reparatur eines inneren Dateisystems oder zur Wiederherstellung von Sitzungsmetadaten. Eine solche Wiederherstellung ist dateisystem-/container-spezifisch und sollte nur an einer Kopie erfolgen, wenn der Wert der Daten dies rechtfertigt.

Siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) für unterstützte Backup- und Sitzungsimport-Workflows.

### Ventoy Persistence-Plugin

Wenn der Session Manager meldet, dass er mit dem Ventoy Persistence-Plugin nicht verfügbar ist, handelt es sich um das erwartete Einzel-Image-Modell und nicht um fehlende Sitzungsmetadaten. Wählen Sie einen anderen Backend-Typ in Ventoy aus oder starten Sie ohne ausgewähltes Plugin-Image, um nummerierte MiniOS Sitzungen zu verwenden. Ein nicht verfügbarer oder nicht ext4-kompatibler Backend, ein anderes aufgezeichnetes Union-Format oder eine fehlgeschlagene Aktivierung des beschreibbaren Modus führt dazu, dass MiniOS eine Warnung ausgibt und in RAM fortfährt. Prüfen Sie`/run/initramfs/minios-persistence/boot-state` die Startmeldungen und Warnungen; erstellen Sie `session.conf` nicht manuell im Plugin-Image. Siehe [Ventoy](/installing-minios/installation-tools/Ventoy).

## Speicher- und Platzprobleme

Geräte und Mounts überprüfen, ohne Änderungen vorzunehmen:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Ein volles Dateisystem kann zu fehlgeschlagenen Paketoperationen, unvollständigen Sitzungs-Speicherungen und weiteren Folgefehlern führen. Schaffen Sie Speicherplatz, indem Sie bekannte Daten verschieben oder löschen – aber nur, nachdem Sie das richtige Dateisystem bestätigt haben. Verwenden Sie für das Löschen von Sitzungen den MiniOS-Sitzungsmanager, anstatt nummerierte Sitzungsverzeichnisse manuell zu entfernen.

Falls `LIVE_APT_CACHE=volatile`, prüfen Sie auch `findmnt -T /var/cache/apt/archives` und `df -h /var/cache/apt/archives`: Der Archivbereich ist ein begrenztes RAM-Dateisystem, und ein großer Download kann diesen Bereich füllen, auch wenn auf dem USB-Gerät noch freier Speicherplatz vorhanden ist. Mit `LIVE_LOG_STORAGE=volatile`, hat das normale `/var/log` ein separates Limit von 32 MiB für RAM. Wenn einer der Bereiche voll ist, führt das nicht dazu, dass MiniOS diese Dateien automatisch auf das USB-Gerät schreibt. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Die Reparatur eines Dateisystems ist keine allgemeine MiniOS-Operation. Ist das Dateisystem selbst beschädigt, sollten Sie es aushängen, wichtige Daten oder ein Abbild sichern und anschließend ein passendes Reparaturverfahren für dieses Dateisystem und das Speichermedium anwenden.

## Paketänderungen und Systemaktualisierungen

Falls nach Änderungen an APT-Paketen Probleme aufgetreten sind, beachten Sie, dass eine Live-Persistenz-Sitzung Dateien aus den schreibgeschützten MiniOS-Modulen überschreiben kann. Testen Sie **Ohne Speichern starten** um mit dem ursprünglichen Modulsatz zu vergleichen. Weitere Informationen finden Sie unter [Aktualisierung von MiniOS](/maintenance-and-recovery/Updating-MiniOS) für den Unterschied zwischen APT-Wartung und Änderungen an MiniOS-Releases.

<a id="collecting-logs"></a>

## Protokolle sammeln

Nützliche Informationen umfassen:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Bei wiederholten Startfehlern auf beschreibbaren MiniOS-Medien, `EXPORT_LOGS=true` in `config.conf` exportiert Startprotokolle unter `minios/log/`. Siehe [config.conf](/reference/configuration/config.conf).

In einer intakten, dauerhaften `perch`-Sitzung werden die beiden obligatorischen Startprotokolle unabhängig von `LIVE_LOG_STORAGE` bereits gespeichert:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Die `.1`, `.2`, und `.3`-Versionen stammen von früheren Starts. Das normale `/var/log`-Mount kann `tmpfs` werden, während `/var/log/minios` und `/var/log/live` auf dem Persistenzspeicher verbleiben. Für SquashFS befinden sich diese Protokolle ebenfalls unter `minios/changes/<session-id>/boot-logs/`, außerhalb von `changes.sb`; sie bleiben erhalten, selbst wenn der Shutdown-Snapshot fehlschlägt. Eine fehlgeschlagene oder nicht dauerhafte `perch`-Aktivierung hat kein garantiertes dauerhaftes Protokollziel. Mit `LIVE_LOG_STORAGE=volatile`, `journalctl -b` und andere normale Protokolle sind nur für den **aktuellen** Start verfügbar. Aktivieren Sie detaillierte `minios-update-*`-Traces mit `LIVE_CONFIG_DEBUG=true` nur bei Bedarf; normale Fehler werden auch ohne gemeldet.

Entfernen Sie Anmeldedaten, private Schlüssel, WLAN-Zugangsdaten und andere vertrauliche Informationen, bevor Sie Protokolle weitergeben. Bei einem reproduzierbaren Fehler fügen Sie die relevanten Auszüge bei und eröffnen ein Ticket im [MiniOS Issue Tracker](https://github.com/minios-linux/minios-live/issues).

### VMDK-Sitzungen werden nicht angeboten

Aktualisieren Sie den DynBlk-Treiber/CLI sowie die Session-Tools gemeinsam und erstellen Sie anschließend das
Boot-initrd neu. Das laufende initrd muss `vmdk-session-v1`anzeigen; der Installer prüft außerdem
jedes Quell-initrd, das kopiert werden soll. Der alte leere DynBlk-Marker
zeigt nur native Blockunterstützung an und garantiert keine VMDK-Session-Boot-Unterstützung.
Ändern Sie den Modus einer bestehenden Sitzung nicht manuell: Verwenden Sie stattdessen eine explizite Kopie oder
Konvertierung in das andere Format.

### Freigeben von Speicherplatz in DynFileFS, DynBlk oder VMDK-Sitzungen

Verwenden Sie das Kontextmenü des Sitzungsmanagers **Speicherplatz freigeben...**, oder
`minios-session reclaim ID --json`. Bei Klartext-Sitzungen wird das
eigentliche innere ext4-Dateisystem getrimmt und anschließend das zugehörige Backend aufgefordert, den Speicherplatz freizugeben, ohne
aktive Daten zu verschieben. DynFileFS benötigt für diesen Vorgang Version 4.6.0 oder neuer.
Bei Dateisystemen wie exFAT können innere Lücken weiterhin der Host-Datei zugeordnet bleiben,
aber vom Container wiederverwendet werden; `--compact` ist eine separate manuelle Option, die
aktive Daten verschieben und zusätzliche Schreibvorgänge auf das Flash-Laufwerk auslösen kann. Keine Option aktiviert
automatisch Komprimierung oder LUKS-Discard. Eine verschlüsselte Sitzung kann nur
Speicherplatz zurückgewinnen, der dem zugrunde liegenden Backend bereits durch diesen Befehl bekannt ist.
