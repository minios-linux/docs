---
updated: 2026-08-31
program_commits:
    minios-store: 2226f08d65dffd251ae016664239164a3b237fc0
---

# Instalando softwares

A Loja de aplicativos MiniOS oferece um catálogo de receitas de aplicativos em [store.minios.dev](https://store.minios.dev). No ambiente ao vivo MiniOS, essas receitas podem ser instaladas diretamente no sistema em execução ou usadas para criar um ou mais módulos SquashFS (`.sb`).

Esta página descreve o fluxo de trabalho de software ao vivo MiniOS. Uma instalação nativa mantém o desktop selecionado e os aplicativos comuns, mas remove o software específico para MiniOS, destinado à operação ao vivo. Em vez disso, utilize o fluxo de trabalho padrão de gerenciamento de pacotes do Debian nesse sistema instalado.

Navegar pelo catálogo não requer um servidor local. A instalação sim: a interface web conecta-se ao daemon local da Loja de aplicativos MiniOS ou abre o manipulador de URI `minios-store://` instalado.

## Antes de instalar

Abra os detalhes do aplicativo e revise as seguintes informações antes de adicioná-lo ao carrinho:

- Os nomes dos pacotes e o método de instalação.
- O script de instalação, quando disponível.
- A página oficial do aplicativo e informações do desenvolvedor.
- Se a receita faz download de um pacote Debian separado.

As receitas podem instalar pacotes via APT, baixar pacotes Debian ou executar scripts de shell. As operações de instalação são executadas com privilégios de root. Considere uma receita e todo download ou repositório utilizado como código privilegiado.

## Instalar um aplicativo

1. Abra a Loja de aplicativos MiniOS no menu de aplicativos. O iniciador verifica `https://store.minios.dev` e o abre no navegador padrão.
2. Pesquise ou navegue por categoria, abra os detalhes do aplicativo e confira os pacotes ou script.
3. Adicione um ou mais aplicativos ao carrinho.
4. Em uma sessão ao vivo MiniOS, selecione `Module` ou `System`.
5. Para múltiplos aplicativos no modo módulo, escolha um módulo combinado ou módulos separados. Um módulo combinado também pode receber um nome personalizado.
6. Selecione `Install` e acompanhe o progresso e a saída dos comandos. A página usa o daemon local quando o status está `Connected`; caso contrário, tenta o manipulador de URI e pode exibir um prompt de autenticação do PolicyKit.

Apenas um lote de instalação do daemon pode ser executado por vez. Fechar o diálogo de progresso não interrompe necessariamente a instalação; reabra o indicador de instalação para visualizá-la ou cancele explicitamente.

## Modos de módulo e de sistema

### Modo módulo

O modo módulo executa `apt2sb` ou `script2sb` em um ambiente isolado de construção de módulos. Ele grava os arquivos resultantes `.sb` no primeiro local gravável abaixo:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

O primeiro caminho é o diretório de módulos no armazenamento de boot MiniOS atual. Um módulo criado ali não é ativado na sessão atual pela Loja de aplicativos MiniOS. Deixe o módulo nesse diretório e reinicie para carregá-lo na próxima inicialização. O resultado permanece disponível apenas se o armazenamento de boot subjacente for gravável e mantiver o arquivo.

O segundo caminho é um fallback usado quando o diretório normal de módulos não é gravável. Um módulo no diretório de fallback não faz parte automaticamente do próximo boot ao vivo. Use `Open folder`, depois copie o módulo finalizado para o diretório `minios/modules` em uma mídia de boot MiniOS gravável antes de reiniciar.

Um módulo combinado contém todas as receitas selecionadas. Com empacotamento separado, uma falha pode afetar uma receita enquanto os módulos concluídos anteriormente no lote permanecem no diretório de destino.

### Modo sistema

O modo sistema utiliza o APT ou um script de receita diretamente no sistema de arquivos raiz em execução. As alterações têm efeito imediato no sistema ao vivo atual, em vez de gerar um módulo. Se essas alterações permanecem após a reinicialização depende da configuração de persistência da sessão.

O modo sistema não é transacional. Uma operação falha ou cancelada pode deixar pacotes, estado de repositório ou arquivos alterados por comandos anteriores.

## Serviço local e limite de confiança

O serviço `minios-store` é executado como root porque a construção de módulos e a instalação direta de pacotes exigem operações de montagem, overlay, chroot, APT e dpkg. Por padrão, ele escuta apenas em `ws://127.0.0.1:8765`. A interface web hospedada envia todos os dados da receita, incluindo scripts e URLs de download, para esse serviço local.

O daemon valida o formato da solicitação e o método de instalação suportado, mas não autentica nem assina independentemente o conteúdo da receita. Uma página que consiga acessar o endpoint WebSocket local pode solicitar tarefas de instalação privilegiadas. Portanto:

- Mantenha o daemon vinculado a `127.0.0.1`. Não exponha a porta `8765` para a LAN ou internet.
- Não defina `MINIOS_STORE_HOST` para um endereço que não seja de loopback, a menos que haja uma barreira de segurança adicional e revisada.
- Acesse a Loja de aplicativos MiniOS apenas pelo site oficial HTTPS e revise as receitas antes de instalar.
- Pare ou desative o serviço quando não precisar de instalação via navegador.

Gerencie o serviço systemd com:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

O manipulador de URI é um caminho separado. Ele inicia o instalador GTK via PolicyKit e não requer o daemon WebSocket. As entradas de URI atuais são interpretadas como nomes de pacotes APT, com nível de módulo e configuração de compressão solicitados. O instalador inicia após a autorização, portanto, revise a solicitação do navegador antes de aceitar o prompt de autenticação.

## Cancelamento

Selecione `Cancel` no diálogo de progresso web ou `Cancel installation` no instalador GTK. O cancelamento marca o lote como cancelado e encerra o processo filho atualmente monitorado. As receitas restantes não são iniciadas.

Cancelamento não é rollback. Pacotes ou módulos concluídos anteriormente permanecem, e um comando interrompido durante APT, dpkg, script, download ou construção de módulo pode deixar estado parcial ou um arquivo de saída incompleto. Após o cancelamento:

1. Leia o log final da instalação.
2. Verifique o diretório de módulos de destino para arquivos inesperados ou de tamanho zero.
3. Para modo sistema, execute `sudo dpkg --audit` e repare a configuração dos pacotes se necessário.
4. Remova apenas artefatos que você identificou como pertencentes à operação cancelada.

## Solução de problemas

### Loja de aplicativos MiniOS está offline

Verifique o acesso à rede para `https://store.minios.dev`. Um status `Offline` também significa que o navegador não está conectado ao daemon WebSocket local; a instalação ainda pode prosseguir pelo manipulador de URI se `minios-store-gui` estiver instalado.

### O navegador não consegue conectar ao daemon

Verifique o serviço e seus logs:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

O endpoint padrão é `ws://127.0.0.1:8765`. Um conflito de porta, serviço parado, ausência de `python3-websockets` ou restrições do navegador podem impedir a conexão. Reiniciar o navegador não resolve um daemon parado.

### Falha na autenticação ou nenhum prompt aparece

O instalador via URI requer PolicyKit, `pkexec` e um agente de autenticação de desktop ativo. Inicie o instalador a partir de uma sessão gráfica ativa e verifique se `minios-store-gui` está instalado. Não contorne o prompt expondo o daemon root na rede.

### Falha na construção do módulo

Expanda o log de instalação e utilize o erro do último comando, não apenas o resumo. Causas comuns incluem pacotes indisponíveis, falhas de repositório ou DNS, espaço livre insuficiente, ferramenta de compressão não suportada e diretório de módulos somente leitura. O daemon informa quando alterna para `/var/lib/minios-store/modules`.

### O aplicativo está ausente após a instalação

No modo módulo, reinicie após confirmar que o arquivo `.sb` está no diretório `minios/modules` da mídia de boot. Um arquivo deixado no diretório alternativo não é carregado automaticamente. No modo sistema em uma sessão live, verifique se a sessão é persistente caso o aplicativo desapareça após o reboot.

### Uma instalação de sistema cancelada deixou o dpkg inacabado

Verifique o estado dos pacotes antes de tentar novamente:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revise as alterações propostas pelo APT antes de confirmar qualquer operação de reparo adicional.

## Documentação relacionada

- [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruindo ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
