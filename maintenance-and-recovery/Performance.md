---
updated: 2026-09-26
---
# Performance


Performance tuning in MiniOS is mainly a tradeoff between boot time, RAM use, runtime reads, persistence overhead, and storage durability. For exact option semantics and safety boundaries, use [Boot modes](/using-minios/Boot-Modes), [Initrd module loading](/reference/boot-process/Module-Loading), and [Initrd persistence](/reference/boot-process/Persistence-Internals).

## Boot Parameters for Performance

Boot parameters can move startup work and live-system reads between RAM and the source device. See [Boot parameters](/reference/Boot-Parameters) for the complete reference.

### Loading the System into RAM (`toram`)

`toram` can reduce runtime latency from a slow USB device or network-backed ISO, at the cost of a longer boot and substantially more occupied RAM. Bare `toram` uses the full-copy path. `toram=trim` usually consumes less RAM, but its narrower copy can omit data or modules needed later.

Leave room for the writable layer, applications, caches, and zram rather than sizing only for module files. More RAM assigned to the live copy means less is available to the workload. Follow [Boot modes](/using-minios/Boot-Modes) for copy durability and media-removal constraints.

### Filtering Modules (`load` and `noload`)

Filtering can reduce copied data and mounted layers, particularly with `toram=trim`. The cost is a less capable system and a greater chance of boot or runtime failure if a dependency is omitted. Verify the resulting module set; filter syntax and protected-module limitations are defined in [Initrd module loading](/reference/boot-process/Module-Loading).

## Persistence Optimization

Persistence moves writable-layer I/O from temporary RAM to storage or a container. Backend choice affects latency, compatibility, capacity management, and recovery complexity.

### Persistence Modes (`perchmode`)

- **`native`:** Stores the writable layer directly as ordinary files. It has the least container overhead and no fixed container size, but requires a backing filesystem that preserves the Linux metadata and operations MiniOS needs.
- **`raw`:** Uses one fixed-capacity ext4 image. Its file length is set to the requested capacity and growth is explicit, so it is simple and predictable but lacks the thin-capacity behavior of the dynamic backends. FAT32 limits the single image to 4000 MiB.
- **`dynfilefs`:** The FUSE/format-400 backend expands payload storage on demand and supports otherwise unsuitable media. Its index is not sparse: every declared 4 KiB logical block needs one 8-byte offset, so logical capacity costs about 2 MiB of RAM and about 2 MiB of backing-index storage per GiB even when the payload is empty. This makes moderate capacities efficient but large thin capacities expensive up front.
- **`dynblk`:** The format-1 `DBSPRS01` kernel backend keeps mapping tables on disk and a bounded metadata cache in RAM (default 1 MiB). Filling an existing device does not allocate a full resident map. Extent descriptions and directories scale with declared parts; file cache and codec memory are additional. `dynblk limits --format dynblk` reports the geometry ceiling; `dynblk status /dev/dynblkN --json` reports accounted buffers and cache statistics. Ordinary raw overwrites stay in place; partial compressed updates currently recompress a 64-KiB grain. Choose the attachment cache policy deliberately: `unsafe` gives up durability guarantees.
- **`squashfs`:** Stores a compressed snapshot and reconstructs the writable upper in RAM for each boot. It minimizes persistent storage for mostly stable sessions but pays CPU and RAM costs during restore and rewrites the snapshot when saving. When memory permits, saving stages a stable copy of the changes in RAM and compresses directly into one private candidate in the session directory. After verification and syncing, MiniOS atomically replaces `changes.sb`; it does not write a second compressed copy. If RAM cannot hold the staging tree, it uses the existing disk workspace for that tree.

LUKS2 can wrap Raw, DynFileFS, or DynBlk. Encryption adds unlock and crypto overhead while keeping the underlying backend's capacity and storage behavior.

Benchmark representative workloads on the actual device. Flash-controller, filesystem, USB bridge, encryption, compression, and workload differences are more reliable than a universal ranking of persistence modes.

### Reduce cache and log writes with `perch`

