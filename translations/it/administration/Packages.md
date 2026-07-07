# Elenco pacchetti MiniOS

Questo documento offre una panoramica completa di tutti i pacchetti inclusi nelle diverse edizioni di MiniOS. MiniOS è disponibile in tre principali edizioni, ognuna con un diverso set di software preinstallato:

- **Standard** - Sistema minimale con funzionalità di base
- **Toolbox** - Strumenti per amministrazione e diagnostica di sistema
- **Ultra** - Ambiente desktop completo con applicazioni

## Utility da console e pacchetti di sistema

### ⚙️ Pacchetti di sistema core

| Pacchetto                        | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                   |
| :------------------------------- | :------: | :-----: | :---: | :------------------------------------------------------------- |
| minios-tools                     |    ✅     |    ✅    |   ✅   | Strumenti e script principali per MiniOS.                      |
| minios-welcome                   |    ✅     |    ✅    |   ✅   | Messaggio di benvenuto nel browser.                            |
| minios-live-config               |    ✅     |    ✅    |   ✅   | Script di configurazione per il sistema Live.                  |
| minios-live-config-systemd       |    ✅     |    ✅    |   ✅   | Configurazione del sistema Live per systemd.                   |
| minios-live-config-doc           |    ✅     |    ✅    |   ✅   | Documentazione per minios-live-config.                         |
| user-setup                       |    ✅     |    ✅    |   ✅   | Utility per la configurazione degli utenti.                    |
| linux-base                       |    ✅     |    ✅    |   ✅   | Script di base per il sistema Linux.                           |
| kbd                              |    ✅     |    ✅    |   ✅   | Utility per la gestione del layout tastiera in console.        |
| keyboard-configuration           |    ✅     |    ✅    |   ✅   | Sistema di configurazione della tastiera.                      |
| locales                          |    ✅     |    ✅    |   ✅   | Librerie e dati per la localizzazione (supporto lingue).       |
| console-setup                    |    ✅     |    ✅    |   ✅   | Configurazione font e codifica della console.                  |
| systemd-timesyncd                |    ✅     |    ✅    |   ✅   | Servizio per la sincronizzazione dell'orario in rete.          |
| polkitd / policykit-1 / pkexec   |    ✅     |    ✅    |   ✅   | Framework per la gestione dei privilegi dei servizi di sistema.|

### 📦 Gestione pacchetti e software

| Pacchetto            | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                         |
| :------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| apt-transport-https  |    ✅     |    ✅    |   ✅   | Permette l'uso di repository tramite protocollo HTTPS.                |
| gettext-base         |    ✅     |    ✅    |   ✅   | Utility per internazionalizzazione e localizzazione del software.     |
| man-db               |    ✅     |    ✅    |   ✅   | Sistema per la visualizzazione delle pagine di manuale (man).         |
| bash-completion      |    ✅     |    ✅    |   ✅   | Fornisce il completamento automatico dei comandi nella shell Bash.    |

### 🌐 Utility di rete

| Pacchetto                   | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                       |
| :-------------------------- | :------: | :-----: | :---: | :--------------------------------------------------------------- |
| network-manager / connman   |    ✅     |    ✅    |   ✅   | Gestori di connessioni di rete.                                   |
| dnsmasq-base                |    ✅     |    ✅    |   ✅   | Server DNS e DHCP leggero (file base).                            |
| wpasupplicant               |    ✅     |    ✅    |   ✅   | Utility per la connessione a reti Wi-Fi sicure (WPA/WPA2).        |
| iputils-ping                |    ✅     |    ✅    |   ✅   | Utility `ping` per verificare la raggiungibilità degli host.      |
| ssh                         |    ✅     |    ✅    |   ✅   | Client e server per connessioni remote sicure (SSH).              |
| wget                        |    ✅     |    ✅    |   ✅   | Utility per scaricare file dalla rete.                            |
| curl                        |    ✅     |    ✅    |   ✅   | Utility per il trasferimento dati tramite vari protocolli.        |
| ipset                       |    ✅     |    ✅    |   ✅   | Utility per la gestione di set di indirizzi IP nel kernel.        |
| whois                       |    ✅     |    ✅    |   ✅   | Client per ottenere informazioni su domini e indirizzi IP.        |
| nmap                        |    ❌     |    ✅    |   ✅   | Potente scanner di rete e strumento di auditing della sicurezza.  |
| ncat                        |    ❌     |    ✅    |   ✅   | Versione avanzata di `netcat` dalla suite nmap.                  |
| ndiff                       |    ❌     |    ✅    |   ✅   | Utility per confrontare i risultati delle scansioni nmap.         |
| iperf3                      |    ❌     |    ✅    |   ✅   | Strumento per misurare la banda di rete.                         |
| netcat                      |    ❌     |    ✅    |   ✅   | Utility di rete per leggere/scrivere dati su TCP/IP.             |
| netcat-openbsd              |    ❌     |    ✅    |   ✅   | Implementazione alternativa di `netcat` da OpenBSD.              |
| open-iscsi                  |    ❌     |    ❌    |   ✅   | Client (initiator) per lavorare con storage iSCSI.               |
| tgt                         |    ❌     |    ❌    |   ✅   | Server (target) per fornire storage iSCSI.                       |

