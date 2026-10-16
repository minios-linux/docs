---
updated: 2026-10-15
program_commits:
    minios-installer: e895f8065faef84356f9c1cda4dbfa97700b0370
---

# Programme d’installation MiniOS

Le Programme d’installation MiniOS est un assistant GTK et un outil en ligne de commande permettant de déployer un système depuis une session live MiniOS. Écrire ou copier MiniOS sur un support amovible est déjà une méthode d’installation ; le Programme d’installation MiniOS est l’outil de déploiement géré à utiliser lorsque vous souhaitez contrôler la disposition de la cible, configurer la persistance ou effectuer une conversion native facultative.

## Avant de commencer

Un mauvais choix de cible ou de partitionnement peut entraîner une perte de données. Sauvegardez les fichiers importants, déconnectez les disques inutiles et identifiez la cible à l’aide de son chemin de périphérique, de son modèle et de sa capacité. La confirmation finale est le dernier moment où l’installation peut être annulée sans risque.

Le disque contenant le système live MiniOS en cours d’exécution est exclu de la sélection de la cible. Pour des conseils généraux sur la capacité, consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility).

## Modes d’installation

**Mode live** copie les modules compressés MiniOS sélectionnés et les fichiers d’amorçage. Le résultat reste MiniOS : il conserve la structure modulaire du système live, la configuration d’amorçage MiniOS, les procédures de gestion MiniOS et la persistance de session facultative.

**Mode natif** crée un environnement de bureau Debian classique à partir de l’image MiniOS sélectionnée. Il décompresse les modules sélectionnés dans un système de fichiers racine inscriptible, conserve l’environnement de bureau choisi et les applications courantes, supprime l’environnement d’exécution live MiniOS et les utilitaires propres au mode live, installe les paquets Debian requis, génère un initramfs classique et installe le chargeur d’amorçage. Le programme d’installation détecte la prise en charge du mode natif à partir de l’image démarrée. Si les métadonnées requises du noyau et les paramètres d’architecture EFI sont absents, le mode de compatibilité autorise uniquement l’installation live.

::: warning Le mode natif modifie la gestion du système
Le système installé conserve l’expérience de bureau familière MiniOS — son apparence, l’environnement de bureau choisi et les applications courantes — mais n’utilise plus l’architecture live MiniOS. Lors de la conversion, le programme d’installation supprime les `minios-*` paquets et autres utilitaires propres au mode live, car les sessions, `.sb` modules, la gestion modulaire du noyau et la configuration d’amorçage live ne sont plus utilisés. Après le redémarrage, gérez le système comme un environnement de bureau Debian classique, avec APT, les paquets du noyau Debian, l’initramfs standard et le chargeur d’amorçage installé. Consultez [À propos de MiniOS](/getting-started/About-MiniOS).
:::

Ce déploiement diffère de l’écriture brute d’une image ISO, d’une configuration multiboot à partir de fichiers ISO avec Ventoy ou d’une installation live basée sur des fichiers. Consultez [Méthodes d’installation](/installing-minios/Installation-Methods) pour comprendre la différence.

## Lancer le programme d’installation graphique

Ouvrez le Programme d’installation MiniOS depuis la catégorie **MiniOS** du menu des applications. Vous pouvez également le lancer depuis un terminal ; il demandera une autorisation administrateur si nécessaire :

```bash
minios-installer
```

L’assistant recueille les paramètres du mode d’installation, de sécurité, de localisation, du réseau filaire, du clavier, du compte, des modules, du stockage et de l’amorçage. Vérifiez précisément la disposition des partitions et le récapitulatif des opérations avant de valider la confirmation finale, qui entraîne des modifications irréversibles.

## Options d’installation et configurations de démarrage

L’installateur graphique propose les options d’installation suivantes lorsque la cible est compatible :

- L’option « Tout effacer » crée une nouvelle table de partitions et détruit toutes les données du disque cible.
- L’option « Espace libre » utilise l’espace non alloué disponible sans réduire un système de fichiers existant.
- L’option « À côté » réduit une partition ext2, ext3, ext4 ou NTFS compatible, non montée et située en fin de disque. Les configurations avec des erreurs, montées, imbriquées, ambiguës ou présentant d’autres risques ne sont pas prises en charge. L’installateur peut demander votre autorisation avant de télécharger les outils de système de fichiers manquants.
- Le partitionnement manuel est disponible uniquement pour les conversions natives dans l’interface graphique, sur les disques directs compatibles. Les modifications sont mises en attente jusqu’à la confirmation finale.

