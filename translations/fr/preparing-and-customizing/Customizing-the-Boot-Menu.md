---
updated: 2026-10-15
---

# Personnaliser le menu de démarrage

Les menus de démarrage MiniOS proposent des entrées pratiques pour les modes de démarrage live courants. Ce guide explique comment sélectionner et modifier ces entrées.

## Présentation

Les images MiniOS peuvent utiliser GRUB ou Syslinux selon le firmware, la disposition de l’image et sa compilation. Leurs graphes de menus, raccourcis d’édition, gestion des langues et entrées disponibles ne sont pas nécessairement identiques. Le chargeur d’amorçage transmet au final une ligne de commande au noyau au même initrd ; voir [Modes de démarrage](/using-minios/Boot-Modes) pour connaître le comportement qui en résulte concernant la source, la persistance, la copie de RAM et la dépendance au support.

## Options du menu de démarrage

L’image fournie propose généralement les choix fonctionnels suivants, même si les intitulés, la disponibilité, l’ordre et la sélection par défaut peuvent varier selon l’image :

| Choix du menu | Sélecteur d’initrd typique | Objectif |
|---|---|---|
| Démarrer MiniOS | `perchdir=resume` | Essayer la session compatible par défaut et autoriser la création d’une session de remplacement dans les conditions documentées. |
| Démarrer une nouvelle session | `perchdir=setup` | Ouvrir le sélecteur de backend de persistance, puis créer une session supplémentaire numérotée sans modifier les sessions existantes. |
| Choisir une session enregistrée | `perchdir=ask` | Sélectionner interactivement une session enregistrée existante ; si le stockage est vide, MiniOS lance le même processus de configuration afin de créer la première session. |
| Démarrer sans enregistrer | aucun sélecteur de persistance | Utiliser une couche inscriptible temporaire dans RAM. |
| Exécuter depuis la RAM | `toram` | Copier les données système de MiniOS vers RAM ; avec la persistance, l’option par défaut `perchtoram=trim` copie séparément la session prise en charge sélectionnée. |

Ces sélecteurs ne garantissent ni que le stockage est inscriptible, ni que la session est compatible, ni que RAM est suffisant, ni que le support source a été éjecté. Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour en savoir plus sur le comportement et les combinaisons, [Persistance de l’initrd](/reference/boot-process/Persistence-Internals) pour connaître les cas particuliers des sélecteurs, et [Optimisation des performances](/maintenance-and-recovery/Performance) pour en savoir plus sur RAM et les compromis liés aux E/S.

## Utiliser le menu de démarrage

### Navigation dans le menu

- Utilisez les **touches fléchées** pour parcourir les options
- Appuyez sur **Entrée** pour sélectionner une option
- Appuyez sur **Échap** pour revenir au menu précédent (dans GRUB)
- La sélection automatique et la durée du délai dépendent de la configuration du menu actif ; certains menus peuvent attendre indéfiniment

### Aide et choix de la langue

Les menus GRUB multilingues et SYSLINUX natifs actuels affichent d’abord les modes de démarrage, et non un écran de sélection de la langue. **F1** ouvre l’aide au démarrage et **F2** ouvre le choix de la langue. Le choix d’une langue affiche le menu des modes traduit. Les supports disponibles dans une seule langue proposent l’aide, mais pas de navigation vers des langues non disponibles.

Le menu multilingue initial conserve les paramètres régionaux configurés pour le système. Seul le choix explicite d’une langue ajoute des paramètres régionaux qui remplacent `config.conf` pour ce démarrage. Cela ne garantit pas que tous les messages de démarrage ou des applications soient traduits. Consultez le [fichier de configuration](/reference/configuration/config.conf) et [live-config](/reference/configuration/live-config).

## Personnaliser les options de démarrage

### Modifier temporairement les paramètres de démarrage

Vous pouvez modifier les options de démarrage pour une seule session :

**Dans GRUB :**
1. Sélectionnez l’option de menu à modifier
2. Appuyez sur **'e'** pour la modifier
3. Accédez à la ligne commençant par `linux`
4. Ajoutez ou modifiez les paramètres à la fin de la ligne
5. Appuyez sur **Ctrl+X** ou **F10** pour démarrer avec vos modifications

**Dans SYSLINUX :**
1. Sélectionnez l’option de menu souhaitée
2. Appuyez sur **Tab** avant d’appuyer sur Entrée
3. Ajoutez des paramètres à la ligne de commande qui s’affiche
4. Appuyez sur **Entrée** pour démarrer

### Modifications courantes des paramètres de démarrage

- `debug` - Afficher les messages détaillés au démarrage (utile pour le dépannage)
- `toram=trim` - Copier l’ensemble filtré des modules et les données requises limitées vers RAM
- `perchsize=2000` - Demander 2000 Mio pour un conteneur pris en charge nouveau ou en expansion ; cela ne définit pas la taille des sessions natives ou SquashFS
- `locales=ru_RU.UTF-8` - Demander une langue/locale spécifique

Pour consulter la liste complète des paramètres de démarrage disponibles, voir **[Paramètres de démarrage](/reference/Boot-Parameters)**.

## Emplacements des fichiers de configuration

### Sur votre clé USB MiniOS

- **Configuration GRUB :** `/minios/boot/grub/grub.cfg`
- **Menus de mode et de langue GRUB :** `/minios/boot/grub/main.cfg` et `/minios/boot/grub/languages.cfg` ; les versions localisées peuvent sélectionner d’autres fichiers générés
- **Configuration SYSLINUX :** `/minios/boot/syslinux/syslinux.cfg`
- **Illustrations de démarrage :** inspectez le paramètre actif du thème SYSLINUX `MENU BACKGROUND` ou GRUB ; les chemins dépendent du chargeur de démarrage sélectionné
- **Fichiers de langue :** `/minios/boot/grub/locale/`

### Dans le système en cours d’exécution

- **Paramètres de démarrage actuels :** `/proc/cmdline`
- **Répertoire de données MiniOS :** `/run/initramfs/memory/data/minios/`

### Modification des fichiers de configuration

**Avertissement :** Ne modifiez les fichiers de configuration du démarrage que si vous savez ce que vous faites. Des modifications incorrectes peuvent empêcher votre clé USB de démarrer.

**Pour modifier la configuration de GRUB :**
1. Montez votre clé USB MiniOS
2. Accédez à `/minios/boot/grub/`
3. Modifiez `grub.cfg` avec un éditeur de texte
4. Enregistrez vos modifications, puis éjectez la clé USB en toute sécurité

**Modifications courantes :**
- Modifiez la directive de délai d’attente du menu GRUB ou Syslinux actif
- Modifiez `set default=0` pour changer l’option de menu par défaut
- Ajoutez des entrées de menu personnalisées
