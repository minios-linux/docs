---
updated: 2026-08-28
---

# Internes de la persistance

Cette page explique les paramètres de démarrage `perch`, `perchdir`, `perchmode`, `perchsize` et `perchreserve`. Ces paramètres contrôlent l’emplacement où les modifications d’une session live sont enregistrées. Pour une utilisation classique, sélectionnez une entrée persistante dans le menu de démarrage ou utilisez le Gestionnaire de sessions MiniOS plutôt que de les modifier manuellement.

MiniOS construit la racine live à partir de modules en lecture seule et d’une seule couche supérieure en écriture.
L’initrd décide si cette couche supérieure correspond à une session persistante numérotée ou à un répertoire temporaire dans RAM. Cette page décrit ce choix au démarrage et le chemin d’activation. Pour les contrôles accessibles à l’utilisateur, consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Paramètres de démarrage](/reference/Boot-Parameters).

## En termes simples

Sans paramètre de persistance, MiniOS enregistre les modifications dans RAM et les supprime à l’extinction. Un paramètre de persistance demande à MiniOS de localiser un espace de stockage en écriture, de sélectionner ou créer une session numérotée, de vérifier la compatibilité et d’utiliser cette session comme couche en écriture.

Demander la persistance ne garantit pas qu’elle soit activée. Si la cible est en lecture seule, pleine, endommagée ou incompatible, MiniOS peut continuer avec une couche temporaire RAM. Lisez l’avertissement au démarrage avant de compter sur la sauvegarde des modifications.

## Explication des paramètres

| Paramètre | Ce qu'il indique à MiniOS | Choix typique |
|---|---|---|
| `perchdir=resume` | Ouvre la session compatible par défaut et, sous conditions supportées, crée un remplacement si elle n’est pas utilisable. | Travail quotidien normal. |
| `perchdir=new` | Crée une nouvelle session numérotée. | Conserver un espace de travail existant inchangé. |
| `perchdir=ask` | Affiche les sessions sauvegardées après détection d’un stockage reprenable et permet d’en choisir une. Ne peut pas créer la première session sur un stockage vide. | Plusieurs espaces de travail existants sur un même appareil ; utilisez `perchdir=new` pour la première session. |
| `perchdir=NUMBER` | Demande une session numérotée spécifique. | Entrée de démarrage personnalisée et stable après vérification de l’ID de session. |
| `perchmode=MODE` | Sélectionne `native`, `dynfilefs`, `raw`, `luks` ou une session `squashfs` existante. | Adapter le système de fichiers du stockage et le besoin de chiffrement. |
| `perchsize=SIZE` | Demande la taille d’une session conteneur nouvelle ou en extension. | Stockage DynFileFS, raw ou LUKS. |
| `perchreserve=MB` | Soustrait une marge lors du dimensionnement d’un nouveau conteneur ou en extension et définit le seuil d’alerte d’espace faible. | Laisser de l’espace de travail lors de l’allocation d’un conteneur ; ce n’est pas un quota à l’exécution. |
| `perch` | Utilise l’ancien comportement de reprise sans création automatique de remplacement. | Compatibilité avec une entrée personnalisée existante ; privilégier `perchdir=resume` pour les menus actuels. |

Ne combinez pas la persistance avec `toram` si vous attendez que les modifications soient réécrites sur le périphérique d’origine. MiniOS active la session copiée dans RAM, et les modifications apportées à cette copie sont perdues à l’extinction.

## La persistance est explicite

L’initrd active la gestion de la persistance uniquement si la ligne de commande du noyau contient l’un de ces jetons reconnus :

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

En l’absence de ces jetons, y compris si seul un nom `perch...` non reconnu est présent, MiniOS crée une nouvelle couche supérieure en écriture dans RAM. Les modifications faites lors de ce démarrage sont supprimées à l’extinction.

Les sélecteurs ne sont pas tous équivalents :

| Sélecteur | Comportement de l’initrd |
|---|---|
| `perch` | Tente de reprendre la session par défaut selon les métadonnées. Ne crée pas automatiquement de session si aucune n’est utilisable ou si les vérifications de compatibilité échouent. |
| `perchdir=resume` | Tente la session par défaut des métadonnées et peut créer automatiquement un nouveau remplacement compatible. C’est le comportement actuel du menu de démarrage. |
| `perchdir=new` | Alloue un répertoire dont l’ID numérique est supérieur de un au plus élevé existant. Il ne réutilise jamais un répertoire existant. |
| `perchdir=ask` | Propose les sessions existantes après avoir trouvé un stockage reprenable et une valeur par défaut. Une session existante incompatible nécessite une confirmation. Sur un stockage vide, utilisez `perchdir=new` pour créer la première session. |
| `perchdir=NUMBER` | Utilise ce répertoire s’il existe. S’il n’existe pas, la sélection peut revenir à la valeur par défaut enregistrée dans les métadonnées ; il ne réserve pas le numéro demandé. |

