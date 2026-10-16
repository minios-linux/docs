---
updated: 2026-10-15
program_commits:
    minios-live-config: 2a798c533b2980a40e8457205cabfa24ccad2d10
---

# live-config

**configuration en direct**

**live-config** contient les composants qui configurent un système live pendant le processus de démarrage (espace utilisateur tardif).

La stratégie de cache et de journalisation des sessions persistantes est définie plus tôt par `minios-boot`, après la préparation de la racine live et de sa configuration, mais avant le démarrage des services habituels. Le composant `browser-cache` applique les montages propres à chaque utilisateur après la création de celui-ci. Ces stratégies nécessitent l’activation réussie de la persistance sur un stockage durable ou sous la forme d’une session accessible en écriture RAM-copiée avec des informations d’origine protégées, ainsi qu’un initrd prenant en charge `perch-storage-v1`. Les sessions RAM-copiées ne sont pas durables tant qu’elles n’ont pas été enregistrées ; voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Le démarrage réseau dans l’initramfs (`ip=`, PXE, `from=http://…`) constitue une couche LiveKit distincte et n’est **pas** géré par live-config. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

**live-config** peut être configuré à l’aide des paramètres de démarrage ou des fichiers de configuration d’exécution préparés par l’initramfs. La ligne de commande effective du noyau est ajoutée après les valeurs définies dans les fichiers, de sorte que les paramètres de démarrage correspondants ultérieurs sont prioritaires. Les composants qui enregistrent leur état dans `LIVE_CONFIG_CMDLINE` ne s’exécutent normalement qu’une seule fois ; les composants de synchronisation et sans état peuvent s’exécuter à chaque appel.`/var/lib/live/config`

Si *live-build*(7) est utilisé pour créer le système live, les paramètres live-config utilisés par défaut peuvent être définis à l’aide de l’option `--bootappend-live` ; voir la page de manuel *lb_config*(1).

## Paramètres d’amorçage (composants)

**live-config** n’est activé que si `boot=live` est utilisé comme paramètre d’amorçage. Par défaut, tous les composants sont exécutés. Le `live-config.components` paramètre permet de limiter les composants exécutés, et `live-config.nocomponents` permet d’exclure des composants. Si les deux paramètres sont utilisés, ou si l’un d’eux est spécifié plusieurs fois, la dernière occurrence prévaut.

- **live-config.components | components**: Tous les composants sont exécutés. C’est le comportement par défaut des images live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Seuls les composants spécifiés sont exécutés. Les composants sont exécutés dans l’ordre indiqué par leurs noms de fichier sous `/usr/lib/live/config`, quel que soit leur ordre dans cette liste.
- **live-config.nocomponents | nocomponents**: Aucun composant n’est exécuté.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Tous les composants sont exécutés, à l’exception de ceux spécifiés.

## Paramètres de démarrage (options)

