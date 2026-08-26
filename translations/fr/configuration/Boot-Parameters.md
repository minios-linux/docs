# Paramètres de démarrage

## Comment utiliser les paramètres de démarrage

Les paramètres de démarrage permettent de personnaliser le lancement de MiniOS. Séparez les paramètres par des espaces sur la ligne de commande du noyau.

### Syslinux

- Appuyez sur <kbd>Échap</kbd> pendant la séquence de démarrage de MiniOS pour accéder au menu de démarrage.
- Appuyez sur <kbd>Tab</kbd> pour modifier les options de démarrage.
- Saisissez les paramètres puis appuyez sur <kbd>Entrée</kbd> pour démarrer.

### GRUB

- Appuyez sur <kbd>E</kbd> dans le menu GRUB.
- Modifiez les paramètres de démarrage à la fin de la ligne de commande.
- Appuyez sur <kbd>F10</kbd> pour démarrer avec les nouveaux réglages.

## Paramètres de démarrage

La colonne « Application » distingue les paramètres normalement acceptés à chaque démarrage des paramètres de compte destinés à la configuration initiale. Avec la persistance, les composants live-config ne s’exécutent normalement qu’une seule fois ; voir [live-config](/configuration/live-config.md).

Ce tableau sert de référence rapide. La priorité des sources et les formes acceptées de `from=`
sont définies dans [Découverte du système Initrd](/configuration/Initrd-System-Discovery.md),
le filtrage des modules dans [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md),
la sélection de la persistance dans [Persistance Initrd](/configuration/Initrd-Persistence.md),
et les combinaisons supportées dans [Modes de démarrage](/configuration/Boot-Modes.md).

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `from` | À chaque démarrage | Charge les données MiniOS depuis un répertoire, un chemin de périphérique supporté ou une image ISO. Les formes UUID, PARTUUID et by-id ne sont pas interprétées. Une URL littérale **`http://` only** a priorité sur `ip=` et lance un [démarrage réseau](/installation/Network-Boot.md) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | À chaque démarrage | Garde les candidats `.sb` dont le chemin correspond à une expression régulière étendue non ancrée ; les virgules deviennent des alternatives, et une plage numérique ascendante entière bénéficie d’une expansion spéciale. Filtre également `toram=trim`. Peut exclure des modules essentiels ou du noyau et rendre le système non amorçable. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | À chaque démarrage | Exclut les candidats dont le chemin correspond à une expression régulière étendue non ancrée, y compris depuis `toram=trim` ; appliqué après `load` et peut exclure des modules essentiels ou du noyau. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | À chaque démarrage | Définit l’extension du bundle. Par défaut : `sb`. La coordination avec le noyau utilise toujours les noms littéraux `.sb`, donc une extension personnalisée ne peut pas coordonner le module `01-kernel`. | `bext=mymod` |
| `timing` | À chaque démarrage | Active l’affichage du temps de démarrage. | `timing` |
| `union` | À chaque démarrage | Sélectionne le système de fichiers union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | À chaque démarrage | Adresse statique pour la récupération réseau précoce. Format : `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE par défaut **7529**). Une valeur littérale `from=http://...` a priorité sur `ip=` et utilise ses champs d’adressage ; sinon, toute valeur `ip=` non vide force le téléchargement PXE des données et ignore les supports locaux. Ceci n’est pas une configuration NetworkManager de session. Voir [Démarrage réseau](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | À chaque démarrage | Taille du cache httpfs en Mio pour le démarrage réseau ISO HTTP (`from=http://…`). Voir [Démarrage réseau](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | À chaque démarrage | Ouvre un shell de débogage à la fin de l’étape initramfs. | `rd.break` |
| `perchdir` | À chaque démarrage | Sélectionne une session de persistance numérotée ou une action : `resume`, `new` ou `ask`. Un sélecteur numérique inexistant peut revenir à la valeur par défaut des métadonnées ; il ne réserve ni ne crée ce numéro. Un périphérique/chemin ou une forme `askdisk` sélectionne un autre emplacement de persistance. Utilisez un suffixe délimité par deux-points pour un chemin personnalisé. Sans paramètre de persistance, MiniOS démarre proprement. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | À chaque démarrage | Taille du conteneur pour `dynfilefs`, `raw` et `luks` ; ne s’applique pas à `native` ni à `squashfs`. Un nombre seul ou une valeur `M`/`MB` est alloué en Mio ; `G`/`GB` et `T`/`TB` sont convertis en 1000 et 1 000 000 Mio. La limite est de 1 000 000 Mio, plafonnée par l’espace disponible après `perchreserve`. Le gestionnaire de session limite les fichiers raw et LUKS à 4000 Mio sur FAT32 ; l’initrd LUKS applique ce plafond, mais une demande raw initrd surdimensionnée peut échouer au lieu d’être réduite. Les nouveaux conteneurs raw et LUKS sont par défaut à 4000 Mio. DynFileFS créé par initramfs utilise par défaut la capacité disponible arrondie à 1000 Mio ; le gestionnaire de session le fixe par défaut à 4000 Mio. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | À chaque démarrage | Espace libre, en Mio, conservé sur le périphérique de persistance. Les nouveaux conteneurs ou ceux en expansion ne l’utilisent pas, et MiniOS avertit lorsque l’espace libre l’atteint. Par défaut : 256 ; maximum : 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | À chaque démarrage | Mode de stockage de la persistance.<br>`native` (par défaut) : un répertoire sur un système de fichiers POSIX inscriptible.<br>`dynfilefs` : un conteneur extensible, y compris sur FAT32, NTFS ou exFAT.<br>`raw` : une image ext4 de taille fixe.<br>`luks` : un conteneur ext4 chiffré LUKS2 ; la création et le déverrouillage nécessitent une invite sur la console et le support du chiffrement dans l’initramfs.<br>`squashfs` : un instantané compressé existant décompressé pour la session. Le gestionnaire de session peut créer et sauvegarder des instantanés SquashFS à partir du système en cours d’exécution ; l’initramfs peut les reprendre mais pas les créer. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | À chaque démarrage | Active le chemin de reprise de persistance hérité. Contrairement à `perchdir=resume`, il ne crée pas automatiquement de remplacement compatible lorsqu’aucune session par défaut utilisable n’existe. | `perch` |
| `toram` | À chaque démarrage | Un `toram` seul équivaut à `full`. Avec la persistance, la copie `*` de niveau supérieur omet les fichiers cachés ; sans persistance, elle omet `changes` mais copie les autres entrées de niveau supérieur, y compris les fichiers cachés. Trim copie les `config.conf` requis, les fichiers réguliers `authorized_keys`, certains modules de niveau supérieur et récursifs, et l’arborescence complète `changes/` lorsque la persistance est demandée ; elle omet `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, les journaux, d’autres données non liées aux modules, et le niveau séparé des modules de persistance. Aucun mode ne vérifie la capacité de la RAM au préalable. Un stockage de persistance copié en RAM n’est pas durable, et les modifications ne sont pas recopiées. Retirez le support uniquement après avoir confirmé que la source, les boucles et les mappings ont bien été détachés. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | À chaque démarrage | Démarre en mode console texte. | `text` |
| `automount` | À chaque démarrage | Active le montage automatique des périphériques de stockage. | `automount` |
| `debug` | À chaque démarrage | Active des diagnostics supplémentaires au démarrage. | `debug` |
| `nozram` | À chaque démarrage | Désactive le swap zram. | `nozram` |
| `zramsize` | À chaque démarrage | Définit la taille du swap zram en Mio. Si omis, MiniOS la calcule à partir de la RAM totale. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | À chaque démarrage | Sélectionne `lzo`, `lzo-rle`, `lz4`, `lz4hc` ou `zstd` ; la disponibilité dépend du noyau en cours d’exécution. Si omis, la valeur par défaut du noyau est conservée. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | À chaque démarrage | Définit la cible systemd par défaut. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | À chaque démarrage | Active les services systemd spécifiés au démarrage. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | À chaque démarrage | Désactive les services systemd spécifiés au démarrage. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | À chaque démarrage | Désactive le changement automatique de résolution d’écran dans les machines virtuelles. La valeur par défaut XFCE est 1280x800. | `novirtres` |
| `virtres` | À chaque démarrage | Définit la résolution d’écran XFCE dans les machines virtuelles. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | À chaque démarrage | Exécute uniquement les composants live-config listés, dans l’ordre des composants. | `components=hostname,user-setup,sudo` |
| `nocomponents` | À chaque démarrage | Exécute tous les composants live-config sauf ceux listés. | `nocomponents=anacron,apport` |
| `hostname` | À chaque démarrage | Définit le nom d’hôte du système. | `hostname=minios` |
| `username` | Configuration initiale | Définit le nom d’utilisateur créé pour la connexion automatique. | `username=live` |
| `user-default-groups` | Configuration initiale | Définit les groupes par défaut de l’utilisateur créé. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuration initiale | Définit le nom complet de l’utilisateur créé. | `user-fullname="MiniOS Live User"` |
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
| `noroot` | Configuration initiale | Empêche live-config d’accorder les privilèges sudo et policykit. | `noroot` |
| `noautologin` | À chaque démarrage | Empêche live-config de configurer la connexion automatique console et graphique ; la configuration persistante existante n’est pas supprimée. | `noautologin` |
| `nottyautologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique console ; la configuration persistante existante n’est pas supprimée. | `nottyautologin` |
| `nox11autologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique graphique ; la configuration persistante existante n’est pas supprimée. | `nox11autologin` |
| `xorg-driver` | À chaque démarrage | Sélectionne un pilote Xorg au lieu de l’autodétection. | `xorg-driver=nouveau` |
| `xorg-resolution` | À chaque démarrage | Définit la résolution Xorg au lieu de l’autodétection. | `xorg-resolution=1920x1080` |
| `module-mode` | À chaque démarrage | Avec `merged`, intègre les modifications de configuration dans le système live en cours d’exécution. | `module-mode=merged` |
| `hooks` | À chaque démarrage | Récupère et exécute des hooks depuis le système de fichiers, le support live ou des URLs supportées par wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considérations de sécurité

La ligne de commande du noyau est en texte clair et est généralement visible dans la configuration du chargeur d’amorçage,
`/proc/cmdline` et les diagnostics. N’insérez pas de secrets réutilisables dans
`root-password=` ou `user-password=`. Préférez les paramètres `*-crypted`
correspondants, tout en considérant que les hachages de mot de passe exposés restent sensibles.

Les hooks s’exécutent en tant que code de démarrage privilégié. Un hook `http://` ne bénéficie ni du chiffrement du transport ni de l’authentification du serveur, donc toute personne capable de modifier le chemin réseau peut le remplacer. Utilisez uniquement des contenus et des mécanismes de diffusion de confiance ; n’utilisez pas de hook HTTP non authentifié pour un démarrage sensible à la sécurité.

Séparez les commandes par des espaces. Consultez les pages de référence `man bootparam` pour des paramètres noyau supplémentaires communs à toutes les distributions Linux.

Pour plus d’informations sur les paramètres live-config, voir [live-config](/configuration/live-config.md).

Pour charger MiniOS par le réseau (PXE et ISO HTTP), voir [Démarrage réseau](/installation/Network-Boot.md).
