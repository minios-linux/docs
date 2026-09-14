---
updated: 2026-09-13
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

A coluna Aplicação diferencia os parâmetros normalmente aceitos em todo boot das configurações de conta destinadas à configuração inicial. Com persistência, os componentes do live-config normalmente são executados apenas uma vez; veja [live-config](/reference/configuration/live-config).

Esta tabela é uma referência rápida. A precedência das fontes e os `from=` formatos aceitos são definidos em [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery), filtragem de módulos em [Carregamento de módulo Initrd](/reference/boot-process/Module-Loading), seleção de persistência em [Persistência Initrd](/reference/boot-process/Persistence-Internals), e combinações suportadas em [Modos de boot](/using-minios/Boot-Modes).

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `from` | Todo boot | Carrega dados MiniOS de um diretório, caminho de dispositivo suportado ou ISO. Formatos de dispositivo UUID, PARTUUID e by-id não são analisados. Um **`http://` literal apenas** URL tem precedência sobre `ip=` e inicia o [boot pela rede](/reference/boot-process/Network-Boot) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Todo boot | Mantém os candidatos `.sb` cujo caminho corresponde a uma expressão regular estendida não ancorada; vírgulas viram alternância, e um intervalo numérico ascendente inteiro tem expansão especial. Também filtra `toram=trim`. Pode excluir módulos principais ou do kernel e tornar o sistema ininicializável. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Todo boot | Exclui candidatos cujo caminho corresponde a uma expressão regular estendida não ancorada, inclusive de `toram=trim`; é aplicado após `load` e pode excluir módulos principais ou do kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Todo boot | Define a extensão do bundle. Padrão: `sb`. A coordenação com o kernel ainda usa nomes `.sb` literais, então uma extensão personalizada não pode coordenar o módulo `01-kernel`. | `bext=mymod` |
| `timing` | Todo boot | Ativa a saída de tempo de inicialização. | `timing` |
| `union` | A cada inicialização | Seleciona o sistema de arquivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | A cada inicialização | Endereço estático para busca antecipada de rede. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE padrão **7529**). Um `from=http://...` literal tem prioridade sobre `ip=` e usa seus campos de endereçamento; caso contrário, qualquer `ip=` não vazio força o download dos dados PXE e ignora a mídia local. Isso não é uma configuração de sessão do NetworkManager. Veja [Boot pela rede](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | A cada inicialização | Tamanho do cache httpfs em MiB para boot de rede HTTP ISO (`from=http://…`). Veja [Boot pela rede](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | A cada inicialização | Abre um shell de depuração ao final da etapa initramfs. | `rd.break` |
| `perchdir` | A cada inicialização | Seleciona uma sessão de persistência numerada ou uma ação: `resume`, `new`, ou `ask`. Um seletor numérico inexistente pode usar o padrão do metadado; não reserva nem cria esse número. Um dispositivo/caminho ou `askdisk` forma seleciona outro local de persistência. Use um sufixo delimitado por dois-pontos para um caminho personalizado. Sem parâmetro de persistência, MiniOS inicia limpo. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | A cada inicialização | Tamanho do contêiner para `dynfilefs`, `dynblk`, `raw`, e `luks`; não se aplica a `native` ou `squashfs`. Um número simples ou valor `M`/`MB` é alocado em MiB; `G`/`GB` e `T`/`TB` são convertidos para 1000 e 1.000.000 MiB. Dynblk usa um padrão fino de 16 GiB e tem um limite virtual de 512 GiB; seu espaço físico cresce sob demanda. Outros pedidos de contêiner são limitados a 1.000.000 MiB e pelo espaço disponível após `perchreserve`. Gerenciador de sessões MiniOS limita arquivos raw e LUKS a 4000 MiB em FAT32; initrd LUKS aplica esse limite, mas um pedido raw initrd acima do limite pode falhar em vez de ser reduzido. Novos contêineres raw e LUKS têm padrão de 4000 MiB. DynFileFS criado pelo initramfs usa por padrão a capacidade disponível arredondada para baixo em 1000 MiB; Gerenciador de sessões MiniOS define o padrão como 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | A cada inicialização | Margem de alocação e limite de aviso de pouco espaço em MiB. Esse valor é subtraído ao dimensionar novos contêineres ou ao expandi-los, mas não é uma cota de tempo de execução e não impede que gravações futuras preencham o dispositivo. Padrão: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | A cada inicialização | Modo de armazenamento persistente.<br>`native` (padrão): um diretório em um sistema de arquivos POSIX gravável.<br>`dynfilefs`: contêiner expansível format-400 baseado em FUSE, inclusive em FAT32, NTFS ou exFAT.<br>`dynblk`: um dispositivo de bloco format-1 separado do kernel, suportado por thin `volumeNNN.db` arquivos; o número real `/dev/dynblkN` é alocado dinamicamente e vários volumes podem coexistir.<br>`raw`: uma imagem ext4 de tamanho fixo.<br>`luks`: um contêiner ext4 criptografado com LUKS2; criação e desbloqueio solicitados no console e requer suporte a criptografia no initramfs.<br>`squashfs`: um snapshot compactado existente descompactado para a sessão. Gerenciador de sessões MiniOS pode criar e salvar snapshots SquashFS do sistema em execução; o initramfs pode retomar, mas não criar esses snapshots. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | A cada inicialização | Ativa o caminho legado de retomada da persistência. Diferente de `perchdir=resume`, não cria automaticamente um substituto compatível quando não existe uma sessão padrão utilizável. | `perch` |
| `toram` | A cada inicialização | Bare `toram` é `full`. Com persistência, a cópia do topo do "full" `*` omite arquivos ocultos; sem persistência, omite `changes` mas copia outras entradas de nível superior, incluindo arquivos ocultos. Trim copia os `config.conf` necessários, `authorized_keys` módulos de nível superior e recursivos selecionados, e toda a árvore `changes/` quando a persistência é solicitada; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, outros dados que não sejam módulos e o nível separado de módulo de persistência. Nenhum dos modos verifica a capacidade de RAM antes. Um armazenamento de persistência copiado para RAM não é durável e as alterações não são copiadas de volta. Remova a mídia somente após confirmar que a origem, loops e mapeamentos foram desconectados com sucesso. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | A cada inicialização | Inicia em modo console de texto. | `text` |
| `automount` | A cada inicialização | Ativa a montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | A cada inicialização | Ativa diagnósticos adicionais na inicialização. | `debug` |
| `nozram` | A cada inicialização | Desativa o swap zram. | `nozram` |
| `zramsize` | A cada inicialização | Define o tamanho do swap zram em MiB. Se omitido, MiniOS calcula o valor a partir do total de RAM. | `zramsize=512`<br>`zramsize=2048` |
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
| `locales` | A cada inicialização | Define um ou mais locales do sistema. | `locales=en_US.UTF-8` |
| `timezone` | A cada inicialização | Define o fuso horário do sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | A cada inicialização | Define o modelo de teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | A cada inicialização | Define layouts de teclado separados por vírgula. | `keyboard-layouts=us,de` |
| `keyboard-variants` | A cada inicialização | Define variantes de teclado, separadas por vírgula, correspondentes aos layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | A cada inicialização | Define as opções do teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuração inicial | Impede que o live-config conceda privilégios de sudo e policykit. | `noroot` |
| `noautologin` | A cada inicialização | Impede que o live-config configure o login automático no console e no modo gráfico; a configuração persistente existente não é removida. | `noautologin` |
| `nottyautologin` | A cada inicialização | Impede apenas a configuração do login automático no console; a configuração persistente existente não é removida. | `nottyautologin` |
| `nox11autologin` | A cada inicialização | Impede apenas a configuração do login automático gráfico; a configuração persistente existente não é removida. | `nox11autologin` |
| `xorg-driver` | A cada inicialização | Seleciona um driver Xorg em vez da autodetecção. | `xorg-driver=nouveau` |
| `xorg-resolution` | A cada inicialização | Define a resolução do Xorg em vez da autodetecção. | `xorg-resolution=1920x1080` |
| `module-mode` | A cada inicialização | Com `merged`, integra as alterações de configuração ao sistema live em execução. | `module-mode=merged` |
| `hooks` | A cada inicialização | Busca e executa hooks do sistema de arquivos, da mídia live ou de URLs suportados pelo wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerações de segurança

A linha de comando do kernel é em texto simples e normalmente fica visível na configuração do bootloader, `/proc/cmdline`, e em diagnósticos. Não coloque segredos reutilizáveis em `root-password=` ou `user-password=`. Prefira os parâmetros correspondentes de `*-crypted`, tratando ainda assim hashes de senha expostos como informações sensíveis.

Hooks são executados como código privilegiado de boot. Um `http://` hook não possui criptografia de transporte nem autenticação de servidor, então qualquer pessoa capaz de alterar o caminho da rede pode substituí-lo. Use apenas mecanismos de entrega e conteúdo em que confia; não utilize um hook HTTP sem autenticação para inicializações sensíveis à segurança.

Separe os comandos com espaços. Consulte as `man bootparam` páginas de referência para parâmetros adicionais do kernel comuns a todas as distribuições Linux.

Para informações detalhadas sobre os parâmetros do live-config, consulte [live-config](/reference/configuration/live-config).

Para carregar MiniOS pela rede (PXE e ISO via HTTP), veja [Inicialização pela rede](/reference/boot-process/Network-Boot).
