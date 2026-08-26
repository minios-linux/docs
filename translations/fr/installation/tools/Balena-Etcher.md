# Utilisation de Balena Etcher

Balena Etcher est un programme multiplateforme pratique pour écrire des images ISO sur des clés USB. Compatible avec Windows, macOS et Linux.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du disque

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître les exigences système détaillées et les tailles de disque recommandées.

## Préparation

1. Téléchargez Balena Etcher depuis le [site officiel](https://www.balena.io/etcher/)
2. Installez le programme sur votre système d’exploitation
3. Connectez la clé USB

## Création d’une clé USB bootable

1. Lancez Balena Etcher
2. Sélectionnez l’image ISO de MiniOS :
   - Cliquez sur « Flash from file »
   - Indiquez le chemin du fichier ISO
3. Sélectionnez la clé USB cible :
   - Cliquez sur « Select target »
   - Vérifiez le modèle et la taille du périphérique
4. Lancez l’écriture :
   - Cliquez sur « Flash! »
   - Attendez la fin du processus (5 à 15 minutes)

## Résultat et persistance

Etcher effectue une écriture brute de l’image : il copie la structure de l’ISO sur l’ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l’espace inutilisé, ne crée pas de session de persistance et n’effectue pas de déploiement de l’installateur MiniOS.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support de stockage inscriptible adapté. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de compter sur la sauvegarde des modifications.
