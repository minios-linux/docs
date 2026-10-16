---
updated: 2026-10-15
---

# config.conf

`config.conf` est le principal fichier de préconfiguration MiniOS. Sur un support MiniOS standard, il est stocké dans `minios/config.conf`. Au démarrage, l’initramfs le synchronise avec `/etc/live/config.conf` dans le système assemblé.

Utilisez ce fichier pour préparer le démarrage de MiniOS et l’initialisation d’une nouvelle session persistante. Il s’agit principalement d’un mécanisme de préconfiguration destiné aux administrateurs, et non d’un remplacement des outils de configuration habituels du bureau en cours d’exécution.

## Reconfiguration

La colonne **Reconfigurable** ci-dessous utilise les significations suivantes :

- **Oui** — le paramètre peut être modifié et appliqué à nouveau lors d’un démarrage ultérieur.
- **Au premier démarrage uniquement** — le paramètre est utilisé lors de la création initiale de l’état persistant correspondant et n’est normalement pas réappliqué aux démarrages suivants.

Cette distinction fait partie du comportement que les utilisateurs doivent connaître. Les fichiers d’état internes `live-config` sont des détails d’implémentation et ne la remplacent pas.

## Configuration générée

Une image MiniOS actuelle génère un fichier `config.conf` présentant la structure générale suivante :
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

::: warning `LIVE_CONFIG_CMDLINE` n’est pas la ligne de commande de l’initramfs
`LIVE_CONFIG_CMDLINE` fournit des options une fois la racine MiniOS assemblée. Des paramètres tels que `from=`, `load=`, `toram` et `perchdir=` doivent être de véritables paramètres de démarrage du noyau ; les placer uniquement dans `LIVE_CONFIG_CMDLINE` arrive trop tard pour agir sur l’initramfs. Les options de stratégie de stockage `log-storage=`, `apt-cache=` et `browser-cache=` font exception : `minios-boot` les lit dans `LIVE_CONFIG_CMDLINE` avant le démarrage des services habituels.
:::

## Paramètres standard

