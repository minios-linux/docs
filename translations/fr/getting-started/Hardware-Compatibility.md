---
updated: 2026-10-15
---

# Compatibilité matérielle

MiniOS est conçu pour fonctionner sur différents ordinateurs x86, et non sur une seule machine. Le test de compatibilité le plus fiable consiste donc à démarrer l’image MiniOS sur le matériel cible et à vérifier les périphériques que vous souhaitez utiliser.

La prise en charge matérielle dépend de l’image sélectionnée : son architecture, sa distribution de base, son noyau, son firmware, ses pilotes, son environnement de bureau et son édition comptent tous. Une image MiniOS plus récente ou différente peut prendre en charge du matériel qui ne l’est pas par une image plus ancienne.

## Architecture

MiniOS prend en charge les systèmes x86 64 bits et 32 bits :

| Architecture de l’image | Utilisation |
|---|---|
| **amd64** | Ordinateurs x86 64 bits |
| **i386** | Ordinateurs x86 32 bits pris en charge |

Utilisez l’architecture indiquée dans le nom de l’image et la description de la version. La disponibilité des images 32 bits dépend de la version MiniOS et de la distribution de base.

## Firmware et démarrage

Les images PC MiniOS peuvent démarrer en mode BIOS hérité ou UEFI si l’image sélectionnée contient les fichiers de démarrage nécessaires. Les implémentations du firmware varient beaucoup : une même clé USB peut donc apparaître différemment dans le menu de démarrage selon l’ordinateur.

Secure Boot dépend de l’ensemble de la chaîne du noyau et EFI de l’image, et pas uniquement de son architecture. Les versions Debian/Ubuntu amd64 utilisant le noyau de distribution signé correspondant et les composants EFI associés peuvent prendre en charge Secure Boot. Un noyau personnalisé ou non signé fourni par MiniOS n’est pas considéré comme fiable simplement parce que des fichiers EFI signés sont présents. DynBlk et le pilote externe AUFS-NG ne sont pas signés : Secure Boot désactive les sessions DynBlk/VMDK et laisse généralement OverlayFS pour la composition des modules.

Les images i386 actuelles utilisent un noyau compilé par MiniOS lorsque la distribution de base sélectionnée ne fournit plus de noyau 32 bits adapté. Les noyaux MiniOS sont des compilations distinctes intégrant MiniOS ; ils ne garantissent pas des binaires Debian identiques octet pour octet et ne font pas partie de la chaîne de signature de Debian. **Secure Boot n’est pas pris en charge par ces images i386.** La version du firmware (32 ou 64 bits) est un facteur distinct de compatibilité au démarrage.

## Mémoire

Les besoins en mémoire dépendent de la version utilisée, de l’environnement de bureau, des applications et du type de session. Flux nécessite généralement moins de mémoire que les éditions XFCE complètes ; un navigateur, une suite bureautique, une machine virtuelle ou un instantané de persistance volumineux peut en demander bien davantage que l’environnement de bureau seul. Consultez la configuration requise indiquée pour la version et testez les tâches prévues, plutôt que de considérer une ancienne valeur de RAM valable pour toutes les images actuelles.

**Exécuter depuis la RAM** nécessite davantage de mémoire, car les données MiniOS sont copiées dans RAM en même temps que le système et les applications en cours d’exécution. Dans ce mode, les images volumineuses nécessitent donc beaucoup plus de mémoire.

Consultez les [Modes de démarrage](/using-minios/Boot-Modes) avant d’utiliser **Exécuter depuis la RAM** sur un ordinateur disposant de peu de mémoire.

## Graphismes

Les images amd64 MiniOS actuelles utilisent la pile graphique Debian avec Xorg et Mesa.
Selon le noyau sélectionné, ses modules prennent en charge les cartes graphiques Intel `i915` et `xe`, AMD `amdgpu` et `radeon`, ainsi que les cartes graphiques NVIDIA `nouveau` open source.

Xorg inclut son pilote générique `modesetting` ainsi que les pilotes Intel, AMD/ATI, Radeon, Nouveau, VESA et framebuffer. Mesa fournit la pile d’accélération 3D standard utilisée par Intel, AMD et les pilotes open source compatibles.

Les images basées sur Debian MiniOS demandent les collections de firmware Debian ainsi que des paquets spécifiques aux fabricants, notamment `firmware-intel-graphics` sur Trixie et Excalibur. Le firmware effectivement installé dépend de la disponibilité des dépôts et de la création de l’image. Les images basées sur Ubuntu utilisent `linux-firmware` à la place.

