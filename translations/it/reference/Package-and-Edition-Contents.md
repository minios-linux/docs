---
updated: 2026-08-31
---

# Contenuti dei pacchetti e delle edizioni

I contenuti dei pacchetti MiniOS vengono generati da elenchi sorgente condizionali. L'insieme finale dipende dalla suite di distribuzione, architettura, sistema di init, ambiente desktop, lingua, opzioni del kernel e disponibilità dei repository. Questa pagina documenta i pacchetti visibili all'utente richiesti dai manifesti mantenuti di Flux e Xfce. Sono esclusi le toolchain solo per la compilazione e le dipendenze installate automaticamente da APT.

`Yes` indica che il manifesto corrente richiede il pacchetto per quella edizione.
`Conditional` indica che il nome del pacchetto o la sua inclusione dipendono da un'opzione di build o dalla piattaforma di destinazione. Un trattino indica che l'edizione non lo richiede.
L'immagine completata rimane l'autorità definitiva.

## Struttura delle edizioni

Le edizioni Xfce mantenute si basano l'una sull'altra: Standard è il desktop compatto per l'uso quotidiano, Toolbox è pensata per l'amministrazione di sistema professionale, diagnostica e recupero, mentre Ultra trasforma quella base in un desktop completo per lavoro generale, creatività e sviluppo. Flux è una configurazione Fluxbox ultra-leggera separata, pensata per il minimo utilizzo di risorse e hardware datato; non si tratta semplicemente di una lista di pacchetti Xfce ridotta.

| Edizione | Variante di pacchetto e ambiente | Scopo principale |
|---|---|---|
| **Standard** | `standard` con `xfce` | Desktop Xfce minimale per l'uso quotidiano con funzionalità di base |
| **Toolbox** | `toolbox` con `xfce` | Amministrazione di sistema professionale, diagnostica e recupero |
| **Ultra** | `ultra` con `xfce` | Desktop completo per lavoro generale, creatività e sviluppo |
| **Flux** | `minimum` con `flux` | Desktop Fluxbox ultra-leggero per minimo utilizzo di risorse e hardware datato |

Altri ambienti supportati hanno le proprie catene di moduli e devono essere verificati separatamente. In particolare, la disponibilità dei pacchetti in una build LXQt o console non deve essere dedotta dalle tabelle Xfce sottostanti.

## Pacchetti core MiniOS e di sistema

Questi pacchetti forniscono il runtime del sistema live, la configurazione, la localizzazione, la gestione dei privilegi e l'ambiente di base a riga di comando.

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Sì | Sì | Sì | Sì | Creazione, conversione, ispezione, attivazione e cattura delle modifiche dei moduli |
| `minios-image-compose` | Sì | Sì | Sì | Sì | Composizione ISO MiniOS da riga di comando |
| `minios-live-config` | Sì | Sì | Sì | Sì | Componenti di configurazione della sessione live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Condizionale | Condizionale | Condizionale | Condizionale | Integrazione con il sistema di init; viene selezionata una sola implementazione |
| `minios-live-config-doc` | Sì | Sì | Sì | Sì | Riferimento live-config installato |
| `minios-welcome` | Sì | Sì | Sì | Sì | Pagina di benvenuto e launcher MiniOS |
| `user-setup` | Sì | Sì | Sì | Sì | Configurazione dell'account utente live |
| `linux-base` | Sì | Sì | Sì | Sì | Script comuni di sistema e immagini Linux |
| `kbd`, `keyboard-configuration`, `console-setup` | Sì | Sì | Sì | Sì | Configurazione tastiera e display da console |
| `locales` | Sì | Sì | Sì | Sì | Dati e generazione delle lingue |
| `network-manager` | Sì | Sì | Sì | Sì | Gestione delle connessioni di rete |
| `netplan.io` | Condizionale | Condizionale | Condizionale | Condizionale | Richiesto solo sulle suite Ubuntu supportate |
| `dracut-core` | Condizionale | Condizionale | Condizionale | Condizionale | Richiesto quando Dracut è il generatore initramfs |
| `gpg`, `gnupg` | Sì | Sì | Sì | Sì | Strumenti per firma di pacchetti e file |
| `file`, `cpio` | Sì | Sì | Sì | Sì | Identificazione file e gestione archivi |
| `gettext-base` / `gettext` | Condizionale | Condizionale | Condizionale | Condizionale | Utilità di traduzione selezionate in base alla disponibilità |
| `polkitd` / `policykit-1`, `pkexec` | Condizionale | Condizionale | Condizionale | Condizionale | Autorizzazione ed elevazione dei privilegi |
| `bash-completion` | Sì | Sì | Sì | Sì | Completamento comandi shell |
| `man-db` | Sì | Sì | Sì | Sì | Lettore e database delle pagine man |
| `mc` | Sì | Sì | Sì | Sì | File manager Midnight Commander |
| `gpm` | Sì | Sì | Sì | Sì | Supporto mouse in console |
| `ssh` | Sì | Sì | Sì | Sì | Pacchetti client e server OpenSSH selezionati da APT |
| `systemd-timesyncd` / `chrony` | Condizionale | Condizionale | Condizionale | Condizionale | Sincronizzazione oraria selezionata da suite e sistema di init |
| `tlp` | Sì | Sì | Sì | Sì | Gestione energetica per laptop |

