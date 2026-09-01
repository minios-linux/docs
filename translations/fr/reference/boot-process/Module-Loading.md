---
updated: 2026-08-28
---

# Chargement des modules

Cette page explique ce que modifient les paramètres de démarrage `load`, `noload`, `bext`, `union` et `toram=trim`. Ce sont des options avancées. Un démarrage classique charge automatiquement l’ensemble de modules fourni par l’image MiniOS sélectionnée.

MiniOS sélectionne et monte son ensemble de modules dans l’initrd, avant que la racine unifiée ne soit transmise au système d’initialisation installé. Utilisez cette page si un module présent sur le support de démarrage n’apparaît pas dans le système en cours d’exécution ou si un filtre modifie le démarrage de façon inattendue.

## En termes simples

MiniOS est assemblé à partir de modules `.sb` numérotés en lecture seule. Les numéros les plus bas sont chargés en premier ; les numéros plus élevés peuvent remplacer les fichiers des modules de numéro inférieur. Une session en écriture, lorsqu’elle est active, est placée au-dessus de tous les modules en lecture seule.

Les paramètres `load=` et `noload=` filtrent les chemins des modules avant l’assemblage. Ils utilisent une correspondance par expressions régulières plutôt qu’une liste de noms exacts, donc un filtre trop large peut exclure des modules essentiels du noyau ou du système de base du jeu de démarrage.

## Explication des paramètres

| Paramètre | Ce qu’il indique à MiniOS | Risque principal |
|---|---|---|
| `load=PATTERN` | Ne conserver que les modules dont le chemin correspond au motif. | Un motif incomplet peut omettre des modules nécessaires. |
| `noload=PATTERN` | Exclure les candidats correspondants après application de `load=`. | Des modules essentiels du noyau, du firmware ou du bureau peuvent être exclus au démarrage. |
| `bext=EXTENSION` | Considérer une autre extension de fichier comme suffixe de module. | Ne convertit pas les fichiers ni ne coordonne complètement les modules du noyau. |
| `union=aufs` ou `union=overlayfs` | Demander le système de fichiers utilisé pour combiner les modules avec la couche en écriture. | L’activation des modules à l’exécution diffère entre AUFS et OverlayFS. |
| `toram=trim` | Copier uniquement les modules sélectionnés et les données requises vers RAM. | Les modules et dossiers omis ne sont plus accessibles après le détachement de la source. |

Avant de modifier les filtres, enregistrez la ligne de commande et l’ensemble de modules actuels. Testez une modification à la fois et gardez une entrée de démarrage fonctionnelle à disposition.

## Niveaux de candidats

Après avoir localisé le répertoire de données MiniOS, généralement `minios/`, l’initrd scanne les modules candidats dans cet ordre :

1. Entrées directement à la racine de `minios/`. Ce scan n’est pas récursif.
2. Entrées récursivement sous `minios/modules/`.
3. Entrées récursivement sous `minios/modules/` sur la source de persistance en écriture enregistrée par l’initrd.

Le troisième niveau est distinct du répertoire `minios/modules/` dans l’arborescence de données en lecture seule sélectionnée. Il permet à des modules utilisateur persistants de remplacer des fichiers issus d’une ISO ou d’une autre source en lecture seule. Il n’est disponible que si la découverte de la persistance a publié une racine en écriture contenant ce répertoire.

Les chemins candidats sont aplatis à leur nom de base exact lors du montage. Par exemple, `modules/work/50-extra.sb` et `modules/test/50-extra.sb` utilisent tous deux le point de montage nommé `50-extra.sb`. Ils ne deviennent pas deux couches adressables indépendamment. Un candidat d’un niveau ultérieur portant le même nom de base est monté sur le même point de montage et remplace le candidat précédent visible pour l’assemblage de l’union.
Le même nom de base doit donc être considéré comme un emplacement de remplacement unique, et non comme un moyen de charger plusieurs modules depuis des répertoires différents.

