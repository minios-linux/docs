# Utilisation de la commande `dd`

`dd` est un utilitaire en ligne de commande polyvalent permettant de copier des données bit à bit entre des fichiers et des périphériques. Il est le plus souvent utilisé pour écrire des images ISO sur des clés USB, créer des sauvegardes ou pour la récupération de données.

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du disque

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître en détail les exigences système et les tailles de disque recommandées.

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

## Résultat et persistance

`dd` effectue une écriture brute de l'image : il copie la structure de l'ISO sur l'ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l'espace inutilisé, ne crée pas de session de persistance et ne réalise pas de déploiement de l'installateur MiniOS.

La persistance n'est activée que lorsqu'une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support d'écriture adapté. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de compter sur la sauvegarde des modifications.
