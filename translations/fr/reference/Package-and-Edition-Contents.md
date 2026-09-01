---
updated: 2026-08-31
---

# Contenu des paquets et éditions

Le contenu des paquets MiniOS est généré à partir de listes sources conditionnelles. L’ensemble final dépend de la suite de distribution, de l’architecture, du système d’initialisation, de l’environnement de bureau, de la langue, des options du noyau et de la disponibilité des dépôts. Cette page documente les paquets visibles par l’utilisateur demandés par les manifestes maintenus Flux et Xfce. Elle omet les chaînes d’outils réservées à la compilation et les dépendances installées automatiquement via APT.

`Yes` signifie que le manifeste courant demande le paquet pour cette édition.
`Conditional` indique que le nom du paquet ou son inclusion dépend d’une option de compilation ou de la plateforme cible. Un tiret signifie que l’édition ne le demande pas.
L’image finale reste l’autorité de référence.

## Organisation des éditions

Les éditions Xfce maintenues sont construites les unes sur les autres : Standard est le bureau compact pour un usage quotidien, Toolbox vise l’administration système professionnelle, le diagnostic et la récupération, et Ultra transforme cette base en un bureau complet pour le travail général, la créativité et le développement. Flux est une configuration Fluxbox ultra-légère distincte, conçue pour une utilisation minimale des ressources et du matériel ancien ; il ne s’agit pas simplement d’une liste de paquets Xfce réduite.

| Édition | Variante de paquet et environnement | Usage principal |
|---|---|---|
| **Standard** | `standard` avec `xfce` | Bureau Xfce minimal pour un usage quotidien avec les fonctionnalités de base |
| **Toolbox** | `toolbox` avec `xfce` | Administration système professionnelle, diagnostic et récupération |
| **Ultra** | `ultra` avec `xfce` | Bureau complet pour le travail général, la créativité et le développement |
| **Flux** | `minimum` avec `flux` | Bureau Fluxbox ultra-léger pour une utilisation minimale des ressources et les anciens matériels |

Les autres environnements pris en charge disposent de leurs propres chaînes de modules et doivent être vérifiés séparément. En particulier, la disponibilité des paquets dans une construction LXQt ou console ne doit pas être déduite des tableaux Xfce ci-dessous.

## Paquets système et de base MiniOS

Ces paquets fournissent l’environnement d’exécution du système live, la configuration, la localisation, la gestion des privilèges et l’environnement de base en ligne de commande.

| Paquet | Flux | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Oui | Oui | Oui | Oui | Création, conversion, inspection, activation et capture de modifications de modules |
| `minios-image-compose` | Oui | Oui | Oui | Oui | Composition ISO en ligne de commande MiniOS |
| `minios-live-config` | Oui | Oui | Oui | Oui | Composants de configuration de session live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Intégration au système d’initialisation ; une implémentation est sélectionnée |
| `minios-live-config-doc` | Oui | Oui | Oui | Oui | Référence live-config installée |
| `minios-welcome` | Oui | Oui | Oui | Oui | Page d’accueil et lanceur MiniOS |
| `user-setup` | Oui | Oui | Oui | Oui | Création du compte utilisateur live |
| `linux-base` | Oui | Oui | Oui | Oui | Scripts système et images Linux communs |
| `kbd`, `keyboard-configuration`, `console-setup` | Oui | Oui | Oui | Oui | Configuration du clavier et de l’affichage en console |
| `locales` | Oui | Oui | Oui | Oui | Données de langue et génération |
| `network-manager` | Oui | Oui | Oui | Oui | Gestion des connexions réseau |
| `netplan.io` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Demandé uniquement sur les suites Ubuntu prises en charge |
| `dracut-core` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Demandé lorsque Dracut est le générateur d’initramfs |
| `gpg`, `gnupg` | Oui | Oui | Oui | Oui | Outils de signature de paquets et de fichiers |
| `file`, `cpio` | Oui | Oui | Oui | Oui | Identification de fichiers et gestion des archives |
| `gettext-base` / `gettext` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Outils de traduction sélectionnés selon disponibilité |
| `polkitd` / `policykit-1`, `pkexec` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Autorisation et élévation de privilèges |
| `bash-completion` | Oui | Oui | Oui | Oui | Complétion de commandes shell |
| `man-db` | Oui | Oui | Oui | Oui | Lecteur et base de données de pages de manuel |
| `mc` | Oui | Oui | Oui | Oui | Gestionnaire de fichiers Midnight Commander |
| `gpm` | Oui | Oui | Oui | Oui | Prise en charge de la souris en console |
| `ssh` | Oui | Oui | Oui | Oui | Paquets client et serveur OpenSSH sélectionnés par APT |
| `systemd-timesyncd` / `chrony` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Synchronisation de l’heure selon la suite et le système d’initialisation |
| `tlp` | Oui | Oui | Oui | Oui | Gestion de l’alimentation pour ordinateurs portables |

