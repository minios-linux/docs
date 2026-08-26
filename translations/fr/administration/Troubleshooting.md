# Dépannage

Commencez par observer et effectuer des tests réversibles. Ne reconfigurez pas les partitions, ne reformatez pas, ne réparez pas un système de fichiers, ne supprimez pas une session et ne remplacez pas les fichiers de démarrage tant que les données importantes ne sont pas sauvegardées et que le périphérique défaillant n’a pas été identifié par modèle, taille, système de fichiers et point de montage.

Utilisez [Sauvegarde et restauration](/administration/Backup-Recovery.md) avant toute opération destructive et [Récupération du démarrage](/administration/Boot-Recovery.md) lorsque le firmware, le bootloader, le noyau ou les fichiers de démarrage installés sont concernés.

## Vérifications initiales

1. Vérifiez l’ISO téléchargée en suivant
   [Vérification des téléchargements](/installation/Verifying-Downloads.md).
2. Testez un démarrage sans persistance. Cela permet de distinguer les problèmes du système de base et du matériel de ceux d’une session endommagée ou incompatible.
3. Essayez un autre port USB et, si possible, un autre périphérique reconnu comme fonctionnel.
4. Notez précisément l’entrée du menu de démarrage, les éventuels paramètres ajoutés, et la première erreur rencontrée, pas seulement l’échec final.
5. Consultez la [Compatibilité matérielle](/installation/Hardware-Compatibility.md) ainsi que le guide de l’outil utilisé pour écrire le périphérique.

## Problèmes de démarrage

Si le périphérique n’apparaît pas dans le menu de démarrage du firmware, vérifiez s’il a été écrit pour UEFI, BIOS hérité ou les deux. Désactivez temporairement le démarrage rapide du firmware, essayez le menu de démarrage ponctuel du firmware et testez un autre port avant de réécrire le périphérique. Ne modifiez pas la table de partitions du disque interne pour diagnostiquer un problème de démarrage USB.

Si le menu de démarrage MiniOS s’affiche mais que le démarrage échoue :

- Lancez une session sans `perch`, `perchdir` ou `perchmode`.
- Retirez les paramètres optionnels et les filtres de modules.
- Vérifiez que l’ISO et le support écrit ne sont pas corrompus.
- Relevez l’erreur complète. Les paramètres `debug` et `timing` ajoutent la sortie du démarrage ;
  `rd.break` ouvre un shell initramfs pour un diagnostic avancé.
- Si les données MiniOS sont introuvables, vérifiez la valeur `from` et le chemin du périphérique en consultant
  [Paramètres de démarrage](/configuration/Boot-Parameters.md).

Pour un démarrage ISO via PXE ou HTTP, suivez le guide dédié
[Boot réseau](/installation/Network-Boot.md). Le réseau au démarrage est distinct de NetworkManager dans la session en cours.

### Échecs de source MiniOS

Consultez [Découverte système Initrd](/configuration/Initrd-System-Discovery.md) pour l’ensemble des règles de priorité et de chemin des sources. Les points les plus utiles lors du diagnostic sont :

- Un `from=http://...` littéral l’emporte sur `ip=` ; `ip=` fournit alors une adresse HTTP ISO statique. Sinon, tout `ip=` non vide sélectionne PXE. Aucun de ces chemins réseau ne bascule sur un média local.
- La découverte locale effectue 45 passages et teste les noms de périphériques bloc dans l’ordre trié. Elle retient le premier périphérique contenant une source valide, qui n’est pas forcément le périphérique souhaité ni un ensemble de modules complet.
- `/dev/disk/by-label/LABEL/path` est pris en charge dans `from=`. Les chemins UUID, PARTUUID et by-id ne sont pas pris en charge par cet analyseur.
- La syntaxe exacte du chemin personnalisé pour le sélecteur utilise les deux-points, par exemple `from=askdisk:custom:dir`. Une syntaxe avec slash teste silencieusement le chemin `minios` par défaut à la place.
- Si la découverte entre dans le shell initramfs fatal, quitter ce shell ne répare pas la source ni ne propose de solution de repli. Cela permet seulement au démarrage de continuer vers une erreur ultérieure, moins explicite.

Dans un shell initramfs, commencez par une inspection en lecture seule :

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Notez la première erreur de source, de montage ou de téléchargement. N’effectuez pas de réparation du système de fichiers et ne retirez pas le média tant qu’il est monté.

### Échecs de module et de racine

Consultez [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md) pour les règles de sélection, d’ordre et d’union. Vérifiez d’abord ces causes courantes :

- `load=` et `noload=` sont des filtres d’expression régulière. Il n’existe pas de noyau ou ensemble central protégé, donc un filtre peut exclure `00-core` ou le module `01-kernel` du noyau en cours ; `noload=` l’emporte si les deux filtres correspondent.
- Les chemins des modules sont réduits à leur nom de base. Deux candidats ayant le même nom de base occupent un seul emplacement de remplacement, donc un niveau de source ultérieur peut remplacer le candidat précédent au lieu d’ajouter une couche supplémentaire.
- Un suffixe `.sb` ne prouve pas qu’un candidat est une image SquashFS valide. Des échecs de montage individuels (loop ou module) peuvent permettre au démarrage de continuer avec une couche manquante. Notez la première erreur de montage.
- `toram=full` et `toram=trim` ne vérifient pas la RAM disponible à l’avance. Les échecs de copie ou de détachement peuvent laisser la source d’origine montée, donc n’éjectez pas le média ni ne coupez une connexion HTTP simplement parce que `toram` a été spécifié.

