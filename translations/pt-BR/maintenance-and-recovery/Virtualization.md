---
updated: 2026-08-31
---

# Virtualização

MiniOS pode ser executado como sistema convidado no VirtualBox, VMware, QEMU/KVM e Hyper-V.
O Toolbox e o Ultra também incluem software para executar máquinas virtuais QEMU/KVM diretamente no MiniOS.

Esta página documenta o comportamento de virtualização específico do MiniOS. Para criar VMs comuns e configurar hipervisores, consulte a documentação do hipervisor.

## Executar MiniOS como sistema convidado

### Configuração recomendada da VM

Para garantir a maior compatibilidade, conecte a mídia de inicialização do MiniOS e qualquer disco virtual que contenha uma instalação live do MiniOS por meio de um **controlador IDE ou SATA**. Essa recomendação se aplica ao VirtualBox, VMware, QEMU/KVM e Hyper-V sempre que esse tipo de controlador estiver disponível.

Outros controladores de armazenamento virtual podem funcionar, mas o MiniOS precisa conseguir acessar sua origem live durante a etapa do initramfs, antes que a árvore completa de módulos do kernel de`01-kernel-*.sb` esteja disponível.

### Suporte a armazenamento na inicialização

O MiniOS inclui intencionalmente apenas um conjunto selecionado de drivers de armazenamento no initramfs. Os compiladores atuais do Dracut e do LiveKit seguem a mesma política:

| Interface de armazenamento | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Sim | Sim |
| NVMe | Sim | Sim |
| Armazenamento em massa USB / UAS | Sim | Sim |
| Armazenamento Hyper-V (`hv_storvsc`) | Sim | Sim |
| VirtIO block / SCSI | Não | Sim |
| VMware PVSCSI | Não | Sim |
| Frontend de bloco Xen | Não | Não |

Drivers SAS/RAID comuns, como `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` e `aacraid` estão presentes na árvore completa de módulos do kernel, mas não são incluídos no initramfs do MiniOS.

Essa distinção só importa antes que a origem live do MiniOS seja encontrada e o sistema completo seja iniciado. Um hardware que funciona normalmente após a inicialização não é necessariamente adequado para armazenar a própria origem live.

Por esse motivo, **IDE ou SATA continua sendo a opção recomendada de armazenamento para VMs**, mesmo nas edições cujo initramfs também inclui suporte a VirtIO ou VMware PVSCSI.

### Integração com o sistema convidado

O kernel já fornece os drivers básicos de hardware virtual usados pelos principais hypervisors. Toolbox e Ultra adicionam pacotes de serviços para o sistema convidado, oferecendo uma integração mais completa:

| Plataforma | Integração com o sistema convidado incluída no Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` nas versões-base compatíveis |
| Hyper-V | `hyperv-daemons` |

O kernel Debian atual usado pelo amd64 MiniOS também inclui drivers para sistemas convidados VirtualBox, drivers gráficos e de rede VMware, VirtIO e drivers Hyper-V. Os pacotes de serviços para o sistema convidado adicionam recursos de integração; eles não são necessários para iniciar uma VM básica.

### Gerenciamento de resolução no Xfce

MiniOS fornece `/usr/bin/minios-virtual-resolution` por meio de `minios-tools` e o inicia na sessão de inicialização automática do Xfce. Ele detecta máquinas virtuais comuns e usa o XRandR somente quando as ferramentas ativas do sistema convidado não estão gerenciando a tela.

Sem uma substituição, a resolução solicitada é `1280x800`. Use `virtres=WIDTHxHEIGHT` para solicitar outra resolução ou `novirtres` para desativar esse ajuste de MiniOS.
Após um ajuste bem-sucedido, o utilitário cria `~/.config/minios/virtual-resolution-configured`. Em uma sessão persistente, o ajuste automático não será aplicado novamente até que esse marcador seja removido.

## Usar MiniOS como host de virtualização

Toolbox e Ultra incluem a stack QEMU/KVM usada para máquinas virtuais locais:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

O Ultra também inclui sua stack Docker e `lazydocker` para cargas de trabalho em contêineres.

Esta documentação não descreve a instalação de produtos de virtualização que não fazem parte de uma edição.

## Veja também

- [Compatibilidade de hardware](/getting-started/Hardware-Compatibility)
- [Descoberta do sistema no initrd](/reference/boot-process/System-Discovery)
- [Parâmetros de inicialização](/reference/Boot-Parameters)
- [Pacotes e edições](/reference/Package-and-Edition-Contents)
