---
updated: 2026-08-31
---

# Compatibilità hardware

MiniOS è progettato per funzionare su diversi computer x86 invece di essere vincolato a una sola macchina. Il test di compatibilità più affidabile consiste quindi nell’avviare l’immagine MiniOS effettiva sull’hardware di destinazione e verificare i dispositivi che intendi utilizzare.

Il supporto hardware dipende dall’immagine selezionata: architettura, distribuzione di base, kernel, firmware, driver, desktop ed edizione sono tutti fattori rilevanti. Un’immagine MiniOS più recente o diversa può supportare hardware che una versione precedente non supporta.

## Architettura

MiniOS supporta sia sistemi x86 a 64 bit che a 32 bit:

| Architettura immagine | Usala per |
|---|---|
| **amd64** | Computer x86 a 64 bit |
| **i386** | Computer x86 a 32 bit supportati |

Utilizza l’architettura indicata nel nome dell’immagine e nella descrizione del rilascio. La disponibilità delle immagini a 32 bit dipende dalla release MiniOS e dalla distribuzione di base.

## Firmware e avvio

Le immagini PC MiniOS possono essere avviate tramite BIOS legacy e UEFI quando i file di avvio richiesti sono presenti nell’immagine selezionata. Le implementazioni firmware variano molto, quindi lo stesso dispositivo USB può apparire in modo diverso nel menu di avvio su computer diversi.

Le attuali immagini MiniOS a 64 bit utilizzano il kernel Debian e i componenti EFI di Debian.
Supportano quindi **Secure Boot** sui sistemi amd64.

Le immagini i386 a 32 bit utilizzano un kernel compilato da MiniOS perché Debian non pubblica più pacchetti kernel a 32 bit. Questo kernel viene mantenuto identico al kernel Debian corrispondente, ma è compilato da MiniOS e non fa parte della catena di avvio firmata di Debian. Pertanto, **Secure Boot non è supportato dalle immagini i386 MiniOS**.

## Memoria

La memoria minima consigliata dipende dall’edizione:

| Edizione | RAM minima consigliata |
|---|---:|
| **Flux** | 512 MB |
| **Standard** | 756 MB |
| **Toolbox** | 756 MB |
| **Ultra** | 756 MB |

Questi valori si riferiscono all’uso normale dall’unità di avvio. Le applicazioni effettive potrebbero richiedere più memoria.

**L’esecuzione da RAM** richiede memoria aggiuntiva perché i dati MiniOS vengono copiati in RAM insieme al sistema e alle applicazioni in esecuzione. Le immagini di dimensioni maggiori richiedono quindi molta più memoria in questa modalità.

Consulta [Modalità di avvio](/using-minios/Boot-Modes) prima di utilizzare **Esegui da RAM** su un computer con memoria limitata.

## Grafica

Le attuali immagini amd64 MiniOS utilizzano lo stack grafico Debian con Xorg e Mesa.
Il kernel include i driver Intel `i915` e `xe`, AMD `amdgpu` e `radeon`, e il driver open source NVIDIA `nouveau`.

Xorg include il suo driver generico `modesetting` insieme ai driver Intel, AMD/ATI, Radeon, Nouveau, VESA e framebuffer. Mesa fornisce lo stack di accelerazione 3D standard utilizzato da Intel, AMD e dai driver open source supportati.

Le immagini MiniOS basate su Debian installano le raccolte firmware Debian insieme ai pacchetti firmware specifici dei produttori. L’immagine Standard Trixie attuale include `firmware-amd-graphics` e `firmware-misc-nonfree`; le immagini basate su Ubuntu utilizzano invece `linux-firmware`.

Le liste dei pacchetti MiniOS mantenute non includono il driver kernel proprietario NVIDIA. L’hardware NVIDIA utilizza quindi di default il driver `nouveau` incluso. L’hardware o le funzionalità che richiedono specificamente il driver proprietario NVIDIA devono essere aggiunti separatamente.

Anche la grafica virtuale è supportata dai driver kernel e Xorg per dispositivi comuni VMware, QXL, Bochs e Hyper-V.

## Hardware di rete

Le attuali immagini amd64 MiniOS utilizzano il kernel Debian con il normale set di driver di rete. Il kernel 6.12 utilizzato dalle attuali immagini Trixie include driver per hardware Ethernet e Wi-Fi Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell e altri comuni.

I driver Ethernet più comuni includono Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` e `ixgbe`; Realtek `8139` e `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x` e `bnxt`; Atheros `atl*` e `alx`; Marvell `sky2`; e driver USB Ethernet comuni come ASIX, `r8152`, CDC Ethernet/NCM e RNDIS.

Il supporto Wi-Fi include Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` e `ath12k`; Broadcom `brcmfmac`, `brcmsmac` e `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` e `rtw89`; e diversi driver Marvell, Intersil, ZyDAS e altri più datati.

