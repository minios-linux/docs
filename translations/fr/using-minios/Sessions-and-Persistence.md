---
updated: 2026-10-06
program_commits:
    minios-session-manager: 3ec8b706ff661eb7f8f3fa5306a14f7fd7bc5cd3
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Sessions et persistance

Les sessions MiniOS conservent les modifications apportées au système en direct après redémarrage. Chaque session correspond à un répertoire numéroté sous `minios/changes/` ; les modules MiniOS en lecture seule restent inchangés et la session sélectionnée fournit la couche writable du système de fichiers union.

Utilisez le Gestionnaire de sessions MiniOS depuis un système MiniOS en cours d'exécution :

```bash
minios-session-manager
```

L'outil équivalent en ligne de commande est `minios-session`. Ses commandes de modification nécessitent des privilèges administrateur, donc les exemples ci-dessous utilisent `sudo`.

## Modes de session

| Mode | Stockage | Contraintes principales | Couche LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | Modifications stockées directement dans le répertoire de session | Nécessite un système de fichiers writable qui préserve les métadonnées Linux et les opérations détectées par MiniOS. La capacité dépend de l'espace libre restant ; `perchsize` n'est pas applicable. | Non |
| `dynfilefs` | ext4 extensible `virtual.dat`soutenu par des fichiers segments format-400 | Fonctionne sur des systèmes de fichiers writable POSIX, FAT32, NTFS et exFAT. La charge utile est légère, mais l'index de mappage évolue avec la capacité logique déclarée. | Oui |
| `dynblk` | Système de fichiers ext4 fin sur un périphérique bloc noyau soutenu par `volumeNNN.db` fichiers | Nécessite le CLI DynBlk, le module noyau et la capacité initrd. La taille créée au démarrage est de 16 Gio par défaut ; le maximum est indiqué par `dynblk limits`. Les mappages résidents sur disque utilisent un cache de métadonnées limité. | Oui |
| `vmdk` | Système de fichiers ext4 fin sur un VMDK sparse standard découpé, exposé par le pilote DynBlk | Utilise `volume.vmdk` et `volume-sNNN.vmdk`. Pas de compression. Nécessite `vmdk-session-v1` dans le marqueur de capacité initrd en cours d'exécution. Même valeur manuelle par défaut de 16 Gio que DynBlk ; consultez `dynblk limits --format vmdk` pour les limites. | Oui |
| `raw` | Fichier unique `changes.img` contenant ext4 | Capacité logique fixe avec extension explicite uniquement. Fonctionne sur POSIX writable, FAT32, NTFS et exFAT ; FAT32 est limité à 4000 Mio. | Oui |
| `squashfs` | Instantané compressé dans `changes.sb` ; la couche writable supérieure à l'exécution est reconstruite dans RAM | `perchsize` n'est pas applicable. Les instantanés existants peuvent être restaurés depuis un support writable compatible ; la sauvegarde exacte nécessite un stockage persistant POSIX adapté. | Non |

