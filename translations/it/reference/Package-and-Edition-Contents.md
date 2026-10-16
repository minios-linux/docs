---
updated: 2026-10-15
---

# Contenuti dei pacchetti e delle edizioni

I contenuti dei pacchetti di MiniOS sono generati a partire da elenchi di sorgenti condizionali. Il set finale dipende dalla suite di distribuzione, dall’architettura, dal sistema di init, dall’ambiente desktop, dalle impostazioni locali, dalle opzioni del kernel e dalla disponibilità nei repository. Questa pagina documenta i pacchetti richiesti dagli utenti in base ai manifest Flux e Xfce mantenuti. Non include le toolchain usate solo per la compilazione né le dipendenze installate da APT.

`Yes` indica che il manifest attuale richiede il pacchetto per quell’edizione.
`Conditional` indica che il nome o l’inclusione del pacchetto dipende da un’opzione di compilazione o dalla piattaforma di destinazione. Un trattino indica che l’edizione non lo richiede.
L’immagine completata resta la fonte autorevole.

## Struttura delle edizioni

Le edizioni Xfce mantenute si basano l’una sull’altra: Standard è un ambiente desktop essenziale per l’uso quotidiano, Toolbox è pensata per l’amministrazione di sistema professionale, la diagnostica e il ripristino, mentre Ultra trasforma questa base in un ambiente desktop completo per il lavoro in generale, la creatività e lo sviluppo. Flux è una configurazione Fluxbox separata e ultraleggera, pensata per ridurre al minimo l’uso delle risorse e per l’hardware meno recente; non è semplicemente un elenco di pacchetti Xfce più ridotto.

| Edizione | Variante del pacchetto e ambiente | Scopo principale |
|---|---|---|
| **Standard** | `standard` con `xfce` | Ambiente desktop Xfce essenziale per l’uso quotidiano, con le funzionalità di base |
| **Toolbox** | `toolbox` con `xfce` | Amministrazione di sistema professionale, diagnostica e ripristino |
| **Ultra** | `ultra` con `xfce` | Ambiente desktop completo per il lavoro in generale, la creatività e lo sviluppo |
| **Flux** | `minimum` con `flux` | Ambiente desktop Fluxbox ultraleggero, per ridurre al minimo l’uso delle risorse e supportare hardware meno recente |

Gli altri ambienti supportati hanno catene di moduli proprie e vanno verificati separatamente. In particolare, la disponibilità dei pacchetti nelle build LXQt o per console non va dedotta dalle tabelle Xfce riportate di seguito.

## Pacchetti di sistema e MiniOS di base

Questi pacchetti forniscono l’ambiente di esecuzione del sistema live, la configurazione, la localizzazione, la gestione dei privilegi e un ambiente a riga di comando di base.

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Sì | Sì | Sì | Sì | Creazione, conversione, ispezione, attivazione e acquisizione delle modifiche ai moduli |
| `minios-image-compose` | - | Sì | Sì | Sì | Composizione di ISO MiniOS da riga di comando |
| `minios-deploy`, `minios-kernel`, `minios-session` | - | Sì | Sì | Sì | Backend per distribuzione, kernel e sessione da riga di comando, indipendenti dalle app grafiche |
| `minios-live-config` | Sì | Sì | Sì | Sì | Componenti di configurazione della sessione live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Condizionale | Condizionale | Condizionale | Condizionale | Integrazione con il sistema di init; viene selezionata una sola implementazione |
| `minios-live-config-doc` | Sì | Sì | Sì | Sì | Riferimento live-config installato |
| `minios-welcome` | Sì | Sì | Sì | Sì | Pagina di benvenuto e launcher MiniOS |
| `user-setup` | Sì | Sì | Sì | Sì | Configurazione dell’account utente live |
| `linux-base` | Sì | Sì | Sì | Sì | Script di sistema e immagine Linux comuni |
| `kbd`, `keyboard-configuration`, `console-setup` | Sì | Sì | Sì | Sì | Configurazione di tastiera e schermo della console |
| `locales` | Sì | Sì | Sì | Sì | Dati locali e generazione delle impostazioni locali |
| `network-manager` | Sì | Sì | Sì | Sì | Gestione della connessione di rete |
| `netplan.io` | Condizionale | Condizionale | Condizionale | Condizionale | Richiesto solo nelle suite Ubuntu supportate |
| `dracut-core` | Condizionale | Condizionale | Condizionale | Condizionale | Richiesto quando Dracut è il generatore dell’initramfs |
| `gpg`, `gnupg` | Sì | Sì | Sì | Sì | Strumenti per le firme di pacchetti e file |
| `file`, `cpio` | Sì | Sì | Sì | Sì | Identificazione dei file e gestione degli archivi |
| `gettext-base` / `gettext` | Condizionale | Condizionale | Condizionale | Condizionale | Strumenti di traduzione selezionati in base alla disponibilità |
| `polkitd` / `policykit-1`, `pkexec` | Condizionale | Condizionale | Condizionale | Condizionale | Autorizzazione e acquisizione dei privilegi |
| `bash-completion` | Sì | Sì | Sì | Sì | Completamento dei comandi shell |
| `man-db` | Sì | Sì | Sì | Sì | Lettore e database delle pagine man |
| `mc` | Sì | Sì | Sì | Sì | File manager Midnight Commander |
| `gpm` | Sì | Sì | Sì | Sì | Supporto del mouse nella console |
| `ssh` | Sì | Sì | Sì | Sì | Pacchetti client e server OpenSSH selezionati da APT |
| `systemd-timesyncd` / `chrony` | Condizionale | Condizionale | Condizionale | Condizionale | Sincronizzazione dell’ora in base alla suite e al sistema di init |
| `tlp` | Sì | Sì | Sì | Sì | Gestione dell’alimentazione dei laptop |

