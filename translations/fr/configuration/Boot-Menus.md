# Guide des menus de démarrage MiniOS

MiniOS propose un système de menu de démarrage puissant qui vous permet de choisir comment le système démarre et fonctionne. Ce guide explique les options de démarrage disponibles et comment les personnaliser.

## Vue d'ensemble

MiniOS utilise GRUB comme chargeur d’amorçage principal, offrant une interface graphique avec prise en charge multilingue. Sur les anciens systèmes BIOS, SYSLINUX peut être utilisé en alternative. Les deux chargeurs offrent les mêmes fonctionnalités avec des interfaces légèrement différentes.

## Options du menu de démarrage

### 1. Reprendre la session précédente

**Ce que cela fait :** Tente de poursuivre votre dernière session, mais s’adapte automatiquement selon l’espace de stockage disponible.

- **Quand l’utiliser :** C’est l’option par défaut – adaptée à la plupart des utilisateurs dans la plupart des situations
- **Ce qui se passe :** 
  - **Sur un support inscriptible avec session existante :** Restaure vos fichiers, applications et paramètres sauvegardés
  - **Sur un support inscriptible sans session :** Crée automatiquement la première session (session n°1)
  - **Sur un support en lecture seule (DVD, CD) :** Fonctionne comme « Nouveau départ » car aucun stockage n’est disponible
  - **Si la session est incompatible :** Crée une nouvelle session (par exemple, lors de l’utilisation d’une version différente de MiniOS)
  - Le système gère automatiquement les vérifications de compatibilité et les limitations de stockage
- **Résultat :** Vous obtenez toujours un système fonctionnel, optimisé pour votre type de stockage

### 2. Démarrer une nouvelle session

**Ce que cela fait :** Crée un espace de travail vierge tout en conservant toutes les sessions existantes disponibles.

- **Quand l’utiliser :** Lorsque vous souhaitez repartir de zéro pour un autre travail ou des tests
- **Ce qui se passe :**
  - Crée une nouvelle session numérotée (par exemple, si vous aviez la session 1, crée la session 2)
  - Démarre avec un environnement de bureau propre
  - Tous les nouveaux changements seront enregistrés dans la nouvelle session
  - Toutes les sessions existantes restent inchangées et accessibles pour le basculement
- **Remarque :** Vous pouvez changer de session via l’option « Choisir la session au démarrage »

### 3. Choisir la session au démarrage

**Ce que cela fait :** Affiche un menu interactif pour sélectionner une session existante ou en créer une nouvelle.

- **Quand l’utiliser :** Lorsque vous avez plusieurs sessions et souhaitez choisir laquelle utiliser
- **Ce qui se passe :**
  - Affiche une boîte de dialogue au démarrage avec la liste des sessions disponibles
  - Affiche des informations sur la session (numéro, dernier accès, espace disque utilisé)
  - Options pour reprendre une session existante ou démarrer une nouvelle session
  - Permet de choisir différents périphériques de stockage si plusieurs sont disponibles
- **Avantages :** Contrôle total sur la session à utiliser, idéal pour les utilisateurs gérant plusieurs espaces de travail

### 4. Nouveau départ

**Ce que cela fait :** Démarre MiniOS sans enregistrer aucun changement.

- **Quand l’utiliser :** 
  - Tester le système sur un support inscriptible sans affecter les sessions existantes
  - Dépanner sans modifier les données sauvegardées
  - Confidentialité maximale (aucune donnée n’est enregistrée)
  - Lorsque vous souhaitez garantir qu’aucune modification persistante ne soit faite
- **Ce qui se passe :**
  - Démarrage le plus rapide
  - Les modifications sont perdues à l’arrêt
  - Aucun accès au périphérique de stockage pour la persistance
- **Remarque :** Lors d’un démarrage depuis un support en lecture seule (DVD, CD), « Reprendre la session précédente » fonctionne automatiquement comme « Nouveau départ » car aucun stockage n’est disponible pour les sessions

### 5. Copier en RAM

**Ce que cela fait :** Charge l’intégralité du système en mémoire vive pour des performances maximales.

- **Quand l’utiliser :**
  - Vous disposez de beaucoup de RAM (4 Go ou plus recommandés)
  - Vous souhaitez obtenir les meilleures performances possibles
  - Besoin de retirer la clé USB après le démarrage
  - Travail avec des applications intensives
