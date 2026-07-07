# Gestion du noyau dans MiniOS 🔧

## 🤔 Pourquoi remplacer le noyau ?

MiniOS est livré avec un noyau par défaut, mais il existe plusieurs raisons pour lesquelles vous pourriez vouloir le remplacer :

### 🔧 **Différentes variantes du noyau Debian**

Debian propose plusieurs variantes de noyau optimisées pour différents cas d’utilisation :

- **`linux-image-6.12.38+deb13-amd64`** - Noyau standard pour systèmes 64 bits (par défaut dans MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Noyau temps réel pour les applications critiques
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Optimisé pour les environnements cloud et virtualisés

> **📝 Remarque :** Les numéros de version (comme `6.12.38+deb13`) évoluent avec les mises à jour. Pour trouver les noyaux actuellement disponibles :
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### 🎯 **Cas d’utilisation spécialisés**

- **Calcul temps réel** – Noyaux RT pour la production audio, le contrôle industriel
- **Jeux et faible latence** – Noyaux personnalisés optimisés pour le gaming
- **Renforcement de la sécurité** – Noyaux avec correctifs de sécurité supplémentaires (grsecurity, etc.)
- **Compatibilité matérielle** – Noyaux récents pour le support du nouveau matériel
- **Optimisation des performances** – Noyaux compilés sur mesure avec optimisations spécifiques

### 🛠️ **Fonctionnalités personnalisées du noyau**

- **Correctifs personnalisés** – Appliquez des correctifs spécifiques à votre matériel ou à votre usage
- **Modules noyau** – Ajoutez la prise en charge de matériels ou de systèmes de fichiers spécialisés
- **Optimisations du compilateur** – Compilez avec différents indicateurs d’optimisation
- **Optimisation de la taille** – Supprimez les pilotes inutiles pour réduire la taille du noyau

### 📈 **Scénarios courants**

- **Stations de travail audio** – Utilisez un noyau RT pour une latence audio minimale
- **Systèmes de jeu** – Appliquez des correctifs et optimisations spécifiques au gaming
- **Environnements serveurs** – Utilisez des noyaux optimisés cloud pour une meilleure virtualisation
- **Matériel ancien** – Utilisez des noyaux plus anciens pour la compatibilité avec des systèmes vintage
- **Systèmes de développement** – Testez vos applications sur différentes versions du noyau

---

## ⚙️ Présentation du gestionnaire de noyau MiniOS

MiniOS propose deux outils pour la gestion des noyaux :

1. **🖥️ MiniOS Kernel Manager (GUI) :** Une application graphique conviviale pour empaqueter, installer et gérer les noyaux
2. **⌨️ minios-kernel (CLI) :** Un outil en ligne de commande pour les utilisateurs avancés et l’automatisation

Les deux outils gèrent automatiquement :
- **L’empaquetage du noyau** au format SquashFS
- **La génération de l’initramfs** avec les bons pilotes et scripts de démarrage
- **L’installation** dans le dépôt de noyaux MiniOS
- **La mise à jour** de la configuration du bootloader
- **L’activation** et le changement de noyau

### ⚠️ **Points importants à prendre en compte :**

- **🔑 Privilèges administrateur :** Les deux outils nécessitent des privilèges administrateur et demanderont une authentification via PolicyKit
- **🔗 Compatibilité des noyaux :** Assurez-vous que les noyaux sont compatibles avec MiniOS. Il est recommandé d’utiliser les noyaux du dépôt
- **💾 Répertoire MiniOS :** Les outils détectent automatiquement le répertoire MiniOS (`/minios/`) et vérifient les droits d’écriture
- **🔄 Mises à jour automatiques :** Les configurations du bootloader sont mises à jour automatiquement lors de l’activation d’un noyau

---

## 🖥️ Méthode 1 : Utilisation du gestionnaire de noyau MiniOS (GUI)

Le gestionnaire graphique de noyaux offre une interface intuitive pour toutes les opérations liées au noyau.

### 📝 **Étapes :**

#### 1. 🚀 **Lancer l’application**

```bash
minios-kernel-manager
```

Ou recherchez "MiniOS Kernel Manager" dans le menu de vos applications.

#### 2. 📦 **Empaqueter un nouveau noyau**

**Dans l’onglet Empaqueter un noyau :**

1. **Sélectionner la source du noyau :**
   - **Empaquetage manuel :** Parcourez et sélectionnez un paquet noyau `.deb` local
   - **Dépôt :** Choisissez parmi les noyaux disponibles dans les dépôts Debian/Ubuntu

2. **Configurer la compression :**
   - Sélectionnez la compression SquashFS : `zstd` (recommandé), `lz4`, `lzo`, `xz` ou `gzip`

3. **Empaqueter le noyau :**
   - Cliquez sur le bouton "Empaqueter le noyau"
   - Suivez la progression dans le journal d’empaquetage
   - Les fichiers sont automatiquement installés dans le dépôt MiniOS

#### 3. 🔄 **Gérer les noyaux installés**

**Dans l’onglet Gérer les noyaux :**

1. **Voir les noyaux disponibles :**
   - Affiche tous les noyaux empaquetés avec des badges d’état :
     - **ACTIF :** Noyau actuellement configuré
     - **EN COURS :** Noyau actuellement démarré
     - **DISPONIBLE :** Disponible pour activation

2. **Activer un noyau :**
   - Faites un clic droit sur un noyau et sélectionnez "Activer le noyau"
   - Confirmez la boîte de dialogue d’activation
   - La configuration du bootloader est mise à jour automatiquement

3. **Supprimer un noyau :**
   - Faites un clic droit sur un noyau inactif et sélectionnez "Supprimer le noyau"
   - Confirmez la suppression (action irréversible)

---

## ⌨️ Méthode 2 : Utilisation de minios-kernel (CLI)

L’outil en ligne de commande permet une gestion scriptable des noyaux.

### ⚠️ **Privilèges administrateur requis :**

L’outil CLI nécessite les droits root et les vérifie automatiquement. Exécutez les commandes avec `sudo` ou via `pkexec` :

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### 📝 **Commandes de base :**

#### 1. 📋 **Lister les noyaux disponibles**

```bash
sudo minios-kernel list
```

Affiche tous les noyaux empaquetés avec leur statut.

#### 2. 📦 **Empaqueter un noyau**

**Depuis le dépôt :**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**Depuis un fichier .deb local :**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Avec une compression personnalisée :**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. 🔄 **Activer un noyau**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. 🗑️ **Supprimer un noyau**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. 📊 **Vérifier le statut**

```bash
sudo minios-kernel status
```

Affiche le statut du répertoire MiniOS et les informations sur le noyau en cours.

#### 6. ℹ️ **Afficher les informations du noyau**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Affiche des informations détaillées sur un noyau spécifique, y compris son statut et sa disponibilité.

### 🔧 **Options avancées du CLI :**

#### **Sortie JSON (pour les scripts) :**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Options avancées d’empaquetage :**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Aide et utilisation :**

```bash
minios-kernel --help                    # General help (doesn't require root)
sudo minios-kernel package --help       # Package command help
sudo minios-kernel list --help          # List command help
sudo minios-kernel activate --help      # Activate command help
sudo minios-kernel info --help          # Info command help
sudo minios-kernel status --help        # Status command help
sudo minios-kernel delete --help        # Delete command help
```

---

## 🔧 Dépannage

### Problèmes courants et solutions :

#### **🚫 Répertoire MiniOS introuvable**

- **Cause :** Les outils ne trouvent pas le répertoire MiniOS
- **Solution :** Vérifiez que vous êtes bien sur un système MiniOS ou que la clé USB est correctement montée
- **Vérification :** Exécutez `sudo minios-kernel status` pour vérifier la détection du répertoire

#### **🔒 Permission refusée**

- **Cause :** Le répertoire MiniOS est en lecture seule ou les droits sont insuffisants
- **Solution :** Assurez-vous d’avoir les droits administrateur et que le système de fichiers est accessible en écriture
- **Vérification :** Vérifiez le statut du répertoire MiniOS dans le GUI ou le CLI

#### **📦 Échec de l’installation du paquet**

- **Cause :** Paquet corrompu, problème réseau ou dépendances manquantes
- **Solution :** 
  - Vérifiez l’intégrité du fichier paquet
  - Vérifiez la connectivité réseau pour les paquets du dépôt
  - Mettez à jour la liste des paquets : `sudo apt update`

#### **💥 Kernel panic après activation**

- **Cause :** Noyau incompatible ou pilotes manquants
- **Solution :** 
  - Démarrez en mode secours ou avec un noyau précédent
  - Utilisez `sudo minios-kernel activate <working-version>` pour activer un noyau fonctionnel connu
  - Vérifiez la compatibilité du noyau avec votre matériel

#### **🔄 Le système démarre sur l’ancien noyau**

- **Cause :** La configuration du bootloader n’a pas été mise à jour correctement
- **Solution :** 
  - Relancez l’activation du noyau : `sudo minios-kernel activate <version>`
  - Vérifiez que le noyau a bien été empaqueté et installé

#### **⚠️ Matériel non fonctionnel après changement de noyau**

- **Cause :** Pilotes manquants dans le nouveau noyau
- **Solution :**
  - Vérifiez que le module noyau SquashFS a été installé
  - Vérifiez si le nouveau noyau prend en charge votre matériel
  - Envisagez d’utiliser une autre variante de noyau

#### **🚨 Récupération du noyau depuis l’image MiniOS d’origine**

Si vous devez restaurer un noyau corrompu ou incompatible, vous pouvez démarrer depuis l’ISO/USB MiniOS d’origine :

```bash
# Boot from original MiniOS image with from= parameter
# At boot prompt, specify your installed MiniOS device
from=/dev/sda1  # Replace with your actual MiniOS device
```

**Procédure de récupération :**
Lorsque vous démarrez depuis l’image ISO/USB MiniOS d’origine et que vous indiquez dans le paramètre `from=` le périphérique où MiniOS est installé, le système d’initialisation le détecte et vous permet d’accéder à votre installation MiniOS. La méthode de récupération dépend de la présence ou non des fichiers noyau d’origine :

1. **Si le noyau d’origine existe encore :** 
   - Le démarrage s’effectue normalement avec le noyau d’origine depuis l’ISO/USB
   - Activez manuellement le noyau d’origine : `sudo minios-kernel activate <original-kernel-version>`

2. **Si le noyau d’origine a été supprimé :** 
   - Copiez manuellement les fichiers noyau depuis l’image MiniOS d’origine et restaurez-les aux emplacements appropriés sur votre installation MiniOS
   - Activez manuellement le noyau restauré : `sudo minios-kernel activate <original-kernel-version>`

Dans les deux cas, l’activation du noyau nécessite une intervention manuelle après la récupération.

### 🔍 **Commandes de diagnostic :**

**Vérifier l’état actuel du système :**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Vérifier les fichiers du noyau :**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Vérifier la configuration du bootloader :**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## 📋 Aperçu de la structure des fichiers

Le gestionnaire de noyau MiniOS gère automatiquement ces fichiers :

### **Structure du dépôt Kernel :**

```
/minios/
├── 01-kernel.sb                   # Active kernel module (standard location)
├── kernels/                       # Repository of inactive/alternative kernels
│   ├── 01-kernel-<version>.sb     # SquashFS kernel modules
│   ├── vmlinuz-<version>          # Kernel binaries
│   └── initrfs-<version>.img      # Initial RAM filesystems
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Remarque :** Le module standard `01-kernel.sb` fourni avec MiniOS contient des pilotes supplémentaires par rapport à ceux inclus dans les paquets kernel du dépôt d’origine. Ces pilotes additionnels offrent une meilleure compatibilité matérielle pour les adaptateurs sans fil et les périphériques de stockage.

### **Indicateurs d’état :**

- **ACTIF :** Kernel configuré dans le bootloader (sera lancé au prochain redémarrage)
- **EN COURS :** Kernel actuellement en cours d’exécution
- **DISPONIBLE :** Packagé et prêt à être activé

### **Opérations automatiques :**

- ✅ Packaging et compression du kernel
- ✅ Génération de l’initramfs avec les bons pilotes
- ✅ Installation dans le dépôt MiniOS
- ✅ Mise à jour de la configuration du bootloader
- ✅ Gestion des liens symboliques pour les kernels actifs
- ✅ Nettoyage des fichiers temporaires

---

## 🎯 Bonnes pratiques

### **Sélection du kernel :**

- Utilisez de préférence les kernels des dépôts officiels Debian/Ubuntu
- Testez les nouveaux kernels d’abord en environnement non productif
- Gardez au moins un kernel fonctionnel connu pour la récupération

### **Avant l’installation :**

- Vérifiez que le répertoire MiniOS est accessible en écriture
- Assurez-vous d’avoir suffisamment d’espace disque (les kernels peuvent faire entre 100 et 500 Mo)
- Mettez à jour la liste des paquets pour les kernels du dépôt

### **Après l’installation :**

- Testez minutieusement le nouveau kernel
- Vérifiez que tout le matériel fonctionne correctement
- Conservez l’ancien kernel en sauvegarde tant que le nouveau n’a pas prouvé sa stabilité

### **Planification de la récupération :**

- Gardez toujours une sauvegarde d’un kernel fonctionnel
- Sachez comment démarrer depuis un média de secours si nécessaire
- Documentez les kernels compatibles avec votre configuration matérielle