Alcuni pacchetti di parità bootstrap sono richiesti solo per specifiche suite di base.
Sono dipendenze di implementazione piuttosto che funzionalità delle edizioni e non sono elencati singolarmente qui.

## Strumenti di rete

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Sì | Sì | Sì | Sì | Autenticazione wireless WPA/WPA2 |
| `rfkill` | Sì | Sì | Sì | Sì | Controllo stato dei dispositivi wireless |
| `usb-modeswitch` | Sì | Sì | Sì | Sì | Gestione modem USB e dispositivi multi-modalità |
| `dnsmasq-base` | - | Sì | Sì | Sì | Supporto DNS e DHCP utilizzato dai workflow di rete |
| `cifs-utils` | - | Sì | Sì | Sì | Client filesystem di rete SMB/CIFS |
| `nfs-common` | - | Sì | Sì | Sì | Supporto client NFS |
| `ipset` | - | Sì | Sì | Sì | Amministrazione IP set del kernel |
| `whois` | - | Sì | Sì | Sì | Ricerca registrazione domini e indirizzi |
| `netcat`, `netcat-openbsd` | - | - | Sì | Sì | Strumenti di test TCP e UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Sì | Sì | Scoperta di rete, trasferimento e confronto scansioni |
| `iw` | - | - | Sì | Sì | Configurazione dispositivi e collegamenti wireless |
| `iperf3` | - | - | Sì | Sì | Test di throughput di rete |
| `aria2` | - | - | Sì | Sì | Utility di download multiprotocollo |
| `davfs2` | - | - | Sì | Sì | Client filesystem WebDAV |
| `sshfs` | - | - | Sì | Sì | Accesso filesystem tramite SSH |
| `open-iscsi` | - | - | - | Sì | Iniziatore iSCSI |
| `tgt` | - | - | - | Sì | Servizio target iSCSI |

## Storage e filesystem

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Sì | Sì | Sì | Sì | Ispezione e tuning dispositivi ATA e SCSI |
| `mdadm` | Sì | Sì | Sì | Sì | Gestione RAID software Linux |
| `smartmontools` | Sì | Sì | Sì | Sì | Monitoraggio e test S.M.A.R.T. |
| `dosfstools` | Sì | Sì | Sì | Sì | Creazione e verifica filesystem FAT |
| `ntfs-3g` | Sì | Sì | Sì | Sì | Driver e strumenti NTFS in userspace |
| `btrfs-progs` | Sì | Sì | Sì | Sì | Amministrazione Btrfs |
| `xfsprogs` | - | Sì | Sì | Sì | Amministrazione XFS |
| `exfatprogs` / `exfat-utils` con `exfat-fuse` | - | Condizionale | Condizionale | Condizionale | Implementazione exFAT selezionata in base alla disponibilità |
| `fuse3` / `fuse`, `libfuse2` | - | Condizionale | Condizionale | Condizionale | Runtime FUSE e libreria di compatibilità |
| `dynfilefs` | - | Condizionale | Condizionale | Condizionale | Storage persistente segmentato su suite supportate |
| `parted` | - | Sì | Sì | Sì | Creazione e modifica tabelle delle partizioni |
| `gpart` | - | - | Sì | Sì | Recupero tabelle delle partizioni |
| `mtools` | - | - | Sì | Sì | Strumenti per FAT e supporti DOS |
| `gddrescue` | - | - | Sì | Sì | Copia di dispositivi a blocchi tollerante agli errori |
| `lvm2` | - | - | Sì | Sì | Logical Volume Manager |
| `cryptsetup` | - | - | Sì | Sì | Gestione volumi LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Sì | Sì | Gestione e montaggio volumi cifrati |
| `f2fs-tools` | - | - | Sì | Sì | Amministrazione F2FS |
| `hfsutils`, `hfsprogs` | - | - | Sì | Sì | Strumenti HFS e HFS+, dove disponibili |
| `jfsutils` | - | - | Sì | Sì | Amministrazione JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Sì | Sì | Strumenti ReiserFS e Reiser4, dove disponibili |
| `udftools` | - | - | Sì | Sì | Strumenti filesystem UDF per supporti ottici |
| `nilfs-tools` | - | - | Sì | Sì | Amministrazione NILFS2 |
| `zfsutils-linux` | - | - | Condizionale | Condizionale | Strumenti ZFS in userspace quando il kernel supporta ZFS |