Alcuni pacchetti di bootstrap per mantenere la parità sono richiesti solo per specifiche suite di base.
Sono dipendenze di implementazione, non funzionalità delle edizioni, e per questo non sono elencati singolarmente.

## Strumenti di rete

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Sì | Sì | Sì | Sì | Autenticazione wireless WPA/WPA2 |
| `rfkill` | Sì | Sì | Sì | Sì | Controllo dello stato dei dispositivi wireless |
| `usb-modeswitch` | Sì | Sì | Sì | Sì | Commutazione di modem USB e dispositivi multimodali |
| `dnsmasq-base` | - | Sì | Sì | Sì | Supporto DNS e DHCP per le attività di rete |
| `cifs-utils` | - | Sì | Sì | Sì | Client di file system di rete SMB/CIFS |
| `nfs-common` | - | Sì | Sì | Sì | Supporto per client NFS |
| `ipset` | - | Sì | Sì | Sì | Amministrazione dei set IP del kernel |
| `whois` | - | Sì | Sì | Sì | Ricerca di domini e registrazione di indirizzi |
| `netcat`, `netcat-openbsd` | - | - | Sì | Sì | Strumenti per testare flussi TCP e UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Sì | Sì | Rilevamento di rete, trasferimento e confronto delle scansioni |
| `iw` | - | - | Sì | Sì | Configurazione dei dispositivi wireless e dei collegamenti |
| `iperf3` | - | - | Sì | Sì | Test della velocità effettiva della rete |
| `aria2` | - | - | Sì | Sì | Utilità di download multiprotocollo |
| `davfs2` | - | - | Sì | Sì | Client di file system WebDAV |
| `sshfs` | - | - | Sì | Sì | Accesso al file system tramite SSH |
| `open-iscsi` | - | - | - | Sì | Initiator iSCSI |
| `tgt` | - | - | - | Sì | Servizio target iSCSI |

