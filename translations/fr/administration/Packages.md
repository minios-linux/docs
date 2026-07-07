# Liste des paquets MiniOS

Ce document fournit un aperçu complet de tous les paquets inclus dans les différentes éditions de MiniOS. MiniOS est disponible en trois éditions principales, chacune proposant un ensemble différent de logiciels préinstallés :

- **Standard** - Système minimal avec fonctionnalités de base
- **Toolbox** - Outils d’administration système et de diagnostic
- **Ultra** - Environnement de bureau complet avec applications

## Utilitaires console et paquets système

### ⚙️ Paquets système principaux

| Paquet                         | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                 |
| :----------------------------- | :------: | :-----: | :---: | :----------------------------------------------------------- |
| minios-tools                   |    ✅     |    ✅    |   ✅   | Outils et scripts de base pour MiniOS.                       |
| minios-welcome                 |    ✅     |    ✅    |   ✅   | Message de bienvenue dans le navigateur.                     |
| minios-live-config             |    ✅     |    ✅    |   ✅   | Scripts de configuration pour le système Live.               |
| minios-live-config-systemd     |    ✅     |    ✅    |   ✅   | Configuration du système Live pour systemd.                  |
| minios-live-config-doc         |    ✅     |    ✅    |   ✅   | Documentation pour minios-live-config.                       |
| user-setup                     |    ✅     |    ✅    |   ✅   | Utilitaire de configuration utilisateur.                     |
| linux-base                     |    ✅     |    ✅    |   ✅   | Scripts de base pour le système Linux.                       |
| kbd                            |    ✅     |    ✅    |   ✅   | Utilitaires pour gérer la disposition clavier en console.    |
| keyboard-configuration         |    ✅     |    ✅    |   ✅   | Système de configuration du clavier.                         |
| locales                        |    ✅     |    ✅    |   ✅   | Bibliothèques et données pour la localisation (langues).     |
| console-setup                  |    ✅     |    ✅    |   ✅   | Configuration de la police et de l’encodage de la console.   |
| systemd-timesyncd              |    ✅     |    ✅    |   ✅   | Service de synchronisation de l’heure par le réseau.         |
| polkitd / policykit-1 / pkexec |    ✅     |    ✅    |   ✅   | Cadre de gestion des privilèges des services système.        |

### 📦 Gestion des paquets et des logiciels

| Paquet              | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                         |
| :------------------ | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| apt-transport-https |    ✅     |    ✅    |   ✅   | Permet l’utilisation de dépôts via le protocole HTTPS.               |
| gettext-base        |    ✅     |    ✅    |   ✅   | Utilitaires pour l’internationalisation et la localisation logicielle.|
| man-db              |    ✅     |    ✅    |   ✅   | Système d’affichage des pages de manuel (man).                       |
| bash-completion     |    ✅     |    ✅    |   ✅   | Fournit l’auto-complétion des commandes dans le shell Bash.           |

### 🌐 Utilitaires réseau

| Paquet                     | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                         |
| :------------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| network-manager / connman  |    ✅     |    ✅    |   ✅   | Gestionnaires de connexions réseau.                                  |
| dnsmasq-base               |    ✅     |    ✅    |   ✅   | Serveur DNS et DHCP léger (fichiers de base).                       |
| wpasupplicant              |    ✅     |    ✅    |   ✅   | Utilitaire pour se connecter aux réseaux Wi-Fi sécurisés (WPA/WPA2). |
| iputils-ping               |    ✅     |    ✅    |   ✅   | Utilitaire `ping` pour vérifier la disponibilité d’un hôte.          |
| ssh                        |    ✅     |    ✅    |   ✅   | Client et serveur pour connexions distantes sécurisées (SSH).        |
| wget                       |    ✅     |    ✅    |   ✅   | Utilitaire pour télécharger des fichiers depuis le réseau.           |
| curl                       |    ✅     |    ✅    |   ✅   | Utilitaire pour le transfert de données via divers protocoles.       |
| ipset                      |    ✅     |    ✅    |   ✅   | Utilitaire pour gérer des ensembles d’adresses IP dans le noyau.     |
| whois                      |    ✅     |    ✅    |   ✅   | Client pour obtenir des infos sur les domaines et adresses IP.       |
| nmap                       |    ❌     |    ✅    |   ✅   | Puissant scanner réseau et outil d’audit de sécurité.                |
| ncat                       |    ❌     |    ✅    |   ✅   | Version améliorée de `netcat` de la suite nmap.                     |
| ndiff                      |    ❌     |    ✅    |   ✅   | Utilitaire pour comparer les résultats de scan nmap.                 |
| iperf3                     |    ❌     |    ✅    |   ✅   | Outil de mesure de la bande passante réseau.                        |
| netcat                     |    ❌     |    ✅    |   ✅   | Utilitaire réseau pour lire/écrire sur TCP/IP.                       |
| netcat-openbsd             |    ❌     |    ✅    |   ✅   | Implémentation alternative de `netcat` depuis OpenBSD.               |
| open-iscsi                 |    ❌     |    ❌    |   ✅   | Client (initiateur) pour le stockage iSCSI.                          |
| tgt                        |    ❌     |    ❌    |   ✅   | Serveur (cible) pour fournir du stockage iSCSI.                      |

