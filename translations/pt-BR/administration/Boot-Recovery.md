# Recuperação de boot

O reparo do boot depende de como o MiniOS foi colocado no dispositivo e se o firmware o inicia em modo BIOS ou UEFI. Um procedimento para uma configuração pode danificar outra. Faça backup dos arquivos importantes antes de gravar um setor de boot, alterar uma flag de partição, substituir uma árvore EFI ou reinstalar o GRUB. Consulte [Backup e recuperação](/administration/Backup-Recovery.md). Se o tipo de instalação for incerto, compare com [Modos de boot](/configuration/Boot-Modes.md) antes de escolher um fluxo de reparo.

## Identifique o layout

- **ISO gravado em modo bruto:** `dd`, Etcher, Rufus no modo DD ou outro gravador de imagem semelhante copiou o layout de blocos do ISO para todo o dispositivo. Trate isso como uma mídia de imagem, não como uma instalação normal baseada em arquivos.
- **Instalação live baseada em arquivos:** o dispositivo possui um sistema de arquivos normal com um diretório `minios/` contendo módulos SquashFS e `minios/boot/`. Isso inclui o método legado de cópia de arquivos e implantações live feitas pelo Instalador do MiniOS.
- **Instalação nativa:** o Instalador do MiniOS expandiu os módulos em um sistema de arquivos raiz Linux convencional. Utiliza o GRUB e o initramfs do sistema instalado, em vez do layout modular de boot live.

`Ventoy` normalmente mantém o ISO como um arquivo sob seu próprio bootloader. Faça o reparo seguindo o procedimento na documentação `Ventoy`; não instale o setor de boot Syslinux do MiniOS sobre ele.

## Diagnóstico sem alterar o disco

Primeiro, confirme se a falha ocorre antes do menu do MiniOS, após o menu ou depois que o kernel inicia. Verifique o menu de boot único do firmware e registre se a entrada selecionada é UEFI ou BIOS legado. Teste outra porta e, quando possível, faça o boot do mesmo dispositivo em outro computador.

A partir de uma mídia de resgate Linux funcional, inspecione ao invés de reparar:

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

Em um sistema iniciado em modo UEFI, `sudo efibootmgr -v` pode listar as entradas do firmware. Sua ausência ou um erro não provam que os arquivos EFI estão faltando. Não formate, reparticione, execute reparo de sistema de arquivos ou altere flags apenas para testar. Confirme cada dispositivo pelo modelo e capacidade e monte os sistemas de arquivos como somente leitura ao inspecioná-los.

Se o menu de boot aparecer, mas o MiniOS não encontrar seus módulos, edite a entrada de boot temporariamente e tente `from=askdisk`. Uma vez conhecido o sistema de arquivos correto, um rótulo (label) é mais estável do que um nome como `/dev/sdb1`:

```text
from=/dev/disk/by-label/MINIOS/minios
```

O rótulo deve existir e identificar o sistema de arquivos pretendido; rótulos devem ser únicos. Adicione `debug timing` para mais informações no início do boot. Adicione `rd.break` apenas quando for necessário um shell do initramfs para inspeção avançada. Essas opções diagnosticam a descoberta de módulos; elas não reparam o bootloader. Consulte [Descoberta do sistema Initrd](/configuration/Initrd-System-Discovery.md) para os formatos suportados de `from=`, comportamento de `askdisk` e precedência de origem. Veja também [Parâmetros de boot](/configuration/Boot-Parameters.md) e [Solução de problemas](/administration/Troubleshooting.md).

## Mídia ISO gravada em modo bruto

Não execute `bootinst.sh`, não instale o GRUB nem copie arquivos de boot individuais para um dispositivo ISO gravado em modo bruto. Seu mapa de partição, registros de boot, arquivos ISO e arquivos EFI formam uma única imagem. Se o ISO verificado inicializa em outro lugar, mas esta cópia não, preserve qualquer dado armazenado fora do layout da imagem e regrave todo o dispositivo a partir de um ISO verificado. Consulte [Verificando downloads](/installation/Verifying-Downloads.md) e [Instalando o MiniOS](/installation/Installing-MiniOS.md).

