---
updated: 2026-10-15
program_commits:
    minios-live-config: 2a798c533b2980a40e8457205cabfa24ccad2d10
---

# live-config

**live-config** - Componentes de configuração do sistema

**live-config** contém os componentes que configuram um sistema live durante o processo de inicialização (espaço de usuário tardio).

A política de cache e registro de logs da sessão persistente é definida anteriormente por `minios-boot`, depois que a raiz live e sua configuração são preparadas, mas antes do início dos serviços comuns. O componente `browser-cache` aplica montagens por usuário após a criação do usuário. Essas políticas exigem a ativação bem-sucedida da persistência em armazenamento durável ou em uma sessão gravável RAM-copiada com informações de origem protegidas, além de um initrd compatível com `perch-storage-v1`. As sessões RAM-copiadas permanecem não duráveis até serem salvas; consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

A inicialização pela rede no initramfs (`ip=`, PXE, `from=http://…`) é uma camada separada do LiveKit e **não** é gerenciada pelo live-config. Consulte [Inicialização pela rede](/reference/boot-process/Network-Boot).

**live-config** pode ser configurado por meio de parâmetros de inicialização ou dos arquivos de configuração em tempo de execução preparados pelo initramfs. A linha de comando real do kernel é acrescentada após os valores fornecidos pelos arquivos, portanto, parâmetros de inicialização correspondentes especificados posteriormente têm precedência. Componentes que registram o estado em `LIVE_CONFIG_CMDLINE` geralmente são executados apenas uma vez; componentes de sincronização e sem estado podem ser executados a cada invocação.`/var/lib/live/config`

Se *live-build*(7) for usado para criar o sistema live, os parâmetros do live-config usados por padrão podem ser definidos pela opção `--bootappend-live`, consulte *lb_config*(1) na página do manual.

## Parâmetros de inicialização (componentes)

**live-config** só é ativado se `boot=live` for usado como parâmetro de inicialização. Por padrão, todos os componentes são executados. O parâmetro `live-config.components` pode restringir quais componentes serão executados, e `live-config.nocomponents` pode excluir componentes. Se os dois parâmetros forem usados ou se qualquer um deles for especificado várias vezes, a última ocorrência terá precedência.

- **live-config.components | components**: Todos os componentes são executados. Esse é o comportamento padrão das imagens live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Somente os componentes especificados são executados. Os componentes são executados na ordem indicada pelos nomes dos arquivos em `/usr/lib/live/config`, independentemente da ordem nesta lista.
- **live-config.nocomponents | nocomponents**: Nenhum componente é executado.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Todos os componentes são executados, exceto os especificados.

## Parâmetros de inicialização (opções)