| Paramètre | Reconfigurable | Signification |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Oui | Options supplémentaires de configuration à chaud. La véritable ligne de commande du noyau est ajoutée ensuite et prévaut en cas d’options répétées. |
| `LIVE_HOSTNAME` | Oui | Nom d’hôte du système. |
| `LIVE_USERNAME` | Au premier démarrage uniquement | Nom de l’utilisateur live créé lors de la configuration initiale. |
| `LIVE_USER_FULLNAME` | Au premier démarrage uniquement | Nom complet de l’utilisateur live. |
| `LIVE_USER_DEFAULT_GROUPS` | Au premier démarrage uniquement | Groupes supplémentaires attribués lors de la création de l’utilisateur live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Au premier démarrage uniquement | Hash crypt du mot de passe de l’utilisateur live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Au premier démarrage uniquement | Hash crypt du mot de passe root. |
| `LIVE_CONFIG_NOROOT` | Au premier démarrage uniquement | Lorsque cette option est activée, désactive la configuration des privilèges root, sudo et PolicyKit de MiniOS. |
| `LIVE_LOCALES` | Oui | Un ou plusieurs paramètres régionaux du système. |
| `LIVE_TIMEZONE` | Oui | Fuseau horaire du système, par exemple `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Oui | Modèle de clavier XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Oui | Dispositions de clavier séparées par des virgules. |
| `LIVE_KEYBOARD_OPTIONS` | Oui | Options du clavier XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Oui | Variantes séparées par des virgules, correspondant aux dispositions configurées. |
| `LIVE_CONFIG_DEBUG` | Oui | Active la sortie de débogage de live-config lorsque la valeur est `true`. |
| `LIVE_LINK_USER_DIRS` | Oui | Lie les répertoires utilisateur gérés à l’emplacement configuré sur un support MiniOS inscriptible. Indisponible avec le mode bind, tout mode `toram` ou une session de persistance chiffrée par LUKS active. |
| `LIVE_BIND_USER_DIRS` | Oui | Monte par bind les répertoires utilisateur gérés depuis l’emplacement configuré sur un support MiniOS inscriptible. Indisponible avec le mode link, tout mode `toram` ou une session de persistance chiffrée par LUKS active. |
| `LIVE_USER_DIRS_PATH` | Oui | Emplacement utilisé par le mode link/bind des répertoires utilisateur. |
| `LIVE_MODULE_MODE` | Oui | Sélectionne l’intégration du module live-config `simple` ou `merged`. |
| `LIVE_LOG_STORAGE` | Oui | `persistent` (par défaut) ou `volatile` pour les journaux système ordinaires. Les diagnostics de démarrage restent persistants ; voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Oui | `persistent` (par défaut) ou `volatile` pour les archives APT téléchargées ; l’état des paquets et les listes de dépôts restent persistants. |
| `LIVE_BROWSER_CACHE` | Oui | `persistent` (par défaut) ou `volatile` pour les chemins de cache standard des navigateurs natifs. Les profils de navigateur restent persistants. |
| `DEFAULT_TARGET` | Oui | Cible de démarrage : `graphical.target`, `multi-user.target` ou `rescue.target`. |
| `ENABLE_SERVICES` | Oui | Services séparés par des virgules, activés au démarrage via `minios-svc`. |
| `DISABLE_SERVICES` | Oui | Services séparés par des virgules, désactivés au démarrage via `minios-svc`. |
| `EXPORT_LOGS` | Oui | Lorsque `true`, exporte MiniOS et les journaux de démarrage de live-config vers un support MiniOS inscriptible. |

Le fichier généré ne répertorie pas de façon exhaustive toutes les fonctionnalités prises en charge par `minios-live-config`. D’autres variables pour la préconfiguration du réseau filaire, la posture de sécurité, les hooks, le préchargement de configuration, Xorg et d’autres composants peuvent être ajoutées manuellement. Consultez [live-config](/reference/configuration/live-config) pour consulter la documentation complète.

Le composant `user-media` refuse aussi bien l’activation que la recopie des données tant que la session de persistance active est chiffrée par LUKS. Il s’appuie sur l’état de chiffrement réel à l’exécution : le paramètre de noyau `perchencrypt=luks` ne demande le chiffrement que lors de la création d’une nouvelle session et ne décrit pas une session existante.

## Préconfiguration du réseau filaire

MiniOS peut préconfigurer une politique **IPv4 filaire** via le composant `network`. Cette fonctionnalité est destinée à préconfigurer le système à des fins d’administration avant son démarrage sur le matériel cible.
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

Ces paramètres sont **appliqués uniquement au premier démarrage** pour la politique réseau persistante. Une fois appliqué avec succès, le composant enregistre `/var/lib/live/config/network`.
La modification des valeurs ne remplace pas une session persistante déjà configurée, sauf si cet état est réinitialisé explicitement.

`LIVE_NETWORK_METHOD=static` écrit une politique statique. `off` désactive IPv4 automatique pour l’interface sélectionnée. Si aucune valeur n’est définie ou si la valeur `dhcp` est utilisée, la configuration réseau existante de l’image reste inchangée. `LIVE_NETWORK_BACKEND=auto` privilégie NetworkManager et utilise ifupdown en solution de repli.

Cette fonctionnalité ne configure pas le Wi-Fi. Après le démarrage, NetworkManager gère les connexions réseau filaires et sans fil habituelles. Consultez [Réseau](/using-minios/Networking) pour l’utilisation du réseau à l’exécution et [live-config](/reference/configuration/live-config) pour connaître toutes les variables réseau.

## MiniOS : paramètres de l’espace utilisateur précoce

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, ainsi que les trois `LIVE_*` politiques de stockage ci-dessus sont des paramètres de démarrage MiniOS plutôt que des variables de composants de configuration en direct. MiniOS les applique avant que le système d’initialisation normal ne prenne le relais ; `minios-boot` gère les trois politiques de stockage. Elles sont toutes **Reconfigurables : oui**.

Les paramètres de démarrage correspondants `default-target=`, `enable-services=` et `disable-services=` s’appliquent en priorité au démarrage en cours. Le paramètre `text` force `multi-user.target`.

Les versions actuelles de Toolbox et d’Ultra ajoutent `ssh` à `ENABLE_SERVICES`. Pour désactiver explicitement SSH, ajoutez-le dans `DISABLE_SERVICES` ; le retirer simplement de `ENABLE_SERVICES` ne demande pas sa désactivation.

Avec `EXPORT_LOGS="true"`, les supports MiniOS inscriptibles reçoivent les journaux de démarrage ci-dessous :

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Les journaux d’exécution correspondants se trouvent dans `/var/log/minios/minios-boot.log` et `/var/log/live/config.log`.

<a id="cache-and-log-policy-for-a-persistent-session"></a>

## Politique de cache et de journalisation pour une session persistante

Pour réduire les écritures pendant une session `perch`, ajoutez les paramètres séparément :

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Ils acceptent également `persistent`, la valeur par défaut. `minios-boot` accepte les mêmes paramètres depuis `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), ou les paramètres du noyau. Les fragments ultérieurs remplacent les précédents, le bloc de paramètres a priorité sur les clés des fichiers et les paramètres effectifs du noyau ont la priorité finale. Les trois options sont indépendantes et ne demandent pas à elles seules la persistance. Un initrd compatible signale `perch-storage-v1` à `/run/initramfs/etc/minios-initramfs-storage` ; le Configurateur MiniOS affiche un avertissement si l’initrd actuel ne le signale pas.

