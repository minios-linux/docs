---
updated: 2026-10-06
program_commits:
    minios-module-manager: fbe617f2955ddbef97f9ee3e5856b7d58439a565
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Gestion des modules

Le Gestionnaire de modules MiniOS est l’application graphique permettant d’inspecter, de créer et de gérer les modules MiniOS `.sb` . Il propose deux espaces de travail : **Modules** pour la composition système et **Créer** pour créer de nouveaux modules.

Lancez-le depuis le menu des applications ou exécutez :

```bash
minios-module-manager
```

L’application elle-même s’exécute sous votre utilisateur de session. Elle demande une authentification administrateur uniquement si l’opération demandée l’exige.

## En cours d’exécution et au prochain démarrage

L’espace de travail Modules propose deux vues distinctes :

- **En cours d’exécution** correspond à l’ensemble ordonné des modules qui composent actuellement le système en direct.
- **Prochain démarrage** correspond à l’ensemble ordonné sélectionné par les règles de démarrage MiniOS en vigueur.

Modifier une vue ne modifie pas l’autre automatiquement. Par exemple, **Activer pour cette session** n’affecte que le système en cours, tandis que **Ajouter au prochain démarrage** copie un module vers le stockage durable sans l’activer immédiatement.

Pour les règles de démarrage faisant autorité, incluant les niveaux sources candidats, le remplacement par nom exact, l’ordre numérique et `load=`, `noload=`, et `bext=` le filtrage, voir [Chargement des modules Initrd](/reference/boot-process/Module-Loading). Ce guide explique également pourquoi En cours d’exécution et Prochain démarrage peuvent différer.

L’activation et la désactivation à chaud ne sont disponibles que si le système de fichiers racine utilise actuellement AUFS. Elles ne sont pas proposées sur un root OverlayFS, même si le noyau prend en charge AUFS. Les modules de base ne peuvent pas être désactivés via l’application.

Les modifications pour le prochain démarrage ne sont possibles que si MiniOS détecte un stockage de modules durable et accessible en écriture. Les modules de base et ceux sur des supports en lecture seule ou volatiles ne peuvent pas être supprimés. Les filtres de démarrage comme `load`, `noload`, et `bext` déterminent toujours les modules sélectionnés.

## Inspection d’un module

Sélectionnez un module pour afficher l’emplacement de son fichier source, sa taille compressée et le contenu du système de fichiers. Si le fichier source est disponible, **Extraire vers un dossier** crée un nouveau dossier contenant les fichiers du module.

L’inspection ne nécessite pas de privilèges administrateur. **Extraire vers un dossier** demande une authentification administrateur afin de conserver les propriétaires, droits et fichiers spéciaux. L’extraction ne remplace jamais une destination existante et ne modifie pas le module source.

Vous pouvez également ouvrir un fichier local `.sb` depuis le gestionnaire de fichiers. Ouvrir un fichier permet uniquement de l’inspecter ; cela ne l’active pas et ne l’ajoute pas au prochain démarrage. Sur les systèmes Xfce avec l’intégration Thunar MiniOS installée, les actions du gestionnaire de fichiers utilisent le même moteur de modules pour l’activation et la désactivation explicites ; elles respectent la distinction entre En cours d’exécution et Prochain démarrage.

## Création d’un module

L’espace de travail Créer suit un déroulement **Configurer**, **Vérifier**, **Exécuter**, puis **Résultat**. Un module créé avec succès reste un fichier à l’emplacement de sortie. Il n’est pas activé ni ajouté automatiquement au prochain démarrage.

Méthodes disponibles :

- **Paquets** installe les paquets du dépôt et les fichiers locaux `.deb`, ainsi que leurs dépendances, dans un environnement de construction isolé MiniOS. L’installation de paquets nécessite une authentification administrateur.
- **Script d’installation** exécute un script vérifié sans terminal interactif. Un dossier d’amorçage optionnel peut fournir des fichiers initiaux. Le script s’exécute avec les droits administrateur mais n’est pas inclus dans le module généré.
- **Chroot interactif** ouvre un shell root temporaire dans le terminal intégré. Tapez `exit` à la fin, puis créez le module, rouvrez le shell ou annulez les modifications. Fermer ou annuler la session ne modifie pas le système en cours.
- **Dossier** empaquète le contenu d’un dossier existant. Le dossier source n’est pas imbriqué dans le module. Le flux graphique demande une authentification administrateur pour lire les fichiers protégés et préserver les attributs du système de fichiers ; la source reste inchangée. Les dossiers extraits avec conservation de la propriété sont reconnus automatiquement et gardent leurs propriétaires. Pour un dossier extrait sans trace d’origine, sélectionnez **Conserver la propriété d’origine** si la propriété doit être conservée.
- **Modifications de la session en cours** capture les fichiers et suppressions éligibles de la couche d’écriture de la session en cours. Il applique la politique standard MiniOS `savechanges`, qui exclut les journaux, caches, données de démarrage et chemins temporaires. Lire la couche d’écriture complète requiert une authentification administrateur.

