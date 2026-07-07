# Gestion des sessions dans MiniOS 🔄

## 🤔 Qu'est-ce qu'une session ?

Les sessions MiniOS offrent un stockage persistant de vos modifications, vous permettant de :

- **Sauvegarder les modifications** effectuées pendant une session live
- **Reprendre votre travail** là où vous l'avez laissé après un redémarrage
- **Gérer plusieurs** environnements de travail distincts
- **Basculer entre** différentes configurations

Les sessions utilisent la technologie **Union Filesystem** (AUFS ou OverlayFS) pour superposer les modifications au-dessus du système de base en lecture seule.

---

## 📋 Types et modes de session

### **Actions sur les sessions**

- **`resume`** - Continuer à partir de la dernière session utilisée (par défaut)
- **`new`** - Créer une nouvelle session
- **`ask`** - Sélection interactive de la session au démarrage
- **`fresh`** - Sans persistance (session temporaire)

### **Modes de stockage**

- **`native`** - Stockage direct sur le système de fichiers (nécessite un système de fichiers POSIX : ext4, btrfs, xfs)
- **`dynfilefs`** - Fichiers conteneurs extensibles (fonctionne sur tout système de fichiers, recommandé pour FAT32/NTFS/exFAT)
- **`raw`** - Fichiers image de taille fixe (fonctionne sur tout système de fichiers)

---

## 🚀 Paramètres de démarrage pour le contrôle des sessions

### **Paramètres principaux des sessions**

| Paramètre | Valeurs | Description |
|-----------|--------|-------------|
| `perch` | - | Active la persistance des modifications |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Action ou dossier de session |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Mode de stockage |
| `perchsize` | `<size_in_MB>` | Taille initiale pour les modes conteneur/image |

### **Structure du dossier de session**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Intégration au bootloader

### **Configuration GRUB**

MiniOS propose des entrées de menu GRUB préconfigurées pour différents modes de session :

```bash
# Resume previous session
linux /minios/boot/vmlinuz... perchdir=resume

# Start new session  
linux /minios/boot/vmlinuz... perchdir=new

# Interactive session selection
linux /minios/boot/vmlinuz... perchdir=ask

# Fresh start (no persistence)
linux /minios/boot/vmlinuz... 
```

### **Configuration SYSLINUX**

Entrées SYSLINUX correspondantes :

```bash
LABEL default
MENU LABEL Run MiniOS (Resume previous session)
APPEND ... perchdir=resume

LABEL perch
MENU LABEL Run MiniOS (Start a new session)  
APPEND ... perchdir=new

LABEL asksession
MENU LABEL Run MiniOS (Choose session during startup)
APPEND ... perchdir=ask

LABEL live
MENU LABEL Run MiniOS (Fresh start)
APPEND ...
```

---

## 🔧 Commandes de gestion des sessions

### **Utilisation du gestionnaire de sessions MiniOS (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Fonctionnalités :**
- Afficher toutes les sessions disponibles avec leurs métadonnées
- Créer de nouvelles sessions avec différents modes
- Activer/basculer entre les sessions
- Supprimer les anciennes sessions
- Nettoyer les sessions plus anciennes qu'un nombre de jours spécifié

### **Utilisation de minios-session (CLI)**

⚠️ **Privilèges administrateur requis :**

L'outil en ligne de commande nécessite les droits root et les vérifie automatiquement. Exécutez les commandes avec `sudo` ou via `pkexec` :

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Commandes de base :**

```bash
# List all sessions
sudo minios-session list

# Show currently active session (will boot next)
sudo minios-session active

# Show currently running session (current boot)
sudo minios-session running

# Check filesystem compatibility and session directory status
sudo minios-session info
sudo minios-session status

# Create new sessions (using positional arguments)
sudo minios-session create native
sudo minios-session create dynfilefs 2000
sudo minios-session create raw 2000

# Activate specific session
sudo minios-session activate 3

# Delete session
sudo minios-session delete 2

# Resize session (dynfilefs/raw modes only)
sudo minios-session resize 1 8000

# Export session to archive
sudo minios-session export 1 /path/to/backup.tar.zst

# Import session from archive
sudo minios-session import /path/to/backup.tar.zst
sudo minios-session import /path/to/backup.tar.zst dynfilefs  # with mode conversion

# Copy session with optional mode conversion
sudo minios-session copy 1 2              # copy keeping same mode
sudo minios-session copy 1 3 raw          # copy and convert to raw mode
sudo minios-session copy 1 4 native 3000  # copy, convert to native, set size

# Cleanup old sessions (older than 30 days)
sudo minios-session cleanup --days 30
```

