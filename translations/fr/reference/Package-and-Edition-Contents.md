---
updated: 2026-10-15
---

# Contenu des paquets et des éditions

Le contenu des paquets MiniOS est généré à partir de listes de sources conditionnelles. L’ensemble final dépend de la suite de distribution, de l’architecture, du système d’init, de l’environnement de bureau, de la langue, des options du noyau et de la disponibilité des dépôts. Cette page répertorie les paquets destinés aux utilisateurs, requis par les manifestes Flux et Xfce maintenus. Elle exclut les chaînes d’outils nécessaires uniquement à la compilation et les dépendances installées par APT.

`Yes` indique que le manifeste actuel demande le paquet pour cette édition.
`Conditional` indique que le nom ou l’inclusion du paquet dépend d’une option de compilation ou de la plateforme cible. Un tiret indique que l’édition ne le demande pas.
L’image finale fait foi.

## Organisation des éditions

Les éditions Xfce maintenues s’appuient les unes sur les autres : Standard est un environnement de bureau compact pour les tâches courantes, Toolbox vise l’administration système professionnelle, le diagnostic et la récupération, tandis qu’Ultra transforme cette base en un environnement complet pour le travail général, la création et le développement. Flux est une configuration Fluxbox distincte et ultralégère, conçue pour limiter l’utilisation des ressources et fonctionner sur du matériel ancien ; sa liste de paquets Xfce n’est pas simplement réduite.

| Édition | Variante de paquet et environnement | Usage principal |
|---|---|---|
| **Standard** | `standard` avec `xfce` | Environnement Xfce minimal pour les tâches courantes, avec les fonctions de base |
| **Toolbox** | `toolbox` avec `xfce` | Administration système professionnelle, diagnostic et récupération |
| **Ultra** | `ultra` avec `xfce` | Environnement de bureau complet pour le travail général, la création et le développement |
| **Flux** | `minimum` avec `flux` | Environnement Fluxbox ultraléger, conçu pour limiter l’utilisation des ressources et fonctionner sur du matériel ancien |

Les autres environnements pris en charge ont leurs propres chaînes de modules et doivent être vérifiés séparément. En particulier, ne déduisez pas la disponibilité des paquets dans une compilation LXQt ou console à partir des tableaux Xfce ci-dessous.

## Paquets système et MiniOS essentiels

Ces paquets fournissent l’environnement d’exécution du système live, la configuration, la localisation, la gestion des privilèges et un environnement en ligne de commande de base.

| Paquet | Flux | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Oui | Oui | Oui | Oui | Création, conversion, inspection et activation de modules, et capture des modifications |
| `minios-image-compose` | - | Oui | Oui | Oui | Composition d’images ISO en ligne de commande avec MiniOS |
| `minios-deploy`, `minios-kernel`, `minios-session` | - | Oui | Oui | Oui | Outils de déploiement, noyau et gestion des sessions en ligne de commande, indépendamment des applications graphiques |
| `minios-live-config` | Oui | Oui | Oui | Oui | Composants de configuration de la session live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Intégration au système d’init ; une seule implémentation est sélectionnée |
| `minios-live-config-doc` | Oui | Oui | Oui | Oui | Référence live-config installée |
| `minios-welcome` | Oui | Oui | Oui | Oui | Page d’accueil et lanceur MiniOS |
| `user-setup` | Oui | Oui | Oui | Oui | Configuration du compte utilisateur live |
| `linux-base` | Oui | Oui | Oui | Oui | Image Linux et scripts système communs |
| `kbd`, `keyboard-configuration`, `console-setup` | Oui | Oui | Oui | Oui | Configuration du clavier et de l’affichage en console |
| `locales` | Oui | Oui | Oui | Oui | Données et génération des paramètres régionaux |
| `network-manager` | Oui | Oui | Oui | Oui | Gestion des connexions réseau |
| `netplan.io` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Demandé uniquement pour les suites Ubuntu prises en charge |
| `dracut-core` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Demandé lorsque Dracut est utilisé pour créer l’initramfs |
| `gpg`, `gnupg` | Oui | Oui | Oui | Oui | Outils de signature des paquets et des fichiers |
| `file`, `cpio` | Oui | Oui | Oui | Oui | Identification des fichiers et gestion des archives |
| `gettext-base` / `gettext` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Outils de traduction sélectionnés selon leur disponibilité |
| `polkitd` / `policykit-1`, `pkexec` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Autorisation et élévation des privilèges |
| `bash-completion` | Oui | Oui | Oui | Oui | Complétion des commandes du shell |
| `man-db` | Oui | Oui | Oui | Oui | Lecteur de pages de manuel et base de données |
| `mc` | Oui | Oui | Oui | Oui | Gestionnaire de fichiers Midnight Commander |
| `gpm` | Oui | Oui | Oui | Oui | Prise en charge de la souris en console |
| `ssh` | Oui | Oui | Oui | Oui | Paquets client et serveur OpenSSH sélectionnés par APT |
| `systemd-timesyncd` / `chrony` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Synchronisation de l’heure selon la suite et le système d’init |
| `tlp` | Oui | Oui | Oui | Oui | Gestion de l’alimentation des ordinateurs portables |

