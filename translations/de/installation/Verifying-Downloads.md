# Überprüfung von Downloads

MiniOS-Versionen werden auf der offiziellen [GitHub Releases-Seite](https://github.com/minios-linux/minios-live/releases) veröffentlicht. Jede ISO-Veröffentlichung enthält eine passende Datei, deren Name auf `.iso.sha256` endet.

Die SHA-256-Prüfung erkennt unvollständige oder veränderte Downloads. Sie beweist jedoch nicht, wer die Dateien erstellt hat. Derzeit werden nur Prüfsummen, aber keine kryptografischen Signaturdateien bereitgestellt, daher beschreibt diese Seite keine Signaturprüfung.

## Beide Dateien herunterladen

Laden Sie die ISO und die dazugehörige `.sha256`-Datei aus derselben GitHub-Veröffentlichung herunter. Bewahren Sie beide Dateien im selben Verzeichnis. Ihre Basisnamen müssen übereinstimmen, zum Beispiel:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Verwenden Sie in den folgenden Befehlen die Namen aus der heruntergeladenen Veröffentlichung.

## Linux

Öffnen Sie ein Terminal im Download-Verzeichnis und führen Sie aus:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Ein gültiger Download gibt den ISO-Namen gefolgt von `OK` aus.

## macOS

Berechnen Sie die ISO-Prüfsumme:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Zeigen Sie die erwartete Prüfsumme an:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Vergleichen Sie die beiden 64-stelligen hexadezimalen Werte exakt.

## Windows PowerShell

Öffnen Sie PowerShell im Download-Verzeichnis und führen Sie aus:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Vergleichen Sie den berechneten Wert mit dem Wert am Anfang der `.sha256`-Datei. Der Vergleich ist nicht groß-/kleinschreibungssensitiv.

## Wenn die Überprüfung fehlschlägt

Beschreiben oder starten Sie die ISO nicht. Überprüfen Sie, ob die ISO und die Prüfsummendatei zur gleichen Veröffentlichung und Edition gehören, löschen Sie die fehlerhafte ISO und laden Sie sie erneut von den offiziellen [MiniOS Releases](https://github.com/minios-linux/minios-live/releases) herunter.
