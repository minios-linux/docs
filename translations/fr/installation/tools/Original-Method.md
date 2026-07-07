# Méthode d'installation originale (Windows/Linux)

La méthode d'installation originale de MiniOS consiste à copier directement les fichiers système sur le disque et à installer le programme de démarrage. Cette méthode offre une flexibilité maximale de configuration et une compatibilité étendue avec différents types de supports.

⚠️ **Remarque** : Cette méthode fonctionne uniquement sous Windows et Linux en raison de l'utilisation du programme de démarrage SYSLINUX.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le disque sélectionné et sauvegardez vos données importantes.

## Exigences pour le disque

### Taille du disque

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour les exigences système détaillées et les tailles de disque.

### Exigences techniques

- **Systèmes de fichiers** : FAT32, NTFS, ext2/3/4, Btrfs
- **Schéma de partition** : MBR
- ⚠️ **Démarrage EFI** : Lors de l'utilisation des systèmes de fichiers NTFS, exFAT ou ext2/3/4, le démarrage en mode EFI peut ne pas être disponible. Pour la prise en charge EFI, il est recommandé d'utiliser FAT32.

## Création d'une clé USB bootable

### Étape 1 : Préparer le disque

**Windows :**
1. Ouvrez "Gestion des disques" (`Win+R` → `diskmgmt.msc`)
2. Trouvez la clé USB → clic droit → "Supprimer le volume"
3. Clic droit sur l'espace non alloué → "Nouveau volume simple"
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

**Montage de l'ISO :**

*Windows :*
- Clic droit sur le fichier ISO → "Monter"

*Linux :*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copie des fichiers :**
1. **Trouvez le dossier `/minios/`** dans l'ISO monté
2. **Copiez l'intégralité du dossier `/minios/`** à la racine de la clé USB

### Étape 3 : Installer le programme de démarrage

Accédez au dossier `/minios/boot/` sur le disque et lancez l'installateur :

**Windows :**
- Exécutez `bootinst.bat` **en tant qu'administrateur**

**Linux :**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Persistance automatique des modifications

Au premier démarrage, MiniOS vérifie le type de système de fichiers du disque et tente d'utiliser le mode de persistance des modifications optimal :

- **ext2/3/4, Btrfs** : tente d'utiliser le mode `native` (sauvegarde directe)
- **FAT32/NTFS** : utilise le mode `dynfilefs` (fichier dynamique)
- Si le mode natif n'est pas disponible, bascule automatiquement sur dynfilefs

### Configuration des paramètres (pour utilisateurs avancés)

Lorsque vous avez besoin d'une configuration précise de la persistance, vous pouvez utiliser les paramètres de démarrage :

- `perchmode=native` - Sauvegarde directe sur la partition (pour ext4)
- `perchmode=dynfilefs` - Fichier extensible dynamiquement
- `perchmode=raw` - Fichier de taille fixe  
- `perchsize=8000` - Taille de l'espace de stockage des données en Mo

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