MiniOS aggiunge inoltre moduli DKMS per hardware non sufficientemente coperto dal kernel standard. L’attuale set di moduli amd64 include driver Wi-Fi USB Realtek aggiuntivi per RTL8188EU, RTL8814AU, RTL8811/RTL8821AU e adattatori RTL88xxAU correlati, oltre al driver Broadcom STA `wl`.

Il set firmware include pacchetti firmware Debian per hardware di rete Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium e altri dispositivi comuni.
La disponibilità effettiva dipende comunque dalla release MiniOS, dall’architettura e dal kernel selezionato.

Per la normale connettività dopo l’avvio, MiniOS utilizza NetworkManager. Se un adattatore non viene rilevato, modificare le impostazioni di NetworkManager non fornirà un driver kernel o firmware mancante. Consulta [Configurazione di rete](/using-minios/Networking) per l’uso normale della rete.

## Archiviazione

Per un avvio live MiniOS, il controller di archiviazione è importante due volte: il firmware deve poter avviare il bootloader e l’initramfs MiniOS deve poi poter vedere il dispositivo che contiene l’albero dati `minios/`.

MiniOS include intenzionalmente solo alcuni driver di archiviazione selezionati nel proprio initramfs.
Le build attuali includono sempre il supporto per IDE/PATA/SATA, NVMe, SD/MMC, USB mass storage/UAS e archiviazione Hyper-V. Le edizioni Standard, Toolbox e Ultra aggiungono anche il supporto VirtIO block/SCSI e VMware PVSCSI all’initramfs; Flux no.

L’albero completo dei moduli kernel contiene driver di archiviazione aggiuntivi che non sono disponibili durante la fase iniziale di rilevamento MiniOS della sorgente. Se il menu di avvio appare ma MiniOS non trova i suoi moduli, consulta [Rilevamento sistema Initrd](/reference/boot-process/System-Discovery).

## Macchine virtuali

MiniOS supporta l’hardware virtuale comune utilizzato da VirtualBox, VMware, QEMU/KVM e Hyper-V. Per i supporti di avvio e i dischi di destinazione dell’installazione, preferisci un **controller IDE o SATA** quando il hypervisor lo consente. Questi controller garantiscono il comportamento più prevedibile durante l’avvio e l’installazione.

L’attuale kernel Debian 6.12 include già i principali driver per hardware guest:

| Hypervisor | Driver inclusi nel kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO block, network, graphics, input, balloon, SCSI, sound e driver correlati |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm` e supporto input Hyper-V |

Questi driver kernel sono sufficienti per il funzionamento di base come guest. Ulteriori servizi guest forniscono integrazione con l’host come gestione automatica dello schermo, spegnimento pulito, condivisione filesystem e comunicazione host/guest.

Toolbox e Ultra includono `open-vm-tools` e `open-vm-tools-desktop` per VMware, `qemu-guest-agent` per QEMU/KVM e `hyperv-daemons` per Hyper-V. Sulle suite supportate, incluse le attuali immagini Trixie, sono inclusi anche `virtualbox-guest-utils` e `virtualbox-guest-x11`. Flux e Standard non includono questi pacchetti guest-service di default.

Consulta [Virtualizzazione](/maintenance-and-recovery/Virtualization) e [Pacchetti ed edizioni](/reference/Package-and-Edition-Contents) per il software specifico per edizione.

## Testare un computer prima di affidarsi ad esso

1. Avvia l’immagine MiniOS esatta che intendi utilizzare.
2. Usa la modalità predefinita **Avvia MiniOS** per i test normali, oppure **Avvia senza salvataggio** quando non vuoi aprire o creare una sessione persistente.
3. Verifica grafica, tastiera e dispositivi di puntamento, audio, rete cablata e wireless, i dispositivi di archiviazione necessari e la sospensione/ripresa se prevedi di usarla.
4. Se prevedi di usare la persistenza, effettua una piccola modifica di prova, riavvia e conferma che la sessione prevista sia stata attivata e che la modifica sia rimasta.
5. Solo dopo affidati alla macchina per lavori importanti o esegui operazioni distruttive sul disco.

Se qualcosa non funziona, determina innanzitutto se il problema si verifica prima del menu di avvio, durante il rilevamento della sorgente MiniOS o dopo l’avvio del sistema operativo.
Questa distinzione di solito permette di capire se indagare su firmware, initramfs o sul normale supporto hardware Linux.
