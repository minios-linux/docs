---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# Construction de MiniOS

MiniOS est assemblée à partir d’une image SquashFS de base, de modules d’extension ordonnés, du noyau et des fichiers de démarrage, ainsi que d’une configuration générée. Cette page décrit les interfaces de construction actuelles de l’arborescence des sources et les dépendances entre leurs sorties.

Exécutez `./minios-cmd --help`, `./minios-live --help`, puis examinez le fichier `build.conf` sélectionné avant la construction. Ces fichiers font autorité pour la version extraite.

## Prérequis

Effectuez la construction sur Debian ou Ubuntu en disposant d’un espace libre suffisant sous `BUILD_DIR` et `/tmp`.
Une cible de bureau classique nécessite au moins 20 Gio. Les opérations de construction requièrent les privilèges root pour debootstrap, les chroots, les montages, les périphériques loop et la création d’images ; l’affichage de l’aide ne les nécessite pas.

La liste de paquets hôte faisant autorité se trouve dans `linux-live/prerequisites.list`. Pour la version extraite actuelle, vous pouvez l’installer avec :

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

Dans une copie des sources, `minios-live` vérifie cette liste avant la construction, sauf si `SKIP_SETUP_HOST=true`. Sur un hôte classique, il signale les paquets manquants et s’arrête ; l’installation automatique est utilisée uniquement lors de la construction du conteneur.

La configuration par défaut vérifie la connectivité Internet. Cette vérification peut être désactivée avec `CHECK_INTERNET_CONNECTION=false` et est ignorée si un dépôt de cache APT est prêt à l’emploi, mais tous les paquets et fichiers de démarrage requis doivent tout de même être disponibles dans les dépôts ou caches configurés.

Si `USE_APT_CACHER=true`, un service apt-cacher-ng accessible doit déjà être configuré à l’adresse `APT_CACHER_ADDRESS` ; sinon, définissez l’option sur `false` avant la construction.

::: danger Confiance dans l’amorçage
Le processus d’amorçage actuel appelle debootstrap avec `--no-check-gpg` et récupère la clé d’archive MiniOS via HTTP non authentifié. N’utilisez pas l’image obtenue comme artefact de publication fiable tant que ces chemins des sources ne garantissent pas l’authentification de la clé et la vérification de l’amorçage.
:::

## Construction rapide

Clonez le dépôt et exécutez le frontal depuis sa racine :

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Les quatre options de cible sont obligatoires si aucun fichier de configuration n’est sélectionné :