Les politiques nécessitent l’activation réussie de la persistance, soit sur un stockage inscriptible durable, soit dans une session RAM inscriptible dont les informations `ram-origin` sont protégées. `toram` à lui seul ne détermine pas la durabilité d’une session : `perchtoram=off` peut conserver une session sur le support, tandis qu’une session copiée doit toujours être enregistrée. Une persistance ayant échoué et **Démarrer sans enregistrer** ne sont pas admissibles. Les diagnostics de démarrage sont conservés séparément des journaux volatils habituels, mais restent en mémoire dans une session copiée avec RAM jusqu’à leur enregistrement. Le composant de cache du navigateur s’exécute après la création de l’utilisateur actif. Consultez [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour connaître les limites de RAM, les chemins pris en charge et les conditions d’admission.

## Source, copie d’exécution et ordre de priorité

Le répertoire de données MiniOS sélectionné contient généralement les fichiers source suivants :

| Répertoire de données sélectionné | Système en cours d’exécution |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Sur un support monté normalement, ils apparaissent sous les noms `minios/config.conf` et `minios/config.conf.d/*.conf`, souvent dans `/run/initramfs/memory/data/` pendant l’exécution du système.

La synchronisation a lieu au démarrage ; il ne s’agit pas d’un système de surveillance des fichiers :

- La copie la plus récente de `config.conf` est prioritaire selon sa date de modification. Une copie plus récente sur le support est copiée dans la racine active. Une copie d’exécution plus récente est recopiée sur le support uniquement si le répertoire de données MiniOS sélectionné est inscriptible.
- Chaque fichier `config.conf.d/*.conf` est synchronisé séparément par nom de fichier, selon les mêmes règles d’horodatage et d’écriture. Les fichiers ne sont supprimés d’aucun des deux côtés.
- Si l’horloge indique une heure antérieure à celle de la dernière synchronisation enregistrée, la comparaison des horodatages est ignorée et seuls les fichiers manquants dans la destination sont copiés.
- `toram=trim` copie `config.conf` mais omet `config.conf.d/`. Une copie complète `toram` copie l’arborescence de données, mais la synchronisation cible ensuite la copie RAM plutôt que le support source détaché.
Après la synchronisation, `live-config` lit d’abord `/etc/live/config.conf` puis `/etc/live/config.conf.d/*.conf` dans l’ordre d’expansion des jokers du shell. Un fragment ultérieur peut donc remplacer une valeur du fichier principal ou d’un fragment antérieur.

La ligne de commande réelle du noyau est ajoutée à `LIVE_CONFIG_CMDLINE`. Si une option apparaît plusieurs fois, c’est sa dernière occurrence sur la ligne de commande du noyau qui est prioritaire. Pour les trois politiques de stockage, `minios-boot` lit le fichier principal synchronisé, puis ses fragments, ensuite le bloc d’options et enfin la ligne de commande réelle du noyau ; le dernier paramètre est prioritaire.

Vous pouvez ajouter des variables shell propres à votre projet dans `config.conf` ou dans ses fragments et les lire depuis les copies d’exécution. Entourez les valeurs de guillemets comme des chaînes shell et ne mettez pas d’espaces autour de `=`.

## Référence associée

- [Paramètres de démarrage](/reference/Boot-Parameters) — paramètres à placer sur la véritable ligne de commande du noyau et remplacement de live-config.
- [live-config](/reference/configuration/live-config) — référence complète des paramètres, variables, composants et états de l’espace utilisateur en phase tardive.
- [Modes de démarrage](/using-minios/Boot-Modes) — comment la persistance et `toram` influent sur le stockage de la configuration.
