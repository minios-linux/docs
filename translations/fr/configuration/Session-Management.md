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
| `native` | Modifications stockées directement dans le répertoire de session | Nécessite un système de fichiers POSIX inscriptible tel que ext2/3/4, Btrfs, XFS, F2FS ou ReiserFS. |
| `dynfilefs` | Conteneur ext4 extensible réparti en fichiers de support | Fonctionne sur POSIX inscriptible, FAT32, NTFS et exFAT. Nécessite le backend DynFileFS. |
| `raw` | `changes.img` de taille fixe contenant ext4 | Fonctionne sur POSIX inscriptible, FAT32, NTFS et exFAT. |
| `luks` | `changes.luks` chiffré LUKS2 contenant ext4 | Nécessite `cryptsetup`, le support loop et le hook LUKS de l'initrd MiniOS. |
| `squashfs` | Instantané compressé dans `changes.sb` | L'enregistrement nécessite un système de fichiers de persistance POSIX capable de préserver les liens, propriétaires, modes, xattrs, ACLs, capacités et whiteouts. |

`dynfilefs`, `raw` et `luks` créés avec `minios-session` ont une taille par défaut de 4000
MiB. Les valeurs de taille sont allouées en MiB ; les suffixes `GB` et `TB` convertissent respectivement en 1000
et 1 000 000 MiB. Le gestionnaire de sessions limite les fichiers raw et LUKS à 4000 MiB sur
FAT32. Ne considérez pas cela comme une garantie générale de l'initrd : une demande de démarrage raw surdimensionnée peut être allouée
et échouer au lieu d'être réduite. Les opérations de redimensionnement de conteneur ne peuvent qu'augmenter la taille d'une
session ; la réduction n'est pas prise en charge.

Le mode natif est le choix le plus simple et rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas représenter les métadonnées Linux.
Utilisez raw lorsque l'allocation fixe est requise, LUKS lorsque la session doit être
chiffrée, et SquashFS pour un instantané compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers de persistance réel et
les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L'initrd peut lire et activer
un instantané SquashFS existant stocké sur FAT, exFAT ou NTFS inscriptible car il
extrait l'instantané dans un ext4 temporaire. Créer ou enregistrer exactement un
instantané est différent : son espace de travail privé de préparation doit être sur un système de fichiers POSIX adapté qui préserve les métadonnées Linux et les whiteouts d'union.