## Archiviazione e filesystem

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Sì | Sì | Sì | Sì | Ispezione e ottimizzazione dei dispositivi ATA e SCSI |
| `mdadm` | Sì | Sì | Sì | Sì | Gestione del RAID software Linux |
| `smartmontools` | Sì | Sì | Sì | Sì | Monitoraggio e test S.M.A.R.T. |
| `dosfstools` | Sì | Sì | Sì | Sì | Creazione e controllo di filesystem FAT |
| `ntfs-3g` | Sì | Sì | Sì | Sì | Driver e strumenti NTFS in userspace |
| `btrfs-progs` | Sì | Sì | Sì | Sì | Amministrazione di Btrfs |
| `xfsprogs` | - | Sì | Sì | Sì | Amministrazione di XFS |
| `exfatprogs` / `exfat-utils` con `exfat-fuse` | - | Condizionale | Condizionale | Condizionale | Implementazione di exFAT scelta in base alla disponibilità dei pacchetti |
| `fuse3` / `fuse`, `libfuse2` | - | Condizionale | Condizionale | Condizionale | Runtime FUSE e libreria di compatibilità |
| `dynfilefs` | - | Condizionale | Condizionale | Condizionale | Archiviazione persistente segmentata nelle suite supportate |
| `dynblk` | - | Sì | Sì | Sì | CLI per archiviazione DynBlk thin supportata dal kernel e VMDK suddivisi; per usare le sessioni servono anche il driver e un initrd compatibile |
| `parted` | - | Sì | Sì | Sì | Creazione e modifica delle tabelle delle partizioni |
| `gpart` | - | - | Sì | Sì | Ripristino delle tabelle delle partizioni |
| `mtools` | - | - | Sì | Sì | Strumenti per supporti FAT e DOS |
| `gddrescue` | - | - | Sì | Sì | Copia tollerante agli errori dei dispositivi a blocchi |
| `lvm2` | - | - | Sì | Sì | Logical Volume Manager |
| `cryptsetup` | - | - | Sì | Sì | Gestione dei volumi LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Sì | Sì | Gestione e montaggio dei volumi cifrati |
| `f2fs-tools` | - | - | Sì | Sì | Amministrazione di F2FS |
| `hfsutils`, `hfsprogs` | - | - | Sì | Sì | Strumenti HFS e HFS+, se disponibili |
| `jfsutils` | - | - | Sì | Sì | Amministrazione di JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Sì | Sì | Strumenti ReiserFS e Reiser4, se disponibili |
| `udftools` | - | - | Sì | Sì | Strumenti per filesystem UDF su supporti ottici |
| `nilfs-tools` | - | - | Sì | Sì | Amministrazione di NILFS2 |
| `zfsutils-linux` | - | - | Condizionale | Condizionale | Strumenti ZFS in userspace se la build del kernel supporta ZFS |

## Archivi e formati immagine

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Sì | Sì | Sì | Sì | Compressione usata da pacchetti, moduli e immagini |
| `zip`, `unzip` | Sì | Sì | Sì | Sì | Creazione ed estrazione di archivi ZIP |
| `xorriso` | Sì | Sì | Sì | Sì | Creazione e ispezione di immagini ISO |
| `squashfs-tools` | Sì | Sì | Sì | Sì | Creazione ed estrazione di moduli SquashFS |
| `lz4` / `liblz4-tools` | - | Condizionale | Condizionale | Condizionale | Implementazione LZ4 scelta in base alla disponibilità |
| `bzip2` | - | Sì | Sì | Sì | Compressione bzip2 |
| `7zip` | - | Sì | Sì | Sì | Formati di archivio 7z e correlati |
| `genisoimage` | - | Sì | Sì | Sì | Creazione di immagini ISO-9660 |
| `pv` | - | - | Sì | Sì | Visualizzazione dell'avanzamento della pipeline |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Sì | Sì | Strumenti di compressione parallela |
| `lrzip`, `lzop` | - | - | Sì | Sì | Formati di compressione aggiuntivi |
| `cabextract` | - | - | Sì | Sì | Estrazione di archivi Microsoft Cabinet |
| `xmount` | - | - | Sì | Sì | Conversione e montaggio di formati di immagini disco |

## Ripristino, diagnostica e prestazioni

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Sì | Sì | Sì | Sì | Ispezione dei dispositivi PCI e USB |
| `psmisc` | Sì | Sì | Sì | Sì | Strumenti per i processi come `fuser` e `killall` |
| `htop` | - | Sì | Sì | Sì | Monitor interattivo dei processi |
| `ncdu` | - | Sì | Sì | Sì | Analizzatore dello spazio su disco da terminale |
| `lsof` | - | Sì | Sì | Sì | Ispezione dei file aperti e dei processi |
| `clonezilla` | - | - | Sì | Sì | Procedure di clonazione di dischi e partizioni |
| `partclone`, `partimage` | - | - | Sì | Sì | Strumenti di creazione di immagini compatibili con i filesystem |
| `testdisk` | - | - | Sì | Sì | Ripristino di partizioni e file |
| `chntpw`, `reglookup` | - | - | Sì | Sì | Strumenti offline per account e registro di Windows |
| `hexedit` | - | - | Sì | Sì | Editor esadecimale da terminale |
| `lshw`, `inxi` | - | - | Sì | Sì | Report dettagliati su hardware e sistema |
| `screen` | - | - | Sì | Sì | Multiplexer di terminale |
| `nmon` | - | - | Sì | Sì | Monitor interattivo delle prestazioni |
| `fio`, `bonnie++`, `iozone3` | - | - | Sì | Sì | Benchmark di archiviazione e filesystem |
| `stress`, `sysbench` | - | - | Sì | Sì | Benchmark di CPU, memoria e sistema |
| `memtest86+` | - | - | Sì | Sì | Test della memoria all'avvio |
| `rsync` | - | - | Sì | Sì | Utility di sincronizzazione e copia dei file |
| `git` | - | - | Sì | Sì | Client per il controllo delle versioni |

