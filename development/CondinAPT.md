---
updated: 2026-08-31
program_commits:
  minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---
# CondinAPT

CondinAPT selects and installs APT packages from a list whose entries can depend on Bash configuration variables. MiniOS uses it for host prerequisite checks, the core package set, and ordinary SquashFS modules.

This page documents the implementation in `linux-live/condinapt`. CondinAPT is not a general dependency solver: it evaluates filters and repository availability first, builds APT queues, and then installs each selected queue in one `apt-get` call.

## Synopsis

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

The package list and configuration are required regular, readable files. The mapping and priority files are optional.

| Option | Meaning |
| --- | --- |
| `-l`, `--package-list PATH` | Package-list file |
| `-c`, `--config PATH` | Trusted Bash configuration |
| `-m`, `--filter-mapping PATH` | Prefix-to-variable mapping |
| `-P`, `--priority-list PATH` | Bash regular expressions for priority extraction |
| `-s`, `--simulation` | Select and display packages without installing them |
| `-C`, `--check-only` | Check installed package names without installation |
| `-v`, `--verbose` | Filter and queue diagnostics |
| `-vv`, `--very-verbose` | Additional priority-queue diagnostics |
| `-x`, `--xtrace` | Enable shell tracing |
| `-f`, `--force` | Run `apt-get update` even when `pkgcache.bin` exists |
| `-h`, `--help` | Display help |

CondinAPT runs `apt-get update` when not in check-only mode and either `-f` was used or `/var/cache/apt/pkgcache.bin` does not exist. This includes simulation, so `-s` is not a side-effect-free dry run.

Normal installation requires root. Check-only can run unprivileged; simulation also needs root when it triggers an APT update. The current implementation does not propagate an `apt-get update` failure reliably, so treat an update error as a failed run even if CondinAPT later returns `0`.

## Input files

### Configuration

The `-c` file is sourced with Bash. It is executable code, not an inert data format, so use only a trusted file.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Indexed arrays provide membership filters. A scalar containing commas is still one exact string: `FEATURES="web,database"` does not match `+feat=web`.

The current implementation parses CLI options before sourcing this file.
Configuration variables that reuse CondinAPT's internal names, such as `VERBOSITY_LEVEL`, can therefore override CLI state. Avoid such names in generic configurations.

### Filter mapping

The optional `-m` file maps short prefixes to Bash variable names:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

The format is exactly `prefix=VariableName`; surrounding whitespace is not trimmed. Empty lines and lines whose first field begins with `#` are ignored.
Duplicate prefixes use the last value.

Without a mapping entry, the prefix itself is treated as the variable name. An unset scalar behaves as an empty string. A misspelled negative filter can therefore silently include a package, so prefer a mapping and use verbose simulation when adding filters.

### Package list

The safe line grammar is:

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Examples:

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Everything from the first `#` to the end of a line is removed. Remaining whitespace is normalized. Quoting, escaping, parentheses, nested groups, and whitespace inside one filter token are not supported. Unknown trailing tokens are not rejected, so treat the grammar above as a constraint rather than relying on permissive parsing.

Use one release target per physical line and place it at the end. CondinAPT extracts the target before evaluating package alternatives, so different `@release` values cannot be assigned to alternatives on the same line.

## Filters

A filter compares a configuration value using exact, case-sensitive string equality. If the mapped variable is an indexed array, equality with any array element passes. Associative arrays are not membership sets.

| Form | Effect |
| --- | --- |
| `+x=value` | Include only when `x` matches |
| `-x=value` | Exclude when `x` matches |
| `+{a|b}` | Require at least one member to match |
| `+{a&b}` | Require every member to match |
| `-{a|b}` | Exclude when any member matches |
| `-{a&b}` | Exclude only when every member matches |

Repeated simple positive filters with the same prefix are alternatives:

```text
audacity +pv=toolbox +pv=ultra
```

