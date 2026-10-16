---
updated: 2026-10-15
program_commits:
    minios-session-manager: 120fdba6a6fe1838f1aaa3c153aafc080829798d
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Sessions et persistance

Les sessions MiniOS conservent les modifications apportées au système actif après les redémarrages. Chaque session est un répertoire numéroté situé sous `minios/changes/` ; les modules MiniOS en lecture seule restent inchangés, et la session sélectionnée fournit la couche inscriptible du système de fichiers union.

Utilisez le Gestionnaire de sessions MiniOS depuis un système MiniOS en cours d’exécution :

```bash
minios-session-manager
```

L’outil équivalent en ligne de commande est `minios-session`. Toutes les commandes, à l’exception de help, nécessitent des privilèges d’administration ; exécutez les exemples avec `sudo`.

Ces procédures de gestion des sessions numérotées ne sont pas disponibles avec une image **Persistence Plugin Ventoy**. Cette image fournit un environnement persistant unique, sélectionné dans Ventoy, sans métadonnées de session MiniOS. Les démarrages ordinaires Ventoy sans plug-in de stockage sélectionné conservent les sessions MiniOS ; voir [ Ventoy](/installing-minios/installation-tools/Ventoy).

## Modes de session

| Mode | Stockage | Principales contraintes | Couche LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | Modifications stockées directement dans le répertoire de la session | Nécessite un système de fichiers inscriptible qui préserve les métadonnées Linux et les opérations recherchées par MiniOS. La capacité dépend de l’espace disponible sur le support ; `perchsize` ne s’applique pas. | Non |
| `dynfilefs` | ext4 extensible `virtual.dat` stocké dans des fichiers de segments au format 400 | Fonctionne sur les systèmes de fichiers POSIX inscriptibles, FAT32, NTFS et exFAT. Les données sont allouées de manière dynamique, mais l’index de mappage évolue en fonction de la capacité logique déclarée. | Oui |
| `dynblk` | Système de fichiers ext4 à allocation dynamique sur un périphérique bloc du noyau, reposant sur des fichiers `volumeNNN.db` | Nécessite le CLI DynBlk, le module du noyau et la prise en charge par l’initrd. Par défaut, la taille créée au démarrage peut atteindre 16 Gio ; la limite maximale est indiquée par `dynblk limits`. Les mappages stockés sur disque utilisent un cache de métadonnées de taille limitée. | Oui |
| `vmdk` | Système de fichiers ext4 à allocation dynamique sur un VMDK sparse standard fractionné, exposé par le pilote DynBlk | Utilise `volume.vmdk` et `volume-sNNN.vmdk`. Aucune compression. Nécessite `vmdk-session-v1` dans le marqueur de capacité de l’initrd en cours d’exécution. Même valeur par défaut manuelle de 16 Gio que pour DynBlk ; interrogez `dynblk limits --format vmdk` pour connaître les limites. | Oui |
| `raw` | Fichier `changes.img` unique contenant ext4 | Capacité logique fixe, extensible uniquement sur demande. Fonctionne sur les systèmes de fichiers POSIX inscriptibles, FAT32, NTFS et exFAT ; FAT32 est limité à 4000 Mio. | Oui |
| `squashfs` | Instantané compressé dans `changes.sb` ; la couche supérieure inscriptible à l’exécution est reconstruite dans RAM | `perchsize` ne s’applique pas. Les instantanés existants peuvent être restaurés depuis un support inscriptible pris en charge ; leur enregistrement exact nécessite un stockage persistant POSIX adapté. | Non |