### 💾 Gestione disco e filesystem

| Pacchetto        | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                         |
| :--------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| parted           |    ✅     |    ✅    |   ✅   | Programma per creare e modificare partizioni disco.                  |
| dosfstools       |    ✅     |    ✅    |   ✅   | Utility per creare e controllare filesystem FAT.                     |
| ntfs-3g          |    ✅     |    ✅    |   ✅   | Driver per leggere e scrivere partizioni NTFS.                       |
| mdadm            |    ✅     |    ✅    |   ✅   | Utility per gestire array RAID software.                             |
| hdparm           |    ✅     |    ✅    |   ✅   | Utility per configurare e visualizzare parametri dei dischi.         |
| sdparm           |    ✅     |    ✅    |   ✅   | Utility per accedere ai parametri di dispositivi SCSI/SATA/SAS.      |
| btrfs-progs      |    ✅     |    ✅    |   ✅   | Utility per lavorare con filesystem Btrfs.                           |
| xfsprogs         |    ✅     |    ✅    |   ✅   | Utility per lavorare con filesystem XFS.                             |
| exfat-utils      |    ✅     |    ✅    |   ✅   | Utility per filesystem exFAT (implementazione legacy).               |
| exfat-fuse       |    ✅     |    ✅    |   ✅   | Modulo FUSE per il supporto exFAT.                                   |
| exfatprogs       |    ✅     |    ✅    |   ✅   | Utility per creare e controllare filesystem exFAT.                   |
| cifs-utils       |    ✅     |    ✅    |   ✅   | Utility per montare condivisioni di rete Windows (Samba/CIFS).       |
| nfs-common       |    ✅     |    ✅    |   ✅   | File comuni per il supporto filesystem NFS (client).                 |
| smartmontools    |    ✅     |    ✅    |   ✅   | Utility per monitorare lo stato dei dischi tramite S.M.A.R.T.        |
| gpart            |    ❌     |    ✅    |   ✅   | Utility per "indovinare" la tabella delle partizioni su dischi danneggiati. |
| mtools           |    ❌     |    ✅    |   ✅   | Set di utility per accedere a floppy e partizioni MS-DOS.            |
| gddrescue        |    ❌     |    ✅    |   ✅   | Strumento per copiare dati da supporti danneggiati.                  |
| zfsutils-linux   |    ❌     |    ✅    |   ✅   | Utility per gestire pool e filesystem ZFS.                           |
| davfs2           |    ❌     |    ✅    |   ✅   | Permette di montare risorse WebDAV come filesystem locale.           |
| f2fs-tools       |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem F2FS.                            |
| hfsutils         |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem Apple "classico" (HFS).          |
| hfsprogs         |    ❌     |    ✅    |   ✅   | Utility per creare e controllare filesystem HFS+.                    |
| jfsutils         |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem JFS.                             |
| reiserfsprogs    |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem ReiserFS (v3).                   |
| reiser4progs     |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem Reiser4.                         |
| udftools         |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem UDF (DVD/Blu-ray).               |
| nilfs-tools      |    ❌     |    ✅    |   ✅   | Utility per lavorare con filesystem NILFS2 log-structured.           |
| sshfs            |    ❌     |    ✅    |   ✅   | Monta filesystem remoto tramite SSH.                                 |
| lvm2             |    ❌     |    ✅    |   ✅   | Gestore di volumi logici (LVM).                                      |
| cryptsetup       |    ❌     |    ✅    |   ✅   | Utility per configurare partizioni cifrate (LUKS).                   |
| zulucrypt-cli    |    ❌     |    ✅    |   ✅   | CLI per la gestione di volumi cifrati (LUKS, VeraCrypt, ecc.).       |
| zulumount-cli    |    ❌     |    ✅    |   ✅   | CLI per montare volumi gestiti da zulucrypt.                         |

### 💻 Utility di sistema e monitoraggio