Choisissez un nouveau chemin de sortie pour chaque opération. Les fichiers existants ne sont jamais écrasés. La progression et les diagnostics du moteur restent visibles pendant l’exécution, et la capture de session en cours peut être annulée.

Pour les autres dossiers, le flux Dossier par défaut remplace les UID et GID utilisateurs classiques (1000–60000) par root en dehors de `/home` et `/opt`, conserve les UID systèmes et rend les dossiers standards de premier niveau appartenant à root. Une propriété perdue lors d’une extraction non privilégiée ne peut pas être restaurée par cette option.

Modifications de la session en cours vise une capture standard pratique, pas une revue détaillée de chaque chemin inclus. Une couche d’écriture active peut contenir des données personnelles ou confidentielles. Pour une politique de confidentialité explicite par `exact`, `clean`, ou par sélection de chemins, utilisez le flux en ligne de commande `savechanges` décrit dans [Capturer les modifications de la session en cours](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Glisser-déposer

Le glisser-déposer ne sert qu’à remplir un champ ou à ouvrir une inspection :

- Un module ouvre ses détails.
- `.deb` les fichiers sont ajoutés à Paquets.
- Un dossier est sélectionné pour Dossier.
- Un autre fichier régulier est sélectionné comme Script d’installation.

Déposer un élément n’exécute aucun code et ne modifie ni En cours d’exécution ni Prochain démarrage.

## Documentation associée

- [Création de modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Chargement des modules Initrd](/reference/boot-process/Module-Loading)
- [Modes de démarrage](/using-minios/Boot-Modes)
- [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Paramètres de démarrage](/reference/Boot-Parameters)

## Création de modules

Les modules MiniOS sont des images système en lecture seule SquashFS, généralement nommées avec l’extension `.sb` . Au démarrage, MiniOS organise les modules sélectionnés en une pile racine. Les fichiers d’une couche prioritaire peuvent compléter ou masquer ceux des couches inférieures. Ce pipeline modulaire en direct fait partie de l’architecture MiniOS décrite dans [À propos de MiniOS](/getting-started/About-MiniOS) et [Modes de démarrage](/using-minios/Boot-Modes) . Après conversion native, la racine empilée `.sb` est remplacée par un système de fichiers Debian classique en écriture. Le logiciel de gestion des modules MiniOS est supprimé car les workflows modules ne s’appliquent plus, tandis que l’environnement de bureau sélectionné et les applications restent installés comme paquets classiques.

Ce guide documente les workflows actuels en ligne de commande des outils MiniOS. Pour l’application graphique, voir [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules) . Pour le processus complet de construction d’image et l’architecture système, voir [Construction de MiniOS](/development/Building-MiniOS) . Les listes de paquets utilisées lors de la construction de MiniOS sont décrites dans la [documentation CondinAPT](/development/CondinAPT).

### Sécurité et privilèges

Toutes les opérations sur les modules ne nécessitent pas root :

| Opération | Privilège |
|---|---|
| Lister En cours d’exécution ou Prochain démarrage avec `sb` | Sans root |
| Inspecter un module avec `sb inspect` | Sans root |
| Conversion classique en ligne de commande `dir2sb` et `sb2dir` conversion | Sans root |
| Préserver la propriété ou autoriser les fichiers spéciaux lors de la conversion | Root |
| Construire avec `apt2sb`, `script2sb`, ou `chroot2sb` | Root |
| Capturer la session avec `savechanges` | Root |
| Activer, désactiver, ajouter au prochain démarrage ou retirer du prochain démarrage | Root |

Les outils de construction utilisent une union isolée et n’installent pas de paquets ni de scripts dans la racine active. La création n’active pas non plus le résultat ni ne le sélectionne pour le prochain démarrage.

Les workflows graphiques Dossier et Extraire vers un dossier demandent une authentification administrateur pour gérer les fichiers protégés et préserver les attributs du système de fichiers.

Les convertisseurs et constructeurs actuels n’écrasent jamais une cible existante, y compris un lien symbolique. Choisissez un nouveau chemin de sortie ou supprimez explicitement l’ancienne sortie.

Utilisez la sortie `--help` de chaque commande comme référence de version installée. Les workflows actuels `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb`, et `savechanges` acceptent `zstd` (par défaut), `gzip`, `lzo`, `lz4`, et `xz` . Le compresseur choisi doit être disponible sur le système.

### Noms de modules et niveaux de filtrage

Les noms commencent souvent par un nombre, par exemple `06-browser.sb` , car l’ordre des couches influe sur la résolution des conflits. Un module doit contenir des chemins relatifs à la racine système, comme `usr/bin/example`, et non un dossier supplémentaire contenant cet arbre.

Pour les niveaux sources candidats exacts, le comportement en cas de collision de nom, l’ordre numérique et `bext=`, `load=`, et `noload=` la sémantique, voir [Chargement des modules Initrd](/reference/boot-process/Module-Loading). En particulier, utilisez un nom unique sauf si le module doit remplacer un emplacement du même nom d’un niveau source antérieur.

L’option `--level LEVEL` sur `apt2sb`, `script2sb`, et `chroot2sb` limite les couches de base utilisées pour construire l’union de compilation. Avec `--level 3`, les couches numérotées jusqu’à `03` sont utilisées et les couches supérieures sont filtrées. Cela réduit la dépendance à des couches optionnelles, au prix d’inclure plus de dépendances dans le résultat.

### Créer un module à partir de paquets

`apt2sb` installe des paquets du dépôt ou des fichiers locaux lisibles `.deb` dans une union de compilation privée et capture le résultat. Nécessite une session live MiniOS prise en charge et les droits root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sans `--name`, le nom de sortie est dérivé du premier paquet. Les options APT utiles incluent `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, et `--target-release RELEASE` . L’option target-release s’applique uniquement à `install`.

Pour capturer la mise à jour de paquets déjà installés :

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Créer un module à partir d’un script

`script2sb` copie un script d’installation dans un chroot privé, le rend exécutable, l’exécute en root sans terminal interactif, le supprime, puis capture les modifications du système de fichiers. Un script échoué ne crée aucun module.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

L’option `--directory DIR` copie tout le contenu source, y compris les fichiers cachés, à la racine du module avant l’exécution du script. Organisez le dossier d’amorçage comme un arbre de fichiers :

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Vérifiez le script avant de l’exécuter. Il s’exécute avec les droits administrateur et peut lancer n’importe quelle commande. Utilisez `chroot2sb` si l’installation nécessite des interactions ou des actions manuelles.

### Créer un module en mode interactif

`chroot2sb` crée une union de compilation privée et ouvre un shell root à l’intérieur. Installez des paquets ou modifiez des fichiers, puis quittez le shell pour capturer les modifications :

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Les commandes saisies dans le shell ne sont pas rejouées lors du chargement du module ; le module est un instantané de l’état du système de fichiers obtenu. L’historique du shell est supprimé du résultat. Si aucun nom n’est fourni, le nom généré utilise la date et l’heure courantes.

Le cycle de vie fractionné `prepare`, `shell`, `finish`, et `cancel` existe pour les interfaces graphiques protégées. Pour une utilisation classique en terminal, utilisez la commande interactive unique ci-dessus.

### Créer un module à partir d’un dossier

`dir2sb` empaquète le contenu d’un dossier préparé dans un nouveau module. Les deux opérandes sont obligatoires :

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversion classique ne nécessite pas root. Elle laisse la source inchangée, remplace les UID et GID utilisateurs classiques (1000–60000) par root en dehors de `/home` et `/opt`, conserve les UID systèmes et rend les dossiers standards de premier niveau appartenant à root. Elle refuse les nœuds de périphérique, sockets et FIFO, et n’écrase jamais la cible. `--keep-ownership` conserve tous les propriétaires d’origine et `--allow-special` autorise les fichiers spéciaux ; ces deux options nécessitent root.

`sb2dir` écrit `.minios-module-origin.json` dans le dossier extrait. Si l’extraction a préservé la propriété, `dir2sb` reconnaît cette trace et préserve automatiquement propriétaires et fichiers spéciaux lors du reconditionnement ; la trace n’est pas incluse dans le nouveau module. Un dossier extrait sans préservation de la propriété ne peut pas être reconditionné, car les propriétaires d’origine sont inconnus. Ré-extrayez le module d’origine avec les options privilégiées.

### Capturer les modifications de la session en cours

`savechanges` lit la couche d’écriture autorisée de la session MiniOS en cours. Cela nécessite root car cette couche peut contenir des fichiers réservés à root. L’emplacement par défaut des modifications est détecté automatiquement :

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sans `--profile`, la politique historique MiniOS exclut les dossiers vides, caches, journaux, données de démarrage, chemins temporaires, pseudo-systèmes de fichiers et certains fichiers de session ou système. Cela facilite la création de modules traditionnels, mais ne constitue pas une garantie explicite de confidentialité.

Profils explicites :

- `exact` conserve toutes les modifications représentables, y compris les données utilisateur, journaux, caches, fichiers d’identité, identifiants et métadonnées de suppression prises en charge. Les objets du système de fichiers non pris en charge sont rejetés et non ignorés.
- `clean` applique une liste blanche de chemins orientée logiciel. Les données utilisateur et root, journaux, caches, identités, configuration réseau, identifiants, configurations système arbitraires et `/usr/local` sont exclus. Cela limite l’exposition de la vie privée mais ne garantit pas qu’un fichier logiciel autorisé ne contienne pas de secret.
- `selected` inclut uniquement les chemins relatifs validés à partir d’un inventaire et d’un fichier de sélection. Les exclusions explicites priment. Ce profil convient quand le module doit contenir un sous-ensemble contrôlé des modifications de session.

Exemples :

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un fichier de sélection a cette structure JSON stricte :

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Les chemins sont normalisés, non vides et relatifs à la racine des modifications. Générez et vérifiez d’abord l’inventaire ; chaque inclusion doit correspondre à une donnée d’inventaire. L’inventaire enregistre les métadonnées (chemin, type, catégorie, sensibilité, taille), mais ne lit ni n’exporte le contenu des fichiers, cibles de liens symboliques ou valeurs secrètes. Les sorties et inventaires en profil explicite sont en mode `0600` ; les modules en politique héritée sont en mode `0644`.

La capture de session peut conserver les suppressions de fichiers prises en charge et l’opacité des dossiers pour le backend actif AUFS ou OverlayFS. Les montages temporaires, systèmes de fichiers imbriqués, fichiers de gestion d’union et la sortie elle-même sont exclus. Une cible existante n’est jamais remplacée.

### Inspection et extraction de modules

Inspecter un module sans le monter ni l’extraire :

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L’inspection ne nécessite pas root et fonctionne aussi hors d’une session MiniOS en cours.

Extraire un module dans un nouveau dossier :

```bash
sb2dir 06-example.sb example-root
```

L’extraction classique ne nécessite pas root et ne modifie pas la source. Le dossier cible ne doit pas exister. Les fichiers spéciaux sont refusés sauf si `--allow-special` est demandé avec les droits suffisants.

Pour un dossier pouvant être reconditionné fidèlement, extrayez avec les droits administrateur et conservez la propriété et les fichiers spéciaux :

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

L’extraction enregistre l’origine du module dans `.minios-module-origin.json` dans le nouveau dossier. L’extraction sans privilèges note que la propriété n’a pas été conservée ; un tel dossier ne peut pas être reconditionné par `dir2sb`. Conservez la trace d’origine lors d’une extraction privilégiée jusqu’au reconditionnement.

Les dossiers produits par les outils actuels `sb2dir` sont des dossiers classiques. `rmsbdir`, `sb rm`, et `sb rmdir` sont des commandes de compatibilité obsolètes qui refusent toujours la suppression ; elles ne démontent ni ne suppriment rien de façon récursive. Vérifiez un chemin extrait et son contenu avant de le supprimer avec les outils standards du système de fichiers.

### Gérer les modules actifs et au prochain démarrage

En cours d’exécution et Prochain démarrage sont des compositions indépendantes. Voir [construction d’union et activation à chaud](/reference/boot-process/Module-Loading#union-construction) pour la frontière démarrage/temps réel et les raisons pour lesquelles les deux listes peuvent différer.

Lister les modules effectivement utilisés dans la racine AUFS ou OverlayFS, du plus faible au plus fort :

```bash
sb list
sb list --json
```

Lister les modules sélectionnés par les règles de démarrage en vigueur :

```bash
sb next-boot
sb next-boot --json
```

Ces requêtes ne nécessitent pas root. Les règles canoniques [niveaux candidats et règles de remplacement](/reference/boot-process/Module-Loading#candidate-tiers) déterminent la source de chaque nom de module au prochain démarrage.

Pour rendre un module utilisateur disponible au prochain démarrage :

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilise un stockage durable accessible en écriture, prépare et valide la copie, puis la publie de façon atomique sans remplacer un module existant. Le nom de fichier doit respecter les filtres de démarrage en vigueur. Retirez un module utilisateur sélectionné par son nom exact :

```bash
sudo sb next-boot remove 50-extra.sb
```

La suppression est refusée pour les modules de base et ceux sur des supports en lecture seule ou volatiles.

L’activation à chaud est une opération distincte, valable uniquement pour la session en cours :

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

L’activation et la désactivation ne fonctionnent que si `/` est actuellement une union AUFS. Elles ne sont pas disponibles sur OverlayFS, et le support AUFS du noyau ne suffit pas. Aucune de ces commandes ne modifie Prochain démarrage.

Le convertisseur de compatibilité nécessite les deux opérandes :

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L’utilisation directe de `dir2sb` et `sb2dir` est préférable car la conversion classique peut s’effectuer sans root.

### Documentation associée

- [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules)
- [Chargement des modules Initrd](/reference/boot-process/Module-Loading)
- [Modes de démarrage](/using-minios/Boot-Modes)
- [Reconstruire des images ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Construction de MiniOS](/development/Building-MiniOS)
- [Paramètres de démarrage](/reference/Boot-Parameters)
