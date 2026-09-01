---
updated: 2026-08-26
---

# Vérification des téléchargements

Les versions de MiniOS sont publiées sur la [page officielle des versions GitHub](https://github.com/minios-linux/minios-live/releases) et sur [SourceForge](https://sourceforge.net/projects/minios-linux/). Chaque ISO possède un fichier correspondant dont le nom se termine par `.iso.sha256`.

La vérification SHA-256 permet de détecter un téléchargement incomplet ou modifié. Elle ne prouve pas l'origine des fichiers. La version actuelle fournit des sommes de contrôle, mais pas de fichiers de signature cryptographique, donc cette page ne décrit pas la vérification de signature.

## Téléchargez les deux fichiers

Téléchargez l’ISO et son fichier `.sha256` correspondant depuis la même version sur GitHub ou SourceForge. Gardez les deux fichiers dans le même dossier. Leurs noms de base doivent correspondre, par exemple :

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Utilisez les noms de la version que vous avez téléchargée dans les commandes ci-dessous.

## Linux

Ouvrez un terminal dans le dossier de téléchargement et exécutez :

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Un téléchargement valide affiche le nom de l’ISO suivi de `OK`.

## macOS

Calculez la somme de contrôle de l’ISO :

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

Comparez la valeur calculée avec la valeur au début du fichier `.sha256`. La comparaison n’est pas sensible à la casse.

## Si la vérification échoue

N’écrivez pas et ne démarrez pas l’ISO. Vérifiez que l’ISO et le fichier de somme de contrôle appartiennent à la même version et édition, supprimez l’ISO défectueux, puis téléchargez-le à nouveau depuis les [versions officielles de MiniOS](https://github.com/minios-linux/minios-live/releases).
