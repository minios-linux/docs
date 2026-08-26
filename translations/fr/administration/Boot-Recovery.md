# Récupération du démarrage

La réparation du démarrage dépend de la manière dont MiniOS a été installé sur l’appareil et du mode de démarrage du firmware (BIOS ou UEFI). Une procédure adaptée à une configuration peut endommager une autre. Sauvegardez les fichiers importants avant d’écrire un secteur de démarrage, de modifier un drapeau de partition, de remplacer un arbre EFI ou de réinstaller GRUB. Consultez [Sauvegarde et récupération](/administration/Backup-Recovery.md).

## Identifier la configuration

- **ISO écrite en mode brut :** `dd`, Etcher, Rufus en mode DD ou un utilitaire d’écriture d’image similaire a copié la structure de blocs de l’ISO sur l’ensemble du périphérique. Considérez ce support comme une image, et non comme une installation classique basée sur des fichiers.
- **Installation live basée sur des fichiers :** le périphérique possède un système de fichiers classique avec un répertoire `minios/` contenant des modules SquashFS et `minios/boot/`. Cela inclut la méthode héritée de copie de fichiers et les déploiements live réalisés par MiniOS Installer.
- **Installation native :** MiniOS Installer a extrait les modules dans un système de fichiers racine Linux conventionnel. Il utilise le GRUB et l’initramfs du système installé plutôt que la structure de démarrage modulaire live.

`Ventoy` conserve généralement l’ISO en tant que fichier sous son propre chargeur de démarrage. Réparez-le selon la procédure de la documentation `Ventoy` ; n’installez pas le secteur de démarrage Syslinux de MiniOS par-dessus.

## Diagnostiquer sans modifier le disque

Commencez par vérifier si l’échec se produit avant le menu MiniOS, après le menu ou après le démarrage du noyau. Vérifiez le menu de démarrage unique du firmware et notez si l’entrée sélectionnée est en mode UEFI ou BIOS hérité. Essayez un autre port et, si possible, démarrez le même périphérique sur un autre ordinateur.

Depuis un support de secours Linux fonctionnel, inspectez sans réparer :

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

Sur un système démarré en mode UEFI, `sudo efibootmgr -v` peut lister les entrées du firmware. Son absence ou une erreur ne prouve pas que les fichiers EFI sont manquants. Ne formatez pas, ne repartitionnez pas, n’exécutez pas de réparation de système de fichiers, et ne modifiez pas les drapeaux simplement pour tester. Vérifiez chaque périphérique par modèle et capacité, et montez les systèmes de fichiers en lecture seule lors de l’inspection.

Si le menu de démarrage apparaît mais que MiniOS ne trouve pas ses modules, modifiez temporairement l’entrée de démarrage et essayez `from=askdisk`. Une fois le bon système de fichiers identifié, un label de système de fichiers est plus fiable qu’un nom comme `/dev/sdb1` :

```text
from=/dev/disk/by-label/MINIOS/minios
```

Le label doit exister et identifier le système de fichiers visé ; les labels doivent être uniques. Ajoutez `debug timing` pour plus de détails lors du démarrage. Ajoutez `rd.break` uniquement si un shell initramfs est nécessaire pour une inspection avancée. Ces options servent au diagnostic de la détection des modules ; elles ne réparent pas le chargeur de démarrage. Voir [Paramètres de démarrage](/configuration/Boot-Parameters.md) et [Dépannage](/administration/Troubleshooting.md).

## Support ISO écrit en mode brut

Ne lancez pas `bootinst.sh`, n’installez pas GRUB et ne copiez pas de fichiers de démarrage individuels sur un périphérique ISO écrit en mode brut. Sa table de partitions, ses enregistrements de démarrage, ses fichiers ISO et ses fichiers EFI forment une seule image. Si l’ISO vérifiée démarre ailleurs mais pas sur cette copie, sauvegardez toute donnée stockée en dehors de la structure de l’image et réécrivez l’intégralité du périphérique à partir d’une ISO vérifiée. Voir [Vérification des téléchargements](/installation/Verifying-Downloads.md) et [Installation de MiniOS](/installation/Installing-MiniOS.md).

