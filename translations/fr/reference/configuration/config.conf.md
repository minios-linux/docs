---
updated: 2026-08-31
---

# config.conf

`config.conf` est le principal fichier de préconfiguration de MiniOS. Sur un support MiniOS classique, il est stocké sous le nom `minios/config.conf`. Au démarrage, l’initramfs le synchronise avec `/etc/live/config.conf` dans le système assemblé.

Utilisez ce fichier pour préparer le démarrage de MiniOS et l’initialisation d’une nouvelle session persistante. Il s’agit principalement d’un mécanisme de préconfiguration destiné aux administrateurs, et non d’un substitut aux outils de configuration classiques de l’environnement de bureau en cours d’exécution.

## Reconfiguration

La colonne **Reconfigurable** ci-dessous utilise les significations suivantes :

- **Oui** — le paramètre peut être modifié et appliqué à nouveau lors d’un prochain démarrage.
- **Premier démarrage uniquement** — le paramètre est utilisé lors de la première création de l’état persistant correspondant et n’est normalement pas réappliqué lors des démarrages suivants.

Cette distinction fait partie du comportement que les utilisateurs doivent connaître. Les fichiers d’état internes `live-config` sont des détails d’implémentation et ne s’y substituent pas.

## Configuration générée

Une image MiniOS actuelle génère un fichier `config.conf` avec la structure générale suivante :
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
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
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
Les valeurs exactes dépendent de l’image et de la configuration de la construction.

::: warning `LIVE_CONFIG_CMDLINE` n’est pas la ligne de commande de l’initramfs
`LIVE_CONFIG_CMDLINE` fournit des options à **live-config** après l’assemblage du root MiniOS. Les paramètres tels que `from=`, `load=`, `toram` et `perchdir=` doivent être de vrais paramètres de démarrage du noyau ; les placer uniquement dans `LIVE_CONFIG_CMDLINE` est trop tard pour influencer l’initramfs.
:::

## Paramètres standards

| Paramètre | Reconfigurable | Signification |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Oui | Options supplémentaires pour live-config. La véritable ligne de commande du noyau est ajoutée ensuite et prévaut en cas d’options répétées. |
| `LIVE_HOSTNAME` | Oui | Nom d’hôte du système. |
| `LIVE_USERNAME` | Premier démarrage uniquement | Nom de l’utilisateur live créé lors de l’installation initiale. |
| `LIVE_USER_FULLNAME` | Premier démarrage uniquement | Nom complet de l’utilisateur live. |
| `LIVE_USER_DEFAULT_GROUPS` | Premier démarrage uniquement | Groupes supplémentaires attribués lors de la création de l’utilisateur live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Premier démarrage uniquement | Hachage crypté du mot de passe de l’utilisateur live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Premier démarrage uniquement | Hachage crypté du mot de passe root. |
| `LIVE_CONFIG_NOROOT` | Premier démarrage uniquement | Si activé, désactive la configuration du mot de passe root MiniOS, sudo et PolicyKit. |
| `LIVE_LOCALES` | Oui | Une ou plusieurs locales système. |
| `LIVE_TIMEZONE` | Oui | Fuseau horaire du système, par exemple `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Oui | Modèle de clavier XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Oui | Dispositions de clavier séparées par des virgules. |
| `LIVE_KEYBOARD_OPTIONS` | Oui | Options de clavier XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Oui | Variantes séparées par des virgules, associées aux dispositions configurées. |
| `LIVE_CONFIG_DEBUG` | Oui | Active la sortie de débogage de live-config si défini à `true`. |
| `LIVE_LINK_USER_DIRS` | Oui | Lie les répertoires utilisateurs gérés à l’emplacement configuré sur un support MiniOS inscriptible. |
| `LIVE_BIND_USER_DIRS` | Oui | Monte en bind les répertoires utilisateurs gérés depuis l’emplacement configuré sur un support MiniOS inscriptible. |
| `LIVE_USER_DIRS_PATH` | Oui | Emplacement utilisé par le mode lien/bind des répertoires utilisateurs. |
| `LIVE_MODULE_MODE` | Oui | Sélectionne l’intégration du module live-config `simple` ou `merged`. |
| `DEFAULT_TARGET` | Oui | Cible de démarrage : `graphical.target`, `multi-user.target` ou `rescue.target`. |
| `ENABLE_SERVICES` | Oui | Services séparés par des virgules activés au démarrage via `minios-svc`. |
| `DISABLE_SERVICES` | Oui | Services séparés par des virgules désactivés au démarrage via `minios-svc`. |
| `EXPORT_LOGS` | Oui | Si `true`, exporte MiniOS et les journaux de démarrage live-config vers un support MiniOS inscriptible. |

Le fichier généré n’est pas une liste exhaustive de tout ce qui est pris en charge par `minios-live-config`. Des variables supplémentaires pour la préconfiguration du réseau filaire, la sécurité, les hooks, le preseeding, Xorg et d’autres composants peuvent être ajoutées manuellement. Voir [live-config](/reference/configuration/live-config) pour la référence complète.

## Préconfiguration du réseau filaire

MiniOS peut préconfigurer une politique **IPv4 filaire** via le composant `network` de live-config. Ceci est destiné à la préconfiguration administrative d’un système avant son démarrage sur le matériel cible.
Par exemple :

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Ces paramètres sont **Premier démarrage uniquement** pour la politique réseau persistante. Après application réussie, le composant enregistre `/var/lib/live/config/network`.
Modifier les valeurs ne remplace pas une session persistante déjà configurée, sauf si cet état est réinitialisé volontairement.

`LIVE_NETWORK_METHOD=static` écrit une politique statique. `off` désactive l’IPv4 automatique pour l’interface sélectionnée. Une valeur non définie ou `dhcp` laisse la configuration réseau existante de l’image inchangée. `LIVE_NETWORK_BACKEND=auto` privilégie NetworkManager et bascule sur ifupdown si besoin.

Cette fonctionnalité ne configure pas le Wi-Fi. Après le démarrage, la gestion du réseau filaire et sans fil est assurée par NetworkManager. Voir [Réseau](/using-minios/Networking) pour l’utilisation réseau en cours d’exécution et [live-config](/reference/configuration/live-config) pour toutes les variables réseau.

## Paramètres early-userspace de MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES` et `EXPORT_LOGS` sont des paramètres MiniOS et non des variables live-config. Ils sont lus par `minios-boot` avant que le système d’init habituel ne prenne le relais et sont tous **Reconfigurables : Oui**.

