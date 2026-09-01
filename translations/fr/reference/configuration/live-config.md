---
updated: 2026-08-31
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** – Composants de configuration système

**live-config** contient les composants qui configurent un système live lors du processus de démarrage (fin de l’espace utilisateur).

Le démarrage réseau dans l’initramfs (`ip=`, PXE, `from=http://…`) constitue une couche LiveKit distincte et n’est **pas** géré par live-config. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

**live-config** peut être configuré via des paramètres de démarrage ou des fichiers de configuration générés par l’initramfs. La ligne de commande réelle du noyau est ajoutée après les valeurs fournies par fichier `LIVE_CONFIG_CMDLINE`, donc les derniers paramètres de démarrage correspondants ont priorité. Les composants qui enregistrent leur état sous `/var/lib/live/config` ne s’exécutent normalement qu’une seule fois ; les composants synchronisés ou sans état peuvent s’exécuter à chaque invocation.

Si *live-build*(7) est utilisé pour construire le système live, les paramètres live-config utilisés par défaut peuvent être définis via l’option `--bootappend-live`, voir la page de manuel de *lb_config*(1).

## Paramètres de démarrage (composants)

**live-config** n’est activé que si `boot=live` est utilisé comme paramètre de démarrage. Par défaut, tous les composants sont exécutés. Le paramètre `live-config.components` permet de restreindre les composants à exécuter, et `live-config.nocomponents` permet d’en exclure certains. Si les deux paramètres sont utilisés, ou si l’un d’eux est spécifié plusieurs fois, la dernière occurrence prévaut.

- **live-config.components | components** : Tous les composants sont exécutés. C’est le comportement par défaut des images live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn** : Seuls les composants spécifiés sont exécutés. L’exécution suit l’ordre défini par le nom de fichier sous `/usr/lib/live/config`, indépendamment de l’ordre dans la liste.
- **live-config.nocomponents | nocomponents** : Aucun composant n’est exécuté.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn** : Tous les composants sont exécutés, sauf ceux spécifiés.

## Paramètres de démarrage (options)

