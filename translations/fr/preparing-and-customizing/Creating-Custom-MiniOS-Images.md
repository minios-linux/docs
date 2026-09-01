---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Création d’images MiniOS personnalisées

Le Créateur d’images MiniOS est une application GTK permettant de remastériser une image MiniOS existante. Elle sélectionne le contenu d’une session MiniOS en cours, d’un fichier ISO ou d’un disque optique, applique des personnalisations déclaratives, puis utilise `minios-image-compose` pour produire une image ISO amorçable et vérifiée.

Le créateur fonctionne à l’intérieur de MiniOS. Il ne modifie jamais le support source sélectionné.

## Choisir le bon flux de travail

Le Créateur d’images MiniOS remastérise une image binaire MiniOS existante. Il ne remplace pas les flux de travail suivants :

- **Construire MiniOS à partir des sources :** utilisez le système de build `minios-live` pour modifier les listes de paquets de la distribution, la configuration de build, la couche noyau, les artefacts de démarrage ou la chaîne de modules reproductibles compilés depuis les sources. Voir [Construire MiniOS](/development/Building-MiniOS).
- **Créer un module réutilisable :** utilisez `apt2sb`, `script2sb`, `chroot2sb` ou d’autres outils de modules si le résultat attendu est une couche `.sb` autonome. Voir [Création de modules](/preparing-and-customizing/Managing-Modules).
- **Remastériser une image :** utilisez le Créateur d’images MiniOS pour sélectionner des modules existants, ajouter des modules externes finalisés, modifier les paramètres d’image pris en charge, capturer éventuellement les changements de session et publier une nouvelle ISO.

La couche système de fichiers du projet est destinée aux fichiers déclaratifs à la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les logiciels destinés à être réutilisés doivent être préparés sous forme de module avant d’être ajoutés à un projet Créateur d’images MiniOS.

## Options de source

La page Source accepte :

- La session MiniOS LiveKit ou dracut en cours.
- Un fichier ISO MiniOS.
- Un disque optique MiniOS.

Les sources ISO et disque optique sont montées en lecture seule avec `udisksctl`. L’inventaire source enregistre la version, l’architecture, la prise en charge du bootloader, la taille, l’inventaire des modules et une empreinte source. Si une source change après la planification, la construction est bloquée plutôt que de continuer avec une entrée différente.

La capture de session décrit toujours les modifications de la session MiniOS en cours d’exécution. Lorsqu’un ISO ou un disque optique est sélectionné, la capture n’est disponible que si l’empreinte du module de base de cette source correspond à la base montée de la session en cours. La sélection d’un média externe ne capture pas les modifications effectuées sur un autre système.

## Prérequis

Le Créateur d’images MiniOS nécessite le backend `minios-image-compose` correspondant. Les sources ISO et disques optiques requièrent `udisks2`. La lecture d’un `/etc/live/config.conf` réservé au root et la capture d’une session modifiable peuvent nécessiter `pkexec` ainsi qu’un agent PolicyKit de bureau. La capture de session requiert un `savechanges` compatible fourni par `minios-tools` 1.5.0 ou version ultérieure.

L’application et le backend de composition restent non privilégiés. L’autorisation est limitée au lecteur de configuration live fixe et, si sélectionné, aux `/usr/bin/savechanges` de confiance.

## Flux de travail du projet

### Sélectionner la source

Choisissez une source et attendez la fin de l’inventaire. Vérifiez son identité, son architecture, la prise en charge du démarrage, les diagnostics et le nombre de modules. Corrigez les erreurs de source avant de continuer.

### Sélectionner le contenu

Choisissez les modules source à inclure et ajoutez tout module externe `.sb`. Les modules essentiels et noyau requis sont verrouillés. Les modules actifs dans la session en cours mais absents de la source sélectionnée sont affichés séparément et ne sont pas inclus automatiquement.

Les modules supplémentaires doivent être des fichiers réguliers lisibles contenant des données SquashFS valides. Les noms de base en double ou différant seulement par la casse, ainsi que les collisions de cibles, sont rejetés car l’environnement d’exécution résout les couches par nom de base.

### Configurer les paramètres

