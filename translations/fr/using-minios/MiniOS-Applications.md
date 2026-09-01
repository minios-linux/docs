---
updated: 2026-08-31
---

# Applications MiniOS

MiniOS propose des outils graphiques et en ligne de commande pour la configuration, l’installation, les sessions, les modules, les noyaux, les logiciels et la personnalisation d’images. Ces outils sont conçus autour de l’architecture modulaire live décrite dans [À propos de MiniOS](/getting-started/About-MiniOS).

## Disponibilité

Les outils disponibles dépendent des paquets inclus dans l’image MiniOS. Vérifiez un système live en cours d’exécution avec `dpkg-query`, ou examinez les modules de l’image et les [listes de paquets](/reference/Package-and-Edition-Contents).

Une installation native conserve l’expérience familière du bureau MiniOS — son identité visuelle, l’environnement de bureau sélectionné et les applications courantes — mais elle ne conserve pas les logiciels de gestion spécifiques à MiniOS conçus pour l’architecture live. Les sessions, modules `.sb`, gestion modulaire des noyaux et autres flux de travail similaires ne s’appliquent plus, donc le système installé utilise à la place les outils Debian classiques pour les paquets, noyaux, la configuration et le chargeur d’amorçage.

## Outils graphiques

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Modifier les paramètres de démarrage et de nouvelle session de MiniOS | **Configurateur MiniOS** | Pour le modèle de configuration live MiniOS. Il écrit les paramètres pour un prochain démarrage live et ne reconfigure pas immédiatement le système en cours d’exécution. | [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Déployer MiniOS sur un autre disque | **Programme d’installation MiniOS** | S’exécute depuis une session live MiniOS. Le mode live conserve l’environnement live complet MiniOS; le mode natif crée un bureau Debian classique et supprime les logiciels spécifiques à MiniOS destinés au fonctionnement live. | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) |
| Créer, sélectionner, redimensionner, sauvegarder ou supprimer des sessions persistantes | **Gestionnaire de sessions MiniOS** | Réservé aux systèmes live MiniOS. | [Gestion des sessions](/using-minios/Sessions-and-Persistence) |
| Emballer, activer, inspecter ou supprimer des noyaux MiniOS | **Gestionnaire de noyaux MiniOS** | Réservé aux systèmes live modulaires MiniOS. | [Gestion des noyaux](/preparing-and-customizing/Managing-Kernels) |
| Installer des applications ou construire des modules d’application à partir de recettes du catalogue | **Boutique d’applications MiniOS** | Systèmes live MiniOS. Choisissez l’installation par module ou directe sur le système ; la persistance détermine si les modifications directes survivent au redémarrage. | [Boutique d’applications MiniOS](/using-minios/Installing-Software) |
| Remasteriser une image MiniOS existante via un projet guidé | **Créateur d’images MiniOS** | Fonctionne avec le contenu d’image live MiniOS depuis la session live en cours, une ISO ou un support optique. Il crée une nouvelle ISO live. | [Créateur d’images MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspecter, créer, activer et sélectionner des modules `.sb` | **Gestionnaire de modules MiniOS** | Réservé aux systèmes live MiniOS; la composition des modules et leur activation à l’exécution dépendent du modèle de racine superposée `.sb`. | [Gestionnaire de modules MiniOS](/preparing-and-customizing/Managing-Modules) |
| Écrire une ISO MiniOS sur une clé USB | **Utilitaire de disque** | Outil générique de gestion d’images disque inclus avec MiniOS. Il écrit des supports amorçables ; il ne réalise pas de déploiement géré comme le Programme d’installation MiniOS. | [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) |
| Consulter la documentation installée hors ligne | **Aide MiniOS** | Lit la documentation embarquée sans connexion réseau requise. | [Documentation MiniOS](/) |

## Outils en ligne de commande

La plupart des outils graphiques disposent d'un équivalent ou d'un backend en ligne de commande. Ces commandes sont fournies soit dans le même paquet que l'application graphique, soit dans un paquet compagnon requis. Le manifeste de base partagé inclut `minios-tools` et `minios-image-compose`. Les autres commandes dépendent de la disponibilité de leurs paquets graphiques correspondants. Leur présence sur un système ou une image installée doit toujours être vérifiée directement.

### Déploiement et sessions

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lister les disques cibles, prévisualiser un plan de déploiement ou installer MiniOS de manière non interactive | **`minios-deploy`** | S’exécute depuis une session live MiniOS. L’installation nécessite les droits administrateur et une confirmation explicite ; le mode natif, lorsqu’il est pris en charge, crée un bureau Debian classique à partir de l’image sélectionnée. | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Créer, activer, sauvegarder, redimensionner, exporter, importer ou supprimer des sessions persistantes | **`minios-session`** | Nécessite les droits administrateur et un système live MiniOS avec un stockage de persistance compatible. | [Gestion des sessions](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Noyaux et images

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lister, emballer, activer, inspecter ou supprimer des noyaux | **`minios-kernel`** | Nécessite les droits administrateur et une installation live modulaire MiniOS avec une racine MiniOS accessible en écriture. | [Gestion des noyaux](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Remasteriser un arbre de contenu MiniOS existant à partir de scripts ou d’automatisation | **`minios-image-compose`** | Opère sur le contenu d’image live MiniOS et publie une ISO amorçable. | [Composer des images ISO en ligne de commande](/preparing-and-customizing/Creating-Custom-MiniOS-Images); `man minios-image-compose` |

### Flux de travail des modules

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Inspecter les modules et gérer les ensembles de modules actifs ou au prochain démarrage | **`sb`** | L’inspection des modules fonctionne aussi en dehors d’une session MiniOS en cours. Les opérations sur le système actif ou au prochain démarrage nécessitent une disposition modulaire MiniOS ; les modifications requièrent les droits administrateur. | [Créer des modules](/preparing-and-customizing/Managing-Modules); `man sb` |
| Construire un module à partir de paquets du dépôt ou de fichiers locaux `.deb` | **`apt2sb`** | Nécessite les droits administrateur et une session live MiniOS prise en charge. Les paquets sont installés dans un environnement de construction isolé, pas dans la racine en cours d’exécution. | [Créer des modules](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Construire un module en exécutant un script d’installation | **`script2sb`** | Nécessite les droits administrateur et une session live MiniOS prise en charge. Le script s’exécute sans interaction dans un environnement de construction isolé. | [Créer des modules](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Construire un module de façon interactive dans un environnement préparé | **`chroot2sb`** | Nécessite les droits administrateur et une session live MiniOS prise en charge. À utiliser lorsque l’installation nécessite des confirmations ou des modifications manuelles. | [Créer des modules](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convertir entre un arbre de répertoires et un module `.sb` | **`dir2sb`**, **`sb2dir`** | La conversion standard ne nécessite pas les droits administrateur et peut être utilisée hors session live si les outils et fichiers requis sont disponibles. | [Créer](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) ou [extraire](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) un module ; `man dir2sb`, `man sb2dir` |
| Capturer les modifications éligibles de la couche session accessible en écriture dans un module | **`savechanges`** | Nécessite les droits administrateur et une session live MiniOS en cours avec un backend de couche en écriture pris en charge. | [Créer des modules](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Flux de travail du stockage

| Tâche | Outil | Portée | Documentation |
|---|---|---|---|
| Lire ou écrire des images disque, formater un périphérique ou écraser un périphérique | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Opérations génériques sur les disques. L’écriture, le formatage et l’effacement sont destructifs et nécessitent généralement les droits administrateur. | [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Pour modifier les listes de paquets sources, les noyaux, les artefacts de démarrage ou toute la chaîne de modules, utilisez plutôt le système de construction source que les outils de remasterisation d’image. Voir [Compilation de MiniOS](/development/Building-MiniOS).
