---
updated: 2026-10-15
---

# Dépannage

Commencez par observer et effectuer des tests réversibles. Ne repartitionnez pas, ne formatez pas, ne réparez pas de système de fichiers, ne supprimez pas de session et ne remplacez pas les fichiers de démarrage dans le seul but de voir si cela résout le problème. Sauvegardez d’abord les données importantes.

## Vérifications préliminaires

1. [Vérifier l’image téléchargée](/installing-minios/Verifying-Downloads).
2. Démarrez **Démarrer sans enregistrer**. Si le problème disparaît, recherchez plutôt la cause dans la session persistante ou sa configuration que dans l’image de base.
3. Supprimez les paramètres de démarrage personnalisés et les filtres de modules, sauf s’ils sont nécessaires pour reproduire le problème.
4. Essayez un autre port USB et, si possible, un autre périphérique ou ordinateur dont le bon fonctionnement est confirmé.
5. Notez la première erreur et l’entrée exacte du menu de démarrage, plutôt que de relever uniquement le dernier message affiché à l’écran.
6. Vérifiez la [compatibilité matérielle](/getting-started/Hardware-Compatibility) lorsque la même image vérifiée échoue sur une machine, mais fonctionne sur une autre.

## Le périphérique n’affiche pas le menu de démarrage MiniOS

Commencez par déterminer comment le périphérique MiniOS a été créé.

- Pour une image écrite en mode brut (`dd`, Etcher, mode DD de Rufus ou écriture d’image avec Utilitaire de disque), ne réparez pas les fichiers de démarrage un par un. Si la copie est endommagée, réécrivez l’intégralité du périphérique à partir d’une image vérifiée.
- Pour une installation MiniOS basée sur des fichiers, recréez la structure de démarrage à l’aide de la même méthode d’installation documentée, au lieu de copier des fichiers GRUB, Syslinux ou EFI provenant d’une autre version.
- Ventoy possède son propre chargeur de démarrage et sa propre structure. N’installez pas le chargeur de démarrage MiniOS sur un périphérique Ventoy ; utilisez plutôt la procédure [Ventoy](/installing-minios/installation-tools/Ventoy).
- Après la conversion native, le système cible utilise un chargeur de démarrage Debian standard et une structure de système de fichiers conventionnelle. Il peut conserver l’apparence du bureau MiniOS, mais l’infrastructure live MiniOS et les outils spécifiques au mode live ne sont plus présents. Sauvegardez les données récupérables avant d’utiliser la procédure de réparation ou de réinstallation du chargeur de démarrage Debian adaptée au mode BIOS/UEFI et au partitionnement du système.