Alguns componentes podem alterar seu comportamento com um parâmetro de inicialização.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Baixa e aplica um ou mais arquivos de preseed do debconf. As URLs são processadas por `wget` e podem usar HTTP, FTP ou `file://`. A palavra-chave `filesystem` expande os arquivos em `/usr/lib/live/config-preseed/`; `medium` expande os arquivos em `minios/config-preseed/` na mídia live detectada. Arquivos locais explícitos podem usar caminhos como `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` na raiz do sistema live. As entradas separadas por \| são processadas na ordem especificada; os arquivos expandidos por uma palavra-chave seguem a ordem dos curingas do shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite definir o hostname do sistema. O padrão é `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Seleciona a política de rede cabeada. Se não definido, `dhcp` mantém o padrão da imagem. `static` grava a configuração para o backend selecionado; `off` desativa a configuração automática de IPv4 para a interface selecionada.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Seleciona a interface cabeada. Se `static` ou `off` não for especificado, a única interface cabeada que não seja loopback será selecionada automaticamente; se não houver candidatas ou houver mais de uma, será necessário especificar um valor.
- **live-config.network-address=IPV4 | network-address=IPV4**: Define o endereço IPv4 estático.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Define o comprimento do prefixo IPv4, de 0 a 32. O padrão estático é `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Define o gateway IPv4 opcional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Define endereços opcionais de servidores DNS, separados por vírgulas.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Seleciona o backend de rede. `auto` prioriza o NetworkManager e usa o ifupdown como alternativa. O modo forçado `ifupdown` marca a interface como não gerenciada pelo NetworkManager quando as duas pilhas estão instaladas.
- **live-config.username=USERNAME | username=USERNAME**: Permite definir o nome de usuário criado para o login automático. O padrão é `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Define os grupos suplementares do usuário criado para o login automático. Os nomes dos grupos podem ser separados por vírgulas ou espaços. O padrão de MiniOS é `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite definir o nome completo do usuário criado para o login automático. O padrão de MiniOS é `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite definir a senha do root em texto simples.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite definir a senha do root em formato criptografado.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite definir a senha do usuário em texto simples.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite definir a senha do usuário em formato criptografado.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite definir a localidade do sistema, por exemplo, `de_CH.UTF-8`. O padrão é `en_US.UTF-8`. Se a localidade selecionada ainda não estiver disponível no sistema, ela será gerada automaticamente.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite definir o fuso horário do sistema, por exemplo, `Europe/Zurich`. O padrão é `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite alterar o modelo do teclado. Nenhum valor padrão é definido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite alterar os layouts do teclado. Se mais de um for especificado, as ferramentas do ambiente de desktop permitirão alternar entre eles no X11. Nenhum valor padrão é definido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite alterar as variantes do teclado. Se mais de uma for especificada, deve ser informado o mesmo número de valores que o de layouts do teclado, pois eles serão associados um a um na ordem especificada. Valores em branco são permitidos. As ferramentas do ambiente de desktop permitirão alternar entre cada par de layout e variante no X11. Nenhum valor padrão é definido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite alterar as opções do teclado. Nenhum valor padrão é definido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite desativar serviços sysv por meio do update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite definir se o sistema deve considerar que o relógio de hardware está ajustado para UTC. O padrão é `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite definir o gerenciador de sessão do X por meio do update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite definir o driver do Xorg em vez de detectá-lo automaticamente. Se um ID PCI for especificado em `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` no sistema live, o driver *DRIVER* será imposto a esses dispositivos. Se um parâmetro de inicialização e uma substituição forem encontrados, o parâmetro de inicialização terá prioridade.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite definir a resolução do Xorg em vez de detectá-la automaticamente, por exemplo, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite definir o driver WLAN em vez de detectá-lo automaticamente. Se um ID PCI for especificado em `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` no sistema live, o driver *DRIVER* será imposto a esses dispositivos. Se um parâmetro de inicialização e uma substituição forem encontrados, o parâmetro de inicialização terá prioridade.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permite especificar o modo de módulos da configuração live. Quando definido como `merged`, o sistema atualizará as contas de usuário, reconstruirá os caches e atualizará as configurações de pacotes para integrar dinamicamente as alterações de configuração ao sistema em execução.
- **live-config.link-user-dirs | link-user-dirs**: Cria links dos diretórios de usuário gerenciados para o caminho configurado na mídia de dados MiniOS. Esse modo é incompatível com o modo bind e não está disponível com qualquer modo `toram` nem quando a sessão de persistência ativa é criptografada com LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Monta os diretórios de usuário gerenciados com bind a partir do caminho configurado na mídia de dados MiniOS. Esse modo é incompatível com o modo de links e está sujeito às mesmas restrições de `toram` e de criptografia da sessão ativa.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Define o caminho relativo à mídia usado por `link-user-dirs` ou `bind-user-dirs`. O padrão é `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Baixa e executa arquivos arbitrários a partir de um arquivo temporário no sistema live em execução. As URLs são processadas por `wget` e podem usar HTTP, FTP ou `file://`; os interpretadores necessários e outras dependências já devem estar instalados. A palavra-chave `filesystem` expande os arquivos em `/usr/lib/live/config-hooks/`; `medium` expande os arquivos em `minios/config-hooks/` na mídia live detectada (com alternativa de caminho ISO no componente de hooks). Arquivos locais explícitos podem usar `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` na raiz do sistema live. As entradas separadas por \| são executadas na ordem especificada; os arquivos expandidos por uma palavra-chave seguem a ordem dos curingas do shell. Exemplos estão instalados em `/usr/share/doc/live-config/examples/hooks/`.

