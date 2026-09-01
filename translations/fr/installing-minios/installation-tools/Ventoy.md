---
updated: 2026-08-26
---

# Ventoy

Ventoy est un outil populaire permettant de créer des clés USB amorçables, qui vous permet de stocker plusieurs fichiers ISO sur un même support et de démarrer à partir de l’un d’eux.

## Important

**Attention :** Une mauvaise sélection du périphérique entraînera une perte de données ! Vérifiez toujours attentivement le lecteur sélectionné et sauvegardez vos données importantes.

**Exigence du mode d’amorçage :** Pour que MiniOS fonctionne correctement avec Ventoy, vous DEVEZ choisir le **mode GRUB2** au démarrage, ou renommer votre fichier ISO avec le suffixe `VTGRUB2` (par exemple, `minios-standard-amd64_VTGRUB2.iso`) pour forcer automatiquement le mode GRUB2.

## Exigences relatives au lecteur

### Taille du lecteur

Consultez le [Guide de compatibilité matérielle](/getting-started/Hardware-Compatibility) pour les exigences système détaillées et les tailles de lecteurs recommandées.

## Installation de Ventoy

### Méthode 1 : Installation standard

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez l’installateur Ventoy** et sélectionnez votre clé USB
3. **Installez Ventoy** sur la clé (toutes les données seront supprimées)
4. **Copiez le fichier ISO MiniOS** à la racine de la clé USB

Cela crée un support multiboot à partir de fichiers ISO : Ventoy conserve l’ISO en tant que fichier sur sa partition de données et le présente au démarrage. Il ne s’agit pas d’un écrasement brut d’image MiniOS ni d’un déploiement via le Programme d’installation MiniOS.

### Méthode 2 : Installation avec partition de données séparée (recommandé)

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez l’installateur Ventoy** et sélectionnez votre clé USB
3. **Activez l’option « Réserver de l’espace »** lors de l’installation pour créer une partition supplémentaire
4. **Installez Ventoy** sur le lecteur
5. **Copiez le fichier ISO de MiniOS** à la racine de la clé USB
6. **Créez une partition ext4** dans l’espace réservé avec le label `persistence`

Cela fournit un emplacement possible pour la persistance, mais la création seule de la partition n’active pas la persistance ni ne crée de session.

## Intégration avec MiniOS

MiniOS prend en charge la détection d’un ISO présenté par Ventoy. La découverte de la source et la sélection de la persistance sont distinctes ; Ventoy n’active pas lui-même la persistance de MiniOS.

### Persistance

La persistance n’est activée que lorsqu’une entrée de démarrage ou une ligne de commande du noyau la demande. Son activation dépend alors de la présence d’un emplacement inscriptible compatible et d’une session utilisable ; une installation standard de Ventoy ne garantit pas que l’un ou l’autre sera créé automatiquement. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Persistance Initrd](/reference/boot-process/Persistence-Internals) avant de compter sur la sauvegarde des modifications.

## Utiliser MiniOS avec Ventoy

### Démarrage

Après avoir installé Ventoy et copié le fichier ISO de MiniOS sur le lecteur :

1. **Démarrez depuis la clé USB** – sélectionnez-la dans le BIOS/UEFI
2. **Sélectionnez MiniOS** dans la liste des fichiers ISO disponibles dans le menu Ventoy
3. **IMPORTANT : Sélectionnez le mode GRUB2** lorsque Ventoy le demande
4. **Patientez pendant le chargement de MiniOS**

### **Exigences du mode d’amorçage Ventoy**

**Pour que MiniOS fonctionne correctement :**
- **Mode GRUB2** – Requis pour le bon fonctionnement de MiniOS

**Solution alternative :**
- Ajoutez le suffixe `VTGRUB2` au nom du fichier ISO (par exemple, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Cela force Ventoy à utiliser automatiquement le mode GRUB2 sans demander de confirmation