## Virtualizzazione e container

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Sì | Sì | Integrazione guest per VMware e QEMU |
| `virtualbox-guest-utils` | - | - | Condizionale | Condizionale | Integrazione guest per VirtualBox in alcune suite |
| `hyperv-daemons` | - | - | Sì | Sì | Servizi guest Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Sì | Sì | Runtime e strumenti per immagini di macchine virtuali |
| `libvirt-daemon-system` | - | - | Sì | Sì | Servizio libvirt di sistema |
| `virt-what` | - | - | Sì | Sì | Rilevamento dell'hypervisor |
| `uidmap` | - | - | - | Sì | Mappatura degli ID degli user namespace |
| Stack Docker CE / `docker.io` con `docker-compose` | - | - | - | Condizionale | Runtime per container scelto dal repository disponibile |
| `lazydocker` | - | - | - | Sì | Interfaccia terminale per Docker |
| `selinux-policy-default` | - | - | - | Sì | Pacchetto di policy SELinux predefinita |

## Firmware e driver del kernel

La selezione del firmware segue il profilo della distribuzione: le build Debian e Devuan usano pacchetti firmware separati, mentre le build Ubuntu usano `linux-firmware`. Anche i driver DKMS vengono filtrati in base ad architettura, provider del kernel, serie del kernel e funzionalità già fornite dal kernel selezionato.

| Pacchetto | Edizioni | Scopo o condizione |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Condizionale, tutte | Raccolte di firmware Debian e Devuan |
| `firmware-intel-graphics` | Condizionale, tutte | Firmware grafico Intel su Trixie ed Excalibur |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Condizionale, tutte | Firmware wireless per dispositivi Atheros, Intel e ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Condizionale, tutte | Firmware Realtek e MediaTek; quello MediaTek dipende dalla suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Condizionale, tutte | Firmware di rete Broadcom e Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Condizionale, tutte | Famiglie aggiuntive di firmware wireless |
| `firmware-b43-installer` | Condizionale, tutte | Installer del firmware Broadcom B43 legacy |
| `firmware-sof-signed` | Condizionale, tutte | Immagini Sound Open Firmware |
| `linux-firmware-minimal` / `linux-firmware` e pacchetti firmware dei produttori | Condizionale, tutte | Alternativa al firmware di base Ubuntu, più pacchetti AMD, Intel, Broadcom, MediaTek, Qualcomm, Marvell e Realtek specifici per la suite |
| `ntfs3-dkms` | Condizionale, tutte | Driver NTFS3 se assente dal kernel selezionato |
| `aufs-dkms` / `aufs-ng-dkms` | Condizionale, tutte | Driver AUFS selezionato in base alla suite e al kernel |
| `dynblk-dkms` | Condizionale, tutte | Driver DynBlk selezionato per Linux 6.12 se è abilitata la compilazione DKMS; non firmato e non disponibile con Secure Boot |
| `broadcom-sta-dkms` | Condizionale, tutte | Driver wireless Broadcom STA sulle piattaforme supportate |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Condizionale, tutte | Driver wireless dei produttori, filtrati in base alle funzionalità integrate nel kernel e alla piattaforma di destinazione |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Condizionale, tutte | Driver dei produttori mantenuti sulle piattaforme supportate per dispositivi o funzionalità aggiuntivi |
| `zfs-dkms` | Condizionale, Toolbox e Ultra | Modulo kernel ZFS nelle build amd64 supportate |

