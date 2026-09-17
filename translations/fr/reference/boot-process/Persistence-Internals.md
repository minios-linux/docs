---
updated: 2026-09-17
---

# Internes de la persistance

Cette page explique les paramètres de démarrage `perch`, `perchdir`, `perchmode`, `perchsize` et `perchreserve`. Ces paramètres contrôlent l’emplacement où les modifications d’une session live sont enregistrées. Pour une utilisation classique, sélectionnez une entrée persistante dans le menu de démarrage ou utilisez le Gestionnaire de sessions MiniOS plutôt que de les modifier manuellement.

MiniOS construit la racine live à partir de modules en lecture seule et d’une seule couche supérieure en écriture.
L’initrd décide si cette couche supérieure correspond à une session persistante numérotée ou à un répertoire temporaire dans RAM. Cette page décrit ce choix au démarrage et le chemin d’activation. Pour les contrôles accessibles à l’utilisateur, consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Paramètres de démarrage](/reference/Boot-Parameters).

## En termes simples

Sans paramètre de persistance, MiniOS enregistre les modifications dans RAM et les supprime à l’extinction. Un paramètre de persistance demande à MiniOS de localiser un espace de stockage en écriture, de sélectionner ou créer une session numérotée, de vérifier la compatibilité et d’utiliser cette session comme couche en écriture.

Demander la persistance ne garantit pas qu’elle soit activée. Si la cible est en lecture seule, pleine, endommagée ou incompatible, MiniOS peut continuer avec une couche temporaire RAM. Lisez l’avertissement au démarrage avant de compter sur la sauvegarde des modifications.

## Explication des paramètres

| Paramètre | Ce que cela indique MiniOS | Choix habituel |
|---|---|---|
| `perchdir=resume` | Ouvre la session compatible par défaut et, si les conditions le permettent, crée un remplacement lorsqu'elle ne peut pas être utilisée. | Travail quotidien normal. |
| `perchdir=new` | Crée une nouvelle session numérotée. | Garde un espace de travail existant inchangé. |
| `perchdir=ask` | Affiche les sessions enregistrées après avoir trouvé un stockage reprenable et vous permet d’en choisir une. Ne peut pas créer la première session sur un stockage vide. | Plusieurs espaces de travail existants sur un même appareil ; utilisez `perchdir=new` pour la première session. |
| `perchdir=NUMBER` | Demande une session numérotée spécifique. | Entrée personnalisée stable après vérification de l’ID de session. |
| `perchmode=MODE` | Sélectionnez `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. | Adaptez au système de fichiers sous-jacent et au modèle de persistance souhaité. |
| `perchencrypt=luks` | Ajoute une couche LUKS2 lors de la création d’une session Raw, DynFileFS, DynBlk ou VMDK. | Chiffre un backend de conteneur pris en charge. |
| `perchsize=SIZE` | Demande la taille d’une session de conteneur nouvelle ou en expansion. | DynFileFS, DynBlk, VMDK ou raw ; le chiffrement ne modifie pas la sémantique de taille du backend. |
| `perchcomp=CODEC` | Sélectionne la compression du backend DynBlk pour une session DynBlk nouvellement créée. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842` ; la disponibilité dépend toujours du noyau en cours d’exécution. La compression est désactivée lorsque LUKS encapsule DynBlk. |
| `perchreserve=MB` | Soustrait une marge lors du dimensionnement d’un conteneur nouveau ou en expansion et définit le seuil d’alerte d’espace faible. | Laisse de l’espace de travail lors de l’allocation d’un conteneur ; ce n’est pas un quota à l’exécution. |
| `perch` | Utilise l’ancien comportement de reprise sans création automatique de remplacement. | Compatibilité avec une entrée personnalisée existante ; privilégiez `perchdir=resume` pour les menus actuels. |

Ne combinez pas la persistance avec `toram` lorsque vous attendez que les modifications soient réécrites sur le périphérique d’origine. MiniOS active la session copiée dans RAM, et les modifications apportées à cette copie sont perdues à l’arrêt.

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