Certains paquets de parité bootstrap sont demandés uniquement pour des suites de base spécifiques.
Ce sont des dépendances d’implémentation plutôt que des fonctionnalités d’édition et ils ne sont pas listés individuellement ici.

## Outils réseau

| Package | Flux | Standard | Toolbox | Ultra | Usage |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Oui | Oui | Oui | Oui | Authentification sans fil WPA/WPA2 |
| `rfkill` | Oui | Oui | Oui | Oui | Contrôle de l'état des périphériques sans fil |
| `usb-modeswitch` | Oui | Oui | Oui | Oui | Gestion des modems USB et commutation multi-modes |
| `dnsmasq-base` | - | Oui | Oui | Oui | Support DNS et DHCP utilisé par les flux réseau |
| `cifs-utils` | - | Oui | Oui | Oui | Client de système de fichiers réseau SMB/CIFS |
| `nfs-common` | - | Oui | Oui | Oui | Support client NFS |
| `ipset` | - | Oui | Oui | Oui | Administration des ensembles IP du noyau |
| `whois` | - | Oui | Oui | Oui | Recherche d'enregistrement de domaine et d'adresse |
| `netcat`, `netcat-openbsd` | - | - | Oui | Oui | Outils de test de flux TCP et UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Oui | Oui | Découverte réseau, transfert et comparaison de scans |
| `iw` | - | - | Oui | Oui | Configuration des périphériques et liens sans fil |
| `iperf3` | - | - | Oui | Oui | Test de débit réseau |
| `aria2` | - | - | Oui | Oui | Utilitaire de téléchargement multi-protocole |
| `davfs2` | - | - | Oui | Oui | Client de système de fichiers WebDAV |
| `sshfs` | - | - | Oui | Oui | Accès au système de fichiers via SSH |
| `open-iscsi` | - | - | - | Oui | Initiateur iSCSI |
| `tgt` | - | - | - | Oui | Service cible iSCSI |

## Stockage et systèmes de fichiers

| Package | Flux | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Oui | Oui | Oui | Oui | Inspection et réglage des périphériques ATA et SCSI |
| `mdadm` | Oui | Oui | Oui | Oui | Gestion RAID logiciel Linux |
| `smartmontools` | Oui | Oui | Oui | Oui | Surveillance et tests S.M.A.R.T. |
| `dosfstools` | Oui | Oui | Oui | Oui | Création et vérification de systèmes de fichiers FAT |
| `ntfs-3g` | Oui | Oui | Oui | Oui | Pilote et outils NTFS en espace utilisateur |
| `btrfs-progs` | Oui | Oui | Oui | Oui | Administration Btrfs |
| `xfsprogs` | - | Oui | Oui | Oui | Administration XFS |
| `exfatprogs` / `exfat-utils` avec `exfat-fuse` | - | Conditionnel | Conditionnel | Conditionnel | Implémentation exFAT sélectionnée selon la disponibilité du package |
| `fuse3` / `fuse`, `libfuse2` | - | Conditionnel | Conditionnel | Conditionnel | Runtime FUSE et bibliothèque de compatibilité |
| `dynfilefs` | - | Conditionnel | Conditionnel | Conditionnel | Stockage persistant segmenté sur les suites prises en charge |
| `parted` | - | Oui | Oui | Oui | Création et édition de table de partitions |
| `gpart` | - | - | Oui | Oui | Récupération de table de partitions |
| `mtools` | - | - | Oui | Oui | Outils FAT et médias DOS |
| `gddrescue` | - | - | Oui | Oui | Copie de périphériques blocs tolérante aux erreurs |
| `lvm2` | - | - | Oui | Oui | Gestionnaire de volumes logiques |
| `cryptsetup` | - | - | Oui | Oui | Gestion des volumes LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Oui | Oui | Gestion et montage de volumes chiffrés |
| `f2fs-tools` | - | - | Oui | Oui | Administration F2FS |
| `hfsutils`, `hfsprogs` | - | - | Oui | Oui | Outils HFS et HFS+, selon disponibilité |
| `jfsutils` | - | - | Oui | Oui | Administration JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Oui | Oui | Outils ReiserFS et Reiser4, selon disponibilité |
| `udftools` | - | - | Oui | Oui | Outils pour système de fichiers UDF sur média optique |
| `nilfs-tools` | - | - | Oui | Oui | Administration NILFS2 |
| `zfsutils-linux` | - | - | Conditionnel | Conditionnel | Outils ZFS en espace utilisateur lorsque le noyau le prend en charge |

