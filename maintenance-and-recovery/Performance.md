---
updated: 2026-09-16
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
- **`dynblk`:** The format-1 kernel block backend presents a normal block device while thin `volumeNNN.db` backing grows on demand. Runtime mappings are sparse and allocate one 4 KiB chunk for 128 logical blocks, so densely mapped data costs about 8 MiB of mapping RAM per GiB, but unallocated virtual capacity consumes no mapping chunk. The fixed internal tree index is only 396,312 bytes per attached device and page-reference counters are sparse. The driver, not MiniOS, chooses the default mapping budget at approximately 25% of usable RAM, capped at 4096 MiB. This favors large sparse capacities; a densely filled volume can consume more mapping RAM per GiB than DynFileFS.
- **`squashfs`:** Stores a compressed snapshot and reconstructs the writable upper in RAM for each boot. It minimizes persistent storage for mostly stable sessions but pays CPU and RAM costs during restore and rewrites the snapshot when saving.

LUKS2 can wrap Raw, DynFileFS, or DynBlk. Encryption adds unlock and crypto overhead while keeping the underlying backend's capacity and storage behavior.

Benchmark representative workloads on the actual device. Flash-controller, filesystem, USB bridge, encryption, compression, and workload differences are more reliable than a universal ranking of persistence modes.

## ZRAM Configuration

Zram trades CPU time for compressed memory capacity and can avoid much slower storage-backed swap. A larger zram device can absorb more inactive pages but does not create physical RAM; incompressible workloads still consume memory.
Compression algorithms trade throughput and CPU use against compression ratio, and availability depends on the kernel. Start with the default and change `zramsize`, `zramcomp`, or `nozram` only for a measured workload; see [Boot parameters](/reference/Boot-Parameters) for accepted values.

## Filesystem and Storage Hardware

- **Device choice:** Higher sequential throughput shortens large module copies, while low random-I/O latency matters more for persistent desktop workloads.
  Measure the device and enclosure together; the USB generation alone does not predict flash or SSD performance.
- **Filesystem choice:** A native Linux filesystem can use native persistence without container overhead. Cross-platform filesystems improve portability but require a compatible container backend for Linux metadata, adding mapping and filesystem layers. Choose based on portability and recovery needs as well as benchmark results.
