---
updated: 2026-09-26
---

# config.conf

`config.conf` é o principal arquivo de pré-configuração do MiniOS. Em uma mídia MiniOS normal, ele é armazenado como `minios/config.conf`. Durante a inicialização, o initramfs sincroniza esse arquivo com `/etc/live/config.conf` no sistema montado.

Use este arquivo para definir como o MiniOS será iniciado e como uma nova sessão persistente será inicializada. Trata-se principalmente de um mecanismo de pré-configuração voltado para administradores, não substituindo as ferramentas normais de configuração do desktop em execução.

## Reconfiguração

A coluna **Reconfigurável** abaixo utiliza os seguintes significados:

- **Sim** — a configuração pode ser alterada e aplicada novamente em um boot posterior.
- **Apenas no primeiro boot** — a configuração é usada quando o estado persistente correspondente é criado pela primeira vez e normalmente não é reaplicada nos boots seguintes.

Essa distinção faz parte do comportamento que os usuários precisam conhecer. Os arquivos de estado internos `live-config` são detalhes de implementação e não substituem essa informação.

## Configuração gerada

Uma imagem MiniOS atual gera uma `config.conf` com esta estrutura geral:
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
Os valores exatos dependem da imagem e da configuração de build.

::: warning `LIVE_CONFIG_CMDLINE` não é a linha de comando do initramfs
`LIVE_CONFIG_CMDLINE` fornece opções após o root MiniOS ter sido montado. Parâmetros como `from=`, `load=`, `toram`, e `perchdir=` devem ser parâmetros reais de boot do kernel; colocá-los apenas em `LIVE_CONFIG_CMDLINE` é tarde demais para afetar o initramfs. As opções de storage-policy `log-storage=`, `apt-cache=`, e `browser-cache=` são uma exceção específica: `minios-boot` lê essas opções de `LIVE_CONFIG_CMDLINE` antes dos serviços normais iniciarem.
:::

## Parâmetros padrão