Les configurations de démarrage automatiques sont BIOS/MBR, UEFI/MBR et UEFI/GPT. UEFI fonctionne avec GPT ou avec des configurations MBR utilisant des partitions principales. BIOS est pris en charge avec les partitions principales MBR, mais pas avec GPT. Les configurations MBR à conserver avec des partitions étendues ou logiques ne sont pas prises en charge.

Pour **Tout effacer** en mode Live, **Automatique** sélectionne MBR même si l’installateur est lancé en mode UEFI. Les cibles Live en MBR conservent les fichiers EFI et reçoivent un chargeur de démarrage BIOS, ce qui leur permet de prendre en charge les deux modes de démarrage. Les disques de 2 Tio ou plus nécessitent de choisir explicitement **UEFI/GPT** ; les cibles Live en GPT sont réservées à UEFI. L’option native « Tout effacer » suit une stratégie distincte, qui dépend du micrologiciel. Les installations dans l’espace libre ou à côté conservent la table de partitions existante.

Le mode manuel permet de créer, supprimer, formater et réutiliser des partitions ; de réduire un système de fichiers pris en charge à partir de sa fin ; d’attribuer des points de montage, une partition système EFI et une partition d’échange ; et d’annuler ou de réinitialiser les modifications en attente. Il ne prend pas en charge LVM, RAID, les partitions racine natives LUKS, le stockage mappé ou imbriqué, bcache, ZFS ni la modification des sous-volumes Btrfs. Le chiffrement LUKS2 d’une session Live avec persistance ne chiffre pas un système de fichiers racine natif.

## Systèmes de fichiers

- Les systèmes live peuvent utiliser ext2, ext4, Btrfs, FAT32 ou NTFS si les outils requis sont installés.
- Le système de fichiers racine créé par conversion native peut utiliser ext2, ext4 ou Btrfs. Ext4 est le choix général par défaut.
- Les systèmes de fichiers ext3 existants peuvent être réutilisés ou réduits lorsque cela est possible, mais ext3 n’est pas proposé pour un nouveau formatage.
- FAT32 ne permet pas de stocker des fichiers de 4 Gio ou plus et est disponible uniquement pour les systèmes live.
- NTFS est disponible uniquement pour les systèmes live, mais une partition NTFS compatible peut être réduite pour une installation en parallèle.

L’espace requis comprend les données des modules sélectionnés, les fichiers de démarrage, l’espace de persistance demandé et une réserve de 25 % pour le système de fichiers. L’espace EFI et celui du swap natif sont calculés séparément.

## Configuration et sécurité

L’installateur permet de définir la langue, le fuseau horaire, le clavier, le nom d’utilisateur, les mots de passe, les groupes d’utilisateurs, le nom d’hôte, les services, le menu de démarrage et la sélection des modules. La sélection d’une couche système supérieure inclut les couches système inférieures requises. Les modules personnalisés provenant de `minios/modules/` sont sélectionnés indépendamment, même lorsque leurs noms de fichier ressemblent à ceux de modules système ou de noyau.

Les profils de sécurité sont `convenient`, `balanced` et `strict`. En mode live, la valeur par défaut est `convenient` ; la conversion native démarre à partir de `balanced`. Les paramètres SSH et XRDP sont indépendants du profil sélectionné. Vérifiez les services d’accès à distance avant la première connexion réseau. Après la conversion native, la configuration de sécurité suit le processus habituel d’administration d’un système Debian.

La configuration réseau comprend le nom d’hôte et la configuration filaire en DHCP ou en IPv4 statique. L’installateur ne crée ni ne modifie les profils Wi-Fi. La conversion native et certaines opérations en parallèle peuvent nécessiter un accès réseau, avec votre consentement, pour obtenir les paquets GRUB, EFI, initramfs, `os-prober`, ou de redimensionnement du système de fichiers avant toute modification du disque.

## Persistance des sessions live

La persistance s’applique uniquement aux installations live. Lorsque `minios-session` est disponible, le Programme d’installation MiniOS peut créer et activer une véritable session numérotée directement sur la cible avant la fin de l’installation. **La configuration automatique au premier démarrage** ignore cette étape ; MiniOS peut alors créer ultérieurement le stockage de session grâce à son mécanisme habituel de persistance au démarrage.

Le programme d’installation propose les systèmes de stockage suivants lorsque le système en cours d’exécution et la cible les prennent en charge :