Les formats Raw, DynFileFS, DynBlk et VMDK peuvent intégrer une couche de chiffrement LUKS2 en option. Le stockage reste déterminé par le mode de session ; les métadonnées de session indiquent séparément le chiffrement. DynFileFS et le format Raw créé avec `minios-session` utilisent par défaut 4000 Mio ; DynBlk et VMDK utilisent par défaut 16 Gio. Les tailles sont allouées en Mio ; les suffixes `GB` et `TB` correspondent respectivement à 1000 et 1 000 000 Mio. Sur FAT32, la taille du format Raw est limitée à 4000 Mio, qu’il soit chiffré ou non. Les données de la charge utile DynFileFS augmentent à la demande, mais l’index au format 400 est dimensionné pour toute la capacité logique et nécessite environ 2 Mio de RAM, ainsi qu’environ 2 Mio de stockage de support par Gio. DynBlk conserve les tables de mappage sur disque et utilise un cache de métadonnées de taille limitée dans RAM, de 1 Mio par défaut au lieu d’un pourcentage de RAM. Ses vecteurs d’extensions et de fichiers ainsi que ses répertoires augmentent avec le nombre de parties déclaré, tandis que le remplissage de la charge utile ne nécessite pas de conserver en mémoire une carte complète. Interrogez la limite de capacité installée avec `dynblk limits --format dynblk`. Les écritures réelles restent limitées par l’espace disponible sur le système de fichiers sous-jacent et par les ressources accordées par le backend. Les opérations de redimensionnement des conteneurs permettent uniquement d’agrandir une session ; la réduction n’est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas représenter les métadonnées Linux.
Utilisez DynBlk si vous avez besoin d’un véritable périphérique bloc du noyau reposant sur des fichiers à allocation dynamique ; le pilote peut connecter simultanément plusieurs volumes DynBlk indépendants, et le Gestionnaire de sessions utilise le chemin du périphérique renvoyé par le pilote au lieu de supposer que `/dev/dynblk0` est libre. Les modes DynBlk et VMDK ne sont pas disponibles lorsque Secure Boot UEFI est activé, car MiniOS ne signe pas le module de noyau externe DynBlk. L’installateur et le Gestionnaire de sessions masquent donc ces modes et rejettent les demandes explicites de création avant toute tentative de chargement du module.
Utilisez le format Raw lorsqu’une allocation fixe est requise, ajoutez LUKS2 si la session doit être chiffrée et utilisez SquashFS pour obtenir un instantané compressé exact.

Exécutez les commandes suivantes pour examiner le système de fichiers de persistance réel et les modes disponibles :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L’initrd peut lire et activer un instantané SquashFS existant, stocké sur un support FAT, exFAT ou NTFS inscriptible, car il extrait l’instantané dans une couche supérieure ext4 temporaire. La création ou l’enregistrement exact d’un instantané est une autre opération : le stockage persistant doit prendre en charge les métadonnées POSIX requises ainsi qu’une publication privée et durable. L’arborescence de travail utilisée pour la capture exacte utilise RAM fiable lorsque cette fonctionnalité est disponible, avec un espace de travail sur disque comme solution de repli si RAM est insuffisant.

## Sélection au démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement les entrées de reprise, de création, de sélection et de démarrage sans persistance. La description de référence des règles de sélection, de compatibilité, de repli et d’activation se trouve dans [Persistance de l’initrd](/reference/boot-process/Persistence-Internals).

