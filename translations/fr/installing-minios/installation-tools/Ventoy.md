---
updated: 2026-10-15
---

# Ventoy

Ventoy est un outil populaire pour créer des clés USB démarrables. Il permet de stocker plusieurs fichiers ISO sur un même appareil et de démarrer à partir de n’importe lequel d’entre eux.

## Important

**Avertissement :** Une sélection incorrecte du périphérique entraînera une perte de données ! Vérifiez toujours deux fois le lecteur sélectionné et sauvegardez les données importantes.

L’intégration actuelle de MiniOS prend en charge Ventoy de **mode normal**, y compris les images persistantes directes dans le BIOS et l’UEFI. Les anciennes images MiniOS peuvent nécessiter le **mode GRUB2** ; utilisez ce mode si l’ancienne image ne parvient pas à trouver sa source en mode normal. Le suffixe de nom de fichier `VTGRUB2` peut forcer le mode GRUB2 pour une telle image. Ce n’est pas une exigence universelle pour les images actuelles.

## Exigences relatives au lecteur

### Capacité du lecteur

Prévoyez suffisamment d’espace pour les fichiers ISO, les autres données et l’espace de stockage persistant souhaité. L’espace réservé par Ventoy et la capacité de l’image de persistance sont deux paramètres distincts. Consultez la [Compatibilité matérielle](/getting-started/Hardware-Compatibility) pour connaître la configuration système requise.

## Installation de Ventoy

### Méthode 1 : installation standard

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez le programme d’installation Ventoy** et sélectionnez votre clé USB
3. **Installez Ventoy** sur la clé (toutes les données seront supprimées)
4. **Copiez le fichier ISO MiniOS** dans le dossier racine de la clé USB

Cela crée un support multiboot à partir de fichiers ISO : Ventoy conserve l’ISO sous forme de fichier sur sa partition de données et le présente au démarrage. Il ne s’agit ni d’une écriture brute d’image MiniOS, ni d’un déploiement du Programme d’installation MiniOS.

### Méthode 2 : installation avec partition de données séparée (recommandé)

1. **Téléchargez Ventoy** depuis le [site officiel](https://www.ventoy.net/)
2. **Lancez le programme d’installation Ventoy** et sélectionnez votre clé USB
3. **Activez l’option « Réserver de l’espace »** pendant l’installation pour laisser de l’espace non alloué à la fin du disque
4. **Installez Ventoy** sur le disque
5. **Copiez le fichier ISO MiniOS** dans le dossier racine de la clé USB
6. **Créez une partition ext4** dans l’espace réservé, avec pour étiquette `persistence`à l’aide d’un éditeur de partitions

Cela fournit un emplacement possible pour la persistance, mais la création de la partition à elle seule n’active pas la persistance et ne crée pas de session.

## Intégration avec MiniOS

MiniOS détecte séparément l’ISO présenté par Ventoy du stockage inscriptible. Il existe deux modèles de persistance ; choisissez délibérément celui qui vous convient.

### Sessions normales MiniOS

Sans backend de plugin de persistance Ventoy sélectionné, les demandes habituelles **Démarrer MiniOS** d’entrée `perchdir=resume`. MiniOS peut utiliser une partition sur le même lecteur `persistence` ou son espace de stockage `minios/changes/` sur la partition de données Ventoy. Pour utiliser la disposition avec partition de données, activez la prise en charge du remontage Linux de Ventoy dans `/ventoy/ventoy.json` :

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Fusionnez cette configuration avec une configuration existante au lieu de supprimer les autres plugins. Un espace de stockage inscriptible adapté reste nécessaire. Sur FAT32/NTFS/exFAT, le démarrage privilégie DynBlk s’il est disponible, et utilise sinon DynFileFS. Session Manager, les sessions numérotées, le chiffrement et l’enregistrement des sessions RAM prises en charge suivent les règles habituelles de MiniOS. Un démarrage sans demande de persistance reste temporaire.

### Plugin de persistance Ventoy

Vous pouvez également associer l’ISO à une **image de persistance ext4** à l’aide du plugin de persistance de Ventoy. Par exemple, une image déjà créée à l’emplacement `/ventoy/minios.dat` peut être sélectionnée pour `/ISO/MiniOS.iso` :

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

Les chemins sont relatifs à la racine de la partition de données Ventoy. Créez l’image ext4 avec les outils de création d’images de persistance de Ventoy et sélectionnez-la au démarrage ; le simple fait de placer un fichier `.dat` sur le lecteur ne l’active pas. MiniOS utilise le backend sélectionné par Ventoy, et non un périphérique quelconque portant une étiquette correspondante.

Cette image contient un environnement persistant, avec `changes/` et, pour OverlayFS, `workdir/`. Elle ne contient pas de sessions MiniOS numérotées. Choisissez un autre backend dans Ventoy pour utiliser un autre environnement. Session Manager et `minios-session` ne sont pas disponibles, la sélection de session `perchdir` est ignorée, et `perchtoram` ne peut pas copier cette couche supérieure dans RAM. Le système `toram` peut tout de même être utilisé, mais cela ne supprime pas la dépendance à l’image de persistance.

La première utilisation enregistre le format de l’union. Réutiliser l’image avec un autre backend d’union, utiliser une image indisponible ou qui n’est pas au format ext4, ou échouer à l’activer en écriture entraîne un avertissement et la création d’une nouvelle couche supérieure RAM. **Démarrer sans enregistrer** n’ouvre pas l’image. Consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Fonctionnement interne de la persistance](/reference/boot-process/Persistence-Internals).

## Utiliser MiniOS avec Ventoy

### Démarrage

Après avoir installé Ventoy et copié le fichier ISO MiniOS sur le lecteur :

1. **Démarrez depuis la clé USB** - sélectionnez-la dans le BIOS/UEFI
2. **Sélectionnez MiniOS** dans la liste des fichiers ISO disponibles du menu Ventoy
3. Pour une image MiniOS récente, sélectionnez le mode normal ; pour une image plus ancienne, utilisez le mode indiqué dans sa documentation
4. **Attendez que MiniOS se charge**

Après le démarrage, vérifiez l’état de la persistance avant de compter sur l’enregistrement de vos modifications. Pour les sessions ordinaires, utilisez `sudo minios-session status`. Avec le plugin de persistance, consultez `/run/initramfs/minios-persistence/boot-state` en tant que root : un backend activé avec succès indique `mode=ventoy` et `boot_level=ok`. Laissez le lecteur connecté tant que son ISO ou son image de persistance est utilisé.
