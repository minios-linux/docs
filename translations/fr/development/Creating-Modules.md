# Création de modules

Les modules dans MiniOS sont des paquets autonomes de fichiers et de configurations qui étendent les fonctionnalités du système de base. Ils sont similaires aux paquets dans d'autres distributions Linux, mais sont conçus pour être superposés les uns sur les autres, permettant ainsi un système flexible et personnalisable. Cette approche en couches facilite la personnalisation, le retour en arrière des modifications et le partage de configurations.

Pour le processus complet de construction de MiniOS et le contexte de l'architecture système, consultez le [guide de construction de MiniOS](/development/Building-MiniOS.md). Pour plus d'informations sur le système de gestion de paquets CondinAPT utilisé dans les modules, voir la [documentation CondinAPT](/development/CondinAPT.md).

Il existe de nombreux utilitaires pour créer des modules dans MiniOS. Tous sont conçus pour être utilisés en terminal et nécessitent les droits root.

**Utilitaires de création de modules :**

**apt2sb** – installe des paquets depuis les dépôts et les regroupe dans un module.<br>
**script2sb** – exécute les actions décrites dans le script et regroupe le résultat dans un module.<br>
**chroot2sb** – ouvre un chroot, vous permettant d'effectuer toutes les actions nécessaires, puis enregistre le résultat dans le module après la sortie.<br>

**Utilitaires supplémentaires de gestion des modules :**

**dir2sb** – convertit un répertoire existant en module compressé.<br>
**sb2dir** – convertit un module compressé en répertoire pour examen.<br>
**rmsbdir** – supprime un répertoire de module créé par sb2dir.<br>
**savechanges** – sauvegarde tous les fichiers modifiés du système dans un bundle de système de fichiers compressé.<br>
**sb2iso** – génère une image ISO MiniOS, en ajoutant ou excluant des modules au besoin.<br>
**sb** – interface complète pour la gestion des bundles MiniOS (activation, désactivation, liste, conversion).<br>

**Fonctionnalités communes aux utilitaires de création de modules :**
- Prise en charge de différents types de compression : zstd (par défaut), gzip, lzo, xz
- Extension de fichier module personnalisable (par défaut : sb)
- Filtrage par niveau pour contrôler quels modules existants inclure comme dépendances
- Nom personnalisé pour les modules générés
- Tous les utilitaires doivent être exécutés en tant que root

## apt2sb

Pour construire un module avec apt2sb, il suffit de lister les paquets que vous souhaitez inclure dans le module, par exemple : `apt2sb install chromium chromium-sandbox`. L'exécution de cette commande dans le dossier courant produira un module chromium.sb qui contiendra le navigateur Chromium. Ce module sera construit en tenant compte de tous les modules déjà chargés dans le système, ce qui signifie qu'il nécessitera leur présence pour fonctionner, car les bibliothèques requises peuvent déjà être installées dans le système ou présentes dans les modules inférieurs.

En utilisant l'option `-l`/`--level`, vous pouvez spécifier sur quel module supérieur vous souhaitez baser la construction de votre module. Par exemple, la commande `apt2sb install -l 4 chromium chromium-sandbox` exclura tous les modules numérotés 04 et plus lors de la construction, c'est-à-dire que le module sera construit à partir des modules 00 à 03. Après exécution, vous obtiendrez le module 04-chromium.sb dans le dossier d'exécution. Ce module sera plus volumineux que dans l'exemple précédent car il inclura toutes les bibliothèques nécessaires à l'exécution du programme, qui pourraient se trouver dans les modules 04 et supérieurs, mais il pourra fonctionner aussi bien avec qu'en l'absence de ces modules.

Le nom du module est généré automatiquement, basé sur le nom du premier paquet spécifié (ici, chromium) et, si l'option --level est utilisée, le numéro de niveau. Si vous souhaitez définir vous-même le nom du module, vous pouvez utiliser l'option `-n`/`--name`, par exemple : `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Options supplémentaires disponibles dans apt2sb :**

- `-c`/`--comp` – Type de compression (zstd, gzip, lzo, xz). Par défaut : zstd
- `-b`/`--bext` – Extension du bundle. Par défaut : sb
- `-y`/`--yes` – Répondre automatiquement oui aux questions
- `--allow-downgrades` – Autoriser la rétrogradation de paquets
- `--install-recommends` – Considérer les paquets recommandés comme dépendances à installer
- `--install-suggests` – Considérer les paquets suggérés comme dépendances à installer
- `--no-install-recommends` – Ne pas considérer les paquets recommandés comme dépendances
- `--no-install-suggests` – Ne pas considérer les paquets suggérés comme dépendances
- `-t`/`--target-release` – Version par défaut pour l'installation des paquets

apt2sb dispose également d'une commande `upgrade` permettant de mettre à jour les paquets déjà installés. La commande upgrade utilise les mêmes options que install.

## script2sb

Pour construire un module avec script2sb, vous devez écrire un script bash décrivant les étapes nécessaires à la création de votre module. Cela peut être utile si vous devez effectuer des actions sur le système de fichiers, importer des clés, ajouter un dépôt, etc. avant ou après l'installation. Voici un exemple de script :
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
Pour lancer la construction à partir de ce script (appelons-le caddy.sh), vous devez exécuter la commande `script2sb -s ./caddy.sh`.

**Options disponibles pour script2sb :**

- `-s`/`--script` – Utiliser le FICHIER comme script d'installation (obligatoire)
- `-l`/`--level` – Utiliser le NIVEAU comme filtre
- `-n`/`--name` – Utiliser NOM comme nom de fichier du module
- `-c`/`--comp` – Type de compression (zstd, gzip, lzo, xz). Par défaut : zstd
- `-b`/`--bext` – Extension du bundle. Par défaut : sb
- `-d`/`--directory` – Copier le contenu du RÉPERTOIRE à la racine du module

Si aucun nom de module n'est spécifié, le nom est généré à partir du numéro de niveau, si présent, et du nom du script. Exemple d'exécution avec ces options : `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

