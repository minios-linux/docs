---
updated: 2026-09-26
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

Une image MiniOS actuelle génère une `config.conf` avec la structure générale suivante :
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
Les valeurs exactes dépendent de l’image et de la configuration de build.

::: warning `LIVE_CONFIG_CMDLINE` n’est pas la ligne de commande initramfs
`LIVE_CONFIG_CMDLINE` fournit des options après l’assemblage du root MiniOS. Des paramètres comme `from=`, `load=`, `toram`, et `perchdir=` doivent être de vrais paramètres de démarrage du noyau ; les placer uniquement dans `LIVE_CONFIG_CMDLINE` est trop tard pour influencer l’initramfs. Les options de stratégie de stockage `log-storage=`, `apt-cache=`, et `browser-cache=` font exception : `minios-boot` les lit depuis `LIVE_CONFIG_CMDLINE` avant le démarrage des services standards.
:::

## Paramètres standards

| Paramètre | Reconfigurable | Signification |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Oui | Options live-config supplémentaires. La ligne de commande réelle du noyau est ajoutée ensuite et l’emporte en cas d’options répétées. |
| `LIVE_HOSTNAME` | Oui | Nom d’hôte du système. |
| `LIVE_USERNAME` | Premier démarrage uniquement | Nom de l’utilisateur live créé lors de la configuration initiale. |
| `LIVE_USER_FULLNAME` | Premier démarrage uniquement | Nom complet de l’utilisateur live. |
| `LIVE_USER_DEFAULT_GROUPS` | Premier démarrage uniquement | Groupes supplémentaires attribués lors de la création de l’utilisateur live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Premier démarrage uniquement | Empreinte cryptée pour le mot de passe de l’utilisateur live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Premier démarrage uniquement | Empreinte cryptée pour le mot de passe root. |
| `LIVE_CONFIG_NOROOT` | Premier démarrage uniquement | Si activé, supprime la configuration du mot de passe root MiniOS, sudo et PolicyKit. |
| `LIVE_LOCALES` | Oui | Une ou plusieurs locales système. |
| `LIVE_TIMEZONE` | Oui | Fuseau horaire du système, par exemple `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Oui | Modèle de clavier XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Oui | Agencements clavier séparés par des virgules. |
| `LIVE_KEYBOARD_OPTIONS` | Oui | Options clavier XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Oui | Variantes séparées par des virgules, associées aux agencements configurés. |
| `LIVE_CONFIG_DEBUG` | Oui | Active la sortie de debug de live-config si défini sur `true`. |
| `LIVE_LINK_USER_DIRS` | Oui | Lie les répertoires utilisateurs gérés à l’emplacement configuré sur un support MiniOS inscriptible. Indisponible en mode bind, tout mode `toram` ou avec une session de persistance LUKS active. |
| `LIVE_BIND_USER_DIRS` | Oui | Monte en bind les répertoires utilisateurs gérés depuis l’emplacement configuré sur un support MiniOS inscriptible. Indisponible en mode link, tout mode `toram` ou avec une session de persistance LUKS active. |
| `LIVE_USER_DIRS_PATH` | Oui | Emplacement utilisé par le mode utilisateur link/bind. |
| `LIVE_MODULE_MODE` | Oui | Sélectionne `simple` ou `merged` pour l’intégration du module live-config. |
| `LIVE_LOG_STORAGE` | Oui | `persistent` (par défaut) ou `volatile` pour les journaux système classiques. Les diagnostics de démarrage restent persistants ; voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Oui | `persistent` (par défaut) ou `volatile` pour les archives APT téléchargées ; l’état des paquets et les listes de dépôts restent persistants. |
| `LIVE_BROWSER_CACHE` | Oui | `persistent` (par défaut) ou `volatile` pour les chemins de cache navigateur natifs standards. Les profils navigateurs restent persistants. |
| `DEFAULT_TARGET` | Oui | Cible de démarrage : `graphical.target`, `multi-user.target`, ou `rescue.target`. |
| `ENABLE_SERVICES` | Oui | Services séparés par des virgules activés au démarrage via `minios-svc`. |
| `DISABLE_SERVICES` | Oui | Services séparés par des virgules désactivés au démarrage via `minios-svc`. |
| `EXPORT_LOGS` | Oui | Lorsque `true`, exporte les journaux de démarrage MiniOS et live-config vers un support MiniOS inscriptible. |

Le fichier généré n’est pas une liste exhaustive de tout ce qui est pris en charge par `minios-live-config`. D’autres variables pour la préconfiguration réseau filaire, la sécurité, les hooks, le preseeding, Xorg et d’autres composants peuvent être ajoutées manuellement. Voir [live-config](/reference/configuration/live-config) pour la référence complète.

Le composant `user-media` refuse l’activation et la copie-retour tant que la session de persistance active est chiffrée LUKS. Il utilise l’état de chiffrement réel à l’exécution : le paramètre `perchencrypt=luks` du noyau ne fait que demander le chiffrement lors de la création d’une nouvelle session et ne décrit pas une session existante.

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

## Paramètres early-userspace MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, et les trois `LIVE_*` stratégies de stockage ci-dessus sont des paramètres de démarrage MiniOS et non des variables tardives de live-config. MiniOS les applique avant que le système d’init prenne la main ; `minios-boot` gère les trois stratégies de stockage. Elles sont toutes **Reconfigurables : Oui**.

Les paramètres de démarrage correspondants `default-target=`, `enable-services=`, et `disable-services=` sont prioritaires pour le démarrage en cours. Le paramètre `text` force `multi-user.target`.

Les builds Toolbox et Ultra actuels ajoutent `ssh` à `ENABLE_SERVICES`. Pour désactiver explicitement SSH, ajoutez-le dans `DISABLE_SERVICES` ; le retirer simplement de `ENABLE_SERVICES` ne suffit pas à demander la désactivation.

Avec `EXPORT_LOGS="true"`, les supports MiniOS inscriptibles reçoivent les journaux de démarrage ci-dessous :

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Les journaux d’exécution correspondants sont `/var/log/minios/minios-boot.log` et `/var/log/live/config.log`.

## Politique de cache et de logs pour une session persistante

Pour limiter les écritures lors d’une session `perch`, ajoutez les paramètres séparément :

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Ils acceptent aussi `persistent`, la valeur par défaut. `minios-boot` accepte les mêmes paramètres depuis `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), ou via les paramètres du noyau. Les fragments ultérieurs remplacent les précédents, le blob de paramètres l’emporte sur les clés de fichiers, et les paramètres du noyau ont la priorité finale. Les trois options sont indépendantes et ne demandent pas à elles seules la persistance. Un initrd compatible annonce `perch-storage-v1` sur `/run/initramfs/etc/minios-initramfs-storage` ; le Configurateur MiniOS signale si l’initrd actuel ne l’annonce pas.