Après un transfert réussi, ces commandes permettent d’inspecter l’état sans le modifier :

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

Pour la sélection et les échecs de la couche en écriture, voir [Persistance Initrd](/configuration/Initrd-Persistence.md). La persistance peut basculer sur une couche supérieure temporaire en RAM après certains échecs d’activation, tandis qu’un échec de construction de l’union racine mène au shell initramfs fatal.

## Problèmes d’affichage

Pour un écran noir, une résolution illisible ou une boucle du gestionnaire d’affichage :

1. Essayez le paramètre de démarrage `text`. Si une console démarre, le système de base a démarré et le problème se situe probablement dans la partie graphique, X11 ou le gestionnaire d’affichage.
2. Retirez un paramètre `xorg-driver` ou `xorg-resolution` spécifié manuellement.
3. Testez une nouvelle session pour exclure une configuration d’affichage persistante.
4. Relevez le GPU et le pilote chargé avec `lspci -nnk`.
5. Inspectez les erreurs du démarrage en cours avec `journalctl -b -p warning` et `dmesg --level=err,warn`.

Les contrôles de résolution en machine virtuelle documentés sous `virtres` et `novirtres` s’appliquent uniquement à l’environnement Xfce. Voir [Virtualisation](/administration/Virtualization.md) pour la configuration spécifique aux invités.

## Problèmes réseau

Pour la configuration normale filaire et Wi-Fi, la persistance et les commandes NetworkManager, voir [Configuration réseau](/configuration/Network-Configuration.md).

Vérifiez si l’interface existe avant de modifier la configuration :

```bash
ip link
ip address
ip route
```

Pour la session en cours, inspectez NetworkManager s’il est présent :

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Si aucune interface n’apparaît, relevez la sortie de `lspci -nnk` ou `lsusb` et vérifiez l’absence de microprogramme dans `dmesg`.
- Si l’interface existe mais n’a pas d’adresse, testez DHCP avant de saisir des valeurs statiques.
- Si une adresse existe, testez la passerelle, puis une adresse IP, puis un nom DNS pour distinguer les échecs de liaison, de routage et de DNS.
- L’installateur configure le DHCP filaire ou une IPv4 statique. Il laisse les profils Wi-Fi existants inchangés.
- Le paramètre de démarrage `ip=` configure le téléchargement PXE précoce, pas le réseau de session persistant. Voir [Démarrage réseau](/installation/Network-Boot.md).

## Problèmes de persistance

Démarrez d’abord sans persistance et faites une copie complète du répertoire `minios/changes`. N’utilisez pas d’outils de réparation sur la seule copie ni sur une session active.

Vérifiez l’état de la session avec :

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Les causes courantes incluent le démarrage de l’entrée fraîche, l’utilisation d’une méthode d’écriture ISO qui n’a jamais configuré la persistance, un espace libre insuffisant, la sélection d’une session d’une autre édition ou version, une incompatibilité de système de fichiers et un arrêt non propre. Voir [Gestion des sessions](/configuration/Session-Management.md).

Si MiniOS crée des sessions vides à répétition, ne peut pas reprendre DynFileFS ou signale des erreurs de conteneur, suivez [Récupération DynFileFS et dynblk](/configuration/DynFileFS-Recovery.md). Ce guide commence par une copie complète et des vérifications en lecture seule. Les sessions LUKS nécessitent également la bonne phrase de passe et un initrd prenant en charge la persistance LUKS.

## Problèmes de stockage et d’espace

Identifiez les périphériques et les montages sans les modifier :

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirmez le modèle et la taille du périphérique avant toute opération. Un système de fichiers plein peut provoquer des échecs de mises à jour, des écritures de session incomplètes et une récupération au démarrage. Libérez de l’espace en déplaçant ou supprimant uniquement des données utilisateur connues, après avoir effectué une sauvegarde ; ne supprimez jamais manuellement les répertoires de persistance numérotés lorsqu’un est actif. Utilisez Session Manager ou `minios-session` pour les opérations sur les sessions.

La réparation du système de fichiers est une étape ultérieure. Démontez d’abord le système de fichiers, travaillez sur une copie si possible, et utilisez l’outil de vérification spécifique au système de fichiers. Ne formatez jamais un périphérique à titre de test de diagnostic.

## Collecter les journaux

Notez l’édition et la version de MiniOS, la méthode de démarrage, le mode de persistance, le matériel et les étapes nécessaires pour reproduire le problème. Les commandes utiles incluent :

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

Retirez les mots de passe, clés privées, identifiants Wi-Fi, adresses IP publiques et autres données sensibles avant de partager les journaux. `journalctl -b -1` peut afficher le démarrage précédent lorsque le journal est persistant.

Pour des échecs répétés au démarrage sur un média MiniOS inscriptible, définissez `EXPORT_LOGS=true` dans le fichier de configuration. MiniOS copie ses journaux de démarrage dans un répertoire horodaté sous `minios/log/` lorsque le média est inscriptible. Voir [Fichier de configuration](/configuration/Configuration-File.md).

Lors du signalement d’un défaut reproductible, joignez les extraits pertinents et ouvrez un ticket dans le [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
