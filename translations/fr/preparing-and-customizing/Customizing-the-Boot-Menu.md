---
updated: 2026-10-06
---

# Personnalisation du menu de démarrage

Les menus de démarrage MiniOS proposent des entrées pratiques pour les modes de démarrage live courants. Ce guide explique comment sélectionner et modifier ces entrées.

## Aperçu

Les images MiniOS peuvent utiliser GRUB ou Syslinux selon le firmware, la structure de l’image et la méthode de création. Leurs graphes de menus, touches d’édition, gestion des langues et entrées disponibles peuvent différer. Le chargeur de démarrage transmet finalement une ligne de commande du noyau au même initrd ; voir [Modes de démarrage](/using-minios/Boot-Modes) pour le comportement de la source, la persistance, la copie RAM et la gestion de la dépendance au support.

## Options du menu de démarrage

L’image fournie propose généralement ces choix fonctionnels, mais les titres, la disponibilité, l’ordre et la sélection par défaut peuvent varier selon l’image :

| Choix du menu | Sélecteur initrd typique | But |
|---|---|---|
| Démarrer MiniOS | `perchdir=resume` | Essayer la session compatible par défaut et permettre la création d’une nouvelle session de remplacement dans les conditions documentées. |
| Démarrer une nouvelle session | `perchdir=setup` | Ouvrir le sélecteur de backend de persistance, puis créer une session supplémentaire numérotée tout en conservant les sessions existantes. |
| Choisir une session enregistrée | `perchdir=ask` | Sélectionner une session enregistrée existante de façon interactive ; si le stockage est vide, MiniOS lance le même flux de configuration pour permettre la création de la première session. |
| Démarrer sans enregistrer | aucun sélecteur de persistance | Utiliser une couche temporaire en écriture dans RAM. |
| Exécuter depuis la RAM | `toram` | Copier les données système MiniOS vers RAM ; avec la persistance, l’option par défaut `perchtoram=trim` copie séparément la session prise en charge sélectionnée. |

Il s’agit de sélecteurs, sans garantie que le stockage soit accessible en écriture, qu’une session soit compatible, que RAM soit suffisant ou que le support source ait été retiré. Voir [Modes de démarrage](/using-minios/Boot-Modes) pour le comportement et les combinaisons, [Persistance initrd](/reference/boot-process/Persistence-Internals) pour les cas particuliers des sélecteurs, et [Optimisation des performances](/maintenance-and-recovery/Performance) pour les compromis entre RAM et les entrées/sorties.

## Comment utiliser le menu de démarrage

### Navigation dans le menu

- Utilisez les **flèches directionnelles** pour vous déplacer entre les options
- Appuyez sur **Entrée** pour valider une option
- Appuyez sur **Échap** pour revenir au menu précédent (dans GRUB)
- La sélection automatique et la durée du délai dépendent de la configuration active du menu ; certains menus peuvent attendre indéfiniment

### Sélection de la langue (GRUB)

Si votre clé USB MiniOS prend en charge plusieurs langues :
1. L’écran d’accueil affichera les options de langue
2. Sélectionnez la langue de votre choix
3. Le menu de démarrage apparaîtra dans la langue sélectionnée
4. La sélection peut aussi transmettre les paramètres régionaux au démarrage suivant, mais cela ne garantit pas que tous les messages système ou applicatifs seront traduits

**Important :** Le menu multilingue remplace tout paramètre régional défini dans `config.conf`. La langue choisie dans le menu de démarrage prévaut sur les paramètres régionaux préconfigurés. Voir **[Fichier de configuration](/reference/configuration/config.conf)** et **[live-config](/reference/configuration/live-config)** pour plus d’informations sur les fichiers de configuration système.

## Personnalisation des options de démarrage

### Modifier temporairement les paramètres de démarrage

Vous pouvez modifier les options de démarrage pour une seule session :

**Dans GRUB :**
1. Sélectionnez l’option du menu à modifier
2. Appuyez sur **'e'** pour éditer
3. Placez-vous sur la ligne commençant par `linux`
4. Ajoutez ou modifiez les paramètres à la fin de la ligne
5. Appuyez sur **Ctrl+X** ou **F10** pour démarrer avec vos modifications

**Dans SYSLINUX :**
1. Sélectionnez l’option du menu souhaitée
2. Appuyez sur **Tab** avant d’appuyer sur Entrée
3. Ajoutez les paramètres à la ligne de commande qui s’affiche
4. Appuyez sur **Entrée** pour démarrer

### Modifications courantes des paramètres de démarrage

- `debug` - Afficher les messages détaillés du démarrage (utile pour le diagnostic)
- `toram=trim` - Copier le jeu de modules filtré et les données requises limitées vers RAM
- `perchsize=2000` - Définir la taille du stockage de session à 2 Go (à ajuster selon vos besoins)
- `locales=ru_RU.UTF-8` - Demander une langue ou une locale spécifique

Pour la liste complète des paramètres de démarrage disponibles, consultez **[Paramètres de démarrage](/reference/Boot-Parameters)**.

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

**Attention :** Modifiez les fichiers de configuration de démarrage uniquement si vous savez ce que vous faites. Des modifications incorrectes peuvent rendre votre clé USB non amorçable.

**Pour modifier la configuration GRUB :**
1. Montez votre clé USB MiniOS
2. Allez dans `/minios/boot/grub/`
3. Modifiez `grub.cfg` avec un éditeur de texte
4. Enregistrez et éjectez la clé USB en toute sécurité

**Modifications courantes :**
- Modifier la directive de délai utilisée par le menu GRUB ou Syslinux actif
- Modifiez `set default=0` pour changer l’option du menu par défaut
- Ajouter des entrées personnalisées au menu
