---
updated: 2026-08-31
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Componentes de Configuração do Sistema

O **live-config** contém os componentes que configuram um sistema live durante o processo de boot (espaço de usuário tardio).

O boot pela rede no initramfs (`ip=`, PXE, `from=http://…`) é uma camada separada do LiveKit e **não** é gerenciada pelo live-config. Veja [Boot pela rede](/reference/boot-process/Network-Boot).

O **live-config** pode ser configurado por parâmetros de boot ou pelos arquivos de configuração em tempo de execução preparados pelo initramfs. A linha de comando real do kernel é anexada após os valores fornecidos pelo arquivo `LIVE_CONFIG_CMDLINE`, então os parâmetros de boot correspondentes mais recentes têm precedência. Componentes que gravam estado em `/var/lib/live/config` normalmente são executados apenas uma vez; componentes de sincronização e stateless podem rodar a cada invocação.

Se o *live-build*(7) for utilizado para construir o sistema live, os parâmetros padrão do live-config podem ser definidos pela opção `--bootappend-live`, veja a página de manual *lb_config*(1).

## Parâmetros de Boot (componentes)

O **live-config** só é ativado se `boot=live` for utilizado como parâmetro de boot. Por padrão, todos os componentes são executados. O parâmetro `live-config.components` pode restringir quais componentes serão executados, e `live-config.nocomponents` pode excluir componentes. Se ambos os parâmetros forem usados, ou se algum deles for especificado várias vezes, a última ocorrência terá precedência.

- **live-config.components | components**: Todos os componentes são executados. Este é o padrão utilizado pelas imagens live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Apenas os componentes especificados são executados. Os componentes são executados na ordem codificada em seus nomes de arquivo sob `/usr/lib/live/config`, independentemente da ordem nesta lista.
- **live-config.nocomponents | nocomponents**: Nenhum componente é executado.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Todos os componentes são executados, exceto os especificados.

## Parâmetros de Boot (opções)

