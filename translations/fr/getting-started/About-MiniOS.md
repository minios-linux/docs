---
updated: 2026-08-31
---

# À propos de MiniOS

MiniOS est une distribution Linux basée sur Debian, conçue principalement comme un système d'exploitation portable. Elle peut fonctionner à partir d'un support amovible ou d'un disque local, tout en gardant le système d'exploitation, les applications et l'environnement utilisateur indépendants de tout ordinateur particulier.

Une installation de bureau classique devient progressivement liée à la machine sur laquelle elle a été installée. MiniOS adopte une approche différente : l'environnement de travail reste avec l'utilisateur et peut être déplacé entre des ordinateurs compatibles.
Les paramètres, fichiers, logiciels installés et sessions persistantes peuvent voyager avec le système au lieu de rester sur un seul disque interne.

MiniOS est donc conçu pour être bien plus qu'un environnement live temporaire. Son objectif est de fournir un système Linux portable complet, adapté au travail quotidien, à la maintenance, à la récupération, à l'expérimentation et à des tâches spécialisées.

## Qu'est-ce qui différencie MiniOS

### Portable par conception

MiniOS repose sur une idée simple : **le système d'exploitation doit appartenir à l'utilisateur, et non à l'appareil sur lequel il s'exécute**.

L'ordinateur fournit le processeur, la mémoire, l'affichage, les interfaces de stockage et les périphériques. L'environnement MiniOS peut rester sur le support de l'utilisateur et être démarré sur différents matériels. Ainsi, l'ordinateur devient simplement l'endroit où le système fonctionne aujourd'hui, et non celui auquel il appartient définitivement.

### Modulaire par conception

MiniOS est assemblé à partir de modules SquashFS en lecture seule distincts, plutôt qu'à partir d'une seule grande image système modifiable. Le système de base, le noyau, le firmware, l'environnement de bureau, les applications et les logiciels additionnels restent des couches séparées.

Les modifications utilisateur peuvent être stockées indépendamment de ces modules de base. Cela permet d'ajouter, de remplacer, de désactiver ou de tester des parties du système sans réécrire l'ensemble du système d'exploitation, et facilite le retour à un état de base connu lorsqu'une expérimentation ne fonctionne pas comme prévu.

La modularité permet également à différentes éditions MiniOS et à des systèmes personnalisés de partager la même architecture, au lieu de devenir des produits distincts.

### Petit sans sacrifier la commodité

Le nom **MiniOS** reflète un objectif important du projet : garder le système aussi compact que raisonnablement possible. Mais la taille n'est pas recherchée au détriment de la convivialité, de la robustesse ou de l'utilité du système.

Il est facile de produire une image live très petite en supprimant le firmware, la localisation, la prise en charge des systèmes de fichiers, la persistance, l'intégration du bureau, les outils de récupération et les applications. Un système d'exploitation portable fait face à un autre défi : il doit rester utile lorsqu'il démarre sur un matériel inconnu lors de la création de l'image.

MiniOS vise donc la **taille la plus réduite possible tout en préservant la commodité, la compatibilité matérielle et la fonctionnalité**. Un composant n'est pas supprimé uniquement parce qu'il augmente la taille de l'ISO ; la question essentielle est de savoir si l'espace utilisé apporte une valeur pratique suffisante.

C'est pourquoi certaines éditions MiniOS sont plus volumineuses que ce que le nom pourrait laisser penser.
Cette taille supplémentaire est volontaire lorsqu'elle améliore l'utilisation quotidienne ou rend le même système portable utile sur un plus grand nombre d'ordinateurs. Les utilisateurs qui ont besoin d'un système plus léger peuvent choisir une édition allégée ou un ensemble de modules réduit, tandis que ceux qui souhaitent un poste de travail complet peuvent conserver davantage de fonctionnalités.

### Debian, pas un écosystème séparé

MiniOS est basé sur Debian et fait délibérément partie de l'écosystème Debian.
Il utilise les paquets Debian standards, APT, les services classiques et les conventions Linux habituelles. L'infrastructure spécifique à MiniOS est ajoutée uniquement là où un système modulaire et portable nécessite un comportement qu'une installation traditionnelle ne fournit pas.

