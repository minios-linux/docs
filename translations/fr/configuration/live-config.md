# LIVE-CONFIG

**live-config** - Composants de configuration du système

**live-config** contient les composants qui configurent un système live lors du processus de démarrage (fin de l’espace utilisateur).

Le démarrage réseau dans l’initramfs (`ip=`, PXE, `from=http://…`) constitue une couche LiveKit distincte et n’est **pas** géré par live-config. Voir [Démarrage réseau](/installation/Network-Boot.md).

**live-config** peut être configuré via des paramètres de démarrage ou des fichiers de configuration préparés par l’initramfs. La ligne de commande du noyau réelle est ajoutée après les valeurs `LIVE_CONFIG_CMDLINE` fournies par fichier, donc les paramètres de démarrage ultérieurs prennent le dessus. Lorsqu’on utilise la persistance, les composants de **live-config** ne sont normalement exécutés qu’une seule fois.

Si *live-build*(7) est utilisé pour construire le système live, les paramètres live-config utilisés par défaut peuvent être définis via l’option `--bootappend-live`, voir la page de manuel de *lb_config*(1).

## Paramètres de démarrage (composants)

**live-config** n’est activé que si `boot=live` est utilisé comme paramètre de démarrage. De plus, il faut indiquer à **live-config** quels composants exécuter via le paramètre `live-config.components` ou quels composants ne pas exécuter via le paramètre `live-config.nocomponents`. Si `live-config.components` et `live-config.nocomponents` sont utilisés simultanément, ou si l’un des deux est spécifié plusieurs fois, c’est toujours la dernière valeur qui prévaut sur les précédentes.

