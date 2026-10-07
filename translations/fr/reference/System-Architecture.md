---
updated: 2026-10-06
---

# Architecture système

MiniOS démarre un système d’exploitation en lecture seule, assemblé à partir de modules SquashFS, et ajoute une couche modifiable pour la session en cours. L’initramfs est chargé de détecter le support, de sélectionner les modules et la persistance, de construire le système de fichiers racine, d’appliquer la configuration initiale, puis de transmettre le contrôle au système d’init installé.

## Détection de démarrage

Le chargeur de démarrage BIOS ou UEFI charge un noyau Linux et un initramfs MiniOS depuis `minios/boot/`. L’initramfs découvre ensuite l’arborescence de données MiniOS qui contient les modules live. La source peut être locale, sélectionnée de façon interactive ou fournie via un chemin réseau pris en charge ; une ISO locale est montée en boucle avant d’utiliser son arborescence de données. La priorité exacte et les formes acceptées `from=` sont documentées dans [Découverte du système initrd](/reference/boot-process/System-Discovery).

La même étape de détection prend en charge les sources ISO HTTP et PXE. Le réseau en début de démarrage est optionnel et réservé uniquement au **chargement de MiniOS via le réseau** (PXE / ISO HTTP). Il ne s’agit pas d’une configuration réseau de session persistante. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

Après la détection, MiniOS peut préparer en option une copie RAM. Le maintien de la source d’origine dépend du mode de copie, de la persistance et du détachement réussi. Voir [Modes de démarrage](/using-minios/Boot-Modes) pour le modèle opérationnel.

## Composition des modules

Chaque `.sb` fichier est un système de fichiers SquashFS en lecture seule. Les modules intégrés sont stockés directement sous `minios/` ; d’autres emplacements de modules peuvent contribuer à la composition ordonnée. L’initramfs sélectionne, ordonne et monte les couches en lecture seule résultantes. Les niveaux candidats, le remplacement de nom de base, les filtres, les extensions personnalisées de bundles et la coordination avec le noyau en cours d’exécution sont détaillés dans [Chargement des modules initrd](/reference/boot-process/Module-Loading).

Une image Xfce typique contient les rôles suivants, dans cet ordre, bien que les noms exacts et le nombre dépendent de la construction et des modules omis pour la cible :

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Les modules ultérieurs ont une priorité supérieure et peuvent remplacer les chemins fournis par les modules précédents. Un module peut dépendre des fichiers de tous les modules de rang inférieur, donc un ensemble de fichiers de modules constitue une composition ordonnée plutôt qu’une collection de paquets indépendants.

## AUFS et OverlayFS

MiniOS utilise un système de fichiers union pour présenter les modules et la couche modifiable comme un seul système de fichiers racine. Il sélectionne AUFS si le noyau en cours d’exécution le prend en charge, sinon il revient à OverlayFS. `union=aufs` demande AUFS mais revient tout de même à OverlayFS si AUFS n’est pas disponible ; `union=overlayfs` sélectionne OverlayFS. En mode UEFI Secure Boot, l’initrd ne charge pas le module non signé `aufs-ng` et utilise OverlayFS sauf si une autre implémentation AUFS utilisable est déjà présente.

Les deux implémentations présentent une différence de fonctionnement importante :

- AUFS commence par la branche modifiable et ajoute les modules montés comme branches en lecture seule. MiniOS peut activer ou désactiver un module dans la racine active si le montage AUFS prend en charge cette opération.
- OverlayFS reçoit sa liste complète et ordonnée de `lowerdir` modules au moment du montage de la racine, ainsi qu’un `upperdir` et `workdir`. Son ensemble de modules de rang inférieur ne peut pas être modifié à chaud par **Gestionnaire de modules MiniOS**.

**Gestionnaire de modules MiniOS** sépare donc **En cours**, l’ensemble des modules montés, de **Prochain démarrage**, les modules sélectionnés par le support et les règles de démarrage actuels. Ajouter ou retirer un module durable modifie normalement uniquement le prochain démarrage. Créer ou ouvrir un module ne l’active pas. L’activation et la désactivation à chaud ne sont disponibles qu’avec AUFS.

Une fois la racine assemblée et la configuration initiale terminée, l’initrd LiveKit utilise `pivot_root`, conserve l’ancien initrd pour la phase d’arrêt, puis exécute l’init de la nouvelle racine. Le chemin dracut prépare la même racine assemblée mais laisse la dernière `switch_root` à dracut. Voir [Chargement des modules initrd](/reference/boot-process/Module-Loading) pour la description détaillée de la transition.

## Couche modifiable et sessions

