---
updated: 2026-08-26
---

# Chargement des modules dans l’initrd

MiniOS sélectionne et monte son ensemble de modules dans l’initrd, avant que la racine union ne soit transmise au système d’init installé. Cette page décrit le comportement actuel de l’initrd. Cela est utile lorsqu’un module affiché sur le support de démarrage n’apparaît pas dans `noload=`, `bext=` ou `toram=trim` et modifie le démarrage de manière inattendue.

## Niveaux de candidats

Après avoir localisé le répertoire de données de MiniOS, généralement `minios/`, l’initrd analyse les modules candidats dans cet ordre :

1. Entrées situées directement dans `minios/`. Cette analyse n’est pas récursive.
2. Entrées situées récursivement sous `minios/modules/`.
3. Entrées situées récursivement sous `minios/modules/` sur la source de persistance en écriture enregistrée par l’initrd.

Le troisième niveau est distinct du répertoire `minios/modules/` dans l’arborescence de données sélectionnée en lecture seule. Il permet aux modules utilisateur persistants d’écraser des fichiers provenant d’un ISO ou d’une autre source en lecture seule. Il n’est disponible que si la découverte de la persistance a publié une racine en écriture contenant ce répertoire.

Les chemins candidats sont aplatis à leur nom de base exact lors du montage. Par exemple, `modules/work/50-extra.sb` et `modules/test/50-extra.sb` utilisent tous deux le point de montage nommé `50-extra.sb`. Ils ne deviennent pas deux couches adressables indépendamment. Un candidat d’un niveau ultérieur avec le même nom de base est monté sur le même point de montage et remplace le candidat précédent visible pour l’assemblage union. Le même nom de base doit donc être considéré comme un emplacement de remplacement unique, et non comme un moyen de charger plusieurs modules à partir de répertoires différents.

Le format normal de module est une image de système de fichiers SquashFS standard. L’analyse de l’initrd est basée sur le nom de fichier : elle sélectionne les chemins se terminant par l’extension configurée et ne vérifie pas d’abord que chaque chemin est un fichier régulier ou un SquashFS valide. Les analyses récursives peuvent donc rencontrer un autre type d’objet système de fichiers portant un nom correspondant. Un échec de montage loop ou SquashFS est signalé par `mount`, mais la boucle candidate ne rend pas cet échec fatal en soi et le démarrage peut se poursuivre avec une couche manquante. Validez les fichiers douteux avec le flux d’inspection dans [Créer des modules](/development/Creating-Modules.md).

## Ordonnancement et priorité

Lors de la découverte, les chemins sont triés numériquement par nom de base. Le nombre en tête des noms tels que `00-core.sb`, `01-kernel-VERSION.sb` et `50-extra.sb` indique l’ordre du module. Un nom de base sans nombre en tête est trié numériquement comme zéro. Utilisez des préfixes numériques explicites et distincts plutôt que de vous fier à l’ordre par égalité.

L’union finale donne la priorité aux modules ultérieurs avec un numéro plus élevé sur les modules antérieurs avec un numéro plus bas. Si deux modules sélectionnés contiennent le même chemin relatif à la racine, le fichier du module de priorité supérieure sera visible. La couche de modifications en écriture a la priorité sur tous les modules en lecture seule.

Le remplacement par niveau a lieu avant cet ordonnancement effectif des modules. Un `50-extra.sb` d’un niveau ultérieur remplace un fichier d’un niveau antérieur portant exactement le même nom de base, puis son préfixe `50` détermine où ce montage survivant appartient dans l’union.

## Extension de bundle

Le paramètre de démarrage `bext=` sélectionne l’extension de fichier utilisée pour la découverte des données, le filtrage des candidats et le montage des modules. Sa valeur par défaut est `sb`, donc le suffixe candidat habituel est `.sb` :

```text
bext=sb
```

Modifier `bext` change le suffixe de fichier sélectionné ; cela ne convertit pas un fichier ni ne vérifie son format de système de fichiers. La coordination avec le noyau est une limitation actuelle volontaire : il utilise toujours les noms `.sb` littéraux pour `01-kernel-VERSION.sb`. Un `bext` personnalisé ne renomme donc pas et ne coordonne pas le fait qu’une analyse de candidats non-`sb` ne les sélectionnera pas.

## Filtres load et noload

`load=` et `noload=` sont des expressions régulières étendues non ancrées appliquées aux chaînes de chemin candidates produites à chaque niveau. Il ne s’agit pas de listes de noms exacts. Une valeur simple comme `kernel` correspond à ce texte n’importe où dans un chemin, tandis que les ancres doivent être fournies explicitement lorsqu’une position exacte est requise. Les chemins diffèrent selon le niveau : les candidats de premier niveau sont des noms de base, les candidats de données récursives incluent `modules/`, et les candidats de persistance sont des chemins absolus.

