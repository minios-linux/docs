---
updated: 2026-08-31
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# Gestion des modules

Le Gestionnaire de modules MiniOS est l’application graphique permettant d’inspecter, de créer et de gérer les modules MiniOS `.sb`. Il propose deux espaces de travail : **Modules** pour la composition du système et **Créer** pour la création de nouveaux modules.

Lancez-le depuis le menu des applications ou exécutez :

```bash
minios-module-manager
```

L’application elle-même s’exécute sous votre utilisateur de session. Elle demande une authentification administrateur uniquement lorsqu’une opération le nécessite.

## Exécution actuelle et prochain démarrage

L’espace de travail Modules propose deux vues distinctes :

- **En cours d’exécution** correspond à l’ensemble ordonné des modules qui composent actuellement le système en direct.
- **Prochain démarrage** est l’ensemble ordonné sélectionné par les règles de démarrage MiniOS en vigueur.

Modifier une vue ne change pas silencieusement l’autre. Par exemple, **Activer pour cette session** n’affecte que le système en cours, tandis que **Ajouter au prochain démarrage** copie un module dans le stockage durable des modules sans l’activer immédiatement.

Pour les règles officielles appliquées au démarrage, incluant les niveaux de source candidats, le remplacement exact par nom de base, l’ordre numérique et les filtres `load=`, `noload=` et `bext=`, consultez [Chargement des modules Initrd](/reference/boot-process/Module-Loading). Ce guide explique également pourquoi En cours d’exécution et Prochain démarrage peuvent différer.

L’activation et la désactivation à chaud ne sont disponibles que lorsque le système de fichiers racine utilise actuellement AUFS. Elles ne sont pas disponibles sur un root OverlayFS, même si le noyau prend en charge AUFS. Les modules de base ne peuvent pas être désactivés via l’application.

Les modifications du prochain démarrage ne sont possibles que si MiniOS détecte un stockage de modules durable et inscriptible. Les modules de base ainsi que ceux stockés sur des supports en lecture seule ou volatiles ne peuvent pas être supprimés. Les filtres de démarrage comme `load`, `noload` et `bext` déterminent toujours les modules sélectionnés.

## Inspection d’un module

Sélectionnez un module pour afficher sa source, sa taille compressée et son contenu système de fichiers. Si son fichier source est disponible, **Extraire dans un dossier** crée un nouveau répertoire contenant les fichiers du module.

L’inspection et l’extraction simple ne nécessitent pas de privilèges administrateur. L’extraction ne remplace jamais une destination existante.

Vous pouvez également ouvrir un fichier local `.sb` depuis le gestionnaire de fichiers. Ouvrir un fichier permet uniquement de l’inspecter ; cela ne l’active pas et ne l’ajoute pas au prochain démarrage.

## Création d’un module

L’espace de travail Créer utilise un flux **Configurer**, **Vérifier**, **Exécuter**, puis **Résultat**. Un module créé avec succès reste un fichier à l’emplacement de sortie. Il n’est pas activé et n’est pas ajouté automatiquement au prochain démarrage.

Méthodes disponibles :

- **Paquets** installe les paquets du dépôt et les fichiers locaux sélectionnés `.deb`, ainsi que leurs dépendances, dans un environnement de build isolé MiniOS. L’installation des paquets nécessite une authentification administrateur.
- **Script d’installation** exécute un script vérifié sans terminal interactif. Un dossier de préconfiguration optionnel peut fournir les fichiers initiaux. Le script s’exécute avec les droits administrateur mais n’est pas conservé dans le module généré.
- **Chroot interactif** ouvre un shell root temporaire dans le terminal intégré. Tapez `exit` lorsque vous avez terminé, puis créez le module, rouvrez le shell ou annulez les modifications. Fermer ou annuler la session ne modifie pas le système en cours d’exécution.
- **Dossier** empaquette le contenu d’un répertoire existant. Le répertoire source n’est pas inclus dans le module. La conversion classique d’un dossier ne nécessite pas les droits root, ne modifie pas la source et normalise la propriété dans le module à root.
- **Modifications de la session en cours** capture les fichiers et suppressions éligibles de la couche session modifiable en cours. Elle utilise la politique standard MiniOS `savechanges` qui exclut les journaux, caches, données de démarrage et chemins temporaires d’exécution. La lecture de la couche modifiable complète nécessite une authentification administrateur.

