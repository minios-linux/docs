# Método de instalação original (Windows/Linux, legado)

Este método legado de instalação do MiniOS consiste em copiar os arquivos do sistema diretamente para o drive e instalar o bootloader. Prefira um método atual em [Instalando o MiniOS](/installation/Installing-MiniOS.md), a menos que um layout baseado em arquivos seja especificamente necessário.

**Nota:** Este método funciona apenas no Windows e Linux devido ao uso do bootloader SYSLINUX.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados. Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do drive

### Tamanho do drive

Consulte o [Guia de compatibilidade de hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de drive.

### Requisitos técnicos

- **Sistemas de arquivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partição**: MBR
- **Boot EFI**: Ao usar sistemas de arquivos NTFS, exFAT ou ext2/3/4, o boot em modo EFI pode não estar disponível. Para suporte EFI, recomenda-se FAT32.

## Criando um pendrive USB bootável

### Passo 1: Preparar o drive

**Windows:**
1. Abra o "Gerenciamento de Disco" (`Win+R`, depois `diskmgmt.msc`)
2. Localize o pendrive USB, clique com o botão direito e selecione "Excluir Volume"
3. Clique com o botão direito no espaço não alocado e selecione "Novo Volume Simples"
4. Escolha o sistema de arquivos: FAT32 (recomendado) ou NTFS

**Linux:**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Passo 2: Extraia e copie os arquivos

**Montando o ISO:**

*Windows:*
- Clique com o botão direito no arquivo ISO e selecione "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copiando os arquivos:**
1. **Encontre a pasta `/minios/`** no ISO montado
2. **Copie toda a pasta `/minios/`** para a raiz do pendrive USB

### Etapa 3: Instale o bootloader

Navegue até a pasta `/minios/boot/syslinux/` na unidade e execute o instalador:

**Windows:**
- Execute `bootinst.bat` **como administrador**

**Linux:**
```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_MOUNT="/media/$USER/MINIOS"
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Substitua `MINIOS` pelo diretório de montagem exato verificado com `lsblk`. Não utilize curingas: o script identifica o disco de destino a partir de sua própria localização e grava o código de boot nesse disco.

## Persistência automática de alterações

No primeiro boot, o MiniOS verificará o tipo de sistema de arquivos do drive e tentará usar o modo de persistência de alterações mais adequado:

- **ext2/3/4, Btrfs**: tenta usar o modo `native` (salvamento direto)
- **FAT32/NTFS**: usa o modo `dynfilefs` (arquivo dinâmico)
- Quando o modo nativo não está disponível, alterna automaticamente para dynfilefs

### Configuração de parâmetros para usuários avançados

Quando é necessária uma configuração de persistência precisa, parâmetros de boot podem ser utilizados:

- `perchmode=native` - Salvamento direto na partição (para ext4)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Tamanho do espaço de armazenamento de dados em MB

Mais detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
