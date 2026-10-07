---
updated: 2026-10-06
program_commits:
    minios-installer: ecabe245a5eaff606ce06f034af334b399f4c3b3
---

# Instalador do MiniOS

O Instalador do MiniOS é um assistente GTK e backend de linha de comando para implantar um sistema a partir de uma sessão live do MiniOS em execução. Gravar ou copiar o MiniOS para uma mídia removível já é um método de instalação; o Instalador do MiniOS é a ferramenta de implantação gerenciada usada quando você deseja um layout de destino controlado, configuração de persistência ou conversão nativa opcional.

## Antes de começar

Uma escolha incorreta de destino ou particionamento pode destruir dados. Faça backup dos arquivos importantes, desconecte discos desnecessários e identifique o destino pelo caminho do dispositivo, modelo e capacidade. A confirmação final é o último ponto em que a instalação pode ser cancelada com segurança.

O disco que contém o sistema live MiniOS em execução é excluído da seleção de destino. Para orientações gerais de capacidade, consulte o [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## Modos de instalação

**Modo live** copia os módulos MiniOS compactados selecionados e os arquivos de boot. O resultado permanece MiniOS: mantém o layout modular do sistema live, configuração de boot MiniOS, fluxos de trabalho de gerenciamento MiniOS e persistência de sessão opcional.

**Modo nativo** cria um desktop Debian convencional a partir da imagem MiniOS selecionada. Expande os módulos escolhidos em um sistema de arquivos raiz gravável, mantém o ambiente de desktop e os aplicativos selecionados, remove o runtime live MiniOS e utilitários específicos do live, instala os pacotes Debian necessários, gera um initramfs convencional e instala o bootloader. O instalador detecta suporte nativo a partir da imagem inicializada. Se os metadados do kernel e o contrato de arquitetura EFI necessários estiverem ausentes, o modo de compatibilidade permite apenas a instalação live.

::: warning O modo nativo altera como o sistema é gerenciado
O sistema instalado mantém a experiência familiar do desktop MiniOS — aparência, ambiente de desktop e aplicativos escolhidos — mas não utiliza mais a arquitetura live MiniOS. Durante a conversão, o instalador remove os `minios-*` pacotes e outros utilitários específicos do live, pois sessões, `.sb` módulos, gerenciamento modular do kernel e configuração de boot live não se aplicam mais. Após reiniciar, mantenha o sistema como um desktop Debian convencional usando APT, pacotes de kernel Debian, initramfs padrão e o bootloader instalado. Consulte [Sobre MiniOS](/getting-started/About-MiniOS).
:::

Esta implantação é diferente de uma gravação ISO bruta, de uma configuração multiboot de arquivo ISO Ventoy ou de uma instalação live baseada em arquivos. Veja [Métodos de instalação](/installing-minios/Installation-Methods) para entender a diferença.

## Inicie o instalador gráfico

Abra o menu de aplicativos, selecione Sistema e depois Instalador do MiniOS. Também pode ser iniciado pelo terminal:

```bash
sudo minios-installer
```

O assistente coleta as configurações de modo de instalação, segurança, localização, rede cabeada, teclado, conta, módulo, armazenamento e boot. Revise a geometria exata das partições e o resumo das operações antes de aceitar a confirmação final destrutiva.

## Opções de posicionamento e layouts de boot

O instalador gráfico oferece estas opções de posicionamento quando o destino é elegível:

- Apagar tudo cria uma nova tabela de partições e destrói todos os dados no disco de destino.
- Espaço livre utiliza o espaço não alocado disponível sem reduzir o tamanho de um sistema de arquivos existente.
- Ao lado reduz uma partição final ext2, ext3, ext4 ou NTFS elegível e desmontada. Layouts sujos, montados, aninhados, ambíguos ou inseguros são recusados. O instalador pode solicitar confirmação antes de baixar ferramentas de sistema de arquivos ausentes.
- O particionamento manual está disponível apenas para conversões nativas na interface gráfica em discos diretos elegíveis. As alterações são preparadas até a confirmação final.

Os layouts automáticos de boot são BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funciona com layouts GPT ou MBR primário. BIOS é suportado apenas em MBR primário, não em GPT. Layouts MBR estendidos ou lógicos não são suportados.

O modo manual permite criar, excluir, formatar e reutilizar partições; reduzir um sistema de arquivos suportado pelo final; atribuir pontos de montagem, uma partição EFI e swap; além de desfazer ou redefinir alterações preparadas. Não há suporte para LVM, RAID, raízes LUKS nativas, armazenamento mapeado ou aninhado, bcache, ZFS ou edição de subvolumes Btrfs. A criptografia LUKS2 para uma sessão live persistente não criptografa o sistema de arquivos raiz nativo.

## Sistemas de arquivos

- Layouts live podem usar ext2, ext4, Btrfs, FAT32 ou NTFS quando as ferramentas necessárias estão instaladas.
- O sistema de arquivos raiz criado por conversão nativa pode ser ext2, ext4 ou Btrfs. Ext4 é o padrão para uso geral.
- Sistemas de arquivos ext3 existentes podem ser reutilizados ou reduzidos onde houver suporte, mas ext3 não é oferecido para nova formatação.
- FAT32 é limitado a arquivos menores que 4 GiB e está disponível apenas para layouts live.
- NTFS está disponível apenas para layouts live, embora uma partição NTFS elegível possa ser reduzida para instalação ao lado.

O espaço necessário inclui os dados dos módulos selecionados, arquivos de boot, persistência solicitada e uma reserva de 25% do sistema de arquivos. Espaço EFI e swap nativo são calculados separadamente.

## Configuração e segurança

O instalador pode definir localidade, fuso horário, teclado, nome de usuário, senhas, grupos de usuários, hostname, serviços, menu de boot e seleção de módulos. Selecionar um módulo MiniOS superior inclui suas camadas inferiores obrigatórias.

Perfis de segurança são `convenient`, `balanced` e `strict`. O modo live utiliza por padrão `convenient`; a conversão nativa inicia de `balanced`. Os controles de SSH e XRDP são separados do perfil selecionado. Revise os serviços de acesso remoto antes da primeira conexão de rede. Após a conversão nativa, a configuração de segurança segue o fluxo normal de administração do sistema Debian.

A configuração de rede abrange o hostname e DHCP cabeado ou IPv4 estático. O instalador não cria nem modifica perfis de Wi-Fi. A conversão nativa e algumas operações ao lado podem precisar de acesso à rede, com seu consentimento, para obter GRUB, EFI, initramfs, `os-prober`, ou pacotes de redimensionamento de sistema de arquivos antes das alterações no disco.

## Persistência da sessão live

A persistência se aplica apenas a instalações live. Quando `minios-session` está disponível, o Instalador do MiniOS pode criar e ativar uma sessão real numerada diretamente no destino antes do fim da instalação. **Configurar automaticamente no primeiro boot** pula esta etapa; MiniOS pode então criar o armazenamento da sessão depois, usando sua lógica normal de persistência no boot.

O instalador oferece estes backends de armazenamento quando o sistema em execução e o destino os suportam:

- `native` armazena as alterações da sessão live diretamente no diretório da sessão em um sistema de arquivos compatível com POSIX. Apesar do nome, este é um **backend de persistência live** e não está relacionado à instalação nativa. Não é oferecido em FAT32 ou NTFS.
- DynFileFS cria um armazenamento expansível baseado em arquivo ext4. O tamanho selecionado é o máximo lógico, não o espaço reservado antecipadamente. O tamanho padrão é 4000 MiB.
- DynBlk cria um sistema de arquivos ext4 em um dispositivo de bloco fino fornecido pelo driver de kernel DynBlk. Os dados da sessão são armazenados em arquivos segmentados `volumeNNN.db` que são alocados conforme necessário, então o tamanho selecionado é um máximo lógico, não uso de disco pré-alocado. O instalador define sessões DynBlk novas como padrão em 16384 MiB. Para sessões DynBlk não criptografadas, o instalador pode selecionar um codec de compactação suportado tanto pelo sistema em execução quanto pelo initrd copiado para o destino.
- VMDK utiliza o driver DynBlk para criar armazenamento VMDK padrão dividido e esparso (`volume.vmdk` e `volume-sNNN.vmdk`). Possui o mesmo modelo de alocação fina e padrão de 16384 MiB que DynBlk, mas não há compactação no backend.
- Raw cria uma imagem ext4 de tamanho fixo e reserva a capacidade selecionada imediatamente. O tamanho padrão é 4000 MiB.

LUKS2 é uma camada de criptografia separada que pode envolver armazenamento de sessão Raw, DynFileFS, DynBlk ou VMDK. O instalador coleta a senha confirmada apenas para a criação da sessão, envia-a para `minios-session` pela entrada padrão e não a coloca em argumentos de linha de comando, logs ou configurações persistentes. A senha será exigida ao desbloquear a sessão criptografada no boot. LUKS2 só é oferecido quando o ambiente em execução e o initrd copiado para o destino anunciam suporte compatível. A compactação DynBlk é desativada quando LUKS2 é selecionado.

DynBlk e armazenamento de sessão VMDK não estão disponíveis enquanto o UEFI Secure Boot estiver ativado, pois o módulo de kernel externo DynBlk usado por esses backends não é assinado por MiniOS. Contêineres Raw são limitados a 4000 MiB em FAT32; DynFileFS, DynBlk e armazenamento VMDK dividido não dependem de um arquivo exceder o limite de 4 GiB do FAT32, embora seus próprios limites de backend e espaço livre ainda se apliquem.

Como o instalador cria e ativa a sessão selecionada no destino, não depende de `perchmode` e `perchsize` para criar esse armazenamento no primeiro boot. Esses parâmetros de boot ainda descrevem a criação e seleção de persistência pelo initrd fora do caminho de pré-criação de sessão do instalador. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence), [Persistência no initrd](/reference/boot-process/Persistence-Internals), e [Parâmetros de boot](/reference/Boot-Parameters).

## Implantação por linha de comando

`minios-deploy` é destinado à automação, testes e recuperação. O particionamento manual e a configuração interativa de rede cabeada permanecem disponíveis apenas na interface gráfica.

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

Execute a instalação real somente após verificar o plano, a identidade do destino e a saída do teste. `--yes` autoriza alterações destrutivas:

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

A conversão nativa pode não aparecer na ajuda da CLI em uma imagem sem suporte a instalação nativa. A CLI também aceita opções de configuração para contas, localidade, fuso horário, teclado, hostname, serviços e um `config.conf` base. Verifique as opções exatas fornecidas pela imagem em execução:

```bash
minios-deploy install --help
man minios-deploy
```

Evite `--password` e `--root-password` em ambientes compartilhados, pois argumentos em texto simples na linha de comando podem ser expostos no histórico do shell e na lista de processos. Use o instalador gráfico ou um fluxo de configuração protegido.
