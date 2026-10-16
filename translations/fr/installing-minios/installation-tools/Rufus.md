---
updated: 2026-08-31
---

# Rufus

Rufus est un utilitaire populaire pour Windows qui permet de formater des clés USB et de les rendre amorçables.

## Important

**Avertissement :** La sélection d’un périphérique incorrect entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez les données importantes.

## Exigences relatives au lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour connaître les exigences système et les tailles de lecteur recommandées.

## Installation de Rufus

1. **Téléchargez Rufus** depuis le [site officiel](https://rufus.ie/)
2. **Lancez le programme** - Rufus ne nécessite pas d’installation : c’est une application portable

## Créer une clé USB bootable

Rufus peut créer des supports MiniOS de deux façons différentes. Son mode ISO standard est préférable si vous souhaitez que la clé USB reste un système de fichiers inscriptible classique tout en permettant le démarrage.

### Méthode 1 : mode ISO

1. **Lancez Rufus** en tant qu’administrateur.
2. **Sélectionnez la clé USB** dans le champ **Périphérique**.
3. **Sélectionnez le fichier ISO MiniOS** à l’aide de **SELECT**.
4. Lorsque Rufus vous demande comment écrire l’image hybride, gardez le mode **Image ISO**.
5. Choisissez un système de fichiers adapté. FAT32 offre la meilleure compatibilité avec les firmwares ; NTFS peut empêcher le démarrage UEFI direct sur certains systèmes.
6. Cliquez sur **START** et confirmez le formatage du périphérique sélectionné.

Le mode ISO extrait les fichiers MiniOS sur un système de fichiers classique. Après l’installation, l’espace libre restant peut toujours servir à stocker des fichiers ordinaires. C’est généralement la configuration Rufus la plus pratique pour une clé MiniOS portable.

### Méthode 2 : mode DD

Choisissez le mode **Image DD** uniquement si vous souhaitez obtenir une copie exacte, bloc par bloc, de l’ISO publiée. Rufus reproduit alors la structure de l’ISO sur l’ensemble du périphérique, comme le mode d’écriture de `dd`, Etcher ou Utilitaire de disque.

Le mode DD est simple et prévisible, mais le périphérique ne présente plus la structure habituelle d’un système de fichiers unique et inscriptible, attendue d’une clé USB à usage général.

## Résultat et persistance

Le mode ISO crée un support basé sur des fichiers MiniOS sur un système de fichiers normal accessible en écriture. Le mode DD crée un support image brut. Aucun des deux modes ne correspond à un programme d’installation MiniOS, et aucun ne crée automatiquement une session persistante.

La persistance MiniOS peut utiliser un espace de stockage adapté et accessible en écriture sur une installation Rufus basée sur des fichiers, lorsqu’un mode de démarrage persistant est sélectionné. Voir [Modes de démarrage](/using-minios/Boot-Modes) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).