| Paramètre | Signification |
|-----------|---------|
| `perch` | Utilise l’ancienne procédure de reprise au mieux. Elle essaie le choix par défaut des métadonnées, mais n’en crée pas de nouveau si aucun choix n’est utilisable. |
| `perchdir=resume` | Reprend la session définie par défaut dans les métadonnées et, si elle est absente ou incompatible, autorise l’initrd à créer une nouvelle session compatible en remplacement. Il s’agit du comportement actuel de reprise du menu de démarrage. |
| `perchdir=setup` | Ouvre le sélecteur interactif de backend de persistance, puis crée une nouvelle session numérotée. Il s’agit du comportement actuel de **Démarrer une nouvelle session**. |
| `perchdir=new` | Crée directement une nouvelle session numérotée à partir des paramètres de backend, de chiffrement, de compression et de taille demandés ou définis par défaut, sans ouvrir le sélecteur de backend. |
| `perchdir=ask` | Sélectionne une session existante ; si le stockage est vide, lance automatiquement le même processus de configuration que `perchdir=setup`. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, notamment les formats `/dev/...` et `label:...` pris en charge par l’initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw` ou `squashfs`. |
| `perchencrypt=luks` | Chiffre avec LUKS2 une nouvelle session Raw, DynFileFS, DynBlk ou VMDK. Pour les sessions existantes, le chiffrement est déterminé uniquement à partir des métadonnées. |
| `perchcomp=<codec>` | Sélectionne la compression du backend DynBlk pour une nouvelle session DynBlk. La compression est forcée à `none` lorsque DynBlk est protégé par LUKS2. |
| `perchsize=<size>` | Définit une taille de conteneur nouvelle ou supérieure ; les valeurs sans suffixe sont allouées en Mio, et les suffixes `MB`, `GB` et `TB` sont acceptés. |

Si aucun mode n’est précisé pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32, NTFS ou exFAT, ou si les vérifications du système de fichiers natif échouent, le démarrage privilégie DynBlk lorsque son utilitaire est disponible et que Secure Boot l’autorise ; sinon, il utilise DynFileFS. Un échec d’activation ne convertit pas silencieusement une session existante. La taille par défaut d’un nouveau conteneur Raw est de 4000 Mio. Les nouvelles sessions de démarrage DynFileFS, DynBlk et VMDK utilisent jusqu’à 16 Gio sans `perchsize` ; si l’espace disponible sur le support, après déduction de la réserve de sécurité, est inférieur, la taille automatique est réduite. DynFileFS tient également compte de la surcharge liée à son index et de la limite RAM. L’agrandissement explicite de DynBlk respecte la limite du backend installé, que vous pouvez interroger avec `dynblk limits --format dynblk`. Avec Secure Boot, l’initrd ne propose pas DynBlk/VMDK et considère les sessions DynBlk/VMDK explicitement demandées ou reprises comme indisponibles, au lieu de tenter de charger le module non signé.
Les sessions SquashFS peuvent être capturées depuis le système en cours d’exécution avec le Gestionnaire de sessions MiniOS ou `minios-session create squashfs`. La configuration de l’initrd crée uniquement les métadonnées de session de génération zéro et conserve la couche supérieure inscriptible dans RAM. Le système en cours d’exécution crée le premier instantané `changes.sb` à la demande ou à l’arrêt.

Lors de la reprise, MiniOS vérifie la version enregistrée, l’édition, le système de fichiers union et le mode. La valeur littérale `perchdir=resume` permet de créer une nouvelle session au lieu d’utiliser une session par défaut absente ou incompatible. Les valeurs `perch`, la sélection numérique directe et les autres requêtes de reprise héritées ne créent pas automatiquement cette session de remplacement.
La sélection interactive affiche un avertissement avant d’autoriser une session incompatible. Si la sélection ou l’activation échoue malgré tout, le démarrage se poursuit normalement avec une couche supérieure RAM et un avertissement de persistance.

Le stockage des sessions se présente comme suit :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et actif, ainsi que le mode, la version, l’édition, le système de fichiers union, la taille, l’état et les paramètres propres à chaque session.
Il s’agit de métadonnées persistantes validées par l’implémentation du démarrage, qui ne prouvent pas à elles seules l’état actuel de l’exécution. Ne les modifiez pas et ne déplacez pas les données d’une session numérotée tant qu’une session est montée ; utilisez le Gestionnaire de sessions MiniOS ou `minios-session`.

## Sessions actives et en cours d’exécution

Ces termes décrivent des états différents :

- La session **active** est celle sélectionnée par défaut au prochain démarrage.
- En théorie, la session **en cours d’exécution** est celle dont la couche inscriptible assure effectivement la persistance du démarrage en cours.

Le champ persistant `running=` enregistre cette relation prévue. Un plantage, un échec de création du système de fichiers union, la copie du stockage ou une interruption de l’arrêt peuvent rendre cette valeur obsolète, même si le démarrage en cours utilise RAM ou une autre session. Les opérations telles que l’enregistrement SquashFS nécessitent donc l’état protégé du démarrage en cours, associé à son ID de démarrage et fourni par l’initrd, ainsi qu’une couche supérieure montée et vérifiée ; elles ne se fient pas uniquement à `running=` seul. Voir [État actif, en cours d’exécution et du démarrage en cours](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

L’activation d’une session modifie le prochain démarrage, sans changer le système de fichiers union du démarrage en cours :

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La session active ne peut pas être supprimée ni convertie sur place. En règle générale, une session en cours d’exécution ne peut être ni supprimée, ni exportée, ni copiée, ni redimensionnée, ni convertie. Le nettoyage protège également les deux identifiants.

<a id="command-reference"></a>

## Référence des commandes

Lister les sessions et examiner le magasin :

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
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sans mode, le mode natif est sélectionné. La création de SquashFS capture les modifications actives actuelles et n’a pas de taille fixe. Par défaut, sa stratégie d’arrêt est `shutdown` ; l’enregistrement périodique est désactivé par défaut.

Enregistrer une session SquashFS en cours d’exécution, ou une session de persistance prise en charge que le démarrage actuel a copiée dans RAM :

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Pour SquashFS, `save` reconstruit l’instantané actuel. Pour une session Raw reposant sur RAM, DynFileFS, DynBlk, VMDK ou SquashFS, il réécrit la copie RAM dans le magasin de persistance d’origine. `--as-new` conserve la session d’origine stockée et publie plutôt l’état RAM sous un nouveau numéro de session. Le support d’origine doit toujours être présent, accessible en écriture et correspondre à l’identité du système de fichiers enregistrée au démarrage.

Configurer séparément l’enregistrement automatique de SquashFS :

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Les intervalles périodiques valides sont `30`, `60`, `120`, `240`, et `480` minutes ; `0` désactive l’enregistrement périodique. Les paramètres d’arrêt et de périodicité sont indépendants.

Exporter et importer des archives `.tar.zst` :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Seules les archives `.tar.zst` sont acceptées. Les chemins et les éléments des archives sont validés, et l’extraction est limitée. `--auto-convert` choisit un mode compatible avec le système de fichiers actuel. `--force-mode <mode>` sélectionne explicitement un mode disponible. L’exportation, la copie ou le clonage générique et la conversion ne sont pas pris en charge pour les sessions SquashFS ; utilisez leur procédure d’enregistrement et suivez [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) plutôt que de reconstruire ou de copier manuellement les composants internes d’une session active.

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

`copy` effectue une copie logique du système de fichiers et attribue toujours un nouvel ID de session. Cette opération peut modifier le backend, la capacité ou le chiffrement, et crée de nouvelles identités ext4 et LUKS. `clone` copie physiquement un backend détaché et préserve son en-tête LUKS, ses keyslots, son UUID LUKS et son UUID ext4. `convert` remplace la source par défaut ; utilisez `--new-session` pour conserver la source. La taille ne s’applique qu’à une cible conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge DynFileFS, DynBlk, VMDK et les sessions Raw, y compris les versions chiffrées, et nécessite une taille supérieure à la taille actuelle. Le redimensionnement de DynBlk agrandit d’abord le périphérique bloc virtuel, puis son système de fichiers ext4 ; il ne préalloue pas la nouvelle capacité virtuelle. Par défaut, le nettoyage cible les sessions datant de plus de 30 jours.

Toutes les commandes acceptent `--json`, et il est possible de sélectionner un autre magasin de sessions avec `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Réécriture dans le stockage des sessions adossées à RAM

