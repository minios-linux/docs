---
updated: 2026-08-31
---

# Início rápido

Este guia leva você de uma imagem MiniOS baixada até um sistema em funcionamento. Ele cobre apenas as decisões necessárias para o primeiro uso; os guias vinculados explicam cada tópico em detalhes.

## 1. Baixe o MiniOS

Escolha a edição que melhor se adapta ao que você deseja fazer:

| Edição | Mais indicada para |
|---|---|
| **Standard** | **Recomendada para a maioria dos usuários e para a primeira experiência com MiniOS.** Um sistema minimalista com funcionalidades básicas e um desktop Xfce compacto e eficiente para uso diário. |
| **Toolbox** | Uma edição para administração de sistemas e diagnósticos, voltada para profissionais de TI e recuperação de sistemas. Inclui a Standard mais as ferramentas correspondentes de administração, recuperação, rede, teste de hardware, backup e acesso remoto. |
| **Ultra** | Um desktop completo com uma ampla variedade de aplicativos e ferramentas profissionais para criatividade e desenvolvimento. Inclui a Toolbox mais softwares de escritório, gráficos, vídeo, áudio, 3D, desenvolvimento e containers. |
| **Flux** | Uma edição Fluxbox ultraleve para uso mínimo de recursos e hardware antigo. Possui um conjunto reduzido de aplicativos e menos conveniências de desktop do que a Standard. **Não recomendada para iniciantes.** |

A disponibilidade exata de pacotes e ambientes gráficos depende da versão. Veja [Sobre MiniOS](/getting-started/About-MiniOS) para o modelo de edições e [Pacotes e edições](/reference/Package-and-Edition-Contents) para a seleção de pacotes mantida.

Baixe o ISO no [site do MiniOS](https://minios.dev), na página oficial de [Releases do GitHub](https://github.com/minios-linux/minios-live/releases) ou no [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verifique o download

Verifique o ISO antes de instalar. As versões do MiniOS fornecem um arquivo `.iso.sha256` correspondente; veja [Verificando downloads](/installing-minios/Verifying-Downloads) para comandos no Linux, macOS e Windows.

## 3. Instale MiniOS

Para MiniOS, gravar o sistema em mídia removível já é um método de instalação: o dispositivo resultante é um sistema MiniOS inicializável.

Escolha o método de acordo com o resultado desejado para o dispositivo:

| O que você deseja | Método | Resultado |
|---|---|---|
| Um pendrive normal que também inicializa o MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) no modo ISO padrão ou [Instalação baseada em arquivos](/installing-minios/Manual-File-Based-Installation) | Arquivos MiniOS e o bootloader ficam em um sistema de arquivos normal, permitindo o uso do pendrive para arquivos comuns |
| MiniOS junto com outras imagens ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy mantém sua partição de dados normal, suporta multiboot e MiniOS permite sessões persistentes nesse layout |
| Uma instalação portátil gerenciada de MiniOS | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) no modo **Live** | Cria uma instalação modular de MiniOS e pode configurar armazenamento persistente |
| Uma cópia exata, bloco a bloco, do ISO | [Rufus](/installing-minios/installation-tools/Rufus) no modo DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) ou [`dd`](/installing-minios/installation-tools/dd) | Reproduz o layout de blocos do ISO; simples e previsível, mas o dispositivo deixa de funcionar como um pendrive comum |

Para um pendrive portátil que você também deseja usar para armazenamento de arquivos, prefira Rufus no modo ISO, uma instalação baseada em arquivos, Ventoy ou uma instalação Live adequada feita pelo Instalador do MiniOS. A gravação de imagem bruta é útil quando uma cópia exata da imagem publicada é mais importante do que reutilizar o dispositivo como armazenamento geral.

::: danger Verifique o dispositivo de destino
A maioria dos métodos de instalação sobrescreve parte ou todos os dados do dispositivo selecionado.
Faça backup de tudo que for importante e verifique o modelo e a capacidade do dispositivo antes de começar.
:::

Veja [Instalando MiniOS](/installing-minios/Installation-Methods) para as diferenças entre gravação de imagem bruta, Ventoy, layouts baseados em arquivos e Instalador do MiniOS.

## 4. Inicie o MiniOS pela primeira vez