Certains composants individuels peuvent modifier leur comportement via un paramètre de démarrage.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn** : Récupère et applique un ou plusieurs fichiers preseed debconf. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://`. Le mot-clé `filesystem` développe les fichiers dans `/usr/lib/live/config-preseed/` ; `medium` développe les fichiers dans `minios/config-preseed/` sur le support live détecté. Les fichiers locaux explicites peuvent utiliser des chemins comme `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` à la racine du live. Les entrées séparées par des pipes sont traitées dans l’ordre indiqué ; les fichiers développés par un mot-clé suivent l’ordre du glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME** : Permet de définir le nom d’hôte du système. La valeur par défaut est `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off** : Sélectionne la politique réseau filaire. Non défini et `dhcp` laissent le comportement par défaut de l’image. `static` écrit la configuration pour le backend choisi ; `off` désactive la configuration IPv4 automatique pour l’interface sélectionnée.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE** : Sélectionne l’interface filaire. Si omis pour `static` ou `off`, la seule interface filaire non loopback est sélectionnée automatiquement ; zéro ou plusieurs candidats nécessitent une valeur explicite.
- **live-config.network-address=IPV4 | network-address=IPV4** : Définit l’adresse IPv4 statique.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX** : Définit la longueur du préfixe IPv4 de 0 à 32. La valeur statique par défaut est `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4** : Définit la passerelle IPv4 facultative.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2** : Définit les adresses des serveurs DNS, séparées par des virgules.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown** : Sélectionne le backend réseau. `auto` privilégie NetworkManager et bascule sur ifupdown si besoin. `ifupdown` force l’interface en mode non géré par NetworkManager si les deux piles sont installées.
- **live-config.username=USERNAME | username=USERNAME** : Permet de définir le nom d’utilisateur créé pour l’ouverture de session automatique. La valeur par défaut est `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn** : Définit les groupes supplémentaires pour l’utilisateur créé pour l’autologin. Les noms de groupes peuvent être séparés par des virgules ou des espaces. La valeur par défaut MiniOS est `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"** : Permet de définir le nom complet de l’utilisateur créé pour l’autologin. La valeur par défaut MiniOS est `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD** : Permet de définir le mot de passe root en clair.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD** : Permet de définir le mot de passe root sous forme chiffrée.
- **live-config.user-password=PASSWORD | user-password=PASSWORD** : Permet de définir le mot de passe utilisateur en clair.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD** : Permet de définir le mot de passe utilisateur sous forme chiffrée.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn** : Permet de définir la locale du système, par exemple `de_CH.UTF-8`. La valeur par défaut est `en_US.UTF-8`. Si la locale choisie n’est pas déjà disponible, elle est générée à la volée.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE** : Permet de définir le fuseau horaire du système, par exemple `Europe/Zurich`. La valeur par défaut est `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL** : Permet de changer le modèle de clavier. Pas de valeur par défaut.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn** : Permet de changer les dispositions clavier. Si plusieurs sont spécifiées, les outils de l’environnement de bureau permettent de basculer sous X11. Pas de valeur par défaut.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn** : Permet de changer les variantes clavier. Si plusieurs sont spécifiées, il faut autant de valeurs que de dispositions clavier, associées dans l’ordre. Les valeurs vides sont autorisées. Les outils de l’environnement de bureau permettent de basculer entre chaque paire disposition/variante sous X11. Pas de valeur par défaut.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS** : Permet de changer les options clavier. Pas de valeur par défaut.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn** : Permet de désactiver des services sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no** : Permet de définir si l’horloge matérielle est supposée être en UTC ou non. La valeur par défaut est `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER** : Permet de définir le x-session-manager via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER** : Permet de définir le pilote xorg au lieu de l’auto-détection. Si un identifiant PCI est spécifié dans `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont présents, le paramètre de démarrage prévaut.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION** : Permet de définir la résolution xorg au lieu de l’auto-détection, par exemple 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER** : Permet de définir le pilote WLAN au lieu de l’auto-détection. Si un identifiant PCI est spécifié dans `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont présents, le paramètre de démarrage prévaut.
- **live-config.module-mode=simple|merged | module-mode=simple|merged** : Permet de spécifier le mode module pour la configuration live. Lorsque défini sur `merged`, le système met à jour les comptes utilisateurs, reconstruit les caches et rafraîchit les paramètres de paquets pour intégrer dynamiquement les changements de configuration dans le système en cours d’exécution.
- **live-config.link-user-dirs | link-user-dirs** : Lie les répertoires utilisateurs gérés vers le chemin configuré sur le support de données MiniOS.
- **live-config.bind-user-dirs | bind-user-dirs** : Monte en bind les répertoires utilisateurs gérés depuis le chemin configuré sur le support de données MiniOS. Cette option est mutuellement exclusive avec `link-user-dirs`.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH** : Définit le chemin relatif au média utilisé par `link-user-dirs` ou `bind-user-dirs`. La valeur par défaut est `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn** : Récupère et exécute des fichiers arbitraires depuis un fichier temporaire dans le système live en cours d’exécution. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://` ; les interpréteurs requis et autres dépendances doivent déjà être installés. Le mot-clé `filesystem` développe les fichiers dans `/usr/lib/live/config-hooks/` ; `medium` développe les fichiers dans `minios/config-hooks/` sur le support live détecté (avec un repli ISO-path dans le composant hook). Les fichiers locaux explicites peuvent utiliser `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` à la racine du live. Les entrées séparées par des pipes sont exécutées dans l’ordre indiqué ; les fichiers développés par un mot-clé suivent l’ordre du glob shell. Des exemples sont installés sous `/usr/share/doc/live-config/examples/hooks/`.

> **Avertissement de sécurité :** `live-config` s’exécute en tant que root. Les hooks sont rendus exécutables et lancés en tant que root, et les preseeds modifient la base debconf du système avec les privilèges root. HTTP et FTP simples n’authentifient pas le contenu téléchargé et n’offrent aucune protection d’intégrité. Privilégiez les fichiers locaux vérifiés ou un transport authentifié de confiance avec vérification d’intégrité indépendante ; n’utilisez pas de hooks ou preseeds distants depuis des réseaux non fiables.

## Paramètres de démarrage (raccourcis)

Pour certains cas d’usage courants nécessitant la combinaison de plusieurs paramètres individuels, **live-config** propose des raccourcis. Cela permet à la fois d’avoir une granularité complète sur toutes les options, tout en gardant les choses simples.

