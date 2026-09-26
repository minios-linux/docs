---
updated: 2026-09-26
---

# Paramètres de démarrage

## Comment utiliser les paramètres de démarrage

Les paramètres de démarrage personnalisent la façon dont MiniOS démarre. Séparez les paramètres par des espaces dans la ligne de commande du noyau.

### Syslinux

- Appuyez sur <kbd>Esc</kbd> pendant la séquence de démarrage MiniOS pour accéder au menu de démarrage.
- Appuyez sur <kbd>Tab</kbd> pour modifier les options de démarrage.
- Saisissez les paramètres puis appuyez sur <kbd>Entrée</kbd> pour démarrer.

### GRUB

- Appuyez sur <kbd>E</kbd> dans le menu GRUB.
- Modifiez les paramètres de démarrage à la fin de la ligne de commande.
- Appuyez sur <kbd>F10</kbd> pour démarrer avec les nouveaux paramètres.

## Paramètres de démarrage

La colonne Application distingue les paramètres normalement acceptés à chaque démarrage des réglages de compte destinés à l'initialisation. Avec la persistance, les composants live-config ne s'exécutent normalement qu'une seule fois ; voir [live-config](/reference/configuration/live-config).

Ce tableau sert de référence rapide. La priorité des sources et les `from=` formes acceptées sont définies dans [Détection du système Initrd](/reference/boot-process/System-Discovery), le filtrage des modules dans [Chargement des modules Initrd](/reference/boot-process/Module-Loading), la sélection de la persistance dans [Persistance Initrd](/reference/boot-process/Persistence-Internals), et les combinaisons prises en charge dans [Modes de démarrage](/using-minios/Boot-Modes).

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `from` | À chaque démarrage | Charge les données MiniOS depuis un répertoire, un chemin de périphérique pris en charge ou une image ISO. Les formes UUID, PARTUUID et by-id ne sont pas interprétées. Une valeur littérale **`http://` uniquement** URL a priorité sur `ip=` et lance le [démarrage réseau](/reference/boot-process/Network-Boot) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | À chaque démarrage | Conserve les candidats `.sb` dont le chemin correspond à une expression régulière étendue non ancrée ; les virgules sont interprétées comme des alternatives, et une plage numérique ascendante complète bénéficie d'une expansion spéciale. Filtre également `toram=trim`. Cela peut exclure des modules essentiels ou du noyau et rendre le système non amorçable. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | À chaque démarrage | Exclut les candidats dont le chemin correspond à une expression régulière étendue non ancrée, y compris depuis `toram=trim` ; ce filtre s'applique après `load` et peut exclure des modules essentiels ou du noyau. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | À chaque démarrage | Définit l'extension du bundle. Par défaut : `sb`. La coordination avec le noyau utilise toujours les noms `.sb` littéraux, donc une extension personnalisée ne permet pas de coordonner le module `01-kernel`. | `bext=mymod` |
| `timing` | À chaque démarrage | Active l'affichage du temps de démarrage. | `timing` |
| `union` | À chaque démarrage | Sélectionne le système de fichiers union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | À chaque démarrage | Adresse statique pour le téléchargement réseau précoce. Format : `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE par défaut **7529**). Une valeur littérale `from=http://...` a priorité sur `ip=` et utilise ses champs d'adressage ; sinon, toute valeur non vide de `ip=` force le téléchargement des données PXE et ignore les supports locaux. Ceci ne concerne pas la configuration NetworkManager de session. Voir [Démarrage réseau](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | À chaque démarrage | Taille du cache httpfs en Mio pour le démarrage réseau HTTP ISO (`from=http://…`). Voir [Démarrage réseau](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | À chaque démarrage | Ouvre un shell de débogage à la fin de l'étape initramfs. | `rd.break` |
| `perchdir` | À chaque démarrage | Sélectionne une session de persistance numérotée ou une action : `resume`, `new`, ou `ask`. Un sélecteur numérique inexistant peut revenir à la valeur par défaut des métadonnées ; il ne réserve ni ne crée ce numéro. Un périphérique/chemin ou une forme `askdisk` permet de choisir un autre emplacement de persistance. Utilisez un suffixe délimité par deux-points pour un chemin personnalisé. Sans paramètre de persistance, MiniOS démarre sans données. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | À chaque démarrage | Taille logique du conteneur pour `dynfilefs`, `dynblk`, `vmdk`, et `raw` ; ne s'applique pas à `native` ou `squashfs`. Un nombre seul ou une valeur `M`/`MB` est allouée en Mio ; `G`/`GB` et `T`/`TB` sont convertis en 1000 et 1 000 000 Mio. Sans taille explicite, les sessions DynFileFS, DynBlk créées par initrd et VMDK utilisent jusqu'à 16 Gio et réduisent cette valeur si l'espace restant après `perchreserve` est insuffisant ; DynFileFS prend aussi en compte la surcharge de son index et la limite RAM. DynBlk interroge la limite du backend installé via `dynblk limits --format dynblk` (ou `--format vmdk` pour VMDK) ; il n'y a pas de plafond séparé à 512 Gio. Les données utiles DynFileFS et les données de support DynBlk s'étendent à la demande, tandis que DynFileFS réserve aussi des index pour la capacité logique déclarée. Les requêtes Raw sont limitées à 1 000 000 Mio et à l'espace disponible après `perchreserve` ; Raw est limité à 4000 Mio sur FAT32, chiffré ou non. Les nouveaux conteneurs raw font 4000 Mio par défaut. Le Gestionnaire de sessions MiniOS attribue toujours 4000 Mio aux conteneurs DynFileFS créés manuellement et 16 Gio à DynBlk/VMDK. Voir [Persistance Initrd](/reference/boot-process/Persistence-Internals) pour le comportement mémoire et stockage du backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | À chaque démarrage | Marge d'allocation et seuil d'alerte d'espace faible en Mio. Cette valeur est soustraite lors du dimensionnement de nouveaux conteneurs ou de leur extension, mais ce n'est pas un quota d'exécution et cela n'empêche pas d'écrire jusqu'à remplir le périphérique. Par défaut : 256 ; maximum : 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | À chaque démarrage | Mode de stockage de la persistance.<br>`native` (par défaut) : un répertoire sur un système de fichiers POSIX en écriture.<br>`dynfilefs` : conteneur extensible format-400 basé sur FUSE, y compris sur FAT32, NTFS ou exFAT.<br>`dynblk` : périphérique bloc kernel format-1 distinct, basé sur des fichiers `volumeNNN.db` fins ; le numéro `/dev/dynblkN` est alloué dynamiquement et plusieurs volumes peuvent coexister.<br>`vmdk` : fichiers `volume.vmdk` / `volume-sNNN.vmdk` fractionnés standard exposés par le pilote DynBlk ; sans compression. Nécessite la capacité `vmdk-session-v1` initrd versionnée.<br>`raw` : image ext4 de taille fixe.<br>`squashfs` : instantané compressé décompressé dans une couche supérieure basée sur RAM. L'initrd ne crée que les métadonnées de génération zéro ; le système en cours crée le premier instantané à la demande ou à l'arrêt. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Création uniquement | Couche de chiffrement optionnelle pour une nouvelle session `raw`, `dynfilefs`, `dynblk`, ou `vmdk` . `perchencrypt=luks` nécessite la capacité `luks-layer-v1` initramfs versionnée. Les sessions existantes dérivent leur chiffrement uniquement de `session_encryption[N]`, ce paramètre ne les réinterprète ni ne les convertit. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Création uniquement | Sélectionne la compression backend DynBlk pour une nouvelle session DynBlk : `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`. Le codec du noyau choisi doit être disponible. Lorsque `perchencrypt=luks` encapsule DynBlk, MiniOS force la compression DynBlk à `none`. VMDK ne propose aucune compression : le démarrage ignore un codec non-`none` avec un avertissement. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | À chaque démarrage | Active le chemin de reprise de persistance hérité. Contrairement à `perchdir=resume`, il ne crée pas automatiquement de remplacement compatible si aucune session par défaut utilisable n'existe. | `perch` |
| `toram` | À chaque démarrage | Un `toram` seul est `full`. Avec la persistance, la copie de niveau supérieur de full `*` omet les fichiers cachés ; sans persistance, elle omet `changes` mais copie les autres éléments de niveau supérieur, y compris les fichiers cachés. Trim copie les `config.conf` requis, les fichiers réguliers `authorized_keys`, les modules sélectionnés de niveau supérieur et récursifs, ainsi que l'arborescence complète `changes/` lorsque la persistance est demandée ; elle omet `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, les journaux, autres données non liées aux modules, et le niveau séparé de module de persistance. Aucun mode ne vérifie d'abord la capacité de RAM. Un stockage de persistance copié sur RAM n'est pas durable et les modifications ne sont pas recopiées. Retirez le support uniquement après avoir confirmé que la source, les boucles et les mappages ont bien été détachés. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | À chaque démarrage | Démarre en mode console texte. | `text` |
| `automount` | À chaque démarrage | Active le montage automatique des périphériques de stockage. | `automount` |
| `debug` | À chaque démarrage | Active des diagnostics supplémentaires au démarrage. | `debug` |
| `nozram` | À chaque démarrage | Désactive le swap zram. | `nozram` |
| `zramsize` | À chaque démarrage | Définit la taille du swap zram en Mio. Si omis, MiniOS la calcule à partir de la RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | À chaque démarrage | Sélectionne `lzo`, `lzo-rle`, `lz4`, `lz4hc`, ou `zstd` ; la disponibilité dépend du noyau en cours d'exécution. Si omis, la valeur par défaut du noyau est conservée. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | À chaque démarrage | Définit la cible systemd par défaut. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | À chaque démarrage | Active les services systemd spécifiés au démarrage. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | À chaque démarrage | Désactive les services systemd spécifiés au démarrage. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | À chaque démarrage | Désactive le changement automatique de résolution d'écran dans les machines virtuelles. La valeur par défaut XFCE est 1280x800. | `novirtres` |
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
| `nox11autologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique graphique ; la configuration persistante existante n'est pas supprimée. | `nox11autologin` |
| `xorg-driver` | À chaque démarrage | Sélectionne un pilote Xorg à la place de l'autodétection. | `xorg-driver=nouveau` |
| `xorg-resolution` | À chaque démarrage | Définit la résolution Xorg à la place de l'autodétection. | `xorg-resolution=1920x1080` |
| `module-mode` | À chaque démarrage | Avec `merged`, intègre les modifications de configuration dans le système live en cours d'exécution. | `module-mode=merged` |
| `link-user-dirs` | À chaque démarrage | Lie les répertoires utilisateurs gérés à un support MiniOS en écriture. Cette option est exclusive avec `bind-user-dirs` et indisponible avec tout mode `toram` ou si la session de persistance active est chiffrée avec LUKS. Le chiffrement actif est déterminé à partir de la session en cours, et non de la demande de création `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | À chaque démarrage | Monte les répertoires utilisateurs gérés depuis un support MiniOS en écriture. Les mêmes restrictions `toram` et de chiffrement de session active s'appliquent que pour `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | À chaque démarrage | Définit l'emplacement relatif au support utilisé par `link-user-dirs` ou `bind-user-dirs`. Par défaut : `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | À chaque démarrage | Récupère et exécute des hooks depuis le système de fichiers, le support live ou des URL compatibles wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considérations de sécurité

La ligne de commande du noyau est en texte clair et généralement visible dans la configuration du bootloader, `/proc/cmdline`, ainsi que dans les diagnostics. N’incluez pas de secrets réutilisables dans `root-password=` ou `user-password=`. Privilégiez les paramètres `*-crypted` correspondants, tout en considérant les hachages de mots de passe exposés comme sensibles.

Les hooks s’exécutent avec les privilèges du code de démarrage. Un `http://` hook n’offre ni chiffrement du transport ni authentification du serveur, donc toute personne pouvant modifier le chemin réseau peut le remplacer. Utilisez uniquement des mécanismes de contenu et de distribution fiables ; n’utilisez pas de hook HTTP non authentifié pour un démarrage sensible à la sécurité.

Séparez les commandes par des espaces. Consultez les `man bootparam` pages de référence pour plus de paramètres du noyau communs à toutes les distributions Linux.

Pour plus d’informations sur les paramètres live-config, consultez [live-config](/reference/configuration/live-config).

Pour le chargement de MiniOS via le réseau (PXE et HTTP ISO), voir [Démarrage réseau](/reference/boot-process/Network-Boot).