Certains paquets de parité d’amorçage ne sont requis que pour des suites de base spécifiques.
Il s’agit de dépendances d’implémentation, et non de fonctionnalités d’édition ; elles ne sont donc pas détaillées ici.

## Outils réseau

| Paquet | Flux | Standard | Toolbox | Ultra | Usage |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Oui | Oui | Oui | Oui | Authentification sans fil WPA/WPA2 |
| `rfkill` | Oui | Oui | Oui | Oui | Contrôle de l’état des périphériques sans fil |
| `usb-modeswitch` | Oui | Oui | Oui | Oui | Modems USB et basculement des appareils mult modes |
| `dnsmasq-base` | - | Oui | Oui | Oui | Prise en charge DNS et DHCP utilisée par les opérations réseau |
| `cifs-utils` | - | Oui | Oui | Oui | Client de système de fichiers réseau SMB/CIFS |
| `nfs-common` | - | Oui | Oui | Oui | Prise en charge du client NFS |
| `ipset` | - | Oui | Oui | Oui | Administration des ensembles IP du noyau |
| `whois` | - | Oui | Oui | Oui | Recherche de domaines et d’enregistrements d’adresses |
| `netcat`, `netcat-openbsd` | - | - | Oui | Oui | Outils de test de flux TCP et UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Oui | Oui | Découverte réseau, transfert et comparaison de scans |
| `iw` | - | - | Oui | Oui | Configuration des périphériques et liaisons sans fil |
| `iperf3` | - | - | Oui | Oui | Test du débit réseau |
| `aria2` | - | - | Oui | Oui | Outil de téléchargement multiprotocole |
| `davfs2` | - | - | Oui | Oui | Client de système de fichiers WebDAV |
| `sshfs` | - | - | Oui | Oui | Accès aux systèmes de fichiers via SSH |
| `open-iscsi` | - | - | - | Oui | Initiateur iSCSI |
| `tgt` | - | - | - | Oui | Service cible iSCSI |

## Stockage et systèmes de fichiers