| Pacchetto        | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                              |
| :--------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------- |
| pciutils         |    ✅     |    ✅    |   ✅   | Utility per visualizzare informazioni sui dispositivi PCI.                |
| usbutils         |    ✅     |    ✅    |   ✅   | Utility per visualizzare informazioni sui dispositivi USB.                |
| psmisc           |    ✅     |    ✅    |   ✅   | Set di utility per la gestione dei processi (`fuser`, `killall`).         |
| lsof             |    ✅     |    ✅    |   ✅   | Mostra quali file sono utilizzati da quali processi.                      |
| htop             |    ✅     |    ✅    |   ✅   | Monitor interattivo dei processi.                                         |
| rfkill           |    ✅     |    ✅    |   ✅   | Strumento per abilitare/disabilitare dispositivi wireless.                |
| file             |    ✅     |    ✅    |   ✅   | Determina il tipo di file.                                                |
| usb-modeswitch   |    ✅     |    ✅    |   ✅   | Cambia la modalità dei dispositivi USB (es. modem).                       |
| ncdu             |    ✅     |    ✅    |   ✅   | Analizzatore uso disco con interfaccia ncurses.                           |
| lshw             |    ❌     |    ✅    |   ✅   | Mostra informazioni hardware dettagliate.                                 |
| screen           |    ❌     |    ✅    |   ✅   | Multiplexer di terminale, consente la gestione di sessioni.               |
| nmon             |    ❌     |    ✅    |   ✅   | Utility per il monitoraggio delle prestazioni di sistema.                 |
| inxi             |    ❌     |    ✅    |   ✅   | Script per raccogliere e mostrare informazioni dettagliate sul sistema.   |

### 🗜️ Archiviazione e compressione

| Pacchetto      | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                         |
| :------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| zip            |    ✅     |    ✅    |   ✅   | Archiviatore per creare ed estrarre file .zip.                       |
| unzip          |    ✅     |    ✅    |   ✅   | Utility per estrarre archivi .zip.                                   |
| xz-utils       |    ✅     |    ✅    |   ✅   | Utility per la compressione dati con algoritmo LZMA/XZ.              |
| zstd           |    ✅     |    ✅    |   ✅   | Utility per la compressione dati con Zstandard.                      |
| lz4            |    ✅     |    ✅    |   ✅   | Utility per la compressione dati molto veloce.                       |
| liblz4-tools   |    ✅     |    ✅    |   ✅   | Strumenti aggiuntivi per il formato lz4.                             |
| bzip2          |    ✅     |    ✅    |   ✅   | Utility per la compressione dati con algoritmo bzip2.                |
| 7zip           |    ✅     |    ✅    |   ✅   | Potente archiviatore con supporto a molti formati, incluso 7z.       |
| pv             |    ❌     |    ✅    |   ✅   | Utility per monitorare l'avanzamento del trasferimento dati tramite pipe. |
| pigz           |    ❌     |    ✅    |   ✅   | Implementazione parallela (multi-thread) di gzip.                    |
| pixz           |    ❌     |    ✅    |   ✅   | Implementazione parallela e indicizzabile di xz.                     |
| plzip          |    ❌     |    ✅    |   ✅   | Implementazione parallela di lzip.                                   |
| lrzip          |    ❌     |    ✅    |   ✅   | Archiviatore a lungo raggio, efficiente per file di grandi dimensioni.|
| lzop           |    ❌     |    ✅    |   ✅   | Utility di compressione molto veloce.                                |
| pbzip2         |    ❌     |    ✅    |   ✅   | Implementazione parallela di bzip2.                                  |
| cabextract     |    ❌     |    ✅    |   ✅   | Utility per estrarre archivi Microsoft .cab.                         |

### 🕵️ Recupero e forensics

| Pacchetto    | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                              |
| :----------- | :------: | :-----: | :---: | :------------------------------------------------------- |
| clonezilla   |    ❌     |    ✅    |   ✅   | Strumento per clonazione e backup del disco.              |
| testdisk     |    ❌     |    ✅    |   ✅   | Utility per recuperare partizioni e file eliminati.       |
| chntpw       |    ❌     |    ✅    |   ✅   | Utility per reimpostare password di Windows.              |
| reglookup    |    ❌     |    ✅    |   ✅   | Utility per leggere e analizzare il registro di Windows.  |
| hexedit      |    ❌     |    ✅    |   ✅   | Semplice editor esadecimale per console.                  |

### ☁️ Virtualizzazione e container

