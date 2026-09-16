---
updated: 2026-09-16
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sessions et persistance

Les sessions MiniOS conservent les modifications apportées au système en fonctionnement après les redémarrages. Chaque session correspond à un répertoire numéroté sous `minios/changes/` ; les modules MiniOS en lecture seule restent inchangés et la session sélectionnée fournit la couche writable du système de fichiers union.

Utilisez le Gestionnaire de sessions MiniOS depuis un système MiniOS en cours d'exécution :

```bash
minios-session-manager
```

L’outil équivalent en ligne de commande est `minios-session`. Les commandes de modification nécessitent des privilèges administrateur, donc les exemples ci-dessous utilisent `sudo`.

## Modes de session

| Mode | Stockage | Contraintes principales | MiniOS couche LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Modifications enregistrées directement dans le dossier de session | Nécessite un système de fichiers inscriptible qui préserve les métadonnées Linux et les opérations détectées par MiniOS. La capacité dépend de l’espace libre disponible ; `perchsize` non applicable. | Non |
| `dynfilefs` | ext4 extensible `virtual.dat` basé sur des fichiers segments format-400 | Fonctionne sur les systèmes de fichiers POSIX inscriptibles, FAT32, NTFS et exFAT. La charge utile est légère, mais l’index de correspondance évolue selon la capacité logique déclarée. | Oui |
| `dynblk` | Système de fichiers ext4 fin sur un périphérique bloc du noyau, basé sur `volumeNNN.db` fichiers | Nécessite le CLI DynBlk, le module noyau et la capacité initrd. La taille créée au démarrage est de 16 Gio par défaut ; la limite du format est de 512 Gio. Le budget de mappage clairsemé RAM est géré séparément. | Oui |
| `raw` | Fichier unique `changes.img` contenant ext4 | Capacité logique fixe avec extension explicite uniquement. Fonctionne sur POSIX inscriptible, FAT32, NTFS et exFAT ; FAT32 est limité à 4000 Mio. | Oui |
| `squashfs` | Instantané compressé dans `changes.sb` ; la couche supérieure inscriptible à l’exécution est reconstruite dans RAM | `perchsize` non applicable. Les instantanés existants peuvent être restaurés depuis un support inscriptible compatible, tandis que l’enregistrement exact nécessite un système de fichiers de transit compatible POSIX. | Non |

Raw, DynFileFS et DynBlk peuvent intégrer une couche de chiffrement LUKS2 en option. Le backend de stockage reste le mode de session, et les métadonnées de session enregistrent le chiffrement séparément. DynFileFS et raw créés avec `minios-session` ont une taille par défaut de 4000 Mio ; DynBlk est par défaut à 16 Gio. Les tailles sont allouées en Mio ; `GB` et `TB` les suffixes correspondent à 1000 et 1 000 000 Mio. Raw est limité à 4000 Mio sur FAT32, chiffré ou non. Les données utiles DynFileFS augmentent à la demande, mais son index format-400 est dimensionné pour la capacité logique totale et nécessite environ 2 Mio de RAM plus environ 2 Mio de stockage par Gio. La capacité DynBlk est fine et son mappage à l’exécution est clairsemé : les mappages denses coûtent environ 8 Mio/Gio, tandis que la capacité virtuelle inutilisée ne consomme aucun segment de mappage. Le pilote DynBlk choisit automatiquement son budget de mappage à environ 25 % de l’espace RAM utilisable, plafonné à 4096 Mio ; MiniOS ne modifie pas cette politique. Les écritures réelles restent limitées par l’espace libre du système de fichiers sous-jacent et les ressources du backend. Les opérations de redimensionnement de conteneur ne permettent que l’agrandissement d’une session ; la réduction n’est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas gérer les métadonnées Linux.
Utilisez DynBlk si vous souhaitez un véritable périphérique bloc du noyau avec des fichiers de support fins ; le pilote peut maintenir plusieurs volumes DynBlk indépendants connectés simultanément, et le gestionnaire de session utilise le chemin de périphérique retourné par le pilote au lieu de supposer que `/dev/dynblk0` est libre.
Utilisez raw si une allocation fixe est requise, ajoutez LUKS2 si la session doit être chiffrée, et utilisez SquashFS pour un instantané compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers de persistance réel et les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L’initrd peut lire et activer un instantané SquashFS existant stocké sur FAT, exFAT ou NTFS inscriptible, car il extrait l’instantané dans une couche supérieure ext4 temporaire. La création ou l’enregistrement exact d’un instantané est différente : son espace de travail privé doit se trouver sur un système de fichiers POSIX adapté qui préserve les métadonnées Linux et les suppressions union.

