---
updated: 2026-08-26
---

# Usando o UNetbootin

UNetbootin é uma ferramenta open source multiplataforma que permite criar pendrives bootáveis para várias distribuições Linux, incluindo o MiniOS.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md) para requisitos detalhados de sistema e tamanhos de drives.

## Instalando o UNetbootin

1. **Baixe o UNetbootin** no [site oficial](https://unetbootin.github.io/)
2. **Instale o programa** no seu sistema:
   - **Windows**: Execute o instalador como administrador
   - **Linux**: Instale pelo repositório ou utilize o AppImage
   - **macOS**: Arraste o aplicativo para a pasta Aplicativos

## Criando um Pendrive Bootável

1. **Abra o UNetbootin** como administrador/root
2. **Selecione a origem da imagem:**
   - Defina a opção para "Imagem de disco"
   - Clique no botão "..." e selecione o arquivo ISO do MiniOS
3. **Selecione o dispositivo de destino:**
   - Na lista "Drive", selecione seu pendrive
   - Certifique-se de que o dispositivo correto está selecionado
4. **Inicie o processo:** Clique em "OK"
5. **Aguarde a conclusão** – o processo pode levar de 10 a 20 minutos

## Resultado e persistência

O UNetbootin extrai arquivos e instala arquivos de boot no sistema de arquivos selecionado, criando uma mídia live baseada em arquivos em vez de realizar uma gravação de imagem bruta ou uma implantação do Instalador do MiniOS. Seu uso não garante formatação FAT32, suporte a EFI ou persistência.

A persistência só é ativada quando uma entrada de boot ou linha de comando do kernel solicita, e ainda assim requer um armazenamento gravável adequado. Consulte [Modos de boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de depender de alterações salvas.
