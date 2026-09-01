---
updated: 2026-08-31
---

# Dépannage

Commencez par l’observation et des tests réversibles. N’effectuez pas de repartitionnement, de formatage, de réparation de système de fichiers, de suppression de session ou de remplacement de fichiers de démarrage simplement pour voir si cela résout le problème. Sauvegardez d’abord les données importantes.

## Premiers contrôles

1. [Vérifiez l’image téléchargée](/installing-minios/Verifying-Downloads).
2. Démarrez avec **Démarrer sans enregistrer**. Si le problème disparaît, examinez la session persistante ou sa configuration plutôt que l’image de base.
3. Retirez les paramètres de démarrage personnalisés et les filtres de modules sauf s’ils sont nécessaires pour reproduire le problème.
4. Essayez un autre port USB et, si possible, un autre périphérique ou ordinateur reconnu comme fonctionnel.
5. Notez la première erreur et l’entrée exacte du menu de démarrage au lieu de seulement le dernier message affiché à l’écran.
6. Vérifiez la [Compatibilité matérielle](/getting-started/Hardware-Compatibility) si la même image vérifiée échoue sur une machine mais fonctionne sur une autre.

## L’appareil n’atteint pas le menu de démarrage MiniOS

Commencez par déterminer comment le périphérique MiniOS a été créé.

- Pour une image écrite en mode brut (`dd`, Etcher, mode DD de Rufus, ou écriture d’image via Utilitaire de disque), ne réparez pas les fichiers de démarrage individuellement. Si la copie est endommagée, réécrivez l’intégralité du périphérique à partir d’une image vérifiée.
- Pour une installation basée sur des fichiers MiniOS, recréez la structure amorçable en utilisant la même méthode d’installation documentée, plutôt que de copier les fichiers GRUB, Syslinux ou EFI d’une autre version.
- Ventoy possède son propre programme de démarrage et sa propre structure. N’installez pas le programme de démarrage MiniOS sur un périphérique Ventoy ; utilisez plutôt la procédure [Ventoy](/installing-minios/installation-tools/Ventoy).
- Après une conversion native, la cible utilise un programme de démarrage Debian classique et une structure de système de fichiers standard. L’apparence du bureau MiniOS peut être conservée, mais l’infrastructure live et les outils spécifiques au live MiniOS ne sont plus présents. Sauvegardez les données récupérables avant d’utiliser la procédure de réparation ou de réinstallation du programme de démarrage Debian adaptée à son BIOS/UEFI et à la structure des partitions.

