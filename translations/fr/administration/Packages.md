# Packages et éditions

Le contenu des paquets MiniOS est généré à partir de listes sources conditionnelles. Il varie selon la suite de distribution, l’architecture, le système d’initialisation, l’environnement de bureau, la langue, les options du noyau et la disponibilité des dépôts. Cette page décrit l’héritage des éditions et présente des exemples de contenus représentatifs ; il ne s’agit pas d’une table exhaustive des paquets publiés.

## Héritage des éditions

Les variantes de paquets forment une séquence additive :

1. **Minimum** fournit le système live commun et le plus petit bureau sélectionné.
2. **Standard** hérite de Minimum et ajoute des outils d’administration générale, de gestion du bureau et de MiniOS.
3. **Toolbox** hérite de Standard et ajoute des outils de récupération, de diagnostic, de stockage, de réseau et de virtualisation.
4. **Ultra** hérite de Toolbox et ajoute des logiciels de station de travail, multimédia, bureautique et de conteneurisation plus larges.

Des expressions conditionnelles peuvent sélectionner des alternatives ou omettre un paquet selon la suite, l’architecture, l’environnement ou l’option de compilation. Un paquet cité ci-dessous est donc représentatif des listes sources actuelles, sans garantie que le même nom de paquet binaire Debian existe dans chaque version de MiniOS.

## Portée du bureau et de l’environnement

Les paquets de bureau proviennent de la chaîne de modules ordonnée de l’environnement sélectionné. Les environnements Xfce, Fluxbox, LXQt, core et debug n’ont pas des ensembles de modules ou de paquets identiques. Les exemples ci-dessous utilisent les listes Xfce actuelles sauf si une fonctionnalité provient de la liste core partagée. Une version console ou un autre bureau doit être inspecté séparément.

## Contenus représentatifs

### Minimum

La composition Minimum commune inclut la configuration live MiniOS et les outils d’image, NetworkManager, SSH, la prise en charge du clavier et de la langue, le firmware sélectionné pour la cible, ainsi que des utilitaires pour l’inspection matérielle et les tâches de stockage courantes. Les paquets représentatifs incluent `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` et `wpasupplicant`.

La chaîne Minimum Xfce ajoute Xorg, Blackbox ou Openbox selon la liste source, Thunar, Mousepad, le panneau Xfce, la session, les paramètres, les composants du bureau et du gestionnaire de fenêtres, l’applet NetworkManager pour le bureau, les contrôles ALSA, Xarchiver, la gestion de la batterie, ainsi que Firefox ou Firefox ESR selon la famille de distribution.

Les utilitaires MiniOS présents dans chaque édition, y compris Xfce Minimum, sont `minios-tools`, `minios-image-compose`, `minios-live-config`, l’intégration systemd ou SysV correspondante, `minios-live-config-doc` et `minios-welcome`.

### Standard

Standard ajoute des fonctionnalités partagées telles que la prise en charge DNS, des outils de compression et de fichiers supplémentaires, des clients de systèmes de fichiers réseau, FUSE, le partitionnement et la création d’ISO. Les paquets représentatifs incluent `dnsmasq-base`, `ncdu`, `lsof`, `xfsprogs`, `exfatprogs` ou son alternative spécifique à la suite, `cifs-utils`, `nfs-common`, `parted`, `7zip` et `genisoimage`.

Dans Xfce, les éditions Standard et ultérieures ajoutent les utilitaires graphiques et d’administration MiniOS actuels : `minios-configurator`, `minios-installer`, `minios-session-manager`, `minios-kernel-manager`, `minios-store`, `minios-store-gui`, `minios-image-builder`, `minios-module-manager` et `driveutility`. Elles ajoutent également LightDM, l’intégration audio et Bluetooth du bureau, les captures d’écran, la gestion des tâches, les notifications et le terminal Xfce.

### Toolbox

Toolbox ajoute des fonctionnalités en ligne de commande pour le stockage, la récupération, la performance, le réseau et les machines virtuelles. Les exemples actuels incluent les outils LVM et LUKS, Clonezilla, Partclone, TestDisk, `gddrescue`, les outils ZFS si la compilation le permet, Nmap, iperf3, QEMU, libvirt, les agents invités, fio, sysbench et le rapport matériel.

Le module d’applications Xfce ajoute des outils représentatifs tels que GParted, GSmartControl, Guymager, des utilitaires de secours et de disque, Wireshark, Remmina, Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit et des outils graphiques de chiffrement. Les noms exacts dépendent de la suite ; par exemple, une liste source peut utiliser l’une de plusieurs alternatives de paquets.

### Ultra

Ultra conserve l’ensemble Toolbox et ajoute des logiciels de conteneurisation et de station de travail. Les ajouts partagés représentatifs incluent les paquets Docker sélectionnés pour le dépôt cible, la prise en charge de Compose, `lazydocker`, les outils iSCSI et les utilitaires de gestion des espaces de noms utilisateur. La liste actuelle des applications Xfce ajoute LibreOffice, GIMP, Inkscape, Blender, Audacity, OBS Studio, RawTherapee, Synaptic et les paquets d’intégration de bureau associés.

## Inspecter le contenu exact d’une version

Le système en cours d’exécution fait autorité pour les paquets effectivement installés dans cette version. Listez les noms et versions des paquets avec :

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Inspectez séparément les modules ordonnés composant la racine en cours d’exécution et les fichiers sélectionnés pour le prochain démarrage. Le gestionnaire de modules MiniOS les présente comme **En cours d’exécution** et **Prochain démarrage**. Depuis un terminal, les montages SquashFS actifs peuvent être listés avec :

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Pour un support hors ligne ou une image ISO montée, inventoriez directement les fichiers de modules sources :

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Pour une compilation source, les fichiers et répertoires suivants sont les manifestes sources et entrées de sélection faisant foi :

- `linux-live/environments/<environment>/` pour la chaîne de modules ordonnée.
- `linux-live/scripts/00-core/packages.list` pour la sélection partagée des éditions.
- `linux-live/scripts/01-kernel/packages.list` et `02-firmware/packages.list` pour les ajouts conditionnels au noyau et au firmware.
- `packages.list` de chaque module de bureau et d’application sélectionné.
- `linux-live/build.conf` pour les valeurs de filtre de suite, architecture, environnement, variante de paquet, système d’initialisation, noyau, langue, etc.
- `linux-live/condinapt.map` pour la signification des préfixes de filtre dans les listes de paquets.

Les listes sources décrivent les paquets demandés et les alternatives. Seule l’image finalisée et `dpkg-query` montrent l’ensemble exact des dépendances résolues et leurs versions pour une version donnée. La disponibilité et les noms des paquets peuvent changer entre les suites Debian, Ubuntu et Devuan, ainsi qu’entre les environnements de bureau.

Voir [Architecture système](/about/System-Architecture.md) pour l’ordre des modules et [CondinAPT dans MiniOS](/development/CondinAPT-MiniOS.md) pour la sélection conditionnelle des paquets.
