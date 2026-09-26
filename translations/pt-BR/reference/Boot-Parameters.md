---
updated: 2026-09-26
---

# Parâmetros de inicialização

## Como usar parâmetros de boot

Os parâmetros de boot personalizam como o MiniOS é iniciado. Separe os parâmetros com espaços na linha de comando do kernel.

### Syslinux

- Pressione <kbd>Esc</kbd> durante a sequência de boot MiniOS para acessar o menu de boot.
- Pressione <kbd>Tab</kbd> para editar as opções de boot.
- Digite os parâmetros e pressione <kbd>Enter</kbd> para iniciar.

### GRUB

- Pressione <kbd>E</kbd> no menu do GRUB.
- Edite os parâmetros de inicialização ao final da linha de comando.
- Pressione <kbd>F10</kbd> para inicializar com as novas configurações.

## Parâmetros de boot

A coluna Aplicação diferencia parâmetros normalmente aceitos em todo boot das configurações de conta destinadas à configuração inicial. Com persistência, componentes do live-config normalmente são executados apenas uma vez; veja [live-config](/reference/configuration/live-config).

Esta tabela serve como referência rápida. A precedência das fontes e os `from=` formatos aceitos estão definidos em [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery), filtragem de módulos em [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading), seleção de persistência em [Persistência Initrd](/reference/boot-process/Persistence-Internals), e combinações suportadas em [Modos de boot](/using-minios/Boot-Modes).

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `from` | Todo boot | Carrega dados MiniOS de um diretório, caminho de dispositivo compatível ou ISO. Formatos UUID, PARTUUID e dispositivos by-id não são analisados. Um **`http://` literal apenas** tem precedência sobre `ip=` e inicia o [boot pela rede](/reference/boot-process/Network-Boot) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Todo boot | Mantém os candidatos `.sb` cujo caminho corresponde a uma expressão regular estendida não ancorada; vírgulas viram alternância e um intervalo numérico inteiro crescente tem expansão especial. Também filtra `toram=trim`. Pode excluir módulos essenciais ou do kernel e tornar o sistema não inicializável. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Todo boot | Exclui candidatos cujo caminho corresponde a uma expressão regular estendida não ancorada, inclusive de `toram=trim`; é aplicado após `load` e pode excluir módulos essenciais ou do kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Todo boot | Define a extensão do bundle. Padrão: `sb`. A coordenação com o kernel ainda usa nomes `.sb` literais, então uma extensão personalizada não pode coordenar o módulo `01-kernel`. | `bext=mymod` |
| `timing` | Todo boot | Ativa a saída de tempo de inicialização. | `timing` |
| `union` | A cada inicialização | Seleciona o sistema de arquivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | A cada inicialização | Endereço estático para busca de rede antecipada. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta padrão HTTP PXE **7529**). Um valor literal `from=http://...` tem prioridade sobre `ip=` e usa seus campos de endereçamento; caso contrário, qualquer valor não vazio de `ip=` força o download de dados PXE e ignora a mídia local. Isso não é uma configuração de sessão do NetworkManager. Veja [Inicialização pela rede](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | A cada inicialização | Tamanho do cache httpfs em MiB para inicialização de rede HTTP ISO (`from=http://…`). Veja [Inicialização pela rede](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | A cada inicialização | Abre um shell de depuração ao final da etapa initramfs. | `rd.break` |
| `perchdir` | A cada inicialização | Seleciona uma sessão de persistência numerada ou uma ação: `resume`, `new`, ou `ask`. Um seletor numérico inexistente pode recorrer ao valor padrão dos metadados; não reserva nem cria esse número. Um dispositivo/caminho ou `askdisk` seleciona outro local de persistência. Use um sufixo separado por dois-pontos para um caminho personalizado. Sem um parâmetro de persistência, MiniOS inicia limpo. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | A cada inicialização | Tamanho lógico do contêiner para `dynfilefs`, `dynblk`, `vmdk`, e `raw`; não se aplica a `native` ou `squashfs`. Um número simples ou `M`/`MB` é alocado em MiB; `G`/`GB` e `T`/`TB` são convertidos para 1000 e 1.000.000 MiB. Sem um tamanho explícito, sessões criadas pelo initrd DynFileFS, DynBlk e VMDK usam até 16 GiB e reduzem esse padrão quando resta menos espaço disponível após `perchreserve`; DynFileFS também considera a sobrecarga do índice e o limite RAM. DynBlk consulta o limite do backend instalado usando `dynblk limits --format dynblk` (ou `--format vmdk` para VMDK); não há limite separado de 512 GiB. O payload DynFileFS e os dados de suporte DynBlk crescem sob demanda, enquanto DynFileFS também reserva índices para a capacidade lógica declarada. Requisições Raw são limitadas a 1.000.000 MiB e pelo espaço disponível após `perchreserve`; Raw é limitado a 4000 MiB em FAT32, criptografado ou não. Novos contêineres raw têm padrão de 4000 MiB. O Gerenciador de sessões MiniOS ainda define contêineres DynFileFS criados manualmente para 4000 MiB e DynBlk/VMDK para 16 GiB. Veja [Persistência initrd](/reference/boot-process/Persistence-Internals) para comportamento de memória e armazenamento do backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | A cada inicialização | Margem de alocação e limite de aviso de pouco espaço em MiB. Esse valor é subtraído ao dimensionar contêineres novos ou em crescimento, mas não é uma cota em tempo de execução e não impede que gravações posteriores preencham o dispositivo. Padrão: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | A cada inicialização | Modo de armazenamento persistente.<br>`native` (padrão): um diretório em um sistema de arquivos POSIX gravável.<br>`dynfilefs`: contêiner expansível baseado em FUSE no formato 400, inclusive em FAT32, NTFS ou exFAT.<br>`dynblk`: um dispositivo de bloco de kernel separado no formato 1, baseado em thin `volumeNNN.db` arquivos; o número real de `/dev/dynblkN` é alocado dinamicamente e vários volumes podem coexistir.<br>`vmdk`: arquivos padrão divididos e esparsos `volume.vmdk` / `volume-sNNN.vmdk` arquivos expostos pelo driver DynBlk; sem compactação. Requer a capacidade versionada de `vmdk-session-v1` initrd.<br>`raw`: uma imagem ext4 de tamanho fixo.<br>`squashfs`: um snapshot compactado descompactado em uma camada superior baseada em RAM. A configuração do initrd cria apenas os metadados da geração zero; o sistema em execução cria o primeiro snapshot sob demanda ou no desligamento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Somente na criação | Camada opcional de criptografia para uma nova `raw`, `dynfilefs`, `dynblk`, ou `vmdk` sessão. `perchencrypt=luks` requer a capacidade versionada de `luks-layer-v1` initramfs. Sessões existentes derivam a criptografia apenas de `session_encryption[N]`, portanto este parâmetro não reinterpreta nem converte essas sessões. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Somente na criação | Seleciona a compactação de backend DynBlk para uma nova sessão DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`. O codec do kernel selecionado deve estar disponível. Quando `perchencrypt=luks` envolve DynBlk, MiniOS força a compactação DynBlk para `none`. VMDK não possui compactação: a inicialização ignora um codec não-`none` com um aviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | A cada inicialização | Ativa o caminho legado de retomada da persistência. Diferente de `perchdir=resume`, não cria automaticamente um substituto compatível quando não existe uma sessão padrão utilizável. | `perch` |
| `toram` | A cada inicialização | Bare `toram` é `full`. Com persistência, a cópia de nível superior do full `*` omite arquivos ocultos; sem persistência, omite `changes` mas copia outras entradas de nível superior, incluindo arquivos ocultos. Trim copia os arquivos necessários `config.conf`, arquivo regular `authorized_keys`, módulos selecionados de nível superior e recursivos, e toda a árvore `changes/` quando a persistência é solicitada; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, outros dados que não sejam módulos e o nível separado de módulo de persistência. Nenhum modo verifica a capacidade de RAM antes. Um armazenamento de persistência copiado para RAM não é durável e as alterações não são copiadas de volta. Remova a mídia somente após confirmar que a origem, loops e mapeamentos foram desconectados com sucesso. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | A cada inicialização | Inicia no modo console de texto. | `text` |
| `automount` | A cada inicialização | Ativa a montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | A cada inicialização | Ativa diagnósticos adicionais na inicialização. | `debug` |
| `nozram` | A cada inicialização | Desativa o swap zram. | `nozram` |
| `zramsize` | A cada inicialização | Define o tamanho do swap zram em MiB. Se omitido, MiniOS calcula a partir do total de RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | A cada inicialização | Seleciona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, ou `zstd`; a disponibilidade depende do kernel em execução. Se omitido, o padrão do kernel é mantido. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | A cada inicialização | Define o target padrão do systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | A cada inicialização | Ativa os serviços systemd especificados na inicialização. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | A cada inicialização | Desativa os serviços systemd especificados na inicialização. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | A cada inicialização | Desativa alterações automáticas de resolução de tela em máquinas virtuais. O padrão do XFCE é 1280x800. | `novirtres` |
| `virtres` | A cada inicialização | Define a resolução de tela do XFCE em máquinas virtuais. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | A cada inicialização | Executa apenas os componentes live-config listados, na ordem dos componentes. | `components=hostname,user-setup,sudo` |
| `nocomponents` | A cada inicialização | Executa todos os componentes live-config, exceto os listados. | `nocomponents=anacron,apport` |
| `hostname` | A cada inicialização | Define o nome do host do sistema. | `hostname=minios` |
| `username` | Configuração inicial | Define o nome de usuário criado para login automático. | `username=live` |
| `user-default-groups` | Configuração inicial | Define os grupos padrão do usuário criado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuração inicial | Define o nome completo do usuário criado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuração inicial | Define a senha do root em texto simples. | `root-password=toor` |
| `root-password-crypted` | Configuração inicial | Define a senha do root como um hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuração inicial | Define a senha do usuário em texto simples. | `user-password=live` |
| `user-password-crypted` | Configuração inicial | Define a senha do usuário como um hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | A cada inicialização | Define um ou mais locais do sistema. | `locales=en_US.UTF-8` |
| `timezone` | A cada inicialização | Define o fuso horário do sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | A cada inicialização | Define o modelo do teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | A cada inicialização | Define layouts de teclado separados por vírgula. | `keyboard-layouts=us,de` |
| `keyboard-variants` | A cada inicialização | Define variantes de teclado, separadas por vírgula, correspondentes aos layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | A cada inicialização | Define as opções do teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuração inicial | Impede que o live-config conceda privilégios de sudo e policykit. | `noroot` |
| `noautologin` | A cada inicialização | Impede que o live-config configure login automático no console e no modo gráfico; a configuração persistente existente não é removida. | `noautologin` |
| `nottyautologin` | A cada inicialização | Impede apenas a configuração de login automático no console; a configuração persistente existente não é removida. | `nottyautologin` |
| `nox11autologin` | A cada inicialização | Impede apenas a configuração de login automático no modo gráfico; a configuração persistente existente não é removida. | `nox11autologin` |
| `xorg-driver` | A cada inicialização | Seleciona um driver Xorg em vez de autodetecção. | `xorg-driver=nouveau` |
| `xorg-resolution` | A cada inicialização | Define a resolução do Xorg em vez de autodetecção. | `xorg-resolution=1920x1080` |
| `module-mode` | A cada inicialização | Com `merged`, integra as alterações de configuração ao sistema live em execução. | `module-mode=merged` |
| `link-user-dirs` | A cada inicialização | Vincula os diretórios de usuário gerenciados à mídia gravável MiniOS. É mutuamente exclusivo com `bind-user-dirs` e indisponível com qualquer `toram` modo ou enquanto a sessão de persistência ativa estiver criptografada com LUKS. A criptografia ativa é determinada pela sessão em execução, não pela `perchencrypt` solicitação de criação. | `link-user-dirs` |
| `bind-user-dirs` | A cada inicialização | Realiza bind-mount dos diretórios de usuário gerenciados a partir da mídia gravável MiniOS. Possui as mesmas `toram` e restrições de criptografia de sessão ativa que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | A cada inicialização | Define a localização relativa à mídia usada por `link-user-dirs` ou `bind-user-dirs`. Padrão: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | A cada inicialização | Busca e executa hooks do sistema de arquivos, mídia live ou URLs suportadas pelo wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerações de segurança

A linha de comando do kernel é em texto simples e normalmente fica visível na configuração do bootloader, `/proc/cmdline`, e em diagnósticos. Não coloque segredos reutilizáveis em `root-password=` ou `user-password=`. Prefira os parâmetros correspondentes de `*-crypted`, tratando ainda assim hashes de senha expostos como informações sensíveis.

Hooks são executados como código privilegiado de boot. Um `http://` hook não possui criptografia de transporte nem autenticação de servidor, então qualquer pessoa capaz de alterar o caminho da rede pode substituí-lo. Use apenas mecanismos de entrega e conteúdo em que confia; não utilize um hook HTTP sem autenticação para inicializações sensíveis à segurança.

Separe os comandos com espaços. Consulte as `man bootparam` páginas de referência para parâmetros adicionais do kernel comuns a todas as distribuições Linux.

Para informações detalhadas sobre os parâmetros do live-config, consulte [live-config](/reference/configuration/live-config).

Para carregar MiniOS pela rede (PXE e ISO via HTTP), veja [Inicialização pela rede](/reference/boot-process/Network-Boot).