Les virgules sont converties en alternance d’expression régulière. Par exemple :

```text
load=core,kernel,firmware
```

est évalué comme `core|kernel|firmware`. Les autres caractères d’expression régulière ne sont pas échappés.

Une plage numérique n’est développée que lorsque tout le filtre est une plage ascendante correspondant à `^[0-9]+-[0-9]+$`. Par exemple, `load=04-06` devient les alternatives `04|05|06`, chaque valeur générée étant complétée à au moins deux chiffres. Une plage intégrée dans une liste séparée par des virgules ou une autre expression n’est pas développée et conserve sa signification ERE ordinaire.

Lorsque les deux paramètres sont présents, l’initrd applique d’abord `load=`, puis supprime les correspondances avec `noload=`. Ainsi, `noload=` l’emporte. Il n’y a pas de noyau ou de module central protégé : les filtres peuvent exclure `00-core`, le `01-kernel` coordonné, ou tout autre candidat. Une telle sélection peut construire une racine incomplète ou empêcher le démarrage.

## Coordination du noyau en cours d’exécution

La version du noyau en cours d’exécution est extraite d’un jeton `vmlinuz-VERSION` sur la ligne de commande du noyau lorsqu’il est disponible, avec `uname -r` comme solution de repli. Avant de monter les modules, l’initrd coordonne ce triplet de premier niveau :

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Si un des membres manque, l’initrd recherche les trois fichiers dans :

```text
minios/kernels/VERSION/
```

Lorsque le triplet du dépôt est complet, il copie le module vers `minios/` et les fichiers de démarrage vers `minios/boot/`. Une copie partielle est nettoyée. Si le triplet n’est pas complet, la configuration du noyau retourne un échec, mais l’appelant poursuit l’étape normale de montage des modules ; le système résultant peut encore échouer plus tard si les modules userspace du noyau en cours d’exécution sont absents.

Les autres fichiers de premier niveau correspondant à `01-kernel-*.sb` sont considérés comme inactifs. L’initrd tente de déplacer chaque module inactif et ses fichiers `vmlinuz` et `initrfs` correspondants dans `minios/kernels/VERSION/`. Ces opérations de repli et de relocalisation du dépôt nécessitent une arborescence de données en écriture ; les échecs de relocalisation individuels ne sont pas fatals. Elles utilisent toujours `.sb`, quel que soit `bext=`. Voir [Gestion du noyau](/administration/Kernel-Management.md) pour les procédures d’installation et d’activation du noyau prises en charge.

## Construction de l’union

MiniOS sélectionne `AUFS` lorsque le noyau en cours d’exécution le prend en charge, sinon il utilise
OverlayFS. `union=overlayfs` sélectionne OverlayFS. `union=aufs` demande `AUFS` mais
bascule vers OverlayFS si `AUFS` n’est pas disponible.

Avec `AUFS`, l’initrd monte d’abord une union vide avec la branche des modifications en écriture,
puis insère chaque module monté comme une branche en lecture seule. Un échec lors de la création de l’union est fatal. Un échec lors de l’ajout d’une branche `AUFS` individuelle
est traité au mieux : le démarrage continue avec les branches ajoutées, tandis que l’autorité de persistance n’est pas publiée pour une union incomplète.

Avec OverlayFS, l’ensemble complet des modules est fourni comme une seule liste `lowerdir` inversée lors du montage de l’union. La couche en écriture fournit son `upperdir` et
`workdir`. Un échec de montage de cette union est fatal. L’ordre inférieur de gauche à droite et l’ordre d’insertion `AUFS` implémentent tous deux la même règle : les modules ajoutés plus tard, avec un numéro plus élevé, masquent les chemins en conflit des modules précédents.

Cette composition au démarrage est distincte de l’activation à l’exécution. Après le démarrage,
`sb activate` et `sb deactivate` ne peuvent modifier qu’une racine actuellement montée en tant que `AUFS`. Les couches inférieures OverlayFS ne peuvent pas être modifiées sur place. L’activation à l’exécution ne modifie pas la sélection Next Boot, et l’ajout d’un module Next Boot ne l’active pas dans la racine actuelle. Voir
[Gestionnaire de modules](/administration/Module-Manager.md).

## Toram trim

`toram=trim` crée une arborescence de données en RAM avant la persistance et la coordination du noyau. Il copie exactement ces éléments depuis l’arborescence de données MiniOS sélectionnée :

- `config.conf`, qui est requis par ce chemin de copie.
- `authorized_keys` lorsqu’il existe en tant que fichier régulier.
- Les candidats de premier niveau correspondant à l’extension sélectionnés par `load=` et `noload=`.
- Les candidats correspondant à l’extension sélectionnés récursivement sous `modules/`, avec leurs répertoires relatifs préservés.
- L’arborescence complète `changes/` lorsque la ligne de commande demande la persistance.

