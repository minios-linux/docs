---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# CondinAPT

CondinAPT sélectionne et installe des paquets APT à partir d'une liste dont les entrées peuvent dépendre de variables de configuration Bash. MiniOS l'utilise pour les vérifications préalables de l'hôte, l'ensemble de paquets principal et les modules ordinaires SquashFS.

Cette page documente l'implémentation dans `linux-live/condinapt`. CondinAPT n'est pas un solveur de dépendances général : il évalue d'abord les filtres et la disponibilité des dépôts, construit les files d'attente APT, puis installe chaque file sélectionnée en un seul appel `apt-get`.

## Synopsis

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

La liste des paquets et la configuration doivent être des fichiers réguliers et lisibles. Les fichiers de correspondance et de priorité sont optionnels.

| Option | Signification |
| --- | --- |
| `-l`, `--package-list PATH` | Fichier de liste de paquets |
| `-c`, `--config PATH` | Configuration Bash de confiance |
| `-m`, `--filter-mapping PATH` | Correspondance préfixe-vers-variable |
| `-P`, `--priority-list PATH` | Expressions régulières Bash pour l'extraction de priorité |
| `-s`, `--simulation` | Sélectionner et afficher les paquets sans les installer |
| `-C`, `--check-only` | Vérifier les noms de paquets installés sans installation |
| `-v`, `--verbose` | Diagnostics de filtrage et de file d'attente |
| `-vv`, `--very-verbose` | Diagnostics supplémentaires de file de priorité |
| `-x`, `--xtrace` | Activer le traçage du shell |
| `-f`, `--force` | Exécuter `apt-get update` même si `pkgcache.bin` existe |
| `-h`, `--help` | Afficher l'aide |

CondinAPT exécute `apt-get update` lorsqu'il n'est pas en mode vérification seule et que `-f` a été utilisé ou que `/var/cache/apt/pkgcache.bin` n'existe pas. Cela inclut la simulation, donc `-s` n'est pas une exécution à sec sans effet de bord.

L'installation normale nécessite les droits root. Le mode vérification seule peut être lancé sans privilèges ; la simulation requiert également root si elle déclenche une mise à jour APT. L'implémentation actuelle ne propage pas de façon fiable un échec `apt-get update`, donc considérez une erreur de mise à jour comme un échec même si CondinAPT retourne ensuite `0`.

## Fichiers d’entrée

### Configuration

Le fichier `-c` est inclus avec Bash. Il s'agit de code exécutable, et non d'un format de données inerte, donc n'utilisez qu'un fichier de confiance.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Les tableaux indexés fournissent des filtres d'appartenance. Un scalaire contenant des virgules reste une chaîne exacte unique : `FEATURES="web,database"` ne correspond pas à `+feat=web`.

L'implémentation actuelle analyse les options CLI avant d'inclure ce fichier.
Les variables de configuration qui réutilisent les noms internes de CondinAPT, comme `VERBOSITY_LEVEL`, peuvent donc écraser l'état CLI. Évitez ces noms dans les configurations génériques.

### Mappage des filtres

Le fichier optionnel `-m` associe des préfixes courts à des noms de variables Bash :

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Le format est exactement `prefix=VariableName` ; les espaces autour ne sont pas supprimés. Les lignes vides et celles dont le premier champ commence par `#` sont ignorées.
Les doublons de préfixes utilisent la dernière valeur.

En l'absence d'entrée de mappage, le préfixe lui-même est utilisé comme nom de variable. Un scalaire non défini est traité comme une chaîne vide. Une faute de frappe dans un filtre négatif peut donc inclure silencieusement un paquet ; il est donc préférable d'utiliser un mappage et de lancer une simulation verbeuse lors de l'ajout de filtres.

### Liste des paquets

La grammaire sûre pour une ligne est :

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