## Archivi e formati immagine

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Sì | Sì | Sì | Sì | Compressione usata da pacchetti, moduli e immagini |
| `zip`, `unzip` | Sì | Sì | Sì | Sì | Creazione ed estrazione archivi ZIP |
| `xorriso` | Sì | Sì | Sì | Sì | Creazione e ispezione ISO |
| `squashfs-tools` | Sì | Sì | Sì | Sì | Creazione ed estrazione moduli SquashFS |
| `lz4` / `liblz4-tools` | - | Condizionale | Condizionale | Condizionale | Implementazione LZ4 selezionata in base alla disponibilità |
| `bzip2` | - | Sì | Sì | Sì | Compressione bzip2 |
| `7zip` | - | Sì | Sì | Sì | 7z e formati archivio correlati |
| `genisoimage` | - | Sì | Sì | Sì | Creazione immagini ISO-9660 |
| `pv` | - | - | Sì | Sì | Visualizzazione avanzamento pipeline |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Sì | Sì | Strumenti di compressione parallela |
| `lrzip`, `lzop` | - | - | Sì | Sì | Formati di compressione aggiuntivi |
| `cabextract` | - | - | Sì | Sì | Estrazione archivi Microsoft Cabinet |
| `xmount` | - | - | Sì | Sì | Conversione e montaggio formati immagine disco |

## Recupero, diagnostica e performance

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Sì | Sì | Sì | Sì | Ispezione dispositivi PCI e USB |
| `psmisc` | Sì | Sì | Sì | Sì | Strumenti di processo come `fuser` e `killall` |
| `htop` | - | Sì | Sì | Sì | Monitor di processo interattivo |
| `ncdu` | - | Sì | Sì | Sì | Analizzatore utilizzo disco da terminale |
| `lsof` | - | Sì | Sì | Sì | Ispezione file aperti e processi |
| `clonezilla` | - | - | Sì | Sì | Workflow di clonazione disco e partizioni |
| `partclone`, `partimage` | - | - | Sì | Sì | Strumenti imaging consapevoli del filesystem |
| `testdisk` | - | - | Sì | Sì | Recupero partizioni e file |
| `chntpw`, `reglookup` | - | - | Sì | Sì | Strumenti offline per account e registro Windows |
| `hexedit` | - | - | Sì | Sì | Editor esadecimale da terminale |
| `lshw`, `inxi` | - | - | Sì | Sì | Report dettagliati su hardware e sistema |
| `screen` | - | - | Sì | Sì | Multiplexer da terminale |
| `nmon` | - | - | Sì | Sì | Monitor di performance interattivo |
| `fio`, `bonnie++`, `iozone3` | - | - | Sì | Sì | Benchmark storage e filesystem |
| `stress`, `sysbench` | - | - | Sì | Sì | Benchmark CPU, memoria e sistema |
| `memtest86+` | - | - | Sì | Sì | Test memoria all’avvio |
| `rsync` | - | - | Sì | Sì | Utility di sincronizzazione e copia file |