Les autres paramètres de persistance reconnus sans sélecteur entrent dans le même chemin de reprise hérité que `perch` seul : ils demandent la persistance, mais sans création automatique. Si la sélection ou l’activation ne produit pas de couche supérieure utilisable, le démarrage se poursuit normalement avec la couche supérieure RAM et affiche un avertissement d’échec.

## Emplacement et stockage des sessions

Le stockage normal est le répertoire `changes` à côté des données MiniOS, avec des répertoires de sessions numérotées et des métadonnées `session.conf` ou `session.json` :

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Le stockage peut aussi être sélectionné comme un périphérique plus un chemin optionnel. Les formes acceptées incluent un chemin direct `/dev/...`, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` et `askdisk:custom:path`. Le suffixe délimité par deux-points devient un chemin sous le périphérique sélectionné ; la syntaxe avec slash après `askdisk` ignore silencieusement ce chemin personnalisé. Un sous-répertoire sélectionné est monté par liaison comme stockage de session. MiniOS peut également détecter une partition de persistance sur le même disque et un stockage de persistance Ventoy pris en charge.

Avant la sélection de session, l’initrd doit monter l’emplacement en écriture et prouver qu’il peut créer et supprimer un marqueur dans le stockage. Un périphérique bloc qui ne peut pas être ouvert en écriture, un montage en lecture seule, un chemin indisponible ou un test d’écriture échoué exclut la persistance pour ce démarrage. Les sessions existantes ne sont pas considérées comme fiables simplement parce que leurs fichiers sont lisibles.

## Sélection et compatibilité

Les métadonnées de session enregistrent le mode de stockage et peuvent enregistrer la version, l’édition, le système de fichiers union et la taille du conteneur MiniOS. À la reprise, le mode, la version, l’édition et le système de fichiers union enregistrés sont comparés au mode demandé et au système actuel.
Les champs de compatibilité hérités manquants ne sont pas considérés comme des incompatibilités.

L’utilisation littérale de `perchdir=resume` crée une nouvelle session numérotée si la valeur par défaut est absente ou si un mode, une version, une édition ou un système union enregistré ne correspond pas et rend la valeur par défaut inadaptée. `perch` seul, une sélection numérique directe et d’autres demandes de reprise héritées refusent la création automatique de remplacement et poursuivent dans RAM après un échec de sélection. `perchdir=ask` affiche les informations de compatibilité et permet un dépassement explicite. Une nouvelle session est par défaut en `native` sauf si un autre mode a été demandé.

Le mode de stockage fait partie de la compatibilité. Si la sélection atteint le dispatch du backend, un mode demandé inconnu revient à `native`, dont la détection peut alors choisir DynFileFS sur un stockage inadapté. Une session existante avec un mode enregistré différent peut échouer à la vérification de compatibilité précédente ; une demande de reprise héritée continue alors dans RAM au lieu d’atteindre ce repli.

## Réserve d’espace et tailles

MiniOS utilise 256 Mio comme marge d’allocation par défaut et seuil d’alerte d’espace faible. Le calcul s’effectue en blocs de système de fichiers de 1024 octets. `perchreserve` accepte un nombre entier non signé sans unité, limité à 4096, et revient à 256 s’il est absent ou invalide. La marge réduit l’espace proposé à un conteneur nouveau ou en croissance. Ce n’est pas un quota : une session native ou des écritures ultérieures peuvent toujours consommer l’espace restant du système de fichiers. Un avertissement s’affiche au démarrage lorsque l’espace libre actuel atteint ou passe sous le seuil.

Les tailles des conteneurs utilisent des valeurs entières allouées en Mio :

- Un nombre seul, `M` ou `MB` signifie Mio.
- `G` ou `GB` multiplie le nombre par 1000 Mio.
- `T` ou `TB` multiplie le nombre par 1 000 000 Mio.
- La demande logique maximale est de 1 000 000 Mio, limitée ensuite par l’espace disponible après la réserve.
- Le Gestionnaire de sessions MiniOS limite les fichiers raw et LUKS à 4000 Mio sur FAT32. Lors de l’activation par l’initrd, la limite est appliquée de façon fiable aux fichiers LUKS, tandis qu’une demande raw surdimensionnée peut atteindre l’allocation et échouer au lieu d’être réduite.
- Les nouvelles sessions raw et LUKS sont par défaut à 4000 Mio.
- Une nouvelle session DynFileFS créée par l’initrd utilise par défaut la capacité disponible après la réserve, arrondie à la baisse à un multiple de 1000 Mio si possible.

L’extension des conteneurs est réalisée au mieux, la réduction n’est pas prise en charge. `perchsize` ne dimensionne pas les sessions natives ni les sessions SquashFS. Le Gestionnaire de sessions MiniOS utilise sa propre valeur par défaut de 4000 Mio pour les nouvelles sessions conteneur ; voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation du stockage

Tous les modes réussis doivent fournir la couche supérieure en écriture attendue par le système de fichiers union sélectionné. Monter un backend ne prouve pas en soi que la persistance est active. Les modes natif, DynFileFS, raw et LUKS peuvent mettre à jour les métadonnées de session persistantes avant la validation du système union ; SquashFS diffère cet enregistrement des métadonnées. L’état protégé du démarrage en cours n’est publié qu’après confirmation que la racine finale du système union utilise bien la couche supérieure attendue.

### Natif

Le mode natif exclut d’abord les systèmes de fichiers non POSIX connus comme FAT, exFAT et NTFS. Il teste ensuite le comportement réel du système de fichiers en créant un fichier et un lien symbolique, et en vérifiant les changements de mode exécutable. Si le test réussit, le répertoire de session numéroté est monté par liaison directe comme zone en écriture.

Si le système de fichiers est reconnu comme inadapté ou si le test POSIX échoue, le mode natif bascule vers DynFileFS. Un échec après activation du mode natif est annulé ; un nouveau candidat vide est supprimé s’il peut l’être sans risque.

### DynFileFS

DynFileFS, implémenté par l’utilitaire compatible `dynblk`, stocke une image de bloc logique dans `changes.dat` ainsi que ses fichiers de segments numérotés. L’utilitaire doit monter avec succès et exposer `virtual.dat` ; sinon, l’activation échoue au lieu de créer accidentellement un fichier RAM-seulement avec un nom ressemblant à un fichier persistant.

L’image logique contient ext4. Les images existantes sont vérifiées avant montage en écriture ; des résultats de vérification de système de fichiers supérieurs au statut « erreurs corrigées » rejettent la session au lieu de la monter en écriture. Le redimensionnement ne permet que l’extension, et le système de fichiers ext4 interne est agrandi si possible. Pour le diagnostic côté utilisateur, voir [Dépannage](/maintenance-and-recovery/Troubleshooting).

### Raw

Le mode raw utilise une image ext4 `changes.img` de taille fixe. Les nouvelles images sont allouées et formatées avant utilisation. Les images existantes sont vérifiées avant montage, peuvent être agrandies si une taille supérieure est demandée, et ext4 est étendu pour utiliser toute l’image. Un échec de vérification ou de montage laisse le conteneur disponible pour récupération et poursuit le démarrage en RAM.

### LUKS

Le mode LUKS utilise un conteneur LUKS2 `changes.luks` avec ext4 directement à l’intérieur.
Il n’est disponible que si l’initrd inclut le marqueur de support cryptographique et les outils requis. La création demande une saisie de confirmation identique. Un conteneur existant autorise trois tentatives de déverrouillage sur la console de démarrage.

L’initrd authentifie avant d’agrandir un fichier chiffré existant, puis vérifie et étend ext4 avant de le monter. Si la création, le déverrouillage, la vérification, le redimensionnement ou le montage échoue, MiniOS nettoie le mapping et poursuit en RAM. Il ne bascule jamais vers natif, DynFileFS, raw ou tout autre mode persistant non chiffré.
Les mots de passe ne sont pas stockés dans les métadonnées de session ni passés comme arguments de commande.
Voir [Sécurité](/maintenance-and-recovery/Security).

### SquashFS

L’initrd ne peut activer qu’une session SquashFS existante ; il ne peut pas créer de nouveau `changes.sb`. L’activation valide des métadonnées strictes et à valeur unique pour le snapshot, incluant son empreinte, ses tailles compressée et décompressée, le nombre d’entrées, le type d’union et la politique de sauvegarde. Elle vérifie également le type de fichier et la taille exacte, la RAM et le swap disponibles, l’empreinte SHA-256 avant et après extraction, ainsi que la compatibilité actuelle de l’union.

Le snapshot est extrait avec une gestion stricte des erreurs et des xattr dans une image ext4 temporaire et limitée dans RAM. Pour OverlayFS, cette image contient des répertoires `changes` et `workdir` séparés ; pour AUFS, sa racine constitue la branche en écriture.
Des métadonnées mal formées, une mémoire insuffisante, un changement d’empreinte, des erreurs d’extraction ou une politique invalide entraînent l’échec de l’activation et laissent le démarrage sur sa couche supérieure RAM habituelle.

Une session marquée `dirty` signifie que le démarrage précédent n’a pas terminé la transition d’arrêt propre. SquashFS avertit alors et restaure le dernier `changes.sb` sauvegardé avec succès ; les modifications non enregistrées du démarrage interrompu ne constituent pas une seconde génération de retour arrière.

Le Gestionnaire de sessions MiniOS et le backend système de sauvegarde créent et remplacent de façon atomique les snapshots SquashFS en capturant exactement leur état. L’activation au démarrage peut lire un snapshot existant depuis un stockage FAT, exFAT ou NTFS en écriture, car l’extraction a lieu dans la couche supérieure ext4 temporaire. La création et la sauvegarde exacte restent conditionnées au système de fichiers : leur espace de préparation privé doit préserver les liens, propriétaires, modes, xattr, ACL, capacités et whiteouts d’union ; la sauvegarde actuelle nécessite donc un système de fichiers POSIX adapté. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Activation de l’union et frontière de récupération

Pour AUFS, la racine des modifications activée devient la branche en écriture zéro. Pour OverlayFS, l’initrd construit `upperdir` et `workdir` sous la racine des modifications activée et monte les modules en lecture seule comme répertoires inférieurs. L’initrd vérifie ensuite la branche AUFS live ou OverlayFS `upperdir` avant de publier la persistance comme active.

Si un backend de persistance, une mise à jour de métadonnées ou cette vérification échoue, ses montages sont annulés si possible, aucun état de persistance réussi n’est publié, et le démarrage en écriture se poursuit dans RAM. L’échec de la construction de l’union racine lance le shell fatal de l’initramfs. Quitter ce shell peut permettre à la configuration de continuer avec une racine invalide ; ce n’est ni une réparation ni un repli sûr. AUFS conserve les ajouts de branches de modules au mieux, mais une union incomplète franchit la frontière de récupération : MiniOS ne marque pas la persistance comme active.

Les échecs de vérification de conteneur évitent délibérément de monter une session suspecte en écriture.
Ne remplacez ni ne reconstruisez les fichiers de session pendant le démarrage. Préservez d’abord le stockage concerné ; voir [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## État actif, en cours et du démarrage actuel

Dans les métadonnées de session durables, `default=` est la session **active** sélectionnée pour la prochaine reprise, tandis que `running=` est la session enregistrée comme fournissant le démarrage en cours. L’activation écrit les deux champs et marque cette session `dirty`.
Après disparition des montages de persistance lors d’un arrêt propre, MiniOS supprime `running=` et marque la session `clean`.

Ces champs de métadonnées peuvent être obsolètes après un crash, un échec d’écriture des métadonnées, un échec de construction de l’union, une copie du stockage ou une extinction interrompue. Les composants à l’exécution qui autorisent la sauvegarde ne se fient pas à `running=` seul. Ils utilisent l’état protégé du démarrage en cours de l’initrd, lié à l’ID de démarrage, à la session numérique, au mode, à l’identité réelle du stockage, au statut en écriture, à la durabilité et à la génération active vérifiée. Un enregistrement du démarrage en cours manquant ou défaillant signifie que la persistance ne doit pas être considérée comme une cible de sauvegarde approuvée.

Avec `toram` et une demande de persistance reconnue, le stockage de session est copié dans RAM avant activation. La session copiée peut être en écriture et fournir la couche supérieure en cours d’utilisation, mais son état de démarrage actuel est marqué comme non durable. Les modifications apportées à cette copie RAM ne retournent pas sur le périphérique d’origine et sont perdues à l’extinction.

Pour des conseils opérationnels associés, voir [Modes de démarrage](/using-minios/Boot-Modes), [Paramètres de démarrage](/reference/Boot-Parameters), [Sessions et persistance](/using-minios/Sessions-and-Persistence), [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sécurité](/maintenance-and-recovery/Security) et [Dépannage](/maintenance-and-recovery/Troubleshooting).