Le format de module habituel est une image de système de fichiers SquashFS classique. Le scan de l’initrd est basé sur le nom de fichier : il sélectionne les chemins se terminant par l’extension configurée et ne vérifie pas d’abord que chaque chemin est bien un fichier régulier ou un SquashFS valide. Les scans récursifs peuvent donc rencontrer un autre type d’objet système de fichiers portant un nom correspondant. Un échec de montage en boucle ou de SquashFS est signalé par `mount`, mais la boucle du candidat ne rend pas cet échec fatal en soi et le démarrage peut se poursuivre avec une couche manquante. Validez les fichiers douteux avec le flux d’inspection décrit dans [Créer des modules](/preparing-and-customizing/Managing-Modules).

## Ordonnancement et priorité

Lors de la découverte, les chemins sont triés numériquement selon leur nom de base. Le numéro en tête des noms comme `00-core.sb`, `01-kernel-VERSION.sb` et `50-extra.sb` détermine l’ordre des modules. Un nom de base sans numéro en tête est classé numériquement comme zéro.
Utilisez des préfixes numériques explicites et distincts plutôt que de compter sur l’ordre d’égalité.

L’union finale donne la priorité aux modules de numéro le plus élevé sur les modules de numéro inférieur. Si deux modules sélectionnés contiennent le même chemin relatif à la racine, le fichier du module prioritaire sera visible. La couche de modifications en écriture a priorité sur tous les modules en lecture seule.

Le remplacement par niveau intervient avant cet ordonnancement effectif des modules. Un `50-extra.sb` d’un niveau ultérieur remplace un fichier d’un niveau antérieur portant exactement le même nom de base, puis son préfixe `50` détermine où ce montage survivant sera placé dans l’union.

## Extension de bundle

Le paramètre de démarrage `bext=` sélectionne l’extension de fichier utilisée pour la découverte des données, le filtrage des candidats et le montage des modules. Sa valeur par défaut est `sb`, donc le suffixe candidat habituel est `.sb` :

```text
bext=sb
```

Modifier `bext` change le suffixe de fichier sélectionné ; cela ne convertit pas un fichier ni ne vérifie son format de système de fichiers. La coordination du noyau fait exception : elle recherche toujours `01-kernel-VERSION.sb`. Avec une extension personnalisée, le scan des candidats habituel ne sélectionne pas ces modules noyau `.sb`.

## Filtres load et noload

`load=` et `noload=` sont des expressions régulières étendues non ancrées appliquées aux chaînes de chemin candidates produites à chaque niveau. Ce ne sont pas des listes de noms exacts. Une valeur simple comme `kernel` correspond à ce texte n’importe où dans un chemin, tandis que les ancres doivent être fournies explicitement si une position exacte est requise.
Les chemins diffèrent selon le niveau : les candidats de premier niveau sont des noms de base, les candidats de données récursives incluent `modules/`, et les candidats de persistance sont des chemins absolus.

Les virgules sont converties en alternance d’expression régulière. Par exemple :

```text
load=core,kernel,firmware
```

est évalué comme `core|kernel|firmware`. Les autres caractères d’expression régulière ne sont pas échappés.

Une plage numérique n’est développée que si tout le filtre est une plage ascendante correspondant à `^[0-9]+-[0-9]+$`. Par exemple, `load=04-06` devient les alternatives `04|05|06`, chaque valeur générée étant complétée à au moins deux chiffres. Une plage intégrée dans une liste séparée par des virgules ou une autre expression n’est pas développée et conserve sa signification ERE ordinaire.

Lorsque les deux paramètres sont présents, l’initrd applique d’abord `load=` puis retire les correspondances avec `noload=`. Ainsi `noload=` prévaut. Il n’y a pas de jeu de modules noyau ou système protégé : les filtres peuvent exclure `00-core`, le `01-kernel` coordonné ou tout autre candidat. Une telle sélection peut produire une racine incomplète ou empêcher le démarrage.

## Coordination du noyau en cours d’exécution

La version du noyau en cours est extraite d’un jeton `vmlinuz-VERSION` sur la ligne de commande du noyau si disponible, avec `uname -r` en secours. Avant de monter les modules, l’initrd coordonne ce triplet de premier niveau :

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Si un élément manque, l’initrd recherche les trois fichiers dans :

