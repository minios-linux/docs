---
updated: 2026-08-31
---

# Virtualizzazione

MiniOS può essere eseguito come guest in VirtualBox, VMware, QEMU/KVM e Hyper-V.
Toolbox e Ultra includono anche software per eseguire macchine virtuali QEMU/KVM direttamente da MiniOS.

Questa pagina documenta il comportamento di virtualizzazione specifico di MiniOS. Per la creazione ordinaria di VM e le impostazioni dell'hypervisor, fare riferimento alla documentazione dell'hypervisor.

## Esecuzione di MiniOS come guest

### Layout VM consigliato

Per la massima compatibilità, collega il supporto di avvio di MiniOS e qualsiasi disco virtuale che conterrà un'installazione live di MiniOS tramite un **controller IDE o SATA**. Questa raccomandazione vale per VirtualBox, VMware, QEMU/KVM e Hyper-V ogni volta che tale controller è disponibile.

Anche altri controller di archiviazione virtuale possono funzionare, ma MiniOS deve poter accedere alla propria sorgente live durante la fase initramfs, prima che l'intero albero dei moduli kernel da `01-kernel-*.sb` sia disponibile.

### Supporto storage in fase di early-boot

MiniOS include intenzionalmente solo un set selezionato di driver di archiviazione nell'initramfs. Gli attuali builder Dracut e LiveKit adottano la stessa politica:

| Interfaccia di archiviazione | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Sì | Sì |
| NVMe | Sì | Sì |
| USB mass storage / UAS | Sì | Sì |
| Archiviazione Hyper-V (`hv_storvsc`) | Sì | Sì |
| VirtIO block / SCSI | No | Sì |
| VMware PVSCSI | No | Sì |
| Xen block frontend | No | No |

I driver SAS/RAID comuni come `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` e `aacraid` sono presenti nell'albero completo dei moduli kernel ma non sono inclusi nell'initramfs di MiniOS.

Questa distinzione è rilevante solo prima che venga trovata la sorgente live di MiniOS e che il sistema completo sia avviato. L'hardware che funziona normalmente dopo l'avvio non è necessariamente adatto a ospitare la sorgente live stessa.

Per questo motivo, **IDE o SATA rimane la scelta consigliata per lo storage delle VM**, anche per le edizioni il cui initramfs include anche il supporto VirtIO o VMware PVSCSI.

### Integrazione guest

Il kernel fornisce già i driver hardware virtuali di base utilizzati dai principali hypervisor. Toolbox e Ultra aggiungono pacchetti guest-service per un'integrazione più avanzata:

| Piattaforma | Integrazione guest inclusa in Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` sulle basi supportate |
| Hyper-V | `hyperv-daemons` |

L'attuale kernel Debian utilizzato da amd64 MiniOS include anche i driver guest di VirtualBox, i driver grafici/rete di VMware, VirtIO e i driver Hyper-V. I pacchetti di servizio guest aggiungono funzionalità di integrazione; non sono ciò che rende possibile l'avvio di base della VM.

### Gestione della risoluzione in Xfce

MiniOS fornisce `/usr/bin/minios-virtual-resolution` tramite `minios-tools` e lo avvia dalla sessione di avvio automatico di Xfce. Rileva le macchine virtuali più comuni e utilizza XRandR solo quando gli strumenti guest attivi non stanno già gestendo il display.

Senza un override, la risoluzione richiesta è `1280x800`. Usa `virtres=WIDTHxHEIGHT` per richiedere un'altra risoluzione o `novirtres` per disabilitare questa regolazione di MiniOS.
Dopo una regolazione riuscita, l'utilità crea `~/.config/minios/virtual-resolution-configured`. In una sessione persistente non applicherà nuovamente la regolazione automatica finché quel marker non viene rimosso.

## Utilizzo di MiniOS come host di virtualizzazione

Toolbox e Ultra includono lo stack QEMU/KVM utilizzato per le macchine virtuali locali:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra include inoltre il proprio stack Docker e `lazydocker` per i carichi di lavoro in container.

Questa documentazione non descrive l'installazione di prodotti di virtualizzazione che non fanno parte di un'edizione.

## Vedi anche

- [Compatibilità hardware](/getting-started/Hardware-Compatibility)
- [Rilevamento sistema initrd](/reference/boot-process/System-Discovery)
- [Parametri di avvio](/reference/Boot-Parameters)
- [Pacchetti ed edizioni](/reference/Package-and-Edition-Contents)