Choisissez le chemin de sortie et la configuration MiniOS actuelle requise. Les champs de personnalisation vides ou `Keep current` conservent le comportement de la source. Configurez uniquement les remplacements nécessaires pour la nouvelle image, puis décidez si la couche de session modifiable doit être capturée.

Les octets de `/etc/live/config.conf` sont copiés dans un stockage privé de construction avec le mode 0600. Ils ne sont ni interprétés, ni affichés, ni enregistrés. Les projets actuels doivent inclure cette configuration ; un projet plus ancien qui la désactive explicitement ne peut pas passer à la revue tant qu’il n’est pas corrigé.

### Revoir le plan

La revue crée un nouveau plan à partir des identités d’entrée actuelles. Vérifiez les modules sélectionnés, exclus et ajoutés, l’emplacement de sortie, l’espace estimé, le résumé de personnalisation, le profil de capture, les avertissements et la limite de privilèges.

La revue omet volontairement les valeurs de configuration, les arguments bruts du noyau, les chemins privés de personnalisation et les chemins de capture sélectionnés. Elle affiche les comptes, noms de base, empreintes et condensats lorsque cela suffit à lier le plan.

Si la sortie existe déjà, le remplacement nécessite une confirmation. La confirmation est liée au périphérique, à l’inode, à la taille, à l’horodatage et au SHA-256 observés du fichier. Un changement de destination, une annulation ou une tentative échouée annule l’approbation et nécessite une nouvelle revue.

### Construire et vérifier

La construction revalide chaque entrée effective et exécute `minios-image-compose` avec une liste d’arguments dans un répertoire de travail privé. L’ISO reste privé jusqu’à la réussite de la vérification structurelle. La publication vers la destination sélectionnée est atomique.

Enregistrez le projet si sa source, la sélection des modules, la sortie et l’intention de personnalisation doivent être réutilisés. Les fichiers projet sont au format JSON. Les modifications non enregistrées nécessitent une confirmation avant d’ouvrir un autre projet ou de fermer l’application.

## Capture de session et confidentialité

Les modules source, `/etc/live/config.conf` et la capture de session sont des entrées indépendantes. Si la sélection de modules et la personnalisation déclarative suffisent, il n’est pas nécessaire de capturer la session modifiable.

### Ne pas inclure les modifications de session

C’est l’option recommandée par défaut. Le générateur utilise les modules sélectionnés, la configuration actuelle, les paramètres de démarrage et les autres personnalisations d’image sans copier la couche de session modifiable.

### Inclure toutes les modifications de session

Ce profil préserve chaque modification modifiable prise en charge par le fournisseur OverlayFS ou AUFS détecté. Il peut inclure des mots de passe, des clés, des jetons, des données de navigateur, l’identité de la machine, des fichiers personnels, des journaux et l’état des fichiers supprimés. Il nécessite une confirmation explicite et ne doit pas être utilisé pour une image destinée à d’autres personnes sans audit séparé.

### Inclure uniquement les modifications réutilisables

Ce profil utilise une liste blanche stricte de chemins pour les logiciels et des valeurs sûres par défaut tout en omettant les états personnels, d’identité, de cache et de journalisation. Il réduit l’exposition mais ne garantit pas que les fichiers autorisés ne contiennent aucun secret. Inspectez l’image finale avant de la partager.

### Sélectionner manuellement les changements de session

Lancez `Analyze session changes`, puis sélectionnez au moins un chemin normalisé dans l’inventaire en mémoire. Un dossier sélectionné inclut ses descendants. Les exclusions exactes ou ancêtres prévalent sur les sélections correspondantes.

L’inventaire contient des métadonnées, y compris les noms de fichiers, ce qui le rend sensible même s’il ne contient pas le contenu des fichiers. Il reste en mémoire et n’est ni écrit dans le projet ni copié dans l’onglet Revue ou les journaux. Les règles d’inclusion et d’exclusion explicites reflètent l’intention du projet et sont enregistrées ; la revue n’affiche que leur nombre et leur empreinte.

Lancer une nouvelle analyse, actualiser ou changer la source, annuler ou échouer, ouvrir ou créer un projet efface l’inventaire en cours. L’analyse et la capture peuvent demander une autorisation administrateur, mais le processus du Créateur d’images MiniOS et la composition ISO ne sont pas élevés.