#### **Options avancées :**

```bash
# JSON output for automation (available for all commands)
sudo minios-session --json list
sudo minios-session --json info
sudo minios-session --json active
sudo minios-session --json running
sudo minios-session --json status
sudo minios-session --json create native
sudo minios-session --json activate 2
sudo minios-session --json delete 3
sudo minios-session --json cleanup --days 30
sudo minios-session --json resize 1 8000
sudo minios-session --json export 1 backup.tar.zst
sudo minios-session --json import backup.tar.zst
sudo minios-session --json copy 1 2 native

# Custom sessions directory
sudo minios-session --sessions-dir /custom/path list
sudo minios-session --sessions-dir /mnt/usb/sessions create native
```

#### **Principales différences de commandes :**

- `active` - Affiche la session qui sera utilisée au prochain démarrage
- `running` - Affiche la session actuellement utilisée (le cas échéant)
- `resize` - Modifier la taille de la session (seulement pour les modes dynfilefs/raw)
- `export` - Exporter la session vers une archive .tar.zst pour sauvegarde
- `import` - Importer une session depuis une archive avec conversion de mode optionnelle
- `copy` - Copier une session avec conversion de mode optionnelle
- `info` - Vérifier la compatibilité du système de fichiers et recommandations

---

## 📦 Sauvegarde et migration des sessions

### **Exporter des sessions**

Exportez les sessions vers des archives compressées pour sauvegarde ou transfert :

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Fonctionnalités :**
- Crée une archive compressée .tar.zst
- Préserve toutes les données et métadonnées de session
- Peut être importée sur n'importe quel système MiniOS
- Compression automatique pour optimiser l'espace

### **Importer des sessions**

Importez des sessions depuis des archives avec conversion de mode optionnelle :

```bash
# Import session keeping original mode
sudo minios-session import /backup/session1.tar.zst

# Import and convert to different mode
sudo minios-session import /backup/session1.tar.zst dynfilefs
sudo minios-session import /backup/session2.tar.zst raw
sudo minios-session import /backup/session3.tar.zst native

# Import with JSON output
sudo minios-session --json import /backup/session.tar.zst
```

**Fonctionnalités :**
- Restaure les données de session depuis une archive
- Convertit automatiquement entre les modes de stockage si précisé
- Ignore les fichiers existants pour éviter toute perte de données
- Crée automatiquement un nouveau numéro de session

### **Copier et convertir des sessions**

Copiez des sessions entre différents modes de stockage :

```bash
# Copy session keeping same mode
sudo minios-session copy 1 2

# Copy and convert to different mode
sudo minios-session copy 1 3 raw           # convert to raw mode
sudo minios-session copy 1 4 dynfilefs     # convert to dynfilefs
sudo minios-session copy 1 5 native        # convert to native

# Copy with custom size (for raw/dynfilefs)
sudo minios-session copy 1 6 raw 4000      # 4GB raw image
sudo minios-session copy 2 7 dynfilefs 2000 # 2GB dynfilefs
```

**Conversions prises en charge :**
- native ⇄ dynfilefs ⇄ raw
- Toutes les combinaisons de modes sont supportées
- Gestion automatique de la taille
- Préserve les données de session lors de la conversion

**Cas d'usage :**
- Migrer de FAT32 vers ext4 (dynfilefs → native)
- Créer des sessions portables (native → dynfilefs/raw)
- Optimiser pour différents systèmes de fichiers
- Sauvegarder des sessions avec différents modes

---

## 🏗️ Détail des modes de stockage de session

### **Mode natif**