Se regravar a mesma imagem verificada ainda falhar, teste outro dispositivo e verifique a compatibilidade do firmware e do hardware em vez de modificar repetidamente a imagem.

## Instalações live baseadas em arquivos

### Instalador agrupado em mídia MBR

O instalador agrupado só é adequado quando todas estas condições forem verdadeiras:

- O dispositivo é uma instalação live baseada em arquivos em um disco particionado como MBR.
- O diretório `minios/boot/syslinux/` está completo e pertence à mesma árvore e versão do MiniOS que os outros arquivos de boot.
- O sistema de arquivos montado e seu dispositivo de disco inteiro pai foram identificados sem suposições.

Execute o script a partir desse diretório no sistema de arquivos de destino:

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

O script determina seu destino a partir do sistema de arquivos que contém o script. Ele instala o Syslinux ali, grava 440 bytes de código de boot MBR no disco pai, pode alterar o flag de partição ativa e copia a árvore de carregador UEFI agrupada para o sistema de arquivos de destino. Um ponto de montagem ou dispositivo incorreto pode tornar outro sistema não inicializável. Não utilize em disco GPT ou em uma Partição do Sistema EFI compartilhada, não copie apenas `bootinst.sh` para uma árvore danificada e execute, e não utilize arquivos de uma versão diferente do MiniOS.

No Windows, o caminho correspondente é:

```text
X:\minios\boot\syslinux\bootinst.bat
```

Execute como administrador apenas a partir do dispositivo removível pretendido. O script recusa o disco do sistema Windows detectado, mas essa verificação não substitui a conferência da letra da unidade e do dispositivo físico.

### UEFI

O boot por UEFI não utiliza o código MBR do BIOS. O firmware precisa de uma Partição do Sistema EFI ou sistema de arquivos FAT legível e uma árvore de carregador válida. Restaure apenas uma árvore `EFI/boot` completa e correspondente, junto com os arquivos EFI do MiniOS relacionados, a partir da imagem ou backup exato usado para aquela instalação. Não combine executáveis EFI de uma versão com a configuração GRUB ou arquivos `minios/boot` de outra versão.

O `bootinst.sh` agrupado também copia sua árvore de carregador UEFI correspondente, mas ainda realiza as gravações de MBR e Syslinux descritas acima. Use-o apenas para o layout MBR baseado em arquivos abordado na seção anterior, não como uma ferramenta genérica de reparo UEFI.

Copiar apenas um arquivo `.efi` pode deixar a cadeia de carregamento incompleta. Se a árvore EFI exata e completa não estiver disponível, reinstale o layout live baseado em arquivos em vez de tentar uma reconstrução parcial. Preserve diretórios de outros fornecedores e sistemas operacionais em uma Partição do Sistema EFI compartilhada.

`minios-deploy` fornece operações de `plan` e `install`, não uma operação de reparo de boot. Não aponte um comando de instalação para um disco existente como tentativa de reparo. Veja [MiniOS Installer](/installation/MiniOS-Installer.md) para layouts de instalação suportados.

## Instalações nativas

### GRUB BIOS a partir de um chroot

Use este procedimento apenas para uma instalação nativa feita para BIOS legado em disco MBR. Ele grava o GRUB em todo o disco e pode substituir o código de boot usado por outros sistemas operacionais. Não use para UEFI, GPT, layout live baseado em arquivos ou ISO gravado em modo bruto.

