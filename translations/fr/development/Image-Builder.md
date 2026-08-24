# MiniOS Image Builder

MiniOS Image Builder est une application GTK permettant de remasteriser une image MiniOS existante. Elle sélectionne le contenu d'une session MiniOS en cours, d'un fichier ISO ou d'un disque optique, applique une personnalisation déclarative, puis utilise `minios-image-compose` pour produire un ISO amorçable vérifié.

Le générateur s'exécute à l'intérieur de MiniOS. Il ne modifie pas le support source sélectionné.

## Choisir le bon flux de travail

Image Builder remasterise une image binaire MiniOS existante. Il ne remplace pas les flux de travail suivants :

- **Construire MiniOS à partir des sources :** utilisez le système de build `minios-live` lorsque vous modifiez les listes de paquets de la distribution, la configuration de build, la couche noyau, les artefacts de démarrage ou la chaîne de modules reproductibles construits à partir des sources. Voir [Building MiniOS](/development/Building-MiniOS.md).
- **Créer un module réutilisable :** utilisez `apt2sb`, `script2sb`, `chroot2sb` ou les autres outils de modules lorsque le résultat attendu est une couche `.sb` autonome. Voir [Creating modules](/development/Creating-Modules.md).
- **Remasteriser une image :** utilisez Image Builder pour sélectionner des modules existants, ajouter des modules externes finalisés, modifier les paramètres d’image pris en charge, éventuellement capturer les modifications de session et publier un nouvel ISO.

La couche système de fichiers du projet est destinée aux fichiers déclaratifs à la racine de l'image. Elle n'exécute pas de scripts, n'installe pas de paquets et n'ouvre pas de chroot. Les logiciels destinés à la réutilisation doivent être préparés sous forme de module avant d'être ajoutés à un projet Image Builder.

## Options de source

La page Source accepte :

- La session MiniOS LiveKit ou dracut en cours.
- Un fichier ISO MiniOS.
- Un disque optique MiniOS.

Les sources ISO et disque optique sont montées en lecture seule avec `udisksctl`. L’inventaire de la source enregistre la version, l’architecture, la prise en charge du bootloader, la taille, l’inventaire des modules et une empreinte de la source. Si une source change après la planification, la construction est bloquée plutôt que de continuer avec une entrée différente.

La capture de session décrit toujours les modifications de la session MiniOS en cours d’exécution. Lorsqu’un ISO ou un disque optique est sélectionné, la capture n’est disponible que si l’empreinte du module de base de cette source correspond à la base montée de la session en cours. Sélectionner un média externe ne capture pas les modifications faites sur un autre système.

## Prérequis

Image Builder nécessite le backend `minios-image-compose` correspondant. Les sources ISO et disque optique requièrent `udisks2`. La lecture d’un `/etc/live/config.conf` accessible uniquement en root et la capture d’une session modifiable peuvent nécessiter `pkexec` et un agent PolicyKit de bureau. La capture de session requiert un `savechanges` compatible fourni par `minios-tools` 1.5.0 ou ultérieur.

L’application et le backend de composition restent non privilégiés. L’autorisation est limitée au lecteur de configuration live fixe et, si sélectionné, à des `/usr/bin/savechanges` de confiance.

## Flux de travail du projet

### Sélectionner la source

Choisissez une source et attendez la fin de l’inventaire. Vérifiez son identité, son architecture, la prise en charge du démarrage, les diagnostics et le nombre de modules. Corrigez les erreurs de source avant de continuer.

### Sélectionner le contenu

Choisissez les modules source à inclure et ajoutez tout module externe `.sb`. Les modules noyau et cœur requis sont verrouillés. Les modules actifs dans la session en cours mais absents de la source sélectionnée sont affichés séparément et ne sont pas inclus automatiquement.

Les modules supplémentaires doivent être des fichiers réguliers lisibles contenant des données SquashFS valides. Les doublons, les noms de base repliés ou en conflit, et les collisions de cible sont rejetés car l’environnement d’exécution résout les couches par nom de base.

### Configurer les paramètres

Choisissez le chemin de sortie et la configuration MiniOS actuelle requise. Les champs de personnalisation vides ou `Keep current` préservent le comportement de la source. Configurez uniquement les substitutions nécessaires pour la nouvelle image, puis décidez si la couche de session modifiable doit être capturée.

