---
updated: 2026-09-26
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
| `native` | Modifications enregistrées directement dans le répertoire de session | Nécessite un système de fichiers inscriptible qui préserve les métadonnées Linux et les opérations recherchées par MiniOS. La capacité dépend de l’espace libre disponible en arrière-plan ; `perchsize` n’est pas applicable. | Non |
| `dynfilefs` | ext4 extensible `virtual.dat` basé sur des fichiers segments format-400 | Fonctionne sur les systèmes de fichiers POSIX inscriptibles, FAT32, NTFS et exFAT. La charge utile est légère, mais l’index de mappage évolue selon la capacité logique déclarée. | Oui |
| `dynblk` | Système de fichiers ext4 fin sur un périphérique bloc du noyau basé sur `volumeNNN.db` fichiers | Nécessite le CLI DynBlk, le module noyau et la capacité initrd. La taille créée au démarrage est de 16 Gio par défaut ; le maximum est indiqué par `dynblk limits`. Les mappages résidents sur disque utilisent un cache de métadonnées limité. | Oui |
| `vmdk` | Système de fichiers ext4 fin sur un VMDK standard sparse fractionné, exposé par le pilote DynBlk | Utilise `volume.vmdk` et `volume-sNNN.vmdk`. Pas de compression. Nécessite `vmdk-session-v1` dans le marqueur de capacité initrd actif. Même valeur manuelle par défaut de 16 Gio que DynBlk ; interroger `dynblk limits --format vmdk` pour les limites. | Oui |
| `raw` | Fichier unique `changes.img` contenant ext4 | Capacité logique fixe avec croissance explicite uniquement. Fonctionne sur les systèmes de fichiers POSIX inscriptibles, FAT32, NTFS et exFAT ; FAT32 est limité à 4000 Mio. | Oui |
| `squashfs` | Instantané compressé dans `changes.sb` ; la couche supérieure inscriptible à l’exécution est reconstruite dans RAM | `perchsize` n’est pas applicable. Les instantanés existants peuvent être restaurés depuis un support inscriptible pris en charge ; la sauvegarde exacte nécessite un stockage persistant compatible POSIX. | Non |

Raw, DynFileFS, DynBlk et VMDK peuvent éventuellement intégrer une couche de chiffrement LUKS2. Le backend de stockage reste le mode de session, et les métadonnées de session enregistrent le chiffrement séparément. DynFileFS et raw créés avec `minios-session` sont à 4000 Mio par défaut ; DynBlk et VMDK sont à 16 Gio par défaut. Les tailles sont allouées en Mio ; `GB` et `TB` les suffixes convertissent en 1000 et 1 000 000 Mio. Raw est limité à 4000 Mio sur FAT32, chiffré ou non. Les données de charge utile DynFileFS grandissent à la demande, mais son index format-400 est dimensionné pour la capacité logique totale et coûte environ 2 Mio de RAM plus environ 2 Mio de stockage par Gio. DynBlk conserve les tables de mappage sur disque et un cache de métadonnées limité dans RAM, par défaut à 1 Mio plutôt qu’un pourcentage de RAM. Ses vecteurs d’étendue/fichiers et répertoires évoluent avec les parties déclarées, tandis que le remplissage de la charge utile ne nécessite pas de carte résidente complète. Interrogez la limite de capacité installée avec `dynblk limits --format dynblk`. Les écritures réelles restent limitées par l’espace libre du système de fichiers sous-jacent et l’admission des ressources du backend. Les opérations de redimensionnement de conteneur ne peuvent qu’augmenter une session ; la réduction n’est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas représenter les métadonnées Linux.
Utilisez DynBlk si vous souhaitez un vrai périphérique bloc noyau avec des fichiers de backing fins ; le pilote peut garder plusieurs volumes DynBlk indépendants attachés simultanément, et le Gestionnaire de sessions utilise le chemin du périphérique retourné par le pilote plutôt que de supposer que `/dev/dynblk0` est libre. DynBlk et VMDK sont indisponibles lorsque le Secure Boot UEFI est activé car MiniOS ne signe pas le module noyau externe DynBlk. L’installateur et le Gestionnaire de sessions masquent donc ces modes et refusent les créations explicites avant toute tentative de chargement du module.
Utilisez raw si une allocation fixe est requise, ajoutez LUKS2 si la session doit être chiffrée, et SquashFS pour un instantané compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers de persistance réel et les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L’initrd peut lire et activer un instantané SquashFS existant stocké sur FAT, exFAT ou NTFS inscriptible car il extrait l’instantané dans une couche supérieure ext4 temporaire. Créer ou sauvegarder exactement un instantané est différent : le stockage persistant doit prendre en charge les métadonnées POSIX requises et la publication privée et durable. L’arborescence de travail en capture exacte utilise le RAM de confiance si disponible, sinon un espace de travail disque si RAM est insuffisant.