Alguns componentes individuais podem alterar seu comportamento conforme um parâmetro de boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Busca e aplica um ou mais arquivos de preseed do debconf. URLs são manipuladas por `wget` e podem usar HTTP, FTP ou `file://`. A palavra-chave `filesystem` expande arquivos em `/usr/lib/live/config-preseed/`; `medium` expande arquivos em `minios/config-preseed/` no meio live detectado. Arquivos locais explícitos podem usar caminhos como `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` na raiz do live. Entradas separadas por pipe são processadas na ordem especificada; arquivos expandidos por palavra-chave usam a ordem glob do shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite definir o hostname do sistema. O padrão é `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Seleciona a política de rede cabeada. Não definido e `dhcp` deixam o padrão da imagem inalterado. `static` grava a configuração para o backend selecionado; `off` desativa a configuração automática de IPv4 para a interface selecionada.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Seleciona a interface cabeada. Se omitido para `static` ou `off`, a única interface cabeada não-loopback é selecionada automaticamente; zero ou múltiplos candidatos exigem valor explícito.
- **live-config.network-address=IPV4 | network-address=IPV4**: Define o endereço IPv4 estático.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Define o comprimento do prefixo IPv4 de 0 a 32. O padrão estático é `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Define o gateway IPv4 opcional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Define endereços de servidores DNS opcionais, separados por vírgula.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Seleciona o backend de rede. `auto` prefere NetworkManager e recorre ao ifupdown. `ifupdown` forçado marca a interface como não gerenciada pelo NetworkManager quando ambos os stacks estão instalados.
- **live-config.username=USERNAME | username=USERNAME**: Permite definir o nome de usuário criado para autologin. O padrão é `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Define os grupos suplementares para o usuário criado para autologin. Os nomes dos grupos podem ser separados por vírgula ou espaço. O padrão do MiniOS é `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite definir o nome completo do usuário criado para autologin. O padrão do MiniOS é `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite definir a senha do root em texto simples.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite definir a senha do root em formato criptografado.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite definir a senha do usuário em texto simples.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite definir a senha do usuário em formato criptografado.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite definir o locale do sistema, por exemplo, `de_CH.UTF-8`. O padrão é `en_US.UTF-8`. Caso o locale selecionado não esteja disponível no sistema, ele é gerado automaticamente.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite definir o fuso horário do sistema, por exemplo, `Europe/Zurich`. O padrão é `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite alterar o modelo do teclado. Não há valor padrão definido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite alterar os layouts de teclado. Se mais de um for especificado, as ferramentas do ambiente gráfico permitirão alternar sob X11. Não há valor padrão definido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite alterar as variantes de teclado. Se mais de uma for especificada, deve-se informar o mesmo número de valores que os layouts, pois serão pareados na ordem especificada. Valores em branco são permitidos. As ferramentas do ambiente gráfico permitirão alternar entre cada par de layout e variante sob X11. Não há valor padrão definido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite alterar as opções do teclado. Não há valor padrão definido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite desabilitar serviços sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite definir se o sistema assume que o relógio de hardware está em UTC ou não. O padrão é `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite definir o x-session-manager via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite definir o driver xorg ao invés de autodetectar. Se um ID PCI for especificado em `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro do sistema live, o *DRIVER* é forçado para esses dispositivos. Se houver tanto um parâmetro de boot quanto uma sobrescrição, o parâmetro de boot tem precedência.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite definir a resolução do xorg ao invés de autodetectar, por exemplo, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite definir o driver WLAN ao invés de autodetectar. Se um ID PCI for especificado em `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro do sistema live, o *DRIVER* é forçado para esses dispositivos. Se houver tanto um parâmetro de boot quanto uma sobrescrição, o parâmetro de boot tem precedência.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Permite especificar o modo de módulo para configuração live. Quando definido como `merged`, o sistema atualizará contas de usuário, reconstruirá caches e atualizará configurações de pacotes para que as alterações de configuração sejam integradas dinamicamente ao sistema em execução.
- **live-config.link-user-dirs | link-user-dirs**: Cria links dos diretórios gerenciados do usuário para o caminho configurado no meio de dados do MiniOS.
- **live-config.bind-user-dirs | bind-user-dirs**: Faz bind-mount dos diretórios gerenciados do usuário a partir do caminho configurado no meio de dados do MiniOS. Esta opção é mutuamente exclusiva com `link-user-dirs`.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Define o caminho relativo à mídia usado por `link-user-dirs` ou `bind-user-dirs`. O padrão é `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Busca e executa arquivos arbitrários a partir de um arquivo temporário no sistema live em execução. URLs são manipuladas por `wget` e podem usar HTTP, FTP ou `file://`; os interpretadores necessários e outras dependências devem já estar instalados. A palavra-chave `filesystem` expande arquivos em `/usr/lib/live/config-hooks/`; `medium` expande arquivos em `minios/config-hooks/` no meio live detectado (com fallback para caminho ISO no componente de hook). Arquivos locais explícitos podem usar `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` na raiz do live. Entradas separadas por pipe são executadas na ordem especificada; arquivos expandidos por palavra-chave usam a ordem glob do shell. Exemplos são instalados em `/usr/share/doc/live-config/examples/hooks/`.

> **Aviso de segurança:** `live-config` é executado como root. Hooks são tornados executáveis e executados como root, e preseeds alteram o banco de dados debconf do sistema com privilégios de root. HTTP e FTP simples não autenticam o conteúdo baixado e não fornecem proteção de integridade. Prefira arquivos locais revisados ou transporte autenticado confiável com verificação de integridade independente; não use hooks ou preseeds remotos de redes não confiáveis.

## Parâmetros de Boot (atalhos)

Para alguns casos de uso comuns onde seria necessário combinar vários parâmetros individuais, o **live-config** oferece atalhos. Isso permite tanto granularidade total sobre todas as opções quanto manter as coisas simples.

