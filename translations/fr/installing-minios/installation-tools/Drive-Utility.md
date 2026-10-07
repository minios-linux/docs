---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilitaire de disque

L’Utilitaire de disque est un utilitaire de disque généraliste GTK inclus avec MiniOS. Il permet d’écrire une image disque existante, de créer une image à partir d’un périphérique physique, de formater un périphérique entier ou de l’effacer. Il n’est pas limité aux supports MiniOS et ne remplace pas le Programme d’installation MiniOS.

Ouvrez-le depuis le menu des applications sous **Système**, ou exécutez :

```bash
driveutility
```

## Sécurité

L’écriture d’une image, le formatage et l’effacement sont des opérations destructrices. Vérifiez le périphérique cible par nom, modèle et capacité avant de confirmer. Sauvegardez tout ce qui est important et déconnectez les autres supports amovibles si possible.

Les disques montés sont masqués par défaut. Vous pouvez choisir de les afficher, mais l’Utilitaire de disque avertit avant toute opération destructive et le backend tente de démonter le périphérique sélectionné ainsi que ses partitions avant toute modification. Si l’état de montage est ambigu ou si un système de fichiers reste monté, l’opération échoue au lieu de continuer sur un système de fichiers actif.

## Écrire une image

**Écrire** copie une image octet par octet sur le périphérique sélectionné. L’entrée d’image compressée est détectée par le backend lorsque cela est pris en charge.

Les utilisations courantes incluent l’écriture d’une ISO MiniOS sur une clé USB ou un support SD, ainsi que la restauration d’une image de périphérique complète préalablement créée.
Pour une ISO MiniOS, il s’agit d’une écriture brute. Cela copie exactement la partition ISO et la structure de démarrage telles qu’elles sont stockées dans l’image. Cela ne **crée pas** de partition de données supplémentaire en écriture, ne crée pas de session persistante et n’effectue pas de déploiement géré par le Programme d’installation MiniOS.

La persistance après une écriture brute dépend toujours du mode de démarrage et du stockage accessible en écriture exposé par l’image résultante. Pour une disposition cible gérée ou une session pré-créée, utilisez [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer).

Exemple en ligne de commande :

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Créer une image de périphérique

**Créer une image** lit un périphérique physique dans un fichier image. La sortie peut rester brute ou être compressée lors de l’écriture.

Les choix de compression pris en charge sont :

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) lorsque le support Python zstd requis est installé

L’application graphique peut également attribuer le fichier résultant à l’utilisateur du bureau afin qu’une sauvegarde créée en tant que root soit immédiatement utilisable sans correction de droits séparée.
Exemple en ligne de commande :

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

L’extension spécifique à la compression est ajoutée automatiquement par l’outil en ligne de commande.

## Formater un périphérique

**Formater** crée une nouvelle structure à système de fichiers unique sur le périphérique sélectionné. Les systèmes de fichiers actuellement proposés sont :

- FAT32
- exFAT
- NTFS
- ext4

Vous pouvez définir une étiquette de volume. Pour ext4, l’Utilitaire de disque peut attribuer le dossier racine à l’utilisateur et au groupe sélectionnés.

Le formatage est indépendant de l’écriture d’une ISO MiniOS. Les systèmes de fichiers listés ici concernent l’opération de formatage de l’Utilitaire de disque ; ils ne modifient pas la structure de fichiers intégrée lors d’une écriture ISO brute.

Exemple en ligne de commande :

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Effacer un périphérique

**Effacer** choisit parmi les opérations d’effacement natives du contrôleur, discard/TRIM et les réécritures côté hôte, selon le périphérique sélectionné et la méthode demandée.

Backends actuellement pris en charge :

- **Effacement sécurisé** — sélectionne automatiquement une méthode prise en charge par le contrôleur lorsque disponible.
- **ATA Secure Erase / Enhanced Secure Erase** — exécuté via UDisks2 pour les disques SATA/ATA pris en charge ; les périphériques gelés ou non pris en charge sont refusés.
- **NVMe User Data Erase / Cryptographic Erase** — utilise NVMe Format NVM uniquement lorsque le contrôleur indique la capacité requise.
- **Discard / discard sécurisé** — utilise `blkdiscard` lorsque le périphérique bloc prend en charge discard.
- **Écrasement par zéros** — écrit des zéros depuis l’hôte.
- **Écrasement aléatoire** — écrit des données aléatoires pour le nombre de passes demandé et peut ajouter un passage final avec des zéros.

L’effacement sécurisé par le contrôleur n’est pas équivalent à l’écrasement répété de chaque bloc logique depuis l’hôte. La disponibilité dépend du firmware du périphérique, des interfaces du noyau, de UDisks2, `nvme-cli`, et du `blkdiscard` support.
Pour les périphériques NVMe, l’Utilitaire de disque préserve le format LBA de l’espace de noms actif, le paramètre de métadonnées et la protection des informations lors de l’exécution du Format NVM. Il refuse également les opérations du contrôleur dont la portée pourrait affecter plusieurs espaces de noms lorsque la cible ne peut être prouvée comme sûre pour une opération à espace de noms unique.

Exemples :

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Utilisez les contrôles de nombre de passes et de taille partielle uniquement pour les méthodes traditionnelles zéro/aléatoire. L’effacement par contrôleur et discard s’effectue selon la commande du périphérique, et non selon un nombre d’octets côté hôte.

## Outils en ligne de commande

L’Utilitaire de disque installe quatre commandes de bas niveau :

| Commande | Fonction |
|---|---|
| `driveutility-write` | Écrire une image brute ou compressée prise en charge sur un périphérique bloc. |
| `driveutility-read` | Créer une image brute ou compressée à partir d’un périphérique bloc. |
| `driveutility-format` | Créer un stockage FAT32, exFAT, NTFS ou ext4 sur un périphérique. |
| `driveutility-wipe` | Effacer via les méthodes contrôleur, discard ou écrasement. |

Toutes les commandes destructrices doivent être exécutées uniquement après avoir vérifié précisément le périphérique cible. Consultez leurs pages de manuel installées et `--help` pour les options spécifiques à la version.

## Utilitaire de disque versus Programme d’installation MiniOS

Utilisez **Utilitaire de disque** lorsque l’opération souhaitée concerne une action générique sur le disque : écriture brute d’image, création d’image de périphérique, formatage ou effacement.

Utilisez **Programme d’installation MiniOS** si vous souhaitez un déploiement compatible MiniOS avec placement contrôlé, choix du système de fichiers et du schéma de démarrage, sélection des modules, configuration ou création optionnelle d’une session live.

Pour d’autres façons de placer MiniOS sur un support, consultez [Méthodes d’installation](/installing-minios/Installation-Methods). Pour conserver les modifications après le démarrage, voir [Modes de démarrage](/using-minios/Boot-Modes) et [Sessions et persistance](/using-minios/Sessions-and-Persistence).