### 💾 Gestion des disques et des systèmes de fichiers

| Paquet         | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                             |
| :------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------- |
| parted         |    ✅     |    ✅    |   ✅   | Programme pour créer et modifier des partitions disque.                  |
| dosfstools     |    ✅     |    ✅    |   ✅   | Utilitaires pour créer et vérifier des systèmes de fichiers FAT.         |
| ntfs-3g        |    ✅     |    ✅    |   ✅   | Pilote pour lire et écrire sur des partitions NTFS.                      |
| mdadm          |    ✅     |    ✅    |   ✅   | Utilitaire de gestion des ensembles RAID logiciels.                      |
| hdparm         |    ✅     |    ✅    |   ✅   | Utilitaire pour configurer et afficher les paramètres des disques durs.  |
| sdparm         |    ✅     |    ✅    |   ✅   | Utilitaire pour accéder aux paramètres des périphériques SCSI/SATA/SAS.  |
| btrfs-progs    |    ✅     |    ✅    |   ✅   | Utilitaires pour le système de fichiers Btrfs.                           |
| xfsprogs       |    ✅     |    ✅    |   ✅   | Utilitaires pour le système de fichiers XFS.                             |
| exfat-utils    |    ✅     |    ✅    |   ✅   | Utilitaires pour exFAT (implémentation héritée).                         |
| exfat-fuse     |    ✅     |    ✅    |   ✅   | Module FUSE pour la prise en charge d’exFAT.                             |
| exfatprogs     |    ✅     |    ✅    |   ✅   | Utilitaires pour créer et vérifier des systèmes de fichiers exFAT.       |
| cifs-utils     |    ✅     |    ✅    |   ✅   | Utilitaires pour monter des partages réseau Windows (Samba/CIFS).        |
| nfs-common     |    ✅     |    ✅    |   ✅   | Fichiers communs pour le support NFS (client).                           |
| smartmontools  |    ✅     |    ✅    |   ✅   | Utilitaires de surveillance de l’état des disques via S.M.A.R.T.         |
| gpart          |    ❌     |    ✅    |   ✅   | Utilitaire pour « deviner » la table de partitions sur disques endommagés.|
| mtools         |    ❌     |    ✅    |   ✅   | Ensemble d’outils pour accéder aux disquettes et partitions MS-DOS.      |
| gddrescue      |    ❌     |    ✅    |   ✅   | Outil de copie de données depuis des supports endommagés.                |
| zfsutils-linux |    ❌     |    ✅    |   ✅   | Utilitaires pour gérer les pools et systèmes de fichiers ZFS.            |
| davfs2         |    ❌     |    ✅    |   ✅   | Permet de monter des ressources WebDAV comme un système de fichiers local.|
| f2fs-tools     |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers F2FS.                            |
| hfsutils       |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers Apple « classique » (HFS).       |
| hfsprogs       |    ❌     |    ✅    |   ✅   | Utilitaires pour créer et vérifier des systèmes de fichiers HFS+.        |
| jfsutils       |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers JFS.                             |
| reiserfsprogs  |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers ReiserFS (v3).                   |
| reiser4progs   |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers Reiser4.                         |
| udftools       |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers UDF (DVD/Blu-ray).               |
| nilfs-tools    |    ❌     |    ✅    |   ✅   | Utilitaires pour le système de fichiers log-structuré NILFS2.            |
| sshfs          |    ❌     |    ✅    |   ✅   | Monter un système de fichiers distant via SSH.                           |
| lvm2           |    ❌     |    ✅    |   ✅   | Gestionnaire de volumes logiques.                                        |
| cryptsetup     |    ❌     |    ✅    |   ✅   | Utilitaire pour configurer des partitions chiffrées (LUKS).              |
| zulucrypt-cli  |    ❌     |    ✅    |   ✅   | CLI pour gérer les volumes chiffrés (LUKS, VeraCrypt, etc.).             |
| zulumount-cli  |    ❌     |    ✅    |   ✅   | CLI pour monter les volumes gérés par zulucrypt.                         |

### 💻 Utilitaires système et surveillance

