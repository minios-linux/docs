---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Kernel verwalten

MiniOS-Kernelmanager paketiert, prüft, aktiviert und entfernt Kernel-Bundles für das modulare MiniOS-Live-System. Ein MiniOS-Kernel ist ein abgestimmtes Set: das Kernel-Image, das zugehörige initramfs und das passende `01-kernel-<version>.sb` Modul müssen zusammengehören.

Dieser Arbeitsablauf gilt nur für die Live-Architektur. Eine native Installation verwendet die üblichen Kernel-Pakete von Debian oder Ubuntu, das normale initramfs-Tooling und den installierten Bootloader.

## Was Kernelmanager macht

Die grafische **MiniOS-Kernelmanager** und die `minios-kernel` CLI verwenden das gleiche Backend. Sie können:

- die gepackten Kernel auflisten und laufende, aktive sowie inaktive Versionen unterscheiden;
- einen echten, versionierten Kernel aus konfigurierten APT-Repositories paketieren;
- ein konsistentes Set lokaler Kernel-`.deb`-Dateien paketieren;
- bei der Paketierung eines Repository-Kernels optional ausgewählte Treiber aus dem kuratierten MiniOS-DKMS-Katalog hinzufügen;
- das passende MiniOS-initramfs und das SquashFS-Kernelmodul erstellen;
- fertige Bundles im MiniOS-Kernel-Repository bereitstellen;
- ein vollständiges Bundle für den nächsten Start aktivieren und die unterstützte Bootloader-Konfiguration aktualisieren;
- einen inaktiven gepackten Kernel entfernen.

Kernelmanager kompiliert keinen beliebigen Kernel-Quellbaum. Wenn Sie die MiniOS-Kernel-Build-Inputs selbst anpassen müssen, verwenden Sie stattdessen den MiniOS-Source-Build-Workflow.

## Den grafischen Manager starten

Starten Sie ihn über das MiniOS-Anwendungsmenü oder führen Sie aus:

```bash
minios-kernel-manager
```

Die Anwendung trennt die Verwaltung installierter Kernel von der Paketierung. Repository-Kernel können nach Paketname oder angezeigter Kernel-Version gesucht werden. Die Paketierungsfunktionen sind nicht verfügbar, wenn das erkannte MiniOS-Root nicht beschreibbar ist.

Privilegierte Backend-Operationen nutzen PolicyKit. Die eigenständige `minios-kernel` CLI benötigt für alle Befehle außer Hilfe Root-Rechte.

## Einen Repository-Kernel paketieren

Wählen Sie **Repository** in der Paketierungsansicht und wählen Sie ein echtes, versioniertes Kernel-Paket, zum Beispiel:

```text
linux-image-6.12.107+deb13-amd64
```

Metapakete wie `linux-image-amd64` werden nicht als Paketquelle akzeptiert. Der Repository-Modus verwendet die konfigurierten APT-Quellen, Vertrauenseinstellungen und Paketlisten des laufenden Systems. Passende, versionierte Split-Kernel-Abhängigkeiten werden automatisch aufgelöst, wenn die Distribution sie nutzt.

Die GUI führt kein `apt update` aus, nur weil die Paketlisten veraltet sind. Aktualisieren Sie diese bei Bedarf explizit oder verwenden Sie `--force-update` mit der CLI.

### Kurierte DKMS-Treiber hinzufügen

Bei der Repository-Paketierung können ausgewählte Treiber aus dem MiniOS-`01-kernel`-DKMS-Katalog hinzugefügt werden. Die GUI zeigt kompatible Optionen für den gewählten Kernel an; die CLI akzeptiert eine wiederholbare `--dkms-driver`-Option:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Ausgewählte Treiber werden in einem isolierten Overlay/Chroot mit passenden Headern gebaut. Das Backend prüft, ob die erzeugten Module zum Ziel-Kernel passen, bevor sie übernommen werden, und dokumentiert die Herkunft der Treiber im Bundle unter `/usr/share/minios/kernel-dkms/`.

Dies ist eine kuratierte Kompatibilitätsfunktion, kein generisches DKMS-Frontend. Manuelle lokale Kernelpakete bieten keine Treiberauswahl, da passende Repository-Header nicht zuverlässig erkannt werden können.

## Lokale Kernelpakete paketieren

Für einen lokalen Kernel geben Sie alle benötigten `.deb`-Dateien aus demselben Kernel-Build an:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian und Ubuntu können einen Kernel auf mehrere Pakete aufteilen. Das Backend prüft, dass das bereitgestellte Image, die Module, das Base- und optional das modules-extra-Paket eine konsistente Version bilden, statt unterschiedliche Revisionen stillschweigend zu mischen.

## Paketierungs-Ausgabe und Komprimierung

