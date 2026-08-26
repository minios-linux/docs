---
updated: 2026-08-26
---

# Instalação manual baseada em arquivos via USB (Windows/Linux, legado)

Este método legado de instalação do MiniOS envolve copiar os arquivos do sistema diretamente para o dispositivo e instalar o bootloader. Prefira um método atual em [Instalando o MiniOS](/installation/Installing-MiniOS.md), a menos que um layout baseado em arquivos seja especificamente necessário.

**Nota:** Este método funciona apenas no Windows e Linux devido ao uso do bootloader SYSLINUX.

## Importante

**Atenção:** Este procedimento reparticiona e formata o dispositivo selecionado. Ele é destrutivo para todo o dispositivo, não apenas para os arquivos atualmente visíveis nele. Faça backup dos dados importantes e verifique o caminho exato do dispositivo, modelo, capacidade, partição e ponto de montagem antes de executar `fdisk`, `mkfs` ou `bootinst`. Desconecte outros dispositivos removíveis sempre que possível.

## Requisitos do dispositivo

### Tamanho do dispositivo

Consulte o [Guia de compatibilidade de hardware](/installation/Hardware-Compatibility.md) para requisitos detalhados de sistema e tamanhos de dispositivos.

### Requisitos técnicos

- **Sistemas de arquivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partição**: MBR
- **Inicialização EFI**: Ao usar sistemas de arquivos NTFS, exFAT ou ext2/3/4, a inicialização em modo EFI pode não estar disponível. Para suporte EFI, recomenda-se FAT32.

## Criando um pendrive USB inicializável

### Passo 1: Prepare o dispositivo

**Windows:**
1. Abra o "Gerenciamento de Disco" (`Win+R`, depois `diskmgmt.msc`)
2. Confirme o dispositivo USB pelo número do disco, modelo e capacidade. Não continue se houver qualquer dúvida.
3. Clique com o botão direito no volume e selecione "Excluir Volume"
4. Clique com o botão direito no espaço não alocado e selecione "Novo Volume Simples"
5. Escolha o sistema de arquivos: FAT32 (recomendado) ou NTFS

**Linux:**

Defina `TARGET_DISK` e `TARGET_PARTITION` apenas para caminhos exatos após conferir o modelo e a capacidade do dispositivo em `lsblk`. O comando `fdisk` sobrescreve a tabela de partições em todo o disco de destino. Execute apenas um comando `mkfs` para o sistema de arquivos desejado.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Passo 2: Extraia e copie os arquivos

**Montando o ISO:**

*Windows:*
- Clique com o botão direito no arquivo ISO e selecione "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copiando os arquivos:**
1. **Encontre a pasta `/minios/`** no ISO montado
2. **Copie toda a pasta `/minios/`** para a raiz do pendrive USB

No Linux, a raiz de destino no exemplo acima é `/mnt/minios-target`. Confirme que `findmnt --mountpoint /mnt/minios-target` mostra exatamente a partição selecionada no Passo 1 antes de copiar os arquivos.

### Passo 3: Instale o bootloader

Acesse a pasta `/minios/boot/syslinux/` no dispositivo e execute o instalador:

`bootinst` grava o código de boot no disco a partir da localização do instalador. Leia [Recuperação de Boot](/administration/Boot-Recovery.md) antes de alterar o código de boot e não execute o instalador até que o dispositivo e o ponto de montagem estejam verificados.

**Windows:**
- Abra o pendrive USB verificado pela letra de unidade exata, acesse `minios\boot\syslinux` e execute `bootinst.bat` **como administrador**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Não use curingas para o ponto de montagem. O script identifica o disco de destino a partir de sua própria localização e grava o código de boot nesse disco.

## Resultado e persistência

Este procedimento cria uma instalação live baseada em arquivos ao colocar a árvore `minios/` e o bootloader em um sistema de arquivos normal. Não é uma gravação bruta de ISO, nem uma configuração multiboot de arquivo ISO, nem uma implantação do Instalador do MiniOS.

O sistema de arquivos escolhido afeta quais backends de persistência podem funcionar, mas não habilita a persistência nem garante que uma sessão será criada. A persistência só é ativada quando uma entrada de boot ou a linha de comando do kernel solicita, e a ativação ainda exige armazenamento gravável adequado. Consulte [Modos de Boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de depender de alterações salvas.
