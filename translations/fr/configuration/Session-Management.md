# Gestion des sessions dans MiniOS

Les sessions MiniOS conservent les modifications apportées au système live après redémarrage. Chaque session correspond à un répertoire numéroté sous `minios/changes/` ; les modules MiniOS en lecture seule restent inchangés et la session sélectionnée fournit la couche writable du système de fichiers union.

Utilisez le Gestionnaire de sessions depuis un système MiniOS en cours d’exécution :

```bash
minios-session-manager
```

L’outil équivalent en ligne de commande est `minios-session`. Ses commandes de modification nécessitent des privilèges administrateur ; c’est pourquoi les exemples ci-dessous utilisent `sudo`.

## Modes de session

| Mode | Stockage | Contraintes principales |
|------|----------|------------------------|
| `native` | Modifications stockées directement dans le répertoire de session | Nécessite un système de fichiers POSIX writable tel que ext2/3/4, Btrfs, XFS, F2FS ou ReiserFS. |
| `dynfilefs` | Conteneur ext4 extensible découpé en fichiers de support | Fonctionne sur POSIX writable, FAT32, NTFS et exFAT. Nécessite le backend DynFileFS. |
| `raw` | `changes.img` de taille fixe contenant ext4 | Fonctionne sur POSIX writable, FAT32, NTFS et exFAT. |
| `luks` | `changes.luks` chiffré LUKS2 contenant ext4 | Nécessite `cryptsetup`, le support loop et le hook LUKS de l’initrd MiniOS. |
| `squashfs` | Snapshot compressé dans `changes.sb` | L’enregistrement nécessite un système de fichiers persistant POSIX capable de préserver liens, propriétaires, modes, xattrs, ACLs, capacités et whiteouts. |

`dynfilefs`, `raw` et `luks` créés avec `minios-session` ont par défaut une taille de 4000 Mo. Les tailles utilisent les unités décimales `MB`, `GB` ou `TB` et sont limitées à 1 To. Les fichiers raw et LUKS sont limités à 4000 Mo sur FAT32. Les opérations de redimensionnement de conteneur ne permettent que d’augmenter la taille d’une session ; la réduction n’est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible. Utilisez DynFileFS lorsque le système de fichiers persistant ne peut pas représenter les métadonnées Linux. Utilisez raw lorsqu’une allocation fixe est requise, LUKS si la session doit être chiffrée, et SquashFS pour un snapshot compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers persistant réel et les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L’activation de SquashFS sur FAT32/NTFS/exFAT reste désactivée tant qu’un espace de travail intermédiaire préservant les métadonnées n’est pas disponible.

## Sélection au démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement des entrées pour reprendre, créer une nouvelle session, sélectionner, ou démarrer sans persistance.

| Paramètre | Signification |
|-----------|--------------|
| `perch` | Demande la persistance. |
| `perchdir=resume` | Reprend la session par défaut. Ceci est effectué au mieux et continue en mémoire si aucune session writable et compatible n’est disponible. |
| `perchdir=new` | Alloue une nouvelle session numérotée. |
| `perchdir=ask` | Sélectionne une session existante ou en crée une au démarrage. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, y compris les formes `/dev/...` et `label:...` gérées par l’initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `raw`, `luks` ou `squashfs`. |
| `perchsize=<size>` | Définit une taille de conteneur nouvelle ou supérieure ; les valeurs simples sont en Mo et les suffixes `MB`, `GB` et `TB` sont acceptés. |

Si aucun mode n’est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32/NTFS/exFAT, la création native bascule sur DynFileFS. Un nouveau conteneur raw ou LUKS démarre à 4000 Mo ; une nouvelle session DynFileFS sans `perchsize` est dimensionnée selon l’espace disponible tout en conservant une réserve de sécurité. Les sessions SquashFS sont capturées depuis le système en cours via le Gestionnaire de sessions ou `minios-session create squashfs` ; `perchdir=new perchmode=squashfs` ne crée pas de snapshot dans l’initrd.

Lors de la reprise, MiniOS vérifie la version enregistrée, l’édition, le système de fichiers union et le mode. Le chemin normal `resume` crée une nouvelle session au lieu de remplacer une session incompatible. La sélection interactive affiche un avertissement avant d’autoriser une session incompatible.

Le stockage des sessions a la forme suivante :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l’édition, le système de fichiers union, la taille, l’état et les paramètres spécifiques à chaque session. Il s’agit de la configuration validée par le démarrage. Ne l’éditez pas et ne déplacez pas les données de session numérotées pendant qu’une session est montée ; utilisez le Gestionnaire de sessions ou `minios-session`.

## Sessions actives et en cours d’exécution

Ces termes décrivent des états différents :

