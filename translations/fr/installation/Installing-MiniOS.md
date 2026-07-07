# Installation de MiniOS

Ce guide décrit différentes méthodes pour installer MiniOS sur des périphériques de stockage.

## 1. Télécharger le fichier ISO de MiniOS

- Téléchargez le fichier ISO de MiniOS depuis le site officiel.

## 2. Créer un support amorçable

Choisissez l’une des méthodes suivantes :

- [Méthode originale](/installation/tools/Original-Method.md)
- [Avec Rufus](/installation/tools/Rufus.md) (Windows) (Recommandé)
- [Avec UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [Avec Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Recommandé)
- [Avec Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Recommandé)
- [Avec `dd`](/installation/tools/dd.md) (Linux/MacOS) (Recommandé)
- [Avec Drive Utility](/installation/tools/Drive-Utility.md) (Linux) (Recommandé)
- [Avec l’installateur MiniOS](/installation/MiniOS-Installer.md) (Recommandé, MiniOS uniquement)

## 3. Démarrage depuis le support

1.  Redémarrez votre ordinateur.
2.  Sélectionnez le support amorçable dans le menu de démarrage de votre ordinateur pour démarrer dessus.

## 4. Remarques

- L’installateur de démarrage ne prend pas en charge le multiboot ; seul MiniOS sera amorçable depuis le support.
- Votre disque doit utiliser le schéma de partition `msdos` (utilisez MBR, pas GPT).
- Le support doit être formaté avec l’un des systèmes de fichiers pris en charge : FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Rappel :** La méthode d’installation originale n’est plus la principale recommandation car elle peut être difficile pour les utilisateurs débutants. Lors de l’utilisation de Balena Etcher, `dd` ou Drive Utility, la partition pour enregistrer les modifications sera créée automatiquement.
