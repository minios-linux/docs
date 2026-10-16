---
updated: 2026-10-15
---

# Mécanismes internes de la persistance

Cette page explique les `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, et `perchtoram` les paramètres de démarrage. Ces paramètres déterminent où sont enregistrées les modifications d’une session live, comment une nouvelle session est créée et si le stockage de session pris en charge est copié dans RAM. Pour un usage normal, sélectionnez une entrée persistante dans le menu de démarrage ou utilisez le Gestionnaire de sessions MiniOS plutôt que de modifier ces paramètres manuellement.

MiniOS construit la racine live à partir de modules en lecture seule et d’une couche supérieure accessible en écriture.
L’initrd détermine si cette couche supérieure correspond à une session persistante numérotée ou à un répertoire temporaire dans RAM. Cette page décrit cette décision prise au démarrage et le processus d’activation. Pour les commandes destinées aux utilisateurs, consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Paramètres de démarrage](/reference/Boot-Parameters).

## En termes simples

Sans paramètre de persistance, MiniOS place les modifications dans RAM et les supprime à l’arrêt. Un paramètre de persistance demande à MiniOS de localiser un espace de stockage inscriptible, de sélectionner ou de créer une session numérotée, d’en vérifier la compatibilité et d’utiliser cette session comme couche inscriptible.

Demander la persistance ne garantit pas qu’elle soit activée. Si la cible est en lecture seule, pleine, endommagée ou incompatible, MiniOS peut continuer avec une couche RAM temporaire. Consultez l’avertissement au démarrage avant de compter sur la sauvegarde des modifications.

## Explication des paramètres

| Paramètre | Ce qu’il indique MiniOS | Choix habituel |
|---|---|---|
| `perchdir=resume` | Ouvre la session compatible par défaut et, si les conditions le permettent, en crée une nouvelle lorsqu’elle ne peut pas être utilisée. | Pour un usage quotidien. |
| `perchdir=setup` | Permet de choisir de manière interactive le backend de persistance et les options de chiffrement/compression prises en charge, puis crée une nouvelle session numérotée. | Entrée actuelle du menu de démarrage**Démarrer une nouvelle session**. |
| `perchdir=new` | Crée directement une nouvelle session numérotée en utilisant le backend demandé ou par défaut`perchmode`, le chiffrement, la compression et la taille, sans afficher le sélecteur de backend. | Entrées de démarrage scriptées ou destinées aux experts, avec options de stockage déjà spécifiées. |
| `perchdir=ask` | Affiche les sessions enregistrées et vous permet d’en choisir une. Si le magasin ne contient aucune session enregistrée, le sélecteur lance le même processus de configuration que`perchdir=setup`. | Plusieurs espaces de travail sur un même appareil, y compris une première configuration interactive sur un stockage vide. |
| `perchdir=NUMBER` | Demande une session numérotée précise. | Entrée de démarrage personnalisée stable, après vérification de l’ID de session. |
| `perchmode=MODE` | Sélectionner `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. | Adaptez le choix au système de fichiers sous-jacent et au modèle de persistance souhaité. |
| `perchencrypt=luks` | Ajoute une couche LUKS2 lors de la création d’une session Raw, DynFileFS, DynBlk ou VMDK. | Chiffre un backend de conteneur pris en charge. |
| `perchsize=SIZE` | Définit la taille d’une session de conteneur nouvelle ou en cours d’agrandissement. | DynFileFS, DynBlk, VMDK ou raw ; le chiffrement ne modifie pas la sémantique de taille du backend. |
| `perchcomp=CODEC` | Sélectionne la compression du backend DynBlk pour une session DynBlk nouvellement créée. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842` ; la disponibilité dépend toujours du noyau en cours d’exécution. La compression est désactivée lorsque LUKS encapsule DynBlk. |
| `perchreserve=MB` | Déduit une marge lors du dimensionnement d’un conteneur nouveau ou en cours d’agrandissement, et définit le seuil d’alerte d’espace faible. | Réserve de l’espace libre lors de l’allocation d’un conteneur ; il ne s’agit pas d’un quota à l’exécution. |
| `perch` | Utilise l’ancien comportement de reprise, sans création automatique d’une nouvelle session de remplacement. | Pour assurer la compatibilité avec une entrée personnalisée existante ; préférez `perchdir=resume` pour les menus actuels. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Contrôle la copie des données de persistance indépendamment de la persistance du système`toram`. | `off` conserve le magasin d’origine actif ; `trim` ne copie que la session prise en charge sélectionnée ; `full` copie toutes les sessions de conteneur/SquashFS prises en charge. |

Lorsque la persistance est demandée, la persistance du système`toram` fait de`perchtoram=trim`le comportement par défaut, sauf si un mode de persistance-RAM explicite est spécifié. Sans persistance du système`toram`, la persistance reste activée sur le stockage par défaut. Une session copiée n’est pas durable pendant son exécution, mais le Session Manager actuel peut enregistrer explicitement l’état pris en charge basé sur RAM dans le magasin d’origine ou le publier sous forme de nouvelle session, si le magasin d’origine est disponible et correspond à son identité au démarrage.

## La persistance est explicite

L’initrd ne prend en charge la persistance que si la ligne de commande du noyau contient l’un des jetons reconnus suivants :

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

En l’absence de ces jetons, y compris si seul un nom inconnu `perch...` est présent, MiniOS crée une nouvelle couche supérieure inscriptible dans RAM. Les modifications apportées pendant ce démarrage sont abandonnées à l’arrêt.

Les sélecteurs ne sont pas tous équivalents :

| Sélecteur | Comportement de l’initrd |
|---|---|
| `perch` | Tente de reprendre la session par défaut définie dans les métadonnées. Ne crée pas automatiquement de session si aucune session utilisable n’existe ou si les vérifications de compatibilité échouent. |
| `perchdir=resume` | Tente de reprendre la session par défaut définie dans les métadonnées et peut créer automatiquement une nouvelle session de remplacement compatible. Il s’agit du comportement actuel de reprise du menu de démarrage. |
| `perchdir=setup` | Ouvre d’abord le sélecteur de backend, enregistre la demande de backend/chiffrement/compression sélectionnée, puis suit le processus d’allocation d’une nouvelle session. |
| `perchdir=new` | Alloue un répertoire dont l’identifiant numérique est supérieur de un au plus grand identifiant numérique existant. Ne réutilise jamais un répertoire existant et n’ouvre pas le sélecteur de backend. |
| `perchdir=ask` | Propose les sessions existantes, le cas échéant ; une session existante incompatible nécessite une confirmation. S’il n’y a ni session par défaut ni session sur le stockage, bascule vers `setup` afin de permettre la création interactive de la première session. |
| `perchdir=NUMBER` | Utilise ce répertoire s’il existe. Dans le cas contraire, la sélection peut se rabattre sur la session par défaut indiquée dans les métadonnées ; le numéro demandé n’est pas réservé. |

Les autres paramètres de persistance reconnus sans sélecteur suivent le même processus de reprise historique que `perch`: ils demandent la persistance, mais n’activent pas la création automatique. `perchtoram` seul ne constitue pas une demande de persistance. Si la sélection ou l’activation ne permet pas d’obtenir une couche supérieure utilisable, le démarrage se poursuit normalement avec la couche supérieure RAM et un avertissement d’échec est affiché.

## Stockage des sessions et emplacement

Le stockage standard se trouve dans le `changes` répertoire situé à côté des données MiniOS, avec des répertoires de session numérotés et des métadonnées `session.conf` ou `session.json` :

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Le stockage peut également être défini en sélectionnant un périphérique et, éventuellement, un chemin. Parmi les formes acceptées : un chemin `/dev/...` direct, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` et `askdisk:custom:path`. Le suffixe séparé par des deux-points devient un chemin sous le périphérique sélectionné ; la syntaxe avec des barres obliques après `askdisk` ignore silencieusement ce chemin personnalisé. Un sous-répertoire sélectionné est monté en bind comme stockage de session. MiniOS peut également détecter une partition de persistance sur le même lecteur ainsi qu’un stockage persistant Ventoy pris en charge.