## Virtualizzazione e container

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Sì | Sì | Integrazione guest VMware e QEMU |
| `virtualbox-guest-utils` | - | - | Condizionale | Condizionale | Integrazione guest VirtualBox su suite selezionate |
| `hyperv-daemons` | - | - | Sì | Sì | Servizi guest Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Sì | Sì | Runtime e strumenti immagini macchine virtuali |
| `libvirt-daemon-system` | - | - | Sì | Sì | Servizio libvirt di sistema |
| `virt-what` | - | - | Sì | Sì | Rilevamento hypervisor |
| `uidmap` | - | - | - | Sì | Mappatura ID namespace utente |
| Docker CE stack / `docker.io` con `docker-compose` | - | - | - | Condizionale | Runtime container selezionato dal repository disponibile |
| `lazydocker` | - | - | - | Sì | Interfaccia terminale per Docker |
| `selinux-policy-default` | - | - | - | Sì | Pacchetto policy SELinux predefinito |

## Firmware e driver del kernel

La selezione del firmware segue il profilo della distribuzione: le build Debian e Devuan usano pacchetti firmware suddivisi, mentre le build Ubuntu utilizzano `linux-firmware`. I driver DKMS sono inoltre filtrati in base all'architettura, al fornitore del kernel, alla serie del kernel e alle funzionalità già fornite dal kernel selezionato.

| Pacchetto | Edizioni | Scopo o condizione |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Condizionale, tutte | Collezioni firmware Debian e Devuan |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Condizionale, tutte | Firmware wireless per dispositivi Atheros, Intel e ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Condizionale, tutte | Firmware Realtek e MediaTek; MediaTek dipende dalla suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Condizionale, tutte | Firmware di rete Broadcom e Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Condizionale, tutte | Altre famiglie di firmware wireless aggiuntive |
| `firmware-b43-installer` | Condizionale, tutte | Installer firmware Broadcom B43 legacy |
| `firmware-sof-signed` | Condizionale, tutte | Immagini Sound Open Firmware |
| `linux-firmware` | Condizionale, tutte | Collezione firmware Ubuntu |
| `ntfs3-dkms` | Condizionale, tutte | Driver NTFS3 quando assente dal kernel selezionato |
| `aufs-dkms` / `aufs-ng-dkms` | Condizionale, tutte | Driver AUFS selezionato da suite e kernel |
| `broadcom-sta-dkms` | Condizionale, tutte | Driver wireless Broadcom STA su target supportati |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Condizionale, tutte | Driver wireless vendor filtrati in base alle capacità del kernel e alla piattaforma di destinazione |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Condizionale, tutte | Driver vendor mantenuti su target supportati per dispositivi o funzionalità aggiuntive |
| `zfs-dkms` | Condizionale, Toolbox e Ultra | Modulo kernel ZFS su build amd64 supportate |

## Base grafica

Gli ambienti grafici condividono la base Xorg e di rendering sottostante. Flux utilizza poi la propria lista desktop; Standard, Toolbox e Ultra utilizzano la lista Xfce mantenuta.

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Sì | Sì | Sì | Sì | Server X.Org e strumenti di avvio |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Sì | Sì | Sì | Sì | Driver video X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Sì | Sì | Sì | Sì | Driver di input e supporto avvio legacy |
| `xterm` | Sì | Sì | Sì | Sì | Terminale X di base |
| `blackbox` / `openbox` | Condizionale | Condizionale | Condizionale | Condizionale | Window manager leggero di fallback selezionato dall'ambiente |
| `x11-utils`, `wmctrl`, `xdotool` | Sì | Sì | Sì | Sì | Ispezione X11 e automazione delle finestre |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Sì | Sì | Sì | Sì | Librerie DRM e Mesa per il rendering |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Sì | Sì | Sì | Sì | Temi di cursori e icone |
| `elementary-minios-icon-theme` | Sì | Sì | Sì | Sì | Tema icone MiniOS fuori da LXQt |
| `librsvg2-common` | Sì | Sì | Sì | Sì | Supporto rendering SVG |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Condizionale | Condizionale | Condizionale | Condizionale | Agente PolicyKit grafico selezionato in base alla disponibilità |
| `xrdp`, `xorgxrdp` | - | - | Sì | Sì | Accesso grafico remoto via RDP |

## Desktop Flux e applicazioni

