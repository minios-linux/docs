# MiniOS Module Manager

MiniOS Module Manager est l’application graphique permettant d’inspecter, de créer et de gérer les modules `.sb` de MiniOS. Elle propose deux espaces de travail : **Modules** pour la composition du système et **Créer** pour la création de nouveaux modules.

Lancez-la depuis le menu des applications ou exécutez :

```bash
minios-module-manager
```

L’application s’exécute avec votre utilisateur de session. Elle demande une authentification administrateur uniquement lorsque l’opération le nécessite.

## Exécution actuelle et au prochain démarrage

L’espace Modules propose deux vues distinctes :

- **En cours d’exécution** affiche l’ensemble ordonné des modules qui composent actuellement le système actif.
- **Prochain démarrage** affiche l’ensemble ordonné sélectionné selon les règles de démarrage actuelles de MiniOS.

Modifier une vue n’affecte pas silencieusement l’autre. Par exemple, **Activer pour cette session** agit uniquement sur le système en cours, tandis que **Ajouter au prochain démarrage** copie un module dans le stockage persistant sans l’activer immédiatement.

L’activation et la désactivation à chaud ne sont possibles que si le système de fichiers racine utilise actuellement AUFS. Elles ne sont pas disponibles sur un root OverlayFS, même si le noyau prend en charge AUFS. Les modules de base ne peuvent pas être désactivés via l’application.

Les modifications pour le prochain démarrage ne sont possibles que si MiniOS détecte un stockage de modules adapté, durable et accessible en écriture. Les modules de base et ceux présents sur un support en lecture seule ou volatile ne peuvent pas être supprimés. Les filtres de démarrage comme `load`, `noload` et `bext` déterminent toujours les modules sélectionnés.

## Inspection d’un module

Sélectionnez un module pour afficher sa source, sa taille compressée et le contenu de son système de fichiers. Si son fichier d’origine est disponible, **Extraire dans un dossier** crée un nouveau répertoire contenant les fichiers du module.

L’inspection et l’extraction simple ne requièrent pas de privilèges administrateur. L’extraction ne remplace jamais une destination existante.

Vous pouvez également ouvrir un fichier local `.sb` depuis le gestionnaire de fichiers. Ouvrir un fichier permet uniquement de l’inspecter ; cela ne l’active pas et ne l’ajoute pas au prochain démarrage.

## Création d’un module

L’espace Créer suit un flux **Configurer**, **Vérifier**, **Exécuter** et **Résultat**. Un module créé avec succès reste un fichier à l’emplacement de sortie choisi. Il n’est pas activé et n’est pas ajouté automatiquement au prochain démarrage.

Les méthodes disponibles sont :

- **Paquets** installe des paquets du dépôt et des fichiers locaux `.deb` sélectionnés, ainsi que leurs dépendances, dans un environnement de construction MiniOS isolé. L’installation de paquets nécessite une authentification administrateur.
- **Script d’installation** exécute un script vérifié sans terminal interactif. Un dossier de départ facultatif peut fournir des fichiers initiaux. Le script s’exécute avec les droits administrateur mais n’est pas inclus dans le module final.
- **Chroot interactif** ouvre un shell root temporaire dans le terminal intégré. Tapez `exit` lorsque vous avez terminé, puis créez le module, rouvrez le shell ou annulez les modifications. Fermer ou annuler la session ne modifie pas le système en cours d’exécution.
- **Dossier** empaquette le contenu d’un répertoire existant. Le dossier source n’est pas imbriqué dans le module. La conversion simple de dossier ne nécessite pas les droits root, laisse la source inchangée et normalise la propriété des fichiers dans le module à root.
- **Modifications de la session en cours** capture les fichiers et suppressions éligibles de la couche d’écriture de la session active. Elle applique la politique standard MiniOS `savechanges`, qui exclut les journaux, caches, données de démarrage et chemins temporaires d’exécution. Lire l’intégralité de la couche d’écriture nécessite une authentification administrateur.

Choisissez un nouveau chemin de sortie pour chaque flux de travail. Les fichiers existants ne sont jamais écrasés. La progression et les diagnostics du backend restent visibles pendant l’opération, et la capture de session en cours peut être annulée.

La capture de session en cours est conçue pour une sauvegarde standard pratique, pas pour examiner chaque chemin inclus. Une couche d’écriture active peut contenir des données personnelles ou confidentielles. Pour des politiques explicites de `exact`, `clean` ou de sélection de chemins, utilisez le flux de travail en ligne de commande `savechanges` décrit dans [Créer des modules](/development/Creating-Modules.md).

## Glisser-déposer

Le glisser-déposer ne fait que remplir un champ ou ouvrir l’inspection :

- Un module ouvre ses détails.
- Les fichiers `.deb` sont ajoutés à Paquets.
- Un dossier est sélectionné pour Dossier.
- Un autre fichier ordinaire est sélectionné comme Script d’installation.

Déposer un élément n’exécute aucun code et ne modifie ni En cours d’exécution ni Prochain démarrage.

## Documentation associée

- [Créer des modules](/development/Creating-Modules.md)
- [Reconstruire des images ISO](/development/Rebuilding-ISO.md)
- [Paramètres de démarrage](/configuration/Boot-Parameters.md)