Raw, DynFileFS, DynBlk et VMDK peuvent éventuellement intégrer une couche de chiffrement LUKS2. Le backend de stockage reste le mode de session, et les métadonnées de session enregistrent le chiffrement séparément. DynFileFS et raw créés avec `minios-session` sont par défaut à 4000 Mio ; DynBlk et VMDK par défaut à 16 Gio. Les valeurs de taille sont allouées en Mio ; `GB` et `TB` les suffixes convertissent en 1000 et 1 000 000 Mio. Raw est limité à 4000 Mio sur FAT32, chiffré ou non. Les données de charge utile DynFileFS s'étendent à la demande, mais son index format-400 est dimensionné pour la capacité logique totale et coûte environ 2 Mio de RAM plus environ 2 Mio de stockage de support par Gio. DynBlk conserve les tables de mappage sur disque et un cache de métadonnées limité dans RAM, par défaut à 1 Mio au lieu d'un pourcentage de RAM. Ses vecteurs d'étendue/fichier et répertoires grandissent avec les parties déclarées, tandis que le remplissage de la charge utile ne nécessite pas une carte résidente complète. Interrogez la limite de capacité installée avec `dynblk limits --format dynblk`. Les écritures réelles restent limitées par l'espace libre du système de fichiers sous-jacent et l'admission des ressources du backend. Les opérations de redimensionnement de conteneur ne peuvent qu'augmenter la taille d'une session ; la réduction n'est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas représenter les métadonnées Linux.
Utilisez DynBlk si vous souhaitez un véritable périphérique bloc noyau avec des fichiers de support fins ; le pilote peut garder plusieurs volumes DynBlk indépendants attachés en même temps, et le Gestionnaire de sessions utilise le chemin du périphérique retourné par le pilote plutôt que de supposer que `/dev/dynblk0` est libre. DynBlk et VMDK ne sont pas disponibles lorsque le Secure Boot UEFI est activé car MiniOS ne signe pas le module noyau externe DynBlk. L'installateur et le Gestionnaire de sessions masquent donc ces modes et refusent les demandes de création explicites avant de tenter de charger le module.
Utilisez raw si une allocation fixe est requise, ajoutez LUKS2 si la session doit être chiffrée, et utilisez SquashFS pour un instantané compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers de persistance réel et les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L'initrd peut lire et activer un instantané SquashFS existant stocké sur FAT, exFAT ou NTFS writable car il extrait l'instantané dans une couche supérieure ext4 temporaire. La création ou la sauvegarde exacte d'un instantané est différente : le stockage persistant doit prendre en charge les métadonnées POSIX requises et la publication privée et durable. L'arborescence de travail de capture exacte utilise le RAM de confiance lorsque disponible, avec un repli sur espace disque si RAM est insuffisant.

## Sélection au démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement les entrées reprise, nouvelle, sélection et non persistante. La description canonique du sélecteur, de la compatibilité, du repli et des logiques d'activation se trouve dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Paramètre | Signification |
|-----------|---------|
| `perch` | Utilise le chemin de reprise legacy best-effort. Il tente la valeur par défaut des métadonnées mais ne crée pas de remplacement si aucune n'est utilisable. |
| `perchdir=resume` | Reprend la valeur par défaut des métadonnées et, si elle est absente ou incompatible, permet à l'initrd de créer un nouveau remplacement compatible. Il s'agit du comportement actuel de reprise du menu de démarrage. |
| `perchdir=setup` | Ouvre le sélecteur interactif de backend de persistance, puis alloue une nouvelle session numérotée. Il s'agit du comportement actuel de **Démarrer une nouvelle session** . |
| `perchdir=new` | Alloue directement une nouvelle session numérotée à partir du backend, du chiffrement, de la compression et des paramètres de taille demandés ou par défaut, sans ouvrir le sélecteur de backend. |
| `perchdir=ask` | Sélectionne une session existante ; si le stockage est vide, lance automatiquement le même flux de configuration que `perchdir=setup`. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, y compris `/dev/...` et `label:...` les formes gérées par l'initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. |
| `perchencrypt=luks` | Chiffre une session Raw, DynFileFS, DynBlk ou VMDK nouvellement créée avec LUKS2. Les sessions existantes héritent le chiffrement uniquement depuis les métadonnées. |
| `perchcomp=<codec>` | Sélectionne la compression backend DynBlk pour une nouvelle session DynBlk. La compression est forcée à `none` lorsque DynBlk est encapsulé dans LUKS2. |
| `perchsize=<size>` | Définit une nouvelle taille de conteneur ou une taille supérieure ; les valeurs simples sont allouées en Mio et `MB`, `GB`, et `TB` les suffixes sont acceptés. |

Si aucun mode n'est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32/NTFS/exFAT, la création native au démarrage bascule vers DynFileFS. Un nouveau conteneur raw est par défaut à 4000 Mio. Les nouvelles sessions de démarrage DynFileFS, DynBlk et VMDK sans `perchsize` utilisent jusqu'à 16 Gio ; si moins d'espace reste après la réserve de sécurité, la taille automatique est réduite. DynFileFS prend aussi en compte la surcharge de son index et la limite RAM. La croissance explicite de DynBlk suit la limite du backend installé, consultable avec `dynblk limits --format dynblk`. En mode Secure Boot, l'initrd ne propose pas DynBlk/VMDK et considère une session DynBlk/VMDK explicite ou reprise comme indisponible au lieu de tenter de charger le module non signé.
Les sessions SquashFS peuvent être capturées depuis le système en cours d'exécution avec le Gestionnaire de sessions MiniOS ou `minios-session create squashfs`. La configuration initrd ne crée que les métadonnées de session génération zéro et conserve la couche writable supérieure dans RAM. Le système en cours d'exécution crée le premier `changes.sb` instantané à la demande ou à l'arrêt.

