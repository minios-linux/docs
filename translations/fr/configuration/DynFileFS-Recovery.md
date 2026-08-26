---
updated: 2026-08-26
program_commits:
    dynblk: 25f627f2cf86b79c35a185999af90e5e1aa08d17
    dynfilefs-app: 7b2a6b69edeedcc24e0847df44e9060796c0af4b
---

# Récupération du stockage DynFileFS et dynblk

DynFileFS et `dynblk` fournissent une image de bloc `virtual.dat` allouée dynamiquement,
dont les données sont stockées dans un ensemble de fichiers `changes.dat`. MiniOS formate
`virtual.dat` en ext4 et l’utilise pour les modifications persistantes. `dynblk` est
l’implémentation maintenue du même format de stockage ; MiniOS conserve le nom du mode de
persistance `dynfilefs` ainsi que la commande de compatibilité `@mount.dynfilefs` lorsque
c’est nécessaire.

Ce guide explique comment inspecter, migrer, réparer le système de fichiers, récupérer une session
et extraire des fichiers. Il s’applique après un arrêt non planifié, un périphérique de stockage plein,
une copie interrompue ou une défaillance des métadonnées de session.

Les symptômes typiques sont :

- MiniOS crée une nouvelle session numérotée à chaque démarrage.
- `resume` ne recharge pas le bureau et les fichiers précédents.
- Sélectionner une ancienne session dans le menu de démarrage n’a aucun effet.
- Les répertoires de session contiennent encore des fichiers `changes.dat` mais ne sont pas activés.

La cause peut être un segment de stockage incomplet, des métadonnées de conteneur endommagées,
un système de fichiers ext4 corrompu à l’intérieur de `virtual.dat`, ou un fichier `session.conf` incorrect.

## Règles de sécurité

1. Ne réparez jamais la seule copie d’un conteneur de stockage.
2. Ne copiez pas des sessions sources sur un magasin `minios/changes` en cours d’exécution ou monté.
3. Copiez l’intégralité du répertoire `changes` avant de tenter une récupération.
4. Exécutez `e2fsck -y` uniquement sur une copie supplémentaire d’une session.
5. Ne créez pas manuellement un fichier `changes.dat.N` manquant.

Ne réalisez pas la copie initiale pendant que la session source est active ou que son conteneur DynFileFS est monté. Ses métadonnées et fichiers de segments peuvent changer indépendamment et produire une copie incohérente. Démarrez sans persistance ou utilisez un autre système Linux. Gardez la vue DynFileFS/FUSE, le périphérique loop `virtual.dat` et le système de fichiers ext4 interne inactifs. Montez uniquement le système de fichiers de stockage externe, de préférence en lecture seule, afin que ses fichiers de segments puissent être copiés de manière cohérente.

## 1. Localiser la source et la destination

Affichez les systèmes de fichiers et points de montage :

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Définissez les chemins du répertoire source `changes` et d’un répertoire de récupération séparé
sur un périphérique disposant de suffisamment d’espace libre :

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Vérifiez que la destination dispose de l’espace libre nécessaire :

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Copier tous les fichiers de session

Utilisez `rsync` si disponible :

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Sinon :

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Ne copiez pas uniquement le fichier principal `changes.dat`. Une session DynFileFS contient normalement une séquence complète :

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Tous les segments font partie d’un même conteneur.

## 3. Identifier une session de stockage

Comparez la taille des sessions et les dates de modification :

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Les sessions vides ou défaillantes sont généralement de petite taille. Une session qui contient des données persistantes occupe normalement beaucoup plus d’espace.

Vérifiez les métadonnées de session enregistrées :

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS utilise `session.conf` pour sélectionner et décrire les sessions de persistance.

## 4. Monter le conteneur DynFileFS ou dynblk

Localisez l’utilitaire installé. Selon l’image MiniOS, le nom canonique peut être `dynblk` ou le nom de compatibilité `@mount.dynfilefs` :

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Sélectionnez une session candidate, par exemple la session 3 :

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Ne spécifiez pas `-s` ni `perchsize` lors de ce montage manuel de récupération. Le chemin de démarrage normal peut passer `-s` pour une taille logique demandée ou enregistrée, mais la récupération évite volontairement toute demande de redimensionnement et lit la taille existante depuis les métadonnées DynFileFS/dynblk.

