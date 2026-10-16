---
updated: 2026-10-15
program_commits:
    minios-image-builder: 8592ec061393e48e6bdfbd43d5b4365a94c73a67
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Créer des images MiniOS personnalisées

Le Créateur d’images MiniOS est une application GTK permettant de remastériser une image MiniOS existante. Il sélectionne du contenu depuis une session MiniOS en cours, un fichier ISO ou un disque optique, applique une personnalisation déclarative et utilise `minios-image-compose` pour produire une image ISO amorçable vérifiée.

Le créateur s’exécute dans MiniOS. Il ne modifie pas le média source sélectionné.

## Choisir le workflow adapté

Le Créateur d’images MiniOS remastérise une image binaire MiniOS existante. Il ne remplace aucun des workflows suivants :

- **Créer MiniOS à partir des sources :** utilisez le `minios-live` système de build pour modifier les listes de paquets de la distribution, la configuration de build, la couche du noyau, les artefacts de démarrage ou la chaîne reproductible de modules compilés à partir des sources. Voir [Création de MiniOS](/development/Building-MiniOS).
- **Créer un module réutilisable :** utilisez `apt2sb`, `script2sb`, `chroot2sb` ou les autres outils de gestion des modules si le résultat souhaité est une couche `.sb`. Voir [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remastériser une image :** utilisez le Créateur d’images MiniOS pour sélectionner des modules existants, ajouter des modules externes finalisés, modifier les paramètres d’image pris en charge, capturer éventuellement les modifications de la session et publier une nouvelle image ISO.

La couche du système de fichiers du projet sert aux fichiers déclaratifs dans la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les logiciels destinés à être réutilisés doivent être préparés sous forme de module avant d’être ajoutés à un projet du Créateur d’images MiniOS.

## Options de source

La page Source accepte :

- La session LiveKit ou dracut MiniOS en cours.
- Un fichier ISO MiniOS.
- Un disque optique MiniOS.

Les sources ISO et les disques optiques sont montés en lecture seule avec `udisksctl`. L’inventaire de la source indique la version, l’architecture, la prise en charge du chargeur d’amorçage, la taille, l’inventaire des modules et une empreinte de la source. Si une source change après la planification, le build est bloqué au lieu de se poursuivre avec des données différentes.

Dans le créateur graphique, la capture de session est disponible uniquement si la source est la **session MiniOS en cours d’exécution**, avec tous les modules source et tous les modules externes actifs inclus. Cette option n’est pas disponible pour un fichier ISO ou un disque optique sélectionné séparément, même s’il contient la même version. Ne désélectionnez pas les couches source lors de la capture de la session modifiable, car ses modifications dépendent de cette base complète en cours d’exécution.

## Prérequis

Le Créateur d’images MiniOS nécessite le backend correspondant`minios-image-compose`. Les sources sous forme de fichiers ISO ou de disques optiques nécessitent `udisks2`. La lecture d’un `/etc/live/config.conf` réservé à root et la capture d’une session modifiable peuvent nécessiter `pkexec` ainsi qu’un agent PolicyKit de bureau. La capture de session nécessite un `savechanges` compatible fourni par `minios-tools` version 1.5.0 ou ultérieure.

L’application et le backend de composition ne disposent pas de privilèges élevés. L’autorisation se limite au lecteur de configuration active prédéfini et, le cas échéant, aux `/usr/bin/savechanges` de confiance.

## Flux de travail du projet

### Sélectionner la source

Choisissez une source et attendez la fin de l’inventaire. Vérifiez son identité, son architecture, la prise en charge du démarrage, les diagnostics et le nombre de modules. Corrigez les erreurs de la source avant de continuer.

### Sélectionner le contenu

Choisissez les modules source à inclure et ajoutez les modules `.sb` externes de votre choix. Les modules principaux et du noyau requis sont verrouillés. Les modules externes ordinaires, actifs dans la session actuelle mais absents de la source sélectionnée, sont affichés séparément et restent facultatifs.

Un module externe qui remplace activement un module source à son chemin système d’origine est traité différemment : Image Builder identifie le fichier sous-jacent à l’aide du périphérique et de l’inode, conserve son rôle système d’origine et inclut ce remplacement comme module source effectif, au lieu de le présenter comme un doublon facultatif sans lien. Cela concerne également les chemins de sauvegarde initramfs déplacés. Les autres modules externes doivent toujours être sélectionnés explicitement.

Les modules supplémentaires doivent être des fichiers ordinaires lisibles contenant des données SquashFS valides. Les noms de base en double ou dont la casse diffère, ainsi que les conflits de cible, sont refusés, car le runtime résout les couches à partir du nom de base.

### Configurer les paramètres

Choisissez le chemin de sortie et la configuration MiniOS actuelle requise. Les champs de personnalisation vides ou `Keep current` préservent le comportement de la source. Configurez uniquement les remplacements nécessaires pour la nouvelle image, puis indiquez si la couche de session modifiable doit être capturée.

Les octets de `/etc/live/config.conf` sont copiés dans un espace de stockage de compilation privé avec les permissions 0600. Ils ne sont ni interprétés, ni affichés, ni consignés. Les projets actuels doivent inclure cette configuration ; un ancien projet qui la désactive explicitement ne peut pas passer à l’étape de vérification tant que le problème n’est pas corrigé.

### Examiner le plan

L’examen crée un nouveau plan à partir des identifiants d’entrée actuels. Vérifiez les modules sélectionnés, exclus et supplémentaires, l’emplacement de sortie, l’espace estimé, le résumé des personnalisations, le profil de capture, les avertissements et la limite de privilèges.

L’examen omet volontairement les valeurs de configuration, les arguments bruts du noyau, les chemins de personnalisation privés et les chemins de capture sélectionnés. Il affiche des nombres, des noms de base, des empreintes et des condensats lorsque ces informations suffisent à identifier le plan.

Si le fichier de sortie existe déjà, son remplacement nécessite une confirmation. Cette confirmation est liée au périphérique, à l’inode, à la taille, à l’horodatage et au SHA-256 du fichier tels qu’ils ont été observés. Toute modification de la destination, annulation ou tentative échouée annule l’approbation et nécessite un nouvel examen.

### Créer et vérifier

La création valide à nouveau chaque entrée effective et exécute `minios-image-compose` avec une liste d’arguments dans un répertoire de travail privé. Le fichier ISO reste privé jusqu’à la réussite de la vérification structurelle. Sa publication à la destination sélectionnée est atomique.

Enregistrez le projet si vous comptez réutiliser sa source, la sélection des modules, la sortie et les personnalisations souhaitées. Les fichiers de projet sont au format JSON. Toute modification non enregistrée doit être confirmée avant l’ouverture d’un autre projet ou la fermeture de l’application.

## Capture de session et confidentialité

Modules source, `/etc/live/config.conf`, et la capture de session sont des entrées indépendantes. Si la sélection des modules et la personnalisation déclarative suffisent, ne capturez pas la session modifiable.

### Ne pas inclure les modifications de session

Il s’agit du choix recommandé par défaut. L’outil de création utilise les modules sélectionnés, la configuration actuelle, les paramètres de démarrage et les autres personnalisations de l’image sans copier la couche de session modifiable.

### Inclure toutes les modifications de la session

Ce profil conserve toutes les modifications inscriptibles prises en charge par le fournisseur OverlayFS ou AUFS détecté. Il peut inclure des mots de passe, des clés, des jetons, des données de navigation, l’identité de la machine, des fichiers personnels, des journaux et l’état des fichiers supprimés. Son utilisation nécessite une confirmation explicite. Ne l’utilisez pas pour une image destinée à d’autres personnes sans audit préalable.

### Inclure uniquement les modifications réutilisables

Ce profil applique une liste stricte de chemins autorisés pour les logiciels et des paramètres sûrs par défaut, tout en excluant les données personnelles, d’identité, de cache et de journalisation. Il réduit les risques d’exposition, mais ne garantit pas que les fichiers autorisés ne contiennent aucun secret. Vérifiez l’image finale avant de la partager.

### Choisir manuellement les modifications de la session

Exécutez `Analyze session changes`, puis sélectionnez au moins un chemin normalisé dans l’inventaire conservé en mémoire. Un répertoire sélectionné inclut ses descendants. Les exclusions exactes ou visant un répertoire parent prévalent sur les sélections correspondantes.

L’inventaire contient des métadonnées, notamment des noms de fichiers, et est donc sensible même s’il ne contient pas le contenu des fichiers. Il reste en mémoire et n’est ni écrit dans le projet ni copié dans Review ou les journaux. Les règles d’inclusion et d’exclusion explicites définissent les paramètres du projet et sont enregistrées ; Review n’en affiche que le nombre et l’empreinte.

Le lancement d’une nouvelle analyse, l’actualisation ou la modification de la source, l’annulation ou l’échec, ainsi que l’ouverture ou la création d’un projet effacent l’inventaire d’exécution. L’analyse et la capture peuvent demander une autorisation administrateur, mais le processus Créateur d’images MiniOS et la composition de l’ISO ne s’exécutent pas avec des privilèges élevés.

## Personnalisation de l’image

Les paramètres pris en charge sont limités et validés par le backend :

- **Paramètres système par défaut :** nom d’hôte, fuseau horaire, cible systemd par défaut et services activés ou désactivés.
- **Sécurité et accès :** modes sudo avec liste d’autorisation, PolicyKit, SSH, XRDP, X11, écran de verrouillage et message d’accueil.
- **Données utilisateur :** répertoires utilisateur validés, relatifs à la racine, avec un comportement de lien ou de montage bind, mais pas les deux.
- **Comportement au démarrage :** délai de 0 à 300 secondes, menu source ou menu personnalisé, et entrée par défaut sélectionnée.
- **Entrées de démarrage :** les modèles resume, new, choose, fresh et copy-to-RAM peuvent être masqués, réordonnés, dupliqués et configurés au moyen de paramètres typés de persistance, de modules, de démarrage, de localisation, de zRAM et de diagnostic. Les modèles actuels de nouvelle session utilisent `perchdir=setup` afin de sélectionner le backend de persistance au démarrage ; si une ancienne source utilise déjà `perchdir=new`, ce sélecteur hérité est conservé au lieu d’être réécrit silencieusement.
- **Comportement RAM :** la copie du système (`toram`) et la copie de la session de persistance (`perchtoram`) sont des paramètres indépendants. `perchtoram=off` conserve la persistance sur le support de stockage, `trim` copie la session prise en charge sélectionnée et `full` demande la copie de l’intégralité de la session prise en charge. Lorsqu’une persistance est demandée, le démarrage système RAM utilise par défaut `trim` sauf si une autre valeur est choisie. Les données des répertoires natifs ne sont pas copiées : l’initrd crée généralement à la place un nouveau conteneur vide pour cette demande. Utilisez `perchtoram=off` pour conserver les données natives sur le support de stockage.
- **Paramètres de démarrage avancés :** arguments du noyau globaux et par entrée, validés, pour les options qui ne sont pas représentées par des paramètres typés.
- **Apparence :** image PNG validée pour l’arrière-plan de démarrage.
- **Couche du système de fichiers du projet :** un répertoire réel interprété relativement à la racine de l’image et empaqueté sous forme de module overlay SquashFS appartenant à root.

La couche du système de fichiers prend en charge les fichiers ordinaires, les liens symboliques relatifs sûrs, les répertoires vides, les bits d’exécution et les horodatages. Les nœuds de périphérique, sockets, tubes nommés, points de montage traversant un autre système de fichiers, liens absolus ou sortant du répertoire et noms non sûrs sont refusés. Les bits de privilège sont supprimés et le propriétaire des fichiers du module généré est normalisé.

La personnalisation du démarrage prend en charge les configurations GRUB reconnues MiniOS, SYSLINUX natif et la chaîne standard SYSLINUX vers GRUB. Les configurations de démarrage non prises en charge ou ambiguës sont refusées plutôt que devinées. Une compilation sans personnalisation du démarrage peut conserver une disposition source que l’analyseur de personnalisation ne sait pas interpréter.

## Vérification de la sortie

Avant la publication, `minios-image-compose` vérifie l’ISO générée au lieu de se fier uniquement à la réussite du `xorriso` processus. Les vérifications portent sur :

- L’arborescence du système de fichiers de l’ISO et son nom de volume.
- Les enregistrements de démarrage BIOS et UEFI, ainsi que la zone système.
- Les fichiers requis pour le démarrage, le noyau, l’initramfs, la configuration et les modules.
- Les attestations de personnalisation intégrée et de capture de session, le cas échéant.
- Les sommes de contrôle et la structure des modules de superposition générés et des modules de session capturée.
- Les cibles d’arrière-plan de démarrage et la configuration de démarrage transformée, en cas de personnalisation.

L’identité du chemin d’accès, le mode, la date de modification et le SHA-256 des entrées sont enregistrés avant la compilation. Les entrées modifiables sont copiées dans un instantané privé au moyen de reflinks si cette fonctionnalité est prise en charge ; sinon, elles sont vérifiées pour détecter toute modification avant et après l’écriture de l’ISO. Toute différence ou échec de vérification empêche la publication.

Une fois la compilation réussie, enregistrez une somme de contrôle séparément :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas un test de démarrage. Démarrez l’ISO dans une machine virtuelle jetable et testez les modes BIOS et UEFI si les deux sont censés être pris en charge. Le Créateur d’images MiniOS peut indiquer si QEMU ou VirtualBox est installé, mais il ne lance ni ne configure d’hyperviseur.

## Sécurité et annulation

- Gardez les supports source en lecture seule et écrivez les fichiers de sortie sur un système de fichiers disposant de suffisamment d’espace libre pour couvrir l’estimation et une marge temporaire.
- Ne créez pas l’image directement à l’emplacement de votre seul ISO connu comme fonctionnel. Utilisez un nouveau nom de fichier de sortie, sauf si le remplacement est intentionnel et confirmé.
- Vérifiez les modules externes avant de les ajouter. Le Créateur d’images MiniOS valide leur structure SquashFS, mais ne permet pas d’établir qui a créé leur contenu.
- Évitez la capture de session pour les images destinées à être distribuées. Si une capture est nécessaire, examinez le système de fichiers obtenu, et pas uniquement le nom du profil.
- Considérez les fichiers de projet comme sensibles s’ils contiennent des chemins source explicites, des chemins de modules ou de sortie, ou des règles de capture sélectionnées.

Les sous-processus d’inventaire, de compilation et de vérification s’exécutent dans des groupes de processus dédiés. Une demande d’annulation déclenche leur arrêt, puis une interruption forcée après un délai de grâce. Une opération de hachage peut se terminer avant que l’annulation n’atteigne un point d’arrêt sûr, mais les résultats obsolètes sont abandonnés. Une fois la publication atomique commencée, elle est menée à terme afin que la destination ne soit pas laissée à moitié écrite.

Une compilation annulée ou échouée ne publie pas l’ISO privé. Toute destination précédente est conservée, sauf si un remplacement vérifié a été publié de manière atomique.

## Documentation associée

- [Compilation de MiniOS](/development/Building-MiniOS)
- [Créer des modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

<a id="composing-minios-iso-images-from-the-command-line"></a>

## Composer des images ISO MiniOS en ligne de commande

`minios-image-compose` est le moteur de ligne de commande fourni avec le Créateur d’images MiniOS. Il remplace l’utilitaire `sb2iso` retiré. Cette commande remanie une arborescence de contenu MiniOS existante, permet de modifier l’ensemble de modules et la configuration prise en charge, vérifie le résultat et publie un ISO amorçable.

Utilisez l’interface graphique [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) pour suivre un processus de projet guidé. Utilisez cette commande directement pour les scripts, l’automatisation ou les compilations reproductibles en ligne de commande. Pour une compilation complète à partir des sources, consultez [Compilation de MiniOS](/development/Building-MiniOS) à la place.

### Utilisation de base

À partir d’une session MiniOS active, créez une image ISO avec la source MiniOS détectée et `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Ne préfixez pas la commande complète avec `sudo` ni avec `pkexec`. La composition, la vérification et la publication s’exécutent avec les privilèges de l’utilisateur actuel. Seule la capture facultative de la session peut faire appel au backend de confiance `/usr/bin/savechanges` via PolicyKit.

Le nom de sortie par défaut est `minios-YYYYMMDD_HHMM.iso`. Si une destination existe déjà, elle est refusée, sauf si `--overwrite` est spécifié explicitement.

### Sélectionner une source

Sans `--source`, la commande détecte le contenu MiniOS utilisé par la session LiveKit ou dracut actuelle. Pour recréer une autre arborescence MiniOS montée, indiquez le répertoire contenant `boot/` et les modules MiniOS :

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

La source est une entrée en lecture seule et n’est jamais modifiée. Les fichiers ISO et les supports optiques doivent être montés avant d’utiliser leur arborescence de contenu MiniOS avec la CLI. Le Créateur d’images MiniOS graphique peut monter ces sources via `udisksctl`.

### Sélectionner des modules

Les modules `.sb`supplémentaires sont des arguments positionnels :

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

La commande vérifie que chaque module est un fichier SquashFS lisible et non symbolique.
Les modules dont le nom commence par deux chiffres suivis d’un trait d’union sont placés à la racine de MiniOS. Les autres modules ajoutés sont placés dans `minios/modules/`. Les doublons et les collisions de noms de base sans distinction de casse sont refusés.

Excluez des chemins source à l’aide d’une expression régulière étendue POSIX :

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Les fichiers de démarrage requis, les fichiers du noyau et de l’initramfs, les modules essentiels, le menu de démarrage sélectionné et la configuration sélectionnée ne peuvent pas être exclus.

Créez des modules réutilisables avant de composer l’image ISO. Consultez [Créer des modules](/preparing-and-customizing/Managing-Modules#creating-modules) et [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuration et manifeste

`--config FILE` installe le fichier standard sélectionné sous `minios/config.conf`. La valeur par défaut est `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Le manifeste facultatif doit être un objet JSON. Les étiquettes de volume doivent contenir de 1 à 32 caractères ASCII imprimables ; celles qui ne respectent pas strictement le jeu de caractères ISO 9660 (majuscules, chiffres et traits de soulignement) déclenchent un avertissement.

### Capturer les modifications de la session

La capture de session est facultative et concerne la couche inscriptible de la session MiniOS en cours d’exécution. Elle n’est acceptée pour une source explicite que si son empreinte de module de base est identique à celle du système en cours d’exécution.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profils disponibles :

- `exact` capture toutes les modifications représentables et peut inclure des identifiants, des données personnelles, des journaux, l’état du navigateur et l’identité de la machine.
- `clean` utilise une liste d’autorisation ciblée, axée sur les logiciels. Elle réduit l’exposition, mais ne garantit pas que le résultat ne contienne aucun secret.
- `selected` utilise une sélection d’inventaire générée par une interface compatible ou un processus `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Privilégiez les modules et la configuration déclarative plutôt que la capture de session lorsque l’ISO sera partagé. Consultez [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) pour connaître le modèle de confidentialité et le processus de vérification.

### Personnaliser le comportement au démarrage

La CLI peut modifier les configurations GRUB et SYSLINUX prises en charge :

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accepte `resume`, `new`, `choose`, `fresh`, ou `toram`. Le modèle sémantique `new` correspond à `perchdir=setup` dans les menus MiniOS actuels, tandis que les anciennes entrées `perchdir=new` restent reconnaissables. Le constructeur graphique de menu de démarrage préserve également `perchtoram=off|trim|full` indépendamment du paramètre système `toram`.
`--menu` accepte `multilang` ou une langue prise en charge, comme `en_US`, `ru_RU`, ou `de_DE`. Les arguments du noyau sont validés puis ajoutés sans interprétation par le shell. Les configurations de menu de démarrage non prises en charge ou ambiguës sont refusées plutôt que modifiées au hasard.

### Ajouter une illustration ou une surcouche de système de fichiers

Remplacez l’image d’arrière-plan du démarrage par un PNG validé :

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empaquetez une arborescence de répertoire préparée dans un module de surcouche image appartenant à root :

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

La surcouche est interprétée par rapport à la racine de l’image. Elle n’exécute pas de scripts, n’installe pas de paquets et n’ouvre pas de chroot. Les liens non sécurisés, les fichiers spéciaux, les franchissements de systèmes de fichiers et les collisions de destination sont refusés.

### Vérification et publication

Avant la publication, `minios-image-compose` vérifie l’arborescence du système de fichiers ISO, l’étiquette de volume, les enregistrements de démarrage BIOS et UEFI, la zone système, les fichiers de démarrage, les modules et les personnalisations demandées. Les modules de surcouche générés et ceux issus d’une capture de session sont extraits et vérifiés par rapport à leurs métadonnées et sommes de contrôle enregistrées.

L’ISO est créé dans un répertoire privé du système de fichiers de destination et n’est publié de manière atomique qu’une fois la vérification réussie. Toute modification des entrées, tout échec de vérification, toute annulation ou tout manque d’espace de destination empêche la publication. Une destination précédente reste inchangée, sauf si une compilation `--overwrite` approuvée explicitement atteint l’étape de publication atomique.

Créez une somme de contrôle et effectuez un test de démarrage distinct après une compilation réussie :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas le test des chemins BIOS et UEFI prévus dans une machine virtuelle temporaire ou sur du matériel adapté.

### Référence des commandes

Consultez le manuel installé et l’aide de la version exacte du backend :

```bash
minios-image-compose --help
man minios-image-compose
```

Options courantes :

| Option | Fonction |
|---|---|
| `-n`, `--name FILE` | Définit le chemin de sortie. |
| `-e`, `--exclude REGEX` | Exclut les chemins source correspondants. |
| `--source DIR` | Sélectionne une arborescence de contenu MiniOS explicite. |
| `--config FILE` | Sélectionne la configuration active intégrée à l’ISO. |
| `--manifest FILE` | Inclut un manifeste de build JSON validé. |
| `--capture-changes MODE` | Capture `exact`, `clean` ou `selected` les modifications de session. |
| `--boot-timeout SECONDS` | Définit le délai d’attente du menu de démarrage entre 0 et 300 secondes. |
| `--default-boot MODE` | Sélectionne l’action de session par défaut MiniOS. |
| `--kernel-args TEXT` | Ajoute des arguments globaux validés au noyau. |
| `--boot-background PNG` | Remplace les images de démarrage prises en charge. |
| `--overlay-directory DIR` | Ajoute une couche de système de fichiers déclarative. |
| `--menu TYPE` | Sélectionne un menu multilingue ou localisé. |
| `--overwrite` | Autorise explicitement le remplacement d’un fichier de sortie existant. |

La commande renvoie un code de sortie non nul en cas d’échec des vérifications de la source, du module, de la personnalisation, du stockage, de la validation ou de la publication. Ne distribuez pas le fichier de sortie avant que la commande se soit exécutée avec succès et que la somme de contrôle ainsi que les chemins de démarrage obtenus aient été testés.
