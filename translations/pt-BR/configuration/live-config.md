# LIVE-CONFIG

**live-config** - Componentes de Configuração do Sistema

**live-config** contém os componentes que configuram um sistema live durante o processo de boot (late userspace).

O boot em rede no initramfs (`ip=`, PXE, `from=http://…`) é uma camada separada do LiveKit e **não** é gerenciada pelo live-config. Veja [Boot em rede](/installation/Network-Boot.md).

O **live-config** pode ser configurado por meio de parâmetros de boot ou arquivos de configuração em tempo de execução preparados pelo initramfs. A linha de comando real do kernel é anexada após os valores fornecidos pelo arquivo `LIVE_CONFIG_CMDLINE`, então parâmetros de boot posteriores têm precedência. Ao usar persistência, os componentes do **live-config** normalmente são executados apenas uma vez.

Se o *live-build*(7) for utilizado para construir o sistema live, os parâmetros do live-config usados por padrão podem ser definidos pela opção `--bootappend-live`; consulte a página de manual *lb_config*(1).

## Parâmetros de Boot (componentes)

**live-config** só é ativado se `boot=live` for utilizado como parâmetro de boot. Além disso, é necessário informar ao **live-config** quais componentes executar através do parâmetro `live-config.components` ou quais componentes não executar através do parâmetro `live-config.nocomponents`. Se ambos `live-config.components` e `live-config.nocomponents` forem utilizados, ou se qualquer um deles for especificado múltiplas vezes, sempre o último terá prioridade sobre os anteriores.

- **live-config.components | components**: Todos os componentes são executados. Este é o comportamento padrão das imagens live.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Apenas os componentes especificados serão executados. Note que a ordem é importante, por exemplo, `live-config.components=sudo,user-setup` não funcionaria, pois o usuário precisa ser adicionado antes de ser configurado para o sudo. Verifique os nomes dos arquivos dos componentes em `/usr/lib/live/config` para saber o número de ordenação.
- **live-config.nocomponents | nocomponents**: Nenhum componente é executado. Isso equivale a não usar nenhum dos parâmetros `live-config.components` ou `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Todos os componentes são executados, exceto os especificados.

## Parâmetros de Boot (opções)

Alguns componentes individuais podem alterar seu comportamento conforme um parâmetro de boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Busca e aplica um ou mais arquivos de preseed do debconf. URLs são processadas por `wget` e podem usar HTTP, FTP ou `file://`. A palavra-chave `filesystem` expande arquivos em `/usr/lib/live/config-preseed/`; `medium` expande arquivos em `minios/config-preseed/` no meio live detectado. Arquivos locais explícitos podem usar caminhos como `file:///run/initramfs/memory/data/minios/config-preseed/FILE` ou `file:///PATH` na raiz do live. Entradas separadas por pipe são processadas na ordem especificada; arquivos expandidos por palavra-chave usam a ordem do glob do shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Permite definir o hostname do sistema. O padrão é `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Permite definir o nome de usuário que será criado para autologin. O padrão é `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Permite definir os grupos padrão dos usuários criados para autologin. O padrão é `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Permite definir o nome completo dos usuários criados para autologin. No MiniOS, o padrão é `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Permite definir a senha do root em texto simples.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Permite definir a senha do root em formato criptografado.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Permite definir a senha do usuário em texto simples.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Permite definir a senha do usuário em formato criptografado.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Permite definir o locale do sistema, por exemplo, `de_CH.UTF-8`. O padrão é `en_US.UTF-8`. Caso o locale selecionado não esteja disponível no sistema, ele será gerado automaticamente.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Permite definir o fuso horário do sistema, por exemplo, `Europe/Zurich`. O padrão é `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Permite alterar o modelo do teclado. Não há valor padrão definido.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Permite alterar os layouts de teclado. Se mais de um for especificado, as ferramentas do ambiente gráfico permitirão alternar entre eles no X11. Não há valor padrão definido.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Permite alterar as variantes de teclado. Se mais de uma for especificada, deve-se informar o mesmo número de valores que em keyboard-layouts, pois serão pareados um a um na ordem especificada. Valores em branco são permitidos. As ferramentas do ambiente gráfico permitirão alternar entre cada par de layout e variante no X11. Não há valor padrão definido.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Permite alterar as opções do teclado. Não há valor padrão definido.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Permite desabilitar serviços sysv via update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Permite definir se o sistema assume que o relógio de hardware está ajustado para UTC ou não. O padrão é `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Permite definir o x-session-manager via update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Permite definir o driver xorg em vez de autodetectar. Se um ID PCI for especificado em `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dentro do sistema live, o *DRIVER* será forçado para esses dispositivos. Se houver tanto um parâmetro de boot quanto uma sobrescrição, o parâmetro de boot tem precedência.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Permite definir a resolução do xorg em vez de autodetectar, por exemplo, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Permite definir o driver WLAN em vez de autodetectar. Se um ID PCI for especificado em `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dentro do sistema live, o *DRIVER* será forçado para esses dispositivos. Se houver tanto um parâmetro de boot quanto uma sobrescrição, o parâmetro de boot tem precedência.
- **live-config.module-mode=MODE | module-mode=MODE**: Permite especificar o modo de módulo para configuração live. Quando definido como "merged", o sistema atualizará contas de usuário, reconstruirá caches e atualizará configurações de pacotes para que as alterações de configuração sejam integradas dinamicamente ao sistema em execução.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Busca e executa arquivos arbitrários a partir de um arquivo temporário no sistema live em execução. URLs são processadas por `wget` e podem usar HTTP, FTP ou `file://`; os interpretadores necessários e outras dependências já devem estar instalados. A palavra-chave `filesystem` expande arquivos em `/usr/lib/live/config-hooks/`; `medium` expande arquivos em `minios/config-hooks/` no meio live detectado (com fallback para caminho ISO no componente hook). Arquivos locais explícitos podem usar `file:///run/initramfs/memory/data/minios/config-hooks/FILE` ou `file:///PATH` na raiz do live. Entradas separadas por pipe são executadas na ordem especificada; arquivos expandidos por palavra-chave usam a ordem do glob do shell. Exemplos são instalados em `/usr/share/doc/live-config/examples/hooks/`.

