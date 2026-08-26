# Méthode d’installation d’origine (Windows/Linux, héritée)

Cette méthode d’installation héritée de MiniOS consiste à copier directement les fichiers système sur le disque et à installer le programme de démarrage. Privilégiez une méthode actuelle depuis [Installer MiniOS](/installation/Installing-MiniOS.md) sauf si une disposition basée sur les fichiers est spécifiquement requise.

**Remarque :** Cette méthode ne fonctionne que sous Windows et Linux en raison de l’utilisation du programme de démarrage SYSLINUX.

## Important

**Avertissement :** Cette procédure repartitionne et formate le périphérique sélectionné. Elle est destructive pour l'ensemble du périphérique, et non seulement pour les fichiers actuellement visibles dessus. Sauvegardez les données importantes et vérifiez avec précision le chemin du périphérique, le modèle, la capacité, la partition et le point de montage avant d'exécuter `fdisk`, `mkfs` ou `bootinst`. Déconnectez les autres supports amovibles lorsque cela est possible.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître les exigences système détaillées et les tailles de lecteurs recommandées.

### Exigences techniques

- **Systèmes de fichiers** : FAT32, NTFS, ext2/3/4, Btrfs
- **Schéma de partition** : MBR
- **Démarrage EFI** : Lorsque vous utilisez les systèmes de fichiers NTFS, exFAT ou ext2/3/4, le démarrage en mode EFI peut ne pas être disponible. Pour la compatibilité EFI, il est recommandé d’utiliser FAT32.

## Création d’une clé USB amorçable

### Étape 1 : Préparer le lecteur

**Windows :**
1. Ouvrez "Gestion des disques" (`Win+R`, puis `diskmgmt.msc`)
2. Vérifiez le périphérique USB selon son numéro de disque, son modèle et sa capacité. N'allez pas plus loin si un détail n'est pas certain.
3. Faites un clic droit sur son volume et sélectionnez "Supprimer le volume"
4. Faites un clic droit sur l'espace non alloué et sélectionnez "Nouveau volume simple"
5. Choisissez le système de fichiers : FAT32 (recommandé) ou NTFS

**Linux :**

Définissez `TARGET_DISK` et `TARGET_PARTITION` sur les chemins exacts uniquement après avoir vérifié le modèle et la capacité du périphérique dans `lsblk`. L'écriture `fdisk` remplace la table de partitions sur l'ensemble du disque cible. Exécutez uniquement une commande `mkfs` correspondant au système de fichiers souhaité.

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

**Montage de l'ISO :**

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
1. **Trouvez le dossier `/minios/`** dans l'ISO monté
2. **Copiez l'intégralité du dossier `/minios/`** à la racine de la clé USB

Sous Linux, la racine cible dans l'exemple ci-dessus est `/mnt/minios-target`. Vérifiez que `findmnt --mountpoint /mnt/minios-target` indique bien la partition exacte sélectionnée à l'étape 1 avant de copier les fichiers.

### Étape 3 : Installer le bootloader

Accédez au dossier `/minios/boot/syslinux/` sur le lecteur et lancez l'installateur :

`bootinst` écrit le code de démarrage sur le disque en fonction de l'emplacement de l'installateur. Lisez [Récupération du démarrage](/administration/Boot-Recovery.md) avant de modifier le code de démarrage, et n'exécutez pas l'installateur tant que le périphérique et le point de montage n'ont pas été vérifiés.

**Windows :**
- Ouvrez la clé USB vérifiée par sa lettre de lecteur exacte, accédez à `minios\boot\syslinux`, puis exécutez `bootinst.bat` **en tant qu'administrateur**.

**Linux :**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Ne remplacez pas le point de montage par un caractère générique. Le script déduit le disque cible à partir de sa propre localisation et écrit le code de démarrage sur ce disque.

## Résultat et persistance

Cette procédure crée une installation live basée sur des fichiers en plaçant l’arborescence `minios/` et le bootloader sur un système de fichiers classique. Il ne s’agit pas d’une écriture brute d’ISO, d’une configuration multiboot à partir d’un fichier ISO, ni d’un déploiement de l’installateur MiniOS.

Le système de fichiers choisi détermine quels moteurs de persistance peuvent fonctionner, mais il n’active pas la persistance et ne garantit pas la création d’une session. La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et son activation nécessite toujours un support inscriptible adapté. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de compter sur la sauvegarde des modifications.