## Archives et formats d'image

| Package | Flux | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Oui | Oui | Oui | Oui | Compression utilisée par les packages, modules et images |
| `zip`, `unzip` | Oui | Oui | Oui | Oui | Création et extraction d'archives ZIP |
| `xorriso` | Oui | Oui | Oui | Oui | Création et inspection d'images ISO |
| `squashfs-tools` | Oui | Oui | Oui | Oui | Création et extraction de modules SquashFS |
| `lz4` / `liblz4-tools` | - | Conditionnel | Conditionnel | Conditionnel | Implémentation LZ4 sélectionnée selon disponibilité |
| `bzip2` | - | Oui | Oui | Oui | Compression bzip2 |
| `7zip` | - | Oui | Oui | Oui | Formats d'archives 7z et apparentés |
| `genisoimage` | - | Oui | Oui | Oui | Création d'images ISO-9660 |
| `pv` | - | - | Oui | Oui | Affichage de la progression des pipelines |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Oui | Oui | Outils de compression parallèle |
| `lrzip`, `lzop` | - | - | Oui | Oui | Formats de compression supplémentaires |
| `cabextract` | - | - | Oui | Oui | Extraction d'archives Microsoft Cabinet |
| `xmount` | - | - | Oui | Oui | Conversion et montage de formats d'images disque |

## Récupération, diagnostics et performance

| Package | Flux | Standard | Toolbox | Ultra | Usage |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Oui | Oui | Oui | Oui | Inspection des périphériques PCI et USB |
| `psmisc` | Oui | Oui | Oui | Oui | Outils de processus tels que `fuser` et `killall` |
| `htop` | - | Oui | Oui | Oui | Moniteur de processus interactif |
| `ncdu` | - | Oui | Oui | Oui | Analyseur d'utilisation disque en terminal |
| `lsof` | - | Oui | Oui | Oui | Inspection des fichiers ouverts et des processus |
| `clonezilla` | - | - | Oui | Oui | Flux de clonage de disque et de partition |
| `partclone`, `partimage` | - | - | Oui | Oui | Outils d'imagerie compatibles avec les systèmes de fichiers |
| `testdisk` | - | - | Oui | Oui | Récupération de partitions et de fichiers |
| `chntpw`, `reglookup` | - | - | Oui | Oui | Outils hors ligne pour comptes et registre Windows |
| `hexedit` | - | - | Oui | Oui | Éditeur hexadécimal en terminal |
| `lshw`, `inxi` | - | - | Oui | Oui | Rapports détaillés matériel et système |
| `screen` | - | - | Oui | Oui | Multiplexeur de terminal |
| `nmon` | - | - | Oui | Oui | Moniteur de performance interactif |
| `fio`, `bonnie++`, `iozone3` | - | - | Oui | Oui | Benchmarks de stockage et de systèmes de fichiers |
| `stress`, `sysbench` | - | - | Oui | Oui | Benchmarks CPU, mémoire et système |
| `memtest86+` | - | - | Oui | Oui | Test de mémoire au démarrage |
| `rsync` | - | - | Oui | Oui | Utilitaire de synchronisation et de copie de fichiers |

## Virtualisation et conteneurs

| Package | Flux | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Oui | Oui | Intégration invité VMware et QEMU |
| `virtualbox-guest-utils` | - | - | Conditionnel | Conditionnel | Intégration invité VirtualBox sur suites sélectionnées |
| `hyperv-daemons` | - | - | Oui | Oui | Services invité Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Oui | Oui | Outils d'exécution et d'image de machines virtuelles |
| `libvirt-daemon-system` | - | - | Oui | Oui | Service système libvirt |
| `virt-what` | - | - | Oui | Oui | Détection de l'hyperviseur |
| `uidmap` | - | - | - | Oui | Mappage d'identifiants d'espace de noms utilisateur |
| Docker CE stack / `docker.io` avec `docker-compose` | - | - | - | Conditionnel | Runtime de conteneur sélectionné depuis le dépôt disponible |
| `lazydocker` | - | - | - | Oui | Interface terminal pour Docker |
| `selinux-policy-default` | - | - | - | Oui | Package de politique SELinux par défaut |

