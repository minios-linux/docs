# Commandes de construction

MiniOS propose deux interfaces de construction en ligne de commande. Exécutez les commandes depuis le répertoire source `minios-live` sauf si vous utilisez une copie installée.

- `minios-cmd` est le frontal. Il accepte les options de cible courantes, génère une configuration fonctionnelle et lance une construction complète.
- `minios-live` est le backend par étapes. Il lit une configuration de build et exécute une étape, une plage d’étapes, ou l’ensemble du pipeline.

Utilisez `./minios-cmd --help`, `./minios-live --help` et le `build.conf` actif pour la version installée. Ces commandes font autorité en cas de divergence avec des exemples ou une documentation plus ancienne. Les valeurs de cible prises en charge peuvent évoluer, donc cette page ne définit pas une matrice de support.

## Prérequis root

Afficher l’aide ne nécessite pas les droits root :

```bash
./minios-cmd --help
./minios-live --help
```

Les opérations de construction requièrent les droits root car elles utilisent debootstrap, des chroots, des montages et des outils de création d’images. L’actuel frontal vérifie également la présence des droits root avant d’écrire une configuration avec `--config-only`.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Le backend vérifie et installe les prérequis de l’hôte listés dans `linux-live/prerequisites.list`, sauf si `SKIP_SETUP_HOST=true` est défini dans la configuration.

## Constructions via le frontal

Une invocation classique de `minios-cmd` nécessite les quatre options de sélection de cible :

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Par exemple :

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Les paramètres optionnels courants incluent la compression, le comportement du noyau, la locale, le fuseau horaire, le générateur d’initramfs, la langue du menu de démarrage et le répertoire de construction. Vérifiez `./minios-cmd --help` au lieu de supposer qu’une option existe.

Le frontal copie le modèle de configuration, écrit les valeurs fournies dans la copie, puis appelle `minios-live -`. Par défaut, la copie de travail pour cet exemple est :

```text
build/trixie-standard-amd64/build.conf
```

Générez une configuration sans lancer la construction :

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sans autre destination, cela écrit `build/build.conf`.

`--config-file FILE` permet de sélectionner un fichier de configuration. L’aide de la commande actuelle indique que toutes les autres options sont ignorées dans ce mode ; ne le combinez donc pas avec des options de cible ou d’ajustement :

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

En mode option du frontal, les valeurs explicites de la ligne de commande écrasent les valeurs correspondantes du modèle. En mode fichier de configuration, considérez le fichier sélectionné comme l’entrée de configuration, sans chercher à le remplacer par d’autres options du frontal.

## Configuration du backend

Dans un checkout source, `minios-live` lit par défaut `linux-live/build.conf`. Une copie installée utilise `/etc/minios-live/build.conf`. Le backend source le fichier sélectionné avant de calculer les chemins cibles et ne propose aucun paramètre en ligne de commande pour remplacer individuellement les réglages de configuration.

Sélectionnez un autre fichier via `BUILD_CONF`. Utilisez un chemin absolu si vous traversez la limite `sudo` :

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` permet de choisir une autre racine de sortie de build :

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

N’éditez pas les fichiers générés sous un répertoire de travail cible comme substitut à la gestion de la configuration sélectionnée. Consultez `linux-live/build.conf` pour les options avancées liées au noyau, au bootloader, à la locale, au cache, aux snapshots, aux modules, au nettoyage et à la publication.

## Étapes du backend

Les étapes s’exécutent dans cet ordre :

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Les noms d’étapes avec tirets affichés par l’aide sont acceptés par le script.

Exécuter l’ensemble du pipeline :

```bash
sudo ./minios-live -
```

Exécuter une seule étape :

```bash
sudo ./minios-live build-iso
```

Exécuter une plage inclusive :

```bash
sudo ./minios-live build-chroot - build-live
```

Exécuter depuis la première étape jusqu’à une étape sélectionnée :

```bash
sudo ./minios-live - build-live
```

Exécuter depuis une étape sélectionnée jusqu’à la dernière étape :

```bash
sudo ./minios-live build-modules -
```

Ces exemples backend utilisent la cible sélectionnée dans la configuration active. Pour les exemples de cette page, définissez d’abord `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` et `PACKAGE_VARIANT="standard"`.

## Dépendances entre étapes

Une commande partielle ne recrée pas les sorties des étapes précédentes omises. Les étapes suivantes consomment le système de fichiers racine, les modules SquashFS, les fichiers de démarrage et la configuration produits par les étapes antérieures.

Reconstruire une étape précédente peut donc rendre obsolètes toutes les sorties ultérieures dépendantes. Reconstruisez jusqu’à la dernière étape affectée et ne conservez pas les modules numérotés plus haut après avoir modifié un module inférieur sur lequel ils étaient basés. En particulier, `build-iso` empaquette les données d’image préparées précédemment ; il ne les reconstruit pas.

Utilisez une construction complète pour une nouvelle cible ou lorsque les sorties requises des étapes précédentes n’existent pas :

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Sorties et journaux

Avec la configuration de checkout et la racine de build par défaut, l’exemple trixie utilise les emplacements vérifiés suivants :

- `build/trixie-standard-amd64/core/` pour le système de fichiers principal modifiable
- `build/trixie-standard-amd64/image/` pour l’arborescence ISO préparée
- `build/trixie-standard-amd64/image/minios/` pour les modules MiniOS générés et la charge utile
- `build/iso/` pour les fichiers ISO et leurs fichiers annexes `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` pour le journal de build capturé

Tous les chemins sont relatifs à `BUILD_DIR`. Les noms de base ISO incluent les paramètres de build et, pour les builds hors publication, un horodatage ; utilisez le chemin affiché par la construction réussie au lieu de prédire le nom de fichier complet.

## Jetons Ubuntu Pro

`--ubuntu-pro-token` active l’utilisation d’Ubuntu Pro lors d’une construction frontend. Le code de build attache le jeton dans le chroot, puis le détache et supprime l’état Pro, l’authentification des dépôts, les préférences et les traces de trousseau avant de créer l’image. Ce nettoyage ne rend pas le jeton sûr à exposer sur l’hôte.

N’insérez jamais un vrai jeton dans la documentation, le contrôle de version, l’historique du shell, les sorties CI ou une ligne de commande partagée. Privilégiez un fichier de configuration privé hors du dépôt, restreignez-en l’accès à son propriétaire et transmettez uniquement son chemin :

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Définissez `USE_UBUNTU_PRO="true"` et `UBUNTU_PRO_TOKEN="..."` dans ce fichier privé. Protégez et supprimez toute configuration de travail côté hôte contenant le jeton lorsqu’elle n’est plus nécessaire, et vérifiez qu’aucun jeton ou donnée d’authentification Pro n’est présent dans les artefacts publiés.
