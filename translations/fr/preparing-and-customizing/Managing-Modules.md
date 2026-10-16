---
updated: 2026-10-15
program_commits:
    minios-module-manager: 356c7582cf81884d606da388c93c674bf32049ba
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Gestion des modules

Gestionnaire de modules MiniOS est l’application graphique permettant d’inspecter, de créer et de gérer MiniOS `.sb` les modules. Il comporte deux espaces de travail : **Modules** pour composer le système et **Créer** pour créer de nouveaux modules.

Lancez l’application depuis le menu des applications ou exécutez la commande suivante :

```bash
minios-module-manager
```

L’application s’exécute avec votre compte utilisateur de bureau. Elle ne demande une authentification d’administrateur que lorsqu’une opération le nécessite.

## En cours d’exécution et au prochain démarrage

L’espace de travail Modules propose deux vues distinctes :

- **En cours d’exécution** est l’ensemble ordonné des modules qui composent actuellement le système en cours d’exécution.
- **Au prochain démarrage** est l’ensemble ordonné sélectionné par les règles de démarrage MiniOS.

Modifier une vue ne modifie pas automatiquement l’autre. Par exemple, **Activer pour cette session** ne concerne que le système en cours d’exécution, tandis que **Ajouter au prochain démarrage** copie un module dans le stockage permanent des modules sans l’activer immédiatement.

Pour connaître les règles de démarrage faisant autorité, notamment les niveaux de priorité des sources candidates, le remplacement par nom de base exact, l’ordre numérique et le filtrage `load=`, `noload=`, et `bext=` consultez le guide [Chargement des modules de l’initrd](/reference/boot-process/Module-Loading). Ce guide explique également pourquoi les vues En cours d’exécution et Au prochain démarrage peuvent différer.

L’activation et la désactivation à l’exécution sont disponibles uniquement lorsque le système de fichiers racine utilise actuellement AUFS. Elles ne sont pas disponibles sur une racine OverlayFS, même si le noyau prend en charge AUFS. Les modules de base ne peuvent pas être désactivés depuis l’application.

Les modifications applicables au prochain démarrage nécessitent un stockage de modules permanent et accessible en écriture. La désactivation d’un module utilisateur le déplace vers le stockage frère `modules-disabled/` au lieu de le supprimer ; il pourra être restauré ultérieurement. La suppression définitive est une action distincte, réservée aux modules désactivés. Les modules de base et ceux stockés sur un support en lecture seule ou volatil ne peuvent pas être désactivés. Les filtres de démarrage tels que `load`, `noload`, et `bext` continuent de déterminer quels modules sont sélectionnés.

## Inspecter un module

Sélectionnez un module pour afficher l’emplacement de son fichier source, sa taille compressée et le contenu de son système de fichiers. Si son fichier source est disponible, **Extraire dans un dossier** crée un nouveau répertoire contenant les fichiers du module.

L’inspection ne nécessite pas de droits d’administrateur. **Extraire dans un dossier** demande une authentification administrateur afin de préserver les propriétaires, les permissions et les fichiers spéciaux. L’extraction ne remplace jamais une destination existante et ne modifie pas le module source.

Vous pouvez également ouvrir un fichier `.sb` local depuis le gestionnaire de fichiers. L’ouverture d’un fichier permet uniquement de l’inspecter ; elle ne l’active pas et ne l’ajoute pas à Next Boot. Sur les systèmes Xfce où l’intégration Thunar MiniOS est installée, les actions du gestionnaire de fichiers utilisent le même moteur de gestion des modules pour leur activation et leur désactivation explicites ; elles ne contournent pas la distinction entre Running Now et Next Boot.

## Création d’un module

L’espace de création suit un flux **Configurer**, **Vérifier**, **Exécuter** et **Résultat**. Un module créé avec succès reste un fichier à l’emplacement de sortie. Il n’est pas activé et n’est pas ajouté automatiquement au prochain démarrage.

Méthodes disponibles :

