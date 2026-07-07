# Guia de Compatibilidade de Hardware

Este guia fornece informações essenciais sobre a compatibilidade de hardware do MiniOS. O sistema é baseado no Debian 13 "Trixie" com kernel Linux de Suporte de Longo Prazo (LTS), garantindo ampla compatibilidade com hardware.

## Requisitos do Sistema

O MiniOS foi desenvolvido para a arquitetura **amd64** (64 bits). Os requisitos variam conforme a edição:

**Para a Variante Standard:**
- **CPU:** Processador 64 bits de 1 GHz
- **RAM:** 1 GB mínimo (2 GB recomendado)
- **Armazenamento:** 2 GB para rodar o sistema (4 GB+ recomendado para armazenamento de dados)
- **Gráficos:** Adaptador de vídeo compatível com VGA

**Para a Variante Toolbox:**
- **CPU:** Processador 64 bits de 1,2 GHz
- **RAM:** 2 GB mínimo (4 GB recomendado)
- **Armazenamento:** 2 GB para rodar o sistema (8 GB+ recomendado para armazenamento de dados)
- **Gráficos:** Placa de vídeo com suporte a aceleração por hardware

**Para a Variante Ultra:**
- **CPU:** Processador 64 bits dual-core de 1,5 GHz
- **RAM:** 4 GB mínimo (8 GB recomendado)
- **Armazenamento:** 2 GB para rodar o sistema (8 GB+ recomendado para armazenamento de dados)
- **Gráficos:** GPU moderna com aceleração por hardware

## Compatibilidade de Componentes

### Processadores

Uma ampla variedade de processadores x86 64 bits da Intel (Core i3/i5/i7/i9) e AMD (Ryzen 3/5/7/9) são suportados.

### Gráficos

- **Intel:** Gráficos integrados (UHD, Iris Xe, Arc) são bem suportados.
- **NVIDIA:** O driver open source Nouveau está incluído. Para placas modernas, recomenda-se instalar o driver proprietário para melhor desempenho.
- **AMD:** As placas modernas da série Radeon RX são totalmente suportadas pelo driver open source AMDGPU.

### Rede

- **Ethernet:** A maioria dos controladores cabeados da Intel, Realtek e Broadcom funcionam automaticamente.
- **Wi-Fi:** Uma grande variedade de adaptadores Wi-Fi é suportada por meio de firmwares incluídos e drivers DKMS compilados automaticamente, especialmente modelos comuns da Intel, Atheros e Realtek.

### Armazenamento

O MiniOS foi projetado para inicializar a partir de diversos dispositivos de armazenamento. Os scripts de inicialização do sistema escaneiam automaticamente todos os dispositivos de bloco disponíveis, garantindo compatibilidade com:

- **Unidades USB:** Todas as gerações de USB são suportadas.
- **Unidades SATA/IDE:** Todos os HDs e SSDs internos padrão.
- **Unidades NVMe:** Suporte total para SSDs NVMe modernos.
- **Cartões SD/MMC:** Suportados se o leitor de cartões for reconhecido pelo kernel.

### Virtualização

O MiniOS é totalmente otimizado para uso como sistema operacional convidado em todos os principais ambientes de virtualização. O processo de build inclui todos os drivers necessários no ramdisk inicial (`initrd`), garantindo o máximo desempenho desde a primeira inicialização.

- **Drivers de Alto Desempenho:** Suporte nativo para controladores de armazenamento paravirtualizados, incluindo **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI** e **Hyper-V Storvsc**. Isso permite desempenho de I/O de disco próximo ao nativo.
- **Ampla Compatibilidade:** O sistema também pode inicializar a partir de controladores **IDE** e **SATA** emulados, garantindo compatibilidade com qualquer configuração de hipervisor.
- **Ferramentas para Convidado:** Para integração avançada (como mouse sem fronteiras, compartilhamento de área de transferência e resolução dinâmica), as variantes `toolbox` e `ultra` incluem `open-vm-tools` (para VMware) e `hyperv-daemons` (para Hyper-V).

Para instruções detalhadas de configuração e ajustes específicos de cada plataforma, consulte o [Guia de Virtualização](/administration/Virtualization.md).