| Option | Paramètre |
| --- | --- |
| `-d`, `--distribution` | Suite de la distribution cible |
| `-a`, `--architecture` | Architecture cible |
| `-de`, `--desktop-environment` | Environnement de modules |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox`, ou `ultra` |

Les valeurs actuellement prises en charge pour la distribution, l’architecture, le bureau, la compression et la variante sont indiquées dans `linux-live/build.conf`. Ne déduisez pas la prise en charge d’une ancienne commande d’exemple.

## Interfaces de construction

### `minios-cmd`

`minios-cmd` copie le modèle de configuration dans le répertoire de travail cible, écrit les paramètres de l’interface dans cette copie et lance le `minios-live -` pipeline complet. Options courantes :

| Option | Effet |
| --- | --- |
| `-b`, `--build-dir` | Sélectionner la racine des fichiers de build |
| `-c`, `--compression-type` | Sélectionner la compression SquashFS |
| `-kp`, `--kernel-provider` | Sélectionner `distribution` ou `minios` |
| `-kf`, `--kernel-flavour` | Sélectionner une variante du noyau de la distribution |
| `-mk`, `--minios-kernel` | Sélectionner le fournisseur du noyau MiniOS |
| `-mks`, `--minios-kernel-series` | Sélectionner `auto`, `6.1`, ou `6.12` et indiquer le fournisseur MiniOS |
| `-kpm`, `--kernel-payload-mode` | Sélectionner `runtime` ou `full` |
| `-dkms`, `--kernel-build-dkms` | Construire les pilotes facultatifs pour le noyau sélectionné |
| `-l`, `--locale` | Définir la langue du système |
| `-ml`, `--multilingual` | Générer plusieurs paramètres régionaux |
| `-kl`, `--keep-locales` | Conserver les paramètres régionaux disponibles |
| `-tz`, `--timezone` | Définir le fuseau horaire du système live |
| `-ib`, `--initramfs-builder` | Sélectionner `livekit` ou `dracut` |
| `-mln`, `--menu-language` | Sélectionner la langue du menu de démarrage |

Par exemple :

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Générer une configuration sans lancer le build :

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sans destination différente, cette commande écrit `build/build.conf`. L’interface nécessite toujours les droits root dans ce mode.

`--config-file FILE` sélectionne une configuration à copier. L’implémentation actuelle écrit ensuite dans la copie de travail les valeurs analysées de la ligne de commande et les valeurs par défaut non vides de l’interface, malgré la formulation plus concise dans `--help`. Pour utiliser une configuration exacte, gérée manuellement, lancez directement `minios-live` et vérifiez le fichier actif au lieu de vous fier à la fusion effectuée par l’interface.

Ne combinez pas `--config-only` avec `--config-file` pointant vers une configuration existante : le mode configuration seule copie le modèle par défaut à cet emplacement.
Utilisez `-b DIR --config-only` pour choisir une autre destination pour la configuration générée.

### `minios-live`

`minios-live` est le backend de préparation. Dans une copie du dépôt source, il lit par défaut `linux-live/build.conf` ; une copie installée lit `/etc/minios-live/build.conf`. Sélectionnez un autre fichier et une autre racine de sortie à l’aide de variables d’environnement :

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Utilisez un chemin `BUILD_CONF` absolu pour `sudo`. Les fichiers de configuration sont interprétés comme des scripts Bash : utilisez uniquement des fichiers fiables. Le backend ne propose aucun argument pour remplacer des variables de configuration individuelles.

## Étapes du build

Le pipeline s’exécute dans cet ordre :

1. `build-bootstrap` crée la racine minimale cible avec debootstrap.
2. `build-chroot` installe et configure le système de base.
3. `build-live` crée le `00-core` module SquashFS.
4. `build-modules` construit les modules ordonnés de l’environnement sélectionné.
5. `build-boot` génère l’initramfs, le noyau, les fichiers EFI et le chargeur de démarrage.
6. `build-config` génère MiniOS et la configuration de démarrage.
7. `build-iso` publie l’ISO amorçable et sa somme de contrôle.
8. `remove-sources` supprime le répertoire de travail sélectionné si cette option est configurée.

Les noms avec traits d’union présentés ci-dessus et les formes avec traits de soulignement sont tous acceptés.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

Une commande partielle ne recrée pas les entrées omises. `build-iso` ne fait que empaqueter l’arborescence d’image préparée, et `build-modules` ne peut pas recréer `00-core`. Après avoir modifié une étape en amont, relancez le build jusqu’à la dernière étape qui en dépend.

Un pipeline complet commence par `build-bootstrap`, qui supprime les répertoires `core/` et `image/` existants de la cible sélectionnée. Sauvegardez tout contenu qui ne peut pas être régénéré avant de commencer ; les arborescences générées de la cible sont des sorties de build, pas un espace de stockage durable pour les sources.

Si `REMOVE_SOURCES=true`, l’étape finale `remove-sources` supprime puis recrée l’intégralité du répertoire de travail `build/<distribution>-<variant>-<architecture>/` et pas seulement les archives de sources téléchargées. Les ISO publiées, les caches partagés et les journaux situés en dehors de ce répertoire sont conservés.

## Configuration

`linux-live/build.conf` contrôle l’identité de la cible, le noyau, les paramètres régionaux, le chargeur de démarrage, l’utilisateur live, les services, les caches, les instantanés, le nettoyage et la publication. Voici les principaux groupes :

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT`, et `PACKAGE_VARIANT` sélectionnent la cible et la chaîne de modules.
- `COMP_TYPE` contrôle la compression SquashFS.
- `LIVE_MODULE_MODE` sélectionne `merged` (la valeur par défaut actuelle pour toutes les variantes) ou `simple` l’intégration live-config ; ce choix n’est plus déterminé uniquement par la taille de l’édition.
- `KERNEL_*` et `MINIOS_KERNEL_SERIES` contrôlent l’acquisition du noyau et sa charge utile.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG`, et `SERIAL_CONSOLE` contrôlent les artefacts de démarrage.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO`, et `USE_APT_CACHER` contrôlent les entrées réutilisables.
- `VERBOSITY_LEVEL` accepte `0`, `1`, ou `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES`, et `BUILD_TEST_ISO` contrôlent la publication et le nettoyage.