## Personnalisation de l’image

Les paramètres pris en charge sont limités et validés par le backend :

- **Paramètres système par défaut :** nom d’hôte, fuseau horaire, cible systemd par défaut, et services activés ou désactivés.
- **Sécurité et accès :** sudo, PolicyKit, SSH, XRDP, X11, verrouillage d’écran et modes d’indication autorisés sur liste blanche.
- **Données utilisateur :** répertoires utilisateur relatifs à la racine validés, avec comportement de lien ou de montage, mais pas les deux.
- **Comportement au démarrage :** un délai de 0 à 300 secondes, le menu source ou un menu construit, et une entrée par défaut sélectionnée.
- **Entrées de démarrage :** les modèles resume, new, choose, fresh et copy-to-RAM peuvent être masqués, réorganisés, dupliqués et configurés via des contrôles typés pour la persistance, les modules, le démarrage, la localisation, zRAM et le diagnostic.
- **Paramètres avancés de démarrage :** arguments du noyau globaux et par entrée validés pour les options non représentées par les contrôles typés.
- **Apparence :** un fond d’écran de démarrage PNG validé.
- **Couche système de fichiers du projet :** un répertoire réel interprété par rapport à la racine de l’image et empaqueté comme un module SquashFS superutilisateur.

La couche système de fichiers prend en charge les fichiers réguliers, les liens symboliques relatifs sûrs, les dossiers vides, les bits d’exécution et les horodatages. Les nœuds de périphérique, sockets, FIFOs, traversées de systèmes de fichiers, liens absolus ou échappant la racine, et noms non sûrs sont rejetés. Les bits de privilège sont supprimés et la propriété dans le module généré est normalisée.

La personnalisation du démarrage prend en charge les GRUB MiniOS reconnus, SYSLINUX natif et la chaîne standard SYSLINUX-vers-GRUB. Toute configuration de démarrage non prise en charge ou ambiguë est rejetée plutôt que devinée. Une construction sans personnalisation du démarrage peut préserver une structure source que l’analyseur de personnalisation ne comprend pas.

## Vérification de la sortie

Avant publication, `minios-image-compose` vérifie l’ISO générée au lieu de se fier uniquement à la sortie réussie de `xorriso`. Les contrôles incluent :

- L’arborescence du système de fichiers ISO et le label du volume.
- Les enregistrements de démarrage BIOS et UEFI ainsi que la zone système.
- Les fichiers de démarrage requis, le noyau, l’initramfs, la configuration et le contenu des modules.
- Les personnalisations intégrées et les attestations de capture de session si présentes.
- Les empreintes et la structure des modules overlay générés et des modules de session capturés.
- Les fonds d’écran de démarrage et la configuration de démarrage transformée si personnalisée.

L’identité du chemin d’entrée, le mode, la date de modification et le SHA-256 sont enregistrés avant la construction. Les entrées modifiables sont instantanées en privé avec des reflinks si possible ; sinon, elles sont vérifiées pour mutation avant et après l’écriture de l’ISO. Toute incohérence ou échec de vérification empêche la publication.

Après une construction réussie, enregistrez séparément une somme de contrôle :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas un test de démarrage. Démarrez l’ISO dans une machine virtuelle jetable et testez à la fois BIOS et UEFI si les deux doivent être pris en charge. Le Créateur d’images MiniOS peut signaler que QEMU ou VirtualBox est installé, mais il ne démarre ni ne configure un hyperviseur.

## Sécurité et annulation

- Gardez le support source en lecture seule et écrivez la sortie sur un système de fichiers disposant d’un espace libre suffisant pour l’estimation et la marge temporaire.
- Ne construisez pas directement par-dessus la seule ISO connue comme fonctionnelle. Utilisez un nouveau nom de sortie sauf si le remplacement est intentionnel et confirmé.
- Vérifiez les modules externes avant de les ajouter. Le Créateur d’images MiniOS valide leur structure SquashFS mais n’établit pas l’auteur de leur contenu.
- Privilégiez l’absence de capture de session pour les images destinées à la distribution. Si une capture est nécessaire, auditez le système de fichiers résultant, pas seulement le nom du profil.
- Considérez les fichiers de projet comme sensibles s’ils contiennent des chemins sources explicites, des chemins de modules, des chemins de sortie ou des règles de capture sélectionnées.

