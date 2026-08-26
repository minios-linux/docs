---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Composer des images ISO MiniOS depuis la ligne de commande

`minios-image-compose` est le moteur en ligne de commande fourni avec MiniOS Image Builder. Il remplace l’utilitaire `sb2iso`, désormais obsolète. Cette commande permet de remastériser un arbre de contenu MiniOS existant, de modifier éventuellement son ensemble de modules et sa configuration prise en charge, de vérifier le résultat et de publier une image ISO amorçable.

Utilisez l’interface graphique [MiniOS Image Builder](/development/Image-Builder.md) pour un flux de travail guidé. Utilisez cette commande directement dans des scripts, pour l’automatisation ou pour des constructions reproductibles en ligne de commande. Pour une compilation complète à partir des sources, consultez [Building MiniOS](/development/Building-MiniOS.md).

## Utilisation de base

Depuis une session live MiniOS en cours d’exécution, créez une image ISO à partir de la source MiniOS détectée et de `/etc/live/config.conf` :

```bash
minios-image-compose --name ./custom-minios.iso
```

Ne préfixez pas la commande complète avec `sudo` ou `pkexec`. La composition, la vérification et la publication s’exécutent sous l’utilisateur courant. Seule la capture de session optionnelle peut invoquer le moteur de confiance `/usr/bin/savechanges` via PolicyKit.

Le nom de sortie par défaut est `minios-YYYYMMDD_HHMM.iso`. Une destination existante est refusée sauf si `--overwrite` est explicitement indiqué.

## Sélectionner une source

Sans `--source`, la commande détecte le contenu MiniOS utilisé par la session LiveKit ou dracut en cours. Pour remastériser un autre arbre MiniOS monté, indiquez le répertoire contenant `boot/` et les modules MiniOS :

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La source est en lecture seule et n’est jamais modifiée. Les fichiers ISO et les supports optiques doivent être montés avant d’utiliser leur arbre de contenu MiniOS avec la CLI. L’Image Builder graphique peut monter ces sources via `udisksctl`.

## Sélectionner les modules

Des modules `.sb` supplémentaires sont ajoutés comme arguments positionnels :

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

La commande valide chaque module comme un fichier SquashFS lisible et non symbolique. Les modules dont le nom commence par deux chiffres suivis d’un tiret sont placés à la racine de MiniOS. Les autres modules ajoutés sont placés dans `minios/modules/`. Les doublons ou collisions de noms (insensibles à la casse) sont rejetés.

Excluez des chemins sources à l’aide d’une expression régulière POSIX étendue :

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Les fichiers de démarrage requis, le noyau et l’initramfs, les modules principaux, le menu de démarrage sélectionné et la configuration choisie ne peuvent pas être exclus.

Créez les modules réutilisables avant de composer l’ISO. Voir [Créer des modules](/development/Creating-Modules.md) et [MiniOS Module Manager](/administration/Module-Manager.md).

## Configuration et manifeste

`--config FILE` installe le fichier régulier sélectionné en tant que `minios/config.conf`. La valeur par défaut est `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Le manifeste optionnel doit être un objet JSON. Les étiquettes de volume doivent contenir de 1 à 32 caractères ASCII imprimables ; les étiquettes qui sortent de l’ensemble strict ISO 9660 (majuscules, chiffres et soulignés) génèrent un avertissement.

## Capturer les modifications de session

La capture de session est optionnelle et s’applique à la couche écrivable de la session MiniOS en cours d’exécution. Elle n’est acceptée pour une source explicite que si cette source possède la même empreinte de module de base que le système en cours.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Les profils disponibles sont :

- `exact` capture chaque modification représentable et peut inclure des identifiants, des données personnelles, des journaux, l’état du navigateur et l’identité de la machine.
- `clean` utilise une liste d’autorisation restreinte orientée logiciel. Elle réduit l’exposition mais ne garantit pas l’absence de secrets dans le résultat.
- `selected` utilise une sélection d’inventaire produite par une interface compatible ou un workflow `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Privilégiez les modules et la configuration déclarative à la capture de session si l’ISO doit être partagé. Consultez [MiniOS Image Builder](/development/Image-Builder.md) pour le modèle de confidentialité et le flux de relecture.

