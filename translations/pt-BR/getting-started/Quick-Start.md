---
updated: 2026-10-15
---

# Início rápido

Este guia mostra como transformar uma imagem MiniOS baixada em um sistema funcional. Ele aborda apenas as decisões necessárias para a primeira inicialização; os guias vinculados explicam cada tópico em detalhes.

## 1. Baixe o MiniOS

Escolha a edição que melhor atende ao que você pretende fazer:

| Edição | Ideal para |
|---|---|
| **Standard** | **Recomendada para a maioria dos usuários e para uma primeira experiência com MiniOS.** Um sistema mínimo, com funcionalidades básicas e um ambiente de desktop Xfce compacto e eficiente para o uso cotidiano. |
| **Toolbox** | Uma edição voltada à administração e ao diagnóstico de sistemas, para profissionais de TI e recuperação de sistemas. Inclui o Standard, além das ferramentas correspondentes de administração, recuperação, rede, teste de hardware, backup e acesso remoto. |
| **Ultra** | Um desktop completo, com ampla variedade de aplicativos e ferramentas profissionais para criação e desenvolvimento. Inclui o Toolbox, além de softwares de escritório, gráficos, vídeo, áudio, 3D, desenvolvimento e contêineres. |
| **Flux** | Uma edição ultraleve com Fluxbox, que consome poucos recursos e é indicada para hardware antigo. Conta com um conjunto reduzido de aplicativos e menos recursos de conveniência no desktop do que o Standard. **Não recomendada para iniciantes.** |

A disponibilidade exata de pacotes e ambientes de desktop depende da versão. Consulte [Sobre o MiniOS](/getting-started/About-MiniOS) para entender o modelo de edições e [Pacotes e edições](/reference/Package-and-Edition-Contents) para ver a seleção de pacotes mantida.

Baixe o ISO no [site do MiniOS](https://minios.dev), na página oficial de [lançamentos do GitHub](https://github.com/minios-linux/minios-live/releases) ou no [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verifique o download

Verifique o ISO antes de instalá-lo. Os lançamentos do MiniOS incluem um arquivo `.iso.sha256`; consulte [Verificar downloads](/installing-minios/Verifying-Downloads) para ver os comandos para Linux, macOS e Windows.

## 3. Instale o MiniOS

No caso do MiniOS, gravar o sistema em uma mídia removível já é uma forma de instalação: o dispositivo resultante é um sistema MiniOS inicializável.

Escolha o método de acordo com o resultado que você espera do dispositivo:

| O que você quer | Método | Resultado |
|---|---|---|
| Um pendrive comum que também inicialize o MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) no modo ISO normal ou [Instalação baseada em arquivos](/installing-minios/Manual-File-Based-Installation) | MiniOS e o carregador de inicialização ficam em um sistema de arquivos comum, permitindo usar o dispositivo também para armazenar arquivos normalmente |
| MiniOS junto com outras imagens ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy mantém sua partição de dados normal e oferece suporte a multiboot; MiniOS oferece suporte a sessões persistentes nesse layout |
| Uma instalação portátil gerenciada de MiniOS | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) em **modo** Live | Cria uma instalação modular de MiniOS e permite configurar armazenamento persistente |
| Uma cópia exata do ISO, bloco a bloco | [Rufus](/installing-minios/installation-tools/Rufus) no modo DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility), ou [`dd`](/installing-minios/installation-tools/dd) | Reproduz o layout de blocos do ISO; é simples e previsível, mas o dispositivo deixa de funcionar como um pendrive comum de uso geral |

Para usar um dispositivo portátil também como armazenamento de arquivos, prefira Rufus no modo ISO, uma instalação baseada em arquivos, Ventoy ou uma instalação Live adequada criada pelo Instalador do MiniOS. Gravar uma imagem bruta é útil quando uma cópia exata da imagem publicada é mais importante do que reutilizar o dispositivo como armazenamento geral.

::: danger Verifique o dispositivo de destino
A maioria dos métodos de instalação sobrescreve parte ou todos os dados do dispositivo selecionado.
Faça backup de tudo o que for importante e confira o modelo e a capacidade do dispositivo antes de começar.
:::

Consulte [Instalando o MiniOS](/installing-minios/Installation-Methods) para entender as diferenças entre gravar uma imagem bruta, Ventoy, layouts baseados em arquivos e o Instalador do MiniOS.

## 4. Inicie o MiniOS pela primeira vez

1. Reinicie o computador com o dispositivo MiniOS conectado.
2. Abra o menu de inicialização do firmware do computador e selecione esse dispositivo.
3. Mantenha selecionada a opção padrão **Iniciar MiniOS** e inicie o sistema.
4. Verifique se os dispositivos gráficos, o teclado, a rede e os dispositivos de armazenamento necessários estão funcionando corretamente.

