---
updated: 2026-08-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Pré-configurando MiniOS

O Configurador do MiniOS é um editor gráfico para as configurações de MiniOS `live-config`. Ele valida as alterações e grava a configuração para o próximo boot. Não altera o sistema em execução diretamente.

## Iniciar o configurador

Abra o Configurador do MiniOS no menu de aplicativos ou execute:

```bash
minios-configurator
```

O destino padrão é `/etc/live/config.conf`. Para editar outro arquivo regular, informe seu caminho:

```bash
minios-configurator /path/to/config.conf
```

Para salvar, é necessária autenticação do PolicyKit. Links simbólicos e arquivos de destino que não sejam regulares são rejeitados.

## Configuração de mídia e em tempo de execução

O MiniOS pode ler configurações de dois locais:

- `minios/config.conf` e `minios/config.conf.d/*.conf` na mídia ao vivo
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` no sistema de arquivos raiz em execução

O Configurador do MiniOS edita apenas o arquivo selecionado. Sem argumento de caminho, ele edita o arquivo de runtime `/etc/live/config.conf`; não abre diretamente o arquivo da mídia. O MiniOS sincroniza configurações mais recentes entre o sistema de arquivos em execução e mídias MiniOS graváveis durante o boot. Mídias somente leitura não podem receber alterações de runtime, e configurações persistentes de runtime podem permanecer independentes da cópia da mídia.

Para uma determinada opção, parâmetros do kernel têm prioridade sobre arquivos de configuração, e a configuração da mídia tem prioridade sobre a configuração do sistema de arquivos raiz.
Use `-i` para sobrepor as configurações reconhecidas da linha de comando do kernel atual no editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

O arquivo selecionado permanece como destino de salvamento. Parâmetros de kernel desconhecidos são ignorados.

## Quando as configurações são aplicadas

Cada controle informa quando será utilizado. Salvar nunca aplica uma configuração à sessão atual.

### Aplicado após reinicialização

Nome do host, localidade, fuso horário, teclado, destino de boot, seleção de serviços, modo de módulos, manipulação de mídia de diretório de usuário, configurações de depuração e exportação de logs são lidos em um próximo boot. Reinicie após salvar para aplicar essas configurações.

### Usado apenas para uma nova sessão

Criação de conta, senhas de usuário e root, `noroot`, política de sudo e PolicyKit, política de SSH e XRDP, acesso ao X11, dicas de senha e bloqueio de tela são configurações de uso único. Uma sessão persistente normalmente registra componentes `live-config` concluídos em `/var/lib/live/config/`, então alterar esses valores e reiniciar a mesma sessão não recria a conta ou o estado de segurança. Inicie uma nova sessão para aplicar essas configurações como iniciais.

Perfis de segurança são predefinições do editor. O nome do perfil não é salvo; as configurações individuais de segurança são salvas e permanecem editáveis.

## Diretórios de usuário e persistência

Vincular e montar diretórios de usuário via bind são opções mutuamente exclusivas. Ambas utilizam uma mídia de dados MiniOS local gravável existente e um caminho seguro relativo à mídia. Não estão disponíveis com `toram`, `toram=full` ou `toram=trim`, e o MiniOS não mescla automaticamente duas árvores de diretórios já populadas.

`perchmode` e `perchsize` são parâmetros de boot do initramfs, não configurações do Configurador do MiniOS. O Configurador do MiniOS não cria, desbloqueia, redimensiona ou repara um container de persistência. Para persistência criptografada, ele apenas informa se o marcador de criptografia do initramfs está presente.

## Comportamento ao salvar

A revisão lista apenas os valores alterados e oculta as senhas. Ao salvar, apenas as chaves modificadas são atualizadas, preservando comentários, ordem, chaves desconhecidas, propriedade, permissões e atributos estendidos. A gravação é atômica.

Para referência completa de variáveis e parâmetros de boot, consulte [Arquivo de configuração](/reference/configuration/config.conf), [Parâmetros de boot](/reference/Boot-Parameters) e [live-config](/reference/configuration/live-config).
