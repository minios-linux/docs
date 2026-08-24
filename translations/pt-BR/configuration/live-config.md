# LIVE-CONFIG

**live-config** - Componentes de Configuração do Sistema

**live-config** contém os componentes responsáveis por configurar um sistema live durante o processo de boot (espaço de usuário tardio).

**live-config** pode ser configurado através de parâmetros de boot ou arquivos de configuração. Se ambos os mecanismos forem usados para uma determinada opção, os parâmetros de boot têm prioridade sobre os arquivos de configuração. Ao utilizar persistência, os componentes do **live-config** são executados apenas uma vez.

Se o *live-build*(7) for utilizado para construir o sistema live, os parâmetros padrão do live-config podem ser definidos pela opção `--bootappend-live`. Consulte a página de manual do *lb_config*(1).

## Parâmetros de Boot (componentes)

**live-config** só é ativado se `boot=live` for utilizado como parâmetro de boot. Além disso, é necessário informar ao **live-config** quais componentes executar através do parâmetro `live-config.components` ou quais componentes não executar através do parâmetro `live-config.nocomponents`. Se ambos `live-config.components` e `live-config.nocomponents` forem utilizados, ou se qualquer um deles for especificado múltiplas vezes, sempre o último terá prioridade sobre os anteriores.

- **live-config.components | components**: Todos os componentes são executados. Este é o comportamento padrão das imagens live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Apenas os componentes especificados serão executados. Note que a ordem é importante, por exemplo, `live-config.components=sudo,user-setup` não funcionaria, pois o usuário precisa ser adicionado antes de ser configurado para o sudo. Verifique os nomes dos arquivos dos componentes em `/usr/lib/live/config` para saber o número de ordenação.
- **live-config.nocomponents | nocomponents**: Nenhum componente é executado. Isso equivale a não usar nenhum dos parâmetros `live-config.components` ou `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Todos os componentes são executados, exceto os especificados.

## Parâmetros de Boot (opções)

Alguns componentes individuais podem alterar seu comportamento de acordo com um parâmetro de boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Permite buscar e aplicar um ou mais arquivos de preseed do debconf ao banco de dados do debconf. Note que as URLs devem ser acessíveis pelo wget (http, ftp ou file://). Se o arquivo estiver no meio live, pode ser acessado via `file:///run/initramfs/memory/data/FILE`, ou com `file:///FILE` se estiver no sistema de arquivos raiz do próprio sistema live. Todos os arquivos de preseed em `/usr/lib/live/config-preseed/` no sistema de arquivos raiz do live podem ser habilitados automaticamente usando a palavra-chave `filesystem`. Todos os arquivos de preseed em `/minios/config-preseed/` no meio live podem ser habilitados automaticamente com a palavra-chave `medium`. Se vários mecanismos forem combinados, os arquivos de preseed do filesystem são aplicados primeiro, depois os do medium e, por último, os da rede.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite definir o hostname do sistema. O padrão é `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Permite definir o nome de usuário que será criado para o login automático. O padrão é `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Permite definir os grupos padrão dos usuários criados para login automático. O padrão é `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite definir o nome completo dos usuários criados para login automático. No MiniOS, o padrão é `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite definir a senha do root em texto simples.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite definir a senha do root em formato criptografado.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite definir a senha do usuário em texto simples.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite definir a senha do usuário em formato criptografado.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite definir o locale do sistema, por exemplo, `de_CH.UTF-8`. O padrão é `en_US.UTF-8`. Caso o locale selecionado não esteja disponível no sistema, ele será gerado automaticamente.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite definir o fuso horário do sistema, por exemplo, `Europe/Zurich`. O padrão é `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite alterar o modelo do teclado. Não há valor padrão definido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite alterar os layouts do teclado. Se mais de um for especificado, as ferramentas do ambiente gráfico permitirão alternar entre eles no X11. Não há valor padrão definido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite alterar as variantes do teclado. Se mais de uma for especificada, deve-se informar o mesmo número de variantes que de layouts, pois serão pareados na ordem especificada. Valores em branco são permitidos. As ferramentas do ambiente gráfico permitirão alternar entre cada par de layout e variante no X11. Não há valor padrão definido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite alterar as opções do teclado. Não há valor padrão definido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite desabilitar serviços sysv através do update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite definir se o sistema assume que o relógio de hardware está ajustado para UTC ou não. O padrão é `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite definir o x-session-manager através do update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite definir o driver do xorg ao invés de autodetectar. Se um ID PCI estiver especificado em `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro do sistema live, o *DRIVER* será aplicado para esses dispositivos. Se houver tanto um parâmetro de boot quanto uma sobrescrição, o parâmetro de boot tem prioridade.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite definir a resolução do xorg ao invés de autodetectar, por exemplo, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite definir o driver WLAN ao invés de autodetectar. Se um ID PCI estiver especificado em `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro do sistema live, o *DRIVER* será aplicado para esses dispositivos. Se houver tanto um parâmetro de boot quanto uma sobrescrição, o parâmetro de boot tem prioridade.
- **live-config.module-mode=MODE | module-mode=MODE**: Permite especificar o modo de módulo para a configuração live. Quando definido como "merged", o sistema irá atualizar contas de usuário, reconstruir caches e atualizar configurações de pacotes para que as alterações de configuração sejam integradas dinamicamente ao sistema em execução.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Permite buscar e executar um ou mais arquivos arbitrários. Note que as URLs devem ser acessíveis pelo wget (http, ftp ou file://), os arquivos são executados em /tmp do sistema live em execução, e os arquivos precisam de suas dependências já instaladas, por exemplo, se um script python deve ser executado, o sistema precisa ter python instalado. Alguns hooks para casos de uso comuns estão disponíveis em `/usr/share/doc/live-config/examples/hooks/`. Se o arquivo estiver no meio live, pode ser acessado via `file:///run/initramfs/memory/data/FILE`, ou com `file:///FILE` se estiver no sistema de arquivos raiz do próprio sistema live. Todos os hooks em `/usr/lib/live/config-hooks/` no sistema de arquivos raiz do live podem ser habilitados automaticamente usando a palavra-chave `filesystem`. Todos os hooks em `/minios/config-hooks/` no meio live podem ser habilitados automaticamente com a palavra-chave `medium`. Se vários mecanismos forem combinados, os hooks do filesystem são executados primeiro, depois os do medium e, por último, os da rede.

## Parâmetros de Boot (atalhos)

Para alguns casos de uso comuns, onde seria necessário combinar vários parâmetros individuais, o **live-config** fornece atalhos. Isso permite ter controle total sobre todas as opções, mantendo a simplicidade.

- **live-config.noroot | noroot**: Desabilita sudo e policykit, o usuário não pode obter privilégios de root no sistema.
- **live-config.noautologin | noautologin**: Desabilita tanto o login automático no console quanto o login automático gráfico.
- **live-config.nottyautologin | nottyautologin**: Desabilita o login automático no console, sem afetar o login automático gráfico.
- **live-config.nox11autologin | nox11autologin**: Desabilita o login automático com qualquer gerenciador de exibição, sem afetar o autologin no tty.

## Parâmetros de Boot (opções especiais)

Para casos de uso especiais, existem alguns parâmetros de boot específicos.

- **live-config.debug | debug**: Ativa a saída de depuração no live-config.

## Arquivos de Configuração

O **live-config** pode ser configurado (mas não ativado) por meio de arquivos de configuração. Tudo, exceto os atalhos que podem ser definidos por um parâmetro de boot, também pode ser configurado alternativamente através de um ou mais arquivos. Se arquivos de configuração forem utilizados, o parâmetro `boot=live` ainda é necessário para ativar o **live-config**.

**Nota:** Se arquivos de configuração forem usados, todos os parâmetros de boot devem ser preferencialmente definidos na variável **LIVE_CONFIG_CMDLINE**, ou variáveis individuais podem ser configuradas. Caso variáveis individuais sejam usadas, o usuário deve garantir que todas as variáveis necessárias estejam definidas para criar uma configuração válida.

Os arquivos de configuração podem ser colocados tanto no próprio sistema de arquivos raiz (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`), quanto na mídia live (`minios/config.conf`, `minios/config.conf.d/*.conf`). Se ambos os locais forem usados para uma determinada opção, os arquivos da mídia live têm precedência sobre os do sistema de arquivos raiz.

Embora os arquivos de configuração colocados nos diretórios de configuração não exijam um nome específico, recomenda-se, por questões de consistência, utilizar o padrão `vendor.conf` ou `project.conf` (onde `vendor` ou `project` é substituído pelo nome real, resultando em um nome como `progress-linux.conf`).

O conteúdo dos arquivos de configuração consiste em uma ou mais das seguintes variáveis:

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variável corresponde à linha de comando do bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variável corresponde ao parâmetro `**live-config.hostname**=*HOSTNAME*`. O padrão é `minios`.
- **LIVE_USERNAME=USERNAME**: Esta variável corresponde ao parâmetro `**live-config.username**=*USERNAME*`. O padrão é `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variável corresponde ao parâmetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variável corresponde ao parâmetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password**=*PASSWORD*`. Especifica a senha de root em texto simples.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password-crypted**=*PASSWORD*`. Especifica a senha de root criptografada.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password**=*PASSWORD*`. Especifica a senha do usuário em texto simples.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password-crypted**=*PASSWORD*`. Especifica a senha do usuário criptografada.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Esta variável corresponde ao parâmetro `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Esta variável corresponde ao parâmetro `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Esta variável corresponde ao parâmetro `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Esta variável corresponde ao parâmetro `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Esta variável corresponde ao parâmetro `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Esta variável corresponde ao parâmetro `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Esta variável corresponde ao parâmetro `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Esta variável corresponde ao parâmetro `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Esta variável corresponde ao parâmetro `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Esta variável corresponde ao parâmetro `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Esta variável corresponde ao parâmetro `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Esta variável corresponde ao parâmetro `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Esta variável corresponde ao parâmetro `**live-config.link-user-dirs**=true|false`. Ela vincula os diretórios padrão de dados do usuário ao drive MiniOS gravável. Não pode ser combinada com o modo bind ou qualquer modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Esta variável corresponde ao parâmetro `**live-config.bind-user-dirs**=true|false`. Ela faz o bind-mount dos diretórios padrão de dados do usuário a partir do drive MiniOS gravável. Não pode ser combinada com o modo link ou qualquer modo `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Esta variável corresponde ao parâmetro `**live-config.user-dirs-path**=*PATH*`. Especifica um caminho seguro dentro do drive MiniOS em FAT32, exFAT ou NTFS. O padrão é `/minios/userdata`; segmentos de ponto e diretório-pai são rejeitados.

A configuração de mídia do usuário nunca mescla automaticamente dois diretórios não vazios. Um diretório local não vazio é migrado apenas quando o destino na mídia está vazio. Quando o recurso é desativado, os dados gerenciados da mídia são copiados de volta antes que os links sejam removidos. Uma validação ou cópia com falha mantém os diretórios de usuário existentes e registra o motivo em `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Esta variável armazena o estado especificado pelo parâmetro `live-config.module-mode` (ou `module-mode`). Quando definida como "merged", o sistema live aplica atualizações (via minios-update-users, minios-update-cache e minios-update-dpkg) para mesclar configurações personalizadas ao ambiente base.
- **LIVE_CONFIG_DEBUG=true|false**: Esta variável corresponde ao parâmetro `**live-config.debug**`.

# CUSTOMIZAÇÃO

**live-config** pode ser facilmente customizado para projetos derivados ou uso local.

## Adicionando novos componentes de configuração

Projetos derivados podem colocar seus componentes em /usr/lib/live/config e não precisam fazer mais nada, pois os componentes serão chamados automaticamente durante o boot.

O ideal é empacotar os componentes em um pacote debian próprio. Um pacote de exemplo contendo um componente de exemplo pode ser encontrado em /usr/share/doc/live-config/examples.

## Removendo componentes de configuração existentes

Ainda não é possível remover componentes de forma adequada sem exigir o envio de um pacote **live-config** modificado localmente ou o uso do dpkg-divert. No entanto, é possível obter o mesmo resultado desabilitando os respectivos componentes através do mecanismo live-config.nocomponents, conforme explicado acima. Para evitar a necessidade de sempre especificar componentes desabilitados via parâmetro de boot, recomenda-se utilizar um arquivo de configuração, conforme explicado acima.

Os arquivos de configuração do próprio sistema live devem, preferencialmente, ser empacotados em um pacote debian próprio. Um pacote de exemplo contendo uma configuração de exemplo pode ser encontrado em /usr/share/doc/live-config/examples.

# COMPONENTES

**live-config** atualmente oferece os seguintes componentes em /usr/lib/live/config.

- **nss-systemd**: remove ou restaura o módulo NSS do systemd em /etc/nsswitch.conf para contornar um problema conhecido do systemd.
- **debconf**: permite aplicar arquivos de preseed arbitrários colocados na mídia live ou em um servidor http/ftp.
- **hostname**: configura /etc/hostname e /etc/hosts.
- **issue-setup**: configura o arquivo /etc/issue com uma mensagem de boas-vindas e informações da distribuição.
- **live-debconfig (passwd)**: configura as senhas de usuário e root via live-debconfig.
- **user-setup**: adiciona uma conta de usuário live.
- **root-setup**: define ou atualiza a senha do root e configura o ambiente do usuário root.
- **sudo**: concede privilégios de sudo ao usuário live.
- **user-media**: configura montagem de mídias e criação de links ou bind de diretórios de usuário para dados persistentes.
- **user-ssh-keys**: sincroniza chaves SSH dos arquivos `authorized_keys.<username>` específicos do usuário na mídia live para os diretórios home de cada usuário. Suporta múltiplos usuários simultaneamente (ex.: `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales**: configura os locales.
- **tzdata**: configura /etc/timezone.
- **xorg-service**: configura o nome de usuário no xorg.service.
- **gdm3**: configura o autologin no gdm3.
- **kdm**: configura o autologin no kdm.
- **lightdm**: configura o autologin no lightdm.
- **lxdm**: configura o autologin no lxdm.
- **nodm**: configura o autologin no nodm.
- **slim**: configura o autologin no slim.
- **xinit**: configura o autologin com xinit.
- **keyboard-configuration**: configura o teclado.
- **sysvinit**: configura o sysvinit.
- **sysv-rc**: configura o sysv-rc desabilitando os serviços listados.
- **login**: desabilita o lastlog.
- **anacron**: desabilita o anacron.
- **util-linux**: desabilita o hwclock do util-linux.
- **apport**: desabilita o apport.
- **gnome-panel-data**: desabilita o botão de bloqueio da tela.
- **gnome-power-manager**: desabilita a hibernação.
- **gnome-screensaver**: desabilita o bloqueio de tela do protetor de tela.
- **kaboom**: desabilita o assistente de migração do KDE (squeeze e versões mais recentes).
- **kde-services**: desabilita alguns serviços indesejados do KDE (squeeze e versões mais recentes).
- **policykit**: concede privilégios ao usuário via policykit.
- **ssl-cert**: regenera certificados snake-oil ssl.
- **xrdp**: configura o xrdp para conectividade de área de trabalho remota.
- **xfce4-panel**: configura o xfce4-panel para as configurações padrão.
- **xscreensaver**: desabilita o bloqueio de tela do xscreensaver.
- **broadcom-sta**: configura drivers WLAN broadcom-sta.
- **xserver-xorg**: configura o xserver-xorg.
- **openssh-server**: recria as chaves de host do openssh-server.
- **hyperv**: configura ajustes do X11 para melhorar a compatibilidade em plataformas Microsoft Hyper-V.
- **ntfs3**: gerencia regras do udev para suporte ao NTFS3.
- **config-module-mode**: configura o modo de módulo do sistema e atualiza caches, configurações de usuário e dpkg.
- **hooks**: permite executar comandos arbitrários a partir de um arquivo colocado na mídia live ou em um servidor http/ftp.

# ARQUIVOS

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `minios/config.conf`
- `minios/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/minios/config-hooks/*`
- `minios/config-hooks/*`
- `/minios/config-preseed/*`
- `minios/config-preseed/*`

# VEJA TAMBÉM

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PÁGINA OFICIAL

Mais informações sobre o **minios-live-config** e o projeto MiniOS podem ser encontradas em [minios.dev](https://minios.dev) e no [repositório do GitHub](https://github.com/minios-linux/minios-live).

# BUGS

Relate bugs abrindo uma issue no repositório do GitHub em [MiniOS Issues](https://github.com/minios-linux/minios-live/issues).

# AUTOR

**live-config** foi originalmente escrito por Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Desde 2016, o desenvolvimento foi continuado pela equipe do Debian Live. Desde 2025, o desenvolvimento da versão modificada **minios-live-config** é mantido pela equipe MiniOS Live.
