---
updated: 2026-08-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sessions et persistance

Les sessions MiniOS conservent les modifications apportées au système en direct après les redémarrages. Chaque session correspond à un répertoire numéroté sous `minios/changes/` ; les modules MiniOS restent en lecture seule et la session sélectionnée fournit la couche writable du système de fichiers union.

Utilisez le gestionnaire de sessions MiniOS depuis un système MiniOS en cours d’exécution :

```bash
minios-session-manager
```

L’outil équivalent en ligne de commande est `minios-session`. Ses commandes de modification nécessitent des privilèges administrateur, donc les exemples ci-dessous utilisent `sudo`.

## Modes de session

| Mode | Stockage | Contraintes principales |
|------|----------|------------------------|
| `native` | Modifications stockées directement dans le répertoire de session | Nécessite un système de fichiers POSIX inscriptible comme ext2/3/4, Btrfs, XFS, F2FS ou ReiserFS. |
| `dynfilefs` | Conteneur ext4 extensible découpé en fichiers de support | Fonctionne sur POSIX inscriptible, FAT32, NTFS et exFAT. Nécessite le backend DynFileFS. |
| `raw` | `changes.img` de taille fixe contenant ext4 | Fonctionne sur POSIX inscriptible, FAT32, NTFS et exFAT. |
| `luks` | `changes.luks` chiffré LUKS2 contenant ext4 | Nécessite `cryptsetup`, le support loop et le hook initrd LUKS MiniOS. |
| `squashfs` | Instantané compressé dans `changes.sb` | L’enregistrement nécessite un système de fichiers de persistance POSIX capable de préserver les liens, propriétaires, modes, xattrs, ACLs, capacités et whiteouts. |

`dynfilefs`, `raw` et `luks` créés avec `minios-session` ont une taille par défaut de 4000 Mio. Les valeurs de taille sont allouées en Mio ; les suffixes `GB` et `TB` convertissent respectivement en 1000 et 1 000 000 Mio. Le gestionnaire de sessions MiniOS limite les fichiers raw et LUKS à 4000 Mio sur FAT32. Ne considérez pas cela comme une garantie générale de l’initrd : une demande de démarrage raw surdimensionnée peut atteindre l’allocation et échouer au lieu d’être réduite. Les opérations de redimensionnement de conteneur ne permettent que d’augmenter la taille d’une session ; la réduction n’est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas représenter les métadonnées Linux.
Utilisez raw si une allocation fixe est requise, LUKS si la session doit être chiffrée, et SquashFS pour un instantané compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers de persistance réel et les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L’initrd peut lire et activer un instantané SquashFS existant stocké sur FAT, exFAT ou NTFS inscriptible car il extrait l’instantané dans un upper ext4 temporaire. La création ou l’enregistrement exact d’un instantané est différent : son espace de travail privé doit se trouver sur un système de fichiers POSIX adapté qui préserve les métadonnées Linux et les whiteouts du système de fichiers union.

## Sélection du démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement des entrées pour reprendre, créer une nouvelle session, sélectionner ou démarrer sans persistance. La description de référence des sélecteurs, de la compatibilité, du repli et des modes d’activation se trouve dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Paramètre | Signification |
|-----------|---------|
| `perch` | Utilise le chemin de reprise hérité au mieux. Il tente d’utiliser la valeur par défaut des métadonnées mais ne crée pas de remplacement si aucune n’est utilisable. |
| `perchdir=resume` | Reprend la valeur par défaut des métadonnées et, si elle est absente ou incompatible, permet à l’initrd de créer un nouveau remplacement compatible. Il s’agit du comportement actuel de reprise dans le menu de démarrage. |
| `perchdir=new` | Alloue une nouvelle session numérotée. |
| `perchdir=ask` | Permet de sélectionner une session existante ou d’en créer une lors du démarrage. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, y compris `/dev/...` et `label:...` les formats pris en charge par l’initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `raw`, `luks`, ou `squashfs`. |
| `perchsize=<size>` | Définit une nouvelle taille de conteneur ou une taille supérieure ; les valeurs simples sont allouées en Mio et `MB`, `GB`, et `TB` les suffixes sont acceptés. |

Si aucun mode n’est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32/NTFS/exFAT, la création native bascule sur DynFileFS si nécessaire. Un nouveau conteneur raw ou LUKS démarre à 4000 Mio ; une nouvelle session DynFileFS sans `perchsize` est dimensionnée selon l’espace disponible tout en conservant une marge de sécurité.
Les sessions SquashFS sont capturées depuis le système en cours d’exécution avec le Gestionnaire de sessions MiniOS ou `minios-session create squashfs` ; `perchdir=new perchmode=squashfs` ne crée pas de capture instantanée dans l’initrd.

Lors de la reprise, MiniOS vérifie la version enregistrée, l’édition, le système de fichiers union et le mode. Le paramètre littéral `perchdir=resume` peut créer une nouvelle session au lieu d’utiliser une valeur par défaut absente ou incompatible. Les demandes de reprise directes, `perch`, la sélection numérique directe et les autres reprises héritées ne créent pas automatiquement ce remplacement.
La sélection interactive affiche un avertissement avant d’autoriser une session incompatible. Si la sélection ou l’activation échoue encore, le démarrage continue normalement avec un upper RAM et un avertissement de persistance.

