---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# CondinAPT

CondinAPT sélectionne et installe des paquets APT à partir d’une liste dont les entrées peuvent dépendre de variables de configuration Bash. MiniOS l’utilise pour vérifier les prérequis de l’hôte, installer l’ensemble de paquets de base et gérer les modules SquashFS courants.

Cette page décrit l’implémentation de `linux-live/condinapt`. CondinAPT n’est pas un résolveur de dépendances généraliste : il évalue d’abord les filtres et la disponibilité des dépôts, prépare les files d’attente APT, puis installe chaque file sélectionnée en un seul `apt-get`appel.

## Synopsis

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

La liste de paquets et le fichier de configuration doivent être des fichiers ordinaires lisibles. Les fichiers de correspondance et de priorité sont facultatifs.

| Option | Description |
| --- | --- |
| `-l`, `--package-list PATH` | Fichier de liste de paquets |
| `-c`, `--config PATH` | Configuration Bash de confiance |
| `-m`, `--filter-mapping PATH` | Correspondance préfixe-variable |
| `-P`, `--priority-list PATH` | Expressions régulières Bash pour extraire les priorités |
| `-s`, `--simulation` | Sélectionner et afficher les paquets sans les installer |
| `-C`, `--check-only` | Vérifier les noms des paquets installés sans installation |
| `-v`, `--verbose` | Diagnostics des filtres et des files d’attente |
| `-vv`, `--very-verbose` | Diagnostics supplémentaires des files de priorité |
| `-x`, `--xtrace` | Activer le traçage du shell |
| `-f`, `--force` | Exécuter `apt-get update` même si `pkgcache.bin` existe |
| `-h`, `--help` | Afficher l’aide |

CondinAPT s’exécute `apt-get update` hors du mode vérification et si `-f` a été utilisé ou si `/var/cache/apt/pkgcache.bin` n’existe pas. Cela inclut la simulation : `-s` n’est donc pas une simulation à blanc sans effet de bord.

Une installation normale nécessite les droits root. Le mode vérification peut être exécuté sans privilèges ; la simulation nécessite également les droits root lorsqu’elle déclenche une mise à jour APT. L’implémentation actuelle ne relaie pas de manière fiable une erreur de `apt-get update` ; considérez donc toute erreur de mise à jour comme un échec, même si CondinAPT renvoie ensuite `0`.

## Fichiers d’entrée

### Configuration

Le fichier `-c` est chargé avec Bash. Il s’agit de code exécutable, et non d’un format de données inerte : utilisez uniquement un fichier de confiance.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Les tableaux indexés servent de filtres d’appartenance. Une variable scalaire contenant des virgules reste une chaîne exacte unique : `FEATURES="web,database"` ne correspond pas à `+feat=web`.

L’implémentation actuelle analyse les options CLI avant de charger ce fichier.
Les variables de configuration qui réutilisent les noms internes de CondinAPT, comme `VERBOSITY_LEVEL`, peuvent donc remplacer l’état de la CLI. Évitez ces noms dans les configurations génériques.

### Correspondance des filtres

Le fichier facultatif `-m` associe des préfixes courts à des noms de variables Bash :

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Le format doit être exactement `prefix=VariableName` ; les espaces en début ou en fin de ligne ne sont pas supprimés. Les lignes vides et celles dont le premier champ commence par `#` sont ignorées.
En cas de préfixes en double, la dernière valeur est utilisée.

Sans entrée de correspondance, le préfixe lui-même est utilisé comme nom de variable. Une variable scalaire non définie équivaut à une chaîne vide. Un filtre négatif mal orthographié peut donc inclure silencieusement un paquet ; privilégiez une correspondance et utilisez une simulation détaillée lorsque vous ajoutez des filtres.

### Liste des paquets

La syntaxe de ligne autorisée est la suivante :

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Exemples :

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Tout ce qui suit le premier `#` jusqu'à la fin de la ligne est supprimé. Les espaces restants sont normalisés. Les guillemets, les caractères d'échappement, les parenthèses, les groupes imbriqués et les espaces à l'intérieur d'un même jeton de filtre ne sont pas pris en charge. Les jetons inconnus en fin de ligne ne sont pas rejetés : respectez donc la syntaxe ci-dessus au lieu de vous fier à la permissivité de l'analyse.