## Sélection de démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement des entrées pour reprendre, créer une nouvelle session, sélectionner ou démarrer sans persistance. La description de référence des comportements de sélection, compatibilité, repli et activation se trouve dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Paramètre | Signification |
|-----------|---------|
| `perch` | Utilise le chemin de reprise hérité au mieux. Il tente la valeur par défaut des métadonnées mais ne crée pas de remplacement si aucune n’est utilisable. |
| `perchdir=resume` | Reprend la valeur par défaut des métadonnées et, si elle est absente ou incompatible, permet à l’initrd de créer un nouveau remplacement compatible. Il s’agit du comportement actuel de reprise dans le menu de démarrage. |
| `perchdir=new` | Alloue une nouvelle session numérotée. |
| `perchdir=ask` | Sélectionne une session existante ou en crée une lors du démarrage. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, y compris `/dev/...` et `label:...` les formes gérées par l’initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. |
| `perchencrypt=luks` | Chiffre une session Raw, DynFileFS, DynBlk ou VMDK nouvellement créée avec LUKS2. Les sessions existantes héritent du chiffrement uniquement via les métadonnées. |
| `perchcomp=<codec>` | Sélectionne la compression backend DynBlk pour une nouvelle session DynBlk. La compression est forcée à `none` lorsque DynBlk est encapsulé dans LUKS2. |
| `perchsize=<size>` | Définit une taille de conteneur nouvelle ou supérieure ; les valeurs simples sont allouées en Mio et les suffixes `MB`, `GB`, et `TB` sont acceptés. |

Si aucun mode n’est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32/NTFS/exFAT, la création native bascule vers DynFileFS. Un nouveau conteneur raw est à 4000 Mio par défaut. Les nouvelles sessions de démarrage DynFileFS, DynBlk et VMDK sans `perchsize` utilisent jusqu’à 16 Gio ; si l’espace restant après la réserve de sécurité est inférieur, la taille automatique est réduite. DynFileFS prend aussi en compte la surcharge de son index et la limite RAM. L’extension explicite DynBlk suit la limite du backend installé, à vérifier avec `dynblk limits --format dynblk`. En mode Secure Boot, l’initrd ne propose pas DynBlk/VMDK et considère une session DynBlk/VMDK explicite ou reprise comme indisponible au lieu de tenter de charger le module non signé.
Les sessions SquashFS peuvent être capturées depuis le système en cours d’exécution avec le Gestionnaire de sessions MiniOS ou `minios-session create squashfs`. L’initialisation initrd ne crée que les métadonnées de session de génération zéro et garde la couche supérieure inscriptible dans RAM. Le système en cours crée le premier `changes.sb` instantané à la demande ou à l’arrêt.

Lors de la reprise, MiniOS vérifie la version, l’édition, le système de fichiers union et le mode enregistrés. L’option littérale `perchdir=resume` peut créer une nouvelle session au lieu d’utiliser une valeur par défaut absente ou incompatible. Les sélections numériques directes et autres demandes de reprise héritées ne créent pas automatiquement ce remplacement.`perch`, la sélection numérique directe et d’autres requêtes de reprise héritées ne créent pas automatiquement ce remplacement.
La sélection interactive affiche un avertissement avant d’autoriser une session incompatible. Si la sélection ou l’activation échoue encore, le démarrage continue normalement avec une couche supérieure RAM et un avertissement de persistance.

