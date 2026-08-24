# MiniOS Store

O MiniOS Store oferece um catálogo de receitas de aplicativos em [store.minios.dev](https://store.minios.dev). No MiniOS, essas receitas podem ser instaladas diretamente no sistema em execução ou usadas para criar um ou mais módulos SquashFS (`.sb`).

A navegação pelo catálogo não exige um servidor local. A instalação sim: a interface web conecta-se ao daemon local do MiniOS Store ou abre o manipulador de URI `minios-store://` instalado.

## Antes de instalar

Abra os detalhes do aplicativo e revise as seguintes informações antes de adicioná-lo ao carrinho:

- Os nomes dos pacotes e o método de instalação.
- O script de instalação, quando exibido.
- A página oficial do aplicativo e informações do desenvolvedor.
- Se a receita faz download de um pacote Debian separado.

As receitas podem instalar pacotes via APT, baixar pacotes Debian ou executar scripts de shell. As operações de instalação são executadas com privilégios de root. Considere cada receita e todo download ou repositório utilizado como código privilegiado.

## Instalar um aplicativo

1. Abra o MiniOS Store pelo menu de aplicativos. O lançador verifica `https://store.minios.dev` e o abre no navegador padrão.
2. Pesquise ou navegue por categoria, abra os detalhes do aplicativo e confira os pacotes ou script.
3. Adicione um ou mais aplicativos ao carrinho.
4. Em uma sessão live do MiniOS, selecione `Module` ou `System`. Um sistema MiniOS instalado nativamente usa o modo `System` automaticamente.
5. Para múltiplos aplicativos no modo de módulo, escolha um módulo combinado ou módulos separados. Um módulo combinado também pode receber um nome personalizado.
6. Selecione `Install` e acompanhe o progresso e a saída dos comandos. A página utiliza o daemon local quando o status está `Connected`; caso contrário, tenta o manipulador de URI e pode exibir um prompt de autenticação do PolicyKit.

Apenas um lote de instalação pelo daemon pode ser executado por vez. Fechar o diálogo de progresso não interrompe necessariamente a instalação; reabra o indicador de instalação para visualizá-la ou cancele explicitamente.

## Modos de módulo e sistema

### Modo módulo

O modo módulo executa `apt2sb` ou `script2sb` em um ambiente isolado de construção de módulos. Os arquivos resultantes `.sb` são gravados no primeiro local gravável abaixo:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

O primeiro caminho é o diretório de módulos no armazenamento de boot atual do MiniOS. Um módulo criado ali não é ativado na sessão atual pelo MiniOS Store. Deixe o módulo nesse diretório e reinicie para carregá-lo no próximo boot. O resultado permanece disponível apenas se o armazenamento de boot for gravável e mantiver o arquivo.

O segundo caminho é um fallback usado quando o diretório normal de módulos não é gravável. Um módulo no diretório de fallback não faz parte automaticamente do próximo boot live. Use `Open folder` e depois copie o módulo finalizado para o diretório `minios/modules` em uma mídia de boot MiniOS gravável antes de reiniciar.

Um módulo combinado contém todas as receitas selecionadas. Com empacotamento separado, uma falha pode afetar uma receita enquanto módulos concluídos anteriormente permanecem no diretório de destino.

### Modo sistema

O modo sistema utiliza o APT ou um script de receita diretamente no sistema de arquivos raiz em execução. As alterações têm efeito imediato no sistema atual, em vez de gerar um módulo. Em uma sessão live, a persistência dessas alterações após o reboot depende da configuração de persistência da sessão. Em um sistema instalado nativamente, o MiniOS Store sempre usa o modo sistema.

O modo sistema não é transacional. Uma operação falha ou cancelada pode deixar pacotes, estado do repositório ou arquivos alterados por comandos anteriores.

## Serviço local e fronteira de confiança

O serviço `minios-store` é executado como root porque a construção de módulos e a instalação direta de pacotes exigem operações de montagem, overlay, chroot, APT e dpkg. Por padrão, ele escuta apenas em `ws://127.0.0.1:8765`. A interface web hospedada envia todos os dados da receita, incluindo scripts e URLs de download, para esse serviço local.

O daemon valida o formato da requisição e o método de instalação suportado, mas não autentica ou assina independentemente o payload da receita. Uma página que consiga acessar o endpoint WebSocket local pode solicitar operações privilegiadas de instalação. Portanto:

- Mantenha o daemon vinculado a `127.0.0.1`. Não exponha a porta `8765` para a LAN ou internet.
- Não defina `MINIOS_STORE_HOST` para um endereço que não seja de loopback, a menos que haja uma barreira de segurança adicional e revisada.
- Use o site oficial do Store via HTTPS e revise as receitas antes de instalar.
- Pare ou desative o serviço quando a instalação via navegador não for necessária.

Gerencie o serviço systemd com:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

O manipulador de URI é um caminho separado. Ele inicia o instalador GTK via PolicyKit e não requer o daemon WebSocket. As entradas de URI atuais são interpretadas como nomes de pacotes APT com um nível de módulo e configuração de compressão solicitados. O instalador inicia após a autorização, então revise a requisição do navegador antes de aceitar o prompt de autenticação.

## Cancelamento

Selecione `Cancel` no diálogo de progresso web ou `Cancel installation` no instalador GTK. O cancelamento marca o lote como cancelado e encerra o processo filho atualmente monitorado. As receitas restantes não são iniciadas.

O cancelamento não é rollback. Pacotes ou módulos concluídos anteriormente permanecem, e um comando interrompido durante APT, dpkg, script, download ou construção de módulo pode deixar estado parcial ou um arquivo de saída incompleto. Após o cancelamento:

1. Leia o log final de instalação.
2. Verifique o diretório de módulos de destino para arquivos inesperados ou de tamanho zero.
3. Para o modo sistema, execute `sudo dpkg --audit` e repare a configuração dos pacotes se necessário.
4. Remova apenas artefatos que você identificou como pertencentes à operação cancelada.

## Solução de problemas

### O Store está offline

Verifique o acesso à rede em `https://store.minios.dev`. Um status `Offline` também significa que o navegador não está conectado ao daemon WebSocket local; a instalação ainda pode prosseguir pelo manipulador de URI se `minios-store-gui` estiver instalado.

### O navegador não consegue conectar ao daemon

Verifique o serviço e seus logs:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

O endpoint padrão é `ws://127.0.0.1:8765`. Um conflito de porta, serviço parado, ausência de `python3-websockets` ou restrições do navegador podem impedir a conexão. Reiniciar o navegador não corrige um daemon parado.

### Falha na autenticação ou ausência de prompt

O instalador via URI requer PolicyKit, `pkexec` e um agente de autenticação de desktop ativo. Inicie o instalador a partir de uma sessão gráfica ativa e verifique se `minios-store-gui` está instalado. Não contorne o prompt expondo o daemon root na rede.

### Falha na construção do módulo

Expanda o log de instalação e utilize o erro do último comando em vez do resumo. As causas mais comuns incluem pacotes indisponíveis, falhas de repositório ou DNS, espaço livre insuficiente, ferramenta de compressão não suportada e diretório de módulos somente leitura. O daemon informa quando alterna para `/var/lib/minios-store/modules`.

### O aplicativo está ausente após a instalação

Para o modo módulo, reinicie após confirmar que o arquivo `.sb` está no diretório `minios/modules` da mídia de boot. Um arquivo deixado no diretório de fallback não é carregado automaticamente. Para o modo sistema em uma sessão live, verifique se a sessão é persistente caso o aplicativo tenha desaparecido após o reboot.

### Uma instalação de sistema cancelada deixou o dpkg inacabado

Verifique o estado dos pacotes antes de tentar novamente:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revise as alterações propostas pelo APT antes de confirmar qualquer operação de reparo adicional.

## Documentação relacionada

- [Criando módulos](/development/Creating-Modules.md)
- [Reconstruindo ISO](/development/Rebuilding-ISO.md)