Tout ce qui suit le premier `#` jusqu'à la fin de la ligne est supprimé. Les espaces restants sont normalisés. Les guillemets, l'échappement, les parenthèses, les groupes imbriqués et les espaces à l'intérieur d'un jeton de filtre ne sont pas pris en charge. Les jetons inconnus en fin de ligne ne sont pas rejetés, donc considérez la grammaire ci-dessus comme une contrainte plutôt que de vous fier à une analyse permissive.

Utilisez une seule cible de version par ligne physique et placez-la à la fin. CondinAPT extrait la cible avant d'évaluer les alternatives de paquets, donc différentes valeurs `@release` ne peuvent pas être attribuées à des alternatives sur la même ligne.

## Filtres

Un filtre compare une valeur de configuration en utilisant l'égalité exacte, sensible à la casse. Si la variable mappée est un tableau indexé, l'égalité avec n'importe quel élément du tableau est acceptée. Les tableaux associatifs ne sont pas des ensembles d'appartenance.

| Forme | Effet |
| --- | --- |
| `+x=value` | Inclure uniquement si `x` correspond |
| `-x=value` | Exclure si `x` correspond |
| `+{a|b}` | Nécessite qu'au moins un membre corresponde |
| `+{a&b}` | Nécessite que tous les membres correspondent |
| `-{a|b}` | Exclure si un membre correspond |
| `-{a&b}` | Exclure uniquement si tous les membres correspondent |

Les filtres positifs simples répétés avec le même préfixe sont des alternatives :

```text
audacity +pv=toolbox +pv=ultra
```

Les filtres positifs avec des préfixes différents doivent tous passer. Chaque filtre négatif simple est un veto indépendant :

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Les membres d'un groupe doivent utiliser un seul type d'opérateur. Ne mélangez pas `|` et `&` dans un même groupe ; il n'y a pas de précédence ou de parenthèse à l'intérieur des groupes. Exprimez « exclure Flux, ou minimum Xfce » avec deux filtres :

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternatives et conjonctions

`&&` a une priorité supérieure à `||`. CondinAPT sépare d'abord les alternatives puis évalue chaque membre d'une conjonction, donc :

```text
A || B && C
```

signifie `A || (B && C)`.

CondinAPT sélectionne la première alternative dont tous les filtres et vérifications de disponibilité de paquets réussissent. Si un membre d'une conjonction échoue, les paquets déjà sélectionnés dans cette conjonction sont annulés et l'alternative suivante est évaluée.

Ceci est une sélection préliminaire, pas une tentative de réinstallation ni une transaction. Si l'opération ultérieure au niveau de la file `apt-get install` échoue pour l'alternative choisie, CondinAPT ne revient pas à une branche `||` suivante.

Chaque alternative doit répéter ses propres filtres :

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Paquets obligatoires

`!` n'est reconnu qu'au début de l'expression physique complète et s'applique à toutes ses alternatives :

```text
!preferred-package || fallback-package
```

L'expression est fatale en mode normal uniquement si aucune alternative ne réussit et qu'un paquet actif ou une version stricte n'est pas disponible. Les filtres peuvent désactiver une ligne obligatoire sans échec. Un échec d'installation APT normal interrompt sa file d'attente, indépendamment de `!`.

En simulation, une erreur de disponibilité obligatoire est signalée mais n'arrête pas le traitement des files ; la simulation se termine quand même avec son statut non nul documenté.

## Versions

| Syntaxe | Comportement |
| --- | --- |
| `package=VERSION` | Préfère la version exacte ; revient à un candidat non versionné si besoin |
| `package==VERSION` | Accepte uniquement la version exacte du dépôt |

La disponibilité exacte est vérifiée par rapport au champ de version complet de `apt-cache madison`. Si une version stricte non obligatoire n'est pas disponible, cette condition échoue ; une alternative `||` suivante peut encore réussir, sinon la ligne est ignorée. Préfixez l'expression avec `!` pour rendre une indisponibilité active fatale.

Lorsque CondinAPT installe la version exacte demandée, il programme `apt-mark hold` après le succès de toute la file APT. Une version exacte déjà installée est considérée comme satisfaite et n'est pas de nouveau gelée. Les échecs de gel ne sont pas propagés comme statut de sortie de CondinAPT.

