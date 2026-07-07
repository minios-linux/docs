# Guida alla Compatibilità Hardware

Questa guida fornisce informazioni essenziali sulla compatibilità hardware per MiniOS. Il sistema si basa su Debian 13 "Trixie" con kernel Linux Long-Term Support (LTS), garantendo un ampio supporto hardware.

## Requisiti di Sistema

MiniOS è progettato per l’architettura **amd64** (64 bit). I requisiti variano in base all’edizione:

**Per la Variante Standard:**
- **CPU:** Processore 64 bit da 1 GHz
- **RAM:** 1 GB minimo (2 GB consigliati)
- **Storage:** 2 GB per eseguire il sistema (4 GB+ consigliati per l’archiviazione dati)
- **Grafica:** Scheda video compatibile VGA

**Per la Variante Toolbox:**
- **CPU:** Processore 64 bit da 1.2 GHz
- **RAM:** 2 GB minimo (4 GB consigliati)
- **Storage:** 2 GB per eseguire il sistema (8 GB+ consigliati per l’archiviazione dati)
- **Grafica:** Scheda grafica con supporto all’accelerazione hardware

**Per la Variante Ultra:**
- **CPU:** Processore dual-core 64 bit da 1.5 GHz
- **RAM:** 4 GB minimo (8 GB consigliati)
- **Storage:** 2 GB per eseguire il sistema (8 GB+ consigliati per l’archiviazione dati)
- **Grafica:** GPU moderna con accelerazione hardware

## Compatibilità dei Componenti

### Processori

È supportata un’ampia gamma di processori x86 a 64 bit di Intel (Core i3/i5/i7/i9) e AMD (Ryzen 3/5/7/9).

### Grafica

- **Intel:** Le grafiche integrate (UHD, Iris Xe, Arc) sono ben supportate.
- **NVIDIA:** Il driver open-source Nouveau è incluso. Per le schede più recenti, si consiglia l’installazione del driver proprietario per ottenere le migliori prestazioni.
- **AMD:** Le schede grafiche Radeon RX di ultima generazione sono pienamente supportate dal driver open-source AMDGPU.

### Rete

- **Ethernet:** La maggior parte dei controller cablati di Intel, Realtek e Broadcom funziona immediatamente.
- **Wi-Fi:** Un’ampia gamma di adattatori Wi-Fi è supportata tramite firmware incluso e driver DKMS compilati automaticamente, in particolare i modelli più diffusi di Intel, Atheros e Realtek.

### Archiviazione

MiniOS è progettato per l’avvio da diversi dispositivi di archiviazione. Gli script di avvio del sistema eseguono automaticamente la scansione di tutti i dispositivi a blocchi disponibili, garantendo la compatibilità con:

- **Unità USB:** Sono supportate tutte le generazioni di USB.
- **Unità SATA/IDE:** Tutti i dischi rigidi e SSD interni standard.
- **Unità NVMe:** Pieno supporto per SSD NVMe di ultima generazione.
- **Schede SD/MMC:** Supportate se il lettore di schede è riconosciuto dal kernel.

### Virtualizzazione

MiniOS è completamente ottimizzato per l’utilizzo come sistema operativo guest in tutti i principali ambienti di virtualizzazione. Il processo di build include tutti i driver necessari nell’initrd (`initrd`) per garantire le massime prestazioni fin da subito.

- **Driver ad Alte Prestazioni:** Il supporto per controller di archiviazione paravirtualizzati è integrato, inclusi **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI** e **Hyper-V Storvsc**. Questo consente prestazioni I/O su disco quasi native.
- **Ampia Compatibilità:** Il sistema può anche avviarsi da controller **IDE** e **SATA** emulati, garantendo compatibilità con qualsiasi configurazione di hypervisor.
- **Guest Tools:** Per un’integrazione avanzata (come mouse senza soluzione di continuità, condivisione degli appunti e risoluzione dinamica), le varianti `toolbox` e `ultra` includono `open-vm-tools` (per VMware) e `hyperv-daemons` (per Hyper-V).

Per istruzioni dettagliate sull’installazione e configurazioni specifiche per piattaforma, consulta la [Guida alla Virtualizzazione](/administration/Virtualization.md).