MiniOS Configurator's **Advanced** tab offers independent storage settings for ordinary system logs, APT downloads, and standard native-browser caches. They also work in `minios/config.conf` or its `config.conf.d/*.conf` fragments:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Each setting accepts `persistent` (the default) or `volatile`. Reboot after changing one. `minios-boot` applies the policy only when the running `perch` session is confirmed writable and durable; requesting persistence is not enough. For a one-time boot, use `log-storage=volatile`, `apt-cache=volatile`, or `browser-cache=volatile` on the kernel command line. The `live-config.`-prefixed forms also work and take precedence over configuration files. These settings do **not** activate `perch` by themselves. See [Configuration file](/reference/configuration/config.conf) for source-file ordering and [Boot parameters](/reference/Boot-Parameters) for the complete syntax.

| Setting | What stays in RAM with `volatile` | What remains on persistent storage |
|---|---|---|
| `LIVE_LOG_STORAGE` | The systemd journal (maximum 32 MiB) and ordinary `/var/log` files (32 MiB tmpfs). | Boot diagnostics in `/var/log/minios/` and `/var/log/live/`, including three earlier log versions. |
| `LIVE_APT_CACHE` | Downloaded packages in `/var/cache/apt/archives` (256 or 512 MiB tmpfs, depending on available memory). | Package state in `/var/lib/dpkg`, repository lists in `/var/lib/apt/lists`, and installed files. |
| `LIVE_BROWSER_CACHE` | One shared 512 MiB tmpfs for standard cache directories of Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera, and Yandex Browser under the live user's `~/.cache`. A system policy disables Firefox's disk cache. | Profiles, cookies, passwords, site data, and unrelated applications' caches. |

APT and browser RAM caches are skipped if less than 1 GiB is available or non-zRAM swap is active. The APT archive tmpfs does not overflow onto the device: a download larger than its remaining capacity can fail. An existing Firefox `policies.json` is not replaced; review its disk-cache setting separately. Standard native-browser paths are prepared after the live user is created, including when a browser is installed later. Custom paths, Flatpak/Snap installations, and users created after that setup are not automatically redirected. Previously stored browser caches are hidden by the RAM mounts for this boot and reappear when switching back to `persistent`.

Boot logs remain on the writable persistence store regardless of the ordinary log setting; a SquashFS session keeps them outside `changes.sb`, so they do not depend on snapshot saving at shutdown. With `volatile`, other files under `/var/log` (including APT/dpkg text history) disappear at reboot. `EXPORT_LOGS=true` is a separate explicit export to the MiniOS medium. A full 32 MiB log tmpfs stops accepting new log writes rather than spilling onto flash. If another disk-backed swap is enabled later, memory-backed files can still be paged to that swap. See [Troubleshooting](/maintenance-and-recovery/Troubleshooting#collecting-logs) for finding the boot diagnostics.

MiniOS also uses `noatime` when mounting its own data and container filesystems, avoiding access-time metadata updates; this does not remount unrelated user disks. Standard `relatime` already limits such updates, so measure the difference before treating it as a major saving. Keep filesystem journal, barriers, and `fsync` enabled for a removable persistent store.

For a controlled 16 MiB log-file write followed by `sync`, a Testo VM recorded 33,304 sectors written to its lower virtual disk in persistent mode and 8 in volatile mode. This demonstrates the change in write path for that workload. It does not measure writes inside a USB flash controller or predict NAND lifetime. Compare identical application workloads on the actual device before drawing a lifetime conclusion.

## ZRAM Configuration

Zram trades CPU time for compressed memory capacity and can avoid much slower storage-backed swap. A larger zram device can absorb more inactive pages but does not create physical RAM; incompressible workloads still consume memory.
Compression algorithms trade throughput and CPU use against compression ratio, and availability depends on the kernel. Start with the default and change `zramsize`, `zramcomp`, or `nozram` only for a measured workload; see [Boot parameters](/reference/Boot-Parameters) for accepted values.

## Filesystem and Storage Hardware

- **Device choice:** Higher sequential throughput shortens large module copies, while low random-I/O latency matters more for persistent desktop workloads.
  Measure the device and enclosure together; the USB generation alone does not predict flash or SSD performance.
- **Filesystem choice:** A native Linux filesystem can use native persistence without container overhead. Cross-platform filesystems improve portability but require a compatible container backend for Linux metadata, adding mapping and filesystem layers. Choose based on portability and recovery needs as well as benchmark results.
