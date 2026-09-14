---
updated: 2026-09-13
---

# Dépannage

Commencez par observer et effectuer des tests réversibles. N’effectuez pas de repartitionnement, de formatage, de réparation de système de fichiers, de suppression de session ou de remplacement de fichiers de démarrage simplement pour voir si cela résout le problème. Sauvegardez d’abord les données importantes.

## Premiers contrôles

1. [Vérifier l’image téléchargée](/installing-minios/Verifying-Downloads).
2. Démarrer **Démarrer sans enregistrer**. Si le problème disparaît, examinez la session persistante ou sa configuration plutôt que l’image de base.
3. Retirez les paramètres de démarrage personnalisés et les filtres de modules, sauf s’ils sont nécessaires pour reproduire le problème.
4. Essayez un autre port USB et, si possible, un autre appareil ou ordinateur fonctionnel.
5. Notez la première erreur et l’entrée exacte du menu de démarrage, plutôt que seulement le dernier message affiché à l’écran.
6. Vérifiez [la compatibilité matérielle](/getting-started/Hardware-Compatibility) lorsque la même image vérifiée échoue sur une machine mais fonctionne sur une autre.

## L’appareil n’atteint pas le menu de démarrage MiniOS

Commencez par déterminer comment le périphérique MiniOS a été créé.

- Pour une image écrite en mode brut (`dd`, Etcher, mode DD Rufus, ou écriture d’image via Utilitaire de disque), ne réparez pas les fichiers de démarrage individuellement. Si la copie est endommagée, réécrivez l’appareil en entier à partir d’une image vérifiée.
- Pour une installation basée sur des fichiers MiniOS, recréez la structure amorçable en utilisant la même méthode d’installation documentée, plutôt que de copier les fichiers GRUB, Syslinux ou EFI depuis une autre version.
- Ventoy possède son propre programme de démarrage et sa propre structure. N’installez pas le programme de démarrage MiniOS sur un périphérique Ventoy ; utilisez la [procédure Ventoy](/installing-minios/installation-tools/Ventoy) à la place.
- Après une conversion native, la cible utilise un programme de démarrage Debian classique et une structure de système de fichiers standard. L’apparence du bureau MiniOS peut être conservée, mais l’infrastructure live MiniOS et les outils spécifiques au mode live ne sont plus présents. Sauvegardez les données récupérables avant d’utiliser la procédure de réparation ou de réinstallation du programme de démarrage Debian adaptée à son BIOS/UEFI et à la structure des partitions.

