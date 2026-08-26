# Usando o Instalador MiniOS

O Instalador MiniOS é um assistente GTK com backend de linha de comando para implantar o MiniOS a partir de uma sessão live do MiniOS. Ele instala em um disco de destino; não é o mesmo que gravar uma ISO em uma mídia inicializável.

## Antes de começar

Uma escolha incorreta de destino ou particionamento pode destruir dados. Faça backup dos arquivos importantes, desconecte discos que não serão usados e identifique o destino pelo caminho do dispositivo, modelo e capacidade. A confirmação final é o último ponto em que a instalação pode ser cancelada com segurança.

O disco que contém o sistema MiniOS live em execução é excluído da seleção de destino. Para orientações gerais sobre capacidade, consulte o [Guia de compatibilidade de hardware](Hardware-Compatibility.md).

## Modos de instalação

O modo Live copia os módulos MiniOS compactados selecionados e os arquivos de inicialização. O resultado mantém a estrutura modular do sistema live e pode usar persistência de sessão do MiniOS.

O modo Nativo expande os módulos selecionados em um sistema de arquivos raiz Linux convencional, configura o destino, instala os pacotes necessários, gera o initramfs e instala o bootloader. O instalador detecta o suporte nativo a partir da imagem inicializada. Se os metadados necessários do kernel e o contrato de arquitetura EFI estiverem ausentes, o modo de compatibilidade permite apenas a instalação live.

Essa implantação é diferente de uma gravação ISO bruta, de uma configuração multiboot de arquivo ISO com Ventoy ou de uma ferramenta de mídia live baseada em arquivos. Veja [Modos de inicialização](/configuration/Boot-Modes.md) para entender a diferença entre sistemas live e nativos.

## Iniciar o instalador gráfico

Abra o menu de aplicativos, selecione Sistema e depois Instalar MiniOS. Também pode ser iniciado a partir de um terminal:

```bash
sudo minios-installer
```

O assistente coleta informações sobre modo de instalação, segurança, localização, rede cabeada, teclado, conta, módulos, armazenamento e configurações de boot. Revise a geometria exata das partições e o resumo das operações antes de aceitar a confirmação final destrutiva.

## Opções de posicionamento e layouts de boot

O instalador gráfico oferece estas opções de posicionamento quando o destino é elegível:

- Apagar tudo cria uma nova tabela de partições e destrói todos os dados no disco de destino.
- Espaço livre utiliza espaço não alocado adequado sem reduzir um sistema de arquivos existente.
- Paralelo reduz uma partição final ext2, ext3, ext4 ou NTFS elegível e desmontada. Layouts sujos, montados, aninhados, ambíguos ou de outra forma inseguros são recusados. O instalador pode solicitar permissão antes de baixar ferramentas de sistema de arquivos ausentes.
- Particionamento manual está disponível apenas para instalações nativas via GUI em discos diretos elegíveis. As alterações são preparadas até a confirmação final.

Os layouts automáticos de boot são BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funciona com layouts GPT ou MBR primário. BIOS é suportado apenas em MBR primário, não em GPT. Layouts MBR estendidos ou lógicos de preservação não são suportados.

O modo manual pode criar, excluir, formatar e reutilizar partições; reduzir um sistema de arquivos suportado a partir do final; atribuir pontos de montagem, uma partição do sistema EFI e swap; e desfazer ou redefinir alterações preparadas. Não há suporte para LVM, RAID, raiz nativa LUKS, armazenamento mapeado ou aninhado, bcache, ZFS ou edição de subvolumes Btrfs. A persistência de sessão LUKS não criptografa um sistema de arquivos raiz nativo.

## Sistemas de arquivos

