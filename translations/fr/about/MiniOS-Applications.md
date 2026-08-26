---
updated: 2026-08-26
---

# Applications et outils MiniOS

MiniOS inclut des outils pour configurer, installer, maintenir et remasteriser
les systèmes MiniOS. Utilisez cette page pour choisir un outil, puis suivez le guide associé pour
connaître les prérequis, les limites de sécurité et les détails des commandes.

## Vérifier ce qui est installé

Les manifestes de paquets Xfce actuels incluent l'ensemble graphique dans les éditions Standard,
Toolbox et Ultra : Configurateur, Installateur, Gestionnaire de session, Gestionnaire de noyau,
Store, Générateur d'image, Gestionnaire de modules, Aide MiniOS et Utilitaire de disque.
L’édition Flux n’inclut pas cet ensemble graphique, et les constructions utilisant d’autres environnements de bureau
ou console peuvent ne pas l’inclure. La sélection conditionnelle des paquets varie également
en fonction de la suite de distribution et des options de construction.

L’ensemble de paquets installé ou l’image finale fait foi. Vérifiez un système en cours d’exécution avec `dpkg-query`, ou inspectez les modules d’image et les manifestes comme décrit dans [Paquets et éditions](/administration/Packages.md).

## Choisir un outil graphique

| Tâche | Outil | Applicabilité live et native | Documentation |
|---|---|---|---|
| Modifier les paramètres MiniOS au démarrage et lors de nouvelles sessions | **MiniOS Configurator** | Pour le modèle de configuration live de MiniOS. Il écrit les paramètres pour un prochain démarrage live et ne reconfigure pas immédiatement le système en cours d’exécution. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| Déployer MiniOS sur un autre disque | **MiniOS Installer** | À lancer depuis une session live MiniOS. Il peut créer soit une installation live modulaire, soit une installation native classique si l’image prend en charge le déploiement natif. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Créer, sélectionner, redimensionner, sauvegarder ou supprimer des sessions persistantes | **MiniOS Session Manager** | Systèmes live uniquement. Les installations natives écrivent directement sur leur système de fichiers racine et n’utilisent pas les sessions live MiniOS. | [Gestion des sessions](/configuration/Session-Management.md) |
| Packager, activer, inspecter ou supprimer des noyaux MiniOS | **MiniOS Kernel Manager** | Conçu pour les installations live modulaires et leur dépôt de noyaux MiniOS. Utilisez le flux standard de paquets noyau de la distribution sur une installation native. | [Gestion des noyaux](/administration/Kernel-Management.md) |
| Installer des applications ou créer des modules d’application à partir de recettes du catalogue | **MiniOS Store** | Sur les systèmes live, choisissez entre installation de module ou installation directe sur le système ; la persistance détermine si les modifications directes survivent au redémarrage. Les installations natives utilisent le mode direct sur le système. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Remasteriser une image MiniOS existante via un projet guidé | **MiniOS Image Builder** | Fonctionne avec le contenu d’une image live MiniOS depuis la session live en cours, une ISO ou un média optique. Il crée une autre ISO live ; il ne maintient pas une installation native ni ne remplace une construction source. | [MiniOS Image Builder](/development/Image-Builder.md) |
| Inspecter, créer, activer et sélectionner des modules `.sb` | **MiniOS Module Manager** | La composition des modules et l’activation à l’exécution sont des fonctionnalités des systèmes live. Les installations natives n’utilisent pas le modèle racine superposé `.sb`. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Lire la documentation MiniOS installée | **MiniOS Help** | Un lecteur de documentation locale. Il peut être utilisé partout où le paquet `minios-help` et son ensemble de documentation sont installés. | [Documentation MiniOS](/) |
| Écrire une ISO MiniOS sur une clé USB | **Drive Utility** | Peut être utilisé dans un système graphique live ou natif lorsqu’il est installé. Il écrit des supports amorçables ; il ne réalise pas de déploiement live ou natif comme MiniOS Installer. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Choisir un outil en ligne de commande

Le manifeste cœur partagé inclut actuellement `minios-tools` et
`minios-image-compose`, y compris dans l’édition Flux. Leur présence sur un système ou une image installée doit néanmoins être vérifiée directement.

### Travailler avec les modules et les modifications de session

Utilisez les outils CLI MiniOS de base lorsque vous avez besoin d’un flux de travail modulaire scriptable :

- `sb` inspecte les modules et gère les ensembles de modules actifs et au prochain démarrage.
- `apt2sb`, `script2sb` et `chroot2sb` construisent des modules dans un environnement isolé.
- `dir2sb` et `sb2dir` convertissent entre des arborescences de répertoires et des modules `.sb`.
- `savechanges` capture les modifications éligibles d’une session live en écriture dans un module.
- `rmsbdir` supprime un répertoire d’extraction de module avec les vérifications de sécurité requises.

La plupart des opérations de construction, de capture, d’activation et de préparation au prochain démarrage dépendent d’une organisation modulaire live MiniOS.
La conversion et l’inspection de fichiers de base peuvent être utiles en dehors d’une session live en cours lorsque les outils et fichiers nécessaires sont disponibles.
Consultez [Créer des modules](/development/Creating-Modules.md) pour les droits, les règles de sortie et les flux de commandes actuels.

### Composer une ISO MiniOS

Utilisez `minios-image-compose` pour les scripts, l’automatisation ou un remastering reproductible en ligne de commande d’un arbre de contenu MiniOS existant. Il permet de sélectionner les modules,
d’appliquer la configuration d’image prise en charge, de capturer éventuellement les modifications compatibles d’une session live, de vérifier le résultat et de publier une ISO amorçable. Il agit sur le contenu d’image live MiniOS et ne convertit ni ne met à jour une installation native. Voir [Composer des images ISO MiniOS en ligne de commande](/development/Rebuilding-ISO.md).

Pour des modifications sur les listes de paquets sources, les noyaux, les artefacts de démarrage ou la chaîne complète des modules, utilisez le système de construction source plutôt que l’un ou l’autre des outils de remasterisation d’image. Voir [Construire MiniOS](/development/Building-MiniOS.md).
