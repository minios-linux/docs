---
updated: 2026-08-26
---

# Utilisation de Rufus (Windows)

Rufus est un utilitaire populaire pour Windows qui permet de formater et de créer des clés USB bootables.

## Important

**Avertissement :** Une sélection incorrecte du périphérique entraînera une perte de données ! Vérifiez toujours soigneusement le lecteur sélectionné et sauvegardez vos données importantes.

## Exigences pour le lecteur

### Taille du disque

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître en détail les exigences système et les tailles de disque recommandées.

## Installation de Rufus

1. **Téléchargez Rufus** depuis le [site officiel](https://rufus.ie/)
2. **Lancez le programme** – Rufus ne nécessite pas d'installation, c'est une application portable

## Création d’une clé USB bootable

Rufus propose deux méthodes pour écrire MiniOS sur une clé USB :

### Méthode 1 : Mode DD (Recommandé)

1. **Lancez Rufus** en tant qu’administrateur
2. **Sélectionnez la clé USB** dans le champ « Périphérique »
3. **Sélectionnez le fichier ISO de MiniOS** :
   - Cliquez sur le bouton « SÉLECTIONNER »
   - Recherchez et sélectionnez le fichier ISO MiniOS téléchargé
4. **Choisissez le mode d’écriture** :
   - Dans la boîte de dialogue « Image ISO hybride détectée », sélectionnez **« Écrire en mode image DD »**
5. **Démarrez le processus** : cliquez sur le bouton « DÉMARRER »
6. **Confirmez l’action** – toutes les données sur le lecteur seront supprimées
7. **Attendez la fin** du processus d’écriture

### Méthode 2 : Mode ISO (Alternative)

1. **Lancez Rufus** en tant qu'administrateur
2. **Sélectionnez la clé USB** dans le champ « Périphérique »
3. **Sélectionnez le fichier ISO de MiniOS** :
   - Cliquez sur le bouton « SÉLECTIONNER »
   - Recherchez et sélectionnez le fichier ISO de MiniOS téléchargé
4. **Choisissez le mode d'écriture** :
   - Dans la boîte de dialogue « Image ISO hybride détectée », sélectionnez **« Écrire en mode Image ISO »**
5. **Configurez les paramètres** :
   - **Système de fichiers** : FAT32 (recommandé) ou NTFS
   - **Si vous choisissez NTFS** : le démarrage en mode EFI peut ne pas être disponible
6. **Démarrez le processus** : cliquez sur le bouton « DÉMARRER »
7. **Confirmez le formatage** – toutes les données sur le lecteur seront supprimées

## Résultat et persistance

Le mode DD effectue une écriture brute de l’image et copie la structure ISO sur l’ensemble du périphérique cible. Le mode ISO formate un système de fichiers et extrait le contenu de l’ISO pour créer un média live basé sur des fichiers. Aucun des deux modes ne correspond à un déploiement de l’installateur MiniOS, et Rufus ne crée pas automatiquement de partition ext4 ni de session de persistance.

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande, et elle nécessite toujours un support d’écriture adapté. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de compter sur la sauvegarde des modifications.
