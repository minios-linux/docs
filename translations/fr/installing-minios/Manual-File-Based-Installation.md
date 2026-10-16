---
updated: 2026-08-31
---

# Installation manuelle à partir d’un fichier

Cette méthode d’installation MiniOS copie les fichiers système sur un système de fichiers classique et y installe le chargeur d’amorçage, au lieu d’écrire l’image ISO bloc par bloc.
L’espace restant sur le système de fichiers reste disponible pour des fichiers ordinaires. Le périphérique peut donc continuer à servir de clé USB classique et de périphérique d’amorçage MiniOS.

Cette méthode est particulièrement utile si vous souhaitez accéder directement aux fichiers MiniOS, stocker des données ordinaires sur la même partition ou utiliser une configuration accessible en écriture pour des sessions persistantes. Elle utilise le chargeur d’amorçage SYSLINUX et est conçue pour Windows et Linux.

## Important

**Avertissement :** Cette procédure repartitionne et formate le périphérique sélectionné. Elle efface l’intégralité du périphérique, et pas seulement les fichiers actuellement visibles. Sauvegardez les données importantes et vérifiez précisément le chemin d’accès, le modèle, la capacité, la partition et le point de montage du périphérique avant d’exécuter `fdisk`, `mkfs` ou `bootinst`. Déconnectez les autres lecteurs amovibles si possible.

## Exigences relatives au lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour connaître les exigences système détaillées et les tailles de lecteur recommandées.

### Exigences techniques

- **Systèmes de fichiers** : FAT32, NTFS, ext2/3/4, Btrfs
- **Schéma de partitionnement** : MBR
- **Démarrage EFI** : avec les systèmes de fichiers NTFS, exFAT ou ext2/3/4, le démarrage en mode EFI peut ne pas être disponible. Pour prendre en charge EFI, FAT32 est recommandé.

## Créer une clé USB amorçable

### Étape 1 : préparer la clé

**Windows :**
1. Ouvrez « Gestion des disques » (`Win+R`, puis `diskmgmt.msc`)
2. Vérifiez le périphérique USB à l’aide de son numéro de disque, de son modèle et de sa capacité. Ne continuez pas si vous avez le moindre doute.
3. Cliquez avec le bouton droit sur son volume et sélectionnez « Supprimer le volume »
4. Cliquez avec le bouton droit sur l’espace non alloué et sélectionnez « Nouveau volume simple »
5. Choisissez le système de fichiers : FAT32 (recommandé) ou NTFS

**Linux :**

Définissez `TARGET_DISK` et `TARGET_PARTITION` uniquement sur des chemins exacts, après avoir vérifié le modèle et la capacité du périphérique dans `lsblk`. La commande `fdisk` remplace la table de partition de l’intégralité du disque cible. N’exécutez qu’une seule commande `mkfs` correspondant au système de fichiers souhaité.

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

### Étape 2 : extraire et copier les fichiers

**Monter l’image ISO :**

*Windows :*
- Cliquez avec le bouton droit sur le fichier ISO et sélectionnez « Monter »

*Linux :*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copier les fichiers :**
1. **Recherchez le dossier `/minios/`** dans l’image ISO montée
2. **Copiez l’intégralité du dossier `/minios/`** à la racine de la clé USB

Sous Linux, la racine cible de l’exemple ci-dessus est `/mnt/minios-target`. Vérifiez que `findmnt --mountpoint /mnt/minios-target` indique bien la partition exacte sélectionnée à l’étape 1 avant de copier les fichiers.

### Étape 3 : installer le chargeur d’amorçage

Accédez au dossier `/minios/boot/syslinux/` du lecteur et lancez le programme d’installation :

`bootinst` écrit le code d’amorçage sur le disque déterminé à partir de l’emplacement du programme d’installation. Consultez la section [Dépannage](/maintenance-and-recovery/Troubleshooting) avant de modifier le code d’amorçage. Ne lancez pas le programme d’installation avant d’avoir vérifié son périphérique et son point de montage.

**Windows :**
- Ouvrez le lecteur USB vérifié en utilisant sa lettre exacte, accédez à `minios\boot\syslinux` et lancez `bootinst.bat` **en tant qu’administrateur**.

**Linux :**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Ne remplacez pas le point de montage par un caractère générique. Le script détermine le disque cible à partir de son propre emplacement et y écrit le code d’amorçage.

## Résultat et persistance

Cette procédure crée une installation live basée sur des fichiers en plaçant l’arborescence `minios/` et le chargeur d’amorçage sur un système de fichiers classique. Il ne s’agit ni d’écrire directement une image ISO, ni de configurer un démarrage multiple à partir de fichiers ISO, ni d’un déploiement du Programme d’installation MiniOS.

Le système de fichiers choisi influe sur les mécanismes de persistance compatibles, mais n’active pas la persistance et ne garantit pas la création d’une session. La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et son activation nécessite toujours un espace de stockage inscriptible adapté. Consultez les sections [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance dans l’initrd](/reference/boot-process/Persistence-Internals) avant de compter sur la sauvegarde des modifications.
