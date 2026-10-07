---
updated: 2026-10-06
---

# Internes de la persistance

Cette page explique les `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, et `perchtoram` paramètres de démarrage. Ces paramètres déterminent où les modifications d'une session live sont enregistrées, comment une nouvelle session est créée, et si le stockage de session pris en charge est copié dans RAM. Pour une utilisation normale, sélectionnez une entrée persistante dans le menu de démarrage ou utilisez le Gestionnaire de sessions MiniOS au lieu de les modifier manuellement.

MiniOS construit la racine live à partir de modules en lecture seule et d'une couche supérieure en écriture.
L'initrd décide si cette couche supérieure est une session persistante numérotée ou un répertoire temporaire dans RAM. Cette page décrit cette décision et le chemin d'activation au démarrage. Pour les contrôles destinés à l'utilisateur, voir [Modes de démarrage](/using-minios/Boot-Modes) et [Paramètres de démarrage](/reference/Boot-Parameters).

## En termes simples

Sans paramètre de persistance, MiniOS place les modifications dans RAM et les supprime à l'arrêt. Un paramètre de persistance demande à MiniOS de localiser un espace de stockage en écriture, de sélectionner ou créer une session numérotée, de vérifier la compatibilité et d'utiliser cette session comme couche en écriture.

Demander la persistance ne garantit pas qu'elle soit activée. Si la cible est en lecture seule, pleine, endommagée ou incompatible, MiniOS peut continuer avec une couche temporaire RAM. Lisez l'avertissement de démarrage avant de compter sur la sauvegarde des modifications.

## Explication des paramètres

| Paramètre | Ce que cela indique à MiniOS | Choix habituel |
|---|---|---|
| `perchdir=resume` | Ouvre la session compatible par défaut et, si les conditions le permettent, crée un remplacement si elle ne peut pas être utilisée. | Utilisation quotidienne normale. |
| `perchdir=setup` | Permet de choisir de façon interactive le backend de persistance et ses options de chiffrement/compression, puis crée une nouvelle session numérotée. | Entrée **Démarrer une nouvelle session** du menu de démarrage actuelle. |
| `perchdir=new` | Crée directement une nouvelle session numérotée en utilisant le `perchmode` demandé/par défaut, le chiffrement, la compression et la taille, sans afficher le sélecteur de backend. | Entrées de démarrage automatisées ou expertes avec options de stockage déjà définies. |
| `perchdir=ask` | Affiche les sessions enregistrées et vous permet d’en choisir une. Si aucun enregistrement n’est présent, le sélecteur lance le même processus de configuration que `perchdir=setup`. | Plusieurs espaces de travail sur un même appareil, y compris une première configuration interactive sur un stockage vide. |
| `perchdir=NUMBER` | Demander une session numérotée spécifique. | Entrée de démarrage personnalisée et stable après vérification de l’ID de session. |
| `perchmode=MODE` | Sélectionner `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. | Adapter le système de fichiers sous-jacent et le modèle de persistance souhaité. |
| `perchencrypt=luks` | Ajoute une couche LUKS2 lors de la création d’une session Raw, DynFileFS, DynBlk ou VMDK. | Chiffrer un backend de conteneur pris en charge. |
| `perchsize=SIZE` | Demander la taille d’une session conteneur nouvelle ou en extension. | DynFileFS, DynBlk, VMDK ou raw ; le chiffrement ne modifie pas la sémantique de taille du backend. |
| `perchcomp=CODEC` | Sélectionner la compression du backend DynBlk pour une session DynBlk nouvellement créée. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842` ; la disponibilité dépend toujours du noyau utilisé. La compression est désactivée lorsque LUKS encapsule DynBlk. |
| `perchreserve=MB` | Soustraire une marge lors du dimensionnement d’un conteneur nouveau ou en extension et définir le seuil d’alerte d’espace faible. | Réserver de l’espace de travail lors de l’allocation d’un conteneur ; il ne s’agit pas d’un quota à l’exécution. |
| `perch` | Utiliser l’ancien comportement de reprise sans création automatique de remplacement. | Compatibilité avec une entrée personnalisée existante ; privilégier `perchdir=resume` pour les menus actuels. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Gérer la copie de la persistance indépendamment du système `toram`. | `off` conserve le magasin d’origine actif ; `trim` copie uniquement la session prise en charge sélectionnée ; `full` copie toutes les sessions conteneur/SquashFS prises en charge. |

Lorsque la persistance est demandée, le système `toram` rend `perchtoram=trim` le choix par défaut sauf si un mode de persistance-RAM explicite est fourni. Sans système `toram`, la persistance reste sur le stockage par défaut. Une session copiée n’est pas durable pendant l’exécution, mais le gestionnaire de session actuel peut explicitement enregistrer l’état pris en charge par RAM sur le magasin d’origine ou le publier comme une nouvelle session lorsque le magasin d’origine est disponible et correspond à son identité au démarrage.

## La persistance est explicite

L'initrd active la gestion de la persistance uniquement si la ligne de commande du noyau contient l'un de ces jetons reconnus :

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Sans aucun de ces jetons, y compris lorsqu'un nom `perch...` non reconnu est présent, MiniOS crée une nouvelle couche supérieure en écriture dans RAM. Les modifications apportées lors de ce démarrage sont supprimées à l'arrêt.

Les sélecteurs ne sont pas tous équivalents :

| Sélecteur | Comportement de l'initrd |
|---|---|
| `perch` | Tente de reprendre la valeur par défaut des métadonnées. Il ne crée pas automatiquement de session si aucune n'est utilisable ou si les vérifications de compatibilité échouent. |
| `perchdir=resume` | Tente la valeur par défaut des métadonnées et peut créer automatiquement un nouveau remplacement compatible. Il s'agit du comportement actuel de reprise du menu de démarrage. |
| `perchdir=setup` | Ouvre d'abord le sélecteur de backend, enregistre le backend/chiffrement/compression sélectionné, puis suit le chemin d'allocation de nouvelle session. |
| `perchdir=new` | Alloue un répertoire dont l'identifiant numérique est supérieur de un au plus élevé existant. Il ne réutilise jamais un répertoire existant et n'ouvre pas le sélecteur de backend. |
| `perchdir=ask` | Propose les sessions existantes si présentes ; une session existante incompatible nécessite une confirmation. S'il n'y a pas de session par défaut sur le stockage, il passe à `setup` pour permettre la création interactive de la première session. |
| `perchdir=NUMBER` | Utilise ce répertoire s'il existe. S'il n'existe pas, la sélection peut revenir à la valeur par défaut enregistrée dans les métadonnées ; il ne réserve pas le numéro demandé. |

D'autres paramètres de persistance reconnus sans sélecteur suivent le même chemin de reprise hérité que `perch` : ils demandent la persistance, mais n'autorisent pas la création automatique. Si la sélection ou l'activation ne produit pas de couche supérieure utilisable, le démarrage continue normalement avec la couche supérieure RAM et affiche un avertissement d'échec.

## Emplacement et stockage des sessions

Le stockage normal est le répertoire `changes` à côté des données MiniOS, avec des répertoires de session numérotés et `session.conf` ou `session.json` métadonnées :

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Le stockage peut aussi être sélectionné comme un périphérique avec un chemin optionnel. Les formes acceptées incluent un chemin direct `/dev/...` , `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, et `askdisk:custom:path`. Le suffixe délimité par deux-points devient un chemin sous le périphérique sélectionné ; la syntaxe slash après `askdisk` ignore silencieusement ce chemin personnalisé. Un sous-répertoire sélectionné est monté en bind comme stockage de session. MiniOS peut également détecter une partition de persistance sur le même disque et un stockage de persistance Ventoy pris en charge.

