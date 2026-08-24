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

| Paramètre | Application | Description | Exemple |
|---|---|---|---|
| `from` | À chaque démarrage | Charge les données MiniOS depuis un répertoire, un périphérique ou une image ISO. Une ISO distante via **`http://` uniquement** lance le [démarrage réseau](/installation/Network-Boot.md) (httpfs2). | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | À chaque démarrage | Charge uniquement les modules `.sb` correspondant à un nom, une liste, une expression régulière ou une plage numérique prise en charge. Filtre également les modules copiés par `toram=trim`. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | À chaque démarrage | Exclut les modules `.sb` correspondants, y compris depuis `toram=trim`. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | À chaque démarrage | Définit l’extension du bundle. Par défaut : `sb`. | `bext=mymod` |
| `timing` | À chaque démarrage | Active l’affichage du temps de démarrage. | `timing` |
| `union` | À chaque démarrage | Sélectionne le système de fichiers union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | À chaque démarrage | **Démarrage réseau (PXE) uniquement.** Adresse statique pour le téléchargement initial. Format : `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP par défaut **7529**). Un `ip=` non vide force le téléchargement des données PXE et ignore les supports locaux. Ce n’est pas la configuration NetworkManager de session. Voir [Démarrage réseau](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | À chaque démarrage | Taille du cache httpfs en Mo pour le démarrage réseau ISO HTTP (`from=http://…`). Voir [Démarrage réseau](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | À chaque démarrage | Ouvre un shell de débogage à la fin de l’étape initramfs. | `rd.break` |
| `perchdir` | À chaque démarrage | Sélectionne une session de persistance numérotée ou une action : `resume`, `new` ou `ask`. Un périphérique/chemin ou la forme `askdisk` permet de choisir un autre emplacement de persistance. Sans paramètre de persistance, MiniOS démarre sans données persistantes. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | À chaque démarrage | Taille du conteneur pour `dynfilefs`, `raw` et `luks` ; non applicable à `native` ou `squashfs`. Accepte un nombre entier en Mo ou un suffixe `M`/`MB`, `G`/`GB` ou `T`/`TB` ; Go et To sont convertis en 1000 Mo et 1 000 000 Mo. La limite est de 1 000 000 Mo, plafonnée par l’espace disponible après `perchreserve` ; les fichiers raw et LUKS sont limités à 4000 Mo sur FAT32. Les nouveaux conteneurs raw et LUKS sont par défaut à 4000 Mo. Les DynFileFS créés par initramfs utilisent par défaut la capacité disponible arrondie à 1000 Mo ; le Session Manager les limite à 4000 Mo par défaut. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | À chaque démarrage | Espace libre, en Mio, conservé sur le périphérique de persistance. Les nouveaux conteneurs ou ceux en expansion ne l’utilisent pas, et MiniOS avertit lorsque l’espace libre atteint ce seuil. Par défaut : 256 ; maximum : 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | À chaque démarrage | Mode de stockage de la persistance.<br>`native` (par défaut) : un répertoire sur un système de fichiers POSIX inscriptible.<br>`dynfilefs` : un conteneur extensible, y compris sur FAT32, NTFS ou exFAT.<br>`raw` : une image ext4 de taille fixe.<br>`luks` : un conteneur ext4 chiffré LUKS2 ; la création et le déverrouillage se font sur la console et nécessitent le support crypt dans l’initramfs.<br>`squashfs` : un instantané compressé existant, décompressé pour la session. Le Session Manager peut créer et sauvegarder des instantanés SquashFS à partir du système en cours d’exécution ; l’initramfs peut les reprendre mais pas les créer. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | À chaque démarrage | Active la persistance et reprend la dernière session. Équivalent à `perchdir=resume`. | `perch` |
| `toram` | À chaque démarrage | Copie MiniOS en RAM. Sans valeur, utilise `full` ; `full` copie tout le répertoire MiniOS, tandis que `trim` copie l’ensemble de modules sélectionné par `load` et `noload`. Les modifications persistantes sont incluses si la persistance est demandée. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | À chaque démarrage | Démarre en mode console texte. | `text` |
| `automount` | À chaque démarrage | Active le montage automatique des périphériques de stockage. | `automount` |
| `debug` | À chaque démarrage | Active des diagnostics supplémentaires au démarrage. | `debug` |
| `nozram` | À chaque démarrage | Désactive le swap zram. | `nozram` |
| `zramsize` | À chaque démarrage | Définit la taille du swap zram en Mio. Si omis, MiniOS la calcule selon la RAM totale. | `zramsize=512`<br>`zramsize=2048` |
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
| `keyboard-variants` | À chaque démarrage | Définit les variantes de clavier séparées par des virgules, correspondant aux dispositions. | `keyboard-variants=,dvorak` |
| `keyboard-options` | À chaque démarrage | Définit les options du clavier. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuration initiale | Empêche live-config d’accorder les privilèges sudo et policykit. | `noroot` |
| `noautologin` | À chaque démarrage | Empêche live-config de configurer la connexion automatique console et graphique ; la configuration persistante existante n’est pas supprimée. | `noautologin` |
| `nottyautologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique console ; la configuration persistante existante n’est pas supprimée. | `nottyautologin` |
| `nox11autologin` | À chaque démarrage | Empêche uniquement la configuration de la connexion automatique graphique ; la configuration persistante existante n’est pas supprimée. | `nox11autologin` |
| `xorg-driver` | À chaque démarrage | Sélectionne un pilote Xorg au lieu de l’auto-détection. | `xorg-driver=nouveau` |
| `xorg-resolution` | À chaque démarrage | Définit la résolution Xorg au lieu de l’auto-détection. | `xorg-resolution=1920x1080` |
| `module-mode` | À chaque démarrage | Avec `merged`, intègre les modifications de configuration dans le système live en cours d’exécution. | `module-mode=merged` |
| `hooks` | À chaque démarrage | Récupère et exécute des hooks depuis le système de fichiers, le support live ou des URLs compatibles wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Séparez les commandes par des espaces. Consultez les pages de référence `man bootparam` pour les autres paramètres du noyau communs à toutes les distributions Linux.

Pour plus de détails sur les paramètres live-config, voir [live-config](/configuration/live-config.md).

Pour charger MiniOS via le réseau (PXE et ISO HTTP), voir [Démarrage réseau](/installation/Network-Boot.md).
