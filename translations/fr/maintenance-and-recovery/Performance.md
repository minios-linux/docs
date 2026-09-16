---
updated: 2026-09-16
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

- **`native`:** Stocke la couche modifiable directement sous forme de fichiers ordinaires. Cela offre la plus faible surcharge de conteneur et aucune taille fixe, mais nécessite un système de fichiers sous-jacent capable de préserver les métadonnées et opérations Linux dont MiniOS a besoin.
- **`raw`:** Utilise une seule image ext4 à capacité fixe. Sa taille est définie selon la capacité demandée et son extension est explicite, ce qui la rend simple et prévisible, mais sans le comportement dynamique des backends à capacité variable. FAT32 limite la taille d'une image unique à 4000 Mio.
- **`dynfilefs`:** Le backend FUSE/format-400 étend le stockage des données à la demande et prend en charge des supports normalement incompatibles. Son index n'est pas creux : chaque bloc logique de 4 Kio déclaré nécessite un décalage de 8 octets, donc la capacité logique coûte environ 2 Mio de RAM et environ 2 Mio de stockage d'index par Gio, même si la charge utile est vide. Cela rend les capacités modérées efficaces, mais les grandes capacités dynamiques coûteuses dès le départ.
- **`dynblk`:** Le backend kernel block format-1 présente un périphérique bloc classique tandis que le stockage dynamique `volumeNNN.db` s'étend à la demande. Les mappages en temps réel sont creux et allouent un bloc de 4 Kio pour 128 blocs logiques, ainsi les données densément mappées consomment environ 8 Mio de RAM par Gio, mais la capacité virtuelle non allouée n'utilise aucun bloc de mappage. L'index interne fixe de l'arbre ne fait que 396 312 octets par périphérique attaché et les compteurs de références de pages sont creux. Le pilote, et non MiniOS, choisit le budget de mappage par défaut à environ 25 % de l'espace utilisable de RAM, plafonné à 4096 Mio. Cela favorise les grandes capacités creuses ; un volume rempli densément peut consommer plus de RAM par Gio que DynFileFS.
- **`squashfs`:** Stocke un instantané compressé et reconstruit la couche supérieure modifiable dans RAM à chaque démarrage. Cela minimise l'espace de stockage persistant pour des sessions généralement stables, mais entraîne des coûts CPU et RAM lors de la restauration et réécrit l'instantané lors de l'enregistrement.

LUKS2 peut encapsuler Raw, DynFileFS ou DynBlk. Le chiffrement ajoute un surcoût pour le déverrouillage et le traitement cryptographique tout en conservant la capacité et le comportement de stockage du backend sous-jacent.

Testez les charges de travail représentatives directement sur l'appareil cible. Les différences de contrôleur flash, de système de fichiers, de pont USB, de chiffrement, de compression et de type de charge de travail sont plus déterminantes qu'un classement universel des modes de persistance.

## Configuration de ZRAM

Zram échange du temps CPU contre une capacité mémoire compressée et permet d’éviter le swap sur stockage, bien plus lent. Un périphérique zram plus grand peut absorber plus de pages inactives mais n’augmente pas la RAM physique ; les charges de travail incompressibles consomment toujours de la mémoire.
Les algorithmes de compression équilibrent le débit et l’utilisation CPU face au taux de compression, et leur disponibilité dépend du noyau. Commencez avec la valeur par défaut et ne changez `zramsize`, `zramcomp` ou `nozram` que pour une charge de travail mesurée ; voir [Paramètres de démarrage](/reference/Boot-Parameters) pour les valeurs acceptées.

## Système de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel élevé réduit le temps de copie des gros modules, tandis qu’une faible latence en accès aléatoire est plus importante pour les charges de travail persistantes sur le bureau.
  Mesurez le périphérique et son boîtier ensemble ; la génération USB seule ne prédit pas les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif permet d’utiliser la persistance native sans la surcharge d’un conteneur. Les systèmes de fichiers multiplateformes améliorent la portabilité mais nécessitent un backend de conteneur compatible pour les métadonnées Linux, ajoutant des couches de mappage et de système de fichiers. Choisissez en fonction des besoins de portabilité, de récupération et des résultats de tests de performance.
