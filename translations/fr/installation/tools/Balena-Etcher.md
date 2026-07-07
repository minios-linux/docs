# Utilisation de Balena Etcher

Balena Etcher est un programme multiplateforme pratique pour écrire des images ISO sur des clés USB. Compatible avec Windows, macOS et Linux.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour les exigences système détaillées et les tailles de lecteur.

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

## Persistance automatique des modifications

Au premier démarrage, MiniOS vérifie le type de système de fichiers du lecteur et choisit le mode de persistance optimal. Si de l’espace libre est disponible, le système créera automatiquement une partition ext4 pour des performances maximales.

### Configuration des paramètres (utilisateurs avancés)

Lorsque vous avez besoin d’une configuration précise de la persistance, vous pouvez utiliser les paramètres de démarrage :

- `perchmode=native` - Sauvegarde directe sur la partition (par défaut, le plus rapide)
- `perchmode=dynfilefs` - Fichier extensible dynamiquement
- `perchmode=raw` - Fichier de taille fixe
- `perchsize=8000` - Taille de l’espace de stockage en Mo pour les fichiers image

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
