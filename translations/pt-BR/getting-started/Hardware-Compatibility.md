---
updated: 2026-10-15
---

# Compatibilidade de hardware

MiniOS foi projetado para funcionar em diferentes computadores x86, sem ficar vinculado a uma máquina específica. Por isso, o teste de compatibilidade mais confiável é inicializar a imagem MiniOS no hardware de destino e verificar os dispositivos que você pretende usar.

O suporte ao hardware depende da imagem selecionada: arquitetura, distribuição base, kernel, firmware, drivers, ambiente gráfico e edição são fatores importantes. Uma imagem MiniOS mais recente ou diferente pode oferecer suporte a hardwares incompatíveis com uma versão anterior.

## Arquitetura

MiniOS oferece suporte a sistemas x86 de 64 e 32 bits:

| Arquitetura da imagem | Uso |
|---|---|
| **amd64** | Computadores x86 de 64 bits |
| **i386** | Computadores x86 compatíveis de 32 bits |

Use a arquitetura indicada no nome da imagem e na descrição da versão. A disponibilidade de imagens de 32 bits depende da versão MiniOS e da distribuição base.

## Firmware e inicialização

Imagens de PC MiniOS podem inicializar por meio de BIOS legado e UEFI quando os arquivos de inicialização necessários estão presentes na imagem selecionada. As implementações de firmware variam bastante; por isso, o mesmo dispositivo USB pode aparecer de maneiras diferentes no menu de inicialização de computadores distintos.

O Secure Boot depende de toda a cadeia do kernel e EFI da imagem, não apenas da arquitetura. Compilações Debian/Ubuntu amd64 que usam o kernel de distribuição assinado correspondente e componentes EFI podem oferecer suporte ao Secure Boot. Um kernel personalizado ou não assinado fornecido por MiniOS não passa a ser confiável só porque há arquivos EFI assinados. DynBlk e o driver externo AUFS-NG não são assinados: o Secure Boot desativa sessões DynBlk/VMDK e normalmente deixa OverlayFS para a composição de módulos.

As imagens i386 atuais usam um kernel compilado pelo MiniOS quando a base selecionada já não fornece um kernel de 32 bits adequado. Os kernels MiniOS são compilações separadas, com integração MiniOS, e não garantem ser binários Debian idênticos byte a byte nem fazem parte da cadeia de assinatura do Debian.**Essas imagens i386 não oferecem suporte ao Secure Boot.** A arquitetura do firmware é um fator independente de compatibilidade de inicialização.

## Memória

Os requisitos de memória dependem da versão, do ambiente gráfico, dos aplicativos e do tipo de sessão. Em geral, o Flux exige menos memória que as edições completas do XFCE; um navegador, uma suíte de escritório, uma máquina virtual ou um snapshot grande de persistência pode exigir muito mais do que apenas o ambiente gráfico. Consulte os requisitos informados para a versão e teste a carga de trabalho pretendida, em vez de considerar suficiente para todas as imagens atuais um valor antigo de RAM referente a toda uma edição.

**Executar a partir da RAM** precisa de memória adicional porque os dados de MiniOS são copiados para RAM junto com o sistema e os aplicativos em execução. Por isso, imagens maiores exigem muito mais memória nesse modo.

Consulte [Modos de inicialização](/using-minios/Boot-Modes) antes de usar **Executar a partir da RAM** em um computador com pouca memória.

## Gráficos

As imagens amd64 atuais MiniOS usam a pilha gráfica do Debian com Xorg e Mesa.
Dependendo do kernel selecionado, seus módulos oferecem suporte a `i915` e `xe`, `amdgpu` e `radeon` e ao hardware NVIDIA de código aberto `nouveau`.

O Xorg inclui seu driver genérico `modesetting` junto com drivers Intel, AMD/ATI, Radeon, Nouveau, VESA e framebuffer. O Mesa fornece a pilha padrão de aceleração 3D usada pela Intel, AMD e por drivers de código aberto compatíveis.