Avant la sélection de la session, l’initrd doit monter l’emplacement en écriture et vérifier qu’il peut y créer puis supprimer un marqueur. Si un périphérique bloc ne peut pas être ouvert en écriture, si le montage est en lecture seule, si le chemin est indisponible ou si le test d’écriture échoue, la persistance est désactivée pour ce démarrage. Les sessions existantes ne sont pas considérées comme fiables simplement parce que leurs fichiers sont lisibles.

## Sélection et compatibilité

Les métadonnées de session enregistrent le mode de stockage et peuvent également indiquer la version MiniOS, l’édition, le système de fichiers union et la taille du conteneur. La reprise compare le mode, la version, l’édition et le système de fichiers union enregistrés au mode demandé et au système actuel.
L’absence de champs de compatibilité hérités n’est pas considérée comme une incompatibilité.

La sélection littérale `perchdir=resume` crée une nouvelle session numérotée si sa valeur par défaut est absente ou si une incompatibilité entre le mode, la version, l’édition ou le système de fichiers union enregistrés et les valeurs actuelles rend cette valeur inadaptée. La sélection sans argument `perch`, une sélection numérique directe et les autres demandes de reprise héritées refusent tout remplacement automatique et continuent dans RAM si la sélection échoue. `perchdir=ask` affiche les informations de compatibilité et permet de forcer explicitement la sélection. Une nouvelle session utilise par défaut le mode `native` sauf si un autre mode a été demandé.

Le mode de stockage fait partie des critères de compatibilité. Si la sélection atteint la phase de distribution vers le backend, un mode demandé non reconnu est remplacé par `native`, dont la détection peut sélectionner DynBlk ou DynFileFS si le stockage ne convient pas. Une session existante dont le mode enregistré diffère peut échouer au contrôle de compatibilité effectué plus tôt ; dans ce cas, une demande de reprise héritée continue dans RAM au lieu d’atteindre cette solution de repli.

### Réinitialiser une session incompatible

La sélection interactive propose **Réinitialiser en conservant les paramètres** et **Réinitialiser en conservant les données** en plus du retour à la liste ou de la poursuite explicite sans réinitialisation. La réinitialisation a lieu avant l’activation de l’union. Elle supprime les arborescences des programmes et bibliothèques système, l’état du gestionnaire de paquets système, les logiciels Flatpak/Snap installés à l’échelle du système et les caches. Les listes de fichiers des paquets aident à identifier les logiciels installés ailleurs ; les fichiers non répertoriés sont conservés par précaution.