## Microprogrammes et pilotes du noyau

La sélection du microprogramme suit le profil de la distribution : les constructions Debian et Devuan utilisent des paquets de microprogrammes séparés, tandis que les constructions Ubuntu utilisent `linux-firmware`. Les pilotes DKMS sont également filtrés selon l’architecture, le fournisseur du noyau, la série du noyau et les fonctionnalités déjà incluses dans le noyau sélectionné.

| Paquet | Éditions | Usage ou condition |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Conditionnel, toutes | Collections de microprogrammes Debian et Devuan |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Conditionnel, toutes | Microprogrammes sans fil pour périphériques Atheros, Intel et ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Conditionnel, toutes | Microprogrammes Realtek et MediaTek ; MediaTek dépend de la suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Conditionnel, toutes | Microprogrammes réseau Broadcom et Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Conditionnel, toutes | Autres familles de microprogrammes sans fil |
| `firmware-b43-installer` | Conditionnel, toutes | Installateur de microprogramme Broadcom B43 hérité |
| `firmware-sof-signed` | Conditionnel, toutes | Images Sound Open Firmware |
| `linux-firmware` | Conditionnel, toutes | Collection de microprogrammes Ubuntu |
| `ntfs3-dkms` | Conditionnel, toutes | Pilote NTFS3 lorsqu’il est absent du noyau sélectionné |
| `aufs-dkms` / `aufs-ng-dkms` | Conditionnel, toutes | Pilote AUFS sélectionné selon la suite et le noyau |
| `broadcom-sta-dkms` | Conditionnel, toutes | Pilote sans fil Broadcom STA sur les cibles prises en charge |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Conditionnel, toutes | Pilotes sans fil du constructeur filtrés selon les capacités du noyau et la plateforme cible |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Conditionnel, toutes | Pilotes constructeur conservés sur les cibles prises en charge pour des périphériques ou fonctionnalités supplémentaires |
| `zfs-dkms` | Conditionnel, Toolbox et Ultra | Module noyau ZFS sur les constructions amd64 prises en charge |

## Base graphique

Les environnements graphiques partagent la base Xorg et de rendu ci-dessous. Flux utilise ensuite sa propre liste de bureau ; Standard, Toolbox et Ultra utilisent la liste Xfce maintenue.

| Paquet | Flux | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Oui | Oui | Oui | Oui | Serveur X.Org et outils de démarrage |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Oui | Oui | Oui | Oui | Pilotes vidéo X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Oui | Oui | Oui | Oui | Pilotes d’entrée et support de lancement hérité |
| `xterm` | Oui | Oui | Oui | Oui | Terminal X de base |
| `blackbox` / `openbox` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Gestionnaire de fenêtres léger de secours sélectionné selon l’environnement |
| `x11-utils`, `wmctrl`, `xdotool` | Oui | Oui | Oui | Oui | Inspection X11 et automatisation des fenêtres |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Oui | Oui | Oui | Oui | Bibliothèques de rendu DRM et Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Oui | Oui | Oui | Oui | Thèmes de curseurs et d’icônes |
| `elementary-minios-icon-theme` | Oui | Oui | Oui | Oui | Thème d’icônes MiniOS hors LXQt |
| `librsvg2-common` | Oui | Oui | Oui | Oui | Prise en charge du rendu SVG |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Conditionnel | Conditionnel | Conditionnel | Conditionnel | Agent graphique PolicyKit sélectionné selon disponibilité |
| `xrdp`, `xorgxrdp` | - | - | Oui | Oui | Connexion graphique distante via RDP |

## Bureau Flux et applications

| Package | Usage ou condition |
|---|---|
| `fluxbox-flux` | Configuration du gestionnaire de fenêtres Fluxbox de MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Indicateur de panneau et de disposition du clavier |
| `xwallpaper`, `gpicview` / `feh` | Affichage d'images et de fonds d'écran |
| `compton` | Compositeur X |
| `alsa-utils`, `volumeicon-alsa` | Contrôles audio ALSA |
| `systrayicon`, `cbatticon` | Indicateurs de batterie et de zone de notification |
| `xlunch`, `gtkask`, `flux-tools` | Lanceur et assistants du bureau Flux MiniOS |
| `scrot` | Utilitaire de capture d'écran |
| `mousepad`, `pcmanfm` | Éditeur de texte et gestionnaire de fichiers |
| `galculator`, `lxtask`, `xarchiver` | Calculatrice, gestionnaire de tâches et gestionnaire d'archives |
| `network-manager-gnome` | Applet de bureau NetworkManager |
| `firefox` / `firefox-esr` | Navigateur sélectionné selon la suite, avec les paquets de langue correspondants |

