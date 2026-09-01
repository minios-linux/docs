---
updated: 2026-08-31
---

# Compatibilidade de hardware

MiniOS foi projetado para rodar em diferentes computadores x86, em vez de ficar restrito a uma única máquina. O teste de compatibilidade mais confiável é inicializar a imagem real do MiniOS no hardware de destino e verificar os dispositivos que você pretende utilizar.

O suporte a hardware depende da imagem selecionada: sua arquitetura, distribuição base, kernel, firmware, drivers, ambiente gráfico e edição são fatores importantes. Uma imagem MiniOS mais recente ou diferente pode oferecer suporte a hardware que uma versão mais antiga não suporta.

## Arquitetura

MiniOS oferece suporte tanto para sistemas x86 de 64 bits quanto de 32 bits:

| Arquitetura da imagem | Use para |
|---|---|
| **amd64** | Computadores x86 de 64 bits |
| **i386** | Computadores x86 de 32 bits suportados |

Utilize a arquitetura informada no nome da imagem e na descrição da versão. A disponibilidade de imagens de 32 bits depende da versão do MiniOS e da distribuição base.

## Firmware e boot

As imagens para PC do MiniOS podem inicializar tanto via BIOS legado quanto UEFI, desde que os arquivos de boot necessários estejam presentes na imagem selecionada. As implementações de firmware variam bastante, então o mesmo dispositivo USB pode aparecer de forma diferente no menu de boot em computadores distintos.

As imagens atuais amd64 do MiniOS utilizam o kernel Debian e componentes EFI do Debian.
Por isso, oferecem suporte ao **Secure Boot** em sistemas amd64.

As imagens i386 de 32 bits usam um kernel compilado pelo MiniOS, pois o Debian não publica mais pacotes de kernel de 32 bits. Esse kernel é mantido idêntico ao kernel correspondente do Debian, mas é compilado pelo MiniOS e não faz parte da cadeia de boot assinada do Debian. Portanto, **o Secure Boot não é suportado por imagens i386 do MiniOS**.

## Memória

A quantidade mínima recomendada de memória depende da edição:

| Edição | RAM mínima recomendada |
|---|---:|
| **Flux** | 512 MB |
| **Standard** | 756 MB |
| **Toolbox** | 756 MB |
| **Ultra** | 756 MB |

Esses valores são para uso normal a partir do meio de boot. Aplicativos específicos podem exigir mais memória.

**Executar a partir de RAM** requer memória adicional, pois os dados de MiniOS são copiados para RAM junto com o sistema em execução e os aplicativos. Imagens maiores, portanto, exigem consideravelmente mais memória nesse modo.

Consulte [Modos de boot](/using-minios/Boot-Modes) antes de usar **Executar a partir de RAM** em um computador com pouca memória.

## Gráficos

As imagens amd64 atuais do MiniOS utilizam a pilha gráfica do Debian com Xorg e Mesa.
O kernel inclui os drivers Intel `i915` e `xe`, AMD `amdgpu` e `radeon`, além do driver open source NVIDIA `nouveau`.

O Xorg inclui seu driver genérico `modesetting` junto com drivers Intel, AMD/ATI, Radeon, Nouveau, VESA e framebuffer. O Mesa fornece a pilha normal de aceleração 3D usada por Intel, AMD e drivers open source suportados.

Imagens baseadas no Debian do MiniOS instalam os pacotes de firmware do Debian junto com pacotes de firmware específicos dos fabricantes. A imagem Trixie Standard atual inclui `firmware-amd-graphics` e `firmware-misc-nonfree`; imagens baseadas no Ubuntu usam `linux-firmware` em vez disso.

As listas de pacotes mantidas do MiniOS não incluem o driver proprietário de kernel da NVIDIA. Assim, o hardware NVIDIA utiliza por padrão o driver `nouveau` incluído. Hardware ou recursos que exigem especificamente o driver proprietário da NVIDIA precisam ser adicionados separadamente.

Gráficos virtuais também são suportados por drivers de kernel e Xorg para dispositivos comuns VMware, QXL, Bochs e Hyper-V.

## Hardware de rede

As imagens amd64 atuais do MiniOS utilizam o kernel Debian com seu conjunto normal de drivers de rede. O kernel 6.12 usado nas imagens Trixie atuais inclui drivers para os hardwares Ethernet e Wi-Fi mais comuns da Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell e outros.

