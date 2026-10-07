---
updated: 2026-10-06
program_commits:
    minios-store: eec5785dd7eb547961c2799f1907496a33be2e8c
---

# Instalando softwares

A Loja de aplicativos MiniOS oferece um catálogo de receitas de aplicativos em [store.minios.dev](https://store.minios.dev). No ambiente ao vivo MiniOS, essas receitas podem ser instaladas diretamente no sistema em execução ou usadas para construir um ou mais SquashFS (`.sb`) módulos.

Esta página descreve o fluxo de trabalho de software ao vivo MiniOS. Uma instalação nativa mantém o desktop selecionado e os aplicativos comuns, mas remove o software específico para uso ao vivo MiniOS. Utilize o fluxo de trabalho padrão de gerenciamento de pacotes do Debian nesse sistema instalado.

Navegar pelo catálogo não exige um servidor local. A instalação exige: a interface web conecta-se ao daemon local da Loja de aplicativos MiniOS ou abre o `minios-store://` manipulador de URI instalado.

## Antes de instalar

Abra os detalhes do aplicativo e revise as seguintes informações antes de adicioná-lo ao carrinho:

- Os nomes dos pacotes e o método de instalação.
- O script de instalação, quando exibido.
- A página inicial do aplicativo e informações do desenvolvedor.
- Capturas de tela e artes do aplicativo, quando disponíveis. Estes são metadados de apresentação, não garantem que uma receita seja confiável.
- Se a receita faz download de um pacote Debian separado.
- Qualquer licença de software adicional exibida pela receita. Receitas marcadas como exigindo aceite não podem ser instaladas até que você aceite explicitamente essa licença.

As receitas podem instalar pacotes APT, baixar pacotes Debian ou executar scripts de shell. As operações de instalação são executadas com privilégios de root. Considere uma receita e todo download ou repositório utilizado como código privilegiado.

## Instalar um aplicativo

1. Abra a Loja de aplicativos MiniOS no menu de aplicativos. O lançador verifica `https://store.minios.dev` e abre no navegador padrão.
2. Pesquise ou navegue por categoria, abra os detalhes do aplicativo e verifique os pacotes ou script.
3. Adicione um ou mais aplicativos ao carrinho.
4. Em uma sessão ao vivo MiniOS, selecione `Module` ou `System`.
5. No modo de módulo, escolha o nível de construção quando necessário. **Padrão da receita** mantém o nível configurado de cada receita; **Automático** usa todos os módulos carregados como base e gera um nome de módulo sem numeração; um nível numérico de `01` até `09` utiliza apenas os módulos carregados até esse nível. Prefira o Padrão da receita, a menos que precise evitar dependências de camadas opcionais superiores.
6. Para múltiplos aplicativos no modo de módulo, selecione um módulo combinado ou módulos separados. Um módulo combinado também pode receber um nome personalizado.
7. Aceite quaisquer licenças de receitas que exijam aceite explícito.
8. Selecione `Install` e acompanhe o progresso e a saída dos comandos. A página utiliza o daemon local quando o status está `Connected`; caso contrário, tenta o manipulador de URI e pode exibir um prompt de autenticação do PolicyKit.

Apenas um lote de instalação pelo daemon pode ser executado por vez. Fechar o diálogo de progresso não interrompe necessariamente a instalação; reabra o indicador de instalação para visualizar ou cancele explicitamente.

## Modos de módulo e de sistema

### Modo módulo

O modo módulo executa `apt2sb` ou `script2sb` em um ambiente isolado de construção de módulos. Ele grava os arquivos resultantes de `.sb` no primeiro local gravável abaixo:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

O primeiro caminho é o diretório de módulos no armazenamento de boot atual MiniOS. Um módulo criado ali não é ativado na sessão atual pela Loja de aplicativos MiniOS. Deixe o módulo nesse diretório e reinicie para carregá-lo no próximo boot. O resultado permanece disponível apenas se o armazenamento de boot for gravável e mantiver o arquivo.

O segundo caminho é um local alternativo usado quando o diretório de módulos normal não é gravável. Um módulo nesse diretório alternativo não faz parte automaticamente do próximo boot ao vivo. Use `Open folder`, depois copie o módulo finalizado para o diretório `minios/modules` no meio de boot gravável MiniOS antes de reiniciar.

Um módulo combinado contém todas as receitas selecionadas. Com empacotamento separado, uma falha pode afetar uma receita enquanto módulos concluídos anteriormente permanecem no diretório de destino.

### Modo sistema

O modo sistema utiliza o APT ou um script de receita diretamente no sistema de arquivos raiz em execução. As alterações têm efeito imediato no sistema ao vivo atual, em vez de gerar um módulo. Se essas alterações persistem após reiniciar depende da configuração de persistência da sessão.

O modo sistema não é transacional. Uma operação falha ou cancelada pode deixar pacotes, estado do repositório ou arquivos alterados por comandos anteriores.

## Serviço local e limite de confiança

O serviço `minios-store` é executado como root porque a construção de módulos e a instalação direta de pacotes exigem operações de montagem, overlay, chroot, APT e dpkg. Por padrão, ele escuta apenas em `ws://127.0.0.1:8765`. A interface web hospedada envia todos os dados da receita, incluindo scripts e URLs de download, para esse serviço local.

O daemon valida o formato da solicitação e o método de instalação suportado, mas não autentica ou assina independentemente o conteúdo da receita. Uma página que consiga acessar o endpoint WebSocket local pode solicitar operações privilegiadas de instalação. Portanto:

- Mantenha o daemon vinculado a `127.0.0.1`. Não exponha a porta `8765` para a LAN ou internet.
- Não defina `MINIOS_STORE_HOST` para um endereço que não seja de loopback, a menos que uma barreira de segurança adicional e revisada esteja em vigor.
- Acesse a Loja de aplicativos MiniOS apenas pelo site oficial HTTPS e inspecione as receitas antes de instalar.
- Pare ou desative o serviço quando a instalação via navegador não for necessária.

Gerencie o serviço systemd com:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

O manipulador de URI é um caminho separado. Ele inicia o instalador GTK via PolicyKit e não requer o daemon WebSocket. Os links atuais da Store incluem toda a receita codificada para que receitas APT, script e DEB baixado possam usar o mesmo caminho alternativo; aceitações de licença explícitas são transmitidas separadamente e revalidadas pelo instalador local. O formato antigo `recipes=id:level:compression` permanece como compatibilidade e é interpretado como uma receita APT. O instalador inicia após autorização, então revise a solicitação do navegador antes de aceitar o prompt de autenticação.

## Cancelamento

Selecione `Cancel` no diálogo de progresso web ou `Cancel installation` no instalador GTK. O cancelamento marca o lote como cancelado e encerra o processo filho em execução. As receitas restantes não serão iniciadas.

O cancelamento não é reversão. Pacotes ou módulos já concluídos permanecem, e um comando interrompido durante APT, dpkg, script, download ou construção de módulo pode deixar estado parcial ou um arquivo de saída incompleto. Após o cancelamento:

1. Leia o log final da instalação.
2. Verifique o diretório de módulos de destino para arquivos inesperados ou de tamanho zero.
3. Para modo sistema, execute `sudo dpkg --audit` e repare a configuração dos pacotes se necessário.
4. Remova apenas os artefatos que você identificar como pertencentes à operação cancelada.

## Solução de problemas

### A Loja de aplicativos MiniOS está offline

Verifique o acesso de rede a `https://store.minios.dev`. Um status `Offline` também indica que o navegador não está conectado ao daemon WebSocket local; a instalação ainda pode prosseguir pelo manipulador de URI se `minios-store-gui` estiver instalado.

### O navegador não consegue conectar ao daemon

Verifique o serviço e seus logs:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

O endpoint padrão é `ws://127.0.0.1:8765`. Um conflito de porta, serviço parado, ausência de `python3-websockets`, ou restrições do navegador podem impedir a conexão. Reiniciar o navegador não corrige um daemon parado.

### A autenticação falha ou nenhum prompt aparece

O instalador URI requer PolicyKit, `pkexec`, e um agente de autenticação de desktop ativo. Inicie o instalador a partir de uma sessão gráfica ativa e verifique se `minios-store-gui` está instalado. Não contorne o prompt expondo o daemon root na rede.

### Falha na construção do módulo

Expanda o log de instalação e utilize o erro do último comando, não apenas o resumo. As causas mais comuns incluem pacotes indisponíveis, falhas de repositório ou DNS, espaço livre insuficiente, ferramenta de compactação não suportada e diretório de módulos somente leitura. O daemon informa quando alterna para `/var/lib/minios-store/modules`.

### O aplicativo está ausente após a instalação

No modo módulo, reinicie após confirmar que o arquivo `.sb` está no diretório `minios/modules` da mídia de boot. Um arquivo deixado no diretório alternativo não é carregado automaticamente. No modo sistema em sessão ao vivo, verifique se a sessão é persistente caso o aplicativo tenha sumido após reiniciar.

### Uma instalação de sistema cancelada deixou o dpkg incompleto

Verifique o estado dos pacotes antes de tentar novamente:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revise as alterações APT propostas antes de confirmar qualquer operação de reparo adicional.

## Documentação relacionada

- [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruindo ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
