---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher est un programme multiplateforme pratique pour écrire des images ISO sur des clés USB. Compatible avec Windows, macOS et Linux.

## Important

**Avertissement :** Une sélection incorrecte du périphérique entraînera une perte de données ! Vérifiez toujours soigneusement le lecteur sélectionné et sauvegardez les données importantes.

## Configuration requise pour le lecteur

### Capacité du lecteur

Voir [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour connaître la configuration système requise et les capacités de lecteur recommandées.

## Préparation

1. Téléchargez Balena Etcher depuis le [site officiel](https://www.balena.io/etcher/)
2. Installez le programme sur votre système d’exploitation
3. Branchez la clé USB

## Créer une clé USB bootable

1. Lancez Balena Etcher
2. Sélectionnez l’image ISO MiniOS :
   - Cliquez sur « Flash from file »
   - Indiquez le chemin d’accès au fichier ISO
3. Sélectionnez la clé USB cible :
   - Cliquez sur « Select target »
   - Vérifiez le modèle et la capacité du périphérique
4. Lancez l’écriture :
   - Cliquez sur « Flash! »
   - Attendez la fin du processus (5 à 15 minutes)

## Résultat et persistance

Etcher effectue une écriture brute de l’image : il copie la structure de l’ISO sur l’ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l’espace inutilisé, ne crée pas de session de persistance et ne déploie pas le Programme d’installation MiniOS.

La persistance n’est activée que si une entrée de démarrage ou une ligne de commande du noyau le demande, et elle nécessite toujours un espace de stockage inscriptible adapté. Consultez les [Modes de démarrage](/using-minios/Boot-Modes) et les [Persistance de l’initrd](/reference/boot-process/Persistence-Internals) avant de compter sur l’enregistrement des modifications.