Les listes de paquets maintenues de MiniOS n’incluent pas le pilote de noyau propriétaire NVIDIA. Le matériel NVIDIA utilise donc par défaut le pilote `nouveau` inclus. Le matériel ou les fonctionnalités qui nécessitent spécifiquement le pilote propriétaire NVIDIA requièrent une installation séparée de celui-ci.

Les pilotes du noyau et de Xorg prennent également en charge les cartes graphiques virtuelles courantes VMware, QXL, Bochs et Hyper-V.

### Mise à l’échelle et gestion des fenêtres XFCE

Les images XFCE de Debian 13 et Devuan Excalibur utilisent des paramètres et des paquets de bureau adaptés à MiniOS, la liste des tâches MiniOS et les greffons Afficher le bureau, ainsi que `xfwm4-gl` à la place de `xfwm4`. Les paramètres d’affichage proposent une mise à l’échelle automatique de l’interface ou un réglage manuel de 100 à 200 % par paliers de 25 %, avec aperçu temporaire et possibilité d’annulation. Le texte, les contrôles, les décorations et les curseurs thématiques suivent la mise à l’échelle de l’interface ; le facteur de mise à l’échelle des pixels et la résolution du moniteur se règlent séparément. Les réglages manuels enregistrés prennent le pas sur le mode automatique.

`xfwm4-gl` utilise OpenGL par défaut, avec un repli sur XRender. Les réglages du gestionnaire de fenêtres permettent de configurer le flou, les animations, la désactivation de la composition en plein écran et l’apparence d’Alt+Tab. Alt+Tab et les miniatures de la barre des tâches peuvent assombrir ou masquer les autres fenêtres pour afficher un aperçu sans activer la fenêtre concernée ; les images mises en cache des fenêtres réduites sont utilisées lorsqu’elles sont disponibles. Le fondu, la mise à l’échelle et l’aperçu Peek fonctionnent avec les deux moteurs de rendu, tandis que le flou et Magic Lamp nécessitent OpenGL. Les autres éditions conservent les composants XFCE de leur distribution.

### Paquets MateBook E facultatifs

La prise en charge du Huawei MateBook E 2023 est disponible sous forme de paquets Linux 6.12 installables séparément ; ne supposez pas qu’ils sont inclus dans une image de version. `matebook-e-dsi-dkms` fournit un rétroportage expérimental pour l’écran interne : des bandes de couleur résiduelles et la suspension et la reprise non validées restent des limitations. L’intégration de la caméra utilise `matebook-e-cameras-dkms` et le paquet d’espace utilisateur amd64/systemd `matebook-e-cameras`. Les paquets de la caméra n’installent pas le pilote expérimental du stylet.

## Matériel réseau

Les images amd64 MiniOS actuelles utilisent le noyau Debian et son ensemble standard de pilotes réseau. Le noyau 6.12 utilisé par les images Trixie actuelles inclut des pilotes pour les composants Ethernet et Wi-Fi courants d’Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell et d’autres fabricants.