En plus de ces options, vous pouvez utiliser l'option `-d`/`--directory`. Si cette option est spécifiée, le contenu du dossier indiqué sera copié à la racine du module avant l'exécution du script. Les fichiers de ce dossier doivent être organisés comme ils le seraient à la racine du système. Supposons que vous souhaitiez ajouter un raccourci dans le menu pour un programme, créez alors un dossier mymodule et structurez-le comme la racine système :
```
mkdir -p /home/user/mymodule/usr/share/applications
```
Dans le dossier mymodule/usr/share/applications, placez le fichier desktop qui sera inclus dans le module après la construction, puis lancez la commande de construction :
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

L'utilitaire `chroot2sb` permet de créer un environnement chroot interactif. Vous pouvez ainsi effectuer *toutes* les actions nécessaires à la création de votre module (installer des paquets, modifier des fichiers, exécuter des commandes, etc.). Une fois que vous quittez l'environnement chroot, les modifications sont regroupées dans un module.

**Options disponibles pour chroot2sb :**

- `-l`/`--level` – Utiliser NIVEAU comme filtre
- `-n`/`--name` – Utiliser NOM comme nom de fichier du module
- `-c`/`--comp` – Type de compression (zstd, gzip, lzo, xz). Par défaut : zstd
- `-b`/`--bext` – Extension du bundle. Par défaut : sb
- `-d`/`--directory` – Copier le contenu du RÉPERTOIRE à la racine du module

Si aucun nom de module n'est spécifié, le nom est généré à partir du numéro de niveau, si présent, et de la date et l'heure actuelles au format AAAAMMJJ-HHMM.

Vous pouvez également utiliser l'option `-d`/`--directory`, comme avec `script2sb`. Si cette option est spécifiée, le contenu du dossier indiqué sera copié à la racine du module *avant* d'entrer dans l'environnement chroot. Cela permet de définir une base pour vos personnalisations.

**Exemples d'utilisation :**

- Chroot basique, nom de module automatique : `chroot2sb`
- Spécifier le niveau et la compression : `chroot2sb -l 3 -c gzip`
- Spécifier le niveau, le nom et la compression : `chroot2sb -l 3 -n 04-my-module.sb -c xz`
- Copier des fichiers depuis un dossier avant d'entrer dans le chroot : `chroot2sb -d /path/to/my/files`

Après avoir exécuté la commande `chroot2sb`, vous serez placé dans un environnement chroot. Vous pouvez alors effectuer toutes les actions nécessaires. Lorsque vous avez terminé, tapez `exit` pour quitter le chroot. `chroot2sb` regroupera alors les modifications dans un module. Les commandes saisies dans le chroot ne sont *pas* enregistrées dans le processus d'installation final du module. Il s'agit d'un instantané de l'état final du système de fichiers. L'historique bash est automatiquement supprimé du module.

## Utilitaires supplémentaires de gestion des modules

En plus des utilitaires de création de modules, MiniOS propose plusieurs outils pour gérer et manipuler les modules existants :

### dir2sb

L'utilitaire `dir2sb` permet de convertir un répertoire existant en module compressé. Cela est utile si vous avez déjà préparé une structure de répertoire avec tous les fichiers nécessaires et souhaitez la regrouper dans un module sans lancer de processus d'installation.

**Options disponibles pour dir2sb :**

- `-c`/`--comp` – Type de compression (zstd, gzip, lzo, xz). Par défaut : zstd
- `-b`/`--bext` – Extension du bundle. Par défaut : sb

**Utilisation :**

`dir2sb [OPTIONS] SOURCE_DIRECTORY [TARGET_FILE]`

**Comportement :**

- Si `SOURCE_DIRECTORY` n'a pas d'extension .sb et ne s'appelle pas 'squashfs-root', alors le répertoire lui-même est inclus dans le module, et `TARGET_FILE` est requis.
- Si `TARGET_FILE` n'est pas spécifié, `SOURCE_DIRECTORY` est remplacé par le nouveau fichier module.