- **Paquets** installe des paquets depuis des dépôts et des fichiers locaux sélectionnés `.deb` avec leurs dépendances, dans un environnement de compilation isolé MiniOS. L’installation de paquets nécessite une authentification administrateur.
- **Script d’installation** exécute un script vérifié sans terminal interactif. Un dossier de démarrage facultatif peut fournir les fichiers initiaux. Le script s’exécute avec les privilèges administrateur, mais n’est pas stocké dans le module créé.
- **Chroot interactif** ouvre un shell root temporaire dans le terminal intégré. Saisissez `exit` une fois terminé, puis créez le module, rouvrez le shell ou abandonnez les modifications. La fermeture ou l’abandon de la session ne modifie pas le système en cours d’exécution.
- **Dossier** empaquette le contenu d’un répertoire existant. Le répertoire source lui-même n’est pas inclus dans le module. L’interface graphique demande une authentification administrateur pour lire les fichiers protégés et préserver les attributs du système de fichiers ; elle ne modifie pas la source. Les dossiers extraits avec préservation des propriétaires sont détectés automatiquement et conservent leurs propriétaires. Pour un dossier extrait plus ancien, sans enregistrement d’origine, sélectionnez **Préserver les propriétaires de la source** si leurs propriétaires doivent être conservés.
- **Modifications de la session en cours** capture les fichiers admissibles et les suppressions de la couche inscriptible de la session en cours. Elle utilise la règle standard MiniOS `savechanges` qui exclut les journaux, les caches, les données de démarrage et les chemins d’exécution temporaires. La lecture de l’intégralité de la couche inscriptible nécessite une authentification administrateur.

Choisissez un nouveau chemin de sortie pour chaque flux de travail. Les fichiers existants ne sont jamais écrasés. La progression et les diagnostics du moteur restent visibles pendant l’opération, et la capture de la session en cours peut être annulée.

Pour les autres dossiers, le flux de travail Dossier par défaut remplace les identifiants utilisateur et groupe ordinaires (1000–60000) par ceux de root, sauf dans `/home` et `/opt`, conserve les identifiants système et attribue les répertoires standard de premier niveau à root. Cette option ne permet pas de récupérer les propriétaires perdus lors d’une extraction antérieure sans privilèges.