Avant la sélection de session, l'initrd doit monter l'emplacement en écriture et prouver qu'il peut créer et supprimer un marqueur dans le stockage. Un périphérique bloc qui ne peut pas être ouvert en écriture, un montage en lecture seule, un chemin indisponible ou un test d'écriture échoué exclut la persistance pour ce démarrage. Les sessions existantes ne sont pas considérées comme fiables uniquement parce que leurs fichiers sont lisibles.

## Sélection et compatibilité

Les métadonnées de session enregistrent le mode de stockage et peuvent enregistrer la version MiniOS, l'édition, le système de fichiers union et la taille du conteneur. La reprise compare le mode, la version, l'édition et l'union enregistrés avec le mode demandé et le système actuel.
Les champs de compatibilité hérités manquants ne sont pas considérés comme des incompatibilités.

Littéral `perchdir=resume` crée une nouvelle session numérotée si sa valeur par défaut est absente ou si un mode, une version, une édition ou une union enregistrés ne correspondent pas et rendent cette valeur par défaut inadaptée. Un `perch` simple, une sélection numérique directe et d'autres demandes de reprise héritées refusent le remplacement automatique et continuent dans RAM après un échec de sélection. `perchdir=ask` affiche les informations de compatibilité et permet un forçage explicite. Une nouvelle session utilise par défaut `native` sauf si un autre mode a été demandé.

