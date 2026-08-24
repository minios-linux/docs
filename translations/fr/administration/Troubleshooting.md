# Dépannage

Commencez par l’observation et des tests réversibles. N’effectuez pas de repartitionnement, de reformatage, de réparation de système de fichiers, de suppression de session ou d’écrasement de fichiers de démarrage tant que les données importantes ne sont pas sauvegardées et que le périphérique défaillant n’a pas été identifié par modèle, taille, système de fichiers et point de montage.

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

## Problèmes d’affichage

Pour un écran noir, une résolution illisible ou une boucle du gestionnaire d’affichage :

1. Essayez le paramètre de démarrage `text`. Si une console démarre, le système de base a démarré et le problème se situe probablement au niveau des graphiques, de X11 ou du gestionnaire d’affichage.
2. Retirez un paramètre `xorg-driver` ou `xorg-resolution` spécifié manuellement.
3. Testez une session sans persistance pour exclure une configuration d’affichage persistante.
4. Notez le GPU et le pilote chargé avec `lspci -nnk`.
5. Analysez les erreurs du démarrage en cours avec `journalctl -b -p warning` et
   `dmesg --level=err,warn`.

Les contrôles de résolution en machine virtuelle documentés comme `virtres` et `novirtres`
s’appliquent uniquement à l’environnement Xfce. Consultez
[Virtualisation](/administration/Virtualization.md) pour la configuration spécifique aux invités.

## Problèmes réseau

Vérifiez d’abord si l’interface existe avant de modifier la configuration :

```bash
ip link
ip address
ip route
```

Pour la session normale en cours, inspectez NetworkManager s’il est présent :

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Si aucune interface n’apparaît, relevez la sortie de `lspci -nnk` ou `lsusb` et vérifiez l’absence éventuelle de microprogramme dans `dmesg`.
- Si l’interface existe mais n’a pas d’adresse, testez le DHCP avant de saisir des valeurs statiques.
- Si une adresse est présente, testez la passerelle, puis une adresse IP, puis un nom DNS pour distinguer les problèmes de liaison, de routage et de DNS.
- L’installateur configure le DHCP filaire ou une IPv4 statique. Il laisse les profils Wi-Fi existants inchangés.
- Le paramètre de démarrage `ip=` configure le téléchargement PXE initial, pas le réseau de la session persistante. Voir [Boot réseau](/installation/Network-Boot.md).

## Problèmes de persistance

Démarrez d’abord sans persistance et réalisez une copie complète du répertoire `minios/changes`.
N’utilisez pas d’outils de réparation sur la seule copie ni sur une session active.

Vérifiez l’état de la session avec :

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Les causes fréquentes incluent le démarrage de l’entrée "neuve", l’utilisation d’une méthode d’écriture ISO qui n’a jamais configuré la persistance, un espace libre insuffisant, la sélection d’une session d’une autre édition ou version, une incompatibilité de système de fichiers et un arrêt non propre. Voir [Gestion des sessions](/configuration/Session-Management.md).

Si MiniOS crée des sessions vides à répétition, ne peut pas reprendre DynFileFS ou signale des erreurs de conteneur, suivez le guide [Récupération DynFileFS et dynblk](/configuration/DynFileFS-Recovery.md).
Ce guide commence par une copie complète et des vérifications en lecture seule. Les sessions LUKS nécessitent également la bonne phrase de passe et un initrd avec prise en charge de la persistance LUKS.

## Problèmes de stockage et d’espace

Identifiez les périphériques et les points de montage sans les modifier :

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirmez le modèle et la taille du périphérique avant toute opération. Un système de fichiers plein peut provoquer des échecs de mise à jour, des écritures de session incomplètes et une récupération au démarrage. Libérez de l’espace en déplaçant ou supprimant uniquement des données utilisateur connues après avoir effectué une sauvegarde ; ne supprimez pas manuellement les répertoires de persistance numérotés lorsqu’un est actif. Utilisez le gestionnaire de sessions ou `minios-session` pour les opérations sur les sessions.

La réparation du système de fichiers intervient plus tard. Démontez d’abord le système de fichiers, travaillez sur une copie si possible et utilisez l’outil de vérification spécifique au système de fichiers. Ne formatez jamais un périphérique à titre de test de diagnostic.

## Collecte des journaux

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

En cas d’échecs répétés au démarrage sur un support MiniOS inscriptible, définissez `EXPORT_LOGS=true` dans le fichier de configuration. MiniOS copie ses journaux de démarrage dans `minios/logs` lorsque le support est inscriptible. Voir [Fichier de configuration](/configuration/Configuration-File.md).

Pour signaler un défaut reproductible, joignez les extraits pertinents et ouvrez un ticket dans le [suivi des problèmes MiniOS](https://github.com/minios-linux/minios-live/issues).
