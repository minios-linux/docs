---
updated: 2026-10-15
---

# Compatibilità hardware

MiniOS è progettato per funzionare su diversi computer x86, senza essere vincolato a una singola macchina. Il test di compatibilità più affidabile consiste quindi nell'avviare l'immagine MiniOS effettiva sull'hardware di destinazione e verificare i dispositivi che si intende usare.

Il supporto hardware dipende dall'immagine selezionata: contano l'architettura, la distribuzione di base, il kernel, il firmware, i driver, l'ambiente desktop e l'edizione. Un'immagine MiniOS più recente o diversa potrebbe supportare hardware non compatibile con una versione precedente.

## Architettura

MiniOS supporta sistemi x86 a 64 e a 32 bit:

| Architettura dell'immagine | Uso |
|---|---|
| **amd64** | Computer x86 a 64 bit |
| **i386** | Computer x86 a 32 bit supportati |

Usa l'architettura indicata nel nome dell'immagine e nella descrizione della versione. La disponibilità di immagini a 32 bit dipende dalla versione MiniOS e dalla distribuzione di base.

## Firmware e avvio

Le immagini per PC MiniOS possono avviarsi tramite BIOS legacy e UEFI, se nell'immagine selezionata sono presenti i file di avvio necessari. Le implementazioni del firmware variano molto, quindi lo stesso dispositivo USB può apparire in modo diverso nel menu di avvio di computer diversi.

Il Secure Boot dipende dall'intera catena del kernel e di EFI dell'immagine, non solo dalla sua architettura. Le build Debian/Ubuntu amd64 che usano il kernel di distribuzione firmato e i componenti EFI corrispondenti possono supportare il Secure Boot. Un kernel personalizzato o non firmato fornito da MiniOS non diventa attendibile solo perché sono presenti file EFI firmati. DynBlk e il driver esterno AUFS-NG non sono firmati: il Secure Boot disabilita le sessioni DynBlk/VMDK e in genere lascia OverlayFS per la composizione dei moduli.

Le immagini i386 attuali usano un kernel compilato da MiniOS quando la base selezionata non fornisce più un kernel a 32 bit adatto. I kernel MiniOS sono build separate con integrazione MiniOS, non una garanzia che i binari siano identici a quelli Debian e non fanno parte della catena di firma di Debian. **Queste immagini i386 non supportano il Secure Boot.** La modalità del firmware è un fattore distinto da considerare per la compatibilità di avvio.

## Memoria

I requisiti di memoria dipendono dalla versione effettiva, dall'ambiente desktop, dalle applicazioni e dal tipo di sessione. In genere Flux richiede meno memoria delle edizioni complete con XFCE; un browser, una suite per l'ufficio, una macchina virtuale o uno snapshot di persistenza di grandi dimensioni possono richiedere molta più memoria del solo ambiente desktop. Consulta i requisiti indicati per la versione e prova il carico di lavoro previsto, invece di considerare sufficiente per ogni immagine attuale un vecchio valore RAM valido per tutte le edizioni.

**Eseguire dalla RAM** richiede memoria aggiuntiva perché i dati MiniOS vengono copiati in RAM insieme al sistema e alle applicazioni in esecuzione. In questa modalità, quindi, le immagini più grandi richiedono molta più memoria.

Consulta [Modalità di avvio](/using-minios/Boot-Modes) prima di usare **Eseguire dalla RAM** su un computer con poca memoria.

## Grafica

Le immagini amd64 MiniOS attuali usano lo stack grafico Debian con Xorg e Mesa.
A seconda del kernel selezionato, i relativi moduli coprono le schede `i915` e `xe`, `amdgpu` e `radeon`, oltre all'hardware `nouveau` NVIDIA open source.

Xorg include il driver generico `modesetting` insieme ai driver Intel, AMD/ATI, Radeon, Nouveau, VESA e framebuffer. Mesa fornisce il normale stack di accelerazione 3D usato da Intel, AMD e dai driver open source supportati.