I pacchetti per display e fotocamera di MateBook E sono disponibili per l'installazione separata, con le limitazioni indicate in [Compatibilità hardware](/getting-started/Hardware-Compatibility). Gli elenchi dei pacchetti di sviluppo possono includere questi driver, ma ciò non garantisce che siano inclusi nelle immagini della versione finale.

## Base grafica

Gli ambienti grafici condividono la base Xorg e di rendering riportata di seguito. Flux usa poi un proprio elenco di applicazioni desktop; Standard, Toolbox e Ultra usano l'elenco Xfce mantenuto.

| Pacchetto | Flux | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Sì | Sì | Sì | Sì | Server X.Org e strumenti di avvio |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Sì | Sì | Sì | Sì | Driver video X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Sì | Sì | Sì | Sì | Driver di input e supporto per l'avvio legacy |
| `xterm` | Sì | Sì | Sì | Sì | Terminale X di base |
| `blackbox` / `openbox` | Condizionale | Condizionale | Condizionale | Condizionale | Gestore di finestre leggero di riserva, selezionato in base all'ambiente |
| `x11-utils`, `wmctrl`, `xdotool` | Sì | Sì | Sì | Sì | Ispezione X11 e automazione delle finestre |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Sì | Sì | Sì | Sì | Librerie di rendering DRM e Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Sì | Sì | Sì | Sì | Temi per cursore e icone |
| `elementary-minios-icon-theme` | Sì | Sì | Sì | Sì | Tema di icone MiniOS al di fuori di LXQt |
| `librsvg2-common` | Sì | Sì | Sì | Sì | Supporto per il rendering SVG |
| `fonts-inter-minimal`, `fonts-jetbrains-mono-minimal` | Sì | Sì | Sì | Sì | Font per interfaccia e a spaziatura fissa |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Condizionale | Condizionale | Condizionale | Condizionale | Agente grafico PolicyKit selezionato in base alla disponibilità |
| `xrdp`, `xorgxrdp` | - | - | Sì | Sì | Accesso grafico remoto tramite RDP |

## Desktop e applicazioni Flux

| Pacchetto | Scopo o condizione |
|---|---|
| `fluxbox-flux` | Configurazione del gestore di finestre Fluxbox MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Pannello e indicatore del layout di tastiera |
| `xwallpaper`, `gpicview` / `feh` | Sfondo e visualizzazione immagini |
| `compton` | Compositore X |
| `alsa-utils`, `volumeicon-alsa` | Controlli audio ALSA |
| `systrayicon`, `cbatticon` | Indicatori di sistema e batteria |
| `xlunch`, `gtkask`, `flux-tools` | Launcher e strumenti per il desktop Flux MiniOS |
| `scrot` | Strumento per screenshot |
| `mousepad`, `pcmanfm` | Editor di testo e file manager |
| `galculator`, `lxtask`, `xarchiver` | Calcolatrice, gestore attività e gestore archivi |
| `network-manager-gnome` | Applet desktop di NetworkManager |
| `firefox` / `firefox-esr` | Browser selezionato in base alla suite, con i pacchetti di localizzazione corrispondenti |

## Desktop Xfce e applicazioni MiniOS

