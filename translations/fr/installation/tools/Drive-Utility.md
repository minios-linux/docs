# Utilisation de Drive Utility

Drive Utility est un outil graphique permettant d’écrire des images ISO MiniOS sur des clés USB.

**Installation :** Inclus par défaut dans MiniOS, pour les autres distributions consultez https://github.com/minios-linux/driveutility

## Important

⚠️ **Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur (pour l’écriture de MiniOS)

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md#system-requirements) pour connaître les exigences système détaillées et les tailles de lecteur.

### Systèmes de fichiers pris en charge

- **FAT32** : compatibilité maximale
- **NTFS** : compatibilité Windows  
- **EXT4** : recommandé pour Linux

## Lancement de Drive Utility

**Depuis le menu des applications :**
1. Ouvrez le menu → Système → « Drive Utility »

**Depuis le terminal :**
```bash
driveutility
```

## Création d’une clé USB bootable

1. **Sélectionnez le mode « Écriture »** dans la fenêtre principale du programme
2. **Sélectionnez le fichier ISO MiniOS :**
   - Cliquez sur le bouton « Parcourir » à côté du champ « Source »
   - Recherchez et sélectionnez le fichier MiniOS.iso téléchargé
3. **Sélectionnez le lecteur cible :**
   - Choisissez votre clé USB dans la liste des périphériques
   - Vérifiez la sélection par la taille et le modèle
4. **Démarrez l’écriture :**
   - Cliquez sur le bouton « Écrire »
   - Confirmez l’opération – toutes les données sur le lecteur seront supprimées
5. **Patientez jusqu’à la fin** – le processus prendra plusieurs minutes

## Persistance automatique des modifications

Lors de l’écriture de MiniOS avec Drive Utility, une copie exacte de l’image ISO est créée. MiniOS détectera automatiquement la méthode d’écriture et configurera la persistance des modifications au premier démarrage.

### Configuration des paramètres (pour utilisateurs avancés)

Pour une configuration précise de la persistance, des paramètres de démarrage peuvent être utilisés :

- `perchmode=native` – Sauvegarde directe sur la partition (si espace libre disponible)
- `perchmode=dynfilefs` – Fichier extensible dynamiquement
- `perchmode=raw` – Fichier de taille fixe
- `perchsize=8000` – Taille de l’espace de stockage pour les données en Mo

Détails dans [paramètres de démarrage](/configuration/Boot-Parameters.md).
