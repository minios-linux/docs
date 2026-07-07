# Reconstruire une ISO

Ce guide explique comment reconstruire et personnaliser les images ISO MiniOS à l’aide des outils intégrés. Que vous souhaitiez créer des versions légères, ajouter des logiciels personnalisés ou distribuer des systèmes adaptés, ces outils facilitent le reconditionnement de votre système live dans une nouvelle ISO amorçable.

## Vue d’ensemble

MiniOS propose des outils puissants pour reconstruire des images ISO directement depuis un système live en fonctionnement. Cela vous permet de :

- **Supprimer les logiciels indésirables** pour créer des distributions plus légères
- **Ajouter des modules personnalisés** avec des logiciels supplémentaires
- **Créer des versions spécialisées** pour des cas d’usage spécifiques
- **Distribuer des systèmes personnalisés** à d’autres utilisateurs
- **Créer un support d’installation** avec votre configuration actuelle

## Démarrage rapide

La méthode la plus simple pour créer une ISO à partir de votre système actuel :

```bash
sudo sb2iso
```

Cela crée `minios-YYYYMMDD_HHMM.iso` dans votre dossier courant avec tous les modules actuellement chargés.

## Outil principal : sb2iso

**sb2iso** est l’outil principal pour reconstruire les images ISO. Il lit votre système live actuel et le conditionne dans un fichier ISO amorçable.

### Utilisation de base

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Options de commande

| Option | Description | Exemple |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Exclure les fichiers/modules correspondant au motif | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Spécifier le nom du fichier de sortie | `--name minios_custom.iso` |
| `--menu TYPE` | Définir la langue ou le type de menu | `--menu ru_RU` ou `--menu multilang` |
| `--help` | Afficher l’aide | `--help` |
| `--version` | Afficher la version | `--version` |

### Types de menus pris en charge

- **multilang** (par défaut) – Menu multilingue avec sélection de la langue
- **Codes de langue** – Menus en langue unique : `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Exemples pratiques

### Création de versions légères

**Supprimer les applications volumineuses :**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Créer un système uniquement en mode texte :**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Supprimer les applications multimédia :**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Ajout de logiciels personnalisés

**Ajouter des outils de développement :**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Ajouter des applications de jeux :**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### ISOs spécifiques à une langue

**Créer une ISO localisée en russe :**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Créer une ISO allemande :**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Distributions professionnelles/pédagogiques

**ISO éducative avec outils d’apprentissage :**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**ISO professionnelle :**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Flux de personnalisation avancé

### 1. Préparer votre système

Démarrez avec un système MiniOS propre et personnalisez-le :

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Créer des modules personnalisés

Enregistrez vos modifications sous forme de modules :

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Tester vos modules

Avant de créer l’ISO finale, testez vos modules :

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Créer l’ISO finale

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Gestion des modules

### Comprendre la numérotation des modules

Les modules sont chargés dans l’ordre numérique :
- **00-core** – Système de base (toujours inclus)
- **01-kernel** – Kernel et pilotes
- **02-firmware** – Microprogrammes matériels
- **03-gui-base** – Composants de base de l’interface graphique
- **04-desktop** – Environnement de bureau
- **05-apps** – Applications
- **06+** – Modules additionnels

### Commandes de gestion des modules

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Exclusion de motifs de contenu

L’option `--exclude` utilise des expressions régulières pour filtrer les chemins de fichiers. Exemples de motifs courants :

### Exclusions d’applications

```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### Exclusions de composants système

```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Exclusions combinées

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Prérequis système

### Exécution de sb2iso

- **Système** : Doit être lancé depuis un système live MiniOS
- **Privilèges** : Accès root requis (`sudo`)
- **Mémoire** : RAM suffisante pour les fichiers temporaires
- **Stockage** : Espace libre pour l’ISO générée (généralement 1 à 4 Go)

### Fichiers de démarrage requis

**sb2iso** nécessite que les fichiers de démarrage soient disponibles. Si vous avez chargé le système en RAM, utilisez :

```bash
# Boot with full RAM copy
toram=full
```

Ou assurez-vous que les fichiers de démarrage sont accessibles sur le support d’origine.

## Dépannage

### Problèmes courants

**"Impossible de trouver le répertoire source MiniOS"**
- Vérifiez que vous êtes bien sur un système live MiniOS
- Assurez-vous que les fichiers de démarrage sont disponibles
- Essayez d’utiliser le paramètre de démarrage `toram=full`

**"Fichier requis introuvable"**
- Les fichiers de démarrage peuvent manquer
- Vérifiez que vous utilisez un système MiniOS complet

**Échec de la création de l’ISO**
- Vérifiez l’espace disque disponible
- Assurez-vous d’avoir les droits d’écriture
- Vérifiez qu’aucun fichier n’est utilisé pendant la création

**Module non inclus**
- Vérifiez que le fichier module existe et est lisible
- Vérifiez le format du module (.sb)
- Assurez-vous d’avoir assez d’espace pour tous les modules

### Informations de débogage

Activez le mode verbeux pour le dépannage :

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Bonnes pratiques

### Planification de votre ISO

1. **Démarrer proprement** : Commencez avec un système MiniOS vierge
2. **Tester minutieusement** : Validez toutes les personnalisations avant de créer l’ISO
3. **Documenter les modifications** : Gardez une trace des changements effectués
4. **Considérations de taille** : Surveillez la taille de l’ISO selon les besoins de distribution

### Organisation des modules

1. **Regroupement logique** : Regroupez les logiciels similaires dans des modules
2. **Numérotation appropriée** : Utilisez une numérotation adaptée pour les modules
3. **Tests** : Testez chaque module individuellement
4. **Dépendances** : Comprenez les dépendances entre modules

### Préparation à la distribution

1. **Convention de nommage** : Utilisez des noms d’ISO explicites
2. **Documentation** : Incluez un guide d’utilisation
3. **Support linguistique** : Pensez aux utilisateurs internationaux
4. **Optimisation de la taille** : Supprimez les composants inutiles

## Intégration avec d’autres outils

### Création de modules personnalisés

Avant de reconstruire une ISO, vous pouvez créer des modules personnalisés :

- **apt2sb** – Créer des modules à partir de l’installation de paquets
- **script2sb** – Créer des modules à l’aide de scripts personnalisés
- **chroot2sb** – Créer des modules de façon interactive
- **savechanges** – Sauvegarder les modifications du système en cours

Consultez le guide [Créer des modules](/development/Creating-Modules.md) pour des instructions détaillées.

### Compilation depuis les sources

Pour une personnalisation complète, envisagez de compiler depuis les sources :

- **minios-live** – Construire des systèmes complets depuis zéro
- **minios-cmd** – Interface de compilation simplifiée

Consultez le guide [Compiler MiniOS](/development/Building-MiniOS.md) pour la construction depuis les sources.

## Conclusion

Les outils de reconstruction d’ISO de MiniOS offrent un moyen puissant de personnaliser et redistribuer des systèmes Linux. Que vous créiez des distributions spécialisées, supprimiez des logiciels inutiles ou ajoutiez des fonctionnalités sur mesure, ces outils facilitent le conditionnement de votre système live dans une image ISO professionnelle.

Commencez par des personnalisations simples et progressez vers des distributions plus complexes à mesure que vous vous familiarisez avec le système de modules et les options disponibles.