Le immagini basate su Debian MiniOS richiedono le raccolte di firmware Debian insieme ai pacchetti specifici dei produttori, tra cui `firmware-intel-graphics` su Trixie ed Excalibur. Il firmware effettivamente installato dipende dalla disponibilità nei repository e dall'immagine creata. Le immagini basate su Ubuntu usano invece `linux-firmware`.

Gli elenchi di pacchetti mantenuti MiniOS non includono il driver proprietario NVIDIA per il kernel. Per impostazione predefinita, quindi, l'hardware NVIDIA usa il driver `nouveau` incluso. Per l'hardware o le funzionalità che richiedono specificamente il driver proprietario NVIDIA, è necessario aggiungerlo separatamente.

La grafica virtuale è supportata anche dai driver del kernel e di Xorg per i dispositivi VMware, QXL, Bochs e Hyper-V più comuni.

### Ridimensionamento e gestione delle finestre in XFCE

Le immagini XFCE di Debian 13 e Devuan Excalibur usano impostazioni e pacchetti desktop adattati a MiniOS, l'elenco di attività MiniOS e i plugin Mostra desktop, oltre a `xfwm4-gl` al posto di `xfwm4`. Impostazioni schermo offre il ridimensionamento automatico dell'interfaccia oppure opzioni manuali dal 100% al 200%, a incrementi del 25%, con anteprima temporizzata e ripristino. Testo, controlli, decorazioni e cursori del tema seguono il ridimensionamento dell'interfaccia; la scala in pixel dell'output e la risoluzione del monitor sono impostazioni separate. Le opzioni manuali salvate hanno la precedenza su quelle automatiche.

`xfwm4-gl` usa OpenGL per impostazione predefinita, con XRender come alternativa. Ottimizzazioni del gestore finestre consente di configurare sfocatura, animazioni, esclusione della composizione a schermo intero e aspetto di Alt+Tab. Le miniature di Alt+Tab e della barra delle applicazioni possono oscurare o nascondere le altre finestre per Peek senza attivare quella visualizzata in anteprima; se disponibili, vengono usate le immagini memorizzate delle finestre ridotte a icona. Dissolvenza, ridimensionamento e Peek funzionano con entrambi i renderer, mentre sfocatura e Magic Lamp richiedono OpenGL. Le altre suite mantengono i componenti XFCE della propria distribuzione.

### Pacchetti opzionali per MateBook E

Il supporto per Huawei MateBook E 2023 è disponibile tramite pacchetti Linux 6.12 installabili separatamente; non è garantito che siano inclusi nell'immagine di una release. `matebook-e-dsi-dkms` fornisce un backport sperimentale per il display integrato: la presenza di bande colorate residue e la sospensione/ripresa non convalidata restano limitazioni. L'integrazione della fotocamera usa `matebook-e-cameras-dkms` e il pacchetto userspace amd64/systemd `matebook-e-cameras`. I pacchetti della fotocamera non installano il driver sperimentale della penna.

## Hardware di rete

Le immagini amd64 MiniOS attuali usano il kernel Debian con la normale dotazione di driver di rete. Il kernel 6.12 usato dalle attuali immagini Trixie include driver per i componenti Ethernet e Wi-Fi più comuni di Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell e altri produttori.

Tra i driver Ethernet più comuni figurano Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` e `ixgbe`; Realtek `8139` e `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x` e `bnxt`; Atheros `atl*` e `alx`; Marvell `sky2`; e i driver Ethernet USB più comuni, come ASIX, `r8152`, CDC Ethernet/NCM e RNDIS.

Il supporto Wi-Fi include Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` e `ath12k`; Broadcom `brcmfmac`, `brcmsmac` e `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` e `rtw89`; oltre a diversi driver meno recenti per Marvell, Intersil, ZyDAS e altri produttori.

MiniOS aggiunge anche moduli DKMS per l'hardware non supportato adeguatamente dal kernel standard. L'attuale set di moduli amd64 include driver Wi-Fi USB Realtek aggiuntivi per RTL8188EU, RTL8814AU, RTL8811/RTL8821AU e adattatori RTL88xxAU correlati, oltre al driver Broadcom STA `wl`.

