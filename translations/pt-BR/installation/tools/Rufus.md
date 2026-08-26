---
updated: 2026-08-26
---

# Usando o Rufus (Windows)

Rufus é uma ferramenta popular para Windows que auxilia na formatação e criação de pendrives USB inicializáveis.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md) para requisitos detalhados do sistema e tamanhos de drives.

## Instalando o Rufus

1. **Baixe o Rufus** no [site oficial](https://rufus.ie/)
2. **Execute o programa** - O Rufus não precisa de instalação, é um aplicativo portátil

## Criando Pendrive USB Inicializável

O Rufus oferece dois métodos para gravar o MiniOS em um pendrive USB:

### Método 1: Modo DD (Recomendado)

1. **Abra o Rufus** como administrador
2. **Selecione o pendrive USB** no campo "Dispositivo"
3. **Selecione o arquivo ISO do MiniOS**:
   - Clique no botão "SELECIONAR"
   - Localize e selecione o arquivo ISO do MiniOS baixado
4. **Escolha o modo de gravação**:
   - Na janela "Imagem ISO híbrida detectada", selecione **"Gravar no modo de imagem DD"**
5. **Inicie o processo**: Clique no botão "INICIAR"
6. **Confirme a ação** - todos os dados do drive serão apagados
7. **Aguarde a conclusão** do processo de gravação

### Método 2: Modo ISO (Alternativo)

1. **Abra o Rufus** como administrador
2. **Selecione o pendrive** no campo "Dispositivo"
3. **Selecione o arquivo ISO do MiniOS**:
   - Clique no botão "SELECIONAR"
   - Localize e selecione o arquivo ISO do MiniOS baixado
4. **Escolha o modo de gravação**:
   - Na janela "Imagem ISO híbrida detectada", selecione **"Gravar no modo Imagem ISO"**
5. **Configure as opções**:
   - **Sistema de arquivos**: FAT32 (recomendado) ou NTFS
   - **Ao escolher NTFS**: a inicialização em modo EFI pode não estar disponível
6. **Inicie o processo**: Clique no botão "INICIAR"
7. **Confirme a formatação** – todos os dados do drive serão apagados

## Resultado e persistência

O modo DD realiza uma gravação bruta da imagem e copia o layout do ISO para todo o dispositivo de destino. O modo ISO formata um sistema de arquivos e extrai o conteúdo do ISO para criar uma mídia live baseada em arquivos. Nenhum dos modos é uma implantação do instalador do MiniOS, e o Rufus não cria automaticamente uma partição ext4 ou uma sessão de persistência.

A persistência só é ativada quando uma entrada de boot ou uma linha de comando do kernel solicita, e ainda assim requer um armazenamento gravável adequado. Veja [Modos de Boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de depender das alterações salvas.