| Package | Flux | Standard | Toolbox | Ultra | Fonction ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Oui | Oui | Oui | Oui | Inspection et réglage des périphériques ATA et SCSI |
| `mdadm` | Oui | Oui | Oui | Oui | Gestion du RAID logiciel sous Linux |
| `smartmontools` | Oui | Oui | Oui | Oui | Surveillance et tests S.M.A.R.T. |
| `dosfstools` | Oui | Oui | Oui | Oui | Création et vérification de systèmes de fichiers FAT |
| `ntfs-3g` | Oui | Oui | Oui | Oui | Pilote NTFS en espace utilisateur et outils |
| `btrfs-progs` | Oui | Oui | Oui | Oui | Administration de Btrfs |
| `xfsprogs` | - | Oui | Oui | Oui | Administration de XFS |
| `exfatprogs` / `exfat-utils` avec `exfat-fuse` | - | Selon la condition | Selon la condition | Selon la condition | Implémentation exFAT choisie selon la disponibilité du package |
| `fuse3` / `fuse`, `libfuse2` | - | Selon la condition | Selon la condition | Selon la condition | Bibliothèque d’exécution et de compatibilité FUSE |
| `dynfilefs` | - | Selon la condition | Selon la condition | Selon la condition | Stockage persistant segmenté sur les suites compatibles |
| `dynblk` | - | Oui | Oui | Oui | CLI pour le stockage thin DynBlk adossé au noyau et les fichiers VMDK fractionnés ; les sessions utilisables nécessitent également le pilote et un initrd compatible |
| `parted` | - | Oui | Oui | Oui | Création et modification de tables de partition |
| `gpart` | - | - | Oui | Oui | Récupération de tables de partition |
| `mtools` | - | - | Oui | Oui | Outils pour les supports FAT et DOS |
| `gddrescue` | - | - | Oui | Oui | Copie tolérante aux erreurs des périphériques blocs |
| `lvm2` | - | - | Oui | Oui | Gestionnaire de volumes logiques |
| `cryptsetup` | - | - | Oui | Oui | Gestion des volumes LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Oui | Oui | Gestion et montage de volumes chiffrés |
| `f2fs-tools` | - | - | Oui | Oui | Administration de F2FS |
| `hfsutils`, `hfsprogs` | - | - | Oui | Oui | Outils HFS et HFS+, si disponibles |
| `jfsutils` | - | - | Oui | Oui | Administration de JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Oui | Oui | Outils ReiserFS et Reiser4, si disponibles |
| `udftools` | - | - | Oui | Oui | Outils de système de fichiers UDF pour supports optiques |
| `nilfs-tools` | - | - | Oui | Oui | Administration de NILFS2 |
| `zfsutils-linux` | - | - | Selon la condition | Selon la condition | Outils ZFS en espace utilisateur si la compilation du noyau prend en charge ZFS |

## Archives et formats d’image

| Package | Flux | Standard | Toolbox | Ultra | Fonction ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Oui | Oui | Oui | Oui | Compression utilisée par les packages, modules et images |
| `zip`, `unzip` | Oui | Oui | Oui | Oui | Création et extraction d’archives ZIP |
| `xorriso` | Oui | Oui | Oui | Oui | Création et inspection d’images ISO |
| `squashfs-tools` | Oui | Oui | Oui | Oui | Création et extraction de modules SquashFS |
| `lz4` / `liblz4-tools` | - | Selon la condition | Selon la condition | Selon la condition | Implémentation LZ4 choisie selon la disponibilité |
| `bzip2` | - | Oui | Oui | Oui | Compression bzip2 |
| `7zip` | - | Oui | Oui | Oui | Formats d’archive 7z et apparentés |
| `genisoimage` | - | Oui | Oui | Oui | Création d’images ISO-9660 |
| `pv` | - | - | Oui | Oui | Affichage de la progression des pipelines |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Oui | Oui | Outils de compression parallèle |
| `lrzip`, `lzop` | - | - | Oui | Oui | Formats de compression supplémentaires |
| `cabextract` | - | - | Oui | Oui | Extraction d’archives Microsoft Cabinet |
| `xmount` | - | - | Oui | Oui | Conversion et montage de formats d’image disque |

## Récupération, diagnostic et performances

| Package | Flux | Standard | Toolbox | Ultra | Fonction |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Oui | Oui | Oui | Oui | Inspection des périphériques PCI et USB |
| `psmisc` | Oui | Oui | Oui | Oui | Outils de gestion des processus tels que `fuser` et `killall` |
| `htop` | - | Oui | Oui | Oui | Moniteur interactif des processus |
| `ncdu` | - | Oui | Oui | Oui | Analyseur d’utilisation du disque dans le terminal |
| `lsof` | - | Oui | Oui | Oui | Inspection des fichiers ouverts et des processus |
| `clonezilla` | - | - | Oui | Oui | Procédures de clonage de disques et de partitions |
| `partclone`, `partimage` | - | - | Oui | Oui | Outils d’imagerie tenant compte des systèmes de fichiers |
| `testdisk` | - | - | Oui | Oui | Récupération de partitions et de fichiers |
| `chntpw`, `reglookup` | - | - | Oui | Oui | Outils hors ligne pour les comptes et le registre Windows |
| `hexedit` | - | - | Oui | Oui | Éditeur hexadécimal dans le terminal |
| `lshw`, `inxi` | - | - | Oui | Oui | Rapports détaillés sur le matériel et le système |
| `screen` | - | - | Oui | Oui | Multiplexeur de terminal |
| `nmon` | - | - | Oui | Oui | Moniteur interactif des performances |
| `fio`, `bonnie++`, `iozone3` | - | - | Oui | Oui | Tests de performance du stockage et des systèmes de fichiers |
| `stress`, `sysbench` | - | - | Oui | Oui | Tests de performance du processeur, de la mémoire et du système |
| `memtest86+` | - | - | Oui | Oui | Test de mémoire au démarrage |
| `rsync` | - | - | Oui | Oui | Utilitaire de synchronisation et de copie de fichiers |
| `git` | - | - | Oui | Oui | Client de gestion de versions |

