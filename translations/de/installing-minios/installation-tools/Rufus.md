---
updated: 2026-08-31
---

# Rufus

Rufus ist ein beliebtes Tool für Windows, das beim Formatieren und Erstellen bootfähiger USB-Laufwerke hilft.

## Wichtig

**Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Installation von Rufus

1. **Laden Sie Rufus herunter** von der [offiziellen Webseite](https://rufus.ie/)
2. **Starten Sie das Programm** – Rufus muss nicht installiert werden, es ist eine portable Anwendung

## Bootfähiges USB-Laufwerk erstellen

Rufus kann MiniOS-Medien auf zwei verschiedene Arten erstellen. Der normale ISO-Modus ist die bessere Wahl, wenn das USB-Laufwerk sowohl als gewöhnliches beschreibbares Dateisystem als auch als Bootmedium genutzt werden soll.

### Methode 1: ISO-Modus

1. **Starten Sie Rufus** als Administrator.
2. **Wählen Sie das USB-Laufwerk** im Feld **Gerät** aus.
3. **Wählen Sie die MiniOS ISO-Datei** mit **AUSWÄHLEN** aus.
4. Wenn Rufus fragt, wie das Hybrid-Image geschrieben werden soll, belassen Sie **ISO-Abbildmodus**.
5. Wählen Sie ein geeignetes Dateisystem. FAT32 bietet die breiteste Firmware-Kompatibilität; NTFS kann den direkten UEFI-Boot auf manchen Systemen einschränken.
6. Klicken Sie auf **START** und bestätigen Sie das Formatieren des ausgewählten Geräts.

Im ISO-Modus werden die MiniOS-Dateien auf ein normales Dateisystem extrahiert. Nach der Installation kann der verbleibende freie Speicherplatz weiterhin für normale Dateien genutzt werden. Dies ist in der Regel das praktischere Rufus-Layout für ein portables MiniOS-Laufwerk.

### Methode 2: DD-Modus

Wählen Sie den **DD-Image-Modus** nur, wenn Sie gezielt eine exakte Block-für-Block-Kopie des veröffentlichten ISO möchten. Rufus reproduziert dann das ISO-Layout auf dem gesamten Gerät, ähnlich wie `dd`, Etcher oder das Laufwerksprogramm im Schreibmodus.

Der DD-Modus ist einfach und vorhersehbar, aber das Gerät hat danach nicht mehr das übliche einzelne beschreibbare Dateisystem, das man von einem universellen USB-Stick erwartet.

## Ergebnis und Persistenz

Der ISO-Modus erstellt dateibasierte MiniOS-Medien auf einem normalen beschreibbaren Dateisystem. Der DD-Modus erstellt Rohabbild-Medien. Keiner der Modi ist eine MiniOS-Installationsprogramm-Bereitstellung, und keiner erstellt automatisch eine persistente Sitzung.

MiniOS-Persistenz kann geeigneten beschreibbaren Speicher auf einer dateibasierten Rufus-Installation verwenden, wenn ein persistenter Boot-Modus ausgewählt ist. Siehe [Boot-Modi](/using-minios/Boot-Modes) und [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).