Les deux modes conservent `/home` et `/root`, notamment les configurations masquées, les caches, les profils de navigateur et les programmes installés dans le répertoire personnel. Ils conservent également les comptes, les correspondances UID/GID, les mots de passe, les clés d’hôte SSH, les clés privées TLS et les données conservées en dehors des arborescences personnelles. Le mode qui préserve les paramètres conserve les `/etc` courants ainsi que la configuration des paquets ; le mode qui ne conserve que les données réinitialise ces paramètres système tout en préservant la configuration personnelle dans les arborescences personnelles. Cela ne permet pas d’identifier tous les programmes installés manuellement dans des emplacements quelconques.

Une nouvelle couche supérieure est préparée à côté de l’originale, ce qui nécessite suffisamment d’espace libre pour une deuxième copie des données conservées. En cas d’échec de la copie ou du remplacement, l’opération est annulée ; les transactions interrompues sont récupérées au prochain montage. La réinitialisation de SquashFS modifie uniquement sa couche supérieure RAM reconstruite : l’ancien instantané et les métadonnées de compatibilité restent ceux de référence jusqu’à l’enregistrement réussi de cette couche supérieure réinitialisée. La réinitialisation d’une session native désactive `perchtoram` pour ce démarrage afin d’éviter de remplacer les données conservées par un conteneur RAM vide. La reprise automatique ne réinitialise jamais une session sans avertissement.

## Réserve d’espace et tailles

MiniOS utilise par défaut une marge de réserve de 256 MiB et comme seuil d’avertissement de manque d’espace. Le calcul s’appuie sur des blocs de système de fichiers de 1024 octets. `perchreserve` accepte un nombre entier non signé sans unité, plafonné à 4096. En cas d’absence ou de valeur invalide, la valeur par défaut est 256. La marge réduit l’espace proposé à un nouveau conteneur ou à un conteneur en cours d’agrandissement. Il ne s’agit pas d’un quota : une session native ou des écritures ultérieures peuvent toujours utiliser l’espace restant du système de fichiers. Au démarrage, un avertissement s’affiche si l’espace libre actuel est inférieur ou égal au seuil.

Les tailles des conteneurs sont exprimées en nombres entiers alloués en MiB :

- Un nombre sans unité, `M`, ou `MB` signifie MiB.
- `G` ou `GB` multiplie le nombre par 1000 MiB.
- `T` ou `TB` multiplie le nombre par 1 000 000 MiB.
- Les conteneurs Raw sont plafonnés à 1 000 000 MiB et à l’espace disponible après déduction de la réserve. DynFileFS a une limite distincte tenant compte de RAM, ainsi qu’un plafond absolu de 2 000 000 MiB. DynBlk obtient sa limite de géométrie au format natif auprès de `dynblk limits --format dynblk`; MiniOS n’impose pas de plafond distinct de 512 Gio.
- Raw est un fichier de stockage unique : FAT32 le limite donc à 4000 MiB dans MiniOS. La même limite s’applique lorsque Raw est encapsulé dans LUKS2.
- Une nouvelle session Raw utilise par défaut une taille de 4000 MiB. Le chiffrement n’ajoute pas de politique de taille LUKS distincte : une session Raw chiffrée, DynFileFS, DynBlk ou VMDK conserve les règles de taille de son backend sous-jacent.
- Une nouvelle session DynFileFS créée par initrd sans `perchsize` utilise jusqu’à 16 Gio de capacité logique. Si le stockage sous-jacent ne peut finalement pas contenir cette quantité après `perchreserve` et la surcharge d’index DynFileFS, la valeur par défaut est réduite à la capacité disponible. Son index au format 400 consomme environ 2 MiB de RAM et environ 2 MiB de stockage sous-jacent par Gio de capacité logique déclarée, même lorsque la charge utile est vide. MiniOS limite donc aussi la capacité de DynFileFS en fonction de l’espace physique RAM et d’un plafond absolu testé de 2 000 000 MiB.
- Une nouvelle session DynBlk sans `perchsize` suit le même plafond automatique de 16 Gio et sa taille est réduite si l’espace de stockage sous-jacent restant après `perchreserve` est inférieur. Une taille DynBlk explicite correspond à une demande de capacité dynamique, vérifiée par rapport à la limite du backend installé. Les métadonnées des parties déclarées sont créées dès le départ, mais l’espace de charge utile augmente à la demande. DynBlk dispose d’un cache de métadonnées limité, indépendant du taux de remplissage de la charge utile.

L’agrandissement des conteneurs est effectué dans la mesure du possible et leur réduction n’est pas prise en charge. `perchsize` ne définit pas la taille des sessions natives ou SquashFS. Le Gestionnaire de sessions MiniOS attribue par défaut une taille de 4000 MiB aux conteneurs Raw créés manuellement et aux conteneurs DynFileFS, et de 16 Gio aux conteneurs DynBlk/VMDK ; les variantes chiffrées utilisent les mêmes valeurs par défaut que leur backend. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation du stockage

Tous les backends qui réussissent doivent fournir la couche supérieure inscriptible attendue par le système de fichiers union sélectionné. Le montage d’un backend ne suffit pas à prouver que la persistance est active. Native, DynFileFS, DynBlk, VMDK et raw peuvent mettre à jour les métadonnées de session persistantes avant la validation de l’union ; SquashFS reporte la validation de ces métadonnées. Raw, DynFileFS, DynBlk et VMDK peuvent également utiliser le chiffrement LUKS2. L’état protégé du démarrage en cours n’est publié qu’après confirmation que l’union racine finale utilise bien la couche supérieure attendue.

