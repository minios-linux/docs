# Utilisation de Ventoy

Ventoy est un outil populaire pour créer des clés USB bootables permettant de stocker plusieurs fichiers ISO sur un même support et de démarrer depuis n'importe lequel d'entre eux.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

⚠️ **Exigence du mode de démarrage :** Pour que MiniOS fonctionne correctement avec Ventoy, vous DEVEZ sélectionner le **mode GRUB2** lors du démarrage, ou renommer votre fichier ISO avec le suffixe `VTGRUB2` (ex. : `minios-standard-amd64_VTGRUB2.iso`) pour forcer automatiquement le mode GRUB2.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour les exigences système détaillées et les tailles de supports.

## Installation de Ventoy

### Méthode 1 : Installation standard

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez l’installateur Ventoy** et sélectionnez votre clé USB
3. **Installez Ventoy** sur le support (toutes les données seront supprimées)
4. **Copiez le fichier ISO de MiniOS** à la racine de la clé USB

Après l'installation, le support sera prêt à l'emploi. MiniOS créera automatiquement un espace de stockage pour sauvegarder les modifications.

### Méthode 2 : Installation avec partition de données séparée (recommandé)

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez l’installateur Ventoy** et sélectionnez votre clé USB  
3. **Activez l’option "Réserver de l’espace"** lors de l’installation pour créer une partition supplémentaire
4. **Installez Ventoy** sur le support
5. **Copiez le fichier ISO de MiniOS** à la racine de la clé USB
6. **Créez une partition ext4** dans l’espace réservé avec le label `persistence`

Cette méthode offre des performances de données plus rapides et un meilleur contrôle du stockage.

## Intégration avec MiniOS

MiniOS inclut une prise en charge native de Ventoy et détecte automatiquement lorsqu’il s’exécute dans un environnement Ventoy. Le système configure automatiquement la persistance des modifications sans configuration supplémentaire de l’utilisateur.

### Persistance automatique des modifications

MiniOS détecte automatiquement l’exécution dans un environnement Ventoy et configure la persistance des modifications :

- **Avec une partition `persistence` séparée** : Utilisée pour le stockage direct des données (mode natif, vitesse maximale)
- **Avec une installation standard** : Crée un fichier dynamique dans la partition principale de Ventoy (mode dynfilefs)

### Configuration des paramètres (pour utilisateurs avancés)

Lorsque vous avez besoin d’une configuration précise, des paramètres de démarrage peuvent être utilisés :

**Pour une partition `persistence` séparée (tous les modes disponibles) :**
- `perchmode=native` - Sauvegarde directe sur la partition (le plus rapide)
- `perchmode=dynfilefs` - Fichier dynamique extensible
- `perchmode=raw` - Fichier de taille fixe

**Pour une installation standard de Ventoy (deux modes disponibles) :**
- `perchmode=dynfilefs` - Fichier dynamique extensible (par défaut, économise de l’espace)
- `perchmode=raw` - Fichier de taille fixe

**Paramètres communs pour les fichiers :**
- `perchsize=8000` - Taille de l’espace de stockage des données en Mo

Plus de détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).

## Utilisation de MiniOS avec Ventoy

### Démarrage

Après avoir installé Ventoy et copié le fichier ISO de MiniOS sur le support :

1. **Démarrez depuis la clé USB** - sélectionnez-la dans le BIOS/UEFI
2. **Sélectionnez MiniOS** dans la liste des fichiers ISO disponibles dans le menu Ventoy
3. **⚠️ IMPORTANT : Sélectionnez le mode GRUB2** lorsque Ventoy le demande
4. **Patientez pendant le chargement** - le système se configurera automatiquement pour fonctionner

### **Exigences du mode de démarrage Ventoy**

**Pour que MiniOS fonctionne correctement :**
- **Mode GRUB2** - Nécessaire pour le bon fonctionnement de MiniOS

**Solution alternative :**
- Ajoutez le suffixe `VTGRUB2` au nom du fichier ISO (ex. : `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Cela force Ventoy à utiliser automatiquement le mode GRUB2 sans demander
