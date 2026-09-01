---
updated: 2026-08-28
---

# Découverte du système

Cette page explique ce que modifient les paramètres de démarrage `from`, `ip`, `cache`, `bext`, `toram` et `toram=full`. Elle s’adresse aux entrées de démarrage personnalisées, au démarrage réseau et au dépannage. La plupart des utilisateurs peuvent simplement choisir une entrée standard dans le menu de démarrage sans avoir à définir ces paramètres manuellement.

Après le chargement du noyau et de l’initramfs par le bootloader, l’initramfs doit localiser l’arborescence de données MiniOS qui fournit les modules système `.sb`. Cette étape intervient avant l’activation du réseau utilisateur standard, du bureau et de la session persistante.

## En termes simples

MiniOS doit trouver le répertoire contenant ses modules système. Normalement, il recherche sur les disques connectés un répertoire `minios/`. Le paramètre `from=` permet d’indiquer un autre répertoire ou une image ISO. Les paramètres réseau remplacent cette recherche locale par un téléchargement HTTP d’une ISO ou via PXE.

Trouver un disque ne garantit pas que l’ensemble des modules est complet, et trouver les fichiers système n’active pas la persistance. Ce sont des étapes de démarrage distinctes.

## Explication des paramètres

| Paramètre | Ce qu’il indique à MiniOS | Utilisation typique |
|---|---|---|
| `from=PATH` | Chercher MiniOS dans un répertoire ou une ISO spécifique au lieu d’accepter la première source locale correspondante. | Démarrer une ISO stockée sur un disque ou utiliser un répertoire non standard. |
| `from=askdisk` | Ouvrir un sélecteur interactif pour la partition contenant MiniOS. | Plusieurs disques connectés contiennent des sources potentielles. |
| `from=http://...` | Monter une ISO depuis un serveur HTTP classique. | Démarrage réseau contrôlé où le système en cours d’exécution peut continuer à dépendre du serveur. |
| `ip=...` | Utiliser un réseau statique précoce. Sans HTTP `from=`, cela sélectionne le téléchargement de données PXE et ignore les disques locaux. | Déploiement PXE ou adressage statique pour une ISO HTTP. |
| `cache=MB` | Allouer un cache httpfs pour une ISO HTTP. Cela ne garantit pas que l’ISO complète soit téléchargée. | Réduire les lectures répétées depuis une source HTTP. |
| `bext=EXTENSION` | Chercher les fichiers de modules avec une autre extension que `.sb`. | Images spécialisées uniquement ; cela ne convertit pas les modules. |
| `toram` ou `toram=full` | Copier l’arborescence de données MiniOS découverte dans RAM et tenter de détacher la source. La forme simple signifie `full`. | Opération temporaire en RAM sur une machine disposant de suffisamment de mémoire. |

Si un démarrage local USB s’arrête avant l’apparition du bureau, commencez par retirer les valeurs personnalisées de `from=` et `ip=`. Un `ip=` non vide par erreur empêche la découverte sur les disques locaux, tandis qu’une valeur incorrecte de `from=` peut faire chercher à MiniOS un chemin inexistant.

## Priorité des sources

La sélection de la source suit une priorité fixe :

1. Une valeur explicite de `from=http://...` sélectionne une ISO HTTP.
2. Sinon, toute valeur non vide de `ip=` sélectionne un téléchargement PXE.
3. Sinon, `from=askdisk` ou `from=askdisk:...` ouvre le sélecteur de disque.
4. Sinon, l’initramfs analyse les périphériques de stockage locaux.

Les deux chemins réseau ne basculent pas sur les supports locaux. Après une tentative HTTP ISO ou PXE, la découverte retourne ce résultat réseau au lieu d’essayer les disques ; un résultat inutilisable ou incomplet échoue à la validation ou lors de l’installation ultérieure.

Cet ordre a deux conséquences importantes :

