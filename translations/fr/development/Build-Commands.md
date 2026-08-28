---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

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

## Constructions frontend

Une invocation classique de `minios-cmd` requiert les quatre options de sélection de cible :

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Par exemple :

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Les paramètres optionnels courants incluent la compression, le comportement du noyau, la langue, le fuseau horaire, le générateur d’initramfs, la langue du menu de démarrage et le répertoire de construction. Vérifiez `./minios-cmd --help` au lieu de supposer qu’une option existe.

### Sélection du noyau

Le frontend expose directement les paramètres actuels du noyau :

| Option | Effet |
| --- | --- |
| `-kp`, `--kernel-provider` | Sélectionne `distribution` ou `minios` |
| `-mk`, `--minios-kernel` | Sélectionne le noyau MiniOS compatible AUFS avec sélection automatique de la série |
| `-mks`, `--minios-kernel-series` | Sélectionne `auto`, `6.1`, ou `6.12` et implique le fournisseur MiniOS |
| `-kpm`, `--kernel-payload-mode` | Sélectionne la charge utile du module noyau `runtime` ou `full` |
| `-dkms`, `--kernel-build-dkms` | Construit les pilotes DKMS optionnels sélectionnés pour le noyau réel |

Par exemple :

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv standard \
  -mks 6.1 -kpm runtime -dkms
```

Le fournisseur `distribution` résout un paquet noyau signé dans un état APT isolé. Lorsque DKMS est activé, ce paquet fournit également les en-têtes correspondant au noyau sélectionné ; l’étape DKMS ultérieure ne les remplace pas par le méta-paquet d’en-têtes générique de la distribution utilisateur. Les points de terminaison classiques des archives noyau utilisent HTTP afin que apt-cacher-ng puisse mettre en cache le contenu des paquets. APT valide toujours les métadonnées `InRelease` signées et les sommes des paquets.

Le fournisseur `minios` installe `linux-image-SERIES-mos-ARCH`, vérifie que le noyau prend en charge AUFS, et utilise `linux-headers-SERIES-mos-ARCH` pour DKMS.
`KERNEL_FLAVOUR` doit être `none`, les architectures des paquets utilisateur et noyau doivent correspondre, et la politique de mise à jour est figée. La sélection automatique de la série utilise 6.1 pour i386, Buster, Bullseye, Bookworm et Jammy ; les autres cibles supportées utilisent 6.12. Les noyaux MiniOS i386 ne supportent que la série 6.1.

`KERNEL_PAYLOAD_MODE=runtime` publie l’arborescence des modules noyau, la configuration du noyau, System.map, les métadonnées de déploiement et les fichiers d’intégration d’exécution sous `modprobe.d`, `modules-load.d` et `udev/rules.d`. Cela exclut la base de données dpkg active, les en-têtes, les liens de construction, les sources DKMS, la chaîne d’outils de compilation, les paquets initramfs et le firmware. Le firmware appartient à `02-firmware`. Le mode `full` conserve une charge utile de diagnostic plus large.

Le frontend copie le modèle de configuration, écrit les valeurs frontend fournies dans la copie, puis lance `minios-live -`. Par défaut, la copie de travail pour cet exemple est :

```text
build/trixie-standard-amd64/build.conf
```

Générer une configuration sans démarrer la construction :

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sans autre destination, cela écrit `build/build.conf`.

`--config-file FILE` sélectionne un fichier de configuration. L’aide de la commande actuelle indique que toutes les autres options sont ignorées dans ce mode, donc ne le combinez pas avec des options de cible ou d’optimisation :

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

En mode option frontend, les valeurs explicites de la ligne de commande écrasent les valeurs correspondantes du modèle. En mode fichier de configuration, traitez le fichier sélectionné comme l’entrée de configuration, sans essayer de le surcharger avec d’autres options frontend.

## Configuration du backend

Dans un dépôt source, `minios-live` lit par défaut `linux-live/build.conf`. Une copie installée utilise `/etc/minios-live/build.conf`. Le backend source le fichier sélectionné avant de calculer les chemins cibles, et il n’existe pas de drapeaux en ligne de commande pour surcharger des paramètres de configuration individuels.

Sélectionnez un autre fichier via `BUILD_CONF`. Utilisez un chemin absolu lors du franchissement de la frontière `sudo` :

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` permet de choisir une autre racine de sortie de construction :

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

