---
updated: 2026-09-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Composants de configuration système

**live-config** contient les composants qui configurent un système live pendant le processus de démarrage (late userspace).

La politique de cache de session persistante et de journalisation est décidée plus tôt par `minios-boot`, après la préparation du live root et de sa configuration, mais avant le démarrage des services classiques. Le `browser-cache` composant live-config applique les montages par utilisateur après la création de l'utilisateur. Ces politiques nécessitent une session durable saine `perch` et un initrd actuel annonçant `perch-storage-v1` ; voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour les effets et les limites.

Le démarrage réseau dans l'initramfs (`ip=`, PXE, `from=http://…`) constitue une couche LiveKit distincte et n'est **pas** gérée par live-config. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

**live-config** peut être configuré via les paramètres de démarrage ou les fichiers de configuration runtime préparés par l'initramfs. La ligne de commande réelle du noyau est ajoutée après les valeurs fournies par les fichiers, donc les paramètres de démarrage ultérieurs prévalent. `LIVE_CONFIG_CMDLINE`Les composants qui enregistrent leur état sous `/var/lib/live/config` ne s'exécutent normalement qu'une seule fois ; les composants de synchronisation et sans état peuvent s'exécuter à chaque appel.

Si *live-build*(7) est utilisé pour construire le système live, les paramètres live-config utilisés par défaut peuvent être définis via l'option `--bootappend-live` , voir *lb_config*(1) page de manuel.

## Paramètres de démarrage (composants)

**live-config** n’est activé que si `boot=live` est utilisé comme paramètre de démarrage. Par défaut, tous les composants sont exécutés. Le paramètre `live-config.components` permet de restreindre les composants à exécuter, et `live-config.nocomponents` permet d’en exclure certains. Si les deux paramètres sont utilisés, ou si l’un d’eux est spécifié plusieurs fois, la dernière occurrence prévaut.

- **live-config.components | components** : Tous les composants sont exécutés. C’est le comportement par défaut des images live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn** : Seuls les composants spécifiés sont exécutés. L’exécution suit l’ordre défini par le nom de fichier sous `/usr/lib/live/config`, indépendamment de l’ordre dans la liste.
- **live-config.nocomponents | nocomponents** : Aucun composant n’est exécuté.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn** : Tous les composants sont exécutés, sauf ceux spécifiés.

## Paramètres de démarrage (options)

