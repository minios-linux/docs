---
updated: 2026-08-26
---

# Guide des menus de démarrage MiniOS

Les menus de démarrage MiniOS offrent des entrées pratiques pour les modes de démarrage live courants. Ce guide explique comment sélectionner et modifier ces entrées.

## Vue d'ensemble

Les images MiniOS peuvent utiliser GRUB ou Syslinux selon le firmware, la structure de l'image et la méthode de création. Leur présentation graphique, les touches d'édition, la gestion des langues et les entrées disponibles ne sont pas forcément identiques. Le chargeur de démarrage transmet finalement une ligne de commande du noyau au même initrd ; consultez [Modes de démarrage](/configuration/Boot-Modes.md) pour connaître le comportement lié à la source, la persistance, la copie en RAM et la dépendance au support.

## Options du menu de démarrage

L'image fournie propose généralement ces choix fonctionnels, bien que les titres, la disponibilité, l'ordre et la sélection par défaut puissent varier selon l'image :

| Choix du menu | Sélecteur initrd typique | Objectif |
|---|---|---|
| Reprendre la session précédente | `perchdir=resume` | Tente la session compatible par défaut et permet la création d'une nouvelle session selon les conditions documentées. |
| Démarrer une nouvelle session | `perchdir=new` | Alloue une nouvelle session persistante numérotée. |
| Choisir la session au démarrage | `perchdir=ask` | Permet de sélectionner une session existante ou d'en demander une nouvelle de façon interactive. |
| Démarrage sans persistance | pas de sélecteur de persistance | Utilise une couche temporaire en écriture. |
| Copier en RAM | `toram` | Demande le mode de copie complète en RAM. |

Ce sont des sélecteurs, sans garantir que le stockage soit accessible en écriture, qu'une session soit compatible, que la RAM soit suffisante ou que le support source soit retiré. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) pour les comportements et combinaisons, [Persistance Initrd](/configuration/Initrd-Persistence.md) pour les cas particuliers de sélecteurs, et [Optimisation des performances](/administration/Performance-Optimization.md) pour les compromis entre RAM et E/S.

## Comment utiliser le menu de démarrage

### Navigation dans le menu

- Utilisez les **flèches directionnelles** pour naviguer entre les options
- Appuyez sur **Entrée** pour sélectionner une option
- Appuyez sur **Échap** pour revenir au menu précédent (dans GRUB)
- La sélection automatique et la durée du compte à rebours dépendent de la configuration du menu actif ; certains menus peuvent attendre indéfiniment

### Sélection de la langue (GRUB)

Si votre clé USB MiniOS prend en charge plusieurs langues :
1. Le premier écran affichera les options de langue
2. Sélectionnez votre langue préférée
3. Le menu de démarrage apparaîtra dans la langue choisie
4. La sélection peut également transmettre les paramètres régionaux aux étapes suivantes du démarrage, mais cela ne garantit pas que tous les messages de démarrage ou d’application soient traduits

**Important :** Le menu multilingue remplace tous les paramètres régionaux spécifiés dans `config.conf`. La langue choisie dans le menu de démarrage prévaut sur les paramètres régionaux préconfigurés. Consultez **[Fichier de configuration](/configuration/Configuration-File.md)** et **[live-config](/configuration/live-config.md)** pour plus de détails sur les fichiers de configuration système.

## Personnalisation des options de démarrage

### Modifier temporairement les paramètres de démarrage

Vous pouvez modifier les options de démarrage pour une seule session :

**Dans GRUB :**
1. Sélectionnez l'option de menu à modifier
2. Appuyez sur **'e'** pour éditer
3. Naviguez jusqu'à la ligne commençant par `linux`
4. Ajoutez ou modifiez les paramètres à la fin de la ligne
5. Appuyez sur **Ctrl+X** ou **F10** pour démarrer avec vos modifications

**Dans SYSLINUX :**
1. Sélectionnez l'option de menu souhaitée
2. Appuyez sur **Tab** avant d'appuyer sur Entrée
3. Ajoutez les paramètres à la ligne de commande qui s'affiche
4. Appuyez sur **Entrée** pour démarrer

### Modifications courantes des paramètres de démarrage

- `debug` - Afficher les messages détaillés au démarrage (utile pour le dépannage)
- `toram=trim` - Copier l'ensemble de modules filtrés et les données nécessaires en RAM
- `perchsize=2000` - Définir la taille de stockage de session à 2 Go (à adapter si besoin)
- `locales=ru_RU.UTF-8` - Demander une langue ou locale spécifique

Pour la liste complète des paramètres de démarrage disponibles, consultez **[Paramètres de démarrage](/configuration/Boot-Parameters.md)**.

## Emplacements des fichiers de configuration

### Sur votre clé USB MiniOS

- **Configuration GRUB :** `/minios/boot/grub/grub.cfg`
- **Configuration SYSLINUX :** `/minios/boot/syslinux/syslinux.cfg`
- **Images de démarrage :** `/minios/boot/bootlogo.png`
- **Fichiers de langue :** `/minios/boot/grub/locale/`

### Dans le système en cours d'exécution

- **Paramètres de démarrage actuels :** `/proc/cmdline`
- **Répertoire de données MiniOS :** `/run/initramfs/memory/data/minios/`

### Modification des fichiers de configuration

**Avertissement :** N’éditez les fichiers de configuration de démarrage que si vous savez ce que vous faites. Des modifications incorrectes peuvent rendre votre clé USB inutilisable au démarrage.

**Pour modifier la configuration de GRUB :**
1. Montez votre clé USB MiniOS
2. Accédez à `/minios/boot/grub/`
3. Modifiez `grub.cfg` avec un éditeur de texte
4. Enregistrez et éjectez la clé USB en toute sécurité

**Modifications courantes :**
- Modifier la directive de temporisation utilisée par le menu GRUB ou Syslinux actif
- Changer `set default=0` pour modifier l’option de menu par défaut
- Ajouter des entrées de menu personnalisées
