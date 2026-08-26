---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Utilisation de Drive Utility

Drive Utility est un outil graphique permettant d’écrire des images ISO MiniOS sur des clés USB.

**Installation :** Inclus par défaut dans MiniOS, pour les autres distributions consultez https://github.com/minios-linux/driveutility

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du lecteur (pour l’écriture de MiniOS)

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître en détail les exigences système et les tailles de lecteurs recommandées.

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

## Résultat et persistance

Le mode écriture effectue une copie brute de l’image : il recopie la structure ISO sur l’ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l’espace inutilisé, ne crée pas de session de persistance et n’effectue pas de déploiement de l’installateur MiniOS. Les choix de système de fichiers ci-dessus s’appliquent uniquement aux opérations de Drive Utility qui formatent un système de fichiers, et non à la structure de partition copiée lors de l’écriture d’une ISO.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support d’écriture adapté. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de compter sur la sauvegarde des modifications.