Certains composants individuels peuvent modifier leur comportement selon un paramètre de démarrage.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Récupère et applique un ou plusieurs fichiers preseed debconf. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://`. Le mot-clé `filesystem` extrait les fichiers dans `/usr/lib/live/config-preseed/`; `medium` extrait les fichiers dans `minios/config-preseed/` sur le support live détecté. Les fichiers locaux explicites peuvent utiliser des chemins comme `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` à la racine du live. Les entrées séparées par des barres verticales sont traitées dans l'ordre indiqué ; les fichiers extraits par un mot-clé suivent l'ordre du glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permet de définir le nom d'hôte du système. Par défaut, c'est `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Définit la politique réseau filaire. Non défini et `dhcp` laissent l'image par défaut inchangée. `static` écrit la configuration pour le backend sélectionné ; `off` désactive la configuration IPv4 automatique pour l'interface choisie.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Sélectionne l'interface filaire. Si omis pour `static` ou `off`, la seule interface filaire non loopback est sélectionnée automatiquement ; s'il y a zéro ou plusieurs candidats, une valeur explicite est requise.
- **live-config.network-address=IPV4 | network-address=IPV4**: Définit l'adresse IPv4 statique.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Définit la longueur du préfixe IPv4 de 0 à 32. La valeur par défaut statique est `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Définit la passerelle IPv4 optionnelle.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Définit les adresses de serveurs DNS optionnelles, séparées par des virgules.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Sélectionne le backend réseau. `auto` privilégie NetworkManager et bascule sur ifupdown en cas d'échec. Forcer `ifupdown` rend l'interface non gérée par NetworkManager lorsque les deux piles sont installées.
- **live-config.username=USERNAME | username=USERNAME**: Permet de définir le nom d'utilisateur créé pour la connexion automatique. Par défaut, c'est `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Définit les groupes supplémentaires pour l'utilisateur créé pour la connexion automatique. Les noms de groupes peuvent être séparés par des virgules ou des espaces. La valeur par défaut MiniOS est `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permet de définir le nom complet de l'utilisateur créé pour la connexion automatique. La valeur par défaut MiniOS est `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permet de définir le mot de passe root en clair.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permet de définir le mot de passe root sous forme chiffrée.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permet de définir le mot de passe utilisateur en clair.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permet de définir le mot de passe utilisateur sous forme chiffrée.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permet de définir la locale du système, par exemple `de_CH.UTF-8`. La valeur par défaut est `en_US.UTF-8`. Si la locale sélectionnée n'est pas déjà disponible sur le système, elle est générée automatiquement à la volée.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permet de définir le fuseau horaire du système, par exemple `Europe/Zurich`. La valeur par défaut est `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permet de modifier le modèle de clavier. Aucune valeur par défaut n'est définie.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permet de modifier les dispositions du clavier. Si plusieurs dispositions sont spécifiées, les outils de l'environnement de bureau permettront de les changer sous X11. Aucune valeur par défaut n'est définie.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permet de modifier les variantes de clavier. Si plusieurs variantes sont spécifiées, il faut indiquer autant de valeurs que de dispositions de clavier, car elles seront associées une à une dans l'ordre indiqué. Les valeurs vides sont autorisées. Les outils de l'environnement de bureau permettront de basculer entre chaque paire disposition/variante sous X11. Aucune valeur par défaut n'est définie.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permet de modifier les options du clavier. Aucune valeur par défaut n'est définie.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permet de désactiver les services sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permet de définir si le système considère que l'horloge matérielle est réglée sur UTC ou non. La valeur par défaut est `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permet de définir le x-session-manager via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permet de définir le pilote xorg au lieu de le détecter automatiquement. Si un identifiant PCI est spécifié dans `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une substitution sont présents, le paramètre de démarrage a la priorité.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permet de définir la résolution xorg au lieu de la détecter automatiquement, par exemple 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permet de définir le pilote WLAN au lieu de le détecter automatiquement. Si un identifiant PCI est spécifié dans `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une substitution sont présents, le paramètre de démarrage est prioritaire.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permet de spécifier le mode de module pour la configuration live. Lorsque la valeur est `merged`, le système mettra à jour les comptes utilisateurs, reconstruira les caches et rafraîchira les paramètres des paquets afin que les modifications de configuration soient intégrées dynamiquement dans le système en cours d’exécution.
- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: Politique anticipée de `minios-boot` pour le journal et les fichiers `/var/log` ordinaires. Les diagnostics de démarrage restent sur le stockage durable. La valeur par défaut est `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: Politique anticipée pour les archives APT téléchargées. Un tmpfs limité est utilisé uniquement si RAM et les conditions de swap le permettent ; les bases de données de paquets et les listes de dépôts ne sont pas déplacées. La valeur par défaut est `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: Politique anticipée pour les caches natifs du navigateur. Avec `volatile`, le composant `browser-cache` monte les répertoires de cache utilisateur live sélectionnés dans RAM après la création du compte. La valeur par défaut est `persistent`.
- **live-config.link-user-dirs | link-user-dirs**: Lie les répertoires utilisateur gérés vers le chemin configuré sur le support de données MiniOS. Cette option est exclusive avec le mode bind et indisponible avec tout mode `toram` ou si la session de persistance active est chiffrée avec LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Monte en bind les répertoires utilisateur gérés depuis le chemin configuré sur le support de données MiniOS. Cette option est exclusive avec le mode link et présente les mêmes restrictions de `toram` et de chiffrement de session active.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Définit le chemin relatif au support utilisé par `link-user-dirs` ou `bind-user-dirs`. La valeur par défaut est `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Récupère et exécute des fichiers arbitraires depuis un fichier temporaire dans le système live en cours. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://` ; les interpréteurs requis et autres dépendances doivent déjà être installés. Le mot-clé `filesystem` extrait les fichiers dans `/usr/lib/live/config-hooks/` ; `medium` extrait les fichiers dans `minios/config-hooks/` sur le support live détecté (avec un repli sur le chemin ISO dans le composant hook). Les fichiers locaux explicites peuvent utiliser `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` dans la racine live. Les entrées séparées par des pipes sont exécutées dans l’ordre spécifié ; les fichiers extraits par un mot-clé utilisent l’ordre de glob shell. Des exemples sont installés sous `/usr/share/doc/live-config/examples/hooks/`.

