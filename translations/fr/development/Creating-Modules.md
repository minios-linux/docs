---
updated: 2026-08-26
program_commits:
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Création de modules

Les modules MiniOS sont des images de système de fichiers SquashFS en lecture seule, généralement nommées avec l’extension `.sb`. Au démarrage, MiniOS organise les modules sélectionnés en un système de fichiers racine superposé par couches. Les fichiers d’une couche prioritaire peuvent compléter ou masquer ceux des couches inférieures. Il s’agit du pipeline modulaire live décrit dans [Modes de démarrage](/configuration/Boot-Modes.md), qui diffère de la structure des paquets d’une installation native.

Ce guide documente les flux de travail actuels en ligne de commande avec les outils MiniOS. Pour l’application graphique, consultez le [Gestionnaire de modules MiniOS](/administration/Module-Manager.md). Pour le processus complet de construction d’image et l’architecture du système, voir [Construction de MiniOS](/development/Building-MiniOS.md). Les listes de paquets utilisées lors de la construction de MiniOS sont décrites dans la [documentation CondinAPT](/development/CondinAPT.md).

## Limites de sécurité et de privilèges

Toutes les opérations sur les modules ne nécessitent pas les droits root :

| Opération | Privilège |
|---|---|
| Lister les modules actifs ou prévus au prochain démarrage avec `sb` | Sans root |
| Inspecter un module avec `sb inspect` | Sans root |
| Conversion standard `dir2sb` et `sb2dir` | Sans root |
| Préserver la propriété ou autoriser les fichiers spéciaux lors de la conversion | Root |
| Construction avec `apt2sb`, `script2sb` ou `chroot2sb` | Root |
| Capturer la session avec `savechanges` | Root |
| Activer, désactiver, ajouter au prochain démarrage ou retirer du prochain démarrage | Root |

Les outils de construction utilisent une union isolée et n’installent pas de paquets ni de scripts dans la racine en cours d’exécution. La création n’active pas non plus le résultat ni ne le sélectionne pour le prochain démarrage.

Les convertisseurs et constructeurs actuels publient sans remplacement. Une cible déjà existante, y compris un lien symbolique, n’est jamais écrasée. Choisissez un nouveau chemin de sortie ou supprimez explicitement l’ancienne sortie vous-même.

Utilisez la sortie `--help` de chaque commande comme référence de version installée. Les choix de compression standard du constructeur sont `zstd` (par défaut), `gzip`, `lzo` et `xz` ; `dir2sb` prend également en charge `lz4`.

## Noms de modules et niveaux de filtrage

Les noms commencent souvent par un nombre comme `06-browser.sb`, car l’ordre des couches influence la résolution des conflits. Un module doit contenir des chemins relatifs à la racine du système, par exemple `usr/bin/example`, et non un dossier supplémentaire contenant cet arbre.

Pour connaître précisément les niveaux sources candidats, le comportement en cas de collision de noms de base, l’ordre numérique,
et la sémantique de `bext=`, `load=` et `noload=`, consultez
[Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md). En particulier,
utilisez un nom de base unique sauf si le module doit remplacer un emplacement du même nom provenant d’un niveau source antérieur.

L’option `--level LEVEL` sur `apt2sb`, `script2sb` et `chroot2sb` limite les couches de base utilisées pour construire l’union de build. Avec `--level 3`, les couches numérotées jusqu’à `03` sont utilisées et les couches de numéro supérieur sont exclues. Cela peut rendre un module moins dépendant des couches optionnelles supérieures, au prix d’inclure davantage de dépendances dans le résultat.

## Créer un module à partir de paquets

`apt2sb` installe des paquets du dépôt ou des fichiers locaux `.deb` lisibles dans une union de construction privée et capture le résultat. Cela nécessite une session live MiniOS prise en charge et les droits root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sans `--name`, le nom de sortie est dérivé du premier paquet. Les options APT utiles incluent `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` et `--target-release RELEASE`. L’option target-release ne s’applique qu’à `install`.

