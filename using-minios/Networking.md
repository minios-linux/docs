---
updated: 2026-08-31
---
# Networking

MiniOS uses **NetworkManager** for normal wired and Wi-Fi networking. MiniOS does not replace its connection model with a separate network configuration system.

For ordinary use, open the network icon in the desktop panel. The standard NetworkManager tools are also available:

```bash
nmtui
nmcli
```

Use these tools for connecting to Wi-Fi, switching networks, configuring DHCP or static addresses, DNS, VPN connections, and other normal runtime networking. For their full behavior, use the NetworkManager documentation and manual pages.

In a persistent MiniOS session, NetworkManager connection profiles are saved as part of that session. In **Start without saving**, changes disappear at shutdown.

## Network preconfiguration

MiniOS-specific network settings are primarily **preconfiguration**. They are useful when an image, installer, or unattended deployment should start with a known wired configuration before the user opens NetworkManager.

The MiniOS `live-config` network component supports wired IPv4 preconfiguration. It does not preconfigure Wi-Fi.

A static example in `config.conf` is:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` accepts `dhcp`, `static`, or `off`. Unset and `dhcp` preserve the image's existing network setup rather than replacing normal NetworkManager behavior. `static` writes a wired static IPv4 configuration; `off` prepares the selected wired interface not to connect automatically. With `LIVE_NETWORK_BACKEND="auto"`, MiniOS prefers NetworkManager and falls back to ifupdown when necessary. If no interface is specified, preconfiguration is applied only when exactly one eligible wired interface can be identified.

See [Configuration file](/reference/configuration/config.conf) for where these settings are stored and [live-config](/reference/configuration/live-config) for the complete variable and component reference.

## When preconfiguration applies

The network component is a one-time `live-config` setup step. After it has successfully run in a persistent session, ordinary network changes should be made with NetworkManager rather than by repeatedly editing the preconfiguration.

If you intentionally need to apply changed MiniOS network preconfiguration to the same persistent session, remove its completion stamp and reboot:

```bash
sudo rm -f /var/lib/live/config/network
```

Do this only when you actually want `live-config` to generate the wired policy again. Changing normal Wi-Fi or Ethernet connections does not require it.

## Installer preconfiguration

The MiniOS Installer network step also performs preconfiguration for the target system. It supports wired DHCP or static IPv4 settings. Wi-Fi is left to NetworkManager after the installed system starts.

## Early-boot networking is different

NetworkManager configures the running MiniOS system. Networking used by the initramfs to obtain MiniOS itself is a separate mechanism.

The `ip=` boot parameter, PXE downloads, and `from=http://...` therefore do not create NetworkManager profiles and should not be used as a way to configure the normal desktop network. See [Network boot](/reference/boot-process/Network-Boot).

## Troubleshooting

For an ordinary connection problem, start with NetworkManager itself:

```bash
nmcli device status
nmcli connection show --active
```

Use the desktop connection editor, `nmtui`, or standard NetworkManager logs and documentation for normal Wi-Fi, DHCP, DNS, VPN, or Ethernet problems.

MiniOS-specific diagnostics are relevant when a problem concerns network preconfiguration or network boot. The `live-config` log is `/var/log/live/config.log`; early network-boot problems are covered by the [Network boot](/reference/boot-process/Network-Boot) guide.

## Related documentation

- [Configuration file](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Network boot](/reference/boot-process/Network-Boot)
- [Session management](/using-minios/Sessions-and-Persistence)
