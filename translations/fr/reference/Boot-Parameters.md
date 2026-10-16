---
updated: 2026-10-15
---

# Paramètres de démarrage

## Utiliser les paramètres de démarrage

Les paramètres de démarrage personnalisent le démarrage de MiniOS. Séparez-les par des espaces sur la ligne de commande du noyau.

### Syslinux

- Appuyez sur <kbd>Échap</kbd> pendant la séquence de démarrage de MiniOS pour accéder au menu de démarrage.
- Appuyez sur <kbd>Tab</kbd> pour modifier les options de démarrage.
- Saisissez les paramètres, puis appuyez sur <kbd>Entrée</kbd> pour démarrer.

### GRUB

- Appuyez sur <kbd>E</kbd> dans le menu GRUB.
- Modifiez les paramètres de démarrage à la fin de la ligne de commande.
- Appuyez sur <kbd>F10</kbd> pour démarrer avec les nouveaux paramètres.

## Paramètres de démarrage

La colonne « Application » distingue les paramètres généralement acceptés à chaque démarrage des paramètres de compte destinés à la configuration initiale. Avec la persistance, les composants live-config ne s’exécutent généralement qu’une seule fois ; voir [live-config](/reference/configuration/live-config).

Ce tableau est un aide-mémoire. La priorité des sources et les formes acceptées sont définies dans `from=`[Détection du système dans l’initrd](/reference/boot-process/System-Discovery), le filtrage des modules dans [Chargement des modules dans l’initrd](/reference/boot-process/Module-Loading), la sélection de la persistance dans [Persistance dans l’initrd](/reference/boot-process/Persistence-Internals), et les combinaisons prises en charge dans [Modes de démarrage](/using-minios/Boot-Modes).

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `from` | À chaque démarrage | Charge les données MiniOS depuis un répertoire, un chemin de périphérique pris en charge ou une image ISO. Les formes UUID, PARTUUID et périphérique par identifiant ne sont pas analysées. Une URL littérale **`http://` uniquement** a priorité sur `ip=` et lance le [démarrage réseau](/reference/boot-process/Network-Boot) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | À chaque démarrage | Conserve les `.sb` candidats dont le chemin correspond à une expression régulière étendue non ancrée ; les virgules équivalent à une alternance, et une plage numérique ascendante complète fait l’objet d’une expansion spéciale. Filtre également `toram=trim`. Peut exclure des modules essentiels ou du noyau et rendre le système impossible à démarrer. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | À chaque démarrage | Exclut les candidats dont le chemin correspond à une expression régulière étendue non ancrée, y compris dans `toram=trim` ; ce filtrage est appliqué après `load` et peut exclure des modules essentiels ou du noyau. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | À chaque démarrage | Définit l’extension du bundle. Par défaut : `sb`. La coordination avec le noyau utilise toujours des noms littéraux `.sb` ; une extension personnalisée ne peut donc pas coordonner le module `01-kernel`. | `bext=mymod` |
| `timing` | À chaque démarrage | Active l’affichage des temps de démarrage. | `timing` |
| `union` | À chaque démarrage | Sélectionne le système de fichiers union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | À chaque démarrage | Adresse statique pour le téléchargement réseau au démarrage. Format : `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE par défaut : **7529**). La valeur littérale `from=http://...` a priorité sur `ip=` et utilise ses champs d’adressage ; sinon, toute valeur non vide `ip=` force le téléchargement des données PXE et ignore le support local. Il ne s’agit pas de la configuration réseau de NetworkManager pour la session. Voir [Démarrage réseau](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | À chaque démarrage | Taille du cache httpfs en Mio pour le démarrage réseau à partir d’une image ISO HTTP (`from=http://…`). Voir [Démarrage réseau](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | À chaque démarrage | Ouvre un shell de débogage à la fin de l’étape initramfs. | `rd.break` |
| `perchdir` | À chaque démarrage | Sélectionne une session de persistance numérotée ou une action. `resume` ouvre la session compatible par défaut ; `setup` permet de choisir interactivement le backend de stockage, puis crée une nouvelle session numérotée ; `new` crée directement une session à partir des paramètres demandés ou par défaut de `perchmode`, de chiffrement, de compression et de taille ; `ask` propose les sessions enregistrées et lance automatiquement la configuration si aucune n’existe. Un sélecteur numérique inexistant peut utiliser la valeur par défaut des métadonnées ; il ne réserve ni ne crée ce numéro. Un périphérique/chemin ou un `askdisk` sélectionne un autre emplacement de persistance. Utilisez un suffixe séparé par deux-points pour spécifier un chemin personnalisé. En l’absence de paramètre de persistance, MiniOS démarre sans persistance. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | À chaque démarrage | Taille du conteneur logique pour `dynfilefs`, `dynblk`, `vmdk` et `raw` ; ne s’applique pas à `native` ni à `squashfs`. Un nombre seul ou une valeur `M`/`MB` est alloué en Mio ; `G`/`GB` et `T`/`TB` sont convertis en 1 000 et 1 000 000 Mio. En l’absence de taille explicite, les sessions DynFileFS et DynBlk créées par initrd, ainsi que les sessions VMDK, utilisent jusqu’à 16 Gio et réduisent cette valeur par défaut si l’espace de stockage disponible après `perchreserve` est inférieur ; DynFileFS tient également compte de la surcharge de son index et de la limite RAM. DynBlk interroge la limite du backend installé à l’aide de `dynblk limits --format dynblk` (ou `--format vmdk` pour VMDK) ; il n’existe pas de plafond distinct de 512 Gio. Les données de DynFileFS et de DynBlk augmentent à la demande, tandis que DynFileFS réserve également de l’espace pour les index correspondant à la capacité logique déclarée. Les demandes Raw sont limitées à 1 000 000 Mio et à l’espace disponible après `perchreserve` ; Raw est limité à 4 000 Mio sur FAT32, avec ou sans chiffrement. Les nouveaux conteneurs Raw ont une taille par défaut de 4 000 Mio. Le Gestionnaire de sessions MiniOS conserve la taille par défaut de 4 000 Mio pour les conteneurs DynFileFS créés manuellement et de 16 Gio pour DynBlk/VMDK. Voir [Persistance initrd](/reference/boot-process/Persistence-Internals) pour le comportement des backends en matière de mémoire et de stockage. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | À chaque démarrage | Marge d’allocation et seuil d’avertissement d’espace insuffisant en Mio. Cette valeur est soustraite lors du dimensionnement de nouveaux conteneurs ou de l’agrandissement de conteneurs existants, mais ne constitue pas un quota d’exécution et n’empêche pas les écritures ultérieures de remplir le périphérique. Valeur par défaut : 256 ; maximum : 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | À chaque démarrage | Mode de stockage persistant.<br>`native` (par défaut) : un répertoire sur un système de fichiers POSIX inscriptible.<br>`dynfilefs` : conteneur extensible au format 400 basé sur FUSE, y compris sur FAT32, NTFS ou exFAT.<br>`dynblk` : périphérique bloc du noyau distinct au format 1, reposant sur des fichiers `volumeNNN.db` ; le numéro réel du `/dev/dynblkN` est attribué dynamiquement et plusieurs volumes peuvent coexister.<br>`vmdk` : fichiers épars standard fractionnés `volume.vmdk` / `volume-sNNN.vmdk` exposés par le pilote DynBlk ; sans compression. Nécessite la fonctionnalité initrd versionnée `vmdk-session-v1` .<br>`raw` : image ext4 de taille fixe.<br>`squashfs` : instantané compressé décompressé dans une couche supérieure reposant sur RAM. La configuration de l’initrd crée uniquement des métadonnées de génération zéro ; le système en cours d’exécution crée le premier instantané à la demande ou à l’arrêt. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Création uniquement | Couche de chiffrement facultative pour une nouvelle session `raw`, `dynfilefs`, `dynblk` ou `vmdk` . `perchencrypt=luks` nécessite la fonctionnalité initramfs versionnée `luks-layer-v1` . Les sessions existantes dérivent leur chiffrement uniquement de `session_encryption[N]`, ce paramètre ne les réinterprète donc pas et ne les convertit pas. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Création uniquement | Sélectionne la compression du backend DynBlk pour une nouvelle session DynBlk : `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`. Le codec du noyau sélectionné doit être disponible. Lorsque `perchencrypt=luks` encapsule DynBlk, MiniOS impose la compression DynBlk à `none`. VMDK ne prend pas en charge la compression : au démarrage, tout codec autre que`none` est ignoré avec un avertissement. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | À chaque démarrage | Active le chemin de reprise de la persistance hérité. Contrairement à `perchdir=resume`, cette option ne crée pas automatiquement de remplacement compatible lorsqu’aucune session par défaut utilisable n’existe. | `perch` |
| `toram` | À chaque démarrage | Contrôle la copie du MiniOS **données système** vers RAM. Le mode « Bare `toram` est `full` ; `trim` copie la configuration requise et l’ensemble de modules sélectionné, sans les données source sans rapport. La copie de la persistance est contrôlée séparément par `perchtoram`. Lorsque la persistance est demandée et que `perchtoram` n’est pas spécifié, tout mode `toram` actif définit par défaut la copie de la persistance sur `trim`. Ne retirez le support qu’après avoir confirmé que la source d’origine, les boucles, les mappages et tout espace de stockage de persistance requis ont bien été détachés. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | À chaque démarrage avec persistance | `off` conserve le stockage d’origine ; `trim` copie la session Raw, DynFileFS, DynBlk, VMDK ou SquashFS sélectionnée ; `full` copie tous les conteneurs/clichés pris en charge ainsi que les métadonnées correspondantes. Par défaut : `trim` avec le système `toram`, sinon `off`. Cela ne demande pas la persistance à lui seul. Les données natives ne sont pas copiées : une demande native RAM réussie démarre un nouveau conteneur vide, sauf lors d’une réinitialisation, qui désactive la copie. En cas d’échec de la copie, le fonctionnement sur le support est conservé. Les modifications de RAM doivent être enregistrées dans le stockage inscriptible d’origine ou dans une nouvelle session. Ignoré avec le backend Persistence Plugin Ventoy sélectionné. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | À chaque démarrage | Démarre en mode console texte. | `text` |
| `automount` | À chaque démarrage | Active le montage automatique des périphériques de stockage. | `automount` |
| `debug` | À chaque démarrage | Active des diagnostics de démarrage supplémentaires. | `debug` |
| `nozram` | À chaque démarrage | Désactive le swap zram. | `nozram` |
| `zramsize` | À chaque démarrage | Définit la taille du swap zram en Mio. Si cette valeur est omise, MiniOS la calcule à partir du total de RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | À chaque démarrage | Sélectionne `lzo`, `lzo-rle`, `lz4`, `lz4hc`, ou `zstd` ; la disponibilité dépend du noyau en cours d’exécution. Si cette valeur est omise, la valeur par défaut du noyau est conservée. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | À chaque démarrage | Définit la cible systemd par défaut. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | À chaque démarrage | Active les services systemd spécifiés au démarrage. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | À chaque démarrage | Désactive les services systemd spécifiés au démarrage. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | À chaque démarrage | Désactive le changement automatique de résolution d’écran dans les machines virtuelles. La résolution par défaut de XFCE est de 1280x800. | `novirtres` |
| `virtres` | À chaque démarrage | Définit la résolution d’écran de XFCE dans les machines virtuelles. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | À chaque démarrage | Exécute uniquement les composants live-config répertoriés, dans l’ordre des composants. | `components=hostname,user-setup,sudo` |
| `nocomponents` | À chaque démarrage | Exécute tous les composants live-config, à l’exception de ceux répertoriés. | `nocomponents=anacron,apport` |
| `hostname` | À chaque démarrage | Définit le nom d’hôte du système. | `hostname=minios` |
| `username` | Configuration initiale | Définit le nom d’utilisateur créé pour la connexion automatique. | `username=live` |
| `user-default-groups` | Configuration initiale | Définit les groupes par défaut de l’utilisateur créé. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuration initiale | Définit le nom complet de l’utilisateur créé. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuration initiale | Définit le mot de passe root en texte brut. | `root-password=toor` |
| `root-password-crypted` | Configuration initiale | Définit le mot de passe root sous forme de hachage crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuration initiale | Définit le mot de passe de l’utilisateur en texte brut. | `user-password=live` |
| `user-password-crypted` | Configuration initiale | Définit le mot de passe de l’utilisateur sous forme de hachage crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | À chaque démarrage | Définit une ou plusieurs paramètres régionaux du système. | `locales=en_US.UTF-8` |
| `timezone` | À chaque démarrage | Définit le fuseau horaire du système. | `timezone=Europe/Berlin` |
| `keyboard-model` | À chaque démarrage | Définit le modèle de clavier. | `keyboard-model=pc105` |
| `keyboard-layouts` | À chaque démarrage | Définit les dispositions de clavier séparées par des virgules. | `keyboard-layouts=us,de` |
| `keyboard-variants` | À chaque démarrage | Définit les variantes de clavier séparées par des virgules correspondant aux dispositions. | `keyboard-variants=,dvorak` |
| `keyboard-options` | À chaque démarrage | Définit les options du clavier. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuration initiale | Empêche live-config d’accorder les privilèges sudo et PolicyKit. | `noroot` |
| `noautologin` | À chaque démarrage | Empêche live-config de configurer la connexion automatique en console et en mode graphique ; la configuration persistante existante n’est pas supprimée. | `noautologin` |
| `nottyautologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique en console ; la configuration persistante existante n’est pas supprimée. | `nottyautologin` |
| `nox11autologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique en mode graphique ; la configuration persistante existante n’est pas supprimée. | `nox11autologin` |
| `xorg-driver` | À chaque démarrage | Sélectionne un pilote Xorg au lieu de le détecter automatiquement. | `xorg-driver=nouveau` |
| `xorg-resolution` | À chaque démarrage | Définit la résolution Xorg au lieu de la détecter automatiquement. | `xorg-resolution=1920x1080` |
| `module-mode` | À chaque démarrage | Avec `merged`, intègre les modifications de configuration au système live en cours d’exécution. | `module-mode=merged` |
| `link-user-dirs` | À chaque démarrage | Associe les répertoires utilisateur gérés à un support inscriptible MiniOS. Cette option est incompatible avec `bind-user-dirs` et indisponible avec tout mode `toram` ou lorsque la session de persistance active est chiffrée avec LUKS. Le chiffrement actif est déterminé à partir de la session en cours, et non de la demande de création de `perchencrypt` . | `link-user-dirs` |
| `bind-user-dirs` | À chaque démarrage | Monte les répertoires utilisateur gérés depuis un support inscriptible MiniOS. Cette option est soumise aux mêmes restrictions concernant `toram` et le chiffrement de la session active que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | À chaque démarrage | Définit l’emplacement relatif au support utilisé par `link-user-dirs` ou `bind-user-dirs`. Valeur par défaut : `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | À chaque démarrage | Récupère et exécute des hooks depuis le système de fichiers, le support live ou des URL prises en charge par wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Pour une création native sur FAT32/NTFS/exFAT ou si une vérification POSIX échoue, l’initrd privilégie DynBlk lorsqu’il est disponible et autorisé par Secure Boot ; sinon, il utilise DynFileFS. Cela ne convertit pas une session existante. Si un backend Persistence Plugin Ventoy est sélectionné, une demande de persistance utilise cette image ext4 unique au lieu de sessions numérotées ;`perchdir`les choix de session sont ignorés. Voir [Fonctionnement interne de la persistance](/reference/boot-process/Persistence-Internals).

## Considérations de sécurité

La ligne de commande du noyau est en texte brut et généralement visible dans la configuration du chargeur de démarrage, `/proc/cmdline` et les diagnostics. Ne placez pas de secrets réutilisables dans `root-password=` ni dans `user-password=`. Préférez les paramètres `*-crypted` correspondants, tout en considérant les hachages de mots de passe exposés comme des données sensibles.

Les hooks s’exécutent avec les privilèges du code de démarrage. Un hook `http://` ne chiffre pas le transport et n’authentifie pas le serveur ; toute personne capable de modifier le chemin réseau peut donc le remplacer. Utilisez uniquement des contenus et des mécanismes de distribution fiables ; n’utilisez pas de hook HTTP non authentifié pour un démarrage sensible du point de vue de la sécurité.

