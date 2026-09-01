---
updated: 2026-08-31
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# MiniOS Instalador

O MiniOS Instalador é um assistente GTK e backend de linha de comando para implantar um sistema a partir de uma sessão ao vivo do MiniOS. Gravar ou copiar o MiniOS para uma mídia removível já é um método de instalação; o MiniOS Instalador é a ferramenta de implantação gerenciada usada quando você deseja um layout de destino controlado, configuração de persistência ou conversão nativa opcional.

## Antes de começar

Uma escolha incorreta de destino ou particionamento pode destruir dados. Faça backup dos arquivos importantes, desconecte discos desnecessários e identifique o destino pelo caminho do dispositivo, modelo e capacidade. A confirmação final é o último ponto em que a instalação pode ser cancelada com segurança.

O disco que contém o sistema live MiniOS em execução é excluído da seleção de destino. Para orientações gerais de capacidade, consulte o [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## Modos de instalação

O **Modo Live** copia os módulos MiniOS compactados selecionados e os arquivos de inicialização. O resultado permanece MiniOS: mantém o layout modular do sistema live, a configuração de boot MiniOS, fluxos de trabalho de gerenciamento MiniOS e persistência de sessão opcional.

O **Modo Nativo** cria um desktop Debian convencional a partir da imagem MiniOS selecionada. Ele expande os módulos escolhidos em um sistema de arquivos raiz gravável, mantém o ambiente de desktop selecionado e os aplicativos comuns, remove o runtime live MiniOS e utilitários específicos do live, instala os pacotes Debian necessários, gera um initramfs convencional e instala o bootloader. O instalador detecta suporte nativo a partir da imagem inicializada. Se os metadados necessários do kernel e o contrato de arquitetura EFI estiverem ausentes, o modo de compatibilidade permite apenas a instalação live.

::: warning O modo nativo altera como o sistema é gerenciado
O sistema instalado mantém a experiência familiar do desktop MiniOS — sua aparência, ambiente de desktop selecionado e aplicativos comuns — mas não utiliza mais a arquitetura live MiniOS. Durante a conversão, o instalador remove os pacotes `minios-*` e outros utilitários específicos do live, pois sessões, módulos `.sb`, gerenciamento modular do kernel e configuração de boot live não se aplicam mais. Após a reinicialização, mantenha o sistema como um desktop Debian convencional usando APT, pacotes de kernel Debian, o initramfs padrão e o bootloader instalado. Veja [Sobre MiniOS](/getting-started/About-MiniOS).
:::

Essa implantação é diferente de uma gravação ISO bruta, de uma configuração multiboot ISO-file Ventoy ou de uma instalação live baseada em arquivo. Veja [Métodos de instalação](/installing-minios/Installation-Methods) para entender a diferença.

## Inicie o instalador gráfico

Abra o menu de aplicativos, selecione Sistema e, em seguida, selecione Instalador do MiniOS. Ele também pode ser iniciado a partir do terminal:

```bash
sudo minios-installer
```

O assistente coleta informações sobre modo de instalação, segurança, localização, rede cabeada, teclado, conta, módulo, armazenamento e configurações de boot. Revise a geometria exata das partições e o resumo das operações antes de aceitar a confirmação final destrutiva.

## Layouts de destino e inicialização

O instalador gráfico oferece estas opções de destino quando o disco é elegível:

- Apagar tudo cria uma nova tabela de partições e destrói todos os dados no disco de destino.
- Espaço livre utiliza espaço não alocado adequado sem reduzir um sistema de arquivos existente.
- Ao lado reduz uma partição final ext2, ext3, ext4 ou NTFS elegível e desmontada. Layouts sujos, montados, aninhados, ambíguos ou inseguros são recusados. O instalador pode solicitar antes de baixar ferramentas de sistema de arquivos ausentes.
- Particionamento manual está disponível apenas para conversões nativas na interface gráfica em discos diretos elegíveis. As alterações são preparadas até a confirmação final.

Os layouts automáticos de inicialização são BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funciona com layouts GPT ou MBR primário. BIOS é suportado em MBR primário, não em GPT. Layouts preservados estendidos ou lógicos em MBR não são suportados.

O modo manual pode criar, excluir, formatar e reutilizar partições; reduzir um sistema de arquivos suportado a partir do seu final; atribuir pontos de montagem, uma partição de sistema EFI e swap; e desfazer ou redefinir alterações preparadas. Não há suporte para LVM, RAID, raízes LUKS nativas, armazenamento mapeado ou aninhado, bcache, ZFS ou edição de subvolumes Btrfs. A persistência de sessão LUKS não criptografa um sistema de arquivos raiz nativo.

## Sistemas de arquivos

- Layouts live podem usar ext2, ext4, Btrfs, FAT32 ou NTFS quando as ferramentas necessárias estão instaladas.
- O sistema de arquivos raiz criado pela conversão nativa pode usar ext2, ext4 ou Btrfs. O ext4 é o padrão para uso geral.
- Sistemas de arquivos ext3 existentes podem ser reutilizados ou reduzidos onde suportado, mas ext3 não é oferecido para nova formatação.
- FAT32 é limitado a arquivos menores que 4 GiB e está disponível apenas para layouts live.
- NTFS está disponível apenas para layouts live, embora uma partição NTFS elegível possa ser reduzida para uso ao lado.

O espaço necessário inclui os dados dos módulos selecionados, arquivos de inicialização, persistência solicitada e uma reserva de 25 por cento do sistema de arquivos. Espaço EFI e swap nativo são calculados separadamente.

## Configuração e segurança

O instalador pode definir localidade, fuso horário, teclado, nome de usuário, senhas, grupos de usuários, nome da máquina, serviços, menu de inicialização e seleção de módulos. Ao selecionar um módulo MiniOS superior, os módulos de camadas inferiores obrigatórios são incluídos automaticamente.

Os perfis de segurança são `convenient`, `balanced` e `strict`. O modo live utiliza `convenient` como padrão; a conversão nativa inicia com `balanced`. Os controles de SSH e XRDP são separados do perfil selecionado. Revise os serviços de acesso remoto antes da primeira conexão de rede. Após a conversão nativa, a configuração de segurança segue o fluxo normal de administração de sistemas Debian.

A configuração de rede cobre o nome da máquina e DHCP cabeado ou IPv4 estático. O instalador não cria nem modifica perfis Wi-Fi. A conversão nativa e algumas operações ao lado podem exigir acesso à rede, com seu consentimento, para obter GRUB, EFI, initramfs, `os-prober` ou pacotes de redimensionamento de sistema de arquivos antes de alterar o disco.

## Persistência da sessão live

A persistência se aplica apenas a instalações live:

- O modo de persistência `native` armazena alterações da sessão live diretamente em um sistema de arquivos de destino compatível com POSIX. Apesar do nome, este é um **backend de persistência live** e não está relacionado à instalação nativa. Não é oferecido em FAT32 ou NTFS.
- DynFileFS utiliza um contêiner expansível.
- Raw utiliza uma imagem de tamanho fixo.
- LUKS utiliza uma imagem criptografada criada pelo initrd no primeiro boot. A senha é solicitada na inicialização e nunca é recebida ou armazenada pelo instalador.

Os modos de contêiner têm padrão de 4000 MiB. Contêineres Raw e LUKS não podem exceder 4000 MiB em FAT32; DynFileFS não está sujeito a esse limite de arquivo único. LUKS é oferecido apenas quando tanto o initrd em execução quanto cada initrd de origem copiado anunciam o suporte criptográfico necessário.

As opções de boot resultantes usam `perchmode` e `perchsize`. Veja [Persistência do Initrd](/reference/boot-process/Persistence-Internals) e [Parâmetros de Boot](/reference/Boot-Parameters) para o significado em tempo de execução e requisitos de ativação.

## Implantação via linha de comando

`minios-deploy` é destinado para automação, testes e recuperação. O particionamento manual e a configuração interativa de rede cabeada permanecem exclusivos da interface gráfica.

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

Se você deseja deliberadamente uma conversão nativa em espaço livre existente, use as mesmas opções de armazenamento para planejamento e instalação:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

A conversão nativa pode não aparecer na ajuda da CLI em uma imagem que não tenha suporte para instalação nativa. A CLI também aceita opções de configuração para contas, localidade, fuso horário, teclado, nome da máquina, serviços e um módulo base `config.conf`. Verifique as opções exatas fornecidas pela imagem em execução:

```bash
minios-deploy install --help
man minios-deploy
```

Evite `--password` e `--root-password` em ambientes compartilhados, pois argumentos de linha de comando em texto simples podem ser expostos no histórico do shell e na lista de processos. Use o instalador gráfico ou um fluxo de configuração protegido.
