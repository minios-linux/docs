---
updated: 2026-08-31
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Gestion des noyaux

## Pourquoi remplacer le noyau ?

MiniOS est livré avec un noyau par défaut, mais il existe plusieurs raisons pour lesquelles vous pourriez vouloir le remplacer :

### **Différentes variantes du noyau Debian**

Debian propose plusieurs variantes de noyau optimisées pour différents usages :

- **`linux-image-6.12.38+deb13-amd64`** - Noyau standard pour systèmes 64 bits (par défaut dans MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Noyau temps réel pour les applications critiques en temps réel
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Optimisé pour les environnements cloud et virtualisés

> **Remarque :** Les numéros de version (par exemple `6.12.38+deb13`) évoluent avec les mises à jour. Pour connaître les noyaux actuellement disponibles :
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Cas d’utilisation spécialisés**

- **Calcul temps réel** : Noyaux RT pour la production audio, le contrôle industriel
- **Jeux et faible latence** : Noyaux personnalisés avec optimisations pour le gaming
- **Renforcement de la sécurité** : Noyaux avec correctifs de sécurité supplémentaires (grsecurity, etc.)
- **Compatibilité matérielle** : Noyaux plus récents pour la prise en charge du matériel récent
- **Optimisation des performances** : Noyaux compilés sur mesure avec des optimisations spécifiques

### **Fonctionnalités personnalisées du noyau**

- **Correctifs personnalisés** : Appliquez des correctifs spécifiques pour votre matériel ou cas d’usage
- **Modules du noyau** : Ajoutez la prise en charge de matériels ou de systèmes de fichiers spécialisés
- **Optimisations du compilateur** : Compilez avec différents indicateurs d’optimisation
- **Optimisation de la taille** : Supprimez les pilotes inutiles pour réduire la taille du noyau

### **Scénarios courants**

- **Stations de travail audio** : Utilisez un noyau RT pour une latence audio minimale
- **Systèmes de jeux** : Appliquez des correctifs et optimisations spécifiques au gaming
- **Environnements serveurs** : Utilisez des noyaux optimisés cloud pour une meilleure virtualisation
- **Matériel ancien** : Utilisez des noyaux plus anciens pour la compatibilité avec des systèmes vintage
- **Systèmes de développement** : Testez des applications avec différentes versions de noyau

---

## MiniOS Présentation du Gestionnaire de noyaux

MiniOS propose deux outils pour la gestion des noyaux :

1. **MiniOS Gestionnaire de noyaux (GUI) :** Une application graphique conviviale pour empaqueter, installer et gérer les noyaux
2. **minios-kernel (CLI) :** Un outil en ligne de commande destiné aux utilisateurs avancés et à l'automatisation

Les deux outils gèrent automatiquement :
- **L’empaquetage du noyau** au format SquashFS
- **La génération d’initramfs** avec les bons pilotes et scripts de démarrage
- **L’installation** dans le dépôt de noyaux MiniOS
- **La mise à jour de la configuration du chargeur d’amorçage**
- **L’activation et le basculement du noyau**

Cette page traite du système live modulaire MiniOS. MiniOS Gestionnaire de noyaux et `minios-kernel` existent pour cette architecture live et son module noyau coordonné, `vmlinuz`, ainsi que l’ensemble initramfs associé. Après conversion native, le système adopte le flux de travail classique des noyaux Debian ; les outils live de noyau MiniOS sont alors supprimés, car le modèle de noyau modulaire ne s’applique plus. Il faut donc utiliser les paquets noyau Debian, les outils initramfs et le chargeur d’amorçage installé. Consultez [À propos de MiniOS](/getting-started/About-MiniOS) et [Modes de démarrage](/using-minios/Boot-Modes). Pour le comportement exact du noyau coordonné de l’initrd live, voir [Chargement des modules dans l’initrd](/reference/boot-process/Module-Loading).

### **Points importants à prendre en compte :**

- **Privilèges administratifs :** Les deux outils nécessitent des privilèges administratifs et demanderont une authentification via PolicyKit
- **Compatibilité des noyaux :** Assurez-vous que les noyaux sont compatibles avec MiniOS. Il est recommandé d’utiliser les noyaux du dépôt
- **Répertoire MiniOS :** Les outils détectent automatiquement le répertoire MiniOS (`/minios/`) et vérifient les droits d’écriture
- **Mises à jour automatiques :** Les configurations du chargeur d’amorçage sont mises à jour automatiquement lors de l’activation d’un noyau

---

## Méthode 1 : Utilisation du gestionnaire de noyaux MiniOS (GUI)

Le gestionnaire graphique de noyaux offre une interface intuitive pour toutes les opérations sur les noyaux.

### **Étapes :**

#### 1. **Lancer l’application**

```bash
minios-kernel-manager
```

Ou recherchez « Gestionnaire de noyaux MiniOS » dans le menu de vos applications.

#### 2. **Créer un nouveau paquet noyau**

**Dans l’onglet « Package Kernel » :**

1. **Sélectionner la source du noyau :**
   - **Paquet manuel :** Parcourez et sélectionnez un paquet noyau local `.deb`
   - **Dépôt :** Choisissez parmi les noyaux disponibles dans les dépôts Debian/Ubuntu

2. **Configurer la compression :**
   - Sélectionnez la compression SquashFS : `zstd` (recommandé), `lz4`, `lzo`, `xz` ou `gzip`

3. **Créer le paquet noyau :**
   - Cliquez sur le bouton « Package Kernel »
   - Suivez la progression dans le journal d’empaquetage
   - Les fichiers sont automatiquement installés dans le dépôt MiniOS

#### 3. **Gérer les noyaux installés**

**Dans l’onglet « Manage Kernels » :**

1. **Afficher les noyaux disponibles :**
   - Consultez tous les noyaux empaquetés avec des badges d’état :
     - **ACTIVE :** Noyau actuellement configuré
     - **RUNNING :** Noyau actuellement démarré
     - **AVAILABLE :** Disponible pour activation

2. **Activer un noyau :**
   - Faites un clic droit sur un noyau et sélectionnez « Activate Kernel »
   - Confirmez la boîte de dialogue d’activation
   - La configuration du chargeur d’amorçage est mise à jour automatiquement

3. **Supprimer un noyau :**
   - Faites un clic droit sur un noyau inactif et sélectionnez « Delete Kernel »
   - Confirmez la suppression (action irréversible)

---

## Méthode 2 : Utilisation de minios-kernel (CLI)

L’outil en ligne de commande offre des capacités de gestion des noyaux scriptables.

### **Privilèges administrateur requis :**

L’outil CLI nécessite les droits root et les vérifiera automatiquement. Exécutez les commandes avec `sudo` ou via `pkexec` :

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### **Commandes de base :**

#### 1. **Lister les noyaux disponibles**

```bash
sudo minios-kernel list
```

Affiche tous les noyaux empaquetés avec leur statut.

#### 2. **Créer un paquet de noyau**

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

#### 3. **Activer un noyau**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. **Supprimer un noyau**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. **Vérifier l’état**

```bash
sudo minios-kernel status
```

Affiche l’état du répertoire MiniOS et les informations sur le noyau en cours.

#### 6. **Afficher les informations du noyau**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Affiche des informations détaillées sur un noyau spécifique, y compris son statut et sa disponibilité.

### **Options avancées de la CLI :**

#### **Sortie JSON (pour les scripts) :**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Options avancées de création de paquet :**

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

## Dépannage

### Problèmes courants et solutions :

#### **Répertoire MiniOS introuvable**

- **Cause :** Les outils ne parviennent pas à localiser le répertoire MiniOS
- **Solution :** Assurez-vous d’utiliser un système MiniOS ou que la clé USB est correctement montée
- **Vérification :** Exécutez `sudo minios-kernel status` pour vérifier la détection du répertoire

#### **Permission refusée**

- **Cause :** Le répertoire MiniOS est en lecture seule ou les droits sont insuffisants
- **Solution :** Vérifiez que vous disposez des privilèges administratifs et que le système de fichiers est accessible en écriture
- **Vérification :** Contrôlez le statut du répertoire MiniOS dans l’interface graphique ou en ligne de commande

#### **Échec de l’installation du paquet**

- **Cause :** Paquet corrompu, problème réseau ou dépendances manquantes
- **Solution :**
  - Vérifiez l’intégrité du fichier paquet
  - Contrôlez la connectivité réseau pour les paquets du dépôt
  - Mettez à jour la liste des paquets : `sudo apt update`

#### **Kernel panic après activation**

- **Cause :** Noyau incompatible ou pilotes manquants
- **Que faire :** Démarrez un système MiniOS fonctionnel, sauvegardez les données importantes et restaurez un ensemble complet de noyau connu comme fonctionnel uniquement si celui-ci est disponible. Sinon, réinstallez l’installation MiniOS concernée. N’essayez pas de réparer le système en mélangeant des fichiers individuels de noyau, initramfs ou `01-kernel-*.sb`. Consultez la section [Dépannage](/maintenance-and-recovery/Troubleshooting).

#### **Le système démarre sur l’ancien noyau**

- **Cause :** La configuration du chargeur d’amorçage n’a pas été correctement mise à jour
- **Solution :**
  - Relancez l’activation du noyau : `sudo minios-kernel activate <version>`
  - Vérifiez que le noyau a bien été empaqueté et installé

#### **Le matériel ne fonctionne plus après un changement de noyau**

- **Cause :** Pilotes manquants dans le nouveau noyau
- **Solution :**
  - Vérifiez que le fichier module du noyau SquashFS a bien été installé
  - Contrôlez si le nouveau noyau prend en charge votre matériel
  - Envisagez d’utiliser une autre variante de noyau

#### **Récupération après un changement de noyau échoué**

Ne copiez pas une image de noyau, un initramfs ou un module `01-kernel-*.sb` individuel depuis une autre image. Un noyau MiniOS amorçable nécessite un ensemble coordonné. Si un ensemble complet fonctionnel n’est pas déjà disponible via le flux de gestion des noyaux, réinstallez l’installation MiniOS concernée plutôt que d’assembler manuellement les composants de démarrage. Sauvegardez d’abord les données importantes ; consultez la section [Dépannage](/maintenance-and-recovery/Troubleshooting).

### **Commandes de diagnostic :**

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

**Vérifier la configuration du chargeur d’amorçage :**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Aperçu de la structure des fichiers

Le gestionnaire de noyau MiniOS gère automatiquement les fichiers suivants :

### **Structure du dépôt de noyaux :**

```
/minios/
├── 01-kernel-<version>.sb         # Active kernel module
├── kernels/                       # Repository of inactive/alternative kernels
│   └── <version>/
│       ├── 01-kernel-<version>.sb # SquashFS kernel module
│       ├── vmlinuz-<version>      # Kernel image
│       └── initrfs-<version>.img  # Initial RAM filesystem
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Remarque :** Le module standard `01-kernel-<version>.sb` fourni avec MiniOS contient des pilotes supplémentaires par rapport aux paquets de noyau du dépôt d’origine. Ces pilotes supplémentaires offrent une meilleure compatibilité matérielle pour les adaptateurs sans fil et les périphériques de stockage.

### **Indicateurs d’état :**

- **ACTIF :** Noyau configuré dans le bootloader (démarrera au prochain redémarrage)
- **EN COURS D’EXÉCUTION :** Noyau actuellement en fonctionnement
- **DISPONIBLE :** Emballé et prêt à être activé

### **Opérations automatiques :**

- Emballage et compression du noyau
- Génération de l’initramfs avec les bons pilotes
- Installation dans le dépôt MiniOS
- Mise à jour de la configuration du bootloader
- Gestion des liens symboliques pour les noyaux actifs
- Nettoyage des fichiers temporaires

---

## Bonnes pratiques

### **Sélection du noyau :**

- Utilisez de préférence les noyaux issus des dépôts officiels Debian/Ubuntu
- Testez les nouveaux noyaux dans des environnements non productifs en premier lieu
- Conservez toujours au moins un noyau fonctionnel connu pour la récupération

### **Avant l’installation :**

- Vérifiez que le répertoire MiniOS est accessible en écriture
- Assurez-vous de disposer de suffisamment d’espace disque (les noyaux peuvent faire entre 100 et 500 Mo)
- Mettez à jour la liste des paquets pour les noyaux du dépôt

### **Après l’installation :**

- Testez soigneusement le nouveau noyau
- Vérifiez le bon fonctionnement de tout le matériel
- Conservez l’ancien noyau en sauvegarde jusqu’à ce que le nouveau soit jugé stable

### **Planification de la récupération :**

- Conservez toujours un triplet de noyau complet et fonctionnel
- Sachez comment démarrer depuis un support de secours si nécessaire
- Documentez les noyaux compatibles avec votre configuration matérielle
