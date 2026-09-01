---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# Construction de MiniOS

MiniOS est assemblé à partir d'une image de base SquashFS, de modules d’extension ordonnés, de fichiers noyau et boot, ainsi que de la configuration générée. Cette page décrit les interfaces de construction actuelles de l’arborescence source et les dépendances entre leurs sorties.

Exécutez `./minios-cmd --help`, `./minios-live --help`, et vérifiez le fichier `build.conf` sélectionné avant la construction. Ces fichiers font autorité pour la version extraite.

## Prérequis

Construisez sur Debian ou Ubuntu avec suffisamment d’espace libre sous `BUILD_DIR` et `/tmp`.
Une cible desktop typique nécessite au moins 20 Gio. Les opérations de construction requièrent les droits root pour debootstrap, les chroots, les montages, les périphériques loop et la création d’images ; l’affichage de l’aide ne le requiert pas.

La liste officielle des paquets hôtes est `linux-live/prerequisites.list`. Pour l’extraction courante, elle peut être installée avec :

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

Dans une extraction source, `minios-live` vérifie cette liste avant la construction sauf si `SKIP_SETUP_HOST=true`. Sur un hôte normal, il signale les paquets manquants et s’arrête ; l’installation automatique est utilisée uniquement par le chemin de construction en conteneur.

La configuration par défaut vérifie la connectivité Internet. Ce test peut être désactivé avec `CHECK_INTERNET_CONNECTION=false` et est ignoré pour un dépôt cache APT préparé, mais tous les paquets et fichiers boot requis doivent toujours être disponibles via les dépôts ou caches configurés.

Si `USE_APT_CACHER=true`, un service apt-cacher-ng accessible doit déjà être configuré à `APT_CACHER_ADDRESS` ; sinon, définissez l’option sur `false` avant la construction.

::: danger Confiance dans le bootstrap
Le chemin de bootstrap actuel appelle debootstrap avec `--no-check-gpg` et récupère la clé d’archive MiniOS via HTTP non authentifié. N’utilisez pas l’image résultante comme artefact de publication fiable tant que ces chemins sources n’imposent pas la vérification authentifiée des clés et du bootstrap.
:::

## Construction rapide

Clonez le dépôt et exécutez le frontal depuis sa racine :

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Les quatre options de cible sont requises lorsqu’aucun fichier de configuration n’est sélectionné :

