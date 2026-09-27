---
updated: 2026-09-26
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

- **`native`:** Stocke la couche modifiable directement sous forme de fichiers ordinaires. Il offre la surcharge la plus faible et aucune taille de conteneur fixe, mais nécessite un système de fichiers sous-jacent qui préserve les métadonnées Linux et les opérations dont MiniOS a besoin.
- **`raw`:** Utilise une image ext4 à capacité fixe. Sa taille est définie selon la capacité demandée et la croissance est explicite, ce qui le rend simple et prévisible, mais sans le comportement de capacité dynamique des backends dynamiques. FAT32 limite l’image unique à 4000 Mio.
- **`dynfilefs`:** Le backend FUSE/format-400 étend le stockage à la demande et prend en charge des supports autrement incompatibles. Son index n’est pas creux : chaque bloc logique de 4 Kio déclaré nécessite un décalage de 8 octets, donc la capacité logique coûte environ 2 Mio de RAM et 2 Mio de stockage d’index par Gio, même si la charge utile est vide. Cela rend les capacités modérées efficaces mais les grandes capacités fines coûteuses dès le départ.
- **`dynblk`:** Le backend format-1 `DBSPRS01` du noyau conserve les tables de correspondance sur le disque et un cache de métadonnées limité en RAM (par défaut 1 Mio). Remplir un périphérique existant n’alloue pas une carte résidente complète. Les descriptions d’étendues et les répertoires évoluent selon les parties déclarées ; le cache de fichiers et la mémoire du codec sont additionnels. `dynblk limits --format dynblk` signale la limite de géométrie ; `dynblk status /dev/dynblkN --json` affiche les tampons comptabilisés et les statistiques de cache. Les réécritures brutes ordinaires restent en place ; les mises à jour compressées partielles recompressent actuellement un bloc de 64 Kio. Choisissez la politique de cache des pièces jointes avec soin : `unsafe` supprime les garanties de durabilité.
- **`squashfs`:** Stocke un instantané compressé et reconstruit la couche supérieure modifiable en RAM à chaque démarrage. Il minimise le stockage persistant pour des sessions majoritairement stables, mais consomme du CPU et des ressources RAM lors de la restauration et réécrit l’instantané lors de la sauvegarde. Si la mémoire le permet, la sauvegarde prépare une copie stable des modifications en RAM et compresse directement dans un candidat privé du dossier de session. Après vérification et synchronisation, MiniOS remplace atomiquement `changes.sb`; il n’écrit pas de seconde copie compressée. Si RAM ne peut pas contenir l’arborescence de préparation, l’espace de travail disque existant est utilisé pour celle-ci.

LUKS2 peut encapsuler Raw, DynFileFS ou DynBlk. Le chiffrement ajoute un déverrouillage et une surcharge cryptographique tout en conservant la capacité et le comportement de stockage du backend sous-jacent.

Testez les charges de travail représentatives sur le périphérique réel. Les différences de contrôleur flash, de système de fichiers, de pont USB, de chiffrement, de compression et de charge de travail sont plus fiables qu’un classement universel des modes de persistance.

### Réduisez les écritures de cache et de journaux avec `perch`

Configurateur MiniOS **Avancé** propose des réglages de stockage indépendants pour les journaux système classiques, les téléchargements APT et les caches natifs des navigateurs. Ces réglages fonctionnent également dans `minios/config.conf` ou ses `config.conf.d/*.conf` fragments :

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Chaque option accepte `persistent` (par défaut) ou `volatile`. Redémarrez après modification. `minios-boot` applique la règle uniquement si la session `perch` en cours est confirmée comme étant inscriptible et durable ; demander la persistance ne suffit pas. Pour un démarrage ponctuel, utilisez `log-storage=volatile`, `apt-cache=volatile`, ou `browser-cache=volatile` sur la ligne de commande du noyau. Les formes préfixées par `live-config.`- fonctionnent aussi et priment sur les fichiers de configuration. Ces réglages ne **pas** activent `perch` à eux seuls. Voir [Fichier de configuration](/reference/configuration/config.conf) pour l’ordre des fichiers sources et [Paramètres de démarrage](/reference/Boot-Parameters) pour la syntaxe complète.

