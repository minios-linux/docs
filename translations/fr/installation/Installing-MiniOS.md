# Installation de MiniOS

Il existe deux opérations distinctes souvent appelées installation :

- L’écriture de l’ISO sur un support amovible crée le média amorçable utilisé pour démarrer une session live MiniOS. Les outils d’écriture d’image écrasent le périphérique sélectionné avec la structure de l’ISO.
- L’exécution du [MiniOS Installer](/installation/MiniOS-Installer.md) depuis une session live déploie MiniOS sur un autre disque. Il permet de créer soit une installation live modulaire, soit une installation Linux native classique.

## Télécharger et vérifier l’ISO

Téléchargez une image ISO depuis le [site officiel](https://minios.dev) ou la page officielle des [releases GitHub](https://github.com/minios-linux/minios-live/releases). Vérifiez l’image avant de la copier sur un périphérique ; consultez [Vérification des téléchargements](/installation/Verifying-Downloads.md).

## Créer un média amorçable

Choisissez une méthode adaptée à votre système d’exploitation :

- [Rufus](/installation/tools/Rufus.md) sous Windows
- [Ventoy](/installation/tools/Ventoy.md) sous Windows ou Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) sous Windows, Linux ou macOS
- [`dd`](/installation/tools/dd.md) sous Linux ou macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) sous Linux
- [UNetbootin](/installation/tools/UNetbootin.md) sous Windows, Linux ou macOS
- [Méthode originale](/installation/tools/Original-Method.md) pour une structure MiniOS basée sur des fichiers

L’écriture d’une image avec Rufus, Etcher, `dd` ou Drive Utility est destructive. Vérifiez le chemin du périphérique, le modèle et la capacité avant de commencer. Ces outils créent un média amorçable ; ils ne réalisent pas de déploiement live ou natif avec MiniOS Installer.

Ventoy fonctionne différemment : installez Ventoy sur le périphérique, puis copiez l’ISO sur sa partition de données. Cela conserve la structure multiboot de Ventoy.

## Démarrer la session live

1. Redémarrez l’ordinateur et ouvrez le menu de démarrage du firmware.
2. Sélectionnez le périphérique USB ou un autre média amorçable.
3. Lancez MiniOS et vérifiez que le stockage, le réseau et les périphériques d’entrée fonctionnent correctement.

Les paramètres du firmware varient selon l’ordinateur. Une image MiniOS peut démarrer en mode BIOS ou UEFI ; la cible d’un futur déploiement via MiniOS Installer n’est pas limitée au MBR.

## Choisir un type d’installation

Depuis la session live, lancez le [MiniOS Installer](/installation/MiniOS-Installer.md) lorsque vous souhaitez installer MiniOS sur une autre clé USB, un SSD ou un disque dur.

- Le mode live conserve la pile de modules compressés et la structure de démarrage live. Il prend en charge la persistance de session en option et convient aux installations portables.
- Le mode natif extrait les modules sélectionnés dans un système de fichiers racine Linux classique, génère l’initramfs et installe un chargeur d’amorçage compatible. Le mode natif n’est disponible que si l’image démarrée fournit les métadonnées d’installation requises.

L’installateur prend en charge les structures automatiques BIOS/MBR, UEFI/MBR et UEFI/GPT. Le BIOS sur GPT n’est pas pris en charge par l’installateur actuel. Consultez [Utiliser MiniOS Installer](/installation/MiniOS-Installer.md) pour les limites de placement, de système de fichiers, de persistance et de partitionnement.