Les octets de `/etc/live/config.conf` sont copiés dans un stockage privé de build avec le mode 0600. Ils ne sont ni interprétés, ni affichés, ni enregistrés dans les journaux. Les projets actuels doivent inclure cette configuration ; un projet plus ancien qui la désactive explicitement ne pourra pas passer à la revue tant que cela n’aura pas été corrigé.

### Revoir le plan

La revue crée un nouveau plan à partir des identités d’entrée actuelles. Vérifiez les modules sélectionnés, exclus et additionnels, l’emplacement de sortie, l’espace estimé, le résumé de personnalisation, le profil de capture, les avertissements et la frontière de privilège.

La revue omet volontairement les valeurs de configuration, les arguments bruts du noyau, les chemins privés de personnalisation et les chemins de capture sélectionnés. Elle affiche les comptes, noms de base, empreintes et digests lorsque ceux-ci suffisent à lier le plan.

Si la sortie existe déjà, le remplacement nécessite une confirmation. La confirmation est liée au périphérique observé, à l’inode, à la taille, à l’horodatage et au SHA-256 de ce fichier. Un changement de destination, une annulation ou une tentative échouée annule l’approbation et nécessite une nouvelle revue.

### Construire et vérifier

La construction revalide chaque entrée effective et exécute `minios-image-compose` avec une liste d’arguments dans un répertoire de travail privé. L’ISO reste privé jusqu’à la réussite de la vérification structurelle. La publication vers la destination sélectionnée est atomique.

Enregistrez le projet si sa source, sa sélection de modules, sa sortie et son intention de personnalisation doivent être réutilisées. Les fichiers projet sont au format JSON. Les modifications non enregistrées nécessitent une confirmation avant d’ouvrir un autre projet ou de fermer l’application.

## Capture de session et confidentialité

Les modules source, `/etc/live/config.conf` et la capture de session sont des entrées indépendantes. Si la sélection de modules et la personnalisation déclarative suffisent, il n’est pas nécessaire de capturer la session modifiable.

### Ne pas inclure les modifications de session

C’est l’option recommandée par défaut. Le générateur utilise les modules sélectionnés, la configuration actuelle, les paramètres de démarrage et les autres personnalisations de l’image sans copier la couche de session modifiable.

### Inclure toutes les modifications de session

Ce profil préserve chaque modification modifiable prise en charge par le fournisseur OverlayFS ou AUFS détecté. Il peut inclure des mots de passe, des clés, des jetons, des données de navigateur, l’identité de la machine, des fichiers personnels, des journaux et l’état des fichiers supprimés. Il nécessite une reconnaissance explicite et ne doit pas être utilisé pour une image destinée à d’autres personnes sans audit séparé.

### Inclure uniquement les modifications réutilisables

Ce profil utilise une liste blanche stricte de chemins pour les logiciels et des valeurs sûres par défaut tout en omettant les données personnelles, d’identité, de cache et de journalisation. Cela réduit l’exposition mais ne garantit pas que les fichiers autorisés ne contiennent aucun secret. Inspectez l’image finale avant de la partager.

### Choisir manuellement les modifications de session

Exécutez `Analyze session changes`, puis sélectionnez au moins un chemin normalisé depuis l’inventaire en mémoire. Un dossier sélectionné inclut ses descendants. Les exclusions exactes ou d’ancêtres ont priorité sur les sélections correspondantes.

L’inventaire contient des métadonnées, y compris les noms de fichiers, et est donc sensible même s’il ne contient pas le contenu des fichiers. Il reste en mémoire et n’est ni écrit dans le projet, ni copié dans la revue ou les journaux. Les règles d’inclusion et d’exclusion explicites font partie de l’intention du projet et sont enregistrées ; la revue n’affiche que leur nombre et leur empreinte.

Lancer une autre analyse, actualiser ou changer la source, annuler ou échouer, ouvrir ou créer un projet efface l’inventaire en cours. L’analyse et la capture peuvent demander une autorisation administrateur, mais le processus Image Builder et la composition ISO ne sont pas élevés.

## Personnalisation de l’image

Les paramètres pris en charge sont contraints et validés par le backend :