Le mode de stockage fait partie de la compatibilité. Si la sélection atteint la distribution du backend, un mode demandé inconnu revient à `native`, dont la détection peut alors sélectionner DynFileFS sur un stockage inadapté. Une session existante avec un mode enregistré différent peut échouer à la vérification de compatibilité précédente ; une demande de reprise héritée continue alors dans RAM au lieu d'atteindre ce repli.

## Réserve d'espace et tailles

MiniOS utilise 256 Mio comme marge d'allocation par défaut et seuil d'alerte d'espace faible. Le calcul s'effectue en blocs de système de fichiers de 1024 octets. `perchreserve` accepte un nombre entier non signé sans unité, est plafonné à 4096, et revient à 256 s'il est absent ou invalide. La marge réduit l'espace offert à un conteneur nouveau ou en extension. Il ne s'agit pas d'un quota : une session native ou des écritures ultérieures peuvent toujours consommer l'espace restant du système de fichiers. Un avertissement s'affiche si l'espace libre actuel est inférieur ou égal au seuil.

Les tailles de conteneur utilisent des valeurs entières allouées en Mio :

- Un nombre seul, `M`, ou `MB` signifie Mio.
- `G` ou `GB` multiplie le nombre par 1000 Mio.
- `T` ou `TB` multiplie le nombre par 1 000 000 Mio.
- Les conteneurs Raw sont limités à 1 000 000 Mio et par l'espace disponible après la réserve. DynFileFS a une limite distincte tenant compte de RAM et un plafond strict de 2 000 000 Mio. DynBlk obtient sa limite de géométrie au format natif depuis `dynblk limits --format dynblk` ; MiniOS n'impose pas de plafond séparé à 512 Gio.
- Raw est un seul fichier de support, donc FAT32 le limite à 4000 Mio dans MiniOS. La même limite s'applique lorsque Raw est encapsulé dans LUKS2.
- Une nouvelle session raw utilise par défaut 4000 Mio. Le chiffrement ne crée pas de politique de taille LUKS séparée : un Raw chiffré, DynFileFS, DynBlk ou une session VMDK conserve les règles de taille de son backend sous-jacent.
- Une nouvelle session DynFileFS créée par l'initrd sans `perchsize` utilise jusqu'à 16 Gio de capacité logique. Si le stockage sous-jacent ne peut finalement pas contenir autant après `perchreserve` et la surcharge d'index DynFileFS, la valeur par défaut est réduite à la capacité disponible. Son index format-400 coûte environ 2 Mio de RAM et environ 2 Mio de stockage par Gio de capacité logique déclarée, même si la charge utile est vide. MiniOS limite donc aussi la capacité DynFileFS à partir du stockage physique RAM et par un plafond strict testé de 2 000 000 Mio.
- Une nouvelle session DynBlk sans `perchsize` suit le même plafond automatique de 16 Gio et est réduite si moins d'espace reste après `perchreserve`. La taille explicite DynBlk est une demande de capacité fine vérifiée par rapport à la limite du backend installé. Les métadonnées des parties déclarées sont créées initialement, mais l'espace de la charge utile croît à la demande. DynBlk possède un cache de métadonnées borné indépendant du remplissage de la charge utile.

La croissance du conteneur est au mieux, la réduction n'est pas prise en charge. `perchsize` ne dimensionne pas les sessions natives ou SquashFS. Le Gestionnaire de sessions MiniOS attribue par défaut 4000 Mio aux conteneurs raw et DynFileFS créés manuellement, et 16 Gio aux conteneurs DynBlk/VMDK ; les variantes chiffrées utilisent les mêmes valeurs par défaut du backend. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation du stockage

Tous les backends réussis doivent fournir la couche supérieure en écriture attendue par le système de fichiers union sélectionné. Monter un backend ne prouve pas en soi que la persistance est active. Les modes natif, DynFileFS, DynBlk, VMDK et raw peuvent mettre à jour les métadonnées de session persistantes avant la validation de l'union ; SquashFS diffère cet engagement de métadonnées. Raw, DynFileFS, DynBlk et VMDK peuvent également utiliser le chiffrement LUKS2. L'état protégé du démarrage en cours n'est publié qu'après confirmation de l'utilisation de la bonne couche supérieure par l'union racine finale.

