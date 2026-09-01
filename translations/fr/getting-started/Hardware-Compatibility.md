---
updated: 2026-08-31
---

# Compatibilité matérielle

MiniOS est conçu pour fonctionner sur différents ordinateurs x86, plutôt que d'être limité à une seule machine. Le test de compatibilité le plus fiable consiste donc à démarrer l'image réelle MiniOS sur le matériel cible et à vérifier les périphériques que vous souhaitez utiliser.

La prise en charge matérielle dépend de l'image sélectionnée : son architecture, la distribution de base, le noyau, le firmware, les pilotes, l'environnement de bureau et l'édition sont tous importants. Une image MiniOS plus récente ou différente peut prendre en charge du matériel qu'une version plus ancienne ne gère pas.

## Architecture

MiniOS prend en charge les systèmes x86 64 bits et 32 bits :

| Architecture de l'image | À utiliser pour |
|---|---|
| **amd64** | Ordinateurs x86 64 bits |
| **i386** | Ordinateurs x86 32 bits pris en charge |

Utilisez l'architecture indiquée dans le nom de l'image et la description de la version. La disponibilité des images 32 bits dépend de la version MiniOS et de la distribution de base.

## Firmware et démarrage

Les images PC MiniOS peuvent démarrer via le BIOS hérité ou l’UEFI lorsque les fichiers de démarrage requis sont présents dans l’image sélectionnée. Les implémentations de firmware varient beaucoup, donc le même périphérique USB peut apparaître différemment dans le menu de démarrage selon les ordinateurs.

Les images MiniOS 64 bits actuelles utilisent le noyau Debian et les composants EFI de Debian.
Elles prennent donc en charge le **Secure Boot** sur les systèmes amd64.

Les images i386 32 bits utilisent un noyau construit par MiniOS car Debian ne publie plus de paquets noyau 32 bits. Ce noyau reste identique au noyau Debian correspondant, mais il est compilé par MiniOS et ne fait pas partie de la chaîne de démarrage signée de Debian. Par conséquent, **le Secure Boot n’est pas pris en charge par les images i386 MiniOS**.

## Mémoire

La mémoire minimale recommandée dépend de l’édition :

| Édition | RAM minimale recommandée |
|---|---:|
| **Flux** | 512 Mo |
| **Standard** | 756 Mo |
| **Toolbox** | 756 Mo |
| **Ultra** | 756 Mo |

Ces valeurs correspondent à une utilisation normale depuis le support de démarrage. Les applications réelles peuvent nécessiter plus de mémoire.

**Le mode Exécuter depuis RAM** nécessite de la mémoire supplémentaire car les données MiniOS sont copiées dans RAM en même temps que le système et les applications en cours d’exécution. Les images plus volumineuses requièrent donc nettement plus de mémoire dans ce mode.

Consultez [Modes de démarrage](/using-minios/Boot-Modes) avant d’utiliser **Exécuter depuis RAM** sur un ordinateur avec peu de mémoire.

## Graphismes

Les images amd64 MiniOS actuelles utilisent la pile graphique Debian avec Xorg et Mesa.
Le noyau inclut les pilotes Intel `i915` et `xe`, AMD `amdgpu` et `radeon`, ainsi que le pilote open source NVIDIA `nouveau`.

Xorg inclut son pilote générique `modesetting` ainsi que les pilotes Intel, AMD/ATI, Radeon, Nouveau, VESA et framebuffer. Mesa fournit la pile d’accélération 3D standard utilisée par Intel, AMD et les pilotes open source pris en charge.

Les images MiniOS basées sur Debian installent les collections de microprogrammes Debian en plus des paquets de microprogrammes spécifiques aux fabricants. L’image Trixie Standard actuelle inclut `firmware-amd-graphics` et `firmware-misc-nonfree` ; les images basées sur Ubuntu utilisent `linux-firmware` à la place.

Les listes de paquets MiniOS maintenues n’incluent pas le pilote noyau propriétaire NVIDIA. Le matériel NVIDIA utilise donc par défaut le pilote `nouveau` inclus. Le matériel ou les fonctionnalités nécessitant spécifiquement le pilote propriétaire NVIDIA doivent l’ajouter séparément.

Les graphismes virtuels sont également pris en charge par les pilotes noyau et Xorg pour les périphériques VMware, QXL, Bochs et Hyper-V courants.

## Matériel réseau

Les images amd64 MiniOS actuelles utilisent le noyau Debian avec son ensemble habituel de pilotes réseau. Le noyau 6.12 utilisé par les images Trixie actuelles inclut des pilotes pour les matériels Ethernet et Wi-Fi Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell et autres courants.