- **live-config.components | components** : Tous les composants sont exécutés. C’est le comportement par défaut des images live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn** : Seuls les composants spécifiés sont exécutés. Notez que l’ordre est important, par exemple, `live-config.components=sudo,user-setup` ne fonctionnerait pas car l’utilisateur doit être ajouté avant de pouvoir être configuré pour sudo. Consultez les noms de fichiers des composants dans `/usr/lib/live/config` pour connaître leur numéro d’ordre.
- **live-config.nocomponents | nocomponents** : Aucun composant n’est exécuté. Cela revient à ne pas utiliser `live-config.components` ou `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn** : Tous les composants sont exécutés, sauf ceux spécifiés.

## Paramètres de démarrage (options)

Certains composants individuels peuvent modifier leur comportement selon un paramètre de démarrage.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn** : Récupère et applique un ou plusieurs fichiers de préconfiguration debconf. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://`. Le mot-clé `filesystem` extrait les fichiers dans `/usr/lib/live/config-preseed/` ; `medium` extrait les fichiers dans `minios/config-preseed/` sur le support live détecté. Les fichiers locaux explicites peuvent utiliser des chemins comme `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` à la racine du live. Les entrées séparées par des barres verticales sont traitées dans l’ordre indiqué ; les fichiers extraits par mot-clé suivent l’ordre de glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME** : Permet de définir le nom d’hôte du système. La valeur par défaut est `minios`.
- **live-config.username=USERNAME | username=USERNAME** : Permet de définir le nom d’utilisateur créé pour la connexion automatique. La valeur par défaut est `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn** : Permet de définir les groupes par défaut des utilisateurs créés pour la connexion automatique. La valeur par défaut est `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"** : Permet de définir le nom complet des utilisateurs créés pour la connexion automatique. Sur MiniOS, la valeur par défaut est `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD** : Permet de définir le mot de passe root en clair.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD** : Permet de définir le mot de passe root sous forme chiffrée.
- **live-config.user-password=PASSWORD | user-password=PASSWORD** : Permet de définir le mot de passe utilisateur en clair.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD** : Permet de définir le mot de passe utilisateur sous forme chiffrée.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn** : Permet de définir la locale du système, par exemple `de_CH.UTF-8`. La valeur par défaut est `en_US.UTF-8`. Si la locale sélectionnée n’est pas déjà disponible sur le système, elle est générée automatiquement à la volée.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE** : Permet de définir le fuseau horaire du système, par exemple `Europe/Zurich`. La valeur par défaut est `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL** : Permet de changer le modèle de clavier. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn** : Permet de changer les dispositions de clavier. Si plusieurs sont spécifiées, les outils de l’environnement de bureau permettent de basculer sous X11. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn** : Permet de changer les variantes de clavier. Si plusieurs sont spécifiées, il faut indiquer autant de variantes que de dispositions, elles seront associées une à une dans l’ordre indiqué. Les valeurs vides sont autorisées. Les outils de l’environnement de bureau permettent de basculer entre chaque paire disposition/variante sous X11. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS** : Permet de changer les options du clavier. Aucune valeur par défaut n’est définie.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn** : Permet de désactiver des services sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no** : Permet d’indiquer si l’horloge matérielle du système est réglée sur UTC ou non. La valeur par défaut est `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER** : Permet de définir le gestionnaire de session X via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER** : Permet de définir le pilote xorg au lieu de l’auto-détection. Si un identifiant PCI est spécifié dans `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont trouvés, le paramètre de démarrage prévaut.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION** : Permet de définir la résolution xorg au lieu de l’auto-détection, par exemple 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER** : Permet de définir le pilote WLAN au lieu de l’auto-détection. Si un identifiant PCI est spécifié dans `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont trouvés, le paramètre de démarrage prévaut.
- **live-config.module-mode=MODE | module-mode=MODE** : Permet de spécifier le mode de module pour la configuration live. Lorsque ce paramètre est « merged », le système met à jour les comptes utilisateurs, reconstruit les caches et rafraîchit les paramètres des paquets afin que les modifications de configuration soient intégrées dynamiquement dans le système en cours d’exécution.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn** : Récupère et exécute des fichiers arbitraires depuis un fichier temporaire dans le système live en cours d’exécution. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://` ; les interpréteurs requis et autres dépendances doivent déjà être installés. Le mot-clé `filesystem` extrait les fichiers dans `/usr/lib/live/config-hooks/` ; `medium` extrait les fichiers dans `minios/config-hooks/` sur le support live détecté (avec un repli sur le chemin ISO dans le composant hook). Les fichiers locaux explicites peuvent utiliser `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` à la racine du live. Les entrées séparées par des barres verticales sont exécutées dans l’ordre indiqué ; les fichiers extraits par mot-clé suivent l’ordre de glob shell. Des exemples sont installés sous `/usr/share/doc/live-config/examples/hooks/`.

> **Avertissement de sécurité :** `live-config` s’exécute en tant que root. Les hooks sont rendus exécutables et s’exécutent en tant que root, et les preseeds modifient la base de données debconf du système avec les privilèges root. Le HTTP et FTP en clair n’authentifient pas le contenu téléchargé et n’offrent aucune protection d’intégrité. Privilégiez les fichiers locaux vérifiés ou un transport authentifié de confiance avec une vérification d’intégrité indépendante ; n’utilisez pas de hooks ou preseeds distants provenant de réseaux non fiables.

## Paramètres de démarrage (raccourcis)

Pour certains cas d’usage courants qui nécessiteraient de combiner plusieurs paramètres individuels, **live-config** propose des raccourcis. Cela permet à la fois d’avoir un contrôle précis sur toutes les options, tout en gardant les choses simples.

- **live-config.noroot | noroot** : Désactive sudo et policykit, l’utilisateur ne peut pas obtenir de privilèges root sur le système.
- **live-config.noautologin | noautologin** : Désactive à la fois la connexion automatique en console et la connexion automatique graphique.
- **live-config.nottyautologin | nottyautologin** : Désactive la connexion automatique sur la console, sans affecter la connexion automatique graphique.
- **live-config.nox11autologin | nox11autologin** : Désactive la connexion automatique via un gestionnaire d’affichage, sans affecter la connexion automatique tty.

## Paramètres de démarrage (options spéciales)

Pour des cas d’utilisation particuliers, il existe certains paramètres de démarrage spéciaux.