Die Paketierung erzeugt das Kernel-Image, das initramfs und das SquashFS-Kernelmodul. Ausgewählte Paket-Metadaten werden im Modul unter `/usr/share/minios/kernel-dpkg/` gespeichert.

Die Standard-Komprimierung für SquashFS ist `zstd`. Weitere Methoden werden nur angeboten, wenn die erforderlichen Tools verfügbar sind; aktuell werden unterstützt: `lz4`, `lzo`, `gzip`, `lzma`, `xz`, und `bzip2`.

Wenn ein beschreibbares MiniOS-Root erkannt wird und die gewünschte Ausgabe woanders liegt, wird das fertige Bundle atomar bereitgestellt in:

```text
<MiniOS-root>/kernels/<version>/
```

Repository-Downloads sind temporäre Build-Inputs und werden nach Abschluss oder Abbruch der Paketierung entfernt. Lokale `.deb`-Inputs verbleiben im Besitz des Aufrufers.

## Kompatibilität mit verschlüsselter Persistenz

Wenn das laufende MiniOS-initramfs eine geschichtete LUKS-Persistenz unterstützt, muss ein Ersatzkernel den dm-crypt-Bootpfad erhalten. Das erzeugte initramfs wird auf die erforderliche cryptsetup-Unterstützung, das dm-crypt-Modul und das MiniOS-Krypto-Kennzeichen geprüft.

Die Paketierung schlägt fehl, anstatt ein Kernel-Bundle zu erzeugen, das eine verschlüsselte Persistenz-Sitzung unbootbar machen würde.

## Kernel aktivieren und entfernen

In der Verwaltungsansicht wird unterschieden:

- **AKTIV** — der Kernel, der beim aktuellen Systemstart ausgeführt wird;
- **VORGEMERKT** — das vollständige Bundle, das für den nächsten Start ausgewählt ist;
- **VERFÜGBAR** — ein weiteres paketiertes Bundle im MiniOS-Repository.

Die Aktivierung erfordert einen vollständigen Repository-Eintrag. Dabei werden Kernel-Image, initramfs, aktives SquashFS-Modul, Marker für die aktive Version und Bootloader-Änderungen als koordinierter Vorgang bereitgestellt. Die GRUB-Konfiguration ist erforderlich; eine vorhandene native SYSLINUX-Konfiguration wird aktualisiert. Schlägt die Aktivierung fehl, werden die vorbereiteten Boot-Dateien zurückgesetzt.

Die Aktivierung betrifft nur den nächsten Systemstart; das aktuelle System wird nicht neu gestartet. Behalten Sie mindestens ein als funktionsfähig bekanntes vollständiges Bundle, bis der Ersatz erfolgreich gebootet wurde.

Löschen Sie nur einen inaktiven paketierten Kernel, den Sie nicht mehr benötigen. Mischen Sie Kernel-Image, initramfs oder `01-kernel-*.sb` nicht manuell aus verschiedenen Bundles.

<a id="command-line-reference"></a>

## Kommandozeilenreferenz

Typische Befehle sind:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Paketierung aus Repository oder lokalen Dateien:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Fügen Sie `--json` für strukturierte Ausgabe hinzu. Nutzen Sie die installierte Hilfe und das Handbuch für die genauen Optionen der laufenden Version:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Speicherlayout

Kernelmanager erkennt das MiniOS-Inhalts-Root anstatt einen bestimmten Block-Device-Namen vorauszusetzen. Verwaltete Pfade sind relativ zu diesem Root:

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
Der kanonische Pfad zum Laufzeitmodul ist `/lib/modules/<version>`. Auf usrmerged-Systemen entspricht das `/usr/lib/modules/<version>`; ältere Layouts speichern es physisch unter `/lib`. Die Paketierung verweigert ein bereits vorhandenes Modulbaum derselben Version, anstatt es mit einer anderen Paket-Revision zu vermischen.

## Wiederherstellung nach fehlerhaftem Kernel

Wenn ein neu aktivierter Kernel fehlschlägt, starten Sie ein bekannt funktionierendes vollständiges MiniOS-Kernel-Set, sofern noch vorhanden. Reparieren Sie die Installation nicht, indem Sie einzelne Kernel-, initramfs- oder SquashFS-Dateien aus einem anderen Image kopieren: Diese Dateien bilden ein abgestimmtes Bundle.

Wenn kein vollständiges, bekannt funktionierendes Bundle mehr vorhanden ist, starten Sie vertrauenswürdige Rettungsmedien, sichern Sie wichtige Daten und installieren oder stellen Sie die betroffene MiniOS-Installation wieder her. Siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting) und [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Verwandte Dokumentation

- [MiniOS-Systemarchitektur](/reference/System-Architecture)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [MiniOS-Build](/development/Building-MiniOS)
- [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting)