Lorsque initrd copie une session de persistance prise en charge dans RAM avec `perchtoram`, la session en cours d’exécution n’écrit plus directement dans son backend d’origine. MiniOS identifie le stockage d’origine par UUID du système de fichiers et numéro de session, plutôt que de dépendre du nom `/dev/sdX`. Le Gestionnaire de sessions conserve cette session RAM visible même si le périphérique d’origine est temporairement détaché.

Si le stockage d’origine est présent, inscriptible et inchangé, **Enregistrer maintenant** réécrit l’état RAM dans la session d’origine. **Enregistrer dans le stockage comme nouvelle session** laisse la session source enregistrée intacte et publie l’état RAM sous la forme d’une nouvelle session numérotée. Les commandes CLI équivalentes sont `minios-session save <id>` et `minios-session save <id> --as-new`. L’enregistrement affiche la progression de la copie et peut être annulé avant la phase de publication ; une fois celle-ci lancée, la publication est effectuée de manière atomique.

Si le support d’origine est absent, en lecture seule, ne correspond plus à l’identité relevée au démarrage ou si la session d’origine a été modifiée indépendamment, la réécriture est refusée au lieu de cibler un autre périphérique par son nom. Reconnectez le support d’origine et réessayez, ou enregistrez sous une nouvelle session si la session d’origine a divergé. Les sessions de répertoires natives ne sont pas copiées par `perchtoram` : une requête RAM aboutit à la création d’un nouveau conteneur vide, sans importer les données natives. Utilisez `perchtoram=off` pour conserver cette session native. Lors de la réinitialisation d’une session native, la copie est désactivée pour ce démarrage afin de préserver les données conservées.