Inicialize uma mídia de resgate Linux confiável, identifique a partição raiz nativa e seu disco pai e substitua seus caminhos reais abaixo. Neste exemplo apenas, `/dev/sdXN` é a partição raiz e `/dev/sdX` é seu disco inteiro pai. Nunca passe uma partição como `/dev/sdX1` para o comando final `grub-install`.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Monte uma partição `/boot` nativa separada em `/mnt/boot` antes dos bind mounts e desmonte-a antes do `sudo umount /mnt` final. Não monte uma Partição do Sistema EFI para este procedimento exclusivo de BIOS. Se a raiz usar LUKS, LVM, RAID ou um layout não totalmente compreendido, pare e use um método de recuperação específico para esse stack de armazenamento. Se `update-grub`, `grub-script-check` ou `grub-install` falhar, não continue alterando a tabela de partição ou tentando outros discos.

### UEFI nativo

A reconstrução manual do UEFI nativo não é segura para generalizar. Ela depende da arquitetura EFI exata, cadeia de carregadores, estado dos pacotes, layout de montagem, estado do Secure Boot, comportamento do firmware e se a Partição do Sistema EFI é compartilhada. Uma cópia genérica de arquivos ou comando `grub-install` pode sobrescrever o carregador de fallback de outro sistema operacional.

Prefira restaurar um backup exato e testado da raiz nativa, conteúdo da Partição do Sistema EFI e configuração de boot. Caso contrário, faça backup dos dados do usuário e reinstale o sistema nativo com o Instalador do MiniOS. Não adapte o procedimento de cópia live baseado em arquivos `EFI/boot` para uma instalação nativa.

## Reversão modular do kernel

Para uma instalação ao vivo baseada em arquivos que parou de inicializar após uma alteração no kernel,
utilize uma mídia de resgate da mesma versão e arquitetura do MiniOS. No menu de inicialização,
use `from=askdisk` ou um caminho de rótulo estável para selecionar a árvore instalada de
`minios/`. A árvore selecionada deve conter um triplo completo que corresponda ao kernel já carregado pela mídia de resgate; o initrd não pode alternar o kernel em execução. Consulte
[coordenação do kernel em execução](/configuration/Initrd-Module-Loading.md)
para os caminhos e comportamentos exatos do módulo, imagem do kernel e initramfs.

Se essa combinação resultar em um sistema funcional e a árvore instalada for gravável, inspecione os conjuntos de kernel coordenados e ative um que seja conhecido por funcionar:

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

A ativação deve restaurar um módulo de kernel coordenado, imagem do kernel, initramfs
e configuração do bootloader. Não substitua apenas `vmlinuz`, apenas o initramfs
ou apenas `01-kernel*.sb`. Mantenha o kernel empacotado anterior até que a substituição
inicialize com sucesso. Consulte
[Gerenciamento de Kernel](/administration/Kernel-Management.md).

Esta reversão é para instalações ao vivo modulares. Instalações nativas utilizam seus próprios pacotes de kernel instalados e GRUB, e precisam de recuperação nativa ou reinstalação.

## Quando reinstalar

Faça backup dos dados recuperáveis e reinstale em vez de reparar quando qualquer uma destas condições se aplicar:

- Um ISO gravado em modo bruto está corrompido ou foi modificado parcialmente.
- Não estão disponíveis Syslinux, GRUB, kernel, initramfs ou arquivos EFI completos e correspondentes.
- A tabela de partição, sistema de arquivos ou Partição do Sistema EFI está danificada além do bootloader.
- O disco de destino ou dispositivo pai não pode ser identificado com certeza.
- Uma cadeia de carregadores UEFI nativa teria que ser reconstruída sem um backup exato.
- Erros de leitura repetidos, desconexões ou erros SMART indicam mídia com falha.
- Um comando de reparo falha e o próximo passo exigiria suposições ou sobrescrever dados de boot não relacionados.

A reinstalação restaura um layout de boot coordenado conhecido; ela não recupera dados de usuário não salvos nem persistência. Copie os dados importantes primeiro sempre que o sistema de arquivos permanecer legível.