```text
minios/kernels/VERSION/
```

Lorsque le triplet du dépôt est complet, il copie le module vers `minios/` et les fichiers de démarrage vers `minios/boot/`. Une copie partielle est nettoyée. Si le triplet n’est pas complet, la configuration du noyau retourne une erreur, mais l’appelant poursuit l’étape normale de montage des modules. Le système résultant peut encore échouer plus tard si la racine ne contient pas les fichiers de support pour le noyau en cours d’exécution.

Les autres fichiers de premier niveau correspondant à `01-kernel-*.sb` sont considérés comme inactifs. L’initrd tente de déplacer chaque module inactif et ses fichiers `vmlinuz` et `initrfs` associés dans `minios/kernels/VERSION/`. Ces opérations de repli et de déplacement du dépôt nécessitent un arbre de données inscriptible ; les échecs individuels de déplacement ne sont pas fatals. Elles utilisent toujours `.sb`, quel que soit `bext=`. Voir [Gestion du noyau](/preparing-and-customizing/Managing-Kernels) pour les procédures d’installation et d’activation du noyau prises en charge.

## Construction de l’union

MiniOS sélectionne `AUFS` lorsque le noyau en cours d’exécution le prend en charge, sinon il utilise OverlayFS. `union=overlayfs` sélectionne OverlayFS. `union=aufs` demande `AUFS`, mais bascule sur OverlayFS si `AUFS` n’est pas disponible.

Avec `AUFS`, l’initrd monte d’abord une union vide avec la branche des modifications en écriture, puis insère chaque module monté comme une branche en lecture seule. Un échec lors de la création de l’union est fatal. Un échec lors de l’ajout d’une branche individuelle `AUFS` est traité au mieux : le démarrage se poursuit avec les branches déjà ajoutées, tandis que MiniOS ne considère pas la persistance comme active pour une union incomplète.

Avec OverlayFS, l’ensemble complet des modules est fourni sous forme d’une liste `lowerdir` inversée lors du montage de l’union. La couche en écriture fournit son `upperdir` et `workdir`. Un échec lors du montage de cette union est fatal. L’ordre inférieur de gauche à droite et l’ordre d’insertion `AUFS` appliquent tous deux la même règle : les modules ajoutés plus tard, avec un numéro plus élevé, masquent les chemins en conflit des modules précédents.

Cette composition au démarrage est distincte de l’activation à l’exécution. Après le démarrage, `sb activate` et `sb deactivate` ne peuvent modifier qu’une racine actuellement montée en `AUFS`. Les couches inférieures OverlayFS ne peuvent pas être modifiées sur place. L’activation à l’exécution n’affecte pas la sélection du prochain démarrage, et l’ajout d’un module pour le prochain démarrage ne l’active pas dans la racine actuelle. Voir [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules).

## Toram trim

`toram=trim` crée un arbre de données RAM avant la persistance et la coordination du noyau.
Il copie exactement ces éléments depuis l’arbre de données MiniOS sélectionné :

- `config.conf`, requis par ce chemin de copie.
- `authorized_keys` lorsqu’il existe en tant que fichier régulier.
- Les candidats de premier niveau correspondant à l’extension sélectionnés par `load=` et `noload=`.
- Les candidats correspondant à l’extension sélectionnés récursivement sous `modules/`, avec conservation de leur arborescence relative.
- L’arborescence complète `changes/` lorsque la ligne de commande demande la persistance.