Ne modifiez pas un `build/<target>/build.conf` généré pour remplacer la maintenance de la configuration source sélectionnée.

### Sélection du noyau

Le `distribution` provider résout le noyau Debian ou Ubuntu sélectionné et, si DKMS est activé, les en-têtes correspondants dans un état APT signé et isolé.
`KERNEL_AUTO_SELECT=true` déduit la suite source et l’architecture à partir de la cible userspace. Définissez-le sur `false` pour utiliser les champs manuels de distribution, d’architecture, de version, de snapshot et de stratégie de mise à jour dans `build.conf`.

Le `minios` provider installe `linux-image-SERIES-mos-ARCH`, vérifie la prise en charge de AUFS et utilise les en-têtes MiniOS correspondants pour DKMS. Il nécessite `KERNEL_FLAVOUR=none` ainsi que des architectures de paquets userspace et noyau correspondantes.
Dans le code actuel, `MINIOS_KERNEL_SERIES=auto` correspond à `6.12` ; utilisez explicitement `6.1` lorsque cette série est nécessaire.

`KERNEL_PAYLOAD_MODE=runtime` conserve l’arborescence des modules du noyau, la configuration du noyau, `System.map`, les métadonnées de déploiement et l’intégration à l’exécution sous `modprobe.d`, `modules-load.d`, et `udev/rules.d`. Il supprime les paquets nécessaires uniquement à la compilation, les en-têtes, les sources DKMS, les outils de compilation et les paquets initramfs. Le firmware reste géré par `02-firmware`. `full` conserve une charge utile de diagnostic plus complète.

## Système de modules