## Sélection du démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement des options pour reprendre, créer une nouvelle session, sélectionner ou démarrer sans persistance. La description de référence des sélecteurs, de la compatibilité, des modes de secours et des comportements d’activation se trouve dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Paramètre | Signification |
|-----------|---------|
| `perch` | Utiliser le chemin de reprise hérité avec la meilleure tentative possible. Il essaie la valeur par défaut des métadonnées mais ne crée pas de remplacement si aucune n’est utilisable. |
| `perchdir=resume` | Reprendre la valeur par défaut des métadonnées et, si elle est absente ou incompatible, permettre à l’initrd de créer un nouveau remplacement compatible. Il s’agit du comportement actuel de reprise dans le menu de démarrage. |
| `perchdir=new` | Allouer une nouvelle session numérotée. |
| `perchdir=ask` | Sélectionner une session existante ou en créer une lors du démarrage. |
| `perchdir=<id>` | Sélectionner directement cette session numérotée. |
| `perchdir=<device/path>` | Utiliser un emplacement de persistance sur un périphérique, y compris `/dev/...` et `label:...` formes gérées par l’initrd. |
| `perchmode=<mode>` | Définir `native`, `dynfilefs`, `dynblk`, `raw`, ou `squashfs`. |
| `perchencrypt=luks` | Chiffrer une session Raw, DynFileFS ou DynBlk nouvellement créée avec LUKS2. Les sessions existantes héritent du chiffrement uniquement à partir des métadonnées. |
| `perchcomp=<codec>` | Sélectionner la compression backend DynBlk pour une nouvelle session DynBlk. La compression est forcée à `none` lorsque DynBlk est encapsulé dans LUKS2. |
| `perchsize=<size>` | Définir une taille de conteneur nouvelle ou supérieure ; les valeurs simples sont allouées en Mio et les suffixes `MB`, `GB`, et `TB` sont acceptés. |

Si aucun mode n’est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32/NTFS/exFAT, la création native au démarrage bascule vers DynFileFS en cas d’échec. Un nouveau conteneur raw est par défaut de 4000 Mio. Les nouvelles sessions de démarrage DynFileFS et DynBlk sans `perchsize` utilisent jusqu’à 16 Gio ; si l’espace restant après la réserve de sécurité est inférieur, la taille automatique est réduite. DynFileFS prend également en compte la surcharge de son index et la limite RAM. L’extension explicite de DynBlk est limitée à 512 Gio.
Les sessions SquashFS peuvent être capturées depuis le système en cours d’exécution avec le Gestionnaire de sessions MiniOS ou `minios-session create squashfs`. L’initialisation initrd ne crée que les métadonnées de session de génération zéro et conserve la couche supérieure en écriture dans RAM. Le système en cours d’exécution crée le premier `changes.sb` instantané à la demande ou à l’arrêt.

Lors de la reprise, MiniOS vérifie la version enregistrée, l’édition, le système de fichiers union et le mode. Le paramètre littéral `perchdir=resume` peut créer une nouvelle session au lieu d’utiliser une valeur par défaut absente ou incompatible. Les demandes de reprise simples `perch`, la sélection numérique directe et d’autres demandes de reprise héritées ne créent pas automatiquement ce remplacement.
La sélection interactive affiche un avertissement avant d’autoriser une session incompatible. Si la sélection ou l’activation échoue encore, le démarrage continue normalement avec une couche supérieure RAM et un avertissement de persistance.

Le stockage des sessions a la forme suivante :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l’édition, le système de fichiers union, la taille, l’état et les paramètres spécifiques au mode pour chaque session.
Il s’agit de métadonnées persistantes validées par l’implémentation du démarrage, mais qui ne prouvent pas à elles seules l’état courant du système. Ne les modifiez pas et ne déplacez pas les données de session numérotées lorsqu’une session est montée ; utilisez le Gestionnaire de sessions MiniOS ou `minios-session`.

## Sessions actives et en cours d’exécution

Ces termes décrivent des états différents :

- La session **active** est celle sélectionnée par défaut pour le prochain démarrage.
- Conceptuellement, la session **en cours** est celle dont la couche inscriptible fournit effectivement la persistance au démarrage actuel.