| Backend | Représentation persistante | Modèle de capacité | Exigences relatives au stockage sous-jacent | Couche LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Fichiers et répertoires directement dans le répertoire de session numéroté | Utilise directement l’espace du système de fichiers sous-jacent ; `perchsize` ne s’applique pas | Système de fichiers inscriptible qui réussit le test de comportement POSIX | Non |
| `dynfilefs` | Format-400 `changes.dat` plus des fichiers de segments présentant un ext4 `virtual.dat` | Charge utile légère avec un index dense de la capacité totale | Stockage POSIX, FAT32, NTFS ou exFAT inscriptible | Oui |
| `dynblk` | Fichiers Format-1 `volumeNNN.db` présentant `/dev/dynblkN`, avec ext4 par-dessus | Périphérique bloc virtuel léger avec mappages stockés sur disque et cache limité | Système de fichiers accepté par le backend noyau DynBlk et ressources backend suffisantes | Oui |
| `vmdk` | `volume.vmdk` plus des étendues éparses fractionnées `volume-sNNN.vmdk` présentées par le pilote DynBlk, avec ext4 par-dessus | Périphérique bloc virtuel léger à étendues éparses fractionnées | Système de fichiers accepté par le backend VMDK DynBlk et la `vmdk-session-v1` capacité | Oui |
| `raw` | Fichier `changes.img` de taille fixe unique contenant ext4 | Le fichier est créé à la taille logique demandée ; seule une augmentation est possible | Système de fichiers inscriptible pouvant contenir l’image ; FAT32 est limité à 4 000 Mio | Oui |
| `squashfs` | Instantané `changes.sb`compressé ; la couche supérieure d’exécution inscriptible est reconstruite dans RAM | La taille de l’instantané dépend des modifications capturées ; `perchsize` ne s’applique pas | Les instantanés existants peuvent être lus depuis les supports inscriptibles pris en charge ; leur enregistrement exact nécessite un espace de stockage persistant compatible POSIX | Non |

### Natif

Le mode natif stocke directement le contenu inscriptible de l’union dans le répertoire de session numéroté. Il n’y a ni image interne, ni périphérique loop, ni conteneur FUSE, ni système de fichiers bloc distinct : la capacité disponible dépend donc simplement de l’espace libre sur le système de fichiers sous-jacent, et `perchsize` ne s’applique pas. Ce mode entraîne le moins de surcharge liée au conteneur et préserve la visibilité habituelle des fichiers pour la récupération et la sauvegarde.

MiniOS exclut d’abord les systèmes de fichiers connus pour ne pas être compatibles POSIX, comme FAT, exFAT et NTFS. Il vérifie ensuite le comportement réel du système de fichiers en créant un fichier et un lien symbolique, puis en vérifiant les changements de mode d’exécution. Si le test réussit, le répertoire de session numéroté est directement monté par bind comme zone inscriptible. Si le stockage n’est pas adapté ou si le test échoue, la création en mode natif privilégie DynBlk si son interface en ligne de commande est disponible et que le démarrage sécurisé l’autorise ; sinon, elle privilégie DynFileFS. Ce mécanisme de repli initial ne garantit pas que le pilote sélectionné puisse se connecter ni que tous les systèmes de fichiers sous-jacents soient pris en charge. En cas d’échec après l’activation du mode natif, les modifications sont annulées ; un nouveau candidat vide est supprimé lorsque cela peut être fait en toute sécurité.

La couche de persistance LUKS2 MiniOS n’enveloppe pas le mode natif, car celui-ci ne comporte ni conteneur ni frontière de périphérique bloc à chiffrer. La persistance native peut toutefois se trouver sur un espace de stockage chiffré en dehors de cette couche de persistance.

### DynFileFS

DynFileFS est le backend de conteneurs format-400 basé sur FUSE. Il expose une seule image logique`virtual.dat` image tout en stockant les données dans`changes.dat` ainsi que dans des fichiers de segments numérotés. L’assistant doit réussir le montage et exposer`virtual.dat` ; sinon, l’activation échoue au lieu de créer accidentellement un fichier contenant uniquement RAM et portant un nom qui semble persistant.

Son index de correspondance est dense par rapport à la capacité logique déclarée : chaque bloc logique de 4 Kio possède un décalage de 8 octets. Cela représente environ 2 Mio de RAM d’index par Gio de capacité virtuelle. Une quantité à peu près équivalente est stockée dans les index des segments sous-jacents, même avant l’écriture des données utiles. L’allocation des données utiles reste dynamique. Comme le binaire initrd statique est i686, MiniOS applique également une limite de taille logique adaptée à RAM et un plafond strict de 2 000 000 Mio, inférieur au seuil de défaillance testé pour l’espace d’adressage.

L’image logique contient un système de fichiers ext4. Les images existantes sont vérifiées avant tout montage en écriture ; si le résultat de la vérification du système de fichiers indique un état supérieur à « erreurs corrigées », la session est rejetée au lieu d’effectuer un montage en écriture. Le redimensionnement ne permet que l’agrandissement, et le système de fichiers ext4 interne est agrandi lorsque cela est possible. Pour diagnostiquer les problèmes côté utilisateur, consultez la section « [Dépannage](/maintenance-and-recovery/Troubleshooting) ».

