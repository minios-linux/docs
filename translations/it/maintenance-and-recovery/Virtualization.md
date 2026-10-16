---
updated: 2026-08-31
---

# Virtualizzazione

MiniOS può essere eseguito come guest in VirtualBox, VMware, QEMU/KVM e Hyper-V.
Toolbox e Ultra includono anche software per eseguire macchine virtuali QEMU/KVM direttamente da MiniOS.

Questa pagina documenta il comportamento della virtualizzazione specifico di MiniOS. Per la normale creazione di VM e la configurazione degli hypervisor, consulta la documentazione dell'hypervisor.

## Eseguire MiniOS come guest

### Configurazione VM consigliata

Per la massima compatibilità, collega il supporto di avvio di MiniOS e qualsiasi disco virtuale destinato a contenere un'installazione live di MiniOS tramite un controller **IDE o SATA**. Questa raccomandazione vale per VirtualBox, VMware, QEMU/KVM e Hyper-V, quando è disponibile un controller di questo tipo.

Possono funzionare anche altri controller di archiviazione virtuali, ma MiniOS deve poter accedere alla propria sorgente live durante la fase initramfs, prima che sia disponibile l'intero albero dei moduli del kernel di`01-kernel-*.sb`.

### Supporto per l'archiviazione nelle prime fasi di avvio

MiniOS include intenzionalmente nell'initramfs solo una selezione di driver di archiviazione. Gli attuali strumenti di compilazione Dracut e LiveKit applicano la stessa politica:

| Interfaccia di archiviazione | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Sì | Sì |
| NVMe | Sì | Sì |
| Archiviazione di massa USB / UAS | Sì | Sì |
| Archiviazione Hyper-V (`hv_storvsc`) | Sì | Sì |
| VirtIO block / SCSI | No | Sì |
| VMware PVSCSI | No | Sì |
| Frontend block Xen | No | No |

I driver SAS/RAID più comuni, come `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` e `aacraid` sono presenti nell'intero albero dei moduli del kernel, ma non sono inclusi nell'initramfs di MiniOS.

Questa distinzione è rilevante solo prima che venga individuata la sorgente live di MiniOS e che il sistema completo sia avviato. Un hardware che funziona normalmente dopo l'avvio non è necessariamente adatto a ospitare la sorgente live stessa.

Per questo motivo, **IDE o SATA resta la scelta consigliata per l'archiviazione delle VM**, anche per le edizioni il cui initramfs include anche il supporto per VirtIO o VMware PVSCSI.

### Integrazione con i sistemi guest

Il kernel fornisce già i driver di base per l'hardware virtuale usati dai principali hypervisor. Toolbox e Ultra aggiungono pacchetti di servizi guest per un'integrazione più completa:

| Piattaforma | Integrazione guest inclusa in Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` sulle versioni base supportate |
| Hyper-V | `hyperv-daemons` |

Il kernel Debian attuale usato da amd64 MiniOS include anche i driver guest di VirtualBox, i driver grafici e di rete di VMware, VirtIO e i driver di Hyper-V. I pacchetti di servizi guest aggiungono funzionalità di integrazione, ma non sono necessari per avviare una VM di base.

### Gestione della risoluzione in Xfce

MiniOS fornisce `/usr/bin/minios-virtual-resolution` tramite `minios-tools` e lo avvia dalla sessione di avvio automatico di Xfce. Rileva le macchine virtuali più comuni e usa XRandR solo se gli strumenti guest attivi non gestiscono già lo schermo.

Senza un valore personalizzato, la risoluzione richiesta è `1280x800`. Usa `virtres=WIDTHxHEIGHT` per richiedere un'altra risoluzione oppure `novirtres` per disattivare questa regolazione di MiniOS.
Dopo aver applicato correttamente la regolazione, l'utility crea `~/.config/minios/virtual-resolution-configured`. In una sessione persistente, la regolazione automatica non verrà applicata di nuovo finché questo indicatore non viene rimosso.

## Usare MiniOS come host di virtualizzazione

Toolbox e Ultra includono lo stack QEMU/KVM usato per le macchine virtuali locali:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra include inoltre il proprio stack Docker e `lazydocker` per i carichi di lavoro basati su container.

Questa documentazione non descrive l'installazione di prodotti di virtualizzazione non inclusi in un'edizione.

## Vedi anche

- [Compatibilità hardware](/getting-started/Hardware-Compatibility)
- [Rilevamento del sistema nell'initrd](/reference/boot-process/System-Discovery)
- [Parametri di avvio](/reference/Boot-Parameters)
- [Pacchetti ed edizioni](/reference/Package-and-Edition-Contents)
