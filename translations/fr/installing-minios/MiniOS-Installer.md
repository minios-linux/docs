---
updated: 2026-10-06
program_commits:
    minios-installer: ecabe245a5eaff606ce06f034af334b399f4c3b3
---

# Programme d’installation MiniOS

Le Programme d’installation MiniOS est un assistant GTK et un outil en ligne de commande permettant de déployer un système à partir d’une session live MiniOS en cours d’exécution. L’écriture ou la copie de MiniOS sur un support amovible constitue déjà une méthode d’installation ; le Programme d’installation MiniOS est l’outil de déploiement géré à utiliser lorsque vous souhaitez un agencement cible maîtrisé, une configuration de persistance ou une conversion native optionnelle.

## Avant de commencer

Un mauvais choix de cible ou de partitionnement peut entraîner la perte de données. Sauvegardez vos fichiers importants, déconnectez les disques inutiles et identifiez la cible par chemin du périphérique, modèle et capacité. La confirmation finale est le dernier moment où l’installation peut être annulée sans risque.

Le disque contenant le système live MiniOS en cours d’exécution est exclu de la sélection de la cible. Pour des recommandations générales sur la capacité, consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Modes d’installation

**Mode live** copie les modules MiniOS compressés sélectionnés ainsi que les éléments de démarrage. Le résultat reste MiniOS : il conserve l’organisation modulaire du système live, la configuration de démarrage MiniOS, les workflows de gestion MiniOS et, en option, la persistance de session.

**Mode natif** crée un bureau Debian classique à partir de l’image MiniOS sélectionnée. Les modules choisis sont décompressés dans un système de fichiers racine modifiable, l’environnement de bureau et les applications standards sont conservés, le runtime live MiniOS et les utilitaires spécifiques au live sont supprimés, les paquets Debian requis sont installés, un initramfs classique est généré et le chargeur d’amorçage est installé. Le programme d’installation détecte la prise en charge native à partir de l’image démarrée. Si les métadonnées du noyau requises et le contrat d’architecture EFI sont absents, le mode de compatibilité ne permet que l’installation en mode live.

::: warning Le mode natif modifie la gestion du système
Le système installé conserve l’expérience familière du bureau MiniOS — son apparence, l’environnement de bureau choisi et les applications standards — mais il n’utilise plus l’architecture live MiniOS. Lors de la conversion, le programme d’installation supprime les `minios-*` paquets et autres utilitaires spécifiques au live, car les sessions, `.sb` modules, la gestion modulaire du noyau et la configuration de démarrage live ne sont plus utilisés. Après redémarrage, le système se maintient comme un bureau Debian classique avec APT, les paquets noyau Debian, l’initramfs standard et le chargeur d’amorçage installé. Voir [À propos de MiniOS](/getting-started/About-MiniOS).
:::

Ce déploiement diffère d’une écriture ISO brute, d’une configuration multiboot ISO-file Ventoy ou d’une installation live basée sur des fichiers. Voir [Méthodes d’installation](/installing-minios/Installation-Methods) pour la distinction.

## Démarrer le programme d’installation graphique

Ouvrez le menu des applications, sélectionnez Système, puis choisissez le Programme d’installation MiniOS. Il peut également être lancé depuis un terminal :

```bash
sudo minios-installer
```

L’assistant recueille le mode d’installation, la sécurité, la localisation, le réseau filaire, le clavier, le compte utilisateur, les modules, le stockage et les paramètres de démarrage. Vérifiez la géométrie exacte des partitions et le résumé des opérations avant de valider la confirmation finale, qui est destructive.

## Disposition et schémas de démarrage

Le programme d’installation graphique propose les choix de placement suivants lorsque la cible est éligible :

- Effacer tout crée une nouvelle table de partitions et détruit toutes les données du disque cible.
- Espace libre utilise un espace non alloué approprié sans réduire un système de fichiers existant.
- Côte à côte réduit une partition finale ext2, ext3, ext4 ou NTFS éligible et non montée. Les schémas sales, montés, imbriqués, ambigus ou autrement non sûrs sont refusés. Le programme d’installation peut demander confirmation avant de télécharger les outils de gestion de systèmes de fichiers manquants.
- Le partitionnement manuel n’est disponible que pour les conversions natives dans l’interface graphique et uniquement sur des disques directs éligibles. Les modifications sont préparées jusqu’à la confirmation finale.

