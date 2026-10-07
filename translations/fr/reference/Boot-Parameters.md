---
updated: 2026-10-06
---

# Paramètres de démarrage

## Comment utiliser les paramètres de démarrage

Les paramètres de démarrage personnalisent la façon dont MiniOS démarre. Séparez les paramètres par des espaces sur la ligne de commande du noyau.

### Syslinux

- Appuyez sur <kbd>Échap</kbd> pendant la séquence de démarrage MiniOS pour accéder au menu de démarrage.
- Appuyez sur <kbd>Tab</kbd> pour modifier les options de démarrage.
- Saisissez les paramètres puis appuyez sur <kbd>Entrée</kbd> pour démarrer.

### GRUB

- Appuyez sur <kbd>E</kbd> dans le menu GRUB.
- Modifiez les paramètres de démarrage à la fin de la ligne de commande.
- Appuyez sur <kbd>F10</kbd> pour démarrer avec les nouveaux réglages.

## Paramètres de démarrage

La colonne Application distingue les paramètres normalement acceptés à chaque démarrage des paramètres de compte destinés à la configuration initiale. Avec la persistance, les composants live-config ne s'exécutent normalement qu'une seule fois ; voir [live-config](/reference/configuration/live-config).

Ce tableau sert de référence rapide. La priorité des sources et les `from=` formes acceptées sont définies dans [Détection du système Initrd](/reference/boot-process/System-Discovery), le filtrage des modules dans [Chargement des modules Initrd](/reference/boot-process/Module-Loading), la sélection de la persistance dans [Persistance Initrd](/reference/boot-process/Persistence-Internals), et les combinaisons prises en charge dans [Modes de démarrage](/using-minios/Boot-Modes).

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `from` | À chaque démarrage | Charge les données MiniOS depuis un répertoire, un chemin de périphérique pris en charge ou une image ISO. Les formes UUID, PARTUUID et by-id ne sont pas interprétées. Une **`http://` URL uniquement** a priorité sur `ip=` et lance le [démarrage réseau](/reference/boot-process/Network-Boot) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | À chaque démarrage | Conserve les candidats `.sb` dont le chemin correspond à une expression régulière étendue non ancrée ; les virgules deviennent des alternatives, et une plage numérique ascendante complète bénéficie d'une expansion spéciale. Filtre également `toram=trim`. Cela peut exclure des modules principaux ou du noyau et rendre le système non amorçable. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | À chaque démarrage | Exclut les candidats dont le chemin correspond à une expression régulière étendue non ancrée, y compris depuis `toram=trim` ; cela s'applique après `load` et peut exclure des modules principaux ou du noyau. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | À chaque démarrage | Définit l'extension du bundle. Par défaut : `sb`. La coordination avec le noyau utilise toujours les noms `.sb` littéraux, donc une extension personnalisée ne peut pas coordonner le module `01-kernel`. | `bext=mymod` |
| `timing` | À chaque démarrage | Active l'affichage du temps de démarrage. | `timing` |
| `union` | À chaque démarrage | Sélectionne le système de fichiers union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | À chaque démarrage | Adresse statique pour la récupération réseau précoce. Format : `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE par défaut **7529**). Un `from=http://...` l’emporte sur `ip=` et utilise ses champs d’adressage ; sinon, tout `ip=` force le téléchargement des données PXE et ignore les supports locaux. Ceci n’est pas une configuration NetworkManager de session. Voir [Démarrage réseau](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | À chaque démarrage | Taille du cache httpfs en Mio pour le démarrage réseau ISO HTTP (`from=http://…`). Voir [Démarrage réseau](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | À chaque démarrage | Ouvre un shell de débogage à la fin de l’étape initramfs. | `rd.break` |
| `perchdir` | À chaque démarrage | Sélectionne une session de persistance numérotée ou une action. `resume` ouvre la session compatible par défaut ; `setup` permet de choisir le backend de stockage de façon interactive puis crée une nouvelle session numérotée ; `new` crée directement une nouvelle session à partir du `perchmode` demandé/par défaut, ainsi que les paramètres de chiffrement, de compression et de taille ; `ask` propose les sessions enregistrées et lance automatiquement la configuration si aucune n’existe. Un sélecteur numérique inexistant peut revenir à la valeur par défaut des métadonnées ; il ne réserve ni ne crée ce numéro. Un périphérique/chemin ou `askdisk` permet de choisir un autre emplacement de persistance. Utilisez un suffixe séparé par deux-points pour un chemin personnalisé. Sans paramètre de persistance, MiniOS démarre proprement. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | À chaque démarrage | Taille logique du conteneur pour `dynfilefs`, `dynblk`, `vmdk`, et `raw` ; cela ne s’applique pas à `native` ou `squashfs`. Un nombre seul ou `M`/`MB` est alloué en Mio ; `G`/`GB` et `T`/`TB` sont convertis en 1000 et 1 000 000 Mio. Sans taille explicite, les sessions DynFileFS, DynBlk créées par initrd et VMDK utilisent jusqu’à 16 Gio et réduisent cette valeur par défaut si l’espace restant est insuffisant après `perchreserve` ; DynFileFS prend aussi en compte la surcharge de son index et la limite RAM. DynBlk interroge la limite du backend installé via `dynblk limits --format dynblk` (ou `--format vmdk` pour VMDK) ; il n’y a pas de plafond distinct à 512 Gio. La charge utile DynFileFS et les données de stockage DynBlk augmentent à la demande, tandis que DynFileFS réserve également des index pour la capacité logique déclarée. Les demandes Raw sont limitées à 1 000 000 Mio et à l’espace disponible après `perchreserve` ; Raw est limité à 4000 Mio sur FAT32, qu’il soit chiffré ou non. Les nouveaux conteneurs raw sont par défaut à 4000 Mio. Le Gestionnaire de sessions MiniOS attribue toujours par défaut 4000 Mio aux conteneurs DynFileFS créés manuellement et 16 Gio pour DynBlk/VMDK. Voir [Persistance initrd](/reference/boot-process/Persistence-Internals) pour le comportement mémoire et stockage du backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | À chaque démarrage | Marge d’allocation et seuil d’alerte d’espace faible en Mio. Cette marge est soustraite lors de la création ou de l’extension de nouveaux conteneurs, mais il ne s’agit pas d’un quota d’exécution et cela n’empêche pas les écritures ultérieures de remplir le périphérique. Par défaut : 256 ; maximum : 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | À chaque démarrage | Mode de stockage persistant.<br>`native` (par défaut) : un répertoire sur un système de fichiers POSIX inscriptible.<br>`dynfilefs`: le conteneur extensible format-400 basé sur FUSE, y compris sur FAT32, NTFS ou exFAT.<br>`dynblk`: un périphérique bloc noyau séparé au format-1, géré par thin `volumeNNN.db` fichiers ; le nombre réel `/dev/dynblkN` est alloué dynamiquement et plusieurs volumes peuvent coexister.<br>`vmdk`: fichiers standard fractionnés et clairsemés `volume.vmdk` / `volume-sNNN.vmdk` exposés par le pilote DynBlk ; sans compression. Nécessite la fonctionnalité versionnée `vmdk-session-v1` initrd.<br>`raw`: une image ext4 de taille fixe.<br>`squashfs`: un instantané compressé décompressé dans une couche supérieure basée sur RAM. La configuration initrd ne crée que les métadonnées de génération zéro ; le système en cours d’exécution crée le premier instantané à la demande ou à l’arrêt. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Création uniquement | Couche de chiffrement optionnelle pour une nouvelle création de `raw`, `dynfilefs`, `dynblk`, ou `vmdk` session. `perchencrypt=luks` nécessite la fonctionnalité versionnée `luks-layer-v1` initramfs. Les sessions existantes dérivent le chiffrement uniquement de `session_encryption[N]`, donc ce paramètre ne les réinterprète ni ne les convertit. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Création uniquement | Sélectionne la compression backend DynBlk pour une nouvelle session DynBlk : `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`. Le codec noyau sélectionné doit être disponible. Lorsque `perchencrypt=luks` encapsule DynBlk, MiniOS force la compression DynBlk à `none`. VMDK ne propose aucune compression : au démarrage, une option non-`none` codec est ignorée avec un avertissement. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | À chaque démarrage | Active le chemin de reprise de persistance hérité. Contrairement à `perchdir=resume`, il ne crée pas automatiquement de remplacement compatible lorsqu’aucune session par défaut utilisable n’existe. | `perch` |
| `toram` | À chaque démarrage | Contrôle la copie du MiniOS **des données système** vers RAM. "Bare" `toram` signifie `full`; `trim`copie la configuration requise et l’ensemble de modules sélectionnés, tout en excluant les autres données sources. La copie de la persistance est gérée séparément par `perchtoram`. Lorsque la persistance est demandée et que `perchtoram`n’est pas spécifié, tout mode `toram`actif applique par défaut la copie de la persistance à `trim`. Retirez le support uniquement après avoir confirmé que la source d’origine, les boucles, les mappages et tout espace de stockage de persistance requis ont bien été détachés. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | À chaque démarrage avec persistance | Contrôle la copie des sessions de persistance prises en charge indépendamment du système `toram`: `off`conserve la session sur son emplacement d’origine, `trim`copie uniquement la session sélectionnée Raw, DynFileFS, DynBlk, VMDK ou SquashFS, ainsi que les métadonnées associées, et `full`copie toutes les sessions container/SquashFS prises en charge depuis ce support. Les sessions de répertoire natif ne sont pas copiées. Par défaut : `trim`lorsque le système `toram`est actif, sinon `off`; une valeur explicite prévaut. Une session copiée est marquée non durable, mais le Session Manager actuel peut explicitement enregistrer les modifications prises en charge par RAM sur le support d’origine ou comme nouvelle session, si ce support est disponible et correspond toujours à son identité enregistrée. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | À chaque démarrage | Démarre en mode console texte. | `text` |
| `automount` | À chaque démarrage | Active le montage automatique des périphériques de stockage. | `automount` |
| `debug` | À chaque démarrage | Active des diagnostics supplémentaires au démarrage. | `debug` |
| `nozram` | À chaque démarrage | Désactive le swap zram. | `nozram` |
| `zramsize` | À chaque démarrage | Définit la taille du swap zram en Mio. Si omis, MiniOS la calcule à partir du RAM total. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | À chaque démarrage | Sélectionne `lzo`, `lzo-rle`, `lz4`, `lz4hc`, ou `zstd`; la disponibilité dépend du noyau en cours d’exécution. Si omis, la valeur par défaut du noyau est conservée. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | À chaque démarrage | Définit la cible systemd par défaut. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | À chaque démarrage | Active les services systemd spécifiés au démarrage. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | À chaque démarrage | Désactive les services systemd spécifiés au démarrage. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | À chaque démarrage | Désactive le changement automatique de résolution d'écran dans les machines virtuelles. La valeur par défaut de XFCE est 1280x800. | `novirtres` |
| `virtres` | À chaque démarrage | Définit la résolution d'écran XFCE dans les machines virtuelles. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | À chaque démarrage | Exécute uniquement les composants live-config listés, dans l'ordre des composants. | `components=hostname,user-setup,sudo` |
| `nocomponents` | À chaque démarrage | Exécute tous les composants live-config sauf ceux listés. | `nocomponents=anacron,apport` |
| `hostname` | À chaque démarrage | Définit le nom d'hôte du système. | `hostname=minios` |
| `username` | Configuration initiale | Définit le nom d'utilisateur créé pour la connexion automatique. | `username=live` |
| `user-default-groups` | Configuration initiale | Définit les groupes par défaut de l'utilisateur créé. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuration initiale | Définit le nom complet de l'utilisateur créé. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuration initiale | Définit le mot de passe root en clair. | `root-password=toor` |
| `root-password-crypted` | Configuration initiale | Définit le mot de passe root sous forme de hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuration initiale | Définit le mot de passe utilisateur en clair. | `user-password=live` |
| `user-password-crypted` | Configuration initiale | Définit le mot de passe utilisateur sous forme de hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | À chaque démarrage | Définit une ou plusieurs locales système. | `locales=en_US.UTF-8` |
| `timezone` | À chaque démarrage | Définit le fuseau horaire du système. | `timezone=Europe/Berlin` |
| `keyboard-model` | À chaque démarrage | Définit le modèle de clavier. | `keyboard-model=pc105` |
| `keyboard-layouts` | À chaque démarrage | Définit les dispositions de clavier séparées par des virgules. | `keyboard-layouts=us,de` |
| `keyboard-variants` | À chaque démarrage | Définit les variantes de clavier séparées par des virgules correspondant aux dispositions. | `keyboard-variants=,dvorak` |
| `keyboard-options` | À chaque démarrage | Définit les options du clavier. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuration initiale | Empêche live-config d'accorder les privilèges sudo et policykit. | `noroot` |
| `noautologin` | À chaque démarrage | Empêche live-config de configurer la connexion automatique en console et en mode graphique ; la configuration persistante existante n'est pas supprimée. | `noautologin` |
| `nottyautologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique en console ; la configuration persistante existante n'est pas supprimée. | `nottyautologin` |
| `nox11autologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique en mode graphique ; la configuration persistante existante n'est pas supprimée. | `nox11autologin` |
| `xorg-driver` | À chaque démarrage | Permet de sélectionner un pilote Xorg au lieu de l'autodétection. | `xorg-driver=nouveau` |
| `xorg-resolution` | À chaque démarrage | Permet de définir la résolution Xorg au lieu de l'autodétection. | `xorg-resolution=1920x1080` |
| `module-mode` | À chaque démarrage | Avec `merged`, intègre les modifications de configuration dans le système live en cours d'exécution. | `module-mode=merged` |
| `link-user-dirs` | À chaque démarrage | Lie les répertoires utilisateurs gérés à des supports MiniOS en écriture. Ceci est exclusif avec `bind-user-dirs` et indisponible avec tout `toram` mode ou lorsque la session de persistance active est chiffrée avec LUKS. Le chiffrement actif est déterminé à partir de la session en cours, et non de la demande de `perchencrypt` création. | `link-user-dirs` |
| `bind-user-dirs` | À chaque démarrage | Monte en bind les répertoires utilisateurs gérés depuis des supports MiniOS en écriture. Il présente les mêmes `toram` et restrictions de chiffrement de session active que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | À chaque démarrage | Définit l'emplacement relatif au support utilisé par `link-user-dirs` ou `bind-user-dirs`. Par défaut : `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | À chaque démarrage | Récupère et exécute des hooks depuis le système de fichiers, le support live ou des URLs compatibles wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considérations de sécurité