| Pacchetto                | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                         |
| :----------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------ |
| open-vm-tools            |    ❌     |    ✅    |   ✅   | Set di utility per una migliore integrazione con VMware.             |
| hyperv-daemons           |    ❌     |    ✅    |   ✅   | Servizi per l'integrazione con l'hypervisor Microsoft Hyper-V.       |
| qemu-system-x86          |    ❌     |    ✅    |   ✅   | Emulatore per eseguire sistemi operativi x86/x86_64.                |
| qemu-utils               |    ❌     |    ✅    |   ✅   | Utility per lavorare con immagini disco QEMU.                       |
| libvirt-daemon-system    |    ❌     |    ✅    |   ✅   | Demone per la gestione delle macchine virtuali.                     |
| virt-what                |    ❌     |    ✅    |   ✅   | Script per rilevare se il sistema è in esecuzione in una VM.         |
| uidmap                   |    ❌     |    ❌    |   ✅   | Utility per la gestione degli user namespace.                        |
| docker.io                |    ❌     |    ❌    |   ✅   | Piattaforma per la containerizzazione delle applicazioni.            |
| docker-compose           |    ❌     |    ❌    |   ✅   | Strumento per la gestione di applicazioni Docker multi-container.    |
| lazydocker               |    ❌     |    ❌    |   ✅   | Interfaccia terminale per la gestione di Docker e Docker Compose.    |
| selinux-policy-default   |    ❌     |    ❌    |   ✅   | Policy di sicurezza SELinux predefinita.                            |

### 🧩 Varie

| Pacchetto        | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                                                |
| :--------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------------------------- |
| mc               |    ✅     |    ✅    |   ✅   | File manager Midnight Commander.                                                           |
| gpg              |    ✅     |    ✅    |   ✅   | GNU Privacy Guard - utility per cifratura e firma.                                         |
| gnupg            |    ✅     |    ✅    |   ✅   | Suite completa GNU Privacy Guard.                                                          |
| squashfs-tools   |    ✅     |    ✅    |   ✅   | Utility per creare ed estrarre immagini SquashFS.                                          |
| xorriso          |    ✅     |    ✅    |   ✅   | Utility per creare e masterizzare immagini ISO-9660.                                       |
| genisoimage      |    ✅     |    ✅    |   ✅   | Crea immagini filesystem ISO-9660.                                                         |
| eject            |    ✅     |    ✅    |   ✅   | Utility per l'espulsione di supporti rimovibili (CD/DVD/USB).                             |
| fuse3 / fuse     |    ✅     |    ✅    |   ✅   | Framework per la creazione di filesystem in userspace.                                     |
| libfuse2         |    ✅     |    ✅    |   ✅   | Libreria di compatibilità per applicazioni FUSE legacy.                                    |
| memtest86+       |    ❌     |    ✅    |   ✅   | Programma per il test della RAM.                                                           |
| xmount           |    ❌     |    ✅    |   ✅   | Strumento per montare immagini disco di vari formati.                                      |
| aria2            |    ❌     |    ✅    |   ✅   | Download manager multiprotocollo.                                                          |
| fio              |    ❌     |    ✅    |   ✅   | Strumento avanzato per test delle prestazioni disco (Flexible I/O Tester).                 |
| bonnie++         |    ❌     |    ✅    |   ✅   | Benchmark per testare le prestazioni del filesystem.                                       |
| iozone3          |    ❌     |    ✅    |   ✅   | Benchmark per testare le prestazioni I/O del disco.                                       |
| stress           |    ❌     |    ✅    |   ✅   | Strumento per generare carico sul sistema (CPU, memoria, I/O).                            |
| sysbench         |    ❌     |    ✅    |   ✅   | Benchmark completo per testare CPU, memoria, I/O, database.                               |

## Firmware e driver

### 📦 Driver (DKMS)

| Pacchetto                  | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                                                            |
| :------------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------------------------------ |
| broadcom-sta-dkms          |    ✅     |    ✅    |   ✅   | Driver proprietario Broadcom 802.11 STA per schede Wi-Fi. Necessario per molti portatili con chip Broadcom. |
| zfs-dkms                   |    ❌     |    ✅    |   ✅   | Moduli kernel per il supporto filesystem ZFS.                                                           |
| realtek-rtl8821au-dkms     |    ✅     |    ✅    |   ✅   | Driver DKMS per chip Wi-Fi Realtek RTL8812AU/8821AU.                                                    |
| realtek-rtl88xxau-dkms     |    ✅     |    ✅    |   ✅   | Driver DKMS per diverse serie di chip Wi-Fi Realtek RTL88xxAU.                                          |
| realtek-rtl8188eus-dkms    |    ✅     |    ✅    |   ✅   | Driver DKMS per chip Wi-Fi Realtek RTL8188EUS.                                                          |
| realtek-rtl8814au-dkms     |    ✅     |    ✅    |   ✅   | Driver DKMS per chip Wi-Fi Realtek RTL8814AU.                                                           |

