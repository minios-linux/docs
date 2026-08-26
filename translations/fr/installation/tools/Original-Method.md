# Méthode d’installation d’origine (Windows/Linux, héritée)

Cette méthode d’installation héritée de MiniOS consiste à copier directement les fichiers système sur le disque et à installer le programme de démarrage. Privilégiez une méthode actuelle depuis [Installer MiniOS](/installation/Installing-MiniOS.md) sauf si une disposition basée sur les fichiers est spécifiquement requise.

**Remarque :** Cette méthode ne fonctionne que sous Windows et Linux en raison de l’utilisation du programme de démarrage SYSLINUX.

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données. Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour connaître les exigences système détaillées et les tailles de lecteur recommandées.

### Exigences techniques

- **Systèmes de fichiers** : FAT32, NTFS, ext2/3/4, Btrfs
- **Schéma de partition** : MBR
- **Démarrage EFI** : Lorsque vous utilisez les systèmes de fichiers NTFS, exFAT ou ext2/3/4, le démarrage en mode EFI peut ne pas être disponible. Pour la compatibilité EFI, il est recommandé d’utiliser FAT32.

## Création d’une clé USB amorçable

### Étape 1 : Préparer le lecteur

**Windows :**
1. Ouvrez "Gestion des disques" (`Win+R`, puis `diskmgmt.msc`)
2. Trouvez la clé USB, faites un clic droit et sélectionnez "Supprimer le volume"
3. Faites un clic droit sur l’espace non alloué et sélectionnez "Nouveau volume simple"
4. Choisissez le système de fichiers : FAT32 (recommandé) ou NTFS

**Linux :**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Étape 2 : Extraire et copier les fichiers

**Montage de l’ISO :**

*Windows :*
- Faites un clic droit sur le fichier ISO et sélectionnez "Monter"

*Linux :*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copie des fichiers :**
1. **Trouvez le dossier `/minios/`** dans l’ISO monté
2. **Copiez l’intégralité du dossier `/minios/`** à la racine de la clé USB

### Étape 3 : Installer le bootloader

Accédez au dossier `/minios/boot/syslinux/` sur le lecteur et lancez l'installateur :

**Windows :**
- Exécutez `bootinst.bat` **en tant qu'administrateur**

**Linux :**
```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_MOUNT="/media/$USER/MINIOS"
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Remplacez `MINIOS` par le répertoire de montage exact vérifié avec `lsblk`. N'utilisez pas de caractère générique : le script déduit le disque cible à partir de son propre emplacement et écrit le code d’amorçage sur ce disque.

## Persistance automatique des modifications

Au premier démarrage, MiniOS vérifie le type de système de fichiers du lecteur et tente d’utiliser le mode de persistance optimal :

- **ext2/3/4, Btrfs** : tente d’utiliser le mode `native` (sauvegarde directe)
- **FAT32/NTFS** : utilise le mode `dynfilefs` (fichier dynamique)
- Lorsque le mode natif n’est pas disponible, bascule automatiquement sur dynfilefs

### Configuration des paramètres pour utilisateurs avancés

Lorsque vous avez besoin d'une configuration de persistance précise, vous pouvez utiliser les paramètres de démarrage :

- `perchmode=native` : sauvegarde directe sur la partition (pour ext4)
- `perchmode=dynfilefs` : fichier extensible dynamiquement
- `perchmode=raw` : fichier de taille fixe
- `perchsize=8000` : taille de l’espace de stockage des données en Mo

Plus de détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