As imagens baseadas no Debian MiniOS solicitam coleções de firmware do Debian junto com pacotes específicos de fabricantes, incluindo `firmware-intel-graphics` no Trixie e no Excalibur. O firmware efetivamente instalado depende da disponibilidade nos repositórios e da imagem concluída. As imagens baseadas no Ubuntu usam `linux-firmware` no lugar.

As listas de pacotes mantidas do MiniOS não incluem o driver proprietário de kernel da NVIDIA. Portanto, o hardware NVIDIA usa por padrão o driver `nouveau` incluído. Hardware ou recursos que exigem especificamente o driver proprietário da NVIDIA precisam que ele seja adicionado separadamente.

Os drivers de kernel e Xorg também oferecem suporte a gráficos virtuais em dispositivos VMware, QXL, Bochs e Hyper-V comuns.

### Escalonamento e gerenciamento de janelas no XFCE

As imagens XFCE do Debian 13 e do Devuan Excalibur usam configurações e pacotes de desktop adaptados ao MiniOS, os plugins de lista de tarefas e Mostrar área de trabalho do MiniOS e `xfwm4-gl` no lugar de `xfwm4`. Configurações de tela oferece escalonamento automático da interface ou opções manuais de 100–200%, em incrementos de 25%, com pré-visualização temporizada e reversão. Textos, controles, decorações e cursores temáticos acompanham o escalonamento da interface; a escala em pixels da saída e a resolução do monitor são controles independentes. As opções manuais salvas substituem o modo automático.

`xfwm4-gl` usa OpenGL por padrão, com XRender como alternativa. Ajustes do gerenciador de janelas permitem configurar desfoque, animações, desativação da composição em tela cheia e a aparência do Alt+Tab. As miniaturas do Alt+Tab e da barra de tarefas podem escurecer ou ocultar outras janelas para espiar uma janela sem ativá-la; imagens em cache de janelas minimizadas são usadas quando disponíveis. Os efeitos de esmaecimento/escala e a espiada funcionam com ambos os renderizadores, enquanto o desfoque e a Lâmpada Mágica exigem OpenGL. Os demais conjuntos mantêm os componentes XFCE da distribuição.

### Pacotes opcionais para MateBook E

O suporte ao Huawei MateBook E 2023 está disponível por meio de pacotes Linux 6.12 que podem ser instalados separadamente; não presuma que eles estejam incluídos na imagem de lançamento. `matebook-e-dsi-dkms` fornece um backport experimental para a tela interna: faixas coloridas residuais e suspensão/retomada não validadas continuam sendo limitações. A integração da câmera usa `matebook-e-cameras-dkms` e o pacote de espaço de usuário amd64/systemd `matebook-e-cameras`. Os pacotes da câmera não instalam o driver experimental da caneta.

## Hardware de rede

As imagens amd64 atuais MiniOS usam o kernel do Debian com seu conjunto padrão de drivers de rede. O kernel 6.12 usado pelas imagens atuais do Trixie inclui drivers para hardware Ethernet e Wi-Fi comum da Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell e outros fabricantes.

Entre os drivers Ethernet comuns estão Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` e `ixgbe`; Realtek `8139` e `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x` e `bnxt`; Atheros `atl*` e `alx`; Marvell `sky2`; e drivers comuns de Ethernet USB, como ASIX, `r8152`, CDC Ethernet/NCM e RNDIS.

O suporte a Wi-Fi inclui Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` e `ath12k`; Broadcom `brcmfmac`, `brcmsmac` e `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` e `rtw89`; além de vários drivers antigos da Marvell, Intersil, ZyDAS e outros.

MiniOS também adiciona módulos DKMS para hardware que não tem suporte adequado no kernel padrão. O conjunto atual de módulos amd64 inclui drivers adicionais de Wi-Fi USB Realtek para RTL8188EU, RTL8814AU, RTL8811/RTL8821AU e adaptadores RTL88xxAU relacionados, além do driver Broadcom STA `wl`.