| Option | Réglage |
| --- | --- |
| `-d`, `--distribution` | Suite de distribution cible |
| `-a`, `--architecture` | Architecture cible |
| `-de`, `--desktop-environment` | Environnement de module |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox` ou `ultra` |

Les valeurs actuellement supportées pour la distribution, l’architecture, le bureau, la compression et la variante sont listées dans `linux-live/build.conf`. Ne déduisez pas la prise en charge à partir d’un ancien exemple de commande.

## Interfaces de construction

### `minios-cmd`

`minios-cmd` copie le modèle de configuration dans le répertoire de travail cible, écrit les paramètres du frontal dans cette copie, puis lance l’ensemble du pipeline `minios-live -`. Les options courantes incluent :

| Option | Effet |
| --- | --- |
| `-b`, `--build-dir` | Sélectionner la racine de sortie de la construction |
| `-c`, `--compression-type` | Sélectionner la compression SquashFS |
| `-kp`, `--kernel-provider` | Sélectionner `distribution` ou `minios` |
| `-kf`, `--kernel-flavour` | Sélectionner une saveur de noyau de distribution |
| `-mk`, `--minios-kernel` | Sélectionner le fournisseur de noyau MiniOS |
| `-mks`, `--minios-kernel-series` | Sélectionner `auto`, `6.1` ou `6.12` et impliquer le fournisseur MiniOS |
| `-kpm`, `--kernel-payload-mode` | Sélectionner `runtime` ou `full` |
| `-dkms`, `--kernel-build-dkms` | Construire des pilotes optionnels pour le noyau sélectionné |
| `-l`, `--locale` | Définir la locale système |
| `-ml`, `--multilingual` | Générer plusieurs locales |
| `-kl`, `--keep-locales` | Conserver les locales disponibles |
| `-tz`, `--timezone` | Définir le fuseau horaire du système live |
| `-ib`, `--initramfs-builder` | Sélectionner `livekit` ou `dracut` |
| `-mln`, `--menu-language` | Sélectionner la langue du menu de démarrage |

Par exemple :

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Générez une configuration sans lancer la construction :

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sans autre destination, ceci écrit `build/build.conf`. Le frontal requiert toujours les droits root dans ce mode.

`--config-file FILE` sélectionne une configuration à copier. L’implémentation actuelle écrit ensuite les valeurs analysées de la ligne de commande et les valeurs par défaut non vides du frontal dans la copie de travail, malgré la formulation plus courte dans `--help`. Pour une configuration exacte, maintenue manuellement, lancez directement `minios-live` et vérifiez le fichier actif au lieu de vous fier à la fusion du frontal.

Ne combinez pas `--config-only` avec `--config-file` pointant vers une configuration existante : le mode config-only copie le modèle par défaut à cet emplacement.
Utilisez `-b DIR --config-only` pour choisir une destination générée distincte.

### `minios-live`

`minios-live` est le backend en étapes. Dans une extraction source, il lit par défaut `linux-live/build.conf` ; une copie installée lit `/etc/minios-live/build.conf`. Sélectionnez un autre fichier et une racine de sortie via des variables d’environnement :

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Utilisez un chemin absolu `BUILD_CONF` à travers `sudo`. Les fichiers de configuration sont interprétés comme des scripts Bash, n’utilisez donc que des fichiers de confiance. Le backend ne propose aucun paramètre pour surcharger individuellement les variables de configuration.

## Étapes de construction

Le pipeline s’exécute dans cet ordre :

1. `build-bootstrap` crée la racine minimale cible avec debootstrap.
2. `build-chroot` installe et configure le système de base.
3. `build-live` crée le module `00-core` SquashFS.
4. `build-modules` construit les modules ordonnés de l’environnement sélectionné.
5. `build-boot` génère les fichiers initramfs, noyau, EFI et bootloader.
6. `build-config` génère MiniOS et la configuration de démarrage.
7. `build-iso` publie l’ISO amorçable et le checksum.
8. `remove-sources` supprime le répertoire de travail sélectionné si configuré.

Les noms avec tirets ci-dessus et les formes avec underscores sont tous acceptés.

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

Une commande partielle ne recrée pas les entrées omises. `build-iso` ne fait qu’emballer l’arborescence d’image préparée, et `build-modules` ne peut pas recréer `00-core`. Reconstruisez jusqu’à la dernière étape dépendante après modification d’un producteur antérieur.

Un pipeline complet commence par `build-bootstrap`, qui supprime les répertoires `core/` et `image/` existants de la cible sélectionnée. Sauvegardez tout contenu non régénérable avant de commencer ; les arbres cibles générés sont des sorties de construction, pas un stockage source durable.

Si `REMOVE_SOURCES=true`, l’étape finale `remove-sources` supprime et recrée complètement le répertoire de travail `build/<distribution>-<variant>-<architecture>/`, et pas seulement les archives sources téléchargées. Les ISOs publiés, caches partagés et journaux hors de ce répertoire restent.

## Configuration

`linux-live/build.conf` contrôle l’identité de la cible, le noyau, la locale, le bootloader, l’utilisateur live, les services, les caches, les snapshots, le nettoyage et la publication. Les groupes importants incluent :

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT` et `PACKAGE_VARIANT` sélectionnent la cible et la chaîne de modules.
- `COMP_TYPE` contrôle la compression SquashFS.
- `KERNEL_*` et `MINIOS_KERNEL_SERIES` contrôlent l’acquisition et le contenu du noyau.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG` et `SERIAL_CONSOLE` contrôlent les artefacts de démarrage.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO` et `USE_APT_CACHER` contrôlent les entrées réutilisables.
- `VERBOSITY_LEVEL` accepte `0`, `1` ou `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES` et `BUILD_TEST_ISO` contrôlent la publication et le nettoyage.