- **live-config.noroot | noroot**: Desativa a configuração de senha do root e as concessões de privilégios sudo e PolicyKit do MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controla a configuração do sudo para o usuário live. O padrão, e o comportamento histórico do MiniOS quando não definido, é `passwordless`. O modo `password` mantém o acesso sudo, mas exige a senha do usuário live. O modo `disabled` remove a concessão sudo do MiniOS e mantém o usuário live fora do grupo sudo ao criar o usuário. O atalho antigo `noroot` sobrescreve isso e desativa a configuração de privilégios de root de forma mais ampla.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controla as regras de conveniência do PolicyKit do MiniOS. O padrão, e o comportamento histórico do MiniOS quando não definido, é `passwordless`. Os modos `password` e `disabled` removem essa regra, então a autenticação padrão do PolicyKit da distribuição se aplica. `disabled` não é uma política de negação total; use `noroot` quando o usuário live não deve obter privilégios administrativos.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Escreve uma política `PermitRootLogin` do OpenSSH quando explicitamente definido e o openssh-server está instalado.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Escreve uma política `PasswordAuthentication` do OpenSSH quando explicitamente definido e o openssh-server está instalado.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controla a postura do XRDP quando o xrdp está instalado. `relaxed` preserva os padrões históricos do MiniOS. `hardened` vincula o XRDP ao localhost, restaura configurações negociadas/de alta segurança e desativa o login root no XRDP. `disabled` desativa e para o XRDP via `minios-svc` quando disponível.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controla a postura de conveniência do X11 do MiniOS. `relaxed` preserva a compatibilidade histórica. `hardened` remove a opção permissiva `-ac` do X server e reforça `Xwrapper.config` quando presente.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controla se `/etc/issue` mostra as dicas de senha padrão do root/live do MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controla se o live-config relaxa o bloqueio de tela. `relaxed` preserva a conveniência histórica da sessão live. `hardened` evita desabilitar o bloqueio do GNOME e ativa o bloqueio do xscreensaver onde esse arquivo está presente.
- **live-config.noautologin | noautologin**: Impede que o live-config configure autologin no console e no modo gráfico. Não remove autologin já configurado em uma sessão persistente.
- **live-config.nottyautologin | nottyautologin**: Impede que o live-config configure autologin no console, sem afetar a configuração gráfica. Configuração persistente existente não é removida.
- **live-config.nox11autologin | nox11autologin**: Impede que o live-config configure autologin no display-manager, sem afetar a configuração TTY. Configuração persistente existente não é removida.

## Parâmetros de Boot (opções especiais)

Para casos de uso especiais, existem alguns parâmetros de boot específicos.

- **live-config.debug | debug**: Habilita a saída de debug no live-config.

## Arquivos de Configuração

O **live-config** pode ser configurado (mas não ativado) por meio de arquivos de configuração. Qualquer parâmetro de boot suportado pode ser colocado em `LIVE_CONFIG_CMDLINE`, e a maioria das opções pode, alternativamente, ser definida por variáveis individuais. O parâmetro `boot=live` ainda é necessário para ativar o **live-config**.

**Nota:** Se arquivos de configuração forem utilizados, todos os parâmetros de boot devem ser inseridos (preferencialmente) na variável **LIVE_CONFIG_CMDLINE**, ou as variáveis individuais podem ser definidas. Se variáveis individuais forem usadas, o usuário deve garantir que todas as variáveis necessárias estejam configuradas para criar uma configuração válida.

O próprio `live-config` faz o source de `/etc/live/config.conf` e depois `/etc/live/config.conf.d/*.conf` na ordem do glob do shell. Assim, fragmentos posteriores podem substituir valores do arquivo principal ou de fragmentos anteriores. Não há uma segunda camada de configuração de mídia sendo carregada separadamente.

Em mídias MiniOS, os arquivos de origem são `minios/config.conf` e `minios/config.conf.d/*.conf`. Antes do início do `live-config`, o initramfs MiniOS sincroniza esses arquivos com os arquivos de runtime `/etc/live/` de acordo com o horário de modificação. Um arquivo de origem mais recente substitui seu equivalente de runtime; um arquivo de runtime mais recente só é copiado de volta se o diretório de dados MiniOS selecionado for gravável. Timestamps iguais não causam cópia, arquivos ausentes são preenchidos e arquivos não são excluídos. Esta é uma sincronização feita na inicialização, não um monitoramento contínuo. Consulte [Arquivo de configuração](/reference/configuration/config.conf) para as regras completas de sincronização e precedência da linha de comando.

Como fallback para implementações de initramfs que não prepararam o arquivo de runtime, os wrappers de inicialização systemd e SysV copiam `minios/config.conf` da mídia detectada apenas quando `/etc/live/config.conf` está ausente. Esse fallback não copia fragmentos `config.conf.d`. O initramfs padrão atual MiniOS do LiveKit executa a sincronização anterior.

Os arquivos de fragmento devem corresponder a `*.conf`. Nomes como `vendor.conf` ou `project.conf` são recomendados; escolha nomes lexicais deliberadamente, pois fragmentos posteriores sobrescrevem anteriores.