## Sélection du démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS
proposent généralement des entrées pour reprendre, créer une nouvelle session, sélectionner, ou démarrer sans persistance.
La description de référence des comportements de sélection, compatibilité, repli et activation
se trouve dans [Persistance de l'initrd](./Initrd-Persistence.md).

| Paramètre | Signification |
|-----------|--------------|
| `perch` | Utilise l'ancien chemin de reprise "best-effort". Il tente d'utiliser la valeur par défaut des métadonnées mais ne crée pas de remplacement si aucune n'est utilisable. |
| `perchdir=resume` | Reprend la valeur par défaut des métadonnées et, si elle est absente ou incompatible, permet à l'initrd de créer un nouveau remplacement compatible. C'est le comportement actuel du menu de démarrage pour la reprise. |
| `perchdir=new` | Alloue une nouvelle session numérotée. |
| `perchdir=ask` | Sélectionne une session existante ou en crée une au démarrage. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, y compris les formes `/dev/...` et `label:...` gérées par l'initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `raw`, `luks` ou `squashfs`. |
| `perchsize=<size>` | Définit une taille de conteneur nouvelle ou supérieure ; les valeurs simples sont allouées en MiB et les suffixes `MB`, `GB` et `TB` sont acceptés. |

Si aucun mode n'est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur
FAT32/NTFS/exFAT, la création native bascule vers DynFileFS. Un nouveau conteneur raw ou LUKS démarre à 4000 MiB ; une nouvelle session DynFileFS sans
`perchsize` est dimensionnée selon l'espace disponible tout en conservant une marge de sécurité.
Les sessions SquashFS sont capturées depuis le système en cours d'exécution avec le gestionnaire de sessions ou
`minios-session create squashfs` ; `perchdir=new perchmode=squashfs` ne
crée pas d'instantané dans l'initrd.

Lors de la reprise, MiniOS vérifie la version enregistrée, l'édition, le système de fichiers union
et le mode. L'utilisation de `perchdir=resume` peut créer une nouvelle session au lieu d'utiliser une valeur par défaut
absente ou incompatible. Les demandes de reprise directes `perch`, la sélection numérique directe et
les autres requêtes de reprise héritées ne créent pas automatiquement ce remplacement.
La sélection interactive affiche un avertissement avant d'autoriser une session incompatible.
Si la sélection ou l'activation échoue encore, le démarrage continue normalement avec une
couche supérieure en RAM et un avertissement de persistance.

Le stockage des sessions a cette forme :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l'édition, le système de fichiers union, la taille, l'état et les paramètres spécifiques à chaque session.
Il s'agit de métadonnées persistantes validées par l'implémentation du démarrage, et non d'une preuve
de l'état d'exécution actuel. Ne l'éditez pas et ne déplacez pas les données de session numérotées
lorsqu'une session est montée ; utilisez le gestionnaire de sessions ou `minios-session`.

## Sessions actives et en cours d’exécution

Ces termes décrivent des états différents :

- La session **active** est celle sélectionnée par défaut pour le prochain démarrage.
- Conceptuellement, la session **en cours d’exécution** est celle dont la couche inscriptible
  fournit effectivement la persistance au démarrage actuel.

Le champ persistant `running=` enregistre cette relation prévue. Un crash,
une construction de l’union échouée, une copie du stockage ou une extinction interrompue peuvent le rendre
obsolète, même si le démarrage actuel utilise la RAM ou une autre session. Les opérations
comme la sauvegarde SquashFS nécessitent donc l’état protégé de l’initrd, lié à l’ID de démarrage
et la couche supérieure montée et vérifiée ; elles ne se fient pas uniquement à `running=`.
Voir [État actif, en cours d’exécution et de démarrage actuel](./Initrd-Persistence.md).

Activer une session modifie le prochain démarrage mais ne change pas le système de fichiers union actuel :

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

La session active ne peut pas être supprimée ni convertie sur place. Une session en cours d’exécution
ne peut normalement pas être supprimée, exportée, copiée, redimensionnée ou convertie. Le nettoyage
protège également les deux identifiants.

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
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sans mode sélectionne le mode natif. La création SquashFS capture les modifications en cours et n’a pas de taille fixe. Sa politique d’arrêt est par défaut `shutdown` ; la sauvegarde périodique est désactivée par défaut.

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

Seuls les imports `.tar.zst` sont acceptés. Les chemins et les membres d’archive sont validés, et l’extraction est limitée. `--auto-convert` choisit un mode compatible avec le système de fichiers actuel. `--force-mode <mode>` sélectionne explicitement un mode disponible. L’export, la copie et la conversion ne sont pas pris en charge pour les sessions SquashFS ; sauvegardez l’instantané et copiez le répertoire complet de la session inactive à la place.

Copier ou convertir une session :

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` attribue toujours un nouvel identifiant de session. `convert` remplace la source par défaut ; utilisez `--new-session` pour préserver la source. Une taille n’est pertinente que pour une cible de type conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge les sessions DynFileFS, raw et LUKS et nécessite une taille supérieure à la taille actuelle. Le nettoyage concerne par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre store de sessions peut être sélectionné avec `--sessions-dir PATH` :

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

## Sauvegardes et restauration

Pour les sessions natives, DynFileFS, raw et LUKS, utilisez `export` pour les sauvegardes plutôt que de copier un répertoire de session monté. Conservez l’archive obtenue sur un autre périphérique et vérifiez qu’elle peut être lue ou importée avant de vous y fier. L’import crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à être utilisée. Pour les procédures de sauvegarde SquashFS et de sauvegarde de périphérique complet, consultez [Sauvegarde et restauration](/administration/Backup-Recovery.md).

Pour la récupération après une panne complète du périphérique de stockage, une écriture interrompue ou la création répétée de sessions vides, suivez le guide dédié [Récupération DynFileFS et dynblk](./DynFileFS-Recovery.md).

Démarrez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant l’activation en écriture. En cas d’échec sérieux du contrôle du système de fichiers, le conteneur est préservé pour la récupération au lieu d’être monté en écriture. SquashFS détecte un état précédent non propre et restaure le dernier instantané sauvegardé avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions ou `minios-session delete` ; ne supprimez pas manuellement les répertoires de session.
