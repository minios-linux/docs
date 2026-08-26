---
updated: 2026-08-26
---

# Guia dos Menus de Boot do MiniOS

Os menus de boot do MiniOS oferecem opções práticas para modos comuns de inicialização ao vivo. Este guia explica como selecionar e editar essas opções.

## Visão Geral

As imagens do MiniOS podem usar GRUB ou Syslinux dependendo do firmware, do layout da imagem e da build. Os gráficos dos menus, teclas de edição, tratamento de idiomas e opções disponíveis podem variar. O bootloader, no final, passa uma linha de comando do kernel para o mesmo initrd; consulte [Modos de Boot](/configuration/Boot-Modes.md) para entender o comportamento resultante de origem, persistência, cópia para RAM e dependência de mídia.

## Opções do Menu de Boot

A imagem fornecida geralmente apresenta estas escolhas semânticas, embora títulos, disponibilidade, ordem e seleção padrão possam variar conforme a imagem:

| Opção do menu | Seletor típico do initrd | Finalidade |
|---|---|---|
| Retomar Sessão Anterior | `perchdir=resume` | Tenta a sessão compatível padrão e permite a criação de uma nova sessão sob as condições documentadas. |
| Iniciar Nova Sessão | `perchdir=new` | Aloca uma nova sessão persistente numerada. |
| Escolher Sessão na Inicialização | `perchdir=ask` | Permite selecionar uma sessão existente ou solicitar uma nova de forma interativa. |
| Início Limpo | sem seletor de persistência | Utiliza uma camada temporária gravável. |
| Copiar para RAM | `toram` | Solicita o caminho completo de cópia para RAM. |

Estes são seletores, não garantias de que o armazenamento será gravável, que a sessão será compatível, que há RAM suficiente ou que a mídia de origem foi removida. Consulte [Modos de Boot](/configuration/Boot-Modes.md) para comportamento e combinações, [Persistência do Initrd](/configuration/Initrd-Persistence.md) para casos de exceção dos seletores e [Otimização de desempenho](/administration/Performance-Optimization.md) para trade-offs de RAM e I/O.

## Como Usar o Menu de Boot

### Navegando pelo Menu

- Use as **setas do teclado** para mover entre as opções
- Pressione **Enter** para selecionar uma opção
- Pressione **Esc** para voltar ao menu anterior (no GRUB)
- A seleção automática e o tempo limite dependem da configuração ativa do menu; alguns menus podem aguardar indefinidamente

### Seleção de Idioma (GRUB)

Se o seu pendrive MiniOS oferece suporte a vários idiomas:
1. A primeira tela exibirá as opções de idioma
2. Selecione o idioma de sua preferência
3. O menu de inicialização aparecerá no idioma selecionado
4. A seleção também pode repassar as configurações de localidade para a próxima inicialização, mas não garante que todas as mensagens de boot ou dos aplicativos estejam traduzidas

**Importante:** O menu multilíngue substitui qualquer configuração de localidade especificada em `config.conf`. O idioma escolhido no menu de inicialização tem prioridade sobre as configurações de localidade pré-configuradas. Veja **[Arquivo de Configuração](/configuration/Configuration-File.md)** e **[live-config](/configuration/live-config.md)** para detalhes sobre os arquivos de configuração do sistema.

## Personalizando as Opções de Boot

### Editando Parâmetros de Boot Temporariamente

Você pode modificar as opções de boot para uma única inicialização:

**No GRUB:**
1. Selecione a opção de menu que deseja modificar
2. Pressione **'e'** para editar
3. Navegue até a linha que começa com `linux`
4. Adicione ou altere parâmetros ao final da linha
5. Pressione **Ctrl+X** ou **F10** para inicializar com as alterações

**No SYSLINUX:**
1. Selecione a opção de menu desejada
2. Pressione **Tab** antes de pressionar Enter
3. Adicione os parâmetros na linha de comando que aparecer
4. Pressione **Enter** para iniciar

### Modificações Comuns de Parâmetros de Boot

- `debug` - Exibe mensagens detalhadas de inicialização (útil para diagnóstico)
- `toram=trim` - Copia o conjunto de módulos filtrado e dados necessários para a RAM
- `perchsize=2000` - Define o tamanho do armazenamento da sessão para 2GB (ajuste conforme necessário)
- `locales=ru_RU.UTF-8` - Solicita um idioma/localidade específico

Para uma lista completa de parâmetros disponíveis, consulte **[Parâmetros de Boot](/configuration/Boot-Parameters.md)**.

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

**Atenção:** Só edite arquivos de configuração de boot se souber o que está fazendo. Alterações incorretas podem tornar seu pendrive inutilizável para inicialização.

**Para editar a configuração do GRUB:**
1. Monte seu pendrive MiniOS
2. Navegue até `/minios/boot/grub/`
3. Edite `grub.cfg` com um editor de texto
4. Salve e ejete o pendrive com segurança

**Alterações comuns:**
- Modificar a diretiva de tempo limite usada pelo menu ativo do GRUB ou Syslinux
- Alterar `set default=0` para mudar a opção padrão do menu
- Adicionar entradas personalizadas ao menu