## Bureau Xfce et applications MiniOS

| Package | Standard | Toolbox | Ultra | Usage ou condition |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Oui | Oui | Oui | Gestionnaire de fichiers et intégration des supports amovibles |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Oui | Oui | Oui | Services du panneau, de session et de configuration Xfce |
| `xfdesktop4`, `xfwm4`, `xfconf` | Oui | Oui | Oui | Bureau, gestionnaire de fenêtres et service de configuration |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Oui | Oui | Oui | Lanceur d'applications et indicateur de clavier |
| `mousepad`, `ristretto` | Oui | Oui | Oui | Éditeur de texte et visionneuse d'images |
| `at-spi2-core`, `dbus-x11` | Oui | Oui | Oui | Accessibilité et support du bus de messages du bureau |
| `gvfs-backends` | Oui | Oui | Oui | Intégration des systèmes de fichiers distants et amovibles pour le gestionnaire de fichiers |
| `lightdm`, `lightdm-gtk-greeter` | Oui | Oui | Oui | Gestionnaire de connexion graphique |
| `network-manager-gnome`, `blueman` | Oui | Oui | Oui | Contrôles réseau et Bluetooth du bureau |
| `avahi-daemon` | Oui | Oui | Oui | Découverte de services réseau local |
| Pile PipeWire / Pile PulseAudio | Conditionnel | Conditionnel | Conditionnel | Audio du bureau sélectionné selon la suite |
| `pavucontrol` | Oui | Oui | Oui | Mixeur audio graphique |
| `engrampa`, `thunar-archive-plugin` | Oui | Oui | Oui | Gestionnaire d'archives et intégration au gestionnaire de fichiers |
| `xfce4-screensaver`, `xfce4-screenshooter` | Oui | Oui | Oui | Verrouillage d'écran et captures d'écran |
| `xfce4-power-manager-plugins` | Oui | Oui | Oui | Intégration de la gestion de l'énergie Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Oui | Oui | Oui | Gestionnaire de tâches et terminal |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Oui | Oui | Oui | Menu d'applications et notifications |
| `minios-configurator` | Oui | Oui | Oui | Éditeur graphique de configuration de démarrage et de session MiniOS |
| `minios-installer` | Oui | Oui | Oui | Installateur graphique et CLI `minios-deploy` |
| `minios-session-manager` | Oui | Oui | Oui | Gestionnaire de session persistante et CLI `minios-session` |
| `minios-kernel-manager` | Oui | Oui | Oui | Gestionnaire modulaire de noyau et CLI `minios-kernel` |
| `minios-store`, `minios-store-gui` | Oui | Oui | Oui | Catalogue d'applications MiniOS et installateur |
| `minios-image-builder` | Oui | Oui | Oui | Espace de travail graphique pour la personnalisation d'ISO |
| `minios-module-manager` | Oui | Oui | Oui | Gestionnaire graphique de modules `.sb` |
| `minios-help` | Oui | Oui | Oui | Visionneuse de documentation MiniOS installée |
| `driveutility` | Oui | Oui | Oui | Écriture, lecture, formatage et effacement d'images disque |
| `firefox` / `firefox-esr` | Conditionnel | Conditionnel | Conditionnel | Navigateur et localisation sélectionnés selon la suite et la langue |
| `menulibre` | - | Oui | Oui | Éditeur graphique de menu |
| `open-vm-tools-desktop` | - | Oui | Oui | Intégration de bureau VMware |
| `virtualbox-guest-x11` | - | Conditionnel | Conditionnel | Intégration de bureau VirtualBox sur suites sélectionnées |
| Thèmes Qt GTK | - | Oui | Oui | Intégration de l'apparence GTK pour les applications Qt |

## Applications graphiques Toolbox

Le module Xfce `05-apps` est inclus pour Toolbox et Ultra et ignoré pour Standard.

