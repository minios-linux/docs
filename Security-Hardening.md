# Security Hardening Guide

This guide provides practical steps to enhance the security of your MiniOS system. Since MiniOS is a live system, the primary security concerns are protecting user data on persistent storage and controlling access to the running system. Default settings ensure convenience for portable use, but may not be optimal for all usage scenarios. The following recommendations will help you configure the system for enhanced security.

## User and Root Account Security

By default, MiniOS performs automatic login without a password. This provides convenience for portable use, but can pose a security risk in some scenarios.

**Default Account Credentials:**
- **User**: `live` / `evil`  
- **Root**: `root` / `toor`

⚠️ **These credentials are publicly known and must be changed immediately for any networked or production use.**

### Creating an Encrypted Password

Before configuring passwords, it is recommended to create an encrypted password hash:

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Setting Passwords

You can set passwords in two ways: **it is strongly recommended** to use encrypted passwords.

**Important:** Setting passwords and user account parameters through boot parameters and configuration files only takes effect on the first system boot. After that, passwords can only be changed using standard Linux methods (`passwd`, `sudo passwd`).

#### Via Boot Parameters

Add parameters to the kernel command line in the boot menu (GRUB for UEFI or SYSLINUX for BIOS):

**For encrypted passwords (recommended):**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**For plain passwords (not recommended):**
```
user-password='your_password'
root-password='root_password'
```

**Important:** Plain passwords are visible in the kernel command line and can be read by other system users.

#### Via Configuration File

Edit the `minios/config.conf` file in the root directory of the USB drive:

**For encrypted passwords:**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**For plain passwords:**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Changing Passwords After Boot

After the first system boot, passwords can be changed using standard Linux commands:

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Disabling Automatic Login

After setting passwords, disable automatic login to require authentication:

#### Via Boot Parameters
```
noautologin
```

#### Via Configuration File
```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Partial autologin disabling:**
- `nox11autologin` - disables only graphical autologin (login manager will require authentication)
- `nottyautologin` - disables only console autologin (already disabled by default)

### Managing User Privileges

By default, the `live` user has full administrator privileges without password prompts both in console (`sudo`) and graphical applications (via polkit). This provides convenience for live system use, but may require changes for enhanced security.

#### Enabling Password Prompts for sudo

To require password entry when using `sudo`, execute after system boot:

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

After this, `sudo` commands will require the user password.

#### Enabling Password Prompts for Graphical Applications

To make graphical administrative programs request passwords, remove the polkit rule:

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

After this, software installers, system settings, and other administrative GUI applications will request passwords.

#### Complete Disabling of Administrative Rights (`noroot`)

For maximum security, you can completely disable `sudo` and root access:

**Via boot parameters:**
```
noroot
```

**Via configuration file:**
```
LIVE_CONFIG_NOROOT=true
```

**Effect:** The `sudo` command will not work, root login will be disabled, and no administrative actions will be available.

## Network Security

### Default SSH Settings

**Why SSH is enabled by default:** MiniOS is designed as a recovery and diagnostic system for servicing faulty hardware. SSH is enabled with permissive settings to provide remote access when the local display is unavailable, damaged, or when working with headless systems.

**Current SSH settings:**
- SSH service is enabled and starts automatically
- Root login via SSH is allowed
- Password authentication is enabled

**Security implications:** This configuration creates security risks on untrusted networks, but is necessary for recovery scenarios.

### Disabling SSH

If remote access is not needed, disable SSH completely:

**Via boot parameters:**
```
disable-services=ssh,avahi-daemon
```

**Via configuration file:**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Configuring Secure SSH Access

If SSH is necessary, secure it using the following methods:

#### 1. Setting Strong Passwords
Use the password setting methods described above.

#### 2. SSH Key Authentication

Place `authorized_keys` files in the root directory of the USB drive:

- `authorized_keys.root` - for root user
- `authorized_keys.live` - for live user
- `authorized_keys.username` - for other users

A system component will automatically deploy them to home directories at boot.

#### 3. SSH Security Hardening

After system boot, edit the SSH configuration:

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Change settings to more secure ones:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart the SSH service:
```bash
sudo systemctl restart ssh
```

**Important:** Always test SSH key access before disabling password authentication.

## Boot Security

### UEFI Secure Boot
MiniOS is fully compatible with Secure Boot, as it uses the standard Debian kernel with signed bootloaders. Secure Boot provides protection against pre-boot malware (bootkits) and is recommended for enhanced security.

### BIOS/UEFI Password
For physical security, set a password in your computer's BIOS/UEFI to prevent unauthorized users from booting from other devices or changing boot settings.