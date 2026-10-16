---
updated: 2026-10-15
---

# config.conf

`config.conf` é o principal arquivo de pré-configuração de MiniOS. Em uma mídia MiniOS comum, ele fica armazenado em `minios/config.conf`. Durante a inicialização, o initramfs sincroniza esse arquivo com `/etc/live/config.conf` no sistema montado.

Use este arquivo para preparar como MiniOS é iniciado e como uma nova sessão persistente é inicializada. Ele é principalmente um mecanismo de pré-configuração voltado para administradores, e não substitui as ferramentas de configuração usuais do desktop em execução.

## Reconfiguração

A coluna **Reconfigurável** abaixo usa estes significados:

- **Sim** — a configuração pode ser alterada e aplicada novamente em uma inicialização posterior.
- **Somente na primeira inicialização** — a configuração é usada quando o estado persistente correspondente é criado pela primeira vez e, normalmente, não é aplicada novamente em inicializações subsequentes.

Essa distinção faz parte do comportamento que os usuários precisam conhecer. Os arquivos internos de estado `live-config` são detalhes de implementação e não substituem essa informação.

## Configuração gerada

Uma imagem atual de MiniOS gera um arquivo `config.conf` com esta estrutura geral:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
Os valores exatos dependem da imagem e da configuração da compilação.

::: warning `LIVE_CONFIG_CMDLINE` não é a linha de comando do initramfs
`LIVE_CONFIG_CMDLINE` fornece opções depois que a raiz MiniOS é montada. Parâmetros como `from=`, `load=`, `toram`, e `perchdir=` precisam ser parâmetros reais de inicialização do kernel; incluí-los somente em `LIVE_CONFIG_CMDLINE` é tarde demais para afetar o initramfs. As opções de política de armazenamento `log-storage=`, `apt-cache=`, e `browser-cache=` são uma exceção específica: `minios-boot` as lê de `LIVE_CONFIG_CMDLINE` antes da inicialização dos serviços normais.
:::

## Parâmetros padrão