> **Aviso de segurança:** `live-config` é executado como root. Os hooks são tornados executáveis e executados como root, e os arquivos preseed alteram o banco de dados debconf do sistema com privilégios de root. HTTP e FTP sem criptografia não autenticam o conteúdo baixado nem oferecem proteção de integridade. Prefira arquivos locais revisados ou um transporte autenticado confiável com verificação de integridade independente; não use hooks ou arquivos preseed remotos em redes não confiáveis.

### Opções de armazenamento antecipado MiniOS

Essas opções são lidas por `minios-boot` antes do início dos serviços comuns. Elas exigem a ativação bem-sucedida da persistência em armazenamento durável ou uma sessão gravável de RAM com informações protegidas `ram-origin`. Elas não ativam a persistência por conta própria e não podem tornar duráveis as alterações de RAM sem salvá-las.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` coloca o journal do systemd e os arquivos comuns de `/var/log` em um RAM de tamanho limitado; os diagnósticos de inicialização permanecem no armazenamento durável. Padrão: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` coloca os arquivos APT baixados em um tmpfs de tamanho limitado quando as condições de RAM e swap permitem. Os bancos de dados de pacotes e as listas de repositórios permanecem persistentes. Padrão: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` solicita caches do navegador nativo em RAM. O componente `browser-cache` monta os diretórios de cache selecionados pelo usuário da sessão live após a criação da conta. Padrão: `persistent`.

## Parâmetros de inicialização (atalhos)

Para alguns casos de uso comuns que exigiriam combinar vários parâmetros individuais, **live-config** oferece atalhos. Isso permite ter controle detalhado sobre todas as opções e, ao mesmo tempo, manter tudo simples.

- **live-config.noroot | noroot**: Desativa a configuração da senha de root e as concessões de privilégios de sudo e PolicyKit MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controla a configuração do sudo para o usuário live. O padrão, que também corresponde ao comportamento histórico MiniOS quando não definido, é `passwordless`. O modo `password` mantém o acesso ao sudo, mas exige a senha do usuário live. O modo `disabled` remove a concessão de sudo MiniOS e não adiciona o usuário live ao grupo sudo durante a criação da conta. O atalho antigo `noroot` substitui essa configuração e desativa de forma mais abrangente a configuração de privilégios de root.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controla as regras de conveniência do PolicyKit MiniOS. O padrão, que também corresponde ao comportamento histórico MiniOS quando não definido, é `passwordless`. O modo `password` e o modo `disabled` removem essa regra, aplicando a autenticação normal do PolicyKit da distribuição. `disabled` não é uma política que nega tudo; use `noroot` quando o usuário live não puder obter privilégios administrativos.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Grava uma política OpenSSH `PermitRootLogin` quando definida explicitamente e o openssh-server estiver instalado.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Grava uma política OpenSSH `PasswordAuthentication` quando definida explicitamente e o openssh-server estiver instalado.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controla as configurações de segurança do XRDP quando o xrdp está instalado. `relaxed` preserva os padrões históricos MiniOS. `hardened` vincula o XRDP ao localhost, restaura as configurações de segurança negociadas/altas e desativa o login de root no XRDP. `disabled` desativa e interrompe o XRDP por meio de `minios-svc` quando disponível.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controla as configurações de conveniência do X11 MiniOS. `relaxed` preserva a compatibilidade histórica. `hardened` remove a opção permissiva do servidor X `-ac` e reforça a segurança de `Xwrapper.config` quando presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controla se `/etc/issue` exibe as dicas de senha padrão de root/live MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controla se o live-config flexibiliza o bloqueio de tela. `relaxed` preserva a conveniência histórica da sessão live. `hardened` evita desativar o bloqueio do GNOME e ativa o bloqueio do xscreensaver quando esse arquivo está presente.
- **live-config.noautologin | noautologin**: Impede que o live-config configure o login automático no console e no ambiente gráfico. Não remove o login automático já configurado em uma sessão persistente.
- **live-config.nottyautologin | nottyautologin**: Impede que o live-config configure o login automático no console, sem afetar a configuração gráfica. A configuração persistente existente não é removida.
- **live-config.nox11autologin | nox11autologin**: Impede que o live-config configure o login automático pelo gerenciador de exibição, sem afetar a configuração de TTY. A configuração persistente existente não é removida.

## Parâmetros de inicialização (opções especiais)

Para casos de uso específicos, há alguns parâmetros especiais de inicialização.

- **live-config.debug | debug**: Ativa a saída de depuração no live-config.

## Arquivos de configuração

**live-config** pode ser configurado (mas não ativado) por meio de arquivos de configuração. Qualquer parâmetro de inicialização compatível pode ser colocado em `LIVE_CONFIG_CMDLINE`, e a maioria das opções também pode ser definida por meio de variáveis individuais. O parâmetro `boot=live` ainda é necessário para ativar **live-config**.

**Observação:** Se forem usados arquivos de configuração, todos os parâmetros de inicialização devem ser colocados (preferencialmente) na variável **LIVE_CONFIG_CMDLINE** ou podem ser definidas variáveis individuais. Se forem usadas variáveis individuais, o usuário deverá garantir que todas as variáveis necessárias sejam definidas para criar uma configuração válida.

`live-config` obtém o conteúdo de `/etc/live/config.conf` e depois de `/etc/live/config.conf.d/*.conf` na ordem de expansão de curingas do shell. Assim, fragmentos posteriores podem substituir valores do arquivo principal ou de fragmentos anteriores. Ele não obtém separadamente uma segunda camada de configuração de mídia.

Na mídia MiniOS, os arquivos de origem ficam em `minios/config.conf` e `minios/config.conf.d/*.conf`. Antes de `live-config` ser iniciado, o initramfs MiniOS sincroniza esses arquivos com os arquivos de execução do `/etc/live/` de acordo com o horário de modificação. Um arquivo de origem mais recente substitui seu correspondente de execução; um arquivo de execução mais recente é copiado de volta somente se o diretório de dados MiniOS selecionado for gravável. Timestamps iguais não causam cópia, arquivos ausentes são preenchidos e os arquivos não são excluídos. Essa é uma sincronização no momento da inicialização, não um monitoramento contínuo. Consulte [Arquivo de configuração](/reference/configuration/config.conf) para conhecer as regras completas de sincronização e precedência da linha de comando.

Como alternativa para implementações de initramfs que não prepararam o arquivo de execução, os wrappers de inicialização do systemd e do SysV copiam `minios/config.conf` da mídia detectada somente quando `/etc/live/config.conf` está ausente. Essa alternativa não copia `config.conf.d` fragmentos. O initramfs LiveKit MiniOS padrão e atual realiza a sincronização anterior.

Os arquivos de fragmentos devem corresponder a `*.conf`. Nomes como `vendor.conf` ou `project.conf` são recomendados; escolha os nomes lexicais deliberadamente, pois os fragmentos posteriores substituem os anteriores.

O conteúdo efetivo dos arquivos de configuração consiste em uma ou mais das seguintes variáveis.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variável corresponde à linha de comando do carregador de inicialização.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variável corresponde ao parâmetro `**live-config.hostname**=*HOSTNAME*`. O padrão é `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Seleciona a política de rede com fio. `dhcp` e um valor não definido não executam nenhuma ação e não removem um perfil estático MiniOS criado anteriormente.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Seleciona a interface com fio para a política `static` ou `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Define o endereço IPv4 estático.
- **LIVE_NETWORK_PREFIX=PREFIX**: Define o comprimento do prefixo estático; o padrão é `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Define o gateway estático opcional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Define servidores DNS opcionais separados por vírgulas.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Seleciona o backend implementado.

O componente de rede registra `/var/lib/live/config/network` após gravar a política com sucesso. Remova essa marca para aplicar uma política alterada em um sistema persistente. Para desativar um perfil estático anterior, use `network-method=off` ou remova manualmente o perfil gerenciado por MiniOS e a marca.

- **LIVE_USERNAME=USERNAME**: Esta variável corresponde ao parâmetro `**live-config.username**=*USERNAME*`. O padrão é `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variável corresponde ao parâmetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variável corresponde ao parâmetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password**=*PASSWORD*`. Ela especifica a senha do root em texto simples.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password-crypted**=*PASSWORD*`. Ela especifica a senha do root em formato criptografado.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password**=*PASSWORD*`. Ela especifica a senha do usuário em texto simples.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password-crypted**=*PASSWORD*`. Ela especifica a senha do usuário em formato criptografado.
- **LIVE_CONFIG_NOROOT=true|false**: Esta variável corresponde ao parâmetro `**live-config.noroot**` e desativa a configuração de privilégios do root, do sudo e do PolicyKit quando definida como `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Esta variável corresponde ao parâmetro `**live-config.sudo-mode**=...`. Se não for definida, MiniOS mantém o comportamento histórico de sudo sem senha.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Esta variável corresponde ao parâmetro `**live-config.polkit-mode**=...`. `password` e `disabled` removem a regra sem senha MiniOS e restauram a autenticação normal do PolicyKit da distribuição.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Esta variável corresponde ao parâmetro `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Esta variável corresponde ao parâmetro `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Esta variável corresponde ao parâmetro `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Esta variável corresponde ao parâmetro `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Esta variável corresponde ao parâmetro `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Esta variável corresponde ao parâmetro `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Esta variável corresponde ao parâmetro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Esta variável corresponde ao parâmetro `**live-config.timezone**=*TIMEZONE*`.
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
- **LIVE_LINK_USER_DIRS=true|false**: Ativa ou desativa os links dos diretórios de dados padrão do usuário para a unidade MiniOS gravável. O parâmetro de inicialização correspondente é a flag `live-config.link-user-dirs` simples. O modo de link não pode ser combinado com o modo bind nem com qualquer modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Ativa ou desativa as montagens bind dos diretórios de dados padrão do usuário a partir da unidade MiniOS gravável. O parâmetro de inicialização correspondente é a flag `live-config.bind-user-dirs` simples. O modo bind não pode ser combinado com o modo link nem com qualquer modo `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Esta variável corresponde ao parâmetro `**live-config.user-dirs-path**=*PATH*`. Ela especifica um caminho seguro dentro da unidade MiniOS FAT32, exFAT ou NTFS. O padrão é `/minios/userdata`; segmentos de ponto e diretório pai são rejeitados.

A configuração de mídia do usuário nunca mescla automaticamente dois diretórios não vazios. Um diretório local não vazio só é migrado quando o destino na mídia está vazio. Quando o recurso é desativado, os dados de mídia gerenciados são copiados de volta antes que os links sejam removidos. A ativação da mídia do usuário e a cópia de volta são bloqueadas enquanto a sessão de persistência ativa estiver criptografada com LUKS, impedindo que os dados da sessão sejam movidos para a mídia MiniOS não criptografada. Essa decisão usa o estado real de criptografia ativo: `perchencrypt=luks` só solicita criptografia ao criar uma nova sessão e não descreve uma sessão existente. Uma validação ou cópia malsucedida deixa os diretórios de usuário existentes no lugar e registra o motivo em `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Esta variável contém o estado especificado pelo parâmetro `live-config.module-mode` (ou `module-mode`) . Quando definida como `merged`, o sistema live aplica atualizações (por meio de minios-update-users, minios-update-cache e minios-update-dpkg) para mesclar configurações personalizadas com o ambiente base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variável corresponde ao parâmetro `**live-config.debug**`.

## MiniOS variáveis de cache e log

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, e **LIVE_BROWSER_CACHE=persistent|volatile**: Políticas independentes de inicialização do MiniOS. Elas também funcionam em `config.conf.d` e `LIVE_CONFIG_CMDLINE`. Elas não habilitam a persistência por si só. Consulte o [Arquivo de configuração](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

O `browser-cache` componente lê a política validada `minios-boot` após a criação do usuário ativo e faz bind mount dos diretórios padrão de cache do navegador nativo em um sistema de arquivos compartilhado e limitado RAM, sujeito a verificações de memória/swap. Uma política do Firefox criada separadamente desabilita o cache em disco sem mover os perfis do navegador. Se esse componente for excluído por `components=` ou `nocomponents=`, a solicitação inicial de cache do navegador, por si só, não configura os mounts por usuário.

Os auxiliares do modo mesclado mantêm os erros normais, mas criam rastreamentos detalhados de comandos e cópias de depuração somente quando `LIVE_CONFIG_DEBUG=true`.

# PERSONALIZAÇÃO

**live-config** pode ser facilmente personalizado para projetos derivados ou uso local.

## Adicionando novos componentes de configuração

Os projetos derivados podem colocar seus componentes em /usr/lib/live/config e não precisam fazer mais nada; os componentes serão chamados automaticamente durante a inicialização.

O ideal é colocar os componentes em um pacote Debian próprio. Um pacote de exemplo contendo um componente de exemplo pode ser encontrado em /usr/share/doc/live-config/examples.

## Removendo componentes de configuração existentes

Ainda não é realmente possível remover os próprios componentes de forma adequada sem precisar enviar um pacote localmente modificado **live-config** ou usar dpkg-divert. No entanto, o mesmo pode ser obtido desabilitando os componentes correspondentes por meio do mecanismo live-config.nocomponents; consulte acima. Para evitar ter que sempre especificar os componentes desabilitados por meio do parâmetro de inicialização, deve-se usar um arquivo de configuração; consulte acima.

É melhor colocar os arquivos de configuração do próprio sistema live em um pacote Debian separado. Um pacote de exemplo contendo uma configuração de exemplo pode ser encontrado em /usr/share/doc/live-config/examples.

# COMPONENTES

**live-config** atualmente inclui os seguintes componentes em /usr/lib/live/config.

- **nss-systemd**: remove ou restaura o módulo NSS do systemd em /etc/nsswitch.conf para contornar um problema conhecido do systemd.
- **debconf**: permite aplicar arquivos preseed arbitrários localizados na mídia live ou em um servidor HTTP/FTP.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: configura o arquivo /etc/issue com um banner de boas-vindas e informações da distribuição.
- **live-debconfig_passwd**: configura as senhas dos usuários e do root por meio do live-debconfig.
- **user-setup**: adiciona uma conta de usuário live.
- **user-groups**: adiciona o usuário live aos grupos suplementares declarados pelos módulos instalados. Os grupos existentes listados em `/usr/share/live/config/user-default-groups.d/*.groups` são aplicados após a criação do usuário e em execuções posteriores do live-config.
- **root-setup**: define ou atualiza a senha do root e configura o ambiente do usuário root.
- **sudo**: concede privilégios de sudo ao usuário live.
- **user-ssh-keys**: sincroniza arquivos `authorized_keys.<username>` específicos do usuário entre a mídia live e os diretórios pessoais de cada usuário. Oferece suporte simultâneo a vários usuários (por exemplo, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) e reconhece `toram`, `toram=trim`, e `toram=full` como formas RAM-boot ao determinar se a mídia live pode ser atualizada com segurança.
- **user-media**: cria links ou bind mounts para diretórios de usuário validados na mídia de dados MiniOS gravável existente, com migração segura e cópia de volta quando desativado.
- **locales**: configura as localidades.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura o nome de usuário em xorg.service e aplica a configuração do X11 quando compatível.
- **gdm3**: configura o login automático no gdm3.
- **sddm**: configura o login automático no sddm.
- **kdm**: configura o login automático no kdm.
- **lightdm**: configura o login automático no lightdm.
- **lxdm**: configura o login automático no lxdm.
- **nodm**: configura o login automático no nodm.
- **slim**: configura o login automático no slim.
- **xinit**: configura o login automático com o xinit.
- **keyboard-configuration**: configura o teclado.
- **sysvinit**: configura o login automático no console por meio de `/etc/inittab` quando o sysvinit está instalado. Os atalhos `noautologin` e `nottyautologin` impedem essa configuração.
- **sysv-rc**: configura o sysv-rc desativando os serviços listados.
- **apport**: desativa o apport.
- **gnome-panel-data**: desativa o botão de bloqueio da tela.
- **gnome-power-manager**: desativa a hibernação.
- **gnome-screensaver**: controla o bloqueio de tela do GNOME de acordo com `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: desativa o assistente de migração do KDE (squeeze e posteriores).
- **kde-services**: desativa alguns serviços indesejados do KDE (squeeze e posteriores).
- **policykit**: concede privilégios de usuário por meio do PolicyKit.
- **ssl-cert**: regenera certificados SSL snake-oil.
- **xrdp**: configura o modo do XRDP como relaxado, reforçado ou desativado quando o XRDP está instalado.
- **anacron**: desativa o anacron.
- **util-linux**: desativa o serviço hwclock do util-linux.
- **login**: desativa o lastlog.
- **xserver-xorg**: configura o xserver-xorg.
- **network**: configura uma política IPv4 com fio persistente por meio de um keyfile seguro do NetworkManager ou de uma seção do ifupdown. É executado antes dos serviços de rede, valida todos os valores e grava a marca somente após uma gravação bem-sucedida.
- **openssh-server**: recria as chaves de host do OpenSSH e grava a política de login do root ou de autenticação por senha solicitada explicitamente.
- **xfce4-panel**: configura o xfce4-panel com as configurações padrão.
- **xscreensaver**: controla o bloqueio do xscreensaver de acordo com `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura os drivers WLAN do broadcom-sta.
- **hyperv**: configura as definições do X11 para melhorar a compatibilidade em plataformas Microsoft Hyper-V.
- **ntfs3**: gerencia regras do udev para suporte a NTFS3.
- **config-module-mode**: configura o modo dos módulos do sistema e atualiza caches, configurações de usuário e o dpkg.
- **browser-cache**: aplica a política de browser-cache validada após a criação do usuário, sujeita à memória e ao swap disponíveis, a caminhos de cache seguros e aos arquivos de política existentes do Firefox.
- **hooks**: permite executar comandos arbitrários a partir de um arquivo localizado na mídia live ou em um servidor HTTP/FTP.

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
- `minios/log/YYYYMMDD_HHMMSS/` em mídias de dados selecionadas graváveis quando a exportação do log está habilitada
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` na mídia live detectada (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` na mídia live detectada (`medium` preseeds)

# VEJA TAMBÉM

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PÁGINA INICIAL

Mais informações sobre **minios-live-config** podem ser encontradas em seu [repositório do GitHub](https://github.com/minios-linux/minios-live-config). Informações gerais sobre MiniOS estão disponíveis em [minios.dev](https://minios.dev).

# ERROS

Os bugs podem ser reportados no [rastreador de problemas do minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTOR

**live-config** foi originalmente escrito por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, o desenvolvimento continuou com a equipe Debian Live. Desde 2025, o desenvolvimento da versão modificada **minios-live-config** continuou com a equipe Live do MiniOS.