- **live-config.debug | debug** : Active l’affichage des informations de débogage dans live-config.

## Fichiers de configuration

**live-config** peut être configuré (mais non activé) via des fichiers de configuration. Tout, à l’exception des raccourcis pouvant être configurés par un paramètre de démarrage, peut également être configuré via un ou plusieurs fichiers. Si des fichiers de configuration sont utilisés, le paramètre `boot=live` reste nécessaire pour activer **live-config**.

**Remarque :** Si des fichiers de configuration sont utilisés, il est préférable de placer tous les paramètres de démarrage dans la variable **LIVE_CONFIG_CMDLINE**, ou bien de définir les variables individuellement. Si les variables sont définies individuellement, l’utilisateur doit s’assurer que toutes les variables nécessaires sont renseignées pour obtenir une configuration valide.

`live-config` source lui-même `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` selon l’ordre glob du shell. Les fragments ultérieurs peuvent donc remplacer les valeurs du fichier principal ou des fragments précédents. Il ne source pas séparément une seconde couche de configuration média.

Sur les supports MiniOS, les fichiers sources sont `minios/config.conf` et `minios/config.conf.d/*.conf`. Avant le démarrage de `live-config`, l’initramfs MiniOS synchronise ces fichiers avec les fichiers runtime `/etc/live/` en fonction de la date de modification. Un fichier source plus récent remplace son équivalent runtime ; un fichier runtime plus récent n’est recopié que si le répertoire de données MiniOS sélectionné est accessible en écriture. Des horodatages identiques n’entraînent aucune copie, les fichiers manquants sont créés, et aucun fichier n’est supprimé. Il s’agit d’une synchronisation au démarrage, pas d’une surveillance continue. Consultez [Fichier de configuration](/configuration/Configuration-File.md) pour les règles complètes de synchronisation et de priorité entre fichiers et ligne de commande.

En solution de repli pour les implémentations initramfs qui n’ont pas préparé le fichier runtime, les wrappers de démarrage systemd et SysV copient `minios/config.conf` depuis le support détecté uniquement si `/etc/live/config.conf` est absent. Cette solution de secours ne copie pas les fragments `config.conf.d`. L’initramfs MiniOS LiveKit standard effectue la synchronisation précédente à la place.

Les fichiers fragments doivent correspondre à `*.conf`. Des noms comme `vendor.conf` ou `project.conf` sont recommandés ; choisissez les noms lexicaux avec soin car les fragments ultérieurs écrasent les précédents.

