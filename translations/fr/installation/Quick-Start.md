# Bien démarrer avec MiniOS 🌟

Bienvenue sur MiniOS, où la flexibilité et la portabilité de Linux rencontrent la simplicité et la facilité d’utilisation. Si vous découvrez MiniOS, ce guide complet vous aidera à prendre en main votre système d’exploitation et à en tirer le meilleur parti.

## Étape 1 : Choisir la bonne édition de MiniOS 📦

MiniOS propose trois éditions principales, chacune adaptée à des besoins spécifiques :

- **🚀 Standard** – Le compagnon fiable pour les tâches informatiques quotidiennes
- **🧰 Toolbox** – La boîte à outils pour utilisateurs avancés avec des utilitaires système puissants
- **⚡ Ultra** – La solution tout-en-un avec l’ensemble des fonctionnalités

Pour une description détaillée des fonctionnalités et logiciels inclus dans chaque édition, consultez [À propos de MiniOS](/about/About-MiniOS.md).

**Options de téléchargement :**
- **Site officiel** : [minios.dev](https://minios.dev) – Présentation complète des éditions et téléchargements directs
- **GitHub Releases** : [Dernières versions](https://github.com/minios-linux/minios-live/releases) – Toutes les versions et notes de publication

Pour une liste détaillée des paquets inclus dans chaque édition, consultez la [Liste des paquets](/administration/Packages.md).

## Étape 2 : Créer une clé USB bootable 🔌

**Méthodes d’installation recommandées :**

### 🖥️ **Windows**

- **[Rufus](/installation/tools/Rufus.md)** ⭐ – Simple et fiable
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ – Interface graphique multiplateforme
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ – Prise en charge du multi-boot

### 🐧 **Linux**

- **[Commande dd](/installation/tools/dd.md)** ⭐ – Outil en ligne de commande rapide
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ – Interface graphique conviviale

### 🍎 **macOS**

- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ – Interface graphique facile à utiliser
- **[Commande dd](/installation/tools/dd.md)** ⭐ – Outil terminal intégré

### 🏠 **Depuis MiniOS**

- **[MiniOS Installer](/installation/MiniOS-Installer.md)** – Outil graphique intégré

**Méthodes supplémentaires :** [UNetbootin](/installation/tools/UNetbootin.md), [Drive Utility](/installation/tools/Drive-Utility.md), [Méthode originale](/installation/tools/Original-Method.md)

### Exigences de taille du support

- **Standard (787 Mo)** : minimum 2 Go
- **Toolbox (1,2 Go)** : minimum 4 Go
- **Ultra (1,7 Go)** : minimum 4 Go
- **Taille recommandée** : 8 Go ou plus pour un fonctionnement confortable avec la persistance des modifications

**Remarques importantes :**
- Chaque lien ci-dessus fournit des instructions détaillées étape par étape
- Les méthodes recommandées (⭐) sont testées pour leur fiabilité et leur simplicité
- Choisissez la méthode la plus adaptée à votre système d’exploitation et à votre niveau d’expérience

## Étape 3 : Démarrer et explorer 🖥️

Après avoir démarré depuis la clé USB, découvrez l’environnement de bureau MiniOS :

**Fonctionnalités clés à explorer** :
- Menu des applications (panneau en bas à gauche)
- Paramètres système et préférences
- Gestionnaire de fichiers (Thunar)
- Applications préinstallées (navigateur, suite bureautique, utilitaires)
- Options de personnalisation du bureau

L’environnement de bureau par défaut est XFCE, offrant un équilibre entre fonctionnalités et performance.

## Étape 4 : Configuration du système 🌐

**Configurez la langue du système, le clavier, le fuseau horaire et d’autres préférences :**

### 🔧 **Utiliser le Configurateur MiniOS** (Recommandé)

**Accès :** Menu Applications → Système → Configurer MiniOS

**Principaux réglages configurables :**
- **🌍 Langue & Locale** : Définir la langue du système (ex : `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Fuseau horaire** : Configurer votre fuseau horaire (ex : `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Clavier** : Définir les dispositions et options de basculement (ex : `us,ru` avec `Alt+Shift`)
- **👤 Paramètres utilisateur** : Modifier le nom d’utilisateur, le nom complet et les groupes
- **🔐 Mots de passe** : Définir des mots de passe sécurisés pour les comptes utilisateur et root
- **🖥️ Système** : Configurer le nom d’hôte, activer/désactiver des services
- **🔧 Avancé** : Options de démarrage et comportement du système

**Comment faire :**
1. Ouvrez le Configurateur MiniOS depuis le menu système
2. Naviguez dans les onglets pour configurer chaque aspect
3. Appliquez vos modifications et enregistrez
4. **Redémarrez pour appliquer les changements** – les paramètres prennent effet après le redémarrage et persistent

**Note technique :** Le Configurateur MiniOS modifie le fichier `/etc/live/config.conf`, qui est le principal fichier de configuration de MiniOS contrôlant le comportement du système au démarrage. Pour plus d’informations sur les paramètres et leur fonctionnement, consultez le guide [Fichier de configuration](/configuration/Configuration-File.md).

### 💻 **Alternative : Configuration en ligne de commande**

**Modifications immédiates (appliquées tout de suite) :**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**Pour des changements persistants après redémarrage :** Utilisez le Configurateur MiniOS ou éditez directement `/etc/live/config.conf`.

### 📋 **Options de configuration supplémentaires**

- **Édition directe de fichier** : Modifiez `/etc/live/config.conf` manuellement pour les utilisateurs avancés
- **Configuration au démarrage** : Utilisez les [Paramètres de démarrage](/configuration/Boot-Parameters.md) pour configurer le système avant son lancement
- **Guide du fichier de configuration** : Consultez le [Fichier de configuration](/configuration/Configuration-File.md) pour une référence détaillée de config.conf
- **Pré-installation** : Configurez avant l’installation avec le [MiniOS Installer](/installation/MiniOS-Installer.md)

**Important :** Les modifications de `/etc/live/config.conf` (via le Configurateur MiniOS ou manuellement) nécessitent un redémarrage pour être prises en compte. Les outils en ligne de commande comme `localectl` et `timedatectl` appliquent les changements immédiatement mais peuvent ne pas persister après redémarrage sans configuration appropriée.

## Étape 5 : Installation de logiciels 🔄

MiniOS propose plusieurs méthodes pour installer des logiciels :

### 📦 **Gestionnaire de paquets APT**

Gestion de paquets Debian de base – utilisez `man apt` pour la référence complète des commandes.

### 🔄 **Système de modules**

Modules SquashFS avancés pour des logiciels persistants – consultez le guide [Création de modules](/development/Creating-Modules.md).

**Différence clé :** Les installations via APT nécessitent la persistance pour survivre aux redémarrages, alors que les modules sont automatiquement persistants.

## Étape 6 : Persistance des données 💾

**Bonne nouvelle :** MiniOS configure automatiquement la persistance des données lors de l’installation ! Vos fichiers, paramètres et logiciels installés sont sauvegardés automatiquement.

### Fonctionnement

- **Configuration automatique** : Toutes les méthodes d’installation créent la persistance automatiquement
- **Détection intelligente** : Le système choisit le mode de persistance optimal selon le système de fichiers de votre support
- **Portable** : Vos données vous suivent sur la clé USB

### Configuration avancée

Pour une configuration personnalisée de la persistance, consultez le guide détaillé [Fichier de configuration](/configuration/Configuration-File.md) et la référence [Paramètres de démarrage](/configuration/Boot-Parameters.md).

## Étape 7 : Sécurisation du système 🔐

### 👤 **Comptes par défaut**

- **Utilisateur** : `live` / `evil`
- **Root** : `root` / `toor`

### 🔒 **Étapes de sécurité importantes**

1. **Changez les mots de passe immédiatement** – Les identifiants par défaut sont publics
2. **Utilisez des mots de passe forts et uniques** pour tous les comptes

### Méthodes de configuration des mots de passe

- **🔧 Recommandé** : Utilisez le **Configurateur MiniOS** (Menu Applications → Système → Configurer MiniOS → onglet Utilisateur)
- **💻 Ligne de commande** : `passwd live` et `sudo passwd root`
- **📋 Avancé** : Consultez le guide [Renforcement de la sécurité](/administration/Security-Hardening.md) pour une configuration détaillée

⚠️ **N’utilisez jamais les identifiants par défaut sur un système connecté au réseau !**

## Étape 8 : Personnalisation & sujets avancés 🛠️

### 🎨 **Personnalisation de base**

- Thèmes de bureau et fonds d’écran via les paramètres
- Disposition des panneaux et préférences des applications
- Raccourcis clavier et paramètres système

### 🚀 **Configuration avancée**

- **Paramètres de démarrage** : [Référence complète](/configuration/Boot-Parameters.md) pour l’optimisation du système
- **Performance** : [Guide d’optimisation](/administration/Performance-Optimization.md) pour de meilleures performances
- **Matériel** : [Guide de compatibilité](/installation/Hardware-Compatibility.md) pour la prise en charge des périphériques

### 🔧 **Fonctionnalités avancées**

- **Compilations personnalisées** : [Compiler MiniOS](/development/Building-MiniOS.md) depuis les sources
- **Création de modules** : [Modules avancés](/development/Creating-Modules.md)
- **Reconstruction d’ISO** : [Repackager le système live](/development/Rebuilding-ISO.md) en ISO bootable
- **Mises à jour du noyau** : Guide de [gestion du noyau](/administration/Kernel-Management.md)

## Obtenir de l’aide & ressources communautaires 💬

### 📚 **Documentation**

- **Site officiel** : [minios.dev](https://minios.dev) – Dernières actualités et téléchargements
- **Tous les guides** : Disponibles dans cette documentation

### 🐛 **Support & signalement de problèmes**

- **Signalement de bugs** : [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Code source** : [Dépôt GitHub](https://github.com/minios-linux/minios-live)

### 📖 **Pour aller plus loin**

- **Documentation Debian** : [www.debian.org/doc](https://www.debian.org/doc/) – MiniOS étant basé sur Debian
- **Bases de Linux** : Les tutoriels Linux généraux s’appliquent à MiniOS

## Bienvenue sur MiniOS ! 🎉

Vous avez désormais tout ce qu’il vous faut pour commencer avec MiniOS. Le système combine la puissance de Linux et la portabilité – idéal pour la récupération système, l’informatique nomade ou un usage quotidien.

**Prochaines étapes :** Choisissez votre édition, créez votre clé USB et lancez-vous dans l’exploration ! 🚀