Pour capturer la mise à niveau de paquets déjà installés :

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

## Créer un module à partir d’un script

`script2sb` copie un script d’installation dans un chroot privé, le rend exécutable, l’exécute en tant que root sans terminal interactif, le supprime, puis capture les modifications du système de fichiers résultant. Un script échoué ne crée aucun module.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

L’option facultative `--directory DIR` copie tout le contenu source, y compris les fichiers cachés, dans la racine du module avant l’exécution du script. Organisez le dossier seed comme un arbre de système de fichiers :

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Vérifiez le script avant de l’exécuter. Il s’exécute avec les privilèges administrateur et peut lancer n’importe quelle commande. Utilisez `chroot2sb` à la place si l’installation nécessite des invites ou une intervention manuelle.

## Créer un module de façon interactive

`chroot2sb` crée une union de construction privée et ouvre un shell root à l’intérieur. Installez des paquets ou modifiez des fichiers, puis quittez le shell pour capturer les modifications :

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Les commandes saisies dans le shell ne sont pas rejouées lors du chargement du module ; le module est un instantané de l’état du système de fichiers résultant. L’historique du shell est supprimé du résultat. Si aucun nom n’est fourni, le nom généré utilise la date et l’heure actuelles.

Le cycle de vie séparé `prepare`, `shell`, `finish` et `cancel` existe pour les interfaces graphiques protégées. Pour une utilisation normale en terminal, utilisez la commande interactive unique ci-dessus.

## Créer un module à partir d’un dossier

`dir2sb` empaquette le contenu d’un dossier préparé dans un nouveau module. Les deux opérandes sont obligatoires :

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

La conversion standard ne nécessite pas les droits root. Elle laisse la source inchangée, normalise la propriété dans le module à root, rejette les nœuds de périphérique, sockets et FIFO, et n’écrase jamais la cible. Utilisez `--keep-ownership` ou `--allow-special` uniquement si ces comportements privilégiés sont nécessaires.

## Capturer les modifications de la session en cours

`savechanges` lit la couche modifiable faisant autorité d’une session MiniOS en cours d’exécution. Cela nécessite les droits root car cette couche peut contenir des fichiers accessibles uniquement par root. L’emplacement par défaut des modifications est détecté automatiquement :

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sans `--profile`, la politique historique de MiniOS omet les dossiers vides, caches, journaux, données de démarrage, chemins d’exécution, pseudo-systèmes de fichiers, ainsi que certains fichiers de session et système. Cela est pratique pour la création de modules traditionnelle, mais ne constitue pas une garantie explicite de confidentialité.

Les profils explicites sont :

- `exact` préserve les modifications représentables, y compris les données utilisateur, journaux, caches, fichiers d’identité, identifiants et métadonnées de suppression prises en charge. Les objets système de fichiers non pris en charge sont rejetés au lieu d’être ignorés silencieusement.
- `clean` utilise une liste d’autorisation de chemins orientée logiciel très restreinte. Elle exclut les données utilisateur et root, journaux, caches, identités, configuration réseau, identifiants, configuration système arbitraire et `/usr/local`. Cela réduit l’exposition à la vie privée mais ne garantit pas qu’un fichier logiciel autorisé ne contient aucun secret.
- `selected` inclut uniquement les chemins relatifs validés à partir d’un fichier d’inventaire et de sélection. Les exclusions explicites prévalent. Ce profil est approprié lorsque le module doit contenir un sous-ensemble contrôlé des modifications de session.

Exemples :

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Un fichier de sélection a cette structure JSON stricte :

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Les chemins sont normalisés, non vides et relatifs à la racine des modifications. Générez et vérifiez d’abord l’inventaire ; chaque inclusion doit correspondre à une donnée d’inventaire. L’inventaire enregistre des métadonnées comme le chemin, le type, la catégorie, la sensibilité et la taille, mais ne lit ni n’exporte le contenu des fichiers, les cibles de liens symboliques ou des valeurs secrètes. Les sorties de profils explicites et les inventaires sont en mode `0600` ; les modules en mode politique héritée sont en mode `0644`.

