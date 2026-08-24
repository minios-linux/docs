# Network boot

This page describes **how to load MiniOS over the network**: PXE (kernel + initrd + MiniOS data) and HTTP ISO (`from=http://…`). That is the only purpose of networking inside the MiniOS initramfs.

It is **not** about:

- Configuring NetworkManager or a lasting static IP after the system is up
- Wi‑Fi in the initrd
- [live-config](/configuration/live-config.md) (late userspace)

Session networking after boot is separate. For durable wired static IP, use the installer Network step, NetworkManager, or ifupdown—not the PXE `ip=` parameter.

Related: [Boot parameters](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Overview

| Mode | What you boot | How MiniOS data is obtained |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd from a network boot server | Non-empty `ip=` → initrd downloads MiniOS files from the PXE data server (HTTP preferred, TFTP fallback) |
| **HTTP ISO** | Kernel + initrd from local media **or** PXE | `from=http://…/minios.iso` → initrd brings up the network and mounts the ISO with `httpfs2` |
| **Local media** | USB / ISO / disk | No initrd network; local search only |

Initramfs builders: **LiveKit** (`livekit-mos`) or **dracut** (`dracut-mos`). Both use the same LiveKit network helpers for early fetch.

```text
find_data()
  ├─ from=http://…     → configure network → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

**Important:** any non-empty `ip=` selects the **PXE data path** and **skips local media**. Do not add `ip=` on a normal USB/ISO boot just to “set a static address.”

## Requirements

| Requirement | Notes |
|-------------|--------|
| Wired Ethernet (or virtio/vmxnet in VMs) | First usable non-loopback interface is used; no `BOOTIF` / `ethdevice` selection in initrd |
| Initrd with network modules | Built for non-**minimum** package variants (`--network`, often `--cloud`) |
| No reliance on Wi‑Fi | Wireless is not supported in the network-boot path |
| Prefer NICs without firmware blobs | Firmware-dependent cards often fail in initrd |
| Prefer **standard+** images | **minimum** omits network NIC modules → PXE / HTTP ISO effectively unsupported |
| HTTP only for ISO URL | `from=http://…` works; **`https://` is not supported** |

Tools in the initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp`, and `@mount.httpfs2`. There is no NetworkManager in the initrd.

## PXE boot

### Flow

1. Firmware / PXE server loads the MiniOS **kernel** and **initrd** (pxelinux, iPXE, etc.—outside MiniOS itself).
2. Kernel cmdline includes a non-empty **`ip=`** (and normally `boot=live` for a full MiniOS boot).
3. Initrd configures a static address from `ip=`, contacts the **server** field, downloads a file list, then MiniOS bundles/files.
4. System continues into the live root as usual.

### Parameter `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Field | Role |
|-------|------|
| client-ip | Address assigned with busybox `ifconfig` |
| server-ip | Host for HTTP/TFTP MiniOS data; also written as a DNS nameserver in the initrd |
| gateway-ip | Default route; also written as a DNS nameserver |
| netmask | Dotted IPv4 netmask (not CIDR prefix length) |
| port | Optional HTTP port for the file list and files (default **7529**) |

Examples:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### How files are fetched

1. **HTTP** (preferred):  
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`  
   then each path listed in that file from the same host/port.
2. **TFTP** (fallback if HTTP fails): busybox `tftp` for `PXEFILELIST` and listed files.

Default port is **7529** when the fifth field is omitted.

### What `ip=` is not

| Expectation | Reality |
|-------------|---------|
| Kernel / dracut forms (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Not supported** — misparsed as a client address |
| Static IP for the whole live session | **Not supported** — after boot, NetworkManager (or similar) owns the interface |
| Static IP while still booting from USB/ISO | **Do not use** — forces PXE data download |
| Dedicated DNS list | Only gateway + server are used as nameservers in the initrd |

## HTTP ISO boot (`from=http://…`)

Load MiniOS data from a remote ISO without a full PXE file list:

```text
from=http://192.168.1.1/path/minios.iso
```

Behavior:

1. Initrd brings up the network:
   - If **`ip=`** is set → static config as above
   - If **`ip=`** is omitted → **DHCP** via busybox `udhcpc`
2. Mounts the remote ISO with **`httpfs2`**
3. Continues looking up MiniOS content on that mount

Optional **`cache=`** (megabytes) enables an httpfs download cache, for example `cache=512`.

Only **`http://`** is accepted for this remote-ISO path. **`https://` is not supported.**

## After the live system starts

| Item | After switch_root |
|------|-------------------|
| Kernel IP/routes on the NIC | May remain until userspace reconfigures the interface |
| Initrd DNS (`resolv.conf`) | Not durable session policy |
| Session network | Typically **NetworkManager** on default MiniOS images |
| Meaning of `ip=` | Early fetch only — not a remembered static profile |

If the root is still fed by **httpfs**, NetworkManager reconfiguring the NIC can disrupt the live root. Plan network-boot deployments with that in mind (e.g. copy to RAM / avoid clobbering the fetch interface where possible).

Late userspace **live-config** may briefly bring up networking only to download remote hooks/preseeds (`Setup_network`). That is unrelated to PXE/`ip=` durable addressing.

## Common mistakes

1. Putting `ip=` on a USB/ISO cmdline “for static IP” → system tries PXE download instead of local media.
2. Using `ip=dhcp` or other kernel `ip=` syntax → wrong parser, broken address setup.
3. Expecting Wi‑Fi or multi-NIC `BOOTIF` selection in initrd → not implemented.
4. Using a **minimum** image for PXE/HTTP ISO → network modules missing from initrd.
5. Serving the ISO only over HTTPS → `from=http://…` will not match.
6. Confusing this with installer/NetworkManager static configuration after login.

## Reliability summary

| Scenario | Assessment |
|----------|------------|
| PXE + `ip=…` + HTTP list on :7529 (or TFTP), simple wired / virtio | Supported target |
| `from=http://…iso` + DHCP (or `ip=`), same NIC class | Usually works |
| Normal USB/ISO boot | Initrd network not used |
| Session static via `ip=` | Not supported |
| Multi-NIC / firmware NIC / Wi‑Fi / `https://` / minimum edition | Weak or unsupported |

## Implementation reference

| Piece | Location in the MiniOS tree |
|-------|-----------------------------|
| Init entry | `linux-live/initramfs/livekit-mos/init` |
| Network + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| LiveKit builder (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Dracut MiniOS module | `linux-live/initramfs/dracut-mos/90minios/` |
| When `-n` is passed | `linux-live/build-initramfs` (non-minimum) |

## See also

- [Boot parameters](/configuration/Boot-Parameters.md) — full parameter table (`ip`, `from`, `cache`, …)
- [live-config](/configuration/live-config.md) — late userspace configuration (not network boot)
- [System architecture](/about/System-Architecture.md)
- [Building MiniOS](/development/Building-MiniOS.md) — initramfs builder (`livekit` / `dracut`)