Les schémas de démarrage automatiques sont BIOS/MBR, UEFI/MBR et UEFI/GPT. UEFI fonctionne avec les schémas GPT ou MBR principal. BIOS est pris en charge sur MBR principal, mais pas sur GPT. Les schémas MBR étendus ou logiques ne sont pas pris en charge.

Le mode manuel permet de créer, supprimer, formater et réutiliser des partitions ; de réduire un système de fichiers pris en charge depuis sa fin ; d’assigner des points de montage, une partition système EFI et du swap ; et d’annuler ou réinitialiser les modifications préparées. Il ne prend pas en charge LVM, RAID, racines LUKS natives, stockage mappé ou imbriqué, bcache, ZFS ni l’édition de sous-volumes Btrfs. Le chiffrement LUKS2 pour une session de persistance live n’applique pas de chiffrement au système de fichiers racine natif.

## Systèmes de fichiers

- Les schémas live peuvent utiliser ext2, ext4, Btrfs, FAT32 ou NTFS lorsque les outils requis sont installés.
- Le système de fichiers racine créé par conversion native peut utiliser ext2, ext4 ou Btrfs. Ext4 est le choix par défaut polyvalent.
- Les systèmes de fichiers ext3 existants peuvent être réutilisés ou réduits si pris en charge, mais ext3 n’est pas proposé pour un nouveau formatage.
- FAT32 est limité aux fichiers de moins de 4 Gio et n’est disponible que pour les schémas live.
- NTFS n’est disponible que pour les schémas live, bien qu’une partition NTFS éligible puisse être réduite pour un placement côte à côte.

L’espace requis inclut les données des modules sélectionnés, les éléments de démarrage, la persistance demandée et une réserve de 25 pour cent du système de fichiers. L’espace EFI et le swap natif sont calculés séparément.

## Configuration et sécurité

Le programme d’installation peut définir la langue, le fuseau horaire, le clavier, le nom d’utilisateur, les mots de passe, les groupes d’utilisateurs, le nom d’hôte, les services, le menu de démarrage et la sélection des modules. Sélectionner un module MiniOS supérieur inclut ses couches inférieures requises.

Les profils de sécurité sont `convenient`, `balanced`, et `strict`. Le mode live utilise par défaut `convenient` ; la conversion native commence avec `balanced`. Les contrôles SSH et XRDP sont indépendants du profil sélectionné. Vérifiez les services d’accès distant avant la première connexion réseau. Après conversion native, la configuration de sécurité suit le processus d’administration système Debian habituel.

La configuration réseau couvre le nom d’hôte et le DHCP filaire ou l’IPv4 statique. Le programme d’installation ne crée ni ne modifie les profils Wi-Fi. La conversion native et certaines opérations côte à côte peuvent nécessiter un accès réseau, avec votre consentement, pour obtenir GRUB, EFI, initramfs, `os-prober`, ou les paquets de redimensionnement de système de fichiers avant toute modification du disque.

## Persistance de session live

La persistance s’applique uniquement aux installations live. Lorsque `minios-session` est disponible, le Programme d’installation MiniOS peut créer et activer une session réelle numérotée directement sur la cible avant la fin de l’installation. **Configuration automatique au premier démarrage** saute cette étape ; MiniOS pourra alors créer le stockage de session ultérieurement via sa logique de persistance au démarrage.

Le programme d’installation propose ces backends de stockage lorsque le système en cours d’exécution et la cible les prennent en charge :

