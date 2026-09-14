---
updated: 2026-09-13
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

| Mode | Stockage | Contraintes principales |
|------|---------|------------------|
| `native` | Modifications enregistrées directement dans le répertoire de session | Nécessite un système de fichiers POSIX en écriture tel que ext2/3/4, Btrfs, XFS, F2FS ou ReiserFS. |
| `dynfilefs` | Conteneur ext4 extensible découpé en fichiers de support | Fonctionne sur les systèmes de fichiers POSIX en écriture, FAT32, NTFS et exFAT. Nécessite le backend DynFileFS. |
| `dynblk` | Système de fichiers ext4 léger sur un périphérique bloc du noyau basé sur `volumeNNN.db` fichiers | Nécessite l’outil en ligne de commande dynblk, le module noyau et la capacité initrd. La taille virtuelle par défaut est de 16 Gio et limitée à 512 Gio. |
| `raw` | Fichier `changes.img` de taille fixe contenant ext4 | Fonctionne sur les systèmes de fichiers POSIX en écriture, FAT32, NTFS et exFAT. |
| `luks` | Fichier LUKS2 chiffré `changes.luks` contenant ext4 | Nécessite `cryptsetup`, le support loop et le hook LUKS initrd MiniOS. |
| `squashfs` | Instantané compressé dans `changes.sb` | L’enregistrement nécessite un système de fichiers de persistance POSIX capable de préserver les liens, propriétaires, modes, xattrs, ACL, capacités et whiteouts. |

`dynfilefs`, `raw`, et `luks` créés avec `minios-session` ont une taille par défaut de 4000 Mio ; `dynblk` a une taille par défaut de 16 Gio. Les valeurs de taille sont allouées en Mio ; `GB` et `TB` les suffixes convertissent en 1000 et 1 000 000 Mio. Le Gestionnaire de sessions MiniOS limite les fichiers raw et LUKS à 4000 Mio sur FAT32. La capacité dynblk est virtuelle et fine, non préallouée, mais les écritures réelles restent limitées par l’espace libre du système de fichiers sous-jacent et l’admission des ressources dynblk. Les opérations de redimensionnement de conteneur ne peuvent qu’augmenter la taille d’une session ; la réduction n’est pas prise en charge.

Le mode natif est le choix le plus simple et le plus rapide sur un système de fichiers compatible.
Utilisez DynFileFS lorsque le système de fichiers de persistance ne peut pas représenter les métadonnées Linux.
Utilisez dynblk si vous souhaitez un véritable périphérique bloc noyau avec des fichiers de support fins ; le pilote peut maintenir plusieurs volumes dynblk indépendants connectés simultanément, et le Gestionnaire de sessions utilise le chemin du périphérique retourné par le pilote au lieu de supposer que `/dev/dynblk0` est libre.
Utilisez raw si une allocation fixe est requise, LUKS si la session doit être chiffrée, et SquashFS pour un instantané compressé exact.

Exécutez les commandes suivantes pour inspecter le système de fichiers de persistance réel et les modes disponibles dessus :

```bash
sudo minios-session info
sudo minios-session status
```

Aucune session ne peut être créée sur un support en lecture seule. L’initrd peut lire et activer un instantané SquashFS existant stocké sur FAT, exFAT ou NTFS en écriture, car il extrait l’instantané dans un upper ext4 temporaire. Créer ou enregistrer exactement un instantané est différent : son espace de travail privé de préparation doit se trouver sur un système de fichiers POSIX adapté qui préserve les métadonnées Linux et les whiteouts d’union.

## Sélection du démarrage

Tout paramètre de persistance reconnu active la gestion de la persistance. Les menus de démarrage MiniOS proposent généralement les entrées reprendre, nouveau, sélection et non-persistant. La description canonique du sélecteur, de la compatibilité, du repli et des modes d’activation se trouve dans [Persistance initrd](/reference/boot-process/Persistence-Internals).

| Paramètre | Signification |
|-----------|---------|
| `perch` | Utilise la méthode héritée de reprise au mieux. Elle tente la valeur par défaut des métadonnées mais ne crée pas de remplacement si aucune n’est utilisable. |
| `perchdir=resume` | Reprend la valeur par défaut des métadonnées et, si elle est absente ou incompatible, permet à l’initrd de créer un nouveau remplacement compatible. Il s’agit du comportement actuel de reprise dans le menu de démarrage. |
| `perchdir=new` | Alloue une nouvelle session numérotée. |
| `perchdir=ask` | Sélectionne une session existante ou en crée une lors du démarrage. |
| `perchdir=<id>` | Sélectionne directement cette session numérotée. |
| `perchdir=<device/path>` | Utilise un emplacement de persistance sur un périphérique, y compris `/dev/...` et `label:...` les formats gérés par l’initrd. |
| `perchmode=<mode>` | Définit `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, ou `squashfs`. |
| `perchsize=<size>` | Définit une nouvelle taille de conteneur ou une taille supérieure ; les valeurs simples sont allouées en Mio et `MB`, `GB`, et `TB` les suffixes sont acceptés. |

Si aucun mode n’est spécifié pour une nouvelle session, le démarrage utilise le mode natif. Sur FAT32/NTFS/exFAT, la création native bascule sur DynFileFS. Un nouveau conteneur de démarrage brut ou LUKS est par défaut à 4000 Mio ; une nouvelle session de démarrage DynFileFS sans `perchsize` est dimensionnée selon l’espace disponible tout en conservant une marge de sécurité. Une nouvelle session de démarrage dynblk sans `perchsize` utilise la valeur par défaut du pilote de 16 Gio ; l’extension explicite dynblk est limitée à 512 Gio.
Les sessions SquashFS sont capturées depuis le système en cours d’exécution avec le Gestionnaire de sessions MiniOS ou `minios-session create squashfs`; `perchdir=new perchmode=squashfs` ne crée pas de capture instantanée dans l’initrd.

Lors de la reprise, MiniOS vérifie la version enregistrée, l’édition, le système de fichiers union et le mode. L’option littérale `perchdir=resume` peut créer une nouvelle session au lieu d’utiliser une valeur par défaut absente ou incompatible. Les demandes de reprise héritées simples, la sélection numérique directe et autres `perch` ne créent pas automatiquement ce remplacement.
La sélection interactive affiche un avertissement avant d’autoriser une session incompatible. Si la sélection ou l’activation échoue, le démarrage continue normalement avec un upper RAM et un avertissement de persistance.

Le magasin de sessions a la forme suivante :

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` enregistre les identifiants par défaut et en cours, ainsi que le mode, la version, l’édition, le système de fichiers union, la taille, l’état et les paramètres spécifiques à chaque session.
Il s’agit de métadonnées persistantes validées par l’implémentation du démarrage, mais qui ne prouvent pas à elles seules l’état courant d’exécution. Ne modifiez pas ni ne déplacez les données de session numérotées lorsqu’une session est montée ; utilisez le Gestionnaire de sessions MiniOS ou `minios-session`.

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