- **Paramètres système par défaut :** nom d’hôte, fuseau horaire, cible systemd par défaut, et services activés ou désactivés.
- **Sécurité et accès :** sudo, PolicyKit, SSH, XRDP, X11, verrouillage d’écran et modes d’indication d’issue autorisés par liste blanche.
- **Données utilisateur :** répertoires utilisateur relatifs à la racine validés avec comportement de lien ou de montage, mais pas les deux.
- **Comportement au démarrage :** un délai de 0 à 300 secondes, le menu source ou un menu construit, et une entrée par défaut sélectionnée.
- **Entrées de démarrage :** les modèles resume, new, choose, fresh et copy-to-RAM peuvent être masqués, réorganisés, dupliqués et configurés via des contrôles typés de persistance, module, démarrage, localisation, zRAM et diagnostic.
- **Paramètres avancés de démarrage :** arguments noyau globaux et par entrée validés pour les options non représentées par des contrôles typés.
- **Apparence :** un fond d’écran de démarrage PNG validé.
- **Couche système de fichiers du projet :** un répertoire réel interprété par rapport à la racine de l’image et empaqueté comme un module overlay SquashFS appartenant à root.

La couche système de fichiers prend en charge les fichiers réguliers, les liens symboliques relatifs sûrs, les dossiers vides, les bits exécutables et les horodatages. Les nœuds de périphériques, sockets, FIFOs, traversées de systèmes de fichiers, liens absolus ou sortants et noms non sûrs sont rejetés. Les bits de privilège sont supprimés et la propriété dans le module généré est normalisée.

La personnalisation du démarrage prend en charge les GRUB MiniOS reconnus, SYSLINUX natif et la chaîne standard SYSLINUX-vers-GRUB. Toute configuration de démarrage non prise en charge ou ambiguë est rejetée plutôt que devinée. Une construction sans personnalisation du démarrage peut préserver une structure source que le parseur de personnalisation ne comprend pas.

## Vérification de la sortie

Avant la publication, `minios-image-compose` vérifie l’ISO généré au lieu de se fier uniquement à la sortie réussie de `xorriso`. Les vérifications incluent :

- L’arborescence du système de fichiers ISO et le label du volume.
- Les enregistrements de démarrage BIOS et UEFI et la zone système.
- Les contenus nécessaires au démarrage, au noyau, à l’initramfs, à la configuration et aux modules.
- Les personnalisations intégrées et les attestations de capture de session, si présentes.
- Les digests et la structure des modules overlay générés et des modules de session capturés.
- Les cibles de fond d’écran de démarrage et la configuration de démarrage transformée si personnalisée.

L’identité du chemin d’entrée, le mode, l’heure de modification et le SHA-256 sont enregistrés avant la construction. Les entrées modifiables sont instantanées en privé avec des reflinks si possible ; sinon, elles sont vérifiées pour mutation avant et après l’écriture de l’ISO. Une discordance ou un échec de vérification empêche la publication.

Après une construction réussie, enregistrez une somme de contrôle séparément :

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

La vérification structurelle ne remplace pas un test de démarrage. Démarrez l’ISO dans une machine virtuelle jetable et testez à la fois BIOS et UEFI si les deux doivent être pris en charge. Image Builder peut signaler que QEMU ou VirtualBox est installé, mais il ne démarre ni ne configure un hyperviseur.

## Sécurité et annulation

- Gardez les supports sources en lecture seule et écrivez la sortie sur un système de fichiers disposant de suffisamment d’espace libre pour l’estimation et la marge temporaire.
- Ne construisez pas directement par-dessus le seul ISO connu comme fiable. Utilisez un nouveau nom de sortie sauf si le remplacement est intentionnel et confirmé.
- Vérifiez les modules externes avant de les ajouter. Image Builder valide leur structure SquashFS mais n’établit pas l’auteur de leur contenu.
- Privilégiez l’absence de capture de session pour les images destinées à la distribution. Si une capture est nécessaire, auditez le système de fichiers résultant, pas seulement le nom du profil.
- Considérez les fichiers projet comme sensibles s’ils contiennent des chemins sources, modules, sorties ou règles de capture explicites.

Les sous-processus d’inventaire, de construction et de vérification s’exécutent dans des groupes de processus dédiés. Une demande d’annulation provoque une terminaison et s’intensifie après un délai de grâce. Un passage de hachage peut se terminer avant que l’annulation n’atteigne un point de contrôle sûr, mais les résultats obsolètes sont écartés. Une fois la publication atomique commencée, elle est autorisée à se terminer afin que la destination ne soit pas laissée intentionnellement à moitié écrite.

Une construction annulée ou échouée ne publie pas son ISO privé. Toute destination précédente reste en place sauf si un remplacement vérifié a atteint la publication atomique.

## Documentation associée

- [Building MiniOS](/development/Building-MiniOS.md)
- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO](/development/Rebuilding-ISO.md)
