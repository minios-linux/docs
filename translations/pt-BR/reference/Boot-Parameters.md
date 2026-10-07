---
updated: 2026-10-06
---

# Parâmetros de boot

## Como usar parâmetros de boot

Os parâmetros de boot personalizam como o MiniOS é iniciado. Separe os parâmetros com espaços na linha de comando do kernel.

### Syslinux

- Pressione <kbd>Esc</kbd> durante a sequência de boot do MiniOS para acessar o menu de boot.
- Pressione <kbd>Tab</kbd> para editar as opções de boot.
- Digite os parâmetros e pressione <kbd>Enter</kbd> para iniciar.

### GRUB

- Pressione <kbd>E</kbd> no menu do GRUB.
- Edite os parâmetros de boot ao final da linha de comando.
- Pressione <kbd>F10</kbd> para iniciar com as novas configurações.

## Parâmetros de boot

A coluna Aplicação diferencia parâmetros normalmente aceitos em todo boot de configurações de conta destinadas à configuração inicial. Com persistência, componentes live-config normalmente são executados apenas uma vez; veja [live-config](/reference/configuration/live-config).

Esta tabela serve como referência rápida. A precedência das fontes e os `from=` formatos aceitos são definidos em [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery), filtragem de módulos em [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading), seleção de persistência em [Persistência Initrd](/reference/boot-process/Persistence-Internals), e combinações suportadas em [Modos de boot](/using-minios/Boot-Modes).

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `from` | Todo boot | Carrega dados MiniOS de um diretório, caminho de dispositivo suportado ou ISO. Formatos UUID, PARTUUID e by-id de dispositivos não são analisados. Um **`http://` literal apenas** URL tem precedência sobre `ip=` e inicia o [boot em rede](/reference/boot-process/Network-Boot) via httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Todo boot | Mantém os candidatos `.sb` cujo caminho corresponde a uma expressão regular estendida não ancorada; vírgulas se tornam alternância e um intervalo numérico inteiro crescente tem expansão especial. Também filtra `toram=trim`. Pode excluir módulos core ou do kernel e tornar o sistema não inicializável. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Todo boot | Exclui candidatos cujo caminho corresponde a uma expressão regular estendida não ancorada, inclusive de `toram=trim`; é aplicado após `load` e pode excluir módulos core ou do kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Todo boot | Define a extensão do bundle. Padrão: `sb`. A coordenação com o kernel ainda usa nomes `.sb` literais, então uma extensão personalizada não pode coordenar o módulo `01-kernel`. | `bext=mymod` |
| `timing` | Todo boot | Ativa a saída de tempo de inicialização. | `timing` |
| `union` | A cada inicialização | Seleciona o sistema de arquivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | A cada inicialização | Endereço estático para busca de rede antecipada. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE padrão **7529**). Um valor literal `from=http://...` prevalece sobre `ip=` e usa seus campos de endereço; caso contrário, qualquer valor não vazio de `ip=` força o download de dados PXE e ignora a mídia local. Isso não é uma configuração de sessão do NetworkManager. Veja [Inicialização pela rede](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | A cada inicialização | Tamanho do cache httpfs em MiB para inicialização de rede HTTP ISO (`from=http://…`). Veja [Inicialização pela rede](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | A cada inicialização | Abre um shell de depuração ao final da etapa initramfs. | `rd.break` |
| `perchdir` | A cada inicialização | Seleciona uma sessão de persistência numerada ou uma ação. `resume` abre a sessão compatível padrão; `setup` escolhe interativamente o backend de armazenamento e então cria uma nova sessão numerada; `new` cria uma nova sessão diretamente a partir do `perchmode` solicitado/padrão, configurações de criptografia, compactação e tamanho; `ask` oferece sessões salvas e entra automaticamente na configuração quando não há nenhuma existente. Um seletor numérico inexistente pode recorrer ao padrão de metadados; ele não reserva nem cria esse número. Um dispositivo/caminho ou `askdisk` seleciona outro local de persistência. Use um sufixo separado por dois-pontos para um caminho personalizado. Sem um parâmetro de persistência, MiniOS inicia limpo. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | A cada inicialização | Tamanho lógico do contêiner para `dynfilefs`, `dynblk`, `vmdk`, e `raw`; não se aplica a `native` ou `squashfs`. Um número simples ou `M`/`MB` é alocado em MiB; `G`/`GB` e `T`/`TB` são convertidos para 1000 e 1.000.000 MiB. Sem um tamanho explícito, sessões criadas pelo initrd DynFileFS, DynBlk e VMDK usam até 16 GiB e reduzem esse padrão quando resta menos espaço após `perchreserve`; DynFileFS também considera sua sobrecarga de índice e o limite de RAM. DynBlk consulta o limite do backend instalado usando `dynblk limits --format dynblk` (ou `--format vmdk` para VMDK); não há limite separado de 512 GiB. O payload DynFileFS e os dados de suporte DynBlk crescem sob demanda, enquanto DynFileFS também reserva índices para a capacidade lógica declarada. Requisições raw são limitadas a 1.000.000 MiB e pelo espaço disponível após `perchreserve`; Raw é limitado a 4000 MiB em FAT32, criptografado ou não. Novos contêineres raw têm padrão de 4000 MiB. O Gerenciador de sessões MiniOS ainda define manualmente contêineres DynFileFS criados manualmente para 4000 MiB e DynBlk/VMDK para 16 GiB. Veja [Persistência initrd](/reference/boot-process/Persistence-Internals) para comportamento de memória e armazenamento do backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | A cada inicialização | Margem de alocação e limite de aviso de pouco espaço em MiB. Esse valor é subtraído ao dimensionar novos contêineres ou ao expandi-los, mas não é uma cota de tempo de execução e não impede que gravações posteriores preencham o dispositivo. Padrão: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | A cada inicialização | Modo de armazenamento persistente.<br>`native` (padrão): um diretório em um sistema de arquivos POSIX gravável.<br>`dynfilefs`: o contêiner expansível baseado em FUSE no formato-400, inclusive em FAT32, NTFS ou exFAT.<br>`dynblk`: um dispositivo de bloco de kernel separado no formato-1, baseado em thin `volumeNNN.db` arquivos; o número real `/dev/dynblkN` é alocado dinamicamente e vários volumes podem coexistir.<br>`vmdk`: arquivos sparse padrão divididos `volume.vmdk` / `volume-sNNN.vmdk` arquivos expostos pelo driver DynBlk; sem compactação. Requer a capacidade versionada de `vmdk-session-v1` initrd.<br>`raw`: uma imagem ext4 de tamanho fixo.<br>`squashfs`: um snapshot compactado extraído para uma camada superior baseada em RAM. A configuração do initrd cria apenas os metadados da geração zero; o sistema em execução cria o primeiro snapshot sob demanda ou no desligamento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Somente na criação | Camada de criptografia opcional para um novo `raw`, `dynfilefs`, `dynblk`, ou `vmdk` sessão. `perchencrypt=luks` requer a capacidade versionada de `luks-layer-v1` initramfs. Sessões existentes derivam a criptografia apenas de `session_encryption[N]`, portanto, este parâmetro não reinterpreta nem converte essas sessões. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Somente na criação | Seleciona a compactação de backend DynBlk para uma nova sessão DynBlk: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`. O codec do kernel selecionado deve estar disponível. Quando `perchencrypt=luks` envolve DynBlk, MiniOS força a compactação DynBlk para `none`. VMDK não possui compactação: a inicialização ignora um codec não-`none` com um aviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | A cada inicialização | Ativa o caminho de retomada de persistência legado. Diferente de `perchdir=resume`, não cria automaticamente um substituto compatível quando não existe uma sessão padrão utilizável. | `perch` |
| `toram` | A cada inicialização | Controla a cópia do MiniOS **dados do sistema** para RAM. Bare `toram` copia `full`; `trim` apenas a configuração necessária e o conjunto de módulos selecionados, omitindo dados de origem não relacionados. A cópia de persistência é controlada separadamente por `perchtoram`. Quando a persistência é solicitada e `perchtoram` não está especificado, qualquer modo ativo de `toram` define a cópia de persistência como padrão para `trim`. Remova a mídia somente após confirmar que a origem, loops, mapeamentos e qualquer armazenamento de persistência necessário foram desconectados com sucesso. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | A cada inicialização com persistência | Controla a cópia de sessões de persistência suportadas de forma independente dos `toram`dados do sistema: `off` mantém a sessão no armazenamento original, `trim` copia apenas a sessão Raw, DynFileFS, DynBlk, VMDK ou SquashFS selecionada mais os metadados correspondentes, e `full` copia todas as sessões de container/SquashFS suportadas desse armazenamento. Sessões de diretório nativas não são copiadas. O padrão é `trim` quando os dados do sistema `toram` estão ativos, caso contrário `off`; um valor explícito prevalece. Uma sessão copiada é marcada como não durável, mas o Session Manager atual pode salvar explicitamente alterações suportadas por RAM no armazenamento original ou como uma nova sessão quando esse armazenamento estiver disponível e ainda corresponder à identidade registrada. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | A cada inicialização | Inicia no modo console de texto. | `text` |
| `automount` | A cada inicialização | Habilita a montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | A cada inicialização | Ativa diagnósticos adicionais na inicialização. | `debug` |
| `nozram` | A cada inicialização | Desativa a troca zram. | `nozram` |
| `zramsize` | A cada inicialização | Define o tamanho do swap zram em MiB. Se omitido, o MiniOS calcula a partir do total de RAM. | `zramsize=512`<br>`zramsize=2048` |
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
| `keyboard-layouts` | A cada inicialização | Define os layouts de teclado separados por vírgula. | `keyboard-layouts=us,de` |
| `keyboard-variants` | A cada inicialização | Define as variantes de teclado, separadas por vírgula, correspondentes aos layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | A cada inicialização | Define as opções do teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuração inicial | Impede que o live-config conceda privilégios de sudo e policykit. | `noroot` |
| `noautologin` | A cada inicialização | Impede que o live-config configure o login automático no console e no ambiente gráfico; configurações persistentes já existentes não são removidas. | `noautologin` |
| `nottyautologin` | A cada inicialização | Impede apenas a configuração de login automático no console; configurações persistentes já existentes não são removidas. | `nottyautologin` |
| `nox11autologin` | A cada inicialização | Impede apenas a configuração de login automático no ambiente gráfico; configurações persistentes já existentes não são removidas. | `nox11autologin` |
| `xorg-driver` | A cada inicialização | Seleciona um driver Xorg em vez de usar a autodetecção. | `xorg-driver=nouveau` |
| `xorg-resolution` | A cada inicialização | Define a resolução do Xorg em vez de usar a autodetecção. | `xorg-resolution=1920x1080` |
| `module-mode` | A cada inicialização | Com `merged`, integra as alterações de configuração ao sistema live em execução. | `module-mode=merged` |
| `link-user-dirs` | A cada inicialização | Vincula os diretórios de usuário gerenciados à mídia gravável MiniOS. É mutuamente exclusivo com `bind-user-dirs` e indisponível com qualquer modo `toram` ou enquanto a sessão de persistência ativa estiver criptografada com LUKS. A criptografia ativa é determinada pela sessão em execução, não pela solicitação de criação de `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | A cada inicialização | Faz bind-mount dos diretórios de usuário gerenciados a partir da mídia gravável MiniOS. Possui as mesmas restrições de `toram` e criptografia de sessão ativa que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | A cada inicialização | Define o local relativo à mídia usado por `link-user-dirs` ou `bind-user-dirs`. Padrão: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | A cada inicialização | Busca e executa hooks do sistema de arquivos, da mídia live ou de URLs compatíveis com wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Considerações de segurança

A linha de comando do kernel é texto simples e normalmente fica visível na configuração do bootloader, `/proc/cmdline`, e diagnósticos. Não coloque segredos reutilizáveis em `root-password=` ou `user-password=`. Prefira os parâmetros `*-crypted` correspondentes, tratando ainda assim hashes de senha expostos como sensíveis.

Hooks são executados como código privilegiado de boot. Um hook `http://` não possui criptografia de transporte nem autenticação de servidor, então qualquer pessoa capaz de alterar o caminho de rede pode substituí-lo. Use apenas conteúdos e mecanismos de entrega confiáveis; não utilize hooks HTTP não autenticados para inicialização sensível à segurança.

Separe comandos com espaços. Veja as `man bootparam` páginas de referência para parâmetros adicionais do kernel comuns a todas as distribuições Linux.

Para informações detalhadas sobre parâmetros do live-config, veja [live-config](/reference/configuration/live-config).

Para carregar MiniOS pela rede (PXE e HTTP ISO), veja [Boot pela rede](/reference/boot-process/Network-Boot).

## Parâmetros de cache e log de sessões persistentes

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `log-storage` ou `live-config.log-storage` | Todo boot, com `perch` | `persistent` durável (padrão) ou `volatile`. No modo volátil, o journald usa até 32 MiB de RAM e o `/var/log` comum usa um tmpfs de 32 MiB. `minios-boot` e `live-config` logs de boot permanecem no armazenamento de persistência gravável. Um sistema de arquivos de log RAM cheio para de aceitar gravações em vez de transbordar para o dispositivo USB. | `log-storage=volatile` |
| `apt-cache` ou `live-config.apt-cache` | Todo boot, com `perch` | `persistent` durável (padrão) ou `volatile` para `/var/cache/apt/archives`. O ponto de montagem RAM é de 256 ou 512 MiB quando há memória suficiente e nenhum swap não-zRAM está ativo; downloads grandes podem esgotá-lo. `/var/lib/apt/lists` e o estado do dpkg permanecem persistentes. | `apt-cache=volatile` |
| `browser-cache` ou `live-config.browser-cache` | Todo boot, com `perch` | `persistent` durável (padrão) ou `volatile` para caches padrão de navegador nativo. Após a existência do usuário live, subdiretórios selecionados de `~/.cache` usam um tmpfs compartilhado de 512 MiB, e o cache em disco do Firefox é desabilitado por uma política de sistema gerenciada quando não há outro arquivo de política do Firefox presente. Perfis e caches de aplicativos não relacionados permanecem persistentes. | `browser-cache=volatile` |

Os três parâmetros de política de armazenamento são interpretados por `minios-boot` antes do sistema init normal, **não** pelo seletor de persistência antecipado. Eles não habilitam `perch` e só têm efeito após ativação bem-sucedida da persistência durável. Um initrd compatível anuncia `perch-storage-v1` em `/run/initramfs/etc/minios-initramfs-storage`. Configurador e `config.conf` oferecem as mesmas opções; veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para limites, precedência e observações sobre instalação de navegador.
