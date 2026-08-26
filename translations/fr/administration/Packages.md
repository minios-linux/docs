---
updated: 2026-08-26
---

# Packages et éditions

Le contenu des paquets MiniOS est généré à partir de listes sources conditionnelles. Il varie selon la suite de distribution, l’architecture, le système d’initialisation, l’environnement de bureau, la langue, les options du noyau et la disponibilité des dépôts. Cette page décrit l’héritage des éditions et présente des exemples de contenus représentatifs ; il ne s’agit pas d’une table exhaustive des paquets publiés.

## Héritage des éditions

Les éditions publiques forment une séquence additive :

1. **Flux** fournit le système live commun et l'environnement Flux léger.
2. **Standard** hérite de la base de paquets commune et ajoute des outils généraux d'administration, de gestion du bureau et de MiniOS.
3. **Toolbox** hérite de Standard et ajoute des outils de récupération, de diagnostic, de stockage, de réseau et de virtualisation.
4. **Ultra** hérite de Toolbox et ajoute des logiciels plus larges pour station de travail, multimédia, bureautique et conteneurs.

Des expressions conditionnelles peuvent sélectionner des alternatives ou omettre un paquet selon la suite, l'architecture, l'environnement ou l'option de compilation. Un paquet cité ci-dessous est donc représentatif des listes de sources actuelles, sans garantir que le même nom de paquet binaire Debian existe dans chaque version de MiniOS.

## Portée du bureau et de l’environnement

Les paquets de bureau proviennent de la chaîne de modules ordonnée de l’environnement sélectionné. Les environnements Xfce, Fluxbox, LXQt, core et debug n’ont pas des ensembles de modules ou de paquets identiques. Les exemples ci-dessous utilisent les listes Xfce actuelles sauf si une fonctionnalité provient de la liste core partagée. Une version console ou un autre bureau doit être inspecté séparément.

## Contenus représentatifs

### Flux

La composition commune Flux inclut la configuration live MiniOS et les outils d'image, NetworkManager, SSH, la prise en charge du clavier et de la langue, le firmware sélectionné pour la cible, ainsi que des utilitaires pour l'inspection du matériel et les tâches courantes de stockage.
Les paquets représentatifs incluent `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` et `wpasupplicant`.

La chaîne de bureau Flux ajoute Fluxbox et les outils associés sélectionnés par les listes de sources. Elle n'inclut pas l'ensemble complet des applications Xfce et de l'interface graphique MiniOS décrites dans Standard.

Les utilitaires MiniOS présents dans chaque édition, y compris Flux, sont `minios-tools`, `minios-image-compose`, `minios-live-config`, l'intégration correspondante systemd ou SysV init, `minios-live-config-doc` et `minios-welcome`.

### Standard

Standard ajoute des fonctionnalités partagées telles que la prise en charge DNS, des outils de compression et de fichiers supplémentaires, des clients de systèmes de fichiers réseau, FUSE, le partitionnement et la création d’ISO. Les paquets représentatifs incluent `dnsmasq-base`, `ncdu`, `lsof`, `xfsprogs`, `exfatprogs` ou son alternative spécifique à la suite, `cifs-utils`, `nfs-common`, `parted`, `7zip` et `genisoimage`.

Dans Xfce, les éditions Standard et ultérieures ajoutent les utilitaires graphiques et d’administration MiniOS actuels : `minios-configurator`, `minios-installer`, `minios-session-manager`, `minios-kernel-manager`, `minios-store`, `minios-store-gui`, `minios-image-builder`, `minios-module-manager` et `driveutility`. Elles ajoutent également LightDM, l’intégration audio et Bluetooth du bureau, les captures d’écran, la gestion des tâches, les notifications et le terminal Xfce.

### Toolbox

Toolbox ajoute des fonctionnalités en ligne de commande pour le stockage, la récupération, la performance, le réseau et les machines virtuelles. Les exemples actuels incluent les outils LVM et LUKS, Clonezilla, Partclone, TestDisk, `gddrescue`, les outils ZFS si la compilation le permet, Nmap, iperf3, QEMU, libvirt, les agents invités, fio, sysbench et le rapport matériel.

Le module d’applications Xfce ajoute des outils représentatifs tels que GParted, GSmartControl, Guymager, des utilitaires de secours et de disque, Wireshark, Remmina, Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit et des outils graphiques de chiffrement. Les noms exacts dépendent de la suite ; par exemple, une liste source peut utiliser l’une de plusieurs alternatives de paquets.

### Ultra

Ultra conserve l’ensemble Toolbox et ajoute des logiciels de conteneurisation et de station de travail. Les ajouts partagés représentatifs incluent les paquets Docker sélectionnés pour le dépôt cible, la prise en charge de Compose, `lazydocker`, les outils iSCSI et les utilitaires de gestion des espaces de noms utilisateur. La liste actuelle des applications Xfce ajoute LibreOffice, GIMP, Inkscape, Blender, Audacity, OBS Studio, RawTherapee, Synaptic et les paquets d’intégration de bureau associés.

## Inspecter le contenu exact de la version

Le système en cours d'exécution fait autorité pour les paquets réellement installés dans cette version. Listez les noms et versions des paquets avec :

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Inspectez séparément les modules ordonnés composant la racine active du système et les fichiers sélectionnés pour le prochain démarrage. Le gestionnaire de modules MiniOS les présente comme **En cours d'exécution** et **Prochain démarrage**. Depuis un shell, les montages SquashFS en cours peuvent être listés avec :

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Pour un support hors ligne ou une ISO montée, inventoriez directement les fichiers de modules sources :

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Pour une compilation à partir des sources, les fichiers et répertoires suivants constituent les manifestes sources de référence et les entrées de sélection :

- `linux-live/environments/<environment>/` pour la chaîne de modules ordonnée.
- `linux-live/scripts/00-core/packages.list` pour la sélection partagée d'édition.
- `linux-live/scripts/01-kernel/packages.list` et `02-firmware/packages.list` pour les ajouts conditionnels de noyau et de firmware.
- `packages.list` de chaque module bureau ou application sélectionné.
- `linux-live/build.conf` pour la suite, l'architecture, l'environnement, la variante de paquet, le système d'init, le noyau, la langue et d'autres valeurs de filtrage.
- `linux-live/condinapt.map` pour la signification des préfixes de filtre de liste de paquets.

Les listes de sources décrivent les paquets demandés et les alternatives. Seule l'image finalisée et `dpkg-query` montrent l'ensemble exact des dépendances résolues et les versions pour une version donnée. La disponibilité et les noms des paquets peuvent varier entre les suites Debian, Ubuntu et Devuan, ainsi qu'entre environnements de bureau.

Le système de compilation source nomme sa plus petite variante de paquet `minimum`. Il s'agit d'une valeur interne `PACKAGE_VARIANT` utilisée par les filtres CondinAPT, et non du nom d'une édition MiniOS publiée. L'édition publiée construite à partir de cette variante de paquet et de l'environnement Flux est **Flux**.

Voir [Architecture système](/about/System-Architecture.md) pour l'ordre des modules et [CondinAPT dans MiniOS](/development/CondinAPT-MiniOS.md) pour la sélection conditionnelle des paquets.
