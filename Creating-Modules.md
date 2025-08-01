# Creating modules

Modules in MiniOS are self-contained packages of files and configurations that extend the functionality of the base system. They are similar to packages in other Linux distributions, but they are designed to be layered on top of each other, allowing for a flexible and customizable system. This layered approach enables easy customization, rollback of changes, and sharing of configurations.

For the complete MiniOS build process and system architecture context, see the [Building MiniOS guide](Building-MiniOS.md). For information about the CondinAPT package management system used in modules, see [CondinAPT Documentation](CondinAPT.md).

There are quite a lot of utilities for creating modules in MiniOS. All of them are designed to use the terminal and require root privileges.

**Module Creation Utilities:**

**apt2sb** - installs packages from repositories and packages them into a module.<br>
**script2sb** - performs the actions described in the script and packages the result into a module.<br>
**chroot2sb** - opens chroot, allowing you to perform any actions in it, after exiting it saves the result in the module.<br>

**Additional Module Management Utilities:**

**dir2sb** - converts an existing directory to a compressed module.<br>
**sb2dir** - converts a compressed module to a directory for examination.<br>
**rmsbdir** - removes a module directory created by sb2dir.<br>
**savechanges** - saves all changed files in the system to a compressed filesystem bundle.<br>
**sb2iso** - generates a MiniOS ISO image, optionally adding or excluding modules.<br>
**sb** - comprehensive interface for managing MiniOS bundles (activate, deactivate, list, convert).<br>

**Common features of module creation utilities:**
- Support for different compression types: zstd (default), gzip, lzo, xz
- Customizable module file extension (default: sb)
- Level-based filtering to control which existing modules to include as dependencies
- Custom naming for output modules
- All utilities must be run as root

## apt2sb

To build a module using apt2sb, simply list the packages you want to package in the module, e.g. `apt2sb install chromium chromium-sandbox`. Running this command in the folder where the command was run will result in a chromium.sb module that will contain the Chromium browser. This module will be built relative to all the modules that are loaded into the system, which means that it will require all of them to run, since the libraries required for the program to work may already be installed in the system and may be contained in the lower modules.

Using the `-l`/`--level` option we can specify on which top module we need to build our module. For example, the `apt2sb install -l 4 chromium chromium-sandbox` command will filter out all modules numbered 04 and above when building, i.e. the module will be built based on modules numbered 00-03. As a result of executing this command, we will get the 04-chromium.sb module in the folder from which the command was executed. This module will have a larger size than the package in the previous example because it will include all the libraries necessary to run the program, which could be contained in modules with numbers 04 and higher, but it will be able to run both in the presence of modules with numbers 04-xx and in their absence.

The module name is created automatically, based on the name of the first specified package (in our case, chromium) and, if the --level option is specified, the level number. In case you want to specify the module name yourself, you can use the `-n`/`--name` option, e.g. `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Additional options available in apt2sb:**

- `-c`/`--comp` - Compression type (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Bundle extension. Default: sb
- `-y`/`--yes` - Automatic yes to prompts
- `--allow-downgrades` - Allow downgrades of packages
- `--install-recommends` - Consider recommended packages as a dependency for installing
- `--install-suggests` - Consider suggested packages as a dependency for installing
- `--no-install-recommends` - Do not consider recommended packages as a dependency for installing
- `--no-install-suggests` - Do not consider suggested packages as a dependency for installing
- `-t`/`--target-release` - Default release to install packages from

apt2sb also has an `upgrade` command that allows to upgrade already installed packages. The upgrade command uses the same options as install.

## script2sb

To build a module using script2sb, you need to write a bash script that describes the steps required to build your module. This can be useful if you need to perform some actions in the file system, import keys, add a repository, etc. before or after the installation. Here is an example of such a script:
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
To run a build on this script (let's call it caddy.sh), you must run the `script2sb -s ./caddy.sh` command.

**Available options for script2sb:**

- `-s`/`--script` - Use FILE as the installation script (required)
- `-l`/`--level` - Use LEVEL as the filter level
- `-n`/`--name` - Use NAME as the filename for the module
- `-c`/`--comp` - Compression type (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Bundle extension. Default: sb
- `-d`/`--directory` - Copy contents of DIR to the root of the module

If no module name is specified, the name is created based on the level number, if specified, and the script name. An example of executing a command using these options is: `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

In addition to these options, you can use the `-d`/`--directory` option. If this option is specified, the contents of the folder specified by the option argument will be copied to the root of the module before the script is executed. The files in such a folder should be arranged as they would be in the root folder of the system. Let's say you need to place a shortcut for some program in the menu, then let's create a mymodule folder and create a structure in it relative to the system root:
```
mkdir -p /home/user/mymodule/usr/share/applications
```
In the mymodule/usr/share/applications folder you should put the desktop file that will be packed into the module after the build is complete and run the build command:
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

The `chroot2sb` utility is used to create an interactive chroot environment. This allows you to manually perform *any* actions required to build your module (install packages, edit files, run commands, etc.). Once you exit the chroot environment, the changes you made are packaged into a module.

**Available options for chroot2sb:**

