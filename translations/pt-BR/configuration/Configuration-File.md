# Arquivo de configuração

O MiniOS se diferencia da maioria das distribuições flash clássicas porque alguns parâmetros podem ser definidos antes da inicialização em um arquivo de configuração bastante simples, `config/config.conf`, o que minimiza o trabalho necessário ao criar seus próprios módulos para sistemas embarcados. Opcionalmente, alguns desses parâmetros podem ser definidos nos parâmetros de boot. As opções de boot têm prioridade sobre o arquivo de configuração. Alguns parâmetros deste arquivo são de serviço e é melhor não alterá-los. Abaixo está um exemplo de arquivo de configuração padrão:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
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
- 🔒 **Apenas uma vez** – Aplicado somente na primeira inicialização, não pode ser alterado nas próximas inicializações  
- 🔄 **Reconfigurável** – Pode ser alterado a cada inicialização e reaplicado

| Parâmetro | Reconfigurável | Significado | Exemplo |
| --------- | -------------- | ---------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Parâmetros adicionais de inicialização do live-config. Veja `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Nome do nó associado ao sistema. Veja `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nome do usuário cujo perfil será criado na primeira inicialização. Se você especificar o nome de usuário <strong>root</strong>, nenhum perfil de usuário será criado e o login será feito usando o perfil <strong>root</strong>. Veja `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nome completo do usuário principal. Veja `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Lista de grupos separados por vírgula para o usuário principal. Veja `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Senha do usuário principal em formato criptografado (hash). Use `mkpasswd -m yescrypt` para gerar. Veja `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Senha do usuário privilegiado **root** em formato criptografado (hash). Use `mkpasswd -m yescrypt` para gerar. Veja `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Se definido, desabilita o login da conta root e desativa sudo/policykit para o usuário. Veja `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Define o locale. Vários valores podem ser separados por vírgula. Veja `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Define o fuso horário (ex: "Europe/Berlin", "Etc/UTC"). Veja `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Define o modelo do teclado (ex: "pc105"). Veja `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Define os layouts de teclado (separados por vírgula, ex: "us,de"). Veja `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Define opções do teclado (ex: "grp:alt_shift_toggle,grp_led:scroll"). Veja `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Define as variantes do teclado (separadas por vírgula, pode ser vazio ou corresponder aos layouts). Veja `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Ativa a saída de depuração do live-config. Veja `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Se verdadeiro, os diretórios do usuário serão vinculados a partir do caminho especificado. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Se verdadeiro, os diretórios do usuário serão montados via bind a partir do caminho especificado. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Caminho para os diretórios de dados do usuário no pen drive. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Seleciona o modo de operação do sistema. Se pretende instalar softwares apenas por módulos, use "merged". Se quiser instalar softwares usando o apt, use "simple". O padrão é "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Target do systemd para inicializar. Veja `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Ativa serviços na inicialização (separados por vírgula). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Desativa serviços na inicialização (separados por vírgula). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Se verdadeiro, ao inicializar de uma mídia gravável, os logs do MiniOS são copiados para a pasta minios/logs durante o boot. | EXPORT_LOGS="false" |


**Para mais detalhes sobre a maioria dos parâmetros, consulte:**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Para systemd targets: `man systemd.special`

## Importante!

* O servidor SSH é ativado por padrão para compatibilidade com initrds de terceiros. Para desativá-lo, não basta removê-lo de `ENABLE_SERVICES`.

Para que mais o arquivo `config.conf` pode ser útil? Você pode usá-lo para definir seus próprios parâmetros em scripts ao criar módulos. Na primeira inicialização, ele é copiado para a pasta /etc/minios. Depois, o arquivo `/etc/live/config.conf` é monitorado automaticamente e, quando houver alterações, sobrescreve o arquivo de configuração no pen drive, caso ele seja gravável. Assim, você pode colocar suas variáveis em config.conf e recuperá-las de `/etc/live/config.conf` nos seus scripts, independentemente do tipo de initrd utilizado.
