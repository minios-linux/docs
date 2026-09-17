---
updated: 2026-09-17
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

- **`native`:** Stocke la couche modifiable directement sous forme de fichiers ordinaires. Ce mode offre le moins de surcoût lié au conteneur et n’impose pas de taille fixe, mais nécessite un système de fichiers sous-jacent capable de préserver les métadonnées Linux et les opérations requises par MiniOS.
- **`raw`:** Utilise une image ext4 à capacité fixe. La taille du fichier est définie selon la capacité demandée et l’extension doit être explicite, ce qui le rend simple et prévisible mais sans la flexibilité de capacité des backends dynamiques. FAT32 limite l’image unique à 4000 Mio.
- **`dynfilefs`:** Le backend FUSE/format-400 étend le stockage des données à la demande et prend en charge des supports autrement inadaptés. Son index n’est pas clairsemé : chaque bloc logique de 4 Kio déclaré nécessite un offset de 8 octets, donc la capacité logique coûte environ 2 Mio de RAM et environ 2 Mio d’index de stockage par Gio, même si la charge utile est vide. Cela rend les capacités modérées efficaces, mais les grandes capacités fines coûteuses dès le départ.
- **`dynblk`:** Le backend format-1 `DBSPRS01` du noyau conserve les tables de correspondance sur disque et un cache de métadonnées limité en RAM (par défaut 1 Mio). Remplir un périphérique existant n’alloue pas une carte résidente complète. Les descriptions d’étendue et les répertoires évoluent selon les parties déclarées ; le cache de fichiers et la mémoire du codec s’ajoutent.`dynblk limits --format dynblk` indique la limite de la géométrie ; `dynblk status /dev/dynblkN --json` affiche les tampons pris en compte et les statistiques du cache. Les réécritures brutes ordinaires restent en place ; les mises à jour compressées partielles recompressent actuellement un bloc de 64 Kio. Choisissez la politique de cache des pièces jointes avec soin : `unsafe` sacrifie les garanties de durabilité.
- **`squashfs`:** Stocke un instantané compressé et reconstruit la couche supérieure modifiable dans RAM à chaque démarrage. Ce mode minimise l’espace persistant pour les sessions majoritairement stables mais implique un coût CPU et RAM lors de la restauration, et réécrit l’instantané lors de l’enregistrement.

LUKS2 peut encapsuler Raw, DynFileFS ou DynBlk. Le chiffrement ajoute un surcoût lors du déverrouillage et du traitement cryptographique, tout en conservant la capacité et le comportement de stockage du backend sous-jacent.

Testez les charges de travail représentatives directement sur le périphérique concerné. Les différences de contrôleur flash, de système de fichiers, de pont USB, de chiffrement, de compression et de charge de travail sont plus déterminantes qu’un classement universel des modes de persistance.

## Configuration de ZRAM

Zram échange du temps CPU contre une capacité mémoire compressée et permet d’éviter le swap sur stockage, bien plus lent. Un périphérique zram plus grand peut absorber plus de pages inactives mais n’augmente pas la RAM physique ; les charges de travail incompressibles consomment toujours de la mémoire.
Les algorithmes de compression équilibrent le débit et l’utilisation CPU face au taux de compression, et leur disponibilité dépend du noyau. Commencez avec la valeur par défaut et ne changez `zramsize`, `zramcomp` ou `nozram` que pour une charge de travail mesurée ; voir [Paramètres de démarrage](/reference/Boot-Parameters) pour les valeurs acceptées.

## Système de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel élevé réduit le temps de copie des gros modules, tandis qu’une faible latence en accès aléatoire est plus importante pour les charges de travail persistantes sur le bureau.
  Mesurez le périphérique et son boîtier ensemble ; la génération USB seule ne prédit pas les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif permet d’utiliser la persistance native sans la surcharge d’un conteneur. Les systèmes de fichiers multiplateformes améliorent la portabilité mais nécessitent un backend de conteneur compatible pour les métadonnées Linux, ajoutant des couches de mappage et de système de fichiers. Choisissez en fonction des besoins de portabilité, de récupération et des résultats de tests de performance.