| Paquet | Usage ou condition |
|---|---|
| `gparted` | Éditeur de partitions graphique |
| `gsmartcontrol`, `qdiskinfo` | Santé des disques et informations sur les périphériques |
| `guymager`, `qphotorec` | Imagerie légale et récupération de fichiers ; `qphotorec` est exclu sur Buster et Beowulf |
| `kdiskmark` | Test de performance des disques |
| `isomaster` | Éditeur d’images ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnostics matériel et graphique |
| `baobab` | Analyseur graphique d’utilisation des disques |
| `doublecmd-gtk` | Gestionnaire de fichiers à deux volets |
| `grsync` | Interface graphique pour `rsync` |
| `bleachbit` | Nettoyage du cache et des fichiers temporaires |
| `czkawka` / `czkawka-gui` | Recherche de fichiers en double ou indésirables |
| `gtkhash` | Calculateur de sommes de contrôle |
| `wxhexeditor` | Éditeur hexadécimal pour gros fichiers |
| `keepassxc` | Gestionnaire de mots de passe |
| `veracrypt` | Gestion des conteneurs et disques chiffrés ; exclu sur Buster et Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Outils graphiques pour volumes chiffrés |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gestion de machines virtuelles et prise en charge de l’affichage SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Client de bureau à distance |
| `wireshark`, `zenmap`, `gnome-nettool` | Analyse et diagnostic réseau graphiques |
| `x11vnc` | Accès VNC à la session X en cours |
| `uget` | Gestionnaire de téléchargements graphique |
| `android-file-transfer` | Transfert de fichiers Android MTP |
| `vlc` et plugins sélectionnés | Lecture multimédia, localisation, prise en charge Samba et BitTorrent |
| `pdfarranger` | Réorganisation des pages PDF |
| `codium` | Éditeur de code |
| `onboard` | Clavier visuel |
| `galculator` | Calculatrice |

## Applications Ultra

Ultra inclut toutes les applications Toolbox et ajoute :

| Package | Usage |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suite bureautique et intégration au bureau |
| `gimp` | Éditeur d'images matricielles |
| `inkscape` | Éditeur d'images vectorielles |
| `blender` | Suite de création 3D |
| `audacity` | Éditeur audio |
| `obs-studio`, `obs-plugins` | Enregistrement et diffusion d'écran |
| `rawtherapee` | Développeur de photos RAW |
| `synaptic` | Gestionnaire graphique de paquets |
| `eddy`, `eddy-handler` | Installateur de paquets Debian local, selon disponibilité |
| `fonts-open-sans` | Famille de polices Open Sans |

## Inspecter les paquets installés

Le système en cours d'exécution fait foi pour les paquets effectivement installés.
Listez les noms et versions des paquets avec :

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifestes de construction source

Les tableaux de paquets ci-dessus sont dérivés du [système de construction `minios-live`](https://github.com/minios-linux/minios-live). Les chemins ci-dessous sont relatifs à la racine de ce dépôt source et sont pertinents pour construire ou personnaliser une image à partir des sources :

- `linux-live/environments/<environment>/` définit la chaîne de modules ordonnée.
- `linux-live/scripts/00-core/packages.list` définit la base partagée et les ajouts de variantes de paquets.
- `linux-live/scripts/01-kernel/packages.list` définit la construction conditionnelle du noyau et les paquets DKMS.
- `linux-live/scripts/02-firmware/packages.list` définit les microprogrammes spécifiques à la distribution.
- `linux-live/scripts/03-gui-base/packages.list` définit la base graphique partagée.
- `linux-live/scripts/04-flux-desktop/packages.list` et `05-flux-apps/packages.list` définissent Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` définit Xfce et les outils de bureau MiniOS.
- `linux-live/scripts/05-apps/packages.list` définit les applications graphiques Toolbox et Ultra.
- `linux-live/scripts/10-firefox/packages.list` définit les paquets de navigateur spécifiques à la suite et à la langue.
- Les fichiers `install` et `skip_conditions.conf` de chaque module déterminent si et comment sa liste de paquets est utilisée.
- `linux-live/build.conf` sélectionne la suite, l’architecture, l’environnement, la variante de paquet, le système d’initialisation, le noyau et la langue.
- `linux-live/condinapt.map` définit les préfixes de condition de liste de paquets.

Les listes sources décrivent les paquets demandés et les alternatives. Seule l’image finale et `dpkg-query` affichent l’ensemble des dépendances résolues et les versions exactes pour une version donnée.

Voir [Architecture système](/reference/System-Architecture) pour l’ordre des modules et [CondinAPT dans MiniOS](/development/CondinAPT) pour la sélection conditionnelle des paquets.
