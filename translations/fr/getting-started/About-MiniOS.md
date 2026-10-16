---
updated: 2026-08-31
---

# À propos de MiniOS

MiniOS est une distribution Linux basée sur Debian, conçue principalement comme système d’exploitation portable. Elle peut être exécutée depuis un support amovible ou un disque local, tout en gardant le système d’exploitation, les applications et l’environnement utilisateur indépendants de tout ordinateur en particulier.

Une installation classique sur ordinateur de bureau finit progressivement par être liée à la machine sur laquelle elle a été installée. MiniOS adopte une approche différente : l’environnement de travail peut accompagner l’utilisateur et passer d’un ordinateur compatible à un autre.
Les paramètres, les fichiers, les logiciels installés et les sessions persistantes peuvent suivre le système au lieu de rester sur un disque interne.

MiniOS ne se limite donc pas à un environnement live temporaire. Son objectif est de fournir un système Linux portable complet, adapté à une utilisation quotidienne, à la maintenance, à la récupération, à l’expérimentation et à des tâches spécialisées.

## Ce qui distingue MiniOS

### Conçu pour être portable

MiniOS repose sur une idée simple : **le système d’exploitation doit appartenir à l’utilisateur, et non à l’appareil sur lequel il fonctionne**.

L’ordinateur fournit le processeur, la mémoire, l’écran, les interfaces de stockage et les périphériques. L’environnement MiniOS peut rester sur le support de l’utilisateur et démarrer sur différents matériels. L’ordinateur devient ainsi l’endroit où le système fonctionne aujourd’hui, plutôt que celui auquel il appartient définitivement.

### Conçu de façon modulaire

MiniOS est composé de modules SquashFS distincts, en lecture seule, plutôt que d’une grande image système modifiable. Le système de base, le noyau, les firmwares, l’environnement de bureau, les applications et les logiciels supplémentaires peuvent rester organisés en couches distinctes.

Les modifications de l’utilisateur peuvent être stockées indépendamment de ces modules de base. Il est ainsi possible d’ajouter, de remplacer, de désactiver ou de tester des éléments du système sans réécrire tout le système d’exploitation. Il est également plus facile de revenir à un état de base connu si une expérimentation ne se déroule pas comme prévu.

La modularité permet également à différentes éditions de MiniOS et à des systèmes personnalisés de partager la même architecture, plutôt que de devenir des produits sans lien entre eux.

### Compact sans sacrifier la simplicité d’utilisation

Le nom **MiniOS** reflète un objectif important du projet : garder le système aussi compact que raisonnablement possible. Mais cette compacité ne doit pas rendre le système peu pratique, fragile ou limité à un usage restreint.

Il est facile de créer une image live très compacte en supprimant le firmware, la localisation, la prise en charge des systèmes de fichiers, la persistance, l’intégration au bureau, les outils de récupération et les applications. Un système d’exploitation portable répond à une autre problématique : il doit rester utile même lorsqu’il est démarré sur un matériel inconnu au moment de la création de l’image.

MiniOS vise donc la **taille minimale qui reste pratique, tout en préservant le maximum raisonnable de confort d’utilisation, de compatibilité matérielle et de fonctionnalités**. Un composant n’est pas supprimé simplement parce qu’il augmente la taille de l’ISO ; la question essentielle est de savoir si l’espace qu’il occupe apporte une valeur pratique suffisante.

C’est pourquoi certaines éditions MiniOS sont plus volumineuses que leur nom ne le laisse supposer.
Cette taille supplémentaire est délibérée lorsqu’elle améliore le confort d’utilisation au quotidien ou permet d’utiliser le même système portable sur une plus grande variété d’ordinateurs. Les utilisateurs qui ont besoin d’un système plus compact peuvent choisir une édition plus légère ou un ensemble de modules réduit, tandis que ceux qui ont besoin d’un poste de travail complet peuvent conserver davantage de fonctionnalités.

### Debian, pas un écosystème à part

MiniOS est basé sur Debian et reste délibérément intégré à l’écosystème Debian.
Il utilise les paquets Debian habituels, APT, les services standard et les conventions Linux familières. Des composants propres à MiniOS sont ajoutés lorsque le fonctionnement d’un système modulaire portable exige des capacités absentes d’une installation classique.

