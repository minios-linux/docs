---
updated: 2026-08-26
---

# Guia de compatibilidade de hardware

O suporte a hardware depende da versão e da imagem do MiniOS: a distribuição base,
kernel, firmware, módulos incluídos e edição são fatores importantes. Verifique a descrição
da versão da imagem que você baixou e teste uma sessão live nova antes de alterar discos
ou depender da máquina para trabalhos persistentes.

## Requisitos do sistema

As imagens publicadas do MiniOS para PC são voltadas para a arquitetura **amd64** (x86 64 bits),
a menos que a descrição da versão indique o contrário. As necessidades de recursos variam
de acordo com a imagem, edição, ambiente de desktop, aplicativos e modo de inicialização:

- A CPU deve ser compatível com a arquitetura da imagem e o modo de firmware selecionado.
- A RAM deve ser suficiente para a edição escolhida e a carga de trabalho. Modos `toram`
  exigem memória adicional para os dados copiados da imagem.
- A mídia de boot precisa ter espaço suficiente para a imagem baixada. Persistência, dados do usuário
e uma instalação nativa exigem armazenamento gravável adicional.
- Os requisitos gráficos dependem do desktop e dos aplicativos presentes na edição selecionada.

Gravar uma imagem em um dispositivo maior não cria armazenamento persistente automaticamente.
Consulte [Modos de boot](/configuration/Boot-Modes.md) para o guia oficial sobre o comportamento
do boot live e [Início rápido](/installation/Quick-Start.md) para preparação da mídia.

## Compatibilidade de componentes

### Processadores

A compatibilidade depende da arquitetura e do kernel fornecidos na imagem selecionada. Verifique as notas de lançamento ao utilizar um processador recente ou recursos de CPU que exijam suporte de kernel mais novo.

### Gráficos

O suporte gráfico depende do driver do kernel, firmware e stack gráfico em espaço de usuário presentes na imagem. Uma placa pode fornecer saída básica de vídeo sem suportar aceleração por hardware ou todos os conectores. Alguns hardwares NVIDIA podem exigir um driver proprietário que não está incluído em determinada imagem.

### Rede

O suporte a Ethernet e Wi-Fi depende do controlador, driver do kernel e firmware incluídos na imagem. Teste a rede a partir de uma sessão nova. Para Wi-Fi, verifique também se o dispositivo precisa de firmware ou de um driver externo que não esteja presente nessa versão.

### Armazenamento

Dispositivos USB, SATA, NVMe, IDE e SD/MMC funcionam apenas quando a imagem selecionada possui um driver para o controlador e o kernel reconhece o dispositivo. A varredura do initrd não torna um controlador não suportado compatível. Consulte [Descoberta do sistema pelo initrd](/configuration/Initrd-System-Discovery.md) para o comportamento exato de busca da fonte live.

O modo live e o modo nativo têm caminhos de boot diferentes. O modo live descobre a árvore de dados do MiniOS e monta módulos somente leitura no início do espaço de usuário; o modo nativo inicializa um root instalado convencional. Veja [Carregamento de módulos no initrd](/configuration/Initrd-Module-Loading.md) para detalhes sobre módulos no live e [Instalando o MiniOS](/installation/Installing-MiniOS.md) para a distinção de layout.

### Virtualização

O MiniOS pode ser executado como máquina virtual quando a imagem selecionada inclui drivers para os dispositivos de CPU, armazenamento, rede e vídeo configurados na VM. O suporte não é garantido para todos os hipervisores ou modelos de controlador. É necessário conferir o suporte a VirtIO, VMware, Hyper-V e IDE ou SATA emulados de acordo com a versão e testar com a configuração específica da VM.

Agentes de convidado e ferramentas de integração com desktop também variam conforme a edição e a imagem. Consulte a [lista de pacotes](/administration/Packages.md) e o [guia de virtualização](/administration/Virtualization.md) antes de assumir que compartilhamento de área de transferência, resolução dinâmica, desligamento limpo ou comunicação com o host estão disponíveis.
