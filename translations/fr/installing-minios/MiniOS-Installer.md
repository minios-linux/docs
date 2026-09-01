---
updated: 2026-08-31
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Programme d’installation MiniOS

Le Programme d’installation MiniOS est un assistant GTK et un outil en ligne de commande permettant de déployer un système à partir d’une session live MiniOS en cours d’exécution. L’écriture ou la copie de MiniOS sur un support amovible constitue déjà une méthode d’installation ; le Programme d’installation MiniOS est l’outil de déploiement géré à utiliser lorsque vous souhaitez un agencement cible contrôlé, une configuration de persistance ou une conversion native optionnelle.

## Avant de commencer

Un mauvais choix de disque cible ou de partitionnement peut entraîner la perte de données. Sauvegardez vos fichiers importants, déconnectez les disques inutiles et identifiez le disque cible par son chemin de périphérique, son modèle et sa capacité. La confirmation finale est le dernier moment où l'installation peut être annulée sans risque.

Le disque contenant le système live MiniOS en cours d'exécution est exclu de la sélection des cibles. Pour des conseils sur la capacité requise, consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Modes d’installation

Le **mode Live** copie les modules MiniOS compressés sélectionnés ainsi que les éléments de démarrage. Le résultat reste MiniOS : il conserve la structure modulaire du système live, la configuration de démarrage MiniOS, les workflows de gestion MiniOS et, si besoin, la persistance de session.

Le **mode natif** crée un environnement de bureau Debian classique à partir de l’image MiniOS sélectionnée. Il déploie les modules choisis dans un système de fichiers racine en écriture, conserve l’environnement de bureau et les applications courantes sélectionnés, supprime l’exécution live MiniOS et les utilitaires spécifiques au mode live, installe les paquets Debian nécessaires, génère un initramfs classique et installe le chargeur d’amorçage. L’installateur détecte la prise en charge native depuis l’image démarrée. Si les métadonnées du noyau requises et le contrat d’architecture EFI sont absents, le mode de compatibilité ne permet que l’installation live.

::: warning Le mode natif modifie la gestion du système
Le système installé conserve l’expérience de bureau MiniOS familière — son apparence, l’environnement de bureau choisi et les applications courantes — mais n’utilise plus l’architecture live MiniOS. Lors de la conversion, l’installateur supprime les paquets `minios-*` et autres utilitaires spécifiques au mode live, car les sessions, modules `.sb`, gestion modulaire du noyau et configuration de démarrage live ne sont plus applicables. Après redémarrage, le système se gère comme un bureau Debian classique avec APT, les paquets noyau Debian, l’initramfs standard et le chargeur d’amorçage installé. Voir [À propos de MiniOS](/getting-started/About-MiniOS).
:::

Ce déploiement diffère d’une simple écriture d’ISO brute, d’une configuration multiboot ISO-file Ventoy ou d’une installation live basée sur des fichiers. Consultez [Méthodes d’installation](/installing-minios/Installation-Methods) pour plus de détails.

## Démarrer l’installateur graphique

Ouvrez le menu des applications, sélectionnez Système, puis choisissez le Programme d’installation MiniOS. Il peut également être lancé depuis un terminal :

```bash
sudo minios-installer
```

L’assistant recueille les paramètres du mode d’installation, de sécurité, de localisation, de réseau filaire, de clavier, de compte, de module, de stockage et de démarrage. Vérifiez la géométrie exacte des partitions et le résumé des opérations avant de valider la confirmation finale, qui est destructive.

## Emplacement et schémas d’amorçage

L’installateur graphique propose les choix d’emplacement suivants lorsque la cible est éligible :

- Tout effacer crée une nouvelle table de partitions et détruit toutes les données du disque cible.
- Espace libre utilise un espace non alloué approprié sans réduire un système de fichiers existant.
- À côté réduit la taille d’une partition ext2, ext3, ext4 ou NTFS finale, non montée et éligible. Les schémas sales, montés, imbriqués, ambigus ou autrement non sûrs sont refusés. L’installateur peut demander confirmation avant de télécharger les outils de système de fichiers manquants.
- Le partitionnement manuel n’est disponible que pour les conversions natives dans l’interface graphique sur des disques directs éligibles. Les modifications sont préparées jusqu’à la confirmation finale.

Les schémas d’amorçage automatiques sont BIOS/MBR, UEFI/MBR et UEFI/GPT. UEFI fonctionne avec des schémas GPT ou MBR principal. BIOS est pris en charge sur MBR principal, mais pas sur GPT. Les schémas MBR étendus ou logiques ne sont pas pris en charge.

Le mode manuel permet de créer, supprimer, formater et réutiliser des partitions ; de réduire un système de fichiers pris en charge par la fin ; d’attribuer des points de montage, une partition système EFI et un swap ; et d’annuler ou réinitialiser les modifications préparées. Il ne prend pas en charge LVM, RAID, racines LUKS natives, stockage mappé ou imbriqué, bcache, ZFS ou l’édition de sous-volumes Btrfs. La persistance de session LUKS n’encrypte pas un système de fichiers racine natif.

