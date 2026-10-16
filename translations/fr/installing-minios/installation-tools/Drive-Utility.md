---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilitaire de disque

Utilitaire de disque est un utilitaire de disque GTK polyvalent fourni avec MiniOS. Il peut écrire une image disque existante, créer une image à partir d’un périphérique physique, formater un périphérique entier ou l’effacer. Il n’est pas limité aux supports MiniOS et ne remplace pas le Programme d’installation MiniOS.

Ouvrez-le dans le menu des applications, sous **Système**, ou exécutez :

```bash
driveutility
```

## Sécurité

L’écriture d’une image, le formatage et l’effacement sont des opérations destructives. Avant de confirmer, vérifiez le périphérique cible, son modèle et sa capacité. Conservez des sauvegardes de tout élément important et débranchez les lecteurs amovibles non concernés lorsque c’est possible.

Par défaut, les disques montés sont masqués. Vous pouvez les afficher explicitement, mais Utilitaire de disque avertit l’utilisateur avant toute opération destructive et le backend tente de démonter le périphérique sélectionné et ses partitions avant de le modifier. Si l’état du montage est incertain ou si un système de fichiers reste monté, l’opération échoue au lieu de se poursuivre sur un système de fichiers actif.

## Écrire une image

**Écrire** copie une image octet par octet sur le périphérique sélectionné. Le backend détecte les images compressées lorsque cette fonctionnalité est prise en charge.

Parmi les usages courants : écrire une image ISO MiniOS sur un support USB ou SD, et restaurer une image précédemment créée d’un périphérique entier.
Pour une image ISO MiniOS, il s’agit d’une écriture d’image brute. La partition et la configuration de démarrage de l’ISO sont copiées à l’identique. Cela ne **crée pas** de partition de données supplémentaire accessible en écriture, ne crée pas de session de persistance et ne réalise pas de déploiement géré du Programme d’installation MiniOS.

Après une écriture brute, la persistance dépend toujours du mode de démarrage et du stockage accessible en écriture exposé par l’image obtenue. Pour une configuration cible gérée ou une session précréée, utilisez [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer).

Exemple en ligne de commande :

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Créer une image de périphérique

**Créer une image** lit le contenu d’un périphérique physique et l’enregistre dans un fichier image. Le fichier de sortie peut rester brut ou être compressé pendant son écriture.

Les options de compression disponibles sont :

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) lorsque la prise en charge de zstd par Python est installée

L’application graphique peut également attribuer le fichier obtenu à l’utilisateur du bureau, afin qu’une sauvegarde créée par root soit immédiatement utilisable sans avoir à modifier les droits de propriété.
Exemple en ligne de commande :

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

L’outil de lecture en ligne de commande ajoute automatiquement l’extension correspondant à la compression.

## Formater un périphérique

**Le formatage** crée une nouvelle structure sur un seul système de fichiers sur le périphérique sélectionné. Les systèmes de fichiers disponibles sont les suivants :

- FAT32
- exFAT
- NTFS
- ext4

Vous pouvez définir un nom de volume. Pour ext4, Utilitaire de disque peut attribuer le répertoire racine à l’utilisateur et au groupe sélectionnés.

Le formatage est indépendant de l’écriture d’une image MiniOS. Les systèmes de fichiers proposés sur cette page concernent l’opération de formatage de l’Utilitaire de disque ; ils ne modifient pas la structure du système de fichiers intégrée à l’écriture brute d’une image ISO.

Exemple d’utilisation de la CLI :

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Effacer un périphérique

**L’effacement** choisit entre les opérations d’effacement natives du contrôleur, le discard/TRIM et l’écrasement depuis l’hôte, en fonction du périphérique sélectionné et de la méthode demandée.

Les méthodes actuellement disponibles sont les suivantes :

- **Effacement sécurisé** — sélectionne automatiquement une méthode prise en charge par le contrôleur, si disponible.
- **Effacement sécurisé ATA / effacement sécurisé ATA amélioré** — exécuté via UDisks2 pour les disques SATA/ATA pris en charge ; les périphériques verrouillés ou non pris en charge sont rejetés.
- **Effacement des données utilisateur NVMe / effacement cryptographique** — utilise Format NVM de NVMe uniquement si le contrôleur indique qu’il prend en charge la capacité demandée.
- **Discard / discard sécurisé** — utilise `blkdiscard` lorsque le périphérique bloc prend en charge le discard.
- **Écrasement par des zéros** — écrit des zéros depuis l’hôte.
- **Écrasement par des données aléatoires** — écrit des données aléatoires pendant le nombre de passes demandé et peut ajouter une dernière passe de zéros.

L’effacement sécurisé par le contrôleur n’équivaut pas à l’écrasement répété de chaque bloc logique depuis l’hôte. La disponibilité dépend du firmware du périphérique, des interfaces du noyau, d’UDisks2, `nvme-cli`, et de la prise en charge de `blkdiscard`.
Pour les périphériques NVMe, Utilitaire de disque conserve le format LBA de l’espace de noms actif, le paramètre de métadonnées et le paramètre d’informations de protection lors de l’exécution de Format NVM. L’application refuse également les opérations du contrôleur susceptibles d’affecter plusieurs espaces de noms lorsque l’innocuité d’une opération limitée à un seul espace de noms ne peut être garantie pour la cible.

Exemples :

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Utilisez les options de nombre de passes et de taille partielle uniquement pour les méthodes classiques par zéros ou données aléatoires. L’effacement par le contrôleur et le discard suivent la commande du périphérique plutôt qu’une quantité d’octets définie par l’hôte.

## Outils en ligne de commande

Utilitaire de disque installe quatre commandes de bas niveau :

| Commande | Fonction |
|---|---|
| `driveutility-write` | Écrire une image brute ou compressée prise en charge sur un périphérique bloc. |
| `driveutility-read` | Créer une image brute ou compressée à partir d’un périphérique bloc. |
| `driveutility-format` | Créer un espace de stockage FAT32, exFAT, NTFS ou ext4 sur un périphérique. |
| `driveutility-wipe` | Effacer à l’aide des méthodes par contrôleur, discard ou écrasement. |

N’exécutez les commandes destructives qu’après avoir vérifié précisément le périphérique cible. Consultez les pages de manuel installées et la sortie `--help` pour connaître les options propres à chaque version.

## Utilitaire de disque ou MiniOS

Utilisez **Utilitaire de disque** pour les opérations génériques sur les disques : écriture d’image brute, création d’image d’un périphérique, formatage ou effacement.

Utilisez **Programme d’installation MiniOS** pour un déploiement prenant en compte MiniOS, avec un contrôle précis de l’emplacement, du système de fichiers et de la structure d’amorçage, de la sélection des modules, de la configuration ou de la création facultative d’une session live.

Pour découvrir d’autres façons d’installer MiniOS sur un support, consultez [Méthodes d’installation](/installing-minios/Installation-Methods). Pour enregistrer les modifications après le démarrage, consultez [Modes de démarrage](/using-minios/Boot-Modes) et [Sessions et persistance](/using-minios/Sessions-and-Persistence).
