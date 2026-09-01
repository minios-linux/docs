---
updated: 2026-08-31
---

# Virtualisation

MiniOS peut fonctionner en tant qu’invité dans VirtualBox, VMware, QEMU/KVM et Hyper-V.
Toolbox et Ultra incluent également des logiciels permettant d’exécuter des machines virtuelles QEMU/KVM directement depuis MiniOS.

Cette page documente le comportement spécifique à la virtualisation de MiniOS. Pour la création classique de VM et la configuration de l’hyperviseur, veuillez consulter la documentation de l’hyperviseur.

## Exécuter MiniOS en tant qu’invité

### Disposition recommandée pour la VM

Pour une compatibilité maximale, connectez le support de démarrage MiniOS et tout disque virtuel destiné à contenir une installation live de MiniOS via un **contrôleur IDE ou SATA**. Cette recommandation s’applique à VirtualBox, VMware, QEMU/KVM et Hyper-V dès qu’un tel contrôleur est disponible.

D’autres contrôleurs de stockage virtuel peuvent fonctionner, mais MiniOS doit pouvoir accéder à sa source live pendant la phase initramfs, avant que l’arborescence complète des modules noyau depuis `01-kernel-*.sb` ne soit disponible.

### Prise en charge du stockage au démarrage précoce

MiniOS n’embarque volontairement qu’un ensemble restreint de pilotes de stockage dans l’initramfs. Les outils Dracut et LiveKit actuels appliquent la même politique :

| Interface de stockage | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Oui | Oui |
| NVMe | Oui | Oui |
| Stockage de masse USB / UAS | Oui | Oui |
| Stockage Hyper-V (`hv_storvsc`) | Oui | Oui |
| VirtIO block / SCSI | Non | Oui |
| VMware PVSCSI | Non | Oui |
| Xen block frontend | Non | Non |

Les pilotes SAS/RAID courants comme `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` et `aacraid` sont présents dans l’arborescence complète des modules noyau mais ne sont pas inclus dans l’initramfs de MiniOS.

Cette distinction n’a d’importance que tant que la source live de MiniOS n’a pas été trouvée et que le système complet n’a pas démarré. Un matériel fonctionnant normalement après le démarrage n’est pas forcément adapté pour héberger la source live elle-même.

Pour cette raison, **IDE ou SATA reste le choix de stockage VM recommandé**, même pour les éditions dont l’initramfs inclut aussi la prise en charge de VirtIO ou VMware PVSCSI.

### Intégration de l’invité

Le noyau fournit déjà les pilotes matériels virtuels de base utilisés par les principaux hyperviseurs. Toolbox et Ultra ajoutent des paquets de services invités pour une intégration renforcée :

| Plateforme | Intégration invitée incluse dans Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` sur bases compatibles |
| Hyper-V | `hyperv-daemons` |

Le noyau Debian actuel utilisé par amd64 MiniOS contient également les pilotes invités VirtualBox, les pilotes graphiques/réseau VMware, VirtIO et Hyper-V. Les paquets de services invités ajoutent des fonctionnalités d’intégration ; ils ne sont pas nécessaires pour le simple démarrage d’une VM.

### Gestion de la résolution Xfce

MiniOS fournit `/usr/bin/minios-virtual-resolution` via `minios-tools` et le lance depuis la session de démarrage automatique Xfce. Il détecte les machines virtuelles courantes et utilise XRandR uniquement si des outils invités actifs ne gèrent pas déjà l’affichage.

Sans modification, la résolution demandée est `1280x800`. Utilisez `virtres=WIDTHxHEIGHT` pour demander une autre résolution ou `novirtres` pour désactiver cet ajustement MiniOS.
Après un ajustement réussi, l’utilitaire crée `~/.config/minios/virtual-resolution-configured`. Dans une session persistante, il n’appliquera plus l’ajustement automatique tant que ce marqueur n’aura pas été supprimé.

## Utiliser MiniOS comme hôte de virtualisation

Toolbox et Ultra incluent la pile QEMU/KVM utilisée pour les machines virtuelles locales :

- `qemu-system-x86` ;
- `qemu-utils` ;
- `libvirt-daemon-system` ;
- `virt-manager`.

Ultra inclut en plus sa pile Docker et `lazydocker` pour les charges de travail en conteneur.

Cette documentation ne décrit pas l’installation de produits de virtualisation qui ne font pas partie d’une édition.

## Voir aussi

- [Compatibilité matérielle](/getting-started/Hardware-Compatibility)
- [Découverte du système initrd](/reference/boot-process/System-Discovery)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Paquets et éditions](/reference/Package-and-Edition-Contents)