| Backend | Représentation persistante | Modèle de capacité | Exigences de stockage sous-jacent | Couche LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Fichiers et répertoires directement dans le répertoire de session numéroté | Utilise directement l'espace du système de fichiers sous-jacent ; `perchsize` non applicable | Système de fichiers en écriture qui passe la vérification POSIX | Non |
| `dynfilefs` | Format-400 `changes.dat` plus fichiers de segments exposant un `virtual.dat` | Charge utile fine avec un index dense de la taille de la capacité | Stockage POSIX, FAT32, NTFS ou exFAT en écriture | Oui |
| `dynblk` | Format-1 `volumeNNN.db` fichiers exposant `/dev/dynblkN`, avec ext4 au-dessus | Bloc virtuel fin avec index disque et cache borné | Système de fichiers accepté par le backend noyau DynBlk et suffisamment de ressources backend | Oui |
| `vmdk` | `volume.vmdk` plus segments épars `volume-sNNN.vmdk` exposés par le pilote DynBlk, avec ext4 au-dessus | Bloc virtuel split-sparse fin | Système de fichiers accepté par le backend VMDK DynBlk et la fonctionnalité `vmdk-session-v1`correspondante | Oui |
| `raw` | Fichier unique de taille fixe `changes.img` contenant ext4 | Le fichier est créé à la taille logique demandée ; extension seulement | Système de fichiers en écriture pouvant accueillir l'image ; FAT32 limité à 4000 Mio | Oui |
| `squashfs` | Snapshot `changes.sb` compressé ; la couche supérieure en écriture à l'exécution est reconstruite dans RAM | La taille du snapshot suit les modifications capturées ; `perchsize` non applicable | Les snapshots existants peuvent être lus depuis des supports en écriture pris en charge ; la sauvegarde exacte nécessite un stockage de persistance POSIX adapté | Non |

### Natif

Le mode natif stocke directement le contenu de l'union en écriture dans le répertoire de session numéroté. Il n'y a ni image interne, ni périphérique loop, ni conteneur FUSE, ni système de fichiers bloc séparé, donc la capacité suit simplement l'espace libre du système de fichiers sous-jacent et `perchsize` n'est pas applicable. Cela offre la surcharge la plus faible et préserve la visibilité des fichiers pour la récupération et la sauvegarde.

MiniOS exclut d'abord les systèmes de fichiers non POSIX connus tels que FAT, exFAT et NTFS. Il teste ensuite le comportement réel du système de fichiers en créant un fichier et un lien symbolique et en vérifiant les changements de mode exécutable. Si le test réussit, le répertoire de session numéroté est monté en bind directement comme zone en écriture. Si le système de fichiers est connu comme inadapté ou si le test POSIX échoue, le mode natif bascule vers DynFileFS. Un échec après l'activation native est annulé ; un nouveau candidat vide est supprimé s'il peut l'être en toute sécurité.

La couche de persistance LUKS2 MiniOS ne s'applique pas au mode natif car il n'y a pas de conteneur ou de périphérique bloc à chiffrer. La persistance native peut néanmoins résider sur un stockage chiffré en dehors de cette couche de persistance.

### DynFileFS

DynFileFS est le backend de conteneur format-400 basé sur FUSE. Il expose une image logique `virtual.dat` tout en stockant les données dans `changes.dat` plus des fichiers de segments numérotés. L'assistant doit monter avec succès et exposer `virtual.dat` ; sinon, l'activation échoue au lieu de créer accidentellement un fichier RAM-seul avec un nom persistant.

Son index de mappage est dense par rapport à la capacité logique déclarée : chaque bloc logique de 4 Kio a un offset de 8 octets. Cela représente environ 2 Mio d'index RAM par Gio de capacité virtuelle, et à peu près autant est stocké dans les index de segments même avant que les données utiles ne soient écrites. L'allocation de la charge utile reste dynamique. Comme le binaire initrd statique est i686, MiniOS applique aussi une limite de taille logique tenant compte de RAM et un plafond strict de 2 000 000 Mio sous le point d'échec de l'espace d'adressage testé.