Placez une cible de version par ligne physique, à la fin de celle-ci. CondinAPT extrait la cible avant d'évaluer les alternatives de paquets. Il est donc impossible d'attribuer différentes valeurs de `@release` aux alternatives d'une même ligne.

## Filtres

Un filtre compare une valeur de configuration par égalité exacte de chaînes, en tenant compte de la casse. Si la variable correspondante est un tableau indexé, la comparaison réussit si l'un des éléments du tableau correspond. Les tableaux associatifs ne sont pas des ensembles d'appartenance.

| Forme | Effet |
| --- | --- |
| `+x=value` | Inclure uniquement si `x` correspond |
| `-x=value` | Exclure si `x` correspond |
| `+{a|b}` | Require at least one member to match |
| `+{a&b}` | Exiger que chaque membre corresponde |
| `-{a|b}` | Exclude when any member matches |
| `-{a&b}` | Exclure uniquement si chaque membre correspond |

Les filtres positifs simples répétés avec le même préfixe sont des alternatives :

```text
audacity +pv=toolbox +pv=ultra
```

Les filtres positifs ayant des préfixes différents doivent tous réussir. Chaque filtre négatif simple constitue un veto indépendant :

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Les membres d'un groupe doivent utiliser un seul type d'opérateur. Ne mélangez pas `|` et `&` dans un même groupe : les groupes ne comportent ni priorité ni imbrication. Pour exprimer « exclure Flux ou exiger Xfce au minimum », utilisez deux filtres :

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternatives et conjonctions

`&&` est prioritaire sur `||`. CondinAPT sépare d'abord les alternatives, puis évalue tous les membres d'une conjonction. Ainsi :

```text
A || B && C
```

signifie `A || (B && C)`.

CondinAPT sélectionne la première alternative dont les filtres et les vérifications de disponibilité des paquets réussissent. Si un membre d'une conjonction échoue, les paquets déjà sélectionnés pour cette conjonction sont annulés, puis l'alternative suivante est évaluée.

Il s'agit d'une sélection préalable, et non d'une nouvelle tentative d'installation ni d'une transaction. Si le `apt-get install` ultérieur au niveau de la file d'attente échoue pour l'alternative choisie, CondinAPT ne revient pas à une branche `||`ultérieure.

Chaque alternative doit répéter ses propres filtres :

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Paquets obligatoires

`!` n’est reconnue qu’au début de l’expression physique complète et s’applique à toutes ses alternatives :

```text
!preferred-package || fallback-package
```

L’expression n’est fatale en mode normal que si aucune alternative ne réussit et qu’un paquet actif ou une version stricte n’est pas disponible. Les filtres peuvent désactiver une ligne obligatoire sans provoquer d’échec. Un échec normal d’installation avec APT interrompt sa file d’attente, quel que soit `!`.

En simulation, une erreur de disponibilité obligatoire est signalée, mais ne suspend pas le traitement de la file d’attente ; la simulation se termine néanmoins avec le code de sortie non nul documenté.

## Versions

| Syntaxe | Comportement |
| --- | --- |
| `package=VERSION` | Privilégier la version exacte ; à défaut, utiliser un candidat sans version |
| `package==VERSION` | Accepter uniquement la version exacte du dépôt |

La disponibilité exacte est vérifiée à partir du champ de version complet de `apt-cache madison`. Si une version stricte non obligatoire n’est pas disponible, cette condition échoue ; une alternative `||` ultérieure peut encore réussir, sinon la ligne est ignorée. Préfixez l’expression avec `!` pour rendre fatale une erreur de disponibilité active.

Lorsque CondinAPT installe la version exacte demandée, il planifie `apt-mark hold` une fois toute la file d’attente APT traitée avec succès. Une version exacte déjà installée est considérée comme satisfaite et n’est pas verrouillée à nouveau. Les échecs de verrouillage ne sont pas transmis comme code de sortie de CondinAPT.

