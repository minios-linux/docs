# Utilisation de Rufus (Windows)

Rufus est un utilitaire populaire pour Windows qui permet de formater et de créer des clés USB bootables.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour les exigences système détaillées et les tailles de lecteur.

## Installation de Rufus

1. **Téléchargez Rufus** depuis le [site officiel](https://rufus.ie/)
2. **Lancez le programme** – Rufus ne nécessite pas d'installation, c'est une application portable

## Création d’une clé USB bootable

Rufus propose deux méthodes pour écrire MiniOS sur une clé USB :

### Méthode 1 : Mode DD (Recommandé)

1. **Lancez Rufus** en tant qu’administrateur
2. **Sélectionnez la clé USB** dans le champ « Périphérique »
3. **Sélectionnez le fichier ISO de MiniOS** :
   - Cliquez sur le bouton « SÉLECTIONNER »
   - Recherchez et sélectionnez le fichier ISO MiniOS téléchargé
4. **Choisissez le mode d’écriture** :
   - Dans la boîte de dialogue « Image ISO hybride détectée », sélectionnez **« Écrire en mode image DD »**
5. **Démarrez le processus** : cliquez sur le bouton « DÉMARRER »
6. **Confirmez l’action** – toutes les données sur le lecteur seront supprimées
7. **Attendez la fin** du processus d’écriture

### Méthode 2 : Mode ISO (Alternative)

1. **Lancez Rufus** en tant qu’administrateur
2. **Sélectionnez la clé USB** dans le champ « Périphérique »
3. **Sélectionnez le fichier ISO de MiniOS** :
   - Cliquez sur le bouton « SÉLECTIONNER »
   - Recherchez et sélectionnez le fichier ISO MiniOS téléchargé
4. **Choisissez le mode d’écriture** :
   - Dans la boîte de dialogue « Image ISO hybride détectée », sélectionnez **« Écrire en mode image ISO »**
5. **Configurez les paramètres** :
   - **Système de fichiers** : FAT32 (recommandé) ou NTFS
   - ⚠️ **Si vous choisissez NTFS** : le démarrage en mode EFI peut ne pas être disponible
6. **Démarrez le processus** : cliquez sur le bouton « DÉMARRER »
7. **Confirmez le formatage** – toutes les données sur le lecteur seront supprimées

## Persistance automatique des modifications

MiniOS détectera automatiquement la méthode d’écriture et configurera la persistance des modifications :

- **Mode DD** : Si de l’espace libre est disponible, une partition ext4 sera créée pour des performances maximales
- **Mode ISO** : Utilise un fichier dynamique pour enregistrer les modifications

### Configuration des paramètres (pour utilisateurs avancés)

Lorsque vous avez besoin d’une configuration précise de la persistance, vous pouvez utiliser des paramètres de démarrage :

- `perchmode=native` – Sauvegarde directe sur la partition (pour le mode DD)
- `perchmode=dynfilefs` – Fichier extensible dynamiquement
- `perchmode=raw` – Fichier de taille fixe
- `perchsize=8000` – Taille de l’espace de stockage des données en Mo

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