| Pacchetto | Scopo o condizione |
|---|---|
| `fluxbox-flux` | Configurazione window manager MiniOS Fluxbox |
| `xfce4-panel`, `xfce4-xkb-plugin` | Pannello e indicatore layout tastiera |
| `xwallpaper`, `gpicview` / `feh` | Visualizzazione sfondi e immagini |
| `compton` | Compositore X |
| `alsa-utils`, `volumeicon-alsa` | Controlli audio ALSA |
| `systrayicon`, `cbatticon` | Indicatori tray e batteria |
| `xlunch`, `gtkask`, `flux-tools` | Launcher e strumenti desktop MiniOS Flux |
| `scrot` | Utility screenshot |
| `mousepad`, `pcmanfm` | Editor di testo e file manager |
| `galculator`, `lxtask`, `xarchiver` | Calcolatrice, task manager e gestore archivi |
| `network-manager-gnome` | Applet desktop NetworkManager |
| `firefox` / `firefox-esr` | Browser selezionato dalla suite, con relativi pacchetti di localizzazione |

## Desktop Xfce e applicazioni MiniOS

| Pacchetto | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Sì | Sì | Sì | File manager e integrazione supporti rimovibili |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Sì | Sì | Sì | Servizi pannello, sessione e impostazioni Xfce |
| `xfdesktop4`, `xfwm4`, `xfconf` | Sì | Sì | Sì | Desktop, window manager e servizio di configurazione |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Sì | Sì | Sì | Finder applicazioni e indicatore tastiera |
| `mousepad`, `ristretto` | Sì | Sì | Sì | Editor di testo e visualizzatore immagini |
| `at-spi2-core`, `dbus-x11` | Sì | Sì | Sì | Supporto accessibilità e message-bus desktop |
| `gvfs-backends` | Sì | Sì | Sì | Integrazione filesystem remoti e rimovibili per il file manager |
| `lightdm`, `lightdm-gtk-greeter` | Sì | Sì | Sì | Gestore login grafico |
| `network-manager-gnome`, `blueman` | Sì | Sì | Sì | Controlli desktop per rete e Bluetooth |
| `avahi-daemon` | Sì | Sì | Sì | Scoperta servizi di rete locale |
| PipeWire stack / PulseAudio stack | Condizionale | Condizionale | Condizionale | Audio desktop selezionato dalla suite |
| `pavucontrol` | Sì | Sì | Sì | Mixer audio grafico |
| `engrampa`, `thunar-archive-plugin` | Sì | Sì | Sì | Gestore archivi e integrazione file manager |
| `xfce4-screensaver`, `xfce4-screenshooter` | Sì | Sì | Sì | Blocco schermo e screenshot |
| `xfce4-power-manager-plugins` | Sì | Sì | Sì | Integrazione gestione energia Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Sì | Sì | Sì | Task manager e emulatore terminale |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Sì | Sì | Sì | Menu applicazioni e notifiche |
| `minios-configurator` | Sì | Sì | Sì | Editor configurazione avvio e sessione MiniOS |
| `minios-installer` | Sì | Sì | Sì | Installer grafico e CLI `minios-deploy` |
| `minios-session-manager` | Sì | Sì | Sì | Gestore sessioni persistenti e CLI `minios-session` |
| `minios-kernel-manager` | Sì | Sì | Sì | Gestore kernel modulare e CLI `minios-kernel` |
| `minios-store`, `minios-store-gui` | Sì | Sì | Sì | Catalogo applicazioni MiniOS e installer |
| `minios-image-builder` | Sì | Sì | Sì | Workspace grafico per remastering ISO |
| `minios-module-manager` | Sì | Sì | Sì | Gestore moduli grafico `.sb` |
| `minios-help` | Sì | Sì | Sì | Visualizzatore documentazione MiniOS installata |
| `driveutility` | Sì | Sì | Sì | Scrittura, lettura, formattazione e cancellazione immagini disco |
| `firefox` / `firefox-esr` | Condizionale | Condizionale | Condizionale | Browser e localizzazione selezionati da suite e lingua |
| `menulibre` | - | Sì | Sì | Editor menu grafico |
| `open-vm-tools-desktop` | - | Sì | Sì | Integrazione desktop VMware |
| `virtualbox-guest-x11` | - | Condizionale | Condizionale | Integrazione desktop VirtualBox su suite selezionate |
| Qt GTK platform themes | - | Sì | Sì | Integrazione aspetto GTK per applicazioni Qt |

## Applicazioni grafiche Toolbox

Il modulo `05-apps` di Xfce è incluso per Toolbox e Ultra e viene saltato per Standard.