## Virtualisation et conteneurs

| Package | Flux | Standard | Toolbox | Ultra | Fonction ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Oui | Oui | Intégration des machines virtuelles invitées VMware et QEMU |
| `virtualbox-guest-utils` | - | - | Selon la condition | Selon la condition | Intégration des machines virtuelles invitées VirtualBox sur certaines suites |
| `hyperv-daemons` | - | - | Oui | Oui | Services invités Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Oui | Oui | Environnement d’exécution de machines virtuelles et outils d’image |
| `libvirt-daemon-system` | - | - | Oui | Oui | Service libvirt système |
| `virt-what` | - | - | Oui | Oui | Détection de l’hyperviseur |
| `uidmap` | - | - | - | Oui | Correspondance des ID d’espaces de noms utilisateur |
| Pile Docker CE / `docker.io` avec `docker-compose` | - | - | - | Selon la condition | Environnement d’exécution de conteneurs choisi parmi les dépôts disponibles |
| `lazydocker` | - | - | - | Oui | Interface Docker pour le terminal |
| `selinux-policy-default` | - | - | - | Oui | Package de stratégie SELinux par défaut |

## Micrologiciel et pilotes du noyau

La sélection du micrologiciel suit le profil de la distribution : les versions Debian et Devuan utilisent des paquets de micrologiciel distincts, tandis que les versions Ubuntu utilisent `linux-firmware`. Les pilotes DKMS sont également filtrés selon l’architecture, le fournisseur et la série du noyau, ainsi que les fonctionnalités déjà fournies par le noyau sélectionné.

| Paquet | Éditions | Rôle ou condition |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Conditionnel, toutes | Collections de micrologiciels Debian et Devuan |
| `firmware-intel-graphics` | Conditionnel, toutes | Micrologiciel graphique Intel sur Trixie et Excalibur |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Conditionnel, toutes | Micrologiciel sans fil pour les appareils Atheros, Intel et ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Conditionnel, toutes | Micrologiciels Realtek et MediaTek ; celui de MediaTek dépend de la suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Conditionnel, toutes | Micrologiciels réseau Broadcom et Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Conditionnel, toutes | Autres familles de micrologiciels sans fil |
| `firmware-b43-installer` | Conditionnel, toutes | Installateur de micrologiciel B43 Broadcom ancien |
| `firmware-sof-signed` | Conditionnel, toutes | Images Sound Open Firmware |
| `linux-firmware-minimal` / `linux-firmware` et paquets de micrologiciels des fabricants | Conditionnel, toutes | Alternative de micrologiciel de base Ubuntu, complétée par des paquets AMD, Intel, Broadcom, MediaTek, Qualcomm, Marvell et Realtek propres à chaque suite |
| `ntfs3-dkms` | Conditionnel, toutes | Pilote NTFS3 lorsque celui-ci est absent du noyau sélectionné |
| `aufs-dkms` / `aufs-ng-dkms` | Conditionnel, toutes | Pilote AUFS sélectionné selon la suite et le noyau |
| `dynblk-dkms` | Conditionnel, toutes | Pilote DynBlk sélectionné pour Linux 6.12 lorsque la compilation DKMS est activée ; non signé et indisponible avec Secure Boot |
| `broadcom-sta-dkms` | Conditionnel, toutes | Pilote sans fil Broadcom STA sur les cibles prises en charge |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Conditionnel, toutes | Pilotes sans fil des fabricants, filtrés selon les fonctionnalités du noyau intégrées et la plateforme cible |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Conditionnel, toutes | Pilotes des fabricants conservés sur les cibles prises en charge pour des appareils ou fonctionnalités supplémentaires |
| `zfs-dkms` | Conditionnel, Toolbox et Ultra | Module du noyau ZFS sur les versions amd64 prises en charge |

