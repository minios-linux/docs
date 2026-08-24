# Software updates

MiniOS combines read-only SquashFS image modules with a writable runtime
overlay. An update method must match the layer being changed. Updating packages
inside a running session is not the same as replacing the modules on the MiniOS
medium.

## Update packages with APT

APT writes to the runtime overlay. Enable and use a persistent session before
updating if the changes must survive a reboot:

```bash
sudo apt update
sudo apt upgrade
```

Without persistence, package changes disappear at shutdown. With persistence,
updated files and APT state remain in that session, but the underlying `.sb`
image modules are unchanged. A fresh session still uses the package versions in
the image.

APT is suitable for maintaining one persistent installation. Check available
space first because updated files are stored in addition to the compressed base
modules. Do not treat an in-place Debian release upgrade as a MiniOS image
upgrade; use an image built for the target release instead.

## Update software with modules

An `.sb` module is read-only software loaded at boot. Modules are durable when
stored in the writable MiniOS `modules/` directory or a durable persistence
module source. They do not require package changes to be saved in the session.

Inspect the next-boot module set before and after adding a module:

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

`sb next-boot add` validates and atomically publishes a new module, but it does
not overwrite an existing module with the same name. Remove a replaceable user
module first when an update intentionally keeps the same basename:

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

Base modules and modules on read-only media cannot be removed by this command.
Build or obtain updated modules for the same architecture, distribution release,
and lower module stack. Higher-numbered modules override lower layers, so an old
add-on module can also override files supplied by a newer base image.

For locally packaged software, `apt2sb upgrade` can create an update module. See
[Creating modules](/development/Creating-Modules.md) for module build and
dependency-level details.

## Replace image modules

Official image updates replace files on the MiniOS medium; `apt upgrade` does
not update them. Prefer replacing the complete base module set and matching boot
files from one MiniOS release, or reinstalling from the new image. Do not mix
core, desktop, application, firmware, or boot files from different releases
unless their compatibility is documented.

Before replacement:

1. Back up the MiniOS configuration, persistence data, user modules, and the
   current base modules.
2. Record the active and next-boot module lists with `sb list` and
   `sb next-boot`.
3. Perform the replacement from another system or from a RAM-loaded boot so the
   source files are not in use.
4. Keep the previous files until the new image boots and required hardware and
   applications have been tested.

Preserve module basenames and ordering when a release instructs direct
replacement. A later source with the same basename replaces an earlier source
in the next-boot selection; differently named copies may both load and produce
an unintended layer order.

## Update the kernel

The kernel is a coordinated set: the `01-kernel.sb` driver module, kernel image,
initramfs, and bootloader configuration must agree. Use MiniOS Kernel Manager or
the `minios-kernel` command instead of updating only a `linux-image` package with
APT.

List and package a repository kernel, then activate it for the next boot:

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

Activation updates the MiniOS boot configuration. Reboot to run the selected
kernel, then verify it with `uname -r`. Keep at least one known-working kernel
and its boot files until hardware, storage, networking, and out-of-tree drivers
have been tested. The standard MiniOS kernel module may include additional
drivers not present in a distribution repository kernel.

See [Kernel management](/administration/Kernel-Management.md) for the graphical
workflow, command options, and recovery procedure.

## Compatibility and recovery

Back up persistence before changing the base image or kernel. Persistent package
files and metadata can override a new base module or describe package versions
that no longer match it. Test a new image with a fresh session first, then test a
copy of the existing session. Keep the original image, modules, and session
backup until rollback is no longer required.

After any update, verify the selected modules, boot once, and check the affected
applications and hardware. If a new base image conflicts with old user modules
or persistence, disable those layers and reintroduce them one at a time.