Sans persistance, la couche modifiable est en mémoire et disparaît à l’arrêt. La persistance peut activer à la place une session numérotée avec un backend de stockage pris en charge. La sélection, la compatibilité, l’échec d’activation, l’autorité du démarrage en cours et la durabilité sont définies dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Mode | Stockage modifiable | Remarques |
|------|------------------|-------|
| `native` | Fichiers stockés directement dans le dossier de session | Nécessite un système de fichiers POSIX modifiable qui préserve les métadonnées Linux. |
| `dynfilefs` | Système de fichiers ext4 extensible réparti sur plusieurs fichiers de support | Prend en charge les systèmes de fichiers POSIX ainsi que les supports FAT32, NTFS ou exFAT. |
| `dynblk` | Système de fichiers ext4 fin sur un périphérique bloc du noyau, adossé à des `volumeNNN.db` fichiers | Nécessite l’espace utilisateur, le noyau et la capacité initrd DynBlk. |
| `vmdk` | Stockage sparse fractionné `volume.vmdk` / `volume-sNNN.vmdk` exposé comme périphérique bloc par le pilote DynBlk | Nécessite la capacité `vmdk-session-v1` DynBlk/initrd ; pas de compression backend. |
| `raw` | Fichier de taille fixe `changes.img` contenant ext4 | Prend en charge les systèmes de fichiers POSIX ainsi que les supports FAT32, NTFS ou exFAT. |
| `squashfs` | Snapshot `changes.sb` compressé | Décompressé dans RAM pour utilisation ; l’enregistrement reconstruit et remplace atomiquement le snapshot. Le système de fichiers de persistance doit préserver les métadonnées Linux lors de l’enregistrement. |

Les formats raw, DynFileFS, DynBlk et VMDK peuvent embarquer une couche LUKS2 en option. Les métadonnées enregistrent séparément le backend de stockage et le chiffrement. L’arrêt libère ext4, le mapper, tout loop possédé et le backend dans l’ordre des dépendances.

La session active sélectionnée pour une reprise future et la couche modifiable effectivement autorisée pour le démarrage en cours sont deux états liés mais distincts. Modifier la sélection future ne remplace pas la couche modifiable en cours d’utilisation.

Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence) pour les commandes de création, sélection, dimensionnement, chiffrement, conversion, export et récupération.

## Priorité de la configuration

La configuration du support est `minios/config.conf`, avec des fragments optionnels dans `minios/config.conf.d/`. Les copies en cours d’exécution sont `/etc/live/config.conf` et `/etc/live/config.conf.d/` dans la racine composée.

Au démarrage, MiniOS compare les dates de modification et copie un fichier média plus récent dans la racine en cours d’exécution. Si le support est modifiable et que la copie en cours d’exécution est plus récente, elle est recopiée vers le support. Les fichiers fragments sont synchronisés par nom dans les deux sens. Si l’horloge a reculé depuis la synchronisation précédente, MiniOS évite de remplacer les horodatages et ne complète que les destinations manquantes.

Les options de la ligne de commande du noyau remplacent les valeurs correspondantes lues dans la configuration en cours d’exécution pour ce démarrage. L’ordre effectif pour un paramètre explicitement pris en charge est donc : le paramètre de démarrage, puis la configuration runtime/média synchronisée, puis la valeur par défaut intégrée. Les modifications persistantes de la configuration runtime peuvent devenir la configuration du support si la source est modifiable ; les supports ISO en lecture seule ne peuvent pas recevoir cette mise à jour.

Voir [Fichier de configuration](/reference/configuration/config.conf) et [live-config](/reference/configuration/live-config) pour les paramètres pris en charge.

## Cycle d’arrêt et de sauvegarde

L’arrêt normal donne d’abord au système en cours l’occasion de vider les services et les données de session. Une session SquashFS avec sauvegarde à l’arrêt activée est reconstruite et validée avant le démontage du système de fichiers. Le backend de sauvegarde écrit un marqueur d’achèvement pour la session en cours exacte ; l’initramfs d’arrêt vérifie ce marqueur et laisse la session sale si la sauvegarde requise a échoué.

L’initramfs d’arrêt détache ensuite les périphériques loop inutilisés, démonte l’ancienne racine et la couche modifiable, enregistre une session réussie comme propre, démonte le support et ferme un mapping LUKS appartenant à MiniOS. Le support optique peut alors être éjecté avant l’extinction ou le redémarrage. Les sauvegardes manuelles et périodiques SquashFS utilisent le même backend de snapshot, mais seule la politique d’arrêt configurée bloque la finalisation propre en cas d’absence de sauvegarde à l’arrêt.

## Arborescence du support

Une image actuelle est organisée comme suit. Les dossiers optionnels n’apparaissent que si la fonctionnalité associée a créé du contenu.

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

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Découverte du système initrd](/reference/boot-process/System-Discovery)
- [Chargement des modules initrd](/reference/boot-process/Module-Loading)
- [Persistance initrd](/reference/boot-process/Persistence-Internals)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Menus de démarrage](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Fichier de configuration](/reference/configuration/config.conf)
- [Gestion des sessions](/using-minios/Sessions-and-Persistence)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
