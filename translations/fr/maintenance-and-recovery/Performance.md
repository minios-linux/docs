---
updated: 2026-09-13
---

# Performance

L’optimisation des performances dans MiniOS consiste principalement à trouver un équilibre entre le temps de démarrage, l’utilisation de RAM, les accès en lecture pendant l’exécution, la surcharge de la persistance et la durabilité du stockage. Pour les détails précis sur les options et les limites de sécurité, consultez [Modes de démarrage](/using-minios/Boot-Modes), [Chargement des modules initrd](/reference/boot-process/Module-Loading), et [Persistance initrd](/reference/boot-process/Persistence-Internals).

## Paramètres de démarrage pour la performance

Les paramètres de démarrage permettent de déplacer le travail d’initialisation et les lectures du système actif entre RAM et le périphérique source. Consultez [Paramètres de démarrage](/reference/Boot-Parameters) pour la référence complète.

### Chargement du système dans RAM (`toram`)

`toram` peut réduire la latence à l’exécution depuis un périphérique USB lent ou une image ISO sur le réseau, au prix d’un démarrage plus long et d’une occupation mémoire RAM nettement supérieure. Le mode « Bare `toram` » effectue une copie complète. `toram=trim` consomme généralement moins de RAM, mais sa copie plus restreinte peut omettre des données ou modules nécessaires par la suite.

Prévoyez de l’espace pour la couche en écriture, les applications, les caches et zram, et non uniquement pour les fichiers de modules. Plus de RAM alloué à la copie live signifie moins de ressources disponibles pour la charge de travail. Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour les contraintes de durabilité de la copie et de retrait du support.

### Filtrage des modules (`load` et `noload`)

Le filtrage permet de réduire la quantité de données copiées et le nombre de couches montées, en particulier avec `toram=trim`. En contrepartie, le système est moins complet et le risque d’échec au démarrage ou à l’exécution augmente si une dépendance est omise. Vérifiez l’ensemble de modules obtenu ; la syntaxe de filtrage et les limitations des modules protégés sont définies dans [Chargement des modules initrd](/reference/boot-process/Module-Loading).

## Optimisation de la persistance

La persistance déplace les E/S de la couche en écriture du RAM temporaire vers le stockage ou un conteneur. Le choix du backend influe sur la latence, la compatibilité, la gestion de la capacité et la complexité de la récupération.

### Modes de persistance (`perchmode`)

- **`native`:** Évite la couche système de fichiers dans un fichier et constitue le choix le plus simple sur un système de fichiers POSIX adapté, mais n’est pas disponible sur les systèmes de fichiers qui ne préservent pas les métadonnées Linux requises.
- **`raw`:** Offre une capacité fixe prévisible et le comportement classique d’ext4, mais réserve la taille de son fichier et ne peut pas dépasser l’espace disponible sur le support sous-jacent.
- **`dynfilefs`:** Le backend FUSE/format-400 s’étend à la demande et prend en charge des supports autrement incompatibles, avec une complexité supplémentaire de mappage et de récupération.
- **`dynblk`:** Le backend bloc noyau format-1 présente un périphérique bloc classique tandis que la couche « thin `volumeNNN.db` » s’agrandit à la demande. Il évite les E/S FUSE, mais chaque périphérique attaché consomme une quantité fixe de mémoire pour les métadonnées et les écritures restent limitées par l’espace libre du système de fichiers sous-jacent et les limites d’admission dynblk.
- **`luks`:** Ajoute la confidentialité au prix d’un travail de déverrouillage et d’une surcharge liée au chiffrement.
- **`squashfs`:** Échange la compression lors de la sauvegarde et le travail d’extraction de RAM contre un instantané compact ; ce n’est pas un backend général en écriture à faible latence.

Testez les charges de travail représentatives sur le périphérique réel. Les différences de contrôleur flash, système de fichiers, pont USB et charge de travail sont plus fiables qu’un classement universel des modes de persistance.

## Configuration de ZRAM

Zram échange du temps CPU contre une capacité mémoire compressée et permet d’éviter le swap sur stockage, bien plus lent. Un périphérique zram plus grand peut absorber plus de pages inactives mais n’augmente pas la RAM physique ; les charges de travail incompressibles consomment toujours de la mémoire.
Les algorithmes de compression équilibrent le débit et l’utilisation CPU face au taux de compression, et leur disponibilité dépend du noyau. Commencez avec la valeur par défaut et ne changez `zramsize`, `zramcomp` ou `nozram` que pour une charge de travail mesurée ; voir [Paramètres de démarrage](/reference/Boot-Parameters) pour les valeurs acceptées.

## Système de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel élevé réduit le temps de copie des gros modules, tandis qu’une faible latence en accès aléatoire est plus importante pour les charges de travail persistantes sur le bureau.
  Mesurez le périphérique et son boîtier ensemble ; la génération USB seule ne prédit pas les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif permet d’utiliser la persistance native sans la surcharge d’un conteneur. Les systèmes de fichiers multiplateformes améliorent la portabilité mais nécessitent un backend de conteneur compatible pour les métadonnées Linux, ajoutant des couches de mappage et de système de fichiers. Choisissez en fonction des besoins de portabilité, de récupération et des résultats de tests de performance.
