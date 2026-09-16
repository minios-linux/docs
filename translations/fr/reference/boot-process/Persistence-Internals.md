---
updated: 2026-09-16
---

# Internes de la persistance

Cette page explique les paramètres de démarrage `perch`, `perchdir`, `perchmode`, `perchsize` et `perchreserve`. Ces paramètres contrôlent l’emplacement où les modifications d’une session live sont enregistrées. Pour une utilisation classique, sélectionnez une entrée persistante dans le menu de démarrage ou utilisez le Gestionnaire de sessions MiniOS plutôt que de les modifier manuellement.

MiniOS construit la racine live à partir de modules en lecture seule et d’une seule couche supérieure en écriture.
L’initrd décide si cette couche supérieure correspond à une session persistante numérotée ou à un répertoire temporaire dans RAM. Cette page décrit ce choix au démarrage et le chemin d’activation. Pour les contrôles accessibles à l’utilisateur, consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Paramètres de démarrage](/reference/Boot-Parameters).

## En termes simples

Sans paramètre de persistance, MiniOS enregistre les modifications dans RAM et les supprime à l’extinction. Un paramètre de persistance demande à MiniOS de localiser un espace de stockage en écriture, de sélectionner ou créer une session numérotée, de vérifier la compatibilité et d’utiliser cette session comme couche en écriture.

Demander la persistance ne garantit pas qu’elle soit activée. Si la cible est en lecture seule, pleine, endommagée ou incompatible, MiniOS peut continuer avec une couche temporaire RAM. Lisez l’avertissement au démarrage avant de compter sur la sauvegarde des modifications.

## Explication des paramètres