| Réglage | Ce qui reste dans RAM avec `volatile` | Ce qui reste sur le stockage persistant |
|---|---|---|
| `LIVE_LOG_STORAGE` | Le journal systemd (maximum 32 Mio) et les fichiers `/var/log` classiques (tmpfs de 32 Mio). | Diagnostics de démarrage dans `/var/log/minios/` et `/var/log/live/`, y compris les trois versions précédentes des journaux. |
| `LIVE_APT_CACHE` | Paquets téléchargés dans `/var/cache/apt/archives` (tmpfs de 256 ou 512 Mio, selon la mémoire disponible). | État des paquets dans `/var/lib/dpkg`, listes de dépôts dans `/var/lib/apt/lists`, et fichiers installés. |
| `LIVE_BROWSER_CACHE` | Un tmpfs partagé de 512 Mio pour les répertoires de cache standard de Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera et Yandex Browser sous le `~/.cache` de l’utilisateur live. Une règle système désactive le cache disque de Firefox. | Profils, cookies, mots de passe, données de site et caches d’applications non liées. |

Les caches APT et navigateur RAM sont ignorés s’il y a moins de 1 Gio disponible ou si un swap non-zRAM est actif. Le tmpfs d’archive APT ne déborde pas sur le périphérique : un téléchargement plus volumineux que la capacité restante peut échouer. Un `policies.json` Firefox existant n’est pas remplacé ; vérifiez séparément son réglage de cache disque. Les chemins natifs standard des navigateurs sont préparés après la création de l’utilisateur live, y compris lors d’une installation ultérieure du navigateur. Les chemins personnalisés, installations Flatpak/Snap et utilisateurs créés après cette configuration ne sont pas redirigés automatiquement. Les caches navigateur déjà présents sont masqués par les montages RAM pour cette session et réapparaissent lors du retour à `persistent`.

Les journaux de démarrage restent sur le support persistant en écriture, indépendamment du paramètre de journalisation habituel ; une session SquashFS les conserve à l’extérieur `changes.sb`, ils ne dépendent donc pas de la sauvegarde de l’instantané à l’arrêt. Avec `volatile`, les autres fichiers sous `/var/log` (y compris l’historique texte APT/dpkg) disparaissent au redémarrage. `EXPORT_LOGS=true` est une exportation distincte et explicite vers le support MiniOS. Un tmpfs de journaux plein à 32 Mio n’accepte plus de nouveaux journaux au lieu d’écrire sur la mémoire flash. Si un autre swap sur disque est activé plus tard, les fichiers en mémoire peuvent toujours être paginés sur ce swap. Voir [Dépannage](/maintenance-and-recovery/Troubleshooting#collecting-logs) pour trouver les diagnostics de démarrage.

MiniOS utilise également `noatime` lors du montage de ses propres systèmes de fichiers de données et de conteneurs, afin d’éviter les mises à jour des métadonnées d’accès ; cela ne remonte pas les disques utilisateurs non concernés. Le `relatime` standard limite déjà ce type de mises à jour, il est donc conseillé de mesurer la différence avant de la considérer comme une économie majeure. Conservez le journal du système de fichiers, les barrières et `fsync` activés pour un support persistant amovible.

Pour une écriture contrôlée de fichier journal de 16 Mio suivie de `sync`, une VM Testo a enregistré 33 304 secteurs écrits sur son disque virtuel principal en mode persistant et 8 en mode volatile. Cela démontre le changement de chemin d’écriture pour cette charge de travail. Cela ne mesure pas les écritures internes au contrôleur USB ou ne prédit pas la durée de vie de la NAND. Comparez des charges de travail applicatives identiques sur l’appareil réel avant de tirer une conclusion sur la durée de vie.

## Configuration ZRAM

Zram échange du temps CPU contre une capacité mémoire compressée et peut éviter le swap sur stockage, bien plus lent. Un périphérique zram plus grand peut absorber plus de pages inactives mais ne crée pas de RAM physique ; les charges incompressibles consomment toujours de la mémoire.
Les algorithmes de compression équilibrent le débit et l’utilisation CPU face au taux de compression, et leur disponibilité dépend du noyau. Commencez avec la valeur par défaut et ne changez `zramsize`, `zramcomp` ou `nozram` que pour une charge mesurée ; voir [Paramètres de démarrage](/reference/Boot-Parameters) pour les valeurs acceptées.

## Système de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel élevé réduit la durée des copies de gros modules, tandis qu’une faible latence en I/O aléatoire est plus importante pour les charges persistantes sur le bureau.
  Testez le périphérique et son boîtier ensemble ; la génération USB seule ne prédit pas les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif permet la persistance native sans surcharge de conteneur. Les systèmes de fichiers multiplateformes améliorent la portabilité mais nécessitent un backend de conteneur compatible pour les métadonnées Linux, ajoutant des couches de correspondance et de système de fichiers. Choisissez selon vos besoins en portabilité et récupération, ainsi que les résultats de tests de performance.