Le magasin de sessions a la forme suivante :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l’édition, le système de fichiers union, la taille, l’état et les paramètres spécifiques à chaque session.
Il s’agit de métadonnées persistantes validées par l’implémentation du démarrage, mais elles ne prouvent pas à elles seules l’état d’exécution actuel. Ne les modifiez pas et ne déplacez pas les données de session numérotées pendant qu’une session est montée ; utilisez le Gestionnaire de sessions MiniOS ou `minios-session`.

## Sessions actives et en cours d’exécution

Ces termes décrivent des états différents :

- La session **active** est celle sélectionnée par défaut pour le prochain démarrage.
- Sur le plan conceptuel, la session **en cours** est celle dont la couche modifiable assure effectivement la persistance pour le démarrage actuel.

Le champ persistant `running=` enregistre cette relation prévue. Un crash, un échec de construction de l’union, une copie du stockage ou un arrêt interrompu peuvent le rendre obsolète, même si le démarrage actuel utilise RAM ou une autre session. Des opérations comme la sauvegarde SquashFS nécessitent donc l’état actuel protégé de l’initrd, lié à l’ID de démarrage, et la vérification du montage de la couche supérieure ; elles ne se fient pas à `running=` seul. Voir [État actif, en cours d’exécution et démarrage actuel](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

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
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sans mode sélectionne natif. La création SquashFS capture les modifications actives en cours et n’a pas de taille fixe. Sa politique d’arrêt par défaut est `shutdown` ; la sauvegarde périodique est désactivée par défaut.

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
```

Seuls les imports de `.tar.zst` sont acceptés. Les chemins et membres d’archive sont validés, et l’extraction est limitée. `--auto-convert` choisit un mode compatible avec le système de fichiers actuel. `--force-mode <mode>` sélectionne explicitement un mode disponible. L’export, la copie et la conversion ne sont pas pris en charge pour les sessions SquashFS ; sauvegardez l’instantané et copiez à la place le répertoire complet de la session inactive.

Copier ou convertir une session :

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` attribue toujours un nouvel identifiant de session. `convert` remplace la source par défaut ; utilisez `--new-session` pour préserver la source. Une taille n’est pertinente que pour une cible de conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge les sessions DynFileFS, raw et LUKS et nécessite une taille supérieure à l’actuelle. Le nettoyage cible par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre magasin de sessions peut être sélectionné avec `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportement de sauvegarde SquashFS

Une session SquashFS est décompressée dans RAM pour la couche inscriptible en cours d’exécution. La sauvegarde reconstruit et valide un instantané exact, puis remplace atomiquement `changes.sb`.
Aucune génération de restauration n’est conservée. Sauvegarder maintenant est disponible depuis l’icône de la zone de notification, le Gestionnaire de sessions MiniOS ou `minios-session save` indépendamment de la politique automatique.

La sauvegarde à l’arrêt est assurée par le déclencheur d’arrêt principal MiniOS et le backend `minios-squashfs-save`, elle ne dépend donc pas que le Gestionnaire de sessions MiniOS soit ouvert ou installé. La sauvegarde périodique est vérifiée toutes les 30 minutes par un minuteur systemd ou un worker SysV, tous deux appelant le même backend d’enregistrement automatique. La reconstruction de l’instantané consomme du CPU et écrit l’instantané complet ; il est recommandé d’utiliser des intervalles d’une heure ou plus.

Pendant le fonctionnement avec persistance RAM (SquashFS), un instantané nouvellement capturé et activé SquashFS peut prendre le contrôle de la cible de sauvegarde en cours. Après ce transfert, l’ancien instantané en cours peut être supprimé sans redémarrage :

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Cette exception s’applique uniquement à un transfert valide de SquashFS du démarrage actuel. Les autres modes de persistance en cours restent protégés contre la suppression.

## Chiffrement

Le mode LUKS stocke un système de fichiers ext4 directement dans un fichier LUKS2 `changes.luks` ; il n’y a pas de table de partitions ni de conteneur DynFileFS imbriqué. Les options LUKS sont disponibles uniquement lorsque `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` et `losetup` sont présents.

La création interactive d’un conteneur LUKS demande la phrase de passe deux fois. Les opérations qui lisent ou créent des données LUKS peuvent les lire depuis l’entrée standard avec `--password-stdin`.
Les phrases de passe ne sont jamais placées dans les arguments de commande ni dans les métadonnées de session. Au démarrage, l’initrd demande la phrase de passe sur la console et ne bascule pas vers une persistance non chiffrée si l’activation échoue.

Les exports LUKS contiennent les fichiers logiques de session déchiffrés, et non `changes.luks`.
L’import ou la conversion vers LUKS crée un nouveau conteneur chiffré.

## Sauvegardes et sessions échouées

Pour les sessions natives, DynFileFS, raw et LUKS, utilisez `export` pour les sauvegardes plutôt que de copier un répertoire de session monté. Conservez l’archive obtenue sur un autre périphérique et vérifiez qu’elle peut être importée avant de vous y fier. L’import crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à être utilisée.
Pour les procédures de sauvegarde SquashFS et de périphérique entier, voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si une session échoue après un remplissage du stockage, une interruption d’écriture ou la création répétée de sessions vides, arrêtez de modifier le stockage concerné. Exportez d’abord une session non active lisible si possible, puis suivez [Dépannage](/maintenance-and-recovery/Troubleshooting).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant l’activation en écriture. Les échecs sérieux de vérification préservent le conteneur pour la récupération au lieu de le monter en écriture. SquashFS détecte un état antérieur non propre et restaure le dernier instantané sauvegardé avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions MiniOS ou `minios-session delete` ; ne supprimez pas manuellement les répertoires de session.