| Pacchetto | Standard | Toolbox | Ultra | Scopo o condizione |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Sì | Sì | Sì | File manager e integrazione dei supporti rimovibili |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Sì | Sì | Sì | Le impostazioni usano il pacchetto adattato a MiniOS, con ridimensionamento automatico dell'interfaccia su Trixie/Excalibur |
| `xfdesktop4`, `xfconf` | Sì | Sì | Sì | Desktop e servizio di configurazione; su Trixie/Excalibur integrazione del menu desktop tramite MiniOS |
| `xfwm4-gl` / `xfwm4` | Condizionale | Condizionale | Condizionale | Su Trixie/Excalibur viene selezionato `xfwm4-gl` con OpenGL/XRender, effetti e Peek; nelle altre suite viene selezionato `xfwm4` |
| `xfce4-tasklist-minios-plugin`, `xfce4-showdesktop-minios-plugin` | Condizionale | Condizionale | Condizionale | MiniOS barra delle applicazioni bloccata, anteprime raggruppate e barra Mostra desktop su Trixie/Excalibur |
| `greybird-minios-gtk-theme` / `greybird-gtk-theme` | Condizionale | Condizionale | Condizionale | MiniOS tema chiaro/scuro, con il tema della distribuzione come alternativa se non disponibile |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Sì | Sì | Sì | Ricerca applicazioni e indicatore della tastiera |
| `mousepad`, `ristretto` | Sì | Sì | Sì | Editor di testo e visualizzatore immagini |
| `at-spi2-core`, `dbus-x11` | Sì | Sì | Sì | Accessibilità e supporto del message bus desktop |
| `gvfs-backends` | Sì | Sì | Sì | Integrazione del file manager con filesystem remoti e rimovibili |
| `lightdm`, `lightdm-gtk-greeter` | Sì | Sì | Sì | Gestore di accesso grafico |
| `network-manager-gnome`, `blueman` | Sì | Sì | Sì | Controlli desktop per rete e Bluetooth |
| `avahi-daemon` | Sì | Sì | Sì | Rilevamento dei servizi nella rete locale |
| Stack PipeWire / stack PulseAudio | Condizionale | Condizionale | Condizionale | Audio desktop selezionato in base alla suite |
| `pavucontrol` | Sì | Sì | Sì | Mixer audio grafico |
| `engrampa`, `thunar-archive-plugin` | Sì | Sì | Sì | Gestore archivi e integrazione con il file manager |
| `xfce4-screensaver`, `xfce4-screenshooter` | Sì | Sì | Sì | Blocco schermo e screenshot |
| `xfce4-power-manager-plugins` | Sì | Sì | Sì | Integrazione con la gestione dell'alimentazione di Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Sì | Sì | Sì | Gestore attività ed emulatore di terminale |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Sì | Sì | Sì | Menu applicazioni e notifiche |
| `minios-configurator` | Sì | Sì | Sì | Editor della configurazione di avvio e sessione MiniOS |
| `minios-installer` | Sì | Sì | Sì | Installer grafico e `minios-deploy` CLI |
| `minios-session-manager` | Sì | Sì | Sì | Gestore di sessioni persistenti e `minios-session` CLI |
| `minios-kernel-manager` | Sì | Sì | Sì | Gestore modulare del kernel e `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Sì | Sì | Sì | Catalogo e installer delle applicazioni MiniOS |
| `minios-image-builder` | Sì | Sì | Sì | Ambiente grafico per rimasterizzare ISO |
| `minios-module-manager` | Sì | Sì | Sì | Gestore grafico dei moduli `.sb` |
| `minios-help` | Sì | Sì | Sì | Visualizzatore della documentazione installata MiniOS |
| `driveutility` | Sì | Sì | Sì | Scrittura, lettura, formattazione e cancellazione di immagini disco |
| `firefox` / `firefox-esr` | Condizionale | Condizionale | Condizionale | Browser e localizzazione selezionati in base alla suite e alla lingua |
| `menulibre` | - | Sì | Sì | Editor grafico dei menu |
| `open-vm-tools-desktop` | - | Sì | Sì | Integrazione desktop VMware |
| `virtualbox-guest-x11` | - | Condizionale | Condizionale | Integrazione desktop VirtualBox in alcune suite |
| Temi GTK per Qt | - | Sì | Sì | Integrazione dell'aspetto GTK nelle applicazioni Qt |

## Applicazioni grafiche di Toolbox

Il modulo Xfce `05-apps` è incluso in Toolbox e Ultra e viene saltato in Standard.

| Pacchetto | Scopo o condizione |
|---|---|
| `gparted` | Editor grafico delle partizioni |
| `gsmartcontrol`, `qdiskinfo` | Stato del disco e informazioni sul dispositivo |
| `guymager`, `qphotorec` | Acquisizione forense e recupero dei file; `qphotorec` è escluso su Buster e Beowulf |
| `kdiskmark` | Benchmark del disco |
| `isomaster` | Editor di immagini ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnostica hardware e grafica |
| `baobab` | Analizzatore grafico dell'utilizzo del disco |
| `doublecmd-gtk` | Gestore file a doppio pannello |
| `grsync` | Interfaccia `rsync` grafica |
| `bleachbit` | Pulizia della cache e dei file temporanei |
| `czkawka` / `czkawka-gui` | Ricerca di file duplicati e indesiderati |
| `gtkhash` | Calcolatore di checksum |
| `wxhexeditor` | Editor esadecimale per file di grandi dimensioni |
| `keepassxc` | Gestore di password |
| `veracrypt` | Gestione di contenitori cifrati e dischi; escluso su Buster e Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Strumenti grafici per volumi cifrati |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gestione delle macchine virtuali e supporto per display SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Client desktop remoto |
| `rescuezilla` | Backup, ripristino e clonazione grafici dei dischi |
| `transume` | Backup, ripristino e clonazione basati su Clonezilla, con esplorazione delle immagini; richiede pacchetti compatibili nei repository |
| `wireshark`, `zenmap`, `gnome-nettool` | Analisi e diagnostica grafica della rete |
| `x11vnc` | Accesso VNC alla sessione X corrente |
| `uget` | Gestore grafico dei download |
| `android-file-transfer` | Trasferimento di file Android tramite MTP |
| `vlc` e plugin selezionati | Supporto per riproduzione multimediale, localizzazione, Samba e BitTorrent |
| `pdfarranger` | Riordino delle pagine PDF |
| `codium` | Editor di codice per amd64, installato dal repository di terze parti firmato |
| `onboard` | Tastiera su schermo |
| `galculator` | Calcolatrice |

## Applicazioni Ultra

Ultra include tutte le applicazioni di Toolbox e aggiunge:

| Pacchetto | Scopo |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suite per l'ufficio e integrazione con il desktop |
| `gimp` | Editor di grafica raster |
| `inkscape` | Editor di grafica vettoriale |
| `blender` | Suite per la creazione 3D |
| `audacity` | Editor audio |
| `obs-studio`, `obs-plugins` | Registrazione e streaming dello schermo |
| `rawtherapee` | Elaborazione di foto RAW |
| `synaptic` | Gestore grafico dei pacchetti |
| `eddy`, `eddy-handler` | Installatore di pacchetti Debian locali, se disponibile |
| `fonts-open-sans` | Famiglia di caratteri Open Sans |

## Esaminare i pacchetti installati

Il sistema in esecuzione è la fonte autorevole per i pacchetti effettivamente installati.
Elenca i nomi e le versioni dei pacchetti con:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifest di build dei sorgenti

Le tabelle dei pacchetti qui sopra derivano dal sistema di build [`minios-live` dei sorgenti](https://github.com/minios-linux/minios-live). I percorsi seguenti sono relativi alla radice di quel repository sorgente e sono pertinenti alla creazione o personalizzazione di un'immagine dai sorgenti:

- `linux-live/environments/<environment>/` definisce la catena ordinata dei moduli.
- `linux-live/scripts/00-core/packages.list` definisce la base condivisa e le aggiunte delle varianti dei pacchetti.
- `linux-live/scripts/01-kernel/packages.list` definisce i pacchetti condizionali per la build del kernel e DKMS.
- `linux-live/scripts/02-firmware/packages.list` definisce il firmware specifico della distribuzione.
- `linux-live/scripts/03-gui-base/packages.list` definisce la base grafica condivisa.
- `linux-live/scripts/04-flux-desktop/packages.list` e `05-flux-apps/packages.list` definiscono Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` definisce Xfce e gli strumenti desktop MiniOS.
- `linux-live/scripts/05-apps/packages.list` definisce le applicazioni grafiche di Toolbox e Ultra.
- `linux-live/scripts/10-firefox/packages.list` definisce i pacchetti del browser specifici per suite e lingua.
- I file `install` e `skip_conditions.conf` di ciascun modulo determinano se e come viene utilizzato il relativo elenco di pacchetti.
- `linux-live/build.conf` seleziona la suite, l'architettura, l'ambiente, la variante dei pacchetti, il sistema init, il kernel e la lingua.
- `linux-live/condinapt.map` definisce i prefissi delle condizioni negli elenchi dei pacchetti.

Gli elenchi dei sorgenti descrivono i pacchetti richiesti e le alternative. Solo l'immagine completata e `dpkg-query` mostrano l'insieme delle dipendenze risolte e le versioni esatte per una specifica release.

Consulta [Architettura di sistema](/reference/System-Architecture) per l'ordine dei moduli e [CondinAPT in MiniOS](/development/CondinAPT) per la selezione condizionale dei pacchetti.