O conteúdo real dos arquivos de configuração consiste em uma ou mais das seguintes variáveis:

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variável corresponde à linha de comando do bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variável corresponde ao parâmetro `**live-config.hostname**=*HOSTNAME*`. O padrão é `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Seleciona a política de rede cabeada. `dhcp` e um valor não definido não fazem nada e não removem um perfil estático MiniOS previamente criado.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Seleciona a interface cabeada para a política `static` ou `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Define o endereço IPv4 estático.
- **LIVE_NETWORK_PREFIX=PREFIX**: Define o comprimento do prefixo estático; o padrão é `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Define o gateway estático opcional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Define servidores DNS opcionais, separados por vírgula.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Seleciona o backend implementado.

O componente de rede grava `/var/lib/live/config/network` após escrever a política com sucesso. Remova esse carimbo para aplicar uma política alterada em um sistema persistente. Para remover um perfil estático anterior, use `network-method=off` ou remova manualmente o perfil e o carimbo gerenciados por MiniOS.

- **LIVE_USERNAME=USERNAME**: Esta variável corresponde ao parâmetro `**live-config.username**=*USERNAME*`. O padrão é `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variável corresponde ao parâmetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variável corresponde ao parâmetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password**=*PASSWORD*`. Especifica a senha root em texto simples.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password-crypted**=*PASSWORD*`. Especifica a senha root em formato criptografado.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password**=*PASSWORD*`. Especifica a senha do usuário em texto simples.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password-crypted**=*PASSWORD*`. Especifica a senha do usuário em formato criptografado.
- **LIVE_CONFIG_NOROOT=true|false**: Esta variável corresponde ao parâmetro `**live-config.noroot**` e desativa a configuração de privilégios de root, sudo e PolicyKit quando definida como `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Esta variável corresponde ao parâmetro `**live-config.sudo-mode**=...`. Se não definida, MiniOS mantém o comportamento histórico de sudo sem senha.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Esta variável corresponde ao parâmetro `**live-config.polkit-mode**=...`. `password` e `disabled` removem a regra de PolicyKit sem senha MiniOS e restauram a autenticação padrão da distribuição.
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
- **LIVE_LINK_USER_DIRS=true|false**: Habilita ou desabilita links dos diretórios padrão de dados do usuário para o drive MiniOS gravável. O parâmetro correspondente de boot é o flag `live-config.link-user-dirs`. O modo link não pode ser combinado com o modo bind ou qualquer modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Habilita ou desabilita montagens bind dos diretórios padrão de dados do usuário a partir do drive MiniOS gravável. O parâmetro correspondente de boot é o flag `live-config.bind-user-dirs`. O modo bind não pode ser combinado com o modo link ou qualquer modo `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Esta variável corresponde ao parâmetro `**live-config.user-dirs-path**=*PATH*`. Especifica um caminho seguro dentro do drive MiniOS FAT32, exFAT ou NTFS. O padrão é `/minios/userdata`; segmentos de ponto e diretório-pai são rejeitados.