Les pilotes Ethernet courants incluent Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` et `ixgbe` ; Realtek `8139` et `r8169` ; Broadcom `tg3`, `bnx2`, `bnx2x` et `bnxt` ; Atheros `atl*` et `alx` ; Marvell `sky2` ; ainsi que les pilotes Ethernet USB courants tels que ASIX, `r8152`, CDC Ethernet/NCM et RNDIS.

La prise en charge Wi-Fi inclut Intel `iwlwifi` ; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` et `ath12k` ; Broadcom `brcmfmac`, `brcmsmac` et `b43` ; MediaTek `mt76` ; Ralink `rt2x00` ; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` et `rtw89` ; ainsi que plusieurs anciens pilotes Marvell, Intersil, ZyDAS et autres.

MiniOS ajoute également des modules DKMS pour le matériel insuffisamment pris en charge par le noyau standard. L’ensemble de modules amd64 actuel inclut des pilotes Wi-Fi USB Realtek supplémentaires pour les adaptateurs RTL8188EU, RTL8814AU, RTL8811/RTL8821AU et RTL88xxAU apparentés, ainsi que le pilote Broadcom STA `wl`.

L’ensemble de microprogrammes inclut les paquets de firmware Debian pour Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium et d’autres matériels réseau courants.
La disponibilité exacte dépend toujours de la version MiniOS, de l’architecture et du noyau sélectionné.

Pour le réseau classique après le démarrage, MiniOS utilise NetworkManager. Si un adaptateur n’est pas détecté du tout, modifier les paramètres de NetworkManager ne fournira pas un pilote noyau ou un firmware manquant. Voir [Configuration réseau](/using-minios/Networking) pour l’utilisation normale du réseau.

## Stockage

Pour un démarrage live MiniOS, le contrôleur de stockage est important à deux niveaux : le firmware doit pouvoir lancer le chargeur d’amorçage, puis l’initramfs MiniOS doit pouvoir détecter le périphérique contenant l’arborescence de données `minios/`.

MiniOS inclut volontairement uniquement certains pilotes de stockage dans son initramfs.
Les versions actuelles incluent toujours la prise en charge IDE/PATA/SATA, NVMe, SD/MMC, stockage USB/UAS et Hyper-V. Les éditions Standard, Toolbox et Ultra ajoutent la prise en charge VirtIO block/SCSI et VMware PVSCSI à l’initramfs ; Flux ne l’inclut pas.

L’arborescence complète des modules noyau contient des pilotes de stockage supplémentaires qui ne sont pas disponibles lors de la découverte initiale des sources MiniOS. Si le menu de démarrage apparaît mais que MiniOS ne trouve pas ses modules, consultez [Découverte système par initrd](/reference/boot-process/System-Discovery).

## Machines virtuelles

MiniOS prend en charge le matériel virtuel courant utilisé par VirtualBox, VMware, QEMU/KVM et Hyper-V. Pour les supports de démarrage et les disques cibles d’installation, privilégiez un **contrôleur IDE ou SATA** si l’hyperviseur en propose un. Ces contrôleurs offrent le comportement le plus prévisible lors du démarrage et de l’installation.

Le noyau Debian 6.12 actuel inclut déjà les principaux pilotes matériels invités :

| Hyperviseur | Pilotes inclus dans le noyau |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO block, réseau, graphismes, entrée, balloon, SCSI, son et pilotes associés |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm` et prise en charge de l’entrée Hyper-V |

Ces pilotes noyau suffisent pour le fonctionnement de base de la machine virtuelle. Des services invités supplémentaires assurent l’intégration avec l’hôte, comme la gestion automatique de l’affichage, l’arrêt propre, le partage de fichiers et la communication hôte/invité.

Toolbox et Ultra incluent `open-vm-tools` et `open-vm-tools-desktop` pour VMware, `qemu-guest-agent` pour QEMU/KVM et `hyperv-daemons` pour Hyper-V. Sur les suites compatibles, y compris les images Trixie actuelles, ils incluent aussi `virtualbox-guest-utils` et `virtualbox-guest-x11`. Flux et Standard n’incluent pas ces paquets de services invités par défaut.

Voir [Virtualisation](/maintenance-and-recovery/Virtualization) et [Paquets et éditions](/reference/Package-and-Edition-Contents) pour les logiciels spécifiques à chaque édition.

## Tester un ordinateur avant de s’y fier

1. Démarrez exactement l’image MiniOS que vous prévoyez d’utiliser.
2. Utilisez le mode par défaut **Démarrer MiniOS** pour un test classique, ou **Démarrer sans sauvegarde** si vous ne souhaitez pas ouvrir ou créer de session persistante.
3. Vérifiez l’affichage, le clavier et les dispositifs de pointage, le son, les connexions filaires et sans fil, les périphériques de stockage nécessaires et la mise en veille/reprise si vous comptez l’utiliser.
4. Si vous prévoyez d’utiliser la persistance, effectuez une petite modification de test, redémarrez et vérifiez que la session attendue a bien été activée et que la modification a été conservée.
5. Ce n’est qu’après ces vérifications que vous pourrez compter sur la machine pour des tâches importantes ou effectuer des opérations destructrices sur le disque.

En cas de problème, déterminez d’abord si celui-ci survient avant le menu de démarrage, pendant la découverte de la source MiniOS, ou après le démarrage du système d’exploitation.
Cette distinction permet généralement de savoir s’il faut examiner le firmware, l’initramfs ou la prise en charge matérielle Linux classique.
