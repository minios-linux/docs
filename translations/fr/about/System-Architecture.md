# Architecture système de MiniOS

MiniOS démarre un système d’exploitation en lecture seule assemblé à partir de modules SquashFS et ajoute une couche inscriptible pour la session en cours. L’initramfs est chargé de détecter le support, sélectionner les modules et la persistance, construire le système de fichiers racine, appliquer la configuration initiale, puis transférer le contrôle au système d’init installé.

## Découverte au démarrage

Le chargeur de démarrage BIOS ou UEFI charge un noyau Linux et l’initramfs MiniOS depuis `minios/boot/`. L’initramfs recherche ensuite les périphériques de stockage pour un répertoire `minios` contenant des modules `.sb`. Le paramètre de démarrage `from=` peut à la place désigner un répertoire, un périphérique de bloc et un chemin, une image ISO locale, ou une sélection interactive `askdisk`. Une ISO locale est montée en boucle avant d’utiliser son répertoire `minios`.

La même étape de découverte prend en charge les sources ISO HTTP et PXE. Le réseau en début de démarrage est optionnel et uniquement destiné au **chargement de MiniOS par le réseau** (PXE / ISO HTTP). Il ne s’agit pas d’une configuration réseau de session persistante. Voir [Démarrage réseau](/installation/Network-Boot.md).

Après la découverte, `toram=trim` peut copier les modules sélectionnés et les données nécessaires en RAM, tandis que `toram=full` copie l’arborescence des données du support. Voir [Paramètres de démarrage](/configuration/Boot-Parameters.md) pour les options de source, de filtrage et de copie en RAM.

## Composition des modules

Chaque fichier `.sb` est un système de fichiers SquashFS en lecture seule. Les modules intégrés sont stockés directement sous `minios/` ; des modules supplémentaires peuvent être placés sous `minios/modules/`, y compris un stockage de modules durable sur un périphérique de persistance inscriptible. L’initramfs détecte les deux emplacements, applique les filtres `load=` et `noload=`, trie les fichiers sélectionnés selon leur préfixe numérique, puis les monte en lecture seule.

Une image Xfce typique contient les rôles suivants dans cet ordre, bien que les noms et numéros exacts dépendent de la construction et des modules ignorés pour cette cible :

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Les modules ultérieurs ont une priorité supérieure et peuvent remplacer les chemins fournis par les modules précédents. Un module peut dépendre de fichiers présents dans tout module de numéro inférieur, de sorte qu’un ensemble de modules constitue une composition ordonnée plutôt qu’un simple regroupement de paquets indépendants.

## AUFS et OverlayFS

MiniOS utilise un système de fichiers union pour présenter les modules et la couche inscriptible comme un seul système de fichiers racine. Il sélectionne AUFS si le noyau en cours d’exécution le prend en charge et bascule sinon sur OverlayFS. `union=aufs` demande AUFS mais bascule tout de même sur OverlayFS si AUFS n’est pas disponible ; `union=overlayfs` sélectionne OverlayFS.

Les deux implémentations présentent une différence opérationnelle importante :

- AUFS commence par la branche inscriptible et ajoute les modules montés comme branches en lecture seule. MiniOS peut activer ou désactiver un module dans la racine en cours lorsque le montage AUFS le permet.
- OverlayFS reçoit sa liste ordonnée complète `lowerdir` lors du montage de la racine, ainsi qu’un `upperdir` et `workdir`. Son ensemble de modules inférieurs ne peut pas être modifié à chaud par le gestionnaire de modules.

Le gestionnaire de modules distingue donc **En cours d’exécution**, l’ensemble de modules montés, de **Prochain démarrage**, les modules sélectionnés par le support actuel et les règles de démarrage. Ajouter ou retirer un module durable modifie normalement uniquement le prochain démarrage. Créer ou ouvrir un module ne l’active pas. L’activation et la désactivation à chaud ne sont disponibles qu’avec AUFS.

## Couche inscriptible et sessions

Sans persistance, la couche inscriptible est stockée en mémoire et disparaît à l’extinction. La persistance place cette couche dans une session numérotée sous `minios/changes/`. `session.conf` enregistre la session par défaut pour le prochain démarrage, la session utilisée pour le démarrage actuel, les métadonnées de compatibilité, l’état et les paramètres spécifiques au mode.