Choisissez un nouveau chemin de sortie pour chaque flux de travail. Les fichiers existants ne sont jamais écrasés. L’avancement et les diagnostics du backend restent visibles pendant l’opération, et la capture de la session en cours peut être annulée.

La fonction Modifications de la session en cours est conçue pour une capture standard pratique, et non pour examiner chaque chemin inclus. Une couche modifiable active peut contenir des données personnelles ou confidentielles. Pour une capture explicite `exact`, `clean`, ou des politiques de confidentialité par chemin, utilisez le flux de travail en ligne de commande `savechanges` décrit dans [Capturer les modifications de la session en cours](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Glisser-déposer

Le glisser-déposer ne sert qu’à remplir un champ ou à ouvrir une inspection :

- Un module ouvre ses détails.
- Les fichiers `.deb` sont ajoutés à Paquets.
- Un dossier est sélectionné pour Dossier.
- Un autre fichier ordinaire est sélectionné comme Script d’installation.

Déposer un élément n’exécute aucun code et ne modifie ni En cours d’exécution ni Prochain démarrage.

## Documentation associée

- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Chargement des modules initrd](/reference/boot-process/Module-Loading)
- [Modes de démarrage](/using-minios/Boot-Modes)
- [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Paramètres de démarrage](/reference/Boot-Parameters)

## Création de modules

Les modules MiniOS sont des images de système de fichiers SquashFS en lecture seule, généralement nommées avec l’extension `.sb`. Au démarrage, MiniOS assemble les modules sélectionnés dans un système de fichiers racine en couches. Les fichiers d’une couche prioritaire peuvent compléter ou masquer ceux des couches inférieures. Ce pipeline live modulaire fait partie de l’architecture MiniOS décrite dans [À propos de MiniOS](/getting-started/About-MiniOS) et [Modes de démarrage](/using-minios/Boot-Modes). Après conversion native, la racine en couches `.sb` est remplacée par un système de fichiers Debian classique, accessible en écriture. Le logiciel de gestion des modules MiniOS est supprimé car les workflows de modules ne sont plus nécessaires, tandis que l’environnement de bureau choisi et les applications ordinaires restent installés comme des paquets classiques.

Ce guide documente les workflows actuels en ligne de commande des outils MiniOS. Pour l’application graphique, consultez le [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules). Pour le processus complet de création d’images et l’architecture système, voir [Construire MiniOS](/development/Building-MiniOS). Les listes de paquets utilisées lors de la construction de MiniOS sont décrites dans la [documentation CondinAPT](/development/CondinAPT).

### Sécurité et privilèges

Toutes les opérations sur les modules ne nécessitent pas les droits root :

| Opération | Privilège |
|---|---|
| Lister En cours d’exécution ou Prochain démarrage avec `sb` | Sans root |
| Inspecter un module avec `sb inspect` | Sans root |
| Conversion classique `dir2sb` et `sb2dir` | Sans root |
| Préserver la propriété ou autoriser des fichiers spéciaux lors de la conversion | Root |
| Construire avec `apt2sb`, `script2sb` ou `chroot2sb` | Root |
| Capturer la session avec `savechanges` | Root |
| Activer, désactiver, ajouter au prochain démarrage ou retirer du prochain démarrage | Root |

Les outils de création utilisent une union isolée et n’installent pas de paquets ni de modifications de script dans la racine active. La création n’active pas non plus le résultat ni ne le sélectionne pour le prochain démarrage.

Les convertisseurs et générateurs actuels publient sans remplacement. Une cible déjà existante, y compris un lien symbolique, n’est jamais écrasée. Choisissez un nouveau chemin de sortie ou supprimez explicitement l’ancien résultat.

Utilisez la sortie `--help` de chaque commande comme référence de version installée. Les options de compression standard sont `zstd` (par défaut), `gzip`, `lzo` et `xz` ; `dir2sb` prend aussi en charge `lz4`.

### Noms de modules et niveaux de filtre

Les noms commencent souvent par un chiffre comme `06-browser.sb` car l’ordre des couches influe sur la résolution des conflits. Un module doit contenir des chemins relatifs à la racine du système, comme `usr/bin/example`, et non un dossier supplémentaire contenant cet arbre.

