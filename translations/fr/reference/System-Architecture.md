---
updated: 2026-10-15
---

# Architecture du système

MiniOS démarre un système d’exploitation en lecture seule, assemblé à partir de modules SquashFS, et ajoute une couche inscriptible pour la session en cours. L’initramfs se charge de détecter le support, de sélectionner les modules et la persistance, de construire le système de fichiers racine, d’appliquer la configuration initiale et de transmettre le contrôle au système init installé.

## Détection au démarrage

Le chargeur de démarrage BIOS ou UEFI charge un noyau Linux et un initramfs MiniOS depuis `minios/boot/`. L’initramfs détecte ensuite l’arborescence de données MiniOS contenant les modules live. La source peut être locale, sélectionnée de manière interactive ou fournie via un chemin réseau pris en charge ; une image ISO locale est montée en boucle avant l’utilisation de son arborescence de données. Les règles de priorité exactes et les formes acceptées`from=` sont décrites dans [Détection des systèmes par initrd](/reference/boot-process/System-Discovery).

La même étape de détection prend en charge les sources HTTP ISO et PXE. La mise en réseau facultative au démarrage sert uniquement à **charger MiniOS via le réseau** (PXE / HTTP ISO). Elle ne configure pas le réseau de façon persistante pour la session. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

Après la détection, MiniOS peut facultativement préparer une copie RAM. Le fait que la source d’origine reste nécessaire dépend du mode de copie, de la persistance et de la réussite du détachement. Voir [Modes de démarrage](/using-minios/Boot-Modes) pour comprendre le fonctionnement.

## Composition des modules

Chaque fichier `.sb` est un système de fichiers SquashFS en lecture seule. Les modules intégrés sont stockés directement sous `minios/` ; d’autres emplacements de modules peuvent contribuer à la composition ordonnée. L’initramfs sélectionne, ordonne et monte les couches résultantes en lecture seule. Les niveaux de priorité des candidats, le remplacement par nom de base, les filtres, les extensions personnalisées des bundles et la coordination avec le noyau en cours d’exécution sont décrits dans [Chargement des modules par initrd](/reference/boot-process/Module-Loading).

Une image Xfce typique comprend les rôles ordonnés suivants, même si les noms et le nombre exacts dépendent de la compilation et des modules ignorés pour cette cible :

