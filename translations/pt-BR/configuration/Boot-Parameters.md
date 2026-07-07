# Parâmetros de boot

## Como usar parâmetros de boot

Parâmetros de boot, também conhecidos como parâmetros do kernel, são comandos que você pode inserir para personalizar o processo de inicialização do MiniOS. Eles podem ser usados para desabilitar a detecção de hardware, iniciar o MiniOS a partir de um dispositivo específico e muito mais.

### Para Syslinux:

- Pressione <kbd>Esc</kbd> durante a sequência de boot do MiniOS para acessar o menu de inicialização.
- Pressione <kbd>Tab</kbd> para editar as opções de boot.
- Digite os parâmetros desejados e pressione Enter para iniciar.

### Para Grub:

- Pressione <kbd>E</kbd> quando visualizar o menu do grub.
- Edite os parâmetros de boot no final da linha de comando.
- Pressione <kbd>F10</kbd> para inicializar com as novas configurações.

## Tabela de Parâmetros de Boot

A tabela abaixo lista os parâmetros de boot disponíveis no MiniOS, suas funções e exemplos de uso.

**Legenda:**
- 🔒 **Somente uma vez** - Aplicado apenas no primeiro boot, não pode ser alterado em inicializações posteriores
- 🔄 **Reconfigurável** - Pode ser alterado a cada boot e reaplicado


| Parâmetro | Reconfigurável | Descrição | Exemplo de uso |
|---|---|---|---|
| `from` | 🔄 | Carrega os dados do MiniOS de um diretório, dispositivo ou arquivo ISO especificado. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Habilita o carregamento de módulos `.sb` específicos usando uma expressão regular. Funciona em conjunto com o comando `toram=trim`, permitindo que apenas módulos selecionados sejam carregados na RAM.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Desabilita o carregamento de módulos `.sb` específicos usando uma expressão regular. Funciona junto com o comando `toram=trim`, permitindo excluir módulos selecionados do carregamento na RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | 🔄 | Define a extensão de arquivo para bundles (módulos). Padrão: `sb`. | `bext=mymod` |
| `timing` | 🔄 | Habilita a saída de tempo durante a inicialização para depuração de desempenho. | `timing` |
| `union` | 🔄 | Força o uso de um sistema de arquivos union específico. | `union=aufs`<br>`union=overlayfs` |
| `ip` | 🔄 | Define um endereço IP estático para interfaces de rede, usado para boot PXE. Formato: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>`. | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | 🔄 | Define o tamanho do cache em MB para dados carregados via HTTP. | `cache=512` |
| `rd.break` | 🔄 | Interrompe o processo de boot ao final da etapa initramfs e fornece um shell de depuração. | `rd.break` |
| `perchdir` | 🔄 | Seleciona um perfil ou executa uma ação com um perfil. Aceita o número do perfil ou as palavras-chave `resume` (retomar sessão anterior), `new` (iniciar nova sessão) ou `ask` (selecionar sessão na inicialização). Se omitido, o MiniOS inicia em modo "limpo". | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Define o tamanho do sistema de arquivos virtual DynFileFS (em MB), usado para armazenar dados em sistemas de arquivos não-Linux (ex: FAT32, NTFS). Padrão: 16GB. Use esta opção se seu disco de destino for menor. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Modo de salvamento para alterações persistentes.<br>`native` (padrão) - armazena dados como estão em sistemas de arquivos compatíveis com POSIX;<br>`dynfilefs` - armazena dados em arquivos de imagem expansíveis dinamicamente;<br>`raw` - armazena dados em um arquivo de imagem de tamanho fixo.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `perch` | 🔄 | Habilita persistência e retoma a última sessão usada. Equivalente a `perchdir=resume`. | `perch` |
| `toram` | 🔄 | Copia o sistema para a RAM. Pode receber os valores `trim` e `full`. Se especificado sem parâmetros, o padrão é `full`.<br>`trim` - apenas os dados necessários são copiados, considerando os filtros `load` e `noload`. Se parâmetros `perch` forem especificados, as alterações também são carregadas.<br>`full` - toda a pasta minios é carregada, exceto alterações, a menos que `perch` seja especificado. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Desabilita o servidor X e inicia em modo console texto. | `text` |
| `automount` | 🔄 | Habilita montagem automática de dispositivos de armazenamento. | `automount` |
| `debug` | 🔄 | Habilita saída de depuração durante a inicialização. | `debug` |
| `nozram` | 🔄 | Desabilita o swap zram. | `nozram` |
| `zramsize` | 🔄 | Define o tamanho do swap zram (em MB). | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Especifica o algoritmo de compressão do zram. Opções disponíveis para Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Padrão: `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Define o target padrão do systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Habilita serviços systemd especificados no boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Desabilita serviços systemd especificados no boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Desabilita a alteração automática de resolução de tela em máquinas virtuais. A resolução padrão em VMs é 1280x800. (Válido apenas no ambiente XFCE.) | `novirtres` |
| `virtres` | 🔄 | Define a resolução de tela em máquinas virtuais (largura x altura). (Válido apenas no ambiente XFCE.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Especifica quais componentes do live-config executar. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Especifica quais componentes do live-config NÃO executar. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Define o hostname do sistema. | `hostname=minios` |
| `username` | 🔒 | Define o nome de usuário para login automático. | `username=live` |
| `user-default-groups` | 🔒 | Define os grupos padrão para o usuário. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Define o nome completo do usuário. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Define a senha root em texto simples. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Define a senha root em formato criptografado. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Define a senha do usuário em texto simples. | `user-password=live` |
| `user-password-crypted` | 🔒 | Define a senha do usuário em formato criptografado. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Define o locale do sistema. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Define o fuso horário do sistema. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Define o modelo do teclado. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Define os layouts de teclado (separados por vírgula). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Define as variantes de teclado (separadas por vírgula). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Define opções do teclado. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Desabilita privilégios sudo e policykit. | `noroot` |
| `noautologin` | 🔄 | Desabilita o login automático tanto no console quanto no modo gráfico. | `noautologin` |
| `nottyautologin` | 🔄 | Desabilita apenas o login automático no console. | `nottyautologin` |
| `nox11autologin` | 🔄 | Desabilita apenas o login automático gráfico. | `nox11autologin` |
| `xorg-driver` | 🔄 | Define o driver xorg ao invés de autodetectar. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Define a resolução xorg ao invés de autodetectar. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Define o modo de módulo de configuração live. Quando definido como "merged", integra dinamicamente alterações de configuração. | `module-mode=merged` |
| `hooks` | 🔄 | Executa arquivos arbitrários do sistema de arquivos, mídia ou URLs. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Separe os comandos com espaços. Consulte as páginas de referência `man bootparam` para parâmetros de kernel adicionais comuns a todas as distribuições Linux.

Para informações detalhadas sobre parâmetros do live-config, veja [live-config](/configuration/live-config.md).