Les paquets d’affichage et d’appareil photo du MateBook E peuvent être installés séparément, sous réserve des limitations indiquées dans [Compatibilité matérielle](/getting-started/Hardware-Compatibility). Les listes de paquets de développement peuvent sélectionner ces pilotes, mais cela ne garantit pas qu’ils seront inclus dans les images de la version finale.

## Base graphique

Les environnements graphiques partagent la base Xorg et de rendu ci-dessous. Flux utilise ensuite sa propre liste de bureau ; Standard, Toolbox et Ultra utilisent la liste Xfce maintenue.

| Paquet | Flux | Standard | Toolbox | Ultra | Rôle ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Oui | Oui | Oui | Oui | Serveur X.Org et outils de démarrage |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Oui | Oui | Oui | Oui | Pilotes vidéo X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Oui | Oui | Oui | Oui | Pilotes d’entrée et prise en charge des anciens lanceurs |
| `xterm` | Oui | Oui | Oui | Oui | Terminal X de base |
| `blackbox` / `openbox` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Gestionnaire de fenêtres léger de secours, choisi selon l’environnement |
| `x11-utils`, `wmctrl`, `xdotool` | Oui | Oui | Oui | Oui | Inspection X11 et automatisation des fenêtres |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Oui | Oui | Oui | Oui | Bibliothèques de rendu DRM et Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Oui | Oui | Oui | Oui | Thèmes de curseur et d’icônes |
| `elementary-minios-icon-theme` | Oui | Oui | Oui | Oui | Thème d’icônes MiniOS en dehors de LXQt |
| `librsvg2-common` | Oui | Oui | Oui | Oui | Prise en charge du rendu SVG |
| `fonts-inter-minimal`, `fonts-jetbrains-mono-minimal` | Oui | Oui | Oui | Oui | Polices d’interface et à chasse fixe |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Agent graphique PolicyKit choisi selon sa disponibilité |
| `xrdp`, `xorgxrdp` | - | - | Oui | Oui | Connexion graphique à distance via RDP |

## Bureau Flux et applications

| Paquet | Rôle ou condition |
|---|---|
| `fluxbox-flux` | Configuration du gestionnaire de fenêtres Fluxbox MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Panneau et indicateur de disposition du clavier |
| `xwallpaper`, `gpicview` / `feh` | Fond d’écran et affichage des images |
| `compton` | Compositeur X |
| `alsa-utils`, `volumeicon-alsa` | Commandes audio ALSA |
| `systrayicon`, `cbatticon` | Indicateurs de zone de notification et de batterie |
| `xlunch`, `gtkask`, `flux-tools` | Lanceur et outils du bureau Flux MiniOS |
| `scrot` | Outil de capture d’écran |
| `mousepad`, `pcmanfm` | Éditeur de texte et gestionnaire de fichiers |
| `galculator`, `lxtask`, `xarchiver` | Calculatrice, gestionnaire de tâches et gestionnaire d’archives |
| `network-manager-gnome` | Applet de bureau NetworkManager |
| `firefox` / `firefox-esr` | Navigateur choisi selon la suite, avec les paquets de localisation correspondants |

## Bureau Xfce et applications MiniOS

