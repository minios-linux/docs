---
updated: 2026-10-06
program_commits:
    minios-live-config: cf3ae490e5df92581483ec6345a5f56bdaa812d8
---

# live-config

**live-config** - Componentes de Configuração do Sistema

**live-config** contém os componentes que configuram um sistema live durante o processo de boot (late userspace).

A política de cache e log de sessão persistente é definida anteriormente por `minios-boot`, após a preparação do root live e sua configuração, mas antes do início dos serviços comuns. O componente `browser-cache` live-config aplica os pontos de montagem por usuário após a criação do usuário. Essas políticas exigem uma sessão durável e saudável `perch` e um initrd atual que anuncie `perch-storage-v1`; veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para saber mais sobre os efeitos e limites.

O boot pela rede no initramfs (`ip=`, PXE, `from=http://…`) é uma camada separada do LiveKit e **não** é gerenciada pelo live-config. Veja [Boot pela rede](/reference/boot-process/Network-Boot).

**live-config** pode ser configurado por parâmetros de boot ou pelos arquivos de configuração em tempo de execução preparados pelo initramfs. A linha de comando real do kernel é adicionada após os valores fornecidos por arquivo, então os parâmetros de boot posteriores têm precedência.`LIVE_CONFIG_CMDLINE` Os componentes que registram estado em `/var/lib/live/config` normalmente executam apenas uma vez; componentes de sincronização e sem estado podem ser executados a cada chamada.

Se *live-build*(7) for usado para construir o sistema live, os parâmetros padrão do live-config podem ser definidos pela opção `--bootappend-live`, consulte *lb_config*(1) na página do manual.

## Parâmetros de Boot (componentes)

**live-config** só é ativado se `boot=live` for usado como parâmetro de boot. Por padrão, todos os componentes são executados. O parâmetro `live-config.components` pode restringir quais componentes serão executados, e `live-config.nocomponents` pode excluir componentes. Se ambos os parâmetros forem usados, ou um deles for especificado várias vezes, a última ocorrência terá precedência.

- **live-config.components | components**: Todos os componentes são executados. Esta é a configuração padrão das imagens live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Apenas os componentes especificados são executados. Eles são processados na ordem definida pelos nomes dos arquivos em `/usr/lib/live/config`, independentemente da ordem na lista.
- **live-config.nocomponents | nocomponents**: Nenhum componente é executado.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Todos os componentes são executados, exceto os especificados.

## Parâmetros de Boot (opções)

