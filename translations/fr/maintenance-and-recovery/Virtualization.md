---
updated: 2026-08-31
---

# Virtualisation

MiniOS peut fonctionner en tant qu’invité dans VirtualBox, VMware, QEMU/KVM et Hyper-V.
Toolbox et Ultra incluent également des logiciels permettant d’exécuter des machines virtuelles QEMU/KVM depuis MiniOS lui-même.

Cette page décrit le comportement de virtualisation propre à MiniOS. Pour créer des machines virtuelles et configurer les hyperviseurs de manière générale, consultez la documentation de l’hyperviseur.

## Exécuter MiniOS en tant qu’invité

### Configuration de machine virtuelle recommandée

Pour une compatibilité maximale, connectez le support de démarrage MiniOS et tout disque virtuel destiné à contenir une installation live de MiniOS à un contrôleur **IDE ou SATA**. Cette recommandation s’applique à VirtualBox, VMware, QEMU/KVM et Hyper-V, lorsqu’un tel contrôleur est disponible.

D’autres contrôleurs de stockage virtuels peuvent fonctionner, mais MiniOS doit pouvoir accéder à sa source live pendant l’étape initramfs, avant que l’arborescence complète des modules du noyau de `01-kernel-*.sb` soit disponible.

### Prise en charge du stockage au démarrage

MiniOS n’embarque volontairement qu’un ensemble limité de pilotes de stockage dans l’initramfs. Les générateurs Dracut et LiveKit actuels appliquent la même politique :

| Interface de stockage | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Oui | Oui |
| NVMe | Oui | Oui |
| Stockage de masse USB / UAS | Oui | Oui |
| Stockage Hyper-V (`hv_storvsc`) | Oui | Oui |
| VirtIO block / SCSI | Non | Oui |
| VMware PVSCSI | Non | Oui |
| Xen block frontend | Non | Non |

Les pilotes SAS/RAID courants, tels que `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` et `aacraid` sont présents dans l’arborescence complète des modules du noyau, mais ne sont pas inclus dans l’initramfs de MiniOS.

Cette distinction ne compte que tant que la source live MiniOS n’a pas été trouvée et que le système complet n’a pas démarré. Un matériel qui fonctionne normalement après le démarrage ne convient pas forcément pour héberger la source live elle-même.

C’est pourquoi, **IDE ou SATA reste le type de stockage recommandé pour les machines virtuelles**, même pour les éditions dont l’initramfs prend également en charge VirtIO ou VMware PVSCSI.

### Intégration des systèmes invités

Le noyau fournit déjà les pilotes de base du matériel virtuel utilisés par les principaux hyperviseurs. Toolbox et Ultra ajoutent des paquets de services invités pour une intégration plus poussée :

| Plateforme | Intégration invitée incluse dans Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` sur les systèmes de base pris en charge |
| Hyper-V | `hyperv-daemons` |

Le noyau Debian actuel utilisé par amd64 MiniOS comprend également les pilotes invités VirtualBox, les pilotes graphiques et réseau VMware, VirtIO et les pilotes Hyper-V. Les paquets de services invités ajoutent des fonctionnalités d’intégration ; ils ne sont pas nécessaires au démarrage de base de la machine virtuelle.

### Gestion de la résolution sous Xfce

MiniOS fournit `/usr/bin/minios-virtual-resolution` via `minios-tools` et le lance au démarrage de la session Xfce. Il détecte les machines virtuelles courantes et n’utilise XRandR que si les outils invités actifs ne gèrent pas déjà l’affichage.

Sans remplacement, la résolution demandée est `1280x800`. Utilisez `virtres=WIDTHxHEIGHT` pour demander une autre résolution ou `novirtres` pour désactiver cet ajustement MiniOS.
Après un ajustement réussi, l’utilitaire crée `~/.config/minios/virtual-resolution-configured`. Dans une session persistante, il ne réappliquera pas l’ajustement automatique tant que ce marqueur n’aura pas été supprimé.

## Utiliser MiniOS comme hôte de virtualisation

Toolbox et Ultra incluent la pile QEMU/KVM utilisée pour les machines virtuelles locales :

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra inclut également sa pile Docker et `lazydocker` pour les charges de travail conteneurisées.

Cette documentation ne décrit pas l’installation de produits de virtualisation qui ne font pas partie d’une édition.

## Voir aussi

- [Compatibilité matérielle](/getting-started/Hardware-Compatibility)
- [Détection du système par l’initrd](/reference/boot-process/System-Discovery)
- [Paramètres de démarrage](/reference/Boot-Parameters)
- [Paquets et éditions](/reference/Package-and-Edition-Contents)
