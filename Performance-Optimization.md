# Performance Optimization Guide

This guide provides techniques to optimize MiniOS performance, focusing on its unique features as a live system. The most significant performance gains can be achieved by tuning how MiniOS loads its data and handles persistent changes.

## Boot Parameters for Performance

The most effective way to boost performance, especially when running from a slow USB drive, is by using boot parameters to control how the system loads into memory. For complete list of available parameters, see [Boot Parameters](Boot-Parameters.md).

### Loading the System into RAM (`toram`)

This is the single most important optimization. The `toram` boot parameter copies the entire MiniOS system from the boot media into your computer's RAM. This makes the system incredibly responsive, as it no longer needs to read data from the slower USB drive.

- **Usage:** Add `toram` to the kernel command line at boot.
- **Requirement:** You need enough RAM to hold the core system modules. For the `standard` edition, at least 2-3 GB of free RAM is recommended.
- **Benefit:** Drastically improves application launch times and overall system snappiness.

There are two modes for `toram`:

- **`toram=full` (Default):** Copies all system modules to RAM. Use this if you have plenty of memory.
- **`toram=trim`:** Copies only the essential modules defined by the `load` and `noload` boot parameters. This is useful for systems with limited RAM.

### Filtering Modules (`load` and `noload`)

To reduce memory usage, you can specify which modules to load. This is particularly effective when combined with `toram=trim`.

- **`load=module1,module2`:** Loads only the specified modules (e.g., `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name`:** Excludes a specific module from being loaded.

This allows you to create a lean system in RAM, tailored to your needs.

## Persistence Optimization

The way MiniOS saves your changes (persistence) can significantly impact performance, especially write speeds.

### Persistence Modes (`perchmode`)

The `perchmode` boot parameter defines the backend for your persistent storage. The choice depends on your storage device:

- **`perchmode=native` (Default):** Saves files directly to a directory on your storage device. This is the **fastest option for SSDs and fast USB drives** as it avoids filesystem-in-a-file overhead.
- **`perchmode=raw`:** Uses a pre-allocated raw image file for changes. Performance is good, but the file size is fixed.
- **`perchmode=dynfilefs`:** Uses a dynamically expanding file. This is a good choice for **slower USB flash drives** as it can reduce write amplification and potentially extend the life of the drive, though it may be slightly slower than `native` mode.

### Enabling and Disabling Persistence

By default, MiniOS runs in a "live" mode where all changes are discarded on reboot. To save your changes, you must explicitly enable persistence.

- **To Enable Persistence:** Add the `perch` parameter to your boot command line. This tells MiniOS to activate the persistence mechanism.
- **To Disable Persistence:** Simply do not add the `perch` parameter. If it's not present, the system will run entirely from RAM (or the boot device), and no changes will be saved.

## ZRAM Configuration

MiniOS uses `zram` by default to create a compressed swap space in your RAM. This improves performance on systems with limited physical memory by avoiding the use of a much slower swap file on disk.

**Automatic sizing:**
- **≥4GB RAM:** 2GB ZRAM
- **1-4GB RAM:** 50% of total RAM  
- **<1GB RAM:** 512MB ZRAM

**Boot parameters:**
- **`zramsize=1024`:** Sets the size of the zram device (e.g., `zramsize=1024` for 1GB). By default, it's auto-configured based on your total RAM.
- **`zramcomp=lz4`:** Sets the compression algorithm (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` is generally a good balance of speed and compression ratio.
- **`nozram`:** Completely disable ZRAM.

For most users, the default `zram` settings are optimal. Adjusting them is only recommended if you have specific needs and understand the trade-offs.

## Filesystem and Storage Hardware

- **Use a Fast USB Drive:** The single biggest hardware factor for MiniOS performance is the speed of your USB drive. Using a **USB 3.0 or faster SSD-based drive** will provide a dramatically better experience than a cheap, slow USB 2.0 flash drive.
- **Filesystem Choice:** For the persistence partition, using a standard Linux filesystem like **ext4** will generally provide the best performance and reliability.