| Parâmetro | Reconfigurável | Significado |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sim | Opções adicionais do live-config. A linha de comando real do kernel é adicionada depois e prevalece para opções repetidas. |
| `LIVE_HOSTNAME` | Sim | Nome do host do sistema. |
| `LIVE_USERNAME` | Apenas no primeiro boot | Nome do usuário live criado durante a configuração inicial. |
| `LIVE_USER_FULLNAME` | Apenas no primeiro boot | Nome completo do usuário live. |
| `LIVE_USER_DEFAULT_GROUPS` | Apenas no primeiro boot | Grupos suplementares atribuídos ao criar o usuário live. |
| `LIVE_USER_PASSWORD_CRYPTED` | Apenas no primeiro boot | Hash criptografado para a senha do usuário live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Apenas no primeiro boot | Hash criptografado para a senha do root. |
| `LIVE_CONFIG_NOROOT` | Apenas no primeiro boot | Quando ativado, suprime a configuração de privilégios de senha de root MiniOS, sudo e PolicyKit. |
| `LIVE_LOCALES` | Sim | Um ou mais locais do sistema. |
| `LIVE_TIMEZONE` | Sim | Fuso horário do sistema, por exemplo `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sim | Modelo de teclado XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sim | Layouts de teclado separados por vírgula. |
| `LIVE_KEYBOARD_OPTIONS` | Sim | Opções de teclado XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sim | Variações separadas por vírgula correspondentes aos layouts configurados. |
| `LIVE_CONFIG_DEBUG` | Sim | Ativa a saída de depuração do live-config quando definido como `true`. |
| `LIVE_LINK_USER_DIRS` | Sim | Vincula os diretórios de usuário gerenciados ao local configurado em mídia MiniOS gravável. Indisponível no modo bind, qualquer `toram` modo ou com uma sessão de persistência LUKS ativa. |
| `LIVE_BIND_USER_DIRS` | Sim | Faz bind-mount dos diretórios de usuário gerenciados a partir do local configurado em mídia MiniOS gravável. Indisponível no modo link, qualquer `toram` modo, ou com uma sessão de persistência ativa criptografada com LUKS. |
| `LIVE_USER_DIRS_PATH` | Sim | Local utilizado pelo modo de diretório de usuário link/bind. |
| `LIVE_MODULE_MODE` | Sim | Seleciona `simple` ou `merged` integração com o módulo live-config. |
| `LIVE_LOG_STORAGE` | Sim | `persistent` (padrão) ou `volatile` para logs de sistema comuns. Diagnósticos de boot permanecem persistentes; veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Sim | `persistent` (padrão) ou `volatile` para arquivos APT baixados; o estado dos pacotes e as listas de repositórios permanecem persistentes. |
| `LIVE_BROWSER_CACHE` | Sim | `persistent` (padrão) ou `volatile` para caminhos padrão de cache do navegador nativo. Perfis do navegador permanecem persistentes. |
| `DEFAULT_TARGET` | Sim | Destino de boot: `graphical.target`, `multi-user.target`, ou `rescue.target`. |
| `ENABLE_SERVICES` | Sim | Serviços separados por vírgula habilitados na inicialização via `minios-svc`. |
| `DISABLE_SERVICES` | Sim | Serviços separados por vírgula desabilitados na inicialização via `minios-svc`. |
| `EXPORT_LOGS` | Sim | Quando `true`, exporta MiniOS e logs de inicialização do live-config para mídia MiniOS gravável. |

O arquivo gerado não é uma lista exaustiva de tudo que é suportado pelo `minios-live-config`. Variáveis adicionais para pré-configuração de rede cabeada, postura de segurança, hooks, preseeding, Xorg e outros componentes podem ser adicionadas manualmente. Veja [live-config](/reference/configuration/live-config) para a referência completa.

O componente `user-media` recusa tanto a ativação quanto o copy-back enquanto a sessão de persistência ativa estiver criptografada com LUKS. Ele utiliza o estado real de criptografia em tempo de execução: o parâmetro do kernel `perchencrypt=luks` apenas solicita criptografia ao criar uma nova sessão e não descreve uma sessão já existente.

## Pré-configuração de rede cabeada

O MiniOS pode pré-configurar uma política **IPv4 cabeada** através do componente `network` do live-config. Isso é destinado à pré-configuração administrativa de um sistema antes de ser iniciado no hardware de destino.
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

Essas configurações são **Apenas no primeiro boot** para a política de rede persistente. Após a aplicação bem-sucedida, o componente registra `/var/lib/live/config/network`.
Alterar os valores não sobrescreve uma sessão persistente já configurada, a menos que esse estado seja redefinido deliberadamente.

`LIVE_NETWORK_METHOD=static` grava uma política estática. `off` desativa o IPv4 automático para a interface selecionada. Um valor não definido ou `dhcp` mantém a configuração de rede existente da imagem. `LIVE_NETWORK_BACKEND=auto` prefere o NetworkManager e recorre ao ifupdown.

Esse recurso não configura Wi-Fi. Após o boot, o gerenciamento de redes cabeadas e sem fio é feito pelo NetworkManager. Veja [Rede](/using-minios/Networking) para uso de rede em tempo de execução e [live-config](/reference/configuration/live-config) para todas as variáveis de rede.

## MiniOS configurações de early-userspace

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, e as três `LIVE_*` políticas de armazenamento acima são configurações de boot MiniOS, e não variáveis do componente late live-config. MiniOS as aplica antes do sistema init normal assumir; `minios-boot` é responsável pelas três políticas de armazenamento. Todas são **Reconfigurável: Sim**.

Os parâmetros de boot correspondentes `default-target=`, `enable-services=`, e `disable-services=` têm precedência para o boot atual. O parâmetro `text` força `multi-user.target`.

As versões atuais do Toolbox e Ultra adicionam `ssh` ao `ENABLE_SERVICES`. Para desativar explicitamente o SSH, coloque em `DISABLE_SERVICES`; apenas remover de `ENABLE_SERVICES` não solicita a operação de desabilitar.

Com `EXPORT_LOGS="true"`, a mídia MiniOS gravável recebe logs de inicialização abaixo:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Os logs de runtime correspondentes são `/var/log/minios/minios-boot.log` e `/var/log/live/config.log`.

## Política de cache e log para uma sessão persistente

Para reduzir gravações durante uma `perch` sessão, adicione as configurações de forma independente:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Eles também aceitam `persistent`, que é o padrão. `minios-boot` aceita as mesmas configurações de `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), ou parâmetros do kernel. Fragmentos posteriores substituem os anteriores, o blob de parâmetros prevalece sobre as chaves de arquivo, e os parâmetros reais do kernel prevalecem por último. As três opções são independentes e não solicitam persistência por si só. Um initrd compatível anuncia `perch-storage-v1` em `/run/initramfs/etc/minios-initramfs-storage`; o Configurador do MiniOS avisa quando o initrd atual não o anuncia.