- **live-config.noroot | noroot** : Désactive la configuration du mot de passe root ainsi que les droits sudo et PolicyKit de MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled** : Contrôle la configuration sudo pour l’utilisateur live. La valeur par défaut, et le comportement historique de MiniOS si non défini, est `passwordless`. Le mode `password` conserve l’accès sudo mais requiert le mot de passe de l’utilisateur live. Le mode `disabled` retire le droit sudo MiniOS et exclut l’utilisateur live du groupe sudo lors de la création. L’ancien raccourci `noroot` prend le dessus et désactive plus largement la configuration des privilèges root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled** : Contrôle les règles de commodité PolicyKit de MiniOS. La valeur par défaut, et le comportement historique de MiniOS si non défini, est `passwordless`. Les modes `password` et `disabled` retirent cette règle, donc l’authentification PolicyKit standard de la distribution s’applique. `disabled` n’est pas une politique de refus total ; utilisez `noroot` si l’utilisateur live ne doit pas obtenir de privilèges administratifs.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false** : Écrit une politique OpenSSH `PermitRootLogin` si explicitement défini et si openssh-server est installé.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false** : Écrit une politique OpenSSH `PasswordAuthentication` si explicitement défini et si openssh-server est installé.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled** : Contrôle la posture XRDP si xrdp est installé. `relaxed` conserve les valeurs par défaut historiques de MiniOS. `hardened` limite XRDP à localhost, restaure les paramètres de sécurité négociés/élevés et désactive la connexion XRDP en root. `disabled` désactive et arrête XRDP via `minios-svc` si disponible.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened** : Contrôle la posture de commodité X11 de MiniOS. `relaxed` conserve la compatibilité historique. `hardened` retire l’option permissive `-ac` du serveur X et renforce `Xwrapper.config` si présent.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false** : Contrôle si `/etc/issue` affiche les indices de mot de passe root/live par défaut de MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened** : Contrôle si live-config assouplit le verrouillage d’écran. `relaxed` conserve la commodité historique des sessions live. `hardened` évite de désactiver le verrouillage GNOME et active le verrouillage xscreensaver si le fichier est présent.
- **live-config.noautologin | noautologin** : Empêche live-config de configurer l’autologin console et graphique. Cela ne retire pas l’autologin déjà configuré dans une session persistante.
- **live-config.nottyautologin | nottyautologin** : Empêche live-config de configurer l’autologin console, sans affecter la configuration graphique. La configuration persistante existante n’est pas retirée.
- **live-config.nox11autologin | nox11autologin** : Empêche live-config de configurer l’autologin du display-manager, sans affecter la configuration TTY. La configuration persistante existante n’est pas retirée.

## Paramètres de démarrage (options spéciales)

Pour des cas d’usage particuliers, il existe certains paramètres de démarrage spéciaux.

- **live-config.debug | debug** : Active la sortie de débogage dans live-config.

## Fichiers de configuration

**live-config** peut être configuré (mais non activé) via des fichiers de configuration. Tout paramètre de démarrage pris en charge peut être placé dans `LIVE_CONFIG_CMDLINE`, et la plupart des options peuvent également être définies via des variables individuelles. Le paramètre `boot=live` reste toutefois requis pour activer **live-config**.

**Remarque :** Si vous utilisez des fichiers de configuration, il est préférable de placer tous les paramètres de démarrage dans la variable **LIVE_CONFIG_CMDLINE**, ou alors de définir les variables individuellement. Si vous choisissez cette seconde option, il vous incombe de vous assurer que toutes les variables nécessaires sont définies afin d’obtenir une configuration valide.

`live-config` source lui-même `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` selon l’ordre glob du shell. Les fragments ultérieurs peuvent donc remplacer les valeurs du fichier principal ou des fragments précédents. Il ne source pas séparément une seconde couche de configuration média.

Sur les supports MiniOS, les fichiers sources sont `minios/config.conf` et `minios/config.conf.d/*.conf`. Avant le démarrage de `live-config`, l’initramfs MiniOS synchronise ces fichiers avec les fichiers runtime `/etc/live/` selon la date de modification. Un fichier source plus récent remplace son équivalent runtime ; un fichier runtime plus récent n’est recopié que si le répertoire de données MiniOS sélectionné est accessible en écriture. Si les horodatages sont identiques, aucun fichier n’est copié ; les fichiers manquants sont ajoutés, et aucun fichier n’est supprimé. Il s’agit d’une synchronisation au démarrage, pas d’une surveillance continue. Consultez la page [Fichier de configuration](/reference/configuration/config.conf) pour l’ensemble des règles de synchronisation et de priorité de la ligne de commande.