Il set di firmware include pacchetti firmware Debian per l'hardware di rete più comune di Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium e altri produttori.
La disponibilità effettiva dipende comunque dalla release MiniOS, dall'architettura e dal kernel selezionato.

Per il normale uso della rete dopo l'avvio, MiniOS usa NetworkManager. Se un adattatore non viene rilevato, modificare le impostazioni di NetworkManager non fornirà il driver del kernel o il firmware mancante. Vedi [Configurazione della rete](/using-minios/Networking) per il normale utilizzo della rete.

## Archiviazione

Per l’avvio live di MiniOS, il controller di archiviazione è importante in due fasi: il firmware deve poter avviare il bootloader e l’initramfs MiniOS deve poi poter individuare il dispositivo che contiene l’albero `minios/` dei dati.

MiniOS include intenzionalmente solo alcuni driver di archiviazione nel proprio initramfs.
Le versioni attuali includono sempre il supporto per IDE/PATA/SATA, NVMe, SD/MMC, archiviazione di massa USB/UAS e archiviazione Hyper-V. Standard, Toolbox e Ultra aggiungono anche al proprio initramfs il supporto per VirtIO block/SCSI e VMware PVSCSI; Flux no.

L’albero completo dei moduli del kernel contiene altri driver di archiviazione, non disponibili durante l’individuazione iniziale delle sorgenti MiniOS. Se viene visualizzato il menu di avvio ma MiniOS non trova i propri moduli, consulta [Individuazione dei sistemi nell’initrd](/reference/boot-process/System-Discovery).

## Macchine virtuali

MiniOS supporta l’hardware virtuale più comune utilizzato da VirtualBox, VMware, QEMU/KVM e Hyper-V. Per i supporti di avvio e i dischi di destinazione dell’installazione, è preferibile usare un controller **IDE o SATA** quando disponibile nell’hypervisor. Questi controller offrono il comportamento più prevedibile durante le prime fasi di avvio e l’installazione.

Il kernel Debian 6.12 attuale include già i principali driver per l’hardware guest:

| Hypervisor | Driver inclusi nel kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | Driver VirtIO per block, rete, grafica, input, balloon, SCSI, audio e funzioni correlate |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`e supporto input Hyper-V |

Questi driver del kernel sono sufficienti per il funzionamento di base della macchina guest. I servizi guest aggiuntivi offrono l’integrazione con l’host, ad esempio la gestione automatica del display, l’arresto corretto, la condivisione del filesystem e la comunicazione tra host e guest.

Toolbox e Ultra includono `open-vm-tools` e `open-vm-tools-desktop` per VMware, `qemu-guest-agent` per QEMU/KVM e `hyperv-daemons` per Hyper-V. Nelle suite supportate, comprese le immagini Trixie attuali, includono anche `virtualbox-guest-utils` e `virtualbox-guest-x11`. Flux e Standard non includono questi pacchetti di servizi guest per impostazione predefinita.

Consulta [Virtualizzazione](/maintenance-and-recovery/Virtualization) e [Pacchetti ed edizioni](/reference/Package-and-Edition-Contents) per informazioni sul software specifico di ciascuna edizione.

## Prova il computer prima di farci affidamento

1. Avvia l’immagine MiniOS esatta che intendi utilizzare.
2. Usa la modalità **Avviare MiniOS** predefinita per i test normali oppure **Avviare senza salvare** se non vuoi assolutamente aprire o creare una sessione persistente.
3. Verifica la grafica, la tastiera e i dispositivi di puntamento, l’audio, la rete cablata e wireless, i dispositivi di archiviazione necessari e la sospensione e ripresa, se intendi utilizzarle.
4. Se intendi usare la persistenza, apporta una piccola modifica di prova, riavvia e verifica che sia stata attivata la sessione prevista e che la modifica sia stata mantenuta.
5. Solo allora affidati alla macchina per attività importanti o esegui operazioni distruttive sui dischi.

In caso di problemi, determina innanzitutto se si verificano prima del menu di avvio, durante l’individuazione delle sorgenti MiniOS o dopo l’avvio del sistema operativo.
Questa distinzione permette in genere di capire se occorre esaminare il firmware, l’initramfs o il normale supporto hardware di Linux.