| Paramètre | Ce que cela indique à MiniOS | Choix habituel |
|---|---|---|
| `perchdir=resume` | Ouvre la session compatible par défaut et, si les conditions le permettent, crée un remplacement si elle ne peut pas être utilisée. | Utilisation quotidienne normale. |
| `perchdir=new` | Créer une nouvelle session numérotée. | Conserver un espace de travail existant sans modification. |
| `perchdir=ask` | Affiche les sessions enregistrées après détection d’un stockage reprenable et permet d’en choisir une. Impossible de créer la première session sur un stockage vide. | Plusieurs espaces de travail existants sur un même appareil ; utilisez `perchdir=new` pour la première session. |
| `perchdir=NUMBER` | Demander une session numérotée spécifique. | Entrée personnalisée de démarrage stable après vérification de l’ID de session. |
| `perchmode=MODE` | Sélectionner `native`, `dynfilefs`, `dynblk`, `raw`, ou `squashfs`. | Faire correspondre le système de fichiers sous-jacent et le modèle de persistance souhaité. |
| `perchencrypt=luks` | Ajouter une couche LUKS2 lors de la création d’une session Raw, DynFileFS ou DynBlk. | Chiffrer un backend de conteneur pris en charge. |
| `perchsize=SIZE` | Demander la taille d’une session de conteneur nouvelle ou en expansion. | DynFileFS, DynBlk ou raw ; le chiffrement ne modifie pas la gestion de la taille du backend. |
| `perchcomp=CODEC` | Sélectionner la compression du backend DynBlk pour une session DynBlk nouvellement créée. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842` ; la disponibilité dépend toujours du noyau en cours d’exécution. La compression est désactivée lorsque LUKS encapsule DynBlk. |
| `perchreserve=MB` | Soustraire une marge lors du dimensionnement d’un conteneur nouveau ou en expansion et définir le seuil d’alerte d’espace faible. | Réserver de l’espace de travail lors de l’allocation d’un conteneur ; il ne s’agit pas d’un quota à l’exécution. |
| `perch` | Utiliser l’ancien comportement de reprise sans création automatique de remplacement. | Compatibilité avec une entrée personnalisée existante ; privilégiez `perchdir=resume` pour les menus actuels. |

Ne combinez pas la persistance avec `toram` lorsque vous souhaitez que les modifications soient réécrites sur le périphérique d’origine. MiniOS active la session copiée dans RAM, et les modifications apportées à cette copie sont perdues à l’arrêt.

## La persistance est explicite

L'initrd active la gestion de la persistance uniquement si la ligne de commande du noyau contient l'un des jetons reconnus suivants :

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

En l'absence de ces jetons, y compris si seul un `perch...` nom non reconnu est présent, MiniOS crée un nouvel espace d'écriture temporaire dans RAM. Les modifications effectuées pendant ce démarrage sont perdues à l'arrêt.

Les sélecteurs n'ont pas tous le même comportement :

| Sélecteur | Comportement de l'initrd |
|---|---|
| `perch` | Tente de reprendre la valeur par défaut des métadonnées. Il ne crée pas automatiquement de session lorsqu'aucune n'est utilisable ou si les vérifications de compatibilité échouent. |
| `perchdir=resume` | Tente la valeur par défaut des métadonnées et peut créer automatiquement un nouveau remplacement compatible. Il s'agit du comportement actuel de reprise du menu de démarrage. |
| `perchdir=new` | Alloue un répertoire dont l'identifiant numérique est supérieur de un au plus grand identifiant existant. Il ne réutilise jamais un répertoire existant. |
| `perchdir=ask` | Propose les sessions existantes après avoir trouvé un espace réutilisable et la valeur par défaut. Une session existante incompatible nécessite une confirmation. Si le stockage est vide, utilisez `perchdir=new` pour créer la première session. |
| `perchdir=NUMBER` | Utilise ce répertoire s'il existe. S'il n'existe pas, la sélection peut revenir à la valeur par défaut enregistrée dans les métadonnées ; il ne réserve pas le numéro demandé. |

D'autres paramètres de persistance reconnus sans sélecteur suivent le même chemin de reprise hérité que l'option seule `perch` : ils demandent la persistance, mais ne permettent pas la création automatique. Si la sélection ou l'activation ne permet pas d'obtenir un espace d'écriture utilisable, le démarrage se poursuit normalement avec l'espace RAM et un avertissement d'échec est affiché.

## Emplacement et stockage de session

Le stockage habituel se trouve dans le `changes` répertoire à côté des données MiniOS, avec des répertoires de session numérotés et `session.conf` ou `session.json` métadonnées :

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Le stockage peut aussi être sélectionné comme un périphérique avec un chemin optionnel. Les formats acceptés incluent un chemin direct `/dev/...` , `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, et `askdisk:custom:path`. Le suffixe délimité par deux-points devient un chemin sous le périphérique sélectionné ; la syntaxe slash après `askdisk` perd silencieusement ce chemin personnalisé. Un sous-répertoire sélectionné est monté en tant que stockage de session. MiniOS peut également détecter une partition de persistance sur le même disque et un stockage de persistance Ventoy pris en charge.

Avant la sélection de la session, l'initrd doit monter l'emplacement en écriture et prouver qu'il peut créer et supprimer un marqueur dans le stockage. Un périphérique bloc qui ne peut pas être ouvert en écriture, un montage en lecture seule, un chemin indisponible ou un test d'écriture échoué empêche la persistance pour ce démarrage. Les sessions existantes ne sont pas considérées comme fiables simplement parce que leurs fichiers sont lisibles.

## Sélection et compatibilité

Les métadonnées de session enregistrent le mode de stockage et peuvent enregistrer la version, l’édition, le système de fichiers union et la taille du conteneur MiniOS. À la reprise, le mode, la version, l’édition et le système de fichiers union enregistrés sont comparés au mode demandé et au système actuel.
Les champs de compatibilité hérités manquants ne sont pas considérés comme des incompatibilités.

L’utilisation littérale de `perchdir=resume` crée une nouvelle session numérotée si la valeur par défaut est absente ou si un mode, une version, une édition ou un système union enregistré ne correspond pas et rend la valeur par défaut inadaptée. `perch` seul, une sélection numérique directe et d’autres demandes de reprise héritées refusent la création automatique de remplacement et poursuivent dans RAM après un échec de sélection. `perchdir=ask` affiche les informations de compatibilité et permet un dépassement explicite. Une nouvelle session est par défaut en `native` sauf si un autre mode a été demandé.