Si un périphérique nouvellement recréé n’apparaît toujours pas dans le menu de démarrage du firmware, vérifiez le mode du firmware, la prise en charge de Secure Boot pour l’architecture sélectionnée, le port/périphérique USB, ainsi que la [compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Le menu de démarrage MiniOS apparaît mais le démarrage échoue

Commencez par retirer les paramètres optionnels. Utilisez `debug` et `timing` si vous avez besoin de plus de détails lors du démarrage. `rd.break` sert à l’inspection avancée de l’initramfs, pas à la réparation.

Si MiniOS ne trouve pas sa source, consultez [Découverte du système](/reference/boot-process/System-Discovery). Dans un shell initramfs, les informations utiles en lecture seule incluent :

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Un `from=askdisk` temporaire peut aider à identifier le périphérique contenant réellement les données MiniOS. Ensuite, utilisez la syntaxe documentée `from=` plutôt que de deviner les noms de périphériques.

Pour un démarrage ISO PXE ou HTTP, voir [Démarrage réseau](/reference/boot-process/Network-Boot). Le réseau en début de démarrage est distinct de NetworkManager dans la session en cours.

### Échecs de modules ou d’union racine

Consultez [Chargement des modules](/reference/boot-process/Module-Loading) pour les règles réelles de sélection et d’ordre des modules. En particulier :

- `load=` et `noload=` peuvent exclure des modules de base ou du noyau essentiels ; `noload=` l’emporte si les deux correspondent ;
- les candidats portant le même nom de base occupent le même emplacement de remplacement ;
- un nom de fichier `.sb` ne prouve pas que le fichier est une image SquashFS valide ;
- le noyau en cours d’exécution doit correspondre au module du noyau MiniOS coordonné et aux fichiers de démarrage.

Après un démarrage réussi, inspectez l’état réel sans le modifier :

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problèmes d’affichage

Pour un écran noir, une résolution inutilisable ou une boucle du gestionnaire d’affichage :

1. Essayez le paramètre de démarrage `text`. Une console fonctionnelle permet de distinguer un problème graphique/de bureau d’un échec de démarrage antérieur.
2. Retirez les paramètres `xorg-driver` ou `xorg-resolution` spécifiés manuellement.
3. Testez **Démarrer sans enregistrer** pour exclure une configuration d’affichage persistante.
4. Notez le GPU et le pilote avec `lspci -nnk`.
5. Inspectez `journalctl -b -p warning` et `dmesg --level=err,warn`.

Pour les machines virtuelles, voir [Virtualisation](/maintenance-and-recovery/Virtualization).

## Problèmes réseau

Les connexions filaires et Wi-Fi classiques sont gérées via NetworkManager ; voir [Réseau](/using-minios/Networking).

Commencez par vérifier si l’interface existe :

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Si aucune interface n’existe, notez `lspci -nnk` ou `lsusb` et recherchez des erreurs de firmware ou de pilote dans `dmesg`.
- Si l’interface existe mais n’a pas d’adresse, distinguez les problèmes de connexion/DHCP du manque de prise en charge matérielle.
- Si une adresse existe, testez la passerelle, puis une adresse IP, puis un nom DNS pour séparer les pannes de lien, de routage et de DNS.
- Le paramètre de démarrage `ip=` concerne le démarrage réseau initial et ne configure pas une connexion NetworkManager persistante. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

## Problèmes de persistance

Démarrez avec **Démarrer sans enregistrer** avant de modifier un support de persistance suspect. N’essayez pas de réparer ou de supprimer l’unique copie d’une session tant qu’elle est active.

Vérifiez ce que MiniOS voit actuellement :

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Vérifiez le mode de démarrage sélectionné, l’espace inscriptible disponible, la compatibilité du système de fichiers et la compatibilité des sessions. Les règles détaillées de sélection sont dans [Sessions et persistance](/using-minios/Sessions-and-Persistence) et [Internes de la persistance](/reference/boot-process/Persistence-Internals).

Si une session importante non active `native`, `dynfilefs`, `raw` ou `luks` est encore lisible, exportez-la **avant** toute expérimentation sur le support :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Si Session Manager ne peut pas lire ou exporter la session, arrêtez toute écriture sur la source et sauvegardez une copie hors ligne du support concerné avant toute autre intervention. MiniOS ne définit pas de procédure manuelle universelle pour reconstruire des segments DynFileFS, réparer un système de fichiers interne ou reconstituer les métadonnées de session. Cette récupération dépend du système de fichiers ou du conteneur et ne doit être tentée que sur une copie si la valeur des données le justifie.

Voir [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) pour les procédures de sauvegarde et d’importation de session prises en charge.

## Problèmes d’espace de stockage et d’espace libre

Inspectez les périphériques et points de montage sans les modifier :

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Un système de fichiers plein peut entraîner l’échec des opérations de gestion de paquets, des sauvegardes de session incomplètes et d’autres erreurs secondaires. Libérez de l’espace en déplaçant ou supprimant uniquement des données connues, après avoir confirmé le bon système de fichiers. Utilisez le Gestionnaire de sessions MiniOS pour supprimer des sessions, plutôt que de retirer manuellement les répertoires de sessions numérotés.

La réparation d’un système de fichiers n’est pas une opération MiniOS générique. Si le système de fichiers lui-même est endommagé, démontez-le, sauvegardez d’abord les données importantes ou une image, puis utilisez une procédure de réparation adaptée à ce système de fichiers et à ce périphérique de stockage.

## Modifications de paquets et mises à jour système

Si les problèmes sont apparus après des modifications de paquets APT, gardez à l’esprit qu’une session persistante en direct peut remplacer des fichiers issus des modules MiniOS en lecture seule. Testez **Démarrer sans enregistrer** pour comparer avec l’ensemble de modules d’origine. Voir [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour la distinction entre la maintenance APT et le changement de version de MiniOS.

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

Pour des échecs répétés de démarrage sur un support inscriptible MiniOS, `EXPORT_LOGS=true` dans `config.conf` exporte les journaux de démarrage sous `minios/log/`. Voir [config.conf](/reference/configuration/config.conf).

Retirez les identifiants, clés privées, secrets Wi-Fi et autres informations confidentielles avant de partager les journaux. Pour un défaut reproductible, incluez les extraits pertinents et ouvrez un ticket dans le [gestionnaire d’incidents MiniOS](https://github.com/minios-linux/minios-live/issues).
