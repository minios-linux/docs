---
updated: 2026-08-31
---

# Instalação manual baseada em arquivos

Este método de instalação MiniOS copia os arquivos do sistema para um sistema de arquivos normal e instala o bootloader lá, em vez de gravar o ISO bloco a bloco.
O espaço restante no sistema de arquivos permanece disponível para arquivos comuns, permitindo que o dispositivo continue sendo usado como um pendrive normal, além de um dispositivo de boot MiniOS.

Este método é especialmente útil quando você deseja acesso direto aos arquivos MiniOS, armazenamento de dados normal na mesma partição ou um layout gravável para sessões persistentes. Ele utiliza o bootloader SYSLINUX e é indicado para Windows e Linux.

## Importante

**Atenção:** Este procedimento reparticiona e formata o dispositivo selecionado. Ele é destrutivo para todo o dispositivo, não apenas para os arquivos atualmente visíveis. Faça backup dos dados importantes e verifique o caminho exato do dispositivo, modelo, capacidade, partição e ponto de montagem antes de executar `fdisk`, `mkfs` ou `bootinst`. Desconecte outros dispositivos removíveis sempre que possível.

## Requisitos da unidade

### Tamanho da unidade

Consulte o [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility) para requisitos detalhados de sistema e tamanhos de unidade.

### Requisitos técnicos

- **Sistemas de arquivos**: FAT32, NTFS, ext2/3/4, Btrfs
- **Esquema de partição**: MBR
- **Boot EFI**: Ao usar sistemas de arquivos NTFS, exFAT ou ext2/3/4, o boot em modo EFI pode não estar disponível. Para suporte a EFI, recomenda-se FAT32.

## Criando um pendrive USB bootável

### Etapa 1: Prepare a unidade

**Windows:**
1. Abra o "Gerenciamento de Disco" (`Win+R`, depois `diskmgmt.msc`)
2. Verifique o dispositivo USB pelo número do disco, modelo e capacidade. Não continue se houver qualquer dúvida.
3. Clique com o botão direito no volume e selecione "Excluir Volume"
4. Clique com o botão direito no espaço não alocado e selecione "Novo Volume Simples"
5. Escolha o sistema de arquivos: FAT32 (recomendado) ou NTFS

**Linux:**

Defina `TARGET_DISK` e `TARGET_PARTITION` para os caminhos exatos somente após conferir o modelo e a capacidade do dispositivo em `lsblk`. O comando `fdisk` sobrescreve a tabela de partições em todo o disco de destino. Execute apenas um comando `mkfs` para o sistema de arquivos desejado.

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

### Etapa 2: Extraia e copie os arquivos

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

No Linux, a raiz de destino no exemplo acima é `/mnt/minios-target`. Confirme que `findmnt --mountpoint /mnt/minios-target` mostra exatamente a partição selecionada na Etapa 1 antes de copiar os arquivos.

### Etapa 3: Instale o bootloader

Acesse a pasta `/minios/boot/syslinux/` na unidade e execute o instalador:

`bootinst` grava o código de boot no disco a partir da localização do instalador. Leia a seção [Solução de problemas](/maintenance-and-recovery/Troubleshooting) antes de alterar o código de boot e não execute o instalador até que o dispositivo e o ponto de montagem estejam verificados.

**Windows:**
- Abra o pendrive USB verificado pela letra exata da unidade, navegue até `minios\boot\syslinux` e execute `bootinst.bat` **como administrador**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Não utilize curingas para o ponto de montagem. O script identifica o disco de destino a partir da sua própria localização e grava o código de boot nesse disco.

## Resultado e persistência

Este procedimento cria uma instalação live baseada em arquivos ao colocar a árvore `minios/` e o bootloader em um sistema de arquivos normal. Não se trata de uma gravação ISO bruta, de um multiboot com arquivo ISO, nem de uma implantação pelo Instalador do MiniOS.

O sistema de arquivos escolhido afeta quais backends de persistência podem funcionar, mas não habilita a persistência nem garante que uma sessão será criada. A persistência só é ativada quando uma entrada de boot ou parâmetro do kernel a solicita, e a ativação ainda requer armazenamento gravável adequado. Veja [Modos de boot](/using-minios/Boot-Modes) e [Persistência no Initrd](/reference/boot-process/Persistence-Internals) antes de depender de alterações salvas.