Le contenu réel des fichiers de configuration consiste en une ou plusieurs des variables suivantes :

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn** : Cette variable correspond à la ligne de commande du bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn** : Cette variable correspond au paramètre `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME** : Cette variable correspond au paramètre `**live-config.hostname**=*HOSTNAME*`. La valeur par défaut est `minios`.
- **LIVE_USERNAME=USERNAME** : Cette variable correspond au paramètre `**live-config.username**=*USERNAME*`. La valeur par défaut est `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn** : Cette variable correspond au paramètre `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"** : Cette variable correspond au paramètre `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD** : Cette variable correspond au paramètre `**live-config.root-password**=*PASSWORD*`. Elle définit le mot de passe root en clair.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD** : Cette variable correspond au paramètre `**live-config.root-password-crypted**=*PASSWORD*`. Elle définit le mot de passe root chiffré.
- **LIVE_USER_PASSWORD=PASSWORD** : Cette variable correspond au paramètre `**live-config.user-password**=*PASSWORD*`. Elle définit le mot de passe utilisateur en clair.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD** : Cette variable correspond au paramètre `**live-config.user-password-crypted**=*PASSWORD*`. Elle définit le mot de passe utilisateur chiffré.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn** : Cette variable correspond au paramètre `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE** : Cette variable correspond au paramètre `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL** : Cette variable correspond au paramètre `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn** : Cette variable correspond au paramètre `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn** : Cette variable correspond au paramètre `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS** : Cette variable correspond au paramètre `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn** : Cette variable correspond au paramètre `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no** : Cette variable correspond au paramètre `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER** : Cette variable correspond au paramètre `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER** : Cette variable correspond au paramètre `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION** : Cette variable correspond au paramètre `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER** : Cette variable correspond au paramètre `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn** : Cette variable correspond au paramètre `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false** : Cette variable correspond au paramètre `**live-config.link-user-dirs**=true|false`. Elle lie les répertoires de données standards de l’utilisateur au disque MiniOS accessible en écriture. Elle ne peut pas être combinée avec le mode bind ni avec un mode `toram` quelconque.
- **LIVE_BIND_USER_DIRS=true|false** : Cette variable correspond au paramètre `**live-config.bind-user-dirs**=true|false`. Elle monte en bind les répertoires de données standards de l’utilisateur depuis le disque MiniOS accessible en écriture. Elle ne peut pas être combinée avec le mode link ni avec un mode `toram` quelconque.
- **LIVE_USER_DIRS_PATH=PATH** : Cette variable correspond au paramètre `**live-config.user-dirs-path**=*PATH*`. Elle définit un chemin sécurisé à l’intérieur du disque MiniOS FAT32, exFAT ou NTFS. La valeur par défaut est `/minios/userdata` ; les segments point et parent ne sont pas acceptés.

La configuration utilisateur-média ne fusionne jamais automatiquement deux répertoires non vides. Un répertoire local non vide n’est migré que si la destination sur le média est vide. Lorsque la fonctionnalité est désactivée, les données gérées sur le média sont recopiées avant la suppression des liens. Une validation ou une copie échouée laisse les répertoires utilisateur existants en place et consigne la raison dans `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE** : Cette variable contient l’état défini par le paramètre `live-config.module-mode` (ou `module-mode`). Lorsqu’elle est définie à "merged", le système live applique les mises à jour (via minios-update-users, minios-update-cache et minios-update-dpkg) pour fusionner les configurations personnalisées avec l’environnement de base.
- **LIVE_CONFIG_DEBUG=true|false** : Cette variable correspond au paramètre `**live-config.debug**`.

# PERSONNALISATION

**live-config** peut être facilement personnalisé pour des projets dérivés ou une utilisation locale.

## Ajout de nouveaux composants de configuration

Les projets dérivés peuvent placer leurs composants dans /usr/lib/live/config et n’ont rien d’autre à faire, les composants seront appelés automatiquement au démarrage.

Il est préférable de placer les composants dans un paquet debian dédié. Un exemple de paquet contenant un composant exemple se trouve dans /usr/share/doc/live-config/examples.

## Suppression de composants de configuration existants

Il n’est pas vraiment possible de supprimer proprement des composants sans devoir soit fournir un paquet **live-config** modifié localement, soit utiliser dpkg-divert. Cependant, le même résultat peut être obtenu en désactivant les composants concernés via le mécanisme live-config.nocomponents, voir ci-dessus. Pour éviter d’avoir à spécifier à chaque fois les composants désactivés dans le paramètre de démarrage, il est conseillé d’utiliser un fichier de configuration, voir ci-dessus.

Les fichiers de configuration pour le système live lui-même sont idéalement placés dans un paquet debian dédié. Un exemple de paquet contenant une configuration exemple se trouve dans /usr/share/doc/live-config/examples.

# COMPOSANTS

**live-config** propose actuellement les composants suivants dans /usr/lib/live/config.