> **Aviso de segurança:** `live-config` é executado como root. Hooks são tornados executáveis e executados como root, e preseeds alteram o banco de dados debconf do sistema com privilégios de root. HTTP e FTP simples não autenticam o conteúdo baixado e não oferecem proteção de integridade. Prefira arquivos locais revisados ou transporte autenticado confiável com verificação de integridade independente; não use hooks ou preseeds remotos de redes não confiáveis.

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

O **live-config** pode ser configurado (mas não ativado) por meio de arquivos de configuração. Tudo, exceto os atalhos que podem ser configurados com um parâmetro de boot, também pode ser configurado alternativamente por meio de um ou mais arquivos. Se arquivos de configuração forem usados, o parâmetro `boot=live` ainda é necessário para ativar o **live-config**.

**Nota:** Se arquivos de configuração forem utilizados, todos os parâmetros de boot devem ser inseridos (preferencialmente) na variável **LIVE_CONFIG_CMDLINE**, ou variáveis individuais podem ser definidas. Caso variáveis individuais sejam usadas, o usuário deve garantir que todas as variáveis necessárias estejam definidas para criar uma configuração válida.

O próprio `live-config` faz o source de `/etc/live/config.conf` e depois `/etc/live/config.conf.d/*.conf` na ordem do glob do shell. Fragmentos posteriores podem, portanto, substituir valores do arquivo principal ou de fragmentos anteriores. Não faz o source separadamente de uma segunda camada de configuração de mídia.

Na mídia do MiniOS, os arquivos de origem são `minios/config.conf` e `minios/config.conf.d/*.conf`. Antes de `live-config` iniciar, o initramfs do MiniOS sincroniza esses arquivos com os arquivos de runtime `/etc/live/` de acordo com o horário de modificação. Um arquivo de origem mais recente substitui seu correspondente de runtime; um arquivo de runtime mais recente só é copiado de volta se o diretório de dados selecionado do MiniOS for gravável. Timestamps iguais não geram cópia, arquivos ausentes são preenchidos e arquivos não são excluídos. Essa sincronização ocorre no boot, não é monitoramento contínuo. Veja [Arquivo de configuração](/configuration/Configuration-File.md) para as regras completas de sincronização e precedência da linha de comando.

