# Método de Instalação Original (Windows/Linux)

O método original de instalação do MiniOS envolve copiar os arquivos do sistema diretamente para a unidade e instalar o bootloader. Esse método oferece máxima flexibilidade de configuração e compatibilidade com diversos tipos de mídia.

⚠️ **Nota**: Este método funciona apenas no Windows e Linux devido ao uso do bootloader SYSLINUX.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira cuidadosamente a unidade selecionada e faça backup dos dados importantes.

## Requisitos da Unidade

### Tamanho da Unidade

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de unidade.

### Requisitos Técnicos

- **Sistemas de arquivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partição**: MBR
- ⚠️ **Inicialização EFI**: Ao usar sistemas de arquivos NTFS, exFAT ou ext2/3/4, a inicialização em modo EFI pode não estar disponível. Para suporte EFI, recomenda-se o uso de FAT32.

## Criando Unidade USB Inicializável

### Passo 1: Preparar a Unidade

**Windows:**
1. Abra o "Gerenciamento de Disco" (`Win+R` → `diskmgmt.msc`)
2. Localize o pen drive USB → clique com o botão direito → "Excluir Volume"
3. Clique com o botão direito no espaço não alocado → "Novo Volume Simples"
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

### Passo 2: Extrair e Copiar Arquivos

**Montando o ISO:**

*Windows:*
- Clique com o botão direito no arquivo ISO → "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copiando Arquivos:**
1. **Encontre a pasta `/minios/`** no ISO montado
2. **Copie toda a pasta `/minios/`** para a raiz do pen drive USB

### Passo 3: Instalar o Bootloader

Acesse a pasta `/minios/boot/` na unidade e execute o instalador:

**Windows:**
- Execute `bootinst.bat` **como administrador**

**Linux:**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Persistência Automática de Alterações

No primeiro boot, o MiniOS verificará o tipo de sistema de arquivos da unidade e tentará usar o modo de persistência de alterações mais adequado:

- **ext2/3/4, Btrfs**: tenta usar o modo `native` (salvamento direto)
- **FAT32/NTFS**: utiliza o modo `dynfilefs` (arquivo dinâmico)
- Quando o modo nativo não está disponível, alterna automaticamente para dynfilefs

### Configuração de Parâmetros (para Usuários Avançados)

Quando for necessária uma configuração precisa de persistência, é possível utilizar parâmetros de boot:

- `perchmode=native` - Salvamento direto na partição (para ext4)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo  
- `perchsize=8000` - Espaço de armazenamento de dados em MB

Mais detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