Si un périphérique fraîchement recréé n’apparaît toujours pas dans le menu de démarrage du firmware, vérifiez le mode du firmware, la prise en charge de Secure Boot par l’architecture choisie, le port ou le périphérique USB, ainsi que la [compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Le menu de démarrage MiniOS s’affiche, mais le démarrage échoue

Commencez par supprimer les paramètres facultatifs. Utilisez `debug` et `timing` si vous avez besoin de plus d’informations sur les premières étapes du démarrage. `rd.break` sert à examiner l’initramfs de manière avancée, pas à le réparer.

Si MiniOS ne trouve pas sa source, consultez [Détection du système](/reference/boot-process/System-Discovery). Dans un shell initramfs, voici quelques informations utiles accessibles en lecture seule :

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporaire peut aider à identifier le périphérique qui contient réellement les données MiniOS. Ensuite, utilisez la syntaxe `from=` documentée au lieu de deviner les noms des périphériques.

Pour le démarrage PXE ou à partir d’une image ISO via HTTP, consultez [Démarrage réseau](/reference/boot-process/Network-Boot). La mise en réseau lors des premières étapes du démarrage est distincte de NetworkManager dans la session en cours.

### Échecs liés aux modules ou à l’union racine

Consultez [Chargement des modules](/reference/boot-process/Module-Loading) pour connaître les règles de sélection et d’ordre des modules. En particulier :

- `load=` et `noload=` peuvent exclure des modules de base ou du noyau indispensables ; `noload=`l’emporte lorsque les deux correspondent ;
- les candidats portant le même nom de base occupent le même emplacement de remplacement ;
- un `.sb`nom de fichier ne garantit pas que le fichier soit une image SquashFS valide ;
- le noyau en cours d’exécution doit correspondre au module du noyau et aux fichiers de démarrage MiniOS coordonnés.

Après un démarrage réussi, examinez l’état réel sans le modifier :

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problèmes d’affichage

En cas d’écran noir, de résolution inutilisable ou de boucle du gestionnaire d’affichage :

1. Essayez le paramètre de démarrage `text`. Si la console fonctionne, le problème vient de l’affichage ou du bureau plutôt que d’un échec antérieur du démarrage.
2. Supprimez les paramètres `xorg-driver` ou `xorg-resolution` spécifiés manuellement.
3. Testez **Démarrer sans enregistrer** pour exclure une configuration d’affichage persistante.
4. Notez le GPU et le pilote avec `lspci -nnk`.
5. Examinez `journalctl -b -p warning` et `dmesg --level=err,warn`.

Pour les machines virtuelles, consultez [Virtualisation](/maintenance-and-recovery/Virtualization).

Sur les images XFCE de Debian 13 / Devuan Excalibur, **Paramètres d’affichage** comporte un réglage « **Échelle de l’interface** » avec des pourcentages automatiques et manuels. Le mode automatique suit l’écran principal ; un pourcentage explicite enregistré prend le dessus. Utilisez l’aperçu chronométré et la confirmation : la résolution de sortie et l’échelle de l’interface sont deux réglages différents. Les effets de fenêtre et le moteur de rendu se configurent séparément dans **Ajustements du gestionnaire de fenêtres → Compositeur**. `xfwm4-gl`revient à XRender lorsque OpenGL ne peut pas être utilisé ; le flou et l’effet lampe magique nécessitent OpenGL, tandis que les animations de fondu et de mise à l’échelle, ainsi que Peek, fonctionnent aussi avec XRender.

## Problèmes de réseau

Les connexions filaires et Wi-Fi standard sont gérées par NetworkManager ; consultez [Réseau](/using-minios/Networking).

Commencez par vérifier si l’interface existe :

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si aucune interface n’existe, notez `lspci -nnk` ou `lsusb` et recherchez des erreurs de micrologiciel ou de pilote dans `dmesg`.
- Si l’interface existe, mais n’a pas d’adresse, faites la différence entre un problème de connexion ou de DHCP et une absence de prise en charge matérielle.
- Si une adresse est attribuée, testez la passerelle, puis une adresse IP, puis un nom DNS pour distinguer les problèmes de liaison, de routage et de DNS.
- Le paramètre de démarrage `ip=` concerne le démarrage réseau initial et ne configure pas de connexion NetworkManager persistante. Consultez [Démarrage réseau](/reference/boot-process/Network-Boot).

## Problèmes de persistance

Démarrez **Démarrer sans enregistrer** avant de modifier un espace de persistance suspect. Ne réparez pas et ne supprimez pas l’unique copie d’une session tant qu’elle est active.

Examinez ce que MiniOS détecte actuellement :

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Vérifiez le mode de démarrage sélectionné, l’espace inscriptible disponible, la compatibilité du système de fichiers et celle de la session. Les règles détaillées de sélection figurent dans [Sessions et persistance](/using-minios/Sessions-and-Persistence) et dans [Fonctionnement interne de la persistance](/reference/boot-process/Persistence-Internals).

Si une `native`, `dynfilefs`, `dynblk`, `vmdk` ou `raw`session importante qui n’est pas en cours d’exécution reste lisible, y compris sous forme chiffrée si elle peut être déverrouillée, exportez-la **avant** de faire des essais sur le stockage :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager ne peut pas lire ou exporter la session, cessez d’écrire sur la source et conservez une copie hors ligne du stockage concerné avant toute autre intervention. Pour une session DynBlk détachée, `dynblk inspect /path/to/volume000.db --metadata-only` et `dynblk check /path/to/volume000.db` fournissent des diagnostics en lecture seule du format ; ne les exécutez pas sur un volume encore attaché. MiniOS ne définit pas de procédure manuelle universelle pour reconstruire les segments DynFileFS, reconstituer les éléments de stockage DynBlk, réparer un système de fichiers interne ou reconstituer les métadonnées de session. Une telle récupération dépend du système de fichiers ou du conteneur ; elle ne doit être tentée que sur une copie et si la valeur des données le justifie.

Consultez [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) pour connaître les procédures de sauvegarde et d’importation de session prises en charge.

### Ventoy Persistence Plugin

Si Session Manager indique que le plugin de persistance Ventoy n’est pas disponible, il s’agit du fonctionnement attendu du modèle à image unique, et non de métadonnées de session manquantes. Sélectionnez un autre backend dans Ventoy ou démarrez sans image de plugin sélectionnée pour utiliser des sessions MiniOS numérotées. Si le backend est indisponible, n’est pas au format ext4, utilise un format d’union différent de celui enregistré ou ne peut pas être activé en écriture, MiniOS émet un avertissement et continue en RAM. Examinez `/run/initramfs/minios-persistence/boot-state` et les avertissements au démarrage ; ne créez pas `session.conf` manuellement dans l’image du plugin. Consultez [Ventoy](/installing-minios/installation-tools/Ventoy).

## Problèmes de stockage et d’espace disponible

Examinez les périphériques et les points de montage sans les modifier :

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un système de fichiers saturé peut entraîner l’échec d’opérations sur les paquets, des sauvegardes de session incomplètes et d’autres erreurs secondaires. Libérez de l’espace en déplaçant ou en supprimant uniquement des données identifiées, après avoir vérifié le système de fichiers concerné. Pour supprimer des sessions, utilisez le Gestionnaire de sessions MiniOS plutôt que de supprimer manuellement les répertoires de sessions numérotés.

Si `LIVE_APT_CACHE=volatile`, vérifiez également `findmnt -T /var/cache/apt/archives` et `df -h /var/cache/apt/archives` : la zone d’archive se trouve sur un système de fichiers RAM de capacité limitée ; un téléchargement volumineux peut la saturer même si le périphérique USB dispose d’espace libre. Avec `LIVE_LOG_STORAGE=volatile`, le `/var/log` ordinaire est soumis à une limite distincte de 32 Mio RAM. Le fait de saturer l’une ou l’autre de ces zones n’amène pas MiniOS à écrire silencieusement ces fichiers sur le périphérique USB. Consultez [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

La réparation d’un système de fichiers n’est pas une opération générique de MiniOS. Si le système de fichiers lui-même est endommagé, démontez-le, sauvegardez d’abord les données importantes ou créez une image, puis suivez une procédure de réparation adaptée à ce système de fichiers et au périphérique de stockage.

## Modifications des paquets et mises à jour du système

Si les problèmes sont apparus après des modifications de paquets APT, n’oubliez pas qu’une session persistante en cours d’exécution peut remplacer les fichiers des modules MiniOS en lecture seule. Testez **Démarrer sans enregistrer** pour comparer avec l’ensemble de modules d’origine. Consultez [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour comprendre la différence entre la maintenance APT et le changement de version de MiniOS.

<a id="collecting-logs"></a>

## Collecte des journaux

Voici les informations utiles :

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

En cas d’échecs répétés au démarrage sur un support MiniOS inscriptible, `EXPORT_LOGS=true` dans `config.conf` exporte les journaux de démarrage sous `minios/log/`. Consultez [config.conf](/reference/configuration/config.conf).

Dans une session `perch`persistante et saine, les deux journaux de démarrage obligatoires sont déjà conservés, quel que soit `LIVE_LOG_STORAGE` :

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Les `.1`, `.2` et `.3` correspondent aux démarrages précédents. Le point de montage `/var/log` ordinaire peut être `tmpfs` tandis que `/var/log/minios` et `/var/log/live` restent sur le stockage persistant. Pour SquashFS, ces journaux se trouvent également sous `minios/changes/<session-id>/boot-logs/`, en dehors de `changes.sb` ; ils sont conservés même si l’instantané d’arrêt échoue. Une activation échouée ou non persistante de `perch` ne garantit aucune destination persistante pour les journaux. Avec `LIVE_LOG_STORAGE=volatile`, `journalctl -b` et les autres journaux ordinaires ne sont disponibles que pour le démarrage **en cours**. Activez les traces détaillées de `minios-update-*` à l’aide de `LIVE_CONFIG_DEBUG=true` uniquement si nécessaire ; les erreurs normales sont signalées même sans cette option.

Supprimez les identifiants, les clés privées, les mots de passe Wi-Fi et toute autre information privée avant de partager les journaux. Pour un bogue reproductible, joignez les extraits pertinents et ouvrez un ticket dans le [gestionnaire de tickets MiniOS](https://github.com/minios-linux/minios-live/issues).

### Les sessions VMDK ne sont pas proposées

Mettez à jour ensemble le pilote/CLI DynBlk et les outils de session, puis reconstruisez l’
initrd de démarrage. L’initrd en cours d’exécution doit annoncer `vmdk-session-v1` ; Installer vérifie également
 chaque initrd source qu’il va copier. L’ancien marqueur DynBlk vide
indique uniquement la prise en charge native des blocs et ne garantit pas la prise en charge du démarrage des sessions VMDK.
Ne modifiez pas manuellement le mode d’une session existante : utilisez une copie explicite ou
une conversion vers l’autre format.

### Libérer de l’espace dans DynFileFS, DynBlk ou les sessions VMDK

Utilisez le menu contextuel du Gestionnaire de sessions **Libérer de l’espace...**, ou
`minios-session reclaim ID --json`. Pour les sessions en texte brut, cette opération réduit le système de fichiers
ext4 interne, puis demande au backend propriétaire de récupérer de l’espace de stockage sans
déplacer les données actives. DynFileFS nécessite la version 4.6.0 ou ultérieure pour cette opération.
Sur des systèmes de fichiers comme exFAT, les espaces libres internes peuvent rester alloués au fichier hôte
tout en restant réutilisables par le conteneur ; `--compact` est une option manuelle distincte qui peut
déplacer les données actives et entraîner davantage d’écritures sur le périphérique flash. Aucune opération n’active automatiquement
la compaction ou le discard LUKS. Une session chiffrée ne peut récupérer que l’espace déjà connu du backend sous-jacent grâce à cette commande.