N’éditez pas les fichiers générés sous un répertoire de travail cible comme substitut à la gestion de la configuration sélectionnée. Consultez `linux-live/build.conf` pour les options avancées du noyau, du bootloader, de la langue, du cache, des snapshots, des modules, du nettoyage et de la publication.

## Étapes du backend

Les étapes s’exécutent dans cet ordre :

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Les noms d’étape avec trait d’union affichés dans l’aide sont acceptés par le script.

Exécuter le pipeline complet :

```bash
sudo ./minios-live -
```

Exécuter une seule étape :

```bash
sudo ./minios-live build-iso
```

Exécuter une plage inclusive :

```bash
sudo ./minios-live build-chroot - build-live
```

Exécuter depuis la première étape jusqu’à une étape sélectionnée :

```bash
sudo ./minios-live - build-live
```

Exécuter d’une étape sélectionnée jusqu’à la dernière étape :

```bash
sudo ./minios-live build-modules -
```

Ces exemples backend utilisent la cible sélectionnée dans la configuration active. Pour les exemples de cette page, définissez d’abord `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` et `PACKAGE_VARIANT="standard"`.

## Dépendances des étapes

Une commande partielle ne recrée pas les sorties des étapes précédentes omises. Les étapes suivantes consomment le système de fichiers racine, les modules SquashFS, les fichiers de démarrage et la configuration produits par les étapes antérieures.

Reconstruire une étape antérieure peut donc rendre obsolètes toutes les sorties dépendantes suivantes. Reconstruisez jusqu’à la dernière étape affectée, et ne conservez pas les modules de numéro supérieur après avoir modifié un module inférieur sur lequel ils sont construits. En particulier, `build-iso` empaquette les données d’image préparées précédemment ; il ne les reconstruit pas.

Utilisez une construction complète pour une nouvelle cible ou lorsque les sorties antérieures nécessaires n’existent pas :

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Sorties et journaux

Avec la configuration de dépôt et la racine de construction par défaut, l’exemple trixie utilise ces emplacements vérifiés :

- `build/trixie-standard-amd64/core/` pour le système de fichiers principal mutable
- `build/trixie-standard-amd64/image/` pour l’arborescence ISO préparée
- `build/trixie-standard-amd64/image/minios/` pour les modules et charges utiles MiniOS générés
- `build/iso/` pour les fichiers ISO et leurs fichiers annexes `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` pour le journal de construction capturé

Tous les chemins sont relatifs à `BUILD_DIR`. Les noms de base ISO incluent les paramètres de construction et, pour les builds hors publication, un horodatage ; utilisez le chemin affiché par la construction réussie au lieu de prédire le nom de fichier complet.

## Jetons Ubuntu Pro

`--ubuntu-pro-token` active l’utilisation d’Ubuntu Pro lors d’une construction frontend. Le code de construction s’attache dans le chroot, puis détache et supprime l’état Pro, l’authentification du dépôt, les préférences et les traces de trousseau avant de créer l’image. Ce nettoyage ne garantit pas que le jeton soit sûr à exposer sur l’hôte.

Ne mettez jamais un vrai jeton dans la documentation, le contrôle de version, l’historique shell, la sortie CI ou une ligne de commande partagée. Préférez un fichier de configuration privé hors du dépôt, restreignez-en l’accès à son propriétaire, et ne transmettez que son chemin :

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Définissez `USE_UBUNTU_PRO="true"` et `UBUNTU_PRO_TOKEN="..."` dans ce fichier privé. Protégez et supprimez toute configuration de travail côté hôte contenant le jeton lorsqu’elle n’est plus nécessaire, et vérifiez qu’aucun jeton ni donnée d’authentification Pro n’est présent dans les artefacts publiés.