Les paramètres de démarrage correspondants `default-target=`, `enable-services=` et `disable-services=` prennent le dessus pour le démarrage en cours. Le paramètre `text` force `multi-user.target`.

Les versions Toolbox et Ultra actuelles ajoutent `ssh` à `ENABLE_SERVICES`. Pour désactiver explicitement SSH, placez-le dans `DISABLE_SERVICES` ; le retirer simplement de `ENABLE_SERVICES` ne demande pas la désactivation.

Avec `EXPORT_LOGS="true"`, un support MiniOS inscriptible reçoit les journaux de démarrage ci-dessous :

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Les journaux d’exécution correspondants sont `/var/log/minios/minios-boot.log` et `/var/log/live/config.log`.

## Source, copie d’exécution et priorité

Le répertoire de données MiniOS sélectionné contient normalement les fichiers sources suivants :

| Répertoire de données sélectionné | Système en cours d’exécution |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Sur un support monté normalement, ils sont visibles sous `minios/config.conf` et `minios/config.conf.d/*.conf`, souvent sous `/run/initramfs/memory/data/` pendant l’exécution du système.

La synchronisation a lieu au démarrage ; il ne s’agit pas d’un moniteur de fichiers :

- La copie la plus récente de `config.conf` l’emporte selon la date de modification. Une copie plus récente sur le support est copiée dans le root live. Une copie d’exécution plus récente est recopiée uniquement si le répertoire de données MiniOS sélectionné est inscriptible.
- Chaque fichier `config.conf.d/*.conf` est synchronisé indépendamment par nom de base, selon les mêmes règles de date et de possibilité d’écriture. Aucun fichier n’est supprimé d’un côté ou de l’autre.
- Si l’horloge est antérieure à la dernière date de synchronisation enregistrée, la comparaison des dates est ignorée et seuls les fichiers de destination manquants sont recopiés.
- `toram=trim` copie `config.conf` mais omet `config.conf.d/`. La commande `toram` copie l’arborescence complète des données, mais la synchronisation cible alors la copie RAM plutôt que le support source détaché.
Après synchronisation, `live-config` lit d’abord `/etc/live/config.conf`, puis `/etc/live/config.conf.d/*.conf` selon l’ordre glob shell. Un fragment ultérieur peut donc remplacer une valeur du fichier principal ou d’un fragment précédent.

La véritable ligne de commande du noyau est ajoutée à `LIVE_CONFIG_CMDLINE`. Pour une option présente plusieurs fois, la dernière occurrence sur la ligne de commande du noyau prévaut. `minios-boot` donne également la priorité à ses paramètres du noyau reconnus par rapport aux réglages correspondants de `/etc/live/config.conf`.

Vous pouvez ajouter des variables shell spécifiques au projet dans `config.conf` ou ses fragments et les lire depuis les copies d’exécution. Citez les valeurs comme des chaînes shell et ne mettez pas d’espaces autour de `=`.

## Références associées

- [Paramètres de démarrage](/reference/Boot-Parameters) — paramètres à placer impérativement sur la véritable ligne de commande du noyau et surcharges live-config.
- [live-config](/reference/configuration/live-config) — référence complète des paramètres, variables, composants et états late-userspace.
- [Modes de démarrage](/using-minios/Boot-Modes) — comment la persistance et `toram` influent sur le stockage de la configuration.