### 🔌 Firmware

| Pacchetto                  | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                             |
| :------------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------- |
| firmware-linux-free        |    ✅     |    ✅    |   ✅   | Raccolta di firmware liberi (licenza) per vari hardware.                 |
| firmware-linux-nonfree     |    ✅     |    ✅    |   ✅   | Metapacchetto che include tutti i firmware non liberi (proprietari).     |
| firmware-atheros           |    ✅     |    ✅    |   ✅   | Firmware per schede di rete wireless con chip Atheros.                   |
| firmware-iwlwifi           |    ✅     |    ✅    |   ✅   | Firmware per schede di rete Intel Wireless (Wi-Fi).                      |
| firmware-zd1211            |    ✅     |    ✅    |   ✅   | Firmware per dispositivi Wi-Fi basati su ZyDAS ZD1211/ZD1211B.           |
| firmware-realtek           |    ✅     |    ✅    |   ✅   | Firmware per vari dispositivi Realtek (schede di rete, Bluetooth, ecc.). |
| firmware-bnx2              |    ✅     |    ✅    |   ✅   | Firmware per adattatori di rete Broadcom NetXtreme II.                   |
| firmware-brcm80211         |    ✅     |    ✅    |   ✅   | Firmware per schede wireless Broadcom/Cypress 802.11.                    |
| firmware-cavium            |    ✅     |    ✅    |   ✅   | Firmware per processori e adattatori di rete Cavium.                     |
| firmware-ipw2x00           |    ✅     |    ✅    |   ✅   | Firmware per vecchie schede Intel Pro/Wireless 2100/2200/2915.           |
| firmware-libertas          |    ✅     |    ✅    |   ✅   | Firmware per schede wireless Marvell Libertas 8xxx.                      |
| firmware-ti-connectivity   |    ✅     |    ✅    |   ✅   | Firmware per chip combo Texas Instruments (Wi-Fi, Bluetooth).            |
| firmware-b43-installer     |    ✅     |    ✅    |   ✅   | Installer per firmware legacy Broadcom B43.                              |
| firmware-sof-signed        |    ✅     |    ✅    |   ✅   | Firmware firmato per piattaforma Sound Open Firmware (audio DSP).        |

## Interfaccia grafica di base

### 🖥️ Sistema grafico (Xorg)

| Pacchetto                  | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                         |
| :------------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------- |
| xserver-xorg               |    ✅     |    ✅    |   ✅   | Server principale del sistema grafico X.Org.                         |
| xserver-xorg-video-all     |    ✅     |    ✅    |   ✅   | Metapacchetto che installa tutti i driver video 2D per X.Org.        |
| xserver-xorg-video-intel   |    ✅     |    ✅    |   ✅   | Driver video per grafica integrata Intel.                            |
| xserver-xorg-input-all     |    ✅     |    ✅    |   ✅   | Metapacchetto che installa tutti i driver per dispositivi di input (mouse, tastiera). |
| xinit                      |    ✅     |    ✅    |   ✅   | Utility per avviare il server X.                                     |
| xterm                      |    ✅     |    ✅    |   ✅   | Emulatore di terminale standard per X.                              |
| blackbox or openbox        |    ✅     |    ✅    |   ✅   | Window manager leggeri.                                             |
| libxcursor1                |    ✅     |    ✅    |   ✅   | Libreria per la gestione dei cursori X11.                           |
| breeze-cursor-theme        |    ✅     |    ✅    |   ✅   | Tema cursori Breeze da KDE.                                         |
| x11-utils                  |    ✅     |    ✅    |   ✅   | Set di utility di base per X11.                                     |
| wmctrl                     |    ✅     |    ✅    |   ✅   | Utility per controllare le finestre da riga di comando.             |
| xdotool                    |    ✅     |    ✅    |   ✅   | Utility per simulare input da tastiera e mouse.                     |
| libdrm-intel1              |    ✅     |    ✅    |   ✅   | Libreria userspace per Intel DRM (Direct Rendering Manager).         |
| libgl1-mesa-dri            |    ✅     |    ✅    |   ✅   | Implementazione OpenGL libera per il rendering diretto.             |
| libglu1-mesa               |    ✅     |    ✅    |   ✅   | Libreria utility Mesa OpenGL (GLU).                                 |