Pour les niveaux de source candidats exacts, le comportement en cas de collision de nom de base, l’ordre numérique et les règles concernant `bext=`, `load=` et `noload=`, consultez [Chargement des modules Initrd](/reference/boot-process/Module-Loading). En particulier, utilisez un nom de base unique sauf si le module doit remplacer un emplacement du même nom provenant d’un niveau de source antérieur.

L’option `--level LEVEL` sur `apt2sb`, `script2sb` et `chroot2sb` limite les couches de base utilisées pour construire l’union de compilation. Avec `--level 3`, les couches numérotées jusqu’à `03` sont utilisées et les couches de numéro supérieur sont filtrées. Cela peut rendre un module moins dépendant des couches optionnelles supérieures, au prix d’inclure davantage de dépendances dans le résultat.

### Créer un module à partir de paquets

`apt2sb` installe des paquets du dépôt ou des fichiers locaux `.deb` lisibles dans une union de compilation privée et capture le résultat. Nécessite une session live MiniOS compatible et les droits root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sans `--name`, le nom de sortie est dérivé du premier paquet. Les options APT utiles incluent `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` et `--target-release RELEASE`. L’option target-release s’applique uniquement à `install`.

Pour capturer la mise à jour de paquets déjà installés :

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Créer un module à partir d’un script

`script2sb` copie un script d’installation dans un chroot privé, le rend exécutable, l’exécute en tant que root sans terminal interactif, le supprime, puis capture les modifications du système de fichiers résultantes. Si le script échoue, aucun module n’est créé.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

L’option `--directory DIR` copie tous les fichiers sources, y compris les fichiers cachés, dans la racine du module avant l’exécution du script. Organisez le répertoire seed comme un arbre de fichiers :

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Vérifiez le script avant de l’exécuter. Il s’exécute avec les privilèges administrateur et peut lancer n’importe quelle commande. Utilisez `chroot2sb` à la place si l’installation nécessite des interactions ou des actions manuelles.

### Créer un module de façon interactive

`chroot2sb` crée une union de construction privée et ouvre un shell root à l’intérieur. Installez des paquets ou modifiez des fichiers, puis quittez le shell pour capturer les changements :

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Les commandes saisies dans le shell ne sont pas rejouées lors du chargement du module ; le module est un instantané de l’état du système de fichiers obtenu. L’historique du shell est supprimé du résultat. Si aucun nom n’est fourni, un nom généré utilise la date et l’heure actuelles.

Le cycle de vie fractionné `prepare`, `shell`, `finish` et `cancel` existe pour les interfaces graphiques protégées. Pour une utilisation classique en terminal, utilisez la commande interactive unique indiquée ci-dessus.

### Créer un module à partir d’un répertoire

`dir2sb` emballe le contenu d’un répertoire préparé dans un nouveau module. Les deux paramètres sont obligatoires :

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversion standard ne nécessite pas les droits root. Elle laisse la source inchangée, normalise la propriété des fichiers à root dans le module, rejette les nœuds de périphérique, sockets et FIFOs, et n’écrase jamais la cible. Utilisez `--keep-ownership` ou `--allow-special` uniquement si ces comportements privilégiés sont nécessaires.

### Capturer les modifications de la session en cours

`savechanges` lit le calque modifiable de référence d’une session MiniOS en cours d’exécution. Cette opération requiert les droits root car ce calque peut contenir des fichiers accessibles uniquement à root. L’emplacement par défaut des modifications est détecté automatiquement :

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sans `--profile`, la politique historique MiniOS omet les répertoires vides, caches, journaux, données de démarrage, chemins d’exécution, pseudo-systèmes de fichiers, ainsi que certains fichiers de session et système. Ceci est pratique pour la création de modules traditionnelle, mais ne constitue pas une garantie explicite de confidentialité.

Les profils explicites sont :

- `exact` conserve toutes les modifications représentables, y compris les données utilisateur, journaux, caches, fichiers d’identité, identifiants et métadonnées de suppression prises en charge. Les objets système de fichiers non pris en charge sont rejetés plutôt que perdus silencieusement.
- `clean` utilise une liste d’autorisation de chemins restreinte, orientée logiciel. Il exclut les données personnelles et root, journaux, caches, identités, configuration réseau, identifiants, toute configuration système arbitraire, ainsi que `/usr/local`. Cela réduit l’exposition des données, mais ne garantit pas qu’un fichier logiciel autorisé ne contient aucune information sensible.
- `selected` inclut uniquement les chemins relatifs validés à partir d’un fichier d’inventaire et de sélection. Les exclusions explicites priment. Ce profil est adapté si le module doit contenir un sous-ensemble contrôlé des modifications de session.