Le magasin de sessions a la forme suivante :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l’édition, le système de fichiers union, la taille, l’état et les paramètres spécifiques à chaque session.
Il s’agit de métadonnées persistantes validées par le mécanisme de démarrage, qui ne prouvent pas à elles seules l’état d’exécution actuel. Ne modifiez pas ou ne déplacez pas les données de session numérotées pendant qu’une session est montée ; utilisez le Gestionnaire de sessions MiniOS ou `minios-session`.

## Sessions actives et en cours d’exécution

Ces termes décrivent des états différents :

- La session **active** est celle sélectionnée par défaut pour le prochain démarrage.
- Conceptuellement, la session **en cours** est celle dont la couche inscriptible fournit effectivement la persistance au démarrage actuel.

Le champ persistant `running=` enregistre cette relation prévue. Un crash, une construction de l’union échouée, une copie du magasin ou un arrêt interrompu peuvent le rendre obsolète même si le démarrage actuel utilise RAM ou une autre session. Les opérations telles que la sauvegarde SquashFS nécessitent donc l’état protégé de l’initrd lié à l’ID de démarrage et le upper monté vérifié ; elles ne se fient pas à `running=` seul. Voir [État actif, en cours et du démarrage actuel](/reference/boot-process/Persistence-Internals#état-actif-en-cours-dexécution-et-démarrage-actuel).

L’activation d’une session modifie le prochain démarrage mais ne change pas le système de fichiers union en cours :

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La session active ne peut pas être supprimée ou convertie sur place. Une session en cours ne peut normalement pas être supprimée, exportée, copiée, redimensionnée ou convertie. Le nettoyage protège également les deux identifiants.

## Référence des commandes

Lister les sessions et inspecter le magasin :

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

`create` sans mode sélectionne le mode natif. La création SquashFS capture les modifications en cours et n’a pas de taille fixe. Sa politique d’arrêt est par défaut à `shutdown` ; la sauvegarde périodique est désactivée par défaut.

Sauvegarder et configurer une session SquashFS :

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Les intervalles périodiques valides sont `30`, `60`, `120`, `240`, et `480` minutes ; `0` désactive la sauvegarde périodique. Les réglages arrêt et périodique sont indépendants.

Exporter et importer des `.tar.zst` archives :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Seuls les `.tar.zst` imports sont acceptés. Les chemins et membres d’archive sont validés, et l’extraction est limitée. `--auto-convert` choisit un mode compatible pour le système de fichiers actuel. `--force-mode <mode>` sélectionne explicitement un mode disponible. L’export, la copie et la conversion ne sont pas pris en charge pour les sessions SquashFS ; sauvegardez l’instantané et copiez le répertoire de session inactif complet à la place.

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

`copy` est une copie logique du système de fichiers et attribue toujours un nouvel identifiant de session. Il peut modifier le backend, la capacité ou le chiffrement et crée de nouveaux identifiants ext4 et LUKS. `clone` copie physiquement un backend détaché et préserve son en-tête LUKS, ses keyslots, UUID LUKS et UUID ext4. `convert` remplace la source par défaut ; utilisez `--new-session` pour préserver la source. Une taille n’est pertinente que pour une cible conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge DynFileFS, DynBlk, VMDK et les sessions raw, y compris les formes chiffrées, et nécessite une taille supérieure à la taille actuelle. Le redimensionnement DynBlk agrandit d’abord le périphérique bloc virtuel puis étend son système de fichiers ext4 ; il ne pré-alloue pas la nouvelle capacité virtuelle. Le nettoyage concerne par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre magasin de sessions peut être sélectionné avec `--sessions-dir PATH` :

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportement de sauvegarde SquashFS

Une session SquashFS est extraite dans RAM pour la couche inscriptible active. La sauvegarde reconstruit et valide un instantané exact, puis remplace atomiquement `changes.sb`.
Aucune génération de restauration n’est conservée. Sauvegarder maintenant est accessible depuis l’icône de la zone de notification, le Gestionnaire de sessions MiniOS ou `minios-session save` quelle que soit la politique automatique.

À chaque sauvegarde, MiniOS copie une vue stable de l’arborescence modifiée dans le stockage privé RAM si la mémoire le permet. La compression écrit **une** image dans un répertoire privé de la session numérotée. Ce n’est qu’après avoir vérifié le contenu du système de fichiers, l’empreinte, l’identité et la synchronisation durable que le sauvegardeur remplace `changes.sb`. Il n’y a pas de seconde image compressée complète dans RAM ni de second enregistrement de cette image sur le périphérique de persistance. Si la mémoire RAM est insuffisante pour l’arborescence, seule cette arborescence de travail bascule sur disque ; le candidat compressé nécessite toujours une écriture. Voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour les politiques de cache et d’écriture des journaux.

Les diagnostics de démarrage pour une session durable SquashFS sont stockés sous ses `boot-logs/minios/` et `boot-logs/live/` répertoires. Ils ne dépendent pas d’un instantané d’arrêt réussi et restent disponibles même si les dernières modifications de la couche supérieure RAM n’ont pas pu être sauvegardées. Le support de stockage doit rester inscriptible ; les fichiers journaux ordinaires peuvent être temporaires si `LIVE_LOG_STORAGE=volatile` est sélectionné.

La sauvegarde à l’arrêt est assurée par le déclencheur d’arrêt principal MiniOS et le backend `minios-squashfs-save`, elle ne dépend donc pas de l’ouverture ou de l’installation du Gestionnaire de sessions MiniOS. La sauvegarde périodique est vérifiée toutes les 30 minutes par un minuteur systemd ou un worker SysV, qui appellent tous deux le même backend d’enregistrement automatique. La reconstruction de l’instantané consomme du CPU et écrit l’instantané complet ; il est recommandé d’espacer les intervalles d’une heure ou plus.

Pendant le fonctionnement basé sur RAM-backed SquashFS, un nouvel instantané capturé et activé SquashFS peut prendre la main sur la cible de sauvegarde en cours d’utilisation. Après ce transfert, l’ancien instantané actif peut être supprimé sans redémarrage :

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Cette exception ne s’applique qu’à un transfert valide du SquashFS du démarrage en cours. Les autres modes de persistance actifs restent protégés contre la suppression.

## Chiffrement

LUKS2 est une couche optionnelle au-dessus de Raw `changes.img`, DynFileFS `virtual.dat`, ou du périphérique DynBlk direct. Cette option n'est disponible que si `/run/initramfs/etc/minios-initramfs-crypt` contient `luks-layer-v1` et que les outils et fonctionnalités du backend sélectionné sont disponibles.

La création interactive d’un volume LUKS demande la saisie de la phrase de passe à deux reprises. Les opérations qui lisent ou créent des données LUKS peuvent recevoir la phrase de passe depuis l’entrée standard avec `--password-stdin`.
Les phrases de passe ne sont jamais placées dans les arguments de commande ni dans les métadonnées de session. Au démarrage, l’initrd demande la phrase de passe sur la console. Trois tentatives refusées interrompent le démarrage de façon fatale ; MiniOS ne poursuit pas en clair, RAM, avec un autre backend ou une session de remplacement pour la même requête.

Les exports chiffrés contiennent les fichiers de session logique déchiffrés, et non le backend chiffré. L’importation, la copie ou la conversion vers LUKS créent un nouveau backend chiffré avec de nouvelles identités.

## Sauvegardes et sessions échouées

Pour les sessions natives, DynFileFS, DynBlk, VMDK et raw, y compris les formes chiffrées, utilisez `export` pour les sauvegardes logiques plutôt que de copier un répertoire de session monté. Conservez l’archive obtenue sur un autre périphérique et vérifiez qu’elle peut être importée avant de s’y fier. L’import crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à l’emploi.
Pour les procédures de sauvegarde SquashFS et de périphérique entier, voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si une session échoue après un remplissage du stockage, une écriture interrompue ou la création répétée de sessions vides, arrêtez de modifier le stockage concerné. Exportez d’abord une session lisible non active si possible, puis consultez [Dépannage](/maintenance-and-recovery/Troubleshooting).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant l’activation en écriture. Les échecs graves de vérification de système de fichiers préservent le conteneur pour récupération au lieu de le monter en écriture. SquashFS détecte un état précédent non propre et restaure le dernier instantané sauvegardé avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions MiniOS ou `minios-session delete` ; ne supprimez pas manuellement les répertoires de session.

## Restituer l’espace inutilisé de DynBlk et du stockage VMDK

Dans le Gestionnaire de sessions, faites un clic droit sur une session DynBlk ou VMDK et choisissez **Libérer l’espace...**.
La boîte de dialogue fonctionne aussi bien pour la session en cours que pour une session inactive. Pour une
session en texte brut, elle optimise l’ext4 interne avant de demander au pilote de récupérer de l’
espace. Une session inactive est temporairement attachée puis déconnectée ; le
périphérique de la session en cours reste connecté.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

La case à cocher de compactage est **désactivée par défaut**, y compris sur exFAT. Il n’y a pas de
repli automatique de compactage. Les sessions chiffrées ne récupèrent que l’espace déjà
connu du pilote ; cette opération n’active pas le discard via LUKS ni ne
révèle son schéma d’allocation. Les erreurs de périphérique et les échecs de trim interrompent l’opération.

### Commandes bas niveau du pilote

Avec le backend natif ou VMDK fractionné actuel DynBlk, la suppression (discard) de grains complets
rend leur emplacement réutilisable. Sur un système de fichiers ext4 sous-jacent, les plages libérées
peuvent aussi être automatiquement « trouées » (hole-punch). Sur exFAT, le nettoyage automatique ne tronque que
les fins de fichiers entièrement libres. **Le nettoyage automatique ne déplace jamais de données actives.**

Utilisez `fstrim` sur le système de fichiers interne monté (et non sur la racine combinée AUFS/OverlayFS
root) pour signaler les blocs supprimés, puis `dynblk reclaim /dev/dynblkN --execute` pour
le nettoyage non destructif. Sélectionnez le véritable périphérique de session, et non un index supposé.
Pour demander manuellement une compaction en place intensive en écritures, ajoutez `--compact`.
Cela fonctionne sans convertir l’image ni modifier la taille du système de fichiers virtuel ;
d’autres lectures/écritures peuvent s’effectuer entre les étapes de récupération. Il ne s’agit pas d’un repli automatique.
L’option `--scan-zeroes` lit les grains mappés et n’est pas activée par défaut.

Ces commandes sont aussi disponibles dans le CLI DynBlk de l’initrd reconstruit. Aucun compactage
au démarrage n’est activé automatiquement. Les sessions chiffrées conservent leur politique de discard existante ;
les outils n’activent pas silencieusement le discard dm-crypt.
Les pièces jointes en lecture seule ou `cache=unsafe`ne peuvent pas être récupérées. Les plages « trouées » signalées et les longueurs tronquées ne correspondent pas à l’espace libre mesuré du système de fichiers.
.

## Flux de travail des sessions VMDK

VMDK est un mode de session distinct, pas un nouveau codec de compression. La création, l’activation,
le redimensionnement, l’export/import, la copie, le clonage et la conversion utilisent les mêmes commandes du Gestionnaire de sessions
que pour les autres modes de conteneur :

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Les archives de session contiennent des fichiers logiques et des métadonnées, et non une pièce jointe VMDK externe arbitraire.
Les sessions VMDK gérées utilisent le `volume.vmdk` descripteur
canonique et tous ses `volume-sNNN.vmdk` segments associés. Ne renommez pas les parties et ne copiez pas une image active
en dehors du pilote. Passer du mode natif DynBlk à VMDK nécessite une
copie/conversion explicite ; modifier `session_mode` à la main n’est pas une conversion.

L’installateur ne propose VMDK que si le runtime le prend en charge et rejette les images sources
dont les initrd copiés n’ont pas la `vmdk-session-v1`capacité requise. Mettez à jour le CLI,
le pilote, les outils de session et les scripts de démarrage ensemble avant de créer des sessions VMDK.