## Réinitialiser une session incompatible

Le menu **Choisir une session enregistrée** au démarrage permet de réinitialiser une session incompatible avant son activation. **Réinitialiser en conservant les paramètres** supprime les logiciels installés par le système tout en conservant les paramètres et les données du système. **Réinitialiser en conservant les données** réinitialise également la configuration système standard. Les deux options préservent `/home` et `/root`, notamment les paramètres personnels et les applications installées dans le répertoire personnel, les comptes, les mots de passe et les clés. Les fichiers installés manuellement ailleurs et non répertoriés peuvent également être conservés ; il ne s’agit pas d’une suppression complète des logiciels.

La réinitialisation nécessite suffisamment d’espace libre pour créer une deuxième copie des données conservées. En cas d’échec ou d’interruption du remplacement du répertoire, celui-ci est annulé ou récupéré au prochain montage. La reprise automatique ne réinitialise jamais une session sans avertissement. Pour SquashFS, la réinitialisation ne concerne que la couche RAM restaurée, jusqu’à ce qu’un enregistrement réussi publie le nouvel instantané et ses informations de compatibilité. Sauvegardez les données importantes avant la réinitialisation ; consultez [Fonctionnement interne de la persistance](/reference/boot-process/Persistence-Internals).

## Comportement d’enregistrement de SquashFS

Une session SquashFS est décompressée dans RAM pour fournir la couche inscriptible en cours d’exécution. L’enregistrement reconstruit et valide un instantané exact, puis remplace atomiquement `changes.sb`.
Aucune génération de restauration n’est conservée. L’action Enregistrer maintenant est disponible depuis l’icône de la barre d’état système, le Gestionnaire de sessions MiniOS ou `minios-session save` quelle que soit la stratégie automatique.