- `native` enregistre les modifications de session live directement dans le dossier de session sur un système de fichiers cible compatible POSIX. Malgré son nom, il s’agit d’un **backend de persistance live** et il n’est pas lié à l’installation native. Il n’est pas proposé sur FAT32 ou NTFS.
- DynFileFS crée un stockage ext4 extensible basé sur un fichier. La taille choisie est la limite logique maximale et non un espace réservé à l’avance. La taille par défaut est de 4000 Mio.
- DynBlk crée un système de fichiers ext4 sur un périphérique bloc fin fourni par le pilote noyau DynBlk. Les données de session sont stockées dans des fichiers `volumeNNN.db` segmentés alloués à la demande, la taille sélectionnée étant une limite logique et non une occupation disque préallouée. Le programme d’installation attribue par défaut 16384 Mio aux nouvelles sessions DynBlk. Pour les sessions DynBlk non chiffrées, il est possible de choisir un codec de compression pris en charge à la fois par le système en cours d’exécution et l’initrd copié sur la cible.
- VMDK utilise le pilote DynBlk pour créer un stockage VMDK standard fractionné et sparse (`volume.vmdk` et `volume-sNNN.vmdk`). Il suit le même modèle d’allocation fine et la taille par défaut de 16384 Mio que DynBlk, mais la compression backend n’est pas disponible.
- Raw crée une image ext4 de taille fixe et réserve immédiatement la capacité sélectionnée. Sa taille par défaut est de 4000 Mio.

LUKS2 est une couche de chiffrement séparée qui peut envelopper un stockage de session Raw, DynFileFS, DynBlk ou VMDK. Le programme d’installation ne collecte la phrase secrète confirmée que lors de la création de la session, l’envoie à `minios-session` via l’entrée standard, sans jamais la placer dans les arguments de ligne de commande, les journaux ou la configuration persistante. La phrase secrète sera ensuite requise pour déverrouiller la session chiffrée au démarrage. LUKS2 n’est proposé que si l’environnement d’exécution et l’initrd cible copié annoncent une compatibilité. La compression DynBlk est désactivée si LUKS2 est sélectionné.

DynBlk et le stockage de session VMDK ne sont pas disponibles lorsque le Secure Boot UEFI est activé, car le module noyau externe DynBlk utilisé par ces backends n’est pas signé par MiniOS. Les conteneurs Raw sont limités à 4000 Mio sur FAT32 ; DynFileFS, DynBlk et le stockage VMDK fractionné ne dépendent pas d’un fichier dépassant la limite de 4 Gio de FAT32, bien que leurs propres limites backend et d’espace libre s’appliquent toujours.

Comme le programme d’installation crée et active la session sélectionnée sur la cible, il ne dépend pas de `perchmode` et `perchsize` pour créer ce stockage au premier démarrage. Ces paramètres de démarrage décrivent toujours la création et la sélection de la persistance pilotée par l’initrd en dehors du chemin de session pré-créée par l’installateur. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence), [Persistance initrd](/reference/boot-process/Persistence-Internals), et [Paramètres de démarrage](/reference/Boot-Parameters).

## Déploiement en ligne de commande

`minios-deploy` est destiné à l’automatisation, aux tests et à la récupération. Le partitionnement manuel et la configuration interactive du réseau filaire restent réservés à l’interface graphique.

Lister les disques reconnus comme installables :

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

N’exécutez l’installation réelle qu’après avoir vérifié le plan, l’identité de la cible et le résultat du test à blanc. `--yes` autorise les modifications destructrices :

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Si vous souhaitez effectuer une conversion native dans un espace libre existant, utilisez les mêmes options de stockage pour la planification et l’installation :

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversion native peut ne pas apparaître dans l’aide CLI sur une image dépourvue de prise en charge native. L’interface CLI accepte aussi les options de configuration pour les comptes, la langue, le fuseau horaire, le clavier, le nom d’hôte, les services et un `config.conf` de base. Vérifiez les options exactes proposées par l’image en cours d’exécution :

```bash
minios-deploy install --help
man minios-deploy
```

Évitez d’utiliser `--password` et `--root-password` dans les environnements partagés, car les arguments de ligne de commande en clair peuvent être exposés dans l’historique du shell et la liste des processus. Utilisez plutôt le programme d’installation graphique ou un processus de configuration protégé.