### DynBlk

Le `dynblk` mode utilise un périphérique bloc du noyau, distinct de DynFileFS. Chaque session numérotée possède `volume000.db` et tous ses éléments frères numérotés (`volume001.db`, ..., `volume1000.db`, et au-delà). La disposition native est `DBSPRS01`, le format de disque **1**. Les dispositions non prises en charge sont rejetées plutôt que converties silencieusement. Veillez à ce que les versions du CLI et du module installées correspondent.

MiniOS crée un système de fichiers ext4 sur l'ensemble du disque renvoyé par `/dev/dynblk-control`, par exemple `/dev/dynblk3` ; il ne suppose pas que `dynblk0` est libre. Le système de fichiers ext4 existant est vérifié avant toute utilisation en écriture. Les enregistrements d'état de démarrage protégés mémorisent ce périphérique exact afin qu'à l'arrêt, il ne soit détaché qu'une fois ses utilisateurs et le système de fichiers supérieur fermés. Plusieurs périphériques indépendants peuvent coexister.

Session Manager, l'installateur et l'initramfs interrogent `dynblk limits --format dynblk` pour connaître la limite géométrique du backend installé. La limite actuelle imposée par la protection des ressources est de 65536 partitions : avec des plages logiques standard de 1 Gio, la capacité maximale est de 64 Tio. Des limites plus basses du nombre de partitions physiques réduisent la limite virtuelle. Il s'agit d'un plafond géométrique, et non d'une garantie que l'hôte peut garder autant de fichiers ouverts ou dispose d'assez de RAM/stockage. L'agrandissement est pris en charge, pas la réduction.

Les tables de mappage sont stockées sur disque. `--map-memory-mb` contrôle un cache de métadonnées par périphérique (1 Mio par défaut, plage de 1 à 64 Mio) ; il ne s'agit plus d'un pourcentage de RAM ni d'une limite sur les données mappées. Les descriptions des étendues, les vecteurs de fichiers ouverts et les petits répertoires augmentent avec la géométrie déclarée, et non avec le remplissage des données utiles. Lors de l'attachement, les métadonnées de mappage sont parcourues et l'état d'allocation est temporairement reconstruit, une partition à la fois ; les données utiles ne sont pas toutes lues. Un `dynblk check` complet lit bien les données utiles. `engine_memory_bytes`exclut le cache de pages du système de fichiers, les composants internes des codecs et les autres allocations du noyau.

Les fichiers de métadonnées de toutes les partitions déclarées sont initialisés à la création ou à l'agrandissement ; les données réelles restent allouées de façon dynamique. La taille des partitions est limitée à 4000 Mio. Sauvegardez l'intégralité de l'espace de noms détaché, sans supposer que les numéros sont à trois chiffres ou que la dernière partition est toujours la même. Lors de la création, un nouveau volume peut sélectionner la compression avec `perchcomp` ; les chargements ultérieurs utilisent le codec enregistré. LUKS2 au-dessus de DynBlk impose de désactiver la compression. Les écritures partielles dans les données compressées entraînent actuellement la recompression du bloc de 64 Kio correspondant. Un manque de stockage ou de ressources peut toujours faire échouer les écritures ; le système de fichiers supérieur doit être démonté avant le détachement.`none`

### Sessions VMDK

Le mode de session `vmdk` utilise le même pilote avec de vraies `twoGbMaxExtentSparse`
images. Son fichier principal est `volume.vmdk`, avec `volume-s001.vmdk` et les
parties suivantes ; chaque partie couvre jusqu’à 2 Gio d’espace logique. Le descripteur est limité
à moins de 1 Mio, de sorte que la longueur du nom de fichier et le nombre d’étendues limitent la capacité.
Session Manager, Installer et initramfs interrogent `dynblk limits --format vmdk`.
Le format natif DynBlk continue d’utiliser `volume000.db` ; aucun des deux formats ne réinterprète les
fichiers de l’autre. Les sessions gérées n’importent pas un VMDK partitionné arbitrairement à l’extérieur
en tant que métadonnées de session.

La prise en charge des sessions VMDK est annoncée par `vmdk-session-v1` dans
`/etc/minios-initramfs-dynblk` l’initrd. L’environnement d’exécution actuel et chaque
initrd source copié par Installer doivent la prendre en charge. VMDK ne dispose pas de compression native ;
`perchcomp` est ignoré au démarrage avec un avertissement, et Session Manager rejette un codec VMDK
non-`none` VMDK. LUKS2 reste une couche de chiffrement distincte facultative. Les deux modes publient
leur mode de session réel et le `dynblk_device` associé dans l’état de démarrage protégé,
et les deux implémentations de l’arrêt ferment ce périphérique une fois que ses utilisateurs l’ont quitté.