Exemples :

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un fichier de sélection respecte cette structure JSON stricte :

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Les chemins sont normalisés, non vides et relatifs à la racine des modifications. Générez puis vérifiez l’inventaire en premier ; chaque inclusion doit correspondre à une donnée d’inventaire. L’inventaire enregistre des métadonnées telles que le chemin, le type, la catégorie, la sensibilité et la taille, mais ne lit ni n’exporte le contenu des fichiers, les cibles de liens symboliques ou les valeurs secrètes. Les sorties de profils explicites et les inventaires sont en mode `0600` ; les modules en politique héritée sont en mode `0644`.

La capture de session peut conserver les suppressions de fichiers prises en charge et l’opacité des répertoires pour le backend AUFS ou OverlayFS actif. Les montages d’exécution, systèmes de fichiers imbriqués, gestion d’union et la sortie elle-même sont exclus. Une cible existante n’est jamais remplacée.

### Inspecter et extraire des modules

Inspectez un module sans le monter ni l’extraire :

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L’inspection ne nécessite pas les droits root et fonctionne également en dehors d’une session MiniOS en cours.

Extrayez un module dans un nouveau répertoire :

```bash
sb2dir 06-example.sb example-root
```

L’extraction standard ne nécessite pas les droits root et ne modifie pas la source. Le répertoire cible ne doit pas exister. Les fichiers spéciaux sont rejetés sauf si `--allow-special` est demandé avec les privilèges nécessaires.

Les répertoires produits par `sb2dir` sont des répertoires classiques. `rmsbdir`, `sb rm` et `sb rmdir` sont d’anciennes commandes de compatibilité qui refusent toujours la suppression ; elles ne démontent ni ne suppriment rien de façon récursive. Vérifiez un chemin extrait et son contenu avant de le supprimer avec les outils standards du système de fichiers.

### Gérer les modules actifs et au prochain démarrage

Les compositions Actif et Prochain démarrage sont indépendantes. Voir [construction d’union et activation à l’exécution](/reference/boot-process/Module-Loading#union-construction) pour comprendre la séparation démarrage/exécution et pourquoi les deux listes peuvent différer.

Liste les modules effectivement utilisés pour composer le root AUFS ou OverlayFS, du plus faible au plus fort :

```bash
sb list
sb list --json
```

Liste les modules sélectionnés par les règles de démarrage en cours :

```bash
sb next-boot
sb next-boot --json
```

Ces requêtes ne nécessitent pas les droits root. Les règles canoniques [de priorité des candidats et de remplacement](/reference/boot-process/Module-Loading#candidate-tiers) déterminent quelle source fournit chaque nom de module pour le prochain démarrage.

Pour rendre un module utilisateur disponible au prochain démarrage :

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilise un stockage persistant adapté, prépare et valide la copie, puis la publie de façon atomique sans remplacer un module existant. Le nom de fichier doit respecter les filtres de démarrage actuels. Pour retirer un module utilisateur sélectionné, indiquez son nom exact :

```bash
sudo sb next-boot remove 50-extra.sb
```

La suppression est refusée pour les modules de base et ceux présents sur des sources en lecture seule ou volatiles.

L’activation à l’exécution est une opération distincte, valable uniquement pour la session en cours :

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

L’activation et la désactivation ne fonctionnent que si `/` est actuellement une union AUFS. Elles sont indisponibles sur OverlayFS, et le seul support du noyau AUFS ne suffit pas. Aucune de ces commandes ne modifie le prochain démarrage.

Le répartiteur de conversion de compatibilité requiert les deux opérandes :

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L’utilisation directe de `dir2sb` et de `sb2dir` est préférable, car la conversion classique peut s’effectuer sans droits root.

### Documentation associée

- [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules)
- [Chargement de modules Initrd](/reference/boot-process/Module-Loading)
- [Modes de démarrage](/using-minios/Boot-Modes)
- [Reconstruction d’images ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Construction de MiniOS](/development/Building-MiniOS)
- [Paramètres de démarrage](/reference/Boot-Parameters)