- `from=http://...` l’emporte sur `ip=`. L’optionnel `ip=` fournit alors l’adressage statique pour la connexion ISO HTTP.
- Une valeur non vide de `ip=` l’emporte sur toute valeur locale de `from=`, y compris un périphérique, un répertoire, un chemin ISO ou `askdisk`. N’utilisez pas `ip=` uniquement pour configurer le réseau d’un système démarré localement.

## Découverte locale

En l’absence de source HTTP ou de `ip=` non vide, MiniOS effectue 45 passes de découverte, à raison d’environ une par seconde. Chaque passe actualise les nœuds de périphériques, récupère les candidats de périphériques blocs depuis `blkid`, trie leurs noms de périphériques et les teste dans cet ordre. Le premier candidat contenant une source MiniOS valide est retenu ; les périphériques suivants ne sont pas pris en compte.

Si `from=` est vide, le chemin testé sur chaque système de fichiers est `minios`. Une source est considérée comme valide lorsque ce répertoire ou son sous-répertoire immédiat `modules/` contient au moins un fichier dont l’extension est `.sb` par défaut. Le paramètre `bext=` modifie l’extension utilisée pour ce test. La découverte ne vérifie pas que l’ensemble de modules trouvé est complet ou amorçable.

Chaque candidat est monté initialement en lecture seule. Après validation, MiniOS tente de rendre ce point de montage en écriture, mais l’impossibilité de le faire n’exclut pas une source par ailleurs valide.

### Formes locales de `from=`

Un chemin relatif ou absolu classique est interprété dans chaque système de fichiers candidat. Les barres obliques en début de chemin sont normalisées lors de la construction du chemin, ainsi ces deux exemples recherchent le même répertoire :

```text
from=minios
from=/minios
```

Si le chemin demandé est un fichier régulier sur un système de fichiers candidat, MiniOS le considère comme une ISO, le monte en boucle en lecture seule et teste le répertoire `minios` à l’intérieur de l’ISO :

```text
from=/images/minios.iso
```

Les chemins qualifiés par périphérique ne prennent en charge que ces formes :

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` accepte un nom de périphérique simple suivi d’un chemin. La forme par label doit être exactement `/dev/disk/by-label/LABEL/path` ; le label est résolu avec `blkid`, puis le chemin restant est testé sur ce système de fichiers.

Il n’existe pas de parseur équivalent pour les chemins UUID, PARTUUID ou by-id. Les formes suivantes ne sont donc pas prises en charge :

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Sélection interactive

Utilisez `askdisk` pour sélectionner une partition puis tester un chemin dessus :

```text
from=askdisk
from=askdisk:custom:dir
```

La première forme teste `minios` sur la partition sélectionnée. Dans la seconde forme, les deux-points deviennent des séparateurs de chemin, donc `askdisk:custom:dir` teste `custom/dir`.
La syntaxe avec slash comme `from=askdisk/custom/dir` ouvre également le sélecteur mais ignore silencieusement le chemin personnalisé et teste `minios` ; il est donc déconseillé de l’utiliser.

La liste des périphériques affichée est actualisée tant que le sélecteur est ouvert et exclut les systèmes de fichiers swap. La sélection effectue tout de même le test de présence des modules ; le choix d’une partition seule n’est pas suffisant.

## ISO HTTP

Une source ISO HTTP a cette forme :

```text
from=http://server.example/path/minios.iso
```

Seul le protocole HTTP simple est reconnu. HTTPS et les autres schémas d’URL ne sont pas pris en charge.
L’initramfs détecte la première interface réseau non loopback, initialise le réseau et monte l’ISO distante via `httpfs2`. La sélection de l’interface ne vérifie ni la liaison, ni l’accessibilité, ni si cette interface est la bonne sur un système multi-NIC.

Quand `ip=` est absent, le démarrage ISO HTTP demande une adresse DHCP avec `udhcpc`. Lorsque `ip=` est présent, il utilise les champs statiques attendus par le parseur PXE :

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Pour le démarrage ISO HTTP, l’URL détermine toujours le serveur HTTP. Les champs statiques configurent l’adresse client, le masque réseau, la passerelle par défaut et les premières entrées DNS ; le champ de port optionnel concerne le téléchargement de fichiers PXE et ne remplace pas le port de l’URL ISO.

`cache=<MB>` active un cache httpfs de la taille demandée dans `/tmp`. Il s’agit d’un cache, pas d’un téléchargement complet garanti. Le système en cours d’exécution continue de dépendre de l’ISO distante et du réseau sauf si une copie RAM réussie détache la source.

## Téléchargement de données PXE

Toute valeur non vide de `ip=` sélectionne le téléchargement de données PXE, sauf si `from=http://...` a été sélectionné en premier. La syntaxe prise en charge est :

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Le masque réseau est en notation IPv4 pointée. Le port HTTP optionnel est par défaut `7529`.
Les formes génériques du noyau ou de dracut telles que `ip=dhcp` et `ip=:::::eth0:dhcp` ne sont pas prises en charge. Le téléchargement PXE lui-même ne propose pas de forme DHCP dans ce parseur.