Lister les sessions et inspecter le magasin :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Créer des sessions :

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sans mode sélectionne le mode natif. La création de SquashFS capture les modifications en cours et n’a pas de taille fixe. Sa politique d’arrêt est par défaut `shutdown` ; la sauvegarde périodique est désactivée par défaut.

Sauvegarder et configurer une session SquashFS :

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Les intervalles périodiques valides sont `30`, `60`, `120`, `240`, et `480` minutes ; `0` désactive la sauvegarde périodique. Les paramètres d’arrêt et de sauvegarde périodique sont indépendants.

Exporter et importer des`.tar.zst` archives :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
```

Seules les`.tar.zst` importations sont acceptées. Les chemins et les membres de l’archive sont vérifiés, et l’extraction est limitée.`--auto-convert` choisit un mode compatible avec le système de fichiers actuel.`--force-mode <mode>` sélectionne explicitement un mode disponible. L’export, la copie et la conversion ne sont pas pris en charge pour les sessions SquashFS ; sauvegardez l’instantané et copiez le dossier de session inactif complet à la place.

Copier ou convertir une session :

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` attribue toujours un nouvel identifiant de session.`convert` remplace la source par défaut ; utilisez `--new-session` pour conserver la source. Une taille n’est pertinente que pour une cible de type conteneur.

Agrandir, supprimer ou nettoyer des sessions :

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Le redimensionnement prend en charge DynFileFS, dynblk, raw et les sessions LUKS, et nécessite une taille supérieure à la taille actuelle. Le redimensionnement dynblk augmente d’abord la taille du périphérique bloc virtuel, puis étend son système de fichiers ext4 ; il ne préalloue pas la nouvelle capacité virtuelle. Le nettoyage cible par défaut les sessions de plus de 30 jours.

Toutes les commandes acceptent `--json`, et un autre magasin de sessions peut être sélectionné avec `--sessions-dir PATH` :

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

Le mode LUKS stocke un système de fichiers ext4 directement dans un fichier LUKS2 `changes.luks` ; il n'y a ni table de partitions ni conteneur DynFileFS imbriqué. Les options LUKS ne sont disponibles que lorsque `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`, et `losetup` sont présents.

La création interactive d’un conteneur LUKS demande la phrase de passe deux fois. Les opérations qui lisent ou créent des données LUKS peuvent les lire depuis l’entrée standard avec `--password-stdin`.
Les phrases de passe ne sont jamais placées dans les arguments de commande ou les métadonnées de session. Au démarrage, l’initrd demande la phrase de passe sur la console et ne bascule pas vers une persistance non chiffrée si l’activation échoue.

Les exports LUKS contiennent des fichiers de session logiques déchiffrés, et non `changes.luks`.
L’importation ou la conversion vers LUKS crée un nouveau conteneur chiffré.

## Sauvegardes et sessions échouées

Pour les sessions natives, DynFileFS, dynblk, raw et LUKS, utilisez `export` pour les sauvegardes plutôt que de copier un répertoire de session monté. Conservez l’archive obtenue sur un autre appareil et vérifiez qu’elle peut être importée avant de vous y fier. L’importation crée toujours une nouvelle session numérotée ; activez-la explicitement lorsqu’elle est prête à être utilisée.
Pour les procédures de sauvegarde SquashFS et de disque entier, voir [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Si une session échoue après un remplissage du stockage, une interruption d’écriture ou la création répétée de sessions vides, arrêtez toute modification du stockage concerné. Exportez d’abord une session lisible et non active si possible, puis consultez [Dépannage](/maintenance-and-recovery/Troubleshooting).

Commencez le diagnostic sans modifier les données de session :

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Au démarrage, les systèmes de fichiers des conteneurs sont vérifiés avant l’activation en écriture. En cas d’échec sérieux de la vérification, le conteneur est préservé pour récupération au lieu d’être monté en écriture. SquashFS détecte un état précédent non propre et restaure le dernier instantané enregistré avec succès. Supprimez les sessions uniquement via le Gestionnaire de sessions MiniOS ou `minios-session delete` ; ne supprimez pas manuellement les répertoires de session.
