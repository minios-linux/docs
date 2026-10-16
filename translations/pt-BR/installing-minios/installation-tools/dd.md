---
updated: 2026-08-26
---

# dd

`dd` é um utilitário versátil de linha de comando para copiar dados bit a bit entre arquivos e dispositivos. É usado principalmente para gravar imagens ISO em unidades USB, criar backups e recuperar dados.

## Importante

**Aviso:** A seleção incorreta do dispositivo resultará em perda de dados! Sempre confira novamente a unidade selecionada e faça backup dos dados importantes.

## Requisitos da unidade

### Tamanho da unidade

Consulte [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility) para ver os requisitos detalhados do sistema e os tamanhos das unidades.

## Preparação

1. Identifique sua unidade USB:
   - **Linux:** `lsblk` ou `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Desmonte a unidade:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Criar uma unidade USB inicializável

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Substitua:**
- `MiniOS.iso` - o caminho do arquivo ISO
- `/dev/sdX` - sua unidade USB (por exemplo, `/dev/sdb`)

## Resultado e persistência

`dd` faz uma gravação bruta da imagem: copia o layout ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência nem realiza a implantação do Instalador do MiniOS.

A persistência só é ativada quando uma entrada de inicialização ou a linha de comando do kernel a solicita, e ainda exige armazenamento gravável adequado. Consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Persistência do Initrd](/reference/boot-process/Persistence-Internals) antes de confiar que as alterações serão salvas.