- **nss-systemd** : supprime ou restaure le module NSS systemd dans /etc/nsswitch.conf pour contourner un problème connu de systemd.
- **debconf** : permet d’appliquer des fichiers de préconfiguration placés sur le support live ou un serveur http/ftp.
- **hostname** : configure /etc/hostname et /etc/hosts.
- **issue-setup** : configure le fichier /etc/issue avec une bannière de bienvenue et les informations de distribution.
- **live-debconfig (passwd)** : configure les mots de passe utilisateur et root via live-debconfig.
- **user-setup** : ajoute un compte utilisateur live.
- **root-setup** : définit ou met à jour le mot de passe root et configure l’environnement de l’utilisateur root.
- **sudo** : accorde les droits sudo à l’utilisateur live.
- **user-media** : configure le montage des supports et la liaison ou le bind des répertoires utilisateur pour les données persistantes.
- **user-ssh-keys** : synchronise les clés SSH à partir des fichiers `authorized_keys.<username>` spécifiques à chaque utilisateur présents sur le support live vers les dossiers personnels des utilisateurs. Prend en charge plusieurs utilisateurs simultanément (par exemple, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales** : configure les locales.
- **tzdata** : configure /etc/timezone.
- **xorg-service** : configure le nom d’utilisateur dans xorg.service.
- **gdm3** : configure la connexion automatique dans gdm3.
- **kdm** : configure la connexion automatique dans kdm.
- **lightdm** : configure la connexion automatique dans lightdm.
- **lxdm** : configure la connexion automatique dans lxdm.
- **nodm** : configure la connexion automatique dans nodm.
- **slim** : configure la connexion automatique dans slim.
- **xinit** : configure la connexion automatique avec xinit.
- **keyboard-configuration** : configure le clavier.
- **sysvinit** : configure sysvinit.
- **sysv-rc** : configure sysv-rc en désactivant les services listés.
- **login** : désactive lastlog.
- **anacron** : désactive anacron.
- **util-linux** : désactive hwclock de util-linux.
- **apport** : désactive apport.
- **gnome-panel-data** : désactive le bouton de verrouillage de l’écran.
- **gnome-power-manager** : désactive l’hibernation.
- **gnome-screensaver** : désactive le verrouillage de l’écran par l’économiseur d’écran.
- **kaboom** : désactive l’assistant de migration KDE (squeeze et plus récents).
- **kde-services** : désactive certains services KDE indésirables (squeeze et plus récents).
- **policykit** : accorde des privilèges utilisateur via policykit.
- **ssl-cert** : régénère les certificats snake-oil ssl.
- **xrdp** : configure xrdp pour la connexion bureau à distance.
- **xfce4-panel** : configure xfce4-panel avec les paramètres par défaut.
- **xscreensaver** : désactive le verrouillage de l’écran par l’économiseur d’écran.
- **broadcom-sta** : configure les pilotes WLAN broadcom-sta.
- **xserver-xorg** : configure xserver-xorg.
- **openssh-server** : recrée les clés hôtes d’openssh-server.
- **hyperv** : configure les paramètres X11 pour améliorer la compatibilité sur les plateformes Microsoft Hyper-V.
- **ntfs3** : gère les règles udev pour la prise en charge de NTFS3.
- **config-module-mode** : configure le mode module système et met à jour les caches, les paramètres utilisateur et dpkg.
- **hooks** : permet d’exécuter des commandes arbitraires à partir d’un fichier placé sur le support live ou un serveur http/ftp.

# FICHIERS

- `minios/config.conf` sur le support de données MiniOS sélectionné (copie source)
- `minios/config.conf.d/*.conf` sur le support de données MiniOS sélectionné (fragments source)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` sur les supports de données sélectionnés en écriture lorsque l’export des journaux est activé
- `/usr/lib/live/config-hooks/*` (hooks `filesystem`)
- `minios/config-hooks/*` sur le support live détecté (hooks `medium`)
- `/usr/lib/live/config-preseed/*` (preseeds `filesystem`)
- `minios/config-preseed/*` sur le support live détecté (preseeds `medium`)

# VOIR AUSSI

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PAGE D’ACCUEIL

Plus d’informations sur **minios-live-config** et le projet MiniOS sont disponibles sur [minios.dev](https://minios.dev) et le [dépôt GitHub](https://github.com/minios-linux/minios-live).

# BUGS

Les bugs peuvent être signalés en ouvrant une issue sur le dépôt GitHub à [MiniOS Issues](https://github.com/minios-linux/minios-live/issues).

# AUTEUR

**live-config** a été écrit à l’origine par Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Depuis 2016, le développement a été poursuivi par l’équipe Debian Live. Depuis 2025, le développement de la version modifiée **minios-live-config** est assuré par l’équipe MiniOS Live.