Lors de la reprise, MiniOS vérifie la version enregistrée, l'édition, le système de fichiers union et le mode. L'option littérale `perchdir=resume` peut créer une nouvelle session au lieu d'utiliser une valeur par défaut absente ou incompatible. Les sélections numériques directes et autres requêtes de reprise legacy ne créent pas automatiquement ce remplacement.`perch`, la sélection numérique directe et d'autres demandes de reprise legacy ne créent pas automatiquement ce remplacement.
La sélection interactive affiche un avertissement avant d'autoriser une session incompatible. Si la sélection ou l'activation échoue encore, le démarrage continue normalement avec une couche supérieure RAM et un avertissement de persistance.

Le stockage des sessions a cette forme :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l'édition, le système de fichiers union, la taille, l'état et les paramètres spécifiques à chaque session.
Il s'agit de métadonnées persistantes validées par l'implémentation de démarrage, et non d'une preuve de l'état d'exécution courant. Ne modifiez pas ou ne déplacez pas les données de session numérotées lorsqu'une session est montée ; utilisez le Gestionnaire de sessions MiniOS ou `minios-session`.

## Sessions actives et en cours d'exécution

Ces termes décrivent différents états :

- La session **active** est celle sélectionnée par défaut pour le prochain démarrage.
- Conceptuellement, la session **en cours** est celle dont la couche writable fournit effectivement la persistance au démarrage actuel.

