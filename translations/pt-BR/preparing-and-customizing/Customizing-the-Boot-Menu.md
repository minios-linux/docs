---
updated: 2026-10-15
---

# Personalizar o menu de inicialização

Os menus de inicialização MiniOS oferecem opções práticas para modos comuns de inicialização ao vivo. Este guia explica como selecionar e editar essas opções.

## Visão geral

As imagens MiniOS podem usar GRUB ou Syslinux, dependendo do firmware, do layout da imagem e da compilação. Os grafos de menu, as teclas de edição, o tratamento de idiomas e as opções disponíveis não são necessariamente idênticos. Em última instância, o carregador de inicialização passa uma linha de comando do kernel para o mesmo initrd; consulte [Modos de inicialização](/using-minios/Boot-Modes) para saber como se comportam a origem, a persistência, a cópia de RAM e a dependência da mídia.

## Opções do menu de inicialização

A imagem fornecida geralmente apresenta estas opções semânticas, embora os títulos, a disponibilidade, a ordem e a seleção padrão possam variar conforme a imagem:

| Opção do menu | Seletor típico do initrd | Finalidade |
|---|---|---|
| Iniciar MiniOS | `perchdir=resume` | Tentar a sessão compatível padrão e permitir a criação de uma substituta nas condições documentadas. |
| Iniciar nova sessão | `perchdir=setup` | Abrir o seletor de backend de persistência e, em seguida, criar uma sessão numerada adicional sem alterar as sessões existentes. |
| Escolher uma sessão salva | `perchdir=ask` | Selecionar interativamente uma sessão salva existente; se o armazenamento estiver vazio, MiniOS inicia o mesmo fluxo de configuração para que a primeira sessão possa ser criada. |
| Iniciar sem salvar | sem seletor de persistência | Usar uma camada temporária gravável em RAM. |
| Executar a partir da RAM | `toram` | Copiar os dados do sistema MiniOS para RAM; com persistência, a opção padrão `perchtoram=trim` também copia separadamente a sessão compatível selecionada. |

Esses seletores não garantem que o armazenamento seja gravável, que uma sessão seja compatível, que RAM seja suficiente ou que a mídia de origem tenha sido desconectada. Consulte [Modos de inicialização](/using-minios/Boot-Modes) para conhecer o comportamento e as combinações, [Persistência no initrd](/reference/boot-process/Persistence-Internals) para casos específicos dos seletores e [Otimização de desempenho](/maintenance-and-recovery/Performance) para saber mais sobre RAM e as compensações de E/S.

## Como usar o menu de inicialização

### Navegação pelo menu

- Use **as teclas de seta** para navegar entre as opções
- Pressione **Enter** para selecionar uma opção
- Pressione **Esc** para voltar ao menu anterior (no GRUB)
- A seleção automática e o tempo limite dependem da configuração do menu ativo; alguns menus podem aguardar indefinidamente

### Ajuda e seleção de idioma

Os menus multilíngues atuais do GRUB e os menus nativos do SYSLINUX começam com modos de inicialização, não com uma tela de seleção de idioma. **F1** abre a ajuda de inicialização e **F2** abre a seleção de idioma. Ao escolher um idioma, você volta ao menu de modos traduzido. Mídias com um único idioma mantêm a ajuda, mas não oferecem navegação por idiomas indisponíveis.

O menu multilíngue inicial mantém a localidade configurada no sistema. Somente a seleção explícita de um idioma adiciona configurações de localidade que substituem `config.conf` durante essa inicialização. Isso não garante que todas as mensagens de inicialização ou do aplicativo estejam traduzidas. Consulte o [arquivo de configuração](/reference/configuration/config.conf) e o [live-config](/reference/configuration/live-config).

## Personalização das opções de inicialização

### Edição temporária dos parâmetros de inicialização

Você pode modificar as opções de inicialização para uma única sessão:

**No GRUB:**
1. Selecione a opção do menu que deseja modificar
2. Pressione **'e'** para editar
3. Navegue até a linha que começa com `linux`
4. Adicione ou modifique os parâmetros no final da linha
5. Pressione **Ctrl+X** ou **F10** para inicializar com suas alterações

**No SYSLINUX:**
1. Selecione a opção do menu desejada
2. Pressione **Tab** antes de pressionar Enter
3. Adicione parâmetros à linha de comando exibida
4. Pressione **Enter** para inicializar

### Modificações comuns nos parâmetros de inicialização

- `debug` - Exibir mensagens detalhadas de inicialização (útil para solucionar problemas)
- `toram=trim` - Copiar o conjunto filtrado de módulos e os dados necessários limitados para RAM
- `perchsize=2000` - Solicitar 2000 MiB para um contêiner compatível novo ou em expansão; isso não define o tamanho de sessões nativas ou SquashFS
- `locales=ru_RU.UTF-8` - Solicitar um idioma/localidade específico

Para ver a lista completa de parâmetros de inicialização disponíveis, consulte **[Parâmetros de inicialização](/reference/Boot-Parameters)**.

## Locais dos arquivos de configuração

### No seu dispositivo USB MiniOS

- **Configuração do GRUB:** `/minios/boot/grub/grub.cfg`
- **Menus de modo e idioma do GRUB:** `/minios/boot/grub/main.cfg` e `/minios/boot/grub/languages.cfg`; versões localizadas podem selecionar outros arquivos gerados
- **Configuração do SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Imagens de inicialização:** verifique a configuração ativa de tema do SYSLINUX `MENU BACKGROUND` ou do GRUB; os caminhos dependem do carregador de inicialização selecionado
- **Arquivos de idioma:** `/minios/boot/grub/locale/`

### No sistema em execução

- **Parâmetros de inicialização atuais:** `/proc/cmdline`
- **Diretório de dados do MiniOS:** `/run/initramfs/memory/data/minios/`

### Editando arquivos de configuração

**Aviso:** Edite arquivos de configuração de inicialização somente se souber o que está fazendo. Alterações incorretas podem impedir a inicialização do seu pendrive.

**Para editar a configuração do GRUB:**
1. Monte seu pendrive MiniOS
2. Acesse `/minios/boot/grub/`
3. Edite `grub.cfg` com um editor de texto
4. Salve e ejete o pendrive com segurança

**Alterações comuns:**
- Modifique a diretiva de tempo limite usada pelo menu ativo do GRUB ou do Syslinux
- Altere `set default=0` para mudar a opção padrão do menu
- Adicione entradas personalizadas ao menu