Pour un paquet installé sans version spécifiée, CondinAPT compare la version installée au candidat du dépôt. Si le candidat est différent, il est ajouté de nouveau à la file d’attente ; APT est appelé avec `--allow-downgrades`.

## Files d’attente

`---` termine la file d’attente normale en cours. Tous les paquets sélectionnés dans une file sont transmis à un seul appel non interactif de `apt-get install` avec `--force-confdef`, `--force-confold`, `--allow-downgrades` et `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Les lignes ciblant une version sont retirées du flux normal des files d’attente et regroupées globalement par version. Les lignes visant la même version sont fusionnées, même si elles sont séparées par `---`.
L’ordre d’exécution effectif est le suivant :

1. File d’attente prioritaire sans cible.
2. Files d’attente prioritaires ciblant une version.
3. Files d’attente normales dans l’ordre source.
4. Files d’attente restantes ciblant une version, dans leur ordre de première apparition.

Par conséquent, une ligne ciblant une version placée entre deux lignes normales ne constitue pas une barrière, et les files ciblées sont traitées après toutes les files normales, sauf si elles sont extraites en tant que travaux prioritaires.

La vérification préalable de la disponibilité dans les dépôts ne tient pas compte de la cible ; seul le `apt-get install` reçoit `-t RELEASE`. Vérifiez la disponibilité des paquets ciblés dans les dépôts configurés.

## Liste de priorité

`-P` lit une expression régulière étendue Bash par ligne. Chaque motif est comparé au premier nom de paquet de chaque expression de liste de paquets. En cas de correspondance, l’expression complète — filtres, alternatives, état obligatoire et cible de version inclus — est déplacée vers une file d’attente prioritaire.

```text
^dkms$
^linux-.*
```

Les motifs ne sont pas ancrés, sauf s’ils contiennent des ancres. Une correspondance avec un paquet `&&` ou `||` ultérieur est sans effet ; seul le premier élément correspondant à un nom de paquet est examiné. L’extraction des priorités fusionne également les correspondances provenant de files d’attente normales distinctes. Ne l’utilisez donc pas pour les entrées dont la limite d’origine entre `---` est nécessaire à l’organisation des dépendances.

La priorité signifie que l’évaluation et l’installation ont lieu plus tôt, et non que l’installation est garantie. Les filtres et les vérifications de disponibilité restent appliqués.

## Modes de fonctionnement et code de sortie

### Simulation

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

La simulation évalue les filtres, les versions, les alternatives et les files d’attente, puis affiche les paquets qui seraient transmis à APT. Elle ne garantit pas que l’installation ultérieure réussirait. Une simulation valide renvoie intentionnellement le statut `1`, même si la sélection des paquets réussit.

### Vérification seule

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

La vérification seule évalue les filtres et les opérateurs, mais vérifie uniquement si les noms des paquets sont installés via `dpkg-query`. Elle ne valide ni les versions demandées, ni les candidats des dépôts, ni les versions cibles. Elle renvoie `0` lorsque toutes les expressions actives sont satisfaites et `1` sinon.

La commande `sudo apt install ...` affichée est un diagnostic approximatif. Elle omet les versions et les versions cibles, peut inclure plusieurs alternatives en échec et ne garantit pas de reproduire l’expression d’origine.

### Récapitulatif des statuts

| Cas | Statut |
| --- | --- |
| Aide | `0` |
| Exécution normale réussie | `0` |
| Entrée invalide, échec de disponibilité obligatoire ou échec de la file d’attente APT | `1` |
| Simulation valide | `1` |
| Vérification seule avec des paquets actifs manquants | `1` |

## Gestion spéciale des paquets

L’implémentation comporte un nom de paquet spécial : `qemu-kvm`. Il est accepté lorsque `apt-cache show qemu-kvm` le signale comme purement virtuel. Les autres paquets virtuels ne bénéficient pas d’une résolution générique des fournisseurs. Pour garantir la portabilité, privilégiez les alternatives de fournisseurs explicites.

## MiniOS intégration

### Invocation de module

Pour un module ordinaire, `build-modules` copie le script d’installation vers `/install`, CondinAPT vers `/condinapt`, la configuration générée vers `/minios_build.conf` et le mappage vers `/condinapt.map`. Voici un script d’installation classique :

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Utilisez `SCRIPT_DIR` ; `$CWD` ne fait pas partie du contrat d’un module ordinaire.
`00-core` est une étape de compilation antérieure particulière qui invoque la copie de l’arborescence source sous `/linux-live` à la place.

Le générateur actuel de modules ordinaires copie automatiquement uniquement un fichier nommé `packages.list`. Les modules qui utilisent d’autres noms de fichiers de liste doivent prévoir explicitement ces entrées ; ne supposez pas que tous les fichiers situés à côté de `install` se trouvent à la racine du chroot.

### MiniOS mappage des filtres

`linux-live/condinapt.map` définit actuellement :

| Préfixe | Variable | Signification |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite cible |
| `da` | `DISTRIBUTION_ARCH` | Architecture cible |
| `dp` | `DISTRIBUTION_PROFILE` | `debian` ou `ubuntu` famille de paquets |
| `is` | `INIT_SYSTEM` | Système init sélectionné |
| `de` | `DESKTOP_ENVIRONMENT` | Environnement du module |
| `pv` | `PACKAGE_VARIANT` | Variante du paquet |
| `ik` | `INSTALL_KERNEL` | Activation de l’installation du noyau |
| `kf` | `KERNEL_FLAVOUR` | Variante du noyau |
| `kp` | `KERNEL_PROVIDER` | `distribution` ou `minios` |
| `ks` | `KERNEL_SERIES` | Série réelle du noyau lors de la sélection DKMS `01-kernel` |
| `kc` | `KERNEL_CAPABILITIES` | Tableau des capacités détectées lors de la sélection DKMS `01-kernel` |
| `kbd` | `KERNEL_BUILD_DKMS` | Activation de la compilation DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implémentation d’initramfs |
| `lo` | `LOCALE` | Paramètres régionaux du système |
| `ml` | `MULTILINGUAL` | Activation du multilinguisme |
| `kl` | `KEEP_LOCALES` | Activation de la conservation des paramètres régionaux |

`ks` et `kc` sont des filtres `01-kernel` spéciaux. Lorsque la compilation DKMS est activée, ce module détecte `KERNEL_SERIES` à partir du noyau installé et crée le tableau indexé `KERNEL_CAPABILITIES` dans une configuration temporaire utilisée pour la sélection de ses paquets DKMS. Ces éléments sont absents des configurations de modules ordinaires ; les utiliser dans ce contexte fait échouer les filtres positifs et peut faire passer les filtres négatifs.
`KERNEL_SERIES` ne correspond pas à la préférence `MINIOS_KERNEL_SERIES`. Les capacités actuellement détectées incluent `aufs`, `ntfs3`, `btf_modules` et les pilotes `rtw88_*` pris en charge dans l’arborescence du noyau.

Exemples tirés de la liste actuelle des paquets du noyau :

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Dépannage

Utilisez la simulation détaillée pour examiner la sélection :

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

N’utilisez pas `/dev/stdin` ; `-l` nécessite un fichier ordinaire.

- Si un filtre laisse passer un élément de façon inattendue, vérifiez le mappage exact du préfixe, le type de variable, la casse et la valeur. Vérifiez également qu’aucune variable n’est non définie ou mal orthographiée.
- Si une solution de repli n’est pas sélectionnée, gardez à l’esprit qu’elle intervient lors du préflight, et non après un échec APT au niveau de la file d’attente.
- Si l’installation d’un paquet ciblé échoue, examinez les sources configurées et exécutez `apt-cache policy PACKAGE` ; le préflight ne s’applique pas à `-t RELEASE`.
- Si une version stricte est ignorée, comparez le champ de version exact avec `apt-cache madison PACKAGE`.
- Si l’ordre de la file d’attente vous surprend, tenez compte du regroupement global des cibles et de l’extraction des priorités avant les files d’attente normales.

Pour en savoir plus sur le processus global de compilation, consultez [Building MiniOS](/development/Building-MiniOS).
