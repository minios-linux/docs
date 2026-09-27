---
updated: 2026-09-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Pré-configurando MiniOS

O Configurador do MiniOS é um editor gráfico para configuração ao vivo do MiniOS. Ele valida as alterações e grava a configuração para o próximo boot. As escolhas iniciais de cache/log são aplicadas pelo `minios-boot`; os demais componentes do live-config são executados depois. Salvar não altera o sistema em execução diretamente.

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

## Mídia e configuração em tempo de execução

MiniOS pode ler a configuração de dois locais:

- `minios/config.conf` e `minios/config.conf.d/*.conf` na mídia ao vivo
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` no sistema de arquivos raiz em execução

O Configurador do MiniOS edita apenas o arquivo selecionado. Sem argumento de caminho, ele edita o arquivo de tempo de execução `/etc/live/config.conf`; não abre diretamente o arquivo da mídia. MiniOS sincroniza as configurações mais recentes entre o sistema de arquivos em execução e as mídias MiniOS graváveis durante o boot. Mídias somente leitura não recebem alterações de tempo de execução, e a configuração persistente pode permanecer independente da cópia na mídia.

Na inicialização, MiniOS sincroniza os arquivos da mídia e de tempo de execução pelo horário de modificação. Para as novas políticas de armazenamento, `config.conf.d` fragmentos posteriores substituem o arquivo principal, `LIVE_CONFIG_CMDLINE` vem em seguida, e a linha de comando real do kernel prevalece por último.
Use `-i` para sobrepor as configurações reconhecidas da linha de comando do kernel atual no editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

O arquivo selecionado permanece como destino de salvamento. Parâmetros desconhecidos do kernel são ignorados.

## Quando as configurações são aplicadas

Cada controle informa quando será utilizado. Salvar nunca aplica uma configuração à sessão atual.

### Aplicado após reinicialização

Nome do host, localidade, fuso horário, teclado, alvo de inicialização, seleção de serviços, modo de módulos, manipulação de mídia de diretório de usuário, configurações de depuração, exportação de logs e as três configurações avançadas de armazenamento são lidas em um boot posterior. Reinicie após salvar para aplicar.

Em **Avançado**, **Armazenamento de logs do sistema**, **Cache de download do APT**, e **Cache do navegador** oferecem `persistent` (padrão) ou `volatile`. As escolhas de `volatile` se aplicam apenas a uma sessão saudável e durável de `perch` Logs de `minios-boot` e `live-config` permanecem persistentes mesmo quando os logs comuns são temporários. O estado dos pacotes APT e os perfis do navegador permanecem persistentes; apenas os logs e caches selecionados são movidos para o RAM limitado. A configuração do navegador é executada após a criação do usuário ao vivo. O Configurador avisa se o initrd em execução não possui o marcador `perch-storage-v1` necessário para essas configurações. Veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) antes de escolher tamanhos de RAM para máquinas com pouca memória.

### Usado apenas para uma nova sessão

Criação de conta, senhas de usuário e root, `noroot`, política de sudo e PolicyKit, política de SSH e XRDP, acesso ao X11, dicas de senha e bloqueio de tela são configurações de uso único. Uma sessão persistente normalmente registra componentes `live-config` concluídos em `/var/lib/live/config/`, então alterar esses valores e reiniciar a mesma sessão não recria a conta ou o estado de segurança. Inicie uma nova sessão para aplicar essas configurações como iniciais.

Perfis de segurança são predefinições do editor. O nome do perfil não é salvo; as configurações individuais de segurança são salvas e permanecem editáveis.

## Diretórios de usuário e persistência

A vinculação e montagem por bind de diretórios de usuário são mutuamente exclusivas. Ambas utilizam uma mídia de dados local MiniOS gravável já existente e um caminho seguro relativo à mídia. Não estão disponíveis com `toram`, `toram=full`, ou `toram=trim`, e MiniOS não faz a mesclagem automática de duas árvores de diretórios já preenchidas.

`perchmode` e `perchsize` são parâmetros de boot do initramfs, não configurações do Configurador do MiniOS. Os novos controles de armazenamento de cache/log não selecionam nem criam uma sessão de `perch` persistência. O Configurador do MiniOS não cria, desbloqueia, redimensiona ou repara um contêiner de persistência. Para persistência criptografada, ele informa se o marcador de criptografia do initramfs está presente.

## Comportamento ao salvar

A revisão lista apenas os valores alterados e oculta as senhas. Ao salvar, apenas as chaves modificadas são atualizadas, preservando comentários, ordem, chaves desconhecidas, propriedade, permissões e atributos estendidos. A gravação é atômica.

Para referência completa de variáveis e parâmetros de boot, consulte [Arquivo de configuração](/reference/configuration/config.conf), [Parâmetros de boot](/reference/Boot-Parameters) e [live-config](/reference/configuration/live-config).
