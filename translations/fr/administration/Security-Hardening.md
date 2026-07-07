# Guide de renforcement de la sécurité

Ce guide propose des étapes pratiques pour améliorer la sécurité de votre système MiniOS. Étant donné que MiniOS est un système live, les principaux enjeux de sécurité concernent la protection des données utilisateur sur le stockage persistant et le contrôle de l’accès au système en cours d’exécution. Les paramètres par défaut privilégient la portabilité, mais ne sont pas toujours adaptés à tous les usages. Les recommandations suivantes vous aideront à configurer le système pour une sécurité renforcée.

## Sécurité des comptes utilisateur et root

Par défaut, MiniOS effectue une connexion automatique sans mot de passe. Cela offre de la praticité pour un usage nomade, mais peut représenter un risque de sécurité dans certains cas.

**Identifiants par défaut :**
- **Utilisateur** : `live` / `evil`  
- **Root** : `root` / `toor`

⚠️ **Ces identifiants sont publics et doivent être changés immédiatement pour tout usage en réseau ou en production.**

### Création d’un mot de passe chiffré

Avant de configurer les mots de passe, il est recommandé de générer un hash de mot de passe chiffré :

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Définition des mots de passe

Vous pouvez définir les mots de passe de deux manières : **il est fortement recommandé** d’utiliser des mots de passe chiffrés.

**Important :** La définition des mots de passe et des paramètres de compte utilisateur via les paramètres de démarrage et les fichiers de configuration n’est prise en compte qu’au premier démarrage du système. Par la suite, les mots de passe ne peuvent être modifiés qu’avec les méthodes Linux standard (`passwd`, `sudo passwd`).

#### Via les paramètres de démarrage

Ajoutez les paramètres à la ligne de commande du noyau dans le menu de démarrage (GRUB pour UEFI ou SYSLINUX pour BIOS) :

**Pour les mots de passe chiffrés (recommandé) :**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**Pour les mots de passe en clair (non recommandé) :**
```
user-password='your_password'
root-password='root_password'
```

**Important :** Les mots de passe en clair sont visibles dans la ligne de commande du noyau et peuvent être lus par d’autres utilisateurs du système.

#### Via le fichier de configuration

Modifiez le fichier `minios/config.conf` à la racine de la clé USB :

**Pour les mots de passe chiffrés :**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**Pour les mots de passe en clair :**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Changement des mots de passe après le démarrage

Après le premier démarrage, les mots de passe peuvent être modifiés avec les commandes Linux standard :

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Désactivation de la connexion automatique

Après avoir défini les mots de passe, désactivez la connexion automatique pour exiger une authentification :

#### Via les paramètres de démarrage

```
noautologin
```

#### Via le fichier de configuration

```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Désactivation partielle de l’autologin :**
- `nox11autologin` — désactive uniquement l’autologin graphique (le gestionnaire de session demandera une authentification)
- `nottyautologin` — désactive uniquement l’autologin console (déjà désactivé par défaut)

### Gestion des privilèges utilisateur

Par défaut, l’utilisateur `live` dispose de tous les droits administrateur sans demande de mot de passe, aussi bien en console (`sudo`) que dans les applications graphiques (via polkit). Cela facilite l’utilisation en mode live, mais peut nécessiter des ajustements pour une sécurité accrue.

#### Activation de la demande de mot de passe pour sudo

Pour exiger la saisie du mot de passe lors de l’utilisation de `sudo`, exécutez après le démarrage :

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

Après cela, les commandes `sudo` demanderont le mot de passe de l’utilisateur.

#### Activation de la demande de mot de passe pour les applications graphiques

Pour que les programmes graphiques d’administration demandent un mot de passe, supprimez la règle polkit :

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

Après cette modification, les installateurs de logiciels, les paramètres système et autres applications graphiques d’administration demanderont un mot de passe.

#### Désactivation complète des droits administrateur (`noroot`)

Pour une sécurité maximale, vous pouvez désactiver complètement `sudo` et l’accès root :

**Via les paramètres de démarrage :**
```
noroot
```

**Via le fichier de configuration :**
```
LIVE_CONFIG_NOROOT=true
```

**Effet :** La commande `sudo` sera inutilisable, la connexion root sera désactivée et aucune action administrative ne sera possible.

## Sécurité réseau

### Paramètres SSH par défaut

**Pourquoi SSH est activé par défaut :** MiniOS est conçu comme un système de récupération et de diagnostic pour le dépannage de matériel défectueux. SSH est activé avec des paramètres permissifs pour permettre un accès distant lorsque l’affichage local est indisponible, endommagé ou pour travailler sur des systèmes sans écran.

**Paramètres SSH actuels :**
- Le service SSH est activé et démarre automatiquement
- La connexion root via SSH est autorisée
- L’authentification par mot de passe est activée

**Conséquences sur la sécurité :** Cette configuration présente des risques sur des réseaux non fiables, mais elle est nécessaire pour les scénarios de récupération.

### Désactivation de SSH

Si l’accès distant n’est pas nécessaire, désactivez complètement SSH :

**Via les paramètres de démarrage :**
```
disable-services=ssh,avahi-daemon
```

**Via le fichier de configuration :**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Configuration d’un accès SSH sécurisé

Si SSH est nécessaire, sécurisez-le avec les méthodes suivantes :

#### 1. Définition de mots de passe robustes

Utilisez les méthodes de définition de mot de passe décrites ci-dessus.

#### 2. Authentification par clé SSH

Placez les fichiers `authorized_keys` à la racine de la clé USB :

- `authorized_keys.root` — pour l’utilisateur root
- `authorized_keys.live` — pour l’utilisateur live
- `authorized_keys.username` — pour les autres utilisateurs

Un composant système les déploiera automatiquement dans les dossiers personnels au démarrage.

#### 3. Renforcement de la sécurité SSH

Après le démarrage, modifiez la configuration SSH :

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Modifiez les paramètres pour des options plus sécurisées :
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Redémarrez le service SSH :
```bash
sudo systemctl restart ssh
```

**Important :** Testez toujours l’accès par clé SSH avant de désactiver l’authentification par mot de passe.

## Sécurité au démarrage

### Démarrage sécurisé UEFI

MiniOS est entièrement compatible avec Secure Boot, car il utilise le noyau Debian standard avec des bootloaders signés. Secure Boot protège contre les malwares pré-démarrage (bootkits) et est recommandé pour renforcer la sécurité.

### Mot de passe BIOS/UEFI

Pour la sécurité physique, définissez un mot de passe dans le BIOS/UEFI de votre ordinateur afin d’empêcher tout utilisateur non autorisé de démarrer sur d’autres périphériques ou de modifier les paramètres de démarrage.
