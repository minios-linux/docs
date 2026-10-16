---
updated: 2026-10-15
---

# Découverte du système

Cette page explique comment les paramètres `from`, `ip`, `cache`, `bext`, `toram` et `toram=full` changent le démarrage. Cette page s’adresse aux entrées de démarrage personnalisées, au démarrage réseau et au dépannage. La plupart des utilisateurs peuvent sélectionner une entrée standard dans le menu de démarrage sans définir ces paramètres manuellement.

Une fois que le chargeur d’amorçage a chargé le noyau et l’initramfs, ce dernier doit localiser l’arborescence de données MiniOS qui fournit les modules système `.sb`. Cela se produit avant que la pile réseau de l’espace utilisateur, l’environnement de bureau et la session persistante soient actifs.

## En clair

MiniOS doit trouver le répertoire qui contient ses modules système. En général, il recherche sur les lecteurs connectés un répertoire `minios/`. Le paramètre `from=` indique un autre répertoire ou fichier ISO. Les paramètres réseau remplacent cette recherche locale par le téléchargement d’un fichier ISO via HTTP ou par PXE.

Trouver un lecteur ne garantit pas que l’ensemble des modules est complet, et trouver les fichiers système n’active pas la persistance. Il s’agit d’étapes de démarrage distinctes.

## Explication des paramètres

| Paramètre | Indication pour MiniOS | Utilisation courante |
|---|---|---|
| `from=PATH` | Rechercher MiniOS dans un répertoire ou un fichier ISO précis plutôt que d’accepter la première source locale correspondante. | Démarrer depuis un fichier ISO stocké sur un disque ou utiliser un répertoire non standard. |
| `from=askdisk` | Ouvrir un sélecteur interactif pour la partition qui contient MiniOS. | Plusieurs lecteurs connectés contiennent des sources possibles. |
| `from=http://...` | Monter un fichier ISO depuis un serveur HTTP standard. | Démarrage réseau contrôlé où le système en cours d’exécution peut continuer à dépendre du serveur. |
| `ip=...` | Utiliser une configuration réseau statique précoce. Sans `from=` HTTP, le téléchargement des données PXE est sélectionné et les lecteurs locaux sont ignorés. | Déploiement PXE ou adressage statique pour un fichier ISO HTTP. |
| `cache=MB` | Allouer un cache httpfs pour un fichier ISO HTTP. Cela ne garantit pas le téléchargement complet du fichier ISO. | Réduire les lectures répétées depuis une source HTTP. |
| `bext=EXTENSION` | Rechercher les noms de fichiers de modules avec une autre extension que `.sb`. | Images spécialisées uniquement ; ne convertit pas les modules. |
| `toram` ou `toram=full` | Copier les données système MiniOS découvertes, y compris les éléments masqués à la racine, mais à l’exclusion de `changes/`, dans RAM et tenter de détacher la source. La copie de la session utilise séparément `perchtoram`. La forme sans argument signifie `full`. | Opération RAM sur une machine disposant de suffisamment de mémoire. |

Si un démarrage local depuis une clé USB s’arrête avant l’affichage du bureau, commencez par supprimer les valeurs personnalisées `from=` et `ip=`. Une valeur `ip=` non vide par erreur empêche la détection des lecteurs locaux, tandis qu’une valeur `from=` incorrecte peut amener MiniOS à rechercher un chemin inexistant.

## Ordre de priorité des sources

La sélection de la source suit un ordre de priorité fixe :

1. Une valeur `from=http://...` littérale sélectionne un fichier ISO HTTP.
2. Sinon, toute valeur non vide de `ip=` sélectionne le téléchargement PXE.
3. Sinon, `from=askdisk` ou `from=askdisk:...` ouvre le sélecteur de disque.
4. Sinon, l’initramfs analyse les périphériques de bloc locaux.

Les deux options réseau ne basculent pas vers les supports locaux. Après une tentative HTTP ISO ou PXE, la découverte renvoie le résultat réseau au lieu d’essayer les disques ; un résultat inutilisable ou incomplet échoue à la validation ou à une étape ultérieure de la configuration.

Cet ordre a deux conséquences importantes :

- `from=http://...`a priorité sur `ip=`. Le paramètre facultatif `ip=` fournit alors l’adressage statique pour la connexion HTTP ISO.
- Une valeur non vide de `ip=` est prioritaire sur toutes les valeurs locales de `from=`, y compris un périphérique, un répertoire, un chemin ISO ou `askdisk`. N’utilisez pas `ip=` dans le seul but de configurer le réseau d’un système démarré localement.

