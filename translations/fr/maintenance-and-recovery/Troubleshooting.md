---
updated: 2026-10-06
---

# Dépannage

Commencez par observer et effectuer des tests réversibles. N’effectuez pas de repartitionnement, de formatage, de réparation de système de fichiers, de suppression de session ou de remplacement de fichiers de démarrage simplement pour vérifier si cela résout le problème. Sauvegardez d’abord les données importantes.

## Premiers contrôles

1. [Vérifier l’image téléchargée](/installing-minios/Verifying-Downloads).
2. Démarrez **Démarrer sans enregistrer**. Si le problème disparaît, examinez la session persistante ou sa configuration plutôt que l’image de base.
3. Retirez les paramètres de démarrage personnalisés et les filtres de modules sauf s’ils sont nécessaires pour reproduire le problème.
4. Essayez un autre port USB et, si possible, un autre appareil ou ordinateur reconnu comme fonctionnel.
5. Notez la première erreur et l’entrée exacte du menu de démarrage, pas seulement le dernier message affiché à l’écran.
6. Vérifiez la [compatibilité matérielle](/getting-started/Hardware-Compatibility) si la même image vérifiée échoue sur une machine mais fonctionne sur une autre.

## Le périphérique n’atteint pas le menu de démarrage MiniOS

Déterminez d’abord comment le périphérique MiniOS a été créé.

- Pour une image écrite en mode brut (`dd`, Etcher, mode DD Rufus, ou écriture d’image via Utilitaire de disque), n’essayez pas de réparer les fichiers de démarrage individuellement. Si la copie est endommagée, réécrivez l’intégralité du périphérique à partir d’une image vérifiée.
- Pour une installation MiniOS basée sur des fichiers, recréez la structure amorçable en utilisant la même méthode d’installation documentée plutôt que de copier les fichiers GRUB, Syslinux ou EFI d’une autre version.
- Ventoy possède son propre chargeur de démarrage et sa propre structure. N’installez pas le chargeur de démarrage MiniOS sur un périphérique Ventoy ; utilisez plutôt la procédure [Ventoy](/installing-minios/installation-tools/Ventoy) à la place.
- Après conversion native, la cible utilise un chargeur de démarrage Debian classique et une structure de système de fichiers standard. L’apparence du bureau MiniOS peut être conservée, mais l’infrastructure live MiniOS et les outils spécifiques au mode live ne sont plus présents. Sauvegardez les données récupérables avant d’utiliser la procédure de réparation ou de réinstallation du chargeur de démarrage Debian adaptée à son BIOS/UEFI et à la structure des partitions.