| Mode | Stockage inscriptible | Remarques |
|------|----------------------|-----------|
| `native` | Fichiers stockés directement dans le répertoire de session | Nécessite un système de fichiers POSIX inscriptible qui conserve les métadonnées Linux. |
| `dynfilefs` | Système de fichiers ext4 extensible réparti sur plusieurs fichiers de support | Compatible avec les systèmes de fichiers POSIX ainsi que les supports FAT32, NTFS ou exFAT. |
| `raw` | `changes.img` de taille fixe contenant un ext4 | Compatible avec les systèmes de fichiers POSIX ainsi que les supports FAT32, NTFS ou exFAT. |
| `luks` | LUKS2 `changes.luks` contenant un ext4 | Nécessite cryptsetup et un initramfs construit avec le support du chiffrement MiniOS. La phrase de passe est demandée au démarrage. |
| `squashfs` | Instantané `changes.sb` compressé | Décompressé en RAM pour l’utilisation ; l’enregistrement reconstruit et remplace l’instantané de façon atomique. Le système de fichiers de persistance doit préserver les métadonnées Linux lors de l’enregistrement. |

La session active sera celle par défaut au prochain démarrage. La session en cours est celle déjà montée dans la racine actuelle. Activer une autre session ne remplace pas la couche inscriptible en cours. Les vérifications de compatibilité de session incluent la version MiniOS, l’édition, le système de fichiers union et le mode de persistance.

Voir [Gestion des sessions](/configuration/Session-Management.md) pour la création, la sélection, le dimensionnement, le chiffrement, la conversion, l’export et la récupération.

## Priorité de la configuration

La configuration du support est `minios/config.conf`, avec des fragments optionnels dans `minios/config.conf.d/`. Les copies en cours d’exécution sont `/etc/live/config.conf` et `/etc/live/config.conf.d/` dans la racine composée.

Au démarrage, MiniOS compare les dates de modification et copie un fichier de support plus récent dans la racine en cours d’exécution. Si le support est inscriptible et que la copie en cours d’exécution est plus récente, elle est recopiée sur le support. Les fichiers fragments sont synchronisés par nom de fichier dans les deux sens. Si l’horloge a reculé depuis la dernière synchronisation, MiniOS évite de remplacer les horodatages et ne complète que les destinations manquantes.

Les options de la ligne de commande du noyau remplacent les valeurs correspondantes lues dans la configuration en cours d’exécution pour ce démarrage. Cela signifie que l’ordre effectif pour un paramètre explicitement pris en charge est le paramètre de démarrage, puis la configuration runtime/support synchronisée, puis la valeur par défaut intégrée. Les modifications runtime persistantes peuvent devenir la configuration du support si la source est inscriptible ; un support ISO en lecture seule ne peut pas recevoir cette mise à jour.

Voir [Fichier de configuration](/configuration/Configuration-File.md) et [live-config](/configuration/live-config.md) pour les paramètres pris en charge.

## Cycle d’arrêt et de sauvegarde

L’arrêt normal donne d’abord au système en cours d’exécution la possibilité de vider les services et les données de session. Une session SquashFS avec sauvegarde à l’arrêt activée est reconstruite et validée avant le démontage du système de fichiers. Le backend de sauvegarde écrit un marqueur de complétion pour la session exacte en cours ; l’initramfs d’arrêt vérifie ce marqueur et laisse la session sale si la sauvegarde requise a échoué.

L’initramfs d’arrêt détache ensuite les périphériques loop inutilisés, démonte l’ancienne racine et la couche inscriptible, marque une session réussie comme propre, démonte le support et ferme un mapping LUKS géré par MiniOS. Le support optique peut alors être éjecté avant l’extinction ou le redémarrage. Les sauvegardes manuelles et périodiques SquashFS utilisent le même backend d’instantané, mais seule la politique de sauvegarde à l’arrêt configurée bloque la finalisation propre en cas d’absence de sauvegarde d’arrêt.

## Arborescence du support

Une image actuelle est organisée comme suit. Les répertoires optionnels n’apparaissent que si la fonctionnalité associée a généré du contenu.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

Les chemins démarrés sous `/run/initramfs/memory/` sont des montages d’implémentation, et non une seconde copie persistante de cette arborescence.

## Documentation associée

- [Paramètres de démarrage](/configuration/Boot-Parameters.md)
- [Menus de démarrage](/configuration/Boot-Menus.md)
- [Fichier de configuration](/configuration/Configuration-File.md)
- [Gestion des sessions](/configuration/Session-Management.md)
- [Démarrage réseau](/installation/Network-Boot.md)
- [Création de modules](/development/Creating-Modules.md)