En solution de repli pour les implémentations initramfs qui n’auraient pas préparé le fichier runtime, les wrappers de démarrage systemd et SysV copient `minios/config.conf` depuis le support détecté uniquement si `/etc/live/config.conf` est absent. Cette solution de repli ne copie pas les fragments `config.conf.d`. L’initramfs LiveKit MiniOS standard effectue la synchronisation précédente à la place.

Les fichiers fragments doivent correspondre à `*.conf`. Des noms comme `vendor.conf` ou `project.conf` sont recommandés ; choisissez des noms lexicaux de façon réfléchie, car les fragments ultérieurs prennent le dessus sur les précédents.

Le contenu réel des fichiers de configuration consiste en une ou plusieurs des variables suivantes.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn** : Cette variable correspond à la ligne de commande du bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn** : Cette variable correspond au paramètre `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME** : Cette variable correspond au paramètre `**live-config.hostname**=*HOSTNAME*`. Par défaut : `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off** : Sélectionne la politique réseau filaire. `dhcp` et une valeur non définie n’ont aucun effet et ne suppriment pas un profil statique MiniOS déjà créé.
- **LIVE_NETWORK_INTERFACE=INTERFACE** : Sélectionne l’interface filaire pour la politique `static` ou `off`.
- **LIVE_NETWORK_ADDRESS=IPV4** : Définit l’adresse IPv4 statique.
- **LIVE_NETWORK_PREFIX=PREFIX** : Définit la longueur du préfixe statique ; par défaut `24`.
- **LIVE_NETWORK_GATEWAY=IPV4** : Définit la passerelle statique optionnelle.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2** : Définit les serveurs DNS optionnels, séparés par des virgules.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown** : Sélectionne le backend implémenté.

Le composant réseau enregistre `/var/lib/live/config/network` après avoir écrit la politique avec succès. Supprimez ce tampon pour appliquer une politique modifiée sur un système persistant. Pour retirer un ancien profil statique, utilisez `network-method=off` ou supprimez manuellement le profil et le tampon gérés par MiniOS.

- **LIVE_USERNAME=USERNAME** : Cette variable correspond au paramètre `**live-config.username**=*USERNAME*`. Par défaut : `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn** : Cette variable correspond au paramètre `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"** : Cette variable correspond au paramètre `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD** : Cette variable correspond au paramètre `**live-config.root-password**=*PASSWORD*`. Elle définit le mot de passe root en clair.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD** : Cette variable correspond au paramètre `**live-config.root-password-crypted**=*PASSWORD*`. Elle définit le mot de passe root sous forme chiffrée.
- **LIVE_USER_PASSWORD=PASSWORD** : Cette variable correspond au paramètre `**live-config.user-password**=*PASSWORD*`. Elle définit le mot de passe utilisateur en clair.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD** : Cette variable correspond au paramètre `**live-config.user-password-crypted**=*PASSWORD*`. Elle définit le mot de passe utilisateur sous forme chiffrée.
- **LIVE_CONFIG_NOROOT=true|false** : Cette variable correspond au paramètre `**live-config.noroot**` et désactive la configuration des privilèges root, sudo et PolicyKit lorsqu’elle est définie sur `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled** : Cette variable correspond au paramètre `**live-config.sudo-mode**=...`. Si elle n’est pas définie, MiniOS conserve le comportement historique sudo sans mot de passe.
- **LIVE_POLKIT_MODE=passwordless|password|disabled** : Cette variable correspond au paramètre `**live-config.polkit-mode**=...`. `password` et `disabled` suppriment la règle MiniOS sans mot de passe et rétablissent l’authentification PolicyKit standard de la distribution.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false** : Cette variable correspond au paramètre `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false** : Cette variable correspond au paramètre `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled** : Cette variable correspond au paramètre `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened** : Cette variable correspond au paramètre `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false** : Cette variable correspond au paramètre `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened** : Cette variable correspond au paramètre `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn** : Cette variable correspond au paramètre `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE** : Cette variable correspond au paramètre `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL** : Cette variable correspond au paramètre `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn** : Cette variable correspond au paramètre `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn** : Cette variable correspond au paramètre `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS** : Cette variable correspond au paramètre `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn** : Cette variable correspond au paramètre `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no** : Cette variable correspond au paramètre `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER** : Cette variable correspond au paramètre `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER** : Cette variable correspond au paramètre `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION** : Cette variable correspond au paramètre `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER** : Cette variable correspond au paramètre `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn** : Cette variable correspond au paramètre `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false** : Active ou désactive les liens des répertoires de données standard de l’utilisateur vers le disque MiniOS accessible en écriture. Le paramètre de démarrage correspondant est le simple indicateur `live-config.link-user-dirs`. Le mode lien ne peut pas être combiné avec le mode bind ni avec aucun mode `toram`.
- **LIVE_BIND_USER_DIRS=true|false** : Active ou désactive les montages bind des répertoires de données standard de l’utilisateur depuis le disque MiniOS accessible en écriture. Le paramètre de démarrage correspondant est le simple indicateur `live-config.bind-user-dirs`. Le mode bind ne peut pas être combiné avec le mode lien ni avec aucun mode `toram`.
- **LIVE_USER_DIRS_PATH=PATH** : Cette variable correspond au paramètre `**live-config.user-dirs-path**=*PATH*`. Elle définit un chemin sécurisé à l’intérieur du disque MiniOS FAT32, exFAT ou NTFS. Par défaut : `/minios/userdata` ; les segments point et parent sont rejetés.