Le mode de stockage fait partie de la compatibilité. Si la sélection atteint le dispatch du backend, un mode demandé inconnu revient à `native`, dont la détection peut alors choisir DynFileFS sur un stockage inadapté. Une session existante avec un mode enregistré différent peut échouer à la vérification de compatibilité précédente ; une demande de reprise héritée continue alors dans RAM au lieu d’atteindre ce repli.

## Réserve d’espace et tailles

MiniOS utilise 256 Mio comme marge d’allocation par défaut et seuil d’alerte d’espace faible. Le calcul s’appuie sur des blocs de système de fichiers de 1024 octets. `perchreserve` accepte un nombre entier non signé sans unité, limité à 4096, et revient à 256 s’il est absent ou invalide. La marge réduit l’espace proposé à un conteneur nouveau ou en croissance. Ce n’est pas un quota : une session native ou des écritures ultérieures peuvent toujours consommer l’espace restant du système de fichiers. Au démarrage, un avertissement s’affiche lorsque l’espace libre atteint ou passe sous le seuil.

Les tailles de conteneur sont exprimées en nombres entiers alloués en Mio :

- Un nombre seul, `M`, ou `MB` signifie Mio.
- `G` ou `GB` multiplie le nombre par 1000 Mio.
- `T` ou `TB` multiplie le nombre par 1 000 000 Mio.
- Les conteneurs Raw sont limités à 1 000 000 Mio et par l’espace disponible après la réserve. DynFileFS possède une limite distincte tenant compte de RAM et un plafond strict de 2 000 000 Mio. DynBlk a son propre plafond format/ABI de 512 Gio.
- Raw correspond à un seul fichier de support, donc FAT32 le limite à 4000 Mio dans MiniOS. La même limite s’applique lorsque Raw est encapsulé dans LUKS2.
- Une nouvelle session Raw démarre par défaut à 4000 Mio. Le chiffrement ne crée pas de politique de taille LUKS distincte : un Raw chiffré, DynFileFS ou une session DynBlk suit les règles de taille de son backend sous-jacent.
- Une nouvelle session DynFileFS créée par initrd sans `perchsize` utilise jusqu’à 16 Gio de capacité logique. Si le support sous-jacent ne peut finalement pas contenir autant après `perchreserve` et la surcharge d’index DynFileFS, la valeur par défaut est réduite à la capacité disponible. Son index format-400 coûte environ 2 Mio de RAM et environ 2 Mio de stockage par Gio de capacité logique déclarée, même si la charge utile est vide. MiniOS limite donc aussi la capacité DynFileFS selon l’espace physique RAM et un plafond strict testé de 2 000 000 Mio.
- Une nouvelle session DynBlk sans `perchsize` suit le même plafond automatique de 16 Gio et est réduite si moins d’espace de support reste après `perchreserve`. Une taille virtuelle explicite DynBlk reste une demande de capacité fine et n’est limitée que par le plafond format/ABI de 512 Gio ; les fichiers de support physiques sont créés à la demande. DynBlk gère sa propre politique de mémoire de mappage sparse et n’exige pas de MiniOS pour dimensionner ce budget.

L’extension des conteneurs se fait au mieux, mais la réduction de taille n’est pas prise en charge. `perchsize` ne dimensionne pas les sessions natives ni SquashFS. Le Gestionnaire de sessions MiniOS attribue par défaut 4000 Mio aux conteneurs Raw et DynFileFS créés manuellement, et 16 Gio à DynBlk ; les variantes chiffrées utilisent les mêmes valeurs par défaut du backend. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation du stockage

Tous les backends validés doivent fournir la couche supérieure inscriptible attendue par le système de fichiers union sélectionné. Le montage d’un backend ne garantit pas à lui seul que la persistance est active. Les modes natif, DynFileFS, DynBlk et raw peuvent mettre à jour les métadonnées de session persistantes avant la validation de l’union ; SquashFS reporte cet enregistrement des métadonnées. Les modes raw, DynFileFS et DynBlk peuvent également utiliser le chiffrement LUKS2. L’état protégé du démarrage en cours n’est publié qu’après confirmation de l’utilisation de la couche supérieure attendue par l’union racine finale.

