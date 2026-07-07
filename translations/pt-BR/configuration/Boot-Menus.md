# Guia dos Menus de Boot do MiniOS

O MiniOS oferece um sistema de menu de boot avançado que permite escolher como o sistema será iniciado e operado. Este guia explica as opções de boot disponíveis e como personalizá-las.

## Visão Geral

O MiniOS utiliza o GRUB como bootloader principal, oferecendo uma interface gráfica com suporte multilíngue. Em sistemas BIOS mais antigos, o SYSLINUX pode ser usado como alternativa. Ambos os bootloaders oferecem a mesma funcionalidade, com interfaces levemente diferentes.

## Opções do Menu de Boot

### 1. Retomar Sessão Anterior

**O que faz:** Tenta continuar a partir da sua última sessão, adaptando-se automaticamente conforme o armazenamento disponível.

- **Quando usar:** Esta é a opção padrão – adequada para a maioria dos usuários na maioria das situações
- **O que acontece:** 
  - **Em mídia gravável com sessão existente:** Restaura seus arquivos, aplicativos e configurações salvos
  - **Em mídia gravável sem sessão:** Cria automaticamente a primeira sessão (sessão #1)
  - **Em mídia somente leitura (DVD, CD):** Executa como "Início Limpo" já que não há armazenamento disponível
  - **Se a sessão for incompatível:** Cria uma nova sessão (ex: ao usar versão diferente do MiniOS)
  - O sistema gerencia automaticamente verificações de compatibilidade e limitações de armazenamento
- **Resultado:** Você sempre terá um sistema funcional, otimizado para o tipo de armazenamento

### 2. Iniciar Nova Sessão

**O que faz:** Cria um ambiente limpo mantendo todas as sessões existentes disponíveis.

- **Quando usar:** Quando você deseja um espaço limpo para outro trabalho ou testes
- **O que acontece:**
  - Cria uma nova sessão numerada (ex: se você tinha a sessão 1, cria a sessão 2)
  - Inicia com um ambiente de desktop limpo
  - Todas as novas alterações serão salvas na nova sessão
  - Todas as sessões existentes permanecem inalteradas e disponíveis para alternância
- **Nota:** Você pode alternar entre sessões usando a opção "Escolher sessão durante a inicialização"

### 3. Escolher Sessão Durante a Inicialização

**O que faz:** Exibe um menu interativo para selecionar entre sessões existentes ou criar uma nova.

- **Quando usar:** Quando você tem múltiplas sessões e deseja escolher qual utilizar
- **O que acontece:**
  - Mostra uma caixa de diálogo durante a inicialização com a lista de sessões disponíveis
  - Exibe informações da sessão (número, último acesso, uso de disco)
  - Opções para retomar qualquer sessão existente ou iniciar uma nova
  - Permite selecionar diferentes dispositivos de armazenamento se houver mais de um disponível
- **Benefícios:** Controle total sobre qual sessão usar, ideal para quem gerencia múltiplos ambientes de trabalho

### 4. Início Limpo

**O que faz:** Executa o MiniOS sem salvar nenhuma alteração.

- **Quando usar:** 
  - Testar o sistema em mídia gravável sem afetar sessões existentes
  - Solucionar problemas sem modificar dados salvos
  - Máxima privacidade (nenhum dado é salvo)
  - Quando você quer garantir que nenhuma alteração persistente seja feita
- **O que acontece:**
  - Inicialização mais rápida
  - Alterações são perdidas ao desligar
  - Sem acesso ao dispositivo de armazenamento para persistência
- **Nota:** Ao rodar em mídia somente leitura (DVD, CD), "Retomar Sessão Anterior" automaticamente se comporta como "Início Limpo" pois não há armazenamento disponível para sessões

### 5. Copiar para RAM

**O que faz:** Carrega todo o sistema na memória do computador para máximo desempenho.

- **Quando usar:**
  - Você possui bastante RAM (recomendado 4GB ou mais)
  - Deseja o desempenho mais rápido possível
  - Precisa remover o pendrive USB após a inicialização
  - Trabalha com aplicações intensivas
- **O que acontece:**
  - Copia todos os arquivos do sistema para a RAM durante o boot
  - O pendrive USB pode ser removido após o carregamento
  - O sistema roda inteiramente da memória
  - Maior rapidez em todas as operações
- **Requisitos:** RAM suficiente para comportar todo o sistema

Para opções avançadas de `toram` e técnicas de otimização de memória, veja **[Otimização de Desempenho](/administration/Performance-Optimization.md)**.

## Como Usar o Menu de Boot

### Navegando pelo Menu

- Use as **setas do teclado** para mover entre as opções
- Pressione **Enter** para selecionar uma opção
- Pressione **Esc** para voltar ao menu anterior (no GRUB)
- O menu selecionará automaticamente a opção padrão após 10 segundos

### Seleção de Idioma (GRUB)

Se seu pendrive MiniOS suporta múltiplos idiomas:
1. A primeira tela mostrará as opções de idioma
2. Selecione seu idioma preferido
3. O menu de boot aparecerá no idioma escolhido
4. Todas as mensagens do sistema seguintes usarão esse idioma

⚠️ **Importante:** O menu multilíngue substitui qualquer configuração de localidade especificada em `config.conf`. O idioma selecionado no menu de boot tem prioridade sobre as configurações de localidade predefinidas. Veja **[Arquivo de Configuração](/configuration/Configuration-File.md)** e **[live-config](/configuration/live-config.md)** para detalhes sobre arquivos de configuração do sistema.

## Personalizando as Opções de Boot

### Editando Parâmetros de Boot Temporariamente

Você pode modificar as opções de boot para uma única inicialização:

**No GRUB:**
1. Selecione a opção de menu que deseja modificar
2. Pressione **'e'** para editar
3. Navegue até a linha que começa com `linux`
4. Adicione ou modifique parâmetros ao final da linha
5. Pressione **Ctrl+X** ou **F10** para inicializar com suas alterações

**No SYSLINUX:**
1. Selecione a opção de menu desejada
2. Pressione **Tab** antes de Enter
3. Adicione parâmetros à linha de comando exibida
4. Pressione **Enter** para inicializar

### Modificações Comuns de Parâmetros de Boot

- `debug` - Exibe mensagens detalhadas de inicialização (útil para diagnóstico)
- `toram=trim` - Copia apenas arquivos essenciais para a RAM (quando o `toram` completo usa muita memória)
- `perchsize=2000` - Define o tamanho do armazenamento da sessão para 2GB (ajuste conforme necessário)
- `locale=ru_RU.UTF-8` - Força idioma/localidade específica

Para a lista completa de parâmetros de boot disponíveis, veja **[Parâmetros de Boot](/configuration/Boot-Parameters.md)**.

## Localização dos Arquivos de Configuração

### No Seu Pendrive MiniOS

- **Configuração do GRUB:** `/minios/boot/grub/grub.cfg`
- **Configuração do SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Imagens de boot:** `/minios/boot/bootlogo.png`
- **Arquivos de idioma:** `/minios/boot/grub/locale/`

### No Sistema em Execução

- **Parâmetros de boot atuais:** `/proc/cmdline`
- **Diretório de dados do MiniOS:** `/run/initramfs/memory/data/minios/`

### Editando Arquivos de Configuração

⚠️ **Atenção:** Edite arquivos de configuração de boot somente se souber o que está fazendo. Alterações incorretas podem tornar seu pendrive não inicializável.

**Para editar a configuração do GRUB:**
1. Monte seu pendrive MiniOS
2. Navegue até `/minios/boot/grub/`
3. Edite o `grub.cfg` com um editor de texto
4. Salve e ejete o pendrive com segurança

**Alterações comuns:**
- Modificar `set timeout=10` para alterar o tempo limite do menu
- Alterar `set default=0` para mudar a opção padrão do menu
- Adicionar entradas de menu personalizadas
