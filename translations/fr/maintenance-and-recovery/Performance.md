---
updated: 2026-10-15
---

# Performances

L’optimisation des performances dans MiniOS repose principalement sur un compromis entre le temps de démarrage, l’utilisation de RAM, les lectures à l’exécution, la surcharge liée à la persistance et la durabilité du stockage. Pour connaître précisément la sémantique des options et leurs limites de sécurité, consultez [Modes de démarrage](/using-minios/Boot-Modes), [Chargement des modules initrd](/reference/boot-process/Module-Loading) et [Persistance initrd](/reference/boot-process/Persistence-Internals).

## Paramètres de démarrage et performances

Les paramètres de démarrage permettent de répartir les opérations au démarrage et les lectures du système en cours d’exécution entre RAM et le périphérique source. Consultez [Paramètres de démarrage](/reference/Boot-Parameters) pour accéder à la référence complète.

### Chargement du système dans RAM (`toram`)

`toram` peut réduire la latence à l’exécution due à un périphérique USB lent ou à une image ISO hébergée sur le réseau, au prix d’un démarrage plus long et d’une occupation nettement plus importante de RAM. Le mode Bare `toram` utilise la méthode de copie complète. `toram=trim` consomme généralement moins de RAM, mais sa copie plus sélective peut omettre des données ou des modules nécessaires par la suite.

Prévoyez de l’espace pour la couche inscriptible, les applications, les caches et zram, plutôt que de dimensionner uniquement en fonction des fichiers de modules. Plus de RAM alloué à la copie du système actif signifie moins de ressources disponibles pour la charge de travail. Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour connaître la durabilité de la copie et les contraintes liées au retrait du support.

### Filtrage des modules (`load` et `noload`)

Le filtrage peut réduire le volume de données copiées et le nombre de couches montées, en particulier avec `toram=trim`. En contrepartie, le système est moins complet et le risque d’échec au démarrage ou à l’exécution augmente si une dépendance est omise. Vérifiez l’ensemble des modules obtenus ; la syntaxe des filtres et les restrictions concernant les modules protégés sont définies dans [Chargement des modules initrd](/reference/boot-process/Module-Loading).

## Optimisation de la persistance

La persistance déplace les entrées-sorties de la couche inscriptible des RAM temporaires vers un support de stockage ou un conteneur. Le choix du backend influe sur la latence, la compatibilité, la gestion de la capacité et la complexité de la récupération.

### Modes de persistance (`perchmode`)

- **`native`:** Stocke la couche modifiable directement sous forme de fichiers ordinaires. Ce mode présente le moins de surcharge liée au conteneur et n’impose pas de taille fixe, mais nécessite un système de fichiers sous-jacent capable de préserver les métadonnées Linux et les opérations dont MiniOS a besoin.
- **`raw`:** Utilise une seule image ext4 à capacité fixe. La taille du fichier correspond à la capacité demandée et l’extension est explicite, ce qui le rend simple et prévisible, mais il ne bénéficie pas du comportement à capacité dynamique des autres backends. FAT32 limite l’image unique à 4000 MiB.
- **`dynfilefs`:** Le backend FUSE/format-400 étend le stockage des données à la demande et prend en charge des supports autrement incompatibles. Son index n’est pas clairsemé : chaque bloc logique de 4 KiB déclaré nécessite un décalage de 8 octets, ainsi la capacité logique coûte environ 2 MiB de RAM et environ 2 MiB d’index de stockage par GiB, même si la charge utile est vide. Cela rend les capacités modérées efficaces, mais les grandes capacités dynamiques coûteuses dès le départ.
- **`dynblk`:** Le backend format-1 `DBSPRS01` du noyau conserve les tables de correspondance sur le disque et un cache de métadonnées limité dans RAM (par défaut 1 MiB). Remplir un périphérique existant n’alloue pas une carte résidente complète. Les descriptions d’étendues et les répertoires évoluent selon les parties déclarées ; le cache de fichiers et la mémoire du codec s’ajoutent.`dynblk limits --format dynblk` signale la limite de la géométrie ; `dynblk status /dev/dynblkN --json` affiche les tampons comptabilisés et les statistiques de cache. Les réécritures brutes ordinaires restent en place ; les mises à jour partielles compressées recompresse actuellement un bloc de 64 KiB. Choisissez la politique de cache des pièces jointes avec soin : `unsafe` sacrifie les garanties de durabilité.
- **`vmdk`:** Utilise le pilote noyau DynBlk avec un stockage VMDK standard en mode sparse fractionné. Il s’agrandit à la demande mais n’offre pas de compression côté backend. Comme les conteneurs natifs DynBlk, il peut être copié dans RAM indépendamment des modules système et sauvegardé explicitement sur le stockage.
- **`squashfs`:** Stocke un instantané compressé et reconstruit la couche supérieure modifiable dans RAM à chaque démarrage. Cela minimise le stockage persistant pour les sessions majoritairement stables, mais implique un coût CPU et RAM lors de la restauration et réécrit l’instantané lors de la sauvegarde. Lorsque la mémoire le permet, la sauvegarde prépare une copie stable des modifications dans RAM et compresse directement dans un candidat privé du répertoire de session. Après vérification et synchronisation, MiniOS remplace de façon atomique `changes.sb` ; il n’écrit pas de seconde copie compressée. Si RAM ne peut pas contenir l’arborescence de préparation, il utilise l’espace de travail disque existant pour cette arborescence.

