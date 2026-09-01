---
updated: 2026-08-28
---

# Personnalisation du menu de démarrage

Les menus de démarrage MiniOS offrent des entrées pratiques pour les modes de démarrage live courants. Ce guide explique comment sélectionner et modifier ces entrées.

## Vue d'ensemble

Les images MiniOS peuvent utiliser GRUB ou Syslinux selon le firmware, la structure de l'image et la méthode de création. Leurs menus, touches d'édition, gestion des langues et entrées disponibles ne sont pas forcément identiques. Le chargeur de démarrage transmet finalement une ligne de commande du noyau au même initrd ; consultez [Modes de démarrage](/using-minios/Boot-Modes) pour les sources résultantes, la persistance, le comportement de copie RAM et la dépendance au support.

## Options du menu de démarrage

L'image fournie propose généralement ces choix sémantiques, bien que les titres, la disponibilité, l'ordre et la sélection par défaut puissent varier selon l'image :

| Choix du menu | Sélecteur initrd typique | Objectif |
|---|---|---|
| Démarrer MiniOS | `perchdir=resume` | Essayer la session compatible par défaut et permettre la création de remplacement dans les conditions documentées. |
| Démarrer une nouvelle session | `perchdir=new` | Créer une session persistante supplémentaire numérotée tout en conservant les sessions existantes inchangées. |
| Choisir une session enregistrée | `perchdir=ask` | Sélectionner une session enregistrée existante de façon interactive. Utilisez **Démarrer une nouvelle session** si le stockage est vide. |
| Démarrer sans enregistrer | aucun sélecteur de persistance | Utiliser une couche temporaire inscriptible dans RAM. |
| Exécuter depuis RAM | `toram` | Copier l'arborescence complète des données MiniOS vers RAM et tenter de détacher la source. |

Ce sont des sélecteurs, et non des garanties que le stockage est inscriptible, qu'une session est compatible, que la RAM est suffisante ou que le support source a été détaché. Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour le comportement et les combinaisons, [Persistance de l'initrd](/reference/boot-process/Persistence-Internals) pour les cas limites des sélecteurs, et [Optimisation des performances](/maintenance-and-recovery/Performance) pour les compromis entre RAM et les entrées/sorties.

## Comment utiliser le menu de démarrage

### Navigation dans le menu

- Utilisez les **flèches directionnelles** pour naviguer entre les options
- Appuyez sur **Entrée** pour sélectionner une option
- Appuyez sur **Échap** pour revenir au menu précédent (dans GRUB)
- La sélection automatique et la durée du délai dépendent de la configuration du menu actif ; certains menus peuvent attendre indéfiniment

### Sélection de la langue (GRUB)

Si votre clé USB MiniOS prend en charge plusieurs langues :
1. Le premier écran affichera les options de langue
2. Sélectionnez votre langue préférée
3. Le menu de démarrage apparaîtra dans la langue choisie
4. Cette sélection peut également transmettre les paramètres régionaux au démarrage suivant, mais ne garantit pas que chaque message du démarrage ou de l'application soit traduit

**Important :** Le menu multilingue remplace tout paramètre régional spécifié dans `config.conf`. La langue choisie dans le menu de démarrage prévaut sur les paramètres régionaux préconfigurés. Consultez **[Fichier de configuration](/reference/configuration/config.conf)** et **[live-config](/reference/configuration/live-config)** pour plus de détails sur les fichiers de configuration système.

## Personnalisation des options de démarrage

### Modification temporaire des paramètres de démarrage

Vous pouvez modifier les options de démarrage pour une seule session :

**Dans GRUB :**
1. Sélectionnez l'option de menu à modifier
2. Appuyez sur **'e'** pour éditer
3. Allez à la ligne commençant par `linux`
4. Ajoutez ou modifiez les paramètres à la fin de la ligne
5. Appuyez sur **Ctrl+X** ou **F10** pour démarrer avec vos modifications

**Dans SYSLINUX :**
1. Sélectionnez l'option de menu souhaitée
2. Appuyez sur **Tab** avant d'appuyer sur Entrée
3. Ajoutez les paramètres à la ligne de commande qui s'affiche
4. Appuyez sur **Entrée** pour démarrer

### Modifications courantes des paramètres de démarrage

- `debug` - Afficher les messages détaillés au démarrage (utile pour le dépannage)
- `toram=trim` - Copier l'ensemble filtré des modules et les données requises limitées en RAM
- `perchsize=2000` - Définir la taille du stockage de session à 2 Go (à adapter selon vos besoins)
- `locales=ru_RU.UTF-8` - Demander une langue/locale spécifique

Pour la liste complète des paramètres de démarrage disponibles, consultez **[Paramètres de démarrage](/reference/Boot-Parameters)**.

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

**Attention :** N'éditez les fichiers de configuration de démarrage que si vous savez ce que vous faites. Des modifications incorrectes peuvent rendre votre clé USB non amorçable.

**Pour modifier la configuration GRUB :**
1. Montez votre clé USB MiniOS
2. Accédez à `/minios/boot/grub/`
3. Modifiez `grub.cfg` avec un éditeur de texte
4. Enregistrez et éjectez la clé USB en toute sécurité

**Modifications courantes :**
- Modifier la directive de délai utilisée par le menu GRUB ou Syslinux actif
- Modifier `set default=0` pour changer l'option de menu par défaut
- Ajouter des entrées de menu personnalisées
