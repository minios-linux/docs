---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher est un programme multiplateforme pratique pour écrire des images ISO sur des clés USB. Compatible avec Windows, macOS et Linux.

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences relatives au lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour les exigences système détaillées et les tailles de lecteurs recommandées.

## Préparation

1. Téléchargez Balena Etcher depuis le [site officiel](https://www.balena.io/etcher/)
2. Installez le programme sur votre système d'exploitation
3. Connectez la clé USB

## Création d'une clé USB bootable

1. Lancez Balena Etcher
2. Sélectionnez l'image ISO de MiniOS :
   - Cliquez sur "Flash from file"
   - Indiquez le chemin du fichier ISO
3. Sélectionnez la clé USB cible :
   - Cliquez sur "Select target"
   - Vérifiez le modèle et la taille du périphérique
4. Démarrez l'écriture :
   - Cliquez sur "Flash!"
   - Patientez jusqu'à la fin du processus (5 à 15 minutes)

## Résultat et persistance

Etcher effectue une écriture brute de l’image : il copie la structure de l’ISO sur l’ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l’espace inutilisé, ne configure pas de session de persistance, et n’effectue pas de déploiement du Programme d’installation MiniOS.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support de stockage adapté en écriture. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance Initrd](/reference/boot-process/Persistence-Internals) avant de compter sur la sauvegarde des modifications.