MiniOS utilise 256 Mio comme marge d’allocation par défaut et seuil d’alerte d’espace faible. Le calcul utilise des blocs de système de fichiers de 1024 octets. `perchreserve` accepte un nombre entier non signé sans unité, limité à 4096, et revient à 256 s’il est absent ou invalide. La marge réduit l’espace proposé à un conteneur nouveau ou en expansion. Ce n’est pas un quota : une session native ou des écritures ultérieures peuvent toujours consommer l’espace restant du système de fichiers. Au démarrage, une alerte s’affiche lorsque l’espace libre actuel est inférieur ou égal au seuil.

Les tailles de conteneur utilisent des valeurs entières allouées en Mio :

- Un nombre seul, `M`, ou `MB` signifie Mio.
- `G` ou `GB` multiplie le nombre par 1000 Mio.
- `T` ou `TB` multiplie le nombre par 1 000 000 Mio.
- Les conteneurs Raw sont limités à 1 000 000 Mio et à l’espace disponible après la réserve. DynFileFS possède une limite distincte tenant compte de RAM et un plafond strict de 2 000 000 Mio. DynBlk obtient sa limite de géométrie au format natif depuis `dynblk limits --format dynblk` ; MiniOS n’impose pas de plafond distinct à 512 Gio.
- Raw est un seul fichier de support, donc FAT32 le limite à 4000 Mio dans MiniOS. La même limite s’applique lorsque Raw est encapsulé dans LUKS2.
- Une nouvelle session raw utilise 4000 Mio par défaut. Le chiffrement ne crée pas de politique de taille LUKS distincte : un Raw chiffré, DynFileFS, DynBlk ou une session VMDK conserve les règles de taille de son backend sous-jacent.
- Une nouvelle session DynFileFS créée par initrd sans `perchsize` utilise jusqu’à 16 Gio de capacité logique. Si le support sous-jacent ne peut finalement pas contenir autant après `perchreserve` et la surcharge d’index DynFileFS, la valeur par défaut est réduite à la capacité disponible. Son index format-400 coûte environ 2 Mio de RAM et environ 2 Mio de stockage par Gio de capacité logique déclarée, même si la charge utile est vide. MiniOS limite donc aussi la capacité DynFileFS à partir de la capacité physique RAM et par un plafond strict testé de 2 000 000 Mio.
- Une nouvelle session DynBlk sans `perchsize` suit le même plafond automatique de 16 Gio et est réduite si moins d’espace reste après `perchreserve`. La taille explicite DynBlk est une demande de capacité fine vérifiée selon la limite du backend installé. Les métadonnées des parties déclarées sont créées initialement, mais l’espace de la charge utile grandit à la demande. DynBlk dispose d’un cache de métadonnées limité, indépendant du remplissage de la charge utile.

L’extension des conteneurs est au mieux, la réduction n’est pas prise en charge. `perchsize` ne dimensionne pas les sessions natives ou SquashFS. Le Gestionnaire de sessions MiniOS attribue par défaut 4000 Mio aux conteneurs raw et DynFileFS créés manuellement, et 16 Gio à DynBlk ; les variantes chiffrées utilisent les mêmes valeurs par défaut du backend. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation du stockage

Tous les backends valides doivent fournir la couche supérieure inscriptible attendue par le système de fichiers union sélectionné. Monter un backend ne prouve pas à lui seul que la persistance est active. Les modes natif, DynFileFS, DynBlk, VMDK et raw peuvent mettre à jour les métadonnées de session persistantes avant la validation de l’union ; SquashFS diffère cet engagement de métadonnées. Raw, DynFileFS, DynBlk et VMDK peuvent également utiliser le chiffrement LUKS2. L’état protégé du démarrage en cours n’est publié qu’après confirmation que l’union racine finale utilise bien la couche supérieure attendue.

