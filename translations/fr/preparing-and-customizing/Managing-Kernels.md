---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gestion des noyaux

Le Gestionnaire de noyaux MiniOS gère l’empaquetage, l’inspection, l’activation et la suppression des lots de noyaux pour le système live modulaire MiniOS. Un noyau MiniOS correspond à un ensemble coordonné : l’image du noyau, son initramfs et le module correspondant, `01-kernel-<version>.sb` qui doivent rester groupés.

Ce flux de travail s’applique uniquement à l’architecture live. Une installation native utilise les paquets noyau Debian ou Ubuntu classiques, les outils initramfs habituels et le chargeur d’amorçage installé.

## Fonctionnalités du Gestionnaire de noyaux

L’interface graphique **Gestionnaire de noyaux MiniOS** et l’`minios-kernel` interface CLI utilisent le même backend. Elles permettent de :

- lister les noyaux empaquetés et distinguer les versions en cours d’exécution, actives et inactives ;
- empaqueter un noyau versionné réel à partir des dépôts APT configurés ;
- empaqueter un ensemble cohérent de `.deb` paquets noyau locaux ;
- ajouter en option des pilotes sélectionnés depuis le catalogue DKMS MiniOS lors de l’empaquetage d’un noyau issu d’un dépôt ;
- générer l’initramfs MiniOS correspondant et le module de noyau SquashFS ;
- préparer les lots finalisés dans le dépôt de noyaux MiniOS ;
- activer un lot complet pour le prochain démarrage et mettre à jour la configuration du chargeur d’amorçage pris en charge ;
- supprimer un noyau empaqueté inactif.

Le Gestionnaire de noyaux ne compile pas un arbre source de noyau arbitraire. Si vous devez modifier les entrées de compilation du noyau MiniOS elles-mêmes, utilisez plutôt le flux de travail de compilation à partir des sources MiniOS.

## Démarrer le gestionnaire graphique

Lancez-le depuis le menu des applications MiniOS ou exécutez :

```bash
minios-kernel-manager
```

L’application sépare la gestion des noyaux installés de l’empaquetage. Les noyaux issus des dépôts peuvent être recherchés par nom de paquet ou par version affichée. Les contrôles d’empaquetage sont indisponibles si la racine détectée MiniOS n’est pas accessible en écriture.

Les opérations backend nécessitant des privilèges utilisent PolicyKit. L’outil CLI autonome `minios-kernel` requiert les droits administrateur pour chaque commande, sauf pour l’aide.

## Empaqueter un noyau depuis un dépôt

Sélectionnez **Dépôt** dans la vue d’empaquetage et choisissez un paquet noyau versionné réel, par exemple :

```text
linux-image-6.12.107+deb13-amd64
```

Les métapaquets de suivi comme `linux-image-amd64` ne sont pas acceptés comme source de paquet. Le mode dépôt utilise les sources APT, la configuration de confiance et les listes de paquets du système en cours d’exécution. Les dépendances fractionnées de noyaux versionnés sont résolues automatiquement si la distribution les utilise.

L’interface graphique ne lance pas `apt update` simplement parce que les listes de paquets sont obsolètes. Actualisez-les explicitement si besoin, ou utilisez `--force-update` avec la CLI.

### Ajouter des pilotes DKMS validés

L’empaquetage depuis un dépôt peut ajouter des pilotes sélectionnés à partir du catalogue DKMS MiniOS `01-kernel`. L’interface graphique affiche les choix compatibles pour le noyau sélectionné ; la CLI accepte une option `--dkms-driver` répétable :

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Les pilotes sélectionnés sont compilés dans un overlay/chroot isolé avec les en-têtes correspondants. Le backend vérifie que les modules produits correspondent au noyau cible avant de les inclure et enregistre la provenance du pilote dans le lot sous `/usr/share/minios/kernel-dkms/`.

Il s’agit d’une fonctionnalité de compatibilité validée, et non d’une interface générique DKMS. Les paquets noyau locaux créés manuellement ne permettent pas la sélection de pilotes, car les en-têtes de dépôt correspondants ne peuvent pas être déterminés de façon fiable.

## Empaqueter des paquets noyau locaux

Pour un noyau local, fournissez tous les `.deb` fichiers requis issus de la même compilation du noyau :

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian et Ubuntu peuvent répartir un noyau sur plusieurs paquets. Le backend vérifie que l’image, les modules, la base et les éventuels modules-extra fournis forment une version cohérente, au lieu de combiner silencieusement des révisions non liées.