| Pacchetto | Scopo o condizione |
|---|---|
| `gparted` | Editor di partizioni grafico |
| `gsmartcontrol`, `qdiskinfo` | Diagnostica disco e informazioni sui dispositivi |
| `guymager`, `qphotorec` | Imaging forense e recupero file; `qphotorec` è escluso su Buster e Beowulf |
| `kdiskmark` | Benchmark disco |
| `isomaster` | Editor immagini ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnostica hardware e grafica |
| `baobab` | Analizzatore grafico uso disco |
| `doublecmd-gtk` | File manager a due pannelli |
| `grsync` | Frontend grafico per `rsync` |
| `bleachbit` | Pulizia cache e file temporanei |
| `czkawka` / `czkawka-gui` | Ricerca duplicati e file indesiderati |
| `gtkhash` | Calcolatore checksum |
| `wxhexeditor` | Editor esadecimale per file di grandi dimensioni |
| `keepassxc` | Gestore password |
| `veracrypt` | Gestione contenitori e dischi cifrati; escluso su Buster e Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Strumenti grafici per volumi cifrati |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gestione macchine virtuali e supporto display SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Client desktop remoto |
| `wireshark`, `zenmap`, `gnome-nettool` | Analisi e diagnostica di rete grafiche |
| `x11vnc` | Accesso VNC alla sessione X corrente |
| `uget` | Gestore download grafico |
| `android-file-transfer` | Trasferimento file Android MTP |
| `vlc` e plugin selezionati | Riproduzione multimediale, localizzazione, supporto Samba e BitTorrent |
| `pdfarranger` | Gestione pagine PDF |
| `codium` | Editor di codice |
| `onboard` | Tastiera su schermo |
| `galculator` | Calcolatrice |

## Applicazioni Ultra

Ultra include tutte le applicazioni Toolbox e aggiunge:

| Pacchetto | Scopo |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suite office e integrazione desktop |
| `gimp` | Editor grafico raster |
| `inkscape` | Editor grafico vettoriale |
| `blender` | Suite per la creazione 3D |
| `audacity` | Editor audio |
| `obs-studio`, `obs-plugins` | Registrazione schermo e streaming |
| `rawtherapee` | Sviluppo RAW foto |
| `synaptic` | Gestore pacchetti grafico |
| `eddy`, `eddy-handler` | Installer pacchetti Debian locale, dove disponibile |
| `fonts-open-sans` | Famiglia font Open Sans |

## Ispeziona i pacchetti installati

Il sistema in esecuzione è l’unica fonte autorevole per i pacchetti effettivamente installati.
Elenca nomi e versioni dei pacchetti con:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifesti di build sorgente

Le tabelle dei pacchetti sopra sono derivate dal [sistema di build `minios-live`](https://github.com/minios-linux/minios-live). I percorsi sotto sono relativi alla radice di quel repository sorgente e sono rilevanti quando si costruisce o personalizza un'immagine dal sorgente:

- `linux-live/environments/<environment>/` definisce la catena ordinata dei moduli.
- `linux-live/scripts/00-core/packages.list` definisce la base condivisa e le aggiunte delle varianti di pacchetto.
- `linux-live/scripts/01-kernel/packages.list` definisce la build condizionale del kernel e i pacchetti DKMS.
- `linux-live/scripts/02-firmware/packages.list` definisce il firmware specifico della distribuzione.
- `linux-live/scripts/03-gui-base/packages.list` definisce la base grafica condivisa.
- `linux-live/scripts/04-flux-desktop/packages.list` e `05-flux-apps/packages.list` definiscono Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` definisce Xfce e gli strumenti desktop MiniOS.
- `linux-live/scripts/05-apps/packages.list` definisce le applicazioni grafiche di Toolbox e Ultra.
- `linux-live/scripts/10-firefox/packages.list` definisce i pacchetti browser specifici per suite e lingua.
- Ogni file `install` e `skip_conditions.conf` di un modulo determina se e come viene usata la sua lista di pacchetti.
- `linux-live/build.conf` seleziona suite, architettura, ambiente, variante di pacchetto, sistema di init, kernel e lingua.
- `linux-live/condinapt.map` definisce i prefissi delle condizioni delle liste di pacchetti.

Gli elenchi sorgente descrivono i pacchetti richiesti e le alternative. Solo l'immagine completata e `dpkg-query` mostrano l'insieme delle dipendenze risolte e le versioni esatte per una determinata release.

Vedi [Architettura di sistema](/reference/System-Architecture) per l'ordine dei moduli e [CondinAPT in MiniOS](/development/CondinAPT) per la selezione condizionale dei pacchetti.