O conjunto de firmware inclui pacotes de firmware do Debian para hardware de rede comum da Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium e outros fabricantes.
A disponibilidade exata ainda depende da versão MiniOS, da arquitetura e do kernel selecionado.

Para o uso normal da rede após a inicialização, MiniOS usa o NetworkManager. Se um adaptador não for detectado, alterar as configurações do NetworkManager não fornecerá um driver de kernel ou firmware ausente. Consulte [Configuração de rede](/using-minios/Networking) para o uso normal da rede.

## Armazenamento

Para uma inicialização em tempo real MiniOS, o controlador de armazenamento é importante em dois momentos: o firmware precisa conseguir iniciar o carregador de inicialização, e o initramfs MiniOS precisa conseguir acessar o dispositivo que contém a`minios/` árvore de dados.

MiniOS inclui intencionalmente apenas drivers de armazenamento selecionados no initramfs.
Os builders atuais sempre incluem suporte a IDE/PATA/SATA, NVMe, SD/MMC, armazenamento USB/UAS e armazenamento Hyper-V. Standard, Toolbox e Ultra também adicionam suporte a VirtIO block/SCSI e VMware PVSCSI ao initramfs; Flux não.

A árvore completa de módulos do kernel contém drivers de armazenamento adicionais que não estão disponíveis durante a descoberta inicial de origem MiniOS. Se o menu de inicialização aparecer, mas MiniOS não encontrar seus módulos, consulte [Descoberta de sistemas no initrd](/reference/boot-process/System-Discovery).

## Máquinas virtuais

MiniOS oferece suporte ao hardware virtual comum usado por VirtualBox, VMware, QEMU/KVM e Hyper-V. Para mídias de inicialização e discos de destino da instalação, prefira um controlador **IDE ou SATA** quando o hipervisor oferecer essa opção. Esses controladores proporcionam o comportamento mais previsível durante a inicialização e a instalação.

O kernel Debian 6.12 atual já inclui os principais drivers de hardware para máquinas virtuais:

| Hipervisor | Drivers incluídos no kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | Drivers VirtIO para bloco, rede, gráficos, entrada, balloon, SCSI, som e outros |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm` e suporte a entrada do Hyper-V |

Esses drivers do kernel são suficientes para o funcionamento básico da máquina virtual. Serviços adicionais para convidados oferecem integração com o host, como ajuste automático de vídeo, desligamento adequado, compartilhamento de sistemas de arquivos e comunicação entre host e máquina virtual.

Toolbox e Ultra incluem `open-vm-tools` e `open-vm-tools-desktop` para VMware, `qemu-guest-agent` para QEMU/KVM e `hyperv-daemons` para Hyper-V. Nas suítes compatíveis, incluindo as imagens Trixie atuais, também incluem `virtualbox-guest-utils` e `virtualbox-guest-x11`. Flux e Standard não incluem esses pacotes de serviços para convidados por padrão.

Consulte [Virtualização](/maintenance-and-recovery/Virtualization) e [Pacotes e edições](/reference/Package-and-Edition-Contents) para ver o software específico de cada edição.

## Teste o computador antes de confiar nele

1. Inicialize a imagem MiniOS exata que pretende usar.
2. Use o modo padrão **Iniciar MiniOS** para testes normais ou **Iniciar sem salvar** quando não quiser abrir nem criar uma sessão persistente.
3. Verifique os gráficos, o teclado e os dispositivos apontadores, o som, a rede com e sem fio, os dispositivos de armazenamento necessários e a suspensão e retomada, se pretende usar esses recursos.
4. Se pretende usar persistência, faça uma pequena alteração de teste, reinicie e confirme que a sessão esperada foi ativada e que a alteração foi mantida.
5. Só então confie o computador a tarefas importantes ou execute operações destrutivas no disco.

Se algo falhar, determine primeiro se o problema ocorre antes do menu de inicialização, durante a descoberta de origem MiniOS ou depois que o sistema operacional é iniciado.
Essa distinção geralmente indica se é preciso investigar o firmware, o initramfs ou o suporte de hardware do Linux em funcionamento normal.
