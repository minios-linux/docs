# Découverte du système Initrd

Après que le bootloader a chargé le kernel et l'initramfs, l'initramfs doit localiser l'arborescence de données MiniOS qui fournit les modules système `.sb`. Cette étape intervient avant l'activation normale de la pile réseau en espace utilisateur, du bureau et de la session persistante.

## Priorité des sources

La sélection de la source suit un ordre de priorité fixe :

1. Une valeur littérale `from=http://...` sélectionne une ISO HTTP.
2. Sinon, toute valeur `ip=` non vide sélectionne le téléchargement PXE.
3. Sinon, `from=askdisk` ou `from=askdisk:...` ouvre le sélecteur de disque.
4. Sinon, l'initramfs analyse les périphériques de stockage locaux.

Les deux chemins réseau ne basculent pas vers les supports locaux. Après une tentative HTTP ISO ou PXE, la découverte retourne ce résultat réseau au lieu d'essayer les disques ; un résultat inutilisable ou incomplet échoue à la validation ou lors de l'installation ultérieure.

Cet ordre a deux conséquences importantes :

- `from=http://...` l'emporte sur `ip=`. L'optionnel `ip=` fournit alors l'adressage statique pour la connexion HTTP ISO.
- Une valeur `ip=` non vide l'emporte sur toute valeur locale `from=`, y compris un périphérique, un répertoire, un chemin ISO ou `askdisk`. N'utilisez pas `ip=` uniquement pour configurer le réseau d'un système démarré localement.

## Découverte locale

En l'absence de source HTTP ou de `ip=` non vide, MiniOS effectue 45 passes de découverte, à raison d'environ une par seconde. Chaque passe actualise les nœuds de périphériques, récupère les candidats de périphériques blocs depuis `blkid`, trie leurs noms et les teste dans cet ordre. Le premier candidat contenant une source MiniOS valide est retenu ; les périphériques suivants ne sont pas pris en compte.

Si `from=` est vide, le chemin testé sur chaque système de fichiers est `minios`. Une source est qualifiée lorsque ce répertoire ou son sous-répertoire immédiat `modules/` contient au moins un fichier dont l'extension est `.sb` par défaut. Le paramètre `bext=` permet de changer l'extension utilisée pour ce test. La découverte ne vérifie pas que l'ensemble de modules trouvé est complet ou amorçable.

Chaque candidat est monté initialement en lecture seule. Après qualification, MiniOS tente de rendre le montage de données sélectionné accessible en écriture, mais l'impossibilité de le faire ne disqualifie pas une source par ailleurs valide.

### Formes locales de `from=`

Un chemin relatif ou absolu classique est interprété dans chaque système de fichiers candidat. Les barres obliques initiales sont normalisées lors de la construction du chemin, ainsi ces deux exemples cherchent le même répertoire :

```text
from=minios
from=/minios
```

Si le chemin demandé est un fichier régulier sur un système de fichiers candidat, MiniOS le traite comme une ISO, le monte en boucle en lecture seule et teste le répertoire `minios` à l'intérieur de l'ISO :

```text
from=/images/minios.iso
```

Les chemins qualifiés par périphérique ne prennent en charge que ces formes :

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` accepte un nom de périphérique simple suivi d'un chemin. La forme par label doit être exactement `/dev/disk/by-label/LABEL/path` ; le label est résolu avec `blkid`, puis le chemin restant est testé sur ce système de fichiers.

Il n'existe pas de parseur correspondant pour les chemins UUID, PARTUUID ou by-id. Les formes suivantes, par exemple, ne sont pas prises en charge :

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
La syntaxe avec slash comme `from=askdisk/custom/dir` ouvre bien le sélecteur mais ignore silencieusement le chemin personnalisé et teste `minios` ; il ne faut donc pas l'utiliser.

La liste des périphériques affichée est actualisée tant que le sélecteur est ouvert et exclut les systèmes de fichiers swap. La sélection effectue toujours le test de présence des modules ; choisir une partition seule n'est pas suffisant.

## ISO HTTP

Une source ISO HTTP a cette forme :

```text
from=http://server.example/path/minios.iso
```

Seul le HTTP simple est reconnu. HTTPS et les autres schémas d'URL ne sont pas pris en charge.
L'initramfs détecte la première interface réseau non loopback, active le réseau et monte l'ISO distant via `httpfs2`. La sélection d'interface ne vérifie ni le lien, ni l'accessibilité, ni si cette interface est la bonne sur un système multi-NIC.

Lorsque `ip=` est absent, le démarrage ISO HTTP demande une adresse via DHCP avec `udhcpc`. Lorsque `ip=` est présent, il utilise les champs statiques attendus par le parseur PXE :

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Pour le démarrage ISO HTTP, l'URL détermine toujours le serveur HTTP. Les champs statiques configurent l'adresse client, le masque réseau, la passerelle par défaut et les premières entrées DNS ; le champ port optionnel concerne le téléchargement de fichiers PXE et ne remplace pas le port dans l'URL de l'ISO.

`cache=<MB>` active un cache httpfs de la taille demandée dans `/tmp`. Il s'agit d'un cache, pas d'un téléchargement complet garanti. Le système en cours d'exécution continue de dépendre de l'ISO distant et du réseau sauf si une copie réussie en RAM détache la source.

## Téléchargement de données PXE

Toute valeur `ip=` non vide sélectionne le téléchargement de données PXE, sauf si `from=http://...` a été sélectionné en premier. La syntaxe prise en charge est :

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Le masque réseau est en notation IPv4 pointée. Le port HTTP optionnel est par défaut `7529`.
Les formes génériques du kernel ou de dracut comme `ip=dhcp` et `ip=:::::eth0:dhcp` ne sont pas prises en charge. Le téléchargement de données PXE n'a pas de forme DHCP dans ce parseur.