> **Avertissement de sécurité :** `live-config` s’exécute en tant que root. Les hooks sont rendus exécutables et lancés en tant que root, et les preseeds modifient la base de données debconf du système avec les privilèges root. Le HTTP et le FTP simples n’authentifient pas le contenu téléchargé et n’offrent aucune protection de l’intégrité. Privilégiez des fichiers locaux vérifiés ou un transport authentifié de confiance avec une vérification d’intégrité indépendante ; n’utilisez pas de hooks ou de preseeds distants provenant de réseaux non fiables.

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

**live-config** peut être configuré (mais non activé) via des fichiers de configuration. Tout paramètre de démarrage pris en charge peut être placé dans `LIVE_CONFIG_CMDLINE`, et la plupart des options peuvent également être définies via des variables individuelles. Le `boot=live` paramètre reste nécessaire pour activer **live-config**.

**Remarque :** Si des fichiers de configuration sont utilisés, il est recommandé (de préférence) de placer tous les paramètres de démarrage dans la variable **LIVE_CONFIG_CMDLINE**, ou bien de définir des variables individuelles. Si vous utilisez des variables individuelles, il vous incombe de vérifier que toutes les variables nécessaires sont définies afin de créer une configuration valide.

`live-config` se charge d'inclure `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` selon l'ordre des fichiers (glob shell). Les fragments plus récents peuvent donc remplacer les valeurs du fichier principal ou des fragments précédents. Il n'inclut pas séparément une seconde couche de configuration média.

Sur les supports MiniOS, les fichiers sources sont `minios/config.conf` et `minios/config.conf.d/*.conf`. Avant que `live-config` ne démarre, l'initramfs MiniOS synchronise ces fichiers avec les fichiers runtime `/etc/live/` selon la date de modification. Un fichier source plus récent remplace son équivalent runtime ; un fichier runtime plus récent n'est copié en retour que si le répertoire de données MiniOS sélectionné est accessible en écriture. Si les horodatages sont identiques, aucune copie n'est effectuée, les fichiers manquants sont ajoutés, et aucun fichier n'est supprimé. Il s'agit d'une synchronisation au démarrage, et non d'une surveillance continue. Voir [Fichier de configuration](/reference/configuration/config.conf) pour les règles complètes de synchronisation et de priorité de la ligne de commande.

En cas d'absence de préparation du fichier runtime par certaines implémentations d'initramfs, les wrappers de démarrage systemd et SysV copient `minios/config.conf` depuis le support détecté uniquement lorsque `/etc/live/config.conf` est absent. Ce mécanisme de secours ne copie pas les fragments de `config.conf.d`. L'initramfs standard actuel LiveKit MiniOS effectue la synchronisation précédente à la place.

Les fichiers fragments doivent correspondre à `*.conf`. Des noms tels que `vendor.conf` ou `project.conf` sont recommandés ; choisissez les noms lexicaux avec soin, car les fragments plus récents remplacent les précédents.

