---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Utilitaire de disque

L’Utilitaire de disque est un outil graphique permettant d’écrire des images ISO MiniOS sur des clés USB.

**Installation :** Disponible par défaut dans MiniOS, pour les autres distributions consultez https://github.com/minios-linux/driveutility

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences relatives au lecteur

### Taille du lecteur (pour l’écriture de MiniOS)

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour des informations détaillées sur les exigences système et les tailles de lecteurs.

### Systèmes de fichiers pris en charge

- **FAT32** : compatibilité maximale
- **NTFS** : compatibilité Windows
- **EXT4** : recommandé pour Linux

## Lancement de l’Utilitaire de disque

**Depuis le menu des applications :**
1. Ouvrir le menu → Système → « Utilitaire de disque »

**Depuis le terminal :**
```bash
driveutility
```

## Création d’une clé USB bootable

1. **Sélectionnez le mode "Écrire"** dans la fenêtre principale du programme
2. **Sélectionnez le fichier ISO MiniOS :**
   - Cliquez sur le bouton "Parcourir" à côté du champ "Source"
   - Trouvez et sélectionnez le fichier MiniOS.iso téléchargé
3. **Sélectionnez le lecteur cible :**
   - Choisissez votre clé USB dans la liste des périphériques
   - Vérifiez la sélection par la taille et le modèle
4. **Démarrez l’écriture :**
   - Cliquez sur le bouton "Écrire"
   - Confirmez l’opération – toutes les données sur le lecteur seront supprimées
5. **Patientez jusqu’à la fin** – le processus prendra quelques minutes

## Résultat et persistance

Le mode écriture effectue une écriture brute de l’image : il copie la structure de l’ISO sur l’ensemble du périphérique cible. Il ne crée pas de partition ext4 dans l’espace inutilisé, ne crée pas de session de persistance, et n’effectue pas de déploiement du Programme d’installation MiniOS. Les choix de système de fichiers ci-dessus s’appliquent uniquement aux opérations de l’Utilitaire de disque qui formatent un système de fichiers, et non à la structure de partitions copiée lors d’une écriture ISO.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un stockage inscriptible adapté. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance Initrd](/reference/boot-process/Persistence-Internals) avant de compter sur la sauvegarde des modifications.
