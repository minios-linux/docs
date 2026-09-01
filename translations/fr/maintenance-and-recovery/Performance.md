---
updated: 2026-08-26
---

# Performance

L’optimisation des performances dans MiniOS consiste principalement à trouver un équilibre entre le temps de démarrage, l’utilisation de la RAM, les lectures en cours d’exécution, la surcharge de la persistance et la durabilité du stockage. Pour connaître la signification exacte des options et les limites de sécurité, consultez [Modes de démarrage](/using-minios/Boot-Modes), [Chargement des modules Initrd](/reference/boot-process/Module-Loading) et [Persistance Initrd](/reference/boot-process/Persistence-Internals).

## Paramètres de démarrage pour les performances

Les paramètres de démarrage permettent de déplacer le travail de démarrage et les lectures du système en direct entre la RAM et le périphérique source. Consultez [Paramètres de démarrage](/reference/Boot-Parameters) pour la référence complète.

### Chargement du système en RAM (`toram`)

`toram` peut réduire la latence à l’exécution depuis un périphérique USB lent ou une image ISO sur le réseau, au prix d’un démarrage plus long et d’une occupation nettement plus importante de la RAM. Un `toram` simple utilise la méthode de copie complète. `toram=trim` consomme généralement moins de RAM, mais sa copie plus restreinte peut omettre des données ou modules nécessaires ultérieurement.

Prévoyez de l’espace pour la couche en écriture, les applications, les caches et zram, plutôt que de dimensionner uniquement pour les fichiers de modules. Plus de RAM attribuée à la copie en direct signifie moins de ressources disponibles pour la charge de travail. Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour la durabilité de la copie et les contraintes liées au retrait du support.

### Filtrage des modules (`load` et `noload`)

Le filtrage peut réduire la quantité de données copiées et de couches montées, en particulier avec `toram=trim`. Cela se fait au détriment de la capacité du système et augmente le risque d’échec au démarrage ou à l’exécution si une dépendance est omise. Vérifiez l’ensemble des modules résultant ; la syntaxe de filtrage et les limitations des modules protégés sont définies dans [Chargement des modules Initrd](/reference/boot-process/Module-Loading).

## Optimisation de la persistance

La persistance déplace les E/S de la couche en écriture de la RAM temporaire vers un stockage ou un conteneur. Le choix du backend influe sur la latence, la compatibilité, la gestion de la capacité et la complexité de la récupération.

### Modes de persistance (`perchmode`)

- **`native` :** Évite une couche de système de fichiers dans un fichier et constitue le choix le plus simple sur un système de fichiers POSIX adapté, mais n’est pas disponible sur les systèmes de fichiers qui ne peuvent pas préserver les métadonnées Linux requises.
- **`raw` :** Offre une capacité fixe prévisible et un comportement ext4 classique, mais réserve la taille de son fichier et ne peut pas dépasser l’espace de stockage disponible en arrière-plan.
- **`dynfilefs` :** S’étend à la demande et prend en charge des supports autrement inadaptés, avec une complexité supplémentaire de mappage et de récupération.
- **`luks` :** Ajoute la confidentialité au prix d’un travail de déverrouillage et d’une surcharge liée au chiffrement.
- **`squashfs` :** Échange la compression à la sauvegarde et le travail d’extraction de la RAM contre un instantané compact ; il ne s’agit pas d’un backend général à faible latence en écriture.

Évaluez les charges de travail représentatives sur le périphérique réel. Les différences de contrôleur flash, de système de fichiers, de pont USB et de charge de travail sont plus fiables qu’un classement universel des modes de persistance.

## Configuration de ZRAM

Zram échange du temps processeur contre une capacité mémoire compressée et permet d’éviter le swap sur stockage, bien plus lent. Un périphérique zram plus grand peut absorber davantage de pages inactives, mais ne crée pas de RAM physique ; les charges de travail incompressibles consomment toujours de la mémoire.
Les algorithmes de compression équilibrent le débit et l’utilisation CPU par rapport au taux de compression, et leur disponibilité dépend du noyau. Commencez avec la valeur par défaut et ne modifiez `zramsize`, `zramcomp` ou `nozram` que pour une charge de travail mesurée ; consultez [Paramètres de démarrage](/reference/Boot-Parameters) pour les valeurs acceptées.

## Système de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel plus élevé réduit le temps de copie de gros modules, tandis qu’une faible latence d’E/S aléatoire est plus importante pour les charges de travail bureautiques persistantes.
  Mesurez le périphérique et son boîtier ensemble ; la génération USB seule ne prédit pas les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif permet d’utiliser la persistance native sans la surcharge d’un conteneur. Les systèmes de fichiers multiplateformes améliorent la portabilité mais nécessitent un backend de conteneur compatible pour les métadonnées Linux, ajoutant des couches de mappage et de système de fichiers. Choisissez en fonction des besoins de portabilité, de récupération ainsi que des résultats de tests de performance.
