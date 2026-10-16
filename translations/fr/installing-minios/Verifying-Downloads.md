---
updated: 2026-08-26
---

# Vérifier les téléchargements

MiniOS sont publiées sur les pages officielles [GitHub Releases](https://github.com/minios-linux/minios-live/releases) et [SourceForge](https://sourceforge.net/projects/minios-linux/). Chaque fichier ISO possède un fichier correspondant dont le nom se termine par `.iso.sha256`.

La vérification SHA-256 permet de détecter un téléchargement incomplet ou modifié. Elle ne permet pas de prouver qui a créé les fichiers. La version actuelle fournit des sommes de contrôle, mais pas de fichiers de signature cryptographique ; cette page ne décrit donc pas la vérification des signatures.

## Télécharger les deux fichiers

Téléchargez le fichier ISO et le fichier `.sha256`correspondant depuis la même version sur GitHub ou SourceForge. Placez les deux fichiers dans le même dossier. Leurs noms de base doivent correspondre, par exemple :

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Utilisez les noms de fichiers de la version téléchargée dans les commandes ci-dessous.

## Linux

Ouvrez un terminal dans le dossier de téléchargement et exécutez :

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Si le téléchargement est valide, le nom du fichier ISO est suivi de `OK`.

## macOS

Calculez la somme de contrôle du fichier ISO :

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Affichez la somme de contrôle attendue :

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Comparez exactement les deux valeurs hexadécimales de 64 caractères.

## Windows PowerShell

Ouvrez PowerShell dans le dossier de téléchargement et exécutez :

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Comparez la valeur calculée avec celle au début du fichier `.sha256`. La comparaison ne tient pas compte de la casse.

## Si la vérification échoue

N’écrivez pas l’ISO sur un support et ne démarrez pas dessus. Vérifiez que l’ISO et le fichier de somme de contrôle correspondent à la même version et à la même édition, supprimez l’ISO défectueux, puis téléchargez-le à nouveau depuis le site officiel [MiniOS](https://github.com/minios-linux/minios-live/releases).
