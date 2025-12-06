# CondinAPT: A Comprehensive Guide to Conditional Package Installation

**CondinAPT** is a versatile tool for automating package installation in any Debian-like system (Debian, Ubuntu, and their derivatives). Its key feature is the ability to define complex conditions and rules for installing each package based on arbitrary system configurations.

**Areas of Application:**
- Linux distribution build systems
- Automation of server and workstation setup
- Deployment of various system configurations
- Package management in Docker containers
- CI/CD pipelines for environment setup
- Creation of custom installation images

## Table of Contents

### Fundamentals
- [How it Works and Core Components](#how-it-works-and-core-components)
- [Quick Start](#quick-start)
- [Usage](#usage)

### Syntax and Capabilities
- [Package List File Syntax](#package-list-file-syntax)
- [Filters and Conditions](#filters-and-conditions)
- [Installation Queues](#installation-queues)
- [Priority Queue](#priority-queue)

### Operating Modes
- [Operating Modes and Debugging](#operating-modes-and-debugging)
- [Error Handling and Recovery](#error-handling-and-recovery)

### Advanced Usage
- [Advanced Features](#advanced-features)
- [Integration with Build Systems](#integration-with-build-systems)

### Practical Examples
- [Examples of Real-World Scenarios](#examples-of-real-world-scenarios)
- [Optimization Tips](#optimization-tips)
- [Troubleshooting](#troubleshooting)

**Key Features:**

*   **Conditional Installation:** Install packages based on flexible filters (+, -).
*   **External Configuration:** Complete separation of logic (package list) from data (system parameters).
*   **Installation Queues:** Divide the process into sequential stages to resolve dependencies.
*   **Priority Queue:** Guaranteed installation of critical packages first.
*   **Complex Logic:** Support for "AND" (`&&`), "OR" (`||`) operators, as well as group filters (`+{a|b}`, `-{a&b}`).
*   **Readability:** Support for comments and empty lines to structure lists.
*   **Backward Compatibility:** Supports simple package lists without conditions.

## How it Works and Core Components

CondinAPT operates with four key files:

1.  **`condinapt` script:** The core, containing all processing logic.

2.  **Main configuration file (`-c`):** A file with bash variables describing the current environment.

    Example (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Filter mapping file (`-m`):** Links short prefixes (used in the package list) to variable names from the main configuration file. This file is **optional**. If a filter is not present in the filter mapping file, it will be used as a variable name from the main configuration file. If the variable is not found, CondinAPT will declare it empty.

    Example (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Package list file (`-l`):** The main file describing what to install and under what conditions.

## Quick Start

To quickly get acquainted with CondinAPT, create a simple example:

**1. Create the configuration file `config.conf`:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Create the package list `packages.list`:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Run the installation:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Or test in simulation mode:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Usage

### Command Line

```bash
./condinapt [OPTIONS]
```

| Flag         | Long Flag                      | Argument | Description                                         |
| :----------- | :----------------------------- | :------- | :-------------------------------------------------- |
| `-l`         | `--package-list`               | `PATH`   | **(Required)** Path to the package list file.       |
| `-c`         | `--config`                     | `PATH`   | **(Required)** Path to the main configuration file. |
| `-m`         | `--filter-mapping`             | `PATH`   | (Optional) Path to the filter mapping file.         |
| `-P`         | `--priority-list`              | `PATH`   | (Optional) Path to a priority filter file. File contains regex patterns to match packages. Matched packages are moved to priority queue (preserving filters). |
| `-s`         | `--simulation`                 |          | Simulation mode. Packages will not be installed.    |
| `-C`         | `--check-only`                 |          | Only check if packages are already installed. Returns exit code 1 if there are uninstalled packages. At the end, outputs a command to install missing packages. |
| `-v` / `-vv` | `--verbose` / `--very-verbose` |          | Verbose / very verbose output.                      |
| `-x`         | `--xtrace`                     |          | Enable `set -x` command tracing.                    |
| `-f`         | `--force`                      |          | Force package lists update before installation. By default, update is skipped if `/var/cache/apt/pkgcache.bin` exists. |
| `-h`         | `--help`                       |          | Show help.                                          |

## Package List File Syntax

### Basic Structure

This is the heart of CondinAPT. All logic is described here.

Each line in the package list file consists of two main parts:

1. **Package name with optional version and release specification**
2. **Condition filters** - define the conditions under which the package will be installed

> **Basis for all examples below:**
> For all subsequent examples, we will assume that the `system.conf` and `filters.map` files from the ["How it Works and Core Components" section](#how-it-works-and-core-components) are used.
>
> *   `DISTRIBUTION` = `"bookworm"`
> *   `SYSTEM_TYPE` = `"server"`
> *   `ENVIRONMENT` = `"production"`

### Package Name Structure

**Simple name:**
```
vim
```

**Package version:**
- `package=version` — loose version requirement. If the required version is unavailable, an available version is installed.
  ```
  git=2.25.1
  ```
- `package==version` — strict requirement. If the version is not found, installation aborts with an error.
  ```
  curl==7.68.0
  ```

**Release specification:**
The release is specified using the `@` symbol, which allows linking the installation to a specific repository branch.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### File Structure

*   **Package names:** Each package or condition is written on a new line.
*   **Comments:** Lines starting with `#`, or text after `#` on a line, are completely ignored.
*   **Empty lines:** Ignored and serve for visual separation.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filters and Conditions

Filters allow you to set additional conditions for package selection. They compare the values of system variables (architecture, distribution, working environment) with those specified in the configuration file.

#### Single Filters

*   **`+` (Positive):** The condition is true if the variable value **matches**.
    **Format:** `+<prefix>=<value>`
    
    *   **Line:** `nginx +st=server`
    *   **Analysis:** `SYSTEM_TYPE` is equal to `"server"`. The condition is true.
    *   **Result:** `nginx` will be installed.

*   **Multiple positive filters with the same prefix:**
    Act as OR conditions.
    **Format:** `+<prefix>=<value1> +<prefix>=<value2>`
    
    *   **Line:** `debug-tools +env=development +env=testing`
    *   **Analysis:** `ENVIRONMENT` is equal to `"production"`, which does not match either `"development"` or `"testing"`. The condition is false.
    *   **Result:** `debug-tools` will not be installed.

*   **`-` (Negative):** The condition is true if the variable value **does not match**.
    **Format:** `-<prefix>=<value>`

    *   **Line:** `monitoring-tools -st=desktop`
    *   **Analysis:** `SYSTEM_TYPE` is equal to `"server"`, which is not equal to `"desktop"`. The condition is true.
    *   **Result:** `monitoring-tools` will be installed.

*   **Multiple negative filters:**
    The package is excluded if ANY condition matches.
    **Format:** `-<prefix>=<value1> -<prefix>=<value2>`
    
    *   **Line:** `realtek-driver -d=trixie -d=sid`
    *   **Analysis:** `DISTRIBUTION` is equal to `"bookworm"`, which is not equal to `"trixie"` or `"sid"`. The exclusion conditions do not trigger.
    *   **Result:** `realtek-driver` will be installed.

#### Group Filters

*   **`+{a|b}` (OR for inclusion):** True if **at least one** of the conditions in the group is true.

    *   **Line:** `web-server +{st=server|st=web-server}`
    *   **Analysis:** `SYSTEM_TYPE` is equal to `"server"`. The first condition is true, which is sufficient.
    *   **Result:** The package will be installed.

*   **`+{a&b}` (AND for inclusion):** True only if **all** conditions in the group are true.

    *   **Line:** `database-tools +{d=bookworm&st=server}`
    *   **Analysis:** `DISTRIBUTION` is equal to `"bookworm"` (true) AND `SYSTEM_TYPE` is equal to `"server"` (true).
    *   **Result:** The package will be installed.

*   **`-{a|b}` (OR for exclusion):** The package is excluded if **at least one** of the conditions is true.

    *   **Line:** `debug-tools -{env=production|st=minimal}`
    *   **Analysis:** `ENVIRONMENT` is equal to `"production"`. The first condition is true, so the package is excluded.
    *   **Result:** The package will not be installed.

*   **`-{a&b}` (AND for exclusion):** The package is excluded only if **all** conditions are true.

    *   **Line:** `development-tools -{env=production&st=minimal}`
    *   **Analysis:** `ENVIRONMENT` is equal to `"production"` (true), but `SYSTEM_TYPE` is not equal to `"minimal"`. The second condition is false. The group does not trigger for exclusion.
    *   **Result:** The package will be installed (if no other filters).

### Alternatives

Different packages can be offered for the same functionality and installed depending on conditions. Alternative options are separated by the `||` operator.

**Important:** Each alternative must include a complete description — package name (with optional version and release) and a set of filters.

**Example:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- If `SYSTEM_TYPE` is `database-server`, **postgresql** is selected.
- If `SYSTEM_TYPE` is `web-server`, **mysql-server** is installed.

### Logical Operators for Packages

*   **`||` (OR / Fallback):** Try to install the left part. If it fails (package not found or filtered), try to install the right part.

    *   **Line:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Analysis:** `DISTRIBUTION` is not equal to `"bookworm"`, the left part is filtered. CondinAPT proceeds to the right part. `exfat-utils` has no filters, so it will be installed.
    *   **Result:** `exfat-utils` will be installed.

*   **`&&` (AND / Conjunction):** All parts must successfully pass filter checks to be added to the queue.

    *   **Line:** `nginx +st=web-server && php-fpm`
    *   **Analysis:** `SYSTEM_TYPE` is equal to `"server"`, but the condition requires `"web-server"`. The left part fails.
    *   **Result:** No packages will be installed.

    *   **Complex example:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Result:** All three packages will be installed only if `ENVIRONMENT` is `production`.

### Special Modifiers

*   **`!` (Mandatory Package):** If a package is marked with `!`, but cannot be found in repositories, CondinAPT will abort execution with an error.

    *   **Line:** `!essential-package`

*   **`@` (Release Specification):** Install a package from a specific Debian/Ubuntu release (e.g., `bookworm-backports`).

    *   **Line:** `kernel-image-6.5.0 @trixie-backports`

### Package Version Specification

CondinAPT allows precise control over the versions of installed packages.

*   **Syntax:**
    *   `package=VERSION`: Attempts to install the specified version (`VERSION`). If it's unavailable in repositories, CondinAPT will install any available version of the package.
        *   Example: `my-app=1.2.3` (attempts to install 1.2.3, if not, installs, for example, 1.2.4)
    *   `package==VERSION`: **Strict** installation of a specific version. If this version is unavailable in repositories, the package **will not be installed**. If the package was also marked as mandatory (`!`), the script will exit with an error.
        *   Example: `another-app==2.0.0` (installs only 2.0.0, otherwise skips the package or errors if mandatory)

*   **Behavior:**
    1.  CondinAPT first checks if the required package version is installed on the system. If yes, the package is considered installed and skipped.
    2.  Then it checks if the specified version is available in repositories (`apt-cache madison`).
    3.  **When using `=` (loose version):**
        *   If the specified version is unavailable, CondinAPT will issue a warning that the exact version was not found.
        *   Nevertheless, it will attempt to install any available version of the package from the repositories.
    4.  **When using `==` (strict version):**
        *   If the specified version is unavailable, CondinAPT **will not** install the package.
        *   If the package was marked as mandatory (`!`), the script will abort execution with an error.
    5.  **Version holding (`apt-mark hold`):**
        *   If a package was successfully installed with the **exact, specified version** (i.e., if `package==VERSION` was successful, or `package=VERSION` found *exactly* that version and installed it), CondinAPT will automatically apply the `apt-mark hold` command for that package.
        *   This prevents automatic updates of the package to a new version during subsequent `apt upgrade` operations.

### Complex Filter Examples

#### Example 1: Complex filters for a single package

**Task:** Install `database-tools` for the `bookworm` distribution, but only if the system type is `server` or `database-server`, and not for the `minimal` environment.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Analysis (with our configuration):**

1.  `+d=bookworm`: True.
2.  `+{st=server|st=database-server}`: True, because `SYSTEM_TYPE` is `"server"`.
3.  `-env=minimal`: True, because `ENVIRONMENT` is `"production"`.
    **Result:** All conditions are true. The package will be installed.

#### Example 2: Fallback chain with different conditions

**Task:** For Debian `trixie`, install `firefox-esr`. For `bookworm`, install `firefox`. For all other cases, install `w3m`.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Analysis:**

1.  `firefox-esr +d=trixie`: Left part. `DISTRIBUTION` is `"bookworm"`, condition is false.
2.  `firefox +d=bookworm`: Middle part. `DISTRIBUTION` is `"bookworm"`, condition is true.
3.  Since the second part of the `||` chain worked, the third (`w3m`) will be ignored.
    **Result:** `firefox` will be installed.

#### Example 3: Interaction of priority queue and mandatory package

**Task:** `dkms` is critical for module building; it must be installed first. In the main list, it is marked as mandatory, but with a condition.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Analysis:**

1.  CondinAPT reads priority patterns `^dkms$` and `^build-essential$`.
2.  The line `!dkms +pv=standard` matches the pattern `^dkms$` and is moved to the priority queue **with all its properties**: the mandatory flag (`!`) and the filter (`+pv=standard`).
3.  **Execution Plan:**

    *   **Priority Queue:** Install `!dkms +pv=standard` (mandatory flag and filter are preserved).
    *   **Normal Queue:** `vim`.

**Result:** `dkms` will be installed first, but the `+pv=standard` filter will still be evaluated. If the filter condition is not met, installation will fail because of the `!` (mandatory) flag.

## Installation Queues

The `---` separator on a separate line divides the list into groups (queues). Packages from one queue are installed together in a single `apt` call. Queues are executed strictly sequentially.

### Normal Queues

**Example:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Target Queues (with release specification)

Packages with `@release` automatically group into separate queues by release:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Priority Queue

This mechanism is for prioritized installation of critical packages while preserving their filters and conditions.

*   **Principle:** The file specified by the `-P` flag contains regex patterns (one pattern per line, no filters). CondinAPT scans all queues, finds packages matching these patterns, and moves them (with all their filters and conditions) to a special "Priority Queue", which is executed first.
*   **Pattern Matching:** Uses bash regex matching (`=~` operator). Patterns can be simple package names or complex regex expressions.
*   **Preserving Context:** Unlike simple priority lists, this mechanism preserves all package conditions, filters, and release specifications from the original package list.
*   **Override:** Matched packages are automatically removed from their original queues (both regular and target queues with `@release`) and moved to priority queues. Target releases are preserved in separate priority target queues.

**Example 1: Simple package name matching**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Analysis:**

    1.  CondinAPT reads `priority.list` and knows that packages matching `^gpg$` and `^git$` patterns must be installed first.
    2.  It scans `packages.list` and finds the line `git +st=full-server`. Since `git` matches the pattern, this entire line (with its `+st=full-server` filter) is moved to the priority queue.
    3.  Similarly, `gpg -st=minimal` is moved to the priority queue with its `-st=minimal` filter preserved.
    4.  **Final Plan:**

        *   **Priority Queue:** Install `git +st=full-server` and `gpg -st=minimal` (filters are preserved and evaluated).
        *   **Normal Queue:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Example 2: Regex pattern matching**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Analysis:**

    1.  Pattern `^linux-.*` matches both `linux-image-6.1.0-amd64` and `linux-headers-6.1.0-amd64`.
    2.  Pattern `^firmware-.*` matches `firmware-linux`.
    3.  **Final Plan:**

        *   **Priority Queue:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Normal Queue:** `build-essential`, `nginx +st=server`.

## Operating Modes and Debugging

#### Simulation Mode (`-s`)

Allows you to see which packages will be installed without actually installing them:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Example Output:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Note:** In simulation mode, the script exits with exit code 1.

#### Check Mode (`-C`)

Checks which packages from the list are already installed on the system:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Behavior:**
- Shows errors for uninstalled packages
- Returns exit code 1 if there are uninstalled packages
- At the end, outputs a command to install missing packages

#### Debugging Modes

**Verbose Output (`-v`):**
- Shows detailed information about filter checks
- Displays results for each package

**Very Verbose Output (`-vv`):**
- Maximum process detail
- Shows all intermediate steps

**Command Tracing (`-x`):**
- Enables `set -x` for script debugging
- Shows each command being executed

**Example with Debugging:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Force Cache Update (`-f`)

Forces CondinAPT to run `apt update` before installation:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Advanced Features

### Array Support in Configuration

CondinAPT can work with array variables in the configuration file:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Special Packages

CondinAPT has built-in support for special packages that require special handling:

**Virtual Packages:**
- `qemu-kvm` - treated as a virtual package

**Handling Mechanism:**
1. CondinAPT checks if the package is virtual using the `apt-cache show` command
2. If the package is marked as "purely virtual", it is considered available for installation
3. The list of special packages is defined in the `SPECIAL_PACKAGES` array within the script:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Extending the List:** To add new special packages, you need to edit the `SPECIAL_PACKAGES` array in the CondinAPT code.

## Error Handling and Recovery

### Mandatory Packages (`!`)

If a package is marked as mandatory but not found in repositories, CondinAPT:
1. Outputs an error message
2. Aborts execution (unless in simulation mode)
3. Returns exit code 1

**Example:**
```text
!essential-package +pv=standard
```

If `essential-package` is not found in repositories, execution will abort.

### Handling Unavailable Versions

**Loose Versions (`=`):**
- If the exact version is unavailable, any available version is installed
- A warning is issued about the unavailability of the requested version

**Strict Versions (`==`):**
- If the exact version is unavailable, the package is skipped
- If the package is mandatory (`!`), execution aborts

### Version Holding (`apt-mark hold`)

CondinAPT automatically holds package versions in the following cases:
- When the exactly requested version was installed
- For packages with `==VERSION`, if the version was found and installed
- For packages with `=VERSION`, if exactly that version was found and installed

## Integration with Build Systems

### Usage in Automation Scripts

CondinAPT easily integrates into build systems and automation scripts. For more details on package file syntax, see the [Package List File Syntax](#package-list-file-syntax) section.

### General Integration Example:

**In an automation script (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Universal Configuration Examples

**Example filter mapping file (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Example configuration (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Examples of Real-World Scenarios

### Example 1: Multimedia Server

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Example 2: Web Server with Various Configurations

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Example 3: Container Platform

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Example 4: Advanced Filter Usage

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Optimization Tips

### Organizing Package Lists

1. **Grouping by functionality:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Using queues for dependencies:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Optimizing conditions:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Performance

- Use priority queues for critical packages
- Minimize the number of queues
- Group related packages into one queue
- Use APT caching for large builds

## Troubleshooting

### Common Issues

**Problem:** Package not installing despite correct conditions
**Solution:** Check with the `-vv` flag for detailed filter information

**Problem:** CondinAPT aborts on a mandatory package
**Solution:** Check package availability in repositories or use fallback. See [Error Handling and Recovery](#error-handling-and-recovery) section

**Problem:** Unexpected behavior with package versions
**Solution:** Use [simulation mode](#operating-modes-and-debugging) (`-s`) for verification

### Debugging Filters

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Checking Package Availability

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
