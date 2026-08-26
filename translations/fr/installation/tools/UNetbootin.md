# Utilisation de UNetbootin

UNetbootin est un utilitaire open source multiplateforme qui vous permet de créer des clés USB amorçables pour différentes distributions Linux, y compris MiniOS.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du disque

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître en détail les exigences système et les tailles de disque recommandées.

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

## Résultat et persistance

UNetbootin extrait les fichiers et installe les fichiers de démarrage sur le système de fichiers sélectionné, créant ainsi un média live basé sur des fichiers au lieu d’effectuer une écriture d’image brute ou un déploiement de l’installateur MiniOS. Son utilisation ne garantit pas le formatage en FAT32, la prise en charge de l’EFI ou la persistance.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support d’écriture adapté. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de vous fier à la sauvegarde des modifications.