## Systèmes de fichiers

- Les schémas live peuvent utiliser ext2, ext4, Btrfs, FAT32 ou NTFS si les outils nécessaires sont installés.
- Le système de fichiers racine créé par conversion native peut utiliser ext2, ext4 ou Btrfs. Ext4 est le choix par défaut polyvalent.
- Les systèmes de fichiers ext3 existants peuvent être réutilisés ou réduits si pris en charge, mais ext3 n’est pas proposé pour un nouveau formatage.
- FAT32 est limité aux fichiers de moins de 4 Gio et n’est disponible que pour les schémas live.
- NTFS est disponible uniquement pour les schémas live, bien qu’une partition NTFS éligible puisse être réduite pour un placement à côté.

L’espace requis inclut les données des modules sélectionnés, les éléments de démarrage, la persistance demandée et une réserve de 25 pour cent pour le système de fichiers. L’espace EFI et swap natif sont calculés séparément.

## Configuration et sécurité

L’installateur peut définir la langue, le fuseau horaire, le clavier, le nom d’utilisateur, les mots de passe, les groupes d’utilisateurs, le nom d’hôte, les services, le menu de démarrage et la sélection des modules. La sélection d’un module MiniOS supérieur inclut ses couches inférieures requises.

Les profils de sécurité sont `convenient`, `balanced` et `strict`. Le mode live utilise par défaut `convenient` ; la conversion native commence avec `balanced`. Les contrôles SSH et XRDP sont séparés du profil choisi. Vérifiez les services d’accès à distance avant la première connexion réseau. Après une conversion native, la configuration de sécurité suit le flux de travail habituel d’administration système Debian.

La configuration réseau couvre le nom d’hôte et le DHCP filaire ou une IPv4 statique. L’installateur ne crée ni ne modifie de profils Wi-Fi. La conversion native et certaines opérations à côté peuvent nécessiter un accès réseau, avec votre consentement, pour obtenir GRUB, EFI, initramfs, `os-prober` ou les paquets de redimensionnement de système de fichiers avant toute modification du disque.

## Persistance de session live

La persistance s’applique uniquement aux installations live :

- Le mode de persistance `native` enregistre les modifications de la session live directement sur un système de fichiers cible compatible POSIX. Malgré son nom, il s’agit d’un **backend de persistance live** et cela n’a aucun lien avec l’installation native. Il n’est pas proposé sur FAT32 ou NTFS.
- DynFileFS utilise un conteneur extensible.
- Raw utilise une image de taille fixe.
- LUKS utilise une image chiffrée créée par l’initrd au premier démarrage. La phrase de passe est demandée au démarrage et n’est jamais reçue ni stockée par l’installateur.

Les modes conteneur sont limités par défaut à 4000 Mio. Les conteneurs Raw et LUKS ne peuvent pas dépasser 4000 Mio sur FAT32 ; DynFileFS n’est pas soumis à cette limite de taille de fichier unique. LUKS n’est proposé que si l’initrd en cours d’exécution et chaque initrd source copié annoncent la prise en charge crypto requise.

Les options de démarrage résultantes utilisent `perchmode` et `perchsize`. Consultez [Persistance de l’initrd](/reference/boot-process/Persistence-Internals) et [Paramètres de démarrage](/reference/Boot-Parameters) pour leur signification à l’exécution et les conditions d’activation.

## Déploiement en ligne de commande

`minios-deploy` est destiné à l’automatisation, aux tests et à la récupération. Le partitionnement manuel et la configuration interactive du réseau filaire restent réservés à l’interface graphique.

Listez les disques reconnus comme installables :

```bash
minios-deploy list-disks
```

Remplacez `/dev/sdb` dans chaque exemple par le disque cible vérifié. Commencez par afficher un plan non destructif :

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Prévisualisez les commandes de déploiement correspondantes sans écrire sur le disque :

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

N’effectuez l’installation réelle qu’après avoir vérifié le plan, l’identité de la cible et le résultat du test à blanc. `--yes` autorise les modifications destructrices :

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Si vous souhaitez délibérément une conversion native dans un espace libre existant, utilisez les mêmes options de stockage pour la planification et l’installation :

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversion native peut ne pas apparaître dans l’aide CLI sur une image qui ne prend pas en charge l’installation native. La CLI accepte également des options de configuration pour les comptes, la langue, le fuseau horaire, le clavier, le nom d’hôte, les services et un `config.conf` de base. Vérifiez les options exactes proposées par l’image en cours d’exécution :

```bash
minios-deploy install --help
man minios-deploy
```

Évitez `--password` et `--root-password` dans les environnements partagés, car les arguments en clair de la ligne de commande peuvent être exposés dans l’historique du shell et la liste des processus. Utilisez plutôt l’installateur graphique ou un flux de configuration protégé.