As políticas são aplicadas em um boot posterior somente se a persistência for realmente ativada em um armazenamento durável e gravável. Com `toram`, persistência falha ou **Iniciar sem salvar**, a política volátil solicitada não é tratada como evidência de que algo será salvo. O componente browser-cache é executado depois de `minios-boot`, após a criação do usuário live. Veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para os limites exatos de RAM, caminhos de navegador suportados, condições de fallback e logs que permanecem no meio.

## Fonte, cópia em tempo de execução e precedência

O diretório de dados MiniOS selecionado normalmente contém estes arquivos de origem:

| Diretório de dados selecionado | Sistema em execução |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Em mídias normalmente montadas, eles ficam visíveis como `minios/config.conf` e `minios/config.conf.d/*.conf`, geralmente em `/run/initramfs/memory/data/` enquanto o sistema está em execução.

A sincronização ocorre na inicialização; não é um monitor de arquivos:

- A cópia mais recente de `config.conf` prevalece pelo horário de modificação. Uma cópia mais nova na mídia é copiada para o root ativo. Uma cópia mais nova em tempo de execução só é copiada de volta quando o diretório de dados MiniOS selecionado está gravável.
- Cada arquivo `config.conf.d/*.conf` é sincronizado independentemente pelo nome base, usando as mesmas regras de timestamp e permissões de gravação. Arquivos não são excluídos de nenhum dos lados.
- Se o relógio estiver anterior ao horário da última sincronização registrada, a comparação de timestamps é ignorada e apenas arquivos de destino ausentes são preenchidos.
- `toram=trim` copia `config.conf` mas omite `config.conf.d/`. A opção completa `toram` copia toda a árvore de dados, mas a sincronização passa a mirar a cópia RAM em vez da mídia de origem destacada.
Após a sincronização, `live-config` lê primeiro `/etc/live/config.conf` e depois `/etc/live/config.conf.d/*.conf` na ordem do shell glob. Assim, um fragmento posterior pode substituir um valor do arquivo principal ou de um fragmento anterior.

A linha de comando real do kernel é anexada a `LIVE_CONFIG_CMDLINE`. Para uma opção que aparece mais de uma vez, prevalece a ocorrência mais recente na linha de comando do kernel. Para as três políticas de armazenamento, `minios-boot` lê o arquivo principal sincronizado, depois seus fragmentos, depois o blob de opções e, por fim, a linha de comando real do kernel; a última configuração prevalece.

Você pode adicionar variáveis de shell específicas do projeto em `config.conf` ou em seus fragmentos e lê-las das cópias em tempo de execução. Coloque os valores entre aspas como strings de shell e não coloque espaços ao redor de `=`.

## Referência relacionada

- [Parâmetros de boot](/reference/Boot-Parameters) — parâmetros que devem ser inseridos na linha de comando do kernel e substituições do live-config.
- [live-config](/reference/configuration/live-config) — referência completa de parâmetros, variáveis, componentes e estados do late-userspace.
- [Modos de boot](/using-minios/Boot-Modes) — como a persistência e `toram` afetam o armazenamento da configuração.