- Layouts live podem usar ext2, ext4, Btrfs, FAT32 ou NTFS quando as ferramentas necessárias estiverem instaladas.
- Sistemas de arquivos raiz nativos podem usar ext2, ext4 ou Btrfs. Ext4 é o padrão para uso geral.
- Sistemas de arquivos ext3 existentes podem ser reutilizados ou reduzidos onde suportado, mas ext3 não é oferecido para nova formatação.
- FAT32 é limitado a arquivos menores que 4 GiB e está disponível apenas para layouts live.
- NTFS está disponível apenas para layouts live, embora uma partição NTFS elegível possa ser reduzida para instalação paralela.

O espaço necessário inclui os dados dos módulos selecionados, arquivos de boot, persistência solicitada e uma reserva de 25 por cento do sistema de arquivos. Espaço EFI e swap nativo são calculados separadamente.

## Configuração e segurança

O instalador pode definir localidade, fuso horário, teclado, nome de usuário, senhas, grupos de usuários, nome da máquina, serviços, menu de boot e seleção de módulos. Selecionar um módulo MiniOS superior inclui suas camadas inferiores obrigatórias.

Os perfis de segurança são `convenient`, `balanced` e `strict`. O modo live usa `convenient` como padrão; o modo nativo usa `balanced` como padrão. Os controles de SSH e XRDP são separados do perfil selecionado. Revise os serviços de acesso remoto antes da primeira conexão de rede.

A configuração de rede abrange o nome da máquina e DHCP cabeado ou IPv4 estático. O instalador não cria nem modifica perfis de Wi-Fi. Instalações nativas e paralelas podem precisar de acesso à rede, com seu consentimento, para obter GRUB, EFI, initramfs, `os-prober` ou pacotes de redimensionamento de sistema de arquivos antes das alterações no disco.

## Persistência da sessão live

A persistência se aplica apenas a instalações live:

- A persistência nativa armazena as alterações diretamente em um sistema de arquivos de destino compatível com POSIX. Não é oferecida em FAT32 ou NTFS.
- DynFileFS utiliza um contêiner expansível.
- Raw utiliza uma imagem de tamanho fixo.
- LUKS utiliza uma imagem criptografada criada pelo initrd no primeiro boot. A senha é solicitada na inicialização e nunca é recebida ou armazenada pelo instalador.

Os modos de contêiner têm padrão de 4000 MiB. Contêineres Raw e LUKS não podem exceder 4000 MiB em FAT32; o DynFileFS não está sujeito a esse limite de arquivo único. O LUKS só é oferecido quando tanto o initrd em execução quanto cada initrd de origem copiado anunciam o suporte criptográfico necessário.

As opções de boot resultantes usam `perchmode` e `perchsize`. Veja [Persistência do initrd](/configuration/Initrd-Persistence.md) e [Parâmetros de boot](/configuration/Boot-Parameters.md) para o significado em tempo de execução e requisitos de ativação.

## Implantação via linha de comando

`minios-deploy` é destinado à automação, testes e recuperação. O particionamento manual e a configuração interativa de rede cabeada permanecem exclusivos da interface gráfica.

Liste os discos reconhecidos como instaláveis:

```bash
minios-deploy list-disks
```

Substitua `/dev/sdb` em cada exemplo pelo disco de destino verificado. Primeiro, imprima um plano não destrutivo:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Visualize os comandos de implantação correspondentes sem gravar no disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Execute a instalação real somente após conferir o plano, a identidade do destino e a saída do teste. `--yes` autoriza alterações destrutivas:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Para uma instalação nativa em espaço livre existente, use as mesmas opções de armazenamento para planejamento e instalação:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

O modo nativo pode não aparecer na ajuda do CLI em uma imagem que não tenha suporte a instalação nativa. O CLI também aceita opções de configuração para contas, localidade, fuso horário, teclado, nome da máquina, serviços e um `config.conf` base. Verifique as opções exatas fornecidas pela imagem em execução:

```bash
minios-deploy install --help
man minios-deploy
```

Evite `--password` e `--root-password` em ambientes compartilhados, pois argumentos de linha de comando em texto simples podem ser expostos no histórico do shell e na lista de processos. Use o instalador gráfico ou um fluxo de configuração protegido.
