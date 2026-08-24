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

A coluna "Aplicação" diferencia parâmetros normalmente aceitos em todo boot de configurações de conta destinadas à configuração inicial. Com persistência, os componentes do live-config normalmente são executados apenas uma vez; veja [live-config](/configuration/live-config.md).

| Parâmetro | Aplicação | Descrição | Exemplo |
|---|---|---|---|
| `from` | Todo boot | Carrega dados do MiniOS a partir de um diretório, dispositivo ou ISO. ISO remoto via **`http://` apenas** inicia o [boot pela rede](/installation/Network-Boot.md) (httpfs2). | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | Todo boot | Carrega apenas módulos `.sb` que correspondam a um nome, lista, expressão regular ou intervalo numérico suportado. Também filtra módulos copiados por `toram=trim`. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Todo boot | Exclui módulos `.sb` correspondentes, inclusive de `toram=trim`. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Todo boot | Define a extensão do bundle. Padrão: `sb`. | `bext=mymod` |
| `timing` | Todo boot | Habilita a saída de tempo de inicialização. | `timing` |
| `union` | Todo boot | Seleciona o sistema de arquivos union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Todo boot | **Apenas boot pela rede (PXE).** Endereço estático para busca inicial. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (porta HTTP padrão **7529**). `ip=` não vazio força o download de dados PXE e ignora a mídia local. Não é configuração de sessão do NetworkManager. Veja [boot pela rede](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Todo boot | Tamanho do cache httpfs em MB para boot de ISO via rede HTTP (`from=http://…`). Veja [boot pela rede](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Todo boot | Abre um shell de depuração ao final da etapa initramfs. | `rd.break` |
| `perchdir` | Todo boot | Seleciona uma sessão de persistência numerada ou uma ação: `resume`, `new` ou `ask`. Um dispositivo/caminho ou o formato `askdisk` seleciona outro local de persistência. Sem parâmetro de persistência, o MiniOS inicia limpo. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | Todo boot | Tamanho do container para `dynfilefs`, `raw` e `luks`; não se aplica a `native` ou `squashfs`. Aceita número inteiro em MB ou sufixo `M`/`MB`, `G`/`GB` ou `T`/`TB`; GB e TB são convertidos para 1000 MB e 1.000.000 MB. O limite é 1.000.000 MB, limitado ainda pelo espaço disponível após `perchreserve`; arquivos raw e LUKS são limitados a 4000 MB em FAT32. Novos containers raw e LUKS têm padrão de 4000 MB. DynFileFS criado pelo initramfs usa como padrão a capacidade disponível arredondada para baixo a cada 1000 MB; o Session Manager define o padrão em 4000 MB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Todo boot | Espaço livre, em MiB, mantido no dispositivo de persistência. Novos containers ou containers em crescimento não o consomem, e o MiniOS avisa quando o espaço livre atinge esse valor. Padrão: 256; máximo: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Todo boot | Modo de armazenamento da persistência.<br>`native` (padrão): um diretório em um sistema de arquivos POSIX gravável.<br>`dynfilefs`: um container expansível, inclusive em FAT32, NTFS ou exFAT.<br>`raw`: uma imagem ext4 de tamanho fixo.<br>`luks`: um container ext4 criptografado com LUKS2; criação e desbloqueio solicitados no console e requerem suporte a crypt no initramfs.<br>`squashfs`: um snapshot compactado existente descompactado para a sessão. O Session Manager pode criar e salvar snapshots SquashFS do sistema em execução; o initramfs pode retomar, mas não criar snapshots. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Todo boot | Habilita a persistência e retoma a última sessão. Equivalente a `perchdir=resume`. | `perch` |
| `toram` | Todo boot | Copia o MiniOS para a RAM. Sem valor, usa `full`; `full` copia o diretório completo do MiniOS, enquanto `trim` copia o conjunto de módulos selecionado por `load` e `noload`. Alterações persistentes são incluídas quando a persistência é solicitada. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Todo boot | Inicia em modo console de texto. | `text` |
| `automount` | Todo boot | Habilita a montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | Todo boot | Habilita diagnósticos adicionais na inicialização. | `debug` |
| `nozram` | Todo boot | Desabilita swap zram. | `nozram` |
| `zramsize` | Todo boot | Define o tamanho do swap zram em MiB. Se omitido, o MiniOS calcula a partir da RAM total. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Todo boot | Seleciona `lzo`, `lzo-rle`, `lz4`, `lz4hc` ou `zstd`; a disponibilidade depende do kernel em execução. Se omitido, o padrão do kernel é mantido. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Todo boot | Define o target padrão do systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Todo boot | Habilita os serviços systemd especificados na inicialização. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Todo boot | Desabilita os serviços systemd especificados na inicialização. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Todo boot | Desabilita alterações automáticas de resolução de tela em máquinas virtuais. O padrão do XFCE é 1280x800. | `novirtres` |
| `virtres` | Todo boot | Define a resolução de tela do XFCE em máquinas virtuais. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Todo boot | Executa apenas os componentes live-config listados, na ordem dos componentes. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Todo boot | Executa todos os componentes live-config, exceto os listados. | `nocomponents=anacron,apport` |
| `hostname` | Todo boot | Define o hostname do sistema. | `hostname=minios` |
| `username` | Configuração inicial | Define o nome de usuário criado para autologin. | `username=live` |
| `user-default-groups` | Configuração inicial | Define os grupos padrão do usuário criado. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Configuração inicial | Define o nome completo do usuário criado. | `user-fullname="MiniOS Live User"` |
| `root-password` | Configuração inicial | Define a senha root em texto simples. | `root-password=toor` |
| `root-password-crypted` | Configuração inicial | Define a senha root como hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Configuração inicial | Define a senha do usuário em texto simples. | `user-password=live` |
| `user-password-crypted` | Configuração inicial | Define a senha do usuário como hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Todo boot | Define um ou mais locales do sistema. | `locales=en_US.UTF-8` |
| `timezone` | Todo boot | Define o fuso horário do sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | Todo boot | Define o modelo do teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | Todo boot | Define layouts de teclado separados por vírgula. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Todo boot | Define variantes de teclado separadas por vírgula correspondentes aos layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Todo boot | Define opções de teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Configuração inicial | Impede que o live-config conceda privilégios de sudo e policykit. | `noroot` |
| `noautologin` | Todo boot | Impede que o live-config configure o autologin no console e no modo gráfico; a configuração persistente existente não é removida. | `noautologin` |
| `nottyautologin` | Todo boot | Impede apenas a configuração de autologin no console; a configuração persistente existente não é removida. | `nottyautologin` |
| `nox11autologin` | Todo boot | Impede apenas a configuração de autologin gráfico; a configuração persistente existente não é removida. | `nox11autologin` |
| `xorg-driver` | Todo boot | Seleciona um driver Xorg em vez da autodetecção. | `xorg-driver=nouveau` |
| `xorg-resolution` | Todo boot | Define a resolução do Xorg em vez da autodetecção. | `xorg-resolution=1920x1080` |
| `module-mode` | Todo boot | Com `merged`, integra alterações de configuração ao sistema live em execução. | `module-mode=merged` |
| `hooks` | Todo boot | Busca e executa hooks do sistema de arquivos, mídia live ou URLs suportados pelo wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Separe comandos com espaços. Consulte as páginas de referência `man bootparam` para parâmetros adicionais do kernel comuns a todas as distribuições Linux.

Para informações detalhadas sobre os parâmetros do live-config, veja [live-config](/configuration/live-config.md).

Para carregar o MiniOS pela rede (PXE e HTTP ISO), veja [boot pela rede](/installation/Network-Boot.md).
