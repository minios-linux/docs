---
updated: 2026-09-16
---

# Architecture du système

MiniOS démarre un système d’exploitation en lecture seule assemblé à partir de modules SquashFS et ajoute une couche modifiable pour la session en cours. L’initramfs est chargé de détecter le support, de sélectionner les modules et la persistance, de construire le système de fichiers racine, d’appliquer la configuration initiale, puis de transférer le contrôle au système d’initialisation installé.

## Découverte au démarrage

Le chargeur de démarrage BIOS ou UEFI charge un noyau Linux et un initramfs MiniOS depuis `minios/boot/`. L’initramfs découvre ensuite l’arborescence de données MiniOS qui contient les modules live. Une source peut être locale, sélectionnée de manière interactive, ou fournie via un chemin réseau pris en charge ; une ISO locale est montée en boucle avant d’utiliser son arborescence de données. La priorité exacte et les formats acceptés pour `from=` sont documentés dans [Découverte du système Initrd](/reference/boot-process/System-Discovery).

La même étape de découverte prend en charge les sources ISO HTTP et PXE. Le réseau en tout début de démarrage est optionnel et uniquement destiné au **chargement de MiniOS via le réseau** (PXE / ISO HTTP). Il ne s’agit pas d’une configuration réseau de session durable. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

Après la découverte, MiniOS peut éventuellement préparer une copie RAM. Le maintien de la source d’origine dépend du mode de copie, de la persistance et du détachement réussi. Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour le modèle opérationnel.

## Composition des modules

Chaque fichier `.sb` est un système de fichiers SquashFS en lecture seule. Les modules intégrés sont stockés directement sous `minios/` ; d’autres emplacements de modules peuvent contribuer à la composition ordonnée. L’initramfs sélectionne, ordonne et monte les couches résultantes en lecture seule. Les niveaux candidats, le remplacement de nom de base, les filtres, les extensions de bundle personnalisées et la coordination avec le noyau en cours d’exécution sont détaillés dans [Chargement des modules Initrd](/reference/boot-process/Module-Loading).

Une image Xfce typique contient les rôles suivants dans cet ordre, bien que les noms et le nombre exacts dépendent de la construction et des modules exclus pour cette cible :

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Les modules ultérieurs ont une priorité plus élevée et peuvent remplacer les chemins fournis par les modules précédents. Un module peut dépendre de fichiers présents dans chaque module de numéro inférieur, de sorte qu’un ensemble de fichiers de modules constitue une composition ordonnée, et non une simple collection de paquets indépendants.

## AUFS et OverlayFS

MiniOS utilise un système de fichiers union pour présenter les modules et la couche inscriptible comme un seul système de fichiers racine. Il sélectionne AUFS lorsque le noyau en cours d’exécution le prend en charge, et bascule sinon sur OverlayFS. `union=aufs` demande AUFS mais bascule tout de même sur OverlayFS si AUFS n’est pas disponible ; `union=overlayfs` sélectionne OverlayFS. Sous UEFI Secure Boot, l’initrd ne charge pas le `aufs-ng` module non signé et utilise OverlayFS sauf si une autre implémentation AUFS utilisable est déjà présente.

Les deux implémentations présentent une différence opérationnelle importante :

- AUFS commence avec la branche inscriptible et ajoute les modules montés comme branches en lecture seule. MiniOS peut activer ou désactiver un module dans la racine active lorsque le montage AUFS prend en charge cette opération.
- OverlayFS reçoit sa liste complète et ordonnée `lowerdir` lors du montage de la racine, ainsi qu’un `upperdir` et `workdir`. Son ensemble de modules inférieurs ne peut pas être modifié à chaud par **Gestionnaire de modules MiniOS**.

**Gestionnaire de modules MiniOS** sépare donc **En cours d’exécution**, l’ensemble des modules montés, de **Démarrage suivant**, les modules sélectionnés par le support actuel et les règles de démarrage. Ajouter ou retirer un module persistant modifie normalement uniquement le démarrage suivant. Créer ou ouvrir un module ne l’active pas. L’activation et la désactivation à chaud ne sont possibles qu’avec AUFS.

Une fois la racine assemblée et l’initialisation précoce terminée, l’initrd LiveKit utilise `pivot_root`, conserve l’ancien initrd pour l’arrêt, et exécute l’init de la nouvelle racine. Le chemin dracut prépare la même racine assemblée mais laisse la finalisation `switch_root` à dracut. Voir [Chargement des modules initrd](/reference/boot-process/Module-Loading) pour la description détaillée de la transition.

## Layer modifiable et sessions