Si un périphérique nouvellement recréé n’apparaît toujours pas dans le menu de démarrage du firmware, vérifiez le mode du firmware, la prise en charge Secure Boot de l’architecture choisie, le port/appareil USB et la [compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Le menu de démarrage MiniOS apparaît mais le démarrage échoue

Commencez par retirer les paramètres optionnels. Utilisez `debug` et `timing` si vous avez besoin de plus de détails lors du démarrage. `rd.break` est destiné à l’inspection avancée de l’initramfs, pas à la réparation.

Si MiniOS ne trouve pas sa source, consultez [Découverte du système](/reference/boot-process/System-Discovery). Dans un shell initramfs, les informations utiles en lecture seule incluent :

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Une commande temporaire `from=askdisk` peut aider à identifier le périphérique qui contient réellement les données MiniOS. Ensuite, utilisez la syntaxe documentée `from=` plutôt que de deviner les noms de périphériques.

Pour un démarrage PXE ou ISO via HTTP, voir [Démarrage réseau](/reference/boot-process/Network-Boot). Le réseau en début de démarrage est distinct de NetworkManager dans la session en cours.

### Échecs de modules ou d’union racine

Voir [Chargement des modules](/reference/boot-process/Module-Loading) pour les règles réelles de sélection et d’ordre des modules. En particulier :

- `load=` et `noload=` peuvent exclure des modules de base ou du noyau essentiels ; `noload=` l’emporte si les deux correspondent ;
- les candidats ayant le même nom de base occupent le même emplacement de remplacement ;
- un fichier `.sb` ne prouve pas que le fichier est une image SquashFS valide ;
- le noyau en cours d’exécution doit correspondre au module du noyau MiniOS coordonné et aux fichiers de démarrage.

Après un démarrage réussi, examinez l’état réel sans le modifier :

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problèmes d’affichage

Pour un écran noir, une résolution inutilisable ou une boucle du gestionnaire d’affichage :

1. Essayez le paramètre de démarrage `text`. Une console fonctionnelle permet de distinguer un problème graphique ou de bureau d’un échec de démarrage antérieur.
2. Retirez les paramètres `xorg-driver` ou `xorg-resolution` spécifiés manuellement.
3. Testez **Démarrer sans enregistrer** pour exclure une configuration d’affichage persistante.
4. Notez le GPU et le pilote avec `lspci -nnk`.
5. Examinez `journalctl -b -p warning` et `dmesg --level=err,warn`.

Pour les machines virtuelles, voir [Virtualisation](/maintenance-and-recovery/Virtualization).

## Problèmes réseau

Les connexions filaires et Wi-Fi classiques sont gérées par NetworkManager ; voir [Réseau](/using-minios/Networking).

Déterminez d’abord si l’interface existe :

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si aucune interface n’existe, notez `lspci -nnk` ou `lsusb` et recherchez les erreurs de firmware ou de pilote dans `dmesg`.
- Si l’interface existe mais n’a pas d’adresse, distinguez les problèmes de connexion/DHCP du manque de support matériel.
- Si une adresse existe, testez la passerelle, puis une adresse IP, puis un nom DNS pour différencier les problèmes de liaison, de routage et de DNS.
- Le paramètre de démarrage `ip=` concerne le démarrage réseau initial et ne configure pas une connexion NetworkManager persistante. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

## Problèmes de persistance

Démarrez **Démarrer sans enregistrer** avant de modifier un stockage de persistance suspect. N’essayez pas de réparer ou de supprimer la seule copie d’une session tant qu’elle est active.

Vérifiez ce que MiniOS détecte actuellement :

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Vérifiez le mode de démarrage sélectionné, l’espace inscriptible disponible, la compatibilité du système de fichiers et la compatibilité de la session. Les règles détaillées de sélection sont décrites dans [Sessions et persistance](/using-minios/Sessions-and-Persistence) et [Internes de la persistance](/reference/boot-process/Persistence-Internals).

Si une session importante non active `native`, `dynfilefs`, `dynblk`, `vmdk`, ou `raw` est encore lisible, y compris sous forme chiffrée pouvant être déverrouillée, exportez-la **avant** toute manipulation du stockage :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager ne peut pas lire ni exporter la session, cessez d’écrire sur la source et conservez une copie hors ligne du stockage concerné avant toute autre intervention. Pour une session DynBlk détachée, `dynblk inspect /path/to/volume000.db --metadata-only` et `dynblk check /path/to/volume000.db` fournissent des diagnostics de format en lecture seule ; ne les exécutez pas sur un volume encore monté. MiniOS ne définit pas de procédure manuelle universelle pour reconstruire les segments DynFileFS, reconstituer les parties sous-jacentes DynBlk, réparer un système de fichiers interne ou restaurer les métadonnées de session. Cette récupération dépend du système de fichiers ou du conteneur et ne doit être tentée que sur une copie lorsque la valeur des données le justifie.

Voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) pour les procédures de sauvegarde et d’importation de session prises en charge.

## Problèmes de stockage et d’espace libre

Examinez les périphériques et les montages sans les modifier :

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un système de fichiers plein peut entraîner des échecs d’opérations sur les paquets, des sauvegardes de session incomplètes et d’autres erreurs secondaires. Libérez de l’espace en déplaçant ou supprimant uniquement des données connues après avoir confirmé le bon système de fichiers. Utilisez le Gestionnaire de sessions MiniOS pour supprimer des sessions plutôt que de retirer manuellement des répertoires de session numérotés.

