---
updated: 2026-10-06
program_commits:
    minios-live-config: cf3ae490e5df92581483ec6345a5f56bdaa812d8
---

# live-config

**live-config** - Composants de configuration du système

**live-config** contient les composants qui configurent un système live lors du processus de démarrage (fin de l'espace utilisateur).

La politique de cache et de journalisation des sessions persistantes est décidée plus tôt par `minios-boot`, après la préparation du live root et de sa configuration, mais avant le démarrage des services classiques. Le composant `browser-cache` live-config applique les montages par utilisateur après la création de l'utilisateur. Ces politiques nécessitent une session durable fonctionnelle et un initrd actuel annonçant `perch`; consultez `perch-storage-v1`Performance[Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour les effets et les limites.

Le démarrage réseau dans l'initramfs (`ip=`, PXE, `from=http://…`) constitue une couche LiveKit distincte et n'est **pas** gérée par live-config. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

**live-config** peut être configuré via les paramètres de démarrage ou les fichiers de configuration générés par l'initramfs. La ligne de commande réelle du noyau est ajoutée après les valeurs fournies par les fichiers, donc les paramètres de démarrage ultérieurs prévalent. Les composants qui enregistrent un état sous `LIVE_CONFIG_CMDLINE` ne s'exécutent normalement qu'une seule fois ; les composants de synchronisation et sans état peuvent s'exécuter à chaque appel.`/var/lib/live/config`

Si *live-build*(7) est utilisé pour construire le système live, les paramètres live-config utilisés par défaut peuvent être définis via l'option `--bootappend-live` ; voir *lb_config*(1) page de manuel.

## Paramètres de démarrage (composants)

**live-config** n’est activé que si `boot=live` est utilisé comme paramètre de démarrage. Par défaut, tous les composants sont exécutés. Le paramètre `live-config.components` permet de restreindre les composants exécutés, et `live-config.nocomponents` peut en exclure certains. Si les deux paramètres sont utilisés, ou si l’un d’eux est spécifié plusieurs fois, la dernière occurrence prévaut.

- **live-config.components | components** : Tous les composants sont exécutés. C’est le comportement par défaut des images live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn** : Seuls les composants spécifiés sont exécutés. Les composants sont lancés dans l’ordre défini par leur nom de fichier sous `/usr/lib/live/config`, indépendamment de l’ordre dans cette liste.
- **live-config.nocomponents | nocomponents** : Aucun composant n’est exécuté.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn** : Tous les composants sont exécutés, sauf ceux spécifiés.

## Paramètres de démarrage (options)

Certains composants individuels peuvent modifier leur comportement selon un paramètre de démarrage.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn** : Récupère et applique un ou plusieurs fichiers preseed debconf. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://`. Le mot-clé `filesystem` développe les fichiers dans `/usr/lib/live/config-preseed/` ; `medium` développe les fichiers dans `minios/config-preseed/` sur le support live détecté. Les fichiers locaux explicites peuvent utiliser des chemins comme `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` dans la racine live. Les entrées séparées par un pipe sont traitées dans l’ordre indiqué ; les fichiers développés par un mot-clé suivent l’ordre du glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME** : Permet de définir le nom d’hôte du système. La valeur par défaut est `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off** : Définit la politique réseau filaire. Non défini et `dhcp` laissent la valeur par défaut de l’image inchangée. `static` écrit la configuration pour le backend sélectionné ; `off` désactive la configuration automatique IPv4 pour l’interface sélectionnée.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE** : Sélectionne l’interface filaire. Si omis pour `static` ou `off`, la seule interface filaire non loopback est sélectionnée automatiquement ; s’il y a zéro ou plusieurs candidats, une valeur explicite est requise.
- **live-config.network-address=IPV4 | network-address=IPV4** : Définit l’adresse IPv4 statique.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX** : Définit la longueur du préfixe IPv4 de 0 à 32. La valeur statique par défaut est `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4** : Définit la passerelle IPv4 optionnelle.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2** : Définit les adresses des serveurs DNS optionnels, séparées par des virgules.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown** : Sélectionne le backend réseau. `auto` privilégie NetworkManager et bascule sur ifupdown si besoin. `ifupdown` force l’interface comme non gérée par NetworkManager si les deux piles sont installées.
- **live-config.username=USERNAME | username=USERNAME** : Permet de définir le nom d’utilisateur créé pour la connexion automatique. La valeur par défaut est `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn** : Définit les groupes supplémentaires pour l’utilisateur créé pour la connexion automatique. Les noms de groupe peuvent être séparés par des virgules ou des espaces. La valeur par défaut MiniOS est `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"** : Permet de définir le nom complet de l’utilisateur créé pour la connexion automatique. La valeur par défaut MiniOS est `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD** : Permet de définir le mot de passe root en clair.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD** : Permet de définir le mot de passe root sous forme chiffrée.
- **live-config.user-password=PASSWORD | user-password=PASSWORD** : Permet de définir le mot de passe utilisateur en clair.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD** : Permet de définir le mot de passe utilisateur sous forme chiffrée.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn** : Permet de définir la locale du système, par exemple `de_CH.UTF-8`. La valeur par défaut est `en_US.UTF-8`. Si la locale sélectionnée n’est pas déjà disponible sur le système, elle est générée à la volée.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE** : Permet de définir le fuseau horaire du système, par exemple `Europe/Zurich`. La valeur par défaut est `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL** : Permet de changer le modèle de clavier. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn** : Permet de changer les dispositions clavier. Si plusieurs sont spécifiées, les outils de l’environnement de bureau permettront de les changer sous X11. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn** : Permet de changer les variantes clavier. Si plusieurs sont spécifiées, il faut autant de valeurs que de dispositions clavier, elles seront associées dans l’ordre. Les valeurs vides sont autorisées. Les outils de l’environnement de bureau permettront de passer d’une paire disposition/variante à l’autre sous X11. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS** : Permet de changer les options clavier. Aucune valeur par défaut n’est définie.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn** : Permet de désactiver des services sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no** : Permet de définir si le système considère que l’horloge matérielle est réglée sur UTC ou non. La valeur par défaut est `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER** : Permet de définir le x-session-manager via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER** : Permet de définir le pilote xorg au lieu de l’auto-détection. Si un identifiant PCI est spécifié dans `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont présents, le paramètre de démarrage a priorité.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION** : Permet de définir la résolution xorg au lieu de l’auto-détection, par exemple 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER** : Permet de définir le pilote WLAN au lieu de l’auto-détection. Si un identifiant PCI est spécifié dans `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dans le système live, le *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont présents, le paramètre de démarrage a priorité.
- **live-config.module-mode=simple|merged | module-mode=simple|merged** : Permet de spécifier le mode module pour la configuration live. Si la valeur `merged` est utilisée, le système mettra à jour les comptes utilisateurs, reconstruira les caches et actualisera les paramètres de paquets afin d’intégrer dynamiquement les modifications dans le système en cours d’exécution.
- **live-config.link-user-dirs | link-user-dirs** : Lie les répertoires utilisateurs gérés vers le chemin configuré sur le support de données MiniOS. Ce mode est exclusif du mode bind et indisponible avec tout mode `toram` ou si la session de persistance active est chiffrée avec LUKS.
- **live-config.bind-user-dirs | bind-user-dirs** : Monte en bind les répertoires utilisateurs gérés depuis le chemin configuré sur le support de données MiniOS. Ce mode est exclusif du mode lien et a les mêmes restrictions `toram` et de chiffrement de session active.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH** : Définit le chemin relatif au support utilisé par `link-user-dirs` ou `bind-user-dirs`. La valeur par défaut est `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn** : Récupère et exécute des fichiers arbitraires depuis un fichier temporaire dans le système live en cours d’exécution. Les URL sont gérées par `wget` et peuvent utiliser HTTP, FTP ou `file://` ; les interpréteurs requis et autres dépendances doivent déjà être installés. Le mot-clé `filesystem` développe les fichiers dans `/usr/lib/live/config-hooks/` ; `medium` développe les fichiers dans `minios/config-hooks/` sur le support live détecté (avec repli sur le chemin ISO dans le composant hook). Les fichiers locaux explicites peuvent utiliser `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` dans la racine live. Les entrées séparées par un pipe sont exécutées dans l’ordre indiqué ; les fichiers développés par un mot-clé suivent l’ordre du glob shell. Des exemples sont installés sous `/usr/share/doc/live-config/examples/hooks/`.

> **Avertissement de sécurité :** `live-config` s’exécute en tant que root. Les hooks sont rendus exécutables et s’exécutent en tant que root, et les preseeds modifient la base de données debconf du système avec les privilèges root. Les protocoles HTTP et FTP simples n’authentifient pas le contenu téléchargé et n’offrent aucune protection d’intégrité. Privilégiez les fichiers locaux vérifiés ou un transport authentifié de confiance avec vérification d’intégrité indépendante ; n’utilisez pas de hooks ou preseeds distants depuis des réseaux non fiables.

### Options de stockage précoces MiniOS

Ces options sont lues par `minios-boot` avant le démarrage des services classiques. Elles nécessitent une session durable saine `perch` et ne l’activent pas elles-mêmes.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile** : `volatile` place le journal systemd et les fichiers `/var/log` ordinaires dans RAM borné ; les diagnostics de démarrage restent sur le stockage durable. Par défaut : `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile** : `volatile` place les archives APT téléchargées dans un tmpfs borné lorsque RAM et les conditions de swap le permettent. Les bases de données de paquets et listes de dépôts restent persistantes. Par défaut : `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile** : `volatile` demande des caches natifs de navigateur dans RAM. Le composant `browser-cache` monte les répertoires de cache sélectionnés de l’utilisateur live après la création du compte. Par défaut : `persistent`.

## Paramètres de démarrage (raccourcis)

Pour certains cas d’usage courants nécessitant la combinaison de plusieurs paramètres individuels, **live-config** propose des raccourcis. Cela permet à la fois d’avoir une granularité complète sur toutes les options, tout en gardant les choses simples.

- **live-config.noroot | noroot** : Désactive la configuration du mot de passe root et les élévations de privilèges sudo et PolicyKit MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled** : Contrôle la configuration sudo pour l’utilisateur live. Le comportement par défaut, et historique MiniOS si non défini, est `passwordless`. Le mode `password` conserve l’accès sudo mais requiert le mot de passe de l’utilisateur live. Le mode `disabled` retire l’élévation sudo MiniOS et exclut l’utilisateur live du groupe sudo lors de sa création. L’ancien raccourci `noroot` prévaut sur ceci et désactive plus largement la configuration des privilèges root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled** : Contrôle les règles de convenance PolicyKit MiniOS. Le comportement par défaut, et historique MiniOS si non défini, est `passwordless`. Les modes `password` et `disabled` retirent cette règle, donc l’authentification PolicyKit standard de la distribution s’applique. `disabled` n’est pas une politique de refus total ; utilisez `noroot` lorsque l’utilisateur live ne doit pas obtenir de privilèges administrateur.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false** : Écrit une politique OpenSSH `PermitRootLogin` si explicitement défini et si openssh-server est installé.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false** : Écrit une politique OpenSSH `PasswordAuthentication` si explicitement défini et si openssh-server est installé.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled** : Contrôle la posture XRDP lorsque xrdp est installé. `relaxed` conserve les valeurs par défaut historiques MiniOS. `hardened` lie XRDP à localhost, restaure les paramètres de sécurité négociés/élevés et désactive la connexion root XRDP. `disabled` désactive et arrête XRDP via `minios-svc` si disponible.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened** : Contrôle la posture de convenance X11 MiniOS. `relaxed` conserve la compatibilité historique. `hardened` retire l’option permissive `-ac` du serveur X et renforce `Xwrapper.config` si présent.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false** : Contrôle si `/etc/issue` affiche les indices de mot de passe root/live par défaut MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened** : Contrôle si live-config assouplit le verrouillage d’écran. `relaxed` conserve la commodité des sessions live historiques. `hardened` évite de désactiver le verrouillage GNOME et active le verrouillage xscreensaver lorsque ce fichier est présent.
- **live-config.noautologin | noautologin** : Empêche live-config de configurer l’ouverture de session automatique en console et en mode graphique. Cela ne retire pas l’autologin déjà configuré dans une session persistante.
- **live-config.nottyautologin | nottyautologin** : Empêche live-config de configurer l’ouverture de session automatique en console, sans affecter la configuration graphique. La configuration persistante existante n’est pas supprimée.
- **live-config.nox11autologin | nox11autologin** : Empêche live-config de configurer l’autologin du display-manager, sans affecter la configuration TTY. La configuration persistante existante n’est pas supprimée.

## Paramètres de démarrage (options spéciales)

Pour des cas d’usage particuliers, il existe quelques paramètres de démarrage spéciaux.

- **live-config.debug | debug** : Active la sortie de debug dans live-config.

## Fichiers de configuration

**live-config** peut être configuré (mais pas activé) via des fichiers de configuration. Tout paramètre de démarrage pris en charge peut être placé dans `LIVE_CONFIG_CMDLINE`, et la plupart des options peuvent aussi être définies via des variables individuelles. Le paramètre `boot=live` reste requis pour activer **live-config**.

**Remarque :** Si des fichiers de configuration sont utilisés, il est préférable de placer tous les paramètres de démarrage dans la variable **LIVE_CONFIG_CMDLINE** , ou de définir des variables individuelles. Si des variables individuelles sont utilisées, l’utilisateur doit s’assurer que toutes les variables nécessaires sont définies pour obtenir une configuration valide.

`live-config` s’occupe de sourcer `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` dans l’ordre du glob shell. Les fragments ultérieurs peuvent donc remplacer les valeurs du fichier principal ou des fragments précédents. Il n’y a pas de sourcing séparé d’une seconde couche de configuration média.

Sur les supports MiniOS, les fichiers sources sont `minios/config.conf` et `minios/config.conf.d/*.conf`. Avant que `live-config` ne démarre, l’initramfs MiniOS synchronise ces fichiers avec les fichiers runtime `/etc/live/` selon la date de modification. Un fichier source plus récent remplace son homologue runtime ; un fichier runtime plus récent est recopié uniquement si le répertoire de données MiniOS sélectionné est accessible en écriture. Des horodatages égaux n’entraînent aucune copie, les fichiers manquants sont complétés, et aucun fichier n’est supprimé. Il s’agit d’une synchronisation au démarrage, pas d’une surveillance continue. Voir [Fichier de configuration](/reference/configuration/config.conf) pour les règles complètes de synchronisation et de priorité de la ligne de commande.

En solution de repli pour les initramfs qui n’ont pas préparé le fichier runtime, les wrappers de démarrage systemd et SysV copient `minios/config.conf` depuis le support détecté uniquement si `/etc/live/config.conf` est absent. Ce repli ne copie pas les fragments `config.conf.d`. L’initramfs LiveKit MiniOS actuel effectue la synchronisation précédente.

Les fichiers fragments doivent correspondre à `*.conf`. Des noms comme `vendor.conf` ou `project.conf` sont recommandés ; choisissez des noms lexicaux avec soin car les fragments ultérieurs remplacent les précédents.

Le contenu des fichiers de configuration consiste en une ou plusieurs des variables suivantes.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn** : Cette variable correspond à la ligne de commande du bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn** : Cette variable correspond au paramètre `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn** : Cette variable correspond au paramètre `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME** : Cette variable correspond au paramètre `**live-config.hostname**=*HOSTNAME*`. Par défaut : `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off** : Définit la politique réseau filaire. `dhcp` et une valeur non définie n’ont aucun effet et ne suppriment pas un profil statique MiniOS déjà créé.
- **LIVE_NETWORK_INTERFACE=INTERFACE** : Sélectionne l’interface filaire pour la politique `static` ou `off`.
- **LIVE_NETWORK_ADDRESS=IPV4** : Définit l’adresse IPv4 statique.
- **LIVE_NETWORK_PREFIX=PREFIX** : Définit la longueur du préfixe statique ; par défaut `24`.
- **LIVE_NETWORK_GATEWAY=IPV4** : Définit la passerelle statique optionnelle.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2** : Définit les serveurs DNS optionnels, séparés par des virgules.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown** : Sélectionne le backend implémenté.

Le composant réseau enregistre `/var/lib/live/config/network` après avoir écrit la politique avec succès. Supprimez ce tampon pour appliquer une nouvelle politique sur un système persistant. Pour retirer un ancien profil statique, utilisez `network-method=off` ou supprimez manuellement le profil et le tampon gérés par MiniOS.

- **LIVE_USERNAME=USERNAME** : Cette variable correspond au paramètre `**live-config.username**=*USERNAME*`. Par défaut : `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn** : Cette variable correspond au paramètre `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"** : Cette variable correspond au paramètre `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD** : Cette variable correspond au paramètre `**live-config.root-password**=*PASSWORD*`. Elle définit le mot de passe root en clair.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD** : Cette variable correspond au paramètre `**live-config.root-password-crypted**=*PASSWORD*`. Elle définit le mot de passe root sous forme chiffrée.
- **LIVE_USER_PASSWORD=PASSWORD** : Cette variable correspond au paramètre `**live-config.user-password**=*PASSWORD*`. Elle définit le mot de passe utilisateur en clair.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD** : Cette variable correspond au paramètre `**live-config.user-password-crypted**=*PASSWORD*`. Elle définit le mot de passe utilisateur sous forme chiffrée.
- **LIVE_CONFIG_NOROOT=true|false** : Cette variable correspond au paramètre `**live-config.noroot**` et désactive la configuration des privilèges root, sudo et PolicyKit si définie sur `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled** : Cette variable correspond au paramètre `**live-config.sudo-mode**=...`. Si non défini, MiniOS conserve le comportement sudo sans mot de passe historique.
- **LIVE_POLKIT_MODE=passwordless|password|disabled** : Cette variable correspond au paramètre `**live-config.polkit-mode**=...`. `password` et `disabled` retirent la règle sans mot de passe MiniOS et rétablissent l’authentification PolicyKit standard de la distribution.
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
- **LIVE_LINK_USER_DIRS=true|false** : Active ou désactive les liens des répertoires de données utilisateurs standards vers le disque MiniOS accessible en écriture. Le paramètre de démarrage correspondant est simplement `live-config.link-user-dirs` . Le mode lien ne peut pas être combiné avec le mode bind ni avec un mode `toram`.
- **LIVE_BIND_USER_DIRS=true|false** : Active ou désactive les montages bind des répertoires de données utilisateurs standards depuis le disque MiniOS accessible en écriture. Le paramètre de démarrage correspondant est simplement `live-config.bind-user-dirs` . Le mode bind ne peut pas être combiné avec le mode lien ni avec un mode `toram`.
- **LIVE_USER_DIRS_PATH=PATH** : Cette variable correspond au paramètre `**live-config.user-dirs-path**=*PATH*`. Elle définit un chemin sûr à l’intérieur du disque MiniOS FAT32, exFAT ou NTFS. La valeur par défaut est `/minios/userdata` ; les segments point et parent-directory sont rejetés.

La configuration user-media ne fusionne jamais automatiquement deux dossiers non vides. Un dossier local non vide n’est migré que si sa destination sur le support est vide. Quand la fonctionnalité est désactivée, les données gérées sur le support sont recopiées avant la suppression des liens. L’activation et la recopie user-media sont bloquées tant que la session de persistance active est chiffrée avec LUKS, empêchant ainsi le déplacement de données de session vers un support non chiffré MiniOS. Cette décision se base sur l’état réel du chiffrement actif : `perchencrypt=luks` ne fait que demander le chiffrement lors de la création d’une nouvelle session et ne décrit pas une session existante. Un échec de validation ou de copie laisse les répertoires utilisateurs existants en place et consigne la raison dans `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged** : Cette variable contient l’état défini par le paramètre `live-config.module-mode` (ou `module-mode`) . Si elle est définie sur `merged`, le système live applique les mises à jour (via minios-update-users, minios-update-cache et minios-update-dpkg) pour fusionner les configurations personnalisées avec l’environnement de base.
- **LIVE_CONFIG_DEBUG=true|false** : Cette variable correspond au paramètre `**live-config.debug**`.

## Variables de cache et de journalisation MiniOS

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, et **LIVE_BROWSER_CACHE=persistent|volatile** : Politiques indépendantes MiniOS appliquées au démarrage. Elles fonctionnent aussi dans `config.conf.d` et `LIVE_CONFIG_CMDLINE`. Elles n’activent pas la persistance à elles seules. Voir [Fichier de configuration](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Le composant `browser-cache` lit la politique durable `minios-boot` après la création de l’utilisateur live et monte en bind les répertoires de cache natifs du navigateur dans un système de fichiers RAM partagé et borné. Une politique Firefox créée séparément désactive son cache disque sans déplacer les profils navigateur. Si ce composant est exclu par `components=` ou `nocomponents=`, la demande browser-cache précoce seule ne met pas en place les montages par utilisateur.

Les assistants en mode fusionné conservent les erreurs normales, mais créent des traces de commandes détaillées et des copies de debug uniquement si `LIVE_CONFIG_DEBUG=true`.

# PERSONNALISATION

**live-config** peut être facilement personnalisé pour des projets dérivés ou un usage local.

## Ajout de nouveaux composants de configuration

Les projets dérivés peuvent placer leurs composants dans /usr/lib/live/config sans aucune autre action, ils seront appelés automatiquement au démarrage.

Il est préférable de placer les composants dans un paquet debian dédié. Un exemple de paquet contenant un composant exemple se trouve dans /usr/share/doc/live-config/examples.

## Suppression de composants de configuration existants

Il n’est pas vraiment possible de supprimer proprement un composant sans devoir soit fournir un paquet **live-config** modifié localement, soit utiliser dpkg-divert. Cependant, le même résultat peut être obtenu en désactivant les composants concernés via le mécanisme live-config.nocomponents, voir ci-dessus. Pour éviter de devoir toujours spécifier les composants désactivés via le paramètre de démarrage, il est recommandé d’utiliser un fichier de configuration, voir ci-dessus.

Les fichiers de configuration du système live lui-même sont idéalement placés dans un paquet debian dédié. Un exemple de paquet contenant une configuration exemple se trouve dans /usr/share/doc/live-config/examples.

# COMPOSANTS

**live-config** propose actuellement les composants suivants dans /usr/lib/live/config.

- **nss-systemd** : supprime ou restaure le module NSS systemd dans /etc/nsswitch.conf pour contourner un problème connu de systemd.
- **debconf** : permet d’appliquer des fichiers preseed placés sur le média live ou un serveur http/ftp.
- **hostname** : configure /etc/hostname et /etc/hosts.
- **issue-setup** : configure le fichier /etc/issue avec une bannière de bienvenue et les informations de distribution.
- **live-debconfig_passwd** : configure les mots de passe utilisateur et root via live-debconfig.
- **user-setup** : ajoute un compte utilisateur live.
- **user-groups** : ajoute l’utilisateur live aux groupes supplémentaires déclarés par les modules installés. Les groupes existants listés dans `/usr/share/live/config/user-default-groups.d/*.groups` sont appliqués après la création de l’utilisateur et lors des exécutions ultérieures de live-config.
- **root-setup** : définit ou met à jour le mot de passe root et configure l’environnement de l’utilisateur root.
- **sudo** : accorde les privilèges sudo à l’utilisateur live.
- **user-ssh-keys** : synchronise les fichiers `authorized_keys.<username>` spécifiques à l’utilisateur entre le média live et les dossiers personnels des utilisateurs. Prend en charge plusieurs utilisateurs simultanément (ex. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) et reconnaît les formes `toram` , `toram=trim` et `toram=full` comme variantes au démarrage RAM lors de la décision de mise à jour sûre du média live.
- **user-media** : lie ou monte en bind les dossiers utilisateurs validés sur le support de données existant MiniOS accessible en écriture, avec migration sûre et recopie lors de la désactivation.
- **locales** : configure les locales.
- **tzdata** : configure /etc/timezone.
- **xorg-service** : configure le nom d’utilisateur dans xorg.service et applique la posture X11 si supportée.
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
- **kaboom** : désactive l’assistant de migration KDE (squeeze et versions ultérieures).
- **kde-services** : désactive certains services KDE indésirables (squeeze et versions ultérieures).
- **policykit** : accorde des privilèges utilisateur via PolicyKit.
- **ssl-cert** : régénère les certificats SSL snake-oil.
- **xrdp** : configure la posture XRDP (relaxée, renforcée ou désactivée) lorsque XRDP est installé.
- **anacron** : désactive anacron.
- **util-linux** : désactive le service hwclock de util-linux.
- **login** : désactive lastlog.
- **xserver-xorg** : configure xserver-xorg.
- **network** : configure la politique IPv4 filaire durable via un fichier clé NetworkManager sécurisé ou une section ifupdown. Il s’exécute avant les services réseau, valide toutes les valeurs et ne tamponne qu’après un succès.
- **openssh-server** : recrée les clés hôtes OpenSSH et écrit la politique root-login ou password-authentication explicitement demandée.
- **xfce4-panel** : configure xfce4-panel avec les paramètres par défaut.
- **xscreensaver** : contrôle le verrouillage xscreensaver selon `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta** : configure les pilotes WLAN broadcom-sta.
- **hyperv** : configure les paramètres X11 pour améliorer la compatibilité sur les plateformes Microsoft Hyper-V.
- **ntfs3** : gère les règles udev pour la prise en charge NTFS3.
- **config-module-mode** : configure le mode module système et met à jour les caches, les paramètres utilisateur et dpkg.
- **hooks** : permet d’exécuter des commandes arbitraires à partir d’un fichier placé sur le média live ou un serveur http/ftp.

# FICHIERS

- `minios/config.conf` sur le support de données sélectionné MiniOS (copie source)
- `minios/config.conf.d/*.conf` sur le support de données sélectionné MiniOS (fragments source)
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
- `minios/log/YYYYMMDD_HHMMSS/` sur les supports de données sélectionnés accessibles en écriture lorsque l’export des logs est activé
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` sur le support live détecté (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` sur le support live détecté (`medium` preseeds)

# VOIR AUSSI

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PAGE D’ACCUEIL

Plus d’informations sur **minios-live-config** sont disponibles dans son [dépôt GitHub](https://github.com/minios-linux/minios-live-config). Des informations générales MiniOS sont disponibles sur [minios.dev](https://minios.dev).

# BOGUES

Les bogues peuvent être signalés dans le [gestionnaire d’incidents minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTEUR

**live-config** a été initialement écrit par Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Depuis 2016, le développement a été poursuivi par l’équipe Debian Live. Depuis 2025, le développement de la version modifiée **minios-live-config** est assuré par l’équipe Live MiniOS.