| Paquet         | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                               |
| :------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------- |
| pciutils       |    ✅     |    ✅    |   ✅   | Utilitaires pour afficher les informations sur les périphériques PCI.       |
| usbutils       |    ✅     |    ✅    |   ✅   | Utilitaires pour afficher les informations sur les périphériques USB.       |
| psmisc         |    ✅     |    ✅    |   ✅   | Ensemble d’utilitaires pour gérer les processus (`fuser`, `killall`).       |
| lsof           |    ✅     |    ✅    |   ✅   | Affiche quels fichiers sont utilisés par quels processus.                   |
| htop           |    ✅     |    ✅    |   ✅   | Moniteur interactif de processus.                                           |
| rfkill         |    ✅     |    ✅    |   ✅   | Outil pour activer/désactiver les périphériques sans fil.                   |
| file           |    ✅     |    ✅    |   ✅   | Détermine le type de fichier.                                               |
| usb-modeswitch |    ✅     |    ✅    |   ✅   | Permet de changer le mode des périphériques USB (ex : modems).              |
| ncdu           |    ✅     |    ✅    |   ✅   | Analyseur d’utilisation disque en interface ncurses.                        |
| lshw           |    ❌     |    ✅    |   ✅   | Affiche des informations détaillées sur le matériel.                        |
| screen         |    ❌     |    ✅    |   ✅   | Multiplexeur de terminal, permet de gérer plusieurs sessions.               |
| nmon           |    ❌     |    ✅    |   ✅   | Utilitaire de surveillance des performances système.                        |
| inxi           |    ❌     |    ✅    |   ✅   | Script pour collecter et afficher des informations système détaillées.       |

### 🗜️ Archives et compression

| Paquet        | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                         |
| :------------ | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| zip           |    ✅     |    ✅    |   ✅   | Archiveur pour créer et extraire des fichiers .zip.                  |
| unzip         |    ✅     |    ✅    |   ✅   | Utilitaire pour extraire les archives .zip.                          |
| xz-utils      |    ✅     |    ✅    |   ✅   | Utilitaires de compression de données avec l’algorithme LZMA/XZ.     |
| zstd          |    ✅     |    ✅    |   ✅   | Utilitaire de compression de données avec Zstandard.                 |
| lz4           |    ✅     |    ✅    |   ✅   | Utilitaire de compression très rapide.                               |
| liblz4-tools  |    ✅     |    ✅    |   ✅   | Outils supplémentaires pour le format lz4.                           |
| bzip2         |    ✅     |    ✅    |   ✅   | Utilitaire de compression de données avec l’algorithme bzip2.        |
| 7zip          |    ✅     |    ✅    |   ✅   | Archiveur puissant supportant de nombreux formats, dont 7z.          |
| pv            |    ❌     |    ✅    |   ✅   | Utilitaire pour suivre la progression du transfert de données via pipe.|
| pigz          |    ❌     |    ✅    |   ✅   | Implémentation parallèle (multi-thread) de gzip.                     |
| pixz          |    ❌     |    ✅    |   ✅   | Implémentation indexable parallèle de xz.                            |
| plzip         |    ❌     |    ✅    |   ✅   | Implémentation parallèle de lzip.                                    |
| lrzip         |    ❌     |    ✅    |   ✅   | Archiveur longue portée, efficace pour les gros fichiers.            |
| lzop          |    ❌     |    ✅    |   ✅   | Utilitaire de compression très rapide.                               |
| pbzip2        |    ❌     |    ✅    |   ✅   | Implémentation parallèle de bzip2.                                   |
| cabextract    |    ❌     |    ✅    |   ✅   | Utilitaire pour extraire les archives Microsoft .cab.                |

### 🕵️ Récupération et forensique

| Paquet     | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                |
| :--------- | :------: | :-----: | :---: | :---------------------------------------------------------- |
| clonezilla |    ❌     |    ✅    |   ✅   | Outil de clonage et de sauvegarde de disques.               |
| testdisk   |    ❌     |    ✅    |   ✅   | Utilitaire pour récupérer des partitions et fichiers supprimés.|
| chntpw     |    ❌     |    ✅    |   ✅   | Utilitaire pour réinitialiser les mots de passe Windows.    |
| reglookup  |    ❌     |    ✅    |   ✅   | Utilitaire pour lire et analyser la base de registre Windows.|
| hexedit    |    ❌     |    ✅    |   ✅   | Éditeur hexadécimal simple pour la console.                 |

### ☁️ Virtualisation et conteneurs