LUKS2 peut encapsuler Raw, DynFileFS, DynBlk ou VMDK. Le chiffrement ajoute une étape de déverrouillage et une surcharge cryptographique tout en conservant la capacité et le comportement de stockage du backend sous-jacent. La compression DynBlk est désactivée lorsque LUKS2 est utilisé ; VMDK n’offre jamais de compression côté backend.

DynFileFS 4.6.0 et la branche expérimentale 5.01 MiniOS ajoutent la gestion du discard et la réutilisation d’allocation au backend d’origine. Pour une démonstration reproductible, voir `tests/benefit-minios.py` dans le dépôt DynFileFS. Lors d’un test synthétique sur le stockage ext4 de lego2 (et non sur un périphérique USB flash), le discard de 32 MiB a réduit l’allocation de stockage MiniOS d’environ 49 MiB à 17 MiB ; après 16 MiB d’écritures supplémentaires, MiniOS utilisait environ 25 MiB, contre environ 57 MiB pour le backend Tomas-M 5.01 d’origine. La récupération sans déplacement et la compaction optionnelle n’ont pas libéré d’espace supplémentaire dans cette configuration. Ces chiffres dépendent de la charge de travail, et le backend d’origine n’a reçu aucune écriture mais pas de discard car il n’implémente pas cette interface. Ne considérez pas ce résultat comme un avantage universel en termes de vitesse ou d’endurance.

Évaluez les charges de travail représentatives directement sur le périphérique concerné. Les différences de contrôleur flash, de système de fichiers, de pont USB, de chiffrement, de compression et de charge de travail sont plus fiables qu’un classement universel des modes de persistance.

<a id="reduce-cache-and-log-writes-with-perch"></a>

### Réduire les écritures du cache et des journaux avec `perch`

Configurateur MiniOS **Avancé** permet de configurer séparément le stockage des journaux système ordinaires, des téléchargements APT et des caches des navigateurs natifs courants. Ces options fonctionnent également dans `minios/config.conf` ou ses `config.conf.d/*.conf` fragments :

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Chaque paramètre accepte `persistent` (par défaut) ou `volatile`. Redémarrez après toute modification. `minios-boot` applique la règle après l’activation réussie de la persistance sur un support durable, ou dans une session inscriptible RAM avec un enregistrement `ram-origin` protégé ; demander la persistance ne suffit pas. Pour un démarrage ponctuel, utilisez `log-storage=volatile`, `apt-cache=volatile` ou `browser-cache=volatile` sur la ligne de commande du noyau. Les formes préfixées par `live-config.` fonctionnent aussi et sont prioritaires sur les fichiers de configuration. Ces paramètres n’**activent pas** à eux seuls la `perch`. Consultez [Fichier de configuration](/reference/configuration/config.conf) pour connaître l’ordre de priorité des fichiers source et [Paramètres de démarrage](/reference/Boot-Parameters) pour la syntaxe complète.

| Paramètre | Ce qui reste dans RAM avec `volatile` | Ce qui reste sur le stockage persistant |
|---|---|---|
| `LIVE_LOG_STORAGE` | Le journal systemd (32 MiB maximum) et les fichiers `/var/log` ordinaires (tmpfs de 32 MiB). | Diagnostics de démarrage dans `/var/log/minios/` et `/var/log/live/`, y compris les trois versions précédentes des journaux. |
| `LIVE_APT_CACHE` | Paquets téléchargés dans `/var/cache/apt/archives` (tmpfs de 256 ou 512 MiB, selon la mémoire disponible). | État des paquets dans `/var/lib/dpkg`, listes des dépôts dans `/var/lib/apt/lists` et fichiers installés. |
| `LIVE_BROWSER_CACHE` | Un tmpfs partagé de 512 MiB pour les répertoires de cache standard de Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera et Yandex Browser dans le profil de l’utilisateur actif `~/.cache`. Une règle système désactive le cache disque de Firefox. | Profils, cookies, mots de passe, données des sites et caches des applications sans rapport. |

