---
updated: 2026-08-26
---

# dd

`dd` é uma ferramenta de linha de comando versátil para cópia bit a bit de dados entre arquivos e dispositivos. É mais comumente utilizada para gravar imagens ISO em drives USB, criar backups e realizar recuperação de dados.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira cuidadosamente o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/getting-started/Hardware-Compatibility) para requisitos detalhados de sistema e tamanhos de drive.

## Preparação

1. Identifique seu drive USB:
   - **Linux:** `lsblk` ou `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Desmonte o drive:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Criando um Pendrive USB Bootável

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Substitua:**
- `MiniOS.iso` - caminho para o seu arquivo ISO
- `/dev/sdX` - seu drive USB (ex.: `/dev/sdb`)

## Resultado e persistência

`dd` realiza uma gravação bruta da imagem: ele copia o layout ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência e não executa uma implantação do Instalador do MiniOS.

A persistência só é habilitada quando uma entrada de boot ou linha de comando do kernel solicita, e ainda assim requer armazenamento gravável adequado. Consulte [Modos de Boot](/using-minios/Boot-Modes) e [Persistência no Initrd](/reference/boot-process/Persistence-Internals) antes de confiar em alterações salvas.