**Idéal pour :** Systèmes sur des systèmes de fichiers POSIX (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Caractéristiques :**
- Accès direct au système de fichiers sans conteneur
- Conformité POSIX totale (liens physiques, permissions, attributs étendus)
- Meilleures performances parmi tous les modes
- **Exigences :** Système de fichiers compatible POSIX (ext4, btrfs, xfs)
- **Non compatible :** FAT32, NTFS, exFAT

### **Mode DynFileFS**

**Idéal pour :** Systèmes de fichiers non POSIX (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Caractéristiques :**
- Conteneur extensible avec un système de fichiers ext4 à l'intérieur
- S'agrandit automatiquement selon l'espace disponible
- Fonctionne sur tout type de système de fichiers
- Légère surcharge de performance par rapport au natif
- **Taille par défaut :** 1000 Mo, expansion dynamique
- **Recommandé pour :** systèmes de fichiers FAT32, NTFS, exFAT

### **Mode Raw**

**Idéal pour :** Besoins de taille fixe sur tout système de fichiers

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Caractéristiques :**
- Image de taille fixe avec système de fichiers ext4 à l'intérieur
- Utilisation disque prévisible et constante
- Fonctionne sur tout type de système de fichiers
- Taille à spécifier lors de la création
- **Taille par défaut :** 1000 Mo si non spécifié
- **Cas d'usage :** Sessions portables, quotas de stockage, allocation d'espace prévisible

---

## 🗂️ Métadonnées de session et compatibilité

### **Formats des métadonnées de session**

**Format par défaut (session.conf) :**
```bash
default=2
session_mode[1]=native
session_version[1]=5.0.0
session_edition[1]=standard
session_union[1]=overlayfs
session_mode[2]=dynfilefs
session_version[2]=5.0.0
session_edition[2]=standard
session_union[2]=overlayfs
```

**Format JSON (si jq est disponible) :**
```json
{
  "default": "2",
  "sessions": {
    "1": {
      "mode": "native",
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    },
    "2": {
      "mode": "dynfilefs", 
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    }
  }
}
```

> **Remarque :** MiniOS détecte automatiquement si `jq` est disponible et utilise le format JSON quand c'est possible, sinon il revient au format conf traditionnel.

### **Vérification de la compatibilité**

MiniOS vérifie automatiquement la compatibilité des sessions :

- **Incompatibilité de version** - Crée une nouvelle session si la version de MiniOS diffère
- **Incompatibilité d'édition** - Crée une nouvelle session si l'édition diffère (standard/toolbox/ultra)
- **Incompatibilité Union FS** - Crée une nouvelle session si le système de fichiers union diffère (aufs/overlayfs)
- **Changement de mode** - Crée une nouvelle session si le mode de stockage change

### **Système d’avertissement**

Lors de la sélection de sessions incompatibles, MiniOS affiche des avertissements :
- Avertissements d’incompatibilité de version
- Notifications de différence d’édition
- Problèmes de compatibilité du système de fichiers union
- Option de continuer à vos risques et périls

---

## 🎯 Configuration avancée des sessions

### **Emplacements personnalisés pour les sessions**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Gestion de la taille des sessions**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Gestion automatique des sessions**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Dépannage des sessions

### **Problèmes courants**

#### **Session introuvable**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Problèmes de permissions**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Échecs du mode de stockage**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Récupération de session**

```bash
# List all sessions and their status
sudo minios-session list

# Check session integrity and filesystem info
sudo minios-session status
sudo minios-session info

# Show active vs running session status
sudo minios-session active
sudo minios-session running

# Create new session if corrupted
sudo minios-session create native
```

### **Nettoyage des sessions**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Bonnes pratiques pour les sessions

### **Choisir les modes de stockage**

- **Mode natif :** À utiliser lorsque MiniOS est sur un système de fichiers POSIX (ext4, btrfs, xfs) – meilleures performances
- **Mode DynFileFS :** À privilégier pour les systèmes de fichiers FAT32, NTFS, exFAT – gestion automatique de l’espace
- **Mode brut :** À utiliser lorsque vous avez besoin d’une taille fixe sur n’importe quel système de fichiers – occupation disque prévisible

### **Planification de la taille**

- **Petites sessions :** 1-2 Go pour des modifications de configuration basiques
- **Développement :** 4-8 Go pour des environnements de développement
- **Charges lourdes :** 8 Go+ pour des installations logicielles importantes

### **Gestion des sessions**

- Nettoyez régulièrement les anciennes sessions
- Utilisez des noms de session explicites en gestion manuelle
- Surveillez l’utilisation de l’espace disque
- Conservez au moins une session stable connue pour la récupération

### **Optimisation des performances**

- Utilisez le mode natif lorsque possible pour de meilleures performances
- Placez le stockage des sessions sur des supports rapides
- Privilégiez un SSD pour les sessions fréquemment utilisées

---
