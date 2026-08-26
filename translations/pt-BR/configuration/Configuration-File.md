---
updated: 2026-08-26
---

# Arquivo de configuração

A mídia de boot do MiniOS armazena a configuração principal em `minios/config.conf`. Durante a inicialização, o initramfs sincroniza esse arquivo para `/etc/live/config.conf` no sistema live montado. Portanto, scripts no sistema em execução devem ler `/etc/live/config.conf`; `/etc/minios/config.conf` e `config/config.conf` não são caminhos de configuração utilizados pelo código de boot atual.

Parâmetros de boot podem sobrescrever as configurações correspondentes do arquivo. A seguir, um exemplo de `config.conf` padrão:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
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
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Descrição dos Parâmetros

**Legenda:**
- **Somente no primeiro boot** – Aplicado apenas no primeiro boot e não reaplicado nos boots seguintes
- **Sim** – Pode ser alterado e reaplicado em todo boot

| Parâmetro | Reconfigurável | Significado | Exemplo |
| --------- | -------------- | ---------- | ------- |
| LIVE_CONFIG_CMDLINE | Sim | Opções adicionais do live-config. `nottyautologin` é armazenado aqui em vez de ser fixado em cada entrada de boot. Veja `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | Sim | Nome do nó associado ao sistema. Veja `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | Somente no primeiro boot | Nome do usuário cujo perfil será criado no primeiro boot. Se você especificar o nome de usuário <strong>root</strong>, nenhum perfil de usuário será criado e o login será feito usando o perfil <strong>root</strong>. Veja `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | Somente no primeiro boot | Nome completo do usuário principal. Veja `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | Somente no primeiro boot | Lista de grupos do usuário principal, separados por vírgula. Veja `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | Somente no primeiro boot | Senha do usuário principal em formato criptografado (hash). Use `mkpasswd -m yescrypt` para gerar. Veja `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | Somente no primeiro boot | Senha do usuário privilegiado **root** em formato criptografado (hash). Use `mkpasswd -m yescrypt` para gerar. Veja `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | Somente no primeiro boot | Se definido, desativa o login da conta root e desativa sudo/policykit para o usuário. Veja `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | Sim | Define o locale. Vários valores podem ser separados por vírgula. Veja `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | Sim | Define o fuso horário (por exemplo, "Europe/Berlin", "Etc/UTC"). Veja `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | Sim | Define o modelo do teclado (por exemplo, "pc105"). Veja `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | Sim | Define os layouts de teclado (separados por vírgula, por exemplo, "us,de"). Veja `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | Sim | Define opções do teclado (por exemplo, "grp:alt_shift_toggle,grp_led:scroll"). Veja `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | Sim | Define variantes do teclado (separadas por vírgula, pode ser vazio ou corresponder aos layouts). Veja `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | Sim | Ativa a saída de depuração para o live-config. Veja `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | Sim | Se verdadeiro, os diretórios do usuário serão vinculados a partir do caminho especificado. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | Sim | Se verdadeiro, os diretórios do usuário serão montados via bind a partir do caminho especificado. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | Sim | Caminho para os diretórios de dados do usuário no pendrive. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | Sim | Seleciona o modo de operação do sistema. Se pretende instalar software exclusivamente por módulos, use "merged". Se deseja instalar software usando apt, use "simple". O padrão é "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | Sim | Target do systemd para inicialização. Veja `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | Sim | Ativa serviços na inicialização (separados por vírgula). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | Sim | Desativa serviços na inicialização (separados por vírgula). | DISABLE_SERVICES="" |
| EXPORT_LOGS | Sim | Se verdadeiro e o diretório de dados selecionado do MiniOS for gravável, os logs de boot serão copiados para `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**Para mais detalhes sobre a maioria dos parâmetros, consulte:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Para targets do systemd: `man systemd.special`

## Importante!

* O servidor SSH é ativado por padrão para compatibilidade com initrds de terceiros; para desativá-lo, você deve não apenas removê-lo de `ENABLE_SERVICES`.

## Fonte, cópia em tempo de execução e precedência

O diretório de dados do MiniOS selecionado normalmente é o diretório `minios/` no meio de boot. Seus caminhos de configuração e suas cópias em tempo de execução são:

| Diretório de dados selecionado | Sistema em execução |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Para um meio normalmente montado, esses arquivos de origem ficam visíveis como `minios/config.conf` e `minios/config.conf.d/*.conf`, geralmente em `/run/initramfs/memory/data/`. Eles não são carregados diretamente pelo `live-config`. O initramfs os sincroniza com os caminhos de tempo de execução antes de rodar `minios-boot`; veja [Modos de Boot](/configuration/Boot-Modes.md) para saber onde isso ocorre na sequência de boot.

A sincronização é feita no boot, não por um monitor de arquivos:

- A cópia mais recente de `config.conf` vence pelo horário de modificação. Uma cópia de origem mais recente é copiada para o root do live. Uma cópia de tempo de execução mais recente só é copiada de volta quando o diretório de dados selecionado for gravável.
- Cada arquivo `config.conf.d/*.conf` é sincronizado independentemente pelo basename usando as mesmas regras de horário de modificação e gravabilidade. Arquivos não são excluídos de nenhum dos lados.
- Se o relógio estiver anterior ao último horário de sincronização registrado, a comparação de timestamps é ignorada e apenas arquivos de destino ausentes são preenchidos.
- `toram=trim` copia `config.conf` mas omite `config.conf.d/`; veja [Carregamento de Módulos no Initrd](/configuration/Initrd-Module-Loading.md). A cópia completa de `toram` copia toda a árvore de dados, mas a sincronização então mira a cópia em RAM em vez do meio destacado.

Após a sincronização, `live-config` lê primeiro `/etc/live/config.conf` e depois `/etc/live/config.conf.d/*.conf` na ordem do shell glob, então um fragmento posterior pode substituir um valor anterior. Ele adiciona a linha de comando real do kernel a `LIVE_CONFIG_CMDLINE`; para opções repetidas ali, a última ocorrência da linha de comando do kernel prevalece. `minios-boot` também lê `/etc/live/config.conf` para suas configurações iniciais suportadas e dá precedência aos parâmetros do kernel reconhecidos.

Você pode adicionar variáveis de shell específicas do projeto nesses arquivos e lê-las de `/etc/live/config.conf` ou dos fragmentos em tempo de execução. Coloque os valores entre aspas como strings do shell e não coloque espaços ao redor de `=`.

O log inicial do MiniOS é `/var/log/minios/minios-boot.log`, enquanto a saída tardia de `live-config` é `/var/log/live/config.log`. Com `EXPORT_LOGS="true"`, ambas as árvores são copiadas para `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` quando o diretório de dados selecionado for gravável.