La capture des modifications de la session en cours est conçue pour une capture standard pratique, et non pour examiner chaque chemin inclus. Une couche inscriptible active peut contenir des données personnelles ou confidentielles. Pour définir explicitement des règles de confidentialité portant sur `exact`, `clean` ou des chemins spécifiques, utilisez le flux de travail en ligne de commande décrit dans `savechanges`[Capturer les modifications de la session en cours](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Glisser-déposer

Le glisser-déposer ne fait que renseigner un champ ou ouvrir l’inspection :

- Les détails d’un module s’ouvrent.
- `.deb` sont ajoutés aux packages.
- Un dossier est sélectionné pour le champ Dossier.
- Un autre fichier ordinaire est sélectionné comme script d’installation.

Déposer un élément n’exécute aucun code et ne modifie ni En cours ni Au prochain démarrage.

## Documentation associée

- [Créer des modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Chargement des modules initrd](/reference/boot-process/Module-Loading)
- [Modes de démarrage](/using-minios/Boot-Modes)
- [Créer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Paramètres de démarrage](/reference/Boot-Parameters)

<a id="creating-modules"></a>

## Créer des modules

Les MiniOS sont des images de système de fichiers SquashFS en lecture seule, généralement nommées avec l’extension `.sb` . Au démarrage, MiniOS organise les modules sélectionnés en un système de fichiers racine à plusieurs couches. Les fichiers d’une couche prioritaire peuvent compléter ou masquer ceux des couches inférieures. Ce processus modulaire en mode live fait partie de l’architecture MiniOS qui la caractérise, décrite dans [À propos de MiniOS](/getting-started/About-MiniOS) et [Modes de démarrage](/using-minios/Boot-Modes). Après la conversion native, le système racine à plusieurs couches `.sb` est remplacé par un système de fichiers Debian classique et inscriptible. Le logiciel de gestion des modules MiniOS est supprimé, car les flux de travail liés aux modules ne s’appliquent plus. L’environnement de bureau sélectionné et les applications courantes restent installés sous forme de paquets standard.

Ce guide décrit les procédures actuelles en ligne de commande de MiniOS Tools. Pour l’application graphique, consultez [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules). Pour connaître le processus complet de création de l’image et l’architecture du système, consultez [Créer MiniOS](/development/Building-MiniOS). Les listes de paquets utilisées lors de la création de MiniOS sont décrites dans la [documentation de CondinAPT](/development/CondinAPT).

### Sécurité et limites de privilèges

Toutes les opérations sur les modules ne nécessitent pas les privilèges root :

| Opération | Privilèges |
|---|---|
| Lister les modules actifs ou prévus au prochain démarrage avec `sb` | Sans privilèges root |
| Inspecter un module avec `sb inspect` | Sans privilèges root |
| Ligne de commande ordinaire `dir2sb` et `sb2dir` conversion | Sans privilèges root |
| Préserver la propriété ou autoriser les fichiers spéciaux lors de la conversion | Privilèges root |
| Compiler avec `apt2sb`, `script2sb`, ou `chroot2sb` | Privilèges root |
| Capturer la session avec `savechanges` | Privilèges root |
| Activer, désactiver, ajouter aux éléments prévus au prochain démarrage ou en retirer | Privilèges root |

Les outils de compilation utilisent un système de fichiers union isolé et n’installent ni paquets ni modifications de scripts dans le système root en cours d’exécution. La création n’active pas non plus le résultat et ne le sélectionne pas pour le prochain démarrage.

Les workflows graphiques « Dossier » et « Extraire vers un dossier » demandent une authentification administrateur afin de pouvoir traiter les fichiers protégés et préserver les attributs du système de fichiers.

Les convertisseurs et outils de compilation actuels publient les fichiers sans remplacer ceux qui existent. Une cible déjà présente, y compris un lien symbolique, n’est pas écrasée. Choisissez un nouveau chemin de sortie ou vérifiez et supprimez explicitement l’ancien fichier de sortie.

Utilisez la sortie de la commande `--help` comme référence pour la version installée. Les workflows actuels de `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb` et `savechanges` acceptent `zstd` (par défaut), `gzip`, `lzo`, `lz4` et `xz`. Le compresseur sélectionné doit être disponible sur le système en cours d’exécution.

### Noms de modules et niveaux de filtre

Les noms commencent souvent par un nombre, par exemple `06-browser.sb` car l’ordre des couches influe sur la résolution des conflits. Un module doit contenir des chemins relatifs à la racine du système, par exemple `usr/bin/example`, et non un répertoire supplémentaire contenant cette arborescence.

Pour connaître précisément les niveaux de source candidats, le comportement en cas de collision de noms de base, l’ordre numérique et la sémantique de `bext=`, `load=`, et `noload=`voir le [Chargement des modules initrd](/reference/boot-process/Module-Loading). En particulier, utilisez un nom de base unique, sauf si le module est destiné à remplacer l’emplacement du même nom provenant d’un niveau de source antérieur.

L’option `--level LEVEL` sur `apt2sb`, `script2sb` et `chroot2sb` limite les couches de base utilisées pour construire l’union de build. Avec `--level 3`, les couches numérotées jusqu’à `03` sont utilisées, tandis que les couches portant un numéro supérieur sont exclues. Cela peut réduire la dépendance d’un module aux couches supérieures facultatives, au prix d’un plus grand nombre de dépendances dans le résultat.

<a id="create-a-module-from-packages"></a>

### Créer un module à partir de paquets

`apt2sb` installe les paquets du dépôt ou les fichiers locaux lisibles `.deb` dans une union de build privée et capture le résultat. Une session MiniOS active et les droits root sont nécessaires.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sans `--name`, le nom de sortie est dérivé du premier paquet. Parmi les options APT utiles, on trouve `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` et `--target-release RELEASE`. L’option de version cible s’applique uniquement à `install`.

Pour capturer les mises à niveau des paquets déjà installés :

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

<a id="create-a-module-from-a-script"></a>

### Créer un module à partir d’un script

`script2sb` copie un script d’installation dans un chroot privé, le rend exécutable, l’exécute en tant que root sans terminal interactif, le supprime et capture les modifications apportées au système de fichiers. Si le script échoue, aucun module n’est créé.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Le `--directory DIR` facultatif copie tous les fichiers source, y compris les fichiers cachés, à la racine du module avant l’exécution du script. Organisez le répertoire d’initialisation sous forme d’arborescence de système de fichiers :

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Vérifiez le script avant de l’exécuter. Il s’exécute avec les privilèges administrateur et peut lancer des commandes arbitraires. Utilisez `chroot2sb` à la place si l’installation nécessite des réponses aux invites ou une intervention manuelle.

<a id="create-a-module-interactively"></a>

### Créer un module de manière interactive

`chroot2sb` crée une union de build privée et ouvre un shell root à l’intérieur. Installez des packages ou modifiez des fichiers, puis quittez le shell pour capturer les modifications :

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Les commandes saisies dans le shell ne sont pas rejouées au chargement du module ; celui-ci est un instantané de l’état du système de fichiers obtenu. L’historique du shell est supprimé du résultat. Si aucun nom n’est fourni, le nom généré utilise la date et l’heure actuelles.

Le cycle de vie split `prepare`, `shell`, `finish` et `cancel` est destiné aux interfaces graphiques protégées. Pour une utilisation normale du terminal, utilisez la commande interactive unique affichée ci-dessus.

<a id="create-a-module-from-a-directory"></a>

### Créer un module à partir d’un répertoire

`dir2sb` empaquette le contenu d’un répertoire préparé dans un nouveau module. Les deux opérandes sont obligatoires :

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversion standard s’effectue sans privilèges root. Elle laisse la source intacte et remplace les identifiants utilisateur et groupe ordinaires (1000–60000) par ceux de root en dehors de `/home` et `/opt`, conserve les identifiants système et attribue les répertoires standard de premier niveau à root. Elle refuse les fichiers de périphérique, les sockets et les FIFO, et n’écrase jamais la cible. `--keep-ownership` conserve tous les propriétaires de la source et `--allow-special` autorise les fichiers spéciaux ; les deux nécessitent les privilèges root.

`sb2dir` écrit `.minios-module-origin.json` dans le répertoire extrait. Si l’extraction a conservé les propriétaires, `dir2sb` reconnaît cet enregistrement et conserve automatiquement les propriétaires et les fichiers spéciaux lors du réempaquetage ; l’enregistrement lui-même n’est pas inclus dans le nouveau module. Un répertoire extrait sans conservation des propriétaires ne peut pas être réempaqueté, car les propriétaires d’origine ne sont alors plus connus. Extrayez à nouveau le module d’origine avec les options privilégiées.

<a id="capture-current-session-changes"></a>

### Capturer les modifications de la session en cours

`savechanges` lit la couche inscriptible de référence d’une session MiniOS en cours d’exécution. L’accès root est nécessaire, car cette couche peut contenir des fichiers accessibles uniquement avec les droits root. L’emplacement des modifications est détecté automatiquement par défaut :

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sans `--profile`, la stratégie historique MiniOS exclut les répertoires vides, les caches, les journaux, les données de démarrage, les chemins d’exécution, les pseudo-systèmes de fichiers, ainsi que certains fichiers de session et système. Cette stratégie est pratique pour créer des modules de façon traditionnelle, mais ne constitue pas une garantie explicite de confidentialité.

Les profils explicites sont les suivants :

- `exact` conserve les modifications représentables, y compris les données utilisateur, les journaux, les caches, les fichiers d’identité, les identifiants et les métadonnées de suppression prises en charge. Les objets du système de fichiers non pris en charge sont rejetés plutôt que supprimés silencieusement.
- `clean` utilise une liste d’autorisation restreinte de chemins liés aux logiciels. Ce profil exclut les données des répertoires personnels et de root, les journaux, les caches, les identités, la configuration réseau, les identifiants, la configuration système arbitraire et `/usr/local`. Il limite l’exposition des données privées, sans toutefois garantir qu’un fichier logiciel autorisé ne contienne aucun secret.
- `selected` ne comprend que les chemins relatifs examinés, répertoriés dans un inventaire et un fichier de sélection. Les exclusions explicites sont prioritaires. C’est le profil à utiliser lorsque le module doit contenir un sous-ensemble contrôlé des modifications de la session.

Exemples :

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un fichier de sélection doit respecter cette structure JSON stricte :

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Les chemins sont normalisés, non vides et relatifs à la racine des modifications. Générez et examinez d’abord l’inventaire ; chaque inclusion doit correspondre aux données de l’inventaire. Les enregistrements de l’inventaire contiennent des métadonnées telles que le chemin, le type, la catégorie, le niveau de sensibilité et la taille, mais ne lisent ni ne produisent le contenu des fichiers, les cibles des liens symboliques ou les valeurs secrètes. Les sorties et les inventaires des profils explicites ont le mode `0600` ; les modules utilisant la stratégie historique ont le mode `0644`.

La capture de session peut conserver les suppressions de fichiers prises en charge et l’opacité des répertoires pour le backend AUFS ou OverlayFS actif. Elle exclut les montages d’exécution, les systèmes de fichiers imbriqués, les métadonnées de l’union et le résultat lui-même. Une cible existante n’est jamais remplacée.

<a id="inspect-and-extract-modules"></a>

### Inspecter et extraire des modules

Inspecter un module sans le monter ni l’extraire :

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L’inspection ne nécessite pas de privilèges root et fonctionne également en dehors d’une session MiniOS en cours.

Extraire un module dans un nouveau répertoire :

```bash
sb2dir 06-example.sb example-root
```

L’extraction standard ne nécessite pas de privilèges root et ne modifie pas la source. Le répertoire cible ne doit pas exister. Les fichiers spéciaux sont refusés, sauf si `--allow-special` est demandé avec des privilèges suffisants.

Pour obtenir un répertoire pouvant être repaqueté fidèlement, extrayez le module avec des privilèges d’administrateur et conservez les propriétaires et les fichiers spéciaux :

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

L’extraction enregistre l’origine du module dans `.minios-module-origin.json` dans le nouveau répertoire. Une extraction sans privilèges root indique que les propriétaires n’ont pas été conservés ; un tel répertoire ne peut pas être transmis à `dir2sb`. Conservez l’enregistrement d’origine issu d’une extraction avec privilèges jusqu’au repaquetage.

Les répertoires créés par les versions actuelles de `sb2dir` sont des répertoires ordinaires. `rmsbdir`, `sb rm` et `sb rmdir` sont des commandes de compatibilité obsolètes qui refusent toujours toute suppression ; elles ne démontent rien et n’effectuent aucune suppression récursive. Vérifiez le chemin extrait et son contenu avant de le supprimer à l’aide des outils standard du système de fichiers.

<a id="manage-running-and-next-boot-modules"></a>

### Gérer les modules actifs et ceux du prochain démarrage

Les modules actifs et ceux du prochain démarrage sont des compositions indépendantes. Consultez [la construction de l’union et l’activation à l’exécution](/reference/boot-process/Module-Loading#union-construction) pour comprendre la séparation entre démarrage et exécution, et pourquoi les deux listes peuvent différer.

Liste les modules qui composent réellement la racine AUFS ou OverlayFS actuelle, de la priorité la plus faible à la plus élevée :

```bash
sb list
sb list --json
```

Liste les modules sélectionnés par les règles de démarrage actuelles :

```bash
sb next-boot
sb next-boot --json
```

Ces requêtes ne sont associées à aucune racine. Les règles canoniques de [niveau de candidat et de remplacement](/reference/boot-process/Module-Loading#candidate-tiers) déterminent quelle source fournit chaque nom de base pour le prochain démarrage.

Pour rendre un module utilisateur disponible au prochain démarrage :

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilise un stockage inscriptible et persistant adapté, prépare et valide la copie, puis la publie de façon atomique sans remplacer un module existant. Le nom de fichier doit respecter les filtres de démarrage actuels. Désactivez un module utilisateur sélectionné en indiquant son nom de base exact :

```bash
sudo sb next-boot disable 50-extra.sb
```

La désactivation conserve le fichier dans `modules-disabled/`. L’ancienne commande `next-boot remove` est un alias de la désactivation, et non une suppression définitive. Pour le restaurer ou le supprimer définitivement, utilisez :

```bash
sudo sb next-boot enable 50-extra.sb
# To delete it permanently, disable it first:
sudo sb next-boot disable 50-extra.sb
sudo sb next-boot delete 50-extra.sb
```

Les modules de base et ceux stockés sur des sources en lecture seule ou volatiles ne peuvent pas être désactivés. La suppression définitive est également refusée si le module est actif. Consultez `sb next-boot` et la liste des modules désactivés avant de supprimer le fichier conservé.

L’activation à l’exécution est une opération distincte, limitée à la session :

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

L’activation et la désactivation ne fonctionnent que si `/` est actuellement une union AUFS. Elles ne sont pas disponibles sur OverlayFS, et la prise en charge de AUFS par le noyau ne suffit pas à elle seule. Aucune de ces commandes ne modifie les modules du prochain démarrage.

Le répartiteur du convertisseur de compatibilité nécessite les deux opérandes :

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L’utilisation directe de `dir2sb` et de `sb2dir` est préférable, car une conversion ordinaire peut s’exécuter sans racine.

### Documentation associée

- [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules)
- [Chargement des modules initrd](/reference/boot-process/Module-Loading)
- [Modes de démarrage](/using-minios/Boot-Modes)
- [Reconstruction d’images ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Création de MiniOS](/development/Building-MiniOS)
- [Paramètres de démarrage](/reference/Boot-Parameters)