Les politiques ne s’appliquent à un prochain démarrage que si la persistance est effectivement activée sur un support inscriptible durable. Avec `toram`, persistance échouée ou **Démarrer sans enregistrer**, la politique volatile demandée n’est pas considérée comme une preuve que quoi que ce soit sera sauvegardé. Le composant browser-cache s’exécute après `minios-boot`, une fois l’utilisateur live créé. Voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour les limites exactes RAM, les chemins navigateurs pris en charge, les conditions de repli et les journaux restant sur le support.

## Source, copie d’exécution et priorité

Le répertoire de données MiniOS sélectionné contient normalement ces fichiers sources :

| Répertoire de données sélectionné | Système en cours d’exécution |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Sur un support monté normalement, ils apparaissent comme `minios/config.conf` et `minios/config.conf.d/*.conf`, souvent sous `/run/initramfs/memory/data/` pendant le fonctionnement du système.

La synchronisation s’effectue au démarrage ; il ne s’agit pas d’une surveillance de fichiers :

- La copie la plus récente de `config.conf` l’emporte selon la date de modification. Une copie plus récente sur le support est copiée dans la racine live. Une copie d’exécution plus récente est copiée en retour uniquement si le répertoire de données MiniOS sélectionné est inscriptible.
- Chaque fichier `config.conf.d/*.conf` est synchronisé indépendamment par nom de base, selon les mêmes règles d’horodatage et de droits en écriture. Aucun fichier n’est supprimé d’un côté ou de l’autre.
- Si l’horloge système est antérieure à la dernière synchronisation enregistrée, la comparaison des dates est ignorée et seuls les fichiers manquants sont copiés vers la destination.
- `toram=trim` copie `config.conf` mais omet `config.conf.d/`. Un `toram` copie complet de l’arborescence de données, mais la synchronisation cible alors la copie RAM plutôt que le support source détaché.
Après synchronisation, `live-config` lit d’abord `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` selon l’ordre glob shell. Un fragment ultérieur peut donc remplacer une valeur du fichier principal ou d’un fragment précédent.

La ligne de commande réelle du noyau est ajoutée à `LIVE_CONFIG_CMDLINE`. Pour une option présente plusieurs fois, la dernière occurrence sur la ligne de commande du noyau l’emporte. Pour les trois stratégies de stockage, `minios-boot` lit le fichier principal synchronisé, puis ses fragments, ensuite le blob d’options, et enfin la ligne de commande réelle du noyau ; le dernier paramètre l’emporte.

Vous pouvez ajouter des variables shell spécifiques au projet dans `config.conf` ou ses fragments et les lire depuis les copies d’exécution. Citez les valeurs comme chaînes shell et ne mettez pas d’espaces autour de `=`.
