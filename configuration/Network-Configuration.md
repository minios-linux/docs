# Network configuration

After MiniOS starts, NetworkManager normally manages wired and Wi-Fi
connections. This is separate from the initramfs networking used to download a
PXE or HTTP-ISO system. In particular, the PXE `ip=` parameter does not create a
NetworkManager profile or set a lasting session address. See
[Network boot](/installation/Network-Boot.md) for early boot networking.

## Desktop configuration

Use the network icon in the desktop panel to select a Wi-Fi network, disconnect
or reconnect a device, or open the connection editor. For a wired static
address, edit the wired connection and set its IPv4 method to Manual, then enter
the address and prefix, gateway, and DNS servers. Set the method to Automatic
(DHCP) to use DHCP.

The text interface provides the same common operations:

```bash
nmtui
```

Choose **Edit a connection** to change a profile and **Activate a connection**
to bring it up.

## NetworkManager command line

Show devices and saved profiles:

```bash
nmcli device status
nmcli connection show
```

Scan for Wi-Fi and connect:

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

The last command asks for the password without placing it in the command line.
Do not put a Wi-Fi password directly in a command, because it can remain in
shell history and may be visible to other processes.

To change an existing wired profile to DHCP:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

To assign a static IPv4 address:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Replace the profile name and addresses with values for the local network. A
remote connection can be interrupted as soon as its active profile is changed.

## Persistence

NetworkManager saves system profiles under
`/etc/NetworkManager/system-connections/`. In a live boot without persistence,
changes made through the desktop, `nmcli`, or `nmtui` are lost at shutdown. In a
persistent session they remain in that session across reboots. See
[Session management](/configuration/Session-Management.md) for selecting and
saving sessions.

Profiles are not shared automatically between separate persistent sessions.
Wi-Fi profiles may contain credentials, so protect session media and remove
credentials before sharing a session archive or diagnostic output.

## Preconfiguring a wired connection

The MiniOS live-config network component can create a wired static IPv4 policy
before networking services start. It is intended for unattended or installed
systems. It does not configure Wi-Fi.

Add shell-style assignments to `minios/config.conf` on the MiniOS medium or to
`/etc/live/config.conf` in the live system:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Quote values as shell strings and do not add spaces around `=`. See
[Configuration file](/configuration/Configuration-File.md) for file locations
and precedence, and [live-config](/configuration/live-config.md) for component
activation and general options.

The equivalent boot options are:

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

The `live-config.network-*` long forms are also accepted. These are late
userspace live-config options, not the PXE `ip=` syntax.

### Methods

| Method | Behavior |
|--------|----------|
| Unset or `dhcp` | Makes no changes and preserves the image's existing network setup. It does not create DHCP configuration or remove an earlier MiniOS static profile. |
| `static` | Writes a wired static IPv4 profile. The prefix defaults to `24`; gateway and DNS are optional. |
| `off` | Writes a non-autoconnecting NetworkManager profile with IPv4 disabled, or an ifupdown `manual` stanza. It is not a Wi-Fi radio switch. |

Only `static` and `off` select an interface and write configuration. If
`LIVE_NETWORK_INTERFACE` is omitted, live-config proceeds only when exactly one
wired, non-loopback interface is available. Wireless interfaces are excluded.
Use `ip link` or `nmcli device status` to obtain the actual interface name on a
multi-interface system.

### Backends and validation

`LIVE_NETWORK_BACKEND` accepts:

| Backend | Behavior |
|---------|----------|
| `auto` or unset | Prefers NetworkManager and falls back to ifupdown. |
| `nm` | Requires NetworkManager and writes `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Requires ifupdown and writes `/etc/network/interfaces.d/minios-static`. If NetworkManager is installed, it also marks the selected interface unmanaged in `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. |

Interface names may contain only letters, digits, `_`, `.`, `:`, and `-`.
Static addresses and gateways must be valid IPv4 addresses. The prefix must be
an integer from `0` through `32`. DNS is a comma-separated list of IPv4 or IPv6
addresses. Invalid values, ambiguous interface selection, and unavailable
backends are reported and no success stamp is written.

## Changing persistent live-config policy

In a persistent live system, the network component normally applies once and
records success at `/var/lib/live/config/network`. To apply changed static or
off settings:

1. Edit the effective persistent `/etc/live/config.conf`.
2. Remove the stamp with `sudo rm /var/lib/live/config/network`.
3. Reboot.

Changing only the configuration on the removable medium does not overwrite an
existing persistent `/etc/live/config.conf`.

Setting `LIVE_NETWORK_METHOD="dhcp"` is not a profile reset. To return from a
MiniOS-managed static profile to normal NetworkManager DHCP, remove the static
`LIVE_NETWORK_*` policy from the effective configuration, delete the managed
profile and stamp, and reboot:

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

For the ifupdown backend, remove
`/etc/network/interfaces.d/minios-static` and
`/etc/NetworkManager/conf.d/99-minios-unmanaged.conf` instead. Then create or
activate a DHCP profile with the desktop editor, `nmtui`, or `nmcli` if
NetworkManager does not create one automatically.

## Installer behavior

The installer Network step applies only to wired networking. A selected static
IPv4 setup is written for the installed system. Selecting DHCP preserves the
normal defaults rather than writing a profile reset. Existing Wi-Fi profiles
and Wi-Fi settings are left unchanged.

## Diagnostics

Start by checking the device, address, route, and NetworkManager state:

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Check the current boot log for device, firmware, DHCP, and live-config errors:

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

For a live-config policy, also verify the effective settings, generated file,
and stamp. The main live-config log is `/var/log/live/config.log`.

Test failures in order: link state, an address on the interface, the default
route and gateway, an external IP address, and finally a DNS name. This
separates device or firmware problems from DHCP, routing, and DNS problems. See
[Troubleshooting](/administration/Troubleshooting.md) for broader checks and log
collection.

## See also

- [Network boot](/installation/Network-Boot.md)
- [Configuration file](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Troubleshooting](/administration/Troubleshooting.md)
- [Session management](/configuration/Session-Management.md)
