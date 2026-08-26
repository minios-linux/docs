---
updated: 2026-08-26
---

# Performance optimization


Performance tuning in MiniOS is mainly a tradeoff between boot time, RAM use,
runtime reads, persistence overhead, and storage durability. For exact option
semantics and safety boundaries, use [Boot modes](/configuration/Boot-Modes.md),
[Initrd module loading](/configuration/Initrd-Module-Loading.md), and
[Initrd persistence](/configuration/Initrd-Persistence.md).

## Boot Parameters for Performance

Boot parameters can move startup work and live-system reads between RAM and the
source device. See [Boot parameters](/configuration/Boot-Parameters.md) for the
complete reference.

### Loading the System into RAM (`toram`)

`toram` can reduce runtime latency from a slow USB device or network-backed ISO,
at the cost of a longer boot and substantially more occupied RAM. Bare `toram`
uses the full-copy path. `toram=trim` usually consumes less RAM, but its narrower
copy can omit data or modules needed later.

Leave room for the writable layer, applications, caches, and zram rather than
sizing only for module files. More RAM assigned to the live copy means less is
available to the workload. Follow [Boot modes](/configuration/Boot-Modes.md) for
copy durability and media-removal constraints.

### Filtering Modules (`load` and `noload`)

Filtering can reduce copied data and mounted layers, particularly with
`toram=trim`. The cost is a less capable system and a greater chance of boot or
runtime failure if a dependency is omitted. Verify the resulting module set;
filter syntax and protected-module limitations are defined in
[Initrd module loading](/configuration/Initrd-Module-Loading.md).

## Persistence Optimization

Persistence moves writable-layer I/O from temporary RAM to storage or a
container. Backend choice affects latency, compatibility, capacity management,
and recovery complexity.

### Persistence Modes (`perchmode`)

- **`native`:** Avoids a filesystem-in-a-file layer and is the simplest choice on a suitable POSIX filesystem, but is unavailable on filesystems that cannot preserve required Linux metadata.
- **`raw`:** Has predictable fixed capacity and conventional ext4 behavior, but reserves its file size and cannot grow beyond available backing storage.
- **`dynfilefs`:** Expands on demand and supports otherwise unsuitable media, with additional mapping and recovery complexity.
- **`luks`:** Adds confidentiality at the cost of unlock work and encryption overhead.
- **`squashfs`:** Trades save-time compression and RAM extraction work for a compact snapshot; it is not a general low-latency writable backend.

Benchmark representative workloads on the actual device. Flash-controller,
filesystem, USB bridge, and workload differences are more reliable than a
universal ranking of persistence modes.

## ZRAM Configuration

Zram trades CPU time for compressed memory capacity and can avoid much slower
storage-backed swap. A larger zram device can absorb more inactive pages but
does not create physical RAM; incompressible workloads still consume memory.
Compression algorithms trade throughput and CPU use against compression ratio,
and availability depends on the kernel. Start with the default and change
`zramsize`, `zramcomp`, or `nozram` only for a measured workload; see
[Boot parameters](/configuration/Boot-Parameters.md) for accepted values.

## Filesystem and Storage Hardware

- **Device choice:** Higher sequential throughput shortens large module copies,
  while low random-I/O latency matters more for persistent desktop workloads.
  Measure the device and enclosure together; the USB generation alone does not
  predict flash or SSD performance.
- **Filesystem choice:** A native Linux filesystem can use native persistence
  without container overhead. Cross-platform filesystems improve portability
  but require a compatible container backend for Linux metadata, adding mapping
  and filesystem layers. Choose based on portability and recovery needs as well
  as benchmark results.
