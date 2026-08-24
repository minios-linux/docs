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

1. Ne réparez jamais l’unique copie d’un conteneur de stockage.
2. Ne copiez pas les sessions sources par-dessus le `minios/changes` actuellement actif.
3. Copiez l’intégralité du répertoire `changes` avant toute tentative de récupération.
4. Exécutez `e2fsck -y` uniquement sur une copie supplémentaire d’une session.
5. Ne créez jamais manuellement un fichier `changes.dat.N` manquant.

Si MiniOS fonctionne actuellement avec la persistance et que le périphérique source est monté, il est sûr d’effectuer la copie initiale. Ne remplacez pas `session.conf` tant que MiniOS n’a pas démarré sans persistance.

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

Repérez l’utilitaire installé. Selon l’image MiniOS, le nom canonique peut être `dynblk` ou le nom de compatibilité `@mount.dynfilefs` :

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

Ne spécifiez pas `-s` ni `perchsize` lors de la récupération d’un conteneur existant. Sa taille virtuelle est stockée dans les métadonnées DynFileFS/dynblk.

Un montage réussi expose `virtual.dat` :

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Vérifiez le système de fichiers ext4 sans apporter de modifications :

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

## 6. Restaurer la session pour le démarrage

Effectuez cette étape après avoir arrêté la session persistante et démarré MiniOS
sans `perch`, `perchdir` ou `perchmode`. Elle peut aussi être réalisée depuis
un autre système Linux.

Copiez le conteneur récupéré dans un répertoire de session numérique inutilisé. Utiliser un nouveau numéro évite d’écraser une session existante :

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Si aucune réparation du système de fichiers n’a été nécessaire, copiez depuis `$RECOVERY/$SESSION` au lieu de `$REPAIR`.

Sauvegardez et remplacez les métadonnées de session :

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

Les métadonnées minimales omettent volontairement les champs version, edition et union afin que d’anciennes données de compatibilité ne forcent pas MiniOS à créer une nouvelle session.

Démarrez MiniOS avec :

```text
perchdir=resume perchmode=dynfilefs
```

N’ajoutez pas `perchdir=new` ni `perchsize` lors de ce premier démarrage de récupération.

## 7. Récupérer les fichiers sans démarrer la session

Si le conteneur se monte manuellement mais ne peut pas être utilisé comme session de démarrage, copiez les fichiers importants depuis le montage en lecture seule vers une nouvelle session de travail :

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Référence des erreurs

- `cannot open ... changes.dat.N` : un segment validé est manquant. Recopiez-le
depuis le périphérique source ou essayez une autre session. Ne créez pas de segment vide.
- `cannot read header` : l’en-tête DynFileFS/dynblk est endommagé.
- `incompatible data format` : l’utilitaire et le format du conteneur ne correspondent pas.
- `virtual.dat` existe mais ext4 ne se monte pas : vérifiez une copie avec `e2fsck`.
- Le conteneur se monte mais MiniOS crée une nouvelle session : vérifiez que
  `session.conf` pointe vers le bon numéro restauré et contient
  `session_mode[N]=dynfilefs`.

## Prévenir les incidents

La plupart des problèmes surviennent lorsque le périphérique de persistance est saturé en cours d’utilisation. Réduisez ce risque avec les mesures suivantes :

- Gardez une réserve d’espace libre grâce au paramètre de démarrage `perchreserve` (par défaut 256 Mo). Les nouveaux conteneurs et ceux en croissance ne l’utilisent jamais, et MiniOS avertit au démarrage lorsque l’espace libre atteint la réserve. Augmentez cette valeur sur les petits périphériques ou très utilisés, par exemple `perchreserve=1024`.
- Supprimez les anciennes sessions ou celles inutilisées avant que le périphérique ne soit plein.
- Préférez une session `raw` de taille fixe si vous avez besoin d’un espace disque prévisible, afin que la croissance ne puisse pas saturer le périphérique de façon imprévue.
- Arrêtez toujours proprement. Une coupure brutale de l’alimentation alors que le périphérique est plein est la cause la plus fréquente d’un conteneur qui ne peut plus être monté par la suite.
