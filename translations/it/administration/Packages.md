# Pacchetti ed edizioni

I contenuti dei pacchetti MiniOS vengono generati da elenchi sorgente condizionali. Variano
a seconda della suite di distribuzione, architettura, sistema di init, ambiente desktop, lingua,
opzioni del kernel e disponibilità dei repository. Questa pagina descrive l’ereditarietà delle edizioni
e i contenuti rappresentativi; non si tratta di una tabella esaustiva dei pacchetti rilasciati.

## Ereditarietà delle edizioni

Le edizioni pubbliche formano una sequenza additiva:

1. **Flux** fornisce il sistema live comune e l'ambiente leggero Flux.
2. **Standard** eredita la base comune dei pacchetti e aggiunge strumenti generali di amministrazione, desktop e gestione MiniOS.
3. **Toolbox** eredita Standard e aggiunge strumenti di recupero, diagnostica, storage, rete e virtualizzazione.
4. **Ultra** eredita Toolbox e aggiunge software più ampio per workstation, multimedia, office e container.

Le espressioni condizionali possono selezionare alternative o escludere un pacchetto in base a suite, architettura, ambiente o opzioni di build. Un pacchetto elencato di seguito è quindi rappresentativo delle attuali liste sorgente, non una garanzia che lo stesso nome di pacchetto binario Debian esista in ogni rilascio MiniOS.

## Ambito desktop e ambiente

I pacchetti desktop provengono dalla catena di moduli ordinata dell’ambiente selezionato.
Gli ambienti Xfce, Fluxbox, LXQt, core e debug non hanno insiemi di moduli o pacchetti identici.
Gli esempi seguenti fanno riferimento agli elenchi Xfce attuali, salvo che una
funzionalità provenga dall’elenco core condiviso. Una build console o con altro desktop
deve essere analizzata separatamente.

## Contenuti rappresentativi

### Flux

La composizione comune di Flux include la configurazione live di MiniOS e gli strumenti per la creazione di immagini, NetworkManager, SSH, supporto per tastiera e lingua, firmware selezionato per il target e utility per l'ispezione hardware e le attività comuni di storage.
I pacchetti rappresentativi includono `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` e `wpasupplicant`.

La catena desktop Flux aggiunge Fluxbox e gli strumenti di supporto selezionati dalle liste sorgente. Non include il set completo di applicazioni Xfce e GUI MiniOS descritto in Standard.

Le utility MiniOS presenti in ogni edizione, incluso Flux, sono `minios-tools`, `minios-image-compose`, `minios-live-config`, l'integrazione corrispondente con systemd o SysV init, `minios-live-config-doc` e `minios-welcome`.

### Standard

Standard aggiunge funzionalità condivise come supporto DNS, ulteriori strumenti di compressione
e filesystem, client per filesystem di rete, FUSE, partizionamento e creazione ISO.
I pacchetti rappresentativi includono `dnsmasq-base`, `ncdu`, `lsof`,
`xfsprogs`, `exfatprogs` o la sua alternativa specifica per la suite, `cifs-utils`,
`nfs-common`, `parted`, `7zip` e `genisoimage`.

In Xfce, Standard e le edizioni successive aggiungono le utility grafiche e amministrative MiniOS attuali: `minios-configurator`, `minios-installer`,
`minios-session-manager`, `minios-kernel-manager`, `minios-store`,
`minios-store-gui`, `minios-image-builder`, `minios-module-manager` e
`driveutility`. Vengono inoltre aggiunti LightDM, integrazione audio desktop e Bluetooth,
screenshot, gestione attività, notifiche e il terminale Xfce.

### Toolbox

Toolbox aggiunge funzionalità da linea di comando per storage, recupero, performance, rete e macchine virtuali. Gli esempi attuali includono strumenti LVM e LUKS, Clonezilla,
Partclone, TestDisk, `gddrescue`, strumenti ZFS se supportati dalla build, Nmap,
iperf3, QEMU, libvirt, agenti guest, fio, sysbench e report hardware.

Il modulo applicazioni Xfce aggiunge strumenti rappresentativi come GParted,
GSmartControl, Guymager, utility di recupero e disco, Wireshark, Remmina,
Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit e strumenti grafici
di cifratura. I nomi esatti dipendono dalla suite; ad esempio, un elenco sorgente
può prevedere una delle diverse alternative di pacchetto.

### Ultra

Ultra mantiene il set Toolbox e aggiunge software per container e workstation.
Le aggiunte condivise rappresentative includono i pacchetti Docker selezionati per il repository di destinazione, supporto Compose, `lazydocker`, strumenti iSCSI e utility per user-namespace. L’elenco applicazioni Xfce attuale aggiunge LibreOffice, GIMP, Inkscape,
Blender, Audacity, OBS Studio, RawTherapee, Synaptic e i relativi pacchetti di integrazione desktop.

## Ispezionare il contenuto esatto del rilascio

Il sistema in esecuzione è la fonte autorevole per i pacchetti effettivamente installati in quel rilascio. Elenca nomi e versioni dei pacchetti con:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Ispeziona separatamente i moduli ordinati che compongono la root in esecuzione rispetto ai file selezionati per il prossimo avvio. Il MiniOS Module Manager presenta questi come **In esecuzione ora** e **Prossimo avvio**. Da una shell, i mount runtime SquashFS possono essere elencati con:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Per supporti offline o una ISO montata, inventaria direttamente i file dei moduli sorgente:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Per una build sorgente, i seguenti file e directory sono i manifesti sorgente autorevoli e gli input di selezione:

- `linux-live/environments/<environment>/` per la catena ordinata dei moduli.
- `linux-live/scripts/00-core/packages.list` per la selezione condivisa delle edizioni.
- `linux-live/scripts/01-kernel/packages.list` e `02-firmware/packages.list` per aggiunte condizionali al kernel e firmware.
- `packages.list` di ogni modulo desktop e applicazione selezionato.
- `linux-live/build.conf` per suite, architettura, ambiente, variante di pacchetto, sistema di init, kernel, lingua e altri valori di filtro.
- `linux-live/condinapt.map` per il significato dei prefissi di filtro delle liste pacchetti.

Le liste sorgente descrivono i pacchetti richiesti e le alternative. Solo l'immagine completata e `dpkg-query` mostrano l'insieme esatto delle dipendenze risolte e le versioni per uno specifico rilascio. La disponibilità e i nomi dei pacchetti possono cambiare tra le suite Debian, Ubuntu e Devuan e tra diversi ambienti desktop.

Il sistema di build sorgente chiama la sua variante di pacchetto più piccola `minimum`. Questo è un valore interno `PACKAGE_VARIANT` usato dai filtri CondinAPT, non il nome di una edizione MiniOS pubblicata. L'edizione pubblicata costruita da quella variante di pacchetto e dall'ambiente Flux è **Flux**.

Vedi [Architettura di sistema](/about/System-Architecture.md) per l'ordinamento dei moduli e [CondinAPT in MiniOS](/development/CondinAPT-MiniOS.md) per la selezione condizionale dei pacchetti.