- `-l`/`--level` - Use LEVEL as the filter level  
- `-n`/`--name` - Use NAME as the filename for the module
- `-c`/`--comp` - Compression type (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Bundle extension. Default: sb
- `-d`/`--directory` - Copy contents of DIR to the root of the module

If no module name is specified, the name is created based on the level number, if specified, and the current date and time in format YYYYMMDD-HHMM.

You can also use the `-d`/`--directory` option, similar to `script2sb`. If this option is specified, the contents of the specified folder will be copied to the root of the module *before* you enter the chroot environment. This provides a starting point for your customizations.

**Example Usage:**

- Basic chroot, automatic module name: `chroot2sb`
- Specify level and compression: `chroot2sb -l 3 -c gzip`
- Specify level, name, and compression: `chroot2sb -l 3 -n 04-my-module.sb -c xz`
- Copy files from a directory before entering chroot: `chroot2sb -d /path/to/my/files`

After running the `chroot2sb` command, you will be placed in a chroot environment. You can then perform any actions you need. When you're finished, type `exit` to leave the chroot environment. `chroot2sb` will then package the changes into a module. Any commands entered in the chroot are *not* saved as part of the final module's installation process. It's a snapshot of the final filesystem state. The bash history is automatically deleted from the module.

## Additional Module Management Utilities

In addition to the module creation utilities, MiniOS provides several utilities for managing and working with existing modules:

### dir2sb

The `dir2sb` utility is used to convert an existing directory into a compressed module. This is useful when you have already prepared a directory structure with all the necessary files and want to package it into a module without running any installation processes.

**Available options for dir2sb:**

- `-c`/`--comp` - Compression type (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Bundle extension. Default: sb

**Usage:**

`dir2sb [OPTIONS] SOURCE_DIRECTORY [TARGET_FILE]`

**Behavior:**

- If `SOURCE_DIRECTORY` does not have a .sb extension and is not named 'squashfs-root', then the directory itself is included in the module, and `TARGET_FILE` is required.
- If `TARGET_FILE` is not specified, `SOURCE_DIRECTORY` is replaced by the new module file.

**Examples:**

- Convert a prepared directory to a module: `dir2sb /path/to/my/prepared/files my-module.sb`
- Convert squashfs-root directory (replaces original): `dir2sb squashfs-root`
- Use different compression: `dir2sb -c xz /path/to/files custom-module.sb`

This utility is particularly useful when you want to:
- Package pre-configured files and directories
- Convert extracted module contents back to a module
- Create modules from manually prepared directory structures

### sb2dir

The `sb2dir` utility converts a compressed module (.sb file) into a directory with the same name. This is useful for extracting and examining module contents.

**Usage:**

`sb2dir [source_file.sb] [optional_output_directory]`

**Behavior:**

- If the output directory is specified, it must exist
- If the output directory is not specified, the name source_file.sb is used and the directory is overmounted with tmpfs

**Examples:**

- Extract a module to examine its contents: `sb2dir mymodule.sb`
- Extract to a specific directory: `sb2dir mymodule.sb /tmp/extracted`

### rmsbdir

The `rmsbdir` utility removes a module directory that was created by `sb2dir`. This properly cleans up the tmpfs mount if it was used.

**Usage:**

`rmsbdir [source_directory.sb]`

**Example:**

- Remove extracted module directory: `rmsbdir mymodule.sb`

### savechanges

The `savechanges` utility saves all changed files in the system to a compressed filesystem bundle. This is useful for creating modules from runtime changes.

**Available options:**

- `-c`/`--comp` - Compression type (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Bundle extension. Default: sb

**Usage:**

`savechanges [OPTIONS] target_file.sb [changes_directory]`

If changes_directory is not specified, `/run/initramfs/memory/changes` is used.

**Examples:**

- Save all current changes: `savechanges my-changes.sb`
- Save with different compression: `savechanges -c xz my-changes.sb`

### sb2iso

The `sb2iso` utility generates a MiniOS ISO image, optionally adding specified modules or excluding existing ones.

**Available options:**

- `-e`/`--exclude` - Exclude any existing path or file matching REGEX
- `-n`/`--name` - Specify output ISO filename (default: minios-YYYYMMDD_HHMM.iso)

**Usage:**

`sb2iso [OPTIONS]... [MODULE.SB]...`

**Examples:**

- Create MiniOS ISO without firefox.sb module: `sb2iso -e 'firefox' -n minios_without_firefox.iso`
- Create MiniOS text-mode core only: `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

The `sb` utility provides a comprehensive interface for managing MiniOS bundles, including activation, deactivation, and conversion operations.

**Important:** The `sb` utility requires AUFS (Advanced multi layered UniFication FileSystem) kernel support for most operations. If AUFS is not available in your kernel, many commands will not work.

**Available commands:**

- `activate BUNDLE` - Activate a MiniOS bundle
- `deactivate BUNDLE` - Deactivate an active MiniOS bundle  
- `list` - List active MiniOS bundles
- `savechanges` - Save changes made at runtime to the bundle
- `rm DIR` / `rmdir DIR` - Remove an unpacked bundle directory
- `conv PATH` - Convert an .sb bundle to directory or vice versa

**Examples:**

- Activate a module: `sb activate mymodule.sb`
- Deactivate a module: `sb deactivate mymodule.sb`
- List active modules: `sb list`
- Convert module to directory: `sb conv mymodule.sb`
- Convert directory to module: `sb conv mymodule/`

**Note:** The `activate`, `deactivate`, and `list` commands require AUFS kernel support and root privileges. The `conv`, `rm`, and `rmdir` commands work without AUFS but still require root privileges.