La capture de session peut conserver les suppressions de fichiers prises en charge et l’opacité des dossiers pour le backend AUFS ou OverlayFS actif. Elle exclut les montages runtime, systèmes de fichiers imbriqués, fichiers de gestion d’union et la sortie elle-même. Une cible existante n’est jamais remplacée.

## Inspecter et extraire des modules

Inspectez un module sans le monter ni l’extraire :

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

L’inspection ne nécessite pas les droits root et fonctionne également en dehors d’une session MiniOS en cours d’exécution.

Extrayez un module dans un nouveau dossier :

```bash
sb2dir 06-example.sb example-root
```

L’extraction standard ne nécessite pas les droits root et ne modifie pas la source. Le dossier cible ne doit pas exister. Les fichiers spéciaux sont rejetés sauf si `--allow-special` est demandé avec les privilèges nécessaires.

Les dossiers produits par les `sb2dir` actuels sont des dossiers ordinaires. `rmsbdir`, `sb rm` et `sb rmdir` sont d’anciennes commandes de compatibilité qui refusent toujours la suppression ; elles ne démontent ni ne suppriment récursivement quoi que ce soit. Vérifiez un chemin extrait et son contenu avant de le supprimer avec les outils standards du système de fichiers.

## Gérer les modules en cours d’exécution et au prochain démarrage

Les compositions « En cours d’exécution » et « Prochain démarrage » sont indépendantes. Consultez
[construction d’union et activation à l’exécution](/configuration/Initrd-Module-Loading.md)
pour comprendre la frontière entre démarrage et exécution, et pourquoi les deux listes peuvent différer.

Lister les modules qui composent effectivement la racine AUFS ou OverlayFS actuelle, de la priorité la plus basse à la plus haute :

```bash
sb list
sb list --json
```

Lister les modules sélectionnés par les règles de démarrage actuelles :

```bash
sb next-boot
sb next-boot --json
```

Ces requêtes ne nécessitent pas les droits root. Les règles canoniques
[de sélection de candidats et de remplacement](/configuration/Initrd-Module-Loading.md)
déterminent quelle source fournit chaque nom de module pour le prochain démarrage.

Pour rendre un module utilisateur disponible au prochain démarrage :

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS utilise un stockage persistant adapté, prépare et valide la copie, puis la publie de manière atomique sans remplacer un module existant. Le nom de fichier doit respecter les filtres de démarrage actuels. Pour supprimer un module utilisateur sélectionné, utilisez son nom exact :

```bash
sudo sb next-boot remove 50-extra.sb
```

La suppression est refusée pour les modules de base et ceux présents sur des sources en lecture seule ou volatiles.

L’activation à l’exécution est une opération distincte, valable uniquement pour la session en cours :

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

L’activation et la désactivation ne fonctionnent que lorsque `/` est actuellement une union AUFS. Elles ne sont pas disponibles sur OverlayFS, et le support AUFS du noyau seul n’est pas suffisant. Aucune de ces commandes ne modifie le prochain démarrage.

Le répartiteur du convertisseur de compatibilité requiert les deux opérandes :

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

L’utilisation directe de `dir2sb` et `sb2dir` est préférable car la conversion ordinaire peut s’exécuter sans privilèges root.

## Documentation associée

- [Gestionnaire de modules MiniOS](/administration/Module-Manager.md)
- [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md)
- [Modes de démarrage](/configuration/Boot-Modes.md)
- [Reconstruire les images ISO](/development/Rebuilding-ISO.md)
- [Construction de MiniOS](/development/Building-MiniOS.md)
- [Paramètres de démarrage](/configuration/Boot-Parameters.md)