Les caches APT et de navigateur RAM ne sont pas déplacés si moins de 1 GiB est disponible ou si un swap autre que zRAM est actif. Le tmpfs des archives APT ne déborde pas sur le périphérique : un téléchargement supérieur à l’espace restant peut échouer. Un cache disque Firefox existant `policies.json` n’est pas remplacé ; vérifiez séparément son paramètre de cache disque. Les chemins standard des navigateurs natifs sont préparés après la création de l’utilisateur actif, y compris si un navigateur est installé ultérieurement. Les chemins personnalisés, les installations Flatpak/Snap et les utilisateurs créés après cette configuration ne sont pas redirigés automatiquement. Les caches de navigateur déjà stockés sont masqués pendant ce démarrage par les montages RAM et réapparaissent lorsque vous revenez à `persistent`.

Avec une persistance durable, les journaux de démarrage restent sur le support inscriptible de la session, quel que soit le réglage des journaux ordinaires ; une session durable SquashFS les conserve en dehors de `changes.sb`, ils ne dépendent donc pas de l’enregistrement de l’instantané à l’arrêt. Une session copiée avec `perchtoram` est différente : ses journaux restent en mémoire jusqu’à leur enregistrement sur le support. Avec `volatile`, les autres fichiers de `/var/log` (y compris l’historique texte APT/dpkg) disparaissent au redémarrage. `EXPORT_LOGS=true` est une exportation distincte, effectuée explicitement vers le support MiniOS. Un tmpfs de journaux saturé à 32 MiB cesse d’accepter les nouvelles écritures au lieu de les transférer sur la mémoire flash. Si un autre swap sur disque est activé ultérieurement, les fichiers en mémoire peuvent toujours être paginés dans ce swap. Consultez [Dépannage](/maintenance-and-recovery/Troubleshooting#collecting-logs) pour savoir où trouver les diagnostics de démarrage.

MiniOS utilise également `noatime` lors du montage de ses propres systèmes de fichiers de données et de conteneurs, évitant ainsi les mises à jour des métadonnées d’accès ; les disques utilisateur sans rapport ne sont pas remontés. Le paramètre standard `relatime` limite déjà ces mises à jour : mesurez la différence avant de considérer qu’il s’agit d’une économie importante. Pour un support persistant amovible, laissez activés le journal du système de fichiers, les barrières et `fsync`.

Pour une écriture contrôlée de 16 MiB dans un fichier journal, suivie de `sync`, une machine virtuelle Testo a enregistré 33 304 secteurs écrits sur son disque virtuel inférieur en mode persistant, contre 8 en mode volatil. Cela illustre le changement de chemin d’écriture pour cette charge de travail. Ce test ne mesure pas les écritures dans un contrôleur de mémoire flash USB et ne permet pas de prédire la durée de vie de la mémoire NAND. Comparez des charges de travail applicatives identiques sur l’appareil concerné avant de tirer des conclusions sur sa durée de vie.

## Configuration de ZRAM

Zram échange du temps processeur contre une capacité mémoire compressée et peut éviter un swap sur un stockage beaucoup plus lent. Un périphérique zram plus grand peut accueillir davantage de pages inactives, mais ne crée pas de RAM physique ; les charges de travail incompressibles consomment toujours de la mémoire.
Les algorithmes de compression offrent différents compromis entre débit, utilisation du processeur et taux de compression ; leur disponibilité dépend du noyau. Commencez par la valeur par défaut et ne modifiez `zramsize`, `zramcomp` ou `nozram` que pour une charge de travail mesurée ; consultez [Paramètres de démarrage](/reference/Boot-Parameters) pour connaître les valeurs acceptées.

## Systèmes de fichiers et matériel de stockage

- **Choix du périphérique :** Un débit séquentiel élevé accélère la copie de modules volumineux, tandis qu’une faible latence en accès aléatoire est plus importante pour les charges de travail persistantes sur ordinateur.
  Mesurez les performances du périphérique et du boîtier ensemble ; la génération USB ne suffit pas à prédire les performances de la mémoire flash ou du SSD.
- **Choix du système de fichiers :** Un système de fichiers Linux natif peut assurer la persistance sans surcharge liée à un conteneur. Les systèmes de fichiers multiplateformes facilitent la portabilité, mais nécessitent un backend de conteneur compatible pour gérer les métadonnées Linux, ce qui ajoute des couches de correspondance et de système de fichiers. Faites votre choix en fonction de vos besoins en matière de portabilité et de récupération, ainsi que des résultats des benchmarks.