Un montage réussi expose `virtual.dat` :

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Vérifiez son système de fichiers ext4 sans effectuer de modifications :

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Montez-le ensuite en lecture seule :

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Si les fichiers attendus sont visibles, la session peut être récupérée.

Démontez dans l’ordre inverse :

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Réparer le système de fichiers interne

Si le conteneur se monte mais que `e2fsck -n` signale des erreurs ext4, effectuez d’abord une copie supplémentaire de cette session :

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Montez et réparez uniquement cette copie :

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Répétez la vérification en lecture seule de la section précédente après réparation.

## 6. Récupérer dans une nouvelle session compatible

Il est préférable de récupérer dans une session nouvellement créée plutôt que de reconstruire les métadonnées de celle endommagée. Si une exportation `.tar.zst` valide existe, démarrez normalement et importez-la avec conversion automatique pour le système de fichiers de destination :

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

L’import crée une nouvelle session numérotée. Vérifiez-la, puis activez-la explicitement.

Si seul le conteneur monté est utilisable, créez et démarrez une nouvelle session dans un mode compatible avec le système de fichiers de destination. Montez la copie récupérée en lecture seule comme indiqué à la section 4, puis copiez les fichiers nécessaires dans cette session en cours d’exécution. Par exemple, pour récupérer des répertoires personnels :

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Copiez uniquement les données et la configuration dont vous avez besoin. Cela évite de traiter des métadonnées de compatibilité inconnues ou incomplètes comme une définition de session amorçable.

## 7. Ne pas reconstruire les métadonnées de session sur place

Ne remplacez pas `session.conf` par un fichier minimal et n’ajoutez pas un répertoire récupéré à un magasin existant manuellement. Les métadonnées décrivent chaque session de ce magasin ; les remplacer peut rendre des sessions saines orphelines, supprimer les champs de compatibilité et de politique de sauvegarde, et modifier la sélection au prochain démarrage.

Si le conteneur peut être monté en lecture seule, récupérez ses fichiers dans une nouvelle session compatible comme décrit ci-dessus. S’il ne peut pas être monté, conservez la copie complète hors ligne pour une récupération ultérieure du système de fichiers ou une analyse forensique. Un conteneur sans métadonnées de magasin fiables est un support de récupération, pas une définition de session amorçable.

## Référence des erreurs

- `cannot open ... changes.dat.N` : un segment validé est manquant. Recopiez-le
depuis le périphérique source ou essayez une autre session. Ne créez pas de segment vide.
- `cannot read header` : l’en-tête DynFileFS/dynblk est endommagé.
- `incompatible data format` : l’utilitaire et le format du conteneur ne correspondent pas.
- `virtual.dat` existe mais ext4 ne se monte pas : vérifiez une copie avec `e2fsck`.

## Prévenir la récurrence

La plupart des incidents surviennent lorsque le périphérique de persistance se remplit pendant l’utilisation. Réduisez le risque avec ces mesures :

- Gardez une réserve d’espace libre grâce au paramètre de démarrage `perchreserve` (par défaut
  256 Mio). Les nouveaux conteneurs et ceux en croissance ne consomment jamais cette réserve, et MiniOS avertit au démarrage lorsque l’espace libre tombe sous la réserve. Augmentez-la sur les périphériques petits ou très sollicités, par exemple `perchreserve=1024`.
- Supprimez les anciennes sessions ou celles inutilisées avant que le périphérique ne soit plein.
- Privilégiez une session `raw` de taille fixe lorsque vous avez besoin d’une utilisation disque prévisible, afin que la croissance ne puisse pas saturer le périphérique de façon inattendue.
- Arrêtez proprement. Une coupure brutale de l’alimentation alors que le périphérique est plein est la cause la plus fréquente d’un conteneur qui ne peut plus être monté par la suite.