| Paquet                  | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                         |
| :---------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| open-vm-tools           |    ❌     |    ✅    |   ✅   | Ensemble d’outils pour une meilleure intégration VMware.             |
| hyperv-daemons          |    ❌     |    ✅    |   ✅   | Services d’intégration avec l’hyperviseur Microsoft Hyper-V.         |
| qemu-system-x86         |    ❌     |    ✅    |   ✅   | Émulateur pour exécuter des systèmes x86/x86_64.                     |
| qemu-utils              |    ❌     |    ✅    |   ✅   | Utilitaires pour gérer les images disques QEMU.                      |
| libvirt-daemon-system   |    ❌     |    ✅    |   ✅   | Démons pour gérer les machines virtuelles.                           |
| virt-what               |    ❌     |    ✅    |   ✅   | Script pour détecter si le système tourne dans une VM.               |
| uidmap                  |    ❌     |    ❌    |   ✅   | Utilitaires pour gérer les espaces de noms utilisateur.              |
| docker.io               |    ❌     |    ❌    |   ✅   | Plateforme de conteneurisation d’applications.                       |
| docker-compose          |    ❌     |    ❌    |   ✅   | Outil pour gérer les applications Docker multi-conteneurs.           |
| lazydocker              |    ❌     |    ❌    |   ✅   | Interface terminal pour gérer Docker et Docker Compose.              |
| selinux-policy-default  |    ❌     |    ❌    |   ✅   | Politique de sécurité SELinux par défaut.                            |

### 🧩 Divers

| Paquet         | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                                      |
| :------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------- |
| mc             |    ✅     |    ✅    |   ✅   | Gestionnaire de fichiers Midnight Commander.                                      |
| gpg            |    ✅     |    ✅    |   ✅   | GNU Privacy Guard – utilitaire de chiffrement et de signature.                    |
| gnupg          |    ✅     |    ✅    |   ✅   | Suite complète GNU Privacy Guard.                                                 |
| squashfs-tools |    ✅     |    ✅    |   ✅   | Utilitaires pour créer et extraire des images SquashFS.                           |
| xorriso        |    ✅     |    ✅    |   ✅   | Utilitaire pour créer et graver des images ISO-9660.                              |
| genisoimage    |    ✅     |    ✅    |   ✅   | Crée des images de systèmes de fichiers ISO-9660.                                 |
| eject          |    ✅     |    ✅    |   ✅   | Utilitaire pour éjecter les supports amovibles (CD/DVD/USB).                      |
| fuse3 / fuse   |    ✅     |    ✅    |   ✅   | Cadre pour créer des systèmes de fichiers en espace utilisateur.                  |
| libfuse2       |    ✅     |    ✅    |   ✅   | Bibliothèque de compatibilité pour les applications FUSE anciennes.               |
| memtest86+     |    ❌     |    ✅    |   ✅   | Programme de test de la mémoire vive (RAM).                                      |
| xmount         |    ❌     |    ✅    |   ✅   | Outil pour monter des images disque de différents formats.                        |
| aria2          |    ❌     |    ✅    |   ✅   | Gestionnaire de téléchargements multi-protocoles.                                 |
| fio            |    ❌     |    ✅    |   ✅   | Outil avancé de test et de benchmark des performances disque (Flexible I/O Tester).|
| bonnie++       |    ❌     |    ✅    |   ✅   | Benchmark pour tester les performances des systèmes de fichiers.                  |
| iozone3        |    ❌     |    ✅    |   ✅   | Benchmark pour tester les performances d’E/S disque.                             |
| stress         |    ❌     |    ✅    |   ✅   | Outil pour générer de la charge système (CPU, mémoire, I/O).                     |
| sysbench       |    ❌     |    ✅    |   ✅   | Benchmark complet pour tester CPU, mémoire, I/O, bases de données.               |

## Microprogrammes et pilotes

### 📦 Pilotes (DKMS)

| Paquet                   | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                                                                  |
| :----------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------------------------------------------- |
| broadcom-sta-dkms        |    ✅     |    ✅    |   ✅   | Pilote propriétaire Broadcom 802.11 STA pour cartes Wi-Fi. Requis sur de nombreux PC portables Broadcom.    |
| zfs-dkms                 |    ❌     |    ✅    |   ✅   | Modules noyau pour la prise en charge du système de fichiers ZFS.                                            |
| realtek-rtl8821au-dkms   |    ✅     |    ✅    |   ✅   | Pilote DKMS pour chipsets Wi-Fi Realtek RTL8812AU/8821AU.                                                   |
| realtek-rtl88xxau-dkms   |    ✅     |    ✅    |   ✅   | Pilote DKMS pour divers chipsets Wi-Fi Realtek RTL88xxAU.                                                   |
| realtek-rtl8188eus-dkms  |    ✅     |    ✅    |   ✅   | Pilote DKMS pour chipsets Wi-Fi Realtek RTL8188EUS.                                                        |
| realtek-rtl8814au-dkms   |    ✅     |    ✅    |   ✅   | Pilote DKMS pour chipsets Wi-Fi Realtek RTL8814AU.                                                         |

