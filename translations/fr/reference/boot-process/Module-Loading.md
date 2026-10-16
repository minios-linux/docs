---
updated: 2026-10-15
---

# Chargement des modules

Cette page explique ce que `load`, `noload`, `bext`, `union` et `toram=trim` changent dans les paramètres de démarrage. Ce sont des options avancées. Lors d’un démarrage normal, le jeu de modules fourni par l’image MiniOS est chargé automatiquement.

MiniOS sélectionne et monte son jeu de modules dans l’initrd, avant que la racine union ne soit transmise au système d’initialisation installé. Consultez cette page si un module présent sur le support de démarrage n’apparaît pas dans le système en cours d’exécution ou si un filtre modifie le démarrage de manière inattendue.

## En clair

MiniOS est constitué de `.sb`modules en lecture seule numérotés. Les numéros les plus bas sont chargés en premier ; les modules portant un numéro plus élevé peuvent remplacer les fichiers des modules précédents. Lorsqu’une session avec accès en écriture est active, elle se superpose à tous les modules en lecture seule.

Les paramètres `load=` et `noload=` filtrent les chemins des modules avant leur assemblage. Ils utilisent la correspondance par expression régulière, et non une liste sûre de noms exacts. Un filtre trop large peut donc exclure du jeu de démarrage des modules essentiels, du noyau ou du système.

## Explication des paramètres

| Paramètre | Fonction de MiniOS | Risque principal |
|---|---|---|
| `load=PATTERN` | Ne conserver que les modules candidats dont le chemin correspond au motif. | Un motif incomplet peut exclure des modules nécessaires. |
| `noload=PATTERN` | Exclure les modules candidats correspondants après l’application de `load=`. | Des modules essentiels, du noyau, du firmware ou du bureau peuvent être exclus du démarrage. |
| `bext=EXTENSION` | Traiter une autre extension de fichier comme suffixe de module candidat. | Ne convertit pas les fichiers et ne coordonne pas entièrement les modules du noyau. |
| `union=aufs` ou `union=overlayfs` | Demander le système de fichiers utilisé pour combiner les modules avec la couche accessible en écriture. | L’activation des modules à l’exécution diffère entre AUFS et OverlayFS. |
| `toram=trim` | Copier uniquement les modules sélectionnés et les données nécessaires limitées vers RAM. | Les modules et répertoires exclus ne sont plus disponibles une fois la source détachée. |

Avant de modifier les filtres, notez la ligne de commande et le jeu de modules actuels. Testez une modification à la fois et gardez une entrée de démarrage fonctionnelle à portée de main.

<a id="candidate-tiers"></a>

## Niveaux de candidats

Après avoir localisé le répertoire de données MiniOS, généralement `minios/`, l’initrd recherche une arborescence externe facultative MiniOS avant la copie de RAM ou l’activation de session. Une partition de persistance sur le même lecteur ou une organisation des données Ventoy accessible en écriture peut fournir cette arborescence, même lors d’un démarrage sans session enregistrée. Le backend Persistence Plugin sélectionné Ventoy repose sur un modèle distinct et ne fournit pas cette arborescence de modules externe.

Les candidats se répartissent en deux groupes :

1. Noms de modules de premier niveau issus de l’arborescence de données sélectionnée et de l’arborescence externe `minios/` , triés et dédupliqués par nom relatif.
2. Fichiers et liens symboliques situés récursivement sous `modules/` dans les deux arborescences, triés et dédupliqués par chemin relatif.

Pour un même chemin relatif, un fichier ordinaire externe est prioritaire sur l’ISO ou toute autre source sélectionnée. Cela s’applique aussi bien aux modules système de remplacement qu’aux modules supplémentaires. Les filtres s’appliquent aux chemins relatifs fusionnés avant le montage ou la copie allégée RAM. La racine de la partition de persistance reste distincte de son espace de stockage des sessions numérotées.

Les points de montage sont toujours aplatis en noms de base exacts. Par exemple, `modules/work/50-extra.sb` et `modules/test/50-extra.sb` désignent tous deux `50-extra.sb` ; il ne s’agit pas de couches union indépendantes. Utilisez des noms de base distincts, sauf si vous souhaitez remplacer un chemin exact. Ne vous fiez pas à des noms de base identiques dans des répertoires différents pour effectuer un remplacement.

