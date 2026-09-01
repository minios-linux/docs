---
updated: 2026-08-31
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

Uma imagem atual do MiniOS gera um `config.conf` com a seguinte estrutura geral:
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
`LIVE_CONFIG_CMDLINE` fornece opções para o **live-config** após o root MiniOS ter sido montado. Parâmetros como `from=`, `load=`, `toram` e `perchdir=` devem ser parâmetros reais de boot do kernel; colocá-los apenas em `LIVE_CONFIG_CMDLINE` é tarde demais para afetar o initramfs.
:::

## Parâmetros padrão

| Parâmetro | Reconfigurável | Significado |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Sim | Opções adicionais do live-config. A linha de comando real do kernel é adicionada depois e prevalece para opções repetidas. |
| `LIVE_HOSTNAME` | Sim | Nome do host do sistema. |
| `LIVE_USERNAME` | Apenas no primeiro boot | Nome do usuário live criado durante a configuração inicial. |
| `LIVE_USER_FULLNAME` | Apenas no primeiro boot | Nome completo do usuário live. |
| `LIVE_USER_DEFAULT_GROUPS` | Apenas no primeiro boot | Grupos suplementares atribuídos quando o usuário live é criado. |
| `LIVE_USER_PASSWORD_CRYPTED` | Apenas no primeiro boot | Hash criptográfico para a senha do usuário live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Apenas no primeiro boot | Hash criptográfico para a senha de root. |
| `LIVE_CONFIG_NOROOT` | Apenas no primeiro boot | Quando ativado, suprime a configuração de senha de root, sudo e privilégios do PolicyKit do MiniOS. |
| `LIVE_LOCALES` | Sim | Um ou mais locales do sistema. |
| `LIVE_TIMEZONE` | Sim | Fuso horário do sistema, por exemplo `Europe/Berlin` ou `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Sim | Modelo de teclado XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Sim | Layouts de teclado separados por vírgula. |
| `LIVE_KEYBOARD_OPTIONS` | Sim | Opções de teclado XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Sim | Variantes separadas por vírgula correspondentes aos layouts configurados. |
| `LIVE_CONFIG_DEBUG` | Sim | Ativa a saída de debug do live-config quando definido como `true`. |
| `LIVE_LINK_USER_DIRS` | Sim | Faz links dos diretórios de usuário gerenciados para o local configurado em mídia MiniOS gravável. |
| `LIVE_BIND_USER_DIRS` | Sim | Faz bind-mount dos diretórios de usuário gerenciados a partir do local configurado em mídia MiniOS gravável. |
| `LIVE_USER_DIRS_PATH` | Sim | Local utilizado pelo modo de link/bind de diretórios de usuário. |
| `LIVE_MODULE_MODE` | Sim | Seleciona integração do módulo live-config `simple` ou `merged`. |
| `DEFAULT_TARGET` | Sim | Destino de boot: `graphical.target`, `multi-user.target` ou `rescue.target`. |
| `ENABLE_SERVICES` | Sim | Serviços separados por vírgula ativados no boot via `minios-svc`. |
| `DISABLE_SERVICES` | Sim | Serviços separados por vírgula desativados no boot via `minios-svc`. |
| `EXPORT_LOGS` | Sim | Quando `true`, exporta MiniOS e logs de inicialização do live-config para mídia MiniOS gravável. |

O arquivo gerado não é uma lista exaustiva de tudo que o `minios-live-config` suporta. Variáveis adicionais para pré-configuração de rede cabeada, postura de segurança, hooks, preseeding, Xorg e outros componentes podem ser adicionadas manualmente. Veja [live-config](/reference/configuration/live-config) para a referência completa.

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

## Configurações de early-userspace do MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES` e `EXPORT_LOGS` são configurações MiniOS, e não variáveis do live-config. Elas são lidas por `minios-boot` antes do sistema de init normal assumir e todas são **Reconfiguráveis: Sim**.

Os parâmetros de boot correspondentes `default-target=`, `enable-services=` e `disable-services=` têm precedência para o boot atual. O parâmetro `text` força `multi-user.target`.

As builds atuais do Toolbox e Ultra adicionam `ssh` ao `ENABLE_SERVICES`. Para desativar explicitamente o SSH, coloque-o em `DISABLE_SERVICES`; apenas removê-lo de `ENABLE_SERVICES` não solicita a desativação.

Com `EXPORT_LOGS="true"`, a mídia MiniOS gravável recebe os logs de inicialização abaixo:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Os logs correspondentes em tempo de execução são `/var/log/minios/minios-boot.log` e `/var/log/live/config.log`.

## Fonte, cópia em tempo de execução e precedência

O diretório de dados selecionado do MiniOS normalmente contém estes arquivos de origem:

| Diretório de dados selecionado | Sistema em execução |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Em mídias normalmente montadas, eles ficam visíveis como `minios/config.conf` e `minios/config.conf.d/*.conf`, geralmente em `/run/initramfs/memory/data/` enquanto o sistema está em execução.

A sincronização ocorre no boot; não é um monitoramento de arquivos:

- A cópia mais recente de `config.conf` vence pelo horário de modificação. Uma cópia mais nova na mídia é copiada para o root live. Uma cópia mais nova em tempo de execução é copiada de volta apenas quando o diretório de dados MiniOS selecionado é gravável.
- Cada arquivo `config.conf.d/*.conf` é sincronizado independentemente pelo nome base, usando as mesmas regras de timestamp e gravabilidade. Arquivos não são excluídos de nenhum dos lados.
- Se o relógio estiver anterior ao último horário de sincronização registrado, a comparação de timestamps é ignorada e apenas arquivos de destino ausentes são preenchidos.
- `toram=trim` copia `config.conf`, mas omite `config.conf.d/`. O `toram` completo copia toda a árvore de dados, mas a sincronização então passa a ter como alvo a cópia RAM em vez da mídia de origem destacada.
Após a sincronização, `live-config` lê primeiro `/etc/live/config.conf` e depois `/etc/live/config.conf.d/*.conf` na ordem de glob do shell. Assim, um fragmento posterior pode substituir um valor do arquivo principal ou de um fragmento anterior.

A linha de comando real do kernel é adicionada ao `LIVE_CONFIG_CMDLINE`. Para uma opção que ocorre mais de uma vez, prevalece a ocorrência mais recente na linha de comando do kernel. `minios-boot` também dá prioridade aos parâmetros de kernel reconhecidos sobre as configurações correspondentes de `/etc/live/config.conf`.

Você pode adicionar variáveis de shell específicas do projeto em `config.conf` ou em seus fragmentos e lê-las das cópias em tempo de execução. Coloque os valores entre aspas como strings de shell e não coloque espaços ao redor de `=`.

## Referências relacionadas

- [Parâmetros de boot](/reference/Boot-Parameters) — parâmetros que devem ser colocados na linha de comando real do kernel e substituições do live-config.
- [live-config](/reference/configuration/live-config) — referência completa de parâmetros, variáveis, componentes e estados de late-userspace.
- [Modos de boot](/using-minios/Boot-Modes) — como a persistência e `toram` afetam o armazenamento de configurações.