La ligne de commande du noyau est en clair et généralement visible dans la configuration du bootloader, `/proc/cmdline`, et dans les diagnostics. N’inscrivez pas de secrets réutilisables dans `root-password=` ou `user-password=`. Préférez les paramètres `*-crypted` correspondants, tout en considérant les hash de mots de passe exposés comme sensibles.

Les hooks s’exécutent en tant que code privilégié au démarrage. Un hook `http://` n’a ni chiffrement de transport ni authentification serveur, donc toute personne pouvant modifier le chemin réseau peut le remplacer. Utilisez uniquement des contenus et des modes de diffusion de confiance ; n’utilisez pas de hook HTTP non authentifié pour un démarrage sensible à la sécurité.

Séparez les commandes par des espaces. Consultez les `man bootparam` pages de référence pour des paramètres supplémentaires du noyau communs à toutes les distributions Linux.

Pour plus d’informations sur les paramètres live-config, voir [live-config](/reference/configuration/live-config).

Pour charger MiniOS via le réseau (PXE et ISO HTTP), voir [Démarrage réseau](/reference/boot-process/Network-Boot).

## Paramètres de cache et de journalisation des sessions persistantes

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `log-storage` ou `live-config.log-storage` | À chaque démarrage, avec `perch` | `persistent` (par défaut) ou `volatile`. En mode volatile, journald utilise jusqu’à 32 Mio de RAM et le `/var/log` classique utilise un tmpfs de 32 Mio. `minios-boot` et `live-config` les journaux de démarrage restent sur le support de persistance en écriture. Un système de fichiers log RAM plein arrête d’accepter les écritures au lieu de déborder sur la clé USB. | `log-storage=volatile` |
| `apt-cache` ou `live-config.apt-cache` | À chaque démarrage, avec `perch` | `persistent` (par défaut) ou `volatile` pour `/var/cache/apt/archives`. Le montage RAM fait 256 ou 512 Mio selon la mémoire disponible et si aucun swap non-zRAM n’est actif ; de gros téléchargements peuvent l’épuiser. `/var/lib/apt/lists` et l’état dpkg restent persistants. | `apt-cache=volatile` |
| `browser-cache` ou `live-config.browser-cache` | À chaque démarrage, avec `perch` | `persistent` (par défaut) ou `volatile` pour les caches natifs standard des navigateurs. Après la création de l’utilisateur live, certains sous-répertoires `~/.cache` utilisent un tmpfs partagé de 512 Mio, et la mise en cache disque de Firefox est désactivée par une politique système gérée si aucun autre fichier de politique Firefox n’est présent. Les profils et autres caches d’applications restent persistants. | `browser-cache=volatile` |

Les trois paramètres de politique de stockage sont analysés par `minios-boot` avant l’initialisation normale, **pas** par le sélecteur de persistance précoce. Ils n’activent pas `perch` et ne prennent effet qu’après activation réussie de la persistance durable. Un initrd compatible annonce `perch-storage-v1` à `/run/initramfs/etc/minios-initramfs-storage`. Le Configurateur et `config.conf` proposent les mêmes choix ; voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour les limites, priorités et avertissements liés à l’installation des navigateurs.