Séparez les commandes par des espaces. Consultez les pages de référence `man bootparam` pour découvrir d’autres paramètres du noyau communs à toutes les distributions Linux.

Pour en savoir plus sur les paramètres live-config, consultez [live-config](/reference/configuration/live-config).

Pour charger MiniOS via le réseau (PXE et image ISO HTTP), consultez [Démarrage réseau](/reference/boot-process/Network-Boot).

## Paramètres de cache et de journal des sessions persistantes

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `log-storage` ou `live-config.log-storage` | À chaque démarrage avec une persistance validée | `persistent` (par défaut) ou `volatile`. En mode volatile, journald utilise jusqu’à 32 Mio et le système `/var/log` de fichiers ordinaire utilise un tmpfs de 32 Mio. Les diagnostics de démarrage sont conservés séparément ; avec une persistance durable, ils restent sur le stockage. Un système de fichiers de journalisation RAM plein ne déborde pas sur la clé USB. | `log-storage=volatile` |
| `apt-cache` ou `live-config.apt-cache` | À chaque démarrage avec une persistance validée | `persistent` (par défaut) ou `volatile` pour `/var/cache/apt/archives`. Le tmpfs fait 256 Mio si au moins 1 Gio est disponible, ou 512 Mio si au moins 2 Gio sont disponibles. Un swap autre que zRAM le désactive ; les téléchargements volumineux peuvent le saturer. Les listes de dépôts et l’état de dpkg restent dans la couche de session. | `apt-cache=volatile` |
| `browser-cache` ou `live-config.browser-cache` | À chaque démarrage avec une persistance validée | `persistent` (par défaut) ou `volatile`. Si au moins 1 Gio est disponible et qu’il n’y a pas de swap autre que zRAM, les répertoires de cache standard des navigateurs de l’utilisateur live partagent un tmpfs de 512 Mio. Une règle Firefox gérée désactive la mise en cache sur disque en l’absence d’autres fichiers de règles. Les profils et les autres caches restent dans la couche de session. | `browser-cache=volatile` |

Les trois paramètres de stratégie de stockage sont analysés par `minios-boot` avant le système d’initialisation normal, et **non** par le sélecteur de persistance précoce. Ils n’activent pas `perch`. Ils nécessitent une activation réussie sur un stockage durable ou une session inscriptible RAM avec des informations `ram-origin` protégées ; ils ne garantissent pas la durabilité des modifications RAM sans enregistrement. Un initrd compatible annonce `perch-storage-v1` à l’adresse `/run/initramfs/etc/minios-initramfs-storage`. Configurator et `config.conf` proposent les mêmes options ; voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour connaître les limites, les priorités et les restrictions liées à l’installation du navigateur.