Il ne copie pas `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, les journaux, les autres données non liées aux modules, les modules non sélectionnés, ni le niveau de module de persistance en écriture distinct. En particulier, le repli du dépôt ne peut pas utiliser un répertoire `kernels/` qui a été omis de l’arborescence RAM réduite. L’ensemble de modules copié est filtré avant la découverte du niveau de module de persistance.

Il n’y a pas de vérification préalable de la capacité RAM. Un échec de copie de `config.conf` ou du `changes/` demandé termine l’exécution de la fonction de copie, mais ses appelants ne convertissent pas toujours ce statut en un arrêt propre du démarrage. Un échec de copie de `authorized_keys` est signalé mais n’arrête pas la copie. Les modules sélectionnés sont copiés via un pipeline ; un échec de copie d’un module individuel est signalé, mais son statut n’est pas toujours propagé pour arrêter le chemin de démarrage externe. Il n’y a pas de retour arrière transactionnel pour une arborescence RAM partiellement peuplée.

Après la copie, l’initrd tente de démonter le point de montage source, de supprimer son ancien chemin de données et de déplacer l’arborescence RAM dans ce chemin. Seul le succès de cette chaîne complète marque la source comme détachée. Si la chaîne échoue, le démarrage continue en utilisant le chemin de staging RAM à la place. Les opérations de détachement ISO et Ventoy associées sont réalisées au mieux. Par conséquent, `toram=trim` ne prouve pas que le périphérique de démarrage est amovible. Ne le débranchez pas sauf si le diagnostic confirme que son système de fichiers, son périphérique loop et ses mappings device-mapper ne sont plus montés ou utilisés.

## Rootcopy et la transmission de la racine

Après le montage des modules et la construction de l’union, l’initrd copie le contenu visible de `minios/rootcopy/` directement dans l’union assemblée. Le glob shell `*` omet les entrées préfixées par un point directement dans `rootcopy/`, bien que les fichiers cachés à l’intérieur d’un répertoire copié restent inclus dans cette copie de répertoire. Il s’agit d’une copie de fichiers dans la vue en écriture, et non d’une autre couche de module en lecture seule, donc elle peut écraser des chemins fournis par les modules. Les erreurs de copie ne sont pas rendues fatales par cette fonction.

MiniOS effectue ensuite sa configuration initiale, écrit le `fstab` de la nouvelle racine et source `rootcopy/run/preinit.sh` si présent, en passant le chemin de l’union comme premier argument. Ce script s’exécute dans l’environnement de l’initrd avant la transmission de la racine et doit être considéré comme du code de démarrage privilégié.

À la frontière finale, l’initrd LiveKit pivote l’union assemblée vers `/`, conserve l’ancien initrd sous `/run/initramfs` pour les tâches d’arrêt, et exécute le `init` de la nouvelle racine. Le chemin Dracut prépare la même union et laisse Dracut effectuer le `switch_root` final. Une fois cette frontière franchie, le démarrage normal s’exécute à l’intérieur de la racine composée ; modifier les fichiers sur le support de démarrage ne reconstruit plus l’ensemble des couches inférieures sélectionnées pour ce démarrage.

## Diagnostics sécurisés

Privilégiez l’inspection en lecture seule et enregistrez la ligne de commande d’origine avant de
modifier les filtres :

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` affiche la sélection actuelle basée sur les règles, tandis que `sb list` montre les couches qui composent réellement la racine en cours d’exécution. Une différence peut indiquer un échec de montage, un remplacement de nom de base, une modification `AUFS` à l’exécution, ou une source de sélection modifiée après le démarrage.

En cas d’échec précoce, ajoutez `debug` pour afficher la trace du shell, `timing` pour les temps d’exécution des étapes, ou `rd.break` pour ouvrir un shell après la configuration de l’initrd et avant la passation finale à la racine. Dans ce shell, examinez `/memory/data`, `/memory/bundles`, les montages,
et `/proc/cmdline` ; n’effectuez pas de réparation de systèmes de fichiers et ne retirez pas de supports tant qu’ils sont montés. Capturez la première erreur de montage ou de copie, pas seulement le symptôme ultérieur. Consultez
[Résolution des problèmes](/administration/Troubleshooting.md) pour un flux de diagnostic sécurisé plus large.

## Documentation associée

- [Modes de démarrage](/configuration/Boot-Modes.md)
- [Découverte du système](/configuration/Initrd-System-Discovery.md)
- [Persistance](/configuration/Initrd-Persistence.md)
- [Gestionnaire de modules](/administration/Module-Manager.md)
- [Créer des modules](/development/Creating-Modules.md)
- [Gestion du noyau](/administration/Kernel-Management.md)
- [Dépannage](/administration/Troubleshooting.md)