## Découverte locale

Sans source HTTP ni `ip=`, MiniOS effectue 45 cycles de découverte, à raison d’environ un par seconde. Chaque cycle actualise les nœuds de périphériques et récupère les périphériques de bloc candidats depuis `blkid`. Si `/dev/mapper/ventoy` existe, ce mappage ISO est essayé en premier ; les autres candidats sont triés par nom de périphérique et les doublons sont supprimés. La première source MiniOS admissible est conservée. Cela évite de confondre les modules de remplacement présents sur la partition de données Ventoy avec la source ISO principale.

Si `from=` est vide, le chemin testé sur chaque système de fichiers est `minios`. Une source est admissible si ce répertoire ou son sous-répertoire immédiat `modules/` contient au moins un fichier dont l’extension est `.sb` par défaut. Le paramètre `bext=` modifie l’extension utilisée pour ce test. La découverte ne vérifie pas que l’ensemble de modules trouvé est complet ou amorçable.

Chaque candidat est d’abord monté en lecture seule. Une fois qu’il est admissible, MiniOS tente de rendre inscriptible le montage de données sélectionné, mais l’impossibilité de le faire n’invalide pas une source par ailleurs valide.

### Chemins locaux`from=` pris en charge

Un chemin relatif ordinaire ou ressemblant à un chemin absolu est interprété à l’intérieur de chaque système de fichiers candidat. Les barres obliques initiales sont normalisées lors de la construction du chemin ; les deux formes suivantes désignent donc le même répertoire :

```text
from=minios
from=/minios
```

Si le chemin demandé correspond à un fichier ordinaire sur un système de fichiers candidat, MiniOS le traite comme une image ISO, la monte en boucle en lecture seule et teste le répertoire `minios` à l’intérieur de l’ISO :

```text
from=/images/minios.iso
```

Les chemins qualifiés par périphérique acceptent uniquement les formes suivantes :

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` accepte un nom de périphérique simple suivi d’un chemin. La forme avec étiquette doit être exactement `/dev/disk/by-label/LABEL/path` ; l’étiquette est résolue avec `blkid`, puis le chemin restant est testé sur ce système de fichiers.

Il n’existe pas d’analyseur correspondant pour les chemins UUID, PARTUUID ou by-id. Les formes suivantes, par exemple, ne sont pas prises en charge :

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Sélection interactive

Utilisez `askdisk` pour sélectionner une partition, puis tester un chemin sur celle-ci :

```text
from=askdisk
from=askdisk:custom:dir
```

La première forme teste `minios` sur la partition sélectionnée. Dans la deuxième forme, les deux-points sont convertis en séparateurs de chemin ; `askdisk:custom:dir` teste `custom/dir`.
La syntaxe avec barre oblique, comme `from=askdisk/custom/dir` ouvre tout de même le sélecteur, mais ignore silencieusement le chemin personnalisé et teste `minios` ; ne l’utilisez pas.

La liste des périphériques affichée est actualisée pendant que le sélecteur est ouvert et exclut les systèmes de fichiers d’échange. La sélection effectue toujours le test normal de présence des modules ; choisir une partition ne suffit pas.

## ISO HTTP

Une source ISO HTTP prend la forme suivante :

```text
from=http://server.example/path/minios.iso
```

Seul le protocole HTTP non chiffré est reconnu. HTTPS et les autres schémas d’URL ne sont pas pris en charge.
L’initramfs détecte la première interface réseau non loopback, active le réseau et monte l’ISO distante via `httpfs2`. La sélection de l’interface ne vérifie ni l’état de la liaison, ni l’accessibilité, ni si cette interface est utilisable sur un système doté de plusieurs cartes réseau.

Lorsque `ip=` est absent, le démarrage depuis une ISO HTTP demande une configuration DHCP avec `udhcpc`. Lorsque `ip=` est présent, il utilise les champs statiques attendus par l’analyseur PXE :

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Pour démarrer depuis une ISO HTTP, l’URL détermine toujours le serveur HTTP. Les champs statiques définissent l’adresse du client, le masque réseau, la passerelle par défaut et les premières entrées DNS ; le champ de port facultatif concerne le téléchargement des fichiers PXE et ne remplace pas le port indiqué dans l’URL de l’ISO.

`cache=<MB>` active un cache httpfs de la taille demandée dans `/tmp`. Il s’agit d’un cache, pas d’un téléchargement complet garanti. Le système en cours d’exécution continue de dépendre de l’ISO distante et du réseau, sauf si une copie RAM réussie détache la source.

## Téléchargement des données PXE

Toute valeur non vide `ip=` sélectionne le téléchargement des données PXE, sauf si `from=http://...` a été sélectionné en premier. La syntaxe prise en charge est la suivante :

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Le masque de réseau doit être au format IPv4 décimal pointé. Par défaut, le port HTTP facultatif est `7529`.
Les formats génériques de kernel ou de dracut, tels que `ip=dhcp` et `ip=:::::eth0:dhcp`, ne sont pas pris en charge. Dans cet analyseur, le téléchargement des données PXE ne dispose pas de format DHCP.

