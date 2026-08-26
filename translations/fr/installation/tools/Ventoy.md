---
updated: 2026-08-26
---

# Utilisation de Ventoy

Ventoy est un outil populaire pour créer des clés USB bootables permettant de stocker plusieurs fichiers ISO sur un même support et de démarrer depuis n'importe lequel d'entre eux.

## Important

**Avertissement :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours soigneusement le disque sélectionné et sauvegardez vos données importantes.

**Exigence du mode de démarrage :** Pour que MiniOS fonctionne correctement avec Ventoy, vous DEVEZ sélectionner le **mode GRUB2** lors du démarrage, ou renommer votre fichier ISO avec le suffixe `VTGRUB2` (par exemple, `minios-standard-amd64_VTGRUB2.iso`) pour forcer automatiquement le mode GRUB2.

## Exigences pour le lecteur

### Taille du disque

Consultez le [Guide de compatibilité matérielle](/installation/Hardware-Compatibility.md) pour connaître en détail les exigences système et les tailles de disque recommandées.

## Installation de Ventoy

### Méthode 1 : Installation standard

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez l’installateur Ventoy** et sélectionnez votre clé USB
3. **Installez Ventoy** sur la clé (toutes les données seront supprimées)
4. **Copiez le fichier ISO de MiniOS** à la racine de la clé USB

Cela crée un support multiboot basé sur des fichiers ISO : Ventoy conserve l’ISO comme fichier sur sa partition de données et le présente au démarrage. Il ne s’agit pas d’une écriture brute de l’image MiniOS ni d’un déploiement de l’installateur MiniOS.

### Méthode 2 : Installation avec une partition de données séparée (recommandé)

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez l’installateur Ventoy** et sélectionnez votre clé USB
3. **Activez l’option "Réserver de l’espace"** lors de l’installation pour créer une partition supplémentaire
4. **Installez Ventoy** sur la clé
5. **Copiez le fichier ISO de MiniOS** à la racine de la clé USB
6. **Créez une partition ext4** dans l’espace réservé avec le label `persistence`

Cela fournit un emplacement possible pour la persistance, mais le fait de créer uniquement la partition n’active pas la persistance et ne crée pas de session.

## Intégration avec MiniOS

MiniOS prend en charge la détection d’un ISO présenté par Ventoy. La découverte de la source et la sélection de la persistance sont distinctes ; Ventoy n’active pas lui-même la persistance MiniOS.

### Persistance

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande. Son activation dépend alors d’un emplacement inscriptible compatible et d’une session utilisable ; une installation standard de Ventoy ne garantit pas la création automatique de l’un ou l’autre. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md) avant de compter sur la sauvegarde des modifications.

## Utiliser MiniOS avec Ventoy

### Démarrage

Après avoir installé Ventoy et copié le fichier ISO de MiniOS sur le disque :

1. **Démarrez depuis la clé USB** – sélectionnez-la dans le BIOS/UEFI
2. **Sélectionnez MiniOS** dans la liste des fichiers ISO disponibles dans le menu Ventoy
3. **IMPORTANT : Sélectionnez le mode GRUB2** lorsque Ventoy vous le demande
4. **Attendez que MiniOS se charge**

### **Exigences du mode de démarrage Ventoy**

**Pour que MiniOS fonctionne correctement :**
- **Mode GRUB2** – Requis pour le bon fonctionnement de MiniOS

**Solution alternative :**
- Ajoutez le suffixe `VTGRUB2` au nom du fichier ISO (par exemple, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Cela force Ventoy à utiliser automatiquement le mode GRUB2 sans demander de confirmation