Les deux formats de pilote prennent en charge `writeback`, `writethrough`, `none`, `directsync` et des règles explicites de `unsafe` d’attachement. Les modes directs nécessitent actuellement ext2/ext4 en dessous. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback`attache un système de fichiers existant ; `umount`libère le périphérique géré par l’assistant à la fermeture de son dernier utilisateur. Le mode manuel `dynblk load`a une durée de vie explicite. Cela ne crée pas de système de fichiers et ne déverrouille pas LUKS.

Le stockage tmpfs est pris en charge pour les deux formats avec `writeback`, `writethrough`, et `unsafe` ; les modes d’E/S directes sont rejetés plutôt que modifiés silencieusement. L’ordre des vidages ne garantit pas la persistance d’une session adossée à tmpfs après l’arrêt. Cette prise en charge permet les sessions DynBlk/VMDK RAM, dont les modifications doivent être explicitement enregistrées dans le stockage d’origine.

### Brut

Le mode brut utilise un seul `changes.img` fichier contenant ext4. À sa création, la longueur du fichier est définie sur la capacité logique demandée. Contrairement aux backends dynamiques, cette capacité reste donc fixe jusqu’à une opération d’agrandissement explicite. Le système de fichiers sous-jacent peut représenter les étendues non écrites de manière creuse, mais MiniOS considère toujours Raw comme un stockage à capacité fixe et vérifie l’espace disponible sur le support avant de le créer ou de l’agrandir. Comme tout se trouve dans un seul fichier hôte, FAT32 est limité à 4000 Mio.

Les images Raw existantes sont vérifiées avec `e2fsck` avant le montage en écriture. L’agrandissement étend `changes.img` puis agrandit ext4 avec `resize2fs` ; la réduction n’est pas prise en charge. En cas d’échec de la vérification ou du montage, l’image est préservée pour permettre sa récupération, et le démarrage se poursuit dans RAM. Raw n’utilise ni daemon FUSE ni métadonnées personnalisées de stockage par blocs, ce qui simplifie son modèle de récupération, mais ne bénéficie pas de la capacité dynamique de DynFileFS et DynBlk.

### Couche de chiffrement LUKS

LUKS2 est une couche de chiffrement facultative, sélectionnée avec `perchencrypt=luks` lors de la création d’une session Raw, DynFileFS, DynBlk ou VMDK. L’état de chiffrement des sessions existantes est déterminé par les métadonnées de session ; spécifier `perchencrypt` ultérieurement ne réinterprète ni ne convertit une session existante en clair.

La frontière de chiffrement dépend du backend : Raw attache `changes.img` via un périphérique loop et place LUKS2 dans ce fichier ; DynFileFS attache son `virtual.dat` exposé via un périphérique loop et chiffre cette image logique ; DynBlk utilise directement son périphérique bloc `/dev/dynblkN` alloué ; VMDK utilise le périphérique bloc exposé par le même pilote DynBlk pour son image sparse fractionnée. Dans les quatre cas, MiniOS crée un système de fichiers ext4 à l’intérieur de `/dev/mapper/...`, de sorte que le contenu et les métadonnées du système de fichiers dans le mappeur sont chiffrés au repos. Les métadonnées du backend situées hors de la frontière LUKS, les descripteurs VMDK, les fichiers de démarrage, les métadonnées de session et les autres fichiers du support de persistance ne sont pas chiffrés.

Les valeurs de taille par défaut, les limites de croissance, les restrictions FAT32 et le comportement d’allocation dynamique ou fixe restent propres au backend sous-jacent. L’initrd s’authentifie avant d’agrandir un backend chiffré existant, ferme le mappeur avant l’agrandissement du backend, puis le rouvre, vérifie ext4 et agrandit le système de fichiers avant de le monter. Pour les sessions DynBlk chiffrées, la compression du backend est forcée à `none`.

La création demande de saisir la phrase secrète deux fois. Pour les sessions chiffrées existantes, trois tentatives de déverrouillage sont autorisées sur la console de démarrage. Après trois phrases secrètes refusées, le démarrage suit une procédure d’échec fatale : MiniOS ne poursuit pas dans RAM, ne réinterprète pas la même session comme étant en clair, ne sélectionne pas un autre backend et n’en crée pas de remplacement. Les autres échecs liés à la création, à la vérification, au redimensionnement ou au montage conservent leur procédure de récupération propre au backend, sans basculement vers du contenu en clair. Les phrases secrètes ne sont ni stockées dans les métadonnées de session ni transmises comme arguments de commande. Les exportations logiques contiennent les fichiers de session déchiffrés, et non une image de backend chiffrée.

Voir [Sécurité](/maintenance-and-recovery/Security) pour connaître la frontière de protection et les précautions à prendre pour les sauvegardes.

### SquashFS

L’initrd active normalement une session SquashFS existante. La configuration interactive crée des métadonnées de génération zéro avec l’enregistrement activé à l’arrêt, mais ne crée pas `changes.sb` ; la couche supérieure inscriptible n’existe que dans RAM jusqu’à ce que le système en cours d’exécution effectue la première sauvegarde à la demande ou à l’arrêt. Une session de génération zéro est valide uniquement si les champs d’artefact d’instantané et `changes.sb` sont absents. Pour les générations ultérieures, l’activation valide les métadonnées strictes à valeur unique de l’instantané, notamment son empreinte, ses tailles compressée et décompressée, le nombre d’entrées, le type d’union et la stratégie d’enregistrement. Elle vérifie également le type de fichier et sa taille exacte, la mémoire RAM disponible et l’espace d’échange, l’empreinte SHA-256 avant et après l’extraction, ainsi que la compatibilité avec l’union actuelle.

L’instantané est extrait avec une gestion stricte des erreurs et des attributs étendus dans une image ext4 temporaire de taille limitée, dans RAM. Pour OverlayFS, cette image contient des répertoires `changes` et `workdir` distincts ; pour AUFS, sa racine constitue la branche inscriptible.
Des métadonnées mal formées, une mémoire insuffisante, une modification de l’empreinte, des erreurs d’extraction ou une stratégie non valide font échouer l’activation et maintiennent le démarrage sur la couche supérieure RAM habituelle.

Une session portant la marque `dirty` indique que le démarrage précédent ne s’est pas terminé par une transition d’arrêt normal. SquashFS avertit alors l’utilisateur et restaure le dernier `changes.sb` enregistré avec succès ; les modifications non enregistrées du démarrage interrompu ne constituent pas une génération de restauration supplémentaire.

Le Gestionnaire de sessions MiniOS et le backend d’enregistrement du système créent et remplacent de manière atomique les instantanés SquashFS à l’aide de la capture exacte. L’activation au démarrage peut lire un instantané existant sur un stockage FAT, exFAT ou NTFS inscriptible, car l’extraction s’effectue dans la couche supérieure ext4 temporaire. La création et l’enregistrement exact restent soumis au système de fichiers : le stockage de session doit permettre la création d’un espace de travail privé, la gestion des métadonnées Linux et une publication durable sur un système de fichiers POSIX adapté.

Pendant l’enregistrement, le backend commence par capturer une arborescence de fichiers stable dans une mémoire privée appartenant à root lorsque l’initrd fournit un tmpfs de confiance avec suffisamment d’espace disponible. Lorsque RAM est insuffisant, cette arborescence utilise plutôt l’espace de travail précédent sur disque. Le compresseur écrit directement dans un répertoire privé de mode 0700 sur le système de fichiers de session, sans créer d’image RAM supplémentaire suivie d’une autre copie sur disque. MiniOS vérifie le résultat compressé et son identité, le synchronise, le déplace vers un nom de candidat privé, puis vérifie à nouveau le candidat avant de remplacer de manière atomique l’instantané actif`changes.sb`. Les échecs de copie ou de compression ne remplacent pas le dernier instantané enregistré avec succès.

Lorsqu’une session durable fonctionne correctement, `/var/log/minios` et `/var/log/live` sont montés par liaison depuis `boot-logs/` dans la session numérotée. Ces journaux de diagnostic au démarrage sont donc enregistrés indépendamment de la couche supérieure RAM et de l’instantané d’arrêt. Un démarrage dont le stockage persistant n’a pas été activé de manière durable ne garantit pas la conservation de ces journaux après un redémarrage. Les journaux et caches ordinaires peuvent être configurés séparément ; voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS n’a pas de `perchsize` : sa taille sur le stockage dépend des modifications capturées et compressées, tandis que la mémoire utilisée à l’exécution dépend de la couche supérieure inscriptible extraite. La couche de persistance LUKS MiniOS ne chiffre pas `changes.sb` ; si la confidentialité des instantanés est nécessaire, le stockage sous-jacent doit être chiffré en dehors de cette couche. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation de l’union et seuil de récupération

Pour AUFS, la racine des modifications activée devient la branche inscriptible zéro. Pour OverlayFS, l’initrd crée `upperdir` et `workdir` sous la racine des modifications activée et monte les modules en lecture seule comme répertoires inférieurs. L’initrd vérifie ensuite la branche active AUFS ou OverlayFS `upperdir` avant d’indiquer que la persistance est active.

Si un backend de persistance, une mise à jour des métadonnées ou cette vérification échoue, les montages sont annulés dans la mesure du possible, aucun état de persistance réussi n’est publié et le démarrage inscriptible se poursuit dans RAM. L’échec de la création de l’union racine ouvre le shell fatal de l’initramfs. Quitter ce shell peut permettre à la configuration de continuer avec une racine invalide ; ce n’est ni une réparation ni une solution de repli sûre. AUFS conserve l’ajout des branches de modules dans la mesure du possible, mais une union incomplète franchit le seuil de récupération : MiniOS ne signale pas la persistance comme active.

En cas d’échec de la vérification du conteneur, le système évite délibérément de monter une session suspecte en écriture.
Ne remplacez pas et ne recréez pas les fichiers de session pendant le démarrage. Préservez d’abord le stockage concerné ; consultez [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## Ventoy Plugin de persistance

Un backend sélectionné via le plugin de persistance de Ventoy contourne la détection des sessions numérotées. MiniOS résout le mappage des périphériques de Ventoy`vtoy_persistent` et nécessite une image ext4 montée en écriture. Il utilise un répertoire `changes/` comme upper de AUFS ou `changes/` ainsi que `workdir/` pour OverlayFS. Il ne crée pas de `minios/changes/`, `session.conf`, ni de sessions numérotées dans cette image. La persistance nécessite toujours une demande de persistance reconnue ; **Démarrer sans enregistrer** reste temporaire.

La première utilisation enregistre le format de l’union dans `.minios-union`. Un autre backend d’union, un périphérique manquant, un système de fichiers incorrect, une image non inscriptible ou l’échec de l’activation de l’union génère un avertissement et crée un nouvel upper RAM. Le système ne remplace jamais l’image par une autre simplement parce que son système de fichiers porte une étiquette correspondante.

`perchdir` La sélection de session et `perchtoram` sont ignorés pour une image de plugin sélectionnée ; les modifications restent sur cette image, même avec `toram`. Le Gestionnaire de sessions et `minios-session` refusent les opérations, y compris celles visant des répertoires de session personnalisés. Sélectionnez une autre image dans Ventoy pour changer d’environnement. Sans backend de plugin sélectionné, les démarrages ordinaires de Ventoy utilisent le modèle normal de sessions numérotées de MiniOS. Voir [Ventoy](/installing-minios/installation-tools/Ventoy).

<a id="active-running-and-current-boot-state"></a>

## État actif, en cours d’exécution et du démarrage actuel

Dans les métadonnées de session persistantes, `default=` désigne la session **active** sélectionnée pour la prochaine reprise, tandis que `running=` désigne la session enregistrée comme étant à l’origine du démarrage actuel. L’activation écrit les deux champs et marque cette session comme `dirty`.
Après la disparition des points de montage persistants lors d’un arrêt normal, MiniOS supprime `running=` et marque la session comme `clean`.

Ces champs de métadonnées peuvent être obsolètes après un plantage, un échec d’écriture des métadonnées, un échec de création de l’union, une copie du magasin ou une interruption de l’arrêt. Les composants d’exécution qui autorisent l’enregistrement ne se fient pas uniquement à `running=`. Ils utilisent l’état protégé du démarrage actuel dans l’initrd, lié à l’ID de démarrage, à la session numérique, au mode, à l’identité réelle du magasin, à l’état inscriptible, à la durabilité, à la génération active vérifiée et, pour DynBlk, au périphérique `/dev/dynblkN`exactement attaché. Si l’enregistrement du démarrage actuel est absent ou invalide, la persistance ne doit pas être considérée comme une cible d’enregistrement autorisée.

Avec `perchtoram=trim` ou `full`, les conteneurs de session pris en charge sont copiés dans un tmpfs dédié avant l’activation. La copie n’est effectuée que si la mémoire disponible et l’espace libre du tmpfs couvrent les longueurs des fichiers sous-jacents, plus une réserve ; en cas d’échec, le fonctionnement sur le stockage est maintenu avec un avertissement. La session copiée peut fournir la couche supérieure inscriptible, mais l’état protégé du démarrage actuel la marque comme non durable et consigne une identité distincte pour le magasin d’origine : `ram-origin`.`trim` ne copie que la session prise en charge sélectionnée et les métadonnées correspondantes ; `full` copie toutes les sessions Raw, DynFileFS, DynBlk, VMDK ou SquashFS prises en charge présentes dans le magasin. Les données des répertoires natifs ne sont pas copiées : une demande native RAM réussie crée un nouveau conteneur DynBlk ou DynFileFS vide, sauf lors d’une réinitialisation, qui désactive la copie. Le gestionnaire de sessions actuel retrouve le magasin d’origine à l’aide de l’UUID du système de fichiers et peut enregistrer explicitement la session basée sur RAM dans ce magasin ou en tant que nouvelle session numérotée. Les modifications RAM non enregistrées sont perdues si aucune réécriture ne réussit.

Pour des instructions opérationnelles connexes, consultez [Modes de démarrage](/using-minios/Boot-Modes), [Paramètres de démarrage](/reference/Boot-Parameters), [Sessions et persistance](/using-minios/Sessions-and-Persistence), [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sécurité](/maintenance-and-recovery/Security) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## Récupération de l’espace selon la session

`minios-session reclaim ID` prend en charge DynFileFS, DynBlk et les sessions VMDK. Pour une session en texte brut, FITRIM est exécuté sur le système de fichiers ext4 interne réel, jamais sur la racine combinée AUFS/OverlayFS, puis l’opération de récupération du backend de stockage propriétaire est appelée. La récupération DynFileFS nécessite DynFileFS 4.6.0 ou une version ultérieure.

Pour une session DynFileFS en cours d’exécution, Session Manager crée un espace de noms de montage privé de courte durée afin d’accéder à `virtual.dat` sous le montage ext4 superposé actif, sans perturber le daemon actif du système, le périphérique loop ou les montages union. Les périphériques DynBlk/VMDK en cours d’exécution sont validés par rapport à l’état protégé du démarrage actuel. Les sessions inactives sont temporairement attachées et montées ; une session déjà montée par Session Manager réutilise l’attachement existant. Si le démontage échoue parce que le système de fichiers est occupé, le démontage est interrompu plutôt que de déconnecter le stockage sous un système de fichiers actif.

Ni le démarrage ni l’arrêt ne déclenchent automatiquement la compaction. `--compact` est un choix explicite de l’utilisateur dans la CLI ou dans l’option de la boîte de dialogue Session Manager, décochée par défaut, et peut déplacer des données actives, ce qui augmente le nombre d’écritures sur la mémoire flash. Sans cette option, les backends ne récupèrent que l’espace qu’ils peuvent restituer sans déplacer de données actives, par exemple les plages pouvant être libérées par hole punching ou les fins de fichier entièrement libres ; sur des systèmes de fichiers comme exFAT, les plages intérieures libérées peuvent rester réutilisables dans le conteneur même si elles ne peuvent pas être restituées au système de fichiers hôte. Les sessions chiffrées ne récupèrent que l’espace déjà connu du backend et n’activent pas silencieusement discard via dm-crypt.
