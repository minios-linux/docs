# Fichier de configuration

MiniOS se distingue de la plupart des distributions flash classiques en permettant de configurer certains paramètres avant le démarrage via un fichier de configuration simple `config/config.conf`, ce qui réduit considérablement le travail nécessaire lors de la création de vos propres modules pour des systèmes embarqués. Certains paramètres peuvent également être définis en option dans les paramètres de démarrage. Les options de démarrage priment sur le fichier de configuration. Certains paramètres de ce fichier sont réservés au service et il est préférable de ne pas les modifier. Voici un exemple de fichier de configuration standard :

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Description des paramètres

**Légende :**
- 🔒 **Une seule fois** – Appliqué uniquement au premier démarrage, ne peut pas être modifié lors des démarrages suivants  
- 🔄 **Reconfigurable** – Peut être modifié à chaque démarrage et réappliqué

| Paramètre | Reconfigurable | Signification | Exemple |
| --------- | -------------- | ------------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Paramètres supplémentaires de démarrage pour live-config. Voir `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Nom du nœud associé au système. Voir `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nom de l'utilisateur dont le profil sera créé au premier démarrage. Si vous indiquez le nom d'utilisateur <strong>root</strong>, aucun profil utilisateur ne sera créé et la connexion se fera avec le profil <strong>root</strong>. Voir `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nom complet de l'utilisateur principal. Voir `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Liste des groupes pour l'utilisateur principal, séparés par des virgules. Voir `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Mot de passe de l'utilisateur principal sous forme chiffrée (hash). Utilisez `mkpasswd -m yescrypt` pour générer. Voir `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Mot de passe de l'utilisateur privilégié **root** sous forme chiffrée (hash). Utilisez `mkpasswd -m yescrypt` pour générer. Voir `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Si activé, désactive la connexion au compte root et désactive sudo/policykit pour l'utilisateur. Voir `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Définit la locale. Plusieurs valeurs peuvent être séparées par des virgules. Voir `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Définit le fuseau horaire (ex : "Europe/Berlin", "Etc/UTC"). Voir `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Définit le modèle de clavier (ex : "pc105"). Voir `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Définit les dispositions clavier (séparées par des virgules, ex : "us,de"). Voir `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Définit les options clavier (ex : "grp:alt_shift_toggle,grp_led:scroll"). Voir `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Définit les variantes de clavier (séparées par des virgules, peut être vide ou correspondre aux layouts). Voir `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Active le mode debug pour live-config. Voir `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Si activé, les répertoires utilisateur seront liés depuis le chemin spécifié. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Si activé, les répertoires utilisateur seront montés en bind depuis le chemin spécifié. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Chemin vers les répertoires de données utilisateur sur la clé USB. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Sélectionne le mode de fonctionnement du système. Si vous prévoyez d’installer les logiciels uniquement par modules, utilisez "merged". Si vous souhaitez installer des logiciels avec apt, utilisez "simple". Par défaut : "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Cible systemd pour le démarrage. Voir `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Active les services au démarrage (séparés par des virgules). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Désactive les services au démarrage (séparés par des virgules). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Si activé, lors d’un démarrage depuis un support inscriptible, les logs MiniOS sont copiés dans le dossier minios/logs au démarrage. | EXPORT_LOGS="false" |


**Pour plus de détails sur la plupart des paramètres, consultez :**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Pour les cibles systemd : `man systemd.special`

## Important !

* Le serveur SSH est activé par défaut pour assurer la compatibilité avec les initrds tiers ; pour le désactiver, il ne suffit pas de le retirer de `ENABLE_SERVICES`.

À quoi d'autre peut servir le fichier `config.conf` ? Vous pouvez l’utiliser pour définir vos propres paramètres dans vos scripts lors de la création de modules. Au premier démarrage, il est copié dans le dossier /etc/minios, puis le fichier `/etc/live/config.conf` est automatiquement surveillé et, en cas de modification, il écrase le fichier de configuration sur la clé USB si celle-ci est inscriptible. Ainsi, vous pouvez placer vos variables dans config.conf et les récupérer depuis `/etc/live/config.conf` dans vos scripts, quel que soit le type d’initrd utilisé.