Positive filters with different prefixes must all pass. Every simple negative filter is an independent veto:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Group members must use only one operator kind. Do not mix `|` and `&` in one group; there is no precedence or nesting inside groups. Express "exclude Flux, or minimum Xfce" as two filters:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternatives and conjunctions

`&&` has higher precedence than `||`. CondinAPT splits alternatives first and then evaluates every member of a conjunction, so:

```text
A || B && C
```

means `A || (B && C)`.

CondinAPT selects the first alternative whose filters and package-availability checks all pass. If one member of a conjunction fails, packages already selected from that conjunction are rolled back and the next alternative is evaluated.

This is preflight selection, not installation retry or a transaction. If the later queue-level `apt-get install` fails for the chosen alternative, CondinAPT does not return to a later `||` branch.

Each alternative must repeat its own filters:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Mandatory packages

`!` is recognized only at the beginning of the complete physical expression and applies to all of its alternatives:

```text
!preferred-package || fallback-package
```

The expression is fatal in normal mode only when no alternative succeeds and an active package or strict version is unavailable. Filters can disable a mandatory line without failure. A normal APT installation failure aborts its queue regardless of `!`.

In simulation, a mandatory availability error is reported but does not stop queue processing; simulation still ends with its documented nonzero status.

## Versions

| Syntax | Behavior |
| --- | --- |
| `package=VERSION` | Prefer the exact version; fall back to an unversioned candidate |
| `package==VERSION` | Accept only the exact repository version |

Exact availability is matched against the complete version field from `apt-cache madison`. If a nonmandatory strict version is unavailable, that condition fails; a later `||` alternative can still pass, otherwise the line is skipped. Prefix the expression with `!` to make an active availability failure fatal.

When CondinAPT installs the exact requested version, it schedules `apt-mark hold` after the entire APT queue succeeds. An already-installed exact version is considered satisfied and is not newly held. Hold failures are not propagated as the CondinAPT exit status.

For an unversioned installed package, CondinAPT compares the installed version with the repository candidate. A differing candidate is queued again; APT is called with `--allow-downgrades`.

## Queues

