---
updated: 2026-08-26
---

# Optimisation des performances

L’optimisation des performances dans MiniOS consiste principalement à trouver un équilibre entre le temps de démarrage, l’utilisation de la RAM, les lectures en temps réel, la surcharge de la persistance et la durabilité du stockage. Pour connaître la signification exacte des options et leurs limites de sécurité, consultez [Modes de démarrage](/configuration/Boot-Modes.md), [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md).

## Paramètres de démarrage pour les performances

Les paramètres de démarrage permettent de déplacer le travail de démarrage et les lectures du système en direct entre la RAM et le périphérique source. Consultez [Paramètres de démarrage](/configuration/Boot-Parameters.md) pour la référence complète.

### Chargement du système en RAM (`toram`)

`toram` peut réduire la latence d’exécution sur un périphérique USB lent ou une image ISO hébergée sur le réseau, au prix d’un démarrage plus long et d’une occupation RAM nettement supérieure. Un simple `toram` utilise la méthode de copie complète. `toram=trim` consomme généralement moins de RAM, mais sa copie plus restreinte peut omettre des données ou modules nécessaires par la suite.

Prévoyez de l’espace pour la couche en écriture, les applications, les caches et zram, plutôt que de dimensionner uniquement pour les fichiers de modules. Plus la copie en direct occupe de RAM, moins il en reste pour la charge de travail. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) pour les contraintes de durabilité de la copie et de retrait du support.

### Filtrage des modules (`load` et `noload`)

Le filtrage peut réduire la quantité de données copiées et de couches montées, en particulier avec `toram=trim`. Cela se fait au détriment des capacités du système et augmente le risque d’échec au démarrage ou à l’exécution si une dépendance est omise. Vérifiez l’ensemble des modules résultant ; la syntaxe de filtrage et les limitations des modules protégés sont définies dans [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md).

## Optimisation de la persistance

La persistance déplace les entrées/sorties de la couche en écriture de la RAM temporaire vers le stockage ou un conteneur. Le choix du backend influe sur la latence, la compatibilité, la gestion de la capacité et la complexité de la récupération.

### Modes de persistance (`perchmode`)

- **`native` :** Évite une couche de système de fichiers dans un fichier et constitue le choix le plus simple sur un système de fichiers POSIX adapté, mais n’est pas disponible sur les systèmes de fichiers qui ne peuvent pas préserver les métadonnées Linux requises.
- **`raw` :** Offre une capacité fixe prévisible et un comportement ext4 classique, mais réserve la taille de son fichier et ne peut pas dépasser l’espace de stockage disponible.
- **`dynfilefs` :** S’étend à la demande et prend en charge des supports autrement incompatibles, avec une complexité supplémentaire de mappage et de récupération.
- **`luks` :** Ajoute la confidentialité au prix d’un travail de déverrouillage et d’une surcharge liée au chiffrement.
- **`squashfs` :** Échange la compression lors de la sauvegarde et le travail d’extraction en RAM contre un instantané compact ; ce n’est pas un backend général en écriture à faible latence.

Évaluez les charges de travail représentatives sur le périphérique réel. Les différences de contrôleur flash, de système de fichiers, de pont USB et de charge de travail sont plus déterminantes qu’un classement universel des modes de persistance.

## Configuration de ZRAM

Zram échange du temps CPU contre une capacité mémoire compressée et permet d’éviter un swap beaucoup plus lent sur stockage. Un périphérique zram plus grand peut absorber davantage de pages inactives mais ne crée pas de RAM physique ; les charges de travail incompressibles consomment toujours de la mémoire. Les algorithmes de compression équilibrent le débit et l’utilisation CPU avec le taux de compression, et leur disponibilité dépend du noyau. Commencez avec la configuration par défaut et ne modifiez `zramsize`, `zramcomp` ou `nozram` que pour une charge de travail mesurée ; consultez [Paramètres de démarrage](/configuration/Boot-Parameters.md) pour les valeurs acceptées.

## Système de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel plus élevé réduit le temps de copie des gros modules, tandis qu’une faible latence en I/O aléatoire est plus importante pour les charges de travail persistantes sur le bureau. Mesurez le périphérique et son boîtier ensemble ; la génération USB seule ne prédit pas les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif permet d’utiliser la persistance native sans la surcharge d’un conteneur. Les systèmes de fichiers multiplateformes améliorent la portabilité mais nécessitent un backend de conteneur compatible pour les métadonnées Linux, ajoutant des couches de mappage et de système de fichiers. Choisissez en fonction des besoins de portabilité et de récupération ainsi que des résultats de tests de performance.