Le champ persistant `running=` enregistre cette relation prévue. Un crash, un échec de construction de l'union, une copie du stockage ou un arrêt interrompu peuvent la rendre obsolète même si le démarrage actuel utilise RAM ou une autre session. Les opérations comme la sauvegarde SquashFS nécessitent donc l'état protégé courant de l'initrd lié à l'ID de démarrage et la vérification du montage de la couche writable ; elles ne font pas confiance à `running=` seul. Voir [État actif, en cours et du démarrage actuel](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Activer une session modifie le prochain démarrage mais ne change pas le système de fichiers union courant :

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La session active ne peut pas être supprimée ou convertie sur place. Une session en cours ne peut normalement pas être supprimée, exportée, copiée, redimensionnée ou convertie. Le nettoyage protège également les deux identifiants.

## Référence des commandes

Lister les sessions et inspecter le stockage :

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

`create` sans mode sélectionne le natif. La création SquashFS capture les modifications en direct actuelles et n'a pas de taille fixe. Sa politique d'arrêt est par défaut `shutdown` ; la sauvegarde périodique est désactivée par défaut.

Sauvegarder une session SquashFS en cours, ou une session de persistance prise en charge que le démarrage actuel a copiée dans RAM :

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Pour SquashFS, `save` reconstruit l'instantané actuel. Pour une session Raw, RAM-backed, DynFileFS, DynBlk, VMDK ou SquashFS, il écrit la copie RAM dans le stockage de persistance d'origine. `--as-new` conserve la session stockée d'origine et publie l'état RAM sous un nouveau numéro de session. Le support d'origine doit toujours être présent, writable et correspondre à l'identité du système de fichiers enregistrée au démarrage.

Configurer la sauvegarde automatique SquashFS séparément :

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Les intervalles périodiques valides sont `30`, `60`, `120`, `240`, et `480` minutes ; `0` désactive la sauvegarde périodique. Les paramètres d'arrêt et périodiques sont indépendants.

Exporter et importer `.tar.zst` archives :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Seuls les imports `.tar.zst` sont acceptés. Les chemins et membres d'archive sont validés, et l'extraction est limitée. `--auto-convert` choisit un mode compatible avec le système de fichiers courant. `--force-mode <mode>` sélectionne explicitement un mode disponible. L'export, la copie/générique et la conversion ne sont pas pris en charge pour les sessions SquashFS ; utilisez son flux de sauvegarde et consultez [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) au lieu de reconstruire ou de copier manuellement les internes d'une session en cours.

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

`copy` est une copie logique du système de fichiers et attribue toujours un nouvel ID de session. Elle peut changer de backend, capacité ou chiffrement et crée de nouveaux identifiants ext4 et LUKS. `clone` copie physiquement un backend détaché et préserve son en-tête LUKS, ses keyslots, UUID LUKS et UUID ext4. `convert` remplace la source par défaut ; utilisez `--new-session` pour préserver la source. Une taille n'est pertinente que pour une cible conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge DynFileFS, DynBlk, VMDK et raw, y compris les formes chiffrées, et nécessite une taille supérieure à la taille actuelle. Le redimensionnement DynBlk agrandit d'abord le périphérique bloc virtuel puis étend son système de fichiers ext4 ; il ne préalloue pas la nouvelle capacité virtuelle. Le nettoyage cible par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre stockage de sessions peut être sélectionné avec `--sessions-dir PATH` :

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Session en écriture différée sur support RAM

Quand l'initrd copie une session de persistance prise en charge dans RAM avec `perchtoram`, la session en cours n'écrit plus directement sur son backend d'origine. MiniOS enregistre le stockage d'origine par UUID du système de fichiers et numéro de session au lieu de se baser sur un nom `/dev/sdX`. Le Gestionnaire de sessions garde cette session RAM visible même si le périphérique d'origine est temporairement détaché.

Si le stockage d'origine est présent, writable et inchangé, **Sauvegarder maintenant** écrit l'état RAM dans la session d'origine. **Sauvegarder sur le stockage comme nouvelle session** conserve la source stockée intacte et publie l'état RAM comme nouvelle session numérotée. Les équivalents CLI sont `minios-session save <id>` et `minios-session save <id> --as-new`. La sauvegarde affiche la progression de la copie et peut être annulée avant la phase de publication ; la publication elle-même est effectuée de façon atomique dès qu'elle commence.

Si le support d'origine est manquant, en lecture seule, ne correspond plus à l'identité au démarrage ou si la session d'origine a changé indépendamment, l'écriture différée est refusée plutôt que de cibler un autre périphérique par nom. Rebranchez le support d'origine et réessayez, ou utilisez la sauvegarde comme nouvelle session si la session d'origine a divergé. Les sessions répertoire natives ne sont pas copiées par l'implémentation actuelle de `perchtoram`, donc ce chemin d'écriture différée s'applique aux sessions Raw, DynFileFS, DynBlk, VMDK et SquashFS.

## Comportement de sauvegarde SquashFS

Une session SquashFS est décompressée dans RAM pour la couche writable en cours. La sauvegarde reconstruit et valide un instantané exact, puis remplace atomiquement `changes.sb`.
Aucune génération de rollback n'est conservée. Sauvegarder maintenant est disponible depuis l'icône de la barre système, le Gestionnaire de sessions MiniOS ou `minios-session save` indépendamment de la politique automatique.

À chaque sauvegarde, MiniOS copie une vue stable de l'arborescence modifiée dans le stockage privé RAM si la mémoire le permet. La compression écrit **une** image dans un répertoire privé au sein de la session numérotée. Ce n'est qu'après avoir vérifié le contenu du système de fichiers, le hash, l'identité et la synchronisation durable que le sauvegardeur remplace `changes.sb`. Il n'y a pas de seconde image compressée complète dans RAM ni de second enregistrement de cette image sur le périphérique de persistance. Si la mémoire RAM est insuffisante pour l'arbre, seul cet arbre de travail bascule sur disque ; le candidat compressé nécessite toujours une écriture. Voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour les politiques de cache et d'écriture du journal.

Les diagnostics de démarrage pour une session SquashFS durable sont stockés sous son `boot-logs/minios/` et `boot-logs/live/` répertoires. Ils ne dépendent pas d'un instantané d'arrêt réussi et restent disponibles même si les dernières modifications de la couche supérieure RAM n'ont pas pu être sauvegardées. Le stockage de support doit toujours être writable ; les fichiers journaux ordinaires peuvent être temporaires si `LIVE_LOG_STORAGE=volatile` est sélectionné.

La sauvegarde à l'arrêt est implémentée par le déclencheur d'arrêt central MiniOS et le backend `minios-squashfs-save`, elle ne dépend donc pas de l'ouverture ou de l'installation du Gestionnaire de sessions MiniOS. La sauvegarde périodique est vérifiée toutes les 30 minutes par un timer systemd ou un worker SysV, qui appellent tous deux le même backend d'autosave. La reconstruction de l'instantané consomme du CPU et écrit l'instantané complet ; des intervalles d'une heure ou plus sont recommandés.

Lors d'une opération RAM-backed SquashFS, un instantané SquashFS nouvellement capturé et activé peut prendre possession de la cible de sauvegarde en cours. Après ce transfert, l'ancien instantané en cours peut être supprimé sans redémarrer :

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Cette exception ne s'applique qu'à un transfert valide de session en cours SquashFS. Les autres modes de persistance en cours restent protégés contre la suppression.

## Chiffrement

LUKS2 est une couche de chiffrement optionnelle sur le stockage de session Raw, DynFileFS, DynBlk ou VMDK ; ce n'est pas un mode de session distinct. Elle n'est disponible que lorsque `/run/initramfs/etc/minios-initramfs-crypt` contient `luks-layer-v1` et que les outils et capacités du backend sélectionné sont disponibles. La compression backend DynBlk est désactivée lorsque LUKS2 est sélectionné.

La création interactive LUKS demande la phrase de passe deux fois. Les opérations qui lisent ou créent des données LUKS peuvent les lire depuis l'entrée standard avec `--password-stdin`. Les phrases de passe ne sont pas placées dans les arguments de commande ou les métadonnées de session. Au démarrage, l'initrd demande la phrase de passe sur la console. Trois tentatives rejetées arrêtent le démarrage de façon fatale ; MiniOS ne continue pas en clair, RAM, sur un autre backend ni sur une session de remplacement avec la même demande.

Pour une session Raw, DynFileFS, DynBlk ou VMDK chiffrée inactive et détachée, le Gestionnaire de sessions propose **Changer la phrase de passe...**. L'équivalent CLI est :

```bash
sudo minios-session change-passphrase <id>
```

Il demande la phrase de passe actuelle, la nouvelle phrase de passe et la confirmation. Avec `--password-stdin`, fournissez ces trois lignes dans cet ordre. Le keyslot sélectionné est remplacé sans reformater ni ré-encrypter tous les fichiers. Les sessions actives, en cours ou montées doivent être d'abord détachées ; les keyslots LUKS supplémentaires gérés en dehors du Gestionnaire de sessions ne sont pas modifiés.

Les exports chiffrés contiennent les fichiers logiques de session déchiffrés, pas le backend chiffré. L'import, la copie ou la conversion vers LUKS créent un nouveau backend chiffré avec de nouveaux identifiants.

## Monter une session inactive

Le Gestionnaire de sessions peut monter une session Raw, DynFileFS, DynBlk ou VMDK inactive et non en cours en lecture-écriture sans en faire la valeur par défaut au démarrage. Faites un clic droit sur la session et choisissez **Monter la session** ; les sessions chiffrées demandent leur phrase de passe LUKS. Plusieurs identifiants de session différents peuvent être montés simultanément. **Ouvrir le dossier monté** ouvre le système de fichiers attaché, tandis que **Ouvrir le dossier de la session** ouvre le répertoire numéroté contenant ses fichiers de support.

Fermer le Gestionnaire de sessions ne démonte pas un montage géré par l'interface graphique. Rouvrez l'application pour le voir et choisissez **Démonter la session**. Si le démontage est occupé, MiniOS laisse le démon backend, le périphérique loop ou le périphérique DynBlk connecté au lieu de déconnecter le stockage sous un système de fichiers actif.

Le CLI autonome garde le montage actif jusqu'à la fermeture de son entrée standard ou la réception de Ctrl+C :

```bash
sudo minios-session mount <id>
```

La commande refuse la session active ou en cours et ne formate jamais un système de fichiers existant parce que le montage a échoué.

## Sauvegardes et sessions échouées

Pour les sessions natives, DynFileFS, DynBlk, VMDK et raw, y compris les formes chiffrées, utilisez `export` pour les sauvegardes logiques plutôt que de copier un répertoire de session monté. Conservez l'archive résultante sur un autre support et vérifiez qu'elle peut être importée avant de s'y fier. L'import crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu'elle est prête à l'emploi.
Pour les procédures de sauvegarde SquashFS et de périphérique complet, voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si une session échoue après saturation du stockage, interruption d'une écriture ou création répétée de sessions vides, arrêtez de modifier le stockage concerné. Exportez d'abord une session non en cours lisible si possible, puis consultez [Dépannage](/maintenance-and-recovery/Troubleshooting).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant l'activation writable. Les échecs graves de vérification du système de fichiers préservent le conteneur pour la récupération au lieu de le monter en writable. SquashFS détecte un état précédent non propre et restaure le dernier instantané sauvegardé avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions MiniOS ou `minios-session delete` ; ne supprimez pas les répertoires de session manuellement.

## Restituer l'espace de stockage inutilisé DynFileFS, DynBlk et VMDK

Dans le Gestionnaire de sessions, faites un clic droit sur une session DynFileFS, DynBlk ou VMDK et choisissez **Libérer de l'espace...**. La boîte de dialogue fonctionne pour une session en cours ou inactive prise en charge et réutilise aussi une session déjà montée via le Gestionnaire de sessions. Pour une session en clair, MiniOS exécute FITRIM sur le système de fichiers ext4 interne réel puis demande au backend propriétaire de restituer l'espace libre connu. Les sessions détachées sont attachées temporairement et ne sont libérées qu'après démontage propre de leur système de fichiers.

La récupération DynFileFS nécessite DynFileFS 4.6.0 ou ultérieur. Si le paquet a été mis à jour alors qu'un ancien démon DynFileFS reste actif, redémarrez sur le backend mis à jour avant de récupérer cette session en cours.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

La case à cocher de compactage est **désactivée par défaut**, y compris sur exFAT. Il n'y a pas de
repli automatique de compactage. Les sessions chiffrées ne récupèrent que l'espace déjà
connu du backend ; cette opération n'active pas le discard via LUKS ni ne
révèle son schéma d'allocation. Les erreurs de périphérique et les échecs de trim arrêtent l'opération.

### Commandes bas niveau du pilote

Avec le backend natif ou VMDK découpé DynBlk actuel, le discard de grains complets
rend leur emplacement réutilisable. Sur un système de fichiers ext4 de support, les plages retirées
peuvent aussi être automatiquement "hole-punched". Sur exFAT, le nettoyage automatique ne tronque que
les fins de fichiers totalement libres. **Le nettoyage automatique ne déplace jamais de données actives.**

Utilisez `fstrim` sur le système de fichiers interne monté (pas le root combiné AUFS/OverlayFS
 ) pour rapporter les blocs supprimés, puis `dynblk reclaim /dev/dynblkN --execute` pour
le nettoyage non-déplaçant. Sélectionnez le périphérique de session réel, pas un index supposé.
Pour demander manuellement un compactage intensif en écriture sur place, ajoutez `--compact`.
Cela fonctionne sans convertir l'image ni changer la taille du système de fichiers virtuel ;
d'autres lectures/écritures peuvent avoir lieu entre les étapes de récupération. Ce n'est pas un repli automatique.
L'option `--scan-zeroes` lit les grains mappés et n'est pas activée par défaut.

Ces commandes sont aussi disponibles dans le CLI initrd reconstruit DynBlk. Aucun compactage
automatique au démarrage n'est activé. Les sessions chiffrées conservent leur politique de discard existante ; les outils n'activent pas silencieusement le discard dm-crypt.
La politique ; les outils n'activent pas silencieusement le discard dm-crypt.
Les attachements en lecture seule ou `cache=unsafe`ne peuvent pas être récupérés. Les plages "hole-punched"
et les longueurs tronquées ne correspondent pas à l'espace libre mesuré du système de fichiers.

## Workflows de session VMDK

VMDK est un mode de session distinct, pas un nouveau codec de compression. La création, l'activation,
le redimensionnement, l'export/import, la copie, le clonage et la conversion utilisent les mêmes commandes du Gestionnaire de sessions
que les autres modes de conteneur :

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Les archives de session contiennent les fichiers logiques et les métadonnées, et non une pièce jointe VMDK externe arbitraire.
Les sessions VMDK gérées utilisent le `volume.vmdk`descripteur
canonique et tous ses `volume-sNNN.vmdk`frères. Ne renommez pas les parties ni ne copiez une image active
derrière le pilote. Passer du mode natif DynBlk à VMDK nécessite une
copie/conversion explicite ; modifier `session_mode`manuellement n'est pas une conversion.

L'installateur ne propose VMDK que s'il est pris en charge par l'environnement d'exécution et rejette les images sources dont l'initrd copié ne possède pas la
capacité. Mettez à jour le CLI,`vmdk-session-v1`le pilote, les outils de session et les scripts de démarrage ensemble avant de créer des sessions VMDK.
.
