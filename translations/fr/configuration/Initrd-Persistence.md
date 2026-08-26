# Persistance de l’initrd

MiniOS construit la racine live à partir de modules en lecture seule et d’une couche supérieure en écriture. L’initrd décide si cette couche supérieure correspond à une session persistante numérotée ou à un répertoire temporaire en RAM. Cette page décrit la décision prise au démarrage et le chemin d’activation. Pour les contrôles destinés à l’utilisateur, consultez [Modes de démarrage](./Boot-Modes.md) et [Paramètres de démarrage](./Boot-Parameters.md).

## La persistance est explicite

L’initrd active la gestion de la persistance uniquement si la ligne de commande du noyau contient l’un des jetons reconnus suivants :

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

En l’absence de ces jetons, y compris lorsqu’un nom `perch...` non reconnu est présent, MiniOS crée une nouvelle couche supérieure en écriture dans la RAM. Les modifications effectuées lors de ce démarrage sont perdues à l’arrêt.

Les sélecteurs ne sont pas tous équivalents :

| Sélecteur | Comportement de l’initrd |
|---|---|
| `perch` | Tente de reprendre la valeur par défaut des métadonnées. Il ne crée pas automatiquement de session lorsqu’aucune n’est utilisable ou en cas d’échec des vérifications de compatibilité. |
| `perchdir=resume` | Tente la valeur par défaut des métadonnées et peut créer automatiquement un nouveau remplacement compatible. Il s’agit du comportement actuel du menu de démarrage pour la reprise. |
| `perchdir=new` | Alloue un répertoire dont l’ID numérique est supérieur de un au plus grand ID existant. Il ne réutilise jamais un répertoire existant. |
| `perchdir=ask` | Propose les sessions existantes et un choix de nouvelle session. Une session existante incompatible nécessite une confirmation. |
| `perchdir=NUMBER` | Utilise ce répertoire s’il existe. S’il n’existe pas, la sélection peut revenir à la valeur par défaut enregistrée dans les métadonnées ; il ne réserve pas le numéro demandé. |

D’autres paramètres de persistance reconnus sans sélecteur suivent le même chemin de reprise hérité que `perch` seul : ils demandent la persistance, mais n’autorisent pas la création automatique. Si la sélection ou l’activation ne permet pas d’obtenir une couche supérieure utilisable, le démarrage se poursuit normalement avec la couche RAM et affiche un avertissement d’échec.

## Stockage de session et emplacement