**Iniciar MiniOS** é o modo de inicialização padrão normal. Ele usa a seleção automática de persistência: MiniOS tenta retomar uma sessão padrão compatível e, quando não há uma sessão utilizável, pode criar uma, se houver armazenamento gravável adequado. Se não for possível ativar a persistência, MiniOS continua com uma camada gravável temporária e informa que as alterações não serão salvas.

Isso significa que, na primeira inicialização normal, não é necessário criar uma sessão com antecedência. Escolha **Iniciar sem salvar** somente quando quiser iniciar deliberadamente em um ambiente temporário limpo, sem abrir nem criar uma sessão persistente.

Consulte [Modos de inicialização](/using-minios/Boot-Modes) para conhecer outras opções de inicialização. Se o dispositivo não iniciar ou algum hardware importante não funcionar, consulte [Compatibilidade de hardware](/getting-started/Hardware-Compatibility) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## 5. Escolha outro comportamento de sessão quando necessário

Para o uso portátil normal, continue usando a opção padrão **Iniciar MiniOS**. Escolha outro modo somente se precisar de um resultado diferente:

| Opção de inicialização | Quando usar | Resultado |
|---|---|---|
| **Iniciar MiniOS** (padrão) | Uso portátil normal | Retoma automaticamente uma sessão padrão compatível ou cria uma quando houver suporte |
| **Iniciar nova sessão** | Você quer um espaço de trabalho adicional separado | Cria uma sessão persistente adicional numerada e mantém as sessões existentes inalteradas |
| **Escolher uma sessão salva** | Você quer escolher uma entre várias áreas de trabalho existentes | Permite escolher interativamente uma sessão existente |
| **Iniciar sem salvar** | Você quer uma inicialização temporária limpa, sem persistência | Usa uma camada gravável temporária em RAM |
| **Executar a partir da RAM** | Você quer copiar MiniOS para RAM nesta inicialização | A opção fornecida inicia temporariamente sem uma sessão salva. Com uma solicitação adicional de persistência, as sessões compatíveis podem ser copiadas separadamente e salvas explicitamente de volta; os dados nativos não são copiados |

A persistência automática ainda requer armazenamento gravável adequado. A gravação de uma ISO diretamente não prepara, por si só, o armazenamento persistente. Instalações baseadas em arquivos, layouts Ventoy e instalações Live criadas pelo [Instalador do MiniOS](/installing-minios/MiniOS-Installer) podem fornecer layouts graváveis para o uso persistente de MiniOS. As sessões existentes podem ser inspecionadas e gerenciadas em [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

Antes de depender da persistência, reinicie uma vez e confirme se MiniOS informa que a sessão esperada está ativa e se uma alteração de teste permanece após a reinicialização.

## 6. Pré-configure MiniOS

A maioria das ferramentas de configuração específicas do MiniOS prepara definições para uma inicialização posterior ou uma nova sessão, em vez de alterar imediatamente a área de trabalho em execução.

Use **Configurador do MiniOS** para essa pré-configuração: localidade, fuso horário, teclado, nome do host, serviços, padrões de conta, política de segurança e outras configurações de inicialização do MiniOS. Abra-o no menu de aplicativos ou execute:

```bash
minios-configurator
```

Use as ferramentas padrão do ambiente de trabalho e do Linux para configurações comuns durante a execução, como conexões de rede, áudio, configuração de vídeo e preferências de aplicativos.
Algumas configurações do Configurador do MiniOS são aplicadas na próxima inicialização, enquanto as configurações de conta e segurança podem ser usadas somente quando uma nova sessão é criada. Consulte [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) para ver o comportamento exato.

## Próximas etapas

Quando MiniOS estiver inicializando e mantendo o estado necessário:

- [Aplicativos e ferramentas do MiniOS](/using-minios/MiniOS-Applications) — consulte os utilitários específicos do MiniOS disponíveis no sistema.
- [Configuração de rede](/using-minios/Networking) — use o NetworkManager normalmente ou prepare a pré-configuração de rede cabeada do MiniOS.
- [Loja de aplicativos MiniOS](/using-minios/Installing-Software) — instale aplicativos pelo catálogo do MiniOS.
- [Gerenciador de módulos](/preparing-and-customizing/Managing-Modules) — inspecione e gerencie os módulos MiniOS.
- [Backup e recuperação](/maintenance-and-recovery/Backing-Up-MiniOS) — proteja um sistema que você pretende continuar usando.