Certains composants peuvent modifier leur comportement en fonction d’un paramètre de démarrage.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Télécharge et applique un ou plusieurs fichiers de préconfiguration debconf. Les URL sont traitées par `wget` et peuvent utiliser HTTP, FTP ou `file://`. Le mot-clé `filesystem` développe les fichiers dans `/usr/lib/live/config-preseed/` ; `medium` développe les fichiers dans `minios/config-preseed/` sur le support live détecté. Les fichiers locaux explicites peuvent utiliser des chemins tels que `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` dans la racine du système live. Les entrées séparées par des barres verticales sont traitées dans l’ordre indiqué ; les fichiers développés par un mot-clé suivent l’ordre des motifs glob du shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permet de définir le nom d’hôte du système. La valeur par défaut est `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Sélectionne la politique réseau filaire. Si ce paramètre n’est pas défini, ou si `dhcp` est défini, la valeur par défaut de l’image reste inchangée. `static` écrit la configuration du backend sélectionné ; `off` désactive la configuration IPv4 automatique pour l’interface sélectionnée.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Sélectionne l’interface filaire. Si ce paramètre est omis avec `static` ou `off`, l’unique interface filaire qui n’est pas une interface de bouclage est sélectionnée automatiquement ; s’il n’y a aucune interface correspondante ou s’il y en a plusieurs, une valeur explicite est nécessaire.
- **live-config.network-address=IPV4 | network-address=IPV4**: Définit l’adresse IPv4 statique.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Définit la longueur du préfixe IPv4, de 0 à 32. La valeur statique par défaut est `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Définit la passerelle IPv4 facultative.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Définit des adresses de serveurs DNS facultatives, séparées par des virgules.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Sélectionne le backend réseau. `auto` privilégie NetworkManager et utilise ifupdown en solution de repli. Si `ifupdown` est forcé, l’interface est déclarée non gérée par NetworkManager lorsque les deux piles sont installées.
- **live-config.username=USERNAME | username=USERNAME**: Permet de définir le nom d’utilisateur créé pour la connexion automatique. La valeur par défaut est `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Définit les groupes supplémentaires de l’utilisateur créé pour la connexion automatique. Les noms de groupes peuvent être séparés par des virgules ou des espaces. La valeur par défaut de MiniOS est `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permet de définir le nom complet de l’utilisateur créé pour la connexion automatique. La valeur par défaut de MiniOS est `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permet de définir le mot de passe root en texte brut.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permet de définir le mot de passe root sous forme chiffrée.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permet de définir le mot de passe de l’utilisateur en texte brut.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permet de définir le mot de passe de l’utilisateur sous forme chiffrée.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permet de définir les paramètres régionaux du système, par exemple `de_CH.UTF-8`. La valeur par défaut est `en_US.UTF-8`. Si les paramètres régionaux sélectionnés ne sont pas déjà disponibles sur le système, ils sont générés automatiquement à la volée.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permet de définir le fuseau horaire du système, par exemple `Europe/Zurich`. La valeur par défaut est `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permet de modifier le modèle de clavier. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permet de modifier les dispositions du clavier. Si plusieurs dispositions sont spécifiées, les outils de l’environnement de bureau permettent de passer de l’une à l’autre sous X11. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permet de modifier les variantes du clavier. Si plusieurs variantes sont spécifiées, leur nombre doit correspondre à celui des dispositions : elles sont associées une à une, dans l’ordre indiqué. Les valeurs vides sont autorisées. Sous X11, les outils de l’environnement de bureau permettent de passer d’une paire disposition-variante à l’autre. Aucune valeur par défaut n’est définie.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permet de modifier les options du clavier. Aucune valeur par défaut n’est définie.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permet de désactiver des services sysv à l’aide de update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permet d’indiquer si le système considère que l’horloge matérielle est réglée sur UTC. La valeur par défaut est `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permet de définir le gestionnaire de session X à l’aide de update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permet de définir le pilote Xorg au lieu de le détecter automatiquement. Si un ID PCI est spécifié dans `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` au sein du système live, le pilote *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont tous deux présents, le paramètre de démarrage est prioritaire.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permet de définir la résolution Xorg au lieu de la détecter automatiquement, par exemple 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permet de définir le pilote WLAN au lieu de le détecter automatiquement. Si un ID PCI est spécifié dans `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` au sein du système live, le pilote *DRIVER* est imposé pour ces périphériques. Si un paramètre de démarrage et une surcharge sont tous deux présents, le paramètre de démarrage est prioritaire.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permet de spécifier le mode des modules pour la configuration live. Lorsque la valeur est `merged`, le système met à jour les comptes utilisateur, reconstruit les caches et actualise les paramètres des paquets afin d’intégrer dynamiquement les modifications de configuration au système en cours d’exécution.
- **live-config.link-user-dirs | link-user-dirs**: Lie les répertoires utilisateur gérés au chemin configuré sur le support de données MiniOS. Ce mode est incompatible avec le mode bind et n’est pas disponible avec un mode `toram` ni lorsque la session de persistance active est chiffrée avec LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Monte par bind les répertoires utilisateur gérés depuis le chemin configuré sur le support de données MiniOS. Ce mode est incompatible avec le mode link et soumis aux mêmes restrictions concernant les modes `toram` et le chiffrement de la session active.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Définit le chemin relatif au support utilisé par `link-user-dirs` ou `bind-user-dirs`. La valeur par défaut est `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Télécharge et exécute des fichiers quelconques depuis un fichier temporaire dans le système live en cours d’exécution. Les URL sont traitées par `wget` et peuvent utiliser HTTP, FTP ou `file://` ; les interpréteurs requis et autres dépendances doivent déjà être installés. Le mot-clé `filesystem` développe les fichiers dans `/usr/lib/live/config-hooks/` ; `medium` développe les fichiers dans `minios/config-hooks/` sur le support live détecté (avec un recours au chemin ISO dans le composant hook). Les fichiers locaux explicites peuvent utiliser `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` dans la racine du système live. Les entrées séparées par des barres verticales sont exécutées dans l’ordre indiqué ; les fichiers développés par un mot-clé suivent l’ordre des motifs glob du shell. Des exemples sont installés dans `/usr/share/doc/live-config/examples/hooks/`.