## Sortie d’empaquetage et compression

L’empaquetage produit l’image du noyau, l’initramfs et le module de noyau SquashFS. Certaines métadonnées du paquet sont conservées dans le module sous `/usr/share/minios/kernel-dpkg/`.

La compression par défaut SquashFS est `zstd`. D’autres méthodes sont proposées uniquement si les outils nécessaires sont disponibles ; les formats actuellement pris en charge incluent `lz4`, `lzo`, `gzip`, `lzma`, `xz`, et `bzip2`.

Si une racine MiniOS accessible en écriture est détectée et que la sortie demandée se trouve ailleurs, le lot finalisé est déplacé de façon atomique vers :

```text
<MiniOS-root>/kernels/<version>/
```

Les téléchargements depuis les dépôts sont des entrées de construction temporaires et sont supprimés après une opération d’empaquetage réussie ou échouée. Les `.deb` fichiers locaux restent sous la responsabilité de l’utilisateur.

## Compatibilité avec la persistance chiffrée

Si l’initramfs MiniOS en cours annonce une persistance LUKS en couches, un noyau de remplacement doit préserver la séquence de démarrage dm-crypt. L’initramfs généré est vérifié pour la prise en charge requise de cryptsetup, le module dm-crypt et le marqueur de capacité crypto MiniOS.

L’empaquetage échoue plutôt que de produire un lot de noyau qui rendrait une session persistante chiffrée non amorçable.

## Activation et suppression des noyaux

La vue de gestion distingue :

- **EN COURS** — le noyau actuellement exécuté lors de ce démarrage ;
- **ACTIF** — le lot complet sélectionné pour le prochain démarrage ;
- **DISPONIBLE** — un autre lot empaqueté dans le dépôt MiniOS.

L’activation nécessite une entrée complète dans le dépôt. Elle prépare l’image du noyau, l’initramfs, le module actif SquashFS, le marqueur de version active et les modifications du chargeur d’amorçage en une seule opération coordonnée. La configuration de GRUB est requise ; la configuration native SYSLINUX est mise à jour si elle est présente. En cas d’échec de l’activation, les fichiers de démarrage préparés sont annulés.

L’activation ne modifie que le prochain démarrage ; elle ne redémarre pas le système en cours. Conservez au moins un lot complet fonctionnel connu jusqu’à ce que le remplacement ait démarré avec succès.

Supprimez uniquement un noyau empaqueté inactif dont vous n’avez plus besoin. N’associez pas manuellement une image de noyau, un initramfs ou un `01-kernel-*.sb` provenant de lots différents.

## Référence en ligne de commande

Commandes courantes :

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Empaqueter depuis un dépôt ou des fichiers locaux :

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Ajoutez `--json` pour une sortie structurée. Utilisez l’aide et le manuel installés pour les options exactes disponibles dans la version en cours d’exécution :

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Organisation du stockage

Le Gestionnaire de noyaux détecte la racine de contenu MiniOS au lieu de supposer un nom de périphérique bloc particulier. Les chemins gérés sont relatifs à cette racine :

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
Le chemin canonique du module d’exécution est `/lib/modules/<version>`. Sur les systèmes usrmerged, cela pointe vers `/usr/lib/modules/<version>` ; les anciens agencements peuvent le stocker physiquement sous `/lib`. L’empaquetage refuse un arbre de modules de même version déjà présent afin d’éviter de le mélanger avec une autre révision du paquet.

## Récupération après un noyau défaillant

Si un noyau nouvellement activé échoue, démarrez un ensemble de noyau complet connu et fonctionnel MiniOS s’il en reste un. N’essayez pas de réparer l’installation en copiant individuellement des fichiers de noyau, initramfs ou SquashFS depuis une autre image : ces fichiers forment un lot coordonné.

S’il ne reste aucun lot complet fonctionnel, démarrez sur un support de secours de confiance, sauvegardez les données importantes, puis réinstallez ou restaurez l’installation MiniOS concernée. Voir [Dépannage](/maintenance-and-recovery/Troubleshooting) et [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentation associée

- [Architecture système MiniOS](/reference/System-Architecture)
- [Chargement des modules initrd](/reference/boot-process/Module-Loading)
- [Compilation de MiniOS](/development/Building-MiniOS)
- [Dépannage](/maintenance-and-recovery/Troubleshooting)