Le contenu réel des fichiers de configuration se compose d'une ou plusieurs des variables suivantes.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn** : Cette variable correspond à la ligne de commande du bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` .
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` .
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn** : Cette variable correspond au paramètre `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` .
- **LIVE_HOSTNAME=HOSTNAME**: Cette variable correspond au `**live-config.hostname**=*HOSTNAME*` paramètre. Par défaut : `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Sélectionne la politique réseau filaire. `dhcp` et une valeur non définie n'ont aucun effet et ne suppriment pas un profil statique MiniOS déjà créé.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Sélectionne l'interface filaire pour la politique `static` ou `off` .
- **LIVE_NETWORK_ADDRESS=IPV4**: Définit l'adresse IPv4 statique.
- **LIVE_NETWORK_PREFIX=PREFIX**: Définit la longueur du préfixe statique ; la valeur par défaut est `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Définit la passerelle statique optionnelle.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Définit les serveurs DNS optionnels, séparés par des virgules.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Sélectionne le backend implémenté.

Le composant réseau enregistre `/var/lib/live/config/network` après avoir écrit la politique avec succès. Supprimez ce tampon pour appliquer la nouvelle politique sur un système persistant. Pour retirer un profil statique précédent, utilisez `network-method=off` ou supprimez manuellement le profil géré par MiniOS et le tampon.

- **LIVE_USERNAME=USERNAME**: Cette variable correspond au `**live-config.username**=*USERNAME*` paramètre. Par défaut : `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Cette variable correspond au `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` paramètre.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Cette variable correspond au `**live-config.user-fullname**="*USER FULLNAME*"` paramètre.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Cette variable correspond au `**live-config.root-password**=*PASSWORD*` paramètre. Elle définit le mot de passe root en clair.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Cette variable correspond au `**live-config.root-password-crypted**=*PASSWORD*` paramètre. Elle définit le mot de passe root sous forme chiffrée.
- **LIVE_USER_PASSWORD=PASSWORD**: Cette variable correspond au `**live-config.user-password**=*PASSWORD*` paramètre. Elle définit le mot de passe utilisateur en clair.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Cette variable correspond au `**live-config.user-password-crypted**=*PASSWORD*` paramètre. Elle définit le mot de passe utilisateur sous forme chiffrée.
- **LIVE_CONFIG_NOROOT=true|false**: Cette variable correspond au `**live-config.noroot**` paramètre et désactive la configuration des privilèges root, sudo et PolicyKit si la valeur est `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Cette variable correspond au `**live-config.sudo-mode**=...` paramètre. Si non défini, MiniOS conserve le comportement sudo sans mot de passe historique.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Cette variable correspond au `**live-config.polkit-mode**=...` paramètre. `password` et `disabled` suppriment la règle sans mot de passe MiniOS et rétablissent l’authentification PolicyKit standard de la distribution.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Cette variable correspond au `**live-config.ssh-permit-root-login**=...` paramètre.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Cette variable correspond au `**live-config.ssh-password-authentication**=...` paramètre.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Cette variable correspond au `**live-config.xrdp-mode**=...` paramètre.
- **LIVE_X11_MODE=relaxed|hardened**: Cette variable correspond au `**live-config.x11-mode**=...` paramètre.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Cette variable correspond au `**live-config.issue-password-hints**=...` paramètre.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Cette variable correspond au `**live-config.lockscreen-mode**=...` paramètre.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Cette variable correspond au `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` paramètre.
- **LIVE_TIMEZONE=TIMEZONE**: Cette variable correspond au `**live-config.timezone**=*TIMEZONE*` paramètre.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Cette variable correspond au `**live-config.keyboard-model**=*KEYBOARD_MODEL*` paramètre.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Cette variable correspond au `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*` paramètre.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Cette variable correspond au `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*` paramètre.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Cette variable correspond au `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*` paramètre.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Cette variable correspond au `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*` paramètre.
- **LIVE_UTC=yes|no**: Cette variable correspond au `**live-config.utc**=**yes**|no` paramètre.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Cette variable correspond au `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*` paramètre.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Cette variable correspond au `**live-config.xorg-driver**=*XORG_DRIVER*` paramètre.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Cette variable correspond au `**live-config.xorg-resolution**=*XORG_RESOLUTION*` paramètre.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Cette variable correspond au `**live-config.wlan-driver**=*WLAN_DRIVER*` paramètre.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Cette variable correspond au `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` paramètre.
- **LIVE_LINK_USER_DIRS=true|false**: Active ou désactive les liens des répertoires standards de données utilisateur vers le disque réinscriptible MiniOS. Le paramètre de démarrage correspondant est simplement le `live-config.link-user-dirs` flag. Le mode lien ne peut pas être combiné avec le mode bind ou tout autre mode `toram` .
- **LIVE_BIND_USER_DIRS=true|false**: Active ou désactive les montages bind des répertoires standards de données utilisateur depuis le disque réinscriptible MiniOS. Le paramètre de démarrage correspondant est simplement le `live-config.bind-user-dirs` flag. Le mode bind ne peut pas être combiné avec le mode lien ou tout autre mode `toram` .
- **LIVE\_USER\_DIRS\_PATH=CHEMIN**: Cette variable correspond au paramètre `**live-config.user-dirs-path**=*PATH*`. Elle spécifie un chemin sécurisé à l’intérieur du lecteur FAT32, exFAT ou NTFS MiniOS. La valeur par défaut est `/minios/userdata`; les segments point et répertoire parent sont refusés.

La configuration des médias utilisateur ne fusionne jamais automatiquement deux répertoires non vides. Un répertoire local non vide n’est migré que si sa destination média est vide. Lorsque la fonctionnalité est désactivée, les données médias gérées sont recopiées avant la suppression des liens. L’activation et la recopie des médias utilisateur sont bloquées tant que la session de persistance active est chiffrée avec LUKS, empêchant ainsi le déplacement des données de session vers un support MiniOS non chiffré. Cette décision repose sur l’état réel de chiffrement actif : `perchencrypt=luks` ne demande le chiffrement que lors de la création d’une nouvelle session et ne décrit pas une session existante. En cas d’échec de validation ou de copie, les répertoires utilisateur existants sont conservés et la raison est enregistrée dans `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Cette variable contient l’état défini par le paramètre `live-config.module-mode` (ou `module-mode`). Lorsqu’elle est définie sur `merged`, le système live applique les mises à jour (via minios-update-users, minios-update-cache et minios-update-dpkg) afin de fusionner les configurations personnalisées avec l’environnement de base.
- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, et **LIVE_BROWSER_CACHE=persistent|volatile**: Politiques indépendantes MiniOS au démarrage. Elles fonctionnent également en `config.conf.d` et `LIVE_CONFIG_CMDLINE`. Elles n’activent pas la persistance à elles seules. Voir [Fichier de configuration](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).
- **LIVE_CONFIG_DEBUG=true|false**: Cette variable correspond au paramètre `**live-config.debug**`. Les commandes d’assistance en mode fusionné conservent les erreurs normales, mais génèrent des traces détaillées et des copies de débogage uniquement lorsque le mode debug est activé.

# PERSONNALISATION

**live-config** peut être facilement personnalisé pour des projets dérivés ou un usage local.

## Ajout de nouveaux composants de configuration

Les projets dérivés peuvent placer leurs composants dans /usr/lib/live/config sans autre action ; ils seront appelés automatiquement au démarrage.

Il est recommandé de regrouper les composants dans un paquet debian dédié. Un exemple de paquet contenant un composant exemple est disponible dans /usr/share/doc/live-config/examples.

## Suppression de composants de configuration existants

Il n’est pas vraiment possible de supprimer proprement des composants sans devoir soit fournir un paquet **live-config** modifié localement, soit utiliser dpkg-divert. Cependant, le même résultat peut être obtenu en désactivant les composants concernés via le mécanisme live-config.nocomponents, voir ci-dessus. Pour éviter d’avoir à spécifier à chaque fois les composants désactivés via le paramètre de démarrage, il est conseillé d’utiliser un fichier de configuration, voir ci-dessus.

Les fichiers de configuration pour le système live lui-même sont idéalement placés dans un paquet debian dédié. Un exemple de paquet avec une configuration exemple est disponible dans /usr/share/doc/live-config/examples.

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