Les pilotes Ethernet courants comprennent Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice`, ainsi que `ixgbe` ; Realtek `8139` et `r8169` ; Broadcom `tg3`, `bnx2`, `bnx2x`, ainsi que `bnxt` ; Atheros `atl*` et `alx` ; Marvell `sky2` ; ainsi que les pilotes Ethernet USB courants tels que ASIX, `r8152`, CDC Ethernet/NCM et RNDIS.

La prise en charge du Wi-Fi comprend Intel `iwlwifi` ; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k`, ainsi que `ath12k` ; Broadcom `brcmfmac`, `brcmsmac` et `b43` ; MediaTek `mt76` ; Ralink `rt2x00` ; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88`, ainsi que `rtw89` ; et plusieurs pilotes plus anciens de Marvell, Intersil, ZyDAS et d’autres fabricants.

MiniOS ajoute également des modules DKMS pour le matériel insuffisamment pris en charge par le noyau standard. L’ensemble de modules amd64 actuel comprend des pilotes Wi-Fi USB Realtek supplémentaires pour RTL8188EU, RTL8814AU, RTL8811/RTL8821AU et les adaptateurs RTL88xxAU associés, ainsi que le pilote Broadcom STA `wl` .

L’ensemble de firmware comprend des paquets de firmware Debian pour Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium et d’autres composants réseau courants.
La disponibilité exacte dépend toujours de la version MiniOS, de l’architecture et du noyau sélectionné.

Pour la gestion habituelle du réseau après le démarrage, MiniOS utilise NetworkManager. Si un adaptateur n’est pas détecté, modifier les paramètres de NetworkManager ne permettra pas d’ajouter le pilote du noyau ou le firmware manquant. Consultez [Configuration réseau](/using-minios/Networking) pour une utilisation normale du réseau.

## Stockage

Pour démarrer en mode MiniOS, le contrôleur de stockage joue un double rôle : le firmware doit pouvoir lancer le chargeur d’amorçage, puis l’initramfs MiniOS doit pouvoir détecter le périphérique qui contient l’arborescence `minios/` de données.

MiniOS n’inclut volontairement que certains pilotes de stockage dans son initramfs.
Les versions actuelles incluent toujours la prise en charge IDE/PATA/SATA, NVMe, SD/MMC, du stockage de masse USB/UAS et du stockage Hyper-V. Standard, Toolbox et Ultra ajoutent également à l’initramfs la prise en charge de VirtIO block/SCSI et de VMware PVSCSI ; Flux ne le fait pas.

L’arborescence complète des modules du noyau contient d’autres pilotes de stockage qui ne sont pas disponibles lors de la détection initiale de la source MiniOS. Si le menu d’amorçage s’affiche, mais que MiniOS ne trouve pas ses modules, consultez [Détection du système dans l’initrd](/reference/boot-process/System-Discovery).

## Machines virtuelles

MiniOS prend en charge le matériel virtuel courant utilisé par VirtualBox, VMware, QEMU/KVM et Hyper-V. Pour les supports de démarrage et les disques de destination de l’installation, privilégiez un contrôleur **IDE ou SATA** lorsque l’hyperviseur en propose un. Ces contrôleurs offrent le comportement le plus prévisible au démarrage et pendant l’installation.

Le noyau Debian 6.12 actuel inclut déjà les principaux pilotes matériels pour les systèmes invités :

| Hyperviseur | Pilotes inclus dans le noyau |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | Pilotes VirtIO pour le stockage en mode bloc, le réseau, l’affichage, les périphériques d’entrée, le ballooning, SCSI, le son et d’autres fonctions |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`et prise en charge des périphériques d’entrée Hyper-V |

Ces pilotes du noyau suffisent au fonctionnement de base du système invité. Des services supplémentaires permettent l’intégration avec l’hôte, notamment la gestion automatique de l’affichage, l’arrêt propre, le partage de fichiers et la communication entre l’hôte et l’invité.

Toolbox et Ultra incluent `open-vm-tools` et `open-vm-tools-desktop` pour VMware, `qemu-guest-agent` pour QEMU/KVM, et `hyperv-daemons` pour Hyper-V. Sur les versions prises en charge, y compris les images Trixie actuelles, ils incluent également `virtualbox-guest-utils` et `virtualbox-guest-x11`. Flux et Standard n’incluent pas ces paquets de services invités par défaut.

Consultez [Virtualisation](/maintenance-and-recovery/Virtualization) et [Paquets et éditions](/reference/Package-and-Edition-Contents) pour découvrir les logiciels propres à chaque édition.

## Tester un ordinateur avant de l’utiliser

1. Démarrez l’image MiniOS exacte que vous comptez utiliser.
2. Utilisez le mode **Démarrer MiniOS** pour les tests habituels, ou **Démarrer sans enregistrer** si vous ne souhaitez pas ouvrir ni créer de session persistante.
3. Vérifiez l’affichage, le clavier et les périphériques de pointage, le son, les connexions réseau filaires et sans fil, les périphériques de stockage dont vous avez besoin, ainsi que la mise en veille et la reprise si vous comptez les utiliser.
4. Si vous prévoyez d’utiliser la persistance, effectuez une petite modification de test, redémarrez et vérifiez que la session attendue a bien été activée et que la modification a été conservée.
5. Ce n’est qu’ensuite que vous pourrez confier des tâches importantes à la machine ou effectuer des opérations destructives sur le disque.

En cas de problème, déterminez d’abord s’il survient avant le menu d’amorçage, pendant la détection de la source MiniOS, ou après le démarrage du système d’exploitation.
Cette distinction permet généralement de savoir s’il faut examiner le firmware, l’initramfs ou la prise en charge matérielle standard de Linux.
