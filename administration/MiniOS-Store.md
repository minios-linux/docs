# MiniOS Store

MiniOS Store provides a catalog of application recipes at [store.minios.dev](https://store.minios.dev). On MiniOS, those recipes can be installed directly into the running system or used to build one or more SquashFS (`.sb`) modules.

Browsing the catalog does not require a local server. Installation does: the web interface either connects to the local MiniOS Store daemon or opens the installed `minios-store://` URI handler.

## Before installing

Open an application's details and review the following information before adding it to the cart:

- The package names and installation method.
- The installation script, when one is shown.
- The application homepage and developer information.
- Whether the recipe downloads a separate Debian package.

Recipes can install APT packages, download Debian packages, or execute shell scripts. Installation operations run with root privileges. Treat a recipe and every download or repository it uses as privileged code.

## Install an application

1. Open MiniOS Store from the application menu. The launcher checks `https://store.minios.dev` and opens it in the default browser.
2. Search or browse by category, open the application details, and inspect the packages or script.
3. Add one or more applications to the cart.
4. On a live MiniOS session, select `Module` or `System`. A natively installed MiniOS system uses `System` mode automatically.
5. For multiple applications in module mode, select one combined module or separate modules. A combined module can also be given a custom name.
6. Select `Install` and follow the progress and command output. The page uses the local daemon when its status is `Connected`; otherwise it tries the URI handler and may show a PolicyKit authentication prompt.

Only one daemon installation batch can run at a time. Closing the progress dialog does not necessarily stop a daemon installation; reopen the installation indicator to view it or explicitly cancel it.

## Module and system modes

### Module mode

Module mode runs `apt2sb` or `script2sb` in an isolated module-building environment. It writes the resulting `.sb` files to the first writable location below:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

The first path is the modules directory on the current MiniOS boot storage. A module created there is not activated in the current session by MiniOS Store. Leave the module in that directory and reboot to load it on the next boot. The result remains available only if the underlying boot storage is writable and retains the file.

The second path is a fallback used when the normal modules directory is not writable. A module in the fallback directory is not automatically part of the next live boot. Use `Open folder`, then copy the finished module to the `minios/modules` directory on writable MiniOS boot media before rebooting.

A combined module contains all selected recipes. With separate packaging, a failure can affect one recipe while modules completed earlier in the batch remain in the target directory.

### System mode

System mode uses APT or a recipe script directly against the running root filesystem. Changes take effect in the current system rather than producing a module. On a live session, whether those changes survive a reboot depends on the session's persistence configuration. On a natively installed system, MiniOS Store always uses system mode.

System mode is not transactional. A failed or cancelled operation can leave packages, repository state, or files changed by earlier commands.

## Local service and trust boundary

The `minios-store` service runs as root because module construction and direct package installation require mount, overlay, chroot, APT, and dpkg operations. By default it listens only on `ws://127.0.0.1:8765`. The hosted web interface sends complete recipe data, including scripts and download URLs, to this local service.

The daemon validates the request shape and supported installation method, but it does not independently authenticate or sign the recipe payload. A page that can reach the local WebSocket endpoint can request privileged installation work. Therefore:

- Keep the daemon bound to `127.0.0.1`. Do not expose port `8765` to a LAN or the internet.
- Do not set `MINIOS_STORE_HOST` to a non-loopback address unless an additional, reviewed security boundary is in place.
- Use the official HTTPS Store site and inspect recipes before installation.
- Stop or disable the service when browser-based installation is not needed.

Manage the systemd service with:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

The URI handler is a separate path. It starts the GTK installer through PolicyKit and does not require the WebSocket daemon. Current URI entries are interpreted as APT package names with a requested module level and compression setting. The installer starts after authorization, so inspect the browser request before accepting the authentication prompt.

## Cancellation

Select `Cancel` in the web progress dialog or `Cancel installation` in the GTK installer. Cancellation marks the batch as cancelled and terminates the currently tracked child process. Remaining recipes are not started.

Cancellation is not rollback. Packages or modules completed earlier remain, and a command interrupted during APT, dpkg, a script, download, or module construction may leave partial state or an incomplete output file. After cancellation:

1. Read the final installation log.
2. Check the target modules directory for unexpected or zero-size files.
3. For system mode, run `sudo dpkg --audit` and repair package configuration if needed.
4. Remove only artifacts that you have identified as belonging to the cancelled operation.

## Troubleshooting

### The Store is offline

Check network access to `https://store.minios.dev`. An `Offline` status also means the browser is not connected to the local WebSocket daemon; installation may still proceed through the URI handler if `minios-store-gui` is installed.

### The browser cannot connect to the daemon

Check the service and its logs:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

The normal endpoint is `ws://127.0.0.1:8765`. A port conflict, stopped service, missing `python3-websockets`, or browser restrictions can prevent connection. Restarting the browser does not repair a stopped daemon.

### Authentication fails or no prompt appears

The URI installer requires PolicyKit, `pkexec`, and an active desktop authentication agent. Start the installer from an active graphical session and verify that `minios-store-gui` is installed. Do not work around the prompt by exposing the root daemon over the network.

### Module construction fails

Expand the installation log and use the last command error rather than only the summary. Common causes include unavailable packages, repository or DNS failures, insufficient free space, an unsupported compression tool, and a read-only modules directory. The daemon reports when it has switched to `/var/lib/minios-store/modules`.

### The application is absent after installation

For module mode, reboot after confirming that the `.sb` file is in the boot media's `minios/modules` directory. A file left in the fallback directory is not loaded automatically. For system mode on a live session, verify that the session is persistent if the application disappeared after reboot.

### A cancelled system install left dpkg unfinished

Inspect package state before retrying:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Review the proposed APT changes before confirming any additional repair operation.

## Related documentation

- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO](/development/Rebuilding-ISO.md)