A configuração de mídia do usuário nunca mescla automaticamente dois diretórios não vazios. Um diretório local não vazio só é migrado quando o destino na mídia está vazio. Quando o recurso é desabilitado, os dados gerenciados na mídia são copiados de volta antes que os links sejam removidos. Uma validação ou cópia com falha mantém os diretórios de usuário existentes e registra o motivo em `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Esta variável armazena o estado especificado pelo parâmetro `live-config.module-mode` (ou `module-mode`). Quando definida como `merged`, o sistema live aplica atualizações (via minios-update-users, minios-update-cache e minios-update-dpkg) para mesclar configurações personalizadas com o ambiente base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variável corresponde ao parâmetro `**live-config.debug**`.

# PERSONALIZAÇÃO

O **live-config** pode ser facilmente customizado para projetos derivados ou uso local.

## Adicionando novos componentes de configuração

Projetos derivados podem colocar seus componentes em /usr/lib/live/config e não precisam fazer mais nada, pois os componentes serão chamados automaticamente durante o boot.

O ideal é que os componentes sejam empacotados em um pacote debian próprio. Um pacote de exemplo contendo um componente pode ser encontrado em /usr/share/doc/live-config/examples.

## Removendo componentes de configuração existentes

Ainda não é realmente possível remover componentes de forma adequada sem exigir o envio de um pacote **live-config** modificado localmente ou o uso de dpkg-divert. No entanto, o mesmo pode ser alcançado desabilitando os componentes respectivos através do mecanismo live-config.nocomponents, veja acima. Para evitar precisar sempre especificar componentes desabilitados pelo parâmetro de boot, deve-se usar um arquivo de configuração, conforme explicado acima.

Os arquivos de configuração para o próprio sistema live devem ser preferencialmente colocados em um pacote debian próprio. Um pacote de exemplo contendo uma configuração pode ser encontrado em /usr/share/doc/live-config/examples.

# COMPONENTES

O **live-config** atualmente possui os seguintes componentes em /usr/lib/live/config.

- **nss-systemd**: remove ou restaura o módulo NSS do systemd em /etc/nsswitch.conf para contornar um problema conhecido do systemd.
- **debconf**: permite aplicar arquivos de preseed arbitrários colocados na mídia live ou em um servidor http/ftp.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: configura o arquivo /etc/issue com uma mensagem de boas-vindas e informações da distribuição.
- **live-debconfig_passwd**: configura senhas de usuário e root via live-debconfig.
- **user-setup**: adiciona uma conta de usuário live.
- **user-groups**: adiciona o usuário live a grupos suplementares declarados por módulos instalados. Grupos existentes listados em `/usr/share/live/config/user-default-groups.d/*.groups` são aplicados após a criação do usuário e em execuções posteriores do live-config.
- **root-setup**: define ou atualiza a senha do root e configura o ambiente do usuário root.
- **sudo**: concede privilégios sudo ao usuário live.
- **user-ssh-keys**: sincroniza arquivos `authorized_keys.<username>` específicos do usuário entre a mídia live e os diretórios home individuais dos usuários. Suporta múltiplos usuários simultaneamente (por exemplo, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: cria links ou faz bind-mount de diretórios validados do usuário na mídia de dados MiniOS gravável existente, com migração segura e cópia de volta ao desativar.
- **locales**: configura locales.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura o nome de usuário em xorg.service e aplica postura X11 quando suportado.
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
- **sysv-rc**: configura sysv-rc desabilitando os serviços listados.
- **apport**: desativa o apport.
- **gnome-panel-data**: desativa o botão de bloqueio de tela.
- **gnome-power-manager**: desativa a hibernação.
- **gnome-screensaver**: controla o bloqueio de tela do GNOME conforme `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: desativa o assistente de migração do KDE (squeeze e mais recentes).
- **kde-services**: desativa alguns serviços indesejados do KDE (squeeze e mais recentes).
- **policykit**: concede privilégios ao usuário via PolicyKit.
- **ssl-cert**: regenera certificados snake-oil SSL.
- **xrdp**: configura postura XRDP relaxada, reforçada ou desabilitada quando o XRDP está instalado.
- **anacron**: desativa o anacron.
- **util-linux**: desativa o serviço hwclock do util-linux.
- **login**: desativa o lastlog.
- **xserver-xorg**: configura o xserver-xorg.
- **network**: configura política IPv4 cabeada durável via arquivo seguro do NetworkManager ou stanza ifupdown. Executa antes dos serviços de rede, valida todos os valores e só grava o carimbo após sucesso.
- **openssh-server**: recria chaves host do OpenSSH e grava política de login root ou autenticação por senha explicitamente solicitada.
- **xfce4-panel**: configura o xfce4-panel para as configurações padrão.
- **xscreensaver**: controla o bloqueio do xscreensaver conforme `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configura drivers WLAN broadcom-sta.
- **hyperv**: configura ajustes do X11 para melhorar a compatibilidade em plataformas Microsoft Hyper-V.
- **ntfs3**: gerencia regras udev para suporte ao NTFS3.
- **config-module-mode**: configura o modo de módulo do sistema e atualiza caches, configurações de usuário e dpkg.
- **hooks**: permite executar comandos arbitrários a partir de um arquivo colocado na mídia live ou em um servidor http/ftp.

# ARQUIVOS

- `minios/config.conf` na mídia de dados MiniOS selecionada (cópia de origem)
- `minios/config.conf.d/*.conf` na mídia de dados MiniOS selecionada (fragmentos de origem)
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
- `minios/log/YYYYMMDD_HHMMSS/` em mídia de dados selecionada gravável quando a exportação de logs está habilitada
- `/usr/lib/live/config-hooks/*` (hooks `filesystem`)
- `minios/config-hooks/*` na mídia live detectada (hooks `medium`)
- `/usr/lib/live/config-preseed/*` (preseeds `filesystem`)
- `minios/config-preseed/*` na mídia live detectada (preseeds `medium`)

# VEJA TAMBÉM

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

Mais informações sobre o **minios-live-config** podem ser encontradas em seu [repositório no GitHub](https://github.com/minios-linux/minios-live-config). Informações gerais sobre o MiniOS estão disponíveis em [minios.dev](https://minios.dev).

# BUGS

Bugs podem ser reportados no [issue tracker do minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# AUTOR

O **live-config** foi originalmente escrito por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, o desenvolvimento foi continuado pela equipe Debian Live. Desde 2025, o desenvolvimento da versão modificada **minios-live-config** tem sido continuado pela equipe MiniOS Live.
