# Fichier de configuration

Les supports de démarrage MiniOS stockent la configuration principale dans `minios/config.conf`. Lors du démarrage, l’initramfs la synchronise vers `/etc/live/config.conf` dans la racine live assemblée. Les scripts du système en cours d’exécution doivent donc lire `/etc/live/config.conf` ; `/etc/minios/config.conf` et `config/config.conf` ne sont pas des chemins de configuration utilisés par le code de démarrage actuel.

Les paramètres de démarrage peuvent remplacer les réglages correspondants du fichier. Voici un exemple de `config.conf` standard :

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
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
| LIVE_CONFIG_CMDLINE | 🔄 | Options supplémentaires pour live-config. `nottyautologin` est stocké ici au lieu d'être intégré dans chaque entrée de démarrage. Voir `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | 🔄 | Nom du nœud associé au système. Voir `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nom de l'utilisateur dont le profil sera créé au premier démarrage. Si vous indiquez le nom d'utilisateur <strong>root</strong>, aucun profil utilisateur ne sera créé et la connexion s'effectuera avec le profil <strong>root</strong>. Voir `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nom complet de l'utilisateur principal. Voir `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Liste des groupes de l'utilisateur principal, séparés par des virgules. Voir `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Mot de passe de l'utilisateur principal sous forme chiffrée (hash). Utilisez `mkpasswd -m yescrypt` pour générer. Voir `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Mot de passe de l'utilisateur privilégié **root** sous forme chiffrée (hash). Utilisez `mkpasswd -m yescrypt` pour générer. Voir `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Si activé, désactive la connexion au compte root et désactive sudo/policykit pour l'utilisateur. Voir `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Définit la locale. Plusieurs valeurs peuvent être séparées par des virgules. Voir `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Définit le fuseau horaire (ex. : "Europe/Berlin", "Etc/UTC"). Voir `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Définit le modèle de clavier (ex. : "pc105"). Voir `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Définit les dispositions clavier (séparées par des virgules, ex. : "us,de"). Voir `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Définit les options clavier (ex. : "grp:alt_shift_toggle,grp_led:scroll"). Voir `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Définit les variantes clavier (séparées par des virgules, peut être vide ou correspondre aux dispositions). Voir `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Active la sortie de debug pour live-config. Voir `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Si activé, les dossiers utilisateurs seront liés depuis le chemin spécifié. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Si activé, les dossiers utilisateurs seront montés en bind depuis le chemin spécifié. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Chemin vers les dossiers de données utilisateurs sur la clé USB. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Sélectionne le mode de fonctionnement du système. Si vous prévoyez d'installer des logiciels uniquement par modules, utilisez "merged". Si vous souhaitez installer des logiciels via apt, utilisez "simple". La valeur par défaut est "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Cible systemd à atteindre au démarrage. Voir `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Active des services au démarrage (séparés par des virgules). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Désactive des services au démarrage (séparés par des virgules). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Si activé et si le dossier de données MiniOS sélectionné est accessible en écriture, les journaux de démarrage sont copiés dans `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**Pour plus de détails sur la plupart des paramètres, voir :**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Pour les cibles systemd : `man systemd.special`

## Important !

* Le serveur SSH est activé par défaut pour la compatibilité avec les initrds tiers ; pour le désactiver, il ne suffit pas de le retirer de `ENABLE_SERVICES`.

## Source, copie à l'exécution et priorité

Le dossier de données MiniOS sélectionné correspond normalement au répertoire `minios/` sur le support de démarrage. Ses chemins de configuration et leurs copies à l'exécution sont :

| Dossier de données sélectionné | Système en cours d'exécution |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Pour un support monté normalement, ces fichiers sources sont visibles sous `minios/config.conf` et `minios/config.conf.d/*.conf`, souvent sous `/run/initramfs/memory/data/`. Ils ne sont pas chargés directement par `live-config`. L'initramfs les synchronise avec les chemins d'exécution avant de lancer `minios-boot` ; voir [Modes de démarrage](/configuration/Boot-Modes.md) pour l'emplacement de cette étape dans la séquence de démarrage.

La synchronisation est effectuée au démarrage, et non par un moniteur de fichiers :

- La copie la plus récente de `config.conf` prévaut selon la date de modification. Une copie source plus récente est copiée dans la racine live. Une copie d'exécution plus récente n'est copiée en retour que si le dossier de données sélectionné est accessible en écriture.
- Chaque fichier `config.conf.d/*.conf` est synchronisé indépendamment par nom de base, selon les mêmes règles de date de modification et d'écriture. Les fichiers ne sont supprimés d'aucun côté.
- Si l'horloge est antérieure à la dernière date de synchronisation enregistrée, la comparaison des horodatages est ignorée et seuls les fichiers de destination manquants sont copiés.
- `toram=trim` copie `config.conf` mais omet `config.conf.d/` ; voir [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md). `toram` copie entièrement l'arborescence de données, mais la synchronisation cible alors la copie en RAM plutôt que le support détaché.

Après synchronisation, `live-config` lit d'abord `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` selon l'ordre des glob shell, de sorte qu'un fragment ultérieur peut remplacer une valeur précédente. Il ajoute la ligne de commande du noyau réelle à `LIVE_CONFIG_CMDLINE` ; pour les options répétées, la dernière occurrence dans la ligne de commande du noyau prévaut. `minios-boot` lit également `/etc/live/config.conf` pour ses réglages précoces pris en charge et donne la priorité à ses paramètres noyau reconnus.

Vous pouvez ajouter des variables shell spécifiques au projet dans ces fichiers et les lire depuis `/etc/live/config.conf` ou les fragments à l'exécution. Citez les valeurs comme des chaînes shell et ne mettez pas d'espaces autour de `=`.

Le journal MiniOS précoce est `/var/log/minios/minios-boot.log`, tandis que la sortie tardive `live-config` est `/var/log/live/config.log`. Avec `EXPORT_LOGS="true"`, les deux arborescences sont copiées dans `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` lorsque le dossier de données sélectionné est accessible en écriture.