- **Ce qui se passe :**
  - Copie tous les fichiers système en RAM pendant le démarrage
  - La clé USB peut être retirée une fois le chargement terminé
  - Le système fonctionne entièrement depuis la mémoire
  - Réactivité maximale pour toutes les opérations
- **Prérequis :** RAM suffisante pour contenir tout le système

Pour les options avancées `toram` et les techniques d’optimisation mémoire, consultez **[Optimisation des performances](/administration/Performance-Optimization.md)**.

## Utilisation du menu de démarrage

### Navigation dans le menu

- Utilisez les **flèches directionnelles** pour naviguer entre les options
- Appuyez sur **Entrée** pour valider une option
- Appuyez sur **Échap** pour revenir au menu précédent (dans GRUB)
- Le menu sélectionnera automatiquement l’option par défaut après 10 secondes

### Sélection de la langue (GRUB)

Si votre clé USB MiniOS prend en charge plusieurs langues :
1. L’écran d’accueil affichera les options de langue
2. Sélectionnez votre langue préférée
3. Le menu de démarrage apparaîtra dans la langue choisie
4. Tous les messages système suivants utiliseront cette langue

⚠️ **Important :** Le menu multilingue remplace tout paramètre de langue défini dans `config.conf`. La langue choisie dans le menu de démarrage a priorité sur la configuration locale préétablie. Voir **[Fichier de configuration](/configuration/Configuration-File.md)** et **[live-config](/configuration/live-config.md)** pour plus d’informations sur les fichiers de configuration système.

## Personnalisation des options de démarrage

### Modification temporaire des paramètres de démarrage

Vous pouvez modifier les options de démarrage pour une seule session :

**Dans GRUB :**
1. Sélectionnez l’option de menu à modifier
2. Appuyez sur **'e'** pour éditer
3. Allez à la ligne commençant par `linux`
4. Ajoutez ou modifiez les paramètres à la fin de la ligne
5. Appuyez sur **Ctrl+X** ou **F10** pour démarrer avec vos modifications

**Dans SYSLINUX :**
1. Sélectionnez l’option de menu souhaitée
2. Appuyez sur **Tab** avant d’appuyer sur Entrée
3. Ajoutez les paramètres dans la ligne de commande qui s’affiche
4. Appuyez sur **Entrée** pour démarrer

### Modifications courantes des paramètres de démarrage

- `debug` - Affiche les messages détaillés au démarrage (utile pour le dépannage)
- `toram=trim` - Copie uniquement les fichiers essentiels en RAM (si le mode `toram` complet utilise trop de mémoire)
- `perchsize=2000` - Définit la taille de stockage de session à 2 Go (à ajuster selon les besoins)
- `locale=ru_RU.UTF-8` - Force une langue/locale spécifique

Pour la liste complète des paramètres de démarrage disponibles, consultez **[Paramètres de démarrage](/configuration/Boot-Parameters.md)**.

## Emplacements des fichiers de configuration

### Sur votre clé USB MiniOS

- **Configuration GRUB :** `/minios/boot/grub/grub.cfg`
- **Configuration SYSLINUX :** `/minios/boot/syslinux/syslinux.cfg`
- **Images de démarrage :** `/minios/boot/bootlogo.png`
- **Fichiers de langue :** `/minios/boot/grub/locale/`

### Dans le système en cours d’exécution

- **Paramètres de démarrage actuels :** `/proc/cmdline`
- **Répertoire de données MiniOS :** `/run/initramfs/memory/data/minios/`

### Modification des fichiers de configuration

⚠️ **Avertissement :** N’éditer les fichiers de configuration de démarrage que si vous savez ce que vous faites. Des modifications incorrectes peuvent rendre votre clé USB non amorçable.

**Pour modifier la configuration GRUB :**
1. Montez votre clé USB MiniOS
2. Accédez à `/minios/boot/grub/`
3. Modifiez `grub.cfg` avec un éditeur de texte
4. Enregistrez et éjectez la clé USB en toute sécurité

**Modifications courantes :**
- Modifier `set timeout=10` pour changer le délai du menu
- Modifier `set default=0` pour changer l’option par défaut du menu
- Ajouter des entrées personnalisées au menu