Il ne copie pas `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, les journaux, les autres données non liées aux modules, les modules non sélectionnés, ni le niveau de module de persistance en écriture séparé. En particulier, le repli du dépôt ne peut pas utiliser un répertoire `kernels/` omis de l’arbre RAM réduit. L’ensemble de modules copié est filtré avant la découverte du niveau de module de persistance.

Il n’y a pas de pré-vérification de capacité RAM. Un échec de copie de `config.conf` ou du `changes/` demandé interrompt le contexte d’exécution de la fonction de copie, mais ses appelants ne convertissent pas toujours ce statut en arrêt propre du démarrage. Un échec de copie de `authorized_keys` est signalé mais ne stoppe pas la copie. Les modules sélectionnés sont copiés via un pipeline ; un échec de copie de module individuel est signalé, mais son statut n’est pas toujours propagé pour arrêter le chemin de démarrage externe. Il n’y a pas de retour arrière transactionnel d’un arbre RAM partiellement peuplé.

Après la copie, l’initrd tente de démonter le montage source, de supprimer son ancien chemin de données et de déplacer l’arbre RAM à cet emplacement. Seul le succès de cette chaîne complète marque la source comme détachée. Si la chaîne échoue, le démarrage se poursuit en utilisant le chemin de staging RAM. Les opérations de détachement ISO et Ventoy associées sont en mode « best effort ».
Par conséquent, `toram=trim` n’est pas une preuve que le périphérique de démarrage est amovible. Ne le débranchez pas à moins que le diagnostic ne confirme que son système de fichiers, son périphérique loop et ses mappings device-mapper ne sont plus montés ni utilisés.

## Rootcopy et transfert de la racine

Après le montage des modules et la construction de l’union, l’initrd copie le contenu visible de `minios/rootcopy/` directement dans l’union assemblée. Le glob shell `*` omet les entrées préfixées par un point directement dans `rootcopy/`, bien que les fichiers cachés à l’intérieur d’un dossier copié restent inclus dans la copie de ce dossier. Il s’agit d’une copie de fichiers dans la vue inscriptible, pas d’une nouvelle couche de module en lecture seule, donc elle peut écraser les chemins fournis par les modules. Les erreurs de copie ne sont pas rendues fatales par cette fonction.

MiniOS effectue ensuite sa configuration initiale, écrit le `fstab` de la nouvelle racine et source `rootcopy/run/preinit.sh` si présent, en passant le chemin de l’union comme premier argument. Ce script s’exécute dans l’environnement de l’initrd avant le transfert de racine et doit être traité comme un code de démarrage privilégié.

À la frontière finale, l’initrd LiveKit pivote l’union assemblée vers `/`, conserve l’ancien initrd sous `/run/initramfs` pour l’arrêt, et exécute le `init` de la nouvelle racine. Le chemin Dracut prépare la même union et laisse Dracut effectuer le `switch_root` final. Une fois cette frontière franchie, le démarrage normal s’effectue dans la racine composée ; modifier des fichiers sur le support de démarrage ne reconstruit plus l’ensemble de couches inférieures sélectionné pour ce démarrage.

## Diagnostics sûrs

Privilégiez l’inspection en lecture seule et enregistrez la ligne de commande d’origine avant de modifier les filtres :

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` affiche la sélection actuelle basée sur les règles, tandis que `sb list` montre les couches effectivement utilisées pour composer la racine en cours d’exécution. Une différence peut indiquer un échec de montage, un remplacement de nom de base, une modification `AUFS` à l’exécution, ou une source de sélection qui a changé après le démarrage.

Pour un échec précoce, ajoutez `debug` pour afficher le traçage shell, `timing` pour les temps d’étape, ou `rd.break` pour ouvrir un shell après la configuration de l’initrd et avant le transfert final de la racine. Dans ce shell, inspectez `/memory/data`, `/memory/bundles`, les montages et `/proc/cmdline` ; n’effectuez aucune réparation de système de fichiers ni ne retirez de support tant qu’ils sont montés. Capturez la première erreur de montage ou de copie, pas seulement le symptôme ultérieur. Consultez [Dépannage](/maintenance-and-recovery/Troubleshooting) pour une procédure de diagnostic sûre plus complète.

## Documentation associée

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Découverte du système](/reference/boot-process/System-Discovery)
- [Persistance](/reference/boot-process/Persistence-Internals)
- [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules)
- [Création de modules](/preparing-and-customizing/Managing-Modules)
- [Gestion des noyaux](/preparing-and-customizing/Managing-Kernels)
- [Dépannage](/maintenance-and-recovery/Troubleshooting)