Alguns componentes individuais podem alterar seu comportamento conforme um parâmetro de boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Busca e aplica um ou mais arquivos de preseed do debconf. URLs são processadas por `wget` e podem utilizar HTTP, FTP ou `file://`. A palavra-chave `filesystem` expande arquivos em `/usr/lib/live/config-preseed/`; `medium` expande arquivos em `minios/config-preseed/` no meio live detectado. Arquivos locais explícitos podem usar caminhos como `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` no root live. Entradas separadas por pipe são processadas na ordem especificada; arquivos expandidos por palavra-chave seguem a ordem do glob do shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite definir o hostname do sistema. O padrão é `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Seleciona a política de rede cabeada. Não definido e `dhcp` mantêm o padrão da imagem. `static` grava a configuração para o backend selecionado; `off` desativa a configuração automática de IPv4 para a interface escolhida.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Seleciona a interface cabeada. Se omitido para `static` ou `off`, a única interface cabeada não-loopback é selecionada automaticamente; se houver zero ou múltiplas candidatas, é necessário informar explicitamente.
- **live-config.network-address=IPV4 | network-address=IPV4**: Define o endereço IPv4 estático.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Define o comprimento do prefixo IPv4 de 0 a 32. O padrão estático é `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Define o gateway IPv4 opcional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Define endereços de servidores DNS opcionais, separados por vírgula.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Seleciona o backend de rede. `auto` prefere o NetworkManager e recorre ao ifupdown se necessário. Se for forçado, `ifupdown` marca a interface como não gerenciada pelo NetworkManager quando ambos estão instalados.
- **live-config.username=USERNAME | username=USERNAME**: Permite definir o nome de usuário criado para autologin. O padrão é `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Define os grupos suplementares para o usuário criado para autologin. Os nomes dos grupos podem ser separados por vírgula ou espaço. O padrão MiniOS é `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite definir o nome completo do usuário criado para autologin. O padrão MiniOS é `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite definir a senha do root em texto simples.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite definir a senha do root de forma criptografada.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite definir a senha do usuário em texto simples.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite definir a senha do usuário de forma criptografada.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite definir o locale do sistema, por exemplo `de_CH.UTF-8`. O padrão é `en_US.UTF-8`. Caso o locale selecionado não esteja disponível no sistema, ele é gerado automaticamente.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite definir o fuso horário do sistema, por exemplo `Europe/Zurich`. O padrão é `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite alterar o modelo do teclado. Não há valor padrão definido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite alterar os layouts de teclado. Se mais de um for especificado, as ferramentas do ambiente gráfico permitirão alternar entre eles no X11. Não há valor padrão definido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite alterar as variantes de teclado. Se mais de uma for especificada, deve-se informar o mesmo número de variantes quanto de layouts, pois serão pareadas na ordem. Valores em branco são permitidos. As ferramentas do ambiente gráfico permitem alternar entre cada par de layout e variante no X11. Não há valor padrão definido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite alterar as opções do teclado. Não há valor padrão definido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite desabilitar serviços sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite definir se o sistema assume que o relógio de hardware está em UTC ou não. O padrão é `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite definir o x-session-manager via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite definir o driver xorg em vez de autodetectar. Se um ID PCI for especificado em `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro do sistema live, o *DRIVER* é aplicado para esses dispositivos. Se houver tanto parâmetro de boot quanto override, o parâmetro de boot tem prioridade.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite definir a resolução do xorg em vez de autodetectar, por exemplo 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite definir o driver WLAN em vez de autodetectar. Se um ID PCI for especificado em `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro do sistema live, o *DRIVER* é aplicado para esses dispositivos. Se houver tanto parâmetro de boot quanto override, o parâmetro de boot tem prioridade.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permite especificar o modo de módulo para configuração live. Quando definido como `merged`, o sistema irá atualizar contas de usuário, reconstruir caches e atualizar configurações de pacotes para que as alterações sejam integradas dinamicamente ao sistema em execução.
- **live-config.link-user-dirs | link-user-dirs**: Cria links dos diretórios gerenciados do usuário para o caminho configurado no meio de dados MiniOS. É mutuamente exclusivo com o modo bind e indisponível com qualquer modo `toram` ou enquanto a sessão de persistência ativa estiver criptografada com LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Faz bind-mount dos diretórios gerenciados do usuário a partir do caminho configurado no meio de dados MiniOS. É mutuamente exclusivo com o modo link e tem as mesmas restrições de `toram` e criptografia de sessão ativa.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Define o caminho relativo à mídia usado por `link-user-dirs` ou `bind-user-dirs`. O padrão é `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Busca e executa arquivos arbitrários a partir de um arquivo temporário no sistema live em execução. URLs são processadas por `wget` e podem usar HTTP, FTP ou `file://`; os interpretadores e dependências necessários já devem estar instalados. A palavra-chave `filesystem` expande arquivos em `/usr/lib/live/config-hooks/`; `medium` expande arquivos em `minios/config-hooks/` no meio live detectado (com fallback de caminho ISO no componente hook). Arquivos locais explícitos podem usar `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` no root live. Entradas separadas por pipe são executadas na ordem especificada; arquivos expandidos por palavra-chave seguem a ordem do glob do shell. Exemplos estão instalados em `/usr/share/doc/live-config/examples/hooks/`.