Les sous-processus d’inventaire, de construction et de vérification s’exécutent dans des groupes de processus dédiés. Une demande d’annulation provoque une terminaison et s’intensifie après un délai de grâce. Un passage de hachage peut se terminer avant que l’annulation n’atteigne un point de contrôle sûr, mais les résultats obsolètes sont ignorés. Une fois la publication atomique lancée, elle est autorisée à se terminer afin que la destination ne soit pas laissée intentionnellement à moitié écrite.

Une construction annulée ou échouée ne publie pas son ISO privée. Toute destination précédente reste en place sauf si un remplacement vérifié a atteint la publication atomique.

## Documentation associée

- [Building MiniOS](/development/Building-MiniOS)
- [Creating modules](/preparing-and-customizing/Managing-Modules)
- [Composer des images ISO depuis la ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images)

## Composer des images ISO MiniOS en ligne de commande

`minios-image-compose` est le backend en ligne de commande fourni avec le Créateur d’images MiniOS. Il remplace l’utilitaire `sb2iso` désormais obsolète. Cette commande remastérise un arbre de contenu MiniOS existant, modifie éventuellement son ensemble de modules et sa configuration prise en charge, vérifie le résultat et publie une ISO amorçable.

Utilisez l’interface graphique du [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) pour un flux de projet guidé. Utilisez cette commande directement pour les scripts, l’automatisation ou des builds reproductibles en ligne de commande. Pour une construction complète à partir des sources, utilisez plutôt [Construire MiniOS](/development/Building-MiniOS).

### Utilisation de base

Depuis une session live MiniOS en cours d’exécution, créez une image ISO à partir de la source MiniOS détectée et de `/etc/live/config.conf` :

```bash
minios-image-compose --name ./custom-minios.iso
```

Ne préfixez pas la commande complète avec `sudo` ou `pkexec`. La composition, la vérification et la publication s’exécutent avec l’utilisateur courant. Seule la capture de session optionnelle peut invoquer le backend de confiance `/usr/bin/savechanges` via PolicyKit.

Le nom de sortie par défaut est `minios-YYYYMMDD_HHMM.iso`. Une destination existante est refusée sauf si `--overwrite` est explicitement spécifié.

### Sélectionner une source

Sans `--source`, la commande détecte le contenu MiniOS utilisé par la session LiveKit ou dracut en cours. Pour remastériser un autre arbre MiniOS monté, indiquez le dossier contenant `boot/` et les modules MiniOS :

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La source est un simple point d’entrée en lecture seule et n’est jamais modifiée. Les fichiers ISO et supports optiques doivent être montés avant d’utiliser leur arborescence de contenu MiniOS avec la CLI. L’interface graphique du Créateur d’images MiniOS peut monter ces sources via `udisksctl`.

### Sélectionner les modules

Des modules `.sb` supplémentaires sont passés comme arguments positionnels :

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

La commande valide chaque module comme un fichier SquashFS lisible et non-symlink.
Les modules dont le nom commence par deux chiffres et un tiret sont placés au niveau supérieur MiniOS. Les autres modules ajoutés sont placés dans `minios/modules/`. Les collisions de noms de base en double ou insensibles à la casse sont rejetées.

Excluez des chemins sources avec une expression régulière POSIX étendue :

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Les fichiers de démarrage requis, le noyau et l’initramfs, les modules principaux, le menu de démarrage sélectionné et la configuration sélectionnée ne peuvent pas être exclus.

