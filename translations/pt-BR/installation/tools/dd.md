---
updated: 2026-08-26
---

# Usando o comando `dd`

O `dd` é uma ferramenta de linha de comando versátil para copiar dados bit a bit entre arquivos e dispositivos. É mais comumente utilizado para gravar imagens ISO em pendrives USB, criar backups e recuperar dados.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md) para obter requisitos detalhados do sistema e tamanhos de drives.

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

## Resultado e persistência

`dd` realiza uma gravação de imagem bruta: ele copia o layout do ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência e não executa uma implantação do MiniOS Installer.

A persistência só é ativada quando uma entrada de boot ou linha de comando do kernel solicita, e ainda requer um armazenamento gravável adequado. Consulte [Modos de boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de confiar em alterações salvas.