À chaque enregistrement, MiniOS copie une vue stable de l’arborescence modifiée dans un stockage privé RAM lorsque la mémoire le permet. La compression écrit **une** image dans un répertoire privé de la session numérotée. Ce n’est qu’après vérification du contenu du système de fichiers, de l’empreinte, de l’identité et de la synchronisation durable que le processus d’enregistrement remplace `changes.sb`. Il n’existe pas de deuxième image compressée complète dans RAM, ni de seconde écriture de cette image sur le périphérique de persistance. Si la mémoire RAM est insuffisante pour l’arborescence, seule cette arborescence de travail est écrite sur disque ; l’image compressée candidate nécessite toujours une seule écriture. Consultez [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour connaître les stratégies d’écriture du cache et des journaux.

Les diagnostics de démarrage d’une session durable SquashFS sont stockés dans ses répertoires `boot-logs/minios/` et `boot-logs/live/`. Ils ne dépendent pas de la réussite de l’instantané d’arrêt et restent disponibles même si les dernières modifications apportées à la couche supérieure RAM n’ont pas pu être enregistrées. Le stockage sous-jacent doit rester inscriptible ; les fichiers journaux ordinaires peuvent toutefois être temporaires si `LIVE_LOG_STORAGE=volatile` est sélectionné.

L’enregistrement à l’arrêt est assuré par le déclencheur d’arrêt principal MiniOS et le backend `minios-squashfs-save`, il ne dépend donc pas de l’ouverture ou de l’installation du Gestionnaire de sessions MiniOS. L’enregistrement périodique est vérifié toutes les 30 minutes par un minuteur systemd ou un processus SysV ; tous deux font appel au même backend d’enregistrement automatique. La reconstruction de l’instantané consomme du processeur et écrit l’instantané complet ; des intervalles d’une heure ou plus sont recommandés.

Lors d’une opération RAM-adossée à SquashFS, un nouvel instantané SquashFS capturé et activé peut prendre en charge la cible d’enregistrement en cours. Après ce transfert, l’ancien instantané actif peut être supprimé sans redémarrer :

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Cette exception ne s’applique qu’à un transfert SquashFS valide lors du démarrage actuel. Les autres modes de persistance actifs restent protégés contre la suppression.

## Chiffrement

LUKS2 est une couche de chiffrement facultative appliquée au stockage de session Raw, DynFileFS, DynBlk ou VMDK ; ce n’est pas un mode de session distinct. Elle est disponible uniquement lorsque `/run/initramfs/etc/minios-initramfs-crypt` contient `luks-layer-v1` et que les outils et fonctionnalités du backend sélectionné sont disponibles. La compression du backend DynBlk est désactivée lorsque LUKS2 est sélectionné.

La création interactive d’un volume LUKS demande deux fois la phrase de passe. Les opérations qui lisent ou créent des données LUKS peuvent la lire depuis l’entrée standard avec `--password-stdin`. Les phrases de passe ne sont pas incluses dans les arguments de commande ni dans les métadonnées de session. Au démarrage, l’initrd demande la phrase de passe dans la console. Après trois tentatives refusées, le démarrage s’arrête avec une erreur fatale ; MiniOS ne poursuit pas avec des données en clair, RAM, un autre backend ou une session de remplacement pour la même requête.

Pour une session Raw, DynFileFS, DynBlk ou VMDK chiffrée, inactive et détachée, le Gestionnaire de sessions propose **Modifier la phrase de passe...**. L’équivalent en ligne de commande est :

```bash
sudo minios-session change-passphrase <id>
```

La commande demande la phrase de passe actuelle, la nouvelle phrase de passe, puis sa confirmation. Avec `--password-stdin`, saisissez ces trois lignes dans cet ordre. Le keyslot sélectionné est remplacé sans reformater ni rechiffrer tous les fichiers. Les sessions actives, en cours d’exécution ou montées doivent d’abord être détachées ; les keyslots LUKS supplémentaires gérés en dehors du Gestionnaire de sessions ne sont pas modifiés.

Les exports chiffrés contiennent les fichiers logiques de session déchiffrés, et non le backend chiffré. L’importation, la copie ou la conversion vers LUKS crée un nouveau backend chiffré avec de nouvelles identités.

## Monter une session inactive

Le Gestionnaire de sessions peut monter en lecture-écriture une session Raw, DynFileFS, DynBlk ou VMDK inactive et à l’arrêt, sans en faire la session de démarrage par défaut. Faites un clic droit sur la session et choisissez **Monter la session** ; les sessions chiffrées demandent leur phrase de passe LUKS. Plusieurs sessions ayant des ID différents peuvent être montées simultanément. **Ouvrir le dossier monté** ouvre le système de fichiers connecté, tandis que **Ouvrir le dossier de la session** ouvre le répertoire numéroté contenant ses fichiers de stockage.

Fermer le Gestionnaire de sessions ne démonte pas une session montée par l’interface graphique. Rouvrez l’application pour la voir, puis choisissez **Démonter la session**. Si le démontage ne peut pas aboutir, MiniOS laisse le démon de stockage, le périphérique loop ou le périphérique DynBlk connecté, au lieu de déconnecter le stockage sous un système de fichiers encore utilisé.

La CLI autonome maintient le montage tant que son entrée standard reste ouverte ou jusqu’à la réception de Ctrl+C :

```bash
sudo minios-session mount <id>
```

La commande refuse de monter la session active ou en cours d’exécution et ne formate jamais un système de fichiers existant en cas d’échec du montage.

## Sauvegardes et sessions ayant échoué

Pour les sessions natives, DynFileFS, DynBlk, VMDK et Raw, y compris les sessions chiffrées, utilisez `export` pour effectuer des sauvegardes logiques plutôt que de copier le répertoire d’une session montée. Conservez l’archive obtenue sur un autre appareil et vérifiez qu’elle peut être importée avant de vous y fier. L’importation crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à être utilisée.
Pour SquashFS et les procédures de sauvegarde de périphériques entiers, consultez [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si une session échoue après saturation du stockage, interruption d’une écriture ou création répétée de sessions vides, cessez toute modification du stockage concerné. Si possible, exportez d’abord une session lisible qui n’est pas en cours d’exécution, puis suivez les instructions de [Dépannage](/maintenance-and-recovery/Troubleshooting).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant leur activation en écriture. En cas d’échec grave de la vérification du système de fichiers, le conteneur est préservé pour permettre sa récupération plutôt que monté en écriture. SquashFS détecte un état précédent incorrect et restaure le dernier instantané enregistré avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions MiniOS ou `minios-session delete` ; ne supprimez pas manuellement les répertoires de session.

## Récupérer l’espace inutilisé des stockages DynFileFS, DynBlk et VMDK

Dans le Gestionnaire de sessions, faites un clic droit sur une session DynFileFS, DynBlk ou VMDK, puis choisissez **Libérer de l’espace...**. La boîte de dialogue fonctionne avec les sessions prises en charge, qu’elles soient en cours d’exécution ou inactives, et réutilise également une session déjà montée via le Gestionnaire de sessions. Pour une session en clair, MiniOS exécute FITRIM sur le système de fichiers ext4 interne réel, puis demande au backend propriétaire de libérer l’espace de stockage qu’il sait inutilisé. Les sessions détachées sont temporairement attachées et ne sont libérées qu’après le démontage propre de leur système de fichiers.

La récupération d’espace DynFileFS nécessite DynFileFS 4.6.0 ou version ultérieure. Si le paquet a été mis à niveau alors qu’un ancien démon DynFileFS était encore actif, redémarrez sur le backend mis à jour avant de récupérer l’espace de cette session en cours d’exécution.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La case à cocher de compactage est **désactivée par défaut**, y compris sur exFAT. Il n’existe pas de
compactage automatique en solution de repli. Les sessions chiffrées ne récupèrent que l’espace déjà
connu du backend ; cette opération n’active pas discard via LUKS et ne
révèle pas son schéma d’allocation. Les erreurs de périphérique et les échecs de trim interrompent l’opération.

### Commandes de bas niveau du pilote

Avec le backend VMDK natif ou fractionné actuel DynBlk, la suppression de grains entiers
permet de réutiliser leur emplacement. Sur un système de fichiers ext4, les plages libérées
peuvent aussi être automatiquement libérées par découpage. Sur exFAT, le nettoyage automatique tronque uniquement
les fins de fichiers entièrement libres. **Le nettoyage automatique ne déplace jamais les données encore utilisées.**

Utilisez `fstrim` sur le système de fichiers interne des modifications monté (et non sur la racine combinée AUFS/OverlayFS
root) pour signaler les blocs supprimés, puis `dynblk reclaim /dev/dynblkN --execute` pour
un nettoyage sans déplacement. Sélectionnez le périphérique de la session réelle, et non un index supposé.
Pour demander manuellement un compactage sur place intensif en écritures, ajoutez `--compact`.
Cette opération fonctionne sans convertir l’image ni modifier la taille du système de fichiers virtuel ;
d’autres lectures/écritures peuvent avoir lieu entre les étapes de récupération d’espace. Ce n’est pas une solution de repli automatique.
L’option `--scan-zeroes` lit les grains mappés et n’est pas activée par défaut.

Ces commandes sont également disponibles dans l’interface CLI initrd DynBlk reconstruite. Aucun compactage automatique au
démarrage n’est activé. Les sessions chiffrées conservent leur politique de discard
existante ; les outils n’activent pas discrètement le passthrough du discard dm-crypt.
Les pièces jointes en lecture seule ou `cache=unsafe` ne peuvent pas être récupérées. Les plages découpées signalées
et les longueurs tronquées ne correspondent pas à l’espace libre mesuré du système de fichiers.

## Flux de travail des sessions VMDK

VMDK est un mode de session distinct, et non un nouveau codec de compression. La création, l’activation,
le redimensionnement, l’exportation/importation, la copie, le clonage et la conversion utilisent les mêmes commandes du Session Manager
que les autres modes de conteneur :

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Les archives de session contiennent des fichiers logiques et des métadonnées, pas une pièce jointe VMDK externe arbitraire.
Les sessions VMDK gérées utilisent le descripteur `volume.vmdk` canonique
et tous ses fichiers `volume-sNNN.vmdk` associés. Ne renommez pas les parties et ne copiez pas une image en cours d’utilisation
derrière le pilote. Le passage du format natif DynBlk au VMDK nécessite une copie/conversion explicite ; modifier
 manuellement`session_mode` ne constitue pas une conversion.

L’installateur propose VMDK uniquement si l’environnement d’exécution le prend en charge et rejette les images source
dont les initrd copiés ne disposent pas de la capacité `vmdk-session-v1`. Mettez à jour l’interface CLI,
le pilote, les outils de session et les scripts de démarrage ensemble avant de créer des sessions VMDK.