```text
00-core-<arch>.sb
01-kernel-<version>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Les modules situés plus loin dans l’ordre ont une priorité supérieure et peuvent remplacer les chemins fournis par les modules précédents. Un module peut dépendre des fichiers de tous les modules portant un numéro inférieur ; les fichiers des modules forment donc une composition ordonnée plutôt qu’un ensemble de paquets indépendants.

## AUFS et OverlayFS

MiniOS utilise un système de fichiers union pour présenter les modules et la couche inscriptible comme un seul système de fichiers racine. Il sélectionne AUFS si le noyau en cours d’exécution le prend en charge, et utilise OverlayFS comme solution de repli. `union=aufs` demande AUFS, mais utilise tout de même OverlayFS comme solution de repli lorsque AUFS n’est pas disponible ; `union=overlayfs` sélectionne OverlayFS. Avec le démarrage sécurisé UEFI, initrd ne charge pas le module `aufs-ng` non signé et utilise OverlayFS, sauf si une autre implémentation AUFS utilisable est déjà présente.

Les deux implémentations présentent une différence opérationnelle importante :

- AUFS commence par la branche inscriptible et ajoute les modules montés comme branches en lecture seule. MiniOS peut activer ou désactiver un module dans la racine en cours d’exécution si le montage AUFS prend en charge cette opération.
- OverlayFS reçoit sa liste complète et ordonnée de `lowerdir` au montage de la racine, ainsi qu’un `upperdir` et un `workdir`. L’ensemble de ses modules inférieurs ne peut pas être modifié sur place par **Gestionnaire de modules MiniOS**.

**Gestionnaire de modules MiniOS** distingue donc **En cours d’exécution**, l’ensemble des modules montés, de **Au prochain démarrage**, les modules sélectionnés selon le support actuel et les règles de démarrage. L’ajout ou la suppression d’un module persistant ne modifie normalement que le prochain démarrage. La création ou l’ouverture d’un module ne l’active pas. L’activation et la désactivation à l’exécution ne sont possibles qu’avec AUFS.

Une fois la racine assemblée et la configuration initiale terminée, l’initrd de LiveKit utilise `pivot_root`, conserve l’ancien initrd pour les opérations d’arrêt et exécute l’init de la nouvelle racine. Le chemin dracut prépare la même racine assemblée, mais confie la dernière étape `switch_root` à dracut. Voir [Chargement des modules par initrd](/reference/boot-process/Module-Loading) pour connaître précisément les limites du transfert de contrôle.

## Couche inscriptible et sessions

Sans persistance, la couche inscriptible est stockée en mémoire et disparaît à l’arrêt. La persistance peut activer une session numérotée avec un backend de stockage pris en charge. Avec un backend Ventoy Persistence Plugin sélectionné, MiniOS utilise un environnement persistant ext4 direct au lieu de sessions numérotées. La sélection, la compatibilité, les échecs d’activation, l’autorité au démarrage actuel et la durabilité sont définies dans [Persistance avec initrd](/reference/boot-process/Persistence-Internals).

| Mode | Stockage inscriptible | Remarques |
|------|------------------|-------|
| `native` | Fichiers stockés directement dans le répertoire de la session | Nécessite un système de fichiers POSIX inscriptible qui préserve les métadonnées Linux. |
| `dynfilefs` | Système de fichiers ext4 extensible réparti sur des fichiers de support | Prend en charge les systèmes de fichiers POSIX et les supports FAT32, NTFS ou exFAT. |
| `dynblk` | Système de fichiers ext4 à allocation fine sur un périphérique bloc du noyau, reposant sur des fichiers `volumeNNN.db` | Nécessite l’espace utilisateur DynBlk, le noyau et la prise en charge par initrd. |
| `vmdk` | Stockage sparse fractionné `volume.vmdk` / `volume-sNNN.vmdk` exposé comme périphérique bloc par le pilote DynBlk | Nécessite la prise en charge `vmdk-session-v1` DynBlk/initrd ; aucune compression du backend. |
| `raw` | Image de taille fixe `changes.img` contenant ext4 | Prend en charge les systèmes de fichiers POSIX et les supports FAT32, NTFS ou exFAT. |
| `squashfs` | Instantané compressé `changes.sb` | Décompressé dans RAM pour être utilisé ; l’enregistrement reconstruit et remplace l’instantané de manière atomique. Le système de fichiers de persistance doit préserver les métadonnées Linux lors de l’enregistrement. |

Les formats Raw, DynFileFS, DynBlk et VMDK peuvent comporter une couche LUKS2 facultative. Les métadonnées enregistrent séparément le backend de stockage et le chiffrement. À l’arrêt, ext4, le mappeur, toute boucle détenue et le backend sont libérés dans l’ordre des dépendances.

La session active sélectionnée pour une reprise ultérieure et la couche inscriptible effectivement autorisée pour le démarrage actuel sont deux états liés, mais distincts. Modifier une sélection future ne remplace pas la couche inscriptible en cours d’utilisation.

Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence) pour les commandes de création, de sélection, de dimensionnement, de chiffrement, de conversion, d’exportation et de récupération.

## Priorité de la configuration

La configuration du support se trouve dans `minios/config.conf`, avec des fragments facultatifs dans `minios/config.conf.d/`. Les copies d’exécution se trouvent dans `/etc/live/config.conf` et `/etc/live/config.conf.d/` dans le système de fichiers racine assemblé.

Au démarrage, MiniOS compare les dates de modification et copie dans la racine d’exécution tout fichier du support plus récent. Si le support est inscriptible et que la copie d’exécution est plus récente, elle est recopiée sur le support. Les fichiers de fragments sont synchronisés par nom dans les deux sens. Si l’horloge a reculé depuis la synchronisation précédente, MiniOS évite de remplacer les horodatages et ne crée que les destinations manquantes.

Les options de la ligne de commande du noyau remplacent, pour ce démarrage, les valeurs correspondantes lues dans la configuration d’exécution. Ainsi, pour un paramètre explicitement pris en charge, l’ordre de priorité effectif est le suivant : paramètre de démarrage, configuration synchronisée d’exécution/support, puis valeur par défaut intégrée. Les modifications persistantes apportées à la configuration d’exécution peuvent devenir la configuration du support si celui-ci est la source inscriptible ; un support ISO en lecture seule ne peut pas recevoir cette mise à jour.

Voir [Fichier de configuration](/reference/configuration/config.conf) et [live-config](/reference/configuration/live-config) pour connaître les paramètres pris en charge.

## Cycle d’arrêt et d’enregistrement

Lors d’un arrêt normal, le système en cours d’exécution peut d’abord vider les tampons des services et enregistrer les données de session. Une session SquashFS avec l’enregistrement à l’arrêt activé est reconstruite et validée avant le démontage des systèmes de fichiers. Le backend d’enregistrement écrit un marqueur d’achèvement pour la session exacte en cours d’exécution ; l’initramfs d’arrêt vérifie ce marqueur et laisse la session à l’état « modifié » si l’enregistrement requis a échoué.

L’initramfs d’arrêt détache ensuite les périphériques loop inutilisés, démonte l’ancienne racine et la couche inscriptible, marque comme propre une session enregistrée avec succès, démonte le support et ferme un mappage LUKS détenu par MiniOS. Le support optique peut ensuite être éjecté avant l’extinction ou le redémarrage. Les enregistrements manuels et périodiques SquashFS utilisent le même backend d’instantané, mais seule la stratégie d’arrêt configurée empêche la finalisation propre si l’enregistrement à l’arrêt est manquant.

## Arborescence du support

L’organisation d’une image actuelle est la suivante. Les répertoires facultatifs n’apparaissent que si la fonctionnalité associée a créé du contenu.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>.sb
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

Les chemins de démarrage sous `/run/initramfs/memory/` sont des points de montage d’implémentation, et non une seconde copie persistante de cette arborescence.

## Documentation associée

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Détection du système par l’initrd](/reference/boot-process/System-Discovery)
- [Chargement des modules par l’initrd](/reference/boot-process/Module-Loading)
- [Persistance de l’initrd](/reference/boot-process/Persistence-Internals)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Menus de démarrage](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Fichier de configuration](/reference/configuration/config.conf)
- [Gestion des sessions](/using-minios/Sessions-and-Persistence)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
