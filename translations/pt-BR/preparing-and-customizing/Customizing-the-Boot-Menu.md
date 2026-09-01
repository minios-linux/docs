---
updated: 2026-08-28
---

# Personalizando o menu de boot

Os menus de boot do MiniOS oferecem opções práticas para modos comuns de inicialização live. Este guia explica como selecionar e editar essas opções.

## Visão geral

As imagens do MiniOS podem usar GRUB ou Syslinux, dependendo do firmware, do layout da imagem e da build. Os gráficos dos menus, teclas de edição, tratamento de idioma e opções disponíveis podem não ser idênticos. O bootloader, ao final, passa uma linha de comando do kernel para o mesmo initrd; veja [Modos de boot](/using-minios/Boot-Modes) para detalhes sobre a origem resultante, persistência, comportamento de cópia RAM e dependência de mídia.

## Opções do Menu de Boot

A imagem fornecida normalmente apresenta estas opções semânticas, embora títulos, disponibilidade, ordem e seleção padrão possam variar conforme a imagem:

| Opção do menu | Seletor típico do initrd | Finalidade |
|---|---|---|
| Iniciar MiniOS | `perchdir=resume` | Tenta a sessão padrão compatível e permite a criação de substituição sob as condições documentadas. |
| Iniciar uma nova sessão | `perchdir=new` | Cria uma sessão persistente adicional numerada, mantendo as sessões existentes inalteradas. |
| Escolher uma sessão salva | `perchdir=ask` | Seleciona interativamente uma sessão salva existente. Use **Iniciar uma nova sessão** em armazenamento vazio. |
| Iniciar sem salvar | seletor sem persistência | Usa uma camada temporária gravável em RAM. |
| Executar a partir de RAM | `toram` | Copia toda a árvore de dados MiniOS para RAM e tenta desconectar a origem. |

Essas são opções de seleção, não garantias de que o armazenamento é gravável, que a sessão é compatível, que a RAM é suficiente ou que a mídia de origem foi desconectada. Consulte [Modos de boot](/using-minios/Boot-Modes) para comportamento e combinações, [Persistência do initrd](/reference/boot-process/Persistence-Internals) para casos de borda dos seletores e [Otimização de desempenho](/maintenance-and-recovery/Performance) para RAM e trade-offs de I/O.

## Como usar o menu de boot

### Navegando pelo menu

- Use as **setas do teclado** para mover entre as opções
- Pressione **Enter** para selecionar uma opção
- Pressione **Esc** para voltar ao menu anterior (no GRUB)
- A seleção automática e o tempo limite dependem da configuração ativa do menu; alguns menus podem aguardar indefinidamente

### Seleção de idioma (GRUB)

Se seu pendrive MiniOS oferece suporte a vários idiomas:
1. A primeira tela exibirá as opções de idioma
2. Selecione o idioma de sua preferência
3. O menu de boot aparecerá no idioma selecionado
4. A seleção também pode passar as configurações de localidade para a inicialização posterior, mas não garante que todas as mensagens de boot ou de aplicativos estejam traduzidas

**Importante:** O menu multilíngue substitui qualquer configuração de localidade especificada em `config.conf`. O idioma escolhido no menu de boot tem prioridade sobre as configurações de localidade pré-configuradas. Consulte **[Arquivo de Configuração](/reference/configuration/config.conf)** e **[live-config](/reference/configuration/live-config)** para detalhes sobre os arquivos de configuração do sistema.

## Personalizando opções de boot

### Editando parâmetros de boot temporariamente

Você pode modificar as opções de boot para uma única sessão:

**No GRUB:**
1. Selecione a opção de menu que deseja modificar
2. Pressione **'e'** para editar
3. Navegue até a linha que começa com `linux`
4. Adicione ou modifique parâmetros ao final da linha
5. Pressione **Ctrl+X** ou **F10** para inicializar com suas alterações

**No SYSLINUX:**
1. Selecione a opção de menu desejada
2. Pressione **Tab** antes de pressionar Enter
3. Adicione os parâmetros na linha de comando que aparecer
4. Pressione **Enter** para inicializar

### Modificações comuns de parâmetros de boot

- `debug` - Exibe mensagens detalhadas de boot (útil para diagnóstico)
- `toram=trim` - Copia o conjunto de módulos filtrados e dados obrigatórios limitados para a RAM
- `perchsize=2000` - Define o tamanho do armazenamento da sessão para 2GB (ajuste conforme necessário)
- `locales=ru_RU.UTF-8` - Solicita um idioma/localidade específico

Para uma lista completa dos parâmetros de boot disponíveis, consulte **[Parâmetros de Boot](/reference/Boot-Parameters)**.

## Localização dos arquivos de configuração

### No seu pendrive MiniOS

- **Configuração do GRUB:** `/minios/boot/grub/grub.cfg`
- **Configuração do SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Imagens de boot:** `/minios/boot/bootlogo.png`
- **Arquivos de idioma:** `/minios/boot/grub/locale/`

### No sistema em execução

- **Parâmetros de boot atuais:** `/proc/cmdline`
- **Diretório de dados do MiniOS:** `/run/initramfs/memory/data/minios/`

### Editando arquivos de configuração

**Atenção:** Só edite arquivos de configuração de boot se você souber o que está fazendo. Alterações incorretas podem tornar seu pendrive inoperante.

**Para editar a configuração do GRUB:**
1. Monte seu pendrive MiniOS
2. Navegue até `/minios/boot/grub/`
3. Edite `grub.cfg` com um editor de texto
4. Salve e ejete o pendrive com segurança

**Alterações comuns:**
- Modificar a diretiva de tempo limite usada pelo menu ativo do GRUB ou Syslinux
- Alterar `set default=0` para mudar a opção padrão do menu
- Adicionar entradas personalizadas ao menu
