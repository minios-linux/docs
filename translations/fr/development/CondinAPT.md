# CondinAPT : Guide complet pour l’installation conditionnelle de paquets

**CondinAPT** est un outil polyvalent pour automatiser l’installation de paquets sur tout système de type Debian (Debian, Ubuntu et leurs dérivés). Sa fonctionnalité principale est la possibilité de définir des conditions et des règles complexes pour installer chaque paquet selon des configurations système arbitraires.

**Domaines d’application :**
- Systèmes de construction de distributions Linux
- Automatisation de la configuration de serveurs et stations de travail
- Déploiement de diverses configurations système
- Gestion des paquets dans les conteneurs Docker
- Pipelines CI/CD pour la préparation d’environnements
- Création d’images d’installation personnalisées

## Table des matières

### Fondamentaux

- [Fonctionnement et composants principaux](#how-it-works-and-core-components)
- [Démarrage rapide](#quick-start)
- [Utilisation](#usage)

### Syntaxe et fonctionnalités

- [Syntaxe du fichier de liste de paquets](#package-list-file-syntax)
- [Filtres et conditions](#filters-and-conditions)
- [Files d'installation](#installation-queues)
- [File de priorité](#priority-queue)

### Modes de fonctionnement

- [Modes de fonctionnement et débogage](#operating-modes-and-debugging)
- [Gestion des erreurs et reprise](#error-handling-and-recovery)

### Utilisation avancée

- [Fonctionnalités avancées](#advanced-features)
- [Intégration avec les systèmes de build](#integration-with-build-systems)

### Exemples pratiques

- [Exemples de scénarios réels](#examples-of-real-world-scenarios)
- [Astuces d’optimisation](#optimization-tips)
- [Dépannage](#troubleshooting)

**Fonctionnalités clés :**

*   **Installation conditionnelle :** Installez des paquets selon des filtres flexibles (+, -).
*   **Configuration externe :** Séparation complète de la logique (liste de paquets) et des données (paramètres système).
*   **Files d’installation :** Découpez le processus en étapes séquentielles pour résoudre les dépendances.
*   **File de priorité :** Installation garantie des paquets critiques en premier.
*   **Logique complexe :** Prise en charge des opérateurs "ET" (`&&`), "OU" (`||`), ainsi que des filtres de groupe (`+{a|b}`, `-{a&b}`).
*   **Lisibilité :** Prise en charge des commentaires et des lignes vides pour structurer les listes.
*   **Compatibilité ascendante :** Prend en charge les listes de paquets simples sans conditions.

## Fonctionnement et composants principaux

CondinAPT fonctionne avec quatre fichiers clés :

1.  **Script `condinapt` :** Le cœur du système, contenant toute la logique de traitement.

2.  **Fichier de configuration principal (`-c`) :** Un fichier contenant des variables bash décrivant l’environnement actuel.

    Exemple (`system.conf`) :

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Fichier de correspondance des filtres (`-m`) :** Fait le lien entre des préfixes courts (utilisés dans la liste des paquets) et des noms de variables du fichier de configuration principal. Ce fichier est **optionnel**. Si un filtre n’est pas présent dans le fichier de correspondance, il sera utilisé comme nom de variable du fichier de configuration principal. Si la variable n’est pas trouvée, CondinAPT la déclarera vide.

    Exemple (`filters.map`) :

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Fichier de liste des paquets (`-l`) :** Le fichier principal décrivant quoi installer et sous quelles conditions.

## Démarrage rapide

Pour découvrir rapidement CondinAPT, créez un exemple simple :

**1. Créez le fichier de configuration `config.conf` :**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Créez la liste des paquets `packages.list` :**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Lancez l’installation :**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Ou testez en mode simulation :**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Utilisation

### Ligne de commande

```bash
./condinapt [OPTIONS]
```

| Option        | Option longue                   | Argument | Description                                                |
| :------------ | :------------------------------ | :------- | :--------------------------------------------------------- |
| `-l`          | `--package-list`                | `PATH`   | **(Obligatoire)** Chemin vers le fichier de liste des paquets. |
| `-c`          | `--config`                      | `PATH`   | **(Obligatoire)** Chemin vers le fichier de configuration principal. |
| `-m`          | `--filter-mapping`              | `PATH`   | (Optionnel) Chemin vers le fichier de correspondance des filtres. |
| `-P`          | `--priority-list`               | `PATH`   | (Optionnel) Chemin vers un fichier de filtres de priorité. Le fichier contient des motifs regex pour filtrer les paquets. Les paquets correspondants sont déplacés dans la file prioritaire (en conservant les filtres). |
| `-s`          | `--simulation`                  |          | Mode simulation. Les paquets ne seront pas installés.      |
| `-C`          | `--check-only`                  |          | Vérifie uniquement si les paquets sont déjà installés. Retourne le code de sortie 1 s’il reste des paquets non installés. À la fin, affiche une commande pour installer les paquets manquants. |
| `-v` / `-vv`  | `--verbose` / `--very-verbose`  |          | Affichage verbeux / très verbeux.                         |
| `-x`          | `--xtrace`                      |          | Active le traçage des commandes `set -x`.                 |
| `-f`          | `--force`                       |          | Force la mise à jour de la liste des paquets avant l’installation. Par défaut, la mise à jour est ignorée si `/var/cache/apt/pkgcache.bin` existe. |
| `-h`          | `--help`                        |          | Affiche l’aide.                                            |

## Syntaxe du fichier de liste des paquets

### Structure de base

C’est le cœur de CondinAPT. Toute la logique s’y décrit.

Chaque ligne du fichier de liste des paquets se compose de deux parties principales :

1. **Nom du paquet avec version et release optionnelles**
2. **Filtres de condition** – définissent sous quelles conditions le paquet sera installé

> **Base pour tous les exemples ci-dessous :**
> Pour tous les exemples suivants, on suppose que les fichiers `system.conf` et `filters.map` de la section [Fonctionnement et composants principaux](#how-it-works-and-core-components) sont utilisés.
>
> *   `DISTRIBUTION` = "bookworm"
> *   `SYSTEM_TYPE` = "server"
> *   `ENVIRONMENT` = "production"

### Structure du nom de paquet

**Nom simple :**
```
vim
```

**Version du paquet :**
- `package=version` — contrainte souple sur la version. Si la version demandée n’est pas disponible, une version disponible sera installée.
  ```
  git=2.25.1
  ```
- `package==version` — contrainte stricte. Si la version n’est pas trouvée, l’installation s’arrête avec une erreur.
  ```
  curl==7.68.0
  ```

**Spécification de la release :**
La release s’indique avec le symbole `@`, ce qui permet de lier l’installation à une branche spécifique du dépôt.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Structure du fichier

*   **Noms de paquets :** Chaque paquet ou condition s’écrit sur une nouvelle ligne.
*   **Commentaires :** Les lignes commençant par `#`, ou le texte après `#` sur une ligne, sont totalement ignorés.
*   **Lignes vides :** Ignorées et servent à l’aération visuelle.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filtres et conditions

Les filtres permettent de définir des conditions supplémentaires pour la sélection des paquets. Ils comparent les valeurs des variables système (architecture, distribution, environnement de travail) avec celles spécifiées dans le fichier de configuration.

#### Filtres simples

*   **`+` (Positif) :** La condition est vraie si la valeur de la variable **correspond**.
    **Format :** `+<préfixe>=<valeur>`
    
    *   **Ligne :** `nginx +st=server`
    *   **Analyse :** `SYSTEM_TYPE` est égal à "server". La condition est vraie.
    *   **Résultat :** `nginx` sera installé.

*   **Filtres positifs multiples avec le même préfixe :**
    Fonctionnent comme des conditions OU.
    **Format :** `+<préfixe>=<valeur1> +<préfixe>=<valeur2>`
    
    *   **Ligne :** `debug-tools +env=development +env=testing`
    *   **Analyse :** `ENVIRONMENT` est "production", ce qui ne correspond ni à "development" ni à "testing". La condition est fausse.
    *   **Résultat :** `debug-tools` ne sera pas installé.

*   **`-` (Négatif) :** La condition est vraie si la valeur de la variable **ne correspond pas**.
    **Format :** `-<préfixe>=<valeur>`

    *   **Ligne :** `monitoring-tools -st=desktop`
    *   **Analyse :** `SYSTEM_TYPE` est "server", donc différent de "desktop". La condition est vraie.
    *   **Résultat :** `monitoring-tools` sera installé.

*   **Filtres négatifs multiples :**
    Le paquet est exclu si AU MOINS UNE condition correspond.
    **Format :** `-<préfixe>=<valeur1> -<préfixe>=<valeur2>`
    
    *   **Ligne :** `realtek-driver -d=trixie -d=sid`
    *   **Analyse :** `DISTRIBUTION` est "bookworm", donc différent de "trixie" et "sid". Les conditions d’exclusion ne s’appliquent pas.
    *   **Résultat :** `realtek-driver` sera installé.

#### Filtres de groupe

*   **`+{a|b}` (OU pour inclusion) :** Vrai si **au moins une** des conditions du groupe est vraie.

    *   **Ligne :** `web-server +{st=server|st=web-server}`
    *   **Analyse :** `SYSTEM_TYPE` est "server". La première condition est vraie, ce qui suffit.
    *   **Résultat :** Le paquet sera installé.

*   **`+{a&b}` (ET pour inclusion) :** Vrai uniquement si **toutes** les conditions du groupe sont vraies.

    *   **Ligne :** `database-tools +{d=bookworm&st=server}`
    *   **Analyse :** `DISTRIBUTION` est "bookworm" (vrai) ET `SYSTEM_TYPE` est "server" (vrai).
    *   **Résultat :** Le paquet sera installé.

*   **`-{a|b}` (OU pour exclusion) :** Le paquet est exclu si **au moins une** des conditions est vraie.

    *   **Ligne :** `debug-tools -{env=production|st=minimal}`
    *   **Analyse :** `ENVIRONMENT` est "production". La première condition est vraie, donc le paquet est exclu.
    *   **Résultat :** Le paquet ne sera pas installé.

*   **`-{a&b}` (ET pour exclusion) :** Le paquet est exclu uniquement si **toutes** les conditions sont vraies.

    *   **Ligne :** `development-tools -{env=production&st=minimal}`
    *   **Analyse :** `ENVIRONMENT` est "production" (vrai), mais `SYSTEM_TYPE` n’est pas "minimal". La seconde condition est fausse. Le groupe ne déclenche pas l’exclusion.
    *   **Résultat :** Le paquet sera installé (s’il n’y a pas d’autres filtres).

### Alternatives

Différents paquets peuvent être proposés pour la même fonctionnalité et installés selon les conditions. Les alternatives sont séparées par l’opérateur `||`.

**Important :** Chaque alternative doit comporter une description complète — nom du paquet (avec version et release optionnelles) et un ensemble de filtres.

**Exemple :**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Si `SYSTEM_TYPE` est `database-server`, **postgresql** est sélectionné.
- Si `SYSTEM_TYPE` est `web-server`, **mysql-server** est installé.

### Opérateurs logiques pour les paquets

*   **`||` (OU / Fallback) :** Tente d’installer la partie gauche. Si elle échoue (paquet non trouvé ou filtré), tente la partie droite.

    *   **Ligne :** `exfatprogs -d=bookworm || exfat-utils`
    *   **Analyse :** `DISTRIBUTION` n’est pas "bookworm", la partie gauche est filtrée. CondinAPT passe à la partie droite. `exfat-utils` n’a pas de filtres, il sera donc installé.
    *   **Résultat :** `exfat-utils` sera installé.

*   **`&&` (ET / Conjonction) :** Toutes les parties doivent réussir les vérifications de filtres pour être ajoutées à la file.

    *   **Ligne :** `nginx +st=web-server && php-fpm`
    *   **Analyse :** `SYSTEM_TYPE` est "server", mais la condition attend "web-server". La partie gauche échoue.
    *   **Résultat :** Aucun paquet ne sera installé.

    *   **Exemple complexe :** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Résultat :** Les trois paquets seront installés uniquement si `ENVIRONMENT` est `production`.

### Modificateurs spéciaux

*   **`!` (Paquet obligatoire) :** Si un paquet est marqué avec `!` mais introuvable dans les dépôts, CondinAPT arrête l’exécution avec une erreur.

    *   **Ligne :** `!essential-package`

*   **`@` (Spécification de release) :** Installer un paquet depuis une release Debian/Ubuntu spécifique (ex. `bookworm-backports`).

    *   **Ligne :** `kernel-image-6.5.0 @trixie-backports`

### Spécification de version de paquet

CondinAPT permet un contrôle précis sur les versions des paquets installés.

*   **Syntaxe :**
    *   `package=VERSION` : Tente d’installer la version spécifiée (`VERSION`). Si elle n’est pas disponible dans les dépôts, CondinAPT installera n’importe quelle version disponible du paquet.
        *   Exemple : `my-app=1.2.3` (tente d’installer 1.2.3, sinon, installe par exemple 1.2.4)
    *   `package==VERSION` : Installation **stricte** d’une version précise. Si cette version n’est pas disponible dans les dépôts, le paquet **ne sera pas installé**. Si le paquet était aussi marqué comme obligatoire (`!`), le script s’arrêtera avec une erreur.
        *   Exemple : `another-app==2.0.0` (n’installe que 2.0.0, sinon ignore le paquet ou erreur si obligatoire)

*   **Comportement :**
    1.  CondinAPT vérifie d’abord si la version requise du paquet est déjà installée sur le système. Si oui, le paquet est considéré comme installé et ignoré.
    2.  Ensuite, il vérifie si la version spécifiée est disponible dans les dépôts (`apt-cache madison`).
    3.  **Avec `=` (version souple) :**
        *   Si la version spécifiée n’est pas disponible, CondinAPT affiche un avertissement que la version exacte n’a pas été trouvée.
        *   Il tente néanmoins d’installer n’importe quelle version disponible du paquet depuis les dépôts.
    4.  **Avec `==` (version stricte) :**
        *   Si la version spécifiée n’est pas disponible, CondinAPT **n’installera pas** le paquet.
        *   Si le paquet était obligatoire (`!`), le script arrêtera l’exécution avec une erreur.
    5.  **Blocage de version (`apt-mark hold`) :**
        *   Si un paquet a été installé avec **exactement la version spécifiée** (c’est-à-dire si `package==VERSION` a réussi, ou si `package=VERSION` a trouvé *exactement* cette version et l’a installée), CondinAPT appliquera automatiquement la commande `apt-mark hold` sur ce paquet.
        *   Cela empêche la mise à jour automatique du paquet vers une nouvelle version lors des opérations ultérieures de `apt upgrade`.

### Exemples de filtres complexes

#### Exemple 1 : Filtres complexes pour un seul paquet

**Objectif :** Installer `database-tools` pour la distribution `bookworm`, mais uniquement si le type de système est `server` ou `database-server`, et pas pour l’environnement `minimal`.

**`packages.list` :**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Analyse (avec notre configuration) :**

1.  `+d=bookworm` : Vrai.
2.  `+{st=server|st=database-server}` : Vrai, car `SYSTEM_TYPE` est "server".
3.  `-env=minimal` : Vrai, car `ENVIRONMENT` est "production".
    **Résultat :** Toutes les conditions sont vraies. Le paquet sera installé.

#### Exemple 2 : Chaîne de secours avec conditions différentes

**Objectif :** Pour Debian `trixie`, installer `firefox-esr`. Pour `bookworm`, installer `firefox`. Pour tous les autres cas, installer `w3m`.

**`packages.list` :**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Analyse :**

1.  `firefox-esr +d=trixie` : Partie gauche. `DISTRIBUTION` est "bookworm", condition fausse.
2.  `firefox +d=bookworm` : Partie du milieu. `DISTRIBUTION` est "bookworm", condition vraie.
3.  Comme la deuxième partie de la chaîne `||` fonctionne, la troisième (`w3m`) sera ignorée.
    **Résultat :** `firefox` sera installé.

#### Exemple 3 : Interaction entre file prioritaire et paquet obligatoire

**Objectif :** `dkms` est critique pour la construction de modules ; il doit être installé en premier. Dans la liste principale, il est marqué comme obligatoire, mais avec une condition.

*   **`priority.list` :**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list` :**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Analyse :**

1.  CondinAPT lit les motifs de priorité `^dkms$` et `^build-essential$`.
2.  La ligne `!dkms +pv=standard` correspond au motif `^dkms$` et est déplacée dans la file prioritaire **avec toutes ses propriétés** : le flag obligatoire (`!`) et le filtre (`+pv=standard`).
3.  **Plan d’exécution :**

    *   **File prioritaire :** Installer `!dkms +pv=standard` (flag obligatoire et filtre conservés).
    *   **File normale :** `vim`.

**Résultat :** `dkms` sera installé en premier, mais le filtre `+pv=standard` sera toujours évalué. Si la condition du filtre n’est pas remplie, l’installation échouera à cause du flag `!` (obligatoire).

## Files d’installation

Le séparateur `---` sur une ligne à part divise la liste en groupes (files). Les paquets d’une file sont installés ensemble en un seul appel `apt`. Les files sont exécutées strictement dans l’ordre.

### Files normales

**Exemple :**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Files cibles (avec spécification de release)

Les paquets avec `@release` sont automatiquement regroupés dans des files séparées par release :

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## File prioritaire

Ce mécanisme permet l’installation prioritaire de paquets critiques tout en conservant leurs filtres et conditions.

*   **Principe :** Le fichier indiqué par l’option `-P` contient des motifs regex (un motif par ligne, sans filtres). CondinAPT parcourt toutes les files, trouve les paquets correspondant à ces motifs, et les déplace (avec tous leurs filtres et conditions) dans une "File prioritaire" spéciale, exécutée en premier.
*   **Correspondance des motifs :** Utilise la correspondance regex bash (`=~`). Les motifs peuvent être de simples noms de paquets ou des expressions regex complexes.
*   **Conservation du contexte :** Contrairement à une simple liste prioritaire, ce mécanisme conserve toutes les conditions, filtres et spécifications de release du paquet d’origine.
*   **Surcharge :** Les paquets correspondants sont automatiquement retirés de leurs files d’origine (files normales et files cibles avec `@release`) et déplacés dans les files prioritaires. Les releases cibles sont conservées dans des files prioritaires séparées.

**Exemple 1 : Correspondance sur nom de paquet simple**

*   **`packages.list` :**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list` :**

    ```text
^gpg$
^git$
```

*   **Analyse :**

    1.  CondinAPT lit `priority.list` et sait que les paquets correspondant aux motifs `^gpg$` et `^git$` doivent être installés en premier.
    2.  Il parcourt `packages.list` et trouve la ligne `git +st=full-server`. Comme `git` correspond au motif, toute cette ligne (avec son filtre `+st=full-server`) est déplacée dans la file prioritaire.
    3.  De même, `gpg -st=minimal` est déplacé dans la file prioritaire avec son filtre `-st=minimal` conservé.
    4.  **Plan final :**

        *   **File prioritaire :** Installer `git +st=full-server` et `gpg -st=minimal` (filtres conservés et évalués).
        *   **File normale :** `curl`, `wget +d=trixie`, `vim +env=development`.

**Exemple 2 : Correspondance sur motif regex**

*   **`packages.list` :**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list` :**

    ```text
^linux-.*
^firmware-.*
```

*   **Analyse :**

    1.  Le motif `^linux-.*` correspond à `linux-image-6.1.0-amd64` et `linux-headers-6.1.0-amd64`.
    2.  Le motif `^firmware-.*` correspond à `firmware-linux`.
    3.  **Plan final :**

        *   **File prioritaire :** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **File normale :** `build-essential`, `nginx +st=server`.

## Modes de fonctionnement et débogage

#### Mode simulation (`-s`)

Permet de voir quels paquets seront installés sans les installer réellement :

```bash
./condinapt -l packages.list -c system.conf -s
```

**Exemple de sortie :**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Remarque :** En mode simulation, le script se termine avec le code de sortie 1.

#### Mode vérification (`-C`)

Vérifie quels paquets de la liste sont déjà installés sur le système :

```bash
./condinapt -l packages.list -c system.conf -C
```

**Comportement :**
- Affiche les erreurs pour les paquets non installés
- Retourne le code de sortie 1 s’il y a des paquets non installés
- À la fin, affiche une commande pour installer les paquets manquants

#### Modes de débogage

**Affichage verbeux (`-v`) :**
- Affiche des informations détaillées sur les vérifications de filtres
- Affiche les résultats pour chaque paquet

**Affichage très verbeux (`-vv`) :**
- Détail maximal du processus
- Affiche toutes les étapes intermédiaires

**Traçage des commandes (`-x`) :**
- Active `set -x` pour le débogage du script
- Affiche chaque commande exécutée

**Exemple avec débogage :**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Forcer la mise à jour du cache (`-f`)

Force CondinAPT à exécuter `apt update` avant l’installation :

```bash
./condinapt -l packages.list -c system.conf -f
```

## Fonctionnalités avancées

### Prise en charge des tableaux dans la configuration

CondinAPT peut gérer des variables tableau dans le fichier de configuration :

**`system.conf` :**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map` :**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list` :**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Paquets spéciaux

CondinAPT gère nativement certains paquets nécessitant un traitement particulier :

**Paquets virtuels :**
- `qemu-kvm` – traité comme un paquet virtuel

**Mécanisme de gestion :**
1. CondinAPT vérifie si le paquet est virtuel via la commande `apt-cache show`
2. Si le paquet est marqué comme « purement virtuel », il est considéré comme disponible à l’installation
3. La liste des paquets spéciaux est définie dans le tableau `SPECIAL_PACKAGES` au sein du script :
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Extension de la liste :** Pour ajouter de nouveaux paquets spéciaux, il faut modifier le tableau `SPECIAL_PACKAGES` dans le code de CondinAPT.

## Gestion des erreurs et reprise

### Paquets obligatoires (`!`)

Si un paquet est marqué comme obligatoire mais introuvable dans les dépôts, CondinAPT :
1. Affiche un message d’erreur
2. Arrête l’exécution (sauf en mode simulation)
3. Retourne le code de sortie 1

**Exemple :**
```text
!essential-package +pv=standard
```

Si `essential-package` n’est pas trouvé dans les dépôts, l’exécution s’arrêtera.

### Gestion des versions indisponibles

**Versions souples (`=`) :**
- Si la version exacte n’est pas disponible, n’importe quelle version disponible est installée
- Un avertissement est affiché concernant l’indisponibilité de la version demandée

**Versions strictes (`==`) :**
- Si la version exacte n’est pas disponible, le paquet est ignoré
- Si le paquet est obligatoire (`!`), l’exécution s’arrête

### Blocage de version (`apt-mark hold`)

CondinAPT bloque automatiquement les versions des paquets dans les cas suivants :
- Quand la version demandée exactement a été installée
- Pour les paquets avec `==VERSION`, si la version a été trouvée et installée
- Pour les paquets avec `=VERSION`, si exactement cette version a été trouvée et installée

## Intégration avec les systèmes de build

### Utilisation dans des scripts d’automatisation

CondinAPT s’intègre facilement dans les systèmes de build et les scripts d’automatisation. Pour plus de détails sur la syntaxe des fichiers de paquets, voir la section [Syntaxe du fichier de liste des paquets](#package-list-file-syntax).

### Exemple d’intégration générale :

**Dans un script d’automatisation (`install.sh`) :**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Exemples de configuration universelle

**Exemple de fichier de correspondance des filtres (`filters.map`) :**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Exemple de configuration (`system.conf`) :**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Exemples de scénarios réels

### Exemple 1 : Serveur multimédia

**`packages.list` :**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Exemple 2 : Serveur web avec différentes configurations

**`packages.list` :**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Exemple 3 : Plateforme de conteneurs

**`packages.list` :**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Exemple 4 : Utilisation avancée des filtres

**`packages.list` :**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Conseils d’optimisation

### Organisation des listes de paquets

1. **Regrouper par fonctionnalité :**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Utiliser des files d’attente pour les dépendances :**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Optimiser les conditions :**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Performance

- Utilisez des files de priorité pour les paquets critiques
- Minimisez le nombre de files d’attente
- Regroupez les paquets liés dans une seule file
- Utilisez le cache APT pour les grosses compilations

## Dépannage

### Problèmes courants

**Problème :** Le paquet ne s’installe pas malgré les bonnes conditions
**Solution :** Vérifiez avec l’option `-vv` pour des informations détaillées sur les filtres

**Problème :** CondinAPT s’arrête sur un paquet obligatoire
**Solution :** Vérifiez la disponibilité du paquet dans les dépôts ou utilisez une solution de repli. Voir la section [Gestion des erreurs et reprise](#error-handling-and-recovery)

**Problème :** Comportement inattendu avec les versions de paquets
**Solution :** Utilisez le [mode simulation](#operating-modes-and-debugging) (`-s`) pour vérifier

### Débogage des filtres

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Vérification de la disponibilité des paquets

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
