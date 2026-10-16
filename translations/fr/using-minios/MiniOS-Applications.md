---
updated: 2026-10-15
---

# MiniOS applications

MiniOS fournit des outils graphiques et en ligne de commande pour la configuration, l’installation, les sessions, les modules, les noyaux, les logiciels et le remastering d’images. Ces outils s’appuient sur l’architecture live modulaire décrite dans [À propos de MiniOS](/getting-started/About-MiniOS).

## Disponibilité

Les outils disponibles dépendent des paquets inclus dans l’image MiniOS. Vérifiez les outils d’un système live en cours d’exécution avec `dpkg-query`, ou consultez les modules de l’image et les [manifestes des paquets](/reference/Package-and-Edition-Contents).

Une installation native conserve l’environnement de bureau familier de MiniOS — son identité visuelle, l’environnement de bureau choisi et les applications courantes —, mais pas les logiciels de gestion propres à MiniOS, conçus pour l’architecture live. Les sessions,`.sb` les modules, la gestion modulaire des noyaux et les workflows similaires ne s’appliquent plus. Le système installé utilise donc à la place les outils Debian standard pour les paquets, les noyaux, la configuration et le chargeur d’amorçage.

## Outils graphiques

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Modifier les paramètres d’amorçage et de nouvelle session de MiniOS | **Configurateur MiniOS** | Pour le modèle de configuration live MiniOS. L’outil enregistre les paramètres pour un prochain démarrage live et ne reconfigure pas immédiatement le système en cours d’exécution. | [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Déployer MiniOS sur un autre disque | **Programme d’installation MiniOS** | S’exécute depuis une session live MiniOS. Le mode live conserve l’environnement live complet de MiniOS ; le mode natif crée un environnement de bureau Debian classique et supprime les logiciels propres à MiniOS, prévus pour une utilisation live. | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) |
| Créer, sélectionner, monter, redimensionner, enregistrer, récupérer, chiffrer ou supprimer des sessions persistantes | **Gestionnaire de sessions MiniOS** | Systèmes live MiniOS uniquement. L’outil peut écrire les sessions prises en charge, basées sur RAM, dans leur emplacement d’origine, modifier les phrases secrètes LUKS des conteneurs détachés et monter des sessions de conteneur inactives pour accéder à leurs fichiers. | [Gestion des sessions](/using-minios/Sessions-and-Persistence) |
| Empaqueter, activer, examiner ou supprimer des noyaux MiniOS | **Gestionnaire de noyaux MiniOS** | Systèmes live modulaires MiniOS uniquement. L’empaquetage des dépôts peut également ajouter des pilotes compatibles issus du catalogue DKMS sélectionné de MiniOS. | [Gestion des noyaux](/preparing-and-customizing/Managing-Kernels) |
| Installer des applications ou créer des modules d’application à partir de recettes du catalogue | **Boutique d’applications MiniOS** | Systèmes live MiniOS. La création des modules peut utiliser le niveau de la recette ou un niveau de base de compilation explicite ; les recettes peuvent exiger l’acceptation d’une licence. | [Boutique d’applications MiniOS](/using-minios/Installing-Software) |
| Remasteriser une image MiniOS existante à l’aide d’un projet guidé | **Créateur d’images MiniOS** | Utilise la session en cours, une image ISO ou un support optique. La capture de session nécessite de sélectionner la session en cours comme source, avec l’ensemble complet des sources et des modules externes actifs ; elle n’est pas disponible si une image ISO ou un support optique est sélectionné séparément. | [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Examiner, créer, activer et sélectionner `.sb` modules | **Gestionnaire de modules MiniOS** | Systèmes live MiniOS uniquement ; la composition des modules et leur activation à l’exécution dépendent du modèle de racine en couches `.sb`. | [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules) |
| Écrire/lire des images disque, formater un support de stockage ou effacer un appareil | **Utilitaire de disque** | Utilitaire de stockage générique inclus dans MiniOS. L’écriture brute d’une image ne réalise pas de déploiement géré comme le Programme d’installation MiniOS. | [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) |
| Consulter hors ligne la documentation installée | **Aide MiniOS** | Visionneuse GTK native pour un ensemble de documentation précompilé ; elle ne nécessite ni le site web, ni WebKit, ni connexion réseau à l’exécution. | [Documentation MiniOS](/) |
| Afficher l’introduction localisée au premier démarrage | **Bienvenue dans MiniOS** | Page d’accueil locale dans le navigateur, avec Mio, des liens vers le projet, de l’aide, la communauté et des ressources d’assistance. Il s’agit d’un contenu d’introduction, et non d’un outil de configuration du système. | [Démarrage rapide](/getting-started/Quick-Start) |

## Outils en ligne de commande

La plupart des outils graphiques disposent d’un équivalent public en ligne de commande ou d’un backend. Le manifeste de base demande `minios-tools` pour chaque édition et `minios-image-compose`, `minios-deploy`, `minios-kernel` et `minios-session` pour les variantes autres que minimales, indépendamment des outils de bureau graphiques. Flux utilise la variante `minimum` et ne demande pas ces quatre backends associés par défaut. Vérifiez les paquets réellement installés ; les dépendances et les images personnalisées peuvent ajouter des outils qui ne figurent pas dans le manifeste.

### Déploiement et sessions

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lister les disques cibles, prévisualiser un plan de déploiement ou installer MiniOS sans intervention | **`minios-deploy`** | S’exécute depuis une session active MiniOS. L’installation nécessite les droits root et une confirmation explicite ; le mode natif, lorsqu’il est pris en charge, crée un environnement de bureau Debian classique à partir de l’image sélectionnée. | [Déploiement en ligne de commande](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Créer, activer, enregistrer, monter, redimensionner, récupérer, modifier les identifiants de chiffrement, exporter, importer ou supprimer des sessions persistantes | **`minios-session`** | Nécessite les droits root et un système actif MiniOS doté d’un espace de persistance compatible. L’enregistrement reposant sur RAM, les montages détachés et les opérations propres au backend dépendent des fonctionnalités disponibles. | [Référence des commandes de session](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Noyaux et images

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lister, empaqueter, activer, inspecter ou supprimer des noyaux | **`minios-kernel`** | Nécessite les droits root et une installation active modulaire MiniOS avec une racine MiniOS accessible en écriture. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Remasteriser une arborescence de contenu MiniOS existante à l’aide de scripts ou de l’automatisation | **`minios-image-compose`** | Opère sur le contenu d’une image active MiniOS et génère un ISO amorçable. | [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Flux de travail des modules

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Inspecter les modules et gérer les ensembles de modules actifs ou prévus au prochain démarrage | **`sb`** | L’inspection des modules fonctionne également en dehors d’une session active MiniOS. Les opérations sur les modules actifs ou prévus au prochain démarrage nécessitent une configuration de modules active MiniOS ; les modifications nécessitent les droits root. | [Inspecter et extraire des modules](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gérer les modules actifs et ceux du prochain démarrage](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Créer un module à partir de paquets de dépôts ou de fichiers locaux`.deb` fichiers | **`apt2sb`** | Nécessite les droits root et une session active MiniOS prise en charge. Les paquets sont installés dans un environnement de compilation isolé, et non dans la racine du système actif. | [Créer un module à partir de paquets](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Créer un module en exécutant un script d’installation | **`script2sb`** | Nécessite les droits root et une session active MiniOS prise en charge. Le script s’exécute sans intervention dans un environnement de compilation isolé. | [Créer un module à partir d’un script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Créer un module de manière interactive dans un environnement préparé | **`chroot2sb`** | Nécessite les droits root et une session active MiniOS prise en charge. Utilisez cette méthode si l’installation nécessite des invites ou des modifications manuelles. | [Créer un module de manière interactive](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convertir une arborescence de répertoires en module `.sb` ou inversement | **`dir2sb`**, **`sb2dir`** | La conversion standard ne nécessite pas les droits root et peut être effectuée en dehors d’une session active. L’extraction fidèle et le reconditionnement avec les propriétaires d’origine et les fichiers spéciaux nécessitent les droits root ; les interfaces graphiques demandent une authentification administrateur. | [Créer](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) ou [extraire](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un module ; `man dir2sb`, `man sb2dir` |
| Capturer dans un module les modifications admissibles de la couche inscriptible de la session | **`savechanges`** | Nécessite les droits root et une session active MiniOS en cours d’exécution, avec un backend de couche inscriptible pris en charge. | [Capturer les modifications de la session en cours](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flux de travail du stockage

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lire ou écrire des images disque, formater un périphérique ou effacer un support de stockage | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Opérations génériques sur les disques. L’effacement prend en charge les méthodes d’effacement par le contrôleur, discard et écrasement par l’hôte lorsque le périphérique et les outils requis le permettent. Les opérations destructives nécessitent généralement les droits root. | [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Pour modifier les listes de paquets source, les noyaux, les artefacts d’amorçage ou la chaîne complète de modules, utilisez plutôt le système de compilation source que l’un ou l’autre des outils de remasterisation d’image. Voir [Compilation de MiniOS](/development/Building-MiniOS).