### 🔌 Microprogrammes

| Paquet                    | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                                  |
| :------------------------ | :------: | :-----: | :---: | :--------------------------------------------------------------------------- |
| firmware-linux-free       |    ✅     |    ✅    |   ✅   | Collection de microprogrammes libres (niveau licence) pour divers matériels.  |
| firmware-linux-nonfree    |    ✅     |    ✅    |   ✅   | Métapaquet incluant tous les microprogrammes non libres (propriétaires).      |
| firmware-atheros          |    ✅     |    ✅    |   ✅   | Microprogramme pour cartes réseau sans fil sur puces Atheros.                 |
| firmware-iwlwifi          |    ✅     |    ✅    |   ✅   | Microprogramme pour cartes réseau Intel Wireless (Wi-Fi).                     |
| firmware-zd1211           |    ✅     |    ✅    |   ✅   | Microprogramme pour périphériques Wi-Fi ZyDAS ZD1211/ZD1211B.                 |
| firmware-realtek          |    ✅     |    ✅    |   ✅   | Microprogramme pour divers périphériques Realtek (cartes réseau, Bluetooth…). |
| firmware-bnx2             |    ✅     |    ✅    |   ✅   | Microprogramme pour cartes réseau Broadcom NetXtreme II.                      |
| firmware-brcm80211        |    ✅     |    ✅    |   ✅   | Microprogramme pour cartes sans fil Broadcom/Cypress 802.11.                  |
| firmware-cavium           |    ✅     |    ✅    |   ✅   | Microprogramme pour processeurs et adaptateurs réseau Cavium.                 |
| firmware-ipw2x00          |    ✅     |    ✅    |   ✅   | Microprogramme pour anciennes cartes Intel Pro/Wireless 2100/2200/2915.       |
| firmware-libertas         |    ✅     |    ✅    |   ✅   | Microprogramme pour cartes sans fil Marvell Libertas 8xxx.                    |
| firmware-ti-connectivity  |    ✅     |    ✅    |   ✅   | Microprogramme pour puces combo Texas Instruments (Wi-Fi, Bluetooth).         |
| firmware-b43-installer    |    ✅     |    ✅    |   ✅   | Installeur pour le microprogramme des cartes Broadcom B43 anciennes.          |
| firmware-sof-signed       |    ✅     |    ✅    |   ✅   | Microprogramme signé pour la plateforme Sound Open Firmware (DSP audio).      |

## Interface graphique de base

### 🖥️ Système graphique (Xorg)

| Paquet                   | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                              |
| :----------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------- |
| xserver-xorg             |    ✅     |    ✅    |   ✅   | Serveur principal du système graphique X.Org.                            |
| xserver-xorg-video-all   |    ✅     |    ✅    |   ✅   | Métapaquet installant tous les pilotes vidéo 2D pour X.Org.              |
| xserver-xorg-video-intel |    ✅     |    ✅    |   ✅   | Pilote vidéo pour les graphiques intégrés Intel.                         |
| xserver-xorg-input-all   |    ✅     |    ✅    |   ✅   | Métapaquet installant tous les pilotes d’entrée (souris, clavier).       |
| xinit                    |    ✅     |    ✅    |   ✅   | Utilitaire pour démarrer le serveur X.                                   |
| xterm                    |    ✅     |    ✅    |   ✅   | Émulateur de terminal standard pour X.                                   |
| blackbox or openbox      |    ✅     |    ✅    |   ✅   | Gestionnaires de fenêtres légers.                                        |
| libxcursor1              |    ✅     |    ✅    |   ✅   | Bibliothèque pour la gestion des curseurs X11.                           |
| breeze-cursor-theme      |    ✅     |    ✅    |   ✅   | Thème de curseur Breeze de KDE.                                          |
| x11-utils                |    ✅     |    ✅    |   ✅   | Ensemble d’utilitaires X11 de base.                                      |
| wmctrl                   |    ✅     |    ✅    |   ✅   | Utilitaire pour contrôler les fenêtres en ligne de commande.             |
| xdotool                  |    ✅     |    ✅    |   ✅   | Utilitaire pour simuler les entrées clavier et souris.                   |
| libdrm-intel1            |    ✅     |    ✅    |   ✅   | Bibliothèque utilisateur pour Intel DRM (Direct Rendering Manager).       |
| libgl1-mesa-dri          |    ✅     |    ✅    |   ✅   | Implémentation OpenGL libre pour le rendu direct.                        |
| libglu1-mesa             |    ✅     |    ✅    |   ✅   | Bibliothèque utilitaire Mesa OpenGL (GLU).                               |

