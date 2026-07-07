# Utilisation de l’installateur MiniOS

L’installateur MiniOS est un outil graphique permettant d’installer MiniOS sur des disques durs ou clés USB, avec prise en charge UEFI/BIOS et compatibilité avec plusieurs systèmes de fichiers.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours soigneusement le périphérique choisi et sauvegardez vos données importantes.

## Exigences pour le disque

### Taille du disque

Consultez le [Guide de compatibilité matérielle](Hardware-Compatibility.md#system-requirements) pour connaître en détail les exigences système et les tailles de disque.

### Systèmes de fichiers pris en charge

- **ext4** (recommandé pour Linux)
- **Btrfs** (système de fichiers moderne avec snapshots)
- **FAT32** (compatibilité maximale)
- **NTFS** (compatibilité Windows)

## Création de l’installation

### Lancement de l’installateur MiniOS

**Depuis le menu des applications :**
1. Ouvrez le menu → Système → « Installer MiniOS »

**Depuis le terminal :**
```bash
sudo minios-installer
```

### Processus d’installation

1. **Configurer les paramètres système (Optionnel mais recommandé) :**
   - Cliquez sur le bouton **« Configurer MiniOS avant l’installation »**
   - Définissez vos préférences :
     - Langue et paramètres régionaux du système
     - Fuseau horaire et disposition du clavier  
     - Comptes utilisateurs et mots de passe
     - Nom d’hôte et services système
   - Enregistrez et fermez le configurateur
   
2. **Sélectionner le périphérique cible :**
   - Choisissez un disque dur ou une clé USB dans la liste
   - Vérifiez la taille et le modèle du périphérique
   
3. **Sélectionner le système de fichiers :**
   - **ext4** : recommandé dans la plupart des cas
   - **Btrfs** : pour utilisateurs avancés
   - **FAT32** : pour une compatibilité maximale
   
4. **Confirmer l’effacement du disque :**
   - Toutes les données sur le périphérique sélectionné seront supprimées
   - Assurez-vous d’avoir choisi le bon périphérique
   
5. **Démarrer l’installation :**
   - Cliquez sur le bouton « Installer »
   - Attendez la fin du processus
   
6. **Finalisation :**
   - Redémarrez le système
   - Retirez la LiveUSB/LiveCD
   - **Résultat :** Le système démarre avec vos paramètres préconfigurés

## Configuration avant installation

### Avantages de l’utilisation du configurateur MiniOS avant l’installation

**Flux de travail recommandé pour les nouveaux utilisateurs :**

1. **Configuration unique** : Définissez toutes vos préférences système une seule fois avant l’installation
2. **Prêt à l’emploi** : Le système installé démarre avec la bonne langue, le bon clavier et les bons paramètres utilisateur
3. **Aucune configuration après installation** : Évitez la configuration manuelle au premier démarrage
4. **Expérience cohérente** : Les mêmes paramètres sur toutes les installations

**Options de configuration disponibles :**
- **🌍 Localisation** : Langue du système, paramètres régionaux et fuseau horaire
- **⌨️ Saisie** : Dispositions clavier et options de basculement  
- **👤 Comptes** : Nom d’utilisateur, nom complet, mots de passe et groupes d’utilisateurs
- **🖥️ Système** : Nom d’hôte, services activés/désactivés
- **🔒 Sécurité** : Définition d’un mot de passe sécurisé avant connexion Internet

**Flux de travail simple :**
- Configurez vos préférences une fois avant l’installation
- Installez MiniOS avec vos paramètres personnalisés
- Démarrez sur un système entièrement configuré

## Persistance automatique des modifications

Après l’installation, l’installateur MiniOS crée un système sur le périphérique sélectionné :

- **Compatibilité UEFI/BIOS** : Création automatique des partitions de démarrage nécessaires
- **Persistance des modifications** : Prise en charge complète des modes de persistance MiniOS
- **Systèmes de fichiers** : Prise en charge de ext4, Btrfs, FAT32, NTFS

### Configuration des paramètres (pour utilisateurs avancés)

Pour une configuration précise de la persistance, des paramètres de démarrage peuvent être utilisés :

- `perchmode=native` - Sauvegarde directe sur la partition (si espace libre disponible)
- `perchmode=dynfilefs` - Fichier extensible dynamiquement
- `perchmode=raw` - Fichier de taille fixe
- `perchsize=8000` - Taille de l’espace de stockage pour les données en Mo

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