Si `LIVE_APT_CACHE=volatile`, vérifiez aussi `findmnt -T /var/cache/apt/archives` et `df -h /var/cache/apt/archives`: la zone d’archive est un système de fichiers RAM limité et un téléchargement volumineux peut la saturer même si la clé USB dispose d’espace libre. Avec `LIVE_LOG_STORAGE=volatile`, la `/var/log` ordinaire a une limite séparée de 32 Mio RAM. Saturer l’une ou l’autre zone n’entraîne pas le basculement silencieux de MiniOS vers l’écriture de ces fichiers sur la clé USB. Voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

La réparation d’un système de fichiers n’est pas une opération générique MiniOS. Si le système de fichiers est endommagé, démontez-le, sauvegardez d’abord les données importantes ou une image, puis utilisez une procédure de réparation adaptée à ce système de fichiers et à ce support.

## Modifications de paquets et mises à jour système

Si les problèmes sont apparus après des modifications de paquets APT, gardez à l’esprit qu’une session persistante live peut remplacer des fichiers issus des modules en lecture seule MiniOS. Testez **Démarrer sans enregistrer** pour comparer avec l’ensemble de modules d’origine. Voir [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour la distinction entre maintenance APT et changement de version MiniOS.

## Collecte des journaux

Les informations utiles incluent :

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

Pour des échecs de démarrage répétés sur des supports MiniOS inscriptibles, `EXPORT_LOGS=true` dans `config.conf` exporte les journaux de démarrage sous `minios/log/`. Voir [config.conf](/reference/configuration/config.conf).

Dans une session durable saine `perch`, les deux journaux de démarrage obligatoires sont déjà conservés quel que soit `LIVE_LOG_STORAGE` :

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Les versions `.1`, `.2` et `.3` correspondent à des démarrages précédents. Le montage `/var/log` ordinaire peut être `tmpfs` alors que `/var/log/minios` et `/var/log/live` restent sur le stockage de persistance. Pour SquashFS, ces journaux se trouvent aussi sous `minios/changes/<session-id>/boot-logs/`, en dehors de `changes.sb` ; ils survivent même si la capture d’arrêt échoue. Une activation `perch` échouée ou non durable n’a pas de destination de journal persistant garantie. Avec `LIVE_LOG_STORAGE=volatile`, `journalctl -b` et les autres journaux classiques sont disponibles uniquement pour le démarrage **en cours**. Activez les traces détaillées `minios-update-*` à l’aide de `LIVE_CONFIG_DEBUG=true` uniquement si nécessaire ; les erreurs normales restent signalées sans cela.

Retirez les identifiants, clés privées, secrets Wi-Fi et toute information confidentielle avant de partager les journaux. Pour un défaut reproductible, incluez les extraits pertinents et ouvrez un ticket dans le [gestionnaire d’incidents MiniOS](https://github.com/minios-linux/minios-live/issues).

### Les sessions VMDK ne sont pas proposées

Mettez à jour le pilote/CLI DynBlk et les outils de session ensemble, puis régénérez l’
initrd de démarrage. L’initrd en cours doit annoncer `vmdk-session-v1` ; l’installateur vérifie aussi
 chaque initrd source qu’il va copier. L’ancien marqueur vide DynBlk
 indique uniquement la prise en charge native des blocs et ne garantit pas la prise en charge du démarrage de session VMDK.
Ne modifiez pas manuellement le mode d’une session existante : effectuez une copie explicite ou une
conversion vers l’autre format.

### Libérer de l’espace dans les sessions DynFileFS, DynBlk ou VMDK

Utilisez le menu contextuel du Gestionnaire de sessions **Libérer de l’espace…**, ou
`minios-session reclaim ID --json`. Pour les sessions en clair, cela optimise le
système ext4 interne puis demande au backend propriétaire de récupérer l’espace sans
déplacer de données actives. DynFileFS nécessite la version 4.6.0 ou ultérieure pour cette opération.
Sur des systèmes de fichiers comme exFAT, des espaces internes peuvent rester alloués au fichier hôte
 mais être réutilisables par le conteneur ; `--compact` est un choix manuel distinct qui peut
déplacer des données actives et écrire davantage sur le support flash. Rien n’active la
compaction ni le discard LUKS automatiquement. Une session chiffrée ne peut récupérer que
l’espace déjà connu du backend sous-jacent via cette commande.
