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

Une image MiniOS actuelle génère une `config.conf` avec cette structure générale :
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

::: warning `LIVE_CONFIG_CMDLINE`n’est pas la ligne de commande de l’initramfs
`LIVE_CONFIG_CMDLINE`fournit des options après que le root MiniOS a été assemblé. Des paramètres comme `from=`, `load=`, `toram`, et `perchdir=` doivent être de vrais paramètres de démarrage du kernel ; les placer uniquement dans `LIVE_CONFIG_CMDLINE` est trop tard pour affecter l’initramfs. Les options de stratégie de stockage `log-storage=`, `apt-cache=`, et `browser-cache=` sont une exception spécifique : `minios-boot` les lit depuis `LIVE_CONFIG_CMDLINE` avant le démarrage des services habituels.
:::

## Paramètres standards

| Paramètre | Reconfigurable | Signification |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Oui | Options live-config supplémentaires. La ligne de commande du noyau réelle est ajoutée ultérieurement et prévaut en cas d’options répétées. |
| `LIVE_HOSTNAME` | Oui | Nom d’hôte du système. |
| `LIVE_USERNAME` | Premier démarrage uniquement | Nom de l’utilisateur live créé lors de la configuration initiale. |
| `LIVE_USER_FULLNAME` | Premier démarrage uniquement | Nom complet de l’utilisateur live. |
| `LIVE_USER_DEFAULT_GROUPS` | Premier démarrage uniquement | Groupes supplémentaires attribués lors de la création de l’utilisateur live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Premier démarrage uniquement | Empreinte cryptographique du mot de passe de l’utilisateur live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Premier démarrage uniquement | Empreinte cryptographique du mot de passe root. |
| `LIVE_CONFIG_NOROOT` | Premier démarrage uniquement | Si activé, désactive la configuration du mot de passe MiniOS root, sudo et PolicyKit. |
| `LIVE_LOCALES` | Oui | Une ou plusieurs locales système. |
| `LIVE_TIMEZONE` | Oui | Fuseau horaire du système, par exemple `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Oui | Modèle de clavier XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Oui | Agencements de clavier séparés par des virgules. |
| `LIVE_KEYBOARD_OPTIONS` | Oui | Options de clavier XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Oui | Variantes séparées par des virgules correspondant aux agencements configurés. |
| `LIVE_CONFIG_DEBUG` | Oui | Active la sortie de débogage de live-config si la valeur est `true`. |
| `LIVE_LINK_USER_DIRS` | Oui | Lie les répertoires utilisateurs gérés à l’emplacement configuré sur le support MiniOS en écriture. Indisponible avec le mode bind, tout mode `toram` ou une session de persistance LUKS chiffrée active. |
| `LIVE_BIND_USER_DIRS` | Oui | Monte en mode bind les répertoires utilisateur gérés depuis l’emplacement configuré sur le support inscriptible MiniOS. Indisponible avec le mode lien, tout mode `toram` ou lors d’une session de persistance LUKS active. |
| `LIVE_USER_DIRS_PATH` | Oui | Emplacement utilisé par le mode utilisateur lien/bind. |
| `LIVE_MODULE_MODE` | Oui | Permet de choisir l’intégration du module `simple` ou `merged` live-config. |
| `LIVE_LOG_STORAGE` | Oui | `persistent` (par défaut) ou `volatile` pour les journaux système classiques. Les diagnostics de démarrage restent persistants ; voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Oui | `persistent` (par défaut) ou `volatile` pour les archives APT téléchargées ; l’état des paquets et les listes de dépôts restent persistants. |
| `LIVE_BROWSER_CACHE` | Oui | `persistent` (par défaut) ou `volatile` pour les chemins de cache natifs du navigateur. Les profils des navigateurs restent persistants. |
| `DEFAULT_TARGET` | Oui | Cible de démarrage : `graphical.target`, `multi-user.target`, ou `rescue.target`. |
| `ENABLE_SERVICES` | Oui | Services séparés par des virgules activés au démarrage via `minios-svc`. |
| `DISABLE_SERVICES` | Oui | Services séparés par des virgules désactivés au démarrage via `minios-svc`. |
| `EXPORT_LOGS` | Oui | Lorsque `true`, exporte MiniOS et les journaux de démarrage live-config vers le support inscriptible MiniOS. |

Le fichier généré n’est pas une liste exhaustive de tout ce qui est pris en charge par `minios-live-config`. D’autres variables pour la préconfiguration réseau filaire, la sécurité, les hooks, le preseeding, Xorg et d’autres composants peuvent être ajoutées manuellement. Voir [live-config](/reference/configuration/live-config) pour la référence complète.

Le composant `user-media` refuse à la fois l’activation et la copie de retour lorsqu’une session de persistance active est chiffrée avec LUKS. Il utilise l’état de chiffrement en cours d’exécution réel : le paramètre noyau `perchencrypt=luks` ne fait que demander le chiffrement lors de la création d’une nouvelle session et ne décrit pas une session existante.

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

## MiniOS paramètres early-userspace

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, et les trois `LIVE_*` politiques de stockage ci-dessus sont des paramètres de démarrage MiniOS plutôt que des variables de composant late live-config. MiniOS les applique avant que le système d'init normal ne prenne le relais ; `minios-boot` possède les trois politiques de stockage. Elles sont toutes **Reconfigurable : Oui**.

Les paramètres de démarrage correspondants `default-target=`, `enable-services=`, et `disable-services=` prennent la priorité pour le démarrage en cours. Le paramètre `text` force `multi-user.target`.

Les versions Toolbox et Ultra actuelles ajoutent `ssh` à `ENABLE_SERVICES`. Pour désactiver explicitement SSH, placez-le dans `DISABLE_SERVICES` ; le retirer simplement de `ENABLE_SERVICES` ne demande pas la désactivation.

Avec `EXPORT_LOGS="true"`, un support MiniOS réinscriptible reçoit les journaux de démarrage ci-dessous :

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Les journaux d'exécution correspondants sont `/var/log/minios/minios-boot.log` et `/var/log/live/config.log`.

## Politique de cache et de journalisation pour une session persistante

Pour réduire les écritures pendant une `perch` session, ajoutez les paramètres indépendamment :

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Ils acceptent également `persistent`, la valeur par défaut. `minios-boot` accepte les mêmes paramètres depuis `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), ou les paramètres du kernel. Les fragments ultérieurs remplacent les précédents, le blob de paramètres l’emporte sur les clés de fichier, et les paramètres réels du kernel priment en dernier. Les trois options sont indépendantes et ne demandent pas elles-mêmes la persistance. Un initrd compatible annonce `perch-storage-v1` à `/run/initramfs/etc/minios-initramfs-storage`; le Configurateur MiniOS signale lorsque l’initrd actuel ne l’annonce pas.