Le format normal des modules est une image de système de fichiers SquashFS. Un nom de fichier correspondant ne garantit pas la validité de son contenu. Les analyses récursives prennent en compte les fichiers et les liens symboliques, tandis que l’analyse de premier niveau se base sur les noms de fichiers. Si le montage d’un remplacement externe ou d’un module sélectionné échoue, le processus suit désormais le chemin fatal d’initramfs au lieu d’omettre silencieusement cette couche. Vérifiez les fichiers douteux avec [Inspecter et extraire les modules](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Ordre et priorité

Lors de la découverte, les chemins sont triés numériquement selon leur nom de base. Le nombre initial dans les noms tels que `00-core.sb`, `01-kernel-VERSION.sb` et `50-extra.sb` détermine l’ordre des modules. Un nom de base sans nombre initial est traité comme zéro pour le tri numérique.
Utilisez des préfixes numériques explicites et distincts plutôt que de vous fier à l’ordre en cas d’égalité.

Dans l’union finale, les modules portant les numéros les plus élevés sont prioritaires sur les modules précédents, dont les numéros sont plus faibles. Si deux modules sélectionnés contiennent le même chemin relatif à la racine, le fichier du module le plus prioritaire est celui qui est visible. La couche de modifications inscriptible est prioritaire sur tous les modules en lecture seule.

Le remplacement externe par chemin relatif a lieu avant l’application de cet ordre effectif des modules. Un remplacement `modules/50-extra.sb` occupe le même emplacement sélectionné que le fichier source, et son préfixe `50` détermine sa priorité dans l’union.

## Extension des bundles

Le paramètre de démarrage `bext=` sélectionne l’extension de fichier utilisée pour la découverte des données, le filtrage des candidats et le montage des modules. Sa valeur par défaut est `sb`, le suffixe habituel des candidats est donc `.sb` :

```text
bext=sb
```

Modifier `bext` change le suffixe de nom de fichier sélectionné ; cela ne convertit pas un fichier et ne vérifie pas son format de système de fichiers. La coordination du noyau fait exception : elle recherche toujours `01-kernel-VERSION.sb`. Avec une extension personnalisée, l’analyse normale des candidats ne sélectionne pas ces modules du noyau `.sb`.

## Filtres load et noload

`load=` et `noload=` sont des expressions régulières étendues non ancrées, appliquées aux chaînes de chemin des candidats générées par chaque niveau. Il ne s’agit pas de listes de noms exacts. Une valeur simple telle que `kernel` correspond à ce texte n’importe où dans un chemin ; les ancres doivent être spécifiées explicitement pour cibler une position exacte.
Les candidats de premier niveau sont des noms de base, tandis que les candidats récursifs incluent `modules/`. Les candidats externes utilisent le même format de chemin relatif, et non des chemins absolus de montage de persistance.

Les virgules sont converties en opérateurs d’alternance d’expressions régulières. Par exemple :

```text
load=core,kernel,firmware
```

est évalué comme `core|kernel|firmware`. Les autres caractères d’expression régulière ne sont pas échappés.

Une plage numérique est développée uniquement si le filtre entier est une plage croissante correspondant à `^[0-9]+-[0-9]+$`. Par exemple, `load=04-06` devient les alternatives `04|05|06`, chaque valeur générée étant complétée par des zéros pour atteindre au moins deux chiffres. Une plage intégrée à une liste séparée par des virgules ou à une autre expression n’est pas développée et conserve sa signification habituelle en ERE.

Lorsque les deux paramètres sont présents, l’initrd applique d’abord `load=`, puis supprime les correspondances avec `noload=`. Ainsi, `noload=` est prioritaire. Aucun ensemble de modules essentiels ou de modules du noyau n’est protégé : les filtres peuvent exclure `00-core`, le `01-kernel` coordonné ou tout autre candidat. Une telle sélection peut produire une racine incomplète ou empêcher le démarrage.

## Coordination avec le noyau en cours d’exécution

La version du noyau en cours d’exécution est déterminée à partir d’un jeton `vmlinuz-VERSION` présent sur la ligne de commande du noyau, si disponible ; sinon, `uname -r` est utilisé. Avant de monter les modules, l’initrd coordonne ce triplet de premier niveau :

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Si un élément manque, l’initrd recherche les trois fichiers dans :

```text
minios/kernels/VERSION/
```

Si le triplet du dépôt est complet, il copie le module dans `minios/` et les fichiers de démarrage dans `minios/boot/`. Toute copie partielle est supprimée. Si le triplet est incomplet, la configuration du noyau renvoie une erreur, mais l’appelant poursuit le montage normal des modules. Le système qui en résulte peut tout de même échouer par la suite, car le système de fichiers racine ne contient pas les fichiers de prise en charge du noyau en cours d’exécution.

Les autres fichiers de premier niveau correspondant à `01-kernel-*.sb` sont considérés comme inactifs. L’initrd tente de déplacer chaque module inactif ainsi que les fichiers `vmlinuz` et `initrfs` correspondants vers `minios/kernels/VERSION/`. Ces opérations de repli sur le dépôt et de déplacement nécessitent une arborescence de données inscriptible ; les échecs de déplacement individuels ne sont pas fatals. Elles utilisent toujours `.sb`, quelle que soit la valeur de `bext=`. L’analyse des candidats fusionnés exclut également les modules `01-kernel-*` qui ne correspondent pas au noyau en cours d’exécution, y compris les candidats externes. Consultez [Gestion du noyau](/preparing-and-customizing/Managing-Kernels) pour connaître les procédures prises en charge d’installation et d’activation du noyau.

<a id="union-construction"></a>

## Construction de l’union

MiniOS sélectionne `AUFS` lorsque le noyau en cours d’exécution le prend en charge, et utilise sinon OverlayFS. `union=overlayfs` sélectionne OverlayFS. `union=aufs` demande `AUFS` mais revient à OverlayFS si `AUFS` n’est pas disponible. Lorsque UEFI Secure Boot est activé, initrd ne charge pas le module non signé `aufs-ng` ; si aucune autre implémentation utilisable de AUFS n’est déjà disponible, OverlayFS est utilisé même si `union=aufs` a été demandé.

Avec `AUFS`, initrd monte d’abord une union vide avec la branche modifiable contenant les changements, puis ajoute chaque module monté comme branche en lecture seule. L’échec de la création de l’union est fatal. En cas d’échec lors de l’ajout d’une branche `AUFS`, le système tente de poursuivre le démarrage avec les branches déjà ajoutées ; MiniOS ne signale pas la persistance comme active si l’union est incomplète.

Avec OverlayFS, l’ensemble des modules est fourni sous la forme d’une liste `lowerdir` inversée lors du montage de l’union. La couche modifiable fournit son `upperdir` et son `workdir`. L’échec du montage de cette union est fatal. L’ordre des couches inférieures de gauche à droite et l’ordre d’insertion de `AUFS` appliquent la même règle : les modules ajoutés plus tard, dont le numéro est plus élevé, masquent les chemins en conflit des modules précédents.

Cette composition au démarrage est distincte de l’activation à l’exécution. Après le démarrage, `sb activate` et `sb deactivate` ne peuvent modifier qu’une racine actuellement montée en tant que `AUFS`. Il est impossible de modifier sur place les couches inférieures OverlayFS. L’activation à l’exécution ne modifie pas la sélection du prochain démarrage, et l’ajout d’un module pour le prochain démarrage ne l’active pas dans la racine actuelle. Voir [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules).

## Élagage Toram

`toram=trim` crée une arborescence de données système RAM après la détection des modules externes et avant l’activation de la session et la coordination avec le noyau. Cette arborescence contient une copie de :

- `config.conf`, nécessaire à cette opération de copie.
- `authorized_keys` lorsqu’il existe en tant que fichier ordinaire.
- Les candidats de premier niveau correspondant à l’extension, sélectionnés par `load=`, `noload=` et le filtre du noyau en cours d’exécution.
- Les candidats correspondant à l’extension, sélectionnés récursivement sous `modules/`, en conservant leurs chemins relatifs.
- Les remplacements et ajouts externes sélectionnés selon les mêmes règles, copiés dans leurs chemins relatifs correspondants.

Un répertoire `changes/` vide est créé ; la copie de la session est gérée séparément par `perchtoram`. Les éléments suivants ne sont pas copiés : `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, les journaux, les autres données qui ne sont pas des modules et les modules non sélectionnés. En particulier, le repli vers le dépôt ne peut pas utiliser un répertoire `kernels/` absent de l’arborescence RAM élaguée. Les modules externes étant déjà inclus, le démarrage RAM ne rouvre pas leurs fichiers d’origine après la copie.

La copie du système ne vérifie pas au préalable la capacité RAM. L’échec de la copie de `config.conf` ou d’un module sélectionné est transmis au point d’entrée init et déclenche sa procédure d’échec fatal. L’échec de la copie de `authorized_keys` facultatif est signalé sans interrompre le démarrage. Aucune restauration transactionnelle n’est effectuée si l’arborescence de données système n’est que partiellement remplie. La copie de la session dispose de sa propre vérification préalable de la mémoire et revient à la session d’origine sur le support de stockage si la copie ne peut être préparée ; voir [Fonctionnement interne de la persistance](/reference/boot-process/Persistence-Internals).

Après la copie, initrd tente de démonter le montage source, de supprimer son ancien chemin de données et de déplacer l’arborescence RAM vers ce chemin. Le montage source n’est considéré comme détaché que si toute cette séquence réussit. En cas d’échec, le démarrage se poursuit en utilisant le chemin de préparation RAM. Les opérations connexes de détachement des ISO et de Ventoy sont effectuées au mieux.
Par conséquent, `toram=trim` ne prouve pas que le périphérique de démarrage est amovible. Ne le débranchez pas tant que les diagnostics n’ont pas confirmé que son système de fichiers, son périphérique loop et ses mappages device-mapper ne sont plus montés ni utilisés.

## Rootcopy et transfert de la racine

Après le montage des modules et la construction de l’union, initrd copie le contenu visible de `minios/rootcopy/` directement dans l’union assemblée. Le motif glob du shell `*` ignore les entrées dont le nom commence par un point directement dans `rootcopy/`, mais les fichiers cachés à l’intérieur d’un répertoire copié sont conservés lors de la copie de ce répertoire. Il s’agit d’une copie de fichiers dans la vue modifiable, et non d’une autre couche de module en lecture seule ; elle peut donc remplacer les chemins fournis par les modules. Cette fonction ne traite pas les erreurs de copie comme fatales.

MiniOS effectue ensuite sa configuration initiale, écrit le `fstab` de la nouvelle racine et exécute le script `rootcopy/run/preinit.sh` s’il est présent, en lui transmettant le chemin de l’union comme premier argument. Ce script s’exécute dans l’environnement initrd, avant le transfert de la racine, et doit être considéré comme du code de démarrage privilégié.

À la dernière étape, l’initrd LiveKit bascule l’union assemblée vers `/`, conserve l’ancien initrd dans `/run/initramfs` pour les opérations d’arrêt, puis exécute le `init` de la nouvelle racine. Le chemin Dracut prépare la même union et laisse Dracut effectuer le `switch_root` final. Une fois cette étape franchie, le démarrage normal s’exécute dans la racine composée ; modifier des fichiers sur le support de démarrage ne reconstitue plus l’ensemble de couches inférieures sélectionnées pour ce démarrage.

## Diagnostic sécurisé

Privilégiez l’inspection en lecture seule et consignez la ligne de commande d’origine avant de modifier les filtres :

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` affiche la sélection actuelle fondée sur les règles, tandis que `sb list` affiche les couches qui composent réellement la racine en cours d’exécution. Un écart peut indiquer un échec de montage, un remplacement par nom de base, une modification `AUFS` à l’exécution ou une source de sélection qui a changé après le démarrage.

En cas d’échec précoce, ajoutez `debug` pour afficher le traçage du shell, `timing` pour obtenir les temps d’exécution des étapes ou `rd.break` pour ouvrir un shell après la configuration d’initrd et avant le transfert final de la racine. Dans ce shell, inspectez `/memory/data`, `/memory/bundles`, les montages et `/proc/cmdline` ; ne réparez pas les systèmes de fichiers et ne retirez pas les supports pendant qu’ils sont montés. Relevez la première erreur de montage ou de copie, pas seulement le symptôme qui apparaît ensuite. Voir [Dépannage](/maintenance-and-recovery/Troubleshooting) pour connaître une procédure de diagnostic sécurisée plus complète.

## Documentation connexe

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Découverte du système](/reference/boot-process/System-Discovery)
- [Persistance](/reference/boot-process/Persistence-Internals)
- [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules)
- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Gestion du noyau](/preparing-and-customizing/Managing-Kernels)
- [Dépannage](/maintenance-and-recovery/Troubleshooting)
