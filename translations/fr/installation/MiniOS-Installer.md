# Utilisation de l’installateur MiniOS

L’installateur MiniOS est un assistant GTK avec un backend en ligne de commande permettant de déployer MiniOS à partir d’une session live MiniOS. Il installe le système sur un disque cible ; ce n’est pas la même chose qu’écrire une image ISO sur un support amorçable.

## Avant de commencer

Un mauvais choix de disque cible ou de partitionnement peut entraîner la perte de données. Sauvegardez vos fichiers importants, déconnectez les disques inutiles et identifiez le disque cible par son chemin de périphérique, son modèle et sa capacité. La confirmation finale est le dernier moment où l’installation peut être annulée sans risque.

Le disque contenant le système live MiniOS en cours d’exécution est exclu de la sélection des cibles. Pour des recommandations générales sur la capacité, consultez le [Guide de compatibilité matérielle](Hardware-Compatibility.md#system-requirements).

## Modes d’installation

Le mode Live copie les modules MiniOS compressés sélectionnés ainsi que les éléments d’amorçage. Le résultat conserve la structure modulaire du système live et permet l’utilisation de la persistance de session MiniOS.

Le mode Natif décompresse les modules sélectionnés dans un système de fichiers racine Linux classique, configure la cible, installe les paquets nécessaires, génère l’initramfs et installe le chargeur d’amorçage. L’installateur détecte la prise en charge native à partir de l’image démarrée. Si les métadonnées du noyau requises et le contrat d’architecture EFI sont absents, le mode de compatibilité ne permet qu’une installation en mode live.

## Démarrer l’installateur graphique

Ouvrez le menu des applications, sélectionnez Système, puis choisissez Installer MiniOS. Il peut également être lancé depuis un terminal :

```bash
sudo minios-installer
```

L’assistant recueille les informations sur le mode d’installation, la sécurité, la localisation, le réseau filaire, le clavier, le compte utilisateur, les modules, le stockage et les paramètres de démarrage. Vérifiez la géométrie exacte des partitions et le résumé des opérations avant de valider la confirmation finale, qui est destructive.

## Emplacement et schémas d’amorçage

L’installateur graphique propose les choix d’emplacement suivants lorsque la cible est éligible :

- Effacer tout crée une nouvelle table de partitions et supprime toutes les données du disque cible.
- Espace libre utilise un espace non alloué approprié sans réduire un système de fichiers existant.
- À côté réduit la taille d’une partition finale ext2, ext3, ext4 ou NTFS éligible et non montée. Les configurations sales, montées, imbriquées, ambiguës ou jugées non sûres sont refusées. L’installateur peut demander confirmation avant de télécharger les outils de systèmes de fichiers manquants.
- Le partitionnement manuel n’est disponible que pour les installations natives via l’interface graphique sur des disques directs éligibles. Les modifications sont mises en attente jusqu’à la confirmation finale.

Les schémas d’amorçage automatiques sont BIOS/MBR, UEFI/MBR et UEFI/GPT. UEFI fonctionne avec des schémas GPT ou MBR principal. BIOS est pris en charge sur MBR principal, mais pas sur GPT. Les schémas MBR étendus ou logiques en mode préservation ne sont pas pris en charge.

Le mode manuel permet de créer, supprimer, formater et réutiliser des partitions ; de réduire un système de fichiers pris en charge à partir de sa fin ; d’assigner des points de montage, une partition système EFI et une partition swap ; et d’annuler ou de réinitialiser les modifications en attente. Il ne prend pas en charge LVM, RAID, racines LUKS natives, stockage mappé ou imbriqué, bcache, ZFS ou l’édition de sous-volumes Btrfs. La persistance de session LUKS ne chiffre pas un système de fichiers racine natif.

## Systèmes de fichiers

- Les agencements live peuvent utiliser ext2, ext4, Btrfs, FAT32 ou NTFS si les outils requis sont installés.
- Les systèmes de fichiers racine natifs peuvent utiliser ext2, ext4 ou Btrfs. Ext4 est le choix par défaut polyvalent.
- Les systèmes de fichiers ext3 existants peuvent être réutilisés ou réduits lorsque cela est pris en charge, mais ext3 n'est pas proposé pour un nouveau formatage.
- FAT32 est limité aux fichiers de moins de 4 Gio et n'est disponible que pour les agencements live.
- NTFS est disponible uniquement pour les agencements live, bien qu'une partition NTFS éligible puisse être réduite pour un placement en parallèle.

L'espace requis inclut les données du module sélectionné, les éléments de démarrage, la persistance demandée et une réserve de 25 pour cent pour le système de fichiers. L'espace EFI et swap natif est calculé séparément.

## Configuration et sécurité

L'installateur peut configurer la langue, le fuseau horaire, le clavier, le nom d'utilisateur, les mots de passe, les groupes d'utilisateurs, le nom d'hôte, les services, le menu de démarrage et la sélection des modules. La sélection d'un module MiniOS supérieur inclut ses couches inférieures requises.

Les profils de sécurité sont `convenient`, `balanced` et `strict`. Le mode live utilise par défaut `convenient` ; le mode natif utilise par défaut `balanced`. Les contrôles SSH et XRDP sont indépendants du profil sélectionné. Vérifiez les services d'accès à distance avant la première connexion réseau.

La configuration réseau couvre le nom d'hôte et le DHCP filaire ou l'IPv4 statique. L'installateur ne crée ni ne modifie les profils Wi-Fi. Les installations natives et en parallèle peuvent nécessiter un accès réseau, avec votre consentement, pour obtenir GRUB, EFI, initramfs, `os-prober` ou des paquets de redimensionnement de système de fichiers avant toute modification du disque.

## Persistance de la session live

La persistance s'applique uniquement aux installations live :

- La persistance native enregistre les modifications directement sur un système de fichiers cible compatible POSIX. Elle n'est pas proposée sur FAT32 ou NTFS.
- DynFileFS utilise un conteneur extensible.
- Raw utilise une image de taille fixe.
- LUKS utilise une image chiffrée créée par l'initrd au premier démarrage. La phrase de passe est demandée au démarrage et n'est jamais reçue ni stockée par l'installateur.

Les modes conteneur sont limités par défaut à 4000 Mio. Les conteneurs Raw et LUKS ne peuvent pas dépasser 4000 Mio sur FAT32 ; DynFileFS n'est pas soumis à cette limite de taille de fichier unique. LUKS n'est proposé que si l'initrd en cours d'exécution et chaque initrd source copié annoncent le support crypto requis.

Les options de démarrage résultantes utilisent `perchmode` et `perchsize`. Voir [Paramètres de démarrage](/configuration/Boot-Parameters.md) pour leur signification à l'exécution.

## Déploiement en ligne de commande

`minios-deploy` est destiné à l'automatisation, aux tests et à la récupération. Le partitionnement manuel et la configuration interactive du réseau filaire restent accessibles uniquement via l'interface graphique.

Listez les disques reconnus comme installables :

```bash
minios-deploy list-disks
```

Remplacez `/dev/sdb` dans chaque exemple par le disque cible vérifié. Commencez par afficher un plan non destructif :

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Prévisualisez les commandes de déploiement correspondantes sans écrire sur le disque :

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

N'effectuez l'installation réelle qu'après avoir vérifié le plan, l'identité de la cible et la sortie du mode "dry-run". `--yes` autorise les modifications destructives :

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Pour une installation native dans un espace libre existant, utilisez les mêmes options de stockage pour la planification et l'installation :

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Le mode natif peut ne pas apparaître dans l'aide CLI sur une image dépourvue de support d'installation native. La CLI accepte aussi des options de configuration pour les comptes, la langue, le fuseau horaire, le clavier, le nom d'hôte, les services et une base `config.conf`. Vérifiez les options exactes fournies par l'image en cours d'exécution :

```bash
minios-deploy install --help
man minios-deploy
```

Évitez d'utiliser `--password` et `--root-password` dans des environnements partagés, car les arguments en clair de la ligne de commande peuvent être exposés dans l'historique du shell et la liste des processus. Utilisez plutôt l'installateur graphique ou un flux de configuration protégé.
