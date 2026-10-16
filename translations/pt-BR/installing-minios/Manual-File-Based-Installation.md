---
updated: 2026-08-31
---

# Instalação manual baseada em arquivos

Este método de instalação MiniOS copia os arquivos do sistema para um sistema de arquivos comum e instala o bootloader nele, em vez de gravar a ISO bloco a bloco.
O espaço restante no sistema de arquivos fica disponível para arquivos comuns, permitindo que o dispositivo continue sendo usado como um pendrive normal e também como dispositivo de inicialização MiniOS.

Este método é especialmente útil quando você precisa acessar diretamente os arquivos MiniOS, armazenar dados normalmente na mesma partição ou usar um layout gravável para sessões persistentes. Ele usa o bootloader SYSLINUX e foi projetado para Windows e Linux.

## Importante

**Aviso:** Este procedimento reparticiona e formata o dispositivo selecionado. Ele apaga todo o dispositivo, não apenas os arquivos que estão visíveis nele. Faça backup dos dados importantes e confira o caminho exato do dispositivo, o modelo, a capacidade, a partição e o ponto de montagem antes de executar `fdisk`, `mkfs` ou `bootinst`. Desconecte outras unidades removíveis, se possível.

## Requisitos da unidade

### Tamanho da unidade

Consulte o [guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility) para ver os requisitos detalhados do sistema e os tamanhos das unidades.

### Requisitos técnicos

- **Sistemas de arquivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partição**: MBR
- **Inicialização EFI**: Ao usar os sistemas de arquivos NTFS, exFAT ou ext2/3/4, talvez não seja possível inicializar no modo EFI. Para ter suporte a EFI, recomendamos o FAT32.

## Criar uma unidade USB inicializável

### Etapa 1: preparar a unidade

**Windows:**
1. Abra o "Gerenciamento de Disco" (`Win+R`, depois `diskmgmt.msc`)
2. Confira o dispositivo USB pelo número do disco, modelo e capacidade. Não continue se tiver dúvidas sobre algum desses dados.
3. Clique com o botão direito do mouse no volume e selecione "Excluir Volume"
4. Clique com o botão direito do mouse no espaço não alocado e selecione "Novo Volume Simples"
5. Escolha o sistema de arquivos: FAT32 (recomendado) ou NTFS

**Linux:**

Defina `TARGET_DISK` e `TARGET_PARTITION` somente com os caminhos exatos, após conferir o modelo e a capacidade do dispositivo em `lsblk`. O comando `fdisk` grava por cima da tabela de partições de todo o disco de destino. Execute apenas um comando `mkfs` para o sistema de arquivos desejado.

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

### Etapa 2: extrair e copiar arquivos

**Montar a ISO:**

*Windows:*
- Clique com o botão direito do mouse no arquivo ISO e selecione "Montar"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copiar arquivos:**
1. **Localize a pasta `/minios/`** na ISO montada
2. **Copie toda a pasta `/minios/`** para a raiz da unidade USB

No Linux, a raiz de destino no exemplo acima é `/mnt/minios-target`. Confirme que `findmnt --mountpoint /mnt/minios-target` informa a partição exata selecionada na Etapa 1 antes de copiar os arquivos.

### Etapa 3: instalar o carregador de inicialização

Acesse a pasta `/minios/boot/syslinux/` na unidade e execute o instalador:

`bootinst` grava o código de inicialização no disco determinado pelo local do instalador. Leia [Solução de problemas](/maintenance-and-recovery/Troubleshooting) antes de alterar o código de inicialização e não execute o instalador até verificar o dispositivo e o ponto de montagem.

**Windows:**
- Abra a unidade USB verificada usando a letra exata da unidade, acesse `minios\boot\syslinux` e execute `bootinst.bat` **como administrador**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Não substitua o ponto de montagem por um curinga. O script determina o disco de destino com base no próprio local e grava o código de inicialização nesse disco.

## Resultado e persistência

Este procedimento cria uma instalação live baseada em arquivos, colocando a árvore `minios/` e o carregador de inicialização em um sistema de arquivos comum. Não se trata de uma gravação ISO bruta, de uma configuração de multiboot com arquivo ISO nem de uma implantação do Instalador do MiniOS.

O sistema de arquivos escolhido afeta quais backends de persistência podem funcionar, mas não habilita a persistência nem garante que uma sessão será criada. A persistência só é habilitada quando uma entrada de inicialização ou a linha de comando do kernel a solicita, e a ativação ainda requer armazenamento gravável adequado. Consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Persistência do initrd](/reference/boot-process/Persistence-Internals) antes de confiar que as alterações serão salvas.
