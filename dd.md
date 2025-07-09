# Using `dd`

`dd` is a command-line utility available on Linux and macOS for creating bootable USB drives.

## Steps:

1. Open a terminal.
2. Run the following command:

   ```bash
   sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress
   ```

   Replace `/dev/sdX` with the correct USB drive identifier.

3. Wait for the process to complete.

---

**Warning:** Be cautious when using `dd`, as it can overwrite data on the wrong drive.