| Parâmetro | Reconfigurável | Significado |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sim | Opções adicionais de configuração em tempo real. A linha de comando real do kernel é acrescentada depois e prevalece em caso de opções repetidas. |
| `LIVE_HOSTNAME` | Sim | Nome do host do sistema. |
| `LIVE_USERNAME` | Somente na primeira inicialização | Nome do usuário live criado durante a configuração inicial. |
| `LIVE_USER_FULLNAME` | Somente na primeira inicialização | Nome completo do usuário live. |
| `LIVE_USER_DEFAULT_GROUPS` | Somente na primeira inicialização | Grupos suplementares atribuídos quando o usuário live é criado. |
| `LIVE_USER_PASSWORD_CRYPTED` | Somente na primeira inicialização | Hash crypt da senha do usuário live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Somente na primeira inicialização | Hash crypt da senha do root. |
| `LIVE_CONFIG_NOROOT` | Somente na primeira inicialização | Quando ativada, desativa a configuração de privilégios de senha do root, sudo e PolicyKit em MiniOS. |
| `LIVE_LOCALES` | Sim | Uma ou mais localidades do sistema. |
| `LIVE_TIMEZONE` | Sim | Fuso horário do sistema, por exemplo `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sim | Modelo de teclado XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sim | Layouts de teclado separados por vírgulas. |
| `LIVE_KEYBOARD_OPTIONS` | Sim | Opções de teclado XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sim | Variantes separadas por vírgulas, correspondentes aos layouts configurados. |
| `LIVE_CONFIG_DEBUG` | Sim | Ativa a saída de depuração do live-config quando definido como `true`. |
| `LIVE_LINK_USER_DIRS` | Sim | Cria links para os diretórios de usuário gerenciados no local configurado em mídia MiniOS gravável. Indisponível no modo bind, em qualquer modo `toram` ou em uma sessão persistente ativa criptografada com LUKS. |
| `LIVE_BIND_USER_DIRS` | Sim | Monta os diretórios de usuário gerenciados por bind a partir do local configurado em mídia MiniOS gravável. Indisponível no modo link, em qualquer modo `toram` ou em uma sessão persistente ativa criptografada com LUKS. |
| `LIVE_USER_DIRS_PATH` | Sim | Local usado pelo modo link/bind para diretórios de usuário. |
| `LIVE_MODULE_MODE` | Sim | Seleciona `simple` ou `merged` a integração com o módulo live-config. |
| `LIVE_LOG_STORAGE` | Sim | `persistent` (padrão) ou `volatile` para os logs normais do sistema. Os diagnósticos de inicialização continuam persistentes; consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Sim | `persistent` (padrão) ou `volatile` para arquivos APT baixados; o estado dos pacotes e as listas de repositórios permanecem persistentes. |
| `LIVE_BROWSER_CACHE` | Sim | `persistent` (padrão) ou `volatile` para os caminhos padrão de cache dos navegadores nativos. Os perfis dos navegadores permanecem persistentes. |
| `DEFAULT_TARGET` | Sim | Alvo de inicialização: `graphical.target`, `multi-user.target`, ou `rescue.target`. |
| `ENABLE_SERVICES` | Sim | Serviços separados por vírgulas, ativados na inicialização por meio de `minios-svc`. |
| `DISABLE_SERVICES` | Sim | Serviços separados por vírgulas, desativados na inicialização por meio de `minios-svc`. |
| `EXPORT_LOGS` | Sim | Quando `true`, exporta MiniOS e os logs de inicialização do live-config para mídia MiniOS gravável. |

O arquivo gerado não é uma lista completa de tudo que é compatível com `minios-live-config`. É possível adicionar manualmente outras variáveis para pré-configuração de redes cabeadas, postura de segurança, hooks, preseed, Xorg e outros componentes. Consulte [live-config](/reference/configuration/live-config) para ver a referência completa.

O componente `user-media` recusa tanto a ativação quanto a cópia de volta enquanto a sessão persistente ativa estiver criptografada com LUKS. Ele usa o estado real da criptografia em tempo de execução: o parâmetro de kernel `perchencrypt=luks` apenas solicita a criptografia ao criar uma nova sessão e não descreve uma sessão existente.

## Pré-configuração de rede cabeada

MiniOS pode pré-configurar uma política de **IPv4 cabeado** por meio do componente `network`. Isso serve para pré-configurar administrativamente um sistema antes de iniciá-lo no hardware de destino.
Por exemplo:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Essas configurações são aplicadas **somente na primeira inicialização** à política de rede persistente. Após a aplicação bem-sucedida, o componente registra `/var/lib/live/config/network`.
Alterar os valores não substitui uma sessão persistente já configurada, a menos que esse estado seja redefinido intencionalmente.

`LIVE_NETWORK_METHOD=static` grava uma política estática. `off` desativa o IPv4 automático para a interface selecionada. Um valor não definido ou `dhcp` mantém inalterada a configuração de rede existente na imagem. `LIVE_NETWORK_BACKEND=auto` dá preferência ao NetworkManager e usa o ifupdown como alternativa.

Este recurso não configura Wi-Fi. Após a inicialização, as conexões de rede cabeadas e sem fio são gerenciadas normalmente pelo NetworkManager. Consulte [Rede](/using-minios/Networking) para usar a rede durante a execução e [live-config](/reference/configuration/live-config) para ver todas as variáveis de rede.

## MiniOS configurações do early userspace

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, e as três `LIVE_*` políticas de armazenamento acima são configurações de inicialização MiniOS, e não variáveis de componentes de configuração dinâmica tardia. MiniOS as aplica antes que o sistema de inicialização normal assuma o controle; `minios-boot` é responsável pelas três políticas de armazenamento. Todas são **Reconfigurável: Sim**.

Os parâmetros de inicialização correspondentes `default-target=`, `enable-services=`, e `disable-services=` têm prioridade na inicialização atual. O parâmetro `text` força `multi-user.target`.

As versões atuais do Toolbox e do Ultra adicionam `ssh` a `ENABLE_SERVICES`. Para desativar o SSH explicitamente, adicione-o a `DISABLE_SERVICES`; apenas removê-lo de `ENABLE_SERVICES` não solicita a desativação.

Com `EXPORT_LOGS="true"`, a mídia MiniOS gravável recebe os logs de inicialização abaixo:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Os logs correspondentes em tempo de execução estão em `/var/log/minios/minios-boot.log` e `/var/log/live/config.log`.

<a id="cache-and-log-policy-for-a-persistent-session"></a>

## Política de cache e registros para uma sessão persistente

Para reduzir as gravações durante uma sessão `perch` persistente, adicione as configurações separadamente:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Elas também aceitam `persistent`, o valor padrão. `minios-boot` aceita as mesmas configurações de `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), ou dos parâmetros do kernel. Fragmentos posteriores substituem os anteriores; o bloco de parâmetros prevalece sobre as chaves do arquivo, e os parâmetros efetivos do kernel têm a última palavra. As três opções são independentes e, por si só, não solicitam persistência. Um initrd compatível anuncia `perch-storage-v1` em `/run/initramfs/etc/minios-initramfs-storage`; o Configurador do MiniOS avisa quando o initrd atual não anuncia esse recurso.