Si un appareil nouvellement recréé n’apparaît toujours pas dans le menu de démarrage du firmware, vérifiez le mode firmware, la prise en charge de Secure Boot pour l’architecture choisie, le port/appareil USB, ainsi que la [compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Le menu de démarrage MiniOS apparaît mais le démarrage échoue

Commencez par retirer les paramètres optionnels. Utilisez `debug` et `timing` lorsque vous avez besoin de plus d’informations sur le démarrage précoce. `rd.break` est destiné à l’inspection avancée de l’initramfs, pas à la réparation.

Si MiniOS ne trouve pas sa source, consultez [Découverte du système](/reference/boot-process/System-Discovery). Dans un shell initramfs, les informations utiles en lecture seule incluent :

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporaire peut aider à identifier le périphérique qui contient réellement les données MiniOS. Ensuite, utilisez la syntaxe documentée `from=` plutôt que de deviner les noms des périphériques.

Pour un démarrage PXE ou ISO via HTTP, consultez [Démarrage réseau](/reference/boot-process/Network-Boot). Le réseau utilisé au démarrage est indépendant de NetworkManager dans la session en cours.

### Échecs du module ou de l'union racine

Voir [Chargement des modules](/reference/boot-process/Module-Loading) pour les règles exactes de sélection et d’ordre des modules. En particulier :

- `load=` et `noload=` peuvent exclure des modules de base ou du noyau essentiels ; `noload=` l’emporte si les deux correspondent ;
- les candidats ayant le même nom de base occupent le même emplacement de remplacement ;
- un `.sb` nom de fichier ne prouve pas que le fichier est une image SquashFS valide ;
- le noyau en cours d’exécution doit correspondre au module du noyau et aux fichiers de démarrage MiniOS coordonnés.

Après un démarrage réussi, vérifiez l’état réel sans le modifier :

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problèmes d’affichage

En cas d’écran noir, de résolution inutilisable ou de boucle du gestionnaire d’affichage :

1. Essayez le paramètre de démarrage `text`. Une console fonctionnelle permet de distinguer un problème graphique/de bureau d’un échec de démarrage antérieur.
2. Retirez les paramètres `xorg-driver` ou `xorg-resolution` ajoutés manuellement.
3. Testez **Démarrer sans enregistrer** pour exclure une configuration d’affichage persistante.
4. Notez le GPU et le pilote avec `lspci -nnk`.
5. Consultez `journalctl -b -p warning` et `dmesg --level=err,warn`.

Pour les machines virtuelles, voir [Virtualisation](/maintenance-and-recovery/Virtualization).

## Problèmes de réseau

Les connexions filaires et Wi-Fi classiques sont gérées par NetworkManager ; voir [Réseau](/using-minios/Networking).

Commencez par vérifier si l’interface existe :

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si aucune interface n’existe, notez `lspci -nnk` ou `lsusb` et recherchez des erreurs de firmware ou de pilote dans `dmesg`.
- Si l’interface existe mais n’a pas d’adresse, distinguez les problèmes de connexion/DHCP du manque de support matériel.
- Si une adresse est présente, testez la passerelle, puis une adresse IP, puis un nom DNS pour différencier les échecs de liaison, de routage et de DNS.
- Le paramètre de démarrage `ip=` concerne le démarrage réseau précoce et ne configure pas une connexion NetworkManager persistante. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

## Problèmes de persistance

Démarrage **Démarrer sans enregistrer** avant de modifier un stockage de persistance suspect. Ne réparez ni ne supprimez l’unique copie d’une session tant qu’elle est active.

Vérifiez ce que MiniOS voit actuellement :

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Vérifiez le mode de démarrage sélectionné, l’espace disponible en écriture, la compatibilité du système de fichiers et la compatibilité de la session. Les règles de sélection détaillées sont dans [Sessions et persistance](/using-minios/Sessions-and-Persistence) et [Internes de la persistance](/reference/boot-process/Persistence-Internals).

Si une session importante non active `native`, `dynfilefs`, `dynblk`, `raw`, ou `luks` reste lisible, exportez-la **avant de** manipuler le stockage :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si le Session Manager ne peut ni lire ni exporter la session, arrêtez d’écrire sur la source et conservez une copie hors ligne du stockage concerné avant toute autre opération. Pour une session dynblk détachée, `dynblk inspect /path/to/volume000.db` et `dynblk check /path/to/volume000.db` fournissent des diagnostics en lecture seule ; ne les lancez pas sur un volume encore attaché. MiniOS ne définit pas de procédure manuelle universelle pour reconstruire les segments DynFileFS, reconstituer les parties dynblk, réparer un système de fichiers interne ou restaurer les métadonnées de session. Ce type de récupération dépend du système de fichiers ou du conteneur et doit être tenté uniquement sur une copie lorsque la valeur des données le justifie.

Voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) pour les procédures de sauvegarde et d’importation de session prises en charge.

## Problèmes de stockage et d’espace libre

Inspectez les périphériques et points de montage sans les modifier :

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un système de fichiers plein peut entraîner des échecs lors des opérations de paquets, des sauvegardes de session incomplètes et d’autres erreurs secondaires. Libérez de l’espace en déplaçant ou supprimant uniquement des données connues, après avoir confirmé le bon système de fichiers. Utilisez le Gestionnaire de sessions MiniOS pour supprimer des sessions, plutôt que de retirer manuellement les dossiers de session numérotés.

La réparation d’un système de fichiers n’est pas une opération MiniOS générique. Si le système de fichiers est endommagé, démontez-le, sauvegardez d’abord les données importantes ou une image, puis utilisez une procédure de réparation adaptée à ce système de fichiers et au support de stockage.

## Modifications de paquets et mises à jour système

Si des problèmes sont apparus après des changements de paquets APT, gardez à l’esprit qu’une session persistante en mode live peut remplacer des fichiers issus des modules MiniOS en lecture seule. Testez **Démarrer sans sauvegarde** pour comparer avec l’ensemble de modules d’origine. Voir [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour la distinction entre la maintenance APT et le changement de version de MiniOS.

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

Pour des échecs de démarrage répétés sur un support MiniOS inscriptible, `EXPORT_LOGS=true` dans `config.conf` exporte les journaux de démarrage sous `minios/log/`. Voir [config.conf](/reference/configuration/config.conf).

Avant de partager des journaux, retirez les identifiants, clés privées, mots de passe Wi-Fi et autres informations confidentielles. Pour un défaut reproductible, joignez les extraits pertinents et ouvrez un ticket dans le [gestionnaire de tickets MiniOS](https://github.com/minios-linux/minios-live/issues).