| Backend | Représentation persistante | Modèle de capacité | Exigences du stockage sous-jacent | Couche LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Fichiers et répertoires directement dans le dossier de session numéroté | Utilise directement l’espace du système de fichiers sous-jacent ; `perchsize` non applicable | Système de fichiers inscriptible validé par le test de comportement POSIX | Non |
| `dynfilefs` | Format-400 `changes.dat` plus fichiers segments exposant un ext4 `virtual.dat` | Charge utile légère avec un index dense de la taille de la capacité | Stockage inscriptible POSIX, FAT32, NTFS ou exFAT | Oui |
| `dynblk` | Format-1 `volumeNNN.db` fichiers exposant `/dev/dynblkN`, avec ext4 au-dessus | Bloc virtuel léger avec mappages dynamiques clairsemés | Système de fichiers accepté par le backend noyau DynBlk et ressources backend suffisantes | Oui |
| `raw` | Fichier unique de taille fixe `changes.img` contenant ext4 | Le fichier est créé à la taille logique demandée ; extension uniquement | Système de fichiers inscriptible capable de contenir l’image ; FAT32 est limité à 4000 Mio | Oui |
| `squashfs` | Snapshot `changes.sb` compressé ; la couche supérieure inscriptible est reconstruite à l’exécution dans RAM | La taille du snapshot dépend des modifications capturées ; `perchsize` non applicable | Les snapshots existants peuvent être lus depuis des supports inscriptibles compatibles, mais l’enregistrement exact nécessite un système de fichiers intermédiaire compatible POSIX | Non |

### Natif

Le mode natif enregistre directement le contenu modifiable de l’union dans le répertoire de session numéroté. Il n’y a ni image interne, ni périphérique loop, ni conteneur FUSE, ni système de fichiers en bloc séparé, ainsi la capacité dépend uniquement de l’espace libre sur le système de fichiers sous-jacent et `perchsize` n’est donc pas concernée. Ce mode offre la surcharge de conteneur la plus faible et préserve la visibilité normale des fichiers pour la récupération et la sauvegarde.

MiniOS exclut d’abord les systèmes de fichiers non POSIX connus, comme FAT, exFAT et NTFS. Il teste ensuite le comportement réel du système de fichiers en créant un fichier et un lien symbolique, puis en vérifiant les modifications du mode exécutable. Si le test réussit, le répertoire de session numéroté est monté directement en tant que zone modifiable. Si le système de fichiers est reconnu comme inadapté ou si le test POSIX échoue, le mode natif bascule vers DynFileFS. En cas d’échec après l’activation du mode natif, le processus est annulé ; un nouveau candidat vide est supprimé dès qu’il peut l’être en toute sécurité.

La couche de persistance LUKS2 MiniOS ne s’applique pas au mode natif, car celui-ci ne possède ni conteneur ni frontière de périphérique bloc à chiffrer. La persistance native peut néanmoins résider sur un stockage chiffré en dehors de cette couche de persistance.

### DynFileFS

DynFileFS est le backend de conteneur format-400 basé sur FUSE. Il expose une seule image logique `virtual.dat` tout en stockant les données dans `changes.dat` ainsi que des fichiers de segments numérotés. L'assistant doit monter avec succès et exposer `virtual.dat` ; sinon, l'activation échoue au lieu de créer accidentellement un fichier uniquement RAM avec un nom qui semble persistant.

Son index de mappage est dense par rapport à la capacité logique déclarée : chaque bloc logique de 4 Kio possède un offset de 8 octets. Cela représente environ 2 Mio d'index RAM par Gio de capacité virtuelle, et à peu près la même quantité est stockée dans les index des segments de sauvegarde, même avant l'écriture des données utiles. L'allocation du payload reste dynamique. Comme le binaire initrd statique est en i686, MiniOS applique également une limite de taille logique tenant compte de RAM et un plafond strict de 2 000 000 Mio, juste en dessous du point de défaillance de l'espace d'adressage testé.

