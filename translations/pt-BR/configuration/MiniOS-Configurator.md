# MiniOS Configurator

MiniOS Configurator é um editor gráfico para as configurações `live-config` do MiniOS. Ele valida as alterações e grava a configuração para o próximo boot. Não altera o sistema em execução diretamente.

## Iniciar o configurador

Abra o MiniOS Configurator no menu de aplicativos ou execute:

```bash
minios-configurator
```

O destino padrão é `/etc/live/config.conf`. Para editar outro arquivo regular,
informe o caminho dele:

```bash
minios-configurator /path/to/config.conf
```

Salvar requer autenticação pelo PolicyKit. Links simbólicos e arquivos de destino não regulares
são rejeitados.

## Configuração de mídia e tempo de execução

O MiniOS pode ler configurações de dois locais:

- `minios/config.conf` e `minios/config.conf.d/*.conf` na mídia live
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` no sistema de arquivos root em execução

O Configurator edita apenas o arquivo selecionado. Sem argumento de caminho, ele edita
o arquivo de tempo de execução `/etc/live/config.conf`; não abre diretamente o arquivo da mídia.
O MiniOS sincroniza configurações mais recentes entre o sistema de arquivos de tempo de execução
e a mídia MiniOS gravável durante o boot. Mídias somente leitura não recebem alterações de tempo de execução, e configurações persistentes de tempo de execução podem permanecer independentes da cópia na mídia.

Para uma determinada opção, parâmetros do kernel têm prioridade sobre arquivos de configuração,
e a configuração da mídia tem prioridade sobre a configuração do sistema de arquivos root.
Use `-i` para sobrepor as configurações reconhecidas da linha de comando do kernel atual no editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

O arquivo selecionado continua sendo o destino de salvamento. Parâmetros de kernel desconhecidos são ignorados.

## Quando as configurações são aplicadas

Cada controle informa quando é utilizado. Salvar nunca aplica uma configuração à sessão atual.

### Aplicado após reinicialização

Nome do host, localidade, fuso horário, teclado, destino de boot, seleção de serviços, modo de módulo, manipulação de diretórios do usuário na mídia, configurações de debug e exportação de logs são lidos em um boot posterior. Reinicie após salvar para aplicar essas configurações.

### Usado apenas para uma nova sessão

Criação de conta, senhas de usuário e root, `noroot`, políticas de sudo e PolicyKit,
políticas de SSH e XRDP, acesso ao X11, dicas de senha e bloqueio de tela são configurações de uso único.
Uma sessão persistente normalmente registra componentes `live-config` concluídos em `/var/lib/live/config/`, então alterar esses valores e reiniciar a mesma sessão não recria a conta ou o estado de segurança. Inicie uma nova sessão para aplicá-los como configurações iniciais.

Perfis de segurança são predefinições do editor. O nome do perfil não é salvo; as configurações individuais de segurança são salvas e permanecem editáveis.

## Diretórios do usuário e persistência

Vincular e montar diretórios do usuário por bind são mutuamente exclusivos. Ambos utilizam uma mídia de dados MiniOS local gravável existente e um caminho seguro relativo à mídia. Não estão disponíveis com `toram`, `toram=full` ou `toram=trim`, e o MiniOS não mescla automaticamente duas árvores de diretórios já populadas.

`perchmode` e `perchsize` são parâmetros de boot do initramfs, não configurações do Configurator. O Configurator não cria, desbloqueia, redimensiona ou repara um container de persistência. Para persistência criptografada, ele apenas informa se o marcador de criptografia do initramfs está presente.

## Comportamento de salvamento

A revisão lista apenas os valores alterados e oculta as senhas. O salvamento atualiza apenas as chaves modificadas, preservando comentários, ordem, chaves desconhecidas, propriedade, permissões e atributos estendidos. A gravação é atômica.

Para a referência completa de variáveis e parâmetros de boot, consulte
[Arquivo de configuração](/configuration/Configuration-File.md),
[Parâmetros de boot](/configuration/Boot-Parameters.md) e
[live-config](/configuration/live-config.md).