**Exemples :**

- Convertir un dossier préparé en module : `dir2sb /path/to/my/prepared/files my-module.sb`
- Convertir un dossier squashfs-root (remplace l'original) : `dir2sb squashfs-root`
- Utiliser une compression différente : `dir2sb -c xz /path/to/files custom-module.sb`

Cet utilitaire est particulièrement utile pour :
- Regrouper des fichiers et répertoires préconfigurés
- Convertir le contenu extrait d'un module en module
- Créer des modules à partir de structures de répertoires préparées manuellement

### sb2dir

L'utilitaire `sb2dir` convertit un module compressé (.sb) en un répertoire du même nom. Cela permet d'extraire et d'examiner le contenu d'un module.

**Utilisation :**

`sb2dir [source_file.sb] [optional_output_directory]`

**Comportement :**

- Si le répertoire de sortie est spécifié, il doit exister
- Si le répertoire de sortie n'est pas spécifié, le nom source_file.sb est utilisé et le répertoire est monté temporairement avec tmpfs

**Exemples :**

- Extraire un module pour examiner son contenu : `sb2dir mymodule.sb`
- Extraire dans un dossier spécifique : `sb2dir mymodule.sb /tmp/extracted`

### rmsbdir

L'utilitaire `rmsbdir` supprime un répertoire de module créé par `sb2dir`. Cela permet de nettoyer correctement le montage tmpfs s'il a été utilisé.

**Utilisation :**

`rmsbdir [source_directory.sb]`

**Exemple :**

- Supprimer un dossier de module extrait : `rmsbdir mymodule.sb`

### savechanges

L'utilitaire `savechanges` sauvegarde tous les fichiers modifiés du système dans un bundle de système de fichiers compressé. Cela est utile pour créer des modules à partir de modifications effectuées en cours d'exécution.

**Options disponibles :**

- `-c`/`--comp` – Type de compression (zstd, gzip, lzo, xz). Par défaut : zstd
- `-b`/`--bext` – Extension du bundle. Par défaut : sb

**Utilisation :**

`savechanges [OPTIONS] target_file.sb [changes_directory]`

Si changes_directory n'est pas spécifié, `/run/initramfs/memory/changes` est utilisé.

**Exemples :**

- Sauvegarder tous les changements en cours : `savechanges my-changes.sb`
- Sauvegarder avec une compression différente : `savechanges -c xz my-changes.sb`

### sb2iso

L'utilitaire `sb2iso` génère une image ISO MiniOS, en ajoutant éventuellement des modules spécifiés ou en excluant certains existants.

**Options disponibles :**

- `-e`/`--exclude` – Exclure tout chemin ou fichier existant correspondant à REGEX
- `-n`/`--name` – Spécifier le nom du fichier ISO de sortie (par défaut : minios-YYYYMMDD_HHMM.iso)

**Utilisation :**

`sb2iso [OPTIONS]... [MODULE.SB]...`

**Exemples :**

- Créer une ISO MiniOS sans le module firefox.sb : `sb2iso -e 'firefox' -n minios_without_firefox.iso`
- Créer un noyau MiniOS en mode texte uniquement : `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

L'utilitaire `sb` fournit une interface complète pour la gestion des bundles MiniOS, incluant l'activation, la désactivation et les opérations de conversion.

**Important :** L'utilitaire `sb` nécessite le support AUFS (Advanced multi layered UniFication FileSystem) dans le noyau pour la plupart des opérations. Si AUFS n'est pas disponible dans votre noyau, de nombreuses commandes ne fonctionneront pas.

**Commandes disponibles :**

- `activate BUNDLE` – Active un bundle MiniOS
- `deactivate BUNDLE` – Désactive un bundle MiniOS actif  
- `list` – Liste les bundles MiniOS actifs
- `savechanges` – Sauvegarde les modifications effectuées en cours d'exécution dans le bundle
- `rm DIR` / `rmdir DIR` – Supprime un répertoire de bundle décompressé
- `conv PATH` – Convertit un bundle .sb en répertoire ou inversement

**Exemples :**

- Activer un module : `sb activate mymodule.sb`
- Désactiver un module : `sb deactivate mymodule.sb`
- Lister les modules actifs : `sb list`
- Convertir un module en répertoire : `sb conv mymodule.sb`
- Convertir un répertoire en module : `sb conv mymodule/`

**Remarque :** Les commandes `activate`, `deactivate` et `list` nécessitent le support AUFS dans le noyau et les droits root. Les commandes `conv`, `rm` et `rmdir` fonctionnent sans AUFS mais nécessitent tout de même les droits root.

## Documentation associée

- **[Reconstruction de l'ISO](/development/Rebuilding-ISO.md)** – Apprenez à regrouper vos modules personnalisés dans des images ISO amorçables à l'aide de `sb2iso`
- **[Construction de MiniOS](/development/Building-MiniOS.md)** – Guide complet pour construire MiniOS à partir des sources avec des configurations personnalisées