- `native` stocke les modifications de la session live directement dans le répertoire de session d’un système de fichiers cible compatible POSIX. Malgré son nom, il s’agit d’un système de persistance**backend de persistance en temps réel** sans rapport avec une installation native. Il n’est pas proposé sur FAT32 ni sur NTFS.
- DynFileFS crée un stockage ext4 extensible basé sur des fichiers. La taille sélectionnée correspond à la limite logique maximale, et non à l’espace réservé à l’avance. La taille par défaut est de 4000 MiB.
- DynBlk crée un système de fichiers ext4 sur un périphérique bloc à allocation dynamique fourni par le pilote de noyau DynBlk. Les données de session sont stockées dans des fichiers segmentés `volumeNNN.db` alloués à mesure des besoins. La taille sélectionnée correspond donc à une limite logique maximale, et non à l’espace disque préalloué. Par défaut, le programme d’installation définit la taille des nouvelles sessions DynBlk sur 16384 MiB. Pour les sessions DynBlk non chiffrées, le programme d’installation peut sélectionner un codec de compression pris en charge à la fois par le système en cours d’exécution et par l’initrd copié sur la cible.
- VMDK utilise le pilote DynBlk pour créer un stockage VMDK sparse standard fractionné (`volume.vmdk` et `volume-sNNN.vmdk`). Il utilise le même modèle d’allocation dynamique et la même taille par défaut de 16384 MiB que DynBlk, mais la compression par le système de stockage n’est pas disponible.
- Raw crée une image ext4 de taille fixe et réserve immédiatement la capacité sélectionnée. La taille par défaut est de 4000 MiB.

LUKS2 est une couche de chiffrement distincte qui peut encapsuler le stockage de session Raw, DynFileFS, DynBlk ou VMDK. Le programme d’installation recueille la phrase secrète confirmée uniquement lors de la création de la session, puis la transmet à `minios-session` via l’entrée standard ; elle n’est pas incluse dans les arguments de ligne de commande, les journaux ni la configuration persistante. La phrase secrète sera ensuite nécessaire pour déverrouiller la session chiffrée au démarrage. LUKS2 est proposé uniquement si l’environnement en cours d’exécution et l’initrd copié sur la cible indiquent tous deux une prise en charge compatible. La compression DynBlk est désactivée lorsque LUKS2 est sélectionné.

Le stockage de session DynBlk et VMDK n’est pas disponible lorsque UEFI Secure Boot est activé, car le module de noyau externe DynBlk utilisé par ces systèmes de stockage n’est pas signé par MiniOS. Sur FAT32, la taille des conteneurs Raw est limitée à 4000 MiB ; DynFileFS, DynBlk et le stockage VMDK fractionné ne nécessitent pas qu’un seul fichier dépasse la limite de 4 GiB de FAT32, mais restent soumis aux limites propres à leur système de stockage et à l’espace libre disponible.

Comme le programme d’installation crée et active la session sélectionnée sur la cible, il ne dépend pas de `perchmode` ni de `perchsize` pour créer ce stockage au premier démarrage. Ces paramètres de démarrage décrivent toujours la création et la sélection de la persistance pilotées par l’initrd, en dehors du processus de création préalable de session par le programme d’installation. Voir [Gestion des sessions](/using-minios/Sessions-and-Persistence), [Persistance de l’initrd](/reference/boot-process/Persistence-Internals) et [Paramètres de démarrage](/reference/Boot-Parameters).

<a id="command-line-deployment"></a>

## Déploiement en ligne de commande

`minios-deploy` est destiné à l’automatisation, aux tests et à la récupération du système. Le partitionnement manuel et la configuration interactive d’un réseau filaire sont réservés à l’interface graphique.

Afficher la liste des disques reconnus comme pouvant recevoir une installation :

```bash
minios-deploy list-disks
```

Remplacez `/dev/sdb` dans chaque exemple par le disque cible vérifié. Commencez par afficher un plan sans effet sur le système :

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

Ne lancez l’installation réelle qu’après avoir vérifié le plan, l’identité de la cible et le résultat de l’exécution à blanc. `--yes` autorise les modifications destructives :

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Si vous souhaitez délibérément effectuer une conversion native dans l’espace libre existant, utilisez les mêmes options de stockage pour la planification et l’installation :

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversion native peut ne pas apparaître dans l’aide de l’interface en ligne de commande si l’image ne prend pas en charge l’installation native. L’interface en ligne de commande accepte également des options de configuration pour les comptes, la langue, le fuseau horaire, le clavier, le nom d’hôte, les services et une base `config.conf`. Vérifiez les options exactes proposées par l’image en cours d’exécution :

```bash
minios-deploy install --help
man minios-deploy
```

Évitez `--password` et `--root-password` dans les environnements partagés, car les arguments de commande en clair peuvent être exposés dans l’historique du shell et la liste des processus. Utilisez plutôt l’installateur graphique ou une procédure de configuration protégée.
