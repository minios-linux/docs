---
updated: 2026-08-31
---

# Virtualização

MiniOS pode ser executado como convidado no VirtualBox, VMware, QEMU/KVM e Hyper-V.
Toolbox e Ultra também incluem softwares para executar máquinas virtuais QEMU/KVM a partir do próprio MiniOS.

Esta página documenta o comportamento de virtualização específico do MiniOS. Para criação comum de VMs e configurações do hipervisor, utilize a documentação do hipervisor.

## Executando o MiniOS como convidado

### Layout recomendado para VM

Para a maior compatibilidade, conecte a mídia de boot do MiniOS e qualquer disco virtual que irá conter uma instalação live do MiniOS por meio de um **controlador IDE ou SATA**. Esta recomendação se aplica ao VirtualBox, VMware, QEMU/KVM e Hyper-V sempre que esse tipo de controlador estiver disponível.

Outros controladores de armazenamento virtual podem funcionar, mas o MiniOS precisa conseguir acessar sua fonte live durante a fase do initramfs, antes que toda a árvore de módulos do kernel de `01-kernel-*.sb` esteja disponível.

### Suporte a armazenamento no início do boot

MiniOS carrega intencionalmente apenas um conjunto selecionado de drivers de armazenamento no initramfs. Os builders atuais do Dracut e LiveKit usam a mesma política:

| Interface de armazenamento | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Sim | Sim |
| NVMe | Sim | Sim |
| Armazenamento USB / UAS | Sim | Sim |
| Armazenamento Hyper-V (`hv_storvsc`) | Sim | Sim |
| VirtIO block / SCSI | Não | Sim |
| VMware PVSCSI | Não | Sim |
| Xen block frontend | Não | Não |

Drivers SAS/RAID comuns como `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` e `aacraid` estão presentes na árvore completa de módulos do kernel, mas não são incluídos no initramfs do MiniOS.

Essa distinção só importa antes que a fonte live do MiniOS tenha sido encontrada e o sistema completo tenha iniciado. Hardware que funciona normalmente após o boot não é necessariamente adequado para armazenar a própria fonte live.

Por esse motivo, **IDE ou SATA continuam sendo a escolha recomendada de armazenamento para VM**, mesmo para edições cujo initramfs também contém suporte a VirtIO ou VMware PVSCSI.

### Integração do convidado

O kernel já fornece os drivers básicos de hardware virtual usados pelos principais hipervisores. Toolbox e Ultra adicionam pacotes de serviços de convidado para integração mais avançada:

| Plataforma | Integração de convidado incluída no Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` em bases compatíveis |
| Hyper-V | `hyperv-daemons` |

O kernel Debian atual usado pelo amd64 MiniOS também inclui drivers de convidado para VirtualBox, drivers de vídeo/rede VMware, VirtIO e Hyper-V. Os pacotes de serviços de convidado adicionam recursos de integração; eles não são o que torna o boot básico da VM possível.

### Gerenciamento de resolução no Xfce

MiniOS fornece `/usr/bin/minios-virtual-resolution` até `minios-tools` e o inicia a partir da sessão de autostart do Xfce. Ele detecta máquinas virtuais comuns e utiliza o XRandR apenas quando ferramentas de convidado ativas ainda não estão gerenciando o display.

Sem uma substituição, a resolução solicitada é `1280x800`. Use `virtres=WIDTHxHEIGHT` para solicitar outra resolução ou `novirtres` para desativar esse ajuste de MiniOS.
Após um ajuste bem-sucedido, o utilitário cria `~/.config/minios/virtual-resolution-configured`. Em uma sessão persistente, ele não aplicará o ajuste automático novamente até que esse marcador seja removido.

## Usando o MiniOS como host de virtualização

Toolbox e Ultra incluem o stack QEMU/KVM utilizado para máquinas virtuais locais:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra inclui ainda seu stack Docker e `lazydocker` para cargas de trabalho em containers.

Esta documentação não descreve a instalação de produtos de virtualização que não fazem parte de uma edição.

## Veja também

- [Compatibilidade de hardware](/getting-started/Hardware-Compatibility)
- [Descoberta do sistema no initrd](/reference/boot-process/System-Discovery)
- [Parâmetros de boot](/reference/Boot-Parameters)
- [Pacotes e edições](/reference/Package-and-Edition-Contents)