As políticas exigem que a ativação da persistência seja bem-sucedida, seja em um armazenamento gravável durável, seja como uma sessão RAM gravável com informações `ram-origin` protegidas. Apenas o sistema `toram` não determina se a sessão é durável: `perchtoram=off` pode manter uma sessão armazenada, enquanto uma sessão copiada ainda precisa ser salva. Falhas de persistência e **Iniciar sem salvar** não se qualificam. Os diagnósticos de inicialização são mantidos separadamente dos registros voláteis comuns, mas continuam armazenados na memória em uma sessão copiada por RAM até serem salvos. O componente de cache do navegador é executado depois que o usuário ativo é criado. Consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para ver os limites de RAM, os caminhos compatíveis e as condições de admissão.

## Origem, cópia em tempo de execução e precedência

O diretório de dados selecionado do MiniOS normalmente contém estes arquivos de origem:

| Diretório de dados selecionado | Sistema em execução |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Em mídias montadas normalmente, eles aparecem como `minios/config.conf` e `minios/config.conf.d/*.conf`, geralmente em `/run/initramfs/memory/data/` enquanto o sistema está em execução.

A sincronização ocorre na inicialização; não é um monitor de arquivos:

- A cópia mais recente de `config.conf`prevalece, de acordo com o horário de modificação. Uma cópia mais recente na mídia é copiada para a raiz ativa. Uma cópia em tempo de execução mais recente só é copiada de volta se o diretório de dados selecionado do MiniOS puder ser gravado.
- Cada arquivo `config.conf.d/*.conf` é sincronizado separadamente, pelo nome de base, usando as mesmas regras de horário e permissões de gravação. Os arquivos não são excluídos de nenhum dos lados.
- Se o relógio estiver atrasado em relação ao horário registrado da última sincronização, a comparação de horários será ignorada e apenas os arquivos ausentes no destino serão adicionados.
- `toram=trim` copia `config.conf` mas não inclui `config.conf.d/`. A cópia completa de `toram` copia a árvore de dados, mas, em seguida, a sincronização é direcionada à cópia RAM, e não à mídia de origem desconectada.
Após a sincronização, `live-config` lê `/etc/live/config.conf` primeiro e, em seguida, `/etc/live/config.conf.d/*.conf` na ordem dos curingas do shell. Portanto, um fragmento posterior pode substituir um valor do arquivo principal ou de um fragmento anterior.

A linha de comando efetiva do kernel é adicionada a `LIVE_CONFIG_CMDLINE`. Se uma opção aparecer mais de uma vez, prevalece a ocorrência posterior na linha de comando do kernel. Para as três políticas de armazenamento, `minios-boot` lê o arquivo principal sincronizado, depois seus fragmentos, em seguida o bloco de opções e, por fim, a linha de comando efetiva do kernel; prevalece a última configuração.

Você pode adicionar variáveis de shell específicas do projeto a `config.conf` ou aos fragmentos e lê-las nas cópias em tempo de execução. Coloque os valores entre aspas como strings do shell e não insira espaços ao redor de `=`.

## Referência relacionada

- [Parâmetros de inicialização](/reference/Boot-Parameters) — parâmetros que devem ser incluídos na linha de comando real do kernel e substituições do live-config.
- [live-config](/reference/configuration/live-config) — referência completa de parâmetros, variáveis, componentes e estados do espaço de usuário tardio.
- [Modos de inicialização](/using-minios/Boot-Modes) — como a persistência e `toram` afetam o armazenamento da configuração.