Créez des modules réutilisables avant de composer l’ISO. Voir [Création de modules](/preparing-and-customizing/Managing-Modules) et [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuration et manifeste

`--config FILE` installe le fichier régulier sélectionné en tant que `minios/config.conf`. La valeur par défaut est `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Le manifeste optionnel doit être un objet JSON. Les étiquettes de volume doivent contenir de 1 à 32 caractères ASCII imprimables ; les étiquettes ne respectant pas strictement l’ensemble ISO 9660 (majuscules, chiffres et soulignés) génèrent un avertissement.

### Capturer les changements de session

La capture de session est optionnelle et s’applique à la couche modifiable de la session MiniOS en cours d’exécution. Elle n’est acceptée pour une source explicite que si cette source a la même empreinte de module de base que le système en cours d’exécution.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Les profils disponibles sont :

- `exact` capture chaque changement représentable et peut inclure des identifiants, des données personnelles, des journaux, l’état du navigateur et l’identité de la machine.
- `clean` utilise une liste blanche restreinte orientée logiciel. Elle réduit l’exposition mais ne garantit pas l’absence de secret dans le résultat.
- `selected` utilise une sélection d’inventaire produite par une interface compatible ou un flux `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Privilégiez les modules et la configuration déclarative à la capture de session si l’ISO doit être partagée. Voir [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) pour le modèle de confidentialité et le flux de revue.

### Personnaliser le comportement de démarrage

La CLI permet de modifier les dispositions GRUB et SYSLINUX prises en charge :

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accepte `resume`, `new`, `choose`, `fresh` ou `toram`.
`--menu` accepte `multilang` ou une locale prise en charge telle que `en_US`, `ru_RU` ou `de_DE`. Les arguments du noyau sont validés et ajoutés sans évaluation par le shell. Les dispositions de menu de démarrage non prises en charge ou ambiguës sont rejetées plutôt que modifiées au hasard.

### Ajouter des illustrations ou une superposition de système de fichiers

Remplacez l’arrière-plan du démarrage par un PNG validé :

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Emballez un arbre de répertoires préparé comme module de superposition d’image appartenant à root :

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

La superposition est interprétée relativement à la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les liens non sûrs, fichiers spéciaux, traversées de systèmes de fichiers et collisions de destination sont rejetés.

### Vérification et publication

Avant publication, `minios-image-compose` vérifie l’arborescence du système de fichiers ISO, l’étiquette de volume, les enregistrements de démarrage BIOS et UEFI, la zone système, les fichiers de démarrage, les modules et la personnalisation demandée. Les modules de superposition générés et les modules de session capturés sont extraits et contrôlés par rapport à leurs métadonnées et empreintes enregistrées.

L’ISO est construit dans un répertoire privé sur le système de fichiers de destination et n’est publié de façon atomique qu’après une vérification réussie. Toute modification d’entrée, échec de vérification, annulation ou espace insuffisant sur la destination empêche la publication. Une destination précédente reste inchangée sauf si une construction `--overwrite` explicitement approuvée atteint la publication atomique.

Créez une somme de contrôle et effectuez un test de démarrage séparé après une construction réussie :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas le test des chemins BIOS et UEFI prévus dans une machine virtuelle jetable ou sur un matériel adapté.

### Référence de commande

Utilisez le manuel installé et l’aide intégrée pour connaître la version exacte du backend :

```bash
minios-image-compose --help
man minios-image-compose
```

Options courantes :

| Option | Utilité |
|---|---|
| `-n`, `--name FILE` | Définir le chemin de sortie. |
| `-e`, `--exclude REGEX` | Exclure les chemins sources correspondants. |
| `--source DIR` | Sélectionner un arbre de contenu MiniOS explicite. |
| `--config FILE` | Sélectionner la configuration live intégrée dans l’ISO. |
| `--manifest FILE` | Inclure un manifeste de construction JSON validé. |
| `--capture-changes MODE` | Capturer les modifications de session `exact`, `clean` ou `selected`. |
| `--boot-timeout SECONDS` | Définir un délai du menu de démarrage de 0 à 300 secondes. |
| `--default-boot MODE` | Sélectionner l’action par défaut de la session MiniOS. |
| `--kernel-args TEXT` | Ajouter des arguments globaux validés au noyau. |
| `--boot-background PNG` | Remplacer les illustrations de démarrage prises en charge. |
| `--overlay-directory DIR` | Ajouter une couche de système de fichiers déclarative. |
| `--menu TYPE` | Sélectionner un menu multilingue ou localisé. |
| `--overwrite` | Autoriser explicitement le remplacement d’une sortie existante. |

La commande retourne un code de sortie non nul en cas d’échec des vérifications de source, module, personnalisation, stockage, vérification ou publication. Ne distribuez pas une sortie tant que la commande n’a pas abouti et que la somme de contrôle et les chemins de démarrage n’ont pas été testés.