La configuration des médias utilisateur ne fusionne jamais automatiquement deux répertoires non vides. Un répertoire local non vide n’est migré que si sa destination sur le média est vide. Lorsque la fonctionnalité est désactivée, les données gérées sur le média sont recopiées avant la suppression des liens. Une validation ou copie échouée laisse les répertoires utilisateur existants en place et enregistre la raison dans `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged** : Cette variable contient l’état spécifié par le paramètre `live-config.module-mode` (ou `module-mode`). Lorsqu’elle est définie sur `merged`, le système live applique les mises à jour (via minios-update-users, minios-update-cache et minios-update-dpkg) pour fusionner les configurations personnalisées avec l’environnement de base.
- **LIVE_CONFIG_DEBUG=true|false** : Cette variable correspond au paramètre `**live-config.debug**`.

# PERSONNALISATION

**live-config** peut être facilement personnalisé pour des projets dérivés ou un usage local.

## Ajout de nouveaux composants de configuration

Les projets dérivés peuvent placer leurs composants dans /usr/lib/live/config sans autre action ; ils seront appelés automatiquement au démarrage.

Il est recommandé de regrouper les composants dans un paquet debian dédié. Un exemple de paquet contenant un composant exemple est disponible dans /usr/share/doc/live-config/examples.

## Suppression de composants de configuration existants

Il n’est pas vraiment possible de supprimer proprement des composants sans devoir soit fournir un paquet **live-config** modifié localement, soit utiliser dpkg-divert. Cependant, le même résultat peut être obtenu en désactivant les composants concernés via le mécanisme live-config.nocomponents, voir ci-dessus. Pour éviter d’avoir à spécifier à chaque fois les composants désactivés via le paramètre de démarrage, il est conseillé d’utiliser un fichier de configuration, voir ci-dessus.

Les fichiers de configuration pour le système live lui-même sont idéalement placés dans un paquet debian dédié. Un exemple de paquet avec une configuration exemple est disponible dans /usr/share/doc/live-config/examples.

# COMPOSANTS

**live-config** propose actuellement les composants suivants dans /usr/lib/live/config.

- **nss-systemd** : supprime ou restaure le module NSS systemd dans /etc/nsswitch.conf pour contourner un problème connu de systemd.
- **debconf** : permet d’appliquer des fichiers preseed placés sur le média live ou un serveur http/ftp.
- **hostname** : configure /etc/hostname et /etc/hosts.
- **issue-setup** : configure le fichier /etc/issue avec une bannière de bienvenue et les informations de distribution.
- **live-debconfig_passwd** : configure les mots de passe utilisateur et root via live-debconfig.
- **user-setup** : ajoute un compte utilisateur live.
- **user-groups** : ajoute l’utilisateur live aux groupes supplémentaires déclarés par les modules installés. Les groupes existants listés dans `/usr/share/live/config/user-default-groups.d/*.groups` sont appliqués après la création de l’utilisateur et lors des exécutions ultérieures de live-config.
- **root-setup** : définit ou met à jour le mot de passe root et configure l’environnement utilisateur root.
- **sudo** : accorde les privilèges sudo à l’utilisateur live.
- **user-ssh-keys** : synchronise les fichiers `authorized_keys.<username>` spécifiques à l’utilisateur entre le média live et les répertoires personnels. Prend en charge plusieurs utilisateurs simultanément (par ex., `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media** : lie ou monte en bind les répertoires utilisateurs validés sur le support de données MiniOS inscriptible, avec migration sécurisée et recopie lors de la désactivation.
- **locales** : configure les locales.
- **tzdata** : configure /etc/timezone.
- **xorg-service** : configure le nom d’utilisateur dans xorg.service et applique la posture X11 si supporté.
- **gdm3** : configure l’autologin dans gdm3.
- **sddm** : configure l’autologin dans sddm.
- **kdm** : configure l’autologin dans kdm.
- **lightdm** : configure l’autologin dans lightdm.
- **lxdm** : configure l’autologin dans lxdm.
- **nodm** : configure l’autologin dans nodm.
- **slim** : configure l’autologin dans slim.
- **xinit** : configure l’autologin avec xinit.
- **keyboard-configuration** : configure le clavier.
- **sysvinit** : configure l’autologin console via `/etc/inittab` si sysvinit est installé. Les raccourcis `noautologin` et `nottyautologin` désactivent cette configuration.
- **sysv-rc** : configure sysv-rc en désactivant les services listés.
- **apport** : désactive apport.
- **gnome-panel-data** : désactive le bouton de verrouillage de l’écran.
- **gnome-power-manager** : désactive l’hibernation.
- **gnome-screensaver** : contrôle le verrouillage d’écran GNOME selon `LIVE_LOCKSCREEN_MODE`.
- **kaboom** : désactive l’assistant de migration KDE (squeeze et plus récents).
- **kde-services** : désactive certains services KDE indésirables (squeeze et plus récents).
- **policykit** : accorde des privilèges utilisateur via PolicyKit.
- **ssl-cert** : régénère les certificats SSL snake-oil.
- **xrdp** : configure la posture XRDP (relâchée, renforcée ou désactivée) si XRDP est installé.
- **anacron** : désactive anacron.
- **util-linux** : désactive le service hwclock de util-linux.
- **login** : désactive lastlog.
- **xserver-xorg** : configure xserver-xorg.
- **network** : configure une politique IPv4 filaire durable via un fichier clé NetworkManager sécurisé ou une section ifupdown. S’exécute avant les services réseau, valide toutes les valeurs et ne tamponne qu’après écriture réussie.
- **openssh-server** : recrée les clés hôtes OpenSSH et écrit la politique root-login ou password-authentication explicitement demandée.
- **xfce4-panel** : configure xfce4-panel avec les paramètres par défaut.
- **xscreensaver** : contrôle le verrouillage xscreensaver selon `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta** : configure les pilotes WLAN broadcom-sta.
- **hyperv** : configure les paramètres X11 pour améliorer la compatibilité sur les plateformes Microsoft Hyper-V.
- **ntfs3** : gère les règles udev pour la prise en charge NTFS3.
- **config-module-mode** : configure le mode module système et met à jour les caches, paramètres utilisateur et dpkg.
- **hooks** : permet d’exécuter des commandes arbitraires depuis un fichier placé sur le média live ou un serveur http/ftp.

# FICHIERS

- `minios/config.conf` sur le support de données MiniOS sélectionné (copie source)
- `minios/config.conf.d/*.conf` sur le support de données MiniOS sélectionné (fragments source)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` sur les médias de données sélectionnés inscriptibles lorsque l’export de logs est activé
- `/usr/lib/live/config-hooks/*` (hooks `filesystem`)
- `minios/config-hooks/*` sur le média live détecté (hooks `medium`)
- `/usr/lib/live/config-preseed/*` (preseeds `filesystem`)
- `minios/config-preseed/*` sur le média live détecté (preseeds `medium`)

# VOIR AUSSI

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PAGE D’ACCUEIL

Plus d’informations sur **minios-live-config** sont disponibles dans son [dépôt GitHub](https://github.com/minios-linux/minios-live-config). Des informations générales sur MiniOS sont disponibles sur [minios.dev](https://minios.dev).

# BUGS

Les bugs peuvent être signalés dans le [gestionnaire d’incidents minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTEUR

**live-config** a été initialement écrit par Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Depuis 2016, le développement a été poursuivi par l’équipe Debian Live. Depuis 2025, le développement de la version modifiée **minios-live-config** est assuré par l’équipe MiniOS Live.