Si la réécriture de la même image vérifiée échoue encore, essayez un autre périphérique et vérifiez la compatibilité du firmware et du matériel plutôt que de modifier l’image à plusieurs reprises.

## Installations live basées sur des fichiers

### Installateur groupé sur support MBR

L’installateur groupé n’est adapté que si toutes les conditions suivantes sont réunies :

- Le périphérique est une installation live basée sur des fichiers sur un disque partitionné en MBR.
- Le répertoire `minios/boot/syslinux/` est complet, intact et appartient au même arbre et à la même version de MiniOS que les autres éléments de démarrage.
- Le système de fichiers monté et son périphérique disque parent ont été identifiés sans supposition.

Exécutez le script depuis ce répertoire sur le système de fichiers cible :

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

Le script déduit sa cible à partir du système de fichiers contenant le script. Il installe Syslinux à cet endroit, écrit 440 octets de code de démarrage MBR sur le disque parent, peut modifier le drapeau de partition active, et copie l’arborescence du chargeur UEFI groupé sur le système de fichiers cible. Un mauvais montage ou périphérique peut rendre un autre système non amorçable. Ne l’utilisez pas sur un disque GPT ou une partition système EFI partagée, ne copiez pas uniquement `bootinst.sh` dans un arbre endommagé pour l’exécuter, et n’utilisez pas des éléments provenant d’une autre version de MiniOS.

Sous Windows, le chemin correspondant est :

```text
X:\minios\boot\syslinux\bootinst.bat
```

Exécutez-le en tant qu’administrateur uniquement depuis le périphérique amovible prévu. Le script refuse le disque système Windows détecté, mais ce contrôle ne remplace pas la vérification de la lettre du lecteur et du périphérique physique.

### UEFI

Le démarrage UEFI n’utilise pas le code MBR du BIOS. Le firmware nécessite une partition système EFI ou un système de fichiers FAT lisible ainsi qu’une arborescence de chargeur valide. Restaurez uniquement une arborescence `EFI/boot` complète et correspondante, ainsi que les fichiers EFI MiniOS associés, à partir de l’image ou de la sauvegarde exacte utilisée pour cette installation. Ne combinez pas les exécutables EFI d’une version avec la configuration GRUB ou les fichiers `minios/boot` d’une autre version.

Le `bootinst.sh` groupé copie également son arborescence de chargeur UEFI correspondante, mais effectue tout de même les écritures MBR et Syslinux décrites ci-dessus. Utilisez-le uniquement pour la configuration MBR basée sur des fichiers décrite dans la section précédente, et non comme outil générique de réparation UEFI.

Copier un seul fichier `.efi` peut laisser une chaîne de chargeur incomplète. Si l’arborescence EFI complète et exacte n’est pas disponible, réinstallez la configuration live basée sur des fichiers plutôt que de tenter une reconstruction partielle. Préservez les répertoires de fournisseurs ou de systèmes d’exploitation non liés sur une partition système EFI partagée.

`minios-deploy` fournit des opérations `plan` et `install`, mais pas une opération de réparation du démarrage. Ne pointez pas une commande d’installation sur un disque existant dans le but de le réparer. Consultez [MiniOS Installer](/installation/MiniOS-Installer.md) pour les configurations d’installation prises en charge.

## Installations natives

### GRUB BIOS depuis un chroot

Utilisez cette procédure uniquement pour une installation native réalisée pour le BIOS hérité sur un disque MBR. Elle écrit GRUB sur l’ensemble du disque et peut remplacer le code de démarrage utilisé par d’autres systèmes d’exploitation. Ne l’utilisez pas pour UEFI, GPT, une installation live basée sur des fichiers ou une ISO écrite en mode brut.