Le stockage normal est le répertoire `changes` à côté des données MiniOS, avec des répertoires de session numérotés et des métadonnées `session.conf` ou `session.json` :

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Le stockage peut aussi être sélectionné comme un périphérique avec un chemin optionnel. Les formes acceptées incluent un chemin direct `/dev/...`, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` et `askdisk:custom:path`. Le suffixe délimité par deux-points devient un chemin sous le périphérique sélectionné ; la syntaxe avec slash après `askdisk` ignore silencieusement ce chemin personnalisé. Un sous-répertoire sélectionné est monté en bind comme stockage de session. MiniOS peut également détecter une partition de persistance sur le même disque et le stockage de persistance pris en charge par Ventoy.

Avant la sélection de session, l’initrd doit monter l’emplacement en écriture et vérifier qu’il peut créer et supprimer un marqueur dans le stockage. Un périphérique bloc qui ne peut pas être ouvert en écriture, un montage en lecture seule, un chemin indisponible ou un test d’écriture échoué excluent la persistance pour ce démarrage. Les sessions existantes ne sont pas considérées comme fiables simplement parce que leurs fichiers sont lisibles.

## Sélection et compatibilité

Les métadonnées de session enregistrent le mode de stockage et peuvent inclure la version de MiniOS, l’édition, le système de fichiers union et la taille du conteneur. La reprise compare le mode, la version, l’édition et l’union enregistrés avec le mode demandé et le système actuel. Les champs de compatibilité hérités manquants ne sont pas considérés comme des incompatibilités.

L’utilisation littérale de `perchdir=resume` crée une nouvelle session numérotée si la valeur par défaut est absente ou si un mode, une version, une édition ou une union enregistrés ne correspondent pas et rendent cette valeur par défaut inadaptée. `perch` seul, une sélection numérique directe et d’autres demandes de reprise héritées refusent le remplacement automatique et poursuivent en RAM après un échec de sélection. `perchdir=ask` affiche les informations de compatibilité et permet un dépassement explicite. Une nouvelle session est par défaut en `native`, sauf si un autre mode a été demandé.

Le mode de stockage fait partie de la compatibilité. Si la sélection atteint la distribution du backend, un mode demandé inconnu revient à `native`, dont la détection peut alors choisir DynFileFS sur un stockage inadapté. Une session existante avec un mode différent enregistré peut échouer lors de la vérification de compatibilité précédente ; une demande de reprise héritée continue alors en RAM au lieu d’atteindre ce repli.

## Réserve d’espace et tailles

MiniOS réserve par défaut 256 Mio d’espace libre sur le système de fichiers de persistance. La réserve et les vérifications d’espace libre utilisent des blocs de 1024 octets. `perchreserve` accepte un nombre entier non signé sans unité, est limité à 4096 et revient à 256 s’il est manquant ou invalide. Les nouvelles allocations et les extensions demandées sont limitées pour que cette réserve reste disponible. Un avertissement est également affiché au démarrage si l’espace libre actuel est inférieur ou égal à la réserve.

Les tailles de conteneur utilisent des valeurs entières allouées en Mio :

- Un nombre seul, `M` ou `MB` signifie Mio.
- `G` ou `GB` multiplie le nombre par 1000 Mio.
- `T` ou `TB` multiplie le nombre par 1 000 000 Mio.
- La demande logique maximale est de 1 000 000 Mio, limitée par l’espace disponible après la réserve.
- Le gestionnaire de sessions limite les fichiers raw et LUKS à 4000 Mio sur FAT32. Lors de l’activation par l’initrd, la limite est appliquée de manière fiable à LUKS, tandis qu’une demande raw surdimensionnée peut atteindre l’allocation et échouer au lieu d’être réduite.
- Les nouvelles sessions raw et LUKS sont par défaut à 4000 Mio.
- Une nouvelle session DynFileFS créée par l’initrd utilise par défaut la capacité disponible après la réserve, arrondie à la centaine de 1000 Mio inférieure si possible.

L’extension des conteneurs est réalisée au mieux, la réduction n’est pas prise en charge. `perchsize` ne dimensionne pas les sessions natives ou SquashFS. Le gestionnaire de sessions utilise sa propre valeur par défaut de 4000 Mio pour les nouveaux conteneurs créés ; voir [Gestion des sessions](./Session-Management.md).

## Activation du stockage

Tous les modes réussis doivent fournir la couche supérieure en écriture attendue par le système de fichiers union sélectionné. Un simple montage du backend ne constitue pas une autorité d’exécution définitive. Les modes natif, DynFileFS, raw et LUKS peuvent mettre à jour les métadonnées de session persistante avant la validation de l’union ; SquashFS diffère cet enregistrement des métadonnées. L’état protégé du démarrage en cours n’est publié qu’après confirmation que la racine finale de l’union utilise bien la couche supérieure attendue.

### Natif

Le mode natif exclut d’abord les systèmes de fichiers non POSIX connus comme FAT, exFAT et NTFS. Il teste ensuite le comportement réel du système de fichiers en créant un fichier et un lien symbolique, puis en vérifiant les changements de mode exécutable. Si le test réussit, le répertoire de session numéroté est monté en bind directement comme zone en écriture.

Si le système de fichiers est reconnu comme inadapté ou si le test POSIX échoue, le mode natif bascule vers DynFileFS. En cas d’échec après l’activation native, l’opération est annulée ; un nouveau candidat vide est supprimé s’il peut l’être en toute sécurité.

### DynFileFS

DynFileFS, implémenté par l’outil compatible `dynblk`, stocke une image logique de blocs dans `changes.dat` ainsi que ses fichiers de segments numérotés. L’outil doit monter avec succès et exposer `virtual.dat` ; sinon, l’activation échoue plutôt que de créer accidentellement un fichier en RAM avec un nom laissant croire à une persistance.

L’image logique contient un ext4. Les images existantes sont vérifiées avant le montage en écriture ; des résultats de vérification du système de fichiers supérieurs au statut « erreurs corrigées » rejettent la session et la préservent pour récupération. Le redimensionnement ne permet que l’agrandissement, et le système de fichiers ext4 interne est étendu si possible. Voir [Récupération DynFileFS](./DynFileFS-Recovery.md) pour les détails sur les segments et la réparation.

### Raw

Le mode raw utilise une image ext4 `changes.img` fixe. Les nouvelles images sont allouées et formatées avant utilisation. Les images existantes sont vérifiées avant montage, peuvent être agrandies si une taille supérieure est demandée, et ext4 est étendu pour occuper tout l’espace de l’image. En cas d’échec de vérification ou de montage, le conteneur reste disponible pour récupération et le démarrage se poursuit en RAM.

### LUKS

Le mode LUKS utilise un conteneur LUKS2 `changes.luks` avec ext4 directement à l’intérieur. Il n’est disponible que si l’initrd inclut le marqueur de support cryptographique et les outils nécessaires. La création demande une saisie de confirmation correspondante. Un conteneur existant autorise trois tentatives de déverrouillage sur la console de démarrage.

L’initrd authentifie avant d’agrandir un fichier chiffré existant, puis vérifie et étend ext4 avant de le monter. En cas d’échec de création, de déverrouillage, de vérification, d’agrandissement ou de montage, MiniOS nettoie le mapping et poursuit en RAM. Il ne bascule jamais vers natif, DynFileFS, raw ou toute autre persistance non chiffrée. Les mots de passe ne sont ni stockés dans les métadonnées de session ni passés comme arguments de commande. Voir [Sécurité](../administration/Security-Hardening.md).

### SquashFS

L’initrd ne peut activer qu’une session SquashFS existante ; il ne peut pas en créer une nouvelle `changes.sb`. L’activation valide des métadonnées strictes et à valeur unique pour le snapshot, incluant son empreinte, les tailles compressée et décompressée, le nombre d’entrées, le type d’union et la politique de sauvegarde. Il vérifie aussi le type de fichier et la taille exacte, la RAM et le swap disponibles, l’empreinte SHA-256 avant et après extraction, ainsi que la compatibilité actuelle de l’union.

Le snapshot est extrait avec une gestion stricte des erreurs et des xattr dans une image ext4 temporaire et limitée en RAM. Pour OverlayFS, cette image contient des répertoires `changes` et `workdir` séparés ; pour AUFS, sa racine est la branche en écriture. Des métadonnées malformées, une mémoire insuffisante, des changements d’empreinte, des erreurs d’extraction ou une politique invalide entraînent l’échec de l’activation et laissent le démarrage sur la couche supérieure RAM ordinaire.

Une session marquée `dirty` signifie que le démarrage précédent n’a pas terminé la transition d’arrêt propre. SquashFS affiche alors un avertissement et restaure le dernier `changes.sb` sauvegardé avec succès ; les modifications non sauvegardées de la session interrompue ne constituent pas une génération de retour arrière supplémentaire.

Le gestionnaire de sessions et le backend de sauvegarde système créent et remplacent de façon atomique les snapshots SquashFS par capture exacte. L’activation au démarrage peut lire un snapshot existant depuis un stockage FAT, exFAT ou NTFS en écriture car l’extraction se fait dans la couche supérieure ext4 temporaire. La création et la sauvegarde exacte restent conditionnées par le système de fichiers : leur zone de préparation privée doit préserver les liens, propriétaires, modes, xattr, ACL, capacités et whiteouts union, donc la sauvegarde actuelle nécessite un système de fichiers POSIX adapté. Voir [Gestion des sessions](./Session-Management.md).

## Activation de l’union et frontière de récupération

Pour AUFS, la racine des modifications activée devient la branche en écriture zéro. Pour OverlayFS, l’initrd construit `upperdir` et `workdir` sous la racine des modifications activée et monte les modules en lecture seule comme répertoires inférieurs. L’initrd vérifie ensuite la branche AUFS live ou le `upperdir` OverlayFS avant de publier la persistance comme active.

Si un backend de persistance, une mise à jour des métadonnées ou cette vérification échoue, les montages sont annulés si possible, aucune autorité d’exécution n’est publiée, et le démarrage en écriture se poursuit en RAM. L’échec de la construction de l’union racine lance le shell fatal de l’initramfs. Quitter ce shell peut permettre à la configuration de continuer avec une racine invalide ; ce n’est ni une réparation ni un repli sûr. AUFS conserve les ajouts de branches de modules au mieux, mais une union incomplète franchit la frontière de récupération : MiniOS ne publie pas d’autorité de persistance réussie.

Les échecs de vérification des conteneurs évitent délibérément toute récupération en écriture. Préservez la session et suivez [Récupération de sauvegarde](../administration/Backup-Recovery.md), [Récupération DynFileFS](./DynFileFS-Recovery.md) ou [Dépannage](../administration/Troubleshooting.md) plutôt que de remplacer les fichiers de session au démarrage.

## État actif, en cours et du démarrage actuel

Dans les métadonnées de session durables, `default=` est la session **active** sélectionnée pour la prochaine reprise, tandis que `running=` est la session enregistrée comme fournissant le démarrage en cours. L’activation écrit les deux champs et marque cette session `dirty`. Après disparition des montages de persistance lors d’un arrêt propre, MiniOS supprime `running=` et marque la session `clean`.

Ces champs de métadonnées peuvent être obsolètes après un crash, un échec d’écriture des métadonnées, un échec de construction de l’union, une copie du stockage ou un arrêt interrompu. Les consommateurs en temps réel qui doivent autoriser la sauvegarde ne se fient pas uniquement à `running=`. Ils utilisent l’état protégé du démarrage actuel de l’initrd, lié à l’ID de démarrage, la session numérique, le mode, l’identité réelle du stockage, le statut en écriture, la durabilité et la génération active vérifiée. Un enregistrement du démarrage actuel manquant ou en échec signifie que la persistance ne doit pas être considérée comme une cible de sauvegarde autorisée.

Avec `toram` et une demande de persistance reconnue, le stockage de session est copié en RAM avant activation. La session copiée peut être en écriture et fournir la couche supérieure active, mais son état de démarrage actuel est marqué non durable. Les modifications de cette copie RAM ne retournent pas sur le périphérique d’origine et sont perdues à l’arrêt.

Pour des conseils opérationnels complémentaires, voir [Modes de démarrage](./Boot-Modes.md), [Paramètres de démarrage](./Boot-Parameters.md), [Gestion des sessions](./Session-Management.md), [Récupération DynFileFS](./DynFileFS-Recovery.md), [Récupération de sauvegarde](../administration/Backup-Recovery.md), [Sécurité](../administration/Security-Hardening.md) et [Dépannage](../administration/Troubleshooting.md).