L'image logique contient ext4. Les images existantes sont vérifiées avant le montage en écriture ; si le résultat du contrôle du système de fichiers dépasse le statut « erreurs corrigées », la session est refusée au lieu d'être montée en écriture. Le redimensionnement est limité à l'agrandissement, et le système de fichiers ext4 interne est étendu lorsque c'est possible. Pour le diagnostic côté utilisateur, voir [Dépannage](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Le `dynblk` mode est un backend de bloc de périphérique noyau, distinct de DynFileFS. Chaque session numérotée possède un espace de noms `volume000.db` avec création à la demande des `volume001.db` jusqu’aux `volume063.db` homologues. Attacher un volume via `/dev/dynblk-control` retourne un périphérique disque entier alloué dynamiquement, tel que `/dev/dynblk0` ou `/dev/dynblk3` ; MiniOS doit utiliser le périphérique retourné et ne doit pas supposer que `dynblk0` est libre. Plusieurs volumes DynBlk peuvent être attachés simultanément.

MiniOS crée directement un ext4 sur le périphérique disque entier DynBlk, vérifie l’ext4 existant avant tout usage en écriture et prend en charge l’extension jusqu’à la limite format-1 de 512 Gio. La réduction n’est pas prise en charge. L’état protégé au démarrage enregistre précisément le `/dev/dynblkN` utilisé par la session persistante en cours, afin que l’arrêt détache ce même périphérique après le démontage de son système de fichiers. Cela reste correct même si le gestionnaire de sessions attache temporairement une autre session DynBlk en parallèle.

La capacité virtuelle est fine : il ne s’agit pas d’un espace hôte préalloué ni d’un mappage RAM. DynBlk conserve 128 mappages logiques de 4 Kio dans chaque bloc d’exécution de 4 Kio, donc la mémoire de mappage dense est d’environ 8 Mio/Gio. Les pointeurs d’arbre de niveau 0 résident avec ces blocs clairsemés ; l’index fixe des nœuds internes occupe 396 312 octets par périphérique attaché, et les compteurs de références de pages physiques sont alloués à la demande par blocs de 4 Kio couvrant chacun 8 Mio d’espace de stockage. Si aucun budget de mappage explicite n’est fourni, le pilote DynBlk sélectionne lui-même environ 25 % de la RAM utilisable rapportée par le noyau après normalisation à 64 Mio, plafonné à 4096 Mio. MiniOS laisse cette politique au pilote.

Un nouveau volume DynBlk peut utiliser la compression du backend sélectionnée via `perchcomp`. La compression est une propriété du format de stockage DynBlk et reste fixe pour ce volume après sa création. Si LUKS2 encapsule DynBlk, MiniOS impose la compression DynBlk à `none`, car la couche de chiffrement se situe au-dessus du périphérique DynBlk. Les écritures réelles peuvent néanmoins échouer en raison de l’espace libre du système de fichiers sous-jacent, de l’espace de noms de 64 parties, ou de l’admission du mappage DynBlk. Un périphérique défaillant ou isolé n’est détaché qu’après le démontage de son système de fichiers supérieur ; la récupération valide le format stocké lors du prochain attachement.

### Brut

Le mode Brut utilise un seul `changes.img` fichier contenant ext4. La taille du fichier est définie à la capacité logique demandée lors de la création ; contrairement aux backends dynamiques, la capacité est donc fixe jusqu’à une opération d’extension explicite. Le système de fichiers sous-jacent peut représenter de façon clairsemée les blocs non écrits, mais MiniOS considère toujours Brut comme un stockage à capacité fixe et vérifie l’espace disponible avant de créer ou d’agrandir le fichier. Comme tout est stocké dans un seul fichier hôte, FAT32 est limité à 4000 Mio.

Les images Brut existantes sont vérifiées avec `e2fsck` avant le montage en écriture. L’extension agrandit d’abord `changes.img` puis étend ext4 avec `resize2fs` ; la réduction de taille n’est pas prise en charge. En cas d’échec de vérification ou de montage, l’image est préservée pour récupération et le démarrage se poursuit dans RAM. Brut ne comporte ni démon FUSE ni métadonnées personnalisées de stockage en blocs, ce qui simplifie la récupération, mais il ne propose pas le comportement à capacité fine de DynFileFS et DynBlk.

### Couche de chiffrement LUKS

LUKS2 est une couche de chiffrement optionnelle sélectionnée avec `perchencrypt=luks` lors de la création d'une session Raw, DynFileFS ou DynBlk. Les sessions existantes conservent leur état de chiffrement à partir des métadonnées de session ; indiquer `perchencrypt` ultérieurement ne réinterprète pas et ne convertit pas une session en texte clair existante.

La limite de chiffrement dépend du backend : Raw attache `changes.img` via un périphérique loop et place LUKS2 à l'intérieur de ce fichier ; DynFileFS attache son `virtual.dat` exposé via un périphérique loop et chiffre cette image logique ; DynBlk utilise directement le `/dev/dynblkN` périphérique bloc comme source LUKS2. Dans les trois cas, MiniOS crée un ext4 à l'intérieur de `/dev/mapper/...`, de sorte que le contenu et les métadonnées du système de fichiers à l'intérieur du mapper sont chiffrés au repos. Les métadonnées du backend en dehors de la limite LUKS, les fichiers de démarrage, les métadonnées de session et les autres fichiers sur le support de persistance restent non chiffrés.

Les tailles par défaut, limites de croissance, restrictions FAT32 et le comportement d'allocation fine/fixe restent propres au backend sous-jacent. L'initrd s'authentifie avant d'étendre un backend chiffré existant, ferme le mapper avant la croissance du backend, puis le rouvre, vérifie ext4 et étend le système de fichiers avant de le monter. Pour les DynBlk chiffrés, la compression du backend est forcée à `none`.

La création demande la phrase de passe deux fois. Les sessions chiffrées existantes autorisent trois tentatives de déverrouillage sur la console de démarrage. Trois phrases de passe refusées entraînent un échec critique au démarrage : MiniOS n'effectue pas de poursuite dans RAM, ne réinterprète pas la session en texte clair, ne sélectionne pas un autre backend et ne crée pas de remplacement. Les autres échecs de création, vérification, redimensionnement ou montage conservent leur comportement de récupération spécifique au backend sans retour en texte clair. Les phrases de passe ne sont ni stockées dans les métadonnées de session ni passées en argument de commande. Les exports logiques contiennent les fichiers de session déchiffrés plutôt qu'une image backend chiffrée.

Voir [Sécurité](/maintenance-and-recovery/Security) pour la limite de protection et les considérations de sauvegarde.

### SquashFS

L’initrd active normalement une session existante SquashFS. La configuration interactive crée des métadonnées de génération zéro avec la sauvegarde à l’arrêt activée, mais ne crée pas `changes.sb` ; la couche supérieure en écriture n’existe que dans RAM jusqu’à ce que le système en cours effectue la première sauvegarde à la demande ou à l’arrêt. Une session de génération zéro n’est valide que si les champs d’artefact de l’instantané et `changes.sb` sont absents. Pour les générations ultérieures, l’activation valide des métadonnées strictes et à valeur unique pour l’instantané, y compris son empreinte, les tailles compressée et non compressée, le nombre d’entrées, le type d’union et la politique de sauvegarde. Elle vérifie également le type de fichier et la taille exacte, la mémoire disponible RAM et le swap, l’empreinte SHA-256 avant et après extraction, ainsi que la compatibilité actuelle de l’union.

L’instantané est extrait avec une gestion stricte des erreurs et des xattr dans une image ext4 temporaire et limitée dans RAM. Pour OverlayFS, cette image contient des répertoires distincts `changes` et `workdir` ; pour AUFS, sa racine est la branche en écriture.
Des métadonnées malformées, une mémoire insuffisante, des modifications d’empreinte, des erreurs d’extraction ou une politique invalide entraînent l’échec de l’activation et laissent le démarrage sur sa couche supérieure RAM habituelle.

Une session marquée `dirty` signifie que le démarrage précédent n’a pas terminé la transition d’arrêt propre. SquashFS avertit alors et restaure le dernier `changes.sb` sauvegardé avec succès ; les modifications non sauvegardées du démarrage interrompu ne constituent pas une seconde génération de restauration.

Le Gestionnaire de sessions MiniOS et le backend de sauvegarde du système créent et remplacent de façon atomique les instantanés SquashFS par capture exacte. L’activation au démarrage peut lire un instantané existant depuis un stockage FAT, exFAT ou NTFS en écriture, car l’extraction s’effectue dans la couche supérieure ext4 temporaire. La création et la sauvegarde exacte restent limitées par le système de fichiers : leur espace de préparation privé doit préserver les liens, la propriété, les modes, les xattrs, les ACL, les capacités et les whiteouts d’union, donc la sauvegarde actuelle nécessite un système de fichiers POSIX adapté.

SquashFS n’a pas de `perchsize` ; sa taille stockée correspond aux modifications capturées compressées, tandis que la mémoire utilisée à l’exécution dépend de la couche supérieure extraite en écriture. La couche de persistance LUKS MiniOS ne protège pas `changes.sb` ; si la confidentialité de l’instantané est requise, le stockage sous-jacent doit être chiffré en dehors de cette couche. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation de l’union et frontière de récupération

Pour AUFS, la racine des modifications activée devient la branche en écriture zéro. Pour OverlayFS, l’initrd construit `upperdir` et `workdir` sous la racine des modifications activée et monte les modules en lecture seule comme répertoires inférieurs. L’initrd vérifie ensuite la branche AUFS live ou OverlayFS `upperdir` avant de publier la persistance comme active.

Si un backend de persistance, une mise à jour de métadonnées ou cette vérification échoue, ses montages sont annulés si possible, aucun état de persistance réussi n’est publié, et le démarrage en écriture se poursuit dans RAM. L’échec de la construction de l’union racine lance le shell fatal de l’initramfs. Quitter ce shell peut permettre à la configuration de continuer avec une racine invalide ; ce n’est ni une réparation ni un repli sûr. AUFS conserve les ajouts de branches de modules au mieux, mais une union incomplète franchit la frontière de récupération : MiniOS ne marque pas la persistance comme active.

Les échecs de vérification de conteneur évitent délibérément de monter une session suspecte en écriture.
Ne remplacez ni ne reconstruisez les fichiers de session pendant le démarrage. Préservez d’abord le stockage concerné ; voir [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## État actif, en cours d’exécution et démarrage actuel

Dans les métadonnées de session durables, `default=` correspond à la session **active** sélectionnée pour la prochaine reprise, tandis que `running=` correspond à la session enregistrée comme ayant fourni le démarrage actuel. L’activation écrit les deux champs et marque cette session comme `dirty`.
Après la disparition des montages de persistance lors d’un arrêt propre, MiniOS supprime `running=` et marque la session comme `clean`.

Ces champs de métadonnées peuvent être obsolètes après un crash, un échec d’écriture des métadonnées, un échec de construction d’union, une copie du store ou un arrêt interrompu. Les composants d’exécution qui autorisent l’enregistrement ne se fient pas uniquement à `running=`. Ils utilisent l’état protégé de démarrage actuel de l’initrd, lié à l’ID de démarrage, à la session numérique, au mode, à l’identité réelle du store, à l’état modifiable, à la durabilité, à la génération active vérifiée et, pour DynBlk, au périphérique attaché exact.`/dev/dynblkN` Un enregistrement de démarrage actuel manquant ou défaillant signifie que la persistance ne doit pas être considérée comme une cible d’enregistrement approuvée.

Avec `toram` et une demande de persistance reconnue, le store de session est copié dans RAM avant l’activation. La session copiée peut être modifiable et alimenter la couche supérieure en cours d’exécution, mais son état de démarrage actuel est marqué comme non durable. Les modifications apportées à cette copie RAM ne sont pas répercutées sur le périphérique d’origine et sont perdues à l’arrêt.

Pour des conseils opérationnels liés, voir [Modes de démarrage](/using-minios/Boot-Modes), [Paramètres de démarrage](/reference/Boot-Parameters), [Sessions et persistance](/using-minios/Sessions-and-Persistence), [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sécurité](/maintenance-and-recovery/Security), et [Dépannage](/maintenance-and-recovery/Troubleshooting).
