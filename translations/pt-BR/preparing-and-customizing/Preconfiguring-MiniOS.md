---
updated: 2026-10-06
program_commits:
    minios-configurator: 4d82e44c6ee6f04909e9dd3ef8e31389d3ac8817
---

# Pré-configurando MiniOS

O Configurador do MiniOS é um editor gráfico para configuração ao vivo do MiniOS. Ele valida as alterações e grava a configuração para um próximo boot. As escolhas iniciais de armazenamento de cache/log são aplicadas por `minios-boot`; os demais componentes do live-config são executados depois. Salvar não altera o sistema em execução diretamente.

## Iniciar o configurador

Abra o Configurador do MiniOS no menu do aplicativo ou execute:

```bash
minios-configurator
```

O destino padrão é `/etc/live/config.conf`. Para editar outro arquivo regular, informe seu caminho:

```bash
minios-configurator /path/to/config.conf
```

Salvar requer autenticação do PolicyKit. Links simbólicos e arquivos de destino não regulares são rejeitados.

## Configuração de mídia e tempo de execução

MiniOS pode ler a configuração de dois locais:

- `minios/config.conf` e `minios/config.conf.d/*.conf` na mídia ao vivo
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` no sistema de arquivos raiz em execução

O Configurador do MiniOS edita apenas o arquivo selecionado. Sem argumento de caminho, ele edita o arquivo de tempo de execução `/etc/live/config.conf`; não abre diretamente o arquivo da mídia. MiniOS sincroniza a configuração mais recente entre o sistema de arquivos em tempo de execução e a mídia MiniOS gravável durante a inicialização. Mídias somente leitura não podem receber alterações de tempo de execução, e a configuração persistente de tempo de execução pode permanecer independente da cópia na mídia.

Na inicialização, MiniOS sincroniza os arquivos da mídia e de tempo de execução pelo horário de modificação. Para as novas políticas de armazenamento, fragmentos mais recentes `config.conf.d` substituem o arquivo principal, `LIVE_CONFIG_CMDLINE` vem em seguida, e a linha de comando real do kernel prevalece por último.
Use `-i` para sobrepor configurações reconhecidas da linha de comando do kernel atual no editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

O arquivo selecionado permanece como destino de salvamento. Parâmetros desconhecidos do kernel são ignorados.

## Quando as configurações são aplicadas

Cada controle informa quando é utilizado. Salvar nunca aplica uma configuração à sessão atual.

### Aplicado após reinicialização

Nome do host, localidade, fuso horário, teclado, destino de boot, seleção de serviços, modo do módulo, manipulação de mídia do diretório do usuário, configurações de depuração, exportação de logs e as três configurações avançadas de armazenamento são lidas em um boot posterior. Reinicie após salvar para aplicar essas configurações.

Em **Avançado**, **Modo do módulo** aceita `simple` ou `merged`. Quando `LIVE_MODULE_MODE` está ausente da configuração selecionada, o Configurador do MiniOS apresenta `merged` como padrão efetivo. No modo mesclado, o live-config atualiza usuários, caches e o estado dos pacotes para que a configuração da pilha de módulos seja integrada ao sistema live em execução.

Em **Avançado**, **Armazenamento de logs do sistema**, **Cache de download do APT**, e **Cache do navegador** oferecem as opções `persistent` (padrão) ou `volatile`. As escolhas de `volatile` se aplicam apenas a uma sessão saudável e durável de `perch`. Logs de `minios-boot` e `live-config` permanecem persistentes mesmo quando os logs comuns são temporários. O estado dos pacotes APT e os perfis do navegador permanecem persistentes; apenas os logs e caches selecionados são movidos para o RAM com limite de espaço. A configuração do navegador é executada após a criação do usuário live. O Configurador avisa se o initrd em execução não possui o `perch-storage-v1` marcador necessário para essas configurações. Veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) antes de escolher tamanhos de RAM para máquinas com pouca memória.

### Usado apenas para uma nova sessão

Criação de conta, senhas de usuário e root, `noroot`, políticas de sudo e PolicyKit, políticas de SSH e XRDP, acesso ao X11, dicas de senha e bloqueio de tela são configurações aplicadas uma única vez. Uma sessão persistente normalmente registra os `live-config` componentes concluídos em `/var/lib/live/config/`, portanto, alterar esses valores e reiniciar a mesma sessão não recria a conta ou o estado de segurança. Inicie uma nova sessão para aplicá-los como configurações iniciais.

Perfis de segurança são predefinições do editor. O nome do perfil não é salvo; as configurações de segurança individuais são salvas e permanecem editáveis.

## Diretórios de usuário e persistência

O link e o bind mount de diretórios de usuário são mutuamente exclusivos. Ambos utilizam um meio de dados local gravável existente MiniOS e um caminho seguro relativo à mídia. Eles não estão disponíveis com `toram`, `toram=full`, ou `toram=trim`, e MiniOS não faz a mesclagem automática de duas árvores de diretórios já preenchidas.

`perchmode` e `perchsize` são parâmetros de boot do initramfs, não configurações do Configurador do MiniOS. Os novos controles de armazenamento de cache/log não selecionam nem criam uma `perch` sessão. O Configurador do MiniOS não cria, desbloqueia, redimensiona ou repara um container de persistência. Para persistência criptografada, ele informa se o marcador de criptografia do initramfs está presente.

## Comportamento ao salvar

A revisão lista apenas os valores alterados e oculta senhas. Ao salvar, apenas as chaves modificadas são atualizadas, preservando comentários, ordem, chaves desconhecidas, propriedade, permissões e atributos estendidos. A gravação é atômica.

Para a referência completa de variáveis e parâmetros de inicialização, consulte [Arquivo de configuração](/reference/configuration/config.conf), [Parâmetros de inicialização](/reference/Boot-Parameters), e [live-config](/reference/configuration/live-config).
