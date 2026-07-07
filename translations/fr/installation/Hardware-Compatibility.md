# Guide de compatibilité matérielle

Ce guide fournit des informations essentielles sur la compatibilité matérielle pour MiniOS. Le système est basé sur Debian 13 "Trixie" avec un noyau Linux Long-Term Support (LTS), garantissant une large prise en charge du matériel.

## Configuration requise

MiniOS est conçu pour l’architecture **amd64** (64 bits). Les exigences varient selon l’édition :

**Pour la variante Standard :**
- **Processeur :** Processeur 64 bits à 1 GHz
- **RAM :** 1 Go minimum (2 Go recommandés)
- **Stockage :** 2 Go pour exécuter le système (4 Go+ recommandés pour le stockage de données)
- **Graphismes :** Carte graphique compatible VGA

**Pour la variante Toolbox :**
- **Processeur :** Processeur 64 bits à 1,2 GHz
- **RAM :** 2 Go minimum (4 Go recommandés)
- **Stockage :** 2 Go pour exécuter le système (8 Go+ recommandés pour le stockage de données)
- **Graphismes :** Carte graphique avec prise en charge de l’accélération matérielle

**Pour la variante Ultra :**
- **Processeur :** Processeur double cœur 64 bits à 1,5 GHz
- **RAM :** 4 Go minimum (8 Go recommandés)
- **Stockage :** 2 Go pour exécuter le système (8 Go+ recommandés pour le stockage de données)
- **Graphismes :** GPU moderne avec accélération matérielle

## Compatibilité des composants

### Processeurs

Un large éventail de processeurs x86 64 bits d’Intel (Core i3/i5/i7/i9) et d’AMD (Ryzen 3/5/7/9) sont pris en charge.

### Graphismes

- **Intel :** Les cartes graphiques intégrées (UHD, Iris Xe, Arc) sont bien prises en charge.
- **NVIDIA :** Le pilote open source Nouveau est inclus. Pour les cartes récentes, il est recommandé d’installer le pilote propriétaire pour des performances optimales.
- **AMD :** Les cartes graphiques Radeon RX récentes sont entièrement prises en charge par le pilote open source AMDGPU.

### Réseau

- **Ethernet :** La plupart des contrôleurs filaires Intel, Realtek et Broadcom fonctionnent immédiatement.
- **Wi-Fi :** Un grand nombre d’adaptateurs Wi-Fi sont pris en charge grâce aux firmwares inclus et aux pilotes DKMS compilés automatiquement, en particulier les modèles courants d’Intel, Atheros et Realtek.

### Stockage

MiniOS est conçu pour démarrer depuis une variété de périphériques de stockage. Les scripts de démarrage du système analysent automatiquement tous les périphériques blocs disponibles, assurant la compatibilité avec :

- **Clés USB :** Toutes les générations d’USB sont prises en charge.
- **Disques SATA/IDE :** Tous les disques durs et SSD internes standards.
- **Disques NVMe :** Prise en charge complète des SSD NVMe récents.
- **Cartes SD/MMC :** Prises en charge si le lecteur de cartes est reconnu par le noyau.

### Virtualisation

MiniOS est entièrement optimisé pour une utilisation en tant que système invité dans tous les principaux environnements de virtualisation. Le processus de construction inclut tous les pilotes nécessaires dans le ramdisk initial (`initrd`) pour garantir des performances maximales dès le démarrage.

- **Pilotes haute performance :** La prise en charge des contrôleurs de stockage paravirtualisés est intégrée, notamment **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI** et **Hyper-V Storvsc**. Cela permet des performances d’E/S disque proches du natif.
- **Compatibilité étendue :** Le système peut également démarrer depuis des contrôleurs **IDE** et **SATA** émulés, assurant la compatibilité avec toute configuration d’hyperviseur.
- **Outils invités :** Pour une intégration avancée (souris fluide, partage du presse-papiers, résolution dynamique, etc.), les variantes `toolbox` et `ultra` incluent `open-vm-tools` (pour VMware) et `hyperv-daemons` (pour Hyper-V).

Pour des instructions détaillées et des configurations spécifiques à chaque plateforme, consultez le [Guide de virtualisation](/administration/Virtualization.md).