N’éditez pas un `build/<target>/build.conf` généré en remplacement de la maintenance de la configuration source sélectionnée.

### Sélection du noyau

Le fournisseur `distribution` résout le noyau Debian ou Ubuntu sélectionné et, lorsque DKMS est activé, les en-têtes correspondants dans un état APT signé isolé.
`KERNEL_AUTO_SELECT=true` déduit sa suite source et son architecture de la cible userspace. Réglez-le sur `false` pour utiliser les champs manuels de distribution, d’architecture, de version, de snapshot et de politique de mise à jour dans `build.conf`.

Le fournisseur `minios` installe `linux-image-SERIES-mos-ARCH`, vérifie la prise en charge de AUFS, et utilise les en-têtes MiniOS correspondants pour DKMS. Il requiert `KERNEL_FLAVOUR=none` et des architectures de paquets userspace et noyau identiques.
Dans le code actuel, `MINIOS_KERNEL_SERIES=auto` correspond à `6.12` ; utilisez explicitement `6.1` lorsque cette série est requise.

`KERNEL_PAYLOAD_MODE=runtime` conserve l’arborescence des modules noyau, la configuration du noyau, `System.map`, les métadonnées de déploiement et l’intégration runtime sous `modprobe.d`, `modules-load.d` et `udev/rules.d`. Il supprime l’état des paquets de construction seulement, les en-têtes, les sources DKMS, les outils de compilation et les paquets initramfs. Le firmware reste la propriété de `02-firmware`. `full` conserve une charge utile de diagnostic plus large.

## Système de modules