> **Aviso de segurança:** `live-config` é executado como root. Hooks são tornados executáveis e rodam como root, e preseeds alteram o banco de dados debconf do sistema com privilégios de root. HTTP e FTP simples não autenticam o conteúdo baixado e não oferecem proteção de integridade. Prefira arquivos locais revisados ou transporte autenticado confiável com verificação de integridade independente; não use hooks ou preseeds remotos de redes não confiáveis.

### Opções de armazenamento MiniOS iniciais

Essas opções são lidas por `minios-boot` antes do início dos serviços comuns. Elas exigem uma sessão durável e saudável `perch` e não ativam uma sessão por si só.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` armazena o journal do systemd e arquivos comuns de `/var/log` em RAM com limites; diagnósticos de boot permanecem no armazenamento durável. Padrão: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` armazena arquivos baixados do APT em um tmpfs limitado quando RAM e as condições de swap permitem. Bancos de dados de pacotes e listas de repositórios permanecem persistentes. Padrão: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` solicita caches nativos do navegador em RAM. O componente `browser-cache` monta os diretórios de cache selecionados do usuário live após a criação da conta. Padrão: `persistent`.

## Parâmetros de Boot (atalhos)

Para alguns casos de uso comuns que exigiriam combinar vários parâmetros individuais, **live-config** oferece atalhos. Isso permite ter controle total sobre todas as opções, mantendo a simplicidade.

- **live-config.noroot | noroot**: Desativa a configuração de senha de root e as permissões sudo e PolicyKit MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controla a configuração do sudo para o usuário live. O padrão, e o comportamento histórico MiniOS quando não definido, é `passwordless`. O modo `password` mantém o acesso sudo, mas exige a senha do usuário live. O modo `disabled` remove a permissão sudo MiniOS e impede que o usuário live entre no grupo sudo ao ser criado. O atalho antigo `noroot` sobrescreve isso e desativa a configuração de privilégios de root de forma mais ampla.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controla as regras de conveniência do PolicyKit MiniOS. O padrão, e o comportamento histórico MiniOS quando não definido, é `passwordless`. Os modos `password` e `disabled` removem essa regra, então a autenticação padrão do PolicyKit da distribuição se aplica. `disabled` não é uma política de negação total; use `noroot` quando o usuário live não deve obter privilégios administrativos.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Escreve uma política do OpenSSH `PermitRootLogin` quando explicitamente definido e o openssh-server estiver instalado.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Escreve uma política do OpenSSH `PasswordAuthentication` quando explicitamente definido e o openssh-server estiver instalado.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controla o comportamento do XRDP quando o xrdp está instalado. O modo `relaxed` mantém os padrões históricos MiniOS. O modo `hardened` faz o XRDP escutar apenas localmente, restaura configurações negociadas/de alta segurança e desativa login root via XRDP. O modo `disabled` desativa e para o XRDP via `minios-svc` se disponível.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controla o comportamento de conveniência do X11 MiniOS. O modo `relaxed` mantém a compatibilidade histórica. O modo `hardened` remove a opção permissiva do servidor `-ac` X e reforça `Xwrapper.config` quando presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controla se o `/etc/issue` exibe as dicas de senha padrão MiniOS para root/live.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controla se o live-config relaxa o bloqueio de tela. O modo `relaxed` mantém a conveniência da sessão live. O modo `hardened` evita desabilitar o bloqueio do GNOME e ativa o bloqueio do xscreensaver quando disponível.
- **live-config.noautologin | noautologin**: Impede que o live-config configure autologin no console e no modo gráfico. Não remove autologin já configurado em sessão persistente.
- **live-config.nottyautologin | nottyautologin**: Impede que o live-config configure autologin no console, sem afetar o modo gráfico. Configurações persistentes existentes não são removidas.
- **live-config.nox11autologin | nox11autologin**: Impede que o live-config configure autologin no display-manager, sem afetar o TTY. Configurações persistentes existentes não são removidas.

## Parâmetros de Boot (opções especiais)

Para casos de uso especiais, existem alguns parâmetros de boot específicos.

- **live-config.debug | debug**: Ativa a saída de depuração no live-config.

## Arquivos de Configuração

**live-config** pode ser configurado (mas não ativado) por meio de arquivos de configuração. Qualquer parâmetro de boot suportado pode ser inserido em `LIVE_CONFIG_CMDLINE`, e a maioria das opções também pode ser definida por variáveis individuais. O parâmetro `boot=live` ainda é necessário para ativar o **live-config**.

**Observação:** Se forem usados arquivos de configuração, todos os parâmetros de boot devem ser inseridos (preferencialmente) na variável **LIVE_CONFIG_CMDLINE**, ou variáveis individuais podem ser definidas. Se variáveis individuais forem usadas, o usuário deve garantir que todas as variáveis necessárias estejam configuradas para criar uma configuração válida.

`live-config` faz referência a `/etc/live/config.conf` e depois a `/etc/live/config.conf.d/*.conf` na ordem dos globs do shell. Assim, fragmentos posteriores podem substituir valores do arquivo principal ou de fragmentos anteriores. Não há uma camada de configuração adicional de mídia sendo referenciada separadamente.

Em mídias MiniOS, os arquivos de origem são `minios/config.conf` e `minios/config.conf.d/*.conf`. Antes de `live-config` iniciar, o initramfs MiniOS sincroniza esses arquivos com os arquivos de runtime do `/etc/live/` pelo horário de modificação. Um arquivo de origem mais recente substitui seu correspondente de runtime; um arquivo de runtime mais recente só é copiado de volta se o diretório de dados MiniOS selecionado for gravável. Timestamps iguais não causam cópia, arquivos ausentes são preenchidos e arquivos não são excluídos. Esta é uma sincronização feita no boot, não um monitoramento contínuo. Veja [Arquivo de configuração](/reference/configuration/config.conf) para as regras completas de sincronização e precedência da linha de comando.

Como alternativa para implementações de initramfs que não prepararam o arquivo de runtime, os wrappers de inicialização systemd e SysV copiam `minios/config.conf` do meio detectado apenas quando `/etc/live/config.conf` está ausente. Essa alternativa não copia fragmentos de `config.conf.d`. O initramfs padrão atual MiniOS LiveKit realiza a sincronização anterior.

Os arquivos de fragmento devem corresponder a `*.conf`. Nomes como `vendor.conf` ou `project.conf` são recomendados; escolha nomes lexicais cuidadosamente, pois fragmentos posteriores sobrescrevem os anteriores.

O conteúdo real dos arquivos de configuração consiste em uma ou mais das seguintes variáveis.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variável corresponde à linha de comando do bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variável corresponde ao parâmetro `**live-config.hostname**=*HOSTNAME*` . O padrão é `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Seleciona a política de rede cabeada. `dhcp` e um valor não definido não têm efeito e não removem um perfil estático MiniOS criado anteriormente.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Seleciona a interface cabeada para a política `static` ou `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Define o endereço IPv4 estático.
- **LIVE_NETWORK_PREFIX=PREFIX**: Define o comprimento do prefixo estático; o padrão é `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Define o gateway estático opcional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Define servidores DNS opcionais, separados por vírgula.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Seleciona o backend implementado.

O componente de rede registra `/var/lib/live/config/network` após gravar a política com sucesso. Remova esse carimbo para aplicar a política alterada em um sistema persistente. Para remover um perfil estático anterior, use `network-method=off` ou remova manualmente o perfil e o carimbo gerenciados por MiniOS.

- **LIVE_USERNAME=USERNAME**: Esta variável corresponde ao parâmetro `**live-config.username**=*USERNAME*` . O padrão é `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variável corresponde ao parâmetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` .
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variável corresponde ao parâmetro `**live-config.user-fullname**="*USER FULLNAME*"` .
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password**=*PASSWORD*` . Especifica a senha root em texto simples.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password-crypted**=*PASSWORD*` . Especifica a senha root em formato criptografado.
- **LIVE\_USER\_PASSWORD=SENHA**: Esta variável corresponde ao parâmetro `**live-config.user-password**=*PASSWORD*` e define a senha do usuário em texto simples.
- **LIVE\_USER\_PASSWORD\_CRYPTED=SENHA**: Esta variável corresponde ao parâmetro `**live-config.user-password-crypted**=*PASSWORD*` e define a senha do usuário em formato criptografado.
- **LIVE_CONFIG_NOROOT=true|false**: Esta variável corresponde ao parâmetro `**live-config.noroot**` e desativa a configuração de privilégios de root, sudo e PolicyKit quando definida como `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Esta variável corresponde ao parâmetro `**live-config.sudo-mode**=...` . Se não definida, MiniOS mantém o comportamento histórico de sudo sem senha.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Esta variável corresponde ao parâmetro `**live-config.polkit-mode**=...` . `password` e `disabled` removem a regra de senha MiniOS e restauram a autenticação padrão do PolicyKit da distribuição.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Esta variável corresponde ao parâmetro `**live-config.ssh-permit-root-login**=...` .
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Esta variável corresponde ao parâmetro `**live-config.ssh-password-authentication**=...` .
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Esta variável corresponde ao parâmetro `**live-config.xrdp-mode**=...` .
- **LIVE_X11_MODE=relaxed|hardened**: Esta variável corresponde ao parâmetro `**live-config.x11-mode**=...` .
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Esta variável corresponde ao parâmetro `**live-config.issue-password-hints**=...` .
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Esta variável corresponde ao parâmetro `**live-config.lockscreen-mode**=...` .
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Esta variável corresponde ao parâmetro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` .
- **LIVE_TIMEZONE=TIMEZONE**: Esta variável corresponde ao parâmetro `**live-config.timezone**=*TIMEZONE*` .
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Esta variável corresponde ao parâmetro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Esta variável corresponde ao parâmetro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Esta variável corresponde ao parâmetro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Esta variável corresponde ao parâmetro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Esta variável corresponde ao parâmetro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Esta variável corresponde ao parâmetro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Esta variável corresponde ao parâmetro `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Esta variável corresponde ao parâmetro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Esta variável corresponde ao parâmetro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Esta variável corresponde ao parâmetro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Ativa ou desativa links dos diretórios padrão de dados do usuário para a unidade gravável MiniOS. O parâmetro de boot correspondente é apenas o `live-config.link-user-dirs` sinalizador. O modo link não pode ser combinado com o modo bind ou qualquer modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Ativa ou desativa os bind mounts dos diretórios padrão de dados do usuário a partir da unidade gravável MiniOS. O parâmetro de boot correspondente é apenas o `live-config.bind-user-dirs` sinalizador. O modo bind não pode ser combinado com o modo link ou qualquer modo `toram`.
- **LIVE\_USER\_DIRS\_PATH=CAMINHO**: Esta variável corresponde ao `**live-config.user-dirs-path**=*PATH*` parâmetro. Ela especifica um caminho seguro dentro da unidade FAT32, exFAT ou NTFS MiniOS. O padrão é `/minios/userdata`; segmentos de ponto e diretório-pai são rejeitados.

A configuração de mídia do usuário nunca mescla automaticamente dois diretórios não vazios. Um diretório local não vazio é migrado apenas quando seu destino de mídia está vazio. Quando o recurso é desativado, os dados de mídia gerenciados são copiados de volta antes que os links sejam removidos. A ativação e a cópia de volta da mídia do usuário são bloqueadas enquanto a sessão de persistência ativa estiver criptografada com LUKS, impedindo que dados da sessão sejam movidos para uma mídia MiniOS não criptografada. Essa decisão utiliza o estado real de criptografia ativa: `perchencrypt=luks` apenas solicita criptografia ao criar uma nova sessão e não descreve uma sessão existente. Uma validação ou cópia com falha mantém os diretórios de usuário existentes e registra o motivo em `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Esta variável armazena o estado especificado pelo `live-config.module-mode` (ou `module-mode`) parâmetro. Quando definida como `merged`, o sistema live aplica atualizações (via minios-update-users, minios-update-cache e minios-update-dpkg) para mesclar configurações personalizadas com o ambiente base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variável corresponde ao `**live-config.debug**` parâmetro.

## Variáveis de cache e log MiniOS

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, e **LIVE_BROWSER_CACHE=persistent|volatile**: Políticas independentes de boot MiniOS. Também funcionam em `config.conf.d` e `LIVE_CONFIG_CMDLINE`. Não ativam persistência por si só. Veja [Arquivo de configuração](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

O componente `browser-cache` lê a política durável de `minios-boot` após a existência do usuário live e faz bind-mount dos diretórios padrão de cache do navegador em um sistema de arquivos RAM compartilhado e limitado. Uma política separada do Firefox desativa o cache em disco sem mover perfis do navegador. Se este componente for excluído por `components=` ou `nocomponents=`, apenas a solicitação antecipada de browser-cache não configura os pontos de montagem por usuário.

Os utilitários de modo mesclado mantêm erros normais, mas criam rastreamentos detalhados de comandos e cópias de depuração apenas quando `LIVE_CONFIG_DEBUG=true`.

# PERSONALIZAÇÃO

**live-config** pode ser facilmente personalizado para projetos derivados ou uso local.

## Adicionando novos componentes de configuração

Projetos derivados podem colocar seus componentes em /usr/lib/live/config e não precisam fazer mais nada, pois eles serão chamados automaticamente durante o boot.

O ideal é que os componentes sejam empacotados em um pacote debian próprio. Um pacote de exemplo contendo um componente pode ser encontrado em /usr/share/doc/live-config/examples.

## Removendo componentes de configuração existentes

Ainda não é possível remover componentes de forma adequada sem exigir o envio de um pacote **live-config** modificado localmente ou usando dpkg-divert. No entanto, é possível obter o mesmo resultado desabilitando os componentes desejados pelo mecanismo live-config.nocomponents, veja acima. Para evitar a necessidade de especificar sempre os componentes desabilitados via parâmetro de boot, recomenda-se usar um arquivo de configuração, conforme acima.

Os arquivos de configuração do próprio sistema live devem ser preferencialmente empacotados em um pacote debian próprio. Um pacote de exemplo contendo uma configuração pode ser encontrado em /usr/share/doc/live-config/examples.

# COMPONENTES

**live-config** atualmente possui os seguintes componentes em /usr/lib/live/config.

- **nss-systemd**: remove ou restaura o módulo NSS do systemd em /etc/nsswitch.conf para contornar um problema conhecido do systemd.
- **debconf**: permite aplicar arquivos de preseed arbitrários colocados na mídia live ou em um servidor http/ftp.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: configura o arquivo /etc/issue com uma mensagem de boas-vindas e informações da distribuição.
- **live-debconfig_passwd**: configura as senhas do usuário e do root via live-debconfig.
- **user-setup**: adiciona uma conta de usuário live.
- **user-groups**: adiciona o usuário live a grupos suplementares declarados por módulos instalados. Grupos existentes listados em `/usr/share/live/config/user-default-groups.d/*.groups` são aplicados após a criação do usuário e em execuções posteriores do live-config.
- **root-setup**: define ou atualiza a senha do root e configura o ambiente do usuário root.
- **sudo**: concede privilégios de sudo ao usuário live.
- **user-ssh-keys**: sincroniza arquivos específicos de usuário de `authorized_keys.<username>` entre a mídia live e os diretórios home dos usuários. Suporta múltiplos usuários simultaneamente (por exemplo, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) e reconhece os formatos bare `toram`, `toram=trim`, e `toram=full` como formas de boot RAM ao decidir se a mídia live pode ser atualizada com segurança.
- **user-media**: cria links ou faz bind-mount de diretórios de usuário validados em um meio de dados MiniOS gravável existente, com migração segura e cópia de volta ao desabilitar.
- **locales**: configura os locales.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura o nome de usuário no xorg.service e aplica a postura X11 quando suportado.
- **gdm3**: configura autologin no gdm3.
- **sddm**: configura autologin no sddm.
- **kdm**: configura autologin no kdm.
- **lightdm**: configura autologin no lightdm.
- **lxdm**: configura autologin no lxdm.
- **nodm**: configura autologin no nodm.
- **slim**: configura autologin no slim.
- **xinit**: configura autologin com xinit.
- **keyboard-configuration**: configura o teclado.
- **sysvinit**: configura autologin no console via `/etc/inittab` quando o sysvinit está instalado. Os atalhos `noautologin` e `nottyautologin` suprimem essa configuração.
- **sysv-rc**: configura o sysv-rc desabilitando os serviços listados.
- **apport**: desativa o apport.
- **gnome-panel-data**: desativa o botão de bloqueio de tela.
- **gnome-power-manager**: desativa a hibernação.
- **gnome-screensaver**: controla o bloqueio de tela do GNOME conforme `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: desativa o assistente de migração do KDE (squeeze e mais recentes).
- **kde-services**: desativa alguns serviços indesejados do KDE (squeeze e mais recentes).
- **policykit**: concede privilégios ao usuário via PolicyKit.
- **ssl-cert**: regenera certificados SSL snake-oil.
- **xrdp**: configura o comportamento relaxado, reforçado ou desativado do XRDP quando instalado.
- **anacron**: desativa o anacron.
- **util-linux**: desativa o serviço hwclock do util-linux.
- **login**: desativa o lastlog.
- **xserver-xorg**: configura o xserver-xorg.
- **network**: configura política IPv4 cabeada durável via keyfile seguro do NetworkManager ou ifupdown. Executa antes dos serviços de rede, valida todos os valores e só grava após sucesso.
- **openssh-server**: recria chaves de host do OpenSSH e grava políticas explicitamente solicitadas de root-login ou password-authentication.
- **xfce4-panel**: configura o xfce4-panel para as configurações padrão.
- **xscreensaver**: controla o bloqueio do xscreensaver conforme `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura drivers WLAN broadcom-sta.
- **hyperv**: configura ajustes do X11 para melhorar a compatibilidade em plataformas Microsoft Hyper-V.
- **ntfs3**: gerencia regras udev para suporte ao NTFS3.
- **config-module-mode**: configura o modo de módulos do sistema e atualiza caches, configurações de usuário e dpkg.
- **hooks**: permite executar comandos arbitrários de um arquivo colocado na mídia live ou em um servidor http/ftp.

# ARQUIVOS

- `minios/config.conf` na mídia de dados selecionada MiniOS (cópia de origem)
- `minios/config.conf.d/*.conf` na mídia de dados selecionada MiniOS (fragmentos de origem)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` em mídias de dados selecionadas graváveis quando a exportação de logs está habilitada
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` na mídia live detectada (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` na mídia live detectada (`medium` preseeds)

# VEJA TAMBÉM

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PÁGINA INICIAL

Mais informações sobre **minios-live-config** podem ser encontradas em seu [repositório no GitHub](https://github.com/minios-linux/minios-live-config). Informações gerais MiniOS estão disponíveis em [minios.dev](https://minios.dev).

# BUGS

Bugs podem ser reportados no [rastreador de issues do minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTOR

**live-config** foi originalmente escrito por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, o desenvolvimento continuou com a equipe Debian Live. Desde 2025, o desenvolvimento da versão modificada **minios-live-config** segue com a equipe Live MiniOS.