MiniOS configure la première interface non loopback détectée sans vérifier qu’elle dispose d’une liaison fonctionnelle. Il demande d’abord `PXEFILELIST` et les fichiers MiniOS listés via HTTP auprès du serveur indiqué. TFTP est un repli limité : il n’est sélectionné que si la requête HTTP initiale pour `PXEFILELIST` échoue. Il ne s’agit pas d’un basculement général d’interface, ni d’un repli sur média local, ni d’une récupération après tout échec partiel de téléchargement HTTP.

## Copie et détachement avec `toram=full`

`toram=full` est important pour la découverte car il peut supprimer la dépendance continue à la source sélectionnée. Après la découverte, MiniOS copie l’arborescence de données vers RAM puis tente de démonter la source et de déplacer la copie RAM à sa place. Seul un démontage et un déplacement réussis détachent le support local, une ISO montée en boucle ou une ISO HTTP.

Limitations importantes :

- Aucun contrôle préalable ne vérifie que la RAM disponible peut accueillir la copie.
- Lorsque la persistance est demandée, la copie de niveau supérieur `*` omet les fichiers cachés.
- Sans persistance, l’entrée `changes` est volontairement omise. Cette branche copie les autres entrées de niveau supérieur, y compris les fichiers cachés.
- Un échec de copie, de démontage ou de déplacement peut laisser la source d’origine montée. Ne supposez pas que la spécification de `toram=full` rend le retrait du support ou la perte réseau sans risque ; vérifiez que le détachement a bien réussi.

Consultez [Persistance Initrd](/reference/boot-process/Persistence-Internals) avant de combiner `toram` avec `perch` ou `perchdir`.

## Échec et diagnostic

Si les 45 passes locales échouent, MiniOS entre dans son mode d’erreur fatale et ouvre un shell initramfs au lieu de démarrer le système live. Les chemins réseau ne réalisent pas la recherche locale en 45 passes et ne basculent pas sur les supports locaux ; selon le résultat partiel, ils peuvent échouer lors de la vérification des données ou de l’installation ultérieure. Quitter un shell fatal ne répare pas la source manquante et peut simplement rendre l’échec ultérieur moins explicite.

Les paramètres de diagnostic utiles sont :

- `debug` active le traçage du shell, des diagnostics supplémentaires et des shells interactifs à plusieurs points de contrôle de l’initramfs. Quittez un shell de point de contrôle pour continuer.
- `timing` affiche le temps écoulé entre les étapes de l’initramfs et un total final.
- `rd.break` demande un shell initramfs près du passage à la racine réelle ; quittez-le pour poursuivre le démarrage.

Dans un shell, examinez `/proc/cmdline`, `/proc/net/dev`, `blkid`, les systèmes de fichiers montés et `/var/log/livedbg`. Commencez par les valeurs exactes de `from=`, `ip=` et `bext=` affichées dans `/proc/cmdline`.

## Documentation associée

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Chargement des modules](/reference/boot-process/Module-Loading)
- [Persistance](/reference/boot-process/Persistence-Internals)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Dépannage](/maintenance-and-recovery/Troubleshooting)