Pour un paquet installé sans version spécifiée, CondinAPT compare la version installée avec le candidat du dépôt. Si le candidat diffère, il est à nouveau mis en file ; APT est appelé avec `--allow-downgrades`.

## Files d'attente

`---` termine la file normale en cours. Chaque paquet sélectionné dans une file est transmis à un seul appel non interactif `apt-get install` avec `--force-confdef`, `--force-confold`, `--allow-downgrades` et `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Les lignes ciblant une version sont retirées du flux normal et regroupées globalement par version. Les lignes pour la même version sont fusionnées même si elles sont séparées par `---`.
L'ordre effectif d'exécution est :

1. File de priorité sans cible.
2. Files de priorité par version cible.
3. Files normales dans l'ordre du fichier source.
4. Reste des files par version cible dans l'ordre d'apparition.

Ainsi, une ligne cible écrite entre deux lignes normales ne forme pas de barrière, et les files cibles sont exécutées après toutes les files normales sauf si elles sont extraites comme travaux prioritaires.

La vérification préalable de la disponibilité des dépôts n'est pas sensible à la cible ; seul le `apt-get install` final reçoit `-t RELEASE`. Vérifiez les paquets ciblés par rapport aux dépôts configurés.

## Liste de priorité

`-P` lit une expression régulière étendue Bash par ligne. Un motif est comparé au premier nom de paquet de chaque expression de la liste. S'il correspond, l'expression complète, y compris filtres, alternatives, état obligatoire et cible de version, est déplacée dans une file de priorité.

```text
^dkms$
^linux-.*
```

Les motifs ne sont pas ancrés sauf s'ils contiennent des ancres. Faire correspondre un paquet `&&` ou `||` plus loin n'a aucun effet ; seul le premier jeton de paquet est inspecté. L'extraction de priorité fusionne aussi les correspondances de files normales séparées, donc n'utilisez pas cette fonction pour des entrées dont la séparation d'origine `---` est nécessaire pour l'orchestration des dépendances.

La priorité signifie une évaluation et une installation plus précoces, mais pas une installation garantie. Les filtres et vérifications de disponibilité s'appliquent toujours.

## Modes de fonctionnement et codes de sortie

### Simulation

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

La simulation évalue les filtres, versions, alternatives et files d'attente, puis affiche les paquets qui seraient transmis à APT. Elle ne garantit pas que l'installation réelle réussira. Une simulation valide se termine volontairement avec le statut `1`, même si la sélection des paquets aboutit.

### Vérification seule

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

La vérification seule évalue les filtres et opérateurs mais vérifie uniquement si les noms de paquets sont installés via `dpkg-query`. Elle ne valide pas les versions demandées, les candidats du dépôt ou les cibles de version. Elle retourne `0` si chaque expression active est satisfaite et `1` sinon.

La commande `sudo apt install ...` affichée est un diagnostic approximatif. Elle ne conserve ni les versions ni les cibles, peut inclure plusieurs alternatives échouées, et ne garantit pas la reproduction exacte de l'expression d'origine.

### Résumé des statuts

| Cas | Statut |
| --- | --- |
| Aide | `0` |
| Exécution normale réussie | `0` |
| Entrée invalide, échec de disponibilité obligatoire ou échec de file d’attente APT | `1` |
| Simulation valide | `1` |
| Vérification seule avec paquets actifs manquants | `1` |

## Gestion spéciale des paquets

L'implémentation reconnaît un nom de paquet spécial : `qemu-kvm`. Il est accepté lorsque `apt-cache show qemu-kvm` indique qu'il est purement virtuel. Les autres paquets virtuels ne bénéficient pas d'une résolution générique de fournisseur. Privilégiez des alternatives explicites de fournisseur si la portabilité est importante.

## Intégration MiniOS

### Appel de module

Pour un module ordinaire, `build-modules` copie le script d'installation vers `/install`, CondinAPT vers `/condinapt`, la configuration générée vers `/minios_build.conf`, et la carte vers `/condinapt.map`. Un script d'installation classique est :

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Utilisez `SCRIPT_DIR` ; `$CWD` ne fait pas partie du contrat de module ordinaire.
`00-core` est une étape spéciale de compilation antérieure et invoque la copie dans l'arborescence source sous `/linux-live` à la place.

L'outil de construction de modules ordinaires copie automatiquement uniquement un fichier nommé `packages.list`. Les modules utilisant d'autres noms de listes doivent gérer explicitement ces entrées ; ne supposez pas que chaque fichier à côté de `install` apparaît à la racine du chroot.

### Carte de filtres MiniOS

`linux-live/condinapt.map` définit actuellement :

| Préfixe | Variable | Signification |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite cible |
| `da` | `DISTRIBUTION_ARCH` | Architecture cible |
| `dp` | `DISTRIBUTION_PROFILE` | Famille de paquets `debian` ou `ubuntu` |
| `is` | `INIT_SYSTEM` | Système d'init sélectionné |
| `de` | `DESKTOP_ENVIRONMENT` | Environnement du module |
| `pv` | `PACKAGE_VARIANT` | Variante du paquet |
| `ik` | `INSTALL_KERNEL` | Activation de l'installation du noyau |
| `kf` | `KERNEL_FLAVOUR` | Saveur du noyau |
| `kp` | `KERNEL_PROVIDER` | `distribution` ou `minios` |
| `ks` | `KERNEL_SERIES` | Série réelle du noyau lors de la sélection DKMS `01-kernel` |
| `kc` | `KERNEL_CAPABILITIES` | Tableau de capacités détectées lors de la sélection DKMS `01-kernel` |
| `kbd` | `KERNEL_BUILD_DKMS` | Activation de la compilation DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implémentation de l'initramfs |
| `lo` | `LOCALE` | Locale système |
| `ml` | `MULTILINGUAL` | Activation multilingue |
| `kl` | `KEEP_LOCALES` | Conservation de la locale |

`ks` et `kc` sont des filtres spéciaux `01-kernel`. Lorsque la compilation DKMS est activée, ce module détecte `KERNEL_SERIES` à partir du noyau installé et crée le tableau indexé `KERNEL_CAPABILITIES` dans une configuration temporaire utilisée pour la sélection de ses paquets DKMS. Ils ne sont pas présents dans les configurations de modules ordinaires ; les utiliser dans ce contexte fait échouer les filtres positifs et peut faire passer les filtres négatifs.
`KERNEL_SERIES` n'est pas la préférence `MINIOS_KERNEL_SERIES`. Les capacités détectées actuellement incluent `aufs`, `ntfs3`, `btf_modules` et les pilotes `rtw88_*` pris en charge dans l'arbre.

Exemples issus de la liste actuelle des paquets noyau :

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Dépannage

Utilisez la simulation verbeuse pour inspecter la sélection :

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

N'utilisez pas `/dev/stdin` ; `-l` nécessite un fichier régulier.

- Si un filtre passe de façon inattendue, vérifiez la correspondance exacte du préfixe, le type de variable, la casse et la valeur. Vérifiez si une variable est non définie ou mal orthographiée.
- Si un repli n'est pas sélectionné, rappelez-vous que le repli intervient lors de la sélection préliminaire, pas après un échec APT au niveau de la file.
- Si un paquet ciblé échoue, vérifiez les sources configurées et lancez `apt-cache policy PACKAGE` ; la vérification préalable n'applique pas `-t RELEASE`.
- Si une version stricte est ignorée, comparez le champ de version exact avec `apt-cache madison PACKAGE`.
- Si l'ordre des files est surprenant, tenez compte du regroupement global par cible et de l'extraction de priorité avant les files normales.

Pour le flux de travail de compilation complet, voir [Compilation de MiniOS](/development/Building-MiniOS).
