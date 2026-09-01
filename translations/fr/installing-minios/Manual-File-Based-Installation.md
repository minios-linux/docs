---
updated: 2026-08-31
---

# Installation manuelle basée sur les fichiers

Cette méthode d'installation MiniOS copie les fichiers système sur un système de fichiers classique et installe le programme de démarrage à cet endroit, au lieu d'écrire l'ISO bloc par bloc.
L'espace restant sur le système de fichiers reste disponible pour les fichiers ordinaires, ce qui permet à l'appareil d'être utilisé comme une clé USB classique ainsi que comme périphérique de démarrage MiniOS.

Cette méthode est particulièrement utile si vous souhaitez un accès direct aux fichiers MiniOS, un stockage de données classique sur la même partition, ou une structure modifiable pour des sessions persistantes. Elle utilise le programme de démarrage SYSLINUX et est destinée à Windows et Linux.

## Important

**Avertissement :** Cette procédure repartitionne et formate le périphérique sélectionné. Elle est destructive pour l'ensemble du périphérique, et pas seulement pour les fichiers actuellement visibles. Sauvegardez vos données importantes et vérifiez avec précision le chemin du périphérique, le modèle, la capacité, la partition et le point de montage avant d’exécuter `fdisk`, `mkfs` ou `bootinst`. Déconnectez les autres supports amovibles si possible.

## Exigences pour le support

### Taille du support

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour les exigences système détaillées et les tailles de supports recommandées.

### Exigences techniques

- **Systèmes de fichiers** : FAT32, NTFS, ext2/3/4, Btrfs
- **Schéma de partition** : MBR
- **Démarrage EFI** : Lorsque vous utilisez les systèmes de fichiers NTFS, exFAT ou ext2/3/4, le démarrage en mode EFI peut ne pas être disponible. Pour la compatibilité EFI, il est recommandé d'utiliser FAT32.

## Création d’une clé USB bootable

### Étape 1 : Préparer le support

**Windows :**
1. Ouvrez "Gestion des disques" (`Win+R`, puis `diskmgmt.msc`)
2. Vérifiez le périphérique USB selon son numéro de disque, son modèle et sa capacité. N’allez pas plus loin si un détail est incertain.
3. Faites un clic droit sur son volume et sélectionnez "Supprimer le volume"
4. Faites un clic droit sur l’espace non alloué et sélectionnez "Nouveau volume simple"
5. Choisissez le système de fichiers : FAT32 (recommandé) ou NTFS

**Linux :**

Définissez `TARGET_DISK` et `TARGET_PARTITION` sur les chemins exacts uniquement après avoir vérifié le modèle et la capacité du périphérique dans `lsblk`. L’écriture `fdisk` remplace la table de partitions sur l’ensemble du disque cible. Exécutez un seul `mkfs` correspondant au système de fichiers souhaité.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Étape 2 : Extraire et copier les fichiers

**Montage de l’ISO :**

*Windows :*
- Faites un clic droit sur le fichier ISO et sélectionnez "Monter"

*Linux :*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copie des fichiers :**
1. **Trouvez le dossier `/minios/`** dans l’ISO monté
2. **Copiez l’intégralité du dossier `/minios/`** à la racine de la clé USB

Sous Linux, la racine cible dans l’exemple ci-dessus est `/mnt/minios-target`. Vérifiez que `findmnt --mountpoint /mnt/minios-target` indique bien la partition choisie à l’étape 1 avant de copier les fichiers.

### Étape 3 : Installer le chargeur d’amorçage

Accédez au dossier `/minios/boot/syslinux/` sur le support et lancez l’installateur :

`bootinst` écrit le code de démarrage sur le disque à partir de l’emplacement de l’installateur. Lisez la section [Dépannage](/maintenance-and-recovery/Troubleshooting) avant de modifier le code de démarrage, et ne lancez l’installateur qu’après avoir vérifié le périphérique et le point de montage.

**Windows :**
- Ouvrez la clé USB vérifiée par sa lettre exacte, accédez à `minios\boot\syslinux` et exécutez `bootinst.bat` **en tant qu’administrateur**.

**Linux :**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

N’utilisez pas de caractère générique pour le point de montage. Le script déduit le disque cible à partir de son propre emplacement et écrit le code de démarrage sur ce disque.

## Résultat et persistance

Cette procédure crée une installation live basée sur des fichiers en plaçant l’arborescence `minios/` et le programme de démarrage sur un système de fichiers classique. Il ne s’agit pas d’une écriture brute d’ISO, d’une configuration multiboot avec un fichier ISO, ni d’un déploiement via le MiniOS.

Le système de fichiers choisi détermine les backends de persistance compatibles, mais n’active pas la persistance et ne garantit pas la création d’une session. La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et son activation nécessite toujours un support d’écriture adapté. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance Initrd](/reference/boot-process/Persistence-Internals) avant de compter sur la sauvegarde des modifications.