Les sources des modules se trouvent sous `linux-live/scripts/`. Un environnement situé sous `linux-live/environments/<desktop>/` contient des liens symboliques ordonnés vers les sources utilisées. Le nom propre à l’environnement détermine l’ordre de compilation et peut renuméroter une source partagée. Exemple :

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` est généré par `build-live` et ne constitue pas un lien d’environnement ordinaire.
Les modules `01` et suivants sont cumulatifs : chacun est compilé par-dessus les modules inférieurs applicables. `skip_conditions.conf` peut omettre des entrées pour une cible ; examinez donc l’environnement sélectionné au lieu de supposer qu’il existe une chaîne universelle.

Utilisez `linux-live/scripts/10-example/` comme modèle de création actuel. Un module peut contenir :

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

Seuls les fichiers nécessaires au module sont requis. `build`, `postinstall`, les conditions d’exclusion, les correctifs et les arborescences rootcopy sont facultatifs. `build` et `patches/` ne sont pas disponibles pour `00-core`.

La propriété des fichiers sur l’hôte n’est pas préservée dans les arborescences rootcopy ; les fichiers copiés appartiennent généralement à `root:root`. Un manifeste `.minios-ownership` placé dans une arborescence rootcopy utilise :

```text
owner:group relative/path
```

Les chemins doivent rester dans l’arborescence. L’hôte applique immédiatement le manifeste et résout les noms à l’aide de sa base de comptes. Utilisez des valeurs numériques de `UID:GID` pour les comptes présents uniquement sur la cible, ou définissez la propriété depuis `install` ou `postinstall` dans le chroot. Déplacer le manifeste vers `rootcopy-postinstall/` ne change pas la résolution des noms.

Comme le contrôle de confinement actuel ne canonicalise pas le chemin cible, n’utilisez jamais de composants `..` ni de composants de lien symbolique dans les chemins du manifeste. Inspectez les arborescences rootcopy avant une compilation avec privilèges élevés ; un chemin conçu à cette fin peut permettre à `chown` côté hôte de sortir de l’arborescence copiée.

Pour les paquets, les scripts d’installation ordinaires des modules utilisent les fichiers copiés dans le chroot par `build-modules` :

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

Voir [CondinAPT](/development/CondinAPT) pour la syntaxe des listes de paquets et la table de filtres MiniOS actuelle.

### Ajouter un module

Copiez le modèle, puis créez un lien vers celui-ci dans chaque environnement visé, à la position souhaitée propre à l’environnement :

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adaptez `packages.list`, les scripts, les métadonnées et le contenu rootcopy avant la compilation.
Vérifiez chaque bureau, variante, distribution et architecture déclarés.

## Reconstruire en toute sécurité

Les artefacts des modules existants sont ignorés. Lorsqu’un module cumulatif inférieur change, supprimez son artefact ainsi que tous les artefacts des modules suivants avant d’exécuter `build-modules` ; conserver les modules supérieurs préserverait du contenu compilé à partir de l’ancienne couche inférieure. Identifiez les artefacts d’après l’ordre des modules dans l’environnement sélectionné et leur nom, car les conditions d’exclusion peuvent créer des trous dans la numérotation.

La couche du noyau est un cas particulier. Pour reconstruire uniquement `01-kernel`, supprimez son artefact pour la cible sélectionnée, puis reconstruisez depuis les modules jusqu’à la publication :

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Vérifiez le chemin de la cible avant la suppression. N’appliquez pas cette méthode à `00-core` et ne supposez pas qu’elle est sans risque pour les modules `02` et suivants.

Pour un module ordinaire tel que `03-gui-base`, supprimez son artefact ainsi que tous les artefacts des modules applicables suivants, puis exécutez la même plage de `build-modules -`. Pour les changements concernant uniquement initramfs, EFI ou le démarrage, laissez les modules SquashFS en place et exécutez :

```bash
sudo ./minios-live build-boot -
```

Effectuez une compilation complète après toute modification de `00-core`, de la configuration bootstrap/chroot, de l’identité de la cible, de la stratégie des dépôts ou d’une autre entrée qui ne peut pas être isolée à une étape ultérieure.

## Sorties et journaux

Avec la configuration par défaut `BUILD_DIR`, les chemins importants sont :

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` et `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Les noms ISO dépendent des paramètres de compilation, du mode de publication et des horodatages. Utilisez le chemin affiché par la compilation réussie au lieu d’essayer de deviner le nom complet du fichier.

## Secrets et artefacts de débogage

Ne placez pas de jeton Ubuntu Pro dans le système de gestion de versions, la documentation, l’historique du shell ou des journaux partagés. Préférez un fichier de configuration privé situé en dehors du dépôt :

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Ne définissez `USE_UBUNTU_PRO=true` et `UBUNTU_PRO_TOKEN=...` que dans ce fichier. La compilation supprime l’état Pro de l’image, mais le fichier sur l’hôte contient toujours le secret.

`DEBUG_SSH_KEYS=true` génère des clés privées à des fins de débogage. Considérez l’image obtenue comme temporaire et ne la publiez jamais sans avoir vérifié que la clé est absente.

Rétablir l’option à `false` ne supprime pas les clés déjà générées dans `build/<target>/image/minios/debug_ssh_key`, les fichiers `authorized_keys.*` adjacents, ni `build/<target>/debug_ssh_key`. Utilisez une cible vierge ou supprimez explicitement ces fichiers, puis inspectez l’arborescence ISO avant publication.

## Dépannage

- Les échecs de l’amorçage initial sont généralement liés à l’accès aux dépôts, à la prise en charge de debootstrap, à l’architecture, aux instantanés ou à des prérequis manquants sur l’hôte.
- Les échecs du système de base et des modules sont généralement liés à la disponibilité des paquets, aux filtres CondinAPT, aux scripts des responsables de paquets, au contenu de rootcopy ou à un module inférieur obsolète.
- Les échecs au démarrage sont généralement liés au noyau sélectionné, au générateur d’initramfs, à l’obtention des fichiers EFI, à la génération de GRUB/SYSLINUX ou à des fichiers nécessaires au démarrage manquants.
- Les échecs de création de l’ISO sont généralement liés à l’arborescence de l’image préparée, à xorriso, à l’espace de stockage disponible ou aux paramètres de nettoyage.

Après l’interruption d’une compilation avec privilèges, vérifiez les montages sous le répertoire de travail cible avant de réessayer. Consultez le fichier `build/log/build-*.log` correspondant ; ne modifiez pas sur place les overlays générés ni les fichiers `.sb`.

## Documentation associée

- [Gestion des modules](/preparing-and-customizing/Managing-Modules)
- [Créer des images personnalisées](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
