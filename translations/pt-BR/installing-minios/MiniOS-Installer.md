---
updated: 2026-10-15
program_commits:
    minios-installer: e895f8065faef84356f9c1cda4dbfa97700b0370
---

# Instalador do MiniOS

O Instalador do MiniOS é um assistente GTK e um backend de linha de comando para implantar um sistema a partir de uma sessão live do MiniOS. Gravar ou copiar o MiniOS em uma mídia removível já é um método de instalação; o Instalador do MiniOS é a ferramenta de implantação gerenciada usada quando você precisa controlar o layout de destino, configurar a persistência ou fazer uma conversão nativa opcional.

## Antes de começar

Escolher o destino ou o particionamento incorreto pode destruir dados. Faça backup dos arquivos importantes, desconecte os discos desnecessários e identifique o destino pelo caminho do dispositivo, modelo e capacidade. A confirmação final é o último momento em que ainda é possível cancelar a instalação com segurança.

O disco que contém o sistema live do MiniOS em execução não pode ser selecionado como destino. Para orientações gerais sobre capacidade, consulte o [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## Modos de instalação

**Modo live** copia os módulos compactados selecionados do MiniOS e os arquivos de inicialização. O resultado continua sendo MiniOS: mantém o layout modular do sistema live, a configuração de inicialização do MiniOS, os fluxos de gerenciamento do MiniOS e a persistência opcional da sessão.

**Modo nativo** cria um desktop Debian convencional a partir da imagem selecionada do MiniOS. Expande os módulos selecionados em um sistema de arquivos raiz gravável, mantém o ambiente de desktop selecionado e os aplicativos comuns, remove o ambiente de execução live do MiniOS e os utilitários específicos do sistema live, instala os pacotes Debian necessários, gera um initramfs convencional e instala o carregador de inicialização. O instalador detecta o suporte ao modo nativo com base na imagem inicializada. Se os metadados necessários do kernel e os requisitos de arquitetura EFI estiverem ausentes, o modo de compatibilidade permite apenas a instalação live.

::: warning O modo nativo muda a forma de gerenciar o sistema
O sistema instalado mantém a experiência familiar de desktop do MiniOS — sua aparência, o ambiente de desktop selecionado e os aplicativos comuns —, mas deixa de usar a arquitetura live do MiniOS. Durante a conversão, o instalador remove os `minios-*` pacotes e outros utilitários específicos do sistema live, pois sessões, `.sb` módulos, o gerenciamento modular do kernel e a configuração de inicialização live deixam de se aplicar. Após reiniciar, gerencie o sistema como um desktop Debian convencional, usando APT, os pacotes de kernel do Debian, o initramfs padrão e o carregador de inicialização instalado. Consulte [Sobre MiniOS](/getting-started/About-MiniOS).
:::

Esta implantação é diferente de gravar uma ISO sem alterações, configurar multiboot com arquivos ISO do Ventoy ou fazer uma instalação live baseada em arquivos. Consulte [Métodos de instalação](/installing-minios/Installation-Methods) para entender a diferença.

## Iniciar o instalador gráfico

Abra o Instalador do MiniOS pelo menu de aplicativos da categoria **MiniOS**. Também é possível iniciá-lo pelo terminal; quando necessário, será solicitada autorização de administrador:

```bash
minios-installer
```

O assistente reúne as configurações do modo de instalação, segurança, localização, rede cabeada, teclado, conta, módulos, armazenamento e inicialização. Confira a geometria exata das partições e o resumo das operações antes de aceitar a confirmação final de destruição de dados.

## Opções de instalação e layouts de boot

O instalador gráfico oferece estas opções de instalação quando o destino é compatível:

- Apagar tudo cria uma nova tabela de partições e destrói todos os dados do disco de destino.
- Espaço livre usa espaço não alocado adequado sem reduzir um sistema de arquivos existente.
- Instalar ao lado reduz uma partição ext2, ext3, ext4 ou NTFS elegível, desmontada e localizada no final do disco. Layouts com inconsistências, montados, aninhados, ambíguos ou que apresentem outros riscos não são aceitos. O instalador pode solicitar autorização antes de baixar ferramentas de sistema de arquivos ausentes.
- O particionamento manual está disponível apenas para conversões nativas na interface gráfica, em discos diretos compatíveis. As alterações ficam preparadas até a confirmação final.

Os layouts de boot automáticos são BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funciona com layouts GPT ou MBR primário. BIOS é compatível com MBR primário, mas não com GPT. Layouts MBR preservados com partições estendidas ou lógicas não são compatíveis.

Para **Apagar tudo** no modo Live, **Automático** seleciona MBR mesmo quando o instalador é iniciado com UEFI. Os destinos Live com MBR mantêm os arquivos EFI e recebem um bootloader BIOS, sendo compatíveis com os dois modos de firmware. Discos com 2 TiB ou mais exigem a seleção explícita de **UEFI/GPT**; destinos Live com GPT são compatíveis apenas com UEFI. A opção nativa Apagar tudo segue uma política separada, que depende do firmware. As instalações em espaço livre ou ao lado mantêm a tabela de partições existente.

O modo manual permite criar, excluir, formatar e reutilizar partições; reduzir um sistema de arquivos compatível a partir do final; atribuir pontos de montagem, uma partição de sistema EFI e espaço de swap; e desfazer ou redefinir alterações preparadas. Não há suporte a LVM, RAID, raízes nativas em LUKS, armazenamento mapeado ou aninhado, bcache, ZFS ou edição de subvolumes Btrfs. A criptografia LUKS2 de uma sessão Live persistente não criptografa um sistema de arquivos raiz nativo.

## Sistemas de arquivos

- Layouts Live podem usar ext2, ext4, Btrfs, FAT32 ou NTFS, desde que as ferramentas necessárias estejam instaladas.
- O sistema de arquivos raiz criado pela conversão nativa pode usar ext2, ext4 ou Btrfs. Ext4 é a opção padrão para uso geral.
- Sistemas de arquivos ext3 existentes podem ser reutilizados ou reduzidos quando houver suporte, mas ext3 não é oferecido para novas formatações.
- O FAT32 limita o tamanho dos arquivos a menos de 4 GiB e está disponível apenas para layouts Live.
- O NTFS está disponível apenas para layouts Live, embora uma partição NTFS elegível possa ser reduzida para instalação ao lado.

O espaço necessário inclui os dados dos módulos selecionados, os arquivos de boot, a persistência solicitada e uma reserva de 25% do sistema de arquivos. O espaço para EFI e swap nativo é calculado separadamente.

## Configuração e segurança

O instalador pode definir localidade, fuso horário, teclado, nome de usuário, senhas, grupos de usuários, nome do host, serviços, menu de boot e seleção de módulos. A seleção de uma camada de sistema superior inclui as camadas inferiores necessárias. Os módulos personalizados de `minios/modules/` são selecionados de forma independente, mesmo quando seus nomes de arquivo se parecem com os de módulos de sistema ou do kernel.

Os perfis de segurança são `convenient`, `balanced` e `strict`. No modo Live, o padrão é `convenient`; a conversão nativa começa com `balanced`. Os controles de SSH e XRDP são independentes do perfil selecionado. Revise os serviços de acesso remoto antes da primeira conexão à rede. Após a conversão nativa, a configuração de segurança subsequente segue o fluxo normal de administração de sistemas Debian.

A configuração de rede abrange o nome do host e o DHCP cabeado ou o IPv4 estático. O instalador não cria nem modifica perfis de Wi-Fi. A conversão nativa e algumas operações de instalação ao lado podem precisar de acesso à rede, com sua autorização, para obter pacotes do GRUB, EFI, initramfs, `os-prober` ou de redimensionamento de sistemas de arquivos antes de alterar o disco.

## Persistência da sessão Live

A persistência se aplica apenas a instalações Live. Quando `minios-session` estiver disponível, o MiniOS Instalador poderá criar e ativar uma sessão numerada real diretamente no destino antes de concluir a instalação. **Configurar automaticamente na primeira inicialização** ignora esta etapa; o MiniOS poderá então criar o armazenamento da sessão mais tarde, usando o mecanismo normal de persistência durante a inicialização.

O instalador oferece estas opções de armazenamento quando o sistema em execução e o destino são compatíveis:

- `native` armazena as alterações da sessão Live diretamente no diretório da sessão, em um sistema de arquivos de destino compatível com POSIX. Apesar do nome, este é um **backend de persistência Live** e não tem relação com a instalação nativa. Não é oferecido para FAT32 ou NTFS.
- DynFileFS cria um armazenamento ext4 expansível baseado em arquivo. O tamanho selecionado é o limite lógico, não o espaço reservado antecipadamente. O tamanho padrão é 4000 MiB.
- DynBlk cria um sistema de arquivos ext4 em um dispositivo de bloco thin fornecido pelo driver de kernel DynBlk. Os dados da sessão são armazenados em arquivos `volumeNNN.db` segmentados, alocados conforme necessário; por isso, o tamanho selecionado é um limite lógico, não o uso de disco pré-alocado. Para novas sessões DynBlk, o tamanho padrão do instalador é 16384 MiB. Para sessões DynBlk sem criptografia, o instalador pode selecionar um codec de compactação compatível tanto com o sistema em execução quanto com o initrd copiado para o destino.
- O VMDK usa o driver DynBlk para criar um armazenamento VMDK esparso dividido padrão (`volume.vmdk` e `volume-sNNN.vmdk`). Ele usa o mesmo modelo de alocação thin e o mesmo tamanho padrão de 16384 MiB que DynBlk, mas não oferece compactação no backend.
- Raw cria uma imagem ext4 de tamanho fixo e reserva imediatamente a capacidade selecionada. O tamanho padrão é 4000 MiB.

LUKS2 é uma camada de criptografia separada que pode encapsular o armazenamento de sessão Raw, DynFileFS, DynBlk ou VMDK. Para criar a sessão, o instalador solicita a frase secreta confirmada, envia-a ao `minios-session` pela entrada padrão e não a inclui em argumentos de linha de comando, logs ou configurações persistentes. A frase secreta será necessária para desbloquear a sessão criptografada durante a inicialização. O LUKS2 só é oferecido quando o ambiente em execução e o initrd copiado para o destino anunciam suporte compatível. A compactação de DynBlk é desativada quando LUKS2 é selecionado.

DynBlk e o armazenamento de sessão VMDK não estão disponíveis enquanto o UEFI Secure Boot estiver ativado, pois o módulo de kernel externo DynBlk usado por esses backends não é assinado pelo MiniOS. Em FAT32, os contêineres Raw têm limite de 4000 MiB. DynFileFS, DynBlk e o armazenamento VMDK dividido não dependem de um único arquivo maior que o limite de 4 GiB do FAT32, embora continuem sujeitos aos limites do próprio backend e do espaço livre.

Como o instalador cria e ativa a sessão selecionada no destino, ele não depende de `perchmode` nem de `perchsize` para criar esse armazenamento na primeira inicialização. Esses parâmetros de boot ainda descrevem a criação e a seleção de persistência acionadas pelo initrd, fora do fluxo de sessão pré-criada do instalador. Consulte [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence), [Persistência do initrd](/reference/boot-process/Persistence-Internals) e [Parâmetros de boot](/reference/Boot-Parameters).

<a id="command-line-deployment"></a>

## Instalação pela linha de comando

`minios-deploy` é voltada para automação, testes e recuperação. O particionamento manual e a configuração interativa de redes cabeadas estão disponíveis apenas na interface gráfica.

Liste os discos reconhecidos como disponíveis para instalação:

```bash
minios-deploy list-disks
```

Substitua `/dev/sdb` em cada exemplo pelo disco de destino verificado. Primeiro, exiba um plano que não faça alterações:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Confira os comandos de implantação correspondentes sem gravar no disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Execute a instalação real somente depois de verificar o plano, a identidade do destino e a saída da simulação. `--yes` autoriza alterações destrutivas:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Se você quiser converter deliberadamente para uma instalação nativa usando o espaço livre existente, use as mesmas opções de armazenamento no planejamento e na instalação:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

A conversão nativa pode não aparecer na ajuda da CLI em uma imagem sem suporte à instalação nativa. A CLI também aceita opções de configuração para contas, localidade, fuso horário, teclado, nome do host, serviços e uma `config.conf` base. Confira as opções exatas disponíveis na imagem em execução:

```bash
minios-deploy install --help
man minios-deploy
```

Evite `--password` e `--root-password` em ambientes compartilhados, pois argumentos de linha de comando em texto simples podem ficar expostos no histórico do shell e na lista de processos. Em vez disso, use o instalador gráfico ou um fluxo de configuração protegido.