Le champ persistant `running=` enregistre cette relation prévue. Un crash, une construction de l’union échouée, une copie du magasin ou un arrêt interrompu peuvent le rendre obsolète même si le démarrage actuel utilise RAM ou une autre session. Les opérations telles que la sauvegarde SquashFS nécessitent donc l’état protégé de l’initrd lié à l’ID de démarrage et le upper monté vérifié ; elles ne se fient pas à `running=` seul. Voir [État actif, en cours et du démarrage actuel](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

L’activation d’une session modifie le prochain démarrage mais ne change pas le système de fichiers union en cours :

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La session active ne peut pas être supprimée ou convertie sur place. Une session en cours ne peut normalement pas être supprimée, exportée, copiée, redimensionnée ou convertie. Le nettoyage protège également les deux identifiants.

## Référence des commandes

Lister les sessions et inspecter le store :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Créer des sessions :

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sans mode sélectionne natif. La création de SquashFS capture les modifications en cours et n’a pas de taille fixe. Sa politique d’arrêt est par défaut à `shutdown` ; la sauvegarde périodique est désactivée par défaut.

Sauvegarder et configurer une session SquashFS :

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Les intervalles périodiques valides sont `30`, `60`, `120`, `240`, et `480` minutes ; `0` désactive la sauvegarde périodique. Les paramètres d’arrêt et de sauvegarde périodique sont indépendants.

Exporter et importer `.tar.zst` archives :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Seuls les `.tar.zst` imports sont acceptés. Les chemins et membres d’archive sont vérifiés, et l’extraction est limitée. `--auto-convert` choisit un mode compatible avec le système de fichiers actuel. `--force-mode <mode>` sélectionne explicitement un mode disponible. L’export, la copie et la conversion ne sont pas pris en charge pour les sessions SquashFS ; sauvegardez l’instantané et copiez le dossier complet de la session inactive à la place.

Copier ou convertir une session :

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` correspond à une copie logique du système de fichiers et attribue toujours un nouvel identifiant de session. Il peut changer de backend, de capacité ou de chiffrement et crée de nouvelles identités ext4 et LUKS.`clone` copie physiquement un backend détaché et conserve son en-tête LUKS, ses keyslots, l’UUID LUKS et l’UUID ext4.`convert` remplace la source par défaut ; utilisez `--new-session` pour conserver la source. Une taille n’est pertinente que pour une cible de type conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge les sessions DynFileFS, DynBlk et raw, y compris les formes chiffrées, et nécessite une taille supérieure à la taille actuelle. Le redimensionnement DynBlk augmente d’abord le périphérique de blocs virtuel puis étend son système de fichiers ext4 ; la nouvelle capacité virtuelle n’est pas préallouée. Le nettoyage concerne par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre store de sessions peut être sélectionné avec `--sessions-dir PATH` :

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportement de sauvegarde SquashFS

Une session SquashFS est extraite dans RAM pour la couche modifiable en cours d’exécution. La sauvegarde reconstruit et valide un instantané exact, puis remplace de façon atomique `changes.sb`.
Aucune génération de restauration n’est conservée. Sauvegarder maintenant est disponible depuis l’icône de la zone de notification, le Gestionnaire de sessions MiniOS, ou `minios-session save` quelle que soit la politique automatique.

La sauvegarde à l’arrêt est gérée par le déclencheur d’arrêt principal MiniOS et le backend `minios-squashfs-save`, elle ne dépend donc pas de l’ouverture ou de l’installation du Gestionnaire de sessions MiniOS. La sauvegarde périodique est vérifiée toutes les 30 minutes par un minuteur systemd ou un worker SysV, qui appellent tous deux le même backend d’enregistrement automatique. La reconstruction de l’instantané consomme du CPU et écrit l’instantané complet ; il est recommandé d’utiliser des intervalles d’une heure ou plus.

Pendant une opération RAM-backed SquashFS, un instantané SquashFS nouvellement capturé et activé peut prendre le contrôle de la cible de sauvegarde en cours d’utilisation. Après ce transfert, l’ancien instantané actif peut être supprimé sans redémarrage :

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Cette exception s’applique uniquement à un transfert valide de démarrage actuel SquashFS. Les autres modes de persistance en cours d’exécution restent protégés contre la suppression.

## Chiffrement

LUKS2 est une couche optionnelle au-dessus de Raw `changes.img`, DynFileFS `virtual.dat`, ou du périphérique DynBlk direct. Cette option n'est disponible que si `/run/initramfs/etc/minios-initramfs-crypt` contient `luks-layer-v1` et que les outils et fonctionnalités du backend sélectionné sont disponibles.

La création interactive d’un volume LUKS demande la saisie de la phrase de passe à deux reprises. Les opérations qui lisent ou créent des données LUKS peuvent recevoir la phrase de passe depuis l’entrée standard avec `--password-stdin`.
Les phrases de passe ne sont jamais placées dans les arguments de commande ni dans les métadonnées de session. Au démarrage, l’initrd demande la phrase de passe sur la console. Trois tentatives refusées interrompent le démarrage de façon fatale ; MiniOS ne poursuit pas en clair, RAM, avec un autre backend ou une session de remplacement pour la même requête.

Les exports chiffrés contiennent les fichiers de session logique déchiffrés, et non le backend chiffré. L’importation, la copie ou la conversion vers LUKS créent un nouveau backend chiffré avec de nouvelles identités.

## Sauvegardes et sessions échouées

Pour les sessions natives, DynFileFS, DynBlk et les sessions brutes, y compris les formes chiffrées, utilisez `export` pour les sauvegardes logiques plutôt que de copier un dossier de session monté. Conservez l’archive obtenue sur un autre appareil et vérifiez qu’elle peut être importée avant de vous y fier. L’importation crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à être utilisée.
Pour les procédures de sauvegarde SquashFS et de l’appareil complet, consultez [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si une session échoue après un remplissage du stockage, une interruption d’écriture ou la création répétée de sessions vides, cessez toute modification du stockage concerné. Exportez d’abord une session lisible et arrêtée si possible, puis suivez [Dépannage](/maintenance-and-recovery/Troubleshooting).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant l’activation en écriture. En cas d’échec sérieux du contrôle du système de fichiers, le conteneur est préservé pour la récupération au lieu d’être monté en écriture. SquashFS détecte un état précédent non propre et restaure la dernière capture enregistrée avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions MiniOS ou `minios-session delete`; ne supprimez pas les dossiers de session manuellement.
