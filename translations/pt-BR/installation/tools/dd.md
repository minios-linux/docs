# Usando o comando `dd`

O `dd` é uma ferramenta de linha de comando versátil para copiar dados bit a bit entre arquivos e dispositivos. É mais comumente utilizado para gravar imagens ISO em pendrives USB, criar backups e recuperar dados.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira cuidadosamente o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de drives.

## Preparação

1. Identifique seu pendrive USB:
   - **Linux:** `lsblk` ou `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Desmonte o drive:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Criando Pendrive USB Bootável

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Substitua:**
- `MiniOS.iso` - caminho para seu arquivo ISO
- `/dev/sdX` - seu pendrive USB (ex.: `/dev/sdb`)

## Persistência Automática de Alterações

No primeiro boot, o MiniOS verificará o tipo de sistema de arquivos do drive e selecionará o modo de persistência de alterações mais adequado. Se houver espaço livre disponível, o sistema criará automaticamente uma partição ext4 para máximo desempenho.

### Configuração de Parâmetros (para usuários avançados)

Para configuração precisa da persistência, podem ser usados parâmetros de boot:

- `perchmode=native` - Salvamento direto na partição (padrão, mais rápido)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Espaço de armazenamento para dados em MB para arquivos de imagem

Mais detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