Le projet privilégie les mécanismes Linux éprouvés lorsqu'ils répondent déjà au besoin, au lieu de les remplacer par des équivalents spécifiques à MiniOS.

### Transparent et adaptable

MiniOS cherche à automatiser les tâches courantes sans masquer la structure du système. L'utilisateur peut se limiter aux outils graphiques et aux images prêtes à l'emploi, mais le même système peut aussi être inspecté, reconfiguré, étendu par des modules ou reconstruit pour un usage spécialisé.

Cela permet à MiniOS de répondre à différents besoins sans se diviser en produits distincts. Un bureau portable léger, une trousse de secours ou une station de travail complète peuvent utiliser le même modèle sous-jacent et ne différer que par les modules et applications inclus.

## Fonctionnement de MiniOS

Au démarrage, MiniOS combine les modules SquashFS en lecture seule dans un unique système de fichiers racine en cours d’exécution, puis ajoute une couche en écriture pour la session en cours. Sans persistance, cet état modifiable est temporaire. Avec la persistance, certains changements sélectionnés peuvent survivre à un redémarrage tandis que les modules de base restent séparés.

Le système live modulaire n’est pas simplement une option d’installation : **c’est le modèle MiniOS qui le définit**. Les modules MiniOS, les sessions persistantes, la configuration au démarrage, la gestion modulaire du noyau, la composition d’images et les applications de gestion MiniOS sont toutes conçues autour de cette architecture live.

Le Programme d’installation MiniOS propose également une installation **native** pour les utilisateurs qui préfèrent un système de bureau classique sur un système de fichiers racine en écriture. L’installation native conserve l’expérience familière du bureau MiniOS — son environnement de bureau sélectionné, son identité visuelle et ses applications habituelles — mais quitte le modèle live modulaire : les sessions MiniOS, les workflows de modules `.sb`, la gestion modulaire du noyau et les utilitaires spécifiques à MiniOS conçus pour le fonctionnement live sont supprimés. Le système installé est alors maintenu comme un bureau Debian classique avec APT, les paquets du noyau Debian, un initramfs standard et le chargeur d’amorçage installé.

Pour plus de détails techniques, consultez [architecture système MiniOS](/reference/System-Architecture).
Pour le comportement des sessions visible par l’utilisateur et les choix de stockage, consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Éditions

Les éditions MiniOS sont différentes configurations d'une même architecture, et non des systèmes d'exploitation séparés.

| Édition | Objectif |
|---|---|
| **Standard** | Système Xfce minimal avec les fonctionnalités de base pour l'informatique quotidienne ; recommandé pour la plupart des utilisateurs |
| **Toolbox** | Administration système et diagnostic pour les professionnels de l'informatique et la récupération de systèmes |
| **Ultra** | Bureau complet avec un large éventail d'applications et d'outils professionnels pour la créativité et le développement |
| **Flux** | Édition Fluxbox ultra-légère pour une utilisation minimale des ressources et du matériel ancien ; non recommandée pour les débutants |

La disponibilité exacte des environnements de bureau et des paquets dépend de la version et de la plateforme cible. Pour la sélection des paquets maintenus et les relations entre éditions, consultez [Paquets et éditions](/reference/Package-and-Edition-Contents). Pour les outils spécifiques à MiniOS disponibles dans le système, voir [Applications et outils MiniOS](/using-minios/MiniOS-Applications).

## Prochaines étapes

- [Démarrage rapide](/getting-started/Quick-Start) — commencez à utiliser MiniOS.
- [Applications et outils MiniOS](/using-minios/MiniOS-Applications) — découvrez les utilitaires MiniOS inclus.
- [Architecture système MiniOS](/reference/System-Architecture) — comprenez en détail le modèle des modules, des sessions et du démarrage.
- [Paquets et éditions](/reference/Package-and-Edition-Contents) — comparez le contenu des éditions maintenues.

Ressources du projet :

- [Site web MiniOS](https://minios.dev)
- [Code source](https://github.com/minios-linux/minios-live)
- [Gestionnaire de tickets](https://github.com/minios-linux/minios-live/issues)
