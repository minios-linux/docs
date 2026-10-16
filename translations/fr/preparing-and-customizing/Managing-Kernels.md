---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gestion des noyaux

MiniOS Gestionnaire de noyaux empaquette, inspecte, active et supprime des ensembles de noyaux pour le système live modulaire MiniOS. Un noyau MiniOS est un ensemble coordonné : l’image du noyau, son initramfs et le module correspondant`01-kernel-<version>.sb` doivent rester ensemble.

Ce processus s’applique uniquement à l’architecture live. Une installation native utilise les paquets de noyau Debian ou Ubuntu classiques, les outils initramfs habituels et le chargeur d’amorçage installé.

## Fonctionnement de Kernel Manager

L’interface graphique **Gestionnaire de noyaux MiniOS** et la `minios-kernel` CLI utilisent le même backend. Elles permettent de :

- lister les noyaux empaquetés et distinguer les versions en cours d’exécution, actives et inactives ;
- empaqueter un noyau réel avec une version précise depuis les dépôts APT configurés ;
- empaqueter un ensemble cohérent de fichiers locaux du noyau `.deb` ;
- ajouter éventuellement des pilotes sélectionnés dans le catalogue DKMS MiniOS organisé lors de l’empaquetage d’un noyau provenant d’un dépôt ;
- générer l’initramfs MiniOS correspondant et le module de noyau SquashFS ;
- placer les ensembles terminés dans le dépôt de noyaux MiniOS ;
- activer un ensemble complet pour le prochain démarrage et mettre à jour la configuration du chargeur d’amorçage pris en charge ;
- supprimer un noyau empaqueté inactif.

Kernel Manager ne compile pas d’arborescence source de noyau arbitraire. Pour modifier les paramètres de compilation du noyau MiniOS eux-mêmes, utilisez plutôt le processus de compilation à partir des sources MiniOS.

## Lancer le gestionnaire graphique

Lancez-le depuis le menu des applications MiniOS ou exécutez :

```bash
minios-kernel-manager
```

L’application distingue la gestion des noyaux installés de leur empaquetage. Vous pouvez rechercher des noyaux dans les dépôts par nom de paquet ou afficher leur version. Les commandes d’empaquetage sont indisponibles si la racine MiniOS détectée n’est pas accessible en écriture.

Les opérations privilégiées du backend utilisent PolicyKit. La `minios-kernel` CLI autonome nécessite les droits root pour toutes les commandes, sauf l’aide.

## Empaqueter un noyau provenant d’un dépôt

Choisissez **Dépôt** dans la vue d’empaquetage, puis sélectionnez un véritable paquet de noyau avec une version précise, par exemple :

```text
linux-image-6.12.107+deb13-amd64
```

Les métapaquets de suivi tels que `linux-image-amd64` ne sont pas acceptés comme source du paquet. Le mode dépôt utilise les sources APT configurées sur le système, la configuration de confiance et les listes de paquets. Les dépendances de noyau fractionnées correspondant à la version sont résolues automatiquement lorsque la distribution les utilise.

L’interface graphique n’exécute pas `apt update` simplement parce que les listes de paquets sont anciennes. Actualisez-les explicitement si nécessaire ou utilisez `--force-update` avec l’interface en ligne de commande.

### Ajouter des pilotes DKMS sélectionnés

Le conditionnement du dépôt peut ajouter des pilotes sélectionnés du MiniOS `01-kernel` catalogue DKMS. L’interface graphique affiche les options compatibles avec le noyau sélectionné ; l’interface en ligne de commande accepte une option `--dkms-driver` répétable :

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Les pilotes sélectionnés sont compilés dans un overlay/chroot isolé avec les en-têtes correspondants. Le backend vérifie que les modules générés correspondent au noyau cible avant de les inclure et consigne la provenance des pilotes dans le bundle, sous `/usr/share/minios/kernel-dkms/`.

Il s’agit d’une fonctionnalité de compatibilité avec une sélection de pilotes, et non d’une interface DKMS générique. Les paquets de noyau locaux installés manuellement ne permettent pas de sélectionner des pilotes, car il est impossible de déterminer de manière fiable quels en-têtes de dépôt leur correspondent.

## Conditionner des paquets de noyau locaux

Pour un noyau local, fournissez tous les fichiers `.deb` requis issus de la même compilation du noyau :

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian et Ubuntu peuvent répartir un noyau entre plusieurs paquets. Le backend vérifie que les paquets fournis — image, modules, base et, facultativement, modules-extra — correspondent à une même version cohérente, plutôt que de combiner silencieusement des révisions sans rapport.

## Résultat du conditionnement et compression