L'image logique contient ext4. Les images existantes sont vérifiées avant le montage en écriture ; un résultat de vérification de système de fichiers supérieur au statut erreurs corrigées rejette la session au lieu de la monter en écriture. Le redimensionnement ne permet que la croissance, et le système de fichiers ext4 interne est étendu quand c'est possible. Pour le diagnostic côté utilisateur, voir [Dépannage](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Le mode `dynblk` utilise un périphérique bloc du noyau, distinct de DynFileFS. Chaque session numérotée possède `volume000.db` et tous ses frères numérotés (`volume001.db`, ..., `volume1000.db`, et au-delà). La disposition native est `DBSPRS01`, format disque **1**. Les dispositions non prises en charge sont rejetées au lieu d'être converties silencieusement. Gardez les versions CLI et module installées synchronisées.

MiniOS crée ext4 sur tout le disque retourné par `/dev/dynblk-control`, tel que `/dev/dynblk3` ; il ne suppose pas que `dynblk0` est libre. L'ext4 existant est vérifié avant utilisation en écriture. L'état protégé du démarrage enregistre ce périphérique exact afin que l'arrêt ne le détache qu'après la fermeture de ses utilisateurs et du système de fichiers supérieur. Plusieurs périphériques indépendants peuvent coexister.

Le Gestionnaire de sessions, l'installateur et l'initramfs interrogent `dynblk limits --format dynblk` pour la limite de géométrie du backend installé. La protection des ressources actuelle autorise 65536 parties : des plages logiques standard de 1 Gio permettent jusqu'à 64 Tio. Des plafonds physiques plus petits réduisent la limite virtuelle. Il s'agit d'un plafond de géométrie, pas d'une promesse que l'hôte peut ouvrir autant de fichiers ou dispose de suffisamment de RAM/stockage. La croissance est prise en charge ; la réduction ne l'est pas.

Les tables de mappage résident sur le disque. `--map-memory-mb` contrôle un cache de métadonnées par périphérique (1 Mio par défaut, plage 1..64 Mio), ce n'est plus un pourcentage de RAM ni une limite sur les données mappées. Les descriptions d'étendue, vecteurs de fichiers ouverts et petits répertoires croissent avec la géométrie déclarée, pas avec le remplissage de la charge utile. L'attachement analyse les métadonnées de mappage et reconstruit temporairement l'état d'allocation une partie à la fois ; il ne lit pas chaque charge utile. Un `dynblk check` complet lit les charges utiles. `engine_memory_bytes` exclut le cache de pages du système de fichiers, les codecs internes et autres allocations noyau.

Les fichiers de métadonnées de toutes les parties déclarées sont initialisés à la création/extension ; les données réelles restent fines. Les parties sont limitées à 4000 Mio. Sauvegardez l'ensemble de l'espace de noms détaché, sans supposer de nombres à trois chiffres ni de dernière partie fixe. Un nouveau volume peut sélectionner la compression avec `perchcomp` ; les chargements ultérieurs utilisent le codec enregistré. LUKS2 au-dessus de DynBlk force la compression à `none`. Les écritures partielles sur des données compressées recompressent actuellement le grain de 64 Kio correspondant. L'épuisement du stockage ou des ressources peut toujours entraîner l'échec des écritures ; le système de fichiers supérieur doit être démonté avant le détachement.

### Sessions VMDK

Le mode de session `vmdk` utilise le même pilote avec de vrais `twoGbMaxExtentSparse`
images. Son principal est `volume.vmdk`, avec `volume-s001.vmdk` et les suivants
parties ; chaque partie couvre jusqu'à 2 Gio d'espace logique. Le descripteur est limité
à moins de 1 Mio, donc la longueur du nom de fichier et le nombre d'étendues limitent la capacité.
Le Gestionnaire de sessions, l'installateur et l'initramfs interrogent `dynblk limits --format vmdk`.
Le mode natif continue d'utiliser `volume000.db` ; aucun des deux modes ne réinterprète les
fichiers de l'autre. Les sessions gérées n'importent pas un VMDK partitionné arbitrairement comme métadonnées de session.
comme métadonnées de session.

La prise en charge des sessions VMDK est annoncée par `vmdk-session-v1` dans
`/etc/minios-initramfs-dynblk` dans l'initrd. Le runtime actuel et chaque
initrd source copié par l'installateur doivent le prendre en charge. VMDK ne propose pas de compression native ;
`perchcomp` est ignoré avec un avertissement au démarrage et le Gestionnaire de sessions rejette un
codec VMDK non-`none`. LUKS2 reste une couche de chiffrement séparée et optionnelle. Les deux modes publient
leur mode de session réel et le `dynblk_device`propriétaire dans l'état protégé du démarrage,
et les deux implémentations d'arrêt ferment ce périphérique après la fermeture de ses utilisateurs.

Les deux formats de pilote prennent en charge `writeback`, `writethrough`, `none`, `directsync` et les politiques d'attachement explicites `unsafe`. Les modes directs nécessitent actuellement ext2/ext4 en dessous. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` attache un système de fichiers existant ; `umount` libère le périphérique géré par l'assistant après la fermeture de son dernier utilisateur. Un `dynblk load` a une durée de vie explicite. Cela ne crée pas de système de fichiers ni ne déverrouille LUKS.

### Raw

Le mode Raw utilise un seul `changes.img` fichier contenant ext4. La longueur du fichier est fixée à la capacité logique demandée lors de la création, donc contrairement aux backends dynamiques la capacité est fixe jusqu'à une opération d'extension explicite. Le système de fichiers inférieur peut représenter de façon clairsemée les étendues non écrites, mais MiniOS considère toujours Raw comme un stockage à capacité fixe et vérifie l'espace disponible avant de le créer ou de l'étendre. Comme tout est contenu dans un seul fichier hôte, FAT32 est limité à 4000 Mio.

Les images Raw existantes sont vérifiées avec `e2fsck` avant le montage en écriture. L'extension agrandit `changes.img` puis étend ext4 avec `resize2fs` ; la réduction n'est pas prise en charge. Un échec de vérification ou de montage préserve l'image pour récupération et poursuit le démarrage en RAM. Raw n'a ni démon FUSE ni métadonnées de stockage personnalisées, ce qui simplifie la récupération, mais il ne propose pas le comportement de capacité fine de DynFileFS et DynBlk.

### Couche de chiffrement LUKS

LUKS2 est une couche de chiffrement optionnelle sélectionnée avec `perchencrypt=luks` lors de la création d'une session Raw, DynFileFS, DynBlk ou VMDK. Les sessions existantes prennent leur état de chiffrement depuis les métadonnées de session ; spécifier `perchencrypt` ultérieurement ne réinterprète ni ne convertit une session existante en clair.

La limite de chiffrement dépend du backend : Raw attache `changes.img` via un périphérique loop et place LUKS2 à l'intérieur de ce fichier ; DynFileFS attache son `virtual.dat` exposé via un périphérique loop et chiffre cette image logique ; DynBlk utilise son `/dev/dynblkN` périphérique bloc directement ; VMDK utilise le périphérique bloc exposé par le même pilote DynBlk pour son image split-sparse. Dans les quatre cas, MiniOS crée ext4 à l'intérieur de `/dev/mapper/...`, de sorte que le contenu du système de fichiers et les métadonnées à l'intérieur du mapper sont chiffrés au repos. Les métadonnées du backend hors de la limite LUKS, les descripteurs VMDK, les fichiers de démarrage, les métadonnées de session et autres fichiers sur le support de persistance restent non chiffrés.

Les valeurs par défaut de taille, les limites de croissance, les restrictions FAT32 et le comportement d'allocation fine/fixe restent ceux du backend sous-jacent. L'initrd authentifie avant d'étendre un backend chiffré existant, ferme le mapper avant l'extension du backend, puis le rouvre, vérifie ext4 et étend le système de fichiers avant de le monter. Pour les DynBlk chiffrés, la compression du backend est forcée à `none`.

La création demande la phrase de passe deux fois. Les sessions chiffrées existantes autorisent trois tentatives de déverrouillage sur la console de démarrage. Trois phrases de passe rejetées déclenchent un chemin de démarrage fatal : MiniOS ne continue pas en RAM, ne réinterprète pas la session comme en clair, ne sélectionne pas un autre backend ni ne crée de remplacement. Les autres échecs de création, vérification, redimensionnement ou montage conservent leur comportement de récupération spécifique au backend sans retour en clair. Les phrases de passe ne sont pas stockées dans les métadonnées de session ni passées comme arguments de commande. Les exports logiques contiennent les fichiers de session déchiffrés et non une image backend chiffrée.

Voir [Sécurité](/maintenance-and-recovery/Security) pour la limite de protection et les considérations de sauvegarde.

### SquashFS

L'initrd active normalement une session existante SquashFS. La configuration interactive crée des métadonnées de génération zéro avec la sauvegarde à l'arrêt activée mais ne crée pas `changes.sb` ; la couche supérieure en écriture n'existe que dans RAM jusqu'à ce que le système effectue la première sauvegarde à la demande ou à l'arrêt. Une session de génération zéro n'est valide que si les champs d'artefacts de snapshot et `changes.sb` sont absents. Pour les générations ultérieures, l'activation valide des métadonnées strictes et monovaluées pour le snapshot, y compris son empreinte, ses tailles compressée et non compressée, le nombre d'entrées, le type d'union et la politique de sauvegarde. Elle vérifie aussi le type et la taille exacte du fichier, l'espace disponible RAM et le swap, l'empreinte SHA-256 avant et après extraction, et la compatibilité de l'union courante.

Le snapshot est extrait avec gestion stricte des erreurs et des xattr dans une image ext4 temporaire et bornée dans RAM. Pour OverlayFS, cette image contient des répertoires séparés `changes` et `workdir` ; pour AUFS, sa racine est la branche en écriture.
Des métadonnées malformées, une mémoire insuffisante, des changements d'empreinte, des erreurs d'extraction ou une politique invalide font échouer l'activation et laissent le démarrage sur la couche supérieure RAM ordinaire.

Une session marquée `dirty` signifie que le démarrage précédent n'a pas terminé la transition d'arrêt propre. SquashFS avertit alors et restaure le dernier `changes.sb` sauvegardé avec succès ; les modifications non sauvegardées du démarrage interrompu ne constituent pas une deuxième génération de retour arrière.

Le Gestionnaire de sessions MiniOS et le backend de sauvegarde système créent et remplacent atomiquement les snapshots SquashFS par capture exacte. L'activation au démarrage peut lire un snapshot existant depuis un stockage FAT, exFAT ou NTFS en écriture car l'extraction se fait dans la couche supérieure ext4 temporaire. La création et la sauvegarde exacte restent conditionnées au système de fichiers : le stockage de session doit permettre la création d'un espace de travail privé, les métadonnées Linux et la publication durable sur un système de fichiers POSIX adapté.

Lors de la sauvegarde, le backend capture d'abord un arbre de fichiers stable dans un stockage en mémoire privée root lorsque l'initrd fournit un tmpfs de confiance avec assez d'espace. Quand RAM est insuffisant, cet arbre utilise l'espace de travail disque précédent. Le compresseur écrit directement dans un répertoire privé mode-0700 sur le système de fichiers de session, et non dans une image RAM supplémentaire suivie d'une autre copie disque. MiniOS vérifie le résultat compressé et son identité, le synchronise, le déplace vers un nom de candidat privé, puis revalide le candidat avant de remplacer atomiquement le `changes.sb` actif. Les copies ou compressions échouées ne remplacent pas le dernier snapshot réussi.

Avec une session durable saine, `/var/log/minios` et `/var/log/live` sont montés en bind depuis `boot-logs/` dans la session numérotée. Ces diagnostics de démarrage sont donc écrits indépendamment de la couche supérieure RAM et du snapshot d'arrêt. Un démarrage dont le stockage de persistance n'a pas été activé durablement ne garantit pas que ces journaux survivront à un redémarrage. Les journaux et caches ordinaires peuvent être configurés séparément ; voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS n'a pas de `perchsize` : sa taille stockée suit les modifications capturées compressées, tandis que la mémoire à l'exécution dépend de la couche supérieure extraite. La couche de persistance LUKS MiniOS ne s'applique pas à `changes.sb` ; si la confidentialité du snapshot est requise, le stockage sous-jacent doit être chiffré en dehors de cette couche. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation de l'union et limite de récupération

Pour AUFS, la racine des modifications activée devient la branche zéro en écriture. Pour OverlayFS, l'initrd construit `upperdir` et `workdir` sous la racine des modifications activée et monte les modules en lecture seule comme répertoires inférieurs. L'initrd vérifie ensuite la branche live AUFS ou OverlayFS `upperdir` avant de déclarer la persistance active.

Si un backend de persistance, une mise à jour de métadonnées ou cette vérification échoue, ses montages sont démontés si possible, aucun état de persistance réussi n'est publié, et le démarrage en écriture se poursuit dans RAM. L'échec de la construction de l'union racine lance le shell fatal de l'initramfs. Quitter ce shell peut permettre à la configuration de continuer avec une racine invalide ; ce n'est ni une réparation ni un repli sûr. AUFS conserve les ajouts de branches de modules au mieux, mais une union incomplète franchit la limite de récupération : MiniOS ne marque pas la persistance comme active.

Les échecs de vérification de conteneur évitent délibérément de monter une session suspecte en écriture.
Ne remplacez ni ne reconstruisez les fichiers de session au démarrage. Préservez d'abord le stockage concerné ; voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## État actif, en cours et du démarrage actuel

Dans les métadonnées de session durables, `default=` est la session **active** sélectionnée pour la prochaine reprise, tandis que `running=` est la session enregistrée comme fournissant le démarrage actuel. L'activation écrit les deux champs et marque cette session comme `dirty`.
Après la disparition des montages de persistance lors d'un arrêt propre, MiniOS supprime `running=` et marque la session comme `clean`.

Ces champs de métadonnées peuvent être obsolètes après un crash, un échec d'écriture de métadonnées, un échec de construction d'union, une copie de stockage ou un arrêt interrompu. Les composants d'exécution qui permettent la sauvegarde ne font pas confiance à `running=` seul. Ils utilisent l'état protégé du démarrage actuel de l'initrd, lié à l'identifiant de démarrage, la session numérique, le mode, l'identité réelle du stockage, le statut en écriture, la durabilité, la génération active vérifiée et, pour DynBlk, le périphérique `/dev/dynblkN` exact attaché. Un enregistrement d'état de démarrage actuel manquant ou en échec signifie que la persistance ne doit pas être considérée comme une cible de sauvegarde approuvée.

Avec `perchtoram=trim` ou `full`, les conteneurs de session pris en charge sont copiés dans un tmpfs dédié avant activation. La session copiée peut être en écriture et fournir la couche supérieure en cours, mais l'état protégé du démarrage actuel la marque comme non durable et enregistre une identité `ram-origin` distincte pour le stockage d'origine. `trim` ne copie que la session prise en charge sélectionnée et les métadonnées correspondantes ; `full` copie chaque session Raw, DynFileFS, DynBlk, VMDK ou SquashFS prise en charge dans le stockage. Les sessions de répertoire natif sont exclues. Le Gestionnaire de sessions actuel utilise `ram-origin` pour retrouver le stockage d'origine par UUID de système de fichiers et peut sauvegarder explicitement la session basée sur RAM sur le stockage d'origine ou comme nouvelle session numérotée. Les modifications RAM non sauvegardées sont tout de même perdues en l'absence de sauvegarde réussie.

Pour des conseils opérationnels associés, voir [Modes de démarrage](/using-minios/Boot-Modes), [Paramètres de démarrage](/reference/Boot-Parameters), [Sessions et persistance](/using-minios/Sessions-and-Persistence), [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sécurité](/maintenance-and-recovery/Security), et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## Récupération d'espace sensible aux sessions

`minios-session reclaim ID` prend en charge les sessions DynFileFS, DynBlk et VMDK. Pour une session en clair, il exécute FITRIM sur le système de fichiers ext4 interne réel, jamais sur la racine combinée AUFS/OverlayFS, puis lance l'opération de récupération du backend de stockage propriétaire. La récupération DynFileFS nécessite DynFileFS 4.6.0 ou ultérieur.

Pour une session DynFileFS en cours, le Gestionnaire de sessions entre dans un espace de noms de montage privé de courte durée pour accéder à `virtual.dat` sous le surmontage ext4 live sans perturber le démon actif du système, le périphérique loop ou les montages union. Les périphériques DynBlk/VMDK en cours sont validés par rapport à l'état protégé du démarrage actuel. Les sessions inactives sont temporairement attachées et montées ; une session déjà montée par le Gestionnaire de sessions réutilise cet attachement existant. Un démontage occupé arrête le démontage plutôt que de déconnecter le stockage sous un système de fichiers actif.

Ni le démarrage ni l'arrêt n'exécutent la compaction automatiquement. `--compact` est un choix utilisateur explicite dans la CLI ou l'option non cochée du Gestionnaire de sessions et peut déplacer des données actives, augmentant les écritures sur la mémoire flash. Sans cela, les backends ne récupèrent que l'espace qu'ils peuvent rendre sans déplacer de données actives, comme les plages creusables ou les fins de fichiers complètement libres ; sur des systèmes de fichiers comme exFAT, les plages libérées à l'intérieur peuvent rester réutilisables dans le conteneur même si elles ne peuvent pas être restituées à l'hôte. Les sessions chiffrées ne récupèrent que l'espace déjà connu du backend et n'activent pas discrètement le discard via dm-crypt.