## Personnaliser le comportement de démarrage

La CLI peut modifier les configurations GRUB et SYSLINUX prises en charge :

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accepte `resume`, `new`, `choose`, `fresh` ou `toram`.
`--menu` accepte `multilang` ou une locale prise en charge telle que `en_US`, `ru_RU` ou `de_DE`. Les arguments du noyau sont validés et ajoutés sans évaluation par le shell. Les configurations de menu de démarrage non prises en charge ou ambiguës sont rejetées plutôt que modifiées de manière approximative.

## Ajouter un visuel ou une surcouche de système de fichiers

Remplacez l’arrière-plan de démarrage par un PNG validé :

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Emballez un arbre de répertoires préparé comme module de surcouche image appartenant à root :

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

La surcouche est interprétée par rapport à la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les liens non sûrs, fichiers spéciaux, traversées de systèmes de fichiers et collisions de destination sont rejetés.

## Vérification et publication

Avant la publication, `minios-image-compose` vérifie l’arborescence du système de fichiers ISO, l’étiquette de volume, les enregistrements de démarrage BIOS et UEFI, la zone système, les fichiers de démarrage, les modules et les personnalisations demandées. Les modules de surcouche générés et de session capturée sont extraits et contrôlés par rapport à leurs métadonnées et empreintes enregistrées.

L’ISO est construit dans un répertoire privé sur le système de fichiers de destination et n’est publié de façon atomique qu’après une vérification réussie. Toute modification d’entrée, échec de vérification, annulation ou espace insuffisant sur la destination empêche la publication. Une destination précédente reste inchangée sauf si une construction `--overwrite` explicitement approuvée atteint la publication atomique.

Générez une somme de contrôle et effectuez un test de démarrage séparé après une construction réussie :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas les tests des chemins BIOS et UEFI prévus dans une machine virtuelle jetable ou sur un matériel adapté.

## Référence des commandes

Utilisez le manuel installé et l’aide intégrée pour connaître la version exacte du moteur :

```bash
minios-image-compose --help
man minios-image-compose
```

Options courantes :

| Option | Utilité |
|---|---|
| `-n`, `--name FILE` | Définir le chemin de sortie. |
| `-e`, `--exclude REGEX` | Exclure les chemins sources correspondants. |
| `--source DIR` | Sélectionner explicitement un arbre de contenu MiniOS. |
| `--config FILE` | Sélectionner la configuration live intégrée à l’ISO. |
| `--manifest FILE` | Inclure un manifeste de construction JSON validé. |
| `--capture-changes MODE` | Capturer les modifications de session `exact`, `clean` ou `selected`. |
| `--boot-timeout SECONDS` | Définir un délai d’attente du menu de démarrage de 0 à 300 secondes. |
| `--default-boot MODE` | Sélectionner l’action par défaut de la session MiniOS. |
| `--kernel-args TEXT` | Ajouter des arguments globaux du noyau validés. |
| `--boot-background PNG` | Remplacer le visuel de démarrage pris en charge. |
| `--overlay-directory DIR` | Ajouter une couche de système de fichiers déclarative. |
| `--menu TYPE` | Sélectionner un menu multilingue ou localisé. |
| `--overwrite` | Autoriser explicitement le remplacement d’une sortie existante. |

La commande retourne un code d’erreur non nul en cas d’échec sur la source, les modules, la personnalisation, le stockage, la vérification ou la publication. Ne distribuez pas une sortie tant que la commande n’a pas abouti avec succès et que la somme de contrôle ainsi que les chemins de démarrage n’ont pas été testés.