### 🔌 Accès distant (XRDP)

| Paquet            | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                         |
| :---------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| xrdp and xorgxrdp  |    ❌     |    ✅    |   ✅   | Serveur pour se connecter au bureau graphique via le protocole RDP.  |

### 🎨 Composants d’interface

| Paquet                       | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                  |
| :--------------------------- | :------: | :-----: | :---: | :-------------------------------------------- |
| librsvg2-common              |    ✅     |    ✅    |   ✅   | Bibliothèque pour le rendu d’images SVG.      |
| adwaita-icon-theme-antix     |    ✅     |    ✅    |   ✅   | Thème d’icônes Adwaita.                      |
| elementary-minios-icon-theme |    ✅     |    ✅    |   ✅   | Thème d’icônes elementary spécial pour MiniOS.|

## XFCE

### 🖼️ Environnement de bureau (XFCE)

| Paquet                | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                                               |
| :-------------------- | :------: | :-----: | :---: | :---------------------------------------------------------------------------------------- |
| dbus-x11              |    ✅     |    ✅    |   ✅   | Démarre le bus de messages D-Bus dans la session X11, nécessaire à la communication inter-applications. |
| libxfce4ui-utils      |    ✅     |    ✅    |   ✅   | Bibliothèques de widgets et utilitaires communs pour l’interface XFCE.                     |
| thunar                |    ✅     |    ✅    |   ✅   | Gestionnaire de fichiers par défaut dans XFCE.                                             |
| thunar-volman         |    ✅     |    ✅    |   ✅   | Gère le montage automatique des supports amovibles dans Thunar.                            |
| xfce4-appfinder       |    ✅     |    ✅    |   ✅   | Utilitaire pour rechercher et lancer rapidement des applications.                          |
| xfce4-panel           |    ✅     |    ✅    |   ✅   | Tableau de bord du bureau XFCE.                                                           |
| xfce4-session         |    ✅     |    ✅    |   ✅   | Gestionnaire de session XFCE, contrôle le démarrage et l’arrêt de la session.              |
| xfce4-settings        |    ✅     |    ✅    |   ✅   | Centre de contrôle des paramètres XFCE.                                                   |
| xfconf                |    ✅     |    ✅    |   ✅   | Système de configuration pour XFCE.                                                       |
| xfdesktop4            |    ✅     |    ✅    |   ✅   | Gère le bureau : fonds d’écran, icônes, menu.                                             |
| xfwm4                 |    ✅     |    ✅    |   ✅   | Gestionnaire de fenêtres XFCE.                                                            |
| greybird-gtk-theme    |    ✅     |    ✅    |   ✅   | Thème GTK populaire et épuré, souvent utilisé dans XFCE.                                  |
| xfce4-xkb-plugin      |    ✅     |    ✅    |   ✅   | Plugin de panneau pour changer la disposition clavier.                                    |
| xfce4-notifyd         |    ❌     |    ✅    |   ✅   | Démons pour afficher les notifications du bureau.                                         |
| menulibre             |    ❌     |    ✅    |   ✅   | Éditeur de menus avancé pour environnements GTK.                                          |
| network-manager-gnome |    ✅     |    ✅    |   ✅   | Applet graphique pour gérer les connexions réseau (NetworkManager).                       |

### 🛠️ Utilitaires système et graphiques

| Paquet                    | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                                                              |
| :------------------------ | :------: | :-----: | :---: | :-------------------------------------------------------------------------------------------------------- |
| gvfs-backends             |    ✅     |    ✅    |   ✅   | Ensemble de backends pour GVfs, donne accès à FTP, SFTP, SMB, etc. via le gestionnaire de fichiers.       |
| open-vm-tools-desktop     |    ❌     |    ✅    |   ✅   | Composants pour une meilleure intégration de l’OS invité avec VMware (presse-papiers, résolution…).      |
| gtk-update-icon-cache     |    ❌     |    ✅    |   ✅   | Utilitaire pour mettre à jour le cache des thèmes d’icônes GTK.                                          |
| libglib2.0-bin            |    ✅     |    ✅    |   ✅   | Utilitaires binaires pour la bibliothèque GLib 2.0.                                                      |
| at-spi2-core              |    ✅     |    ✅    |   ✅   | Protocole et bibliothèques pour l’accessibilité (lecteurs d’écran, etc.).                                |
| qt5/qt6-gtk-platformtheme |    ❌     |    ✅    |   ✅   | Plugins pour que les applications Qt5/Qt6 utilisent le thème GTK pour une apparence cohérente.           |
| policykit-1-gnome         |    ✅     |    ✅    |   ✅   | Agent d’authentification PolicyKit pour GTK, demande le mot de passe pour les actions privilégiées.      |
| libxml2-utils             |    ✅     |    ✅    |   ✅   | Utilitaires en ligne de commande pour manipuler des fichiers XML (ex : `xmllint`).                       |
| xmlstarlet                |    ✅     |    ✅    |   ✅   | Outil puissant en ligne de commande pour parser, transformer et éditer du XML.                          |