| Backend | Représentation persistante | Modèle de capacité | Exigences de stockage sous-jacent | Couche LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Fichiers et dossiers directement dans le dossier de session numérotée | Utilise directement l’espace du système de fichiers sous-jacent ; `perchsize` non applicable | Système de fichiers inscriptible qui passe le test de comportement POSIX | Non |
| `dynfilefs` | Format-400 `changes.dat` plus fichiers de segments exposant un `virtual.dat` | Charge utile fine avec un index dense de taille équivalente à la capacité | Stockage POSIX, FAT32, NTFS ou exFAT inscriptible | Oui |
| `dynblk` | Format-1 `volumeNNN.db` fichiers exposant `/dev/dynblkN`, avec ext4 au-dessus | Bloc virtuel fin avec mappages résidents sur disque et cache limité | Système de fichiers accepté par le backend noyau DynBlk et ressources backend suffisantes | Oui |
| `raw` | Fichier unique de taille fixe `changes.img` contenant ext4 | Le fichier est créé à la taille logique demandée ; extension uniquement | Système de fichiers inscriptible capable de contenir l’image ; FAT32 limité à 4000 Mio | Oui |
| `squashfs` | Snapshot `changes.sb` compressé ; la couche supérieure inscriptible est reconstruite à l’exécution dans RAM | La taille du snapshot suit les modifications capturées ; `perchsize` non applicable | Les snapshots existants peuvent être lus depuis des supports inscriptibles pris en charge, mais l’enregistrement exact nécessite un système de fichiers de transit compatible POSIX | Non |

### Natif

Le mode natif enregistre directement le contenu modifiable de l’union dans le répertoire de session numéroté. Il n’y a ni image interne, ni périphérique loop, ni conteneur FUSE, ni système de fichiers en bloc séparé, ainsi la capacité dépend uniquement de l’espace libre sur le système de fichiers sous-jacent et `perchsize` n’est donc pas concernée. Ce mode offre la surcharge de conteneur la plus faible et préserve la visibilité normale des fichiers pour la récupération et la sauvegarde.

MiniOS exclut d’abord les systèmes de fichiers non POSIX connus, comme FAT, exFAT et NTFS. Il teste ensuite le comportement réel du système de fichiers en créant un fichier et un lien symbolique, puis en vérifiant les modifications du mode exécutable. Si le test réussit, le répertoire de session numéroté est monté directement en tant que zone modifiable. Si le système de fichiers est reconnu comme inadapté ou si le test POSIX échoue, le mode natif bascule vers DynFileFS. En cas d’échec après l’activation du mode natif, le processus est annulé ; un nouveau candidat vide est supprimé dès qu’il peut l’être en toute sécurité.

La couche de persistance LUKS2 MiniOS ne s’applique pas au mode natif, car celui-ci ne possède ni conteneur ni frontière de périphérique bloc à chiffrer. La persistance native peut néanmoins résider sur un stockage chiffré en dehors de cette couche de persistance.

### DynFileFS

DynFileFS est le backend de conteneur format-400 basé sur FUSE. Il expose une seule image logique `virtual.dat` tout en stockant les données dans `changes.dat` ainsi que des fichiers de segments numérotés. L'assistant doit monter avec succès et exposer `virtual.dat` ; sinon, l'activation échoue au lieu de créer accidentellement un fichier uniquement RAM avec un nom qui semble persistant.

Son index de mappage est dense par rapport à la capacité logique déclarée : chaque bloc logique de 4 Kio possède un offset de 8 octets. Cela représente environ 2 Mio d'index RAM par Gio de capacité virtuelle, et à peu près la même quantité est stockée dans les index des segments de sauvegarde, même avant l'écriture des données utiles. L'allocation du payload reste dynamique. Comme le binaire initrd statique est en i686, MiniOS applique également une limite de taille logique tenant compte de RAM et un plafond strict de 2 000 000 Mio, juste en dessous du point de défaillance de l'espace d'adressage testé.

