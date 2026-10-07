---
updated: 2026-10-06
---

# Personalizando o menu de boot

Os menus de boot MiniOS oferecem opções práticas para modos comuns de inicialização ao vivo. Este guia explica como selecionar e editar essas opções.

## Visão geral

As imagens MiniOS podem usar GRUB ou Syslinux dependendo do firmware, layout da imagem e build. Os menus, teclas de edição, suporte a idiomas e opções disponíveis podem variar. O bootloader, no final, repassa a linha de comando do kernel para o mesmo initrd; veja [Modos de boot](/using-minios/Boot-Modes) para detalhes sobre origem, persistência, cópia RAM e comportamento dependente da mídia.

## Opções do menu de boot

A imagem fornecida geralmente apresenta estas opções, embora títulos, disponibilidade, ordem e seleção padrão possam variar conforme a imagem:

| Opção do menu | Seletor típico do initrd | Finalidade |
|---|---|---|
| Iniciar MiniOS | `perchdir=resume` | Tenta iniciar a sessão padrão compatível e permite criar uma nova sessão conforme as condições documentadas. |
| Iniciar nova sessão | `perchdir=setup` | Abre o seletor de backend de persistência e, em seguida, cria uma sessão adicional numerada mantendo as sessões existentes inalteradas. |
| Escolher uma sessão salva | `perchdir=ask` | Selecione interativamente uma sessão salva existente; se o armazenamento estiver vazio, MiniOS inicia o mesmo fluxo de configuração para criar a primeira sessão. |
| Iniciar sem salvar | sem seletor de persistência | Utiliza uma camada temporária gravável em RAM. |
| Executar a partir da RAM | `toram` | Copia os dados do sistema MiniOS para RAM; com persistência, o padrão `perchtoram=trim` copia separadamente a sessão suportada selecionada. |

Essas opções são seletores, não garantias de que o armazenamento é gravável, a sessão é compatível, RAM é suficiente ou que a mídia de origem foi removida. Consulte [Modos de boot](/using-minios/Boot-Modes) para saber sobre comportamentos e combinações, [Persistência do initrd](/reference/boot-process/Persistence-Internals) para casos especiais dos seletores, e [Otimização de desempenho](/maintenance-and-recovery/Performance) para RAM e impactos de I/O.

## Como usar o menu de boot

### Navegando pelo menu

- Use as **teclas de seta** para mover entre as opções
- Pressione **Enter** para selecionar uma opção
- Pressione **Esc** para voltar ao menu anterior (no GRUB)
- A seleção automática e o tempo limite dependem da configuração ativa do menu; alguns menus podem aguardar indefinidamente

### Seleção de idioma (GRUB)

Se o seu pendrive USB MiniOS oferecer suporte a vários idiomas:
1. A primeira tela exibirá as opções de idioma
2. Selecione o idioma de sua preferência
3. O menu de boot será exibido no idioma escolhido
4. A seleção também pode repassar as configurações de localidade para a inicialização, mas não garante que todas as mensagens do boot ou dos aplicativos estejam traduzidas

**Importante:** O menu multilíngue sobrescreve qualquer configuração de localidade definida em `config.conf`. O idioma selecionado no menu de boot tem prioridade sobre as configurações de localidade predefinidas. Veja **[Arquivo de configuração](/reference/configuration/config.conf)** e **[live-config](/reference/configuration/live-config)** para detalhes sobre arquivos de configuração do sistema.

## Personalizando opções de boot

### Editando parâmetros de boot temporariamente

Você pode modificar as opções de boot para uma única sessão:

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
4. Pressione **Enter** para inicializar

### Modificações comuns de parâmetros de boot

- `debug` - Exibir mensagens detalhadas do boot (útil para diagnóstico)
- `toram=trim` - Copiar o conjunto de módulos filtrados e os dados mínimos necessários para RAM
- `perchsize=2000` - Definir o tamanho do armazenamento de sessão para 2GB (ajuste conforme necessário)
- `locales=ru_RU.UTF-8` - Solicitar um idioma/localidade específico

Para uma lista completa dos parâmetros de boot disponíveis, consulte **[Parâmetros de boot](/reference/Boot-Parameters)**.

## Localização dos arquivos de configuração

### No seu pendrive USB MiniOS

- **Configuração do GRUB:** `/minios/boot/grub/grub.cfg`
- **Configuração do SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Imagens de boot:** `/minios/boot/bootlogo.png`
- **Arquivos de idioma:** `/minios/boot/grub/locale/`

### No sistema em execução

- **Parâmetros de boot atuais:** `/proc/cmdline`
- **Diretório de dados MiniOS:** `/run/initramfs/memory/data/minios/`

### Editando arquivos de configuração

**Atenção:** Só edite os arquivos de configuração de boot se você souber o que está fazendo. Alterações incorretas podem tornar seu pendrive USB não inicializável.

**Para editar a configuração do GRUB:**
1. Monte seu pendrive USB MiniOS
2. Navegue até `/minios/boot/grub/`
3. Edite `grub.cfg` com um editor de texto
4. Salve e ejete o pendrive com segurança

**Alterações comuns:**
- Modificar a diretiva de tempo limite usada pelo menu ativo do GRUB ou Syslinux
- Altere `set default=0` para mudar a opção padrão do menu
- Adicione entradas personalizadas ao menu
