# Security hardening

MiniOS can run as a live recovery system, a persistent portable system, or a
native installation. The appropriate controls depend on how the system is used.
Protect the running session, persistent data, boot media, and any configuration
that is applied at startup.

## Start with trusted media

Download MiniOS from an official source and verify the ISO before writing it.
Follow [Verifying downloads](/installation/Verifying-Downloads.md) and compare
the result before booting or installing. Verification detects a damaged or
substituted download; it does not prove that an already modified USB device is
safe.

Keep the USB device under physical control. Firmware passwords and restricted
boot order can reduce casual unauthorized booting, but do not encrypt files on
the device. Secure Boot may provide additional boot-chain protection on images
and hardware that support it; check the actual release and firmware behavior
rather than assuming support.

## Replace default credentials

An uncustomized MiniOS live image uses the published credentials `live` /
`evil` and `root` / `toor`, with automatic login and passwordless
administrative access in its convenience-oriented configuration. Anyone who can
reach the system may be able to use those credentials, especially if SSH is
active.

Before joining an untrusted network:

1. Set unique user and root passwords in MiniOS Configurator.
2. Select an appropriate security profile and review every populated control.
3. Disable SSH and XRDP unless remote access is required.
4. Reboot into a new session when changing one-shot account or security
   settings, then verify the resulting login and privilege behavior.

The Configurator stores encrypted password hashes rather than plaintext
passwords. If changing an already created persistent or native account, use
`passwd` for the current user and `sudo passwd root` for root.

## Use Configurator security controls

MiniOS Configurator provides three profiles. A profile fills concrete settings;
the profile name itself is not saved as a runtime configuration key, and each
setting remains independently editable.

| Profile | Main behavior |
| --- | --- |
| `convenient` | Autologin-compatible, passwordless sudo and PolicyKit, root and password SSH allowed, relaxed XRDP/X11/lock screen, password hints shown. |
| `balanced` | No autologin, password-required sudo and PolicyKit, SSH root login denied but password SSH allowed, hardened XRDP/X11/lock screen. |
| `strict` | No autologin, password-required sudo and PolicyKit, SSH root and password login denied, XRDP disabled, hardened X11/lock screen, password hints hidden. |

The installer defaults differ by installation mode: live installations favor
`convenient`, while native installations favor `balanced`. These are defaults,
not recommendations for every threat model.

The same settings are available as documented configuration keys, including
`LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`,
`LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`,
`LIVE_ISSUE_PASSWORD_HINTS`, and `LIVE_LOCKSCREEN_MODE`. Prefer these keys or
the Configurator over editing generated sudoers, PolicyKit, display-manager, or
SSH files. See [Configuration file](/configuration/Configuration-File.md).
For save behavior and setting applicability, see
[MiniOS Configurator](/configuration/MiniOS-Configurator.md).

Account creation, passwords, `LIVE_CONFIG_NOROOT`, and the security posture are
one-shot settings used when a new session is created. The Configurator shows
applicability for each control. Reconfigurable settings such as services are
applied after reboot.

## Secure remote access

SSH may be enabled in a MiniOS image for recovery use. On a network where other
users are not trusted, assume the published default credentials are exposed
until you have confirmed otherwise.

- If SSH is unnecessary, add `ssh` to `DISABLE_SERVICES` in Configurator and
  remove it from `ENABLE_SERVICES` if present.
- If SSH is required, deny root login with
  `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefer key authentication. Confirm key login in a separate connection before
  setting `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restrict inbound access with the network firewall or router, and do not expose
  a portable recovery system directly to the Internet.
- Review XRDP separately. The strict profile disables it; the balanced profile
  hardens it but does not necessarily disable its service.

Boot parameters can override configuration-file values. Inspect unexpected
service behavior against [Boot parameters](/configuration/Boot-Parameters.md).

## Encrypt persistent data

Unencrypted native, DynFileFS, and raw persistence can be read by someone who
obtains the device. MiniOS Installer can configure an encrypted LUKS container
for a live session when the source initrd advertises LUKS support. The initrd
creates `changes.luks` on first boot and asks for its passphrase; the installer
does not receive or store that passphrase.

LUKS persistence protects the contents while the container is closed. It does
not protect data after unlock, the unencrypted boot files, copied files outside
the container, or a native root filesystem. LUKS session persistence is not
native root encryption. Use a strong passphrase and keep a tested backup.

See [MiniOS Installer](/installation/MiniOS-Installer.md) and
[Session management](/configuration/Session-Management.md).

## Apply updates deliberately

Refresh package metadata and install Debian security updates in persistent live
sessions or native installations using the normal APT workflow. APT changes in
a fresh live session disappear at reboot. Base SquashFS modules are read-only,
so replacing the ISO or modules with a newer trusted MiniOS release is often the
cleanest way to update the base live system.

See [Software updates](/administration/Software-Updates.md) for the separate APT,
module, image, and kernel workflows.

Before a large update:

- Back up important files and persistent sessions.
- Confirm enough free space is available.
- Avoid interrupting writes or powering off the device.
- Reboot and verify the updated system before discarding the previous known-good
  media or session.

## Treat hooks and preseeding as code execution

The `hooks` boot option and live-config hooks can execute files from the root
filesystem, boot medium, or a URL. Remote hooks, modified media hooks, and
unreviewed preseeds can run with system privileges. Use only reviewed files from
a trusted source, prefer authenticated distribution, and avoid remote hooks on
untrusted networks. See [live-config](/configuration/live-config.md) for the
execution order and supported locations.

## Back up and retire media safely

Persistence is not a backup. Keep a separate copy of user files and export or
copy sessions while they are healthy. Test restoration on different media.
Shut down cleanly before removing writable storage, and keep free space for
session metadata and filesystem operation.

Before disposing of a device, securely erase it according to the storage
technology and sensitivity of the data. Deleting files or reformatting alone
may not make old data unrecoverable.