### 🔌 Accesso remoto (XRDP)

| Pacchetto           | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                   |
| :------------------ | :------: | :-----: | :---: | :------------------------------------------------------------ |
| xrdp and xorgxrdp   |    ❌     |    ✅    |   ✅   | Server per la connessione al desktop grafico tramite protocollo RDP. |

### 🎨 Componenti interfaccia

| Pacchetto                      | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto               |
| :----------------------------- | :------: | :-----: | :---: | :---------------------------------------- |
| librsvg2-common                |    ✅     |    ✅    |   ✅   | Libreria per il rendering di immagini SVG. |
| adwaita-icon-theme-antix       |    ✅     |    ✅    |   ✅   | Tema icone Adwaita.                       |
| elementary-minios-icon-theme   |    ✅     |    ✅    |   ✅   | Tema icone elementary speciale per MiniOS. |

## XFCE

### 🖼️ Ambiente desktop (XFCE)

| Pacchetto               | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                                                |
| :---------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------------------------- |
| dbus-x11                |    ✅     |    ✅    |   ✅   | Avvia il bus dei messaggi D-Bus nella sessione X11, necessario per la comunicazione tra applicazioni. |
| libxfce4ui-utils        |    ✅     |    ✅    |   ✅   | Librerie con widget e utility comuni per l'interfaccia XFCE.                                |
| thunar                  |    ✅     |    ✅    |   ✅   | File manager predefinito in XFCE.                                                           |
| thunar-volman           |    ✅     |    ✅    |   ✅   | Gestisce il montaggio automatico dei supporti rimovibili in Thunar.                         |
| xfce4-appfinder         |    ✅     |    ✅    |   ✅   | Utility per trovare e avviare rapidamente le applicazioni.                                  |
| xfce4-panel             |    ✅     |    ✅    |   ✅   | Pannello desktop XFCE.                                                                     |
| xfce4-session           |    ✅     |    ✅    |   ✅   | Gestore sessione XFCE, controlla avvio e chiusura sessione.                                |
| xfce4-settings          |    ✅     |    ✅    |   ✅   | Centro di controllo delle impostazioni XFCE.                                               |
| xfconf                  |    ✅     |    ✅    |   ✅   | Sistema di configurazione per XFCE.                                                        |
| xfdesktop4              |    ✅     |    ✅    |   ✅   | Gestisce il desktop: sfondi, icone, menu.                                                  |
| xfwm4                   |    ✅     |    ✅    |   ✅   | Window manager XFCE.                                                                       |
| greybird-gtk-theme      |    ✅     |    ✅    |   ✅   | Tema GTK popolare e pulito, spesso usato in XFCE.                                          |
| xfce4-xkb-plugin        |    ✅     |    ✅    |   ✅   | Plugin pannello per cambiare layout tastiera.                                               |
| xfce4-notifyd           |    ❌     |    ✅    |   ✅   | Demone per la visualizzazione delle notifiche desktop.                                     |
| menulibre               |    ❌     |    ✅    |   ✅   | Editor avanzato del menu per ambienti GTK.                                                 |
| network-manager-gnome   |    ✅     |    ✅    |   ✅   | Applet grafico per la gestione delle connessioni di rete (NetworkManager).                 |

### 🛠️ Utility di sistema e GUI

| Pacchetto                   | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                                                      |
| :-------------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------------------------------- |
| gvfs-backends               |    ✅     |    ✅    |   ✅   | Set di backend per GVfs, fornisce accesso a FTP, SFTP, SMB, ecc. tramite file manager.           |
| open-vm-tools-desktop       |    ❌     |    ✅    |   ✅   | Componenti per una migliore integrazione guest OS con VMware (clipboard, cambio risoluzione).     |
| gtk-update-icon-cache       |    ❌     |    ✅    |   ✅   | Utility per aggiornare la cache dei temi icone GTK.                                               |
| libglib2.0-bin              |    ✅     |    ✅    |   ✅   | Utility binarie per la libreria GLib 2.0.                                                         |
| at-spi2-core                |    ✅     |    ✅    |   ✅   | Protocollo e librerie per il supporto accessibilità (screen reader, ecc.).                        |
| qt5/qt6-gtk-platformtheme   |    ❌     |    ✅    |   ✅   | Plugin per applicazioni Qt5/Qt6 per usare il tema GTK e avere un aspetto coerente.                |
| policykit-1-gnome           |    ✅     |    ✅    |   ✅   | Agente di autenticazione PolicyKit per ambienti GTK, richiede la password per azioni privilegiate.|
| libxml2-utils               |    ✅     |    ✅    |   ✅   | Utility da riga di comando per lavorare con file XML (es. `xmllint`).                             |
| xmlstarlet                  |    ✅     |    ✅    |   ✅   | Potente tool da riga di comando per parsing, trasformazione e modifica di XML.                    |

