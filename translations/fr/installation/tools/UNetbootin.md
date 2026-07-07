# Utilisation de UNetbootin

UNetbootin est un utilitaire open source multiplateforme qui vous permet de créer des clés USB amorçables pour différentes distributions Linux, y compris MiniOS.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour les exigences système détaillées et les tailles de lecteur.

## Installation de UNetbootin

1. **Téléchargez UNetbootin** depuis le [site officiel](https://unetbootin.github.io/)
2. **Installez le programme** sur votre système :
   - **Windows** : Exécutez l’installateur en tant qu’administrateur
   - **Linux** : Installez-le depuis le dépôt ou utilisez l’AppImage
   - **macOS** : Glissez l’application dans le dossier Applications

## Création d’une clé USB amorçable

1. **Lancez UNetbootin** en tant qu’administrateur/root
2. **Sélectionnez la source de l’image :**
   - Réglez le bouton sur « Image disque »
   - Cliquez sur le bouton « ... » et sélectionnez le fichier ISO de MiniOS
3. **Sélectionnez le périphérique cible :**
   - Dans la liste « Lecteur », choisissez votre clé USB
   - Assurez-vous que le bon périphérique est sélectionné
4. **Démarrez le processus :** Cliquez sur « OK »
5. **Patientez jusqu’à la fin** – le processus peut prendre 10 à 20 minutes

## Persistance automatique des modifications

UNetbootin formate automatiquement le lecteur en FAT32, ainsi MiniOS utilisera le mode dynfilefs pour sauvegarder les modifications. Cela garantit une compatibilité maximale avec différents systèmes, y compris la prise en charge du démarrage EFI.

### Configuration des paramètres (pour utilisateurs avancés)

Lorsque vous avez besoin d’une configuration précise, des paramètres de démarrage peuvent être utilisés :

- `perchmode=dynfilefs` – Fichier extensible dynamiquement (par défaut)
- `perchmode=raw` – Fichier de taille fixe
- `perchsize=8000` – Taille de l’espace de stockage des données en Mo

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