- La session **active** est celle sélectionnée par défaut pour le prochain démarrage.
- La session **en cours** fournit la persistance à la session en cours d’exécution.

Activer une session modifie le prochain démarrage sans changer le système de fichiers union actuel :

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La session active ne peut pas être supprimée ni convertie sur place. Une session en cours ne peut normalement pas être supprimée, exportée, copiée, redimensionnée ou convertie. Le nettoyage protège également ces deux identifiants.

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
sudo minios-session create raw 4GB
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sans mode sélectionne natif. La création SquashFS capture les modifications live actuelles et n’a pas de taille fixe. Sa politique d’arrêt est par défaut `shutdown` ; la sauvegarde périodique est désactivée par défaut.

Sauvegarder et configurer une session SquashFS :

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Les intervalles périodiques valides sont `30`, `60`, `120`, `240` et `480` minutes ; `0` désactive la sauvegarde périodique. Les paramètres d’arrêt et de périodicité sont indépendants.

Exporter et importer des archives `.tar.zst` :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Seuls les imports `.tar.zst` sont acceptés. Les chemins et membres d’archive sont validés, et l’extraction est limitée. `--auto-convert` choisit un mode compatible avec le système de fichiers actuel. `--force-mode <mode>` sélectionne explicitement un mode disponible.

Copier ou convertir une session :

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` attribue toujours un nouvel identifiant de session. `convert` remplace la source par défaut ; utilisez `--new-session` pour préserver la source. Une taille n’est pertinente que pour une cible conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge les sessions DynFileFS, raw et LUKS et nécessite une taille supérieure à la taille actuelle. Le nettoyage concerne par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre stockage de sessions peut être sélectionné avec `--sessions-dir PATH` :

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportement de sauvegarde SquashFS

Une session SquashFS est décompressée en RAM pour la couche writable en cours d’exécution. La sauvegarde reconstruit et valide un snapshot exact, puis remplace atomiquement `changes.sb`. Aucune génération de rollback n’est conservée. La fonction "Sauvegarder maintenant" est accessible depuis l’icône de la barre système, le Gestionnaire de sessions ou `minios-session save` quel que soit le paramétrage automatique.

La sauvegarde à l’arrêt est assurée par le déclencheur d’arrêt principal de MiniOS et le backend `minios-squashfs-save`, elle ne dépend donc pas de l’ouverture ou de l’installation du Gestionnaire de sessions. La sauvegarde périodique est vérifiée toutes les 30 minutes par un timer systemd ou un worker SysV, qui appellent tous deux le même backend d’autosauvegarde. La reconstruction du snapshot consomme du CPU et écrit le snapshot complet ; des intervalles d’une heure ou plus sont recommandés.

Lors d’une opération SquashFS en RAM, un snapshot SquashFS nouvellement capturé et activé peut prendre possession de la cible de sauvegarde en cours. Après ce transfert, l’ancien snapshot en cours peut être supprimé sans redémarrage :

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Cette exception ne s’applique qu’à un transfert SquashFS valide de la session en cours de démarrage. Les autres modes de persistance en cours restent protégés contre la suppression.

## Chiffrement

Le mode LUKS stocke un système de fichiers ext4 directement dans un fichier LUKS2 `changes.luks` ; il n’y a pas de table de partitions ni de conteneur DynFileFS imbriqué. Les options LUKS ne sont disponibles que lorsque `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` et `losetup` sont présents.

La création interactive LUKS demande la phrase de passe deux fois. Les opérations qui lisent ou créent des données LUKS peuvent les lire depuis l’entrée standard avec `--password-stdin`. Les phrases de passe ne sont pas placées dans les arguments de commande ni dans les métadonnées de session. Au démarrage, l’initrd demande la phrase de passe sur la console et ne bascule pas vers une persistance non chiffrée si l’activation échoue.

Les exports LUKS contiennent les fichiers logiques de session déchiffrés, pas `changes.luks`. L’import ou la conversion vers LUKS crée un nouveau conteneur chiffré.

## Sauvegardes et récupération

Utilisez `export` pour les sauvegardes plutôt que de copier un répertoire de session monté. Conservez l’archive obtenue sur un autre périphérique et vérifiez qu’elle peut être lue ou importée avant de s’y fier. L’import crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à l’emploi.

Pour la récupération après un périphérique de stockage plein, une écriture interrompue ou la création répétée de sessions vides, suivez le guide dédié [DynFileFS et dynblk pour la récupération](./DynFileFS-Recovery.md).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers conteneurs sont vérifiés avant l’activation writable. En cas d’échec sérieux du fsck, le conteneur est préservé pour récupération au lieu d’être monté en writable. SquashFS détecte un état précédent non propre et restaure le dernier snapshot sauvegardé avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions ou `minios-session delete` ; ne supprimez pas manuellement les répertoires de session.
