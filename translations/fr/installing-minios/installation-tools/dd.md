---
updated: 2026-08-26
---

# dd

`dd` est un utilitaire en ligne de commande polyvalent permettant de copier les données bit à bit entre des fichiers et des périphériques. Il est le plus souvent utilisé pour écrire des images ISO sur des clés USB, créer des sauvegardes et effectuer de la récupération de données.

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences relatives au lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour connaître les exigences système détaillées et les tailles de lecteurs recommandées.

## Préparation

1. Identifiez votre clé USB :
   - **Linux :** `lsblk` ou `sudo fdisk -l`
   - **macOS :** `diskutil list`

2. Démontez le lecteur :
   - **Linux :** `sudo umount /dev/sdX*`
   - **macOS :** `sudo diskutil unmountDisk /dev/diskX`

## Création d'une clé USB amorçable

**Linux :**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS :**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Remplacez :**
- `MiniOS.iso` - chemin vers votre fichier ISO
- `/dev/sdX` - votre clé USB (par exemple `/dev/sdb`)

## Résultat et persistance

`dd` effectue une écriture brute de l’image : il copie la structure ISO sur l’ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l’espace inutilisé, ne crée pas de session de persistance, et n’effectue pas de déploiement du Programme d’installation MiniOS.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support d’écriture adapté. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance Initrd](/reference/boot-process/Persistence-Internals) avant de compter sur la sauvegarde des modifications.