> **Avertissement de sécurité :** `live-config` s’exécute en tant que root. Les hooks sont rendus exécutables et lancés en tant que root, et les fichiers de préconfiguration modifient la base de données debconf du système avec les privilèges root. HTTP et FTP en clair n’authentifient pas le contenu téléchargé et n’en garantissent pas l’intégrité. Privilégiez les fichiers locaux vérifiés ou un transport authentifié de confiance avec une vérification indépendante de l’intégrité ; n’utilisez pas de hooks ou de fichiers de préconfiguration distants provenant de réseaux non fiables.

### Options de stockage anticipé MiniOS

Ces options sont lues par `minios-boot` avant le démarrage des services habituels. Elles nécessitent l’activation réussie de la persistance sur un stockage durable ou une session RAM accessible en écriture avec des informations `ram-origin` protégées. Elles n’activent pas elles-mêmes la persistance et ne peuvent pas rendre durables les modifications RAM sans les enregistrer.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` place le journal systemd et les fichiers `/var/log` habituels dans un RAM de taille limitée ; les diagnostics de démarrage restent sur un stockage durable. Valeur par défaut : `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` place les archives APT téléchargées dans un tmpfs de taille limitée lorsque RAM et les conditions de swap le permettent. Les bases de données des paquets et les listes des dépôts restent persistantes. Valeur par défaut : `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` demande le stockage des caches des navigateurs natifs dans RAM. Le composant `browser-cache` monte les répertoires de cache choisis par l’utilisateur actif une fois son compte créé. Valeur par défaut : `persistent`.

## Paramètres de démarrage (raccourcis)

Pour certains cas d’utilisation courants qui nécessiteraient de combiner plusieurs paramètres individuels, **live-config** propose des raccourcis. Cela permet de conserver un contrôle précis sur toutes les options, tout en simplifiant leur utilisation.

- **live-config.noroot | noroot**: Désactive la configuration du mot de passe root, ainsi que les autorisations sudo et PolicyKit accordées par MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Contrôle la configuration de sudo pour l’utilisateur de la session live. Par défaut, et conformément au comportement historique MiniOS lorsque ce paramètre n’est pas défini, le mode est `passwordless`. Le `password` mode conserve l’accès à sudo, mais exige le mot de passe de l’utilisateur de la session live. Le mode `disabled` supprime l’autorisation sudo accordée par MiniOS et n’ajoute pas l’utilisateur au groupe sudo lors de sa création. L’ancien raccourci `noroot` remplace ce comportement et désactive plus largement la configuration des privilèges root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Contrôle les règles de confort MiniOS de PolicyKit. Par défaut, et conformément au comportement historique MiniOS lorsque ce paramètre n’est pas défini, le mode est `passwordless`. Le mode `password` et le mode `disabled` suppriment cette règle ; l’authentification PolicyKit standard de la distribution s’applique alors. `disabled` ne constitue pas une interdiction absolue ; utilisez `noroot` si l’utilisateur de la session live ne doit pas pouvoir obtenir de privilèges d’administration.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Définit une règle OpenSSH `PermitRootLogin` lorsque le paramètre est explicitement défini et que openssh-server est installé.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Définit une règle OpenSSH `PasswordAuthentication` lorsque le paramètre est explicitement défini et que openssh-server est installé.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Contrôle le niveau de sécurité de XRDP lorsque xrdp est installé. `relaxed` conserve les paramètres par défaut historiques MiniOS. `hardened` lie XRDP à localhost, rétablit les paramètres de sécurité négociés/élevés et désactive la connexion root à XRDP. `disabled` désactive et arrête XRDP via `minios-svc` lorsque cela est possible.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Contrôle le niveau de sécurité de confort MiniOS de X11. `relaxed` préserve la compatibilité historique. `hardened` supprime l’option permissive du serveur X `-ac` et renforce la sécurité de `Xwrapper.config` lorsqu’il est présent.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Contrôle si `/etc/issue` affiche les indications par défaut concernant les mots de passe root/de la session live MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Contrôle si live-config assouplit le verrouillage de l’écran. `relaxed` conserve la facilité d’utilisation historique des sessions live. `hardened` évite de désactiver le verrouillage de GNOME et active celui de xscreensaver lorsque ce fichier est présent.
- **live-config.noautologin | noautologin**: Empêche live-config de configurer la connexion automatique dans la console et l’interface graphique. Ne supprime pas la connexion automatique déjà configurée dans une session persistante.
- **live-config.nottyautologin | nottyautologin**: Empêche live-config de configurer la connexion automatique dans la console, sans affecter la configuration de l’interface graphique. La configuration persistante existante n’est pas supprimée.
- **live-config.nox11autologin | nox11autologin**: Empêche live-config de configurer la connexion automatique via le gestionnaire d’affichage, sans affecter la configuration du TTY. La configuration persistante existante n’est pas supprimée.

## Paramètres de démarrage (options spéciales)

Certains cas d’utilisation nécessitent des paramètres de démarrage spécifiques.

- **live-config.debug | debug**: Active les informations de débogage dans live-config.

## Fichiers de configuration

**live-config** peut être configuré (mais pas activé) via des fichiers de configuration. Tout paramètre de démarrage pris en charge peut être placé dans `LIVE_CONFIG_CMDLINE`, et la plupart des options peuvent également être définies au moyen de variables individuelles. Le paramètre `boot=live` est toujours nécessaire pour activer **live-config**.

**Remarque :** Si des fichiers de configuration sont utilisés, il faut soit (de préférence) placer tous les paramètres de démarrage dans la variable **LIVE_CONFIG_CMDLINE** soit définir des variables individuelles. Lorsque des variables individuelles sont utilisées, l'utilisateur doit s'assurer que toutes les variables nécessaires sont définies afin de créer une configuration valide.

`live-config` lui-même charge `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` selon l'ordre des motifs shell. Les fragments suivants peuvent donc remplacer les valeurs du fichier principal ou des fragments précédents. Il ne charge pas séparément une deuxième couche de configuration du support.

Sur les supports MiniOS, les fichiers source sont `minios/config.conf` et `minios/config.conf.d/*.conf`. Avant le démarrage de `live-config` l'initramfs MiniOS synchronise ces fichiers avec les fichiers d'exécution `/etc/live/` en fonction de leur date de modification. Un fichier source plus récent remplace son équivalent d'exécution ; un fichier d'exécution plus récent n'est recopié que si le répertoire de données MiniOS sélectionné est accessible en écriture. Des horodatages identiques n'entraînent aucune copie, les fichiers manquants sont créés et aucun fichier n'est supprimé. Il s'agit d'une synchronisation au démarrage, et non d'une surveillance continue. Voir [Fichier de configuration](/reference/configuration/config.conf) pour connaître les règles complètes de synchronisation et de priorité de la ligne de commande.

En secours pour les implémentations d'initramfs qui n'ont pas préparé le fichier d'exécution, les wrappers de démarrage systemd et SysV copient `minios/config.conf` depuis le support détecté uniquement lorsque `/etc/live/config.conf` est absent. Ce mécanisme de secours ne copie pas les fragments de `config.conf.d`. L'initramfs LiveKit MiniOS standard actuel effectue la synchronisation précédente à la place.

Les fichiers de fragments doivent correspondre à `*.conf`. Des noms tels que `vendor.conf` ou `project.conf` sont recommandés ; choisissez délibérément des noms selon l'ordre lexicographique, car les fragments suivants remplacent les précédents.

Le contenu réel des fichiers de configuration se compose d'une ou plusieurs des variables suivantes.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Cette variable correspond à la ligne de commande du chargeur d'amorçage.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Cette variable correspond au paramètre `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Cette variable correspond au paramètre `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Cette variable correspond au paramètre `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Cette variable correspond au paramètre `**live-config.hostname**=*HOSTNAME*`. La valeur par défaut est `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Sélectionne la politique réseau filaire. `dhcp` et une valeur non définie sont sans effet et ne suppriment pas le profil statique MiniOS créé précédemment.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Sélectionne l'interface filaire pour `static` ou la politique `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Définit l'adresse IPv4 statique.
- **LIVE_NETWORK_PREFIX=PREFIX**: Définit la longueur de préfixe statique ; la valeur par défaut est `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Définit la passerelle statique facultative.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Définit les serveurs DNS facultatifs séparés par des virgules.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Sélectionne le backend implémenté.

Le composant réseau enregistre `/var/lib/live/config/network` après avoir écrit la politique avec succès. Supprimez cette marque pour appliquer une politique modifiée sur un système persistant. Pour retirer un ancien profil statique, utilisez `network-method=off` ou supprimez manuellement le profil géré par MiniOS ainsi que la marque.

- **LIVE_USERNAME=USERNAME**: Cette variable correspond au paramètre `**live-config.username**=*USERNAME*`. La valeur par défaut est `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Cette variable correspond au paramètre `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Cette variable correspond au paramètre `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Cette variable correspond au paramètre `**live-config.root-password**=*PASSWORD*`. Elle indique le mot de passe root en clair.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Cette variable correspond au paramètre `**live-config.root-password-crypted**=*PASSWORD*`. Elle indique le mot de passe root sous forme chiffrée.
- **LIVE_USER_PASSWORD=PASSWORD**: Cette variable correspond au paramètre `**live-config.user-password**=*PASSWORD*`. Elle indique le mot de passe utilisateur en clair.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Cette variable correspond au paramètre `**live-config.user-password-crypted**=*PASSWORD*`. Elle indique le mot de passe utilisateur sous forme chiffrée.
- **LIVE_CONFIG_NOROOT=true|false**: Cette variable correspond au paramètre `**live-config.noroot**` et désactive la configuration des privilèges root, sudo et PolicyKit lorsqu'elle vaut `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Cette variable correspond au paramètre `**live-config.sudo-mode**=...`. Si elle n'est pas définie, MiniOS conserve le comportement historique de sudo sans mot de passe.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Cette variable correspond au paramètre `**live-config.polkit-mode**=...`. `password` et `disabled` suppriment la règle MiniOS sans mot de passe et rétablissent l'authentification PolicyKit normale de la distribution.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Cette variable correspond au paramètre `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Cette variable correspond au paramètre `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Cette variable correspond au paramètre `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Cette variable correspond au paramètre `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Cette variable correspond au paramètre `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Cette variable correspond au paramètre `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Cette variable correspond au paramètre `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Cette variable correspond au paramètre `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Cette variable correspond au paramètre `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Cette variable correspond au paramètre `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Cette variable correspond au paramètre `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Cette variable correspond au paramètre `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Cette variable correspond au paramètre `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Cette variable correspond au paramètre `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Cette variable correspond au paramètre `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Cette variable correspond au paramètre `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Cette variable correspond au paramètre `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Cette variable correspond au paramètre `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Cette variable correspond au paramètre `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Active ou désactive les liens entre les répertoires de données standard de l'utilisateur et le lecteur MiniOS accessible en écriture. Le paramètre de démarrage correspondant est l'indicateur `live-config.link-user-dirs` nu. Le mode lien ne peut pas être combiné avec le mode bind ni avec un quelconque mode `toram` .
- **LIVE_BIND_USER_DIRS=true|false**: Active ou désactive les montages bind des répertoires de données standard de l'utilisateur depuis le lecteur MiniOS accessible en écriture. Le paramètre de démarrage correspondant est l'indicateur `live-config.bind-user-dirs` nu. Le mode bind ne peut pas être combiné avec le mode lien ni avec un quelconque mode `toram` .
- **LIVE_USER_DIRS_PATH=PATH**: Cette variable correspond au paramètre `**live-config.user-dirs-path**=*PATH*`. Elle indique un chemin sûr à l'intérieur du lecteur MiniOS FAT32, exFAT ou NTFS. La valeur par défaut est `/minios/userdata` ; les segments représentant le répertoire courant et le répertoire parent sont refusés.

La configuration des supports utilisateur ne fusionne jamais automatiquement deux répertoires non vides. Un répertoire local non vide est migré uniquement lorsque sa destination sur le support est vide. Lorsque la fonctionnalité est désactivée, les données utilisateur gérées sont recopiées avant la suppression des liens. L'activation des supports utilisateur et la recopie sont bloquées lorsque la session de persistance active est chiffrée avec LUKS, afin d'empêcher le déplacement des données de session vers un support MiniOS non chiffré. Cette décision utilise l'état réel du chiffrement actif : `perchencrypt=luks` demande le chiffrement uniquement lors de la création d'une nouvelle session et ne décrit pas une session existante. En cas d'échec de la validation ou de la copie, les répertoires utilisateur existants sont conservés et la raison est consignée dans `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Cette variable contient l'état indiqué par le paramètre `live-config.module-mode` (ou `module-mode`). Lorsqu'elle vaut `merged`, le système live applique les mises à jour (via minios-update-users, minios-update-cache et minios-update-dpkg) afin de fusionner les configurations personnalisées avec l'environnement de base.
- **LIVE_CONFIG_DEBUG=true|false**: Cette variable correspond au paramètre `**live-config.debug**`.

## MiniOS variables de cache et de journalisation

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, et **LIVE_BROWSER_CACHE=persistent|volatile**: politiques de démarrage indépendantes MiniOS. Elles fonctionnent également dans `config.conf.d` et `LIVE_CONFIG_CMDLINE`. Elles n'activent pas la persistance à elles seules. Voir [Fichier de configuration](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Le `browser-cache` lit la `minios-boot` stratégie validée après la création de l'utilisateur actif et monte les répertoires de cache standard des navigateurs natifs dans un système de fichiers RAM partagé à capacité limitée, sous réserve de vérifications de la mémoire et du swap. Une stratégie Firefox créée séparément désactive son cache disque sans déplacer les profils du navigateur. Si ce composant est exclu par `components=` ou `nocomponents=`, la demande précoce de cache du navigateur ne configure pas à elle seule les montages par utilisateur.

Les assistants du mode fusionné conservent les erreurs normales, mais ne créent des traces détaillées des commandes et des copies de débogage que lorsque `LIVE_CONFIG_DEBUG=true`.

# Personnalisation

**live-config** peut être facilement personnalisé pour les projets dérivés ou une utilisation locale.

## Ajouter de nouveaux composants de configuration

Les projets en aval peuvent placer leurs composants dans /usr/lib/live/config et n’ont rien d’autre à faire : les composants seront appelés automatiquement au démarrage.

Il est préférable de placer les composants dans leur propre paquet Debian. Un exemple de paquet contenant un composant d’exemple se trouve dans /usr/share/doc/live-config/examples.

## Suppression de composants de configuration existants

Il n’est pas encore vraiment possible de supprimer les composants eux-mêmes de manière fiable sans devoir soit fournir un paquet **live-config** modifié localement, soit utiliser dpkg-divert. Il est toutefois possible d’obtenir le même résultat en désactivant les composants concernés via le mécanisme live-config.nocomponents, voir ci-dessus. Pour éviter de devoir toujours spécifier les composants désactivés via le paramètre d’amorçage, il convient d’utiliser un fichier de configuration, voir ci-dessus.

Les fichiers de configuration du système live lui-même doivent de préférence être placés dans un paquet Debian dédié. Un exemple de paquet contenant une configuration d’exemple se trouve dans /usr/share/doc/live-config/examples.

# COMPOSANTS

**live-config** propose actuellement les composants suivants dans /usr/lib/live/config.

- **nss-systemd** : supprime ou restaure le module NSS de systemd dans /etc/nsswitch.conf pour contourner un problème connu de systemd.
- **debconf** : permet d’appliquer des fichiers preseed arbitraires placés sur le média live ou sur un serveur http/ftp.
- **hostname** : configure /etc/hostname et /etc/hosts.
- **issue-setup** : configure le fichier /etc/issue avec une bannière d’accueil et des informations sur la distribution.
- **live-debconfig_passwd** : configure les mots de passe utilisateur et root via live-debconfig.
- **user-setup** : ajoute un compte utilisateur live.
- **user-groups** : ajoute l’utilisateur live aux groupes supplémentaires déclarés par les modules installés. Les groupes existants répertoriés dans `/usr/share/live/config/user-default-groups.d/*.groups` sont appliqués après la création de l’utilisateur et lors des exécutions ultérieures de live-config.
- **root-setup** : définit ou met à jour le mot de passe root et configure l’environnement de l’utilisateur root.
- **sudo** : accorde les privilèges sudo à l’utilisateur live.
- **user-ssh-keys** : synchronise les fichiers `authorized_keys.<username>` propres à l’utilisateur entre le média live et les répertoires personnels individuels. Prend en charge plusieurs utilisateurs simultanément (par exemple, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) et reconnaît les formes simples `toram`, `toram=trim` et `toram=full` comme formes RAM-boot lors de la détermination de la possibilité de mettre à jour le média live en toute sécurité.
- **user-media** : lie ou monte par liaison les répertoires utilisateur validés sur le média de données MiniOS inscriptible existant, avec migration et recopie sécurisées lors de la désactivation.
- **locales** : configure les paramètres régionaux.
- **tzdata** : configure /etc/timezone.
- **xorg-service** : configure le nom d’utilisateur dans xorg.service et applique les paramètres X11 lorsque cela est pris en charge.
- **gdm3** : configure la connexion automatique dans gdm3.
- **sddm** : configure la connexion automatique dans sddm.
- **kdm** : configure la connexion automatique dans kdm.
- **lightdm** : configure la connexion automatique dans lightdm.
- **lxdm** : configure la connexion automatique dans lxdm.
- **nodm** : configure la connexion automatique dans nodm.
- **slim** : configure la connexion automatique dans slim.
- **xinit** : configure la connexion automatique avec xinit.
- **keyboard-configuration** : configure le clavier.
- **sysvinit** : configure la connexion automatique sur la console via `/etc/inittab` lorsque sysvinit est installé. Les raccourcis `noautologin` et `nottyautologin` désactivent cette configuration.
- **sysv-rc** : configure sysv-rc en désactivant les services répertoriés.
- **apport** : désactive apport.
- **gnome-panel-data** : désactive le bouton de verrouillage de l’écran.
- **gnome-power-manager** : désactive l’hibernation.
- **gnome-screensaver** : contrôle le verrouillage de l’écran GNOME selon `LIVE_LOCKSCREEN_MODE`.
- **kaboom** : désactive l’assistant de migration KDE (squeeze et versions ultérieures).
- **kde-services** : désactive certains services KDE indésirables (squeeze et versions ultérieures).
- **policykit** : accorde des privilèges utilisateur via PolicyKit.
- **ssl-cert** : régénère les certificats SSL snake-oil.
- **xrdp** : configure le niveau de sécurité XRDP en mode permissif, renforcé ou désactivé lorsque XRDP est installé.
- **anacron** : désactive anacron.
- **util-linux** : désactive le service hwclock de util-linux.
- **login** : désactive lastlog.
- **xserver-xorg** : configure xserver-xorg.
- **network** : configure une stratégie IPv4 filaire persistante via un fichier de clés NetworkManager sécurisé ou une section ifupdown. S’exécute avant les services réseau, valide toutes les valeurs et n’enregistre l’état qu’après une écriture réussie.
- **openssh-server** : recrée les clés d’hôte OpenSSH et écrit explicitement la stratégie demandée concernant la connexion root ou l’authentification par mot de passe.
- **xfce4-panel** : configure xfce4-panel avec les paramètres par défaut.
- **xscreensaver** : contrôle le verrouillage de xscreensaver selon `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta** : configure les pilotes WLAN broadcom-sta.
- **hyperv** : configure les paramètres X11 afin d’améliorer la compatibilité sur les plateformes Microsoft Hyper-V.
- **ntfs3** : gère les règles udev pour la prise en charge de NTFS3.
- **config-module-mode** : configure le mode des modules système et met à jour les caches, les paramètres utilisateur et dpkg.
- **browser-cache** : applique la stratégie browser-cache validée après la création de l’utilisateur, sous réserve de la mémoire disponible, du swap, de chemins de cache sûrs et de fichiers de stratégie Firefox existants.
- **hooks** : permet d’exécuter des commandes arbitraires depuis un fichier placé sur le média live ou sur un serveur http/ftp.

# FICHIERS

- `minios/config.conf` sur le support de données sélectionné MiniOS (copie source)
- `minios/config.conf.d/*.conf` sur le support de données sélectionné MiniOS (fragments sources)
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
- `minios/log/YYYYMMDD_HHMMSS/` sur les supports de données sélectionnés et inscriptibles lorsque l’exportation des journaux est activée
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` sur le support live détecté (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` sur le support live détecté (`medium` preseeds)

# VOIR AUSSI

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PAGE D’ACCUEIL

Plus d’informations sur **minios-live-config** sont disponibles dans son [dépôt GitHub](https://github.com/minios-linux/minios-live-config). Des informations générales sur MiniOS sont disponibles à [minios.dev](https://minios.dev).

# BOGUES

Les bugs peuvent être signalés dans le [suivi des problèmes de minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTEUR

**live-config** a été initialement écrit par Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Depuis 2016, le développement est assuré par l'équipe Debian Live. Depuis 2025, le développement de la version modifiée de **minios-live-config** est assuré par l'équipe MiniOS Live.