L'image logique contient ext4. Les images existantes sont vérifiées avant le montage en écriture ; si le résultat du contrôle du système de fichiers dépasse le statut « erreurs corrigées », la session est refusée au lieu d'être montée en écriture. Le redimensionnement est limité à l'agrandissement, et le système de fichiers ext4 interne est étendu lorsque c'est possible. Pour le diagnostic côté utilisateur, voir [Dépannage](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Le mode `dynblk` utilise un périphérique bloc du noyau, distinct de DynFileFS. Chaque session numérotée possède `volume000.db` et tous ses homologues numérotés (`volume001.db`, ..., `volume1000.db`, et au-delà). Le format natif est `DBSPRS01`, format disque **1**. Les formats non pris en charge sont rejetés plutôt que convertis silencieusement. Veillez à faire correspondre les versions CLI et module installées.

MiniOS crée un ext4 sur tout le disque retourné par `/dev/dynblk-control`, tel que `/dev/dynblk3` ; il ne suppose pas que `dynblk0` est libre. Un ext4 existant est vérifié avant utilisation en écriture. L’état protégé du démarrage enregistre précisément ce périphérique afin que l’arrêt ne le détache qu’après la fermeture de ses utilisateurs et du système de fichiers supérieur. Plusieurs périphériques indépendants peuvent coexister.

Le Gestionnaire de sessions, l’installateur et l’initramfs interrogent `dynblk limits --format dynblk` pour obtenir la limite de géométrie du backend installé. La protection de ressources actuelle autorise 65536 parties : des plages logiques standard de 1 Gio permettent jusqu’à 64 Tio. Des limites physiques plus petites réduisent la limite virtuelle. Il s’agit d’un plafond géométrique, sans garantie que l’hôte puisse ouvrir autant de fichiers ou dispose de suffisamment de RAM/stockage. L’extension est prise en charge ; la réduction ne l’est pas.

Les tables de mappage résident sur le disque. `--map-memory-mb` contrôle un cache de métadonnées par périphérique (1 Mio par défaut, plage 1..64 Mio), ce n’est plus un pourcentage de RAM ni une limite sur les données mappées. Les descriptions d’étendue, vecteurs de fichiers ouverts et petits répertoires grandissent avec la géométrie déclarée, pas avec le remplissage de la charge utile. L’attachement scanne les métadonnées de mappage et reconstruit temporairement l’état d’allocation partie par partie ; il ne lit pas chaque charge utile. Un `dynblk check` complet lit les charges utiles. `engine_memory_bytes` exclut le cache de pages du système de fichiers, les codecs internes et autres allocations du noyau.

Les fichiers de métadonnées pour toutes les parties déclarées sont initialisés à la création/extension ; les données réelles restent fines. Les parties sont limitées à 4000 Mio. Sauvegardez l’ensemble de l’espace de noms détaché, sans supposer de nombres à trois chiffres ni de partie finale fixe. Un nouveau volume peut sélectionner la compression avec `perchcomp` ; les chargements ultérieurs utilisent le codec enregistré. LUKS2 au-dessus de DynBlk force la compression à `none`. Les écritures partielles sur des données compressées recompressent actuellement le grain de 64 Kio correspondant. Une saturation de stockage ou de ressources peut toujours provoquer l’échec des écritures ; le système de fichiers supérieur doit être démonté avant le détachement.

### Sessions VMDK

Le mode de session `vmdk` utilise le même pilote avec de vrais `twoGbMaxExtentSparse`
images. Le principal est `volume.vmdk`, avec `volume-s001.vmdk` et les suivants
parties ; chaque partie couvre jusqu’à 2 Gio d’espace logique. Le descripteur est limité
à moins de 1 Mio, donc la longueur du nom de fichier et le nombre d’étendues limitent la capacité.
Le Gestionnaire de sessions, l’Installateur et l’initramfs interrogent `dynblk limits --format vmdk`.
Le mode natif continue d’utiliser `volume000.db` ; aucun des deux modes ne réinterprète les fichiers de l’autre
mode. Les sessions gérées n’importent pas un VMDK partitionné arbitrairement en tant que
métadonnées de session.

La prise en charge des sessions VMDK est annoncée par `vmdk-session-v1` dans
`/etc/minios-initramfs-dynblk` à l’intérieur de l’initrd. Le runtime actuel et chaque
initrd source copié par l’Installateur doivent le prendre en charge. VMDK ne propose pas de compression native ;
`perchcomp` est ignoré avec un avertissement au démarrage et le Gestionnaire de sessions refuse un
codec VMDK non-`none`. LUKS reste une couche séparée optionnelle. Les deux modes publient
leur mode de session réel et le `dynblk_device`propriétaire dans l’état protégé du démarrage,
et les deux méthodes d’arrêt ferment ce périphérique après la fermeture de ses utilisateurs.

Les deux formats de pilote prennent en charge `writeback`, `writethrough`, `none`, `directsync` et les politiques d’attachement `unsafe`explicites. Les modes directs nécessitent actuellement ext2/ext4 en dessous. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` attache un système de fichiers existant ; `umount` libère le périphérique détenu par l’assistant après la fermeture de son dernier utilisateur. Un `dynblk load` manuel a une durée de vie explicite. Cela ne crée pas de système de fichiers ni ne déverrouille LUKS.

### Brut

Le mode Brut utilise un seul `changes.img` fichier contenant ext4. La taille du fichier est définie à la capacité logique demandée lors de la création ; contrairement aux backends dynamiques, la capacité est donc fixe jusqu’à une opération d’extension explicite. Le système de fichiers sous-jacent peut représenter de façon clairsemée les blocs non écrits, mais MiniOS considère toujours Brut comme un stockage à capacité fixe et vérifie l’espace disponible avant de créer ou d’agrandir le fichier. Comme tout est stocké dans un seul fichier hôte, FAT32 est limité à 4000 Mio.

Les images Brut existantes sont vérifiées avec `e2fsck` avant le montage en écriture. L’extension agrandit d’abord `changes.img` puis étend ext4 avec `resize2fs` ; la réduction de taille n’est pas prise en charge. En cas d’échec de vérification ou de montage, l’image est préservée pour récupération et le démarrage se poursuit dans RAM. Brut ne comporte ni démon FUSE ni métadonnées personnalisées de stockage en blocs, ce qui simplifie la récupération, mais il ne propose pas le comportement à capacité fine de DynFileFS et DynBlk.

### Couche de chiffrement LUKS

LUKS2 est une couche de chiffrement optionnelle sélectionnée avec `perchencrypt=luks` lors de la création d’une session Raw, DynFileFS, DynBlk ou VMDK. Les sessions existantes prennent leur état de chiffrement depuis les métadonnées de session ; spécifier `perchencrypt` ultérieurement ne réinterprète ni ne convertit une session existante en clair.

La frontière de chiffrement dépend du backend : Raw attache `changes.img` via un périphérique loop et place LUKS2 à l’intérieur de ce fichier ; DynFileFS attache son `virtual.dat` exposé via un périphérique loop et chiffre cette image logique ; DynBlk utilise directement le périphérique bloc `/dev/dynblkN` comme source LUKS2. Dans les trois cas, MiniOS crée un ext4 à l’intérieur de `/dev/mapper/...`, donc le contenu et les métadonnées du système de fichiers à l’intérieur du mapper sont chiffrés au repos. Les métadonnées backend hors du périmètre LUKS, les fichiers de démarrage, les métadonnées de session et autres fichiers sur le support de persistance restent non chiffrés.

Les valeurs par défaut de taille, limites d’extension, restrictions FAT32 et comportement d’allocation fine/fixe relèvent toujours du backend sous-jacent. L’initrd authentifie avant d’étendre un backend chiffré existant, ferme le mapper avant l’extension du backend, le rouvre ensuite, vérifie ext4 et agrandit le système de fichiers avant de le monter. Pour les DynBlk chiffrés, la compression backend est forcée à `none`.

La création demande la phrase de passe deux fois. Les sessions chiffrées existantes autorisent trois tentatives de déverrouillage sur la console de démarrage. Trois phrases de passe refusées déclenchent un arrêt critique : MiniOS n’effectue pas la suite du démarrage dans RAM, ne réinterprète pas la session en clair, ne sélectionne pas un autre backend et ne crée pas de remplacement. Les autres échecs de création, vérification, redimensionnement ou montage conservent leur comportement de récupération spécifique au backend sans retour en clair. Les phrases de passe ne sont pas stockées dans les métadonnées de session ni passées comme arguments de commande. Les exports logiques contiennent les fichiers de session déchiffrés et non une image backend chiffrée.

Voir [Sécurité](/maintenance-and-recovery/Security) pour la frontière de protection et les considérations de sauvegarde.

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

## Récupération d’espace sensible à la session

`minios-session reclaim ID` fonctionne sur les deux formats de blocs. Pour les sessions en clair
il signale les plages libres ext4 avec FITRIM, puis appelle `dynblk reclaim`.
Pour une session active, le périphérique est lié à l’état protégé du démarrage en cours et
le point de montage ext4 réel est vérifié ; la racine union n’est jamais compactée directement.
Les sessions inactives sont temporairement attachées et montées pour cette opération.

Ni le démarrage ni l’arrêt n’effectuent de compactage automatiquement. `--compact` est un
choix explicite de l’utilisateur dans la CLI ou l’option non cochée du Gestionnaire de sessions.
Sans cela, seuls le "hole punching" (là où c’est pris en charge) et la troncature de fin libre sont effectués.
La politique de discard LUKS n’est pas modifiée par la commande de session.
