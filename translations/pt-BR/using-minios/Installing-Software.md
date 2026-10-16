---
updated: 2026-10-15
program_commits:
    minios-store: c3d0d31db7966cd7809f0f4ba1ca642133c8f07a
---

# Instalação de software

Loja de aplicativos MiniOS oferece um catálogo de receitas de aplicativos em [store.minios.dev](https://store.minios.dev). No ambiente live MiniOS, essas receitas podem ser instaladas diretamente no sistema em execução ou usadas para criar um ou mais SquashFS (`.sb`) módulos.

Esta página descreve o fluxo de trabalho de software live do MiniOS. Uma instalação nativa mantém o ambiente gráfico selecionado e os aplicativos comuns, mas remove o software específico do MiniOS destinado à operação live. Em vez disso, use o fluxo normal de gerenciamento de pacotes Debian nesse sistema instalado.

Navegar pelo catálogo não exige um servidor local. Para instalar, é necessário: a interface web se conecta ao daemon local da Loja de aplicativos MiniOS ou abre o gerenciador `minios-store://` do URI instalado.

## Antes de instalar

Abra os detalhes de um aplicativo e confira as informações a seguir antes de adicioná-lo ao carrinho:

- Os nomes dos pacotes e o método de instalação.
- O script de instalação, quando exibido.
- A página inicial do aplicativo e as informações do desenvolvedor.
- Capturas de tela e imagens do aplicativo, quando disponíveis. Esses metadados são apenas para apresentação e não comprovam que uma receita é confiável.
- Se a receita baixa um pacote Debian separado.
- Qualquer licença de software adicional indicada pela receita. Receitas que exigem aceitação não podem ser instaladas até que você aceite explicitamente a licença.

As receitas podem instalar pacotes APT, baixar pacotes Debian ou executar scripts de shell. As operações de instalação são executadas com privilégios de root. Trate a receita e todos os downloads ou repositórios que ela utiliza como código privilegiado.

## Instalar um aplicativo

1. Abra a Loja de aplicativos MiniOS pelo menu de aplicativos. O iniciador verifica `https://store.minios.dev` e abre a página no navegador padrão.
2. Pesquise ou navegue por categoria, abra os detalhes do aplicativo e confira os pacotes ou o script.
3. Adicione um ou mais aplicativos ao carrinho.
4. Em uma sessão live de MiniOS, selecione `Module` ou `System`.
5. No modo de módulos, escolha o nível de compilação, se necessário. **Padrão da receita** mantém o nível configurado em cada receita; **Automático** usa todos os módulos carregados no momento como base de compilação e gera um nome de módulo sem número; um nível numérico entre `01` e `09` usa apenas os módulos carregados até esse nível. Prefira Padrão da receita, a menos que você precise evitar dependências de camadas opcionais superiores.
6. Para vários aplicativos no modo de módulos, selecione um módulo combinado ou módulos separados. Também é possível dar um nome personalizado ao módulo combinado.
7. Aceite as licenças de receitas que exigem aceitação explícita.
8. Selecione `Install` e acompanhe o progresso e a saída dos comandos. A página usa o daemon local quando o status dele é `Connected`; caso contrário, tenta usar o gerenciador URI e pode exibir uma solicitação de autenticação do PolicyKit.

Só é possível executar um lote de instalação pelo daemon por vez. Fechar a caixa de diálogo de progresso não necessariamente interrompe uma instalação pelo daemon; reabra o indicador de instalação para acompanhá-la ou cancele-a explicitamente.

## Modos de módulos e do sistema

### Modo de módulo

O modo de módulo executa `apt2sb` ou `script2sb` em um ambiente isolado para criação de módulos. Ele grava os arquivos `.sb` resultantes no primeiro local gravável abaixo:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

O primeiro caminho é o diretório de módulos da árvore de dados MiniOS efetiva. Em uma inicialização normal com permissão de gravação, ele fica no armazenamento; porém, após a cópia do sistema `toram`, ele pode estar em um dispositivo RAM; o Store verifica se é possível gravar, não se os dados são persistentes. Um módulo criado não é ativado na sessão atual. Ele será carregado em uma inicialização posterior somente se for copiado para um armazenamento persistente `minios/modules/` e permitido pelos filtros de inicialização. Use a opção **Adicionar à próxima inicialização** ou `sudo sb next-boot add /path/to/module.sb` quando houver armazenamento persistente adequado.

O segundo caminho é uma alternativa usada quando não é possível gravar no diretório normal de módulos. Um módulo nesse diretório alternativo não será incluído automaticamente na próxima inicialização do sistema ativo. Use `Open folder` e, em seguida, copie o módulo concluído para o diretório `minios/modules` na mídia de inicialização gravável MiniOS antes de reiniciar.

Um módulo combinado contém todas as receitas selecionadas. Com o empacotamento separado, uma falha pode afetar uma receita, enquanto os módulos concluídos anteriormente no lote permanecem no diretório de destino.

### Modo de sistema

O modo de sistema usa o APT ou um script de receita diretamente no sistema de arquivos raiz em execução. As alterações entram em vigor no sistema ativo atual, em vez de gerar um módulo. A persistência dessas alterações após uma reinicialização depende da configuração de persistência da sessão.

O modo de sistema não é transacional. Uma operação com falha ou cancelada pode deixar pacotes, o estado dos repositórios ou arquivos alterados por comandos anteriores.

## Serviço local e limite de confiança

O serviço `minios-store` é executado como root porque a criação de módulos e a instalação direta de pacotes exigem operações de mount, overlay, chroot, APT e dpkg. Por padrão, ele escuta apenas em `ws://127.0.0.1:8765`. A interface web hospedada envia os dados completos da receita, incluindo scripts e URLs de download, para esse serviço local.

O daemon valida a estrutura da solicitação e o método de instalação compatível, mas não autentica nem assina o payload da receita de forma independente. Uma página que consiga acessar o endpoint WebSocket local pode solicitar operações de instalação com privilégios. Portanto:

- Mantenha o daemon vinculado a `127.0.0.1`. Não exponha a porta `8765` à rede local ou à internet.
- Não configure `MINIOS_STORE_HOST` para usar um endereço que não seja de loopback, a menos que haja um limite de segurança adicional devidamente revisado.
- Acesse a Loja de aplicativos MiniOS somente pelo site oficial com HTTPS e confira as receitas antes da instalação.
- Pare ou desative o serviço quando a instalação pelo navegador não for necessária.

Gerencie o serviço systemd com:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

O handler de URI é uma alternativa independente. Ele inicia o instalador GTK por meio do PolicyKit e não exige o daemon WebSocket. Os links atuais da Store incluem o payload completo e codificado da receita para que receitas APT, de scripts e de arquivos DEB baixados possam usar o mesmo caminho alternativo; as aceitações explícitas de licença são transmitidas separadamente e validadas novamente pelo instalador local. O formato antigo `recipes=id:level:compression` continua disponível como alternativa de compatibilidade e é interpretado como uma receita APT. O instalador é iniciado após a autorização; portanto, confira a solicitação do navegador antes de aceitar o pedido de autenticação.

## Cancelamento

Selecione `Cancel` na caixa de diálogo de progresso da web ou `Cancel installation` no instalador GTK. O cancelamento marca o lote como cancelado e encerra o processo filho que está sendo monitorado. As receitas restantes não são iniciadas.

Cancelar não reverte as alterações. Os pacotes ou módulos concluídos anteriormente permanecem, e um comando interrompido durante o APT, dpkg, a execução de um script, um download ou a criação de um módulo pode deixar o estado parcial ou um arquivo de saída incompleto. Após o cancelamento:

1. Leia o log final da instalação.
2. Verifique se há arquivos inesperados ou vazios no diretório de módulos de destino.
3. No modo de sistema, execute `sudo dpkg --audit` e repare a configuração dos pacotes, se necessário.
4. Remova somente os artefatos que você identificou como pertencentes à operação cancelada.

## Solução de problemas

### A Loja de aplicativos MiniOS está offline

Verifique o acesso à rede a `https://store.minios.dev`. Um status `Offline` também significa que o navegador não está conectado ao daemon WebSocket local; a instalação ainda pode prosseguir pelo manipulador de URI se `minios-store-gui` estiver instalado.

### O navegador não consegue se conectar ao daemon

Verifique o serviço e os logs:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

O endpoint padrão é `ws://127.0.0.1:8765`. Um conflito de portas, serviço parado, ausência de `python3-websockets` ou restrições do navegador podem impedir a conexão. Reiniciar o navegador não corrige um daemon parado.

### Falha na autenticação ou nenhuma solicitação aparece

O instalador por URI requer o PolicyKit, `pkexec` e um agente de autenticação ativo no ambiente desktop. Inicie o instalador em uma sessão gráfica ativa e verifique se `minios-store-gui` está instalado. Não contorne a solicitação expondo o daemon root à rede.

### Falha ao criar o módulo

Expanda o log de instalação e verifique o erro do último comando, não apenas o resumo. Entre as causas comuns estão pacotes indisponíveis, falhas no repositório ou no DNS, espaço livre insuficiente, uma ferramenta de compactação incompatível e um diretório de módulos somente leitura. O daemon informa quando mudou para `/var/lib/minios-store/modules`.

### O aplicativo não está presente após a instalação

No modo de módulo, reinicie o sistema após confirmar que o arquivo `.sb` está no diretório `minios/modules` da mídia de inicialização. Um arquivo deixado no diretório alternativo não é carregado automaticamente. No modo de sistema em uma sessão live, verifique se a sessão é persistente caso o aplicativo tenha desaparecido após a reinicialização.

### Uma instalação do sistema cancelada deixou o dpkg em estado incompleto

Verifique o estado dos pacotes antes de tentar novamente:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revise as alterações propostas pelo APT antes de confirmar qualquer operação de reparo adicional.

## Documentação relacionada

- [Criar módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruir ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