Entre os drivers Ethernet comuns estão Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` e `ixgbe`; Realtek `8139` e `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x` e `bnxt`; Atheros `atl*` e `alx`; Marvell `sky2`; além de drivers USB Ethernet comuns como ASIX, `r8152`, CDC Ethernet/NCM e RNDIS.

O suporte a Wi-Fi inclui Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` e `ath12k`; Broadcom `brcmfmac`, `brcmsmac` e `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` e `rtw89`; além de vários drivers antigos da Marvell, Intersil, ZyDAS e outros.

O MiniOS também adiciona módulos DKMS para hardwares não suficientemente suportados pelo kernel padrão. O conjunto atual de módulos amd64 inclui drivers Realtek USB Wi-Fi adicionais para RTL8188EU, RTL8814AU, RTL8811/RTL8821AU e adaptadores relacionados RTL88xxAU, além do driver Broadcom STA `wl`.

O conjunto de firmware inclui pacotes de firmware Debian para Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium e outros hardwares de rede comuns.
A disponibilidade exata ainda depende da versão do MiniOS, arquitetura e kernel selecionado.

Para uso de rede comum após o boot, o MiniOS utiliza o NetworkManager. Se um adaptador não for detectado, alterar as configurações do NetworkManager não irá fornecer um driver de kernel ou firmware ausente. Consulte [Configuração de rede](/using-minios/Networking) para uso normal da rede.

## Armazenamento

Para um boot live do MiniOS, o controlador de armazenamento é importante em dois momentos: o firmware deve conseguir iniciar o bootloader, e o initramfs do MiniOS deve então conseguir acessar o dispositivo que contém a árvore de dados `minios/`.

O MiniOS inclui intencionalmente apenas drivers de armazenamento selecionados no seu initramfs.
Os builders atuais sempre incluem suporte a IDE/PATA/SATA, NVMe, SD/MMC, armazenamento USB/UAS e Hyper-V. As edições Standard, Toolbox e Ultra também adicionam suporte a VirtIO block/SCSI e VMware PVSCSI ao initramfs; a Flux não inclui.

A árvore completa de módulos do kernel contém drivers de armazenamento adicionais que não estão disponíveis durante a descoberta inicial de fontes do MiniOS. Se o menu de boot aparecer, mas o MiniOS não conseguir localizar seus módulos, consulte [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery).

## Máquinas virtuais

O MiniOS oferece suporte ao hardware virtual comum utilizado pelo VirtualBox, VMware, QEMU/KVM e Hyper-V. Para mídias de boot e discos de destino de instalação, prefira um **controlador IDE ou SATA** quando o hipervisor oferecer essa opção. Esses controladores proporcionam o comportamento mais previsível durante o boot inicial e a instalação.

O kernel Debian 6.12 atual já inclui os principais drivers de hardware para convidados:

| Hipervisor | Drivers incluídos no kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO block, network, graphics, input, balloon, SCSI, sound e drivers relacionados |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm` e suporte a entrada Hyper-V |

Esses drivers de kernel são suficientes para a operação básica do sistema convidado. Serviços adicionais para convidados fornecem integração com o host, como ajuste automático de tela, desligamento limpo, compartilhamento de sistema de arquivos e comunicação host/convidado.

As edições Toolbox e Ultra incluem `open-vm-tools` e `open-vm-tools-desktop` para VMware, `qemu-guest-agent` para QEMU/KVM e `hyperv-daemons` para Hyper-V. Em suítes suportadas, incluindo as imagens Trixie atuais, também incluem `virtualbox-guest-utils` e `virtualbox-guest-x11`. As edições Flux e Standard não incluem esses pacotes de serviços para convidados por padrão.

Consulte [Virtualização](/maintenance-and-recovery/Virtualization) e [Pacotes e edições](/reference/Package-and-Edition-Contents) para softwares específicos de cada edição.

## Teste um computador antes de confiar nele

1. Inicialize exatamente a imagem do MiniOS que você pretende usar.
2. Utilize o modo padrão **Iniciar MiniOS** para testes normais, ou **Iniciar sem salvar** quando não quiser abrir ou criar uma sessão persistente.
3. Verifique gráficos, teclado e dispositivos apontadores, som, rede cabeada e sem fio, os dispositivos de armazenamento necessários e suspensão/retomada, caso pretenda usar.
4. Se for utilizar persistência, faça uma pequena alteração de teste, reinicie e confirme que a sessão esperada foi ativada e a alteração permaneceu.
5. Só então confie na máquina para trabalhos importantes ou realize operações destrutivas no disco.

Se algo falhar, primeiro determine se o problema ocorre antes do menu de boot, durante a descoberta de fontes do MiniOS ou após o sistema operacional ter iniciado.
Essa distinção geralmente indica se é preciso investigar firmware, initramfs ou o suporte normal de hardware do Linux.