Démarrez sur un support de secours Linux fiable, identifiez la partition racine native et son disque parent, puis remplacez leurs chemins réels ci-dessous. Dans cet exemple uniquement, `/dev/sdXN` est la partition racine et `/dev/sdX` est son disque parent. Ne passez jamais une partition comme `/dev/sdX1` à la commande finale `grub-install`.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Montez une partition native `/boot` séparée à `/mnt/boot` avant les montages bind, puis démontez-la avant le `sudo umount /mnt` final. Ne montez pas de partition système EFI pour cette procédure réservée au BIOS. Si la racine utilise LUKS, LVM, RAID ou une configuration non totalement comprise, arrêtez-vous et utilisez une méthode de récupération spécifique à cette pile de stockage. Si `update-grub`, `grub-script-check` ou `grub-install` échoue, n’essayez pas de modifier la table de partitions ou d’autres disques.

### UEFI natif

La reconstruction manuelle d’un démarrage UEFI natif est trop risquée pour être généralisée. Elle dépend de l’architecture EFI exacte, de la chaîne de chargeurs, de l’état des paquets, de la structure des montages, de l’état de Secure Boot, du comportement du firmware et du partage éventuel de la partition système EFI. Une simple copie de fichiers ou une commande `grub-install` peut écraser le chargeur de secours d’un autre système d’exploitation.

Il est préférable de restaurer une sauvegarde exacte et testée de la racine native, du contenu de la partition système EFI et de la configuration de démarrage. Sinon, sauvegardez les données utilisateur et réinstallez le système natif avec MiniOS Installer. N’adaptez pas la procédure de copie live basée sur des fichiers `EFI/boot` à une installation native.

## Restauration modulaire du noyau

Pour une installation live basée sur des fichiers qui ne démarre plus après une modification du noyau, utilisez un support de secours issu de la même version et architecture de MiniOS. Au menu de démarrage, utilisez `from=askdisk` ou un chemin de label stable pour sélectionner l’arborescence `minios/` installée. Si cette combinaison permet d’atteindre un système fonctionnel et que l’arborescence installée est accessible en écriture, inspectez les ensembles de noyaux coordonnés et activez-en un qui est connu pour fonctionner :

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

L’activation doit restaurer un module de noyau coordonné, une image du noyau, un initramfs et la configuration du chargeur de démarrage. Ne remplacez pas uniquement `vmlinuz`, uniquement l’initramfs ou uniquement `01-kernel*.sb`. Conservez le noyau empaqueté précédent jusqu’à ce que le remplacement ait démarré avec succès. Voir [Gestion du noyau](/administration/Kernel-Management.md).

Cette restauration concerne les installations live modulaires. Les installations natives utilisent leurs paquets noyau installés et GRUB, et nécessitent une récupération native ou une réinstallation.

## Quand réinstaller

Sauvegardez les données récupérables et réinstallez au lieu de réparer si l’une des conditions suivantes s’applique :

- Une ISO écrite en mode brut est corrompue ou a été modifiée partiellement.
- Les éléments Syslinux, GRUB, noyau, initramfs ou EFI complets et correspondants ne sont pas disponibles.
- La table de partitions, le système de fichiers ou la partition système EFI est endommagé en plus du chargeur de démarrage.
- Le disque cible ou le périphérique parent ne peut pas être identifié avec certitude.
- Une chaîne de chargeurs UEFI native devrait être reconstruite sans sauvegarde exacte.
- Des erreurs de lecture répétées, des déconnexions ou des erreurs SMART indiquent un support défaillant.
- Une commande de réparation échoue et l’étape suivante nécessiterait de deviner ou d’écraser des données de démarrage non liées.

La réinstallation restaure une structure de démarrage coordonnée connue ; elle ne récupère pas les données utilisateur non sauvegardées ni la persistance. Copiez d’abord les données importantes tant que le système de fichiers reste lisible.
