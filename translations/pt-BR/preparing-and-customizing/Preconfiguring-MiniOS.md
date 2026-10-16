---
updated: 2026-10-15
program_commits:
    minios-configurator: 7705e764f152d2d2ae2268ce3ddde7e0adbad8bc
---

# Pré-configuração do MiniOS

O Configurador do MiniOS é um editor gráfico da configuração ativa do MiniOS. Ele valida as alterações e grava a configuração para uma inicialização futura. As escolhas iniciais de armazenamento de cache/log são aplicadas por `minios-boot`; os demais componentes da configuração ativa são executados posteriormente. Salvar não altera diretamente o sistema em execução.

## Iniciar o configurador

Abra o Configurador do MiniOS pelo menu de aplicativos ou execute:

```bash
minios-configurator
```

O destino padrão é `/etc/live/config.conf`. Para editar outro arquivo comum, informe o caminho:

```bash
minios-configurator /path/to/config.conf
```

Para salvar, é necessária a autenticação do PolicyKit. Links simbólicos e arquivos de destino que não sejam arquivos comuns são rejeitados.

## Configuração de mídia e ambiente de execução

O MiniOS pode ler a configuração de dois locais:

- `minios/config.conf` e `minios/config.conf.d/*.conf` na mídia ativa
- `/etc/live/config.conf` e `/etc/live/config.conf.d/*.conf` no sistema de arquivos raiz em execução

O Configurador do MiniOS edita somente o arquivo selecionado. Sem um argumento de caminho, ele edita o arquivo de ambiente de execução `/etc/live/config.conf`; ele não abre diretamente o arquivo da mídia. O MiniOS sincroniza as configurações mais recentes entre o sistema de arquivos de execução e as mídias graváveis MiniOS durante a inicialização. Mídias somente leitura não podem receber alterações de execução, e a configuração persistente de execução pode permanecer independente da cópia na mídia.

Na inicialização, o MiniOS sincroniza os arquivos da mídia e do ambiente de execução com base no horário de modificação. Para as novas políticas de armazenamento, fragmentos posteriores de `config.conf.d` substituem o arquivo principal, `LIVE_CONFIG_CMDLINE` vem em seguida e a linha de comando real do kernel tem a última palavra.
Use `-i` para aplicar no editor as configurações reconhecidas da linha de comando atual do kernel:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

O arquivo selecionado continua sendo o destino ao salvar. Parâmetros desconhecidos do kernel são ignorados.

## Quando as configurações são aplicadas

Cada controle informa quando é usado. Salvar nunca aplica uma configuração à sessão atual.

### Aplicado após reiniciar

Nome do host, localidade, fuso horário, teclado, destino de inicialização, seleção de serviços, modo de módulo, tratamento de mídia do diretório do usuário, configurações de depuração, exportação de logs e as três configurações avançadas de armazenamento são lidos na próxima inicialização. Reinicie após salvar para aplicá-los.

Em **Avançado**, **Modo de módulo** aceita `simple` ou `merged`. Quando `LIVE_MODULE_MODE` estiver ausente da configuração selecionada, o Configurador do MiniOS apresenta `merged` como padrão efetivo. No modo mesclado, o live-config atualiza usuários, caches e o estado dos pacotes para integrar à sessão do sistema live a configuração da pilha de módulos.

Em **Avançado**, **Armazenamento de logs do sistema**, **Cache de download do APT** e **Cache do navegador** oferecem `persistent` (padrão) ou `volatile`. Essas opções são aplicadas após a ativação bem-sucedida da persistência, inclusive em uma sessão gravável copiada do RAM com informações de origem protegidas. Com persistência durável, os diagnósticos de inicialização do MiniOS, o estado dos pacotes APT e os perfis do navegador permanecem no armazenamento; somente os logs e caches selecionados são movidos para o RAM limitado. Em uma sessão copiada do RAM, o estado mantido ainda precisa ser salvo com sucesso no armazenamento. Os caches RAM do APT e do navegador exigem pelo menos 1 GiB disponível e ausência de swap que não seja zRAM. A configuração do navegador é executada após a criação do usuário. O Configurador avisa se o initrd não tiver o marcador necessário`perch-storage-v1` marcador. Consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para ver os limites fixos do RAM.

### Usado somente em uma nova sessão

Criação de conta, senhas de usuário e root, `noroot`, políticas do sudo e do PolicyKit, políticas de SSH e XRDP, acesso X11, dicas de senha e bloqueio de tela são configurações de uso único. Uma sessão persistente normalmente registra os componentes de `live-config` concluídos em `/var/lib/live/config/`, portanto, alterar esses valores e reiniciar a mesma sessão não recria a conta nem o estado de segurança. Inicie uma nova sessão para aplicá-los como configurações iniciais.

Os perfis de segurança são predefinições do editor. O nome do perfil não é salvo; as configurações de segurança individuais são salvas e continuam editáveis.

## Diretórios de usuário e persistência

A vinculação e a montagem bind de diretórios de usuário são mutuamente exclusivas. Ambas usam uma mídia de dados local gravável existente do tipo MiniOS e um caminho relativo à mídia seguro. Elas não estão disponíveis com `toram`, `toram=full` ou `toram=trim`, nem quando a sessão de persistência ativa é criptografada com LUKS. A cópia de volta também é bloqueada em uma sessão criptografada. O MiniOS não mescla automaticamente duas árvores de diretórios que já contenham arquivos.

`perchmode` e `perchsize` são parâmetros de inicialização do initramfs, não configurações do Configurador do MiniOS. Os novos controles de armazenamento de cache e logs não selecionam nem criam uma sessão de `perch`. O Configurador do MiniOS não cria, desbloqueia, redimensiona nem repara um contêiner de persistência. Para persistência criptografada, ele informa se o marcador de criptografia do initramfs está presente.

## Comportamento ao salvar

A revisão lista somente os valores alterados e oculta as senhas. Ao salvar, somente as chaves alteradas são atualizadas, preservando comentários, ordem, chaves desconhecidas, propriedade, permissões e atributos estendidos. A gravação é atômica.

Para consultar a referência completa de variáveis e parâmetros de inicialização, veja [Arquivo de configuração](/reference/configuration/config.conf), [Parâmetros de inicialização](/reference/Boot-Parameters) e [live-config](/reference/configuration/live-config).