1. Reinicie o computador com o dispositivo MiniOS conectado.
2. Abra o menu de boot do firmware do computador e selecione esse dispositivo.
3. Mantenha a opção padrão **Start MiniOS** selecionada e inicie o sistema.
4. Verifique se gráficos, teclado, rede e os dispositivos de armazenamento necessários estão funcionando corretamente.

**Start MiniOS** é o modo de inicialização padrão. Ele utiliza seleção automática de persistência: MiniOS tenta retomar uma sessão padrão compatível e, caso não exista uma sessão utilizável, pode criar uma compatível se houver armazenamento gravável disponível. Se a persistência não puder ser ativada, MiniOS continua com uma camada temporária gravável e informa que as alterações não serão salvas.

Isso significa que o primeiro boot normal não exige criar uma sessão antecipadamente. Escolha **Iniciar sem salvar** apenas quando quiser deliberadamente uma inicialização temporária limpa, sem abrir ou criar uma sessão persistente.

Veja [Modos de boot](/using-minios/Boot-Modes) para outras opções de inicialização. Se o dispositivo não inicializar ou algum hardware importante não funcionar, consulte [Compatibilidade de hardware](/getting-started/Hardware-Compatibility) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## 5. Escolha outro comportamento de sessão quando necessário

Para uso portátil normal, continue usando a entrada padrão **Iniciar MiniOS**. Escolha um modo diferente apenas quando precisar de um resultado diferente:

| Opção de inicialização | Use quando | Resultado |
|---|---|---|
| **Iniciar MiniOS** (padrão) | Uso portátil normal | Retoma automaticamente uma sessão padrão compatível ou cria uma nova quando suportado |
| **Iniciar uma nova sessão** | Você deseja um espaço de trabalho adicional separado | Cria uma sessão persistente adicional numerada e mantém as sessões existentes inalteradas |
| **Escolher uma sessão salva** | Você deseja selecionar um dos vários espaços de trabalho existentes | Permite escolher uma sessão existente de forma interativa |
| **Iniciar sem salvar** | Você deseja uma inicialização temporária limpa sem persistência | Usa uma camada gravável temporária na RAM |
| **Executar a partir da RAM** | Você deseja copiar MiniOS para a RAM nesta inicialização | Executa a partir de uma cópia na RAM; trate as alterações como temporárias |

A persistência automática ainda requer armazenamento gravável adequado. Uma gravação ISO bruta, por si só, não prepara armazenamento persistente. Instalações baseadas em arquivos, layouts Ventoy e instalações Live feitas pelo [Instalador do MiniOS](/installing-minios/MiniOS-Installer) podem fornecer layouts graváveis para uso persistente do MiniOS. Sessões existentes podem ser inspecionadas e gerenciadas em [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

Antes de confiar na persistência, reinicie uma vez e confirme que MiniOS relata a sessão esperada como ativa e que uma alteração de teste persiste após a reinicialização.

## 6. Pré-configure o MiniOS

A maioria das ferramentas de configuração específicas do MiniOS prepara as definições para um próximo boot ou nova sessão, em vez de alterar imediatamente o desktop em execução.

Use o **Configurador do MiniOS** para essa pré-configuração: idioma, fuso horário, teclado, nome do host, serviços, padrões de conta, política de segurança e outras configurações de inicialização do MiniOS. Abra pelo menu de aplicativos ou execute:

```bash
minios-configurator
```

Use as ferramentas padrão do desktop e do Linux para configurações de tempo de execução, como conexões de rede, áudio, configuração de vídeo e preferências de aplicativos.
Algumas configurações do Configurador do MiniOS são aplicadas no próximo boot, enquanto configurações de conta e segurança podem ser usadas apenas ao criar uma nova sessão. Veja [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) para o comportamento exato.

## Próximos passos

Assim que o MiniOS estiver inicializando e mantendo o estado que você precisa:

- [Aplicativos e ferramentas MiniOS](/using-minios/MiniOS-Applications) — veja as utilidades específicas do MiniOS disponíveis no sistema.
- [Configuração de rede](/using-minios/Networking) — use o NetworkManager normalmente ou prepare a pré-configuração cabeada MiniOS.
- [Loja de aplicativos MiniOS](/using-minios/Installing-Software) — instale aplicativos a partir do catálogo MiniOS.
- [Gerenciador de módulos](/preparing-and-customizing/Managing-Modules) — inspecione e gerencie módulos MiniOS.
- [Backup e recuperação](/maintenance-and-recovery/Backing-Up-MiniOS) — proteja um sistema que você pretende continuar usando.