Les sources de modules se trouvent sous `linux-live/scripts/`. Un environnement sous `linux-live/environments/<desktop>/` contient des liens symboliques ordonnés vers les sources qu’il utilise. Le nom local à l’environnement contrôle l’ordre de construction et peut renuméroter une source partagée, par exemple :

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` est produit par `build-live` et n’est pas un lien d’environnement ordinaire.
Les modules `01` et suivants sont cumulatifs : chacun est construit au-dessus des modules inférieurs applicables. `skip_conditions.conf` peut omettre des entrées pour une cible, donc vérifiez l’environnement sélectionné au lieu de supposer une chaîne universelle.

Utilisez `linux-live/scripts/10-example/` comme modèle d’auteur actuel. Un module peut contenir :

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

Seuls les fichiers nécessaires au module sont requis. `build`, `postinstall`, les conditions de saut, les patchs et les arbres rootcopy sont optionnels. `build` et `patches/` ne sont pas disponibles pour `00-core`.

La propriété hôte dans les arbres rootcopy n’est pas conservée ; les fichiers copiés deviennent normalement `root:root`. Un manifeste `.minios-ownership` à l’intérieur d’un arbre rootcopy utilise :

```text
owner:group relative/path
```

Les chemins doivent rester dans l’arbre. L’hôte applique le manifeste immédiatement et résout les noms via la base de comptes de l’hôte. Utilisez des valeurs numériques `UID:GID` pour les comptes cibles uniquement, ou définissez la propriété depuis `install` ou `postinstall` dans le chroot. Déplacer le manifeste vers `rootcopy-postinstall/` ne change pas la résolution des noms.

Comme la vérification de confinement actuelle ne canonicalise pas le chemin cible, n’utilisez jamais de composants `..` ou de liens symboliques dans les chemins de manifeste. Vérifiez les arbres rootcopy avant une construction avec privilèges ; un chemin malveillant peut faire sortir `chown` du dossier copié côté hôte.

Pour les paquets, les scripts d’installation de module ordinaires utilisent les fichiers copiés dans le chroot par `build-modules` :

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

Voir [CondinAPT](/development/CondinAPT) pour la syntaxe des listes de paquets et la carte de filtrage MiniOS actuelle.

### Ajouter un module

Copiez le modèle, puis liez-le dans chaque environnement visé à la position locale souhaitée :

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adaptez `packages.list`, les scripts, les métadonnées et le contenu rootcopy avant la construction.
Validez chaque bureau, variante, distribution et architecture déclarés.

## Reconstruire en toute sécurité

Les artefacts de module existants sont ignorés. Lorsqu’un module cumulatif inférieur change, supprimez son artefact ainsi que toute la chaîne des modules supérieurs avant d’exécuter `build-modules` ; conserver les modules supérieurs préserverait du contenu construit sur l’ancien module inférieur. Identifiez les artefacts par l’ordre d’environnement sélectionné et le nom du module, car les conditions de saut peuvent créer des écarts de numérotation.

La couche noyau est un cas particulier. Pour ne reconstruire que `01-kernel`, supprimez son artefact pour la cible sélectionnée et reconstruisez à partir des modules jusqu’à la publication :

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Confirmez le chemin cible avant suppression. N’appliquez pas ce raccourci à `00-core` ni ne supposez qu’il est sûr pour les modules `02` et suivants.

Pour un module ordinaire comme `03-gui-base`, supprimez son artefact et tous les artefacts de modules ultérieurs applicables, puis exécutez la même plage `build-modules -`. Pour les changements initramfs, EFI ou boot uniquement, laissez les modules SquashFS en place et lancez :

```bash
sudo ./minios-live build-boot -
```

Effectuez une construction complète après des modifications de `00-core`, du bootstrap/chroot, de l’identité cible, de la politique de dépôt ou de tout autre paramètre ne pouvant être isolé à une étape ultérieure.

## Sorties et journaux

Avec la valeur par défaut `BUILD_DIR`, les chemins importants sont :

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` et `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Les noms d’ISO dépendent des paramètres de construction, du mode de publication et des horodatages. Utilisez le chemin affiché par la construction réussie au lieu de prédire le nom complet.

## Secrets et artefacts de débogage

Ne placez jamais un jeton Ubuntu Pro dans le contrôle de version, la documentation, l’historique shell ou les journaux partagés. Préférez une configuration privée hors du dépôt :

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Définissez `USE_UBUNTU_PRO=true` et `UBUNTU_PRO_TOKEN=...` uniquement dans ce fichier. La construction retire l’état Pro de l’image, mais le fichier côté hôte contient toujours le secret.

`DEBUG_SSH_KEYS=true` génère du matériel de clé privée pour le débogage. Considérez l’image résultante comme jetable et ne la publiez jamais sans vérifier que la clé est absente.

Remettre l’option sur `false` ne supprime pas les clés déjà générées dans `build/<target>/image/minios/debug_ssh_key`, les fichiers `authorized_keys.*` adjacents ou `build/<target>/debug_ssh_key`. Utilisez une cible propre ou supprimez explicitement ces fichiers, puis inspectez l’arborescence ISO avant publication.

## Dépannage

- Les échecs de bootstrap concernent généralement l’accessibilité des dépôts, la prise en charge de debootstrap, l’architecture, les snapshots ou les prérequis manquants sur l’hôte.
- Les échecs du système de base et des modules concernent généralement la disponibilité des paquets, les filtres CondinAPT, les scripts de maintenance, le contenu rootcopy ou un module inférieur obsolète.
- Les échecs de démarrage concernent généralement le noyau sélectionné, le générateur initramfs, l’acquisition EFI, la génération GRUB/SYSLINUX ou des entrées de démarrage manquantes.
- Les échecs ISO concernent généralement l’arborescence d’image préparée, xorriso, l’espace de sortie ou les paramètres de nettoyage.

Après une construction privilégiée interrompue, vérifiez les montages sous le répertoire de travail cible avant de réessayer. Lisez le fichier `build/log/build-*.log` correspondant ; n’essayez pas de réparer sur place les overlays générés ou les fichiers `.sb`.

## Documentation associée

- [Gestion des modules](/preparing-and-customizing/Managing-Modules)
- [Composer des images personnalisées](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
