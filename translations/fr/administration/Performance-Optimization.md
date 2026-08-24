# Guide d’optimisation des performances

Ce guide présente des techniques pour optimiser les performances de MiniOS, en mettant l’accent sur ses spécificités en tant que système live. Les gains de performance les plus importants s’obtiennent en ajustant la façon dont MiniOS charge ses données et gère les modifications persistantes.

## Paramètres de démarrage pour les performances

La méthode la plus efficace pour améliorer les performances, surtout lors de l’exécution depuis une clé USB lente, consiste à utiliser des paramètres de démarrage pour contrôler le chargement du système en mémoire. Pour la liste complète des paramètres disponibles, consultez [Paramètres de démarrage](/configuration/Boot-Parameters.md).

### Chargement du système en RAM (`toram`)

Il s’agit de l’optimisation la plus importante. Le paramètre de démarrage `toram` copie l’intégralité du système MiniOS depuis le support de démarrage vers la RAM de votre ordinateur. Le système devient alors extrêmement réactif, car il n’a plus besoin de lire les données depuis la clé USB plus lente.

- **Utilisation :** Ajoutez `toram` à la ligne de commande du noyau au démarrage.
- **Prérequis :** Vous devez disposer de suffisamment de RAM pour contenir les modules principaux du système. Pour l’édition `standard`, au moins 2 à 3 Go de RAM libre sont recommandés.
- **Avantage :** Améliore drastiquement les temps de lancement des applications et la réactivité globale du système.

Il existe deux modes pour `toram` :

- **`toram=full` (par défaut) :** Copie tous les modules système en RAM. À utiliser si vous disposez de beaucoup de mémoire.
- **`toram=trim` :** Copie uniquement les modules essentiels définis par les paramètres de démarrage `load` et `noload`. Utile pour les systèmes avec une RAM limitée.

### Filtrage des modules (`load` et `noload`)

Pour réduire l’utilisation de la mémoire, vous pouvez spécifier quels modules charger. Cette méthode est particulièrement efficace en combinaison avec `toram=trim`.

- **`load=module1,module2` :** Charge uniquement les modules spécifiés (ex. : `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name` :** Exclut un module spécifique du chargement.

Cela vous permet de créer un système léger en RAM, adapté à vos besoins.

## Optimisation de la persistance

La façon dont MiniOS enregistre vos modifications (persistance) peut avoir un impact significatif sur les performances, notamment sur la vitesse d’écriture.

### Modes de persistance (`perchmode`)

Le paramètre de démarrage `perchmode` définit le backend utilisé pour le stockage persistant. Le choix dépend de votre support de stockage :

- **`perchmode=native` (par défaut) :** Enregistre les fichiers directement dans un dossier sur votre support de stockage. C’est l’**option la plus rapide pour les SSD et les clés USB rapides**, car elle évite la surcharge d’un système de fichiers dans un fichier.
- **`perchmode=raw` :** Utilise un fichier image brut pré-alloué pour les modifications. Les performances sont bonnes, mais la taille du fichier est fixe.
- **`perchmode=dynfilefs` :** Utilise un fichier à taille dynamique. Ce mode est recommandé pour les **clés USB plus lentes**, car il peut réduire l’amplification des écritures et potentiellement prolonger la durée de vie du support, bien qu’il soit légèrement plus lent que le mode `native`.

### Activation et désactivation de la persistance

Par défaut, MiniOS fonctionne en mode « live » où toutes les modifications sont perdues au redémarrage. Pour enregistrer vos changements, vous devez activer explicitement la persistance.

- **Pour activer la persistance :** Ajoutez le paramètre `perch` à votre ligne de commande de démarrage. Cela indique à MiniOS d’activer le mécanisme de persistance.
- **Pour désactiver la persistance :** Il suffit de ne pas ajouter le paramètre `perch`. S’il est absent, le système fonctionne entièrement en RAM (ou depuis le support de démarrage) et aucune modification ne sera sauvegardée.

## Configuration de ZRAM

MiniOS utilise par défaut `zram` pour créer un espace d’échange compressé dans votre RAM. Cela améliore les performances sur les systèmes disposant de peu de mémoire physique en évitant l’utilisation d’un fichier d’échange beaucoup plus lent sur le disque.

**Dimensionnement automatique :**
- **≥4GB RAM :** 2GB de ZRAM
- **1-4GB RAM :** La moitié de la RAM totale
- **<1GB RAM :** 512MB de ZRAM

**Paramètres de démarrage :**
- **`zramsize=1024` :** Définit la taille du périphérique zram (par exemple, `zramsize=1024` pour 1GB). Par défaut, la taille est configurée automatiquement selon la quantité totale de RAM.
- **`zramcomp=lz4` :** Définit l’algorithme de compression (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` offre généralement un bon compromis entre vitesse et taux de compression.
- **`nozram` :** Désactive complètement ZRAM.

Pour la plupart des utilisateurs, la configuration par défaut de `zram` est optimale. Il est recommandé de les modifier uniquement si vous avez des besoins spécifiques et comprenez les compromis impliqués.

## Système de fichiers et matériel de stockage

- **Utilisez une clé USB rapide :** Le facteur matériel le plus déterminant pour les performances de MiniOS est la vitesse de votre clé USB. Utiliser une **clé USB 3.0 ou un SSD en USB** offrira une expérience bien meilleure qu’une clé USB 2.0 lente et bas de gamme.
- **Choix du système de fichiers :** Pour la partition de persistance, un système de fichiers Linux standard comme **ext4** offrira en général les meilleures performances et la meilleure fiabilité.
