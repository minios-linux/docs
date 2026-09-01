---
updated: 2026-08-31
---

# Rufus

Rufus est un utilitaire populaire pour Windows qui permet de formater et de créer des clés USB amorçables.

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences relatives au lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour les exigences système détaillées et les tailles de lecteurs recommandées.

## Installation de Rufus

1. **Téléchargez Rufus** depuis le [site officiel](https://rufus.ie/)
2. **Lancez le programme** – Rufus ne nécessite pas d'installation, c'est une application portable

## Création d’une clé USB bootable

Rufus permet de créer un support MiniOS de deux manières différentes. Son mode ISO standard est le meilleur choix si vous souhaitez que la clé USB reste un système de fichiers classique, accessible en écriture, tout en servant de périphérique de démarrage.

### Méthode 1 : mode ISO

1. **Lancez Rufus** en tant qu’administrateur.
2. **Sélectionnez la clé USB** dans le champ **Périphérique**.
3. **Sélectionnez le fichier ISO MiniOS** avec **SÉLECTIONNER**.
4. Lorsque Rufus demande comment écrire l’image hybride, conservez le **mode Image ISO**.
5. Choisissez un système de fichiers approprié. FAT32 offre la meilleure compatibilité avec les firmwares ; NTFS peut limiter le démarrage UEFI direct sur certains systèmes.
6. Cliquez sur **DÉMARRER** et confirmez le formatage du périphérique sélectionné.

Le mode ISO extrait les fichiers MiniOS sur un système de fichiers classique. Après l’installation, l’espace libre restant peut toujours être utilisé pour des fichiers ordinaires. C’est généralement la disposition Rufus la plus pratique pour une clé MiniOS portable.

### Méthode 2 : mode DD

Choisissez le **mode Image DD** uniquement si vous souhaitez précisément une copie bloc à bloc exacte de l’ISO publié. Rufus reproduit alors la structure de l’ISO sur l’ensemble du périphérique, de la même manière que `dd`, Etcher ou le mode d’écriture d’Utilitaire de disque.

Le mode DD est simple et prévisible, mais le périphérique ne dispose plus du système de fichiers unique et modifiable habituel attendu d’une clé USB à usage général.

## Résultat et persistance

Le mode ISO crée des supports MiniOS basés sur des fichiers sur un système de fichiers modifiable classique. Le mode DD crée des supports d’image brute. Aucun des deux modes n’est un déploiement de Programme d’installation MiniOS, et aucun ne crée automatiquement de session persistante.

La persistance MiniOS peut utiliser un espace de stockage modifiable adapté sur une installation Rufus basée sur des fichiers lorsque le mode de démarrage persistant est sélectionné. Voir [Modes de démarrage](/using-minios/Boot-Modes) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).