Le conditionnement produit l’image du noyau, l’initramfs et le module noyau SquashFS. Les métadonnées sélectionnées du paquet sont conservées dans le module, sous `/usr/share/minios/kernel-dpkg/`.

 La compression SquashFS par défaut est `zstd`. Les autres méthodes ne sont proposées que si les outils requis sont disponibles ; les méthodes actuellement prises en charge sont `lz4`, `lzo`, `gzip`, `lzma`, `xz` et `bzip2`.

Lorsqu’un système de fichiers MiniOS accessible en écriture est détecté et que le fichier de sortie demandé se trouve ailleurs, le bundle final est transféré de manière atomique vers :

```text
<MiniOS-root>/kernels/<version>/
```

Les téléchargements depuis les dépôts sont des fichiers temporaires utilisés pour la compilation ; ils sont supprimés une fois le conditionnement terminé ou après une erreur prise en charge. Les fichiers locaux `.deb` restent sous la responsabilité de l’appelant.

## Compatibilité avec le stockage persistant chiffré

Si l’MiniOS initramfs en cours d’exécution annonce la prise en charge du stockage persistant LUKS en couches, le noyau de remplacement doit préserver le chemin de démarrage dm-crypt. L’initramfs généré est vérifié pour s’assurer qu’il prend en charge cryptsetup, qu’il inclut le module dm-crypt et qu’il possède le marqueur de capacité de chiffrement MiniOS.

Le conditionnement échoue plutôt que de produire un bundle de noyau qui empêcherait le démarrage d’une session avec stockage persistant chiffré.

## Activer et supprimer des noyaux

La vue de gestion distingue les états suivants :

- **EN COURS D’EXÉCUTION** — le noyau utilisé lors du démarrage actuel ;
- **ACTIF** — le bundle complet sélectionné pour le prochain démarrage ;
- **DISPONIBLE** — un autre bundle empaqueté dans le dépôt MiniOS.

L’activation nécessite une entrée complète dans le dépôt. Elle prépare l’image du noyau, l’initramfs, le module SquashFS actif, le marqueur de version active et les modifications du chargeur d’amorçage dans le cadre d’une opération coordonnée. La configuration GRUB est requise ; la configuration native SYSLINUX est mise à jour si elle est présente. En cas d’échec de l’activation, les fichiers d’amorçage préparés sont restaurés.

L’activation ne modifie que le prochain démarrage ; elle ne redémarre pas le système en cours. Conservez au moins un bundle complet dont le bon fonctionnement est connu jusqu’à ce que le remplacement ait démarré correctement.

Ne supprimez qu’un noyau empaqueté inactif dont vous n’avez plus besoin. Ne mélangez pas manuellement une image de noyau, un initramfs ou `01-kernel-*.sb` provenant de bundles différents.

<a id="command-line-reference"></a>

## Référence des commandes

Voici quelques commandes courantes :

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Installer un package depuis un dépôt ou des fichiers locaux :

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Ajouter `--json` pour obtenir une sortie structurée. Consultez l’aide et le manuel installés pour connaître les options exactes disponibles dans la version en cours d’exécution :

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Organisation du stockage

Kernel Manager détecte la racine de contenu MiniOS au lieu de supposer un nom particulier pour le périphérique bloc. Les chemins gérés sont relatifs à cette racine :

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
Le chemin canonique du module utilisé à l’exécution est `/lib/modules/<version>`. Sur les systèmes usrmerged, il pointe vers `/usr/lib/modules/<version>` ; les anciennes organisations peuvent le stocker physiquement sous `/lib`. L’empaquetage refuse un arbre de modules déjà présent pour la même version, plutôt que de le mélanger à une révision différente du package.

## Récupération après un problème de noyau

Si un noyau nouvellement activé ne fonctionne pas, démarrez avec un ensemble complet de noyau MiniOS dont le bon fonctionnement est connu, s’il en reste un. Ne réparez pas l’installation en copiant des fichiers de noyau, d’initramfs ou SquashFS isolés depuis une autre image : ces fichiers constituent un bundle coordonné.

S’il ne reste aucun bundle complet dont le bon fonctionnement est connu, démarrez depuis un support de secours de confiance, sauvegardez les données importantes, puis réinstallez ou restaurez l’installation MiniOS concernée. Consultez la section [Dépannage](/maintenance-and-recovery/Troubleshooting) et [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentation associée

- [Architecture du système MiniOS](/reference/System-Architecture)
- [Chargement des modules initrd](/reference/boot-process/Module-Loading)
- [Compilation de MiniOS](/development/Building-MiniOS)
- [Résolution des problèmes](/maintenance-and-recovery/Troubleshooting)