### 🧰 Applicazioni

| Pacchetto                        | Standard | Toolbox | Ultra | ℹ️ Informazioni sul pacchetto                                                                                              |
| :------------------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------------------------------------------------ |
| minios-installer                 |    ✅     |    ✅    |   ✅   | Installatore grafico del sistema MiniOS.                                                                                  |
| minios-configurator              |    ✅     |    ✅    |   ✅   | Configuratore di sistema MiniOS.                                                                                          |
| mintstick                        |    ✅     |    ✅    |   ✅   | Utility per formattare chiavette USB e scrivere immagini ISO.                                                            |
| mousepad                         |    ✅     |    ✅    |   ✅   | Editor di testo semplice e veloce per XFCE.                                                                              |
| ristretto                        |    ✅     |    ✅    |   ✅   | Visualizzatore immagini semplice e veloce per XFCE.                                                                      |
| **Web browsers**                 |
| firefox-esr                      |    ✅     |    ✅    |   ✅   | Browser web Firefox con Extended Support Release (ESR). Versione stabile con aggiornamenti di sicurezza a lungo termine. |
| **Multimedia**                   |
| vlc                              |    ❌     |    ✅    |   ✅   | Lettore multimediale potente e popolare, supporta molti formati.                                                        |
| vlc-plugin-bittorrent            |    ❌     |    ✅    |   ✅   | Plugin VLC per riprodurre video direttamente da file torrent.                                                            |
| vlc-plugin-samba                 |    ❌     |    ✅    |   ✅   | Plugin VLC per accedere a file su condivisioni di rete Samba (Windows).                                                  |
| vlc-l10n                         |    ❌     |    ✅    |   ✅   | Pacchetti di localizzazione per l'interfaccia di VLC.                                                                    |
| gimp                             |    ❌     |    ❌    |   ✅   | Potente editor di grafica raster, alternativa ad Adobe Photoshop.                                                        |
| obs-studio                       |    ❌     |    ❌    |   ✅   | Programma per registrare e trasmettere video da schermo e altre sorgenti.                                                |
| obs-plugins                      |    ❌     |    ❌    |   ✅   | Plugin ed effetti aggiuntivi per OBS Studio.                                                                             |
| inkscape                         |    ❌     |    ❌    |   ✅   | Editor professionale di grafica vettoriale, alternativa ad Adobe Illustrator.                                            |
| blender                          |    ❌     |    ❌    |   ✅   | Suite professionale per grafica 3D, animazione e creazione video.                                                        |
| audacity                         |    ❌     |    ❌    |   ✅   | Editor audio popolare per registrazione e elaborazione del suono.                                                        |
| rawtherapee                      |    ❌     |    ❌    |   ✅   | Editor avanzato per lo sviluppo di fotografie RAW.                                                                       |
| **Office and Documents**         |
| pdfarranger                      |    ❌     |    ✅    |   ✅   | Utility semplice per unire, dividere e riordinare pagine PDF.                                                            |
| libreoffice                      |    ❌     |    ❌    |   ✅   | Suite office completa (videoscrittura, fogli di calcolo, presentazioni).                                                 |
| libreoffice-gtk3                 |    ❌     |    ❌    |   ✅   | Integrazione di LibreOffice con il tema GTK3 per un aspetto coerente.                                                    |
| libreoffice-style-elementary     |    ❌     |    ❌    |   ✅   | Tema icone elementary per LibreOffice.                                                                                   |
| fonts-open-sans                  |    ❌     |    ❌    |   ✅   | Font Open Sans, popolare e leggibile.                                                                                    |
| **System utilities (GUI)**       |
| gparted                          |    ❌     |    ✅    |   ✅   | Editor grafico delle partizioni disco.                                                                                   |
| gsmartcontrol                    |    ❌     |    ✅    |   ✅   | Interfaccia grafica per la utility smartmontools (monitoraggio dischi).                                                  |
| baobab                           |    ❌     |    ✅    |   ✅   | Analizzatore grafico dell'uso disco.                                                                                     |
| hardinfo                         |    ❌     |    ✅    |   ✅   | Utility per raccogliere e mostrare informazioni dettagliate su sistema e hardware.                                       |
| virt-manager                     |    ❌     |    ✅    |   ✅   | Interfaccia grafica per la gestione di macchine virtuali tramite libvirt.                                                |
| gir1.2-spiceclientgtk-3.0        |    ❌     |    ✅    |   ✅   | Libreria per l'integrazione con protocollo SPICE (accesso VM remoto).                                                    |
| doublecmd-gtk                    |    ❌     |    ✅    |   ✅   | File manager a due pannelli simile a Total Commander.                                                                    |
| onboard                          |    ❌     |    ✅    |   ✅   | Tastiera su schermo per persone con disabilità.                                                                          |
| grsync                           |    ❌     |    ✅    |   ✅   | Interfaccia grafica per la potente utility di sincronizzazione `rsync`.                                                  |
| rescuezilla                      |    ❌     |    ✅    |   ✅   | Strumento semplice per backup e recupero disco, alternativa a Clonezilla.                                                |
| kdiskmark                        |    ❌     |    ✅    |   ✅   | Strumento per il test delle prestazioni disco, alternativa a CrystalDiskMark.                                            |
| qdiskinfo                        |    ❌     |    ✅    |   ✅   | Strumento per visualizzare informazioni sui dischi, alternativa a CrystalDiskInfo.                                       |
| bleachbit                        |    ❌     |    ✅    |   ✅   | Utility per la pulizia del sistema da file temporanei e inutili.                                                         |
| gtkhash                          |    ❌     |    ✅    |   ✅   | Utility semplice per calcolare hash dei file.                                                                            |
| czkawka / czkawka-gui            |    ❌     |    ✅    |   ✅   | Utility per trovare e rimuovere file duplicati, cartelle vuote, ecc.                                                     |
| zulucrypt-gui                    |    ❌     |    ✅    |   ✅   | Interfaccia grafica per la gestione di volumi cifrati.                                                                   |
| zulumount-gui                    |    ❌     |    ✅    |   ✅   | Interfaccia grafica per montare volumi cifrati.                                                                          |
| keepassxc                        |    ❌     |    ✅    |   ✅   | Gestore password multipiattaforma.                                                                                       |
| guymager                         |    ❌     |    ✅    |   ✅   | Strumento per la copia forense dei dischi (creazione immagini).                                                          |
| isomaster                        |    ❌     |    ✅    |   ✅   | Editor grafico di immagini disco ISO.                                                                                    |
| qphotorec                        |    ❌     |    ✅    |   ✅   | Shell grafica per la utility PhotoRec (recupero file).                                                                   |
| veracrypt                        |    ❌     |    ✅    |   ✅   | Programma per creare e gestire contenitori e dischi cifrati.                                                            |
| wxhexeditor                      |    ❌     |    ✅    |   ✅   | Editor esadecimale avanzato per file di grandi dimensioni.                                                               |
| synaptic                         |    ❌     |    ❌    |   ✅   | Gestore pacchetti grafico classico per Debian/Ubuntu.                                                                   |
| eddy / eddy-handler              |    ❌     |    ❌    |   ✅   | Semplice installatore grafico per pacchetti .deb locali.                                                                 |
| **Network applications (GUI)**   |
| wireshark                        |    ❌     |    ✅    |   ✅   | Potente analizzatore del traffico di rete.                                                                              |
| remmina                          |    ❌     |    ✅    |   ✅   | Client desktop remoto con supporto RDP, VNC, SSH e altri protocolli.                                                    |
| remmina-plugin-rdp               |    ❌     |    ✅    |   ✅   | Plugin per il supporto protocollo RDP in Remmina.                                                                       |
| remmina-plugin-vnc               |    ❌     |    ✅    |   ✅   | Plugin per il supporto protocollo VNC in Remmina.                                                                       |
| gnome-nettool                    |    ❌     |    ✅    |   ✅   | Set di utility di rete grafiche (ping, traceroute, scansione porte).                                                    |
| zenmap                           |    ❌     |    ✅    |   ✅   | Interfaccia grafica ufficiale per lo scanner di rete nmap.                                                              |
| x11vnc                           |    ❌     |    ✅    |   ✅   | Server VNC che permette il controllo remoto della sessione X attuale.                                                   |
| uget                             |    ❌     |    ✅    |   ✅   | Download manager grafico.                                                                                               |
| android-file-transfer            |    ❌     |    ✅    |   ✅   | Utility per trasferire file da dispositivi Android tramite protocollo MTP.                                              |
| **Development**                  |
| codium                           |    ❌     |    ✅    |   ✅   | Build libera dell'editor VS Code senza telemetria Microsoft.                                                            |