Les politiques s’appliquent lors d’un démarrage ultérieur uniquement si la persistance est effectivement activée sur un support réinscriptible durable. Avec `toram`, une persistance échouée, ou **Démarrer sans enregistrer**, la politique volatile demandée n’est pas considérée comme une preuve que quoi que ce soit sera sauvegardé. Le composant de cache navigateur s’exécute plus tard que `minios-boot`, après la création de l’utilisateur live. Voir [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour connaître les limites exactes de RAM, les chemins navigateur pris en charge, les conditions de repli et les journaux qui restent sur le support.

## Source, copie à l’exécution et priorité

Le répertoire de données MiniOS sélectionné contient normalement ces fichiers sources :

| Répertoire de données sélectionné | Système en cours d’exécution |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Sur un support monté normalement, ils sont visibles comme `minios/config.conf` et `minios/config.conf.d/*.conf`, souvent sous `/run/initramfs/memory/data/` tant que le système fonctionne.

La synchronisation a lieu au démarrage ; il ne s’agit pas d’un moniteur de fichiers :

- La copie la plus récente de `config.conf` l’emporte selon la date de modification. Une copie plus récente sur le support est copiée dans la racine active. Une copie plus récente à l’exécution n’est copiée en retour que si le répertoire de données MiniOS sélectionné est accessible en écriture.
- Chaque fichier `config.conf.d/*.conf` est synchronisé individuellement par nom de base selon les mêmes règles d’horodatage et de droits d’écriture. Aucun fichier n’est supprimé d’un côté ou de l’autre.
- Si l’horloge est antérieure à la dernière synchronisation enregistrée, la comparaison des horodatages est ignorée et seuls les fichiers manquants dans la destination sont ajoutés.
- `toram=trim` copie `config.conf` mais omet `config.conf.d/`. Une copie complète de `toram` recopie l’arborescence des données, mais la synchronisation cible alors la copie RAM plutôt que le support source détaché.
Après synchronisation, `live-config` lit `/etc/live/config.conf` d’abord, puis `/etc/live/config.conf.d/*.conf` selon l’ordre glob du shell. Un fragment ultérieur peut donc remplacer une valeur du fichier principal ou d’un fragment précédent.

La ligne de commande réelle du noyau est ajoutée à `LIVE_CONFIG_CMDLINE`. Si une option apparaît plusieurs fois, la dernière occurrence dans la ligne de commande du noyau prévaut. Pour les trois politiques de stockage, `minios-boot` lit le fichier principal synchronisé, puis ses fragments, ensuite le blob d’options, et enfin la ligne de commande réelle du noyau ; le dernier paramètre l’emporte.

Vous pouvez ajouter des variables shell propres au projet dans `config.conf` ou dans ses fragments, puis les lire depuis les copies d’exécution. Citez les valeurs comme chaînes shell et ne mettez pas d’espaces autour de `=`.

## Référence associée

- [Paramètres de démarrage](/reference/Boot-Parameters) — paramètres à placer sur la ligne de commande du noyau et surcharges live-config.
- [live-config](/reference/configuration/live-config) — référence complète des paramètres, variables, composants et états en espace utilisateur avancé.
- [Modes de démarrage](/using-minios/Boot-Modes) — comment la persistance et `toram` influent sur le stockage de la configuration.