### 🧰 Applications

| Paquet                         | Standard | Toolbox | Ultra | ℹ️ Informations sur le paquet                                                                                          |
| :----------------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------------------------------------------------------------- |
| minios-installer               |    ✅     |    ✅    |   ✅   | Installateur graphique du système MiniOS.                                                                             |
| minios-configurator            |    ✅     |    ✅    |   ✅   | Outil graphique de configuration du système MiniOS.                                                                   |
| mintstick                      |    ✅     |    ✅    |   ✅   | Utilitaire pour formater les clés USB et écrire des images ISO.                                                       |
| mousepad                       |    ✅     |    ✅    |   ✅   | Éditeur de texte simple et rapide pour XFCE.                                                                          |
| ristretto                      |    ✅     |    ✅    |   ✅   | Visionneuse d’images simple et rapide pour XFCE.                                                                      |
| **Navigateurs web**            |
| firefox-esr                    |    ✅     |    ✅    |   ✅   | Navigateur web Firefox avec Extended Support Release (ESR). Version stable recevant des mises à jour de sécurité sur la durée. |
| **Multimédia**                 |
| vlc                            |    ❌     |    ✅    |   ✅   | Lecteur multimédia puissant et populaire, supportant de nombreux formats.                                             |
| vlc-plugin-bittorrent          |    ❌     |    ✅    |   ✅   | Plugin VLC pour lire des vidéos directement depuis des fichiers torrent.                                               |
| vlc-plugin-samba               |    ❌     |    ✅    |   ✅   | Plugin VLC pour accéder aux fichiers sur les partages réseau Samba (Windows).                                          |
| vlc-l10n                       |    ❌     |    ✅    |   ✅   | Paquets de traduction pour l’interface de VLC.                                                                        |
| gimp                           |    ❌     |    ❌    |   ✅   | Puissant éditeur d’images matricielles, alternative à Adobe Photoshop.                                                |
| obs-studio                     |    ❌     |    ❌    |   ✅   | Programme d’enregistrement et de streaming vidéo à partir de l’écran et d’autres sources.                             |
| obs-plugins                    |    ❌     |    ❌    |   ✅   | Plugins et effets supplémentaires pour OBS Studio.                                                                    |
| inkscape                       |    ❌     |    ❌    |   ✅   | Éditeur professionnel d’images vectorielles, alternative à Adobe Illustrator.                                         |
| blender                        |    ❌     |    ❌    |   ✅   | Suite professionnelle de création graphique, animation et vidéo 3D.                                                   |
| audacity                       |    ❌     |    ❌    |   ✅   | Éditeur audio populaire pour l’enregistrement et le traitement du son.                                                |
| rawtherapee                    |    ❌     |    ❌    |   ✅   | Éditeur avancé pour le traitement des photos RAW.                                                                     |
| **Bureautique et documents**   |
| pdfarranger                    |    ❌     |    ✅    |   ✅   | Utilitaire simple pour fusionner, séparer et réorganiser les pages PDF.                                               |
| libreoffice                    |    ❌     |    ❌    |   ✅   | Suite bureautique complète (traitement de texte, tableur, présentations).                                             |
| libreoffice-gtk3               |    ❌     |    ❌    |   ✅   | Intégration de LibreOffice avec le thème GTK3 pour une apparence cohérente.                                           |
| libreoffice-style-elementary   |    ❌     |    ❌    |   ✅   | Thème d’icônes elementary pour LibreOffice.                                                                          |
| fonts-open-sans                |    ❌     |    ❌    |   ✅   | Police Open Sans, populaire et très lisible.                                                                         |
| **Utilitaires système (GUI)**  |
| gparted                        |    ❌     |    ✅    |   ✅   | Éditeur graphique de partitions disque.                                                                              |
| gsmartcontrol                  |    ❌     |    ✅    |   ✅   | Interface graphique pour l’utilitaire smartmontools (surveillance disque).                                            |
| baobab                         |    ❌     |    ✅    |   ✅   | Analyseur graphique d’utilisation de l’espace disque.                                                                |
| hardinfo                       |    ❌     |    ✅    |   ✅   | Utilitaire pour collecter et afficher des informations système et matériel détaillées.                                |
| virt-manager                   |    ❌     |    ✅    |   ✅   | Interface graphique pour gérer les machines virtuelles via libvirt.                                                  |
| gir1.2-spiceclientgtk-3.0      |    ❌     |    ✅    |   ✅   | Bibliothèque pour l’intégration du protocole SPICE (accès distant VM).                                               |
| doublecmd-gtk                  |    ❌     |    ✅    |   ✅   | Gestionnaire de fichiers à deux panneaux, similaire à Total Commander.                                               |
| onboard                        |    ❌     |    ✅    |   ✅   | Clavier virtuel à l’écran pour personnes en situation de handicap.                                                   |
| grsync                         |    ❌     |    ✅    |   ✅   | Interface graphique pour l’utilitaire de synchronisation puissant `rsync`.                                           |
| rescuezilla                    |    ❌     |    ✅    |   ✅   | Outil simple pour créer des sauvegardes et restaurer des disques, alternative à Clonezilla.                          |
| kdiskmark                      |    ❌     |    ✅    |   ✅   | Outil de test de performance disque, alternative à CrystalDiskMark.                                                  |
| qdiskinfo                      |    ❌     |    ✅    |   ✅   | Outil d’affichage des informations disque, alternative à CrystalDiskInfo.                                            |
| bleachbit                      |    ❌     |    ✅    |   ✅   | Utilitaire pour nettoyer le système des fichiers temporaires et inutiles.                                            |
| gtkhash                        |    ❌     |    ✅    |   ✅   | Utilitaire simple pour calculer les sommes de hachage de fichiers.                                                   |
| czkawka / czkawka-gui          |    ❌     |    ✅    |   ✅   | Utilitaire pour trouver et supprimer les fichiers en double, dossiers vides, etc.                                    |
| zulucrypt-gui                  |    ❌     |    ✅    |   ✅   | Interface graphique pour gérer les volumes chiffrés.                                                                 |
| zulumount-gui                  |    ❌     |    ✅    |   ✅   | Interface graphique pour monter les volumes chiffrés.                                                                |
| keepassxc                      |    ❌     |    ✅    |   ✅   | Gestionnaire de mots de passe multiplateforme.                                                                       |
| guymager                       |    ❌     |    ✅    |   ✅   | Outil de copie forensique de disques (création d’images).                                                           |
| isomaster                      |    ❌     |    ✅    |   ✅   | Éditeur graphique d’images disque ISO.                                                                              |
| qphotorec                      |    ❌     |    ✅    |   ✅   | Interface graphique pour l’utilitaire PhotoRec (récupération de fichiers).                                           |
| veracrypt                      |    ❌     |    ✅    |   ✅   | Programme pour créer et gérer des conteneurs et disques chiffrés.                                                   |
| wxhexeditor                    |    ❌     |    ✅    |   ✅   | Éditeur hexadécimal avancé pour gros fichiers.                                                                      |
| synaptic                       |    ❌     |    ❌    |   ✅   | Gestionnaire graphique de paquets classique pour Debian/Ubuntu.                                                     |
| eddy / eddy-handler            |    ❌     |    ❌    |   ✅   | Installateur graphique simple pour paquets .deb locaux.                                                             |
| **Applications réseau (GUI)**  |
| wireshark                      |    ❌     |    ✅    |   ✅   | Analyseur puissant de trafic réseau.                                                                                |
| remmina                        |    ❌     |    ✅    |   ✅   | Client de bureau à distance avec support RDP, VNC, SSH et autres protocoles.                                        |
| remmina-plugin-rdp             |    ❌     |    ✅    |   ✅   | Plugin pour le support du protocole RDP dans Remmina.                                                               |
| remmina-plugin-vnc             |    ❌     |    ✅    |   ✅   | Plugin pour le support du protocole VNC dans Remmina.                                                               |
| gnome-nettool                  |    ❌     |    ✅    |   ✅   | Ensemble d’utilitaires réseau graphiques (ping, traceroute, scan de ports).                                         |
| zenmap                         |    ❌     |    ✅    |   ✅   | Interface graphique officielle pour le scanner réseau nmap.                                                         |
| x11vnc                         |    ❌     |    ✅    |   ✅   | Serveur VNC permettant le contrôle à distance de la session X en cours.                                             |
| uget                           |    ❌     |    ✅    |   ✅   | Gestionnaire de téléchargements graphique.                                                                         |
| android-file-transfer          |    ❌     |    ✅    |   ✅   | Utilitaire pour transférer des fichiers depuis des appareils Android via MTP.                                       |
| **Développement**              |
| codium                         |    ❌     |    ✅    |   ✅   | Version libre de l’éditeur VS Code sans télémétrie Microsoft.                                                      |