MiniOS configure la première interface détectée non loopback sans vérifier qu'elle dispose d'un lien fonctionnel. Il demande d'abord `PXEFILELIST` et les fichiers MiniOS listés via HTTP depuis le serveur indiqué. TFTP est un repli limité : il n'est sélectionné que lorsque la première requête HTTP pour `PXEFILELIST` échoue. Ce n'est pas un basculement général d'interface, ni un repli sur support local, ni une récupération après tout échec partiel de téléchargement HTTP.

## Copie et détachement avec `toram=full`

`toram=full` est important pour la découverte car il peut supprimer la dépendance continue à la source sélectionnée. Après la découverte, MiniOS copie l'arborescence de données en RAM puis tente de démonter la source et de déplacer la copie RAM à sa place. Seul un démontage et un déplacement réussis détachent un support local, une ISO montée en boucle ou une ISO HTTP.

Limitations importantes :

- Il n'y a pas de vérification préalable que la RAM disponible peut contenir la copie.
- Lorsque la persistance est demandée, la copie `*` de niveau supérieur omet les fichiers cachés.
- Lorsque la persistance n'est pas demandée, l'entrée `changes` est volontairement omise. Cette branche copie les autres entrées de premier niveau, y compris les fichiers cachés.
- Un échec de copie, de démontage ou de déplacement peut laisser la source d'origine montée. Ne supposez pas que la spécification de `toram=full` rend le retrait du support ou la perte du réseau sans risque ; vérifiez que le détachement a bien réussi.

Consultez [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de combiner `toram` avec `perch` ou `perchdir`.

## Échec et diagnostics

Si les 45 passes locales échouent, MiniOS entre dans son mode d'erreur fatale et ouvre un shell initramfs au lieu de démarrer le système live. Les chemins réseau n'effectuent pas la recherche locale en 45 passes ni ne basculent sur les supports locaux ; selon le résultat partiel, ils peuvent échouer lors de la vérification des données ou à l'installation ultérieure. Quitter un shell fatal ne répare pas la source manquante et peut seulement permettre à l'installation ultérieure d'échouer de façon moins explicite.

Les paramètres de diagnostic utiles sont :

- `debug` active le traçage du shell, des diagnostics supplémentaires et des shells interactifs à plusieurs points de contrôle de l'initramfs. Quittez un shell de point de contrôle pour continuer.
- `timing` affiche le temps écoulé entre les étapes de l'initramfs et un total final.
- `rd.break` demande un shell initramfs juste avant le passage à la racine réelle ; quittez-le pour poursuivre le démarrage.

Dans un shell, examinez `/proc/cmdline`, `/proc/net/dev`, `blkid`, les systèmes de fichiers montés et `/var/log/livedbg`. Commencez par les valeurs exactes `from=`, `ip=` et `bext=` affichées dans `/proc/cmdline`.

## Documentation associée

- [Modes de démarrage](/configuration/Boot-Modes.md)
- [Chargement des modules](/configuration/Initrd-Module-Loading.md)
- [Persistance](/configuration/Initrd-Persistence.md)
- [Démarrage réseau](/installation/Network-Boot.md)
- [Paramètres de démarrage](/configuration/Boot-Parameters.md)
- [Dépannage](/administration/Troubleshooting.md)