Sans persistance, la couche modifiable est stockée en mémoire et disparaît à l’extinction. L’activation de la persistance permet d’utiliser une session numérotée avec un backend de stockage compatible. La sélection, la compatibilité, les échecs d’activation, l’autorité de démarrage en cours et la durabilité sont définies dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Mode | Stockage modifiable | Remarques |
|------|------------------|-------|
| `native` | Fichiers stockés directement dans le répertoire de session | Nécessite un système de fichiers POSIX modifiable qui préserve les métadonnées Linux. |
| `dynfilefs` | Système de fichiers ext4 extensible réparti sur plusieurs fichiers de support | Compatible avec les systèmes de fichiers POSIX ainsi que les supports FAT32, NTFS ou exFAT. |
| `dynblk` | Système de fichiers ext4 léger sur un périphérique bloc du noyau, basé sur `volumeNNN.db` fichiers | Nécessite la prise en charge DynBlk côté utilisateur, noyau et initrd. |
| `raw` | Fichier de taille fixe `changes.img` contenant ext4 | Compatible avec les systèmes de fichiers POSIX ainsi que les supports FAT32, NTFS ou exFAT. |
| `squashfs` | Instantané `changes.sb` compressé | Décompressé dans RAM pour l’utilisation ; l’enregistrement sauvegarde, reconstruit et remplace l’instantané de façon atomique. Le système de fichiers de persistance doit préserver les métadonnées Linux lors de la sauvegarde. |

Raw, DynFileFS et DynBlk peuvent éventuellement intégrer une couche LUKS2. Les métadonnées enregistrent séparément le backend de stockage et le chiffrement. À l’extinction, ext4, le mapper, tout loop possédé et le backend sont libérés dans l’ordre des dépendances.

La session active sélectionnée pour une reprise ultérieure et la couche modifiable réellement autorisée pour le démarrage actuel sont deux états liés mais distincts. Modifier la sélection future ne remplace pas la couche modifiable en cours d’utilisation.

Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence) pour les commandes de création, sélection, dimensionnement, chiffrement, conversion, export et récupération.

## Priorité de la configuration

La configuration du support est `minios/config.conf`, avec des fragments optionnels dans `minios/config.conf.d/`. Les copies en cours d’exécution sont `/etc/live/config.conf` et `/etc/live/config.conf.d/` dans la racine composée.

Au démarrage, MiniOS compare les dates de modification et copie un fichier du support plus récent dans la racine en cours d’exécution. Si le support est modifiable et que la copie en cours d’exécution est plus récente, elle est recopiée sur le support. Les fichiers fragments sont synchronisés par nom dans les deux sens. Si l’horloge a reculé depuis la synchronisation précédente, MiniOS évite de remplacer les horodatages et ne complète que les destinations manquantes.

Les options de la ligne de commande du noyau remplacent les valeurs correspondantes lues dans la configuration en cours d’exécution pour ce démarrage. Cela signifie que l’ordre effectif pour un paramètre explicitement pris en charge est le paramètre de démarrage, puis la configuration synchronisée en cours d’exécution/support, puis la valeur par défaut intégrée. Les modifications persistantes de la configuration en cours d’exécution peuvent devenir la configuration du support si la source est modifiable ; un support ISO en lecture seule ne peut pas recevoir cette mise à jour.

Voir [Fichier de configuration](/reference/configuration/config.conf) et [live-config](/reference/configuration/live-config) pour les paramètres pris en charge.

## Cycle d’arrêt et de sauvegarde

L’arrêt normal donne d’abord au système en cours la possibilité de vider les services et les données de session. Une session SquashFS avec sauvegarde à l’arrêt activée est reconstruite et validée avant le démontage du système de fichiers. Le backend de sauvegarde écrit un marqueur de complétion pour la session en cours exacte ; l’initramfs d’arrêt vérifie ce marqueur et laisse la session sale si la sauvegarde requise a échoué.

L’initramfs d’arrêt détache ensuite les périphériques loop inutilisés, démonte l’ancienne racine et la couche modifiable, enregistre une session réussie comme propre, démonte le support et ferme un mapping LUKS appartenant à MiniOS. Un média optique peut alors être éjecté avant l’extinction ou le redémarrage. Les sauvegardes manuelles et périodiques SquashFS utilisent le même backend d’instantané, mais seule la politique de sauvegarde à l’arrêt configurée bloque la finalisation propre en cas d’absence de sauvegarde à l’arrêt.

## Arborescence des médias

L’organisation actuelle d’une image est la suivante. Les répertoires optionnels n’apparaissent que si la fonctionnalité associée a généré du contenu.

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

Les chemins démarrés sous `/run/initramfs/memory/` sont des points de montage d’implémentation, et non une seconde copie persistante de cette arborescence.

## Documentation associée

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Découverte du système Initrd](/reference/boot-process/System-Discovery)
- [Chargement des modules Initrd](/reference/boot-process/Module-Loading)
- [Persistance Initrd](/reference/boot-process/Persistence-Internals)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Menus de démarrage](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Fichier de configuration](/reference/configuration/config.conf)
- [Gestion de session](/using-minios/Sessions-and-Persistence)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
