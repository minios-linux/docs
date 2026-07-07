# Paramètres de démarrage

## Comment utiliser les paramètres de démarrage

Les paramètres de démarrage, également appelés paramètres du noyau, sont des commandes que vous pouvez saisir pour personnaliser le processus de démarrage de MiniOS. Ils permettent, par exemple, de désactiver la détection matérielle, de démarrer MiniOS depuis un périphérique spécifique, et bien plus encore.

### Pour Syslinux :

- Appuyez sur <kbd>Échap</kbd> pendant la séquence de démarrage de MiniOS pour accéder au menu de démarrage.
- Appuyez sur <kbd>Tab</kbd> pour modifier les options de démarrage.
- Saisissez les paramètres souhaités puis appuyez sur Entrée pour démarrer.

### Pour Grub :

- Appuyez sur <kbd>E</kbd> lorsque le menu grub s'affiche.
- Modifiez les paramètres de démarrage à la fin de la ligne de commande.
- Appuyez sur <kbd>F10</kbd> pour démarrer avec les nouveaux réglages.

## Tableau des paramètres de démarrage

Le tableau ci-dessous répertorie les paramètres de démarrage disponibles dans MiniOS, leurs fonctions et des exemples d'utilisation.

**Légende :**
- 🔒 **Une seule fois** – Appliqué uniquement au premier démarrage, ne peut pas être modifié lors des démarrages suivants
- 🔄 **Reconfigurable** – Peut être modifié à chaque démarrage et réappliqué


| Paramètre | Reconfigurable | Description | Exemple d'utilisation |
|---|---|---|---|
| `from` | 🔄 | Charge les données MiniOS depuis un dossier, un périphérique ou un fichier ISO spécifié. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Permet de charger des modules `.sb` spécifiques à l'aide d'une expression régulière. Fonctionne avec la commande `toram=trim`, ce qui permet de ne charger en RAM que les modules sélectionnés.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Désactive le chargement de modules `.sb` spécifiques à l'aide d'une expression régulière. Fonctionne avec la commande `toram=trim` pour exclure certains modules du chargement en RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | 🔄 | Définit l'extension de fichier pour les bundles (modules). Par défaut : `sb`. | `bext=mymod` |
| `timing` | 🔄 | Active l'affichage du temps de démarrage pour le débogage des performances. | `timing` |
| `union` | 🔄 | Force l'utilisation d'un système de fichiers union spécifique. | `union=aufs`<br>`union=overlayfs` |
| `ip` | 🔄 | Définit une adresse IP statique pour les interfaces réseau, utilisé pour le démarrage PXE. Format : `<client-ip>:<server-ip>:<gateway-ip>:<netmask>`. | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | 🔄 | Définit la taille du cache en Mo pour les données chargées via HTTP. | `cache=512` |
| `rd.break` | 🔄 | Interrompt le processus de démarrage à la fin de l’étape initramfs et ouvre un shell de débogage. | `rd.break` |
| `perchdir` | 🔄 | Sélectionne un profil ou effectue une action avec un profil. Accepte le numéro de profil ou les mots-clés `resume` (reprendre la session précédente), `new` (démarrer une nouvelle session) ou `ask` (choisir la session au démarrage). Si omis, MiniOS démarre en mode « propre ». | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Définit la taille du système de fichiers virtuel DynFileFS (en Mo), utilisé pour stocker des données sur des systèmes de fichiers non-Linux (ex : FAT32, NTFS). Par défaut : 16 Go. Utilisez cette option si votre disque cible est plus petit. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Mode d’enregistrement des modifications persistantes.<br>`native` (par défaut) – stockage direct sur les systèmes de fichiers compatibles POSIX ;<br>`dynfilefs` – stockage dans des fichiers image dynamiquement extensibles ;<br>`raw` – stockage dans un fichier image de taille fixe.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `perch` | 🔄 | Active la persistance et reprend la dernière session utilisée. Équivalent à `perchdir=resume`. | `perch` |
| `toram` | 🔄 | Copie le système en RAM. Peut prendre les valeurs `trim` ou `full`. Si aucun paramètre n'est précisé, la valeur par défaut est `full`.<br>`trim` – seuls les fichiers nécessaires sont copiés, selon les filtres `load` et `noload`. Si des paramètres `perch` sont spécifiés, les modifications sont aussi chargées.<br>`full` – tout le dossier minios est chargé, à l’exception des modifications sauf si `perch` est spécifié. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Désactive le serveur X et démarre en mode console texte. | `text` |
| `automount` | 🔄 | Active le montage automatique des périphériques de stockage. | `automount` |
| `debug` | 🔄 | Active l'affichage des informations de débogage au démarrage. | `debug` |
| `nozram` | 🔄 | Désactive le swap zram. | `nozram` |
| `zramsize` | 🔄 | Définit la taille du swap zram (en Mo). | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Spécifie l’algorithme de compression zram. Options disponibles pour Debian 12 : `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Par défaut : `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Définit la cible systemd par défaut. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Active les services systemd spécifiés au démarrage. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Désactive les services systemd spécifiés au démarrage. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Désactive le changement automatique de résolution d’écran dans les machines virtuelles. La résolution par défaut dans les machines virtuelles est 1280x800. (Applicable uniquement dans l’environnement XFCE.) | `novirtres` |
| `virtres` | 🔄 | Définit la résolution d’écran dans les machines virtuelles (largeur x hauteur). (Applicable uniquement dans l’environnement XFCE.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Spécifie quels composants live-config exécuter. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Spécifie quels composants live-config NE PAS exécuter. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Définit le nom d’hôte du système. | `hostname=minios` |
| `username` | 🔒 | Définit le nom d’utilisateur pour la connexion automatique. | `username=live` |
| `user-default-groups` | 🔒 | Définit les groupes par défaut de l’utilisateur. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Définit le nom complet de l’utilisateur. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Définit le mot de passe root en clair. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Définit le mot de passe root chiffré. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Définit le mot de passe utilisateur en clair. | `user-password=live` |
| `user-password-crypted` | 🔒 | Définit le mot de passe utilisateur chiffré. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Définit la locale du système. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Définit le fuseau horaire du système. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Définit le modèle de clavier. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Définit les dispositions de clavier (séparées par des virgules). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Définit les variantes de clavier (séparées par des virgules). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Définit les options du clavier. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Désactive les privilèges sudo et policykit. | `noroot` |
| `noautologin` | 🔄 | Désactive la connexion automatique en console et en mode graphique. | `noautologin` |
| `nottyautologin` | 🔄 | Désactive uniquement la connexion automatique en console. | `nottyautologin` |
| `nox11autologin` | 🔄 | Désactive uniquement la connexion automatique graphique. | `nox11autologin` |
| `xorg-driver` | 🔄 | Définit le pilote xorg au lieu de l’auto-détection. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Définit la résolution xorg au lieu de l’auto-détection. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Définit le mode du module de configuration live. Si défini sur « merged », intègre dynamiquement les changements de configuration. | `module-mode=merged` |
| `hooks` | 🔄 | Exécute des fichiers arbitraires depuis le système de fichiers, un support ou une URL. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Séparez les commandes par des espaces. Consultez les pages de référence `man bootparam` pour les paramètres du noyau communs à toutes les distributions Linux.

Pour plus d’informations sur les paramètres live-config, consultez [live-config](/configuration/live-config.md).