Como fallback para implementações de initramfs que não prepararam o arquivo de runtime, os wrappers de inicialização do systemd e SysV copiam `minios/config.conf` da mídia detectada apenas quando `/etc/live/config.conf` está ausente. Esse fallback não copia fragmentos `config.conf.d`. O initramfs padrão atual do MiniOS LiveKit realiza a sincronização anterior.

Os arquivos de fragmento devem corresponder a `*.conf`. Nomes como `vendor.conf` ou `project.conf` são recomendados; escolha nomes lexicais deliberadamente, pois fragmentos posteriores sobrescrevem os anteriores.

O conteúdo real dos arquivos de configuração consiste em uma ou mais das seguintes variáveis:

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Esta variável corresponde à linha de comando do bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Esta variável corresponde ao parâmetro `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Esta variável corresponde ao parâmetro `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Esta variável corresponde ao parâmetro `**live-config.hostname**=*HOSTNAME*`. O padrão é `minios`.
- **LIVE_USERNAME=USERNAME**: Esta variável corresponde ao parâmetro `**live-config.username**=*USERNAME*`. O padrão é `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Esta variável corresponde ao parâmetro `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Esta variável corresponde ao parâmetro `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password**=*PASSWORD*`. Especifica a senha root em texto simples.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.root-password-crypted**=*PASSWORD*`. Especifica a senha root em formato criptografado.
- **LIVE_USER_PASSWORD=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password**=*PASSWORD*`. Especifica a senha do usuário em texto simples.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Esta variável corresponde ao parâmetro `**live-config.user-password-crypted**=*PASSWORD*`. Especifica a senha do usuário em formato criptografado.
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
- **LIVE_LINK_USER_DIRS=true|false**: Esta variável corresponde ao parâmetro `**live-config.link-user-dirs**=true|false`. Ela vincula os diretórios padrão de dados do usuário à unidade MiniOS gravável. Não pode ser combinada com o modo bind ou qualquer modo `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Esta variável corresponde ao parâmetro `**live-config.bind-user-dirs**=true|false`. Ela faz o bind-mount dos diretórios padrão de dados do usuário a partir da unidade MiniOS gravável. Não pode ser combinada com o modo link ou qualquer modo `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Esta variável corresponde ao parâmetro `**live-config.user-dirs-path**=*PATH*`. Especifica um caminho seguro dentro da unidade MiniOS FAT32, exFAT ou NTFS. O padrão é `/minios/userdata`; segmentos de ponto e de diretório pai são rejeitados.

A configuração de mídia do usuário nunca mescla automaticamente dois diretórios não vazios. Um diretório local não vazio só é migrado quando o destino na mídia está vazio. Quando o recurso é desativado, os dados gerenciados na mídia são copiados de volta antes que os links sejam removidos. Uma validação ou cópia com falha mantém os diretórios de usuário existentes e registra o motivo em `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Esta variável armazena o estado especificado pelo parâmetro `live-config.module-mode` (ou `module-mode`). Quando definida como "merged", o sistema live aplica atualizações (via minios-update-users, minios-update-cache e minios-update-dpkg) para mesclar configurações personalizadas com o ambiente base.
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

- `minios/config.conf` no meio de dados MiniOS selecionado (cópia de origem)
- `minios/config.conf.d/*.conf` no meio de dados MiniOS selecionado (fragmentos de origem)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` em mídias de dados selecionadas graváveis quando a exportação de logs está habilitada
- `/usr/lib/live/config-hooks/*` (hooks `filesystem`)
- `minios/config-hooks/*` no meio live detectado (hooks `medium`)
- `/usr/lib/live/config-preseed/*` (preseeds `filesystem`)
- `minios/config-preseed/*` no meio live detectado (preseeds `medium`)

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
