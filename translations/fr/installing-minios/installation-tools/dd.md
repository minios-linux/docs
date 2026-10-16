---
updated: 2026-08-26
---

# dd

`dd` est un utilitaire polyvalent en ligne de commande permettant de copier des données bit à bit entre des fichiers et des périphériques. Il sert le plus souvent à écrire des images ISO sur des clés USB, à créer des sauvegardes et à récupérer des données.

## Important

**Avertissement :** Une sélection incorrecte du périphérique entraînera une perte de données ! Vérifiez toujours deux fois le lecteur sélectionné et sauvegardez vos données importantes.

## Configuration requise pour le lecteur

### Taille du lecteur

Consultez [le guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour connaître les exigences système et les tailles de lecteur requises.

## Préparation

1. Identifier votre clé USB :
   - **Linux :** `lsblk` ou `sudo fdisk -l`
   - **macOS :** `diskutil list`

2. Démonter le lecteur :
   - **Linux :** `sudo umount /dev/sdX*`
   - **macOS :** `sudo diskutil unmountDisk /dev/diskX`

## Créer une clé USB bootable

**Linux :**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS :**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Remplacez :**
- `MiniOS.iso` - le chemin d’accès à votre fichier ISO
- `/dev/sdX` - votre clé USB (par exemple, `/dev/sdb`)

## Résultat et persistance

`dd` effectue une écriture brute de l’image : la disposition de l’ISO est copiée sur l’ensemble du périphérique cible. Cela ne crée pas de partition ext4 dans l’espace inutilisé, ne crée pas de session de persistance et ne permet pas de lancer le Programme d’installation MiniOS.

La persistance n’est activée que si une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un espace de stockage inscriptible adapté. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance de l’initrd](/reference/boot-process/Persistence-Internals) avant de compter sur l’enregistrement des modifications.