Le projet privilégie les mécanismes Linux éprouvés lorsqu’ils répondent déjà au besoin, plutôt que de les remplacer par des équivalents propres à MiniOS.

### Transparent et adaptable

MiniOS cherche à automatiser les tâches courantes sans masquer la structure du système. L’utilisateur peut se contenter des outils graphiques et des images prêtes à l’emploi, mais il peut aussi examiner et reconfigurer le système, l’enrichir avec des modules ou le reconstruire pour un usage spécialisé.

Ainsi, MiniOS peut répondre à différents besoins sans se diviser en produits sans lien entre eux. Un bureau portable léger, une boîte à outils de récupération et un poste de travail plus complet peuvent reposer sur le même modèle et se distinguer principalement par les modules et les applications qu’ils intègrent.

## Fonctionnement de MiniOS

Au démarrage, MiniOS assemble les modules SquashFS en lecture seule pour former un système de fichiers racine actif, puis ajoute une couche inscriptible pour la session en cours. Sans persistance, les modifications apportées à cette couche sont temporaires. Avec la persistance, certaines modifications peuvent être conservées après un redémarrage, tandis que les modules de base restent séparés.

Le système live modulaire n’est pas simplement une option d’installation : **c’est le modèle MiniOS qui le définit**. Les modules MiniOS, les sessions persistantes, la configuration au démarrage, la gestion modulaire du noyau, la composition d’images et les applications de gestion MiniOS sont conçus pour cette architecture live.

Le Programme d’installation MiniOS propose également une **installation native** pour les utilisateurs qui préfèrent un système de bureau classique avec un système de fichiers racine inscriptible. L’installation native conserve l’expérience de bureau MiniOS familière — l’environnement de bureau choisi, l’identité visuelle et les applications courantes — mais abandonne le modèle live modulaire : les sessions MiniOS, `.sb`les flux de travail liés aux modules, la gestion modulaire du noyau et les utilitaires propres à MiniOS, conçus pour le fonctionnement en mode live, sont supprimés. Le système installé est alors géré comme un bureau Debian classique avec APT, les paquets Debian du noyau, un initramfs standard et le chargeur d’amorçage installé.

Pour en savoir plus sur les aspects techniques, consultez [l’architecture du système MiniOS](/reference/System-Architecture).
Pour en savoir plus sur le comportement des sessions et les options de stockage visibles par l’utilisateur, consultez [les modes de démarrage](/using-minios/Boot-Modes) et [la gestion des sessions](/using-minios/Sessions-and-Persistence).

## Éditions

Les éditions MiniOS sont différentes configurations d’une même architecture, et non des systèmes d’exploitation distincts.

| Édition | Usage |
|---|---|
| **Standard** | Système Xfce minimal offrant les fonctions de base pour une utilisation quotidienne ; recommandé à la plupart des utilisateurs |
| **Toolbox** | Administration système et diagnostic pour les professionnels de l’informatique et la récupération du système |
| **Ultra** | Bureau complet avec un large éventail d’applications et d’outils professionnels pour la création et le développement |
| **Flux** | Édition Fluxbox ultralégère, conçue pour consommer très peu de ressources et adaptée aux anciens ordinateurs ; déconseillée aux débutants |

La disponibilité exacte des environnements de bureau et des paquets dépend de la version et de la plateforme cible. Pour connaître la sélection de paquets maintenue et les relations entre les éditions, consultez [Paquets et éditions](/reference/Package-and-Edition-Contents). Pour découvrir les outils spécifiques à MiniOS disponibles dans le système, consultez [Applications et outils MiniOS](/using-minios/MiniOS-Applications).

## Pour continuer

- [Démarrage rapide](/getting-started/Quick-Start) — commencez à utiliser MiniOS.
- [Applications et outils MiniOS](/using-minios/MiniOS-Applications) — découvrez les utilitaires inclus de MiniOS.
- [Architecture système MiniOS](/reference/System-Architecture) — découvrez plus en détail le fonctionnement des modules, des sessions et du démarrage.
- [Paquets et éditions](/reference/Package-and-Edition-Contents) — comparez le contenu des éditions maintenues.

Ressources du projet :

- [Site web MiniOS](https://minios.dev)
- [Code source](https://github.com/minios-linux/minios-live)
- [Suivi des problèmes](https://github.com/minios-linux/minios-live/issues)
