# Utilisation de la commande `dd`

`dd` est un utilitaire en ligne de commande polyvalent permettant de copier des données bit à bit entre des fichiers et des périphériques. Il est le plus souvent utilisé pour écrire des images ISO sur des clés USB, créer des sauvegardes ou pour la récupération de données.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour les exigences système détaillées et les tailles de lecteurs.

## Préparation

1. Identifiez votre clé USB :
   - **Linux :** `lsblk` ou `sudo fdisk -l`
   - **macOS :** `diskutil list`

2. Démontez le lecteur :
   - **Linux :** `sudo umount /dev/sdX*`
   - **macOS :** `sudo diskutil unmountDisk /dev/diskX`

## Création d'une clé USB bootable

**Linux :**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS :**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Remplacez :**
- `MiniOS.iso` – chemin vers votre fichier ISO
- `/dev/sdX` – votre clé USB (ex. : `/dev/sdb`)

## Persistance automatique des modifications

Au premier démarrage, MiniOS vérifie le type de système de fichiers du lecteur et sélectionne le mode de persistance optimal. Si de l’espace libre est disponible, le système crée automatiquement une partition ext4 pour des performances maximales.

### Configuration des paramètres (pour utilisateurs avancés)

Pour une configuration précise de la persistance, il est possible d’utiliser des paramètres de démarrage :

- `perchmode=native` – Sauvegarde directe sur la partition (par défaut, le plus rapide)
- `perchmode=dynfilefs` – Fichier extensible dynamiquement
- `perchmode=raw` – Fichier de taille fixe
- `perchsize=8000` – Taille de l’espace de stockage pour les données en Mo pour les fichiers image

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
