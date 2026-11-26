---
updated: 2026-10-15
---

# Parâmetros de inicialização

## Como usar os parâmetros de inicialização

Os parâmetros de inicialização personalizam a inicialização do MiniOS. Separe os parâmetros com espaços na linha de comando do kernel.

### Syslinux

- Pressione <kbd>Esc</kbd> durante a sequência de inicialização do MiniOS para acessar o menu de inicialização.
- Pressione <kbd>Tab</kbd> para editar as opções de inicialização.
- Digite os parâmetros e pressione <kbd>Enter</kbd> para inicializar.

### GRUB

- Pressione <kbd>E</kbd> no menu do GRUB.
- Edite os parâmetros de inicialização no final da linha de comando.
- Pressione <kbd>F10</kbd> para inicializar com as novas configurações.

## Parâmetros de inicialização

A coluna Aplicação distingue os parâmetros normalmente aceitos em toda inicialização das configurações de conta destinadas à configuração inicial. Com persistência, os componentes do live-config normalmente são executados apenas uma vez; consulte [live-config](/reference/configuration/live-config).

Esta tabela é uma referência rápida. A precedência das fontes e as formas aceitas de `from=` estão definidas em [Descoberta do sistema no initrd](/reference/boot-process/System-Discovery), a filtragem de módulos em [Carregamento de módulos no initrd](/reference/boot-process/Module-Loading), a seleção de persistência em [Persistência no initrd](/reference/boot-process/Persistence-Internals), e as combinações compatíveis em [Modos de inicialização](/using-minios/Boot-Modes).

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `from` | Toda inicialização | Carrega dados MiniOS de um diretório, de um caminho de dispositivo compatível ou de uma ISO. Os formatos UUID, PARTUUID e de dispositivo by-id não são interpretados. Um URL literal **`http://` somente** tem precedência sobre `ip=` e inicia a [inicialização pela rede](/reference/boot-process/Network-Boot) por meio de httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Toda inicialização | Mantém os candidatos a `.sb` cujo caminho corresponde a uma expressão regular estendida não ancorada; vírgulas são convertidas em alternância, e um intervalo numérico crescente completo recebe expansão especial. Também filtra `toram=trim`. Pode excluir módulos essenciais ou do kernel e impedir a inicialização do sistema. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Toda inicialização | Exclui os candidatos cujo caminho corresponde a uma expressão regular estendida não ancorada, inclusive de `toram=trim`; é aplicado após `load` e pode excluir módulos essenciais ou do kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Toda inicialização | Define a extensão do pacote. Padrão: `sb`. A coordenação com o kernel ainda usa nomes literais de `.sb`; portanto, uma extensão personalizada não pode coordenar o módulo `01-kernel`. | `bext=mymod` |
| `timing` | Toda inicialização | Ativa a saída de temporização da inicialização. | `timing` |
| `union` | A cada inicialização | Seleciona o sistema de arquivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | A cada inicialização | Endereço estático para buscar dados pela rede na inicialização. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP PXE padrão **7529**). Um `from=http://...` prevalece sobre `ip=` e usa os campos de endereçamento correspondentes; caso contrário, qualquer `ip=` não vazio força o download de dados via PXE e ignora a mídia local. Isso não é uma configuração de sessão do NetworkManager. Consulte [Inicialização pela rede](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | A cada inicialização | Tamanho do cache httpfs em MiB para inicialização de rede com ISO via HTTP (`from=http://…`). Consulte [Inicialização pela rede](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | A cada inicialização | Abre um shell de depuração ao final da etapa do initramfs. | `rd.break` |
| `perchdir` | A cada inicialização | Seleciona uma sessão de persistência numerada ou uma ação. `resume` abre a sessão compatível padrão; `setup` permite escolher interativamente o backend de armazenamento e, em seguida, cria uma nova sessão numerada; `new` cria uma nova sessão diretamente com as configurações de `perchmode`, criptografia, compactação e tamanho solicitadas ou padrão; `ask` oferece sessões salvas e inicia automaticamente a configuração quando não há nenhuma. Um seletor numérico inexistente pode usar o padrão dos metadados; ele não reserva nem cria esse número. Um dispositivo/caminho ou uma forma `askdisk` seleciona outro local de persistência. Use um sufixo delimitado por dois-pontos para definir um caminho personalizado. Sem um parâmetro de persistência, MiniOS inicia sem problemas. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | A cada inicialização | Tamanho do contêiner lógico para `dynfilefs`, `dynblk`, `vmdk` e `raw`; não se aplica a `native` nem a `squashfs`. Um número simples ou um valor `M`/`MB` é alocado em MiB; valores `G`/`GB` e `T`/`TB` são convertidos para 1000 e 1.000.000 MiB. Sem tamanho explícito, sessões DynFileFS, DynBlk e VMDK criadas pelo initrd usam até 16 GiB e reduzem esse padrão quando resta menos espaço de armazenamento após `perchreserve`. As verificações de capacidade do backend continuam sendo aplicadas. DynBlk consulta o limite do backend instalado usando `dynblk limits --format dynblk` (ou `--format vmdk` para VMDK); não há um limite separado de 512 GiB. DynFileFS e DynBlk alocam os dados sob demanda. Solicitações de Raw têm limite de 1.000.000 MiB e do espaço disponível após `perchreserve`; Raw é limitado a 4000 MiB em FAT32, com ou sem criptografia. Novos contêineres Raw têm tamanho padrão de 4000 MiB. O Gerenciador de sessões MiniOS define como padrão 4000 MiB para contêineres DynFileFS criados manualmente e 16 GiB para DynBlk/VMDK. Consulte [Persistência do Initrd](/reference/boot-process/Persistence-Internals) para informações sobre o comportamento de memória e armazenamento do backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | A cada inicialização | Margem de alocação e limite para aviso de pouco espaço, em MiB. Esse valor é subtraído ao dimensionar contêineres novos ou em expansão, mas não é uma cota de execução e não impede que gravações futuras preencham o dispositivo. Padrão: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | A cada inicialização | Modo de armazenamento persistente.<br>`native` (padrão): um diretório em um sistema de arquivos POSIX gravável.<br>`dynfilefs`: um contêiner FUSE expansível que usa o formato 600, inclusive em FAT32, NTFS ou exFAT.<br>`dynblk`: um dispositivo de bloco de kernel separado no formato 1, baseado em arquivos `volumeNNN.db`; o número `/dev/dynblkN` é alocado dinamicamente e vários volumes podem coexistir.<br>`vmdk`: arquivos `volume.vmdk` / `volume-sNNN.vmdk` esparsos divididos padrão, expostos pelo driver DynBlk; sem compactação. Requer o recurso de initrd com versão.`vmdk-session-v1` initrd com versão.<br>`raw`: uma imagem ext4 de tamanho fixo.<br>`squashfs`: um snapshot compactado descompactado em uma camada superior baseada em RAM. A configuração do initrd cria apenas metadados da geração zero; o sistema em execução cria o primeiro snapshot sob demanda ou durante o desligamento. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Somente na criação | Camada opcional de criptografia para uma sessão `raw`, `dynfilefs`, `dynblk`, ou `vmdk` recém-criada. `perchencrypt=luks` requer o recurso de initramfs com versão. `luks-layer-v1`As sessões existentes derivam a criptografia apenas de `session_encryption[N]`, portanto, este parâmetro não as reinterpreta nem converte. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Somente na criação | Seleciona a compactação do backend DynBlk para uma sessão DynBlk recém-criada: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`. O codec de kernel selecionado precisa estar disponível. Quando `perchencrypt=luks` encapsula DynBlk, MiniOS força a compactação DynBlk para `none`. O VMDK não oferece compactação: na inicialização, um codec diferente de`none` é ignorado com um aviso. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | A cada inicialização | Ativa o caminho legado de retomada da persistência. Diferentemente de `perchdir=resume`, ele não cria automaticamente uma substituição compatível quando não há uma sessão padrão utilizável. | `perch` |
| `toram` | A cada inicialização | Controla a cópia de MiniOS **dados do sistema** para RAM. Sem `toram` é `full`; `trim` copia a configuração necessária e o conjunto de módulos selecionado, omitindo dados de origem não relacionados. A cópia da persistência é controlada separadamente por `perchtoram`. Quando a persistência é solicitada e `perchtoram` não é especificado, qualquer modo `toram` ativo define a cópia da persistência como `trim`. Remova a mídia somente depois de confirmar que a origem original, os loops, os mapeamentos e qualquer armazenamento de persistência necessário foram desconectados com sucesso. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | A cada inicialização com persistência | `off` mantém o armazenamento original; `trim` copia a sessão selecionada Raw, DynFileFS, DynBlk, VMDK ou SquashFS; `full` copia todos os contêineres/snapshots compatíveis e os metadados correspondentes. Padrão: `trim` com o sistema `toram`, caso contrário `off`. A opção não solicita persistência por si só. Os dados nativos não são copiados: uma solicitação nativa RAM bem-sucedida inicia um novo contêiner vazio, exceto durante a redefinição, que desativa a cópia. Se a cópia falhar, a operação continua no armazenamento. As alterações em RAM precisam ser salvas no armazenamento original com permissão de gravação ou como uma nova sessão. Ignorado com o backend selecionado do plug-in de persistência Ventoy. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | A cada inicialização | Inicia no modo de console de texto. | `text` |
| `automount` | A cada inicialização | Ativa a montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | A cada inicialização | Ativa diagnósticos adicionais de inicialização. | `debug` |
| `nozram` | A cada inicialização | Desativa o swap zram. | `nozram` |
| `zramsize` | A cada inicialização | Define o tamanho do swap zram em MiB. Se omitido, MiniOS calcula o valor com base no total de RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | A cada inicialização | Seleciona `lzo`, `lzo-rle`, `lz4`, `lz4hc`, ou `zstd`; a disponibilidade depende do kernel em execução. Se omitido, o padrão do kernel é mantido. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | A cada inicialização | Define o destino padrão do systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | A cada inicialização | Ativa os serviços especificados do systemd na inicialização. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | A cada inicialização | Desativa os serviços systemd especificados durante a inicialização. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | A cada inicialização | Desativa as alterações automáticas da resolução da tela em máquinas virtuais. O padrão do XFCE é 1280x800. | `novirtres` |
| `virtres` | A cada inicialização | Define a resolução da tela do XFCE em máquinas virtuais. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | A cada inicialização | Executa apenas os componentes live-config listados, na ordem dos componentes. | `components=hostname,user-setup,sudo` |
| `nocomponents` | A cada inicialização | Executa todos os componentes live-config, exceto os listados. | `nocomponents=anacron,apport` |
| `hostname` | A cada inicialização | Define o nome de host do sistema. | `hostname=minios` |
| `username` | Configuração inicial | Define o nome de usuário criado para o login automático. | `username=live` |
| `user-default-groups` | Configuração inicial | Define os grupos padrão do usuário criado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuração inicial | Define o nome completo do usuário criado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuração inicial | Define a senha de root em texto simples. | `root-password=toor` |
| `root-password-crypted` | Configuração inicial | Define a senha de root como hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuração inicial | Define a senha do usuário em texto simples. | `user-password=live` |
| `user-password-crypted` | Configuração inicial | Define a senha do usuário como hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | A cada inicialização | Define uma ou mais localidades do sistema. | `locales=en_US.UTF-8` |
| `timezone` | A cada inicialização | Define o fuso horário do sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | A cada inicialização | Define o modelo do teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | A cada inicialização | Define os layouts de teclado separados por vírgulas. | `keyboard-layouts=us,de` |
| `keyboard-variants` | A cada inicialização | Define as variantes de teclado separadas por vírgulas, correspondentes aos layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | A cada inicialização | Define as opções do teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuração inicial | Impede que o live-config conceda privilégios de sudo e PolicyKit. | `noroot` |
| `noautologin` | A cada inicialização | Impede que o live-config configure o login automático no console e no ambiente gráfico; a configuração persistente existente não é removida. | `noautologin` |
| `nottyautologin` | A cada inicialização | Impede apenas a configuração do login automático no console; a configuração persistente existente não é removida. | `nottyautologin` |
| `nox11autologin` | A cada inicialização | Impede apenas a configuração do login automático no ambiente gráfico; a configuração persistente existente não é removida. | `nox11autologin` |
| `xorg-driver` | A cada inicialização | Seleciona um driver Xorg em vez de detectá-lo automaticamente. | `xorg-driver=nouveau` |
| `xorg-resolution` | A cada inicialização | Define a resolução do Xorg em vez de detectá-la automaticamente. | `xorg-resolution=1920x1080` |
| `module-mode` | A cada inicialização | Com `merged`, integra as alterações de configuração ao sistema live em execução. | `module-mode=merged` |
| `link-user-dirs` | A cada inicialização | Vincula os diretórios de usuário gerenciados a mídias MiniOS graváveis. É mutuamente exclusivo com `bind-user-dirs` e indisponível com qualquer `toram` modo ou enquanto a sessão de persistência ativa estiver criptografada com LUKS. A criptografia ativa é determinada com base na sessão em execução, não na solicitação de criação de `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | A cada inicialização | Monta os diretórios de usuário gerenciados por bind a partir de mídias MiniOS graváveis. Tem as mesmas restrições de `toram` e de criptografia da sessão ativa que `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | A cada inicialização | Define o local relativo à mídia usado por `link-user-dirs` ou `bind-user-dirs`. Padrão: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | A cada inicialização | Busca e executa hooks do sistema de arquivos, da mídia live ou de URLs compatíveis com wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Para criação nativa em FAT32/NTFS/exFAT ou quando uma sondagem POSIX falha, o initrd prefere DynBlk quando disponível e permitido pelo Secure Boot; caso contrário, usa DynFileFS. Essa alternativa não altera o modo de armazenamento de uma sessão existente. Com um backend Ventoy Persistence Plugin selecionado, uma solicitação de persistência usa essa única imagem ext4 em vez de sessões numeradas; `perchdir` as opções de sessão são ignoradas. Consulte [Detalhes internos da persistência](/reference/boot-process/Persistence-Internals).

Em uma montagem normal, o helper atual DynFileFS converte automaticamente o formato 400 ou 500 para 600 no próprio local, se o tamanho da divisão legada for um número par de MiB. Uma divisão com tamanho ímpar em MiB é rejeitada sem alterações. Nenhum parâmetro de inicialização seleciona os formatos antigos ou habilita a conversão.

## Considerações de segurança

A linha de comando do kernel é texto simples e normalmente fica visível na configuração do carregador de inicialização, `/proc/cmdline` e nos diagnósticos. Não inclua segredos reutilizáveis em `root-password=` nem em `user-password=`. Prefira os parâmetros correspondentes de `*-crypted`, mas trate como confidenciais os hashes de senha expostos.

Hooks são executados como código privilegiado durante a inicialização. Um hook `http://` não oferece criptografia de transporte nem autenticação do servidor; portanto, qualquer pessoa capaz de alterar o caminho da rede pode substituí-lo. Use apenas conteúdo e mecanismos de entrega confiáveis; não use um hook HTTP sem autenticação em uma inicialização sensível à segurança.

Separe os comandos com espaços. Consulte as páginas de referência do `man bootparam` para ver outros parâmetros do kernel comuns a todas as distribuições Linux.

Para informações detalhadas sobre os parâmetros do live-config, consulte [live-config](/reference/configuration/live-config).

Para carregar MiniOS pela rede (PXE e ISO HTTP), consulte [Inicialização pela rede](/reference/boot-process/Network-Boot).

## Parâmetros de cache e registro da sessão persistente

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `log-storage` ou `live-config.log-storage` | Toda inicialização com persistência validada | `persistent` (padrão) ou `volatile`. No modo volátil, o journald usa até 32 MiB e o `/var/log` comum usa um tmpfs de 32 MiB. Os diagnósticos de inicialização são mantidos separadamente; com persistência durável, permanecem no armazenamento. Um sistema de arquivos de log RAM cheio não ocupa espaço adicional no dispositivo USB. | `log-storage=volatile` |
| `apt-cache` ou `live-config.apt-cache` | Toda inicialização com persistência validada | `persistent` (padrão) ou `volatile` para `/var/cache/apt/archives`. O tmpfs tem 256 MiB quando há pelo menos 1 GiB disponível, ou 512 MiB quando há pelo menos 2 GiB disponíveis. O swap que não seja zRAM o desativa; downloads grandes podem esgotá-lo. As listas de repositórios e o estado do dpkg permanecem na camada da sessão. | `apt-cache=volatile` |
| `browser-cache` ou `live-config.browser-cache` | Toda inicialização com persistência validada | `persistent` (padrão) ou `volatile`. Com pelo menos 1 GiB disponível e sem swap que não seja zRAM, os diretórios padrão de cache do navegador do usuário live compartilham um tmpfs de 512 MiB. Uma política gerenciada do Firefox desativa o cache em disco quando não há outro arquivo de política. Perfis e outros caches permanecem na camada da sessão. | `browser-cache=volatile` |

Os três parâmetros de política de armazenamento são analisados por `minios-boot` antes do sistema de inicialização normal, **não** pelo seletor de persistência inicial. Eles não ativam `perch`. Exigem ativação bem-sucedida em armazenamento durável ou em uma sessão RAM gravável com informações de `ram-origin` protegidas; não tornam duráveis as alterações em RAM sem salvá-las. Um initrd compatível anuncia `perch-storage-v1` em `/run/initramfs/etc/minios-initramfs-storage`. O Configurator e `config.conf` oferecem as mesmas opções; consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para ver limites, precedência e ressalvas sobre a instalação do navegador.
