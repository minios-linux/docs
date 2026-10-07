---
updated: 2026-10-06
---

# Applications MiniOS

MiniOS propose des outils graphiques et en ligne de commande pour la configuration, l'installation, les sessions, les modules, les noyaux, les logiciels et la personnalisation d'image. Ces outils sont conçus autour de l’architecture live modulaire décrite dans [À propos de MiniOS](/getting-started/About-MiniOS).

## Disponibilité

Les outils disponibles dépendent des paquets inclus dans l’image MiniOS. Vérifiez sur un système live en cours d’exécution avec `dpkg-query`, ou examinez les modules de l’image et les [manifestes de paquets](/reference/Package-and-Edition-Contents).

Une installation native conserve l’expérience familière du bureau MiniOS — son identité visuelle, l’environnement de bureau choisi et les applications courantes — mais elle ne conserve pas les outils de gestion spécifiques à MiniOS conçus pour l’architecture live. Les sessions, `.sb` les modules, la gestion modulaire des noyaux et les workflows similaires ne s’appliquent plus ; le système installé utilise alors les outils standards Debian pour les paquets, les noyaux, la configuration et le chargeur d’amorçage.

## Outils graphiques

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Modifier les paramètres de démarrage et de nouvelle session MiniOS | **Configurateur MiniOS** | Pour le modèle de configuration live MiniOS. Il enregistre les paramètres pour un prochain démarrage live et ne reconfigure pas immédiatement le système en cours. | [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Déployer MiniOS sur un autre disque | **Programme d’installation MiniOS** | Fonctionne depuis une session live MiniOS. Le mode live conserve l’environnement live complet MiniOS ; le mode natif crée un bureau Debian classique et retire les logiciels spécifiques à MiniOS destinés au fonctionnement live. | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) |
| Créer, sélectionner, monter, redimensionner, sauvegarder, récupérer, chiffrer ou supprimer des sessions persistantes | **Gestionnaire de sessions MiniOS** | Uniquement pour les systèmes live MiniOS. Il peut enregistrer les sessions prises en charge par RAM sur leur stockage d’origine, modifier les phrases de passe LUKS détachées et monter des sessions conteneur inactives pour accéder aux fichiers. | [Gestion des sessions](/using-minios/Sessions-and-Persistence) |
| Emballer, activer, inspecter ou supprimer des noyaux MiniOS | **Gestionnaire de noyaux MiniOS** | Uniquement pour les systèmes live modulaires MiniOS. L’empaquetage depuis le dépôt peut aussi ajouter des pilotes compatibles du catalogue DKMS sélectionné MiniOS. | [Gestion des noyaux](/preparing-and-customizing/Managing-Kernels) |
| Installer des applications ou construire des modules d’application à partir de recettes du catalogue | **Boutique d’applications MiniOS** | Pour les systèmes live MiniOS. Les constructions de modules peuvent conserver un niveau de recette ou utiliser un niveau de base de construction explicite ; certaines recettes peuvent nécessiter l’acceptation d’une licence. | [Boutique d’applications MiniOS](/using-minios/Installing-Software) |
| Personnaliser une image existante MiniOS via un projet guidé | **Créateur d’images MiniOS** | Fonctionne avec le contenu d’image live MiniOS depuis la session live en cours, une ISO ou un média optique. Permet de sélectionner les modules, capturer les modifications de session et configurer le comportement du menu de démarrage avant de produire une nouvelle ISO live vérifiée. | [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspecter, créer, activer et sélectionner `.sb` des modules | **Gestionnaire de modules MiniOS** | Uniquement pour les systèmes live MiniOS ; la composition des modules et leur activation à l’exécution dépendent du modèle de `.sb` racine en couches. | [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules) |
| Écrire/lire des images disque, formater un support ou effacer un périphérique | **Utilitaire de disque** | Outil de stockage générique inclus avec MiniOS. L’écriture d’image brute ne réalise pas de déploiement géré comme le Programme d’installation MiniOS. | [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) |
| Consulter la documentation installée hors ligne | **Aide MiniOS** | Visionneuse GTK native pour un lot de documentation précompilé ; ne nécessite ni site web, ni WebKit, ni connexion réseau à l’exécution. | [Documentation MiniOS](/) |
| Afficher l’introduction localisée au premier lancement | **Bienvenue MiniOS** | Page d’accueil locale dans le navigateur avec Mio, liens vers le projet, aide, communauté et suggestions de support. Il s’agit d’un contenu d’introduction, pas d’un configurateur système. | [Démarrage rapide](/getting-started/Quick-Start) |

## Outils en ligne de commande

La plupart des outils graphiques disposent d’un équivalent public en ligne de commande ou d’un backend. Ces commandes sont fournies soit dans le même paquet que l’application graphique, soit dans un paquet compagnon requis. Le manifeste de base partagé inclut `minios-tools` et `minios-image-compose`. Les autres commandes dépendent de la disponibilité de leur paquet graphique associé. Leur présence sur un système ou une image installée doit toujours être vérifiée directement.

### Déploiement et sessions

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lister les disques cibles, prévisualiser un plan de déploiement ou installer MiniOS sans interaction | **`minios-deploy`** | Fonctionne depuis une session live MiniOS. L’installation nécessite les droits root et une confirmation explicite ; le mode natif, si disponible, crée un bureau Debian classique à partir de l’image sélectionnée. | [Déploiement en ligne de commande](/installing-minios/MiniOS-Installer#command-line-deployment) ; `man minios-deploy` |
| Créer, activer, sauvegarder, monter, redimensionner, récupérer, modifier les identifiants de chiffrement, exporter, importer ou supprimer des sessions persistantes | **`minios-session`** | Nécessite les droits root et un système live MiniOS avec un stockage de persistance compatible. La sauvegarde sur RAM, les montages détachés et les opérations spécifiques au backend sont soumis aux capacités disponibles. | [Référence des commandes de session](/using-minios/Sessions-and-Persistence#command-reference) ; `man minios-session` |

### Noyaux et images

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lister, empaqueter, activer, inspecter ou supprimer des noyaux | **`minios-kernel`** | Nécessite les droits root et une installation live modulaire MiniOS avec une racine MiniOS en écriture. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference) ; `man minios-kernel` |
| Personnaliser un arbre de contenu existant MiniOS via des scripts ou de l’automatisation | **`minios-image-compose`** | Fonctionne sur le contenu d’image live MiniOS et publie une ISO amorçable. | [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line) ; `man minios-image-compose` |

### Workflows des modules

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Inspecter les modules et gérer les ensembles de modules actifs ou au prochain démarrage | **`sb`** | L’inspection des modules fonctionne aussi en dehors d’une session MiniOS en cours. Les opérations sur les modules actifs ou au prochain démarrage nécessitent une organisation modulaire live MiniOS ; les modifications requièrent les droits root. | [Inspecter et extraire des modules](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) ; [gérer les modules actifs et au prochain démarrage](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules) ; `man sb` |
| Construire un module à partir de paquets du dépôt ou de fichiers locaux `.deb` | **`apt2sb`** | Nécessite les droits root et une session live MiniOS prise en charge. Les paquets sont installés dans un environnement de construction isolé, et non dans la racine active. | [Créer un module à partir de paquets](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages) ; `man apt2sb` |
| Construire un module en exécutant un script d’installation | **`script2sb`** | Nécessite les droits root et une session live MiniOS prise en charge. Le script s’exécute sans interaction dans un environnement de construction isolé. | [Créer un module à partir d’un script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script) ; `man script2sb` |
| Construire un module de façon interactive dans un environnement préparé | **`chroot2sb`** | Nécessite les droits root et une session live MiniOS prise en charge. À utiliser si l’installation nécessite des invites ou des modifications manuelles. | [Créer un module de façon interactive](/preparing-and-customizing/Managing-Modules#create-a-module-interactively) ; `man chroot2sb` |
| Convertir entre un arbre de répertoires et un `.sb` module | **`dir2sb`**, **`sb2dir`** | La conversion standard ne nécessite pas les droits root et peut être effectuée en dehors d’une session live. L’extraction fidèle et le reconditionnement avec les propriétaires d’origine et les fichiers spéciaux nécessitent les droits root ; les workflows graphiques demandent une authentification administrateur. | [Créer](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) ou [extraire](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un module ; `man dir2sb`, `man sb2dir` |
| Capturer les modifications éligibles de la couche session en écriture dans un module | **`savechanges`** | Nécessite les droits root et une session live MiniOS en cours avec un backend de couche en écriture pris en charge. | [Capturer les modifications de la session en cours](/preparing-and-customizing/Managing-Modules#capture-current-session-changes) ; `man savechanges` |

### Workflows de stockage

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lire ou écrire des images disque, formater un périphérique ou effacer un support de stockage | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Opérations génériques sur disque. L’effacement prend en charge les méthodes d’effacement par le contrôleur, de discard et de réécriture par l’hôte lorsque le périphérique et les outils requis le permettent. Les opérations destructives nécessitent généralement les droits root. | [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) ; `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Pour modifier les listes de paquets sources, les noyaux, les artefacts de démarrage ou toute la chaîne de modules, utilisez le système de construction source plutôt que les outils de personnalisation d’image. Voir [Construction de MiniOS](/development/Building-MiniOS).
