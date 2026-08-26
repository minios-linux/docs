# Parâmetros de boot

## Como usar os parâmetros de boot

Os parâmetros de boot personalizam como o MiniOS é iniciado. Separe os parâmetros com espaços na linha de comando do kernel.

### Syslinux

- Pressione <kbd>Esc</kbd> durante a sequência de boot do MiniOS para acessar o menu de inicialização.
- Pressione <kbd>Tab</kbd> para editar as opções de boot.
- Digite os parâmetros e pressione <kbd>Enter</kbd> para iniciar.

### GRUB

- Pressione <kbd>E</kbd> no menu do GRUB.
- Edite os parâmetros de boot no final da linha de comando.
- Pressione <kbd>F10</kbd> para iniciar com as novas configurações.

## Parâmetros de boot

A coluna "Aplicação" distingue parâmetros normalmente aceitos em todo boot de configurações de conta destinadas à configuração inicial. Com persistência, os componentes do live-config normalmente são executados apenas uma vez; veja [live-config](/configuration/live-config.md).

Esta tabela serve como referência rápida. A precedência das fontes e os formatos aceitos de `from=`
são definidos em [Descoberta do sistema Initrd](/configuration/Initrd-System-Discovery.md),
o filtro de módulos em [Carregamento de módulos Initrd](/configuration/Initrd-Module-Loading.md),
a seleção de persistência em [Persistência Initrd](/configuration/Initrd-Persistence.md)
e as combinações suportadas em [Modos de boot](/configuration/Boot-Modes.md).

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `from` | Todo boot | Carrega dados do MiniOS de um diretório, caminho de dispositivo suportado ou ISO. Formatos UUID, PARTUUID e by-id não são interpretados. Uma URL literal **apenas `http://`** tem prioridade sobre `ip=` e inicia o [boot em rede](/installation/Network-Boot.md) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Todo boot | Mantém candidatos `.sb` cujo caminho corresponde a uma expressão regular estendida não ancorada; vírgulas viram alternância e um intervalo numérico crescente inteiro tem expansão especial. Também filtra `toram=trim`. Pode excluir módulos principais ou do kernel e tornar o sistema não inicializável. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Todo boot | Exclui candidatos cujo caminho corresponde a uma expressão regular estendida não ancorada, incluindo de `toram=trim`; é aplicado após `load` e pode excluir módulos principais ou do kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Todo boot | Define a extensão do bundle. Padrão: `sb`. A coordenação do kernel ainda usa nomes literais `.sb`, portanto uma extensão personalizada não pode coordenar o módulo `01-kernel`. | `bext=mymod` |
| `timing` | Todo boot | Habilita a saída de tempo de inicialização. | `timing` |
| `union` | Todo boot | Seleciona o sistema de arquivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Todo boot | Endereço estático para busca de rede antecipada. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE padrão **7529**). Um `from=http://...` literal tem prioridade sobre `ip=` e usa seus campos de endereço; caso contrário, qualquer `ip=` não vazio força o download dos dados via PXE e ignora a mídia local. Isso não é configuração de sessão do NetworkManager. Veja [Boot em rede](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Todo boot | Tamanho do cache httpfs em MiB para boot de rede HTTP ISO (`from=http://…`). Veja [Boot em rede](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Todo boot | Abre um shell de depuração ao final da etapa do initramfs. | `rd.break` |
| `perchdir` | Todo boot | Seleciona uma sessão de persistência numerada ou uma ação: `resume`, `new` ou `ask`. Um seletor numérico inexistente pode recorrer ao padrão de metadados; não reserva nem cria esse número. Um dispositivo/caminho ou formato `askdisk` seleciona outro local de persistência. Use sufixo delimitado por dois-pontos para um caminho personalizado. Sem parâmetro de persistência, o MiniOS inicia limpo. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Todo boot | Tamanho do container para `dynfilefs`, `raw` e `luks`; não se aplica a `native` ou `squashfs`. Um número simples ou valor `M`/`MB` é alocado em MiB; `G`/`GB` e `T`/`TB` são convertidos para 1000 e 1.000.000 MiB. O limite é 1.000.000 MiB, podendo ser ainda limitado pelo espaço disponível após `perchreserve`. O Session Manager limita arquivos raw e LUKS a 4000 MiB em FAT32; o LUKS do initrd aplica esse limite, mas um pedido raw initrd acima do limite pode falhar em vez de ser reduzido. Novos containers raw e LUKS têm padrão de 4000 MiB. DynFileFS criado pelo initramfs tem padrão de capacidade disponível arredondada para baixo a 1000 MiB; o Session Manager define padrão de 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Todo boot | Espaço livre, em MiB, mantido no dispositivo de persistência. Novos containers ou containers em crescimento não consomem esse espaço, e o MiniOS alerta quando o espaço livre atinge esse valor. Padrão: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Todo boot | Modo de armazenamento de persistência.<br>`native` (padrão): um diretório em um sistema de arquivos POSIX gravável.<br>`dynfilefs`: um container expansível, inclusive em FAT32, NTFS ou exFAT.<br>`raw`: uma imagem ext4 de tamanho fixo.<br>`luks`: um container ext4 criptografado com LUKS2; criação e desbloqueio solicitados no console e exigem suporte a criptografia no initramfs.<br>`squashfs`: um snapshot compactado existente descompactado para a sessão. O Session Manager pode criar e salvar snapshots SquashFS do sistema em execução; o initramfs pode retomar, mas não criar snapshots. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Todo boot | Habilita o caminho legado de retomada de persistência. Diferente de `perchdir=resume`, não cria automaticamente um substituto compatível quando não existe uma sessão padrão utilizável. | `perch` |
| `toram` | Todo boot | `toram` isolado é `full`. Com persistência, a cópia `*` no topo omite arquivos ocultos; sem persistência omite `changes`, mas copia outras entradas de topo, incluindo arquivos ocultos. O modo trim copia `config.conf` obrigatórios, `authorized_keys` do tipo arquivo regular, módulos selecionados de topo e recursivos, e toda a árvore `changes/` quando a persistência é solicitada; omite `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, outros dados não-módulo e o tier separado de módulos de persistência. Nenhum modo verifica a capacidade de RAM antes. Um armazenamento de persistência copiado para RAM não é durável e alterações não são copiadas de volta. Remova a mídia apenas após confirmar que a fonte, loops e mapeamentos foram desmontados com sucesso. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Todo boot | Inicia em modo console de texto. | `text` |
| `automount` | Todo boot | Habilita montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | Todo boot | Habilita diagnósticos adicionais na inicialização. | `debug` |
| `nozram` | Todo boot | Desativa swap zram. | `nozram` |
| `zramsize` | Todo boot | Define o tamanho do swap zram em MiB. Se omitido, o MiniOS calcula a partir do total de RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Todo boot | Seleciona `lzo`, `lzo-rle`, `lz4`, `lz4hc` ou `zstd`; a disponibilidade depende do kernel em execução. Se omitido, mantém o padrão do kernel. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Todo boot | Define o target padrão do systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Todo boot | Habilita serviços systemd especificados no boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Todo boot | Desativa serviços systemd especificados no boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Todo boot | Desativa alterações automáticas de resolução de tela em máquinas virtuais. O padrão do XFCE é 1280x800. | `novirtres` |
| `virtres` | Todo boot | Define a resolução de tela do XFCE em máquinas virtuais. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Todo boot | Executa apenas os componentes live-config listados, na ordem dos componentes. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Todo boot | Executa todos os componentes live-config exceto os listados. | `nocomponents=anacron,apport` |
| `hostname` | Todo boot | Define o hostname do sistema. | `hostname=minios` |
| `username` | Configuração inicial | Define o nome de usuário criado para autologin. | `username=live` |
| `user-default-groups` | Configuração inicial | Define os grupos padrão do usuário criado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuração inicial | Define o nome completo do usuário criado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuração inicial | Define a senha do root em texto simples. | `root-password=toor` |
| `root-password-crypted` | Configuração inicial | Define a senha do root como hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuração inicial | Define a senha do usuário em texto simples. | `user-password=live` |
| `user-password-crypted` | Configuração inicial | Define a senha do usuário como hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Todo boot | Define um ou mais locales do sistema. | `locales=en_US.UTF-8` |
| `timezone` | Todo boot | Define o fuso horário do sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Todo boot | Define o modelo do teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | Todo boot | Define layouts de teclado separados por vírgula. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Todo boot | Define variantes de teclado separadas por vírgula correspondentes aos layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Todo boot | Define opções de teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuração inicial | Impede que o live-config conceda privilégios de sudo e policykit. | `noroot` |
| `noautologin` | Todo boot | Impede que o live-config configure autologin no console e no modo gráfico; configurações persistentes existentes não são removidas. | `noautologin` |
| `nottyautologin` | Todo boot | Impede a configuração apenas do autologin no console; configurações persistentes existentes não são removidas. | `nottyautologin` |
| `nox11autologin` | Todo boot | Impede a configuração apenas do autologin gráfico; configurações persistentes existentes não são removidas. | `nox11autologin` |
| `xorg-driver` | Todo boot | Seleciona um driver Xorg em vez de autodetecção. | `xorg-driver=nouveau` |
| `xorg-resolution` | Todo boot | Define a resolução do Xorg em vez de autodetecção. | `xorg-resolution=1920x1080` |
| `module-mode` | Todo boot | Com `merged`, integra alterações de configuração ao sistema live em execução. | `module-mode=merged` |
| `hooks` | Todo boot | Busca e executa hooks do sistema de arquivos, mídia live ou URLs suportadas pelo wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerações de segurança

A linha de comando do kernel é texto simples e normalmente fica visível na configuração do bootloader,
`/proc/cmdline` e diagnósticos. Não coloque segredos reutilizáveis em
`root-password=` ou `user-password=`. Prefira os parâmetros `*-crypted`
correspondentes, mas ainda trate hashes de senha expostos como sensíveis.

Hooks são executados como código privilegiado de boot. Um hook `http://` não possui criptografia de transporte nem autenticação de servidor, então qualquer pessoa capaz de alterar o caminho de rede pode substituí-lo. Use apenas conteúdos e mecanismos de entrega confiáveis; não utilize um hook HTTP não autenticado para inicialização sensível à segurança.

Separe comandos com espaços. Consulte as páginas de referência `man bootparam` para parâmetros adicionais do kernel comuns a todas as distribuições Linux.

Para informações detalhadas sobre parâmetros do live-config, veja [live-config](/configuration/live-config.md).

Para carregar o MiniOS pela rede (PXE e HTTP ISO), veja [Boot em rede](/installation/Network-Boot.md).
