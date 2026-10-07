---
updated: 2026-10-06
program_commits:
    minios-image-builder: bf84d50bfe9461f4e9300033c5855ec8fa387552
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Création d’images personnalisées MiniOS

Le Créateur d’images MiniOS est une application GTK permettant de remastériser une image MiniOS existante. Il sélectionne du contenu à partir d’une session MiniOS en cours, d’un fichier ISO ou d’un disque optique, applique une personnalisation déclarative, puis utilise `minios-image-compose` pour produire une image ISO amorçable et vérifiée.

Le créateur fonctionne dans MiniOS. Il ne modifie pas le support source sélectionné.

## Choisir le bon flux de travail

Le Créateur d’images MiniOS remastérise une image binaire MiniOS existante. Il ne remplace pas les flux de travail suivants :

- **Construire MiniOS à partir des sources :** utilisez le système de build `minios-live` lors de la modification des listes de paquets de la distribution, de la configuration de build, de la couche noyau, des artefacts de démarrage ou de la chaîne de modules reproductibles compilés depuis les sources. Voir [Construction de MiniOS](/development/Building-MiniOS).
- **Créer un module réutilisable :** utilisez `apt2sb`, `script2sb`, `chroot2sb`, ou les autres outils de modules lorsque le résultat attendu est une couche autonome de `.sb`module. Voir [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remastériser une image :** utilisez le Créateur d’images MiniOS pour sélectionner des modules existants, ajouter des modules externes finalisés, modifier les paramètres d’image pris en charge, éventuellement capturer les modifications de session, et publier une nouvelle ISO.

La couche système de fichiers du projet est destinée aux fichiers déclaratifs à la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les logiciels destinés à être réutilisés doivent être préparés sous forme de module avant d’être ajoutés à un projet du Créateur d’images MiniOS.

## Options de source

La page Source accepte :

- La session LiveKit ou dracut MiniOS en cours.
- Un fichier ISO MiniOS.
- Un disque optique MiniOS.

Les sources ISO et disque optique sont montées en lecture seule avec `udisksctl`. L’inventaire de la source enregistre la version, l’architecture, la prise en charge du bootloader, la taille, l’inventaire des modules, et une empreinte de la source. Si une source change après la planification, la construction est bloquée plutôt que de continuer avec une entrée différente.

La capture de session décrit toujours les modifications de la session MiniOS en cours d’exécution. Lorsqu’un ISO ou un disque optique est sélectionné, la capture n’est possible que si l’empreinte du module de base de cette source correspond à celle du système monté. La sélection d’un support externe ne capture pas les modifications faites sur un autre système.

## Prérequis

Le Créateur d’images MiniOS nécessite le backend correspondant `minios-image-compose` . Les sources ISO et disque optique requièrent `udisks2` . La lecture d’une racine réservée à root `/etc/live/config.conf` et la capture d’une session modifiable peuvent nécessiter `pkexec` et un agent PolicyKit de bureau. La capture de session requiert un `savechanges` compatible fourni par `minios-tools` 1.5.0 ou supérieur.

L’application et le backend de composition restent sans privilèges. L’autorisation est limitée au lecteur de configuration live fixe et, si sélectionné, aux `/usr/bin/savechanges` de confiance.

## Flux de travail du projet

### Sélectionner la source

Choisissez une source et attendez la fin de l’inventaire. Vérifiez son identité, son architecture, la prise en charge du démarrage, les diagnostics et le nombre de modules. Corrigez les erreurs de source avant de continuer.

### Sélectionner le contenu

Choisissez les modules source à inclure et ajoutez les modules externes `.sb` nécessaires. Les modules cœur et noyau requis sont verrouillés. Les modules externes ordinaires actifs dans la session en cours mais absents de la source sélectionnée sont affichés séparément et restent facultatifs.

Un module externe qui remplace activement un module source à son chemin système d’origine est traité différemment : l’Image Builder actuel résout le fichier de base par périphérique et inode, conserve le rôle système d’origine et inclut ce remplacement comme module source effectif au lieu de le présenter comme un doublon optionnel sans lien. Cela couvre aussi les chemins initramfs déplacés. Les autres modules externes nécessitent toujours une sélection explicite.

Les modules supplémentaires doivent être des fichiers réguliers lisibles contenant des données SquashFS valides. Les doublons ou collisions de noms de fichiers (insensibles à la casse) sont rejetés car l’exécution résout les couches par nom de base.

### Configurer les paramètres

Choisissez le chemin de sortie et la configuration MiniOS requise et actuelle. Les champs de personnalisation vides ou `Keep current` préservent le comportement de la source. Ne configurez que les remplacements nécessaires pour la nouvelle image, puis décidez si la couche de session modifiable doit être capturée.

Les octets de `/etc/live/config.conf` sont copiés dans un espace de stockage privé avec le mode 0600. Ils ne sont ni interprétés, ni affichés, ni enregistrés. Les projets actuels doivent inclure cette configuration ; un projet plus ancien qui la désactive explicitement ne peut pas passer à la révision tant qu’il n’est pas corrigé.

### Vérifier le plan

La révision crée un nouveau plan à partir des identités d’entrée actuelles. Vérifiez les modules sélectionnés, exclus et additionnels, l’emplacement de sortie, l’espace estimé, le résumé de personnalisation, le profil de capture, les avertissements et la frontière de privilèges.

La révision omet volontairement les valeurs de configuration, les arguments bruts du noyau, les chemins privés de personnalisation et les chemins de capture sélectionnés. Elle affiche les nombres, noms de base, empreintes et condensats lorsque cela suffit à lier le plan.

Si la sortie existe déjà, le remplacement nécessite une confirmation. Celle-ci est liée au périphérique, inode, taille, horodatage et SHA-256 observés du fichier. Un changement de destination, une annulation ou un échec annule l’approbation et nécessite une nouvelle révision.

### Construire et vérifier

La construction revalide chaque entrée effective et exécute `minios-image-compose` avec une liste d’arguments dans un répertoire de travail privé. L’ISO reste privé jusqu’à la réussite de la vérification structurelle. La publication vers la destination sélectionnée est atomique.

Enregistrez le projet si sa source, la sélection des modules, la sortie et l’intention de personnalisation doivent être réutilisées. Les fichiers projet sont au format JSON. Les modifications non enregistrées nécessitent une confirmation avant d’ouvrir un autre projet ou de fermer l’application.

## Capture de session et confidentialité

Les modules source, `/etc/live/config.conf`, et la capture de session sont des entrées indépendantes. Si la sélection des modules et la personnalisation déclarative suffisent, ne capturez pas la session modifiable.

### Ne pas inclure les modifications de session

C’est l’option recommandée par défaut. Le créateur utilise les modules sélectionnés, la configuration actuelle, les paramètres de démarrage et les autres personnalisations d’image sans copier la couche de session modifiable.

### Inclure toutes les modifications de session

Ce profil préserve chaque modification modifiable prise en charge par le fournisseur détecté OverlayFS ou AUFS. Il peut inclure des mots de passe, des clés, des jetons, des données de navigateur, l’identité de la machine, des fichiers personnels, des journaux et l’état des fichiers supprimés. Il nécessite une confirmation explicite et ne doit pas être utilisé pour une image destinée à d’autres personnes sans audit séparé.

### Inclure uniquement les modifications réutilisables

Ce profil applique une liste blanche stricte de chemins pour les logiciels et des paramètres sûrs tout en omettant les données personnelles, d’identité, de cache et d’historique. Il réduit l’exposition mais ne garantit pas que les fichiers autorisés ne contiennent aucun secret. Vérifiez l’image finale avant de la partager.

### Choisir manuellement les modifications de session

Exécutez `Analyze session changes`, puis sélectionnez au moins un chemin normalisé dans l’inventaire en mémoire. Un dossier sélectionné inclut ses descendants. Les exclusions exactes ou ancêtres ont priorité sur les sélections correspondantes.

L’inventaire contient des métadonnées, y compris les noms de fichiers, et est donc sensible même s’il ne contient pas le contenu des fichiers. Il reste en mémoire et n’est ni écrit dans le projet, ni copié dans la révision ou les journaux. Les règles d’inclusion et d’exclusion explicites expriment l’intention du projet et sont enregistrées ; la révision n’affiche que leur nombre et leur condensat.

Lancer une autre analyse, actualiser ou changer la source, annuler ou échouer, ou ouvrir/créer un projet efface l’inventaire en cours. L’analyse et la capture peuvent demander une autorisation administrateur, mais le processus du Créateur d’images MiniOS et la composition ISO ne sont pas élevés.

## Personnalisation de l’image

Les paramètres pris en charge sont limités et validés par le backend :

- **Paramètres système par défaut :** nom d’hôte, fuseau horaire, cible systemd par défaut, et services activés ou désactivés.
- **Sécurité et accès :** modes sudo, PolicyKit, SSH, XRDP, X11, verrouillage d’écran et indice d’identification autorisés.
- **Données utilisateur :** répertoires utilisateur validés relatifs à la racine, avec comportement lien ou montage, mais pas les deux.
- **Comportement au démarrage :** un délai de 0 à 300 secondes, le menu source ou un menu construit, et une entrée par défaut sélectionnée.
- **Entrées de démarrage :** les modèles resume, new, choose, fresh et copy-to-RAM peuvent être masqués, réordonnés, dupliqués et configurés via des contrôles typés de persistance, module, démarrage, localisation, zRAM et diagnostic. Les modèles de nouvelle session actuels utilisent `perchdir=setup` afin que le backend de persistance puisse être choisi au démarrage ; lorsqu’une source plus ancienne utilise déjà `perchdir=new`, ce sélecteur hérité est préservé plutôt que réécrit sans avertissement.
- **Comportement RAM :** copie système (`toram`) et copie de session persistante (`perchtoram`) sont des contrôles indépendants. `perchtoram=off` conserve la persistance sur le stockage, `trim` copie la session prise en charge sélectionnée et `full` demande une copie complète de la session prise en charge. Quand la persistance est activée, les menus actuels utilisent `trim` avec un démarrage système RAM et `off` sinon, sauf si vous choisissez une autre valeur. Les sessions répertoire natif ne sont pas copiées par `perchtoram`.
- **Paramètres avancés de démarrage :** arguments du noyau globaux et par entrée validés pour les options non représentées par des contrôles typés.
- **Apparence :** un fond d’écran de démarrage PNG validé.
- **Couche système de fichiers du projet :** un répertoire réel interprété relativement à la racine de l’image et empaqueté comme module superposé SquashFS appartenant à root.

La couche système de fichiers prend en charge les fichiers réguliers, les liens symboliques relatifs sûrs, les dossiers vides, les bits exécutables et les horodatages. Les nœuds de périphérique, sockets, FIFOs, traversées de systèmes de fichiers, liens absolus ou sortants et noms non sûrs sont rejetés. Les bits de privilèges sont supprimés et la propriété dans le module généré est normalisée.

La personnalisation du démarrage prend en charge MiniOS GRUB reconnu, SYSLINUX natif et la chaîne standard SYSLINUX-vers-GRUB. Une configuration de démarrage non prise en charge ou ambiguë est rejetée plutôt que devinée. Une construction sans personnalisation de démarrage peut préserver une structure source non comprise par le parseur de personnalisation.

## Vérification de la sortie

Avant publication, `minios-image-compose` vérifie l’ISO généré plutôt que de se fier uniquement à une sortie `xorriso` réussie. Les vérifications incluent :

- L’arborescence du système de fichiers ISO et le label de volume.
- Les enregistrements de démarrage BIOS et UEFI et la zone système.
- Les fichiers de démarrage, noyau, initramfs, configuration et modules requis.
- Les personnalisations intégrées et attestations de capture de session si présentes.
- Les condensats et la structure des modules superposés générés et des modules de session capturés.
- Les fonds d’écran de démarrage et la configuration de démarrage transformée si personnalisés.

L’identité du chemin d’entrée, le mode, la date de modification et le SHA-256 sont enregistrés avant la construction. Les entrées modifiables sont instantanées en privé avec des reflinks si pris en charge ; sinon, elles sont vérifiées pour mutation avant et après l’écriture de l’ISO. Un écart ou un échec de vérification empêche la publication.

Après une construction réussie, enregistrez un checksum séparément :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas un test de démarrage. Démarrez l’ISO dans une machine virtuelle jetable et testez à la fois BIOS et UEFI si les deux doivent être pris en charge. Le Créateur d’images MiniOS peut signaler que QEMU ou VirtualBox est installé, mais il ne démarre ni ne configure d’hyperviseur.

## Sécurité et annulation

- Gardez les supports source en lecture seule et écrivez la sortie sur un système de fichiers disposant de suffisamment d’espace libre pour l’estimation et la marge temporaire.
- Ne construisez pas directement par-dessus le seul ISO fiable connu. Utilisez un nouveau nom de sortie sauf si le remplacement est intentionnel et confirmé.
- Vérifiez les modules externes avant de les ajouter. Le Créateur d’images MiniOS valide leur structure SquashFS mais n’établit pas l’auteur de leur contenu.
- Privilégiez l’absence de capture de session pour les images destinées à la distribution. Si une capture est nécessaire, auditez le système de fichiers résultant, pas seulement le nom du profil.
- Considérez les fichiers projet comme sensibles s’ils contiennent des chemins source, module, sortie ou des règles de capture explicites.

Les processus d’inventaire, de construction et de vérification s’exécutent dans des groupes de processus dédiés. Une demande d’annulation entraîne une terminaison, puis une escalade après un délai de grâce. Un passage de hachage peut se terminer avant que l’annulation n’atteigne un point sûr, mais les résultats obsolètes sont ignorés. Une fois la publication atomique lancée, elle est autorisée à se terminer pour éviter de laisser la destination partiellement écrite.

Une construction annulée ou échouée ne publie pas son ISO privé. Toute destination précédente reste inchangée sauf si un remplacement vérifié a atteint la publication atomique.

## Documentation associée

- [Construction de MiniOS](/development/Building-MiniOS)
- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Composer des images ISO MiniOS en ligne de commande

`minios-image-compose` est le backend en ligne de commande fourni avec le Créateur d’images MiniOS. Il remplace l’outil `sb2iso` retiré. La commande remastérise un arbre de contenu MiniOS existant, modifie éventuellement son ensemble de modules et sa configuration prise en charge, vérifie le résultat et publie une ISO amorçable.

Utilisez l’interface graphique [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) pour un flux de travail guidé. Utilisez cette commande directement pour les scripts, l’automatisation ou les constructions reproductibles en ligne de commande. Pour une construction complète à partir des sources, utilisez [Construction de MiniOS](/development/Building-MiniOS) à la place.

### Utilisation de base

Depuis une session live MiniOS en cours, créez une ISO avec la source MiniOS détectée et `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Ne préfixez pas la commande complète avec `sudo` ou `pkexec`. La composition, la vérification et la publication s’exécutent en tant qu’utilisateur courant. Seule la capture de session optionnelle peut invoquer le backend de confiance `/usr/bin/savechanges` via PolicyKit.

Le nom de sortie par défaut est `minios-YYYYMMDD_HHMM.iso`. Une destination existante est refusée sauf si `--overwrite` est spécifié explicitement.

### Sélectionner une source

Sans `--source`, la commande découvre le contenu MiniOS utilisé par la session LiveKit ou dracut en cours. Pour remastériser un autre arbre MiniOS monté, indiquez le dossier contenant `boot/` et les modules MiniOS :

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La source est une entrée en lecture seule et n’est jamais modifiée. Les fichiers ISO et médias optiques doivent être montés avant d’utiliser leur arbre de contenu MiniOS avec la CLI. Le Créateur d’images MiniOS graphique peut monter ces sources via `udisksctl`.

### Sélectionner les modules

Les `.sb` modules supplémentaires sont des arguments positionnels :

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

La commande valide chaque module comme un fichier SquashFS lisible et non-symlink.
Les modules dont le nom commence par deux chiffres et un tiret sont placés au niveau supérieur MiniOS. Les autres modules ajoutés sont placés dans `minios/modules/`. Les doublons ou collisions de noms de base insensibles à la casse sont rejetés.

Excluez des chemins source avec une expression régulière POSIX étendue :

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Les fichiers de démarrage requis, le noyau et l’initramfs, les modules cœur, le menu de démarrage sélectionné et la configuration sélectionnée ne peuvent pas être exclus.

Créez les modules réutilisables avant de composer l’ISO. Voir [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules) et [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuration et manifeste

`--config FILE` installe le fichier régulier sélectionné comme `minios/config.conf`. Par défaut : `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Le manifeste optionnel doit être un objet JSON. Les labels de volume contiennent de 1 à 32 caractères ASCII imprimables ; les labels en dehors du jeu strict ISO 9660 (majuscules, chiffres, underscore) génèrent un avertissement.

### Capturer les modifications de session

La capture de session est optionnelle et s’applique à la couche modifiable de la session MiniOS en cours. Elle est acceptée pour une source explicite uniquement si cette source possède la même empreinte de module de base que le système en cours.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profils disponibles :

- `exact` capture chaque modification représentable et peut inclure des identifiants, des données personnelles, des journaux, l’état du navigateur et l’identité de la machine.
- `clean` utilise une liste blanche logicielle restreinte. Cela réduit l’exposition mais ne garantit pas l’absence de secret dans le résultat.
- `selected` utilise une sélection d’inventaire produite par une interface compatible ou un `savechanges` flux de travail.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Privilégiez les modules et la configuration déclarative à la capture de session si l’ISO doit être partagée. Voir [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) pour le modèle de confidentialité et le flux de révision.

### Personnaliser le comportement au démarrage

La CLI peut modifier les structures GRUB et SYSLINUX prises en charge :

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accepte `resume`, `new`, `choose`, `fresh`, ou `toram`. Le modèle sémantique `new` correspond à `perchdir=setup` dans les menus MiniOS actuels, tandis que les entrées source héritées `perchdir=new` restent reconnaissables. Le constructeur graphique de menus de démarrage préserve aussi `perchtoram=off|trim|full` indépendamment du paramètre système `toram`.
`--menu` accepte `multilang` ou une locale prise en charge telle que `en_US`, `ru_RU`, ou `de_DE`. Les arguments du noyau sont validés et ajoutés sans évaluation shell. Les structures de menu de démarrage non prises en charge ou ambiguës sont rejetées plutôt que modifiées par approximation.

### Ajouter une illustration ou une superposition système de fichiers

Remplacez le fond d’écran de démarrage par un PNG validé :

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Emballez un arbre de répertoire préparé comme module superposé appartenant à root :

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

La superposition est interprétée relativement à la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les liens non sûrs, fichiers spéciaux, traversées de systèmes de fichiers et collisions de destination sont rejetés.

### Vérification et publication

Avant publication, `minios-image-compose` vérifie l’arborescence du système de fichiers ISO, le label de volume, les enregistrements de démarrage BIOS et UEFI, la zone système, les fichiers de démarrage, les modules et la personnalisation demandée. Les modules superposés générés et les modules de session capturés sont extraits et vérifiés par rapport à leurs métadonnées et condensats enregistrés.

L’ISO est construite dans un dossier privé sur le système de fichiers de destination et n’est publiée de façon atomique qu’après la réussite de la vérification. Toute mutation d’entrée, échec de vérification, annulation ou espace insuffisant sur la destination empêche la publication. Une destination précédente reste inchangée sauf si une construction `--overwrite` explicitement approuvée atteint la publication atomique.

Créez un checksum et effectuez un test de démarrage séparé après une construction réussie :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas le test des chemins BIOS et UEFI visés dans une machine virtuelle jetable ou sur un matériel adapté.

### Référence des commandes

Utilisez le manuel installé et l’aide pour connaître la version exacte du backend :

```bash
minios-image-compose --help
man minios-image-compose
```

Options courantes :

| Option | But |
|---|---|
| `-n`, `--name FILE` | Définir le chemin de sortie. |
| `-e`, `--exclude REGEX` | Exclure les chemins source correspondants. |
| `--source DIR` | Sélectionner un arbre de contenu MiniOS explicite. |
| `--config FILE` | Sélectionner la configuration live intégrée dans l’ISO. |
| `--manifest FILE` | Inclure un manifeste de build JSON validé. |
| `--capture-changes MODE` | Capturer `exact`, `clean`, ou `selected` les modifications de session. |
| `--boot-timeout SECONDS` | Définir un délai de menu de démarrage de 0 à 300 secondes. |
| `--default-boot MODE` | Sélectionner l’action de session MiniOS par défaut. |
| `--kernel-args TEXT` | Ajouter des arguments globaux du noyau validés. |
| `--boot-background PNG` | Remplacer l’illustration de démarrage prise en charge. |
| `--overlay-directory DIR` | Ajouter une couche système de fichiers déclarative. |
| `--menu TYPE` | Sélectionner un menu multilingue ou localisé. |
| `--overwrite` | Autoriser explicitement le remplacement d’une sortie existante. |

La commande retourne un code non nul en cas d’échec des vérifications source, module, personnalisation, stockage, vérification ou publication. Ne distribuez pas une sortie sauf si la commande s’est terminée avec succès et que le checksum et les chemins de démarrage ont été testés.