| Paquet | Standard | Toolbox | Ultra | Rôle ou condition |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Oui | Oui | Oui | Gestionnaire de fichiers et intégration des supports amovibles |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Oui | Oui | Oui | Les paramètres utilisent le paquet adapté à MiniOS, avec mise à l’échelle automatique de l’interface sur Trixie/Excalibur |
| `xfdesktop4`, `xfconf` | Oui | Oui | Oui | Bureau et service de configuration ; Trixie/Excalibur utilisent l’intégration du menu du bureau MiniOS |
| `xfwm4-gl` / `xfwm4` | Conditionnel | Conditionnel | Conditionnel | Trixie/Excalibur sélectionnent `xfwm4-gl` avec OpenGL/XRender, les effets et Peek ; les autres suites sélectionnent `xfwm4` |
| `xfce4-tasklist-minios-plugin`, `xfce4-showdesktop-minios-plugin` | Conditionnel | Conditionnel | Conditionnel | Barre des tâches épinglée MiniOS, aperçus groupés et bandeau « Afficher le bureau » sur Trixie/Excalibur |
| `greybird-minios-gtk-theme` / `greybird-gtk-theme` | Conditionnel | Conditionnel | Conditionnel | Thème clair/sombre MiniOS, avec le thème de la distribution comme solution de repli s’il n’est pas disponible |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Oui | Oui | Oui | Recherche d’applications et indicateur de clavier |
| `mousepad`, `ristretto` | Oui | Oui | Oui | Éditeur de texte et visionneuse d’images |
| `at-spi2-core`, `dbus-x11` | Oui | Oui | Oui | Accessibilité et prise en charge du bus de messages du bureau |
| `gvfs-backends` | Oui | Oui | Oui | Intégration des systèmes de fichiers distants et amovibles au gestionnaire de fichiers |
| `lightdm`, `lightdm-gtk-greeter` | Oui | Oui | Oui | Gestionnaire de connexion graphique |
| `network-manager-gnome`, `blueman` | Oui | Oui | Oui | Commandes réseau et Bluetooth du bureau |
| `avahi-daemon` | Oui | Oui | Oui | Découverte des services sur le réseau local |
| Pile PipeWire / pile PulseAudio | Conditionnel | Conditionnel | Conditionnel | Audio du bureau sélectionné selon la suite |
| `pavucontrol` | Oui | Oui | Oui | Mixeur audio graphique |
| `engrampa`, `thunar-archive-plugin` | Oui | Oui | Oui | Gestionnaire d’archives et intégration au gestionnaire de fichiers |
| `xfce4-screensaver`, `xfce4-screenshooter` | Oui | Oui | Oui | Verrouillage de l’écran et captures d’écran |
| `xfce4-power-manager-plugins` | Oui | Oui | Oui | Intégration de la gestion de l’alimentation Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Oui | Oui | Oui | Gestionnaire de tâches et émulateur de terminal |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Oui | Oui | Oui | Menu des applications et notifications |
| `minios-configurator` | Oui | Oui | Oui | Éditeur de configuration du démarrage et de la session MiniOS |
| `minios-installer` | Oui | Oui | Oui | Installateur graphique et `minios-deploy` CLI |
| `minios-session-manager` | Oui | Oui | Oui | Gestionnaire de session persistant et `minios-session` CLI |
| `minios-kernel-manager` | Oui | Oui | Oui | Gestionnaire modulaire du noyau et `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Oui | Oui | Oui | Catalogue d’applications et installateur MiniOS |
| `minios-image-builder` | Oui | Oui | Oui | Espace graphique de personnalisation d’images ISO |
| `minios-module-manager` | Oui | Oui | Oui | Gestionnaire graphique `.sb` de modules |
| `minios-help` | Oui | Oui | Oui | Visionneuse de documentation installée MiniOS |
| `driveutility` | Oui | Oui | Oui | Écriture, lecture, formatage et effacement d’images disque |
| `firefox` / `firefox-esr` | Conditionnel | Conditionnel | Conditionnel | Navigateur et localisation sélectionnés selon la suite et la langue |
| `menulibre` | - | Oui | Oui | Éditeur graphique de menus |
| `open-vm-tools-desktop` | - | Oui | Oui | Intégration du bureau VMware |
| `virtualbox-guest-x11` | - | Conditionnel | Conditionnel | Intégration du bureau VirtualBox sur certaines suites |
| Thèmes de plateforme GTK pour Qt | - | Oui | Oui | Intégration de l’apparence GTK pour les applications Qt |

## Applications graphiques Toolbox

Le module Xfce `05-apps` est inclus dans Toolbox et Ultra, et ignoré dans Standard.

| Paquet | Fonction ou condition |
|---|---|
| `gparted` | Éditeur graphique de partitions |
| `gsmartcontrol`, `qdiskinfo` | État des disques et informations sur les périphériques |
| `guymager`, `qphotorec` | Imagerie forensique et récupération de fichiers ; `qphotorec` n’est pas inclus dans Buster et Beowulf |
| `kdiskmark` | Benchmark de disque |
| `isomaster` | Éditeur d’images ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnostic du matériel et de la carte graphique |
| `baobab` | Analyseur graphique d’occupation du disque |
| `doublecmd-gtk` | Gestionnaire de fichiers à deux panneaux |
| `grsync` | Interface graphique `rsync` frontale |
| `bleachbit` | Nettoyage du cache et des fichiers temporaires |
| `czkawka` / `czkawka-gui` | Recherche de fichiers en double ou indésirables |
| `gtkhash` | Calculateur de sommes de contrôle |
| `wxhexeditor` | Éditeur hexadécimal pour fichiers volumineux |
| `keepassxc` | Gestionnaire de mots de passe |
| `veracrypt` | Gestion des conteneurs chiffrés et des disques ; non inclus dans Buster et Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Outils graphiques pour volumes chiffrés |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gestion des machines virtuelles et prise en charge de l’affichage SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Client de bureau à distance |
| `rescuezilla` | Sauvegarde, restauration et clonage graphiques de disques |
| `transume` | Sauvegarde, restauration et clonage basés sur Clonezilla, avec exploration des images ; nécessite des paquets compatibles dans les dépôts |
| `wireshark`, `zenmap`, `gnome-nettool` | Analyse et diagnostic graphiques du réseau |
| `x11vnc` | Accès VNC à la session X en cours |
| `uget` | Gestionnaire de téléchargements graphique |
| `android-file-transfer` | Transfert de fichiers Android via MTP |
| `vlc` et certains plugins | Lecture multimédia, localisation, prise en charge de Samba et BitTorrent |
| `pdfarranger` | Réorganisation des pages PDF |
| `codium` | Éditeur de code pour amd64, installé depuis son dépôt tiers signé |
| `onboard` | Clavier à l’écran |
| `galculator` | Calculatrice |

## Applications Ultra

Ultra inclut toutes les applications Toolbox et ajoute :

| Paquet | Fonction |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suite bureautique et intégration au bureau |
| `gimp` | Éditeur d’images matricielles |
| `inkscape` | Éditeur de graphiques vectoriels |
| `blender` | Suite de création 3D |
| `audacity` | Éditeur audio |
| `obs-studio`, `obs-plugins` | Enregistrement et diffusion en continu de l’écran |
| `rawtherapee` | Développement des photos RAW |
| `synaptic` | Gestionnaire de paquets graphique |
| `eddy`, `eddy-handler` | Programme d’installation de paquets Debian locaux, si disponible |
| `fonts-open-sans` | Famille de polices Open Sans |

## Vérifier les paquets installés

Le système en cours d’exécution fait foi pour les paquets réellement installés.
Afficher les noms et les versions des paquets avec :

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifestes de compilation des sources

Les tableaux de paquets ci-dessus sont dérivés du [`minios-live`système de compilation](https://github.com/minios-linux/minios-live). Les chemins ci-dessous sont relatifs à la racine de ce dépôt de sources et sont utiles pour créer ou personnaliser une image à partir des sources :

- `linux-live/environments/<environment>/` définit la chaîne ordonnée des modules.
- `linux-live/scripts/00-core/packages.list` définit la base commune et les ajouts propres aux variantes de paquets.
- `linux-live/scripts/01-kernel/packages.list` définit les paquets conditionnels de compilation du noyau et DKMS.
- `linux-live/scripts/02-firmware/packages.list` définit les micrologiciels propres aux distributions.
- `linux-live/scripts/03-gui-base/packages.list` définit la base graphique commune.
- `linux-live/scripts/04-flux-desktop/packages.list` et `05-flux-apps/packages.list` définissent Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` définit Xfce et les outils de bureau MiniOS.
- `linux-live/scripts/05-apps/packages.list` définit les applications graphiques Toolbox et Ultra.
- `linux-live/scripts/10-firefox/packages.list` définit les paquets de navigateur propres à chaque suite et langue.
- Le fichier `install` et le fichier `skip_conditions.conf` de chaque module déterminent si et comment sa liste de paquets est utilisée.
- `linux-live/build.conf` sélectionne la suite, l’architecture, l’environnement, la variante de paquets, le système d’initialisation, le noyau et la langue.
- `linux-live/condinapt.map` définit les préfixes conditionnels des listes de paquets.

Les listes de sources décrivent les paquets souhaités et leurs alternatives. Seules l’image finalisée et `dpkg-query` indiquent les dépendances résolues et les versions exactes d’une version donnée.

Voir [Architecture du système](/reference/System-Architecture) pour l’ordre des modules et [CondinAPT dans MiniOS](/development/CondinAPT) pour la sélection conditionnelle des paquets.
