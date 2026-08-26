---
updated: 2026-08-26
---

# Architecture système de MiniOS

MiniOS démarre un système d’exploitation en lecture seule assemblé à partir de modules SquashFS et ajoute une couche inscriptible pour la session en cours. L’initramfs est chargé de détecter le support, sélectionner les modules et la persistance, construire le système de fichiers racine, appliquer la configuration initiale, puis transférer le contrôle au système d’init installé.

## Découverte du démarrage

Le chargeur de démarrage BIOS ou UEFI charge un noyau Linux et l'initramfs MiniOS depuis
`minios/boot/`. L'initramfs découvre ensuite l’arborescence de données MiniOS qui contient
les modules live. La source peut être locale, sélectionnée de façon interactive, ou fournie
via un chemin réseau pris en charge ; une image ISO locale est montée en boucle avant que son arborescence
de données ne soit utilisée. La priorité exacte et les formes acceptées de `from=` sont documentées dans
[Découverte du système Initrd](/configuration/Initrd-System-Discovery.md).

Cette étape de découverte prend également en charge les sources ISO HTTP et PXE. Le réseau optionnel en début de démarrage
sert uniquement à **charger MiniOS par le réseau** (PXE / ISO HTTP).
Il ne s'agit pas d'une configuration réseau de session persistante. Voir
[Démarrage réseau](/installation/Network-Boot.md).

Après la découverte, MiniOS peut éventuellement préparer une copie en RAM. Le maintien de la source d'origine dépend du mode de copie, de la persistance et de la réussite du détachement. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) pour le modèle opérationnel.

## Composition des modules

Chaque fichier `.sb` est un système de fichiers SquashFS en lecture seule. Les modules intégrés sont stockés
directement sous `minios/` ; d'autres emplacements de modules peuvent contribuer à la
composition ordonnée. L'initramfs sélectionne, ordonne et monte les couches résultantes
en lecture seule. Les niveaux candidats, le remplacement de nom de base, les filtres, les extensions personnalisées de bundle
et la coordination avec le noyau en cours d'exécution sont définis dans
[Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md).

Une image Xfce typique contient les rôles ordonnés suivants, bien que les noms
et le nombre exacts dépendent de la construction et des modules ignorés pour cette cible :

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Les modules ajoutés ultérieurement ont une priorité supérieure et peuvent remplacer les chemins fournis par les modules précédents. Un module peut dépendre de fichiers présents dans chaque module de rang inférieur, de sorte qu'un ensemble de fichiers modules constitue une composition ordonnée plutôt qu'une collection de paquets indépendants.

## AUFS et OverlayFS

MiniOS utilise un système de fichiers union pour présenter les modules et la couche inscriptible comme un seul
système de fichiers racine. Il sélectionne AUFS lorsque le noyau en cours l’autorise et bascule
sur OverlayFS sinon. `union=aufs` demande AUFS mais bascule tout de même sur OverlayFS si AUFS n'est pas disponible ; `union=overlayfs` sélectionne OverlayFS.

Les deux implémentations présentent une différence opérationnelle importante :

- AUFS commence par la branche inscriptible et ajoute les modules montés comme branches en lecture seule. MiniOS peut activer ou désactiver un module dans la racine en cours si le montage AUFS le permet.
- OverlayFS reçoit sa liste complète et ordonnée de `lowerdir` lors du montage de la racine, ainsi qu’un `upperdir` et un `workdir`. L’ensemble des modules inférieurs ne peut pas être modifié à chaud par le Module Manager.

Le Module Manager distingue donc **En cours d’exécution**, l’ensemble des modules montés,
de **Prochain démarrage**, les modules sélectionnés par le support actuel et les règles de démarrage. Ajouter ou retirer un module durable modifie normalement uniquement le prochain démarrage. Créer ou ouvrir un module ne l’active pas. L’activation et la désactivation à chaud ne sont disponibles qu’avec AUFS.

Après l’assemblage de la racine et la fin de l’initialisation précoce, l’initrd LiveKit utilise
`pivot_root`, conserve l’ancien initrd pour l’arrêt, puis exécute l’init de la nouvelle racine. Le chemin dracut prépare la même racine assemblée mais laisse la
finalisation de `switch_root` à dracut. Voir
[Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md) pour la limite de transfert détaillée.

## Couche inscriptible et sessions

Sans persistance, la couche inscriptible est stockée en mémoire et disparaît à l’arrêt.
La persistance peut activer à la place une session numérotée avec un backend de stockage pris en charge. La sélection, la compatibilité, l’échec d’activation, l’autorité du démarrage en cours et la durabilité sont définies dans
[Persistance Initrd](/configuration/Initrd-Persistence.md).

| Mode | Stockage inscriptible | Remarques |
|------|----------------------|-----------|
| `native` | Fichiers stockés directement dans le répertoire de session | Nécessite un système de fichiers POSIX inscriptible qui préserve les métadonnées Linux. |
| `dynfilefs` | Système de fichiers ext4 extensible réparti sur plusieurs fichiers de support | Compatible avec les systèmes de fichiers POSIX et les supports FAT32, NTFS ou exFAT. |
| `raw` | `changes.img` de taille fixe contenant ext4 | Compatible avec les systèmes de fichiers POSIX et les supports FAT32, NTFS ou exFAT. |
| `luks` | LUKS2 `changes.luks` contenant ext4 | Nécessite cryptsetup et un initramfs construit avec le support du chiffrement MiniOS. La phrase secrète est demandée au démarrage. |
| `squashfs` | Instantané `changes.sb` compressé | Décompressé en RAM pour l’utilisation ; la sauvegarde reconstruit et remplace l’instantané de manière atomique. Le système de fichiers de persistance doit préserver les métadonnées Linux lors de la sauvegarde. |

La session active sélectionnée pour une reprise future et la couche inscriptible effectivement autorisée pour le démarrage en cours sont deux états liés mais distincts. Modifier une sélection future ne remplace pas la couche inscriptible en cours d’utilisation.

Voir [Gestion des sessions](/configuration/Session-Management.md) pour les commandes de création, sélection, dimensionnement, chiffrement, conversion, export et récupération.

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

- [Modes de démarrage](/configuration/Boot-Modes.md)
- [Découverte du système Initrd](/configuration/Initrd-System-Discovery.md)
- [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistance Initrd](/configuration/Initrd-Persistence.md)
- [Paramètres de démarrage](/configuration/Boot-Parameters.md)
- [Menus de démarrage](/configuration/Boot-Menus.md)
- [Fichier de configuration](/configuration/Configuration-File.md)
- [Gestion des sessions](/configuration/Session-Management.md)
- [Démarrage réseau](/installation/Network-Boot.md)
- [Création de modules](/development/Creating-Modules.md)