`---` ends the current normal queue. Every selected package in a queue is passed to one noninteractive `apt-get install` call with `--force-confdef`, `--force-confold`, `--allow-downgrades`, and `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Release-targeted lines are removed from normal queue flow and grouped globally by release. Lines for the same release are merged even when separated by `---`.
The effective execution order is:

1. Non-target priority queue.
2. Priority target-release queues.
3. Normal queues in source order.
4. Remaining target-release queues in first-seen release order.

Consequently, a target line written between two normal lines does not form a barrier, and target queues run after all normal queues unless extracted as priority work.

Repository availability preflight is not target-aware; only the final `apt-get install` receives `-t RELEASE`. Verify targeted packages against the configured repositories.

## Priority list

`-P` reads one Bash extended regular expression per line. A pattern is matched against the first package name in each package-list expression. If it matches, the complete expression, including filters, alternatives, mandatory state, and release target, is moved to a priority queue.

```text
^dkms$
^linux-.*
```

Patterns are unanchored unless they contain anchors. Matching a later `&&` or `||` package does nothing; only the first package token is inspected. Priority extraction also merges matches from separate normal queues, so do not use it for entries whose original `---` boundary is required for dependency staging.

Priority means earlier evaluation and installation, not guaranteed installation. Filters and availability checks still apply.

## Operating modes and exit status

### Simulation

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

Simulation evaluates filters, versions, alternatives, and queues, then prints the packages that would be passed to APT. It does not prove that the later installation would succeed. A valid simulation intentionally exits with status `1`, even when package selection succeeds.

### Check-only

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

Check-only evaluates filters and operators but checks only whether package names are installed through `dpkg-query`. It does not validate requested versions, repository candidates, or release targets. It returns `0` when every active expression is satisfied and `1` otherwise.

The printed `sudo apt install ...` command is a rough diagnostic. It loses versions and target releases, can include multiple failed alternatives, and is not guaranteed to reproduce the original expression.

### Status summary

| Case | Status |
| --- | --- |
| Help | `0` |
| Successful normal run | `0` |
| Invalid input, mandatory availability failure, or APT queue failure | `1` |
| Valid simulation | `1` |
| Check-only with missing active packages | `1` |

## Special package handling

The implementation has one special package name: `qemu-kvm`. It is accepted when `apt-cache show qemu-kvm` reports it as purely virtual. Other virtual packages have no generic provider resolution. Prefer explicit provider alternatives when portability matters.

## MiniOS integration

### Module invocation

For an ordinary module, `build-modules` copies the install script to `/install`, CondinAPT to `/condinapt`, the generated configuration to `/minios_build.conf`, and the map to `/condinapt.map`. A conventional install script is:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Use `SCRIPT_DIR`; `$CWD` is not part of the ordinary module contract.
`00-core` is a special earlier build stage and invokes the source-tree copy under `/linux-live` instead.

The current ordinary module builder automatically copies only a file named `packages.list`. Modules that use additional list filenames must arrange those inputs explicitly; do not assume every file beside `install` appears at the chroot root.

### MiniOS filter map

`linux-live/condinapt.map` currently defines:

| Prefix | Variable | Meaning |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Target suite |
| `da` | `DISTRIBUTION_ARCH` | Target architecture |
| `dp` | `DISTRIBUTION_PROFILE` | `debian` or `ubuntu` package family |
| `is` | `INIT_SYSTEM` | Selected init system |
| `de` | `DESKTOP_ENVIRONMENT` | Module environment |
| `pv` | `PACKAGE_VARIANT` | Package variant |
| `ik` | `INSTALL_KERNEL` | Kernel installation toggle |
| `kf` | `KERNEL_FLAVOUR` | Kernel flavour |
| `kp` | `KERNEL_PROVIDER` | `distribution` or `minios` |
| `ks` | `KERNEL_SERIES` | Actual kernel series during `01-kernel` DKMS selection |
| `kc` | `KERNEL_CAPABILITIES` | Detected capability array during `01-kernel` DKMS selection |
| `kbd` | `KERNEL_BUILD_DKMS` | DKMS build toggle |
| `ib` | `INITRAMFS_BUILDER` | Initramfs implementation |
| `lo` | `LOCALE` | System locale |
| `ml` | `MULTILINGUAL` | Multilingual toggle |
| `kl` | `KEEP_LOCALES` | Locale-retention toggle |

`ks` and `kc` are special `01-kernel` filters. When DKMS building is enabled, that module detects `KERNEL_SERIES` from the installed kernel and creates the indexed `KERNEL_CAPABILITIES` array in a temporary configuration used for its DKMS package selection. They are not present in ordinary module configurations; using them there makes positive filters fail and can make negative filters pass.
`KERNEL_SERIES` is not the `MINIOS_KERNEL_SERIES` preference. Current detected capabilities include `aufs`, `ntfs3`, `btf_modules`, and supported in-tree `rtw88_*` drivers.

Examples from the current kernel package list:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Troubleshooting

Use verbose simulation to inspect selection:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Do not use `/dev/stdin`; `-l` requires a regular file.

- If a filter unexpectedly passes, verify the exact prefix mapping, variable type, case, and value. Check for an unset or misspelled variable.
- If a fallback is not selected, remember that fallback occurs during preflight, not after a queue-level APT failure.
- If a targeted package fails, inspect configured sources and run `apt-cache policy PACKAGE`; preflight does not apply `-t RELEASE`.
- If a strict version is skipped, compare the exact version field with `apt-cache madison PACKAGE`.
- If queue order is surprising, account for global target grouping and priority extraction before normal queues.

For the wider build workflow, see [Building MiniOS](/development/Building-MiniOS).