MiniOS configure la première interface détectée qui n'est pas de bouclage, sans vérifier qu'elle dispose d'une connexion fonctionnelle. Il demande d'abord `PXEFILELIST` et les fichiers MiniOS répertoriés via HTTP auprès du serveur indiqué dans le champ correspondant. TFTP est un recours limité : il est utilisé uniquement si la requête HTTP initiale pour `PXEFILELIST` échoue. Il ne s'agit ni d'un basculement général entre interfaces, ni d'un recours à un support local, ni d'un mécanisme de récupération après tout échec partiel du téléchargement HTTP.

## Copier et détacher avec `toram=full`

`toram=full` est important pour la détection, car cela peut supprimer la dépendance persistante envers la source sélectionnée. Après avoir détecté la source et tout arbre MiniOS externe, le système copie les données système dans RAM, puis tente de démonter la source et de déplacer la copie RAM à sa place. Seuls le démontage et le déplacement réussis détachent cette source ; les systèmes de fichiers hôtes ISO et les mappages Ventoy doivent également être libérés.

Limites importantes :

- Aucune vérification préalable ne garantit que l'espace RAM disponible est suffisant pour accueillir la copie.
- La copie complète du système inclut les entrées masquées de premier niveau, mais exclut `changes/`, que la persistance soit demandée ou non. Tout arbre MiniOS externe détecté est copié par-dessus l'arbre source, y compris les modules de remplacement.
- Les conteneurs de session pris en charge sont copiés séparément avec `perchtoram=trim|full` ; `perchtoram=off` maintient la dépendance envers le stockage. Les sessions natives ont une autre limite, décrite dans la section [Modes de démarrage](/using-minios/Boot-Modes).
- Les erreurs de copie du système déclenchent le chemin d'erreur fatale de l'initramfs. Un échec du démontage ou du déplacement peut laisser la source d'origine montée alors que le démarrage utilise le chemin de préparation RAM. Ne supposez pas que `toram=full` permet de retirer la source ou de perdre la connexion réseau sans risque ; vérifiez qu'elle est bien détachée.

Consultez [Persistance dans l'initrd](/reference/boot-process/Persistence-Internals) avant de combiner `toram` avec `perch` ou `perchdir`.

## Échecs et diagnostics

Si les 45 tentatives locales échouent, MiniOS déclenche son chemin d'erreur fatale et ouvre un shell initramfs au lieu de démarrer le système live. Les chemins réseau n'effectuent pas les 45 tentatives de recherche locale et ne basculent pas vers un support local ; selon le résultat partiel, la vérification des données ou une étape ultérieure de la configuration peut échouer. Quitter un shell ouvert après une erreur fatale ne répare pas l'absence de la source et peut simplement laisser échouer une étape ultérieure de manière moins explicite.

Paramètres de diagnostic utiles :

- `debug` active le traçage du shell, fournit des diagnostics supplémentaires et ouvre des shells interactifs à plusieurs points de contrôle de l'initramfs. Quittez le shell d'un point de contrôle pour continuer.
- `timing` affiche le temps écoulé entre les étapes de l'initramfs ainsi que la durée totale.
- `rd.break` demande l'ouverture d'un shell initramfs juste avant le passage à la vraie racine ; quittez-le pour poursuivre le démarrage.

Dans un shell, examinez `/proc/cmdline`, `/proc/net/dev`, `blkid`, les systèmes de fichiers montés et `/var/log/livedbg`. Commencez par relever exactement les valeurs `from=`, `ip=` et `bext=` indiquées dans `/proc/cmdline`.

## Documentation associée

- [Modes de démarrage](/using-minios/Boot-Modes)
- [Chargement des modules](/reference/boot-process/Module-Loading)
- [Persistance](/reference/boot-process/Persistence-Internals)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Dépannage](/maintenance-and-recovery/Troubleshooting)
